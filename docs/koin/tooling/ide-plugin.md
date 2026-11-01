---
title: IDE 插件
---

# IDE 插件

适用于 Android Studio 和 IntelliJ IDEA 的 Koin 插件可在 IDE 内展示你的 Koin 配置：显示每个定义的声明位置、使用位置以及缺失的内容。该插件由 Kotzilla 构建，可在 JetBrains Marketplace 免费获取。除下文所述的应用问题功能外，使用该插件无需依赖 Kotzilla 平台。

## 安装 {id="installation"}

你可以从 [JetBrains Marketplace](https://plugins.jetbrains.com/plugin/26131-koin-dependency-injection-official-) 安装该插件，也可以在 IDE 中安装：打开 Settings（设置），进入 Plugins（插件），选择 Marketplace，搜索“Koin”，然后重启 IDE。

该插件需要基于 IntelliJ 平台 2024.2 或更高版本的 IDE。它适用于 Android、JVM 以及 Kotlin Multiplatform 项目。

## 配置树状图 {id="configuration-tree-view"}

该插件为你的 Koin 配置添加了一个树状图：

- **Modules（模块）**：所有声明的模块，包括测试模块、内联声明在 `startKoin` 或 `koinApplication` 中的模块，以及启动条目。
- **Definitions（定义）**：每个模块的单例、工厂、ViewModel、作用域定义和注入的形参。

你可以通过输入文本来搜索树状图，选中某个条目即可在编辑器中将其打开。

该树状图支持解析构造函数和传统 DSL（`singleOf(::T)`、`single { }`）、Ktor DSL、Compose API 以及 Koin 注解，包括限定符和泛型类型。

## 导航 {id="navigation"}

装订区域图标会标记定义、注入点和形参。通过这些图标，你可以：

- 从注入点（`get()`、`by inject()`、`koinViewModel()`、构造函数形参）跳转到提供它的定义，
- 从定义跳转到使用它的位置，
- 在配置树中打开该定义。

插件会读取定义的实参类型来查找其依赖项，包括注入的形参。你可以在插件设置中更改要显示的装订区域图标。

## 配置检查 {id="configuration-checks"}

该插件会在你编辑时检查配置，并在 Koin Insights 视图的“Configuration issues”（配置问题）标签页中报告问题：缺少定义的依赖项、使用了未声明的类型、未被使用的定义以及其他配置错误。

每项检查都可以在 IDE 设置中启用或禁用。

:::note
这些检查在编辑器中运行。它们构成了快速反馈循环，但不能替代构建期验证。搭配 [Koin 编译器插件](/docs/intro/koin-compiler-plugin)，同类错误会导致构建失败：请参阅[编译时安全](/docs/reference/koin-compiler/compile-safety)。
:::

## 应用问题 {id="application-issues"}

如果你的应用通过 Kotzilla SDK 向 Kotzilla 平台发送数据，“Application issues”（应用问题）标签页会在代码旁显示在真实用户会话中检测到的问题（启动缓慢、主线程阻塞、后台瓶颈、崩溃）。“Kotzilla Flight Check”标签页会显示你的 Koin 版本以及 SDK 是否已配置。

此部分功能需要 Kotzilla 帐户和 SDK。请参阅[生产环境监控](/docs/tooling/production-monitoring)。

针对检测到的问题，插件可以生成带有上下文信息（受影响的组件、依赖链、性能数据）的提示词，以便粘贴到 GitHub Copilot、Gemini、Claude Code 或 Junie 等 AI 编码辅助工具中。

## 限制 {id="limits"}

- **处于积极开发中**：功能会随版本迭代而变化。请查看 Marketplace 页面以获取当前版本和更新日志。
- **仅限编辑器**：该插件不在 CI 中运行。对于需要阻止合并的检查，请使用[编译时安全](/docs/reference/koin-compiler/compile-safety)或[验证模块](/docs/reference/koin-test/verify)。

该插件的专属文档位于 [doc.kotzilla.io](https://doc.kotzilla.io/docs/discover/idePlugin)。

## 相关内容 {id="related"}

- [生产环境与工具](/docs/tooling)：按需选择适合的工具。
- [编译时安全](/docs/reference/koin-compiler/compile-safety)：在构建期捕获相同的错误。
- [验证模块](/docs/reference/koin-test/verify)：通过测试检查配置。
- [故障排除](/docs/reference/koin-core/troubleshooting)：解读并修复 Koin 错误。
- [生产环境监控](/docs/tooling/production-monitoring)：应用问题标签页背后的数据支持。