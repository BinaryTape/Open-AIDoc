[//]: # (title: 與 SwiftUI 架構整合)

<show-structure depth="3"/>

Compose Multiplatform 與 [SwiftUI](https://developer.apple.com/swiftui/) 架構具有互通性。
您可以將 Compose Multiplatform 嵌入 SwiftUI 應用程式中，也可以將原生 SwiftUI 組建嵌入 Compose Multiplatform UI 中。本頁面提供在 SwiftUI 中使用 Compose Multiplatform 以及在 Compose Multiplatform 應用程式中嵌入 SwiftUI 的範例。

> 若要了解 UIKit 互通性，請參閱 [與 UIKit 架構整合](compose-uikit-integration.md) 一文。
>
{style="tip"}

## 在 SwiftUI 應用程式中使用 Compose Multiplatform {id="use-compose-multiplatform-inside-a-swiftui-application"}

要在 SwiftUI 應用程式中使用 Compose Multiplatform，請建立一個 Kotlin 函式 `MainViewController()`，該函式會從 UIKit 回傳 [`UIViewController`](https://developer.apple.com/documentation/uikit/uiviewcontroller/)，並包含 Compose Multiplatform 程式碼：

```kotlin
fun MainViewController(): UIViewController =
    ComposeUIViewController {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("This is Compose code", fontSize = 20.sp)
        }
    }
```

[`ComposeUIViewController()`](https://github.com/JetBrains/compose-multiplatform-core/blob/5b487914cc20df24187f9ddf54534dfec30f6752/compose/ui/ui/src/uikitMain/kotlin/androidx/compose/ui/window/ComposeWindow.uikit.kt) 是一個 Compose Multiplatform 程式庫函式，它接受一個 composable 函式作為 `content` 引數。以這種方式傳遞的函式可以呼叫其他 composable 函式，例如 `Text()`。

> Compose Multiplatform 渲染需要明確啟用高重新整理率：請將 `CADisableMinimumFrameDurationOnPhone` 鍵新增到應用程式的 `Info.plist` 檔案中。若沒有它，應用程式將在執行時崩潰。
>
{style="note"}

接著，您需要一個在 SwiftUI 中表示 Compose Multiplatform 的結構。建立以下將 `UIViewController` 執行個體轉換為 SwiftUI 檢視的結構：

```swift
struct ComposeViewController: UIViewControllerRepresentable {
    func makeUIViewController(context: Context) -> UIViewController {
        return Main_iosKt.MainViewController()
    }

    func updateUIViewController(_ uiViewController: UIViewController, context: Context) {
    }
}
```

現在您可以在其他 SwiftUI 程式碼中使用 `ComposeView` 結構。

`Main_iosKt.MainViewController` 是一個產生的名稱。您可以透過 [與 Swift/Objective-C 的互通性](https://kotlinlang.org/docs/native-objc-interop.html#top-level-functions-and-properties) 頁面進一步了解如何從 Swift 存取 Kotlin 程式碼。

最終，您的應用程式看起來應該像這樣：

![ComposeView](compose-view.png){width=300}

您可以在任何 SwiftUI 檢視階層結構中使用此 `ComposeView`，並從 SwiftUI 程式碼中控制其大小。

如果您想將 Compose Multiplatform 嵌入現有的應用程式中，請在任何使用 SwiftUI 的地方使用 `ComposeView` 結構。
範例請參閱我們的 [範例專案](https://github.com/JetBrains/compose-multiplatform/tree/master/examples/interop/ios-compose-in-swiftui)。

## 在 Compose Multiplatform 中使用 SwiftUI {id="use-swiftui-inside-compose-multiplatform"}

要在 Compose Multiplatform 中使用 SwiftUI，請將您的 Swift 程式碼新增至中介的 [`UIViewController`](https://developer.apple.com/documentation/uikit/uiviewcontroller/)。
目前，您無法直接在 Kotlin 中編寫 SwiftUI 結構。相反地，您必須在 Swift 中編寫它們，並將其傳遞給 Kotlin 函式。

首先，為您的入口點函式新增一個引數以建立 `ComposeUIViewController` 組件：

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

在您的 Swift 程式碼中，將 `createUIViewController` 傳遞給您的入口點函式。您可以使用 `UIHostingController` 執行個體來包裝 SwiftUI 檢視：

```swift
Main_iosKt.ComposeEntryPointWithUIViewController(createUIViewController: { () -> UIViewController in
    let swiftUIView = VStack {
        Text("SwiftUI in Compose Multiplatform")
    }
    return UIHostingController(rootView: swiftUIView)
})
```

最終，您的應用程式看起來應該像這樣：

![UIView](uiview.png){width=300}

在 [範例專案](https://github.com/JetBrains/compose-multiplatform/tree/master/examples/interop/ios-swiftui-in-compose) 中探索此範例的程式碼。

### 地圖檢視 {id="map-view"}

您可以使用 SwiftUI 的 [`Map`](https://developer.apple.com/documentation/mapkit/map) 組建在 Compose Multiplatform 中實作地圖檢視。這讓您的應用程式能夠顯示完全互動的 SwiftUI 地圖。

對於同一個 [Kotlin 入口點函式](#use-swiftui-inside-compose-multiplatform)，在 Swift 中，使用 `UIHostingController` 傳遞包裝 `Map` 檢視的 `UIViewController`：

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

現在，讓我們看一個進階範例。這段程式碼在 SwiftUI 地圖中新增了自訂註解，並允許您從 Swift 更新檢視狀態：

```swift
import SwiftUI
import MapKit

struct AnnotatedMapView: View {
    // 管理地圖區域狀態
    @State private var region = MKCoordinateRegion(
        center: CLLocationCoordinate2D(latitude: 51.5074, longitude: -0.1278),
        span: MKCoordinateSpan(latitudeDelta: 0.1, longitudeDelta: 0.1)
    )
    // 顯示具有自訂註解的地圖
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

接著，您可以將此帶有註解的地圖包裝在 `UIHostingController` 中，並傳遞給您的 Compose Multiplatform 程式碼：

```swift
Main_iosKt.ComposeEntryPointWithUIViewController(createUIViewController: {
    return UIHostingController(rootView: AnnotatedMapView())
})
```

`AnnotatedMapView` 執行下列任務：

* 定義一個 SwiftUI `Map` 檢視，並將其嵌入名為 `AnnotatedMapView` 的自訂檢視中。
* 使用 `@State` 和 `MKCoordinateRegion` 管理地圖位置的內部狀態，允許 Compose Multiplatform 顯示一個互動式且感知狀態的地圖。
* 使用符合 `Identifiable` 的靜態 `Landmark` 模型在地圖上顯示 `MapMarker`，這是 SwiftUI 註解所必需的。
* 使用 `annotationItems` 以宣告方式在地圖上放置自訂標記。
* 將 SwiftUI 組建包裝在 `UIHostingController` 中，然後將其作為 `UIViewController` 傳遞給 Compose Multiplatform。

### 相機檢視 {id="camera-view"}

您可以使用 SwiftUI 和 UIKit 的 [`UIImagePickerController`](https://developer.apple.com/documentation/uikit/uiimagepickercontroller)（包裝在與 SwiftUI 相容的組建中）在 Compose Multiplatform 中實作相機檢視。這讓您的應用程式能夠啟動系統相機並拍攝照片。

對於同一個 [Kotlin 入口點函式](#use-swiftui-inside-compose-multiplatform)，在 Swift 中，使用 `UIImagePickerController` 定義基本的 `CameraView` 並使用 `UIHostingController` 嵌入：

```swift
Main_iosKt.ComposeEntryPointWithUIViewController(createUIViewController: {
    return UIHostingController(rootView: CameraView { image in
        // 在此處處理擷取的影像
    })
})
```

為了使其運作，請按如下方式定義 `CameraView`：

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

現在，讓我們看一個進階範例。這段程式碼呈現一個相機檢視，並在同一個 SwiftUI 檢視中顯示擷取影像的縮圖：

```swift
import SwiftUI
import UIKit

struct CameraPreview: View {
    // 控制相機工作表的顯示狀態
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
                // 當未擷取影像時顯示佔位字串
                Text("No image captured")
            }

            // 新增開啟相機的按鈕
            Button("Open Camera") {
                showCamera = true
            }
            // 將 CameraView 作為強制回應視窗呈現
            .sheet(isPresented: $showCamera) {
                CameraView { image in
                    capturedImage = image
                }
            }
        }
    }
}
```

`CameraPreview` 檢視執行下列任務：

* 當使用者點擊按鈕時，在強制回應視窗 `.sheet` 中呈現 `CameraView`。
* 使用 `@State` 屬性包裝器來儲存並顯示擷取的影像。
* 嵌入 SwiftUI 原生的 `Image` 檢視來預覽照片。
* 重複使用與之前相同基於 `UIViewControllerRepresentable` 的 `CameraView`，但將其更深層地整合到 SwiftUI 狀態系統中。

> 若要在真實裝置上進行測試，您需要將 `NSCameraUsageDescription` 金鑰新增到應用程式的 `Info.plist` 檔案中。若沒有它，應用程式將在執行時崩潰。
>
{style="note"}

### 網頁檢視 {id="web-view"}

您可以透過將 UIKit 的 [`WKWebView`](https://developer.apple.com/documentation/webkit/wkwebview) 組建與 `UIViewRepresentable` 包裝在一起，在 Compose Multiplatform 中使用 SwiftUI 實作網頁檢視。這讓您可以顯示具有完整原生渲染的嵌入式網頁內容。

對於同一個 [Kotlin 入口點函式](#use-swiftui-inside-compose-multiplatform)，在 Swift 中，定義一個使用 `UIHostingController` 嵌入的基本 `WebView`：

```swift
Main_iosKt.ComposeEntryPointWithUIViewController(createUIViewController: {
    let url = URL(string: "https://www.jetbrains.com")!
    return UIHostingController(rootView: WebView(url: url))
})
```

現在，讓我們看一個進階範例。這段程式碼為網頁檢視新增了導覽追蹤和載入狀態顯示：

```swift
import SwiftUI
import UIKit
import WebKit

struct AdvancedWebView: UIViewRepresentable {
    let url: URL
    @Binding var isLoading: Bool
    @Binding var currentURL: String

    // 建立具有導覽委派的 WKWebView
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

在 SwiftUI 檢視中使用方式如下：

```swift
struct WebViewContainer: View {
    // 追蹤網頁檢視的載入狀態
    @State private var isLoading = false
    // 追蹤顯示的目前 URL
    @State private var currentURL = ""

    var body: some View {
        VStack {
            // 載入時顯示載入指示器
            if isLoading {
                ProgressView()
            }
            // 顯示目前 URL
            Text("URL: \(currentURL)")
                .font(.caption)
                .lineLimit(1)
                .truncationMode(.middle)

            // 嵌入進階網頁檢視
            AdvancedWebView(
                url: URL(string: "https://www.jetbrains.com")!,
                isLoading: $isLoading,
                currentURL: $currentURL
            )
        }
    }
}
```

`AdvancedWebView` 和 `WebViewContainer` 執行下列任務：

* 建立具有自訂導覽委派的 `WKWebView`，以追蹤載入進度和 URL 變更。
* 使用 SwiftUI 的 `@State` 繫結來動態更新 UI 以回應導覽事件。
* 在頁面載入時顯示 `ProgressView` 旋轉圖示。
* 使用 `Text` 組建在檢視頂部顯示目前 URL。
* 使用 `UIHostingController` 將此組建整合到您的 Compose UI 中。

## 後續步驟 {id="what-s-next"}

* 了解如何使用 [原生 SwiftUI 導覽以實現系統渲染的 Liquid Glass 效果](ios-liquid-glass.md)，同時由 Compose 渲染螢幕內容。
* 探索 Compose Multiplatform [與 UIKit 架構整合](compose-uikit-integration.md) 的方式。