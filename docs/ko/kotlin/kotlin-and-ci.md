[//]: # (title: Kotlin 및 TeamCity를 사용한 지속적 통합)

이 페이지에서는 Kotlin 애플리케이션을 빌드하기 위해 [TeamCity](https://www.jetbrains.com/teamcity/)를 설정하는 방법을 알아봅니다.
TeamCity 설치 및 기본 설정에 대한 내용은 [TeamCity 문서](https://www.jetbrains.com/teamcity/documentation/)를 참조하세요.

Kotlin은 Gradle 및 Maven과 같은 표준 빌드 도구와 직접 통합되므로, TeamCity에서 Kotlin 빌드를 구성하는 작업은 일반적인 다른 프로젝트와 동일한 워크플로를 따릅니다. 대신 IntelliJ IDEA 빌드 시스템을 사용하여 프로젝트를 컴파일하는 경우, TeamCity는 전용 러너(runner)를 제공합니다.

## Gradle 및 Maven {id="gradle-and-maven"}

Gradle이나 Maven으로 빌드할 때, 빌드 구성 파일(`build.gradle.kts` 또는 `pom.xml`)에 이미 Kotlin 의존성과 컴파일러 플러그인이 선언되어 있습니다. 따라서 TeamCity에서 별도의 Kotlin 관련 추가 설정을 구성할 필요가 없습니다.

Gradle의 경우, 빌드 구성에 Gradle 빌드 단계를 추가하고 실행하려는 **Step name**과 **Gradle tasks**를 지정하세요.
<img src="teamcity-gradle.png" alt="Gradle Build Step" width="700" border-effect="line"/>

마찬가지로 Maven의 경우에도, Maven 빌드 단계를 추가하고 실행하려는 **Step name**과 **Goals**를 지정하세요.

## IntelliJ IDEA 빌드 시스템 {id="intellij-idea-build-system"}

IntelliJ IDEA 프로젝트 파일을 사용하여 프로젝트를 빌드하는 경우, TeamCity의 Kotlin 버전이 IDE 프로젝트에 구성된 버전과 일치해야 합니다. 
TeamCity 레시피(recipe)를 사용하면 Kotlin 컴파일러 다운로드 및 구성을 자동화할 수 있습니다. 레시피는 메타 러너(meta-runner)가 발전된 형태로, 
동일한 용도로 사용되지만 YAML 지원 및 [JetBrains Marketplace](https://plugins.jetbrains.com/teamcity_recipe)에서의 손쉬운 공유와 같은 추가적인 이점을 제공합니다.

1. 레시피 다운로드 및 가져오기.
   * [GitHub](https://github.com/JetBrains/Kotlin.TeamCity)에서 Kotlin 메타 러너 파일을 다운로드합니다.
   * 이를 새 레시피로 TeamCity에 가져옵니다(import). 자세한 내용은 [레시피 사용하기(Working with recipes)](https://www.jetbrains.com/help/teamcity/working-with-meta-runner.html)를 참조하세요.
  <img src="teamcity-add-recipe.png" alt="TeamCity recipe" width="700" border-effect="line"/>

2. Kotlin 컴파일러 가져오기 단계 추가.
   * 가져온 러너를 사용하여 빌드 단계를 추가합니다.
   * **Step name**과 필요한 **Kotlin Version**을 지정합니다.
  <img src="teamcity-step-name.png" alt="Setup Kotlin Compiler" width="700" border-effect="line"/>

  >빌드를 실행하기 전에 빌드 구성에 `system.path.macro.KOTLIN.BUNDLED`를 시스템 파라미터로 추가하세요. 
  >임의의 플레이스홀더 값을 지정할 수 있으며, 빌드 시 러너가 확인된 컴파일러 경로로 이를 덮어씁니다.
  >
  > {style="note"}

3. 컴파일 단계 추가.
   컴파일러 가져오기 단계 뒤에 IntelliJ IDEA Project 러너 단계를 추가하여 프로젝트를 컴파일하고 빌드 아티팩트를 생성합니다.
  <img src="teamcity-intellij-step.png" alt="IntelliJ IDEA Project runner" width="500" border-effect="line"/>

## 기타 CI 서버 {id="other-ci-servers"}

TeamCity 이외의 CI 시스템을 사용하는 경우, 파이프라인 스크립트에서 표준 Gradle 또는 Maven 명령을 직접 호출하세요.

## 다음 단계 {id="what-s-next"}

* Kotlin Multiplatform 애플리케이션을 빌드, 테스트 및 배포하기 위해 [Kotlin Multiplatform 애플리케이션용 TeamCity를 구성하는 방법](https://kotlinlang.org/docs/multiplatform/configure-teamcity-for-kmp.html)을 알아보세요.
* 호스팅된 macOS 에이전트에서 [Kotlin Multiplatform 프로젝트용 iOS 배포 파이프라인을 구성하고](https://kotlinlang.org/docs/multiplatform/ios-ci-cd-teamcity.html) TestFlight로의 배포를 자동화하는 튜토리얼을 확인해 보세요.
* [버전 제어 시스템에 프로젝트 설정을 저장하고](https://www.jetbrains.com/help/teamcity/storing-project-settings-in-version-control.html) Kotlin DSL을 사용하여 파이프라인을 코드로 관리하는 방법을 알아보세요.