[//]: # (title: Kotlin 组件的稳定性)

Kotlin 语言和工具集被划分为许多组件，例如适用于 JVM、JS 和 Native 目标的编译器、标准库、各种随附工具等。
其中许多组件已正式发布为 **Stable**，这意味着它们遵循 [“顺畅更新”和“保持语言现代化”的原则](kotlin-evolution-principles.md)，以向后兼容的方式进行演进。

遵循“反馈循环”原则，我们会尽早发布许多内容供社区试用，因此一些组件尚未发布为 **Stable**。
其中一些处于非常早期的阶段，另一些则更为成熟。
我们会根据每个组件的演进速度以及用户采用时承担的风险级别，将其标记为 **Experimental**、**Alpha** 或 **Beta**。

## 稳定性级别说明

以下是这些稳定性级别及其含义的快速指南：

**Experimental** 意味着“仅在玩具项目中使用”：
* 我们只是在测试一个想法及其可行性。我们希望一些用户试用并分享他们的反馈。范围极小，该功能可能随时更改或消失。我们不保证稳定性或兼容性。

**Alpha** 意味着“我们正在测试这是否应该达到生产就绪状态”：
* 我们打算将此想法转化为产品，并正在验证其用户价值和市场契合度，以塑造其最终形态。功能集仍不完整，预计会发生破坏性变更。如果假设不成立，我们可能会大幅更改或停止该功能。

**Beta** 意味着“你可以使用它，我们将尽力为你减少迁移问题”：
* 它已接近完成，此时用户的反馈尤为重要。
* 尽管如此，它尚未 100% 完成，因此可能会发生更改（包括基于你自己的反馈进行的更改）。
* 请提前留意弃用警告，以获得最佳更新体验。

我们将 *Experimental*、*Alpha* 和 *Beta* 统称为 **pre-stable** 级别。

<a name="stable"/>

**Stable** 意味着“即使在最保守的场景中也可以使用”：
* It's done. 我们将根据严格的 [向后兼容规则](https://kotlinfoundation.org/language-committee-guidelines/) 对其进行演进。

请注意，稳定性级别并不代表组件多久会发布为 Stable。同样，它们也不指示组件在发布前会进行多少改动。它们仅说明组件的变化速度以及用户面临更新问题的风险程度。

## Kotlin 组件的 GitHub 徽章

[Kotlin GitHub 组织](https://github.com/Kotlin) 托管着不同的 Kotlin 相关项目。
其中一些项目由我们全职开发，而另一些则是业余项目。

每个 Kotlin 项目都有两个描述其稳定性和支持状态的 GitHub 徽章：

* **Stability** 状态。这显示了每个项目的演进速度以及用户在采用时承担的风险程度。
  该稳定性状态与 [Kotlin 语言功能及其组件的稳定性级别](#stability-levels-explained) 完全一致：
    * ![Experimental stability level](https://kotl.in/badges/experimental.svg){type="joined"} 代表 **Experimental**
    * ![Alpha stability level](https://kotl.in/badges/alpha.svg){type="joined"} 代表 **Alpha**
    * ![Beta stability level](https://kotl.in/badges/beta.svg){type="joined"} 代表 **Beta**
    * ![Stable stability level](https://kotl.in/badges/stable.svg){type="joined"} 代表 **Stable**

* **Support** 状态。这显示了我们维护项目并帮助用户解决问题的承诺。
  所有 JetBrains 产品的支持级别是统一的。  
  [详情请参阅 JetBrains 开源文档](https://github.com/JetBrains#jetbrains-on-github)。

## 子组件的稳定性

一个稳定的组件可能包含一个实验性的子组件，例如：
* 稳定的编译器可能包含实验性功能；
* 稳定的 API 可能包含实验性的类或函数；
* 稳定的命令行工具可能包含实验性选项。

我们确保准确记录哪些子组件不是 **Stable**。
我们还尽力在可能的情况下提醒用户，并要求显式启用 (opt-in) 它们，以避免意外使用尚未发布为稳定的功能。

## Kotlin 组件的当前稳定性

> 默认情况下，所有新组件的状态均为 Experimental。
>
{style="note"}

### Kotlin 编译器

| **组件**                                                            | **状态** | **自该版本起的状态** | **备注** |
|-------------------------------------------------------------------|--------|--------------|--------|
| Kotlin/JVM                                                        | Stable | 1.0.0        |        |
| Kotlin/Native                                                     | Stable | 1.9.0        |        |
| Kotlin/JS                                                         | Stable | 1.3.0        |        |
| Kotlin/Wasm                                                       | Beta   | 2.2.20       |        |
| [Analysis API](https://kotlin.github.io/analysis-api/index_md.html) | Stable |              |        |

### 核心编译器插件

| **组件**                                         | **状态**         | **自该版本起的状态** | **备注** |
|------------------------------------------------|----------------|--------------|--------|
| [All-open](all-open-plugin.md)                 | Stable         | 1.3.0        |        |
| [No-arg](no-arg-plugin.md)                     | Stable         | 1.3.0        |        |
| [SAM-with-receiver](sam-with-receiver-plugin.md) | Stable         | 1.3.0        |        |
| [kapt](kapt.md)                                | Stable         | 1.3.0        |        |
| [Lombok](lombok.md)                            | Alpha          | 2.3.20       |        |
| [Power-assert](power-assert.md)                | Experimental   | 2.0.0        |        |

### Kotlin 库

| **组件**                        | **状态** | **自该版本起的状态** | **备注** |
|-------------------------------|--------|--------------|--------|
| kotlin-stdlib (JVM)           | Stable | 1.0.0        |        |
| kotlinx-coroutines            | Stable | 1.3.0        |        |
| kotlinx-serialization         | Stable | 1.0.0        |        |
| kotlin-metadata-jvm           | Stable | 2.0.0        |        |
| kotlin-reflect (JVM)          | Beta   | 1.0.0        |        |
| kotlinx-datetime              | Alpha  | 0.2.0        |        |
| kotlinx-io                    | Alpha  | 0.2.0        |        |
| kotlinx-collections-immutable | Alpha  | 0.3.5        |        |

### Kotlin Multiplatform

| **组件**                                       | **状态** | **自该版本起的状态** | **备注**                                                                                                                             |
|----------------------------------------------|--------|--------------|------------------------------------------------------------------------------------------------------------------------------------|
| Kotlin Multiplatform                         | Stable | 1.9.20       |                                                                                                                                    |
| 用于 Android Studio 的 Kotlin Multiplatform 插件 | Beta   | 0.8.0        | [版本与语言版本分开更新](https://kotlinlang.org/docs/multiplatform/multiplatform-plugin-releases.html) |

### Kotlin/Native

| **组件**                                     | **状态** | **自该版本起的状态** | **备注**                                                                                                                       |
|--------------------------------------------|--------|--------------|------------------------------------------------------------------------------------------------------------------------------|
| Kotlin/Native 运行时                        | Stable | 1.9.20       |                                                                                                                              |
| Kotlin/Native 与 C 和 Objective-C 的互操作性 | Beta   | 1.3.0        | [C 和 Objective-C 库导入的稳定性](native-lib-import-stability.md#stability-of-c-and-objective-c-library-import) |
| klib 二进制文件                                | Stable | 1.9.20       | 不包括 cinterop klib，见下文                                                                                                         |
| cinterop klib 二进制文件                       | Beta   | 1.3.0        | [C 和 Objective-C 库导入的稳定性](native-lib-import-stability.md#stability-of-c-and-objective-c-library-import) |
| CocoaPods 集成                               | Stable | 1.9.20       |                                                                                                                              |

有关不同目标支持级别的更多信息，请参阅 [](native-target-support.md)。

### 构建工具

| **组件**                                            | **状态** | **自该版本起的状态** | **备注**                                                                                                                                                           |
|---------------------------------------------------|--------|--------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Kotlin Gradle 插件](gradle-configure-project.md)   | Stable | 1.1.1        | [Kotlin Multiplatform Gradle 插件](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#id-and-version) 自 Kotlin 1.9.20 起已稳定。 |
| [Kotlin Maven 插件](maven-configure-project.md)     | Stable | 1.0.0        |                                                                                                                                                                  |

### 语言工具

| **组件**                      | **状态**         | **自该版本起的状态** | **备注**                                |
|-----------------------------|----------------|--------------|---------------------------------------|
| 脚本语法和语义                     | Alpha          | 1.2.0        |                                       |
| 脚本嵌入和扩展 API                 | Beta           | 1.5.0        |                                       |
| 脚本 IDE 支持                   | Beta           |              | 适用于 IntelliJ IDEA 2023.1 及更高版本 |
| CLI 脚本                      | Alpha          | 1.2.0        |                                       |

## 语言功能和设计提案

有关语言功能和新设计提案，请参阅 [](kotlin-language-features-and-proposals.md)。