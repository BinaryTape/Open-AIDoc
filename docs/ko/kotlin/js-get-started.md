[//]: # (title: Kotlin/JS 시작하기)

이 튜토리얼에서는 Kotlin/JavaScript(Kotlin/JS)를 사용하여 브라우저용 웹 애플리케이션을 만드는 방법을 보여줍니다.
앱을 만들려면 워크플로에 가장 적합한 도구를 선택하세요:

* **[IntelliJ IDEA](#create-your-application-in-intellij-idea)**: 버전 관리 시스템에서 프로젝트 템플릿을 클론하고 IntelliJ IDEA에서 작업합니다.
* **[Gradle 빌드 시스템](#create-your-application-using-gradle)**: 프로젝트의 설정이 내부적으로 어떻게 작동하는지 더 잘 이해하기 위해 프로젝트의 빌드 파일을 수동으로 생성합니다.

> Kotlin/JS를 사용하면 브라우저 외에도 다른 환경을 타겟으로 컴파일할 수 있습니다. 
> 자세한 내용은 [실행 환경(Execution environments)](js-project-setup.md#execution-environments)을 참고하세요.
> 
{style="tip"}

## IntelliJ IDEA에서 애플리케이션 생성 {id="create-your-application-in-intellij-idea"}

Kotlin/JS 웹 애플리케이션을 만들려면 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/)를 사용할 수 있습니다.

### 환경 설정 {id="set-up-the-environment"}

1. 최신 버전의 [IntelliJ IDEA](https://www.jetbrains.com/idea/)를 다운로드하고 설치합니다.
2. [Kotlin 멀티플랫폼 IDE 플러그인](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)을 설치합니다(Kotlin 멀티플랫폼 Gradle 플러그인과 혼동하지 마세요).

### 프로젝트 생성 {id="create-your-project"}

1. IntelliJ IDEA에서 **File** | **New** | **Project from Version Control**을 선택합니다.
2. [Kotlin/JS 템플릿 프로젝트](https://github.com/Kotlin/kmp-js-wizard)의 URL을 입력합니다:

   ```text
   https://github.com/Kotlin/kmp-js-wizard
   ```   
   
3. **Clone**을 클릭합니다.

### 프로젝트 구성 {id="configure-your-project"}

1. `kmp-js-wizard/gradle/libs.versions.toml` 파일을 엽니다. 이 파일에는 프로젝트 의존성에 대한 버전 카탈로그가 포함되어 있습니다. 
2. Kotlin 버전이 Kotlin/JS를 타겟으로 하는 웹 애플리케이션을 만드는 데 필요한 Kotlin 멀티플랫폼 Gradle 플러그인의 버전과 일치하는지 확인합니다:

   ```toml
   [versions]
   kotlin = "%kotlinVersion%"
   
   [plugins]
   kotlin-multiplatform = { id = "org.jetbrains.kotlin.multiplatform", version.ref = "kotlin" }
   ```

3. Gradle 파일을 동기화합니다(`libs.versions.toml` 파일을 업데이트한 경우). 빌드 파일에 나타나는 **Load Gradle Changes** 아이콘을 클릭합니다.

   ![Gradle 변경 사항 로드 버튼](load-gradle-changes.png){width=300}

   또는 Gradle 도구 창에서 새로고침 버튼을 클릭합니다.

멀티플랫폼 프로젝트를 위한 Gradle 구성에 대한 자세한 내용은 [멀티플랫폼 Gradle DSL 레퍼런스](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html)를 참고하세요.

### 애플리케이션 빌드 및 실행 {id="build-and-run-the-application"}

1. `src/jsMain/kotlin/Main.kt` 파일을 엽니다.

   * `src/jsMain/kotlin/` 디렉터리에는 프로젝트의 JavaScript 타겟을 위한 주요 Kotlin 소스 파일이 들어 있습니다.
   * `Main.kt` 파일에는 [`kotlinx.browser`](https://github.com/Kotlin/kotlinx-browser) API를 사용하여 브라우저 페이지에 "Hello, Kotlin/JS!"를 렌더링하는 코드가 포함되어 있습니다.

2. `main()` 함수에 있는 **Run** 아이콘을 클릭하여 코드를 실행합니다.

   ![애플리케이션 실행](js-run-gutter.png){width=500}

웹 애플리케이션이 브라우저에서 자동으로 열립니다.
또는 실행이 완료된 후 브라우저에서 다음 URL을 직접 열 수 있습니다:

```text
   http://localhost:8080/
```

웹 애플리케이션을 확인할 수 있습니다:

![애플리케이션 출력](js-output-gutter-1.png){width=600}

애플리케이션을 처음 실행한 후, IntelliJ IDEA는 상단 바에 해당 실행 구성(**jsMain [js]**)을 생성합니다:

![Gradle 실행 구성](js-run-config.png){width=500}

> IntelliJ IDEA Ultimate 버전에서는
> [JS 디버거(JS Debugger)](https://www.jetbrains.com/help/idea/configuring-javascript-debugger.html)를 사용하여
> IDE에서 직접 코드를 디버깅할 수 있습니다.
> 
> {style="tip"}

### 연속 빌드(Continuous build) 활성화 {id="enable-continuous-build"}

Gradle은 변경 사항이 생길 때마다 프로젝트를 자동으로 다시 빌드할 수 있습니다:

1. 실행 구성 목록에서 **jsMain [js]**를 선택하고 **More Actions** | **Edit**을 클릭합니다.

    ![Gradle 실행 구성 편집](js-edit-run-config.png){width=500}

2. **Run/Debug Configurations** 대화 상자의 **Run** 필드에 `jsBrowserDevelopmentRun --continuous`를 입력합니다.

    ![연속 실행 구성](js-continuous-run-config.png){width=500}

3. **OK**를 클릭합니다.

이제 애플리케이션을 실행하고 변경 사항을 만들면, Gradle은 프로젝트에 대해 증분 빌드(incremental builds)를 자동으로 수행하며 파일을 저장(<shortcut>Ctrl + S</shortcut>/<shortcut>Cmd + S</shortcut>)하거나 클래스 파일을 변경할 때마다 브라우저를 핫 리로드(hot-reload)합니다. 

### 애플리케이션 수정 {id="modify-the-application"}

단어의 글자 수를 세는 기능을 추가하도록 애플리케이션을 수정해 보겠습니다.

#### input 요소 추가 {id="add-an-input-element"}

1. `src/jsMain/kotlin/Main.kt` 파일에서, 사용자 입력을 읽기 위해 [확장 함수(extension function)](extensions.md#extension-functions)를 통해 [HTML input 요소](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input)를 추가합니다:

   ```kotlin
   // Element.appendMessage() 함수를 대체합니다
   fun Element.appendInput() {
       val input = document.createElement("input")
       appendChild(input)
   }
   ```

2. `main()`에서 `appendInput()` 함수를 호출합니다. 그러면 페이지에 input 요소가 표시됩니다:

   ```kotlin
   fun main() {
       // document.body!!.appendMessage(message)를 대체합니다
       document.body?.appendInput()
   }
   ```

3. [애플리케이션을 다시 실행합니다](#build-and-run-the-application).

    애플리케이션은 다음과 같이 보입니다:

   ![input 요소가 추가된 애플리케이션](js-added-input-element.png){width=600}

#### 입력 이벤트 핸들링 추가 {id="add-an-input-event-handling"}

1. `appendInput()` 함수 내부에 리스너를 추가하여 입력 값을 읽고 변경 사항에 반응하도록 합니다:

    ```kotlin
   // 현재의 appendInput() 함수를 대체합니다
    fun Element.appendInput(onChange: (String) -> Unit = {}) {
        val input = document.createElement("input").apply {
            addEventListener("change") { event ->
                onChange(event.target.unsafeCast<HTMLInputElement>().value)
            }
        }
        appendChild(input)
    }
    ```

2. IDE의 제안에 따라 `HTMLInputElement` 의존성을 임포트합니다.

   ![의존성 임포트](js-import-dependency.png){width=600}

3. `main()`에서 `onChange` 콜백을 호출합니다. 이 콜백은 입력 값을 읽고 처리합니다:

    ```kotlin
    fun main() {
        // document.body?.appendInput()을 대체합니다
        document.body?.appendInput(onChange = { println(it) })
    }
   ```

#### 출력 요소 추가 {id="add-an-output-element"}

1. 단락(paragraph)을 생성하는 [확장 함수](extensions.md#extension-functions)를 정의하여 출력을 표시할 텍스트 요소를 추가합니다:

   ```kotlin
    fun Element.appendTextContainer(): Element {
        return document.createElement("p").also(::appendChild)
    }
   ```
   
2. `main()`에서 `appendTextContainer()` 함수를 호출합니다. 출력을 위한 요소가 생성됩니다:

   ```kotlin
    fun main() {
        // 출력을 위한 텍스트 컨테이너를 생성합니다
        // val message = Message(topic = "Kotlin/JS", content = "Hello!")를 대체합니다
        val output = document.body?.appendTextContainer()
   
        // 입력 값을 읽습니다
        document.body?.appendInput(onChange = { println(it) })
    }
   ```
   
#### 입력을 처리하여 글자 수 세기 {id="process-the-input-to-count-the-letters"}

공백을 제거하고 글자 수와 함께 출력을 표시하도록 입력을 처리합니다.

`main()` 함수 내의 `appendInput()` 호출 부분에 다음 코드를 추가합니다:

```kotlin
fun main() {
    // 출력을 위한 텍스트 컨테이너를 생성합니다
    val output = document.body?.appendTextContainer()

    // 입력 값을 읽습니다
    // 현재의 appendInput() 함수 호출을 대체합니다
    document.body?.appendInput(onChange = { name ->
        name.replace(" ", "").let {
            output?.textContent = "Your name contains ${it.length} letters"
        }
    })
}
```

위의 코드 설명:

* [`replace()` 함수](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/replace.html)는 이름에서 공백을 제거합니다.
* [`let{}` 범위 함수(scope function)](scope-functions.md#let)는 객체 컨텍스트 내에서 함수를 실행합니다.
* [문자열 템플릿(string template)](strings.md#string-templates) (`${it.length}`)은 달러 기호($)를 접두사로 붙이고 중괄호(`{}`)로 감싸서 문자열 내에 단어의 길이를 삽입합니다. 여기서 `it`은 [람다 파라미터(lambda parameter)](coding-conventions.md#lambda-parameters)의 기본 이름입니다.

#### 애플리케이션 실행 {id="run-the-application"}

1. [애플리케이션을 실행합니다](#build-and-run-the-application).
2. 이름을 입력합니다.
3. <shortcut>Enter</shortcut>를 누릅니다. 

결과를 확인할 수 있습니다:

![애플리케이션 출력](js-output-gutter-2.png){width=600}

#### 입력을 처리하여 중복되지 않는 글자 수 세기 {id="process-the-input-to-count-unique-letters"}

추가 연습으로, 입력을 처리하여 단어에서 중복되지 않는(unique) 글자의 수를 계산하고 표시해 보겠습니다:

1. `src/jsMain/kotlin/Main.kt` 파일에서 `String`에 대한 `.countDistinctCharacters()` [확장 함수](extensions.md#extension-functions)를 추가합니다:

   ```kotlin
   fun String.countDistinctCharacters() = lowercase().toList().distinct().count()
   ```

   위의 코드 설명:

   * [`.lowercase()` 함수](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/lowercase.html)는 이름을 소문자로 변환합니다.
   * [`toList()` 함수](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/to-list.html)는 입력 문자열을 문자 리스트로 변환합니다.
   * [`distinct()` 함수](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/distinct.html)는 단어에서 중복되지 않는 문자들만 선택합니다.
   * [`count()` 함수](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/count.html)는 중복되지 않는 문자의 개수를 셉니다.

2. `main()`에서 `.countDistinctCharacters()` 함수를 호출합니다. 이름에서 중복되지 않는 글자 수를 셉니다:

   ```kotlin
    fun main() {
        // 출력을 위한 텍스트 컨테이너를 생성합니다
        val output = document.body?.appendTextContainer()
   
        // 입력 값을 읽습니다
        document.body?.appendInput(onChange = { name ->
            name.replace(" ", "").let {
                // 중복되지 않는 글자 수를 출력합니다
                // output?.textContent = "Your name contains ${it.length} letters"를 대체합니다
                output?.textContent = "Your name contains ${it.countDistinctCharacters()} unique letters"
            }
        })
   }
   ```

3. [애플리케이션을 실행하고 이름을 입력하는 단계](#run-the-application)를 따릅니다.

결과를 확인할 수 있습니다:

![애플리케이션 출력](js-output-gutter-3.png){width=600}

## Gradle을 사용하여 애플리케이션 생성 {id="create-your-application-using-gradle"}

이 섹션에서는 [Gradle](https://gradle.org)을 사용하여 Kotlin/JS 애플리케이션을 수동으로 만드는 방법을 배울 수 있습니다.

Gradle은 Kotlin/JS 및 Kotlin 멀티플랫폼 프로젝트의 기본 빌드 시스템입니다.
또한 Java, Android 및 기타 생태계에서도 흔히 사용됩니다.

### 프로젝트 파일 생성 {id="create-project-files"}

1. Kotlin Gradle 플러그인(KGP)과 호환되는 Gradle 버전을 사용하고 있는지 확인하세요. 자세한 내용은 [호환성 테이블](gradle-configure-project.md#apply-the-plugin)을 참고하세요.
2. 파일 탐색기, 커맨드 라인 또는 선호하는 도구를 사용하여 프로젝트를 위한 빈 디렉터리를 만듭니다. 
3. 프로젝트 디렉터리 안에 다음 내용으로 `build.gradle.kts` 파일을 생성합니다:

   <tabs group="build-script">
   <tab title="Kotlin" group-key="kotlin">

   ```kotlin
   // build.gradle.kts
   plugins {
       kotlin("multiplatform") version "%kotlinVersion%"
   }

   repositories {
       mavenCentral()
   }

   kotlin {
       js {
           // 브라우저에서 실행하려면 browser()를, Node.js에서 실행하려면 nodejs()를 사용하세요
           browser() 
           binaries.executable()
       }
   }
   ```

   </tab>
   <tab title="Groovy" group-key="groovy">

   ```groovy
   // build.gradle
   plugins {
       id 'org.jetbrains.kotlin.multiplatform' version '%kotlinVersion%'
   }

   repositories {
       mavenCentral()
   }

   kotlin {
       js {
           // 브라우저에서 실행하려면 browser()를, Node.js에서 실행하려면 nodejs()를 사용하세요
           browser() 
           binaries.executable()
       }
   }
   ```

   </tab>
   </tabs>

   > `browser()` 또는 `nodejs()`와 같은 다양한 [실행 환경](js-project-setup.md#execution-environments)을 사용할 수 있습니다. 
   > 각 환경은 코드가 실행되는 위치를 정의하고 Gradle이 프로젝트에서 태스크 이름을 생성하는 방식을 결정합니다.
   >
   > {style="note"}

4. 프로젝트 디렉터리 안에 빈 `settings.gradle.kts` 파일을 생성합니다.
5. 프로젝트 디렉터리 안에 `src/jsMain/kotlin` 디렉터리를 생성합니다.
6. `src/jsMain/kotlin` 디렉터리 안에 다음 내용으로 `hello.kt` 파일을 추가합니다:

   ```kotlin
   fun main() {
       println("Hello, Kotlin/JS!")
   }
   ```

   관례에 따라 모든 소스는 `src/<target name>[Main|Test]/kotlin` 디렉터리에 위치합니다: 
   * `Main`은 소스 코드가 위치하는 곳입니다.
   * `Test`는 테스트가 위치하는 곳입니다. 
   * `<target name>`은 타겟 플랫폼에 해당합니다(이 경우 `js`).

**`browser` 환경인 경우**

> `browser` 환경에서 작업하는 경우 다음 단계를 따르세요. 
> `nodejs` 환경에서 작업하는 경우 [프로젝트 빌드 및 실행](#build-and-run-the-project) 섹션으로 이동하세요.
> 
> {style="note"}

1. 프로젝트 디렉터리 안에 `src/jsMain/resources` 디렉터리를 생성합니다.
2. `src/jsMain/resources` 디렉터리 안에 다음 내용으로 `index.html` 파일을 생성합니다:

   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <title>Application title</title>
   </head>
   <body>
       <script src="$NAME_OF_YOUR_PROJECT_DIRECTORY.js"></script>
   </body>
   </html>
   ```

3. `<$NAME_OF_YOUR_PROJECT_DIRECTORY>` 플레이스홀더를 프로젝트 디렉터리의 이름으로 바꿉니다.

### 프로젝트 빌드 및 실행 {id="build-and-run-the-project"}

프로젝트를 빌드하려면 루트 프로젝트 디렉터리에서 다음 명령을 실행합니다:

```bash
# 브라우저의 경우
gradle jsBrowserDevelopmentRun

# 또는

# Node.js의 경우
gradle jsNodeDevelopmentRun 
```

`browser` 환경을 사용 중이라면 브라우저가 `index.html` 파일을 열고 브라우저 콘솔에 `"Hello, Kotlin/JS!"`를 출력하는 것을 볼 수 있습니다.
콘솔은 <shortcut>Ctrl + Shift + J</shortcut>/<shortcut>Cmd + Option + J</shortcut> 명령어로 열 수 있습니다.

![애플리케이션 출력](js-output-gutter-4.png){width=600}

`nodejs` 환경을 사용 중이라면 터미널에 `"Hello, Kotlin/JS!"`가 출력되는 것을 볼 수 있습니다.

![애플리케이션 출력](js-output-gutter-5.png){width=500}

### IDE에서 프로젝트 열기 {id="open-the-project-in-an-ide"}

Gradle을 지원하는 모든 IDE에서 프로젝트를 열 수 있습니다. 

IntelliJ IDEA를 사용하는 경우:

1. **File** | **Open**을 선택합니다.
2. 프로젝트 디렉터리를 찾습니다.
3. **Open**을 클릭합니다.

IntelliJ IDEA는 해당 프로젝트가 Kotlin/JS 프로젝트인지 자동으로 감지합니다.
프로젝트에 문제가 발생하면 IntelliJ IDEA는 **Build** 창에 오류 메시지를 표시합니다.

## 다음 단계는? {id="what-s-next"}

* [Kotlin/JS 프로젝트 설정](js-project-setup.md)
* [Kotlin/JS 애플리케이션 디버깅](js-debugging.md) 방법 알아보기
* [Kotlin/JS로 테스트 작성 및 실행](js-running-tests.md) 방법 알아보기
* [실제 Kotlin/JS 프로젝트를 위한 Gradle 빌드 스크립트 작성](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html) 방법 알아보기
* [Gradle 빌드 시스템](gradle.md)에 대해 더 읽어보기