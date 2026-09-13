[//]: # (title: Power-assert 编译器插件)
<primary-label ref="experimental-opt-in"/>

Kotlin Power-assert 编译器插件通过提供包含上下文信息的详细失败消息来改善调试体验。
它通过在失败消息中自动生成中间值来简化编写测试的过程。
它可以帮助您在无需复杂的断言库的情况下，理解测试失败的原因。

这是由该插件提供的消息示例：

```text
Incorrect length
assert(hello.length == world.substring(1, 4).length) { "Incorrect length" }
       |     |      |  |     |               |
       |     5      |  |     "orl"           3
       "Hello"      |  "world!"
                    false
```

Power-assert 插件的主要特性：

* **增强的错误消息**：该插件捕获并显示断言中变量和子表达式的值，以清楚地识别失败原因。
* **运行时库**：该库提供 `@PowerAssert` 注解和 `CallExplanation` 类。它们通过将支持 Power-assert 的函数与编译器插件转换直接集成，使其更易于发现且更易于配置。
* **简化测试**：自动生成详实的失败消息，减少了对复杂断言库的需求。
* **支持多个函数**：默认情况下，它会转换 `assert()` 函数调用，但也可以转换其他函数，例如 `require()`、`check()` 和 `assertTrue()`。

## 应用插件 {id="apply-the-plugin"}

### Gradle {id="gradle"}

要启用 Power-assert 插件，请按如下方式配置您的 `build.gradle(.kts)` 文件：

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

Power-assert 插件提供了几个选项来自定义其行为：

* **`functions`**：列出在调用时由 Power-assert 插件进行转换的完全限定函数路径。如果未指定，默认情况下插件仅转换 `kotlin.assert()` 调用。
* **`compilationFilter`**：控制 Power-assert 插件应用于哪些 Kotlin 编译任务。您可以创建自己的自定义筛选器，也可以使用预定义的选项：
  * `PowerAssertCompilationFilter.TESTS`：应用于所有测试源集（默认）。
  * `PowerAssertCompilationFilter.ALL`：应用于所有源集。

  > `compilationFilter` 选项已取代已弃用的 `includedSourceSets`（后者用于列出 Power-assert 插件转换的 Gradle 源集）。这两个选项互斥：如果指定了 `includedSourceSets`，则 `compilationFilter` 会被忽略。
  >
  {style="note"}

要自定义行为，请将 `powerAssert {}` 块添加到您的构建脚本文件中：

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

由于该插件是[实验性的](components-stability.md#stability-levels-explained)，因此每次构建应用时都会看到警告。
要排除这些警告，请在声明 `powerAssert {}` 块之前添加此 `@OptIn` 注解：

```kotlin
import org.jetbrains.kotlin.gradle.ExperimentalKotlinGradlePluginApi

@OptIn(ExperimentalKotlinGradlePluginApi::class)
powerAssert {
    ...
}
```

### Maven {id="maven"}

要在 Maven 项目中启用 Power-assert 编译器插件，请更新 `pom.xml` 文件中 `kotlin-maven-plugin` 的 `<plugin>` 部分：

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
                <!-- 指定 Power-assert 插件 -->
                <compilerPlugins>
                    <plugin>power-assert</plugin>
                </compilerPlugins>
            </configuration>

            <!-- 添加 Power-assert 插件依赖项 -->
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

您可以使用 `function` 选项自定义 Power-assert 插件转换哪些函数。
例如，您可以包含 `kotlin.test.assertTrue()`、`kotlin.test.assertEquals()` 等。
如果未指定，默认情况下仅转换 `kotlin.assert()` 调用。

在 `kotlin-maven-plugin` 的 `<configuration>` 部分中指定此选项：

```xml
<configuration>
    <!-- 指定要转换的函数 -->
    <pluginOptions>
        <option>power-assert:function=kotlin.assert</option>
        <option>power-assert:function=kotlin.test.assertTrue</option>
        <option>power-assert:function=kotlin.test.AssertEquals</option>
    </pluginOptions>
</configuration>
```

## 使用 Power-assert 插件 {id="use-the-power-assert-plugin"}

本节提供使用 Power-assert 编译器插件的示例。

请参阅构建脚本文件 `build.gradle.kts` 或 `pom.xml` 的完整代码以获取所有这些示例：

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

### 使用 `@PowerAssert` 注解的函数 {id="powerassert-annotated-functions"}

如果一个函数使用了 `@PowerAssert` 注解，Power-assert 插件会自动转换对它的调用。
您不需要在构建配置中注册该函数。

您可以在自己声明断言函数时添加 `@PowerAssert` 注解，或者使用[支持 Power-assert 的库](#为您的库添加对-power-assert-的支持)并使用其提供的注解函数。

要获得详细的失败消息，请在项目中启用 Power-assert 插件的情况下调用该函数：

```kotlin
import kotlin.test.Test

data class Mascot(val name: String)

class SampleTest {

    @Test
    fun testAnnotatedFunction() {
        val subject: Any? = Mascot(name = "Unknown")
        // 如果库中的 assertThat() 使用了 @PowerAssert 注解，
        // 插件会自动转换此调用
        assertThat(subject) {
            require(subject is Mascot)
            check(subject.name == "Kodee")
        }
    }
}
```

该插件提供了包含中间表达式值的详细失败消息：

```text
check(subject.name == "Kodee")
      |       |    |
      |       |    false
      |       "Unknown"
      Mascot(name=Unknown)
```

### Assert 函数 {id="assert-function"}

考虑以下使用 `assert()` 函数的测试：

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

如果在启用 Power-assert 插件的情况下运行 `testFunction()` 测试，您会得到明确的失败消息：

```text
Incorrect length
assert(hello.length == world.substring(1, 4).length) { "Incorrect length" }
       |     |      |  |     |               |
       |     5      |  |     "orl"           3
       "Hello"      |  "world!"
                    false
```

要获得更完整的错误消息，请始终将变量内联到测试函数形参中。
考虑以下测试函数：

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

执行代码的输出无法提供足够的信息来查找问题原因：

```text
assert(isValidName && isValidAge)
       |              |
       true           false
```

将变量内联到 `assert()` 函数中：

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

执行后，您可以获得关于出错原因的更明确信息：

```text
assert(person.name.startsWith("A") && person.name.length > 3 && person.age > 20 && person.age < 29)
       |      |    |                  |      |    |      |      |      |   |
       |      |    true               |      |    5      true   |      10  false
       |      "Alice"                 |      "Alice"            Person(name=Alice, age=10)
       Person(name=Alice, age=10)     Person(name=Alice, age=10)
```

### 除 assert 函数之外 {id="beyond-assert-function"}

Power-assert 插件可以转换除默认转换的 `assert` 之外的各种函数。
像 `require()`、`check()`、`assertTrue()`、`assertEqual()` 等函数，如果它们的格式允许将 `String` 或 `() -> String` 值作为最后一个形参，也可以被转换。

在测试中使用新函数之前，请将该函数添加到您的构建文件中。
例如 `require()` 函数：

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

添加函数后，您可以在测试中使用它：

```kotlin
class RequireExampleTest {

    @Test
    fun testRequireFunction() {
        val value = ""
        require(value.isNotEmpty()) { "Value should not be empty" }
    }
}
```

本示例的输出使用 Power-assert 插件来提供有关失败测试的详细信息：

```text
Value should not be empty
require(value.isNotEmpty()) { "Value should not be empty" }
        |     |
        ""    false
```

该消息显示了导致失败的中间值，从而使其更易于调试。

<!-- ### 函数调用跟踪

该插件支持函数调用跟踪，这类似于 Rust 的 `dbg!` 宏。
使用它可以跟踪并打印函数调用及其结果：

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

输出显示了函数调用的中间结果：

```text
assert(exampleFunction(2, 3) + exampleFunction(1, 2) == 9)
       |                     | |                     |
       5                     8 3                     false
```
-->

### 软断言 {id="soft-assertions"}

Power-assert 插件支持软断言，它不会立即导致测试失败，而是收集断言失败并在测试运行结束时报告。
当您希望在单次运行中查看所有断言失败而不在第一次失败时停止时，这很有用。

要启用软断言，请实现收集错误消息的方式：

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

将这些函数添加到您的构建文件中，以便 Power-assert 插件可以使用它们：

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

> 您应该指定声明 `AssertScope.assert()` 函数的软件包全名。
>
{style="tip"}

之后，您可以在测试代码中使用它：

```kotlin
// 导入 assertSoftly() 函数
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

在输出中，所有 `assert()` 函数错误消息将一个接一个地打印出来：

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

## 为您的库添加对 Power-assert 的支持 {id="add-support-for-power-assert-to-your-library"}

如果您是库作者，可以使用 Power-assert 运行时库中的 `@PowerAssert` 注解和 `CallExplanation` 类为您的库添加开箱即用的 Power-assert 支持。

### `@PowerAssert` 注解 {id="the-powerassert-annotation"}

[`@PowerAssert` 注解](https://github.com/JetBrains/kotlin/blob/master/plugins/power-assert/power-assert-runtime/src/commonMain/kotlin/kotlin/powerassert/PowerAssert.kt)将一个函数标记为支持 Power-assert。如果您的库用户在其项目中使用 Power-assert 编译器插件并调用您的注解函数，则无需额外的构建配置即可自动转换这些调用。

要为您的库添加对 Power-assert 的支持：

1. 在您的构建文件中，[应用 Power-assert 插件](#应用插件)。
2. 对于 Maven，添加 Power-assert 运行时库作为依赖项：

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

   对于 Gradle，该依赖项会随 Power-assert 编译器插件自动添加。

3. 使用 `@PowerAssert` 注解您的断言函数：

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

    * `PowerAssert.explanation` 属性提供对包含调用站点信息的 `CallExplanation` 对象的访问。
    * `toDefaultMessage()` 函数渲染标准的 Power-assert 失败消息。
    * `message` 形参上的 `@PowerAssert.Ignore` 注解将其从失败消息中排除。

编译器插件会检测 `@PowerAssert` 注解并在编译时转换对该函数的调用。

> 有关完整示例，请参阅 [`kotlin-test-power-assert`](https://github.com/bnorm/power-assert-examples/tree/main/kotlin-test-power-assert) 项目。
>
{style="tip"}

### `CallExplanation` 类 {id="the-callexplanation-class"}

[`CallExplanation`](https://github.com/JetBrains/kotlin/blob/master/plugins/power-assert/power-assert-runtime/src/commonMain/kotlin/kotlin/powerassert/CallExplanation.kt) 类提供有关调用站点的详细信息，包括中间表达式值。这实现了断言失败消息的动态渲染，并能更好地与外部工具集成。

当库中的某个函数使用了 `@PowerAssert` 注解且应用了编译器插件时，每个调用站点都会自动执行转换。`PowerAssert.explanation` 属性提供在函数体内部访问 `CallExplanation` 对象的能力。

> 如果注解函数是从 Java、未应用 Power-assert 插件的项目或通过[反射](reflection.md)调用的，则 `PowerAssert.explanation` 属性可能返回 `null`。
>
{style="note"}

以下是如何在 `@PowerAssert` 注解的函数中使用 `CallExplanation` 来提取源代码信息并构建自定义失败消息的示例：

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

在此示例中，`check()` 函数收集失败以便稍后报告，而 `require()` 函数则立即失败。这两个函数都使用 `CallExplanation` 来提取失败条件的源代码，并将其包含在失败消息中。

> 有关完整示例，请参阅 [`fluent-assert`](https://github.com/bnorm/power-assert-examples/tree/main/fluent-assert) 项目。
>
{style="tip"}

## 下一步 {id="what-s-next"}

浏览我们的示例项目：

* [启用了该插件的简单项目](https://github.com/JetBrains/kotlin/tree/master/libraries/tools/kotlin-gradle-plugin-integration-tests/src/test/resources/testProject/powerAssertSourceSets)
* [包含多个源集的更复杂项目](https://github.com/JetBrains/kotlin/tree/master/libraries/tools/kotlin-gradle-plugin-integration-tests/src/test/resources/testProject/powerAssertSimple)
* [用于实验运行时库特性的示例合集](https://github.com/bnorm/power-assert-examples#power-assert-examples)