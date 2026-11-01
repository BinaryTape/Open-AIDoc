[//]: # (title: Kotlin 1.9.0 的最新变化)

<web-summary>阅读 Kotlin 1.9.0 发行说明，涵盖新语言功能、Kotlin Multiplatform、JVM、Native、JS 和 Wasm 的更新，以及 Gradle 和 Maven 的构建工具支持。</web-summary>

_[发布日期：2023 年 7 月 6 日](releases.md#release-history)_

Kotlin 1.9.0 现已发布，适用于 JVM 的 K2 编译器目前处于 **Beta** 阶段。此外，还有以下主要亮点：

* [全新的 Kotlin K2 编译器更新](#new-kotlin-k2-compiler-updates)
* [枚举类 values 函数的稳定替代方案](#stable-replacement-of-the-enum-class-values-function)
* [用于开区间范围的稳定 `..<` 运算符](#stable-operator-for-open-ended-ranges)
* [用于按名称获取正则表达式捕获组的新通用函数](#new-common-function-to-get-regex-capture-group-by-name)
* [用于创建父目录的新路径实用工具](#new-path-utility-to-create-parent-directories)
* [Kotlin Multiplatform 中 Gradle 配置缓存的预览版](#preview-of-the-gradle-configuration-cache)
* [Kotlin Multiplatform 中 Android 目标支持的变更](#changes-to-android-target-support)
* [Kotlin/Native 中自定义内存分配器的预览版](#preview-of-custom-memory-allocator)
* [Kotlin/Native 中的库链接](#library-linkage-in-kotlin-native)
* [Kotlin/Wasm 中与体积相关的优化](#size-related-optimizations)

你也可以在以下视频中查看这些更新的简要概述：

<video src="https://www.youtube.com/v/fvwTZc-dxsM" title="Kotlin 1.9.0 的最新变化"/>

> 有关 Kotlin 发布周期的信息，请参阅 [Kotlin 发布流程](releases.md)。
>
{style="tip"}

## IDE 支持 {id="ide-support"}

支持 1.9.0 的 Kotlin 插件适用于：

| IDE | 支持的版本 |
|--|--|
| IntelliJ IDEA | 2022.3.x、2023.1.x |
| Android Studio | Giraffe (223)、Hedgehog (231)* |

*Kotlin 1.9.0 插件将包含在即将发布的 Android Studio Giraffe (223) 和 Hedgehog (231) 版本中。

Kotlin 1.9.0 插件将包含在即将发布的 IntelliJ IDEA 2023.2 版本中。

> 要下载 Kotlin 构建工件和依赖项，请[配置你的 Gradle 设置](#configure-gradle-settings)以使用 Maven Central 仓库。
>
{style="warning"}

## 全新的 Kotlin K2 编译器更新 {id="new-kotlin-k2-compiler-updates"}

JetBrains 的 Kotlin 团队持续推进 K2 编译器的稳定性工作，1.9.0 版本带来了进一步的发展。
面向 JVM 的 K2 编译器现已进入 **Beta** 阶段。

现在还提供了对 Kotlin/Native 和多平台项目的基础支持。

### kapt 编译器插件与 K2 编译器的兼容性 {id="compatibility-of-the-kapt-compiler-plugin-with-the-k2-compiler"}

你可以在项目中与 K2 编译器一起使用 [kapt 插件](kapt.md)，但存在一些限制。
即使将 `languageVersion` 设置为 `2.0`，kapt 编译器插件仍会使用旧编译器。

如果你在 `languageVersion` 设置为 `2.0` 的项目中执行 kapt 编译器插件，kapt 将自动
切换至 `1.9` 并禁用特定的版本兼容性检查。该行为等同于包含以下命令行实参：
* `-Xskip-metadata-version-check`
* `-Xskip-prerelease-check`
* `-Xallow-unstable-dependencies`

这些检查仅针对 kapt 任务禁用。所有其他编译任务将继续使用新的 K2 编译器。

如果在将 kapt 与 K2 编译器配合使用时遇到任何问题，请向我们的[问题跟踪器](http://kotl.in/issue)报告。

### 在你的项目中试用 K2 编译器 {id="try-the-k2-compiler-in-your-project"}

从 1.9.0 开始直到 Kotlin 2.0 发布，你可以通过在 `gradle.properties` 文件中添加 `kotlin.experimental.tryK2=true`
Gradle 属性来轻松测试 K2 编译器。你也可以运行以下命令：

```shell
./gradlew assemble -Pkotlin.experimental.tryK2=true
```

此 Gradle 属性会自动将语言版本设置为 2.0，并在构建报告中更新使用 K2 编译器编译的 Kotlin
任务数（与当前编译器对比）：

```none
##### 'kotlin.experimental.tryK2' results (Kotlin/Native not checked) #####
:lib:compileKotlin: 2.0 language version
:app:compileKotlin: 2.0 language version
##### 100% (2/2) tasks have been compiled with Kotlin 2.0 #####
```

### Gradle 构建报告 {id="gradle-build-reports"}

[Gradle 构建报告](gradle-compilation-and-caches.md#build-reports)现在会显示用于编译代码的是当前编译器还是 K2 编译器。
在 Kotlin 1.9.0 中，你可以在 [Gradle build scans](https://scans.gradle.com/) 中看到此信息：

![Gradle build scan - K1](gradle-build-scan-k1.png){width=700}

![Gradle build scan - K2](gradle-build-scan-k2.png){width=700}

你还可以在构建报告中直接找到项目中使用的 Kotlin 版本：

```none
Task info:
  Kotlin language version: 1.9
```

> 如果使用 Gradle 8.0，你可能会遇到构建报告的一些问题，尤其是在启用了 Gradle 配置缓存的情况下。
> 这是一个已知问题，已在 Gradle 8.1 及更高版本中修复。
>
{style="note"}

### 当前 K2 编译器的局限性 {id="current-k2-compiler-limitations"}

在你的 Gradle 项目中启用 K2 会带来某些局限性，在以下情况下可能会影响使用 8.3 以下 Gradle 版本的项目：

* 编译来自 `buildSrc` 的源代码。
* 在包含的构建（included builds）中编译 Gradle 插件。
* 如果在低于 8.3 版本的 Gradle 项目中使用其他 Gradle 插件，编译这些插件。
* 构建 Gradle 插件依赖项。

如果遇到上述任何问题，可以采取以下步骤进行解决：

* 为 `buildSrc`、所有 Gradle 插件及其依赖项设置语言版本：

```kotlin
kotlin {
    compilerOptions {
        languageVersion.set(org.jetbrains.kotlin.gradle.dsl.KotlinVersion.KOTLIN_1_9)
        apiVersion.set(org.jetbrains.kotlin.gradle.dsl.KotlinVersion.KOTLIN_1_9)
    }
}
```

* 当 Gradle 8.3 发布后，将项目中的 Gradle 版本更新至 8.3。

### 留下你对新 K2 编译器的反馈 {id="leave-your-feedback-on-the-new-k2-compiler"}

我们非常感谢你能提供任何反馈！

* 直接在 Kotlin 的 Slack 中向 K2 开发者提供反馈——[获取邀请](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)
  并加入 [#k2-early-adopters](https://kotlinlang.slack.com/archives/C03PK0PE257) 频道。
* 在[我们的问题跟踪器](https://kotl.in/issue)中报告你在使用新 K2 编译器时遇到的任何问题。
* [启用 **发送使用情况统计信息** 选项](https://www.jetbrains.com/help/idea/settings-usage-statistics.html)，
  允许 JetBrains 收集有关 K2 使用情况的匿名数据。

## 语言 {id="language"}

在 Kotlin 1.9.0 中，我们对之前引入的一些新语言功能进行了稳定：
* [枚举类 values 函数的替代方案](#stable-replacement-of-the-enum-class-values-function)
* [与数据类对称的数据对象（Data Object）](#stable-data-objects-for-symmetry-with-data-classes)
* [支持在内联值类中包含带函数体的次构造函数](#support-for-secondary-constructors-with-bodies-in-inline-value-classes)

### 枚举类 values 函数的稳定替代方案 {id="stable-replacement-of-the-enum-class-values-function"}

在 1.8.20 中，枚举类的 `entries` 属性作为实验性功能引入。`entries` 属性是
合成函数 `values()` 的现代且高性能的替代方案。在 1.9.0 中，`entries` 属性已变为稳定版（Stable）。

> `values()` 函数仍受支持，但我们建议你改用 `entries`
> 属性。
>
{style="tip"}

```kotlin
enum class Color(val colorName: String, val rgb: String) {
    RED("Red", "#FF0000"),
    ORANGE("Orange", "#FF7F00"),
    YELLOW("Yellow", "#FFFF00")
}

fun findByRgb(rgb: String): Color? = Color.entries.find { it.rgb == rgb }
```
{validate="false"}

有关枚举类 `entries` 属性的更多信息，请参阅 [Kotlin 1.8.20 的最新变化](whatsnew1820.md#a-modern-and-performant-replacement-of-the-enum-class-values-function)。

### 与数据类对称的稳定数据对象 {id="stable-data-objects-for-symmetry-with-data-classes"}

在 [Kotlin 1.8.20](whatsnew1820.md#preview-of-data-objects-for-symmetry-with-data-classes) 中引入的数据对象声明，
现已稳定。这包括为与数据类保持对称而添加的函数：`toString()`、`equals()` 和 `hashCode()`。

该功能在 `sealed` 层次结构（例如 `sealed class` 或 `sealed interface` 层次结构）中特别有用，
因为 `data object` 声明可以与 `data class` 声明便利地配合使用。在这个例子中，将
`EndOfFile` 声明为 `data object` 而不是普通 `object`，意味着它自动具有 `toString()` 函数，而无需
手动重写。这样就与伴随的数据类定义保持了对称性。

```kotlin
sealed interface ReadResult
data class Number(val number: Int) : ReadResult
data class Text(val text: String) : ReadResult
data object EndOfFile : ReadResult

fun main() {
    println(Number(7)) // Number(number=7)
    println(EndOfFile) // EndOfFile
}
```
{validate="false"}

更多信息请参阅 [Kotlin 1.8.20 的最新变化](whatsnew1820.md#preview-of-data-objects-for-symmetry-with-data-classes)。

### 支持在内联值类中包含带函数体的次构造函数 {id="support-for-secondary-constructors-with-bodies-in-inline-value-classes"}

从 Kotlin 1.9.0 开始，在[内联值类](inline-classes.md)中使用带函数体的次构造函数
默认可用：

```kotlin
@JvmInline
value class Person(private val fullName: String) {
    // 自 Kotlin 1.4.30 起允许：
    init {
        check(fullName.isNotBlank()) {
            "Full name shouldn't be empty"
        }
    }
    // 自 Kotlin 1.9.0 起默认允许：
    constructor(name: String, lastName: String) : this("$name $lastName") {
        check(lastName.isNotBlank()) {
            "Last name shouldn't be empty"
        }
    }
}
```
{validate="false"}

此前，Kotlin 仅允许在内联类中使用公共主构造函数。因此，无法
封装底层值或创建表示某些受约束值的内联类。

随着 Kotlin 的发展，这些问题已得到解决。Kotlin 1.4.30 解除了对 `init` 块的限制，随后 Kotlin 1.8.20
带来了带函数体的次构造函数预览。它们现在默认可用。在[此 KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/inline-classes.md) 中了解有关 Kotlin 内联类发展的更多信息。

## Kotlin/JVM {id="kotlin-jvm"}

从 1.9.0 版本开始，编译器可以生成字节码版本对应于 JVM 20 的类。此外，
`JvmDefault` 注解和旧版 `-Xjvm-default` 模式的弃用流程仍在继续。

### 弃用 JvmDefault 注解和旧版 -Xjvm-default 模式 {id="deprecation-of-jvmdefault-annotation-and-legacy-xjvm-default-modes"}

从 Kotlin 1.5 开始，`JvmDefault` 注解已被弃用，取而代之的是较新的 `-Xjvm-default`
模式：`all` 和 `all-compatibility`。随着 Kotlin 1.4 中引入的 `JvmDefaultWithoutCompatibility` 和
Kotlin 1.6 中引入的 `JvmDefaultWithCompatibility`，这些模式提供了对 `DefaultImpls`
类生成的全面控制，确保了与旧版 Kotlin 代码的无缝兼容。

因此在 Kotlin 1.9.0 中，`JvmDefault` 注解不再具有任何意义，已被标记为
已弃用并会导致错误。它最终将从 Kotlin 中移除。

## Kotlin/Native {id="kotlin-native"}

除其他改进外，此版本还对 [Kotlin/Native 内存管理器](native-memory-manager.md)进行了进一步的优化，
增强了其稳健性与性能：

* [自定义内存分配器预览版](#preview-of-custom-memory-allocator)
* [主线程上的 Objective-C 或 Swift 对象释放钩子](#objective-c-or-swift-object-deallocation-hook-on-the-main-thread)
* [Kotlin/Native 中访问常量值时不进行对象初始化](#no-object-initialization-when-accessing-constant-values-in-kotlin-native)
* [能够为 iOS 模拟器测试配置独立模式](#ability-to-configure-standalone-mode-for-ios-simulator-tests-in-kotlin-native)
* [Kotlin/Native 中的库链接](#library-linkage-in-kotlin-native)

### 自定义内存分配器预览版 {id="preview-of-custom-memory-allocator"}

Kotlin 1.9.0 引入了自定义内存分配器的预览版。其分配系统提升了
[Kotlin/Native 内存管理器](native-memory-manager.md)的运行时性能。

当前 Kotlin/Native 中的对象分配系统使用的是通用分配器，该分配器不具备
高效垃圾回收的功能。为了弥补这一点，在垃圾回收器 (GC) 将它们合并为单个列表（可在清理期间进行遍历）之前，
它会为所有已分配的对象维护线程局部链表。这种方式带来了
若干性能弊端：

* 清理顺序缺乏内存局部性，通常会导致分散的内存访问模式，从而引发潜在的性能问题。
* 链表需要为每个对象消耗额外的内存，这增加了内存使用量，在处理大量小对象时尤为明显。
* 单个已分配对象列表使得难以并行化清理过程，当 mutator 线程分配对象的速度快于 GC 线程回收对象的速度时，可能会导致内存使用问题。

为解决这些问题，Kotlin 1.9.0 引入了自定义分配器的预览版。它将系统内存划分为页（pages），
允许按连续顺序独立清理。每次分配都会成为页面内的一个内存块，页面会
跟踪块大小。不同的页面类型针对各种分配大小进行了优化。内存块的连续排列
确保了对所有已分配块的高效遍历。

当线程分配内存时，它会根据分配大小寻找合适的页面。线程为不同的
大小类别维护一组页面。通常情况下，给定大小的当前页面即可满足分配需求。如果不满足，
线程会从共享分配空间中请求其他页面。该页面可能已经可用、需要
清理，或者应该先被创建。

新的分配器允许同时拥有多个独立的分配空间，这将使 Kotlin 团队
能够尝试不同的页面布局以进一步提升性能。

有关新分配器设计的更多信息，请参阅此 [README](https://github.com/JetBrains/kotlin/blob/master/kotlin-native/runtime/src/alloc/custom/README.md)。

#### 如何启用 {id="how-to-enable"}

添加 `-Xallocator=custom` 编译器选项：

```kotlin
kotlin {
    macosX64("native") {
        binaries.executable()

        compilations.configureEach {
            compilerOptions.configure {
                freeCompilerArgs.add("-Xallocator=custom")
            }
        }
    }
}
```
{validate="false"}

#### 留下反馈 {id="leave-feedback"}

我们非常期待收到你在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-55364/Implement-custom-allocator-for-Kotlin-Native)
中的反馈，以便改进自定义分配器。

### 主线程上的 Objective-C 或 Swift 对象释放钩子 {id="objective-c-or-swift-object-deallocation-hook-on-the-main-thread"}

从 Kotlin 1.9.0 开始，如果 Objective-C 或 Swift 对象是在主线程上被传递给 Kotlin 的，其释放钩子将在主线程上被调用。[Kotlin/Native 内存管理器](native-memory-manager.md)此前
处理 Objective-C 对象引用的方式可能会导致内存泄漏。我们认为新行为应当能够提升
内存管理器的稳健性。

考虑在 Kotlin 代码中引用的 Objective-C 对象，例如作为实参传递、由
函数返回或从集合中检索时。在这种情况下，Kotlin 会创建自己的对象来持有对该
Objective-C 对象的引用。当 Kotlin 对象被释放时，Kotlin/Native 运行时会调用 `objc_release` 函数
来释放该 Objective-C 引用。

此前，Kotlin/Native 内存管理器在一个专门的 GC 线程上运行 `objc_release`。如果这是该对象的最后一个引用，
该对象将被释放。当 Objective-C 对象具有自定义释放钩子（例如 Objective-C 中的 `dealloc`
方法或 Swift 中的 `deinit` 块），并且这些钩子预期在特定线程上被调用时，就可能会出现问题。

由于主线程上对象的钩子通常期望在主线程上调用，因此 Kotlin/Native 运行时现在
也会在主线程上调用 `objc_release`。它应当涵盖了 Objective-C 对象在主线程上被传递给
Kotlin 并在该线程上创建了 Kotlin 对等对象的情况。这仅在主分发队列（main dispatch queue）
被处理时有效，常规 UI 应用程序正是这种情况。如果不是主队列，或者该对象是在主线程之外的其他线程上被传递给
Kotlin 的，则像以前一样在专门的 GC 线程上调用 `objc_release`。

#### 如何选择退出 {id="how-to-opt-out"}

如果遇到问题，可以在 `gradle.properties` 文件中使用以下选项禁用此行为：

```none
kotlin.native.binary.objcDisposeOnMain=false
```

遇到此类情况请随时向[我们的问题跟踪器](https://kotl.in/issue)进行反馈。

### Kotlin/Native 中访问常量值时不进行对象初始化 {id="no-object-initialization-when-accessing-constant-values-in-kotlin-native"}

从 Kotlin 1.9.0 开始，Kotlin/Native 后端在访问 `const val` 字段时不会初始化对象：

```kotlin
object MyObject {
    init {
        println("side effect!")
    }

    const val y = 1
}

fun main() {
    println(MyObject.y) // 最初不进行初始化
    val x = MyObject    // 发生初始化
    println(x.y)
}
```
{validate="false"}

该行为现已与 Kotlin/JVM 统一，其实现与 Java 一致，在此类情况下绝不会
初始化对象。得益于这一改动，你的 Kotlin/Native 项目也可能会获得一些性能提升。

### 能够为 iOS 模拟器测试配置独立模式 {id="ability-to-configure-standalone-mode-for-ios-simulator-tests-in-kotlin-native"}

默认情况下，在运行 Kotlin/Native 的 iOS 模拟器测试时，会使用 `--standalone` 标志以避免手动启动和关闭模拟器。在 1.9.0 中，你现在可以通过 `standalone`
属性在 Gradle 任务中配置是否使用此标志。默认情况下，由于使用了 `--standalone` 标志，因此独立模式处于启用状态。

以下是在 `build.gradle.kts` 文件中禁用独立模式的示例：

```kotlin
tasks.withType<org.jetbrains.kotlin.gradle.targets.native.tasks.KotlinNativeSimulatorTest>().configureEach {
    standalone.set(false)
}
```
{validate="false"}

> 如果禁用独立模式，则必须手动启动模拟器。要从命令行启动模拟器，
> 可以使用以下命令：
>
> ```shell
> /usr/bin/xcrun simctl boot <DeviceId>
>```
>
{style="warning"}

### Kotlin/Native 中的库链接 {id="library-linkage-in-kotlin-native"}

从 Kotlin 1.9.0 开始，Kotlin/Native 编译器对待 Kotlin 库中的链接问题的方式与 Kotlin/JVM 相同。
如果一个第三方 Kotlin 库的作者在实验性 API 中进行了不兼容的更改，而另一个第三方 Kotlin 库使用了该 API，
你可能会遇到此类问题。

现在，在第三方 Kotlin 库之间出现链接问题时，构建过程不会在编译期间失败。相反，
你只会在运行时遇到这些错误，与 JVM 上的表现完全一致。

每当 Kotlin/Native 编译器检测到库链接问题时，都会报告警告。你可以在编译日志中找到此类警告，例如：

```text
No function found for symbol 'org.samples/MyRemovedClass.doSomething|3657632771909858561[0]'

Can not get instance of singleton 'MyEnumClass.REMOVED_ENTRY': No enum entry found for symbol 'org.samples/MyEnumClass.REMOVED_ENTRY|null[0]'

Function 'getMyRemovedClass' can not be called: Function uses unlinked class symbol 'org.samples/MyRemovedClass|null[0]'
```

你可以在项目中进一步配置甚至禁用此行为：

* 如果你不希望在编译日志中看到这些警告，可以使用 `-Xpartial-linkage-loglevel=INFO` 编译器选项将其抑制。
* 也可以使用 `-Xpartial-linkage-loglevel=ERROR` 将报告警告的严重级别提高到编译错误。在这种情况下，编译失败，你将在编译日志中看到所有错误。使用此选项可以更细致地检查链接问题。
* 如果在使用此功能时遇到非预期的问题，可以随时使用 `-Xpartial-linkage=disable` 编译器选项选择退出。遇到此类情况请随时向[我们的问题跟踪器](https://kotl.in/issue)报告。

```kotlin
// 通过 Gradle 构建文件传递编译器选项的示例。
kotlin {
    macosX64("native") {
        binaries.executable()

        compilations.configureEach {
            compilerOptions.configure {
                // 抑制链接警告：
                freeCompilerArgs.add("-Xpartial-linkage-loglevel=INFO")

                // 将链接警告提升为错误：
                freeCompilerArgs.add("-Xpartial-linkage-loglevel=ERROR")

                // 完全禁用该功能：
                freeCompilerArgs.add("-Xpartial-linkage=disable")
            }
        }
    }
}
```
{validate="false"}

### 用于 C 互操作隐式整数转换的编译器选项 {id="compiler-option-for-c-interop-implicit-integer-conversions"}

我们引入了一个用于 C 互操作的编译器选项，允许你使用隐式整数转换。经过深思熟虑后，
我们引入了此编译器选项以防止非预期的使用，因为该功能仍有改进空间，
而我们的目标是提供最高质量的 API。

在此代码示例中，隐式整数转换允许 `options = 0`，即使 [`options`](https://developer.apple.com/documentation/foundation/nscalendar/options)
是无符号类型 `UInt` 并且 `0` 是有符号的。

```kotlin
val today = NSDate()
val tomorrow = NSCalendar.currentCalendar.dateByAddingUnit(
    unit = NSCalendarUnitDay,
    value = 1,
    toDate = today,
    options = 0
)
```
{validate="false"}

要在原生互操作库中使用隐式转换，请使用 `-XXLanguage:+ImplicitSignedToUnsignedIntegerConversion`
编译器选项。

你可以在 Gradle `build.gradle.kts` 文件中进行如下配置：
```kotlin
tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinNativeCompile>().configureEach {
    compilerOptions.freeCompilerArgs.addAll(
        "-XXLanguage:+ImplicitSignedToUnsignedIntegerConversion"
    )
}
```
{validate="false"}

## Kotlin Multiplatform {id="kotlin-multiplatform"}

Kotlin Multiplatform 在 1.9.0 中获得了一些旨在改善开发者体验的重要更新：

* [Android 目标支持的变更](#changes-to-android-target-support)
* [默认启用的全新 Android 源集布局](#new-android-source-set-layout-enabled-by-default)
* [多平台项目中 Gradle 配置缓存的预览版](#preview-of-the-gradle-configuration-cache)

### Android 目标支持的变更 {id="changes-to-android-target-support"}

我们继续致力于稳定 Kotlin Multiplatform。其中至关重要的一步是为 Android 目标提供
一等支持。我们很高兴地宣布，未来来自 Google 的 Android 团队将提供
其专用的 Gradle 插件来支持 Kotlin Multiplatform 中的 Android。

为了给来自 Google 的这一新解决方案让路，我们在 1.9.0 中重命名了当前 Kotlin DSL 中的 `android` 块。
请在构建脚本中将所有出现的 `android` 块更改为 `androidTarget`。这是一项临时
变更，为即将推出的 Google DSL 释放出 `android` 名称是必需的。

Google 插件将成为在多平台项目中处理 Android 的推荐方式。待其就绪后，我们将
提供必要的迁移说明，以便你可以像以前一样使用简短的 `android` 名称。

### 默认启用的全新 Android 源集布局 {id="new-android-source-set-layout-enabled-by-default"}

从 Kotlin 1.9.0 开始，新的 Android 源集布局成为默认设置。它取代了以前容易引起多种混淆的目录命名方案。
新布局具有许多优势：

* 简化的类型语义——新的 Android 源布局提供了清晰且一致的命名约定，有助于区分不同类型的源集。
* 改进的源代码目录布局——采用新布局后，`SourceDirectories` 的排布更加连贯，从而更易于组织代码和定位源文件。
* 针对 Gradle 配置的清晰命名方案——该方案现在在 `KotlinSourceSets` 和 `AndroidSourceSets` 中更加一致且更可预测。

新布局需要 Android Gradle 插件 7.0 或更高版本，并在 Android Studio 2022.3 及更高版本中受支持。请参阅我们的
[迁移指南](https://kotlinlang.org/docs/multiplatform/multiplatform-android-layout.html)以在 `build.gradle(.kts)` 文件中进行必要的更改。

### Gradle 配置缓存预览版 {id="preview-of-the-gradle-configuration-cache"}

<p id="preview-of-gradle-configuration-cache">Kotlin 1.9.0 带来了对多平台库中 <a href="https://docs.gradle.org/current/userguide/configuration_cache.html">Gradle 配置缓存</a>的支持。如果你是库作者，现在就可以从提升的构建性能中获益。</p>

Gradle 配置缓存通过复用后续构建的配置阶段结果来加快构建过程。
该功能自 Gradle 8.1 起已变为稳定版（Stable）。要启用该功能，请按照 [Gradle 文档](https://docs.gradle.org/current/userguide/configuration_cache.html#config_cache:usage)中的说明进行操作。

> Kotlin Multiplatform 插件在与 Xcode 集成任务或 [Kotlin CocoaPods Gradle 插件](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-dsl-reference.html)配合使用时仍不支持 Gradle 配置缓存。我们希望在未来的 Kotlin 版本中添加此功能。
>
{style="note"}

## Kotlin/Wasm {id="kotlin-wasm"}

Kotlin 团队继续对新的 Kotlin/Wasm 目标进行实验。此版本引入了多项性能和
[与体积相关的优化](#size-related-optimizations)，以及 [JavaScript 互操作方面的更新](#updates-in-javascript-interop)。

### 与体积相关的优化 {id="size-related-optimizations"}

Kotlin 1.9.0 为 WebAssembly (Wasm) 项目带来了显著的体积缩减。对比两个“Hello World”项目，
Kotlin 1.9.0 中面向 Wasm 的代码占用空间比 Kotlin 1.8.20 缩小了 10 倍以上。

![Kotlin/Wasm 与体积相关的优化](wasm-1-9-0-size-improvements.png){width=700}

当使用 Kotlin 代码以 Wasm 平台为目标时，这些体积优化带来了更高效的资源利用率和更好的性能。

### JavaScript 互操作更新 {id="updates-in-javascript-interop"}

此 Kotlin 更新对 Kotlin/Wasm 中 Kotlin 与 JavaScript 之间的互操作性进行了变更。由于 Kotlin/Wasm
是一项[实验性](components-stability.md#stability-levels-explained)功能，其互操作性适用某些限制。

#### 限制 Dynamic 类型 {id="restriction-of-dynamic-types"}

从 1.9.0 版本开始，Kotlin 不再支持在 Kotlin/Wasm 中使用 `Dynamic` 类型。现已弃用该类型，
推荐使用新的通用 `JsAny` 类型，该类型有助于 JavaScript 互操作。

有关更多详细信息，请参阅 [Kotlin/Wasm 与 JavaScript 互操作](wasm-js-interop.md)文档。

#### 限制非 external 类型 {id="restriction-of-non-external-types"}

当向 JavaScript 传递值或从 JavaScript 接收值时，Kotlin/Wasm 支持针对特定 Kotlin 静态类型的转换。这些受支持的
类型包括：

* 基本类型，如带符号数字、`Boolean` 和 `Char`。
* `String`。
* 函数类型。

其他类型在没有转换的情况下作为不透明引用传递，导致 JavaScript 和 Kotlin
子类型之间出现不一致。

为了解决这个问题，Kotlin 将 JavaScript 互操作限制为一组良好支持的类型。从 Kotlin 1.9.0 开始，Kotlin/Wasm JavaScript 互操作中仅支持 external、基本类型、字符串和函数类型。此外，还引入了一个名为
`JsReference` 的独立显式类型，用于表示可在 JavaScript 互操作中使用的 Kotlin/Wasm 对象句柄。

有关更多详细信息，请参阅 [Kotlin/Wasm 与 JavaScript 互操作](wasm-js-interop.md)文档。

### Kotlin Playground 中的 Kotlin/Wasm {id="kotlin-wasm-in-kotlin-playground"}

Kotlin Playground 支持 Kotlin/Wasm 目标。
你可以编写、运行并分享面向 Kotlin/Wasm 的 Kotlin 代码。[快来体验吧！](https://pl.kotl.in/HDFAvimga)

> 使用 Kotlin/Wasm 需要在浏览器中启用实验性功能。
>
> [详细了解如何启用这些功能](wasm-configuration.md)。
>
{style="note"}

```kotlin
import kotlin.time.*
import kotlin.time.measureTime

fun main() {
    println("Hello from Kotlin/Wasm!")
    computeAck(3, 10)
}

tailrec fun ack(m: Int, n: Int): Int = when {
    m == 0 -> n + 1
    n == 0 -> ack(m - 1, 1)
    else -> ack(m - 1, ack(m, n - 1))
}

fun computeAck(m: Int, n: Int) {
    var res = 0
    val t = measureTime {
        res = ack(m, n)
    }
    println()
    println("ack($m, $n) = ${res}")
    println("duration: ${t.inWholeNanoseconds / 1e6} ms")
}
```
{kotlin-runnable="true" id="kotlin-whats-new-1-9-0-kotlin-wasm-playground"}

## Kotlin/JS {id="kotlin-js"}

此版本引入了针对 Kotlin/JS 的更新，包括移除旧版 Kotlin/JS 编译器、弃用 Kotlin/JS Gradle 插件以及对 ES2015 的实验性支持：

* [移除旧版 Kotlin/JS 编译器](#removal-of-the-old-kotlin-js-compiler)
* [弃用 Kotlin/JS Gradle 插件](#deprecation-of-the-kotlin-js-gradle-plugin)
* [弃用 external enum](#deprecation-of-external-enum)
* [对 ES2015 类和模块的实验性支持](#experimental-support-for-es2015-classes-and-modules)
* [更改了 JS 生产分发的默认目标路径](#changed-default-destination-of-js-production-distribution)
* [从 stdlib-js 中提取 org.w3c 声明](#extract-org-w3c-declarations-from-stdlib-js)

> 从 1.9.0 版本开始，Kotlin/JS 也启用了[部分库链接](#library-linkage-in-kotlin-native)。
>
{style="note"}

### 移除旧版 Kotlin/JS 编译器 {id="removal-of-the-old-kotlin-js-compiler"}

在 Kotlin 1.8.0 中，我们[宣布](whatsnew18.md#stable-js-ir-compiler-backend)基于 IR 的后端已变为[稳定版](components-stability.md)。
从那时起，未指定编译器会导致错误，并且使用旧编译器会产生警告。

在 Kotlin 1.9.0 中，使用旧后端将导致错误。请迁移到 IR 编译器。

### 弃用 Kotlin/JS Gradle 插件 {id="deprecation-of-the-kotlin-js-gradle-plugin"}

从 Kotlin 1.9.0 开始，`kotlin-js` Gradle 插件已
弃用。我们建议你改用带有 `js()` 目标的 `kotlin-multiplatform` Gradle 插件。

Kotlin/JS Gradle 插件的功能本质上与 `kotlin-multiplatform` 插件重复，并且在底层共享相同的实现。
这种重叠造成了混淆，并增加了 Kotlin 团队的维护负担。

请参阅我们的 [Kotlin Multiplatform 兼容性指南](https://kotlinlang.org/docs/multiplatform/multiplatform-compatibility-guide.html#migration-from-kotlin-js-gradle-plugin-to-kotlin-multiplatform-gradle-plugin)
以获取迁移说明。如果发现指南中未涵盖的任何问题，请向我们的[问题跟踪器](http://kotl.in/issue)报告。

### 弃用 external enum {id="deprecation-of-external-enum"}

在 Kotlin 1.9.0 中，由于静态枚举成员（如 `entries`）无法在 Kotlin 外部存在的问题，external enum 的使用将被弃用。我们建议改用带有对象子类的 external sealed class：

```kotlin
// 之前
external enum class ExternalEnum { A, B }

// 之后
external sealed class ExternalEnum {
    object A: ExternalEnum
    object B: ExternalEnum
}
```
{validate="false"}

通过切换为带有对象子类的 external sealed class，你可以在避免与默认方法相关问题的同时，
实现与 external enum 类似的功能。

从 Kotlin 1.9.0 开始，external enum 的使用将被标记为已弃用。我们建议你更新代码
以使用建议的 external sealed class 实现，以确保兼容性和未来的可维护性。

### 对 ES2015 类和模块的实验性支持 {id="experimental-support-for-es2015-classes-and-modules"}

此版本引入了对 ES2015 模块和 ES2015 类生成的[实验性](components-stability.md#stability-levels-explained)支持：
* 模块提供了一种简化代码库并提高可维护性的方式。
* 类允许你融入面向对象编程 (OOP) 原则，从而编写出更清晰、更直观的代码。

要启用这些功能，请相应地更新你的 `build.gradle.kts` 文件：

```kotlin
// build.gradle.kts
kotlin {
    js(IR) {
        useEsModules() // 启用 ES2015 模块
        browser()
    }
}

// 启用 ES2015 类生成
tasks.withType<KotlinJsCompile>().configureEach {
    kotlinOptions {
        useEsClasses = true
    }
}
```
{validate="false"}

[在官方文档中详细了解 ES2015 (ECMAScript 2015, ES6)](https://262.ecma-international.org/6.0/)。

### 更改了 JS 生产分发的默认目标路径 {id="changed-default-destination-of-js-production-distribution"}

在 Kotlin 1.9.0 之前，分发目标目录为 `build/distributions`。然而，这是 Gradle 归档文件的常用目录。
为了解决这个问题，我们在 Kotlin 1.9.0 中将默认分发目标目录更改为：
`build/dist/<targetName>/<binaryName>`。

例如，`productionExecutable` 原本位于 `build/distributions`。在 Kotlin 1.9.0 中，它位于 `build/dist/js/productionExecutable`。

> 如果你已有使用这些构建结果的流水线，请确保更新该目录。
>
{style="warning"}

### 从 stdlib-js 中提取 org.w3c 声明 {id="extract-org-w3c-declarations-from-stdlib-js"}

从 Kotlin 1.9.0 开始，`stdlib-js` 不再包含 `org.w3c` 声明。相反，这些声明已
移至一个单独的 Gradle 依赖项中。当你将 Kotlin Multiplatform Gradle 插件添加到 `build.gradle.kts` 文件时，
这些声明将自动包含在你的项目中，类似于标准库。

无需任何手动操作或迁移。必要的调整将自动处理。

## Gradle {id="gradle"}

Kotlin 1.9.0 带来了新的 Gradle 编译器选项以及更多内容：

* [移除了 classpath 属性](#removed-classpath-property)
* [新增 Gradle 编译器选项](#new-compiler-options)
* [Kotlin/JVM 的项目级编译器选项](#project-level-compiler-options-for-kotlin-jvm)
* [用于 Kotlin/Native 模块名称的编译器选项](#compiler-option-for-kotlin-native-module-name)
* [针对 Kotlin 官方库的独立编译器插件](#separate-compiler-plugins-for-official-kotlin-libraries)
* [提升了最低支持版本](#incremented-minimum-supported-version)
* [kapt 不会导致及早创建任务](#kapt-doesn-t-cause-eager-task-creation-in-gradle)
* [JVM 目标验证模式的编程式配置](#programmatic-configuration-of-the-jvm-target-validation-mode)

### 移除了 classpath 属性 {id="removed-classpath-property"}

在 Kotlin 1.7.0 中，我们宣布开始对 `KotlinCompile` 任务的属性 `classpath` 进入弃用周期。
在 Kotlin 1.8.0 中，弃用级别提升为 `ERROR`。在此版本中，我们最终移除了 `classpath` 属性。
现在所有编译任务都应使用 `libraries` 输入来获取编译所需的库列表。

### 新增编译器选项 {id="new-compiler-options"}

Kotlin Gradle 插件现在为选择加入（opt-in）和编译器的渐进模式（progressive mode）提供了新属性。

* 要选择加入新 API，现在可以使用 `optIn` 属性并传递字符串列表，例如：`optIn.set(listOf(a, b, c))`。
* 要启用渐进模式，请使用 `progressiveMode.set(true)`。

### Kotlin/JVM 的项目级编译器选项 {id="project-level-compiler-options-for-kotlin-jvm"}

从 Kotlin 1.9.0 开始，`kotlin` 配置块内部提供了一个新的 `compilerOptions` 块：

```kotlin
kotlin {
    compilerOptions {
        jvmTarget.set(JVM.Target_11)
    }
}
```
{validate="false"}

这使得配置编译器选项变得更加容易。但是，请注意以下重要细节：

* 此配置仅在项目级别有效。
* 对于 Android 插件，该块配置的对象与以下内容相同：

```kotlin
android {
    kotlinOptions {}
}
```
{validate="false"}

* `android.kotlinOptions` 和 `kotlin.compilerOptions` 配置块会相互覆盖。构建文件中最后一个（最下方）的块始终生效。
* 如果在项目级别配置了 `moduleName`，其值在传递给编译器时可能会发生更改。对于 `main` 编译不会发生这种情况，但对于其他类型（例如测试源代码），Kotlin Gradle 插件将添加 `_test` 后缀。
* 在 `tasks.withType<KotlinJvmCompile>().configureEach {}`（或 `tasks.named<KotlinJvmCompile>("compileKotlin") { }`）内部的配置将同时覆盖 `kotlin.compilerOptions` 和 `android.kotlinOptions`。

### 用于 Kotlin/Native 模块名称的编译器选项 {id="compiler-option-for-kotlin-native-module-name"}

Kotlin/Native 的 [`module-name`](compiler-reference.md#module-name-name-native) 编译器选项现在可以在 Kotlin Gradle 插件中轻松使用。

该选项指定编译模块的名称，也可以用于为导出到 Objective-C 的声明添加名称前缀。

你现在可以直接在 Gradle 构建文件的 `compilerOptions` 块中设置模块名称：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
tasks.named<org.jetbrains.kotlin.gradle.tasks.KotlinNativeCompile>("compileKotlinLinuxX64") {
    compilerOptions {
        moduleName.set("my-module-name")
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
tasks.named("compileKotlinLinuxX64", org.jetbrains.kotlin.gradle.tasks.KotlinNativeCompile.class) {
    compilerOptions {
        moduleName = "my-module-name"
    }
}
```

</tab>
</tabs>

### 针对 Kotlin 官方库的独立编译器插件 {id="separate-compiler-plugins-for-official-kotlin-libraries"}

Kotlin 1.9.0 为其官方库引入了独立的编译器插件。此前，编译器插件是内嵌在
其对应的 Gradle 插件中的。如果编译器插件是针对高于 Gradle 构建中 Kotlin 运行时版本的 Kotlin 版本编译的，
这可能会导致兼容性问题。

现在编译器插件作为独立的依赖项添加，因此你将不再遇到旧版 Gradle
版本的兼容性问题。新方法的另一个主要优势是，新的编译器插件可以与其他构建系统（如 [Bazel](https://bazel.build/)）一起使用。

以下是我们现在向 Maven Central 发布的全新编译器插件列表：

* kotlin-atomicfu-compiler-plugin
* kotlin-allopen-compiler-plugin
* kotlin-lombok-compiler-plugin
* kotlin-noarg-compiler-plugin
* kotlin-sam-with-receiver-compiler-plugin
* kotlinx-serialization-compiler-plugin

每个插件都有其 `-embeddable` 对应版本，例如 `kotlin-allopen-compiler-plugin-embeddable` 专为
配合 `kotlin-compiler-embeddable` 工件使用而设计，这是脚本工件的默认选项。

Gradle 将这些插件作为编译器参数添加。你不需要对现有项目进行任何修改。

### 提升了最低支持版本 {id="incremented-minimum-supported-version"}

从 Kotlin 1.9.0 开始，支持的最低 Android Gradle 插件版本为 4.2.2。

请参阅我们文档中的 [Kotlin Gradle 插件与可用 Gradle 版本的兼容性](gradle-configure-project.md#apply-the-plugin)。

### kapt 在 Gradle 中不会导致及早创建任务 {id="kapt-doesn-t-cause-eager-task-creation-in-gradle"}

在 1.9.0 之前，[kapt 编译器插件](kapt.md)通过请求已配置的 Kotlin 编译任务实例而导致及早创建任务。
此行为已在 Kotlin 1.9.0 中修复。如果你在 `build.gradle.kts` 文件中使用默认配置，
则你的设置不会受此变更影响。

> 如果你使用自定义配置，你的设置将受到不利影响。
> 例如，如果你使用 Gradle 的 tasks API 修改了 `KotlinJvmCompile` 任务，则必须在构建脚本中同样修改 `KaptGenerateStubs`
> 任务。
>
> 例如，如果你的脚本对 `KotlinJvmCompile` 任务包含以下配置：
> ```kotlin
> tasks.named<KotlinJvmCompile>("compileKotlin") { // 你的自定义配置 }
> ```
> {validate="false"}
>
> 在这种情况下，你需要确保作为 `KaptGenerateStubs` 任务的一部分包含了相同的修改：
> ```kotlin
> tasks.named<KaptGenerateStubs>("kaptGenerateStubs") { // 你的自定义配置 }
>```
> {validate="false"}
> 
{style="warning"}

更多信息请参阅我们的 [YouTrack 工单](https://youtrack.jetbrains.com/issue/KT-54468/KAPT-Gradle-plugin-causes-eager-task-creation)。

### JVM 目标验证模式的编程式配置 {id="programmatic-configuration-of-the-jvm-target-validation-mode"}

在 Kotlin 1.9.0 之前，调整 Kotlin 与 Java 之间 JVM 目标不兼容性检测的方法只有一种。
你必须在整个项目的 `gradle.properties` 中设置 `kotlin.jvm.target.validation.mode=ERROR`。

现在你也可以在 `build.gradle.kts` 文件中的任务级别进行配置：

```kotlin
tasks.named<org.jetbrains.kotlin.gradle.tasks.KotlinJvmCompile>("compileKotlin") {
    jvmTargetValidationMode.set(org.jetbrains.kotlin.gradle.dsl.jvm.JvmTargetValidationMode.WARNING)
}
```
{validate="false"}

## 标准库 {id="standard-library"}

Kotlin 1.9.0 对标准库进行了一些重大改进：
* [`..<` 运算符](#stable-operator-for-open-ended-ranges)与[时间 API](#stable-time-api) 现已稳定。
* [Kotlin/Native 标准库经过了全面的审查与更新](#the-kotlin-native-standard-library-s-journey-towards-stabilization)
* [`@Volatile` 注解可用于更多平台](#stable-volatile-annotation)
* [提供了按名称获取正则表达式捕获组的**通用**函数](#new-common-function-to-get-regex-capture-group-by-name)
* [引入了 `HexFormat` 类用于格式化和解析十六进制数](#new-hexformat-class-to-format-and-parse-hexadecimals)

### 用于开区间范围的稳定 ..< 运算符 {id="stable-operator-for-open-ended-ranges"}

用于开区间范围的新 `..<` 运算符在 [Kotlin 1.7.20](whatsnew1720.md#preview-of-the-operator-for-creating-open-ended-ranges) 中引入，
并在 1.8.0 中变为稳定版。在 1.9.0 中，用于处理开区间范围的标准库 API 也已变为稳定版。

我们的研究表明，新的 `..<` 运算符更容易让人理解何时声明了一个开区间范围。如果
使用 [`until`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.ranges/until.html) 中缀函数，很容易
误以为包含了上限。

以下是使用 `until` 函数的示例：

```kotlin
fun main() {
    for (number in 2 until 10) {
        if (number % 2 == 0) {
            print("$number ")
        }
    }
    // 2 4 6 8
}
```
{validate="false"}

以下是使用新 `..<` 运算符的示例：

```kotlin
fun main() {
    for (number in 2..<10) {
        if (number % 2 == 0) {
            print("$number ")
        }
    }
    // 2 4 6 8
}
```
{validate="false"}

> 从 IntelliJ IDEA 2023.1.1 版本开始，提供了一项新的代码检查，在你可以使用
> `..<` 运算符时进行高亮显示。
>
{style="note"}

有关可以使用此运算符进行哪些操作的更多信息，请参阅 [Kotlin 1.7.20 的最新变化](whatsnew1720.md#preview-of-the-operator-for-creating-open-ended-ranges)。

### 稳定的时间 API {id="stable-time-api"}

自 1.3.50 起，我们预览了一个新的时间度量 API。该 API 的时长（duration）部分在 1.6.0 中已变为稳定版。在 1.9.0 中，
剩余的时间度量 API 也已变为稳定版。

旧的时间 API 提供了 `measureTimeMillis` 和 `measureNanoTime` 函数，它们使用起来不够直观。尽管
显而易见它们是以不同单位度量时间，但并不清楚 `measureTimeMillis` 使用[挂钟时间](https://en.wikipedia.org/wiki/Elapsed_real_time)
来度量时间，而 `measureNanoTime` 使用的是单调时间源。新的时间 API 解决了这些问题以及其他问题，
使得 API 更加易用。

借助新的时间 API，你可以轻松地：
* 使用单调时间源以所需的时间单位度量执行某些代码所花费的时间。
* 标记某一时刻。
* 比较两个时刻并计算差值。
* 检查自某个特定时刻以来经过了多少时间。
* 检查当前时间是否已经过了某个特定时刻。

#### 度量代码执行时间 {id="measure-code-execution-time"}

要度量执行一段代码所花费的时间，请使用 [`measureTime`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/measure-time.html)
内联函数。

要度量执行一段代码所花费的时间**并**返回该代码块的结果，请使用
[`measureTimedValue`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/measure-timed-value.html) 内联函数。

默认情况下，这两个函数都使用单调时间源。但是，如果你想使用经过真实时间源，也可以实现。
例如，在 Android 上，默认的时间源 `System.nanoTime()`
仅在设备处于活动状态时计时。当设备进入深度睡眠时，它会失去对时间的跟踪。为了在设备处于深度睡眠时保持对时间的跟踪，你可以创建一个使用 [`SystemClock.elapsedRealtimeNanos()`](https://developer.android.com/reference/android/os/SystemClock#elapsedRealtimeNanos())
的时间源：

```kotlin
object RealtimeMonotonicTimeSource : AbstractLongTimeSource(DurationUnit.NANOSECONDS) {
    override fun read(): Long = SystemClock.elapsedRealtimeNanos()
}
```
{validate="false"}

#### 标记并度量时间差 {id="mark-and-measure-differences-in-time"}

要标记特定的时刻，请使用 [`TimeSource`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-time-source/)
接口以及 [`markNow()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-time-source/mark-now.html) 函数
来创建一个 [`TimeMark`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-time-mark/)。要度量来自同一时间源的
`TimeMark` 之间的差异，请使用减法运算符（`-`）：

```kotlin
import kotlin.time.*

fun main() {
    val timeSource = TimeSource.Monotonic
    val mark1 = timeSource.markNow()
    Thread.sleep(500) // 休眠 0.5 秒。
    val mark2 = timeSource.markNow()

    repeat(4) { n ->
        val mark3 = timeSource.markNow()
        val elapsed1 = mark3 - mark1
        val elapsed2 = mark3 - mark2

        println("Measurement 1.${n + 1}: elapsed1=$elapsed1, elapsed2=$elapsed2, diff=${elapsed1 - elapsed2}")
    }
    // 也可以将各个时间标记相互比较。
    println(mark2 > mark1) // 结果为 true，因为 mark2 是在 mark1 之后捕获的。
}
```
{kotlin-runnable="true" id="kotlin-whats-new-time-elapsed"}

要检查截止时间是否已过或是否已超时，请使用 [`hasPassedNow()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-time-mark/has-passed-now.html)
和 [`hasNotPassedNow()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-time-mark/has-not-passed-now.html)
扩展函数：

```kotlin
import kotlin.time.*
import kotlin.time.Duration.Companion.seconds

fun main() {
    val timeSource = TimeSource.Monotonic
    val mark1 = timeSource.markNow()
    val fiveSeconds: Duration = 5.seconds
    val mark2 = mark1 + fiveSeconds

    // 还没到 5 秒
    println(mark2.hasPassedNow())
    // false

    // 等待 6 秒
    Thread.sleep(6000)
    println(mark2.hasPassedNow())
    // true
}
```
{kotlin-runnable="true" id="kotlin-whats-new-time-passednow"}

### Kotlin/Native 标准库迈向稳定之路 {id="the-kotlin-native-standard-library-s-journey-towards-stabilization"}

随着我们的 Kotlin/Native 标准库不断扩展，我们决定是时候对其进行全面审查，以确保
其符合我们的高标准要求。作为此项工作的一部分，我们仔细审查了**每个**现有的公开签名。针对每个
签名，我们考量了它是否：

* 具有独特的用途。
* 与其他 Kotlin API 保持一致。
* 与其 JVM 对应项具有相似的行为。
* 具备未来适应性。

基于这些考量，我们做出了以下决定之一：
* 将其稳定（Stable）。
* 将其设为实验性（Experimental）。
* 将其标记为 `private`。
* 修改其行为。
* 将其移动至其他位置。
* 弃用它。
* 将其标记为废弃（obsolete）。

> 如果现有签名被：
> * 移动到了其他软件包，则该签名在原软件包中仍然存在，但其弃用级别现为：`WARNING`。IntelliJ IDEA 会在代码检查时自动建议替换项。
> * 弃用，则其弃用级别为：`WARNING`。
> * 标记为废弃，则你可以继续使用它，但在未来会被替换。
>
{style="note"}

我们不会在此列出审查的所有结果，但以下是一些要点：
* 我们稳定了 Atomics API。
* 我们将 [`kotlinx.cinterop`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlinx.cinterop/) 设为实验性，现在需要不同的选择加入（opt-in）才能使用该软件包。更多信息请参阅[显式 C 互操作稳定性保证](#explicit-c-interoperability-stability-guarantees)。
* 我们将 [`Worker`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.native.concurrent/-worker/) 类及其相关 API 标记为废弃。
* 我们将 [`BitSet`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.native/-bit-set/) 类标记为废弃。
* 我们将 `kotlin.native.internal` 软件包中的所有 `public` API 标记为 `private` 或移至其他软件包。

#### 显式 C 互操作稳定性保证 {id="explicit-c-interoperability-stability-guarantees"}

为了保持 API 的高质量，我们决定将 [`kotlinx.cinterop`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlinx.cinterop/)
设为实验性。尽管 `kotlinx.cinterop` 已经过全面尝试和测试，但在我们满意并将其稳定之前，
仍有改进空间。我们建议你将此 API 用于互操作，但尽量
限制其在项目特定区域的使用。一旦我们开始演进该 API 以使其稳定，这将使你的迁移变得更加容易。

如果你想使用类 C 的外部 API（如指针），则必须通过 `@OptIn(ExperimentalForeignApi)` 进行选择加入，否则
你的代码将无法编译。

要使用 `kotlinx.cinterop` 的其余部分（涵盖 Objective-C/Swift 互操作性），你必须通过
`@OptIn(BetaInteropApi)` 进行选择加入。如果你在没有选择加入的情况下尝试使用此 API，代码可以编译，但编译器会
发出警告，明确说明你可以期待的行为。

有关这些注解的更多信息，请参阅 [`Annotations.kt`](https://github.com/JetBrains/kotlin/blob/master/kotlin-native/Interop/Runtime/src/main/kotlin/kotlinx/cinterop/Annotations.kt) 的源代码。

有关作为此次审查一部分的**所有**变更的更多信息，请参阅我们的 [YouTrack 工单](https://youtrack.jetbrains.com/issue/KT-55765)。

我们非常感谢你能提供任何反馈！你可以通过在该[工单](https://youtrack.jetbrains.com/issue/KT-57728)下发表评论来直接提供反馈。

### 稳定的 @Volatile 注解 {id="stable-volatile-annotation"}

如果使用 `@Volatile` 注解一个 `var` 属性，则支持字段会被标记，从而使对该
字段的任何读取或写入都是原子的，并且写入始终对其他线程可见。

在 1.8.20 之前，[`kotlin.jvm.Volatile` 注解](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.jvm/-volatile/)
在公共标准库中可用。然而，该注解仅在 JVM 上有效。如果在
其他平台上使用，它将被忽略，从而导致错误。

在 1.8.20 中，我们引入了一个实验性的通用注解 `kotlin.concurrent.Volatile`，你可以在 JVM 和 Kotlin/Native 中对其进行预览。

在 1.9.0 中，`kotlin.concurrent.Volatile` 已稳定。如果在多平台项目中使用了 `kotlin.jvm.Volatile`，我们
建议迁移到 `kotlin.concurrent.Volatile`。

### 用于按名称获取正则表达式捕获组的新通用函数 {id="new-common-function-to-get-regex-capture-group-by-name"}

在 1.9.0 之前，每个平台都有自己的扩展来按名称从正则表达式匹配项中获取捕获组。
但是没有通用函数。在 Kotlin 1.8.0 之前不可能拥有通用函数，
因为标准库仍支持 JVM 目标 1.6 和 1.7。

从 Kotlin 1.8.0 开始，标准库已针对 JVM 目标 1.8 进行编译。因此在 1.9.0 中，现在有了一个**通用**的
[`groups`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/-match-result/groups.html) 函数，你可以使用该函数
按名称检索正则表达式匹配项中某个组的内容。当你想要访问属于特定捕获组的
正则表达式匹配结果时，这非常有用。

以下是一个包含三个捕获组的正则表达式示例：`city`、`state` 和 `areaCode`。你
可以使用这些组名来访问匹配的值：

```kotlin
fun main() {
    val regex = """\b(?<city>[A-Za-z\s]+),\s(?<state>[A-Z]{2}):\s(?<areaCode>[0-9]{3})\b""".toRegex()
    val input = "Coordinates: Austin, TX: 123"
    
    val match = regex.find(input)!!
    println(match.groups["city"]?.value)
    // Austin
    println(match.groups["state"]?.value)
    // TX
    println(match.groups["areaCode"]?.value)
    // 123
}
```
{validate="false"}

### 用于创建父目录的新路径实用工具 {id="new-path-utility-to-create-parent-directories"}

在 1.9.0 中，新增了一个 `createParentDirectories()` 扩展函数，你可以使用它创建新文件以及所有
必需的父目录。向 `createParentDirectories()` 提供文件路径时，它会检查父目录
是否已存在。如果存在，则不执行任何操作。但是，如果不存在，它将为你创建它们。

`createParentDirectories()` 在复制文件时特别有用。例如，你可以将其与 `copyToRecursively()` 函数结合使用：

 ```kotlin
sourcePath.copyToRecursively(
    destinationPath.createParentDirectories(), 
    followLinks = false
 )
 ```
{validate="false"}

### 用于格式化和解析十六进制数的新 HexFormat 类 {id="new-hexformat-class-to-format-and-parse-hexadecimals"}

> 新的 `HexFormat` 类及其相关扩展函数处于[实验性阶段](components-stability.md#stability-levels-explained)，
> 要使用它们，可以通过 `@OptIn(ExperimentalStdlibApi::class)` 或编译器参数
> `-opt-in=kotlin.ExperimentalStdlibApi` 选择加入。
>
{style="warning"}

在 1.9.0 中，[`HexFormat`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/-hex-format/) 类及其相关
扩展函数作为实验性功能提供，允许你在数值与十六进制字符串之间进行转换。具体而言，你可以使用这些扩展函数在十六进制字符串与
`ByteArray` 或其他数值类型（`Int`、`Short`、`Long`）之间进行转换。

例如：

```kotlin
println(93.toHexString()) // "0000005d"
```
{validate="false"}

`HexFormat` 类包含格式设置选项，你可以使用 `HexFormat{}` 构建器进行配置。

如果处理 `ByteArray`，则有以下选项可通过属性进行配置：

| 选项 | 说明 |
|--|--|
| `upperCase` | 十六进制数字是大写还是小写。默认假定为小写。`upperCase = false`。 |
| `bytes.bytesPerLine` | 每行的最大字节数。 |
| `bytes.bytesPerGroup` | 每组的最大字节数。 |
| `bytes.bytesSeparator` | 字节之间的分隔符。默认为空。 |
| `bytes.bytesPrefix` | 紧接在每个字节的两位十六进制表示形式之前的字符串，默认为空。 |
| `bytes.bytesSuffix` | 紧随在每个字节的两位十六进制表示形式之后的字符串，默认为空。 |

例如：

```kotlin
val macAddress = "001b638445e6".hexToByteArray()

// 使用 HexFormat{} 构建器用冒号分隔十六进制字符串
println(macAddress.toHexString(HexFormat { bytes.byteSeparator = ":" }))
// "00:1b:63:84:45:e6"

// 使用 HexFormat{} 构建器实现：
// * 将十六进制字符串大写
// * 将字节成对分组
// * 用点分隔
val threeGroupFormat = HexFormat { upperCase = true; bytes.bytesPerGroup = 2; bytes.groupSeparator = "." }

println(macAddress.toHexString(threeGroupFormat))
// "001B.6384.45E6"
```
{validate="false"}

如果处理数值类型，则有以下选项可通过属性进行配置：

| 选项 | 说明 |
|--|--|
| `number.prefix` | 十六进制字符串的前缀，默认为空。 |
| `number.suffix` | 十六进制字符串的后缀，默认为空。 |
| `number.removeLeadingZeros` | 是否移除十六进制字符串中的前导零。默认情况下，不移除任何前导零。`number.removeLeadingZeros = false` |

例如：

```kotlin
// 使用 HexFormat{} 构建器解析前缀为 "0x" 的十六进制数。
println("0x3a".hexToInt(HexFormat { number.prefix = "0x" })) // "58"
```
{validate="false"}

## 文档更新 {id="documentation-updates"}

Kotlin 文档经历了一些显著的变更：
* [Kotlin 之旅](kotlin-tour-welcome.md)——学习 Kotlin 编程语言的基础知识，各章节均包含理论与实践。
* [Android 源集布局](https://kotlinlang.org/docs/multiplatform/multiplatform-android-layout.html)——了解新的 Android 源集布局。
* [Kotlin Multiplatform 兼容性指南](https://kotlinlang.org/docs/multiplatform/multiplatform-compatibility-guide.html)——了解在使用 Kotlin Multiplatform 开发项目时可能遇到的不兼容变更。
* [Kotlin Wasm](wasm-overview.md)——了解 Kotlin/Wasm 以及如何在你的 Kotlin Multiplatform 项目中使用它。

## 安装 Kotlin 1.9.0 {id="install-kotlin-1-9-0"}

### 检查 IDE 版本 {id="check-the-ide-version"}

[IntelliJ IDEA](https://www.jetbrains.com/idea/download/) 2022.3.3 和 2023.1.1 会自动建议将 Kotlin
插件更新到版本 1.9.0。IntelliJ IDEA 2023.2 将内置 Kotlin 1.9.0 插件。

Android Studio Giraffe (223) 和 Hedgehog (231) 将在即将发布的版本中支持 Kotlin 1.9.0。

新的命令行编译器可在 [GitHub 发行版页面](https://github.com/JetBrains/kotlin/releases/tag/v1.9.0)上下载。

### 配置 Gradle 设置 {id="configure-gradle-settings"}

要下载 Kotlin 构建工件和依赖项，请更新 `settings.gradle(.kts)` 文件以使用 Maven Central 仓库：

```kotlin
pluginManagement {
    repositories {
        mavenCentral()
        gradlePluginPortal()
    }
}
```
{validate="false"}

如果未指定该仓库，Gradle 会使用即将停用的 JCenter 仓库，这可能会导致 Kotlin 构建工件出现问题。

## Kotlin 1.9.0 兼容性指南 {id="compatibility-guide-for-kotlin-1-9-0"}

Kotlin 1.9.0 是一个功能版本，因此可能会
带来与针对该语言早期版本编写的代码不兼容的变更。请在 [Kotlin 1.9.0 兼容性指南](compatibility-guide-19.md)中查找这些变更的详细列表。