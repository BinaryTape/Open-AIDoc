[//]: # (title: CBOR 포맷)
<primary-label ref="experimental-general"/>

간결한 바이너리 객체 표현(Concise Binary Object Representation, [CBOR](https://datatracker.ietf.org/doc/html/rfc8949))은 JSON 데이터 모델을 확장한 간결한 바이너리 포맷입니다.

## CBOR 종속성 추가 {id="add-dependencies-for-cbor"}

프로젝트에서 CBOR을 사용하려면 빌드 파일에 CBOR 직렬화 라이브러리 종속성을 추가합니다:

<tabs group="build-script">
<tab title="Gradle" group-key="gradle">

```kotlin
// build.gradle(.kts)
dependencies {
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-cbor:%serializationVersion%")
}
```

</tab>

<tab title="Maven" group-key="maven">

```xml
<!-- pom.xml -->
<dependencies>
    <dependency>
        <groupId>org.jetbrains.kotlinx</groupId>
        <artifactId>kotlinx-serialization-cbor</artifactId>
        <version>%serializationVersion%</version>
    </dependency>
</dependencies>
```

</tab>
</tabs>

## 바이너리 직렬화에 CBOR 사용하기 {id="use-cbor-for-binary-serialization"}

[`Cbor`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor/) 클래스는 두 가지 함수를 제공합니다:

* [`encodeToByteArray()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/encode-to-byte-array.html): 객체를 바이트 배열로 직렬화합니다.
* [`decodeFromByteArray()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/decode-from-byte-array.html): 바이트 배열을 객체로 역직렬화합니다.

다음은 `Project` 객체를 바이트 배열로 직렬화한 후 다시 원래 형태로 역직렬화하는 예제입니다:

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.cbor.*

fun ByteArray.toAsciiHexString() = joinToString("") {
    // 출력 가능한 ASCII 범위의 바이트는 문자로 변환하고,
    // 그 외 바이트는 16진수 값으로 변환합니다.
    if (it in 32..126) it.toInt().toChar().toString() else
        "{${it.toUByte().toString(16).padStart(2, '0').uppercase()}}"
}

@Serializable
data class Project(val name: String, val language: String)

@OptIn(ExperimentalSerializationApi::class)
fun main() {
    val data = Project("kotlinx.serialization", "Kotlin")
    
    // 객체를 CBOR 바이트 배열로 직렬화합니다.
    val bytes = Cbor.encodeToByteArray(data)

    // 바이트 배열을 사람이 읽을 수 있는 16진수 문자열로 변환합니다.
    println(bytes.toAsciiHexString())
    // {BF}dnameukotlinx.serializationhlanguagefKotlin{FF}
    
    // 바이트 배열을 다시 객체로 역직렬화합니다.
    val obj = Cbor.decodeFromByteArray<Project>(bytes)
    println(obj)
    // Project(name=kotlinx.serialization, language=Kotlin)
}
```

이 예제는 인코딩된 바이트를 읽기 쉬운 혼합된 형태로 출력합니다. 출력 가능한 ASCII 바이트는 문자로 표시하고, 출력할 수 없는 바이트는 16진수 값으로 표시합니다.

다음은 완전한 [CBOR 16진수 표기법(hex notation)](http://cbor.me/)으로 나타낸 동일한 출력 결과입니다:

```none
Hex code                                             | CBOR type    | Description
-----------------------------------------------------|--------------|------------------------------------
BF                                                   | map(*)       | Start of a CBOR map
├── 64                                               | text(4)      | Length of the string
│   └── 6E616D65                                     | string       | The string "name"
├── 75                                               | text(21)     | Length of the string
│   └── 6B6F746C696E782E73657269616C697A6174696F6E   | string       | The string "kotlinx.serialization"
├── 68                                               | text(8)      | Length of the string
│   └── 6C616E6775616765                             | string       | The string "language"
├── 66                                               | text(6)      | Length of the string
│   └── 4B6F746C696E                                 | string       | The string "Kotlin"
└── FF                                               | primitive(*) | End of the CBOR map
```

## CBOR에서 알 수 없는 키 무시하기 {id="ignore-unknown-keys-in-cbor"}

CBOR은 API 발전에 따라 새로운 프로퍼티가 추가될 수 있는 [사물인터넷(IoT)](https://en.wikipedia.org/wiki/Internet_of_things) 기기와의 통신에 자주 사용됩니다.
기본적으로 역직렬화 중에 알 수 없는 키를 만나면 오류가 발생합니다.

[JSON](serialization-json-configuration.md#ignore-unknown-keys)과 마찬가지로, [`ignoreUnknownKeys`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor-builder/ignore-unknown-keys.html) 프로퍼티를 `true`로 설정하면 역직렬화 시 알 수 없는 키를 무시할 수 있습니다:

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.cbor.*

@Serializable
data class Project(val name: String)

@OptIn(ExperimentalSerializationApi::class)
fun main() {

    // 역직렬화 시 알 수 없는 키를 무시하는 Cbor 인스턴스를 생성합니다.
    val format = Cbor { ignoreUnknownKeys = true }

    // 추가된 알 수 없는 "language" 키가 포함된 CBOR 입력을 디코딩합니다.
    val data = format.decodeFromHexString<Project>(
        "bf646e616d65756b6f746c696e782e73657269616c697a6174696f6e686c616e6775616765664b6f746c696eff"
    )
    println(data)
    // Project(name=kotlinx.serialization)
}
```

이 CBOR 입력에서 다음 바이트들은 알 수 없는 `"language"` 키와 해당 값을 나타냅니다:

* 알 수 없는 키 `"language"`:
    * `68`: 키의 길이
        * `6c616e6775616765`: 키 내용
* 값 `"Kotlin"`:
    * `66`: 값의 길이
        * `4b6f746c696e`: 값 내용

```none
Hex code                                             | CBOR type    | Description
-----------------------------------------------------|--------------|------------------------------------
BF                                                   | map(*)       | Start of a CBOR map
├── 64                                               | text(4)      | Length of the string
│   └── 6E616D65                                     | string       | The string "name"
├── 75                                               | text(21)     | Length of the string
│   └── 6B6F746C696E782E73657269616C697A6174696F6E   | string       | The string "kotlinx.serialization"
├── 68                                               | text(8)      | Length of the string
│   └── 6C616E6775616765                             | string       | The string "language"
├── 66                                               | text(6)      | Length of the string
│   └── 4B6F746C696E                                 | string       | The string "Kotlin"
└── FF                                               | primitive(*) | End of the CBOR map
```
{collapsible="true" collapsed-title="The full CBOR hex notation"}

## CBOR 데이터 인코딩 커스터마이징 {id="customize-cbor-data-encoding"}

[RFC 8949 Major Types](https://datatracker.ietf.org/doc/html/rfc8949#section-3.1) 사양에 따르면, CBOR은 다음과 같은 데이터 타입을 지원합니다:

* 주요 타입 0(Major type 0): 부호 없는 정수(unsigned integer)
* 주요 타입 1(Major type 1): 음의 정수(negative integer)
* 주요 타입 2(Major type 2): 바이트 문자열(byte string)
* 주요 타입 3(Major type 3): 텍스트 문자열(text string)
* 주요 타입 4(Major type 4): 데이터 항목들의 배열(array of data items)
* 주요 타입 5(Major type 5): 데이터 항목 쌍들의 맵(map of pairs of data items)
* 주요 타입 6(Major type 6): 기타 주요 타입의 선택적 의미 태깅(optional semantic tagging)
* 주요 타입 7(Major type 7): 부동 소수점 수, 내용이 없는 단순 데이터 타입 및 "break" 중지 코드

JSON과 달리 CBOR은 사용자 정의 클래스의 인스턴스와 같은 구조화된 맵 키를 지원합니다.
그러나 [`jackson-dataformat-cbor`](https://github.com/FasterXML/jackson-dataformats-binary)와 같은 일부 파서는 이를 지원하지 않습니다.

> JSON에서의 해결 방법은 [구조화된 맵 키 허용(Allow structured map keys)](serialization-json-configuration.md#allow-structured-map-keys)을 참조하세요.
>
{style="tip"}

### `ByteArray` 프로퍼티를 바이트 문자열로 인코딩 {id="encode-bytearray-properties-as-byte-strings"}

기본 인코딩 대신 데이터의 CBOR 표현 방식을 커스터마이징할 수 있습니다. 예를 들어 외부 스키마에 정의된 직렬화 형태와 일치시켜야 하는 경우 등이 있습니다.
어떤 경우에는 이러한 커스터마이징을 통해 바이너리 크기를 줄일 수도 있습니다.

기본적으로 Kotlin의 `ByteArray` 값은 데이터 항목들의 배열을 나타내는 주요 타입 4로 인코딩됩니다.
`ByteArray` 프로퍼티를 바이트 문자열인 주요 타입 2로 인코딩하려면 [`@ByteString`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-byte-string/) 어노테이션을 사용합니다:

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.cbor.*

@Serializable
data class Data(
    // 바이트 배열을 CBOR 바이트 문자열(주요 타입 2)로 인코딩합니다.
    @ByteString
    val type2: ByteArray,
    // 바이트 배열을 CBOR 주요 타입 4(개별 데이터 항목의 배열)로
    // 인코딩합니다.
    val type4: ByteArray
)

@OptIn(ExperimentalSerializationApi::class)
fun main() {
    // 두 개의 ByteArray 필드를 가진 Data 객체를 생성합니다.
    val data = Data(byteArrayOf(1, 2, 3, 4), byteArrayOf(5, 6, 7, 8))

    // Data 객체를 CBOR 바이트 배열로 직렬화합니다.
    val bytes = Cbor.encodeToByteArray(data)

    println(bytes.toAsciiHexString())
    // {BF}etype2D{01}{02}{03}{04}etype4{9F}{05}{06}{07}{08}{FF}{FF}
    
    val obj = Cbor.decodeFromByteArray<Data>(bytes)
    println(obj)
    // Data(type2=[1, 2, 3, 4], type4=[5, 6, 7, 8])
}
```

이 예제에서는 프로퍼티가 서로 다른 CBOR 주요 타입을 사용하기 때문에 각 `ByteArray` 값 앞의 바이트가 서로 다릅니다.

다음은 완전한 CBOR 16진수 표기법으로 나타낸 인코딩된 바이트 배열입니다:

```none
Hex code               | CBOR type    | Description
-----------------------|--------------|-----------------------------------------
BF                     | map(*)       | Start of a CBOR map
├── 65                 | text(5)      | Length of the string
│   └── 7479706532     | string       | The property name "type2"
├── 44                 | bytes(4)     | Length of the byte string
│   └── 01020304       | byte string  | The byte string "\x01\x02\x03\x04"
├── 65                 | text(5)      | Length of the string
│   └── 7479706534     | string       | The property name "type4"
├── 9F                 | array(*)     | Start of a CBOR array
│   ├── 05             | unsigned(5)  | The unsigned integer 5
│   ├── 06             | unsigned(6)  | The unsigned integer 6
│   ├── 07             | unsigned(7)  | The unsigned integer 7
│   ├── 08             | unsigned(8)  | The unsigned integer 8
│   └── FF             | primitive(*) | End of the CBOR array
└── FF                 | primitive(*) | End of the CBOR map
```
{collapsible="true" collapsed-title="The full CBOR hex notation"}

각 프로퍼티에 `@ByteString` 어노테이션을 붙이지 않고 모든 `ByteArray` 값을 주요 타입 2로 인코딩하려면 [`alwaysUseByteString`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor-builder/always-use-byte-string.html) 프로퍼티를 `true`로 설정합니다:

```kotlin
val format = Cbor {
    alwaysUseByteString = true
}
```

### 클래스를 CBOR 배열로 인코딩 {id="encode-classes-as-cbor-arrays"}

기본적으로 클래스는 주요 타입 5에 해당하는 CBOR 맵으로 직렬화됩니다.
즉, 클래스의 각 프로퍼티가 키-값 쌍으로 저장됩니다.

[`@CborArray`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor-array/) 어노테이션을 사용하면 클래스를 CBOR 배열(주요 타입 4)로 직렬화할 수 있습니다.
이는 [RFC 9052](https://www.rfc-editor.org/rfc/rfc9052#section-2)에서 CBOR 배열로 정의하는 COSE 메시지 구조를 인코딩할 때 유용할 수 있습니다.

예제:

```kotlin
@Serializable
@CborArray
data class DataClass(
    val alg: Int,
    val kid: String?
)
 
Cbor.encodeToByteArray(DataClass(alg = -7, kid = null))
```

`@CborArray` 어노테이션을 적용하면 이 예제는 CBOR 배열인 `0x8226f6`으로 인코딩됩니다.
어노테이션이 없으면 동일한 클래스가 CBOR 맵인 `0xa263616c6726636b6964f6`로 인코딩됩니다.

### CBOR의 고정 길이 인코딩과 가변 길이 인코딩 {id="definite-length-and-indefinite-length-encoding-in-cbor"}

CBOR은 맵과 배열에 대해 [두 가지 인코딩 방식](https://datatracker.ietf.org/doc/html/rfc8949#section-3.2.2)을 지원합니다: _고정 길이 인코딩(definite-length encoding)_ 및 _가변 길이 인코딩(indefinite-length encoding)_.

기본적으로 Kotlin 직렬화는 가변 길이 인코딩을 사용합니다.
이 인코딩 방식에서는 맵이나 배열의 요소 수가 명시적으로 인코딩되지 않습니다. 대신 "break" 중지 코드(`0xFF`)로 컬렉션의 끝을 표시합니다.

고정 길이 인코딩은 종료 바이트를 생략하고 맵 또는 배열의 시작 부분에 요소 수를 인코딩합니다.

이 두 모드 간에 전환하려면 [`useDefiniteLengthEncoding`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor-builder/use-definite-length-encoding.html) 프로퍼티를 사용합니다.

## CBOR의 태그와 레이블 {id="tags-and-labels-in-cbor"}

CBOR에서는 프로퍼티 및 값에 대한 추가 정보를 인코딩하는 _태그(tag)_를 정의할 수 있습니다.
이러한 태그는 [`@KeyTags`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-key-tags/) 및 [`@ValueTags`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-value-tags/) 어노테이션으로 지정할 수 있습니다.
`encodeKeyTags`, `encodeValueTags`, `verifyKeyTags`, `verifyValueTags` 프로퍼티는 이 태그들의 인코딩과 검증 여부를 제어합니다.

> CBOR의 태깅에 대한 자세한 내용은 [RFC 8949 Tagging of Items](https://datatracker.ietf.org/doc/html/rfc8949#name-tagging-of-items)를 참조하세요.
>
{style="tip"}

또한 [`@ObjectTags`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-object-tags/) 어노테이션을 사용하여 클래스의 모든 인스턴스에 태그를 지정할 수도 있습니다.

직렬화 시 `@ObjectTags`는 태그가 지정된 객체의 데이터 바로 앞에 인코딩됩니다.
프로퍼티에 값 태그가 있고 해당 타입에 객체 태그가 있는 경우, 값 태그가 객체 태그보다 먼저 인코딩됩니다.
`encodeObjectTags` 및 `verifyObjectTags` 프로퍼티는 객체 태그의 인코딩 및 검증 여부를 제어합니다.
값 태그만 검증하고 객체 태그는 검증하지 않도록 설정하면, 디코더는 추가 객체 태그가 포함된 데이터도 역직렬화할 수 있습니다.

> 잘 알려진 표준 태그 목록은 [`CborTag`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor-tag/)를 참조하세요.
>
{style="tip"}

CBOR은 모든 타입의 맵 키를 지원합니다.
COSE(CBOR Object Signing and Encryption)에서는 이러한 키가 문자열과 숫자로 제한되며 _레이블(label)_이라고 부릅니다.

[`@SerialName`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-serial-name/) 어노테이션으로 문자열 레이블을 지정할 수 있고, [`@CborLabel`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor-label/) 어노테이션으로 숫자 레이블을 지정할 수 있습니다.
[`preferCborLabelsOverNames`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor-configuration/prefer-cbor-labels-over-names.html) 프로퍼티를 사용하면 두 가지가 모두 존재할 때 직렬 이름(serial name)보다 숫자 레이블을 우선하도록 설정할 수 있습니다.
이를 통해 JSON으로 직렬화할 때는 읽기 쉬운 이름을 유지하면서, CBOR 직렬화 시에는 간결한 레이블을 유지하도록 구성할 수 있습니다.

또한 Kotlin 직렬화는 COSE 인코딩 요구사항을 따르는 사전 정의된 [`Cbor.CoseCompliant`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor/-default/-cose-compliant.html) 인스턴스를 제공합니다.
이 인스턴스는 고정 길이 인코딩을 사용하고, 모든 태그를 인코딩 및 검증하며, 직렬 이름보다 숫자 레이블을 선호합니다.

## 커스텀 CBOR 전용 직렬화기 {id="custom-cbor-specific-serializers"}

CBOR 인코더와 디코더는 [`CborEncoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor-encoder/) 및 [`CborDecoder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor-decoder/) 인터페이스를 구현합니다.

이 인터페이스들은 일반 `Encoder` 및 `Decoder` 인터페이스를 확장하며, [`cbor`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor-encoder/cbor.html) 프로퍼티를 통해 CBOR 전용 구성에 접근할 수 있도록 해줍니다.
커스텀 직렬화기(serializer)는 이 프로퍼티를 사용하여 현재 [`Cbor`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-cbor/kotlinx.serialization.cbor/-cbor/) 인스턴스에 접근하고, 임베디드 바이트 배열을 생성하며, `preferCborLabelsOverNames` 및 `useDefiniteLengthEncoding`과 같은 현재 설정을 읽을 수 있습니다.

커스텀 직렬화기 생성에 대한 자세한 내용은 [커스텀 직렬화기 작성하기(Create custom serializers)](serialization-custom-formats.md)를 참조하세요.