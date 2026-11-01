---
title: Koin for Compose
---

# Koin for Compose

このページでは、Compose 向けパッケージ、Compose アプリで Koin を開始する 2 つの方法、および Composable 内で依存関係を取得するための `koinInject()` について説明します。これは Jetpack Compose (Android) と Compose Multiplatform の両方で同様に動作します。事前に[定義 (definitions)](/docs/reference/koin-core/definitions) と[モジュール (modules)](/docs/reference/koin-core/modules) の宣言方法を理解しておく必要があります。

## パッケージ {id="packages"}

| パッケージ | 内容 | プラットフォーム |
|---------|----------|-----------|
| `io.insert-koin:koin-compose` | `KoinApplication`、`koinInject`、スコープおよびモジュール API | Multiplatform |
| `io.insert-koin:koin-compose-viewmodel` | `koinViewModel`、`koinActivityViewModel` (Android) | Multiplatform |
| `io.insert-koin:koin-compose-viewmodel-navigation` | `sharedKoinViewModel`、`KoinNavigationScope`、`navigationScope` | Multiplatform |
| `io.insert-koin:koin-compose-navigation3` | Navigation 3 のエントリー | Multiplatform |
| `io.insert-koin:koin-androidx-compose` | `koin-compose` + `koin-compose-viewmodel`、および `KoinActivityScope`、`KoinFragmentScope` | Android |
| `io.insert-koin:koin-androidx-compose-navigation` | 非推奨の `koinNavViewModel` のみ | Android |

すべての Compose API はマルチプラットフォーム向けパッケージに含まれています。`koin-androidx-compose` は Android プロジェクト向けの便利なアーティファクトです：

```kotlin
// Android アプリ
dependencies {
    implementation("io.insert-koin:koin-androidx-compose:$koin_version")
}

// Compose Multiplatform (commonMain 内)
commonMain.dependencies {
    implementation("io.insert-koin:koin-compose:$koin_version")
    implementation("io.insert-koin:koin-compose-viewmodel:$koin_version")
}
```

BOM およびバージョンカタログについては、[Gradle のセットアップ](/docs/setup/gradle)を参照してください。

## Koin の開始 {id="starting-koin"}

2 つのオプションがあります。アプリごとにいずれか 1 つを選択してください。

### Compose の外部で開始する {id="start-outside-compose"}

各プラットフォームが起動する場所で Koin を開始します。Android では `Application` クラス、KMP プロジェクトでは共有の `initKoin()` 関数です（[KMP のセットアップ](/docs/reference/koin-core/kmp-setup)を参照）。これにより、Compose は追加のセットアップなしで実行中の Koin インスタンスを使用できます：

```kotlin
class MainApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        startKoin {
            androidContext(this@MainApplication)
            modules(appModule)
        }
    }
}

@Composable
fun App() {
    val repository = koinInject<UserRepository>()
}
```

Compose の外部のコード（`Service`、`WorkManager` の Worker、iOS の Swift コードなど）でも Koin を必要とする場合は、Composable なしで実行されるため、このオプションを使用してください。

### KoinApplication を使用して Composable から開始する {id="start-from-a-composable-with-koinapplication"}

`KoinApplication` はルートの Composable から Koin を開始し、すべての子コンポーネントに提供します：

**コンパイラプラグイン DSL**
```kotlin
import org.koin.compose.KoinApplication
import org.koin.dsl.koinConfiguration

@Composable
fun App() {
    KoinApplication(
        configuration = koinConfiguration { modules(appModule) }
    ) {
        MainScreen()
    }
}
```

**アノテーション**
```kotlin
// di/Koin.kt
import org.koin.core.annotation.KoinApplication

@KoinApplication
object KoinApp
```

アノテーションと Composable の名前はどちらも `KoinApplication` であるため、別々のファイルに保持してください。

```kotlin
// App.kt
import org.koin.compose.KoinApplication
import org.koin.plugin.module.dsl.koinConfiguration

@Composable
fun App() {
    KoinApplication(configuration = koinConfiguration<KoinApp>()) {
        MainScreen()
    }
}
```

`koinConfiguration<KoinApp>()` は `@KoinApplication` クラスのモジュールを読み込みます。オプションを追加するにはラムダを渡します: `koinConfiguration<KoinApp> { printLogger() }`。

**コンストラクタ / クラシック DSL**
```kotlin
import org.koin.compose.KoinApplication
import org.koin.dsl.koinConfiguration

@Composable
fun App() {
    KoinApplication(
        configuration = koinConfiguration { modules(appModule) }
    ) {
        MainScreen()
    }
}
```

`KoinApplication` が自動的に行う処理：

- **プラットフォームのセットアップ**: Android ではアプリケーションコンテキストで `androidContext()` を呼び出し、`androidLogger()` をセットアップします。その他のプラットフォームでは `printLogger()` をセットアップします。ログレベルは `logLevel` パラメータ（デフォルトは `Level.INFO`）で変更できます。
- **既存のインスタンス**: Koin がすでに開始されている場合、`KoinApplication` は実行中のインスタンスにアタッチし、自身の設定を無視します。
- **ライフサイクル**: `KoinApplication` が composition を離れても Koin は停止しないため、Android の構成変更 (Configuration changes) や Activity の再生成後も存続します。composition が破棄（abandon）された場合にのみ停止します。

