[//]: # (title: SwiftUI 프레임워크와의 연동)

<show-structure depth="3"/>

Compose Multiplatform은 [SwiftUI](https://developer.apple.com/swiftui/) 프레임워크와 상호 운용이 가능합니다.
SwiftUI 애플리케이션 내에 Compose Multiplatform을 삽입할 수 있을 뿐만 아니라, 네이티브 SwiftUI 컴포넌트를 Compose Multiplatform UI 내에 삽입할 수도 있습니다. 이 페이지에서는 SwiftUI 내부에서 Compose Multiplatform을 사용하는 방법과 Compose Multiplatform 앱 내부에 SwiftUI를 삽입하는 방법 모두에 대한 예제를 제공합니다.

> UIKit 상호 운용성에 대해 알아보려면 [UIKit 프레임워크와의 연동](compose-uikit-integration.md) 문서를 참조하세요.
>
{style="tip"}

## SwiftUI 애플리케이션 내부에서 Compose Multiplatform 사용하기 {id="use-compose-multiplatform-inside-a-swiftui-application"}

SwiftUI 애플리케이션 내부에서 Compose Multiplatform을 사용하려면 UIKit의 [`UIViewController`](https://developer.apple.com/documentation/uikit/uiviewcontroller/)를 반환하고 Compose Multiplatform 코드를 포함하는 Kotlin 함수 `MainViewController()`를 생성합니다.

```kotlin
fun MainViewController(): UIViewController =
    ComposeUIViewController {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("This is Compose code", fontSize = 20.sp)
        }
    }
```

[`ComposeUIViewController()`](https://github.com/JetBrains/compose-multiplatform-core/blob/5b487914cc20df24187f9ddf54534dfec30f6752/compose/ui/ui/src/uikitMain/kotlin/androidx/compose/ui/window/ComposeWindow.uikit.kt)는 composable 함수를 `content` 인자로 전달받는 Compose Multiplatform 라이브러리 함수입니다. 이렇게 전달된 함수는 `Text()`와 같은 다른 composable 함수를 호출할 수 있습니다.

> Compose Multiplatform 렌더링을 위해서는 높은 화면 주사율(High refresh rate)을 명시적으로 활성화해야 합니다.
> 앱의 `Info.plist` 파일에 `CADisableMinimumFrameDurationOnPhone` 키를 추가하세요.
> 이 키가 없으면 런타임에 앱이 비정상 종료(crash)됩니다.
>
{style="note"}

다음으로 SwiftUI에서 Compose Multiplatform을 표현할 구조체(structure)가 필요합니다.
`UIViewController` 인스턴스를 SwiftUI 뷰로 변환하는 다음 구조체를 생성합니다.

```swift
struct ComposeViewController: UIViewControllerRepresentable {
    func makeUIViewController(context: Context) -> UIViewController {
        return Main_iosKt.MainViewController()
    }

    func updateUIViewController(_ uiViewController: UIViewController, context: Context) {
    }
}
```

이제 다른 SwiftUI 코드에서 `ComposeViewController` 구조체를 사용할 수 있습니다.

`Main_iosKt.MainViewController`는 생성된 이름입니다. Swift에서 Kotlin 코드에 접근하는 방법에 대한 자세한 내용은 [Swift/Objective-C와의 상호 운용성](https://kotlinlang.org/docs/native-objc-interop.html#top-level-functions-and-properties) 페이지에서 확인할 수 있습니다.

완성되면 애플리케이션은 다음과 같이 표시됩니다.

![ComposeView](compose-view.png){width=300}

예제는 [샘플 프로젝트](https://github.com/JetBrains/compose-multiplatform/tree/master/examples/interop/ios-compose-in-swiftui)를 참조하세요.

### 콘텐츠 크기에 맞게 Compose 뷰 크기 조정하기 {id="size-compose-views-to-fit-their-content"}
<primary-label ref="EAP"/>

Compose 뷰는 SwiftUI의 크기 제안(sizing proposal)을 사용하여 콘텐츠를 측정하고 원하는 크기를 보고할 수 있습니다. 해당 크기가 변경되면 호스팅 `UIView`가 고유 콘텐츠 크기(intrinsic content size)를 무효화(invalidate)하여 SwiftUI가 레이아웃을 다시 실행하고 업데이트된 크기를 적용할 수 있도록 합니다.

`UIViewRepresentable` 예제의 경우, `main.ios.kt` 파일에 Kotlin 함수 `MainComposeView()`를 정의합니다.

```kotlin
fun MainComposeView(): UIView = ComposeUIView {
    Text(
        "This Compose view wraps text to fit the available width",
        modifier = Modifier.fillMaxWidth().padding(16.dp)
    )
}
```

#### iOS 16 이상 {id="on-ios-16-and-later"}

Swift 코드에서 SwiftUI의 크기 제안을 Compose 뷰의 `sizeThatFits()` 메서드에 전달합니다. SwiftUI가 지정하지 않은 치수에는 `UIView.noIntrinsicMetric`을 사용합니다.

이 섹션의 `Text`와 같이 맞추려는 치수에 맞춰 줄바꿈되거나 감싸지는 Compose 콘텐츠를 사용하세요.
[SwiftUI 애플리케이션 내부에서 Compose Multiplatform 사용하기](#use-compose-multiplatform-inside-a-swiftui-application)의 예제를 적용하는 경우, 해당 예제의 `Box(Modifier.fillMaxSize())`를 이 콘텐츠로 교체합니다.

이 `UIViewRepresentable` 예제는 고정 너비와 콘텐츠 기반 높이를 사용합니다.
높이를 고정하려면 `.frame(height: 100)`을 사용하고 `Modifier.fillMaxWidth()`를 제거하세요.

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
                // noIntrinsicMetric은 SwiftUI에서 지정하지 않은 치수임을 나타냅니다.
                width: proposal.width ?? UIView.noIntrinsicMetric,
                height: proposal.height ?? UIView.noIntrinsicMetric
            )
        )
    }
}

struct ContentView: View {
    var body: some View {
        // Kotlin 파일에 대해 생성된 브리지 이름을 사용합니다.
        // 예: main.ios.kt -> Main_iosKt
        ComposeView(makeComposeUIView: { Main_iosKt.MainComposeView() })
            .frame(width: 240)
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="func sizeThatFits(_ proposal: ProposedViewSize, uiView: UIView, context: Context)"}

##### 뷰 컨트롤러에 호스팅된 콘텐츠 크기 조정 {id="size-content-hosted-in-a-view-controller"}

[SwiftUI 애플리케이션 내부에서 Compose Multiplatform 사용하기](#use-compose-multiplatform-inside-a-swiftui-application)의 `MainViewController()` Kotlin 함수는 `UIView` 대신 `UIViewController`를 반환합니다.
iOS 16 이상에서 해당 콘텐츠의 크기를 조정하려면 먼저 `main.ios.kt`의 `MainViewController()`를 높이에 맞게 감싸는 콘텐츠를 사용하도록 업데이트합니다.

```kotlin
fun MainViewController(): UIViewController = ComposeUIViewController {
    Text(
        "This Compose view wraps text to fit the available width",
        modifier = Modifier.fillMaxWidth().padding(16.dp)
    )
}
```

Swift 코드에서는 SwiftUI에 컨트롤러를 삽입하기 위해 `UIViewControllerRepresentable`을 사용하는 예제의 `ComposeViewController` 래퍼(wrapper)를 업데이트합니다.
이 래퍼에 `sizeThatFits(_:uiViewController:context:)`를 추가하고 SwiftUI의 크기 제안을 컨트롤러의 Compose 뷰로 전달합니다.

```swift
struct ComposeViewController: UIViewControllerRepresentable {
    func makeUIViewController(context: Context) -> UIViewController {
        // Kotlin 파일에 대해 생성된 브리지 이름을 사용합니다.
        // 예: main.ios.kt -> Main_iosKt
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
                // noIntrinsicMetric은 SwiftUI에서 지정하지 않은 치수임을 나타냅니다.
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

고정된 너비가 텍스트를 제한하고, SwiftUI는 보고된 높이를 사용하여 콘텐츠에 맞춥니다.

#### iOS 16 이전 {collapsible="true" id="before-ios-16"}

SwiftUI 앱이 iOS 16 이전 버전에서 실행되어야 하는 경우, `main.ios.kt`의 `MainComposeView()`에 대한 고유 콘텐츠 크기를 보고하도록 설정합니다.

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

이 예제는 고정 너비를 사용하고 Compose 콘텐츠가 높이를 결정하도록 합니다.
Swift 코드에서는 `updateUIView()`의 `sizeThatFits()`에 너비를 전달하고, SwiftUI 프레임에도 동일한 너비를 사용합니다. SwiftUI는 `intrinsicContentSize`를 통해 결과 크기를 읽습니다.

```swift
struct IntrinsicComposeView: UIViewRepresentable {
    let makeComposeUIView: () -> UIView
    let width: CGFloat

    func makeUIView(context: Context) -> UIView {
        makeComposeUIView()
    }

    func updateUIView(_ uiView: UIView, context: Context) {
        _ = uiView.sizeThatFits(
            // noIntrinsicMetric은 SwiftUI에서 지정하지 않은 치수임을 나타냅니다.
            CGSize(width: width, height: UIView.noIntrinsicMetric)
        )
    }
}

struct ContentView: View {
    private let width: CGFloat = 240

    var body: some View {
        // Kotlin 파일에 대해 생성된 브리지 이름을 사용합니다.
        // 예: main.ios.kt -> Main_iosKt
        IntrinsicComposeView(
            makeComposeUIView: { Main_iosKt.MainComposeView() },
            width: width
        )
        .frame(width: width)
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="uiView.sizeThatFits(CGSize(width: width, height: UIView.noIntrinsicMetric)"}

고정 높이를 사용하려면 크기 제안 및 SwiftUI 프레임에서 너비와 높이를 서로 바꿉니다.

## Compose Multiplatform 내부에서 SwiftUI 사용하기 {id="use-swiftui-inside-compose-multiplatform"}

Compose Multiplatform 내부에서 SwiftUI를 사용하려면 중개 역할을 하는 [`UIViewController`](https://developer.apple.com/documentation/uikit/uiviewcontroller/)에 Swift 코드를 추가합니다. 현재는 Kotlin에서 직접 SwiftUI 구조체를 작성할 수 없습니다. 대신 Swift로 작성한 다음 Kotlin 함수로 전달해야 합니다.

시작하려면 엔트리 포인트 함수에 `ComposeUIViewController` 컴포넌트를 생성하기 위한 인자를 추가합니다.

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

Swift 코드에서 `createUIViewController`를 엔트리 포인트 함수에 전달합니다. `UIHostingController` 인스턴스를 사용하여 SwiftUI 뷰를 감쌀 수 있습니다.

```swift
Main_iosKt.ComposeEntryPointWithUIViewController(createUIViewController: { () -> UIViewController in
    let swiftUIView = VStack {
        Text("SwiftUI in Compose Multiplatform")
    }
    return UIHostingController(rootView: swiftUIView)
})
```

완성되면 애플리케이션은 다음과 같이 표시됩니다.

![UIView](uiview.png){width=300}

이 예제의 코드는 [샘플 프로젝트](https://github.com/JetBrains/compose-multiplatform/tree/master/examples/interop/ios-swiftui-in-compose)에서 살펴볼 수 있습니다.

### 지도 뷰 (Map view) {id="map-view"}

SwiftUI의 [`Map`](https://developer.apple.com/documentation/mapkit/map) 컴포넌트를 사용하여 Compose Multiplatform에서 지도 뷰를 구현할 수 있습니다. 이를 통해 애플리케이션에 상호 작용이 가능한 SwiftUI 지도를 표시할 수 있습니다.

동일한 [Kotlin 엔트리 포인트 함수](#use-swiftui-inside-compose-multiplatform)에 대해 Swift에서 `UIHostingController`를 사용하여 `Map` 뷰를 감싸는 `UIViewController`를 전달합니다.

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

이제 더 발전된 예제를 살펴보겠습니다. 다음 코드는 SwiftUI 지도에 커스텀 어노테이션(annotation)을 추가하고 Swift에서 뷰 상태를 업데이트할 수 있도록 합니다.

```swift
import SwiftUI
import MapKit

struct AnnotatedMapView: View {
    // 지도 영역 상태 관리
    @State private var region = MKCoordinateRegion(
        center: CLLocationCoordinate2D(latitude: 51.5074, longitude: -0.1278),
        span: MKCoordinateSpan(latitudeDelta: 0.1, longitudeDelta: 0.1)
    )
    // 커스텀 어노테이션이 있는 지도를 표시
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

그런 다음 이 어노테이션이 포함된 지도를 `UIHostingController`로 감싸 Compose Multiplatform 코드에 전달할 수 있습니다.

```swift
Main_iosKt.ComposeEntryPointWithUIViewController(createUIViewController: {
    return UIHostingController(rootView: AnnotatedMapView())
})
```

`AnnotatedMapView`는 다음 작업을 수행합니다.

* SwiftUI `Map` 뷰를 정의하고 이를 `AnnotatedMapView`라는 커스텀 뷰 내에 삽입합니다.
* `@State` 및 `MKCoordinateRegion`을 사용하여 지도 위치에 대한 내부 상태를 관리함으로써 Compose Multiplatform이 대화형의 상태 인식 지도를 표시할 수 있도록 합니다.
* SwiftUI에서 어노테이션에 필요한 `Identifiable`을 준수하는 정적 `Landmark` 모델을 사용하여 지도에 `MapMarker`를 표시합니다.
* `annotationItems`를 사용하여 지도에 커스텀 마커를 선언적으로 배치합니다.
* SwiftUI 컴포넌트를 `UIHostingController` 내에 감싼 후, 이를 `UIViewController`로서 Compose Multiplatform에 전달합니다.

### 카메라 뷰 (Camera view) {id="camera-view"}

SwiftUI 및 UIKit의 [`UIImagePickerController`](https://developer.apple.com/documentation/uikit/uiimagepickercontroller)를 SwiftUI 호환 컴포넌트로 감싸 Compose Multiplatform에서 카메라 뷰를 구현할 수 있습니다. 이를 통해 애플리케이션에서 시스템 카메라를 실행하고 사진을 캡처할 수 있습니다.

동일한 [Kotlin 엔트리 포인트 함수](#use-swiftui-inside-compose-multiplatform)에 대해 Swift에서 `UIImagePickerController`를 사용하는 기본 `CameraView`를 정의하고 `UIHostingController`를 사용하여 삽입합니다.

```swift
Main_iosKt.ComposeEntryPointWithUIViewController(createUIViewController: {
    return UIHostingController(rootView: CameraView { image in
        // 캡처된 이미지를 여기서 처리합니다.
    })
})
```

이 코드가 작동하도록 `CameraView`를 다음과 같이 정의합니다.

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

이제 더 발전된 예제를 살펴보겠습니다. 다음 코드는 카메라 뷰를 표시하고 캡처된 이미지의 썸네일을 동일한 SwiftUI 뷰에 표시합니다.

```swift
import SwiftUI
import UIKit

struct CameraPreview: View {
    // 카메라 시트 표시 여부를 제어
    @State private var showCamera = false
    // 캡처된 이미지를 저장
    @State private var capturedImage: UIImage?

    var body: some View {
        VStack {
            if let image = capturedImage {
                // 캡처된 이미지를 표시
                Image(uiImage: image)
                    .resizable()
                    .scaledToFit()
                    .frame(height: 200)
            } else {
                // 캡처된 이미지가 없을 때 대체 텍스트 표시
                Text("No image captured")
            }

            // 카메라를 여는 버튼 추가
            Button("Open Camera") {
                showCamera = true
            }
            // CameraView를 모달 시트로 표시
            .sheet(isPresented: $showCamera) {
                CameraView { image in
                    capturedImage = image
                }
            }
        }
    }
}
```

`CameraPreview` 뷰는 다음 작업을 수행합니다.

* 사용자가 버튼을 탭하면 모달 `.sheet`로 `CameraView`를 표시합니다.
* `@State` 프로퍼티 래퍼를 사용하여 캡처된 이미지를 저장하고 표시합니다.
* SwiftUI의 네이티브 `Image` 뷰를 삽입하여 사진을 미리 봅니다.
* 이전과 동일한 `UIViewControllerRepresentable` 기반의 `CameraView`를 재사용하면서 SwiftUI 상태 시스템에 더욱 긴밀하게 통합합니다.

> 실제 기기에서 테스트하려면 앱의 `Info.plist` 파일에 `NSCameraUsageDescription` 키를 추가해야 합니다.
> 이 키가 없으면 런타임에 앱이 비정상 종료(crash)됩니다.
>
{style="note"}

### 웹 뷰 (Web view) {id="web-view"}

UIKit의 [`WKWebView`](https://developer.apple.com/documentation/webkit/wkwebview) 컴포넌트를 `UIViewRepresentable`로 감싸 SwiftUI를 통해 Compose Multiplatform에서 웹 뷰를 구현할 수 있습니다. 이를 통해 완전한 네이티브 렌더링으로 임베디드 웹 콘텐츠를 표시할 수 있습니다.

동일한 [Kotlin 엔트리 포인트 함수](#use-swiftui-inside-compose-multiplatform)에 대해 Swift에서 `UIHostingController`를 사용하여 삽입된 기본 `WebView`를 정의합니다.

```swift
Main_iosKt.ComposeEntryPointWithUIViewController(createUIViewController: {
    let url = URL(string: "https://www.jetbrains.com")!
    return UIHostingController(rootView: WebView(url: url))
})
```

이제 더 발전된 예제를 살펴보겠습니다. 다음 코드는 웹 뷰에 내비게이션 추적 및 로딩 상태 표시 기능을 추가합니다.

```swift
import SwiftUI
import UIKit
import WebKit

struct AdvancedWebView: UIViewRepresentable {
    let url: URL
    @Binding var isLoading: Bool
    @Binding var currentURL: String

    // 내비게이션 델리게이트가 있는 WKWebView 생성
    func makeUIView(context: Context) -> WKWebView {
        let webView = WKWebView()
        webView.navigationDelegate = context.coordinator
        webView.load(URLRequest(url: url))
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    // 웹 내비게이션 이벤트를 처리할 코디네이터 생성 
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

        // URL을 업데이트하고 로딩이 완료되었음을 표시
        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation?) {
            isLoading = false
            currentURL = webView.url?.absoluteString ?? ""
        }
    }
}
```

SwiftUI 뷰에서 다음과 같이 사용합니다.

```swift
struct WebViewContainer: View {
    // 웹 뷰의 로딩 상태 추적
    @State private var isLoading = false
    // 표시 중인 현재 URL 추적
    @State private var currentURL = ""

    var body: some View {
        VStack {
            // 로딩 중일 때 로딩 인디케이터 표시
            if isLoading {
                ProgressView()
            }
            // 현재 URL 표시
            Text("URL: \(currentURL)")
                .font(.caption)
                .lineLimit(1)
                .truncationMode(.middle)

            // 고급 웹 뷰 삽입
            AdvancedWebView(
                url: URL(string: "https://www.jetbrains.com")!,
                isLoading: $isLoading,
                currentURL: $currentURL
            )
        }
    }
}
```

`AdvancedWebView` 및 `WebViewContainer`는 다음 작업을 수행합니다.

* 로딩 진행률 및 URL 변경을 추적하기 위해 커스텀 내비게이션 델리게이트가 포함된 `WKWebView`를 생성합니다.
* SwiftUI의 `@State` 바인딩을 사용하여 내비게이션 이벤트에 따라 UI를 동적으로 업데이트합니다.
* 페이지가 로딩되는 동안 `ProgressView` 스피너를 표시합니다.
* `Text` 컴포넌트를 사용하여 뷰 상단에 현재 URL을 표시합니다.
* `UIHostingController`를 사용하여 이 컴포넌트를 Compose UI에 통합합니다.

## 다음 단계 {id="what-s-next"}

* Compose가 화면 콘텐츠를 렌더링하는 동안 [시스템 렌더링 Liquid Glass 효과를 위해 네이티브 SwiftUI 내비게이션을 사용하는 방법](ios-liquid-glass.md)을 알아보세요.
* Compose Multiplatform을 [UIKit 프레임워크와 연동](compose-uikit-integration.md)하는 방법을 살펴보세요.