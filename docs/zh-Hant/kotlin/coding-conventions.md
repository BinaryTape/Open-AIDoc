[//]: # (title: 程式碼慣例)

眾所周知且易於遵循的程式碼慣例對於任何程式語言都至關重要。
在此，我們為使用 Kotlin 的專案提供有關程式碼風格和程式碼組織的準則。

## 在 IDE 中設定風格

Kotlin 最受歡迎的兩款 IDE —— [IntelliJ IDEA](https://www.jetbrains.com/idea/) 與 [Android Studio](https://developer.android.com/studio/)
為程式碼風格提供了強大的支援。您可以對其進行配置，以根據指定的程式碼風格自動格式化您的程式碼。
 
### 套用風格指南

1. 前往 **Settings/Preferences | Editor | Code Style | Kotlin**。
2. 點擊 **Set from...**。
3. 選擇 **Kotlin style guide**。

### 驗證您的程式碼是否符合風格指南

1. 前往 **Settings/Preferences | Editor | Inspections | General**。
2. 開啟 **Incorrect formatting** 檢查。
預設情況下，已啟用驗證風格指南中所述其他問題（例如命名慣例）的額外檢查。

<!-- Replace with an external link when the guide is moved -->

若要了解更多資訊，請參閱 [使用 IntelliJ IDEA 遷移至 Kotlin 程式碼風格](code-style-migration-guide.md) 指南。

## 原始碼組織

### 目錄結構

在純 Kotlin 專案中，建議的目錄結構遵循套件結構，並省略共同的根套件。例如，如果專案中的所有程式碼都在 `org.example.kotlin` 套件及其子套件中，則具有 `org.example.kotlin` 套件的檔案應直接放置在原始碼根目錄下，而 `org.example.kotlin.network.socket` 中的檔案應放在原始碼根目錄的 `network/socket` 子目錄中。

> 在 JVM 上：在 Kotlin 與 Java 共同使用的專案中，Kotlin 原始碼檔案應與 Java 原始碼檔案位於相同的原始碼根目錄下，並遵循相同的目錄結構：每個檔案都應儲存在與每個套件聲明對應的目錄中。
>
{style="note"}

### 原始碼檔案名稱

如果 Kotlin 檔案包含單個類別或介面（可能包含相關的頂層宣告），其名稱應與類別名稱相同，並附加 `.kt` 擴充套件。這適用於所有類型的類別和介面。
如果一個檔案包含多個類別，或僅包含頂層宣告，請選擇一個描述檔案內容的名稱，並據此為檔案命名。
使用大寫駝峰式大小寫 (Upper Camel Case)，即每個單字的首字母都大寫。
例如：`ProcessDeclarations.kt`。

檔案的名稱應描述檔案中程式碼的功能。因此，應避免在檔案名稱中使用如 `Util` 之類無意義的單字。

#### 多平台專案

在多平台專案中，平台專屬原始碼集中具有頂層宣告的檔案應具有與原始碼集名稱相關聯的後綴。例如：

* **jvm**Main/kotlin/Platform.**jvm**.kt
* **android**Main/kotlin/Platform.**android**.kt
* **ios**Main/kotlin/Platform.**ios**.kt

至於共同原始碼集，具有頂層宣告的檔案不應有後綴。例如：`commonMain/kotlin/Platform.kt`。

##### 技術細節 {initial-collapse-state="collapsed" collapsible="true"}

由於 JVM 的限制，我們建議在多平台專案中遵循此檔案命名方案：JVM 不允許頂層成員（函式、屬性）。

為了繞過這個問題，Kotlin JVM 編譯器會建立包裝類別（即所謂的「檔案外觀 (file facades)」），其中包含頂層成員宣告。檔案外觀具有一個源自檔案名稱的內部名稱。

反之，JVM 不允許具有相同完全限定名稱 (FQN) 的多個類別。這可能會導致 Kotlin 專案無法編譯為 JVM 的情況：

```none
root
|- commonMain/kotlin/myPackage/Platform.kt // 包含 'fun count() { }'
|- jvmMain/kotlin/myPackage/Platform.kt // 包含 'fun multiply() { }'
```

在這裡，兩個 `Platform.kt` 檔案都在同一個套件中，因此 Kotlin JVM 編譯器會產生兩個檔案外觀，兩者的 FQN 均為 `myPackage.PlatformKt`。這會產生「Duplicate JVM classes」錯誤。

避免這種情況最簡單的方法是根據上述準則重命名其中一個檔案。這種命名方案有助於避免衝突，同時保持程式碼的可讀性。

> 在以下兩種情況下，這些建議可能看起來是多餘的，但我們仍然建議遵循它們：
> 
> * 非 JVM 平台不存在重複檔案外觀的問題。然而，這種命名方案可以幫助您保持檔案命名的一致性。
> * 在 JVM 上，如果原始碼檔案沒有頂層宣告，則不會產生檔案外觀，您也不會面臨命名衝突。
> 
>   然而，這種命名方案可以幫助您避免在進行簡單重構或添加頂層函式時，導致相同的「Duplicate JVM classes」錯誤。
> 
{style="tip"}

### 原始碼檔案組織

只要多個宣告（類別、頂層函式或屬性）在語義上彼此密切相關，且檔案大小保持在合理範圍內（不超過幾百行），我們鼓勵將它們放置在同一個 Kotlin 原始碼檔案中。

特別是，當為一個類別定義對該類別的所有用戶端都相關的擴充方法時，請將它們與類別本身放在同一個檔案中。當定義僅對特定用戶端有意義的擴充方法時，請將它們放在該用戶端的程式碼旁邊。避免僅為了存放某個類別的所有擴充而建立檔案。

### 類別配置

類別的內容應按以下順序排列：

1. 屬性宣告和初始設定式區塊
2. 次要建構函式
3. 方法宣告
4. 伴隨物件

不要按字母順序或可見性對方法宣告進行排序，也不要將一般方法與擴充方法分開。相反，應將相關內容放在一起，以便從上到下閱讀類別的人可以遵循正在發生的邏輯。選擇一種順序（高階內容在前，反之亦然）並堅持下去。

將巢狀類別放在使用這些類別的程式碼旁邊。如果這些類別旨在外部使用且未在類別內部引用，請將它們放在最後，位於伴隨物件之後。

### 介面實作配置

實作介面時，請保持實作成員的順序與介面成員的順序相同（如有必要，中間可以插入用於實作的額外私有方法）。

### 多載配置

在類別中始終將多載函式放在一起。

## 命名規則

Kotlin 中的套件和類別命名規則非常簡單：

* 套件的名稱始終為小寫，且不使用底線 (`org.example.project`)。通常不鼓勵使用多單字名稱，但如果您確實需要使用多個單字，可以將它們直接連接在一起或使用駝峰式大小寫 (`org.example.myProject`)。

* 類別和物件的名稱使用大寫駝峰式大小寫 (Upper Camel Case)：

```kotlin
open class DeclarationProcessor { /*...*/ }

object EmptyDeclarationProcessor : DeclarationProcessor() { /*...*/ }
```

### 函式名稱
 
函式、屬性和區域變數的名稱以小寫字母開頭，使用駝峰式大小寫且不含底線：

```kotlin
fun processDeclarations() { /*...*/ }
var declarationCount = 1
```

例外：用於建立類別執行個體的工廠方法名稱可以與抽象回傳型別相同：

```kotlin
interface Foo { /*...*/ }

class FooImpl : Foo { /*...*/ }

fun Foo(): Foo { return FooImpl() }
```

### 測試方法的名稱

在測試中（且**僅**在測試中），您可以使用包含在反引號中的帶空格的方法名稱。
請注意，此類方法名稱僅從 API 級別 30 開始由 Android 執行時支援。測試程式碼中也允許在方法名稱中使用底線。

```kotlin
class MyTestCase {
    @Test fun `ensure everything works`() { /*...*/ }

    @Test fun ensureEverythingWorks_onAndroid() { /*...*/ }
}
```

### 屬性名稱

常數的名稱（標記為 `const` 的屬性，或不含自訂 `get` 函式且持有深度不可變資料的頂層或物件 `val` 屬性）應遵循[全大寫蛇形命名法 (Screaming Snake Case)](https://en.wikipedia.org/wiki/Snake_case) 慣例，使用全大寫且底線分隔的名稱：

```kotlin
const val MAX_COUNT = 8
val USER_NAME_FIELD = "UserName"
```

持有具有行為的物件或可變資料的頂層或物件屬性名稱，應使用駝峰式大小寫名稱：

```kotlin
val mutableCollection: MutableSet<String> = HashSet()
```

持有單例物件參照的屬性名稱可以使用與 `object` 宣告相同的命名樣式：

```kotlin
val PersonComparator: Comparator<Person> = /*...*/
```

對於列舉常數，根據用法，可以使用全大寫、底線分隔的 [全大寫蛇形命名法 (Screaming Snake Case)](https://en.wikipedia.org/wiki/Snake_case) 名稱 (`enum class Color { RED, GREEN }`) 或大寫駝峰式大小寫名稱。
   
### 支援屬性的名稱

如果一個類別有兩個在概念上相同但一個是公開 API 的一部分而另一個是實作細節的屬性，請使用底線作為私有屬性名稱的前綴：

```kotlin
class C {
    private val _elementList = mutableListOf<Element>()

    val elementList: List<Element>
        get() = _elementList
}
```

### 選擇好的名稱

類別的名稱通常是名詞或名詞片語，解釋該類別是什麼：`List`、`PersonReader`。

方法的名稱通常是動詞或動詞片語，說明該方法的功能：`close`、`readPersons`。
名稱還應暗示該方法是修改物件還是傳回一個新物件。例如 `sort` 是對集合進行原地排序，而 `sorted` 是傳回集合的已排序副本。

名稱應清楚說明該實體的用途，因此最好避免在名稱中使用無意義的單字 (`Manager`、`Wrapper`)。

當使用縮寫詞作為宣告名稱的一部分時，請遵循以下規則：

* 對於兩個字母的縮寫，兩個字母都使用大寫。例如：`IOStream`。
* 對於超過兩個字母的縮寫，僅將第一個字母大寫。例如：`XmlFormatter` 或 `HttpInputStream`。

## 格式化

### 縮排

使用四個空格進行縮排。不要使用 tab。

對於花括號，將起始花括號放在結構開始行的末尾，並將結束花括號放在單獨的一行，且與起始結構水平對齊。

```kotlin
if (elements != null) {
    for (element in elements) {
        // ...
    }
}
```

> 在 Kotlin 中，分號是可選的，因此換行具有重要意義。語言設計採用 Java 風格的花括號，如果您嘗試使用不同的格式風格，可能會遇到意外行為。
>
{style="note"}

### 水平空白字元

* 在二元運算子前後加上空格 (`a + b`)。例外：不要在「range to」運算子前後加上空格 (`0..i`)。
* 不要在一元運算子前後加上空格 (`a++`)。
* 在控制流關鍵字 (`if`、`when`、`for` 和 `while`) 與對應的起始括號之間加上空格。
* 在主建構函數宣告、方法宣告或方法呼叫的起始括號之前不要加空格。

```kotlin
class A(val x: Int)

fun foo(x: Int) { ... }

fun bar() {
    foo(1)
}
```

* 永遠不要在 `(`、`[` 之後或 `]`、`)` 之前加空格。
* 永遠不要在 `.` 或 `?.` 前後加上空格：`foo.bar().filter { it > 2 }.joinToString()`、`foo?.bar()`。
* 在 `//` 之後加上空格：`// This is a comment`。
* 不要在用於指定型別參數的尖括號前後加上空格：`class Map<K, V> { ... }`。
* 不要在 `::` 前後加上空格：`Foo::class`、`String::length`。
* 在用於標記可 null 型別的 `?` 之前不要加空格：`String?`。

作為一般規則，避免任何形式的水平對齊。將識別符重命名為不同長度的名稱不應影響宣告或任何用法的格式。

### 冒號

在以下情況下，請在 `:` 之前加上空格：

* 當它用於分隔型別和超型別時。
* 當委派給超類別建構函式或同一個類別的不同建構函式時。
* 在 `object` 關鍵字之後。
    
當 `:` 分隔宣告及其型別時，不要在其之前加空格。
 
始終在 `:` 之後加上空格。

```kotlin
abstract class Foo<out T : Any> : IFoo {
    abstract fun foo(a: Int): T
}

class FooImpl : Foo() {
    constructor(x: String) : this(x) { /*...*/ }

    val x = object : IFoo { /*...*/ } 
}
```

### 類別頁首

具有少量主建構函式參數的類別可以寫在一行中：

```kotlin
class Person(id: Int, name: String)
```

具有較長頁首的類別應進行格式化，使每個主建構函式參數都位於單獨的縮排行中。此外，右括號應另起新行。如果您使用繼承，則超類別建構函式呼叫或實作的介面列表應與括號位於同一行：

```kotlin
class Person(
    id: Int,
    name: String,
    surname: String
) : Human(id, name) { /*...*/ }
```

對於多個介面，應先放置超類別建構函式呼叫，然後將每個介面放在不同的行中：

```kotlin
class Person(
    id: Int,
    name: String,
    surname: String
) : Human(id, name),
    KotlinMaker { /*...*/ }
```

對於具有長超型別列表的類別，在冒號後換行，並將所有超型別名稱水平對齊：

```kotlin
class MyFavouriteVeryLongClassHolder :
    MyLongHolder<MyFavouriteVeryLongClass>(),
    SomeOtherInterface,
    AndAnotherOne {

    fun foo() { /*...*/ }
}
```

為了在類別頁首較長時清楚地分隔類別頁首和主體，可以在類別頁首後放置一個空白行（如上例所示），或者將起始花括號放在單獨的一行：

```kotlin
class MyFavouriteVeryLongClassHolder :
    MyLongHolder<MyFavouriteVeryLongClass>(),
    SomeOtherInterface,
    AndAnotherOne 
{
    fun foo() { /*...*/ }
}
```

建構函式參數使用一般縮排（四個空格）。這可確保在主建構函式中宣告的屬性與在類別主體中宣告的屬性具有相同的縮排。

### 修飾詞順序

如果宣告有多個修飾詞，請始終按以下順序排列：

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
enum / annotation / fun // 作為 `fun interface` 中的修飾詞
companion
inline / value
infix
operator
data
```

將所有註解放在修飾詞之前：

```kotlin
@Named("Foo")
private val foo: Foo
```

除非您正在開發程式庫，否則請省略冗餘的修飾詞（例如 `public`）。

### 註解

將註解放在其所附加的宣告之前的單獨行中，並使用相同的縮排：

```kotlin
@Target(AnnotationTarget.PROPERTY)
annotation class JsonExclude
```

沒有引數的註解可以放在同一行：

```kotlin
@JsonExclude @JvmField
var x: String
```

單個沒有引數的註解可以與相應的宣告放在同一行：

```kotlin
@Test fun foo() { /*...*/ }
```

### 檔案註解

檔案註解放在檔案註解（如果有）之後，`package` 陳述式之前，並與 `package` 用空白行隔開（以強調它們針對的是檔案而非套件）。

```kotlin
/** License, copyright and whatever */
@file:JvmName("FooBar")

package foo.bar
```

### 函式

如果函式簽章無法放在一行中，請使用以下語法：

```kotlin
fun longMethodName(
    argument: ArgumentType = defaultValue,
    argument2: AnotherArgumentType,
): ReturnType {
    // body
}
```

函式參數使用一般縮排（四個空格）。這有助於確保與建構函式參數的一致性。

對於主體由單個運算式組成的函式，優先使用運算式主體。

```kotlin
fun foo(): Int {     // 差
    return 1 
}

fun foo() = 1        // 好
```

### 運算式主體

如果函式具有運算式主體，且其第一行與宣告不在同一行，請將 `=` 號放在第一行，並將運算式主體縮排四個空格。

```kotlin
fun f(x: String, y: String, z: String) =
    veryLongFunctionCallWithManyWords(andLongParametersToo(), x, y, z)
```

### 屬性

對於非常簡單的唯讀屬性，請考慮單行格式：

```kotlin
val isEmpty: Boolean get() = size == 0
```

對於更複雜的屬性，請務必將 `get` 和 `set` 關鍵字放在單獨的行中：

```kotlin
val foo: String
    get() { /*...*/ }
```

對於具有初始設定式的屬性，如果初始設定式很長，請在 `=` 號後換行，並將初始設定式縮排四個空格：

```kotlin
private val defaultCharset: Charset? =
    EncodingRegistry.getInstance().getDefaultCharsetForPropertiesFiles(file)
```

### 控制流陳述式

如果 `if` 或 `when` 陳述式的條件有多行，請務必在陳述式主體周圍使用花括號。
將條件的每個後續行相對於陳述式開頭縮排四個空格。
將條件的右括號與起始花括號一起放在單獨的一行中：

```kotlin
if (!component.isSyncing &&
    !hasAnyKotlinRuntimeInScope(module)
) {
    return createKotlinNotConfiguredPanel(module)
}
```

這有助於對齊條件和陳述式主體。 

將 `else`、`catch`、`finally` 關鍵字以及 `do-while` 迴圈的 `while` 關鍵字放在前一個花括號的同一行：

```kotlin
if (condition) {
    // body
} else {
    // else part
}

try {
    // body
} finally {
    // cleanup
}
```

在 `when` 陳述式中，如果一個分支超過一行，請考慮用空白行將其與相鄰的 case 區塊分開：

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

將簡短的分支與條件放在同一行，不加花括號。

```kotlin
when (foo) {
    true -> bar() // 好
    false -> { baz() } // 差
}
```

### 方法呼叫

在長引數列表中，在左括號後換行。引數縮排四個空格。
將多個密切相關的引數分組在同一行。

```kotlin
drawSquare(
    x = 10, y = 10,
    width = 100, height = 100,
    fill = true
)
```

在分隔引數名稱和值的 `=` 號前後加上空格。

### 包裝鏈式呼叫

包裝鏈式呼叫時，將 `.` 字元或 `?.` 運算子放在下一行，並進行單次縮排：

```kotlin
val anchor = owner
    ?.firstChild!!
    .siblings(forward = true)
    .dropWhile { it is PsiComment || it is PsiWhiteSpace }
```

鏈中的第一個呼叫通常應在其之前換行，但如果這樣做程式碼更具意義，則可以省略。

### Lambda

在 Lambda 運算式中，花括號前後以及分隔參數與主體的箭頭前後應使用空格。如果一個呼叫接受單個 Lambda，請儘可能將其傳遞到括號外。

```kotlin
list.filter { it > 10 }
```

如果為 Lambda 分配標籤，不要在標籤和起始花括號之間加空格：

```kotlin
fun foo() {
    ints.forEach lit@{
        // ...
    }
}
```

在多行 Lambda 中宣告參數名稱時，將名稱放在第一行，後跟箭頭和換行：

```kotlin
appendCommaSeparated(properties) { prop ->
    val propertyValue = prop.get(obj)  // ...
}
```

如果參數列表太長而無法放進一行，請將箭頭放在單獨的一行：

```kotlin
foo {
    context: Context,
    environment: Env
    ->
    context.configureEnv(environment)
}
```

### 尾隨逗號

尾隨逗號是系列元素中最後一項之後的逗號符號：

```kotlin
class Person(
    val firstName: String,
    val lastName: String,
    val age: Int, // 尾隨逗號
)
```

使用尾隨逗號有幾個優點：

* 它使版本控制的 diff 更乾淨 —— 因為所有的焦點都在更改後的值上。
* 它使添加和重新排序元素變得容易 —— 如果您操作元素，則無需添加或刪除逗號。
* 它簡化了程式碼產生，例如對於物件初始設定式。最後一個元素也可以有逗號。

尾隨逗號是完全可選的 —— 沒有它們，您的程式碼仍然可以運作。Kotlin 風格指南鼓勵在宣告處使用尾隨逗號，而在呼叫處則由您自行決定。

要在 IntelliJ IDEA 格式化程式中啟用尾隨逗號，請前往 **Settings/Preferences | Editor | Code Style | Kotlin**，開啟 **Other** 分頁並選擇 **Use trailing comma** 選項。

#### 列舉 {initial-collapse-state="collapsed" collapsible="true"}

```kotlin
enum class Direction {
    NORTH,
    SOUTH,
    WEST,
    EAST, // 尾隨逗號
}
```

#### 值引數 {initial-collapse-state="collapsed" collapsible="true"}

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

#### 類別屬性和參數 {initial-collapse-state="collapsed" collapsible="true"}

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

#### 函式值參數 {initial-collapse-state="collapsed" collapsible="true"}

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

#### 具有可選型別的參數（包括 setter） {initial-collapse-state="collapsed" collapsible="true"}

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

#### 索引後綴 {initial-collapse-state="collapsed" collapsible="true"}

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

#### Lambda 中的參數 {initial-collapse-state="collapsed" collapsible="true"}

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

#### when 項目 {initial-collapse-state="collapsed" collapsible="true"}

```kotlin
fun isReferenceApplicable(myReference: `KClass<*>`) = when (myReference) {
    Comparable::class,
    Iterable::class,
    String::class, // 尾隨逗號
        -> true
    else -> false
}
```

#### 集合常值（在註解中） {initial-collapse-state="collapsed" collapsible="true"}

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

#### 型別引數 {initial-collapse-state="collapsed" collapsible="true"}

```kotlin
fun <T1, T2> foo() {}
fun main() {
    foo<
            Comparable<Number>,
            Iterable<Number>, // 尾隨逗號
            >()
}
```

#### 型別參數 {initial-collapse-state="collapsed" collapsible="true"}

```kotlin
class MyMap<
        MyKey,
        MyValue, // 尾隨逗號
        > {}
```

#### 解構宣告 {initial-collapse-state="collapsed" collapsible="true"}

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

## 文件註解

對於較長的文件註解，將起始的 `/**` 放在單獨的一行，並以星號開始後續的每一行：

```kotlin
/**
 * This is a documentation comment
 * on multiple lines.
 */
```

簡短的註解可以放在同一行：

```kotlin
/** This is a short documentation comment. */
```

通常，避免使用 `@param` 和 `@return` 標籤。相反，將參數和傳回值的描述直接納入文件註解中，並在提到參數的地方添加連結。僅當需要長篇描述且無法納入正文流程時，才使用 `@param` 和 `@return`。

```kotlin
// 避免這樣做：

/**
 * Returns the absolute value of the given number.
 * @param number The number to return the absolute value for.
 * @return The absolute value.
 */
fun abs(number: Int): Int { /*...*/ }

// 應該這樣做：

/**
 * Returns the absolute value of the given [number].
 */
fun abs(number: Int): Int { /*...*/ }
```

## 避免冗餘結構

一般而言，如果 Kotlin 中的某個語法結構是可選的，且被 IDE 醒目提示為冗餘，則應在程式碼中省略它。不要僅僅「為了清楚起見」在程式碼中保留不必要的語法元素。

### Unit 回傳型別

如果函式回傳 Unit，則應省略回傳型別：

```kotlin
fun foo() { // 這裡省略了 ": Unit"

}
```

### 分號

儘可能省略分號。

### 字串範本

在字串範本中插入簡單變數時不要使用花括號。僅對較長的運算式使用花括號：

```kotlin
println("$name has ${children.size} children")
```

使用 [多錢符號字串插值](strings.md#multi-dollar-string-interpolation) 將錢符號字元視為字串常值：

```kotlin
val `KClass<*>`.jsonSchema : String
    get() = $"""
        {
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "$id": "https://example.com/product.schema.json",
            "$dynamicAnchor": "meta",
            "title": "${simpleName ?: qualifiedName ?: "unknown"}",
            "type": "object"
        }
        """
```

## 語言特性的慣用用法

### 不可變性

優先使用不可變資料而非可變資料。如果區域變數和屬性在初始化後不會被修改，請務必將其宣告為 `val` 而非 `var`。

始終使用不可變集合介面 (`Collection`、`List`、`Set`、`Map`) 來宣告不會被修改的集合。當使用工廠方法建立集合執行個體時，儘可能使用傳回不可變集合型別的函式：

```kotlin
// 差：對不會被修改的值使用可變集合型別
fun validateValue(actualValue: String, allowedValues: HashSet<String>) { ... }

// 好：改用不可變集合型別
fun validateValue(actualValue: String, allowedValues: Set<String>) { ... }

// 差：arrayListOf() 傳回 ArrayList<T>，這是一種可變集合型別
val allowedValues = arrayListOf("a", "b", "c")

// 好：listOf() 傳回 List<T>
val allowedValues = listOf("a", "b", "c")
```

### 預設參數值

優先宣告具有預設參數值的函式，而非宣告多載函式。

```kotlin
// 差
fun foo() = foo("a")
fun foo(a: String) { /*...*/ }

// 好
fun foo(a: String = "a") { /*...*/ }
```

### 型別別名

如果您在程式碼庫中多次使用某個函式型別或帶有型別參數的型別，優先為其定義型別別名：

```kotlin
typealias MouseClickHandler = (Any, MouseEvent) -> Unit
typealias PersonIndex = Map<String, Person>
```
如果您使用私有或內部的型別別名來避免名稱衝突，請優先使用 [套件與匯入](packages.md) 中提到的 `import ... as ...`。

### Lambda 參數

在簡短且非巢狀的 Lambda 中，建議使用 `it` 慣例，而非顯式宣告參數。在具有參數的巢狀 Lambda 中，請務必顯式宣告參數。

### Lambda 中的 return

避免在 Lambda 中使用多個標記 return。考慮重構 Lambda，使其只有一個出口點。
如果這不可能或不夠清晰，請考慮將 Lambda 轉換為匿名函式。

不要對 Lambda 中的最後一個陳述式使用標記 return。

### 具名引數

當一個方法接受多個相同基礎型別的參數，或者對於 `Boolean` 型別的參數，除非所有參數的含義從上下文來看絕對清晰，否則請使用具名引數語法。

```kotlin
drawSquare(x = 10, y = 10, width = 100, height = 100, fill = true)
```

### 條件陳述式

優先使用 `try`、`if` 和 `when` 的運算式形式。

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

### if 與 when

對於二元條件，優先使用 `if` 而非 `when`。
例如，使用 `if` 的這種語法：

```kotlin
if (x == null) ... else ...
```

而非使用 `when` 的這種語法：

```kotlin
when (x) {
    null -> // ...
    else -> // ...
}
```

如果有三個或更多選項，優先使用 `when`。

### when 運算式中的守衛條件

在 `when` 運算式或帶有 [守衛條件](control-flow.md#guard-conditions-in-when-expressions) 的陳述式中組合多個布林運算式時，請使用括號：

```kotlin
when (status) {
    is Status.Ok if (status.info.isEmpty() || status.info.id == null) -> "no information"
}
```

而非：

```kotlin
when (status) {
    is Status.Ok if status.info.isEmpty() || status.info.id == null -> "no information"
}
```

### 條件中的可 Null 布林值

如果您需要在條件陳述式中使用可 null 的 `Boolean`，請使用 `if (value == true)` 或 `if (value == false)` 檢查。

### 迴圈

優先使用高階函式 (`filter`、`map` 等) 而非迴圈。例外：`forEach`（優先使用一般 `for` 迴圈，除非 `forEach` 的接收者是可 null 的，或者 `forEach` 是較長呼叫鏈的一部分）。

在具有多個高階函式的複雜運算式與迴圈之間進行選擇時，請了解每種情況下執行的操作成本，並牢記效能考量。 

### 範圍上的迴圈

使用 `..<` 運算子在開區間範圍上進行迴圈：

```kotlin
for (i in 0..n - 1) { /*...*/ }  // 差
for (i in 0..<n) { /*...*/ }  // 好
```

### 字串

優先使用字串範本而非字串連接。

優先使用多行字串，而非在一般字串常值中嵌入 `
` 轉義序列。

要在多行字串中保持縮排，當產生的字串不需要任何內部縮排時，請使用 `trimIndent`；當需要內部縮排時，請使用 `trimMargin`：

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

了解 [Java 與 Kotlin 多行字串](java-to-kotlin-idioms-strings.md#use-multiline-strings) 之間的差異。

### 函式 vs 屬性

在某些情況下，無引數的函式可能與唯讀屬性互換。
儘管語義相似，但在何時優先選擇其中一個方面存在一些風格慣例。

當底層演算法滿足以下條件時，優先選擇屬性而非函式：

* 不會拋出例外。
* 計算成本低（或在首次執行時快取）。
* 如果物件狀態未更改，則在多次叫用中傳回相同的結果。

### 擴充函式

大量使用擴充函式。每當您有一個主要作用於某個物件的函式時，請考慮將其設為接受該物件作為接收者的擴充函式。為了儘量減少 API 污染，請儘可能限制擴充函式的可見性。根據需要，使用區域擴充函式、成員擴充函式或具有私有可見性的頂層擴充函式。

### 中綴函式

僅當一個函式作用於扮演類似角色的兩個物件時，才將其宣告為 `infix`。好的例子：`and`、`to`、`zip`。
差的例子：`add`。

如果一個方法修改了接收者物件，請不要將其宣告為 `infix`。

### 工廠方法

如果您為一個類別宣告一個工廠方法，請避免給它與類別本身相同的名稱。優先使用獨特的名稱，清楚說明為何該工廠方法的行為是特殊的。只有在確實沒有特殊語義的情況下，才可以使用與類別相同的名稱。

```kotlin
class Point(val x: Double, val y: Double) {
    companion object {
        fun fromPolar(angle: Double, radius: Double) = Point(...)
    }
}
```

如果您有一個物件具有多個多載建構函式，且這些建構函式不呼叫不同的超類別建構函式，且無法簡化為包含預設值參數的單個建構函式，則優先用工廠方法取代多載建構函式。

### 平台型別

傳回平台型別運算式的公開函式/方法必須顯式宣告其 Kotlin 型別：

```kotlin
fun apiCall(): String = MyJavaApi.getProperty("name")
```

任何使用平台型別運算式初始化的屬性（套件級別或類別級別）都必須顯式宣告其 Kotlin 型別：

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

### 作用域函式 apply/with/run/also/let

Kotlin 提供了一組函式，用於在指定物件的上下文中執行程式碼區塊：`let`、`run`、`with`、`apply` 和 `also`。
有關為您的情況選擇正確作用域函式的指導，請參閱 [作用域函式](scope-functions.md)。

## 程式庫的編碼慣例

在撰寫程式庫時，建議遵循額外的一組規則以確保 API 穩定性：

 * 務必顯式指定成員可見性（以避免意外地將宣告公開為公開 API）。
 * 務必顯式指定函式回傳型別和屬性型別（以避免在實作更改時意外更改回傳型別）。
 * 為所有公開成員提供 [KDoc](kotlin-doc.md) 註解，但不需要任何新文件的覆寫除外（以支援為程式庫產生文件）。

在 [程式庫作者準則](api-guidelines-introduction.md) 中了解更多關於撰寫程式庫 API 時應考慮的最佳實務和想法。