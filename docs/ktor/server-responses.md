[//]: # (title: 发送响应)

<show-structure for="chapter" depth="2"/>

<link-summary>了解如何发送不同类型的响应。</link-summary>

Ktor 允许您在[路由处理程序](server-routing.md#define_route)内部处理传入的[请求](server-requests.md)并发送响应。您可以发送不同类型的响应：纯文本、HTML 文档和模板、序列化数据对象等。您还可以配置各种[响应参数](#parameters)，例如内容类型、标头、Cookie 和状态码。

在路由处理程序内部，可以使用以下 API 来处理响应：
* 一组用于[发送特定内容类型](#payload)的函数，例如 [`call.respondText()`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/respond-text.html) 和 [`call.respondHtml()`](https://api.ktor.io/ktor-server-html-builder/io.ktor.server.html/respond-html.html)。 
* [`call.respond()`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/respond.html) 函数，允许您在响应中[发送任何数据类型](#payload)。当安装了 [ContentNegotiation](server-serialization.md) 插件时，您可以发送以特定格式序列化的数据对象。
* [`call.response()`](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-application-call/response.html) 属性，返回 [`ApplicationResponse`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/-application-response/index.html) 对象，提供对[响应参数](#parameters)的访问，以便设置状态码、添加标头和配置 Cookie。
* [`call.respondRedirect()`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/respond-redirect.html) 函数，用于发送重定向响应。

## 设置响应负载 {id="payload"}

### 纯文本 {id="plain-text"}

要发送纯文本，请使用 [`call.respondText()`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/respond-text.html) 函数：
```kotlin
get("/") {
    call.respondText("Hello, world!")
}
```

### HTML {id="html"}

Ktor 提供了两种生成 HTML 响应的主要机制：
* 使用 Kotlin HTML DSL 构建 HTML。
* 使用 JVM 模板引擎（如 [FreeMarker](https://freemarker.apache.org/) 或 [Velocity](https://velocity.apache.org/engine/)）渲染模板。

#### 完整 HTML 文档 {id="full-html-documents"}

要发送使用 Kotlin DSL 构建的完整 HTML 文档，请使用 [`call.respondHtml()`](https://api.ktor.io/ktor-server-html-builder/io.ktor.server.html/respond-html.html) 函数：

```kotlin
get("/") {
    val name = "Ktor"
    call.respondHtml(HttpStatusCode.OK) {
        head {
            title {
                +name
            }
        }
        body {
            h1 {
                +"Hello from $name!"
            }
        }
    }
}
```

#### 部分 HTML 片段 {id="partial-html-fragments"}

如果您只需要返回 HTML 片段，而不将其包装在 `<html>`、`<head>` 或 `<body>` 中，可以使用 `call.respondHtmlPartial()`：

```kotlin
    get("/fragment") {
        call.respondHtmlPartial(HttpStatusCode.Created) {
            div("fragment") {
                span { +"Created!" }
            }
        }
    }
}
```

#### 模板 {id="templates"}

要在响应中发送模板，请将 [`call.respond()`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/respond.html) 函数与特定内容配合使用：
```kotlin
get("/index") {
    val sampleUser = User(1, "John")
    call.respond(FreeMarkerContent("index.ftl", mapOf("user" to sampleUser)))
}
```

您还可以使用 [`call.respondTemplate()`](https://api.ktor.io/ktor-server-freemarker/io.ktor.server.freemarker/respond-template.html) 函数：
```kotlin
get("/index") {
    val sampleUser = User(1, "John")
    call.respondTemplate("index.ftl", mapOf("user" to sampleUser))
}
```
您可以从[模板](server-templating.md)帮助部分了解更多信息。

### 对象 {id="object"}

要在 Ktor 中启用数据对象的序列化，您需要安装 [ContentNegotiation](server-serialization.md) 插件并注册所需的转换器（例如 JSON）。然后，您可以使用 [`call.respond()`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/respond.html) 函数在响应中传递数据对象：

```kotlin
routing {
    get("/customer/{id}") {
        val id: Int by call.parameters
        val customer: Customer = customerStorage.find { it.id == id }!!
        call.respond(customer)
```

有关完整示例，请参阅 [json-kotlinx](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/json-kotlinx)。

[//]: # (TODO: Check link for LocalPathFile)

### 文件 {id="file"}

要向客户端返回文件内容，您有两个选择：

- 对于表示为 `File` 对象的文件，请使用 [`call.respondFile()`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/respond-file.html) 函数。
- 对于由给定 `Path` 对象指向的文件，请将 `call.respond()` 函数与 [`LocalPathContent`](https://api.ktor.io/ktor-server-core/io.ktor.server.http.content/-local-path-content/index.html) 类配合使用。

下面的示例显示了如何通过添加 `Content-Disposition` [标头](#headers)来发送文件并使其可供下载：

```kotlin
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.http.content.*
import io.ktor.server.plugins.autohead.*
import io.ktor.server.plugins.partialcontent.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import java.io.File
import java.nio.file.Path

fun Application.main() {
    install(PartialContent)
    install(AutoHeadResponse)
    routing {
        get("/download") {
            val file = File("files/ktor_logo.png")
            call.response.header(
                HttpHeaders.ContentDisposition,
                ContentDisposition.Attachment.withParameter(ContentDisposition.Parameters.FileName, "ktor_logo.png")
                    .toString()
            )
            call.respondFile(file)
        }
        get("/downloadFromPath") {
            val filePath = Path.of("files/file.txt")
            call.response.header(
                HttpHeaders.ContentDisposition,
                ContentDisposition.Attachment.withParameter(ContentDisposition.Parameters.FileName, "file.txt")
                    .toString()
            )
            call.respond(LocalPathContent(filePath))
        }
    }
```

请注意，此示例使用了两个插件：
- [`PartialContent`](server-partial-content.md) 允许服务器响应带有 `Range` 标头的请求，并仅发送内容的一部分。
- [`AutoHeadResponse`](server-autoheadresponse.md) 提供了自动响应每个定义了 `GET` 的路由的 `HEAD` 请求的能力。这允许客户端应用程序通过读取 `Content-Length` 标头值来确定文件大小。

有关完整代码示例，请参阅 [download-file](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/download-file)。

### 资源 {id="resource"}

您可以使用 [`call.respondResource()`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/respond-resource.html) 方法从 <tooltip term="classpath">classpath</tooltip> 提供单个资源。
该方法接受指向资源的路径，并发送按以下方式构建的响应：
它从资源流中读取响应正文，并从文件扩展名派生 `Content-Type` 标头。

以下示例显示了路由处理程序中的方法调用：

```kotlin
routing {
    get("/resource") {
        call.respondResource("public/index.html")
    }
}
```

在上面的示例中，由于资源扩展名是 `.html`，因此响应将包含 `Content-Type: text/html` 标头。
为方便起见，您可以分别通过第一个和第二个形参传递资源位置的组成部分，即相对路径和软件包。
以下示例根据请求的路径解析 `assets` 软件包下的资源：

```kotlin
get("/assets/{rest-path...}") {
    var path = call.parameters["rest-path"]
    if (path.isNullOrEmpty()) {
        path = "index.html"
    }

    try {
        call.respondResource(path, "assets") {
            application.log.info(this.contentType.toString())
        }
    } catch (_: IllegalArgumentException) {
        call.respond(HttpStatusCode.NotFound)
    }
}
```

如果 `/assets` 前缀后的请求路径为空或为 `/`，处理程序将使用默认的 `index.html` 资源进行响应。如果在给定路径下未找到任何资源，则抛出 `IllegalArgumentException`。
前一个代码片段模拟了一个更通用的解决方案 —— 使用 [`staticResources()`](server-static-content.md#resources) 方法从软件包中提供资源。

### 原始负载 {id="raw"}

要发送原始正文负载，请使用 [`call.respondBytes()`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/respond-bytes.html) 函数。

## 设置响应参数 {id="parameters"}

### 状态码 {id="status"}

要为响应设置状态码，请调用 [`ApplicationResponse.status()`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/-application-response/status.html) 函数并使用预定义的状态码值：

```kotlin
get("/") {
    call.response.status(HttpStatusCode.OK)
}
```

您还可以指定自定义状态值：

```kotlin
get("/") {
    call.response.status(HttpStatusCode(418, "I'm a tea pot"))
}
```

> 所有发送负载的函数也提供了接受状态码的重载。
> 
{style="note"}

### 内容类型 {id="content-type"}

在安装了 [ContentNegotiation](server-serialization.md) 插件的情况下，Ktor 会自动选择内容类型。如果需要，您可以通过传递相应的形参手动指定内容类型。 

在下面的示例中，`call.respondText()` 函数接受 `ContentType.Text.Plain` 作为形参：

```kotlin
get("/") {
    call.respondText("Hello, world!", ContentType.Text.Plain, HttpStatusCode.OK)
}
```

### 标头 {id="headers"}

您可以通过多种方式向响应添加标头：
* 修改 [`ApplicationResponse.headers`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/-application-response/headers.html) 集合：
   ```kotlin
    get("/") {
        call.response.headers.append(HttpHeaders.ETag, "7c876b7e")
        
        // 对于同一个标头的多个值 
        call.response.headers.appendAll("X-Custom-Header" to listOf("value1", "value2"))
    }
   ```
  
* 使用 [`ApplicationResponse.header()`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/header.html) 函数：
   ```kotlin
   get("/") {
       call.response.header(HttpHeaders.ETag, "7c876b7e")
   }
   ```
  
* 使用特定标头的便捷函数，例如 `ApplicationResponse.etag`、`ApplicationResponse.link` 等。
   ```kotlin
   get("/") {
       call.response.etag("7c876b7e")
   }
   ```
  
* 通过传递原始字符串名称来添加自定义标头：
   ```kotlin
   get("/") {
       call.response.header("Custom-Header", "Some value")
   }
   ```

> 要自动包含标准的 `Server` 和 `Date` 标头，请安装 [DefaultHeaders](server-default-headers.md) 插件。
>
{type="tip"}

### Cookie {id="cookies"}

要配置响应中发送的 Cookie，请使用 [`ApplicationResponse.cookies`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/-application-response/cookies.html) 属性：
```kotlin
get("/") {
    call.response.cookies.append("yummy_cookie", "choco")
}
```

> Ktor 还提供了使用 Cookie 处理会话的功能。要了解更多信息，请参阅[会话](server-sessions.md)。

## 重定向 {id="redirect"}

要生成重定向响应，请使用 [`call.respondRedirect()`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/respond-redirect.html) 函数：

```kotlin
get("/") {
    call.respondRedirect("/moved", permanent = true)
}

get("/moved") {
    call.respondText("Moved content")
}