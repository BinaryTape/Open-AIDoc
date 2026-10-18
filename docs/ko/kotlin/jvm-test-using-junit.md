[//]: # (title: Kotlin과 JUnit을 사용하여 Java 코드 테스트하기 – 튜토리얼)

<web-summary>Kotlin으로 작성된 JUnit 테스트를 통합할 수 있도록 Maven 또는 Gradle로 빌드된 Java 프로젝트를 설정합니다.</web-summary>

Kotlin은 Java와 완벽하게 상호 운용되므로, Kotlin을 사용하여 Java 코드에 대한 테스트를 작성하고 동일한 프로젝트 내에서 기존 Java 테스트와 함께 실행할 수 있습니다.

이 튜토리얼에서는 다음 내용을 배웁니다:

* [JUnit](https://junit.org/)을 사용하여 테스트를 실행하도록 Java-Kotlin 혼합 프로젝트를 구성하는 방법.
* Java 코드를 검증하는 Kotlin 테스트를 추가하는 방법.
* Maven 또는 Gradle을 사용하여 테스트를 실행하는 방법.

> 시작하기 전에 다음 사항이 준비되어 있는지 확인하세요:
>
> * [Kotlin 확장 기능](https://github.com/Kotlin/kotlin-lsp/tree/main?tab=readme-ov-file#vs-code-quick-start)이 설치된 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/) 또는 [VS Code](https://code.visualstudio.com/Download).
> * Java 17 이상.
>
{style="note"}

## 프로젝트 구성하기 {id="configure-the-project"}

1. IDE에서 버전 관리 시스템(VCS)을 통해 샘플 프로젝트를 복제(clone)합니다:

   ```text
   https://github.com/kotlin-hands-on/kotlin-junit-sample.git
   ```

2. `initial` 모듈로 이동하여 프로젝트 구조를 살펴봅니다:

    ```text
    kotlin-junit-sample/
    ├── initial/
    │   ├── src/
    │   │   ├── main/java/    # Java 소스 코드
    │   │   └── test/java/    # Java로 작성된 JUnit 테스트
    │   ├── pom.xml           # Maven 구성
    │   └── build.gradle.kts  # Gradle 구성
    ```

   `initial` 모듈에는 단일 테스트가 포함된 Java 기반의 간단한 Todo 애플리케이션이 들어 있습니다.

3. 동일한 디렉터리에서 빌드 파일을 열고 Kotlin을 지원하도록 내용을 업데이트합니다:

    <tabs group="build-system">
    <tab title="Maven" group-key="maven">

    ```xml
    ```
   {src="jvm-test-tutorial/pom.xml" initial-collapse-state="collapsed" collapsible="true" ignore-vars="false" collapsed-title="pom.xml file"}

    * `<properties>` 섹션에서 Kotlin 버전을 설정합니다.
    * `<dependencies>` 섹션에 테스트를 실행하기 위한 JUnit Jupiter 의존성을 추가합니다.
    * `<build><plugins>` 섹션에서 `<extensions>`를 `true`로 설정하여 `kotlin-maven-plugin`을 적용합니다. 이렇게 하면 빌드에 해당하는 execution과 `kotlin-stdlib` 의존성이 자동으로 추가됩니다.
    * 확장 기능(extensions)과 함께 Kotlin Maven 플러그인을 사용할 때는 `<build><pluginManagement>` 섹션에 `maven-compiler-plugin`을 추가할 필요가 없습니다.

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
    * `dependencies {}` 블록에 Kotlin의 테스트 유틸리티를 제공하고 JUnit과 통합되는 `kotlin.test` 라이브러리를 추가합니다.
      
    Kotlin/JVM은 최신 안정화 버전인 JUnit 6을 지원합니다. 이 버전은 `gradle/libs.versions.toml` 버전 카탈로그(Version Catalog)에서 확인할 수 있습니다.
   
    버전 카탈로그 사용을 선호하는 경우 `kotlin("jvm")` 플러그인을 그곳에 추가할 수도 있습니다:

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

빌드 파일 설정에 대한 자세한 지침은 [프로젝트 구성](mixing-java-kotlin-intellij.md#project-configuration)을 참조하세요.

## 첫 번째 Kotlin 테스트 추가하기 {id="add-your-first-kotlin-test"}

`initial/src/test/java`에 있는 `TodoItemTest.java` 테스트는 이미 항목 생성, 기본값, 고유 ID, 상태 변경 등 애플리케이션의 기본 동작을 검증하고 있습니다.

리포지토리 수준의 동작을 검증하는 Kotlin 테스트를 추가하여 테스트 커버리지를 확장할 수 있습니다:

1. 동일한 테스트 소스 디렉터리인 `initial/src/test/java`로 이동합니다.
2. Java 테스트와 동일한 패키지에 `TodoRepositoryTest.kt` 파일을 생성합니다.
3. 필드 선언 및 설정(setup) 함수를 포함한 테스트 클래스를 작성합니다:

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

    * JUnit 애너테이션은 Java에서와 마찬가지로 Kotlin에서도 동일하게 작동합니다.
    * Kotlin의 [`lateinit` 키워드](properties.md#late-initialized-properties-and-variables)를 사용하면 나중에 초기화되는 널이 될 수 없는(non-null) 프로퍼티를 선언할 수 있습니다.
      이를 통해 테스트에서 널 허용 타입(`TodoRepository?`)을 사용할 필요가 없습니다.

4. `TodoRepositoryTest` 클래스 내에 초기 리포지토리 상태와 크기를 확인하는 테스트를 추가합니다:

   ```kotlin
   @Test
   @DisplayName("Should start with empty repository")
   fun shouldStartEmpty() {
       Assertions.assertEquals(0, repository.size())
       Assertions.assertTrue(repository.all.isEmpty())
   }
   ```

    * Java의 static import와 달리, Jupiter의 `Assertions`는 클래스로 임포트되어 단언(assertion) 함수의 한정자(qualifier)로 사용됩니다.
    * `.getAll()`을 호출하는 대신 Kotlin에서는 `repository.all`과 같이 Java getter를 프로퍼티로 접근할 수 있습니다.

5. 모든 항목에 대한 복사 동작을 검증하는 또 다른 테스트를 작성합니다:

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
    * 별도의 줄 바꿈 문자 없이도 복잡한 단언문을 여러 줄로 나눌 수 있습니다.

6. ID로 항목을 찾는 동작을 검증하는 테스트를 추가합니다:

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

   Kotlin은 Java의 [`Optional` API](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Optional.html)와 매끄럽게 연동됩니다.
   getter 메서드가 프로퍼티로 자동 변환되므로, 여기서는 `isPresent()` 메서드에 프로퍼티 형태로 접근할 수 있습니다.

7. 항목 삭제 메커니즘을 검증하는 테스트를 작성합니다:

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

   Kotlin에서는 `repository.getById(id).isEmpty`처럼 메서드 호출과 프로퍼티 접근을 연결(체이닝)할 수 있습니다.

> 추가적인 기능을 다루기 위해 `TodoRepositoryTest` 테스트 클래스에 더 많은 테스트를 추가할 수 있습니다.
> 샘플 프로젝트의 [`complete`](https://github.com/kotlin-hands-on/kotlin-junit-sample/blob/main/complete/src/test/java/org/jetbrains/kotlin/junit/TodoRepositoryTest.kt) 모듈에서 전체 소스 코드를 확인하세요.
>
{style="tip"}

## 테스트 실행하기 {id="run-tests"}

Java 및 Kotlin 테스트를 모두 실행하여 프로젝트가 정상적으로 동작하는지 확인합니다:

1. 거터(gutter) 아이콘을 사용하여 테스트를 실행합니다:

   ![테스트 실행](run-test.png)

   명령줄을 사용하여 `initial` 디렉터리에서 프로젝트의 모든 테스트를 실행할 수도 있습니다:

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

2. 변수 값 중 하나를 변경하여 테스트가 올바르게 작동하는지 확인합니다.
   예를 들어, `shouldAddItem` 테스트를 수정하여 잘못된 리포지토리 크기를 기대하도록 만듭니다:

   ```kotlin
   @Test
   @DisplayName("Should add item to repository")
   fun shouldAddItem() {
       repository.add(testItem1)

       Assertions.assertEquals(2, repository.size())  // 1에서 2로 변경
       Assertions.assertTrue(repository.all.contains(testItem1))
   }
   ```

3. 테스트를 다시 실행하고 실패하는지 확인합니다:

   ![테스트 결과 확인. 테스트가 실패함](test-failed.png)

> 테스트가 완전히 구성된 프로젝트는 샘플 프로젝트의
> [`complete`](https://github.com/kotlin-hands-on/kotlin-junit-sample/tree/main/complete) 모듈에서 확인할 수 있습니다.
>
{style="tip"}

## 다음 단계 {id="what-s-next"}

* [Maven을 사용한 Kotlin 프로젝트 테스트](jvm-test-maven.md)에 대해 자세히 알아보세요.
* [Kotlin 백엔드 개발 FAQ](jvm-backend-faq.md)에서 자주 묻는 질문에 대한 답변을 찾아보세요.