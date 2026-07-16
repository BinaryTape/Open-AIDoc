[//]: # (title: CSS DSL)

<tldr>
<p>
<b>필수 종속성</b>: <code>io.ktor:ktor-server-html-builder</code>, <code>org.jetbrains.kotlin-wrappers:kotlin-css</code>
</p>
<var name="example_name" value="css-dsl"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

CSS DSL은 [HTML DSL](server-html-dsl.md)을 확장하며 [kotlin-css](https://github.com/JetBrains/kotlin-wrappers/blob/master/kotlin-css/README.md) 래퍼를 사용하여 Kotlin으로 스타일시트를 작성할 수 있게 해줍니다.

> [정적 콘텐츠 제공](server-static-content.md)에서 스타일시트를 정적 콘텐츠로 제공하는 방법을 알아보세요.

## 종속성 추가 {id="add_dependencies"}
CSS DSL은 [설치](server-plugins.md#install)가 필요하지 않지만, 빌드 스크립트에 다음 아티팩트들을 포함해야 합니다:

1. HTML DSL을 위한 `ktor-server-html-builder` 아티팩트:

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
   
2. CSS 빌드를 위한 `kotlin-css-jvm` 아티팩트:

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
   
   `$kotlin_css_version`을 `kotlin-css` 아티팩트의 필요한 버전(예: `%kotlin_css_version%`)으로 교체할 수 있습니다.

## CSS 제공 {id="serve_css"}

CSS 응답을 보내려면, 스타일시트를 문자열로 직렬화하고 `CSS` 콘텐츠 유형(content type)으로 클라이언트에 전송하는 `respondCss` 메서드를 추가하여 `ApplicationCall`을 확장해야 합니다:

```kotlin
suspend inline fun ApplicationCall.respondCss(builder: CssBuilder.() -> Unit) {
    this.respondText(CssBuilder().apply(builder).toString(), ContentType.Text.CSS)
}
```

그런 다음, 필요한 [라우트(route)](server-routing.md) 내부에서 CSS를 제공할 수 있습니다:

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

마지막으로, [HTML DSL](server-html-dsl.md)로 생성된 HTML 문서에 해당 CSS를 사용할 수 있습니다:

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

전체 예제는 여기에서 확인할 수 있습니다: [css-dsl](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/css-dsl).