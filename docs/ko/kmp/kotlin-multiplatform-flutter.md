# Kotlin Multiplatform과 Flutter: 크로스 플랫폼 개발 솔루션

<web-summary>이 글에서는 Kotlin Multiplatform과 Flutter를 살펴보고, 각 기술의 기능을 이해하여 여러분의 크로스 플랫폼 프로젝트에 가장 적합한 선택을 내릴 수 있도록 돕습니다.</web-summary> 

기술이 빠르게 발전하는 환경에서 개발자들은 고품질 애플리케이션을 빌드하는 데 도움이 되는 효율적인 프레임워크와 도구를 끊임없이 찾고 있습니다. 하지만 여러 대안 중에서 선택할 때, 이른바 '최고의 옵션'을 찾는 것에 지나치게 얽매이지 않는 것이 중요합니다. 이러한 접근 방식이 항상 가장 적합한 선택으로 이어지는 것은 아니기 때문입니다.

모든 프로젝트는 고유하며 저마다의 특정 요구 사항이 있습니다. 이 글은 여러분이 선택지를 탐색하고, Kotlin Multiplatform이나 Flutter 중 어떤 기술이 프로젝트에 가장 적합한지 더 잘 이해하여 현명한 결정을 내릴 수 있도록 돕는 것을 목표로 합니다.

## 크로스 플랫폼 개발: 현대 애플리케이션 구축을 위한 통합된 접근 방식 {id="cross-platform-development-a-unified-approach-to-modern-application-building"}

크로스 플랫폼 개발은 단일 코드베이스로 여러 플랫폼에서 실행되는 애플리케이션을 빌드할 수 있는 방법을 제공하므로, 각 시스템마다 동일한 기능을 다시 작성할 필요가 없습니다. 크로스 플랫폼 개발은 흔히 Android와 iOS를 모두 타겟팅하는 [모바일 개발](cross-platform-mobile-development.topic)과 관련지어 생각하기 쉽지만, 모바일을 넘어 웹, 데스크톱, 심지어 서버 측 환경까지 확장됩니다.

핵심 아이디어는 필요한 경우 플랫폼별 기능을 여전히 구현할 수 있도록 보장하면서 코드 재사용을 극대화하여 개발 프로세스를 간소화하고 유지 관리 부담을 줄이는 것입니다. 개발팀은 개발 주기를 단축하고 비용을 절감하며 플랫폼 전반에서 일관성을 확보할 수 있으므로, 크로스 플랫폼 개발은 점점 더 다양해지는 오늘날의 애플리케이션 환경에서 현명한 선택이 됩니다.

## Kotlin Multiplatform과 Flutter: 플랫폼 전반의 개발 간소화 {id="kotlin-multiplatform-and-flutter-streamlining-development-across-platforms"}

Flutter와 Kotlin Multiplatform은 서로 다른 플랫폼 간의 애플리케이션 개발을 간소화해 주는 대표적인 두 가지 크로스 플랫폼 기술입니다.

### Flutter {id="flutter"}

