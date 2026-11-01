---
title: Extension Manager
---

# Extension Manager

Koinには、ライブラリおよびフレームワークの開発者向けに2つの拡張ポイント（Extension points）が用意されています。`KoinExtension`はKoinコンテナに機能を追加し、登録時および終了時のフックを提供します。`ResolutionExtension`は、一致する定義が存在しない場合に、Koinへインスタンスの別の取得元を提供します。ほとんどのアプリケーションではどちらも必要ありません。まずは[定義（definitions）](/docs/reference/koin-core/definitions)を使用してください。

## KoinExtension {id="koinextension"}

`KoinExtension`は、IDを指定してコンテナに登録されるオブジェクトです。

```kotlin
interface KoinExtension {
    fun onRegister(koin: Koin)
    fun onClose()
}
```

Koinは、拡張機能が登録されたときに`onRegister`を呼び出し、コンテナが終了するとき（`stopKoin()`または`koinApplication.close()`）に`onClose`を呼び出します。

Koin自体もこのメカニズムを利用しています。[Lazyモジュール](/docs/reference/koin-core/lazy-modules)の基盤となっているコルーチンエンジンは、`KoinCoroutinesEngine`拡張機能です。

### 拡張機能の実装 {id="writing-an-extension"}

```kotlin
class AuditExtension : KoinExtension {
    private lateinit var koin: Koin

    override fun onRegister(koin: Koin) {
        this.koin = koin
    }

    override fun onClose() {
        // リソースを解放
    }

    fun record(event: String) { ... }
}
```

### 拡張機能の登録と取得 {id="registering-and-reading-it"}

拡張機能を登録するための関数を`KoinApplication`に追加し、それを取得するためのプロパティを`Koin`に公開します。

```kotlin
private const val AUDIT_EXTENSION = "audit"

fun KoinApplication.audit() {
    with(koin.extensionManager) {
        if (getExtensionOrNull<AuditExtension>(AUDIT_EXTENSION) == null) {
            registerExtension(AUDIT_EXTENSION, AuditExtension())
        }
    }
}

val Koin.audit: AuditExtension
    get() = extensionManager.getExtension(AUDIT_EXTENSION)
```

```kotlin
startKoin {
    audit()
    modules(appModule)
}

getKoin().audit.record("app_started")
```

| 関数 | 動作 |
|----------|----------|
| `registerExtension(id, extension)` | 拡張機能を保存し、`onRegister`を呼び出します。同じIDを持つ拡張機能は置き換えられます |
| `getExtension<T>(id)` | 拡張機能を返します。存在しない場合は「Koin extension 'id' not found.」というエラーで失敗します |
| `getExtensionOrNull<T>(id)` | 拡張機能を返します。存在しない場合は`null`を返します |

:::warning
`ExtensionManager`には`@KoinInternalApi`が付与されています。オプトインが必要であり、非推奨化（deprecation）プロセスを経ることなくバージョン間でAPIが変更される可能性があります。
:::

## ResolutionExtension {id="resolutionextension"}

`ResolutionExtension`は、カレントスコープ、スコープソース、およびルートスコープを含むリンクされたスコープの定義を検索した後に、他に一致するものがない場合にインスタンスの解決を要求されます。

```kotlin
interface ResolutionExtension {
    val name: String
    fun resolve(scope: Scope, instanceContext: ResolutionContext): Any?
}
```

`instanceContext.clazz`（修飾子を使用する場合は`instanceContext.qualifier`も含む）に対応するインスタンスを返すか、Koinに解決処理を継続させて`NoDefinitionFoundException`で失敗させるために`null`を返します。

Koinは、[Ktor DI bridge](/docs/reference/koin-ktor/ktor-bridge)においてKtorの依存関係注入からインスタンスを読み取るためにこれを使用しています。

### 例：別のコンテナからのインスタンス取得 {id="example-instances-from-another-container"}

```kotlin
class LegacyContainerResolution(
    private val legacy: Map<KClass<*>, Any>,
) : ResolutionExtension {

    override val name: String = "legacy-container"

    override fun resolve(scope: Scope, instanceContext: ResolutionContext): Any? =
        legacy[instanceContext.clazz]
}
```

アプリケーションの`koin`インスタンス上で`addResolutionExtension`を使用して登録します。

```kotlin
@OptIn(KoinExperimentalAPI::class)
fun startApp(legacy: Map<KClass<*>, Any>) {
    startKoin {
        koin.addResolutionExtension(LegacyContainerResolution(legacy))
        modules(appModule)
    }
}
```

これにより、レガシーマップにのみ存在する型を必要とする`appModule`内の定義が、拡張機能からそのインスタンスを取得できるようになります。

Compiler Pluginを使用している場合、拡張機能のみから提供される型はビルド時点では不明であるため、コンパイル時の安全性チェックで不足している依存関係として報告されます。これを外部から提供されるものとしてマークしてください。詳細は[コンパイル時の安全性（Compile-Time Safety）](/docs/reference/koin-compiler/compile-safety)を参照してください。

`addResolutionExtension`には`@KoinExperimentalAPI`が付与されています。

## 制限事項 {id="limits"}

- **内部および実験的API**：どちらの拡張ポイントも、Koinのバージョン間で変更される可能性があります。
- **解決用拡張機能のライフサイクルが存在しない**：Koinは`ResolutionExtension`が返したインスタンスをキャッシュしません。必要に応じて独自にキャッシュしてください。
- **解決順序の最後**：定義に一致するものがある場合、解決用拡張機能が呼び出されることはありません。既存の定義をオーバーライドすることはできません。
- **スレッドセーフティ**：`resolve`は複数のスレッドから同時に呼び出される可能性があります。

## 関連情報 {id="related"}

- [Lazyモジュール](/docs/reference/koin-core/lazy-modules)：コルーチンエンジン拡張機能に基づいて構築された機能。
- [Ktor DI Bridge](/docs/reference/koin-ktor/ktor-bridge)：解決用拡張機能の実践例。
- [コンパイル時の安全性](/docs/reference/koin-compiler/compile-safety)：Koinの外部から提供される依存関係の宣言。
- [Koinの起動](/docs/reference/koin-core/starting-koin)：拡張機能を登録するアプリケーションDSL。
- [スコープ](/docs/reference/koin-core/scopes)：スコープ内での解決順序。