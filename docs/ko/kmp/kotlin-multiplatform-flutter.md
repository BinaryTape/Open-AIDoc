# Kotlin Multiplatform 및 Flutter: 크로스 플랫폼 개발 솔루션

<web-summary>이 문서에서는 Kotlin Multiplatform과 Flutter를 살펴보고, 각 기술의 역량을 이해하며 여러분의 크로스 플랫폼 프로젝트에 적합한 선택을 할 수 있도록 돕습니다.</web-summary> 

기술이 빠르게 진화하는 세상에서 개발자들은 고품질 애플리케이션을 구축하는 데 도움이 되는 효율적인 프레임워크와 도구를 끊임없이 찾고 있습니다. 하지만 사용 가능한 선택지 중에서 고민할 때, 소위 '최고'의 옵션을 찾는 데 너무 치중하지 않는 것이 중요합니다. 이러한 접근 방식이 항상 가장 적합한 선택으로 이어지는 것은 아니기 때문입니다.

각 프로젝트는 고유하며 저마다의 특정 요구 사항이 있습니다. 이 문서의 목적은 여러분이 선택지를 탐색하고 Kotlin Multiplatform이나 Flutter와 같은 기술 중 어떤 것이 프로젝트에 가장 적합한지 더 잘 이해하여, 정보에 입각한 결정을 내릴 수 있도록 돕는 것입니다.

## 크로스 플랫폼 개발: 현대 애플리케이션 구축을 위한 통합된 접근 방식

크로스 플랫폼 개발은 단일 코드베이스로 여러 플랫폼에서 실행되는 애플리케이션을 구축하는 방법을 제공하며, 각 시스템마다 동일한 기능을 다시 작성할 필요가 없게 해줍니다. 흔히 [모바일 개발](cross-platform-mobile-development.topic)(Android와 iOS 모두 타겟팅)과 연관되지만, 이 방식은 모바일을 넘어 웹, 데스크톱, 심지어 서버 측 환경까지 광범위하게 적용됩니다.

핵심 아이디어는 코드 재사용을 극대화하면서도 필요한 경우 플랫폼별 기능을 여전히 구현할 수 있도록 보장하여, 개발 프로세스를 간소화하고 유지 관리 노력을 줄이는 것입니다. 팀은 개발 주기를 단축하고 비용을 절감하며 플랫폼 간의 일관성을 확보할 수 있으므로, 오늘날처럼 점점 더 다양해지는 애플리케이션 환경에서 크로스 플랫폼 개발은 현명한 선택이 됩니다.

## Kotlin Multiplatform 및 Flutter: 플랫폼 간 개발 간소화

Flutter와 Kotlin Multiplatform은 서로 다른 플랫폼에서 애플리케이션 개발을 단순화하는 두 가지 인기 있는 크로스 플랫폼 기술입니다.

### Flutter

