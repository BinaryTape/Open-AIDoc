[//]: # (title: 與 SwiftUI 架構整合)

<show-structure depth="3"/>

Compose Multiplatform 可與 [SwiftUI](https://developer.apple.com/swiftui/) 架構交互操作。
你可以將 Compose Multiplatform 嵌入至 SwiftUI 應用程式中，也可以將原生 SwiftUI 組件嵌入至 Compose Multiplatform UI 中。本頁面提供了在 SwiftUI 中使用 Compose Multiplatform 以及在 Compose Multiplatform 應用程式中嵌入 SwiftUI 的範例。

> 若要了解 UIKit 的交互操作性，請參閱[與 UIKit 架構整合](compose-uikit-integration.md)一文。
>
{style="tip"}

## 在 SwiftUI 應用程式中使用 Compose Multiplatform {id="use-compose-multiplatform-inside-a-swiftui-application"}

若要在 SwiftUI 應用程式中使用 Compose Multiplatform，請建立一個 Kotlin 函式 `MainViewController()`，該函式會回傳來自 UIKit 的 [`UIViewController`](https://developer.apple.com/documentation/uikit/uiviewcontroller/) 並包含 Compose Multiplatform 程式碼：

```kotlin
fun MainViewController(): UIViewController =
    ComposeUIViewController {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("This is Compose code", fontSize = 20.sp)
        }
    }
```

[`ComposeUIViewController()`](https://github.com/JetBrains/compose-multiplatform-core/blob/5b487914cc20df24187f9ddf54534dfec30f6752/compose/ui/ui/src/uikitMain/kotlin/androidx/compose/ui/window/ComposeWindow.uikit.kt) 是一個 Compose Multiplatform 程式庫函式，接受一個可組合函式作為 `content` 引數。以此方式傳入的函式可以呼叫其他可組合函式，例如 `Text()`。

> Compose Multiplatform 算繪需要明確啟用高更新率：在應用程式的 `Info.plist` 檔案中新增 `CADisableMinimumFrameDurationOnPhone` 金鑰。若缺少此設定，應用程式將在執行期發生崩潰。
>
{style="note"}

接下來，你需要一個在 SwiftUI 中代表 Compose Multiplatform 的結構。建立以下結構，將 `UIViewController` 執行個體轉換為 SwiftUI 檢視：

```swift
struct ComposeViewController: UIViewControllerRepresentable {
    func makeUIViewController(context: Context) -> UIViewController {
        return Main_iosKt.MainViewController()
    }

    func updateUIViewController(_ uiViewController: UIViewController, context: Context) {
    }
}
```

現在你可以在其他 SwiftUI 程式碼中使用 `ComposeViewController` 結構。

`Main_iosKt.MainViewController` 是一個產生的名稱。你可以在[與 Swift/Objective-C 交互操作](https://kotlinlang.org/docs/native-objc-interop.html#top-level-functions-and-properties)頁面中進一步了解如何從 Swift 存取 Kotlin 程式碼。

最終，你的應用程式外觀應如下所示：

![ComposeView](compose-view.png){width=300}

如需範例，請參閱我們的[範例專案](https://github.com/JetBrains/compose-multiplatform/tree/master/examples/interop/ios-compose-in-swiftui)。

### 調整 Compose 檢視大小以符合其內容 {id="size-compose-views-to-fit-their-content"}
<primary-label ref="EAP"/>

Compose 檢視可以使用來自 SwiftUI 的尺寸建議（sizing proposal）來測量其內容，並回報其偏好大小。如果該大小發生變化，代管的 `UIView` 會使自身的內在內容大小（intrinsic content size）失效，以便 SwiftUI 重新執行版面配置並套用更新後的大小。

針對 `UIViewRepresentable` 範例，在 `main.ios.kt` 中定義一個 Kotlin 函式 `MainComposeView()`：

```kotlin
fun MainComposeView(): UIView = ComposeUIView {
    Text(
        "This Compose view wraps text to fit the available width",
        modifier = Modifier.fillMaxWidth().padding(16.dp)
    )
}
```

#### 在 iOS 16 及更新版本中 {id="on-ios-16-and-later"}

在你的 Swift 程式碼中，將 SwiftUI 的尺寸建議傳遞給 Compose 檢視的 `sizeThatFits()` 方法。對於 SwiftUI 未指定的尺寸維度，請使用 `UIView.noIntrinsicMetric`。

使用能夠包裹所需維度的 Compose 內容，例如本節中的 `Text`。如果你改寫自[在 SwiftUI 應用程式中使用 Compose Multiplatform](#use-compose-multiplatform-inside-a-swiftui-application) 的範例，請將其 `Box(Modifier.fillMaxSize())` 替換為此內容。

此 `UIViewRepresentable` 範例使用固定寬度以及基於內容的高度。若要使用固定高度，請使用 `.frame(height: 100)` 並移除 `Modifier.fillMaxWidth()`。

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
                // noIntrinsicMetric 將維度標記為未由 SwiftUI 指定
                width: proposal.width ?? UIView.noIntrinsicMetric,
                height: proposal.height ?? UIView.noIntrinsicMetric
            )
        )
    }
}

struct ContentView: View {
    var body: some View {
        // 使用為你的 Kotlin 檔案產生的橋接名稱
        // 例如，main.ios.kt -> Main_iosKt
        ComposeView(makeComposeUIView: { Main_iosKt.MainComposeView() })
            .frame(width: 240)
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="func sizeThatFits(_ proposal: ProposedViewSize, uiView: UIView, context: Context)"}

##### 調整檢視控制器中代管內容的大小 {id="size-content-hosted-in-a-view-controller"}

來自[在 SwiftUI 應用程式中使用 Compose Multiplatform](#use-compose-multiplatform-inside-a-swiftui-application) 的 `MainViewController()` Kotlin 函式回傳的是 `UIViewController` 而非 `UIView`。若要在 iOS 16 及更新版本中調整其內容大小，首先更新 `main.ios.kt` 中的 `MainViewController()`，使其使用包裹其高度的內容：

```kotlin
fun MainViewController(): UIViewController = ComposeUIViewController {
    Text(
        "This Compose view wraps text to fit the available width",
        modifier = Modifier.fillMaxWidth().padding(16.dp)
    )
}
```

在你的 Swift 程式碼中，更新使用 `UIViewControllerRepresentable` 將控制器嵌入至 SwiftUI 範例中的 `ComposeViewController` 包裝器。在此包裝器中新增 `sizeThatFits(_:uiViewController:context:)`，並將 SwiftUI 的尺寸建議轉發給控制器的 Compose 檢視：

```swift
struct ComposeViewController: UIViewControllerRepresentable {
    func makeUIViewController(context: Context) -> UIViewController {
        // 使用為你的 Kotlin 檔案產生的橋接名稱
        // 例如，main.ios.kt -> Main_iosKt
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
                // noIntrinsicMetric 將維度標記為未由 SwiftUI 指定
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

固定寬度限制了文字，而 SwiftUI 則使用回報的高度來適配內容。

#### 在 iOS 16 之前 {collapsible="true" id="before-ios-16"}

如果你的 SwiftUI 應用程式必須在早於 16 的 iOS 版本上執行，請在 `main.ios.kt` 中回報 `MainComposeView()` 的內在內容大小：

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

此範例使用固定寬度，並讓 Compose 內容決定高度。在你的 Swift 程式碼中，將寬度傳遞給 `updateUIView()` 中的 `sizeThatFits()`，並在 SwiftUI frame 中使用相同的寬度。SwiftUI 會透過 `intrinsicContentSize` 讀取產生的大小：

```swift
struct IntrinsicComposeView: UIViewRepresentable {
    let makeComposeUIView: () -> UIView
    let width: CGFloat

    func makeUIView(context: Context) -> UIView {
        makeComposeUIView()
    }

    func updateUIView(_ uiView: UIView, context: Context) {
        _ = uiView.sizeThatFits(
            // noIntrinsicMetric 將維度標記為未由 SwiftUI 指定
            CGSize(width: width, height: UIView.noIntrinsicMetric)
        )
    }
}

struct ContentView: View {
    private let width: CGFloat = 240

    var body: some View {
        // 使用為你的 Kotlin 檔案產生的橋接名稱
        // 例如，main.ios.kt -> Main_iosKt
        IntrinsicComposeView(
            makeComposeUIView: { Main_iosKt.MainComposeView() },
            width: width
        )
        .frame(width: width)
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="uiView.sizeThatFits(CGSize(width: width, height: UIView.noIntrinsicMetric)"}

若要使用固定高度，請在尺寸建議與 SwiftUI frame 中交換寬度與高度。

## 在 Compose Multiplatform 中使用 SwiftUI {id="use-swiftui-inside-compose-multiplatform"}

若要在 Compose Multiplatform 中使用 SwiftUI，請將你的 Swift 程式碼加入至中介的 [`UIViewController`](https://developer.apple.com/documentation/uikit/uiviewcontroller/)。目前你無法直接在 Kotlin 中編寫 SwiftUI 結構。相反地，你必須在 Swift 中編寫它們，並將它們傳遞給 Kotlin 函式。

首先，在入口點函式中新增一個引數以建立 `ComposeUIViewController` 組件：

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

在你的 Swift 程式碼中，將 `createUIViewController` 傳遞給你的入口點函式。你可以使用 `UIHostingController` 執行個體來封裝 SwiftUI 檢視：

```swift
Main_iosKt.ComposeEntryPointWithUIViewController(createUIViewController: { () -> UIViewController in
    let swiftUIView = VStack {
        Text("SwiftUI in Compose Multiplatform")
    }
    return UIHostingController(rootView: swiftUIView)
})
```

最終，你的應用程式外觀應如下所示：

![UIView](uiview.png){width=300}

在[範例專案](https://github.com/JetBrains/compose-multiplatform/tree/master/examples/interop/ios-swiftui-in-compose)中探索此範例的程式碼。

### 地圖檢視 {id="map-view"}

你可以使用 SwiftUI 的 [`Map`](https://developer.apple.com/documentation/mapkit/map) 組件在 Compose Multiplatform 中實作地圖檢視。這讓你的應用程式能夠顯示完全互動式的 SwiftUI 地圖。

對於同一個 [Kotlin 入口點函式](#use-swiftui-inside-compose-multiplatform)，在 Swift 中，傳遞使用 `UIHostingController` 封裝 `Map` 檢視的 `UIViewController`：

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

現在，讓我們來看一個進階範例。這段程式碼在 SwiftUI 地圖中新增了自訂標記，並允許你從 Swift 更新檢視狀態：

```swift
import SwiftUI
import MapKit

struct AnnotatedMapView: View {
    // 管理地圖區域狀態
    @State private var region = MKCoordinateRegion(
        center: CLLocationCoordinate2D(latitude: 51.5074, longitude: -0.1278),
        span: MKCoordinateSpan(latitudeDelta: 0.1, longitudeDelta: 0.1)
    )
    // 顯示帶有自訂標記的地圖
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

接著你可以將這個帶有標記的地圖封裝在 `UIHostingController` 中，並將其傳遞給你的 Compose Multiplatform 程式碼：

```swift
Main_iosKt.ComposeEntryPointWithUIViewController(createUIViewController: {
    return UIHostingController(rootView: AnnotatedMapView())
})
```

`AnnotatedMapView` 執行以下任務：

* 定義一個 SwiftUI `Map` 檢視，並將其嵌入至名為 `AnnotatedMapView` 的自訂檢視中。
* 使用 `@State` 與 `MKCoordinateRegion` 管理地圖定位的內部狀態，使 Compose Multiplatform 能夠顯示具備狀態感知且可互動的地圖。
* 使用符合 `Identifiable`（SwiftUI 標記所必需）的靜態 `Landmark` 模型在地圖上顯示 `MapMarker`。
* 使用 `annotationItems` 宣告式地在地圖上放置自訂標記。
* 將 SwiftUI 組件封裝在 `UIHostingController` 內，然後將其作為 `UIViewController` 傳遞給 Compose Multiplatform。

### 相機檢視 {id="camera-view"}

你可以使用 SwiftUI 以及封裝在 SwiftUI 相容組件中的 UIKit [`UIImagePickerController`](https://developer.apple.com/documentation/uikit/uiimagepickercontroller)，在 Compose Multiplatform 中實作相機檢視。這讓你的應用程式能夠啟動系統相機並拍照。

對於同一個 [Kotlin 入口點函式](#use-swiftui-inside-compose-multiplatform)，在 Swift 中，使用 `UIImagePickerController` 定義基本的 `CameraView`，並使用 `UIHostingController` 將其嵌入：

```swift
Main_iosKt.ComposeEntryPointWithUIViewController(createUIViewController: {
    return UIHostingController(rootView: CameraView { image in
        // 在此處處理擷取的影像
    })
})
```

為了使其運作，請如下定義 `CameraView`：

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

現在，讓我們來看一個進階範例。這段程式碼呈現一個相機檢視，並在同一個 SwiftUI 檢視中顯示擷取影像的縮圖：

```swift
import SwiftUI
import UIKit

struct CameraPreview: View {
    // 控制相機工作表的可見性
    @State private var showCamera = false
    // 儲存擷取的影像
    @State private var capturedImage: UIImage?

    var body: some View {
        VStack {
            if let image = capturedImage {
                // 顯示擷取的影像
                Image(uiImage: image)
                    .resizable()
                    .scaledToFit()
                    .frame(height: 200)
            } else {
                // 未擷取影像時顯示占位文字
                Text("No image captured")
            }

            // 新增開啟相機的按鈕
            Button("Open Camera") {
                showCamera = true
            }
            // 將 CameraView 作為強制回應工作表呈現
            .sheet(isPresented: $showCamera) {
                CameraView { image in
                    capturedImage = image
                }
            }
        }
    }
}
```

`CameraPreview` 檢視執行以下任務：

* 當使用者點擊按鈕時，在強制回應 `.sheet` 中呈現 `CameraView`。
* 使用 `@State` 屬性包裝器來儲存並顯示擷取的影像。
* 嵌入 SwiftUI 的原生 `Image` 檢視以預覽相片。
* 重複使用先前基於 `UIViewControllerRepresentable` 的 `CameraView`，但將其更深入地整合到 SwiftUI 狀態系統中。

> 若要在實體裝置上進行測試，你需要在應用程式的 `Info.plist` 檔案中新增 `NSCameraUsageDescription` 金鑰。若缺少此設定，應用程式將在執行期發生崩潰。
>
{style="note"}

### Web 檢視 {id="web-view"}

你可以透過使用 `UIViewRepresentable` 封裝 UIKit 的 [`WKWebView`](https://developer.apple.com/documentation/webkit/wkwebview) 組件，在 Compose Multiplatform 中使用 SwiftUI 實作 Web 檢視。這讓你可以顯示具有完整原生算繪效果的嵌入式 Web 內容。

對於同一個 [Kotlin 入口點函式](#use-swiftui-inside-compose-multiplatform)，在 Swift 中，定義使用 `UIHostingController` 嵌入的基本 `WebView`：

```swift
Main_iosKt.ComposeEntryPointWithUIViewController(createUIViewController: {
    let url = URL(string: "https://www.jetbrains.com")!
    return UIHostingController(rootView: WebView(url: url))
})
```

現在，讓我們來看一個進階範例。這段程式碼為 Web 檢視加入了導覽追蹤與載入狀態顯示：

```swift
import SwiftUI
import UIKit
import WebKit

struct AdvancedWebView: UIViewRepresentable {
    let url: URL
    @Binding var isLoading: Bool
    @Binding var currentURL: String

    // 建立帶有導覽委派的 WKWebView
    func makeUIView(context: Context) -> WKWebView {
        let webView = WKWebView()
        webView.navigationDelegate = context.coordinator
        webView.load(URLRequest(url: url))
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    // 建立協調器以處理 Web 導覽事件 
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

        // 更新 URL 並指示載入已完成
        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation?) {
            isLoading = false
            currentURL = webView.url?.absoluteString ?? ""
        }
    }
}
```

在 SwiftUI 檢視中使用它的方式如下：

```swift
struct WebViewContainer: View {
    // 追蹤 Web 檢視的載入狀態
    @State private var isLoading = false
    // 追蹤目前顯示的 URL
    @State private var currentURL = ""

    var body: some View {
        VStack {
            // 載入時顯示進度指示器
            if isLoading {
                ProgressView()
            }
            // 顯示目前 URL
            Text("URL: \(currentURL)")
                .font(.caption)
                .lineLimit(1)
                .truncationMode(.middle)

            // 嵌入進階 Web 檢視
            AdvancedWebView(
                url: URL(string: "https://www.jetbrains.com")!,
                isLoading: $isLoading,
                currentURL: $currentURL
            )
        }
    }
}
```

`AdvancedWebView` 與 `WebViewContainer` 執行以下任務：

* 建立帶有自訂導覽委派的 `WKWebView`，以追蹤載入進度與 URL 變更。
* 使用 SwiftUI 的 `@State` 繫結以動態更新 UI，回應導覽事件。
* 在頁面載入時顯示 `ProgressView` 旋轉指示器。
* 使用 `Text` 組件在檢視頂端顯示目前 URL。
* 使用 `UIHostingController` 將此組件整合至你的 Compose UI 中。

## 後續步驟 {id="what-s-next"}

* 了解如何在 Compose 算繪螢幕內容時，使用[原生 SwiftUI 導覽實現系統算繪的 Liquid Glass 效果](ios-liquid-glass.md)。
* 探索 Compose Multiplatform 與 [UIKit 架構整合](compose-uikit-integration.md)的方式。