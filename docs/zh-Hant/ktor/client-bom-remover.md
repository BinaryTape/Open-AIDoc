[//]: # (title: BOM 移除器)

<var name="artifact_name" value="ktor-client-bom-remover"/>
<primary-label ref="client-plugin"/>

<tldr>
<p>
<b>必要相依性</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="client-bom-remover"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
BOMRemover 外掛程式允許您從回應主體中移除位元組順序標記 (BOM)。
</link-summary>

[位元組順序標記 (BOM)](https://en.wikipedia.org/wiki/Byte_order_mark) 是編碼在 Unicode 檔案或串流中的字元。BOM 的主要目的是標示文字串流的編碼方式，以及 16 位元和 32 位元編碼的位元組順序。

在某些情況下，必須從回應主體中移除 BOM。例如，在 UTF-8 編碼中，BOM 是可選的，當不支援處理 BOM 的軟體讀取時，可能會導致問題。

Ktor 用戶端提供 [BOMRemover](https://api.ktor.io/ktor-client-bom-remover/io.ktor.client.plugins.bomremover/index.html) 外掛程式，可移除回應主體中 UTF-8、UTF-16 (BE)、UTF-16 (LE)、UTF-32 (BE) 及 UTF-32 (LE) 編碼的 BOM。

> 請注意，移除 BOM 時，Ktor 不會更改 `Content-Length` 標頭，該標頭會保留原始回應的長度。
>
{style="note"}

## 新增相依性 {id="add_dependencies"}

若要使用 `BOMRemover`，您需要在建置指令碼中包含 `%artifact_name%` 構件：

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
    您可以從 <Links href="/ktor/client-dependencies" summary="了解如何將用戶端相依性新增至現有專案。">新增用戶端相依性</Links> 進一步了解 Ktor 用戶端所需的構件。
</p>

## 安裝 BOMRemover {id="install_plugin"}

若要安裝 `BOMRemover`，請將其傳遞至 [用戶端配置區塊](client-create-and-configure.md#configure-client) 內的 `install` 函式：

```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.bomremover.*
//...
val client = HttpClient(CIO) {
    install(BOMRemover)
}