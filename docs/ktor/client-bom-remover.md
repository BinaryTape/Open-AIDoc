[//]: # (title: BOM 移除程序)

<var name="artifact_name" value="ktor-client-bom-remover"/>
<primary-label ref="client-plugin"/>

<tldr>
<p>
<b>所需依赖项</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="client-bom-remover"/>
<p>
    <b>代码示例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
BOMRemover 插件允许您从响应体中移除字节顺序标记 (BOM)。
</link-summary>

[字节顺序标记 (BOM)](https://en.wikipedia.org/wiki/Byte_order_mark) 是 Unicode 文件或流中编码的一个字符。BOM 的主要目的是指示文本流的编码方式以及 16 位和 32 位编码的字节顺序。

在某些情况下，有必要从响应体中移除 BOM。例如，在 UTF-8 编码中，BOM 的存在是可选的，当它被不知道如何处理 BOM 的软件读取时，可能会导致问题。

Ktor 客户端提供了 [BOMRemover](https://api.ktor.io/ktor-client-bom-remover/io.ktor.client.plugins.bomremover/index.html) 插件，用于从 UTF-8、UTF-16 (BE)、UTF-16 (LE)、UTF-32 (BE) 和 UTF-32 (LE) 编码的响应体中移除 BOM。

> 请注意，在移除 BOM 时，Ktor 不会更改 `Content-Length` 标头，该标头将保留初始响应的长度。
>
{style="note"}

## 添加依赖项 {id="add_dependencies"}

要使用 `BOMRemover`，您需要在构建脚本中包含 `%artifact_name%` 工件：

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"></code-block>
    </TabItem>
</Tabs>
<p>
    您可以从 <Links href="/ktor/client-dependencies" summary="了解如何向现有项目添加客户端依赖项。">添加客户端依赖项</Links> 中了解更多关于 Ktor 客户端所需工件的信息。
</p>

## 安装 BOMRemover {id="install_plugin"}

要安装 `BOMRemover`，请将其传递给 [客户端配置块](client-create-and-configure.md#configure-client) 内部的 `install` 函数：

```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.bomremover.*
//...
val client = HttpClient(CIO) {
    install(BOMRemover)
}