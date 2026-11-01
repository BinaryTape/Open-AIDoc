[//]: # (title: Compose Multiplatform 앱에서 PDF 파일 표시하기)

서드파티 라이브러리를 사용하여 Compose Multiplatform 앱에서 PDF를 표시, 편집 또는 생성할 수 있습니다.
플랫폼 지원 및 버전 요구 사항은 시간이 지남에 따라 변경될 수 있으므로, 지원되는 플랫폼과 필요한 Kotlin 및 Compose Multiplatform 버전은 각 라이브러리의 문서를 확인하세요.

앱에서 사용자가 PDF를 어떻게 다루어야 하는지에 따라 접근 방식을 선택하세요.

* 기존 PDF를 표시하려면 [PDF 뷰어](#add-a-pdf-viewer)를 사용하세요.
* PDF를 생성하고 편집하려면 [문서 엔진](#display-a-pdf-with-a-document-engine)을 사용하세요.
* 앱 데이터로부터 PDF를 생성하려면 [PDF 생성기](#generate-and-display-a-pdf)를 사용하세요.

사용자가 Compose UI 외부에서 열 수 있는 PDF의 경우, [플랫폼 뷰어를 사용하세요](#use-a-platform-viewer).

## 기존 PDF 표시하기 {id="display-an-existing-pdf"}

기존 PDF를 표시하려면 기성 뷰어 또는 뷰어 컴포넌트가 포함된 문서 엔진을 사용하세요.

### PDF 뷰어 추가하기 {id="add-a-pdf-viewer"}

[Nucleus PDF reader](https://nucleusframework.dev/en/docs/pdf/)는 Android, iOS, 데스크톱 및 웹에서 PDFium을 사용합니다. 네이티브 바이너리를 통해 통합되거나, 웹에서는 Web Worker에서 실행되는 WebAssembly 모듈을 통해 통합됩니다.

이미 메모리에 로드된 PDF를 표시하려면 바이트 배열을 reader 상태로 전달하고 레이아웃에 `PdfReader()`를 추가하세요.

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

![Compose Multiplatform 앱의 PDF 파일](compose-pdf.png){width=300 style="block"}

자세한 내용은 [Nucleus PDF reader 문서](https://nucleusframework.dev/en/docs/pdf/)를 참조하세요.

### 문서 엔진으로 PDF 표시하기 {id="display-a-pdf-with-a-document-engine"}

[KitePDF](https://github.com/yuroyami/KitePDF)는 PDF 읽기, 생성 및 편집을 위한 문서 엔진과 Compose 뷰어를 제공합니다.
Android, iOS, 웹 및 데스크톱 타깃을 지원합니다.

`PdfDocument.open(bytes)`로 PDF를 연 다음, 해당 문서를 뷰어로 전달하세요.

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

사용 가능한 문서 입력 방식은 라이브러리 버전 및 타깃 플랫폼에 따라 다릅니다.
자세한 내용은 [KitePDF 문서](https://yuroyami.github.io/KitePDF/)를 참조하세요.

## PDF 생성 및 표시하기 {id="generate-and-display-a-pdf"}

[PdfKmp](https://github.com/ConaMobileDev/PdfKmp)는 레시피, 인보이스, 영수증과 같은 앱 데이터로부터 PDF를 생성할 수 있습니다.
Android, iOS, 데스크톱 및 Kotlin/Wasm을 통한 웹을 지원합니다.

선택 사항인 `pdfkmp-viewer` 모듈을 사용하면 Android, iOS 및 데스크톱에서 Compose 뷰어를 임베드할 수 있습니다.
이 뷰어 모듈은 현재 웹에서는 사용할 수 없습니다. 웹 앱의 경우 브라우저 [보기 및 저장](https://conamobiledev.github.io/PdfKmp/guides/web/#viewing-saving) 가이드를 참조하세요.

다음 예제는 앱 데이터로부터 PDF를 생성하고 Compose 뷰어로 표시합니다.

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

자세한 내용은 [PdfKmp viewer 문서](https://conamobiledev.github.io/PdfKmp/guides/viewer/)를 참조하세요.

## 플랫폼 뷰어 사용하기 {id="use-a-platform-viewer"}

임베디드 Compose 뷰어가 필요하지 않은 PDF의 경우, 플랫폼 API를 사용하여 문서를 표시하거나 열거나 공유하세요.

예를 들어 데스크톱 앱은 `java.awt.Desktop.open()`을 사용하여 저장된 PDF를 열 수 있습니다.
모바일에서는 iOS의 PDFKit이나 Android의 파일 공유 인텐트(intent)와 같은 플랫폼 API를 사용하여 문서를 표시하거나 공유할 수 있습니다.
웹 앱에서는 브라우저가 PDF를 열거나 다운로드하도록 제공할 수 있습니다.

플랫폼별 예제는 [PdfKmp의 저장 및 공유 가이드](https://conamobiledev.github.io/PdfKmp/getting-started/#save-share-per-platform)를 참조하세요.
이러한 예제는 문서를 플랫폼 API로 넘겨주며 PdfKmp의 Compose 뷰어를 필요로 하지 않습니다.

## 다음 단계 {id="what-s-next"}

* [멀티플랫폼 라이브러리에 종속성(dependency)을 추가하는 방법](multiplatform-add-dependencies.md)을 알아보세요.
* [멀티플랫폼 리소스를 다루는 방법](compose-multiplatform-resources.md)을 알아보세요.