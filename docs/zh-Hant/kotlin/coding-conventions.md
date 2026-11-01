[//]: # (title: 編碼慣例)

眾所周知且易於遵循的編碼慣例對於任何程式語言都至關重要。
在此，我們為使用 Kotlin 的專案提供程式碼風格與程式碼組織指引。

## 在 IDE 中設定風格 {id="configure-style-in-ide"}

Kotlin 最受歡迎的兩款 IDE——[IntelliJ IDEA](https://www.jetbrains.com/idea/) 與 [Android Studio](https://developer.android.com/studio/)——為程式碼風格提供了強大的支援。你可以設定它們，使其根據指定的程式碼風格自動格式化你的程式碼。
 
### 套用風格指南 {id="apply-the-style-guide"}

1. 跳轉到 **Settings/Preferences | Editor | Code Style | Kotlin**。
2. 點擊 **Set from...**。
3. 選取 **Kotlin style guide**。

### 驗證你的程式碼是否遵循風格指南 {id="verify-that-your-code-follows-the-style-guide"}

1. 跳轉到 **Settings/Preferences | Editor | Inspections | General**。
2. 開啟 **Incorrect formatting** 檢查。
驗證風格指南中所述其他問題（例如命名慣例）的其他檢查預設均已啟用。

<!-- Replace with an external link when the guide is moved -->

若要了解更多資訊，請參閱 [使用 IntelliJ IDEA 遷移至 Kotlin 程式碼風格](code-style-migration-guide.md) 指南。

## 原始碼組織 {id="source-code-organization"}

### 目錄結構 {id="directory-structure"}

在純 Kotlin 專案中，建議的目錄結構應遵循省略了通用根套件的套件結構。例如，如果專案中的所有程式碼都位於 `org.example.kotlin` 套件及其子套件中，則帶有 `org.example.kotlin` 套件的檔案應直接置於原始碼根目錄下，而 `org.example.kotlin.network.socket` 中的檔案應置於原始碼根目錄的 `network/socket` 子目錄中。

>在 JVM 上：在 Kotlin 與 Java 一起使用的專案中，Kotlin 原始碼檔案應與 Java 原始碼檔案位於同一個原始碼根目錄下，並遵循相同的目錄結構：每個檔案都應存儲在與每個 package 陳述式相對應的目錄中。
>
{style="note"}

### 原始碼檔案名稱 {id="source-file-names"}

如果 Kotlin 檔案僅包含單一類別或介面（可能包含相關的頂層宣告），其名稱應與該類別名稱相同，並附加 `.kt` 副檔名。這適用於所有類型的類別與介面。
如果檔案包含多個類別，或僅包含頂層宣告，請選擇一個能描述該檔案內容的名稱，並相應地命名該檔案。
使用[大駝峰式命名法 (upper camel case)](https://en.wikipedia.org/wiki/Camel_case)，即每個單字的首字母均大寫。
例如 `ProcessDeclarations.kt`。

檔案名稱應描述該檔案中程式碼的作用。因此，應避免在檔案名稱中使用如 `Util` 等無意義的字詞。

#### 多平台專案 {id="multiplatform-projects"}

在多平台專案中，平台專屬原始碼集中帶有頂層宣告的檔案應具有與原始碼集名稱關聯的後綴。例如：

* **jvm**Main/kotlin/Platform.**jvm**.kt
* **android**Main/kotlin/Platform.**android**.kt
* **ios**Main/kotlin/Platform.**ios**.kt

至於通用原始碼集，包含頂層宣告的檔案則不應包含後綴。例如 `commonMain/kotlin/Platform.kt`。

##### 技術細節 {initial-collapse-state="collapsed" collapsible="true" id="technical-details"}

由於 JVM 的限制（不允許頂層成員，即函式、屬性），我們建議在多平台專案中遵循此檔案命名架構。

為了解決這個問題，Kotlin JVM 編譯器會建立包含頂層成員宣告的包裝類別（即所謂的「檔案外觀 (file facades)」）。檔案外觀具有衍生自檔案名稱的內部名稱。

反過來，JVM 不允許多個類別具有相同的完全限定名稱 (FQN)。這可能會導致 Kotlin 專案無法編譯至 JVM 的情況：

```none
root
|- commonMain/kotlin/myPackage/Platform.kt // 包含 'fun count() { }'
|- jvmMain/kotlin/myPackage/Platform.kt // 包含 'fun multiply() { }'
```

此處兩個 `Platform.kt` 檔案都位於同一個套件中，因此 Kotlin JVM 編譯器會產生兩個檔案外觀，其 FQN 均為 `myPackage.PlatformKt`。這會產生「Duplicate JVM classes」錯誤。

避免此問題最簡單的方法是根據上述指引重新命名其中一個檔案。這種命名架構有助於避免衝突，同時保持程式碼的可讀性。

> 在以下兩種情況下，這些建議看似多餘，但我們仍然建議遵循它們：
> 
> * 非 JVM 平台不存在重複檔案外觀的問題。但是，這種命名架構可以幫助你保持檔案命名的一致性。
> * 在 JVM 上，如果原始碼檔案沒有頂層宣告，則不會產生檔案外觀，也不會遇到命名衝突。
> 
>   然而，此命名架構能協助你避免在進行簡單重構或新增頂層函式時，產生相同的「Duplicate JVM classes」錯誤。
> 
{style="tip"}

### 原始碼檔案組織 {id="source-file-organization"}

只要宣告（類別、頂層函式或屬性）在語意上緊密相關，且檔案大小保持在合理範圍內（不超過數百行），我們鼓勵將多個宣告放置在同一個 Kotlin 原始碼檔案中。

特別是，當為某個類別定義與該類別所有用戶端相關的擴充函式時，請將它們與該類別本身置於同一個檔案中。當定義的擴充函式僅對特定用戶端有意義時，請將它們置於該用戶端的程式碼旁。避免僅為了存放某個類別的所有擴充而建立專用檔案。

### 類別版面配置 {id="class-layout"}

類別的內容應依下列順序排列：

1. 屬性宣告與初始設定式區塊
2. 次建構函式
3. 方法宣告
4. 伴生物件 (Companion object)

不要依字母順序或可見性對方法宣告進行排序，也不要將常規方法與擴充方法分開。相反地，應將相關的內容放在一起，以便由上至下閱讀類別的人能夠理解正在發生的邏輯。選擇一種順序（先放高層級內容，反之亦然）並堅持遵循。

將巢狀類別放在使用這些類別的程式碼旁邊。如果這些類別打算在外部使用且在類別內部未被參照，請將它們放在最後，置於伴生物件之後。

### 介面實作版面配置 {id="interface-implementation-layout"}

實作介面時，請保持實作成員的順序與介面成員的順序相同（必要時，可穿插用於實作的其他 private 方法）。

### 多載版面配置 {id="overload-layout"}

在類別中，一律將多載彼此相鄰放置。

## 命名規則 {id="naming-rules"}

Kotlin 中的套件與類別命名規則非常簡單：

* 套件名稱一律為全小寫，且不使用底線 (`org.example.project`)。通常不建議使用多單字名稱，但如果確實需要使用多個單字，可以將它們直接串接在一起或使用駝峰式大小寫 (`org.example.myProject`)。

* 類別與物件的名稱使用大駝峰式命名法 (upper camel case)：

```kotlin
open class DeclarationProcessor { /*...*/ }

object EmptyDeclarationProcessor : DeclarationProcessor() { /*...*/ }
```

### 函式名稱 {id="function-names"}
 
函式、屬性與區域變數的名稱以小寫字母開頭，並使用駝峰式大小寫且不帶底線：

```kotlin
fun processDeclarations() { /*...*/ }
var declarationCount = 1
```

### 類別型函式的名稱 {id="names-for-class-like-functions"}

在兩種例外情況下，函式名稱應遵循類別命名慣例。此類函式通常定義在頂層。

* 建立類別執行個體的工廠函式可以與抽象傳回型別具有相同的名稱：

   ```kotlin
   interface Foo { /*...*/ }

   class FooImpl : Foo { /*...*/ }

   fun Foo(): Foo { return FooImpl() }
   ```

* 傳回 `Unit` 的 `@Composable` 函式：

   ```kotlin
   @Composable fun TabHeader { /*...*/ }
   ```

### 測試方法的名稱 {id="names-for-test-methods"}

在測試中（且**僅限**在測試中），你可以使用以反引號包裹且包含空格的方法名稱。請注意，此類方法名稱僅在 API 層級 30 起的 Android 執行環境中受支援。測試程式碼中的方法名稱也允許使用底線。

```kotlin
class MyTestCase {
    @Test fun `ensure everything works`() { /*...*/ }

    @Test fun ensureEverythingWorks_onAndroid() { /*...*/ }
}
```

### 屬性名稱 {id="property-names"}

常數的名稱（標記有 `const` 的屬性，或是沒有自訂 `get` 函式且持有深層不可變資料的頂層或物件 `val` 屬性）應使用全大寫、底線分隔的名稱，遵循[尖叫蛇底式命名法 (screaming snake case)](https://en.wikipedia.org/wiki/Snake_case) 慣例：

```kotlin
const val MAX_COUNT = 8
val USER_NAME_FIELD = "UserName"
```

持有具有行為的物件或可變資料的頂層或物件屬性名稱應使用駝峰式大小寫：

```kotlin
val mutableCollection: MutableSet<String> = HashSet()
```

持有單例物件參照的屬性名稱可以使用與 `object` 宣告相同的命名風格：

```kotlin
val PersonComparator: Comparator<Person> = /*...*/
```

對於列舉常數，根據使用情境，可以使用全大寫、底線分隔的名稱（[screaming snake case](https://en.wikipedia.org/wiki/Snake_case)）（`enum class Color { RED, GREEN }`）或大駝峰式命名法的名稱。
   
### 支援屬性的名稱 {id="names-for-backing-properties"}

如果類別有兩個在概念上相同，但一個是公開 API 的一部分而另一個是實作細節的屬性，請使用底線作為該 private 屬性名稱的前綴：

```kotlin
class C {
    private val _elementList = mutableListOf<Element>()

    val elementList: List<Element>
        get() = _elementList
}
```

### 選擇良好的名稱 {id="choose-good-names"}

類別的名稱通常是名詞或名詞片語，解釋該類別「是」什麼：`List`、`PersonReader`。

方法的名稱通常是動詞或動詞片語，說明該方法「做」什麼：`close`、`readPersons`。名稱還應當表明該方法是變更物件狀態還是傳回新物件。例如，`sort` 是就地對集合進行排序，而 `sorted` 則是傳回集合的已排序複本。

名稱應清楚表明實體的目的，因此最好避免在名稱中使用無意義的字詞（如 `Manager`、`Wrapper`）。

使用縮寫作為宣告名稱的一部分時，請遵循以下規則：

* 對於兩個字母的縮寫，兩個字母均使用大寫。例如 `IOStream`。
* 對於超過兩個字母的縮寫，僅將第一個字母大寫。例如 `XmlFormatter` 或 `HttpInputStream`。

## 格式化 {id="formatting"}

### 縮排 {id="indentation"}

使用四個空格進行縮排。請勿使用 Tab。

對於花括號，請將起始花括號放在建構開始所在行的末尾，而將結束花括號放在單獨一行，並與起始建構水平對齊。

```kotlin
if (elements != null) {
    for (element in elements) {
        // ...
    }
}
```

>在 Kotlin 中，分號是選用的，因此分行具有重要意義。該語言的設計採用 Java 風格的花括號，如果嘗試使用不同的格式化風格，可能會遇到意外的行為。
>
{style="note"}

### 水平空白字元 {id="horizontal-whitespace"}

* 在二元運算子前後加上空格 (`a + b`)。例外：「range to」運算子前後不加空格 (`0..i`)。
* 一元運算子前後不加空格 (`a++`)。
* 在控制流程關鍵字（`if`、`when`、`for` 與 `while`）和相應的起始圓括號之間加上空格。
* 在主建構函數宣告、方法宣告或方法呼叫中的起始圓括號前不要加空格。

```kotlin
class A(val x: Int)

fun foo(x: Int) { ... }

fun bar() {
    foo(1)
}
```

* 切勿在 `(`、`[` 之後或 `]`、`)` 之前放置空格。
* 切勿在 `.` 或 `?.` 前後放置空格：`foo.bar().filter { it > 2 }.joinToString()`、`foo?.bar()`。
* 在 `//` 之後放置空格：`// This is a comment`。
* 用於指定型別參數的尖括號周圍不要加空格：`class Map<K, V> { ... }`。
* `::` 前後不要加空格：`Foo::class`、`String::length`。
* 用於標記可空型別的 `?` 前不要加空格：`String?`。

作為一般規則，避免任何形式的水平對齊。將識別符號重新命名為不同長度的名稱不應影響宣告或任何用法的格式化。

### 冒號 {id="colon"}

在下列情況下，請在 `:` 前加上空格：

* 用於分隔型別與超型別時。
* 委託給超類別建構函式或同類別的不同建構函式時。
* 在 `object` 關鍵字之後。
    
當 `:` 用於分隔宣告與其型別時，前面不要加空格。
 
在 `:` 後一律加上空格。

```kotlin
abstract class Foo<out T : Any> : IFoo {
    abstract fun foo(a: Int): T
}

class FooImpl : Foo() {
    constructor(x: String) : this(x) { /*...*/ }

    val x = object : IFoo { /*...*/ } 
}
```

### 類別標頭 {id="class-headers"}

具有少數主建構函式參數的類別可以寫在同一行中：

```kotlin
class Person(id: Int, name: String)
```

具有較長標頭的類別在格式化時，應讓每個主建構函式參數各自佔據單獨一行並進行縮排。
此外，結束圓括號應另起新行。如果你使用繼承，超類別建構函式呼叫或實作的介面清單應與圓括號位於同一行：

```kotlin
class Person(
    id: Int,
    name: String,
    surname: String
) : Human(id, name) { /*...*/ }
```

對於多個介面，超類別建構函式呼叫應位於首位，然後每個介面應分別位於不同行：

```kotlin
class Person(
    id: Int,
    name: String,
    surname: String
) : Human(id, name),
    KotlinMaker { /*...*/ }
```

對於具有較長超型別清單的類別，請在冒號後換行，並將所有超型別名稱水平對齊：

```kotlin
class MyFavouriteVeryLongClassHolder :
    MyLongHolder<MyFavouriteVeryLongClass>(),
    SomeOtherInterface,
    AndAnotherOne {

    fun foo() { /*...*/ }
}
```

若要在類別標頭較長時明確分隔類別標頭與主體，可以在類別標頭後面加上空行（如上述範例），或將起始花括號另起一行：

```kotlin
class MyFavouriteVeryLongClassHolder :
    MyLongHolder<MyFavouriteVeryLongClass>(),
    SomeOtherInterface,
    AndAnotherOne 
{
    fun foo() { /*...*/ }
}
```

對於建構函式參數，請使用常規縮排（四個空格）。這可確保在主建構函式中宣告的屬性與在類別主體中宣告的屬性具有相同的縮排。

### 修飾詞順序 {id="modifiers-order"}

如果宣告有多個修飾詞，請一律按下列順序排列：

```kotlin
public / protected / private / internal
expect / actual
final / open / abstract / sealed / const
external
override
lateinit
tailrec
vararg
suspend
inner
enum / annotation / fun // 在 `fun interface` 中作為修飾詞 
companion
inline / value
infix
operator
data
```

將所有註解放置在修飾詞之前：

```kotlin
@Named("Foo")
private val foo: Foo
```

除非你正在開發程式庫，否則請省略冗餘的修飾詞（例如 `public`）。

### 註解 {id="annotations"}

將註解置於其所附加的宣告之前的單獨行上，並採用相同的縮排：

```kotlin
@Target(AnnotationTarget.PROPERTY)
annotation class JsonExclude
```

沒有引數的註解可以放在同一行：

```kotlin
@JsonExclude @JvmField
var x: String
```

沒有引數的單一註解可以與對應的宣告放在同一行：

```kotlin
@Test fun foo() { /*...*/ }
```

### 檔案註解 {id="file-annotations"}

檔案註解置於檔案註解（若有）之後、`package` 陳述式之前，並以空行與 `package` 分隔（以強調它們是針對檔案而非針對套件）。

```kotlin
/** License, copyright and whatever */
@file:JvmName("FooBar")

package foo.bar
```

### 函式 {id="functions"}

如果函式簽章無法容納在單一行中，請使用以下語法：

```kotlin
fun longMethodName(
    argument: ArgumentType = defaultValue,
    argument2: AnotherArgumentType,
): ReturnType {
    // 主體
}
```

函式參數使用常規縮排（四個空格）。這有助於確保與建構函式參數的一致性。

當函式主體僅由單一運算式組成時，偏好使用運算式主體。

```kotlin
fun foo(): Int {     // 不佳
    return 1 
}

fun foo() = 1        // 良好
```

### 運算式主體 {id="expression-bodies"}

如果函式具有運算式主體，且其第一行無法與宣告容納在同一行，請將 `=` 符號放在第一行，並將運算式主體縮排四個空格。

```kotlin
fun f(x: String, y: String, z: String) =
    veryLongFunctionCallWithManyWords(andLongParametersToo(), x, y, z)
```

### 屬性 {id="properties"}

對於非常簡單的唯讀屬性，請考慮單行格式化：

```kotlin
val isEmpty: Boolean get() = size == 0
```

對於較複雜的屬性，一律將 `get` 與 `set` 關鍵字放在單獨的行上：

```kotlin
val foo: String
    get() { /*...*/ }
```

對於具有初始設定式的屬性，如果初始設定式較長，請在 `=` 符號後新增換行，並將初始設定式縮排四個空格：

```kotlin
private val defaultCharset: Charset? =
    EncodingRegistry.getInstance().getDefaultCharsetForPropertiesFiles(file)
```

### 控制流程陳述式 {id="control-flow-statements"}

如果 `if` 或 `when` 陳述式的條件有多行，請一律在陳述式主體周圍使用花括號。
將條件的每個後續行相對於陳述式開頭縮排四個空格。
將條件的結束圓括號與起始花括號一起放在單獨的一行上：

```kotlin
if (!component.isSyncing &&
    !hasAnyKotlinRuntimeInScope(module)
) {
    return createKotlinNotConfiguredPanel(module)
}
```

這有助於對齊條件與陳述式主體。

將 `else`、`catch`、`finally` 關鍵字以及 `do-while` 迴圈的 `while` 關鍵字與前面的花括號放在同一行：

```kotlin
if (condition) {
    // 主體
} else {
    // else 部分
}

try {
    // 主體
} finally {
    // 清理
}
```

在 `when` 陳述式中，如果分支超過一行，請考慮使用空行將其與相鄰的 case 區塊分隔開：

```kotlin
private fun parsePropertyValue(propName: String, token: Token) {
    when (token) {
        is Token.ValueToken ->
            callback.visitValue(propName, token.value)

        Token.LBRACE -> { // ...
        }
    }
}
```

將簡短分支與條件放在同一行，不使用花括號。

```kotlin
when (foo) {
    true -> bar() // 良好
    false -> { baz() } // 不佳
}
```

### 方法呼叫 {id="method-calls"}

在長引數清單中，在起始圓括號後換行。將引數縮排四個空格。
將多個密切相關的引數分組在同一行。

```kotlin
drawSquare(
    x = 10, y = 10,
    width = 100, height = 100,
    fill = true
)
```

在分隔引數名稱與值的 `=` 符號周圍加上空格。

### 鏈式呼叫換行 {id="wrap-chained-calls"}

為鏈式呼叫換行時，請將 `.` 字元或 `?.` 運算子放在下一行，並加上單層縮排：

```kotlin
val anchor = owner
    ?.firstChild!!
    .siblings(forward = true)
    .dropWhile { it is PsiComment || it is PsiWhiteSpace }
```

呼叫鏈中的第一個呼叫通常前面應該要有換行，但如果省略換行能讓程式碼更具可讀性，也可以省略。

### Lambda {id="lambdas"}

在 Lambda 運算式中，花括號周圍以及分隔參數與主體的箭頭周圍均應加上空格。如果呼叫僅採用單個 Lambda，請盡可能將其傳遞到圓括號之外。

```kotlin
list.filter { it > 10 }
```

如果為 Lambda 指派標籤，請勿在標籤與起始花括號之間加空格：

```kotlin
fun foo() {
    ints.forEach lit@{
        // ...
    }
}
```

在多行 Lambda 中宣告參數名稱時，請將名稱放在第一行，後接箭頭與換行：

```kotlin
appendCommaSeparated(properties) { prop ->
    val propertyValue = prop.get(obj)  // ...
}
```

如果參數清單過長而無法容納在一行中，請將箭頭另起一行：

```kotlin
foo {
    context: Context,
    environment: Env
    ->
    context.configureEnv(environment)
}
```

### 尾隨逗號 {id="trailing-commas"}

尾隨逗號是指一系列元素中最後一項後面的逗號符號：

```kotlin
class Person(
    val firstName: String,
    val lastName: String,
    val age: Int, // 尾隨逗號
)
```

使用尾隨逗號有幾個好處：

* 它使版本控制 diff 更清晰——因為所有的焦點都集中在已更改的值上。
* 它使新增與重新排列元素變得更加容易——操作元素時無需新增或刪除逗號。
* 它簡化了程式碼產生，例如物件初始設定式。最後一個元素也可以帶有逗號。

尾隨逗號完全是選用的——沒有它們你的程式碼依然可以運作。Kotlin 風格指南鼓勵在宣告處使用尾隨逗號，並由你自行決定是否在呼叫處使用。

若要在 IntelliJ IDEA 格式化程式中啟用尾隨逗號，請跳轉到 **Settings/Preferences | Editor | Code Style | Kotlin**，開啟 **Other** 標籤頁並勾選 **Use trailing comma** 選項。

#### 列舉 {initial-collapse-state="collapsed" collapsible="true" id="enumerations"}

```kotlin
enum class Direction {
    NORTH,
    SOUTH,
    WEST,
    EAST, // 尾隨逗號
}
```

#### 具值引數 {initial-collapse-state="collapsed" collapsible="true" id="value-arguments"}

```kotlin
fun shift(x: Int, y: Int) { /*...*/ }
shift(
    25,
    20, // 尾隨逗號
)
val colors = listOf(
    "red",
    "green",
    "blue", // 尾隨逗號
)
```

#### 類別屬性與參數 {initial-collapse-state="collapsed" collapsible="true" id="class-properties-and-parameters"}

```kotlin
class Customer(
    val name: String,
    val lastName: String, // 尾隨逗號
)
class Customer(
    val name: String,
    lastName: String, // 尾隨逗號
)
```

#### 函式具值參數 {initial-collapse-state="collapsed" collapsible="true" id="function-value-parameters"}

```kotlin
fun powerOf(
    number: Int, 
    exponent: Int, // 尾隨逗號
) { /*...*/ }
constructor(
    x: Comparable<Number>,
    y: Iterable<Number>, // 尾隨逗號
) {}
fun print(
    vararg quantity: Int,
    description: String, // 尾隨逗號
) {}
```

#### 帶有選用型別的參數（包含 Setter） {initial-collapse-state="collapsed" collapsible="true" id="parameters-with-optional-type-including-setters"}

```kotlin
val sum: (Int, Int, Int) -> Int = fun(
    x,
    y,
    z, // 尾隨逗號
): Int {
    return x + y + x
}
println(sum(8, 8, 8))
```

#### 索引後綴 {initial-collapse-state="collapsed" collapsible="true" id="indexing-suffix"}

```kotlin
class Surface {
    operator fun get(x: Int, y: Int) = 2 * x + 4 * y - 10
}
fun getZValue(mySurface: Surface, xValue: Int, yValue: Int) =
    mySurface[
        xValue,
        yValue, // 尾隨逗號
    ]
```

#### Lambda 中的參數 {initial-collapse-state="collapsed" collapsible="true" id="parameters-in-lambdas"}

```kotlin
fun main() {
    val x = {
            x: Comparable<Number>,
            y: Iterable<Number>, // 尾隨逗號
        ->
        println("1")
    }
    println(x)
}
```

#### when 項目 {initial-collapse-state="collapsed" collapsible="true" id="when-entry"}

```kotlin
fun isReferenceApplicable(myReference: KClass<*>) = when (myReference) {
    Comparable::class,
    Iterable::class,
    String::class, // 尾隨逗號
        -> true
    else -> false
}
```

#### 集合常值（用於註解中） {initial-collapse-state="collapsed" collapsible="true" id="collection-literals-in-annotations"}

```kotlin
annotation class ApplicableFor(val services: Array<String>)
@ApplicableFor([
    "serializer",
    "balancer",
    "database",
    "inMemoryCache", // 尾隨逗號
])
fun run() {}
```

#### 型別引數 {initial-collapse-state="collapsed" collapsible="true" id="type-arguments"}

```kotlin
fun <T1, T2> foo() {}
fun main() {
    foo<
            Comparable<Number>,
            Iterable<Number>, // 尾隨逗號
            >()
}
```

#### 型別參數 {initial-collapse-state="collapsed" collapsible="true" id="type-parameters"}

```kotlin
class MyMap<
        MyKey,
        MyValue, // 尾隨逗號
        > {}
```

#### 解構宣告 {initial-collapse-state="collapsed" collapsible="true" id="destructuring-declarations"}

```kotlin
data class Car(val manufacturer: String, val model: String, val year: Int)
val myCar = Car("Tesla", "Y", 2019)
val (
    manufacturer,
    model,
    year, // 尾隨逗號
) = myCar
val cars = listOf<Car>()
fun printMeanValue() {
    var meanValue: Int = 0
    for ((
        _,
        _,
        year, // 尾隨逗號
    ) in cars) {
        meanValue += year
    }
    println(meanValue/cars.size)
}
printMeanValue()
```

## 文件註解 {id="documentation-comments"}

對於較長的文件註解，將起始的 `/**` 另起一行，並在隨後的每一行開頭加上星號：

```kotlin
/**
 * This is a documentation comment
 * on multiple lines.
 */
```

簡短的註解可以放在單一行中：

```kotlin
/** This is a short documentation comment. */
```

通常，請避免使用 `@param` 與 `@return` 標籤。相反地，應將參數與傳回值的描述直接整合到文件註解中，並在提及參數的任何地方新增指向參數的連結。僅當需要無法融入主文本流程的冗長描述時，才使用 `@param` 與 `@return`。

```kotlin
// 避免這樣做：

/**
 * Returns the absolute value of the given number.
 * @param number The number to return the absolute value for.
 * @return The absolute value.
 */
fun abs(number: Int): Int { /*...*/ }

// 請改為這樣做：

/**
 * Returns the absolute value of the given [number].
 */
fun abs(number: Int): Int { /*...*/ }
```

## 避免冗餘的建構 {id="avoid-redundant-constructs"}

一般而言，如果 Kotlin 中的某個語法建構是選用的，且被 IDE 醒目提示為冗餘，你應該在程式碼中將其省略。不要僅「為了清晰起見」而在程式碼中留下不必要的語法元素。

### Unit 傳回型別 {id="unit-return-type"}

如果函式傳回 Unit，則應省略傳回型別：

```kotlin
fun foo() { // 此處省略了 ": Unit"

}
```

### 分號 {id="semicolons"}

盡可能省略分號。

### 字串範本 {id="string-templates"}

將簡單變數插入字串範本時，不要使用花括號。僅在較長的運算式中使用花括號：

```kotlin
println("$name has ${children.size} children")
```

使用[多貨幣符號字串插值 (multi-dollar string interpolation)](strings.md#multi-dollar-string-interpolation) 將貨幣符號字元 `$` 視為字串常值：

```kotlin
val KClass<*>.jsonSchema : String
    get() = $$"""
        {
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "$id": "https://example.com/product.schema.json",
            "$dynamicAnchor": "meta",
            "title": "$${simpleName ?: qualifiedName ?: "unknown"}",
            "type": "object"
        }
        """
```

## 慣用語法使用語言特性 {id="idiomatic-use-of-language-features"}

### 不可變性 {id="immutability"}

偏好使用不可變資料而非可變資料。如果區域變數與屬性在初始化後不再被修改，請一律宣告為 `val` 而非 `var`。

宣告未變更的集合時，請一律使用不可變集合介面（`Collection`、`List`、`Set`、`Map`）。使用工廠函式建立集合執行個體時，盡可能使用傳回不可變集合型別的函式：

```kotlin
// 不佳：針對不會被修改的值使用可變集合型別
fun validateValue(actualValue: String, allowedValues: HashSet<String>) { ... }

// 良好：改用不可變集合型別
fun validateValue(actualValue: String, allowedValues: Set<String>) { ... }

// 不佳：arrayListOf() 傳回 ArrayList<T>，這是一個可變集合型別
val allowedValues = arrayListOf("a", "b", "c")

// 良好：listOf() 傳回 List<T>
val allowedValues = listOf("a", "b", "c")
```

### 預設參數值 {id="default-parameter-values"}

相較於宣告多載函式，偏好宣告具有預設參數值的函式。

```kotlin
// 不佳
fun foo() = foo("a")
fun foo(a: String) { /*...*/ }

// 良好
fun foo(a: String = "a") { /*...*/ }
```

### 型別別名 {id="type-aliases"}

如果你有一個在程式碼庫中多次使用的函式型別或帶有型別參數的型別，偏好為其定義型別別名：

```kotlin
typealias MouseClickHandler = (Any, MouseEvent) -> Unit
typealias PersonIndex = Map<String, Person>
```
如果你為了避免名稱衝突而使用 private 或 internal 型別別名，請偏好使用 [套件與匯入](packages.md) 中提到的 `import ... as ...`。

### Lambda 參數 {id="lambda-parameters"}

在簡短且未巢狀的 Lambda 中，建議使用 `it` 慣例，而不是明確宣告參數。在帶有參數的巢狀 Lambda 中，應一律明確宣告參數。

### Lambda 中的回傳 {id="returns-in-a-lambda"}

避免在 Lambda 中使用多個帶標籤的回傳。考慮重構 Lambda，使其具有單一結束點。如果不可行或不夠清晰，請考慮將 Lambda 轉換為匿名函式。

不要在 Lambda 的最後一個陳述式中使用帶標籤的回傳。

### 具名引數 {id="named-arguments"}

當方法採用相同基本型別的多個參數時，或對於 `Boolean` 型別的參數，請使用具名引數語法，除非所有參數的含義從上下文中已絕對清楚。

```kotlin
drawSquare(x = 10, y = 10, width = 100, height = 100, fill = true)
```

### 條件陳述式 {id="conditional-statements"}

偏好使用 `try`、`if` 與 `when` 的運算式形式。

```kotlin
return if (x) foo() else bar()
```

```kotlin
return when(x) {
    0 -> "zero"
    else -> "nonzero"
}
```

以上寫法優於：

```kotlin
if (x)
    return foo()
else
    return bar()
```

```kotlin
when(x) {
    0 -> return "zero"
    else -> return "nonzero"
}
```

### if 與 when 的比較 {id="if-versus-when"}

對於二元條件，偏好使用 `if` 而非 `when`。
例如，使用 `if` 的這種語法：

```kotlin
if (x == null) ... else ...
```

而不是使用 `when` 的這種寫法：

```kotlin
when (x) {
    null -> // ...
    else -> // ...
}
```

如果有三個或更多選項，偏好使用 `when`。

### when 運算式中的防護條件 {id="guard-conditions-in-when-expression"}

在帶有[防護條件](control-flow.md#guard-conditions-in-when-expressions)的 `when` 運算式或陳述式中結合多個布林運算式時，請使用圓括號：

```kotlin
when (status) {
    is Status.Ok if (status.info.isEmpty() || status.info.id == null) -> "no information"
}
```

而不是：

```kotlin
when (status) {
    is Status.Ok if status.info.isEmpty() || status.info.id == null -> "no information"
}
```

### 條件中的可空布林值 {id="nullable-boolean-values-in-conditions"}

如果需要在條件陳述式中使用可空的 `Boolean`，請使用 `if (value == true)` 或 `if (value == false)` 檢查。

### 迴圈 {id="loops"}

偏好使用高階函數（`filter`、`map` 等）而非迴圈。例外情況：`forEach`（偏好使用常規 `for` 迴圈，除非 `forEach` 的接收者可空，或者 `forEach` 用作較長呼叫鏈的一部分）。

在具有多個高階函數的複雜運算式與迴圈之間進行選擇時，請理解在每種情況下執行的操作開銷，並牢記效能考量。

### 區間上的迴圈 {id="loops-on-ranges"}

使用 `..<` 運算子在具有開區間上限的區間上進行迴圈：

```kotlin
for (i in 0..n - 1) { /*...*/ }  // 不佳
for (i in 0..<n) { /*...*/ }  // 良好
```

### 字串 {id="strings"}

偏好使用字串範本而非字串連接。

偏好使用多行字串，而不是在一般字串常值中嵌入 `\n` 轉義序列。

若要在多行字串中保持縮排，當產生的字串不需要任何內部縮排時使用 `trimIndent`，當需要內部縮排時使用 `trimMargin`：

```kotlin
fun main() {
//sampleStart
    println("""
     Not
     trimmed
     text
     """
    )

    println("""
     Trimmed
     text
     """.trimIndent()
    )

    println()

    val a = """Trimmed to margin text:
            |if(a > 1) {
            |    return a
            |}""".trimMargin()

   println(a)
//sampleEnd
}
```
{kotlin-runnable="true"}

了解 [Java 與 Kotlin 多行字串之間的差異](java-to-kotlin-idioms-strings.md#use-multiline-strings)。

### 函式與屬性的取捨 {id="functions-vs-properties"}

在某些情況下，不帶引數的函式可能可以與唯讀屬性互換。
儘管語意相似，但在何時偏好選擇其中之一仍有一些風格慣例。

當底層演算法符合下列條件時，偏好使用屬性而非函式：

* 不會擲出例外。
* 計算成本低廉（或在首次執行時已快取）。
* 若物件狀態未改變，多次叫用均傳回相同結果。

### 擴充函式 {id="extension-functions"}

請自由善用擴充函式。每次當你有一個主要針對某物件操作的函式時，請考慮將其轉換為接受該物件作為接收者的擴充函式。為最大程度地減少 API 污染，請在合理的範圍內盡可能限制擴充函式的可見性。根據需要，使用區域擴充函式、成員擴充函式或具有 private 可見性的頂層擴充函式。

### 中綴函式 (Infix functions) {id="infix-functions"}

僅在函式對扮演類似角色的兩個物件進行操作時，才將其宣告為 `infix`。優良範例：`and`、`to`、`zip`。
不良範例：`add`。

如果方法會變更接收者物件，請勿將其宣告為 `infix`。

### 工廠函式 {id="factory-functions"}

如果你為某個類別宣告工廠函式，請避免賦予它與類別本身相同的名稱。偏好使用獨特的名稱，清楚說明該工廠函式的行為為何特殊。僅在確實沒有特殊語意時，才可以使用與類別相同的名稱。

```kotlin
class Point(val x: Double, val y: Double) {
    companion object {
        fun fromPolar(angle: Double, radius: Double) = Point(...)
    }
}
```

如果你有一個包含多個多載建構函式的物件，這些建構函式不會呼叫不同的超類別建構函式，且無法簡化為包含具預設值參數的單一建構函式，則偏好將這些多載建構函式替換為工廠函式。

### 平台型別 {id="platform-types"}

傳回平台型別運算式的 public 函式/方法必須明確宣告其 Kotlin 型別：

```kotlin
fun apiCall(): String = MyJavaApi.getProperty("name")
```

使用平台型別運算式初始化的任何屬性（套件層級或類別層級）都必須明確宣告其 Kotlin 型別：

```kotlin
class Person {
    val name: String = MyJavaApi.getProperty("name")
}
```

使用平台型別運算式初始化的區域值可以有也可以沒有型別宣告：

```kotlin
fun main() {
    val name = MyJavaApi.getProperty("name")
    println(name)
}
```

### 作用域函式 apply/with/run/also/let {id="scope-functions-apply-with-run-also-let"}

Kotlin 提供了一組在指定物件的環境中執行程式碼區塊的函式：`let`、`run`、`with`、`apply` 與 `also`。
有關為你的情境選擇正確作用域函式的指引，請參閱 [作用域函式](scope-functions.md)。

## 程式庫編碼慣例 {id="coding-conventions-for-libraries"}

編寫程式庫時，建議遵循一套額外規則以確保 API 穩定性：

 * 一律明確指定成員可見性（以避免意外將宣告暴露為公開 API）。
 * 一律明確指定函式傳回型別與屬性型別（以避免在實作變更時意外變更傳回型別）。
 * 為所有公開成員提供 [KDoc](kotlin-doc.md) 註解，不需要任何新文件的覆寫除外（以支援為程式庫產生文件）。

若要進一步了解編寫程式庫 API 時應考慮的最佳實務與構想，請參閱 [程式庫作者指引](api-guidelines-introduction.md)。