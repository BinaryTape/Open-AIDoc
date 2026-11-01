[//]: # (title: 在 Compose Multiplatform 應用程式中顯示 PDF 檔案)

你可以在 Compose Multiplatform 應用程式中使用第三方庫來顯示、編輯或產生 PDF。
平台支援和版本需求可能會隨時間變更，因此請查看各程式庫的文件以了解支援的平台以及所需的 Kotlin 和 Compose Multiplatform 版本。

根據使用者在應用程式中對 PDF 的需求選擇合適的方法：

* 若要顯示現有的 PDF，請使用 [PDF 檢視器](#add-a-pdf-viewer)。
* 若要建立和編輯 PDF，請使用[文件引擎](#display-a-pdf-with-a-document-engine)。
* 若要從應用程式資料產生 PDF，請使用 [PDF 產生器](#generate-and-display-a-pdf)。

對於使用者可以在 Compose UI 之外開啟的 PDF，請[使用平台檢視器](#use-a-platform-viewer)。

## 顯示現有的 PDF {id="display-an-existing-pdf"}

若要顯示現有的 PDF，請使用現成的檢視器，或包含檢視器元件的文件引擎。

### 新增 PDF 檢視器 {id="add-a-pdf-viewer"}

[Nucleus PDF reader](https://nucleusframework.dev/en/docs/pdf/) 在 Android、iOS、桌面以及 Web 上使用 PDFium。它透過原生二進制檔案進行整合，或在 Web 上透過在 Web Worker 中執行的 WebAssembly 模組進行整合。

若要顯示已載入至記憶體中的 PDF，請將其位元組傳遞給讀取器狀態，並在版面配置中新增 `PdfReader()`：

```kotlin
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Modifier
import dev.nucleusframework.pdfium.PdfReader
import dev.nucleusframework.pdfium.rememberPdfReaderState

@Composable
fun PdfScreen(bytes: ByteArray) {
    val reader = rememberPdfReaderState()

    LaunchedEffect(bytes) {
        reader.open(bytes)
    }

    PdfReader(
        state = reader,
        modifier = Modifier.fillMaxSize(),
    )
}
```

![Compose Multiplatform 應用程式中的 PDF 檔案](compose-pdf.png){width=300 style="block"}

如需更多資訊，請參閱 [Nucleus PDF reader 文件](https://nucleusframework.dev/en/docs/pdf/)。

### 使用文件引擎顯示 PDF {id="display-a-pdf-with-a-document-engine"}

[KitePDF](https://github.com/yuroyami/KitePDF) 提供了一個文件引擎和 Compose 檢視器，用於讀取、建立和編輯 PDF。
它支援 Android、iOS、Web 以及桌面目標。

使用 `PdfDocument.open(bytes)` 開啟 PDF，然後將文件傳遞給檢視器：

```kotlin
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import io.github.yuroyami.kitepdf.PdfDocument
import io.github.yuroyami.kitepdf.compose.PdfView
import io.github.yuroyami.kitepdf.compose.rememberPdfViewState

@Composable
fun PdfScreen(bytes: ByteArray) {
    val document = remember(bytes) {
        PdfDocument.open(bytes)
    }

    PdfView(
        state = rememberPdfViewState(document),
        modifier = Modifier.fillMaxSize(),
    )
}
```

可用的文件輸入取決於程式庫版本與目標平台。
如需更多資訊，請參閱 [KitePDF 文件](https://yuroyami.github.io/KitePDF/)。

## 產生並顯示 PDF {id="generate-and-display-a-pdf"}

[PdfKmp](https://github.com/ConaMobileDev/PdfKmp) 可以從應用程式資料建立 PDF，例如食譜、發票或收據。
它支援 Android、iOS、桌面以及透過 Kotlin/Wasm 支援 Web。

選用的 `pdfkmp-viewer` 模組在 Android、iOS 和桌面上嵌入了 Compose 檢視器。
此檢視器模組目前不支援 Web。針對 Web 應用程式，請參閱瀏覽器[檢視與儲存](https://conamobiledev.github.io/PdfKmp/guides/web/#viewing-saving)指南。

以下範例從應用程式資料產生 PDF 並使用 Compose 檢視器顯示：

```kotlin
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import com.conamobile.pdfkmp.pdf
import com.conamobile.pdfkmp.viewer.KmpPdfViewer

@Composable
fun RecipePdfScreen(
    recipeTitle: String,
    ingredients: String,
    instructions: String,
    onBack: () -> Unit,
) {
    val document = remember(recipeTitle, ingredients, instructions) {
        pdf {
            page {
                text(recipeTitle)
                text(ingredients)
                text(instructions)
            }
        }
    }

    KmpPdfViewer(
        document = document,
        title = recipeTitle,
        fileName = "recipe.pdf",
        onBack = onBack,
    )
}
```

如需更多資訊，請參閱 [PdfKmp viewer 文件](https://conamobiledev.github.io/PdfKmp/guides/viewer/)。

## 使用平台檢視器 {id="use-a-platform-viewer"}

對於不需要嵌入式 Compose 檢視器的 PDF，可以使用平台 API 來展示、開啟或分享文件。

例如，桌面應用程式可以使用 `java.awt.Desktop.open()` 開啟儲存的 PDF。
在行動裝置上，可以使用平台 API 來展示或分享文件，例如 iOS 上的 PDFKit 或 Android 上的檔案分享 Intent。
Web 應用程式則可以提供 PDF 供瀏覽器開啟或下載。

如需平台專屬的範例，請參閱 [PdfKmp 的儲存與分享指南](https://conamobiledev.github.io/PdfKmp/getting-started/#save-share-per-platform)。
這些範例將文件交由平台 API 處理，不需要 PdfKmp 的 Compose 檢視器。

## 後續步驟 {id="what-s-next"}

* 了解如何[新增多平台庫的相依性](multiplatform-add-dependencies.md)。
* 了解如何[使用多平台資源](compose-multiplatform-resources.md)。