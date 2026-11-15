[//]: # (title: SwiftUI フレームワークとの統合)

<show-structure depth="3"/>

Compose Multiplatform は [SwiftUI](https://developer.apple.com/swiftui/) フレームワークと相互運用可能です。
SwiftUI アプリケーション内に Compose Multiplatform を埋め込むことも、Compose Multiplatform UI 内にネイティブの SwiftUI コンポーネントを埋め込むこともできます。このページでは、SwiftUI 内で Compose Multiplatform を使用する例と、Compose Multiplatform アプリ内に SwiftUI を埋め込む例の両方を紹介します。

> UIKit との相互運用性について詳しくは、[UIKit フレームワークとの統合](compose-uikit-integration.md)の記事を参照してください。
>
{style="tip"}

## SwiftUI アプリケーション内で Compose Multiplatform を使用する {id="use-compose-multiplatform-inside-a-swiftui-application"}

SwiftUI アプリケーション内で Compose Multiplatform を使用するには、UIKit の [`UIViewController`](https://developer.apple.com/documentation/uikit/uiviewcontroller/) を返し、Compose Multiplatform コードを含む Kotlin 関数 `MainViewController()` を作成します。

```kotlin
fun MainViewController(): UIViewController =
    ComposeUIViewController {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("This is Compose code", fontSize = 20.sp)
        }
    }
```

[`ComposeUIViewController()`](https://github.com/JetBrains/compose-multiplatform-core/blob/5b487914cc20df24187f9ddf54534dfec30f6752/compose/ui/ui/src/uikitMain/kotlin/androidx/compose/ui/window/ComposeWindow.uikit.kt) は、`content` 引数として composable 関数を受け取る Compose Multiplatform ライブラリ関数です。このように渡された関数は、`Text()` などの他の composable 関数を呼び出すことができます。

> Compose Multiplatform のレンダリングでは、高リフレッシュレートを明示的に有効にする必要があります。
> アプリの `Info.plist` ファイルに `CADisableMinimumFrameDurationOnPhone` キーを追加してください。
> これがない場合、アプリは実行時にクラッシュします。
>
{style="note"}

次に、SwiftUI 内で Compose Multiplatform を表す構造体（structure）が必要です。
`UIViewController` インスタンスを SwiftUI ビューに変換する次の構造体を作成します。

```swift
struct ComposeViewController: UIViewControllerRepresentable {
    func makeUIViewController(context: Context) -> UIViewController {
        return Main_iosKt.MainViewController()
    }

    func updateUIViewController(_ uiViewController: UIViewController, context: Context) {
    }
}
```

これで、他の SwiftUI コードで `ComposeViewController` 構造体を使用できるようになります。

`Main_iosKt.MainViewController` は自動生成された名前です。Swift から Kotlin コードにアクセスする方法について詳しくは、[Swift/Objective-C との相互運用性](https://kotlinlang.org/docs/native-objc-interop.html#top-level-functions-and-properties)のページを参照してください。

最終的に、アプリケーションは次のようになります。

![ComposeView](compose-view.png){width=300}

実装例については、[サンプルプロジェクト](https://github.com/JetBrains/compose-multiplatform/tree/master/examples/interop/ios-compose-in-swiftui)を参照してください。

### コンテンツに合わせて Compose ビューのサイズを設定する {id="size-compose-views-to-fit-their-content"}
<primary-label ref="EAP"/>

Compose ビューは、SwiftUI からのサイズ提案（sizing proposal）を使用してコンテンツを測定し、優先サイズ（preferred size）を報告できます。そのサイズが変更された場合、ホストしている `UIView` がその intrinsic content size を無効化するため、SwiftUI はレイアウトを再実行して更新されたサイズを適用できます。

`UIViewRepresentable` の例では、`main.ios.kt` に Kotlin 関数 `MainComposeView()` を定義します。

```kotlin
fun MainComposeView(): UIView = ComposeUIView {
    Text(
        "This Compose view wraps text to fit the available width",
        modifier = Modifier.fillMaxWidth().padding(16.dp)
    )
}
```

#### iOS 16 以降 {id="on-ios-16-and-later"}

Swift コードで、SwiftUI のサイズ提案を Compose ビューの `sizeThatFits()` メソッドに渡します。SwiftUI が未指定のままにしている寸法（dimension）には `UIView.noIntrinsicMetric` を使用します。

このセクションの `Text` のように、フィットさせたい寸法をラップする Compose コンテンツを使用します。[SwiftUI アプリケーション内で Compose Multiplatform を使用する](#use-compose-multiplatform-inside-a-swiftui-application)の例を適用する場合は、その `Box(Modifier.fillMaxSize())` をこのコンテンツに置き換えてください。

この `UIViewRepresentable` の例では、固定幅とコンテンツに応じた高さを使用しています。高さを固定する場合は、`.frame(height: 100)` を使用し、`Modifier.fillMaxWidth()` を削除します。

```swift
struct ComposeView: UIViewRepresentable {
    let makeComposeUIView: () -> UIView

    func makeUIView(context: Context) -> UIView {
        makeComposeUIView()
    }

    func updateUIView(_ uiView: UIView, context: Context) {}

    @available(iOS 16.0, *)
    func sizeThatFits(
        _ proposal: ProposedViewSize,
        uiView: UIView,
        context: Context
    ) -> CGSize? {
        uiView.sizeThatFits(
            CGSize(
                // noIntrinsicMetric は SwiftUI によって寸法が未指定であることを示します
                width: proposal.width ?? UIView.noIntrinsicMetric,
                height: proposal.height ?? UIView.noIntrinsicMetric
            )
        )
    }
}

struct ContentView: View {
    var body: some View {
        // Kotlin ファイルに対して生成されたブリッジ名を使用します
        // 例: main.ios.kt -> Main_iosKt
        ComposeView(makeComposeUIView: { Main_iosKt.MainComposeView() })
            .frame(width: 240)
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="func sizeThatFits(_ proposal: ProposedViewSize, uiView: UIView, context: Context)"}

##### ビューコントローラーにホストされたコンテンツのサイズ設定 {id="size-content-hosted-in-a-view-controller"}

[SwiftUI アプリケーション内で Compose Multiplatform を使用する](#use-compose-multiplatform-inside-a-swiftui-application)の `MainViewController()` Kotlin 関数は、`UIView` ではなく `UIViewController` を返します。
iOS 16 以降でそのコンテンツのサイズを設定するには、まず `main.ios.kt` の `MainViewController()` を更新して、高さに合わせてラップするコンテンツを使用するようにします。

```kotlin
fun MainViewController(): UIViewController = ComposeUIViewController {
    Text(
        "This Compose view wraps text to fit the available width",
        modifier = Modifier.fillMaxWidth().padding(16.dp)
    )
}
```

Swift コードで、コントローラーを SwiftUI に埋め込むために `UIViewControllerRepresentable` を使用している例の `ComposeViewController` ラッパーを更新します。
このラッパーに `sizeThatFits(_:uiViewController:context:)` を追加し、SwiftUI のサイズ提案をコントローラーの Compose ビューに転送します。

```swift
struct ComposeViewController: UIViewControllerRepresentable {
    func makeUIViewController(context: Context) -> UIViewController {
        // Kotlin ファイルに対して生成されたブリッジ名を使用します
        // 例: main.ios.kt -> Main_iosKt
        Main_iosKt.MainViewController()
    }

    func updateUIViewController(_ uiViewController: UIViewController, context: Context) {}

    @available(iOS 16.0, *)
    func sizeThatFits(
        _ proposal: ProposedViewSize,
        uiViewController: UIViewController,
        context: Context
    ) -> CGSize? {
        uiViewController.view.sizeThatFits(
            CGSize(
                // noIntrinsicMetric は SwiftUI によって寸法が未指定であることを示します
                width: proposal.width ?? UIView.noIntrinsicMetric,
                height: proposal.height ?? UIView.noIntrinsicMetric
            )
        )
    }
}

struct ContentView: View {
    var body: some View {
        ComposeViewController()
            .frame(width: 240)
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="func sizeThatFits(_ proposal: ProposedViewSize, uiViewController: UIViewController,"}

固定幅によってテキストが制約され、SwiftUI は報告された高さを使用してコンテンツをフィットさせます。

#### iOS 16 より前 {collapsible="true" id="before-ios-16"}

SwiftUI アプリを 16 より前の iOS バージョンで実行する必要がある場合は、`main.ios.kt` 内の `MainComposeView()` の intrinsic content size を報告します。

```kotlin
fun MainComposeView(): UIView = ComposeUIView(
    configure = {
        preferredSizeReportingStrategy = PreferredSizeReportingStrategy.IntrinsicContentSize
    }
) {
    Text(
        "This Compose view wraps text to fit the available width",
        modifier = Modifier.fillMaxWidth().padding(16.dp)
    )
}
```

この例では固定幅を使用し、Compose コンテンツが高さを決定するようにしています。
Swift コードでは、`updateUIView()` 内の `sizeThatFits()` に幅を渡し、SwiftUI フレームにも同じ幅を使用します。
SwiftUI は `intrinsicContentSize` を通じて結果のサイズを読み取ります。

```swift
struct IntrinsicComposeView: UIViewRepresentable {
    let makeComposeUIView: () -> UIView
    let width: CGFloat

    func makeUIView(context: Context) -> UIView {
        makeComposeUIView()
    }

    func updateUIView(_ uiView: UIView, context: Context) {
        _ = uiView.sizeThatFits(
            // noIntrinsicMetric は SwiftUI によって寸法が未指定であることを示します
            CGSize(width: width, height: UIView.noIntrinsicMetric)
        )
    }
}

struct ContentView: View {
    private let width: CGFloat = 240

    var body: some View {
        // Kotlin ファイルに対して生成されたブリッジ名を使用します
        // 例: main.ios.kt -> Main_iosKt
        IntrinsicComposeView(
            makeComposeUIView: { Main_iosKt.MainComposeView() },
            width: width
        )
        .frame(width: width)
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="uiView.sizeThatFits(CGSize(width: width, height: UIView.noIntrinsicMetric)"}

高さを固定する場合は、サイズ提案と SwiftUI フレームで幅と高さを入れ替えます。

## Compose Multiplatform 内で SwiftUI を使用する {id="use-swiftui-inside-compose-multiplatform"}

Compose Multiplatform 内で SwiftUI を使用するには、中間となる [`UIViewController`](https://developer.apple.com/documentation/uikit/uiviewcontroller/) に Swift コードを追加します。
現在、SwiftUI の構造体を Kotlin で直接記述することはできません。代わりに、Swift で記述して Kotlin 関数に渡す必要があります。

まず、`ComposeUIViewController` コンポーネントを作成するエントリポイント関数に引数を追加します。

```kotlin
@OptIn(ExperimentalForeignApi::class)
fun ComposeEntryPointWithUIViewController(
    createUIViewController: () -> UIViewController
): UIViewController =
    ComposeUIViewController {
        Column(
            Modifier
                .fillMaxSize()
                .windowInsetsPadding(WindowInsets.systemBars),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text("How to use SwiftUI inside Compose Multiplatform")
            UIKitViewController(
                factory = createUIViewController,
                modifier = Modifier.size(300.dp).border(2.dp, Color.Blue),
            )
        }
    }
```

Swift コードで、エントリポイント関数に `createUIViewController` を渡します。
SwiftUI ビューをラップするには、`UIHostingController` インスタンスを使用できます。

```swift
Main_iosKt.ComposeEntryPointWithUIViewController(createUIViewController: { () -> UIViewController in
    let swiftUIView = VStack {
        Text("SwiftUI in Compose Multiplatform")
    }
    return UIHostingController(rootView: swiftUIView)
})
```

最終的に、アプリケーションは次のようになります。

![UIView](uiview.png){width=300}

この例のコードは、[サンプルプロジェクト](https://github.com/JetBrains/compose-multiplatform/tree/master/examples/interop/ios-swiftui-in-compose)で確認できます。

### マップビュー {id="map-view"}

SwiftUI の [`Map`](https://developer.apple.com/documentation/mapkit/map) コンポーネントを使用して、Compose Multiplatform にマップビューを実装できます。これにより、アプリケーションで完全にインタラクティブな SwiftUI マップを表示できます。

同じ [Kotlin エントリポイント関数](#use-swiftui-inside-compose-multiplatform)に対して、Swift で `UIHostingController` を使用して `Map` ビューをラップした `UIViewController` を渡します。

```swift
import SwiftUI
import MapKit

Main_iosKt.ComposeEntryPointWithUIViewController(createUIViewController: {
    let region = Binding.constant(
        MKCoordinateRegion(
            center: CLLocationCoordinate2D(latitude: 37.7749, longitude: -122.4194),
            span: MKCoordinateSpan(latitudeDelta: 0.05, longitudeDelta: 0.05)
        )
    )

    let mapView = Map(coordinateRegion: region)
    return UIHostingController(rootView: mapView)
})
```

次に、より高度な例を見てみましょう。このコードは SwiftUI マップにカスタムアノテーションを追加し、Swift からビューステートを更新できるようにします。

```swift
import SwiftUI
import MapKit

struct AnnotatedMapView: View {
    // マップ領域の状態を管理
    @State private var region = MKCoordinateRegion(
        center: CLLocationCoordinate2D(latitude: 51.5074, longitude: -0.1278),
        span: MKCoordinateSpan(latitudeDelta: 0.1, longitudeDelta: 0.1)
    )
    // カスタムアノテーション付きのマップを表示
    var body: some View {
        Map(coordinateRegion: $region, annotationItems: [Landmark.example]) { landmark in
            MapMarker(coordinate: landmark.coordinate, tint: .blue)
        }
    }
}

struct Landmark: Identifiable {
    let id = UUID()
    let name: String
    let coordinate: CLLocationCoordinate2D

    static let example = Landmark(
        name: "Big Ben",
        coordinate: CLLocationCoordinate2D(latitude: 51.5007, longitude: -0.1246)
    )
}
```

その後、このアノテーション付きマップを `UIHostingController` でラップし、Compose Multiplatform コードに渡すことができます。

```swift
Main_iosKt.ComposeEntryPointWithUIViewController(createUIViewController: {
    return UIHostingController(rootView: AnnotatedMapView())
})
```

`AnnotatedMapView` は以下の処理を行います。

* SwiftUI の `Map` ビューを定義し、それを `AnnotatedMapView` というカスタムビュー内に埋め込みます。
* `@State` と `MKCoordinateRegion` を使用してマップの位置情報の内部状態を管理し、Compose Multiplatform がインタラクティブで状態を認識するマップを表示できるようにします。
* SwiftUI のアノテーションに必要な `Identifiable` に準拠した静的な `Landmark` モデルを使用して、マップ上に `MapMarker` を表示します。
* `annotationItems` を使用して、マップ上にカスタムマーカーを宣言的に配置します。
* SwiftUI コンポーネントを `UIHostingController` 内にラップし、`UIViewController` として Compose Multiplatform に渡します。

### カメラビュー {id="camera-view"}

SwiftUI と UIKit の [`UIImagePickerController`](https://developer.apple.com/documentation/uikit/uiimagepickercontroller) を SwiftUI 互換コンポーネントにラップして使用することで、Compose Multiplatform にカメラビューを実装できます。これにより、アプリケーションからシステムカメラを起動し、写真を撮影できるようになります。

同じ [Kotlin エントリポイント関数](#use-swiftui-inside-compose-multiplatform)に対して、Swift で `UIImagePickerController` を使用した基本的な `CameraView` を定義し、`UIHostingController` を使用して埋め込みます。

```swift
Main_iosKt.ComposeEntryPointWithUIViewController(createUIViewController: {
    return UIHostingController(rootView: CameraView { image in
        // ここで撮影された画像を処理
    })
})
```

これを動作させるには、`CameraView` を次のように定義します。

```swift
import SwiftUI
import UIKit

struct CameraView: UIViewControllerRepresentable {
    let imageHandler: (UIImage) -> Void
    @Environment(\.presentationMode) private var presentationMode

    init(imageHandler: @escaping (UIImage) -> Void) {
        self.imageHandler = imageHandler
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }

    func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        picker.sourceType = .camera
        picker.delegate = context.coordinator
        return picker
    }

    func updateUIViewController(_ uiViewController: UIImagePickerController, context: Context) {}

    class Coordinator: NSObject, UINavigationControllerDelegate, UIImagePickerControllerDelegate {
        let parent: CameraView

        init(_ parent: CameraView) {
            self.parent = parent
        }

        func imagePickerController(_ picker: UIImagePickerController,
                                   didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey : Any]) {
            if let image = info[.originalImage] as? UIImage {
                parent.imageHandler(image)
            }
            parent.presentationMode.wrappedValue.dismiss()
        }

        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
            parent.presentationMode.wrappedValue.dismiss()
        }
    }
}
```

次に、より高度な例を見てみましょう。このコードはカメラビューを表示し、撮影した画像のサムネイルを同じ SwiftUI ビュー内に表示します。

```swift
import SwiftUI
import UIKit

struct CameraPreview: View {
    // カメラシートの表示/非表示を制御
    @State private var showCamera = false
    // 撮影された画像を保持
    @State private var capturedImage: UIImage?

    var body: some View {
        VStack {
            if let image = capturedImage {
                // 撮影された画像を表示
                Image(uiImage: image)
                    .resizable()
                    .scaledToFit()
                    .frame(height: 200)
            } else {
                // 画像が撮影されていない場合にプレースホルダーテキストを表示
                Text("No image captured")
            }

            // カメラを開くボタンを追加
            Button("Open Camera") {
                showCamera = true
            }
            // CameraView をモーダルシートとして表示
            .sheet(isPresented: $showCamera) {
                CameraView { image in
                    capturedImage = image
                }
            }
        }
    }
}
```

`CameraPreview` ビューは以下の処理を行います。

* ユーザーがボタンをタップしたときに、モーダルの `.sheet` で `CameraView` を表示します。
* `@State` プロパティラッパーを使用して、撮影した画像を保持および表示します。
* 写真をプレビューするために SwiftUI ネイティブの `Image` ビューを埋め込みます。
* 前述と同じ `UIViewControllerRepresentable` ベースの `CameraView` を再利用しつつ、SwiftUI の状態管理システムとより緊密に統合します。

> 実機でテストするには、アプリの `Info.plist` ファイルに `NSCameraUsageDescription` キーを追加する必要があります。
> これがない場合、アプリは実行時にクラッシュします。
>
{style="note"}

### Web ビュー {id="web-view"}

UIKit の [`WKWebView`](https://developer.apple.com/documentation/webkit/wkwebview) コンポーネントを `UIViewRepresentable` でラップし、SwiftUI を使用することで、Compose Multiplatform に Web ビューを実装できます。これにより、完全なネイティブレンダリングで埋め込み Web コンテンツを表示できます。

同じ [Kotlin エントリポイント関数](#use-swiftui-inside-compose-multiplatform)に対して、Swift で `UIHostingController` を使用して埋め込まれる基本的な `WebView` を定義します。

```swift
Main_iosKt.ComposeEntryPointWithUIViewController(createUIViewController: {
    let url = URL(string: "https://www.jetbrains.com")!
    return UIHostingController(rootView: WebView(url: url))
})
```

次に、より高度な例を見てみましょう。このコードは、Web ビューにナビゲーションの追跡と読み込み状態の表示を追加します。

```swift
import SwiftUI
import UIKit
import WebKit

struct AdvancedWebView: UIViewRepresentable {
    let url: URL
    @Binding var isLoading: Bool
    @Binding var currentURL: String

    // ナビゲーションデリゲートを設定した WKWebView を作成
    func makeUIView(context: Context) -> WKWebView {
        let webView = WKWebView()
        webView.navigationDelegate = context.coordinator
        webView.load(URLRequest(url: url))
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    // Web ナビゲーションイベントを処理するコーディネーターを作成 
    func makeCoordinator() -> Coordinator {
        Coordinator(isLoading: $isLoading, currentURL: $currentURL)
    }

    class Coordinator: NSObject, WKNavigationDelegate {
        @Binding var isLoading: Bool
        @Binding var currentURL: String

        init(isLoading: Binding<Bool>, currentURL: Binding<String>) {
            _isLoading = isLoading
            _currentURL = currentURL
        }

        func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation?) {
            isLoading = true
        }

        // URL を更新し、読み込み完了を示す
        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation?) {
            isLoading = false
            currentURL = webView.url?.absoluteString ?? ""
        }
    }
}
```

これを SwiftUI ビューで次のように使用します。

```swift
struct WebViewContainer: View {
    // Web ビューの読み込み状態を追跡
    @State private var isLoading = false
    // 表示中の現在の URL を追跡
    @State private var currentURL = ""

    var body: some View {
        VStack {
            // 読み込み中にインジケーターを表示
            if isLoading {
                ProgressView()
            }
            // 現在の URL を表示
            Text("URL: \(currentURL)")
                .font(.caption)
                .lineLimit(1)
                .truncationMode(.middle)

            // 高度な Web ビューを埋め込み
            AdvancedWebView(
                url: URL(string: "https://www.jetbrains.com")!,
                isLoading: $isLoading,
                currentURL: $currentURL
            )
        }
    }
}
```

`AdvancedWebView` と `WebViewContainer` は以下の処理を行います。

* 読み込みの進行状況と URL の変更を追跡するために、カスタムナビゲーションデリゲートを備えた `WKWebView` を作成します。
* SwiftUI の `@State` バインディングを使用して、ナビゲーションイベントに応じて UI を動的に更新します。
* ページの読み込み中に `ProgressView` スピナーを表示します。
* `Text` コンポーネントを使用して、ビューの上部に現在の URL を表示します。
* `UIHostingController` を使用して、このコンポーネントを Compose UI に統合します。

## 次のステップ {id="what-s-next"}

* Compose が画面コンテンツをレンダリングする間に、[システム描画の Liquid Glass 効果にネイティブ SwiftUI ナビゲーションを使用する方法](ios-liquid-glass.md)について学びます。
* Compose Multiplatform を [UIKit フレームワークと統合](compose-uikit-integration.md)する方法について確認します。