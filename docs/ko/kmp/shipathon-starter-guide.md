[//]: # (title: Kotlin Multiplatform 시작 가이드)

## 시작하기

1. Kotlin Multiplatform(KMP) 및 Compose Multiplatform(CMP)에 대해 알아봅니다. [이들이 무엇인지, 장점과 사용 사례](kmp-overview.md)를 확인하세요.
2. [샘플 프로젝트에서 KMP를 직접 실행](quickstart.md)하여 프로젝트 구조가 어떻게 구성되어 있고 다양한 플랫폼에서 어떻게 동작하는지 확인해 보세요.

## KMP 기본 사항 배우기

기본 사항은 다음과 같습니다.

* [KMP / CMP 프로젝트 구성 방식 이해하기](multiplatform-discover-project.md).
  다음 내용을 다룹니다:
    * 공유 모듈(shared module) 내의 공통 코드 및 플랫폼별 코드.
    * 대상 플랫폼(Targeted platform) 선언.
* [KMP 프로젝트에 종속성 추가하기](multiplatform-add-dependencies.md).
    * 멀티플랫폼 및 플랫폼별 종속성 구성의 실제 예시는 [샘플](https://github.com/kotlin-hands-on/get-started-with-kmp/tree/main)에서 확인할 수 있습니다.
    * 해당 샘플의 최종 상태에 도달하는 과정을 설명하는 [튜토리얼이 문서에 제공](multiplatform-upgrade-app.md)되어 있습니다.
* 이미 KMP에 익숙하다면, 일반적인 프로젝트를 위한 [권장 프로젝트 구조](multiplatform-project-recommended-structure.md) 최신 내용을 확인하세요.
  이 가이드는 Android Gradle 플러그인 9.0의 출시가 KMP 프로젝트 요구 사항에 미친 영향을 고려하며 다음 내용을 다룹니다:
    * 모듈 구조 (라이브러리로 사용되는 공유 코드 모듈과 독립적인 앱 모듈).
    * 새로운 앱 모듈 생성 및 AGP 8에서 사용하던 이전 구조로부터의 전환.
* JetBrains 개발자 에드보킷(developer advocate)이 녹화한 [프로젝트 구조에 관한 권장 영상](https://www.youtube.com/watch?v=Atvl0l7fm1Y).

<!-- ## \[AI Agents scenario tools TODO\] -->

## 코드 공유하기

KMP 프로젝트에서 코드를 공유하는 방법은 다양하며, 플랫폼별 특성이 있습니다.

* 앱 모듈에서 공통 코드를 호출하는 기본적인 예시는 온보딩 튜토리얼에서 다룹니다:
    * [네이티브 UI 및 공유 로직용](multiplatform-create-first-app.md)
    * [공유 UI 및 로직용](compose-multiplatform-create-first-app.md)
* [플랫폼별 API에 접근하는 방법](multiplatform-connect-to-apis.md):
    * 가능한 경우 멀티플랫폼 라이브러리를 사용하세요.
    * 적절한 멀티플랫폼 라이브러리가 없는 경우 `expect`/`actual` 메커니즘을 사용하세요.
* Android Kotlin에서 공유 Kotlin 코드를 호출하는 것은 비교적 간단하지만, iOS 상호 운용성(interoperability)은 별도의 학습이 필요합니다:
    * 일반적으로 상호 운용성이 적을수록 좋습니다. 따라서 더 매끄러운 경험을 위해 모든 플랫폼의 주요 UI 구축에는 Compose Multiplatform을 활용하는 것을 권장합니다.
    * [공유 코드를 iOS 앱과 통합하는 방법](multiplatform-ios-integration-overview.md#local-integration)을 알아보세요 (이 문서에서 참조된 모든 샘플에는 iOS 통합 설정 예시가 포함되어 있습니다).
      > CocoaPods 패키지 관리자는 일반적으로 Swift Package Manager로 대체되는 추세이며, 새 프로젝트에서 사용을 권장하지 않습니다.
      >
      {style="note"}   
    * Kotlin 코루틴을 iOS에서 작동시키는 방법이 포함된 [샘플 및 튜토리얼](multiplatform-upgrade-app.md#add-more-dependencies)을 확인하세요.
    * [KMP iOS 앱에서 기존 SPM 패키지 사용](multiplatform-spm-import.md)에 관한 가이드를 읽어보세요.
    * [Kotlin에서 Swift / ObjC 호출 및 그 반대](https://kotlinlang.org/docs/native-objc-interop.html)에 대한 심층 설명을 읽어보세요.
    * 더 직관적인 [Swift export](https://kotlinlang.org/docs/native-swift-export.html) 방식(현재 Alpha 단계)에 대해 알아보세요.
    

## 생태계 살펴보기

멀티플랫폼 라이브러리에 대한 종합적인 카탈로그는 [klibs.io](https://klibs.io/)에서 확인할 수 있습니다.

* 가장 대중적인 사례들은 이미 견고한 솔루션들로 해결 가능하며, 대안들도 존재합니다:
  데이터베이스를 위한 [SQLDelight](https://sqldelight.github.io/sqldelight/) 및 [Room](https://developer.android.com/kotlin/multiplatform/room), 네트워킹을 위한 [Ktor](https://ktor.io/) 및 [OkHttp](https://square.github.io/okhttp/), 이미지 로딩을 위한 [Coil](https://coil-kt.github.io/coil/) 등이 있습니다.
* 주요 사용 사례에 멀티플랫폼 라이브러리를 사용하도록 빌드된 앱 샘플들이 제공됩니다:
    * [SQLDelight / Ktor / kotlinx-serialization / Koin](https://github.com/kotlin-hands-on/kmp-networking-and-data-storage/tree/final) 및 관련 [튜토리얼](multiplatform-ktor-sqldelight.md).
    * [기존 Android 샘플](https://github.com/android/compose-samples/tree/main/Jetcaster)에서 전환된 [멀티플랫폼 Jetcaster 앱](https://github.com/kotlin-hands-on/jetcaster-kmp-migration).

## KMP 라이브러리 만들기

공유 코드를 멀티플랫폼 라이브러리로 패키징하기로 했다면 다음 문서들을 확인하세요:

* [기본 라이브러리 튜토리얼](create-kotlin-multiplatform-library.md)
* [KMP 라이브러리 배포 설정](multiplatform-publish-lib-setup.md)
* [Maven Central](multiplatform-publish-libraries-to-maven.md) 및 [npm](multiplatform-publish-libraries-to-npm.md)에 아티팩트를 배포하는 튜토리얼

## 아티팩트 배포하기

* [KMP 앱 배포에 관한 일반적인 문서](multiplatform-publish-apps.md)를 읽어보세요.
* Apple App Store에서 요구하는 [개인정보 보호 매니페스트(privacy manifest)](multiplatform-privacy-manifest.md)를 잊지 마세요.

## KMP 개발에 AI 활용하기

### 시작하기 전에

#### 무료 Junie 액세스 활용

Junie는 JetBrains의 AI 에이전트입니다.
Shipaton 참가자들을 위해 JetBrains는 Junie CLI 에이전트의 EAP 버전에 대한 무료 액세스를 제공합니다.
또한 [IntelliJ IDE의 AI 채팅 기능](https://www.jetbrains.com/ai-ides/#getstarted)을 통해 Junie 에이전트를 사용할 수도 있습니다.

<a as="button" href="https://surveys.jetbrains.com/s3/Build-with-Junie-at-Shipaton-2026-Application-Form" mode="classic" icon="arrow-right" icon-position="right">Junie 액세스 권한 신청하기</a>

#### AGENTS.md 설정 및 커밋

AI 에이전트는 낯선 코드베이스를 탐색할 때 AGENTS.md 파일에 크게 의존하므로, 정확하고 포괄적인 컨텍스트를 제공하면 에이전트의 인사이트와 생성된 코드의 품질을 눈에 띄게 향상시킬 수 있습니다.
예를 들어, 프로젝트가 Kotlin Multiplatform을 사용한다는 사실을 기록해 두는 것만으로도 많은 크로스 플랫폼 문제를 방지하는 데 도움이 될 수 있습니다.

형식에 대해 알아보고 예시를 보려면 [AGENTS.md](https://agents.md/) 웹사이트를 확인하세요.

#### 유용한 MCP 서버 구성

다음 MCP 서버들은 KMP 환경에서 앱을 구축하는 AI 에이전트에게 유용할 수 있습니다:

* [klibs.io](https://github.com/JetBrains/klibs-io/blob/master/integrations/mcp/README.md) 서버는 적합한 멀티플랫폼 라이브러리를 찾는 데 도움을 줍니다.
* [Compose Hot Reload](compose-hot-reload.md#mcp-server-for-ai-agents) 서버는 에이전트가 UI를 빠르게 반복 수정할 수 있게 해줍니다.

### 기능 구현

#### 계획 모드(planning mode) 활용

규모가 큰 작업이나 분산된 업무의 경우, 대부분의 에이전트는 작업을 세분화하고 코드 생성이 본격적으로 시작되기 전에 사용자가 검증할 수 있는 명확한 단계별 지침을 생성하는 **계획 모드(planning mode)**를 지원합니다.

계획 모드에서 수행된 작업 결과를 검토하고 다듬는 데 시간을 투자하면 다음과 같은 작업에서 훨씬 더 나은 결과를 얻을 수 있습니다:
* 사용자 대상 기능을 처음부터 구현
* 아키텍처 변경
* 라이브러리 통합
* 대규모 리팩터링

#### AI가 생성한 변경 사항 검증

일반적인 AI의 비결정성(non-determinism) 외에도, Kotlin Multiplatform은 포괄적으로 다루기 어려운 다면적인 컨텍스트를 가지고 있습니다.
예를 들어, 한 플랫폼에서는 잘 작동하도록 구현된 변경 사항이 다른 플랫폼을 중단시키는 경우가 흔히 발생합니다.

이러한 문제를 해결하기 위해 구체적인 수락 기준(acceptance criteria)을 정의하는 것이 좋습니다:

* 변경 사항을 도입한 후, 가능한 경우 대상별 테스트(target-specific tests)를 실행합니다.
* 작업을 완료된 것으로 간주하기 전에 구성된 모든 KMP 타겟이 성공적으로 빌드되는지 확인합니다.
* 플랫폼별 API가 공통 코드(common code)로 유출되지 않았는지 구현 내용을 검토합니다. 이러한 유출은 나중에 에이전트(및 사람)가 해당 API를 잘못된 단계에서 사용하게 만들 수 있습니다.

#### Kotlin AI 스킬(skills) 활용

Kotlin 팀은 Kotlin 관련 문제를 해결하기 위한 AI 스킬을 빌드하고 유지 관리합니다.
[스킬 저장소](https://github.com/Kotlin/kotlin-agent-skills)를 확인하고 에이전트에 스킬을 설치하세요.

#### Swift Package Manager를 사용한 네이티브 iOS 라이브러리 통합

아직 멀티플랫폼 라이브러리가 지원되지 않는 iOS 기능의 경우, 네이티브 iOS 라이브러리를 통합해야 할 수도 있습니다.
이러한 종속성을 구성할 때는 SwiftPM 패키지와 [관련 DSL](multiplatform-spm-import.md)을 사용하는 것이 권장됩니다.

Kotlin 팀은 [CocoaPods에서 SwiftPM으로의 마이그레이션을 위한 AI 스킬](https://github.com/Kotlin/kotlin-agent-skills/tree/main/skills/kotlin-tooling-cocoapods-spm-migration)을 유지 관리하고 있으며, 이는 처음부터 SwiftPM 통합을 설정하는 데에도 유용할 수 있습니다.

#### 에이전트 오케스트레이션(orchestration) 설정

JetBrains Air는 프로젝트의 여러 부분을 동시에 작업하는 여러 에이전트를 조정하여 작업 속도를 높일 수 있는 에이전트 오케스트레이션을 제공합니다.

<a as="button" href="https://air.dev/" mode="classic" icon="arrow-right" icon-position="right">Air 사용해 보기</a>

### UI 반복 수정

#### Figma를 활용한 UI 디자인 및 Compose 코드 생성

[Figma MCP 서버](https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server)를 사용하면 디자인을 Compose 코드로 변환하는 데 도움을 받을 수 있습니다.

디자인을 처음부터 생성하려는 경우 [Google Stitch](https://stitch.withgoogle.com/) 또는 [Figma Make](https://www.figma.com/make/)를 고려해 보세요.

#### Compose UI 작업에 Gemini CLI를 에이전트로 활용

[Flash 제품군](https://ai.google.dev/gemini-api/docs/models#gemini-3-stable) 모델을 포함한 Google 모델로 Compose 코드를 생성할 때 일관되게 좋은 결과가 나타나는 것을 확인했습니다. 생성 속도, 토큰 소모량, UI 품질 간의 균형이 뛰어납니다.

#### Compose Hot Reload를 사용한 UI 반복 수정

[Compose Hot Reload](compose-hot-reload.md)를 사용하면 개발자나 에이전트가 Compose 코드에서 변경한 사항이 거의 실시간으로 UI에 반영됩니다.

에이전트가 UI 작업을 원활하게 수행하도록 돕기 위해, 에이전트 구성에 [Compose Hot Reload MCP 서버](compose-hot-reload.md#mcp-server-for-ai-agents)를 추가할 수 있습니다. 이를 통해 에이전트가 직접 리로드를 트리거하고, 스크린샷을 찍고, UI와 상호 작용할 수도 있습니다.

## 학습 리소스 카탈로그

앞서 언급된 모든 리소스와 더불어 심층 가이드 및 서드파티 콘텐츠가 [학습 리소스](kmp-learning-resources.md) 페이지에 정리되어 있습니다.