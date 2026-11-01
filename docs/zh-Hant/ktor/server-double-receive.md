[//]: # (title: DoubleReceive)

<primary-label ref="server-plugin"/>

<var name="plugin_name" value="DoubleReceive"/>
<var name="package_name" value="io.ktor.server.plugins.doublereceive"/>
<var name="artifact_name" value="ktor-server-double-receive"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.doubleReceive"/>

<tldr>
<p>
<b>必要的相依性</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="double-receive"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor 支援 Kotlin/Native，可讓您在無需額外執行階段或虛擬機的情況下執行伺服器。">原生伺服器</Links> 支援</b>：✅
</p>
</tldr>

[%plugin_name%](https://api.ktor.io/ktor-server-double-receive/io.ktor.server.plugins.doublereceive/-double-receive.html) 外掛程式提供了多次[接收請求主體](server-requests.md#body_contents)的功能，且不會擲出 `RequestAlreadyConsumedException` 例外。
當某個[外掛程式](server-plugins.md)已經消耗了請求主體，導致您無法在路由處理常式內部接收時，這項功能就非常實用。
例如，您可以利用 `%plugin_name%`，透過 [CallLogging](server-call-logging.md) 外掛程式記錄請求主體，然後在 `post` [路由處理常式](server-routing.md#define_route)內部再次接收該主體。

## 新增相依性 {id="add_dependencies"}

<p>
    若要使用 <code>%plugin_name%</code>，請將 <code>%artifact_name%</code> 構件新增至您的組建指令碼中：
</p>
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

## 安裝 %plugin_name% {id="install_plugin"}

<p>
    若要將 <code>%plugin_name%</code> 外掛程式<a href="server-plugins.md#install">安裝</a>至您的應用程式，請將其傳遞給指定<Links href="server-modules.md" summary="模組可讓您透過分組路由來組織應用程式。">模組</Links>中的 <code>install</code> 函式。
    以下範例展示如何安裝 <code>%plugin_name%</code>：
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
<p>
    <code>%plugin_name%</code> 外掛程式也可以<a href="server-plugins.md#install-route">安裝至特定路由</a>。
    若您需要針對不同的應用程式資源套用不同的 <code>%plugin_name%</code> 配置，這項功能將會非常實用。
</p>

安裝 `%plugin_name%` 之後，您可以多次[接收請求主體](server-requests.md#body_contents)，且每次叫用都會傳回相同的執行個體。
例如，您可以使用 [CallLogging](server-call-logging.md) 外掛程式啟用請求主體的記錄功能……

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

……然後在路由處理常式內部再次取得請求主體。

```kotlin
post("/") {
    val receivedText = call.receiveText()
    call.respondText("Text '$receivedText' is received")
}
```

您可以在此處找到完整的範例：[double-receive](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/double-receive)。

## 配置 %plugin_name% {id="configure"}
在預設配置下，`%plugin_name%` 提供了將[請求主體接收](server-requests.md#body_contents)為以下型別的能力：

- `ByteArray` 
- `String`
- `Parameters` 
- `ContentNegotiation` 外掛程式使用的[資料類別 (data classes)](server-serialization.md#create_data_class)

預設情況下，`%plugin_name%` 不支援：

- 從同一個請求接收不同的型別；
- 接收[串流或通道 (stream or channel)](server-requests.md#raw)。

如果您不需要從同一個請求接收不同的型別，也不需要接收串流或通道，請將 `cacheRawRequest` 屬性設為 `false`：

```kotlin
install(DoubleReceive) {
    cacheRawRequest = false
}
```