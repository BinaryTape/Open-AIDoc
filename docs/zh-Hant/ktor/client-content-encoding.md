[//]: # (title: 內容編碼)

<primary-label ref="client-plugin"/>

<var name="artifact_name" value="ktor-client-encoding"/>

<tldr>
<p>
<b>必要相依性</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="client-content-encoding"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
ContentEncoding 外掛程式允許您啟用指定的壓縮演算法（例如 'gzip' 和 'deflate'）並配置其設定。
</link-summary>

Ktor 用戶端提供 [`ContentEncoding`](https://api.ktor.io/ktor-client-encoding/io.ktor.client.plugins.compression/-content-encoding) 
外掛程式，允許您啟用指定的壓縮演算法（例如 `gzip` 和 `deflate`）並配置其設定。 

此外掛程式提供以下功能性：
* 使用指定的品質值設定 `Accept-Encoding` 標頭。
* 可選擇性地對請求主體進行編碼。
* 對[從伺服器接收的內容](client-responses.md#body)進行解碼，以取得原始負載。

## 新增相依性 {id="add_dependencies"}

若要使用 `ContentEncoding`，請在建置指令碼中包含 `%artifact_name%` 構件：

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
<tip>
    您可以從<Links href="/ktor/client-dependencies" summary="了解如何向現有專案新增用戶端相依性。">新增用戶端相依性</Links>中了解更多關於 Ktor 用戶端所需構件的資訊。
</tip>

## 安裝 ContentEncoding {id="install_plugin"}

若要安裝 `ContentEncoding`，請將其傳遞給[用戶端配置區塊](client-create-and-configure.md#configure-client)內的 `install` 函式：

```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.compression.*
//...
val client = HttpClient(CIO) {
    install(ContentEncoding)
}
```

## 配置 ContentEncoding {id="configure_plugin"}

### 啟用編碼器

您可以配置支援哪些編碼器並指定其品質值（用於 `Accept-Encoding` 標頭）。

下面的[範例](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-content-encoding)展示了如何以自訂品質值啟用 `deflate` 和 `gzip` 編碼器：

```kotlin
val client = HttpClient(CIO) {
    install(ContentEncoding) {
        deflate(1.0F)
        gzip(0.9F)
    }
}
```

如有需要，您可以實作 [`ContentEncoder`](https://api.ktor.io/ktor-utils/io.ktor.util/-content-encoder/index.html)
介面來建立自訂編碼器，並使用 `customEncoder()` 函式進行註冊。

### 設定 mode 屬性

預設情況下，`ContentEncoding` 僅處理回應解壓縮。您可以使用 `mode` 屬性來定義外掛程式的運作方式。

可用的值為：
<deflist>
<def>
<title><code>ContentEncodingConfig.Mode.DecompressResponse</code></title>
僅解壓縮回應。這是預設模式。
</def>
<def>
<title><code>ContentEncodingConfig.Mode.CompressRequest</code></title>
僅啟用請求主體壓縮。
</def>
<def>
<title><code>ContentEncodingConfig.Mode.All</code></title>
同時啟用回應解壓縮和請求壓縮。
</def>
</deflist>

## 對請求主體編碼 {id="encode_request_body"}

若要啟用請求壓縮，請設定 `mode` 屬性，並在 [`HttpRequestBuilder`](https://api.ktor.io/ktor-client-core/io.ktor.client.request/-http-request-builder/index.html) 區塊中使用 `compress()` 函式：

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

在此範例中：

* `mode = ContentEncodingConfig.Mode.CompressRequest` 啟用請求壓縮。
* `gzip()` 註冊 gzip 編碼器。
* `compress("gzip")` 將 gzip 壓縮套用於此特定請求。
* `Content-Encoding` 標頭會自動新增。

> 有關處理回應的更多詳細資訊，請參閱[接收回應](client-responses.md)。
>
{style="tip"}