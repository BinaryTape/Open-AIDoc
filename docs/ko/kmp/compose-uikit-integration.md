[//]: # (title: UIKit 프레임워크와의 통합)

<show-structure depth="3"/>

Compose Multiplatform은 [UIKit](https://developer.apple.com/documentation/uikit) 프레임워크와 상호 운용(interoperable)이 가능합니다.
UIKit 애플리케이션 내에 Compose Multiplatform을 임베드할 수 있을 뿐만 아니라, Compose Multiplatform 내에 네이티브 UIKit 컴포넌트를 임베드할 수도 있습니다. 이 페이지에서는 UIKit 애플리케이션 내부에서 Compose Multiplatform을 사용하는 방법과 Compose Multiplatform UI 내부에서 UIKit 컴포넌트를 임베드하는 방법 모두에 대한 예제를 제공합니다.

> SwiftUI와의 상호 운용성에 대해 알아보려면 [SwiftUI 프레임워크와의 통합](compose-swiftui-integration.md) 문서를 참조하세요.
>
{style="tip"}

## UIKit 애플리케이션 내에서 Compose Multiplatform 사용하기 {id="use-compose-multiplatform-inside-a-uikit-application"}

UIKit 애플리케이션 내에서 Compose Multiplatform을 사용하려면 임의의 [컨테이너 뷰 컨트롤러(container view controller)](https://developer.apple.com/documentation/uikit/view_controllers)에 Compose Multiplatform 코드를 추가하세요.
다음 예제는 `UITabBarController` 클래스 내에서 Compose Multiplatform을 사용하는 방법을 보여줍니다.

```swift
let composeViewController = Main_iosKt.ComposeOnly()
composeViewController.title = "Compose Multiplatform inside UIKit"

let anotherViewController = UIKitViewController()
anotherViewController.title = "UIKit"

// UITabBarController 설정
let tabBarController = UITabBarController()
tabBarController.viewControllers = [
    // 타이틀 설정을 위해 생성된 ViewController들을 UINavigationController로 감쌉니다
    UINavigationController(rootViewController: composeViewController),
    UINavigationController(rootViewController: anotherViewController)
]
tabBarController.tabBar.items?[0].title = "Compose"
tabBarController.tabBar.items?[1].title = "UIKit"
```

이 코드를 실행하면 애플리케이션이 다음과 같이 표시됩니다.

![UIKit](uikit.png){width=300}

> Compose Multiplatform 렌더링을 위해서는 높은 화면 주사율(high refresh rate)이 명시적으로 활성화되어 있어야 합니다.
> 앱의 `Info.plist` 파일에 `CADisableMinimumFrameDurationOnPhone` 키를 추가하세요.
> 이 키가 없으면 런타임에 앱이 비정상 종료(crash)됩니다.
>
{style="note"}

[샘플 프로젝트](https://github.com/JetBrains/compose-multiplatform/tree/master/examples/interop/ios-compose-in-uikit)에서 이 코드를 직접 확인해 보세요.

### 콘텐츠 크기에 맞게 Compose 뷰 크기 조정하기 {id="size-compose-views-to-fit-their-content"}
<primary-label ref="EAP"/>

Compose 뷰는 `sizeThatFits()`를 통해 적합한 크기를 보고할 수 있습니다.
크기 조정을 별도로 구성할 필요가 없습니다.

이 크기 조정 예제는 `main.ios.kt`에 정의된 Kotlin 함수 `MainComposeView()`를 사용합니다.

```kotlin
fun MainComposeView(): UIView = ComposeUIView {
    Text(
        "This Compose view wraps text to fit the available width",
        modifier = Modifier.fillMaxWidth().padding(16.dp)
    )
}
```

Swift 코드에서는 [Auto Layout](https://developer.apple.com/library/archive/documentation/UserExperience/Conceptual/AutolayoutPG/index.html)을 사용하여 뷰의 너비(width)에 제약 조건을 설정하고 해당 너비를 `sizeThatFits()`에 전달합니다.
높이(height)에는 `UIView.noIntrinsicMetric`을 사용하여 Compose가 콘텐츠를 기반으로 높이를 결정하도록 한 다음, 반환된 높이를 뷰의 높이 제약 조건에 적용합니다.

사용 가능한 공간이나 콘텐츠가 변경되면 레이아웃 패스(layout pass)를 다시 예약하여 크기를 다시 측정하고 제약 조건을 업데이트하세요.
앱에서 Compose 콘텐츠를 변경하는 경우, Compose가 변경 사항을 처리한 후 `view.setNeedsLayout()`을 호출하세요.

```swift
import UIKit

class ComposeContentViewController: UIViewController {
    // Kotlin 파일에 대해 생성된 브리지 이름을 사용합니다
    // 예: main.ios.kt -> Main_iosKt
    private let composeView = Main_iosKt.MainComposeView()
    private var heightConstraint: NSLayoutConstraint!

    override func viewDidLoad() {
        super.viewDidLoad()

        composeView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(composeView)

        // Compose가 콘텐츠를 측정할 때까지의 임시 높이
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

        // 초기 결과는 대체 값(fallback)일 수 있으므로, 후속 레이아웃 패스에서 다시 측정합니다
        let preferredSize = composeView.sizeThatFits(
            CGSize(
                // 고정된 높이를 사용하려면 여기와 레이아웃 제약 조건에서 width와 height를 서로 바꿉니다
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

> Kotlin 함수가 `UIViewController`를 반환하는 경우, 컨테이너 뷰 컨트롤러에 추가하고 해당 뷰 컨트롤러의 `view`에서 `sizeThatFits()`를 호출하세요.
>
{style="note"}

## Compose Multiplatform 내에서 UIKit 사용하기 {id="use-uikit-inside-compose-multiplatform"}

Compose Multiplatform 내에서 UIKit 요소를 사용하려면, 사용하려는 UIKit 요소를 Compose Multiplatform의 [UIKitView](https://github.com/JetBrains/compose-multiplatform-core/blob/47c012bfe2d4570fb08432253298b8e2b6e38ade/compose/ui/ui/src/uikitMain/kotlin/androidx/compose/ui/interop/UIKitView.uikit.kt)에 추가하세요. 이 코드는 순수하게 Kotlin으로 작성할 수도 있고 Swift를 함께 사용할 수도 있습니다.

### 지도 뷰 (Map view) {id="map-view"}

UIKit의 [`MKMapView`](https://developer.apple.com/documentation/mapkit/mkmapview) 컴포넌트를 사용하여 Compose Multiplatform에서 지도 뷰를 구현할 수 있습니다. Compose Multiplatform의 `Modifier.size()` 또는 `Modifier.fillMaxSize()` 함수를 사용하여 컴포넌트 크기를 설정하세요.

```kotlin
UIKitView(
    factory = { MKMapView() },
    modifier = Modifier.size(300.dp),
)
```

이 코드를 실행하면 애플리케이션이 다음과 같이 표시됩니다.

![MapView](mapview.png){width=300}

이제 고급 예제를 살펴보겠습니다. 다음 코드는 UIKit의 [`UITextField`](https://developer.apple.com/documentation/uikit/uitextfield/)를 Compose Multiplatform으로 래핑합니다.

```kotlin
@OptIn(ExperimentalForeignApi::class)
@Composable
fun UseUITextField(modifier: Modifier = Modifier) {
    // Compose 내에서 텍스트 상태를 유지합니다
    var message by remember { mutableStateOf("Hello, World!") }

    UIKitView(
        factory = {
            // Compose 상태와 통합된 UITextField를 생성합니다
            val textField = object : UITextField(CGRectMake(0.0, 0.0, 0.0, 0.0)) {
                @ObjCAction
                fun editingChanged() {
                    // UITextField의 텍스트가 변경될 때 Compose 상태를 업데이트합니다
                    message = text ?: ""
                }
            }
            // UITextField 내의 텍스트 변경에 대한 리스너를 추가합니다
            textField.addTarget(
                target = textField,
                action = NSSelectorFromString(textField::editingChanged.name),
                forControlEvents = UIControlEventEditingChanged
            )
            textField
        },
        modifier = modifier.fillMaxWidth().height(30.dp),
        update = { textField ->
            // Compose 상태로부터 UITextField의 텍스트를 업데이트합니다
            textField.text = message
        }
    )
}
```

* `factory` 매개변수에는 `UITextField`의 모든 변경 사항을 감지하기 위한 `editingChanged()` 함수와 `textField.addTarget()` 리스너가 포함되어 있습니다.
* `editingChanged()` 함수에는 `@ObjCAction` 어노테이션이 붙어 있어 Objective-C 코드와 상호 운용할 수 있습니다.
* `addTarget()` 함수의 `action` 매개변수는 `editingChanged()` 함수의 이름을 전달하여 `UIControlEventEditingChanged` 이벤트에 대한 응답으로 이 함수를 트리거합니다.
* `UIKitView()`의 `update` 매개변수는 관찰 가능한 `message` 상태의 값이 변경될 때 호출됩니다.
* 이 함수는 사용자가 업데이트된 값을 볼 수 있도록 `UITextField`의 `text` 속성을 업데이트합니다.

[샘플 프로젝트](https://github.com/JetBrains/compose-multiplatform/tree/master/examples/interop/ios-uikit-in-compose)에서 이 예제의 코드를 살펴보세요.

### 카메라 뷰 (Camera view) {id="camera-view"}

UIKit의 [`AVCaptureSession`](https://developer.apple.com/documentation/avfoundation/avcapturesession) 및 [`AVCaptureVideoPreviewLayer`](https://developer.apple.com/documentation/avfoundation/avcapturevideopreviewlayer) 컴포넌트를 사용하여 Compose Multiplatform에서 카메라 뷰를 구현할 수 있습니다.

이를 통해 애플리케이션이 디바이스의 카메라에 접근하고 라이브 프리뷰를 표시할 수 있습니다.

다음은 기본 카메라 뷰를 구현하는 예제입니다.

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

이제 고급 예제를 살펴보겠습니다. 다음 코드는 사진을 캡처하고, GPS 메타데이터를 첨부하며, 네이티브 `UIView`를 사용하여 라이브 프리뷰를 표시합니다.

```kotlin
@OptIn(ExperimentalForeignApi::class)
@Composable
fun RealDeviceCamera(
    camera: AVCaptureDevice,
    onCapture: (picture: PictureData.Camera, image: PlatformStorableImage) -> Unit
) {
    // 사진 캡처를 위한 AVCapturePhotoOutput을 초기화합니다
    val capturePhotoOutput = remember { AVCapturePhotoOutput() }
    // ...
    // 캡처 콜백을 처리할 델리게이트를 정의합니다: 이미지 데이터 처리, GPS 첨부, onCapture 설정
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
    // 사진 캡처를 위한 AVCaptureSession을 설정합니다
    val captureSession: AVCaptureSession = remember {
        AVCaptureSession().also { captureSession ->
            captureSession.sessionPreset = AVCaptureSessionPresetPhoto
            val captureDeviceInput: AVCaptureDeviceInput =
                deviceInputWithDevice(device = camera, error = null)!!
            captureSession.addInput(captureDeviceInput)
            captureSession.addOutput(capturePhotoOutput)
        }
    }
    // 라이브 카메라 프리뷰를 위한 AVCaptureVideoPreviewLayer를 설정합니다
    val cameraPreviewLayer = remember {
        AVCaptureVideoPreviewLayer(session = captureSession)
    }
    // ...
    // 네이티브 카메라 프리뷰 레이어를 포함하는 네이티브 UIView를 생성합니다
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
    // 눌렀을 때 capturePhotoWithSettings 콜백을 실행하는 Compose 버튼을 생성합니다
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

`RealDeviceCamera` 컴포저블은 다음 작업을 수행합니다.

* `AVCaptureSession`과 `AVCaptureVideoPreviewLayer`를 사용하여 네이티브 카메라 프리뷰를 설정합니다.
* 레이아웃 업데이트를 관리하고 프리뷰 레이어를 임베드하는 커스텀 `UIView` 서브클래스를 호스팅하는 `UIKitView`를 생성합니다.
* `AVCapturePhotoOutput`을 초기화하고 사진 캡처를 처리할 델리게이트를 구성합니다.
* 캡처 시점에 GPS 좌표를 가져오기 위해 (`locationManager`를 통해) `CLLocationManager`를 사용합니다.
* 캡처된 이미지를 `UIImage`로 변환하고 `PlatformStorableImage`로 래핑한 뒤, `onCapture`를 통해 이름, 설명, GPS 위치와 같은 메타데이터를 제공합니다.
* 캡처를 트리거하는 원형 컴포저블 버튼을 표시합니다.
* 전면 카메라를 사용할 때 자연스러운 셀피 동작과 일치하도록 미러링 설정을 적용합니다.
* 애니메이션을 방지하기 위해 `CATransaction`을 사용하여 `layoutSubviews()`에서 프리뷰 레이아웃을 동적으로 업데이트합니다.

> 실제 디바이스에서 테스트하려면 앱의 `Info.plist` 파일에 `NSCameraUsageDescription` 키를 추가해야 합니다.
> 이 키가 없으면 런타임에 앱이 비정상 종료됩니다.
>
{style="note"}

[ImageViewer 샘플 프로젝트](https://github.com/JetBrains/compose-multiplatform/tree/master/examples/imageviewer)에서 이 예제의 전체 코드를 확인해 보세요.

### 웹 뷰 (Web view) {id="web-view"}

UIKit의 [`WKWebView`](https://developer.apple.com/documentation/webkit/wkwebview) 컴포넌트를 사용하여 Compose Multiplatform에서 웹 뷰를 구현할 수 있습니다. 이를 통해 애플리케이션의 UI 내에서 웹 콘텐츠를 표시하고 상호 작용할 수 있습니다.
Compose Multiplatform의 `Modifier.size()` 또는 `Modifier.fillMaxSize()` 함수를 사용하여 컴포넌트 크기를 설정하세요.

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
이제 고급 예제를 살펴보겠습니다. 다음 코드는 내비게이션 델리게이트(navigation delegate)로 웹 뷰를 구성하고 Kotlin과 JavaScript 간의 통신을 지원합니다.

```kotlin
@Composable
fun WebViewWithDelegate(
    modifier: Modifier = Modifier,
    initialUrl: String = "https://www.jetbrains.com",
    onNavigationChange: (String) -> Unit = {}
) {
    // 내비게이션 이벤트를 수신할 델리게이트를 생성합니다
    val delegate = remember {
        object : NSObject(), WKNavigationDelegateProtocol {
            override fun webView(
                webView: WKWebView,
                didFinishNavigation: WKNavigation?
            ) {
                // 내비게이션이 완료된 후 현재 URL을 업데이트합니다
                onNavigationChange(webView.URL?.absoluteString ?: "")
            }
        }
    }
    UIKitView(
        modifier = modifier,
        factory = {
            // WKWebView를 인스턴스화하고 델리게이트를 설정합니다
            val webView = WKWebView().apply {
                navigationDelegate = delegate
                loadRequest(NSURLRequest(uRL = NSURL(string = initialUrl)))
            }
            webView
        },
        update = { webView ->
            // URL이 변경되면 웹 페이지를 다시 로드합니다
            if (webView.URL?.absoluteString != initialUrl) {
                webView.loadRequest(NSURLRequest(uRL = NSURL(string = initialUrl)))
            }
        }
    )
}
```

`WebViewWithDelegate` 컴포저블은 다음 작업을 수행합니다.

* `WKNavigationDelegateProtocol` 인터페이스를 구현하는 안정적인 델리게이트 객체를 생성합니다.
  이 객체는 Compose의 `remember`를 사용하여 리컴포지션 간에 기억(remember)됩니다.
* `WKWebView`를 인스턴스화하고, `UIKitView`를 사용하여 임베드하며, 기억된 델리게이트를 할당하여 구성합니다.
* `initialUrl` 매개변수로 제공된 초기 웹 페이지를 로드합니다.
* 델리게이트를 통해 내비게이션 변경 사항을 관찰하고 `onNavigationChange` 콜백을 통해 현재 URL을 전달합니다.
* `update` 매개변수를 사용하여 요청된 URL의 변경 사항을 관찰하고 그에 따라 웹 페이지를 다시 로드합니다.

## 다음 단계 {id="what-s-next"}

Compose Multiplatform을 [SwiftUI 프레임워크와 통합](compose-swiftui-integration.md)하는 방법도 살펴볼 수 있습니다.