[//]: # (title: 壓縮 (Compression))

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="artifact_name" value="ktor-server-compression"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.compression"/>
<var name="package_name" value="io.ktor.server.plugins.compression"/>
<var name="plugin_name" value="Compression"/>

<tldr>
<p>
<b>必要相依性</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="compression"/>
<p>
    <b>程式碼範例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor 支援 Kotlin/Native，並允許你在沒有額外執行階段或虛擬機的情況下執行伺服器。">Native 伺服器</Links>支援</b>: ✖️
</p>
</tldr>

Ktor 透過 [`Compression`](https://api.ktor.io/ktor-server-compression/io.ktor.server.plugins.compression/-compression.html) 外掛程式提供壓縮回應主體與解壓縮請求主體的功能。

透過 `Compression` 外掛程式，你可以：
- 使用不同的壓縮演算法，包含 `gzip`、`zstd` 和 `deflate`。
- 指定壓縮資料所需的條件，例如內容類型或回應大小。
- 根據特定請求參數壓縮資料。

> 請注意，`%plugin_name%` 外掛程式目前不支援 `SSE` 回應。
>
{style="warning"}

> 若要了解如何在 Ktor 中提供預先壓縮的靜態檔案，請參閱[預先壓縮檔案](server-static-content.md#precompressed)。

## 新增相依性 {id="add_dependencies"}

<p>
    若要使用 <code>%plugin_name%</code>，請將 <code>%artifact_name%</code> 產物新增至你的組建指令碼中：
</p>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目錄 (Version Catalog)</a> 來指定 Ktor 相依性。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目錄 (Version Catalog)</a> 來指定 Ktor 相依性。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

若要包含 Zstandard 壓縮，請新增 `ktor-server-compression-zstd` 相依性：

   <var name="artifact_name" value="ktor-server-compression-zstd"/>
   <var name="ktor_version_catalog_name" value="ktorLibs.server.compression.zstd"/>
   <Tabs group="languages">
       <TabItem title="Gradle (Kotlin)" group-key="kotlin">
           <code-block lang="Kotlin" code="               implementation(%ktor_version_catalog_name%)"/>
           <note>
               上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
               Ktor 版本目錄 (Version Catalog)</a> 來指定 Ktor 相依性。
           </note>
       </TabItem>
       <TabItem title="Gradle (Groovy)" group-key="groovy">
           <code-block lang="Groovy" code="               implementation %ktor_version_catalog_name%"/>
           <note>
               上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
               Ktor 版本目錄 (Version Catalog)</a> 來指定 Ktor 相依性。
           </note>
       </TabItem>
       <TabItem title="Maven" group-key="maven">
           <code-block lang="XML" code="               &lt;dependency&gt;&#10;                   &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                   &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                   &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;               &lt;/dependency&gt;"/>
       </TabItem>
   </Tabs>

## 安裝 %plugin_name% {id="install_plugin"}

<p>
    若要將 <code>%plugin_name%</code> 外掛程式<a href="server-plugins.md#install">安裝</a>至你的應用程式中，請將其傳遞給指定<Links href="server-modules.md" summary="模組允許你透過分組路由來組織應用程式結構。">模組</Links>中的 <code>install</code> 函式。以下範例展示如何安裝 <code>%plugin_name%</code>：
</p>
<list>
    <li>
        在 <code>embeddedServer()</code> 函式呼叫中。
    </li>
    <li>
        在 <code>Application</code> 類別上明確定義的 <code>module()</code> 擴充函式中。
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

這會在伺服器上啟用 `gzip`、`deflate` 和 `identity` 編碼器。

## 設定壓縮選項 {id="configure"}

你可以透過多種方式設定壓縮：僅啟用特定編碼器、指定其優先級、僅壓縮特定內容類型等。

### 新增特定編碼器 {id="add_specific_encoders"}

若要僅啟用特定編碼器，請呼叫對應的擴充函式，例如：

```kotlin
install(Compression) {
    gzip()
    deflate()
    zstd()
}
```

你可以透過設定 `priority` 屬性來指定每種壓縮演算法的優先級：

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

在上述範例中，`deflate` 具有較高的優先級值，並優先於 `gzip` 和 `zstd`。請注意，伺服器會先查看 [Accept-Encoding](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Encoding) 標頭內的[品質 (quality)](https://developer.mozilla.org/en-US/docs/Glossary/Quality_Values) 值，然後才考量所指定的優先級。

### 設定內容類型 {id="configure_content_type"}

預設情況下，Ktor 不會壓縮特定的內容類型，例如 `audio`、`video`、`image` 和 `text/event-stream`。你可以透過呼叫 `matchContentType` 來選擇要壓縮的內容類型，或使用 `excludeContentType` 從壓縮中排除所需的媒體類型。以下程式碼片段展示如何使用 `gzip` 壓縮 JavaScript 程式碼，並使用 `deflate` 壓縮所有文字子類型：

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

你可以在此處找到完整範例：[compression](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/compression)。

### 設定回應大小 {id="configure_response_size"}

`%plugin_name%` 外掛程式允許你為大小不超過指定數值的回應停用壓縮。若要執行此操作，請將所需的值（以位元組為單位）傳遞給 `minimumSize` 函式：

```kotlin
    install(Compression) {
    deflate {
        minimumSize(1024)
    }
}

```

### 指定自訂條件 {id="specify_custom_conditions"}

如有需要，你可以使用 `condition` 函式提供自訂條件，並根據特定的請求參數壓縮資料。以下程式碼片段展示如何壓縮針對指定 URI 的請求：

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

啟用壓縮的 HTTPS 容易受到 [BREACH](https://en.wikipedia.org/wiki/BREACH) 攻擊。你可以使用多種方法來緩解這種攻擊。例如，每當 referrer 標頭指示跨站請求時，你可以停用壓縮。在 Ktor 中，這可以透過檢查 referrer 標頭值來完成：

```kotlin
install(Compression) {
    gzip {
        condition {
            request.headers[HttpHeaders.Referrer]?.startsWith("https://my.domain/") == true
        }
    }
}
```

## Zstandard 壓縮等級 {id="compression_level"}

你可以使用 `level` 參數設定 `zstd` 的壓縮等級。預設壓縮等級為 `3`，但你可以根據需求進行調整。

```kotlin
install(Compression) {
    // 預設為 level = 3
    zstd(level = 20)
}
```

## 解壓縮 {id="decompression"}

預設情況下，`Compression` 外掛程式會壓縮伺服器回應。若要啟用請求解壓縮，請將 `mode` 屬性設定為 `CompressionConfig.Mode.DecompressRequest`：

```kotlin
install(Compression) { 
    mode = CompressionConfig.Mode.DecompressRequest
    gzip()
}
```

當啟用請求解壓縮時，外掛程式會在請求主體被其他接收轉換（例如反序列化與 multipart 處理）處理之前，使用已設定的解碼器對其進行解壓縮。

## 實作自訂編碼器 {id="custom_encoder"}

如有需要，你可以透過實作 [ContentEncoder](https://api.ktor.io/ktor-utils/io.ktor.util/-content-encoder/index.html) 介面來提供自己的編碼器。有關實作範例，請參閱 [GzipEncoder](https://github.com/ktorio/ktor/blob/b5b59ca3ae61601e6175f334e6a1252609638e61/ktor-server/ktor-server-plugins/ktor-server-compression/jvm/src/io/ktor/server/plugins/compression/Encoders.kt#L41)。