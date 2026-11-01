[//]: # (title: 在 Compose Multiplatform 应用中显示 PDF 文件)

你可以使用第三方库在 Compose Multiplatform 应用中显示、编辑或生成 PDF。平台支持和版本要求可能会随着时间的推移而发生变化，因此请查看各个库的文档，以了解受支持的平台以及所需的 Kotlin 和 Compose Multiplatform 版本。

根据用户在你的应用中对 PDF 的操作需求来选择合适的方法：

* 若要显示现有的 PDF，请使用 [PDF 查看器](#add-a-pdf-viewer)。
* 若要创建和编辑 PDF，请使用[文档引擎](#display-a-pdf-with-a-document-engine)。
* 若要根据应用数据生成 PDF，请使用 [PDF 生成器](#generate-and-display-a-pdf)。

对于用户可以在 Compose UI 之外打开的 PDF，请[使用平台查看器](#use-a-platform-viewer)。

## 显示现有的 PDF {id="display-an-existing-pdf"}

若要显示现有的 PDF，可以使用现成的查看器，或者带有查看器组件的文档引擎。

### 添加 PDF 查看器 {id="add-a-pdf-viewer"}

[Nucleus PDF reader](https://nucleusframework.dev/en/docs/pdf/) 在 Android、iOS、桌面和 Web 上使用 PDFium。它通过原生二进制文件进行集成，或者在 Web 上通过在 Web Worker 中运行的 WebAssembly 模块进行集成。

若要显示已加载到内存中的 PDF，请将其字节传递给 reader 状态，并将 `PdfReader()` 添加到你的布局中：

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

![Compose Multiplatform 应用中的 PDF 文件](compose-pdf.png){width=300 style="block"}

更多信息请参阅 [Nucleus PDF reader 文档](https://nucleusframework.dev/en/docs/pdf/)。

### 使用文档引擎显示 PDF {id="display-a-pdf-with-a-document-engine"}

[KitePDF](https://github.com/yuroyami/KitePDF) 提供了一个文档引擎和 Compose 查看器，用于读取、创建和编辑 PDF。它支持 Android、iOS、Web 以及桌面目标。

使用 `PdfDocument.open(bytes)` 打开 PDF，然后将文档传递给查看器：

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

可用的文档输入取决于库版本和目标平台。更多信息请参阅 [KitePDF 文档](https://yuroyami.github.io/KitePDF/)。

## 生成并显示 PDF {id="generate-and-display-a-pdf"}

[PdfKmp](https://github.com/ConaMobileDev/PdfKmp) 可以根据应用数据（例如食谱、发票或收据）创建 PDF。它支持 Android、iOS、桌面以及通过 Kotlin/Wasm 支持 Web。

可选的 `pdfkmp-viewer` 模块可在 Android、iOS 和桌面上嵌入 Compose 查看器。该查看器模块目前在 Web 上不可用。对于 Web 应用，请参阅浏览器[查看和保存](https://conamobiledev.github.io/PdfKmp/guides/web/#viewing-saving)指南。

以下示例从应用数据生成 PDF 并使用 Compose 查看器进行显示：

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

更多信息请参阅 [PdfKmp 查看器文档](https://conamobiledev.github.io/PdfKmp/guides/viewer/)。

## 使用平台查看器 {id="use-a-platform-viewer"}

对于不需要嵌入式 Compose 查看器的 PDF，可以使用平台 API 来展示、打开或共享文档。

例如，桌面应用可以使用 `java.awt.Desktop.open()` 打开已保存的 PDF。在移动端，可以使用平台 API 来展示或共享文档，例如 iOS 上的 PDFKit 或 Android 上的文件共享 Intent。Web 应用可以提供 PDF 供浏览器打开或下载。

有关特定于平台的示例，请参阅 [PdfKmp 保存与共享指南](https://conamobiledev.github.io/PdfKmp/getting-started/#save-share-per-platform)。这些示例将文档移交给平台 API，并且不需要 PdfKmp 的 Compose 查看器。

## 下一步 {id="what-s-next"}

* 了解如何[添加多平台库的依赖项](multiplatform-add-dependencies.md)。
* 了解如何[使用多平台资源](compose-multiplatform-resources.md)。