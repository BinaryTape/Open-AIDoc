[//]: # (title: 在 Compose Multiplatform 中共享内容)

在 Compose Multiplatform 应用中，你可以与系统或其他应用共享文本、URL、文件及其他内容。

各平台之间的共享能力有所不同：

* Android 与 iOS 提供原生的系统共享对话框。
* 桌面应用程序通常没有通用的系统共享对话框。常见的替代方案包括使用剪贴板、通过默认应用程序打开文件或 URL，或者调用平台专用的 API。
* Web 应用程序可以使用 [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API)（取决于浏览器支持情况）。

要在 Compose Multiplatform 应用中共享内容，可以使用[社区库](#community-libraries)或直接调用[平台专用 API](#platform-specific-sharing-apis)。
要在任意平台上通过默认关联的应用程序打开链接，请使用[通用的 `UriHandler` API](#related-features)。

## 社区库 {id="community-libraries"}

社区库封装了原生共享 API，并提供可从 `commonMain` 源集中调用的通用 API。

[KMP Sharing](https://klibs.io/project/software-mansion/kmp-sharing) 为 Android 和 iOS 上的系统共享对话框提供了通用 API。
它支持共享文本或 URL，还可选择附加文件 URI：

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

[FileKit](https://klibs.io/project/vinceglb/FileKit) 通过原生对话框提供跨平台的文件选取、保存以及文件操作功能。
你可以将这些库结合使用，例如通过 FileKit 选取文件并使用 KMP Sharing 进行共享：

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

KMP Sharing 要求文件值以 URI 形式提供。如果从 FileKit 获取的是本地路径，在共享之前需将 `PlatformFile` 路径转换为 URI：
在 `commonMain` 的顶层定义此帮助函数：

```kotlin
private fun PlatformFile.sharingUri(): String = path.let { filePath ->
    when {
        filePath.startsWith("content://") || filePath.startsWith("file://") -> filePath
        else -> "file://$filePath"
    }
}
```

可以在 [klibs.io](https://klibs.io/) 上浏览其他库选项。
对于库未涵盖的使用场景，你可以借助[平台专用 API](#platform-specific-sharing-apis)来实现共享。

## 平台专用共享 API {id="platform-specific-sharing-apis"}

你也可以直接使用各平台上的原生 API 来实现共享，例如用于精细控制内容类型、共享选项或共享流程。

### Android {id="android"}

在 `androidMain` 源集中，使用 `ACTION_SEND` Intent 来共享文本、URL 或文件。
对于文本或 URL，通过 `Intent.EXTRA_TEXT` 传递内容：

```kotlin
val intent = Intent(Intent.ACTION_SEND).apply {
    type = "text/plain"
    putExtra(Intent.EXTRA_TEXT, "https://kotlinlang.org")
}

context.startActivity(Intent.createChooser(intent, "Share with"))
```

若要共享文件，请使用 `content://` URI 并授予临时读取权限：

```kotlin
val intent = Intent(Intent.ACTION_SEND).apply {
    type = "image/jpeg"
    putExtra(Intent.EXTRA_STREAM, contentUri)
    addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
}

context.startActivity(Intent.createChooser(intent, "Share with"))
```

对于应用私有文件，请通过 `FileProvider`、`MediaStore` 或其他内容提供程序公开该文件。
对于多个文件，请使用带有 `Intent.EXTRA_STREAM` 的 `ACTION_SEND_MULTIPLE`，并传入 `ArrayList<Uri>`：

```kotlin
val intent = Intent(Intent.ACTION_SEND_MULTIPLE).apply {
    type = "image/jpeg"
    putParcelableArrayListExtra(Intent.EXTRA_STREAM, ArrayList(contentUris))
    addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
}

context.startActivity(Intent.createChooser(intent, "Share with"))
```

更多信息请参阅 Android 开发者页面：[在应用之间共享数据](https://developer.android.com/develop/ui/compose/sharing)。

### iOS {id="ios"}

对于[基于 UIKit 的 UI](compose-uikit-integration.md)，在原生 `iosApp` 项目中弹出 `UIActivityViewController`：

```swift
let items: [Any] = [URL(string: "https://kotlinlang.org")!]

let controller = UIActivityViewController(
    activityItems: items,
    applicationActivities: nil
)

viewController.present(controller, animated: true)
```

在原生应用的 [SwiftUI](compose-swiftui-integration.md) 代码中，你可以对 `Transferable` 协议所支持的值使用 `ShareLink`。

对于自定义或大型文件，请实现 `Transferable` 表示形式，或通过平台桥接使用 `UIActivityViewController`。

更多信息请参阅 Apple 开发者页面：[Collaborating and sharing copies of your data](https://developer.apple.com/documentation/uikit/collaborating-and-sharing-copies-of-your-data)。

### 桌面平台 {id="desktop"}

桌面应用程序没有通用的共享对话框。常见做法包括：

* 将内容复制到剪贴板。
* 使用默认应用程序打开文件。
* 使用平台专用 API，例如 macOS 上的 `NSSharingServicePicker` 类，附带可用共享服务列表。

例如，在存在对应关联程序的情况下，你可以使用 `java.awt.Desktop` 在与该文件类型关联的应用程序中打开文件：

```kotlin
val file = java.io.File("/path/to/document.pdf")

if (java.awt.Desktop.isDesktopSupported()) {
    val desktop = java.awt.Desktop.getDesktop()
    if (desktop.isSupported(java.awt.Desktop.Action.OPEN)) {
        desktop.open(file)
    }
}
```

### Web {id="web"}

在浏览器和操作系统支持的情况下，Web 应用程序可以通过 [JavaScript 互操作](https://kotlinlang.org/docs/wasm-js-interop.html)使用 Web Share API。
该 API 通常需要 HTTPS 环境以及用户手势触发（例如点击按钮）。

调用 API 前请先检查其支持情况，并提供回退方案，例如将内容复制到剪贴板：

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

对于文件，使用 `navigator.canShare()` 检查支持情况：

```javascript
if (navigator.canShare && navigator.canShare({ files })) {
    await navigator.share({
        files,
        title: "Photos"
    })
}
```

文件共享的支持情况取决于浏览器、平台、文件类型以及文件大小。
如果无法共享文件，常见的回退方案包括提供文件下载，或者改为复制内容的链接。

## 相关功能 {id="related-features"}

* **打开链接与深层链接（Deep Links）。** Compose Multiplatform 提供了 `UriHandler` 作为通用 API，用于请求平台打开 URI：例如 `https://` 链接、自定义应用 Scheme、`mailto:`、`geo:` 等。
  通过 `LocalUriHandler.current` 获取该处理程序，并在事件处理程序中调用 `openUri()`：

  ```kotlin
  val uriHandler = LocalUriHandler.current

  Button(onClick = { uriHandler.openUri("mailto:user@example.com?subject=Hello") }) {
      Text("Send email")
  }
  ```
  
* **拖放。** Compose Multiplatform 提供了通用的 API，支持通过将内容拖动到目标位置来进行共享。请参阅[拖放](compose-drag-drop.md)。
* **剪贴板。** Compose Multiplatform 支持 Jetpack Compose 的 [Clipboard](https://developer.android.com/reference/kotlin/androidx/compose/ui/platform/Clipboard) 接口。
然而，目前在通用代码中进行剪贴板交互仍存在一定限制。可在 [CMP-7624](https://youtrack.jetbrains.com/issue/CMP-7624) 中跟踪进展。