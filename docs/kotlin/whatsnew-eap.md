[//]: # (title: Kotlin %kotlinEapVersion% 的最新变化)

<primary-label ref="eap"/>

<show-structure depth="1"/>

<web-summary>阅读 Kotlin 抢先体验预览版（EAP）发布说明，并在正式发布前抢先体验 Kotlin 最新的实验性功能。</web-summary>

_[发布日期：%kotlinEapReleaseDate%](eap.md#build-details)_

> 本文档并未涵盖抢先体验预览版（EAP）的所有功能，
> 但重点介绍了部分重大改进。
>
> 完整变更列表请参阅 [GitHub 变更日志](https://github.com/JetBrains/kotlin/releases/tag/v%kotlinEapVersion%)。
>
{style="note"}

Kotlin %kotlinEapVersion% 现已发布！以下是本次 EAP 版本的一些详细信息：

* **语言**：[`only-syntax` 模式下基于名称的解构转为稳定版、未使用的返回值检查器以及改进的编译时常量](#stable-language-features)。
* **标准库**：[用于简化常见 `if` 表达式模式的全新实验性函数](#new-functions-for-simplifying-common-patterns-with-if-expressions)以及[对 Unicode 代码点的实验性支持](#support-for-unicode-code-points)。
* **Kotlin/JVM**：[支持 Java 28](#kotlin-jvm)。
* **Kotlin/Native**：[Apple 目标平台默认启用增量编译](#incremental-compilation-enabled-by-default-on-apple-targets)以及 [Swift 导出进入 Beta 阶段并提供新的 DSL](#swift-export-goes-beta-with-a-new-gradle-dsl)。
* **Kotlin Multiplatform**：[适用于 Kotlin Multiplatform 的全新实验性编译方案](#new-experimental-compilation-scheme-for-kotlin-multiplatform)以及[多平台库的全新发布格式](#new-publication-format-for-kotlin-multiplatform-libraries)。
* **Kotlin/JS**：[支持 `es2020` 目标平台](#kotlin-js)。
* **Kotlin 编译器**：[`klib` 编译期间内联函数行为更加一致](#consistent-cross-module-function-inlining-during-klib-compilation)。

> 有关 Kotlin 发布周期的信息，请参阅 [Kotlin 发布流程](releases.md)。
>
{style="tip"}

## 更新至 Kotlin %kotlinEapVersion% {id="update-to-kotlin-kotlineapversion"}

最新版本的 Kotlin 已包含在最新版本的 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/)
和 [Android Studio](https://developer.android.com/studio) 中。

要更新到新的 Kotlin 版本，请确保您的 IDE 已更新至最新版本，并在构建脚本中将 [Kotlin 版本更改](releases.md#update-to-a-new-kotlin-version)为 %kotlinEapVersion%。

## 语言 {id="language"}

Kotlin %kotlinEapVersion% 稳定了早期版本中引入的多项语言功能。它还引入了实验性的伴生扩展和伴生块，以及完整值类（full value classes）。

### 稳定语言功能 {id="stable-language-features"}

<secondary-label ref="language"/>

Kotlin 2.3.0−2.4.0 引入了一些处于[实验性](components-stability.md#stability-levels-explained)阶段的语言功能。
我们很高兴地宣布，以下语言功能在此版本中已转为[稳定版](components-stability.md#stability-levels-explained)：

* [改进的编译时常量](whatsnew24.md#improved-compile-time-constants)。

* 用于为可选参数生成基于版本的重载的 [`@IntroducedAt` 注解](whatsnew24.md#new-introducedat-annotation-to-generate-version-based-overloads-for-optional-parameters)。

* [未使用的返回值检查器](whatsnew23.md#unused-return-value-checker)，现已默认启用。

* `only-syntax` 模式下的[基于名称的解构](destructuring-declarations.md#name-based-destructuring)，现已作为默认行为。

  在此模式下，“旧”解构语法 `val (x, y)` 保持其基于位置的行为，而“新”语法 `(val x, val y)` 则执行基于名称的解构。您可以在此视频中查看该功能的概述：

  <video src="https://www.youtube.com/v/He8J34KHEY4" title="Kotlin 的基于名称的解构"/>

### 伴生扩展与伴生块 {id="companion-extensions-and-blocks"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="language"/>

Kotlin %kotlinEapVersion% 引入了伴生扩展和伴生块。

以前，要声明可以通过类型名称访问的扩展、函数和属性，该类型必须具有伴生对象。伴生扩展和伴生块移除了此项要求，允许您：

* 通过在顶层扩展中添加 `companion` 修饰符来声明伴生扩展，即使它所扩展的类型没有伴生对象也是如此。
* 在类或接口内部的 `companion {}` 块中声明函数和属性，而无需创建对象实例。在支持静态成员的平台上，编译器会将这些声明生成为静态成员。因此，在 JVM 上无需使用 `@JvmStatic` 对它们进行注解。

以下示例将 `UnitX` 声明为伴生扩展，并在伴生块中声明了 `Zero`：

```kotlin
// 将 UnitX 声明为伴生扩展
companion val Vector.UnitX get() = Vector(1.0, 0.0)

data class Vector(val x: Double, val y: Double) {
    companion {
        // 在伴生块中声明 Zero
        val Zero: Vector get() = Vector(0.0, 0.0)
    }
}

fun main() {
    println(Vector.UnitX)
    // Vector(x=1.0, y=0.0)

    println(Vector.Zero)
    // Vector(x=0.0, y=0.0)
}
```

有关设计的更多信息，请参阅该功能的 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0449-companions-block-extension.md)。您也可以在我们的[博客文章](https://blog.jetbrains.com/kotlin/2026/09/the-companions-to-come/)中阅读关于该功能的内容。

伴生扩展和伴生块属于[实验性功能](components-stability.md#stability-levels-explained)。要启用它们，请在构建文件中添加以下编译器选项：

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xcompanion-blocks-and-extensions")
    }
}
```

</tab>
<tab title="Maven" group-key="maven">

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <configuration>
                <args>
                    <arg>-Xcompanion-blocks-and-extensions</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

</tab>
</tabs>

欢迎在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-11968) 中提供反馈。

### 完整值类 {id="full-value-classes"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="language"/>

在 Kotlin %kotlinEapVersion% 之前，[内联值类](inline-classes.md)允许您围绕单个值创建自定义包装器类型。如果类型需要多个属性，则必须使用常规类或数据类。但对于这些类，即使对该类型没有实质意义，包含相同数据的两个实例仍然可以通过它们的引用进行区分。这可能会限制运行时优化，并导致代码不必要地依赖于是否保留了相同的对象引用。

Kotlin %kotlinEapVersion% 引入了实验性的完整值类，允许您定义其属性共同构成值且单个实例的标识（identity）无关紧要的类型。例如，您可以声明一个完整值类 `Complex` 来表示包含实部和虚部属性的复数：

```kotlin
value class Complex(val real: Double, val imaginary: Double)
```

编译器会自动为完整值类生成 `equals()`、`hashCode()` 和 `toString()` 函数，类似于数据类。但是：

* 不会生成 `componentN()` 函数。作为替代，您可以使用[基于名称的解构](destructuring-declarations.md#name-based-destructuring)，且无需显式声明启用。
* 不会生成 `copy()` 函数。未来，您将可以使用 `copy vars` 替代。更多信息请参阅 [KT-44653](https://youtrack.jetbrains.com/issue/KT-44653)。

有关与数据类相比的区别的更多信息，请参阅 KEEP 中关于[继承](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0454-better-immutability-value-classes-MFVC.md#mfvc-and-inheritance)的章节。

#### 抽象值类 {id="abstract-value-classes"}

完整值类可以是抽象的。与[接口](interfaces.md)不同，它们可以定义每个子类在构造期间都会运行的初始化逻辑。

例如，`OrderedInterval` 值类接收 `start` 和 `end` 作为构造函数形参。`IntInterval` 值类则将这些值存储在其 `start` 和 `end` 属性中。

```kotlin
sealed value class OrderedInterval<T : Comparable<T>> protected constructor(
    start: T,
    end: T,
) {
    init {
        require(start <= end)
    }
}

value class IntInterval(
    val start: Int,
    val end: Int
) : OrderedInterval<Int>(start, end)
```

更多信息请参阅 KEEP 中关于[继承](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0454-better-immutability-value-classes-MFVC.md#mfvc-and-inheritance)的章节。

#### 值对象 {id="value-objects"}

完整值类可以不包含任何属性。这些被称为*值对象（value objects）*，适用于表示只有一种可能取值且没有标识的类型，例如状态或令牌（token）。例如：

```kotlin
sealed interface UserResponse

value class UserFound(val user: User) : UserResponse
value object UserUnknown : UserResponse
```

更多信息请参阅 KEEP 中关于[值对象](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0454-better-immutability-value-classes-MFVC.md#value-objects)的章节。

#### 如何启用 {id="how-to-enable"}

此功能属于[实验性功能](components-stability.md#stability-levels-explained)。要启用它，请在构建文件中添加以下编译器选项：

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xfull-value-classes")
    }
}
```

</tab>
<tab title="Maven" group-key="maven">

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <configuration>
                <args>
                    <arg>-Xfull-value-classes</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

</tab>
</tabs>

#### 内联值类声明的变更 {id="changes-to-inline-value-class-declarations"}

随着这些新值类的引入，`value class` 不再必然表示内联。内联值类具有外部可观察的内联表示，而其他值类不会以相同的方式暴露其运行时表示。这一区别对 Spring 和序列化库非常重要，因为它们处理内联值类的方式有所不同。

为了使这种区分更加明确，未来编译器将要求必须通过 `inline` 修饰符和 `@JvmInline value class` 声明显式声明内联值类。普通的 `value class` 声明将不再被视为内联。

我们计划分阶段迁移来改变此行为：

* Kotlin 2.5.20 将对未标记的单字段值类发出警告。
* Kotlin 2.6.0 或 2.7.0 将把此警告升级为错误。

您可以使用 `-Xinline-value-class-migration=warning` 和 `-Xinline-value-class-migration=strict` 编译器选项来让您的代码为这一变更做好准备。

更多信息请参阅 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0468-inline-value-classes.md#migration)。

##### 为库的类迁移到值类做好准备 {id="prepare-your-library-s-classes-for-migration-to-value-classes"}

作为库作者，您可以使用 `@WillBecomeValue` 注解来为库中的常规类做好未来迁移到完整值类的准备。当用户的代码依赖于对象标识（例如通过引用相等性 `===`、同步或标识哈希码）时，编译器会向用户发出警告。这些警告让用户有时间在您迁移类之前更新其代码。

该注解属于[实验性功能](components-stability.md#stability-levels-explained)，需要您使用 `@OptIn(ExperimentalValueClassApi::class)` 启用。您库的用户在使用被注解的类时不需要进行此项启用。

更多信息请参阅 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0470-will-become-value.md)。

### 改进结构类的相等性比较检查 {id="improved-checks-for-equality-comparisons-on-structural-classes"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="language"/>

Kotlin %kotlinEapVersion% 引入了对涉及数据类、数据对象、final 值类和枚举类（统称为*结构类*）的相等性比较的额外分析。

编译器对这些类使用严格的相等性检查，根据操作数的已知类型，报告使用 `==` 始终返回 `false` 或使用 `!=` 始终返回 `true` 的比较。这些检查有助于捕获诸如将向量与点进行比较之类的错误，即使两个类具有相同的属性：

```kotlin
data class Point(val x: Double, val y: Double) {
    companion object {
        val ZERO: Point = Point(0.0, 0.0)
    }
}

data class Vector(val x: Double, val y: Double)

fun normalize(v: Vector) {
    if (v == Point.ZERO) {
        // 诊断信息：此比较始终为 false。
        // Vector 正在与 Point 进行比较。
    }
    // ...
}
```

编译器还可以利用相等性检查对右侧操作数进行智能转换。

要启用此功能，请在构建文件中添加以下编译器选项：

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xstrict-equality-for-structural-classes")
    }
}
```

</tab>
<tab title="Maven" group-key="maven">

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <configuration>
                <args>
                    <arg>-Xstrict-equality-for-structural-classes</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

</tab>
</tabs>

更多信息请参阅该功能的 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0456-equals.md)。

## 标准库 {id="standard-library"}

在此版本中，Kotlin 标准库提供了新的实验性函数来简化您的 `if` 表达式，并提供了对 Unicode 代码点的实验性支持。

### 用于简化常见 `if` 表达式模式的新函数 {id="new-functions-for-simplifying-common-patterns-with-if-expressions"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="standard-library"/>

Kotlin %kotlinEapVersion% 引入了新的标准库函数，允许您在返回 `Boolean` 值之前对其进行检查，或根据该值返回可为 null 的结果。

此前，这些模式需要带有 `else` 分支的显式 `if` 表达式。您现在可以使用以下函数来简化它们：

* `onTrue()`：当 `Boolean` 值为 `true` 时运行指定代码块，并返回原始 Boolean 值。
* `onFalse()`：当 `Boolean` 值为 `false` 时运行指定代码块，并返回原始 Boolean 值。
* `ifOrNull()`：当 `Boolean` 值为 `true` 时运行指定代码块并返回其结果。如果值为 `false`，则函数直接返回 `null`，不运行代码块。

这些函数属于[实验性功能](components-stability.md#stability-levels-explained)，需要使用 `@OptIn(ExperimentalStdlibApi::class)` 注解或 `-opt-in=kotlin.ExperimentalStdlibApi` 编译器选项进行启用。

示例如下：

```kotlin
@OptIn(ExperimentalStdlibApi::class)
fun main() {
    val tags = mutableSetOf("kotlin", "jvm")

    // 使用 onTrue() 函数在 add() 返回 true 时打印消息
    val added = tags.add("wasm").onTrue {
        println("Tag added")
    }
    println(added)
    // Tag added
    // true

    // 使用 onFalse() 函数在 remove() 返回 false 时打印消息
    val removed = tags.remove("native").onFalse {
        println("Tag not found")
    }
    println(removed)
    // Tag not found
    // false

    // 使用 ifOrNull() 函数在 tags 包含 "wasm" 时返回消息
    val message = ifOrNull("wasm" in tags) {
        "Wasm tag is available"
    }
    println(message)
    // Wasm tag is available
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.5.0-Beta1" validate="false"}

欢迎在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-6938) 中提供反馈。

### 支持 Unicode 代码点 {id="support-for-unicode-code-points"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="standard-library"/>

Kotlin %kotlinEapVersion% 引入了 `CodePoint` 内联值类以及 `kotlin.text.unicode` 软件包中的相关 API。这让您能够跨平台处理 Unicode 代码点。

`Char` 代表一个 UTF-16 代码单元。但是，某些 Unicode 代码点需要两个 `Char` 值，即所谓的代理对（surrogate pair）。当程序以 `Char` 值为单位遍历字符串时，会将代理对的每一半作为单独的元素进行处理。

`CodePoint` 值类表示一个 Unicode 代码点，并使用 `Int` 作为其底层类型来存储其整数值。它提供了访问各种属性的途径，例如表示它所需的 UTF-16 代码单元数量、其 Unicode 类别，以及它是否为字母、数字或空格。

新的 API 允许您对代码点进行计数和遍历、转换它们的大小写，以及在文本中追加、插入、替换或删除它们。您还可以比较代码点、执行算术运算、创建区间，以及在两个方向上遍历文本。文本 API 继续使用 UTF-16 代码单元偏移量来表示位置。

这些 API 属于[实验性功能](components-stability.md#stability-levels-explained)，需要使用 `@OptIn(ExperimentalUnicodeApi::class)` 注解或 `-opt-in=kotlin.text.unicode.ExperimentalUnicodeApi` 编译器选项进行启用。

更多信息请参阅该功能的 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/stdlib/KEEP-0400-unicode-codepoints.md)。

## Kotlin/JVM {id="kotlin-jvm"}
<secondary-label ref="jvm"/>

从 Kotlin %kotlinEapVersion% 开始，编译器可以生成包含 Java 28 字节码的类。

## Kotlin/Native {id="kotlin-native"}

Kotlin %kotlinEapVersion% 在 Apple 目标平台上默认启用了增量编译，并通过新的 Gradle DSL 将 Swift 导出提升至 Beta 阶段。

### Apple 目标平台默认启用增量编译 {id="incremental-compilation-enabled-by-default-on-apple-targets"}

<secondary-label ref="native"/>

从 Kotlin %kotlinEapVersion% 开始，Apple 目标平台上默认启用 `klib` 工件的增量编译。

使用增量编译时，如果项目模块生成的 `klib` 工件仅有一部分发生更改，则仅重新编译 `klib` 的受影响部分为二进制文件。

该优化最早在 [Kotlin 1.9.20](whatsnew1920.md#incremental-compilation-of-klib-artifacts) 中引入，并在某些情况下被证明能够大幅减少调试构建的编译时间。

这一新的默认设置仅适用于 Apple 目标平台。Windows（[MinGW 工具链](https://www.mingw-w64.org/)）不支持增量编译。对于 Linux，仍然需要通过以下配置显式启用：

```properties
kotlin.incremental.native=true
```

请注意，在某些情况下，此优化可能会对全新构建产生性能损耗。
为了解决这个问题，您可以尝试新的[二进制选项](native-binary-options.md#how-to-enable)，该选项旨在全新构建时运行特殊的编译模式。该选项属于[实验性功能](components-stability.md#stability-levels-explained)，
通过以下方式启用：

```properties
kotlin.native.binary.batchedCacheBuild=true
```

如果您在使用增量编译时遇到意外问题，可以在 `gradle.properties` 文件中设置以下选项来手动禁用它：

```properties
kotlin.incremental.native=false
```

如有任何问题，请在 [YouTrack](https://kotl.in/issue) 中反馈。

有关缩短编译时间的更多提示，请参阅我们的[文档](native-improving-compilation-time.md)。

### Swift 导出进入 Beta 阶段并提供新的 Gradle DSL {id="swift-export-goes-beta-with-a-new-gradle-dsl"}

<primary-label ref="beta"/>
<secondary-label ref="native"/>

在 Kotlin %kotlinEapVersion% 中，Swift 导出转为 [Beta](components-stability.md#stability-levels-explained) 阶段，并获得了更加符合人体工程学的 Gradle DSL。新的 DSL 减少了重复代码并提高了配置复用率，使将 Kotlin 代码暴露给 Swift 变得更加容易。

主要变更如下：

| 功能 | 之前 | 之后 |
|---------------------------------|-----------------------------------------------------------------|-------------------------------------------------------|
| 入口点 | `swiftExport {}` | `export { swift {} }` |
| 折叠规则属性 | `flattenPackage = "com.example.sandbox"` | `rootPackage = "com.example.sandbox"` |
| 导出已声明的依赖项 | `export(project(":subproject")) {}` | 自动导出；不再需要显式 `export()` |
| 覆盖依赖项配置 | `export(libs.utils) {}` | `xcodeIntegration { configure(libs.utils) {} }` |
| 编译器参数 | `configure { freeCompilerArgs.add("-Xexpect-actual-classes") }` | 已移除 |

以下是使用新 Swift 导出 DSL 的完整构建配置：

```kotlin
// subproject/build.gradle.kts
kotlin {

    iosArm64()
    iosSimulatorArm64()

    // 当 ":subproject" 作为 ":shared" 的依赖项被导出时
    // 将使用此配置
    export {
        swift {
            // 设置根模块名称
            moduleName = "Subproject"

            // 设置折叠规则
            // 从生成的 Swift 代码中移除包名前缀
            rootPackage = "com.subproject.library"
        }
    }
}

// shared/build.gradle.kts
kotlin {

    iosArm64()
    iosSimulatorArm64()

    export {
        swift {
            // 设置根模块名称
            moduleName = "Shared"

            // 设置折叠规则
            // 从生成的 Swift 代码中移除包名前缀
            rootPackage = "com.example.sandbox"

            // 为此模块启用 Xcode 集成
            xcodeIntegration {
                // 配置外部模块导出
                configure(libs.utils) {
                    // 可选：覆盖导出的模块名称
                    moduleName = "Utils"
                    // 可选：覆盖已导出依赖项的折叠规则
                    rootPackage = "com.example.utils"
                }
            }
        }
    }

    sourceSets {
        commonMain {
            dependencies {
                // 这些依赖项会自动
                // 包含在 Swift 导出中
                api(project(":subproject"))
                api(libs.utils)
            }
        }
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="完整 DSL 示例"}

此外，Swift 导出配置现在支持发布：如果库作者提供了选项覆盖，Gradle 会在 Swift 导出期间自动获取并应用它们。

如果遇到任何问题，请在 [YouTrack](https://kotl.in/issue) 中反馈，或[获取邀请](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up?_gl=1*ju6cbn*_ga*MTA3MTk5NDkzMC4xNjQ2MDY3MDU4*_ga_9J976DJZ68*MTY1ODMzNzA3OS4xMDAuMS4xNjU4MzQwODEwLjYw)加入 [#swift-export](https://kotlinlang.slack.com/archives/C073GUW6WN9) Slack 频道。

## Kotlin Multiplatform {id="kotlin-multiplatform"}

Kotlin %kotlinEapVersion% 引入了适用于 Kotlin Multiplatform 的全新实验性编译方案，以及一种能够显著减小已发布多平台库体积的新发布格式。

### 适用于 Kotlin Multiplatform 的全新实验性编译方案 {id="new-experimental-compilation-scheme-for-kotlin-multiplatform"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="multiplatform"/>

Kotlin %kotlinEapVersion% 为 Kotlin Multiplatform (KMP) 引入了一种全新的实验性编译方案，使编译器处理公共源集（common source set）的方式与 IDE 更加一致。这一变更防止了公共代码意外解析到平台特定的声明，提高了重载解析和类型推断的一致性，并使我们能够为公共源集实现增量编译。在我们的[博客文章](https://blog.jetbrains.com/kotlin/2026/09/a-more-reliable-compilation-scheme-for-kotlin-multiplatform-modules/)中详细了解 KMP 分离编译及如何体验它。

### Kotlin Multiplatform 库的全新发布格式 {id="new-publication-format-for-kotlin-multiplatform-libraries"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="multiplatform"/>

Kotlin %kotlinEapVersion% 为 Kotlin Multiplatform 库引入了一种新的发布格式，可显著减小已发布库的体积。新格式将平台工件（JVM 和 Android 除外）发布为单个 `.kar` 归档文件，这是一个额外使用 XZ 压缩的 ZIP 归档。

这一变更解决了 Maven Central 最近引入的[发布体积限制](https://central.sonatype.org/publish/maven-central-publishing-limits/)。使用新格式后，添加新目标平台不再会创建新的文件，因此发布体积不会大幅增加。在某些情况下，整个发布体积甚至比之前单个目标平台的体积还要小。例如，对于 [cryptography-kotlin](https://github.com/whyoleg/cryptography-kotlin) 库，整个多模块项目的发布工件集从 7539 个文件和 91 MB 减少到了 1036 个文件和 23 MB。

要为特定模块启用新格式，请在模块的构建脚本中进行配置：

```kotlin
kotlin {
    publishing {
        publicationFormat.set(KotlinPublicationFormat.KOTLIN_ARCHIVE)
    }
}
```

或者，要为项目中的所有模块启用它，请在 `gradle.properties` 文件中添加以下属性：

```properties
kotlin.publicationFormat=KOTLIN_ARCHIVE
```

尽管使用新格式发布仍处于[实验性](components-stability.md#stability-levels-explained)阶段，但所有项目现已支持使用此类工件。此变更仅与库作者相关，不会影响最终应用程序的开发者。

欢迎分享您的反馈并在 [YouTrack](https://kotl.in/issue) 中报告任何问题。

## Kotlin/JS {id="kotlin-js"}
<secondary-label ref="js"/>

Kotlin %kotlinEapVersion% 在 Kotlin/JS 编译器和 Gradle 插件中添加了 `es2020` 目标。此前仅提供了 `es5` 和 `es2015` 目标，而对 `BigInt` 等较新 JavaScript 功能的支持必须在以 ES2015 为目标时单独启用。通过以 ES2020 为目标，您无需额外配置即可使用直到 ECMAScript 2020 为止的所有受支持 JavaScript 功能（包括 `BigInt`）。

要启用新目标，请在 `compilerOptions {}` 块中将 `target` 设置为 `es2020`：

```kotlin
kotlin {
    js {
        compilerOptions {
            target.set("es2020")
        }
    }
}
```

## Kotlin 编译器 {id="kotlin-compiler"}

Kotlin %kotlinEapVersion% 对 `klib` 编译期间的函数内联带来了更多改进，并提升了类型推断性能。

### klib 编译期间一致的跨模块函数内联 {id="consistent-cross-module-function-inlining-during-klib-compilation"}

<secondary-label ref="compiler"/>

Kotlin 2.4.0 在 `klib` 编译期间启用了 [Kotlin/Native、Kotlin/JS 和 Kotlin/Wasm 上一致的模块内函数内联](whatsnew24.md#consistent-intra-module-function-inlining-during-klib-compilation)。不同 Kotlin 平台间函数内联的一致性使得提供兼容性保证更加容易。

Kotlin 2.4.0 还引入了在 `klib` 编译期间启用**跨模块**内联的功能，确保项目中的所有内联函数都能得到一致的内联。Kotlin %kotlinEapVersion% 默认启用了跨模块内联。

如果您在使用此功能时遇到意外问题，可以使用以下命令行编译器选项将其禁用：

```bash
-Xklib-ir-inliner=disabled
```

欢迎分享您的反馈并在 [YouTrack](https://kotl.in/issue) 中报告任何问题。

### 提升类型推断性能 {id="improved-type-inference-performance"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="compiler"/>

Kotlin %kotlinEapVersion% 通过减少类型推断期间生成的约束数量来提升编译器性能。此前，复杂的泛型代码可能会生成过多的约束，导致编译或 IDE 分析挂起。这一变更可能会在某些极端情况下影响类型推断，特别是涉及构建器推断或具有非寻常边界的复杂平台类型时。因此，编译器可能会推断出不同的类型、选择不同的重载或报告不同的诊断信息。这些差异可能是该改进带来的预期结果。

该功能默认已启用。若要恢复之前的类型推断行为，请使用 `-XXLanguage:-EliminateSecondKindIncorporation` 选项。

欢迎在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-85879) 中提供反馈。

## 破坏性变更与弃用 {id="breaking-changes-and-deprecations"}

Kotlin %kotlinEapVersion% 引入了一项错误，作为将运行 Kotlin 编译器所需的最低 JDK 版本从 JDK 8 提升至 JDK 17 的下一步措施。我们提高最低 JDK 要求是为了加快开发速度，并使编译器能够访问需要更新 Java 版本的新库。JDK 17 拥有较长的支持周期，有助于我们保持与新版本 Gradle 和 Maven 的兼容性。您可以使用 `-Xallow-pre-17-runtime-jdk` 编译器选项来忽略该错误。在 Kotlin 2.5.20 或 2.6.0 中 JDK 17 成为强制要求时，该选项将被移除。

如果您在升级项目时遇到困难，请在 [YouTrack](https://kotl.in/issue) 上分享您的经验，或直接在 Kotlin Slack 上与开发者联系。[获取邀请](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up?_gl=1*ju6cbn*_ga*MTA3MTk5NDkzMC4xNjQ2MDY3MDU4*_ga_9J976DJZ68*MTY1ODMzNzA3OS4xMDAuMS4xNjU4MzQwODEwLjYw)并加入 [#compiler](https://kotlinlang.slack.com/archives/C7L3JB43G) 频道。