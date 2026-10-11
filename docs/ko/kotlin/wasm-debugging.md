[//]: # (title: Kotlin/Wasm 코드 디버깅)

<primary-label ref="beta"/> 

이 튜토리얼에서는 IntelliJ IDEA와 브라우저를 사용하여 Kotlin/Wasm으로 빌드된 [Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/) 애플리케이션을 디버깅하는 방법을 설명합니다.

## 시작하기 전에 {id="before-you-start"}

1. [Kotlin Multiplatform 개발 환경을 설정합니다](https://kotlinlang.org/docs/multiplatform/quickstart.html#set-up-the-environment).
2. 안내에 따라 [Kotlin/Wasm을 타겟으로 하는 Kotlin Multiplatform 프로젝트를 생성합니다](wasm-get-started.md#create-a-project).

> IntelliJ IDEA에서 Kotlin/Wasm 코드를 디버깅하려면 JavaScript Debugger 플러그인이 설치되어 있어야 합니다. [플러그인에 대한 자세한 정보 및 설치 방법 보기.](https://www.jetbrains.com/help/idea/debugging-javascript-in-chrome.html#ws_js_debugging_chrome_before_you_start)
>
{style="note"}

## IntelliJ IDEA에서 디버깅 {id="debug-in-intellij-idea"}

생성한 Kotlin Multiplatform 프로젝트에는 Kotlin/Wasm 기반의 Compose Multiplatform 애플리케이션이 포함되어 있습니다.
추가 설정 없이도 IntelliJ IDEA에서 기본적으로 이 애플리케이션을 디버깅할 수 있습니다.

1. IntelliJ IDEA에서 디버깅할 Kotlin 파일을 엽니다. 이 튜토리얼에서는 Kotlin Multiplatform 프로젝트의 다음 디렉터리에 있는 `Greeting.kt` 파일로 작업합니다:

   `WasmDemo/composeApp/src/wasmJsMain/kotlin/wasm.project.demo.wasmdemo`

2. 검사하려는 코드의 줄 번호를 클릭하여 중단점(breakpoint)을 설정합니다.

   ![중단점 설정](wasm-breakpoints-intellij.png){width=650}

3. 실행 구성(run configuration) 목록에서 **composeApp[wasmJs]**를 선택합니다.
4. 화면 상단의 디버그 아이콘을 클릭하여 디버그 모드로 코드를 실행합니다.

   ![디버그 모드로 실행](wasm-debug-run-configurations.png){width=600}

   애플리케이션이 시작되면 새 브라우저 창에서 열립니다.

   ![브라우저의 Compose 앱](wasm-composeapp-browser.png){width=600}

   또한, IntelliJ IDEA에서 **Debug** 패널이 자동으로 열립니다.

   ![Compose 앱 디버거](wasm-debug-pane.png){width=600}

### 애플리케이션 검사 {id="inspect-your-application"}

> [브라우저에서 디버깅](#debug-in-your-browser)하는 경우에도 애플리케이션 검사를 위해 동일한 단계를 따를 수 있습니다.
>
{style="note"}

1. 애플리케이션 브라우저 창에서 **Click me!** 버튼을 클릭하여 애플리케이션과 상호작용합니다. 이 동작으로 코드가 실행되며, 실행이 중단점에 도달하면 디버거가 일시 중지됩니다.

2. 디버깅 패널에서 디버깅 제어 버튼을 사용하여 중단점에서의 변수 및 코드 실행을 검사합니다:
    * ![Step over](wasm-debug-step-over.png){width=30}{type="joined"} Step over: 현재 줄을 실행하고 다음 줄에서 일시 중지합니다.
    * ![Step into](wasm-debug-step-into.png){width=30}{type="joined"} Step into: 함수 내부를 더 자세히 조사합니다.
    * ![Step out](wasm-debug-step-out.png){width=30}{type="joined"} Step out: 현재 함수를 빠져나올 때까지 코드를 실행합니다.

3. **Threads & Variables** 패널을 확인합니다. 이 패널은 함수 호출 시퀀스를 추적하고 오류 위치를 정확히 파악하는 데 도움을 줍니다.

   ![Threads & Variables 확인](wasm-debug-panes-intellij.png){width=700}

4. 코드를 변경하고 애플리케이션을 다시 실행하여 어떻게 동작하는지 확인합니다.
5. 디버깅이 끝나면 중단점이 있는 줄 번호를 클릭하여 중단점을 제거합니다.

## 브라우저에서 디버깅 {id="debug-in-your-browser"}

추가 설정 없이도 브라우저에서 이 Compose Multiplatform 애플리케이션을 직접 디버깅할 수 있습니다. 

개발용 Gradle 태스크(`*DevRun`)를 실행하면 Kotlin이 자동으로 브라우저에 소스 파일을 제공하므로, 중단점을 설정하고 변수를 검사하며 Kotlin 코드를 단계별로 실행할 수 있습니다.

브라우저에서 Kotlin/Wasm 프로젝트 소스를 제공하기 위한 설정은 이제 Kotlin Gradle 플러그인에 기본으로 포함되어 있습니다.
이전에 `build.gradle.kts` 파일에 이 설정을 추가했다면 충돌을 방지하기 위해 제거해야 합니다.

> 이 튜토리얼에서는 Chrome 브라우저를 사용하지만, 다른 브라우저에서도 동일한 단계를 따를 수 있습니다. 자세한 내용은 [브라우저 버전](wasm-configuration.md#browser-versions)을 참조하세요.
>
{style="tip"}

1. 안내에 따라 [Compose Multiplatform 애플리케이션을 실행합니다](wasm-get-started.md#run-the-application).

2. 애플리케이션 브라우저 창에서 마우스 오른쪽 버튼을 클릭하고 **검사(Inspect)** 동작을 선택하여 개발자 도구에 접근합니다.
   또는 **F12** 단축키를 사용하거나 **보기(View)** | **개발자(Developer)** | **개발자 도구(Developer Tools)**를 선택할 수 있습니다.

3. **Sources** 탭으로 전환하고 디버깅할 Kotlin 파일을 선택합니다. 이 튜토리얼에서는 `Greeting.kt` 파일로 작업합니다.

4. 검사하려는 코드의 줄 번호를 클릭하여 중단점을 설정합니다. 더 어두운 번호가 표시된 줄에만 중단점을 설정할 수 있습니다(이 예시에서는 4, 7, 8, 9).

   ![중단점 설정](wasm-breakpoints-browser.png){width=700}

5. [IntelliJ IDEA에서 디버깅하기](#inspect-your-application)와 유사한 방식으로 애플리케이션을 검사합니다.

    브라우저에서 디버깅할 때 함수 호출 시퀀스를 추적하고 오류를 찾아내는 패널은 **Scope** 및 **Call Stack**입니다.

   ![콜 스택 확인](wasm-debug-scope.png){width=450}

### 커스텀 포맷터 사용 {id="use-custom-formatters"}

커스텀 포맷터(custom formatters)는 브라우저에서 Kotlin/Wasm 코드를 디버깅할 때 변수 값을 더 사용자 친화적이고 이해하기 쉬운 방식으로 표시하고 찾는 데 도움이 됩니다.

커스텀 포맷터는 Kotlin/Wasm 개발 빌드에서 기본적으로 활성화되어 있지만, 브라우저의 개발자 도구에서도 커스텀 포맷터가 활성화되어 있는지 확인해야 합니다:

* Chrome DevTools에서는 **Settings | Preferences | Console**에서 **Custom formatters** 체크박스를 찾을 수 있습니다:

  ![Chrome에서 커스텀 포맷터 활성화](wasm-custom-formatters-chrome.png){width=400}

* Firefox DevTools에서는 **Settings | Advanced settings**에서 **Enable custom formatters** 체크박스를 찾을 수 있습니다:

  ![Firefox에서 커스텀 포맷터 활성화](wasm-custom-formatters-firefox.png){width=400}

이 기능은 [custom formatters API](https://firefox-source-docs.mozilla.org/devtools-user/custom_formatters/index.html)를 사용하며 Firefox 및 Chromium 기반 브라우저에서 지원됩니다.

커스텀 포맷터는 기본적으로 Kotlin/Wasm 개발 빌드에서만 작동하므로 프로덕션 빌드에서 사용하려면 Gradle 구성을 조정해야 합니다.
`wasmJs {}` 블록에 다음 컴파일러 옵션을 추가합니다:

```kotlin
// build.gradle.kts
kotlin {
    wasmJs {
        // ...

        compilerOptions {
            freeCompilerArgs.add("-Xwasm-debugger-custom-formatters")
        }
    }
}
```

## 피드백 남기기 {id="leave-feedback"}

디버깅 경험에 대한 여러분의 피드백을 환영합니다!

* ![Slack](slack.svg){width=25}{type="joined"} Slack: [Slack 초대받기](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)를 통해 [#webassembly](https://kotlinlang.slack.com/archives/CDFP59223) 채널에서 개발자들에게 직접 피드백을 전달할 수 있습니다.
* [YouTrack](https://youtrack.jetbrains.com/issue/KT-56492)에 피드백을 남겨주세요.

## 다음 단계는? {id="what-s-next"}

* 이 [YouTube 동영상](https://www.youtube.com/watch?v=t3FUWfJWrjU&t=2703s)에서 실제로 동작하는 Kotlin/Wasm 디버깅을 확인해 보세요.
* 더 많은 Kotlin/Wasm 예제를 사용해 보세요:
  * [KotlinConf 애플리케이션](https://github.com/JetBrains/kotlinconf-app)
  * [Compose 이미지 뷰어](https://github.com/JetBrains/compose-multiplatform/tree/master/examples/imageviewer)
  * [Node.js 예제](https://github.com/Kotlin/kotlin-wasm-nodejs-template)
  * [WASI 예제](https://github.com/Kotlin/kotlin-wasm-wasi-template)
  * [Compose 예제](https://github.com/Kotlin/kotlin-wasm-compose-template)