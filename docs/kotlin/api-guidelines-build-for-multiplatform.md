[//]: # (title: 构建面向多平台的 Kotlin 库)

在创建 Kotlin 库时，请考虑在构建和[发布时支持 Kotlin Multiplatform](https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-publish-lib-setup.html)。
这可以扩大库的目标受众，使其与针对多个平台的项目兼容。

> 您可以在 [klibs.io](https://klibs.io/) 上找到适用于不同用例和目标平台且已有的 Kotlin Multiplatform 库。
> 
{style="tip"}

以下章节提供了帮助您有效构建 Kotlin Multiplatform 库的指南。

## 扩大覆盖范围

为了让您的库作为依赖项可供尽可能多的项目使用，请力求支持尽可能多的 Kotlin Multiplatform [目标平台](https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-dsl-reference.html#targets)。

如果您的库不支持多平台项目（无论是库还是应用）所使用的平台，那么该项目就很难依赖您的库。在这种情况下，项目可能在某些平台使用您的库，而在其他平台则需要实现单独的解决方案，或者干脆选择另一个支持其所有平台的替代库。

为了简化构建工件的生产，请使用[交叉编译](https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-publish-lib-setup.html#host-requirements)从任何主机发布 Kotlin Multiplatform 库。这允许您在没有 Apple 机器的情况下为 Apple 目标生成 `.klib` 构建工件。

> 对于 Kotlin/Native 目标，请考虑使用[分层方法](native-target-support.md#for-library-authors)来支持所有可能的目标。
>
{style="note"}

## 为公共代码设计 API

在创建库时，请将 API 设计为可从公共 Kotlin 代码中使用，而不是编写特定于平台的实现。

在可能的情况下提供合理的默认配置，并包含特定于平台的配置选项。良好的默认值允许用户从公共 Kotlin 代码中使用库的 API，而无需编写特定于平台的实现来配置库。

按照以下优先级将 API 放置在最广泛相关的源集中：

*   **`commonMain` 源集：** `commonMain` 源集中的 API 可用于库支持的所有平台。力求将库的大部分 API 放在这里。
*   **中间源集：** 如果某些平台不支持某些 API，请使用[中间源集](https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-discover-project.html#intermediate-source-sets)来针对特定平台。例如，您可以为支持多线程的目标创建 `concurrent` 源集，或者为所有非 JVM 目标创建 `nonJvm` 源集。
*   **特定于平台的源集：** 对于特定于平台的 API，请使用 `androidMain` 等源集。

> 要了解有关 Kotlin Multiplatform 项目源集的更多信息，请参阅[分层项目结构](https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-hierarchy.html)。
>
{style="tip"}

## 确保跨平台行为一致

为了确保您的库在所有支持的平台上表现一致，多平台库中的 API 在所有平台上应接受相同范围的有效输入、执行相同的操作并返回相同的结果。同样，库应统一处理无效输入，并在所有平台上一致地报告错误或抛出异常。

不一致的行为会使库难以使用，并迫使用户在公共代码中添加条件逻辑来管理特定于平台的差异。

您可以使用 [`expect` 和 `actual` 声明](https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-expect-actual.html)在公共代码中声明函数，并提供特定于平台的实现，这些实现可以完全访问每个平台的原生 API。这些实现也必须具有相同的行为，以确保可以从公共代码可靠地使用它们。

当 API 在各平台间的行为一致时，它们只需在 `commonMain` 源集中记录一次。

> 如果平台差异无法避免（例如当一个平台支持更广泛的输入集时），请尽可能减少差异。例如，您可能不想为了匹配其他平台而限制某个平台的功能。在这种情况下，请清晰地记录这些具体差异。
>
> {style="note"}

## 在所有平台上进行测试

多平台库可以在公共代码中编写[多平台测试](https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-run-tests.html)，并在所有平台上运行。在支持的平台上定期执行此公共测试套件可以确保库的行为正确且一致。

在所有发布的平台上定期测试 Kotlin/Native 目标可能具有挑战性。但是，为了确保更广泛的兼容性，请考虑为库支持的所有目标发布该库，并在测试兼容性时使用[分层方法](native-target-support.md#for-library-authors)。

使用 [`kotlin-test`](https://kotlinlang.org/api/latest/kotlin.test/) 库在公共代码中编写测试，并使用特定于平台的测试运行程序执行它们。

## 考虑非 Kotlin 用户

Kotlin Multiplatform 在其支持的目标平台上提供与原生 API 和语言的互操作性。在创建 Kotlin Multiplatform 库时，请考虑用户是否可能需要从 Kotlin 以外的语言使用库的类型和声明。

例如，如果库中的某些类型将通过互操作性暴露给 Swift 代码，请将这些类型设计为易于从 Swift 访问。[Kotlin-Swift interopedia](https://github.com/kotlin-hands-on/kotlin-swift-interopedia) 提供了有关从 Swift 调用 Kotlin API 时 API 外观的有用见解。

## 推广您的库

您的库可以在 [klibs.io](https://klibs.io/) 上展示，这是一个让开发者发现和评估 Kotlin Multiplatform 库的搜索平台。

[klibs.io](https://klibs.io/) 会自动列出符合其列出标准的库。要检查您的库是否符合资格，请参阅[常见问题解答](https://klibs.io/faq)。