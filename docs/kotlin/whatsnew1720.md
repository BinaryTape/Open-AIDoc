[//]: # (title: Kotlin 1.7.20 最新变化)

<web-summary>阅读 Kotlin 1.7.20 版本发布说明，内容涵盖新的语言功能、Kotlin Multiplatform、JVM、Native、JS 的更新，以及对 Gradle 和 Maven 的构建工具支持。</web-summary>

<tldr>
   <p>IntelliJ IDEA 2021.3、2022.1 和 2022.2 版本现已提供对 Kotlin 1.7.20 的 IDE 支持。</p>
</tldr>

_[发布日期：2022 年 9 月 29 日](releases.md#release-history)_

Kotlin 1.7.20 现已发布！以下是此版本的一些亮点：

* [全新的 Kotlin K2 编译器支持 `all-open`、带有接收者的 SAM、Lombok 及其他编译器插件](#support-for-kotlin-k2-compiler-plugins)
* [引入了用于创建左闭右开区间的 `..<` 运算符预览版](#preview-of-the-operator-for-creating-open-ended-ranges)
* [全新的 Kotlin/Native 内存管理器现在默认启用](#the-new-kotlin-native-memory-manager-enabled-by-default)
* [为 JVM 引入了一项新的实验性功能：具有泛型底层类型的内联类](#generic-inline-classes)

你也可以通过这个视频简要了解这些变化：

<video src="https://www.youtube.com/v/OG9npowJgE8" title="Kotlin 1.7.20 最新变化"/>

> 有关 Kotlin 发布周期的信息，请参阅 [Kotlin 发布流程](releases.md)。
>
{style="tip"}

## 支持 Kotlin K2 编译器插件

Kotlin 团队继续致力于稳定 K2 编译器。
K2 仍处于 **Alpha** 阶段（正如在 [Kotlin 1.7.0 发布公告](whatsnew17.md#new-kotlin-k2-compiler-for-the-jvm-in-alpha)中所述），
但它现在已支持多个编译器插件。你可以关注 [此 YouTrack 问题](https://youtrack.jetbrains.com/issue/KT-52604)
以获取 Kotlin 团队关于新编译器的最新动态。

从 1.7.20 版本开始，Kotlin K2 编译器支持以下插件：

* [`all-open`](all-open-plugin.md)
* [`no-arg`](no-arg-plugin.md)
* [带有接收者的 SAM](sam-with-receiver-plugin.md)
* [Lombok](lombok.md)
* AtomicFU
* `jvm-abi-gen`

> 新 K2 编译器的 Alpha 版本仅适用于 JVM 项目。
> 它不支持 Kotlin/JS、Kotlin/Native 或其他多平台项目。
>
{style="warning"}

通过以下视频了解更多关于新编译器及其优势的信息：
* [通往新 Kotlin 编译器之路](https://www.youtube.com/watch?v=iTdJJq_LyoY)
* [K2 编译器：自顶向下的视角](https://www.youtube.com/watch?v=db19VFLZqJM)

### 如何启用 Kotlin K2 编译器

要启用并测试 Kotlin K2 编译器，请使用以下编译器选项：

```bash
-Xuse-k2
```

你可以在 `build.gradle(.kts)` 文件中指定它：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
tasks.withType<KotlinCompile> {
    kotlinOptions.useK2 = true
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
compileKotlin {
    kotlinOptions.useK2 = true
}
```
</tab>
</tabs>

查看你的 JVM 项目的性能提升，并将其与旧编译器的结果进行对比。

### 留下你对新 K2 编译器的反馈

我们非常感谢任何形式的反馈：
* 在 Kotlin Slack 中直接向 K2 开发者提供反馈：[获取邀请](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up?_gl=1*ju6cbn*_ga*MTA3MTk5NDkzMC4xNjQ2MDY3MDU4*_ga_9J976DJZ68*MTY1ODMzNzA3OS4xMDAuMS4xNjU4MzQwODEwLjYw) 并加入 [#k2-early-adopters](https://kotlinlang.slack.com/archives/C03PK0PE257) 频道。
* 将你在使用新 K2 编译器时遇到的任何问题提交到 [我们的问题跟踪器](https://kotl.in/issue)。
* [启用 **发送使用统计数据** 选项](https://www.jetbrains.com/help/idea/settings-usage-statistics.html)，允许 JetBrains 收集有关 K2 使用情况的匿名数据。

## 语言

Kotlin 1.7.20 引入了新语言功能的预览版，并对构造器类型推断实施了限制：

* [用于创建左闭右开区间的 ..< 运算符预览版](#preview-of-the-operator-for-creating-open-ended-ranges)
* [新的 data object 声明](#improved-string-representations-for-singletons-and-sealed-class-hierarchies-with-data-objects)
* [构造器类型推断限制](#new-builder-type-inference-restrictions)

### 用于创建左闭右开区间的 ..< 运算符预览版

> 新运算符处于 [实验性](components-stability.md#stability-levels-explained) 阶段，且在 IDE 中的支持有限。
>
{style="warning"}

此版本引入了新的 `..<` 运算符。Kotlin 已有 `..` 运算符来表示值的区间。新的 `..<` 运算符的作用类似于 `until` 函数，帮助你定义左闭右开区间。

<video src="https://www.youtube.com/watch?v=v0AHdAIBnbs" title="用于左闭右开区间的新运算符"/>

我们的研究表明，这个新运算符能更好地表达左闭右开区间，并明确表明不包含上限。

以下是在 `when` 表达式中使用 `..<` 运算符的示例：

```kotlin
when (value) {
    in 0.0..<0.25 -> // 第一个四分之一
    in 0.25..<0.5 -> // 第二个四分之一
    in 0.5..<0.75 -> // 第三个四分之一
    in 0.75..1.0 ->  // 最后一个四分之一  <- 注意此处为闭区间
}
```
{validate="false"}

#### 标准库 API 变更

公共 Kotlin 标准库的 `kotlin.ranges` 软件包中将引入以下新类型和操作：

##### 新的 OpenEndRange&lt;T&gt; 接口

用于表示左闭右开区间的新接口与现有的 `ClosedRange<T>` 接口非常相似：

```kotlin
interface OpenEndRange<T : Comparable<T>> {
    // 下限
    val start: T
    // 上限，不包含在区间内
    val endExclusive: T
    operator fun contains(value: T): Boolean = value >= start && value < endExclusive
    fun isEmpty(): Boolean = start >= endExclusive
}
```
{validate="false"}

##### 在现有可迭代区间中实现 OpenEndRange

当开发者需要获取排除上限的区间时，目前通常使用 `until` 函数来产生具有相同值的闭合可迭代区间。为了让这些区间能被接收 `OpenEndRange<T>` 的新 API 所接受，我们希望在现有的可迭代区间中实现该接口：`IntRange`、`LongRange`、`CharRange`、`UIntRange` 和 `ULongRange`。因此，它们将同时实现 `ClosedRange<T>` 和 `OpenEndRange<T>` 接口。

```kotlin
class IntRange : IntProgression(...), ClosedRange<Int>, OpenEndRange<Int> {
    override val start: Int
    override val endInclusive: Int
    override val endExclusive: Int
}
```
{validate="false"}

##### 针对标准类型的 rangeUntil 运算符

将为目前定义了 `rangeTo` 运算符的相同类型和组合提供 `rangeUntil` 运算符。出于原型设计目的，我们目前将它们作为扩展函数提供，但为了保持一致性，我们计划在稳定左闭右开区间 API 之前将它们改为成员函数。

#### 如何启用 ..&lt; 运算符

要使用 `..<` 运算符或为你自己的类型实现该运算符约定，请启用 `-language-version 1.8` 编译器选项。

为支持标准类型的左闭右开区间而引入的新 API 元素需要显式开启（opt-in），这在实验性标准库 API 中是常规做法：`@OptIn(ExperimentalStdlibApi::class)`。或者，你可以使用 `-opt-in=kotlin.ExperimentalStdlibApi` 编译器选项。

[在此 KEEP 文档中阅读有关新运算符的更多信息](https://github.com/kotlin/KEEP/blob/open-ended-ranges/proposals/open-ended-ranges.md)。

### 针对单例和带有 data object 的密封类层次结构改进了字符串表示

> data object 处于 [实验性](components-stability.md#stability-levels-explained) 阶段，目前在 IDE 中的支持有限。
>
{style="warning"}

此版本引入了一种可供你使用的新型 `object` 声明：`data object`。[data object](https://youtrack.jetbrains.com/issue/KT-4107) 的行为在概念上与普通的 `object` 声明完全一致，但开箱即用地带有了清晰的 `toString` 表示。

<video src="https://www.youtube.com/v/ovAqcwFhEGc" title="Kotlin 1.7.20 中的 data object"/>

```kotlin
package org.example
object MyObject
data object MyDataObject

fun main() {
    println(MyObject) // org.example.MyObject@1f32e575
    println(MyDataObject) // MyDataObject
}
```

这使得 `data object` 声明非常适合密封类层次结构，你可以在其中将它们与 `data class` 声明并列使用。在以下代码片段中，将 `EndOfFile` 声明为 `data object` 而不是普通的 `object`，意味着它将获得美观的 `toString` 而无需手动重写，从而与相伴的 `data class` 定义保持对称：

```kotlin
sealed class ReadResult {
    data class Number(val value: Int) : ReadResult()
    data class Text(val value: String) : ReadResult()
    data object EndOfFile : ReadResult()
}

fun main() {
    println(ReadResult.Number(1)) // Number(value=1)
    println(ReadResult.Text("Foo")) // Text(value=Foo)
    println(ReadResult.EndOfFile) // EndOfFile
}
```

#### 如何启用 data object

要在代码中使用 data object 声明，请启用 `-language-version 1.9` 编译器选项。在 Gradle 项目中，你可以通过在 `build.gradle(.kts)` 中添加以下内容来实现：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile>().configureEach {
    // ...
    kotlinOptions.languageVersion = "1.9"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
compileKotlin {
    // ...
    kotlinOptions.languageVersion = '1.9'
}
```
</tab>
</tabs>

在 [相应的 KEEP 文档](https://github.com/Kotlin/KEEP/pull/316) 中阅读有关 data object 的更多信息，并分享你对其实现的反馈。

### 新的构造器类型推断限制

Kotlin 1.7.20 对 [构造器类型推断的使用](using-builders-with-builder-inference.md) 施加了一些重大限制，这可能会影响你的代码。这些限制适用于包含构造器 lambda 函数的代码，在这种情况下，如果不分析 lambda 本身就无法推导出形参。该形参被用作实参。现在，编译器将始终对此类代码显示错误，并要求你显式指定类型。

这是一个破坏性变更，但我们的研究表明，这些情况非常罕见，这些限制不应影响你的代码。如果确实受到影响，请参考以下情况：

* 带有隐藏成员的扩展函数的构造器推断。

  如果你的代码包含一个重名的扩展函数，且该函数在构造器推断期间会被使用，编译器将向你显示错误：

    ```kotlin
    class Data {
        fun doSmth() {} // 1
    }
    
    fun <T> T.doSmth() {} // 2
    
    fun test() {
        buildList {
            this.add(Data())
            this.get(0).doSmth() // 解析为 2 并导致错误
        }
    }
    ```
    {validate="false"} 
  
  要修复代码，你应该显式指定类型：

    ```kotlin
    class Data {
        fun doSmth() {} // 1
    }
    
    fun <T> T.doSmth() {} // 2
    
    fun test() {
        buildList<Data> { // 类型参数！
            this.add(Data())
            this.get(0).doSmth() // 解析为 1
        }
    }
    ```

* 具有多个 lambda 且未显式指定类型参数的构造器推断。

  如果构造器推断中存在两个或多个 lambda 块，它们会影响类型。为了防止错误，编译器要求你指定类型：

    ```kotlin
    fun <T: Any> buildList(
        first: MutableList<T>.() -> Unit, 
        second: MutableList<T>.() -> Unit
    ): `List<T>` {
        val list = mutableListOf<T>()
        list.first()
        list.second()
        return list 
    }
    
    fun main() {
        buildList(
            first = { // this: MutableList<String>
                add("")
            },
            second = { // this: MutableList<Int> 
                val i: Int = get(0)
                println(i)
            }
        )
    }
    ```
    {validate="false"}

  要修复错误，你应该显式指定类型并修复类型不匹配：

    ```kotlin
    fun main() {
        buildList<Int>(
            first = { // this: MutableList<Int>
                add(0)
            },
            second = { // this: MutableList<Int>
                val i: Int = get(0)
                println(i)
            }
        )
    }
    ```

如果你没有发现上述提到的情况，请向我们的团队 [提交问题](https://kotl.in/issue)。

有关此构造器推断更新的更多信息，请参阅此 [YouTrack 问题](https://youtrack.jetbrains.com/issue/KT-53797)。

## Kotlin/JVM

Kotlin 1.7.20 引入了泛型内联类，为委托属性添加了更多字节码优化，并支持在 kapt 存根生成任务中使用 IR，从而使得在 kapt 中使用所有最新的 Kotlin 功能成为可能：

* [泛型内联类](#generic-inline-classes)
* [更多委托属性的优化案例](#more-optimized-cases-of-delegated-properties)
* [在 kapt 存根生成任务中支持 JVM IR 后端](#support-for-the-jvm-ir-backend-in-kapt-stub-generating-task)

### 泛型内联类

> 泛型内联类是一项 [实验性](components-stability.md#stability-levels-explained) 功能。
> 它可能随时被删除或更改。需要显式开启（见下文详情），并且你应仅出于评估目的使用它。
> 我们非常感谢你在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-52994) 上提供的反馈。
>
{style="warning"}

Kotlin 1.7.20 允许 JVM 内联类的底层类型作为类型形参。编译器会将其映射到 `Any?`，或者通常映射到该类型形参的上限。

<video src="https://www.youtube.com/v/0JRPA0tt9og" title="Kotlin 1.7.20 中的泛型内联类"/>

参考以下示例：

```kotlin
@JvmInline
value class UserId<T>(val value: T)

fun compute(s: UserId<String>) {} // 编译器生成 fun compute-<hashcode>(s: Any?)
```

该函数接受内联类作为参数。该形参被映射到上限，而不是类型实参。

要启用此功能，请使用 `-language-version 1.8` 编译器选项。

我们非常感谢你在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-52994) 上对该功能的反馈。

### 更多委托属性的优化案例

在 Kotlin 1.6.0 中，我们通过省略 `$delegate` 字段并 [生成对所引用属性的直接访问](whatsnew16.md#optimize-delegated-properties-which-call-get-set-on-the-given-kproperty-instance) 来优化了委托给属性的情况。在 1.7.20 中，我们为更多情况实现了这一优化。如果委托是以下情况，现在将省略 `$delegate` 字段：

* 命名对象：

  ```kotlin
  object NamedObject {
      operator fun getValue(thisRef: Any?, property: KProperty<*>): String = ...
  }
  
  val s: String by NamedObject
  ```
  {validate="false"}

* 在同一模块中具有 [支持字段](properties.md#backing-fields) 和默认 getter 的 final `val` 属性：

  ```kotlin
  val impl: ReadOnlyProperty<Any?, String> = ...
  
  class A {
      val s: String by impl
  }
  ```
  {validate="false"}

* 常量表达式、枚举条目、`this` 或 `null`。以下是 `this` 的示例：

  ```kotlin
  class A {
      operator fun getValue(thisRef: Any?, property: KProperty<*>) ...
   
      val s by this
  }
  ```
  {validate="false"}

详细了解 [委托属性](delegated-properties.md)。

我们非常感谢你在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-23397) 上对该功能的反馈。

### 在 kapt 存根生成任务中支持 JVM IR 后端

> 在 kapt 存根生成任务中支持 JVM IR 后端是一项 [实验性](components-stability.md) 功能。
> 它可能随时被更改。需要显式开启（见下文详情），并且你应仅出于评估目的使用它。
>
{style="warning"}

在 1.7.20 之前，kapt 存根生成任务使用旧的后端，并且 [可重复注解](annotations.md#repeatable-annotations) 无法与 [kapt](kapt.md) 配合使用。在 Kotlin 1.7.20 中，我们在 kapt 存根生成任务中添加了对 [JVM IR 后端](whatsnew15.md#stable-jvm-ir-backend) 的支持。这使得在 kapt 中使用所有最新的 Kotlin 功能（包括可重复注解）成为可能。

要在 kapt 中使用 IR 后端，请将以下选项添加到你的 `gradle.properties` 文件中：

```none
kapt.use.jvm.ir=true
```

我们非常感谢你在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-49682) 上对该功能的反馈。

## Kotlin/Native

Kotlin 1.7.20 默认启用了新的 Kotlin/Native 内存管理器，并提供了自定义 `Info.plist` 文件的选项：

* [全新的默认内存管理器](#the-new-kotlin-native-memory-manager-enabled-by-default)
* [自定义 Info.plist 文件](#customizing-the-info-plist-file)

### 全新的 Kotlin/Native 内存管理器默认启用

此版本为新的内存管理器带来了进一步的稳定性和性能改进，使我们能够将新的内存管理器提升至 [Beta](components-stability.md) 阶段。

之前的内存管理器使得编写并发和异步代码变得复杂，包括实现 `kotlinx.coroutines` 库时遇到的问题。这阻碍了 Kotlin Multiplatform Mobile 的采用，因为并发限制导致了在 iOS 和 Android 平台之间共享 Kotlin 代码的问题。新的内存管理器终于为 [将 Kotlin Multiplatform Mobile 提升至 Beta 阶段](https://blog.jetbrains.com/kotlin/2022/05/kotlin-multiplatform-mobile-beta-roadmap-update/) 扫清了障碍。

新的内存管理器还支持编译器缓存，这使得编译时间与之前的版本相当。有关新内存管理器优势的更多信息，请参阅我们最初关于预览版的 [博客文章](https://blog.jetbrains.com/kotlin/2021/08/try-the-new-kotlin-native-memory-manager-development-preview/)。你可以在 [文档](native-memory-manager.md) 中找到更多技术细节。

#### 配置与设置

从 Kotlin 1.7.20 开始，新的内存管理器已成为默认设置。不需要太多的额外设置。

如果你已经手动开启了它，你可以从 `gradle.properties` 中删除 `kotlin.native.binary.memoryModel=experimental` 选项，或者从 `build.gradle(.kts)` 文件中删除 `binaryOptions["memoryModel"] = "experimental"`。

如有必要，你可以通过在 `gradle.properties` 中使用 `kotlin.native.binary.memoryModel=strict` 选项切换回旧版内存管理器。然而，旧版内存管理器不再支持编译器缓存，因此编译时间可能会变长。

#### 冻结

在新的内存管理器中，冻结（freezing）已被弃用。除非你需要代码在旧版管理器中运行（在那里冻结仍然是必需的），否则请不要使用它。这对于需要维护对旧版内存管理器支持的库作者，或者在遇到新内存管理器问题时希望有回退方案的开发者可能会有帮助。

在这种情况下，你可以暂时让代码同时支持新旧两种内存管理器。要忽略弃用警告，请执行以下操作之一：

* 使用 `@OptIn(FreezingIsDeprecated::class)` 注解已弃用 API 的使用点。
* 在 Gradle 中对所有 Kotlin 源集应用 `languageSettings.optIn("kotlin.native.FreezingIsDeprecated")`。
* 传递编译器标志 `-opt-in=kotlin.native.FreezingIsDeprecated`。

#### 从 Swift/Objective-C 调用 Kotlin 挂起函数

新的内存管理器仍然限制从非主线程的 Swift 和 Objective-C 调用 Kotlin `suspend` 函数，但你可以通过新的 Gradle 选项解除此限制。

此限制最初是在旧版内存管理器中引入的，原因是某些情况下代码会将延续（continuation）分派到原始线程恢复运行。如果该线程没有受支持的事件循环，则任务永远不会运行，协程也永远不会恢复。

在某些情况下，此限制不再是必需的，但检查所有必要条件的实现并不容易。因此，我们决定在新的内存管理器中保留它，同时引入一个选项供你禁用它。为此，请将以下选项添加到你的 `gradle.properties`：

```none
kotlin.native.binary.objcExportSuspendFunctionLaunchThreadRestriction=none
```

> 如果你使用 `kotlinx.coroutines` 的 `native-mt` 版本或其他具有相同“分派到原始线程”方法的库，请勿添加此选项。
>
{style="warning"}

Kotlin 团队非常感谢 [Ahmed El-Helw](https://github.com/ahmedre) 实现此选项。

#### 留下你的反馈

这是我们生态系统的一个重大变化。我们非常感谢你的反馈，以帮助我们做得更好。

在你的项目中尝试新的内存管理器，并 [在我们的问题跟踪器 YouTrack 中分享反馈](https://youtrack.jetbrains.com/issue/KT-48525)。

### 自定义 Info.plist 文件

在生成框架时，Kotlin/Native 编译器会生成信息属性列表文件 `Info.plist`。以前，自定义其内容非常麻烦。在 Kotlin 1.7.20 中，你可以直接设置以下属性：

| 属性                             | 二进制选项                      |
|--------------------------------|----------------------------|
| `CFBundleIdentifier`           | `bundleId`                 |
| `CFBundleShortVersionString`   | `bundleShortVersionString` |
| `CFBundleVersion`              | `bundleVersion`            |

为此，请使用相应的二进制选项。传递 `-Xbinary=$option=$value` 编译器标志，或者为必要的框架设置 `binaryOption(option, value)` Gradle DSL。

Kotlin 团队非常感谢 Mads Ager 实现此功能。

## Kotlin/JS

Kotlin/JS 获得了一些增强功能，提升了开发者体验并提高了性能：

* 得益于依赖项加载效率的提高，Klib 的生成在增量构建和全新构建中都变得更快。
* [开发二进制文件的增量编译](js-ir-compiler.md#incremental-compilation-for-development-binaries) 已经过重新设计，从而在全新构建场景中获得了重大改进，增量构建速度更快，并修复了稳定性问题。
* 我们改进了针对嵌套对象、密封类以及构造函数中带有默认值的形参的 `.d.ts` 生成。

## Gradle

Kotlin Gradle 插件的更新重点在于与新的 Gradle 功能和最新的 Gradle 版本保持兼容。

Kotlin 1.7.20 包含了支持 Gradle 7.1 的变更。已弃用的方法和属性已被移除或替换，减少了 Kotlin Gradle 插件产生的弃用警告数量，并为未来支持 Gradle 8.0 扫清了障碍。

然而，仍有一些潜在的破坏性变更可能需要你的注意：

### 目标配置

* `org.jetbrains.kotlin.gradle.dsl.SingleTargetExtension` 现在具有泛型参数 `SingleTargetExtension<T : KotlinTarget>`。
* `kotlin.targets.fromPreset()` 约定已弃用。作为替代，你仍然可以使用 `kotlin.targets { fromPreset() }`，但我们建议 [显式设置目标](https://kotlinlang.org/docs/multiplatform/multiplatform-discover-project.html#targets)。
* Gradle 自动生成的目标访问器在 `kotlin.targets { }` 块内不再可用。请改用 `findByName("targetName")` 方法。

  请注意，此类访问器在 `kotlin.targets` 的情况下仍然可用，例如 `kotlin.targets.linuxX64`。

### 源目录配置

Kotlin Gradle 插件现在将 Kotlin `SourceDirectorySet` 作为 `kotlin` 扩展添加到 Java 的 `SourceSet` 组中。这使得在 `build.gradle.kts` 文件中配置源目录成为可能，其方式类似于 [Java、Groovy 和 Scala](https://docs.gradle.org/7.1/release-notes.html#easier-source-set-configuration-in-kotlin-dsl) 中的配置方式：

```kotlin
sourceSets {
    main {
        kotlin {
            java.setSrcDirs(listOf("src/java"))
            kotlin.setSrcDirs(listOf("src/kotlin"))
        }
    }
}
```

你不再需要使用已弃用的 Gradle 约定来指定 Kotlin 的源目录。

请记住，你也可以使用 `kotlin` 扩展来访问 `KotlinSourceSet`：

```kotlin
kotlin {
    sourceSets {
        main {
        // ...
        }
    }
}
```

### JVM 工具链配置的新方法

此版本提供了一个新的 `jvmToolchain()` 方法，用于启用 [JVM 工具链功能](gradle-configure-project.md#gradle-java-toolchains-support)。如果你不需要任何额外的 [配置字段](https://docs.gradle.org/current/javadoc/org/gradle/jvm/toolchain/JavaToolchainSpec.html)（如 `implementation` 或 `vendor`），你可以使用 Kotlin 扩展中的此方法：

```kotlin
kotlin {
    jvmToolchain(17)
}
```

这简化了 Kotlin 项目的设置过程，无需任何额外配置。在此版本之前，你只能通过以下方式指定 JDK 版本：

```kotlin
kotlin {
    jvmToolchain {
        languageVersion.set(JavaLanguageVersion.of(17))
    }
}
```

## 标准库

Kotlin 1.7.20 为 `java.nio.file.Path` 类提供了新的 [扩展函数](extensions.md#extension-functions)，允许你遍历文件树：

* `walk()` 惰性地遍历以指定路径为根的文件树。
* `fileVisitor()` 使得可以单独创建一个 `FileVisitor`。`FileVisitor` 定义了在遍历目录和文件时的操作。
* `visitFileTree(fileVisitor: FileVisitor, ...)` 接收一个现成的 `FileVisitor`，并在底层使用 `java.nio.file.Files.walkFileTree()`。
* `visitFileTree(..., builderAction: FileVisitorBuilder.() -> Unit)` 通过 `builderAction` 创建一个 `FileVisitor` 并调用 `visitFileTree(fileVisitor, ...)` 函数。
* `FileVisitResult`（`FileVisitor` 的返回值类型）具有默认值 `CONTINUE`，表示继续处理文件。

> `java.nio.file.Path` 的这些新扩展函数处于 [实验性](components-stability.md) 阶段。
> 它们可能随时被更改。需要显式开启（见下文详情），并且你应仅出于评估目的使用它们。
>
{style="warning"}

以下是你可以使用这些新扩展函数完成的一些操作：

* 显式创建一个 `FileVisitor` 然后使用：

  ```kotlin
  val cleanVisitor = fileVisitor {
      onPreVisitDirectory { directory, attributes ->
          // 访问目录时的某些逻辑
          FileVisitResult.CONTINUE
      }
  
      onVisitFile { file, attributes ->
          // 访问文件时的某些逻辑
          FileVisitResult.CONTINUE
      }
  }
  
  // 此处可以有一些逻辑
  
  projectDirectory.visitFileTree(cleanVisitor)
  ```

* 使用 `builderAction` 创建一个 `FileVisitor` 并立即使用它：

  ```kotlin
  projectDirectory.visitFileTree {
  // builderAction 的定义：
      onPreVisitDirectory { directory, attributes ->
          // 访问目录时的某些逻辑
          FileVisitResult.CONTINUE
      }
  
      onVisitFile { file, attributes ->
          // 访问文件时的某些逻辑
          FileVisitResult.CONTINUE
      }
  }
  ```

* 使用 `walk()` 函数遍历以指定路径为根的文件树：

  ```kotlin
  @OptIn(kotlin.io.path.ExperimentalPathApi::class)
  fun traverseFileTree() {
      val cleanVisitor = fileVisitor {
          onPreVisitDirectory { directory, _ ->
              if (directory.name == "build") {
                  directory.toFile().deleteRecursively()
                  FileVisitResult.SKIP_SUBTREE
              } else {
                  FileVisitResult.CONTINUE
              }
          }
  
          onVisitFile { file, _ ->
              if (file.extension == "class") {
                  file.deleteExisting()
              }
              FileVisitResult.CONTINUE
          }
      }
  
      val rootDirectory = createTempDirectory("Project")
  
      rootDirectory.resolve("src").let { srcDirectory ->
          srcDirectory.createDirectory()
          srcDirectory.resolve("A.kt").createFile()
          srcDirectory.resolve("A.class").createFile()
      }
  
      rootDirectory.resolve("build").let { buildDirectory ->
          buildDirectory.createDirectory()
          buildDirectory.resolve("Project.jar").createFile()
      }
  
   
  // 使用 walk 函数：
      val directoryStructure = rootDirectory.walk(PathWalkOption.INCLUDE_DIRECTORIES)
          .map { it.relativeTo(rootDirectory).toString() }
          .toList().sorted()
      assertPrints(directoryStructure, "[, build, build/Project.jar, src, src/A.class, src/A.kt]")
  
      rootDirectory.visitFileTree(cleanVisitor)
  
      val directoryStructureAfterClean = rootDirectory.walk(PathWalkOption.INCLUDE_DIRECTORIES)
          .map { it.relativeTo(rootDirectory).toString() }
          .toList().sorted()
      assertPrints(directoryStructureAfterClean, "[, src, src/A.kt]")
  //sampleEnd
  }
  ```

与实验性 API 的常规做法一样，这些新扩展需要显式开启：`@OptIn(kotlin.io.path.ExperimentalPathApi::class)` 或 `@kotlin.io.path.ExperimentalPathApi`。或者，你可以使用编译器选项：`-opt-in=kotlin.io.path.ExperimentalPathApi`。

我们非常感谢你在 YouTrack 上对 [`walk()` 函数](https://youtrack.jetbrains.com/issue/KT-52909) 和 [遍历扩展函数](https://youtrack.jetbrains.com/issue/KT-52910) 提供的反馈。

## 文档更新

自上一个版本以来，Kotlin 文档进行了一些显著的更改：

### 翻新和改进的页面

* [基本类型概览](types-overview.md) – 了解 Kotlin 中使用的基本类型：数字、布尔值、字符、字符串、数组和无符号整数。
* [用于 Kotlin 开发的 IDE](kotlin-ide.md) – 查看官方支持 Kotlin 的 IDE 列表，以及拥有社区支持插件的工具。

### Kotlin Multiplatform 期刊中的新文章

* [原生与跨平台应用开发：如何选择？](https://kotlinlang.org/docs/multiplatform/native-and-cross-platform.html) – 查看我们对跨平台应用开发和原生方法的概览及优势分析。
* [六个最佳跨平台应用开发框架](https://kotlinlang.org/docs/multiplatform/cross-platform-frameworks.html) – 了解关键方面，帮助你为跨平台项目选择合适的框架。

### 新增和更新的教程

* [Kotlin Multiplatform 入门](https://kotlinlang.org/docs/multiplatform/multiplatform-create-first-app.html) – 了解使用 Kotlin 进行跨平台移动开发，并创建一个同时适用于 Android 和 iOS 的应用。
* [使用 React 和 Kotlin/JS 构建 Web 应用程序](js-react.md) – 创建一个浏览器应用，探索 Kotlin 的 DSL 以及典型 React 程序的特性。

### 发布文档中的变更

我们不再为每个版本提供推荐的 kotlinx 库列表。该列表仅包含了推荐并经过 Kotlin 本身测试的版本。它没有考虑到某些库之间存在相互依赖关系，并且需要特定的 kotlinx 版本，这可能与推荐的 Kotlin 版本不同。

我们正在努力寻找一种方法，提供有关库如何相互关联和依赖的信息，以便在你升级项目中的 Kotlin 版本时，能够清楚应该使用哪个 kotlinx 库版本。

## 安装 Kotlin 1.7.20

[IntelliJ IDEA](https://www.jetbrains.com/idea/download/) 2021.3、2022.1 和 2022.2 会自动建议将 Kotlin 插件更新到 1.7.20。

> 对于 Android Studio Dolphin (213)、Electric Eel (221) 和 Flamingo (222)，Kotlin 插件 1.7.20 将随即将推出的 Android Studio 更新一同交付。
>
{style="note"}

新的命令行编译器可在 [GitHub 发布页面](https://github.com/JetBrains/kotlin/releases/tag/v1.7.20) 上下载。

### Kotlin 1.7.20 兼容性指南

尽管 Kotlin 1.7.20 是一个增量版本，但为了限制 Kotlin 1.7.0 中引入的问题的蔓延，我们仍然不得不做出一些不兼容的变更。

在 [Kotlin 1.7.20 兼容性指南](compatibility-guide-1720.md) 中可以找到此类变更的详细列表。