[//]: # (title: Power-assert 컴파일러 플러그인)
<primary-label ref="experimental-opt-in"/>

Kotlin Power-assert 컴파일러 플러그인은 문맥 정보가 포함된 상세한 실패 메시지를 제공하여 디버깅 경험을 개선합니다.
이 플러그인은 실패 메시지에 중간값(intermediate values)을 자동으로 생성하여 테스트 작성 과정을 간소화합니다.
복잡한 어서션(assertion) 라이브러리 없이도 테스트가 실패한 이유를 쉽게 이해할 수 있도록 도와줍니다.

다음은 플러그인에서 제공하는 메시지 예시입니다:

```text
Incorrect length
assert(hello.length == world.substring(1, 4).length) { "Incorrect length" }
       |     |      |  |     |               |
       |     5      |  |     "orl"           3
       "Hello"      |  "world!"
                    false
```

Power-assert 플러그인의 주요 기능:

* **개선된 에러 메시지**: 플러그인은 어서션 내의 변수와 하위 표현식(sub-expressions)의 값을 캡처하고 표시하여 실패 원인을 명확하게 식별합니다.
* **런타임 라이브러리**: 라이브러리는 `@PowerAssert` 어노테이션과 `CallExplanation` 클래스를 제공합니다. 이를 통해 Power-assert 기능을 지원하는 함수들을 더 쉽게 찾을 수 있으며, 컴파일러 플러그인 변환과 직접 통합하여 구성을 간편하게 할 수 있습니다.
* **간소화된 테스트**: 유익한 실패 메시지를 자동으로 생성하여 복잡한 어서션 라이브러리의 필요성을 줄여줍니다.
* **여러 함수 지원**: 기본적으로 `assert()` 함수 호출을 변환하지만, `require()`, `check()`, `assertTrue()`와 같은 다른 함수들도 변환할 수 있습니다.

## 플러그인 적용하기 {id="apply-the-plugin"}

### Gradle {id="gradle"}

Power-assert 플러그인을 활성화하려면 `build.gradle(.kts)` 파일을 다음과 같이 설정하세요:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
// build.gradle.kts
plugins {
    kotlin("multiplatform") version "%kotlinVersion%"
    kotlin("plugin.power-assert") version "%kotlinVersion%"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
// build.gradle
plugins {
    id 'org.jetbrains.kotlin.multiplatform' version '%kotlinVersion%'
    id 'org.jetbrains.kotlin.plugin.power-assert' version '%kotlinVersion%'
}
```

</tab>
</tabs>

Power-assert 플러그인은 동작을 커스텀할 수 있는 몇 가지 옵션을 제공합니다:

* **`functions`**: Power-assert 플러그인이 호출될 때 변환할 함수의 정규화된 경로(fully-qualified paths) 목록입니다. 지정하지 않으면 플러그인은 `kotlin.assert()` 호출만 변환합니다.
* **`compilationFilter`**: Power-assert 플러그인이 적용될 Kotlin 컴파일 대상을 제어합니다. 커스텀 필터를 직접 만들거나 사전 정의된 옵션을 사용할 수 있습니다:
  * `PowerAssertCompilationFilter.TESTS`: 모든 테스트 소스 세트에 적용됩니다 (기본값).
  * `PowerAssertCompilationFilter.ALL`: 모든 소스 세트에 적용됩니다.

  > `compilationFilter` 옵션은 Power-assert 플러그인이 변환할 Gradle 소스 세트를 나열하던 지원 중단된(deprecated) `includedSourceSets`를 대체합니다. 두 옵션은 상호 배타적입니다. `includedSourceSets`가 지정되면 `compilationFilter`는 무시됩니다.
  >
  {style="note"}

동작을 커스텀하려면 빌드 스크립트 파일에 `powerAssert {}` 블록을 추가하세요:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
// build.gradle.kts
powerAssert {
    functions = listOf("kotlin.assert", "kotlin.test.assertTrue", "kotlin.test.assertEquals", "kotlin.test.assertNull")
    compilationFilter = PowerAssertCompilationFilter {
        it.name in setOf("commonMain", "jvmMain", "jsMain", "nativeMain")
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
// build.gradle
powerAssert {
    functions = ["kotlin.assert", "kotlin.test.assertTrue", "kotlin.test.assertEquals", "kotlin.test.assertNull"]
    compilationFilter = PowerAssertCompilationFilter {
        it.name in ["commonMain", "jvmMain", "jsMain", "nativeMain"]
    }
}
```

</tab>
</tabs>

이 플러그인은 [실험적(Experimental)](components-stability.md#stability-levels-explained) 단계이므로, 앱을 빌드할 때마다 경고가 표시됩니다.
이 경고를 제외하려면 `powerAssert {}` 블록을 선언하기 전에 이 `@OptIn` 어노테이션을 추가하세요:

```kotlin
import org.jetbrains.kotlin.gradle.ExperimentalKotlinGradlePluginApi

@OptIn(ExperimentalKotlinGradlePluginApi::class)
powerAssert {
    ...
}
```

### Maven {id="maven"}

Maven 프로젝트에서 Power-assert 컴파일러 플러그인을 활성화하려면, `pom.xml` 파일의 `kotlin-maven-plugin` 설정 중 `<plugin>` 섹션을 업데이트하세요:

```xml
<build>
    <plugins>
        <plugin>
            <artifactId>kotlin-maven-plugin</artifactId>
            <groupId>org.jetbrains.kotlin</groupId>
            <version>%kotlinVersion%</version>
            <executions>
                <execution>
                    <id>compile</id>
                    <phase>process-sources</phase>
                    <goals>
                        <goal>compile</goal>
                    </goals>
                </execution>
                <execution>
                    <id>test-compile</id>
                    <phase>process-test-sources</phase>
                    <goals>
                        <goal>test-compile</goal>
                    </goals>
                </execution>
            </executions>

            <configuration>
                <!-- Power-assert 플러그인 지정 -->
                <compilerPlugins>
                    <plugin>power-assert</plugin>
                </compilerPlugins>
            </configuration>

            <!-- Power-assert 플러그인 의존성 추가 -->
            <dependencies>
                <dependency>
                    <groupId>org.jetbrains.kotlin</groupId>
                    <artifactId>kotlin-maven-power-assert</artifactId>
                    <version>%kotlinVersion%</version>
                </dependency>
            </dependencies>
        </plugin>
    </plugins>
</build>
```

`function` 옵션을 사용하여 Power-assert 플러그인이 변환할 함수를 커스텀할 수 있습니다.
예를 들어 `kotlin.test.assertTrue()`, `kotlin.test.assertEquals()` 등을 포함할 수 있습니다.
지정하지 않으면 기본적으로 `kotlin.assert()` 호출만 변환됩니다.

`kotlin-maven-plugin`의 `<configuration>` 섹션에 이 옵션을 지정하세요:

```xml
<configuration>
    <!-- 변환할 함수 지정 -->
    <pluginOptions>
        <option>power-assert:function=kotlin.assert</option>
        <option>power-assert:function=kotlin.test.assertTrue</option>
        <option>power-assert:function=kotlin.test.AssertEquals</option>
    </pluginOptions>
</configuration>
```

## Power-assert 플러그인 사용하기 {id="use-the-power-assert-plugin"}

이 섹션에서는 Power-assert 컴파일러 플러그인을 사용하는 예제를 제공합니다.

다음 모든 예제에 대한 빌드 스크립트 파일 `build.gradle.kts` 또는 `pom.xml`의 전체 코드를 확인하세요:

<tabs group="build-script">
<tab title="Gradle (Kotlin)" group-key="kotlin">

```kotlin
// build.gradle.kts

import org.jetbrains.kotlin.gradle.ExperimentalKotlinGradlePluginApi

plugins {
    kotlin("multiplatform") version "%kotlinVersion%"
    kotlin("plugin.power-assert") version "%kotlinVersion%"
}

group = "com.example"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
}

dependencies {
    testImplementation(kotlin("test"))
}

tasks.test {
    useJUnitPlatform()
}

@OptIn(ExperimentalKotlinGradlePluginApi::class)
powerAssert {
    functions = listOf("kotlin.assert", "kotlin.test.assertEquals", "kotlin.test.assertTrue", "kotlin.test.assertNull", "kotlin.require", "com.example.AssertScope.assert")
}
```
{initial-collapse-state="collapsed" collapsible="true"}

</tab>
<tab title="Gradle (Groovy)" group-key="groovy">

```groovy
// build.gradle
plugins {
    id 'org.jetbrains.kotlin.multiplatform' version '%kotlinVersion%'
    id 'org.jetbrains.kotlin.plugin.power-assert' version '%kotlinVersion%'
}

group = 'com.example'
version = '1.0-SNAPSHOT'

repositories {
    mavenCentral()
}

dependencies {
    testImplementation 'org.jetbrains.kotlin:kotlin-test'
}

test {
    useJUnitPlatform()
}

powerAssert {
    functions = [
            'kotlin.assert',
            'kotlin.test.assertEquals',
            'kotlin.test.assertTrue',
            'kotlin.test.assertNull',
            'kotlin.require',
            'com.example.AssertScope.assert'
    ]
}
```
{initial-collapse-state="collapsed" collapsible="true"}

</tab>
<tab title="Maven" group-key="maven">

```xml
<!-- pom.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>maven-power-assert-plugin-demo</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <kotlin.code.style>official</kotlin.code.style>
        <kotlin.compiler.jvmTarget>1.8</kotlin.compiler.jvmTarget>
    </properties>

    <repositories>
        <repository>
            <id>mavenCentral</id>
            <url>https://repo1.maven.org/maven2/</url>
        </repository>
    </repositories>

    <build>
        <sourceDirectory>src/main/kotlin</sourceDirectory>
        <testSourceDirectory>src/test/kotlin</testSourceDirectory>
        <plugins>
            <plugin>
                <groupId>org.jetbrains.kotlin</groupId>
                <artifactId>kotlin-maven-plugin</artifactId>
                <version>%kotlinVersion%</version>
                <executions>
                    <execution>
                        <id>compile</id>
                        <phase>compile</phase>
                        <goals>
                            <goal>compile</goal>
                        </goals>
                    </execution>
                    <execution>
                        <id>test-compile</id>
                        <phase>test-compile</phase>
                        <goals>
                            <goal>test-compile</goal>
                        </goals>
                    </execution>
                </executions>

                <configuration>
                    <compilerPlugins>
                        <plugin>power-assert</plugin>
                    </compilerPlugins>

                    <pluginOptions>
                        <option>power-assert:function=kotlin.assert</option>
                        <option>power-assert:function=kotlin.require</option>
                        <option>power-assert:function=kotlin.test.assertTrue</option>
                        <option>power-assert:function=kotlin.test.assertEquals</option>
                        <option>power-assert:function=kotlin.test.assertNull</option>
                        <option>power-assert:function=com.example.AssertScope.assert</option>
                    </pluginOptions>
                </configuration>

                <dependencies>
                    <dependency>
                        <groupId>org.jetbrains.kotlin</groupId>
                        <artifactId>kotlin-maven-power-assert</artifactId>
                        <version>%kotlinVersion%</version>
                    </dependency>
                </dependencies>

            </plugin>
            <plugin>
                <artifactId>maven-surefire-plugin</artifactId>
                <version>2.22.2</version>
            </plugin>
            <plugin>
                <artifactId>maven-failsafe-plugin</artifactId>
                <version>2.22.2</version>
            </plugin>
            <plugin>
                <groupId>org.codehaus.mojo</groupId>
                <artifactId>exec-maven-plugin</artifactId>
                <version>1.6.0</version>
                <configuration>
                    <mainClass>MainKt</mainClass>
                </configuration>
            </plugin>
        </plugins>
    </build>

    <dependencies>
        <dependency>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-test-junit5</artifactId>
            <version>%kotlinVersion%</version>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter</artifactId>
            <version>5.10.0</version>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-stdlib</artifactId>
            <version>%kotlinVersion%</version>
        </dependency>
    </dependencies>
</project>
```
{initial-collapse-state="collapsed" collapsible="true"}

</tab>
</tabs>

### `@PowerAssert` 어노테이션이 달린 함수 {id="powerassert-annotated-functions"}

함수에 `@PowerAssert` 어노테이션이 달려 있으면, Power-assert 플러그인이 해당 함수 호출을 자동으로 변환합니다. 빌드 구성에 함수를 별도로 등록할 필요가 없습니다.

Assertion 함수를 직접 선언할 때 `@PowerAssert` 어노테이션을 추가하거나, [Power-assert를 지원하는 라이브러리](#add-support-for-power-assert-to-your-library)에서 제공하는 어노테이션된 함수를 사용할 수 있습니다.

상세한 실패 메시지를 얻으려면, 프로젝트에 Power-assert 플러그인이 활성화된 상태에서 해당 함수를 호출하세요:

```kotlin
import kotlin.test.Test

data class Mascot(val name: String)

class SampleTest {

    @Test
    fun testAnnotatedFunction() {
        val subject: Any? = Mascot(name = "Unknown")
        // 라이브러리에서 assertThat()에 @PowerAssert가 달려 있다면,
        // 플러그인이 이 호출을 자동으로 변환합니다.
        assertThat(subject) {
            require(subject is Mascot)
            check(subject.name == "Kodee")
        }
    }
}
```

플러그인은 중간 표현식 값과 함께 상세한 실패 메시지를 제공합니다:

```text
check(subject.name == "Kodee")
      |       |    |
      |       |    false
      |       "Unknown"
      Mascot(name=Unknown)
```

### assert 함수 {id="assert-function"}

`assert()` 함수를 사용하는 다음 테스트를 살펴보세요:

```kotlin
import kotlin.test.Test

class SampleTest {

    @Test
    fun testFunction() {
        val hello = "Hello"
        val world = "world!"
        assert(hello.length == world.substring(1, 4).length) { "Incorrect length" }
    }
}
```

Power-assert 플러그인이 활성화된 상태에서 `testFunction()` 테스트를 실행하면 명시적인 실패 메시지가 표시됩니다:

```text
Incorrect length
assert(hello.length == world.substring(1, 4).length) { "Incorrect length" }
       |     |      |  |     |               |
       |     5      |  |     "orl"           3
       "Hello"      |  "world!"
                    false
```

더 완전한 오류 메시지를 얻으려면 항상 변수를 테스트 함수 파라미터에 인라인(inline)하세요.
다음 테스트 함수를 살펴보세요:

```kotlin
class ComplexExampleTest {

    data class Person(val name: String, val age: Int)

    @Test
    fun testComplexAssertion() {
        val person = Person("Alice", 10)
        val isValidName = person.name.startsWith("A") && person.name.length > 3
        val isValidAge = person.age in 21..28
        assert(isValidName && isValidAge)
    }
}
```

실행된 코드의 출력은 문제의 원인을 찾기에 충분한 정보를 제공하지 않습니다:

```text
assert(isValidName && isValidAge)
       |              |
       true           false
```

변수를 `assert()` 함수에 인라인합니다:

```kotlin
class ComplexExampleTest {

    data class Person(val name: String, val age: Int)

    @Test
    fun testComplexAssertion() {
        val person = Person("Alice", 10)
        assert(person.name.startsWith("A") && person.name.length > 3 && person.age > 20 && person.age < 29)
    }
}
```

실행 후, 무엇이 잘못되었는지에 대해 더 명시적인 정보를 얻을 수 있습니다:

```text
assert(person.name.startsWith("A") && person.name.length > 3 && person.age > 20 && person.age < 29)
       |      |    |                  |      |    |      |      |      |   |
       |      |    true               |      |    5      true   |      10  false
       |      "Alice"                 |      "Alice"            Person(name=Alice, age=10)
       Person(name=Alice, age=10)     Person(name=Alice, age=10)
```

### assert 이외의 함수 {id="beyond-assert-function"}

Power-assert 플러그인은 기본적으로 변환되는 `assert` 외에도 다양한 함수를 변환할 수 있습니다.
`require()`, `check()`, `assertTrue()`, `assertEqual()` 등의 함수가 마지막 파라미터로 `String` 또는 `() -> String` 값을 가질 수 있는 형태라면 이들도 변환할 수 있습니다.

테스트에서 새 함수를 사용하기 전에 빌드 파일에 해당 함수를 추가하세요.
예를 들어 `require()` 함수의 경우:

<tabs group="build-script">
<tab title="Gradle (Kotlin)" group-key="kotlin">

```kotlin
// build.gradle.kts
import org.jetbrains.kotlin.gradle.ExperimentalKotlinGradlePluginApi

@OptIn(ExperimentalKotlinGradlePluginApi::class)
powerAssert {
    functions = listOf("kotlin.assert", "kotlin.require")
}
```

</tab>
<tab title="Gradle (Groovy)" group-key="groovy">

```groovy
powerAssert {
    functions = [
            'kotlin.assert',
            'kotlin.require'
    ]
}
```

</tab>
<tab title="Maven" group-key="maven">

```xml
<!-- pom.xml -->
<configuration>
    <pluginOptions>
        <option>power-assert:function=kotlin.assert</option>
        <option>power-assert:function=kotlin.require</option>
    </pluginOptions>
</configuration>
```
</tab>
</tabs>

함수를 추가한 후 테스트에서 사용할 수 있습니다:

```kotlin
class RequireExampleTest {

    @Test
    fun testRequireFunction() {
        val value = ""
        require(value.isNotEmpty()) { "Value should not be empty" }
    }
}
```

이 예제의 출력은 Power-assert 플러그인을 사용하여 실패한 테스트에 대한 상세 정보를 제공합니다:

```text
Value should not be empty
require(value.isNotEmpty()) { "Value should not be empty" }
        |     |
        ""    false
```

메시지에는 실패로 이어진 중간값들이 표시되어 디버깅이 더 쉬워집니다.

<!-- ### 함수 호출 추적

이 플러그인은 Rust의 `dbg!` 매크로와 유사한 함수 호출 추적을 지원합니다.
이를 사용하여 함수 호출과 그 결과를 추적하고 출력하세요:

```kotlin
class FunctionTrailingExampleTest {

    fun exampleFunction(x: Int, y: Int): Int {
        return x + y
    }

    @Test
    fun testFunctionCallTracing() {
        assert(exampleFunction(2, 3) + exampleFunction(1, 2) == 9)
    }
}
```

출력은 함수 호출의 중간 결과를 보여줍니다:

```text
assert(exampleFunction(2, 3) + exampleFunction(1, 2) == 9)
       |                     | |                     |
       5                     8 3                     false
```
-->

### 소프트 어서션 {id="soft-assertions"}

Power-assert 플러그인은 소프트 어서션(soft assertions)을 지원합니다. 소프트 어서션은 테스트를 즉시 실패 처리하지 않고, 대신 어서션 실패를 수집하여 테스트 실행이 끝날 때 보고합니다.
이는 첫 번째 실패에서 멈추지 않고 한 번의 실행으로 모든 어서션 실패를 확인하고 싶을 때 유용합니다.

소프트 어서션을 활성화하려면 에러 메시지를 수집하는 방식을 구현하세요:

```kotlin
fun <R> assertSoftly(block: AssertScope.() -> R): R {
    val scope = AssertScopeImpl()
    val result = scope.block()
    if (scope.errors.isNotEmpty()) {
        throw AssertionError(scope.errors.joinToString("\n"))
    }
    return result
}

interface AssertScope {
    fun assert(assertion: Boolean, message: (() -> String)? = null)
}

class AssertScopeImpl : AssertScope {
    val errors = mutableListOf<String>()
    override fun assert(assertion: Boolean, message: (() -> String)?) {
        if (!assertion) {
            errors.add(message?.invoke() ?: "Assertion failed")
        }
    }
}
```

Power-assert 플러그인이 이 함수들을 사용할 수 있도록 빌드 파일에 추가하세요:

<tabs group="build-script">
<tab title="Gradle (Kotlin)" group-key="kotlin">

```kotlin
// build.gradle.kts
import org.jetbrains.kotlin.gradle.ExperimentalKotlinGradlePluginApi

@OptIn(ExperimentalKotlinGradlePluginApi::class)
powerAssert {
    functions = listOf("kotlin.assert", "kotlin.test.assert", "com.example.AssertScope.assert")
}
```

</tab>
<tab title="Gradle (Groovy)" group-key="groovy">

```groovy
powerAssert {
    functions = [
            'kotlin.assert',
            'kotlin.test.assert',
            'com.example.AssertScope.assert'
    ]
}
```

</tab>
<tab title="Maven" group-key="maven">

```xml
<!-- pom.xml -->
<configuration>
    <pluginOptions>
        <option>power-assert:function=kotlin.assert</option>
        <option>power-assert:function=kotlin.require</option>
        <option>power-assert:function=com.example.AssertScope.assert</option>
    </pluginOptions>
</configuration>
```
</tab>
</tabs>

> `AssertScope.assert()` 함수를 선언한 패키지의 전체 이름을 지정해야 합니다.
>
{style="tip"}

그 후 테스트 코드에서 이를 사용할 수 있습니다:

```kotlin
// assertSoftly() 함수 임포트
import com.example.assertSoftly

class SoftAssertExampleTest1 {

    data class Employee(val name: String, val age: Int, val salary: Int)

    @Test
    fun `test employees data`() {
        val employees = listOf(
            Employee("Alice", 30, 60000),
            Employee("Bob", 45, 80000),
            Employee("Charlie", 55, 40000),
            Employee("Dave", 150, 70000)
        )

        assertSoftly {
            for (employee in employees) {
                assert(employee.age < 100) { "${employee.name} has an invalid age: ${employee.age}" }
                assert(employee.salary > 50000) { "${employee.name} has an invalid salary: ${employee.salary}" }
            }
        }
    }
}
```

출력 결과에는 모든 `assert()` 함수의 에러 메시지가 차례대로 출력됩니다:

```text
Charlie has an invalid salary: 40000
assert(employee.salary > 50000) { "${employee.name} has an invalid salary: ${employee.salary}" }
       |        |      |
       |        40000  false
       Employee(name=Charlie, age=55, salary=40000)

Dave has an invalid age: 150
assert(employee.age < 100) { "${employee.name} has an invalid age: ${employee.age}" }
       |        |   |
       |        150 false
       Employee(name=Dave, age=150, salary=70000)
```

## 라이브러리에 Power-assert 지원 추가하기 {id="add-support-for-power-assert-to-your-library"}

라이브러리 작성자라면 Power-assert 런타임 라이브러리의 `@PowerAssert` 어노테이션과 `CallExplanation` 클래스를 사용하여 라이브러리에 Power-assert 기능을 즉시 지원하도록 추가할 수 있습니다.

### `@PowerAssert` 어노테이션 {id="the-powerassert-annotation"}

[`@PowerAssert` 어노테이션](https://github.com/JetBrains/kotlin/blob/master/plugins/power-assert/power-assert-runtime/src/commonMain/kotlin/kotlin/powerassert/PowerAssert.kt)은 해당 함수가 Power-assert 기능을 지원함을 나타냅니다. 라이브러리 사용자의 프로젝트에 Power-assert 컴파일러 플러그인이 적용되어 있고 어노테이션이 달린 함수를 호출하면, 별도의 빌드 구성 없이도 호출이 자동으로 변환됩니다.

라이브러리에 Power-assert 지원을 추가하는 방법:

1. 빌드 파일에 [Power-assert 플러그인을 적용](#apply-the-plugin)합니다.
2. Maven의 경우, Power-assert 런타임 라이브러리를 의존성으로 추가합니다:

   ```xml
   <!-- pom.xml -->
   <dependencies>
       <dependency>
           <groupId>org.jetbrains.kotlin</groupId>
           <artifactId>kotlin-power-assert-runtime</artifactId>
           <version>%kotlinVersion%</version>
       </dependency>
   </dependencies>
   ```

   Gradle의 경우, Power-assert 컴파일러 플러그인을 추가하면 이 의존성이 자동으로 추가됩니다.

3. Assertion 함수에 `@PowerAssert` 어노테이션을 추가합니다:

   ```kotlin
   import kotlin.powerassert.PowerAssert
   import kotlin.powerassert.toDefaultMessage
   import kotlin.contracts.ExperimentalContracts
   import kotlin.contracts.contract
   
   @OptIn(ExperimentalContracts::class)
   @PowerAssert
   fun powerAssert(condition: Boolean, @PowerAssert.Ignore message: String? = null) {
       contract { returns() implies condition }
       if (!condition) {
           val explanation = PowerAssert.explanation
               ?: fail(message)
   
           val equalityErrors = buildList {
               for (expression in explanation.expressions) {
                   if (expression is EqualityExpression && expression.value == false) {
                       add(expression)
                   }
               }
           }

           val failureMessage = buildString {
               if (message?.isNotBlank() == true) appendLine(message)
               append(explanation.toDefaultMessage())
           }

           fail(failureMessage, equalityErrors)
       }
   }
   ```

    * `PowerAssert.explanation` 속성은 호출 지점(call site) 정보를 포함하는 `CallExplanation` 객체에 접근할 수 있게 해줍니다.
    * `toDefaultMessage()` 함수는 표준 Power-assert 실패 메시지를 렌더링합니다.
    * `message` 파라미터의 `@PowerAssert.Ignore` 어노테이션은 해당 파라미터를 실패 메시지에서 제외합니다.

컴파일러 플러그인은 `@PowerAssert` 어노테이션을 감지하고 컴파일 시점에 해당 함수 호출을 변환합니다.

> 전체 예제는 [`kotlin-test-power-assert`](https://github.com/bnorm/power-assert-examples/tree/main/kotlin-test-power-assert) 프로젝트를 참조하세요.
>
{style="tip"}

### `CallExplanation` 클래스 {id="the-callexplanation-class"}

[`CallExplanation`](https://github.com/JetBrains/kotlin/blob/master/plugins/power-assert/power-assert-runtime/src/commonMain/kotlin/kotlin/powerassert/CallExplanation.kt) 클래스는 중간 표현식 값을 포함하여 호출 지점(call site)에 대한 상세 정보를 제공합니다. 이를 통해 어서션 실패 시 메시지를 동적으로 렌더링하고 외부 도구와 더 잘 통합할 수 있습니다.

라이브러리의 함수에 `@PowerAssert` 어노테이션이 달려 있고 컴파일러 플러그인이 적용된 경우, 각 호출 지점에서 변환이 자동으로 수행됩니다. 함수 본문 내에서 `PowerAssert.explanation` 속성을 통해 `CallExplanation` 객체에 접근할 수 있습니다.

> `PowerAssert.explanation` 속성은 어노테이션된 함수가 Java에서 호출되거나, Power-assert 플러그인이 적용되지 않은 프로젝트에서 호출되거나, [리플렉션(reflection)](reflection.md)을 통해 호출되는 경우 `null`을 반환할 수 있습니다.
>
{style="note"}

다음은 `@PowerAssert` 어노테이션이 달린 함수 내부에서 `CallExplanation`을 사용하여 소스 코드 정보를 추출하고 커스텀 실패 메시지를 구성하는 예제입니다:

```kotlin
package kotlinx.test.fluent

import kotlin.powerassert.PowerAssert
import kotlin.contracts.ExperimentalContracts
import kotlin.contracts.contract

@PowerAssert
fun AssertScope<*>.check(condition: Boolean) {
    if (!condition) {
        val explanation = PowerAssert.explanation
        val message = if (explanation == null) null else {
            val conditionArg = explanation.arguments.last()!!
            val source = explanation.source.substring(conditionArg.startOffset, conditionArg.endOffset)
            "Condition failed: $source"
        }
        collect(message, explanation)
    }
}

@OptIn(ExperimentalContracts::class)
@PowerAssert
fun AssertScope<*>.require(condition: Boolean) {
    contract { returns() implies condition }
    if (!condition) {
        val explanation = PowerAssert.explanation
        val message = if (explanation == null) null else {
            val conditionArg = explanation.arguments.last()!!
            val source = explanation.source.substring(conditionArg.startOffset, conditionArg.endOffset)
            "Condition failed: $source"
        }
        fail(message, explanation)
    }
}
```

이 예제에서 `check()` 함수는 나중에 보고하기 위해 실패 정보를 수집하고, `require()` 함수는 즉시 실패 처리합니다. 두 함수 모두 `CallExplanation`을 사용하여 실패한 조건의 소스 코드를 추출하고 이를 실패 메시지에 포함합니다.

> 전체 예제는 [`fluent-assert`](https://github.com/bnorm/power-assert-examples/tree/main/fluent-assert) 프로젝트를 참조하세요.
>
{style="tip"}

## 다음 단계 {id="what-s-next"}

다음 샘플 프로젝트들을 살펴보세요:

* [플러그인이 활성화된 간단한 프로젝트](https://github.com/JetBrains/kotlin/tree/master/libraries/tools/kotlin-gradle-plugin-integration-tests/src/test/resources/testProject/powerAssertSourceSets)
* [여러 소스 세트가 포함된 더 복잡한 프로젝트](https://github.com/JetBrains/kotlin/tree/master/libraries/tools/kotlin-gradle-plugin-integration-tests/src/test/resources/testProject/powerAssertSimple)
* [런타임 라이브러리 기능을 실험하기 위한 예제 모음](https://github.com/bnorm/power-assert-examples#power-assert-examples)