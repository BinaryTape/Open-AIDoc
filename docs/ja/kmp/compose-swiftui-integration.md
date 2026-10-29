[//]: # (title: SwiftUIフレームワークとの統合)

<show-structure depth="3"/>

Compose Multiplatformは[SwiftUI](https://developer.apple.com/swiftui/)フレームワークと相互運用可能です。
SwiftUIアプリケーション内にCompose Multiplatformを埋め込むことも、Compose Multiplatform UI内にネイティブのSwiftUIコンポーネントを埋め込むこともできます。このページでは、SwiftUI内でCompose Multiplatformを使用する例と、Compose Multiplatformアプリ内でSwiftUIを埋め込む例の両方を紹介します。

> UIKitとの相互運用性については、[UIKitフレームワークとの統合](compose-uikit-integration.md)の記事を参照してください。
>
{style="tip"}

## SwiftUIアプリケーション内でCompose Multiplatformを使用する {id="use-compose-multiplatform-inside-a-swiftui-application"}

SwiftUIアプリケーション内でCompose Multiplatformを使用するには、UIKitの[`UIViewController`](https://developer.apple.com/documentation/uikit/uiviewcontroller/)を返し、Compose Multiplatformのコードを含むKotlin関数 `MainViewController()` を作成します。

```kotlin
fun MainViewController(): UIViewController =
    ComposeUIViewController {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("This is Compose code", fontSize = 20.sp)
        }
    }
```

[`ComposeUIViewController()`](https://github.com/JetBrains/compose-multiplatform-core/blob/5b487914cc20df24187f9ddf54534dfec30f6752/compose/ui/ui/src/uikitMain/kotlin/androidx/compose/ui/window/ComposeWindow.uikit.kt) は、composable関数を `content` 引数として受け取るCompose Multiplatformライブラリの関数です。この方法で渡された関数は、`Text()` などの他のcomposable関数を呼び出すことができます。

> Compose Multiplatformのレンダリングには、高リフレッシュレートを明示的に有効にする必要があります。アプリの `Info.plist` ファイルに `CADisableMinimumFrameDurationOnPhone` キーを追加してください。これがないと、実行時にアプリがクラッシュします。
>
{style="note"}

次に、SwiftUIでCompose Multiplatformを表現する構造体が必要です。`UIViewController` インスタンスをSwiftUIビューに変換する以下の構造体を作成します。

```swift
struct ComposeViewController: UIViewControllerRepresentable {
    func makeUIViewController(context: Context) -> UIViewController {
        return Main_iosKt.MainViewController()
    }

    func updateUIViewController(_ uiViewController: UIViewController, context: Context) {
    }
}
```

これで、他のSwiftUIコード内で `ComposeView` 構造体を使用できるようになります。

`Main_iosKt.MainViewController` は生成された名前です。SwiftからKotlinコードにアクセスする方法の詳細については、[Interoperability with Swift/Objective-C](https://kotlinlang.org/docs/native-objc-interop.html#top-level-functions-and-properties) ページを参照してください。

最終的に、アプリケーションは以下のようになります。

![ComposeView](compose-view.png){width=300}

この `ComposeView` は任意のSwiftUIビュー階層で使用でき、SwiftUIコード内からそのサイズを制御できます。

既存のアプリケーションにCompose Multiplatformを組み込みたい場合は、SwiftUIが使用されている場所ならどこでも `ComposeView` 構造体を使用してください。
例については、[サンプルプロジェクト](https://github.com/JetBrains/compose-multiplatform/tree/master/examples/interop/ios-compose-in-swiftui)を参照してください。

## Compose Multiplatform内でSwiftUIを使用する {id="use-swiftui-inside-compose-multiplatform"}

Compose Multiplatform内でSwiftUIを使用するには、中間の [`UIViewController`](https://developer.apple.com/documentation/uikit/uiviewcontroller/) にSwiftコードを追加します。
現在のところ、Kotlinで直接SwiftUIの構造体を記述することはできません。代わりに、Swiftで記述してKotlinの関数に渡す必要があります。

まず、`ComposeUIViewController` コンポーネントを作成するためのエントリポイント関数に引数を追加します。

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

Swiftコード側で、`createUIViewController` をエントリポイント関数に渡します。
SwiftUIビューをラップするために `UIHostingController` インスタンスを使用できます。

```swift
Main_iosKt.ComposeEntryPointWithUIViewController(createUIViewController: { () -> UIViewController in
    let swiftUIView = VStack {
        Text("SwiftUI in Compose Multiplatform")
    }
    return UIHostingController(rootView: swiftUIView)
})
```

最終的に、アプリケーションは以下のようになります。

![UIView](uiview.png){width=300}

この例のコードは [サンプルプロジェクト](https://github.com/JetBrains/compose-multiplatform/tree/master/examples/interop/ios-swiftui-in-compose) で確認できます。

### マップビュー（Map view） {id="map-view"}

SwiftUIの [`Map`](https://developer.apple.com/documentation/mapkit/map) コンポーネントを使用して、Compose Multiplatformにマップビューを実装できます。これにより、アプリケーションで完全にインタラクティブなSwiftUIマップを表示できます。

[Kotlinのエントリポイント関数](#use-swiftui-inside-compose-multiplatform)と同じものに対して、Swiftで `UIHostingController` を使用して `Map` ビューをラップした `UIViewController` を渡します。

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

次に、より高度な例を見てみましょう。このコードはSwiftUIマップにカスタムアノテーションを追加し、Swiftからビューの状態を更新できるようにします。

```swift
import SwiftUI
import MapKit

struct AnnotatedMapView: View {
    // マップのリージョン状態を管理
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

その後、このアノテーション付きマップを `UIHostingController` でラップし、Compose Multiplatformコードに渡します。

```swift
Main_iosKt.ComposeEntryPointWithUIViewController(createUIViewController: {
    return UIHostingController(rootView: AnnotatedMapView())
})
```

`AnnotatedMapView` は以下のタスクを実行します。

* SwiftUIの `Map` ビューを定義し、`AnnotatedMapView` というカスタムビュー内に埋め込みます。
* `@State` と `MKCoordinateRegion` を使用してマップ位置の内部状態を管理し、Compose Multiplatformがインタラクティブで状態を認識するマップを表示できるようにします。
* SwiftUIのアノテーションに必要な `Identifiable` に準拠した静的な `Landmark` モデルを使用して、マップ上に `MapMarker` を表示します。
* `annotationItems` を使用して、宣言的にカスタムマーカーをマップ上に配置します。
* SwiftUIコンポーネントを `UIHostingController` 内にラップし、それを `UIViewController` としてCompose Multiplatformに渡します。

### カメラビュー（Camera view） {id="camera-view"}

SwiftUIとUIKitの [`UIImagePickerController`](https://developer.apple.com/documentation/uikit/uiimagepickercontroller) を使用し、SwiftUI互換コンポーネントでラップすることで、Compose Multiplatformにカメラビューを実装できます。これにより、アプリケーションからシステムカメラを起動して写真を撮影できます。

[Kotlinのエントリポイント関数](#use-swiftui-inside-compose-multiplatform)と同じものに対して、Swiftで `UIImagePickerController` を使用した基本的な `CameraView` を定義し、`UIHostingController` を使って埋め込みます。

```swift
Main_iosKt.ComposeEntryPointWithUIViewController(createUIViewController: {
    return UIHostingController(rootView: CameraView { image in
        // ここで撮影した画像を処理
    })
})
```

これを動作させるために、`CameraView` を以下のように定義します。

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

次に、より高度な例を見てみましょう。このコードはカメラビューを表示し、同じSwiftUIビュー内に撮影した画像のサムネイルを表示します。

```swift
import SwiftUI
import UIKit

struct CameraPreview: View {
    // カメラシートの表示を制御
    @State private var showCamera = false
    // 撮影した画像を保存
    @State private var capturedImage: UIImage?

    var body: some View {
        VStack {
            if let image = capturedImage {
                // 撮影した画像を表示
                Image(uiImage: image)
                    .resizable()
                    .scaledToFit()
                    .frame(height: 200)
            } else {
                // 画像が撮影されていない時にプレースホルダーテキストを表示
                Text("No image captured")
            }

            // カメラを開くためのボタンを追加
            Button("Open Camera") {
                showCamera = true
            }
            // CameraViewをモーダルシートとして表示
            .sheet(isPresented: $showCamera) {
                CameraView { image in
                    capturedImage = image
                }
            }
        }
    }
}
```

`CameraPreview` ビューは以下のタスクを実行します。

* ユーザーがボタンをタップしたときに、モーダルな `.sheet` 内で `CameraView` を表示します。
* `@State` プロパティラッパーを使用して、撮影した画像を保存し表示します。
* SwiftUIネイティブの `Image` ビューを埋め込んで、写真をプレビューします。
* 以前と同じ `UIViewControllerRepresentable` ベースの `CameraView` を再利用しますが、それをSwiftUIの状態システムに深く統合します。

> 実機でテストするには、アプリの `Info.plist` ファイルに `NSCameraUsageDescription` キーを追加する必要があります。これがないと、実行時にアプリがクラッシュします。
>
{style="note"}

### ウェブビュー（Web view） {id="web-view"}

UIKitの [`WKWebView`](https://developer.apple.com/documentation/webkit/wkwebview) コンポーネントを `UIViewRepresentable` でラップすることで、Compose Multiplatformにウェブビューを実装できます。これにより、完全なネイティブレンダリングで埋め込みウェブコンテンツを表示できます。

[Kotlinのエントリポイント関数](#use-swiftui-inside-compose-multiplatform)と同じものに対して、Swiftで `UIHostingController` を使用して埋め込まれた基本的な `WebView` を定義します。

```swift
Main_iosKt.ComposeEntryPointWithUIViewController(createUIViewController: {
    let url = URL(string: "https://www.jetbrains.com")!
    return UIHostingController(rootView: WebView(url: url))
})
```

次に、より高度な例を見てみましょう。このコードはウェブビューにナビゲーションの追跡と読み込み状態の表示を追加します。

```swift
import SwiftUI
import UIKit
import WebKit

struct AdvancedWebView: UIViewRepresentable {
    let url: URL
    @Binding var isLoading: Bool
    @Binding var currentURL: String

    // ナビゲーションデリゲートを持つWKWebViewを作成
    func makeUIView(context: Context) -> WKWebView {
        let webView = WKWebView()
        webView.navigationDelegate = context.coordinator
        webView.load(URLRequest(url: url))
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    // ウェブナビゲーションイベントを処理するコーディネーターを作成
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

        // URLを更新し、読み込みが完了したことを示す
        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation?) {
            isLoading = false
            currentURL = webView.url?.absoluteString ?? ""
        }
    }
}
```

これをSwiftUIビューで以下のように使用します。

```swift
struct WebViewContainer: View {
    // ウェブビューの読み込み状態を追跡
    @State private var isLoading = false
    // 表示されている現在のURLを追跡
    @State private var currentURL = ""

    var body: some View {
        VStack {
            // 読み込み中にインジケーターを表示
            if isLoading {
                ProgressView()
            }
            // 現在のURLを表示
            Text("URL: \(currentURL)")
                .font(.caption)
                .lineLimit(1)
                .truncationMode(.middle)

            // 高度なウェブビューを埋め込み
            AdvancedWebView(
                url: URL(string: "https://www.jetbrains.com")!,
                isLoading: $isLoading,
                currentURL: $currentURL
            )
        }
    }
}
```

`AdvancedWebView` と `WebViewContainer` は以下のタスクを実行します。

* 読み込みの進行状況とURLの変更を追跡するために、カスタムナビゲーションデリゲートを持つ `WKWebView` を作成します。
* SwiftUIの `@State` バインディングを使用して、ナビゲーションイベントに応じてUIを動的に更新します。
* ページの読み込み中に `ProgressView` スピナーを表示します。
* `Text` コンポーネントを使用して、ビューの上部に現在のURLを表示します。
* `UIHostingController` を使用して、このコンポーネントをCompose UIに統合します。

## 次のステップ {id="what-s-next"}

* Composeが画面コンテンツをレンダリングする一方で、システムでレンダリングされるリキッドグラス（Liquid Glass）エフェクトのために[ネイティブのSwiftUIナビゲーション](ios-liquid-glass.md)を使用する方法を確認します。
* Compose Multiplatformを [UIKitフレームワークと統合](compose-uikit-integration.md) する方法についても確認できます。