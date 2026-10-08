---
title: テストでのインジェクション
---

## KoinTest でテストを KoinComponent にする {id="making-your-test-a-koincomponent-with-kointest"}

*警告*: これは Android のインストゥルメンテッドテスト（Instrumented tests）には適用されません。Android でのインストゥルメンテッドテストについては、[Android Instrumented Testing](/docs/reference/koin-android/instrumented-testing) を参照してください。

クラスに `KoinTest` を付与することで、そのクラスは `KoinComponent` になり、以下の機能が利用可能になります：

* `by inject()` & `get()` - Koin からインスタンスを取得するための関数
* `verify()` - モジュール設定の検証を支援
* `declareMock` & `declare` - 現在のコンテキストでモックや新しい定義を宣言する

```kotlin
class ComponentA
class ComponentB(val a: ComponentA)

class MyTest : KoinTest {

    // プロパティを Lazy インジェクトする
    val componentB : ComponentB by inject()

    @Test
    fun `should inject my components`() {
        startKoin {
            modules(
                module {
                    single { ComponentA() }
                    single { ComponentB(get()) }
                })
        }

        // インスタンスを直接リクエストする
        val componentA = get<ComponentA>()

        assertNotNull(a)
        assertEquals(componentA, componentB.a)
    }
```

:::note
 アプリを部分的に構築するために、Koin モジュールの設定をオーバーロードすることをためらわないでください。
:::

## JUnit ルール {id="junit-rules"}

### テスト用の Koin コンテキストを作成する {id="create-a-koin-context-for-your-test"}

以下のルールを使用することで、各テストに対して Koin コンテキストを簡単に作成・保持できます：

```kotlin
@get:Rule
val koinTestRule = KoinTestRule.create {
    // ここに KoinApplication インスタンスを記述
    modules(myModule)
}
```

### モックプロバイダーの指定 {id="specify-your-mock-provider"}

`declareMock` API を使用するには、Koin にモックインスタンスの構築方法を伝えるルールを指定する必要があります。これにより、ニーズに合った適切なモッキングフレームワークを選択できます。

Mockito を使用してモックを作成する場合：

```kotlin
@get:Rule
val mockProvider = MockProviderRule.create { clazz ->
    // ここにモックの構築方法を記述
    Mockito.mock(clazz.java)
}
```

MockK を使用してモックを作成する場合：

```kotlin
@get:Rule
val mockProvider = MockProviderRule.create { clazz ->
    // ここにモックの構築方法を記述
    mockkClass(clazz)
}
```

!> koin-test プロジェクトは、現在 Mockito に依存していません。

## 標準機能でのモッキング {id="mocking-out-of-the-box"}

モックが必要になるたびに新しいモジュールを作成する代わりに、`declareMock` を使用してその場でモックを宣言できます：

```kotlin
class ComponentA
class ComponentB(val a: ComponentA)

class MyTest : KoinTest {

    @get:Rule
    val koinTestRule = KoinTestRule.create {
        modules(
            module {
                single { ComponentA() }
                single { ComponentB(get()) }
            })
    }

    @get:Rule
    val mockProvider = MockProviderRule.create { clazz ->
        Mockito.mock(clazz.java)
    }
    
    @Test
    fun `should inject my components`() {
    
    }
        // 現在の定義をモックに置き換える
        val mock = declareMock<ComponentA>()

        // モックを取得する（上記の変数と同じ）
        assertNotNull(get<ComponentA>())

        // モック化された ComponentA で構築される
        assertNotNull(get<ComponentB>())
    }
```

:::note
 `declareMock` では、`single` か `factory` か、またモジュールパスに配置するかどうかを指定できます。
:::

## コンポーネントの動的な宣言 {id="declaring-a-component-on-the-fly"}

モックでは不十分で、かつそのためのモジュールをわざわざ作成したくない場合は、`declare` を使用できます：

```kotlin
    @Test
    fun `successful declare an expression mock`() {
        startKoin { }

        declare {
            factory { ComponentA("Test Params") }
        }

        Assert.assertNotEquals(get<ComponentA>(), get<ComponentA>())
    }
```

