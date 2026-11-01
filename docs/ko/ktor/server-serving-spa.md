[//]: # (title: 단일 페이지 애플리케이션 서빙)

<show-structure for="chapter" depth="2"/>

<tldr>
<var name="example_name" value="single-page-application"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
Ktor는 React, Angular, Vue 등을 포함한 단일 페이지 애플리케이션을 서빙하는 기능을 제공합니다.
</link-summary>

Ktor는 React, Angular, Vue 등을 포함한 단일 페이지 애플리케이션을 서빙하는 기능을 제공합니다.

## 의존성 추가 {id="add_dependencies"}

단일 페이지 애플리케이션을 서빙하려면 [ktor-server-core](server-dependencies.topic#add-ktor-dependencies) 의존성만 있으면 됩니다.
별도의 특정한 의존성은 필요하지 않습니다.

## 애플리케이션 서빙 {id="configure"}

단일 페이지 애플리케이션을 서빙하려면 로컬 파일 시스템이나 클래스패스(classpath) 중 콘텐츠를 어디에서 제공할지 정의해야 합니다.
최소한 단일 페이지 애플리케이션이 포함된 폴더 또는 리소스 패키지를 지정해야 합니다.

### 특정 프레임워크 애플리케이션 서빙 {id="serve-framework"}

React, Angular, Vue 등 특정 프레임워크를 사용하여 빌드된 단일 페이지 애플리케이션을 서빙할 수 있습니다. 
프로젝트 루트에 React 애플리케이션이 포함된 `react-app` 폴더가 있다고 가정해 보겠습니다.
이 애플리케이션은 다음과 같은 구조를 가지며, 메인 페이지로 `index.html` 파일을 포함하고 있습니다:

```text
react-app
├── index.html
├── ...
└── static
    └── ...
```

이 애플리케이션을 서빙하려면 [routing](server-routing.md) 블록 내부에서 [singlePageApplication](https://api.ktor.io/ktor-server-core/io.ktor.server.http.content/single-page-application.html)을 호출하고 `react` 함수에 폴더 이름을 전달합니다:

```kotlin
import io.ktor.server.application.*
import io.ktor.server.http.content.*
import io.ktor.server.routing.*

fun Application.module() {
    routing {
        singlePageApplication {
            react("react-app")
        }
    }
}
```

Ktor는 자동으로 `index.html`을 찾습니다. 
기본 페이지를 사용자 정의하는 방법은 [서빙 설정 커스터마이징](#serve-customize)을 참조하세요.

> 다른 프레임워크의 경우 `angular`, `vue`, `ember` 등 해당하는 함수를 사용하세요.

### 서빙 설정 커스터마이징 {id="serve-customize"}

리소스에서 단일 페이지 애플리케이션을 서빙하는 방법을 보여주기 위해, 애플리케이션이 다음과 같은 구조를 가진 `sample-web-app` 리소스 패키지 내에 위치한다고 가정해 보겠습니다:

```text
sample-web-app
├── main.html
├── ktor_logo.png
├── css
│   └──styles.css
└── js
    └── script.js
```

이 애플리케이션을 서빙하기 위해 다음과 같은 구성을 사용합니다:

```kotlin
import io.ktor.server.application.*
import io.ktor.server.http.content.*
import io.ktor.server.routing.*

fun Application.module() {
    routing {
        singlePageApplication {
            useResources = true
            filesPath = "sample-web-app"
            defaultPage = "main.html"
            ignoreFiles { it.endsWith(".txt") }
        }
    }
}
```

- `useResources`: 리소스 패키지에서 애플리케이션 서빙을 활성화합니다.
- `filesPath`: 애플리케이션이 위치한 경로를 지정합니다.
- `defaultPage`: 서빙할 기본 리소스로 `main.html`을 지정합니다.
- `ignoreFiles`: 끝에 `.txt`가 포함된 경로를 무시합니다.

전체 예제는 여기에서 확인할 수 있습니다: [single-page-application](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/single-page-application).