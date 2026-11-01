[//]: # (title: 内容编码)

<primary-label ref="client-plugin"/>

<var name="artifact_name" value="ktor-client-encoding"/>
<var name="ktor_version_catalog_name" value="ktorLibs.client.encoding"/>

<tldr>
<p>
<b>所需依赖项</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="client-content-encoding"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
ContentEncoding 插件允许你启用指定的压缩算法（例如 'gzip' 和 'deflate'）并配置其设置。
</link-summary>

Ktor 客户端提供了 [`ContentEncoding`](https://api.ktor.io/ktor-client-encoding/io.ktor.client.plugins.compression/-content-encoding) 插件，允许你启用指定的压缩算法（例如 `gzip` 和 `deflate`）并配置其设置。 

该插件提供以下功能：
* 设置带有指定品质值的 `Accept-Encoding` 请求头。
* 可选地对请求体进行编码。
* 解码[从服务器接收到的内容](client-responses.md#body)以获取原始有效负载。

## 添加依赖项 {id="add_dependencies"}

要使用 `ContentEncoding`，请将 `%artifact_name%` 构件添加到你的构建脚本中：

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目录</a>来指定 Ktor 依赖项。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目录</a>来指定 Ktor 依赖项。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>
<tip>
    要详细了解 Ktor 客户端所需的构件，请参阅<Links href="client-dependencies.md" summary="了解如何向现有项目添加客户端依赖项。">添加客户端依赖项</Links>。
</tip>

## 安装 `ContentEncoding` {id="install_plugin"}

要安装 `ContentEncoding`，请在[客户端配置块](client-create-and-configure.md#configure-client)中将其传递给 `install` 函数：

```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.compression.*
//...
val client = HttpClient(CIO) {
    install(ContentEncoding)
}
```

## 配置 `ContentEncoding` {id="configure_plugin"}

### 启用编码器 {id="enable-encoders"}

你可以配置支持哪些编码器，并指定它们的品质值（用于 `Accept-Encoding` 请求头中）。

下面的[示例](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-content-encoding)启用了带有自定义品质值的 `deflate` 和 `gzip` 编码器：

```kotlin
val client = HttpClient(CIO) {
    install(ContentEncoding) {
        deflate(1.0F)
        gzip(0.9F)
    }
}
```

如有必要，你可以实现 [`ContentEncoder`](https://api.ktor.io/ktor-utils/io.ktor.util/-content-encoder/index.html) 接口以创建自定义编码器，并使用 `customEncoder()` 函数进行注册。

### 设置 `mode` 属性 {id="set-the-mode-property"}

默认情况下，`ContentEncoding` 仅处理响应解压缩。你可以使用 `mode` 属性来定义插件的工作方式。

可用值如下：
<deflist>
<def>
<title><code>ContentEncodingConfig.Mode.DecompressResponse</code></title>
仅解压缩响应。这是默认模式。
</def>
<def>
<title><code>ContentEncodingConfig.Mode.CompressRequest</code></title>
仅启用请求体压缩。
</def>
<def>
<title><code>ContentEncodingConfig.Mode.All</code></title>
同时启用响应解压缩与请求压缩。
</def>
</deflist>

## 编码请求体 {id="encode_request_body"}

要启用请求压缩，请设置 `mode` 属性并在 [`HttpRequestBuilder`](https://api.ktor.io/ktor-client-core/io.ktor.client.request/-http-request-builder/index.html) 块中使用 `compress()` 函数：

```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.compression.*
//...
val client = HttpClient(CIO) {
    install(ContentEncoding) {
        mode = ContentEncodingConfig.Mode.CompressRequest
        gzip()
    }
}
client.post("/upload") {
    compress("gzip")
    setBody(someLongBody)
}
```

在此示例中：

* `mode = ContentEncodingConfig.Mode.CompressRequest` 启用了请求压缩。
* `gzip()` 注册了 gzip 编码器。
* `compress("gzip")` 对该特定请求应用 gzip 压缩。
* `Content-Encoding` 请求头会自动添加。

> 有关处理响应的更多详情，请参阅[接收响应](client-responses.md)。
>
{style="tip"}