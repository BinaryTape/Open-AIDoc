[//]: # (title: 非同步控制流程與掛起函式)

當應用程式在處理其他工作之前等待某項操作完成時，可能會變得沒有回應。

在 JVM 上，程式碼是在執行緒上執行的。
如果負責處理事件的執行緒必須等待某項操作完成，這段期間它就無法執行其他工作。
導致執行緒等待的操作稱為*阻塞操作 (blocking operation)*。

為了保持回應能力，應用程式需要在操作進行的同時，讓獨立的工作繼續執行。
*非同步控制流程*決定了哪些工作可以繼續進行，哪些工作必須等待該操作完成。

> 下列各節使用一個小型[提醒應用程式 (reminder application)](https://github.com/kotlin-hands-on/suspending-functions-intro) 的範例，來展示管理非同步控制流程的不同方式，以及掛起函式 (suspending functions) 如何讓表達變得更簡單。
>
> 這些範例實作僅供教學之用，尚未達到正式環境可用標準。
> 若要開始在 Kotlin 中撰寫可用於正式環境的非同步程式碼，請參閱[協同程式基本概念](coroutines-basics.md)。
>
{style="note"}

## 並行計算 (Concurrent computations) {id="concurrent-computations"}

非同步控制流程最簡單的形式就是並行執行兩個操作。
當一個操作可以在另一個操作完成之前就啟動時，這兩個操作即為並行執行。

當 JVM 應用程式啟動時，JVM 會在*主執行緒 (main thread)* 上叫用其 `main()` 函式。
當主執行緒繼續執行其他程式碼時，你可以使用 [`Thread`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Thread.html) 類別在獨立的執行緒上啟動另一個操作。

在提醒應用程式的 [`src/main/kotlin/Example1.kt`](https://github.com/kotlin-hands-on/suspending-functions-intro/blob/main/src/main/kotlin/Example1.kt) 中，每個提醒都在新執行緒上啟動，而主執行緒則繼續處理使用者輸入：

```kotlin
// Starts a new thread that waits for the specified duration before printing the reminder
fun scheduleReminder(remindIn: Duration, reminderText: List<String>) {
    Thread {
        // Waits for the specified duration on a separate thread
        Thread.sleep(remindIn.inWholeMilliseconds)

        println(/* reminder text */)
    }.apply {
        // Keeps the JVM running until the reminder thread finishes
        isDaemon = false

        // Starts the thread
        start()
    }
}

fun main() {
    while (true) {
        // The main thread continues accepting commands
        println("Please enter your input:")
        val input = readlnOrNull() ?: return

        when (/* parsed command */) {
            "remind" -> {
                // The reminder starts on a new thread
                scheduleReminder(remindInParsed, command)
            }
        }
    }
}
```

在此範例中，當提醒處於待處理狀態時，你仍可繼續與應用程式進行互動。
[`start()`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Thread.html#start()) 方法會啟動每個提醒執行緒，而將 `isDaemon` 屬性設定為 `false` 可讓 JVM 保持執行，直到所有提醒執行緒完成為止。
當提醒被觸發時，提醒執行緒會將文字輸出到主執行緒用於其他輸出的同一個主控台。

該應用程式還有一個 `fun_animation` 指令，會在主執行緒上印出一連串影格：

```kotlin
"fun_animation" -> {
    for (frame in funAnimationFrames) {
        // The main thread prints each animation frame
        println(frame)

        // The main thread waits 200 milliseconds before printing the next frame
        Thread.sleep(200)
    }
}
```

由於提醒與動畫是並行執行的，因此在印出動畫時可能會觸發提醒。
結果就是，提醒文字可能會出現在動畫的中間：

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

這種交錯現象顯示了並行存取共享資源的問題：
雖然這些操作可以獨立執行，但它們可能會相互干擾。

在真實世界的應用程式中，當並行操作更新共享狀態時，也會發生類似的干擾。
例如，某個操作可能會重新計算 UI 排版，而另一個操作可能會變更顯示的內容。
如果沒有進行協調，結果可能會取決於哪個操作先完成，從而導致 UI 處於不一致的狀態。
這種無法預測的干擾現象被稱為*競爭條件 (race condition)*。

以下是此版本提醒應用程式的完整實作：

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
                    Thread.sleep(200) // 200 milliseconds
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
{collapsible="true" collapsed-title="Complete Example1.kt file"}

## 基於 Actor 的共享資源協調 {id="actor-based-shared-resource-coordination"}

當並行操作使用同一個資源時，它們需要協調該資源的使用方式。

協調存取共享資源的一種方法是採用*基於 Actor 的方法 (actor-based approach)*，由單一組件控制對該資源的存取，並一次處理一個請求。
如果該組件已經在處理請求，新的請求則會在佇列中等待。

> 許多 UI 架構使用帶有 *UI 執行緒*的類似方法。
> UI 執行緒會一次處理一個更新 UI 元素的請求。
>
{style="tip"}

在 [`src/main/kotlin/Example2.kt`](https://github.com/kotlin-hands-on/suspending-functions-intro/blob/main/src/main/kotlin/Example2.kt) 中，提醒應用程式使用 `SimpleActor` 類別來協調對主控台的存取。
Actor 會在其專屬的執行緒上，依接收到請求的順序來執行請求：

```kotlin
// Coordinates access to a shared resource by processing requests one at a time
class SimpleActor {
    private val requests = mutableListOf<() -> Unit>()

    init {
        Thread {
            while (true) {
                // Gets the next request from the queue when available
                val request = /* ... */

                // Executes one request at a time
                request()
            }
        }.apply {
            // Allows the JVM to exit while the actor thread is still running
            isDaemon = true

            // Starts the actor thread
            start()
        }
    }

    fun sendRequest(request: () -> Unit) {
        // Adds the request to the queue
        /* ... */
    }
}
```

操作不再直接呼叫 `println()` 函式，而是向同一個 actor 發送請求。
例如，提醒會在經過其指定的時間長度後，將其輸出發送給該 actor：

```kotlin
fun scheduleReminder(
    printlnActor: SimpleActor,
    remindIn: Duration,
    reminderText: List<String>
) {
    Thread {
        Thread.sleep(remindIn.inWholeMilliseconds)

        val stringToPrint = /* Creates the reminder text */

        // Sends the reminder output to the actor
        printlnActor.sendRequest {
            println(stringToPrint)
        }
    }.apply {
        isDaemon = false
        start()
    }
}
```

`fun_animation` 指令也會將其輸出發送給該 actor，且所有動畫影格都會分組在單一請求中：

```kotlin
// Sends the animation output to the actor as a single request
"fun_animation" -> printlnActor.sendRequest {
    for (frame in funAnimationFrames) {
        println(frame)
        Thread.sleep(200)
    }
}
```

在此範例中，`sendRequest()` 函式向 actor 提交請求後立即回傳，而不會等待請求完成。

Actor 一次只處理一個請求。如果 actor 在處理另一個請求時觸發了提醒，
其列印請求會在佇列中等待，直到目前請求完成。
這可以防止交錯問題，例如提醒文字出現在動畫的中間。

然而，actor 只協調它所處理的請求。
它不會決定主執行緒何時繼續，因此當 actor 仍在處理較早的請求時，主執行緒仍可繼續接受使用者輸入。
當主執行緒上的工作依賴於該請求的完成時，這點就至關重要。

以下是此版本提醒應用程式的完整實作：

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
     * Sends a request that will execute on the thread of this actor.
     *
     * Requests to any given actor execute one-by-one,
     * never in parallel.
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
                    Thread.sleep(200) // 200 milliseconds
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
{collapsible="true" collapsed-title="Complete Example2.kt file"}

## 回呼 (Callbacks) {id="callbacks"}

當某些工作必須在非同步操作完成後才能開始時，應用程式需要控制後續工作的執行時機。
你可以在*回呼 (callback)* 中定義後續的工作。
回呼是一個函式，你將它傳遞給另一個函式，以便在符合指定條件時（例如操作完成後）於稍後叫用。

在 [`src/main/kotlin/Example3.kt`](https://github.com/kotlin-hands-on/suspending-functions-intro/blob/main/src/main/kotlin/Example3.kt) 中，提醒應用程式使用回呼，以便僅在動畫完成後才繼續處理使用者輸入。
為了達成此目的，該範例加入了第二個用於處理使用者輸入的 `SimpleActor`：

```kotlin
fun main() {
    val printlnActor = SimpleActor()
    val userInputActor = SimpleActor()

    // Passes a callback that starts processing user input
    userInputActor.sendRequest {
        processUserInput(
            printlnActor,
            userInputActor,
            // Runs after input processing stops
            doLast = {
                printlnActor.sendRequest {
                    println("All done! The program will exit once all pending reminders fire.")
                }
            }
        )
    }

    // Keeps the main thread running until the application can terminate
    while (!shouldTerminate.load()) {
        Thread.sleep(100)
    }
}
```

`userInputActor` 會在其專屬的執行緒上呼叫 `processUserInput()` 函式。
不同於[基於 Actor 的共享資源協調](#基於-actor-的共享資源協調)實作中的 `while` 迴圈，每次呼叫 `processUserInput()` 函式只會讀取並處理一個指令。

在處理完 `remind` 指令、`help` 指令或未知指令後，該函式會向 `userInputActor` 發送另一個請求：

```kotlin
fun processUserInput(
    printlnActor: SimpleActor,
    userInputActor: SimpleActor,
    doLast: () -> Unit
) {
    // Processes the current command
    /* ... */

    // Schedules processing of the next command
    userInputActor.sendRequest {
        processUserInput(printlnActor, userInputActor, doLast)
    }
}
```

`userInputActor` 會將回呼放入佇列，而不是立即叫用它。
目前對 `processUserInput()` 函式的呼叫會在 actor 處理下一個請求之前回傳。
這會啟動另一個輸入處理操作，類似於啟動迴圈的下一次迭代。

對於 `fun_animation` 指令，應用程式會將下一個輸入請求延遲到動畫完成之後。
發送給 `printlnActor` 的請求會在請求處理下一個指令之前，印出所有動畫影格：

```kotlin
"fun_animation" -> {
    // Sends a request to print the animation
    printlnActor.sendRequest {
        for (frame in funAnimationFrames) {
            println(frame)
            Thread.sleep(200)
        }

        // Passes a callback that processes the next command
        // after the animation finishes
        userInputActor.sendRequest {
            processUserInput(printlnActor, userInputActor, doLast)
        }
    }

    // Prevents processUserInput() from scheduling another input request
    // before the animation finishes
    return
}
```

對於 `quit` 指令，該函式會呼叫 `doLast` 回呼，而不是排定另一個輸入請求：

```kotlin
"quit" -> {
    // Invokes the callback that runs after input processing stops
    doLast()
    return
}
```

使用回呼時，每個執行路徑都必須明確排定其後續的工作。
應用程式必須排定另一個輸入處理操作、啟動一個在完成時排定輸入處理的非同步操作，或是叫用最終的回呼。

隨著控制流程變得更加複雜，遺漏其中一項動作、執行多次，或在錯誤的執行路徑上執行，都可能會改變應用程式的行為。
這會使程式碼更難維護且更容易出錯。

以下是此版本提醒應用程式的完整實作：

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
     * Sends a request that will execute on the thread of this actor.
     *
     * Requests to any given actor execute one-by-one,
     * never in parallel.
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
        /* We emulate the `continue` from the earlier versions */
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
                    Thread.sleep(200) // 200 milliseconds
                }
                userInputActor.sendRequest {
                    processUserInput(printlnActor, userInputActor, doLast)
                }
            }
            /* We don't need to reschedule reading user input, because the
            println actor will do that on its own once it finishes. */
            return
        }
        "quit" -> {
            /* We emulate the `break` from the earlier versions by exiting the
            current iteration without rescheduling a new one, instead scheduling
            the code that comes *after* the loop. */
            doLast()
            return
        }
        else -> printlnActor.sendRequest {
            println("Unknown command '$operationInLowerCase'")
            println()
            printHelp()
        }
    }
    // Scheduling the next iteration of the loop
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
                // Allow the main thread to exit
                shouldTerminate.store(true)
            }
        })
    }
    // Keep the program alive: if we simply exit the main thread,
    // everything will terminate.
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
{collapsible="true" collapsed-title="Complete Example3.kt file"}

