[//]: # (title: Compose Multiplatform でのコンテンツの共有)

Compose Multiplatform アプリでは、テキスト、URL、ファイル、その他のコンテンツをシステムや他のアプリと共有できます。

共有機能はプラットフォームによって異なります：

* Android と iOS は、ネイティブのシステム共有ダイアログを提供します。
* デスクトップアプリケーションには通常、汎用的なシステム共有ダイアログはありません。一般的な代替手段としては、クリップボードの使用、デフォルトのアプリケーションでファイルや URL を開くこと、またはプラットフォーム固有の API を呼び出すことなどがあります。
* Web アプリケーションは、ブラウザのサポート状況に応じて [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API) を使用できます。

Compose Multiplatform アプリでコンテンツを共有するには、[コミュニティライブラリ](#community-libraries)を使用するか、[プラットフォーム固有の API](#platform-specific-sharing-apis) を直接呼び出します。
どのプラットフォームでもデフォルトの関連付けられたアプリケーションでリンクを開くには、[共通の `UriHandler` API](#related-features) を使用します。

## コミュニティライブラリ {id="community-libraries"}

コミュニティライブラリはネイティブの共有 API をラップし、`commonMain` ソースセットから呼び出せる共通の API を提供します。

[KMP Sharing](https://klibs.io/project/software-mansion/kmp-sharing) は、Android および iOS 上のシステム共有ダイアログ用の共通 API を提供します。
テキストや URL の共有に対応しており、オプションでファイル URI を含めることもできます：

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

[FileKit](https://klibs.io/project/vinceglb/FileKit) は、ネイティブダイアログを使用したクロスプラットフォームでのファイル選択、保存、およびファイル操作を提供します。
これらのライブラリを組み合わせて使用することも可能です。例えば、FileKit でファイルを選択し、KMP Sharing で共有します：

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

KMP Sharing はファイル値を URI として受け取ります。FileKit からローカルパスを取得した場合は、共有する前に `PlatformFile` のパスを URI に変換してください：
このヘルパーを `commonMain` のトップレベルで定義します：

```kotlin
private fun PlatformFile.sharingUri(): String = path.let { filePath ->
    when {
        filePath.startsWith("content://") || filePath.startsWith("file://") -> filePath
        else -> "file://$filePath"
    }
}
```

その他のライブラリオプションについては [klibs.io](https://klibs.io/) を参照してください。
ライブラリでカバーされていないユースケースについては、[プラットフォーム固有の API](#platform-specific-sharing-apis) を使用して共有を実装できます。

## プラットフォーム固有の共有 API {id="platform-specific-sharing-apis"}

コンテンツタイプ、共有オプション、または共有フローを制御したい場合などは、各プラットフォームのネイティブ API を直接使用して共有を実装できます。

### Android {id="android"}

`androidMain` ソースセットでは、`ACTION_SEND` Intent を使用してテキスト、URL、またはファイルを共有します。
テキストまたは URL の場合は、`Intent.EXTRA_TEXT` でコンテンツを渡します：

```kotlin
val intent = Intent(Intent.ACTION_SEND).apply {
    type = "text/plain"
    putExtra(Intent.EXTRA_TEXT, "https://kotlinlang.org")
}

context.startActivity(Intent.createChooser(intent, "Share with"))
```

ファイルを共有するには、`content://` URI を使用し、一時的な読み取り権限を付与します：

```kotlin
val intent = Intent(Intent.ACTION_SEND).apply {
    type = "image/jpeg"
    putExtra(Intent.EXTRA_STREAM, contentUri)
    addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
}

context.startActivity(Intent.createChooser(intent, "Share with"))
```

アプリ専用ファイルの場合は、`FileProvider`、`MediaStore`、またはその他のコンテンツプロバイダーを介してファイルを公開します。
複数ファイルの場合は、`ACTION_SEND_MULTIPLE` と `Intent.EXTRA_STREAM` を使用して `ArrayList<Uri>` を渡します：

```kotlin
val intent = Intent(Intent.ACTION_SEND_MULTIPLE).apply {
    type = "image/jpeg"
    putParcelableArrayListExtra(Intent.EXTRA_STREAM, ArrayList(contentUris))
    addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
}

context.startActivity(Intent.createChooser(intent, "Share with"))
```

詳細については、Android Developers のページ [Sharing data between apps](https://developer.android.com/develop/ui/compose/sharing) を参照してください。

### iOS {id="ios"}

[UIKit ベースの UI](compose-uikit-integration.md) の場合は、ネイティブの `iosApp` プロジェクトで `UIActivityViewController` を表示します：

```swift
let items: [Any] = [URL(string: "https://kotlinlang.org")!]

let controller = UIActivityViewController(
    activityItems: items,
    applicationActivities: nil
)

viewController.present(controller, animated: true)
```

ネイティブアプリの [SwiftUI](compose-swiftui-integration.md) コードでは、`Transferable` プロトコルでサポートされている値に対して `ShareLink` を使用できます。

カスタムファイルや大容量ファイルの場合は、`Transferable` 表現を実装するか、プラットフォームブリッジとともに `UIActivityViewController` を使用します。

詳細については、Apple Developer のページ [Collaborating and sharing copies of your data](https://developer.apple.com/documentation/uikit/collaborating-and-sharing-copies-of-your-data) を参照してください。

### デスクトップ {id="desktop"}

デスクトップアプリケーションには、汎用的な共有ダイアログはありません。一般的なアプローチとしては以下のものがあります：

* コンテンツをクリップボードにコピーする。
* デフォルトのアプリケーションでファイルを開く。
* プラットフォーム固有の API（利用可能な共有サービスのリストを表示する macOS の `NSSharingServicePicker` クラスなど）を使用する。

例えば、ファイルタイプに関連付けられたアプリケーションが存在する場合、`java.awt.Desktop` を使用してそのアプリケーションでファイルを開くことができます：

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

Web アプリケーションでは、ブラウザとオペレーティングシステムでサポートされている場合、[JavaScript interop](https://kotlinlang.org/docs/wasm-js-interop.html) を介して Web Share API を使用できます。
通常、HTTPS とボタンクリックなどのユーザー操作が必要です。

API を呼び出す前にサポートされているか確認し、クリップボードへのコンテンツのコピーなどのフォールバックを用意してください：

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

ファイルの場合は、`navigator.canShare()` でサポートを確認します：

```javascript
if (navigator.canShare && navigator.canShare({ files })) {
    await navigator.share({
        files,
        title: "Photos"
    })
}
```

ファイル共有のサポートは、ブラウザ、プラットフォーム、ファイルの種類、およびファイルサイズに依存します。
ファイルを共有できない場合の一般的なフォールバックには、ファイルをダウンロードとして提供するか、代わりにコンテンツへのリンクをコピーすることが挙げられます。

## 関連機能 {id="related-features"}

* **リンクとディープリンクを開く。** Compose Multiplatform は、プラットフォームに URI（`https://` リンク、カスタムアプリケーxyz...スキーム、`mailto:`、`geo:` など）を開くよう要求するための共通 API として `UriHandler` を提供します。
  `LocalUriHandler.current` でハンドラーを取得し、イベントハンドラーから `openUri()` を呼び出します：

  ```kotlin
  val uriHandler = LocalUriHandler.current

  Button(onClick = { uriHandler.openUri("mailto:user@example.com?subject=Hello") }) {
      Text("Send email")
  }
  ```
  
* **ドラッグ＆ドロップ。** Compose Multiplatform は、コンテンツを目的地にドラッグして共有するための共通 API を提供します。[ドラッグ＆ドロップ](compose-drag-drop.md)を参照してください。
* **クリップボード。** Compose Multiplatform は Jetpack Compose の [Clipboard](https://developer.android.com/reference/kotlin/androidx/compose/ui/platform/Clipboard) インターフェースをサポートしています。
ただし、共通コードからのクリップボード操作は現在制限されています。進捗状況は [CMP-7624](https://youtrack.jetbrains.com/issue/CMP-7624) で確認できます。