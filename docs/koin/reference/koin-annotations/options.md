---
title: 编译器插件选项
---

# 编译器插件选项

本页列出了在 `build.gradle.kts` 的 `koinCompiler { }` 代码块中配置的 Koin 编译器插件的各项选项。前提是该插件已安装（请参阅[编译器插件设置](/docs/setup/compiler-plugin)）。这些选项既适用于编译器插件 DSL，也同样适用于注解。

## 所有选项 {id="all-options"}

```kotlin
// build.gradle.kts
plugins {
    alias(libs.plugins.koin.compiler)
}

koinCompiler {
    compileSafety = true
    skipDefaultValues = true
    unsafeDslChecks = true
    userLogs = false
    debugLogs = false
}
```

| 选项 | 类型 | 默认值 | 效果 |
|--------|------|---------|--------|
| `compileSafety` | Boolean | `true` | 在构建时验证依赖图 |
| `strictSafety` | Boolean | 自动检测 | 在聚合器模块的每次构建时重新运行全图检查 |
| `strictSafetyForceOff` | Boolean | `false` | 确认错误的 `strictSafety` 自动检测并将其关闭 |
| `skipDefaultValues` | Boolean | `true` | 使用 Kotlin 默认值，而不是解析这些形参 |
| `unsafeDslChecks` | Boolean | `true` | 要求 `create()` 为其 lambda 中的唯一指令 |
| `userLogs` | Boolean | `false` | 记录插件检测到的组件日志 |
| `debugLogs` | Boolean | `false` | 记录插件内部机制日志 |
| `logSeverity` | String | `"warning"` | 插件信息输出的严重性 |
| `versionCheckSeverity` | String | `"warning"` | Kotlin 版本兼容性警告的严重性 |
| `aiAssist` | Boolean | `true` | 在包含 Koin 诊断信息的构建末尾添加一行帮助信息 |

## compileSafety {id="compilesafety"}

启用后，插件会在构建时检查图中的每个依赖项是否均可解析：缺失的定义、限定符不匹配、循环依赖，以及没有匹配定义的 `get()` 或 `inject()` 调用站点。发生问题时会导致构建失败，而不是在运行时崩溃。

```kotlin
koinCompiler {
    compileSafety = false
}
```

请保持其处于启用状态。将其关闭会移除所有编译时检查，并使 `strictSafety` 失效。具体检查的内容请参阅[编译时安全性](/docs/reference/koin-compiler/compile-safety)。

## strictSafety {id="strictsafety"}

全图检查会在启动 Koin 的模块中运行（聚合器：包含 `startKoin`、`koinApplication` 或 `@KoinApplication` 的 Gradle 模块）。当图在其他位置发生更改时（例如在 `module { }` lambda 体内进行了编辑），Kotlin 增量编译可能会将该模块标记为最新（up-to-date）。此时检查将不会再次运行，错误便会在运行时显现。

`strictSafety` 会使聚合器的 `compileKotlin` 任务在每次构建时都重新运行，不使用构建缓存且不跳过最新状态。库模块和功能模块仍保持增量编译。

您无需显式设置它。当未设置该选项时，Gradle 插件会扫描模块源代码中的 `startKoin`、`koinApplication` 或 `@KoinApplication`，并自动为该模块开启此项。生命周期日志行会声明该决定：

```
[Koin] Auto-enabling strictSafety on :app (detected startKoin / @KoinApplication / koinApplication).
```

如果检测遗漏了某个模块，可以设置 `strictSafety = true` 强制开启：

```kotlin
koinCompiler {
    strictSafety = true
}
```

在检测到入口点的模块上设置 `strictSafety = false` 是无效的（自编译器插件 1.1.0 起）。该设置仅对未检测到入口点的模块起作用。当 `compileSafety = false` 时，此选项无效。

