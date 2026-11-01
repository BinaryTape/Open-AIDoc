[//]: # (title: 默认请求)

<show-structure for="chapter" depth="2"/>
<primary-label ref="client-plugin"/>

<tldr>
<var name="example_name" value="client-default-request"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
DefaultRequest 插件允许你为所有请求配置默认形参。
</link-summary>

[`DefaultRequest`](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins/-default-request/index.html) 插件允许你为所有[请求](client-requests.md)配置默认形参：指定基础 URL、添加标头、配置查询形参等。

## 添加依赖项 {id="add_dependencies"}

`DefaultRequest` 仅需要 [ktor-client-core](client-dependencies.md) 构件，不需要任何特定的依赖项。

## 安装 DefaultRequest {id="install_plugin"}

要安装 `DefaultRequest`，请在[客户端配置块](client-create-and-configure.md#configure-client)中将其传递给 `install` 函数：

```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.*
//...
val client = HttpClient(CIO) {
    install(DefaultRequest)
}
```

或者调用 `defaultRequest()` 函数并[配置](#configure)所需的请求形参：

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

### 替换现有配置 {id="default_request_replace"}

如果已经安装了 `DefaultRequest` 插件，你可以通过以下方式之一替换其现有配置：

- 使用 `defaultRequest()` 函数的 `replace` 形参：

```kotlin
val client = HttpClient(CIO) {
    defaultRequest(replace = true) {
        // this: DefaultRequestBuilder
    }
}
```

- 使用泛型 `installOrReplace()` 函数：

```kotlin
val client = HttpClient(CIO) {
    installOrReplace(DefaultRequest) {
        // this: DefaultRequestBuilder
    }
}
```

## 配置 DefaultRequest {id="configure"}

### 基础 URL {id="url"}

`DefaultRequest` 允许你配置 URL 的基础部分，该部分会与[请求 URL](client-requests.md#url) 进行合并。
例如，下面的 `url` 函数为所有请求指定了一个基础 URL：

```kotlin
defaultRequest {
    url("https://ktor.io/docs/")
}
```

如果你使用具有上述配置的客户端发起以下请求，……

```kotlin
val response: HttpResponse = client.get("welcome.html")
```

……最终生成的 URL 将为：`https://ktor.io/docs/welcome.html`。
要了解基础 URL 与请求 URL 是如何合并的，请参阅 [DefaultRequest](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins/-default-request/index.html)。

> 基础 URL 路径必须以尾随斜杠结尾。否则，根据 [RFC 3986](https://www.rfc-editor.org/rfc/rfc3986#section-5.2)
> URL 解析规则，请求路径将替换基础路径的最后一个分段——例如，`path("v1")` 会被视为文件并在追加请求路径时被舍弃，
> 而 `path("v1/")` 则会被保留为目录前缀。
>
{style="note"}

### URL 形参 {id="url-params"}

`url` 函数还允许你分别指定各个 URL 组件，例如：
- HTTP scheme；
- 主机名；
- 基础 URL 路径；
- 查询形参。

```kotlin
url {
    protocol = URLProtocol.HTTPS
    host = "ktor.io"
    path("docs/")
    parameters.append("token", "abc123")
}
```

### 标头 {id="headers"}

要为每个请求添加特定标头，请使用 `header` 函数：

```kotlin
defaultRequest {
    header("X-Custom-Header", "Hello")
}
```

为避免重复标头，你可以使用 `appendIfNameAbsent`、`appendIfNameAndValueAbsent` 以及 `contains` 函数：

```kotlin
defaultRequest {
    headers.appendIfNameAbsent("X-Custom-Header", "Hello")
}
```

### Unix 域套接字 {id="unix-domain-sockets"}

> Unix 域套接字仅在 CIO 引擎中受支持。
>
{style="note"}

你可以[使用 Unix 域套接字构建单个请求](client-requests.md#specify-a-unix-domain-socket)，
但也可以使用套接字形参配置默认请求。

为此，请向 `defaultRequest` 函数传递包含套接字路径的 `unixSocket` 调用，
例如：

```kotlin
val client = HttpClient(CIO)

// 向 Unix 域套接字发送单个请求
val response: HttpResponse = client.get("/") {
    unixSocket("/tmp/test-unix-socket-ktor.sock")
}

// 为该客户端的所有请求设置套接字
val clientDefault = HttpClient(CIO) {
    defaultRequest {
        unixSocket("/tmp/test-unix-socket-ktor.sock")
    }    
}

val response: HttpResponse = clientDefault.get("/")
```

## 示例 {id="example"}

以下示例使用了如下 `DefaultRequest` 配置：
* `url` 函数定义了 HTTP scheme、主机、基础 URL 路径以及查询形参。
* `header` 函数为所有请求添加了一个自定义标头。

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

该客户端发起的以下请求仅指定了后续路径分段，并自动应用为 `DefaultRequest` 配置的形参：

```kotlin
val response: HttpResponse = client.get("welcome.html")
println(response.status)
```

你可以在此处找到完整示例：[client-default-request](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-default-request)。