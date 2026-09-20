[//]: # (title: 提供静态内容)

<show-structure for="chapter" depth="2"/>

<tldr>
<p><b>代码示例</b>：
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/static-files">static-files</a>,
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/static-resources">static-resources</a>,
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/static-zip">static-zip</a>
</p>
</tldr>

<link-summary>
了解如何提供静态内容，例如样式表、脚本、图像等。
</link-summary>

无论您是在创建网站还是 HTTP 端点，您的应用程序都可能需要提供文件，例如样式表、脚本或图像。
虽然在 Ktor 中确实可以加载文件内容并将其[在响应中发送](server-responses.md)给客户端，但 Ktor 通过提供额外的函数来提供静态内容，从而简化了这一过程。

使用 Ktor，您可以提供来自[文件夹](#folders)、[ZIP 文件](#zipped)以及[嵌入式应用程序资源](#resources)的内容。

## 文件夹 {id="folders"}

要从本地文件系统提供静态文件，请使用
[`staticFiles()`](https://api.ktor.io/ktor-server-core/io.ktor.server.http.content/static-files.html)
函数。在这种情况下，相对路径将使用当前工作目录进行解析。

 ```kotlin
 routing {
     staticFiles("/resources", File("files"))
 }
 ```

在上面的示例中，任何来自 `/resources` 的请求都会映射到当前工作目录中的 `files` 物理文件夹。
只要 URL 路径和物理文件名匹配，Ktor 就会递归地提供 `files` 中的任何文件。

有关完整示例，请参阅 [static-files](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/static-files)。

## ZIP 文件 {id="zipped"}

为了从 ZIP 文件提供静态内容，Ktor 提供了 [
`staticZip()`](https://api.ktor.io/ktor-server-core/io.ktor.server.http.content/static-zip.html) 函数。
这允许您将请求直接映射到 ZIP 归档的内容，如下例所示：

 ```kotlin
 routing {
     staticZip("/", "/", Paths.get("files/text-files.zip"))
 }
 ```

在此示例中，任何来自根 URL `/` 的请求都会直接映射到 ZIP 文件 `text-files.zip` 的内容。

### 自动重载支持 {id="zip-auto-reload"}

`staticZip()` 函数还支持自动重载。如果在 ZIP 文件的父目录中检测到任何更改，ZIP 文件系统将在下一次请求时重新加载。这确保了所提供的内容保持最新，而无需重启服务器。

有关完整示例，请参阅 [static-zip](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/static-zip)。

## 资源 {id="resources"}

要从类路径提供内容，请使用
[`staticResources()`](https://api.ktor.io/ktor-server-core/io.ktor.server.http.content/static-resources.html)
函数。

```kotlin
routing {
    staticResources("/resources", "static")
}
```

这会将来自 `/resources` 的任何请求映射到应用程序资源中的 `static` 软件包。
在这种情况下，只要 URL 路径与资源路径匹配，Ktor 就会递归地提供 `static` 软件包中的任何文件。

有关完整示例，请参阅 [static-resources](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/static-resources)。

## 额外配置 {id="configuration"}

Ktor 为静态文件和资源提供了更多配置。

### 索引文件 {id="index"}

如果存在名为 `index.html` 的文件，Ktor 在请求目录时将默认提供该文件。您可以使用 `index` 参数设置自定义索引文件：

```kotlin
staticResources("/custom", "static", index = "custom_index.html")
```

在这种情况下，当请求 `/custom` 时，Ktor 会提供 `/custom_index.html`。

### 预压缩文件 {id="precompressed"}

Ktor 可以提供预压缩的静态文件，而不是使用 [Compression](server-compression.md) 插件动态压缩响应。

要启用此功能，请使用 `preCompressed()` 函数并指定支持的压缩格式：

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

当客户端请求静态文件时，Ktor 会检查客户端支持的内容编码，并在可用时提供匹配的预压缩版本。

例如，对于发往 `/js/script.js` 的请求，Ktor 可以提供预压缩变体，例如 `/js/script.js.br` 或 `/js/script.js.gz`。

### HEAD 请求 {id="autohead"}

`enableAutoHeadResponse()` 函数允许您自动响应静态路由中每个已定义 `GET` 路径的 `HEAD` 请求。

```kotlin
staticResources("/", "static"){
    enableAutoHeadResponse()
}
```

### 默认文件响应 {id="default-file"}

`default()` 函数提供了在静态路由中为任何没有对应文件的请求回复一个文件的能力。

```kotlin
staticFiles("/", File("files")) {
    default("index.html")
}
```

在此示例中，当客户端请求一个不存在的资源时，将提供 `index.html` 文件作为响应。

### 内容类型 {id="content-type"}

默认情况下，Ktor 会尝试从文件扩展名中推测 `Content-Type` 标头的值。您可以使用 `contentType()` 函数显式设置 `Content-Type` 标头。

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

在此示例中，文件 `html-file.txt` 的响应将包含 `Content-Type: text/html` 标头，而对于其他每个文件，将应用默认行为。

### 缓存 {id="caching"}

`cacheControl()` 函数允许您为 HTTP 缓存配置 `Cache-Control` 标头。

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

当安装了 [`ConditionalHeaders`](server-conditional-headers.md) 插件时，Ktor 可以提供带有 `ETag` 和 `LastModified` 标头的静态资源，并处理条件标头，以避免在自上次请求以来内容未发生更改的情况下发送内容主体：

```kotlin
staticFiles("/filesWithEtagAndLastModified", File("files")) {
    etag { resource -> EntityTagVersion("etag") }
    lastModified { resource -> GMTDate() }
}
```

在此示例中，`etag` 和 `lastModified` 的值是根据每个资源动态计算并应用于响应的。

为了简化 `ETag` 生成，您还可以使用预定义的提供程序：

```kotlin
staticFiles("/filesWithStrongGeneratedEtag", File("files")) {
    etag(ETagProvider.StrongSha256)
}
```

在此示例中，使用资源内容的 SHA-256 哈希生成一个强 `ETag`。
如果发生 I/O 错误，则不会生成 `ETag`。

> 有关 Ktor 缓存的更多信息，请参阅[缓存标头](server-caching-headers.md)。
>
{style="tip"}

### 排除的文件 {id="exclude"}

`exclude()` 函数允许您排除不被提供服务的文件。当客户端请求被排除的文件时，服务器将响应 `403 Forbidden` 状态码。

```kotlin
staticFiles("/files", File("textFiles")) {
    exclude { file -> file.path.contains("excluded") }
}
```

### 文件扩展名回退 {id="extensions"}

当找不到请求的文件时，Ktor 可以将给定的扩展名添加到文件名中并进行搜索。

```kotlin
staticResources("/", "static"){
    extensions("html", "htm")
}
```

在此示例中，当请求 `/index` 时，Ktor 将搜索 `/index.html` 并提供找到的内容。

### 自定义回退 {id="custom-fallback"}

要配置当找不到请求的静态资源时的自定义回退行为，请使用 `fallback()` 函数。
通过 `fallback()`，您可以检查请求的路径并决定如何响应。例如，您可以重定向到另一个资源、返回特定的 HTTP 状态或提供替代文件。

您可以在 `staticFiles()`、`staticResources()`、`staticZip()` 或 `staticFileSystem()` 中添加 `fallback()`。回调提供了请求的路径和当前的 `ApplicationCall`。

下面的示例展示了如何重定向某些扩展名、返回自定义状态或回退到 `index.html`：

```kotlin
staticFiles("/files", File("textFiles")) {
    fallback { requestedPath, call ->
        when {
            requestedPath.endsWith(".php") -> call.respondRedirect("/static/index.html") // 绝对路径
            requestedPath.endsWith(".kt") -> call.respondRedirect("Default.kt") // 相对路径
            requestedPath.endsWith(".xml") -> call.respond(HttpStatusCode.Gone)
            else -> call.respondFile(File("files/index.html"))
        }
    }
}
```

### 自定义修改 {id="modify"}

`modify()` 函数允许您对生成的响应应用自定义修改。

```kotlin
staticFiles("/", File("files")) {
    modify { file, call ->
        call.response.headers.append(HttpHeaders.ETag, file.name.toString())
    }
}
```

## 处理错误 {id="errors"}

如果找不到请求的内容，Ktor 将自动响应 `404 Not Found` HTTP 状态码。

要了解如何配置错误处理，请参阅[状态页面](server-status-pages.md)。