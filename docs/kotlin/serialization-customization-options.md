[//]: # (title: 序列化类)

[`@Serializable`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-serializable/) 注解会默认对所有带有[支持字段](properties.md#backing-fields)的类属性启用序列化。
你可以根据具体需求自定义此行为。
本页面介绍了各种序列化技术，向你展示如何指定要序列化的属性，以及如何管理序列化过程。

在开始之前，请确保你已导入[必要的库依赖项](serialization-get-started.md)。

## @Serializable 注解 {id="the-serializable-annotation"}

`@Serializable` 注解启用了类属性的自动序列化，
允许类与 JSON 等格式之间进行相互转换。

在 Kotlin 中，仅带有支持字段的属性会被序列化：

```kotlin
// Imports declarations from the serialization library
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
class Project(
    // 带有支持字段的属性 – 会被序列化
    var name: String
) {
    // 带有支持字段的属性 – 会被序列化
    var stars: Int = 0

    // 没有支持字段的仅 getter 属性 - 不会被序列化
    val path: String
        get() = "kotlin/$name"

    // 委托属性 - 不会被序列化
    var id by ::name
}

fun main() {
    val data = Project("kotlinx.serialization").apply { stars = 9000 }
    // 仅输出 name 和 stars 属性
    println(Json.encodeToString(data))
    // {"name":"kotlinx.serialization","stars":9000}
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-annotation-example"}

### 序列化类引用 {id="serialize-class-references"}

使用 `@Serializable` 注解的类可以包含引用其他类的属性。
被引用的类也必须带有 `@Serializable` 注解。
当编码为 JSON 时，会生成一个嵌套的 JSON 对象：

```kotlin
// Imports declarations from the serialization library
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
// owner 属性引用了另一个可序列化类 User
class Project(val name: String, val owner: User)

// 被引用的类也必须带有 @Serializable 注解
@Serializable
class User(val name: String)

fun main() {
    val owner = User("kotlin")
    val data = Project("kotlinx.serialization", owner)
    println(Json.encodeToString(data))
    // {"name":"kotlinx.serialization","owner":{"name":"kotlin"}}
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-class-references-example"}

> 要引用不可序列化的类，请使用 [`@Transient`](#exclude-properties-with-the-transient-annotation) 注解对应的属性，或者
> 为其提供[自定义序列化器](serialization-create-and-use-serializers.md)。
>
{style="tip"}

### 重复对象引用的序列化 {id="serialization-of-repeated-object-references"}

Kotlin 序列化旨在对纯数据进行编码和解码。它不支持重建
具有重复对象引用的任意对象图。
例如，序列化一个两次引用同一实例的对象时，该对象会被编码两次：

```kotlin
// Imports declarations from the serialization library
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
class Project(val name: String, val owner: User, val maintainer: User)

@Serializable
class User(val name: String)

fun main() {
    val owner = User("kotlin")
    // 两次引用 owner
    val data = Project("kotlinx.serialization", owner, owner)
    println(Json.encodeToString(data))
    // {"name":"kotlinx.serialization","owner":{"name":"kotlin"},"maintainer":{"name":"kotlin"}}
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-repeated-references"}

> 如果尝试序列化循环结构，将导致堆栈溢出。
> 若要从序列化中排除某些引用，请使用 [@Transient 注解](#exclude-properties-with-the-transient-annotation)。
>
{style="tip"}

### 序列化泛型类 {id="serialize-generic-classes"}

Kotlin 中的泛型类支持类型多态，Kotlin 序列化在编译时强制执行此特性。例如，考虑一个泛型可序列化类 `Payload<T>`：

```kotlin
// Imports declarations from the serialization library
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
// Payload<T> 类可以与诸如 Int 的内置类型一起使用，
// 也可以与诸如 Repository 的带有 @Serializable 注解的用户自定义类型一起使用
class Payload<T>(val value: T)

@Serializable
data class Repository(val name: String, val language: String)

@Serializable
class BackupData(
    val issueCount: Payload<Int>,
    val mainRepo: Payload<Repository>
)

fun main() {
    val backup = BackupData(
        Payload(42),
        Payload(Repository("kotlinx.serialization", "Kotlin"))
    )
    println(Json.encodeToString(backup))
    // {"issueCount":{"value":42},"mainRepo":{"value":{"name":"kotlinx.serialization","language":"Kotlin"}}}
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-generic-classes-example"}

序列化类似 `Box<T>` 的泛型类时，JSON 输出取决于你在编译时为 `T` 指定的实际类型。
如果该类型不可序列化，将引发编译错误。

## 可选属性 {id="optional-properties"}

具有*默认值*的属性在反序列化期间是可选的；如果格式配置允许，也可以在序列化期间跳过这些属性。
例如，默认的 JSON 配置会跳过对默认值的编码。

### 为可选属性设置默认值 {id="set-default-values-for-optional-properties"}

在 Kotlin 中，仅当输入中包含某个对象的所有属性时，该对象才能被反序列化。
若要使属性在序列化中变为可选，可设置一个默认值，该值将在输入中未提供相应值时使用：

```kotlin
// Imports declarations from the serialization library
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
// 为可选的 language 属性设置默认值
data class Project(val name: String, val language: String = "Kotlin")

fun main() {
    val data = Json.decodeFromString<Project>("""
        {"name":"kotlinx.serialization"}
    """)
    println(data)
    // Project(name=kotlinx.serialization, language=Kotlin)
}
//sampleEnd
```
{kotlin-runnable="true" id="deserialize-optional-properties"}

### 序列化可空属性 {id="serialize-nullable-properties"}

Kotlin 序列化原生支持可空属性。
[与其他默认值一样](#manage-the-serialization-of-default-properties-with-encodedefault)，`null` 值不会被编码到 JSON 输出中：

```kotlin
// Imports declarations from the serialization library
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
// 定义一个带有 renamedTo 可空属性的类，该属性具有 null 默认值
class Project(val name: String, val renamedTo: String? = null)

fun main() {
    val data = Project("kotlinx.serialization")
    // renamedTo 属性不会被编码，因为它的值为 null
    println(Json.encodeToString(data))
    // {"name":"kotlinx.serialization"}
}
//sampleEnd
```
{kotlin-runnable="true" id="nullable-properties-example"}

此外，Kotlin 的[空安全](null-safety.md)在反序列化期间会受到严格强制执行。
如果 JSON 对象针对非空属性包含 `null` 值，则即使该属性具有默认值，也会抛出异常：

```kotlin
// Imports declarations from the serialization library
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
data class Project(val name: String, val language: String = "Kotlin")

fun main() {
    val data = Json.decodeFromString<Project>("""
        {"name":"kotlinx.serialization","language":null}
    """)
    println(data)
    // JsonDecodingException
}
//sampleEnd
```
{kotlin-runnable="true" validate="false" id="deserialize-nullable-exception-example"}

> 如果你需要处理来自第三方 JSON 的 `null` 值，可以[将其强制转换为默认值](serialization-json-configuration.md#coerce-input-values)。
> 
> 你还可以使用 `explicitNulls` 属性从编码的 JSON 中[省略显式 `null` 值](serialization-json-configuration.md#omit-explicit-nulls)。
>
{style="tip"}

### 可选属性中的初始值设定项 {id="initializers-in-optional-properties"}

当序列化输入包含可选属性的值时，不会调用该属性的初始值设定项。
因此，应避免在属性初始值设定项中使用带有副作用的代码。

示例如下：

```kotlin
// Imports declarations from the serialization library
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
fun computeLanguage(): String {
    println("Computing")
    return "Kotlin"
}

@Serializable
// 如果输入中存在 language，则跳过初始值设定项
data class Project(val name: String, val language: String = computeLanguage())

fun main() {
    val data = Json.decodeFromString<Project>("""
        {"name":"kotlinx.serialization","language":"Java"}
    """)
    println(data)
    // Project(name=kotlinx.serialization, language=Java)
}
//sampleEnd
```
{kotlin-runnable="true" id="deserialize-initializer-example"}

在此示例中，由于输入中指定了 `language` 属性，因此输出中不会打印 `Computing` 字符串。

### 使用 `@EncodeDefault` 管理默认属性的序列化 {id="manage-the-serialization-of-default-properties-with-encodedefault"}

默认情况下，JSON 序列化会排除具有默认值的属性。
这样可以减少序列化数据的大小，并避免不必要的视觉干扰。

在以下示例中，`language` 属性被排除在输出之外，因为它的值等于默认值：

```kotlin
// Imports declarations from the serialization library
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
data class Project(val name: String, val language: String = "Kotlin")

fun main() {
    val data = Project("kotlinx.serialization")
    println(Json.encodeToString(data))
    // {"name":"kotlinx.serialization"}
}
//sampleEnd
```
{kotlin-runnable="true" id="default-properties-example"}

> 你可以配置一个 `Json` 实例，以默认对所有属性[编码默认值](serialization-json-configuration.md#encode-default-values)。
>
{style="tip"}

若要始终序列化某个属性（无论其值或格式设置如何），请使用 [`@EncodeDefault`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-encode-default/) 注解。
或者，你可以设置 [`EncodeDefault.Mode`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-encode-default/-mode/) 参数来更改此行为。

来看一个示例，其中 `language` 属性始终包含在序列化输出中，
而 `projects` 属性在为空列表时会被排除：

```kotlin
// Imports declarations from the serialization library
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlinx.serialization.EncodeDefault.Mode.NEVER

//sampleStart
@Serializable
data class Project(
    val name: String,
    // 始终在序列化输出中包含 language 属性，
    // 即使它具有默认值 "Kotlin"
    @EncodeDefault val language: String = "Kotlin"
)

@Serializable
data class User(
    val name: String,
    // 当 projects 为空列表时将其排除，即使它具有默认值
    @EncodeDefault(NEVER) val projects: List<Project> = emptyList()
)

fun main() {
    val adminUser = User("Alice", listOf(Project("kotlinx.serialization")))
    val guestUser = User("Bob")
    // 序列化 projects，因为它包含值
    // language 始终会被序列化
    println(Json.encodeToString(adminUser))
    // {"name":"Alice","projects":[{"name":"kotlinx.serialization","language":"Kotlin"}]}

    // 排除 projects，因为它是空列表
    // 并且 EncodeDefault.Mode 设置为 NEVER，因此不会被序列化
    println(Json.encodeToString(guestUser))
    // {"name":"Bob"}
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-encode-default"}

### 使用 `@Required` 注解将属性设为必需 {id="make-properties-required-with-the-required-annotation"}

使用 [`@Required`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-required/) 注解属性可使其在输入中成为必需项。
即使该属性具有[默认值](#set-default-values-for-optional-properties)，这也将强制输入中必须包含该属性：

```kotlin
// Imports declarations from the serialization library
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlinx.serialization.Required

//sampleStart
@Serializable
// 将 language 属性标记为必需
data class Project(val name: String, @Required val language: String = "Kotlin")

fun main() {
    val data = Json.decodeFromString<Project>("""
        {"name":"kotlinx.serialization"}
    """)
    println(data)
    // MissingFieldException
}
//sampleEnd
```
{kotlin-runnable="true" id="required-annotation-example"}

## 自定义类序列化 {id="customize-class-serialization"}

Kotlin 序列化提供了几种修改类序列化方式的方法。
本节涵盖了自定义属性名称、控制属性包含等技术。

### 自定义序列化名称 {id="customize-serial-names"}

默认情况下，序列化输出（如 JSON）中的属性名称与源代码中的名称相匹配。

你可以使用 [`@SerialName`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-serial-name/) 注解来自定义这些名称（称为*序列化名称*）。
使用它可以使属性名称在序列化输出中更具描述性：

```kotlin
// Imports declarations from the serialization library
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
// 使用 @SerialName 将 lang 属性更改为 language
class Project(val name: String, @SerialName("language") val lang: String)

fun main() {
    val data = Project("kotlinx.serialization", "Kotlin")
    // 在 JSON 输出中打印更具描述性的属性名称
    println(Json.encodeToString(data))
    // {"name":"kotlinx.serialization","language":"Kotlin"}
}
//sampleEnd
```
{kotlin-runnable="true" id="serial-names"}

### 为序列化定义构造函数属性 {id="define-constructor-properties-for-serialization"}

带有 `@Serializable` 注解的类必须将其主构造函数中的所有形参都声明为属性。

如果需要在为属性赋值之前执行额外的初始化逻辑，请使用[次构造函数](classes.md#secondary-constructors)。
主构造函数可以保持为 `private` 并负责处理属性初始化。

下面是一个示例，其中次构造函数将字符串解析为两个值，然后传递给主构造函数以进行序列化：

```kotlin
// Imports declarations from the serialization library
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
class Project private constructor(val owner: String, val name: String) {
    // 使用 path 字符串创建 Project 对象
    constructor(path: String) : this(
        owner = path.substringBefore('/'),
        name = path.substringAfter('/')
    )

    val path: String
        get() = "$owner/$name"
}
fun main() {
    println(Json.encodeToString(Project("kotlin/kotlinx.serialization")))
    // {"owner":"kotlin","name":"kotlinx.serialization"}
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-constructor-properties"}

### 在主构造函数中验证数据 {id="validate-data-in-the-primary-constructor"}

反序列化后，`kotlinx.serialization` 插件会运行该类的[初始值设定项代码块](classes.md#initializer-blocks)，
就像创建实例时一样。
这使你能够在反序列化期间验证构造函数形参并拒绝无效数据。

示例如下：

```kotlin
// Imports declarations from the serialization library
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
class Project(val name: String) {
    // 验证 name 不为空
    init {
        require(name.isNotEmpty()) { "name cannot be empty" }
    }
}

fun main() {
    val data = Json.decodeFromString<Project>("""
        {"name":""}
    """)
    println(data)
    // Exception in thread "main" java.lang.IllegalArgumentException: name cannot be empty
}
//sampleEnd
```
{kotlin-runnable="true" id="validate-constructor-example"}

### 使用 `@Transient` 注解排除属性 {id="exclude-properties-with-the-transient-annotation"}

你可以使用 [`@Transient`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-transient/) 注解从序列化中排除某个属性。
瞬态（transient）属性必须具有默认值。

如果你在输入中显式指定了瞬态属性的值，即使该值与默认值相匹配，也会抛出 `JsonDecodingException`：

```kotlin
// Imports declarations from the serialization library
import kotlinx.serialization.*
import kotlinx.serialization.Transient
import kotlinx.serialization.json.*

//sampleStart
@Serializable
// 从序列化中排除 language 属性
data class Project(val name: String, @Transient val language: String = "Kotlin")

fun main() {
    // 即使输入与默认值相符，也会抛出异常
    val data = Json.decodeFromString<Project>("""
        {"name":"kotlinx.serialization","language":"Kotlin"}
    """)
    println(data)
    // JsonDecodingException
}
//sampleEnd
```
{kotlin-runnable="true" validate="false" id="transient-annotation-example"}

> 为了避免由 JSON 中的未知键（包括标记有 `@Transient` 注解的键）引发异常，请启用 [`ignoreUnknownKeys`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/ignore-unknown-keys.html) 配置属性。
> 更多信息请参阅[忽略未知键](serialization-json-configuration.md#ignore-unknown-keys)部分。
>
{style="tip"}

## 后续步骤 {id="what-s-next"}

* 在 [JSON 序列化概览](serialization-configure-json-serialization.md)中了解更复杂的 JSON 序列化场景。
* 在[创建和使用序列化器](serialization-create-and-use-serializers.md)中了解如何获取生成的序列化器、创建自定义序列化器以及应用序列化器。