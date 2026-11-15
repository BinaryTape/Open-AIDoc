[//]: # (title: 与 UIKit 框架集成)

<show-structure depth="3"/>

Compose Multiplatform 可与 [UIKit](https://developer.apple.com/documentation/uikit) 框架互操作。
你既可以在 UIKit 应用程序中嵌入 Compose Multiplatform，也可以在 Compose Multiplatform 中嵌入原生 UIKit 组件。本页面提供了在 UIKit 应用程序中使用 Compose Multiplatform 以及在 Compose Multiplatform UI 中嵌入 UIKit 组件的示例。

> 要详细了解 SwiftUI 互操作性，请参阅[与 SwiftUI 框架集成](compose-swiftui-integration.md)一文。
>
{style="tip"}

## 在 UIKit 应用程序中使用 Compose Multiplatform {id="use-compose-multiplatform-inside-a-uikit-application"}

要在 UIKit 应用程序中使用 Compose Multiplatform，请将你的 Compose Multiplatform 代码添加到任意[容器视图控制器](https://developer.apple.com/documentation/uikit/view_controllers)中。
本示例在 `UITabBarController` 类中使用 Compose Multiplatform：

```swift
let composeViewController = Main_iosKt.ComposeOnly()
composeViewController.title = "Compose Multiplatform inside UIKit"

let anotherViewController = UIKitViewController()
anotherViewController.title = "UIKit"

// 设置 UITabBarController
let tabBarController = UITabBarController()
tabBarController.viewControllers = [
    // 将创建的 ViewController 包装在 UINavigationController 中以设置标题
    UINavigationController(rootViewController: composeViewController),
    UINavigationController(rootViewController: anotherViewController)
]
tabBarController.tabBar.items?[0].title = "Compose"
tabBarController.tabBar.items?[1].title = "UIKit"
```

运行此代码后，你的应用程序应该如下所示：

![UIKit](uikit.png){width=300}

> Compose Multiplatform 渲染需要显式启用高刷新率：
> 请在应用的 `Info.plist` 文件中添加 `CADisableMinimumFrameDurationOnPhone` 键。
> 如果未添加，应用在运行时将会崩溃。
>
{style="note"}

可在[示例项目](https://github.com/JetBrains/compose-multiplatform/tree/master/examples/interop/ios-compose-in-uikit)中探索此代码。

### 调整 Compose 视图大小以适应其内容 {id="size-compose-views-to-fit-their-content"}
<primary-label ref="EAP"/>

Compose 视图可以通过 `sizeThatFits()` 报告其首选大小。
你无需单独配置尺寸计算。

此调整大小的示例使用了定义在 `main.ios.kt` 中的 Kotlin 函数 `MainComposeView()`：

```kotlin
fun MainComposeView(): UIView = ComposeUIView {
    Text(
        "This Compose view wraps text to fit the available width",
        modifier = Modifier.fillMaxWidth().padding(16.dp)
    )
}
```

在你的 Swift 代码中，使用 [Auto Layout](https://developer.apple.com/library/archive/documentation/UserExperience/Conceptual/AutolayoutPG/index.html) 约束视图的宽度，并将该宽度传递给 `sizeThatFits()`。
高度使用 `UIView.noIntrinsicMetric`，让 Compose 根据内容自行确定，然后通过视图的高度约束应用返回的高度。

当可用空间或内容发生变化时，安排另一次布局过程以重新测量并更新约束。
如果你的应用更改了 Compose 内容，请在 Compose 处理完更改后调用 `view.setNeedsLayout()`。

```swift
import UIKit

class ComposeContentViewController: UIViewController {
    // 使用为你的 Kotlin 文件生成的桥接名称
    // 例如：main.ios.kt -> Main_iosKt
    private let composeView = Main_iosKt.MainComposeView()
    private var heightConstraint: NSLayoutConstraint!

    override func viewDidLoad() {
        super.viewDidLoad()

        composeView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(composeView)

        // 临时高度，直到 Compose 完成其内容的测量
        heightConstraint = composeView.heightAnchor.constraint(equalToConstant: 1)

        NSLayoutConstraint.activate([
            composeView.leadingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.leadingAnchor),
            composeView.trailingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.trailingAnchor),
            composeView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            heightConstraint
        ])
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        guard composeView.bounds.width > 0 else { return }

        // 初始结果可能是回退值；在后续的布局过程中重新测量
        let preferredSize = composeView.sizeThatFits(
            CGSize(
                // 对于固定高度，在此处和布局约束中交换宽度与高度
                width: composeView.bounds.width,
                height: UIView.noIntrinsicMetric
            )
        )

        if heightConstraint.constant != preferredSize.height {
            heightConstraint.constant = preferredSize.height
            view.setNeedsLayout()
        }
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="override func viewDidLayoutSubviews()"}

> 如果你的 Kotlin 函数返回 `UIViewController`，请将其添加到容器视图控制器中，并在其 `view` 上调用 `sizeThatFits()`。
>
{style="note"}

## 在 Compose Multiplatform 中使用 UIKit {id="use-uikit-inside-compose-multiplatform"}

要在 Compose Multiplatform 中使用 UIKit 元素，请将你想使用的 UIKit 元素添加到 Compose Multiplatform 的 [UIKitView](https://github.com/JetBrains/compose-multiplatform-core/blob/47c012bfe2d4570fb08432253298b8e2b6e38ade/compose/ui/ui/src/uikitMain/kotlin/androidx/compose/ui/interop/UIKitView.uikit.kt) 中。你可以完全使用 Kotlin 编写此代码，也可以同时使用 Swift。

### 地图视图 {id="map-view"}

你可以在 Compose Multiplatform 中使用 UIKit 的 [`MKMapView`](https://developer.apple.com/documentation/mapkit/mkmapview) 组件来实现地图视图。使用 Compose Multiplatform 中的 `Modifier.size()` 或 `Modifier.fillMaxSize()` 函数来设置组件大小：

```kotlin
UIKitView(
    factory = { MKMapView() },
    modifier = Modifier.size(300.dp),
)
```

运行此代码后，你的应用程序应该如下所示：

![MapView](mapview.png){width=300}

现在，让我们看一个进阶示例。此代码在 Compose Multiplatform 中包装了 UIKit 的 [`UITextField`](https://developer.apple.com/documentation/uikit/uitextfield/)：

```kotlin
@OptIn(ExperimentalForeignApi::class)
@Composable
fun UseUITextField(modifier: Modifier = Modifier) {
    // 在 Compose 中保存文本状态
    var message by remember { mutableStateOf("Hello, World!") }

    UIKitView(
        factory = {
            // 创建与 Compose 状态集成的 UITextField
            val textField = object : UITextField(CGRectMake(0.0, 0.0, 0.0, 0.0)) {
                @ObjCAction
                fun editingChanged() {
                    // 当 UITextField 中的文本更改时更新 Compose 状态
                    message = text ?: ""
                }
            }
            // 为 UITextField 内的文本更改添加监听器
            textField.addTarget(
                target = textField,
                action = NSSelectorFromString(textField::editingChanged.name),
                forControlEvents = UIControlEventEditingChanged
            )
            textField
        },
        modifier = modifier.fillMaxWidth().height(30.dp),
        update = { textField ->
            // 从 Compose 状态更新 UITextField 文本
            textField.text = message
        }
    )
}
```

* `factory` 形参包含 `editingChanged()` 函数和 `textField.addTarget()` 监听器，用于检测对 `UITextField` 的任何更改。
* `editingChanged()` 函数带有 `@ObjCAction` 注解，以便它可以与 Objective-C 代码进行互操作。
* `addTarget()` 函数的 `action` 形参传递了 `editingChanged()` 函数的名称，在响应 `UIControlEventEditingChanged` 事件时触发该函数。
* 当可观察的 message 状态改变其值时，将调用 `UIKitView()` 的 `update` 形参。
* 该函数会更新 `UITextField` 的 `text` 特性，以便用户看到更新后的值。

可在我们的[示例项目](https://github.com/JetBrains/compose-multiplatform/tree/master/examples/interop/ios-uikit-in-compose)中探索本示例的代码。

### 相机视图 {id="camera-view"}

你可以在 Compose Multiplatform 中使用 UIKit 的 [`AVCaptureSession`](https://developer.apple.com/documentation/avfoundation/avcapturesession) 和 [`AVCaptureVideoPreviewLayer`](https://developer.apple.com/documentation/avfoundation/avcapturevideopreviewlayer) 组件来实现相机视图。

这允许你的应用程序访问设备的相机并显示实时预览。

以下是实现基本相机视图的示例：

```kotlin
UIKitView(
    factory = {
        val session = AVCaptureSession().apply {
            val device = AVCaptureDevice.defaultDeviceWithMediaType(AVMediaTypeVideo)!!
            val input = AVCaptureDeviceInput.deviceInputWithDevice(device, null)!!
            addInput(input)
        }
        val previewLayer = AVCaptureVideoPreviewLayer(session)
        session.startRunning()

        object : UIView() {
            override fun layoutSubviews() {
                super.layoutSubviews()
                previewLayer.frame = bounds
            }
        }.apply {
            layer.addSublayer(previewLayer)
        }
    },
    modifier = Modifier.size(300.dp)
)
```

现在，让我们看一个进阶示例。此代码使用原生 `UIView` 拍照、附加 GPS 元数据并显示实时预览：

```kotlin
@OptIn(ExperimentalForeignApi::class)
@Composable
fun RealDeviceCamera(
    camera: AVCaptureDevice,
    onCapture: (picture: PictureData.Camera, image: PlatformStorableImage) -> Unit
) {
    // 初始化 AVCapturePhotoOutput 用于拍照
    val capturePhotoOutput = remember { AVCapturePhotoOutput() }
    // ...
    // 定义用于捕获回调的代理：处理图像数据、附加 GPS、设置 onCapture
    val photoCaptureDelegate = remember {
        object : NSObject(), AVCapturePhotoCaptureDelegateProtocol {
            override fun captureOutput(
                output: AVCapturePhotoOutput,
                didFinishProcessingPhoto: AVCapturePhoto,
                error: NSError?
            ) {
                val photoData = didFinishProcessingPhoto.fileDataRepresentation()
                if (photoData != null) {
                    val gps = locationManager.location?.toGps() ?: GpsPosition(0.0, 0.0)
                    val uiImage = UIImage(photoData)
                    onCapture(
                        createCameraPictureData(
                            name = nameAndDescription.name,
                            description = nameAndDescription.description,
                            gps = gps
                        ),
                        IosStorableImage(uiImage)
                    )
                }
                capturePhotoStarted = false
            }
        }
    }
    // ...
    // 为拍照设置 AVCaptureSession
    val captureSession: AVCaptureSession = remember {
        AVCaptureSession().also { captureSession ->
            captureSession.sessionPreset = AVCaptureSessionPresetPhoto
            val captureDeviceInput: AVCaptureDeviceInput =
                deviceInputWithDevice(device = camera, error = null)!!
            captureSession.addInput(captureDeviceInput)
            captureSession.addOutput(capturePhotoOutput)
        }
    }
    // 为实时相机预览设置 AVCaptureVideoPreviewLayer
    val cameraPreviewLayer = remember {
        AVCaptureVideoPreviewLayer(session = captureSession)
    }
    // ...
    // 创建带有原生相机预览层的原生 UIView
    UIKitView(
        modifier = Modifier.fillMaxSize().background(Color.Black),
        factory = {
            val cameraContainer = object: UIView(frame = CGRectZero.readValue()) {
                override fun layoutSubviews() {
                    CATransaction.begin()
                    CATransaction.setValue(true, kCATransactionDisableActions)
                    layer.setFrame(frame)
                    cameraPreviewLayer.setFrame(frame)
                    CATransaction.commit()
                }
            }
            cameraContainer.layer.addSublayer(cameraPreviewLayer)
            cameraPreviewLayer.videoGravity = AVLayerVideoGravityResizeAspectFill
            captureSession.startRunning()
            cameraContainer
        },
    )
    // ...
    // 创建一个 Compose 按钮，在按下时执行 capturePhotoWithSettings 回调
    CircularButton(
        imageVector = IconPhotoCamera,
        modifier = Modifier.align(Alignment.BottomCenter).padding(36.dp),
        enabled = !capturePhotoStarted,
    ) {
        capturePhotoStarted = true
        val photoSettings = AVCapturePhotoSettings.photoSettingsWithFormat(
            format = mapOf(AVVideoCodecKey to AVVideoCodecTypeJPEG)
        )
        if (camera.position == AVCaptureDevicePositionFront) {
            capturePhotoOutput.connectionWithMediaType(AVMediaTypeVideo)
                ?.automaticallyAdjustsVideoMirroring = false
            capturePhotoOutput.connectionWithMediaType(AVMediaTypeVideo)
                ?.videoMirrored = true
        }
        capturePhotoOutput.capturePhotoWithSettings(
            settings = photoSettings,
            delegate = photoCaptureDelegate
        )
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="val capturePhotoOutput = remember { AVCapturePhotoOutput() }"}

`RealDeviceCamera` 可组合项执行以下任务：

* 使用 `AVCaptureSession` 和 `AVCaptureVideoPreviewLayer` 设置原生相机预览。
* 创建一个承载自定义 `UIView` 子类的 `UIKitView`，该子类管理布局更新并嵌入预览层。
* 初始化 `AVCapturePhotoOutput` 并配置代理以处理拍照。
* 在拍摄瞬间使用 `CLLocationManager`（通过 `locationManager`）获取 GPS 坐标。
* 将捕获的图像转换为 `UIImage`，将其包装为 `PlatformStorableImage`，并通过 `onCapture` 提供名称、描述和 GPS 位置等元数据。
* 显示一个圆形的 Compose 可组合按钮以触发拍照。
* 在使用前置摄像头时应用镜像设置，以符合自然的自拍行为。
* 在 `layoutSubviews()` 中使用 `CATransaction` 动态更新预览布局以避免动画。

> 要在真机上进行测试，你需要在应用的 `Info.plist` 文件中添加 `NSCameraUsageDescription` 键。
> 如果未添加，应用在运行时将会崩溃。
>
{style="note"}

可在 [ImageViewer 示例项目](https://github.com/JetBrains/compose-multiplatform/tree/master/examples/imageviewer)中探索本示例的完整代码。

### Web 视图 {id="web-view"}

你可以在 Compose Multiplatform 中使用 UIKit 的 [`WKWebView`](https://developer.apple.com/documentation/webkit/wkwebview) 组件来实现 Web 视图。这允许你的应用程序在 UI 中显示 Web 内容并与之交互。
使用 Compose Multiplatform 中的 `Modifier.size()` 或 `Modifier.fillMaxSize()` 函数来设置组件大小：

```kotlin
UIKitView(
    factory = {
        WKWebView().apply {
            loadRequest(NSURLRequest(URL = NSURL(string = "https://www.jetbrains.com")))
        }
    },
    modifier = Modifier.size(300.dp)
)
```

现在，让我们看一个进阶示例。此代码通过导航代理配置 Web 视图，并允许 Kotlin 与 JavaScript 之间进行通信：

```kotlin
@Composable
fun WebViewWithDelegate(
    modifier: Modifier = Modifier,
    initialUrl: String = "https://www.jetbrains.com",
    onNavigationChange: (String) -> Unit = {}
) {
    // 创建一个代理以侦听导航事件
    val delegate = remember {
        object : NSObject(), WKNavigationDelegateProtocol {
            override fun webView(
                webView: WKWebView,
                didFinishNavigation: WKNavigation?
            ) {
                // 导航完成后更新当前 URL
                onNavigationChange(webView.URL?.absoluteString ?: "")
            }
        }
    }
    UIKitView(
        modifier = modifier,
        factory = {
            // 实例化 WKWebView 并设置其代理
            val webView = WKWebView().apply {
                navigationDelegate = delegate
                loadRequest(NSURLRequest(uRL = NSURL(string = initialUrl)))
            }
            webView
        },
        update = { webView ->
            // 如果 URL 更改，则重新加载网页
            if (webView.URL?.absoluteString != initialUrl) {
                webView.loadRequest(NSURLRequest(uRL = NSURL(string = initialUrl)))
            }
        }
    )
}
```

`WebViewWithDelegate` 可组合项执行以下任务：

* 创建一个实现 `WKNavigationDelegateProtocol` 接口的稳定代理对象。使用 Compose 的 `remember` 可以在重组之间记住该对象。
* 实例化 `WKWebView`，使用 `UIKitView` 将其嵌入，并通过分配已记住的代理对其进行配置。
* 加载由 `initialUrl` 形参提供的初始网页。
* 通过代理观察导航更改，并通过 `onNavigationChange` 回调传递当前 URL。
* 使用 `update` 形参观察请求 URL 的更改，并相应地重新加载网页。

## 下一步 {id="what-s-next"}

你还可以了解 Compose Multiplatform [与 SwiftUI 框架集成](compose-swiftui-integration.md)的方式。