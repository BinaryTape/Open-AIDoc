[//]: # (title: HttpsRedirect)

<primary-label ref="server-plugin"/>

<var name="plugin_name" value="HttpsRedirect"/>
<var name="package_name" value="io.ktor.server.plugins.httpsredirect"/>
<var name="artifact_name" value="ktor-server-http-redirect"/>

<tldr>
<p>
<b>必要的相依性</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="ssl-engine-main-redirect"/>
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

[%plugin_name%](https://api.ktor.io/ktor-server-http-redirect/io.ktor.server.plugins.httpsredirect/-https-redirect.html) 外掛程式會在處理呼叫之前，將所有 HTTP 請求重新導向至 [HTTPS 對應版本](server-ssl.md)。預設情況下，資源會傳回 `301 Moved Permanently`，但也可以配置為 `302 Found`。

## 新增相依性 {id="add_dependencies"}

<p>
    要使用 <code>%plugin_name%</code>，您需要在建置指令碼中包含 <code>%artifact_name%</code> 構件：
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
    要將 <code>%plugin_name%</code> 外掛程式安裝至應用程式，請將其傳遞給指定<Links href="/ktor/server-modules" summary="模組允許您透過分組路由來組織應用程式的結構。">模組</Links>中的 <code>install</code> 函式。
    下方的程式碼片段展示了如何安裝 <code>%plugin_name%</code> ...
</p>
<list>
    <li>
        ... 在 <code>embeddedServer</code> 函式呼叫中。
    </li>
    <li>
        ... 在明確定義的 <code>module</code>（即 <code>Application</code> 類別的擴充函式）中。
    </li>
</list>
<Tabs>
    <TabItem title="embeddedServer">
        <code-block lang="kotlin" code="            import io.ktor.server.engine.*&#10;            import io.ktor.server.netty.*&#10;            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;&#10;            fun main() {&#10;                embeddedServer(Netty, port = 8080) {&#10;                    install(%plugin_name%)&#10;                    // ...&#10;                }.start(wait = true)&#10;            }"></code-block>
    </TabItem>
    <TabItem title="module">
        <code-block lang="kotlin" code="            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;            // ...&#10;            fun Application.module() {&#10;                install(%plugin_name%)&#10;                // ...&#10;                // ...&#10;            }"></code-block>
    </TabItem>
</Tabs>

上述程式碼會以預設配置安裝 `%plugin_name%` 外掛程式。

> 當位於反向代理後方時，您需要安裝 `ForwardedHeader` 或 `XForwardedHeader` 外掛程式以正確偵測 HTTPS 請求。如果您在安裝這些外掛程式之一後遇到無限次重新導向，請參閱 [此常見問題項目](FAQ.topic#infinite-redirect) 以了解更多詳細資訊。
>
{type="note"}

## 配置 %plugin_name% {id="configure"}

下方的程式碼片段展示了如何配置所需的 HTTPS 連接埠，並針對請求的資源傳回 `301 Moved Permanently`：

```kotlin
install(HttpsRedirect) {
    sslPort = 8443
    permanentRedirect = true
}
```

您可以在此處找到完整的範例：[ssl-engine-main-redirect](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/ssl-engine-main-redirect)。