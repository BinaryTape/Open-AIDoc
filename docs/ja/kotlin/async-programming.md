[//]: # (title: 非同期制御フローと中断関数)

アプリケーションは、他の作業を処理する前にある操作の完了を待っていると、応答しなくなる（フリーズする）ことがあります。

JVM上では、コードはスレッド上で実行されます。
イベント処理を担当するスレッドがある操作の完了を待機しなければならない場合、その間は他の作業を行うことができません。
スレッドを待機させるような操作は、*ブロッキング操作 (blocking operation)* として知られています。

応答性を維持するために、アプリケーションはある操作が進行中であっても独立した別の作業を継続できるようにする必要があります。
*非同期制御フロー (Asynchronous control flow)* は、どの作業を継続でき、どの作業が操作の完了を待たなければならないかを決定します。

> 以下のセクションでは、小さな[リマインダーアプリケーション](https://github.com/kotlin-hands-on/suspending-functions-intro)の例を使用して、非同期制御フローを管理するさまざまな方法と、中断関数（suspending functions）によってそれをどのように簡単に表現できるかを説明します。
>
> このサンプル実装は学習目的のものであり、本番環境に対応したものではありません。
> Kotlinで本番環境対応の非同期コードを記述する方法については、[コルーチンの基本](coroutines-basics.md)を参照してください。
>
{style="note"}

## 並行計算 (Concurrent computations) {id="concurrent-computations"}

非同期制御フローの最も単純な形式は、2つの操作を並行して実行することです。
一方の操作が完了する前にもう一方が開始できる場合、2つの操作は並行して実行されています。

JVMアプリケーションが起動すると、JVMは*メインスレッド*上でその `main()` 関数を呼び出します。
メインスレッドが他のコードの実行を継続している間に、[`Thread`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Thread.html) クラスを使用して別のスレッドで別の操作を開始できます。

リマインダーアプリケーションの [`src/main/kotlin/Example1.kt`](https://github.com/kotlin-hands-on/suspending-functions-intro/blob/main/src/main/kotlin/Example1.kt) では、メインスレッドがユーザー入力の処理を継続している間に、各リマインダーが新しいスレッドで開始されます。

```kotlin
// 指定された時間待機した後にリマインダーを出力する新しいスレッドを開始します
fun scheduleReminder(remindIn: Duration, reminderText: List<String>) {
    Thread {
        // 別スレッドで指定された時間待機します
        Thread.sleep(remindIn.inWholeMilliseconds)

        println(/* reminder text */)
    }.apply {
        // リマインダースレッドが終了するまでJVMを実行し続けます
        isDaemon = false

        // スレッドを開始します
        start()
    }
}

fun main() {
    while (true) {
        // メインスレッドはコマンドの受け付けを継続します
        println("Please enter your input:")
        val input = readlnOrNull() ?: return

        when (/* parsed command */) {
            "remind" -> {
                // リマインダーが新しいスレッドで開始されます
                scheduleReminder(remindInParsed, command)
            }
        }
    }
}
```

この例では、リマインダーが保留中の間もアプリケーションとの対話を継続できます。
[`start()`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Thread.html#start()) メソッドは各リマインダースレッドを開始し、`isDaemon` プロパティを `false` に設定することで、すべてのリマインダースレッドが完了するまでJVMが実行を継続します。
リマインダーがトリガーされると、リマインダースレッドはそのテキストをメインスレッドが他の出力に使用しているのと同じコンソールに出力します。

このアプリケーションには、メインスレッドで一連のフレームを出力する `fun_animation` コマンドもあります。

```kotlin
"fun_animation" -> {
    for (frame in funAnimationFrames) {
        // メインスレッドがアニメーションの各フレームを出力します
        println(frame)

        // メインスレッドは次のフレームを出力する前に200ミリ秒待機します
        Thread.sleep(200)
    }
}
```

リマインダーはアニメーションと並行して実行されるため、アニメーションの出力中にリマインダーがトリガーされる可能性があります。
その結果、リマインダーのテキストがアニメーションの途中に現れることがあります。

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

このように入り混じってしまう動作（インターリーブ）は、共有リソースへの並行アクセスに関する問題を示しています。
操作は独立して実行できるものの、互いに干渉し合う可能性があります。

実際のアプリケーションでは、並行操作が共有状態を更新するときに同様の干渉が発生する可能性があります。
たとえば、ある操作がUIレイアウトを再計算している間に、別の操作が表示内容を変更するかもしれません。
連携（協調）がなければ、どちらの操作が先に終了するかによって結果が左右され、UIが不整合な状態のままになる可能性があります。
このような予測不可能な干渉は、*競合状態 (race condition)* として知られています。

このバージョンのリマインダーアプリケーションの完全な実装は次のとおりです。

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
{collapsible="true" collapsed-title="完全な Example1.kt ファイル"}

## アクターベースの共有リソース協調 {id="actor-based-shared-resource-coordination"}

並行操作が同じリソースを使用する場合、それらはリソースの使用方法を協調させる必要があります。

共有リソースへのアクセスを協調させる1つの方法は、*アクターベースのアプローチ (actor-based approach)* を使用することです。このアプローチでは、単一のコンポーネントがリソースへのアクセスを制御し、リクエストを1つずつ処理します。
コンポーネントがすでにリクエストを処理している場合、新しいリクエストはキューで待機します。

> 多くのUIフレームワークは、*UIスレッド*で同様のアプローチを使用しています。
> UIスレッドは、UI要素を更新するリクエストを1つずつ処理します。
>
{style="tip"}

[`src/main/kotlin/Example2.kt`](https://github.com/kotlin-hands-on/suspending-functions-intro/blob/main/src/main/kotlin/Example2.kt) では、リマインダーアプリケーションは `SimpleActor` クラスを使用してコンソールへのアクセスを協調させています。
アクターは、リクエストを受信した順序で専用スレッド上で実行します。

```kotlin
// リクエストを1つずつ処理することで、共有リソースへのアクセスを協調させます
class SimpleActor {
    private val requests = mutableListOf<() -> Unit>()

    init {
        Thread {
            while (true) {
                // 利用可能になったときにキューから次のリクエストを取得します
                val request = /* ... */

                // リクエストを1つずつ実行します
                request()
            }
        }.apply {
            // アクタースレッドが実行中であってもJVMが終了できるようにします
            isDaemon = true

            // アクタースレッドを開始します
            start()
        }
    }

    fun sendRequest(request: () -> Unit) {
        // リクエストをキューに追加します
        /* ... */
    }
}
```

各操作は `println()` 関数を直接呼び出す代わりに、同じアクターにリクエストを送信します。
たとえば、リマインダーは指定された時間が経過した後に、その出力をアクターに送信します。

```kotlin
fun scheduleReminder(
    printlnActor: SimpleActor,
    remindIn: Duration,
    reminderText: List<String>
) {
    Thread {
        Thread.sleep(remindIn.inWholeMilliseconds)

        val stringToPrint = /* リマインダーテキストを作成します */

        // リマインダーの出力をアクターに送信します
        printlnActor.sendRequest {
            println(stringToPrint)
        }
    }.apply {
        isDaemon = false
        start()
    }
}
```

`fun_animation` コマンドもその出力をアクターに送信し、すべてのアニメーションフレームが単一のリクエストにグループ化されます。

```kotlin
// アニメーション出力を単一のリクエストとしてアクターに送信します
"fun_animation" -> printlnActor.sendRequest {
    for (frame in funAnimationFrames) {
        println(frame)
        Thread.sleep(200)
    }
}
```

この例では、`sendRequest()` 関数はアクターにリクエストを送信し、リクエストの完了を待たずに復帰します。

アクターはリクエストを1つずつ処理します。アクターが別のリクエストを処理している間にリマインダーがトリガーされた場合、その出力リクエストは現在のリクエストが完了するまでキューで待機します。
これにより、アニメーションの途中にリマインダーのテキストが表示されるなどのインターリーブ問題が防止されます。

ただし、アクターは自身が処理するリクエストのみを協調させます。
メインスレッドがいつ処理を続行するかは制御しないため、アクターが以前のリクエストを処理している間も、メインスレッドはユーザー入力を受け付け続けることができます。
これは、メインスレッドでの作業がそのリクエストの完了に依存している場合に問題となります。

このバージョンのリマインダーアプリケーションの完全な実装は次のとおりです。

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
     * このアクターのスレッドで実行されるリクエストを送信します。
     *
     * 特定のアクターに対するリクエストは1つずつ実行され、
     * 決して並列には実行されません。
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
            "help" -> printHelp()
            "fun_animation" -> {
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
{collapsible="true" collapsed-title="完全な Example2.kt ファイル"}

## コールバック (Callbacks) {id="callbacks"}

非同期操作が完了した後に何らかの作業を開始しなければならない場合、アプリケーションはその後の作業がいつ実行されるかを制御する必要があります。
その後の作業は*コールバック (callback)* で定義できます。
コールバックとは、操作の完了後など、特定の条件が満たされたときに後で呼び出してもらうために別の関数に渡す関数のことです。

[`src/main/kotlin/Example3.kt`](https://github.com/kotlin-hands-on/suspending-functions-intro/blob/main/src/main/kotlin/Example3.kt) では、リマインダーアプリケーションはコールバックを使用して、アニメーションが終了した後にのみユーザー入力の処理を再開します。
これを実現するために、この例ではユーザー入力を処理するための2つ目の `SimpleActor` を追加しています。

```kotlin
fun main() {
    val printlnActor = SimpleActor()
    val userInputActor = SimpleActor()

    // ユーザー入力の処理を開始するコールバックを渡します
    userInputActor.sendRequest {
        processUserInput(
            printlnActor,
            userInputActor,
            // 入力処理が停止した後に実行されます
            doLast = {
                printlnActor.sendRequest {
                    println("All done! The program will exit once all pending reminders fire.")
                }
            }
        )
    }

    // アプリケーションが終了できるようになるまでメインスレッドを実行し続けます
    while (!shouldTerminate.load()) {
        Thread.sleep(100)
    }
}
```

`userInputActor` は、その専用スレッドで `processUserInput()` 関数を呼び出します。
[アクターベースの共有リソース協調](#アクターベースの共有リソース協調)の実装における `while` ループとは異なり、`processUserInput()` 関数への各呼び出しは1つのコマンドのみを読み取って処理します。

`remind` コマンド、`help` コマンド、または不明なコマンドを処理した後、関数は別のリクエストを `userInputActor` に送信します。

```kotlin
fun processUserInput(
    printlnActor: SimpleActor,
    userInputActor: SimpleActor,
    doLast: () -> Unit
) {
    // 現在のコマンドを処理します
    /* ... */

    // 次のコマンドの処理をスケジュールします
    userInputActor.sendRequest {
        processUserInput(printlnActor, userInputActor, doLast)
    }
}
```

`userInputActor` はコールバックをすぐに呼び出すのではなく、キューに追加します。
現在の `processUserInput()` 関数の呼び出しは、アクターが次のリクエストを処理する前に復帰（リターン）します。
これにより、ループの次のイテレーション（反復）を開始するのと同様に、別の入力処理操作が開始されます。

`fun_animation` コマンドの場合、アプリケーションはアニメーションが完了するまで次の入力リクエストを遅延させます。
`printlnActor` に送信されたリクエストは、すべてのアニメーションフレームを出力してから、次のコマンドの処理をリクエストします。

```kotlin
"fun_animation" -> {
    // アニメーションを出力するリクエストを送信します
    printlnActor.sendRequest {
        for (frame in funAnimationFrames) {
            println(frame)
            Thread.sleep(200)
        }

        // アニメーション終了後に次のコマンドを処理する
        // コールバックを渡します
        userInputActor.sendRequest {
            processUserInput(printlnActor, userInputActor, doLast)
        }
    }

    // アニメーションが終了する前に processUserInput() が
    // 別の入力リクエストをスケジュールするのを防ぎます
    return
}
```

`quit` コマンドの場合、関数は別の入力リクエストをスケジュールする代わりに、`doLast` コールバックを呼び出します。

```kotlin
"quit" -> {
    // 入力処理が停止した後に実行されるコールバックを呼び出します
    doLast()
    return
}
```

コールバックを使用すると、各実行パスはそれに続く作業を明示的にスケジュールする必要があります。
アプリケーションは、別の入力処理操作をスケジュールするか、終了時に次の入力処理をスケジュールする非同期操作を開始するか、あるいは最終コールバックを呼び出す必要があります。

制御フローが複雑になるにつれて、これらのアクションのいずれかを省略したり、複数回実行したり、間違った実行パスで実行したりすると、アプリケーションの動作が変わってしまう可能性があります。
これにより、コードの保守が困難になり、エラーが発生しやすくなります。

このバージョンのリマインダーアプリケーションの完全な実装は次のとおりです。

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
     * このアクターのスレッドで実行されるリクエストを送信します。
     *
     * 特定のアクターに対するリクエストは1つずつ実行され、
     * 決して並列には実行されません。
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
        /* 以前のバージョンの `continue` をエミュレートします */
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
            /* println アクターが終了時に自身でユーザー入力の読み取りを
            再スケジュールするため、ここで再スケジュールする必要はありません。 */
            return
        }
        "quit" -> {
            /* 新しいイテレーションを再スケジュールせずに現在のイテレーションを終了し、
            代わりにループの *後* に来るコードをスケジュールすることで、
            以前のバージョンの `break` をエミュレートします。 */
            doLast()
            return
        }
        else -> printlnActor.sendRequest {
            println("Unknown command '$operationInLowerCase'")
            println()
            printHelp()
        }
    }
    // ループの次のイテレーションをスケジュールします
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
                // メインスレッドの終了を許可します
                shouldTerminate.store(true)
            }
        })
    }
    // プログラムを生存させ続けます。単にメインスレッドを終了すると、
    // すべてが終了してしまいます。
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
{collapsible="true" collapsed-title="完全な Example3.kt ファイル"}

## 制御フローの抽象化 {id="control-flow-abstractions"}

コールバックベースの制御フローをわかりやすくするために、繰り返されるスケジューリングロジックを、ループなどの使い慣れた制御フロー構造を表すヘルパー関数に移行することができます。

[`src/main/kotlin/Example4.kt`](https://github.com/kotlin-hands-on/suspending-functions-intro/blob/main/src/main/kotlin/Example4.kt) では、リマインダーアプリケーションは `runInfiniteLoop()` 関数を使用してユーザー入力を非同期に処理します。
各ループのイテレーションは、ループを継続するか、終了するか、非同期操作の完了後に後で再開するかを決定する `LoopIterationResult` 列挙型の値を返します。

```kotlin
enum class LoopIterationResult {
    BREAK,
    CONTINUE,
    WILL_BE_RESUMED_ASYNCHRONOUSLY
}
```

`runInfiniteLoop()` 関数は各結果を処理し、必要に応じて次のイテレーションをスケジュールします。

```kotlin
// 入力処理ループを非同期に実行します
fun runInfiniteLoop(
    schedule: (RequestType) -> Unit,
    iteration: (scheduleNextIteration: () -> Unit) -> LoopIterationResult,
    actionOnLoopExit: () -> Unit,
) {
    fun helper() {
        when (iteration { schedule(::helper) }) {
            LoopIterationResult.BREAK -> {
                // ループに続くアクションを実行します
                actionOnLoopExit()
            }

            LoopIterationResult.CONTINUE -> {
                // 次のループイテレーションをスケジュールします
                schedule(::helper)
            }

            LoopIterationResult.WILL_BE_RESUMED_ASYNCHRONOUSLY -> {
                // 別の操作が次のイテレーションをスケジュールします
            }
        }
    }

    // 最初のループイテレーションをスケジュールします
    schedule(::helper)
}
```

リマインダーアプリケーションは、その入力処理ロジックを `runInfiniteLoop()` 関数に渡します。
直ちに継続できる実行パスの場合、ループ内で `continue` を呼び出すのと同様に、イテレーションは `CONTINUE` を返します。

```kotlin
val operation = command.removeFirstOrNull()
    ?: return@iteration LoopIterationResult.CONTINUE
```

後で再開する操作の場合、イテレーションは `WILL_BE_RESUMED_ASYNCHRONOUSLY` を返します。
たとえば、`fun_animation` コマンドはアニメーション終了後に次のイテレーションをスケジュールします。

```kotlin
"fun_animation" -> {
    printlnActor.sendRequest {
        for (frame in funAnimationFrames) {
            println(frame)
            Thread.sleep(200)
        }

        // アニメーション終了後に次のイテレーションをスケジュールします
        userInputActor.sendRequest {
            scheduleNextIteration()
        }
    }

    return@iteration LoopIterationResult.WILL_BE_RESUMED_ASYNCHRONOUSLY
}
```

最後に、ユーザー入力の処理を停止するには、イテレーションは `BREAK` を返します。

```kotlin
"quit" -> {
    return@iteration LoopIterationResult.BREAK
}
```

このように、`runInfiniteLoop()` 関数は、各実行パスが次の操作を直接スケジュールすることを要求するのではなく、ループの継続と終了のためのロジックを一元化します。

ただし、`runInfiniteLoop()` のような関数を使用して制御フローの抽象化を正しく実装するのは困難な場合があります。
たとえば、この実装では、ループイテレーション、スケジュールコールバック、または `actionOnLoopExit` コールバックからスローされた例外を処理していません。

このバージョンのリマインダーアプリケーションの完全な実装は次のとおりです。

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
     * このアクターのスレッドで実行されるリクエストを送信します。
     *
     * 特定のアクターに対するリクエストは1つずつ実行され、
     * 決して並列には実行されません。
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

// 新しいAPI ///////////////////////////////////////////////////////////////////

enum class LoopIterationResult {
    BREAK,
    CONTINUE,
    WILL_BE_RESUMED_ASYNCHRONOUSLY
}

/**
 * 無限ループを非同期に実行します。
 *
 * [schedule] は、次のループイテレーションをスケジュールするために
 * 呼び出されるコマンドです。
 *
 * [iteration] はループ本体です。
 * これは `() -> Unit` 型の値を受け取り、それを呼び出すことで
 * 次のイテレーションがスケジュールされます。
 * これを [LoopIterationResult.WILL_BE_RESUMED_ASYNCHRONOUSLY] と組み合わせて使用します。
 *
 * [actionOnLoopExit] はループが終了したときに一度だけ実行されます。
 *
 * この関数は、最初のイテレーションをスケジュールした直後に制御を返します。
 */
fun runInfiniteLoop(
    schedule: (RequestType) -> Unit,
    iteration: (scheduleNextIteration: () -> Unit) -> LoopIterationResult,
    actionOnLoopExit: () -> Unit,
) {
    fun helper() {
        when (iteration { schedule(::helper) }) {
            LoopIterationResult.BREAK -> {
                /* ループを終了しました。何も再スケジュールする必要はありません。 */
                actionOnLoopExit()
            }
            LoopIterationResult.CONTINUE -> {
                /* 次のループイテレーションをスケジュールします */
                schedule(::helper)
            }
            LoopIterationResult.WILL_BE_RESUMED_ASYNCHRONOUSLY -> {
                /* 何も行う必要はありません。他の誰かがループを再開します。 */
            }
        }
    }
    schedule(::helper)
}

// 新しいAPIの使用法 //////////////////////////////////////////////////////////////

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
                // メインスレッドの終了を許可します
                shouldTerminate.store(true)
            }
        }
    )
    // プログラムを生存させ続けます。単にメインスレッドを終了すると、
    // すべてが終了してしまいます。
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
{collapsible="true" collapsed-title="完全な Example4.kt ファイル"}

