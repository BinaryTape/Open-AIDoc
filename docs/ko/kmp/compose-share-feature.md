[//]: # (title: Compose Multiplatform에서 콘텐츠 공유하기)

Compose Multiplatform 앱에서는 텍스트, URL, 파일 및 기타 콘텐츠를 시스템이나 다른 앱과 공유할 수 있습니다. 

공유 기능은 플랫폼마다 다릅니다:

* Android와 iOS는 네이티브 시스템 공유 대화상자(share dialog)를 제공합니다.
* 데스크톱 애플리케이션은 일반적으로 범용 시스템 공유 대화상자가 없습니다. 일반적인 대안으로는 클립보드 사용, 기본 애플리케이션으로 파일이나 URL 열기, 또는 플랫폼별 API 호출 등이 있습니다.
* 웹 애플리케이션은 브라우저 지원 여부에 따라 [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API)를 사용할 수 있습니다.

Compose Multiplatform 앱에서 콘텐츠를 공유하려면 [커뮤니티 라이브러리](#community-libraries)를 사용하거나 [플랫폼별 API](#platform-specific-sharing-apis)를 직접 호출하세요.
어떤 플랫폼에서든 기본 연결 애플리케이션으로 링크를 열려면 [공통 `UriHandler` API](#related-features)를 사용하세요.

## 커뮤니티 라이브러리 {id="community-libraries"}

커뮤니티 라이브러리는 네이티브 공유 API를 래핑하여 `commonMain` 소스 세트에서 호출할 수 있는 공통 API를 제공합니다.

[KMP Sharing](https://klibs.io/project/software-mansion/kmp-sharing)은 Android 및 iOS의 시스템 공유 대화상자를 위한 공통 API를 제공합니다.
텍스트나 URL 공유를 지원하며, 선택적으로 파일 URI도 함께 공유할 수 있습니다:

```kotlin
val share = rememberShare()
val sharingOptions = SharingOptions(androidDialogTitle = "Share with")

Button(onClick = { share("https://kotlinlang.org", sharingOptions) }) {
    Text("Share link")
}

Button(onClick = { share("Kotlin programming language", sharingOptions) }) {
    Text("Share text")
}
```

[FileKit](https://klibs.io/project/vinceglb/FileKit)은 네이티브 대화상자를 통해 크로스 플랫폼 파일 선택, 저장 및 파일 작업을 제공합니다.
이 라이브러리들을 함께 사용할 수 있습니다. 예를 들어 FileKit으로 파일을 선택하고 KMP Sharing으로 공유할 수 있습니다:

```kotlin
val share = rememberShare()
val sharingOptions = SharingOptions(androidDialogTitle = "Share with")

val photosPicker = rememberFilePickerLauncher(
    type = FileKitType.Image,
    mode = FileKitMode.Multiple(),
    onError = {},
    onResult = { photos ->
        photos?.takeIf { it.isNotEmpty() }?.let { selectedPhotos ->
            share(selectedPhotos.map(PlatformFile::sharingUri), sharingOptions)
        }
    },
)

Button(onClick = photosPicker::launch) {
    Text("Pick and share photos")
}
```

KMP Sharing은 파일 값을 URI 형태로 요구합니다. FileKit에서 로컬 경로를 가져온 경우, 공유하기 전에 `PlatformFile` 경로를 URI로 변환하세요:
`commonMain`의 최상위(top level)에 이 헬퍼 함수를 정의합니다:

```kotlin
private fun PlatformFile.sharingUri(): String = path.let { filePath ->
    when {
        filePath.startsWith("content://") || filePath.startsWith("file://") -> filePath
        else -> "file://$filePath"
    }
}
```

[klibs.io](https://klibs.io/)에서 다른 라이브러리 옵션도 둘러보세요.
라이브러리에서 지원하지 않는 사용 사례의 경우, [플랫폼별 API](#platform-specific-sharing-apis)를 사용하여 직접 공유를 구현할 수 있습니다.

## 플랫폼별 공유 API {id="platform-specific-sharing-apis"}

콘텐츠 유형, 공유 옵션 또는 공유 플로우 등을 세부적으로 제어하기 위해 각 플랫폼의 네이티브 API를 사용하여 공유를 직접 구현할 수 있습니다.

### Android {id="android"}

`androidMain` 소스 세트에서 `ACTION_SEND` 인텐트를 사용하여 텍스트, URL 또는 파일을 공유합니다.
텍스트나 URL의 경우 `Intent.EXTRA_TEXT`로 콘텐츠를 전달합니다:

```kotlin
val intent = Intent(Intent.ACTION_SEND).apply {
    type = "text/plain"
    putExtra(Intent.EXTRA_TEXT, "https://kotlinlang.org")
}

context.startActivity(Intent.createChooser(intent, "Share with"))
```

파일을 공유하려면 `content://` URI를 사용하고 임시 읽기 권한을 부여하세요:

```kotlin
val intent = Intent(Intent.ACTION_SEND).apply {
    type = "image/jpeg"
    putExtra(Intent.EXTRA_STREAM, contentUri)
    addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
}

context.startActivity(Intent.createChooser(intent, "Share with"))
```

앱 전용 비공개 파일의 경우, `FileProvider`, `MediaStore` 또는 다른 콘텐츠 제공자(content provider)를 통해 파일을 노출하세요.
여러 파일의 경우, `Intent.EXTRA_STREAM`과 함께 `ACTION_SEND_MULTIPLE`을 사용하고 `ArrayList<Uri>`를 전달합니다:

```kotlin
val intent = Intent(Intent.ACTION_SEND_MULTIPLE).apply {
    type = "image/jpeg"
    putParcelableArrayListExtra(Intent.EXTRA_STREAM, ArrayList(contentUris))
    addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
}

context.startActivity(Intent.createChooser(intent, "Share with"))
```

자세한 내용은 Android Developers 페이지의 [앱 간에 데이터 공유](https://developer.android.com/develop/ui/compose/sharing)를 참조하세요.

### iOS {id="ios"}

[UIKit 기반 UI](compose-uikit-integration.md)의 경우 네이티브 `iosApp` 프로젝트에서 `UIActivityViewController`를 표시(present)합니다:

```swift
let items: [Any] = [URL(string: "https://kotlinlang.org")!]

let controller = UIActivityViewController(
    activityItems: items,
    applicationActivities: nil
)

viewController.present(controller, animated: true)
```

네이티브 앱의 [SwiftUI](compose-swiftui-integration.md) 코드에서는 `Transferable` 프로토콜을 지원하는 값에 대해 `ShareLink`를 사용할 수 있습니다.

커스텀 파일이나 대용량 파일의 경우 `Transferable` 표현을 구현하거나 플랫폼 브리지와 함께 `UIActivityViewController`를 사용하세요.

자세한 내용은 Apple Developer 페이지의 [Collaborating and sharing copies of your data](https://developer.apple.com/documentation/uikit/collaborating-and-sharing-copies-of-your-data)를 참조하세요.

### 데스크톱 {id="desktop"}

데스크톱 애플리케이션에는 범용 공유 대화상자가 없습니다. 일반적인 접근 방식은 다음과 같습니다:

* 콘텐츠를 클립보드에 복사.
* 기본 애플리케이션으로 파일 열기.
* 사용 가능한 공유 서비스 목록을 제공하는 macOS의 `NSSharingServicePicker` 클래스와 같은 플랫폼별 API 사용.

예를 들어 해당 파일 유형과 연결된 애플리케이션이 있는 경우 `java.awt.Desktop`을 사용하여 해당 애플리케이션에서 파일을 열 수 있습니다:

```kotlin
val file = java.io.File("/path/to/document.pdf")

if (java.awt.Desktop.isDesktopSupported()) {
    val desktop = java.awt.Desktop.getDesktop()
    if (desktop.isSupported(java.awt.Desktop.Action.OPEN)) {
        desktop.open(file)
    }
}
```

### 웹 {id="web"}

웹 애플리케이션은 브라우저 및 운영체제에서 지원하는 경우 [JavaScript interop](https://kotlinlang.org/docs/wasm-js-interop.html)을 통해 Web Share API를 사용할 수 있습니다.
일반적으로 HTTPS 환경과 버튼 클릭과 같은 사용자 제스처가 필요합니다.

API를 호출하기 전에 지원 여부를 확인하고, 콘텐츠를 클립보드에 복사하는 등의 대체 방안(fallback)을 제공하세요:

```javascript
if (navigator.share) {
    await navigator.share({
        title: "Kotlin",
        text: "Kotlin programming language",
        url: "https://kotlinlang.org"
    })
} else {
    await navigator.clipboard.writeText("https://kotlinlang.org")
}
```

파일의 경우 `navigator.canShare()`로 지원 여부를 확인합니다:

```javascript
if (navigator.canShare && navigator.canShare({ files })) {
    await navigator.share({
        files,
        title: "Photos"
    })
}
```

파일 공유 지원 여부는 브라우저, 플랫폼, 파일 형식 및 파일 크기에 따라 달라집니다.
파일을 공유할 수 없는 경우, 일반적인 대체 방안으로는 파일을 다운로드로 제공하거나 콘텐츠 링크를 대신 복사하도록 하는 방법 등이 있습니다.

## 관련 기능 {id="related-features"}

* **링크 및 딥링크 열기.** Compose Multiplatform은 `https://` 링크, 커스텀 애플리케이션 스킴, `mailto:`, `geo:` 등의 URI를 플랫폼에 열도록 요청할 수 있는 공통 API로 `UriHandler`를 제공합니다.
  `LocalUriHandler.current`로 핸들러를 가져오고 이벤트 핸들러에서 `openUri()`를 호출하세요:

  ```kotlin
  val uriHandler = LocalUriHandler.current

  Button(onClick = { uriHandler.openUri("mailto:user@example.com?subject=Hello") }) {
      Text("Send email")
  }
  ```
  
* **드래그 앤 드롭.** Compose Multiplatform은 콘텐츠를 대상 위치로 드래그하여 공유할 수 있는 공통 API를 제공합니다. [드래그 앤 드롭](compose-drag-drop.md)을 참조하세요.
* **클립보드.** Compose Multiplatform은 Jetpack Compose의 [Clipboard](https://developer.android.com/reference/kotlin/androidx/compose/ui/platform/Clipboard) 인터페이스를 지원합니다.
그러나 공통 코드에서의 클립보드 상호작용은 현재 제한적입니다. 진행 상황은 [CMP-7624](https://youtrack.jetbrains.com/issue/CMP-7624)에서 확인할 수 있습니다.