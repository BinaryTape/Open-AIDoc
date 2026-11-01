[//]: # (title: Kotlin과 JUnit을 사용하여 Java 코드 테스트하기 – 튜토리얼)

<web-summary>Maven 또는 Gradle로 빌드된 Java 프로젝트를 설정하여 Kotlin으로 작성된 JUnit 테스트를 통합합니다.</web-summary>

Kotlin은 Java와 완벽하게 상호 운용되므로, Kotlin을 사용하여 Java 코드에 대한 테스트를 작성하고 동일한 프로젝트 내에서 기존 Java 테스트와 함께 실행할 수 있습니다.

이 튜토리얼에서는 다음 방법을 배웁니다.

* [JUnit](https://junit.org/)을 사용하여 테스트를 실행하도록 Java-Kotlin 혼합 프로젝트 구성하기.
* Java 코드를 검증하는 Kotlin 테스트 추가하기.
* Maven 또는 Gradle을 사용하여 테스트 실행하기.

> 시작하기 전에 다음 사항이 준비되어 있는지 확인하세요.
>
> * [IntelliJ IDEA](https://www.jetbrains.com/idea/download/) 또는 [Kotlin 확장 프로그램](https://github.com/Kotlin/kotlin-lsp/tree/main?tab=readme-ov-file#vs-code-quick-start)이 설치된 [VS Code](https://code.visualstudio.com/Download).
> * Java 17 이상.
>
{style="note"}

## 프로젝트 구성하기 {id="configure-the-project"}

1. IDE에서 버전 관리 시스템(VCS)으로부터 샘플 프로젝트를 복제합니다.

   ```text
   https://github.com/kotlin-hands-on/kotlin-junit-sample.git
   ```

2. `initial` 모듈로 이동하여 프로젝트 구조를 살펴봅니다.

    ```text
    kotlin-junit-sample/
    ├── initial/
    │   ├── src/
    │   │   ├── main/java/    # Java source code
    │   │   └── test/java/    # JUnit test in Java
    │   ├── pom.xml           # Maven configuration
    │   └── build.gradle.kts  # Gradle configuration
    ```

   `initial` 모듈에는 단일 테스트가 포함된 Java 기반의 간단한 Todo 애플리케이션이 들어 있습니다.

3. 동일한 디렉터리에서 빌드 파일을 열고 Kotlin을 지원하도록 내용을 업데이트합니다.

    <tabs group="build-system">
    <tab title="Maven" group-key="maven">

    ```xml
    <?xml version="1.0" encoding="UTF-8"?>
    <project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
             xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
        <modelVersion>4.0.0</modelVersion>
    
        <groupId>org.jetbrains.kotlin</groupId>
        <artifactId>kotlin-junit-complete</artifactId>
        <version>1.0-SNAPSHOT</version>
    
        <name>kotlin-junit-complete</name>
        <url>https://kotlinlang.org/docs/jvm-test-using-junit.htm</url>
    
        <properties>
            <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
            <maven.compiler.release>17</maven.compiler.release>
            <jexer.version>1.6.0</jexer.version>
            <kotlin.version>%kotlinVersion%</kotlin.version>
        </properties>
    
        <dependencyManagement>
            <dependencies>
                <dependency>
                    <groupId>org.junit</groupId>
                    <artifactId>junit-bom</artifactId>
                    <version>6.0.3</version>
                    <type>pom</type>
                    <scope>import</scope>
                </dependency>
            </dependencies>
        </dependencyManagement>
    
        <dependencies>
            <dependency>
                <groupId>org.junit.jupiter</groupId>
                <artifactId>junit-jupiter-api</artifactId>
                <scope>test</scope>
            </dependency>
            <!-- Add JUnit Jupiter engine for test runtime -->
            <dependency>
                <groupId>org.junit.jupiter</groupId>
                <artifactId>junit-jupiter-engine</artifactId>
                <scope>test</scope>
            </dependency>
            <!-- Optionally: parameterized tests support -->
            <dependency>
                <groupId>org.junit.jupiter</groupId>
                <artifactId>junit-jupiter-params</artifactId>
                <scope>test</scope>
            </dependency>
            <dependency>
                <groupId>com.gitlab.klamonte</groupId>
                <artifactId>jexer</artifactId>
                <version>${jexer.version}</version>
            </dependency>
        </dependencies>
    
        <build>
            <pluginManagement><!-- Lock down plugin versions to avoid using Maven defaults (can be moved to a parent pom file) -->
                <plugins>
                    <!-- Clean lifecycle, see https://maven.apache.org/ref/current/maven-core/lifecycles.html#clean_Lifecycle -->
                    <plugin>
                        <artifactId>maven-clean-plugin</artifactId>
                        <version>3.4.0</version>
                    </plugin>
                    <!-- Default lifecycle, jar packaging: see https://maven.apache.org/ref/current/maven-core/default-bindings.html#Plugin_bindings_for_jar_packaging -->
                    <plugin>
                        <artifactId>maven-resources-plugin</artifactId>
                        <version>3.3.1</version>
                    </plugin>
                    <plugin>
                        <artifactId>maven-surefire-plugin</artifactId>
                        <version>3.3.0</version>
                    </plugin>
                    <plugin>
                        <artifactId>maven-jar-plugin</artifactId>
                        <version>3.4.2</version>
                    </plugin>
                    <plugin>
                        <artifactId>maven-install-plugin</artifactId>
                        <version>3.1.2</version>
                    </plugin>
                    <plugin>
                        <artifactId>maven-deploy-plugin</artifactId>
                        <version>3.1.2</version>
                    </plugin>
                    <!-- Site lifecycle, see https://maven.apache.org/ref/current/maven-core/lifecycles.html#site_Lifecycle -->
                    <plugin>
                        <artifactId>maven-site-plugin</artifactId>
                        <version>3.12.1</version>
                    </plugin>
                    <plugin>
                        <artifactId>maven-project-info-reports-plugin</artifactId>
                        <version>3.6.1</version>
                    </plugin>
                    <!-- No maven-compiler-plugin needed with Kotlin extensions -->
                </plugins>
            </pluginManagement>
            <plugins>
                <!-- Activate Kotlin Maven plugin for main and test sources -->
                <plugin>
                    <groupId>org.jetbrains.kotlin</groupId>
                    <artifactId>kotlin-maven-plugin</artifactId>
                    <version>${kotlin.version}</version>
                    <extensions>true</extensions>
                </plugin>
            </plugins>
        </build>
    </project>
    ```
   {initial-collapse-state="collapsed" collapsible="true" collapsed-title="pom.xml file"}

    * `<properties>` 섹션에서 Kotlin 버전을 설정합니다.
    * `<dependencies>` 섹션에 테스트를 실행하기 위한 JUnit Jupiter 의존성을 추가합니다.
    * `<build><plugins>` 섹션에서 `<extensions>`를 `true`로 설정하여 `kotlin-maven-plugin`을 적용합니다. 이렇게 하면 빌드에 해당하는 executions와 `kotlin-stdlib` 의존성이 자동으로 추가됩니다.
    * extensions가 활성화된 Kotlin Maven 플러그인을 사용하는 경우, `<build><pluginManagement>` 섹션에 `maven-compiler-plugin`을 추가할 필요가 없습니다.

    </tab>
    <tab title="Gradle" group-key="gradle">

    ```kotlin
    // build.gradle.kts
    group = "org.jetbrains.kotlin"
    version = "1.0-SNAPSHOT"
    description = "kotlin-junit-complete"
    java.sourceCompatibility = JavaVersion.VERSION_17
    
    plugins {
        application
        kotlin("jvm") version "%kotlinVersion%"
    }

    kotlin {
        jvmToolchain(17)
    }

    application {
        mainClass.set("org.jetbrains.kotlin.junit.App")
    }

    repositories {
        mavenCentral()
    }

    dependencies {
        implementation("com.gitlab.klamonte:jexer:1.6.0")

        testImplementation(kotlin("test"))
        testImplementation(libs.org.junit.jupiter.junit.jupiter.api)
        testImplementation(libs.org.junit.jupiter.junit.jupiter.params)
        testRuntimeOnly(libs.org.junit.jupiter.junit.jupiter.engine)
        testRuntimeOnly(libs.org.junit.platform.junit.platform.launcher)
    }

    tasks.test {
        useJUnitPlatform()
    }
    ```
   {initial-collapse-state="collapsed" collapsible="true" collapsed-title="build.gradle.kts"}

    * `plugins {}` 블록에 `kotlin("jvm")` 플러그인을 추가합니다.
    * JVM 툴체인 버전을 Java 버전과 일치하도록 설정합니다.
    * `dependencies {}` 블록에 Kotlin의 테스트 유틸리티를 제공하고 JUnit과 연동되는 `kotlin.test` 라이브러리를 추가합니다.
      
    Kotlin/JVM은 최신 안정화 JUnit 버전인 JUnit 6을 지원합니다. `gradle/libs.versions.toml` 버전 카탈로그에서 확인할 수 있습니다.
   
    일반적으로 버전 카탈로그 사용을 선호하는 경우, 다음과 같이 `kotlin("jvm")` 플러그인을 카탈로그에 직접 추가할 수도 있습니다.

    ```toml
    # gradle/libs.versions.toml
    [versions]
    kotlin = "%kotlinVersion%"
    junit = "6.0.3"

    [libraries]
    org-junit-jupiter-junit-jupiter-api = { module = "org.junit.jupiter:junit-jupiter-api", version.ref = "junit" }
    org-junit-jupiter-junit-jupiter-params = { module = "org.junit.jupiter:junit-jupiter-params", version.ref = "junit" }
    org-junit-jupiter-junit-jupiter-engine = { module = "org.junit.jupiter:junit-jupiter-engine", version.ref = "junit" }
    org-junit-platform-junit-platform-launcher = { module = "org.junit.platform:junit-platform-launcher" }
      
    [plugins]
    kotlinJvm = { id = "org.jetbrains.kotlin.jvm", version.ref = "kotlin" }
    ```
    {initial-collapse-state="collapsed" collapsible="true" collapsed-title="libs.versions.toml"}

    </tab>
    </tabs>

4. IDE에서 빌드 파일을 다시 로드합니다.

빌드 파일 설정에 대한 자세한 내용은 [프로젝트 구성](mixing-java-kotlin-intellij.md#project-configuration)을 참고하세요.

## 첫 번째 Kotlin 테스트 추가하기 {id="add-your-first-kotlin-test"}

`initial/src/test/java`에 있는 `TodoItemTest.java` 테스트는 이미 항목 생성, 기본값, 고유 ID 및 상태 변경과 같은 앱의 기본 동작을 검증하고 있습니다.

리포지토리 수준의 동작을 검증하는 Kotlin 테스트를 추가하여 테스트 커버리지를 확장할 수 있습니다.

1. 동일한 테스트 소스 디렉터리인 `initial/src/test/java`로 이동합니다.
2. Java 테스트와 동일한 패키지에 `TodoRepositoryTest.kt` 파일을 생성합니다.
3. 필드 선언 및 셋업(setup) 함수를 포함한 테스트 클래스를 작성합니다.

   ```kotlin
   package org.jetbrains.kotlin.junit

   import org.junit.jupiter.api.BeforeEach
   import org.junit.jupiter.api.Assertions
   import org.junit.jupiter.api.Test
   import org.junit.jupiter.api.DisplayName

   internal class TodoRepositoryTest {
       lateinit var repository: TodoRepository
       lateinit var testItem1: TodoItem
       lateinit var testItem2: TodoItem

       @BeforeEach
       fun setUp() {
           repository = TodoRepository()
           testItem1 = TodoItem("Task 1", "Description 1")
           testItem2 = TodoItem("Task 2", "Description 2")
       }
   }
   ```

    * JUnit 어노테이션은 Java에서와 마찬가지로 Kotlin에서도 동일하게 작동합니다.
    * Kotlin에서는 [`lateinit` 키워드](properties.md#late-initialized-properties-and-variables)를 사용하여 나중에 초기화되는 non-null 프로퍼티를 선언할 수 있습니다.
      이를 통해 테스트에서 널 허용 타입(`TodoRepository?`)을 사용해야 하는 번거로움을 피할 수 있습니다.

4. `TodoRepositoryTest` 클래스 내에 초기 리포지토리 상태와 크기를 확인하는 테스트를 추가합니다.

   ```kotlin
   @Test
   @DisplayName("Should start with empty repository")
   fun shouldStartEmpty() {
       Assertions.assertEquals(0, repository.size())
       Assertions.assertTrue(repository.all.isEmpty())
   }
   ```

    * Java의 static import와 달리, Jupiter의 `Assertions`는 클래스로 임포트되어 단언(assertion) 함수의 한정자로 사용됩니다.
    * `.getAll()`을 호출하는 대신, Kotlin에서는 `repository.all`과 같이 Java 게터(getter)에 프로퍼티 형태로 접근할 수 있습니다.

5. 모든 항목에 대한 방어적 복사(defensive copy) 동작을 검증하는 또 다른 테스트를 작성합니다.

   ```kotlin
   @Test
   @DisplayName("Should return defensive copy of items")
   fun shouldReturnDefensiveCopy() {
       repository.add(testItem1)

       val items1 = repository.all
       val items2 = repository.all

       Assertions.assertNotSame(items1, items2)
       Assertions.assertThrows(
           UnsupportedOperationException::class.java
       ) { items1.clear() }
       Assertions.assertEquals(1, repository.size())
   }
   ```

    * Kotlin 클래스에서 Java 클래스 객체를 가져오려면 `::class.java`를 사용합니다.
    * 특별한 줄바꿈 연결 문자 없이도 복잡한 단언문을 여러 줄에 걸쳐 작성할 수 있습니다.

6. ID로 항목을 찾는 동작을 검증하는 테스트를 추가합니다.

   ```kotlin
   @Test
   @DisplayName("Should find item by ID")
   fun shouldFindItemById() {
       repository.add(testItem1)
       repository.add(testItem2)

        val found = repository.getById(testItem1.id())

        Assertions.assertTrue(found.isPresent)
        Assertions.assertEquals(testItem1, found.get())
   }
   ```

   Kotlin은 Java의 [`Optional` API](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Optional.html)와 원활하게 연동됩니다.
   게터 메서드를 프로퍼티로 자동 변환하므로, 여기서는 `isPresent()` 메서드에 프로퍼티로 접근합니다.

7. 항목 제거 메커니즘을 검증하는 테스트를 작성합니다.

   ```kotlin
    @Test
    @DisplayName("Should remove item by ID")
    fun shouldRemoveItemById() {
        repository.add(testItem1)
        repository.add(testItem2)

        val removed = repository.remove(testItem1.id())

        Assertions.assertTrue(removed)
        Assertions.assertEquals(1, repository.size())
        Assertions.assertTrue(repository.getById(testItem1.id()).isEmpty)
        Assertions.assertTrue(repository.getById(testItem2.id()).isPresent)
    }
   
    @Test
    @DisplayName("Should return false when removing non-existent item")
    fun shouldReturnFalseForNonExistentRemoval() {
        repository.add(testItem1)

        val removed = repository.remove("non-existent-id")

        Assertions.assertFalse(removed)
        Assertions.assertEquals(1, repository.size())
    }
   ```

   Kotlin에서는 `repository.getById(id).isEmpty`처럼 메서드 호출과 프로퍼티 접근을 체이닝할 수 있습니다.

> `TodoRepositoryTest` 테스트 클래스에 테스트를 추가하여 다른 기능을 더 검증할 수도 있습니다.
> 전체 소스 코드는 샘플 프로젝트의 [`complete`](https://github.com/kotlin-hands-on/kotlin-junit-sample/blob/main/complete/src/test/java/org/jetbrains/kotlin/junit/TodoRepositoryTest.kt) 모듈에서 확인할 수 있습니다.
>
{style="tip"}

## 테스트 실행하기 {id="run-tests"}

Java 및 Kotlin 테스트를 모두 실행하여 프로젝트가 예상대로 작동하는지 확인합니다.

1. 거터(gutter) 아이콘을 사용하여 테스트를 실행합니다.

   ![Run the test](run-test.png)

   명령줄을 사용하여 `initial` 디렉터리에서 모든 프로젝트 테스트를 실행할 수도 있습니다.

    <tabs group="build-system">
    <tab title="Maven" group-key="maven">

    ```bash
    mvn test
    ```

    </tab>
    <tab title="Gradle" group-key="gradle">

    ```bash
    ./gradlew test
    ```

    </tab>
    </tabs>

2. 변수 값 중 하나를 변경하여 테스트가 제대로 작동하는지 확인합니다.
   예를 들어, `shouldAddItem` 테스트를 수정하여 잘못된 리포지토리 크기를 기대하도록 만듭니다.

   ```kotlin
   @Test
   @DisplayName("Should add item to repository")
   fun shouldAddItem() {
       repository.add(testItem1)

       Assertions.assertEquals(2, repository.size())  // Changed from 1 to 2
       Assertions.assertTrue(repository.all.contains(testItem1))
   }
   ```

3. 테스트를 다시 실행하고 실패하는지 확인합니다.

   ![Check the test result. The test has failed](test-failed.png)

> 테스트가 완전히 구성된 프로젝트는 샘플 프로젝트의
> [`complete`](https://github.com/kotlin-hands-on/kotlin-junit-sample/tree/main/complete) 모듈에서 확인할 수 있습니다.
>
{style="tip"}

## 다음 단계 {id="what-s-next"}

* [Maven으로 Kotlin 프로젝트 테스트하기](jvm-test-maven.md)에 대해 자세히 알아보세요.
* [Kotlin 백엔드 개발 FAQ](jvm-backend-faq.md)에서 자주 묻는 질문에 대한 답변을 찾아보세요.