[//]: # (title: 編譯器執行策略)

_Kotlin 編譯器執行策略_定義了 Kotlin 編譯器的執行位置。
[Gradle](gradle.md) 或 [Maven](maven.md) 等建置工具可以配置此策略。

共有兩種編譯器執行策略：

| 策略                              | Kotlin 編譯器的執行位置      | 其他特性與注意事項                                                                                                            |
|-----------------------------------|---------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Kotlin daemon](kotlin-daemon.md) | 在其獨立的 daemon 行程中        | Gradle 與 Maven 中_預設且最快的策略_。daemon 行程可以在不同的建置系統行程以及多個平行編譯之間共享。                                                            |
| In process                        | 在建置工具的行程內部            | 從記憶體管理的角度來看是最簡單的策略，但由於它會共享狀態（例如 JVM 系統屬性），因此與在同一行程中執行的其他邏輯之間的隔離性較低。                               |

## 在 Gradle 中配置 {id="configure-in-gradle"}

你可以使用下列其中一個屬性來定義 Kotlin 編譯器執行策略：

* `kotlin.compiler.execution.strategy` Gradle 屬性。
* `compilerExecutionStrategy` 編譯任務屬性。

### 使用 Gradle 屬性 {id="use-the-gradle-property"}

`kotlin.compiler.execution.strategy` 屬性的可用值為：

* `daemon`（預設）
* `in-process`

在 `gradle.properties` 中設定 `kotlin.compiler.execution.strategy` 屬性：

```none
kotlin.compiler.execution.strategy=in-process
```

### 使用編譯任務屬性 {id="use-the-compile-task-property"}

`compilerExecutionStrategy` 任務屬性的優先權高於 `kotlin.compiler.execution.strategy` Gradle 屬性。

`compilerExecutionStrategy` 任務屬性的可用值為：

* [`DAEMON`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.tasks/-kotlin-compiler-execution-strategy/-d-a-e-m-o-n/)（預設）
* [`IN_PROCESS`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.tasks/-kotlin-compiler-execution-strategy/-i-n_-p-r-o-c-e-s-s/)

在建置指令碼中設定 `compilerExecutionStrategy` 任務屬性：

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

### 備援策略 {id="fallback-strategy"}

如果與 Kotlin daemon 的通訊失敗，編譯器會備援至「In process」策略。

當此備援發生時，Gradle 會在建置輸出中印出以下警告：

```none
Failed to compile with Kotlin daemon: java.lang.RuntimeException: Could not connect to Kotlin compile daemon
[exception stacktrace]
Using fallback strategy: Compile without Kotlin daemon
Try ./gradlew --stop if this issue persists.
```

靜默備援可能會消耗大量系統資源，或導致不具確定性的建置結果。
若要了解更多資訊，請參閱此 [YouTrack 問題](https://youtrack.jetbrains.com/issue/KT-48843/Add-ability-to-disable-Kotlin-daemon-fallback-strategy)。

若要防止備援，請使用 `kotlin.daemon.useFallbackStrategy` Gradle 屬性。預設值為 `true`。
當設定為 `false` 時，如果 daemon 的啟動或通訊出現問題，建置將會失敗。
在 `gradle.properties` 中宣告此屬性：

```none
kotlin.daemon.useFallbackStrategy=false
```

Kotlin 編譯任務中也有一個 `useDaemonFallbackStrategy` 屬性。如果同時使用這兩個屬性，將以 `useDaemonFallbackStrategy` 屬性優先。

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

如果沒有足夠的記憶體來執行編譯，記錄中會顯示相關訊息。

## 在 Maven 中配置 {id="configure-in-maven"}

預設情況下，Maven 使用 Kotlin daemon 編譯器執行策略。若要切換到「in process」策略，請在你的 `pom.xml` 檔案中設定以下屬性：

```xml
<properties>
    <kotlin.compiler.daemon>false</kotlin.compiler.daemon>
</properties>
```