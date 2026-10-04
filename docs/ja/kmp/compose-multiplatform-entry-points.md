[//]: # (title: ネイティブアプリケーションのエントリーポイント)

Compose Multiplatform の UI は完全に共通コードで実装できますが、実際のアプリケーションはネイティブのエントリーポイントから開始されます。
これらのエントリーポイントで、アプリのプラットフォーム固有の動作を変更できます。

例えば、[KMP IDE ウィザードによって生成された基本プロジェクト](quickstart.md)では、UI のベースは共通コードにある `App()` 関数です。
この関数が各プラットフォームで呼び出されます。

* Android では、アクティビティによって呼び出しが管理されます。
* iOS では、ビューコントローラーによって管理されます。
* デスクトップでは、ウィンドウによって管理されます。
* Web では、コンテナによって管理されます。

> これらの例では、`App()` 関数はパラメータを取りません。
> より大規模なアプリケーションでは、通常、プラットフォーム固有の依存関係にパラメータを渡します。
> これらの依存関係は、手動で提供することも、依存性注入（DI）ライブラリを使用して渡すこともできます。
>
{style="tip"}

## Android {id="on-android"}

Android では、`MainActivity` と呼ばれる [Android アクティビティ](https://developer.android.com/guide/components/activities/intro-activities)内の `setContent()` ラムダから呼び出しが行われます。

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)

        setContent {
            // 共通の App() コンポーザブルを呼び出す
            App()
        }
    }
}
```

Compose Multiplatform はすべての Jetpack Compose API へのアクセスを提供しますが、[その一部は Android アプリでのみ利用可能](compose-android-only-components.md)です。

## iOS {id="on-ios"}

iOS では、Android のアクティビティと同じ役割を果たす [ビューコントローラー](https://developer.apple.com/documentation/uikit/view_controllers) 内で共通の `App()` コンポーザブルが呼び出されます。

```kotlin
fun MainViewController() = ComposeUIViewController { App() }
```

iOS のビューコントローラーと Android のアクティビティはどちらも、単に共通コードから `App()` コンポーザブルを呼び出しているだけです。

Compose Multiplatform と iOS UI フレームワークの統合の詳細については、[SwiftUI フレームワークとの統合](compose-swiftui-integration.md)および [UIKit フレームワークとの統合](compose-uikit-integration.md)を参照してください。

## デスクトップ {id="on-desktop"}

デスクトップでは、Compose Multiplatform は JVM アプリにビルドされます。
共通の `App()` コンポーザブルの呼び出しは `main()` 関数内で行われ、`application()`（または `singleWindowApplication()`）の呼び出しでラップされます。

```kotlin
fun main() = application {
    Window(
        onCloseRequest = ::exitApplication,
        title = "ComposeDemo"
    ) {
        App()
    }
}
```

通常、`application()` 関数の内部で `Window` を作成し、そのプロパティを指定して、ウィンドウが閉じられたときの動作を `onCloseRequest` コールバックで定義します。
デフォルトのプロジェクトでは、アプリケーション全体が終了します（`::exitApplication`）。

Android や iOS と同様に、`App()` コンポーザブルが UI レイアウト全体を担当します。

詳細については、[デスクトップ固有の Compose Multiplatform コンポーネント](compose-desktop-components.md)および [Swing との相互運用性](compose-desktop-swing-interoperability.md)を参照してください。

## Web {id="on-web"}

デフォルトプロジェクトで `webApp` モジュールにコードが配置されている Web アプリケーションは、`main.kt` ファイルの `main()` 関数から共通の `App()` コンポーザブルを呼び出します。

```kotlin
// Web API は実験的であり、オプトインが必要です
@OptIn(ExperimentalComposeUiApi::class)
fun main() {
    // Web アプリ用の Compose 環境をセットアップ
    ComposeViewport {
        // UI レイアウトを生成
        App()
    }
}
```

Web のエントリーポイントの詳細については、[ビューポートのセットアップ](compose-css-styles.md)を参照してください。

## サポートを受ける {id="get-help"}

* **Kotlin Slack**: KMP や Compose Multiplatform に関するサポートを受けたり、ディスカッションに参加したりできます。[招待をリクエスト](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)して、[#multiplatform](https://kotlinlang.slack.com/archives/C3PQML5NU) および [#compose](https://kotlinlang.slack.com/archives/CJLTWPH7S) チャンネルに参加してください。
* **Kotlin 課題トラッカー**: [新しい課題を報告する](https://youtrack.jetbrains.com/newIssue?project=KT)。