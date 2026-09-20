[//]: # (title: Kotlin 개발을 위한 IDE)

<web-summary>JetBrains는 IntelliJ IDEA, Android Studio 및 Visual Studio Code에 대해 공식 Kotlin IDE 지원을 제공합니다.</web-summary>

JetBrains는 다음 IDE 및 코드 에디터에 대해 공식 Kotlin 지원을 제공합니다: [IntelliJ IDEA](#intellij-idea) 및 [Android Studio](#android-studio).
또한 현재 [Alpha](components-stability.md#stability-levels-explained) 단계인 [Visual Studio Code](#visual-studio-code)용 공식 Kotlin by JetBrains 익스텐션(extension)을 설치할 수도 있습니다.

다른 IDE 및 코드 에디터는 Kotlin 커뮤니티에서 지원하는 플러그인만 제공합니다.

## IntelliJ IDEA {id="intellij-idea"}

[IntelliJ IDEA](https://www.jetbrains.com/idea/download/)는 개발자 생산성을 극대화하기 위해 Kotlin 및 Java와 같은 JVM 언어용으로 설계된 IDE입니다.
영리한 코드 완성(code completion), 정적 코드 분석 및 리팩터링을 제공하여 일상적이고 반복적인 작업을 대신 처리해 줍니다. 
이를 통해 소프트웨어 개발의 핵심적인 측면에 집중할 수 있게 하여, 생산성뿐만 아니라 즐거운 경험을 선사합니다.

Kotlin 플러그인은 각 IntelliJ IDEA 릴리스에 기본적으로 포함되어(bundled) 있습니다.
각 IDEA 릴리스에는 IDE 내 Kotlin 개발자의 경험을 개선하는 새로운 기능과 업그레이드가 도입됩니다.
Kotlin에 대한 최신 업데이트 및 개선 사항은 [IntelliJ IDEA의 새로운 기능](https://www.jetbrains.com/idea/whatsnew/)을 참조하세요.

IntelliJ IDEA에 대한 자세한 내용은 [공식 문서](https://www.jetbrains.com/help/idea/discover-intellij-idea.html)에서 확인할 수 있습니다.

## Android Studio {id="android-studio"}

[Android Studio](https://developer.android.com/studio)는 [IntelliJ IDEA](https://www.jetbrains.com/idea/)를 기반으로 하는 공식 Android 앱 개발용 IDE입니다.
IntelliJ의 강력한 코드 에디터 및 개발자 도구 외에도, Android Studio는 Android 앱을 빌드할 때 생산성을 높여주는 더 많은 기능을 제공합니다.

Kotlin 플러그인은 각 Android Studio 릴리스에 포함되어 있습니다.

Android Studio에 대한 자세한 내용은 [공식 문서](https://developer.android.com/studio/intro)에서 확인할 수 있습니다.

## Visual Studio Code {id="visual-studio-code"}
<primary-label ref="alpha"/>

[Visual Studio Code](https://code.visualstudio.com/)는 [공식 Kotlin by JetBrains 익스텐션](https://marketplace.visualstudio.com/items?itemName=JetBrains.kotlin-server)을 포함하여 광범위한 익스텐션을 제공하는 코드 에디터입니다.

Kotlin 익스텐션은 Kotlin Language Server를 통해 코드 완성, 내비게이션(navigation), 디버깅 및 기타 Kotlin 개발 기능을 제공합니다.

자세한 내용은 [Kotlin Language Server 및 Visual Studio Code](kotlin-lsp.md#kotlin-in-visual-studio-code)를 참조하세요.

## 기타 IDE 지원 {id="other-ide-support"}

JetBrains는 다른 IDE를 위한 공식 Kotlin 플러그인을 제공하지 않습니다.
다른 코드 에디터에서는 [Kotlin Language Server](kotlin-lsp.md)를 사용할 수 있습니다.

IDE 관련 기능(코드 포맷팅, 디버깅 도구, 리팩터링 등) 없이 텍스트 에디터에서 Kotlin을 사용하려면, Kotlin [GitHub 릴리스](%kotlinLatestUrl%)에서 최신 Kotlin 커맨드 라인 컴파일러(`kotlin-compiler-%kotlinVersion%.zip`)를 다운로드하여 [수동으로 설치](command-line.md#manual-install)할 수 있습니다. 또한 [Homebrew](command-line.md#homebrew), [SDKMAN!](command-line.md#sdkman) 및 [Snap 패키지](command-line.md#snap-package)와 같은 패키지 매니저를 사용할 수도 있습니다.

## Kotlin 언어 버전과의 호환성 {id="compatibility-with-the-kotlin-language-versions"}

IntelliJ IDEA 및 Android Studio의 경우, Kotlin 플러그인은 각 릴리스에 포함되어 있습니다.
새로운 Kotlin 버전이 출시되면 이러한 도구는 Kotlin을 최신 버전으로 자동 업데이트하도록 제안합니다.
지원되는 최신 언어 버전은 [Kotlin 릴리스](releases.md#ide-support)를 확인하세요.

## IDE의 AI 지원 {id="ai-support-in-ides"}

IntelliJ IDEA와 Android Studio는 내장된 AI 기능 및 AI 코딩 에이전트와의 연동을 통해 AI 기반 Kotlin 개발을 지원합니다. 워크플로에 따라 IDE에서 직접 AI를 사용하거나, 외부 에이전트를 연결하거나, AI 도구를 Kotlin 전용 가이드와 결합하여 활용할 수 있습니다.

사용 가능한 AI 도구의 개요와 사용 시기는 [](ai-for-development.md)를 참조하세요.

## 다음 단계 {id="what-s-next"}

* [IntelliJ IDEA에서 콘솔 애플리케이션 만들기](jvm-get-started.md)
* [Android Studio를 사용하여 첫 번째 크로스 플랫폼 모바일 앱 만들기](https://kotlinlang.org/docs/multiplatform/multiplatform-create-first-app.html)