[//]: # (title: DoubleReceive)

<primary-label ref="server-plugin"/>

<var name="plugin_name" value="DoubleReceive"/>
<var name="package_name" value="io.ktor.server.plugins.doublereceive"/>
<var name="artifact_name" value="ktor-server-double-receive"/>

<tldr>
<p>
<b>必要相依性</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="double-receive"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor 支援 Kotlin/Native，可讓您在不使用額外執行階段或虛擬機的情況下執行伺服器。">原生伺服器</Links> 支援</b>：✅
</p>
</tldr>

[%plugin_name%](https://api.ktor.io/ktor-server-double-receive/io.ktor.server.plugins.doublereceive/-double-receive.html) 外掛程式提供了多次[接收請求主體](server-requests.md#body_contents)的能力，且不會拋出 `RequestAlreadyConsumedException` 例外。
如果某個 [外掛程式](server-plugins.md) 已經耗盡了請求主體，導致您無法在路由處理常式中再次接收它，這個功能就會非常有用。
例如，您可以使用 `%plugin_name%` 透過 [CallLogging](server-call-logging.md) 外掛程式記錄請求主體，然後在 `post` [路由處理常式](server-routing.md#define_route) 中再次接收該主體。

> `%plugin_name%` 外掛程式使用的是實驗性 API，預計在未來的更新中可能會有所演進，並可能包含破壞性變更。
>
{type="note"}

## 新增相依性 {id="add_dependencies"}

<p>
    若要使用 <code>%plugin_name%</code>，您需要在組建指令碼中包含 <code>%artifact_name%</code> 構件：
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
    若要將 <code>%plugin_name%</code> 外掛程式安裝到應用程式，請將其傳遞給指定 <Links href="/ktor/server-modules" summary="模組可讓您透過分組路由來結構化您的應用程式。">模組</Links> 中的 <code>install</code> 函式。
    下方的程式碼片段展示了如何安裝 <code>%plugin_name%</code> ...
</p>
<list>
    <li>
        ... 在 <code>embeddedServer</code> 函式呼叫內。
    </li>
    <li>
        ... 在明確定義的 <code>module</code> 內，該模組是 <code>Application</code> 類別的擴充函式。
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
    <code>%plugin_name%</code> 外掛程式也可以 <a href="#install-route">安裝到特定路由</a>。
    如果您需要為不同的應用程式資源設定不同的 <code>%plugin_name%</code> 組態，這會非常有用。
</p>

安裝 `%plugin_name%` 後，您可以多次 [接收請求主體](server-requests.md#body_contents)，且每次調用都會回傳相同的執行個體。
例如，您可以使用 [CallLogging](server-call-logging.md) 外掛程式啟用請求主體的記錄功能...

```kotlin
install(CallLogging) {
    level = Level.TRACE
    format { call ->
        runBlocking {
            "Body: ${call.receiveText()}"
        }
    }
}
```

... 然後在路由處理常式中再次獲取請求主體。

```kotlin
post("/") {
    val receivedText = call.receiveText()
    call.respondText("Text '$receivedText' is received")
}
```

您可以在此處找到完整的範例：[double-receive](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/double-receive)。

## 組態 %plugin_name% {id="configure"}
在預設組態下，`%plugin_name%` 提供了將 [接收請求主體](server-requests.md#body_contents) 轉換為以下型別的能力：

- `ByteArray` 
- `String`
- `Parameters` 
- 被 `ContentNegotiation` 外掛程式使用的 [資料類別 (data class)](server-serialization.md#create_data_class)

預設情況下，`%plugin_name%` 不支援：

- 從同一個請求接收不同的型別；
- 接收 [串流 (stream) 或通道 (channel)](server-requests.md#raw)。

如果您不需要從同一個請求接收不同的型別，或者不需要接收串流或通道，請將 `cacheRawRequest` 屬性設定為 `false`：

```kotlin
install(DoubleReceive) {
    cacheRawRequest = false
}