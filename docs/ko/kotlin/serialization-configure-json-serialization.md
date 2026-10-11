[//]: # (title: JSON 직렬화 개요)

Kotlin 직렬화(serialization)를 사용하면 Kotlin 객체를 JSON으로 쉽게 변환하거나 그 반대로 변환할 수 있습니다.
[`Json`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json/) 클래스는 이를 위한 핵심 도구이며, JSON이 생성되고 파싱되는 방식에 유연성을 제공합니다.
특정 JSON 동작을 처리하도록 `Json` 인스턴스를 구성하거나, 기본적인 작업을 위해 기본(default) 인스턴스를 사용할 수 있습니다.

`Json` 클래스를 사용하면 다음 작업을 수행할 수 있습니다.

* [`encodeToString()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json/encode-to-string.html) 함수를 사용하여 Kotlin 객체를 JSON 문자열로 직렬화합니다.
* [`decodeFromString()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json/decode-from-string.html) 함수를 사용하여 JSON 문자열을 다시 Kotlin 객체로 역직렬화합니다.
* 복잡한 JSON 구조를 다룰 때 [`encodeToJsonElement()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/encode-to-json-element.html) 및 [`decodeFromJsonElement()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/decode-from-json-element.html) 함수를 사용하여 [`JsonElement`를 직접 다룹니다](serialization-json-elements.md).
* [실험적(Experimental)](components-stability.md#stability-levels-explained) 확장 함수를 사용하여 JVM 스트림뿐만 아니라 [`kotlinx-io`](https://github.com/Kotlin/kotlinx-io) 및 [Okio](https://square.github.io/okio/) 타입을 포함한 [I/O 소스를 중간 문자열 생성 없이 직렬화 및 역직렬화](serialization-json-io-sources.md)합니다.

시작하기 전에 직렬화 라이브러리에서 다음 선언들을 임포트합니다.

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.json.*
```

다음은 기본 `Json` 인스턴스를 사용하여 Kotlin에서 JSON 직렬화가 어떻게 작동하는지 보여주는 간단한 예제입니다.

```kotlin
// 직렬화 라이브러리의 선언들을 임포트합니다
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
data class User(val name: String, val age: Int)

fun main() {
    // 기본 Json 인스턴스를 사용합니다
    val json = Json

    // User 객체를 생성합니다
    val user = User("Alice", 30)

    // User 객체를 JSON 문자열로 변환합니다
    val jsonString = json.encodeToString(user)
    println(jsonString)
    // {"name":"Alice","age":30}

    // JSON 문자열을 다시 User 객체로 변환합니다
    val deserializedUser = json.decodeFromString<User>(jsonString)
    println(deserializedUser)
    // User(name=Alice, age=30)
}
//sampleEnd
```
{kotlin-runnable="true" id="first-json-example"}

기본 구성을 사용하는 것 외에도, 알 수 없는 키를 무시하는 등 특정 사용 사례에 맞게 [`Json` 인스턴스를 커스터마이징](serialization-json-configuration.md)할 수 있습니다.

```kotlin
// 직렬화 라이브러리의 선언들을 임포트합니다
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
data class Project(val name: String)

// 알 수 없는 키를 무시하도록 Json 인스턴스를 구성합니다
val customJson = Json {
    ignoreUnknownKeys = true
}

fun main() {
    val data = customJson.decodeFromString<Project>("""
        {"name":"kotlinx.serialization","language":"Kotlin"}
    """)
    println(data)
    // Project(name=kotlinx.serialization)
}
//sampleEnd
```
{kotlin-runnable="true" id="first-json-instance-example"}

## 다음 단계 {id="what-s-next"}

* 다양한 직렬화 및 역직렬화 사용 사례를 처리하기 위해 [`Json` 인스턴스를 커스터마이징하는 방법](serialization-json-configuration.md)을 알아보세요.
* JSON 데이터가 파싱되거나 직렬화되기 전에 이를 조작하고 다룰 수 있는 [고급 JSON 요소 처리](serialization-json-elements.md)에 대해 살펴보세요.
* 데이터를 더 세밀하게 제어하기 위해 [직렬화 및 역직렬화 중에 JSON을 변환하는 방법](serialization-transform-json.md)을 알아보세요.