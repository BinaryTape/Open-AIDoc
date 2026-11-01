[//]: # (title: HTML DSL)

<var name="artifact_name" value="ktor-server-html-builder"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.htmlBuilder"/>
<tldr>
<p>
<b>필수 의존성</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="html"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">Native 서버</Links> 지원</b>: ✅
</p>
</tldr>

HTML DSL은 [kotlinx.html](https://github.com/Kotlin/kotlinx.html) 라이브러리를 Ktor에 통합하여 클라이언트에 HTML 블록으로 응답할 수 있도록 해줍니다. HTML DSL을 사용하면 Kotlin으로 순수 HTML을 작성하고, 뷰에 변수를 삽입(보간)할 수 있으며, 템플릿을 사용하여 복잡한 HTML 레이아웃을 구성할 수도 있습니다.

## 의존성 추가 {id="add_dependencies"}
HTML DSL은 [설치(install)](server-plugins.md#install)할 필요가 없지만 `%artifact_name%` 아티팩트가 필요합니다. 빌드 스크립트에 다음과 같이 포함할 수 있습니다:

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            위 코드 스니펫은 Ktor 의존성을 지정하기 위해 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 버전 카탈로그</a>를 사용합니다.
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            위 코드 스니펫은 Ktor 의존성을 지정하기 위해 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 버전 카탈로그</a>를 사용합니다.
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>
  

## 응답으로 HTML 전송 {id="html_response"}
HTML 응답을 전송하려면 필요한 [라우트(route)](server-routing.md) 내에서 [respondHtml](https://api.ktor.io/ktor-server-html-builder/io.ktor.server.html/respond-html.html) 메서드를 호출하세요.
아래 예제는 샘플 HTML DSL과 클라이언트로 전송되는 해당 HTML을 보여줍니다:

<Tabs>
<TabItem title="Kotlin">

```kotlin
import io.ktor.server.application.*
import io.ktor.server.html.*
import io.ktor.http.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.utils.io.*
import kotlinx.html.*

fun Application.module() {
    routing {
        get("/") {
            val name = "Ktor"
            call.respondHtml(HttpStatusCode.OK) {
                head {
                    title {
                        +name
                    }
                }
                body {
                    h1 {
                        +"Hello from $name!"
                    }
                }
            }
        }
    }
}
```

</TabItem>
<TabItem title="HTML">

```html
<html>
<head>
    <title>Ktor</title>
</head>
<body>
<h1>Hello from Ktor!</h1>
</body>
</html>
```

</TabItem>
</Tabs>

다음 예제는 사용자로부터 [자격 증명 정보](server-form-based-auth.md)를 수집하는 데 사용되는 HTML 폼으로 응답하는 방법을 보여줍니다:

<Tabs>
<TabItem title="Kotlin">

```kotlin
get("/login") {
    call.respondHtml {
        body {
            val urlEncoded = FormEncType
                .applicationXWwwFormUrlEncoded
            form(
                action = "/login",
                encType = urlEncoded,
                method = FormMethod.post
            ) {
                p {
                    +"Username:"
                    textInput(name = "username")
                }
                p {
                    +"Password:"
                    passwordInput(name = "password")
                }
                p {
                    submitInput() { value = "Login" }
                }
            }
        }
    }
}
```

</TabItem>
<TabItem title="HTML">

```html
<html>
<body>
<form action="/login" enctype="application/x-www-form-urlencoded" method="post">
    <p>Username:<input type="text" name="username"></p>
    <p>Password:<input type="password" name="password"></p>
    <p><input type="submit" value="Login"></p>
</form>
</body>
</html>
```

</TabItem>
</Tabs>

전체 예제는 [auth-form-html-dsl](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-form-html-dsl)을 참조하세요.

> 서버 측에서 폼 매개변수를 수신하는 방법에 대한 자세한 내용은 [Form parameters](server-requests.md#form_parameters)를 참조하세요.
> 
> kotlinx.html을 사용하여 HTML을 생성하는 방법에 대한 자세한 내용은 [kotlinx.html wiki](https://github.com/Kotlin/kotlinx.html/wiki)를 참조하세요.

## 부분 HTML 전송 {id="html_fragments"}

전체 HTML 문서를 생성하는 것 외에도 `.respondHtmlPartial()` 함수를 사용하여 HTML 조각(fragment)으로 응답할 수도 있습니다.

HTML 조각은 HTMX와 같은 라이브러리에서 사용되는 동적 업데이트처럼 전체 `<html>` 문서가 필요하지 않은 부분 마크업을 반환할 때 유용합니다.

<Tabs>
<TabItem title="Kotlin">

```kotlin
import io.ktor.server.application.*
import io.ktor.server.html.*
import io.ktor.http.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.utils.io.*
import kotlinx.html.*

fun Application.module() {
    routing {
        get("/fragment") {
            call.respondHtmlPartial(HttpStatusCode.Created) {
                div("fragment") {
                    span { +"Created!" }
                }
            }
        }
    }
}
```

</TabItem>
<TabItem title="HTML">

```html
<div class="fragment">
    <span>
        Created!
    </span>
</div>

```

</TabItem>
</Tabs>

이 함수는 `.respondHtml()`과 유사하게 작동하지만, 루트 HTML 요소를 추가하지 않고 빌더 내부에 정의한 콘텐츠만 렌더링합니다.

## 템플릿 {id="templates"}

일반 HTML 생성 외에도 Ktor는 복잡한 레이아웃을 구축하는 데 사용할 수 있는 템플릿 엔진을 제공합니다. HTML 페이지의 다양한 부분에 대한 템플릿 계층 구조를 생성할 수 있습니다. 예를 들어 전체 페이지를 위한 루트 템플릿, 페이지 헤더 및 푸터를 위한 자식 템플릿 등을 만들 수 있습니다. Ktor는 템플릿 작업을 위해 다음과 같은 API를 제공합니다:

1. 지정된 템플릿을 기반으로 빌드된 HTML로 응답하려면 [respondHtmlTemplate](https://api.ktor.io/ktor-server-html-builder/io.ktor.server.html/respond-html-template.html) 메서드를 호출합니다.
2. 템플릿을 생성하려면 [Template](https://api.ktor.io/ktor-server-html-builder/io.ktor.server.html/-template/index.html) 인터페이스를 구현하고 HTML을 제공하는 `Template.apply` 메서드를 오버라이드해야 합니다.
3. 생성된 템플릿 클래스 내부에서 다양한 콘텐츠 타입에 대한 플레이스홀더를 정의할 수 있습니다:
    * [Placeholder](https://api.ktor.io/ktor-server-html-builder/io.ktor.server.html/-placeholder/index.html)는 콘텐츠를 삽입하는 데 사용됩니다. [PlaceholderList](https://api.ktor.io/ktor-server-html-builder/io.ktor.server.html/-placeholder-list/index.html)는 여러 번 나타나는 콘텐츠(예: 목록 항목)를 삽입하는 데 사용할 수 있습니다.
    * [TemplatePlaceholder](https://api.ktor.io/ktor-server-html-builder/io.ktor.server.html/-template-placeholder/index.html)는 자식 템플릿을 삽입하고 중첩된 레이아웃을 만드는 데 사용할 수 있습니다.
    

### 예제 {id="example"}
템플릿을 사용하여 계층적 레이아웃을 생성하는 방법을 [예제](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/html-templates)를 통해 살펴보겠습니다. 다음과 같은 HTML이 있다고 가정해 봅니다:
```html
<body>
<h1>Ktor</h1>
<article>
    <h2>Hello from Ktor!</h2>
    <p>Kotlin Framework for creating connected systems.</p>
    <ul>
       <li><b>One</b></li>
       <li>Two</li>
    </ul>
</article>
</body>
```
이 페이지의 레이아웃을 두 부분으로 나눌 수 있습니다:
* 페이지 헤더를 위한 루트 레이아웃 템플릿과 아티클을 위한 자식 템플릿.
* 아티클 콘텐츠를 위한 자식 템플릿.

이러한 레이아웃을 단계별로 구현해 보겠습니다:
  
1. `respondHtmlTemplate` 메서드를 호출하고 템플릿 클래스를 매개변수로 전달합니다. 이 경우 `Template` 인터페이스를 구현해야 하는 `LayoutTemplate` 클래스입니다:
   ```kotlin
   get("/") {
       call.respondHtmlTemplate(LayoutTemplate()) {
           // ...
       }
   }
   ```
   블록 내부에서 템플릿에 접근하여 프로퍼티 값을 지정할 수 있습니다. 이 값들은 템플릿 클래스에 지정된 플레이스홀더를 대체합니다. 다음 단계에서 `LayoutTemplate`을 생성하고 해당 프로퍼티를 정의하겠습니다.
  
2. 루트 레이아웃 템플릿은 다음과 같습니다:
   ```kotlin
   class LayoutTemplate: Template<HTML> {
       val header = Placeholder<FlowContent>()
       val content = TemplatePlaceholder<ArticleTemplate>()
       override fun HTML.apply() {
           body {
               h1 {
                   insert(header)
               }
               insert(ArticleTemplate(), content)
           }
       }
   }
   ```

   이 클래스는 두 개의 프로퍼티를 제공합니다:
   * `header` 프로퍼티는 `h1` 태그 내에 삽입될 콘텐츠를 지정합니다.
   * `content` 프로퍼티는 아티클 콘텐츠를 위한 자식 템플릿을 지정합니다.

3. 자식 템플릿은 다음과 같습니다:
   ```kotlin
   class ArticleTemplate : Template<FlowContent> {
       val articleTitle = Placeholder<FlowContent>()
       val articleText = Placeholder<FlowContent>()
       val list = TemplatePlaceholder<ListTemplate>()
       override fun FlowContent.apply() {
           article {
               h2 {
                   insert(articleTitle)
               }
               p {
                   insert(articleText)
               }
               insert(ListTemplate(), list)
           }
       }
   }
   ```

   이 템플릿은 `articleTitle`, `articleText`, `list` 프로퍼티를 제공하며, 해당 값들은 `article` 내부에 삽입됩니다.

4. 템플릿에 값 목록을 제공하려면 다음과 같이 새 클래스를 생성합니다: 
   ```kotlin
   class ListTemplate : Template<FlowContent> {
       val item = PlaceholderList<UL, FlowContent>()
       override fun FlowContent.apply() {
           if (!item.isEmpty()) {
               ul {
                   each(item) {
                       li {
                           if (it.first) {
                               b {
                                   insert(it)
                               }
                           } else {
                               insert(it)
                           }
                       }
                   }
               }
           }
       }
   }
   ```

   이 템플릿은 `PlaceholderList` 클래스를 사용하여 제공된 항목들로부터 순서 없는 목록(`UL`)을 생성합니다.
   또한 강조를 위해 첫 번째 항목을 `<b>` 요소로 감쌉니다.

5. 이제 지정된 프로퍼티 값들을 사용하여 빌드된 HTML을 전송할 준비가 되었습니다:
   ```kotlin
   get("/") {
       call.respondHtmlTemplate(LayoutTemplate()) {
           header {
               +"Ktor"
           }
           content {
               articleTitle {
                   +"Hello from Ktor!"
               }
               articleText {
                   +"Kotlin Framework for creating connected systems."
               }
               list {
                   item { +"One" }
                   item { +"Two" }
               }
           }
       }
   }
   ```

전체 예제는 [html-templates](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/html-templates)에서 확인할 수 있습니다.