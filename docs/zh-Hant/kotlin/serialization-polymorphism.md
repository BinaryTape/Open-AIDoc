[//]: # (title: 序列化多型類別)

多型允許透過共用介面或基底類別來操作不同型別的物件。
Kotlin serialization 支援子型別多型，允許透過宣告的共用超型別（supertype）來序列化不同的型別。

如需概覽介面與繼承在 Kotlin 中的運作方式，請參閱[介面](interfaces.md)與[繼承](inheritance.md)。

Kotlin serialization 預設為*靜態（static）*。
它使用序列化數值的*靜態型別*（即變數宣告的型別）來決定要編碼哪些屬性。

這意味著即使該數值在執行時期是子類別的執行個體，也只會序列化在該靜態型別中定義的屬性。

以下是使用多型類別階層的範例：

```kotlin
// 從序列化程式庫匯入宣告
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
open class Project(val name: String)

class OwnedProject(name: String, val owner: String) : Project(name)

fun main() {
    // 使用 Project 作為宣告的靜態型別
    val data: Project = OwnedProject("kotlinx.coroutines", "kotlin")

    // 僅序列化靜態型別中定義的屬性
    println(Json.encodeToString(data))
    // {"name":"kotlinx.coroutines"}
}
//sampleEnd
```
{kotlin-runnable="true"}

在此範例中，即使執行時期的數值是 `OwnedProject` 子類別，也只有宣告的 `Project` 靜態型別之屬性會被序列化。

若要序列化多型類別階層結構中的數值，Kotlin serialization 提供了兩種方式：

* [封閉多型（Closed polymorphism）](#serialize-closed-polymorphic-classes)：使用 `sealed` 基底類別或介面，確保所有子類別在編譯期均為已知。
* [開放多型（Open polymorphism）](#serialize-open-polymorphic-classes)：為 `open` 或 `abstract` 基底類別明確指定子類別。

## 序列化封閉多型類別 {id="serialize-closed-polymorphic-classes"}

當所有可能的子類別保證在編譯期均已知時，該類別階層即被視為使用封閉多型。

為了提供此保證，請[使用 `sealed class` 或 `sealed interface`](sealed-classes.md) 作為基底型別。
將其標記為 `@Serializable`，並將所有子類別也標記為 `@Serializable`：

```kotlin
// 從序列化程式庫匯入宣告
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// 定義 sealed class 作為基底型別
@Serializable
sealed class Project {
    abstract val name: String
}

// 將子類別標記為可序列化
@Serializable
class OwnedProject(override val name: String, val owner: String) : Project()

// 使用基底型別作為靜態型別來序列化資料
fun main() {
    // 使用基底型別作為靜態型別
    val data: Project = OwnedProject("kotlinx.coroutines", "kotlin")

    // 會加入一個 type 屬性來識別序列化的子類別
    println(Json.encodeToString(data))
    // {"type":"OwnedProject","name":"kotlinx.coroutines","owner":"kotlin"}
}
//sampleEnd
```
{kotlin-runnable="true"}

預設情況下，JSON 輸出中的 `type` 屬性會作為類別鑑別器（class discriminator），用於識別序列化的子類別。
僅當序列化期間使用基底類別作為靜態型別時，才會包含此屬性。

> 您也可以設定 JSON 對類別鑑別器使用不同的鍵名稱。
> 如需更多資訊，請參閱[為多型指定類別鑑別器](serialization-json-configuration.md#specify-class-discriminator-for-polymorphism)一節。
>
{style="tip"}

以下是將子類別作為靜態型別因而省略 `type` 屬性的範例：

```kotlin
// 從序列化程式庫匯入宣告
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
    // 推論的靜態型別為 OwnedProject
    val data = OwnedProject("kotlinx.coroutines", "kotlin")
    
    // 由於靜態型別為 OwnedProject，因此省略了 type 屬性
    println(Json.encodeToString(data))
    // {"name":"kotlinx.coroutines","owner":"kotlin"}
}
//sampleEnd
```
{kotlin-runnable="true"}

您可以在序列化物件時明確指定基底型別，以確保輸出中包含 `type` 屬性。
為此，請將基底型別作為型別引數傳遞給 `encodeToString()` 函式：

```kotlin
// 從序列化程式庫匯入宣告
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
    // 推論的靜態型別為 OwnedProject
    val data = OwnedProject("kotlinx.coroutines", "kotlin")

    // 明確指定基底型別以利用多型特性
    println(Json.encodeToString<Project>(data))
    // {"type":"OwnedProject","name":"kotlinx.coroutines","owner":"kotlin"}
}
//sampleEnd
```
{kotlin-runnable="true"}

## 為子類別定義自訂序列名稱 {id="define-custom-serial-names-for-subclasses"}

預設情況下，無論在封閉還是開放多型階層中，Kotlin serialization 都會使用完全限定類名作為多型子類別的類別鑑別器值。
如果您重構類別，該值可能會改變。

為了保持類別鑑別器值的穩定，請使用 [`@SerialName`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-serial-name/) 註解定義自訂序列名稱（serial name）。

> 每個可序列化類別都必須擁有唯一的 `@SerialName`。
> 請勿在不同類別中重複使用相同名稱，即使是在各自獨立的多型階層中也是如此。
> 
> 如果在同一個階層中重複使用相同的名稱，編碼或解碼函式將擲出 `IllegalStateException`。
> 在不同階層間重複使用相同名稱也可能會導致難以察覺的序列化問題。
>
{style="warning"}

使用 `@SerialName` 為子類別定義不依賴原始碼的穩定識別碼：

```kotlin
// 從序列化程式庫匯入宣告
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
sealed class Project {
    abstract val name: String
}

// 為子類別指派自訂序列名稱
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

## 具有支援欄位的基底類別屬性 {id="base-class-properties-with-backing-fields"}

在多型類別階層中，基底類別可以定義具有支援欄位的屬性，這些屬性會與子類別屬性一起被序列化，例如：

```kotlin
// 從序列化程式庫匯入宣告
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
    // 設定 Json 執行個體以編碼預設值
    val json = Json { encodeDefaults = true }

    val data: Project = OwnedProject("kotlinx.coroutines", "kotlin")
    // 將基底類別屬性與子類別屬性一起序列化
    println(json.encodeToString(data))
    // {"type":"owned","status":"open","name":"kotlinx.coroutines","owner":"kotlin"}
}
//sampleEnd
```
{kotlin-runnable="true"}

## 在多型類別階層中序列化 object {id="serialize-objects-in-polymorphic-class-hierarchies"}

多型類別階層可以包含 `object` 作為子類別。
在序列化期間，`object` 的處理方式與沒有屬性的類別類似，預設使用其類別名稱作為 `type` 屬性的值。

若要在序列化中包含這些物件，請使用 `@Serializable` 註解標記它們：

```kotlin
// 從序列化程式庫匯入宣告
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// 定義 sealed 基底類別
@Serializable
sealed class Response

// 定義 object 子類別
@Serializable
object EmptyResponse : Response()

// 定義繼承 Response 的類別
@Serializable   
class TextResponse(val text: String) : Response()

// 序列化包含不同子類別的清單
fun main() {
    val list = listOf(EmptyResponse, TextResponse("OK"))
    println(Json.encodeToString(list))
    // [{"type":"EmptyResponse"},{"type":"TextResponse","text":"OK"}]
}
//sampleEnd
```
{kotlin-runnable="true"}

## 序列化開放多型類別 {id="serialize-open-polymorphic-classes"}

Kotlin serialization 支援 `open` 與 `abstract` 類別及介面的開放多型。
在此模型中，子類別可以定義在程式碼庫的任何位置，甚至是其他模組中。
由於編譯器無法在編譯期確定所有子類別，因此您必須明確指定它們。

當並非所有子類別在編譯期皆為已知時，請使用開放多型。
若要在執行時期註冊所有子類別，您必須在 [`SerializersModule`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.modules/-serializers-module/) 類別中指定基底型別與每個子類別：

1. 使用 [`SerializersModule()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.modules/-serializers-module.html) 建構函式建立 `SerializersModule`。
2. 在 `SerializersModule` 內部，使用 [`polymorphic()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.modules/polymorphic.html) 函式指定基底型別。
3. 在 `polymorphic()` 區塊內部，使用 [`subclass()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.modules/subclass.html) 函式*註冊*各個子類別。
   註冊子類別會將其新增至與該基底型別關聯的子類別集合中，使其可用於多型序列化與還原序列化。

4. 透過 `serializersModule` 屬性將 `SerializersModule` 新增至 `Json` 執行個體。
5. （選用）使用 `@SerialName` 註解為子類別定義穩定的識別碼，而非使用其完全限定類名。

若要包含 `type` 屬性，請使用基底型別作為靜態型別，例如：

```kotlin 
// 從序列化程式庫匯入宣告
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlinx.serialization.modules.*

//sampleStart
// 定義 SerializersModule
val module = SerializersModule {

    // 指定 Project 作為基底型別
    polymorphic(Project::class) {

        // 註冊 OwnedProject 作為 Project 的子類別
        subclass(OwnedProject::class)
    }
}

// 將 SerializersModule 加入 Json 執行個體
val format = Json { serializersModule = module }

// 定義在序列化期間用作靜態型別的基底型別
@Serializable
abstract class Project {
    abstract val name: String
}

// 定義 Project 的可序列化子類別
@Serializable
@SerialName("owned")
class OwnedProject(override val name: String, val owner: String) : Project()

fun main() {
    // 使用 Project 作為靜態型別以利用多型特性
    val data: Project = OwnedProject("kotlinx.coroutines", "kotlin")

    println(format.encodeToString(data))
    // {"type":"owned","name":"kotlinx.coroutines","owner":"kotlin"}
}
//sampleEnd
```
{kotlin-runnable="true"}

此配置產生的 JSON 結構與[序列化封閉多型類別](#serialize-closed-polymorphic-classes)一節中的範例相同，但它支援 `open` 與 `abstract` 類別。

> 由於 `serializer()` 函式的限制，此範例僅能在 JVM 上運作。
> 在 Kotlin/JS 與 Kotlin/Native 中，請使用明確的 serializer：`format.encodeToString(PolymorphicSerializer(Project::class), data)`。
> 
> 您可以在 [GitHub](https://github.com/Kotlin/kotlinx.serialization/issues/1077) 上追蹤此問題。
>
{style="note"}

### 在開放多型階層中序列化介面 {id="serialize-interfaces-in-open-polymorphic-hierarchies"}

您無法使用 `@Serializable` 標記介面。Kotlin serialization 將介面視為多型，預設使用 [`PolymorphicSerializer`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-polymorphic-serializer/) 作為其 serializer。

若要將介面作為開放多型序列化中的基底型別，請使用 `@Serializable` 標記實作該介面的類別，並將其註冊在 `SerializersModule` 中：

```kotlin 
// 從序列化程式庫匯入宣告
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlinx.serialization.modules.*

//sampleStart
// 定義 SerializersModule
val module = SerializersModule {
    polymorphic(Project::class) {
        subclass(OwnedProject::class)
    }
}

val format = Json { serializersModule = module }

// 定義用於多型序列化的介面
interface Project {
    val name: String
}

// OwnedProject 實作 Project 介面 
@Serializable
@SerialName("owned")
class OwnedProject(override val name: String, val owner: String) : Project

fun main() {
    // 使用介面進行序列化
    val data: Project = OwnedProject("kotlinx.coroutines", "kotlin")
    println(format.encodeToString(data))
    // {"type":"owned","name":"kotlinx.coroutines","owner":"kotlin"}
}
//sampleEnd
```
{kotlin-runnable="true"}

> 在 Kotlin/JS 與 Kotlin/Native 中，由於平台的反射功能受限，您必須明確指定 serializer：
> `format.encodeToString(PolymorphicSerializer(Project::class), data)`。
>
{style="note"}

您也可以在可序列化類別中使用介面作為屬性。
在此情況下，Kotlin serialization 也會將 `PolymorphicSerializer` 套用至該屬性：

```kotlin
// 從序列化程式庫匯入宣告
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

// 定義帶有介面屬性的可序列化類別
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

### 選取多型階層的基底型別 {id="select-the-base-type-of-a-polymorphic-hierarchy"}

Kotlin serialization 完全是靜態的。它會在編譯期決定多型階層的基底型別。
只要進行明確設定，您可以選取任何基底型別，包括 `Any`。

操作步驟如下：

1. 在 `SerializersModule` 中指定基底型別及其子類別。
2. 若基底型別沒有自己的 serializer，請在呼叫 [`encodeToString()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json/encode-to-string.html) 函式時傳遞該型別的 `PolymorphicSerializer`。

以下是範例：

```kotlin
// 從序列化程式庫匯入宣告
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlinx.serialization.modules.*

//sampleStart
val module = SerializersModule {
    // 為 Any 基底型別註冊 OwnedProject
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
    // 使用 Any 作為靜態型別
    val data: Any = OwnedProject("kotlinx.coroutines", "kotlin")

    // 為 Any 基底型別指定 PolymorphicSerializer
    println(format.encodeToString(PolymorphicSerializer(Any::class), data))
    // {"type":"owned","name":"kotlinx.coroutines","owner":"kotlin"}
}
//sampleEnd
```
{kotlin-runnable="true"}

如果您未提供 `PolymorphicSerializer`，將擲出以下例外：

```text
Exception in thread "main" kotlinx.serialization.SerializationException: Serializer for class 'Any' is not found.
Please ensure that class is marked as '@Serializable' and that the serialization compiler plugin is applied.
```

您也可以為同一個子類別使用多個基底型別，前提是必須為每個基底型別明確註冊該子類別。

為避免對每個基底型別重複呼叫 `subclass()`，您可以定義一個用於註冊子類別的協助程式函式，並在每個 `polymorphic()` 區塊中使用它。

以下是同時使用 `Project` 與 `BaseProject` 作為基底型別的範例：

```kotlin
// 從序列化程式庫匯入宣告
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlinx.serialization.modules.*

//sampleStart
val module = SerializersModule {
    // 定義用於註冊子類別的協助程式函式
    fun PolymorphicModuleBuilder<Project>.registerProjectSubclasses() {
        subclass(OwnedProject::class)
    }

    // 為基底型別 Project 與 BaseProject 各自註冊相同的子類別
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

### 多型序列化屬性 {id="serialize-properties-polymorphically"}

介面與抽象類別預設使用多型序列化。

若要序列化具有不可序列化型別（例如 `Any`）的屬性，
或者當屬性的型別是 `open` 類別時，請使用 [`@Polymorphic`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-polymorphic/) 註解標記該屬性。

這會將 `PolymorphicSerializer` 套用至該屬性。

以下是範例：

```kotlin
// 從序列化程式庫匯入宣告
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
    // 將 PolymorphicSerializer 套用至該屬性
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

### 多型序列化 open 類別 {id="serialize-open-classes-polymorphically"}

若要對 `open` 類別進行多型序列化，請同時使用 `@Serializable` 與 `@Polymorphic` 註解標記它：

```kotlin
// 從序列化程式庫匯入宣告
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
// 將 PolymorphicSerializer 套用至 open 類別
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

### 註冊 sealed 類別或介面的實作 {id="register-implementations-of-a-sealed-class-or-interface"}
<primary-label ref="experimental-opt-in"/>

您可以在同一個階層中結合開放多型與封閉多型，例如階層的根是 `interface`，而各個子階層則表示為 sealed 類別。
您可以使用 [`subclassesOfSealed()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.modules/-polymorphic-module-builder/subclasses-of-sealed.html) 函式一次註冊 sealed 類別或介面的所有實作，而無需個別註冊每個 sealed 子類別。

當子類別本身也是 sealed 可序列化類別時，此函式還會遞迴註冊子類別。
該 sealed 類別或介面的所有子類別必須是具體類別或 sealed 類別，否則將擲出 `IllegalArgumentException`。

以下是範例：

```kotlin
@file:OptIn(ExperimentalSerializationApi::class)

// 從序列化程式庫匯入宣告
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
        // 使用 subclassesOfSealed() 的具現化版本來指定相同的 sealed 型別
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

### 在多型階層中序列化泛型子型別 {id="serialize-generic-subtypes-in-a-polymorphic-hierarchy"}

Kotlin serialization 無法在執行時期自動判斷泛型型別參數的具體型別。
因此，若未經明確設定，它無法為該參數選取 serializer。

若要為泛型多型子型別提供此設定，請使用明確的 serializer 在 `SerializersModule` 中註冊該子型別。
`PolymorphicSerializer(Any::class)` 具有最廣泛的作用域，但當您確切知道泛型數值可能具有哪些具體型別時，可以使用更具體的 serializer。

> Sealed 基底型別不需要此設定，因為當基底型別為其型別引數提供 serializer 時，編譯器外掛程式即可推論子型別的 serializer。
> 
{style="note"}

以下是範例：

```kotlin 
// 從序列化程式庫匯入宣告
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlinx.serialization.modules.*

//sampleStart
@Serializable
abstract class Response<out T>

// 定義泛型多型子型別
@Serializable
@SerialName("OkResponse")
data class OkResponse<out T>(val data: T) : Response<T>()

@Serializable
abstract class Project {
    abstract val name: String
}

// 定義用作泛型值的子型別
@Serializable
@SerialName("OwnedProject")
data class OwnedProject(override val name: String, val owner: String) : Project()

// 為具有泛型子型別的多型階層定義 serializer
val responseModule = SerializersModule {
    polymorphic(Response::class) {
        // 註冊泛型子型別，
        // 並帶有指定 PolymorphicSerializer 的 serializer
        subclass(OkResponse.serializer(PolymorphicSerializer(Any::class)))
    }
    polymorphic(Any::class) {
        // 註冊用作泛型值的子型別
        subclass(OwnedProject::class)
    }
    polymorphic(Project::class) {
        // 為靜態基底型別註冊相同的子型別
        subclass(OwnedProject::class)
    }
}

// 建立具有已註冊 serializer 的 Json 執行個體
val format = Json { serializersModule = responseModule }

fun main() {
    // 搭配具體子型別使用泛型多型型別
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

在此範例中，`PolymorphicSerializer(Any::class)` 允許泛型子型別 `OkResponse` 與任何以多型方式註冊為 `Any` 子型別的數值一起序列化。

### 合併多個 `SerializersModule` 執行個體 {id="merge-multiple-serializersmodule-instances"}

隨著應用程式的增長並拆分為多個原始碼模組，在單一 `SerializersModule` 中管理所有類別階層可能會變得困難。

您可以使用 [`plus`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.modules/plus.html) 運算子合併多個 `SerializersModule` 執行個體，
從而使它們能夠在同一個 `Json` 格式執行個體中一起使用。

以下是範例：

```kotlin
// 從序列化程式庫匯入宣告
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
// 合併來自兩個階層的 SerializersModule 執行個體
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

若要在 `SerializersModule` 區塊內合併模組，請使用 [`include()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.modules/-serializers-module-builder/include.html) 函式：

```kotlin
// 使用 include() 合併多個 SerializersModule 執行個體
val combinedModule = SerializersModule {
    include(projectModule)
    include(responseModule)
}
```

> 如果您公開程式庫或共用模組的 `SerializersModule`，取用端即可將其與自己的 `SerializersModule` 合併。
> 
{style="tip"}

### 使用預設還原序列化程式還原序列化未知的多型子型別 {id="deserialize-unknown-polymorphic-subtypes-with-a-default-deserializer"}

在還原序列化多型資料時，Kotlin serialization 會從 `type` 屬性解析子型別。
如果該子型別尚未註冊，還原序列化將失敗並擲出 `SerializationException`。

您可以定義預設還原序列化程式（default deserializer）來處理未註冊或未知的多型子型別。

讓我們來看以下範例，其中 `Project` 是基底型別，`OwnedProject` 是已註冊的子型別，而 `BasicProject` 代表未知的專案子型別：

```kotlin
@Serializable
abstract class Project {
    abstract val name: String
}

// 代表未知的專案型別
@Serializable
data class BasicProject(override val name: String, val type: String): Project()

@Serializable
@SerialName("OwnedProject")
data class OwnedProject(override val name: String, val owner: String) : Project()
```

若要處理 `Project` 未知的多型子型別，請為該基底型別設定預設還原序列化程式。
在 `polymorphic()` 區塊中使用 [`defaultDeserializer()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.modules/-polymorphic-module-builder/default-deserializer.html) 函式，為這些未註冊的子型別定義備援：

```kotlin
val module = SerializersModule {
    polymorphic(Project::class) {
        subclass(OwnedProject::class)
        defaultDeserializer { BasicProject.serializer() }
    }
}
```

您可以使用此 `SerializersModule` 設定來還原序列化已註冊與未註冊的子型別：

```kotlin
// 從序列化程式庫匯入宣告
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlinx.serialization.modules.*

@Serializable
abstract class Project {
    abstract val name: String
}

// 代表未知的專案型別
@Serializable
data class BasicProject(override val name: String, val type: String): Project()

@Serializable
@SerialName("OwnedProject")
data class OwnedProject(override val name: String, val owner: String) : Project()

// 為未知的 Project 子型別註冊預設還原序列化程式
val module = SerializersModule {
    polymorphic(Project::class) {
        subclass(OwnedProject::class)
        defaultDeserializer { BasicProject.serializer() }
    }
}

//sampleStart
val format = Json { serializersModule = module }

fun main() {
    // 還原序列化已知與未知的 Project 子型別
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

在此範例中，還原序列化不依賴 `type` 欄位來區分子型別，而是使用外掛程式為 `BasicProject` 產生的 serializer。
此做法的前提是假設未知的子型別遵循已知的結構。

對於 JSON，如果未知的子型別包含額外屬性但仍符合預設還原序列化程式所預期的結構時，您也可以將格式設定為[忽略未知鍵（ignore unknown keys）](serialization-json-configuration.md#ignore-unknown-keys)。
若未知的輸入結構各不相同，請改用[自訂 serializer](serialization-create-and-use-serializers.md#create-custom-serializers)。

> 如需在還原序列化期間更靈活地處理 JSON 輸入，請參閱[修改 JSON 結構](serialization-transform-json.md#modify-json-structure)。
>
{style="tip"}

### 使用預設序列化程式序列化多型型別 {id="serialize-polymorphic-types-with-a-default-serializer"}

您可以序列化多型基底型別的數值，而無需註冊每一個具體子型別。
當您無法存取完整的型別階層，或型別階層變動頻繁時，可以使用此方法。

操作步驟如下：

1. 在 `SerializersModule` 區塊中使用 [`polymorphicDefaultSerializer()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.modules/-serializers-module-builder/polymorphic-default-serializer.html) 函式。
2. 在 `polymorphicDefaultSerializer()` 中指定一個 Lambda 運算式，為執行時期數值傳回一個 [`SerializationStrategy`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-serialization-strategy/)。

讓我們來看一個包含兩個 private 類別（`CatImpl` 與 `DogImpl`）的範例。
為了避免提高它們的可見性，請為 `Animal` 註冊一個預設序列化程式，透過公開介面依據執行時期型別選取 serializer：

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

// 為未知的 Animal 子型別註冊預設序列化程式
val module = SerializersModule {
    polymorphicDefaultSerializer(Animal::class) { instance ->
        @Suppress("UNCHECKED_CAST")
        // 使用 when 區塊判定合適的 serializer
        when (instance) {
            is Cat -> CatSerializer as SerializationStrategy<Animal>
            is Dog -> DogSerializer as SerializationStrategy<Animal>
            else -> null
        }
    }
}
```

為 `Cat` 與 `Dog` 定義 serializer，然後建立一個透過 `serializersModule` 屬性使用該 `SerializersModule` 的 `Json` 執行個體，以啟用 `Animal` 數值的多型序列化：

```kotlin
// 從序列化程式庫匯入宣告
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

// 為未知的 Animal 子型別註冊預設序列化程式
val module = SerializersModule {
    polymorphicDefaultSerializer(Animal::class) { instance ->
        @Suppress("UNCHECKED_CAST")
        // 根據執行時期數值使用 when 區塊判定合適的 serializer
        when (instance) {
            is Cat -> CatSerializer as SerializationStrategy<Animal>
            is Dog -> DogSerializer as SerializationStrategy<Animal>
            else -> null
        }
    }
}

//sampleStart
// 定義自訂 serializer
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
    // 序列化 Cat 的執行個體
    println(format.encodeToString<Animal>(AnimalProvider.createCat()))
    // {"type":"Cat","catType":"Tabby"}
}
//sampleEnd
```
{kotlin-runnable="true"}

## 下一步 {id="what-s-next"}

* 在[建立與使用 serializer](serialization-create-and-use-serializers.md) 中了解如何取得產生的 serializer、建立自訂 serializer 以及套用 serializer。