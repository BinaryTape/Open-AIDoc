[//]: # (title: ディープリンク)

ディープリンク（Deep linking）は、オペレーティングシステムがカスタムリンクを処理し、対応するアプリ内の特定のデスティネーションにユーザーを誘導するためのナビゲーションメカニズムです。

ディープリンクは、アプリリンク（Androidでの呼称）やユニバーサルリンク（iOSでの呼称）をより一般化したものです。これらは、アプリと特定のウェブアドレスとの検証済みの接続です。これらについて詳しく知るには、[Android App Links](https://developer.android.com/training/app-links) および [iOS universal links](https://developer.apple.com/documentation/xcode/allowing-apps-and-websites-to-link-to-your-content/) のドキュメントを参照してください。

ディープリンクは、例えば OAuth 認証の場合など、アプリ外からの入力を取得する際にも役立ちます。ディープリンクを解析することで、必ずしもユーザーを視覚的にナビゲートすることなく OAuth トークンを取得できます。

> 外部からの入力は悪意がある可能性があるため、生のディープリンク URI を処理する際のリスクを適切に軽減するために、必ず[セキュリティガイドライン](https://developer.android.com/privacy-and-security/risks/unsafe-use-of-deeplinks)に従ってください。
> 
{style="warning"}

Compose Multiplatform でディープリンクを実装するには：

1. [アプリ構成でディープリンクスキーマを登録する](#operating-system-でディープリンクスキーマを登録する)
2. [ナビゲーショングラフのデスティネーションに特定のディープリンクを割り当てる](#デスティネーションにディープリンクを割り当てる)
3. [アプリが受信したディープリンクを処理する](#受信したディープリンクを処理する)

## セットアップ

Compose Multiplatform でディープリンクを使用するには、以下のように依存関係をセットアップします。

Gradle カタログに以下のバージョン、ライブラリ、およびプラグインを記述します：

```toml
[versions]
compose-multiplatform = "%org.jetbrains.compose%"
agp = "8.9.0"

# ディープリンクをサポートするマルチプラットフォーム Navigation ライブラリのバージョン
androidx-navigation = "%org.jetbrains.androidx.navigation%"

# Compose Multiplatform 1.8.0 で使用するための最小 Kotlin バージョン
kotlin = "2.1.0"

# 型安全なルートの実装に必要なシリアライゼーションライブラリ
kotlinx-serialization = "1.7.3"

[libraries]
navigation-compose = { module = "org.jetbrains.androidx.navigation:navigation-compose", version.ref = "androidx-navigation" }
kotlinx-serialization-json = { module = "org.jetbrains.kotlinx:kotlinx-serialization-json", version.ref = "kotlinx-serialization" }

[plugins]
multiplatform = { id = "org.jetbrains.kotlin.multiplatform", version.ref = "kotlin" }
compose-compiler = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }
compose = { id = "org.jetbrains.compose", version.ref = "compose-multiplatform" }
kotlinx-serialization = { id = "org.jetbrains.kotlin.plugin.serialization", version.ref = "kotlin" }
android-application = { id = "com.android.application", version.ref = "agp" }
```

共有モジュールの `build.gradle.kts` に追加の依存関係を追加します：

```kotlin
plugins {
    // ...
    alias(libs.plugins.kotlinx.serialization)
}

// ...

kotlin {
    // ...
    sourceSets {
        commonMain.dependencies {
            // ...
            implementation(libs.androidx.navigation.compose)
            implementation(libs.kotlinx.serialization.json)
        }
    }
}
```

## Operating System でディープリンクスキーマを登録する

各オペレーティングシステムには、ディープリンクを処理する独自の方法があります。特定のターゲットのドキュメントを参照するのが最も確実です。

* Android アプリの場合、ディープリンクスキーマは `AndroidManifest.xml` ファイル内のインテントフィルタとして宣言されます。インテントフィルタを正しく設定する方法については、[Android ドキュメント](https://developer.android.com/training/app-links/deep-linking?hl=en#adding-filters)を参照してください。
* iOS および macOS アプリの場合、ディープリンクスキーマは `Info.plist` ファイルの [CFBundleURLTypes](https://developer.apple.com/documentation/bundleresources/information-property-list/cfbundleurltypes) キーで宣言されます。

    > Compose Multiplatform は、macOS アプリの `Info.plist` に値を追加するための [Gradle DSL を提供しています](compose-native-distribution.md#information-property-list-on-macos)。iOS の場合は、KMP プロジェクトでファイルを直接編集するか、[Xcode GUI を使用してスキーマを登録](https://developer.apple.com/documentation/xcode/defining-a-custom-url-scheme-for-your-app#Register-your-URL-scheme)できます。
    >
    {style="note"}
* Windows アプリの場合、ディープリンクスキーマは、[Windows レジストリに必要な情報のキーを追加する](https://learn.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/platform-apis/aa767914(v=vs.85))（Windows 8 以前の場合）か、[パッケージマニフェストで拡張機能を指定する](https://learn.microsoft.com/en-us/windows/apps/develop/launch/handle-uri-activation)（Windows 10 および 11 の場合）ことで宣言できます。これは、インストールスクリプトや [Hydraulic Conveyor](https://conveyor.hydraulic.dev/) のようなサードパーティの配布パッケージ生成ツールを使用して行えます。Compose Multiplatform は、プロジェクト内でのこの構成をサポートしていません。
    
    > [Windows によって予約されているスキーマ](https://learn.microsoft.com/en-us/windows/apps/develop/launch/reserved-uri-scheme-names#reserved-uri-scheme-names)を使用していないことを確認してください。
    >
    {style="tip"}
* Linux の場合、ディープリンクスキーマは、配布物に含まれる `.desktop` ファイルに登録できます。

## デスティネーションにディープリンクを割り当てる

ナビゲーショングラフの一部として宣言されたデスティネーションには、オプションの `deepLinks` パラメータがあり、対応する `NavDeepLink` オブジェクトのリストを保持できます。各 `NavDeepLink` は、デスティネーションに一致すべき URI パターンを記述します。同じ画面に繋がる複数の URI パターンを定義できます。

1つのルートに対して定義できるディープリンクの数に制限はありません。

### 一般的なディープリンクの URI パターン

一般的な URI パターンは、URI 全体と一致する必要があります。プレースホルダーを使用してパラメータを指定し、デスティネーション内の受信 URI からそれらを抽出できます。

一般的な URI パターンのルール：

* スキーマのない URI は、`http://` または `https://` で始まると見なされます。したがって、`uriPattern = "example.com"` は `http://example.com` と `https://example.com` の両方に一致します。
* `{placeholder}` は1文字以上の文字に一致します（`example.com/name={name}` は `https://example.com/name=Bob` に一致します）。0文字以上の文字に一致させるには、`.*` ワイルドカードを使用します（`example.com/name={.*}` は `https://example.com/name=` および `name` の任意の値に一致します）。
* パスプレースホルダーのパラメータは必須ですが、クエリプレースホルダーの一致はオプションです。例えば、パターン `example.com/users/{id}?arg1={arg1}&arg2={arg2}` の場合：
    * パスの必須部分（`id`）が欠けているため、`http://www.example.com/users?arg1=one&arg2=two` には一致しません。
    * `http://www.example.com/users/4?arg2=two` と `http://www.example.com/users/4?arg1=one` の両方に一致します。
    * 余分なクエリパラメータは一致に影響しないため、`http://www.example.com/users/4?other=random` にも一致します。
* 複数のコンポーザブルが受信 URI に一致する `navDeepLink` を持っている場合、その動作は不定です。ディープリンクパターンが重複しないように注意してください。複数のコンポーザブルで同じディープリンクパターンを処理する必要がある場合は、パスやクエリパラメータを追加するか、中間デスティネーションを使用してユーザーを予測通りにルーティングすることを検討してください。

### ルート型に対して生成された URI パターン

URI パターンを完全に手書きするのを避けることができます。Navigation ライブラリは、ルートのパラメータに基づいて URI パターンを自動的に生成できます。

このアプローチを使用するには、以下のようにディープリンクを定義します：

```kotlin
composable<PlantDetail>(
    deepLinks = listOf(
        navDeepLink<PlantDetail>(basePath = "demo://example.com/plant")
    )
) { ... }
```

ここで `PlantDetail` はデスティネーションに使用しているルート型であり、`basePath` 内の "plant" は `PlantDetail` データクラスのシリアル名（serial name）です。

URI パターンの残りの部分は、以下のように生成されます：

* 必須パラメータはパスパラメータとして追加されます（例：`/{id}`）
* デフォルト値を持つパラメータ（オプションパラメータ）はクエリパラメータとして追加されます（例：`?name={name}`）
* コレクションはクエリパラメータとして追加されます（例：`?items={value1}&items={value2}`）
* パラメータの順序は、ルート定義内のフィールドの順序と一致します。

例えば、次のようなルート型の場合：

```kotlin
@Serializable data class PlantDetail(
  val id: String,
  val name: String,
  val colors: List<String>,
  val latinName: String? = null,
)
```

ライブラリによって以下の URI パターンが生成されます：

```none
<basePath>/{id}/{name}/?colors={color1}&colors={color2}&latinName={latinName}
```

### デスティネーションにディープリンクを追加する例

この例では、デスティネーションに複数のディープリンクを割り当て、受信した URI からパラメータ値を抽出します：

```kotlin
@Serializable @SerialName("dlscreen") data class DeepLinkScreen(val name: String)

// ...

val firstBasePath = "demo://example1.org"

NavHost(
    navController = navController,
    startDestination = FirstScreen
) {
    // ...
    
    composable<DeepLinkScreen>(
        deepLinks = listOf(
            // このコンポーザブルは demo://example1.org と demo://example2.org の両方のリンクを処理します
            navDeepLink { uriPattern = "$firstBasePath?name={name}" },
            navDeepLink { uriPattern = "demo://example2.org/name={name}" },
            // 生成されたパターンはパラメータのみを処理するため、
            // ルート型のシリアル名を追加します
            navDeepLink<DeepLinkScreen>(basePath = "$firstBasePath/dlscreen"),
        )
    ) {
        // アプリが URI `demo://example1.org/dlscreen/Jane/` を受信した場合、
        // 生成された URI パターンに一致し（name は必須パラメータでパスに含まれている）、
        // 自動的にルート型にマッピングできます
        val deeplink: DeepLinkScreen = backStackEntry.toRoute()
        val nameGenerated = deeplink.name
        
        // アプリが `demo://example1.com/?name=Jane` のような
        // 一般的なパターンにのみ一致する URI を受信した場合、
        // URI を直接解析する必要があります
        val nameGeneral = backStackEntry.arguments?.read { getStringOrNull("name") }
        
        // コンポーザブルのコンテンツ
    }
}
```

ウェブの場合、ディープリンクの動作は少し異なります。Compose Multiplatform for Web はシングルページアプリ（SPA）を作成するため、ディープリンク URI パターンのすべてのパラメータを URL フラグメント（`#` 文字の後ろ）に配置し、すべてのパラメータが URL エンコードされていることを確認する必要があります。

URL フラグメントが URI パターンのルールに準拠していれば、引き続き `backStackEntry.toRoute()` メソッドを使用してパラメータを解析できます。ウェブアプリでの URL へのアクセスと解析、およびブラウザでのナビゲーションの詳細については、[こちら](compose-navigation-routing.md#support-for-browser-navigation-in-web-apps)を参照してください。

```kotlin
composable<DeepLinkScreen>(
        deepLinks = listOf(
            // デフォルトの Compose Multiplatform セットアップでは、localhost:8080 は
            // wasmJsBrowserDevelopmentRun Gradle タスクで実行されるローカル開発エンドポイントです
            navDeepLink { uriPattern = "localhost:8080/#dlscreen%2F{name}" },
        )
    ) { ... }
```

> 他のシングルページウェブアプリと同様に、ウェブ上で URL フラグメントの使用を避けることも可能です。そのためには、適切なリクエストをアプリにリダイレクトするようにウェブサーバーを構成し、[ナビゲーションルートからブラウザアドレスへのデフォルトのマッピングを書き換える](compose-navigation-routing.md#full-url-customization)必要があります。
>
{style="tip"}

## 受信したディープリンクを処理する

Android では、アプリに送信されたディープリンク URI は、ディープリンクをトリガーした `Intent` の一部として利用可能です。プラットフォーム横断的な実装には、ディープリンクをリッスンするための共通の方法が必要です。

最小限の実装を作成してみましょう：

1. 共通コード（common code）に、外部 URI 用のリスナーを備えた、URI を保存およびキャッシュするためのシングルトンを宣言します。
2. 必要に応じて、オペレーティングシステムから受信した URI を送信するプラットフォーム固有の呼び出しを実装します。
3. メインのコンポーザブルで、新しいディープリンク用のリスナーをセットアップします。

### URI リスナーを持つシングルトンを宣言する

`commonMain` で、トップレベルにシングルトンオブジェクトを宣言します：

```kotlin
object ExternalUriHandler {
    // リスナーがセットアップされる前に URI が到着した場合のストレージ
    private var cached: String? = null
    
    var listener: ((uri: String) -> Unit)? = null
        set(value) {
            field = value
            if (value != null) {
                // リスナーがセットされ、`cached` が空でない場合、
                // 即座にキャッシュされた URI でリスナーを呼び出します
                cached?.let { value.invoke(it) }
                cached = null
            }
        }

    // 新しい URI が到着したときにキャッシュします。
    // すでにリスナーがセットされている場合は、それを呼び出し、すぐにキャッシュをクリアします。
    fun onNewUri(uri: String) {
        cached = uri
        listener?.let {
            it.invoke(uri)
            cached = null
        }
    }
}
```

### シングルトンへのプラットフォーム固有の呼び出しを実装する

デスクトップ JVM と iOS の両方で、システムから受信した URI を明示的に渡す必要があります。

`jvmMain/.../main.kt` で、必要な各オペレーティングシステムのコマンドライン引数を解析し、受信した URI をシングルトンに渡します：

```kotlin
// シングルトンをインポート
import org.company.app.ExternalUriHandler

fun main() {
    if(System.getProperty("os.name").indexOf("Mac") > -1) {
        Desktop.getDesktop().setOpenURIHandler { uri ->
            ExternalUriHandler.onNewUri(uri.uri.toString())
        }
    }
    else {
        ExternalUriHandler.onNewUri(args.getOrNull(0).toString())
    }

    application {
         // ...
    }
}
```

iOS の場合、Swift コードで着信 URI を処理する `application()` バリアントを追加します：

```swift
// シングルトンにアクセスするために KMP モジュールをインポート
import SharedUI

func application(
    _ application: UIApplication,
    open uri: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
) -> Bool {
    // フル URI をシングルトンに送信
    ExternalUriHandler.shared.onNewUri(uri: uri.absoluteString)    
        return true
    }
```

> Swift からシングルトンにアクセスするための命名規則については、[Kotlin/Native ドキュメント](https://kotlinlang.org/docs/native-objc-interop.html#kotlin-singletons)を参照してください。
> 
{style="tip"}

### リスナーをセットアップする

`DisposableEffect(Unit)` を使用して、リスナーをセットアップし、コンポーザブルがアクティブでなくなった後にクリーンアップできます。
例：

```kotlin
internal fun App(navController: NavHostController = rememberNavController()) = AppTheme {

    // `Unit` は変更されないため、エフェクトは一度だけ生成されます
    DisposableEffect(Unit) {
        // 一致する `navDeepLink` がリストされているコンポーザブルに対して
        // `NavController.navigate()` を呼び出すようにリスナーをセットアップします
        ExternalUriHandler.listener = { uri ->
            navController.navigate(NavUri(uri))
        }
        // コンポーザブルがアクティブでなくなったときにリスナーを削除します
        onDispose {
            ExternalUriHandler.listener = null
        }
    }

    // 本記事の前の例を再利用
    NavHost(
        navController = navController,
        startDestination = FirstScreen
    ) {
        // ...

        composable<DeepLinkScreen>(
            deepLinks = listOf(
                navDeepLink { uriPattern = "$firstBasePath?name={name}" },
                navDeepLink { uriPattern = "demo://example2.com/name={name}" },
            )
        ) {
            // コンポーザブルのコンテンツ
        }
    }
}
```

## 結果

これで、全ワークフローが完成しました：
ユーザーが `demo://` URI を開くと、オペレーティングシステムがそれを登録されたスキーマと照合します。その後：
  * ディープリンクを処理するアプリが閉じている場合、シングルトンが URI を受信してキャッシュします。メインのコンポーザブル関数が開始されると、シングルトンを呼び出し、キャッシュされた URI に一致するディープリンクにナビゲートします。
  * ディープリンクを処理するアプリが開いている場合、リスナーはすでにセットアップされているため、シングルトンが URI を受信すると、アプリは即座にそのリンクにナビゲートします。

## 次のステップ

Compose Multiplatform ナビゲーションライブラリの実際の動作を確認できるプロジェクトをチェックしてください：

* 基本的な例：[nav_cupcake プロジェクト](https://github.com/JetBrains/compose-multiplatform/tree/master/examples/nav_cupcake)。これは、Android の [Navigate between screens with Compose](https://developer.android.com/codelabs/basic-android-kotlin-compose-navigation#0) コードラボから変換されたものです。
* 高度な例：公式の [KotlinConf](https://github.com/JetBrains/kotlinconf-app) アプリケーション。