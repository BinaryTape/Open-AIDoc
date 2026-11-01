[//]: # (title: CSS DSL)

<tldr>
<p>
<b>필수 의존성</b>: <code>io.ktor:ktor-server-html-builder</code>, <code>org.jetbrains.kotlin-wrappers:kotlin-css</code>
</p>
<var name="example_name" value="css-dsl"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

CSS DSL은 [HTML DSL](server-html-dsl.md)을 확장하며, [kotlin-css](https://github.com/JetBrains/kotlin-wrappers/blob/master/kotlin-css/README.md) 래퍼를 사용하여 Kotlin으로 스타일시트를 작성할 수 있도록 지원합니다.

> 스타일시트를 정적 콘텐츠로 제공하는 방법은 [정적 콘텐츠 제공](server-static-content.md)을 참고하세요.

## 의존성 추가 {id="add_dependencies"}
CSS DSL은 별도의 [설치](server-plugins.md#install)가 필요하지 않지만, 빌드 스크립트에 다음 아티팩트를 추가해야 합니다.

1. HTML DSL을 위한 `ktor-server-html-builder` 아티팩트:

   <var name="artifact_name" value="ktor-server-html-builder"/>
   <var name="ktor_version_catalog_name" value="ktorLibs.server.htmlBuilder"/>
   <Tabs group="languages">
       <TabItem title="Gradle (Kotlin)" group-key="kotlin">
           <code-block lang="Kotlin" code="               implementation(%ktor_version_catalog_name%)"/>
           <note>
               위 코드 스니펫은 Ktor 의존성을 지정하기 위해 <a href="server-dependencies.topic#using-version-catalog">
               Ktor 버전 카탈로그</a>를 사용합니다.
           </note>
       </TabItem>
       <TabItem title="Gradle (Groovy)" group-key="groovy">
           <code-block lang="Groovy" code="               implementation %ktor_version_catalog_name%"/>
           <note>
               위 코드 스니펫은 Ktor 의존성을 지정하기 위해 <a href="server-dependencies.topic#using-version-catalog">
               Ktor 버전 카탈로그</a>를 사용합니다.
           </note>
       </TabItem>
       <TabItem title="Maven" group-key="maven">
           <code-block lang="XML" code="               &lt;dependency&gt;&#10;                   &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                   &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                   &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;               &lt;/dependency&gt;"/>
       </TabItem>
   </Tabs>
   
2. CSS 빌드를 위한 `kotlin-css-jvm` 아티팩트:

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
   
   `$kotlin_css_version`을 필요한 `kotlin-css` 아티팩트 버전(예: `%kotlin_css_version%`)으로 변경할 수 있습니다.

## CSS 제공 {id="serve_css"}

CSS 응답을 전송하려면 스타일시트를 문자열로 직렬화하고 이를 `CSS` 콘텐츠 타입과 함께 클라이언트로 전송하는 `respondCss` 메서드를 추가하여 `ApplicationCall`을 확장해야 합니다:

```kotlin
suspend inline fun ApplicationCall.respondCss(builder: CssBuilder.() -> Unit) {
    this.respondText(CssBuilder().apply(builder).toString(), ContentType.Text.CSS)
}
```

그런 다음 필요한 [라우트](server-routing.md) 내부에서 CSS를 제공할 수 있습니다:

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

마지막으로 [HTML DSL](server-html-dsl.md)을 사용하여 생성된 HTML 문서에 지정된 CSS를 사용할 수 있습니다:

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

전체 예제는 [css-dsl](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/css-dsl)에서 확인할 수 있습니다.