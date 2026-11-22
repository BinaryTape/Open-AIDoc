[//]: # (title: 库和 API)

<no-index/>

为了充分利用 Kotlin，请使用现有的库和 API，这样您可以将更多时间花在编写代码上，减少重复造轮子的时间。

库分发了可简化常见任务的可重用代码。在库中，有将相关类、函数和实用工具进行分组的软件包与对象。库以一组函数、类或属性的形式公开 API（应用程序编程接口），供开发者在自己的代码中使用。

![Kotlin libraries and APIs](kotlin-library-diagram.svg){width=600}

让我们来探索 Kotlin 的无限可能。

## 标准库 {id="the-standard-library"}

Kotlin 拥有一个标准库，提供基本类型、函数、集合与实用工具，使您的代码更加简洁且富有表现力。标准库的大部分内容（[`kotlin` 软件包](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/)中的所有内容）都可直接在任何 Kotlin 文件中使用，无需显式导入：

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

但是，标准库的某些部分需要先导入才能在代码中使用。例如，如果您想使用标准库的时间度量功能，则需要导入 [`kotlin.time` 软件包](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.time/)。

在文件顶部，添加 `import` 关键字，后跟您所需的软件包：

```kotlin
import kotlin.time.*
```

星号 `*` 是一种通配符导入，它指示 Kotlin 导入该软件包内的所有内容。不能对伴生对象使用星号 `*`。相反，您需要显式声明要使用的伴生对象成员。

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
* 使用 `minutes` 属性将 `30` 转换为时长为 30 分钟的 `Duration`。
* 使用 `hours` 属性将 `0.5` 转换为时长为 30 分钟的 `Duration`。
* 检查这两个时长是否相等并打印结果。

### 构建前先搜索 {id="search-before-you-build"}

在决定编写自己的代码之前，请先检查标准库，看看您要找的内容是否已经存在。以下是标准库已经为您提供了大量类、函数和属性的领域列表：

* [集合](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/)
* [序列](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.sequences/)
* [字符串操作](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/)
* [时间管理](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.time/)

要详细了解标准库中的其他内容，请浏览其 [API 参考](https://kotlinlang.org/api/core/kotlin-stdlib/)。

## Kotlin 库 {id="kotlin-libraries"}

标准库涵盖了许多常见的用例，但仍有一些场景并未涉及。幸运的是，Kotlin 团队以及广大的社区开发了丰富的库来补充标准库。例如，[`kotlinx-datetime`](https://kotlinlang.org/api/kotlinx-datetime/) 可以帮助您跨不同平台管理时间。

您可以在我们的[搜索平台](https://klibs.io/)上找到实用的库。若要使用它们，您需要执行额外的步骤，例如添加依赖项或插件。每个库都有一个 GitHub 仓库，其中包含有关如何将其引入 Kotlin 项目的说明。

添加库之后，就可以导入其中的任何软件包。以下是一个导入 `kotlinx-datetime` 软件包以获取纽约当前时间的示例：

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
* 打印按纽约时区调整后的时间。

> 要更详细地探索此示例所使用的函数和类，请参阅 [API 参考](https://kotlinlang.org/api/kotlinx-datetime/kotlinx-datetime/kotlinx.datetime/)。
>
{style="tip"}

## 选择启用 API {id="opt-in-to-apis"}

库作者可能会将某些 API 标记为需要选择启用（opt-in）才能在代码中使用。当 API 仍处于开发阶段且将来可能会发生更改时，他们通常会这样做。如果您没有选择启用，将会看到如下警告或错误：

```text
This declaration needs opt-in. Its usage should be marked with '@...' or '@OptIn(...)'
```

要选择启用，请在写入 `@OptIn` 后跟圆括号，其中包含对该 API 进行分类的类名，并在其后追加双冒号 `::` 和 `class`。

例如，标准库中的 `uintArrayOf()` 函数属于 `@ExperimentalUnsignedTypes`，如 [API 参考中](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/to-u-int-array.html)所示：

```kotlin
@ExperimentalUnsignedTypes
inline fun uintArrayOf(vararg elements: UInt): UIntArray
```

在您的代码中，选择启用如下所示：

```kotlin
@OptIn(ExperimentalUnsignedTypes::class)
```

以下示例选择启用了 `uintArrayOf()` 函数来创建无符号整数数组，并修改了其中的一个元素：

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

这是选择启用的最简单方式，但还有其他方法。要了解更多信息，请参阅[选择启用要求](opt-in-requirements.md)。

## 练习 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="计算复利" id="libraries-exercise-1">

您正在开发一款金融应用程序，帮助用户计算其投资的未来价值。计算复利的公式为：

<math>A = P \times (1 + \displaystyle\frac{r}{n})^{nt}</math>

其中：

* `A` 是计息后累计的金额（本金 + 利息）。
* `P` 是本金金额（初始投资）。
* `r` 是年利率（小数形式）。
* `n` 是每年复利的次数。
* `t` 是投资时间（年）。

更新代码以：

1. 从 [`kotlin.math` 软件包](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.math/)中导入必要的函数。
2. 为 `calculateCompoundInterest()` 函数添加函数体，以计算应用复利后的最终金额。

```kotlin
// 在此处编写代码

fun calculateCompoundInterest(P: Double, r: Double, n: Int, t: Int): Double {
    // 在此处编写代码
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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/CalculateCompoundInterestTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="参考解答" id="kotlin-tour-libraries-solution-1"}

</def>
<def title="度量数据处理所花费的时间" id="libraries-exercise-2">

您想要度量程序中执行多项数据处理任务所花费的时间。更新代码以添加来自 [`kotlin.time`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.time/) 软件包的正确导入语句和函数：

```kotlin
// 在此处编写代码

fun main() {
    val timeTaken = /* 在此处编写代码 */ {
        // 模拟一些数据处理
        val data = List(1000) { it * 2 }
        val filteredData = data.filter { it % 3 == 0 }

        // 模拟处理过滤后的数据
        val processedData = filteredData.map { it / 2 }
        println("Processed data")
    }

    println("Time taken: $timeTaken") // e.g. 16 ms
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

    println("Time taken: $timeTaken") // e.g. 16 ms
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/MeasureTimeTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="参考解答" id="kotlin-tour-libraries-solution-2"}

</def>
<def title="选择启用实验性 API" id="libraries-exercise-3">

最新发布的 Kotlin 版本中引入了标准库的新功能。您想试用一下，但它需要选择启用。该功能归属于 [`@ExperimentalStdlibApi`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-experimental-stdlib-api/)。在您的代码中，该选择启用语句应该是什么样的？

```kotlin
@OptIn(ExperimentalStdlibApi::class)
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="参考解答" id="kotlin-tour-libraries-solution-3"}

</def>
</deflist>

## 下一步？ {id="what-s-next"}

恭喜！您已完成了中级导览！您愿意[分享您的体验反馈](https://surveys.hotjar.com/bf4ce865-99ce-4fc1-b107-e9b16bc31592)吗？ 

作为下一步，请查看我们关于热门 Kotlin 应用程序的教程：

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
        <a href="https://kotlinlang.org/docs/multiplatform/compose-multiplatform-new-project.html" as="button" icon="arrow-right" icon-position="right" id="kotlin-tour-cmp-tutorial">开始</a>
    </panel>
</panels>

<seealso></seealso>

<list id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-intermediate-null-safety.md" mode="outline" icon="arrow-left" icon-position="left">上一步</a>
  </li>
</list>