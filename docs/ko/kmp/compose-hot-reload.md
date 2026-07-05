[//]: # (title: Compose Hot Reload)

Compose Hot Reload는 Compose Multiplatform 프로젝트를 작업하는 동안 UI 변경 사항을 시각화하고 실험하는 데 도움을 줍니다.
격리된 컴포넌트를 테스트 데이터로 확인하는 데 유용한 표준 [Compose 미리보기(Compose previews)](compose-previews.md)와 달리,
Compose Hot Reload는 코드 변경 사항을 실행 중인 애플리케이션에 직접 적용합니다.

번들로 제공되는 Compose Hot Reload Gradle 플러그인은 
Kotlin 2.1.20 이상 및 Java 21 이하와 호환되는 JVM 타겟을 필요로 합니다.
Compose Hot Reload의 모든 기능을 사용하려면, 
IntelliJ IDEA 버전 2025.2.2 이상 및 Android Studio Otter 2025.2.1 이상에서 사용할 수 있는 [Kotlin Multiplatform IDE 플러그인](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)을 설치하는 것을 권장합니다.

다른 타겟에 대한 지원 추가를 검토하는 동안, 데스크톱 앱을 샌드박스(sandbox)로 사용하여 
흐름을 끊지 않고 공통 코드(common code)의 UI 변경 사항을 빠르게 실험해 볼 수 있습니다.

<img src="KotlinConf-hot-reload.animated.gif" alt="Compose Hot Reload" width="600" preview-src="KotlinConf-hot-reload.png"/>

## 프로젝트에 Compose Hot Reload 추가하기

Compose Hot Reload는 다음 두 가지 방법으로 추가할 수 있습니다:

* [IntelliJ IDEA 또는 Android Studio에서 프로젝트를 처음부터 생성](#from-scratch)
* [기존 프로젝트에 Gradle 플러그인 추가](#to-an-existing-project)

### 처음부터 생성하기 {#from-scratch}

이 섹션에서는 IntelliJ IDEA 및 Android Studio에서 데스크톱 타겟을 포함한 멀티플랫폼 프로젝트를 생성하는 단계를 안내합니다. 프로젝트가 생성되면 Compose Hot Reload가 자동으로 추가됩니다.

1. [빠른 시작(quickstart)](quickstart.md) 가이드에서 [Kotlin Multiplatform 개발 환경 설정](quickstart.md#set-up-the-environment) 안내를 완료합니다.
2. IDE에서 **File** | **New** | **Project**를 선택합니다.
3. 왼쪽 패널에서 **Kotlin Multiplatform**을 선택합니다.
4. **New Project** 창에서 **Name**, **Group**, **Artifact** 필드를 지정합니다.
5. **Desktop** 타겟을 선택하고 **Create**를 클릭합니다.
   ![Create multiplatform project with desktop target](create-desktop-project.png){width=600 style="block"}

### 기존 프로젝트에 추가하기 {#to-an-existing-project}

Compose Multiplatform 1.10.0부터 
Compose Hot Reload 플러그인은 [번들로 제공](whats-new-compose-110.md#compose-hot-reload-integration)되며, 
**데스크톱 타겟**을 포함하는 모든 프로젝트에서 기본적으로 활성화됩니다. 

프로젝트에 이미 데스크톱 타겟이 포함되어 있다면, 
Compose Multiplatform 버전을 1.10.0 이상으로 업그레이드하여 별도의 설정 없이 Compose Hot Reload 기능을 바로 사용할 수 있습니다. 

기본적으로 활성화되어 있지만, 
특정 이전 버전을 사용하기 위해 Compose Hot Reload 플러그인을 명시적으로 선언할 수도 있습니다.

#### 이전 버전의 Compose Multiplatform {initial-collapse-state="collapsed" collapsible="true"}

1.10.0 이전 버전의 Compose Multiplatform을 사용하는 멀티플랫폼 프로젝트의 경우,
데스크톱 타겟이 구성되어 있어야 하며 Compose Hot Reload 플러그인을 명시적으로 추가해야 합니다.
아래 단계는 [공유 로직 및 UI를 포함한 앱 생성](compose-multiplatform-create-first-app.md) 튜토리얼의 프로젝트를 참고용으로 사용합니다.

1. 데스크톱 타겟 도입: `desktopApp` 디렉토리를 생성하고, `main()` 함수를 정의하며,
   `actual` 구현을 제공합니다.
   이미 프로젝트에 데스크톱 타겟이 포함되어 있다면 이 단계를 건너뛸 수 있습니다.
   참고를 위해 [JVM 진입점 추가](migrate-from-android.md#optional-add-a-jvm-entry-point)의 샘플을 확인하세요.
 
2. 최신 버전의 Compose Hot Reload로 버전 카탈로그를 업데이트합니다([릴리스](https://github.com/JetBrains/compose-hot-reload/releases) 참조).
   `gradle/libs.versions.toml`에 다음 코드를 추가합니다:
   ```toml
   composeHotReload = { id = "org.jetbrains.compose.hot-reload", version.ref = "composeHotReload"}
   ```

   > 프로젝트 전체에서 종속성을 중앙에서 관리하기 위해 버전 카탈로그를 사용하는 방법에 대한 자세한 내용은 [Gradle 모범 사례](https://kotlinlang.org/gradle-best-practices.html)를 참조하세요.

3. 상위 프로젝트의 `build.gradle.kts`(`ComposeDemo/build.gradle.kts`)에서 `plugins {}` 블록에 다음 코드를 추가합니다:
   ```kotlin
   plugins {
       alias(libs.plugins.composeHotReload) apply false
   }
   ```
   이렇게 하면 각 하위 프로젝트에서 Compose Hot Reload 플러그인이 여러 번 로드되는 것을 방지할 수 있습니다.

4. 멀티플랫폼 애플리케이션이 포함된 하위 프로젝트의 `build.gradle.kts`(`ComposeDemo/sharedUI/build.gradle.kts`)에서 `plugins {}` 블록에 다음 코드를 추가합니다:
   ```kotlin
   plugins { 
       alias(libs.plugins.composeHotReload)
   }
   ```

5. 프로젝트는 향상된 클래스 재정의(class redefinition)를 지원하는 OpenJDK 포크인 [JetBrains Runtime](https://github.com/JetBrains/JetBrainsRuntime)(JBR)에서 실행되어야 합니다.
   Compose Hot Reload는 프로젝트에 호환되는 JBR을 자동으로 프로비저닝(provision)할 수 있습니다.

   > 최신 JetBrains Runtime은 Java 21만 지원합니다:
   > Java 22 이상과만 호환되는 프로젝트에 Compose Hot Reload를 추가하면,
   > 프로젝트 실행 시 링크 오류(linkage error)가 발생합니다.
   > 
   {style="warning"}

   자동 프로비저닝을 허용하려면 `settings.gradle.kts` 파일에 다음 Gradle 플러그인을 추가합니다:

   ```kotlin
   plugins {
       id("org.gradle.toolchains.foojay-resolver-convention") version "%foojayResolverConventionVersion%"
   }
   ```

6. **Sync Gradle Changes** 버튼을 클릭하여 Gradle 파일을 동기화합니다: ![Synchronize Gradle files](gradle-sync.png){width=50}

## Compose Hot Reload 사용하기

1. `desktopApp` 소스 세트에서 `main.kt` 파일을 열고 `main()` 함수를 업데이트합니다:
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
   `alwaysOnTop` 변수를 `true`로 설정하면, 생성된 데스크톱 앱이 모든 창 위에 유지되어 코드를 수정하고 변경 사항을 실시간으로 확인하기가 더 쉬워집니다.

2. `App.kt` 파일을 열고 `Button` 컴포저블(composable)을 업데이트합니다:
   ```kotlin
   Button(onClick = { showContent = !showContent }) {
       Column {
           Text(Greeting().greet())
       }
   }
   ```
   이제 버튼의 텍스트가 `greet()` 함수에 의해 제어됩니다.

3. `Greeting.kt` 파일을 열고 `greet()` 함수를 업데이트합니다:
   ```kotlin
    fun greet(): String {
        return "Hello!"
    }
   ```

4.  `main.kt` 파일을 열고 거터(gutter)에 있는 **Run** 아이콘을 클릭합니다. 
    Select **Run 'desktopApp' with Compose Hot Reload**.

    ![Run Compose Hot Reload from gutter](compose-hot-reload-gutter-run.png){width=350 border-effect="line"}

    ![First Compose Hot Reload on desktop app](compose-hot-reload-hello.png){width=500 border-effect="line"}

5. `greet()` 함수에서 반환되는 문자열을 업데이트한 다음, 모든 파일을 저장(<shortcut>⌘ S</shortcut> / <shortcut>Ctrl+S</shortcut>)하면 데스크톱 앱이 자동으로 업데이트되는 것을 확인할 수 있습니다.

   ![Compose Hot Reload](compose-hot-reload.animated.gif){width=500 preview-src="compose-hot-reload.png"}

   또는 할당된 단축키를 누르거나 **Reload UI** 버튼을 클릭하여 명시적으로 다시 로드(reload)를 트리거할 수도 있습니다.
   **Settings | Tools | Compose Hot Reload** 페이지에서 트리거 동작을 수정할 수 있습니다.

축하합니다! Compose Hot Reload가 실제로 작동하는 것을 확인했습니다. 이제 매번 데스크톱 실행 구성을 다시 시작할 필요 없이 텍스트, 이미지, 서식, UI 구조 등을 변경하며 자유롭게 실험해 볼 수 있습니다.

## AI 에이전트를 위한 MCP 서버
<primary-label ref="Experimental"/>

[//]: # (TODO update version for stable release)

Compose Multiplatform 1.2.0-beta01부터 Compose Hot Reload는 내장된 [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) 서버를 포함합니다. 
MCP 서버를 통해 AI 코딩 에이전트는 실행 중인 Compose 애플리케이션과 상호작용할 수 있습니다. 예를 들어, Compose Hot Reload를 트리거하고, 렌더링된 UI를 확인하며, 시맨틱(semantic) 구조를 조사하고, 사용자 입력을 시뮬레이션하며, 런타임 로그를 읽을 수 있습니다.
창이 여러 개인 애플리케이션의 경우, 에이전트는 창 목록을 나열하고 그중 하나를 타겟으로 지정할 수 있습니다.

이 기능은 Compose 코드를 편집할 때 AI 에이전트의 피드백 루프를 완성합니다. 
에이전트가 매번 편집 후 결과를 수동으로 확인해 주기를 기다리는 대신, 코드를 자율적으로 반복 수정하고 각 변경 사항을 직접 검증할 수 있습니다.

### AI 에이전트 연결하기

AI 에이전트가 Compose 애플리케이션과 상호작용하도록 설정하는 방법은 다음과 같습니다:

1. Gradle 태스크를 사용하여 애플리케이션과 함께 MCP 서버를 시작합니다:
    ```shell
    ./gradlew :composeApp:hotMcpServerJvm
    ```
   태스크 이름은 표준 명명 규칙인 `hotMcpServer<TargetName>`을 따릅니다.
   예를 들어, `desktop`이라는 이름의 커스텀 JVM 타겟은 `:composeApp:hotMcpServerDesktop` 태스크를 사용합니다.
2. AI 에이전트의 MCP 클라이언트 설정에서 해당 Gradle 태스크를 가리키도록 합니다. 예를 들어, `.mcp.json` 파일의 설정은 다음과 같습니다:
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

### 사용 가능한 MCP 도구

MCP 서버는 에이전트가 호출할 수 있는 다음과 같은 다양한 도구를 제공합니다:

* `reload` — 프로젝트를 다시 컴파일하고 변경된 클래스를 핫 리로드합니다.
* `take_screenshot` — 애플리케이션 창의 현재 상태를 캡처합니다.
* `get_semantic_tree` — Compose [시맨틱 트리(semantic tree)](compose-accessibility.md#semantic-properties)를 반환하여 에이전트가 UI 구조를 이해할 수 있게 합니다.
* `get_logs` — 런타임 예외를 포함하여 실행 중인 애플리케이션의 최근 로그 출력을 반환합니다.
* `click`, `type_text`, `scroll` — 대화형 흐름을 테스트하기 위해 사용자 입력을 시뮬레이션합니다.

전체 MCP 도구 목록과 해당 파라미터에 대한 자세한 내용은 [Compose Hot Reload README](https://github.com/JetBrains/compose-hot-reload#mcp-server-for-ai-agents)를 참조하세요.

## 도움 받기

Compose Hot Reload 사용 중 문제 발생 시, [GitHub 이슈 생성](https://github.com/JetBrains/compose-hot-reload/issues)을 통해 알려주세요.