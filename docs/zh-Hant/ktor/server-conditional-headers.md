[//]: # (title: 條件式標頭)

<primary-label ref="server-plugin"/>

<var name="artifact_name" value="ktor-server-conditional-headers"/>
<var name="package_name" value="io.ktor.server.plugins.conditionalheaders"/>
<var name="plugin_name" value="ConditionalHeaders"/>

<tldr>
<p>
<b>必要相依性</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="conditional-headers"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor 支援 Kotlin/Native，並允許您在沒有額外執行階段或虛擬機的情況下執行伺服器。">Native 伺服器</Links> 支援</b>：✅
</p>
</tldr>

[ConditionalHeaders](https://api.ktor.io/ktor-server-conditional-headers/io.ktor.server.plugins.conditionalheaders/-conditional-headers.html) 外掛程式可避免在內容自上次請求以來未曾變更時傳送內容主體。這是透過使用以下標頭來實現的：
* `Last-Modified` 回應標頭包含資源修改時間。例如，如果用戶端請求包含 `If-Modified-Since` 值，則僅當資源在指定日期之後有過修改時，Ktor 才會傳送完整回應。請注意，對於[靜態檔案](server-static-content.md)，Ktor 會在[安裝](#install_plugin) `ConditionalHeaders` 後自動附加 `Last-Modified` 標頭。
* `Etag` 回應標頭是特定資源版本的識別符。例如，如果用戶端請求包含 `If-None-Match` 值，則在該值與 `Etag` 相符的情況下，Ktor 將不會傳送完整回應。您可以在[設定](#configure) `ConditionalHeaders` 時指定 `Etag` 值。

## 新增相依性 {id="add_dependencies"}

<p>
    若要使用 <code>%plugin_name%</code>，您需要在建置指令碼中包含 <code>%artifact_name%</code> 構件：
</p>
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

## 安裝 %plugin_name% {id="install_plugin"}

<p>
    若要將 <code>%plugin_name%</code> 外掛程式<a href="#install">安裝</a>至應用程式，請將其傳遞給指定<Links href="/ktor/server-modules" summary="模組允許您透過對路由進行分組來建構您的應用程式。">模組</Links>中的 <code>install</code> 函式。
    下方的程式碼片段展示了如何安裝 <code>%plugin_name%</code> ...
</p>
<list>
    <li>
        ... 在 <code>embeddedServer</code> 函式呼叫中。
    </li>
    <li>
        ... 在明確定義的 <code>module</code> 中，該模組是 <code>Application</code> 類別的擴充函式。
    </li>
</list>
<Tabs>
    <TabItem title="embeddedServer">
        <code-block lang="kotlin" code="            import io.ktor.server.engine.*&#10;            import io.ktor.server.netty.*&#10;            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;&#10;            fun main() {&#10;                embeddedServer(Netty, port = 8080) {&#10;                    install(%plugin_name%)&#10;                    // ...&#10;                }.start(wait = true)&#10;            }"></code-block>
    </TabItem>
    <TabItem title="module">
        <code-block lang="kotlin" code="            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;            // ...&#10;            fun Application.module() {&#10;                install(%plugin_name%)&#10;                // ...&#10;            }"></code-block>
    </TabItem>
</Tabs>
<p>
    <code>%plugin_name%</code> 外掛程式也可以<a href="#install-route">安裝至特定路由</a>。
    如果您需要為不同的應用程式資源使用不同的 <code>%plugin_name%</code> 配置，這會非常有用。
</p>

## 設定標頭 {id="configure"}

要設定 `%plugin_name%`，您需要在 `install` 區塊中呼叫 [version](https://api.ktor.io/ktor-server-conditional-headers/io.ktor.server.plugins.conditionalheaders/-conditional-headers-config/version.html) 函式。此函式提供了存取給定 `ApplicationCall` 與 `OutgoingContent` 的資源版本清單。您可以使用 [EntityTagVersion](https://api.ktor.io/ktor-http/io.ktor.http.content/-entity-tag-version/index.html) 與 [LastModifiedVersion](https://api.ktor.io/ktor-http/io.ktor.http.content/-last-modified-version/index.html) 類別物件來指定所需的版本。

下方的程式碼片段展示了如何為 CSS 新增 `Etag` 與 `Last-Modified` 標頭：
```kotlin
install(ConditionalHeaders) {
    val file = File("src/main/kotlin/com/example/Application.kt")
    version { call, outgoingContent ->
        when (outgoingContent.contentType?.withoutParameters()) {
            ContentType.Text.CSS -> listOf(
                EntityTagVersion(file.lastModified().hashCode().toString()),
                LastModifiedVersion(Date(file.lastModified()))
            )
            else -> emptyList()
        }
    }
}
```

您可以在此處找到完整範例：[conditional-headers](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/conditional-headers)。