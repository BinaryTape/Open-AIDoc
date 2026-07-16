[//]: # (title: CSS DSL)

<tldr>
<p>
<b>必要的相依性</b>：<code>io.ktor:ktor-server-html-builder</code>、<code>org.jetbrains.kotlin-wrappers:kotlin-css</code>
</p>
<var name="example_name" value="css-dsl"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

CSS DSL 擴充了 [HTML DSL](server-html-dsl.md)，並允許您透過使用 [kotlin-css](https://github.com/JetBrains/kotlin-wrappers/blob/master/kotlin-css/README.md) 包裝函式在 Kotlin 中編寫樣式表。

> 若要了解如何將樣式表作為靜態內容提供，請參閱 [提供靜態內容](server-static-content.md)。

## 新增相依性 {id="add_dependencies"}
CSS DSL 不需要 [安裝](server-plugins.md#install)，但需要在建置指令碼中包含以下構件：

1. 用於 HTML DSL 的 `ktor-server-html-builder` 構件：

   <var name="artifact_name" value="ktor-server-html-builder"/>
   <Tabs group="languages">
       <TabItem title="Gradle (Kotlin)" group-key="kotlin">
           <code-block lang="Kotlin" code="               implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
       </TabItem>
       <TabItem title="Gradle (Groovy)" group-key="groovy">
           <code-block lang="Groovy" code="               implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
       </TabItem>
       <TabItem title="Maven" group-key="maven">
           <code-block lang="XML" code="               &lt;dependency&gt;&#10;                   &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                   &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                   &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;               &lt;/dependency&gt;"></code-block>
       </TabItem>
   </Tabs>
   
2. 用於建置 CSS 的 `kotlin-css-jvm` 構件：

   <var name="group_id" value="org.jetbrains.kotlin-wrappers"/>
   <var name="artifact_name" value="kotlin-css"/>
   <var name="version" value="kotlin_css_version"/>
   <Tabs group="languages">
       <TabItem title="Gradle (Kotlin)" group-key="kotlin">
           <code-block lang="Kotlin" code="               implementation(&quot;%group_id%:%artifact_name%:$%version%&quot;)"></code-block>
       </TabItem>
       <TabItem title="Gradle (Groovy)" group-key="groovy">
           <code-block lang="Groovy" code="               implementation &quot;%group_id%:%artifact_name%:$%version%&quot;"></code-block>
       </TabItem>
       <TabItem title="Maven" group-key="maven">
           <code-block lang="XML" code="               &lt;dependency&gt;&#10;                   &lt;groupId&gt;%group_id%&lt;/groupId&gt;&#10;                   &lt;artifactId&gt;%artifact_name%&lt;/artifactId&gt;&#10;                   &lt;version&gt;${%version%}&lt;/version&gt;&#10;               &lt;/dependency&gt;"></code-block>
       </TabItem>
   </Tabs>
   
   您可以將 `$kotlin_css_version` 替換為所需的 `kotlin-css` 構件版本，例如 `%kotlin_css_version%`。

## 提供 CSS {id="serve_css"}

若要傳送 CSS 回應，您需要透過新增 `respondCss` 方法來擴充 `ApplicationCall`，以便將樣式表序列化為字串，並以 `CSS` 內容型別傳送至用戶端：

```kotlin
suspend inline fun ApplicationCall.respondCss(builder: CssBuilder.() -> Unit) {
    this.respondText(CssBuilder().apply(builder).toString(), ContentType.Text.CSS)
}
```

接著，您可以在所需的 [路由](server-routing.md) 中提供 CSS：

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

最後，您可以將指定的 CSS 用於透過 [HTML DSL](server-html-dsl.md) 建立的 HTML 文件：

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

您可以在此處找到完整的範例：[css-dsl](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/css-dsl)。