[//]: # (title: JTE)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="Jte"/>
<var name="package_name" value="io.ktor.server.jte"/>
<var name="artifact_name" value="ktor-server-jte"/>

<tldr>
<p>
<b>必要的相依性</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="jte"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor 支援 Kotlin/Native，並允許您在沒有額外執行階段或虛擬機的情況下執行伺服器。">Native 伺服器</Links> 支援</b>：✖️
</p>
</tldr>

Ktor 允許您透過安裝 [%plugin_name%](https://api.ktor.io/ktor-server-jte/io.ktor.server.jte/-jte.html) 外掛程式，在您的應用程式中將 [JTE 範本](https://github.com/casid/jte) 作為檢視使用。

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

若要處理 `.kte` 檔案，請將 `gg.jte:jte-kotlin` 構件新增至您的專案：

<var name="group_id" value="gg.jte"/>
<var name="artifact_name" value="jte-kotlin"/>
<var name="version" value="jte_version" />
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;%group_id%:%artifact_name%:$%version%&quot;)"></code-block>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;%group_id%:%artifact_name%:$%version%&quot;"></code-block>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;%group_id%&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%&lt;/artifactId&gt;&#10;                &lt;version&gt;${%version%}&lt;/version&gt;&#10;            &lt;/dependency&gt;"></code-block>
    </TabItem>
</Tabs>

> 目前的 `jte‑kotlin` 編譯器外掛程式與 Kotlin 2.3.x 不相容。
> 由於 Ktor 3.4.0 使用 Kotlin 2.3 工具鏈，在 `jte‑kotlin` 外掛程式增加對 Kotlin 2.3 的支援之前，無法使用 Ktor JTE 外掛程式。
> 
> 如果您依賴 JTE，請在 `jte‑kotlin` 針對 Kotlin 2.3 更新之前，使用 Kotlin 2.2.x 與相容的 Ktor 版本。
> 
{style="warning"}

## 安裝 %plugin_name% {id="install_plugin"}

<p>
    若要將 <code>%plugin_name%</code> 外掛程式安裝到應用程式，請將其傳遞給指定<Links href="/ktor/server-modules" summary="模組允許您透過將路由分組來組織您的應用程式。">模組</Links>中的 <code>install</code> 函式。
    下方的程式碼片段展示了如何安裝 <code>%plugin_name%</code> ...
</p>
<list>
    <li>
        ... 在 <code>embeddedServer</code> 函式呼叫內。
    </li>
    <li>
        ... 在明確定義的 <code>module</code> 內，它是 <code>Application</code> 類別的擴充函式。
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

在 `install` 區塊內，您可以[配置](#configure)如何載入 JTE 範本。

## 配置 %plugin_name% {id="configure"}
### 配置範本載入 {id="template_loading"}
若要載入 JTE 範本，您需要：
1. 建立一個 `CodeResolver` 用於解析範本程式碼。例如，您可以配置 `DirectoryCodeResolver` 從給定目錄載入範本，或使用 `ResourceCodeResolver` 從應用程式資源載入範本。
2. 使用 `templateEngine` 屬性來指定範本引擎，該引擎使用建立的 `CodeResolver` 將範本轉換為原生 Java/Kotlin 程式碼。

例如，下方的程式碼片段讓 Ktor 在 `templates` 目錄中尋找 JTE 範本：

```kotlin
import gg.jte.TemplateEngine
import gg.jte.resolve.DirectoryCodeResolver
import io.ktor.server.application.*
import io.ktor.server.jte.*
import java.nio.file.Path

fun Application.module() {
    install(Jte) {
        val resolver = DirectoryCodeResolver(Path.of("templates"))
        templateEngine = TemplateEngine.create(resolver, gg.jte.ContentType.Html)
    }
}
```

### 在回應中發送範本 {id="use_template"}
假設您在 `templates` 目錄中擁有 `index.kte` 範本：
```html
@param id: Int
@param name: String
<html>
    <body>
        <h1>Hello, ${name}!</h1>
    </body>
</html>
```

若要將此範本用於指定的[路由](server-routing.md)，請按照以下方式將 `JteContent` 傳遞給 `call.respond` 方法：
```kotlin
get("/index") {
    val params = mapOf("id" to 1, "name" to "John")
    call.respond(JteContent("index.kte", params))
}