[//]: # (title: 학습 자료)

<web-summary>자신의 KMP 경험 수준에 가장 적합한 학습 자료를 선택하세요.</web-summary>

30개 이상의 필수 Kotlin Multiplatform (KMP) 및 Compose Multiplatform 학습 자료를 모았습니다. 실력 수준별로 탐색하여 자신의 경험에 맞는 튜토리얼, 강좌, 아티클을 찾아보세요.

🌱 **초급**. JetBrains와 Google의 공식 튜토리얼을 통해 KMP 및 Compose의 기초를 배웁니다. Room, Ktor, SQLDelight와 같은 핵심 라이브러리를 사용하여 간단한 앱을 제작해 보세요.

🌿 **중급**. 공통 ViewModel, Koin 기반의 의존성 주입(Dependency Injection), 클린 아키텍처(Clean Architecture)를 활용하여 실전 앱을 개발합니다. JetBrains 및 커뮤니티 교육자들이 제공하는 강좌를 통해 학습해 보세요.

🌳 **고급**. 백엔드 및 게임 개발을 위한 본격적인 KMP 엔지니어링으로 나아가며, 대규모 멀티팀 프로젝트를 위한 아키텍처 확장 및 도입 가이드를 다룹니다.

🧩 **라이브러리 제작자**. 재사용 가능한 KMP 라이브러리를 제작하고 배포합니다. JetBrains 공식 툴링과 템플릿을 활용하여 API 설계, Dokka 문서화, Maven 배포를 배웁니다.

<Tabs>
<TabItem id="all-resources" title="전체">

<snippet id="source">
<table>

<!-- BEGINNER BLOCK -->
<thead>

<tr>
<th>

**🎚**

</th>
<th>

**자료 /**

**유형**

</th>
<th>

**제작자 /**
**플랫폼**

</th>

<th>

**학습 내용**

</th>
<th>

**비용**

</th>
<th>

**예상 소요 시간**

</th>
</tr>

</thead>

<tr filter="beginner">
<td>
🌱
</td>
<td>

[Kotlin Multiplatform Overview](kmp-overview.md)

아티클

</td>
<td>
JetBrains
</td>

<td>
KMP의 핵심 가치, 실제 활용 사례, 그리고 올바른 학습 경로를 선택하기 위한 가이드를 다룹니다.
</td>
<td>
무료
</td>
<td>
30분
</td>
</tr>

<tr filter="beginner">
<td>
🌱
</td>
<td>

[Create Your First KMP App](multiplatform-upgrade-app.md)

튜토리얼

</td>
<td>
JetBrains
</td>

<td>
KMP 프로젝트를 설정하고 UI는 완전한 네이티브로 유지하면서 Android와 iOS 간에 간단한 비즈니스 로직을 공유하는 방법을 배웁니다.
</td>
<td>
무료
</td>
<td>
1–2시간
</td>
</tr>

<tr filter="beginner">
<td>
🌱
</td>
<td>

[Get Started With Kotlin Multiplatform (Google Codelab)](https://developer.android.com/codelabs/kmp-get-started)

튜토리얼

</td>
<td>
Google

Android
</td>

<td>
기존 Android 프로젝트에 공유 KMP 모듈을 추가하고 iOS와 통합하는 방법을 배웁니다. SKIE 플러그인을 사용하여 Kotlin 코드로부터 관용적인(idiomatic) Swift API를 생성하는 방법도 다룹니다.
</td>
<td>
무료
</td>
<td>
1–2시간
</td>
</tr>

<tr filter="beginner">
<td>
🌱
</td>
<td>

[Create Your First Compose Multiplatform App](compose-multiplatform-new-project.md)

튜토리얼

</td>
<td>
JetBrains
</td>

<td>
기초부터 완전한 Compose Multiplatform 앱을 구축하는 방법을 배웁니다. 단순한 템플릿에서 시작하여 Android, iOS, 데스크톱, 웹에서 실행되는 기능적인 시간대(time zone) 앱으로 발전시키며 핵심 UI 컴포넌트, 상태 관리, 리소스 처리를 다룹니다.
</td>
<td>
무료
</td>
<td>
2–3시간
</td>
</tr>

<tr filter="beginner">
<td>
🌱
</td>
<td>

[Create a Multiplatform App Using Ktor and SQLDelight](multiplatform-ktor-sqldelight.md)

튜토리얼

</td>
<td>
JetBrains
</td>

<td>
네트워킹을 위한 Ktor와 로컬 데이터베이스를 위한 SQLDelight를 사용하여 공유 데이터 계층을 구축하고, 이를 Android의 Jetpack Compose 및 iOS의 SwiftUI로 빌드된 네이티브 UI에 연결하는 방법을 배웁니다.
</td>
<td>
무료
</td>
<td>
4–6시간
</td>
</tr>

<tr filter="beginner">
<td>
🌱
</td>
<td>

[Expected and Actual Declarations](multiplatform-expect-actual.md)

아티클

</td>
<td>
JetBrains
</td>

<td>
공통 코드에서 플랫폼별 API에 접근하기 위한 핵심 expect/actual 메커니즘을 함수, 프로퍼티, 클래스 활용 등 다양한 전략과 함께 살펴봅니다.
</td>
<td>
무료
</td>
<td>
1–2시간
</td>
</tr>

<tr filter="beginner">
<td>
🌱
</td>
<td>

[Using Platform-Specific APIs in KMP Apps](https://www.youtube.com/watch?v=bSNumV04y_w)

동영상 튜토리얼

</td>
<td>
JetBrains

YouTube
</td>

<td>
KMP 앱에서 플랫폼별 코드를 사용하기 위한 모범 사례를 배웁니다.
</td>
<td>
무료
</td>
<td>
15분
</td>
</tr>

<tr filter="beginner">
<td>
🌱
</td>
<td>

[KMP for Android Developers](https://learnkmp.com/)

동영상 강좌

</td>
<td>
Mykola Miroshnychenko

PayHip
</td>

<td>
expect/actual 및 소스 세트와 같은 KMP 기본기를 익히고 네트워킹을 위한 Ktor, 의존성 주입을 위한 Koin, Nav3, 영속성을 위한 Room 등 최신 라이브러리를 사용하여 완전한 앱 스택을 구축함으로써 기존 Android 개발 역량을 iOS로 확장하는 방법을 배웁니다.
</td>
<td>
$39
</td>
<td>
8–12시간
</td>
</tr>

<tr filter="beginner">
<td>
🌱
</td>
<td>

[Kotlin Multiplatform Masterclass](https://www.udemy.com/course/kotlin-multiplatform-masterclass/)

동영상 강좌

</td>
<td>
Petros Efthymiou

Udemy
</td>

<td>
클린 아키텍처와 MVI를 기초부터 적용하여 완전한 KMP 애플리케이션을 구축하고, 필수 라이브러리 풀스택(Ktor, SQLDelight, Koin)을 네이티브 Jetpack Compose 및 SwiftUI UI와 통합하는 방법을 배웁니다.
</td>
<td>
€10–€20
</td>
<td>
6시간
</td>
</tr>

<tr filter="beginner">
<td>
🌱
</td>
<td>

[Compose Multiplatform Full Course 2025 | Zero to Hero](https://www.youtube.com/watch?v=Z92zJzL-6z0&list=PL0pXjGnY7PORAoIX2q7YG2sotapCp4hyl)

동영상 강좌

</td>
<td>
Code with FK

YouTube
</td>

<td>
Compose Multiplatform만을 사용하여 기능이 풍부한 완전한 애플리케이션을 구축하는 방법을 배웁니다. 기초부터 시작하여 Firebase Authentication, SQLDelight를 이용한 오프라인 지원, 실시간 업데이트와 같은 고급 실전 기능까지 다룹니다.
</td>
<td>
무료
</td>
<td>
20시간
</td>
</tr>

<tr filter="beginner">
<td>
🌱
</td>
<td>

[Kotlin Multiplatform Development](https://www.linkedin.com/learning/kotlin-multiplatform-development)

동영상 강좌

</td>
<td>
Colin Lee

LinkedIn Learning
</td>

<td>
Compose Multiplatform과 네이티브 UI 간의 아키텍처적 선택, Swift 상호 운용성의 기본기, 그리고 네트워킹, 영속성, 의존성 주입을 위한 필수 KMP 생태계에 대한 포괄적인 개요를 다룹니다.
</td>
<td>
월 약 $30–$40
</td>
<td>
3시간
</td>
</tr>

<tr filter="beginner">
<td>
🌱
</td>
<td>

[Kotlin Multiplatform by Tutorials (Third Edition)](https://www.kodeco.com/books/kotlin-multiplatform-by-tutorials/v3.0)

도서

</td>
<td>
Kodeco Team (Kevin D. Moore, Carlos Mota, Saeed Taheri)
</td>

<td>
네이티브 UI를 네트워킹, 직렬화, 영속성을 담당하는 KMP 공유 모듈에 연결하여 코드를 공유하는 기초를 다룹니다. 또한 유지보수 가능하고 확장성 있는 실전 앱을 만들기 위해 의존성 주입, 테스트, 최신 아키텍처를 적용하는 방법도 살펴봅니다.
</td>
<td>
약 $60
</td>
<td>
40–60시간
</td>
</tr>

<!-- END OF BEGINNER BLOCK -->

<!-- INTERMEDIATE BLOCK -->

<tr filter="intermediate">
<td>
🌿
</td>
<td>

[Make Your Android Application Work on iOS](multiplatform-integrate-in-existing-app.md)

튜토리얼

</td>
<td>
JetBrains
</td>

<td>
기존 Android 앱의 비즈니스 로직을 추출하여 기존 Android 앱과 새로운 네이티브 iOS 프로젝트 모두에서 사용할 수 있는 공유 모듈로 전환함으로써 KMP로 마이그레이션하는 실무 단계를 다룹니다.
</td>
<td>
무료
</td>
<td>
2시간
</td>
</tr>

<tr filter="intermediate">
<td>
🌿
</td>
<td>

[Migrate Existing Apps to Room KMP (Google Codelab)](https://developer.android.com/codelabs/kmp-migrate-room)

튜토리얼

</td>
<td>
Google

Android
</td>

<td>
기존 Android Room 데이터베이스를 공유 KMP 모듈로 마이그레이션하여 익숙한 DAO와 엔티티를 Android와 iOS 모두에서 재사용하는 방법을 배웁니다.
</td>
<td>
무료
</td>
<td>
2시간
</td>
</tr>

<tr filter="intermediate">
<td>
🌿
</td>
<td>

[How to Share ViewModels in Compose Multiplatform (with Dependency Injection!)](https://www.youtube.com/watch?v=O85qOS7U3XQ)

동영상 튜토리얼

</td>
<td>
Philipp Lackner

YouTube
</td>

<td>
Compose Multiplatform 프로젝트에서 의존성 주입을 위해 Koin을 사용하여 공유 ViewModel을 구현하고, 상태 관리 로직을 한 번만 작성하는 방법을 배웁니다.
</td>
<td>
무료
</td>
<td>
30분
</td>
</tr>

<tr filter="intermediate">
<td>
🌿
</td>
<td>

[The Compose Multiplatform Crash Course 2025](https://www.youtube.com/watch?v=WT9-4DXUqsM)

동영상 강좌

</td>
<td>
Philipp Lackner

YouTube
</td>

<td>
클린 아키텍처를 활용하여 프로덕션 환경에 바로 적용할 수 있는 완전한 전자책 읽기 앱을 기초부터 구축하는 방법을 배웁니다. 네트워킹을 위한 Ktor, 로컬 데이터베이스를 위한 Room, 의존성 주입을 위한 Koin, 멀티플랫폼 내비게이션을 포함한 최신 KMP 스택을 다룹니다.
</td>
<td>
무료
</td>
<td>
5시간
</td>
</tr>

<tr filter="intermediate">
<td>
🌿
</td>
<td>

[Building Industry-Level Multiplatform Apps With KMP](https://pl-coding.com/kmp/)

동영상 강좌

</td>
<td>
Philipp Lackner

[pl.coding.com](https://pl-coding.com/)

</td>

<td>
네이티브 UI(Jetpack Compose 및 SwiftUI) 간에 ViewModel과 비즈니스 로직을 공유하여 실제 상용 수준의 번역 앱을 구축하는 방법을 배웁니다. 클린 아키텍처부터 양대 플랫폼을 위한 단위, UI 및 E2E 테스트에 이르기까지 전체 개발 수명 주기를 다룹니다.
</td>
<td>
약 €99
</td>
<td>
20시간
</td>
</tr>

<tr filter="intermediate">
<td>
🌿
</td>
<td>

[Building Industry-Level Compose Multiplatform Android and iOS Apps](https://pl-coding.com/cmp-mobile)

동영상 강좌

</td>
<td>
Philipp Lackner

[pl.coding.com](https://pl-coding.com/)

</td>

<td>
실시간 WebSocket을 위한 Ktor, 로컬 영속성을 위한 Room, 멀티모듈 의존성 주입을 위한 Koin을 포함한 완전한 Compose Multiplatform 스택을 사용하여 대규모 오프라인 우선(offline-first) 채팅 애플리케이션을 처음부터 구축하는 방법을 배웁니다.
</td>
<td>
약 €199
</td>
<td>
34시간
</td>
</tr>

<tr filter="intermediate">
<td>
🌿
</td>
<td>

[Ultimate Compose Multiplatform: Android/iOS and Testing](https://www.udemy.com/course/ultimate-compose-multiplatform-androidios-testing-kotlin/)

동영상 강좌

</td>
<td>
Hamidreza Sahraei

Udemy

</td>

<td>
Compose Multiplatform만을 사용하여 기능이 풍부한 가상 암호화폐 지갑 앱을 구축하는 방법을 배웁니다. 핵심 스택(Ktor, Room, Koin)뿐만 아니라 탄탄한 단위/UI 테스트와 생체 인증 같은 고급 플랫폼 통합까지 다룹니다.
</td>
<td>
약 €20
</td>
<td>
8시간
</td>
</tr>
<!-- END OF INTERMEDIATE BLOCK -->

<!-- ADVANCED BLOCK -->

<tr filter="advanced">
<td>
🌳
</td>
<td>

[Kotlin/Swift Interopedia](https://github.com/kotlin-hands-on/kotlin-swift-interopedia)

아티클

</td>
<td>
JetBrains

GitHub
</td>

<td>
iOS(Obj-C/Swift)와의 상호 운용성, SKIE, KMP-NativeCoroutines, 언어 기능 차이에 대한 해결 방법, Swift 내보내기, 양방향 상호 운용성을 다룹니다.
</td>
<td>
무료
</td>
<td>
2시간
</td>
</tr>

<tr filter="advanced">
<td>
🌳
</td>
<td>

[Multi-Modular Ecommerce App for Android and iOS (KMP)](https://www.udemy.com/course/multi-modular-ecommerce-app-for-android-ios-kmp/)

동영상 강좌

</td>
<td>
Stefan Jovanovic

Udemy
</td>

<td>
Figma에서 이커머스 앱의 UI를 디자인하는 것부터 시작하여 Compose Multiplatform 기반의 공유 UI를 갖춘 완전한 멀티 모듈 애플리케이션을 구축하고, 인증, 데이터베이스 및 자동화된 클라우드 함수를 위한 Firebase 서비스를 활용해 전체 백엔드를 구축 및 연동하는 전체 제품 수명 주기를 다룹니다.
</td>
<td>
약 €50
</td>
<td>
30시간
</td>
</tr>

<tr filter="advanced">
<td>
🌳
</td>
<td>

[Exploring Ktor with Kotlin Multiplatform and Compose](https://www.linkedin.com/learning/exploring-ktor-with-kotlin-multiplatform-and-compose)

동영상 강좌

</td>
<td>
Troy Miles

LinkedIn Learning
</td>

<td>
보안이 적용된 Ktor 백엔드를 구축하여 AWS에 배포한 후, Kotlin Multiplatform을 사용하여 해당 API를 소비하는 공유 코드 기반의 네이티브 클라이언트를 빌드하는 풀스택 Kotlin 애플리케이션 구축 방법을 배웁니다.
</td>
<td>
월 약 $30–$40
</td>
<td>
2–3시간
</td>
</tr>

<tr filter="advanced">
<td>
🌳
</td>
<td>

[Full-Stack Game Development - Kotlin and Compose Multiplatform](https://www.udemy.com/course/full-stack-game-development-kotlin-compose-multiplatform/)

동영상 강좌

</td>
<td>
Stefan Jovanovic

Udemy
</td>

<td>
Compose Multiplatform으로 물리 엔진, 충돌 감지, 스프라이트 시트 애니메이션을 다루며 완전한 2D 게임을 개발하고, 이를 Android, iOS, 데스크톱, 웹(Kotlin/Wasm 기반)에 배포하는 방법을 배웁니다.
</td>
<td>
약 €99
</td>
<td>
8–10시간
</td>
</tr>

<tr filter="advanced">
<td>
🌳
</td>
<td>

[Philipp Lackner Full-Stack Bundle: KMP and Spring Boot](https://pl-coding.com/full-stack-bundle)

동영상 강좌

</td>
<td>
Philipp Lackner

[pl.coding.com](https://pl-coding.com/)

</td>

<td>
WebSocket 기반의 멀티 모듈 Spring Boot 백엔드부터 오프라인 우선 Compose Multiplatform 클라이언트(Android, iOS, 데스크톱, 웹) 및 완전한 CI/CD 파이프라인에 이르기까지, 완전한 풀스택 채팅 애플리케이션을 설계, 구축, 배포하는 모든 과정을 배웁니다.
</td>
<td>
약 €429
</td>
<td>
55시간
</td>
</tr>

<tr filter="advanced">
<td>
🌳
</td>
<td>

[KMP for Native Mobile Teams](https://touchlab.co/kmp-teams-intro)

아티클 시리즈

</td>
<td>
Touchlab
</td>

<td>
초기 승인 확보 및 기술 파일럿 진행부터 지속 가능한 실전 워크플로를 통한 공유 코드베이스 확장에 이르기까지, 기존 네이티브 모바일 팀 내에서 전체 KMP 도입 과정을 이끄는 방법을 배웁니다.
</td>
<td>
무료
</td>
<td>
6–8시간
</td>
</tr>

<!-- END OF ADVANCED BLOCK -->

<!-- LIB-AUTHORS BLOCK -->

<tr filter="lib-authors">
<td>
🧩
</td>
<td>

[API Guidelines for Multiplatform Library Building](https://kotlinlang.org/docs/api-guidelines-build-for-multiplatform.html)

공식 문서

</td>
<td>
JetBrains
</td>

<td>
코드 재사용을 극대화하고 폭넓은 플랫폼 호환성을 보장하기 위한 필수 모범 사례에 따라 멀티플랫폼 라이브러리의 공개 API를 설계하는 방법을 배웁니다.
</td>
<td>
무료
</td>
<td>
1–2시간
</td>
</tr>

<tr filter="lib-authors">
<td>
🧩
</td>
<td>

[Create Your Kotlin Multiplatform Library](create-kotlin-multiplatform-library.md)

튜토리얼

</td>
<td>
JetBrains
</td>

<td>
공식 스타터 템플릿 사용법, 로컬 Maven 배포 설정, 라이브러리 구조화 및 배포 구성 방법을 배웁니다.
</td>
<td>
무료
</td>
<td>
2–3시간
</td>
</tr>

<tr filter="lib-authors">
<td>
🧩
</td>
<td>

[Documentation with Dokka](https://kotlinlang.org/docs/dokka-introduction.html)

공식 문서

</td>
<td>
JetBrains
</td>

<td>
Dokka를 사용하여 Kotlin/Java 혼합 프로젝트를 지원하며 KMP 라이브러리의 전문적인 API 문서를 여러 형식으로 자동 생성하는 방법을 배웁니다.
</td>
<td>
무료
</td>
<td>
2–3시간
</td>
</tr>

<tr filter="lib-authors">
<td>
🧩
</td>
<td>

[KMP Library Template](https://github.com/Kotlin/multiplatform-library-template)

GitHub 템플릿

</td>
<td>
JetBrains

GitHub
</td>

<td>
빌드 설정 및 배포를 위한 모범 사례가 사전 구성된 공식 템플릿을 사용하여 새로운 KMP 라이브러리 프로젝트를 빠르게 시작(bootstrap)하는 방법을 배웁니다.
</td>
<td>
무료
</td>
<td>
1시간
</td>
</tr>

<tr filter="lib-authors">
<td>
🧩
</td>
<td>

[Publish to Maven Central](multiplatform-publish-libraries-to-maven.md)

튜토리얼

</td>
<td>
JetBrains
</td>

<td>
자격 증명 설정, 배포 플러그인 구성, CI를 통한 프로세스 자동화 등 KMP 라이브러리를 Maven Central에 배포하는 전체 과정을 단계별로 알아봅니다.
</td>
<td>
무료
</td>
<td>
3–4시간
</td>
</tr>

<tr filter="lib-authors">
<td>
🧩
</td>
<td>

[Kotlin Multiplatform Libraries](https://www.linkedin.com/learning/kotlin-multiplatform-libraries)

동영상 강좌

</td>
<td>
LinkedIn Learning
</td>

<td>
효과적인 API 설계와 코드 공유 전략부터 최종 배포 및 모범 사례에 이르기까지 KMP 라이브러리 제작의 전체 수명 주기를 다룹니다.
</td>
<td>
월 약 $30–$40
</td>
<td>
2–3시간
</td>
</tr>

<!-- END OF LIB-AUTHORS BLOCK -->

</table>
</snippet>

<!-- END OF REVOKED BLOCK -->

</TabItem>

<TabItem id="beginner" title="🌱 초급">

<include element-id="source" use-filter="empty,beginner" from="kmp-learning-resources.md"/>

</TabItem>

<TabItem id="intermediate" title="🌿 중급">

<include element-id="source" use-filter="empty,intermediate" from="kmp-learning-resources.md"/>

</TabItem>

<TabItem id="advanced" title="🌳 고급">

<include element-id="source" use-filter="empty,advanced" from="kmp-learning-resources.md"/>

</TabItem>

<TabItem id="lib-authors" title="🧩 라이브러리 제작자">

<include element-id="source" use-filter="empty,lib-authors" from="kmp-learning-resources.md"/>

</TabItem>

</Tabs>