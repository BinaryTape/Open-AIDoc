[//]: # (title: 程式碼慣例)

眾所周知且易於遵循的程式碼慣例對於任何程式語言都至關重要。
在此，我們為使用 Kotlin 的專案提供程式碼風格和程式碼組織指引。

## 在 IDE 中設定風格 {id="configure-style-in-ide"}

Kotlin 最受歡迎的兩款 IDE——[IntelliJ IDEA](https://www.jetbrains.com/idea/) 與 [Android Studio](https://developer.android.com/studio/)，
為程式碼風格設定提供了強大的支援。你可以設定它們以自動格式化你的程式碼，使其與指定的程式碼風格保持一致。
 
### 套用風格指南 {id="apply-the-style-guide"}

1. 前往 **Settings/Preferences | Editor | Code Style | Kotlin**。
2. 點擊 **Set from...**。
3. 選擇 **Kotlin style guide**。

### 驗證程式碼是否符合風格指南 {id="verify-that-your-code-follows-the-style-guide"}

1. 前往 **Settings/Preferences | Editor | Inspections | General**。
2. 開啟 **Incorrect formatting** 檢查。
驗證風格指南中所述其他問題（例如命名慣例）的額外檢查在預設情況下已啟用。

<!-- 當指南移動時替換為外部連結 -->

欲了解更多資訊，請參閱[使用 IntelliJ IDEA 遷移至 Kotlin 程式碼風格](code-style-migration-guide.md)指南。

## 原始碼組織 {id="source-code-organization"}

### 目錄結構 {id="directory-structure"}

在純 Kotlin 專案中，建議的目錄結構遵循套件結構，並省略共同根套件。例如，如果專案中的所有程式碼都在 `org.example.kotlin` 套件及其子套件中，則帶有 `org.example.kotlin` 套件的檔案應直接放在原始碼根目錄下，而 `org.example.kotlin.network.socket` 中的檔案應放在原始碼根目錄的 `network/socket` 子目錄中。

>在 JVM 上：在 Kotlin 與 Java 混合使用的專案中，Kotlin 原始碼檔案應與 Java 原始碼檔案位於同一個原始碼根目錄下，並遵循相同的目錄結構：每個檔案都應儲存在對應於各個套件宣告的目錄中。
>
{style="note"}

### 原始檔名稱 {id="source-file-names"}

如果 Kotlin 檔案包含單一類別或介面（可能包含相關的頂層宣告），其名稱應與類別名稱相同，並附加 `.kt` 副檔名。這適用於所有類型的類別與介面。
如果檔案包含多個類別，或僅包含頂層宣告，請選擇一個能描述該檔案內容的名稱，並相應地命名該檔案。
使用[大駝峰式命名法 (upper camel case)](https://en.wikipedia.org/wiki/Camel_case)，即每個單字的首字母大寫。
例如，`ProcessDeclarations.kt`。

檔案名稱應描述檔案中程式碼的作用。因此，應避免在檔案名稱中使用無意義的字詞，例如 `Util`。

#### 多平台專案 {id="multiplatform-projects"}

在多平台專案中，平台專屬原始碼集中包含頂層宣告的檔案應具有與原始碼集名稱關聯的後綴。例如：

* **jvm**Main/kotlin/Platform.**jvm**.kt
* **android**Main/kotlin/Platform.**android**.kt
* **ios**Main/kotlin/Platform.**ios**.kt

對於通用原始碼集 (common source set)，包含頂層宣告的檔案不應包含後綴。例如，`commonMain/kotlin/Platform.kt`。

##### 技術細節 {initial-collapse-state="collapsed" collapsible="true" id="technical-details"}

我們建議在多平台專案中遵循此檔案命名架構，原因在於 JVM 的限制：它不允許頂層成員（函式、屬性）。

為了解決這個問題，Kotlin JVM 編譯器會建立包裝類別（所謂的「檔案外觀 (file facades)」），其中包含頂層成員宣告。檔案外觀具有一個衍生自檔案名稱的內部名稱。

反過來，JVM 不允許具有相同完全限定名稱 (FQN) 的多個類別。這可能會導致 Kotlin 專案無法編譯為 JVM 的情況：

```none
root
|- commonMain/kotlin/myPackage/Platform.kt // 包含 'fun count() { }'
|- jvmMain/kotlin/myPackage/Platform.kt // 包含 'fun multiply() { }'
```

在這裡，兩個 `Platform.kt` 檔案都位於同一個套件中，因此 Kotlin JVM 編譯器會產生兩個檔案外觀，兩者的 FQN 皆為 `myPackage.PlatformKt`。這會產生 "Duplicate JVM classes" 錯誤。

避免這種情況最簡單的方法是根據上述指引重新命名其中一個檔案。這種命名架構有助於避免衝突，同時保持程式碼的可讀性。

> 在以下兩種情況下，這些建議可能看起來有些多餘，但我們仍建議遵循：
> 
> * 非 JVM 平台不會遇到重複檔案外觀的問題。但是，這種命名架構可以幫助你保持檔案命名的一致性。
> * 在 JVM 上，如果原始碼檔案沒有頂層宣告，則不會產生檔案外觀，你也不會面臨命名衝突。
> 
>   然而，這種命名架構可以幫助你避免在進行簡單重構或新增程式碼時引入頂層函式，進而導致相同的 "Duplicate JVM classes" 錯誤。
> 
{style="tip"}

### 原始檔組織 {id="source-file-organization"}

只要宣告（類別、頂層函式或屬性）在語意上彼此緊密相關，且檔案大小保持合理（不超過數百行），我們鼓勵將多個宣告放在同一個 Kotlin 原始碼檔案中。

特別是，當為某個類別定義對該類別的所有客戶端都相關的擴充函式時，請將它們與該類別本身放在同一個檔案中。當定義僅對特定客戶端有意義的擴充函式時，請將它們放在該客戶端的程式碼旁邊。避免僅為了容納某個類別的所有擴充功能而建立檔案。

### 類別配置 {id="class-layout"}

類別的內容應依循以下順序排列：

1. 屬性宣告與初始設定式區塊
2. 次建構函式
3. 方法宣告
4. 伴隨物件 (Companion object)

不要依字母順序或可見性對方法宣告進行排序，也不要將一般方法與擴充方法分開。相反地，將相關的內容放在一起，以便從頭到尾閱讀類別的人可以理解發生的邏輯。選擇一種順序（高階內容在前，反之亦然）並堅持下去。

將巢狀類別放在使用這些類別的程式碼旁邊。如果這些類別打算在外部使用且在類別內部未被參照，請將它們放在最後，即伴隨物件之後。

### 介面實作配置 {id="interface-implementation-layout"}

實作介面時，請保持實作成員的順序與介面成員的順序相同（如有必要，可穿插用於實作的額外 private 方法）。

### 多載配置 {id="overload-layout"}

在類別中，請始終將多載項目放在一起。

## 命名規則 {id="naming-rules"}

Kotlin 中的套件與類別命名規則非常簡單：

* 套件名稱一律小寫且不使用底線 (`org.example.project`)。通常不建議使用多個單字的名稱，但如果確實需要使用多個單字，可以將它們直接串接在一起或使用駝峰式大小寫 (`org.example.myProject`)。

* 類別與物件的名稱使用大駝峰式命名法：

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

### 類別風格函式的名稱 {id="names-for-class-like-functions"}

在兩種例外情況下，函式名稱應改為遵循類別命名慣例。
這類函式通常定義在頂層。

* 建立類別執行個體的工廠函式可以與抽象回傳型別同名：

   ```kotlin
   interface Foo { /*...*/ }

   class FooImpl : Foo { /*...*/ }

   fun Foo(): Foo { return FooImpl() }
   ```

* 回傳 `Unit` 的 `@Composable` 函式：

   ```kotlin
   @Composable fun TabHeader { /*...*/ }
   ```

### 測試方法的名稱 {id="names-for-test-methods"}

在測試中（且**僅**在測試中），你可以使用以反引號括起來且包含空格的方法名稱。
請注意，此類方法名稱僅自 API 級別 30 起由 Android 執行階段支援。測試程式碼中也允許在方法名稱中使用底線。

```kotlin
class MyTestCase {
    @Test fun `ensure everything works`() { /*...*/ }

    @Test fun ensureEverythingWorks_onAndroid() { /*...*/ }
}
```

### 屬性名稱 {id="property-names"}

常數的名稱（標記為 `const` 的屬性，或沒有自訂 `get` 函式且持有深層不可變資料的頂層或物件 `val` 屬性）應遵循[大寫蛇形命名法 (screaming snake case)](https://en.wikipedia.org/wiki/Snake_case) 慣例，全部使用大寫字母並以底線分隔：

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

對於列舉常數，根據使用情況，可以使用全部大寫、底線分隔的名稱（[大寫蛇形命名法](https://en.wikipedia.org/wiki/Snake_case)）（`enum class Color { RED, GREEN }`）或大駝峰式名稱。
   
### 支援屬性的名稱 {id="names-for-backing-properties"}

如果一個類別具有兩個概念上相同，但其中一個是公用 API 的一部分、另一個是實作細節的屬性，請使用底線作為私有屬性名稱的前綴：

```kotlin
class C {
    private val _elementList = mutableListOf<Element>()

    val elementList: List<Element>
        get() = _elementList
}
```

### 選擇好名稱 {id="choose-good-names"}

類別的名稱通常是一個名詞或名詞片語，解釋該類別**是什麼**：`List`、`PersonReader`。

方法的名稱通常是一個動詞或動詞片語，說明該方法**做什麼**：`close`、`readPersons`。
名稱還應該提示該方法是修改物件還是傳回一個新物件。例如，`sort` 是對集合進行就地排序，而 `sorted` 則是傳回集合的已排序複本。

名稱應該清楚表明實體的用途，因此最好避免在名稱中使用無意義的字詞（`Manager`、`Wrapper`）。

當使用首字母縮略詞作為宣告名稱的一部分時，請遵循以下規則：

* 對於兩個字母的縮略詞，兩個字母都使用大寫。例如，`IOStream`。
* 對於超過兩個字母的縮略詞，僅首字母大寫。例如，`XmlFormatter` 或 `HttpInputStream`。

## 格式化 {id="formatting"}

### 縮排 {id="indentation"}

使用四個空格進行縮排。不要使用 Tab。

對於花括號，將左花括號放在結構開始行的結尾，並將右花括號放在與開始結構水平對齊的單獨行上。

```kotlin
if (elements != null) {
    for (element in elements) {
        // ...
    }
}
```

>在 Kotlin 中，分號是可選的，因此分行具有語意意義。語言設計採用 Java 風格的花括號，如果嘗試使用不同的格式風格，可能會遇到非預期的行為。
>
{style="note"}

### 水平空白字元 {id="horizontal-whitespace"}

* 在二元運算子周圍加上空格 (`a + b`)。例外情況：不要在「range to」運算子周圍加上空格 (`0..i`)。
* 不要在單元運算子周圍加上空格 (`a++`)。
* 在控制流程關鍵字（`if`、`when`、`for` 和 `while`）與對應的左圓括號之間加上空格。
* 在主建構函數宣告、方法宣告或方法呼叫中的左圓括號之前不要加空格。

```kotlin
class A(val x: Int)

fun foo(x: Int) { ... }

fun bar() {
    foo(1)
}
```

* 絕不要在 `(`、`[` 之後，或 `]`、`)` 之前加空格。
* 絕不要在 `.` 或 `?.` 周圍加空格：`foo.bar().filter { it > 2 }.joinToString()`、`foo?.bar()`。
* 在 `//` 之後加上空格：`// This is a comment`。
* 不要在用於指定型別參數的尖括號周圍加上空格：`class Map<K, V> { ... }`。
* 不要在 `::` 周圍加空格：`Foo::class`、`String::length`。
* 不要在用於標記可空型別的 `?` 之前加空格：`String?`。

作為一般規則，避免任何形式的水平對齊。將識別符號重新命名為長度不同的名稱不應影響宣告或任何使用情況的格式。

### 冒號 {id="colon"}

在以下情況下，在 `:` 之前加上空格：

* 當用於分隔型別與超型別時。
* 當委託給超類別建構函式或同一類別的不同建構函式時。
* 在 `object` 關鍵字之後。
    
當冒號用於分隔宣告與其型別時，前面不要加空格。
 
在 `:` 後面始終加上空格。

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

只有少數主建構函數參數的類別可以寫成單行：

```kotlin
class Person(id: Int, name: String)
```

具有較長標頭的類別應進行格式化，使每個主建構函數參數都位於帶有縮排的單獨行中。
此外，右圓括號應位於新行上。如果使用繼承，超類別建構函式呼叫或實作的介面清單應與圓括號位於同一行：

```kotlin
class Person(
    id: Int,
    name: String,
    surname: String
) : Human(id, name) { /*...*/ }
```

對於多個介面，超類別建構函式呼叫應排在第一位，然後每個介面應位於不同行：

```kotlin
class Person(
    id: Int,
    name: String,
    surname: String
) : Human(id, name),
    KotlinMaker { /*...*/ }
```

對於具有長超型別清單的類別，請在冒號後換行並水平對齊所有超型別名稱：

```kotlin
class MyFavouriteVeryLongClassHolder :
    MyLongHolder<MyFavouriteVeryLongClass>(),
    SomeOtherInterface,
    AndAnotherOne {

    fun foo() { /*...*/ }
}
```

為了在類別標頭較長時明確分隔類別標頭和主體，可以在類別標頭後面加上一行空白行（如上例所示），或者將左花括號放在單獨一行上：

```kotlin
class MyFavouriteVeryLongClassHolder :
    MyLongHolder<MyFavouriteVeryLongClass>(),
    SomeOtherInterface,
    AndAnotherOne 
{
    fun foo() { /*...*/ }
}
```

建構函式參數使用標準縮排（四個空格）。這可確保在主建構函數中宣告的屬性與在類別主體中宣告的屬性具有相同的縮排。

### 修飾詞順序 {id="modifiers-order"}

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

除非你正在開發程式庫，否則請省略多餘的修飾詞（例如 `public`）。

### 註解 {id="annotations"}

將註解放在其所附加的宣告之前的單獨行上，並具有相同的縮排：

```kotlin
@Target(AnnotationTarget.PROPERTY)
annotation class JsonExclude
```

沒有引數的註解可以放在同一行：

```kotlin
@JsonExclude @JvmField
var x: String
```

單一沒有引數的註解可以與相應的宣告放在同一行：

```kotlin
@Test fun foo() { /*...*/ }
```

### 檔案註解 {id="file-annotations"}

檔案註解放在檔案註解（若有）之後、`package` 陳述式之前，並用一行空白行與 `package` 分隔（以強調它們是針對檔案而非套件）。

```kotlin
/** License, copyright and whatever */
@file:JvmName("FooBar")

package foo.bar
```

### 函式 {id="functions"}

如果函式簽章無法容納在單行中，請使用以下語法：

```kotlin
fun longMethodName(
    argument: ArgumentType = defaultValue,
    argument2: AnotherArgumentType,
): ReturnType {
    // body
}
```

函式參數使用標準縮排（四個空格）。這有助於確保與建構函式參數的一致性。

對於主體由單一運算式組成的函式，優先使用運算式主體。

```kotlin
fun foo(): Int {     // 不良
    return 1 
}

fun foo() = 1        // 良好
```

### 運算式主體 {id="expression-bodies"}

如果函式具有運算式主體，且其第一行與宣告無法容納在同一行中，請將 `=` 符號放在第一行，並將運算式主體縮排四個空格。

```kotlin
fun f(x: String, y: String, z: String) =
    veryLongFunctionCallWithManyWords(andLongParametersToo(), x, y, z)
```

### 屬性 {id="properties"}

對於非常簡單的唯讀屬性，考慮單行格式：

```kotlin
val isEmpty: Boolean get() = size == 0
```

對於更複雜的屬性，始終將 `get` 和 `set` 關鍵字放在單獨的行上：

```kotlin
val foo: String
    get() { /*...*/ }
```

對於具有初始設定式的屬性，如果初始設定式較長，請在 `=` 符號後換行，並將初始設定式縮排四個空格：

```kotlin
private val defaultCharset: Charset? =
    EncodingRegistry.getInstance().getDefaultCharsetForPropertiesFiles(file)
```

### 控制流程敘述 {id="control-flow-statements"}

如果 `if` 或 `when` 敘述的條件是多行的，請始終在該陳述式的主體周圍使用花括號。
相對於敘述的開頭，將條件的每個後續行縮排四個空格。
將條件的右圓括號與左花括號一起放在單獨一行上：

```kotlin
if (!component.isSyncing &&
    !hasAnyKotlinRuntimeInScope(module)
) {
    return createKotlinNotConfiguredPanel(module)
}
```

這有助於對齊條件與敘述主體。

將 `else`、`catch`、`finally` 關鍵字以及 `do-while` 迴圈的 `while` 關鍵字與前一個花括號放在同一行：

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

在 `when` 敘述中，如果分支超過一行，請考慮使用空白行將其與相鄰的 case 區塊分隔開：

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
    true -> bar() // 良好
    false -> { baz() } // 不良
}
```

### 方法呼叫 {id="method-calls"}

在長引數清單中，在左圓括號後換行。將引數縮排四個空格。
將多個密切相關的引數分組在同一行上。

```kotlin
drawSquare(
    x = 10, y = 10,
    width = 100, height = 100,
    fill = true
)
```

在分隔引數名稱和值的 `=` 符號周圍加上空格。

### 鏈式呼叫換行 {id="wrap-chained-calls"}

當對鏈式呼叫換行時，將 `.` 字元或 `?.` 運算子放在下一行，並加上單次縮排：

```kotlin
val anchor = owner
    ?.firstChild!!
    .siblings(forward = true)
    .dropWhile { it is PsiComment || it is PsiWhiteSpace }
```

鏈中的第一個呼叫通常前面應該換行，但如果這樣做程式碼更具可讀性，也可以省略換行。

### Lambda {id="lambdas"}

在 Lambda 運算式中，花括號周圍以及分隔參數與主體的箭頭周圍都應加上空格。如果呼叫接受單一 Lambda，請盡可能將其傳遞到圓括號外部。

```kotlin
list.filter { it > 10 }
```

如果為 Lambda 指派標籤，請不要在標籤和左花括號之間加空格：

```kotlin
fun foo() {
    ints.forEach lit@{
        // ...
    }
}
```

在多行 Lambda 中宣告參數名稱時，將名稱放在第一行，後面接著箭頭和換行符號：

```kotlin
appendCommaSeparated(properties) { prop ->
    val propertyValue = prop.get(obj)  // ...
}
```

如果參數清單太長而無法放在一行中，請將箭頭放在單獨一行上：

```kotlin
foo {
    context: Context,
    environment: Env
    ->
    context.configureEnv(environment)
}
```

### 尾隨逗號 {id="trailing-commas"}

尾隨逗號是位於一系列元素中最後一項後面的逗號符號：

```kotlin
class Person(
    val firstName: String,
    val lastName: String,
    val age: Int, // 尾隨逗號
)
```

使用尾隨逗號有幾個好處：

* 它使版本控制 diff 更加乾淨——因為所有焦點都在變更的值上。
* 它使新增和重新排序元素變得容易——如果你操作元素，則無需新增或刪除逗號。
* 它簡化了程式碼產生，例如對於物件初始設定式。最後一個元素也可以有逗號。

尾隨逗號完全是可選的——沒有它們你的程式碼仍然可以正常運作。Kotlin 風格指南鼓勵在宣告處使用尾隨逗號，並由你自行決定是否在呼叫點使用。

若要在 IntelliJ IDEA 格式化程式中啟用尾隨逗號，請前往 **Settings/Preferences | Editor | Code Style | Kotlin**，
開啟 **Other** 標籤並選取 **Use trailing comma** 選項。

#### 列舉 {initial-collapse-state="collapsed" collapsible="true" id="enumerations"}

```kotlin
enum class Direction {
    NORTH,
    SOUTH,
    WEST,
    EAST, // 尾隨逗號
}
```

#### 值引數 {initial-collapse-state="collapsed" collapsible="true" id="value-arguments"}

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

#### 函式值參數 {initial-collapse-state="collapsed" collapsible="true" id="function-value-parameters"}

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

#### 帶有可選型別的參數（包含 setter） {initial-collapse-state="collapsed" collapsible="true" id="parameters-with-optional-type-including-setters"}

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

#### when 條目 {initial-collapse-state="collapsed" collapsible="true" id="when-entry"}

```kotlin
fun isReferenceApplicable(myReference: KClass<*>) = when (myReference) {
    Comparable::class,
    Iterable::class,
    String::class, // 尾隨逗號
        -> true
    else -> false
}
```

#### 集合常值（在註解中） {initial-collapse-state="collapsed" collapsible="true" id="collection-literals-in-annotations"}

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

對於較長的文件註解，請將開頭的 `/**` 放在單獨一行上，並在隨後的每一行開頭都加上星號：

```kotlin
/**
 * This is a documentation comment
 * on multiple lines.
 */
```

簡短的註解可以放在單行上：

```kotlin
/** This is a short documentation comment. */
```

一般來說，避免使用 `@param` 和 `@return` 標籤。相反地，直接將參數和傳回值的描述合併到文件註解中，並在提及參數的地方新增超連結。僅在需要無法融入正文流程的冗長描述時，才使用 `@param` 和 `@return`。

```kotlin
// 避免這樣做：

/**
 * Returns the absolute value of the given number.
 * @param number The number to return the absolute value for.
 * @return The absolute value.
 */
fun abs(number: Int): Int { /*...*/ }

// 改為這樣做：

/**
 * Returns the absolute value of the given [number].
 */
fun abs(number: Int): Int { /*...*/ }
```

## 避免冗餘結構 {id="avoid-redundant-constructs"}

一般而言，如果 Kotlin 中的某個語法結構是可選的且被 IDE 醒目提示為冗餘，則應在程式碼中將其省略。不要僅僅「為了清楚起見」而將不必要的語法元素留在程式碼中。

### Unit 傳回型別 {id="unit-return-type"}

如果函式傳回 Unit，則應省略傳回型別：

```kotlin
fun foo() { // 這裡省略了 ": Unit"

}
```

### 分號 {id="semicolons"}

盡可能省略分號。

### 字串範本 {id="string-templates"}

將簡單變數插入字串範本時，不要使用花括號。僅在較長的運算式中使用花括號：

```kotlin
println("$name has ${children.size} children")
```

使用[多美元符號字串插值](strings.md#multi-dollar-string-interpolation)將美元符號字元 `$` 視為字串常值：

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

## 慣用語法特性使用 {id="idiomatic-use-of-language-features"}

### 不可變性 {id="immutability"}

優先使用不可變資料而非可變資料。如果區域變數和屬性在初始化後未被修改，請一律將其宣告為 `val` 而非 `var`。

一律使用不可變集合介面（`Collection`、`List`、`Set`、`Map`）來宣告不會被修改的集合。使用工廠函式建立集合執行個體時，盡可能使用傳回不可變集合型別的函式：

```kotlin
// 不良：對不會被修改的值使用可變集合型別
fun validateValue(actualValue: String, allowedValues: HashSet<String>) { ... }

// 良好：改為使用不可變集合型別
fun validateValue(actualValue: String, allowedValues: Set<String>) { ... }

// 不良：arrayListOf() 傳回 ArrayList<T>，這是一個可變集合型別
val allowedValues = arrayListOf("a", "b", "c")

// 良好：listOf() 傳回 List<T>
val allowedValues = listOf("a", "b", "c")
```

### 預設參數值 {id="default-parameter-values"}

優先宣告帶有預設參數值的函式，而不是宣告多載函式。

```kotlin
// 不良
fun foo() = foo("a")
fun foo(a: String) { /*...*/ }

// 良好
fun foo(a: String = "a") { /*...*/ }
```

### 型別別名 {id="type-aliases"}

如果你有一個函式型別或帶有型別參數的型別在程式碼庫中被多次使用，建議為其定義一個型別別名：

```kotlin
typealias MouseClickHandler = (Any, MouseEvent) -> Unit
typealias PersonIndex = Map<String, Person>
```
如果你使用 private 或 internal 型別別名來避免名稱衝突，請優先使用[套件與匯入](packages.md)中提到的 `import ... as ...`。

### Lambda 參數 {id="lambda-parameters"}

在簡短且未巢狀的 Lambda 中，建議使用 `it` 慣例，而不是明確宣告參數。在具有參數的巢狀 Lambda 中，請一律明確宣告參數。

### Lambda 中的回傳 {id="returns-in-a-lambda"}

避免在 Lambda 中使用多個帶標籤的 return。考慮重構 Lambda，使其具有單一結束點。
如果無法做到或不夠清晰，請考慮將 Lambda 轉換為匿名函式。

不要在 Lambda 的最後一個陳述式中使用帶標籤的 return。

### 具名引數 {id="named-arguments"}

當方法接受相同基本型別的多個參數時，或者對於 `Boolean` 型別的參數，請使用具名引數語法，除非所有參數的含義從上下文來看都非常清楚。

```kotlin
drawSquare(x = 10, y = 10, width = 100, height = 100, fill = true)
```

### 條件陳述式 {id="conditional-statements"}

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

上述寫法優於：

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

對於二元條件，優先使用 `if` 而非 `when`。
例如，使用此 `if` 語法：

```kotlin
if (x == null) ... else ...
```

而不是使用 `when` 的這種語法：

```kotlin
when (x) {
    null -> // ...
    else -> // ...
}
```

如果有三個或更多選項，請優先使用 `when`。

### when 運算式中的防護條件 {id="guard-conditions-in-when-expression"}

在帶有[防護條件](control-flow.md#guard-conditions-in-when-expressions)的 `when` 運算式或陳述式中組合多個布林運算式時，請使用圓括號：

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

優先使用高階函數（`filter`、`map` 等）而非迴圈。例外情況：`forEach`（優先使用一般 `for` 迴圈，除非 `forEach` 的接收者可為 null，或者 `forEach` 用作較長呼叫鏈的一部分）。

在具有多個高階函數的複雜運算式與迴圈之間進行選擇時，請了解每種情況下執行的操作開銷，並牢記效能考量。

### 範圍上的迴圈 {id="loops-on-ranges"}

使用 `..<` 運算子在半開區間上進行迴圈：

```kotlin
for (i in 0..n - 1) { /*...*/ }  // 不良
for (i in 0..<n) { /*...*/ }  // 良好
```

### 字串 {id="strings"}

優先使用字串範本而非字串連接。

優先使用多行字串，而不是將 `\n` 轉義序列嵌入一般字串常值中。

為了在多行字串中保持縮排，當產生的字串不需要任何內部縮排時使用 `trimIndent`，當需要內部縮排時使用 `trimMargin`：

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

### 函式與屬性 {id="functions-vs-properties"}

在某些情境下，無引數函式可能可以與唯讀屬性互換。
儘管語意相似，但在何時傾向選擇其中一種方面存在一些風格慣例。

在以下情況下，底層演算法優先選擇屬性而非函式：

* 不會擲出例外。
* 計算成本低廉（或在初次執行時進行快取）。
* 如果物件狀態未變更，多次呼叫會傳回相同的結果。

### 擴充函式 {id="extension-functions"}

自由廣泛地使用擴充函式。每當你有一個主要針對某個物件運作的函式時，請考慮將其設為接受該物件作為接收者的擴充函式。為了盡可能減少 API 污染，請在合理的範圍內盡量限制擴充函式的可見性。根據需要，使用區域擴充函式、成員擴充函式或具有 private 可見性的頂層擴充函式。

### Infix 函式 {id="infix-functions"}

僅當函式對扮演類似角色的兩個物件運作時，才將其宣告為 `infix`。良好範例：`and`、`to`、`zip`。
不良範例：`add`。

如果方法修改了接收者物件，請不要將其宣告為 `infix`。

### 工廠函式 {id="factory-functions"}

如果你為某個類別宣告工廠函式，請避免賦予它與該類別本身相同的名稱。優先使用相異的名稱，以闡明為何工廠函式的行為很特殊。只有在確實沒有特殊語意時，才可以使用與類別相同的名稱。

```kotlin
class Point(val x: Double, val y: Double) {
    companion object {
        fun fromPolar(angle: Double, radius: Double) = Point(...)
    }
}
```

如果你有一個包含多個多載建構函式的物件，這些建構函式不會呼叫不同的超類別建構函式，且無法簡化為包含預設值參數的單一建構函式，則建議將這些多載建構函式替換為工廠函式。

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

使用平台型別運算式初始化的區域值可以宣告型別，也可以不宣告：

```kotlin
fun main() {
    val name = MyJavaApi.getProperty("name")
    println(name)
}
```

### 作用域函式 apply/with/run/also/let {id="scope-functions-apply-with-run-also-let"}

Kotlin 提供了一組函式，用於在給定物件的上下文中執行程式碼區塊：`let`、`run`、`with`、`apply` 和 `also`。
關於如何為你的案例選擇合適的作用域函式之指引，請參閱[作用域函式](scope-functions.md)。

## 程式庫的編碼慣例 {id="coding-conventions-for-libraries"}

撰寫程式庫時，建議遵循一套額外的規則以確保 API 的穩定性：

 * 一律明確指定成員可見性（以避免意外將宣告公開為 public API）。
 * 一律明確指定函式傳回型別與屬性型別（以避免在實作變更時意外變更傳回型別）。
 * 為所有公用成員提供 [KDoc](kotlin-doc.md) 註解，但不需要任何新文件的覆寫除外（以支援為程式庫產生文件）。

若要進一步了解為程式庫撰寫 API 時應考量的最佳實務與思路，請參閱[程式庫作者指引](api-guidelines-introduction.md)。