[//]: # (title: Java 프로젝트에 Kotlin 추가하기 – 튜토리얼)

<web-summary>기존 Java 프로젝트에 Kotlin을 통합해 보세요 − Maven 또는 Gradle 빌드 파일 설정, 소스 파일 정리, IntelliJ IDEA에서 Java 코드를 Kotlin으로 변환하기.</web-summary>

Kotlin은 Java와 완벽하게 상호 운용되므로, 모든 코드를 처음부터 다시 작성하지 않고도 기존 Java 프로젝트에 점진적으로 도입할 수 있습니다.

이 튜토리얼에서는 다음 내용을 배웁니다:

* Java 및 Kotlin 코드를 모두 컴파일하도록 Maven 또는 Gradle 빌드 도구 설정하기.
* 프로젝트 디렉터리에서 Java 및 Kotlin 소스 파일 정리하기.
* IntelliJ IDEA를 사용하여 Java 파일을 Kotlin으로 변환하기.

> 이 튜토리얼에는 기존의 모든 Java 프로젝트를 사용할 수 있으며, Maven과 Gradle 빌드 파일이 이미 설정된 공개 [샘플 프로젝트](https://github.com/kotlin-hands-on/kotlin-junit-sample/tree/main/complete)를 클론하여 사용할 수도 있습니다.
> 
> 또한 준비된 [스킬](https://github.com/Kotlin/kotlin-agent-skills/blob/main/skills/kotlin-tooling-java-to-kotlin/SKILL.md)을 사용하여 원하는 AI 에이전트에 변환 작업을 맡길 수도 있습니다. 단, AI 처리 결과는 완전히 예측할 수 없다는 점에 유의하세요.
>
{style="tip"}

## 프로젝트 설정 {id="project-configuration"}

Java 프로젝트에 Kotlin을 추가하려면 사용하는 빌드 도구에 따라 프로젝트가 Kotlin과 Java를 모두 사용하도록 설정해야 합니다.

프로젝트 설정을 통해 Kotlin과 Java 코드가 모두 올바르게 컴파일되고 원활하게 서로를 참조할 수 있도록 합니다.

### Maven {id="maven"}

> **IntelliJ IDEA 2025.3**부터는 Maven 기반 Java 프로젝트에 첫 번째 Kotlin 파일을 추가할 때,  
> IDE가 `pom.xml` 파일을 자동으로 업데이트하여 Kotlin Maven 플러그인과 표준 종속성을 포함합니다.  
> 버전이나 빌드 단계를 직접 커스텀하려는 경우에는 여전히 수동으로 설정할 수 있습니다.
>
{style="note"}

Maven 프로젝트에서 Kotlin과 Java를 함께 사용하려면, `pom.xml` 파일에 Kotlin Maven 플러그인을 적용하고 Kotlin 종속성을 추가합니다:

1. `<properties>` 섹션에 Kotlin 버전 프로퍼티를 추가합니다:

    ```xml
    <properties>
        <kotlin.version>%kotlinVersion%</kotlin.version>
    </properties>
    ```

2. `<dependencies>` 섹션에 필요한 종속성을 추가합니다:

    ```xml
    <dependencies>
        <!-- 테스트 런타임을 위한 JUnit Jupiter 엔진 추가 -->
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter-engine</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter-params</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    ```

3. `<build><plugins>` 섹션에 Kotlin 플러그인을 추가합니다:

    ```xml
    <build>
        <pluginManagement><!-- Maven 기본값 사용을 방지하기 위해 플러그인 버전 고정(부모 pom 파일로 이동 가능) -->
                <!-- Kotlin 확장을 사용하면 maven-compiler-plugin이 필요하지 않음 -->
            </plugins>
            <!-- 메인 및 테스트 소스를 위한 Kotlin Maven 플러그인 활성화 -->
            <plugin>
                <groupId>org.jetbrains.kotlin</groupId>
                <artifactId>kotlin-maven-plugin</artifactId>
                <version>${kotlin.version}</version>
                <extensions>true</extensions>
            </plugin>
        </plugins>
    </build>
    ```

   Kotlin Maven 플러그인에서 `<extensions>true</extensions>`를 활성화하면 다음과 같은 이점이 있습니다:

   * 프로젝트에 `kotlin-stdlib` 종속성을 자동으로 추가합니다.
   * Kotlin을 먼저 컴파일한 다음 Java를 컴파일하도록 실행 단계를 구성합니다.
   * Java 코드에서 Kotlin 코드를 참조하고 그 반대로도 참조할 수 있습니다.
   * JVM 타깃 버전을 Java 컴파일러 버전에 자동으로 맞춥니다.

   확장(extensions)이 포함된 Kotlin Maven 플러그인을 사용하는 경우 `<build><pluginManagement>` 섹션에 별도의 `maven-compiler-plugin`이 필요하지 않습니다.

4. IDE에서 Maven 프로젝트를 다시 로드합니다.
5. 테스트를 실행하여 설정을 확인합니다:

    ```bash
    ./mvnw clean test
    ```

### Gradle {id="gradle"}

Gradle 프로젝트에서 Kotlin과 Java를 함께 사용하려면, `build.gradle.kts` 파일에 Kotlin JVM 플러그인을 적용하고 Kotlin 종속성을 추가합니다:

1. `plugins {}` 블록에 Kotlin JVM 플러그인을 추가합니다:

    ```kotlin
    plugins {
        // 기타 플러그인
        kotlin("jvm") version "%kotlinVersion%"
    }
    ```

2. Java 버전에 맞춰 JVM 툴체인 버전을 설정합니다:

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
5. 테스트를 실행하여 설정을 확인합니다:

    ```bash
    ./gradlew clean test
    ```

## 프로젝트 구조 {id="project-structure"}

이 설정을 통해 동일한 소스 디렉터리에 Java와 Kotlin 파일을 함께 배치할 수 있습니다:

```none
src/
  ├── main/
  │    ├── java/          # Java 및 Kotlin 프로덕션 코드
  │    └── kotlin/        # 추가 Kotlin 프로덕션 코드 (선택 사항)
  └── test/
       ├── java/          # Java 및 Kotlin 테스트 코드
       └── kotlin/        # 추가 Kotlin 테스트 코드 (선택 사항)
```

이러한 디렉터리를 수동으로 생성하거나, 첫 번째 Kotlin 파일을 추가할 때 IntelliJ IDEA가 자동으로 생성하도록 할 수도 있습니다.

Kotlin 플러그인은 `src/main/java` 및 `src/test/java` 디렉터리를 모두 자동으로 인식하므로, 동일한 디렉터리에 `.kt` 파일과 `.java` 파일을 함께 둘 수 있습니다.

## Java 파일을 Kotlin으로 변환하기 {id="convert-java-files-to-kotlin"}

Kotlin 플러그인에는 Java 파일을 Kotlin으로 자동 변환해 주는 Java-Kotlin 변환기(_J2K_)도 포함되어 있습니다.
파일에 J2K를 사용하려면 해당 파일의 컨텍스트 메뉴 또는 IntelliJ IDEA의 **Code** 메뉴에서 **Convert Java File to Kotlin File**을 클릭하세요.

![Convert Java to Kotlin](convert-java-to-kotlin.png){width=500}

이 변환기가 완벽하지는 않지만 대부분의 상용구 코드를 Java에서 Kotlin으로 꽤 훌륭하게 변환해 줍니다.
다만 때로는 약간의 수동 수정이 필요할 수 있습니다.

## 컴파일러 플러그인 살펴보기 {initial-collapse-state="collapsed" collapsible="true" id="explore-compiler-plugins"}

[Spring](https://spring.io/)이나 Java Persistence API(JPA)를 사용하는 더 복잡한 프로젝트의 경우, Kotlin 언어 기능을 프레임워크 요구 사항에 맞게 자동으로 조정하여 상용구 코드를 줄여주는 Kotlin 컴파일러 플러그인을 사용할 수 있습니다:

* **[`all-open`](all-open-plugin.md)** 플러그인은 특정 어노테이션과 함께 사용될 때 클래스와 그 멤버를 자동으로 `open`으로 만듭니다. 이는 클래스가 final이 아니어야 하는 Spring과 같은 프레임워크에 특히 유용합니다.

  Spring의 경우 `all-open`을 기반으로 래핑된 전용 [`kotlin-spring`](kotlin-spring-plugin.md) 플러그인을 사용할 수 있습니다. 이 플러그인은 Spring 어노테이션을 자동으로 지정해 줍니다.
* **[`no-arg`](no-arg-plugin.md)** 플러그인은 특정 어노테이션이 있는 클래스에 대해 인자 없는 생성자(zero-argument constructor)를 추가로 생성합니다. 이를 통해 JPA가 기본 생성자가 없는 클래스를 인스턴스화할 수 있게 해줍니다.

  JPA의 경우 `no-arg`와 `all-open`을 모두 래핑하는 [`kotlin-jpa`](kotlin-jpa-plugin.md) 플러그인을 사용할 수 있습니다. JPA 어노테이션을 자동으로 지정하므로 엔티티가 `open` 상태가 되고 인자 없는 생성자를 갖게 됩니다.
* **[`power-assert`](power-assert.md)** 플러그인은 단언문(assertion)에 대한 문맥 정보와 함께 상세한 실패 메시지를 제공하여 디버깅 환경을 개선합니다. 중간 값을 보여주어 테스트가 실패한 이유를 이해하는 데 도움을 줍니다.

## 다음 단계 {id="next-step"}

Java 프로젝트에서 Kotlin을 사용하는 가장 쉬운 방법은 Kotlin 테스트를 먼저 추가하는 것입니다:

[Java 프로젝트에 첫 번째 Kotlin 테스트 추가하기](jvm-test-using-junit.md)

### 참고 항목 {id="see-also"}

* [Kotlin 및 Java 상호 운용성 세부 정보](java-to-kotlin-interop.md)
* [Maven 빌드 설정 레퍼런스](maven.md)