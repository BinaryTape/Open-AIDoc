[//]: # (title: Kotlin Multiplatform을 도입하여 프로젝트 역량을 극대화해야 하는 10가지 이유)

<web-summary>프로젝트에서 Kotlin Multiplatform을 사용해야 하는 10가지 이유를 확인해 보세요. 실제 기업 사례를 살펴보고 멀티플랫폼 개발에 이 기술을 활용해 보세요.</web-summary>

오늘날 다변화된 기술 환경에서 개발자들은 개발 시간을 최적화하고 사용자 생산성을 높이는 동시에, 
다양한 플랫폼에서 원활하게 동작하는 애플리케이션을 구축해야 하는 과제에 직면해 있습니다. 
Kotlin Multiplatform(KMP)은 네이티브 프로그래밍의 장점을 유지하면서 플랫폼 간 코드 재사용을 용이하게 하여, 
여러 플랫폼을 위한 앱을 만들 수 있는 솔루션을 제공합니다.

이 글에서는 개발자가 기존 또는 신규 프로젝트에서 Kotlin Multiplatform 사용을 고려해야 하는 10가지 이유와, 
KMP가 계속해서 큰 주목을 받고 있는 이유를 살펴봅니다.

**지속적으로 증가하는 도입률:** 최근 두 차례의 [Developer Ecosystem 설문조사](https://devecosystem-2025.jetbrains.com/)에 따르면, Kotlin Multiplatform 사용률은 2024년 7%에서 2025년 18%로 불과 1년 만에 두 배 이상 증가했습니다. 이러한 빠른 성장은 이 기술이 얻고 있는 강력한 모멘텀과 개발자들의 높은 신뢰를 잘 보여줍니다.

![최근 두 차례의 Developer Ecosystem 설문조사 응답자 중 KMP 사용률이 2024년 7%에서 2025년 18%로 증가했습니다](kmp-growth-deveco.svg){width=700}

## 프로젝트에서 Kotlin Multiplatform을 사용해 보아야 하는 이유 {id="why-you-should-try-kotlin-multiplatform-in-your-projects"}

개발 효율성을 높이고 싶거나 새로운 기술을 탐색하고자 하는 분들에게 이 글이 도움이 될 것입니다.
여기서는 개발 간소화, 멀티플랫폼 지원, 강력한 툴링 생태계 제공 등 Kotlin Multiplatform의 몇 가지 실질적인 이점을 설명합니다.
또한 실제 기업들의 사례 연구도 확인할 수 있습니다.

1. [Kotlin Multiplatform은 코드 중복을 방지하는 데 도움이 됩니다](#1-kotlin-multiplatform-helps-you-avoid-code-duplication)
2. [Kotlin Multiplatform은 광범위한 플랫폼 목록을 지원합니다](#2-kotlin-multiplatform-supports-an-extensive-list-of-platforms)
3. [Kotlin은 간소화된 코드 공유 메커니즘을 제공합니다](#3-kotlin-provides-simplified-code-sharing-mechanisms)
4. [Kotlin Multiplatform은 유연한 멀티플랫폼 개발을 가능하게 합니다](#4-kotlin-multiplatform-allows-for-flexible-multiplatform-development)
5. [Kotlin Multiplatform 솔루션을 사용하면 UI 코드를 공유할 수 있습니다](#5-with-the-kotlin-multiplatform-solution-you-can-share-ui-code)
6. [Kotlin Multiplatform은 기존 프로젝트와 신규 프로젝트 모두에 사용할 수 있습니다](#6-you-can-use-kotlin-multiplatform-in-existing-and-new-projects)
7. [Kotlin Multiplatform을 사용하면 점진적으로 코드 공유를 시작할 수 있습니다](#7-with-kotlin-multiplatform-you-can-start-sharing-your-code-gradually)
8. [Kotlin Multiplatform은 이미 글로벌 기업들에서 사용되고 있습니다](#8-kotlin-multiplatform-is-already-used-by-global-companies)
9. [Kotlin Multiplatform은 강력한 도구 지원을 제공합니다](#9-kotlin-multiplatform-provides-powerful-tooling-support)
10. [Kotlin Multiplatform은 규모가 크고 협력적인 커뮤니티를 자랑합니다](#10-kotlin-multiplatform-boasts-a-large-and-supportive-community)

### 1. Kotlin Multiplatform은 코드 중복을 방지하는 데 도움이 됩니다 {id="1-kotlin-multiplatform-helps-you-avoid-code-duplication"}

중국 최대 검색 엔진인 바이두(Baidu)는 젊은 층을 타깃으로 한 애플리케이션인 _Wonder App_을 출시했습니다. 
그들이 전통적인 앱 개발 방식에서 겪었던 몇 가지 문제는 다음과 같습니다.

* 앱 경험의 불일치: Android 앱과 iOS 앱의 동작 방식이 달랐습니다.
* 비즈니스 로직 검증 비용 증가: 동일한 비즈니스 로직을 다루는 iOS 및 Android 개발자의 작업을 독립적으로 검증해야 했기 때문에 비용이 많이 들었습니다.
* 높은 업그레이드 및 유지보수 비용: 비즈니스 로직을 중복 구현하는 작업은 복잡하고 시간이 많이 소요되어 앱의 업그레이드 및 유지보수 비용이 증가했습니다.

바이두 팀은 Kotlin Multiplatform을 시험적으로 적용하기로 결정하고, 데이터 모델, RESTful API 요청, JSON 데이터 파싱, 캐싱 로직 등 데이터 레이어부터 통일하기 시작했습니다.

그 후 그들은 Kotlin Multiplatform을 통해 인터페이스 로직을 통일할 수 있는 MVI(Model-View-Intent) 사용자 인터페이스 패턴을 도입하기로 결정했습니다. 
또한 로우 레벨 데이터, 처리 로직, UI 처리 로직까지 공유했습니다.

이 실험은 매우 성공적이었으며 다음과 같은 결과를 얻었습니다.

* Android 및 iOS 앱 전반에서 일관된 경험 제공.
* 유지보수 및 테스트 비용 절감.
* 팀 내 생산성 대폭 향상.

[![실제 Kotlin Multiplatform 사용 사례 살펴보기](kmp-use-cases-1.svg){width="500"}](https://kotlinlang.org/case-studies/)

### 2. Kotlin Multiplatform은 광범위한 플랫폼 목록을 지원합니다 {id="2-kotlin-multiplatform-supports-an-extensive-list-of-platforms"}

Kotlin Multiplatform의 주요 장점 중 하나는 다양한 플랫폼에 대한 광범위한 지원으로, 개발자에게 다재다능한 선택지를 제공한다는 점입니다.
지원하는 플랫폼에는 Android, iOS, 데스크톱, 웹(JavaScript 및 WebAssembly), 서버(Java Virtual Machine)가 포함됩니다.

퀴즈를 통한 학습과 연습을 돕는 인기 교육 플랫폼인 _Quizlet_은 Kotlin Multiplatform의 이점을 잘 보여주는 또 다른 사례 연구입니다.
이 플랫폼은 월간 활성 사용자 수가 약 5천만 명에 달하며, 그중 1천만 명이 Android 사용자입니다. 
이 앱은 Apple App Store 교육 카테고리에서 상위 10위 안에 랭크되어 있습니다.

Quizlet 팀은 JavaScript, React Native, C++, Rust, Go와 같은 기술을 시험해 보았지만 성능, 안정성, 플랫폼별 구현 차이 등 다양한 문제에 직면했습니다. 
결국 그들은 Android, iOS, 웹을 위한 솔루션으로 Kotlin Multiplatform을 선택했습니다. 
KMP 사용을 통해 Quizlet 팀이 얻은 이점은 다음과 같습니다.

* 객체 마샬링 시 보다 타입 안전한(type-safe) API 확보.
* iOS에서 JavaScript 대비 채점 알고리즘 속도 25% 향상.
* Android 앱 크기를 18MB에서 10MB로 축소.
* 개발자 경험(DX) 향상.
* Android, iOS, 백엔드, 웹 개발자를 포함한 팀원들의 공유 코드 작성에 대한 관심 증대.

[![Kotlin Multiplatform 시작하기](get-started-with-kmp.svg){width="500"}](get-started.topic)

### 3. Kotlin은 간소화된 코드 공유 메커니즘을 제공합니다 {id="3-kotlin-provides-simplified-code-sharing-mechanisms"}

프로그래밍 언어의 세계에서 Kotlin은 실용적인(pragmatic) 접근 방식으로 두각을 나타내고 있으며, 이는 다음과 같은 특성을 우선시함을 의미합니다.

* **간결함보다 가독성(Readability over brevity)**. 간결한 코드도 매력적이지만, Kotlin은 명확성이 가장 중요하다는 점을 잘 알고 있습니다. 
  목표는 단순히 코드를 줄이는 것이 아니라 불필요한 보일러플레이트를 제거하여 가독성과 유지보수성을 높이는 것입니다.

* **단순한 표현력보다 코드 재사용(Code reuse over sheer expressiveness)**. 단순히 많은 문제를 해결하는 것만이 중요한 것이 아니라, 패턴을 식별하고 재사용 가능한 라이브러리를 만드는 것이 중요합니다. 
  기존 솔루션을 활용하고 공통점을 추출함으로써, Kotlin은 개발자가 코드 효율성을 극대화할 수 있도록 지원합니다.

* **독창성보다 상호 운용성(Interoperability over originality)**. 바퀴를 다시 발명하는 대신, 
  Kotlin은 Java와 같이 확립된 언어와의 호환성을 적극 수용합니다. 
  이러한 상호 운용성은 방대한 Java 생태계와의 원활한 통합을 가능하게 할 뿐만 아니라, 
  이전의 경험에서 얻은 검증된 프랙티스와 교훈을 쉽게 도입할 수 있도록 돕습니다.

* **완전성보다 안전성과 툴링(Safety and tooling over soundness)**. Kotlin을 사용하면 개발자가 오류를 조기에 발견하여 
  프로그램이 유효하지 않은 상태에 빠지지 않도록 할 수 있습니다. 
  컴파일 중이나 IDE에서 코드를 작성하는 동안 문제를 감지함으로써, 
  Kotlin은 소프트웨어 안정성을 향상시키고 런타임 오류의 위험을 최소화합니다.

핵심 요점은 가독성, 재사용성, 상호 운용성, 안전성을 강조하는 Kotlin의 특징이 개발자에게 매력적인 선택지가 되며 생산성을 높여준다는 것입니다.

### 4. Kotlin Multiplatform은 유연한 멀티플랫폼 개발을 가능하게 합니다 {id="4-kotlin-multiplatform-allows-for-flexible-multiplatform-development"}

Kotlin Multiplatform을 사용하면 개발자는 더 이상 네이티브 개발과 크로스 플랫폼 개발 사이에서 양자택일할 필요가 없습니다. 
무엇을 공유하고 무엇을 네이티브로 작성할지 직접 선택할 수 있습니다.

Kotlin Multiplatform 이전에는 개발자가 모든 것을 네이티브로 작성해야 했습니다.

![Kotlin Multiplatform 이전: 모든 코드를 네이티브로 작성](kmp-before-new.svg){width=700}

Kotlin Multiplatform을 사용하면 프로젝트에 적합한 코드 공유 수준을 선택할 수 있습니다.

1) [로직과 UI 모두 공유](compose-multiplatform-new-project.md): 최대한의 재사용과 빠른 배포를 위해, Kotlin Multiplatform과 [Compose Multiplatform](https://www.jetbrains.com/compose-multiplatform/)을 결합하여 비즈니스 및 프레젠테이션 로직뿐만 아니라 사용자 인터페이스 코드까지 공유할 수 있습니다. 이를 통해 필요한 경우 플랫폼별 API와 계속 통합하면서도 Android, iOS, 데스크톱, 웹 전반에서 통합된 코드베이스를 유지할 수 있습니다. 이 접근 방식은 개발을 간소화하고 플랫폼 전반에서 일관된 동작을 보장하는 데 도움이 됩니다.

2) [네이티브 UI를 유지하면서 로직만 공유](multiplatform-upgrade-app.md): 플랫폼 고유의 시각적 동작이나 UX 완성도가 최우선 과제인 경우, 데이터와 비즈니스 로직만 공유하도록 선택할 수 있습니다. 이러한 구조를 통해 각 플랫폼은 고유한 네이티브 UI 레이어를 유지하면서 공통의 일관된 로직 구현의 이점을 누릴 수 있습니다. 이 접근 방식은 기존 UI 워크플로를 변경하지 않고 중복을 줄이고자 하는 팀에 적합합니다.

3) [로직의 일부분만 공유](multiplatform-ktor-sqldelight.md): 유효성 검사, 도메인 계산 또는 인증 흐름과 같이 특정 로직 하위 집합을 공유함으로써 Kotlin Multiplatform을 점진적으로 도입할 수도 있습니다. 이 옵션은 대규모 아키텍처 변경 없이 플랫폼 전반의 일관성과 안정성을 개선하고자 할 때 적합합니다.

![Kotlin Multiplatform 및 Compose Multiplatform 사용 시: 개발자는 비즈니스 로직, 프레젠테이션 로직, 심지어 UI 로직까지 공유할 수 있습니다](kmp-after-new.svg){width=700}

이제 플랫폼별 코드를 제외한 거의 모든 것을 공유할 수 있습니다.

### 5. Kotlin Multiplatform 솔루션을 사용하면 UI 코드를 공유할 수 있습니다 {id="5-with-the-kotlin-multiplatform-solution-you-can-share-ui-code"}

JetBrains는 Kotlin 및 Jetpack Compose를 기반으로 Android(Jetpack Compose를 통해), iOS, 데스크톱, 웹(Beta)을 포함한 여러 플랫폼에서 사용자 인터페이스를 공유할 수 있는 선언형 프레임워크인 [Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/)을 제공합니다.

전자상거래 기업에 특화된 라스트마일 물류 플랫폼인 _Instabee_는 기술이 아직 알파 단계였을 때부터 Android 및 iOS 애플리케이션에 Compose Multiplatform을 사용하여 UI 로직을 공유하기 시작했습니다.

Android, iOS, 데스크톱, 웹에서 실행되며 지도 및 카메라와 같은 네이티브 컴포넌트와의 통합을 지원하는 공식 Compose Multiplatform 샘플인 [ImageViewer App](https://github.com/JetBrains/compose-multiplatform/tree/master/examples/imageviewer)이 있습니다.
또한 스마트워치 운영체제인 Wear OS에서도 실행되는 커뮤니티 샘플인 [New York Times App](https://github.com/xxfast/NYTimes-KMP) 클론도 있습니다. 
더 많은 예제를 확인하려면 [Kotlin Multiplatform 및 Compose Multiplatform 샘플](multiplatform-samples.md) 목록을 살펴보세요.

[![Compose Multiplatform 살펴보기](explore-compose.svg){width="500"}](https://www.jetbrains.com/compose-multiplatform/)

### 6. Kotlin Multiplatform은 기존 프로젝트와 신규 프로젝트 모두에 사용할 수 있습니다 {id="6-you-can-use-kotlin-multiplatform-in-existing-and-new-projects"}

다음의 두 가지 시나리오를 살펴보겠습니다.

* **기존 프로젝트에서 KMP 사용**

  바이두의 Wonder App 사례가 좋은 예입니다. 
  팀은 이미 Android와 iOS 앱을 보유하고 있었고, 로직만 통일했습니다. 
  점진적으로 더 많은 라이브러리와 로직을 통일하기 시작하여, 결국 여러 플랫폼에서 공유되는 단일 코드베이스를 구축했습니다.

* **신규 프로젝트에서 KMP 사용**

  온라인 플랫폼이자 소셜 미디어 웹사이트인 _9GAG_는 Flutter, React Native 등 다양한 기술을 시도해 보았으나, 
  최종적으로 두 플랫폼 간의 앱 동작을 일치시킬 수 있는 Kotlin Multiplatform을 선택했습니다. 
  그들은 먼저 Android 앱을 만드는 것부터 시작했습니다. 그런 다음 iOS에서 Kotlin Multiplatform 프로젝트를 의존성으로 가져와 사용했습니다.

### 7. Kotlin Multiplatform을 사용하면 점진적으로 코드 공유를 시작할 수 있습니다 {id="7-with-kotlin-multiplatform-you-can-start-sharing-your-code-gradually"}

상수와 같은 간단한 요소부터 시작하여 이메일 유효성 검사와 같은 공통 유틸리티를 점진적으로 마이그레이션하면서 단계적으로 진행할 수 있습니다.
또한 트랜잭션 처리나 사용자 인증과 같은 비즈니스 로직을 작성하거나 마이그레이션할 수도 있습니다.

> JetBrains는 Google 팀과 협력하여 Jetcaster를 예제로 삼아 각 커밋이 동작 가능한 상태를 나타내는 실용적인 마이그레이션 가이드를 제작했습니다. 
> [Android에서 Kotlin Multiplatform으로 점진적으로 이전하는 방법](migrate-from-android.md)을 확인해 보세요.
{style="note"}

### 8. Kotlin Multiplatform은 이미 글로벌 기업들에서 사용되고 있습니다 {id="8-kotlin-multiplatform-is-already-used-by-global-companies"}

KMP는 이미 Forbes, Philips, Cash App, Meetup, Autodesk 등 전 세계의 많은 대기업에서 사용하고 있습니다. [사례 연구 페이지](https://kotlinlang.org/case-studies/?type=multiplatform)에서 이들의 모든 스토리를 읽어보실 수 있습니다.

2023년 11월, JetBrains는 Kotlin Multiplatform이 안정화(Stable) 단계에 도달했다고 발표하여 
더 많은 기업과 팀의 관심을 끌었습니다. Google I/O 2024에서 Google은 Android와 iOS 간에 비즈니스 로직을 공유하기 위한 [Kotlin Multiplatform 공식 지원](https://android-developers.googleblog.com/2024/05/android-support-for-kotlin-multiplatform-to-share-business-logic-across-mobile-web-server-desktop.html)을 발표했습니다.

### 9. Kotlin Multiplatform은 강력한 도구 지원을 제공합니다 {id="9-kotlin-multiplatform-provides-powerful-tooling-support"}

Kotlin Multiplatform 프로젝트로 작업할 때 강력한 도구를 즉시 활용할 수 있습니다.

* **IntelliJ IDEA**: IntelliJ IDEA 2025.2.2부터는 [Kotlin Multiplatform IDE 플러그인](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform?_gl=1*1bztzm5*_gcl_au*MTcxNzEyMzc1MS4xNzU5OTM3NDgz*_ga*MTM4NjAyOTM0NS4xNzM2ODUwMzA5*_ga_9J976DJZ68*czE3NjU4MDcyMzckbzkxJGcxJHQxNzY1ODA3MjM4JGo1OSRsMCRoMA..)을 설치할 수 있습니다. 이 플러그인은 iOS 앱을 위한 기본 실행 및 디버깅 기능, 실행 전 환경 검사(preflight environment checks) 및 기타 유용한 KMP 기능을 제공합니다.
* **Android Studio**: Android Studio는 Kotlin Multiplatform 개발을 위한 또 다른 안정적인 솔루션입니다. Android Studio Otter 2025.2.1부터 동일한 Kotlin Multiplatform IDE 플러그인을 설치하여 기본적인 iOS 실행 및 디버깅 지원, 사전 환경 검사, 추가적인 멀티플랫폼 도구를 이용할 수 있습니다.
* **Compose Hot Reload**: [Compose Hot Reload](compose-hot-reload.md)를 사용하면 Compose Multiplatform 프로젝트를 작업하는 동안 UI 변경 사항을 빠르게 반복 적용하고 실험해 볼 수 있습니다. 현재 데스크톱 타깃을 포함하고 Java 21 이하 버전과 호환되는 프로젝트에서 사용할 수 있습니다.

![Compose Hot Reload](compose-hot-reload.animated.gif){width=500 preview-src="compose-hot-reload.png"}

* **Xcode**: Apple의 IDE를 사용하여 Kotlin Multiplatform 앱의 iOS 부분을 제작할 수 있습니다.
  Xcode는 코딩, 디버깅, 구성을 위한 풍부한 도구를 제공하는 iOS 앱 개발의 표준입니다.
  단, Xcode는 Mac에서만 실행할 수 있습니다.

### 10. Kotlin Multiplatform은 규모가 크고 협력적인 커뮤니티를 자랑합니다 {id="10-kotlin-multiplatform-boasts-a-large-and-supportive-community"}

Kotlin과 Kotlin Multiplatform은 매우 협력적인 커뮤니티를 갖추고 있습니다. 궁금한 점에 대한 답을 찾을 수 있는 몇 가지 채널은 다음과 같습니다.

* [Kotlinlang Slack 워크스페이스](https://slack-chats.kotlinlang.org/): 
  이 워크스페이스에는 약 6만 명의 회원이 참여하고 있으며, [#multiplatform](https://slack-chats.kotlinlang.org/c/multiplatform), [#compose](https://slack-chats.kotlinlang.org/c/compose), [#compose-ios](https://slack-chats.kotlinlang.org/c/compose-ios) 등 크로스 플랫폼 개발을 위한 유용한 전용 채널이 마련되어 있습니다.
* [Kotlin X](https://twitter.com/kotlin): 여기에서 빠른 전문가 인사이트와 수많은 멀티플랫폼 팁을 포함한 최신 소식을 확인할 수 있습니다.
* [Kotlin YouTube](https://www.youtube.com/channel/UCP7uiEZIqci43m22KDl0sNw): 
  공식 YouTube 채널에서는 시각적 학습자를 위한 실용적인 튜토리얼, 전문가와의 라이브 스트림, 기타 훌륭한 교육 콘텐츠를 제공합니다.
* [Kodee's Kotlin Roundup](https://lp.jetbrains.com/subscribe-to-kotlin-news/): 
  역동적인 Kotlin 및 Kotlin Multiplatform 생태계의 최신 업데이트를 놓치지 않고 확인하려면 정기 뉴스레터를 구독해 보세요!

Kotlin Multiplatform 생태계는 번창하고 있습니다. 전 세계 수많은 Kotlin 개발자들이 열정적으로 이 생태계를 발전시키고 있습니다.
커뮤니티가 이 확장되는 생태계를 쉽게 탐색할 수 있도록 [klibs.io](http://klibs.io)에서는 선별된 Kotlin Multiplatform 라이브러리 디렉터리를 제공하여 일반적인 사용 사례에 적합한 신뢰할 수 있는 솔루션을 더 쉽게 찾을 수 있도록 지원합니다.

다음은 연도별로 생성된 Kotlin Multiplatform 라이브러리 수를 보여주는 다이어그램입니다.

![연도별로 생성된 Kotlin Multiplatform 라이브러리 수](kmp-libs-over-years.png){width=700}

보시다시피 2021년에 뚜렷한 증가세가 있었으며, 이후 라이브러리 수는 끊임없이 증가하고 있습니다.

## 다른 크로스 플랫폼 기술 대신 Kotlin Multiplatform을 선택해야 하는 이유는 무엇일까요? {id="why-choose-kotlin-multiplatform-over-other-cross-platform-technologies"}

[다양한 크로스 플랫폼 솔루션](cross-platform-frameworks.topic) 중에서 선택할 때는 장점과 단점을 모두 면밀히 따져보는 것이 중요합니다. [React Native](kotlin-multiplatform-react-native.topic) 및 [Flutter](kotlin-multiplatform-flutter.md)를 포함한 다른 기술들과 Kotlin Multiplatform을 나란히 비교해 볼 수도 있습니다.

Kotlin Multiplatform이 여러분에게 올바른 선택이 될 수 있는 주요 이유는 다음과 같습니다.

* **뛰어난 도구 지원, 쉬운 사용성**: Kotlin Multiplatform은 Kotlin 언어를 기반으로 하여 개발자에게 뛰어난 툴링과 사용 편의성을 제공합니다.
* **네이티브 프로그래밍**: 네이티브 코드를 쉽게 작성할 수 있습니다.
  [expected 및 actual 선언](multiplatform-expect-actual.md) 덕분에 
  멀티플랫폼 앱에서 플랫폼별 API에 액세스할 수 있습니다.
* **탁월한 크로스 플랫폼 성능**: Kotlin으로 작성된 공유 코드는 플랫폼 타깃별로 다른 출력 형식(Android의 경우 Java 바이트코드, iOS의 경우 네이티브 바이너리)으로 컴파일되므로 모든 플랫폼에서 우수한 성능을 보장합니다.
* **AI 기반 코드 생성**: 공유 코드와 플랫폼별 코드 전반에서 보다 효율적인 워크플로를 지원하는 JetBrains의 코딩 에이전트인 [Junie](https://www.jetbrains.com/junie/) 기반의 코드 생성을 통해 멀티플랫폼 개발 속도를 높일 수 있습니다.

Kotlin Multiplatform을 사용해 보기로 결정했다면, 시작하는 데 도움이 되는 몇 가지 팁을 확인해 보세요.

* **작게 시작하세요**: 작은 공유 컴포넌트나 상수부터 시작하여 팀이 Kotlin Multiplatform의 워크플로와 이점에 익숙해지도록 하세요.
* **계획을 수립하세요**: 기대하는 결과와 구현 및 분석 방법에 대한 가설을 세우고 명확한 실험 계획을 개발하세요.
  공유 코드 기여 역할을 정의하고 변경 사항을 효과적으로 배포하기 위한 워크플로를 수립하세요.
* **평가하고 회고를 진행하세요**: 팀과 함께 회고 미팅을 진행하여 실험의 성공 여부를 평가하고 문제점이나 개선 영역을 파악하세요.
  실험이 성공적이었다면 범위를 넓혀 더 많은 코드를 공유할 수 있습니다.
  그렇지 않다면 이 실험이 성공하지 못한 이유를 명확히 파악해야 합니다.

[![Kotlin Multiplatform의 실제 작동 모습 살펴보기! 지금 시작하세요](see-kmp-in-action.svg){width="500"}](https://www.jetbrains.com/help/kotlin-multiplatform-dev/get-started.html)

팀이 Kotlin Multiplatform을 원활하게 시작할 수 있도록 돕고자 하는 분들을 위해 실용적인 팁이 담긴 [상세 가이드](multiplatform-introduce-your-team.md)를 준비했습니다.

보시다시피 Kotlin Multiplatform은 이미 수많은 대기업에서 네이티브 프로그래밍의 장점을 온전히 유지하면서도 플랫폼 간 코드를 효율적으로 재사용하고, 네이티브 수준의 UI를 갖춘 고성능 크로스 플랫폼 애플리케이션을 구축하는 데 성공적으로 활용되고 있습니다.