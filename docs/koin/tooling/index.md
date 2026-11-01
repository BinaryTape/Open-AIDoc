---
title: 生产环境与工具
---

# 生产环境与工具

本页面将 Koin 项目的各个阶段映射到对应的工具。Koin 本身涵盖了构建期、开发与测试。针对生产环境，Kotzilla（Koin 的开发公司）提供了一个可选的监控平台。

除了随 Koin 一同提供的工具外，Koin 的所有功能在不使用本页提及的任何其他工具时均可正常工作。请根据您的需求进行选择。

## 工具与需求对照 {id="which-tool-for-which-need"}

| 阶段 | 需求 | 工具 | 随 Koin 一同提供 |
|-------|------|------|-----------------|
| 构建期 | 当依赖缺失或限定符错误时使构建失败 | 借助 Koin 编译器插件实现的[编译时安全](/docs/reference/koin-compiler/compile-safety) | 是 |
| 开发 | 查看 Koin 创建与解析的内容 | 通过 `printLogger()` 或平台日志记录器进行[日志记录](/docs/reference/koin-core/starting-koin#logging) | 是 |
| 开发 | 在定义与注入点之间导航，在编辑器中查看问题 | 适用于 Android Studio 和 IntelliJ IDEA 的 [IDE 插件](/docs/tooling/ide-plugin) | 否，由 Kotzilla 提供的免费插件 |
| 开发 | 让您的 AI 编码 Agent 设置、编写、迁移和诊断 Koin 代码 | 适用于 Claude Code、Cursor、Codex、Copilot 的 [Koin Skills](/docs/tooling/ai-agents) | 否，由 Koin 团队提供的免费 skills |
| 测试 | 在不运行应用的情况下检查模块配置 | 通过 `verify()` [验证模块](/docs/reference/koin-test/verify) | 是 |
| 测试 | 使用 fake 或 mock 替换定义 | 使用 `KoinTest` 进行[测试](/docs/reference/koin-test/testing) | 是 |
| 生产环境 | 跟踪所选函数的执行时间 | [@Monitor](/docs/tooling/monitor)，搭配 Kotzilla SDK | 包含注解，跟踪功能需要 SDK |
| 生产环境 | 从真实用户会话中查看启动、主线程与后台的性能问题及崩溃 | 借助 Kotzilla 平台实现的[生产环境监控](/docs/tooling/production-monitoring) | 否，Kotzilla 服务 |

## 构建期 {id="build-time"}

Koin 编译器插件会在编译期间检查您的依赖图。缺失定义、缺失限定符或未知的作用域都会使构建失败并抛出 `KOIN-Dxxx` 诊断信息，而不会在运行时发生崩溃。这是第一道防线：请参阅[编译时安全](/docs/reference/koin-compiler/compile-safety)以了解验证的内容以及如何进行配置。

## 开发 {id="development"}

Koin 日志记录器会打印模块加载和实例创建情况。可通过 `printLogger(Level.DEBUG)` 或平台日志记录器（`androidLogger()`、SLF4J）启用它。它会将原始文本写入控制台或 Logcat，因此它是一项调试辅助工具，而非监控工具。请参阅[日志记录](/docs/reference/koin-core/starting-koin#logging)。

[IDE 插件](/docs/tooling/ide-plugin)在编辑器中添加了导航、模块与定义的树状图以及配置检查功能。

[Koin skills](/docs/tooling/ai-agents) 为您的 AI 编码 Agent 提供了 Koin 规则：设置、定义、从其他依赖注入框架迁移，以及 Koin 错误诊断。

## 测试 {id="tests"}

`verify()` 可以通过普通的 JUnit 测试来检查模块中的每个定义是否均可构建。如果您使用了编译器插件，编译时安全已经涵盖了 `verify()` 检查的大部分内容。请参阅[验证模块](/docs/reference/koin-test/verify)和[测试](/docs/reference/koin-test/testing)。

## 生产环境 {id="production"}

编译时安全和测试可以捕获配置错误。但它们无法告诉您依赖图在真实设备上的表现：启动时的解析耗时多久、哪个依赖项阻塞了主线程、哪次崩溃是由 Koin 解析引起的。

Koin 本身不包含生产环境监控功能。Kotzilla 平台通过接入 Koin 容器的 Kotzilla SDK 满足了这一需求。请参阅[生产环境监控](/docs/tooling/production-monitoring)。[@Monitor](/docs/tooling/monitor) 注解可将该功能扩展至您自己的函数中。

## 相关内容 {id="related"}

- [编译时安全](/docs/reference/koin-compiler/compile-safety)：编译器插件在构建期检查的内容。
- [启动 Koin](/docs/reference/koin-core/starting-koin#logging)：启用并配置 Koin 日志记录器。
- [验证模块](/docs/reference/koin-test/verify)：通过测试检查配置。
- [IDE 插件](/docs/tooling/ide-plugin)：在 Android Studio 和 IntelliJ IDEA 中的导航与检查。
- [生产环境监控](/docs/tooling/production-monitoring)：面向 Koin 应用的 Kotzilla 平台。