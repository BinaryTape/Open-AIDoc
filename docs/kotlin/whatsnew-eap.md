[//]: # (title: Kotlin %kotlinEapVersion% 的最新变化)

<primary-label ref="eap"/>

<show-structure depth="1"/>

<web-summary>阅读 Kotlin 抢先体验预览版（EAP）发布说明，在最新实验性 Kotlin 功能正式发布前抢先试用。</web-summary>

_[发布日期：%kotlinEapReleaseDate%](eap.md#build-details)_

> 本文档并未涵盖抢先体验预览版（EAP）的所有功能，
> 但重点介绍了其中一些重大改进。
>
> 请在 [GitHub 变更日志](https://github.com/JetBrains/kotlin/releases/tag/v%kotlinEapVersion%)中查看完整的变更列表。
>
{style="note"}

Kotlin %kotlinEapVersion% 现已发布！以下是本次 EAP 版本的一些详细信息：

* **语言**：[`only-syntax` 模式下稳定的基于名称的析构、未使用的返回值检查器以及改进的编译时常量](#stable-language-features)。
* **标准库**：[用于简化 `if` 表达式常见模式的新实验性函数](#new-functions-for-simplifying-common-patterns-with-if-expressions)以及[对 Unicode 代码点的实验性支持](#support-for-unicode-code-points)。
* **Kotlin/JVM**：[支持 Java 28](#kotlin-jvm)。
* **Kotlin/Native**：[Swift 导出进入 Beta 阶段并配备新 DSL](#swift-export-goes-beta-with-a-new-gradle-dsl)。
* **Kotlin Multiplatform**：[面向 Kotlin Multiplatform 的新实验性编译方案](#new-experimental-compilation-scheme-for-kotlin-multiplatform)以及[多平台库的新发布格式](#new-publication-format-for-kotlin-multiplatform-libraries)。
* **Kotlin/JS**：[支持 `es2020` 目标平台](#kotlin-js)。
* **Kotlin 编译器**：[`klib` 编译期间更加一致的内联函数行为](#consistent-cross-module-function-inlining-during-klib-compilation)。

> 有关 Kotlin 发布周期的信息，请参阅 [Kotlin 发布流程](releases.md)。
>
{style="tip"}

## 更新至 Kotlin %kotlinEapVersion% {id="update-to-kotlin-kotlineapversion"}

最新版本的 Kotlin 已包含在最新版本的 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/) 和 [Android Studio](https://developer.android.com/studio) 中。

要更新到新的 Kotlin 版本，请确保将 IDE 更新至最新版本，并在构建脚本中[将 Kotlin 版本更改](releases.md#update-to-a-new-kotlin-version)为 %kotlinEapVersion%。

## 语言 {id="language"}

Kotlin %kotlinEapVersion% 稳定了早期版本中引入的多个语言功能。它还引入了实验性的伴生扩展与伴生块，以及完整值类（full value classes）。

### 稳定语言功能 {id="stable-language-features"}

<secondary-label ref="language"/>

Kotlin 2.3.0−2.4.0 引入了一些作为[实验性](components-stability.md#stability-levels-explained)的语言功能。我们很高兴地宣布，以下语言功能在此版本中现已变为[稳定](components-stability.md#stability-levels-explained)：

* [改进的编译时常量](whatsnew24.md#improved-compile-time-constants)。

* [用于为可选形参生成基于版本重载的 `@IntroducedAt` 注解](whatsnew24.md#new-introducedat-annotation-to-generate-version-based-overloads-for-optional-parameters)。

* [未使用的返回值检查器](whatsnew23.md#unused-return-value-checker)，现已默认启用。

* [`only-syntax` 模式下的基于名称的析构](destructuring-declarations.md#name-based-destructuring)，现已作为默认设置。

  在此模式下，“旧”析构语法 `val (x, y)` 保持其基于位置的行为，而“新”语法 `(val x, val y)` 则执行基于名称的析构。您可以在此视频中查看该功能的概述：

  <video src="https://www.youtube.com/v/He8J34KHEY4" title="Kotlin's Name-Based Destructuring"/>

### 伴生扩展与伴生块 {id="companion-extensions-and-blocks"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="language"/>

Kotlin %kotlinEapVersion% 引入了伴生扩展和伴生块。

此前，要声明可以通过类型名称访问的扩展、函数和属性，该类型需要具有伴生对象（companion object）。伴生扩展和伴生块移除了此要求，允许您：

* 即使所扩展的类型没有伴生对象，也可以通过向顶级扩展添加 `companion` 修饰符来声明伴生扩展。
* 在类或接口内的 `companion {}` 块中声明函数和属性，而无需创建对象实例。在支持静态成员的平台上，编译器会将这些声明生成为静态成员。因此，在 JVM 上无需使用 `@JvmStatic` 对它们进行注解。

下面是一个将 `UnitX` 声明为伴生扩展并在伴生块中声明 `Zero` 的示例：

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

有关该设计的更多信息，请参阅该功能的 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0449-companions-block-extension.md)。您还可以在我们的[博客文章](https://blog.jetbrains.com/kotlin/2026/09/the-companions-to-come/)中了解有关此功能的更多信息。

伴生扩展和伴生块属于[实验性功能](components-stability.md#stability-levels-explained)。如需启用，请在构建文件中添加以下编译器选项：

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

欢迎在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-11968) 中提供您的反馈。

### 完整值类 {id="full-value-classes"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="language"/>

在 Kotlin %kotlinEapVersion% 之前，[内联值类](inline-classes.md)允许您围绕单个值创建自定义包装类型。如果您的类型需要多个属性，则必须使用常规类或数据类。但对于这些类，即使按引用区分对该类型没有任何意义，包含相同数据的两个实例仍然可以通过它们的引用进行区分。这可能会限制运行时优化，并导致代码不必要地依赖于是否保留了相同的对象引用。

Kotlin %kotlinEapVersion% 引入了实验性的完整值类（full value classes），允许您定义由属性共同构成值、且各个实例的标识（identity）无关紧要的类型。例如，您可以声明一个完整值类 `Complex` 来表示具有实部和虚部属性的复数：

```kotlin
value class Complex(val real: Double, val imaginary: Double)
```

与数据类类似，编译器会自动为完整值类生成 `equals()`、`hashCode()` 和 `toString()` 函数。但是：

* 没有 `componentN()` 函数。作为替代，您可以使用[基于名称的析构](destructuring-declarations.md#name-based-destructuring)。您不需要额外启用。
* 没有 `copy()` 函数。未来，您将可以使用 `copy vars` 作为替代。有关更多信息，请参阅 [KT-44653](https://youtrack.jetbrains.com/issue/KT-44653)。

有关与数据类相比差异的更多信息，请参阅 KEEP 中有关[继承](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0454-better-immutability-value-classes-MFVC.md#mfvc-and-inheritance)的部分。

#### 抽象值类 {id="abstract-value-classes"}

完整值类可以是抽象的。与[接口](interfaces.md)不同，它们可以定义每个子类在构造期间都会运行的初始化逻辑。

例如，`OrderedInterval` 值类接受 `start` 和 `end` 作为构造函数形参。`IntInterval` 值类将这些值存储在其 `start` 和 `end` 属性中。

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

有关更多信息，请参阅 KEEP 中有关[继承](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0454-better-immutability-value-classes-MFVC.md#mfvc-and-inheritance)的部分。

#### 值对象 {id="value-objects"}

完整值类可以不包含任何属性。这些类被称为*值对象*（value objects），非常适合用来表示仅有一个可能的值且没有标识的类型，例如状态或令牌（token）。例如：

```kotlin
sealed interface UserResponse

value class UserFound(val user: User) : UserResponse
value object UserUnknown : UserResponse
```

有关更多信息，请参阅 KEEP 中有关[值对象](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0454-better-immutability-value-classes-MFVC.md#value-objects)的部分。

#### 如何启用 {id="how-to-enable"}

此功能属于[实验性功能](components-stability.md#stability-levels-explained)。如需启用，请在构建文件中添加以下编译器选项：

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

### 改进结构类相等性比较检查 {id="improved-checks-for-equality-comparisons-on-structural-classes"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="language"/>

Kotlin %kotlinEapVersion% 引入了针对涉及数据类、数据对象、final 值类以及枚举类的相等性比较的额外分析，这些类统称为*结构类*（structural classes）。

编译器对这些类使用严格的相等性检查，根据操作数的已知类型，报告使用 `==` 时始终返回 `false` 或使用 `!=` 时始终返回 `true` 的比较。这些检查有助于捕获诸如将向量与点进行比较之类的错误，即使这两个类具有相同的属性：

```kotlin
data class Point(val x: Double, val y: Double) {
    companion object {
        val ZERO: Point = Point(0.0, 0.0)
    }
}

data class Vector(val x: Double, val y: Double)

fun normalize(v: Vector) {
    if (v == Point.ZERO) {
        // 诊断：此比较始终为 false。
        // Vector 正在与 Point 进行比较。
    }
    // ...
}
```

编译器还可以使用相等性检查对右操作数进行智能转换（smart-cast）。

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

有关更多信息，请参阅该功能的 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0456-equals.md)。

## 标准库 {id="standard-library"}

在此版本中，Kotlin 标准库新增了用于简化 `if` 表达式的实验性函数，以及对 Unicode 代码点的实验性支持。

### 用于简化 if 表达式常见模式的新函数 {id="new-functions-for-simplifying-common-patterns-with-if-expressions"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="standard-library"/>

Kotlin %kotlinEapVersion% 引入了新的标准库函数，允许您在返回 `Boolean` 值之前对其进行检查，或者根据该值返回可空结果。

此前，这些模式需要带有 `else` 分支的显式 `if` 表达式。现在，您可以使用以下函数对其进行简化：

* `onTrue()` 当 `Boolean` 值为 `true` 时运行指定代码块，并返回原始布尔值。
* `onFalse()` 当 `Boolean` 值为 `false` 时运行指定代码块，并返回原始布尔值。
* `ifOrNull()` 当 `Boolean` 值为 `true` 时运行指定代码块并返回其结果。如果该值为 `false`，则函数直接返回 `null` 而不运行该代码块。

这些函数属于[实验性功能](components-stability.md#stability-levels-explained)，需要使用 `@OptIn(ExperimentalStdlibApi::class)` 注解或 `-opt-in=kotlin.ExperimentalStdlibApi` 编译器选项来启用。

示例：

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

    // 使用 ifOrNull() 函数在 tags 中包含 "wasm" 时返回消息
    val message = ifOrNull("wasm" in tags) {
        "Wasm tag is available"
    }
    println(message)
    // Wasm tag is available
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.5.0-Beta1" validate="false"}

欢迎在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-6938) 中提供您的反馈。

### 支持 Unicode 代码点 {id="support-for-unicode-code-points"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="standard-library"/>

Kotlin %kotlinEapVersion% 引入了 `CodePoint` 内联值类以及 `kotlin.text.unicode` 包中的相关 API。这使您能够在跨平台开发中处理 Unicode 代码点。

一个 `Char` 表示一个 UTF-16 代码单元。但是，某些 Unicode 代码点需要两个 `Char` 值，这被称为代理对（surrogate pair）。当程序以 `Char` 值的形式遍历字符串时，它会将代理对的每一半作为独立元素进行处理。

`CodePoint` 值类表示一个 Unicode 代码点，并使用 `Int` 作为其底层类型来存储其整数值。它提供了对诸多属性的访问，例如表示它所需的 UTF-16 代码单元数量、其 Unicode 类别，以及它是否为字母、数字或空格。

新的 API 允许您对代码点进行计数和遍历、转换大小写，并在文本中追加、插入、替换或删除它们。您还可以比较代码点、执行算术运算、创建区间，并双向遍历文本。文本 API 继续使用 UTF-16 代码单元偏移量来表示位置。

这些 API 属于[实验性功能](components-stability.md#stability-levels-explained)，需要使用 `@OptIn(ExperimentalUnicodeApi::class)` 注解或 `-opt-in=kotlin.text.unicode.ExperimentalUnicodeApi` 编译器选项来启用。

有关更多信息，请参阅该功能的 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/stdlib/KEEP-0400-unicode-codepoints.md)。

## Kotlin/JVM {id="kotlin-jvm"}
<secondary-label ref="jvm"/>

从 Kotlin %kotlinEapVersion% 开始，编译器可以生成包含 Java 28 字节码的类。

## Kotlin/Native {id="kotlin-native"}

Kotlin %kotlinEapVersion% 将 Swift 导出提升至 Beta 阶段，并配备了新的 Gradle DSL。

### Swift 导出进入 Beta 阶段并配备新 Gradle DSL {id="swift-export-goes-beta-with-a-new-gradle-dsl"}

<primary-label ref="beta"/>
<secondary-label ref="native"/>

在 Kotlin %kotlinEapVersion% 中，Swift 导出晋级为 [Beta](components-stability.md#stability-levels-explained)，并获得了更符合人体工程学的 Gradle DSL。新 DSL 减少了重复并提高了配置复用率，使将 Kotlin 代码公开给 Swift 变得更加轻松。

主要变更如下：

| 功能 | 变更前 | 变更后 |
|---|---|---|
| 入口点 | `swiftExport {}` | `export { swift {} }` |
| 折叠规则属性 | `flattenPackage = "com.example.sandbox"` | `rootPackage = "com.example.sandbox"` |
| 导出已声明的依赖项 | `export(project(":subproject")) {}` | 自动导出；无需显式 `export()` |
| 覆盖依赖项配置 | `export(libs.utils) {}` | `xcodeIntegration { configure(libs.utils) {} }` |
| 编译器实参 | `configure { freeCompilerArgs.add("-Xexpect-actual-classes") }` | 已移除 |

以下是使用新 Swift 导出 DSL 的完整构建配置：

```kotlin
// subproject/build.gradle.kts
kotlin {

    iosArm64()
    iosSimulatorArm64()

    // 当将 ":subproject" 作为 ":shared" 的依赖项导出时，
    // 将使用此配置
    export {
        swift {
            // 设置根模块名称
            moduleName = "Subproject"

            // 设置折叠规则
            // 从生成的 Swift 代码中移除包前缀
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
            // 从生成的 Swift 代码中移除包前缀
            rootPackage = "com.example.sandbox"

            // 启用此模块的 Xcode 集成
            xcodeIntegration {
                // 配置外部模块导出
                configure(libs.utils) {
                    // 可选：覆盖导出的模块名称
                    moduleName = "Utils"
                    // 可选：覆盖导出依赖项的折叠规则
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

此外，Swift 导出配置现已支持发布：如果库作者提供了选项覆盖，Gradle 会在 Swift 导出期间自动获取并应用它们。

如果您遇到任何问题，请在 [YouTrack](https://kotl.in/issue) 中报告，或[获取邀请](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up?_gl=1*ju6cbn*_ga*MTA3MTk5NDkzMC4xNjQ2MDY3MDU4*_ga_9J976DJZ68*MTY1ODMzNzA3OS4xMDAuMS4xNjU4MzQwODEwLjYw)加入 [#swift-export](https://kotlinlang.slack.com/archives/C073GUW6WN9) Slack 频道。

## Kotlin Multiplatform {id="kotlin-multiplatform"}

Kotlin %kotlinEapVersion% 引入了面向 Kotlin Multiplatform 的新实验性编译方案，以及一种能够显著缩减已发布多平台库大小的新发布格式。

### 面向 Kotlin Multiplatform 的新实验性编译方案 {id="new-experimental-compilation-scheme-for-kotlin-multiplatform"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="multiplatform"/>

Kotlin %kotlinEapVersion% 引入了面向 Kotlin Multiplatform (KMP) 的新实验性编译方案，使编译器在处理通用源集时与 IDE 更加一致。这一变更防止了通用代码意外解析到平台专用声明，提升了重载解析与类型推断的一致性，并使我们能够为通用源集实现增量编译。欲详细了解 KMP 分离编译及试用方法，请参阅我们的[博客文章](https://blog.jetbrains.com/kotlin/2026/09/a-more-reliable-compilation-scheme-for-kotlin-multiplatform-modules/)。

### Kotlin Multiplatform 库的新发布格式 {id="new-publication-format-for-kotlin-multiplatform-libraries"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="multiplatform"/>

Kotlin %kotlinEapVersion% 引入了面向 Kotlin Multiplatform 库的新发布格式，显著减小了已发布库的大小。新格式将平台构件（JVM 和 Android 除外）发布为单个 `.kar` 归档文件，这是一个额外使用 XZ 压缩的 ZIP 归档文件。

此变更解决了 Maven Central 最近引入的[发布大小限制](https://central.sonatype.org/publish/maven-central-publishing-limits/)问题。采用新格式后，添加新目标平台不再生成新文件，因此发布大小不会大幅增加。在某些情况下，总体发布甚至比之前仅支持单个目标平台时还要小。例如，对于 [cryptography-kotlin](https://github.com/whyoleg/cryptography-kotlin) 库，整个多模块项目的发布构件集从 7539 个文件和 91 MB 减少到了 1036 个文件和 23 MB。

要为特定模块启用新格式，请在该模块的构建脚本中进行配置：

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

尽管以新格式发布仍处于[实验性阶段](components-stability.md#stability-levels-explained)，但所有项目现已支持使用此类构件。此变更仅与库作者相关，不会影响最终应用程序的开发者。

请在 [YouTrack](https://kotl.in/issue) 中分享您的反馈并报告任何问题。

## Kotlin/JS {id="kotlin-js"}
<secondary-label ref="js"/>

Kotlin %kotlinEapVersion% 为 Kotlin/JS 编译器和 Gradle 插件添加了 `es2020` 目标平台。此前仅支持 `es5` 和 `es2015` 目标平台，且对较新 JavaScript 功能（例如 `BigInt`）的支持必须在以 ES2015 为目标平台时单独启用。通过以 ES2020 为目标平台，您可以直接使用直至 ECMAScript 2020 为止的所有受支持 JavaScript 功能（包括 `BigInt`），而无需任何额外配置。

要启用新目标平台，请在 `compilerOptions {}` 块中将 `target` 设置为 `es2020`：

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

Kotlin %kotlinEapVersion% 进一步改进了 `klib` 编译期间的函数内联，并提升了类型推断性能。

### klib 编译期间一致的跨模块函数内联 {id="consistent-cross-module-function-inlining-during-klib-compilation"}

<secondary-label ref="compiler"/>

Kotlin 2.4.0 在 `klib` 编译期间启用了 [Kotlin/Native、Kotlin/JS 和 Kotlin/Wasm 上一致的模块内函数内联](whatsnew24.md#consistent-intra-module-function-inlining-during-klib-compilation)。不同 Kotlin 平台上函数内联的一致性使得提供兼容性保证变得更加容易。

Kotlin 2.4.0 还引入了在 `klib` 编译期间启用**跨模块**内联的功能，确保项目中的所有内联函数都得到一致的内联。Kotlin %kotlinEapVersion% 默认启用跨模块内联。

如果您在使用此功能时遇到非预期的问题，可以使用以下命令行编译器选项将其禁用：

```bash
-Xklib-ir-inliner=disabled
```

请在 [YouTrack](https://kotl.in/issue) 中分享您的反馈并报告任何问题。

### 改进类型推断性能 {id="improved-type-inference-performance"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="compiler"/>

Kotlin %kotlinEapVersion% 通过减少类型推断期间生成的约束数量，提升了编译器性能。此前，复杂的泛型代码可能会生成过多的约束，导致编译或 IDE 分析假死。此变更可能会影响某些极端情况下的类型推断，特别是涉及构建器推断（builder inference）或具有非寻常边界的复杂平台类型的情况。因此，编译器可能会推断出不同的类型、选择不同的重载或报告不同的诊断信息。这些差异是此项改进带来的预期结果。

该功能默认启用。要恢复之前的类型推断行为，请使用 `-XXLanguage:-EliminateSecondKindIncorporation` 选项。

欢迎在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-85879) 中提供您的反馈。

## 破坏性变更与弃用 {id="breaking-changes-and-deprecations"}

Kotlin %kotlinEapVersion% 引入了一项错误，这是将运行 Kotlin 编译器所需的最低 JDK 版本从 JDK 8 提升至 JDK 17 的下一步措施。我们提高最低 JDK 要求旨在加快开发速度，并允许编译器访问需要较新 Java 版本的新库。JDK 17 具有较长的支持周期，并有助于我们保持与较新版本 Gradle 和 Maven 的兼容性。您可以使用 `-Xallow-pre-17-runtime-jdk` 编译器选项来忽略该错误。当 JDK 17 成为强制要求时，此选项将在 Kotlin 2.5.20 或 2.6.0 中被移除。

如果您在升级项目时遇到困难，请在 [YouTrack](https://kotl.in/issue) 上分享您的体验，或直接在 Kotlin Slack 上与开发者联系。[获取邀请](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up?_gl=1*ju6cbn*_ga*MTA3MTk5NDkzMC4xNjQ2MDY3MDU4*_ga_9J976DJZ68*MTY1ODMzNzA3OS4xMDAuMS4xNjU4MzQwODEwLjYw)并加入 [#compiler](https://kotlinlang.slack.com/archives/C7L3JB43G) 频道。