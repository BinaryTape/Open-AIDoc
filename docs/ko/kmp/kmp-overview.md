[//]: # (title: Kotlin Multiplatform이란?)
[//]: # (description: Kotlin Multiplatform은 Android, iOS, 데스크톱, 웹, 서버 전반에서 코드를 공유할 수 있도록 지원하는 JetBrains의 오픈 소스 기술입니다.)

Kotlin Multiplatform(KMP)은 네이티브 개발의 장점을 유지하면서 Android, iOS, 데스크톱, 웹 및 서버 전반에서 코드를 공유할 수 있도록 지원하는 JetBrains의 오픈 소스 기술입니다.

Compose Multiplatform을 함께 사용하면 여러 플랫폼 간에 UI 코드까지 공유하여 코드 재사용성을 극대화할 수 있습니다.

## 기업들이 KMP를 선택하는 이유 {id="why-companies-choose-kmp"}

### 비용 효율성 및 빠른 출시 {id="cost-efficiency-and-faster-delivery"}

Kotlin Multiplatform은 기술적 프로세스와 조직적 프로세스를 모두 간소화하는 데 도움이 됩니다.

* 플랫폼 간에 로직과 UI 코드를 공유함으로써 중복 작업과 유지보수 비용을 줄일 수 있습니다. 또한 여러 플랫폼에 기능을 동시에 출시할 수 있습니다.
* 통일된 로직을 공유 코드에서 다룰 수 있어 팀 협업이 더 수월해지며, 팀원 간의 지식 공유가 쉬워지고 각 플랫폼 전담 팀 간의 중복 작업을 줄일 수 있습니다.

출시 시간(time to market) 단축 외에도, KMP 도입 후 사용자의 **55%**가 협업 개선을 경험했다고 답했으며, 팀의 **65%**가 성능 및 품질 향상을 보고했습니다(2024년 2분기 KMP 설문조사 기준).

KMP는 스타트업부터 글로벌 대기업에 이르기까지 다양한 규모의 조직에서 프로덕션 환경에 사용되고 있습니다. Google, Duolingo, Forbes, Philips, McDonald's, Bolt, H&M, Baidu, Kuaishou, Bilibili와 같은 기업들이 KMP의 유연성, 네이티브 성능, 네이티브 사용자 경험 제공 능력, 비용 효율성, 점진적 도입 지원 등의 이점 덕분에 KMP를 채택했습니다. [KMP를 도입한 기업 사례 자세히 알아보기](https://kotlinlang.org/case-studies/?type=multiplatform)

### 코드 공유의 유연성 {id="flexibility-of-code-sharing"}

원하는 방식대로 코드를 공유할 수 있습니다. 네트워킹이나 스토리지와 같은 독립된 모듈부터 공유하기 시작하여 시간이 지남에 따라 점진적으로 공유 코드를 확장할 수 있습니다.
UI는 네이티브로 유지하면서 모든 비즈니스 로직만 공유할 수도 있고, Compose Multiplatform을 사용하여 UI를 점진적으로 마이그레이션할 수도 있습니다.

![점진적인 KMP 도입을 보여주는 그림: 로직 일부만 공유하고 UI는 공유하지 않음, UI 없이 모든 로직 공유, 로직과 UI 모두 공유](kmp-graphic.png){width="700"}

### iOS에서의 네이티브 사용감 {id="native-feel-on-ios"}

SwiftUI나 UIKit을 사용하여 UI를 완전히 네이티브로 구축할 수도 있고, Compose Multiplatform으로 Android와 iOS 전반에서 일관된 경험을 만들 수도 있으며, 필요에 따라 네이티브 UI 코드와 공유 UI 코드를 유연하게 조합할 수도 있습니다.

어떤 방식을 선택하든 각 플랫폼에 맞는 네이티브한 느낌의 앱을 제작할 수 있습니다.

<video src="https://www.youtube.com/watch?v=LB5a2FRrT94" width="700"/>

### 네이티브 성능 {id="native-performance"}

Kotlin Multiplatform은 [Kotlin/Native](https://kotlinlang.org/docs/native-overview.html)를 활용하여 네이티브 바이너리를 생성하며, iOS와 같이 가상 머신(VM)을 사용할 수 없거나 바람직하지 않은 환경에서도 플랫폼 API에 직접 접근합니다.

이를 통해 플랫폼에 종속되지 않는 코드를 작성하면서도 네이티브에 준하는 성능을 달성할 수 있습니다.

![iPhone 13 및 iPhone 16의 iOS 환경에서 Compose Multiplatform과 SwiftUI의 유사한 성능을 보여주는 그래프](cmp-ios-performance.png){width="700"}

### 매끄러운 툴링 지원 {id="seamless-tooling"}

IntelliJ IDEA와 Android Studio는 [Kotlin Multiplatform IDE 플러그인](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)을 통해 KMP를 위한 스마트한 IDE 지원을 제공하며, 공통 UI 미리보기, [Compose Hot Reload](compose-hot-reload.md) 및 개발 편의성을 높여주는 다양한 기능을 포함하고 있습니다.

<video src="https://youtu.be/ACmerPEQAWA" width="700"/>

### AI 기반 개발 {id="ai-powered-development"}

JetBrains의 AI 코딩 에이전트인 [Junie](https://jetbrains.com/junie)에게 KMP 작업을 맡겨 팀의 개발 속도를 높여보세요.

## Kotlin Multiplatform 활용 사례 살펴보기 {id="discover-kotlin-multiplatform-use-cases"}

기업과 개발자들이 공유 Kotlin 코드를 통해 어떤 이점을 누리고 있는지 확인해 보세요.

* [사례 연구 페이지](https://kotlinlang.org/case-studies/?type=multiplatform)에서 기업들이 코드베이스에 KMP를 성공적으로 도입한 방법을 확인해 보세요.
* [엄선된 샘플 목록](multiplatform-samples.md) 및 GitHub의 [kotlin-multiplatform-sample](https://github.com/topics/kotlin-multiplatform-sample) 토픽에서 다양한 샘플 앱을 살펴보세요.

## 기본 사항 알아보기 {id="learn-the-basics"}

KMP가 실제로 어떻게 동작하는지 빠르게 확인하려면 [빠른 시작](quickstart.md)을 사용해 보세요.
환경을 설정하고 다양한 플랫폼에서 샘플 애플리케이션을 실행해 볼 수 있습니다.

사용 사례 선택하기
: * 플랫폼 간에 UI와 비즈니스 로직 코드를 모두 공유하는 앱을 만들려면 [공유 로직 및 UI 튜토리얼](compose-multiplatform-new-project.md)을 따르세요.
  * 기존 Android 앱을 멀티플랫폼 앱으로 전환하는 방법을 알아보려면 [마이그레이션 튜토리얼](multiplatform-integrate-in-existing-app.md)을 확인하세요.
  * UI 구현은 공유하지 않고 일부 코드만 공유하는 방법을 알아보려면 [공유 로직 튜토리얼](multiplatform-upgrade-app.md)을 따르세요.

기술 세부 정보 알아보기
: * [기본 프로젝트 구조](multiplatform-discover-project.md)부터 시작해 보세요.
  * 지원되는 [코드 공유 메커니즘](multiplatform-share-on-platforms.md)에 대해 알아보세요.
  * KMP 프로젝트에서 [종속성이 작동하는 방식](multiplatform-add-dependencies.md)을 확인하세요.
  * 다양한 [iOS 연동 방식](multiplatform-ios-integration-overview.md)을 고려해 보세요.
  * KMP가 다양한 타깃에 맞게 [코드를 컴파일](multiplatform-configure-compilations.md)하고 [바이너리를 빌드](multiplatform-build-native-binaries.md)하는 방법을 알아보세요.
  * [멀티플랫폼 앱 배포](multiplatform-publish-apps.md) 또는 [멀티플랫폼 라이브러리 배포](multiplatform-publish-lib-setup.md)에 대해 읽어보세요.

## Kotlin Multiplatform 라이브러리 생태계 탐색하기 {id="explore-the-kotlin-mutliplatform-library-ecosystem"}

네트워킹, 스토리지, 의존성 주입(DI), 테스팅, UI, 직렬화 등 수천 개의 멀티플랫폼 라이브러리를 사용할 수 있습니다.

JetBrains에서 관리하는 검색 플랫폼인 [klibs.io](https://klibs.io)에서 라이브러리를 둘러보세요.

## 대규모 조직에서의 Kotlin Multiplatform 도입 {id="adopt-kotlin-multiplatform-at-scale"}

팀에 크로스 플랫폼 프레임워크를 도입하는 것은 도전 과제가 될 수 있습니다.
크로스 플랫폼 개발의 이점과 잠재적 문제에 대한 해결책을 알아보려면 다음 개요 문서를 확인해 보세요.

* [크로스 플랫폼 모바일 개발이란 무엇인가요?](cross-platform-mobile-development.topic): 크로스 플랫폼 애플리케이션에 대한 다양한 접근 방식과 구현에 대한 개요를 제공합니다.
* [팀에 멀티플랫폼 모바일 개발을 도입하는 방법](multiplatform-introduce-your-team.md): 팀에 크로스 플랫폼 개발을 도입하기 위한 전략을 제시합니다.
* [Kotlin Multiplatform을 도입하여 프로젝트를 강화해야 하는 10가지 이유](multiplatform-reasons-to-try.md): 크로스 플랫폼 솔루션으로 Kotlin Multiplatform을 선택해야 하는 이유를 안내합니다.