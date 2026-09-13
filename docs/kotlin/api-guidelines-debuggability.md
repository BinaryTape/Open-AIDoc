[//]: # (title: 可调试性)

你的库的用户会基于其功能进行构建，而他们构建的功能可能包含需要识别和解决的错误。
这种错误解决过程可能会在开发期间通过调试器进行，或者在生产环境中使用日志记录和可观测性工具进行。
你的库可以遵循这些最佳做法，从而使调试更加轻松。

## 为有状态类型提供 toString 方法 {id="provide-a-tostring-method-for-stateful-types"}

对于每一个包含状态的类型，请提供一个有意义的 `toString` 实现。
该实现应返回实例当前内容的清晰表示，即使是对内部类型也是如此。

由于类型的 `toString` 表示经常会被写入日志，因此在实现此方法时请考虑安全性，
避免返回敏感用户数据。

确保在库的不同类型中，用于描述状态的格式尽可能保持一致。
当该格式是 API 实现的约定的一部分时，应明确说明并详细记录。
`toString` 方法的输出可能支持解析，例如用于自动化测试套件。

例如，考虑以下来自支持服务订阅的库的类型：

```kotlin
enum class SubscriptionResultReason {
    Success, InsufficientFunds, IncompatibleAccount
}

class SubscriptionResult(
    val result: Boolean,
    val reason: SubscriptionResultReason,
    val description: String
)
```

如果没有 `toString` 方法，打印 `SubscriptionResult` 实例将没有太大用处：

```kotlin
fun main() {
    val result = SubscriptionResult(
       false,
       IncompatibleAccount,
       "Users account does not support this type of subscription"
    )
    
    // 打印 'org.example.SubscriptionResult@13221655'
    println(result)
}
```

调试器中显示的信息也不直观：

![调试器中的结果](debugger-result.png){width=500}

添加一个简单的 `toString` 实现可以显著改善这两种情况下的输出：

```kotlin
// 打印 'Subscription failed (reason=IncompatibleAccount, description="Users 
// account does not support this type of subscription")'
override fun toString(): String {
    val resultText = if(result) "succeeded" else "failed"
    return "Subscription $resultText (reason=$reason, description=\"$description\")"
}
```

![添加 toString 会产生更好的结果](debugger-result-tostring.png){width=700}

虽然使用数据类自动获取 `toString` 方法可能很诱人，但出于向后兼容性的考虑，并不推荐这样做。
有关数据类的更多细节在[避免在 API 中使用数据类](api-guidelines-backward-compatibility.md#avoid-using-data-classes-in-your-api)部分进行了讨论。

请注意，`toString` 方法中描述的状态不需要是来自问题领域的信息。
它可以与正在进行的请求状态有关（如上例所示）、与外部服务的连接健康状况有关，
或者是正在进行的操作中的中间状态。

例如，考虑以下构建器类型：

```kotlin
class Person(
    val name: String?,
    val age: Int?,
    val children: List<Person>
) {
    override fun toString(): String =
        "Person(name=$name, age=$age, children=$children)"
}

class PersonBuilder {
    var name: String? = null
    var age: Int? = null
    val children = arrayListOf<Person>()

    fun child(personBuilder: PersonBuilder.() -> Unit = {}) {
       children.add(person(personBuilder))
    }
    fun build(): Person = Person(name, age, children)
}

fun person(personBuilder: PersonBuilder.() -> Unit = {}): Person = 
    PersonBuilder().apply(personBuilder).build()
```

这是你会如何使用此类型：

![使用构建器类型示例](halt-breakpoint.png){width=500}

如果你在上面图像显示的断点处停止代码，显示的信息将没有帮助：

![在断点处停止代码的结果](halt-result.png){width=500}

添加一个简单的 `toString` 实现会产生更有帮助的输出：

```kotlin
override fun toString(): String =
    "PersonBuilder(name=$name, age=$age, children=$children)"
```

加上这一改动后，调试器显示：

![在停止点添加 toString](halt-tostring-result.png){width=700}

这样，你可以立即看到哪些字段已设置，哪些未设置。

## 采用并记录处理异常的策略 {id="adopt-and-document-a-policy-for-handling-exceptions"}

正如[选择合适的错误处理机制](api-guidelines-consistency.md#choose-the-appropriate-error-handling-mechanism)部分所述，
在某些情况下，你的库适合抛出异常来发出错误信号。
你可以为此创建自己的异常类型。

抽象和简化低级 API 的库也需要处理其依赖项抛出的异常。
库可以选择抑制异常、按原样传递、将其转换为不同类型的异常，
或以其他方式向用户发出错误信号。

根据上下文，这些选项中的任何一个都可能是有效的。例如：

* 如果用户采用库 A 纯粹是为了方便简化库 B，那么库 A 重新抛出库 B 生成的任何异常而无需修改可能是合适的。
* 如果库 A 采用库 B 纯粹是作为内部实现细节，那么库 B 抛出的库特定异常绝不应暴露给库 A 的用户。

你必须采用并记录一致的异常处理方法，以便用户可以高效地使用你的库。
这对于调试尤其重要。你的库的用户应该能够在调试器和日志中识别
异常是否源自你的库。

异常的类型应指示错误的类型，异常中的数据应帮助用户
定位问题的根本原因。
一种常见的模式是将低级异常包装在库特定的异常中，原始异常可通过 `cause` 访问。

## 支持自定义异常的协程堆栈跟踪恢复 {id="support-coroutine-stack-trace-recovery-for-custom-exceptions"}
<primary-label ref="experimental-general"/>

你可以为你库中的自定义异常类型添加对协程[堆栈跟踪恢复](coroutines-debugging.md#stack-trace-recovery)的支持，以使它们更易于调试。
这可以改进你的库对 `kotlinx.coroutines` 库以及 Kotlin 中其他异步运行时的支持。

当协程通过挂起函数从另一个协程接收到异常时，堆栈跟踪恢复会创建该异常的一个副本，其中包含导向该函数调用的堆栈帧。

对于构造函数仅接收异常消息、cause、两者皆有或不接收实参的异常，`kotlinx.coroutines` 库会自动执行堆栈跟踪恢复。
如果你库中的异常类型需要额外的构造函数实参（例如行号或错误代码），请实现 [`StackTraceRecoverable`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.coroutines.debug/-stack-trace-recoverable/) 接口。

要实现该接口，请重写 [`copyForStackTraceRecovery()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.coroutines.debug/-stack-trace-recoverable/copy-for-stack-trace-recovery.html) 函数。
在重写中，返回一个用于堆栈跟踪恢复的新异常实例，或者如果你不希望 `kotlinx.coroutines` 库复制该异常，则返回 `null`。

`StackTraceRecoverable` 接口是 Kotlin 标准库的一部分，因此实现它不会增加对 `kotlinx.coroutines` 库的依赖。

以下是一个自定义异常的示例，该异常在为堆栈跟踪恢复创建新实例时会保留 `line` 属性：

```kotlin
import kotlin.coroutines.ExperimentalStdlibCoroutineSupportApi
import kotlin.coroutines.debug.StackTraceRecoverable

@OptIn(ExperimentalStdlibCoroutineSupportApi::class)
class FileEditException
// 该实现需要一个私有构造函数，
// 以便将 cause 传递给 IllegalStateException 构造函数
private constructor(
    val line: Int,
    private val detail: String,
    cause: Throwable?,
) : IllegalStateException("When editing line $line: $detail", cause),
    // 实现 StackTraceRecoverable 以支持堆栈跟踪恢复
    StackTraceRecoverable<FileEditException> {

    constructor(line: Int, detail: String) : this(line, detail, null)

    // 复制行号和消息详情
    override fun copyForStackTraceRecovery(): FileEditException =
        FileEditException(line, detail, this)
    }

fun main() {
    val original = FileEditException(15, "Unexpected token")
    
    // 通常情况下，除非正在测试其行为，否则无需直接调用此函数
    // kotlinx.coroutines 库会在堆栈跟踪恢复期间自动调用它
    val copy = original.copyForStackTraceRecovery()

    println(copy.message)
    // When editing line 15: Unexpected token

    println(copy.cause == original)
    // true
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.4.20"}

## 下一步 {id="next-step"}

在该指南的下一部分中，你将了解可测试性。

[继续阅读下一部分](api-guidelines-testability.md)