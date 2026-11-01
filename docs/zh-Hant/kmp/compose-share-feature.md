[//]: # (title: 在 Compose Multiplatform 中分享內容)

在 Compose Multiplatform 應用程式中，你可以與系統或其他應用程式分享文字、URL、檔案以及其他內容。

分享功能因平台而異：

* Android 與 iOS 提供原生系統分享對話方塊。
* 桌面應用程式通常沒有通用的系統分享對話方塊。常見的替代方案包括使用剪貼簿、透過預設應用程式開啟檔案或 URL，或是呼叫平台專屬的 API。
* Web 應用程式可以使用 [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API)（取決於瀏覽器支援度）。

若要在 Compose Multiplatform 應用程式中分享內容，可以使用[社群程式庫](#community-libraries)或直接呼叫[平台專屬的 API](#platform-specific-sharing-apis)。
若要在任何平台上透過預設關聯的應用程式開啟連結，請使用[共用 `UriHandler` API](#related-features)。

## 社群程式庫 {id="community-libraries"}

社群程式庫封裝了原生分享 API，並提供可從 `commonMain` 原始碼集呼叫的共用 API。

[KMP Sharing](https://klibs.io/project/software-mansion/kmp-sharing) 為 Android 和 iOS 上的系統分享對話方塊提供了共用 API。
它支援分享文字或 URL，並可選擇附加檔案 URI：

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

[FileKit](https://klibs.io/project/vinceglb/FileKit) 透過原生對話方塊提供跨平台的檔案選取、儲存和檔案操作。
你可以將這些程式庫搭配使用，例如透過 FileKit 選取檔案，並透過 KMP Sharing 分享它們：

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

KMP Sharing 期望檔案值為 URI。如果你從 FileKit 取得的是本機路徑，請在分享前將 `PlatformFile` 路徑轉換為 URI：
在 `commonMain` 的頂層定義此幫助程式：

```kotlin
private fun PlatformFile.sharingUri(): String = path.let { filePath ->
    when {
        filePath.startsWith("content://") || filePath.startsWith("file://") -> filePath
        else -> "file://$filePath"
    }
}
```

在 [klibs.io](https://klibs.io/) 上瀏覽其他程式庫選項。
對於程式庫未涵蓋的使用案例，你可以使用[平台專屬的 API](#platform-specific-sharing-apis)來實作分享。

## 平台專屬的分享 API {id="platform-specific-sharing-apis"}

你可以直接使用各個平台上的原生 API 來實作分享，例如控制內容類型、分享選項或分享流程。

### Android {id="android"}

在 `androidMain` 原始碼集中，使用 `ACTION_SEND` intent 來分享文字、URL 或檔案。
對於文字或 URL，請使用 `Intent.EXTRA_TEXT` 傳遞內容：

```kotlin
val intent = Intent(Intent.ACTION_SEND).apply {
    type = "text/plain"
    putExtra(Intent.EXTRA_TEXT, "https://kotlinlang.org")
}

context.startActivity(Intent.createChooser(intent, "Share with"))
```

若要分享檔案，請使用 `content://` URI 並授予暫時的讀取權限：

```kotlin
val intent = Intent(Intent.ACTION_SEND).apply {
    type = "image/jpeg"
    putExtra(Intent.EXTRA_STREAM, contentUri)
    addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
}

context.startActivity(Intent.createChooser(intent, "Share with"))
```

對於應用程式私有檔案，請透過 `FileProvider`、`MediaStore` 或其他內容提供者公開該檔案。
對於多個檔案，請將 `ACTION_SEND_MULTIPLE` 與 `Intent.EXTRA_STREAM` 搭配使用，並傳入 `ArrayList<Uri>`：

```kotlin
val intent = Intent(Intent.ACTION_SEND_MULTIPLE).apply {
    type = "image/jpeg"
    putParcelableArrayListExtra(Intent.EXTRA_STREAM, ArrayList(contentUris))
    addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
}

context.startActivity(Intent.createChooser(intent, "Share with"))
```

若要了解更多資訊，請參閱 Android Developers 頁面[在應用程式之間分享資料](https://developer.android.com/develop/ui/compose/sharing)。

### iOS {id="ios"}

對於[以 UIKit 為基礎的 UI](compose-uikit-integration.md)，請在原生的 `iosApp` 專案中顯示 `UIActivityViewController`：

```swift
let items: [Any] = [URL(string: "https://kotlinlang.org")!]

let controller = UIActivityViewController(
    activityItems: items,
    applicationActivities: nil
)

viewController.present(controller, animated: true)
```

在原生應用程式的 [SwiftUI](compose-swiftui-integration.md) 程式碼中，針對 `Transferable` 協定所支援的值，你可以使用 `ShareLink`。

對於自訂或大型檔案，請實作 `Transferable` 表示形式，或搭配平台橋接器使用 `UIActivityViewController`。

若要了解更多資訊，請參閱 Apple Developer 頁面 [Collaborating and sharing copies of your data](https://developer.apple.com/documentation/uikit/collaborating-and-sharing-copies-of-your-data)。

### Desktop {id="desktop"}

桌面應用程式沒有通用的分享對話方塊。常見的做法包括：

* 將內容複製到剪貼簿。
* 使用預設應用程式開啟檔案。
* 使用平台專屬的 API，例如 macOS 上的 `NSSharingServicePicker` 類別及其可用分享服務清單。

例如，當存在與檔案類型關聯的應用程式時，你可以使用 `java.awt.Desktop` 在該應用程式中開啟檔案：

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

在瀏覽器與作業系統支援的情況下，Web 應用程式可透過 [JavaScript 互通性](https://kotlinlang.org/docs/wasm-js-interop.html)使用 Web Share API。
它通常需要 HTTPS 以及使用者手勢操作（例如點擊按鈕）。

在呼叫 API 之前請先檢查是否支援，並提供備援方案，例如將內容複製到剪貼簿：

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

對於檔案，請使用 `navigator.canShare()` 檢查支援情況：

```javascript
if (navigator.canShare && navigator.canShare({ files })) {
    await navigator.share({
        files,
        title: "Photos"
    })
}
```

檔案分享的支援程度取決於瀏覽器、平台、檔案類型與檔案大小。
如果檔案無法分享，常見的備援方案包括提供檔案下載，或是改為複製該內容的連結。

## 相關功能 {id="related-features"}

* **開啟連結與深層連結（Deep Link）。** Compose Multiplatform 提供了 `UriHandler` 作為共用 API，用於請求平台開啟 URI：`https://` 連結、自訂應用程式結構定義（custom application schemes）、`mailto:`、`geo:` 等等。
  透過 `LocalUriHandler.current` 取得處理常式，並在事件處理常式中呼叫 `openUri()`：

  ```kotlin
  val uriHandler = LocalUriHandler.current

  Button(onClick = { uriHandler.openUri("mailto:user@example.com?subject=Hello") }) {
      Text("Send email")
  }
  ```
  
* **拖放。** Compose Multiplatform 提供了共用 API，可透過將內容拖曳至目的地來進行分享。請參閱[拖放](compose-drag-drop.md)。
* **剪貼簿。** Compose Multiplatform 支援 Jetpack Compose 的 [Clipboard](https://developer.android.com/reference/kotlin/androidx/compose/ui/platform/Clipboard) 介面。
然而，目前從通用程式碼與剪貼簿互動仍受限制。請在 [CMP-7624](https://youtrack.jetbrains.com/issue/CMP-7624) 追蹤進度。