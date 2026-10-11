[//]: # (title: 使用 I/O 源序列化 JSON)
<primary-label ref="experimental-general"/>

Kotlin 序列化提供了用于处理 JVM 流以及 [`kotlinx-io`](https://github.com/Kotlin/kotlinx-io) 或 [Okio](https://square.github.io/okio/) 的 Source 与 Sink 的 API。

你可以使用这些 API 直接从 I/O 源序列化和反序列化 JSON，而无需创建中间字符串。
这些 API 使用 UTF-8 编码，当遇到无效的 JSON 数据时会抛出 `SerializationException`，发生 I/O 故障时会抛出 `IOException`。

在处理 I/O 资源时，正确关闭它们以防止资源泄漏非常重要。
你可以使用 `.use()` 函数来完成此操作，该函数会在操作完成时自动关闭资源。

## 将 JSON 序列化到 JVM 输出流 {id="serialize-json-to-jvm-output-streams"}

使用 [`.encodeToStream()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/encode-to-stream.html) 扩展函数直接将 JSON 序列化到 JVM [`OutputStream`](https://docs.oracle.com/javase/8/docs/api/java/io/OutputStream.html)：

```kotlin
// 从序列化库导入声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import java.io.FileOutputStream

@Serializable
data class Project(val name: String, val stars: Int)

fun main() {
    val project = Project("kotlinx.serialization", 9000)
    
    // 为 project.json 文件创建 OutputStream
    FileOutputStream("project.json").use { output ->
        
        // 将 project 实例序列化到 OutputStream 中
        Json.encodeToStream(project, output)
    }
}
```

在此示例中，`Project` 的 JSON 表示形式被序列化到 `project.json` 文件中。

## 从 JVM 输入流反序列化 JSON {id="deserialize-json-from-jvm-input-streams"}

要直接从 JVM [`InputStream`](https://docs.oracle.com/javase/8/docs/api/java/io/InputStream.html) 反序列化 JSON，请使用 [`.decodeFromStream()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/decode-from-stream.html) 扩展函数：

```kotlin
// 从序列化库导入声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import java.io.FileInputStream

@Serializable
data class Project(val name: String, val stars: Int)

fun main() {
    // 打开一个 InputStream
    FileInputStream("project.json").use { input ->

        // 将 InputStream 中的 JSON 内容反序列化为 Project 实例
        val project = Json.decodeFromStream<Project>(input)

        // 打印反序列化后的 Project 实例
        println(project)
    }
}
```

在此示例中，输入流中的 JSON 内容被反序列化为单个 `Project` 实例。

如果你的输入在顶层 JSON 数组中包含多个 JSON 对象，或者包含以空格分隔的对象，你可以使用 [`.decodeToSequence()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/decode-to-sequence.html) 延迟处理这些元素。
这使你可以在解析每个值时对其进行处理，例如：

```kotlin
// 从序列化库导入声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import java.io.FileInputStream

@Serializable
data class Project(val name: String, val stars: Int)

fun main() {
    // 为包含 Project 对象 JSON 数组的 projects.json 文件打开一个 InputStream
    FileInputStream("projects.json").use { input ->

        // 从 InputStream 延迟反序列化每个 Project
        val projects = Json.decodeToSequence<Project>(input)

        // 逐个处理元素
        for (project in projects) {
            println(project)
        }
    }
}
```

> 由 `.decodeToSequence()` 返回的序列只能遍历一次，因为它们与底层流相关联。
> 
> 在序列完全求值之前如果其底层流已关闭，访问该序列可能会导致异常。
> 
{style="note"}

## 使用 kotlinx-io 和 Okio 进行 JSON 序列化 {id="json-serialization-with-kotlinx-io-and-okio"}

除了 JVM 流之外，你还可以使用 I/O 类型来处理 JSON，例如来自 [`kotlinx-io`](https://github.com/Kotlin/kotlinx-io) 库（目前处于 [Alpha](components-stability.md#stability-levels-explained) 阶段）的 `kotlinx.io.Sink` 和 `kotlinx.io.Source`，以及来自 [Okio](https://square.github.io/okio/) 库的 `okio.BufferedSink` 和 `okio.BufferedSource`。

你可以使用以下 `Json` 扩展函数通过这些 I/O 类型直接读写 JSON：

* [`.encodeToSink()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json-io/kotlinx.serialization.json.io/encode-to-sink.html) 与 [`.encodeToBufferedSink()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json-okio/kotlinx.serialization.json.okio/encode-to-buffered-sink.html)：将 JSON 写入 `kotlinx.io.Sink` 或 `okio.BufferedSink`。
* [`.decodeFromSource()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json-io/kotlinx.serialization.json.io/decode-from-source.html) 与 [`.decodeFromBufferedSource()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json-okio/kotlinx.serialization.json.okio/decode-from-buffered-source.html)：从 `kotlinx.io.Source` 或 `okio.BufferedSource` 中读取单个 JSON 值。
* [`.decodeSourceToSequence()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json-io/kotlinx.serialization.json.io/decode-source-to-sequence.html) 与 [`.decodeBufferedSourceToSequence()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json-okio/kotlinx.serialization.json.okio/decode-buffered-source-to-sequence.html)：将多个 JSON 值延迟解码为 `Sequence<T>`。

接下来的部分介绍了结合这些 API 使用 `kotlinx-io` 类型的示例。  
你可以类似地将 Okio 类型与其对应的 `okio.BufferedSink` 和 `okio.BufferedSource` API 配合使用。

### 为 kotlinx-io 和 Okio 添加依赖项 {id="add-dependencies-for-kotlinx-io-and-okio"}

要将这些扩展函数与 `kotlinx-io` 或 Okio 类型一起使用，请添加相应的依赖项：

#### 为 `kotlinx-io` 添加依赖项 {id="add-dependencies-for-kotlinx-io"}

<tabs group="build-script">
<tab title="Gradle" group-key="gradle">

```kotlin
// build.gradle(.kts)
dependencies {
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json-io:%serializationVersion%")
    implementation("org.jetbrains.kotlinx:kotlinx-io-core:%kotlinxIoVersion%")
}
```

</tab>

<tab title="Maven" group-key="maven">

```xml
<!-- pom.xml -->
<dependencies>
    <dependency>
        <groupId>org.jetbrains.kotlinx</groupId>
        <artifactId>kotlinx-serialization-json-io</artifactId>
        <version>%serializationVersion%</version>
    </dependency>
    <dependency>
        <groupId>org.jetbrains.kotlinx</groupId>
        <artifactId>kotlinx-io-core</artifactId>
        <version>%kotlinxIoVersion%</version>
    </dependency>
</dependencies>
```
</tab>
</tabs>

#### 为 Okio 添加依赖项 {id="add-dependencies-for-okio"}

<tabs group="build-script">

<tab title="Gradle" group-key="gradle">

```kotlin
// build.gradle(.kts)
dependencies {
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json-okio:%serializationVersion%")
    implementation("com.squareup.okio:okio:%okioVersion%")
}
```

</tab>

<tab title="Maven" group-key="maven">

```xml
<!-- pom.xml -->
<dependencies>
    <dependency>
        <groupId>org.jetbrains.kotlinx</groupId>
        <artifactId>kotlinx-serialization-json-okio</artifactId>
        <version>%serializationVersion%</version>
    </dependency>
    <dependency>
        <groupId>com.squareup.okio</groupId>
        <artifactId>okio</artifactId>
        <version>%okioVersion%</version>
    </dependency>
</dependencies>
```

</tab>
</tabs>

### 将 JSON 序列化到 Sink {id="serialize-json-to-sinks"}

要将 JSON 序列化到 `Sink`，请使用 `.encodeToSink()` 函数：

```kotlin
// 从序列化库导入声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*

// 导入 kotlinx-io 类型与 JSON I/O 支持的声明
import kotlinx.serialization.json.io.*
import kotlinx.io.*
import kotlinx.io.files.*

@Serializable
data class Project(val name: String, val stars: Int)

@OptIn(ExperimentalSerializationApi::class)
fun main() {
    val project = Project("kotlinx.serialization", 9000)

    // 为 project.json 文件创建 Sink
    val path = Path("project.json")
    SystemFileSystem.sink(path).buffered().use { sink: Sink ->

        // 将 Project 实例直接序列化到 Sink 中
        Json.encodeToSink(project, sink)
    }
}
```

### 从 Source 反序列化 JSON {id="deserialize-json-from-sources"}

要从 `Source` 反序列化 JSON，请使用 `.decodeFromSource()` 函数：

```kotlin
// 从序列化库导入声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*

// 导入 kotlinx-io 类型与 JSON I/O 支持的声明
import kotlinx.serialization.json.io.*
import kotlinx.io.*
import kotlinx.io.files.*

@Serializable
data class Project(val name: String, val stars: Int)

@OptIn(ExperimentalSerializationApi::class)
fun main() {
    // 为 project.json 文件打开一个 Source
    val path = Path("project.json")
    SystemFileSystem.source(path).buffered().use { source: Source ->

        // 直接从 Source 反序列化 Project 实例
        val project = Json.decodeFromSource<Project>(source)

        println(project)
    }
}
```

如果你的输入包含大型 JSON 数组或多个顶层 JSON 对象，
你可以使用 `.decodeSourceToSequence()` 函数将 `Source` 转换为延迟解码的 `Sequence<T>`。

```kotlin
// 从序列化库导入声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*

// 导入 kotlinx-io 类型与 JSON I/O 支持的声明
import kotlinx.serialization.json.io.*
import kotlinx.io.*
import kotlinx.io.files.*

@Serializable
data class Project(val name: String, val stars: Int)

@OptIn(ExperimentalSerializationApi::class)
fun main() {
    // 为包含多个 JSON 对象的 projects.json 文件打开一个 Source
    val path = Path("projects.json")
    SystemFileSystem.source(path).buffered().use { source: Source ->

        // 从 Source 读取时延迟反序列化每个 Project
        val projects: Sequence<Project> = Json.decodeSourceToSequence(source)

        for (project in projects) {
            println(project)
        }
    }
}
```

> 由 `.decodeSourceToSequence()` 返回的序列只能遍历一次，因为它们与底层 `Source` 相关联。
> 
> 在序列完全求值之前如果其底层 source 已关闭，访问该序列可能会导致异常。
> 
{style="note"}

## 下一步 {id="what-s-next"}

* 了解如何[自定义 Json 实例](serialization-json-configuration.md)，以应对序列化与反序列化的不同用例。
* 探索[高级 JSON 元素处理](serialization-json-elements.md)，以便在解析或序列化之前操作和处理 JSON 数据。
* 了解如何在[序列化和反序列化期间转换 JSON](serialization-transform-json.md)，以更好地控制数据。