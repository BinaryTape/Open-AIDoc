[//]: # (title: 序列化内置类型)

Kotlin serialization 支持多种内置类型，包括基本类型（如基本类型和字符串）以及特定的标准库类。
以下各节将详细介绍这些类型并展示如何对它们进行序列化。

## 基本类型 {id="basic-types"}

Kotlin serialization 为在序列化数据中表示为单一值的类型提供了内置序列化器。
这包括基本类型、字符串以及枚举。

例如，以下是如何序列化 `Long` 类型的示例：

```kotlin
// 导入必要的库声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
class Data(val signature: Long)

fun main() {
    val data = Data(0x1CAFE2FEED0BABE0)
    println(Json.encodeToString(data))
    // {"signature":2067120338512882656}
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-long-class"}

### 数字 {id="numbers"}

你可以使用所有 Kotlin 数字类型的自然 JSON 表示形式来序列化它们，包括整数和浮点数：

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlin.math.PI

//sampleStart
@Serializable
class Data(
    val answer: Int,
    val pi: Double
)                     

fun main() {
    val data = Data(42, PI)
    println(Json.encodeToString(data))
    // {"answer":42,"pi":3.141592653589793}
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-numbers"}

### 无符号数字 {id="unsigned-numbers"}

Kotlin serialization 支持 Kotlin 的[无符号整型类型](unsigned-integer-types.md)，例如 `UByte` 和 `UInt`。
在 JSON 中，这些值会被序列化为常规 JSON 数字，并保留其完整的无符号范围：

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
class Counter(val counted: UByte, val description: String)

fun main() {
    val counted = 239.toUByte()
    println(Json.encodeToString(Counter(counted, "tries")))
    // {"counted":239,"description":"tries"}
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-unsigned-numbers"}

> 虽然 JSON 保留了无符号数字的完整范围，但其他序列化格式的处理方式可能有所不同。
> 例如，ProtoBuf 和 CBOR 会使用对应的有符号类型来序列化这些类型。
>
{style="note"} 

### 将 `Long` 数字表示为字符串 {id="long-numbers-as-strings"}

你可以将 JSON 中的 `Long` 数字表示为字符串。
这在 JavaScript 环境中非常有用，因为 JavaScript 的 `Number` 类型无法精确表示所有 Kotlin `Long` 值，这可能会导致精度损失。

将 [`LongAsStringSerializer`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.builtins/-long-as-string-serializer/) 与 `@Serializable` 注解配合使用，即可在 JSON 中将 `Long` 值编码为字符串：

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.builtins.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
class Data(
    @Serializable(LongAsStringSerializer::class)
    val signature: Long
)

fun main() {
    val data = Data(0x1CAFE2FEED0BABE0)
    println(Json.encodeToString(data))
    // {"signature":"2067120338512882656"}
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-long-as-string"}

> 你也可以为文件中的所有属性指定像 `LongAsStringSerializer` 这样的序列化器。
> 要了解更多信息，请参阅[为文件指定序列化器](serialization-create-and-use-serializers.md#specify-a-serializer-for-a-file)。
>
{style="tip"}

### 枚举类 {id="enum-classes"}

默认情况下，所有 `enum` 类无需使用 `@Serializable` 注解即可进行序列化。
在 JSON 中序列化时，`enum` 会被编码为字符串：

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// 枚举类不需要 @Serializable 注解
enum class Status { SUPPORTED }

@Serializable
class Project(val name: String, val status: Status) 

fun main() {
    val data = Project("kotlinx.serialization", Status.SUPPORTED)
    println(Json.encodeToString(data))
    // {"name":"kotlinx.serialization","status":"SUPPORTED"}
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-enum"}

> 当面向 Kotlin/JS 或 Kotlin/Native 目标时，若要将 `enum` 类用作根对象（例如在 `encodeToString<Status>(Status.SUPPORTED)` 中），则必须对其使用 `@Serializable` 注解。
>
{style="note"}

#### 自定义枚举条目的序列化名称 {id="customize-serial-names-of-enum-entries"}

要自定义枚举条目的序列化名称，请使用 `@SerialName` 注解，并为枚举类添加 `@Serializable` 标记：

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// 由于使用了 @SerialName，因此需要 @Serializable 注解
@Serializable
enum class Status { @SerialName("maintained") SUPPORTED }

@Serializable
class Project(val name: String, val status: Status) 

fun main() {
    val data = Project("kotlinx.serialization", Status.SUPPORTED)
    println(Json.encodeToString(data))
    // {"name":"kotlinx.serialization","status":"maintained"}
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-enum-serialname"}

有关自定义序列化名称的更多信息，请参阅[自定义序列化名称](serialization-customization-options.md#customize-serial-names)。

## 标准库类型 {id="standard-library-types"}

Kotlin serialization 支持标准库中的多种类型，但某些类（如区间和 [`Regex`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/-regex/) 类）不受支持。

### Pair 和 Triple {id="pair-and-triple"}

你可以序列化 Kotlin 标准库中的 [`Pair`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-pair/) 和 [`Triple`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-triple/) 类：

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
class Project(val name: String)

fun main() {
    val pair = 1 to Project("kotlinx.serialization")
    println(Json.encodeToString(pair))
    // {"first":1,"second":{"name":"kotlinx.serialization"}}
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-pair"}

### 集合 {id="collections"}

Kotlin serialization 支持集合类型，包括 [`List`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/)、[`Set`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-set/) 和 [`Map`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/) 的只读及可变变体。
它还支持它们的具体实现（例如 [`ArrayList`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-array-list/) 和 [`LinkedHashSet`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-linked-hash-set/)），以及泛型数组和基本类型数组类型。
这些集合的表示方式取决于序列化格式。

在 JSON 中，列表和集合会被序列化为 JSON 数组，而映射则表示为 JSON 对象。

Kotlin 使用声明的类型来反序列化 JSON。
在反序列化期间，结果对象的类型由源代码中指定的静态类型决定。
该类型既可以是属性的类型，也可以是解码函数的类型形参。

#### 序列化列表 {id="serialize-lists"}

Kotlin serialization 将 [`List`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/) 类型序列化为 JSON 数组。
以下是一个包含类列表的示例：

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
class Project(val name: String)

fun main() {
    val list = listOf(
        Project("kotlinx.serialization"),
        Project("kotlinx.coroutines")    
    )
    println(Json.encodeToString(list))
    // [{"name":"kotlinx.serialization"},{"name":"kotlinx.coroutines"}]
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-list"}

#### 序列化 Set {id="serialize-sets"}

[`Set`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-set/) 类型会被序列化为 JSON 数组，就像 [List 类型](#serialize-lists)一样：

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
class Project(val name: String)

fun main() {
    val set = setOf(
        Project("kotlinx.serialization"),
        Project("kotlinx.coroutines")    
    )
    println(Json.encodeToString(set))
    // [{"name":"kotlinx.serialization"},{"name":"kotlinx.coroutines"}]
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-set"}

> 默认情况下，你可以反序列化包含重复条目的 Set。处理重复项的行为取决于具体实现。
> 
{style="tip"}

#### 序列化 Map {id="serialize-maps"}

Kotlin serialization 支持以基本类型或枚举作为键的 [`Map`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/) 类型：

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
class Project(val name: String)

fun main() {
    // 创建一个键为 Int 的映射
    val map = mapOf(
        1 to Project("kotlinx.serialization"),
        2 to Project("kotlinx.coroutines")    
    )
    println(Json.encodeToString(map))
    // {"1":{"name":"kotlinx.serialization"},"2":{"name":"kotlinx.coroutines"}}
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-map"}

Map 的序列化方式取决于格式。
在 JSON 中，Map 被表示为对象。由于 JSON 对象的键始终是字符串，因此即使键在 Kotlin 中是数字，也会被编码为字符串。
其他格式（如 CBOR）支持以非基本类型作为键的 Map，并会按原样保留它们。

> JSON 原生不支持复杂键或复合键。
> 若要将结构化对象编码为 Map 的键，请参阅[允许结构化 Map 键](serialization-json-configuration.md#allow-structured-map-keys)。
>
{style="note"}

#### 集合的反序列化行为 {id="deserialization-behavior-of-collections"}

Kotlin 使用声明的类型来反序列化 JSON。
例如，对于集合，`List` 会保留重复项，而 `Set` 会强制保证唯一性：

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
data class Data(
    val a: List<Int>,
    val b: Set<Int>
)

fun main() {
    val data = Json.decodeFromString<Data>("""
        {
            "a": [42, 42],
            "b": [42, 42]
        }
    """)
    // 重复项已从 data.b 中移除，因为 Set 类型强制元素唯一
    println(data)
    // Data(a=[42, 42], b=[42])
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-collections"}

> 有关 Kotlin 集合的更多信息，请参阅[集合概述](collections-overview.md)。
>
{style="tip"}

### Unit 和单例对象 {id="unit-and-singleton-objects"}

Kotlin 的 [`Unit`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-unit/) 类型和其他单例对象是可序列化的。
[单例](object-declarations.md)是只有一个实例的类，其状态由对象本身定义，而不是由外部属性定义。
在 JSON 中，单例对象会被序列化为空结构：

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
object SerializationVersion {
    val libraryVersion: String = "1.0.0"
}

fun main() {
    println(Json.encodeToString(SerializationVersion))
    // {}
    println(Json.encodeToString(Unit))
    // {}
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-singleton"}

> 你可以在[封闭多态层次结构](serialization-polymorphism.md#serialize-closed-polymorphic-classes)中使用序列化的单例对象，
> 以表示无需额外字段的情况。
>
{style="tip"}

### Duration 和 Instant {id="duration-and-instant"}

Kotlin 的 [`Duration`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/) 类型会使用 ISO-8601-2 格式序列化为字符串：

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlin.time.*

//sampleStart
fun main() {
    val duration = 1000.toDuration(DurationUnit.SECONDS)
    println(Json.encodeToString(duration))
    // "PT16M40S"
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-duration"}

你还可以使用 ISO-8601-1 格式将 Kotlin 的 [`Instant`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.time/-instant/) 类型序列化为表示时间点的字符串：

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlin.time.*

//sampleStart
fun main() {
    val instant = Instant.fromEpochMilliseconds(1607505416124)
    println(Json.encodeToString(instant))
    // "2020-12-09T09:16:56.124Z"
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.2" id="serialize-instant"}

### Nothing {id="nothing"}

[`Nothing`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-nothing.html) 类型默认可序列化。
它没有实例，因此对其进行编码或解码都会抛出异常。
当语法上需要某个类型，但该类型不参与序列化时，可以使用 `Nothing`，例如在[带有泛型基类的多态层次结构](serialization-polymorphism.md#serialize-generic-subtypes-in-a-polymorphic-hierarchy)中：

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.builtins.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
sealed class ParametrizedParent<out R> {
    @Serializable
    data class ChildWithoutParameter(val value: Int) : ParametrizedParent<Nothing>()
}

fun main() {
    println(Json.encodeToString(ParametrizedParent.ChildWithoutParameter(42)))
    // {"value":42}
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-nothing"}

## 下一步 {id="what-s-next"}

* 深入阅读[序列化类](serialization-customization-options.md)，了解如何序列化类以及如何修改 `@Serializable` 注解的默认行为。
* 要探索更复杂的 JSON 序列化场景，请参阅 [JSON 序列化概述](serialization-configure-json-serialization.md)。
* 在[序列化多态类](serialization-polymorphism.md)中了解更多关于多态性以及通过共享基类序列化不同类型的信息。