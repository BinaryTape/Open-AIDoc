[//]: # (title: 协程)

应用程序通常需要同时执行多个任务，例如响应用户输入、加载数据或更新屏幕。
为此，它们依赖并发，并发允许操作独立运行而互不阻塞。

并发运行任务最常用的方式是使用线程，线程是由操作系统管理的独立执行路径。
然而，线程相对较重，创建过多的线程可能会导致性能问题。

为了支持高效并发，Kotlin 使用围绕 *协程* 构建的异步编程，让你能够使用挂起函数以自然、顺序的风格编写异步代码。
协程是线程的轻量级替代方案。
它们可以在不阻塞系统资源的情况下挂起，并且对资源友好，这使得它们更适合细粒度的并发。

大多数协程功能由 [`kotlinx.coroutines`](https://github.com/Kotlin/kotlinx.coroutines) 库提供，该库包含用于启动协程、处理并发、处理异步流等工具。

如果你是 Kotlin 协程的新手，请在深入研究更复杂的主题之前，先从 [协程基础](coroutines-basics.md) 指南开始。
本指南通过简单的示例介绍了挂起函数、协程构建器和结构化并发的核心概念：

<a href="coroutines-basics.md"><img src="get-started-coroutines.svg" width="700" alt="开始使用协程" style="block"/></a>

> 查看 [KotlinConf 应用](https://github.com/JetBrains/kotlinconf-app) 示例项目，了解协程在实践中是如何使用的。
> 
{style="tip"}

## 协程概念

`kotlinx.coroutines` 库提供了用于并发运行任务、组织协程执行以及管理共享状态的核心构建块。

### 挂起函数与协程构建器

Kotlin 中的协程构建在挂起函数之上，挂起函数允许代码在不阻塞线程的情况下暂停和恢复。
`suspend` 关键字用于标记可以异步执行长时间运行操作的函数。

要启动新协程，请使用协程构建器，例如 [`.launch()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/launch.html) 和 [`.async()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/async.html)。
这些构建器是 [`CoroutineScope`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-scope/) 的扩展函数，它定义了协程的生命周期并提供了协程上下文。

你可以在 [协程基础](coroutines-basics.md) 和 [组合挂起函数](coroutines-and-channels.md) 中了解更多关于这些构建器的信息。

### 协程上下文与行为

从 `CoroutineScope` 启动协程会创建一个控制其执行的上下文。
像 `.launch()` 和 `.async()` 这样的构建器函数会自动创建一组定义协程行为的元素：

* [`Job`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-job/) 接口跟踪协程的生命周期并启用结构化并发。
* [`CoroutineDispatcher`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-dispatcher/) 控制协程运行的位置，例如在后台线程或 UI 应用程序的主线程上。
* [`CoroutineExceptionHandler`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-exception-handler/) 处理未捕获的异常。

这些元素连同其他可能的元素构成了 [_协程上下文_](coroutine-context-and-dispatchers.md)，默认情况下它从协程的父级继承。
此上下文形成了一个支持结构化并发的层次结构，在其中相关的协程可以被一起 [取消](coroutines-cancellation.md) 或作为一个组进行 [异常处理](exception-handling.md)。

### 异步流与共享可变状态

Kotlin 提供了几种协程通信的方式。
根据你希望如何在协程之间共享值，选择以下选项之一：

* [`Flow`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-flow/) 仅在协程主动收集它们时才产生值。
* [`Channel`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.channels/-channel/) 允许多个协程发送和接收值，每个值被精确地传递给一个协程。
* [`SharedFlow`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-shared-flow/) 持续地将每个值共享给所有处于活动状态的收集协程。

当多个协程需要访问或更新相同的数据时，它们会 *共享可变状态*。
如果没有协调，这可能会导致竞态条件，即操作以不可预测的方式相互干扰。
为了安全地管理共享可变状态，请使用 [`StateFlow`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-state-flow/#) 来包装共享数据。
然后，你可以从一个协程更新它，并从其他协程收集它的最新值。
<!-- 详细了解 [共享可变状态与并发](shared-mutable-state-and-concurrency.md)。 -->

更多信息请参阅 [流](coroutines-flow.md)、[通道](channels.md) 以及 [协程与通道教程](coroutines-and-channels.md)。

## 后续步骤

* 在 [协程基础指南](coroutines-basics.md) 中学习协程、挂起函数和构建器的基础知识。
* 在 [组合挂起函数](coroutine-context-and-dispatchers.md) 中探索如何组合挂起函数和构建协程流水线。
* 学习如何使用 IntelliJ IDEA 中的内置工具 [调试协程](debug-coroutines-with-idea.md)。
* 对于特定于流的调试，请参阅 [使用 IntelliJ IDEA 调试 Kotlin Flow](debug-flow-with-idea.md) 教程。
* 阅读 [使用协程进行 UI 编程指南](https://github.com/Kotlin/kotlinx.coroutines/blob/master/ui/coroutines-guide-ui.md) 以了解基于协程的 UI 开发。
* 查看 [在 Android 中使用协程的最佳做法](https://developer.android.com/kotlin/coroutines/coroutines-best-practices)。
* 查看 [`kotlinx.coroutines` API 参考](https://kotlinlang.org/api/kotlinx.coroutines/)。