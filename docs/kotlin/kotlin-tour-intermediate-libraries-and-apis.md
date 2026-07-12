[//]: # (title: 库与 API)

<no-index/>

为了充分利用 Kotlin，请使用现有的库和 API，这样您可以将更多时间花在编码上，而不是重复造轮子。

库分发可重用的代码，从而简化常见任务。在库中，包含用于对相关类、函数和实用程序进行分组的软件包和对象。库将 API（应用程序编程接口）公开为一组函数、类或属性，开发者可以在其代码中使用它们。

![Kotlin 库与 API](kotlin-library-diagram.svg){width=600}

让我们来探索 Kotlin 的各种可能性。

## 标准库

Kotlin 拥有一个标准库，提供基本的类型、函数、集合和实用程序，使您的代码简洁且富有表现力。标准库的大部分内容（[`kotlin` 软件包](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/)中的所有内容）在任何 Kotlin 文件中都是现成可用的，无需显式导入：

```kotlin
fun main() {
    val text = "emosewa si niltoK"
    
   // 使用标准库中的 reversed() 函数
    val reversedText = text.reversed()

    // 使用标准库中的 print() 函数
    print(reversedText)
    // Kotlin is awesome
}
```
{kotlin-runnable="true" id="kotlin-tour-libraries-stdlib"}

然而，标准库的某些部分需要先导入才能在代码中使用。
例如，如果您想使用标准库的时间测量功能，则需要导入 [`kotlin.time` 软件包](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.time/)。

在文件顶部，添加 `import` 关键字，后跟您需要的软件包：

```kotlin
import kotlin.time.*
```

星号 `*` 是通配符导入，它告诉 Kotlin 导入软件包内的所有内容。您不能在伴生对象中使用星号 `*`。相反，您需要显式声明想要使用的伴生对象成员。

例如：

```kotlin
import kotlin.time.Duration
import kotlin.time.Duration.Companion.hours
import kotlin.time.Duration.Companion.minutes

fun main() {
    val thirtyMinutes: Duration = 30.minutes
    val halfHour: Duration = 0.5.hours
    println(thirtyMinutes == halfHour)
    // true
}
```
{kotlin-runnable="true" id="kotlin-tour-libraries-time"}

此示例：

* 导入 `Duration` 类及其伴生对象中的 `hours` 和 `minutes` 扩展属性。
* 使用 `minutes` 属性将 `30` 转换为 30 分钟的 `Duration`。
* 使用 `hours` 属性将 `0.5` 转换为 30 分钟的 `Duration`。
* 检查两个时长是否相等并打印结果。

### 先搜索再构建

在决定编写自己的代码之前，请检查标准库，看看您要找的内容是否已经存在。以下是标准库已经为您提供的一系列类、函数和属性的领域：

* [集合](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/)
* [序列](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.sequences/)
* [字符串操作](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/)
* [时间管理](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.time/)

要了解有关标准库中其他内容的更多信息，请查看其 [API 参考](https://kotlinlang.org/api/core/kotlin-stdlib/)。

## Kotlin 库

标准库涵盖了许多常见用例，但仍有一些它未涉及的领域。幸运的是，Kotlin 团队和社区的其他成员已经开发了广泛的库来补充标准库。例如，[`kotlinx-datetime`](https://kotlinlang.org/api/kotlinx-datetime/) 可以帮助您管理跨平台的时间。

您可以在我们的[搜索平台](https://klibs.io/)上找到有用的库。要使用它们，您需要执行额外的步骤，例如添加依赖项或插件。每个库都有一个 GitHub 仓库，其中包含有关如何将其包含到您的 Kotlin 项目中的说明。

添加库后，您可以导入其中的任何软件包。以下是如何导入 `kotlinx-datetime` 软件包以查找纽约当前时间的示例： 

```kotlin
import kotlinx.datetime.*

fun main() {
    val now = Clock.System.now() // 获取当前时刻
    println("Current instant: $now")

    val zone = TimeZone.of("America/New_York")
    val localDateTime = now.toLocalDateTime(zone)
    println("Local date-time in NY: $localDateTime")
}
```
{kotlin-runnable="true" id="kotlin-tour-libraries-datetime"}

此示例：

* 导入 `kotlinx.datetime` 软件包。
* 使用 `Clock.System.now()` 函数创建一个包含当前时间的 `Instant` 类实例，并将结果赋值给 `now` 变量。
* 打印当前时间。
* 使用 `TimeZone.of()` 函数查找纽约的时区，并将结果赋值给 `zone` 变量。
* 对包含当前时间的实例调用 `.toLocalDateTime()` 函数，并以纽约时区作为实参。
* 将结果赋值给 `localDateTime` 变量。
* 打印针对纽约时区调整后的时间。

> 要更详细地探索此示例中使用的函数和类，请参阅 [API 参考](https://kotlinlang.org/api/kotlinx-datetime/kotlinx-datetime/kotlinx.datetime/)。
>
{style="tip"}

## 选择启用 API

库作者可能会将某些 API 标记为需要选择启用，然后您才能在代码中使用它们。当 API 仍处于开发阶段且未来可能会发生变化时，他们通常会这样做。如果您不选择启用，则会看到如下警告或错误：

```text
This declaration needs opt-in. Its usage should be marked with '@...' or '@OptIn(...)'
```

要选择启用，请编写 `@OptIn`，后跟包含对 API 进行分类的类名的圆括号，并在其后附加上两个冒号 `::` 和 `class`。

例如，标准库中的 `uintArrayOf()` 函数属于 `@ExperimentalUnsignedTypes`，如 [API 参考](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/to-u-int-array.html)中所示：

```kotlin
@ExperimentalUnsignedTypes
inline fun uintArrayOf(vararg elements: UInt): UIntArray
```

在您的代码中，选择启用如下所示：

```kotlin
@OptIn(ExperimentalUnsignedTypes::class)
```

以下是一个示例，它选择启用 `uintArrayOf()` 函数来创建一个无符号整数数组并修改其中的一个元素：

```kotlin
@OptIn(ExperimentalUnsignedTypes::class)
fun main() {
    // 创建一个无符号整数数组
    val unsignedArray: UIntArray = uintArrayOf(1u, 2u, 3u, 4u, 5u)

    // 修改一个元素
    unsignedArray[2] = 42u
    println("Updated array: ${unsignedArray.joinToString()}")
    // Updated array: 1, 2, 42, 4, 5
}
```
{kotlin-runnable="true" id="kotlin-tour-libraries-apis"}

这是选择启用的最简单方法，但还有其他方法。要了解更多信息，请参阅[选择启用要求](opt-in-requirements.md)。

## 练习 {completion-point="true"}

### 练习 1 {initial-collapse-state="collapsed" collapsible="true" id="libraries-exercise-1"}

您正在开发一款金融应用程序，帮助用户计算其投资的未来价值。计算复利的公式为：

<math>A = P \times (1 + \displaystyle\frac{r}{n})^{nt}</math>

其中：

* `A` 是计息后累积的金额（本金 + 利息）。
* `P` 是本金金额（初始投资）。
* `r` 是年利率（小数）。
* `n` 是每年复利的次数。
* `t` 是资金投资的时间（以年为单位）。

更新代码以：

1. 从 [`kotlin.math` 软件包](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.math/)中导入必要的函数。
2. 为 `calculateCompoundInterest()` 函数添加函数体，用于计算应用复利后的最终金额。

|--|--|

```kotlin
// 在此处编写您的代码

fun calculateCompoundInterest(P: Double, r: Double, n: Int, t: Int): Double {
    // 在此处编写您的代码
}

fun main() {
    val principal = 1000.0
    val rate = 0.05
    val timesCompounded = 4
    val years = 5
    val amount = calculateCompoundInterest(principal, rate, timesCompounded, years)
    println("The accumulated amount is: $amount")
    // The accumulated amount is: 1282.0372317085844
}

```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-libraries-exercise-1"}

|---|---|
```kotlin
import kotlin.math.*

fun calculateCompoundInterest(P: Double, r: Double, n: Int, t: Int): Double {
    return P * (1 + r / n).pow(n * t)
}

fun main() {
    val principal = 1000.0
    val rate = 0.05
    val timesCompounded = 4
    val years = 5
    val amount = calculateCompoundInterest(principal, rate, timesCompounded, years)
    println("The accumulated amount is: $amount")
    // The accumulated amount is: 1282.0372317085844
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="参考答案" id="kotlin-tour-libraries-solution-1"}

### 练习 2 {initial-collapse-state="collapsed" collapsible="true" id="libraries-exercise-2"}

您想要测量在程序中执行多个数据处理任务所需的时间。更新代码以添加正确的导入语句，并使用来自 [`kotlin.time`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.time/) 软件包的函数：

|---|---|

```kotlin
// 在此处编写您的代码

fun main() {
    val timeTaken = /* 在此处编写您的代码 */ {
        // 模拟一些数据处理
        val data = List(1000) { it * 2 }
        val filteredData = data.filter { it % 3 == 0 }

        // 模拟处理过滤后的数据
        val processedData = filteredData.map { it / 2 }
        println("Processed data")
    }

    println("Time taken: $timeTaken") // 例如 16 ms
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-libraries-exercise-2"}

|---|---|
```kotlin
import kotlin.time.measureTime

fun main() {
    val timeTaken = measureTime {
        // 模拟一些数据处理
        val data = List(1000) { it * 2 }
        val filteredData = data.filter { it % 3 == 0 }

        // 模拟处理过滤后的数据
        val processedData = filteredData.map { it / 2 }
        println("Processed data")
    }

    println("Time taken: $timeTaken") // 例如 16 ms
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="参考答案" id="kotlin-tour-libraries-solution-2"}

### 练习 3 {initial-collapse-state="collapsed" collapsible="true" id="properties-exercise-3"}

最新的 Kotlin 版本中标准库提供了一个新功能。您想尝试一下，但它需要选择启用。该功能属于 [`@ExperimentalStdlibApi`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-experimental-stdlib-api/)。您的代码中选择启用应该是什么样子的？

|---|---|
```kotlin
@OptIn(ExperimentalStdlibApi::class)
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="参考答案" id="kotlin-tour-libraries-solution-3"}

## 下一步

恭喜！您已完成中级向导！您愿意[分享关于您体验的反馈](https://surveys.hotjar.com/bf4ce865-99ce-4fc1-b107-e9b16bc31592)吗？ 

作为下一步，请查看我们关于热门 Kotlin 应用程序的教程：

* [使用 Spring Boot 和 Kotlin 创建后端应用程序](jvm-create-project-with-spring-boot.md)
* 从头开始为 Android 和 iOS 创建跨平台应用程序并：
    * [在保持 UI 原生的同时共享业务逻辑](https://kotlinlang.org/docs/multiplatform/multiplatform-create-first-app.html)
    * [共享业务逻辑和 UI](https://kotlinlang.org/docs/multiplatform/compose-multiplatform-create-first-app.html)

<seealso></seealso>

<list id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-intermediate-null-safety.md" mode="outline" icon="arrow-left" icon-position="left">上一步</a>
  </li>
</list>