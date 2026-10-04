[//]: # (title: Kotlin Multiplatform 시작 가이드)

## 시작하기 {id="where-to-start"}

1. Kotlin Multiplatform (KMP) 및 Compose Multiplatform (CMP)에 대해 알아보기:
   [개념, 장점 및 활용 사례](kmp-overview.md).
2. [샘플 프로젝트를 통해 KMP 직접 체험해 보기](quickstart.md): 프로젝트 구조와 다양한 플랫폼에서의 동작 방식을 확인할 수 있습니다.

## KMP 기초 배우기 {id="learn-kmp-basics"}

기초 과정에서는 다음 내용을 다룹니다:

* [KMP / CMP 프로젝트 구조 이해하기](multiplatform-discover-project.md).
  다루는 내용:
    * 공유 모듈 내의 공통 코드 및 플랫폼별 코드.
    * 대상(타깃) 플랫폼 선언.
* [KMP 프로젝트에 의존성 추가하기](multiplatform-add-dependencies.md).
    * 멀티플랫폼 및 플랫폼별 의존성 구성의 실제 예시는 [샘플](https://github.com/kotlin-hands-on/get-started-with-kmp/tree/main)에서 확인할 수 있습니다.
    * 해당 샘플의 완성 단계로 안내하는 튜토리얼은 [공식 문서에서 확인](multiplatform-upgrade-app.md)할 수 있습니다.
* 이미 KMP에 익숙하다면, 일반적인 프로젝트에 대한 [권장 프로젝트 구조](multiplatform-project-recommended-structure.md)를 숙지하고 있는지 확인하세요.
  이 가이드는 Android Gradle 플러그인 9.0 출시가 KMP 프로젝트 요구사항에 미친 영향을 고려하며 다음 내용을 다룹니다:
    * 모듈 구조 (라이브러리로 사용되는 공유 코드 모듈과 독립적인 앱 모듈).
    * 새로운 앱 모듈 생성 및 AGP 8에서 사용되던 이전 구조에서의 전환.
* JetBrains 디벨로퍼 애드버킷(Developer Advocate)이 녹화한 [프로젝트 구조 추천 영상](https://www.youtube.com/watch?v=Atvl0l7fm1Y).

<!-- ## \[AI Agents scenario tools TODO\] -->

## 코드 공유하기 {id="share-code"}

KMP 프로젝트에서는 플랫폼별 특성에 따라 코드를 공유하는 여러 가지 방법이 있습니다:

* 앱 모듈에서 공통 코드를 호출하는 기본 예제는 온보딩 튜토리얼에서 다룹니다:
    * [네이티브 UI 및 공유 로직 구현](multiplatform-upgrade-app.md)
    * [UI 및 로직 모두 공유 구현](compose-multiplatform-new-project.md)
* [플랫폼별 API에 접근하는 방법](multiplatform-connect-to-apis.md):
    * 가능한 경우 멀티플랫폼 라이브러리를 사용합니다.
    * 적합한 멀티플랫폼 라이브러리가 없는 경우 `expect`/`actual` 메커니즘을 사용합니다.
* Android Kotlin에서 공유 Kotlin 코드를 호출하는 것은 비교적 직관적이지만, iOS 상호 운용성(interoperability)은 다소 익숙해질 필요가 있습니다:
    * 일반적으로 상호 운용(interop)을 줄일수록 좋으므로, 보다 원활한 개발 경험을 위해 모든 플랫폼의 주요 UI 구축에 Compose Multiplatform을 활용하는 것을 권장합니다.
    * [공유 코드를 iOS 앱과 통합하는 방법 알아보기](multiplatform-ios-integration-overview.md#local-integration) (이 문서에서 참조하는 모든 샘플에는 iOS 통합 설정 예시가 포함되어 있습니다).
      > CocoaPods 패키지 관리자는 점차 Swift Package Manager로 대체되고 있으며,
      > 신규 프로젝트에서의 사용은 권장하지 않습니다.
      >
      {style="note"}   
    * Kotlin 코루틴을 iOS와 연동하는 내용이 포함된 [샘플 및 튜토리얼](multiplatform-upgrade-app.md)을 확인해 보세요.
    * [KMP iOS 앱에서 기존 SPM 패키지 사용하기](multiplatform-spm-import.md) 가이드를 참조하세요.
    * [Kotlin에서 Swift / ObjC 호출(및 그 반대)에 대한 심층 설명](https://kotlinlang.org/docs/native-objc-interop.html)을 읽어보세요.
    * 더욱 직관적인 [Swift 내보내기(Swift export)](https://kotlinlang.org/docs/native-swift-export.html) 접근 방식에 대해 알아보세요(현재 Alpha 단계).
    

## 생태계 살펴보기 {id="discover-the-ecosystem"}

멀티플랫폼 라이브러리의 종합 카탈로그는 [klibs.io](https://klibs.io/)에서 확인할 수 있습니다:

* 가장 많이 사용되는 사용 사례는 이미 검증된 솔루션으로 해결 가능하며, 대부분 대안도 마련되어 있습니다:
  데이터베이스용 [SQLDelight](https://sqldelight.github.io/sqldelight/) 및 [Room](https://developer.android.com/kotlin/multiplatform/room), 네트워킹용 [Ktor](https://ktor.io/) 및 [OkHttp](https://square.github.io/okhttp/), 이미지 로딩용 [Coil](https://coil-kt.github.io/coil/) 등이 있습니다.
* 주요 사용 사례에 맞게 멀티플랫폼 라이브러리를 활용하여 구축된 앱 샘플이 제공됩니다:
    * [SQLDelight / Ktor / kotlinx-serialization / Koin](https://github.com/kotlin-hands-on/kmp-networking-and-data-storage/tree/final) 샘플 및 관련 [튜토리얼](multiplatform-ktor-sqldelight.md).
    * [기존 Android 샘플](https://github.com/android/compose-samples/tree/main/Jetcaster)에서 전환된 [멀티플랫폼 Jetcaster 앱](https://github.com/kotlin-hands-on/jetcaster-kmp-migration).

## KMP 라이브러리 만들기 {id="create-a-kmp-library"}

공유 코드를 멀티플랫폼 라이브러리로 패키징하기로 결정했다면, 다음 문서 페이지를 확인해 보세요:

* [기본 라이브러리 튜토리얼](create-kotlin-multiplatform-library.md)
* [KMP 라이브러리를 위한 배포 설정](multiplatform-publish-lib-setup.md)
* [Maven Central](multiplatform-publish-libraries-to-maven.md) 및 [npm](multiplatform-publish-libraries-to-npm.md)에 아티팩트를 배포하는 튜토리얼

## 아티팩트 배포하기 {id="publish-the-artifacts"}

* [KMP 앱 배포에 관한 일반 문서](multiplatform-publish-apps.md)를 읽어보세요.
* Apple App Store에서 요구하는 [개인정보 처리 매니페스트(Privacy manifest)](multiplatform-privacy-manifest.md)를 잊지 말고 준비하세요.

## KMP 개발에 AI 활용하기 {id="using-ai-for-kmp-development"}

### 시작하기 전에 {id="before-you-start"}

#### Junie 무료 이용 혜택 활용하기 {id="use-the-free-junie-access"}

Junie는 JetBrains의 AI 에이전트입니다.
Shipaton 참가자에게는 Junie CLI 에이전트의 EAP 버전을 무료로 이용할 수 있는 혜택이 제공됩니다.
또한 [JetBrains IDE의 AI 채팅 기능](https://www.jetbrains.com/ai-ides/#getstarted)을 통해서도 Junie 에이전트를 사용할 수 있습니다.

<a as="button" href="https://surveys.jetbrains.com/s3/Build-with-Junie-at-Shipaton-2026-Application-Form" mode="classic" icon="arrow-right" icon-position="right">Junie 이용 신청하기</a>

#### AGENTS.md 설정 및 커밋 {id="set-up-and-commit-agents-md"}

AI 에이전트는 낯선 코드베이스를 탐색할 때 AGENTS.md 파일에 크게 의존하므로, 정확하고 포괄적인 컨텍스트를 제공하면 에이전트의 통찰력과 생성되는 코드의 품질을 눈에 띄게 향상시킬 수 있습니다.
예를 들어, 프로젝트에서 Kotlin Multiplatform을 사용하고 있음을 명시하는 것만으로도 수많은 크로스 플랫폼 문제를 예방할 수 있습니다.

형식에 대해 알아보고 예시를 확인하려면 [AGENTS.md](https://agents.md/) 웹사이트를 방문하세요.

#### 유용한 MCP 서버 구성하기 {id="configure-useful-mcp-servers"}

다음 MCP 서버는 KMP 환경에서 앱을 구축하는 AI 에이전트에게 유용할 수 있습니다:

* [klibs.io](https://github.com/JetBrains/klibs-io/blob/master/integrations/mcp/README.md) 서버:
  적합한 멀티플랫폼 라이브러리를 찾는 데 도움을 줍니다.
* [Compose Hot Reload](compose-hot-reload.md#mcp-server-for-ai-agents) 서버:
  에이전트가 UI를 신속하게 반복 수정할 수 있도록 지원합니다.

### 기능 구현하기 {id="build-features"}

#### 계획 모드(Planning mode) 활용하기 {id="use-planning-mode"}

규모가 큰 작업이나 분산 작업의 경우, 대부분의 에이전트는 **계획 모드**를 지원합니다. 이를 통해 작업을 세분화하고 단계별 지침을 명확히 생성하여 본격적인 코드 생성을 시작하기 전에 미리 검증할 수 있습니다.

계획 모드에서 도출된 결과물을 검토하고 다듬는 데 시간을 들이면 다음과 같은 작업에서 훨씬 더 나은 결과를 얻을 수 있습니다:
* 사용자에게 직접 노출되는 기능을 처음부터 구현할 때
* 아키텍처를 변경할 때
* 라이브러리를 통합할 때
* 대규모 리팩터링을 진행할 때

#### AI가 생성한 변경 사항 검증하기 {id="validate-ai-generated-changes"}

일반적인 AI의 비결정성(non-determinism)에 더해, Kotlin Multiplatform은 포괄적으로 다루기 까다로운 다면적인 컨텍스트를 수반합니다.
예를 들어, 한 플랫폼에서는 변경 사항이 잘 구현되어 제대로 작동하지만 다른 플랫폼에서는 빌드가 깨지는 일이 흔히 발생합니다.

이 문제를 해결하려면 구체적인 인수 기준(Acceptance criteria)을 정의하는 것이 좋습니다:

* 변경 사항을 적용한 후, 해당 플랫폼별 테스트가 준비되어 있다면 이를 실행합니다.
* 작업을 완료된 것으로 간주하기 전에, 설정된 모든 KMP 타깃이 성공적으로 빌드되는지 확인합니다.
* 플랫폼 전용 API가 공통 코드로 유출되지 않았는지 구현을 검토합니다. 이러한 유출은 향후 에이전트(및 사람)가 해당 API를 부적절하게 사용하는 원인이 될 수 있습니다.

#### Kotlin AI 스킬 활용하기 {id="use-kotlin-ai-skills"}

Kotlin 팀은 Kotlin 관련 문제를 해결하기 위한 맞춤형 AI 스킬을 제작 및 유지 관리하고 있습니다.
[스킬 리포지토리](https://github.com/Kotlin/kotlin-agent-skills)를 확인하고 에이전트에 필요한 스킬을 설치해 보세요.

#### Swift Package Manager를 사용해 네이티브 iOS 라이브러리 통합하기 {id="use-swift-package-manager-to-integrate-native-ios-libraries"}

아직 지원하는 멀티플랫폼 라이브러리가 없는 iOS 기능의 경우, 네이티브 iOS 라이브러리를 직접 통합해야 할 수 있습니다.
이러한 의존성을 구성할 때는 SwiftPM 패키지와 [해당 DSL](multiplatform-spm-import.md)을 사용하는 것을 권장합니다.

Kotlin 팀은 [CocoaPods에서 SwiftPM으로의 이전을 돕는 AI 스킬](https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-cocoapods-spm-migration)을 제공하고 있으며, 이는 처음부터 SwiftPM 통합을 설정할 때도 유용합니다.

#### 에이전트 오케스트레이션 설정하기 {id="set-up-agent-orchestration"}

JetBrains Air는 프로젝트의 여러 부분을 동시에 작업하는 여러 에이전트를 조율하여 작업 속도를 높여주는 에이전트 오케스트레이션을 제공합니다.

<a as="button" href="https://air.dev/" mode="classic" icon="arrow-right" icon-position="right">Air 체험하기</a>

### UI 반복 개선하기 {id="iterate-on-ui"}

#### Figma를 사용해 UI 디자인 및 Compose 코드 생성하기 {id="use-figma-to-generate-ui-designs-and-compose-code"}

[Figma MCP 서버](https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server)를 활용하면 디자인을 Compose 코드로 변환하는 데 도움을 받을 수 있습니다.

UI 디자인을 처음부터 생성하려는 경우에는 [Google Stitch](https://stitch.withgoogle.com/) 또는 [Figma Make](https://www.figma.com/make/) 사용을 고려해 보세요.

#### Compose UI 작업에 Gemini CLI를 에이전트로 활용하기 {id="use-gemini-cli-as-the-agent-for-compose-ui-tasks"}

[Flash 제품군](https://ai.google.dev/gemini-api/docs/models#gemini-3-stable) 모델을 포함한 Google 모델로 Compose 코드를 생성할 때 일관되게 우수한 결과를 확인했습니다.
생성 속도, 토큰 소모량, UI 품질 간의 균형이 뛰어납니다.

#### Compose Hot Reload를 사용해 UI 반복 개선하기 {id="use-compose-hot-reload-to-iterate-on-ui"}

[Compose Hot Reload](compose-hot-reload.md)를 사용하면 개발자나 에이전트가 Compose 코드에 적용한 변경 사항을 거의 실시간으로 반영하여 UI를 업데이트할 수 있습니다.

에이전트의 UI 작업을 지원하기 위해 [Compose Hot Reload MCP 서버](compose-hot-reload.md#mcp-server-for-ai-agents)를 에이전트 구성에 추가할 수 있습니다.
이를 통해 에이전트가 직접 리로드를 트리거하고, 스크린샷을 캡처하며, UI와 상호 작용까지 수행할 수 있습니다.

## 학습 리소스 카탈로그 {id="learning-resources-catalog"}

언급된 모든 리소스와 더불어 더 심층적인 가이드 및 서드파티 콘텐츠가 [학습 리소스](kmp-learning-resources.md) 페이지에 정리되어 있습니다.