[//]: # (title: Pebble)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

[pebble_engine_builder]: https://pebbletemplates.io/com/mitchellbosecke/pebble/PebbleEngine/Builder/

<var name="plugin_name" value="Pebble"/>
<var name="package_name" value="io.ktor.server.pebble"/>
<var name="artifact_name" value="ktor-server-pebble"/>

<tldr>
<p>
<b>必要相依性</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="pebble"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">原生伺服器</Links> 支援</b>：✖️
</p>
</tldr>

Ktor 允許您透過安裝 [Pebble](https://api.ktor.io/ktor-server-pebble/io.ktor.server.pebble/-pebble) 外掛程式，在應用程式中將 [Pebble 範本](https://pebbletemplates.io/)作為視圖使用。

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

## 安裝 Pebble {id="install_plugin"}

<p>
    要將 <code>%plugin_name%</code> 外掛程式安裝到應用程式中，
    請將其傳遞給指定<Links href="/ktor/server-modules" summary="Modules allow you to structure your application by grouping routes.">模組</Links>中的 <code>install</code> 函式。
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

在 `install` 區塊內，您可以[設定](#configure)用於載入 Pebble 範本的 [PebbleEngine.Builder][pebble_engine_builder]。

## 設定 Pebble {id="configure"}
### 設定範本載入 {id="template_loading"}
要載入範本，您需要使用 [PebbleEngine.Builder][pebble_engine_builder] 設定如何載入範本。例如，下方的程式碼片段可讓 Ktor 在相對於目前 classpath 的 `templates` 套件中尋找範本：

```kotlin
import io.ktor.server.application.*
import io.ktor.server.pebble.*
import io.ktor.server.response.*

fun Application.module() {
    install(Pebble) {
        loader(ClasspathLoader().apply {
            prefix = "templates"
        })
    }
}
```

### 在回應中傳送範本 {id="use_template"}
假設您在 `resources/templates` 中有一個 `index.html` 範本：

```html
<html>
    <body>
        <h1>Hello, {{user.name}}</h1>
    </body>
</html>
```

使用者的資料模型如下所示：

```kotlin
data class User(val id: Int, val name: String)
```

要為指定的[路由](server-routing.md)使用範本，請按以下方式將 `PebbleContent` 傳遞給 `call.respond` 方法：

```kotlin
get("/index") {
    val sampleUser = User(1, "John")
    call.respond(PebbleContent("index.html", mapOf("user" to sampleUser)))
}