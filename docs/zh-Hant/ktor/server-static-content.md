[//]: # (title: 服務靜態內容)

<show-structure for="chapter" depth="2"/>

<tldr>
<p><b>程式碼範例</b>：
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/static-files">static-files</a>,
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/static-resources">static-resources</a>,
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/static-zip">static-zip</a>
</p>
</tldr>

<link-summary>
了解如何服務靜態內容，例如樣式表、指令碼、圖片等。
</link-summary>

無論您是在建立網站還是 HTTP 端點，您的應用程式都可能需要服務檔案，例如樣式表、指令碼或圖片。
雖然使用 Ktor 確實可以載入檔案內容並將其[在回應中傳送](server-responses.md)給用戶端，但 Ktor 透過提供額外的函式來服務靜態內容，簡化了這個過程。

透過 Ktor，您可以服務來自[資料夾](#folders)、[ZIP 檔案](#zipped)以及[內嵌應用程式資源](#resources)的內容。

## 資料夾 {id="folders"}

要服務來自本機檔案系統的靜態檔案，請使用
[`staticFiles()`](https://api.ktor.io/ktor-server-core/io.ktor.server.http.content/static-files.html)
函式。在這種情況下，相對路徑會使用目前的工作目錄進行解析。

 ```kotlin
 routing {
     staticFiles("/resources", File("files"))
 }
 ```

在上述範例中，任何來自 `/resources` 的請求都會被對應到目前工作目錄中名為 `files` 的實體資料夾。
只要 URL 路徑與實體檔名相符，Ktor 就會遞迴地服務來自 `files` 的任何檔案。

如需完整範例，請參閱 [static-files](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/static-files)。

## ZIP 檔案 {id="zipped"}

要服務來自 ZIP 檔案的靜態內容，Ktor 提供了 [
`staticZip()`](https://api.ktor.io/ktor-server-core/io.ktor.server.http.content/static-zip.html) 函式。
這讓您可以將請求直接對應到 ZIP 封存檔的內容，如下列範例所示：

 ```kotlin
 routing {
     staticZip("/", "/", Paths.get("files/text-files.zip"))
 }
 ```

在此範例中，來自根 URL `/` 的任何請求都會直接對應到 ZIP 檔案 `text-files.zip` 的內容。

### 自動重新載入支援 {id="zip-auto-reload"}

`staticZip()` 函式也支援自動重新載入。如果在 ZIP 檔案的父目錄中偵測到任何變更，ZIP 檔案系統會在下一次請求時重新載入。這確保了服務的內容保持最新狀態，而無需重新啟動伺服器。

如需完整範例，請參閱 [static-zip](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/static-zip)。

## 資源 {id="resources"}

要服務來自 classpath 的內容，請使用
[`staticResources()`](https://api.ktor.io/ktor-server-core/io.ktor.server.http.content/static-resources.html)
函式。

```kotlin
routing {
    staticResources("/resources", "static")
}
```

這會將任何來自 `/resources` 的請求對應到應用程式資源中的 `static` 套件。
在這種情況下，只要 URL 路徑與資源路徑相符，Ktor 就會遞迴地服務來自 `static` 套件的任何檔案。

如需完整範例，請參閱 [static-resources](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/static-resources)。

## 額外配置 {id="configuration"}

Ktor 為靜態檔案和資源提供了更多配置。

### Index 檔案 {id="index"}

如果存在名為 `index.html` 的檔案，當請求該目錄時，Ktor 預設會服務它。您可以使用 `index` 參數設定自訂的 index 檔案：

```kotlin
staticResources("/custom", "static", index = "custom_index.html")
```

在這種情況下，當請求 `/custom` 時，Ktor 會服務 `/custom_index.html`。

### 預先壓縮的檔案 {id="precompressed"}

Ktor 可以服務預先壓縮的靜態檔案，而不是透過 [Compression](server-compression.md) 外掛程式對回應進行動態壓縮。

若要啟用此功能，請使用 `preCompressed()` 函式並指定支援的壓縮格式：

```kotlin
staticFiles("/", File("files")) {
    preCompressed(
        CompressedFileType.BROTLI,
        CompressedFileType.GZIP,
        CompressedFileType.ZSTD,
        CompressedFileType.DEFLATE
    )
}
```

當用戶端請求靜態檔案時，Ktor 會檢查用戶端支援的內容編碼（content encodings），並在可用時提供相符的預先壓縮版本。

例如，對於指向 `/js/script.js` 的請求，Ktor 可以提供預先壓縮的變體，例如 `/js/script.js.br` 或 `/js/script.js.gz`。

### HEAD 請求 {id="autohead"}

`enableAutoHeadResponse()` 函式允許您針對定義了 `GET` 的靜態路由中的每個路徑，自動回應 `HEAD` 請求。

```kotlin
staticResources("/", "static"){
    enableAutoHeadResponse()
}
```

### 預設檔案回應 {id="default-file"}

`default()` 函式提供了在靜態路由中針對任何沒有對應檔案的請求，以特定檔案進行回覆的能力。

```kotlin
staticFiles("/", File("files")) {
    default("index.html")
}
```

在此範例中，當用戶端請求一個不存在的資源時，將會服務 `index.html` 檔案作為回應。

### Content type {id="content-type"}

預設情況下，Ktor 會嘗試從副檔名推測 `Content-Type` 標頭的值。您可以使用 `contentType()` 函式明確設定 `Content-Type` 標頭。

```kotlin
staticFiles("/files", File("textFiles")) {
    contentType { file ->
        when (file.name) {
            "html-file.txt" -> ContentType.Text.Html
            else -> null
        }
    }
}
```

在此範例中，檔案 `html-file.txt` 的回應將具有 `Content-Type: text/html` 標頭，而對於其他所有檔案，則會套用預設行為。

### 快取 {id="caching"}

`cacheControl()` 函式允許您為 HTTP 快取配置 `Cache-Control` 標頭。

```kotlin
fun Application.module() {
    routing {
        staticFiles("/files", File("textFiles")) {
            cacheControl { file ->
                when (file.name) {
                    "file.txt" -> listOf(Immutable, CacheControl.MaxAge(10000))
                    else -> emptyList()
                }
            }
        }
    }
}
object Immutable : CacheControl(null) {
    override fun toString(): String = "immutable"
}
```

當安裝了 [`ConditionalHeaders`](server-conditional-headers.md) 外掛程式時，Ktor 可以服務帶有 `ETag` 和 `LastModified` 標頭的靜態資源，並處理條件標頭，以避免在自上次請求後內容未更改的情況下傳送內容主體：

```kotlin
staticFiles("/filesWithEtagAndLastModified", File("files")) {
    etag { resource -> EntityTagVersion("etag") }
    lastModified { resource -> GMTDate() }
}
```

在此範例中，`etag` 和 `lastModified` 的值是根據每個資源動態計算並套用於回應的。

為了簡化 `ETag` 的產生，您也可以使用預定義的提供者：

```kotlin
staticFiles("/filesWithStrongGeneratedEtag", File("files")) {
    etag(ETagProvider.StrongSha256)
}
```

在此範例中，會使用資源內容的 SHA‑256 雜湊產生強 `ETag`。
如果發生 I/O 錯誤，則不會產生 `ETag`。

> 關於 Ktor 快取的更多資訊，請參閱[快取標頭](server-caching-headers.md)。
>
{style="tip"}

### 排除的檔案 {id="exclude"}

`exclude()` 函式允許您將檔案排除在服務範圍之外。當用戶端請求排除的檔案時，伺服器將回應 `403 Forbidden` 狀態碼。

```kotlin
staticFiles("/files", File("textFiles")) {
    exclude { file -> file.path.contains("excluded") }
}
```

### 檔案副檔名備援 {id="extensions"}

當找不到請求的檔案時，Ktor 可以將指定的副檔名添加到檔名後並進行搜尋。

```kotlin
staticResources("/", "static"){
    extensions("html", "htm")
}
```

在此範例中，當請求 `/index` 時，Ktor 會搜尋 `/index.html` 並服務找到的內容。

### 自訂備援 {id="custom-fallback"}

要配置找不到請求的靜態資源時的自訂備援行為，請使用 `fallback()` 函式。
透過 `fallback()`，您可以檢查請求的路徑並決定如何回應。例如，您可以重新導向到另一個資源、傳回特定的 HTTP 狀態，或是服務替代檔案。

您可以在 `staticFiles()`、`staticResources()`、`staticZip()` 或 `staticFileSystem()` 內部加入 `fallback()`。回呼函式提供了請求的路徑和目前的 `ApplicationCall`。

下列範例顯示如何重新導向特定副檔名、傳回自訂狀態，或備援至 `index.html`：

```kotlin
staticFiles("/files", File("textFiles")) {
    fallback { requestedPath, call ->
        when {
            requestedPath.endsWith(".php") -> call.respondRedirect("/static/index.html") // 絕對路徑
            requestedPath.endsWith(".kt") -> call.respondRedirect("Default.kt") // 相對路徑
            requestedPath.endsWith(".xml") -> call.respond(HttpStatusCode.Gone)
            else -> call.respondFile(File("files/index.html"))
        }
    }
}
```

### 自訂修改 {id="modify"}

`modify()` 函式允許您對產生的回應套用自訂修改。

```kotlin
staticFiles("/", File("files")) {
    modify { file, call ->
        call.response.headers.append(HttpHeaders.ETag, file.name.toString())
    }
}
```

## 處理錯誤 {id="errors"}

如果找不到請求的內容，Ktor 會自動以 `404 Not Found` HTTP 狀態碼進行回應。

若要了解如何配置錯誤處理，請參閱[狀態頁面 (Status Pages)](server-status-pages.md)。