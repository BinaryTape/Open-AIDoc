[//]: # (title: 泛型：in, out, where)

Kotlin 中的類別可以具有型別參數，就像在 Java 中一樣：

```kotlin
class Box<T>(t: T) {
    var value = t
}
```

要建立此類類別的執行個體，只需提供型別引數：

```kotlin
val box: Box<Int> = Box<Int>(1)
```

如果編譯器可以從建構函式引數等內容推論出型別引數，則不需要明確指定它們：

```kotlin
val box = Box(1) // 1 的型別為 Int，因此編譯器會推斷出它是 Box<Int>
```

## 變異 (Variance)

Java 型別系統中最棘手的面向之一是萬用字元型別 (wildcard types)（請參閱 [Java Generics FAQ](http://www.angelikalanger.com/GenericsFAQ/JavaGenericsFAQ.html)）。
Kotlin 沒有這些。相反地，Kotlin 擁有宣告處變異 (declaration-site variance) 與型別投影 (type projections)。

### Java 中的變異與萬用字元

讓我們思考一下為什麼 Java 需要這些神秘的萬用字元。首先，Java 中的泛型型別是*不變的 (invariant)*，
這意味著 `List<String>` *不是* `List<Object>` 的子型別。如果 `List` 不是*不變的*，它將
不會比 Java 的陣列好到哪裡去，因為以下程式碼可以通過編譯，但在執行期會引發例外：

```java
// Java
List<String> strs = new ArrayList<String>();

// Java 在編譯期會回報型別不符。
List<Object> objs = strs;

// 如果沒有回報會發生什麼事？
// 我們就能將一個 Integer 放入 String 串列中。
objs.add(1);

// 然後在執行期，Java 會拋出
// ClassCastException: Integer cannot be cast to String
String s = strs.get(0); 
```

Java 禁止此類行為以保證執行期安全。但這也產生了一些影響。例如，
考慮 `Collection` 介面中的 `addAll()` 方法。這個方法的簽章是什麼？直覺上，
你會這樣寫：

```java
// Java
interface Collection<E> ... {
    void addAll(Collection<E> items);
}
```

但這樣一來，你就無法執行以下操作（而這完全是安全的）：

```java
// Java

// 使用 addAll 的原始宣告，以下內容將無法編譯：
// Collection<String> 不是 Collection<Object> 的子型別
void copyAll(Collection<Object> to, Collection<String> from) {
    to.addAll(from);
}
```

這就是為什麼 `addAll()` 實際的簽章如下：

```java
// Java
interface Collection<E> ... {
    void addAll(Collection<? extends E> items);
}
```

*萬用字元型別引數* `? extends E` 表示此方法接受 `E` *或其子型別*的物件集合，而不僅僅是 `E` 本身。這意味著你可以安全地從 items 中*讀取* `E`（此集合的元素是 E 子類別的執行個體），但*不能寫入*
到其中，因為你不知道哪些物件符合該未知的 `E` 子型別。
作為此限制的回報，你獲得了所需的行為：`Collection<String>` *是* `Collection<? extends Object>` 的子型別。
換句話說，帶有 *extends* 邊界（*上限*）的萬用字元使型別成為*協變的 (covariant)*。

理解這為何有效的關鍵其實很簡單：如果你只能從集合中*取出*項目，
那麼使用 `String` 的集合並從中讀取 `Object` 是沒問題的。反之，如果你只能向集合中*放入*項目，
那麼拿一個 `Object` 的集合並放入 `String` 也是可以的：在 Java 中有
`List<? super String>`，它接受 `String` 或其任何父型別。

後者稱為*逆變性 (contravariance)*，你只能在 `List<? super String>` 上呼叫以 `String` 作為引數的方法
（例如，你可以呼叫 `add(String)` 或 `set(int, String)`）。如果你在 `List<T>` 中呼叫回傳 `T` 的方法，
你得到的不會是 `String`，而是一個 `Object`。

Joshua Bloch 在他的著作 [Effective Java, 3rd Edition](http://www.oracle.com/technetwork/java/effectivejava-136174.html) 中很好地解釋了這個問題
（第 31 條：「使用受限萬用字元增加 API 靈活性」）。他將你只從中*讀取*的物件命名為*生產者 (Producers)*，將你只向其中*寫入*的物件命名為*消費者 (Consumers)*。他建議：

>「為了獲得最大的靈活性，請在代表生產者或消費者的輸入參數上使用萬用字元型別。」

隨後他提出了以下助記詞：*PECS* 代表 *Producer-Extends, Consumer-Super*。

> 如果你使用一個生產者物件，例如 `List<? extends Foo>`，你不被允許在此物件上呼叫 `add()` 或 `set()`，
> 但這並不代表它是*不可變的 (immutable)*：例如，沒什麼能阻止你呼叫 `clear()`
> 來移除串列中的所有項目，因為 `clear()` 完全不帶任何參數。
>
> 萬用字元（或其他類型的變異）唯一保證的是*型別安全*。不可變性則是完全不同的另一回事。
>
{style="note"}

### 宣告處變異 (Declaration-site variance)

假設有一個泛型介面 `Source<T>`，它沒有任何以 `T` 作為參數的方法，只有回傳 `T` 的方法：

```java
// Java
interface Source<T> {
    T nextT();
}
```

那麼，將 `Source<String>` 執行個體的參考儲存在 `Source<Object>` 型別的變數中應該是完全安全的 —— 因為沒有消費者方法可以呼叫。但 Java 並不知道這一點，仍然禁止這樣做：

```java
// Java
void demo(Source<String> strs) {
    Source<Object> objects = strs; // !!! Java 中不允許
    // ...
}
```

為了解決這個問題，你必須宣告型別為 `Source<? extends Object>` 的物件。這樣做毫無意義，
因為你可以在此類變數上呼叫與以前完全相同的所有方法，所以更複雜的型別並沒有帶來額外的價值。
但編譯器並不知道這一點。

在 Kotlin 中，有一種方法可以向編譯器解釋這類事情。這稱為*宣告處變異*：
你可以對 `Source` 的*型別參數* `T` 加上註解，以確保它僅從 `Source<T>` 的成員中*回傳*（生產），而從不被消費。
為此，請使用 `out` 修飾詞：

```kotlin
interface Source<out T> {
    fun nextT(): T
}

fun demo(strs: Source<String>) {
    val objects: Source<Any> = strs // 這是可以的，因為 T 是一個 out-參數
    // ...
}
```

一般規則是：當類別 `C` 的型別參數 `T` 被宣告為 `out` 時，它只能出現在 `C` 成員的 *out* 位置，但作為回報，`C<Base>` 可以安全地作為 `C<Derived>` 的父型別。

換句話說，你可以說類別 `C` 在參數 `T` 上是*協變的*，或者 `T` 是一個*協變*型別參數。
你可以將 `C` 視為 `T` 的*生產者*，而不是 `T` 的*消費者*。

`out` 修飾詞被稱為*變異註解*，由於它是在型別參數宣告處提供的，
因此它提供了*宣告處變異*。
這與 Java 的*使用處變異*形成對比，在 Java 中，型別使用處的萬用字元使型別變為協變。

除了 `out` 之外，Kotlin 還提供了一個互補的變異註解：`in`。它使型別參數變為*逆變的 (contravariant)*，這意味著
它只能被消費而不能被生產。逆變型別的一個很好的例子是 `Comparable`：

```kotlin
interface Comparable<in T> {
    operator fun compareTo(other: T): Int
}

fun demo(x: Comparable<Number>) {
    x.compareTo(1.0) // 1.0 的型別是 Double，它是 Number 的子型別
    // 因此，你可以將 x 指派給 Comparable<Double> 型別的變數
    val y: Comparable<Double> = x // OK!
}
```

`in` 和 `out` 這兩個詞似乎不言自明（因為它們已在 C# 中成功使用相當長一段時間），
因此上述的助記詞其實不再需要。事實上，它可以在更高層次的抽象上重新表述：

**[存在主義](https://en.wikipedia.org/wiki/Existentialism) 轉型：Consumer in, Producer out!** :-)

## 型別投影 (Type projections)

### 使用處變異：型別投影

將型別參數 `T` 宣告為 `out` 並避免在使用處出現子型別化問題非常容易，
但有些類別實際上*無法*被限制為僅回傳 `T`！
`Array` 就是一個很好的例子：

```kotlin
class Array<T>(val size: Int) {
    operator fun get(index: Int): T { ... }
    operator fun set(index: Int, value: T) { ... }
}
```

這個類別在 `T` 上既不能協變也不能逆變。而這造成了某些不靈活性。考慮以下函式：

```kotlin
fun copy(from: Array<Any>, to: Array<Any>) {
    assert(from.size == to.size)
    for (i in from.indices)
        to[i] = from[i]
}
```

這個函式應該是將項目從一個陣列複製到另一個陣列。讓我們嘗試在實作中應用它：

```kotlin
val ints: Array<Int> = arrayOf(1, 2, 3)
val any = Array<Any>(3) { "" } 
copy(ints, any)
//   ^ 型別為 Array<Int> 但預期為 Array<Any>
```

在這裡，你遇到了同樣熟悉的問題：`Array<T>` 在 `T` 上是*不變的*，因此 `Array<Int>` 和 `Array<Any>`
都不是對方的子型別。為什麼不呢？同樣地，這是因為 `copy` 可能會有預期之外的行為，例如，它可能會嘗試
向 `from` 寫入一個 `String`，而如果你實際傳遞的是一個 `Int` 陣列，稍後將會拋出 `ClassCastException`。

為了禁止 `copy` 函式向 `from` *寫入*，你可以這樣做：

```kotlin
fun copy(from: Array<out Any>, to: Array<Any>) { ... }
```

這就是*型別投影*，這意味著 `from` 不是一個簡單的陣列，而是一個受限（*被投影*）的陣列。
你只能呼叫回傳型別參數 `T` 的方法，在這種情況下意味著你只能呼叫 `get()`。
這是我們處理*使用處變異*的方法，它對應於 Java 的 `Array<? extends Object>`，但更為簡潔。

你也可以使用 `in` 來投影型別：

```kotlin
fun fill(dest: Array<in String>, value: String) { ... }
```

`Array<in String>` 對應於 Java 的 `Array<? super String>`。這意味著你可以將 `String` 陣列、`CharSequence` 陣列
或 `Object` 陣列傳遞給 `fill()` 函式。

### 星號投影 (Star-projections)

有時你想要表示你對型別引數一無所知，但仍想以安全的方式使用它。
這裡的安全方式是定義泛型型別的投影，使得該泛型型別的每個具體具現化都將是該投影的子型別。

Kotlin 為此提供了所謂的*星號投影*語法：

- 對於 `Foo<out T : TUpper>`，其中 `T` 是一個協變型別參數，其上限為 `TUpper`，`Foo<*>`
  等同於 `Foo<out TUpper>`。這意味著當 `T` 未知時，你可以安全地從 `Foo<*>` *讀取* `TUpper` 的值。
- 對於 `Foo<in T>`，其中 `T` 是一個逆變型別參數，`Foo<*>` 等同於 `Foo<in Nothing>`。這意味著
  當 `T` 未知時，沒有任何方式可以安全地*寫入*到 `Foo<*>`。
- 對於 `Foo<T : TUpper>`，其中 `T` 是一個不變型別參數，其上限為 `TUpper`，`Foo<*>` 對於讀取值等同於
  `Foo<out TUpper>`，而對於寫入值等同於 `Foo<in Nothing>`。

如果一個泛型型別具有多個型別參數，則每個型別參數都可以獨立投影。
例如，如果型別宣告為 `interface Function<in T, out U>`，你可以使用以下星號投影：

* `Function<*, String>` 表示 `Function<in Nothing, String>`。
* `Function<Int, *>` 表示 `Function<Int, out Any?>`。
* `Function<*, *>` 表示 `Function<in Nothing, out Any?>`。

> 星號投影非常類似於 Java 的原始型別 (raw types)，但是是安全的。
>
{style="note"}

### 捕獲型別 (Captured types)

當你使用型別投影（例如 `out T` 或 `in T`）時，編譯器會在內部將未知的具體型別表示為一個 [捕獲型別 (captured type)](https://kotlinlang.org/spec/type-system.html#type-capturing)。捕獲型別是一種具有已知上限和下限的未知型別。

捕獲型別是不可直接表示的 (non-denotable)，因此你無法在 Kotlin 程式碼中直接撰寫它們。相反地，你最常在編譯器診斷資訊中看到捕獲型別，例如 `CapturedType(out X)`。例如，以下型別不符的診斷資訊包含了一個捕獲型別：

```kotlin
val array: Array<out CharSequence> = arrayOf("str")
val item: Int = array.get(0)
// Initializer type mismatch: expected 'Int', actual 'CapturedType(out CharSequence)'
```

編譯器使用捕獲型別的上限來進行讀取操作，並使用其下限來確定哪些值對於寫入操作是型別安全的：

```kotlin
// 投影型別為 Array<out CharSequence>
val array: Array<out CharSequence> = arrayOf("Kotlin")

// get() 讀取操作使用捕獲型別的上限 CharSequence
val item = array.get(0)

// set() 寫入操作使用捕獲型別的下限 Nothing，這會導致錯誤
array.set(0, "New value")
// Receiver type 'Array<out CharSequence>' contains out projection
// which prohibits the use of 'fun set(index: Int, value: T): Unit'
```

在此範例中：

* 變數 `array` 具有投影型別 `Array<out CharSequence>`。編譯器將投影型別引數 `out CharSequence` 表示為一個以 `CharSequence` 為上限、`Nothing` 為下限的捕獲型別。
* 對於 `get()` 操作，編譯器將捕獲型別近似為其上限 `CharSequence`，並將 `item` 的型別推論為 `CharSequence`。
* 對於 `set()` 操作，捕獲型別的下限為 `Nothing`。由於 `Nothing` 沒有執行個體，因此向投影型別寫入值是不安全的，會導致錯誤。

## 泛型函式

不僅僅是類別可以擁有型別參數，函式也可以。型別參數放在函式名稱*之前*：

```kotlin
fun <T> singletonList(item: T): List<T> {
    // ...
}

fun <T> T.basicToString(): String { // 擴充方法
    // ...
}
```

要呼叫泛型函式，請在呼叫處的函式名稱*之後*指定型別引數：

```kotlin
val l = singletonList<Int>(1)
```

如果型別引數可以從上下文中推論出來，則可以省略，因此以下範例也可以運作：

```kotlin
val l = singletonList(1)
```

## 泛型約束

可以取代給定型別參數的所有可能型別的集合，可能會受到*泛型約束*的限制。

### 上限 (Upper bounds)

最常見的約束類型是*上限*，這對應於 Java 的 `extends` 關鍵字：

```kotlin
fun <T : Comparable<T>> sort(list: List<T>) {  ... }
```

冒號後指定的型別即為*上限*，表示只有 `Comparable<T>` 的子型別可以取代 `T`。例如：

```kotlin
sort(listOf(1, 2, 3)) // OK。Int 是 Comparable<Int> 的子型別
sort(listOf(HashMap<Int, String>())) // 錯誤：HashMap<Int, String> 不是 Comparable<HashMap<Int, String>> 的子型別
```

預設的上限（如果未指定）是 `Any?`。在角括號內只能指定一個上限。
如果同一個型別參數需要多個上限，則需要一個單獨的 *where* 子句：

```kotlin
fun <T> copyWhenGreater(list: List<T>, threshold: T): List<String>
    where T : CharSequence,
          T : Comparable<T> {
    return list.filter { it > threshold }.map { it.toString() }
}
```

傳遞的型別必須同時滿足 `where` 子句的所有條件。在上述範例中，`T` 型別
必須*同時*實作 `CharSequence` 和 `Comparable`。

## 絕對不可為 null 型別 (Definitely non-nullable types)

為了讓與泛型 Java 類別和介面的互通更加容易，Kotlin 支援將泛型型別參數宣告為
**絕對不可為 null**。

要將泛型型別 `T` 宣告為絕對不可為 null，請使用 `& Any` 宣告該型別。例如：`T & Any`。

絕對不可為 null 型別必須具有可為 null 的[上限](#上限)。

宣告絕對不可為 null 型別最常見的使用案例是當你想要覆寫包含 `@NotNull` 作為引數的 Java 方法時。例如，考慮 `load()` 方法：

```java
import org.jetbrains.annotations.*;

public interface Game<T> {
    public T save(T x) {}
    @NotNull
    public T load(@NotNull T x) {}
}
```

要在 Kotlin 中成功覆寫 `load()` 方法，你需要將 `T1` 宣告為絕對不可為 null：

```kotlin
interface ArcadeGame<T1> : Game<T1> {
    override fun save(x: T1): T1
    // T1 是絕對不可為 null
    override fun load(x: T1 & Any): T1 & Any
}
```

當僅使用 Kotlin 開發時，你不太需要顯式宣告絕對不可為 null 型別，因為
Kotlin 的型別推論會為你處理好這一切。

## 型別擦除 (Type erasure)

Kotlin 對泛型宣告使用所執行的型別安全檢查是在編譯期完成的。
在執行期，泛型型別的執行個體不持有關於其實際型別引數的任何資訊。
該型別資訊被稱為被*擦除*了。例如，`Foo<Bar>` 和 `Foo<Baz?>` 的執行個體都會被擦除為
僅僅是 `Foo<*>`。

### 泛型型別檢查與轉換

由於型別擦除的存在，在執行期沒有通用的方法來檢查一個泛型型別的執行個體是否是使用某些型別引數建立的，
且編譯器禁止此類 `is` 檢查，例如
`ints is List<Int>` 或 `list is T`（型別參數）。但是，你可以針對星號投影型別檢查執行個體：

```kotlin
if (something is List<*>) {
    something.forEach { println(it) } // 項目被視為 `Any?` 型別
}
```

同樣地，當你已經靜態地（在編譯期）檢查過執行個體的型別引數時，
你可以進行涉及該型別非泛型部分的 `is` 檢查或轉換。請注意，
在這種情況下角括號會被省略：

```kotlin
fun handleStrings(list: MutableList<String>) {
    if (list is ArrayList) {
        // `list` 會被智慧轉換為 `ArrayList<String>`
    }
}
```

省略型別引數的相同語法也可用於不考慮型別引數的轉換：`list as ArrayList`。

泛型函式呼叫的型別引數也僅在編譯期檢查。在函式體內部，
型別參數不能用於型別檢查，且轉換為型別參數的型別轉換 (`foo as T`) 是未經檢查的。
唯一的例外是帶有[具現化型別參數](inline-functions.md#reified-type-parameters)的內嵌函式，
它們的實際型別引數會在每個呼叫處被內嵌。這使得針對型別參數的型別檢查與轉換成為可能。
然而，上述限制仍然適用於在檢查或轉換內部使用的泛型型別執行個體。
例如，在型別檢查 `arg is T` 中，如果 `arg` 本身是泛型型別的執行個體，其型別引數仍然會被擦除。

```kotlin
//sampleStart
inline fun <reified A, reified B> Pair<*, *>.asPairOf(): Pair<A, B>? {
    if (first !is A || second !is B) return null
    return first as A to second as B
}

val somePair: Pair<Any?, Any?> = "items" to listOf(1, 2, 3)

val stringToSomething = somePair.asPairOf<String, Any>()
val stringToInt = somePair.asPairOf<String, Int>()
val stringToList = somePair.asPairOf<String, List<*>>()
val stringToStringList = somePair.asPairOf<String, List<String>>() // 可編譯但會破壞型別安全！
// 展開範例以查看更多詳細資訊

//sampleEnd

fun main() {
    println("stringToSomething = " + stringToSomething)
    println("stringToInt = " + stringToInt)
    println("stringToList = " + stringToList)
    println("stringToStringList = " + stringToStringList)
    //println(stringToStringList?.second?.forEach() {it.length}) // 這會拋出 ClassCastException，因為串列項目不是 String
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### 未經檢查的轉換 (Unchecked casts)

針對具有具體型別引數的泛型型別轉換（例如 `foo as List<String>`）在執行期無法進行檢查。  
當高層級程式邏輯隱含了型別安全，但編譯器無法直接推論時，
可以使用這些未經檢查的轉換。請參閱下面的範例。

```kotlin
fun readDictionary(file: File): Map<String, *> = file.inputStream().use { 
    TODO("讀取字串到任意元素的映射。")
}

// 我們在這個檔案中儲存了一個帶有 `Int` 的映射
val intsFile = File("ints.dictionary")

// 警告：未經檢查的轉換：從 `Map<String, *>` 到 `Map<String, Int>`
val intsDictionary: Map<String, Int> = readDictionary(intsFile) as Map<String, Int>
```
最後一行的轉換會出現警告。編譯器無法在執行期完全檢查它，
且無法保證映射中的值都是 `Int`。

為了避免未經檢查的轉換，你可以重新設計程式結構。在上面的範例中，你可以使用
`DictionaryReader<T>` 和 `DictionaryWriter<T>` 介面，並為不同型別提供型別安全的實作。
你可以引入合理的抽象，將未經檢查的轉換從呼叫處移至實作細節中。
正確使用[泛型變異](#變異)也會有所幫助。

對於泛型函式，使用[具現化型別參數](inline-functions.md#reified-type-parameters)可以使像
`arg as T` 這樣的轉換變成受檢的，除非 `arg` 的型別具有*其自身*被擦除的型別引數。

可以透過在陳述式或發生警告的宣告處加上 `@Suppress("UNCHECKED_CAST")` [註解](annotations.md)來隱藏未經檢查的轉換警告：

```kotlin
inline fun <reified T> List<*>.asListOfType(): List<T>? =
    if (all { it is T })
        @Suppress("UNCHECKED_CAST")
        this as List<T> else
        null
```

>**在 JVM 上**：[陣列型別](arrays.md) (`Array<Foo>`) 會保留關於其元素被擦除型別的資訊，
>且轉換為陣列型別是部分受檢的：元素型別的可 null 性和實際型別引數仍然會被擦除。例如，
>如果 `foo` 是持有任何 `List<*>` 的陣列（無論是否可為 null），轉換 `foo as Array<List<String>?>` 都會成功。
>
{style="note"}

## 型別引數的底線運算子

底線運算子 `_` 可用於型別引數。當明確指定其他型別時，使用它來自動推論該引數的型別：

```kotlin
abstract class SomeClass<T> {
    abstract fun execute() : T
}

class SomeImplementation : SomeClass<String>() {
    override fun execute(): String = "Test"
}

class OtherImplementation : SomeClass<Int>() {
    override fun execute(): Int = 42
}

object Runner {
    inline fun <reified S: SomeClass<T>, T> run() : T {
        return S::class.java.getDeclaredConstructor().newInstance().execute()
    }
}

fun main() {
    // T 被推論為 String，因為 SomeImplementation 衍生自 SomeClass<String>
    val s = Runner.run<SomeImplementation, _>()
    assert(s == "Test")

    // T 被推論為 Int，因為 OtherImplementation 衍生自 SomeClass<Int>
    val n = Runner.run<OtherImplementation, _>()
    assert(n == 42)
}