`koinConfiguration { }` は再利用可能な [KoinConfiguration](/docs/reference/koin-core/starting-koin) を構築するため、`KoinApplication`、`startKoin`、およびテスト間で同じ設定を共有できます。

### 非推奨のエントリーポイント {id="deprecated-entry-points"}

| API | ステータス | 代わりに使用するもの |
|-----|--------|-------------|
| `KoinApplication(application = { ... })` | 非推奨 (Deprecated) | `KoinApplication(configuration = koinConfiguration { ... })` |
| `KoinMultiplatformApplication(config)` | 非推奨 (Deprecated) | `KoinApplication(configuration)` |
| `KoinContext { }` | 非推奨、不要 | なし。Compose は `startKoin` で開始されたインスタンスを自動的に検出します |
| `KoinAndroidContext { }` | 非推奨、不要 | なし |

## koinInject によるインジェクション {id="injecting-with-koininject"}

`koinInject()` は、現在の Koin スコープ（[Compose スコープ](/docs/reference/koin-compose/compose-scopes)がアクティブでない限り、ルートスコープ）から依存関係を解決します：

```kotlin
import org.koin.compose.koinInject

@Composable
fun UserScreen() {
    val repository = koinInject<UserRepository>()
}
```

デフォルトパラメータとして宣言することもできます。これにより、Composable は引き続き Koin と連携しつつ、テストやプレビューでは独自のインスタンスを渡すことができます：

```kotlin
@Composable
fun UserScreen(repository: UserRepository = koinInject()) {
    // ...
}
```

`koinInject()` は、修飾子 (qualifier)、スコープ、およびパラメータをキーとして、解決処理を `remember` でラップします。同じキーを使用した再コンポジション (recomposition) では、再解決することなく同じオブジェクトが返されます。

### 修飾子 (Qualifier) とスコープ {id="qualifier-and-scope"}

```kotlin
@Composable
fun SyncScreen() {
    val localDb = koinInject<Database>(qualifier = named("local"))
    val cache = koinInject<SessionCache>(scope = sessionScope)
}
```

名前付き定義の宣言については、[修飾子 (Qualifiers)](/docs/reference/koin-core/qualifiers) を参照してください。

### パラメータ {id="parameters"}

[注入パラメータ (injected parameters)](/docs/reference/koin-core/injection-parameters) は、ラムダまたは `ParametersHolder` を使用して渡します：

```kotlin
@Composable
fun UserDetail(userId: String) {
    // ラムダ形式
    val presenter = koinInject<UserPresenter> { parametersOf(userId) }

    // holder 形式
    val presenter2 = koinInject<UserPresenter>(parametersHolder = parametersOf(userId))
}
```

ラムダ形式では、Koin は値を比較するために再コンポジションごとにラムダを呼び出します。holder 形式はそのステップをスキップするため、Koin のソースコードではパフォーマンス向上のために推奨されています。パラメータは値によって比較されます。`userId` が変更されると、`koinInject()` は新しいインスタンスを解決します。

## Koin への直接アクセス {id="accessing-koin-directly"}

| 関数 | 戻り値 |
|----------|---------|
| `getKoin()` | 現在の composition の `Koin` インスタンス |
| `currentKoinScope()` | `koinInject()` がデフォルトで使用するスコープ |

どちらも `org.koin.compose` の Composable 関数です。UI コードでは `koinInject()` を優先してください。

## プレビュー {id="previews"}

Compose のプレビューでは `Application` クラスは実行されません。プレビューに独自の Koin インスタンスを提供するには、`KoinApplicationPreview` を使用します。[Compose のテスト](/docs/reference/koin-compose/compose-testing)を参照してください。

## API サマリー {id="api-summary"}

| API | 目的 | ページ |
|-----|---------|------|
| `KoinApplication(configuration) { }` | Compose から Koin を開始 | このページ |
| `koinInject<T>()` | 任意の依存関係を解決 | このページ |
| `koinViewModel<T>()` | ViewModel を解決 | [Compose における ViewModel](/docs/reference/koin-compose/compose-viewmodel) |
| `KoinScope`, `KoinNavigationScope` | Composable またはディスティネーションにバインドされたスコープ | [Compose におけるスコープ](/docs/reference/koin-compose/compose-scopes) |
| `rememberKoinModules { }` | Composable とともにモジュールをロード | [動的モジュール](/docs/reference/koin-compose/compose-modules) |
| `KoinIsolatedContext` | 隔離された Koin インスタンスを使用 | [分離されたコンテキスト](/docs/reference/koin-compose/isolated-context) |
| `navigation<T> { }`, `koinEntryProvider()` | Navigation 3 のエントリー | [Navigation 3](/docs/reference/koin-compose/navigation3) |

## 関連情報 {id="related"}

- [Compose における ViewModel](/docs/reference/koin-compose/compose-viewmodel): `koinViewModel()` およびナビゲーションスコープの ViewModel。
- [ライフサイクルと状態](/docs/reference/koin-compose/compose-lifecycle): インジェクトされたオブジェクトの再コンポジションをまたぐ挙動。
- [KMP のセットアップ](/docs/reference/koin-core/kmp-setup): Compose Multiplatform プロジェクトでの Koin の開始。
- [Android での開始](/docs/reference/koin-android/start): `androidContext()` と Android の `Application` クラス。
- [Compose のテスト](/docs/reference/koin-compose/compose-testing): プレビューと UI テスト。