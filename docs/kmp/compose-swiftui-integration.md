[//]: # (title: 与 SwiftUI 框架的集成)

<show-structure depth="3"/>

Compose Multiplatform 可与 [SwiftUI](https://developer.apple.com/swiftui/) 框架进行互操作。
你可以在 SwiftUI 应用程序中嵌入 Compose Multiplatform，也可以在 Compose Multiplatform UI 中嵌入原生 SwiftUI 组件。本页面提供了在 SwiftUI 内部使用 Compose Multiplatform 以及在 Compose Multiplatform 应用中嵌入 SwiftUI 的示例。

> 要了解有关 UIKit 互操作性的信息，请参阅[与 UIKit 框架的集成](compose-uikit-integration.md)一文。
>
{style="tip"}

## 在 SwiftUI 应用程序中使用 Compose Multiplatform {id="use-compose-multiplatform-inside-a-swiftui-application"}

要在 SwiftUI 应用程序中使用 Compose Multiplatform，请创建一个 Kotlin 函数 `MainViewController()`，该函数返回 UIKit 中的 [`UIViewController`](https://developer.apple.com/documentation/uikit/uiviewcontroller/)，并包含 Compose Multiplatform 代码：

```kotlin
fun MainViewController(): UIViewController =
    ComposeUIViewController {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("This is Compose code", fontSize = 20.sp)
        }
    }
```

[`ComposeUIViewController()`](https://github.com/JetBrains/compose-multiplatform-core/blob/5b487914cc20df24187f9ddf54534dfec30f6752/compose/ui/ui/src/uikitMain/kotlin/androidx/compose/ui/window/ComposeWindow.uikit.kt) 是一个 Compose Multiplatform 库函数，它接受一个可组合函数作为 `content` 实参。
通过这种方式传递的函数可以调用其他可组合函数，例如 `Text()`。

> Compose Multiplatform 渲染需要显式启用高刷新率：
> 请在应用的 `Info.plist` 文件中添加 `CADisableMinimumFrameDurationOnPhone` 键。
> 如果未添加，应用将在运行时发生崩溃。
>
{style="note"}

接下来，你需要一个在 SwiftUI 中代表 Compose Multiplatform 的结构体。
创建以下结构体，将 `UIViewController` 实例转换为 SwiftUI 视图：

```swift
struct ComposeViewController: UIViewControllerRepresentable {
    func makeUIViewController(context: Context) -> UIViewController {
        return Main_iosKt.MainViewController()
    }

    func updateUIViewController(_ uiViewController: UIViewController, context: Context) {
    }
}
```

现在你可以在其他 SwiftUI 代码中使用 `ComposeViewController` 结构体了。

`Main_iosKt.MainViewController` 是生成的名称。你可以在[与 Swift/Objective-C 的互操作性](https://kotlinlang.org/docs/native-objc-interop.html#top-level-functions-and-properties)页面上了解有关从 Swift 访问 Kotlin 代码的更多信息。

最终，你的应用程序应如下所示：

![ComposeView](compose-view.png){width=300}

有关示例，请参阅我们的[示例项目](https://github.com/JetBrains/compose-multiplatform/tree/master/examples/interop/ios-compose-in-swiftui)。

### 调整 Compose 视图大小以适应其内容 {id="size-compose-views-to-fit-their-content"}
<primary-label ref="EAP"/>

Compose 视图可以根据 SwiftUI 提供的尺寸建议来测量其内容，并报告其首选尺寸。如果该尺寸发生变化，托管它的 `UIView` 会使自身的固有内容大小（intrinsic content size）失效，以便 SwiftUI 可以重新进行布局并应用更新后的尺寸。

对于 `UIViewRepresentable` 示例，请在 `main.ios.kt` 中定义一个 Kotlin 函数 `MainComposeView()`：

```kotlin
fun MainComposeView(): UIView = ComposeUIView {
    Text(
        "This Compose view wraps text to fit the available width",
        modifier = Modifier.fillMaxWidth().padding(16.dp)
    )
}
```

#### 在 iOS 16 及更高版本上 {id="on-ios-16-and-later"}

在 Swift 代码中，将 SwiftUI 的尺寸建议传递给 Compose 视图的 `sizeThatFits()` 方法。
对于 SwiftUI 未指定的维度，请使用 `UIView.noIntrinsicMetric`。

使用能够自适应包裹目标维度的 Compose 内容，例如本节中的 `Text`。
如果你修改自[在 SwiftUI 应用程序中使用 Compose Multiplatform](#use-compose-multiplatform-inside-a-swiftui-application)中的示例，请将其中的 `Box(Modifier.fillMaxSize())` 替换为该内容。

这个 `UIViewRepresentable` 示例使用了固定宽度和基于内容的高度。
如果需要固定高度，请使用 `.frame(height: 100)` 并移除 `Modifier.fillMaxWidth()`。

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
                // noIntrinsicMetric 将某个维度标记为未由 SwiftUI 指定
                width: proposal.width ?? UIView.noIntrinsicMetric,
                height: proposal.height ?? UIView.noIntrinsicMetric
            )
        )
    }
}

struct ContentView: View {
    var body: some View {
        // 使用为你的 Kotlin 文件生成的桥接名称
        // 例如，main.ios.kt -> Main_iosKt
        ComposeView(makeComposeUIView: { Main_iosKt.MainComposeView() })
            .frame(width: 240)
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="func sizeThatFits(_ proposal: ProposedViewSize, uiView: UIView, context: Context)"}

##### 调整视图控制器中托管内容的大小 {id="size-content-hosted-in-a-view-controller"}

来自[在 SwiftUI 应用程序中使用 Compose Multiplatform](#use-compose-multiplatform-inside-a-swiftui-application)的 `MainViewController()` Kotlin 函数返回的是 `UIViewController` 而不是 `UIView`。
若要在 iOS 16 及更高版本上调整其内容的大小，请首先更新 `main.ios.kt` 中的 `MainViewController()`，使其使用包裹自身高度的内容：

```kotlin
fun MainViewController(): UIViewController = ComposeUIViewController {
    Text(
        "This Compose view wraps text to fit the available width",
        modifier = Modifier.fillMaxWidth().padding(16.dp)
    )
}
```

在 Swift 代码中，更新使用 `UIViewControllerRepresentable` 将控制器嵌入 SwiftUI 的示例中的 `ComposeViewController` 包装器。
向该包装器添加 `sizeThatFits(_:uiViewController:context:)`，并将 SwiftUI 的尺寸建议转发给控制器的 Compose 视图：

```swift
struct ComposeViewController: UIViewControllerRepresentable {
    func makeUIViewController(context: Context) -> UIViewController {
        // 使用为你的 Kotlin 文件生成的桥接名称
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
                // noIntrinsicMetric 将某个维度标记为未由 SwiftUI 指定
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

固定宽度限制了文本，而 SwiftUI 使用报告的高度来适应内容。

#### iOS 16 之前 {collapsible="true" id="before-ios-16"}

如果你的 SwiftUI 应用必须在早于 16 的 iOS 版本上运行，请在 `main.ios.kt` 中报告 `MainComposeView()` 的固有内容大小：

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

此示例使用固定宽度，并允许 Compose 内容确定高度。
在 Swift 代码中，将宽度传递给 `updateUIView()` 中的 `sizeThatFits()`，并在 SwiftUI frame 中使用相同的宽度。
SwiftUI 会通过 `intrinsicContentSize` 读取最终尺寸：

```swift
struct IntrinsicComposeView: UIViewRepresentable {
    let makeComposeUIView: () -> UIView
    let width: CGFloat

    func makeUIView(context: Context) -> UIView {
        makeComposeUIView()
    }

    func updateUIView(_ uiView: UIView, context: Context) {
        _ = uiView.sizeThatFits(
            // noIntrinsicMetric 将某个维度标记为未由 SwiftUI 指定
            CGSize(width: width, height: UIView.noIntrinsicMetric)
        )
    }
}

struct ContentView: View {
    private let width: CGFloat = 240

    var body: some View {
        // 使用为你的 Kotlin 文件生成的桥接名称
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

对于固定高度，请在尺寸建议和 SwiftUI frame 中互换宽度和高度。

## 在 Compose Multiplatform 中使用 SwiftUI {id="use-swiftui-inside-compose-multiplatform"}

要在 Compose Multiplatform 内部使用 SwiftUI，请将 Swift 代码添加到中介 [`UIViewController`](https://developer.apple.com/documentation/uikit/uiviewcontroller/) 中。
目前，你无法直接在 Kotlin 中编写 SwiftUI 结构体。相反，你必须在 Swift 中编写它们并将其传递给 Kotlin 函数。

首先，为你的入口点函数添加一个实参以创建 `ComposeUIViewController` 组件：

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

在 Swift 代码中，将 `createUIViewController` 传递给你的入口点函数。
你可以使用 `UIHostingController` 实例来包装 SwiftUI 视图：

```swift
Main_iosKt.ComposeEntryPointWithUIViewController(createUIViewController: { () -> UIViewController in
    let swiftUIView = VStack {
        Text("SwiftUI in Compose Multiplatform")
    }
    return UIHostingController(rootView: swiftUIView)
})
```

最终，你的应用程序应如下所示：

![UIView](uiview.png){width=300}

可以在[示例项目](https://github.com/JetBrains/compose-multiplatform/tree/master/examples/interop/ios-swiftui-in-compose)中探索该示例的代码。

### 地图视图 (Map view) {id="map-view"}

你可以使用 SwiftUI 的 [`Map`](https://developer.apple.com/documentation/mapkit/map) 组件在 Compose Multiplatform 中实现地图视图。这使你的应用程序能够显示完全可交互的 SwiftUI 地图。

针对相同的 [Kotlin 入口点函数](#use-swiftui-inside-compose-multiplatform)，在 Swift 中传递使用 `UIHostingController` 包装 `Map` 视图的 `UIViewController`：

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

现在，来看一个进阶示例。此代码向 SwiftUI 地图添加了自定义标注，并允许你从 Swift 更新视图状态：

```swift
import SwiftUI
import MapKit

struct AnnotatedMapView: View {
    // 管理地图区域状态
    @State private var region = MKCoordinateRegion(
        center: CLLocationCoordinate2D(latitude: 51.5074, longitude: -0.1278),
        span: MKCoordinateSpan(latitudeDelta: 0.1, longitudeDelta: 0.1)
    )
    // 显示带有自定义标注的地图
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

然后，你可以将此带有标注的地图包装在 `UIHostingController` 中并传递给 Compose Multiplatform 代码：

```swift
Main_iosKt.ComposeEntryPointWithUIViewController(createUIViewController: {
    return UIHostingController(rootView: AnnotatedMapView())
})
```

`AnnotatedMapView` 执行以下任务：

* 定义一个 SwiftUI `Map` 视图并将其嵌入名为 `AnnotatedMapView` 的自定义视图中。
* 使用 `@State` 和 `MKCoordinateRegion` 管理地图定位的内部状态，从而允许 Compose Multiplatform 显示交互式、具备状态感知的地图。
* 使用符合 `Identifiable` 协议的静态 `Landmark` 模型在地图上显示 `MapMarker`，这是 SwiftUI 中标注所必需的。
* 使用 `annotationItems` 以声明方式在地图上放置自定义标记。
* 将 SwiftUI 组件包装在 `UIHostingController` 中，然后将其作为 `UIViewController` 传递给 Compose Multiplatform。

### 相机视图 (Camera view) {id="camera-view"}

你可以在 Compose Multiplatform 中使用包装在 SwiftUI 兼容组件中的 SwiftUI 和 UIKit [`UIImagePickerController`](https://developer.apple.com/documentation/uikit/uiimagepickercontroller) 来实现相机视图。这允许你的应用程序启动系统相机并拍摄照片。

针对相同的 [Kotlin 入口点函数](#use-swiftui-inside-compose-multiplatform)，在 Swift 中使用 `UIImagePickerController` 定义一个基本的 `CameraView`，并使用 `UIHostingController` 将其嵌入：

```swift
Main_iosKt.ComposeEntryPointWithUIViewController(createUIViewController: {
    return UIHostingController(rootView: CameraView { image in
        // 在此处处理捕获的图像
    })
})
```

为实现此功能，请将 `CameraView` 定义如下：

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

现在，来看一个进阶示例。此代码展示了一个相机视图，并在同一个 SwiftUI 视图中显示捕获图像的缩略图：

```swift
import SwiftUI
import UIKit

struct CameraPreview: View {
    // 控制相机工作表的可见性
    @State private var showCamera = false
    // 存储捕获的图像
    @State private var capturedImage: UIImage?

    var body: some View {
        VStack {
            if let image = capturedImage {
                // 显示捕获的图像
                Image(uiImage: image)
                    .resizable()
                    .scaledToFit()
                    .frame(height: 200)
            } else {
                // 未捕获图像时显示占位文本
                Text("No image captured")
            }

            // 添加一个打开相机的按钮
            Button("Open Camera") {
                showCamera = true
            }
            // 将 CameraView 作为模态工作表呈现
            .sheet(isPresented: $showCamera) {
                CameraView { image in
                    capturedImage = image
                }
            }
        }
    }
}
```

`CameraPreview` 视图执行以下任务：

* 当用户点击按钮时，在模态 `.sheet` 中呈现 `CameraView`。
* 使用 `@State` 属性包装器来存储和显示捕获的图像。
* 嵌入 SwiftUI 原生的 `Image` 视图来预览照片。
* 复用之前基于 `UIViewControllerRepresentable` 的 `CameraView`，但将其更深层次地集成到 SwiftUI 状态系统中。

> 要在真实设备上进行测试，你需要在应用的 `Info.plist` 文件中添加 `NSCameraUsageDescription` 键。
> 如果未添加，应用将在运行时发生崩溃。
>
{style="note"}

### Web 视图 (Web view) {id="web-view"}

你可以在 Compose Multiplatform 中使用 SwiftUI，通过使用 `UIViewRepresentable` 包装 UIKit 的 [`WKWebView`](https://developer.apple.com/documentation/webkit/wkwebview) 组件来实现 Web 视图。这使你能够以完全原生渲染的方式显示嵌入的 Web 内容。

针对相同的 [Kotlin 入口点函数](#use-swiftui-inside-compose-multiplatform)，在 Swift 中定义一个使用 `UIHostingController` 嵌入的基本 `WebView`：

```swift
Main_iosKt.ComposeEntryPointWithUIViewController(createUIViewController: {
    let url = URL(string: "https://www.jetbrains.com")!
    return UIHostingController(rootView: WebView(url: url))
})
```

现在，来看一个进阶示例。此代码为 Web 视图添加了导航跟踪和加载状态显示：

```swift
import SwiftUI
import UIKit
import WebKit

struct AdvancedWebView: UIViewRepresentable {
    let url: URL
    @Binding var isLoading: Bool
    @Binding var currentURL: String

    // 创建带有导航委托的 WKWebView
    func makeUIView(context: Context) -> WKWebView {
        let webView = WKWebView()
        webView.navigationDelegate = context.coordinator
        webView.load(URLRequest(url: url))
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    // 创建协调器以处理 Web 导航事件 
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

        // 更新 URL 并指示加载已完成
        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation?) {
            isLoading = false
            currentURL = webView.url?.absoluteString ?? ""
        }
    }
}
```

在 SwiftUI 视图中使用方式如下：

```swift
struct WebViewContainer: View {
    // 跟踪 Web 视图的加载状态
    @State private var isLoading = false
    // 跟踪显示的当前 URL
    @State private var currentURL = ""

    var body: some View {
        VStack {
            // 加载时显示加载指示器
            if isLoading {
                ProgressView()
            }
            // 显示当前 URL
            Text("URL: \(currentURL)")
                .font(.caption)
                .lineLimit(1)
                .truncationMode(.middle)

            // 嵌入高级 Web 视图
            AdvancedWebView(
                url: URL(string: "https://www.jetbrains.com")!,
                isLoading: $isLoading,
                currentURL: $currentURL
            )
        }
    }
}
```

`AdvancedWebView` 和 `WebViewContainer` 执行以下任务：

* 创建一个带有自定义导航委托的 `WKWebView`，用于跟踪加载进度和 URL 更改。
* 使用 SwiftUI 的 `@State` 绑定根据导航事件动态更新 UI。
* 页面加载时显示 `ProgressView` 旋转指示器。
* 使用 `Text` 组件在视图顶部显示当前 URL。
* 使用 `UIHostingController` 将此组件集成到你的 Compose UI 中。

## 后续步骤 {id="what-s-next"}

* 了解如何在 Compose 渲染屏幕内容的同时，使用[原生 SwiftUI 导航实现系统渲染的流动玻璃（Liquid Glass）效果](ios-liquid-glass.md)。
* 探索 Compose Multiplatform [与 UIKit 框架集成](compose-uikit-integration.md)的方式。