[//]: # (title: Kotlin Multiplatform 项目结构基础)

借助 Kotlin Multiplatform，你可以在不同平台之间共享代码。本文将介绍共享代码的约束条件、如何区分代码中的共享部分和平台特化部分，以及如何指定该共享代码适用的平台。

你还将学习 Kotlin Multiplatform 项目设置的核心概念，例如公共代码、目标、平台特化源集和中间源集，以及测试集成。这将有助于你日后配置自己的多平台项目。

与 Kotlin 实际使用的模型相比，此处介绍的模型经过了简化。不过，这个基础模型对于绝大多数情况来说已经足够。

## 公共代码 {id="common-code"}

*公共代码*（Common code）是在不同平台之间共享的 Kotlin 代码。

以简单的 "Hello, World" 为例：

```kotlin
fun greeting() {
    println("Hello, Kotlin Multiplatform!")
}
```

在各平台间共享的 Kotlin 代码通常位于 `commonMain` 目录中。代码文件的位置非常重要，因为它会影响该代码要编译到的平台列表。

Kotlin 编译器将源代码作为输入，并最终生成一组平台特化的二进制文件。在编译多平台项目时，它可以从相同的代码生成多个二进制文件。例如，编译器可以从同一个 Kotlin 文件生成 JVM `.class` 文件和原生可执行文件：

![公共代码](common-code-diagram.svg){width=700}

并非每段 Kotlin 代码都可以编译到所有平台。如果公共代码中的某些平台特化函数或类无法编译到其他平台，Kotlin 编译器会阻止你在公共代码中使用它们。

例如，你无法在公共代码中使用 `java.io.File` 依赖项。它是 JDK 的一部分，而公共代码还会编译为原生代码，其中并不提供 JDK 类：

![未解析的 Java 引用](unresolved-java-reference.png){width=500}

在公共代码中，你可以使用 Kotlin Multiplatform 库。这些库提供了在不同平台上可以有不同实现的通用 API。在这种情况下，平台特有的 API 将作为额外部分存在，若尝试在公共代码中使用此类 API 会导致报错。

例如，`kotlinx.coroutines` 是一个支持所有目标的 Kotlin Multiplatform 库，但它也包含将 `kotlinx.coroutines` 并发原语转换为 JDK 并发原语的平台特化部分，如 `fun CoroutinesDispatcher.asExecutor(): Executor`。这部分附加 API 在 `commonMain` 中是不可用的。

如需探索可用的 Kotlin Multiplatform 库，请参阅 [klibs.io](https://klibs.io)。

## 目标 {id="targets"}

目标（Targets）定义了 Kotlin 将公共代码编译到的平台。例如，它们可以是 JVM、JS、Android、iOS 或 Linux。前文示例就是将公共代码编译到了 JVM 和原生目标。

*Kotlin 目标*是用于描述编译目标的标识符。它定义了生成的二进制文件格式、可用的语言构造以及允许的依赖项。

> 目标也可以称为平台。请查看
> [受支持目标的完整列表](multiplatform-dsl-reference.md#targets)。
>
{style="note"}

你需要首先*声明*一个目标，以指示 Kotlin 针对该特定目标编译代码。在 Gradle 中，你可以在 `kotlin {}` 块内使用预定义的 DSL 调用来声明目标：

```kotlin
kotlin {
    jvm() // 声明一个 JVM 目标
    iosArm64() // 声明一个对应于 64 位 iPhone 的目标
}
```

通过这种方式，每个多平台项目都定义了一组受支持的目标。请参阅[分层项目结构](multiplatform-hierarchy.md)部分，详细了解如何在构建脚本中声明目标。

声明 `jvm` 和 `iosArm64` 目标后，`commonMain` 中的公共代码将被编译到这些目标：

![目标](target-diagram.svg){width=700}

要了解哪些代码会被编译到特定目标，你可以将目标视为附加到 Kotlin 源文件上的标签。Kotlin 会使用这些标签来确定如何编译代码、生成哪些二进制文件，以及在该代码中允许使用哪些语言构造和依赖项。

> 如果你的项目只有一个目标（例如 JVM），
> 你可以在公共代码中以适当的可见性访问该目标特有的符号。
> 但是，一旦添加了第二个目标，
> 这些特定于目标的符号就会在公共代码中变得不可用。
> 在迁移和其他过渡性项目状态期间，请谨记这一限制。
> 
{style="note"}

如果你还想将 `greeting.kt` 文件编译为 `.js`，只需声明 JS 目标即可。随后，`commonMain` 中的代码将获得与 JS 目标相对应的一个额外 `js` 标签，该标签会指示 Kotlin 生成 `.js` 文件：

![目标标签](target-labels-diagram.svg){width=700}

这就是 Kotlin 编译器处理编译到所有已声明目标的公共代码的方式。
请参阅[源集](#源集)以了解如何编写平台特化代码。

## 源集 {id="source-sets"}

*Gradle 源集*是拥有自己的目标、依赖项和编译器选项的源文件集合。它是多平台项目中共享代码的主要方式。

多平台项目中的每个源集：

* 具有在当前项目中唯一的名称。
* 包含一组源文件和资源，通常存储在以该源集名称命名的目录中。
* 指定该源集中的代码所编译到的一组目标。这些目标会影响该源集中可用的语言构造和依赖项。
* 定义其自身的依赖项和编译器选项。

Kotlin Multiplatform 提供了许多预定义的源集。其中之一是 `commonMain`，它存在于所有多平台项目中，并会编译到所有已声明的目标。

在 Kotlin Multiplatform 项目中，你可以像对待 `src` 内的目录一样与源集进行交互。
例如，包含 `commonMain`、`iosMain` 和 `androidMain` 源集的 `shared` 模块具有以下结构：

![共享源](src-directory-diagram.png){width=350}

当 shared 模块被构建为 Android 库时，公共 Kotlin 代码将被视为 Kotlin/JVM。
当它被构建为 iOS 框架时，公共 Kotlin 则会被视为 Kotlin/Native：

![公共 Kotlin、Kotlin/JVM 和 Kotlin/Native](modules-structure.png)

在 Gradle 脚本中，你可以在 `kotlin.sourceSets {}` 块内按名称访问源集：

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

除 `commonMain` 外，其他源集既可以是平台特化的，也可以是中间的。

### 平台特化源集 {id="platform-specific-source-sets"}

虽然仅使用公共代码非常方便，但并不总是可行的。`commonMain` 中的代码会编译到所有已声明的目标，Kotlin 不允许你在其中使用任何平台特有的 API。

在同时包含原生目标和 JS 目标的多平台项目中，`commonMain` 中的以下代码将无法编译：

```kotlin
// commonMain/kotlin/common.kt
// 无法在公共代码中编译
fun greeting() {
    java.io.File("greeting.txt").writeText("Hello, Multiplatform!")
}
```

为了解决这一问题，Kotlin 创建了平台特化源集，也称为平台源集。每个目标都有一个对应的平台源集，该源集仅针对该目标进行编译。例如，`jvm` 目标具有对应的 `jvmMain` 源集，该源集仅编译到 JVM。Kotlin 允许在这些源集中使用特定于平台的依赖项，例如在 `jvmMain` 中使用 JDK：

```kotlin
// jvmMain/kotlin/jvm.kt
// 你可以在 `jvmMain` 源集中使用 Java 依赖项
fun jvmGreeting() {
    java.io.File("greeting.txt").writeText("Hello, Multiplatform!")
}
```

### 编译到特定目标 {id="compilation-to-a-specific-target"}

编译到特定目标需要借助多个源集协作完成。当 Kotlin 将多平台项目编译到特定目标时，它会收集所有带有该目标标签的源集，并根据它们生成二进制文件。

以包含 `jvm`、`iosArm64` 和 `js` 目标的示例为例。Kotlin 会为公共代码创建 `commonMain` 源集，并为特定目标创建对应的 `jvmMain`、`iosArm64Main` 和 `jsMain` 源集：

![编译到特定目标](specific-target-diagram.svg){width=700}

在编译到 JVM 的过程中，Kotlin 会选择所有标记有 "JVM" 的源集，即 `jvmMain` 和 `commonMain`。然后将它们一同编译为 JVM 类文件：

![编译到 JVM](compilation-jvm-diagram.svg){width=700}

由于 Kotlin 会将 `commonMain` 和 `jvmMain` 一起编译，因此生成的二进制文件将同时包含来自 `commonMain` 和 `jvmMain` 的声明。

在处理多平台项目时，请牢记：

* 如果希望 Kotlin 将代码编译到特定平台，请声明对应的目标。
* 要选择用于存储代码的目录或源文件，请先确定希望在哪些目标之间共享代码：

    * 如果代码在所有目标之间共享，则应在 `commonMain` 中声明。
    * 如果代码仅用于某一个目标，则应在该目标的平台特化源集中定义（例如 JVM 对应的 `jvmMain`）。
* 在平台特化源集中编写的代码可以访问公共源集中的声明。例如，`jvmMain` 中的代码可以使用来自 `commonMain` 的代码。但是反过来不行：`commonMain` 不能使用来自 `jvmMain` 的代码。
* 在平台特化源集中编写的代码可以使用对应的平台依赖项。例如，`jvmMain` 中的代码可以使用仅支持 Java 的库，如 [Guava](https://github.com/google/guava) 或 [Spring](https://spring.io/)。

### 中间源集 {id="intermediate-source-sets"}

简单的多平台项目通常只有公共代码和平台特化代码。
`commonMain` 源集代表在所有声明的目标之间共享的公共代码。类似 `jvmMain` 这样的平台特化源集，则代表仅编译到各自对应目标的平台特化代码。

但在实践中，你经常需要更细粒度的代码共享。

例如，你需要面向所有现代 Apple 设备以及 Android 设备：

```kotlin
kotlin {
    android()
    iosArm64()   // 64 位 iPhone 设备
    macosArm64() // 采用现代 Apple 芯片的 Mac 设备
    watchosArm64() // 现代 64 位 Apple Watch 设备
    tvosArm64()  // 现代 Apple TV 设备  
}
```

同时，你需要一个源集来添加一个为所有 Apple 设备生成 UUID 的函数：

```kotlin
import platform.Foundation.NSUUID

fun randomUuidString(): String {
    // 你希望访问特定于 Apple 的 API
    return NSUUID().UUIDString()
}
```

你无法将该函数添加到 `commonMain` 中。因为 `commonMain` 会编译到所有已声明的目标（包括 Android），但 `platform.Foundation.NSUUID` 是特定于 Apple 的 API，在 Android 上并不可用。如果你尝试在 `commonMain` 中引用 `NSUUID`，Kotlin 将会报错。

你可以将此代码复制并粘贴到每个特定于 Apple 的源集中：`iosArm64Main`、`macosArm64Main`、`watchosArm64Main` 和 `tvosArm64Main`。但不推荐这种方法，因为这样复制代码极易出错。

为了解决此问题，你可以使用*中间源集*。中间源集是指仅编译到项目中部分（而非全部）目标的 Kotlin 源集。你还可以看到中间源集被称为分层源集或简称为层次结构（hierarchies）。

Kotlin 默认会创建一些中间源集。在这个具体案例中，生成的项目结构将如下所示：

![中间源集](intermediate-source-sets-diagram.svg){width=700}

在此图中，底部的彩色色块是平台特化源集。为保持图表清晰，已省略目标标签。

`appleMain` 块是由 Kotlin 创建的中间源集，用于共享编译到特定于 Apple 的目标的代码。`appleMain` 源集仅编译到 Apple 目标。因此，Kotlin 允许在 `appleMain` 中使用特定于 Apple 的 API，你可以在此处添加 `randomUUID()` 函数。

> 请参阅[分层项目结构](multiplatform-hierarchy.md)，查看 Kotlin 默认创建和设置的所有中间源集，并了解当 Kotlin 默认未提供所需的中间源集时该如何处理。
>
{style="tip"}

在编译到特定目标期间，Kotlin 会获取标记有该目标的所有源集，包括中间源集。因此，在编译到 `iosArm64` 平台目标时，编写在 `commonMain`、`appleMain` 和 `iosArm64Main` 源集中的所有代码都会合并在一起：

![原生可执行文件](multiplatform-executables-diagram.svg){width=700}

> 某些源集没有源代码是完全正常的。例如，在 iOS 开发中，通常不需要提供仅适用于 iOS 设备而不适用于 iOS 模拟器的代码。因此 `iosArm64Main` 极少被使用。
>
{style="tip"}

#### Apple 设备和模拟器目标 {initial-collapse-state="collapsed" collapsible="true" id="apple-device-and-simulator-targets"}

使用 Kotlin Multiplatform 开发 iOS 移动应用程序时，你通常会使用 `iosMain` 源集。
虽然你可能认为它是针对 `ios` 目标的平台特化源集，但实际上并不存在单一的 `ios` 目标。大多数移动项目至少需要两个目标：

* **设备目标**用于生成可在 iOS 设备上执行的二进制文件。目前 iOS 只有一个设备目标：`iosArm64`。
* **模拟器目标**用于为你计算机上启动的 iOS 模拟器生成二进制文件。如果你使用的是搭载 Apple 芯片的 Mac 计算机，请选择 `iosSimulatorArm64` 作为模拟器目标。

如果仅声明 `iosArm64` 设备目标，你将无法在本地计算机上运行和调试应用程序与测试。

类似 `iosArm64Main` 和 `iosSimulatorArm64Main` 这样的平台特化源集通常是空的，因为用于 iOS 设备和模拟器的 Kotlin 代码通常相同。你可以仅使用 `iosMain` 中间源集在它们之间共享代码。

其他非 Mac 的 Apple 目标也是如此。例如，如果你拥有适用于 Apple TV 的 `tvosArm64` 设备目标，以及适用于 Apple 芯片设备上的 Apple TV 模拟器的 `tvosSimulatorArm64` 模拟器目标，你可以使用 `tvosMain` 中间源集来涵盖所有这些目标。

## 与测试集成 {id="integration-with-tests"}

实际项目在主要生产代码之外还需要测试。这就是为什么默认创建的所有源集都带有 `Main` 和 `Test` 后缀。`Main` 包含生产代码，而 `Test` 包含针对该代码的测试。它们之间的关联是自动建立的，测试无需额外配置即可使用 `Main` 代码提供的 API。

与 `Main` 对应的 `Test` 也是类似的源集。例如，`commonTest` 是与 `commonMain` 对应的源集，它会编译到所有已声明的目标，使你能够编写公共测试。平台特化测试源集（如 `jvmTest`）用于编写特定于平台的测试，例如特定于 JVM 的测试或需要 JVM API 的测试。

除了拥有用于编写公共测试的源集外，你还需要一个多平台测试框架。Kotlin 提供了默认的 [`kotlin.test`](https://kotlinlang.org/api/latest/kotlin.test/) 库，该库带有 `@kotlin.Test` 注解以及各种断言方法，如 `assertEquals` 和 `assertTrue`。

你可以像在各自源集中编写各平台的常规测试一样编写平台特化测试。与主代码类似，你可以为每个源集引入平台特有的依赖项，例如用于 JVM 的 `JUnit` 和用于 iOS 的 `XCTest`。要运行特定目标的测试，请使用 `<targetName>Test` 任务。

在[测试你的多平台应用教程](multiplatform-run-tests.md)中了解如何创建和运行多平台测试。

## 后续步骤 {id="what-s-next"}

* [详细了解在 Gradle 脚本中声明和使用预定义源集](multiplatform-hierarchy.md)
* [探索多平台项目结构的高级概念](multiplatform-advanced-project-structure.md)
* [详细了解目标编译及创建自定义编译](multiplatform-configure-compilations.md)