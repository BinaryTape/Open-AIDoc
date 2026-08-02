[//]: # (title: 压缩)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="artifact_name" value="ktor-server-compression"/>
<var name="package_name" value="io.ktor.server.plugins.compression"/>
<var name="plugin_name" value="Compression"/>

<tldr>
<p>
<b>所需依赖项</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="compression"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">原生服务器</Links> 支持</b>：✖️
</p>
</tldr>

Ktor 提供了通过使用 [`Compression`](https://api.ktor.io/ktor-server-compression/io.ktor.server.plugins.compression/-compression.html) 插件来压缩响应主体和解压缩请求主体的功能。

使用 `Compression` 插件，您可以：
- 使用不同的压缩算法，包括 `gzip`、`zstd` 和 `deflate`。
- 指定压缩数据的必要条件，例如内容类型或响应大小。
- 根据特定的请求参数压缩数据。

> 请注意，`%plugin_name%` 插件目前不支持 `SSE` 响应。
>
{style="warning"}

> 要了解如何在 Ktor 中提供预压缩的静态文件，请参阅[预压缩文件](server-static-content.md#precompressed)。

## 添加依赖项 {id="add_dependencies"}

<p>
    要使用 <code>%plugin_name%</code>，您需要在构建脚本中包含 <code>%artifact_name%</code> 构件：
</p>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"/>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"/>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

要包含 Zstandard 压缩，请添加 `ktor-server-compression-zstd` 依赖项：

   <var name="artifact_name" value="ktor-server-compression-zstd"/>
   <Tabs group="languages">
       <TabItem title="Gradle (Kotlin)" group-key="kotlin">
           <code-block lang="Kotlin" code="               implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"/>
       </TabItem>
       <TabItem title="Gradle (Groovy)" group-key="groovy">
           <code-block lang="Groovy" code="               implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"/>
       </TabItem>
       <TabItem title="Maven" group-key="maven">
           <code-block lang="XML" code="               &lt;dependency&gt;&#10;                   &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                   &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                   &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;               &lt;/dependency&gt;"/>
       </TabItem>
   </Tabs>

## 安装 %plugin_name% {id="install_plugin"}

<p>
    要将 <code>%plugin_name%</code> 插件<a href="#install">安装</a>到应用程序，请将其传递给指定 <Links href="/ktor/server-modules" summary="Modules allow you to structure your application by grouping routes.">模块</Links> 中的 <code>install</code> 函数。以下代码片段展示了如何安装 <code>%plugin_name%</code> ...
</p>
<list>
    <li>
        ... 在 <code>embeddedServer</code> 函数调用内部。
    </li>
    <li>
        ... 在显式定义的 <code>module</code>（它是 <code>Application</code> 类的扩展函数）内部。
    </li>
</list>
<Tabs>
    <TabItem title="embeddedServer">
        <code-block lang="kotlin" code="            import io.ktor.server.engine.*&#10;            import io.ktor.server.netty.*&#10;            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;&#10;            fun main() {&#10;                embeddedServer(Netty, port = 8080) {&#10;                    install(%plugin_name%)&#10;                    // ...&#10;                }.start(wait = true)&#10;            }"/>
    </TabItem>
    <TabItem title="module">
        <code-block lang="kotlin" code="            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;            // ...&#10;            fun Application.module() {&#10;                install(%plugin_name%)&#10;                // ...&#10;            }"/>
    </TabItem>
</Tabs>

这将在服务器上启用 `gzip`、`deflate` 和 `identity` 编码器。

## 配置压缩设置 {id="configure"}

您可以通过多种方式配置压缩：仅启用特定的编码器、指定其优先级、仅压缩特定的内容类型，等等。

### 添加特定编码器 {id="add_specific_encoders"}

要仅启用特定的编码器，请调用相应的扩展函数，例如：

```kotlin
install(Compression) {
    gzip()
    deflate()
    zstd()
}
```

您可以通过设置 `priority` 属性来为每个压缩算法指定优先级：

```kotlin
install(Compression) {
    gzip {
        priority = 0.9
    }
    deflate {
        priority = 1.0
    }
    zstd {
        priority = 0.8
    }
}
```

在上面的示例中，`deflate` 具有更高的优先级值，并且优先于 `gzip` 和 `zstd`。请注意，服务器首先查看 [Accept-Encoding](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Encoding) 标头中的[质量](https://developer.mozilla.org/en-US/docs/Glossary/Quality_Values)值，然后考虑指定的优先级。

### 配置内容类型 {id="configure_content_type"}

默认情况下，Ktor 不压缩特定的内容类型，例如 `audio`、`video`、`image` 和 `text/event-stream`。您可以通过调用 `matchContentType` 来选择要压缩的内容类型，或者通过使用 `excludeContentType` 从压缩中排除所需的媒体类型。以下代码片段展示了如何使用 `gzip` 压缩 JavaScript 代码，并使用 `deflate` 压缩所有文本子类型：

```kotlin
install(Compression) {
    gzip {
        matchContentType(
            ContentType.Application.JavaScript
        )
    }
    deflate {
        matchContentType(
            ContentType.Text.Any
        )
    }
}
```

您可以在此处找到完整示例：[compression](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/compression)。

### 配置响应大小 {id="configure_response_size"}

`%plugin_name%` 插件允许您对大小不超过指定值的响应禁用压缩。为此，请将所需的值（以字节为单位）传递给 `minimumSize` 函数：

```kotlin
    install(Compression) {
    deflate {
        minimumSize(1024)
    }
}

```

### 指定自定义条件 {id="specify_custom_conditions"}

如有必要，您可以使用 `condition` 函数提供自定义条件，并根据特定的请求参数压缩数据。以下代码片段展示了如何为指定的 URI 压缩请求：

```kotlin
install(Compression) {
    gzip {
        condition {
            request.uri == "/orders"
        }
    }
}
```

## HTTPS 安全性 {id="security"}

启用压缩的 HTTPS 容易受到 [BREACH](https://en.wikipedia.org/wiki/BREACH) 攻击。您可以使用各种方法来缓解此攻击。例如，只要 referrer 标头指示跨站请求，您就可以禁用压缩。在 Ktor 中，这可以通过检查 referrer 标头值来实现：

```kotlin
install(Compression) {
    gzip {
        condition {
            request.headers[HttpHeaders.Referrer]?.startsWith("https://my.domain/") == true
        }
    }
}
```

## Zstandard 压缩级别 {id="compression_level"}

您可以使用 `level` 参数配置 `zstd` 的压缩级别。默认压缩级别为 `3`，但您可以根据需要进行调整。

```kotlin
install(Compression) {
    // 默认为 level = 3
    zstd(level = 20)
}
```

## 解压缩 {id="decompression"}

默认情况下，`Compression` 插件压缩服务器响应。要启用请求解压缩，请将 `mode` 属性设置为 `CompressionConfig.Mode.DecompressRequest`：

```kotlin
install(Compression) { 
    mode = CompressionConfig.Mode.DecompressRequest
    gzip()
}
```

启用请求解压缩后，插件将使用配置的解码器在请求主体被其他接收转换（例如反序列化和多部分处理）处理之前对其进行解压缩。

## 实现自定义编码器 {id="custom_encoder"}

如有必要，您可以通过实现 [`ContentEncoder`](https://api.ktor.io/ktor-utils/io.ktor.util/-content-encoder/index.html) 接口来提供您自己的编码器。请参阅 [`GzipEncoder`](https://github.com/ktorio/ktor/blob/b5b59ca3ae61601e6175f334e6a1252609638e61/ktor-server/ktor-server-plugins/ktor-server-compression/jvm/src/io/ktor/server/plugins/compression/Encoders.kt#L41) 作为实现的示例。