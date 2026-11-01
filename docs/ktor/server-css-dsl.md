[//]: # (title: CSS DSL)

<tldr>
<p>
<b>所需依赖项</b>：<code>io.ktor:ktor-server-html-builder</code>, <code>org.jetbrains.kotlin-wrappers:kotlin-css</code>
</p>
<var name="example_name" value="css-dsl"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

CSS DSL 扩展了 [HTML DSL](server-html-dsl.md)，并允许你使用 [kotlin-css](https://github.com/JetBrains/kotlin-wrappers/blob/master/kotlin-css/README.md) 包装器在 Kotlin 中编写样式表。

> 了解如何将样式表作为静态内容提供，请参阅[提供静态内容](server-static-content.md)。

## 添加依赖项 {id="add_dependencies"}
CSS DSL 不需要[安装](server-plugins.md#install)，但需要在构建脚本中包含以下构件：

1. 用于 HTML DSL 的 `ktor-server-html-builder` 构件：

   <var name="artifact_name" value="ktor-server-html-builder"/>
   <var name="ktor_version_catalog_name" value="ktorLibs.server.htmlBuilder"/>
   <Tabs group="languages">
       <TabItem title="Gradle (Kotlin)" group-key="kotlin">
           <code-block lang="Kotlin" code="               implementation(%ktor_version_catalog_name%)"/>
           <note>
               上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">
               Ktor 版本目录 (version catalog)</a> 来指定 Ktor 依赖项。
           </note>
       </TabItem>
       <TabItem title="Gradle (Groovy)" group-key="groovy">
           <code-block lang="Groovy" code="               implementation %ktor_version_catalog_name%"/>
           <note>
               上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">
               Ktor 版本目录 (version catalog)</a> 来指定 Ktor 依赖项。
           </note>
       </TabItem>
       <TabItem title="Maven" group-key="maven">
           <code-block lang="XML" code="               &lt;dependency&gt;&#10;                   &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                   &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                   &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;               &lt;/dependency&gt;"/>
       </TabItem>
   </Tabs>
   
2. 用于构建 CSS 的 `kotlin-css-jvm` 构件：

   <var name="group_id" value="org.jetbrains.kotlin-wrappers"/>
   <var name="artifact_name" value="kotlin-css"/>
   <var name="version" value="kotlin_css_version"/>
   <Tabs group="languages">
       <TabItem title="Gradle (Kotlin)" group-key="kotlin">
           <code-block lang="Kotlin" code="               implementation(&quot;%group_id%:%artifact_name%:$%version%&quot;)"/>
       </TabItem>
       <TabItem title="Gradle (Groovy)" group-key="groovy">
           <code-block lang="Groovy" code="               implementation &quot;%group_id%:%artifact_name%:$%version%&quot;"/>
       </TabItem>
       <TabItem title="Maven" group-key="maven">
           <code-block lang="XML" code="               &lt;dependency&gt;&#10;                   &lt;groupId&gt;%group_id%&lt;/groupId&gt;&#10;                   &lt;artifactId&gt;%artifact_name%&lt;/artifactId&gt;&#10;                   &lt;version&gt;${%version%}&lt;/version&gt;&#10;               &lt;/dependency&gt;"/>
       </TabItem>
   </Tabs>
   
   你可以将 `$kotlin_css_version` 替换为所需版本的 `kotlin-css` 构件，例如 `%kotlin_css_version%`。

## 提供 CSS {id="serve_css"}

要发送 CSS 响应，你需要通过添加 `respondCss` 方法来扩展 `ApplicationCall`，以将样式表序列化为字符串，并使用 `CSS` 内容类型将其发送到客户端：

```kotlin
suspend inline fun ApplicationCall.respondCss(builder: CssBuilder.() -> Unit) {
    this.respondText(CssBuilder().apply(builder).toString(), ContentType.Text.CSS)
}
```

然后，你可以在所需的[路由](server-routing.md)中提供 CSS：

```kotlin
get("/styles.css") {
    call.respondCss {
        body {
            backgroundColor = Color.darkBlue
            margin = Margin(0.px)
        }
        rule("h1.page-title") {
            color = Color.white
        }
    }
}
```

最后，你可以将指定的 CSS 用于通过 [HTML DSL](server-html-dsl.md) 创建的 HTML 文档：

```kotlin
get("/html-dsl") {
    call.respondHtml {
        head {
            link(rel = "stylesheet", href = "/styles.css", type = "text/css")
        }
        body {
            h1(classes = "page-title") {
                +"Hello from Ktor!"
            }
        }
    }
}
```

你可以在此处找到完整示例：[css-dsl](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/css-dsl)。