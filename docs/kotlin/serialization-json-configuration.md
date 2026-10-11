[//]: # (title: 自定义 Json 实例)

默认的 [`Json`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json/-default/) 实例严格遵循 JSON 规范和 Kotlin 类中的声明。

你可以通过 [`Json()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json.html) 构建器函数创建自定义的 `Json` 实例，以使用更灵活的 JSON 功能或类型转换：

```kotlin
// 基于默认配置创建 Json 实例，允许特殊的浮点值
val customJson = Json {
    allowSpecialFloatingPointValues = true
}

// 使用与默认实例相同的语法通过 customJson 实例对字符串进行编码
val jsonString = customJson.encodeToString(Data(Double.NaN))
println(jsonString)
```

通过这种方式创建的 `Json` 实例是不可变的且线程安全的，因此可以安全地存储在顶层属性中以供复用。

> 复用自定义 `Json` 实例可以让其缓存类专属的信息，从而提升性能。
>
{style="tip"}

你还可以基于现有的 `Json` 实例创建新实例，并使用相同的构建器语法修改其设置：

```kotlin
// 基于现有的 Json 创建新实例
val lenientJson = Json(customJson) {
    isLenient = true
    prettyPrint = true
}
```

## 自定义 JSON 结构 {id="customize-json-structure"}

你可以自定义 `Json` 实例在编码和解码过程中如何构建数据结构。
这让你可以控制哪些值会出现在输出中，以及特定类型如何表示。

### 编码默认值 {id="encode-default-values"}

默认情况下，JSON 编码器会省略属性的默认值，因为在解码过程中它们会自动应用于缺失的属性。
这种行为对于带有 null 默认值的可空属性尤其有用，因为它避免了写入不必要的 `null` 值。
有关更多详细信息，请参阅[管理默认属性的序列化](serialization-customization-options.md#manage-the-serialization-of-default-properties-with-encodedefault)部分。

要更改此默认行为，请在 `Json` 实例中将 [`encodeDefaults`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/encode-defaults.html) 属性设置为 `true`：

```kotlin
// 从序列化库导入声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// 配置 Json 实例以编码默认值
val format = Json { encodeDefaults = true }

@Serializable
class Project(
    val name: String,
    val language: String = "Kotlin",
    val website: String? = null
)

fun main() {
    val data = Project("kotlinx.serialization")

    // 编码所有属性值，包括默认值
    println(format.encodeToString(data))
    // {"name":"kotlinx.serialization","language":"Kotlin","website":null}
}
//sampleEnd
```
{kotlin-runnable="true" id="encode-default-values-example"}

### 省略显式 null {id="omit-explicit-nulls"}

默认情况下，所有 `null` 值都会被编码到 JSON 输出中。
要省略 `null` 值，请在 `Json` 实例中将 [`explicitNulls`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/explicit-nulls.html) 属性设置为 `false`：

```kotlin
// 从序列化库导入声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// 配置 Json 实例以在序列化期间省略 null 值
val format = Json { explicitNulls = false }

@Serializable
data class Project(
    val name: String,
    val language: String,
    val version: String? = "1.2.2",
    val website: String?,
    val description: String? = null
)

fun main() {
    val data = Project("kotlinx.serialization", "Kotlin", null, null, null)
    val json = format.encodeToString(data)

    // 从 JSON 输出中省略 version、website 和 description 属性
    println(json)
    // {"name":"kotlinx.serialization","language":"Kotlin"}

    // 将缺失且没有默认值的可空属性视为 null
    // 使用默认值填充具有默认值的属性
    println(format.decodeFromString<Project>(json))
    // Project(name=kotlinx.serialization, language=Kotlin, version=1.2.2, website=null, description=null)
}
//sampleEnd
```
{kotlin-runnable="true" id="omit-nulls-example"}

当 `explicitNulls` 设置为 `false` 时，编码和解码可能会变得不对称。
在此示例中，`version` 属性在编码前为 `null`，但解码后变为 `1.2.2`。

> 你可以使用 [`coerceInputValues`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/coerce-input-values.html) 属性配置解码器，将某些无效的输入值作为缺失属性处理。
> 有关更多信息，请参阅[强制转换输入值](#coerce-input-values)部分。
>
{style="tip"}

### 允许结构化 Map 键 {id="allow-structured-map-keys"}

JSON 格式本身不支持具有结构化键的 Map，因为 JSON 的键是仅表示基本类型或枚举的字符串。
要序列化和反序列化具有用户定义类作为键的 Map，请使用 [`allowStructuredMapKeys`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/allow-structured-map-keys.html) 属性：

```kotlin
// 从序列化库导入声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// 配置 Json 实例以编码具有结构化键的 Map
val format = Json { allowStructuredMapKeys = true }

@Serializable
data class Project(val name: String)

fun main() {
    val map = mapOf(
        Project("kotlinx.serialization") to "Serialization",
        Project("kotlinx.coroutines") to "Coroutines"
    )
    // 将具有结构化键的 Map 序列化为 JSON 数组：
    // [key1, value1, key2, value2,...]
    println(format.encodeToString(map))
    // [{"name":"kotlinx.serialization"},"Serialization",{"name":"kotlinx.coroutines"},"Coroutines"]
}
//sampleEnd
```
{kotlin-runnable="true" id="allow-structured-map-keys-example"}

### 允许特殊浮点值 {id="allow-special-floating-point-values"}

默认情况下，JSON 不支持像 [`Double.NaN`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-double/-na-n.html)
和无穷大这样的特殊浮点值，因为 [JSON 规范](https://datatracker.ietf.org/doc/html/rfc8259#section-6)禁止了它们。

要启用对它们的编码和解码，请在 `Json` 实例中将 [`allowSpecialFloatingPointValues`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/allow-special-floating-point-values.html) 属性设置为 `true`：

```kotlin
// 从序列化库导入声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// 配置 Json 实例以允许特殊的浮点值
val format = Json { allowSpecialFloatingPointValues = true }

@Serializable
class Data(
    val value: Double
)

fun main() {
    val data = Data(Double.NaN)
    // 生成用于表示特殊浮点值的非标准 JSON 输出
    println(format.encodeToString(data))
    // {"value":NaN}
}
//sampleEnd
```
{kotlin-runnable="true" id="allow-special-float-point-example"}

### 为多态指定类鉴别器 {id="specify-class-discriminator-for-polymorphism"}

处理[多态数据](serialization-polymorphism.md)时，你可以使用
[`classDiscriminator`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/class-discriminator.html) 属性指定一个键名，用于标识已序列化的多态对象的类型。
结合[使用 `@SerialName` 注解定义的显式序列化名称](serialization-customization-options.md#customize-serial-names)，
这种方法让你可以完全控制生成的 JSON 结构：

```kotlin
// 从序列化库导入声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// 配置 Json 实例以使用自定义类鉴别器
val format = Json { classDiscriminator = "#class" }

@Serializable
sealed class Project {
    abstract val name: String
}

// 为 OwnedProject 类指定自定义序列化名称
@Serializable
@SerialName("owned")
class OwnedProject(override val name: String, val owner: String) : Project()

// 为 SimpleProject 类指定自定义序列化名称
@Serializable
@SerialName("simple")
class SimpleProject(override val name: String) : Project()

fun main() {
    val simpleProject: Project = SimpleProject("kotlinx.serialization")
    val ownedProject: Project = OwnedProject("kotlinx.coroutines", "kotlin")

    // 序列化 SimpleProject，包含 #class: "simple"
    println(format.encodeToString(simpleProject))
    // {"#class":"simple","name":"kotlinx.serialization"}

    // 序列化 OwnedProject，包含 #class: "owned"
    println(format.encodeToString(ownedProject))
    // {"#class":"owned","name":"kotlinx.coroutines","owner":"kotlin"}
}
//sampleEnd
```
{kotlin-runnable="true" id="class-discriminator-example"}

虽然 `Json` 实例中的 `classDiscriminator` 属性允许你为所有多态类型指定单个鉴别器键，但[实验性](components-stability.md#stability-levels-explained)的 [`@JsonClassDiscriminator`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-class-discriminator/) 注解提供了更大的灵活性。
它允许你直接在基类上定义自定义鉴别器，该鉴别器会自动被其所有子类继承。

> 要详细了解可继承的序列化注解，请参阅 [`@InheritableSerialInfo`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-inheritable-serial-info/)。
> 
{style="tip"}

示例如下：

```kotlin
// 从序列化库导入声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// @JsonClassDiscriminator 注解是可继承的，因此 Base 的所有子类都将具有相同的鉴别器
@Serializable
@OptIn(ExperimentalSerializationApi::class)
@JsonClassDiscriminator("message_type")
sealed class Base

// 从 Base 继承鉴别器
@Serializable
sealed class ErrorClass: Base()

// 定义一个组合了消息和可选错误的类
@Serializable
data class Message(val message: Base, val error: ErrorClass?)

@Serializable
@SerialName("my.app.BaseMessage")
data class BaseMessage(val message: String) : Base()

@Serializable
@SerialName("my.app.GenericError")
data class GenericError(@SerialName("error_code") val errorCode: Int) : ErrorClass()

val format = Json { classDiscriminator = "#class" }

fun main() {
    val data = Message(BaseMessage("not found"), GenericError(404))
    // 对所有子类使用来自 Base 的鉴别器
    println(format.encodeToString(data))
    // {"message":{"message_type":"my.app.BaseMessage","message":"not found"},"error":{"message_type":"my.app.GenericError","error_code":404}}
}
//sampleEnd
```
{kotlin-runnable="true" id="jsonclass-discriminator-example"}

> 你不能在密封基类的子类中指定不同的类鉴别器。
> 只有具有明确且不重叠子类的层次结构才能定义自己的鉴别器。
> 
> 当两者都指定了鉴别器时，`@JsonClassDiscriminator` 的优先级高于 `Json` 配置中的鉴别器。
>
{style="note"}

### 设置类鉴别器输出模式 {id="set-class-discriminator-output-mode"}

使用 [`JsonBuilder.classDiscriminatorMode`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/class-discriminator-mode.html) 属性控制如何将类鉴别器添加到 JSON 输出中。
默认情况下，[鉴别器仅添加到多态类型中](#specify-class-discriminator-for-polymorphism)，这在处理[多态类层次结构](serialization-polymorphism.md)时非常有用。

要调整此行为，请将 [`ClassDiscriminatorMode`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-class-discriminator-mode/) 属性设置为以下选项之一：

* [`POLYMORPHIC`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-class-discriminator-mode/-p-o-l-y-m-o-r-p-h-i-c/)：（默认）仅为多态类型添加类鉴别器。
* [`ALL_JSON_OBJECTS`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-class-discriminator-mode/-a-l-l_-j-s-o-n_-o-b-j-e-c-t-s/)：尽可能为所有 JSON 对象添加类鉴别器。
* [`NONE`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-class-discriminator-mode/-n-o-n-e/)：完全省略类鉴别器。

下面是将 `ClassDiscriminatorMode` 属性设置为 `NONE` 的示例：

```kotlin
// 从序列化库导入声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// 配置 Json 实例以从输出中省略类鉴别器
val format = Json { classDiscriminatorMode = ClassDiscriminatorMode.NONE }

@Serializable
sealed class Project {
    abstract val name: String
}

@Serializable
class OwnedProject(override val name: String, val owner: String) : Project()

fun main() {
    val data: Project = OwnedProject("kotlinx.coroutines", "kotlin")
    // 不带鉴别器进行序列化
    println(format.encodeToString(data))
    // {"name":"kotlinx.coroutines","owner":"kotlin"}
}
//sampleEnd
```
{kotlin-runnable="true" id="set-classdiscriminatormode-example"}

> 没有鉴别器，基类的序列化器将无法把输出反序列化回相应的类型。
>
{style="note"}

### 美化输出 {id="pretty-printing"}

默认情况下，`Json` 生成紧凑的单行输出。

你可以通过在输出中启用美化输出（pretty printing）来添加缩进和换行符，以提高可读性。
为此，请在 `Json` 实例中将 [`prettyPrint`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/pretty-print.html) 属性设置为 `true`：

```kotlin
// 从序列化库导入声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// 创建自定义 Json 格式
val format = Json { prettyPrint = true }

@Serializable
data class Project(val name: String, val language: String)

fun main() {
    val data = Project("kotlinx.serialization", "Kotlin")

    // 输出带有换行和缩进的 JSON
    println(format.encodeToString(data))
}
//sampleEnd
```
{kotlin-runnable="true" id="pretty-printing-example"}

此示例输出以下结果：

```text
{
    "name": "kotlinx.serialization",
    "language": "Kotlin"
}
```

> 你可以使用 [`prettyPrintIndent`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/pretty-print-indent.html) 选项自定义美化输出 JSON 中使用的缩进。
>
> 例如，你可以将默认的四个空格替换为任何允许的空白字符，如 `\t` 或 `\n`。
>
{style="tip"}

## 自定义 JSON 反序列化 {id="customize-json-deserialization"}

Kotlin 的 `Json` 解析器提供了多项设置，允许你自定义 JSON 数据的解析与反序列化。

### 忽略未知键 {id="ignore-unknown-keys"}

当处理来自第三方服务或其他动态来源的 JSON 数据时，JSON 对象中可能会随着时间推移添加新的属性。

默认情况下，未知键（JSON 输入中的属性名称）会在反序列化过程中导致错误。
要防止这种情况，请在 `Json` 实例中将 [`ignoreUnknownKeys`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/ignore-unknown-keys.html) 属性
设置为 `true`：

```kotlin
// 从序列化库导入声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// 创建忽略未知键的 Json 实例
val format = Json { ignoreUnknownKeys = true }

@Serializable
data class Project(val name: String)

fun main() {
    val data = format.decodeFromString<Project>("""
        {"name":"kotlinx.serialization","language":"Kotlin"}
    """)
    // language 键被忽略，因为它不在 Project 类中
    println(data)
    // Project(name=kotlinx.serialization)
}
//sampleEnd
```
{kotlin-runnable="true" id="ignore-unknown-keys-example"}

#### 针对特定类忽略未知键 {id="ignore-unknown-keys-for-specific-classes"}
<primary-label ref="experimental-opt-in"/>

除了[为所有类启用 `ignoreUnknownKeys`](#ignore-unknown-keys) 之外，
你还可以使用 `@JsonIgnoreUnknownKeys` 注解仅针对特定类忽略未知键。
这允许你默认保持严格的反序列化，同时仅在需要的地方放宽限制。

`@JsonIgnoreUnknownKeys` 注解是[实验性](components-stability.md#stability-levels-explained)的。
要选择加入，请使用 `@OptIn(ExperimentalSerializationApi::class)` 注解或编译器选项 `-opt-in=kotlinx.serialization.ExperimentalSerializationApi`：

```kotlin
// 从序列化库导入声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@OptIn(ExperimentalSerializationApi::class)
@Serializable
// Outer 中的未知属性在反序列化期间会被忽略
@JsonIgnoreUnknownKeys
data class Outer(val a: Int, val inner: Inner)

@Serializable
data class Inner(val x: String)

fun main() {
    val outer = Json.decodeFromString<Outer>(
        """{"a":1,"inner":{"x":"value"},"unknownKey":42}"""
    )
    println(outer)
    // Outer(a=1, inner=Inner(x=value))

    // 抛出异常
    // inner 内部的 unknownKey 未被忽略，因为 Inner 没有被注解修饰
    println(
        Json.decodeFromString<Outer>(
            """{"a":1,"inner":{"x":"value","unknownKey":"unexpected"}}"""
        )
    )
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.2" validate="false" id="ignore-specific-unknown-keys-example"}

在此示例中，`Inner` 会针对未知键抛出 `SerializationException`，因为它没有使用 `@JsonIgnoreUnknownKeys` 进行注解。

### 强制转换输入值 {id="coerce-input-values"}

当处理来自第三方服务或其他动态来源的 JSON 数据时，格式可能会发生演变。
当实际值与预期类型不匹配时，这可能会在解码期间导致异常。

默认的 `Json` 实现对[输入类型要求严格](serialization-customization-options.md#the-serializable-annotation)。
要放宽此限制，请在 `Json` 实例中将 [`coerceInputValues`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/coerce-input-values.html) 属性设置为 `true`：

```kotlin
// 从序列化库导入声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
val format = Json { coerceInputValues = true }

@Serializable
data class Project(val name: String, val language: String = "Kotlin")

fun main() {
    val data = format.decodeFromString<Project>("""
        {"name":"kotlinx.serialization","language":null}
    """)

    // 将 language 的无效 null 值强制转换为其默认值
    println(data)
    // Project(name=kotlinx.serialization, language=Kotlin)
}
//sampleEnd
```
{kotlin-runnable="true"}

`coerceInputValues` 属性仅影响解码。它会将某些无效的输入值视为相应属性缺失。
目前，它适用于：

* 非空类型的 `null` 输入
* 枚举的未知值

> 此列表可能会在未来版本中扩展，通过将无效值替换为默认值或 `null`，
> 使具有此属性的 `Json` 实例具有更大的容错性。
>
{style="note"}

如果某个值缺失，且存在默认属性值，则会将其替换为默认值。

对于枚举，仅在满足以下条件时，该值才会被替换为 `null`：

* 未定义默认值。
* [`explicitNulls`](#omit-explicit-nulls) 属性设置为 `false`。
* 该属性可空。

你可以将 `coerceInputValues` 与 `explicitNulls` 属性结合使用来处理无效的枚举值：

```kotlin
// 从序列化库导入声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
enum class Color { BLACK, WHITE }

@Serializable
data class Brush(val foreground: Color = Color.BLACK, val background: Color?)

val json = Json { 
  coerceInputValues = true
  explicitNulls = false
}

fun main() {

    // 将未知的 foreground 值强制转换为其默认值，并将 background 强制转换为 null
    val brush = json.decodeFromString<Brush>("""{"foreground":"pink", "background":"purple"}""")
    println(brush)
    // Brush(foreground=BLACK, background=null)
}
//sampleEnd
```
{kotlin-runnable="true" id="coerce-input-values-example"}

### 允许尾随逗号 {id="allow-trailing-commas"}

要允许 JSON 输入中包含尾随逗号，请将 [`allowTrailingComma`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/allow-trailing-comma.html) 属性设置为 `true`：

```kotlin
// 从序列化库导入声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// 允许 JSON 对象和数组中包含尾随逗号
val format = Json { allowTrailingComma = true }

fun main() {
    val numbers = format.decodeFromString<List<Int>>(
        """
            [1, 2, 3,]
        """
    )
    println(numbers)
    // [1, 2, 3]
}
//sampleEnd
```
{kotlin-runnable="true" id="allow-trailing-commas-example"}

### 允许 JSON 中的注释 {id="allow-comments-in-json"}

使用 [`allowComments`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/allow-comments.html) 属性以允许 JSON 输入中的注释。
启用此属性后，解析器将接受输入中的以下注释形式：

* 以换行符 `\n` 结尾的 `//` 行注释
* `/* */` 块注释

示例如下：

```kotlin
// 从序列化库导入声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// 允许 JSON 输入中的注释
val format = Json { allowComments = true }

fun main() {
    val numbers = format.decodeFromString<List<Int>>(
        """
            [
                // 第一个元素
                1,
                /* 第二个元素 */
                2
            ]
        """
    )
    println(numbers)
    // [1, 2]
}
//sampleEnd
```
{kotlin-runnable="true" id="allow-comments-example"}

### 宽容解析 {id="lenient-parsing"}

默认情况下，`Json` 解析器强制执行严格的 JSON 规则以确保符合 [RFC-8259](https://www.ietf.org/rfc/rfc8259.txt) 规范，
该规范要求键和字符串文字必须用引号括起来。

要放宽这些限制，请在 `Json` 实例中将 [`isLenient`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/is-lenient.html) 属性设置为 `true`：

```kotlin
// 从序列化库导入声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
val format = Json { isLenient = true }

enum class Status { SUPPORTED }

@Serializable
data class Project(val name: String, val status: Status, val votes: Int)

fun main() {
    // 使用宽容解析解码 JSON 字符串
    // 宽容解析允许未加引号的键、字符串和枚举值
    val data = format.decodeFromString<Project>("""
        {
            name   : kotlinx.serialization,
            status : SUPPORTED,
            votes  : "9000"
        }
    """)
    println(data)
    // Project(name=kotlinx.serialization, status=SUPPORTED, votes=9000)
}
//sampleEnd
```
{kotlin-runnable="true" id="lenient-parsing-example"}

## 自定义 JSON 与 Kotlin 之间的名称映射 {id="customize-name-mapping-between-json-and-kotlin"}

某些 JSON 数据可能无法与 Kotlin 的命名约定或预期格式完全对齐。
为了应对这些挑战，Kotlin 序列化提供了多种工具来管理命名差异、处理多个 JSON 属性名称，并确保整个序列化数据中命名策略的一致性。

### 为单个 Kotlin 属性接受备选 JSON 属性名称 {id="accept-alternative-json-property-names-for-a-single-kotlin-property"}

当 JSON 属性名称在不同架构版本之间发生变化时，
你可以[使用 `@SerialName` 注解重命名 JSON 属性](serialization-customization-options.md#customize-serial-names)。

但是，这会阻止解码仍在使用先前属性名称的数据。
要为单个属性接受备选 JSON 属性名称，请使用 [`@JsonNames`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-names/) 注解：

```kotlin
// 从序列化库导入声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
// 将 name 和 title 两个 JSON 属性都映射到 name 属性
data class Project(@JsonNames("title") val name: String)

fun main() {
    val project = Json.decodeFromString<Project>("""{"name":"kotlinx.serialization"}""")
    println(project)
    // Project(name=kotlinx.serialization)

    val oldProject = Json.decodeFromString<Project>("""{"title":"kotlinx.coroutines"}""")
    // name 和 title 两个 JSON 属性都对应于 name 属性
    println(oldProject)
    // Project(name=kotlinx.coroutines)
}
//sampleEnd
```
{kotlin-runnable="true" id="accept-alternative-json-property-example"}

> [`JsonBuilder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/) 中的 [`useAlternativeNames`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/use-alternative-names.html) 属性用于启用 `@JsonNames` 注解。
> 该属性默认为 `true`，并允许 `Json` 识别和解码单个属性的多个名称。
> 
> 如果你没有使用 `@JsonNames` 并且希望提高性能，
> 特别是在使用 `ignoreUnknownKeys` 跳过许多未知属性时，可以将此属性设置为 `false`。
>
{style="note"}

### 以不区分大小写的方式解码枚举 {id="decode-enums-in-a-case-insensitive-manner"}

[Kotlin 命名约定](coding-conventions.md#property-names)建议使用大写下划线或大驼峰拼写法（Upper CamelCase）来命名枚举值。
默认情况下，`Json` 在解码时会使用与 Kotlin 枚举常量完全一致的名称。

但是，来自外部源的 JSON 数据可能使用小写或大小写混合的名称。
要处理此类情况，请使用 [`JsonBuilder.decodeEnumsCaseInsensitive`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/decode-enums-case-insensitive.html) 属性配置 `Json` 实例以不区分大小写的方式解码枚举值：

```kotlin
// 从序列化库导入声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// 配置 Json 实例以不区分大小写的方式解码枚举值
val format = Json { decodeEnumsCaseInsensitive = true }

enum class Cases { VALUE_A, @JsonNames("Alternative") VALUE_B }

@Serializable
data class CasesList(val cases: List<Cases>)

fun main() {
    // 忽略大小写解码枚举值，包括备选名称
    println(format.decodeFromString<CasesList>("""{"cases":["value_A", "alternative"]}""")) 
    // CasesList(cases=[VALUE_A, VALUE_B])
}
//sampleEnd
```
{kotlin-runnable="true" id="decode-enums-caseinsensitive-example"}

> 此属性既适用于[序列化名称](serialization-customization-options.md#customize-serial-names)，也适用于使用 `@JsonNames` 注解指定的[备选名称](#accept-alternative-json-property-names-for-a-single-kotlin-property)，
> 从而确保所有值都能成功解码。此属性不影响编码。
>
{style="note"}

### 应用全局命名策略 {id="apply-a-global-naming-strategy"}

当 JSON 输入中的属性名称与 Kotlin 中的属性名称不同时，你可以使用 [`@SerialName`](serialization-customization-options.md#customize-serial-names) 注解显式指定每个属性的名称。
但是，当从其他框架或旧版代码库迁移时，你可能需要以相同的方式转换每个序列化名称。

对于这些场景，你可以使用 `Json` 实例中的 [JsonBuilder.namingStrategy](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/naming-strategy.html) 属性指定全局命名策略。
Kotlin 序列化提供了内置策略，例如 [JsonNamingStrategy.SnakeCase](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-naming-strategy/-builtins/-snake-case.html)：

```kotlin
// 从序列化库导入声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
data class Project(val projectName: String, val projectOwner: String)

// 配置 Json 实例以应用 SnakeCase 命名策略
val format = Json { namingStrategy = JsonNamingStrategy.SnakeCase }

fun main() {
    val project = format.decodeFromString<Project>("""{"project_name":"kotlinx.coroutines", "project_owner":"Kotlin"}""")
    // 进行序列化和反序列化，就好像所有序列化名称都从驼峰拼写法转换为了蛇形拼写法（snake_case）
    println(format.encodeToString(project.copy(projectName = "kotlinx.serialization")))
    // {"project_name":"kotlinx.serialization","project_owner":"Kotlin"}
}
//sampleEnd
```
{kotlin-runnable="true" id="global-naming-strategy-example"}

在通过 [`JsonNamingStrategy`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-naming-strategy/) 使用全局命名策略时，请注意以下几点：

* _转换适用于所有属性_，无论序列化名称是从属性名称派生的，还是使用 [`@SerialName`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-serial-name/) 注解显式定义的。
  你不能通过指定序列化名称来排除属性的转换。
  要在序列化期间保持特定名称不变，请改用 `@JsonNames` 注解。
* 如果转换后的名称与其他转换后的属性名称冲突，或者与 `@JsonNames` 注解指定的备选名称冲突，
  反序列化将失败并抛出异常。
* 全局命名策略是隐式的。
  仅通过查看类定义很难确定序列化后的名称。
  这可能会使 IDE 中的**查找用例 (Find Usages)** 和**重命名 (Rename)** 等任务，或使用 `grep` 等工具进行的全文搜索变得更加困难，从而可能增加错误风险和维护成本。

鉴于这些因素，在应用程序中实施全局命名策略之前，请仔细权衡利弊。

## 下一步 {id="what-s-next"}

* 探索[高级 JSON 元素处理](serialization-json-elements.md)，以便在解析或序列化之前操作和处理 JSON 数据。
* 了解如何[在序列化和反序列化期间转换 JSON](serialization-transform-json.md)，从而更好地掌控你的数据。