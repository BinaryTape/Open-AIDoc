---
title: API 稳定性与发布类型
---

# API 稳定性与发布类型

本页面介绍了 Koin API 的稳定性契约：如何引入新 API、如何移除旧 API，以及各类发布版本的承诺。有关各版本的变更，请参阅[版本发布与升级指南](/docs/support/releases)。

## 版本之间的兼容性 {id="compatibility-between-versions"}

Koin 旨在确保现有应用程序跨版本正常运行。Kotzilla 团队与维护者会检查新版本中的变更、改进和优化不会破坏现有代码。当 API 必须发生变更时，它会经过以下实验性与弃用步骤，以便你可以规划升级。

## 实验性 API {id="experimental-apis"}

新功能首先在 `@KoinExperimentalAPI` 注解下发布。实验性 API：

- **处于活跃开发中**：其设计尚未最终确定，可能会发生变化。
- **开放反馈**：欢迎尝试并反馈哪些功能表现良好、哪些功能存在问题，这将有助于塑造最终设计。
- **不提供保证**：根据反馈，它可能会在后续版本中更改或被移除。

在未选择加入 (opt-in) 的情况下使用实验性 API 会产生编译器警告。可以使用 Kotlin 的 `@OptIn` 选择加入：

```kotlin
@OptIn(KoinExperimentalAPI::class)
fun setupKoin() { ... }
```

选择加入可以使代码中对不稳定 API 的依赖更加显式。

## 敏感 API {id="delicate-apis"}

`@KoinDelicateAPI` 用于标记需要谨慎使用的稳定 API。它们针对特定的高级用例，错误使用可能导致运行时的意外行为。与实验性 API 一样，在通过 `@OptIn(KoinDelicateAPI::class)` 选择加入之前，它们会产生编译器警告。在选择加入之前，请先阅读相关 API 文档。

## 已弃用的 API {id="deprecated-apis"}

正在逐步淘汰的 API 会使用 Kotlin 的 `@Deprecated` 进行标记。提示信息中会说明替代方案或弃用原因。当更新较为简单时，`ReplaceWith` 可以让 IDE 自动为你应用该更改。

弃用分为两个级别：

- **Warning（警告）**：该 API 仍可正常工作，但你应该尽快替换它。
- **Error（错误）**：该 API 将无法通过编译。在升级之前，你必须替换它。

在错误级别弃用的 API 通常会在后续版本中移除。[发布说明](/docs/support/releases)列出了每个版本的弃用和移除项。

## 内部 API {id="internal-apis"}

`@KoinInternalApi` 用于标记专为 Koin 自身机制存在的函数和类。它们不是公开契约的一部分：

- **仅供内部使用**：它们服务于 Koin 的内部实现，而非应用程序代码。
- **可能会发生变更**：它们可能会在任何版本中发生更改或直接移除，恕不另行通知。

在未选择加入的情况下使用这些 API 会导致编译错误。请不要在应用程序代码中选择加入。

## 发布类型 {id="release-types"}

Koin 遵循语义化版本控制（`Major.Minor.Patch`，详见[版本、路线图与支持](/docs/support/)）。预发布版本带有表明其成熟度的后缀：

- **Alpha 和 Beta**：发布用于测试和收集反馈。它们通常包含实验性功能，并且不完全遵循稳定 API 的保证。请在非生产环境中使用它们。
- **Release Candidate (RC)**：功能完备的稳定版候选版本，处于最终测试阶段。预期它们与最终版本保持兼容，但仍有可能根据反馈进行细微调整。

## 相关内容 {id="related"}

- [版本发布与升级指南](/docs/support/releases)：每个版本中的变更、弃用和移除项。
- [版本、路线图与支持](/docs/support/)：发布周期与支持选项。
- [从 KSP 迁移到编译器插件](/docs/migration/from-ksp-to-compiler-plugin)：停用已弃用的 KSP 处理器。