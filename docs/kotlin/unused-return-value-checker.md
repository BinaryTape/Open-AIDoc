[//]: # (title: 未使用的返回值检查器)

<primary-label ref="experimental-general"/>

> 该功能计划在未来的 Kotlin 版本中稳定和改进。
> 欢迎在我们的问题跟踪器 [YouTrack](https://youtrack.jetbrains.com/issue/KT-12719) 中提供反馈。
> 
> 要了解更多信息，请参阅相关的 [KEEP 提案](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0412-unused-return-value-checker.md)。
>
{style="note"}

未使用的返回值检查器允许你检测 *被忽略的结果 (ignored results)*。
这些是从表达式返回的值，其类型不是 `Unit`、`Nothing` 或 `Nothing?`，且未满足以下任一情况：

* 存储在变量或属性中。
* 被返回或抛出。
* 作为实参传递给另一个函数。
* 在调用或安全调用中用作接收者。
* 在 `if`、`when` 或 `while` 等条件语句中进行检查。
* 用作 lambda 表达式的最后一条语句。

该检查器不会报告自增操作（如 `++` 和 `--`）中被忽略的结果，也不会报告右侧会退出当前函数的布尔短路操作，例如 `condition || return`。

你可以使用未使用的返回值检查器来捕获那些函数调用产生了有意义的结果，但该结果被静默丢弃的错误。
这有助于防止意外行为，并使此类问题更易于追踪。

下面是一个示例，其中创建了一个字符串但从未被使用，因此检查器将其报告为被忽略的结果：

```kotlin
fun formatGreeting(name: String): String {
    if (name.isBlank()) return "Hello, anonymous user!"
    if (!name.contains(' ')) {
        // 检查器报告警告，提示该结果被忽略：
        // "Unused return value of 'plus'."
        "Hello, " + name.replaceFirstChar(Char::titlecase) + "!"
    }
    val (first, last) = name.split(' ')
    return "Hello, $first! Or should I call you Dr. $last?"
}
```

## 配置未使用的返回值检查器 {id="configure-the-unused-return-value-checker"}

你可以通过 `-Xreturn-value-checker` 编译器选项来控制编译器如何报告被忽略的结果。

它具有以下模式：

* `disable` 禁用未使用的返回值检查器（默认）。
* `check` 启用检查器，并针对来自 [已标记函数](#mark-functions-to-check-ignored-results) 的被忽略结果报告警告。
* `full` 启用检查器，将项目中的所有函数都视为 [已标记](#mark-functions-to-check-ignored-results)，并报告被忽略结果的警告。

> 所有已标记的函数都会按原样传播，如果在使用你代码作为依赖项的项目中启用了该检查器，则会报告被忽略的结果。
> 
{style="note"}

要在项目中使用未使用的返回值检查器，请将该编译器选项添加到你的构建配置文件中：

<tabs>
<tab id="kotlin" title="Gradle">

```kotlin
// build.gradle(.kts)
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xreturn-value-checker=check")
    }
}
```
</tab>

<tab id="maven" title="Maven">

```xml
<!-- pom.xml -->
<plugin>
    <groupId>org.jetbrains.kotlin</groupId>
    ..
    <configuration>
        <args>
            <arg>-Xreturn-value-checker=check</arg>
        </args>
    </configuration>
</plugin>
```

</tab>
</tabs>

## 标记要检查被忽略结果的函数 {id="mark-functions-to-check-ignored-results"}

当你将 [-Xreturn-value-checker 编译器选项](#configure-the-unused-return-value-checker) 设置为 `check` 时，
检查器仅报告来自已标记表达式（例如 Kotlin 标准库中的大多数函数）中被忽略的结果。

要标记你自己的代码， 
请使用 [`@MustUseReturnValues`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-must-use-return-values/) 注解。
你可以根据希望检查器覆盖的作用域，将其应用于文件、类或函数。

例如，你可以标记整个文件：

```kotlin
// 标记此文件中的所有函数和类，以便检查器报告未使用的返回值
@file:MustUseReturnValues

package my.project

fun someFunction(): String
```

或者标记特定的类：

```kotlin
// 标记此类中的所有函数，以便检查器报告未使用的返回值
@MustUseReturnValues
class Greeter {
    fun greet(name: String): String = "Hello, $name"
}

fun someFunction(): Int = ...
```

> 你可以通过将 `-Xreturn-value-checker` 编译器选项设置为 `full` 来将检查器应用于整个项目。
> 使用此选项，你不必在代码中添加 `@MustUseReturnValues` 注解。
>
{style="note"}

## 抑制被忽略结果的报告 {id="suppress-reports-for-ignored-results"}

你可以通过在特定函数上添加 [`@IgnorableReturnValue`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-ignorable-return-value/) 注解来抑制对其报告。
为那些通常且预期会忽略结果的函数添加注解，例如 `MutableList.add`：

```kotlin
@IgnorableReturnValue
fun <T> MutableList<T>.addAndIgnoreResult(element: T): Boolean {
    return add(element)
}
```

你也可以在不注解函数本身的情况下抑制警告。
为此，请使用下划线语法 (`_`) 将结果赋值给一个特殊的未命名变量：

```kotlin
// 不可忽略结果的函数
fun computeValue(): Int = 42

fun main() {

    // 报告警告：结果被忽略
    computeValue()

    // 仅在调用站点通过特殊的未使用变量来抑制警告
    val _ = computeValue()
}
```

### 函数重写中被忽略的结果 {id="ignored-results-in-function-overrides"}

当你重写函数时，重写后的函数会继承基类声明中注解所定义的报告规则。
这也适用于基类声明属于 Kotlin 标准库或其他库依赖项的情况，因此检查器会针对 `Any.hashCode()` 等函数的重写报告被忽略的结果。

此外，你不能使用一个 [要求必须使用返回值的函数](#mark-functions-to-check-ignored-results) 来重写标记了 `@IgnorableReturnValue` 的函数。
但是，在标注了 `@MustUseReturnValues` 的类或接口中，如果某个函数的结果可以被安全忽略，你可以为该重写函数标记 `@IgnorableReturnValue`：

```kotlin
@MustUseReturnValues
interface Greeter {
    fun greet(name: String): String
}

object SilentGreeter : Greeter {
    @IgnorableReturnValue
    override fun greet(name: String): String = ""
}

fun check(g: Greeter) {
    // 报告警告：未使用的返回值
    g.greet("John")

    // 无警告
    SilentGreeter.greet("John")
}
```

## 在高阶函数中检查未使用的结果 {id="check-for-unused-results-in-higher-order-functions"}

一些高阶函数，例如 `let` 作用域函数，会返回 lambda 表达式的结果。
要检查高阶函数中未使用的 lambda 结果，请将 [实验性](components-stability.md#stability-levels-explained) 的 `returnsResultOf()` 契约添加到该函数的契约中。

> Kotlin 契约是实验性的。要启用它，请在声明带有契约的函数时添加 `@OptIn(ExperimentalContracts::class)` 注解。
>
{style="warning"}

下面是一个示例：

```kotlin
import kotlin.contracts.ExperimentalContracts
import kotlin.contracts.contract

@OptIn(ExperimentalContracts::class)
inline fun <T, R> T.customLet(block: (T) -> R): R {
    contract {
        returnsResultOf(block)
    }
    return block(this)
}
```

之后，你就可以使用带有此契约的函数（如 `.customLet()`）来检查 lambda 结果是否被使用：

```kotlin
fun handleNullablePackageName(packageName: String?, builder: StringBuilder) {
    // 检查器不报告警告，因为 append() 的返回值可以被忽略
    packageName?.customLet { builder.append(it) }

    // 检查器报告警告，因为返回的字符串未被使用
    packageName?.customLet { "kotlin.$it" }
}
```

> `returnsResultOf()` 契约需要单独的编译器选项才能启用。
> 请注意，使用它会产生早于 2.4.0 的 Kotlin 编译器版本无法读取的预发布版二进制文件。
>
{style="warning"}

要在你的项目中启用此功能，请将以下编译器选项添加到你的构建文件中：

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
// build.gradle(.kts)
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xallow-returns-result-of")
    }
}
```

</tab> 
<tab title="Maven" group-key="maven">

```xml
<!-- pom.xml -->
<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <configuration>
                <args>
                    <arg>-Xallow-returns-result-of</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```
</tab> 
</tabs>

## 与 Java 注解的互操作性 {id="interoperability-with-java-annotations"}

一些 Java 库使用类似的机制但采用不同的注解。 
未使用的返回值检查器将以下注解视为等同于使用 `@MustUseReturnValues`：

* [`com.google.errorprone.annotations.CheckReturnValue`](https://errorprone.info/api/latest/com/google/errorprone/annotations/CheckReturnValue.html)
* [`edu.umd.cs.findbugs.annotations.CheckReturnValue`](https://findbugs.sourceforge.net/api/edu/umd/cs/findbugs/annotations/CheckReturnValue.html)
* [`org.jetbrains.annotations.CheckReturnValue`](https://javadoc.io/doc/org.jetbrains/annotations/latest/org/jetbrains/annotations/CheckReturnValue.html)
* [`org.springframework.lang.CheckReturnValue`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/lang/CheckReturnValue.html)
* [`org.jooq.CheckReturnValue`](https://www.jooq.org/javadoc/latest/org.jooq/org/jooq/CheckReturnValue.html)

它也将 [`com.google.errorprone.annotations.CanIgnoreReturnValue`](https://errorprone.info/api/latest/com/google/errorprone/annotations/CanIgnoreReturnValue.html) 视为等同于使用 `@IgnorableReturnValue`。