---
title: AI Agent 与 Koin Skill
---

# AI Agent 与 Koin Skill

Koin skill 指导编码 agent 如何配合 Koin 4.x 及 Koin 编译器插件工作：包括应该使用哪种风格、如何声明和连接定义、如何从其他 DI 框架迁移，以及如何诊断 Koin 错误。它们由 Koin 团队在 GitHub 上的 [koin-skills 仓库](https://github.com/InsertKoinIO/koin-skills)中维护，并作为 Claude Code 的 `koin` 插件以及适用于其他 agent 的标准 agent skill 发布。本页面介绍了如何安装它们以及各自的作用。

## 在 Claude Code 中安装 {id="install-in-claude-code"}

```
/plugin marketplace add InsertKoinIO/koin-skills
/plugin install koin@koin-skills
```

第一条命令将 Koin skill 仓库添加为插件市场，第二条命令从中安装 `koin` 插件。后续可通过 `/plugin marketplace update koin-skills` 进行更新。

当任务在 Kotlin、Android、Compose、KMP 或 Ktor 项目中涉及依赖注入时，这些 skill 会自动加载。你无需按名称显式调用它们。

## 在其他 agent 中安装 {id="install-in-other-agents"}

对于 Cursor、Codex、Copilot、Windsurf、Gemini 以及其他支持读取 agent skill 的 agent，请使用 [skills](https://skills.sh) CLI（Node.js 22 或更高版本）：

```bash
npx skills add InsertKoinIO/koin-skills
```

它会从 [koin-skills 仓库](https://github.com/InsertKoinIO/koin-skills)（完整 URL `https://github.com/InsertKoinIO/koin-skills` 同样有效）中读取 skill，列出这四个 skill，并为你选择的 agent 安装你所挑选的 skill。如需免提示安装全部 skill，请运行：`npx skills add InsertKoinIO/koin-skills --skill '*' -y`。每个 [GitHub 发布版本](https://github.com/InsertKoinIO/koin-skills/releases)还为每个 skill 附带一个 `.skill` 归档文件，并将完整插件打包为 `koin-plugin.zip`。

## 各 skill 的作用 {id="what-the-skills-do"}

| Skill | 用途 |
|---|---|
| `koin-setup` | 为新项目或现有项目添加 Koin，或与你保留的 DI 容器并存 |
| `koin` | 按项目风格编写 Koin 代码：定义、模块、入口点、作用域、测试 |
| `di-migration` | 逐个模块从 Hilt、Dagger、Toothpick、Kodein、Metro、Koin 3.x、Koin DSL 或 Koin KSP 进行迁移 |
| `koin-diagnose` | 修复 Koin 错误与崩溃，并检查应用在运行时的行为表现 |

这些 skill 遵循本文档的规则。它们使用[构造函数注入](/docs/reference/koin-core/dsl)、编译器插件 DSL 或 Koin Annotations，并且绝不会在新代码中使用 Koin KSP。迁移过程是渐进式的：旧容器将继续运行，直到最后一个绑定完成迁移。

## Kotzilla MCP 服务器 {id="kotzilla-mcp-server"}

这些 skill 可以使用 [Kotzilla](https://kotzilla.io) MCP 服务器来诊断 Koin 错误，并度量定义在运行时的行为表现（生命周期、作用域、启动开销）。这需要一个免费的 Kotzilla 帐户。Skill 会在有帮助时建议使用它，但绝不会强制要求。

在 Claude Code 中，`koin` 插件已包含该服务器。在登录之前它保持未激活状态：运行 `/mcp`，选择 `plugin:koin:kotzilla` 并登录。在其他 agent 中，请将端点 `https://mcp.kotzilla.io/mcp`（HTTP 传输协议，OAuth）添加到该 agent 的 MCP 配置中。

## 限制 {id="limits"}

- 这些 skill 适用于 Koin 4.2.2 或更高版本以及 Kotlin 2.3.20 或更高版本。在旧版 Koin 上，它们会在当前配置下运行，并建议升级一次。
- Skill 负责引导 agent，但不能替代代码审查。在合并更改之前，请仔细查阅代码。
- 运行时检查（启动、内存、重复创建的实例）需要在应用中集成 Kotzilla SDK。如果没有该 SDK，skill 只能根据代码指出可能的原因，而无法提供实测数据。

## 相关内容 {id="related"}

- [编译器插件配置](/docs/setup/compiler-plugin)：这些 skill 所依赖的构建期检查。
- [Koin 与 Hilt](/docs/intro/koin-vs-hilt)：从 Hilt 迁移时的变化。
- [监控](/docs/tooling/monitor)：运行时检查背后的 Kotzilla SDK。
- [GitHub 上的 Koin skills](https://github.com/InsertKoinIO/koin-skills)：源码、问题以及发布版本。