其代价是每次构建时聚合器模块都会进行一次完整的重新编译。有关增量编译缺陷的背景信息，请参阅 [koin-compiler-plugin issue #32](https://github.com/InsertKoinIO/koin-compiler-plugin/issues/32)。

## strictSafetyForceOff {id="strictsafetyforceoff"}

该检测使用的是文本匹配。它同样会匹配注释或字符串文字中的 `startKoin`，从而为非聚合器模块开启 `strictSafety`。如果您已确认该匹配有误，请同时设置以下两个选项：

```kotlin
koinCompiler {
    strictSafety = false
    strictSafetyForceOff = true
}
```

二者缺一不可：`strictSafetyForceOff` 仅在与 `strictSafety = false` 搭配时生效。请仅在确认发生误判时使用它。如果在真正的入口点上使用，它会禁用重新运行机制，进而导致增量构建后图错误遗留到运行时。

## skipDefaultValues {id="skipdefaultvalues"}

启用后，带有 Kotlin 默认值的非空形参将保留其默认值，而不会从 Koin 中解析：

```kotlin
@Singleton
class ApiClient(
    val repository: UserRepository,                         // 从 Koin 解析
    val timeout: Int = 30_000,                              // Kotlin 默认值
    @Property("api_url") val url: String = "https://...",   // 解析，因为添加了注解
    val logger: Logger? = null,                             // 使用 getOrNull() 解析
)
```

可空形参仍会使用 `getOrNull()` 解析。带有 `@Named`、`@Qualifier`、`@InjectedParam` 或 `@Property` 的形参无论其默认值为何，都始终会被解析。设置 `skipDefaultValues = false` 可从 Koin 解析每一个形参。

## unsafeDslChecks {id="unsafedslchecks"}

启用后，`create(::T)` 调用必须是其定义 lambda 中的唯一指令。这样可以确保 lambda 能够被插件分析和验证。违规将导致构建失败：

```
[Koin][KOIN-S001] create(::UserRepository) must be the only instruction in the lambda. Other statements are not allowed when using create(). To disable this check, set koinCompiler { unsafeDslChecks = false } in your build.gradle.kts
```

当您迁移在 `create()` lambda 内部运行其他语句的经典 DSL 代码时，可将其设为 `false`，迁移完成后再重新开启。

## userLogs 与 debugLogs {id="userlogs-and-debuglogs"}

`userLogs = true` 会输出插件检测和处理的内容：它拦截的 DSL 定义（`single<T>()`、`factory<T>()`）、添加注解的类（`@Singleton`、`@Module`）以及生成的模块。当某个定义未被识别时，可以使用此选项。

`debugLogs = true` 会输出插件内部机制（FIR 和 IR 阶段、模块发现）。在报告插件错误时可以使用此选项。

两者都会输出带有 `[Koin]` 前缀的日志行，其严重级别由 `logSeverity` 设定。

## logSeverity 与 versionCheckSeverity {id="logseverity-and-versioncheckseverity"}

两者均接受 `"warning"`（默认）或 `"info"`。

```kotlin
koinCompiler {
    logSeverity = "info"
    versionCheckSeverity = "info"
}
```

- **logSeverity**：信息性输出（`userLogs`、`debugLogs`、“无 Koin 入口点”提示、`@Monitor` 摘要）的严重性。如果您的构建启用了 `allWarningsAsErrors`，请将其设置为 `"info"`，以避免此类输出导致构建失败。
- **versionCheckSeverity**：当使用插件尚未验证的 Kotlin 版本进行构建时所显示警告的严重性。它是独立的配置项，因此静音日志输出不会掩盖兼容性风险。请仅在确认您的 Kotlin 版本可以正常工作后再将其设置为 `"info"`。

这两个选项都不会更改实际的诊断信息（`KOIN-D001`、`KOIN-W003` 等）：它们会保持各自的严重级别。

## aiAssist {id="aiassist"}

当构建报告至少一条 Koin 诊断信息时，插件会在编译结束时添加一行内容，指向 Kotzilla MCP 服务器，AI 编码辅助工具可以使用该服务器对错误进行归类并提出修复建议：

```
[Koin] → Fix with AI: set up Kotzilla MCP at https://kotzilla.io/koin-mcp
```

该提示行每次构建仅显示一次，而非每个错误显示一次。设置 `aiAssist = false` 可将其隐藏。

## 相关内容 {id="related"}

- [编译时安全性](/docs/reference/koin-compiler/compile-safety)：`compileSafety` 检查的内容及其报告的诊断信息。
- [编译器插件设置](/docs/setup/compiler-plugin)：安装插件及其依赖项。
- [Koin 编译器插件](/docs/intro/koin-compiler-plugin)：插件的功能与工作原理。
- [故障排除](/docs/reference/koin-core/troubleshooting)：运行时错误与调试。