[//]: # (title: Compose Hot Reload)

Compose Hot Reload를 사용하면 Compose Multiplatform 프로젝트 작업을 진행하는 동안 UI 변경 사항을 시각화하고 실험해 볼 수 있습니다.
테스트 데이터가 포함된 개별 컴포넌트를 확인하는 데 유용한 표준 [Compose 미리보기(Compose previews)](compose-previews.md)와 달리,
Compose Hot Reload는 코드 변경 사항을 실행 중인 애플리케이션에 직접 적용합니다.

번들로 제공되는 Compose Hot Reload Gradle 플러그인은
Kotlin 2.1.20 이상 및 Java 21 이하와 호환되는 JVM 타깃이 필요합니다.
Compose Hot Reload의 모든 기능을 사용하려면,
IntelliJ IDEA 버전 2025.2.2 이상 및 Android Studio Otter 2025.2.1 이상에서 사용할 수 있는
[Kotlin Multiplatform IDE 플러그인](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)을 설치하는 것을 권장합니다.

다른 타깃에 대한 지원 추가도 검토하고 있지만, 현재도 데스크톱 앱을 샌드박스로 활용하여
작업 흐름을 방해받지 않고 공통 코드(common code)의 UI 변경 사항을 빠르게 실험해 볼 수 있습니다.

<img src="KotlinConf-hot-reload.animated.gif" alt="Compose Hot Reload" width="600" preview-src="KotlinConf-hot-reload.png"/>

## 프로젝트에 Compose Hot Reload 추가하기 {id="add-compose-hot-reload-to-your-project"}

Compose Hot Reload는 다음 두 가지 방법으로 추가할 수 있습니다.

* [IntelliJ IDEA 또는 Android Studio에서 프로젝트를 처음부터 새로 생성](#from-scratch)
* [기존 프로젝트에 Gradle 플러그인 추가](#to-an-existing-project)

### 처음부터 새로 생성하는 경우 {id="from-scratch"}

이 섹션에서는 IntelliJ IDEA 및 Android Studio에서 데스크톱 타깃이 포함된 멀티플랫폼 프로젝트를 생성하는 단계를 안내합니다. 프로젝트가 생성되면 Compose Hot Reload가 자동으로 추가됩니다.

1. [빠른 시작 가이드(quickstart)](quickstart.md)에서 [Kotlin Multiplatform 개발 환경 설정](quickstart.md#set-up-the-environment) 안내를 완료합니다.
2. IDE에서 **File** | **New** | **Project**를 선택합니다.
3. 왼쪽 패널에서 **Kotlin Multiplatform**을 선택합니다.
4. **New Project** 창에서 **Name**, **Group**, **Artifact** 필드를 지정합니다.
5. **Desktop** 타깃을 선택하고 **Create**를 클릭합니다.
   ![데스크톱 타깃이 포함된 멀티플랫폼 프로젝트 생성](create-desktop-project.png){width=600 style="block"}

### 기존 프로젝트에 추가하는 경우 {id="to-an-existing-project"}

Compose Multiplatform 1.10.0부터
Compose Hot Reload 플러그인이 [번들로 포함](whats-new-compose-110.md#compose-hot-reload-integration)되어
**데스크톱 타깃**이 포함된 모든 프로젝트에서 기본적으로 활성화됩니다.

프로젝트에 이미 데스크톱 타깃이 포함되어 있다면,
Compose Multiplatform 버전을 1.10.0 이상으로 업그레이드하여 Compose Hot Reload 기능을 별도 설정 없이 바로 사용할 수 있습니다.

기본적으로 활성화되어 있지만, 특정 구버전을 사용해야 하는 경우에는 Compose Hot Reload 플러그인을 명시적으로 선언할 수도 있습니다.

#### Compose Multiplatform 이전 버전 {initial-collapse-state="collapsed" collapsible="true" id="earlier-versions-of-compose-multiplatform"}

1.10.0 이전 버전의 Compose Multiplatform을 사용하는 멀티플랫폼 프로젝트의 경우,
데스크톱 타깃이 구성되어 있어야 하며 Compose Hot Reload 플러그인을 명시적으로 추가해야 합니다.
다음 단계는 [빠른 시작 가이드(quickstart)](quickstart.md) 튜토리얼의 프로젝트를 기준으로 설명합니다.

1. 데스크톱 타깃 추가: `desktopApp` 디렉터리를 생성하고, `main()` 함수를 정의한 다음, `actual` 구현을 제공합니다.
   프로젝트에 이미 데스크톱 타깃이 포함되어 있다면 이 단계는 건너뛸 수 있습니다.
   자세한 내용은 [JVM 진입점 추가](migrate-from-android.md#optional-add-a-jvm-entry-point)의 예제를 참조하세요.
 
2. 최신 버전의 Compose Hot Reload로 버전 카탈로그를 업데이트합니다([Releases](https://github.com/JetBrains/compose-hot-reload/releases) 참조).
   `gradle/libs.versions.toml` 파일에 다음 코드를 추가합니다.
   ```toml
   composeHotReload = { id = "org.jetbrains.compose.hot-reload", version.ref = "composeHotReload"}
   ```

   > 프로젝트 전반에서 버전 카탈로그를 사용해 의존성을 중앙 집중식으로 관리하는 방법에 대한 자세한 내용은 [Gradle 모범 사례(Gradle best practices)](https://kotlinlang.org/gradle-best-practices.html)를 참조하세요.

3. 부모 프로젝트의 `build.gradle.kts`(`ComposeDemo/build.gradle.kts`)의 `plugins {}` 블록에 다음 코드를 추가합니다.
   ```kotlin
   plugins {
       alias(libs.plugins.composeHotReload) apply false
   }
   ```
   이렇게 하면 각 서브프로젝트에서 Compose Hot Reload 플러그인이 여러 번 로드되는 것을 방지할 수 있습니다.

4. 멀티플랫폼 애플리케이션이 포함된 서브프로젝트의 `build.gradle.kts`(`ComposeDemo/sharedUI/build.gradle.kts`)의 `plugins {}` 블록에 다음 코드를 추가합니다.
   ```kotlin
   plugins { 
       alias(libs.plugins.composeHotReload)
   }
   ```

5. 프로젝트는 향상된 클래스 재정의(class redefinition)를 지원하는 OpenJDK 포크인 [JetBrains Runtime](https://github.com/JetBrains/JetBrainsRuntime)(JBR)에서 실행되어야 합니다.
   Compose Hot Reload는 호환되는 JBR을 프로젝트에 자동으로 프로비저닝할 수 있습니다.

   > 최신 JetBrains Runtime은 Java 21만 지원합니다.
   > Java 22 이상에서만 호환되는 프로젝트에 Compose Hot Reload를 추가하면,
   > 프로젝트 실행 시 링크 오류(linkage error)가 발생합니다.
   > 
   {style="warning"}

   자동 프로비저닝을 활성화하려면 `settings.gradle.kts` 파일에 다음 Gradle 플러그인을 추가하세요.

   ```kotlin
   plugins {
       id("org.gradle.toolchains.foojay-resolver-convention") version "%foojayResolverConventionVersion%"
   }
   ```

6. **Sync Gradle Changes** 버튼을 클릭하여 Gradle 파일을 동기화합니다. ![Gradle 파일 동기화](gradle-sync.png){width=50}

## Compose Hot Reload 사용하기 {id="use-compose-hot-reload"}

1. `desktopApp` 소스 세트에서 `main.kt` 파일을 열고 `main()` 함수를 업데이트합니다.
   ```kotlin
   fun main() = application {
       Window(
           onCloseRequest = ::exitApplication,
           alwaysOnTop = true,
           title = "composedemo",
       ) {
           App()
       }
   }
   ```
   `alwaysOnTop` 변수를 `true`로 설정하면 생성된 데스크톱 앱이 모든 창의 맨 위에 유지되므로,
   코드를 편집하면서 실시간으로 변경 사항을 확인하기가 더 쉬워집니다.

2. `App.kt` 파일을 열고 `Button` 컴포저블을 업데이트합니다.
   ```kotlin
   Button(onClick = { showContent = !showContent }) {
       Column {
           Text(Greeting().greet())
       }
   }
   ```
   이제 버튼의 텍스트가 `greet()` 함수에 의해 제어됩니다.

3. `Greeting.kt` 파일을 열고 `greet()` 함수를 업데이트합니다.
   ```kotlin
    fun greet(): String {
        return "Hello!"
    }
   ```

4. `main.kt` 파일을 열고 여백(gutter)에 있는 **Run** 아이콘을 클릭합니다.
   **Run 'desktopApp' with Compose Hot Reload**를 선택합니다.

    ![여백에서 Compose Hot Reload 실행](compose-hot-reload-gutter-run.png){width=350 border-effect="line"}

    ![데스크톱 앱에서의 첫 Compose Hot Reload](compose-hot-reload-hello.png){width=500 border-effect="line"}

5. `greet()` 함수가 반환하는 문자열을 수정한 다음 모든 파일을 저장(<shortcut>⌘ S</shortcut> / <shortcut>Ctrl+S</shortcut>)하면 데스크톱 앱이 자동으로 업데이트되는 것을 확인할 수 있습니다.

   ![Compose Hot Reload](compose-hot-reload.animated.gif){width=500 preview-src="compose-hot-reload.png"}

   또는 지정된 단축키를 누르거나 **Reload UI** 버튼을 클릭하여 리로드를 명시적으로 트리거할 수도 있습니다.
   트리거 동작은 **Settings | Tools | Compose Hot Reload** 페이지에서 변경할 수 있습니다.

축하합니다! Compose Hot Reload의 작동 방식을 확인하셨습니다. 이제 변경할 때마다 데스크톱 실행 구성을 다시 시작할 필요 없이 텍스트, 이미지, 서식 지정, UI 구조 등을 자유롭게 실험해 볼 수 있습니다.

## AI 에이전트를 위한 MCP 서버 {id="mcp-server-for-ai-agents"}
<primary-label ref="Experimental"/>

Compose Multiplatform 1.12.0부터 Compose Hot Reload에 기본 내장된
[Model Context Protocol(MCP)](https://modelcontextprotocol.io/) 서버가 포함됩니다.
MCP 서버를 통해 AI 코딩 에이전트가 실행 중인 Compose 애플리케이션과 상호작용할 수 있습니다. 즉, Compose Hot Reload 트리거, 렌더링된 UI 확인, 시맨틱 구조 검사, 사용자 입력 시뮬레이션, 런타임 로그 읽기 등이 가능합니다.
여러 개의 창이 있는 애플리케이션의 경우 에이전트가 창 목록을 확인하고 특정 창을 대상으로 지정할 수도 있습니다.

이를 통해 Compose 코드를 편집할 때 AI 에이전트의 피드백 루프를 완성할 수 있습니다.
에이전트는 사용자가 수정할 때마다 일일이 결과를 수동으로 확인하도록 하지 않고,
자율적으로 코드를 반복 수정하며 각 변경 사항을 검증할 수 있습니다.

### AI 에이전트 연결하기 {id="connect-an-ai-agent"}

AI 에이전트를 연결하려면 `hotMcpServer` Gradle 작업을 실행하도록 MCP 클라이언트를 구성합니다.
예를 들어, `.mcp.json` 파일에 다음과 같이 설정합니다.

```json
{
  "mcpServers": {
    "compose-hot-reload": {
      "command": "./gradlew",
      "args": [
        "--no-daemon",
        "--quiet",
        "--console=plain",
        "hotMcpServer"
      ]
    }
  }
}
```

Gradle은 모든 서브프로젝트에서 작업을 검색하여 `hotMcpServer`라는 짧은 이름을 `hotMcpServerJvm` 또는 `hotMcpServerDesktop`과 같이 타깃별로 특화된 변형과 일치시킵니다.

모듈에 여러 JVM 타깃이 정의되어 있는 경우 모호성을 방지하기 위해 정규화된 작업 이름(fully qualified task name)을 지정하세요(예: `:<module>:hotMcpServer<Target>`, 구체적으로는 `:app:hotMcpServerDesktop` 또는 `:composeApp:hotMcpServerJvm`).

### 사용 가능한 MCP 도구 {id="available-mcp-tools"}

MCP 서버는 에이전트가 호출할 수 있는 다음과 같은 다양한 도구를 제공합니다.

* `reload` — 프로젝트를 다시 컴파일하고 변경된 클래스를 핫 리로드합니다.
* `take_screenshot` — 애플리케이션 창의 현재 상태를 캡처합니다.
* `get_semantic_tree` — 에이전트가 UI 구조를 이해할 수 있도록 Compose [시맨틱 트리(semantic tree)](compose-accessibility.md#semantic-properties)를 반환합니다.
* `get_logs` — 런타임 예외를 포함하여 실행 중인 애플리케이션의 최근 로그 출력을 반환합니다.
* `click`, `type_text`, `scroll` — 대화형 흐름을 테스트하기 위해 사용자 입력을 시뮬레이션합니다.

전체 MCP 도구 목록 및 파라미터에 대한 자세한 내용은
[Compose Hot Reload README](https://github.com/JetBrains/compose-hot-reload#mcp-server-for-ai-agents)를 참조하세요.

## 도움 받기 {id="get-help"}

Compose Hot Reload를 사용하는 도중 문제가 발생하면 [GitHub 이슈를 생성](https://github.com/JetBrains/compose-hot-reload/issues)하여 알려주세요.