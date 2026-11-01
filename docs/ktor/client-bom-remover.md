[//]: # (title: BOM 移除器)

<var name="artifact_name" value="ktor-client-bom-remover"/>
<var name="ktor_version_catalog_name" value="ktorLibs.client.bomRemover"/>
<primary-label ref="client-plugin"/>

<tldr>
<p>
<b>所需依赖项</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="client-bom-remover"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
BOMRemover 插件允许你从响应体中移除字节顺序标记（BOM）。
</link-summary>

[字节顺序标记 (BOM)](https://en.wikipedia.org/wiki/Byte_order_mark) 是编码在 Unicode 文件或流中的一个字符。BOM 的主要作用是指明文本流的编码方式以及 16 位和 32 位编码的字节序。

在某些情况下，有必要从响应体中移除 BOM。例如，在 UTF-8 编码中，BOM 的存在是可选的，当被无法处理 BOM 的软件读取时，可能会引发问题。

Ktor 客户端提供了 [BOMRemover](https://api.ktor.io/ktor-client-bom-remover/io.ktor.client.plugins.bomremover/index.html) 插件，该插件可从 UTF-8、UTF-16 (BE)、UTF-16 (LE)、UTF-32 (BE) 和 UTF-32 (LE) 编码的响应体中移除 BOM。

> 请注意，在移除 BOM 时，Ktor 不会更改 `Content-Length` 标头，它仍会保留初始响应的长度。
>
{style="note"}

## 添加依赖项 {id="add_dependencies"}

要使用 `BOMRemover`，你需要在构建脚本中包含 `%artifact_name%` 工件：

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目录</a> 来指定 Ktor 依赖项。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目录</a> 来指定 Ktor 依赖项。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>
<tip>
    要了解更多信息，请参阅 Ktor 客户端所需的工件：<Links href="client-dependencies.md" summary="了解如何向现有项目添加客户端依赖项。">添加客户端依赖项</Links>。
</tip>

## 安装 BOMRemover {id="install_plugin"}

要安装 `BOMRemover`，请将其传递给 [客户端配置块](client-create-and-configure.md#configure-client) 中的 `install` 函数：

```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.bomremover.*
//...
val client = HttpClient(CIO) {
    install(BOMRemover)
}
```