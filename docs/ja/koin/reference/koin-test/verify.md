---
title: Koin 設定の検証
---

Koin では設定モジュールを検証することができ、実行時に依存関係注入（dependency injection）の問題が発見されるのを防ぐことができます。

:::info 将来：コンパイル時の安全性
`verify()` と `checkModules()` API は、Koin Compiler Plugin による**ネイティブなコンパイル時の安全性**に置き換えられる予定です。これにより、ビルド時に設定全体が検証され、実行前にエラーをキャッチできるようになります。

詳細は [Koin Compiler Plugin](/docs/setup/compiler-plugin) を参照してください。
:::

## Verify API - JVM 限定 [3.3+]

Koin モジュールで `verify()` 拡張関数を使用します。内部的には、これはすべてのコンストラクタクラスを検証し、Koin 設定と照合して、その依存関係に対して宣言されたコンポーネントがあるかどうかを確認します。失敗した場合、この関数は `MissingKoinDefinitionException` をスローします。

```kotlin
val niaAppModule = module {
    includes(
        jankStatsKoinModule,
        dataKoinModule,
        syncWorkerKoinModule,
        topicKoinModule,
        authorKoinModule,
        interestsKoinModule,
        settingsKoinModule,
        bookMarksKoinModule,
        forYouKoinModule
    )
    viewModel<MainActivityViewModel>()
}
```

```kotlin
class NiaAppModuleCheck {

    @Test
    fun checkKoinModule() {
        // Koin 設定を検証する
        niaAppModule.verify()
    }
}
```

JUnit テストを実行すれば完了です！

`verify()` API は動作が非常に軽量で、設定に対して実行するためにモックやスタブの類を一切必要としません。

### 注入パラメータを使用した検証 [4.0+]

`parametersOf` を使用してオブジェクトを注入する設定がある場合、設定内にパラメータ型の定義がないため、検証は失敗します。
しかし、`definition<Type>(Class1::class, Class2::class ...)` を使用して、指定された定義で注入されるパラメータ型を定義できます。

```kotlin
class ModuleCheck {

    // 注入された定義を持つ定義がある場合
    val module = module {
        single { (a: Simple.ComponentA) -> Simple.ComponentB(a) }
    }

    @Test
    fun checkKoinModule() {

        // 注入パラメータ（Injected Parameters）を検証および宣言する
        module.verify(
            injections = injectedParameters(
                definition<Simple.ComponentB>(Simple.ComponentA::class)
            )
        )
    }
}
```

### 型のホワイトリスト登録 (Type White-Listing)

型を「ホワイトリスト」として追加できます。これは、その型がいかなる定義に対してもシステム内に存在するものとみなされることを意味します。

```kotlin
class NiaAppModuleCheck {

    @Test
    fun checkKoinModule() {

        // Koin 設定を検証する
        niaAppModule.verify(
            // 定義で使用されているが直接宣言されていない型（パラメータ注入など）をリストアップする
            extraTypes = listOf(MyType::class ...)
        )
    }
}
```

### 検証のためのアノテーションの使用

`koin-core-annotations` のアノテーションは、Koin が注入コントラクト（injection contracts）を推論し、設定を検証するのに役立ちます。複雑な DSL 設定を使用する代わりに、これらのアノテーションが要素の特定に役立ちます。

```kotlin
// "a" が注入パラメータであることを示す
class ComponentB(@InjectedParam val a: ComponentA)
// "a" が動的に提供されることを示す
class ComponentBProvided(@Provided val a: ComponentA)
```

これにより、カスタムの検証ロジックを記述することなく、テスト中や実行時の微妙な問題を防止できます。

---

## CheckModules API (非推奨)

:::warning
`checkModules()` API は Koin 4.0 以降、非推奨となりました。代わりに `verify()` を使用するか、コンパイル時の安全性のために Koin Compiler Plugin へ移行してください。
:::

`checkModules()` 関数はモジュールを起動し、可能な限りの各定義の実行を試みます。

```kotlin
class CheckModulesTest : KoinTest {

    @Test
    fun verifyKoinApp() {

        koinApplication {
            modules(module1, module2)
            checkModules()
        }
    }
}
```

または `checkKoinModules` を使用します：

```kotlin
class CheckModulesTest : KoinTest {

    @Test
    fun verifyKoinApp() {
        checkKoinModules(listOf(module1, module2))
    }
}
```

### CheckModule DSL

注入パラメータ、プロパティ、または動的インスタンスを使用する定義の場合：

* `withInstance(value)` - `value` インスタンスを Koin グラフに追加します。
* `withInstance<MyType>()` - `MyType` のモックインスタンスを追加します（`MockProviderRule` が必要です）。
* `withParameter<Type>(qualifier){ qualifier -> value }` - パラメータとして注入される `value` インスタンスを追加します。
* `withProperty(key, value)` - Koin にプロパティを追加します。

### JUnit ルールによるモック

`checkModules` でモックを使用するには、`MockProviderRule` を提供します。

```kotlin
@get:Rule
val mockProvider = MockProviderRule.create { clazz ->
    // 指定された clazz に対して、使用しているフレームワークでモックを作成します
    Mockito.mock(clazz.java)
}
```

### 動的な振る舞いを持つモジュールの検証

```kotlin
val myModule = module {
    factory { (id: String) -> FactoryPresenter(id) }
}
```

次のように検証します：

```kotlin
class CheckModulesTest : KoinTest {

    @Test
    fun verifyKoinApp() {

        koinApplication {
            modules(myModule)
            checkModules(){
                // 定義で使用される、Koin に追加する値
                withInstance("_my_id_value")
            }
        }
    }
}
```

### Android の例

```kotlin
class CheckModulesTest {

    @get:Rule
    val rule: TestRule = InstantTaskExecutorRule()

    @get:Rule
    val mockProvider = MockProviderRule.create { clazz ->
        Mockito.mock(clazz.java)
    }

    @Test
    fun `test DI modules`(){
        checkKoinModules(allModules) {
            withInstance<Context>()
            withInstance<Application>()
            withInstance<SavedStateHandle>()
            withInstance<WorkerParameters>()
        }
    }
}
```

### スコープリンクの提供

`withScopeLink` を使用してスコープをリンクします：

```kotlin
val myModule = module {
    scope(named("scope1")) {
        scoped { ComponentA() }
    }
    scope(named("scope2")) {
        scoped { ComponentB(get()) }
    }
}

@Test
fun `test DI modules`(){
    koinApplication {
        modules(myModule)
        checkModules(){
            withScopeLink(named("scope2"), named("scope1"))
        }
    }
}
```

---

## 移行パス

両方の検証 API は、Koin Compiler Plugin のコンパイル時安全性機能に置き換えられます。

| 現在 | 将来 |
|---------|--------|
| `module.verify()` | Compiler Plugin (自動) |
| `checkModules()` | Compiler Plugin (自動) |
| 実行時の検証 (Runtime verification) | コンパイル時の検証 (Compile-time verification) |
| 手動のテスト設定 | テストコードは不要 |

Compiler Plugin のコンパイル時安全性が利用可能になると、検証テストを記述することなく、ビルド時に依存関係の検証が行われるようになります。

セットアップ手順については [Compiler Plugin Setup](/docs/setup/compiler-plugin) を参照してください。