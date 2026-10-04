[//]: # (title: 库与 API)

<no-index/>

为了充分发挥 Kotlin 的优势，请使用现有的库和 API，这样您可以将更多时间花在编写代码上，而不是重复造轮子。

库用于分发可复用的代码，以简化常见任务。在库中，包含对相关类、函数和实用工具进行分组的包（package）与对象。库以一组可供开发者在其代码中使用的函数、类或属性的形式公开 API（应用程序编程接口）。

![Kotlin 库与 API](kotlin-library-diagram.svg){width=600}

让我们一起探索 Kotlin 的无限可能。

## 标准库 {id="the-standard-library"}

Kotlin 提供了一个标准库，其中包含必要的类型、函数、集合和实用工具，让您的代码更加简洁且富有表现力。标准库的大部分内容（[`kotlin` 包](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/)中的所有内容）在任何 Kotlin 文件中都可以直接使用，无需显式导入：

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

然而，标准库的某些部分需要先导入，然后才能在代码中使用。
例如，如果您想使用标准库的时间度量功能，则需要导入 [`kotlin.time` 包](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.time/)。

在文件顶部，添加 `import` 关键字，后跟您需要的包：

```kotlin
import kotlin.time.*
```

星号 `*` 是一种通配符导入，它指示 Kotlin 导入该包中的所有内容。您不能对伴生对象（companion object）使用星号 `*`。相反，您需要显式声明要使用的伴生对象成员。

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

该示例：

* 导入了 `Duration` 类及其伴生对象中的 `hours` 和 `minutes` 扩展属性。
* 使用 `minutes` 属性将 `30` 转换为 30 分钟的 `Duration`。
* 使用 `hours` 属性将 `0.5` 转换为 30 分钟的 `Duration`。
* 检查两个时长是否相等并打印结果。

### 构建前先搜索 {id="search-before-you-build"}

在决定编写自己的代码之前，请先检查标准库，看看所需功能是否已经存在。
以下是标准库已经为您提供了大量类、函数和属性的领域列表：

* [集合 (Collections)](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/)
* [序列 (Sequences)](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.sequences/)
* [字符串操作 (String manipulation)](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/)
* [时间管理 (Time management)](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.time/)

要了解更多关于标准库中其他内容的信息，请探索其 [API 参考](https://kotlinlang.org/api/core/kotlin-stdlib/)。

## Kotlin 库 {id="kotlin-libraries"}

标准库涵盖了许多常见的用例，但仍有一些场景未涉及。幸运的是，Kotlin 团队和社区开发了各种各样的库来对标准库进行补充。例如，[`kotlinx-datetime`](https://kotlinlang.org/api/kotlinx-datetime/) 可以帮助您跨不同平台管理时间。

您可以在我们的[搜索平台](https://klibs.io/)上找到有用的库。要使用它们，您需要执行一些额外步骤，例如添加依赖项或插件。每个库都有一个 GitHub 仓库，其中包含有关如何将其引入到您的 Kotlin 项目中的说明。

添加库后，您就可以导入其中的任何包。以下是一个示例，说明如何导入 `kotlinx-datetime` 包来获取纽约的当前时间：

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

该示例：

* 导入了 `kotlinx.datetime` 包。
* 使用 `Clock.System.now()` 函数创建包含当前时间的 `Instant` 类实例，并将结果赋值给 `now` 变量。
* 打印当前时间。
* 使用 `TimeZone.of()` 函数查找纽约的时区，并将结果赋值给 `zone` 变量。
* 在包含当前时间的实例上调用 `.toLocalDateTime()` 函数，并将纽约时区作为实参传入。
* 将结果赋值给 `localDateTime` 变量。
* 打印调整为纽约时区后的时间。

> 要更详细地了解此示例中使用的函数和类，请参阅 [API 参考](https://kotlinlang.org/api/kotlinx-datetime/kotlinx-datetime/kotlinx.datetime/)。
>
{style="tip"}

## 选择加入 API (Opt-in) {id="opt-in-to-apis"}

库作者可能会将某些 API 标记为需要显式选择加入（opt-in），然后您才能在代码中使用它们。通常在 API 仍在开发中且未来可能会发生变化时，他们会这样做。如果您未选择加入，将会看到如下警告或错误：

```text
This declaration needs opt-in. Its usage should be marked with '@...' or '@OptIn(...)'
```

要选择加入，请编写 `@OptIn`，后跟包含对该 API 进行分类的类名的圆括号，并在类名后追加两个冒号 `::` 和 `class`。

例如，标准库中的 `uintArrayOf()` 函数属于 `@ExperimentalUnsignedTypes`，如 [API 参考文档](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/to-u-int-array.html)中所示：

```kotlin
@ExperimentalUnsignedTypes
inline fun uintArrayOf(vararg elements: UInt): UIntArray
```

在您的代码中，选择加入的写法如下：

```kotlin
@OptIn(ExperimentalUnsignedTypes::class)
```

以下示例选择加入使用 `uintArrayOf()` 函数来创建一个无符号整数数组，并修改其中的一个元素：

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

这是选择加入最简单的方式，但还有其他方式。要了解更多信息，请参阅[选择加入要求](opt-in-requirements.md)。

## 练习 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="计算复利" id="libraries-exercise-1">

您正在开发一款金融应用程序，帮助用户计算其投资的未来价值。计算复利的公式为：

<math>A = P \times (1 + \displaystyle\frac{r}{n})^{nt}</math>

其中：

* `A` 是计息后累积的金额（本金 + 利息）。
* `P` 是本金金额（初始投资）。
* `r` 是年利率（小数表示）。
* `n` 是每年复利的次数。
* `t` 是资金投资的时间（以年为单位）。

请更新代码以：

1. 从 [`kotlin.math` 包](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.math/)中导入必要的函数。
2. 为 `calculateCompoundInterest()` 函数添加函数体，以计算应用复利后的最终金额。

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

</def>
<def title="度量数据处理所花费的时间" id="libraries-exercise-2">

您想要度量程序中执行多项数据处理任务所花费的时间。请更新代码，从 [`kotlin.time`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.time/) 包中添加正确的导入语句和函数：

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

    println("Time taken: $timeTaken") // 例如：16 ms
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-libraries-exercise-2"}

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

    println("Time taken: $timeTaken") // 例如：16 ms
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="参考答案" id="kotlin-tour-libraries-solution-2"}

</def>
<def title="选择加入实验性 API" id="libraries-exercise-3">

最新 Kotlin 版本中的标准库提供了一项新功能。您想要试用该功能，但它需要选择加入。该功能属于 [`@ExperimentalStdlibApi`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-experimental-stdlib-api/)。
在您的代码中，选择加入的写法应该是什么样的？

```kotlin
@OptIn(ExperimentalStdlibApi::class)
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="参考答案" id="kotlin-tour-libraries-solution-3"}

</def>
</deflist>

## 下一步？ {id="what-s-next"}

祝贺您！您已完成进阶之旅！您愿意[分享您对本次体验的反馈](https://surveys.hotjar.com/bf4ce865-99ce-4fc1-b107-e9b16bc31592)吗？

接下来，请查看我们针对热门 Kotlin 应用程序的教程：

<p></p> <!-- workaround for MRK057: Paragraph can only contain inline elements -->
<panels columns="2" id="kotlin-tour-whats-next">
    <panel>
        <title>用于后端的 Kotlin</title>
        <p>使用 Spring Boot 和 Kotlin 创建后端应用程序。</p>
        <a href="jvm-create-project-with-spring-boot.md" as="button" icon="arrow-right" icon-position="right" id="kotlin-tour-backend-tutorial">开始</a>
    </panel>
    <panel>
        <title>Kotlin Multiplatform</title>
        <p>从头开始创建跨平台应用程序，并共享业务逻辑与 UI。</p>
        <a href="https://kotlinlang.org/docs/multiplatform/compose-multiplatform-create-first-app.html" as="button" icon="arrow-right" icon-position="right" id="kotlin-tour-cmp-tutorial">开始</a>
    </panel>
</panels>

<seealso></seealso>

<list id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-intermediate-null-safety.md" mode="outline" icon="arrow-left" icon-position="left">上一步</a>
  </li>
</list>