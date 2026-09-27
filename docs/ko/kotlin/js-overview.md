[//]: # (title: 코틀린/자바스크립트(Kotlin/JavaScript))

Kotlin/JavaScript(Kotlin/JS)를 사용하면 코틀린 코드, 코틀린 표준 라이브러리 및 호환되는 모든 의존성을 자바스크립트(JavaScript)로 트랜스파일(transpile)할 수 있습니다. 이를 통해 코틀린 애플리케이션을 자바스크립트를 지원하는 모든 환경에서 실행할 수 있습니다.

[Kotlin Multiplatform Gradle 플러그인](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html)(`kotlin.multiplatform`)을 통해 Kotlin/JS를 사용하여, 자바스크립트를 타겟으로 하는 코틀린 프로젝트를 한 곳에서 구성하고 관리하세요.

Kotlin Multiplatform Gradle 플러그인을 사용하면 애플리케이션의 번들링(bundling)을 제어하고 npm에서 직접 자바스크립트 의존성을 추가하는 것과 같은 기능을 사용할 수 있습니다. 사용 가능한 구성 옵션에 대한 개요는 [Kotlin/JS 프로젝트 설정](js-project-setup.md)을 참조하세요.

> 현재 Kotlin/JS 구현은 [ES5](https://www.ecma-international.org/ecma-262/5.1/), [ES2015](https://262.ecma-international.org/6.0/), [ES2020](https://262.ecma-international.org/11.0/) 표준을 타겟으로 합니다.
>
{style="tip"}

## Kotlin/JS 활용 사례 {id="use-cases-for-kotlin-js"}

다음은 Kotlin/JS를 사용하는 몇 가지 일반적인 방법입니다:

*  **프론트엔드와 JVM 백엔드 간의 공통 로직 공유**

   백엔드가 코틀린이나 다른 JVM 호환 언어로 작성된 경우, 웹 애플리케이션과 백엔드 간에 공통 코드를 공유할 수 있습니다. 여기에는 데이터 전송 객체(DTO), 검증 및 인증 규칙, REST API 엔드포인트에 대한 추상화 등이 포함됩니다.

*  **Android, iOS 및 웹 클라이언트 간의 공통 로직 공유**

   네이티브 사용자 인터페이스를 유지하면서 웹 인터페이스와 Android 및 iOS용 모바일 애플리케이션 간에 비즈니스 로직을 공유할 수 있습니다. 이를 통해 REST API 추상화, 사용자 인증, 폼 검증 및 도메인 모델과 같은 공통 기능의 중복 작성을 방지할 수 있습니다.

* **Kotlin/JS를 사용하여 프론트엔드 웹 애플리케이션 구축**

     기존 도구 및 라이브러리와 통합하면서 코틀린을 사용하여 전통적인 웹 프론트엔드를 개발하세요:

     * Android 개발에 익숙하다면, [Kobweb](https://kobweb.varabyte.com/)이나 [Kilua](https://kilua.dev/)와 같은 Compose 기반 프레임워크로 웹 애플리케이션을 빌드할 수 있습니다.
     * JetBrains에서 제공하는 [공통 자바스크립트 라이브러리용 코틀린 래퍼(Kotlin wrappers)](https://github.com/JetBrains/kotlin-wrappers)를 사용하여 Kotlin/JS로 완전한 타입 안정성이 보장되는 React 애플리케이션을 빌드하세요. 코틀린 래퍼(`kotlin-wrappers`)는 React 및 기타 자바스크립트 프레임워크에 대한 추상화 및 통합을 제공합니다.
       
       이러한 래퍼는 [React Redux](https://react-redux.js.org/), [React Router](https://reactrouter.com/), [styled-components](https://styled-components.com/)와 같은 보조 라이브러리도 지원합니다. 또한 자바스크립트 생태계와의 상호 운용성(interoperability)을 통해 서드파티 React 컴포넌트 및 컴포넌트 라이브러리를 사용할 수 있습니다.
  
     * 코틀린 생태계와 통합되고 간결하며 표현력이 풍부한 코드를 지원하는 [Kotlin/JS 프레임워크](js-frameworks.md)를 사용하세요.

*  **오래된 브라우저를 지원하는 멀티플랫폼 애플리케이션 구축**

      Compose Multiplatform을 사용하면 코틀린으로 애플리케이션을 빌드하고 웹 프로젝트에서 모바일 및 데스크톱 사용자 인터페이스를 재사용할 수 있습니다. 이 목적을 위한 기본 타겟은 [Kotlin/Wasm](wasm-overview.md)이지만, Kotlin/JS를 함께 타겟팅하여 오래된 브라우저까지 지원 범위를 확장할 수 있습니다.

* **Kotlin/JS를 사용하여 서버 사이드 및 서버리스 애플리케이션 구축**

  Kotlin/JS의 Node.js 타겟을 사용하면 자바스크립트 런타임의 서버 사이드 또는 서버리스 환경을 위한 애플리케이션을 만들 수 있습니다. 이는 빠른 시작 속도와 적은 메모리 사용량을 제공합니다. [`kotlinx-nodejs`](https://github.com/Kotlin/kotlinx-nodejs) 라이브러리는 코틀린에서 [Node.js API](https://nodejs.org/docs/latest/api/)에 대한 타입 안정성이 보장된 접근을 제공합니다.

사용 사례에 따라 Kotlin/JS 프로젝트는 코틀린 생태계의 호환 라이브러리와 자바스크립트 및 TypeScript 생태계의 서드파티 라이브러리를 사용할 수 있습니다.

코틀린 코드에서 서드파티 라이브러리를 사용하려면 직접 타입 안정성이 보장된 래퍼를 만들거나 커뮤니티에서 유지 관리하는 래퍼를 사용할 수 있습니다. 또한 Kotlin/JS의 [`dynamic` 타입](dynamic-type.md)을 사용할 수도 있는데, 이는 타입 안정성을 포기하는 대신 엄격한 타이핑과 라이브러리 래퍼 없이 사용할 수 있게 해줍니다.

Kotlin/JS는 [ESM](https://tc39.es/ecma262/#sec-modules), [CommonJS](https://nodejs.org/api/modules.html#modules-commonjs-modules), [UMD](https://github.com/umdjs/umd), [AMD](https://github.com/amdjs/amdjs-api)와 같은 가장 일반적인 모듈 시스템과도 호환됩니다. 이를 통해 [모듈을 생성하고 소비](js-modules.md)할 수 있으며 구조화된 방식으로 자바스크립트 생태계와 통합할 수 있습니다.

### 여러분의 사용 사례를 공유해 주세요 {id="share-your-use-cases"}

[Kotlin/JS 활용 사례](#use-cases-for-kotlin-js)의 목록이 모든 것을 담고 있지는 않습니다. 다양한 접근 방식을 시도해 보고 여러분의 프로젝트에 가장 적합한 방식을 찾아보세요.

[Kotlin Slack](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)의 [#javascript](https://kotlinlang.slack.com/archives/C0B8L3U69) 채널에서 Kotlin/JS 커뮤니티와 여러분의 사용 사례, 경험 및 질문을 공유해 주세요.

## Kotlin/JS 시작하기 {id="get-started-with-kotlin-js"}

Kotlin/JS 작업을 시작하기 위한 기본 개념과 초기 단계를 살펴보세요:

* 코틀린이 처음이라면 [기본 문법](basic-syntax.md)을 검토하고 [Kotlin 투어](kotlin-tour-welcome.md)를 살펴보는 것부터 시작하세요.
* 영감을 얻기 위해 [Kotlin/JS 샘플 프로젝트](#sample-projects-for-kotlin-js) 목록을 확인해 보세요. 이 샘플들에는 프로젝트 시작에 도움이 되는 유용한 코드 스니펫과 패턴이 포함되어 있습니다.
* Kotlin/JS가 처음이라면 더 고급 주제를 살펴보기 전에 [설정 가이드](js-project-setup.md)부터 시작하세요.

Kotlin/JS를 직접 시도해 보시겠습니까?

<a href="js-get-started.md" as="button" mode="rock" icon="arrow-right" icon-position="right">Kotlin/JS 시작하기</a>

## Kotlin/JS 샘플 프로젝트 {id="sample-projects-for-kotlin-js"}

다음 표는 다양한 Kotlin/JS 사용 사례, 아키텍처 및 코드 공유 전략을 보여주는 샘플 프로젝트 목록입니다.

| 프로젝트 | 설명 |
|-----------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Spring과 Angular 간에 코드를 공유하는 Petclinic](https://github.com/Kotlin/kmp-spring-petclinic/#readme) | 데이터 전송 객체(DTO), 검증 및 인증 규칙, REST API 엔드포인트에 대한 추상화를 공유하여 엔터프라이즈 애플리케이션에서 코드 중복을 피하는 방법을 보여줍니다. 코드는 [Spring Boot](https://spring.io/projects/spring-boot) 백엔드와 [Angular](https://angular.dev/) 프론트엔드 간에 공유됩니다. |
| [Fullstack Conference CMS](https://github.com/Kotlin/kmp-fullstack-conference-cms/#readme) | [Ktor](https://ktor.io/), [Jetpack Compose](https://developer.android.com/compose), [Vue.js](https://vuejs.org/) 애플리케이션 간에 가장 단순한 방식부터 전체 코드 공유에 이르기까지 여러 가지 코드 공유 접근 방식을 보여줍니다. |
| [Compose-HTML 기반 Kobweb 프레임워크를 사용한 Todo 앱](https://github.com/varabyte/kobweb-templates/tree/main/examples/todo/#readme) | Android 개발자에게 익숙한 접근 방식을 재사용하여 할 일 목록(To-do list) 애플리케이션을 만드는 방법을 보여줍니다. [Kobweb 프레임워크](https://kobweb.varabyte.com/)로 구동되는 클라이언트 UI 애플리케이션을 빌드합니다. |
| [Android, iOS 및 웹 간의 간단한 로직 공유](https://github.com/Kotlin/kmp-logic-sharing-simple-example/#readme) | 코틀린으로 공통 로직을 작성하고 Android([Jetpack Compose](https://developer.android.com/compose)), iOS([SwiftUI](https://developer.apple.com/tutorials/swiftui/)), 웹([React](https://react.dev/))의 플랫폼 네이티브 UI 애플리케이션에서 이를 사용하는 프로젝트 템플릿을 포함합니다. |
| [풀스택 협업 할 일 목록](https://github.com/kotlin-hands-on/jvm-js-fullstack/#readme) | JS 및 JVM 타겟과 함께 Kotlin Multiplatform을 사용하여 협업용 할 일 목록 애플리케이션을 만드는 방법을 보여줍니다. 백엔드에는 [Ktor](https://ktor.io/)를, 프론트엔드에는 React와 함께 Kotlin/JS를 사용합니다. |

## Kotlin/JS 프레임워크 {id="kotlin-js-frameworks"}

Kotlin/JS 프레임워크는 현대적인 웹 애플리케이션 구축을 위해 바로 사용할 수 있는 컴포넌트, 라우팅, 상태 관리 및 기타 도구를 제공하여 웹 개발을 단순화합니다.

[다양한 작성자가 만든 Kotlin/JS용 프레임워크를 확인해 보세요](js-frameworks.md).

## Kotlin/JS 커뮤니티 참여하기 {id="join-the-kotlin-js-community"}

공식 [Kotlin Slack](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)의 [#javascript](https://kotlinlang.slack.com/archives/C0B8L3U69) 채널에 가입하여 커뮤니티 및 Kotlin/JS 팀과 대화할 수 있습니다.

## 다음 단계 {id="what-s-next"}

* [Kotlin/JS 프로젝트 설정](js-project-setup.md)
* [Kotlin/JS 프로젝트 실행](running-kotlin-js.md)
* [Kotlin/JS 코드 디버깅](js-debugging.md)
* [Kotlin/JS에서 테스트 실행](js-running-tests.md)