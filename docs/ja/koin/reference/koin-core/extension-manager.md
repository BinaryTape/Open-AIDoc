---
title: Extensionマネージャー
---

# Extensionマネージャー

Koinは、フレームワークに新機能を追加するためのエクステンションシステムを提供しています。これは、Koinを外部システムと統合したり、カスタム機能を追加したりする場合に便利です。

## KoinExtension

Koinエクステンションは、`KoinExtension`インターフェースを実装するクラスです。

```kotlin
interface KoinExtension {
    /**
     * エクステンションが登録されたときに呼び出されます
     */
    fun onRegister(koin: Koin)

    /**
     * Koinの終了時に呼び出されます
     */
    fun onClose()
}
```

### エクステンションの作成

```kotlin
class MyCustomExtension : KoinExtension {
    private lateinit var koin: Koin

    override fun onRegister(koin: Koin) {
        this.koin = koin
        // エクステンションの初期化
    }

    override fun onClose() {
        // リソースのクリーンアップ
    }

    fun doSomething() {
        // エクステンションのロジック
    }
}
```

### エクステンションの登録

エクステンションを登録するには、`ExtensionManager`を使用します。

```kotlin
fun KoinApplication.myExtension() {
    with(koin.extensionManager) {
        if (getExtensionOrNull<MyCustomExtension>(EXTENSION_ID) == null) {
            registerExtension(EXTENSION_ID, MyCustomExtension())
        }
    }
}

private const val EXTENSION_ID = "my-extension"
```

### エクステンションへのアクセス

```kotlin
val Koin.myExtension: MyCustomExtension
    get() = extensionManager.getExtension(EXTENSION_ID)

// 使用方法
val extension = getKoin().myExtension
extension.doSomething()
```

### Koinのセットアップでの使用

```kotlin
startKoin {
    myExtension()  // エクステンションの登録
    modules(appModule)
}
```

:::note
`ExtensionManager`は`@KoinInternalApi`としてマークされています。これは、バージョン間でAPIが変更される可能性があることを意味します。本番環境のコードでは注意して使用してください。
:::

## ResolutionExtension

より高度なユースケースのために、Koinは依存関係の解決（resolution）プロセスにフックするための`ResolutionExtension`を提供しています。これにより、外部ソースからインスタンスを提供できるようになります。

```kotlin
interface ResolutionExtension {
    /**
     * 識別用のエクステンション名
     */
    val name: String

    /**
     * 依存関係の解決中に呼び出されます
     * @param scope 現在の解決スコープ
     * @param instanceContext 型情報を含む解決コンテキスト
     * @return インスタンスが見つかった場合はそのインスタンス、それ以外はnull
     */
    fun resolve(scope: Scope, instanceContext: ResolutionContext): Any?
}
```

### ユースケース

- 外部DIコンテナとの統合
- キャッシュやプールからのインスタンス提供
- 実行時の条件に基づいた動的なインスタンス解決
- モックプロバイダーを使用したテスト

### 例：外部インスタンスプロバイダー

```kotlin
class ExternalInstanceProvider : ResolutionExtension {
    private val externalInstances = mutableMapOf<`KClass<*>`, Any>()

    override val name: String = "external-provider"

    override fun resolve(scope: Scope, instanceContext: ResolutionContext): Any? {
        return externalInstances[instanceContext.clazz]
    }

    fun <T : Any> registerInstance(clazz: KClass<T>, instance: T) {
        externalInstances[clazz] = instance
    }
}
```

### ResolutionExtensionの登録

```kotlin
val externalProvider = ExternalInstanceProvider()
externalProvider.registerInstance(MyService::class, MyServiceImpl())

startKoin {
    // resolution extensionの登録
    koin.addResolutionExtension(externalProvider)

    modules(module {
        // これにより、外部プロバイダーからMyServiceを解決できるようになります
        single<MyComponent>()  // MyComponentはMyServiceに依存
    })
}
```

:::warning Experimental API
`ResolutionExtension` APIは`@KoinExperimentalAPI`としてマークされています。このAPIは将来のバージョンで変更される可能性があります。
:::

### 完全な例

```kotlin
@OptIn(KoinExperimentalAPI::class)
fun resolutionExtensionExample() {
    val resolutionExtension = object : ResolutionExtension {
        val instanceMap = mapOf<`KClass<*>`, Any>(
            ComponentA::class to ComponentA()
        )

        override val name: String = "custom-resolver"

        override fun resolve(
            scope: Scope,
            instanceContext: ResolutionContext
        ): Any? {
            return instanceMap[instanceContext.clazz]
        }
    }

    val koin = koinApplication {
        printLogger(Level.DEBUG)
        koin.addResolutionExtension(resolutionExtension)
        modules(module {
            // ComponentBはComponentAに依存
            // ComponentAはエクステンションから解決される
            single { ComponentB(get()) }
        })
    }.koin

    val componentB = koin.get<ComponentB>()
    // componentB.a は resolutionExtension から提供されたインスタンス
}
```

## エクステンションの使用タイミング

| エクステンションの種類 | ユースケース |
|---------------|----------|
| `KoinExtension` | Koinへの機能追加（ロギング、モニタリング、カスタムスコープなど） |
| `ResolutionExtension` | 解決プロセス中に外部ソースからインスタンスを提供する場合 |

## ベストプラクティス

1. **控えめに使用する** - エクステンションは複雑さを増大させます。可能な限り標準のKoin定義を優先してください。
2. **エクステンションをドキュメント化する** - エクステンションが何を行うのか、どのように使用するのかを明確にしてください。
3. **クリーンアップを処理する** - リソース漏洩を避けるため、常に`onClose()`を実装してください。
4. **スレッドセーフを考慮する** - エクステンションは複数のスレッドから呼び出される可能性があります。

## 次のステップ

- **[スコープ (Scopes)](/docs/reference/koin-core/scopes)** - カスタムスコープ管理
- **[モジュール (Modules)](/docs/reference/koin-core/modules)** - モジュールの構成
- **[高度なパターン (Advanced Patterns)](/docs/reference/koin-core/advanced-patterns)** - より高度なパターン