[//]: # (title: Kotlin/JS 코드 디버깅)

JavaScript 소스 맵(source maps)은 번들러나 미니파이어(minifier)에 의해 생성된 축소된 코드(minified code)와 개발자가 실제로 작업하는 소스 코드 사이의 매핑을 제공합니다. 이러한 방식으로 소스 맵은 코드가 실행되는 동안 디버깅을 지원합니다.

Kotlin 멀티플랫폼 Gradle 플러그인은 프로젝트 빌드 시 소스 맵을 자동으로 생성하므로, 추가 설정 없이도 소스 맵을 사용할 수 있습니다.

## 브라우저에서 디버깅하기

대부분의 최신 브라우저는 페이지 콘텐츠를 검사하고 실행 중인 코드를 디버깅할 수 있는 도구를 제공합니다. 자세한 내용은 브라우저의 문서를 참조하세요.

브라우저에서 Kotlin/JS를 디버깅하려면 다음 단계를 따르세요:

1. 사용 가능한 _run_ Gradle 태스크 중 하나를 실행하여 프로젝트를 실행하세요. 예를 들어, `jsBrowserDevelopmentRun`을 실행합니다.
   [Kotlin/JS 실행](running-kotlin-js.md#run-the-browser-target)에 대해 자세히 알아보세요.
2. 브라우저에서 해당 페이지로 이동하여 개발자 도구를 실행합니다 (예: 마우스 오른쪽 버튼을 클릭하고 **검사(Inspect)** 동작 선택). 주요 브라우저에서 [개발자 도구를 찾는 방법](https://balsamiq.com/support/faqs/browserconsole/)을 알아보세요.
3. 프로그램이 콘솔에 정보를 기록하고 있다면, **콘솔(Console)** 탭으로 이동하여 출력을 확인하세요. 브라우저에 따라 이러한 로그는 해당 로그가 생성된 Kotlin 소스 파일과 줄 번호를 참조할 수 있습니다.

![Chrome 개발자 도구 콘솔](devtools-console.png){width="600"}

4. 오른쪽에 있는 파일 참조를 클릭하여 해당 코드 줄로 이동합니다.
   또는 **소스(Sources)** 탭으로 직접 전환하여 파일 트리에서 필요한 파일을 찾을 수 있습니다. Kotlin 파일로 이동하면 축소된 JavaScript가 아닌 일반적인 Kotlin 코드가 표시됩니다.

![Chrome 개발자 도구에서 디버깅](devtools-sources.png){width="600"}

이제 프로그램 디버깅을 시작할 수 있습니다. 줄 번호 중 하나를 클릭하여 중단점(breakpoint)을 설정하세요.
개발자 도구는 구문(statement) 내에 중단점을 설정하는 기능도 지원합니다. 일반적인 JavaScript 코드와 마찬가지로, 설정된 중단점은 페이지를 새로 고침해도 유지됩니다. 이를 통해 스크립트가 처음 로드될 때 실행되는 Kotlin의 `main()` 메서드도 디버깅할 수 있습니다.

## IDE에서 디버깅하기

[IntelliJ IDEA](https://www.jetbrains.com/idea/) Ultimate 버전은 개발 중에 코드를 디버깅할 수 있는 강력한 도구 세트를 제공합니다.

IntelliJ IDEA에서 Kotlin/JS를 디버깅하려면 **JavaScript Debug** 구성이 필요합니다. 이러한 디버그 구성을 추가하려면 다음 단계를 따르세요:

1. **Run | Edit Configurations**로 이동합니다.
2. **+**를 클릭하고 **JavaScript Debug**를 선택합니다.
3. 구성의 **Name**을 지정하고 프로젝트가 실행되는 **URL**을 입력합니다 (기본값은 `http://localhost:8080`).

![JavaScript 디버그 구성](debug-config.png){width=700}

4. 구성을 저장합니다.

[JavaScript 디버그 구성 설정](https://www.jetbrains.com/help/idea/configuring-javascript-debugger.html)에 대해 자세히 알아보세요.

이제 프로젝트를 디버깅할 준비가 되었습니다!

1. 사용 가능한 _run_ Gradle 태스크 중 하나를 실행하여 프로젝트를 실행하세요. 예를 들어, `jsBrowserDevelopmentRun`을 실행합니다.
   [Kotlin/JS 실행](running-kotlin-js.md#run-the-browser-target)에 대해 자세히 알아보세요.
2. 이전에 생성한 JavaScript 디버그 구성을 실행하여 디버깅 세션을 시작합니다:

![JavaScript 디버그 구성 실행](debug-config-run.png){width=700}

3. IntelliJ IDEA의 **Debug** 창에서 프로그램의 콘솔 출력을 볼 수 있습니다. 출력 항목은 해당 항목이 생성된 Kotlin 소스 파일과 줄 번호를 참조합니다.

![IDE에서의 JavaScript 디버그 출력](ide-console-output.png){width=700}

4. 오른쪽에 있는 파일 참조를 클릭하여 해당 코드 줄로 이동합니다.

이제 중단점(breakpoint), 스테핑(stepping), 식 평가(expression evaluation) 등 IDE가 제공하는 모든 도구 세트를 사용하여 프로그램을 디버깅할 수 있습니다. [IntelliJ IDEA에서 디버깅하기](https://www.jetbrains.com/help/idea/debugging-javascript-in-chrome.html)에 대해 자세히 알아보세요.

> 현재 IntelliJ IDEA의 JavaScript 디버거 제약으로 인해, 중단점에서 실행을 멈추게 하려면 JavaScript 디버그를 다시 실행해야 할 수도 있습니다.
>
{style="note"}

## Node.js에서 디버깅하기

프로젝트가 Node.js를 대상으로 하는 경우, 이 런타임에서 디버깅할 수 있습니다.

Node.js를 대상으로 하는 Kotlin/JS 애플리케이션을 디버깅하려면 다음 단계를 따르세요:

1. `build` Gradle 태스크를 실행하여 프로젝트를 빌드합니다.
2. 프로젝트 디렉터리 내의 `build/js/packages/your-module/kotlin/` 디렉터리에서 Node.js용 결과물인 `.js` 파일을 찾습니다.
3. [Node.js 디버깅 가이드](https://nodejs.org/en/docs/guides/debugging-getting-started/#jetbrains-webstorm-2017-1-and-other-jetbrains-ides)의 설명에 따라 Node.js에서 디버깅하세요.

## 다음 단계는?

Kotlin/JS 프로젝트에서 디버깅 세션을 시작하는 방법을 익혔으므로, 이제 디버깅 도구를 효율적으로 사용하는 방법을 알아보세요:

* [Google Chrome에서 JavaScript 디버깅하기](https://developer.chrome.com/docs/devtools/javascript/)
* [IntelliJ IDEA JavaScript 디버거](https://www.jetbrains.com/help/idea/debugging-javascript-in-chrome.html) 익히기
* [Node.js에서 디버깅하기](https://nodejs.org/en/docs/guides/debugging-getting-started/) 방법 배우기

## 문제 발생 시

Kotlin/JS 디버깅과 관련하여 문제가 발생하면 이슈 트래커인 [YouTrack](https://kotl.in/issue)으로 보고해 주세요.