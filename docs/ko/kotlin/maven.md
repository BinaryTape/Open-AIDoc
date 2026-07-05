[//]: # (title: Maven)

Maven은 Kotlin 전용 또는 Kotlin-Java 혼용 프로젝트를 관리하고 빌드 프로세스를 자동화하는 데 도움을 주는 빌드 시스템입니다.
JVM 기반 프로젝트에서 작동하며, 필요한 의존성을 다운로드하고 코드를 컴파일 및 패키징합니다.
Maven의 기초 및 세부 사항에 대한 자세한 내용은 [Maven](https://maven.apache.org/) 웹사이트에서 확인할 수 있습니다.

Kotlin Maven 프로젝트를 작업할 때의 일반적인 워크플로는 다음과 같습니다.

1. [Java 또는 Kotlin 프로젝트 구성](maven-configure-project.md).
2. [레포지토리(Repository) 선언](maven-set-dependencies.md#declare-repositories).
3. [프로젝트 의존성 설정](maven-set-dependencies.md).
4. [Kotlin 컴파일러 구성](maven-kotlin-compiler.md).
5. [애플리케이션 패키징](maven-compile-package.md).

시작하려면 다음의 단계별 튜토리얼을 참고하세요.

* [Java 프로젝트에서 Kotlin을 사용할 수 있도록 구성하기](mixing-java-kotlin-intellij.md)
* [Kotlin 및 JUnit으로 Java Maven 프로젝트 테스트하기](jvm-test-using-junit.md)

> Maven과 Gradle 빌드 파일이 이미 설정된 Kotlin/Java 혼합 프로젝트용 [샘플 프로젝트](https://github.com/kotlin-hands-on/kotlin-junit-sample/tree/main/complete)를 확인해 볼 수 있습니다.
>
{style="tip"}

## 다음 단계

* [`power-assert` 플러그인](power-assert.md#maven)으로 **디버깅 환경을 개선**해 보세요.
* [`kover-maven-plugin`](https://kotlin.github.io/kotlinx-kover/maven-plugin/)으로 **테스트 커버리지를 측정하고 리포트를 생성**해 보세요.
* [kapt 플러그인](kapt.md#set-up-in-maven)으로 **어노테이션 프로세싱(Annotation processing)을 구성**해 보세요.
* [Dokka 문서화 엔진](dokka-maven.md)을 사용하여 **문서를 생성**해 보세요.
  Dokka는 혼합 언어 프로젝트를 지원하며, 표준 Javadoc을 포함한 다양한 형식으로 결과물을 생성할 수 있습니다.
* [`kotlin-osgi-bundle`](kotlin-osgi.md#maven)을 추가하여 **OSGi 지원을 활성화**해 보세요.