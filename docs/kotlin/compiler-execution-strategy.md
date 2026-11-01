[//]: # (title: 编译器执行策略)

_Kotlin 编译器执行策略_定义了 Kotlin 编译器的运行位置。
诸如 [Gradle](gradle.md) 或 [Maven](maven.md) 等构建工具可以配置该策略。

共有两种编译器执行策略：

| 策略 | Kotlin 编译器的运行位置 | 其他特性与注意事项 |
|-----------------------------------|---------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Kotlin daemon](kotlin-daemon.md) | 在其自身的 daemon 进程中 | Gradle 和 Maven 中的_默认且最快的策略_。该 daemon 进程可以在不同的构建系统进程和多个并行编译之间共享。 |
| In process | 在构建工具的进程中 | 从内存管理的角度来看是最简单的策略，但它与在同一进程中运行的其他逻辑之间的隔离性较弱，因为它会共享状态（例如 JVM 系统属性）。 |

## 在 Gradle 中配置 {id="configure-in-gradle"}

您可以使用以下属性之一来定义 Kotlin 编译器执行策略：

* `kotlin.compiler.execution.strategy` Gradle 属性。
* `compilerExecutionStrategy` 编译任务属性。

### 使用 Gradle 属性 {id="use-the-gradle-property"}

`kotlin.compiler.execution.strategy` 属性的可用取值包括：

* `daemon`（默认）
* `in-process`

在 `gradle.properties` 中设置 `kotlin.compiler.execution.strategy` 属性：

```none
kotlin.compiler.execution.strategy=in-process
```

### 使用编译任务属性 {id="use-the-compile-task-property"}

`compilerExecutionStrategy` 任务属性的优先级高于 `kotlin.compiler.execution.strategy` Gradle 属性。

`compilerExecutionStrategy` 任务属性的可用取值包括：

* [`DAEMON`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.tasks/-kotlin-compiler-execution-strategy/-d-a-e-m-o-n/)（默认）
* [`IN_PROCESS`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.tasks/-kotlin-compiler-execution-strategy/-i-n_-p-r-o-c-e-s-s/)

在您的构建脚本中设置 `compilerExecutionStrategy` 任务属性：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
import org.jetbrains.kotlin.gradle.tasks.CompileUsingKotlinDaemon
import org.jetbrains.kotlin.gradle.tasks.KotlinCompilerExecutionStrategy

// ...

tasks.withType<CompileUsingKotlinDaemon>().configureEach {
    compilerExecutionStrategy.set(KotlinCompilerExecutionStrategy.IN_PROCESS)
} 
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
import org.jetbrains.kotlin.gradle.tasks.CompileUsingKotlinDaemon
import org.jetbrains.kotlin.gradle.tasks.KotlinCompilerExecutionStrategy

// ...

tasks.withType(CompileUsingKotlinDaemon)
        .configureEach {
            compilerExecutionStrategy = KotlinCompilerExecutionStrategy.IN_PROCESS
        }
```

</tab>
</tabs>

### 回退策略 {id="fallback-strategy"}

如果与 Kotlin daemon 的通信失败，编译器将回退到“In process”策略。

当发生此类回退时，Gradle 会在构建输出中输出以下警告：

```none
Failed to compile with Kotlin daemon: java.lang.RuntimeException: Could not connect to Kotlin compile daemon
[exception stacktrace]
Using fallback strategy: Compile without Kotlin daemon
Try ./gradlew --stop if this issue persists.
```

静默回退可能会消耗大量系统资源，或者导致非确定性构建。
要了解更多信息，请参阅此 [YouTrack 问题](https://youtrack.jetbrains.com/issue/KT-48843/Add-ability-to-disable-Kotlin-daemon-fallback-strategy)。

要防止回退，请使用 `kotlin.daemon.useFallbackStrategy` Gradle 属性。默认值为 `true`。
当设置为 `false` 时，如果 daemon 的启动或通信出现问题，构建将失败。
在 `gradle.properties` 中声明该属性：

```none
kotlin.daemon.useFallbackStrategy=false
```

在 Kotlin 编译任务中也有一个 `useDaemonFallbackStrategy` 属性。如果您同时使用了这两个属性，`useDaemonFallbackStrategy` 属性将具有更高优先级。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
tasks {
    compileKotlin {
        useDaemonFallbackStrategy.set(false)
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
tasks.named("compileKotlin").configure {
    useDaemonFallbackStrategy = false
}
```

</tab>
</tabs>

如果运行编译的内存不足，日志中会显示相关消息。

## 在 Maven 中配置 {id="configure-in-maven"}

默认情况下，Maven 使用 Kotlin daemon 编译器执行策略。要切换到“in process”策略，请在 `pom.xml` 文件中设置以下属性：

```xml
<properties>
    <kotlin.compiler.daemon>false</kotlin.compiler.daemon>
</properties>
```