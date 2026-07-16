[//]: # (title: XHttpMethodOverride)

<primary-label ref="server-plugin"/>

<var name="plugin_name" value="XHttpMethodOverride"/>
<var name="package_name" value="io.ktor.server.plugins.methodoverride"/>
<var name="artifact_name" value="ktor-server-method-override"/>

<tldr>
<p>
<b>必需的依赖项</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="json-kotlinx-method-override"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor 支持 Kotlin/Native，允许您在没有额外运行时或虚拟机的情况下运行服务器。">Native 服务器</Links> 支持</b>：✅
</p>
</tldr>

<link-summary>
%plugin_name% 提供了在 X-HTTP-Method-Override 标头中隧道传输 HTTP 谓词的能力。
</link-summary>

[%plugin_name%](https://api.ktor.io/ktor-server-method-override/io.ktor.server.plugins.methodoverride/-x-http-method-override.html) 插件提供了在 `X-HTTP-Method-Override` 标头中隧道传输 HTTP 谓词的能力。
如果您的服务器 API 处理多种 HTTP 谓词（`GET`、`PUT`、`POST`、`DELETE` 等），但由于特定的限制，客户端只能使用有限的谓词集（例如 `GET` 和 `POST`），那么这可能会很有用。
例如，如果客户端发送一个将 `X-Http-Method-Override` 标头设置为 `DELETE` 的请求，Ktor 将使用 `delete` [路由处理程序](server-routing.md#define_route)处理该请求。

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

## 安装 %plugin_name% {id="install_plugin"}

<p>
    要将 <code>%plugin_name%</code> 插件<a href="#install">安装</a>到应用，请将其传递给指定 <Links href="/ktor/server-modules" summary="模块允许您通过对路由进行分组来构建应用程序结构。">模块</Links> 中的 <code>install</code> 函数。
    以下代码片段展示了如何安装 <code>%plugin_name%</code> ...
</p>
<list>
    <li>
        ... 在 <code>embeddedServer</code> 函数调用中。
    </li>
    <li>
        ... 在显式定义的 <code>module</code> 中，该模块是 <code>Application</code> 类的扩展函数。
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

## 配置 %plugin_name% {id="configure"}

默认情况下，`%plugin_name%` 会检查 `X-Http-Method-Override` 标头以确定应当处理请求的路由。
您可以使用 `headerName` 属性自定义标头名称。

## 示例 {id="example"}

以下 HTTP 请求使用 `POST` 谓词，并将 `X-Http-Method-Override` 标头设置为 `DELETE`：

```http request
POST http://0.0.0.0:8080/customer/3
X-Http-Method-Override: DELETE

```

要使用 `delete` [路由处理程序](server-routing.md#define_route)处理此类请求，您需要安装 `%plugin_name%`：

```kotlin
package com.example

import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.methodoverride.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import io.ktor.server.util.getValue

@Serializable
data class Customer(val id: Int, val firstName: String, val lastName: String)

fun Application.main() {
    val customerStorage = mutableListOf<Customer>()
    customerStorage.addAll(
        arrayOf(
            Customer(1, "Jane", "Smith"),
            Customer(2, "John", "Smith"),
            Customer(3, "Jet", "Brains")
        )
    )

    install(XHttpMethodOverride)
    install(ContentNegotiation) {
        json(Json)
    }
    routing {
        get("/customer/{id}") {
            val id: Int by call.parameters
            val customer: Customer = customerStorage.find { it.id == id }!!
            call.respond(customer)
        }

        delete("/customer/{id}") {
            val id: Int by call.parameters
            customerStorage.removeIf { it.id == id }
            call.respondText("Customer is removed", status = HttpStatusCode.NoContent)
        }
    }
}

```

您可以在此处找到完整示例：[json-kotlinx-method-override](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/json-kotlinx-method-override)。