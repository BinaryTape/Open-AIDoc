[//]: # (title: SAM-with-receiver 編譯器外掛程式)

*sam-with-receiver* 編譯器外掛程式會使帶有註解的 Java 「單一抽象方法」(SAM) 介面方法的第一個參數在 Kotlin 中成為接收者 (receiver)。此轉換僅在 SAM 介面作為 Kotlin Lambda 運算式傳遞時有效，且同時適用於 SAM 適配器與 SAM 建構函式（詳情請參閱 [SAM 轉換文件](java-interop.md#sam-conversions)）。

以下是一個範例：

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
        // 這裡的 'this' 是 'Task' 的執行個體

        println("$name is started")
        context.executeTask(this)
        println("$name is finished")
    }
}
```

## Gradle {id="gradle"}

其用法與 [all-open](all-open-plugin.md) 和 [no-arg](no-arg-plugin.md) 相同，唯獨 sam-with-receiver 沒有任何內建預設，您需要指定自己的特殊處理註解清單。

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

接著指定 SAM-with-receiver 註解清單：

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

## 命令列編譯器 {id="command-line-compiler"}

將外掛程式的 JAR 檔案新增至編譯器外掛程式的類別路徑 (classpath)，並指定 sam-with-receiver 註解清單：

```bash
-Xplugin=$KOTLIN_HOME/lib/sam-with-receiver-compiler-plugin.jar
-P plugin:org.jetbrains.kotlin.samWithReceiver:annotation=com.my.SamWithReceiver
```
