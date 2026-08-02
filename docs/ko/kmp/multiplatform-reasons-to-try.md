[//]: # (title: Kotlin Multiplatform을 도입하고 프로젝트의 생산성을 높여야 하는 10가지 이유)

<web-summary>프로젝트에서 Kotlin Multiplatform을 사용해야 하는 10가지 이유를 알아보세요. 기업들의 실제 사례를 확인하고 멀티플랫폼 개발에 이 기술을 도입해 보세요.</web-summary>

오늘날의 다양한 기술 환경에서 개발자들은 여러 플랫폼에서 원활하게 작동하는 애플리케이션을 구축하는 동시에 개발 시간을 최적화하고 사용자 생산성을 높여야 하는 과제에 직면해 있습니다. Kotlin Multiplatform(KMP)은 여러 플랫폼용 앱을 만들 수 있는 솔루션을 제공하여, 네이티브 프로그래밍의 장점을 유지하면서 플랫폼 간 코드 재사용을 용이하게 합니다.

이 글에서는 개발자가 기존 프로젝트나 신규 프로젝트에서 Kotlin Multiplatform 사용을 고려해야 하는 10가지 이유와 KMP가 계속해서 큰 관심을 받는 이유를 살펴보겠습니다.

**도입률의 꾸준한 상승:** 최근 두 차례의 [개발자 에코시스템 설문조사(Developer Ecosystem surveys)](https://devecosystem-2025.jetbrains.com/)에 따르면, Kotlin Multiplatform 사용률은 2024년 7%에서 2025년 18%로 불과 1년 만에 두 배 이상 증가했습니다. 이러한 가파른 성장은 이 기술의 증가하는 모멘텀과 개발자들의 신뢰를 잘 보여줍니다.

![최근 두 차례의 개발자 에코시스템 설문조사 응답자 중 KMP 사용률이 2024년 7%에서 2025년 18%로 증가했습니다](kmp-growth-deveco.svg){width=700}

## 프로젝트에서 Kotlin Multiplatform을 사용해 봐야 하는 이유

개발 효율성을 높이고 싶거나 새로운 기술을 탐색 중이라면 이 글이 도움이 될 것입니다. 이 글에서는 개발 프로세스 간소화, 멀티플랫폼 지원, 강력한 도구 생태계 제공 등 Kotlin Multiplatform의 실질적인 이점들을 설명합니다. 또한 실제 기업들의 사례 연구도 확인할 수 있습니다.

1. [Kotlin Multiplatform은 코드 중복을 피하도록 도와줍니다](#1-kotlin-multiplatform-helps-you-avoid-code-duplication)
2. [Kotlin Multiplatform은 광범위한 플랫폼 목록을 지원합니다](#2-kotlin-multiplatform-supports-an-extensive-list-of-platforms)
3. [Kotlin은 간소화된 코드 공유 메커니즘을 제공합니다](#3-kotlin-provides-simplified-code-sharing-mechanisms)
4. [Kotlin Multiplatform은 유연한 멀티플랫폼 개발을 가능하게 합니다](#4-kotlin-multiplatform-allows-for-flexible-multiplatform-development)
5. [Kotlin Multiplatform 솔루션을 통해 UI 코드를 공유할 수 있습니다](#5-with-the-kotlin-multiplatform-solution-you-can-share-ui-code)
6. [기존 프로젝트와 신규 프로젝트 모두에서 Kotlin Multiplatform을 사용할 수 있습니다](#6-you-can-use-kotlin-multiplatform-in-existing-and-new-projects)
7. [Kotlin Multiplatform을 통해 코드를 점진적으로 공유하기 시작할 수 있습니다](#7-with-kotlin-multiplatform-you-can-start-sharing-your-code-gradually)
8. [Kotlin Multiplatform은 이미 글로벌 기업에서 사용되고 있습니다](#8-kotlin-multiplatform-is-already-used-by-global-companies)
9. [Kotlin Multiplatform은 강력한 도구 지원을 제공합니다](#9-kotlin-multiplatform-provides-powerful-tooling-support)
10. [Kotlin Multiplatform은 크고 협력적인 커뮤니티를 자랑합니다](#10-kotlin-multiplatform-boasts-a-large-and-supportive-community)

### 1. Kotlin Multiplatform은 코드 중복을 피하도록 도와줍니다

중국 최대의 검색 엔진인 바이두(Baidu)는 젊은 층을 타겟으로 한 애플리케이션인 _Wonder App_을 출시했습니다. 기존의 앱 개발 방식에서 그들이 겪었던 몇 가지 문제는 다음과 같았습니다.

* 앱 경험의 불일치: Android 앱이 iOS 앱과 다르게 작동했습니다.
* 비즈니스 로직 검증의 높은 비용: 동일한 비즈니스 로직을 사용하는 iOS 및 Android 개발자의 작업을 독립적으로 확인해야 했으므로 비용이 많이 들었습니다.
* 높은 업그레이드 및 유지 관리 비용: 비즈니스 로직을 중복으로 작성하는 것은 복잡하고 시간이 많이 걸려 앱의 업그레이드 및 유지 관리 비용이 증가했습니다.

바이두 팀은 Kotlin Multiplatform을 실험해 보기로 결정하고 데이터 모델, RESTful API 요청, JSON 데이터 파싱, 캐싱 로직 등 데이터 레이어를 통합하는 것부터 시작했습니다.

그 후, Kotlin Multiplatform으로 인터페이스 로직을 통합할 수 있는 Model-View-Intent(MVI) 사용자 인터페이스 패턴을 채택하기로 했습니다. 또한 로우레벨 데이터, 처리 로직 및 UI 처리 로직을 공유했습니다. 

이 실험은 매우 성공적이었으며 다음과 같은 결과를 얻었습니다.

* Android 및 iOS 앱 전반에서 일관된 경험 제공.
* 유지 관리 및 테스트 비용 절감.
* 팀 내 생산성 대폭 향상.

[![실제 Kotlin Multiplatform 사용 사례 살펴보기](kmp-use-cases-1.svg){width="500"}](https://kotlinlang.org/case-studies/)

### 2. Kotlin Multiplatform은 광범위한 플랫폼 목록을 지원합니다

Kotlin Multiplatform의 핵심 장점 중 하나는 다양한 플랫폼에 대한 광범위한 지원으로, 개발자에게 다재다능한 선택지를 제공한다는 점입니다. 지원되는 플랫폼에는 Android, iOS, 데스크톱, 웹(JavaScript 및 WebAssembly), 서버(Java Virtual Machine)가 포함됩니다.

퀴즈를 통해 학습과 연습을 돕는 인기 교육 플랫폼인 _Quizlet_은 Kotlin Multiplatform의 이점을 보여주는 또 다른 사례입니다. 이 플랫폼은 월간 약 5,000만 명의 활성 사용자를 보유하고 있으며, 그중 1,000만 명이 Android 사용자입니다. 이 앱은 Apple App Store의 교육 카테고리에서 상위 10위 안에 들어 있습니다.

Quizlet 팀은 JavaScript, React Native, C++, Rust, Go와 같은 기술들을 실험해 보았으나 성능, 안정성, 플랫폼별 구현 차이 등 다양한 문제에 직면했습니다. 결국 그들은 Android, iOS 및 웹을 위해 Kotlin Multiplatform을 선택했습니다. KMP 사용이 Quizlet 팀에 준 이점은 다음과 같습니다.

* 객체 마샬링(marshaling) 시 더욱 안전한 타입 중심(type-safe) API 제공.
* iOS에서 JavaScript 대비 25% 빠른 채점 알고리즘 구현.
* Android 앱 크기를 18MB에서 10MB로 줄임.
* 개발자 경험 향상.
* Android, iOS, 백엔드 및 웹 개발자를 포함한 팀원들의 공유 코드 작성에 대한 관심 증가.

[![Kotlin Multiplatform 시작하기](get-started-with-kmp.svg){width="500"}](get-started.topic)

### 3. Kotlin은 간소화된 코드 공유 메커니즘을 제공합니다

프로그래밍 언어의 세계에서 Kotlin은 실용적인 접근 방식으로 돋보이며, 다음과 같은 특징을 우선시합니다.

* **간결함보다 가독성**. 간결한 코드도 매력적이지만, Kotlin은 명확성이 가장 중요하다는 점을 이해하고 있습니다. 목표는 단순히 코드를 줄이는 것이 아니라 불필요한 상용구 코드(boilerplate)를 제거하여 가독성과 유지보수성을 높이는 것입니다.

* **표현력보다 코드 재사용**. 단순히 많은 문제를 해결하는 것이 아니라 패턴을 식별하고 재사용 가능한 라이브러리를 만드는 것이 중요합니다. 기존 솔루션을 활용하고 공통점을 추출함으로써 Kotlin은 개발자가 코드의 효율성을 극대화할 수 있도록 합니다.

* **독창성보다 상호운용성**. 바퀴를 새로 발명하는 대신 Kotlin은 Java와 같은 기존 언어와의 호환성을 수용합니다. 이러한 상호운용성은 방대한 Java 생태계와 원활하게 통합될 뿐만 아니라, 검증된 관행과 이전 경험에서 얻은 교훈을 쉽게 채택할 수 있게 해줍니다.

* **엄격함(soundness)보다 안전성 및 도구 지원**. Kotlin은 개발자가 오류를 조기에 발견하여 프로그램이 잘못된 상태에 빠지지 않도록 합니다. 컴파일 도중이나 IDE에서 코드를 작성하는 동안 문제를 감지함으로써 Kotlin은 소프트웨어의 신뢰성을 높이고 런타임 오류의 위험을 최소화합니다.

핵심은 가독성, 재사용성, 상호운용성 및 안전성에 대한 Kotlin의 강조가 개발자들에게 매력적인 선택이 되며 생산성을 높여준다는 점입니다.

### 4. Kotlin Multiplatform은 유연한 멀티플랫폼 개발을 가능하게 합니다

Kotlin Multiplatform을 사용하면 개발자는 더 이상 네이티브 개발과 크로스 플랫폼 개발 사이에서 고민할 필요가 없습니다. 무엇을 공유하고 무엇을 네이티브로 작성할지 선택할 수 있습니다.

Kotlin Multiplatform 이전에는 개발자가 모든 것을 네이티브로 작성해야 했습니다.

![Kotlin Multiplatform 이전: 모든 코드를 네이티브로 작성](kmp-before-new.svg){width=700}

Kotlin Multiplatform을 사용하면 프로젝트에 적합한 코드 공유 수준을 선택할 수 있습니다.

1) [로직과 UI 모두 공유](compose-multiplatform-create-first-app.md): 최대한의 재사용과 빠른 배포를 위해 비즈니스 및 프레젠테이션 로직뿐만 아니라 Kotlin Multiplatform과 [Compose Multiplatform](https://www.jetbrains.com/compose-multiplatform/)을 결합하여 사용자 인터페이스 코드까지 공유할 수 있습니다. 이를 통해 Android, iOS, 데스크톱 및 웹 전반에서 통합된 코드베이스를 유지하면서 필요에 따라 플랫폼별 API와 통합할 수 있습니다. 이 접근 방식은 개발을 간소화하고 플랫폼 간 일관된 동작을 보장합니다.

2) [네이티브 UI를 유지하면서 로직 공유](multiplatform-create-first-app.md): 플랫폼별 시각적 동작이나 UX 충실도가 우선순위라면 데이터 및 비즈니스 로직만 공유하도록 선택할 수 있습니다. 이 구조에서 각 플랫폼은 네이티브 UI 레이어를 유지하면서 공통적이고 일관된 로직 구현의 이점을 누릴 수 있습니다. 이 접근 방식은 기존 UI 워크플로우를 변경하지 않고 중복을 줄이려는 팀에 적합합니다.

3) [로직의 일부만 공유](multiplatform-ktor-sqldelight.md): 유효성 검사, 도메인 계산 또는 인증 흐름과 같이 특정 로직 하위 집합을 공유함으로써 Kotlin Multiplatform을 점진적으로 도입할 수 있습니다. 이 옵션은 큰 아키텍처 변경 없이 플랫폼 간 일관성과 안정성을 개선하고 싶을 때 유용합니다.

![Kotlin Multiplatform 및 Compose Multiplatform 사용 시: 개발자는 비즈니스 로직, 프레젠테리지 로직 또는 UI 로직까지 공유할 수 있습니다](kmp-after-new.svg){width=700}

이제 플랫폼 전용 코드를 제외하고 거의 모든 것을 공유할 수 있습니다.

### 5. Kotlin Multiplatform 솔루션을 통해 UI 코드를 공유할 수 있습니다

JetBrains는 Kotlin과 Jetpack Compose를 기반으로 Android(Jetpack Compose 경유), iOS, 데스크톱 및 웹(Beta)을 포함한 여러 플랫폼에서 사용자 인터페이스를 공유하기 위한 선언형 프레임워크인 [Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/)을 제공합니다.

이커머스 비즈니스에 특화된 라스트 마일 물류 플랫폼인 _Instabee_는 기술이 아직 알파 단계였을 때부터 Android 및 iOS 애플리케이션에 Compose Multiplatform을 사용하여 UI 로직을 공유하기 시작했습니다.

Android, iOS, 데스크톱 및 웹에서 실행되며 지도 및 카메라와 같은 네이티브 구성 요소와 통합된 [ImageViewer App](https://github.com/JetBrains/compose-multiplatform/tree/master/examples/imageviewer)이라는 공식 Compose Multiplatform 샘플이 있습니다. 또한 스마트워치 운영 체제인 Wear OS에서도 실행되는 [New York Times App](https://github.com/xxfast/NYTimes-KMP) 클론과 같은 커뮤니티 샘플도 있습니다. 더 많은 예제는 [Kotlin Multiplatform 및 Compose Multiplatform 샘플](multiplatform-samples.md) 목록을 확인해 보세요.

[![Compose Multiplatform 살펴보기](explore-compose.svg){width="500"}](https://www.jetbrains.com/compose-multiplatform/)

### 6. 기존 프로젝트와 신규 프로젝트 모두에서 Kotlin Multiplatform을 사용할 수 있습니다

다음 두 가지 시나리오를 살펴보겠습니다.

* **기존 프로젝트에서 KMP 사용하기**

  다시 한번 바이두의 Wonder App 사례를 들어보겠습니다. 팀은 이미 Android 및 iOS 앱을 보유하고 있었으며, 단지 로직을 통합했을 뿐입니다. 그들은 더 많은 라이브러리와 로직을 점진적으로 통합하기 시작했고, 결과적으로 플랫폼 간에 공유되는 통합 코드베이스를 달성했습니다.

* **신규 프로젝트에서 KMP 사용하기**

  온라인 플랫폼 및 소셜 미디어 웹사이트인 _9GAG_는 Flutter 및 React Native와 같은 다양한 기술을 시도했지만, 최종적으로 두 플랫폼 간에 앱의 동작을 일치시킬 수 있는 Kotlin Multiplatform을 선택했습니다. 그들은 먼저 Android 앱을 만드는 것으로 시작했습니다. 그런 다음 iOS에서 Kotlin Multiplatform 프로젝트를 의존성으로 사용했습니다.

### 7. Kotlin Multiplatform을 통해 코드를 점진적으로 공유하기 시작할 수 있습니다

상수와 같은 간단한 요소부터 시작하여 이메일 유효성 검사와 같은 공통 유틸리티를 점진적으로 마이그레이션하며 시작할 수 있습니다. 또한 트랜잭션 프로세스나 사용자 인증과 같은 비즈니스 로직을 작성하거나 마이그레이션할 수도 있습니다.

> Google 팀과 협력하여 Jetcaster를 예로 들어 실용적인 마이그레이션 가이드를 만들었습니다. 각 커밋이 작동하는 상태를 나타내는 레포지토리가 포함되어 있습니다.
> [Android에서 Kotlin Multiplatform으로 점진적으로 이동하는 방법 확인하기](migrate-android.md).
{style="note"}

### 8. Kotlin Multiplatform은 이미 글로벌 기업에서 사용되고 있습니다

KMP는 이미 Forbes, Philips, Cash App, Meetup, Autodesk를 비롯한 전 세계의 많은 대기업에서 사용되고 있습니다. [사례 연구 페이지](https://kotlinlang.org/case-studies/?type=multiplatform)에서 이들의 모든 이야기를 읽어볼 수 있습니다.

2023년 11월, JetBrains는 Kotlin Multiplatform이 Stable(안정화) 단계에 진입했다고 발표했으며, 이는 더 많은 기업과 팀이 이 기술에 관심을 갖게 했습니다. Google I/O 2024에서 Google은 Android와 iOS 간에 비즈니스 로직을 공유하기 위해 [Kotlin Multiplatform 사용을 공식 지원](https://android-developers.googleblog.com/2024/05/android-support-for-kotlin-multiplatform-to-share-business-logic-across-mobile-web-server-desktop.html)한다고 발표했습니다.

### 9. Kotlin Multiplatform은 강력한 도구 지원을 제공합니다

Kotlin Multiplatform 프로젝트를 작업할 때 강력한 도구를 활용할 수 있습니다.

* **IntelliJ IDEA**. IntelliJ IDEA 2025.2.2에서는 [Kotlin Multiplatform IDE 플러그인](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform?_gl=1*1bztzm5*_gcl_au*MTcxNzEyMzc1MS4xNzU5OTM3NDgz*_ga*MTM4NjAyOTM0NS4xNzM2ODUwMzA5*_ga_9J976DJZ68*czE3NjU4MDcyMzckbzkxJGcxJHQxNzY1ODA3MjM4JGo1OSRsMCRoMA..)을 설치할 수 있습니다. 이 플러그인은 iOS 앱에 대한 기본 실행 및 디버깅 기능, 사전 환경 점검(preflight environment checks) 및 기타 유용한 KMP 기능을 제공합니다.
* **Android Studio**. Android Studio는 Kotlin Multiplatform 개발을 위한 또 다른 안정적인 솔루션입니다. Android Studio Otter 2025.2.1에서는 동일한 Kotlin Multiplatform IDE 플러그인을 설치하여 기본적인 iOS 실행 및 디버깅 지원, 사전 환경 점검 및 추가적인 멀티플랫폼 도구를 사용할 수 있습니다.
* **Compose Hot Reload**: [Compose Hot Reload](compose-hot-reload.md)를 사용하면 Compose Multiplatform 프로젝트를 작업하는 동안 UI 변경 사항을 신속하게 반복하고 실험할 수 있습니다. 현재 데스크톱 타겟을 포함하고 Java 21 이하와 호환되는 프로젝트에서 사용할 수 있습니다.

![Compose Hot Reload](compose-hot-reload.animated.gif){width=500 preview-src="compose-hot-reload.png"}

* **Xcode**. Apple의 IDE는 Kotlin Multiplatform 앱의 iOS 부분을 만드는 데 사용할 수 있습니다. Xcode는 코딩, 디버깅 및 구성을 위한 수많은 도구를 제공하는 iOS 앱 개발의 표준입니다. 다만 Xcode는 Mac 전용입니다.

### 10. Kotlin Multiplatform은 크고 협력적인 커뮤니티를 자랑합니다

Kotlin과 Kotlin Multiplatform은 매우 협력적인 커뮤니티를 가지고 있습니다. 궁금한 점에 대한 답을 찾을 수 있는 몇 가지 장소는 다음과 같습니다.

* [Kotlinlang Slack 워크스페이스](https://slack-chats.kotlinlang.org/). 약 60,000명의 멤버가 활동 중이며, [#multiplatform](https://slack-chats.kotlinlang.org/c/multiplatform), [#compose](https://slack-chats.kotlinlang.org/c/compose), [#compose-ios](https://slack-chats.kotlinlang.org/c/compose-ios)와 같이 크로스 플랫폼 개발 전용 채널들이 있습니다.
* [Kotlin X](https://twitter.com/kotlin). 여기에서 전문가의 통찰력과 최신 뉴스, 그리고 수많은 멀티플랫폼 팁을 빠르게 확인할 수 있습니다.
* [Kotlin YouTube](https://www.youtube.com/channel/UCP7uiEZIqci43m22KDl0sNw). 저희 YouTube 채널은 시각적 자료를 선호하는 학습자를 위해 실용적인 튜토리얼, 전문가와의 라이브 스트리밍 및 기타 훌륭한 교육 콘텐츠를 제공합니다.
* [Kodee's Kotlin Roundup](https://lp.jetbrains.com/subscribe-to-kotlin-news/). 역동적인 Kotlin 및 Kotlin Multiplatform 생태계의 최신 업데이트를 놓치지 않으려면 정기 뉴스레터를 구독하세요!

Kotlin Multiplatform 생태계는 번창하고 있습니다. 전 세계 수많은 Kotlin 개발자들이 열정적으로 가꾸어 나가고 있습니다. 커뮤니티가 이 확장되는 생태계를 잘 탐색할 수 있도록 돕기 위해 [klibs.io](http://klibs.io)는 Kotlin Multiplatform 라이브러리의 큐레이션된 디렉토리를 제공하여 공통 사용 사례에 대한 신뢰할 수 있는 솔루션을 더 쉽게 찾을 수 있도록 돕고 있습니다.

다음은 연도별로 생성된 Kotlin Multiplatform 라이브러리 수를 보여주는 다이어그램입니다.

![연도별 생성된 Kotlin Multiplatform 라이브러리 수](kmp-libs-over-years.png){width=700}

보시는 바와 같이 2021년에 확실한 상승세가 있었으며, 라이브러리 수는 그 이후로도 멈추지 않고 계속 증가하고 있습니다.

## 왜 다른 크로스 플랫폼 기술 대신 Kotlin Multiplatform을 선택해야 할까요?

[다양한 크로스 플랫폼 솔루션](cross-platform-frameworks.topic) 중에서 선택할 때는 장단점을 모두 따져보는 것이 중요합니다. [React Native](kotlin-multiplatform-react-native.topic) 및 [Flutter](kotlin-multiplatform-flutter.md)를 포함한 다른 기술들과 Kotlin Multiplatform을 직접 비교한 자료도 살펴보실 수 있습니다.

Kotlin Multiplatform이 적합한 선택이 될 수 있는 주요 이유는 다음과 같습니다.

* **훌륭한 도구 지원, 쉬운 사용성**. Kotlin Multiplatform은 Kotlin을 기반으로 하여 개발자에게 훌륭한 도구와 사용 편의성을 제공합니다.
* **네이티브 프로그래밍**. 네이티브 방식으로 작성하기 쉽습니다. [expected 및 actual 선언](multiplatform-expect-actual.md) 덕분에 멀티플랫폼 앱이 플랫폼별 API에 액세스하도록 할 수 있습니다.
* **우수한 크로스 플랫폼 성능**. Kotlin으로 작성된 공유 코드는 각 타겟에 맞는 출력 형식(Android용 Java 바이트코드 및 iOS용 네이티브 바이너리)으로 컴파일되어 모든 플랫폼에서 우수한 성능을 보장합니다.
* **AI 기반 코드 생성**. 공유 코드와 플랫폼 전용 코드 전반에서 효율적인 워크플로우를 지원하는 JetBrains의 코딩 에이전트인 [Junie](https://www.jetbrains.com/junie/)를 통해 멀티플랫폼 개발 속도를 높일 수 있습니다.

Kotlin Multiplatform을 시도하기로 결정하셨다면 시작하는 데 도움이 될 몇 가지 팁을 소개합니다.

* **작게 시작하기**. 팀이 Kotlin Multiplatform의 워크플로우와 이점에 익숙해질 수 있도록 작은 공유 구성 요소나 상수부터 시작하세요.
* **계획 세우기**. 예상되는 결과와 구현 및 분석 방법에 대한 가설을 세워 명확한 실험 계획을 수립하세요. 공유 코드 기여를 위한 역할을 정의하고 변경 사항을 효과적으로 배포하기 위한 워크플로우를 구축하세요.
* **평가 및 회고 실행**. 팀과 함께 회고 회의를 진행하여 실험의 성공 여부를 평가하고 문제점이나 개선이 필요한 영역을 식별하세요. 실험이 성공적이었다면 범위를 확장하여 더 많은 코드를 공유할 수 있습니다. 그렇지 않다면 실험이 제대로 작동하지 않은 이유를 파악해야 합니다.

[![실제 작동하는 Kotlin Multiplatform 확인하기! 지금 시작하세요](see-kmp-in-action.svg){width="500"}](https://www.jetbrains.com/help/kotlin-multiplatform-dev/get-started.html)

팀이 Kotlin Multiplatform을 시작하도록 돕고 싶은 분들을 위해 실용적인 팁이 담긴 [상세 가이드](multiplatform-introduce-your-team.md)를 준비했습니다.

지금까지 살펴본 것처럼, Kotlin Multiplatform은 이미 많은 대기업에서 네이티브 프로그래밍의 장점을 유지하면서 코드를 효과적으로 재사용하고, 네이티브와 다름없는 UI를 갖춘 고성능 크로스 플랫폼 애플리케이션을 구축하는 데 성공적으로 사용되고 있습니다.