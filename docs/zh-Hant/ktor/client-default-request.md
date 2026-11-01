[//]: # (title: 預設請求)

<show-structure for="chapter" depth="2"/>
<primary-label ref="client-plugin"/>

<tldr>
<var name="example_name" value="client-default-request"/>
<p>
    <b>程式碼範例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
DefaultRequest 外掛程式可讓您為所有請求設定預設參數。
</link-summary>

[`DefaultRequest`](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins/-default-request/index.html) 外掛程式可讓您為所有[請求](client-requests.md)設定預設參數：指定基礎 URL、新增標頭、配置查詢參數等等。

## 新增相依性 {id="add_dependencies"}

`DefaultRequest` 僅需要 [ktor-client-core](client-dependencies.md) 構件，不需要任何特定的相依性。

## 安裝 DefaultRequest {id="install_plugin"}

若要安裝 `DefaultRequest`，請將其傳遞給[用戶端配置區塊](client-create-and-configure.md#configure-client)內的 `install` 函式：

```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.*
//...
val client = HttpClient(CIO) {
    install(DefaultRequest)
}
```

或者呼叫 `defaultRequest()` 函式並[配置](#configure)所需的請求參數：

```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.*
//...
val client = HttpClient(CIO) {
    defaultRequest {
        // this: DefaultRequestBuilder
    }
}
```

### 替換現有配置 {id="default_request_replace"}

如果已經安裝了 `DefaultRequest` 外掛程式，您可以透過以下其中一種方式替換其現有配置：

- 使用 `defaultRequest()` 函式的 `replace` 參數：

```kotlin
val client = HttpClient(CIO) {
    defaultRequest(replace = true) {
        // this: DefaultRequestBuilder
    }
}
```

- 使用泛型 `installOrReplace()` 函式：

```kotlin
val client = HttpClient(CIO) {
    installOrReplace(DefaultRequest) {
        // this: DefaultRequestBuilder
    }
}
```

## 配置 DefaultRequest {id="configure"}

### 基礎 URL {id="url"}

`DefaultRequest` 可讓您配置 URL 的基礎部分，該部分會與[請求 URL](client-requests.md#url) 進行合併。
例如，下方的 `url` 函式為所有請求指定了一個基礎 URL：

```kotlin
defaultRequest {
    url("https://ktor.io/docs/")
}
```

如果您使用具有上述配置的用戶端發送以下請求，……

```kotlin
val response: HttpResponse = client.get("welcome.html")
```

……產生的 URL 將會是：`https://ktor.io/docs/welcome.html`。
若要了解基礎 URL 與請求 URL 如何合併，請參閱 [DefaultRequest](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins/-default-request/index.html)。

> 基礎 URL 路徑必須以結尾斜線結尾。否則，根據 [RFC 3986](https://www.rfc-editor.org/rfc/rfc3986#section-5.2)
> 的 URL 解析規則，請求路徑將會取代基礎路徑的最後一個片段——例如，`path("v1")` 會被視為檔案，並在附加請求路徑時被捨棄，而 `path("v1/")` 則會保留為目錄前綴。
>
{style="note"}

### URL 參數 {id="url-params"}

`url` 函式還允許您分別指定 URL 組件，例如：
- HTTP scheme；
- 主機名稱；
- 基礎 URL 路徑；
- 查詢參數。

```kotlin
url {
    protocol = URLProtocol.HTTPS
    host = "ktor.io"
    path("docs/")
    parameters.append("token", "abc123")
}
```

### 標頭 {id="headers"}

若要為每個請求新增特定標頭，請使用 `header` 函式：

```kotlin
defaultRequest {
    header("X-Custom-Header", "Hello")
}
```

為了避免重複標頭，您可以使用 `appendIfNameAbsent`、`appendIfNameAndValueAbsent` 和 `contains` 函式：

```kotlin
defaultRequest {
    headers.appendIfNameAbsent("X-Custom-Header", "Hello")
}
```

### Unix domain socket {id="unix-domain-sockets"}

> 僅 CIO 引擎支援 Unix domain socket。
>
{style="note"}

您可以[使用 Unix domain socket 建置個別請求](client-requests.md#specify-a-unix-domain-socket)，
但也可以使用 socket 參數來配置預設請求。

為此，請將包含 socket 路徑的 `unixSocket` 呼叫傳遞給 `defaultRequest` 函式，例如：

```kotlin
val client = HttpClient(CIO)

// 發送單一請求至 Unix domain socket
val response: HttpResponse = client.get("/") {
    unixSocket("/tmp/test-unix-socket-ktor.sock")
}

// 為該用戶端的所有請求設定 socket
val clientDefault = HttpClient(CIO) {
    defaultRequest {
        unixSocket("/tmp/test-unix-socket-ktor.sock")
    }    
}

val response: HttpResponse = clientDefault.get("/")
```

## 範例 {id="example"}

以下範例使用了下列 `DefaultRequest` 配置：
* `url` 函式定義了 HTTP scheme、主機、基礎 URL 路徑以及查詢參數。
* `header` 函式為所有請求新增自訂標頭。

```kotlin
val client = HttpClient(CIO) {
    defaultRequest {
        url {
            protocol = URLProtocol.HTTPS
            host = "ktor.io"
            path("docs/")
            parameters.append("token", "abc123")
        }
        header("X-Custom-Header", "Hello")
    }
}
```

此用戶端所發出的以下請求僅指定了後續的路徑片段，並會自動套用為 `DefaultRequest` 所配置的參數：

```kotlin
val response: HttpResponse = client.get("welcome.html")
println(response.status)
```

您可以在此處找到完整的範例：[client-default-request](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-default-request)。