## 控制流程抽象 (Control-flow abstractions) {id="control-flow-abstractions"}

為了讓基於回呼的控制流程更容易理解，你可以將重複的排程邏輯移至代表常見控制流程結構（例如迴圈）的幫助程式中。

在 [`src/main/kotlin/Example4.kt`](https://github.com/kotlin-hands-on/suspending-functions-intro/blob/main/src/main/kotlin/Example4.kt) 中，提醒應用程式使用 `runInfiniteLoop()` 函式來非同步處理使用者輸入。
每次迴圈迭代都會傳回一個 `LoopIterationResult` 列舉值，用來決定迴圈是要繼續、結束，還是稍後在非同步操作完成後恢復：

```kotlin
enum class LoopIterationResult {
    BREAK,
    CONTINUE,
    WILL_BE_RESUMED_ASYNCHRONOUSLY
}
```

`runInfiniteLoop()` 函式會處理每個結果，並在需要時排定下一次迭代：

```kotlin
// Runs the input-processing loop asynchronously
fun runInfiniteLoop(
    schedule: (RequestType) -> Unit,
    iteration: (scheduleNextIteration: () -> Unit) -> LoopIterationResult,
    actionOnLoopExit: () -> Unit,
) {
    fun helper() {
        when (iteration { schedule(::helper) }) {
            LoopIterationResult.BREAK -> {
                // Runs the action that follows the loop
                actionOnLoopExit()
            }

            LoopIterationResult.CONTINUE -> {
                // Schedules the next loop iteration
                schedule(::helper)
            }

            LoopIterationResult.WILL_BE_RESUMED_ASYNCHRONOUSLY -> {
                // Another operation schedules the next iteration
            }
        }
    }

    // Schedules the first loop iteration
    schedule(::helper)
}
```

提醒應用程式將其輸入處理邏輯傳遞給 `runInfiniteLoop()` 函式。
對於可以立即繼續的執行路徑，迭代會傳回 `CONTINUE`，類似於在迴圈中呼叫 `continue`：

```kotlin
val operation = command.removeFirstOrNull()
    ?: return@iteration LoopIterationResult.CONTINUE
```

對於稍後恢復的操作，迭代會傳回 `WILL_BE_RESUMED_ASYNCHRONOUSLY`。
例如，`fun_animation` 指令會在動畫完成後排定下一次迭代：

```kotlin
"fun_animation" -> {
    printlnActor.sendRequest {
        for (frame in funAnimationFrames) {
            println(frame)
            Thread.sleep(200)
        }

        // Schedules the next iteration after the animation finishes
        userInputActor.sendRequest {
            scheduleNextIteration()
        }
    }

    return@iteration LoopIterationResult.WILL_BE_RESUMED_ASYNCHRONOUSLY
}
```

最後，若要停止處理使用者輸入，迭代會傳回 `BREAK`：

```kotlin
"quit" -> {
    return@iteration LoopIterationResult.BREAK
}
```

如你所見，`runInfiniteLoop()` 函式集中處理了繼續與結束迴圈的邏輯，而不是要求每個執行路徑直接排定下一個操作。

然而，使用類似 `runInfiniteLoop()` 的函式正確實作控制流程抽象可能很困難。
例如，此實作並未處理從迴圈迭代、排程回呼或 `actionOnLoopExit` 回呼中擲出的例外。

以下是此版本提醒應用程式的完整實作：

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
     * Sends a request that will execute on the thread of this actor.
     *
     * Requests to any given actor execute one-by-one,
     * never in parallel.
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
 * Runs an infinite loop asynchronously.
 *
 * [schedule] is the command that will be invoked to schedule
 * the next loop iteration.
 *
 * [iteration] is the loop body.
 * It accepts a value of type `() -> Unit` invoking which will cause
 * the next iteration to be scheduled.
 * Use this in conjunction with
 * [LoopIterationResult.WILL_BE_RESUMED_ASYNCHRONOUSLY].
 *
 * [actionOnLoopExit] will be run once the loop exits.
 *
 * This function returns immediately after scheduling the first iteration.
 */
fun runInfiniteLoop(
    schedule: (RequestType) -> Unit,
    iteration: (scheduleNextIteration: () -> Unit) -> LoopIterationResult,
    actionOnLoopExit: () -> Unit,
) {
    fun helper() {
        when (iteration { schedule(::helper) }) {
            LoopIterationResult.BREAK -> {
                /* We exited the loop. No need to reschedule anything. */
                actionOnLoopExit()
            }
            LoopIterationResult.CONTINUE -> {
                /* Schedule the next loop iteration */
                schedule(::helper)
            }
            LoopIterationResult.WILL_BE_RESUMED_ASYNCHRONOUSLY -> {
                /* No need to do anything, someone else will resume the loop. */
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
                            Thread.sleep(200) // 200 milliseconds
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
                // Allow the main thread to exit
                shouldTerminate.store(true)
            }
        }
    )
    // Keep the program alive: if we simply exit the main thread,
    // everything will terminate.
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
{collapsible="true" collapsed-title="Complete Example4.kt file"}

## 掛起函式 (Suspending functions) {id="suspending-functions"}

隨著相依操作數量的增加，[基於回呼的控制流程](#回呼-callbacks)可能會變得難以維護。
Kotlin 提供了*掛起函式 (suspending functions)*，讓你能夠以清晰、循序的風格來表達非同步控制流程。

使用回呼時，你需要單獨定義非同步操作之後的工作，並將其排定為回呼。
而掛起函式則可以在*掛起點 (suspension point)* 暫停，並在稍後從該點繼續執行。
這保留了常見的控制流程結構，無需將每個後續步驟都表達為單獨排定的回呼。

若要宣告掛起函式，請使用 `suspend` 關鍵字。

在 [`src/main/kotlin/Example5.kt`](https://github.com/kotlin-hands-on/suspending-functions-intro/blob/main/src/main/kotlin/Example5.kt) 中，提醒應用程式在 `suspendMain()` 函式中使用掛起函式來處理使用者輸入：

```kotlin
// Processes user input in a suspending function
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
            // Handles other commands
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

`suspendMain()` 函式可以直接使用 `while` 迴圈、`continue` 與 `break`，而不需要手動使用回呼協調每個執行路徑。
掛起函式也可以使用熟悉的結構，例如 `return`、`try`、`catch` 與 `finally`，並呼叫其他掛起函式。

> 若要使用類似 `runInfiniteLoop()` 幫助函式等[控制流程抽象](#控制流程抽象-control-flow-abstractions)來重新建立此行為，將需要越來越複雜的排程邏輯。
>
{style="note"}

對於 `fun_animation` 指令，`suspendCoroutine()` 函式會建立一個掛起點，在動畫執行時暫停，並在動畫完成後恢復：

```kotlin
"fun_animation" -> {
    // Suspends execution until another operation resumes it
    suspendCoroutine { continuation ->
        printlnActor.sendRequest {
            for (frame in funAnimationFrames) {
                println(frame)
                Thread.sleep(200)
            }

            userInputActor.sendRequest {
                // Resumes execution after the animation finishes
                continuation.resumeWith(Result.success(Unit))
            }
        }
    }
}
```

在此，[`suspendCoroutine()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.coroutines/suspend-coroutine.html) 函式會暫停執行，並提供一個 [`Continuation`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.coroutines/-continuation/) 介面的實作，該實作代表掛起點之後要執行的內容。
這類似於[控制流程抽象](#控制流程抽象-control-flow-abstractions)中的 `runInfiniteLoop()` 函式如何使用 `helper()` 函式來代表要排定的下一次迴圈迭代。

與使用回呼相比，掛起函式不需要單獨定義後續工作。
編譯器會建立一個代表掛起點之後執行的延續體 (continuation)。

動畫完成後，[`Continuation.resumeWith()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.coroutines/-continuation/resume-with.html) 函式會帶著結果恢復該執行。
接著，`suspendMain()` 函式會在掛起點之後繼續執行，並開始下一次迴圈迭代。

> 這裡使用 `suspendCoroutine()` 函式僅是為了展示暫停機制如何運作。
> 請勿在需要支援[取消機制](coroutines-cancellation.md)的正式環境程式碼中使用它。
> 
{style="warning"}

若要從 `main()` 函式執行掛起的 `suspendMain()` 函式，應用程式會啟動一個[_協同程式 (coroutine)_](coroutines-overview.md)，這是一種可暫停與恢復執行的可暫停計算。
`main()` 函式將 `suspendMain()` 呼叫包裝在一個掛起 Lambda 中，並使用 [`startCoroutineUninterceptedOrReturn()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.coroutines.intrinsics/start-coroutine-unintercepted-or-return.html) 函式啟動協同程式：

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

透過掛起函式，應用程式可以表達非同步操作之間的相依性，而無需手動排定每個執行路徑。
這讓操作順序在程式碼中清晰可見，並減少了需要維護的控制流程邏輯數量。

以下是此版本提醒應用程式的完整實作：

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
     * Sends a request that will execute on the thread of this actor.
     *
     * Requests to any given actor execute one-by-one,
     * never in parallel.
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
                            Thread.sleep(200) // 200 milliseconds
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
        // Allow the main thread to exit
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

    // Keep the program alive: if we simply exit the main thread,
    // everything will terminate.
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
{collapsible="true" collapsed-title="Complete Example5.kt file"}

## 後續步驟 {id="what-s-next"}

若要進一步了解協同程式以及它們如何支援非同步與並行程式設計，請參閱[協同程式 (Coroutines)](coroutines-overview.md)。