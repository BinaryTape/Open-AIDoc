[//]: # (title: 비동기 제어 흐름과 중단 함수)

애플리케이션이 다른 작업을 처리하기 전에 특정 작업이 완료되기를 기다리면 응답하지 않는 상태(unresponsive)가 될 수 있습니다.

JVM에서 코드는 스레드 상에서 실행됩니다.
이벤트를 처리하는 스레드가 어떤 작업이 끝나기를 기다려야 한다면, 그동안 다른 작업을 수행할 수 없습니다.
스레드를 대기하게 만드는 이러한 작업을 _블로킹 연산(blocking operation)_이라고 합니다.

응답성을 유지하기 위해 애플리케이션은 특정 작업이 진행되는 동안에도 독립적인 다른 작업이 계속 실행되도록 해야 합니다.
_비동기 제어 흐름(Asynchronous control flow)_은 어떤 작업이 계속 진행될 수 있고, 어떤 작업이 특정 작업의 완료를 기다려야 하는지를 결정합니다.

> 다음 섹션들에서는 간단한 [알림 애플리케이션(reminder application)](https://github.com/kotlin-hands-on/suspending-functions-intro) 예제를 사용하여 비동기 제어 흐름을 관리하는 다양한 방법과 중단 함수(suspending function)가 이를 어떻게 더 쉽게 표현할 수 있도록 해주는지 보여줍니다.
>
> 예제 구현은 학습 목적으로 작성되었으며 프로덕션 환경에 바로 사용할 수 있는 수준은 아닙니다.
> Kotlin에서 프로덕션 환경에 적합한 비동기 코드를 작성하는 방법을 알아보려면 [코루틴 기초(Coroutine basics)](coroutines-basics.md)를 참조하세요.
>
{style="note"}

## 동시성 계산 (Concurrent computations) {id="concurrent-computations"}

비동기 제어 흐름의 가장 단순한 형태는 두 작업을 동시에(concurrently) 실행하는 것입니다.
두 작업 중 하나가 끝나기 전에 다른 하나가 시작될 수 있을 때, 이 두 작업은 동시에 실행된다고 합니다.

JVM 애플리케이션이 시작되면 JVM은 _메인 스레드(main thread)_에서 `main()` 함수를 호출합니다.
메인 스레드가 다른 코드를 계속 실행하는 동안, [`Thread`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Thread.html) 클래스를 사용하여 별도의 스레드에서 또 다른 작업을 시작할 수 있습니다.

알림 애플리케이션의 [`src/main/kotlin/Example1.kt`](https://github.com/kotlin-hands-on/suspending-functions-intro/blob/main/src/main/kotlin/Example1.kt)에서는 메인 스레드가 사용자 입력을 계속 처리하는 동안 각 알림이 새로운 스레드에서 시작됩니다.

```kotlin
// 알림을 출력하기 전에 지정된 시간 동안 대기하는 새 스레드를 시작합니다.
fun scheduleReminder(remindIn: Duration, reminderText: List<String>) {
    Thread {
        // 별도의 스레드에서 지정된 시간 동안 대기합니다.
        Thread.sleep(remindIn.inWholeMilliseconds)

        println(/* reminder text */)
    }.apply {
        // 알림 스레드가 완료될 때까지 JVM이 계속 실행되도록 유지합니다.
        isDaemon = false

        // 스레드를 시작합니다.
        start()
    }
}

fun main() {
    while (true) {
        // 메인 스레드는 명령을 계속해서 받습니다.
        println("Please enter your input:")
        val input = readlnOrNull() ?: return

        when (/* parsed command */) {
            "remind" -> {
                // 알림이 새 스레드에서 시작됩니다.
                scheduleReminder(remindInParsed, command)
            }
        }
    }
}
```

이 예제에서는 알림이 보류 중인 상태에서도 애플리케이션과 계속 상호작용할 수 있습니다.
[`start()`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Thread.html#start()) 메서드는 각 알림 스레드를 시작하며, `isDaemon` 프로퍼티를 `false`로 설정하면 모든 알림 스레드가 끝날 때까지 JVM이 계속 실행됩니다.
알림이 트리거되면 알림 스레드는 메인 스레드가 다른 출력에 사용하는 것과 동일한 콘솔에 텍스트를 출력합니다.

애플리케이션에는 메인 스레드에서 일련의 프레임을 출력하는 `fun_animation` 명령도 있습니다.

```kotlin
"fun_animation" -> {
    for (frame in funAnimationFrames) {
        // 메인 스레드가 각 애니메이션 프레임을 출력합니다.
        println(frame)

        // 메인 스레드는 다음 프레임을 출력하기 전에 200밀리초 동안 대기합니다.
        Thread.sleep(200)
    }
}
```

알림이 애니메이션과 동시에 실행되기 때문에 애니메이션이 출력되는 도중에 알림이 트리거될 수 있습니다.
그 결과, 애니메이션 중간에 알림 텍스트가 나타날 수 있습니다.

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

이렇게 텍스트가 섞여 출력되는(interleaving) 현상은 공유 리소스에 동시에 접근할 때 발생하는 문제를 보여줍니다.
작업들이 독립적으로 실행될 수는 있지만, 서로 간섭을 일으킬 수 있습니다.

실제 애플리케이션에서도 동시성 작업들이 공유 상태(shared state)를 업데이트할 때 유사한 간섭이 발생할 수 있습니다.
예를 들어, 한 작업이 UI 레이아웃을 다시 계산하는 동안 다른 작업이 표시되는 내용을 변경할 수 있습니다.
조율(coordination)이 없다면 어떤 작업이 먼저 끝나는지에 따라 결과가 달라져 UI가 비정상적인 상태에 놓일 수 있습니다.
이러한 형태의 예측 불가능한 간섭을 _경쟁 상태(race condition)_라고 합니다.

다음은 알림 애플리케이션의 이 버전 전체 구현 코드입니다.

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
{collapsible="true" collapsed-title="Example1.kt 전체 파일"}

## 액터 기반 공유 리소스 조율 (Actor-based shared resource coordination) {id="actor-based-shared-resource-coordination"}

동시성 작업들이 동일한 리소스를 사용할 때는 해당 리소스의 사용 방식을 조율해야 합니다.

공유 리소스에 대한 접근을 조율하는 한 가지 방법은 단일 컴포넌트가 리소스에 대한 접근을 제어하고 한 번에 하나의 요청만 처리하는 _액터 기반 접근 방식(actor-based approach)_을 사용하는 것입니다.
컴포넌트가 이미 요청을 처리 중인 경우, 새로운 요청은 큐에서 대기합니다.

> 많은 UI 프레임워크가 _UI 스레드_를 사용하여 이와 유사한 방식을 취합니다.
> UI 스레드는 UI 요소를 업데이트하라는 요청을 한 번에 하나씩 처리합니다.
>
{style="tip"}

[`src/main/kotlin/Example2.kt`](https://github.com/kotlin-hands-on/suspending-functions-intro/blob/main/src/main/kotlin/Example2.kt)에서 알림 애플리케이션은 `SimpleActor` 클래스를 사용하여 콘솔에 대한 접근을 조율합니다.
액터는 수신한 순서대로 전용 스레드에서 요청을 실행합니다.

```kotlin
// 요청을 한 번에 하나씩 처리하여 공유 리소스에 대한 접근을 조율합니다.
class SimpleActor {
    private val requests = mutableListOf<() -> Unit>()

    init {
        Thread {
            while (true) {
                // 사용 가능할 때 큐에서 다음 요청을 가져옵니다.
                val request = /* ... */

                // 한 번에 하나의 요청만 실행합니다.
                request()
            }
        }.apply {
            // 액터 스레드가 계속 실행 중이더라도 JVM이 종료될 수 있도록 허용합니다.
            isDaemon = true

            // 액터 스레드를 시작합니다.
            start()
        }
    }

    fun sendRequest(request: () -> Unit) {
        // 큐에 요청을 추가합니다.
        /* ... */
    }
}
```

작업들은 `println()` 함수를 직접 호출하는 대신 동일한 액터로 요청을 보냅니다.
예를 들어, 알림은 지정된 시간이 경과한 후 액터로 출력을 전송합니다.

```kotlin
fun scheduleReminder(
    printlnActor: SimpleActor,
    remindIn: Duration,
    reminderText: List<String>
) {
    Thread {
        Thread.sleep(remindIn.inWholeMilliseconds)

        val stringToPrint = /* 알림 텍스트 생성 */

        // 액터로 알림 출력을 전송합니다.
        printlnActor.sendRequest {
            println(stringToPrint)
        }
    }.apply {
        isDaemon = false
        start()
    }
}
```

`fun_animation` 명령 역시 모든 애니메이션 프레임을 단일 요청으로 그룹화하여 액터로 출력을 전송합니다.

```kotlin
// 애니메이션 출력을 단일 요청으로 액터에 보냅니다.
"fun_animation" -> printlnActor.sendRequest {
    for (frame in funAnimationFrames) {
        println(frame)
        Thread.sleep(200)
    }
}
```

이 예제에서 `sendRequest()` 함수는 요청을 액터에 제출하고 요청이 완료될 때까지 기다리지 않고 즉시 반환됩니다.

액터는 요청을 한 번에 하나씩 처리합니다. 액터가 다른 요청을 처리하는 중에 알림이 트리거되면, 해당 출력 요청은 현재 요청이 완료될 때까지 큐에서 대기합니다.
이를 통해 애니메이션 중간에 알림 텍스트가 나타나는 것과 같은 인터리빙 문제를 방지할 수 있습니다.

그러나 액터는 자신이 처리하는 요청들만 조율할 뿐입니다.
메인 스레드가 언제 계속 실행될지는 결정하지 않으므로, 액터가 이전 요청을 처리하는 동안에도 메인 스레드는 사용자 입력을 계속 받을 수 있습니다.
메인 스레드의 작업이 이전 요청의 완료 여부에 의존하는 경우 문제가 될 수 있습니다.

다음은 알림 애플리케이션의 이 버전 전체 구현 코드입니다.

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
     * 이 액터의 스레드에서 실행될 요청을 보냅니다.
     *
     * 특정 액터로의 요청은 절대 병렬로 실행되지 않고
     * 하나씩 차례대로 실행됩니다.
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
            "fun_animation" -> {
                printlnActor.sendRequest {
                    for (frame in funAnimationFrames) {
                        println(frame)
                        Thread.sleep(200) // 200 milliseconds
                    }
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
{collapsible="true" collapsed-title="Example2.kt 전체 파일"}

## 콜백 (Callbacks) {id="callbacks"}

비동기 연산이 끝난 후에 특정 작업이 시작되어야 할 때, 애플리케이션은 후속 작업이 실행되는 시점을 제어해야 합니다.
이러한 후속 작업은 _콜백(callback)_으로 정의할 수 있습니다.
콜백은 작업 완료와 같이 지정된 조건이 충족되었을 때 나중에 호출되도록 다른 함수에 전달하는 함수입니다.

[`src/main/kotlin/Example3.kt`](https://github.com/kotlin-hands-on/suspending-functions-intro/blob/main/src/main/kotlin/Example3.kt)에서 알림 애플리케이션은 콜백을 사용하여 애니메이션이 끝난 후에만 사용자 입력 처리를 재개합니다.
이를 위해 예제에서는 사용자 입력을 처리하기 위한 두 번째 `SimpleActor`를 추가합니다.

```kotlin
fun main() {
    val printlnActor = SimpleActor()
    val userInputActor = SimpleActor()

    // 사용자 입력 처리를 시작하는 콜백을 전달합니다.
    userInputActor.sendRequest {
        processUserInput(
            printlnActor,
            userInputActor,
            // 입력 처리가 중단된 후에 실행됩니다.
            doLast = {
                printlnActor.sendRequest {
                    println("All done! The program will exit once all pending reminders fire.")
                }
            }
        )
    }

    // 애플리케이션이 종료될 수 있을 때까지 메인 스레드를 계속 실행 상태로 유지합니다.
    while (!shouldTerminate.load()) {
        Thread.sleep(100)
    }
}
```

`userInputActor`는 전용 스레드에서 `processUserInput()` 함수를 호출합니다.
[액터 기반 공유 리소스 조율](#actor-based-shared-resource-coordination) 구현의 `while` 루프와 달리, `processUserInput()` 함수는 한 번 호출될 때마다 하나의 명령만 읽고 처리합니다.

`remind` 명령, `help` 명령 또는 알 수 없는 명령을 처리한 후, 함수는 `userInputActor`로 또 다른 요청을 보냅니다.

```kotlin
fun processUserInput(
    printlnActor: SimpleActor,
    userInputActor: SimpleActor,
    doLast: () -> Unit
) {
    // 현재 명령을 처리합니다.
    /* ... */

    // 다음 명령 처리를 스케줄링합니다.
    userInputActor.sendRequest {
        processUserInput(printlnActor, userInputActor, doLast)
    }
}
```

`userInputActor`는 콜백을 즉시 호출하지 않고 큐에 넣습니다.
현재 호출된 `processUserInput()` 함수는 액터가 다음 요청을 처리하기 전에 반환됩니다.
이는 루프의 다음 반복을 시작하는 것과 유사하게 또 다른 입력 처리 작업을 시작합니다.

`fun_animation` 명령의 경우, 애플리케이션은 애니메이션이 끝날 때까지 다음 입력 요청을 지연시킵니다.
`printlnActor`로 전송된 요청은 모든 애니메이션 프레임을 출력한 후에 다음 명령 처리를 요청합니다.

```kotlin
"fun_animation" -> {
    // 애니메이션을 출력하는 요청을 보냅니다.
    printlnActor.sendRequest {
        for (frame in funAnimationFrames) {
            println(frame)
            Thread.sleep(200)
        }

        // 애니메이션이 끝난 후 다음 명령을 처리하는 콜백을 전달합니다.
        userInputActor.sendRequest {
            processUserInput(printlnActor, userInputActor, doLast)
        }
    }

    // 애니메이션이 끝나기 전에 processUserInput()이
    // 다른 입력 요청을 스케줄링하지 못하도록 방지합니다.
    return
}
```

`quit` 명령의 경우 함수는 다른 입력 요청을 스케줄링하는 대신 `doLast` 콜백을 호출합니다.

```kotlin
"quit" -> {
    // 입력 처리가 중단된 후 실행되는 콜백을 호출합니다.
    doLast()
    return
}
```

콜백을 사용하면 각 실행 경로(execution path)에서 그 뒤에 이어질 작업을 명시적으로 스케줄링해야 합니다.
애플리케이션은 또 다른 입력 처리 작업을 스케줄링하거나, 완료 시 입력 처리를 스케줄링하는 비동기 연산을 시작하거나, 최종 콜백을 호출해야 합니다.

제어 흐름이 더 복잡해짐에 따라 이러한 작업 중 하나를 누락하거나, 두 번 이상 수행하거나, 잘못된 실행 경로에서 수행하면 애플리케이션의 동작이 달라질 수 있습니다.
이로 인해 코드를 유지 관리하기가 더 어려워지고 오류가 발생하기 쉬워집니다.

다음은 알림 애플리케이션의 이 버전 전체 구현 코드입니다.

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
{collapsible="true" collapsed-title="Example3.kt 전체 파일"}

## 제어 흐름 추상화 (Control-flow abstractions) {id="control-flow-abstractions"}

콜백 기반 제어 흐름을 더 쉽게 따라갈 수 있도록, 반복되는 스케줄링 로직을 루프와 같이 익숙한 제어 흐름 구조를 나타내는 헬퍼 함수로 옮길 수 있습니다.

[`src/main/kotlin/Example4.kt`](https://github.com/kotlin-hands-on/suspending-functions-intro/blob/main/src/main/kotlin/Example4.kt)에서 알림 애플리케이션은 `runInfiniteLoop()` 함수를 사용하여 사용자 입력을 비동기적으로 처리합니다.
각 루프 반복은 루프가 계속될지, 종료될지, 아니면 비동기 작업이 끝난 후 나중에 재개될지를 결정하는 `LoopIterationResult` enum 값을 반환합니다.

```kotlin
enum class LoopIterationResult {
    BREAK,
    CONTINUE,
    WILL_BE_RESUMED_ASYNCHRONOUSLY
}
```

`runInfiniteLoop()` 함수는 각 결과를 처리하고 필요한 경우 다음 반복을 스케줄링합니다.

```kotlin
// 입력 처리 루프를 비동기적으로 실행합니다.
fun runInfiniteLoop(
    schedule: (RequestType) -> Unit,
    iteration: (scheduleNextIteration: () -> Unit) -> LoopIterationResult,
    actionOnLoopExit: () -> Unit,
) {
    fun helper() {
        when (iteration { schedule(::helper) }) {
            LoopIterationResult.BREAK -> {
                // 루프가 끝난 후의 액션을 실행합니다.
                actionOnLoopExit()
            }

            LoopIterationResult.CONTINUE -> {
                // 다음 루프 반복을 스케줄링합니다.
                schedule(::helper)
            }

            LoopIterationResult.WILL_BE_RESUMED_ASYNCHRONOUSLY -> {
                // 다른 작업에서 다음 반복을 스케줄링합니다.
            }
        }
    }

    // 첫 번째 루프 반복을 스케줄링합니다.
    schedule(::helper)
}
```

알림 애플리케이션은 입력 처리 로직을 `runInfiniteLoop()` 함수에 전달합니다.
즉시 계속 진행할 수 있는 실행 경로의 경우, 루프에서 `continue`를 호출하는 것과 유사하게 `CONTINUE`를 반환합니다.

```kotlin
val operation = command.removeFirstOrNull()
    ?: return@iteration LoopIterationResult.CONTINUE
```

나중에 재개되는 작업의 경우 반복은 `WILL_BE_RESUMED_ASYNCHRONOUSLY`를 반환합니다.
예를 들어 `fun_animation` 명령은 애니메이션이 끝난 후 다음 반복을 스케줄링합니다.

```kotlin
"fun_animation" -> {
    printlnActor.sendRequest {
        for (frame in funAnimationFrames) {
            println(frame)
            Thread.sleep(200)
        }

        // 애니메이션이 끝난 후 다음 반복을 스케줄링합니다.
        userInputActor.sendRequest {
            scheduleNextIteration()
        }
    }

    return@iteration LoopIterationResult.WILL_BE_RESUMED_ASYNCHRONOUSLY
}
```

마지막으로 사용자 입력 처리를 중단하려면 반복에서 `BREAK`를 반환합니다.

```kotlin
"quit" -> {
    return@iteration LoopIterationResult.BREAK
}
```

보시다시피 `runInfiniteLoop()` 함수는 각 실행 경로에서 다음 작업을 직접 스케줄링하도록 요구하는 대신 루프를 계속하거나 종료하는 로직을 중앙 집중화합니다.

그러나 `runInfiniteLoop()`와 같은 함수를 사용하여 제어 흐름 추상화를 올바르게 구현하는 것은 어려울 수 있습니다.
예를 들어, 이 구현은 루프 반복, 스케줄 콜백 또는 `actionOnLoopExit` 콜백에서 발생하는 예외를 처리하지 않습니다.

다음은 알림 애플리케이션의 이 버전 전체 구현 코드입니다.

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
{collapsible="true" collapsed-title="Example4.kt 전체 파일"}

## 중단 함수 (Suspending functions) {id="suspending-functions"}

[콜백 기반 제어 흐름](#callbacks)은 의존적인 작업의 수가 늘어남에 따라 유지 관리가 어려워질 수 있습니다.
Kotlin은 비동기 제어 흐름을 명확하고 순차적인(sequential) 스타일로 표현할 수 있도록 _중단 함수(suspending function)_를 제공합니다.

콜백을 사용하면 비동기 작업에 이어지는 작업을 별도로 정의하고 이를 콜백으로 스케줄링해야 합니다.
반면, 중단 함수는 _중단 지점(suspension point)_에서 일시 정지한 후 나중에 해당 지점부터 실행을 계속할 수 있습니다.
따라서 이후의 각 단계를 별도로 스케줄링되는 콜백으로 표현할 필요 없이 익숙한 제어 흐름 구조를 그대로 유지할 수 있습니다.

중단 함수를 선언하려면 `suspend` 키워드를 사용합니다.

[`src/main/kotlin/Example5.kt`](https://github.com/kotlin-hands-on/suspending-functions-intro/blob/main/src/main/kotlin/Example5.kt)에서 알림 애플리케이션은 중단 함수를 사용하여 `suspendMain()` 함수에서 사용자 입력을 처리합니다.

```kotlin
// 중단 함수 내에서 사용자 입력을 처리합니다.
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
            // 다른 명령들을 처리합니다.
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

`suspendMain()` 함수는 콜백으로 각 실행 경로를 수동으로 조율하는 대신 `while` 루프, `continue`, `break`를 직접 사용할 수 있습니다.
또한 중단 함수는 `return`, `try`, `catch`, `finally`와 같은 익숙한 구조를 사용할 수 있으며 다른 중단 함수를 호출할 수도 있습니다.

> `runInfiniteLoop()` 헬퍼 함수와 같은 [제어 흐름 추상화](#control-flow-abstractions)로 이 동작을 다시 구현하려면 점점 더 복잡한 스케줄링 로직이 필요하게 됩니다.
>
{style="note"}

`fun_animation` 명령의 경우, `suspendCoroutine()` 함수가 중단 지점을 생성하고, 애니메이션이 실행되는 동안 중단되었다가 완료된 후에 다시 재개됩니다.

```kotlin
"fun_animation" -> {
    // 다른 작업이 재개할 때까지 실행을 중단합니다.
    suspendCoroutine { continuation ->
        printlnActor.sendRequest {
            for (frame in funAnimationFrames) {
                println(frame)
                Thread.sleep(200)
            }

            userInputActor.sendRequest {
                // 애니메이션이 완료된 후 실행을 재개합니다.
                continuation.resumeWith(Result.success(Unit))
            }
        }
    }
}
```

여기서 [`suspendCoroutine()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.coroutines/suspend-coroutine.html) 함수는 실행을 중단하고 중단 지점 이후의 실행을 나타내는 [`Continuation`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.coroutines/-continuation/) 인터페이스 구현을 제공합니다.
이는 [제어 흐름 추상화](#control-flow-abstractions)의 `runInfiniteLoop()` 함수가 `helper()` 함수를 사용하여 스케줄링할 다음 루프 반복을 나타내는 방식과 유사합니다.

콜백을 사용하는 것과 비교했을 때, 중단 함수는 후속 작업을 별도로 정의할 필요가 없습니다.
컴파일러가 중단 지점 이후의 실행을 나타내는 continuation을 생성합니다.

애니메이션이 완료된 후, [`Continuation.resumeWith()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.coroutines/-continuation/resume-with.html) 함수는 결과와 함께 해당 실행을 재개합니다.
그런 다음 `suspendMain()` 함수는 중단 지점 이후부터 계속 진행되어 다음 루프 반복을 시작합니다.

> `suspendCoroutine()` 함수는 중단(suspension)이 어떻게 동작하는지 보여주기 위해서만 사용되었습니다.
> [취소(cancellation)](coroutines-cancellation.md)를 지원해야 하는 프로덕션 코드에서는 사용하지 마세요.
> 
{style="warning"}

`main()` 함수에서 중단 함수인 `suspendMain()`을 실행하기 위해 애플리케이션은 실행을 일시 정지하고 재개할 수 있는 중단 가능한 연산인 [_코루틴(coroutine)_](coroutines-overview.md)을 시작합니다.
`main()` 함수는 `suspendMain()` 호출을 중단 람다로 감싸고 [`startCoroutineUninterceptedOrReturn()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.coroutines.intrinsics/start-coroutine-unintercepted-or-return.html) 함수를 사용하여 코루틴을 시작합니다.

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

중단 함수를 사용하면 각 실행 경로를 수동으로 스케줄링하지 않고도 비동기 작업 간의 의존성을 표현할 수 있습니다.
이를 통해 코드에서 작업의 순서를 명확하게 파악할 수 있으며 유지 관리해야 하는 제어 흐름 로직의 양을 줄일 수 있습니다.

다음은 알림 애플리케이션의 이 버전 전체 구현 코드입니다.

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
{collapsible="true" collapsed-title="Example5.kt 전체 파일"}

## 다음 단계 {id="what-s-next"}

코루틴 및 코루틴이 비동기 및 동시성 프로그래밍을 지원하는 방식에 대해 자세히 알아보려면 [코루틴(Coroutines)](coroutines-overview.md)을 참조하세요.