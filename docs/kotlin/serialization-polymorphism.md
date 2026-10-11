[//]: # (title: 序列化多态类)

多态允许通过通用接口或基类来处理不同类型的对象。
Kotlin 序列化支持子类型多态，允许通过通用的声明超类型来序列化不同类型。

有关 Kotlin 中接口与继承如何工作的概述，请参阅[接口](interfaces.md)和[继承](inheritance.md)。

Kotlin 序列化默认是*静态*的。
它使用被序列化值的*静态类型*（即变量的声明类型）来确定编码哪些属性。

这意味着即使运行时值是子类的实例，也仅会序列化在该静态类型中定义的属性。

以下是使用多态继承层次结构的示例：

```kotlin
// 从序列化库导入声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
open class Project(val name: String)

class OwnedProject(name: String, val owner: String) : Project(name)

fun main() {
    // 使用 Project 作为声明的静态类型
    val data: Project = OwnedProject("kotlinx.coroutines", "kotlin")

    // 仅序列化在静态类型中定义的属性
    println(Json.encodeToString(data))
    // {"name":"kotlinx.coroutines"}
}
//sampleEnd
```
{kotlin-runnable="true"}

在此示例中，尽管运行时值是 `OwnedProject` 子类，但仅序列化了声明的 `Project` 静态类型的属性。

为了序列化多态类层次结构中的值，Kotlin 序列化提供了两种方法：

* [封闭多态](#serialize-closed-polymorphic-classes)：使用 `sealed` 基类或接口，以确保所有子类在编译时已知。
* [开放多态](#serialize-open-polymorphic-classes)：为 `open` 或 `abstract` 基类显式指定子类。

## 序列化封闭多态类 {id="serialize-closed-polymorphic-classes"}

当所有可能的子类都保证在编译时已知时，该类层次结构被视为使用封闭多态。

为了提供这种保证，[请使用 `sealed class` 或 `sealed interface`](sealed-classes.md) 作为基类型。
将其标记为 `@Serializable`，并将所有子类也标记为 `@Serializable`：

```kotlin
// 从序列化库导入声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// 定义 sealed class 作为基类型
@Serializable
sealed class Project {
    abstract val name: String
}

// 将子类标记为可序列化
@Serializable
class OwnedProject(override val name: String, val owner: String) : Project()

// 使用基类型作为静态类型序列化数据
fun main() {
    // 使用基类型作为静态类型
    val data: Project = OwnedProject("kotlinx.coroutines", "kotlin")

    // 添加了 type 属性以识别序列化的子类
    println(Json.encodeToString(data))
    // {"type":"OwnedProject","name":"kotlinx.coroutines","owner":"kotlin"}
}
//sampleEnd
```
{kotlin-runnable="true"}

默认情况下，JSON 输出中的 `type` 属性充当类鉴别器，用于识别序列化的子类。
仅当在序列化期间使用基类作为静态类型时，才会包含此属性。

> 您还可以将 JSON 配置为对类鉴别器使用不同的键名。
> 有关详细信息，请参阅[为多态指定类鉴别器](serialization-json-configuration.md#specify-class-discriminator-for-polymorphism)部分。
>
{style="tip"}

以下是子类作为静态类型时省略 `type` 属性的示例：

```kotlin
// 从序列化库导入声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
sealed class Project {
    abstract val name: String
}

@Serializable
class OwnedProject(override val name: String, val owner: String) : Project()

fun main() {
    // 推断出的静态类型为 OwnedProject
    val data = OwnedProject("kotlinx.coroutines", "kotlin")
    
    // 省略了 type 属性，因为静态类型是 OwnedProject
    println(Json.encodeToString(data))
    // {"name":"kotlinx.coroutines","owner":"kotlin"}
}
//sampleEnd
```
{kotlin-runnable="true"}

您可以在序列化对象时显式指定基类型，以确保输出中包含 `type` 属性。
为此，请将基类型作为类型实参传递给 `encodeToString()` 函数：

```kotlin
// 从序列化库导入声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*

@Serializable
sealed class Project {
    abstract val name: String
}

@Serializable
class OwnedProject(override val name: String, val owner: String) : Project()

//sampleStart
fun main() {
    // 推断出的静态类型为 OwnedProject
    val data = OwnedProject("kotlinx.coroutines", "kotlin")

    // 显式指定基类型以利用多态
    println(Json.encodeToString<Project>(data))
    // {"type":"OwnedProject","name":"kotlinx.coroutines","owner":"kotlin"}
}
//sampleEnd
```
{kotlin-runnable="true"}

## 为子类定义自定义序列化名称 {id="define-custom-serial-names-for-subclasses"}

默认情况下，在封闭和开放多态层次结构中，Kotlin 序列化都会使用完全限定类名作为多态子类的类鉴别器值。
如果您重构该类，此值可能会发生变化。

若要保持类鉴别器值稳定，请使用 [`@SerialName`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-serial-name/) 注解定义自定义序列化名称。

> 每个可序列化类都必须具有唯一的 `@SerialName`。
> 请勿在不同的类中复用相同的名称，即使跨独立的继承层次结构也是如此。
> 
> 如果在同一个继承层次结构内复用相同名称，编码或解码函数将抛出 `IllegalStateException`。
> 跨独立层次结构复用相同名称可能会导致难以察觉的序列化问题。
>
{style="warning"}

使用 `@SerialName` 为子类定义一个不依赖于其源代码的稳定标识符：

```kotlin
// 从序列化库导入声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
sealed class Project {
    abstract val name: String
}

// 为子类分配自定义序列化名称
@Serializable
@SerialName("owned")
class OwnedProject(override val name: String, val owner: String) : Project()

fun main() {
    val data: Project = OwnedProject("kotlinx.coroutines", "kotlin")
    println(Json.encodeToString(data))
    // {"type":"owned","name":"kotlinx.coroutines","owner":"kotlin"}
}
//sampleEnd
```
{kotlin-runnable="true"}

## 带支持字段的基类属性 {id="base-class-properties-with-backing-fields"}

在多态类层次结构中，基类可以定义带支持字段的属性，这些属性会与子类属性一起被序列化，例如：

```kotlin
// 从序列化库导入声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
sealed class Project {
    abstract val name: String
    var status = "open"
}
            
@Serializable   
@SerialName("owned")
class OwnedProject(override val name: String, val owner: String) : Project()

fun main() {
    // 配置 Json 实例以编码默认值
    val json = Json { encodeDefaults = true }

    val data: Project = OwnedProject("kotlinx.coroutines", "kotlin")
    // 将基类属性与子类属性一起序列化
    println(json.encodeToString(data))
    // {"type":"owned","status":"open","name":"kotlinx.coroutines","owner":"kotlin"}
}
//sampleEnd
```
{kotlin-runnable="true"}

## 序列化多态类层次结构中的对象 {id="serialize-objects-in-polymorphic-class-hierarchies"}

多态类层次结构可以包含单例对象（object）作为子类。
在序列化期间，对象会被视为类似于不带属性的类，并且默认情况下其类名用作 `type` 属性的值。

若要将这些对象包含在序列化中，请使用 `@Serializable` 对其进行注解：

```kotlin
// 从序列化库导入声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// 定义 sealed 基类
@Serializable
sealed class Response

// 定义 object 子类
@Serializable
object EmptyResponse : Response()

// 定义继承 Response 的类
@Serializable   
class TextResponse(val text: String) : Response()

// 序列化包含不同子类的列表
fun main() {
    val list = listOf(EmptyResponse, TextResponse("OK"))
    println(Json.encodeToString(list))
    // [{"type":"EmptyResponse"},{"type":"TextResponse","text":"OK"}]
}
//sampleEnd
```
{kotlin-runnable="true"}

## 序列化开放多态类 {id="serialize-open-polymorphic-classes"}

Kotlin 序列化支持 `open` 和 `abstract` 类以及接口的开放多态。
在这种模型中，子类可以定义在代码库中的任何位置，甚至可以在其他模块中。
由于编译器无法在编译时确定所有子类，因此必须显式指定它们。

当并非所有子类都在编译时已知时，请使用开放多态。
若要在运行时注册所有子类，必须在 [`SerializersModule`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.modules/-serializers-module/) 类中指定基类型和每个子类：

1. 使用 [`SerializersModule()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.modules/-serializers-module.html) 构建器函数创建 `SerializersModule`。
2. 在 `SerializersModule` 内部，使用 [`polymorphic()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.modules/polymorphic.html) 函数指定基类型。
3. 在 `polymorphic()` 块内，使用 [`subclass()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.modules/subclass.html) 函数*注册*各个子类。
   注册子类会将其添加到与基类型关联的子类集中，从而使其可用于多态序列化与反序列化。

4. 使用 `serializersModule` 属性将 `SerializersModule` 添加到 `Json` 实例中。
5. （可选）使用 `@SerialName` 注解为子类定义稳定标识符，而不是使用其完全限定类名。

若要包含 `type` 属性，请使用基类型作为静态类型，例如：

```kotlin 
// 从序列化库导入声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlinx.serialization.modules.*

//sampleStart
// 定义 SerializersModule
val module = SerializersModule {

    // 指定 Project 作为基类型
    polymorphic(Project::class) {

        // 将 OwnedProject 注册为 Project 的子类
        subclass(OwnedProject::class)
    }
}

// 将 SerializersModule 添加到 Json 实例
val format = Json { serializersModule = module }

// 定义在序列化期间用作静态类型的基类型
@Serializable
abstract class Project {
    abstract val name: String
}

// 定义 Project 的可序列化子类
@Serializable
@SerialName("owned")
class OwnedProject(override val name: String, val owner: String) : Project()

fun main() {
    // 使用 Project 作为静态类型以利用多态
    val data: Project = OwnedProject("kotlinx.coroutines", "kotlin")

    println(format.encodeToString(data))
    // {"type":"owned","name":"kotlinx.coroutines","owner":"kotlin"}
}
//sampleEnd
```
{kotlin-runnable="true"}

此配置会生成与[序列化封闭多态类](#serialize-closed-polymorphic-classes)部分中的示例相同的 JSON 结构，但它支持 `open` 和 `abstract` 类。

> 由于 `serializer()` 函数的限制，此示例仅适用于 JVM。
> 在 Kotlin/JS 和 Kotlin/Native 中，请使用显式序列化器：`format.encodeToString(PolymorphicSerializer(Project::class), data)`。
> 
> 您可以在 [GitHub](https://github.com/Kotlin/kotlinx.serialization/issues/1077) 上跟进此问题。
>
{style="note"}

### 在开放多态层次结构中序列化接口 {id="serialize-interfaces-in-open-polymorphic-hierarchies"}

您不能使用 `@Serializable` 注解接口。Kotlin 序列化将接口视为多态的，默认使用 [`PolymorphicSerializer`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-polymorphic-serializer/) 作为其序列化器。

若要在开放多态序列化中使用接口作为基类型，请使用 `@Serializable` 标记实现该接口的类，并在 `SerializersModule` 中注册它们：

```kotlin 
// 从序列化库导入声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlinx.serialization.modules.*

//sampleStart
// 定义 SerializersModule
val module = SerializersModule {
    polymorphic(Project::class) {
        subclass(OwnedProject::class)
    }
}

val format = Json { serializersModule = module }

// 定义用于多态序列化的接口
interface Project {
    val name: String
}

// OwnedProject 实现了 Project 接口 
@Serializable
@SerialName("owned")
class OwnedProject(override val name: String, val owner: String) : Project

fun main() {
    // 使用该接口进行序列化
    val data: Project = OwnedProject("kotlinx.coroutines", "kotlin")
    println(format.encodeToString(data))
    // {"type":"owned","name":"kotlinx.coroutines","owner":"kotlin"}
}
//sampleEnd
```
{kotlin-runnable="true"}

> 在 Kotlin/JS 和 Kotlin/Native 中，由于平台有限的反射功能，您必须显式指定序列化器：
> `format.encodeToString(PolymorphicSerializer(Project::class), data)`。
>
{style="note"}

您还可以将接口用作可序列化类中的属性。
在这种情况下，Kotlin 序列化也会对该属性应用 `PolymorphicSerializer`：

```kotlin
// 从序列化库导入声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlinx.serialization.modules.*

val module = SerializersModule {
    polymorphic(Project::class) {
        subclass(OwnedProject::class)
    }
}

val format = Json { serializersModule = module }

//sampleStart
interface Project {
    val name: String
}

@Serializable
@SerialName("owned")
class OwnedProject(override val name: String, val owner: String) : Project

// 定义包含接口属性的可序列化类
@Serializable
class Data(val project: Project)

fun main() {
    val data = Data(OwnedProject("kotlinx.coroutines", "kotlin"))
    println(format.encodeToString(data))
    // {"project":{"type":"owned","name":"kotlinx.coroutines","owner":"kotlin"}}
}
//sampleEnd
```
{kotlin-runnable="true"}

### 选择多态层次结构的基类型 {id="select-the-base-type-of-a-polymorphic-hierarchy"}

Kotlin 序列化是完全静态的。它在编译时确定多态层次结构的基类型。
您可以选择任何基类型（包括 `Any`），只要对其进行了显式配置即可。

为此：

1. 在 `SerializersModule` 中指定基类型及其子类。
2. 如果基类型没有自己的序列化器，请在调用 [`encodeToString()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json/encode-to-string.html) 函数时为该类型传递 `PolymorphicSerializer`。

示例如下：

```kotlin
// 从序列化库导入声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlinx.serialization.modules.*

//sampleStart
val module = SerializersModule {
    // 为 Any 基类型注册 OwnedProject
    polymorphic(Any::class) {
        subclass(OwnedProject::class)
    }
}

val format = Json { serializersModule = module }

@Serializable
abstract class Project {
    abstract val name: String
}

@Serializable
@SerialName("owned")
class OwnedProject(override val name: String, val owner: String) : Project()

fun main() {
    // 使用 Any 作为静态类型
    val data: Any = OwnedProject("kotlinx.coroutines", "kotlin")

    // 为 Any 基类型指定 PolymorphicSerializer
    println(format.encodeToString(PolymorphicSerializer(Any::class), data))
    // {"type":"owned","name":"kotlinx.coroutines","owner":"kotlin"}
}
//sampleEnd
```
{kotlin-runnable="true"}

如果未提供 `PolymorphicSerializer`，则会抛出以下异常：

```text
Exception in thread "main" kotlinx.serialization.SerializationException: Serializer for class 'Any' is not found.
Please ensure that class is marked as '@Serializable' and that the serialization compiler plugin is applied.
```

只要为每个基类型显式注册该子类，您也可以为同一个子类使用多个基类型。

为了避免对每个基类型重复调用 `subclass()`，您可以定义一个注册子类的帮助程序函数，并在每个 `polymorphic()` 块中使用它。

以下是同时使用 `Project` 和 `BaseProject` 作为基类型的示例：

```kotlin
// 从序列化库导入声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlinx.serialization.modules.*

//sampleStart
val module = SerializersModule {
    // 定义注册子类的帮助程序函数
    fun PolymorphicModuleBuilder<Project>.registerProjectSubclasses() {
        subclass(OwnedProject::class)
    }

    // 为每个基类型 Project 和 BaseProject 注册相同的子类
    polymorphic(BaseProject::class) { registerProjectSubclasses() }
    polymorphic(Project::class) { registerProjectSubclasses() }
}
//sampleEnd

val format = Json { serializersModule = module }

interface BaseProject {
    val name: String
}

interface Project : BaseProject

@Serializable
@SerialName("owned")
class OwnedProject(override val name: String, val owner: String) : Project

@Serializable
class Data(
    val project: Project,
    val baseProject: BaseProject
)

fun main() {
    val project = OwnedProject("kotlinx.coroutines", "kotlin")
    val data = Data(project, project)
    println(format.encodeToString(data))
    // {"project":{"type":"owned","name":"kotlinx.coroutines","owner":"kotlin"},"baseProject":{"type":"owned","name":"kotlinx.coroutines","owner":"kotlin"}}
}
```
{kotlin-runnable="true"}

### 多态序列化属性 {id="serialize-properties-polymorphically"}

接口和抽象类默认使用多态序列化。

若要序列化具有不可序列化类型（例如 `Any`）的属性，或者当属性的类型为 `open` 类时，请使用 [`@Polymorphic`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-polymorphic/) 注解该属性。

这将把 `PolymorphicSerializer` 应用于该属性。

示例如下：

```kotlin
// 从序列化库导入声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlinx.serialization.modules.*

val module = SerializersModule {
    polymorphic(Any::class) {
        subclass(OwnedProject::class)
    }
}

val format = Json { serializersModule = module }

interface Project {
    val name: String
}

@Serializable
@SerialName("owned")
class OwnedProject(override val name: String, val owner: String) : Project

//sampleStart
@Serializable
class Data(
    // 将 PolymorphicSerializer 应用于该属性
    @Polymorphic
    val project: Any 
)

fun main() {
    val data = Data(OwnedProject("kotlinx.coroutines", "kotlin"))
    println(format.encodeToString(data))
    // {"project":{"type":"owned","name":"kotlinx.coroutines","owner":"kotlin"}}
}
//sampleEnd
```
{kotlin-runnable="true"}

### 多态序列化 open 类 {id="serialize-open-classes-polymorphically"}

若要多态序列化 `open` 类，请同时使用 `@Serializable` 和 `@Polymorphic` 对其进行注解：

```kotlin
// 从序列化库导入声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlinx.serialization.modules.*

val module = SerializersModule {
    polymorphic(Project::class) {
        subclass(OwnedProject::class)
    }
}

val format = Json { serializersModule = module }

//sampleStart
// 将 PolymorphicSerializer 应用于 open 类
@Serializable
@Polymorphic
open class Project

@Serializable
@SerialName("owned")
class OwnedProject(val name: String, val owner: String) : Project()

@Serializable
class Data(val project: Project)

fun main() {
    val project = OwnedProject("kotlinx.coroutines", "kotlin")

    val data = Data(project)
    println(format.encodeToString(data))
    // {"project":{"type":"owned","name":"kotlinx.coroutines","owner":"kotlin"}}
}
//sampleEnd
```
{kotlin-runnable="true"}

### 注册 sealed 类或接口的实现 {id="register-implementations-of-a-sealed-class-or-interface"}
<primary-label ref="experimental-opt-in"/>

您可以在同一层次结构中结合使用开放多态与封闭多态，例如当层次结构的根是 `interface` 且各个子层次结构表示为 sealed 类时。
可以使用 [`subclassesOfSealed()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.modules/-polymorphic-module-builder/subclasses-of-sealed.html) 函数一次性注册 sealed 类或接口的所有实现，而无需单独注册每个 sealed 子类。

当子类本身也是 sealed 可序列化类时，此函数还会递归注册子类。
该 sealed 类或接口的所有子类必须是具体类或 sealed 类。否则将抛出 `IllegalArgumentException`。

示例如下：

```kotlin
@file:OptIn(ExperimentalSerializationApi::class)

// 从序列化库导入声明
import kotlinx.serialization.* 
import kotlinx.serialization.json.*
import kotlinx.serialization.modules.*

interface Base

@Serializable
sealed interface Sub: Base

@Serializable
class Sub1(val data: String): Sub

val module1 = SerializersModule {
    polymorphic(Base::class) {
        subclassesOfSealed(Sub.serializer())
    }
}

val format1 = Json { serializersModule = module1 }

val module2 = SerializersModule {
    polymorphic(Base::class) {
        // 使用 subclassesOfSealed() 的具化版本指定相同的 sealed 类型
        subclassesOfSealed<Sub>()
    }
}

val format2 = Json { serializersModule = module2 }

fun main() {
    val data: Base = Sub1("kotlin")
    println(format1.encodeToString(data))
    // {"type":"Sub1","data":"kotlin"}

    println(format2.encodeToString(data))
    // {"type":"Sub1","data":"kotlin"}
}
```
<!--{kotlin-runnable="true"} -->

### 在多态层次结构中序列化泛型子类型 {id="serialize-generic-subtypes-in-a-polymorphic-hierarchy"}

Kotlin 序列化无法在运行时自动确定泛型类型形参的具体类型。
因此，若无显式配置，它无法为该形参选取序列化器。

若要为泛型多态子类型提供此类配置，请在 `SerializersModule` 中使用显式序列化器注册该子类型。
`PolymorphicSerializer(Any::class)` 具有最宽的作用域，但当您知道泛型值可以具有哪些具体类型时，可以使用更具体的序列化器。

> Sealed 基类型不需要此配置，因为当基类型为其类型实参提供序列化器时，编译器插件可以推断子类型序列化器。
> 
{style="note"}

示例如下：

```kotlin 
// 从序列化库导入声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlinx.serialization.modules.*

//sampleStart
@Serializable
abstract class Response<out T>

// 定义泛型多态子类型
@Serializable
@SerialName("OkResponse")
data class OkResponse<out T>(val data: T) : Response<T>()

@Serializable
abstract class Project {
    abstract val name: String
}

// 定义用作泛型值的子类型
@Serializable
@SerialName("OwnedProject")
data class OwnedProject(override val name: String, val owner: String) : Project()

// 为包含泛型子类型的多态层次结构定义序列化器
val responseModule = SerializersModule {
    polymorphic(Response::class) {
        // 注册泛型子类型，
        // 并附带指定 PolymorphicSerializer 的序列化器
        subclass(OkResponse.serializer(PolymorphicSerializer(Any::class)))
    }
    polymorphic(Any::class) {
        // 注册用作泛型值的子类型
        subclass(OwnedProject::class)
    }
    polymorphic(Project::class) {
        // 为静态基类型注册相同的子类型
        subclass(OwnedProject::class)
    }
}

// 使用注册的序列化器创建 Json 实例
val format = Json { serializersModule = responseModule }

fun main() {
    // 使用带有具体子类型的泛型多态类型
    val data: Response<Project> = OkResponse(OwnedProject("kotlinx.serialization", "kotlin"))

    val jsonString = format.encodeToString(data)
    println(jsonString)
    // {"type":"OkResponse","data":{"type":"OwnedProject","name":"kotlinx.serialization","owner":"kotlin"}}
   
    val deserializedData = format.decodeFromString<Response<Project>>(jsonString)
    println(deserializedData)
    // OkResponse(data=OwnedProject(name=kotlinx.serialization, owner=kotlin))
}
//sampleEnd
```
{kotlin-runnable="true"}

在此示例中，`PolymorphicSerializer(Any::class)` 允许泛型子类型 `OkResponse` 与多态注册为 `Any` 子类型的任何值一起序列化。

### 合并多个 `SerializersModule` 实例 {id="merge-multiple-serializersmodule-instances"}

随着应用程序的增长并拆分为多个源代码模块，在单个 `SerializersModule` 中管理所有类层次结构可能会变得困难。

您可以使用 [`plus`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.modules/plus.html) 运算符来合并多个 `SerializersModule` 实例，从而允许它们在同一个 `Json` 格式实例中一起使用。

示例如下：

```kotlin
// 从序列化库导入声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlinx.serialization.modules.*

@Serializable
abstract class Response<out T>

@Serializable
data class OkResponse<out T>(val data: T) : Response<T>()

val responseModule = SerializersModule {
    polymorphic(Response::class) {
        subclass(OkResponse.serializer(PolymorphicSerializer(Any::class)))
    }
}

@Serializable
abstract class Project {
   abstract val name: String
}

@Serializable
data class OwnedProject(override val name: String, val owner: String) : Project()

val projectModule = SerializersModule {
    fun PolymorphicModuleBuilder<Project>.registerProjectSubclasses() {
        subclass(OwnedProject::class)
    }
    polymorphic(Any::class) { registerProjectSubclasses() }
    polymorphic(Project::class) { registerProjectSubclasses() }
}
//sampleStart
// 合并两个层次结构的 SerializersModule 实例
val format = Json { serializersModule = projectModule + responseModule }
//sampleEnd

fun main() {
    val data: Response<Project> = OkResponse(OwnedProject("kotlinx.serialization", "kotlin"))
    val string = format.encodeToString(data)
    println(string)
    // {"type":"OkResponse","data":{"type":"OwnedProject","name":"kotlinx.serialization","owner":"kotlin"}}

    println(format.decodeFromString<Response<Project>>(string))
    // OkResponse(data=OwnedProject(name=kotlinx.serialization, owner=kotlin))
}
```
{kotlin-runnable="true"}

若要在 `SerializersModule` 块内合并模块，请使用 [`include()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.modules/-serializers-module-builder/include.html) 函数：

```kotlin
// 使用 include() 合并多个 SerializersModule 实例
val combinedModule = SerializersModule {
    include(projectModule)
    include(responseModule)
}
```

> 如果公开库或共享模块的 `SerializersModule`，使用者可以将其与其自有的 `SerializersModule` 合并。
> 
{style="tip"}

### 使用默认反序列化器反序列化未知的多态子类型 {id="deserialize-unknown-polymorphic-subtypes-with-a-default-deserializer"}

在反序列化多态数据时，Kotlin 序列化会从 `type` 属性解析子类型。
如果该子类型未注册，反序列化将失败并抛出 `SerializationException`。

您可以定义一个默认反序列化器来处理未注册或未知的多态子类型。

让我们看下面的示例，其中 `Project` 是基类型，`OwnedProject` 是已注册的子类型，而 `BasicProject` 表示未知的项目子类型：

```kotlin
@Serializable
abstract class Project {
    abstract val name: String
}

// 表示未知的项目类型
@Serializable
data class BasicProject(override val name: String, val type: String): Project()

@Serializable
@SerialName("OwnedProject")
data class OwnedProject(override val name: String, val owner: String) : Project()
```

若要处理 `Project` 的未知多态子类型，请为基类型配置默认反序列化器。
在 `polymorphic()` 块中使用 [`defaultDeserializer()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.modules/-polymorphic-module-builder/default-deserializer.html) 函数为这些未注册的子类型定义回退方案：

```kotlin
val module = SerializersModule {
    polymorphic(Project::class) {
        subclass(OwnedProject::class)
        defaultDeserializer { BasicProject.serializer() }
    }
}
```

您可以使用此 `SerializersModule` 配置来反序列化已注册和未注册的子类型：

```kotlin
// 从序列化库导入声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlinx.serialization.modules.*

@Serializable
abstract class Project {
    abstract val name: String
}

// 表示未知的项目类型
@Serializable
data class BasicProject(override val name: String, val type: String): Project()

@Serializable
@SerialName("OwnedProject")
data class OwnedProject(override val name: String, val owner: String) : Project()

// 为未知的 Project 子类型注册默认反序列化器
val module = SerializersModule {
    polymorphic(Project::class) {
        subclass(OwnedProject::class)
        defaultDeserializer { BasicProject.serializer() }
    }
}

//sampleStart
val format = Json { serializersModule = module }

fun main() {
    // 反序列化已知和未知的 Project 子类型
    println(format.decodeFromString<List<Project>>("""
        [
            {"type":"unknown","name":"example"},
            {"type":"OwnedProject","name":"kotlinx.serialization","owner":"kotlin"} 
        ]
    """))
    // [BasicProject(name=example, type=unknown), OwnedProject(name=kotlinx.serialization, owner=kotlin)]
}
//sampleEnd
```
{kotlin-runnable="true"}

在此示例中，反序列化并不依赖 `type` 字段来区分子类型，而是使用插件为 `BasicProject` 生成的序列化器。
这种方法假定未知子类型遵循已知的结构。

对于 JSON，当未知子类型包含额外属性但仍符合默认反序列化器所期望的结构时，您还可以将格式配置为[忽略未知键](serialization-json-configuration.md#ignore-unknown-keys)。
如果未知输入的结构各不相同，请改用[自定义序列化器](serialization-create-and-use-serializers.md#create-custom-serializers)。

> 有关在反序列化期间更灵活地处理 JSON 输入的信息，请参阅[修改 JSON 结构](serialization-transform-json.md#modify-json-structure)。
>
{style="tip"}

### 使用默认序列化器序列化多态类型 {id="serialize-polymorphic-types-with-a-default-serializer"}

您可以序列化多态基类型的值，而无需注册每个具体子类型。
当您无法访问完整的类型层次结构，或者该层次结构经常变动时，可以使用此方法。

为此：

1. 在 `SerializersModule` 块中使用 [`polymorphicDefaultSerializer()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.modules/-serializers-module-builder/polymorphic-default-serializer.html) 函数。
2. 在 `polymorphicDefaultSerializer()` 中指定一个 lambda，为运行时值返回 [`SerializationStrategy`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-serialization-strategy/)。

让我们看一个包含两个私有类 `CatImpl` 和 `DogImpl` 的示例。
为了避免提升它们的可见性，请为 `Animal` 注册一个默认序列化器，该序列化器通过公共接口根据运行时类型选择序列化器：

```kotlin
interface Animal

interface Cat : Animal {
    val catType: String
}

interface Dog : Animal {
    val dogType: String
}

private class CatImpl : Cat {
    override val catType: String = "Tabby"
}

private class DogImpl : Dog {
    override val dogType: String = "Husky"
}

object AnimalProvider {
    fun createCat(): Cat = CatImpl()
    fun createDog(): Dog = DogImpl()
}

// 为未知的 Animal 子类型注册默认序列化器
val module = SerializersModule {
    polymorphicDefaultSerializer(Animal::class) { instance ->
        @Suppress("UNCHECKED_CAST")
        // 使用 when 块确定相应的序列化器
        when (instance) {
            is Cat -> CatSerializer as SerializationStrategy<Animal>
            is Dog -> DogSerializer as SerializationStrategy<Animal>
            else -> null
        }
    }
}
```

为 `Cat` 和 `Dog` 定义序列化器，然后创建一个使用该 `SerializersModule`（通过 `serializersModule` 属性）的 `Json` 实例，以启用 `Animal` 值的多态序列化：

```kotlin
// 从序列化库导入声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.encoding.*
import kotlinx.serialization.modules.*

interface Animal

interface Cat : Animal {
    val catType: String
}

interface Dog : Animal {
    val dogType: String
}

private class CatImpl : Cat {
    override val catType: String = "Tabby"
}

private class DogImpl : Dog {
    override val dogType: String = "Husky"
}

object AnimalProvider {
    fun createCat(): Cat = CatImpl()
    fun createDog(): Dog = DogImpl()
}

// 为未知的 Animal 子类型注册默认序列化器
val module = SerializersModule {
    polymorphicDefaultSerializer(Animal::class) { instance ->
        @Suppress("UNCHECKED_CAST")
        // 根据运行时值使用 when 块确定相应的序列化器
        when (instance) {
            is Cat -> CatSerializer as SerializationStrategy<Animal>
            is Dog -> DogSerializer as SerializationStrategy<Animal>
            else -> null
        }
    }
}

//sampleStart
// 定义自定义序列化器
object CatSerializer : SerializationStrategy<Cat> {
    override val descriptor = buildClassSerialDescriptor("Cat") {
        element<String>("catType")
    }

    override fun serialize(encoder: Encoder, value: Cat) {
        encoder.encodeStructure(descriptor) {
            encodeStringElement(descriptor, 0, value.catType)
        }
    }
}

object DogSerializer : SerializationStrategy<Dog> {
    override val descriptor = buildClassSerialDescriptor("Dog") {
        element<String>("dogType")
    }

    override fun serialize(encoder: Encoder, value: Dog) {
        encoder.encodeStructure(descriptor) {
            encodeStringElement(descriptor, 0, value.dogType)
        }
    }
}

val format = Json { serializersModule = module }

fun main() {
    // 序列化 Cat 实例
    println(format.encodeToString<Animal>(AnimalProvider.createCat()))
    // {"type":"Cat","catType":"Tabby"}
}
//sampleEnd
```
{kotlin-runnable="true"}

## 后续步骤 {id="what-s-next"}

* 在[创建与使用序列化器](serialization-create-and-use-serializers.md)中了解如何获取生成的序列化器、创建自定义序列化器以及应用序列化器。