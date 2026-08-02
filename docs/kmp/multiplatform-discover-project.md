[//]: # (title: Kotlin Multiplatform 项目结构基础)

通过 Kotlin Multiplatform，您可以在不同平台之间共享代码。本文将解释共享代码的约束、如何区分代码中的共享部分与平台特定部分，以及如何指定共享代码运行的平台。

您还将了解 Kotlin Multiplatform 项目设置的核心概念，例如通用代码 (common code)、目标 (targets)、平台特定源集 (platform-specific source sets) 与中间源集 (intermediate source sets) 以及测试集成。这将帮助您在未来构建自己的多平台项目。

与 Kotlin 实际使用的模型相比，这里展示的模型经过了简化。不过，这个基础模型对于大多数情况来说已经足够。

## 通用代码

“通用代码” (Common code) 是在不同平台之间共享的 Kotlin 代码。

以一个简单的 "Hello, World" 为例：

```kotlin
fun greeting() {
    println("Hello, Kotlin Multiplatform!")
}
```

在不同平台间共享的 Kotlin 代码通常位于 `commonMain` 目录中。代码文件的位置非常重要，因为它会影响该代码将被编译到的平台列表。

Kotlin 编译器将源代码作为输入，并产生一组平台特定的二进制文件作为结果。在编译多平台项目时，它可以从相同的代码生成多个二进制文件。例如，编译器可以从同一个 Kotlin 文件生成 JVM `.class` 文件和原生可执行文件：

![通用代码](common-code-diagram.svg){width=700}

并非每一段 Kotlin 代码都能编译到所有平台。如果某段代码无法编译到其他平台，Kotlin 编译器会阻止您在通用代码中使用平台特定函数或类。

例如，您不能在通用代码中使用 `java.io.File` 依赖项。它是 JDK 的一部分，而通用代码也会被编译为原生代码，而原生代码中并不提供 JDK 类：

![未解析的 Java 引用](unresolved-java-reference.png){width=500}

在通用代码中，您可以使用 Kotlin Multiplatform 库。这些库提供了通用的 API，可以在不同平台上以不同方式实现。在这种情况下，平台特定 API 作为额外部分存在，在通用代码中尝试使用此类 API 会导致错误。

例如，`kotlinx.coroutines` 是一个支持所有目标的 Kotlin Multiplatform 库，但它也有平台特定的部分，用于将 `kotlinx.coroutines` 并发原语转换为 JDK 并发原语，例如 `fun CoroutinesDispatcher.asExecutor(): Executor`。API 的这部分额外内容在 `commonMain` 中是不可用的。

要探索可用的 Kotlin Multiplatform 库，请访问 [klibs.io](https://klibs.io)。

## 目标

目标 (Targets) 定义了 Kotlin 将通用代码编译到的平台。例如，这些平台可以是 JVM、JS、Android、iOS 或 Linux。前面的示例将通用代码编译到了 JVM 和原生目标。

“Kotlin 目标” (Kotlin target) 是描述编译目标的标识符。它定义了生成的二进制文件格式、可用的语言结构以及允许的依赖项。

> 目标也可以被称为平台。请参阅[支持目标的完整列表](multiplatform-dsl-reference.md#targets)。
>
> {style="note"}

您应该首先“声明”一个目标，以指示 Kotlin 为该特定目标编译代码。在 Gradle 中，您可以在 `kotlin {}` 代码块中使用预定义的 DSL 调用来声明目标：

```kotlin
kotlin {
    jvm() // 声明一个 JVM 目标
    iosArm64() // 声明一个对应于 64 位 iPhone 的目标
}
```

通过这种方式，每个多平台项目都定义了一组支持的目标。请参阅[分层项目结构](multiplatform-hierarchy.md)部分，了解有关在构建脚本中声明目标的更多信息。

在声明了 `jvm` 和 `iosArm64` 目标后，`commonMain` 中的通用代码将被编译到这些目标：

![目标](target-diagram.svg){width=700}

为了理解哪些代码将被编译到特定目标，您可以将目标看作是附加到 Kotlin 源文件上的标签。Kotlin 使用这些标签来确定如何编译代码、生成哪些二进制文件，以及代码中允许使用哪些语言结构和依赖项。

> 如果您的项目只有一个目标（例如 JVM），您可以从通用代码中访问具有适当可见性的目标特定符号。
> 但是，一旦您添加了第二个目标，目标特定符号在通用代码中将变得不可用。
> 在迁移和其他项目中间状态期间，请记住这一限制。
> 
{style="note"}

如果您也想将 `greeting.kt` 文件编译为 `.js`，您只需声明 JS 目标。随后 `commonMain` 中的代码会获得一个额外的 `js` 标签，对应于 JS 目标，指示 Kotlin 生成 `.js` 文件：

![目标标签](target-labels-diagram.svg){width=700}

这就是 Kotlin 编译器处理编译到所有声明目标的通用代码的方式。
请参阅[源集](#源集)以了解如何编写平台特定代码。

## 源集

“Kotlin 源集” (Kotlin source set) 是一组具有自己目标、依赖项和编译器选项的源文件。它是多平台项目中共享代码的主要方式。

多平台项目中的每个源集：

* 具有在给定项目中唯一的名称。
* 包含一组源文件和资源，通常存储在以源集名称命名的目录中。
* 指定了该源集中的代码编译到的一组目标。这些目标会影响该源集中可用的语言结构和依赖项。
* 定义了自己的依赖项和编译器选项。

Kotlin 提供了一系列预定义的源集。其中之一是 `commonMain`，它存在于所有多平台项目中，并编译到所有声明的目标。

在 Kotlin Multiplatform 项目中，您可以将源集作为 `src` 内部的目录进行交互。
例如，一个包含 `commonMain`、`iosMain` 和 `jvmMain` 源集的项目具有以下结构：

![共享源代码](src-directory-diagram.png){width=350}

在 Gradle 脚本中，您可以在 `kotlin.sourceSets {}` 代码块中按名称访问源集：

```kotlin
kotlin {
    // 目标声明：
    // …

    // 源集声明：
    sourceSets {
        commonMain {
            // 配置 commonMain 源集
        }
    }
}
```

除了 `commonMain` 之外，其他源集可以是平台特定的，也可以是中间的。

### 平台特定源集

虽然仅拥有通用代码很方便，但并非总是可行。`commonMain` 中的代码会编译到所有声明的目标，而 Kotlin 不允许您在那里使用任何平台特定的 API。

在一个包含原生目标和 JS 目标的多平台项目中，`commonMain` 中的以下代码将无法编译：

```kotlin
// commonMain/kotlin/common.kt
// 在通用代码中无法编译
fun greeting() {
    java.io.File("greeting.txt").writeText("Hello, Multiplatform!")
}
```

作为解决方案，Kotlin 创建了平台特定源集，也称为平台源集。每个目标都有一个对应的平台源集，仅为该目标编译。例如，`jvm` 目标具有对应的 `jvmMain` 源集，该源集仅编译到 JVM。Kotlin 允许在这些源集中使用平台特定依赖项，例如在 `jvmMain` 中使用 JDK：

```kotlin
// jvmMain/kotlin/jvm.kt
// 您可以在 `jvmMain` 源集中使用 Java 依赖项
fun jvmGreeting() {
    java.io.File("greeting.txt").writeText("Hello, Multiplatform!")
}
```

### 编译到特定目标

编译到特定目标涉及多个源集。当 Kotlin 将多平台项目编译到特定目标时，它会收集所有标记有该目标的源集，并根据它们生成二进制文件。

以包含 `jvm`、`iosArm64` 和 `js` 目标的示例为例。Kotlin 为通用代码创建了 `commonMain` 源集，并为特定目标创建了对应的 `jvmMain`、`iosArm64Main` 和 `jsMain` 源集：

![编译到特定目标](specific-target-diagram.svg){width=700}

在编译到 JVM 的过程中，Kotlin 会选择所有标记有 "JVM" 的源集，即 `jvmMain` 和 `commonMain`。然后将它们一起编译为 JVM 类文件：

![编译到 JVM](compilation-jvm-diagram.svg){width=700}

因为 Kotlin 将 `commonMain` 和 `jvmMain` 编译在一起，所以生成的二进制文件包含来自 `commonMain` 和 `jvmMain` 的声明。

在处理多平台项目时，请记住：

* 如果您希望 Kotlin 将代码编译到特定平台，请声明相应的目标。
* 要选择存储代码的目录或源文件，请首先决定要在哪些目标之间共享代码：

    * 如果代码在所有目标之间共享，则应在 `commonMain` 中声明。
    * 如果代码仅用于一个目标，则应在该目标的平台特定源集中定义（例如，JVM 对应 `jvmMain`）。
* 在平台特定源集中编写的代码可以访问通用源集中的声明。例如，`jvmMain` 中的代码可以使用 `commonMain` 中的代码。但是，反之则不然：`commonMain` 不能使用 `jvmMain` 中的代码。
* 在平台特定源集中编写的代码可以使用相应的平台依赖项。例如，`jvmMain` 中的代码可以使用仅限 Java 的库，如 [Guava](https://github.com/google/guava) 或 [Spring](https://spring.io/)。

### 中间源集

简单的多平台项目通常只有通用代码和平台特定代码。
`commonMain` 源集代表在所有声明的目标之间共享的通用代码。平台特定源集（如 `jvmMain`）代表仅编译到相应目标的平台特定代码。

在实践中，您通常需要更细粒度的代码共享。

考虑一个您需要针对所有现代 Apple 设备和 Android 设备的情况：

```kotlin
kotlin {
    android()
    iosArm64()   // 64 位 iPhone 设备
    macosArm64() // 基于 Apple 芯片的现代 Mac
    watchosArm64() // 现代 64 位 Apple Watch 设备
    tvosArm64()  // 现代 Apple TV 设备  
}
```

并且您需要一个源集来添加一个为所有 Apple 设备生成 UUID 的函数：

```kotlin
import platform.Foundation.NSUUID

fun randomUuidString(): String {
    // 您想要访问 Apple 特定的 API
    return NSUUID().UUIDString()
}
```

您不能将此函数添加到 `commonMain`。`commonMain` 会编译到所有声明的目标，包括 Android，但 `platform.Foundation.NSUUID` 是 Apple 特定的 API，在 Android 上不可用。如果您尝试在 `commonMain` 中引用 `NSUUID`，Kotlin 会报错。

您可以将此代码复制并粘贴到每个 Apple 特定源集中：`iosArm64Main`、`macosArm64Main`、`watchosArm64Main` 和 `tvosArm64Main`。但不推荐这种方法，因为此类重复代码容易出错。

为了解决这个问题，您可以使用“中间源集” (intermediate source sets)。中间源集是一个 Kotlin 源集，它编译到项目中的部分（而非全部）目标。您也可以看到中间源集被称为分层源集 (hierarchical source sets) 或简称为层次结构 (hierarchies)。

Kotlin 默认会创建 some 中间源集。在这种特定情况下，生成的项目结构将如下所示：

![中间源集](intermediate-source-sets-diagram.svg){width=700}

在这里，底部的多色块是平台特定源集。为了清晰起见，省略了目标标签。

`appleMain` 块是 Kotlin 创建的一个中间源集，用于共享编译到 Apple 特定目标的代码。`appleMain` 源集仅编译到 Apple 目标。因此，Kotlin 允许在 `appleMain` 中使用 Apple 特定的 API，您可以在此处添加 `randomUUID()` 函数。

> 请参阅[分层项目结构](multiplatform-hierarchy.md)以查找 Kotlin 默认创建和设置的所有中间源集，并了解如果 Kotlin 默认未提供您需要的中间源集时该怎么做。
>
{style="tip"}

在编译到特定目标的过程中，Kotlin 会获取标记有该目标的所有源集，包括中间源集。因此，在编译到 `iosArm64` 平台目标时，会合并 `commonMain`、`appleMain` 和 `iosArm64Main` 源集中编写的所有代码：

![原生可执行文件](multiplatform-executables-diagram.svg){width=700}

> 某些源集没有源代码也没关系。例如，在 iOS 开发中，通常不需要提供特定于 iOS 设备但不特定于 iOS 模拟器的代码。因此 `iosArm64Main` 很少使用。
>
{style="tip"}

#### Apple 设备和模拟器目标 {initial-collapse-state="collapsed" collapsible="true"}

当您使用 Kotlin Multiplatform 开发 iOS 移动应用时，通常会使用 `iosMain` 源集。虽然您可能认为它是 `ios` 目标的平台特定源集，但实际上并没有单一的 `ios` 目标。大多数移动项目至少需要两个目标：

* **设备目标** 用于生成可在 iOS 设备上执行的二进制文件。目前 iOS 只有一个设备目标：`iosArm64`。
* **模拟器目标** 用于为在您机器上启动的 iOS 模拟器生成二进制文件。如果您使用的是 Apple 芯片 (Apple silicon) Mac 计算机，请选择 `iosSimulatorArm64` 作为模拟器目标。

如果您仅声明 `iosArm64` 设备目标，您将无法在本地机器上运行和调试应用程序及测试。

像 `iosArm64Main` 和 `iosSimulatorArm64Main` 这样的平台特定源集通常是空的，因为用于 iOS 设备和模拟器的 Kotlin 代码通常是相同的。您可以仅使用 `iosMain` 中间源集在所有这些目标之间共享代码。

这同样适用于其他非 Mac 的 Apple 目标。例如，如果您有针对 Apple TV 的 `tvosArm64` 设备目标，以及针对 Apple 芯片设备上的 Apple TV 模拟器的 `tvosSimulatorArm64` 模拟器目标，您可以为所有这些目标使用 `tvosMain` 中间源集。

## 集成测试

现实生活中的项目除了主要的生产代码外，还需要测试。这就是为什么默认创建的所有源集都有 `Main` 和 `Test` 后缀的原因。`Main` 包含生产代码，而 `Test` 包含针对该代码的测试。它们之间的连接是自动建立的，测试无需额外配置即可使用 `Main` 代码提供的 API。

对应的 `Test` 部分也是类似于 `Main` 的源集。例如，`commonTest` 是 `commonMain` 的对应源集，并编译到所有声明的目标，允许您编写通用测试。平台特定测试源集（如 `jvmTest`）用于编写平台特定测试，例如 JVM 特定测试或需要使用 JVM API 的测试。

除了拥有用于编写通用测试的源集外，您还需要一个多平台测试框架。Kotlin 提供了一个默认的 [`kotlin.test`](https://kotlinlang.org/api/latest/kotlin.test/) 库，它带有 `@kotlin.Test` 注解和各种断言方法，如 `assertEquals` 和 `assertTrue`。

您可以像针对每个平台的常规测试一样，在各自的源集中编写平台特定测试。与主代码一样，您可以为每个源集添加平台特定依赖项，例如用于 JVM 的 `JUnit` 和用于 iOS 的 `XCTest`。要运行特定目标的测试，请使用 `<targetName>Test` 任务。

在[测试您的多平台应用教程](multiplatform-run-tests.md)中了解如何创建和运行多平台测试。

## 下一步是什么？

* [详细了解如何在 Gradle 脚本中声明和使用预定义源集](multiplatform-hierarchy.md)
* [探索多平台项目结构的高级概念](multiplatform-advanced-project-structure.md)
* [详细了解目标编译和创建自定义编译](multiplatform-configure-compilations.md)