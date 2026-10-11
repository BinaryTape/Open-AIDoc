[//]: # (title: I/O ソースを用いた JSON のシリアライズ)
<primary-label ref="experimental-general"/>

Kotlin シリアライゼーションは、JVM ストリームや [`kotlinx-io`](https://github.com/Kotlin/kotlinx-io)、[Okio](https://square.github.io/okio/) の Source および Sink を操作するための API を提供しています。

これら API を使用することで、中間文字列を作成することなく、I/O ソースから直接 JSON のシリアライズおよびデシリアライズを行えます。
これらの API は UTF-8 エンコーディングを使用し、無効な JSON データに対しては `SerializationException` を、I/O 障害に対しては `IOException` をスローします。

I/O リソースを扱う際には、リソースリークを防ぐために適切にクローズすることが重要です。
操作が完了したときにリソースを自動的にクローズする `.use()` 関数を使用することで、これを行うことができます。

## JVM 出力ストリームへの JSON のシリアライズ {id="serialize-json-to-jvm-output-streams"}

JSON を JVM の [`OutputStream`](https://docs.oracle.com/javase/8/docs/api/java/io/OutputStream.html) へ直接シリアライズするには、[`.encodeToStream()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/encode-to-stream.html) 拡張関数を使用します。

```kotlin
// シリアライゼーションライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import java.io.FileOutputStream

@Serializable
data class Project(val name: String, val stars: Int)

fun main() {
    val project = Project("kotlinx.serialization", 9000)
    
    // project.json ファイルの OutputStream を作成
    FileOutputStream("project.json").use { output ->
        
        // project インスタンスを OutputStream にシリアライズ
        Json.encodeToStream(project, output)
    }
}
```

この例では、`Project` の JSON 表現が `project.json` ファイルにシリアライズされます。

## JVM 入力ストリームからの JSON のデシリアライズ {id="deserialize-json-from-jvm-input-streams"}

JVM の [`InputStream`](https://docs.oracle.com/javase/8/docs/api/java/io/InputStream.html) から直接 JSON をデシリアライズするには、[`.decodeFromStream()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/decode-to-stream.html) 拡張関数を使用します。

```kotlin
// シリアライゼーションライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import java.io.FileInputStream

@Serializable
data class Project(val name: String, val stars: Int)

fun main() {
    // InputStream をオープン
    FileInputStream("project.json").use { input ->

        // InputStream の JSON コンテンツを Project インスタンスにデシリアライズ
        val project = Json.decodeFromStream<Project>(input)

        // デシリアライズされた Project インスタンスを出力
        println(project)
    }
}
```

この例では、入力ストリームの JSON コンテンツが単一の `Project` インスタンスにデシリアライズされます。

入力にトップレベルの JSON 配列内の複数の JSON オブジェクト、または空白で区切られた複数のオブジェクトが含まれている場合、[`.decodeToSequence()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/decode-to-sequence.html) を使用して要素を遅延処理（lazy processing）できます。
これにより、パースされた値を順次処理できるようになります。例えば以下のようになります。

```kotlin
// シリアライゼーションライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import java.io.FileInputStream

@Serializable
data class Project(val name: String, val stars: Int)

fun main() {
    // Project オブジェクトの JSON 配列を含む projects.json ファイルの InputStream をオープン
    FileInputStream("projects.json").use { input ->

        // InputStream から各 Project を遅延デシリアライズ
        val projects = Json.decodeToSequence<Project>(input)

        // 要素を 1 つずつ処理
        for (project in projects) {
            println(project)
        }
    }
}
```

> `.decodeToSequence()` によって返されるシーケンスは、基となるストリームに結びついているため、一度しか反復処理（イテレート）できません。
> 
> シーケンスが完全に評価される前にその基となるストリームがクローズされた場合、シーケンスへのアクセス時に例外が発生することがあります。
> 
{style="note"}

## kotlinx-io および Okio による JSON シリアライゼーション {id="json-serialization-with-kotlinx-io-and-okio"}

JVM ストリームに加えて、[`kotlinx-io`](https://github.com/Kotlin/kotlinx-io) ライブラリ（現在は [Alpha](components-stability.md#stability-levels-explained) 段階）の `kotlinx.io.Sink` や `kotlinx.io.Source`、および [Okio](https://square.github.io/okio/) ライブラリの `okio.BufferedSink` や `okio.BufferedSource` などの I/O 型を使用して JSON を扱うこともできます。

これらの I/O 型を通じて JSON を直接読み書きするために、以下の `Json` 拡張関数を使用できます。

* `kotlinx.io.Sink` または `okio.BufferedSink` に JSON を書き込むための [`.encodeToSink()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json-io/kotlinx.serialization.json.io/encode-to-sink.html) および [`.encodeToBufferedSink()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json-okio/kotlinx.serialization.json.okio/encode-to-buffered-sink.html)。
* `kotlinx.io.Source` または `okio.BufferedSource` から単一の JSON 値を読み取るための [`.decodeFromSource()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json-io/kotlinx.serialization.json.io/decode-from-source.html) および [`.decodeFromBufferedSource()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json-okio/kotlinx.serialization.json.okio/decode-from-buffered-source.html)。
* 複数の JSON 値を `Sequence<T>` として遅延デコードするための [`.decodeSourceToSequence()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json-io/kotlinx.serialization.json.io/decode-source-to-sequence.html) および [`.decodeBufferedSourceToSequence()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json-okio/kotlinx.serialization.json.okio/decode-buffered-source-to-sequence.html)。

次のセクションでは、これらの API で `kotlinx-io` 型を使用する例を取り上げます。  
Okio の型も同様に、対応する `okio.BufferedSink` および `okio.BufferedSource` API と組み合わせて使用できます。

### kotlinx-io および Okio の依存関係の追加 {id="add-dependencies-for-kotlinx-io-and-okio"}

`kotlinx-io` または Okio の型で拡張関数を使用するには、対応する依存関係を追加します。

#### `kotlinx-io` の依存関係の追加 {id="add-dependencies-for-kotlinx-io"}

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

#### Okio の依存関係の追加 {id="add-dependencies-for-okio"}

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

### Sink への JSON のシリアライズ {id="serialize-json-to-sinks"}

`Sink` に JSON をシリアライズするには、`.encodeToSink()` 関数を使用します。

```kotlin
// シリアライゼーションライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*

// kotlinx-io の型および JSON I/O サポートの宣言をインポート
import kotlinx.serialization.json.io.*
import kotlinx.io.*
import kotlinx.io.files.*

@Serializable
data class Project(val name: String, val stars: Int)

@OptIn(ExperimentalSerializationApi::class)
fun main() {
    val project = Project("kotlinx.serialization", 9000)

    // project.json ファイルの Sink を作成
    val path = Path("project.json")
    SystemFileSystem.sink(path).buffered().use { sink: Sink ->

        // Project インスタンスを直接 Sink にシリアライズ
        Json.encodeToSink(project, sink)
    }
}
```

### Source からの JSON のデシリアライズ {id="deserialize-json-from-sources"}

`Source` から JSON をデシリアライズするには、`.decodeFromSource()` 関数を使用します。

```kotlin
// シリアライゼーションライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*

// kotlinx-io の型および JSON I/O サポートの宣言をインポート
import kotlinx.serialization.json.io.*
import kotlinx.io.*
import kotlinx.io.files.*

@Serializable
data class Project(val name: String, val stars: Int)

@OptIn(ExperimentalSerializationApi::class)
fun main() {
    // project.json ファイルの Source をオープン
    val path = Path("project.json")
    SystemFileSystem.source(path).buffered().use { source: Source ->

        // Source から直接 Project インスタンスにデシリアライズ
        val project = Json.decodeFromSource<Project>(source)

        println(project)
    }
}
```

入力に大きな JSON 配列や複数のトップレベル JSON オブジェクトが含まれている場合、`.decodeSourceToSequence()` 関数を使用することで、`Source` を遅延デコードされる `Sequence<T>` に変換できます。

```kotlin
// シリアライゼーションライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*

// kotlinx-io の型および JSON I/O サポートの宣言をインポート
import kotlinx.serialization.json.io.*
import kotlinx.io.*
import kotlinx.io.files.*

@Serializable
data class Project(val name: String, val stars: Int)

@OptIn(ExperimentalSerializationApi::class)
fun main() {
    // 複数の JSON オブジェクトを含む projects.json ファイルの Source をオープン
    val path = Path("projects.json")
    SystemFileSystem.source(path).buffered().use { source: Source ->

        // Source から読み込まれる各 Project を遅延デシリアライズ
        val projects: Sequence<Project> = Json.decodeSourceToSequence(source)

        for (project in projects) {
            println(project)
        }
    }
}
```

> `.decodeSourceToSequence()` によって返されるシーケンスは、基となる `Source` に結びついているため、一度しか反復処理（イテレート）できません。
> 
> シーケンスが完全に評価される前にその基となるソースがクローズされた場合、シーケンスへのアクセス時に例外が発生することがあります。
> 
{style="note"}

## 次のステップ {id="what-s-next"}

* シリアライズおよびデシリアライズのさまざまなユースケースに対応するために、[Json インスタンスをカスタマイズする方法](serialization-json-configuration.md)を学びます。
* パースやシリアライズを行う前に JSON データを操作・処理するための、[高度な JSON 要素の取り扱い](serialization-json-elements.md)について確認します。
* データをより柔軟に制御するために、[シリアライズおよびデシリアライズ中に JSON を変換する方法](serialization-transform-json.md)を確認します。