[//]: # (title: 컴파일러 실행 전략)

_Kotlin 컴파일러 실행 전략(Kotlin compiler execution strategy)_은 Kotlin 컴파일러가 어디에서 실행되는지를 정의합니다.
[Gradle](gradle.md) 또는 [Maven](maven.md)과 같은 빌드 도구에서 이 전략을 구성합니다.

두 가지 컴파일러 실행 전략이 있습니다:

| 전략 | Kotlin 컴파일러가 실행되는 위치 | 기타 특성 및 참고 사항 |
|---|---|---|
| [Kotlin 데몬](kotlin-daemon.md) | 자체 데몬 프로세스 내부 | Gradle 및 Maven의 _기본 전략이자 가장 빠른 전략_입니다. 데몬 프로세스는 서로 다른 빌드 시스템 프로세스와 여러 병렬 컴파일 간에 공유될 수 있습니다. |
| In process (인프로세스) | 빌드 도구의 프로세스 내부 | 메모리 관리 관점에서는 가장 단순한 전략이지만, JVM 시스템 프로퍼티와 같은 상태를 공유하므로 동일한 프로세스에서 실행되는 다른 로직과의 격리 수준이 떨어집니다. |

## Gradle에서 구성하기 {id="configure-in-gradle"}

다음 프로퍼티 중 하나를 사용하여 Kotlin 컴파일러 실행 전략을 정의할 수 있습니다:

* `kotlin.compiler.execution.strategy` Gradle 프로퍼티.
* `compilerExecutionStrategy` 컴파일 태스크 프로퍼티.

### Gradle 프로퍼티 사용 {id="use-the-gradle-property"}

`kotlin.compiler.execution.strategy` 프로퍼티에 설정할 수 있는 값은 다음과 같습니다:

* `daemon` (기본값)
* `in-process`

`gradle.properties`에서 `kotlin.compiler.execution.strategy` 프로퍼티를 설정합니다:

```none
kotlin.compiler.execution.strategy=in-process
```

### 컴파일 태스크 프로퍼티 사용 {id="use-the-compile-task-property"}

`compilerExecutionStrategy` 태스크 프로퍼티는 `kotlin.compiler.execution.strategy` Gradle 프로퍼티보다 우선 적용됩니다.

`compilerExecutionStrategy` 태스크 프로퍼티에 설정할 수 있는 값은 다음과 같습니다:

* [`DAEMON`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.tasks/-kotlin-compiler-execution-strategy/-d-a-e-m-o-n/) (기본값)
* [`IN_PROCESS`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.tasks/-kotlin-compiler-execution-strategy/-i-n_-p-r-o-c-e-s-s/)

빌드 스크립트에서 `compilerExecutionStrategy` 태스크 프로퍼티를 설정합니다:

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

### 폴백 전략(Fallback strategy) {id="fallback-strategy"}

Kotlin 데몬과의 통신에 실패하면 컴파일러는 "In process" 전략으로 폴백합니다.

이러한 폴백이 발생하면 Gradle은 빌드 출력에 다음 경고를 출력합니다:

```none
Failed to compile with Kotlin daemon: java.lang.RuntimeException: Could not connect to Kotlin compile daemon
[exception stacktrace]
Using fallback strategy: Compile without Kotlin daemon
Try ./gradlew --stop if this issue persists.
```

사용자 모르게 발생하는 자동 폴백(Silent fallback)은 많은 시스템 리소스를 소모하거나 비결정론적(non-deterministic) 빌드를 초래할 수 있습니다.
자세한 내용은 이 [YouTrack 이슈](https://youtrack.jetbrains.com/issue/KT-48843/Add-ability-to-disable-Kotlin-daemon-fallback-strategy)를 참조하세요.

폴백을 방지하려면 `kotlin.daemon.useFallbackStrategy` Gradle 프로퍼티를 사용하세요. 기본값은 `true`입니다.
`false`로 설정하면 데몬의 시작 또는 통신에 문제가 발생할 때 빌드가 실패합니다.
`gradle.properties`에 이 프로퍼티를 선언합니다:

```none
kotlin.daemon.useFallbackStrategy=false
```

Kotlin 컴파일 태스크에도 `useDaemonFallbackStrategy` 프로퍼티가 있습니다. 두 프로퍼티를 모두 사용하는 경우 `useDaemonFallbackStrategy` 프로퍼티가 우선 적용됩니다.

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

컴파일을 실행하기에 메모리가 충분하지 않은 경우 로그에 관련 메시지가 표시됩니다.

## Maven에서 구성하기 {id="configure-in-maven"}

기본적으로 Maven은 Kotlin 데몬 컴파일러 실행 전략을 사용합니다. "in process" 전략으로 전환하려면 `pom.xml` 파일에 다음 프로퍼티를 설정하세요:

```xml
<properties>
    <kotlin.compiler.daemon>false</kotlin.compiler.daemon>
</properties>
```