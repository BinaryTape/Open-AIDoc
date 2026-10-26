[//]: # (title: React와 Kotlin/JS로 웹 애플리케이션 구축하기 — 튜토리얼)

<no-index/>

이 튜토리얼에서는 Kotlin/JS와 [React](https://reactjs.org/) 프레임워크를 사용하여 브라우저 애플리케이션을 구축하는 방법을 배웁니다. 다음 내용을 다룹니다:

* 일반적인 React 애플리케이션 구축과 관련된 공통 작업 완료하기.
* 가독성을 해치지 않으면서 개념을 간결하고 일관되게 표현할 수 있는 [Kotlin의 DSL](type-safe-builders.md)을 살펴보고, 완전히 Kotlin만으로 본격적인 애플리케이션을 작성하는 방법 알아보기.
* 기성 npm 컴포넌트 사용법, 외부 라이브러리 활용법, 그리고 최종 애플리케이션을 배포하는 방법 배우기.

결과물은 [KotlinConf](https://kotlinconf.com/) 이벤트를 위한 _KotlinConf Explorer_ 웹 앱으로, 콘퍼런스 발표 영상 링크가 포함됩니다. 사용자는 한 페이지에서 모든 발표 영상을 시청하고 시청 여부를 표시할 수 있습니다.

이 튜토리얼은 Kotlin에 대한 사전 지식과 HTML 및 CSS에 대한 기본 지식이 있다고 가정합니다. React의 기본 개념을 이해하고 있다면 예제 코드를 이해하는 데 도움이 될 수 있지만, 필수는 아닙니다.

> 완성된 애플리케이션은 [여기](https://github.com/kotlin-hands-on/web-app-react-kotlin-js-gradle/tree/finished)에서 확인할 수 있습니다.
>
{style="note"}

## 시작하기 전에 {id="before-you-start"}

1. 최신 버전의 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/)를 다운로드하여 설치합니다.
2. [프로젝트 템플릿](https://github.com/kotlin-hands-on/web-app-react-kotlin-js-gradle)을 클론하고 IntelliJ IDEA에서 엽니다. 템플릿에는 필요한 모든 구성과 의존성이 포함된 기본적인 Kotlin Multiplatform Gradle 프로젝트가 들어 있습니다.

   * `build.gradle.kts` 파일의 의존성 및 태스크:
   
   ```kotlin
   dependencies {
       // React, React DOM + Wrappers
       implementation(enforcedPlatform("org.jetbrains.kotlin-wrappers:kotlin-wrappers-bom:1.0.0-pre.430"))
       implementation("org.jetbrains.kotlin-wrappers:kotlin-react")
       implementation("org.jetbrains.kotlin-wrappers:kotlin-react-dom")
   
       // Kotlin React Emotion (CSS)
       implementation("org.jetbrains.kotlin-wrappers:kotlin-emotion")
   
       // Video Player
       implementation(npm("react-player", "^2.12.0"))
   
       // Share Buttons
       implementation(npm("react-share", "^4.4.1"))
   
       // Coroutines & serialization
       implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.6.4")
       implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.5.0")
   }
   ```

   * 이 튜토리얼에서 사용할 JavaScript 코드를 삽입하기 위한 `src/jsMain/resources/index.html`의 HTML 템플릿 페이지:

   ```html
   <!doctype html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <title>Hello, Kotlin/JS!</title>
   </head>
   <body>
       <div id="root"></div>
       <script src="confexplorer.js"></script>
   </body>
   </html>
   ```
   {validate="false"}

   Kotlin/JS 프로젝트를 빌드하면 모든 코드와 의존성이 프로젝트 이름과 동일한 단일 JavaScript 파일인 `confexplorer.js`로 자동 번들링됩니다. 일반적인 [JavaScript 관례](https://faqs.skillcrush.com/article/176-where-should-js-script-tags-be-linked-in-html-documents)에 따라, 브라우저가 스크립트 전에 모든 페이지 요소를 먼저 로드할 수 있도록 body 내용(`root` div 포함)이 먼저 로드됩니다.

* `src/jsMain/kotlin/Main.kt`의 코드 스니펫:

   ```kotlin
   import kotlinx.browser.document
   
   fun main() {
       document.bgColor = "red"
   }
   ```

### 개발 서버 실행 {id="run-the-development-server"}

기본적으로 Kotlin Multiplatform Gradle 플러그인에는 임베디드 `webpack-dev-server` 지원이 포함되어 있어, 수동으로 서버를 설정하지 않고도 IDE에서 애플리케이션을 실행할 수 있습니다.

프로그램이 브라우저에서 성공적으로 실행되는지 테스트하려면, IntelliJ IDEA 내의 Gradle 도구 창에서 `run` 또는 `browserDevelopmentRun` 태스크(`other` 또는 `kotlin browser` 디렉터리에 위치)를 실행하여 개발 서버를 시작합니다:

![Gradle 태스크 목록](browser-development-run.png){width=700}

터미널에서 프로그램을 실행하려면 `./gradlew run`을 사용하세요.

프로젝트가 컴파일되고 번들링되면 브라우저 창에 빈 빨간색 페이지가 나타납니다:

![빈 빨간색 페이지](red-page.png){width=700}

### 핫 리로드(Hot Reload) / 연속 모드 활성화 {id="enable-hot-reload-continuous-mode"}

코드를 변경할 때마다 프로젝트를 수동으로 컴파일하고 실행할 필요가 없도록 _[연속 컴파일(continuous compilation)](dev-server-continuous-compilation.md)_ 모드를 구성합니다. 진행하기 전에 실행 중인 모든 개발 서버 인스턴스를 중지하세요.

1. Gradle `run` 태스크를 처음 실행한 후 IntelliJ IDEA가 자동으로 생성한 실행 구성을 편집합니다:

   ![실행 구성 편집](edit-configurations-continuous.png){width=700}

2. **Run/Debug Configurations** 대화 상자에서 실행 구성의 Arguments에 `--continuous` 옵션을 추가합니다:

   ![연속 모드 활성화](continuous-mode.png){width=700}

   변경 사항을 적용한 후, IntelliJ IDEA 내부의 **Run** 버튼을 사용하여 개발 서버를 다시 시작할 수 있습니다. 터미널에서 연속 Gradle 빌드를 실행하려면 `./gradlew run --continuous`를 사용하세요.

3. 이 기능을 테스트하려면 Gradle 태스크가 실행 중인 상태에서 `Main.kt` 파일의 페이지 배경색을 파란색으로 변경해 봅니다:

   ```kotlin
   document.bgColor = "blue"
   ```

   그러면 프로젝트가 다시 컴파일되고, 페이지를 새로고침하면 브라우저 페이지가 새로운 색상으로 표시됩니다.

개발 과정 동안 개발 서버를 연속 모드로 계속 실행해 둘 수 있습니다. 코드를 변경하면 자동으로 페이지를 다시 빌드하고 새로고침합니다.

> 이 단계의 프로젝트 상태는 [여기](https://github.com/kotlin-hands-on/web-app-react-kotlin-js-gradle/tree/master)의 `master` 브랜치에서 확인할 수 있습니다.
>
{style="note"}

## 웹 앱 초안 만들기 {id="create-a-web-app-draft"}

### React로 첫 번째 정적 페이지 추가 {id="add-the-first-static-page-with-react"}

앱에 간단한 메시지를 표시하려면 `Main.kt` 파일의 코드를 다음으로 바꿉니다:

```kotlin
import kotlinx.browser.document
import react.*
import emotion.react.css
import csstype.Position
import csstype.px
import react.dom.html.ReactHTML.h1
import react.dom.html.ReactHTML.h3
import react.dom.html.ReactHTML.div
import react.dom.html.ReactHTML.p
import react.dom.html.ReactHTML.img
import react.dom.client.createRoot
import kotlinx.serialization.Serializable

fun main() {
    val container = document.getElementById("root") ?: error("Couldn't find root container!")
    createRoot(container).render(Fragment.create {
        h1 {
            +"Hello, React+Kotlin/JS!"
        }
    })
}
```
{validate="false"}

* `render()` 함수는 [kotlin-react-dom](https://github.com/JetBrains/kotlin-wrappers/tree/master/kotlin-react-dom)에 [프래그먼트(fragment)](https://reactjs.org/docs/fragments.html) 내부의 첫 번째 HTML 요소를 `root` 요소에 렌더링하도록 지시합니다. 이 요소는 템플릿에 포함되어 있던 `src/jsMain/resources/index.html`에 정의된 컨테이너입니다.
* 콘텐츠는 `<h1>` 헤더이며 HTML을 렌더링하기 위해 타입 안전한 DSL을 사용합니다.
* `h1`은 람다 파라미터를 받는 함수입니다. 문자열 리터럴 앞에 `+` 기호를 추가하면 실제로 [연산자 오버로딩(operator overloading)](operator-overloading.md)을 통해 `unaryPlus()` 함수가 호출됩니다. 이는 감싸고 있는 HTML 요소에 해당 문자열을 추가합니다.

프로젝트가 다시 컴파일되면 브라우저에 다음과 같은 HTML 페이지가 표시됩니다:

![HTML 페이지 예시](hello-react-js.png){width=700}

### HTML을 Kotlin의 타입 안전 HTML DSL로 변환 {id="convert-html-to-kotlin-s-typesafe-html-dsl"}

React용 Kotlin [래퍼(wrappers)](https://github.com/JetBrains/kotlin-wrappers/blob/master/kotlin-react/README.md)에는 순수 Kotlin 코드로 HTML을 작성할 수 있게 해주는 [도메인 특화 언어(DSL)](type-safe-builders.md)가 포함되어 있습니다. 이러한 방식은 JavaScript의 [JSX](https://reactjs.org/docs/introducing-jsx.html)와 유사합니다. 하지만 마크업이 Kotlin으로 작성되므로 자동 완성과 타입 검사 등 정적 타입 언어의 모든 이점을 누릴 수 있습니다.

앞으로 만들 웹 앱의 일반적인 HTML 코드와 Kotlin의 타입 안전 버전을 비교해 보세요:

<tabs>
<tab title="HTML">

```html
<h1>KotlinConf Explorer</h1>
<div>
    <h3>Videos to watch</h3>
    <p>John Doe: Building and breaking things</p>
    <p>Jane Smith: The development process</p>
    <p>Matt Miller: The Web 7.0</p>
    <h3>Videos watched</h3>
    <p>Tom Jerry: Mouseless development</p>
</div>
<div>
    <h3>John Doe: Building and breaking things</h3>
    <img src="https://via.placeholder.com/640x360.png?text=Video+Player+Placeholder">
</div>
```

</tab>
<tab title="Kotlin">

```kotlin
h1 {
    +"KotlinConf Explorer"
}
div {
    h3 {
        +"Videos to watch"
    }
    p {
        + "John Doe: Building and breaking things"
    }
    p {
        +"Jane Smith: The development process"
    }
    p {
        +"Matt Miller: The Web 7.0"
    }
    h3 {
        +"Videos watched"
    }
    p {
        +"Tom Jerry: Mouseless development"
    }
}
div {
    h3 {
        +"John Doe: Building and breaking things"
    }
    img {
       src = "https://via.placeholder.com/640x360.png?text=Video+Player+Placeholder"
    }
}
```

</tab>
</tabs>

Kotlin 코드를 복사하고 `main()` 함수 내부의 `Fragment.create()` 함수 호출을 업데이트하여 이전 `h1` 태그를 대체합니다.

브라우저가 다시 로드될 때까지 기다립니다. 이제 페이지가 다음과 같이 표시되어야 합니다:

![웹 앱 초안](website-draft.png){width=700}

### 마크업에서 Kotlin 구조를 사용하여 비디오 추가 {id="add-videos-using-kotlin-constructs-in-markup"}

이 DSL을 사용하여 Kotlin으로 HTML을 작성하면 몇 가지 장점이 있습니다. 반복문, 조건문, 컬렉션, 문자열 템플릿과 같은 일반적인 Kotlin 구성을 사용하여 앱을 제어할 수 있습니다.

이제 하드코딩된 비디오 목록을 Kotlin 객체 목록으로 대체할 수 있습니다:

1. `Main.kt`에서 모든 비디오 속성을 한곳에 보관할 `Video` [데이터 클래스(data class)](data-classes.md)를 만듭니다:

   ```kotlin
   data class Video(
       val id: Int,
       val title: String,
       val speaker: String,
       val videoUrl: String
   )
   ```

2. 아직 시청하지 않은 비디오와 시청한 비디오를 위한 두 개의 리스트를 채웁니다. `Main.kt`의 파일 수준에 다음 선언을 추가합니다:

   ```kotlin
   val unwatchedVideos = listOf(
       Video(1, "Opening Keynote", "Andrey Breslav", "https://youtu.be/PsaFVLr8t4E"),
       Video(2, "Dissecting the stdlib", "Huyen Tue Dao", "https://youtu.be/Fzt_9I733Yg"),
       Video(3, "Kotlin and Spring Boot", "Nicolas Frankel", "https://youtu.be/pSiZVAeReeg")
   )
   
   val watchedVideos = listOf(
       Video(4, "Creating Internal DSLs in Kotlin", "Venkat Subramaniam", "https://youtu.be/JzTeAM8N1-o")
   )
   ```

3. 페이지에서 이 비디오들을 사용하려면, Kotlin `for` 루프를 작성하여 시청하지 않은 `Video` 객체 컬렉션을 순회합니다. "Videos to watch" 아래의 세 `p` 태그를 다음 스니펫으로 바꿉니다:

   ```kotlin
   for (video in unwatchedVideos) {
       p {
           +"${video.speaker}: ${video.title}"
       }
   }
   ```
   
4. 동일한 방식으로 "Videos watched" 뒤에 오는 단일 태그의 코드도 수정합니다:

   ```kotlin
   for (video in watchedVideos) {
       p {
           +"${video.speaker}: ${video.title}"
       }
   }
   ```

브라우저가 다시 로드될 때까지 기다립니다. 레이아웃은 이전과 동일하게 유지되어야 합니다. 루프가 제대로 작동하는지 확인하기 위해 목록에 비디오를 몇 개 더 추가해 볼 수도 있습니다.

### 타입 안전 CSS로 스타일 추가 {id="add-styles-with-typesafe-css"}

[Emotion](https://emotion.sh/docs/introduction) 라이브러리용 [kotlin-emotion](https://github.com/JetBrains/kotlin-wrappers/blob/master/kotlin-emotion/) 래퍼를 사용하면 JavaScript와 함께 HTML 바로 옆에 CSS 속성(동적 속성 포함)을 지정할 수 있습니다. 개념적으로 이는 [CSS-in-JS](https://reactjs.org/docs/faq-styling.html#what-is-css-in-js)와 유사하지만 Kotlin을 위한 것입니다. DSL을 사용하는 이점은 Kotlin 코드 구성을 사용하여 서식 지정 규칙을 표현할 수 있다는 점입니다.

이 튜토리얼의 템플릿 프로젝트에는 `kotlin-emotion`을 사용하는 데 필요한 의존성이 이미 포함되어 있습니다:

```kotlin
dependencies {
    // ...
    // Kotlin React Emotion (CSS) (chapter 3)
    implementation("org.jetbrains.kotlin-wrappers:kotlin-emotion")
    // ...
}
```

`kotlin-emotion`을 사용하면 HTML 요소인 `div` 및 `h3` 내부에 스타일을 정의할 수 있는 `css` 블록을 지정할 수 있습니다.

비디오 플레이어를 페이지의 오른쪽 상단 모서리로 이동하려면 CSS를 사용하고 비디오 플레이어의 코드(스니펫의 마지막 `div`)를 다음과 같이 조정합니다:

```kotlin
div {
    css {
        position = Position.absolute
        top = 10.px
        right = 10.px
    }
    h3 {
        +"John Doe: Building and breaking things"
    }
    img {
        src = "https://via.placeholder.com/640x360.png?text=Video+Player+Placeholder"
    }
}
```

다른 스타일도 자유롭게 시험해 보세요. 예를 들어, `fontFamily`를 변경하거나 UI에 `color`를 추가할 수 있습니다.

## 앱 컴포넌트 설계 {id="design-app-components"}

React의 기본 빌딩 블록을 _[컴포넌트(components)](https://reactjs.org/docs/components-and-props.html)_라고 부릅니다. 컴포넌트 자체도 더 작은 다른 컴포넌트들로 구성될 수 있습니다. 컴포넌트를 조합하여 애플리케이션을 구축합니다. 컴포넌트를 범용적이고 재사용 가능하게 구성하면 코드나 로직을 중복하지 않고 앱의 여러 부분에서 사용할 수 있습니다.

`render()` 함수의 내용은 일반적으로 기본 컴포넌트를 나타냅니다. 현재 애플리케이션의 레이아웃은 다음과 같습니다:

![현재 레이아웃](current-layout.png){width=700}

애플리케이션을 개별 컴포넌트로 분해하면 각 컴포넌트가 고유한 역할을 담당하는 보다 구조화된 레이아웃을 얻을 수 있습니다:

![컴포넌트로 구조화된 레이아웃](structured-layout.png){width=700}

컴포넌트는 특정 기능을 캡슐화합니다. 컴포넌트를 사용하면 소스 코드가 짧아지고 읽고 이해하기 쉬워집니다.

### 메인 컴포넌트 추가 {id="add-the-main-component"}

애플리케이션의 구조를 만들기 시작하려면, 먼저 `root` 요소에 렌더링할 메인 컴포넌트인 `App`을 명시적으로 지정합니다:

1. `src/jsMain/kotlin` 폴더에 새 `App.kt` 파일을 생성합니다.
2. 이 파일 안에 다음 스니펫을 추가하고 `Main.kt`의 타입 안전 HTML을 옮겨옵니다:

   ```kotlin
   import kotlinx.coroutines.async
   import react.*
   import react.dom.*
   import kotlinx.browser.window
   import kotlinx.coroutines.*
   import kotlinx.serialization.decodeFromString
   import kotlinx.serialization.json.Json
   import emotion.react.css
   import csstype.Position
   import csstype.px
   import react.dom.html.ReactHTML.h1
   import react.dom.html.ReactHTML.h3
   import react.dom.html.ReactHTML.div
   import react.dom.html.ReactHTML.p
   import react.dom.html.ReactHTML.img
   
   val App = FC<Props> {
       // 첫 번째 h1 태그부터 시작하는 타입 안전 HTML이 여기에 들어갑니다!
   }
   ```
   
   `FC` 함수는 [함수 컴포넌트(function component)](https://reactjs.org/docs/components-and-props.html#function-and-class-components)를 생성합니다.

3. `Main.kt` 파일에서 `main()` 함수를 다음과 같이 업데이트합니다:

   ```kotlin
   fun main() {
       val container = document.getElementById("root") ?: error("Couldn't find root container!")
       createRoot(container).render(App.create())
   }
   ```

   이제 프로그램은 `App` 컴포넌트의 인스턴스를 생성하고 지정된 컨테이너에 렌더링합니다.

React 개념에 대한 자세한 내용은 [문서 및 가이드](https://reactjs.org/docs/hello-world.html#how-to-read-this-guide)를 참조하세요.

### 목록 컴포넌트 추출 {id="extract-a-list-component"}

`watchedVideos`와 `unwatchedVideos` 리스트는 각각 비디오 목록을 포함하고 있으므로, 하나의 재사용 가능한 컴포넌트를 만들고 목록에 표시되는 내용만 조정하는 것이 합리적입니다.

`VideoList` 컴포넌트는 `App` 컴포넌트와 동일한 패턴을 따릅니다. `FC` 빌더 함수를 사용하며, `unwatchedVideos` 목록의 코드를 포함합니다.

1. `src/jsMain/kotlin` 폴더에 새 `VideoList.kt` 파일을 만들고 다음 코드를 추가합니다:

   ```kotlin
   import kotlinx.browser.window
   import react.*
   import react.dom.*
   import react.dom.html.ReactHTML.p
   
   val VideoList = FC<Props> {
       for (video in unwatchedVideos) {
           p {
               +"${video.speaker}: ${video.title}"
           }
       }
   }
   ```

2. `App.kt`에서 `VideoList` 컴포넌트를 파라미터 없이 호출하여 사용합니다:

   ```kotlin
   // . . .

   div {
       h3 {
           +"Videos to watch"
       }
       VideoList()
   
       h3 {
           +"Videos watched"
       }
       VideoList()
   }

   // . . .
   ```

   현재로서는 `App` 컴포넌트가 `VideoList` 컴포넌트에 표시되는 내용을 제어할 수 없습니다. 내용이 하드코딩되어 있으므로 동일한 목록이 두 번 표시됩니다.

### 컴포넌트 간 데이터 전달을 위한 props 추가 {id="add-props-to-pass-data-between-components"}

`VideoList` 컴포넌트를 재사용할 것이므로, 다양한 내용으로 채울 수 있어야 합니다. 컴포넌트에 항목 목록을 속성으로 전달하는 기능을 추가할 수 있습니다. React에서는 이러한 속성을 _props_(프롭스)라고 부릅니다. React에서 컴포넌트의 props가 변경되면 프레임워크가 컴포넌트를 자동으로 다시 렌더링합니다.

`VideoList`의 경우 표시할 비디오 목록을 포함하는 prop이 필요합니다. `VideoList` 컴포넌트에 전달할 수 있는 모든 props를 담는 인터페이스를 정의합니다:

1. `VideoList.kt` 파일에 다음 정의를 추가합니다:

   ```kotlin
   external interface VideoListProps : Props {
       var videos: List<Video>
   }
   ```
   [external](js-interop.md#external-modifier) 수정자는 인터페이스의 구현이 외부에 제공됨을 컴파일러에 알려주므로, 선언으로부터 JavaScript 코드를 생성하지 않도록 합니다.

2. `VideoList`의 클래스 정의를 수정하여 `FC` 블록에 파라미터로 전달된 props를 사용하도록 합니다:

   ```kotlin
   val VideoList = FC<VideoListProps> { props ->
       for (video in props.videos) {
           p {
               key = video.id.toString()
               +"${video.speaker}: ${video.title}"
           }
       }
   }
   ```

   `key` 속성은 React 렌더러가 `props.videos`의 값이 변경될 때 수행할 작업을 파악하는 데 도움을 줍니다. 키를 사용하여 목록의 어떤 부분을 새로고침해야 하고 어떤 부분을 그대로 유지할지 결정합니다. 목록과 키에 대한 자세한 내용은 [React 가이드](https://reactjs.org/docs/lists-and-keys.html)에서 확인할 수 있습니다.

3. `App` 컴포넌트에서 자식 컴포넌트가 올바른 속성으로 인스턴스화되었는지 확인합니다. `App.kt`에서 `h3` 요소 아래의 두 루프를 `unwatchedVideos` 및 `watchedVideos` 속성을 갖는 `VideoList` 호출로 바꿉니다. Kotlin DSL에서는 `VideoList` 컴포넌트에 속한 블록 내부에서 이를 할당합니다:

   ```kotlin
   h3 {
       +"Videos to watch"
   }
   VideoList {
       videos = unwatchedVideos
   }
   h3 {
       +"Videos watched"
   }
   VideoList {
       videos = watchedVideos
   }
   ```

새로고침 후 브라우저를 확인하면 목록이 올바르게 렌더링되는 것을 볼 수 있습니다.

### 목록에 상호작용 기능 추가 {id="make-the-list-interactive"}

먼저 사용자가 목록 항목을 클릭했을 때 나타나는 알림(alert) 메시지를 추가합니다. `VideoList.kt`에서 현재 비디오 정보를 알림창으로 띄우는 `onClick` 핸들러 함수를 추가합니다:

```kotlin
// . . .

p {
    key = video.id.toString()
    onClick = {
        window.alert("Clicked $video!")
    }
    +"${video.speaker}: ${video.title}"
}

// . . .
```

브라우저 창에서 목록 항목 중 하나를 클릭하면 다음과 같은 알림 창에 비디오 정보가 표시됩니다:

![브라우저 알림 창](alert-window.png){width=700}

> `onClick` 함수를 람다로 직접 정의하는 것은 간결하며 프로토타이핑에 매우 유용합니다. 하지만 Kotlin/JS에서 동일성(equality)이 [현재 동작하는 방식](https://youtrack.jetbrains.com/issue/KT-15101) 때문에, 성능 관점에서는 클릭 핸들러를 전달하는 가장 최적화된 방법이 아닙니다. 렌더링 성능을 최적화하려면 함수를 변수에 저장한 뒤 전달하는 것을 고려해 보세요.
>
{style="tip"}

### 값을 유지하기 위한 상태(state) 추가 {id="add-state-to-keep-values"}

단순히 사용자에게 알림을 표시하는 대신, 선택한 비디오를 ▶ 삼각형으로 강조 표시하는 기능을 추가할 수 있습니다. 이를 위해 이 컴포넌트에 특화된 _상태(state)_를 도입합니다.

상태는 React의 핵심 개념 중 하나입니다. 모던 React(소위 _Hooks API_를 사용하는)에서 상태는 [`useState` 훅](https://reactjs.org/docs/hooks-state.html)을 사용하여 표현됩니다.

1. `VideoList` 선언의 상단에 다음 코드를 추가합니다:

   ```kotlin
   val VideoList = FC<VideoListProps> { props ->
       var selectedVideo: Video? by useState(null)

   // . . .
   ```
   {validate="false"}

   * `VideoList` 함수 컴포넌트는 상태(현재 함수 호출과 무관하게 유지되는 값)를 유지합니다. 상태는 널을 허용하며 `Video?` 타입을 갖습니다. 기본값은 `null`입니다.
   * React의 `useState()` 함수는 프레임워크가 함수의 여러 호출에 걸쳐 상태를 추적하도록 지시합니다. 예를 들어 기본값을 지정하더라도, React는 처음에만 기본값이 할당되도록 보장합니다. 상태가 변경되면 컴포넌트는 새로운 상태를 기반으로 다시 렌더링됩니다.
   * `by` 키워드는 `useState()`가 [위임된 속성(delegated property)](delegated-properties.md)으로 동작함을 나타냅니다. 다른 일반 변수와 마찬가지로 값을 읽고 쓸 수 있습니다. `useState()`의 내부 구현체가 상태가 동작하는 데 필요한 메커니즘을 처리합니다.

   상태 훅(State Hook)에 대해 자세히 알아보려면 [React 문서](https://reactjs.org/docs/hooks-state.html)를 확인하세요.

2. `VideoList` 컴포넌트의 `onClick` 핸들러와 텍스트를 다음과 같이 변경합니다:

   ```kotlin
   val VideoList = FC<VideoListProps> { props ->
       var selectedVideo: Video? by useState(null)
       for (video in props.videos) {
           p {
               key = video.id.toString()
               onClick = {
                   selectedVideo = video
               }
               if (video == selectedVideo) {
                   +"▶ "
               }
               +"${video.speaker}: ${video.title}"
           }
       }
   }
   ```

   * 사용자가 비디오를 클릭하면 해당 값이 `selectedVideo` 변수에 할당됩니다.
   * 선택된 목록 항목이 렌더링될 때 삼각형 표시가 앞에 붙습니다.

상태 관리에 대한 자세한 내용은 [React FAQ](https://reactjs.org/docs/faq-state.html)에서 확인할 수 있습니다.

브라우저를 확인하고 목록의 항목을 클릭하여 모든 것이 올바르게 작동하는지 확인하세요.

## 컴포넌트 조합 {id="compose-components"}

현재 두 비디오 목록은 개별적으로 작동하므로, 각 목록이 선택된 비디오를 따로 추적합니다. 플레이어가 하나뿐임에도 불구하고 사용자가 시청하지 않은 목록과 시청한 목록에서 각각 하나씩 두 개의 비디오를 선택할 수 있는 상태입니다:

![두 목록에서 비디오가 동시에 선택됨](two-videos-select.png){width=700}

하나의 목록은 자신 내부와 형제 목록 내부에서 어떤 비디오가 선택되었는지를 동시에 추적할 수 없습니다. 선택된 비디오가 _목록(list)_의 상태가 아니라 _애플리케이션(application)_ 상태의 일부이기 때문입니다. 즉, 개별 컴포넌트 외부로 상태를 _끌어올려야(lift)_ 합니다.

### 상태 끌어올리기 (Lift state) {id="lift-state"}

React는 props가 부모 컴포넌트에서 자식 컴포넌트로만 전달될 수 있도록 보장합니다. 이는 컴포넌트들이 서로 강하게 결합되는 것을 방지합니다.

어떤 컴포넌트가 형제 컴포넌트의 상태를 변경하려면 부모를 통해 변경해야 합니다. 그 시점에서 상태는 더 이상 자식 컴포넌트에 속하지 않고 상위 부모 컴포넌트에 속하게 됩니다.

컴포넌트에서 부모 컴포넌트로 상태를 이전하는 프로세스를 _상태 끌어올리기(lifting state)_라고 합니다. 앱의 경우 `currentVideo`를 `App` 컴포넌트의 상태로 추가합니다:

1. `App.kt`에서 `App` 컴포넌트 정의의 맨 위에 다음을 추가합니다:

   ```kotlin
   val App = FC<Props> {
       var currentVideo: Video? by useState(null)
   
       // . . .
   }
   ```

   이제 `VideoList` 컴포넌트는 상태를 추적할 필요가 없습니다. 대신 현재 비디오를 prop으로 전달받습니다.

2. `VideoList.kt`에서 `useState()` 호출을 제거합니다.
3. `VideoList` 컴포넌트가 선택된 비디오를 prop으로 받을 수 있도록 준비합니다. 이를 위해 `VideoListProps` 인터페이스를 확장하여 `selectedVideo`를 포함하도록 합니다:

   ```kotlin
   external interface VideoListProps : Props {
       var videos: List<Video>
       var selectedVideo: Video?
   }
   ```

4. 삼각형 표시 조건이 `state` 대신 `props`를 사용하도록 변경합니다:

   ```kotlin
   if (video == props.selectedVideo) {
       +"▶ "
   }
   ```

### 핸들러 전달 {id="pass-handlers"}

현재로서는 prop에 값을 직접 할당할 수 없으므로, 현재 설정된 방식으로는 `onClick` 함수가 작동하지 않습니다. 부모 컴포넌트의 상태를 변경하려면 상태를 한 번 더 끌어올려야 합니다.

React에서 상태는 항상 부모에서 자식으로 흐릅니다. 따라서 자식 컴포넌트 중 하나에서 _애플리케이션_ 상태를 변경하려면 사용자 상호작용을 처리하는 로직을 부모 컴포넌트로 이동한 다음 그 로직을 prop으로 전달해야 합니다. Kotlin에서는 변수가 [함수 타입](lambdas.md#function-types)을 가질 수 있다는 점을 기억하세요.

1. `VideoListProps` 인터페이스를 다시 확장하여 `Video`를 받아 `Unit`을 반환하는 함수인 `onSelectVideo` 변수를 포함하도록 합니다:

   ```kotlin
   external interface VideoListProps : Props {
       // ...
       var onSelectVideo: (Video) -> Unit
   }
   ```

2. `VideoList` 컴포넌트의 `onClick` 핸들러에서 새 prop을 사용합니다:

   ```kotlin
   onClick = {
       props.onSelectVideo(video)
   }
   ```
   
   이제 `VideoList` 컴포넌트에서 `selectedVideo` 변수를 삭제할 수 있습니다.

3. `App` 컴포넌트로 돌아가 두 비디오 목록 각각에 대해 `selectedVideo`와 `onSelectVideo`용 핸들러를 전달합니다:

   ```kotlin
   VideoList {
       videos = unwatchedVideos // 및 watchedVideos 각각
       selectedVideo = currentVideo
       onSelectVideo = { video ->
           currentVideo = video
       }
   }
   ```

4. 시청한 비디오 목록에 대해서도 이전 단계를 반복합니다.

브라우저로 돌아가 비디오를 선택했을 때 중복 선택 없이 두 목록 사이를 정상적으로 이동하는지 확인합니다.

## 컴포넌트 추가 {id="add-more-components"}

### 비디오 플레이어 컴포넌트 추출 {id="extract-the-video-player-component"}

이제 현재 플레이스홀더 이미지로 되어 있는 비디오 플레이어를 독립된 컴포넌트로 분리할 수 있습니다. 비디오 플레이어는 발표 제목, 발표자, 비디오 링크를 알아야 합니다. 이 정보는 이미 각 `Video` 객체에 포함되어 있으므로, 이를 prop으로 전달하여 해당 속성에 접근할 수 있습니다.

1. 새 `VideoPlayer.kt` 파일을 만들고 `VideoPlayer` 컴포넌트에 대한 다음 구현을 추가합니다:

   ```kotlin
   import csstype.*
   import react.*
   import emotion.react.css
   import react.dom.html.ReactHTML.button
   import react.dom.html.ReactHTML.div
   import react.dom.html.ReactHTML.h3
   import react.dom.html.ReactHTML.img
   
   external interface VideoPlayerProps : Props {
       var video: Video
   }
   
   val VideoPlayer = FC<VideoPlayerProps> { props ->
       div {
           css {
               position = Position.absolute
               top = 10.px
               right = 10.px
           }
           h3 {
               +"${props.video.speaker}: ${props.video.title}"
           }
           img {
               src = "https://via.placeholder.com/640x360.png?text=Video+Player+Placeholder"              
           }
       }
   }
   ```

2. `VideoPlayerProps` 인터페이스가 `VideoPlayer` 컴포넌트에 널을 허용하지 않는 `Video`를 요구하므로, `App` 컴포넌트에서 이를 적절히 처리해야 합니다.

   `App.kt`에서 비디오 플레이어에 해당하는 이전 `div` 스니펫을 다음으로 교체합니다:

   ```kotlin
   currentVideo?.let { curr ->
       VideoPlayer {
           video = curr
       }
   }
   ```

   [`let` 스코프 함수](scope-functions.md#let)를 사용하면 `state.currentVideo`가 null이 아닐 때만 `VideoPlayer` 컴포넌트가 추가되도록 보장할 수 있습니다.

이제 목록에서 항목을 클릭하면 비디오 플레이어가 나타나고 클릭한 항목의 정보로 채워집니다.

### 버튼 추가 및 연결 {id="add-a-button-and-wire-it"}

사용자가 비디오를 시청함 또는 시청하지 않음으로 표시하고 두 목록 사이를 이동할 수 있도록 `VideoPlayer` 컴포넌트에 버튼을 추가합니다.

이 버튼은 두 개의 서로 다른 목록 간에 비디오를 이동시키므로, 상태 변경을 처리하는 로직을 `VideoPlayer` 외부로 _끌어올려_ 부모로부터 prop으로 전달받아야 합니다. 또한 비디오의 시청 여부에 따라 버튼의 모양이 달라져야 하므로 이 정보 역시 prop으로 전달해야 합니다.

1. `VideoPlayer.kt`의 `VideoPlayerProps` 인터페이스를 확장하여 두 가지 경우에 대한 속성을 포함합니다:

   ```kotlin
   external interface VideoPlayerProps : Props {
       var video: Video
       var onWatchedButtonPressed: (Video) -> Unit
       var unwatchedVideo: Boolean
   }
   ```

2. 이제 실제 컴포넌트에 버튼을 추가할 수 있습니다. `VideoPlayer` 컴포넌트 본문의 `h3`과 `img` 태그 사이에 다음 스니펫을 복사합니다:

   ```kotlin
   button {
       css {
           display = Display.block
           backgroundColor = if (props.unwatchedVideo) NamedColor.lightgreen else NamedColor.red
       }
       onClick = {
           props.onWatchedButtonPressed(props.video)
       }
       if (props.unwatchedVideo) {
           +"Mark as watched"
       } else {
           +"Mark as unwatched"
       }
   }
   ```

   스타일을 동적으로 변경할 수 있는 Kotlin CSS DSL의 도움을 받아 기본적인 Kotlin `if` 표현식을 사용하여 버튼의 색상을 변경할 수 있습니다.

### 비디오 목록을 애플리케이션 상태로 이동 {id="move-video-lists-to-the-application-state"}

이제 `App` 컴포넌트에서 `VideoPlayer`를 사용하는 부분을 수정할 차례입니다. 버튼을 클릭하면 비디오가 시청하지 않은 목록에서 시청한 목록으로, 또는 그 반대로 이동해야 합니다. 이러한 목록은 이제 실제로 변경될 수 있으므로 애플리케이션 상태로 옮깁니다:

1. `App.kt`에서 `App` 컴포넌트 맨 위에 `useState()` 호출을 포함하는 다음 속성들을 추가합니다:

   ```kotlin
   val App = FC<Props> {
       var currentVideo: Video? by useState(null)
       var unwatchedVideos: List<Video> by useState(listOf(
           Video(1, "Opening Keynote", "Andrey Breslav", "https://youtu.be/PsaFVLr8t4E"),
           Video(2, "Dissecting the stdlib", "Huyen Tue Dao", "https://youtu.be/Fzt_9I733Yg"),
           Video(3, "Kotlin and Spring Boot", "Nicolas Frankel", "https://youtu.be/pSiZVAeReeg")
       ))
       var watchedVideos: List<Video> by useState(listOf(
           Video(4, "Creating Internal DSLs in Kotlin", "Venkat Subramaniam", "https://youtu.be/JzTeAM8N1-o")
       ))

       // . . .
   }
   ```

2. 모든 데모 데이터가 `watchedVideos`와 `unwatchedVideos`의 기본값에 직접 포함되었으므로 파일 수준의 선언은 더 이상 필요하지 않습니다. `Main.kt`에서 `watchedVideos`와 `unwatchedVideos` 선언을 삭제합니다.
3. `App` 컴포넌트에서 비디오 플레이어를 호출하는 부분을 다음과 같이 변경합니다:

   ```kotlin
   VideoPlayer {
       video = curr
       unwatchedVideo = curr in unwatchedVideos
       onWatchedButtonPressed = {
           if (video in unwatchedVideos) {
               unwatchedVideos = unwatchedVideos - video
               watchedVideos = watchedVideos + video
           } else {
               watchedVideos = watchedVideos - video
               unwatchedVideos = unwatchedVideos + video
           }
       }
   }
   ```

브라우저로 돌아가서 비디오를 선택한 다음 버튼을 몇 번 눌러봅니다. 비디오가 두 목록 사이를 이동하게 됩니다.

## npm 패키지 사용하기 {id="use-packages-from-npm"}

앱을 제대로 사용하려면 실제로 동영상을 재생할 수 있는 비디오 플레이어와 사람들이 콘텐츠를 공유할 수 있는 버튼이 필요합니다.

React에는 이러한 기능을 직접 구현하지 않고도 사용할 수 있는 풍부한 생태계와 미리 만들어진 컴포넌트가 많이 있습니다.

### 비디오 플레이어 컴포넌트 추가 {id="add-the-video-player-component"}

플레이스홀더 비디오 컴포넌트를 실제 YouTube 플레이어로 교체하기 위해 npm의 `react-player` 패키지를 사용합니다. 이 패키지는 비디오를 재생할 수 있고 플레이어의 외형을 제어할 수 있게 해줍니다.

컴포넌트 문서와 API 설명은 GitHub의 [README](https://www.npmjs.com/package/react-player)를 참조하세요.

1. `build.gradle.kts` 파일을 확인합니다. `react-player` 패키지가 이미 포함되어 있어야 합니다:

   ```kotlin
   dependencies {
       // ...
       // Video Player
       implementation(npm("react-player", "^2.12.0"))
       // ...
   }
   ```

   보시다시피, 빌드 파일의 `dependencies` 블록에서 `npm()` 함수를 사용하여 Kotlin/JS 프로젝트에 npm 의존성을 추가할 수 있습니다. 그러면 Gradle 플러그인이 자동으로 해당 의존성을 다운로드하고 설치합니다. 이를 위해 자체적으로 번들링된 [Yarn](https://yarnpkg.com/) 패키지 관리자 설치본을 사용합니다.

2. React 애플리케이션 내부에서 이 JavaScript 패키지를 사용하려면, [외부 선언(external declarations)](js-interop.md)을 제공하여 Kotlin 컴파일러에 무엇을 예상해야 하는지 알려주어야 합니다.

   새 `ReactYouTube.kt` 파일을 만들고 다음 내용을 추가합니다:

   ```kotlin
   @file:JsModule("react-player")
   @file:JsNonModule
   
   import react.*
   
   @JsName("default")
   external val ReactPlayer: ComponentClass<dynamic>
   ```

   컴파일러가 `ReactPlayer`와 같은 외부 선언을 보면, 해당 클래스의 구현이 의존성에 의해 제공된다고 가정하고 코드를 생성하지 않습니다.

   마지막 두 줄은 JavaScript의 `require("react-player").default;` 임포트와 동일합니다. 이는 런타임에 컴포넌트가 `ComponentClass<dynamic>`을 준수할 것임을 컴파일러에 확신시키는 역할을 합니다.

하지만 이 구성에서는 `ReactPlayer`가 허용하는 props의 제네릭 타입이 `dynamic`으로 설정되어 있습니다. 즉, 컴파일러가 모든 코드를 허용하므로 런타임에 오류가 발생할 위험이 있습니다.

더 나은 대안은 이 외부 컴포넌트의 props에 속하는 프로퍼티 종류를 지정하는 `external interface`를 만드는 것입니다. 컴포넌트의 [README](https://www.npmjs.com/package/react-player)에서 props 인터페이스에 대해 알아볼 수 있습니다. 이 경우 `url` 및 `controls` prop을 사용합니다:

1. `ReactYouTube.kt`의 내용을 수정하여 `dynamic`을 외부 인터페이스로 대체합니다:

   ```kotlin
   @file:JsModule("react-player")
   @file:JsNonModule
   
   import react.*
   
   @JsName("default")
   external val ReactPlayer: ComponentClass<ReactPlayerProps>
   
   external interface ReactPlayerProps : Props {
       var url: String
       var controls: Boolean
   }
   ```

2. 이제 새로운 `ReactPlayer`를 사용하여 `VideoPlayer` 컴포넌트의 회색 플레이스홀더 직사각형을 대체할 수 있습니다. `VideoPlayer.kt`에서 `img` 태그를 다음 스니펫으로 바꿉니다:

   ```kotlin
   ReactPlayer {
       url = props.video.videoUrl
       controls = true
   }
   ```

### 소셜 공유 버튼 추가 {id="add-social-share-buttons"}

애플리케이션의 콘텐츠를 공유하는 쉬운 방법은 메신저 및 이메일용 소셜 공유 버튼을 제공하는 것입니다. 이를 위해 [react-share](https://github.com/nygardk/react-share/blob/master/README.md)와 같은 기성 React 컴포넌트를 활용할 수도 있습니다:

1. `build.gradle.kts` 파일을 확인합니다. 이 npm 라이브러리가 이미 포함되어 있어야 합니다:

   ```kotlin
   dependencies {
       // ...
       // Share Buttons
       implementation(npm("react-share", "^4.4.1"))
       // ...
   }
   ```

2. Kotlin에서 `react-share`를 사용하려면 기본적인 외부 선언을 추가로 작성해야 합니다. [GitHub 예제](https://github.com/nygardk/react-share/blob/master/demo/Demo.tsx#L61)를 보면 공유 버튼이 두 개의 React 컴포넌트(예: `EmailShareButton`과 `EmailIcon`)로 구성되어 있음을 알 수 있습니다. 다양한 유형의 공유 버튼과 아이콘은 모두 동일한 종류의 인터페이스를 갖습니다.
   비디오 플레이어에서 했던 것과 같은 방식으로 각 컴포넌트에 대한 외부 선언을 만듭니다.

   새 `ReactShare.kt` 파일에 다음 코드를 추가합니다:

   ```kotlin
   @file:JsModule("react-share")
   @file:JsNonModule
   
   import react.ComponentClass
   import react.Props
   
   @JsName("EmailIcon")
   external val EmailIcon: ComponentClass<IconProps>
   
   @JsName("EmailShareButton")
   external val EmailShareButton: ComponentClass<ShareButtonProps>
   
   @JsName("TelegramIcon")
   external val TelegramIcon: ComponentClass<IconProps>
   
   @JsName("TelegramShareButton")
   external val TelegramShareButton: ComponentClass<ShareButtonProps>
   
   external interface ShareButtonProps : Props {
       var url: String
   }
   
   external interface IconProps : Props {
       var size: Int
       var round: Boolean
   }
   ```

3. 애플리케이션의 사용자 인터페이스에 새 컴포넌트를 추가합니다. `VideoPlayer.kt`에서 `ReactPlayer` 사용 바로 위에 있는 `div`에 두 개의 공유 버튼을 추가합니다:

   ```kotlin
   // . . .

   div {
       css {
            position = Position.absolute
            top = 10.px
            right = 10.px
        }
       EmailShareButton {
           url = props.video.videoUrl
           EmailIcon {
               size = 32
               round = true
           }
       }
       TelegramShareButton {
           url = props.video.videoUrl
           TelegramIcon {
               size = 32
               round = true
           }
       }
   }

   // . . .
   ```

이제 브라우저를 확인하고 버튼이 제대로 작동하는지 살펴봅니다. 버튼을 클릭하면 비디오 URL이 포함된 _공유 창_이 나타나야 합니다. 버튼이 표시되지 않거나 작동하지 않는 경우 광고 및 소셜 미디어 차단 프로그램을 비활성화해야 할 수 있습니다.

![공유 창](social-buttons.png){width=700}

[react-share](https://github.com/nygardk/react-share/blob/master/README.md#features)에서 지원하는 다른 소셜 네트워크의 공유 버튼으로 이 단계를 자유롭게 반복해 보세요.

## 외부 REST API 사용하기 {id="use-an-external-rest-api"}

이제 앱에서 하드코딩된 데모 데이터를 REST API의 실제 데이터로 교체할 수 있습니다.

이 튜토리얼을 위해 [작은 API](https://my-json-server.typicode.com/kotlin-hands-on/kotlinconf-json/videos/1)가 준비되어 있습니다. 이 API는 단일 엔드포인트인 `videos`만 제공하며, 목록의 요소에 접근하기 위해 숫자 파라미터를 받습니다. 브라우저로 API에 접속해 보면 반환되는 객체가 `Video` 객체와 동일한 구조를 가지고 있음을 확인할 수 있습니다.

### Kotlin에서 JS 기능 사용하기 {id="use-js-functionality-from-kotlin"}

브라우저에는 이미 다양한 [웹 API(Web APIs)](https://developer.mozilla.org/en-US/docs/Web/API)가 내장되어 있습니다. Kotlin/JS에는 이러한 API에 대한 래퍼가 기본적으로 포함되어 있으므로 Kotlin/JS에서도 사용할 수 있습니다. 대표적인 예로 HTTP 요청을 생성하는 데 사용되는 [fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)가 있습니다.

첫 번째 잠재적 문제는 `fetch()`와 같은 브라우저 API가 논블로킹(non-blocking) 작업을 수행하기 위해 [콜백(callbacks)](https://developer.mozilla.org/en-US/docs/Glossary/Callback_function)을 사용한다는 점입니다. 여러 콜백을 연속해서 실행해야 하는 경우 콜백이 중첩되어야 합니다. 자연스럽게 코드가 심하게 들여쓰기되고 점점 더 많은 기능이 서로 중첩되어 가독성이 떨어집니다.

이를 해결하기 위해 이러한 기능에 더 나은 접근 방식인 Kotlin의 코루틴(coroutines)을 사용할 수 있습니다.

두 번째 문제는 JavaScript의 동적 타입 특성에서 발생합니다. 외부 API에서 반환되는 데이터의 타입에 대한 보장이 없습니다. 이를 해결하기 위해 `kotlinx.serialization` 라이브러리를 사용할 수 있습니다.

`build.gradle.kts` 파일을 확인합니다. 관련 스니펫이 이미 존재해야 합니다:

```kotlin
dependencies {
    // . . .

    // Coroutines & serialization
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.6.4")
}
```

### 직렬화(Serialization) 추가 {id="add-serialization"}

외부 API를 호출하면 JSON 형식의 텍스트가 반환되며, 이를 작업 가능한 Kotlin 객체로 변환해야 합니다.

[`kotlinx.serialization`](https://github.com/Kotlin/kotlinx.serialization)은 JSON 문자열에서 Kotlin 객체로 이러한 유형의 변환을 작성할 수 있게 해주는 라이브러리입니다.

1. `build.gradle.kts` 파일을 확인합니다. 해당하는 스니펫이 이미 존재해야 합니다:

   ```kotlin
   plugins {
       // . . .
       kotlin("plugin.serialization") version "%kotlinVersion%"
   }
   
   dependencies {
       // . . .

       // Serialization
       implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.5.0")
   }
   ```

2. 첫 번째 비디오를 가져오기 위한 준비 작업으로 직렬화 라이브러리에 `Video` 클래스를 알려야 합니다. `Main.kt`에서 해당 클래스 정의에 `@Serializable` 어노테이션을 추가합니다:

   ```kotlin
   @Serializable
   data class Video(
       val id: Int,
       val title: String,
       val speaker: String,
       val videoUrl: String
   )
   ```

### 비디오 가져오기 (Fetch) {id="fetch-videos"}

API에서 비디오를 가져오려면 `App.kt`(또는 새 파일)에 다음 함수를 추가합니다:

```kotlin
suspend fun fetchVideo(id: Int): Video {
    val response = window
        .fetch("https://my-json-server.typicode.com/kotlin-hands-on/kotlinconf-json/videos/$id")
        .await()
        .text()
        .await()
    return Json.decodeFromString(response)
}
```

* _중단 함수(suspending function)_ `fetch()`는 API에서 지정된 `id`의 비디오를 가져옵니다. 이 응답은 시간이 걸릴 수 있으므로 결과를 `await()`합니다. 다음으로 콜백을 사용하는 `text()`가 응답에서 본문을 읽습니다. 그런 다음 완료될 때까지 `await()`합니다.
* 함수의 값을 반환하기 전에 `kotlinx.coroutines`의 함수인 `Json.decodeFromString`에 전달합니다. 이 함수는 요청에서 받은 JSON 텍스트를 적절한 필드를 가진 Kotlin 객체로 변환합니다.
* `window.fetch` 함수 호출은 `Promise` 객체를 반환합니다. 일반적으로 `Promise`가 처리(resolved)되어 결과를 사용할 수 있을 때 호출되는 콜백 핸들러를 정의해야 합니다. 그러나 코루틴을 사용하면 이러한 프로미스를 `await()`할 수 있습니다. `await()`와 같은 함수가 호출될 때마다 메서드는 실행을 중단(suspend)합니다. `Promise`가 처리되면 실행이 다시 재개됩니다.

사용자에게 다양한 비디오를 제공하기 위해 위와 동일한 API에서 25개의 비디오를 가져오는 `fetchVideos()` 함수를 정의합니다. 모든 요청을 동시에 실행하려면 Kotlin 코루틴에서 제공하는 [`async`](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/async.html) 기능을 사용합니다:

1. `App.kt`에 다음 구현을 추가합니다:

   ```kotlin
   suspend fun fetchVideos(): List<Video> = coroutineScope {
       (1..25).map { id ->
           async {
               fetchVideo(id)
           }
       }.awaitAll()
   }
   ```

   [구조적 동시성(structured concurrency)](https://kotlinlang.org/docs/coroutines-basics.html#structured-concurrency) 원칙에 따라 구현이 `coroutineScope`로 감싸져 있습니다. 그런 다음 25개의 비동기 태스크(요청당 하나)를 시작하고 모든 태스크가 완료될 때까지 기다릴 수 있습니다.

2. 이제 애플리케이션에 데이터를 추가할 수 있습니다. `mainScope`에 대한 정의를 추가하고, `App` 컴포넌트가 다음 스니펫으로 시작하도록 변경합니다. 데모 값을 `emptyList()` 인스턴스로 교체하는 것도 잊지 마세요:

   ```kotlin
   val mainScope = MainScope()
   
   val App = FC<Props> {
       var currentVideo: Video? by useState(null)
       var unwatchedVideos: List<Video> by useState(emptyList())
       var watchedVideos: List<Video> by useState(emptyList())
   
       useEffectOnce {
           mainScope.launch {
               unwatchedVideos = fetchVideos()
           }
       }

   // . . .
   ```
   {validate="false"}

   * [`MainScope()`](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-main-scope.html)는 Kotlin의 구조적 동시성 모델의 일부이며 비동기 태스크가 실행될 범위를 생성합니다.
   * `useEffectOnce`는 또 다른 React _훅_([useEffect](https://reactjs.org/docs/hooks-effect.html) 훅의 단순화된 버전)입니다. 컴포넌트가 _사이드 이펙트(side effect)_를 수행함을 나타냅니다. 단순히 스스로를 렌더링하는 데 그치지 않고 네트워크를 통한 통신도 수행합니다.

브라우저를 확인하세요. 애플리케이션에 실제 데이터가 표시되어야 합니다:

![API에서 가져온 데이터](website-api-data.png){width=700}

페이지가 로드될 때:

* `App` 컴포넌트의 코드가 호출됩니다. 그러면 `useEffectOnce` 블록의 코드가 시작됩니다.
* `App` 컴포넌트는 시청한 비디오와 시청하지 않은 비디오의 빈 리스트와 함께 렌더링됩니다.
* API 요청이 완료되면 `useEffectOnce` 블록이 이를 `App` 컴포넌트의 상태에 할당합니다. 이로 인해 다시 렌더링(re-render)이 트리거됩니다.
* `App` 컴포넌트의 코드가 다시 호출되지만, `useEffectOnce` 블록은 두 번 다시 실행되지 _않습니다_.

코루틴의 동작 원리를 심도 있게 이해하고 싶다면 [코루틴 튜토리얼](coroutines-and-channels.md)을 확인하세요.

## 프로덕션 환경 및 클라우드 배포 {id="deploy-to-production-and-the-cloud"}

이제 애플리케이션을 클라우드에 게시하여 다른 사람들이 접근할 수 있도록 할 차례입니다.

### 프로덕션 빌드 패키징 {id="package-a-production-build"}

프로덕션 모드로 모든 에셋을 패키징하려면 IntelliJ IDEA의 도구 창을 통하거나 `./gradlew build`를 실행하여 Gradle의 `build` 태스크를 실행합니다. 그러면 DCE(데드 코드 제거, dead code elimination)와 같은 다양한 개선 사항이 적용된 최적화된 프로젝트 빌드가 생성됩니다.

빌드가 완료되면 `/build/dist`에서 배포에 필요한 모든 파일을 찾을 수 있습니다. 여기에는 애플리케이션을 실행하는 데 필요한 JavaScript 파일, HTML 파일 및 기타 리소스가 포함됩니다. 이 파일들을 정적 HTTP 서버에 올리거나, GitHub Pages를 사용하여 서비스하거나, 원하는 클라우드 서비스 제공업체에 호스팅할 수 있습니다.

### Heroku에 배포 {id="deploy-to-heroku"}

Heroku를 사용하면 자체 도메인으로 접속할 수 있는 애플리케이션을 매우 간단하게 띄울 수 있습니다. 개발 목적에는 무료 티어로도 충분합니다.

1. [계정을 생성합니다](https://signup.heroku.com/).
2. [CLI 클라이언트를 설치하고 인증합니다](https://devcenter.heroku.com/articles/heroku-cli).
3. 프로젝트 루트 경로의 터미널에서 다음 명령어를 실행하여 Git 저장소를 만들고 Heroku 앱을 연결합니다:

   ```bash
   git init
   heroku create
   git add .
   git commit -m "initial commit"
   ```

4. Heroku에서 실행되는 일반적인 JVM 애플리케이션(예: Ktor 또는 Spring Boot로 작성된 앱)과 달리, 이 앱은 정적 HTML 페이지와 JavaScript 파일을 생성하므로 그에 맞게 제공되어야 합니다. 프로그램을 올바르게 서비스할 수 있도록 필요한 빌드팩을 설정합니다:

   ```bash
   heroku buildpacks:set heroku/gradle
   heroku buildpacks:add https://github.com/heroku/heroku-buildpack-static.git
   ```

5. `heroku/gradle` 빌드팩이 제대로 실행되려면 `build.gradle.kts` 파일에 `stage` 태스크가 있어야 합니다. 이 태스크는 `build` 태스크와 동일하며, 파일 하단에 해당 별칭(alias)이 이미 포함되어 있습니다:

   ```kotlin
   // Heroku Deployment
   tasks.register("stage") {
       dependsOn("build")
   }
   ```

6. 프로젝트 루트에 새 `static.json` 파일을 추가하여 `buildpack-static`을 구성합니다.
7. 파일 내부에 `root` 속성을 추가합니다:

   ```xml
   {
       "root": "build/distributions"
   }
   ```
   {validate="false"}

8. 이제 다음 명령어를 실행하여 배포를 트리거할 수 있습니다:

   ```bash
   git add -A
   git commit -m "add stage task and static content root configuration"
   git push heroku master
   ```

> `main`이 아닌 다른 브랜치에서 푸시하는 경우, 예를 들어 `git push heroku feature-branch:main`과 같이 `main` 리모트로 푸시하도록 명령어를 조정하세요.
>
{style="tip"}

배포가 성공하면 사용자가 인터넷에서 애플리케이션에 접근할 수 있는 URL이 표시됩니다.

![프로덕션으로 웹 앱 배포](deployment-to-production.png){width=700}

> 이 단계의 프로젝트 상태는 [여기](https://github.com/kotlin-hands-on/web-app-react-kotlin-js-gradle/tree/finished)의 `finished` 브랜치에서 확인할 수 있습니다.
>
{style="note"}

## 다음 단계 {id="what-s-next"}

### 추가 기능 더해보기 {initial-collapse-state="collapsed" collapsible="true" id="add-more-features"}

완성된 앱을 출발점으로 삼아 React, Kotlin/JS 등과 관련된 고급 주제를 더 탐구해 볼 수 있습니다.

* **검색(Search)**: 제목이나 발표자별로 발표 목록을 필터링할 수 있는 검색 필드를 추가해 보세요. [React에서 HTML 폼 요소가 작동하는 방식](https://reactjs.org/docs/forms.html)에 대해 알아보세요.
* **영속성(Persistence)**: 현재 애플리케이션은 페이지가 새로고침될 때마다 시청자의 시청 목록 기록을 잃어버립니다. Kotlin에서 사용할 수 있는 웹 프레임워크(예: [Ktor](https://ktor.io/)) 중 하나를 사용하여 자체 백엔드를 구축해 보세요. 또는 [클라이언트에 정보를 저장하는 방법](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)을 알아보세요.
* **복잡한 API**: 수많은 데이터셋과 API가 제공되고 있습니다. 애플리케이션에 온갖 종류의 데이터를 가져올 수 있습니다. 예를 들어, [고양이 사진](https://thecatapi.com/) 뷰어나 [로열티 프리 스톡 사진 API](https://unsplash.com/developers)를 연동해 볼 수 있습니다.

### 스타일 개선: 반응형 및 그리드 {initial-collapse-state="collapsed" collapsible="true" id="improve-the-style-responsiveness-and-grids"}

애플리케이션 디자인이 아직 매우 단순하여 모바일 기기나 좁은 창에서는 보기 좋지 않을 수 있습니다. 앱의 접근성과 사용성을 높이기 위해 CSS DSL을 더 탐색해 보세요.

### 커뮤니티 참여 및 지원 받기 {initial-collapse-state="collapsed" collapsible="true" id="join-the-community-and-get-help"}

문제를 보고하고 도움을 받는 가장 좋은 방법은 [kotlin-wrappers 이슈 트래커](https://github.com/JetBrains/kotlin-wrappers/issues)를 이용하는 것입니다. 겪고 있는 문제에 대한 이슈 티켓이 없다면 자유롭게 새 티켓을 등록하세요. 공식 [Kotlin Slack](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)에 참여할 수도 있습니다. `#javascript` 및 `#react` 채널이 마련되어 있습니다.

### 코루틴에 대해 더 알아보기 {initial-collapse-state="collapsed" collapsible="true" id="learn-more-about-coroutines"}

동시성 코드를 작성하는 방법에 대해 더 자세히 알고 싶다면 [코루틴 튜토리얼](coroutines-and-channels.md)을 확인하세요.

### React에 대해 더 알아보기 {initial-collapse-state="collapsed" collapsible="true" id="learn-more-about-react"}

이제 기본적인 React 개념과 그것이 Kotlin으로 어떻게 변환되는지 알게 되었으므로, [React 문서](https://react.dev/learn)에 설명된 다른 개념들도 Kotlin으로 변환해 볼 수 있습니다.