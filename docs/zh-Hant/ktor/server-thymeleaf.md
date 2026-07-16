[//]: # (title: Thymeleaf)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="Thymeleaf"/>
<var name="package_name" value="io.ktor.server.thymeleaf"/>
<var name="artifact_name" value="ktor-server-thymeleaf"/>

<tldr>
<p>
<b>必要相依性</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="thymeleaf"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">原生伺服器</Links> 支援</b>：✖️
</p>
</tldr>

Ktor 允許您透過安裝 [Thymeleaf](https://api.ktor.io/ktor-server-thymeleaf/io.ktor.server.thymeleaf/-thymeleaf) 外掛程式，在應用程式中使用 [Thymeleaf 範本](https://www.thymeleaf.org/) 作為視圖（view）。

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

## 安裝 Thymeleaf {id="install_plugin"}

<p>
    若要將 <code>%plugin_name%</code> 外掛程式安裝到應用程式中，請將其傳遞給指定<Links href="/ktor/server-modules" summary="Modules allow you to structure your application by grouping routes.">模組</Links>中的 <code>install</code> 函式。
    下方的程式碼片段展示了如何安裝 <code>%plugin_name%</code> ...
</p>
<list>
    <li>
        ... 在 <code>embeddedServer</code> 函式呼叫內。
    </li>
    <li>
        ... 在明確定義的 <code>module</code> 內，該模組是 <code>Application</code> 類別的擴充方法。
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

## 配置 Thymeleaf {id="configure"}
### 配置範本載入 {id="template_loading"}
在 `install` 區塊內，您可以配置 `ClassLoaderTemplateResolver`。例如，下方的程式碼片段讓 Ktor 能夠在相對於目前類別路徑的 `templates` 套件中尋找 `*.html` 範本：
```kotlin
import io.ktor.server.application.*
import io.ktor.server.thymeleaf.*
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver

fun Application.module() {
    install(Thymeleaf) {
        setTemplateResolver(ClassLoaderTemplateResolver().apply {
            prefix = "templates/"
            suffix = ".html"
            characterEncoding = "utf-8"
        })
    }
}
```

### 在回應中傳送範本 {id="use_template"}
假設您在 `resources/templates` 中有一個 `index.html` 範本：
```html
<html xmlns:th="http://www.thymeleaf.org">
    <body>
        <h1 th:text="'Hello, ' + ${user.name}"></h1>
    </body>
</html>
```

使用者的資料模型如下所示：
```kotlin
data class User(val id: Int, val name: String)
```

若要為指定的[路由](server-routing.md)使用範本，請按照以下方式將 [ThymeleafContent](https://api.ktor.io/ktor-server-thymeleaf/io.ktor.server.thymeleaf/-thymeleaf-content/index.html) 傳遞給 `call.respond` 方法：
```kotlin
get("/index") {
    val sampleUser = User(1, "John")
    call.respond(ThymeleafContent("index", mapOf("user" to sampleUser)))
}
```

## 範例：自動重新載入 Thymeleaf 範本 {id="auto-reload"}

下方的範例展示了在使用的[開發模式](server-development-mode.topic)下，如何自動重新載入 Thymeleaf 範本。

```kotlin
package com.example

import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.thymeleaf.*
import org.thymeleaf.templateresolver.*

fun main(args: Array<String>): Unit = io.ktor.server.netty.EngineMain.main(args)

fun Application.module() {
    install(Thymeleaf) {
        setTemplateResolver((if (developmentMode) {
            FileTemplateResolver().apply {
                cacheManager = null
                prefix = "src/main/resources/templates/"
            }
        } else {
            ClassLoaderTemplateResolver().apply {
                prefix = "templates/"
            }
        }).apply {
            suffix = ".html"
            characterEncoding = "utf-8"
        })
    }
    routing {
        get("/index") {
            val sampleUser = User(1, "John")
            call.respond(ThymeleafContent("index", mapOf("user" to sampleUser)))
        }
    }
}

data class User(val id: Int, val name: String)

```

您可以在這裡找到完整的範例：[thymeleaf-auto-reload](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/thymeleaf-auto-reload)。