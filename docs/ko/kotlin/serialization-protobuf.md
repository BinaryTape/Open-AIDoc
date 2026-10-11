[//]: # (title: ProtoBuf 포맷)
<primary-label ref="experimental-general"/>

[Protocol Buffers](https://developers.google.com/protocol-buffers)(ProtoBuf)는 프로토콜 스키마를 정의하기 위해 일반적으로 별도의 [`.proto` 파일](#generate-a-protobuf-schema)을 사용하는 언어 중립적인 바이너리 포맷입니다.
이 포맷은 필드에 이름 대신 정수 번호를 할당하므로 CBOR보다 더 콤팩트합니다.

Kotlin serialization은 모든 필드가 명시적으로 필수(required) 또는 선택(optional)인 [proto2 시맨틱](https://protobuf.dev/programming-guides/proto2/)을 따릅니다.

## ProtoBuf 의존성 추가 {id="add-dependencies-for-protobuf"}

프로젝트에서 ProtoBuf를 사용하려면 빌드 파일에 ProtoBuf 직렬화 라이브러리 의존성을 추가하세요.

<tabs group="build-script">
<tab title="Gradle" group-key="gradle">

```kotlin
// build.gradle(.kts)
dependencies {
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-protobuf:%serializationVersion%")
}
```

</tab>

<tab title="Maven" group-key="maven">

```xml
<!-- pom.xml -->

<dependencies>
    <dependency>
        <groupId>org.jetbrains.kotlinx</groupId>
        <artifactId>kotlinx-serialization-protobuf</artifactId>
        <version>%serializationVersion%</version>
    </dependency>
</dependencies>
```

</tab>
</tabs>

## 바이너리 직렬화에 ProtoBuf 사용 {id="use-protobuf-for-binary-serialization"}

ProtoBuf로 객체를 직렬화하려면 [`ProtoBuf`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf/-proto-buf/) 클래스와 [`.encodeToByteArray()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf/-proto-buf/encode-to-byte-array.html) 및 [`.decodeFromByteArray()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf/-proto-buf/decode-from-byte-array.html) 함수를 사용합니다.

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.protobuf.*

fun ByteArray.toAsciiHexString() = joinToString("") {
    if (it in 32..127) it.toInt().toChar().toString() else
        "{${it.toUByte().toString(16).padStart(2, '0').uppercase()}}"
}

@Serializable
data class Project(val name: String, val language: String)

@OptIn(ExperimentalSerializationApi::class)
fun main() {
    val data = Project("kotlinx.serialization", "Kotlin")
    // Project 인스턴스를 ProtoBuf 바이트 배열로 직렬화합니다.
    val bytes = ProtoBuf.encodeToByteArray(data)

    // 바이트 배열을 읽기 쉬운 혼합 형태로 출력합니다.
    println(bytes.toAsciiHexString())
    // {0A}{15}kotlinx.serialization{12}{06}Kotlin

    // ProtoBuf 바이트 배열을 다시 객체로 역직렬화합니다.
    val obj = ProtoBuf.decodeFromByteArray<Project>(bytes)
    println(obj)
    // Project(name=kotlinx.serialization, language=Kotlin)
}
```

이 예제에서는 문자열 값을 읽을 수 있는 텍스트로 출력하고, 나머지 바이트는 16진수 형태로 출력합니다.
동일한 바이트가 [ProtoBuf 16진수 표기법(hex notation)](https://protogen.marcgravell.com/decode)에서 다음 값에 해당합니다.

```text
Field #1: 0A String Length = 21, Hex = 15, UTF8 = "kotlinx.serialization"
Field #2: 12 String Length = 6, Hex = 06, UTF8 = "Kotlin"
```

## ProtoBuf 직렬화를 위한 필드 번호 할당 {id="assign-field-numbers-for-protobuf-serialization"}

기본적으로 ProtoBuf는 필드 번호를 자동으로 할당합니다.

시간이 지나도 스키마의 안정성을 유지하려면 별도의 `.proto` 파일 없이도 [`@ProtoNumber`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf/-proto-number/) 어노테이션을 사용하여 필드 번호를 명시적으로 할당할 수 있습니다.
예를 들어 `@ProtoNumber(1)`은 프로퍼티에 필드 번호 1을 할당하므로, Kotlin serialization의 ProtoBuf 포맷은 번호를 자동으로 할당하는 대신 인코딩 및 디코딩 중에 해당 번호를 사용합니다.

프로퍼티 순서를 변경할 계획이라면 필드 번호를 명시적으로 할당하여 스키마의 안정성을 유지하고 스키마 진화에 대한 Protobuf 호환성 규칙을 준수할 수 있습니다.

예제는 다음과 같습니다.

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.protobuf.*

@OptIn(ExperimentalSerializationApi::class)
@Serializable
data class Project(
    // name 프로퍼티에 필드 번호 1을 할당합니다.
    @ProtoNumber(1)
    val name: String,

    // language 프로퍼티에 필드 번호 3을 할당합니다.
    @ProtoNumber(3)
    val language: String
)

@OptIn(ExperimentalSerializationApi::class)
fun main() {
    val data = Project("kotlinx.serialization", "Kotlin") 
    val bytes = ProtoBuf.encodeToByteArray(data)   

    println(bytes.toAsciiHexString())
    // {0A}{15}kotlinx.serialization{1A}{06}Kotlin

    val obj = ProtoBuf.decodeFromByteArray<Project>(bytes)

    println(obj)
    // Project(name=kotlinx.serialization, language=Kotlin)
}
```

이 예제에서 `name` 프로퍼티는 필드 번호 1을 사용하며 인코딩된 태그는 `0A`입니다.
`language` 프로퍼티는 필드 번호 3을 사용하며 인코딩된 태그는 `1A`입니다.

ProtoBuf 16진수 표기법에서 출력은 다음과 같습니다.

```text
Field #1: 0A String Length = 21, Hex = 15, UTF8 = "kotlinx.serialization" (total 21 chars)
Field #3: 1A String Length = 6, Hex = 06, UTF8 = "Kotlin"
```

> Protobuf 필드 번호에 대한 자세한 내용은 [공식 Protobuf 언어 가이드](https://protobuf.dev/programming-guides/proto2/#assigning)를 참조하세요.
>
{style="tip"}

## ProtoBuf에서 정수 인코딩 지정 {id="specify-integer-encoding-in-protobuf"}

ProtoBuf는 기본적으로 [varint 인코딩](https://protobuf.dev/programming-guides/encoding/#varints)을 사용하여 정수 프로퍼티를 인코딩합니다.

프로퍼티에 다른 정수 인코딩을 사용하려면 [`ProtoIntegerType`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf/-proto-integer-type/) 값과 함께 [`@ProtoType`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf/-proto-type/) 어노테이션을 적용합니다.
이 어노테이션은 `Byte`, `Short`, `Int`, `Long`, `Char` 프로퍼티에 적용됩니다.

`ProtoIntegerType` 열거형은 세 가지 옵션을 지원합니다.

* [`DEFAULT`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf/-proto-integer-type/-d-e-f-a-u-l-t/) 옵션은 작은 음이 아닌 수에 최적화된 varint 인코딩(`intXX`)을 사용합니다. 예를 들어 `1` 값은 1바이트인 `01`로 인코딩됩니다.
* [`SIGNED`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf/-proto-integer-type/-s-i-g-n-e-d/) 옵션은 부호 있는 ZigZag 인코딩(`sintXX`)을 사용하므로 작은 부호 있는 정수에 적합합니다. 예를 들어 `-2` 값은 1바이트인 `03`으로 인코딩됩니다.
* [`FIXED`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf/-proto-integer-type/-f-i-x-e-d/) 옵션은 항상 고정된 수의 바이트를 사용하는 고정 폭 인코딩(`fixedXX`)을 사용합니다. 예를 들어 `3` 값은 4바이트인 `03 00 00 00`으로 인코딩됩니다.

> `uintXX` 및 `sfixedXX` Protocol Buffer 타입은 지원되지 않습니다.
>
{style="note"}

다음 예제는 지원되는 세 가지 옵션을 모두 보여줍니다.

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.protobuf.*

@OptIn(ExperimentalSerializationApi::class)
@Serializable
class Data(
    // 작은 음이 아닌 수에 최적화된 DEFAULT 인코딩을 사용합니다.
    @ProtoType(ProtoIntegerType.DEFAULT)
    val a: Int,

    // 작은 부호 있는 정수에 최적화된 SIGNED 인코딩을 사용합니다.
    @ProtoType(ProtoIntegerType.SIGNED)
    val b: Int,

    // 항상 고정된 바이트 수를 사용하는 FIXED 인코딩을 사용합니다.
    @ProtoType(ProtoIntegerType.FIXED)
    val c: Int
)

@OptIn(ExperimentalSerializationApi::class)
fun main() {
    val data = Data(1, -2, 3) 
    println(ProtoBuf.encodeToByteArray(data).toAsciiHexString())
    // {08}{01}{10}{03}{1D}{03}{00}{00}{00}
}
```

## 숫자 컬렉션을 packed 필드로 인코딩 {id="encode-numeric-collections-as-packed-fields"}

ProtoBuf에서 packed 필드는 모든 요소마다 필드 태그를 반복하는 대신 리스트를 단일 길이 구분(length-delimited) 엔트리로 작성하여 반복되는 기본형(primitive) 숫자 값을 더욱 효율적으로 저장합니다.

[`@ProtoPacked`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf/-proto-packed/) 어노테이션을 사용하여 맵을 제외한 컬렉션 타입을 이러한 형태로 직렬화할 수 있습니다.
Packed 인코딩은 반복되는 기본형 숫자 필드에만 적용되며, 다른 요소 타입에서는 이 어노테이션이 무시됩니다.

[Protobuf 인코딩 사양](https://developers.google.com/protocol-buffers/docs/encoding#packed)에 따르면 파서는 packed 및 unpacked 형태의 반복 숫자 필드를 모두 허용하므로 디코딩 시 `@ProtoPacked` 존재 여부에 의존하지 않습니다.

예제는 다음과 같습니다.

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.protobuf.*

@OptIn(ExperimentalSerializationApi::class)
@Serializable
data class DataPacked(
    // values 리스트에 packed 인코딩을 사용합니다.
    @ProtoPacked
    val values: List<Int>
)

@Serializable
data class DataRepeated(
    val values: List<Int>
)

@OptIn(ExperimentalSerializationApi::class)
fun main() {
    val packed = ProtoBuf.encodeToByteArray(
        DataPacked.serializer(),
        DataPacked(listOf(1, 2, 3))
    )
    println(packed.toAsciiHexString())
    // {0A}{03}{01}{02}{03}

    val repeated = ProtoBuf.encodeToByteArray(
        DataRepeated.serializer(),
        DataRepeated(listOf(1, 2, 3))
    )
    println(repeated.toAsciiHexString())
    // {08}{01}{08}{02}{08}{03}

    println(ProtoBuf.decodeFromByteArray(DataRepeated.serializer(), packed))
    // DataRepeated(values=[1, 2, 3])

    println(ProtoBuf.decodeFromByteArray(DataPacked.serializer(), repeated))
    // DataPacked(values=[1, 2, 3])
}
```

## `oneof` 필드 표현하기 {id="represent-oneof-fields"}

[`oneof`](https://protobuf.dev/programming-guides/proto2/#oneof) 필드는 한 번에 하나의 값만 설정할 수 있는 필드 그룹을 정의합니다.

Kotlin serialization에서는 이 구조를 [다형성(polymorphic)](serialization-polymorphism.md) 타입으로 표현할 수 있습니다.

다음과 같은 ProtoBuf 메시지 정의를 살펴보겠습니다.

```text
message Data {
    required string name = 1;
    oneof phone {
        string home_phone = 2;
        string work_phone = 3;
    }
}
```

Kotlin에서 이 메시지를 표현하려면 다음과 같이 작성합니다.

1. `oneof` 선언 내부의 필드를 나타내는 `sealed interface` 또는 `abstract class`를 생성합니다.

    ```kotlin
    @Serializable
    sealed interface IPhoneType
    ```

2. 전체 메시지를 위한 클래스를 정의합니다. `name` 프로퍼티를 추가하고 `@ProtoNumber(1)`을 지정합니다. 다형성 타입인 `IPhoneType`의 `phone` 프로퍼티를 추가하고 [`@ProtoOneOf`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf/-proto-one-of/)를 지정합니다.

    ```kotlin
    @Serializable
    data class Data(
        @ProtoNumber(1)
        val name: String,
    
        @ProtoOneOf
        val phone: IPhoneType?,
    )
    ```

3. `oneof` 선언의 각 필드에 대해 해당 필드에 대응하는 단일 프로퍼티를 가진 서브클래스를 생성합니다. 각 서브클래스는 일반 클래스, 데이터 클래스, 또는 값 클래스(value class)일 수 있습니다.

    ```kotlin
    @Serializable
    @JvmInline
    value class HomePhone(
        val number: String
    ) : IPhoneType
    
    @Serializable
    data class WorkPhone(
        val number: String
    ) : IPhoneType
    ```
   
4. 각 서브클래스 프로퍼티에 `oneof` 선언의 필드 번호를 사용하여 `@ProtoNumber`를 지정합니다.

    ```kotlin
    @Serializable
    @JvmInline
    value class HomePhone(
        @ProtoNumber(2) val number: String
    ) : IPhoneType
    
    @Serializable
    data class WorkPhone(
        @ProtoNumber(3) val number: String
    ) : IPhoneType
    ```

다음은 집 전화 또는 회사 전화 중 하나를 저장하는 데 `oneof`가 사용되는 보다 상세한 예제입니다.

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.protobuf.*

// oneof 그룹을 나타냅니다.
@Serializable
sealed interface IPhoneType

// home_phone 필드를 나타냅니다.
@OptIn(ExperimentalSerializationApi::class)
@Serializable @JvmInline value class HomePhone(@ProtoNumber(2) val number: String): IPhoneType

// work_phone 필드를 데이터 클래스로 나타냅니다.
@OptIn(ExperimentalSerializationApi::class)
@Serializable data class WorkPhone(@ProtoNumber(3) val number: String): IPhoneType

// oneof 프로퍼티를 가진 데이터 클래스를 정의합니다.
@OptIn(ExperimentalSerializationApi::class)
@Serializable
data class Data(
    // name 프로퍼티에 필드 번호 1을 할당합니다.
    @ProtoNumber(1) val name: String,

    // 다형성 프로퍼티를 oneof 선언에 매핑합니다.
    @ProtoOneOf val phone: IPhoneType?,
)

@OptIn(ExperimentalSerializationApi::class)
fun main() {
    val dataTom = Data("Tom", HomePhone("123"))
    val stringTom = ProtoBuf.encodeToHexString(dataTom)
    val dataJerry = Data("Jerry", WorkPhone("789"))
    val stringJerry = ProtoBuf.encodeToHexString(dataJerry)

    println(stringTom)
    // 0a03546f6d1203313233

    println(stringJerry)
    // 0a054a657272791a03373839
  
    println(ProtoBuf.decodeFromHexString<Data>(stringTom))
    // Data(name=Tom, phone=HomePhone(number=123))

    println(ProtoBuf.decodeFromHexString<Data>(stringJerry))
    // Data(name=Jerry, phone=WorkPhone(number=789))
}
```

출력 결과를 보면 ProtoBuf가 각 메시지에서 `oneof` 선언의 필드 중 하나만 인코딩함을 알 수 있습니다.

* `0a03546f6d1203313233`은 `home_phone`을 가진 `"Tom"`을 나타냅니다.
* `0a054a657272791a03373839`는 `work_phone`을 가진 `"Jerry"`를 나타냅니다.

> 잠재적인 필드 번호 충돌이나 런타임의 `IllegalArgumentException`을 방지하려면 각 `oneof` 타입 계층 구조를 하나의 데이터 클래스에만 매핑하세요.
>
{style="note"}

데이터를 역직렬화하기만 하면 되는 경우에는 `@ProtoOneOf` 어노테이션 없이 클래스를 정의할 수도 있습니다.

예를 들면 다음과 같습니다.

```kotlin
@Serializable  
data class Data(  
    @ProtoNumber(1) val name: String,
    @ProtoNumber(2) val homeNumber: String? = null,  
    @ProtoNumber(3) val workNumber: String? = null,  
)  
```

이 방식을 사용하면 sealed 계층 구조를 사용하지 않고도 `oneof` 필드를 역직렬화할 수 있습니다.

그러나 직렬화 과정에서 `homeNumber`와 `workNumber` 간의 배타성을 강제하지는 않습니다.
두 필드 모두 값을 가지고 있는 경우 직렬화된 출력이 원래의 `oneof` 스키마와 일치하지 않을 수 있으며, 다른 ProtoBuf 파서는 마지막으로 읽은 필드만 유지할 수 있습니다.

## ProtoBuf 스키마 생성 {id="generate-a-protobuf-schema"}

일반적으로 ProtoBuf를 다룰 때는 `.proto` 파일과 코드 생성기를 사용하여 직렬화 및 역직렬화 코드를 생성합니다.
하지만 Kotlin serialization을 사용하면 `@Serializable`이 지정된 Kotlin 클래스를 스키마의 소스로 활용할 수 있으므로 `.proto` 파일이 선택 사항이 됩니다.

관련된 모든 코드가 Kotlin으로 작성된 경우에는 이 접근 방식을 통해 프로세스를 단순화할 수 있지만, 다른 언어와의 상호 운용성을 위해서는 여전히 `.proto` 스키마가 필요한 경우가 많습니다.

이 스키마를 생성하려면 [`ProtoBufSchemaGenerator`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-protobuf/kotlinx.serialization.protobuf.schema/-proto-buf-schema-generator/)를 사용합니다.
이는 하나 이상의 `SerialDescriptor` 인스턴스로부터 Proto2 호환 스키마를 생성합니다.

이를 통해 다른 ProtoBuf 도구와 함께 사용할 수 있는 `.proto` 스키마를 얻을 수 있습니다.

다음은 Kotlin 데이터 클래스에서 `.proto` 스키마를 생성하는 예제입니다.

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.protobuf.*
import kotlinx.serialization.protobuf.schema.ProtoBufSchemaGenerator

@Serializable
data class SampleData(
    val amount: Long,
    val description: String?,
    val department: String = "QA"
)

@OptIn(ExperimentalSerializationApi::class)
fun main() {
    val descriptors = listOf(SampleData.serializer().descriptor)
    val schemas = ProtoBufSchemaGenerator.generateSchemaText(descriptors)
    println(schemas)
}
```

이 코드는 다음과 같은 `.proto` 스키마를 생성합니다.

```text
syntax = "proto2";

// serial name 'example.exampleFormats09.SampleData'
message SampleData {
  required int64 amount = 1;
  optional string description = 2;
  // WARNING: a default value decoded when value is missing
  optional string department = 3;
}
```

> Kotlin의 기본값은 `.proto` 파일에 표현되지 않으므로, 생성된 스키마에는 기본값이 있는 프로퍼티에 대한 경고 주석이 추가됩니다.
>
{style="note"}