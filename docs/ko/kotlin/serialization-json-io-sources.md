[//]: # (title: I/O 소스로 JSON 직렬화하기)
<primary-label ref="experimental-general"/>

Kotlin 직렬화는 JVM 스트림 및 [`kotlinx-io`](https://github.com/Kotlin/kotlinx-io) 또는 [Okio](https://square.github.io/okio/) 소스(source) 및 싱크(sink)와 함께 작업할 수 있는 API를 제공합니다.

이러한 API를 사용하면 중간 문자열을 생성하지 않고도 I/O 소스로부터 JSON을 직접 직렬화 및 역직렬화할 수 있습니다.
이 API들은 UTF-8 인코딩을 사용하며, 유효하지 않은 JSON 데이터에 대해서는 `SerializationException`을, I/O 실패에 대해서는 `IOException`을 발생시킵니다.

I/O 리소스로 작업할 때는 리소스 누수를 방지하기 위해 이를 올바르게 닫는(close) 것이 중요합니다.
작업이 완료되면 리소스를 자동으로 닫아주는 `.use()` 함수를 사용하여 이를 수행할 수 있습니다.

## JVM 출력 스트림으로 JSON 직렬화하기 {id="serialize-json-to-jvm-output-streams"}

JSON을 JVM [`OutputStream`](https://docs.oracle.com/javase/8/docs/api/java/io/OutputStream.html)으로 직접 직렬화하려면 [`.encodeToStream()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/encode-to-stream.html) 확장 함수를 사용하세요:

```kotlin
// 직렬화 라이브러리에서 선언들을 임포트합니다.
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import java.io.FileOutputStream

@Serializable
data class Project(val name: String, val stars: Int)

fun main() {
    val project = Project("kotlinx.serialization", 9000)
    
    // project.json 파일에 대한 OutputStream을 생성합니다.
    FileOutputStream("project.json").use { output ->
        
        // project 인스턴스를 OutputStream으로 직렬화합니다.
        Json.encodeToStream(project, output)
    }
}
```

이 예제에서는 `Project`의 JSON 표현이 `project.json` 파일로 직렬화됩니다.

## JVM 입력 스트림에서 JSON 역직렬화하기 {id="deserialize-json-from-jvm-input-streams"}

JVM [`InputStream`](https://docs.oracle.com/javase/8/docs/api/java/io/InputStream.html)에서 JSON을 직접 역직렬화하려면 [`.decodeFromStream()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/decode-from-stream.html) 확장 함수를 사용하세요:

```kotlin
// 직렬화 라이브러리에서 선언들을 임포트합니다.
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import java.io.FileInputStream

@Serializable
data class Project(val name: String, val stars: Int)

fun main() {
    // InputStream을 엽니다.
    FileInputStream("project.json").use { input ->

        // InputStream의 JSON 콘텐츠를 Project 인스턴스로 역직렬화합니다.
        val project = Json.decodeFromStream<Project>(input)

        // 역직렬화된 Project 인스턴스를 출력합니다.
        println(project)
    }
}
```

이 예제에서는 입력 스트림의 JSON 콘텐츠가 단일 `Project` 인스턴스로 역직렬화됩니다.

입력에 최상위 JSON 배열 형태 또는 공백으로 구분된 여러 JSON 객체가 포함되어 있는 경우, [`.decodeToSequence()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/decode-to-sequence.html)를 사용하여 요소를 지연(lazy) 처리할 수 있습니다.
이를 통해 파싱되는 각 값을 순차적으로 처리할 수 있습니다. 예를 들면 다음과 같습니다:

```kotlin
// 직렬화 라이브러리에서 선언들을 임포트합니다.
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import java.io.FileInputStream

@Serializable
data class Project(val name: String, val stars: Int)

fun main() {
    // Project 객체의 JSON 배열을 포함하는 projects.json 파일에 대한 InputStream을 엽니다.
    FileInputStream("projects.json").use { input ->

        // InputStream에서 각 Project를 지연 역직렬화합니다.
        val projects = Json.decodeToSequence<Project>(input)

        // 요소들을 하나씩 처리합니다.
        for (project in projects) {
            println(project)
        }
    }
}
```

> `.decodeToSequence()`가 반환한 시퀀스는 기본 스트림에 연결되어 있으므로 한 번만 순회할 수 있습니다.
> 
> 시퀀스가 완전히 평가되기 전에 기본 스트림이 닫히면 시퀀스 접근 시 예외가 발생할 수 있습니다.
> 
{style="note"}

## kotlinx-io 및 Okio를 사용한 JSON 직렬화 {id="json-serialization-with-kotlinx-io-and-okio"}

JVM 스트림 외에도, [`kotlinx-io`](https://github.com/Kotlin/kotlinx-io) 라이브러리(현재 [Alpha](components-stability.md#stability-levels-explained) 단계)의 `kotlinx.io.Sink` 및 `kotlinx.io.Source`, 그리고 [Okio](https://square.github.io/okio/) 라이브러리의 `okio.BufferedSink` 및 `okio.BufferedSource`와 같은 I/O 타입을 사용하여 JSON을 다룰 수 있습니다.

다음 `Json` 확장 함수를 사용하여 이러한 I/O 타입을 통해 JSON을 직접 읽고 쓸 수 있습니다:

* `kotlinx.io.Sink` 또는 `okio.BufferedSink`에 JSON을 쓰기 위한 [`.encodeToSink()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json-io/kotlinx.serialization.json.io/encode-to-sink.html) 및 [`.encodeToBufferedSink()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json-okio/kotlinx.serialization.json.okio/encode-to-buffered-sink.html).
* `kotlinx.io.Source` 또는 `okio.BufferedSource`에서 단일 JSON 값을 읽기 위한 [`.decodeFromSource()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json-io/kotlinx.serialization.json.io/decode-from-source.html) 및 [`.decodeFromBufferedSource()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json-okio/kotlinx.serialization.json.okio/decode-from-buffered-source.html).
* 여러 JSON 값을 `Sequence<T>`로 지연 디코딩하기 위한 [`.decodeSourceToSequence()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json-io/kotlinx.serialization.json.io/decode-source-to-sequence.html) 및 [`.decodeBufferedSourceToSequence()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json-okio/kotlinx.serialization.json.okio/decode-buffered-source-to-sequence.html).

다음 섹션에서는 이러한 API와 함께 `kotlinx-io` 타입을 사용하는 예제를 다룹니다.  
Okio 타입도 해당하는 `okio.BufferedSink` 및 `okio.BufferedSource` API를 사용하여 유사하게 활용할 수 있습니다.

### kotlinx-io 및 Okio 의존성 추가하기 {id="add-dependencies-for-kotlinx-io-and-okio"}

`kotlinx-io` 또는 Okio 타입과 함께 확장 함수를 사용하려면 해당 의존성을 추가하세요:

#### `kotlinx-io` 의존성 추가하기 {id="add-dependencies-for-kotlinx-io"}

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

#### Okio 의존성 추가하기 {id="add-dependencies-for-okio"}

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

### Sink로 JSON 직렬화하기 {id="serialize-json-to-sinks"}

`Sink`로 JSON을 직렬화하려면 `.encodeToSink()` 함수를 사용하세요:

```kotlin
// 직렬화 라이브러리에서 선언들을 임포트합니다.
import kotlinx.serialization.*
import kotlinx.serialization.json.*

// kotlinx-io 타입 및 JSON I/O 지원을 위한 선언들을 임포트합니다.
import kotlinx.serialization.json.io.*
import kotlinx.io.*
import kotlinx.io.files.*

@Serializable
data class Project(val name: String, val stars: Int)

@OptIn(ExperimentalSerializationApi::class)
fun main() {
    val project = Project("kotlinx.serialization", 9000)

    // project.json 파일에 대한 Sink를 생성합니다.
    val path = Path("project.json")
    SystemFileSystem.sink(path).buffered().use { sink: Sink ->

        // Project 인스턴스를 Sink로 직접 직렬화합니다.
        Json.encodeToSink(project, sink)
    }
}
```

### Source에서 JSON 역직렬화하기 {id="deserialize-json-from-sources"}

`Source`에서 JSON을 역직렬화하려면 `.decodeFromSource()` 함수를 사용하세요:

```kotlin
// 직렬화 라이브러리에서 선언들을 임포트합니다.
import kotlinx.serialization.*
import kotlinx.serialization.json.*

// kotlinx-io 타입 및 JSON I/O 지원을 위한 선언들을 임포트합니다.
import kotlinx.serialization.json.io.*
import kotlinx.io.*
import kotlinx.io.files.*

@Serializable
data class Project(val name: String, val stars: Int)

@OptIn(ExperimentalSerializationApi::class)
fun main() {
    // project.json 파일에 대한 Source를 엽니다.
    val path = Path("project.json")
    SystemFileSystem.source(path).buffered().use { source: Source ->

        // Source에서 Project 인스턴스를 직접 역직렬화합니다.
        val project = Json.decodeFromSource<Project>(source)

        println(project)
    }
}
```

입력에 대규모 JSON 배열이나 여러 개의 최상위 JSON 객체가 포함되어 있는 경우,
`.decodeSourceToSequence()` 함수를 사용하여 `Source`를 지연 디코딩되는 `Sequence<T>`로 변환할 수 있습니다.

```kotlin
// 직렬화 라이브러리에서 선언들을 임포트합니다.
import kotlinx.serialization.*
import kotlinx.serialization.json.*

// kotlinx-io 타입 및 JSON I/O 지원을 위한 선언들을 임포트합니다.
import kotlinx.serialization.json.io.*
import kotlinx.io.*
import kotlinx.io.files.*

@Serializable
data class Project(val name: String, val stars: Int)

@OptIn(ExperimentalSerializationApi::class)
fun main() {
    // 여러 JSON 객체를 포함하는 projects.json 파일에 대한 Source를 엽니다.
    val path = Path("projects.json")
    SystemFileSystem.source(path).buffered().use { source: Source ->

        // Source에서 읽어오면서 각 Project를 지연 역직렬화합니다.
        val projects: Sequence<Project> = Json.decodeSourceToSequence(source)

        for (project in projects) {
            println(project)
        }
    }
}
```

> `.decodeSourceToSequence()`가 반환한 시퀀스는 기본 `Source`에 연결되어 있으므로 한 번만 순회할 수 있습니다.
> 
> 시퀀스가 완전히 평가되기 전에 기본 소스가 닫히면 시퀀스 접근 시 예외가 발생할 수 있습니다.
> 
{style="note"}

## 다음 단계 {id="what-s-next"}

* 다양한 직렬화 및 역직렬화 사용 사례에 대응하기 위해 [Json 인스턴스를 커스터마이즈하는 방법](serialization-json-configuration.md)을 알아보세요.
* JSON 데이터가 파싱되거나 직렬화되기 전에 이를 조작하고 작업하는 [고급 JSON 요소 처리 방법](serialization-json-elements.md)을 살펴보세요.
* 데이터를 보다 유연하게 제어하기 위해 [직렬화 및 역직렬화 중에 JSON을 변환하는 방법](serialization-transform-json.md)을 알아보세요.