## Koin モジュールのチェック {id="checking-your-koin-modules"}

Koin は、Koin モジュールが正しいかどうかをテストする方法を提供しています：`verify()` - 定義ツリーを走査し、各定義がバインドされているかチェックします。

```kotlin
@Test
fun checkKoinModules() {
    myModule.verify()
}
```

:::tip
`checkModules()` API は非推奨（Deprecated）になりました。Koin Compiler Plugin がコンパイル時の依存関係検証を提供するようになったため、`verify()` と `checkModules()` の両方が不要になります。詳細は [Compile-Time Safety](/docs/reference/koin-compiler/compile-safety) を参照してください。
:::

## テストでの Koin の開始と停止 {id="starting-stopping-koin-for-your-tests"}

テストごとに Koin インスタンスを停止する（テスト内で `startKoin` を使用する場合）ように注意してください。そうでない場合は、ローカルの Koin インスタンスには `koinApplication` を使用するか、現在のグローバルインスタンスを停止するために `stopKoin()` を使用してください。

## JUnit 5 でのテスト {id="testing-with-junit5"}
JUnit 5 のサポートでは、Koin コンテキストの開始と停止を処理する [Extensions](https://junit.org/junit5/docs/current/user-guide/#extensions) が提供されています。つまり、この extension を使用している場合は `AutoCloseKoinTest` を使用する必要はありません。

### 依存関係 {id="dependency"}
JUnit 5 でテストするには、`koin-test-junit5` の依存関係を使用する必要があります。

### テストの記述 {id="writing-tests"}
`KoinTestExtension` を登録し、モジュール設定を提供する必要があります。これが完了したら、テストでコンポーネントを取得（get）またはインジェクト（inject）できます。`@RegisterExtension` と併せて `@JvmField` を使用することを忘れないでください。

```kotlin
class ExtensionTests: KoinTest {

    private val componentB by inject<Simple.ComponentB>()

    @JvmField
    @RegisterExtension
    val koinTestExtension = KoinTestExtension.create {
        modules(
                module {
            single { Simple.ComponentA() }
            single { Simple.ComponentB(get()) }
        })
    }

    @Test
    fun contextIsCreatedForTheTest() {
        Assertions.assertNotNull(get<Simple.ComponentA>())
        Assertions.assertNotNull(componentB)
    }
}

```

### Mocking with JUnit5 {id="mocking-with-junit5"}
これは、`@RegisterExtension` を使用する必要がある点を除けば、JUnit 4 と同じように動作します。

```kotlin
class MockExtensionTests: KoinTest {

    val mock: Simple.UUIDComponent by inject()

    @JvmField
    @RegisterExtension
    val koinTestExtension = KoinTestExtension.create {
        modules(
                module {
                    single { Simple.UUIDComponent() }
                })
    }

    @JvmField
    @RegisterExtension
    val mockProvider = MockProviderExtension.create { clazz ->
        Mockito.mock(clazz.java)
    }

    @Test
    fun mockProviderTest() {
        val uuidValue = "UUID"
        declareMock<Simple.UUIDComponent> {
            BDDMockito.given(getUUID()).will { uuidValue }
        }

        Assertions.assertEquals(uuidValue, mock.getUUID())
    }
}
```

### 作成された Koin インスタンスの取得 {id="getting-the-created-koin-instances"}
作成された Koin コンテキストを関数のパラメータとして取得することもできます。これは、テスト関数に関数パラメータを追加することで実現できます。

```kotlin
class ExtensionTests: KoinTest {
    
    @RegisterExtension
    @JvmField
    val koinTestExtension = KoinTestExtension.create {
        modules(
                module {
                    single { Simple.ComponentA() }
                })
    }

    @Test
    fun contextIsCreatedForTheTest(koin: Koin) {
        // get<SimpleComponentA>() == koin.get<Simple.ComponentA>()
        Assertions.assertNotNull(koin.get<Simple.ComponentA>())
    }
}
```
