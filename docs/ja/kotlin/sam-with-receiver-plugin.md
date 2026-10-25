[//]: # (title: SAM-with-receiver コンパイラプラグイン)

*sam-with-receiver* コンパイラプラグインは、アノテーションが付与された Java の「単一抽象メソッド」（SAM: single abstract method）インターフェースメソッドの最初の引数を、Kotlin におけるレシーバーにします。この変換は、SAM アダプターと SAM コンストラクターのどちらの場合でも、SAM インターフェースが Kotlin ラムダとして渡されたときにのみ機能します（詳細については [SAM 変換のドキュメント](java-interop.md#sam-conversions) を参照してください）。

以下に例を示します。

```java
public @interface SamWithReceiver {}

@SamWithReceiver
public interface TaskRunner {
    void run(Task task);
}
```

```kotlin
fun test(context: TaskContext) {
    val runner = TaskRunner {
        // ここで 'this' は 'Task' のインスタンスになります

        println("$name is started")
        context.executeTask(this)
        println("$name is finished")
    }
}
```

## Gradle {id="gradle"}

使用方法は [`all-open`](all-open-plugin.md) や [`no-arg`](no-arg-plugin.md) と同様ですが、sam-with-receiver には組み込みのプリセットがなく、対象とするアノテーションのリストを自身で指定する必要がある点が異なります。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("plugin.sam.with.receiver") version "%kotlinVersion%"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id "org.jetbrains.kotlin.plugin.sam.with.receiver" version "%kotlinVersion%"
}
```

</tab>
</tabs>

続いて、SAM-with-receiver アノテーションのリストを指定します。

```groovy
samWithReceiver {
    annotation("com.my.SamWithReceiver")
}
```

## Maven {id="maven"}

```xml
<plugin>
    <artifactId>kotlin-maven-plugin</artifactId>
    <groupId>org.jetbrains.kotlin</groupId>
    <version>${kotlin.version}</version>

    <configuration>
        <compilerPlugins>
            <plugin>sam-with-receiver</plugin>
        </compilerPlugins>

        <pluginOptions>
            <option>
                sam-with-receiver:annotation=com.my.SamWithReceiver
            </option>
        </pluginOptions>
    </configuration>

    <dependencies>
        <dependency>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-sam-with-receiver</artifactId>
            <version>${kotlin.version}</version>
        </dependency>
    </dependencies>
</plugin>
```

## コマンドラインコンパイラ {id="command-line-compiler"}

プラグインの JAR ファイルをコンパイラプラグインのクラスパスに追加し、sam-with-receiver アノテーションのリストを指定します。

```bash
-Xplugin=$KOTLIN_HOME/lib/sam-with-receiver-compiler-plugin.jar
-P plugin:org.jetbrains.kotlin.samWithReceiver:annotation=com.my.SamWithReceiver
```