[//]: # (title: 库与 API)

<no-index/>

为了充分发挥 Kotlin 的优势，你可以使用现有的库和 API，从而把更多时间花在编写代码上，减少重复造轮子的时间。

库分发了可重用的代码，从而简化常见任务。库内部包含软件包和对象，它们将相关的类、函数和实用程序归类在一起。库将 API（应用程序编程接口）公开为一组函数、类或属性，开发者可以在其代码中使用它们。

![Kotlin 库与 API](kotlin-library-diagram.svg){width=600}

让我们一起探索 Kotlin 的丰富功能。

## 标准库 {id="the-standard-library"}

Kotlin 拥有一个标准库，提供了必不可少的类型、函数、集合和实用程序，使你的代码既简洁又富有表现力。标准库的大部分内容（[`kotlin` 软件包](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/)中的所有内容）都可以随时在任何 Kotlin 文件中直接使用，无需显式导入：

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

不过，标准库的某些部分需要先导入才能在代码中使用。
例如，如果你想使用标准库的时间测量功能，则需要导入 [`kotlin.time` 软件包](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.time/)。

在文件顶部，添加 `import` 关键字并后跟所需的软件包：

```kotlin
import kotlin.time.*
```

星号 `*` 是通配符导入，它指示 Kotlin 导入该软件包内的所有内容。你不能对伴生对象（companion object）使用星号 `*`。相反，你需要显式声明想要使用的伴生对象成员。

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

* 导入了 `Duration` 类以及来自其伴生对象的 `hours` 和 `minutes` 扩展属性。
* 使用 `minutes` 属性将 `30` 转换为 30 分钟的 `Duration`。
* 使用 `hours` 属性将 `0.5` 转换为 30 分钟的 `Duration`。
* 检查这两个时长是否相等并输出结果。

### 先查后建 {id="search-before-you-build"}

在决定自己编写代码之前，先检查标准库，看看你所需的功能是否已经存在。
以下是标准库已经为你提供了大量类、函数和属性的领域列表：

* [集合 (Collections)](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/)
* [序列 (Sequences)](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.sequences/)
* [字符串操作](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/)
* [时间管理](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.time/)

要详细了解标准库中还有哪些内容，请浏览其 [API 参考文档](https://kotlinlang.org/api/core/kotlin-stdlib/)。

## Kotlin 库 {id="kotlin-libraries"}

标准库涵盖了许多常见用例，但仍有一些场景无法覆盖。幸运的是，Kotlin 团队和社区开发了各种各样的库来作为标准库的补充。例如，[`kotlinx-datetime`](https://kotlinlang.org/api/kotlinx-datetime/) 可以帮助你跨不同平台管理时间。

你可以在我们的[搜索平台](https://klibs.io/)上找到有用的库。要使用它们，需要执行一些额外步骤，例如添加依赖项或插件。每个库都有一个 GitHub 仓库，其中包含有关如何将其引入 Kotlin 项目的说明。

添加库后，你就可以导入其中的任何软件包。以下是一个导入 `kotlinx-datetime` 软件包以查询纽约当前时间的示例：

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

* 导入了 `kotlinx.datetime` 软件包。
* 使用 `Clock.System.now()` 函数创建包含当前时间的 `Instant` 类实例，并将结果赋值给 `now` 变量。
* 打印当前时间。
* 使用 `TimeZone.of()` 函数查找纽约的时区，并将结果赋值给 `zone` 变量。
* 在包含当前时间的实例上调用 `.toLocalDateTime()` 函数，并将纽约时区作为实参传入。
* 将结果赋值给 `localDateTime` 变量。
* 打印根据纽约时区调整后的时间。

> 要更详细地了解此示例所使用的函数和类，请参阅 [API 参考文档](https://kotlinlang.org/api/kotlinx-datetime/kotlinx-datetime/kotlinx.datetime/)。
>
{style="tip"}

## 选择加入 API（Opt in） {id="opt-in-to-apis"}

库的作者可能会将某些 API 标记为需要 opt-in（显式声明同意使用），然后你才能在代码中使用它们。当某个 API 仍处于开发阶段且将来可能会发生更改时，通常会采用这种做法。如果你未进行 opt-in，将会看到如下警告或错误：

```text
This declaration needs opt-in. Its usage should be marked with '@...' or '@OptIn(...)'
```

要选择加入（opt-in），请编写 `@OptIn`，后跟包含对该 API 进行分类的类名的圆括号，并在类名后附加双冒号 `::` 和 `class`。

例如，正如 [API 参考文档](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/to-u-int-array.html)所示，标准库中的 `uintArrayOf()` 函数归属于 `@ExperimentalUnsignedTypes`：

```kotlin
@ExperimentalUnsignedTypes
inline fun uintArrayOf(vararg elements: UInt): UIntArray
```

在你的代码中，opt-in 的写法如下：

```kotlin
@OptIn(ExperimentalUnsignedTypes::class)
```

以下是一个通过 opt-in 使用 `uintArrayOf()` 函数创建无符号整数数组并修改其中一个元素的示例：

```kotlin
@OptIn(ExperimentalUnsignedTypes::class)
fun main() {
    // 创建无符号整数数组
    val unsignedArray: UIntArray = uintArrayOf(1u, 2u, 3u, 4u, 5u)

    // 修改一个元素
    unsignedArray[2] = 42u
    println("Updated array: ${unsignedArray.joinToString()}")
    // Updated array: 1, 2, 42, 4, 5
}
```
{kotlin-runnable="true" id="kotlin-tour-libraries-apis"}

这是最简单的 opt-in 方式，但还有其他方法。要了解更多信息，请参阅 [Opt-in 要求](opt-in-requirements.md)。

## 练习 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="计算复利" id="libraries-exercise-1">

你正在开发一个金融应用程序，帮助用户计算其投资的未来价值。计算复利的公式为：

<math>A = P \times (1 + \displaystyle\frac{r}{n})^{nt}</math>

其中：

* `A` 是计息后累积的金额（本金 + 利息）。
* `P` 是本金金额（初始投资额）。
* `r` 是年利率（小数形式）。
* `n` 是每年复利的次数。
* `t` 是资金投资的期限（以年为单位）。

请更新代码以完成以下任务：

1. 从 [`kotlin.math` 软件包](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.math/)中导入所需的函数。
2. 为 `calculateCompoundInterest()` 函数添加函数体，计算应用复利后的最终金额。

```kotlin
// 在此处编写你的代码

fun calculateCompoundInterest(P: Double, r: Double, n: Int, t: Int): Double {
    // 在此处编写你的代码
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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/CalculateCompoundInterestTest.kt" validate="false" id="kotlin-tour-libraries-exercise-1"}

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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/CalculateCompoundInterestTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解决方案" id="kotlin-tour-libraries-solution-1"}

</def>
<def title="测量数据处理所花费的时间" id="libraries-exercise-2">

你想测量程序中执行多项数据处理任务所花费的时间。请更新代码，从 [`kotlin.time`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.time/) 软件包中添加正确的导入语句和函数：

```kotlin
// 在此处编写你的代码

fun main() {
    val timeTaken = /* 在此处编写你的代码 */ {
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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/MeasureTimeTest.kt" validate="false" id="kotlin-tour-libraries-exercise-2"}

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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/MeasureTimeTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解决方案" id="kotlin-tour-libraries-solution-2"}

</def>
<def title="选择使用实验性 API" id="libraries-exercise-3">

在最新的 Kotlin 版本中，标准库推出了一项新功能。你想要尝试该功能，但它需要 opt-in。该功能属于 [`@ExperimentalStdlibApi`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-experimental-stdlib-api/)。
在你的代码中，opt-in 应该是什么样的？

```kotlin
@OptIn(ExperimentalStdlibApi::class)
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解决方案" id="kotlin-tour-libraries-solution-3"}

</def>
</deflist>

## 接下来的内容 {id="what-s-next"}

恭喜！你已完成了中级教程导览！是否愿意[分享你的反馈](https://surveys.hotjar.com/bf4ce865-99ce-4fc1-b107-e9b16bc31592)？

接下来，你可以查看我们针对热门 Kotlin 应用程序的教程：

<p></p> <!-- workaround for MRK057: Paragraph can only contain inline elements -->
<panels columns="2" id="kotlin-tour-whats-next">
    <panel>
        <title>Kotlin 后端开发</title>
        <p>使用 Spring Boot 和 Kotlin 创建后端应用程序。</p>
        <a href="jvm-create-project-with-spring-boot.md" as="button" icon="arrow-right" icon-position="right" id="kotlin-tour-backend-tutorial">开始</a>
    </panel>
    <panel>
        <title>Kotlin Multiplatform</title>
        <p>从零开始创建跨平台应用程序，并共享业务逻辑与 UI。</p>
        <a href="https://kotlinlang.org/docs/multiplatform/compose-multiplatform-create-first-app.html" as="button" icon="arrow-right" icon-position="right" id="kotlin-tour-cmp-tutorial">开始</a>
    </panel>
</panels>

<seealso></seealso>

<list id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-intermediate-null-safety.md" mode="outline" icon="arrow-left" icon-position="left">上一步</a>
  </li>
</list>