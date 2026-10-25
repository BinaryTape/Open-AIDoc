[//]: # (title: Java 프로젝트에 Kotlin 추가하기 – 튜토리얼)

<web-summary>기존 Java 프로젝트에 Kotlin을 통합하세요 − Maven 또는 Gradle 빌드 파일을 구성하고, 소스 파일을 정리하며, IntelliJ IDEA에서 Java 코드를 Kotlin으로 변환합니다.</web-summary>

Kotlin은 Java와 완전히 상호 운용되므로, 모든 코드를 다시 작성할 필요 없이 기존 Java 프로젝트에 점진적으로 도입할 수 있습니다.

이 튜토리얼에서는 다음 내용을 배웁니다:

* Java 및 Kotlin 코드를 모두 컴파일하도록 Maven 또는 Gradle 빌드 도구를 설정하는 방법.
* 프로젝트 디렉터리에서 Java 및 Kotlin 소스 파일을 구성하는 방법.
* IntelliJ IDEA를 사용하여 Java 파일을 Kotlin으로 변환하는 방법.

> 이 튜토리얼에서는 기존의 어떤 Java 프로젝트든 사용할 수 있으며, Maven 및 Gradle 빌드 파일이 이미 설정되어 있는 공개 [샘플 프로젝트](https://github.com/kotlin-hands-on/kotlin-junit-sample/tree/main/complete)를 클론하여 사용할 수도 있습니다.
> 
> 또한 [준비된 스킬](https://github.com/Kotlin/kotlin-agent-skills/blob/main/skills/kotlin-tooling-java-to-kotlin/SKILL.md)을 사용하여 원하는 AI 에이전트에 변환 작업을 맡길 수도 있습니다.
> AI 처리 결과는 완전히 예측 가능하지는 않다는 점에 유의하세요.
>
{style="tip"}

## 프로젝트 구성 {id="project-configuration"}

Java 프로젝트에 Kotlin을 추가하려면 사용하는 빌드 도구에 따라 Kotlin과 Java를 모두 사용하도록 프로젝트를 구성해야 합니다.

프로젝트 구성을 통해 Kotlin 및 Java 코드가 모두 올바르게 컴파일되고 서로 원활하게 참조할 수 있게 됩니다.

### Maven {id="maven"}

> **IntelliJ IDEA 2025.3**부터는 Maven 기반 Java 프로젝트에 첫 번째 Kotlin 파일을 추가할 때,  
> IDE가 `pom.xml` 파일을 자동으로 업데이트하여 Kotlin Maven 플러그인과 표준 종속성을 포함합니다.  
> 버전이나 빌드 단계를 커스텀하려는 경우 수동으로 구성할 수도 있습니다.
>
{style="note"}

Maven 프로젝트에서 Kotlin과 Java를 함께 사용하려면 `pom.xml` 파일에 Kotlin Maven 플러그인을 적용하고 Kotlin 종속성을 추가하세요:

1. `<properties>` 섹션에 Kotlin 버전 프로퍼티를 추가합니다:

    ```xml
    ```
   {src="jvm-test-tutorial/pom.xml" ignore-vars="false" include-lines="13,17,18"}

2. `<dependencies>` 섹션에서 필요한 종속성을 추가합니다:

    ```xml
    ```
   {src="jvm-test-tutorial/pom.xml" include-lines="32,38-43,45-49,55"}

3. `<build><plugins>` 섹션에 Kotlin 플러그인을 추가합니다:

    ```xml
    ```
   {src="jvm-test-tutorial/pom.xml" include-lines="57-58,95-96,99-107"}

   Kotlin Maven 플러그인에서 `<extensions>true</extensions>`를 활성화하면 다음과 같은 이점이 있습니다:

   * 프로젝트에 `kotlin-stdlib` 종속성을 자동으로 추가합니다.
   * Kotlin을 먼저 컴파일한 다음 Java를 컴파일하도록 실행 단계를 구성합니다.
   * Java 코드에서 Kotlin 코드를 참조하고, 그 반대로도 참조할 수 있습니다.
   * JVM 타깃 버전을 Java 컴파일러 버전에 자동으로 맞춥니다.

   확장 기능(extensions)과 함께 Kotlin Maven 플러그인을 사용할 때는 `<build><pluginManagement>` 섹션에 별도의 `maven-compiler-plugin`이 필요하지 않습니다.

4. IDE에서 Maven 프로젝트를 다시 로드합니다.
5. 테스트를 실행하여 구성을 확인합니다:

    ```bash
    ./mvnw clean test
    ```

### Gradle {id="gradle"}

Gradle 프로젝트에서 Kotlin과 Java를 함께 사용하려면 `build.gradle.kts` 파일에 Kotlin JVM 플러그인을 적용하고 Kotlin 종속성을 추가하세요:

1. `plugins {}` 블록에 Kotlin JVM 플러그인을 추가합니다:

    ```kotlin
    plugins {
        // 기타 플러그인
        kotlin("jvm") version "%kotlinVersion%"
    }
    ```

2. Java 버전과 일치하도록 JVM 툴체인 버전을 설정합니다:

    ```kotlin
    kotlin {
        jvmToolchain(17)
    }
    ```

   이렇게 하면 Kotlin이 Java 코드와 동일한 JDK 버전을 사용하게 됩니다.

3. `dependencies {}` 블록에 Kotlin 테스트 유틸리티를 제공하고 JUnit과 통합되는 `kotlin("test")` 라이브러리를 추가합니다:

    ```kotlin
    dependencies {
        // 기타 종속성
    
        testImplementation(kotlin("test"))
        // 기타 테스트 종속성
    }
    ```

4. IDE에서 Gradle 프로젝트를 다시 로드합니다.
5. 테스트를 실행하여 구성을 확인합니다:

    ```bash
    ./gradlew clean test
    ```

## 프로젝트 구조 {id="project-structure"}

이 구성을 사용하면 동일한 소스 디렉터리에 Java와 Kotlin 파일을 함께 배치할 수 있습니다:

```none
src/
  ├── main/
  │    ├── java/          # Java 및 Kotlin 프로덕션 코드
  │    └── kotlin/        # 추가 Kotlin 프로덕션 코드 (선택 사항)
  └── test/
       ├── java/          # Java 및 Kotlin 테스트 코드
       └── kotlin/        # 추가 Kotlin 테스트 코드 (선택 사항)
```

이러한 디렉터리를 직접 생성하거나 첫 번째 Kotlin 파일을 추가할 때 IntelliJ IDEA가 생성하도록 할 수 있습니다.

Kotlin 플러그인은 `src/main/java` 및 `src/test/java` 디렉터리를 모두 자동으로 인식하므로, `.kt` 파일과 `.java` 파일을 동일한 디렉터리에 보관할 수 있습니다.

## Java 파일을 Kotlin으로 변환 {id="convert-java-files-to-kotlin"}

Kotlin 플러그인에는 Java 파일을 Kotlin으로 자동 변환해 주는 Java to Kotlin 변환기(_J2K_)도 번들로 제공됩니다.
파일에 J2K를 사용하려면 해당 파일의 컨텍스트 메뉴 또는 IntelliJ IDEA의 **Code** 메뉴에서 **Convert Java File to Kotlin File**을 클릭하세요.

![Convert Java to Kotlin](convert-java-to-kotlin.png){width=500}

변환기가 완벽하지는 않지만 대부분의 상용구(boilerplate) 코드를 Java에서 Kotlin으로 변환하는 작업을 꽤 훌륭하게 수행합니다.
하지만 때로는 약간의 수동 조정이 필요할 수 있습니다.

## 컴파일러 플러그인 살펴보기 {initial-collapse-state="collapsed" collapsible="true" id="explore-compiler-plugins"}

[Spring](https://spring.io/) 또는 JPA(Java Persistence API)를 사용하는 보다 복잡한 프로젝트가 있는 경우, 프레임워크의 요구사항에 맞게 Kotlin의 언어 기능을 자동으로 조정하여 상용구 코드를 줄여주는 Kotlin 컴파일러 플러그인을 사용할 수 있습니다:

* **[`all-open`](all-open-plugin.md)** 플러그인은 특정 어노테이션과 함께 사용될 때 클래스와 그 멤버를 자동으로 `open`으로 만듭니다. 이는 클래스가 non-final이어야 하는 Spring과 같은 프레임워크에 특히 유용합니다.

  Spring의 경우 `all-open` 위에 래핑된 전용 [`kotlin-spring`](kotlin-spring-plugin.md) 플러그인을 사용할 수 있습니다. 이 플러그인은 Spring 어노테이션을 자동으로 지정합니다.
* **[`no-arg`](no-arg-plugin.md)** 플러그인은 특정 어노테이션이 있는 클래스에 인자 없는 생성자(zero-argument constructor)를 추가로 생성합니다. 이를 통해 JPA는 기본 생성자가 없는 클래스도 인스턴스화할 수 있게 됩니다.

  JPA의 경우 `no-arg`와 `all-open`을 모두 래핑하는 [`kotlin-jpa`](kotlin-jpa-plugin.md) 플러그인을 사용할 수 있습니다. JPA 어노테이션을 자동으로 지정하므로 엔티티가 `open` 상태가 되고 인자 없는 생성자가 추가됩니다.
* **[`power-assert`](power-assert.md)** 플러그인은 단언문(assertions)에 대한 문맥 정보를 담은 자세한 실패 메시지를 제공하여 디버깅 환경을 개선합니다. 중간 값을 보여주어 테스트가 실패한 이유를 이해하는 데 도움을 줍니다.

## 다음 단계 {id="next-step"}

Java 프로젝트에서 Kotlin을 시작하는 가장 쉬운 방법은 Kotlin 테스트를 먼저 추가하는 것입니다:

[Java 프로젝트에 첫 번째 Kotlin 테스트 추가하기](jvm-test-using-junit.md)

### 참고 항목 {id="see-also"}

* [Kotlin 및 Java 상호 운용성 세부 정보](java-to-kotlin-interop.md)
* [Maven 빌드 구성 참조](maven.md)