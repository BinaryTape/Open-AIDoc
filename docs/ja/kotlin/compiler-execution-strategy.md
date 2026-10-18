[//]: # (title: コンパイラー実行戦略)

_Kotlinコンパイラー実行戦略（Kotlin compiler execution strategy）_ は、Kotlinコンパイラーがどこで実行されるかを定義します。
[Gradle](gradle.md) や [Maven](maven.md) などのビルドツールでこの戦略を設定します。

コンパイラー実行戦略には次の2つがあります。

| 戦略 | Kotlinコンパイラーが実行される場所 | その他の特徴と注意点 |
|-----------------------------------|---------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Kotlinデーモン](kotlin-daemon.md) | 独自のデーモンプロセス内 | GradleおよびMavenにおける _デフォルトかつ最速の戦略_ です。デーモンプロセスは、異なるビルドシステムプロセス間や複数の並列コンパイル間で共有できます。 |
| インプロセス（In process） | ビルドツールのプロセス内 | メモリ管理の観点からは最もシンプルな戦略ですが、JVMシステムプロパティなどの状態を共有するため、同じプロセスで実行されている他のロジックからの分離性が低くなります。 |

## Gradleでの設定 {id="configure-in-gradle"}

Kotlinコンパイラー実行戦略は、以下のプロパティのいずれかを使用して定義できます。

* Gradleプロパティの `kotlin.compiler.execution.strategy`
* コンパイルタスクプロパティの `compilerExecutionStrategy`

### Gradleプロパティの使用 {id="use-the-gradle-property"}

`kotlin.compiler.execution.strategy` プロパティに指定可能な値は以下のとおりです。

* `daemon`（デフォルト）
* `in-process`

`gradle.properties` で `kotlin.compiler.execution.strategy` プロパティを設定します。

```none
kotlin.compiler.execution.strategy=in-process
```

### コンパイルタスクプロパティの使用 {id="use-the-compile-task-property"}

タスクプロパティの `compilerExecutionStrategy` は、Gradleプロパティの `kotlin.compiler.execution.strategy` よりも優先されます。

`compilerExecutionStrategy` タスクプロパティに指定可能な値は以下のとおりです。

* [`DAEMON`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.tasks/-kotlin-compiler-execution-strategy/-d-a-e-m-o-n/)（デフォルト）
* [`IN_PROCESS`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.tasks/-kotlin-compiler-execution-strategy/-i-n_-p-r-o-c-e-s-s/)

ビルドスクリプトで `compilerExecutionStrategy` タスクプロパティを設定します。

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

### フォールバック戦略 {id="fallback-strategy"}

Kotlinデーモンとの通信に失敗した場合、コンパイラーは「インプロセス（In process）」戦略にフォールバックします。

このフォールバックが発生すると、Gradleはビルド出力に以下の警告を出力します。

```none
Failed to compile with Kotlin daemon: java.lang.RuntimeException: Could not connect to Kotlin compile daemon
[exception stacktrace]
Using fallback strategy: Compile without Kotlin daemon
Try ./gradlew --stop if this issue persists.
```

サイレントフォールバックは大量のシステムリソースを消費したり、非決定論的なビルドを引き起こしたりする可能性があります。
詳細については、こちらの [YouTrack issue](https://youtrack.jetbrains.com/issue/KT-48843/Add-ability-to-disable-Kotlin-daemon-fallback-strategy) を参照してください。

フォールバックを防ぐには、Gradleプロパティの `kotlin.daemon.useFallbackStrategy` を使用します。デフォルト値は `true` です。
`false` に設定すると、デーモンの起動や通信に問題があった場合にビルドが失敗します。
このプロパティを `gradle.properties` で宣言します。

```none
kotlin.daemon.useFallbackStrategy=false
```

また、Kotlinコンパイルタスクには `useDaemonFallbackStrategy` プロパティもあります。両方のプロパティを使用した場合、`useDaemonFallbackStrategy` プロパティが優先されます。

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

コンパイルを実行するのに十分なメモリがない場合、ログに関連するメッセージが表示されます。

## Mavenでの設定 {id="configure-in-maven"}

デフォルトでは、MavenはKotlinデーモンのコンパイラー実行戦略を使用します。「インプロセス（in process）」戦略に切り替えるには、`pom.xml` ファイルで以下のプロパティを設定します。

```xml
<properties>
    <kotlin.compiler.daemon>false</kotlin.compiler.daemon>
</properties>
```