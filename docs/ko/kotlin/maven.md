[//]: # (title: Maven)

Maven은 순수 Kotlin 프로젝트 또는 Kotlin-Java 혼합 프로젝트를 관리하고 빌드 프로세스를 자동화할 수 있도록 지원하는 빌드 시스템입니다.
JVM 기반 프로젝트에서 작동하며, 필요한 의존성을 다운로드하고 코드를 컴파일 및 패키징합니다.
기본 사항 및 자세한 정보는 [Maven](https://maven.apache.org/) 웹사이트에서 확인할 수 있습니다.

Kotlin Maven 프로젝트를 진행할 때의 일반적인 워크플로는 다음과 같습니다.

1. [Java 또는 Kotlin 프로젝트 구성](maven-configure-project.md)
2. [저장소 선언](maven-set-dependencies.md#declare-repositories)
3. [프로젝트 의존성 설정](maven-set-dependencies.md)
4. [Kotlin 컴파일러 구성](maven-kotlin-compiler.md)
5. [애플리케이션 패키징](maven-compile-package.md)

시작하려면 다음 단계별 튜토리얼을 참고할 수도 있습니다.

* [Kotlin과 함께 작동하도록 Java 프로젝트 구성](mixing-java-kotlin-intellij.md)
* [Kotlin 및 JUnit으로 Java Maven 프로젝트 테스트](jvm-test-using-junit.md)

> Kotlin/Java 혼합 프로젝트에 맞춰 Maven 및 Gradle 빌드 파일이 이미 구성되어 있는 공개 [샘플 프로젝트](https://github.com/kotlin-hands-on/kotlin-junit-sample/tree/main/complete)를 확인할 수도 있습니다.
>
{style="tip"}

## 다음 단계 {id="what-s-next"}

* [`power-assert` 플러그인](power-assert.md#maven)으로 **디버깅 환경을 개선하세요**.
* [`kover-maven-plugin`](https://kotlin.github.io/kotlinx-kover/maven-plugin/)으로 **테스트 커버리지를 측정하고 보고서를 생성하세요**.
* [kapt 플러그인](kapt.md#set-up-in-maven)으로 **어노테이션 처리(Annotation processing)를 구성하세요**.
* [Dokka 문서 엔진](dokka-maven.md)으로 **문서를 생성하세요**.
  다국어 혼합 프로젝트를 지원하며, 표준 Javadoc을 비롯한 여러 형식으로 결과를 생성할 수 있습니다.
* [`kotlin-osgi-bundle`](kotlin-osgi.md#maven)을 추가하여 **OSGi 지원을 활성화하세요**.
* [Kotlin 백엔드 개발 FAQ](jvm-backend-faq.md)에서 멀티모듈 빌드, 테스트, 패키징 및 배포에 관한 **자주 묻는 질문의 답변을 확인하세요**.