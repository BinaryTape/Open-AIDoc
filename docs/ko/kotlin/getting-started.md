[//]: # (title: Kotlin 시작하기)

<tldr>
<p>최신 Kotlin 릴리스:<b> <a href="%kotlinLatestWhatsnew%">%kotlinVersion%</a></b></p>
</tldr>

Kotlin은 간결하고 멀티플랫폼을 지원하며, Java 및 다른 언어들과 상호 운용이 가능한 현대적인 언어입니다.

Kotlin이 처음이신가요? 브라우저에서 직접 기초를 배울 수 있는 Kotlin 투어를 시작해 보세요.

<a href="kotlin-tour-welcome.md"><img src="start-kotlin-tour.svg" width="700" alt="Start the Kotlin tour" style="block"/></a>

## Kotlin 설치하기

Kotlin은 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/) 및 [Android Studio](https://developer.android.com/studio)의 모든 릴리스에 포함되어 있습니다.
Kotlin을 사용하려면 이 IDE 중 하나를 다운로드하여 설치하세요.

## Kotlin 사용 사례 선택하기
 
<tabs>

<tab id="console" title="콘솔">

여기서는 콘솔 애플리케이션을 개발하고 Kotlin으로 단위 테스트를 작성하는 방법을 배웁니다.

1. **[IntelliJ IDEA 프로젝트 위저드를 사용하여 기본적인 JVM 애플리케이션 만들기](jvm-get-started.md).**

2. **[첫 번째 단위 테스트 작성하기](jvm-test-using-junit.md).**

</tab>

<tab id="backend" title="백엔드">

여기서는 Kotlin 서버 측 환경에서 백엔드 애플리케이션을 개발하는 방법을 배웁니다.

* **Java 프로젝트에 Kotlin 도입하기:**

  * [Java 프로젝트에서 Kotlin이 작동하도록 구성하기](mixing-java-kotlin-intellij.md)
  * [Java Maven 프로젝트에 Kotlin 테스트 추가하기](jvm-test-using-junit.md)

* **Kotlin으로 백엔드 앱을 처음부터 만들기:**

  * [Spring Boot로 RESTful 웹 서비스 만들기](jvm-get-started-spring-boot.md)
  * [Ktor로 HTTP API 만들기](https://ktor.io/docs/creating-http-apis.html)

</tab>

<tab id="cross-platform-mobile" title="크로스 플랫폼">

여기서는 [Kotlin Multiplatform](https://kotlinlang.org/docs/multiplatform/get-started.html)을 사용하여 크로스 플랫폼 애플리케이션을 개발하는 방법을 배웁니다.

1. **[크로스 플랫폼 개발을 위한 환경 설정하기](https://kotlinlang.org/docs/multiplatform/quickstart.html).**

2. **iOS 및 Android용 첫 번째 애플리케이션 만들기:**

   * 크로스 플랫폼 애플리케이션을 처음부터 만들고 다음을 수행합니다:
     * [UI는 네이티브로 유지하면서 비즈니스 로직 공유하기](https://kotlinlang.org/docs/multiplatform/multiplatform-create-first-app.html)
     * [비즈니스 로직과 UI 공유하기](https://kotlinlang.org/docs/multiplatform/compose-multiplatform-create-first-app.html)
   * [기존 Android 애플리케이션을 iOS에서 작동하도록 만들기](https://kotlinlang.org/docs/multiplatform/multiplatform-integrate-in-existing-app.html)
   * [Ktor 및 SQLdelight를 사용하여 크로스 플랫폼 애플리케이션 만들기](https://kotlinlang.org/docs/multiplatform/multiplatform-ktor-sqldelight.html)

3. **[샘플 프로젝트](https://kotlinlang.org/docs/multiplatform/multiplatform-samples.html) 살펴보기**.

</tab>

<tab id="android" title="안드로이드">

Android 개발에 Kotlin을 사용하려면 [Google의 Android 기반 Kotlin 시작하기 권장 가이드](https://developer.android.com/kotlin/get-started)를 참고하세요.

</tab>

<tab id="data-analysis" title="데이터 분석">

데이터 파이프라인 구축부터 머신러닝 모델의 프로덕션화까지, Kotlin은 데이터를 활용하고 최상의 결과를 얻기 위한 훌륭한 선택입니다.

1. **데이터 탐색 및 실험하기:**

   * [DataFrame](https://kotlin.github.io/dataframe/overview.html) – 데이터 분석 및 조작을 위한 라이브러리입니다.
   * [Kandy](https://kotlin.github.io/kandy/welcome.html) – 데이터 시각화를 위한 플로팅 도구입니다.

2. **Twitter에서 Kotlin for Data Analysis 팔로우하기:** [KotlinForData](http://twitter.com/KotlinForData).

</tab>

</tabs>

## 지원 받기

어려움이나 문제가 발생하면 ![Slack](slack.svg){width=25}{type="joined"} Slack에서 도움을 요청하거나([초대 받기](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)), [이슈 트래커](https://youtrack.jetbrains.com/issues/KT)에 문제를 보고해 주세요.

이 페이지에서 누락된 내용이 있거나 혼란스러운 부분이 있다면 [피드백을 공유](https://surveys.hotjar.com/d82e82b0-00d9-44a7-b793-0611bf6189df)해 주세요.