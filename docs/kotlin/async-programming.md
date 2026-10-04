[//]: # (title: 异步控制流与挂起函数)

当应用程序在处理其他工作之前需要等待某项操作完成时，可能会变得无响应。

在 JVM 上，代码运行在线程上。
如果负责处理事件的线程必须等待某项操作完成，那么在此期间它就无法执行其他工作。
导致线程等待的操作被称为*阻塞操作 (blocking operation)*。

为了保持响应性，应用程序需要在某个操作进行期间允许独立的工作继续执行。
*异步控制流*决定了哪些工作可以继续进行，哪些工作必须等待该操作完成。

> 后续各节将使用一个小型[提醒应用程序](https://github.com/kotlin-hands-on/suspending-functions-intro)的示例，来演示管理异步控制流的不同方式，以及挂起函数如何让其表达更加轻松。
>
> 示例实现仅用于教学目的，并未达到生产就绪标准。
> 要开始在 Kotlin 中编写生产就绪的异步代码，请参阅[协程基础](coroutines-basics.md)。
>
{style="note"}

## 并发计算 {id="concurrent-computations"}

异步控制流最简单的形式是并发运行两个操作。
当一个操作可以在另一个操作完成之前启动时，这两个操作就是并发运行的。

当 JVM 应用程序启动时，JVM 会在*主线程 (main thread)* 上调用其 `main()` 函数。
当主线程继续运行其他代码时，你可以使用 [`Thread`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Thread.html) 类在单独的线程上启动另一个操作。

在提醒应用程序的 [`src/main/kotlin/Example1.kt`](https://github.com/kotlin-hands-on/suspending-functions-intro/blob/main/src/main/kotlin/Example1.kt) 中，每个提醒都在新线程上启动，而主线程继续处理用户输入：

```kotlin
// 启动一个新线程，在打印提醒之前等待指定的时间
fun scheduleReminder(remindIn: Duration, reminderText: List<String>) {
    Thread {
        // 在单独的线程上等待指定的时间
        Thread.sleep(remindIn.inWholeMilliseconds)

        println(/* reminder text */)
    }.apply {
        // 保持 JVM 运行，直到提醒线程完成
        isDaemon = false

        // 启动线程
        start()
    }
}

fun main() {
    while (true) {
        // 主线程继续接收命令
        println("Please enter your input:")
        val input = readlnOrNull() ?: return

        when (/* parsed command */) {
            "remind" -> {
                // 提醒在一个新线程上启动
                scheduleReminder(remindInParsed, command)
            }
        }
    }
}
```

在此示例中，当提醒处于待处理状态时，你可以继续与应用程序进行交互。
[`start()`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Thread.html#start()) 方法会启动每个提醒线程，并将 `isDaemon` 属性设置为 `false`，从而使 JVM 保持运行，直到所有提醒线程完成。
当触发提醒时，提醒线程会将其文本打印到主线程用于其他输出的同一个控制台中。

该应用程序还有一个 `fun_animation` 命令，它会在主线程上打印一系列帧动画：

```kotlin
"fun_animation" -> {
    for (frame in funAnimationFrames) {
        // 主线程打印每一帧动画
        println(frame)

        // 主线程在打印下一帧之前等待 200 毫秒
        Thread.sleep(200)
    }
}
```

由于提醒与动画并发运行，因此在打印动画的同时可能会触发提醒。
结果就是，提醒文本可能会出现在动画的中间：

```none
==============================
    

       _---_
*** REMINDER (SCHEDULED 2m AGO): Turn off the stove! ***
     / o o o \
    <=========>
     /       \
    /         \
   /           \

==============================
```

这种交错现象暴露了并发访问共享资源的一个问题：
尽管这些操作可以独立运行，但它们可能会相互干扰。

在实际应用程序中，当并发操作更新共享状态时，也可能会发生类似的干扰。
例如，一个操作可能正在重新计算 UI 布局，而另一个操作可能正在更改显示的内容。
如果不进行协调，其结果可能取决于哪个操作先完成，从而导致 UI 处于不一致的状态。
这种不可预测的干扰被称为*竞态条件 (race condition)*。

以下是此版本提醒应用程序的完整实现：

```kotlin
import kotlin.time.Clock
import kotlin.time.Duration

fun scheduleReminder(remindIn: Duration, reminderText: List<String>) {
    Thread {
        Thread.sleep(remindIn.inWholeMilliseconds)
        println(buildString {
            append("*** REMINDER (SCHEDULED $remindIn AGO)")
            if (reminderText.isNotEmpty()) {
                append(": ")
                for (word in reminderText) {
                    append(word)
                    append(' ')
                }
            } else {
                append(' ')
            }
            append("***")
        })
    }.apply {
        isDaemon = false
        start()
    }
}

fun main() {
    while (true) {
        println("Please enter your input:")
        val input = readlnOrNull() ?: return
        val command = input
            .trim().split("\\s".toRegex())
            .toMutableList()
        val operation = command.removeFirstOrNull() ?: continue
        when (val operationInLowerCase = operation.lowercase()) {
            "remind" -> {
                val remindIn = command.removeFirstOrNull()
                val remindInParsed = remindIn?.let(Duration::parseOrNull)
                if (remindInParsed == null) {
                    println(buildString {
                        append("The 'remind' command requires a 'Duration' argument")
                        if (remindIn != null) {
                            append(", got '$remindIn'")
                        }
                    })
                    println()
                    printRemindSyntax()
                } else {
                    scheduleReminder(remindInParsed, command)
                    println("Scheduled a reminder in $remindInParsed")
                    println("    (fires at ${Clock.System.now() + remindInParsed})")
                }
            }
            "help" -> printHelp()
            "fun_animation" -> {
                for (frame in funAnimationFrames) {
                    println(frame)
                    Thread.sleep(200) // 200 毫秒
                }
            }
            "quit" -> break
            else -> {
                println("Unknown command '$operationInLowerCase'")
                println()
                printHelp()
            }
        }
    }
    println("All done! The program will exit once all pending reminders fire.")
}

private fun printHelp() {
    println("Usage:")
    printRemindSyntax()
    printFunAnimationSyntax()
    printHelpSyntax()
    printQuitSyntax()
    println()
}

private fun printRemindSyntax() {
    println("remind duration [message] - remind about something")
    println("\texample: remind 10m Turn off stove")
}

private fun printFunAnimationSyntax() {
    println("fun_animation - show a fun animation to pass the time")
}

private fun printHelpSyntax() {
    println("help - show a list of available commands")
}

private fun printQuitSyntax() {
    println("quit - exit this program")
}

private val funAnimationFrames = (
    "#       _---_#     / o o o \\#    <=========>####       o#    " +
    "  /|\\#      / \\#~@##       _---_#     / o o o \\#    <=======" +
    "==>###       o#      /|\\#      / \\#~@###       _---_#     / " +
    "o o o \\#    <=========>##       o#      /|\\#      / \\#~@## " +
    "      _---_#     / o o o \\#    <=========>#     /       \\# " +
    "   /         \\#   /    o      \\#       /|\\#       / \\#~@## " +
    "      _---_#     / o o o \\#    <=========>#     /       \\# " +
    "   /   o     \\#   /   /|\\     \\#       / \\##~@##       _---" +
    "_#     / o o o \\#    <=========>#     /  o    \\#    /  /|\\" +
    "    \\#   /   / \\     \\###~@##       _---_#     / o o o \\#  " +
    "  <=========>#     /       \\#    /         \\#   /          " +
    " \\###~@##       _---_#     / - - - \\#    <=========>######~" +
    "@#       _---_#     / - - - \\#    <=========>#       * * *#" +
    "#####~@       * * *#         *#########~"
).replace("~", "==============================")
    .replace("#", "\n")
    .split("@")
```
{collapsible="true" collapsed-title="完整的 Example1.kt 文件"}

## 基于 Actor 的共享资源协调 {id="actor-based-shared-resource-coordination"}

当并发操作使用相同的资源时，它们需要协调如何使用该资源。

协调对共享资源访问的一种方法是使用*基于 actor 的方法 (actor-based approach)*，
其中单个组件控制对资源的访问并逐个处理请求。
如果该组件已在处理某个请求，则新请求将在队列中等待。

> 许多 UI 框架使用带有 *UI 线程*的类似方法。
> UI 线程逐个处理更新 UI 元素的请求。
>
{style="tip"}

在 [`src/main/kotlin/Example2.kt`](https://github.com/kotlin-hands-on/suspending-functions-intro/blob/main/src/main/kotlin/Example2.kt) 中，提醒应用程序使用 `SimpleActor` 类来协调对控制台的访问。
Actor 会在专用线程上按接收请求的顺序运行请求：

```kotlin
// 通过逐个处理请求来协调对共享资源的访问
class SimpleActor {
    private val requests = mutableListOf<() -> Unit>()

    init {
        Thread {
            while (true) {
                // 当可用时从队列中获取下一个请求
                val request = /* ... */

                // 一次执行一个请求
                request()
            }
        }.apply {
            // 允许 JVM 在 actor 线程仍在运行时退出
            isDaemon = true

            // 启动 actor 线程
            start()
        }
    }

    fun sendRequest(request: () -> Unit) {
        // 将请求添加到队列
        /* ... */
    }
}
```

操作不再直接调用 `println()` 函数，而是向同一个 actor 发送请求。
例如，提醒会在其指定的时间过去之后将其输出发送给 actor：

```kotlin
fun scheduleReminder(
    printlnActor: SimpleActor,
    remindIn: Duration,
    reminderText: List<String>
) {
    Thread {
        Thread.sleep(remindIn.inWholeMilliseconds)

        val stringToPrint = /* 创建提醒文本 */

        // 将提醒输出发送给 actor
        printlnActor.sendRequest {
            println(stringToPrint)
        }
    }.apply {
        isDaemon = false
        start()
    }
}
```

`fun_animation` 命令也将其输出发送给 actor，并将所有动画帧分组到一个请求中：

```kotlin
// 将动画输出作为单个请求发送给 actor
"fun_animation" -> printlnActor.sendRequest {
    for (frame in funAnimationFrames) {
        println(frame)
        Thread.sleep(200)
    }
}
```

在此示例中，`sendRequest()` 函数向 actor 提交一个请求并立即返回，而无需等待请求完成。

Actor 逐个处理请求。如果 actor 在处理另一个请求时触发了某个提醒，
则其打印请求会在队列中等待，直到当前请求完成。
这可以防止交错问题，例如提醒文本出现在动画的中间。

但是，actor 仅协调它所处理的请求。
它并不决定主线程何时继续，因此当 actor 仍在处理较早的请求时，主线程可以继续接收用户输入。
当主线程上的工作依赖于该请求的完成时，这一点就很重要。

以下是此版本提醒应用程序的完整实现：

```kotlin
import kotlin.time.Clock
import kotlin.time.Duration

@Suppress("PLATFORM_CLASS_MAPPED_TO_KOTLIN")
class SimpleActor {
    private val requests = mutableListOf<() -> Unit>()

    init {
        Thread {
            while (true) {
                val request = synchronized(requests) {
                    val request = requests.removeFirstOrNull()
                    if (request == null) {
                        (requests as Object).wait()
                        continue
                    }
                    request
                }
                request()
            }
        }.apply {
            isDaemon = true
            start()
        }
    }

    /**
     * 发送一个将在此 actor 的线程上执行的请求。
     *
     * 发送到任何给定 actor 的请求都是逐个执行的，
     * 绝不会并行执行。
     */
    fun sendRequest(
        request: () -> Unit,
    ) {
        synchronized(requests) {
            requests.add(request)
            (requests as Object).notify()
        }
    }
}

fun scheduleReminder(
    printlnActor: SimpleActor,
    remindIn: Duration,
    reminderText: List<String>
) {
    Thread {
        Thread.sleep(remindIn.inWholeMilliseconds)
        val stringToPrint = buildString {
            append("*** REMINDER (SCHEDULED $remindIn AGO)")
            if (reminderText.isNotEmpty()) {
                append(": ")
                for (word in reminderText) {
                    append(word)
                    append(' ')
                }
            } else {
                append(' ')
            }
            append("***")
        }
        printlnActor.sendRequest {
            println(stringToPrint)
        }
    }.apply {
        isDaemon = false
        start()
    }
}

fun main() {
    val printlnActor = SimpleActor()
    while (true) {
        printlnActor.sendRequest {
            println("Please enter your input:")
        }
        val input = readlnOrNull() ?: return
        val command = input
            .trim().split("\\s".toRegex())
            .toMutableList()
        val operation = command.removeFirstOrNull() ?: continue
        when (val operationInLowerCase = operation.lowercase()) {
            "remind" -> {
                val remindIn = command.removeFirstOrNull()
                val remindInParsed = remindIn?.let(Duration::parseOrNull)
                if (remindInParsed == null) {
                    printlnActor.sendRequest {
                        println(buildString {
                            append("The 'remind' command requires a 'Duration' argument")
                            if (remindIn != null) {
                                append(", got '$remindIn'")
                            }
                        })
                        println()
                        printRemindSyntax()
                    }
                } else {
                    scheduleReminder(printlnActor, remindInParsed, command)
                    printlnActor.sendRequest {
                        println("Scheduled a reminder in $remindInParsed")
                        println("    (fires at ${Clock.System.now() + remindInParsed})")
                    }
                }
            }
            "help" -> printlnActor.sendRequest {
                printHelp()
            }
            "fun_animation" -> printlnActor.sendRequest {
                for (frame in funAnimationFrames) {
                    println(frame)
                    Thread.sleep(200) // 200 毫秒
                }
            }
            "quit" -> break
            else -> printlnActor.sendRequest {
                println("Unknown command '$operationInLowerCase'")
                println()
                printHelp()
            }
        }
    }
    printlnActor.sendRequest {
        println("All done! The program will exit once all pending reminders fire.")
    }
}

private fun printHelp() {
    println("Usage:")
    printRemindSyntax()
    printFunAnimationSyntax()
    printHelpSyntax()
    printQuitSyntax()
    println()
}

private fun printRemindSyntax() {
    println("remind duration [message] - remind about something")
    println("\texample: remind 10m Turn off stove")
}

private fun printFunAnimationSyntax() {
    println("fun_animation - show a fun animation to pass the time")
}

private fun printHelpSyntax() {
    println("help - show a list of available commands")
}

private fun printQuitSyntax() {
    println("quit - exit this program")
}

private val funAnimationFrames = (
    "#       _---_#     / o o o \\#    <=========>####       o#    " +
    "  /|\\#      / \\#~@##       _---_#     / o o o \\#    <=======" +
    "==>###       o#      /|\\#      / \\#~@###       _---_#     / " +
    "o o o \\#    <=========>##       o#      /|\\#      / \\#~@## " +
    "      _---_#     / o o o \\#    <=========>#     /       \\# " +
    "   /         \\#   /    o      \\#       /|\\#       / \\#~@## " +
    "      _---_#     / o o o \\#    <=========>#     /       \\# " +
    "   /   o     \\#   /   /|\\     \\#       / \\##~@##       _---" +
    "_#     / o o o \\#    <=========>#     /  o    \\#    /  /|\\" +
    "    \\#   /   / \\     \\###~@##       _---_#     / o o o \\#  " +
    "  <=========>#     /       \\#    /         \\#   /          " +
    " \\###~@##       _---_#     / - - - \\#    <=========>######~" +
    "@#       _---_#     / - - - \\#    <=========>#       * * *#" +
    "#####~@       * * *#         *#########~"
).replace("~", "==============================")
    .replace("#", "\n")
    .split("@")
```
{collapsible="true" collapsed-title="完整的 Example2.kt 文件"}

## 回调 {id="callbacks"}

当某些工作必须在异步操作完成后才能开始时，应用程序需要控制后续工作的运行时间。
你可以在*回调 (callback)* 中定义后续工作。
回调是传递给另一个函数的函数，用于在满足指定条件时（例如在某项操作完成后）稍后调用。

在 [`src/main/kotlin/Example3.kt`](https://github.com/kotlin-hands-on/suspending-functions-intro/blob/main/src/main/kotlin/Example3.kt) 中，提醒应用程序使用回调在动画完成后才恢复处理用户输入。
为了实现这一点，该示例添加了第二个用于处理用户输入的 `SimpleActor`：

```kotlin
fun main() {
    val printlnActor = SimpleActor()
    val userInputActor = SimpleActor()

    // 传递一个启动处理用户输入的回调
    userInputActor.sendRequest {
        processUserInput(
            printlnActor,
            userInputActor,
            // 在输入处理停止后运行
            doLast = {
                printlnActor.sendRequest {
                    println("All done! The program will exit once all pending reminders fire.")
                }
            }
        )
    }

    // 保持主线程运行，直到应用程序可以终止
    while (!shouldTerminate.load()) {
        Thread.sleep(100)
    }
}
```

`userInputActor` 会在其专用线程上调用 `processUserInput()` 函数。
与[基于 Actor 的共享资源协调](#actor-based-shared-resource-coordination)实现中的 `while` 循环不同，每次对 `processUserInput()` 函数的调用只读取并处理一个命令。

在处理完 `remind` 命令、`help` 命令或未知命令后，该函数会向 `userInputActor` 发送另一个请求：

```kotlin
fun processUserInput(
    printlnActor: SimpleActor,
    userInputActor: SimpleActor,
    doLast: () -> Unit
) {
    // 处理当前命令
    /* ... */

    // 调度下一个命令的处理
    userInputActor.sendRequest {
        processUserInput(printlnActor, userInputActor, doLast)
    }
}
```

`userInputActor` 会将回调加入队列，而不是立即调用它。
当前对 `processUserInput()` 函数的调用会在 actor 处理下一个请求之前返回。
这会启动另一个输入处理操作，类似于启动循环的下一次迭代。

对于 `fun_animation` 命令，应用程序会延迟下一个输入请求，直到动画完成。
发送给 `printlnActor` 的请求会在请求处理下一个命令之前打印所有动画帧：

```kotlin
"fun_animation" -> {
    // 发送打印动画的请求
    printlnActor.sendRequest {
        for (frame in funAnimationFrames) {
            println(frame)
            Thread.sleep(200)
        }

        // 传递一个在动画完成后处理下一个命令的回调
        userInputActor.sendRequest {
            processUserInput(printlnActor, userInputActor, doLast)
        }
    }

    // 防止 processUserInput() 在动画完成前调度另一个输入请求
    return
}
```

对于 `quit` 命令，该函数会调用 `doLast` 回调，而不是调度另一个输入请求：

```kotlin
"quit" -> {
    // 调用在输入处理停止后运行的回调
    doLast()
    return
}
```

使用回调时，每个执行路径都必须显式调度紧随其后的工作。
应用程序必须调度另一个输入处理操作、启动一个在完成时调度输入处理的异步操作，或者调用最终回调。

随着控制流变得越来越复杂，遗漏其中一个操作、多次执行该操作或在错误的执行路径上执行该操作，都可能会改变应用程序的行为。
这使得代码更难维护且更容易出错。

以下是此版本提醒应用程序的完整实现：

```kotlin
@file:OptIn(kotlin.concurrent.atomics.ExperimentalAtomicApi::class)
import kotlin.concurrent.atomics.AtomicBoolean
import kotlin.time.Clock
import kotlin.time.Duration

@Suppress("PLATFORM_CLASS_MAPPED_TO_KOTLIN")
class SimpleActor {
    private val requests = mutableListOf<() -> Unit>()

    init {
        Thread {
            while (true) {
                val request = synchronized(requests) {
                    val request = requests.removeFirstOrNull()
                    if (request == null) {
                        (requests as Object).wait()
                        continue
                    }
                    request
                }
                request()
            }
        }.apply {
            isDaemon = true
            start()
        }
    }

    /**
     * 发送一个将在此 actor 的线程上执行的请求。
     *
     * 发送到任何给定 actor 的请求都是逐个执行的，
     * 绝不会并行执行。
     */
    fun sendRequest(
        request: () -> Unit,
    ) {
        synchronized(requests) {
            requests.add(request)
            (requests as Object).notify()
        }
    }
}

fun scheduleReminder(
    printlnActor: SimpleActor,
    remindIn: Duration,
    reminderText: List<String>
) {
    Thread {
        Thread.sleep(remindIn.inWholeMilliseconds)
        val stringToPrint = buildString {
            append("*** REMINDER (SCHEDULED $remindIn AGO)")
            if (reminderText.isNotEmpty()) {
                append(": ")
                for (word in reminderText) {
                    append(word)
                    append(' ')
                }
            } else {
                append(' ')
            }
            append("***")
        }
        printlnActor.sendRequest {
            println(stringToPrint)
        }
    }.apply {
        isDaemon = false
        start()
    }
}

val shouldTerminate = AtomicBoolean(false)

fun processUserInput(
    printlnActor: SimpleActor,
    userInputActor: SimpleActor,
    doLast: () -> Unit
) {
    printlnActor.sendRequest {
        println("Please enter your input:")
    }
    val input = readlnOrNull() ?: return
    val command = input
        .trim().split("\\s".toRegex())
        .toMutableList()
    val operation = command.removeFirstOrNull()
    if (operation == null) {
        /* 模拟早期版本中的 `continue` */
        userInputActor.sendRequest {
            processUserInput(printlnActor, userInputActor, doLast)
        }
        return
    }
    when (val operationInLowerCase = operation.lowercase()) {
        "remind" -> {
            val remindIn = command.removeFirstOrNull()
            val remindInParsed = remindIn?.let(Duration::parseOrNull)
            if (remindInParsed == null) {
                printlnActor.sendRequest {
                    println(buildString {
                        append("The 'remind' command requires a 'Duration' argument")
                        if (remindIn != null) {
                            append(", got '$remindIn'")
                        }
                    })
                    println()
                    printRemindSyntax()
                }
            } else {
                scheduleReminder(printlnActor, remindInParsed, command)
                printlnActor.sendRequest {
                    println("Scheduled a reminder in $remindInParsed")
                    println("    (fires at ${Clock.System.now() + remindInParsed})")
                }
            }
        }
        "help" -> printlnActor.sendRequest {
            printHelp()
        }
        "fun_animation" -> {
            printlnActor.sendRequest {
                for (frame in funAnimationFrames) {
                    println(frame)
                    Thread.sleep(200) // 200 毫秒
                }
                userInputActor.sendRequest {
                    processUserInput(printlnActor, userInputActor, doLast)
                }
            }
            /* 不需要重新调度读取用户输入，因为
            println actor 完成后会自行处理。 */
            return
        }
        "quit" -> {
            /* 通过退出当前迭代而不重新调度新迭代来模拟早期版本中的 `break`，
            而是调度循环 *之后* 的代码。 */
            doLast()
            return
        }
        else -> printlnActor.sendRequest {
            println("Unknown command '$operationInLowerCase'")
            println()
            printHelp()
        }
    }
    // 调度循环的下一次迭代
    userInputActor.sendRequest {
        processUserInput(printlnActor, userInputActor, doLast)
    }
}

fun main() {
    val printlnActor = SimpleActor()
    val userInputActor = SimpleActor()
    userInputActor.sendRequest {
        processUserInput(printlnActor, userInputActor, doLast = {
            printlnActor.sendRequest {
                println("All done! The program will exit once all pending reminders fire.")
                // 允许主线程退出
                shouldTerminate.store(true)
            }
        })
    }
    // 保持程序存活：如果我们直接退出主线程，
    // 所有内容都将终止。
    while (!shouldTerminate.load()) {
        Thread.sleep(100)
    }
}

private fun printHelp() {
    println("Usage:")
    printRemindSyntax()
    printFunAnimationSyntax()
    printHelpSyntax()
    printQuitSyntax()
    println()
}

private fun printRemindSyntax() {
    println("remind duration [message] - remind about something")
    println("\texample: remind 10m Turn off stove")
}

private fun printFunAnimationSyntax() {
    println("fun_animation - show a fun animation to pass the time")
}

private fun printHelpSyntax() {
    println("help - show a list of available commands")
}

private fun printQuitSyntax() {
    println("quit - exit this program")
}

private val funAnimationFrames = (
    "#       _---_#     / o o o \\#    <=========>####       o#    " +
    "  /|\\#      / \\#~@##       _---_#     / o o o \\#    <=======" +
    "==>###       o#      /|\\#      / \\#~@###       _---_#     / " +
    "o o o \\#    <=========>##       o#      /|\\#      / \\#~@## " +
    "      _---_#     / o o o \\#    <=========>#     /       \\# " +
    "   /         \\#   /    o      \\#       /|\\#       / \\#~@## " +
    "      _---_#     / o o o \\#    <=========>#     /       \\# " +
    "   /   o     \\#   /   /|\\     \\#       / \\##~@##       _---" +
    "_#     / o o o \\#    <=========>#     /  o    \\#    /  /|\\" +
    "    \\#   /   / \\     \\###~@##       _---_#     / o o o \\#  " +
    "  <=========>#     /       \\#    /         \\#   /          " +
    " \\###~@##       _---_#     / - - - \\#    <=========>######~" +
    "@#       _---_#     / - - - \\#    <=========>#       * * *#" +
    "#####~@       * * *#         *#########~"
).replace("~", "==============================")
    .replace("#", "\n")
    .split("@")
```
{collapsible="true" collapsed-title="完整的 Example3.kt 文件"}

## 控制流抽象 {id="control-flow-abstractions"}

为了使基于回调的控制流更易于理解，你可以将重复的调度逻辑移入表示常见控制流结构（例如循环）的帮助程序函数中。

在 [`src/main/kotlin/Example4.kt`](https://github.com/kotlin-hands-on/suspending-functions-intro/blob/main/src/main/kotlin/Example4.kt) 中，提醒应用程序使用 `runInfiniteLoop()` 函数来异步处理用户输入。
每次循环迭代都会返回一个 `LoopIterationResult` 枚举值，该值决定循环是继续、退出，还是在异步操作完成后稍后恢复：

```kotlin
enum class LoopIterationResult {
    BREAK,
    CONTINUE,
    WILL_BE_RESUMED_ASYNCHRONOUSLY
}
```

`runInfiniteLoop()` 函数处理每个结果并在必要时调度下一次迭代：

```kotlin
// 异步运行输入处理循环
fun runInfiniteLoop(
    schedule: (RequestType) -> Unit,
    iteration: (scheduleNextIteration: () -> Unit) -> LoopIterationResult,
    actionOnLoopExit: () -> Unit,
) {
    fun helper() {
        when (iteration { schedule(::helper) }) {
            LoopIterationResult.BREAK -> {
                // 运行循环后面的操作
                actionOnLoopExit()
            }

            LoopIterationResult.CONTINUE -> {
                // 调度下一次循环迭代
                schedule(::helper)
            }

            LoopIterationResult.WILL_BE_RESUMED_ASYNCHRONOUSLY -> {
                // 由另一个操作调度下一次迭代
            }
        }
    }

    // 调度第一次循环迭代
    schedule(::helper)
}
```

提醒应用程序将其输入处理逻辑传递给 `runInfiniteLoop()` 函数。
对于可以立即继续的执行路径，迭代返回 `CONTINUE`，类似于在循环中调用 `continue`：

```kotlin
val operation = command.removeFirstOrNull()
    ?: return@iteration LoopIterationResult.CONTINUE
```

对于稍后恢复的操作，迭代返回 `WILL_BE_RESUMED_ASYNCHRONOUSLY`。
例如，`fun_animation` 命令会在动画完成后调度下一次迭代：

```kotlin
"fun_animation" -> {
    printlnActor.sendRequest {
        for (frame in funAnimationFrames) {
            println(frame)
            Thread.sleep(200)
        }

        // 在动画完成后调度下一次迭代
        userInputActor.sendRequest {
            scheduleNextIteration()
        }
    }

    return@iteration LoopIterationResult.WILL_BE_RESUMED_ASYNCHRONOUSLY
}
```

最后，要停止处理用户输入，迭代返回 `BREAK`：

```kotlin
"quit" -> {
    return@iteration LoopIterationResult.BREAK
}
```

如你所见，`runInfiniteLoop()` 函数集中了继续和退出循环的逻辑，而不是要求每个执行路径直接调度下一个操作。

然而，使用诸如 `runInfiniteLoop()` 之类的函数正确实现控制流抽象可能会很困难。
例如，此实现没有处理从循环迭代、schedule 回调或 `actionOnLoopExit` 回调抛出的异常。

以下是此版本提醒应用程序的完整实现：

```kotlin
@file:OptIn(kotlin.concurrent.atomics.ExperimentalAtomicApi::class)
import kotlin.concurrent.atomics.AtomicBoolean
import kotlin.time.Clock
import kotlin.time.Duration

typealias RequestType = () -> Unit

@Suppress("PLATFORM_CLASS_MAPPED_TO_KOTLIN")
class SimpleActor {
    private val requests = mutableListOf<RequestType>()

    init {
        Thread {
            while (true) {
                val request = synchronized(requests) {
                    val request = requests.removeFirstOrNull()
                    if (request == null) {
                        (requests as Object).wait()
                        continue
                    }
                    request
                }
                request()
            }
        }.apply {
            isDaemon = true
            start()
        }
    }

    /**
     * 发送一个将在此 actor 的线程上执行的请求。
     *
     * 发送到任何给定 actor 的请求都是逐个执行的，
     * 绝不会并行执行。
     */
    fun sendRequest(
        request: RequestType,
    ) {
        synchronized(requests) {
            requests.add(request)
            (requests as Object).notify()
        }
    }
}

fun scheduleReminder(
    printlnActor: SimpleActor,
    remindIn: Duration,
    reminderText: List<String>
) {
    Thread {
        Thread.sleep(remindIn.inWholeMilliseconds)
        val stringToPrint = buildString {
            append("*** REMINDER (SCHEDULED $remindIn AGO)")
            if (reminderText.isNotEmpty()) {
                append(": ")
                for (word in reminderText) {
                    append(word)
                    append(' ')
                }
            } else {
                append(' ')
            }
            append("***")
        }
        printlnActor.sendRequest {
            println(stringToPrint)
        }
    }.apply {
        isDaemon = false
        start()
    }
}

// NEW APIS ///////////////////////////////////////////////////////////////////

enum class LoopIterationResult {
    BREAK,
    CONTINUE,
    WILL_BE_RESUMED_ASYNCHRONOUSLY
}

/**
 * 异步运行无限循环。
 *
 * [schedule] 是用于调度下一次循环迭代的命令。
 *
 * [iteration] 是循环体。
 * 它接受一个 `() -> Unit` 类型的值，调用该值将导致调度下一次迭代。
 * 将此与 [LoopIterationResult.WILL_BE_RESUMED_ASYNCHRONOUSLY] 结合使用。
 *
 * [actionOnLoopExit] 将在循环退出后运行。
 *
 * 此函数在调度第一次迭代后立即返回。
 */
fun runInfiniteLoop(
    schedule: (RequestType) -> Unit,
    iteration: (scheduleNextIteration: () -> Unit) -> LoopIterationResult,
    actionOnLoopExit: () -> Unit,
) {
    fun helper() {
        when (iteration { schedule(::helper) }) {
            LoopIterationResult.BREAK -> {
                /* 我们退出了循环。无需重新调度任何内容。 */
                actionOnLoopExit()
            }
            LoopIterationResult.CONTINUE -> {
                /* 调度下一次循环迭代 */
                schedule(::helper)
            }
            LoopIterationResult.WILL_BE_RESUMED_ASYNCHRONOUSLY -> {
                /* 无需执行任何操作，其他人将恢复该循环。 */
            }
        }
    }
    schedule(::helper)
}

// NEW API USAGE //////////////////////////////////////////////////////////////

val shouldTerminate = AtomicBoolean(false)

fun main() {
    val printlnActor = SimpleActor()
    val userInputActor = SimpleActor()

    runInfiniteLoop(
        schedule = userInputActor::sendRequest,
        iteration = iteration@{ scheduleNextIteration ->
            printlnActor.sendRequest {
                println("Please enter your input:")
            }
            val input = readlnOrNull()
                ?: return@iteration LoopIterationResult.BREAK
            val command = input
                .trim().split("\\s".toRegex())
                .toMutableList()
            val operation = command.removeFirstOrNull()
                ?: return@iteration LoopIterationResult.CONTINUE
            when (val operationInLowerCase = operation.lowercase()) {
                "remind" -> {
                    val remindIn = command.removeFirstOrNull()
                    val remindInParsed = remindIn?.let(Duration::parseOrNull)
                    if (remindInParsed == null) {
                        printlnActor.sendRequest {
                            println(buildString {
                                append("The 'remind' command requires a 'Duration' argument")
                                if (remindIn != null) {
                                    append(", got '$remindIn'")
                                }
                            })
                            println()
                            printRemindSyntax()
                        }
                    } else {
                        scheduleReminder(printlnActor, remindInParsed, command)
                        printlnActor.sendRequest {
                            println("Scheduled a reminder in $remindInParsed")
                            println("    (fires at ${Clock.System.now() + remindInParsed})")
                        }
                    }
                }
                "help" -> printlnActor.sendRequest {
                    printHelp()
                }
                "fun_animation" -> {
                    printlnActor.sendRequest {
                        for (frame in funAnimationFrames) {
                            println(frame)
                            Thread.sleep(200) // 200 毫秒
                        }
                        userInputActor.sendRequest {
                            scheduleNextIteration()
                        }
                    }
                    return@iteration LoopIterationResult.WILL_BE_RESUMED_ASYNCHRONOUSLY
                }
                "quit" -> {
                    return@iteration LoopIterationResult.BREAK
                }
                else -> printlnActor.sendRequest {
                    println("Unknown command '$operationInLowerCase'")
                    println()
                    printHelp()
                }
            }
            LoopIterationResult.CONTINUE
        },
        actionOnLoopExit = {
            printlnActor.sendRequest {
                println("All done! The program will exit once all pending reminders fire.")
                // 允许主线程退出
                shouldTerminate.store(true)
            }
        }
    )
    // 保持程序存活：如果我们直接退出主线程，
    // 所有内容都将终止。
    while (!shouldTerminate.load()) {
        Thread.sleep(100)
    }
}

private fun printHelp() {
    println("Usage:")
    printRemindSyntax()
    printFunAnimationSyntax()
    printHelpSyntax()
    printQuitSyntax()
    println()
}

private fun printRemindSyntax() {
    println("remind duration [message] - remind about something")
    println("\texample: remind 10m Turn off stove")
}

private fun printFunAnimationSyntax() {
    println("fun_animation - show a fun animation to pass the time")
}

private fun printHelpSyntax() {
    println("help - show a list of available commands")
}

private fun printQuitSyntax() {
    println("quit - exit this program")
}

private val funAnimationFrames = (
    "#       _---_#     / o o o \\#    <=========>####       o#    " +
    "  /|\\#      / \\#~@##       _---_#     / o o o \\#    <=======" +
    "==>###       o#      /|\\#      / \\#~@###       _---_#     / " +
    "o o o \\#    <=========>##       o#      /|\\#      / \\#~@## " +
    "      _---_#     / o o o \\#    <=========>#     /       \\# " +
    "   /         \\#   /    o      \\#       /|\\#       / \\#~@## " +
    "      _---_#     / o o o \\#    <=========>#     /       \\# " +
    "   /   o     \\#   /   /|\\     \\#       / \\##~@##       _---" +
    "_#     / o o o \\#    <=========>#     /  o    \\#    /  /|\\" +
    "    \\#   /   / \\     \\###~@##       _---_#     / o o o \\#  " +
    "  <=========>#     /       \\#    /         \\#   /          " +
    " \\###~@##       _---_#     / - - - \\#    <=========>######~" +
    "@#       _---_#     / - - - \\#    <=========>#       * * *#" +
    "#####~@       * * *#         *#########~"
).replace("~", "==============================")
    .replace("#", "\n")
    .split("@")
```
{collapsible="true" collapsed-title="完整的 Example4.kt 文件"}

## 挂起函数 {id="suspending-functions"}

随着依赖操作数量的增加，[基于回调的控制流](#callbacks)会变得难以维护。
Kotlin 提供了*挂起函数 (suspending functions)*，让你可以用清晰、顺序式的风格来表达异步控制流。

使用回调时，你需要单独定义异步操作之后的工作，并将其调度为回调。
而挂起函数可以在*挂起点 (suspension point)* 暂停，并在稍后从该点继续。
这保留了熟悉的控制流结构，而不需要你将每个后续步骤都表达为单独调度的回调。

要声明挂起函数，请使用 `suspend` 关键字。

在 [`src/main/kotlin/Example5.kt`](https://github.com/kotlin-hands-on/suspending-functions-intro/blob/main/src/main/kotlin/Example5.kt) 中，提醒应用程序使用挂起函数在 `suspendMain()` 函数中处理用户输入：

```kotlin
// 在挂起函数中处理用户输入
suspend fun suspendMain(
    printlnActor: SimpleActor,
    userInputActor: SimpleActor
) {
    while (true) {
        printlnActor.sendRequest {
            println("Please enter your input:")
        }

        val input = readlnOrNull() ?: break
        val command = input
            .trim().split("\\s".toRegex())
            .toMutableList()
        val operation = command.removeFirstOrNull() ?: continue

        when (val operationInLowerCase = operation.lowercase()) {
            // 处理其他命令
            /* ... */

            "quit" -> break
        }
    }

    printlnActor.sendRequest {
        println("All done! The program will exit once all pending reminders fire.")
        shouldTerminate.store(true)
    }
}
```

`suspendMain()` 函数可以直接使用 `while` 循环、`continue` 和 `break`，而无需手动使用回调协调每个执行路径。
挂起函数还可以使用熟悉的构造，例如 `return`、`try`、`catch` 和 `finally`，并调用其他挂起函数。

> 如果使用诸如 `runInfiniteLoop()` 帮助程序函数之类的[控制流抽象](#control-flow-abstractions)来重现此行为，将需要越来越复杂的调度逻辑。
>
{style="note"}

对于 `fun_animation` 命令，`suspendCoroutine()` 函数会创建一个挂起点，在动画运行时挂起，并在动画完成后恢复：

```kotlin
"fun_animation" -> {
    // 挂起执行，直到另一个操作将其恢复
    suspendCoroutine { continuation ->
        printlnActor.sendRequest {
            for (frame in funAnimationFrames) {
                println(frame)
                Thread.sleep(200)
            }

            userInputActor.sendRequest {
                // 在动画完成后恢复执行
                continuation.resumeWith(Result.success(Unit))
            }
        }
    }
}
```

在这里，[`suspendCoroutine()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.coroutines/suspend-coroutine.html) 函数会挂起执行，并提供一个 [`Continuation`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.coroutines/-continuation/) 接口的实现，该接口表示挂起点之后的执行。
这类似于[控制流抽象](#control-flow-abstractions)中的 `runInfiniteLoop()` 函数使用 `helper()` 函数来表示要调度的下一次循环迭代。

与使用回调相比，挂起函数不需要你单独定义后续工作。
编译器会创建一个 continuation，用于表示挂起点之后的执行过程。

动画完成后，[`Continuation.resumeWith()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.coroutines/-continuation/resume-with.html) 函数会携带结果恢复该执行。
然后 `suspendMain()` 函数在挂起点之后继续执行，并开始下一次循环迭代。

> 此处使用 `suspendCoroutine()` 函数仅用于演示挂起的工作原理。
> 请勿在需要支持[取消](coroutines-cancellation.md)的生产代码中使用它。
> 
{style="warning"}

要从 `main()` 函数运行挂起的 `suspendMain()` 函数，应用程序需要启动一个[*协程*](coroutines-overview.md)——这是一种可以暂停和恢复执行的可挂起计算。
`main()` 函数将 `suspendMain()` 调用包装在一个挂起 lambda 中，并使用 [`startCoroutineUninterceptedOrReturn()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.coroutines.intrinsics/start-coroutine-unintercepted-or-return.html) 函数启动该协程：

```kotlin
userInputActor.sendRequest {
    suspend {
        suspendMain(printlnActor, userInputActor)
    }.startCoroutineUninterceptedOrReturn(
        Continuation<Unit>(EmptyCoroutineContext) {
        }
    )
}
```

借助挂起函数，应用程序可以表达异步操作之间的依赖关系，而无需手动调度每个执行路径。
这使得代码中的操作顺序清晰可见，并减少了你需要维护的控制流逻辑的数量。

以下是此版本提醒应用程序的完整实现：

```kotlin
@file:OptIn(kotlin.concurrent.atomics.ExperimentalAtomicApi::class)
import kotlin.concurrent.atomics.AtomicBoolean
import kotlin.time.Clock
import kotlin.time.Duration
import kotlin.coroutines.*
import kotlin.coroutines.intrinsics.startCoroutineUninterceptedOrReturn

typealias RequestType = () -> Unit

@Suppress("PLATFORM_CLASS_MAPPED_TO_KOTLIN")
class SimpleActor {
    private val requests = mutableListOf<RequestType>()

    init {
        Thread {
            while (true) {
                val request = synchronized(requests) {
                    val request = requests.removeFirstOrNull()
                    if (request == null) {
                        (requests as Object).wait()
                        continue
                    }
                    request
                }
                request()
            }
        }.apply {
            isDaemon = true
            start()
        }
    }

    /**
     * 发送一个将在此 actor 的线程上执行的请求。
     *
     * 发送到任何给定 actor 的请求都是逐个执行的，
     * 绝不会并行执行。
     */
    fun sendRequest(
        request: RequestType,
    ) {
        synchronized(requests) {
            requests.add(request)
            (requests as Object).notify()
        }
    }
}

fun scheduleReminder(
    printlnActor: SimpleActor,
    remindIn: Duration,
    reminderText: List<String>
) {
    Thread {
        Thread.sleep(remindIn.inWholeMilliseconds)
        val stringToPrint = buildString {
            append("*** REMINDER (SCHEDULED $remindIn AGO)")
            if (reminderText.isNotEmpty()) {
                append(": ")
                for (word in reminderText) {
                    append(word)
                    append(' ')
                }
            } else {
                append(' ')
            }
            append("***")
        }
        printlnActor.sendRequest {
            println(stringToPrint)
        }
    }.apply {
        isDaemon = false
        start()
    }
}

val shouldTerminate = AtomicBoolean(false)

suspend fun suspendMain(printlnActor: SimpleActor, userInputActor: SimpleActor) {
    while (true) {
        printlnActor.sendRequest {
            println("Please enter your input:")
        }
        val input = readlnOrNull() ?: break
        val command = input
            .trim().split("\\s".toRegex())
            .toMutableList()
        val operation = command.removeFirstOrNull() ?: continue
        when (val operationInLowerCase = operation.lowercase()) {
            "remind" -> {
                val remindIn = command.removeFirstOrNull()
                val remindInParsed = remindIn?.let(Duration::parseOrNull)
                if (remindInParsed == null) {
                    printlnActor.sendRequest {
                        println(buildString {
                            append("The 'remind' command requires a 'Duration' argument")
                            if (remindIn != null) {
                                append(", got '$remindIn'")
                            }
                        })
                        println()
                        printRemindSyntax()
                    }
                } else {
                    scheduleReminder(printlnActor, remindInParsed, command)
                    printlnActor.sendRequest {
                        println("Scheduled a reminder in $remindInParsed")
                        println("    (fires at ${Clock.System.now() + remindInParsed})")
                    }
                }
            }
            "help" -> printlnActor.sendRequest {
                printHelp()
            }
            "fun_animation" -> {
                suspendCoroutine { cont ->
                    printlnActor.sendRequest {
                        for (frame in funAnimationFrames) {
                            println(frame)
                            Thread.sleep(200) // 200 毫秒
                        }
                        userInputActor.sendRequest {
                            cont.resumeWith(Result.success(Unit))
                        }
                    }
                }
            }
            "quit" -> {
                break
            }
            else -> printlnActor.sendRequest {
                println("Unknown command '$operationInLowerCase'")
                println()
                printHelp()
            }
        }
    }
    printlnActor.sendRequest {
        println("All done! The program will exit once all pending reminders fire.")
        // 允许主线程退出
        shouldTerminate.store(true)
    }
}

fun main() {
    val printlnActor = SimpleActor()
    val userInputActor = SimpleActor()

    userInputActor.sendRequest {
        suspend {
            suspendMain(printlnActor, userInputActor)
        }.startCoroutineUninterceptedOrReturn(
            Continuation<Unit>(EmptyCoroutineContext) {
            }
        )
    }

    // 保持程序存活：如果我们直接退出主线程，
    // 所有内容都将终止。
    while (!shouldTerminate.load()) {
        Thread.sleep(100)
    }
}

private fun printHelp() {
    println("Usage:")
    printRemindSyntax()
    printFunAnimationSyntax()
    printHelpSyntax()
    printQuitSyntax()
    println()
}

private fun printRemindSyntax() {
    println("remind duration [message] - remind about something")
    println("\texample: remind 10m Turn off stove")
}

private fun printFunAnimationSyntax() {
    println("fun_animation - show a fun animation to pass the time")
}

private fun printHelpSyntax() {
    println("help - show a list of available commands")
}

private fun printQuitSyntax() {
    println("quit - exit this program")
}

private val funAnimationFrames = (
    "#       _---_#     / o o o \\#    <=========>####       o#    " +
    "  /|\\#      / \\#~@##       _---_#     / o o o \\#    <=======" +
    "==>###       o#      /|\\#      / \\#~@###       _---_#     / " +
    "o o o \\#    <=========>##       o#      /|\\#      / \\#~@## " +
    "      _---_#     / o o o \\#    <=========>#     /       \\# " +
    "   /         \\#   /    o      \\#       /|\\#       / \\#~@## " +
    "      _---_#     / o o o \\#    <=========>#     /       \\# " +
    "   /   o     \\#   /   /|\\     \\#       / \\##~@##       _---" +
    "_#     / o o o \\#    <=========>#     /  o    \\#    /  /|\\" +
    "    \\#   /   / \\     \\###~@##       _---_#     / o o o \\#  " +
    "  <=========>#     /       \\#    /         \\#   /          " +
    " \\###~@##       _---_#     / - - - \\#    <=========>######~" +
    "@#       _---_#     / - - - \\#    <=========>#       * * *#" +
    "#####~@       * * *#         *#########~"
).replace("~", "==============================")
    .replace("#", "\n")
    .split("@")
```
{collapsible="true" collapsed-title="完整的 Example5.kt 文件"}

## 下一步 {id="what-s-next"}

在[协程](coroutines-overview.md)中详细了解协程及其如何支持异步和并发编程。