[Flutter](https://flutter.dev/)는 단일 코드베이스에서 네이티브로 컴파일되는 멀티플랫폼 애플리케이션을 구축하기 위한 오픈 소스 프레임워크입니다. 하나의 공유된 앱 코드베이스로 Android, iOS, 웹, 데스크톱(Windows, macOS, Linux) 및 임베디드 시스템 전반에서 풍부한 앱 경험을 생성할 수 있습니다. Flutter 앱은 Dart 프로그래밍 언어를 사용하여 작성됩니다. Flutter는 Google이 지원하고 사용합니다.

2014년 Sky라는 이름으로 처음 소개된 [Flutter 1.0](https://developers.googleblog.com/en/flutter-10-googles-portable-ui-toolkit/)은 2018년 12월 Flutter Live 행사에서 공식적으로 발표되었습니다.

Flutter 개발자 커뮤니티는 규모가 크고 매우 활동적이며, 지속적인 개선과 지원을 제공합니다. Flutter는 Flutter 및 Dart 에코시스템 내의 개발자들이 기여한 공유 패키지를 사용할 수 있게 해줍니다.

### Kotlin Multiplatform

[Kotlin Multiplatform](https://www.jetbrains.com/kotlin-multiplatform/)(KMP)은 JetBrains가 구축한 오픈 소스 기술로, 개발자가 Android, iOS, 웹, 데스크톱(Windows, macOS, Linux) 및 서버 측용 애플리케이션을 제작할 수 있게 해줍니다. 이를 통해 네이티브 프로그래밍의 이점을 유지하면서 이러한 플랫폼 전반에서 Kotlin 코드를 효율적으로 재사용할 수 있습니다.

Kotlin Multiplatform을 사용하면 다양한 옵션을 선택할 수 있습니다. 앱 진입점을 제외한 모든 코드를 공유하거나, 특정 로직(네트워크 또는 데이터베이스 모듈 등)만 공유하거나, UI는 네이티브로 유지하면서 비즈니스 로직만 공유할 수도 있습니다.

![Kotlin Multiplatform은 코드를 최대 100%까지 재사용할 수 있는 기술입니다](kmp-logic-and-ui.svg){ width="700" }

Kotlin Multiplatform은 2017년 Kotlin 1.2의 일부로 처음 소개되었습니다. 2023년 11월에 Kotlin Multiplatform은 안정화(Stable) 단계에 접어들었습니다. Google I/O 2024 기간 동안 Google은 Android와 iOS 간의 비즈니스 로직 공유를 위한 [Kotlin Multiplatform 지원](https://android-developers.googleblog.com/2024/05/android-support-for-kotlin-multiplatform-to-share-business-logic-across-mobile-web-server-desktop.html)을 발표했습니다.

Kotlin Multiplatform의 전반적인 방향에 대해 더 자세히 알고 싶다면 블로그 포스트 [What’s Next for Kotlin Multiplatform and Compose Multiplatform](https://blog.jetbrains.com/kotlin/2025/08/kmp-roadmap-aug-2025/)을 확인해 보세요.

[![Kotlin Multiplatform 살펴보기](discover-kmp.svg){width="500"}](https://www.jetbrains.com/kotlin-multiplatform/)

#### Compose Multiplatform

JetBrains가 개발한 현대적인 선언형 프레임워크인 [Compose Multiplatform](https://www.jetbrains.com/compose-multiplatform/)을 사용하면 여러 플랫폼에서 공유 UI 코드를 작성할 수 있습니다. 이는 Kotlin Multiplatform과 Google의 Jetpack Compose를 기반으로 구축되었습니다.

Compose Multiplatform은 현재 [iOS](https://blog.jetbrains.com/kotlin/2025/05/compose-multiplatform-1-8-0-released-compose-multiplatform-for-ios-is-stable-and-production-ready/), Android, 데스크톱에서 안정화되었으며, 웹에서는 베타 단계입니다.

[![Compose Multiplatform 탐색하기](explore-compose.svg){width="500"}](https://www.jetbrains.com/compose-multiplatform/)

전용 아티클에서 [Compose Multiplatform과 Jetpack Compose](compose-multiplatform-and-jetpack-compose.md)의 관계와 주요 차이점을 개괄적으로 설명하고 있습니다.

### Kotlin Multiplatform 및 Flutter: 개요

<table style="both">
    
<tr>
<td></td>
        <td><b>Kotlin Multiplatform</b></td>
        <td><b>Flutter</b></td>
</tr>

    
<tr>
<td><b>제작사</b></td>
        <td>JetBrains</td>
        <td>Google</td>
</tr>

    
<tr>
<td><b>언어</b></td>
        <td>Kotlin</td>
        <td>Dart</td>
</tr>

    
<tr>
<td><b>유연성 및 코드 재사용</b></td>
        <td>비즈니스 로직 및/또는 UI를 포함하여 코드베이스의 원하는 부분(1%에서 100%까지)을 공유할 수 있습니다.</td>
        <td>애플리케이션의 모든 픽셀을 제어하여 맞춤형 및 적응형 디자인을 만들 수 있으며, 모든 플랫폼에서 100% 코드를 공유합니다.</td>
</tr>

    
<tr>
<td><b>패키지, 의존성 및 에코시스템</b></td>
        <td>패키지는 <a href="https://central.sonatype.com/">Maven Central</a> 및 기타 저장소에서 사용할 수 있습니다:
            <p><a href="https://klibs.io">klibs.io</a>: KMP 라이브러리 검색을 단순화하도록 설계되었습니다.</p>
            <p>이 <a href="https://github.com/terrakok/kmp-awesome">리스트</a>에는 가장 인기 있는 KMP 라이브러리와 도구들이 포함되어 있습니다.</p> </td>
        <td>패키지는 <a href="https://pub.dev/">Pub.dev.</a>에서 사용할 수 있습니다.</td>
</tr>

    
<tr>
<td><b>빌드 도구</b></td>
        <td>Gradle (Apple 장치를 타겟팅하는 애플리케이션의 경우 Xcode 추가 사용).</td>
        <td>Flutter 명령줄 도구 (내부적으로 Gradle과 Xcode를 사용).</td>
</tr>

    
<tr>
<td><b>코드 공유</b></td>
        <td>Android, iOS, 웹, 데스크톱 및 서버 측.</td>
        <td>Android, iOS, 웹, 데스크톱 및 임베디드 장치.</td>
</tr>

    
<tr>
<td><b>컴파일</b></td>
        <td>데스크톱 및 Android의 경우 JVM 바이트코드로, 웹의 경우 JavaScript 또는 Wasm으로, 네이티브 플랫폼의 경우 플랫폼별 바이너리로 컴파일됩니다.</td>
        <td>디버그 빌드는 가상 머신에서 Dart 코드를 실행합니다.
        <p>릴리스 빌드는 네이티브 플랫폼용 플랫폼별 바이너리를, 웹용으로는 JavaScript/Wasm을 출력합니다.</p>
        </td>
</tr>

    
<tr>
<td><b>네이티브 API와의 통신</b></td>
        <td>네이티브 API는 <Links href="/kmp/multiplatform-expect-actual" summary="undefined">expect/actual 선언</Links>을 사용하여 Kotlin 코드에서 직접 접근할 수 있습니다.</td>
        <td>호스트 플랫폼과의 통신은 <a href="https://docs.flutter.dev/platform-integration/platform-channels">플랫폼 채널(platform channels)</a>을 사용하여 가능합니다.</td>
</tr>

    
<tr>
<td><b>UI 렌더링</b></td>
        <td>Google의 Jetpack Compose를 기반으로 하는 <a href="https://www.jetbrains.com/compose-multiplatform/">Compose Multiplatform</a>을 사용하여 플랫폼 간에 UI를 공유할 수 있습니다. 이는 OpenGL, ANGLE (OpenGL ES 2 또는 3 호출을 네이티브 API로 변환), Vulkan, Metal과 호환되는 Skia 엔진을 사용합니다.</td>
        <td>Flutter 위젯은 커스텀 <a href="https://docs.flutter.dev/perf/impeller">Impeller 엔진</a>을 사용하여 화면에 렌더링됩니다. 이 엔진은 플랫폼과 장치에 따라 Metal, Vulkan 또는 OpenGL을 사용하여 GPU와 직접 통신합니다.</td>
</tr>

    
<tr>
<td><b>UI 개발 반복 주기</b></td>
        <td>공통 코드에서도 UI 프리뷰를 사용할 수 있습니다.
        <p><Links href="/kmp/compose-hot-reload" summary="undefined">Compose Hot Reload</Links>를 사용하면 앱을 재시작하거나 상태를 잃지 않고도 UI 변경 사항을 즉시 확인할 수 있습니다.</p></td>
        <td>VS Code 및 Android Studio용 IDE 플러그인을 사용할 수 있습니다.</td>
</tr>

    
<tr>
<td><b>해당 기술을 사용하는 기업</b></td>
        <td><a href="https://www.forbes.com/sites/forbes-engineering/2023/11/13/forbes-mobile-app-shifts-to-kotlin-multiplatform/">Forbes</a>, <a href="https://www.youtube.com/watch?v=z-o9MqN86eE">Todoist</a>, <a href="https://medium.com/mcdonalds-technical-blog/mobile-multiplatform-development-at-mcdonalds-3b72c8d44ebc">McDonald’s</a>, <a href="https://www.youtube.com/watch?v=5sOXv-X43vc">Google Workspace</a>, <a href="https://www.youtube.com/watch?v=hZPL8QqiLi8">Philips</a>, <a href="https://raymondctc.medium.com/adopting-kotlin-multiplatform-mobile-kmm-on-9gag-app-dfe526d9ce04">9gag</a>, <a href="https://kotlinlang.org/lp/multiplatform/case-studies/baidu">Baidu</a>, <a href="https://kotlinlang.org/lp/multiplatform/case-studies/autodesk/">Autodesk</a>, <a href="https://touchlab.co/">TouchLab</a>, <a href="https://www.youtube.com/watch?v=YsQ-2lQYQ8M">Instabee</a> 등 더 많은 사례가 <a href="https://kotlinlang.org/case-studies/?type=multiplatform">KMP 사례 연구</a>에 나열되어 있습니다.</td>
        <td><a href="https://flutter.dev/showcase/xiaomi">Xiaomi</a>, <a href="https://flutter.dev/showcase/wolt">Wolt</a>, <a href="https://flutter.dev/showcase/universal-studios">Universal Studios</a>, <a href="https://flutter.dev/showcase/alibaba-group">Alibaba Group</a>, <a href="https://flutter.dev/showcase/bytedance">ByteDance</a>, <a href="https://www.geico.com/techblog/flutter-as-the-multi-channel-ux-framework/">Geico</a>, <a href="https://flutter.dev/showcase/ebay">eBay Motors</a>, <a href="https://flutter.dev/showcase/google-pay">Google Pay</a>, <a href="https://flutter.dev/showcase/so-vegan">So Vegan</a> 등 더 많은 사례가 <a href="https://flutter.dev/showcase">Flutter Showcase</a>에 나열되어 있습니다.</td>
</tr>

</table>

[![크로스 플랫폼 개발을 위해 Kotlin Multiplatform을 활용하는 글로벌 기업들의 실제 사용 사례를 살펴보세요.](kmp-use-cases-1.svg){width="500"}](https://www.jetbrains.com/help/kotlin-multiplatform-dev/case-studies.html)

프로젝트에 적합한 기술 스택을 선택하는 방법에 대한 가이드를 제공하는 Google의 블로그 포스트 [Making Development Across Platforms Easier for Developers](https://developers.googleblog.com/en/making-development-across-platforms-easier-for-developers/)도 확인할 수 있습니다.

Kotlin Multiplatform과 Flutter 간의 추가 비교를 원하신다면, Philipp Lackner의 [KMP vs. Flutter 영상](https://www.youtube.com/watch?v=dzog64ENKG0)을 시청해 보세요. 이 영상에서 그는 코드 공유, UI 렌더링, 성능 및 두 기술의 미래 측면에서 흥미로운 관찰 결과를 공유합니다.

여러분의 구체적인 비즈니스 요구 사항, 목표 및 과제를 신중하게 평가함으로써, 요구 사항을 가장 잘 충족하는 크로스 플랫폼 솔루션을 식별할 수 있습니다.