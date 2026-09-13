[//]: # (title: Power-assert 編譯器外掛程式)
<primary-label ref="experimental-opt-in"/>

Kotlin Power-assert 編譯器外掛程式透過提供包含上下文資訊的詳細失敗訊息，來改善偵錯體驗。它透過在失敗訊息中自動產生中間值，簡化了撰寫測試的過程。它能協助您了解測試失敗的原因，而無需複雜的斷言程式庫。

這是該外掛程式提供的一個範例訊息：

```text
Incorrect length
assert(hello.length == world.substring(1, 4).length) { "Incorrect length" }
       |     |      |  |     |               |
       |     5      |  |     "orl"           3
       "Hello"      |  "world!"
                    false
```

Power-assert 外掛程式的主要特性：

* **增強的錯誤訊息**：該外掛程式會擷取並顯示斷言中的變數和子運算式的值，以清楚識別失敗原因。
* **執行時程式庫**：該程式庫提供了 `@PowerAssert` 註解和 `CallExplanation` 類別。它們透過將具備 Power-assert 能力的函式直接與編譯器外掛程式轉換整合，使其更易於被發現且更易於配置。
* **簡化測試**：自動產生具備豐富資訊的失敗訊息，減少對複雜斷言程式庫的需求。
* **支援多個函式**：預設情況下，它會轉換 `assert()` 函式呼叫，但也可以轉換其他函式，例如 `require()`、`check()` 和 `assertTrue()`。

## 套用外掛程式 {id="apply-the-plugin"}

### Gradle {id="gradle"}

若要啟用 Power-assert 外掛程式，請按照以下方式設定您的 `build.gradle(.kts)` 檔案：

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

Power-assert 外掛程式提供了多個選項來自訂其行為：

* **`functions`**：列出 Power-assert 外掛程式在呼叫時會轉換的函式之完整限定路徑。若未指定，預設僅轉換 `kotlin.assert()` 呼叫。
* **`compilationFilter`**：控制 Power-assert 外掛程式套用至哪些 Kotlin 編譯。您可以建立自己的自訂篩選器，或使用預定義的選項：
  * `PowerAssertCompilationFilter.TESTS`：套用至所有測試原始碼集 (預設)。
  * `PowerAssertCompilationFilter.ALL`：套用至所有原始碼集。

  > `compilationFilter` 選項已取代已棄用的 `includedSourceSets`（該選項曾用於列出 Power-assert 外掛程式要轉換的 Gradle 原始碼集）。這兩個選項互斥：若指定了 `includedSourceSets`，`compilationFilter` 將會被忽略。
  >
  {style="note"}

若要自訂行為，請將 `powerAssert {}` 區塊加入您的建置指令碼檔案：

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

由於該外掛程式處於 [實驗性 (Experimental)](components-stability.md#stability-levels-explained) 階段，您每次組建應用程式時都會看到警告。若要排除這些警告，請在宣告 `powerAssert {}` 區塊之前加入此 `@OptIn` 註解：

```kotlin
import org.jetbrains.kotlin.gradle.ExperimentalKotlinGradlePluginApi

@OptIn(ExperimentalKotlinGradlePluginApi::class)
powerAssert {
    ...
}
```

### Maven {id="maven"}

若要在 Maven 專案中啟用 Power-assert 編譯器外掛程式，請更新 `pom.xml` 檔案中 `kotlin-maven-plugin` 的 `<plugin>` 區段：

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
                <!-- 指定 Power-assert 外掛程式 -->
                <compilerPlugins>
                    <plugin>power-assert</plugin>
                </compilerPlugins>
            </configuration>

            <!-- 加入 Power-assert 外掛程式相依性 -->
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

您可以使用 `function` 選項來自訂 Power-assert 外掛程式轉換哪些函式。例如，您可以包含 `kotlin.test.assertTrue()`、`kotlin.test.assertEquals()` 等。如果未指定，預設僅轉換 `kotlin.assert()` 呼叫。

在 `kotlin-maven-plugin` 的 `<configuration>` 區段中指定此選項：

```xml
<configuration>
    <!-- 指定要轉換的函式 -->
    <pluginOptions>
        <option>power-assert:function=kotlin.assert</option>
        <option>power-assert:function=kotlin.test.assertTrue</option>
        <option>power-assert:function=kotlin.test.AssertEquals</option>
    </pluginOptions>
</configuration>
```

## 使用 Power-assert 外掛程式 {id="use-the-power-assert-plugin"}

本節提供使用 Power-assert 編譯器外掛程式的範例。

請參閱以下所有範例的建置指令碼檔案 `build.gradle.kts` 或 `pom.xml` 的完整程式碼：

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

### `@PowerAssert` 註解函式 {id="powerassert-annotated-functions"}

如果函式使用了 `@PowerAssert` 註解，Power-assert 外掛程式會自動轉換對該函式的呼叫。您無需在組建組態中註冊該函式。

您可以在自行宣告斷言函式時加入 `@PowerAssert` 註解，或是使用 [支援 Power-assert 的程式庫](#為您的程式庫加入-power-assert-支援) 並提供帶有註解的函式。

若要獲得詳細的失敗訊息，請在專案中啟用 Power-assert 外掛程式的情況下呼叫該函式：

```kotlin
import kotlin.test.Test

data class Mascot(val name: String)

class SampleTest {

    @Test
    fun testAnnotatedFunction() {
        val subject: Any? = Mascot(name = "Unknown")
        // 如果程式庫中的 assertThat() 帶有 @PowerAssert 註解，
        // 外掛程式會自動轉換此呼叫
        assertThat(subject) {
            require(subject is Mascot)
            check(subject.name == "Kodee")
        }
    }
}
```

該外掛程式提供包含中間運算式值的詳細失敗訊息：

```text
check(subject.name == "Kodee")
      |       |    |
      |       |    false
      |       "Unknown"
      Mascot(name=Unknown)
```

### Assert 函式 {id="assert-function"}

考慮以下使用 `assert()` 函式的測試：

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

如果您在啟用 Power-assert 外掛程式的情況下執行 `testFunction()` 測試，您將獲得明確的失敗訊息：

```text
Incorrect length
assert(hello.length == world.substring(1, 4).length) { "Incorrect length" }
       |     |      |  |     |               |
       |     5      |  |     "orl"           3
       "Hello"      |  "world!"
                    false
```

若要獲得更完整的錯誤訊息，請始終將變數內嵌 (inline) 到測試函式參數中。考慮以下測試函式：

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

執行程式碼的輸出並未提供足夠的資訊來找出問題原因：

```text
assert(isValidName && isValidAge)
       |              |
       true           false
```

將變數內嵌到 `assert()` 函式中：

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

執行後，您會獲得關於出錯原因的更明確資訊：

```text
assert(person.name.startsWith("A") && person.name.length > 3 && person.age > 20 && person.age < 29)
       |      |    |                  |      |    |      |      |      |   |
       |      |    true               |      |    5      true   |      10  false
       |      "Alice"                 |      "Alice"            Person(name=Alice, age=10)
       Person(name=Alice, age=10)     Person(name=Alice, age=10)
```

### 超越 assert 函式 {id="beyond-assert-function"}

Power-assert 外掛程式可以轉換除預設轉換的 `assert` 以外的各種函式。像 `require()`、`check()`、`assertTrue()`、`assertEqual()` 等函式，如果它們的形式允許將 `String` 或 `() -> String` 值作為最後一個參數，也可以被轉換。

在測試中使用新函式之前，請將該函式加入您的建置檔案。例如，`require()` 函式：

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

加入函式後，您就可以在測試中使用它：

```kotlin
class RequireExampleTest {

    @Test
    fun testRequireFunction() {
        val value = ""
        require(value.isNotEmpty()) { "Value should not be empty" }
    }
}
```

此範例的輸出使用 Power-assert 外掛程式來提供有關失敗測試的詳細資訊：

```text
Value should not be empty
require(value.isNotEmpty()) { "Value should not be empty" }
        |     |
        ""    false
```

該訊息顯示了導致失敗的中間值，使偵錯變得更容易。

<!-- ### 函式呼叫追蹤

該外掛程式支援函式呼叫追蹤，這與 Rust 的 `dbg!` 巨集類似。使用它來追蹤並列印函式呼叫及其結果：

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

輸出顯示了函式呼叫的中間結果：

```text
assert(exampleFunction(2, 3) + exampleFunction(1, 2) == 9)
       |                     | |                     |
       5                     8 3                     false
```
-->

### 軟斷言 (Soft assertions) {id="soft-assertions"}

Power-assert 外掛程式支援軟斷言，它不會立即讓測試失敗，而是收集斷言失敗並在測試執行結束時回報。當您希望在單次執行中查看所有斷言失敗而不停止在第一個失敗點時，這非常有用。

若要啟用軟斷言，請實作收集錯誤訊息的方式：

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

將這些函式加入您的建置檔案，使其可供 Power-assert 外掛程式使用：

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

> 您應該指定宣告 `AssertScope.assert()` 函式的套件完整名稱。
>
{style="tip"}

之後，您就可以在測試程式碼中使用它：

```kotlin
// 匯入 assertSoftly() 函式
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

在輸出中，所有 `assert()` 函式的錯誤訊息將一個接一個地印出：

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

## 為您的程式庫加入 Power-assert 支援 {id="add-support-for-power-assert-to-your-library"}

如果您是程式庫作者，可以使用 Power-assert 執行時程式庫中的 `@PowerAssert` 註解和 `CallExplanation` 類別，為您的程式庫加入開箱即用的 Power-assert 支援。

### `@PowerAssert` 註解 {id="the-powerassert-annotation"}

[`@PowerAssert` 註解](https://github.com/JetBrains/kotlin/blob/master/plugins/power-assert/power-assert-runtime/src/commonMain/kotlin/kotlin/powerassert/PowerAssert.kt) 將函式標記為具備 Power-assert 能力。如果您程式庫的使用者在他們的專案中啟用了 Power-assert 編譯器外掛程式，並呼叫了您帶有註解的函式，這些呼叫將會被自動轉換，無需額外的組建組態。

若要為您的程式庫加入 Power-assert 支援：

1. 在您的建置檔案中 [套用 Power-assert 外掛程式](#套用外掛程式)。
2. 對於 Maven，將 Power-assert 執行時程式庫加入為相依性：

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

   對於 Gradle，此相依性會隨著 Power-assert 編譯器外掛程式自動加入。

3. 使用 `@PowerAssert` 註解您的斷言函式：

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

    * `PowerAssert.explanation` 屬性提供對包含呼叫點資訊的 `CallExplanation` 物件之存取。
    * `toDefaultMessage()` 函式會轉譯標準的 Power-assert 失敗訊息。
    * `message` 參數上的 `@PowerAssert.Ignore` 註解會將其排除在失敗訊息之外。

編譯器外掛程式會在編譯時期偵測 `@PowerAssert` 註解並轉換對該函式的呼叫。

> 如需完整範例，請參閱 [`kotlin-test-power-assert`](https://github.com/bnorm/power-assert-examples/tree/main/kotlin-test-power-assert) 專案。
>
{style="tip"}

### `CallExplanation` 類別 {id="the-callexplanation-class"}

[`CallExplanation`](https://github.com/JetBrains/kotlin/blob/master/plugins/power-assert/power-assert-runtime/src/commonMain/kotlin/kotlin/powerassert/CallExplanation.kt) 類別提供有關呼叫點的詳細資訊，包含中間運算式的值。這實現了斷言失敗的動態訊息呈現，並能更好地與外部工具整合。

當您程式庫中的函式帶有 `@PowerAssert` 註解且套用了編譯器外掛程式時，轉換會在每個呼叫點自動執行。`PowerAssert.explanation` 屬性提供對函式主體內 `CallExplanation` 物件的存取。

> 如果從 Java、未套用 Power-assert 外掛程式的專案或透過 [反射](reflection.md) 呼叫帶有註解的函式，`PowerAssert.explanation` 屬性可能會傳回 `null`。
>
{style="note"}

以下範例展示了如何在 `@PowerAssert` 註解函式中使用 `CallExplanation` 來擷取原始碼資訊並建置自訂失敗訊息：

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

在此範例中，`check()` 函式會收集失敗訊息以便稍後報告，而 `require()` 函式則會立即失敗。兩個函式都使用 `CallExplanation` 來擷取失敗條件的原始碼，並將其包含在失敗訊息中。

> 如需完整範例，請參閱 [`fluent-assert`](https://github.com/bnorm/power-assert-examples/tree/main/fluent-assert) 專案。
>
{style="tip"}

## 接下來的步驟 {id="what-s-next"}

瀏覽我們的範例專案：

* [啟用該外掛程式的簡單專案](https://github.com/JetBrains/kotlin/tree/master/libraries/tools/kotlin-gradle-plugin-integration-tests/src/test/resources/testProject/powerAssertSourceSets)
* [具有多個原始碼集的更複雜專案](https://github.com/JetBrains/kotlin/tree/master/libraries/tools/kotlin-gradle-plugin-integration-tests/src/test/resources/testProject/powerAssertSimple)
* [用於嘗試執行時程式庫功能的範例集](https://github.com/bnorm/power-assert-examples#power-assert-examples)