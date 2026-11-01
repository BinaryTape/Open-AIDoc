[//]: # (title: Compose Multiplatform アプリで PDF ファイルを表示する)

Compose Multiplatform アプリでは、サードパーティのライブラリを使用して PDF の表示、編集、または生成を行うことができます。
プラットフォームのサポート状況やバージョン要件は変更される可能性があるため、対応プラットフォームや必要な Kotlin および Compose Multiplatform のバージョンについては各ライブラリのドキュメントを確認してください。

アプリ内でユーザーが PDF に対してどのような操作を行う必要があるかに応じて、アプローチを選択してください:

* 既存の PDF を表示するには、[PDF ビューア](#add-a-pdf-viewer)を使用します。
* PDF の作成や編集を行うには、[ドキュメントエンジン](#display-a-pdf-with-a-document-engine)を使用します。
* アプリのデータから PDF を生成するには、[PDF ジェネレータ](#generate-and-display-a-pdf)を使用します。

ユーザーが Compose UI の外部で開くことができる PDF については、[プラットフォームビューアを使用](#use-a-platform-viewer)してください。

## 既存の PDF を表示する {id="display-an-existing-pdf"}

既存の PDF を表示するには、既成のビューア、またはビューアコンポーネントを備えたドキュメントエンジンを使用します。

### PDF ビューアの追加 {id="add-a-pdf-viewer"}

[Nucleus PDF reader](https://nucleusframework.dev/en/docs/pdf/) は、Android、iOS、デスクトップ、および Web 上で PDFium を使用します。ネイティブバイナリ経由、または Web 上では Web Worker で実行される WebAssembly モジュール経由で統合されます。

すでにメモリに読み込まれている PDF を表示するには、そのバイト配列をリーダーステートに渡し、レイアウトに `PdfReader()` を追加します:

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

![Compose Multiplatform アプリにおける PDF ファイル](compose-pdf.png){width=300 style="block"}

詳細については、[Nucleus PDF reader ドキュメント](https://nucleusframework.dev/en/docs/pdf/)を参照してください。

### ドキュメントエンジンで PDF を表示する {id="display-a-pdf-with-a-document-engine"}

[KitePDF](https://github.com/yuroyami/KitePDF) は、PDF の読み取り、作成、および編集を行うためのドキュメントエンジンと Compose ビューアを提供します。
Android、iOS、Web、およびデスクトップターゲットをサポートしています。

`PdfDocument.open(bytes)` で PDF を開き、そのドキュメントをビューアに渡します:

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

利用可能なドキュメント入力形式は、ライブラリのバージョンやターゲットプラットフォームによって異なります。
詳細については、[KitePDF ドキュメント](https://yuroyami.github.io/KitePDF/)を参照してください。

## PDF の生成と表示 {id="generate-and-display-a-pdf"}

[PdfKmp](https://github.com/ConaMobileDev/PdfKmp) は、レシピ、請求書、レシートなどのアプリデータから PDF を作成できます。
Android、iOS、デスクトップ、および Kotlin/Wasm 経由での Web をサポートしています。

オプションの `pdfkmp-viewer` モジュールを使用すると、Android、iOS、デスクトップに Compose ビューアを組み込むことができます。
このビューアモジュールは現在 Web では利用できません。Web アプリについては、ブラウザでの[表示と保存（viewing and saving）](https://conamobiledev.github.io/PdfKmp/guides/web/#viewing-saving)に関するガイダンスを参照してください。

以下の例では、アプリのデータから PDF を生成し、Compose ビューアで表示します:

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

詳細については、[PdfKmp ビューアドキュメント](https://conamobiledev.github.io/PdfKmp/guides/viewer/)を参照してください。

## プラットフォームビューアを使用する {id="use-a-platform-viewer"}

埋め込み Compose ビューアを必要としない PDF の場合は、プラットフォーム API を使用してドキュメントの表示、オープン、または共有を行います。

例えば、デスクトップアプリでは `java.awt.Desktop.open()` を使用して保存された PDF を開くことができます。
モバイルでは、iOS の PDFKit や Android のファイル共有 Intent（インテント）など、プラットフォーム API を使用してドキュメントを表示または共有します。
Web アプリでは、ブラウザで PDF を開いたりダウンロードしたりできるように提供できます。

プラットフォーム固有の例については、[PdfKmp の保存と共有ガイド](https://conamobiledev.github.io/PdfKmp/getting-started/#save-share-per-platform)を参照してください。
これらの例はドキュメントをプラットフォーム API に渡すため、PdfKmp の Compose ビューアは必要ありません。

## 次のステップ {id="what-s-next"}

* [マルチプラットフォームライブラリへの依存関係の追加](multiplatform-add-dependencies.md)について学ぶ。
* [マルチプラットフォームリソースの操作](compose-multiplatform-resources.md)について学ぶ。