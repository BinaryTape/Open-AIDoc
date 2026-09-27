[//]: # (title: Kotlin %kotlinEapVersion% 最新变化)

<primary-label ref="eap"/>

<show-structure depth="1"/>

<web-summary>阅读 Kotlin 抢先体验预览发布说明，并在最新的实验性 Kotlin 功能正式发布之前进行试用。</web-summary>

_[发布日期：%kotlinEapReleaseDate%](eap.md#build-details)_

> 本文档并未涵盖抢先体验计划 (EAP) 版本的所有功能，
> 但它重点介绍了其中的一些重大改进。
>
> 欲查看完整的更改列表，请参阅 [GitHub 变更日志](https://github.com/JetBrains/kotlin/releases/tag/v%kotlinEapVersion%)。
>
{style="note"}

Kotlin %kotlinEapVersion% 版本已发布！以下是此 EAP 版本的一些详细信息：

* **语言：** [`only-syntax` 模式下稳定的基于名称的析构](#stable-language-features)以及[新的实验性伴生扩展与伴生块](#companion-extensions-and-blocks)
* **标准库：** [用于简化 `if` 表达式常见模式的新实验性函数](#standard-library-new-functions-for-simplifying-common-patterns-with-if-expressions)
* **Kotlin/JS：** [支持 `es2020` 目标](#kotlin-js-support-for-the-es2020-target)
* **Kotlin 编译器：** [`.klib` 编译期间更加一致的内联函数行为](#consistent-cross-module-function-inlining-during-klib-compilation)<!--and a [new experimental compilation scheme for Kotlin Multiplatform]().-->

> 有关 Kotlin 发布周期的信息，请参阅 [Kotlin 发布流程](releases.md)。
>
{style="tip"}

## 更新到 Kotlin %kotlinEapVersion% {id="update-to-kotlin-kotlineapversion"}

最新版本的 Kotlin 已包含在最新版本的 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/) 和 [Android Studio](https://developer.android.com/studio) 中。

要更新到新的 Kotlin 版本，请确保您的 IDE 已更新至最新版本，并在您的构建脚本中将 [Kotlin 版本更改](releases.md#update-to-a-new-kotlin-version)为 %kotlinEapVersion%。

## 语言 {id="language"}

Kotlin %kotlinEapVersion% 稳定了早期版本中引入的两项语言功能。它还引入了实验性的伴生扩展与伴生块。

### 稳定的语言功能 {id="stable-language-features"}

<secondary-label ref="language"/>

Kotlin 2.3.20 和 2.4.0 以[实验性](components-stability.md#stability-levels-explained)阶段引入了几项语言功能。我们很高兴地宣布，以下语言功能在此版本中现已达到[稳定](components-stability.md#stability-levels-explained)阶段：

* `only-syntax` 模式下的[基于名称的析构](destructuring-declarations.md#name-based-destructuring)。

  在此模式下，“旧的”析构语法 `val (x, y)` 保持其基于位置的行为，而“新的”语法 `(val x, val y)` 则执行基于名称的析构。

* [改进的编译时常量](whatsnew24.md#improved-compile-time-constants)。

### 伴生扩展与伴生块 {id="companion-extensions-and-blocks"}

<primary-label ref="experimental-opt-in"/>

<secondary-label ref="language"/>

Kotlin %kotlinEapVersion% 引入了伴生扩展和伴生块。

此前，要声明可通过类型名称访问的扩展、函数和属性，该类型需要具有伴生对象。伴生扩展和伴生块移除了此要求，使您可以：

* 通过为顶层扩展添加 `companion` 修饰符来声明伴生扩展，即使其扩展的类型没有伴生对象也是如此。
* 在类或接口内部的 `companion {}` 块中声明函数和属性，而无需创建对象实例。在支持静态成员的平台上，编译器会将这些声明生成为静态成员。因此，在 JVM 上无需使用 `@JvmStatic` 对其进行注解。

以下是一个将 `UnitX` 声明为伴生扩展并在伴生块中声明 `Zero` 的示例：

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

有关该设计的更多信息，请参阅该功能的 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0449-companions-block-extension.md)。

伴生扩展和伴生块处于[实验性](components-stability.md#stability-levels-explained)阶段。要选择启用，请在您的构建文件中添加以下编译器选项：

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

我们欢迎您在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-11968) 中提供反馈。

## 标准库：用于简化 `if` 表达式常见模式的新函数 {id="standard-library-new-functions-for-simplifying-common-patterns-with-if-expressions"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="standard-library"/>

Kotlin %kotlinEapVersion% 引入了新的标准库函数，让您可以在返回 `Boolean` 值之前对其进行检查，或根据该值返回可空结果。

此前，这些模式需要带有 `else` 分支的显式 `if` 表达式。现在，您可以使用以下函数对其进行简化：

* `onTrue()`：当 `Boolean` 值为 `true` 时运行指定的代码块，并返回原始的布尔值。
* `onFalse()`：当 `Boolean` 值为 `false` 时运行指定的代码块，并返回原始的布尔值。
* `ifOrNull()`：当 `Boolean` 值为 `true` 时运行指定的代码块并返回其结果。如果该值为 `false`，则该函数不运行代码块并返回 `null`。

这些函数处于[实验性](components-stability.md#stability-levels-explained)阶段，需要使用 `@OptIn(ExperimentalStdlibApi::class)` 注解或 `-opt-in=kotlin.ExperimentalStdlibApi` 编译器选项进行显式启用。

示例如下：

```kotlin
@OptIn(ExperimentalStdlibApi::class)
fun main() {
    val tags = mutableSetOf("kotlin", "jvm")

    // 当 add() 返回 true 时，使用 onTrue() 函数输出一条消息
    val added = tags.add("wasm").onTrue {
        println("Tag added")
    }
    println(added)
    // Tag added
    // true

    // 当 remove() 返回 false 时，使用 onFalse() 函数输出一条消息
    val removed = tags.remove("native").onFalse {
        println("Tag not found")
    }
    println(removed)
    // Tag not found
    // false

    // 当 tags 中包含 "wasm" 时，使用 ifOrNull() 函数返回一条消息
    val message = ifOrNull("wasm" in tags) {
        "Wasm tag is available"
    }
    println(message)
    // Wasm tag is available
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.5.0-Beta1" validate="false"}

我们欢迎您在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-6938) 中提供反馈。

## Kotlin/JS：支持 `es2020` 目标 {id="kotlin-js-support-for-the-es2020-target"}
<secondary-label ref="js"/>

Kotlin %kotlinEapVersion% 在 Kotlin/JS 编译器和 Gradle 插件中添加了 `es2020` 目标。此前，仅提供 `es5` 和 `es2015` 目标，并且对诸如 `BigInt` 等较新 JavaScript 功能的支持必须在以 ES2015 为目标时单独启用。通过以 ES2020 为目标，您无需进行额外配置即可使用截至 ECMAScript 2020 支持的所有 JavaScript 功能（包括 `BigInt`）。

要启用新目标，请在 `compilerOptions` 块中将 `target` 设置为 `es2020`：

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

Kotlin %kotlinEapVersion% 为 `.klib` 编译期间的函数内联带来了更多改进，并引入了诸如改进类型推断性能等实验性功能<!-- and a new compilation scheme for Kotlin Multiplatform -->。

### klib 编译期间一致的跨模块函数内联 {id="consistent-cross-module-function-inlining-during-klib-compilation"}

<secondary-label ref="compiler"/>

Kotlin 2.4.0 在 `.klib` 编译期间启用了 [Kotlin/Native、Kotlin/JS 和 Kotlin/Wasm 上一致的模块内函数内联](whatsnew24.md#consistent-intra-module-function-inlining-during-klib-compilation)。跨不同 Kotlin 平台的一致函数内联让提供兼容性保证变得更加容易。

Kotlin 2.4.0 还引入了在 `.klib` 编译期间启用**跨模块**内联的可能性，以确保项目中的所有内联函数都得到一致的内联。Kotlin %kotlinEapVersion% 默认启用了跨模块内联。

如果您在使用此功能时遇到非预期问题，可以使用以下命令行编译器选项将其禁用：

```bash
-Xklib-ir-inliner=disabled
```

请在 [YouTrack](https://kotl.in/issue) 中分享您的反馈并报告任何问题。

### 改进的类型推断性能 {id="improved-type-inference-performance"}

<primary-label ref="experimental-opt-in"/>

<secondary-label ref="compiler"/>

Kotlin %kotlinEapVersion% 通过减少类型推断期间生成的约束数量来提高编译器性能。此前，复杂的泛型代码可能会生成过多的约束，导致编译或 IDE 分析挂起。这一更改可能会影响某些极端情况下的类型推断，特别是涉及构建器推断（builder inference）或具有非寻常边界的复杂平台类型的情况。因此，编译器可能会推断出不同的类型、选择不同的重载或报告不同的诊断信息。这些差异可能是该项改进的预期结果。

该功能默认启用。要恢复先前的类型推断行为，请使用 `-XXLanguage:-EliminateSecondKindIncorporation` 选项。

我们欢迎您在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-85879) 中提供反馈。

<!--
### New experimental compilation scheme for Kotlin Multiplatform {id="new-experimental-compilation-scheme-for-kotlin-multiplatform"}

<primary-label ref="experimental-opt-in"/>

<secondary-label ref="compiler"/>

Kotlin %kotlinEapVersion% introduces a new experimental compilation scheme for Kotlin Multiplatform (KMP) that makes the
compiler handle common source sets more consistently with the IDE. This change prevents common code from accidentally
resolving to platform-specific declarations, improves consistency in overload resolution and type inference, and enables
incremental compilation for common source sets. Learn more about KMP separate compilation and how to try it in our [blog post](TBD).
-->

## 破坏性变更与弃用 {id="breaking-changes-and-deprecations"}

Kotlin %kotlinEapVersion% 引入了一项警告，作为将运行 Kotlin 编译器所需的最低 JDK 版本从 JDK 8 提升到 JDK 17 的第一步。我们提升最低所需 JDK 是为了加快开发速度，并使编译器能够访问需要更新 Java 版本的新库。JDK 17 具有较长的支持周期，并有助于我们保持与较新版本的 Gradle 和 Maven 的兼容性。可以使用 `-Xallow-pre-17-runtime-jdk` 编译器选项禁用该警告。当 JDK 17 成为强制要求时，此选项将在 Kotlin 2.5.20 或 2.6.0 中移除。

如果您在升级项目时遇到困难，请在 [YouTrack](https://kotl.in/issue) 上分享您的经验，或直接在 Kotlin Slack 上与开发者联系。[获取邀请](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up?_gl=1*ju6cbn*_ga*MTA3MTk5NDkzMC4xNjQ2MDY3MDU4*_ga_9J976DJZ68*MTY1ODMzNzA3OS4xMDAuMS4xNjU4MzQwODEwLjYw)并加入 [#compiler](https://kotlinlang.slack.com/archives/C7L3JB43G) 频道。