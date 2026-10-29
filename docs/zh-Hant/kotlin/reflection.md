[//]: # (title: 反射)
[//]: # (description: 了解 Kotlin 內建的反射支援，以及如何使用獨立的 kotlin-reflect 程式庫進行完整的執行時期反省。)

*反射*是一組語言和程式庫功能，可讓你在執行時期反省程式的結構。
例如，你可以讀取或更新屬性、呼叫函式，或是叫用類別建構函式來建立執行個體。當你在編譯時期不知道這些宣告時，這項功能非常有用。

反射提供了用於描述已編譯宣告的執行時期物件。例如，類別由 [`KClass`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-class/) 表示、型別由 [`KType`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-type/) 表示，而屬性或函式則由 [`KCallable`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-callable/) 的子型別表示。你可以檢查這些物件，並使用它們來存取值或叫用函式。

## 反射的運作方式 {id="how-reflection-works"}

[反射 API](https://kotlinlang.org/api/core/kotlin-reflect/) 透過 Kotlin 型別（例如 `KClass` 或 `KFunction`）來表示編譯後的宣告。
反射物件表示宣告本身，而非所宣告物件的值。例如，你可以使用 `KProperty` 來取得屬性的名稱並傳回其型別，而無需從物件中讀取該屬性。

Kotlin 在語言和標準函式庫中提供了一些基本功能，例如類別常值或[可呼叫參照](lambdas.md#callable-reference)。若要進行更廣泛的執行時期反省，請匯入 [`kotlin-reflect`](https://kotlinlang.org/api/core/kotlin-reflect/) 程式庫。

反射 API 包含以下套件：

* [`kotlin.reflect`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/) 是標準函式庫的一部分，包含核心反射型別與函式。
* [`kotlin.reflect.full`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/) 包含用於檢查 Kotlin 宣告的擴充功能。
* [`kotlin.reflect.jvm`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.jvm/) 包含連接 Kotlin 和 Java 反射的 JVM 專屬擴充功能。

> 各平台對反射的支援可能會有所不同。本頁面內容以 Kotlin/JVM 反射 API 為準。進一步了解 [Kotlin/JS 中的反射](js-reflection.md)。
> 
{style="note"}

### 與 Java 反射的互通性 {id="interoperability-with-java-reflection"}

在 JVM 上，`kotlin-reflect` 程式庫在 [`kotlin.reflect.jvm`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.jvm/) 套件中提供了擴充功能，用於在 Kotlin 和 Java 反射物件之間進行轉換。例如，你可以尋找實作 Kotlin 屬性 getter 的 Java 方法以及該屬性的支援欄位：

```kotlin
import kotlin.reflect.jvm.*

class User(val name: String)

fun main() {
    println(User::name.javaGetter)
    // public final java.lang.String User.getName()

    println(User::name.javaField)
    // private final java.lang.String User.name
}
```

Kotlin 屬性不一定總是有對應的 Java 欄位或 getter，因此當沒有相符的 Java 反射物件時，這兩個屬性都會傳回 `null`。

你也可以在 Kotlin `KClass` 和 Java `Class` 物件之間進行轉換。若要取得對應於 Java 類別的 Kotlin 類別，請使用 `.kotlin` 擴充屬性：

```kotlin
fun getKClass(o: Any): KClass<Any> = value.javaClass.kotlin
```

## 取得執行時期類別 {id="obtain-a-runtime-class"}

大多數反射操作都始於 [`KClass`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-class/)。取得方式取決於該類別在編譯時期是否已知：

* 使用 `ClassName::class` 來參照編譯時期已知的類別。
* 使用 `value::class` 來取得執行時期值的實際類別，該類別可能比其宣告的型別更為具體。

```kotlin
import kotlin.reflect.KClass

class User(val name: String)

open class Language
class Kotlin : Language()

fun main() {
    // 傳回表示 User 的 KClass。
    val userClass: KClass<User> = User::class
    println(userClass.simpleName)
    // User
    
    val language: Language = Kotlin()

    // 傳回表示該值在執行時期
    // 具體類別的 KClass
    val runtimeClass: KClass<out Language> = language::class
    println(runtimeClass.simpleName)
    // Kotlin
}
```
{kotlin-runnable="true"}

Kotlin 標準函式庫提供了用於檢查類別的基本工具。若要進行更廣泛的執行時期反省，請新增 `kotlin-reflect` 相依性並使用其 API。

## 新增 JVM 相依性 {id="add-the-jvm-dependency"}

在 JVM 平台上，Kotlin 編譯器發行版本將使用反射功能所需的執行時期元件作為獨立構件 `kotlin-reflect.jar` 提供。這使得不需要反射功能的應用程式可以排除此構件，從而縮小執行時期 classpath 的大小。

若要在 Gradle 或 Maven 專案中使用反射，請新增對 `kotlin-reflect` 的相依性：

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
dependencies {
    implementation(kotlin("reflect"))
}
```

</tab>
<tab title="Maven" group-key="maven">

```xml
<dependencies>
    <dependency>
        <groupId>org.jetbrains.kotlin</groupId>
        <artifactId>kotlin-reflect</artifactId>
        <version>${kotlin.version}</version>
    </dependency>
</dependencies>
```

</tab>
</tabs>

如果你不使用 Gradle 或 Maven，請確保專案的 classpath 中包含 `kotlin-reflect.jar`。命令列編譯器預設會新增此程式庫。若要從 classpath 中排除它，請使用 `-no-reflect` [編譯器選項](compiler-reference.md#compiler-options)。

## 檢查型別 {id="inspect-types"}

`KClass` 與 `KType` 代表不同的資訊。`KClass` 代表一個類別，但不保留型別引數或可 null 性。例如，`List<String>` 與 `List<Int>` 共用相同的 `List::class` 表示，而 `String` 與 `String?` 則共用 `String::class`。因此，請使用 [`typeOf<T>()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/type-of.html) 函式來取得靜態已知型別 `T` 的 `KType`，其中包含其型別引數和可 null 性。

在以下範例中，`classifier` 屬性將型別連接到其類別或型別參數。`arguments` 集合包含其型別引數。因此，程式碼可以獨立於 `List` 之外來檢查 `String?`：

```kotlin
import kotlin.reflect.typeOf

fun main() {
    val type = typeOf<List<String?>>()

    println(type.classifier)
    // class kotlin.collections.List
    println(type.arguments.single().type)
    // kotlin.String?
}
```

> 在 JVM 上，建立的型別不帶有任何註解，即使你在原始碼中對該型別加上了註解也是如此。對型別註解的支援可能會在未來版本的 `kotlin-reflect` 程式庫中新增。
>
{style="note"}

## 檢查值 {id="check-values"}

當你直接在程式碼中撰寫目標型別時，可以使用 [`is`、`as` 和 `as?` 運算子](typecasts.md)。但是，如果將目標類別儲存在 `KClass` 中，請使用：

* [`isInstance()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-class/is-instance.html) 函式，檢查值是否為該類別的執行個體。它會傳回 `true` 或 `false`。
* [`cast()`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/cast.html) 函式，將值作為目標型別傳回。如果值為 `null` 或型別不相容，則會擲回例外。
* [`safeCast()`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/safe-cast.html) 函式，將值作為目標型別傳回，或者在值為 `null` 或型別不相容時傳回 `null`。

```kotlin
import kotlin.reflect.cast
import kotlin.reflect.safeCast

fun main() {
    val expectedClass = String::class
    val value: Any = "Kotlin"

    // 檢查值而不進行轉換
    println(expectedClass.isInstance(value))
    // true

    // 將值作為 String 傳回
    val text = expectedClass.cast(value)
    println(text.length)
    // 6

    // 不相容的轉換會擲回例外
    val failedCast = runCatching {
        Int::class.cast(value)
    }
    println(failedCast.isFailure)
    // true

    // 安全轉換則會以 null 表示這種不相符
    val number = Int::class.safeCast(value)
    println(number)
    // null
}
```
{kotlin-runnable="true"}

## 檢查類別 {id="inspect-a-class"}

取得 `KClass` 之後，你可以檢查其成員。透過這種方式，你可以在使用它們之前了解存在哪些宣告。
使用 [`members`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-class/members.html) 屬性來檢查類別的函式和屬性。它包含一個 `KCallable` 物件集合，其中涵蓋類別中可存取的所有宣告，包括繼承而來的宣告。

例如，以下程式碼列出了資料類別中可存取的函式和屬性：

```kotlin
data class User(val name: String, val age: Int)

fun main() {
    println(User::class.members.map { it.name }.sorted())
    // [age, component1, component2, copy, equals, hashCode, name, toString]
}
```

`kotlin.reflect.full` 套件提供了更明確的屬性，用於依種類、作用域和接收者選取宣告：

| 屬性                                                                                                                                                 | 傳回內容                                                                                                                                      |
|-----------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------|
| [`declaredMembers`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/declared-members.html)                                       | 直接在該類別中宣告的函式和屬性，不包含繼承的宣告                                                    |
| [`functions`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/functions.html)                                                    | 該類別可用的所有函式：來自該類別及其父類別的非 static 函式，以及在該類別中宣告的 static 函式 |
| [`declaredFunctions`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/declared-functions.html)                                   | 在該類別中宣告的所有函式                                                                                                          |
| [`memberFunctions`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/member-functions.html)                                       | 在該類別及其父類別中宣告的非擴充、非 static 函式                                                               |
| [`declaredMemberFunctions`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/declared-member-functions.html)                      | 在該類別中宣告的非擴充、非 static 函式                                                                                    |
| [`memberExtensionFunctions`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/member-extension-functions.html)                    | 宣告為該類別或其父類別成員的擴充函式                                                                     |
| [`declaredMemberExtensionFunctions`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/declared-member-extension-functions.html)   | 在該類別中宣告的擴充函式                                                                                                    |
| [`staticFunctions`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/static-functions.html)                                       | 在該類別中宣告的 static 函式                                                                                                       |
| [`memberProperties`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/member-properties.html)                                     | 在該類別及其父類別中宣告的非擴充屬性                                                                          |
| [`declaredMemberProperties`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/declared-member-properties.html)                    | 在該類別中宣告的非擴充屬性                                                                                               |
| [`memberExtensionProperties`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/member-extension-properties.html)                  | 宣告為該類別或其父類別成員的擴充屬性                                                                    |
| [`declaredMemberExtensionProperties`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/declared-member-extension-properties.html) | 在該類別中宣告為成員的擴充屬性。                                                                                       |
| [`staticProperties`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/static-properties.html)                                     | 表示在 Java 類別中宣告之 static 欄位的屬性                                                                               |

請選擇與你的程式碼所需宣告相符的最精確屬性。例如，序列化器可能會使用 `declaredMemberProperties` 僅處理特定類別引入的屬性，而搜尋可呼叫 API 的框架可能還需要包含繼承的 `memberFunctions`。

你也可以透過反射來[檢查 sealed 子類別](sealed-classes.md#inspect-sealed-subclasses-with-reflection)。

## 讀取屬性 {id="read-a-property"}

反射允許你讀取在執行時期選取的屬性。
例如，你有一個 UI 設定，指定將 `name` 作為要從 `User` 物件顯示的屬性。
為此，應用程式必須找到相符的屬性宣告，然後叫用其 getter：

```kotlin
import kotlin.reflect.full.memberProperties

data class User(val name: String, val age: Int)

fun readProperty(instance: Any, propertyName: String): Any? {
    // 檢查執行時期類別
    val runtimeClass = instance::class

    // 尋找屬性宣告
    val property = runtimeClass.memberProperties
        .firstOrNull { it.name == propertyName }
        ?: error("Unknown property: $propertyName")

    // 將該物件作為接收者來呼叫 getter
    return property.getter.call(instance)
}

fun main() {
    val user = User("Jane Doe", 22)

    println(readProperty(user, "name"))
    // Jane Doe
    println(readProperty(user, "age"))
    // 22
}
```

此範例使用 [`memberProperties`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/member-properties.html) 傳回未繫結的屬性物件。這些物件描述了屬於該類別但未附加到特定執行個體的屬性。因此，`getter.call()` 需要 `instance` 作為其接收者。傳回結果的型別為 `Any?`，因為在執行時期選取的屬性可以傳回任何型別。

> 如果屬性在編譯時期已知，請直接存取屬性或使用[可呼叫參照](lambdas.md#callable-reference)，而非使用反射。
> 
{style="tip"}

## 呼叫函式 {id="call-a-function"}

動態函式呼叫遵循與[屬性](#read-a-property)相同的模式。如果所有引數均依其宣告順序提供，你可以使用 [`call()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-callable/call.html)。首先宣告未繫結的成員函式及其物件執行個體，然後依序加入其常規引數：

```kotlin
import kotlin.reflect.full.memberFunctions

class Formatter {
    fun format(text: String, uppercase: Boolean): String =
        if (uppercase) text.uppercase() else text
}

fun main() {
    val formatter = Formatter()

    // 在執行時期依名稱尋找函式
    val function = Formatter::class.memberFunctions
        .single { it.name == "format" }

    // 先提供接收者，然後依序提供宣告的引數
    val result = function.call(formatter, "Kotlin", true)

    println(result)
    // KOTLIN
}
```

在此範例中，該呼叫包含三個值：`Formatter` 接收者、`text` 以及 `uppercase`。它也會傳回 `Any?` 型別，並在執行時期回報不相容的接收者或引數。

你也可以將值與 `KParameter` 物件產生關聯，而不是依位置提供引數。為此，請使用 [`callBy()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-callable/call-by.html) 函式：

```kotlin
import kotlin.reflect.full.instanceParameter
import kotlin.reflect.full.memberFunctions
import kotlin.reflect.full.valueParameters

class Greeter {
    fun greet(name: String, punctuation: String = "!") =
        "Hello, $name$punctuation"
}

fun main() {
    val greeter = Greeter()
    val function = Greeter::class.memberFunctions
        .single { it.name == "greet" }

    // valueParameters 包含 greet() 中宣告的參數
    // 但不包含 Greeter 接收者
    val nameParameter = function.valueParameters
        .single { it.name == "name" }

    val result = function.callBy(
        mapOf(
            // 成員函式需要執行個體接收者
            function.instanceParameter!! to greeter,
            nameParameter to "Kotlin"
        )
    )

    println(result)
    // Hello, Kotlin!
}
```

在此範例中，`instanceParameter` 識別成員函式的接收者，而 `valueParameters` 僅包含函式簽章中宣告的參數。

> 當完整的循序引數清單已備齊時，請使用 `call()`。
> 
> 當你需要將引數與參數物件進行配對，或是讓選用參數使用其預設值時，請使用 `callBy()`。
> 
{style="tip"}