[Flutter](https://flutter.dev/)는 단일 코드베이스에서 네이티브로 컴파일되는 멀티플랫폼 애플리케이션을 빌드하기 위한 오픈 소스 프레임워크입니다. 하나의 공유 앱 코드베이스를 통해 Android, iOS, 웹, 데스크톱(Windows, macOS, Linux) 및 임베디드 시스템 전반에서 풍부한 앱 경험을 구현할 수 있습니다. Flutter 앱은 Dart 프로그래밍 언어를 사용하여 작성됩니다. Flutter는 Google이 지원하고 사용합니다.

2014년 Sky라는 이름으로 처음 소개된 Flutter는 2018년 12월 Flutter Live 행사에서 [Flutter 1.0](https://developers.googleblog.com/en/flutter-10-googles-portable-ui-toolkit/)을 공식 발표했습니다.

Flutter 개발자 커뮤니티는 규모가 크고 매우 활발하여 지속적인 개선과 지원을 제공하고 있습니다. 또한 Flutter에서는 Flutter 및 Dart 생태계 내의 개발자들이 기여한 공유 패키지를 활용할 수 있습니다.

### Kotlin Multiplatform {id="kotlin-multiplatform"}

[Kotlin Multiplatform](https://www.jetbrains.com/kotlin-multiplatform/)(KMP)은 JetBrains가 개발한 오픈 소스 기술로, 개발자가 Android, iOS, 웹, 데스크톱(Windows, macOS, Linux) 및 서버 측 애플리케이션을 제작할 수 있도록 지원합니다. 네이티브 프로그래밍의 이점을 그대로 유지하면서 이러한 플랫폼 전반에서 Kotlin 코드를 효율적으로 재사용할 수 있습니다.

Kotlin Multiplatform을 사용하면 앱 진입점을 제외한 모든 코드를 공유하거나, 특정 로직(예: 네트워크 또는 데이터베이스 모듈) 하나만 공유하거나, UI는 네이티브로 유지하면서 비즈니스 로직만 공유하는 등 다양한 방식을 선택할 수 있습니다.

![Kotlin Multiplatform은 코드를 최대 100%까지 재사용할 수 있는 기술입니다](kmp-logic-and-ui.svg){ width="700" }

Kotlin Multiplatform은 2017년 Kotlin 1.2의 일부로 처음 소개되었습니다. 2023년 11월에 안정화(Stable) 단계에 도달했으며, Google I/O 2024에서 Google은 Android와 iOS 간의 비즈니스 로직 공유를 위한 [Kotlin Multiplatform 지원](https://android-developers.googleblog.com/2024/05/android-support-for-kotlin-multiplatform-to-share-business-logic-across-mobile-web-server-desktop.html)을 발표했습니다.

Kotlin Multiplatform의 전반적인 방향성에 대해 자세히 알아보려면 블로그 글인 [What’s Next for Kotlin Multiplatform and Compose Multiplatform](https://blog.jetbrains.com/kotlin/2025/08/kmp-roadmap-aug-2025/)을 확인해 보세요.

[![Kotlin Multiplatform 알아보기](discover-kmp.svg){width="500"}](https://www.jetbrains.com/kotlin-multiplatform/)

#### Compose Multiplatform {id="compose-multiplatform"}

Kotlin Multiplatform과 Google의 Jetpack Compose를 기반으로 구축된 JetBrains의 최신 선언형 프레임워크인 [Compose Multiplatform](https://www.jetbrains.com/compose-multiplatform/)을 사용하면 여러 플랫폼에 걸쳐 공유 UI 코드를 작성할 수 있습니다.

Compose Multiplatform은 현재 [iOS에서 안정화](https://blog.jetbrains.com/kotlin/2025/05/compose-multiplatform-1-8-0-released-compose-multiplatform-for-ios-is-stable-and-production-ready/)되었으며, Android 및 데스크톱에서도 안정적으로 지원되고 웹에서는 베타(Beta) 단계입니다.

[![Compose Multiplatform 살펴보기](explore-compose.svg){width="500"}](https://www.jetbrains.com/compose-multiplatform/)

별도의 전용 글에서 [Compose Multiplatform과 Jetpack Compose](compose-multiplatform-and-jetpack-compose.md) 간의 관계를 다루며 주요 차이점을 설명하고 있습니다.

### Kotlin Multiplatform과 Flutter: 개요 {id="kotlin-multiplatform-and-flutter-an-overview"}

<table style="both">
    
<tr>
<td></td>
        <td><b>Kotlin Multiplatform</b></td>
        <td><b>Flutter</b></td>
</tr>

    
<tr>
<td><b>개발사</b></td>
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
        <td>비즈니스 로직 및/또는 UI를 포함하여 코드베이스의 어느 부분이든 1%부터 100%까지 원하는 만큼 공유할 수 있습니다.</td>
        <td>애플리케이션의 모든 픽셀을 제어하여 모든 플랫폼에서 100% 코드를 공유하며 커스텀 및 반응형 디자인을 제작할 수 있습니다.</td>
</tr>

    
<tr>
<td><b>패키지, 의존성 및 생태계</b></td>
        <td><a href="https://central.sonatype.com/">Maven Central</a> 및 기타 저장소에서 패키지를 이용할 수 있습니다.
            <p>여기에는 KMP 라이브러리 검색을 간소화하도록 설계된 <a href="https://klibs.io">klibs.io</a>가 포함됩니다.</p>
            <p>이 <a href="https://github.com/terrakok/kmp-awesome">목록</a>에는 가장 인기 있는 KMP 라이브러리와 도구 일부가 정리되어 있습니다.</p> </td>
        <td><a href="https://pub.dev/">Pub.dev</a>에서 패키지를 이용할 수 있습니다.</td>
</tr>

    
<tr>
<td><b>빌드 도구</b></td>
        <td>Gradle (Apple 기기를 타겟팅하는 애플리케이션의 경우 Xcode 추가 사용).</td>
        <td>Flutter 커맨드 라인 도구 (내부적으로 Gradle 및 Xcode 사용).</td>
</tr>

    
<tr>
<td><b>코드 공유</b></td>
        <td>Android, iOS, 웹, 데스크톱 및 서버 측.</td>
        <td>Android, iOS, 웹, 데스크톱 및 임베디드 기기.</td>
</tr>

    
<tr>
<td><b>컴파일</b></td>
        <td>데스크톱 및 Android용 JVM 바이트코드, 웹용 JavaScript 또는 Wasm, 네이티브 플랫폼용 플랫폼별 바이너리로 컴파일됩니다.</td>
        <td>디버그 빌드는 가상 머신에서 Dart 코드를 실행합니다.
        <p>릴리스 빌드는 네이티브 플랫폼용 플랫폼별 바이너리와 웹용 JavaScript/Wasm을 출력합니다.</p>
        </td>
</tr>

    
<tr>
<td><b>네이티브 API와의 통신</b></td>
        <td><Links href="multiplatform-expect-actual.md" summary="">expect/actual 선언</Links>을 사용하여 Kotlin 코드에서 네이티브 API에 직접 접근할 수 있습니다.</td>
        <td><a href="https://docs.flutter.dev/platform-integration/platform-channels">플랫폼 채널(platform channels)</a>을 사용하여 호스트 플랫폼과 통신할 수 있습니다.</td>
</tr>

    
<tr>
<td><b>UI 렌더링</b></td>
        <td>OpenGL, ANGLE(OpenGL ES 2 또는 3 호출을 네이티브 API로 변환), Vulkan, Metal과 호환되는 Skia 엔진을 사용하며, Google의 Jetpack Compose를 기반으로 하는 <a href="https://www.jetbrains.com/compose-multiplatform/">Compose Multiplatform</a>을 사용하여 플랫폼 전반에서 UI를 공유할 수 있습니다.</td>
        <td>Flutter 위젯은 플랫폼과 기기에 따라 Metal, Vulkan 또는 OpenGL을 사용하여 GPU와 직접 통신하는 커스텀 <a href="https://docs.flutter.dev/perf/impeller">Impeller 엔진</a>을 통해 화면에 렌더링됩니다.</td>
</tr>

    
<tr>
<td><b>UI 개발 반복 속도</b></td>
        <td>공통 코드에서도 UI 미리보기를 지원합니다.
        <p><Links href="compose-hot-reload.md" summary="">Compose Hot Reload</Links>를 사용하면 앱을 재시작하거나 상태를 잃지 않고도 UI 변경 사항을 즉시 확인할 수 있습니다.</p></td>
        <td>VS Code 및 Android Studio용 IDE 플러그인이 제공됩니다.</td>
</tr>

    
<tr>
<td><b>해당 기술을 사용하는 기업</b></td>
        <td><a href="https://www.forbes.com/sites/forbes-engineering/2023/11/13/forbes-mobile-app-shifts-to-kotlin-multiplatform/">Forbes</a>, <a href="https://www.youtube.com/watch?v=z-o9MqN86eE">Todoist</a>, <a href="https://medium.com/mcdonalds-technical-blog/mobile-multiplatform-development-at-mcdonalds-3b72c8d44ebc">McDonald’s</a>, <a href="https://www.youtube.com/watch?v=5sOXv-X43vc">Google Workspace</a>, <a href="https://www.youtube.com/watch?v=hZPL8QqiLi8">Philips</a>, <a href="https://raymondctc.medium.com/adopting-kotlin-multiplatform-mobile-kmm-on-9gag-app-dfe526d9ce04">9gag</a>, <a href="https://kotlinlang.org/lp/multiplatform/case-studies/baidu">Baidu</a>, <a href="https://kotlinlang.org/lp/multiplatform/case-studies/autodesk/">Autodesk</a>, <a href="https://touchlab.co/">TouchLab</a>, <a href="https://www.youtube.com/watch?v=YsQ-2lQYQ8M">Instabee</a> 등이 있으며, 자세한 내용은 <a href="https://kotlinlang.org/case-studies/?type=multiplatform">KMP 도입 사례</a>에 나와 있습니다.</td>
        <td><a href="https://flutter.dev/showcase/xiaomi">Xiaomi</a>, <a href="https://flutter.dev/showcase/wolt">Wolt</a>, <a href="https://flutter.dev/showcase/universal-studios">Universal Studios</a>, <a href="https://flutter.dev/showcase/alibaba-group">Alibaba Group</a>, <a href="https://flutter.dev/showcase/bytedance">ByteDance</a>, <a href="https://www.geico.com/techblog/flutter-as-the-multi-channel-ux-framework/">Geico</a>, <a href="https://flutter.dev/showcase/ebay">eBay Motors</a>, <a href="https://flutter.dev/showcase/google-pay">Google Pay</a>, <a href="https://flutter.dev/showcase/so-vegan">So Vegan</a> 등이 있으며, 자세한 내용은 <a href="https://flutter.dev/showcase">Flutter Showcase</a>에 나와 있습니다.</td>
</tr>

</table>

[![크로스 플랫폼 개발을 위해 Kotlin Multiplatform을 활용하는 글로벌 기업의 실제 사용 사례를 살펴보세요.](kmp-use-cases-1.svg){width="500"}](https://www.jetbrains.com/help/kotlin-multiplatform-dev/case-studies.html)

프로젝트에 적합한 기술 스택을 선택하는 방법에 대한 가이드를 제공하는 Google의 블로그 게시물인 [Making Development Across Platforms Easier for Developers](https://developers.googleblog.com/en/making-development-across-platforms-easier-for-developers/)도 함께 확인할 수 있습니다.

Kotlin Multiplatform과 Flutter의 비교에 대해 더 자세히 알아보고 싶다면 Philipp Lackner의 [KMP vs. Flutter 영상](https://www.youtube.com/watch?v=dzog64ENKG0)을 시청해 보시기 바랍니다. 이 영상에서는 코드 공유, UI 렌더링, 성능 및 두 기술의 미래 관점에서 흥미로운 견해를 공유합니다.

구체적인 비즈니스 요구 사항, 목표, 작업 과제를 신중하게 평가함으로써, 필요한 요구 사항을 가장 잘 충족하는 크로스 플랫폼 솔루션을 찾아낼 수 있습니다.