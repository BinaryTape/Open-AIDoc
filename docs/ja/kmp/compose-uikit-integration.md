[//]: # (title: UIKitフレームワークとの統合)

<show-structure depth="3"/>

Compose Multiplatformは[UIKit](https://developer.apple.com/documentation/uikit)フレームワークと相互運用性があります。
UIKitアプリケーション内にCompose Multiplatformを埋め込むことも、Compose Multiplatform内にネイティブのUIKitコンポーネントを埋め込むこともできます。このページでは、UIKitアプリケーション内でCompose Multiplatformを使用する例と、Compose Multiplatform UI内にUIKitコンポーネントを埋め込む例の両方を紹介します。

> SwiftUIとの相互運用性については、[SwiftUIフレームワークとの統合](compose-swiftui-integration.md)の記事を参照してください。
>
{style="tip"}

## UIKitアプリケーション内でCompose Multiplatformを使用する {id="use-compose-multiplatform-inside-a-uikit-application"}

UIKitアプリケーション内でCompose Multiplatformを使用するには、任意の[コンテナビューコントローラ](https://developer.apple.com/documentation/uikit/view_controllers)にCompose Multiplatformコードを追加します。
この例では、`UITabBarController`クラス内でCompose Multiplatformを使用しています。

```swift
let composeViewController = Main_iosKt.ComposeOnly()
composeViewController.title = "Compose Multiplatform inside UIKit"

let anotherViewController = UIKitViewController()
anotherViewController.title = "UIKit"

// UITabBarControllerのセットアップ
let tabBarController = UITabBarController()
tabBarController.viewControllers = [
    // タイトルを設定するために、作成したViewControllerをUINavigationControllerでラップする
    UINavigationController(rootViewController: composeViewController),
    UINavigationController(rootViewController: anotherViewController)
]
tabBarController.tabBar.items?[0].title = "Compose"
tabBarController.tabBar.items?[1].title = "UIKit"
```

このコードを使用すると、アプリケーションは次のようになります。

![UIKit](uikit.png){width=300}

> Compose Multiplatformのレンダリングでは、高リフレッシュレートを明示的に有効にする必要があります。
> アプリの`Info.plist`ファイルに`CADisableMinimumFrameDurationOnPhone`キーを追加してください。
> これがないと、実行時にアプリがクラッシュします。
>
{style="note"}

このコードは[サンプルプロジェクト](https://github.com/JetBrains/compose-multiplatform/tree/master/examples/interop/ios-compose-in-uikit)で確認できます。

### コンテンツに合わせてComposeビューのサイズを調整する {id="size-compose-views-to-fit-their-content"}
<primary-label ref="EAP"/>

Composeビューは`sizeThatFits()`を介して優先サイズ（preferred size）を報告できます。
サイズ調整を別途設定する必要はありません。

このサイズ調整の例では、`main.ios.kt`で定義されたKotlin関数`MainComposeView()`を使用します。

```kotlin
fun MainComposeView(): UIView = ComposeUIView {
    Text(
        "This Compose view wraps text to fit the available width",
        modifier = Modifier.fillMaxWidth().padding(16.dp)
    )
}
```

Swiftコードでは、[Auto Layout](https://developer.apple.com/library/archive/documentation/UserExperience/Conceptual/AutolayoutPG/index.html)を使用してビューの幅を制約し、その幅を`sizeThatFits()`に渡します。
高さには`UIView.noIntrinsicMetric`を使用してComposeがコンテンツから高さを決定できるようにし、返された高さをビューの高さ制約（height constraint）を通じて適用します。

利用可能なスペースやコンテンツが変更された場合は、別のレイアウトパスをスケジュールして再計測し、制約を更新します。
アプリがComposeコンテンツを変更した場合は、Composeが変更を処理した後に`view.setNeedsLayout()`を呼び出します。

```swift
import UIKit

class ComposeContentViewController: UIViewController {
    // Kotlinファイル用に生成されたブリッジ名を使用
    // 例: main.ios.kt -> Main_iosKt
    private let composeView = Main_iosKt.MainComposeView()
    private var heightConstraint: NSLayoutConstraint!

    override func viewDidLoad() {
        super.viewDidLoad()

        composeView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(composeView)

        // Composeがコンテンツを計測するまでの暫定的な高さ
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

        // 初回結果はフォールバックの場合があるため、後続のレイアウトパスで再計測する
        let preferredSize = composeView.sizeThatFits(
            CGSize(
                // 固定の高さにする場合は、こことレイアウト制約で幅と高さを入れ替える
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

> Kotlin関数が`UIViewController`を返す場合は、それをコンテナビューコントローラに追加し、
> その`view`で`sizeThatFits()`を呼び出します。
>
{style="note"}

## Compose Multiplatform内でUIKitを使用する {id="use-uikit-inside-compose-multiplatform"}

Compose Multiplatform内でUIKit要素を使用するには、使用したいUIKit要素をCompose Multiplatformの[UIKitView](https://github.com/JetBrains/compose-multiplatform-core/blob/47c012bfe2d4570fb08432253298b8e2b6e38ade/compose/ui/ui/src/uikitMain/kotlin/androidx/compose/ui/interop/UIKitView.uikit.kt)に追加します。このコードは純粋にKotlinで記述することも、Swiftを併用することもできます。

### マップビュー {id="map-view"}

UIKitの[`MKMapView`](https://developer.apple.com/documentation/mapkit/mkmapview)コンポーネントを使用して、Compose Multiplatformでマップビューを実装できます。コンポーネントのサイズは、Compose Multiplatformの`Modifier.size()`または`Modifier.fillMaxSize()`関数を使用して設定します。

```kotlin
UIKitView(
    factory = { MKMapView() },
    modifier = Modifier.size(300.dp),
)
```

このコードを使用すると、アプリケーションは次のようになります。

![MapView](mapview.png){width=300}

次に、より高度な例を見てみましょう。このコードはUIKitの[`UITextField`](https://developer.apple.com/documentation/uikit/uitextfield/)をCompose Multiplatformでラップしています。

```kotlin
@OptIn(ExperimentalForeignApi::class)
@Composable
fun UseUITextField(modifier: Modifier = Modifier) {
    // Compose内のテキスト状態を保持する
    var message by remember { mutableStateOf("Hello, World!") }

    UIKitView(
        factory = {
            // Composeの状態と統合されたUITextFieldを作成する
            val textField = object : UITextField(CGRectMake(0.0, 0.0, 0.0, 0.0)) {
                @ObjCAction
                fun editingChanged() {
                    // UITextFieldのテキストが変更されたときにComposeの状態を更新する
                    message = text ?: ""
                }
            }
            // UITextField内のテキスト変更リスナーを追加する
            textField.addTarget(
                target = textField,
                action = NSSelectorFromString(textField::editingChanged.name),
                forControlEvents = UIControlEventEditingChanged
            )
            textField
        },
        modifier = modifier.fillMaxWidth().height(30.dp),
        update = { textField ->
            // Composeの状態からUITextFieldのテキストを更新する
            textField.text = message
        }
    )
}
```

* `factory`パラメータには、`UITextField`への変更を検知するための`editingChanged()`関数と`textField.addTarget()`リスナーが含まれています。
* `editingChanged()`関数には、Objective-Cコードと相互運用できるように`@ObjCAction`アノテーションが付与されています。
* `addTarget()`関数の`action`パラメータは`editingChanged()`関数の名前を渡し、`UIControlEventEditingChanged`イベントに応じてトリガーします。
* `UIKitView()`の`update`パラメータは、監視可能な`message`状態の値が変更されたときに呼び出されます。
* この関数は`UITextField`の`text`属性を更新し、ユーザーに更新後の値が表示されるようにします。

この例のコードは、[サンプルプロジェクト](https://github.com/JetBrains/compose-multiplatform/tree/master/examples/interop/ios-uikit-in-compose)で確認できます。

### カメラビュー {id="camera-view"}

Compose Multiplatformでは、UIKitの[`AVCaptureSession`](https://developer.apple.com/documentation/avfoundation/avcapturesession)および[`AVCaptureVideoPreviewLayer`](https://developer.apple.com/documentation/avfoundation/avcapturevideopreviewlayer)コンポーネントを使用してカメラビューを実装できます。

これにより、アプリケーションはデバイスのカメラにアクセスし、ライブプレビューを表示できるようになります。

基本的なカメラビューの実装例は以下のとおりです。

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

次に、より高度な例を見てみましょう。このコードは写真を撮影し、GPSメタデータを付加し、ネイティブの`UIView`を使用してライブプレビューを表示します。

```kotlin
@OptIn(ExperimentalForeignApi::class)
@Composable
fun RealDeviceCamera(
    camera: AVCaptureDevice,
    onCapture: (picture: PictureData.Camera, image: PlatformStorableImage) -> Unit
) {
    // 写真撮影用にAVCapturePhotoOutputを初期化
    val capturePhotoOutput = remember { AVCapturePhotoOutput() }
    // ...
    // 撮影コールバックのデリゲートを定義：画像データの処理、GPSの付加、onCaptureのセットアップ
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
    // 写真撮影用のAVCaptureSessionをセットアップ
    val captureSession: AVCaptureSession = remember {
        AVCaptureSession().also { captureSession ->
            captureSession.sessionPreset = AVCaptureSessionPresetPhoto
            val captureDeviceInput: AVCaptureDeviceInput =
                deviceInputWithDevice(device = camera, error = null)!!
            captureSession.addInput(captureDeviceInput)
            captureSession.addOutput(capturePhotoOutput)
        }
    }
    // カメラのライブプレビュー用のAVCaptureVideoPreviewLayerをセットアップ
    val cameraPreviewLayer = remember {
        AVCaptureVideoPreviewLayer(session = captureSession)
    }
    // ...
    // ネイティブのカメラプレビューレイヤーを持つネイティブUIViewを作成
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
    // 押下時にcapturePhotoWithSettingsコールバックを実行するComposeボタンを作成
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

`RealDeviceCamera`コンポーザブルは次のタスクを実行します。

* `AVCaptureSession`と`AVCaptureVideoPreviewLayer`を使用してネイティブのカメラプレビューをセットアップします。
* カスタム`UIView`サブクラスをホストする`UIKitView`を作成します。このサブクラスはレイアウトの更新を管理し、プレビューレイヤーを埋め込みます。
* `AVCapturePhotoOutput`を初期化し、写真撮影を処理するデリゲートを設定します。
* 撮影時のGPS座標を取得するために、`CLLocationManager`（`locationManager`経由）を使用します。
* 撮影した画像を`UIImage`に変換し、`PlatformStorableImage`としてラップして、名前、説明、GPS位置などのメタデータを`onCapture`経由で提供します。
* 撮影をトリガーするための円形のコンポーザブルボタンを表示します。
* フロントカメラ使用時に自然な自撮り動作となるよう、ミラーリング設定を適用します。
* アニメーションを回避するために`CATransaction`を使用して、`layoutSubviews()`内でプレビューレイアウトを動的に更新します。

> 実機でテストするには、アプリの`Info.plist`ファイルに`NSCameraUsageDescription`キーを追加する必要があります。
> これがないと、実行時にアプリがクラッシュします。
>
{style="note"}

この例の完全なコードは、[ImageViewerサンプルプロジェクト](https://github.com/JetBrains/compose-multiplatform/tree/master/examples/imageviewer)で確認できます。

### ウェブビュー {id="web-view"}

Compose Multiplatformでは、UIKitの[`WKWebView`](https://developer.apple.com/documentation/webkit/wkwebview)コンポーネントを使用してウェブビューを実装できます。これにより、アプリケーションはUI内でウェブコンテンツを表示し、操作できるようになります。
コンポーネントのサイズは、Compose Multiplatformの`Modifier.size()`または`Modifier.fillMaxSize()`関数を使用して設定します。

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
次に、より高度な例を見てみましょう。このコードはナビゲーションデリゲートを使用してウェブビューを設定し、KotlinとJavaScript間の通信を可能にします。

```kotlin
@Composable
fun WebViewWithDelegate(
    modifier: Modifier = Modifier,
    initialUrl: String = "https://www.jetbrains.com",
    onNavigationChange: (String) -> Unit = {}
) {
    // ナビゲーションイベントをリッスンするデリゲートを作成
    val delegate = remember {
        object : NSObject(), WKNavigationDelegateProtocol {
            override fun webView(
                webView: WKWebView,
                didFinishNavigation: WKNavigation?
            ) {
                // ナビゲーション完了後に現在のURLを更新
                onNavigationChange(webView.URL?.absoluteString ?: "")
            }
        }
    }
    UIKitView(
        modifier = modifier,
        factory = {
            // WKWebViewをインスタンス化してデリゲートを設定
            val webView = WKWebView().apply {
                navigationDelegate = delegate
                loadRequest(NSURLRequest(uRL = NSURL(string = initialUrl)))
            }
            webView
        },
        update = { webView ->
            // URLが変更された場合にウェブページをリロード
            if (webView.URL?.absoluteString != initialUrl) {
                webView.loadRequest(NSURLRequest(uRL = NSURL(string = initialUrl)))
            }
        }
    )
}
```

`WebViewWithDelegate`コンポーザブルは次のタスクを実行します。

* `WKNavigationDelegateProtocol`インターフェースを実装する安定したデリゲートオブジェクトを作成します。このオブジェクトは、Composeの`remember`を使用して再コンポジション間で保持されます。
* `WKWebView`をインスタンス化し、`UIKitView`を使用して埋め込み、記憶されたデリゲートを割り当てて設定します。
* `initialUrl`パラメータによって提供される初期ウェブページを読み込みます。
* デリゲート経由でナビゲーションの変更を監視し、`onNavigationChange`コールバックを通じて現在のURLを渡します。
* `update`パラメータを使用して要求されたURLの変更を監視し、それに応じてウェブページをリロードします。

## 次のステップ {id="what-s-next"}

Compose Multiplatformを[SwiftUIフレームワークと統合する](compose-swiftui-integration.md)方法についても確認できます。