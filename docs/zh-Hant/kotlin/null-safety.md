[//]: # (title: Null 安全)

Null 安全是 Kotlin 的一項特性，旨在顯著降低 null 參照的風險，這也被稱為 [十億美元的錯誤](https://en.wikipedia.org/wiki/Null_pointer#History)。

在許多程式語言（包括 Java）中，最常見的陷阱之一是存取 null 參照的成員會導致 null 參照例外。在 Java 中，這相當於 `NullPointerException`，簡稱為 _NPE_。

Kotlin 將可 null 性明確支援為其型別系統的一部分，這代表你可以明確宣告哪些變數或屬性被允許為 `null`。此外，當你宣告非 null 變數時，編譯器會強制執行這些變數不能持有 `null` 值，從而防止 NPE。

Kotlin 的 Null 安全透過在編譯期而非執行期捕捉潛在的 null 相關問題，確保了程式碼更加安全。這項特性透過明確表達 `null` 值，提高了程式碼的強健性、可讀性與可維護性，使程式碼更容易理解和管理。

在 Kotlin 中，導致 NPE 的唯一可能原因包括：

* 明確呼叫 [`throw NullPointerException()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-null-pointer-exception/)。
* 使用 [非 null 斷言運算子 `!!`](#not-null-assertion-operator)。
* 初始化期間的資料不一致，例如：
  * 在建構函式中使用的未初始化 `this` 被傳遞到其他地方（[「洩漏的 `this`」](https://youtrack.jetbrains.com/issue/KTIJ-9751)）。
  * [基底類別建構函式呼叫 open 成員](inheritance.md#derived-class-initialization-order)，而該成員在衍生類別中的實作使用了未初始化的狀態。
* Java 互通性：
  * 嘗試存取 [平台型別](java-interop.md#null-safety-and-platform-types) 之 `null` 參照的成員。
  * 泛型型別的可 null 性問題。例如，一段 Java 程式碼將 `null` 加入 Kotlin 的 `MutableList<String>`，這需要 `MutableList<String?>` 才能正確處理。
  * 由外部 Java 程式碼引起的其他問題。

> 除了 NPE 之外，另一個與 Null 安全相關的例外是 [`UninitializedPropertyAccessException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-uninitialized-property-access-exception/)。當你嘗試存取尚未初始化的屬性時，Kotlin 會拋出此例外，以確保不可 null 的屬性在準備就緒前不會被使用。這通常發生在 [`lateinit` 屬性](properties.md#late-initialized-properties-and-variables) 上。
>
{style="tip"}

## 可 null 型別與不可 null 型別

在 Kotlin 中，型別系統區分了可以持有 `null` 的型別（可 null 型別）和不可以持有的型別（不可 null 型別）。例如，一個型別為 `String` 的常規變數不能持有 `null`：

```kotlin
fun main() {
//sampleStart
    // 將非 null 字串指派給變數
    var a: String = "abc"
    // 嘗試將 null 重新指派給不可 null 變數
    a = null
    print(a)
    // null 不能作為不可 null 型別 String 的值
//sampleEnd
}
```
{kotlin-runnable="true" validate="false"}

你可以安全地在 `a` 上呼叫方法或存取屬性。這保證不會引起 NPE，因為 `a` 是一個不可 null 變數。編譯器確保 `a` 始終持有有效的 `String` 值，因此在其為 `null` 時存取其屬性或方法是沒有風險的：

```kotlin
fun main() {
//sampleStart
    // 將非 null 字串指派給變數
    val a: String = "abc"
    // 傳回不可 null 變數的長度
    val l = a.length
    print(l)
    // 3
//sampleEnd
}
```
{kotlin-runnable="true" validate="false"}

若要允許 `null` 值，請在變數型別後加上 `?` 符號。例如，你可以透過編寫 `String?` 來宣告一個可 null 字串。這個運算式使 `String` 成為一個可以接受 `null` 的型別：

```kotlin
fun main() {
//sampleStart
    // 將可 null 字串指派給變數
    var b: String? = "abc"
    // 成功地將 null 重新指派給可 null 變數
    b = null
    print(b)
    // null
//sampleEnd
}
```
{kotlin-runnable="true"}

如果你嘗試直接在 `b` 上存取 `length`，編譯器會報告錯誤。這是因為 `b` 被宣告為可 null 變數，並且可能持有 `null` 值。直接嘗試存取可 null 物件的屬性會導致 NPE：

```kotlin
fun main() {
//sampleStart
    // 將可 null 字串指派給變數
    var b: String? = "abc"
    // 將 null 重新指派給可 null 變數
    b = null
    // 嘗試直接傳回可 null 變數的長度
    val l = b.length
    print(l)
    // 在型別為 String? 的可 null 接收者上僅允許安全呼叫 (?.) 或非 null 斷言呼叫 (!!.)
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" validate="false"}

在上述範例中，編譯器要求你在存取屬性或執行操作之前使用安全呼叫來檢查可 null 性。處理可 null 物件有幾種方式：

* [使用 `if` 條件句檢查 `null`](#check-for-null-with-the-if-conditional)
* [安全呼叫運算子 `?.`](#safe-call-operator)
* [Elvis 運算子 `?:`](#elvis-operator)
* [非 null 斷言運算子 `!!`](#not-null-assertion-operator)
* [可 null 接收者](#nullable-receiver)
* [`let` 函式](#let-function)
* [安全轉換 `as?`](#safe-casts)
* [可 null 型別的集合](#collections-of-a-nullable-type)

請閱讀接下來的章節以了解 `null` 處理工具與技術的詳細資訊和範例。

## 使用 if 條件句檢查 null

在處理可 null 型別時，你需要安全地處理可 null 性以避免 NPE。處理此問題的一種方式是使用 `if` 條件運算式明確檢查可 null 性。

例如，檢查 `b` 是否為 `null`，然後再存取 `b.length`：

```kotlin
fun main() {
//sampleStart
    // 將 null 指派給可 null 變數
    val b: String? = null
    // 先檢查可 null 性，然後再存取長度
    val l = if (b != null) b.length else -1
    print(l)
    // -1
//sampleEnd
}
```
{kotlin-runnable="true"}

在上述範例中，編譯器執行了 [智慧轉換](typecasts.md#smart-casts)，將型別從可 null 的 `String?` 更改為不可 null 的 `String`。它還會追蹤你執行的檢查資訊，並允許在 `if` 條件句內呼叫 `length`。

也支援更複雜的條件：

```kotlin
fun main() {
//sampleStart
    // 將可 null 字串指派給變數
    val b: String? = "Kotlin"

    // 先檢查可 null 性，然後再存取長度
    if (b != null && b.length > 0) {
        print("String of length ${b.length}")
        // String of length 6
    } else {
        // 如果不符合條件，提供替代方案
        print("Empty string")
    }
//sampleEnd
}
```
{kotlin-runnable="true"}

請注意，上述範例僅在編譯器能保證 `b` 在檢查與使用之間不會改變時才有效，這與 [智慧轉換的先決條件](typecasts.md#smart-cast-prerequisites) 相同。

## 安全呼叫運算子

安全呼叫運算子 `?.` 讓你能以更簡短的形式安全地處理可 null 性。如果物件為 `null`，`?.` 運算子不會拋出 NPE，而是簡單地傳回 `null`：

```kotlin
fun main() {
//sampleStart
    // 將可 null 字串指派給變數
    val a: String? = "Kotlin"
    // 將 null 指派給可 null 變數
    val b: String? = null
    
    // 檢查可 null 性並傳回長度或 null
    println(a?.length)
    // 6
    println(b?.length)
    // null
//sampleEnd
}
```
{kotlin-runnable="true"}

`b?.length` 運算式會檢查可 null 性，如果 `b` 為非 null 則傳回 `b.length`，否則傳回 `null`。此運算式的型別為 `Int?`。

你可以在 Kotlin 中對 [`var` 和 `val` 變數](basic-syntax.md#variables) 使用 `?.` 運算子：

* 可 null 的 `var` 可以持有 `null`（例如 `var nullableValue: String? = null`）或非 null 值（例如 `var nullableValue: String? = "Kotlin"`）。如果是非 null 值，你可以隨時將其更改為 `null`。
* 可 null 的 `val` 可以持有 `null`（例如 `val nullableValue: String? = null`）或非 null 值（例如 `val nullableValue: String? = "Kotlin"`）。如果是非 null 值，你隨後無法將其更改為 `null`。

安全呼叫在鏈式呼叫中非常有用。例如，Bob 是一名員工，他可能會被分配到一個部門（也可能沒有）。該部門轉而可能有另一名員工擔任部門主管。若要獲取 Bob 的部門主管名稱（如果有的話），你可以這樣寫：

```kotlin
bob?.department?.head?.name
```

如果鏈中的任何屬性為 `null`，此鏈式呼叫將傳回 `null`。

你也可以將安全呼叫放在指派操作的左側：

```kotlin
person?.department?.head = managersPool.getManager()
```

在上述範例中，如果安全呼叫鏈中的其中一個接收者為 `null`，則會跳過指派，並且完全不會評估右側的運算式。例如，如果 `person` 或 `person.department` 為 `null`，則不會呼叫該函式。以下是相同安全呼叫但使用 `if` 條件句的等效寫法：

```kotlin
if (person != null && person.department != null) {
    person.department.head = managersPool.getManager()
}
```

## Elvis 運算子

在處理可 null 型別時，你可以檢查 `null` 並提供替代值。例如，如果 `b` 不是 `null`，則存取 `b.length`；否則傳回一個替代值：

```kotlin
fun main() {
//sampleStart
    // 將 null 指派給可 null 變數  
    val b: String? = null
    // 檢查可 null 性。如果非 null，傳回長度。如果為 null，傳回 0
    val l: Int = if (b != null) b.length else 0
    println(l)
    // 0
//sampleEnd
}
```
{kotlin-runnable="true"}

除了編寫完整的 `if` 運算式，你還可以使用 Elvis 運算子 `?:` 以更簡潔的方式處理此問題：

```kotlin
fun main() {
//sampleStart
    // 將 null 指派給可 null 變數  
    val b: String? = null
    // 檢查可 null 性。如果非 null，傳回長度。如果為 null，傳回一個非 null 值
    val l = b?.length ?: 0
    println(l)
    // 0
//sampleEnd
}
```
{kotlin-runnable="true"}

如果 `?:` 左側的運算式不是 `null`，Elvis 運算子會傳回它；否則，Elvis 運算子會傳回右側的運算式。僅當左側為 `null` 時，才會評估右側的運算式。

由於在 Kotlin 中 `throw` 和 `return` 都是運算式，你也可以在 Elvis 運算子的右側使用它們。這在檢查函式引數時非常方便，例如：

```kotlin
fun foo(node: Node): String? {
    // 檢查 getParent()。如果非 null，將其指派給 parent。如果為 null，傳回 null
    val parent = node.getParent() ?: return null
    // 檢查 getName()。如果非 null，將其指派給 name。如果為 null，拋出例外
    val name = node.getName() ?: throw IllegalArgumentException("name expected")
    // ...
}
```

## 非 null 斷言運算子

非 null 斷言運算子 `!!` 將任何值轉換為不可 null 型別。

當你對一個值不是 `null` 的變數套用 `!!` 運算子時，它會被安全地當作不可 null 型別處理，且程式碼正常執行。然而，如果值為 `null`，`!!` 運算子會強制將其視為不可 null，這會導致 NPE。

當 `b` 不是 `null` 且 `!!` 運算子使其傳回其非 null 值（在此範例中為 `String`）時，它會正確存取 `length`：

```kotlin
fun main() {
//sampleStart
    // 將可 null 字串指派給變數
    val b: String? = "Kotlin"
    // 將 b 視為非 null 並存取其長度
    val l = b!!.length
    println(l)
    // 6
//sampleEnd
}
```
{kotlin-runnable="true"}

當 `b` 為 `null` 且 `!!` 運算子使其嘗試傳回其非 null 值時，會發生 NPE：

```kotlin
fun main() {
//sampleStart
    // 將 null 指派給可 null 變數  
    val b: String? = null
    // 將 b 視為非 null 並嘗試存取其長度
    val l = b!!.length
    println(l) 
    // Exception in thread "main" java.lang.NullPointerException
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" validate="false"}

當你確信某個值不是 `null` 且不可能獲得 NPE，但編譯器由於某些規則無法保證這一點時，`!!` 運算子特別有用。在這種情況下，你可以使用 `!!` 運算子明確告訴編譯器該值不是 `null`。

## 可 null 接收者

你可以對 [可 null 接收者型別](extensions.md#nullable-receivers) 使用擴充函式，這允許在可能為 `null` 的變數上呼叫這些函式。

透過在可 null 接收者型別上定義擴充函式，你可以在函式本身內部處理 `null` 值，而不是在呼叫函式的每個地方都檢查 `null`。

例如，[`.toString()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/to-string.html) 擴充函式可以在可 null 接收者上呼叫。當在 `null` 值上叫用時，它會安全地傳回字串 `"null"` 而不會拋出例外：

```kotlin
//sampleStart
fun main() {
    // 將 null 指派給存儲在 person 變數中的可 null Person 物件
    val person: Person? = null

    // 對可 null 的 person 變數套用 .toString 並列印字串
    println(person.toString())
    // null
}

// 定義一個簡單的 Person 類別
data class Person(val name: String)
//sampleEnd
```
{kotlin-runnable="true"}

在上述範例中，即使 `person` 為 `null`，`.toString()` 函式也會安全地傳回字串 `"null"`。這對於偵錯和記錄很有幫助。

如果你期望 `.toString()` 函式傳回一個可 null 字串（字串表示形式或 `null`），請使用 [安全呼叫運算子 `?.`](#safe-call-operator)。`?.` 運算子僅在物件不為 `null` 時才呼叫 `.toString()`，否則傳回 `null`：

```kotlin
//sampleStart
fun main() {
    // 將可 null Person 物件指派給變數
    val person1: Person? = null
    val person2: Person? = Person("Alice")

    // 如果 person 為 null 則列印 "null"；否則列印 person.toString() 的結果
    println(person1?.toString())
    // null
    println(person2?.toString())
    // Person(name=Alice)
}

// 定義一個 Person 類別
data class Person(val name: String)
//sampleEnd
```
{kotlin-runnable="true"}

`?.` 運算子讓你能安全地處理潛在的 `null` 值，同時仍能存取可能為 `null` 的物件屬性或函式。

## Let 函式

為了處理 `null` 值並僅在非 null 型別上執行操作，你可以將安全呼叫運算子 `?.` 與 [`let` 函式](scope-functions.md#let) 配合使用。

這種組合對於評估運算式、檢查結果是否為 `null` 以及僅在非 `null` 時執行程式碼非常有用，從而避免手動執行 null 檢查：

```kotlin
fun main() {
//sampleStart
    // 宣告一個可 null 字串的列表
    val listWithNulls: `List<String?>` = listOf("Kotlin", null)

    // 反覆運算列表中的每個項目
    for (item in listWithNulls) {
        // 檢查項目是否為 null 並僅列印非 null 值
        item?.let { println(it) }
        //Kotlin 
    }
//sampleEnd
}
```
{kotlin-runnable="true"}

## 安全轉換

Kotlin 中用於 [型別轉換](typecasts.md#unsafe-cast-operator) 的常規運算子是 `as` 運算子。然而，如果物件不屬於目標型別，常規轉換可能會導致例外。

你可以使用 `as?` 運算子進行安全轉換。它會嘗試將值轉換為指定的型別，如果值不屬於該型別，則傳回 `null`：

```kotlin
fun main() {
//sampleStart
    // 宣告一個 Any 型別的變數，它可以持有任何型別的值
    val a: Any = "Hello, Kotlin!"

    // 使用 'as?' 運算子安全轉換為 Int
    val aInt: Int? = a as? Int
    // 使用 'as?' 運算子安全轉換為 String
    val aString: String? = a as? String

    println(aInt)
    // null
    println(aString)
    // "Hello, Kotlin!"
//sampleEnd
}
```
{kotlin-runnable="true"}

上面的程式碼列印 `null` 是因為 `a` 不是 `Int`，因此轉換安全地失敗。它也列印 `"Hello, Kotlin!"` 是因為它符合 `String?` 型別，因此安全轉換成功。

## 可 null 型別的集合

如果你有一個包含可 null 元素的集合，並且只想保留其中的非 null 元素，請使用 `filterNotNull()` 函式：

```kotlin
fun main() {
//sampleStart
    // 宣告一個包含一些 null 和非 null 整數值的列表
    val nullableList: `List<Int?>` = listOf(1, 2, null, 4)

    // 過濾掉 null 值，得到一個非 null 整數列表
    val intList: `List<Int>` = nullableList.filterNotNull()
  
    println(intList)
    // [1, 2, 4]
//sampleEnd
}
```
{kotlin-runnable="true"}

## 下一步

* 了解如何 [在 Java 和 Kotlin 中處理可 null 性](java-to-kotlin-nullability-guide.md)。
* 了解有關 [絕對不可為 null 型別](generics.md#definitely-non-nullable-types) 的泛型型別。