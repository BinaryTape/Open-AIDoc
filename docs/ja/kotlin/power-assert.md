[//]: # (title: Power-assertコンパイラプラグイン)
<primary-label ref="experimental-opt-in"/>

Kotlin Power-assertコンパイラプラグインは、コンテキスト情報を含む詳細な失敗メッセージを提供することで、デバッグ体験を向上させます。
このプラグインは、失敗メッセージ内の中間値を自動的に生成することで、テストを記述するプロセスを簡素化します。
複雑なアサーションライブラリを必要とせずに、テストが失敗した理由を理解するのに役立ちます。

以下は、このプラグインによって提供されるメッセージの例です：

```text
Incorrect length
assert(hello.length == world.substring(1, 4).length) { "Incorrect length" }
       |     |      |  |     |               |
       |     5      |  |     "orl"           3
       "Hello"      |  "world!"
                    false
```

Power-assertプラグインの主な機能：

* **強化されたエラーメッセージ**: アサーション内の変数や部分式の値をキャプチャして表示し、失敗の原因を明確に特定します。
* **ランタイムライブラリ**: このライブラリは `@PowerAssert` アノテーションと `CallExplanation` クラスを提供します。これらにより、Power-assert 対応の関数をより見つけやすくし、コンパイラプラグインの変換と直接統合することで設定を容易にします。
* **簡素化されたテスト**: 有益な失敗メッセージを自動的に生成するため、複雑なアサーションライブラリの必要性が減ります。
* **複数の関数のサポート**: デフォルトでは `assert()` 関数の呼び出しを変換しますが、`require()`、`check()`、`assertTrue()` などの他の関数も変換できます。

## プラグインの適用 {id="apply-the-plugin"}

### Gradle {id="gradle"}

Power-assertプラグインを有効にするには、`build.gradle(.kts)` ファイルを次のように設定します：

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

Power-assertプラグインには、その動作をカスタマイズするためのいくつかのオプションがあります：

* **`functions`**: 完全修飾された関数パスのリスト。Power-assertプラグインは、これらの関数への呼び出しを変換します。指定しない場合、デフォルトで `kotlin.assert()` の呼び出しのみが変換されます。
* **`includedSourceSets`**: Power-assertプラグインが変換を行うGradleソースセットのリスト。指定しない場合、デフォルトですべての *テストソースセット (test source sets)* が変換されます。

動作をカスタマイズするには、ビルドスクリプトファイルに `powerAssert {}` ブロックを追加します：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
// build.gradle.kts
powerAssert {
    functions = listOf("kotlin.assert", "kotlin.test.assertTrue", "kotlin.test.assertEquals", "kotlin.test.assertNull")
    includedSourceSets = listOf("commonMain", "jvmMain", "jsMain", "nativeMain")
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
// build.gradle
powerAssert {
    functions = ["kotlin.assert", "kotlin.test.assertTrue", "kotlin.test.assertEquals", "kotlin.test.assertNull"]
    includedSourceSets = ["commonMain", "jvmMain", "jsMain", "nativeMain"]
}
```

</tab>
</tabs>

このプラグインは[試験的（Experimental）](components-stability.md#stability-levels-explained)であるため、アプリをビルドするたびに警告が表示されます。
これらの警告を除外するには、`powerAssert {}` ブロックを宣言する前に `@OptIn` アノテーションを追加してください。

```kotlin
import org.jetbrains.kotlin.gradle.ExperimentalKotlinGradlePluginApi

@OptIn(ExperimentalKotlinGradlePluginApi::class)
powerAssert {
    ...
}
```

### Maven {id="maven"}

MavenプロジェクトでPower-assertコンパイラプラグインを有効にするには、`pom.xml` ファイルの `kotlin-maven-plugin` の `<plugin>` セクションを更新します：

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
                <!-- Power-assertプラグインを指定 -->
                <compilerPlugins>
                    <plugin>power-assert</plugin>
                </compilerPlugins>
            </configuration>

            <!-- Power-assertプラグインの依存関係を追加 -->
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

`function` オプションを使用して、Power-assertプラグインがどの関数を変換するかをカスタマイズできます。
例えば、`kotlin.test.assertTrue()` や `kotlin.test.assertEquals()` などを含めることができます。
指定しない場合、デフォルトで `kotlin.assert()` の呼び出しのみが変換されます。

このオプションを `kotlin-maven-plugin` の `<configuration>` セクションで指定します：

```xml
<configuration>
    <!-- 変換する関数を指定 -->
    <pluginOptions>
        <option>power-assert:function=kotlin.assert</option>
        <option>power-assert:function=kotlin.test.assertTrue</option>
        <option>power-assert:function=kotlin.test.AssertEquals</option>
    </pluginOptions>
</configuration>
```

## Power-assertプラグインの使用 {id="use-the-power-assert-plugin"}

このセクションでは、Power-assertコンパイラプラグインの使用例を紹介します。

以下のすべての例について、ビルドスクリプトファイル `build.gradle.kts` または `pom.xml` の完全なコードを確認してください：

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

### `@PowerAssert` アノテーションが付加された関数 {id="powerassert-annotated-functions"}

関数に `@PowerAssert` アノテーションが付加されている場合、Power-assert プラグインはその関数への呼び出しを自動的に変換します。ビルド設定で関数を登録する必要はありません。

自身でアサーション関数を宣言する際に `@PowerAssert` アノテーションを追加することも、[Power-assert をサポートしているライブラリ](#add-support-for-power-assert-to-your-library)を使用してアノテーション付きの関数を利用することもできます。

詳細な失敗メッセージを取得するには、プロジェクトで Power-assert プラグインを有効にした状態で関数を呼び出します：

```kotlin
import kotlin.test.Test

data class Mascot(val name: String)

class SampleTest {

    @Test
    fun testAnnotatedFunction() {
        val subject: Any? = Mascot(name = "Unknown")
        // ライブラリ内で assertThat() に @PowerAssert が付加されている場合、
        // プラグインはこの呼び出しを自動的に変換します
        assertThat(subject) {
            require(subject is Mascot)
            check(subject.name == "Kodee")
        }
    }
}
```

プラグインは、中間式の値を含む詳細な失敗メッセージを提供します：

```text
check(subject.name == "Kodee")
      |       |    |
      |       |    false
      |       "Unknown"
      Mascot(name=Unknown)
```

### assert 関数 {id="assert-function"}

`assert()` 関数を使用した以下のテストを考えてみましょう：

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

Power-assert プラグインを有効にして `testFunction()` テストを実行すると、明示的な失敗メッセージが表示されます：

```text
Incorrect length
assert(hello.length == world.substring(1, 4).length) { "Incorrect length" }
       |     |      |  |     |               |
       |     5      |  |     "orl"           3
       "Hello"      |  "world!"
                    false
```

より完全なエラーメッセージを取得するには、変数をテスト関数のパラメータに常にインライン化してください。
以下のテスト関数を考えてみましょう：

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

実行されたコードの出力では、問題の原因を特定するのに十分な情報が得られません：

```text
assert(isValidName && isValidAge)
       |              |
       true           false
```

変数を `assert()` 関数内にインライン化します：

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

実行後、何が間違っていたのかについて、より詳細な情報を得ることができます：

```text
assert(person.name.startsWith("A") && person.name.length > 3 && person.age > 20 && person.age < 29)
       |      |    |                  |      |    |      |      |      |   |
       |      |    true               |      |    5      true   |      10  false
       |      "Alice"                 |      "Alice"            Person(name=Alice, age=10)
       Person(name=Alice, age=10)     Person(name=Alice, age=10)
```

### assert 関数以外のサポート {id="beyond-assert-function"}

Power-assert プラグインは、デフォルトで変換される `assert` 以外にも、さまざまな関数を変換できます。
`require()`、`check()`、`assertTrue()`、`assertEqual()` などの関数も、最後のパラメータとして `String` または `() -> String` の値を受け取ることができる形式であれば、変換可能です。

テストで新しい関数を使用する前に、ビルドファイルにその関数を追加してください。
例えば、`require()` 関数の場合：

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

関数を追加すると、テストで使用できるようになります：

```kotlin
class RequireExampleTest {

    @Test
    fun testRequireFunction() {
        val value = ""
        require(value.isNotEmpty()) { "Value should not be empty" }
    }
}
```

この例の出力では、Power-assert プラグインを使用して、失敗したテストに関する詳細な情報が表示されます：

```text
Value should not be empty
require(value.isNotEmpty()) { "Value should not be empty" }
        |     |
        ""    false
```

メッセージには失敗に至った中間値が表示され、デバッグが容易になります。

<!-- ### 関数呼び出しのトレース

このプラグインは、Rustの `dbg!` マクロに似た関数呼び出しのトレースをサポートしています。
関数呼び出しとその結果をトレースして出力するために使用します：

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

出力には関数呼び出しの中間結果が表示されます：

```text
assert(exampleFunction(2, 3) + exampleFunction(1, 2) == 9)
       |                     | |                     |
       5                     8 3                     false
```
-->

### ソフトアサーション {id="soft-assertions"}

Power-assert プラグインはソフトアサーション（Soft assertions）をサポートしています。これは、テストを即座に失敗させるのではなく、アサーションの失敗を収集し、テスト実行の最後にそれらを報告するものです。
これは、最初の失敗で止まることなく、1回の実行ですべてのアサーションの失敗を確認したい場合に便利です。

ソフトアサーションを有効にするには、エラーメッセージを収集する方法を実装します：

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

Power-assert プラグインでこれらの関数を利用できるように、ビルドファイルに追加します：

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

> `AssertScope.assert()` 関数を宣言したパッケージのフルネームを指定する必要があります。
>
{style="tip"}

その後、テストコードで使用できます：

```kotlin
// assertSoftly() 関数をインポート
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

出力では、すべての `assert()` 関数のエラーメッセージが次々と表示されます：

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

## ライブラリに Power-assert のサポートを追加する {id="add-support-for-power-assert-to-your-library"}

ライブラリの作者であれば、Power-assert ランタイムライブラリの `@PowerAssert` アノテーションと `CallExplanation` クラスを使用して、自身のライブラリに Power-assert のサポートをそのまま（out-of-the-box）追加できます。

### `@PowerAssert` アノテーション {id="the-powerassert-annotation"}

[`@PowerAssert` アノテーション](https://github.com/JetBrains/kotlin/blob/master/plugins/power-assert/power-assert-runtime/src/commonMain/kotlin/kotlin/powerassert/PowerAssert.kt)は、関数を Power-assert 対応としてマークします。ライブラリのユーザーがプロジェクトで Power-assert コンパイラプラグインを使用しており、アノテーションが付加された関数を呼び出すと、追加のビルド設定なしで呼び出しが自動的に変換されます。

ライブラリに Power-assert のサポートを追加するには：

1. ビルドファイルで [Power-assert プラグインを適用します](#apply-the-plugin)。
2. Maven の場合は、Power-assert ランタイムライブラリを依存関係として追加します：

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

   Gradle の場合、この依存関係は Power-assert コンパイラプラグインと共に自動的に追加されます。

3. アサーション関数に `@PowerAssert` を付加します：

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

    * `PowerAssert.explanation` プロパティは、呼び出し箇所の情報を含む `CallExplanation` オブジェクトへのアクセスを提供します。
    * `toDefaultMessage()` 関数は、標準的な Power-assert 失敗メッセージをレンダリングします。
    * `message` パラメータに付加された `@PowerAssert.Ignore` アノテーションは、それを失敗メッセージから除外します。

コンパイラプラグインは `@PowerAssert` アノテーションを検出し、コンパイル時に関数への呼び出しを変換します。

> 完全な例については、[`kotlin-test-power-assert`](https://github.com/bnorm/power-assert-examples/tree/main/kotlin-test-power-assert) プロジェクトを確認してください。
>
{style="tip"}

### `CallExplanation` クラス {id="the-callexplanation-class"}

[`CallExplanation`](https://github.com/JetBrains/kotlin/blob/master/plugins/power-assert/power-assert-runtime/src/commonMain/kotlin/kotlin/powerassert/CallExplanation.kt) クラスは、中間式の値を含む、呼び出し箇所に関する詳細な情報を提供します。これにより、アサーション失敗時の動的なメッセージレンダリングや、外部ツールとのより良い統合が可能になります。

ライブラリ内の関数に `@PowerAssert` が付加され、コンパイラプラグインが適用されている場合、各呼び出し箇所で変換が自動的に実行されます。`PowerAssert.explanation` プロパティは、関数本体の内部で `CallExplanation` オブジェクトへのアクセスを提供します。

> `PowerAssert.explanation` プロパティは、アノテーション付きの関数が Java から呼び出された場合、Power-assert プラグインが適用されていないプロジェクトから呼び出された場合、または[リフレクション](reflection.md)経由で呼び出された場合に `null` を返すことがあります。
>
{style="note"}

以下は、`@PowerAssert` アノテーションが付加された関数内で `CallExplanation` を使用してソースコード情報を抽出し、カスタム失敗メッセージを作成する例です：

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

この例では、`check()` 関数は後で報告するために失敗を収集し、`require()` 関数は即座に失敗します。どちらの関数も `CallExplanation` を使用して失敗した条件のソースコードを抽出し、それを失敗メッセージに含めています。

> 完全な例については、[`fluent-assert`](https://github.com/bnorm/power-assert-examples/tree/main/fluent-assert) プロジェクトを確認してください。
>
{style="tip"}

## 次のステップ {id="what-s-next"}

サンプルプロジェクトを確認してください：

* [プラグインが有効なシンプルなプロジェクト](https://github.com/JetBrains/kotlin/tree/master/libraries/tools/kotlin-gradle-plugin-integration-tests/src/test/resources/testProject/powerAssertSourceSets)
* [より複雑なマルチソースセットのプロジェクト](https://github.com/JetBrains/kotlin/tree/master/libraries/tools/kotlin-gradle-plugin-integration-tests/src/test/resources/testProject/powerAssertSimple)
* [ランタイムライブラリの機能を試すための例のコレクション](https://github.com/bnorm/power-assert-examples#power-assert-examples)