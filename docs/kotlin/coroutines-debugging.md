<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: 调试协程)

调试使用协程的应用程序可能会充满挑战，因为多个协程可以并发运行、在一个线程上挂起并在另一个线程上恢复。
它们的执行顺序和使用的线程在多次运行之间也可能会发生变化，从而难以跟踪特定协程的执行情况。

在 JVM 上，你可以使用以下功能让调试协程变得更加容易：

* [调试模式](#enable-debug-mode)为每个协程添加唯一名称，以便你可以在调试器和诊断输出中识别它。
* [堆栈跟踪恢复](#stack-trace-recovery)会添加关于协程在何处接收到异常（而非预期结果）的信息。
* [调试代理](#the-debug-agent)可跟踪活跃协程、报告它们的状态等。

调试模式和堆栈跟踪恢复在 [`kotlinx-coroutines-core`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/) 模块中提供。
调试代理在 [`kotlinx-coroutines-debug`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-debug/) 模块中提供。

> Android 上不支持调试代理。
>
>
{style="note"}

## 启用调试模式 {id="enable-debug-mode"}

调试模式会为每个启动的协程分配一个唯一名称。
你可以在 Java 调试器中、在协程的字符串表示形式中，以及在运行该协程的线程名称中看到协程的名称。
调试模式的运行时开销微乎其微，因此你可以保持其启用状态以简化日志记录和诊断。

当你运行启用了 Java 断言的代码时，`kotlinx.coroutines` 库会自动启用调试模式。
单元测试默认在启用断言的情况下运行，因此你无需为它们显式启用调试模式。

要显式启用调试模式，请配置你的构建工具（例如 [Gradle](https://docs.gradle.org/current/userguide/application_plugin.html#sec:application_usage) 或 [Maven](https://maven.apache.org/configure)）或 IDE 运行配置，向运行应用程序的 JVM 传递 `-Dkotlinx.coroutines.debug` 参数。

在 IntelliJ IDEA 中，按照以下步骤启用调试模式：

1. 在**运行微件**中，选择要更新的运行/调试配置，然后选择 **More Actions** | **Edit**：

   ![在 IntelliJ IDEA 中从运行配置的 More Actions 菜单选择 Edit](coroutines-debug-mode-more-options.png){width="600"}

   > 如果你没有运行/调试配置，请在**运行微件**中选择 **Current File**，然后选择 **More Actions** | **Run with Parameters** 以打开运行配置设置。
   > 
   > ![在 IntelliJ IDEA 中从运行配置的 More Actions 菜单选择 Run with Parameters](coroutines-debug-mode-run-with-parms.png){width="600"}
   >
   {style="note"}

2. 在 **Run/Debug Configurations** 对话框中，在 **VM options** 字段中输入 `-Dkotlinx.coroutines.debug`，然后点击 **OK**：

   ![在 IntelliJ IDEA 的运行/调试配置中添加 -Dkotlinx.coroutines.debug 选项](run-debug-configuration.png){width="600"}

## 堆栈跟踪恢复 {id="stack-trace-recovery"}

当协程通过诸如 `Deferred.await()` 之类的挂起函数从另一个协程接收到异常时，
该异常的堆栈跟踪并不包含来自接收协程的堆栈帧。
没有这些堆栈帧，堆栈跟踪就不会显示在哪里调用了 `Deferred.await()`，也不会显示哪些函数导致了该调用，这可能会使调试变得困难。

`kotlinx.coroutines` 库通过*堆栈跟踪恢复*添加了此信息，它会创建一个包含额外堆栈帧的异常副本。

当接收协程恢复时，它会抛出该副本而不是原始异常。
原始异常将成为该副本的原因（cause）。
如果原始异常包含被抑制的异常（suppressed exceptions），它们将保持附加在原始异常上，而不会被复制。
让它们保持附加在原始异常上可以防止异常链中出现循环，并防止在某些框架中发生崩溃。

调试模式默认启用堆栈跟踪恢复。
要在调试模式下禁用堆栈跟踪恢复，请传递 `-Dkotlinx.coroutines.stacktrace.recovery=false` 虚拟机选项。

以下示例展示了启用和未启用堆栈跟踪恢复时的堆栈跟踪差异：

```kotlin
import kotlinx.coroutines.*

object UserProfileService :
    CoroutineScope by CoroutineScope(CoroutineName("UserProfileService")) {

    private fun parseUserProfile(): String {
        error("Invalid user profile")
    }

    private fun loadUserProfile(): String {
        return parseUserProfile()
    }

    // 在调用此函数的协程中运行
    suspend fun awaitUserProfile() {
        // 启动一个新协程
        val userProfile = async(Dispatchers.Default) {
            // 新协程抛出异常
            loadUserProfile()
        }

        // 运行 awaitUserProfile() 的协程
        // 通过 await() 函数接收异常
        userProfile.await()
    }
}

suspend fun main() {
    UserProfileService.awaitUserProfile()
}
```

在此示例中，`parseUserProfile()` 函数在由 `.async()` 构建器函数启动的协程中抛出异常。
调用 `awaitUserProfile()` 的协程通过 `Deferred.await()` 函数接收该异常。

在禁用堆栈跟踪恢复的情况下，堆栈跟踪会显示由 `.async()` 函数创建的协程中 `parseUserProfile()` 抛出异常的位置，
但它不包含 `awaitUserProfile()` 函数中的 `Deferred.await()` 调用：

![不包含来自接收协程的堆栈帧的异常堆栈跟踪](without-stack-trace-recovery.png){width="600"}

在启用堆栈跟踪恢复的情况下，堆栈跟踪还会包含 `awaitUserProfile()` 函数中的 `Deferred.await()` 调用：

![包含来自接收协程的堆栈帧的恢复异常堆栈跟踪](with-stack-trace-recovery.png){width="600"}

### 针对自定义异常的堆栈跟踪恢复 {id="stack-trace-recovery-for-custom-exceptions"}
<primary-label ref="experimental-opt-in"/>

当异常类具有接受 message、cause、两者兼有或完全不接受实参的公共构造函数时，堆栈跟踪恢复可以自动复制异常。

如果你希望 `kotlinx.coroutines` 库恢复需要额外构造函数实参（例如行号或错误代码）的异常堆栈跟踪，
请实现 [`StackTraceRecoverable`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.coroutines.debug/-stack-trace-recoverable/) 接口。

`StackTraceRecoverable` 接口是 Kotlin 标准库的一部分，因此无需添加对 `kotlinx.coroutines` 库的依赖即可实现它。

> `StackTraceRecoverable` 接口在所有目标平台上均可用，但 `kotlinx.coroutines` 库仅在 JVM 上将其用于堆栈跟踪恢复。
>
{style="note"}

要实现该接口，请重写 [`copyForStackTraceRecovery()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.coroutines.debug/-stack-trace-recoverable/copy-for-stack-trace-recovery.html) 函数。
在重写中，返回一个新的异常实例以用于堆栈跟踪恢复；如果你不希望 `kotlinx.coroutines` 库复制该异常，则返回 `null`。

这些 API 属于[实验性功能](components-stability.md#stability-levels-explained)，需要使用 `@OptIn(ExperimentalStdlibCoroutineSupportApi::class)` 注解进行选择加入。

以下是一个自定义异常示例，该异常在创建新实例用于堆栈跟踪恢复时保留了 `line` 属性：

```kotlin
import kotlinx.coroutines.*
import kotlin.coroutines.ExperimentalStdlibCoroutineSupportApi
import kotlin.coroutines.debug.StackTraceRecoverable

@OptIn(ExperimentalStdlibCoroutineSupportApi::class)
class FileEditException
// 该实现需要一个私有构造函数
// 以便将 cause 传递给 IllegalStateException 构造函数
private constructor(
    val line: Int,
    private val detail: String,
    cause: Throwable?,
) : IllegalStateException("When editing line $line: $detail", cause),
    // 实现 StackTraceRecoverable 以进行堆栈跟踪恢复
    StackTraceRecoverable<FileEditException> {

    constructor(line: Int, detail: String) : this(line, detail, null)

    // 复制行号和消息详情
    override fun copyForStackTraceRecovery(): FileEditException =
        FileEditException(line, detail, this)
}

private fun editFile() {
    throw FileEditException(15, "Unexpected token")
}

suspend fun main() {
    supervisorScope {
        // 启动一个新协程
        val fileEdit = async(Dispatchers.Default) {
            // 抛出原始异常
            editFile()
        }
        
        // 堆栈跟踪恢复会创建异常的副本，
        // 添加调用方协程的堆栈帧，并抛出该副本
        fileEdit.await()
    }
}
```

启用调试模式后，输出将包含恢复后的副本，后跟作为其原因的原始异常。

```text
Exception in thread "main" com.example.FileEditException: When editing line 15: Unexpected token
	at com.example.RecoveryExampleKt.editFile(RecoveryExample.kt:54)
	at com.example.RecoveryExampleKt.access$editFile(RecoveryExample.kt:1)
	at com.example.RecoveryExampleKt$main$2$fileEdit$1.invokeSuspend(RecoveryExample.kt:62)
	at _COROUTINE._BOUNDARY._(CoroutineDebugging.kt:42)
	at com.example.RecoveryExampleKt$main$2.invokeSuspend(RecoveryExample.kt:67)
Caused by: com.example.FileEditException: When editing line 15: Unexpected token
	at com.example.RecoveryExampleKt.editFile(RecoveryExample.kt:54)
	at com.example.RecoveryExampleKt.access$editFile(RecoveryExample.kt:1)
	at com.example.RecoveryExampleKt$main$2$fileEdit$1.invokeSuspend(RecoveryExample.kt:62)
	at kotlin.coroutines.jvm.internal.BaseContinuationImpl.resumeWith(ContinuationImpl.kt:34)
	at kotlinx.coroutines.DispatchedTask.run(DispatchedTask.kt:100)
	at kotlinx.coroutines.scheduling.CoroutineScheduler.runSafely(CoroutineScheduler.kt:586)
	at kotlinx.coroutines.scheduling.CoroutineScheduler$Worker.executeTask(CoroutineScheduler.kt:807)
	at kotlinx.coroutines.scheduling.CoroutineScheduler$Worker.runWorker(CoroutineScheduler.kt:717)
	at kotlinx.coroutines.scheduling.CoroutineScheduler$Worker.run(CoroutineScheduler.kt:704)
```
{collapsible="true" collapsed-title="StackTraceRecoverable 示例输出"}

## 调试代理 {id="the-debug-agent"}
<primary-label ref="experimental-opt-in"/>

[`kotlinx-coroutines-debug`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-debug/) 模块为 JVM 应用程序提供了一个调试代理。
该代理会跟踪协程的创建、挂起与恢复。

[`DebugProbes`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-debug/kotlinx.coroutines.debug/-debug-probes/) API 是调试代理的主要入口点。
你可以使用它来打印活跃协程及其当前状态。
输出中包含显示每个协程在何处创建以及在何处挂起的堆栈跟踪。
你还可以使用它来打印特定 `Job` 或 `CoroutineScope` 层次结构的协程转储。

如果在生产环境中启用 `DebugProbes`，当它为每个新协程创建堆栈跟踪时，可能会显著降低应用程序的性能。
为避免此开销，请将 [`DebugProbes.enableCreationStackTraces`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-debug/kotlinx.coroutines.debug/-debug-probes/enable-creation-stack-traces.html) 设置为 `false`。

> `kotlinx-coroutines-debug` 模块提供了自动的 [BlockHound](https://github.com/reactor/BlockHound) 集成。
> 你可以使用它来检测协程上下文中不允许的阻塞操作。
> 
> 有关设置说明，请参阅 [BlockHound 快速入门指南](https://github.com/reactor/BlockHound/blob/1.0.8.RELEASE/docs/quick_start.md)。
>
{style="note"}

### 添加调试代理依赖项 {id="add-the-debug-agent-dependency"}

要在你的项目中使用调试代理，请添加 `kotlinx-coroutines-debug` 依赖项：

<tabs group="build-tool">
<tab title="Gradle" group-key="gradle">

```kotlin
// build.gradle.kts
dependencies {
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-debug:%coroutinesVersion%")
}
```

</tab>
<tab title="Maven" group-key="maven">

```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.jetbrains.kotlinx</groupId>
    <artifactId>kotlinx-coroutines-debug</artifactId>
    <version>%coroutinesVersion%</version>
    <scope>test</scope>
</dependency>
```

</tab>
</tabs>

### 使用调试代理跟踪协程 {id="track-coroutines-with-the-debug-agent"}

要开始使用调试代理跟踪协程，你可以：

* 将 `-javaagent:/path/to/kotlinx-coroutines-debug-%coroutinesVersion%.jar` 添加到你的虚拟机选项中，以便在应用程序启动时加载调试代理。
* 在启动要跟踪的协程之前调用 [`DebugProbes.install()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-debug/kotlinx.coroutines.debug/-debug-probes/install.html) 函数。

> 从 JDK 21 开始，使用 `DebugProbes.install()` 函数动态加载调试代理可能会产生警告。
> 要避免此警告，请使用 `-javaagent` 虚拟机选项加载代理。
>
{style="note"}

激活调试代理后，你可以使用以下 API：

* [`DebugProbes.dumpCoroutines()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-debug/kotlinx.coroutines.debug/-debug-probes/dump-coroutines.html) 打印所有活跃协程。
* [`DebugProbes.dumpCoroutinesInfo()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-debug/kotlinx.coroutines.debug/-debug-probes/dump-coroutines-info.html) 返回有关活跃协程的信息。
* [`DebugProbes.printJob()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-debug/kotlinx.coroutines.debug/-debug-probes/print-job.html) 打印 `Job` 层次结构的协程转储。
* [`DebugProbes.printScope()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-debug/kotlinx.coroutines.debug/-debug-probes/print-scope.html) 打印 `CoroutineScope` 层次结构的协程转储。

以下示例使用调试代理打印活跃协程以及特定 `Job` 的协程层次结构：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.debug.*
import kotlin.time.Duration.Companion.seconds

private suspend fun loadAccount() {
    delay(5.seconds)
}

private suspend fun loadPreferences() {
    delay(5.seconds)
}

private suspend fun loadUserProfile() = coroutineScope {
    launch { loadAccount() }
    launch { loadPreferences() }
}

@OptIn(ExperimentalCoroutinesApi::class)
fun main() {
    // 安装调试代理
    // 仅在未使用 -javaagent 虚拟机选项时才需要此操作
    DebugProbes.install()

    runBlocking {
        // 启动带有两个子协程的协程
        val loadingJob = launch {
            loadUserProfile()
        }

        // 给子协程挂起的时间
        delay(1.seconds)

        // 打印所有活跃协程
        DebugProbes.dumpCoroutines()

        println("============")

        // 打印加载作业及其子协程
        DebugProbes.printJob(loadingJob)
    }
}
```

在启用[调试模式](#enable-debug-mode)的情况下，运行该示例会产生以下输出：

```text
Coroutines dump 2026/08/18 14:00:08

Coroutine "coroutine#1":BlockingCoroutine{Active}@146ba0ac, state: RUNNING
	at java.base/java.lang.Thread.getStackTrace(Thread.java:2389)
	at kotlinx.coroutines.debug.internal.DebugProbesImpl.enhanceStackTraceWithThreadDumpImpl(DebugProbesImpl.kt:339)
	at kotlinx.coroutines.debug.internal.DebugProbesImpl.dumpCoroutinesSynchronized(DebugProbesImpl.kt:294)
	at kotlinx.coroutines.debug.internal.DebugProbesImpl.dumpCoroutines(DebugProbesImpl.kt:266)
	at kotlinx.coroutines.debug.DebugProbes.dumpCoroutines(DebugProbes.kt:181)
	at kotlinx.coroutines.debug.DebugProbes.dumpCoroutines$default(DebugProbes.kt:181)
	at DebugAgentExampleKt$main$1.invokeSuspend(DebugAgentExample.kt:34)

Coroutine "coroutine#2":StandaloneCoroutine{Active}@4dfa3a9d, state: SUSPENDED
	at DebugAgentExampleKt$main$1$loadingJob$1.invokeSuspend(DebugAgentExample.kt:27)

Coroutine "coroutine#3":StandaloneCoroutine{Active}@6eebc39e, state: SUSPENDED
	at DebugAgentExampleKt$loadUserProfile$2$1.invokeSuspend(DebugAgentExample.kt:14)

Coroutine "coroutine#4":StandaloneCoroutine{Active}@464bee09, state: SUSPENDED
	at DebugAgentExampleKt$loadUserProfile$2$2.invokeSuspend(DebugAgentExample.kt:15)============
"coroutine#2":StandaloneCoroutine{Active}, continuation is SUSPENDED at line DebugAgentExampleKt$main$1$loadingJob$1.invokeSuspend(DebugAgentExample.kt:27)
	"coroutine#3":StandaloneCoroutine{Active}, continuation is SUSPENDED at line DebugAgentExampleKt$loadUserProfile$2$1.invokeSuspend(DebugAgentExample.kt:14)
	"coroutine#4":StandaloneCoroutine{Active}, continuation is SUSPENDED at line DebugAgentExampleKt$loadUserProfile$2$2.invokeSuspend(DebugAgentExample.kt:15)
```
{collapsible="true" collapsed-title="调试模式示例输出"}

### 当 JUnit 测试超时时打印活跃协程 {id="print-active-coroutines-when-junit-tests-time-out"}

你可以根据 JUnit 版本使用相应的 `CoroutinesTimeout` API 为 JUnit 测试设置超时。
该 API 会自动安装调试探针。
如果测试未在超时之前完成，它会打印所有活跃协程及其堆栈跟踪，并使测试失败。

#### JUnit 4 {id="junit-4"}

要为 JUnit 4 测试设置超时并在超出超时时打印所有活跃协程及其堆栈跟踪，请使用 [`CoroutinesTimeout`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-debug/kotlinx.coroutines.debug.junit4/-coroutines-timeout/) 规则：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.debug.junit4.CoroutinesTimeout
import org.junit.Rule
import org.junit.Test
import kotlin.time.Duration

@OptIn(ExperimentalCoroutinesApi::class)
class UserProfileTest {
    @get:Rule
    val timeout = CoroutinesTimeout.seconds(1)

    private suspend fun loadUserProfile() {
        withContext(Dispatchers.IO) {
            // 模拟未完成的操作
            delay(Duration.INFINITE)
        }
    }

    @Test
    fun loadsUserProfile() = runBlocking {
        val loadingJob = launch {
            loadUserProfile()
        }

        // 等待协程，因此测试不会完成
        loadingJob.join()
    }
}
```

一秒钟后，该规则报告测试超时，并打印所有活跃协程及其堆栈跟踪。
随后测试因抛出 `TestTimedOutException` 而失败。

```text
Test loadsUserProfile timed out after 1 seconds

Coroutines dump 2026/08/18 13:48:21

Coroutine "coroutine#1":BlockingCoroutine{Active}@bf1ec20, state: SUSPENDED
	at UserProfileTest$loadsUserProfile$1.invokeSuspend(UserProfileTest.kt:27)
	at _COROUTINE._CREATION._(CoroutineDebugging.kt:30)
	at kotlin.coroutines.intrinsics.IntrinsicsKt__IntrinsicsJvmKt.createCoroutineUnintercepted(IntrinsicsJvm.kt:161)
	at kotlinx.coroutines.intrinsics.CancellableKt.startCoroutineCancellable(Cancellable.kt:26)
	at kotlinx.coroutines.BuildersKt__Builders_concurrentKt.runBlockingK$default(Builders.concurrent.kt:157)
	at kotlinx.coroutines.BuildersKt.runBlockingK$default(Unknown Source)
	at UserProfileTest.loadsUserProfile(UserProfileTest.kt:21)
	at java.base/jdk.internal.reflect.DirectMethodHandleAccessor.invoke(DirectMethodHandleAccessor.java:103)
	at java.base/java.lang.reflect.Method.invoke(Method.java:580)
	at org.junit.runners.model.FrameworkMethod$1.runReflectiveCall(FrameworkMethod.java:59)
	at org.junit.internal.runners.model.ReflectiveCallable.run(ReflectiveCallable.java:12)
	at org.junit.runners.model.FrameworkMethod.invokeExplosively(FrameworkMethod.java:56)
	at org.junit.internal.runners.statements.InvokeMethod.evaluate(InvokeMethod.java:17)
	at kotlinx.coroutines.debug.junit4.CoroutinesTimeoutStatement$evaluate$$inlined$runWithTimeoutDumpingCoroutines$1.call(CoroutinesTimeoutImpl.kt:79)
	at kotlinx.coroutines.debug.junit4.CoroutinesTimeoutStatement$evaluate$$inlined$runWithTimeoutDumpingCoroutines$1.call(CoroutinesTimeoutImpl.kt:79)
	at java.base/java.util.concurrent.FutureTask.run(FutureTask.java:317)
	at java.base/java.lang.Thread.run(Thread.java:1575)

Coroutine "coroutine#2":StandaloneCoroutine{Active}@70efb718, state: SUSPENDED
	at UserProfileTest$loadUserProfile$2.invokeSuspend(UserProfileTest.kt:16)
	at UserProfileTest$loadsUserProfile$1$loadingJob$1.invokeSuspend(UserProfileTest.kt:23)
	at _COROUTINE._CREATION._(CoroutineDebugging.kt:30)
	at kotlin.coroutines.intrinsics.IntrinsicsKt__IntrinsicsJvmKt.createCoroutineUnintercepted(IntrinsicsJvm.kt:161)
	at kotlinx.coroutines.intrinsics.CancellableKt.startCoroutineCancellable(Cancellable.kt:26)
	at kotlinx.coroutines.BuildersKt__Builders_commonKt.launch$default(Builders.common.kt:200)
	at kotlinx.coroutines.BuildersKt.launch$default(Unknown Source)
	at UserProfileTest$loadsUserProfile$1.invokeSuspend(UserProfileTest.kt:22)
	at kotlin.coroutines.jvm.internal.BaseContinuationImpl.resumeWith(ContinuationImpl.kt:34)
	at kotlinx.coroutines.DispatchedTask.run(DispatchedTask.kt:100)
	at kotlinx.coroutines.BuildersKt__Builders_concurrentKt.runBlockingK$default(Builders.concurrent.kt:157)
	at kotlinx.coroutines.BuildersKt.runBlockingK$default(Unknown Source)
	at UserProfileTest.loadsUserProfile(UserProfileTest.kt:21)
	at java.base/jdk.internal.reflect.DirectMethodHandleAccessor.invoke(DirectMethodHandleAccessor.java:103)
	at java.base/java.lang.reflect.Method.invoke(Method.java:580)
	at org.junit.runners.model.FrameworkMethod$1.runReflectiveCall(FrameworkMethod.java:59)
	at org.junit.internal.runners.model.ReflectiveCallable.run(ReflectiveCallable.java:12)
	at org.junit.runners.model.FrameworkMethod.invokeExplosively(FrameworkMethod.java:56)
	at org.junit.internal.runners.statements.InvokeMethod.evaluate(InvokeMethod.java:17)
	at kotlinx.coroutines.debug.junit4.CoroutinesTimeoutStatement$evaluate$$inlined$runWithTimeoutDumpingCoroutines$1.call(CoroutinesTimeoutImpl.kt:79)
	at kotlinx.coroutines.debug.junit4.CoroutinesTimeoutStatement$evaluate$$inlined$runWithTimeoutDumpingCoroutines$1.call(CoroutinesTimeoutImpl.kt:79)
	at java.base/java.util.concurrent.FutureTask.run(FutureTask.java:317)
	at java.base/java.lang.Thread.run(Thread.java:1575)
test timed out after 1000 milliseconds
org.junit.runners.model.TestTimedOutException: test timed out after 1000 milliseconds
	at java.base/jdk.internal.misc.Unsafe.park(Native Method)
	at java.base/java.util.concurrent.locks.LockSupport.parkNanos(LockSupport.java:269)
	at kotlinx.coroutines.BlockingCoroutine.joinBlocking(Builders.kt:57)
	at kotlinx.coroutines.BuildersKt__BuildersKt.runBlockingImpl(Builders.kt:30)
	at kotlinx.coroutines.BuildersKt.runBlockingImpl(Unknown Source)
	at kotlinx.coroutines.BuildersKt__Builders_concurrentKt.runBlockingK(Builders.concurrent.kt:172)
	at kotlinx.coroutines.BuildersKt.runBlockingK(Unknown Source)
	at kotlinx.coroutines.BuildersKt__Builders_concurrentKt.runBlockingK$default(Builders.concurrent.kt:157)
	at kotlinx.coroutines.BuildersKt.runBlockingK$default(Unknown Source)
	at UserProfileTest.loadsUserProfile(UserProfileTest.kt:21)
	at java.base/jdk.internal.reflect.DirectMethodHandleAccessor.invoke(DirectMethodHandleAccessor.java:103)
	at java.base/java.lang.reflect.Method.invoke(Method.java:580)
	at org.junit.runners.model.FrameworkMethod$1.runReflectiveCall(FrameworkMethod.java:59)
	at org.junit.internal.runners.model.ReflectiveCallable.run(ReflectiveCallable.java:12)
	at org.junit.runners.model.FrameworkMethod.invokeExplosively(FrameworkMethod.java:56)
	at org.junit.internal.runners.statements.InvokeMethod.evaluate(InvokeMethod.java:17)
	at kotlinx.coroutines.debug.junit4.CoroutinesTimeoutStatement$evaluate$$inlined$runWithTimeoutDumpingCoroutines$1.call(CoroutinesTimeoutImpl.kt:79)
	at java.base/java.util.concurrent.FutureTask.run(FutureTask.java:317)
	at java.base/java.lang.Thread.run(Thread.java:1575)
```
{collapsible="true" collapsed-title="CoroutinesTimeout JUnit4 示例输出"}

#### JUnit 5 {id="junit-5"}

要将超时应用于类中的所有测试函数，请向该类添加 [`@CoroutinesTimeout`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-debug/kotlinx.coroutines.debug.junit5/-coroutines-timeout/) 注解：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.debug.junit5.CoroutinesTimeout
import org.junit.jupiter.api.Test
import kotlin.time.Duration

@OptIn(ExperimentalCoroutinesApi::class)
// 为该类中的所有测试函数设置一秒钟的超时
@CoroutinesTimeout(testTimeoutMs = 1_000)
class UserProfileTest {
    private suspend fun loadUserProfile() {
        withContext(Dispatchers.IO) {
            // 模拟未完成的操作
            delay(Duration.INFINITE)
        }
    }

    @Test
    fun loadsUserProfile() = runBlocking {
        val loadingJob = launch {
            loadUserProfile()
        }

        // 等待协程，因此测试不会完成
        loadingJob.join()
    }
}
```
{validate="false"}

一秒钟后，`CoroutinesTimeout` API 报告超时并打印所有活跃协程及其堆栈跟踪。
随后测试因抛出 `CoroutinesTimeoutException` 而失败。

```text
Test loadsUserProfile timed out after 1 seconds

Coroutines dump 2026/08/18 13:46:15

Coroutine "coroutine#1":BlockingCoroutine{Active}@5c77053b, state: SUSPENDED
	at UserProfileTest$loadsUserProfile$1.invokeSuspend(UserProfileTest.kt:24)

Coroutine "coroutine#2":StandaloneCoroutine{Active}@26b894bd, state: SUSPENDED
	at UserProfileTest$loadUserProfile$2.invokeSuspend(UserProfileTest.kt:13)
	at UserProfileTest$loadsUserProfile$1$loadingJob$1.invokeSuspend(UserProfileTest.kt:20)
test timed out after 1000 ms
kotlinx.coroutines.debug.junit5.CoroutinesTimeoutException: test timed out after 1000 ms
	at java.base/jdk.internal.misc.Unsafe.park(Native Method)
	at java.base/java.util.concurrent.locks.LockSupport.parkNanos(LockSupport.java:269)
	at kotlinx.coroutines.BlockingCoroutine.joinBlocking(Builders.kt:57)
	at kotlinx.coroutines.BuildersKt__BuildersKt.runBlockingImpl(Builders.kt:30)
	at kotlinx.coroutines.BuildersKt.runBlockingImpl(Unknown Source)
	at kotlinx.coroutines.BuildersKt__Builders_concurrentKt.runBlockingK(Builders.concurrent.kt:172)
	at kotlinx.coroutines.BuildersKt.runBlockingK(Unknown Source)
	at kotlinx.coroutines.BuildersKt__Builders_concurrentKt.runBlockingK$default(Builders.concurrent.kt:157)
	at kotlinx.coroutines.BuildersKt.runBlockingK$default(Unknown Source)
	at UserProfileTest.loadsUserProfile(UserProfileTest.kt:18)
	at java.base/java.lang.reflect.Method.invoke(Method.java:580)
	at kotlinx.coroutines.debug.junit5.CoroutinesTimeoutExtension$interceptInvocation$$inlined$runWithTimeoutDumpingCoroutines$1.call(CoroutinesTimeoutImpl.kt:79)
	at java.base/java.util.concurrent.FutureTask.run(FutureTask.java:317)
	at java.base/java.lang.Thread.run(Thread.java:1575)
```
{collapsible="true" collapsed-title="CoroutinesTimeout JUnit5 示例输出"}

### 解决 Android 上的 `kotlinx-coroutines-debug` 资源冲突 {id="resolve-kotlinx-coroutines-debug-resource-conflicts-on-android"}

Android 上不支持调试代理。

`kotlinx-coroutines-debug` 模块对 JNA、JNA Platform、Byte Buddy 和 Byte Buddy Agent 具有传递依赖项。
其中某些依赖项包含具有相同路径的资源。
当 Android 合并依赖项资源时，重复的路径可能会导致 `DuplicateRelativeFileException`，从而引发构建失败。

要在保留 `kotlinx-coroutines-debug` 依赖项的同时解决构建失败问题，请在 `build.gradle.kts` 文件中使用以下 `packaging` 配置排除冲突的资源：

```kotlin
// build.gradle.kts
android {
    packaging {
        resources {
            // 排除来自 JNA 和 JNA Platform 的许可证文件
            excludes += setOf(
                "META-INF/AL2.0",
                "META-INF/LGPL2.1",
            )

            // 排除来自 Byte Buddy 的 ASM 许可证文件
            excludes += "META-INF/licenses/ASM"

            // 保留每个 Byte Buddy Agent 文件的一个副本
            pickFirsts += setOf(
                "win32-x86-64/attach_hotspot_windows.dll",
                "win32-x86/attach_hotspot_windows.dll",
            )
        }
    }
}
```

## 后续步骤 {id="what-s-next"}

在[使用 IntelliJ IDEA 调试协程](debug-coroutines-with-idea.md)和[使用 IntelliJ IDEA 调试 Kotlin Flow](debug-flow-with-idea.md) 中学习如何在 IntelliJ IDEA 中调试协程。