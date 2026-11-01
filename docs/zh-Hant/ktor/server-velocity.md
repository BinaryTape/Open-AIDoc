[//]: # (title: Velocity)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

[velocity_engine]: https://velocity.apache.org/engine/devel/apidocs/org/apache/velocity/app/VelocityEngine.html

<var name="plugin_name" value="Velocity"/>
<var name="package_name" value="io.ktor.server.velocity"/>
<var name="artifact_name" value="ktor-server-velocity"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.velocity"/>

<tldr>
<p>
<b>必要相依性</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="velocity"/>
<p>
    <b>程式碼範例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">原生伺服器</Links> 支援</b>: ✖️
</p>
</tldr>

透過安裝 [Velocity](https://api.ktor.io/ktor-server-velocity/io.ktor.server.velocity/-velocity) 外掛程式，Ktor 允許你在應用程式中使用 [Velocity 範本](https://velocity.apache.org/engine/) 作為檢視。

## 新增相依性 {id="add_dependencies"}

<p>
    若要使用 <code>%plugin_name%</code>，請將 <code>%artifact_name%</code> 構件新增至你的組建指令碼中：
</p>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目錄</a> 來指定 Ktor 相依性。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目錄</a> 來指定 Ktor 相依性。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## 安裝 Velocity {id="install_plugin"}

<p>
    若要將 <code>%plugin_name%</code> 外掛程式<a href="server-plugins.md#install">安裝</a>至你的應用程式中，
    請將其傳遞給指定 <Links href="server-modules.md" summary="Modules allow you to structure your application by grouping routes.">模組</Links> 中的 <code>install</code> 函式。
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

此外，你也可以安裝 `VelocityTools` 外掛程式，以獲得新增標準與自訂 [Velocity 工具](#velocity_tools) 的能力。

## 配置 Velocity {id="configure"}
### 配置範本載入 {id="template_loading"}
在 `install` 區塊內，你可以配置 [VelocityEngine][velocity_engine]。例如，如果你想從 classpath 使用範本，可以使用 `classpath` 的資源載入器：
```kotlin
import io.ktor.server.application.*
import io.ktor.server.velocity.*
import org.apache.velocity.runtime.resource.loader.ClasspathResourceLoader
import org.apache.velocity.runtime.RuntimeConstants

fun Application.module() {
    install(Velocity) {
        setProperty(RuntimeConstants.RESOURCE_LOADER, "classpath")
        setProperty("classpath.resource.loader.class", ClasspathResourceLoader::class.java.name)
    }
}
```

### 在回應中傳送範本 {id="use_template"}
假設你在 `resources/templates` 中有一個 `index.vl` 範本：
```html
<html>
    <body>
        <h1>Hello, $user.name</h1>
    </body>
</html>
```

使用者的資料模型如下所示：
```kotlin
data class User(val id: Int, val name: String)
```

若要將該範本用於指定的 [路由](server-routing.md)，請依以下方式將 `VelocityContent` 傳遞給 `call.respond` 方法：
```kotlin
get("/index") {
    val sampleUser = User(1, "John")
    call.respond(VelocityContent("templates/index.vl", mapOf("user" to sampleUser)))
}
```

### 新增 Velocity 工具 {id="velocity_tools"}

如果你已[安裝](#install_plugin)了 `VelocityTools` 外掛程式，可以在 `install` 區塊內存取 `EasyFactoryConfiguration` 執行個體以新增標準及自訂的 Velocity 工具，例如：

```kotlin
install(VelocityTools) {
    engine {
        // 引擎配置
        setProperty("resource.loader", "string")
        addProperty("resource.loader.string.name", "myRepo")
        addProperty("resource.loader.string.class", StringResourceLoader::class.java.name)
        addProperty("resource.loader.string.repository.name", "myRepo")
    }
    addDefaultTools() // 新增預設工具
    tool("foo", MyCustomTool::class.java) // 新增自訂工具
}
```