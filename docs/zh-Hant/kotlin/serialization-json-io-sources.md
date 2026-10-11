[//]: # (title: 使用 I/O 來源序列化 JSON)
<primary-label ref="experimental-general"/>

Kotlin serialization 提供了可用於 JVM 串流以及 [`kotlinx-io`](https://github.com/Kotlin/kotlinx-io) 或 [Okio](https://square.github.io/okio/) sources 與 sinks 的 API。

你可以使用這些 API 直接從 I/O 來源序列化與反序列化 JSON，而無需建立中介字串。
這些 API 使用 UTF-8 編碼，並會在遇到無效的 JSON 資料時擲出 `SerializationException`，在遇到 I/O 失敗時擲出 `IOException`。

處理 I/O 資源時，正確關閉它們以防止資源洩漏非常重要。
你可以透過 `.use()` 函式來達成此目的，該函式會在操作完成時自動關閉資源。

## 將 JSON 序列化至 JVM 輸出串流 {id="serialize-json-to-jvm-output-streams"}

使用 [`.encodeToStream()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/encode-to-stream.html) 擴充函式直接將 JSON 序列化至 JVM [`OutputStream`](https://docs.oracle.com/javase/8/docs/api/java/io/OutputStream.html)：

```kotlin
// 從序列化程式庫匯入宣告
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import java.io.FileOutputStream

@Serializable
data class Project(val name: String, val stars: Int)

fun main() {
    val project = Project("kotlinx.serialization", 9000)
    
    // 為 project.json 檔案建立一個 OutputStream
    FileOutputStream("project.json").use { output ->
        
        // 將 project 執行個體序列化至 OutputStream 中
        Json.encodeToStream(project, output)
    }
}
```

在此範例中，`Project` 的 JSON 表示形式會被序列化至 `project.json` 檔案中。

## 從 JVM 輸入串流反序列化 JSON {id="deserialize-json-from-jvm-input-streams"}

若要直接從 JVM [`InputStream`](https://docs.oracle.com/javase/8/docs/api/java/io/InputStream.html) 反序列化 JSON，請使用 [`.decodeFromStream()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/decode-from-stream.html) 擴充函式：

```kotlin
// 從序列化程式庫匯入宣告
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import java.io.FileInputStream

@Serializable
data class Project(val name: String, val stars: Int)

fun main() {
    // 開啟一個 InputStream
    FileInputStream("project.json").use { input ->

        // 將 InputStream 的 JSON 內容反序列化為 Project 執行個體
        val project = Json.decodeFromStream<Project>(input)

        // 印出反序列化後的 Project 執行個體
        println(project)
    }
}
```

在此範例中，輸入串流的 JSON 內容會被反序列化為單一 `Project` 執行個體。

如果你的輸入在頂層 JSON 陣列中包含多個 JSON 物件，或是以空白字元分隔的多個物件，你可以使用 [`.decodeToSequence()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/decode-to-sequence.html) 來延遲載入並處理這些元素。
這讓你可以隨剖析隨處理每個值，例如：

```kotlin
// 從序列化程式庫匯入宣告
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import java.io.FileInputStream

@Serializable
data class Project(val name: String, val stars: Int)

fun main() {
    // 為包含 Project 物件之 JSON 陣列的 projects.json 檔案開啟一個 InputStream
    FileInputStream("projects.json").use { input ->

        // 從 InputStream 延遲反序列化每個 Project
        val projects = Json.decodeToSequence<Project>(input)

        // 逐一處理元素
        for (project in projects) {
            println(project)
        }
    }
}
```

> 你只能遍歷由 `.decodeToSequence()` 回傳的序列一次，
> 因為它們與底層串流繫結在一起。
> 
> 如果底層串流在序列完全求值之前關閉，存取該序列可能會導致例外狀況。
> 
{style="note"}

## 使用 kotlinx-io 與 Okio 進行 JSON 序列化 {id="json-serialization-with-kotlinx-io-and-okio"}

除了 JVM 串流之外，你還可以使用 I/O 型別來處理 JSON，例如來自 [`kotlinx-io`](https://github.com/Kotlin/kotlinx-io) 程式庫（目前處於 [Alpha](components-stability.md#stability-levels-explained) 階段）的 `kotlinx.io.Sink` 與 `kotlinx.io.Source`，以及來自 [Okio](https://square.github.io/okio/) 程式庫的 `okio.BufferedSink`
和 `okio.BufferedSource`。

你可以使用以下 `Json` 擴充函式，直接透過這些 I/O 型別讀取與寫入 JSON：

* [`.encodeToSink()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json-io/kotlinx.serialization.json.io/encode-to-sink.html) 與 [`.encodeToBufferedSink()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json-okio/kotlinx.serialization.json.okio/encode-to-buffered-sink.html)：將 JSON 寫入 `kotlinx.io.Sink` 或 `okio.BufferedSink`。
* [`.decodeFromSource()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json-io/kotlinx.serialization.json.io/decode-from-source.html) 與 [`.decodeFromBufferedSource()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json-okio/kotlinx.serialization.json.okio/decode-from-buffered-source.html)：從 `kotlinx.io.Source` 或 `okio.BufferedSource` 讀取單一 JSON 值。
* [`.decodeSourceToSequence()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json-io/kotlinx.serialization.json.io/decode-source-to-sequence.html) 與 [`.decodeBufferedSourceToSequence()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json-okio/kotlinx.serialization.json.okio/decode-buffered-source-to-sequence.html)：延遲解碼多個 JSON 值為 `Sequence<T>`。

接下來的各節將介紹結合這些 API 使用 `kotlinx-io` 型別的範例。  
你也可以使用對應的 `okio.BufferedSink` 與 `okio.BufferedSource` API，以類似的方式使用 Okio 型別。

### 新增 kotlinx-io 與 Okio 的相依性 {id="add-dependencies-for-kotlinx-io-and-okio"}

若要搭配 `kotlinx-io` 或 Okio 型別使用擴充函式，請新增相應的相依性：

#### 新增 `kotlinx-io` 的相依性 {id="add-dependencies-for-kotlinx-io"}

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

#### 新增 Okio 的相依性 {id="add-dependencies-for-okio"}

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

### 將 JSON 序列化至 Sink {id="serialize-json-to-sinks"}

若要將 JSON 序列化至 `Sink`，請使用 `.encodeToSink()` 函式：

```kotlin
// 從序列化程式庫匯入宣告
import kotlinx.serialization.*
import kotlinx.serialization.json.*

// 匯入 kotlinx-io 型別與 JSON I/O 支援的宣告
import kotlinx.serialization.json.io.*
import kotlinx.io.*
import kotlinx.io.files.*

@Serializable
data class Project(val name: String, val stars: Int)

@OptIn(ExperimentalSerializationApi::class)
fun main() {
    val project = Project("kotlinx.serialization", 9000)

    // 為 project.json 檔案建立一個 Sink
    val path = Path("project.json")
    SystemFileSystem.sink(path).buffered().use { sink: Sink ->

        // 直接將 Project 執行個體序列化至 Sink
        Json.encodeToSink(project, sink)
    }
}
```

### 從 Source 反序列化 JSON {id="deserialize-json-from-sources"}

若要從 `Source` 反序列化 JSON，請使用 `.decodeFromSource()` 函式：

```kotlin
// 從序列化程式庫匯入宣告
import kotlinx.serialization.*
import kotlinx.serialization.json.*

// 匯入 kotlinx-io 型別與 JSON I/O 支援的宣告
import kotlinx.serialization.json.io.*
import kotlinx.io.*
import kotlinx.io.files.*

@Serializable
data class Project(val name: String, val stars: Int)

@OptIn(ExperimentalSerializationApi::class)
fun main() {
    // 為 project.json 檔案開啟一個 Source
    val path = Path("project.json")
    SystemFileSystem.source(path).buffered().use { source: Source ->

        // 直接從 Source 反序列化 Project 執行個體
        val project = Json.decodeFromSource<Project>(source)

        println(project)
    }
}
```

如果你的輸入包含大型 JSON 陣列或多個頂層 JSON 物件，
你可以透過 `.decodeSourceToSequence()` 函式將 `Source` 轉為延遲解碼的 `Sequence<T>`。

```kotlin
// 從序列化程式庫匯入宣告
import kotlinx.serialization.*
import kotlinx.serialization.json.*

// 匯入 kotlinx-io 型別與 JSON I/O 支援的宣告
import kotlinx.serialization.json.io.*
import kotlinx.io.*
import kotlinx.io.files.*

@Serializable
data class Project(val name: String, val stars: Int)

@OptIn(ExperimentalSerializationApi::class)
fun main() {
    // 為包含多個 JSON 物件的 projects.json 檔案開啟一個 Source
    val path = Path("projects.json")
    SystemFileSystem.source(path).buffered().use { source: Source ->

        // 從 Source 讀取時延遲反序列化每個 Project
        val projects: Sequence<Project> = Json.decodeSourceToSequence(source)

        for (project in projects) {
            println(project)
        }
    }
}
```

> 你只能遍歷由 `.decodeSourceToSequence()` 回傳的序列一次，
> 因為它們與底層 `Source` 繫結在一起。
> 
> 如果底層來源在序列完全求值之前關閉，存取該序列可能會導致例外狀況。
> 
{style="note"}

## 後續步驟 {id="what-s-next"}

* 了解如何[自訂 Json 執行個體](serialization-json-configuration.md)以滿足序列化與反序列化的不同使用案例。
* 探索[進階 JSON 元素處理](serialization-json-elements.md)，以便在剖析或序列化之前操作與處理 JSON 資料。
* 了解如何在[序列化與反序列化期間轉換 JSON](serialization-transform-json.md)，從而更好地掌控你的資料。