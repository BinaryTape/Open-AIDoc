[//]: # (title: 傳送回應)

<show-structure for="chapter" depth="2"/>

<link-summary>了解如何傳送不同類型的回應。</link-summary>

Ktor 允許你在 [路由處理常式](server-routing.md#define_route) 中處理傳入的 [要求](server-requests.md) 並傳送回應。你可以傳送不同類型的回應：純文字、HTML 文件與範本、序列化的資料物件等等。你也可以配置各種 [回應參數](#parameters)，例如內容類型、標頭、Cookie 以及狀態碼。

在路由處理常式中，可以使用以下 API 來處理回應：
* 一組用於 [傳送特定內容類型](#payload) 的函式，例如 [`call.respondText()`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/respond-text.html) 與 [`call.respondHtml()`](https://api.ktor.io/ktor-server-html-builder/io.ktor.server.html/respond-html.html)。 
* [`call.respond()`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/respond.html) 函式，允許你在回應中 [傳送任何資料型別](#payload)。當安裝了 [ContentNegotiation](server-serialization.md) 外掛程式後，你可以傳送以特定格式序列化的資料物件。
* [`call.response()`](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-application-call/response.html) 屬性，它會傳回 [`ApplicationResponse`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/-application-response/index.html) 物件，提供對 [回應參數](#parameters) 的存取，以便設定狀態碼、新增標頭以及配置 Cookie。
* [`call.respondRedirect()`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/respond-redirect.html) 函式，用於傳送重新導向回應。

## 設定回應酬載 {id="payload"}

### 純文字 {id="plain-text"}

若要傳送純文字，請使用 [`call.respondText()`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/respond-text.html) 函式：
```kotlin
get("/") {
    call.respondText("Hello, world!")
}
```

### HTML {id="html"}

Ktor 提供兩種產生 HTML 回應的主要機制：
* 使用 Kotlin HTML DSL 建置 HTML。
* 使用 JVM 範本引擎（例如 [FreeMarker](https://freemarker.apache.org/) 或 [Velocity](https://velocity.apache.org/engine/)）轉譯範本。

#### 完整的 HTML 文件 {id="full-html-documents"}

若要傳送使用 Kotlin DSL 建置的完整 HTML 文件，請使用 [`call.respondHtml()`](https://api.ktor.io/ktor-server-html-builder/io.ktor.server.html/respond-html.html) 函式：

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

如果你只需要傳回 HTML 片段，而不將其封裝在 `<html>`、`<head>` 或 `<body>` 中，可以使用 `call.respondHtmlPartial()`：

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

#### 範本 {id="templates"}

若要在回應中傳送範本，請使用 [`call.respond()`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/respond.html) 函式並指定內容：
```kotlin
get("/index") {
    val sampleUser = User(1, "John")
    call.respond(FreeMarkerContent("index.ftl", mapOf("user" to sampleUser)))
}
```

你也可以使用 [`call.respondTemplate()`](https://api.ktor.io/ktor-server-freemarker/io.ktor.server.freemarker/respond-template.html) 函式：
```kotlin
get("/index") {
    val sampleUser = User(1, "John")
    call.respondTemplate("index.ftl", mapOf("user" to sampleUser))
}
```
你可以從 [範本製作 (Templating)](server-templating.md) 說明章節中了解更多資訊。

### 物件 {id="object"}

欲在 Ktor 中啟用資料物件的序列化，你需要安裝 [ContentNegotiation](server-serialization.md) 外掛程式並註冊所需的轉換器（例如 JSON）。接著，你可以使用 [`call.respond()`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/respond.html) 函式在回應中傳遞資料物件：

```kotlin
routing {
    get("/customer/{id}") {
        val id: Int by call.parameters
        val customer: Customer = customerStorage.find { it.id == id }!!
        call.respond(customer)
```

有關完整範例，請參閱 [json-kotlinx](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/json-kotlinx)。

[//]: # (TODO: Check link for LocalPathFile)

### 檔案 {id="file"}

若要以檔案內容回應用戶端，你有兩個選項：

- 對於以 `File` 物件表示的檔案，請使用 [`call.respondFile()`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/respond-file.html) 函式。
- 對於由給定 `Path` 物件指向的檔案，請使用 `call.respond()` 函式搭配 [`LocalPathContent`](https://api.ktor.io/ktor-server-core/io.ktor.server.http.content/-local-path-content/index.html) 類別。

以下範例顯示如何傳送檔案，並透過新增 `Content-Disposition` [標頭](#headers) 使其可供下載：

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

請注意，此範例使用了兩個外掛程式：
- [`PartialContent`](server-partial-content.md) 允許伺服器回應帶有 `Range` 標頭的要求，並僅傳送部分內容。
- [`AutoHeadResponse`](server-autoheadresponse.md) 提供了對每個已定義 `GET` 路由自動回應 `HEAD` 要求的功能。這允許用戶端應用程式透過讀取 `Content-Length` 標頭值來確定檔案大小。

有關完整程式碼範例，請參閱 [download-file](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/download-file)。

### 資源 {id="resource"}

你可以使用 [`call.respondResource()`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/respond-resource.html) 方法從 <tooltip term="classpath">類別路徑 (classpath)</tooltip> 提供單一資源。
此方法接受資源路徑並傳送以下列方式建構的回應：
它從資源串流中讀取回應主體，並從副檔名推導出 `Content-Type` 標頭。

以下範例顯示了路由處理常式中的方法呼叫：

```kotlin
routing {
    get("/resource") {
        call.respondResource("public/index.html")
    }
}
```

在上面的範例中，由於資源副檔名為 `.html`，因此回應將包含 `Content-Type: text/html` 標頭。
為了方便起見，你可以分別透過第一個和第二個參數傳遞資源位置的組件，即相對路徑和套件。
以下範例根據請求的路徑解析 `assets` 套件下的資源：

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

如果 `/assets` 前綴後的請求路徑為空或為 `/`，則處理常式使用預設的 `index.html` 資源進行回應。如果在給定路徑下找不到資源，則會拋出 `IllegalArgumentException`。
先前的程式碼片段模擬了一個更通用的解決方案 — 使用 [`staticResources()`](server-static-content.md#resources) 方法從套件提供資源。

### 原始酬載 {id="raw"}

若要傳送原始主體酬載，請使用 [`call.respondBytes()`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/respond-bytes.html) 函式。

## 設定回應參數 {id="parameters"}

### 狀態碼 {id="status"}

若要為回應設定狀態碼，請呼叫 [`ApplicationResponse.status()`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/-application-response/status.html) 函式並傳入預定義的狀態碼值：

```kotlin
get("/") {
    call.response.status(HttpStatusCode.OK)
}
```

你也可以指定自訂狀態值：

```kotlin
get("/") {
    call.response.status(HttpStatusCode(418, "I'm a tea pot"))
}
```

> 所有傳送酬載的函式也都提供了接受狀態碼的多載版本。
> 
{style="note"}

### 內容類型 {id="content-type"}

安裝 [ContentNegotiation](server-serialization.md) 外掛程式後，Ktor 會自動選擇內容類型。如有需要，你可以透過傳遞對應的參數來手動指定內容類型。 

在下面的範例中，`call.respondText()` 函式接受 `ContentType.Text.Plain` 作為參數：

```kotlin
get("/") {
    call.respondText("Hello, world!", ContentType.Text.Plain, HttpStatusCode.OK)
}
```

### 標頭 {id="headers"}

你可以透過多種方式向回應新增標頭：
* 修改 [`ApplicationResponse.headers`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/-application-response/headers.html) 集合：
   ```kotlin
    get("/") {
        call.response.headers.append(HttpHeaders.ETag, "7c876b7e")
        
        // 對於同一個標頭有多個值的情況 
        call.response.headers.appendAll("X-Custom-Header" to listOf("value1", "value2"))
    }
   ```
  
* 使用 [`ApplicationResponse.header()`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/header.html) 函式：
   ```kotlin
   get("/") {
       call.response.header(HttpHeaders.ETag, "7c876b7e")
   }
   ```
  
* 使用特定標頭的便捷函式，例如 `ApplicationResponse.etag`、`ApplicationResponse.link` 等。
   ```kotlin
   get("/") {
       call.response.etag("7c876b7e")
   }
   ```
  
* 透過傳遞原始字串名稱來新增自訂標頭：
   ```kotlin
   get("/") {
       call.response.header("Custom-Header", "Some value")
   }
   ```

> 若要自動包含標準的 `Server` 與 `Date` 標頭，請安裝 [DefaultHeaders](server-default-headers.md) 外掛程式。
>
{type="tip"}

### Cookie {id="cookies"}

若要配置在回應中傳送的 Cookie，請使用 [`ApplicationResponse.cookies`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/-application-response/cookies.html) 屬性：
```kotlin
get("/") {
    call.response.cookies.append("yummy_cookie", "choco")
}
```

> Ktor 也提供了使用 Cookie 處理工作階段的功能。若要了解更多資訊，請參閱 [工作階段 (Sessions)](server-sessions.md)。

## 重新導向 {id="redirect"}

若要產生重新導向回應，請使用 [`call.respondRedirect()`](https://api.ktor.io/ktor-server-core/io.ktor.server.response/respond-redirect.html) 函式：

```kotlin
get("/") {
    call.respondRedirect("/moved", permanent = true)
}

get("/moved") {
    call.respondText("Moved content")
}