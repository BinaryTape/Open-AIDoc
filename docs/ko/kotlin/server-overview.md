[//]: # (title: Kotlin을 활용한 백엔드 개발)

<web-summary>Spring, Ktor 및 기타 백엔드 프레임워크와 함께 Kotlin을 사용하여 서버 애플리케이션을 구축하세요</web-summary>

Kotlin은 서버 측 애플리케이션 개발에 매우 적합합니다. Kotlin을 사용하면 기존 Java 기반 기술 스택과의 완벽한 호환성을 유지하면서 간결하고 표현력이 풍부한 코드를 작성할 수 있습니다.

## 시작하기 {id="get-started"}

Kotlin은 대규모 코드베이스를 Java에서 Kotlin으로 점진적으로 마이그레이션할 수 있도록 지원합니다. 프로젝트의 다른 부분은 Java로 유지하면서 테스트 코드나 새로운 프로덕션 코드를 Kotlin으로 작성하기 시작할 수 있습니다.

Java 프로젝트에서 Kotlin을 사용할 수 있도록 구성하고, IntelliJ IDEA에 내장된 자동 Java-to-Kotlin 변환기를 활용해 보세요.

<a href="mixing-java-kotlin-intellij.md" as="button" mode="rock" icon="arrow-right" icon-position="right">Java 프로젝트에 Kotlin 도입하기</a>

## 프레임워크 살펴보기 {id="explore-frameworks"}

Kotlin은 모든 Java 기반 프레임워크와 완벽하게 호환되므로 익숙한 기술 스택을 그대로 사용하면서 Kotlin 문법의 이점을 누릴 수 있습니다. 뛰어난 IDE 지원 외에도 Kotlin은 Ultimate 구독이 포함된 IntelliJ IDEA에서의 Spring 및 Ktor 지원과 같이 프레임워크 전용 도구를 제공합니다.

### Spring {id="spring"}

[Spring](https://spring.io)은 Kotlin의 언어 기능을 활용하여 더욱 간결한 API를 제공합니다.
[온라인 프로젝트 생성기](https://start.spring.io/#!language=kotlin)를 사용하면 Kotlin 기반의 새 프로젝트를 빠르게 생성할 수 있습니다.

<a href="jvm-get-started-spring-boot.md" as="button" mode="rock" icon="arrow-right" icon-position="right">Spring Boot와 Kotlin 시작하기</a>

### Ktor {id="ktor"}

[Ktor](https://github.com/kotlin/ktor)는 Kotlin으로 웹 애플리케이션을 구축하기 위한 JetBrains의 프레임워크입니다.
높은 확장성을 위해 코루틴(coroutine)을 사용하며, 사용하기 쉽고 관용적인(idiomatic) API를 제공합니다.

<a href="https://ktor.io/docs/server-create-a-new-project.html" as="button" mode="rock" icon="arrow-right" icon-position="right">새 Ktor 프로젝트 생성하기</a>

### 기타 프레임워크 {id="other-frameworks"}

다음은 Kotlin용 백엔드 프레임워크의 몇 가지 다른 예입니다.

| Framework                                              | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
|--------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Quarkus](https://quarkus.io/guides/kotlin)            | Kotlin에 대한 최고 수준의(first-class) 지원을 제공하는 오픈 소스 프레임워크입니다. Quarkus는 처음부터 Kubernetes를 위해 구축되었으며, 계속해서 늘어나는 수백 개의 최고 수준 라이브러리를 활용하여 응집력 있는 풀스택 프레임워크를 제공합니다.                                                                                                                                                                                                                                                   |
| [Vert.x](https://vertx.io)                             | JVM에서 리액티브 웹 애플리케이션을 구축하기 위한 프레임워크입니다. Vert.x는 [Kotlin 코루틴 통합](https://vertx.io/docs/vertx-lang-kotlin-coroutines/kotlin/)을 포함하여 Kotlin에 대한 [전용 지원](https://github.com/vert-x3/vertx-lang-kotlin)을 제공합니다.                                                                                                                                                                                                                            |
| [kotlinx.html](https://github.com/kotlin/kotlinx.html) | 웹 애플리케이션에서 HTML을 빌드하는 데 사용할 수 있는 DSL입니다. JSP나 FreeMarker와 같은 기존 템플릿 시스템의 대안으로 사용할 수 있습니다.                                                                                                                                                                                                                                                                                                                                             |
| [Micronaut](https://micronaut.io/)                     | 모듈화되고 테스트하기 쉬운 마이크로서비스 및 서버리스 애플리케이션을 구축하기 위한 최신 JVM 기반 풀스택 프레임워크입니다. 웨비나 [Kotlin을 사용한 마이크로서비스용 Micronaut](https://micronaut.io/2020/12/03/webinar-micronaut-for-microservices-with-kotlin/)를 시청하고, Micronaut 프레임워크에서 [Kotlin 확장 함수](extensions.md#extension-functions)를 사용하는 방법을 보여주는 상세 [가이드](https://guides.micronaut.io/latest/micronaut-kotlin-extension-fns.html)를 살펴보세요. |
| [http4k](https://http4k.org/)                          | 순수 Kotlin으로 작성된 Kotlin HTTP 애플리케이션용 경량 함수형 툴킷입니다. http4k는 완벽한 형태의 프로젝트 템플릿을 생성할 수 있는 [CLI 지원 도구 상자](https://toolbox.http4k.org)와 선택한 백엔드, 모듈, 빌드 도구를 포함하여 즉시 실행 가능한 http4k 애플리케이션을 부트스트랩할 수 있는 웹 기반 [프로젝트 마법사](https://toolbox.http4k.org/project)를 제공합니다.                                                                                                           |
| [Javalin](https://javalin.io)                          | WebSocket, HTTP2 및 비동기 요청을 지원하는 Kotlin 및 Java용 초경량 웹 프레임워크입니다.                                                                                                                                                                                                                                                                                                                                                                                      |

## 애플리케이션 배포 {id="deploy-your-applications"}

Kotlin 애플리케이션은 Amazon Web Services(AWS), Google Cloud Platform(GCP) 등을 포함하여 Java 웹 애플리케이션을 지원하는 모든 호스트에 배포할 수 있습니다.

* **AWS**는 해당 서비스와 상호작용할 수 있는 전용 [Kotlin용 SDK](https://docs.aws.amazon.com/sdk-for-kotlin/latest/developer-guide/home.html)를
  제공합니다. 서버리스 배포의 경우, [Kotlin용 AWS Lambda 코드 예제](https://docs.aws.amazon.com/sdk-for-kotlin/latest/developer-guide/kotlin_lambda_code_examples.html)를 참조할 수 있습니다.
* **Ktor**를 사용하면 Kotlin 애플리케이션을 다양한 클라우드 제공업체에 배포할 수 있습니다. 예를 들어, Ktor 튜토리얼을 통해
  [Google App Engine](https://ktor.io/docs/google-app-engine.html) 및 기타 서비스에 배포하는 방법에 대해 자세히 알아볼 수 있습니다.
* **Spring** 애플리케이션 또한 대부분의 주요 클라우드 제공업체와 호환됩니다. Spring Boot 애플리케이션을 클라우드에 배포하는 방법은
  [Spring 공식 문서](https://docs.spring.io/spring-boot/how-to/deployment/cloud.html)에서 확인하세요.

## 커뮤니티 참여하기 {id="join-the-community"}

* ![Slack](slack.svg){width=25}{type="joined"} **Kotlin Slack**: [초대 링크를 받고](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up) [#spring](https://kotlinlang.slack.com/archives/C0B8ZTWE4) 및 [#server](https://kotlinlang.slack.com/archives/C0B8RC352) 채널에 참여하세요.
* ![Stack Overflow](stackoverflow.svg){width=25}{type="joined"} **Stack Overflow**: ["kotlin"](https://stackoverflow.com/questions/tagged/kotlin), ["spring-kotlin"](https://stackoverflow.com/questions/tagged/spring-kotlin), 또는 ["ktor"](https://stackoverflow.com/questions/tagged/ktor) 태그를 구독하세요.
* ![YouTube](youtube.svg){width=25}{type="joined"} **Kotlin YouTube 채널**: 구독하고 [Kotlin with Spring](https://www.youtube.com/playlist?list=PLlFc5cFwUnmxOJL0GSSZ1Vot4KL2Vwe7x) 관련 동영상을 시청하세요.

## 다음 단계 {id="next-steps"}

* [Kotlin과 JUnit을 사용하여 Java Maven 프로젝트를 테스트하는 방법 알아보기](jvm-test-using-junit.md)
* [Ktor로 비동기 서버 애플리케이션을 구축하는 방법 살펴보기](https://ktor.io/docs/server-create-a-new-project.html)
* [Kotlin 백엔드 개발 FAQ에서 자주 묻는 질문에 대한 답변 확인하기](jvm-backend-faq.md)