## 中断関数 (Suspending functions) {id="suspending-functions"}

[コールバックベースの制御フロー](#コールバック-callbacks)は、依存する操作の数が増えるにつれて保守が難しくなることがあります。
Kotlinは、非同期制御フローをわかりやすく順次的な（シーケンシャルな）スタイルで表現できるようにする*中断関数 (suspending functions)* を提供しています。

コールバックでは、非同期操作に続く作業を個別に定義し、それをコールバックとしてスケジュールします。
これに対して、中断関数は*中断ポイント (suspension point)* で一時停止し、後でそのポイントから処理を再開できます。
これにより、後続の各ステップを個別にスケジュールされるコールバックとして表現する必要がなく、使い慣れた制御フロー構造を維持できます。

中断関数を宣言するには、`suspend` キーワードを使用します。

[`src/main/kotlin/Example5.kt`](https://github.com/kotlin-hands-on/suspending-functions-intro/blob/main/src/main/kotlin/Example5.kt) では、リマインダーアプリケーションは中断関数を使用して `suspendMain()` 関数内でユーザー入力を処理します。

```kotlin
// 中断関数内でユーザー入力を処理します
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
            // 他のコマンドを処理します
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

`suspendMain()` 関数は、各実行パスをコールバックで手動で協調させる代わりに、`while` ループ、`continue`、`break` を直接使用できます。
中断関数では、`return`、`try`、`catch`、`finally` などの使い慣れた構文を使用したり、他の中断関数を呼び出したりすることも可能です。

> `runInfiniteLoop()` ヘルパー関数のようないわゆる[制御フローの抽象化](#制御フローの抽象化)でこの動作を再現しようとすると、ますます複雑なスケジューリングロジックが必要になります。
>
{style="note"}

`fun_animation` コマンドの場合、`suspendCoroutine()` 関数が中断ポイントを作成し、アニメーションの実行中に中断し、終了後に再開します。

```kotlin
"fun_animation" -> {
    // 別の操作が再開するまで実行を中断します
    suspendCoroutine { continuation ->
        printlnActor.sendRequest {
            for (frame in funAnimationFrames) {
                println(frame)
                Thread.sleep(200)
            }

            userInputActor.sendRequest {
                // アニメーション終了後に実行を再開します
                continuation.resumeWith(Result.success(Unit))
            }
        }
    }
}
```

ここで、[`suspendCoroutine()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.coroutines/suspend-coroutine.html) 関数は実行を中断し、中断ポイントに続く実行を表す [`Continuation`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.coroutines/-continuation/) インターフェースの実装を提供します。
これは、[制御フローの抽象化](#制御フローの抽象化)にある `runInfiniteLoop()` 関数が、スケジュールする次のループイテレーションを表すために `helper()` 関数を使用しているのと似ています。

コールバックを使用する場合と比較して、中断関数ではその後の作業を個別に定義する必要がありません。
コンパイラが中断ポイントに続く実行を表す Continuation（継続）を作成してくれます。

アニメーションが終了した後、[`Continuation.resumeWith()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.coroutines/-continuation/resume-with.html) 関数が結果とともにその実行を再開します。
その後、`suspendMain()` 関数は中断ポイントの直後から処理を続行し、次のループイテレーションを開始します。

> ここでの `suspendCoroutine()` 関数は、中断の仕組みを実演するためだけに使用されています。
> [キャンセル](coroutines-cancellation.md)をサポートする必要がある本番コードでは使用しないでください。
> 
{style="warning"}

`main()` 関数から中断関数である `suspendMain()` を実行するために、アプリケーションは[_コルーチン (coroutine)_](coroutines-overview.md)を開始します。コルーチンとは、実行を一時停止および再開できる中断可能な計算のことです。
`main()` 関数は `suspendMain()` の呼び出しを中断ラムダでラップし、[`startCoroutineUninterceptedOrReturn()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.coroutines.intrinsics/start-coroutine-unintercepted-or-return.html) 関数を使用してコルーチンを開始します。

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

中断関数を使用すると、アプリケーションは各実行パスを手動でスケジュールすることなく、非同期操作間の依存関係を表現できます。
これにより、操作の順序がコード上で明確に保たれ、保守が必要な制御フローロジックの量を減らすことができます。

このバージョンのリマインダーアプリケーションの完全な実装は次のとおりです。

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
     * このアクターのスレッドで実行されるリクエストを送信します。
     *
     * 特定のアクターに対するリクエストは1つずつ実行され、
     * 決して並列には実行されません。
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
        // メインスレッドの終了を許可します
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

    // プログラムを生存させ続けます。単にメインスレッドを終了すると、
    // すべてが終了してしまいます。
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
{collapsible="true" collapsed-title="完全な Example5.kt ファイル"}

## 次のステップ {id="what-s-next"}

コルーチンと、それが非同期および並行プログラミングをどのようにサポートするかについての詳細は、[コルーチン](coroutines-overview.md)を参照してください。