[//]: # (title: BOM 移除工具)

<var name="artifact_name" value="ktor-client-bom-remover"/>
<var name="ktor_version_catalog_name" value="ktorLibs.client.bomRemover"/>
<primary-label ref="client-plugin"/>

<tldr>
<p>
<b>必要相依性</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="client-bom-remover"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
BOMRemover 外掛程式可讓您從回應本文中移除位元組順序記號 (BOM)。
</link-summary>

[位元組順序記號 (BOM)](https://en.wikipedia.org/wiki/Byte_order_mark) 是一個編碼在 Unicode 檔案或資料流中的字元。BOM 的主要目的是標示文字資料流的編碼，以及 16 位元和 32 位元編碼的位元組順序。

在某些情況下，有必要從回應本文中移除 BOM。例如，在 UTF-8 編碼中，BOM 的存在是可選的，當遇到不知道如何處理 BOM 的軟體讀取時，可能會導致問題。

Ktor 用戶端提供了 [BOMRemover](https://api.ktor.io/ktor-client-bom-remover/io.ktor.client.plugins.bomremover/index.html) 外掛程式，可從採用 UTF-8、UTF-16 (BE)、UTF-16 (LE)、UTF-32 (BE) 和 UTF-32 (LE) 編碼的回應本文中移除 BOM。

> 請注意，移除 BOM 時，Ktor 不會變更 `Content-Length` 標頭，該標頭會保留初始回應的長度。
>
{style="note"}

## 新增相依性 {id="add_dependencies"}

若要使用 `BOMRemover`，您需要在建置指令碼中包含 `%artifact_name%` 構件：

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor version catalog</a> 來指定 Ktor 相依性。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor version catalog</a> 來指定 Ktor 相依性。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>
<tip>
    若要了解更多有關 Ktor 用戶端所需的構件，請參閱 <Links href="client-dependencies.md" summary="Learn how to add client dependencies to an existing project.">新增用戶端相依性</Links>。
</tip>

## 安裝 BOMRemover {id="install_plugin"}

若要安裝 `BOMRemover`，請在[用戶端配置區塊](client-create-and-configure.md#configure-client)內將其傳遞給 `install` 函式：

```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.bomremover.*
//...
val client = HttpClient(CIO) {
    install(BOMRemover)
}
```