[//]: # (title: 與 UIKit 架構整合)

<show-structure depth="3"/>

Compose Multiplatform 可與 [UIKit](https://developer.apple.com/documentation/uikit) 架構互通。
你可以將 Compose Multiplatform 嵌入到 UIKit 應用程式中，也可以將原生 UIKit 元件嵌入到 Compose Multiplatform 中。本頁提供了在 UIKit 應用程式中使用 Compose Multiplatform，以及在 Compose Multiplatform UI 中嵌入 UIKit 元件的範例。

> 若要了解 SwiftUI 的互通性，請參閱[與 SwiftUI 架構整合](compose-swiftui-integration.md)一文。
>
{style="tip"}

## 在 UIKit 應用程式中使用 Compose Multiplatform {id="use-compose-multiplatform-inside-a-uikit-application"}

若要在 UIKit 應用程式中使用 Compose Multiplatform，請將你的 Compose Multiplatform 程式碼新增至任何 [容器檢視控制器 (container view controller)](https://developer.apple.com/documentation/uikit/view_controllers) 中。
此範例在 `UITabBarController` 類別中使用 Compose Multiplatform：

```swift
let composeViewController = Main_iosKt.ComposeOnly()
composeViewController.title = "Compose Multiplatform inside UIKit"

let anotherViewController = UIKitViewController()
anotherViewController.title = "UIKit"

// 設定 UITabBarController
let tabBarController = UITabBarController()
tabBarController.viewControllers = [
    // 將建立的 ViewControllers 包裝在 UINavigationController 中以設定標題
    UINavigationController(rootViewController: composeViewController),
    UINavigationController(rootViewController: anotherViewController)
]
tabBarController.tabBar.items?[0].title = "Compose"
tabBarController.tabBar.items?[1].title = "UIKit"
```

透過這段程式碼，你的應用程式外觀應如下所示：

![UIKit](uikit.png){width=300}

> Compose Multiplatform 算繪需要明確啟用高更新率：
> 請將 `CADisableMinimumFrameDurationOnPhone` 鍵新增至應用程式的 `Info.plist` 檔案中。
> 若缺少此設定，應用程式將在執行時期當機。
>
{style="note"}

在[範例專案](https://github.com/JetBrains/compose-multiplatform/tree/master/examples/interop/ios-compose-in-uikit)中探索此程式碼。

### 調整 Compose 檢視大小以符合其內容 {id="size-compose-views-to-fit-their-content"}
<primary-label ref="EAP"/>

Compose 檢視可以透過 `sizeThatFits()` 回報其慣用大小。
你不需要單獨設定尺寸大小。

此尺寸調整範例使用了定義在 `main.ios.kt` 中的 Kotlin 函式 `MainComposeView()`：

```kotlin
fun MainComposeView(): UIView = ComposeUIView {
    Text(
        "This Compose view wraps text to fit the available width",
        modifier = Modifier.fillMaxWidth().padding(16.dp)
    )
}
```

在你的 Swift 程式碼中，使用 [Auto Layout](https://developer.apple.com/library/archive/documentation/UserExperience/Conceptual/AutolayoutPG/index.html) 約束檢視的寬度，並將該寬度傳遞給 `sizeThatFits()`。
高度方面請使用 `UIView.noIntrinsicMetric` 讓 Compose 根據內容來決定，然後透過檢視的高度約束套用回傳的高度。

當可用空間或內容發生變更時，排定另一次版面配置流程（layout pass）以重新測量並更新約束。
如果你的應用程式變更了 Compose 內容，請在 Compose 處理變更後呼叫 `view.setNeedsLayout()`。

```swift
import UIKit

class ComposeContentViewController: UIViewController {
    // 使用為 Kotlin 檔案產生的橋接名稱
    // 例如：main.ios.kt -> Main_iosKt
    private let composeView = Main_iosKt.MainComposeView()
    private var heightConstraint: NSLayoutConstraint!

    override func viewDidLoad() {
        super.viewDidLoad()

        composeView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(composeView)

        // 臨時高度，直到 Compose 完成其內容測量
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

        // 初始結果可能是備援值；在後續的版面配置流程中重新測量
        let preferredSize = composeView.sizeThatFits(
            CGSize(
                // 若要使用固定高度，請在此處與版面配置約束中交換寬度和高度
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

> 如果你的 Kotlin 函式回傳 `UIViewController`，請將其新增至容器檢視控制器中，並在其 `view` 上呼叫 `sizeThatFits()`。
>
{style="note"}

## 在 Compose Multiplatform 中使用 UIKit {id="use-uikit-inside-compose-multiplatform"}

若要在 Compose Multiplatform 中使用 UIKit 元素，請將你想要使用的 UIKit 元素新增至 Compose Multiplatform 的 [UIKitView](https://github.com/JetBrains/compose-multiplatform-core/blob/47c012bfe2d4570fb08432253298b8e2b6e38ade/compose/ui/ui/src/uikitMain/kotlin/androidx/compose/ui/interop/UIKitView.uikit.kt) 中。你可以純粹使用 Kotlin 編寫這段程式碼，也可以同時使用 Swift。

### 地圖檢視 (Map view) {id="map-view"}

你可以使用 UIKit 的 [`MKMapView`](https://developer.apple.com/documentation/mapkit/mkmapview) 組建在 Compose Multiplatform 中實作地圖檢視。藉由使用 Compose Multiplatform 的 `Modifier.size()` 或 `Modifier.fillMaxSize()` 函式來設定組建尺寸：

```kotlin
UIKitView(
    factory = { MKMapView() },
    modifier = Modifier.size(300.dp),
)
```

透過這段程式碼，你的應用程式外觀應如下所示：

![MapView](mapview.png){width=300}

現在，讓我們來看一個進階範例。這段程式碼在 Compose Multiplatform 中包裝了 UIKit 的 [`UITextField`](https://developer.apple.com/documentation/uikit/uitextfield/)：

```kotlin
@OptIn(ExperimentalForeignApi::class)
@Composable
fun UseUITextField(modifier: Modifier = Modifier) {
    // 在 Compose 中保留文字的狀態
    var message by remember { mutableStateOf("Hello, World!") }

    UIKitView(
        factory = {
            // 建立與 Compose 狀態整合的 UITextField
            val textField = object : UITextField(CGRectMake(0.0, 0.0, 0.0, 0.0)) {
                @ObjCAction
                fun editingChanged() {
                    // 當 UITextField 中的文字變更時更新 Compose 狀態
                    message = text ?: ""
                }
            }
            // 新增接聽器以偵測 UITextField 內的文字變更
            textField.addTarget(
                target = textField,
                action = NSSelectorFromString(textField::editingChanged.name),
                forControlEvents = UIControlEventEditingChanged
            )
            textField
        },
        modifier = modifier.fillMaxWidth().height(30.dp),
        update = { textField ->
            // 從 Compose 狀態更新 UITextField 文字
            textField.text = message
        }
    )
}
```

* `factory` 參數包含 `editingChanged()` 函式與 `textField.addTarget()` 接聽器，用以偵測 `UITextField` 的任何變更。
* `editingChanged()` 函式帶有 `@ObjCAction` 註解，以便它可以與 Objective-C 程式碼互通。
* `addTarget()` 函式的 `action` 參數傳遞了 `editingChanged()` 函式的名稱，觸發它以回應 `UIControlEventEditingChanged` 事件。
* 當可觀察的 `message` 狀態變更其值時，會呼叫 `UIKitView()` 的 `update` 參數。
* 該函式會更新 `UITextField` 的 `text` 屬性，以便使用者看見更新後的值。

在我們的[範例專案](https://github.com/JetBrains/compose-multiplatform/tree/master/examples/interop/ios-uikit-in-compose)中探索此範例的程式碼。

### 相機檢視 (Camera view) {id="camera-view"}

你可以使用 UIKit 的 [`AVCaptureSession`](https://developer.apple.com/documentation/avfoundation/avcapturesession) 與 [`AVCaptureVideoPreviewLayer`](https://developer.apple.com/documentation/avfoundation/avcapturevideopreviewlayer) 組建在 Compose Multiplatform 中實作相機檢視。

這允許你的應用程式存取裝置的相機並顯示即時預覽。

以下是如何實作基本相機檢視的範例：

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

現在，讓我們來看一個進階範例。這段程式碼拍攝了一張照片，附加了 GPS 元資料，並使用原生 `UIView` 顯示即時預覽：

```kotlin
@OptIn(ExperimentalForeignApi::class)
@Composable
fun RealDeviceCamera(
    camera: AVCaptureDevice,
    onCapture: (picture: PictureData.Camera, image: PlatformStorableImage) -> Unit
) {
    // 初始化 AVCapturePhotoOutput 以進行照片拍攝
    val capturePhotoOutput = remember { AVCapturePhotoOutput() }
    // ...
    // 定義委派以處理拍攝回呼：處理影像資料、附加 GPS、設定 onCapture
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
    // 為照片拍攝設定 AVCaptureSession
    val captureSession: AVCaptureSession = remember {
        AVCaptureSession().also { captureSession ->
            captureSession.sessionPreset = AVCaptureSessionPresetPhoto
            val captureDeviceInput: AVCaptureDeviceInput =
                deviceInputWithDevice(device = camera, error = null)!!
            captureSession.addInput(captureDeviceInput)
            captureSession.addOutput(capturePhotoOutput)
        }
    }
    // 為即時相機預覽設定 AVCaptureVideoPreviewLayer
    val cameraPreviewLayer = remember {
        AVCaptureVideoPreviewLayer(session = captureSession)
    }
    // ...
    // 建立帶有原生相機預覽圖層的原生 UIView
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
    // 建立一個 Compose 按鈕，按下時執行 capturePhotoWithSettings 回呼
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

`RealDeviceCamera` composable 執行下列工作：

* 使用 `AVCaptureSession` 和 `AVCaptureVideoPreviewLayer` 設定原生相機預覽。
* 建立一個託管自訂 `UIView` 子類別的 `UIKitView`，用於管理版面配置更新並嵌入預覽圖層。
* 初始化 `AVCapturePhotoOutput` 並設定一個委派來處理照片拍攝。
* 使用 `CLLocationManager`（透過 `locationManager`）在拍攝當下擷取 GPS 座標。
* 將拍攝到的影像轉換為 `UIImage`，包裝為 `PlatformStorableImage`，並透過 `onCapture` 提供名稱、描述和 GPS 位置等元資料。
* 顯示用於觸發拍攝的圓形可組合項按鈕。
* 在使用前置相機時套用鏡像設定，以符合自然的自拍行為。
* 在 `layoutSubviews()` 中使用 `CATransaction` 動態更新預覽版面配置以避免動畫。

> 若要在實體裝置上進行測試，你需要將 `NSCameraUsageDescription` 鍵新增至應用程式的 `Info.plist` 檔案中。
> 若缺少此設定，應用程式將在執行時期當機。
>
{style="note"}

在 [ImageViewer 範例專案](https://github.com/JetBrains/compose-multiplatform/tree/master/examples/imageviewer)中探索此範例的完整程式碼。

### 網頁檢視 (Web view) {id="web-view"}

你可以使用 UIKit 的 [`WKWebView`](https://developer.apple.com/documentation/webkit/wkwebview) 組建在 Compose Multiplatform 中實作網頁檢視。這允許你的應用程式在 UI 內顯示網頁內容並與其互動。
藉由使用 Compose Multiplatform 的 `Modifier.size()` 或 `Modifier.fillMaxSize()` 函式來設定組建尺寸：

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
現在，讓我們來看一個進階範例。這段程式碼使用導覽委派設定網頁檢視，並允許 Kotlin 和 JavaScript 之間進行通訊：

```kotlin
@Composable
fun WebViewWithDelegate(
    modifier: Modifier = Modifier,
    initialUrl: String = "https://www.jetbrains.com",
    onNavigationChange: (String) -> Unit = {}
) {
    // 建立一個接聽導覽事件的委派
    val delegate = remember {
        object : NSObject(), WKNavigationDelegateProtocol {
            override fun webView(
                webView: WKWebView,
                didFinishNavigation: WKNavigation?
            ) {
                // 導覽完成後更新當前 URL
                onNavigationChange(webView.URL?.absoluteString ?: "")
            }
        }
    }
    UIKitView(
        modifier = modifier,
        factory = {
            // 具現化 WKWebView 並設定其委派
            val webView = WKWebView().apply {
                navigationDelegate = delegate
                loadRequest(NSURLRequest(uRL = NSURL(string = initialUrl)))
            }
            webView
        },
        update = { webView ->
            // 如果 URL 發生變更，則重新載入網頁
            if (webView.URL?.absoluteString != initialUrl) {
                webView.loadRequest(NSURLRequest(uRL = NSURL(string = initialUrl)))
            }
        }
    )
}
```

`WebViewWithDelegate` composable 執行下列工作：

* 建立一個實作 `WKNavigationDelegateProtocol` 介面的穩定委派物件。
  此物件使用 Compose 的 `remember` 在重組（recomposition）之間保留。
* 具現化一個 `WKWebView`，使用 `UIKitView` 將其嵌入，並透過指派已記住的委派對其進行設定。
* 載入由 `initialUrl` 參數提供的初始網頁。
* 透過委派觀察導覽變更，並透過 `onNavigationChange` 回呼傳遞當前 URL。
* 使用 `update` 參數觀察所要求 URL 的變更，並相應地重新載入網頁。

## 後續步驟 {id="what-s-next"}

你也可以探索 Compose Multiplatform [與 SwiftUI 架構整合](compose-swiftui-integration.md)的方式。