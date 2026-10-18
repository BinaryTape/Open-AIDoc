[//]: # (title: Kotlin 组件的稳定性)

Kotlin 语言与工具集被划分为许多组件，例如针对 JVM、JS 和 Native 目标的编译器、标准库（Standard Library）、各种随附工具等。
其中许多组件已正式作为 **Stable** 发布，这意味着它们遵循[“舒适更新”和“保持语言现代”的原则](kotlin-evolution-principles.md)，以向后兼容的方式进行演进。

遵循“反馈循环 (Feedback Loop)”原则，我们会尽早发布许多内容供社区试用，因此部分组件尚未作为 **Stable** 发布。
其中一些尚处于非常早期的阶段，另一些则更加成熟。
我们根据每个组件的演化速度以及用户采用时承担的风险级别，将其标记为 **Experimental**、**Alpha** 或 **Beta**。

## 稳定性级别详解 {id="stability-levels-explained"}

以下是这些稳定性级别及其含义的速览指南：

**Experimental** 意味着“仅在玩具项目中尝试”：
* 我们仅是在测试某个想法及其可行性。我们希望部分用户进行试用并分享其反馈。其影响范围极小，且该功能可能随时发生变更或消失。我们不保证其稳定性或兼容性。

**Alpha** 意味着“我们正在测试其是否应达到生产就绪状态”：
* 我们打算将其打造为一个产品，并且正在验证其用户价值与市场契合度，以塑造其最终形态。功能集仍不完整，预计会出现破坏性变更（breaking changes）。如果假设不成立，我们可能会大幅修改或停止该功能。

**Beta** 意味着“你可以使用它，我们将尽最大努力为你减少迁移问题”：
* 它已基本完成，此时用户反馈尤为重要。
* 不过，它尚未 100% 完成，因此仍可能会有变更（包括基于你自己的反馈所做的更改）。
* 请提前关注弃用警告，以获得最佳的更新体验。

我们统称 _Experimental_、_Alpha_ 和 _Beta_ 为 **pre-stable**（稳定前）级别。

<a name="stable"/>

**Stable** 意味着“即使在最保守的场景下也可以使用”：
* 它已经完成。我们将根据严格的[向后兼容性规则](https://kotlinfoundation.org/language-committee-guidelines/)对其进行演化。

请注意，稳定性级别并不代表组件多久之后会作为 Stable 发布。同样，它们也不表示组件在正式发布前会有多大改动。它们仅表明组件的变化速度，以及用户在更新时面临发生问题的风险程度。

## Kotlin 组件的 GitHub 徽章 {id="github-badges-for-kotlin-components"}

[Kotlin GitHub 组织](https://github.com/Kotlin)托管了不同的 Kotlin 相关项目。其中一些由我们全职开发，而另一些则是附属项目。

每个 Kotlin 项目都有两个描述其稳定性和支持状态的 GitHub 徽章：

* **Stability**（稳定性）状态。展示了各个项目的演化速度，以及用户在采用该项目时承担的风险程度。稳定性状态与 [Kotlin 语言功能及其组件的稳定性级别](#stability-levels-explained)完全一致：
    * ![Experimental stability level](https://kotl.in/badges/experimental.svg){type="joined"} 代表 **Experimental**
    * ![Alpha stability level](https://kotl.in/badges/alpha.svg){type="joined"} 代表 **Alpha**
    * ![Beta stability level](https://kotl.in/badges/beta.svg){type="joined"} 代表 **Beta**
    * ![Stable stability level](https://kotl.in/badges/stable.svg){type="joined"} 代表 **Stable**

* **Support**（支持）状态。展示了我们对维护项目以及帮助用户解决问题的承诺。所有 JetBrains 产品的支持级别均是统一的。  
  [详细信息请参阅 JetBrains 开源文档](https://github.com/JetBrains#jetbrains-on-github)。

## 子组件的稳定性 {id="stability-of-subcomponents"}

一个稳定组件可能包含实验性的子组件，例如：
* 稳定的编译器可能包含实验性功能；
* 稳定的 API 可能包含实验性的类或函数；
* 稳定的命令行工具可能包含实验性选项。

我们会确保明确记录哪些子组件不是 **Stable**。我们也会尽最大努力在可能的情况下警告用户，并要求显式选择加入（opt-in），以避免意外使用尚未作为稳定版发布的功能。

## Kotlin 组件的当前稳定性 {id="current-stability-of-kotlin-components"}

> 默认情况下，所有新组件都处于 Experimental 状态。
>
{style="note"}

### Kotlin 编译器 {id="kotlin-compiler"}

| **组件**                                                            | **状态**   | **起始版本** | **备注** |
|---------------------------------------------------------------------|------------|--------------|----------|
| Kotlin/JVM                                                          | Stable     | 1.0.0        |          |
| Kotlin/Native                                                       | Stable     | 1.9.0        |          |
| Kotlin/JS                                                           | Stable     | 1.3.0        |          |
| Kotlin/Wasm                                                         | Beta       | 2.2.20       |          |
| [Analysis API](https://kotlin.github.io/analysis-api/index_md.html) | Stable     |              |          |

### 核心编译器插件 {id="core-compiler-plugins"}

| **组件**                                         | **状态**     | **起始版本** | **备注** |
|--------------------------------------------------|--------------|--------------|----------|
| [All-open](all-open-plugin.md)                   | Stable       | 1.3.0        |          |
| [No-arg](no-arg-plugin.md)                       | Stable       | 1.3.0        |          |
| [SAM-with-receiver](sam-with-receiver-plugin.md) | Stable       | 1.3.0        |          |
| [kapt](kapt.md)                                  | Stable       | 1.3.0        |          |
| [Lombok](lombok.md)                              | Alpha        | 2.3.20       |          |
| [Power-assert](power-assert.md)                  | Experimental | 2.0.0        |          |

### Kotlin 库 {id="kotlin-libraries"}

| **组件**                      | **状态** | **起始版本** | **备注** |
|-------------------------------|----------|--------------|----------|
| kotlin-stdlib (JVM)           | Stable   | 1.0.0        |          |
| kotlinx-coroutines            | Stable   | 1.3.0        |          |
| kotlinx-serialization         | Stable   | 1.0.0        |          |
| kotlin-metadata-jvm           | Stable   | 2.0.0        |          |
| kotlin-reflect (JVM)          | Beta     | 1.0.0        |          |
| kotlinx-datetime              | Alpha    | 0.2.0        |          |
| kotlinx-io                    | Alpha    | 0.2.0        |          |
| kotlinx-collections-immutable | Alpha    | 0.3.5        |          |

### Kotlin Multiplatform {id="kotlin-multiplatform"}

| **组件**                        | **状态** | **起始版本** | **备注**                                                                                                                             |
|---------------------------------|----------|--------------|--------------------------------------------------------------------------------------------------------------------------------------|
| Kotlin Multiplatform            | Stable   | 1.9.20       |                                                                                                                                      |
| Kotlin Multiplatform IDE plugin | Stable   | 0.9          | [版本与语言独立发布](https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-plugin-releases.html)                     |

### Kotlin/Native {id="kotlin-native"}

| **组件**                                     | **状态** | **起始版本** | **备注**                                                                                                                      |
|----------------------------------------------|----------|--------------|-------------------------------------------------------------------------------------------------------------------------------|
| Kotlin/Native 运行时                         | Stable   | 1.9.20       |                                                                                                                               |
| Kotlin/Native 与 C 以及 Objective-C 的互操作 | Beta     | 1.3.0        | [C 和 Objective-C 库导入的稳定性](native-lib-import-stability.md#stability-of-c-and-objective-c-library-import)              |
| klib 二进制文件                              | Stable   | 1.9.20       | 不包括 cinterop klib，参见下文                                                                                                |
| cinterop klib 二进制文件                     | Beta     | 1.3.0        | [C 和 Objective-C 库导入的稳定性](native-lib-import-stability.md#stability-of-c-and-objective-c-library-import)              |
| CocoaPods 集成                               | Stable   | 1.9.20       |                                                                                                                               |

有关不同目标支持级别的更多信息，请参阅 [](native-target-support.md)。

### 构建工具 {id="build-tools"}

| **组件**                                            | **状态** | **起始版本** | **备注**                                                                                                                                                          |
|-----------------------------------------------------|----------|--------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Kotlin Gradle 插件](gradle-configure-project.md)   | Stable   | 1.1.1        | [Kotlin Multiplatform Gradle 插件](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#id-and-version)自 Kotlin 1.9.20 起达到稳定版。     |
| [Kotlin Maven 插件](maven-configure-project.md)    | Stable   | 1.0.0        |                                                                                                                                                                   |

### Build tools API (BTA) {id="build-tools-api-bta"}

| **组件**     | **状态** | **起始版本** | **备注** |
|--------------|----------|--------------|----------|
| BTA for JVM  | Beta     | 2.4.20       |          |
| BTA for JS   | Alpha    | 2.4.20       |          |
| BTA for Wasm | Alpha    | 2.4.20       |          |

> Build tools API 目前不支持 Kotlin/Native。
> 
{style="note"}

### 语言工具 {id="language-tools"}

| **组件**                     | **状态**     | **起始版本** | **备注**                        |
|------------------------------|--------------|--------------|---------------------------------|
| 脚本语法与语义               | Alpha        | 1.2.0        |                                 |
| 脚本嵌入与扩展 API           | Beta         | 1.5.0        |                                 |
| 脚本 IDE 支持                | Beta         |              | 自 IntelliJ IDEA 2023.1 起提供  |
| CLI 脚本                     | Alpha        | 1.2.0        |                                 |

## 语言功能与设计提案 {id="language-features-and-design-proposals"}

有关语言功能和新设计提案，请参阅 [](kotlin-language-features-and-proposals.md)。