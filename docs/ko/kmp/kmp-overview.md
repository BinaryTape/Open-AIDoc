[//]: # (title: Kotlin Multiplatform이란 무엇인가요)
[//]: # (description: Kotlin Multiplatform은 Android, iOS, 데스크톱, 웹, 서버에서 코드를 공유할 수 있게 해주는 JetBrains의 오픈 소스 기술입니다.)

Kotlin Multiplatform(KMP)은 네이티브 개발의 장점을 유지하면서 Android, iOS, 데스크톱, 웹 및 서버 간에 코드를 공유할 수 있도록 지원하는 JetBrains의 오픈 소스 기술입니다.

Compose Multiplatform을 사용하면 여러 플랫폼에서 UI 코드도 공유할 수 있어 코드 재사용을 극대화할 수 있습니다.

## 기업들이 KMP를 선택하는 이유

### 비용 효율성 및 빠른 배포

Kotlin Multiplatform은 기술 및 조직 프로세스를 효율화하는 데 도움을 줍니다:

* 플랫폼 간에 로직과 UI 코드를 공유하여 중복을 줄이고 유지보수 비용을 절감할 수 있습니다. 또한 여러 플랫폼에서 기능을 동시에 출시할 수 있게 해줍니다.
* 공유 코드 내에서 통합된 로직에 접근할 수 있으므로 팀 간 협업이 쉬워지며, 팀원 간의 지식 전달이 용이해지고 전담 플랫폼 팀 간의 노력 중복을 줄일 수 있습니다.

시장 출시 기간(Time to market)을 단축할 뿐만 아니라, **55%**의 사용자가 KMP 도입 후 협업이 개선되었다고 응답했으며, **65%**의 팀이 성능과 품질이 향상되었다고 보고했습니다(2024년 2분기 KMP 설문조사 기준).

KMP는 스타트업부터 글로벌 기업에 이르기까지 모든 규모의 조직에서 실제 프로덕션에 사용되고 있습니다. 
Google, Duolingo, Forbes, Philips, McDonald's, Bolt, H&M, Baidu, Kuaishou, Bilibili와 같은 기업들은 유연성, 네이티브 성능, 네이티브 사용자 경험 제공 능력, 비용 효율성 및 점진적 도입 지원 등의 이유로 KMP를 채택했습니다. [KMP를 도입한 기업들에 대해 더 자세히 알아보세요](https://kotlinlang.org/case-studies/?type=multiplatform).

### 코드 공유의 유연성

원하는 방식으로 코드를 공유할 수 있습니다. 네트워킹이나 스토리지와 같은 독립된 모듈부터 공유하기 시작하여, 시간이 지남에 따라 공유 코드의 범위를 점진적으로 확장할 수 있습니다.
또한 UI는 네이티브로 유지하면서 모든 비즈니스 로직을 공유할 수도 있고, Compose Multiplatform을 사용하여 UI를 점진적으로 마이그레이션할 수도 있습니다.

![점진적 KMP 도입 예시: 로직 일부 공유 및 UI 미공유, UI 제외 모든 로직 공유, 로직 및 UI 모두 공유](kmp-graphic.png){width="700"}

### iOS에서의 네이티브 느낌

SwiftUI나 UIKit을 사용하여 UI를 완전히 빌드하거나, Compose Multiplatform으로 Android와 iOS에서 일관된 경험을 만들거나, 필요에 따라 네이티브 UI 코드와 공유 UI 코드를 혼합하여 사용할 수 있습니다.

어떤 방식을 선택하든 각 플랫폼에서 네이티브 앱처럼 느껴지는 앱을 제작할 수 있습니다: 

<video src="https://www.youtube.com/watch?v=LB5a2FRrT94" width="700"/>

### 네이티브 성능

Kotlin Multiplatform은 [Kotlin/Native](https://kotlinlang.org/docs/native-overview.html)를 활용하여 네이티브 바이너리를 생성하고, iOS와 같이 가상 머신(Virtual machine)을 사용하기 어렵거나 불가능한 환경에서도 플랫폼 API에 직접 접근합니다.

이를 통해 플랫폼에 구애받지 않는 코드를 작성하면서도 네이티브에 가까운 성능을 달성할 수 있습니다:

![iPhone 13 및 iPhone 16의 iOS 환경에서 Compose Multiplatform과 SwiftUI의 대등한 성능을 보여주는 그래프](cmp-ios-performance.png){width="700"}

### 원활한 도구 지원

IntelliJ IDEA와 Android Studio는 [Kotlin Multiplatform IDE 플러그인](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)을 통해 KMP를 위한 스마트한 IDE 기능을 지원합니다. 공통 UI 미리보기, [Compose Multiplatform을 위한 핫 리로드(hot reload)](compose-hot-reload.md), 언어 간 탐색, 리팩터링(Refactoring), 그리고 Kotlin과 Swift 코드 전반에 걸친 디버깅 기능을 제공합니다.

<video src="https://youtu.be/ACmerPEQAWA" width="700"/>

### AI 기반 개발

JetBrains의 AI 코딩 에이전트인 [Junie](https://jetbrains.com/junie)가 KMP 작업을 처리하도록 하여 팀이 더 빠르게 움직일 수 있게 하세요.

## Kotlin Multiplatform 활용 사례 살펴보기

기업과 개발자들이 공유 Kotlin 코드를 통해 얻고 있는 이점들을 확인해 보세요:

* [케이스 스터디 페이지](https://kotlinlang.org/case-studies/?type=multiplatform)에서 기업들이 기존 코드베이스에 KMP를 성공적으로 도입한 사례를 알아보세요.
* [엄선된 샘플 목록](multiplatform-samples.md)과 GitHub의 [kotlin-multiplatform-sample](https://github.com/topics/kotlin-multiplatform-sample) 토픽에서 다양한 샘플 앱을 확인해 보세요.

## 기본 사항 배우기

KMP가 실제로 작동하는 모습을 빠르게 확인하려면 [빠른 시작 가이드(Quickstart)](quickstart.md)를 시도해 보세요. 환경을 설정하고 다양한 플랫폼에서 샘플 애플리케이션을 실행해 볼 수 있습니다.

유스케이스 선택하기
: * 플랫폼 간에 UI와 비즈니스 로직 코드를 모두 공유하는 앱을 만들려면 [공유 로직 및 UI 튜토리얼](compose-multiplatform-create-first-app.md)을 따르세요.
  * Android 앱을 멀티플랫폼 앱으로 전환하는 방법을 알아보려면 [마이그레이션 튜토리얼](multiplatform-integrate-in-existing-app.md)을 확인하세요.
  * UI 구현은 공유하지 않고 일부 코드만 공유하는 방법을 알아보려면 [공유 로직 튜토리얼](multiplatform-create-first-app.md)을 따르세요.

기술적 세부 사항 살펴보기
: * [기본 프로젝트 구조](multiplatform-discover-project.md)부터 시작하세요.
  * 사용 가능한 [코드 공유 메커니즘](multiplatform-share-on-platforms.md)에 대해 알아보세요.
  * KMP 프로젝트에서 [의존성이 어떻게 작동하는지](multiplatform-add-dependencies.md) 확인하세요.
  * 다양한 [iOS 통합 방법](multiplatform-ios-integration-overview.md)을 고려해 보세요.
  * KMP가 다양한 타겟에 대해 코드를 [컴파일](multiplatform-configure-compilations.md)하고 [네이티브 바이너리를 빌드](multiplatform-build-native-binaries.md)하는 방법을 알아보세요.
  * [멀티플랫폼 앱 출시](multiplatform-publish-apps.md) 또는 [멀티플랫폼 라이브러리 출시](multiplatform-publish-lib-setup.md)에 대해 읽어보세요. 

## Kotlin Multiplatform 라이브러리 생태계 살펴보기

네트워킹, 스토리지, 의존성 주입(Dependency Injection), 테스트, UI, 직렬화(Serialization) 등을 위한 수천 개의 멀티플랫폼 라이브러리를 사용할 수 있습니다.

JetBrains에서 관리하는 검색 플랫폼인 [klibs.io](https://klibs.io)에서 라이브러리들을 찾아보세요.

## 대규모 Kotlin Multiplatform 도입

팀에 크로스 플랫폼 프레임워크를 도입하는 것은 도전적인 과제가 될 수 있습니다. 크로스 플랫폼 개발의 이점과 잠재적 문제에 대한 해결책을 알아보려면 다음의 고수준 개요를 살펴보세요:

* [크로스 플랫폼 모바일 개발이란 무엇인가요?](cross-platform-mobile-development.topic): 크로스 플랫폼 애플리케이션을 위한 다양한 접근 방식과 구현에 대한 개요를 제공합니다.
* [팀에 멀티플랫폼 모바일 개발을 도입하는 방법](multiplatform-introduce-your-team.md): 팀에 크로스 플랫폼 개발을 도입하기 위한 전략을 제안합니다.
* [Kotlin Multiplatform을 도입하여 프로젝트를 강화해야 하는 10가지 이유](multiplatform-reasons-to-try.md): 크로스 플랫폼 솔루션으로 Kotlin Multiplatform을 채택해야 하는 이유들을 나열합니다.