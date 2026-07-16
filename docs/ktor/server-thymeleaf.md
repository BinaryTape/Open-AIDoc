[//]: # (title: Thymeleaf)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="Thymeleaf"/>
<var name="package_name" value="io.ktor.server.thymeleaf"/>
<var name="artifact_name" value="ktor-server-thymeleaf"/>

<tldr>
<p>
<b>所需依赖项</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="thymeleaf"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor 支持 Kotlin/Native，允许您在没有额外运行时或虚拟机的情况下运行服务器。">原生服务器</Links> 支持</b>：✖️
</p>
</tldr>

Ktor 允许您通过安装 [Thymeleaf](https://api.ktor.io/ktor-server-thymeleaf/io.ktor.server.thymeleaf/-thymeleaf) 插件，在应用程序中将 [Thymeleaf 模板](https://www.thymeleaf.org/) 用作视图。

## 添加依赖项 {id="add_dependencies"}

<p>
    要使用 <code>%plugin_name%</code>，您需要在构建脚本中包含 <code>%artifact_name%</code> 构件：
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

## 安装 Thymeleaf {id="install_plugin"}

<p>
    要将 <code>%plugin_name%</code> 插件<a href="#install">安装</a>到应用程序中，
    请将其传递给指定<Links href="/ktor/server-modules" summary="模块允许您通过对路由进行分组来构建应用程序结构。">模块</Links>中的 <code>install</code> 函数。
    以下代码片段展示了如何安装 <code>%plugin_name%</code> ...
</p>
<list>
    <li>
        ... 在 <code>embeddedServer</code> 函数调用内部。
    </li>
    <li>
        ... 在显式定义的 <code>module</code> 内部，该模块是 <code>Application</code> 类的扩展函数。
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
### 配置模板加载 {id="template_loading"}
在 `install` 块内，您可以配置 `ClassLoaderTemplateResolver`。例如，以下代码片段使 Ktor 能够在相对于当前类路径的 `templates` 软件包中查找 `*.html` 模板：
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

### 在响应中发送模板 {id="use_template"}
假设您在 `resources/templates` 中有一个 `index.html` 模板：
```html
<html xmlns:th="http://www.thymeleaf.org">
    <body>
        <h1 th:text="'Hello, ' + ${user.name}"></h1>
    </body>
</html>
```

用户的数据模型如下所示：
```kotlin
data class User(val id: Int, val name: String)
```

要在指定的[路由](server-routing.md)中使用该模板，请按以下方式将 [ThymeleafContent](https://api.ktor.io/ktor-server-thymeleaf/io.ktor.server.thymeleaf/-thymeleaf-content/index.html) 传递给 `call.respond` 方法：
```kotlin
get("/index") {
    val sampleUser = User(1, "John")
    call.respond(ThymeleafContent("index", mapOf("user" to sampleUser)))
}
```

## 示例：自动重新加载 Thymeleaf 模板 {id="auto-reload"}

以下示例展示了在使用[开发模式](server-development-mode.topic)时如何自动重新加载 Thymeleaf 模板。

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

您可以在此处找到完整的示例：[thymeleaf-auto-reload](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/thymeleaf-auto-reload)。