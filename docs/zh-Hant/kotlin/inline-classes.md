[//]: # (title: 內嵌值類別)

有時將一個值封裝在類別中以建立更具領域特定性（domain-specific）的型別是非常有用的。然而，由於額外的堆積（heap）分配，這會引入執行時開銷。此外，如果被封裝的型別是基本型別，效能損失會非常顯著，因為基本型別通常由執行時進行大量最佳化，而它們的包裝器則不會得到任何特殊處理。

為了轉決這類問題，Kotlin 引入了一種特殊的類別，稱為 *內嵌類別（inline class）*。
內嵌類別是 [值類別（value-based classes）](https://github.com/Kotlin/KEEP/blob/master/notes/value-classes.md) 的子集。它們沒有身分識別（identity），且只能持有值。

要宣告內嵌類別，請在類別名稱前使用 `value` 修飾符：

```kotlin
value class Password(private val s: String)
```

若要為 JVM 後端宣告內嵌類別，請在類別宣告前同時使用 `value` 修飾符與 `@JvmInline` 註解：

```kotlin
// 適用於 JVM 後端
@JvmInline
value class Password(private val s: String)
```

內嵌類別必須在主建構函數中初始化單一屬性。在執行時，內嵌類別的執行個體將使用此單一屬性來表示（關於執行時表示方式的詳細資訊，請參閱[下文](#representation)）：

```kotlin
// 不會發生類別 'Password' 的實際具現化
// 在執行時 'securePassword' 僅包含 'String'
val securePassword = Password("Don't try this in production") 
```

這是內嵌類別的主要特性，也是 *inline（內嵌）* 這個名稱的靈感來源：類別的資料會被 *內嵌* 到其使用處（類似於 [內嵌函式](inline-functions.md) 的內容被內嵌到呼叫點的方式）。

## 成員 {id="members"}

內嵌類別支援一般類別的部分功能。特別是，它們允許宣告屬性和函式、擁有 `init` 區塊和 [次建構函數](classes.md#secondary-constructors)：

```kotlin
@JvmInline
value class Person(private val fullName: String) {
    init {
        require(fullName.isNotEmpty()) {
            "Full name shouldn't be empty"
        }
    }

    constructor(firstName: String, lastName: String) : this("$firstName $lastName") {
        require(lastName.isNotBlank()) {
            "Last name shouldn't be empty"
        }
    }

    val length: Int
        get() = fullName.length

    fun greet() {
        println("Hello, $fullName")
    }
}

fun main() {
    val name1 = Person("Kotlin", "Mascot")
    val name2 = Person("Kodee")
    name1.greet() // `greet()` 函式作為 static 方法被呼叫
    println(name2.length) // 屬性的 getter 作為 static 方法被呼叫
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.9"}

內嵌類別的屬性不能有 [支援欄位](properties.md#backing-fields)。它們只能有簡單的可計算屬性（不能有 `lateinit` 或委派屬性）。

## 繼承 {id="inheritance"}

內嵌類別允許繼承自介面：

```kotlin
interface Printable {
    fun prettyPrint(): String
}

@JvmInline
value class Name(val s: String) : Printable {
    override fun prettyPrint(): String = "Let's $s!"
}

fun main() {
    val name = Name("Kotlin")
    println(name.prettyPrint()) // 仍然作為 static 方法被呼叫
}
```

禁止內嵌類別參與類別階層結構。這意味著內嵌類別不能擴充其他類別，且一律為 `final`。

## 表示方式 (Representation) {id="representation"}

在產生的程式碼中，Kotlin 編譯器會為每個內嵌類別保留一個 *包裝器（wrapper）*。內嵌類別執行個體在執行時可以表示為包裝器或底層型別。這與 `Int` 可以被 [表示](numbers.md#boxing-and-caching-numbers-on-the-jvm) 為基本型別 `int` 或包裝器 `Integer` 的方式類似。

Kotlin 編譯器會優先使用底層型別而非包裝器，以產出最高效且經過最佳化的程式碼。然而，有時必須保留包裝器。根據經驗法則，每當內嵌類別被當作另一種型別使用時，它們就會被裝箱（boxed）。

```kotlin
interface I

@JvmInline
value class Foo(val i: Int) : I

fun asInline(f: Foo) {}
fun <T> asGeneric(x: T) {}
fun asInterface(i: I) {}
fun asNullable(i: Foo?) {}

fun <T> id(x: T): T = x

fun main() {
    val f = Foo(42) 
    
    asInline(f)    // 未裝箱：作為 Foo 本身使用
    asGeneric(f)   // 已裝箱：作為泛型型別 T 使用
    asInterface(f) // 已裝箱：作為型別 I 使用
    asNullable(f)  // 已裝箱：作為 Foo? 使用，這與 Foo 不同
    
    // 在下方，'f' 首先被裝箱（傳遞給 'id' 時），然後被拆箱（從 'id' 傳回時）
    // 最後，'c' 包含未裝箱的表示方式（即 '42'），如同 'f'
    val c = id(f)  
}
```

因為內嵌類別可能同時表示為底層值和包裝器，所以 [參照相等性](equality.md#referential-equality) 對它們來說沒有意義，因此是被禁止的。

內嵌類別也可以擁有一個泛型型別參數作為底層型別。在這種情況下，編譯器會將其映射到 `Any?`，或者通用的型別參數上界（upper bound）。

```kotlin
@JvmInline
value class UserId<T>(val value: T)

fun compute(s: UserId<String>) {} // 編譯器產生 fun compute-<hashcode>(s: Any?)
```

### 名稱修飾 (Mangling) {id="mangling"}

由於內嵌類別會被編譯為其底層型別，這可能會導致各種隱晦的錯誤，例如非預期的平台簽章衝突：

```kotlin
@JvmInline
value class UInt(val x: Int)

// 在 JVM 上表示為 'public final void compute(int x)'
fun compute(x: Int) { }

// 在 JVM 上也表示為 'public final void compute(int x)'！
fun compute(x: UInt) { }
```

為了緩解這類問題，使用內嵌類別的函式會透過在函式名稱中加入一些穩定的雜湊碼來進行 *名稱修飾（mangled）*。因此，`fun compute(x: UInt)` 將被表示為 `public final void compute-<hashcode>(int x)`，這解決了衝突問題。

### 從 Java 程式碼呼叫 {id="calling-from-java-code"}

你可以從 Java 程式碼呼叫接受內嵌類別的函式。若要執行此操作，你應該手動停用名稱修飾：在函式宣告前加上 `@JvmName` 註解：

```kotlin
@JvmInline
value class UInt(val x: Int)

fun compute(x: Int) { }

@JvmName("computeUInt")
fun compute(x: UInt) { }
```

預設情況下，Kotlin 使用 **未裝箱表示方式（unboxed representations）** 編譯內嵌類別，這使得它們難以從 Java 存取。
要了解如何將內嵌類別編譯為可從 Java 存取的 **裝箱表示方式（boxed representations）**，請參閱 [從 Java 呼叫 Kotlin](java-to-kotlin-interop.md#inline-value-classes) 指南。

## 內嵌類別 vs 型別別名 {id="inline-classes-vs-type-aliases"}

乍看之下，內嵌類別似乎與 [型別別名](type-aliases.md) 非常相似。確實，兩者看起來都引入了新型別，且在執行時都會被表示為底層型別。

然而，關鍵區別在於型別別名與其底層型別（以及具有相同底層型別的其他型別別名）是 *指派相容（assignment-compatible）* 的，而內嵌類別則不然。

換句話說，內嵌類別引入了一個真正的 *新* 型別，而型別別名僅僅是為現有型別引入了一個替代名稱（別名）：

```kotlin
typealias NameTypeAlias = String

@JvmInline
value class NameInlineClass(val s: String)

fun acceptString(s: String) {}
fun acceptNameTypeAlias(n: NameTypeAlias) {}
fun acceptNameInlineClass(p: NameInlineClass) {}

fun main() {
    val nameAlias: NameTypeAlias = ""
    val nameInlineClass: NameInlineClass = NameInlineClass("")
    val string: String = ""

    acceptString(nameAlias) // 成功：傳遞別名而非底層型別
    acceptString(nameInlineClass) // 錯誤：不能傳遞內嵌類別而非底層型別

    // 反之亦然：
    acceptNameTypeAlias(string) // 成功：傳遞底層型別而非別名
    acceptNameInlineClass(string) // 錯誤：不能傳遞底層型別而非內嵌類別
}
```

## 內嵌類別與委派 {id="inline-classes-and-delegation"}

在介面中，允許透過委派給內嵌類別的內嵌值來進行實作：

```kotlin
interface MyInterface {
    fun bar()
    fun foo() = "foo"
}

@JvmInline
value class MyInterfaceWrapper(val myInterface: MyInterface) : MyInterface by myInterface

fun main() {
    val my = MyInterfaceWrapper(object : MyInterface {
        override fun bar() {
            // 實作主體
        }
    })
    println(my.foo()) // 印出 "foo"
}
```
