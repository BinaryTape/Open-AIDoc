[//]: # (title: 泛型：in、out、where)

Kotlin 中的類別可以擁有型別參數，就像 Java 一樣：

```kotlin
class Box<T>(t: T) {
    var value = t
}
```

若要建立此類別的執行個體，只需提供型別引數：

```kotlin
val box: Box<Int> = Box<Int>(1)
```

如果編譯器可以推論出型別引數（例如從建構函式引數中推論），則不需要明確指定它們：

```kotlin
val box = Box(1) // 1 的型別為 Int，因此編譯器能推斷出它是 Box<Int>
```

## 差異 (Variance) {id="variance"}

Java 型別系統中最棘手的層面之一是萬用字元型別（請參閱 [Java Generics FAQ](http://www.angelikalanger.com/GenericsFAQ/JavaGenericsFAQ.html)）。
Kotlin 沒有這些。相反地，Kotlin 具備宣告處差異（declaration-site variance）與型別投影（type projection）。

### Java 中的差異與萬用字元 {id="variance-and-wildcards-in-java"}

讓我們思考一下為什麼 Java 需要這些神秘的萬用字元。首先，Java 中的泛型型別是*不變的 (invariant)*，
這意味著 `List<String>` *不是* `List<Object>` 的子型別。如果 `List` 不是*不變的*，它就不會比 Java 的陣列好到哪裡去，因為以下程式碼雖然可以通過編譯，但在執行階段會引發例外狀況：

```java
// Java
List<String> strs = new ArrayList<String>();

// Java 在編譯期會在此回報型別不符。
List<Object> objs = strs;

// 如果沒有回報呢？
// 我們就能夠將 Integer 放進 String 清單中。
objs.add(1);

// 然後在執行時期，Java 就會擲出
// ClassCastException: Integer cannot be cast to String
String s = strs.get(0); 
```

Java 禁止此類操作以確保執行時期的安全性。但這會帶來一些影響。例如，
考慮 `Collection` 介面中的 `addAll()` 方法。這個方法的簽章是什麼？直覺上，
您可能會這樣寫：

```java
// Java
interface Collection<E> ... {
    void addAll(Collection<E> items);
}
```

但如此一來，您將無法執行以下操作（而這完全是安全的）：

```java
// Java

// 若使用 addAll 的單純宣告，下列程式碼將無法編譯：
// Collection<String> 不是 Collection<Object> 的子型別
void copyAll(Collection<Object> to, Collection<String> from) {
    to.addAll(from);
}
```

這就是為什麼 `addAll()` 的實際簽章如下：

```java
// Java
interface Collection<E> ... {
    void addAll(Collection<? extends E> items);
}
```

*萬用字元型別引數* `? extends E` 表示此方法接受由 `E` 的物件*或 `E` 的子型別*組成的集合，
而不僅僅是 `E` 本身。這意味著您可以安全地從項目中*讀取* `E`
（此集合的元素是 E 的子類別的執行個體），但*無法對其進行寫入*，
因為您不知道有哪些物件符合 `E` 的該未知子型別。
作為此限制的交換，您獲得了期望的行為：`Collection<String>` *是* `Collection<? extends Object>` 的子型別。
換句話說，帶有 *extends* 界限（*上*界）的萬用字元使該型別具備*協變性 (covariant)*。

理解其運作原理的關鍵相當簡單：如果您只能從集合中*取出*項目，
那麼使用 `String` 的集合並從中讀取 `Object` 是完全沒有問題的。相反地，如果您只能將項目*放入*集合中，那麼取得一個 `Object` 的集合並將 `String` 放入其中也是可以的：Java 中有 `List<? super String>`，它接受 `String` 或其任何超型別。

後者稱為*逆變性 (contravariance)*，而且您只能在 `List<? super String>` 上呼叫以 `String` 作為引數的方法（例如，您可以呼叫 `add(String)` 或 `set(int, String)`）。如果您呼叫 `List<T>` 中傳回 `T` 的方法，您得到的不是 `String`，而是 `Object`。

Joshua Bloch 在其著作《[Effective Java, 3rd Edition](http://www.oracle.com/technetwork/java/effectivejava-136174.html)》中詳細解釋了這個問題（第 31 條：「使用有限制萬用字元增加 API 的靈活性」）。他將僅供*讀取*的物件稱為*生產者 (Producers)*，將僅供*寫入*的物件稱為*消費者 (Consumers)*。他建議：

>「為了獲得最大的靈活性，請在代表生產者或消費者的輸入參數上使用萬用字元型別。」

接著他提出了以下記憶口訣：*PECS* 代表 *Producer-Extends, Consumer-Super*（生產者對應 extends，消費者對應 super）。

> 如果您使用生產者物件，例如 `List<? extends Foo>`，您不能在此物件上呼叫 `add()` 或 `set()`，
> 但這並不意味著它是*不可變的 (immutable)*：例如，沒有任何規定能阻止您呼叫 `clear()`
> 來移除清單中的所有項目，因為 `clear()` 完全不需要任何參數。
>
> 萬用字元（或其他型別的差異）唯一保證的是*型別安全*。不可變性則是完全不同的另一回事。
>
{style="note"}

### 宣告處差異 {id="declaration-site-variance"}

假設有一個泛型介面 `Source<T>`，它沒有任何以 `T` 作為參數的方法，只有傳回 `T` 的方法：

```java
// Java
interface Source<T> {
    T nextT();
}
```

那麼，將 `Source<String>` 執行個體的參考儲存在型別為 `Source<Object>` 的變數中是完全安全的——因為沒有任何消費者方法可供呼叫。但 Java 並不知道這一點，仍然禁止這樣做：

```java
// Java
void demo(Source<String> strs) {
    Source<Object> objects = strs; // !!! 在 Java 中不允許
    // ...
}
```

若要修復此問題，您必須宣告型別為 `Source<? extends Object>` 的物件。但這樣做毫無意義，
因為您在該變數上能呼叫的方法與之前完全相同，更複雜的型別並沒有帶來任何附加價值。
只是編譯器並不知道這一點。

在 Kotlin 中，有一種方法可以向編譯器解釋這種情況。這稱為*宣告處差異 (declaration-site variance)*：
您可以對 `Source` 的*型別參數* `T` 加上註解，以確保它只會由 `Source<T>` 的成員*傳回*（生產），
而絕不會被消費。
若要達成此目的，請使用 `out` 修飾詞：

```kotlin
interface Source<out T> {
    fun nextT(): T
}

fun demo(strs: Source<String>) {
    val objects: Source<Any> = strs // 這是可行的，因為 T 是一個 out 參數
    // ...
}
```

一般規則如下：當類別 `C` 的型別參數 `T` 被宣告為 `out` 時，它只能出現在 `C` 成員的 *out* 位置，但作為回報，`C<Base>` 可以安全地成為 `C<Derived>` 的超型別。

換句話說，您可以說類別 `C` 在參數 `T` 上是*協變的 (covariant)*，或者說 `T` 是一個*協變*型別參數。
您可以將 `C` 視為 `T` 的*生產者*，而*不是* `T` 的*消費者*。

`out` 修飾詞被稱為*差異註解 (variance annotation)*，因為它是在型別參數的宣告處提供，所以提供了*宣告處差異*。
這與 Java 的*使用處差異 (use-site variance)* 形成對比，在 Java 中是透過型別使用時的萬用字元使型別具備協變性。

除了 `out` 之外，Kotlin 還提供了一個互補的差異註解：`in`。它使型別參數*逆變 (contravariant)*，意味著它只能被消費，而絕不能被生產。逆變型別的一個良好範例是 `Comparable`：

```kotlin
interface Comparable<in T> {
    operator fun compareTo(other: T): Int
}

fun demo(x: Comparable<Number>) {
    x.compareTo(1.0) // 1.0 的型別為 Double，它是 Number 的子型別
    // 因此，您可以將 x 指派給型別為 Comparable<Double> 的變數
    val y: Comparable<Double> = x // 正確！
}
```

*in* 和 *out* 這兩個字詞似乎不言自明（因為它們已經在 C# 中成功使用相當長一段時間），因此實際上不需要上述的口訣。事實上，它可以在更高的抽象層次上重新詮釋：

**[存在主義](https://en.wikipedia.org/wiki/Existentialism)轉變：Consumer in, Producer out！（消費者 in，生產者 out！）** :-)

## 型別投影 {id="type-projections"}

### 使用處差異：型別投影 {id="use-site-variance-type-projections"}

將型別參數 `T` 宣告為 `out` 並避免在使用處出現子型別化問題非常容易，
但有些類別實際上*無法*被限制為僅傳回 `T`！
`Array` 就是一個很好的範例：

```kotlin
class Array<T>(val size: Int) {
    operator fun get(index: Int): T { ... }
    operator fun set(index: Int, value: T) { ... }
}
```

這個類別在 `T` 上既不能協變也不能逆變。這帶來了一定的僵化。考慮以下函式：

```kotlin
fun copy(from: Array<Any>, to: Array<Any>) {
    assert(from.size == to.size)
    for (i in from.indices)
        to[i] = from[i]
}
```

此函式旨在將項目從一個陣列複製到另一個陣列。讓我們嘗試在實務中應用它：

```kotlin
val ints: Array<Int> = arrayOf(1, 2, 3)
val any = Array<Any>(3) { "" } 
copy(ints, any)
//   ^ 型別為 Array<Int>，但預期的是 Array<Any>
```

在這裡，您遇到了同樣熟悉的問題：`Array<T>` 在 `T` 上是*不變的 (invariant)*，因此 `Array<Int>` 和 `Array<Any>` 互不為子型別。為什麼不呢？這同樣是因為 `copy` 可能會有非預期的行為，例如它可能會嘗試向 `from` 寫入一個 `String`，而如果您實際上傳入的是 `Int` 陣列，之後就會擲出 `ClassCastException`。

若要禁止 `copy` 函式*寫入* `from`，您可以執行以下操作：

```kotlin
fun copy(from: Array<out Any>, to: Array<Any>) { ... }
```

這就是*型別投影 (type projection)*，這表示 `from` 不是一個單純的陣列，而是一個受到限制（*受投影*）的陣列。
您只能呼叫傳回型別參數 `T` 的方法，在此情況下表示您只能呼叫 `get()`。
這是我們處理*使用處差異*的方法，它對應於 Java 的 `Array<? extends Object>`，但更為簡潔。

您也可以使用 `in` 來投影型別：

```kotlin
fun fill(dest: Array<in String>, value: String) { ... }
```

`Array<in String>` 對應於 Java 的 `Array<? super String>`。這意味著您可以將 `String`、`CharSequence` 或 `Object` 的陣列傳遞給 `fill()` 函式。

### 星號投影 (Star-projections) {id="star-projections"}

有時候您想表示對型別引數一無所知，但仍希望以安全的方式使用它。
這裡的安全方式是為該泛型型別定義這樣一種投影：該泛型型別的每個具體具現化都將是該投影的子型別。

Kotlin 為此提供了所謂的*星號投影 (star-projection)* 語法：

- 對於 `Foo<out T : TUpper>`（其中 `T` 是上界為 `TUpper` 的協變型別參數），`Foo<*>` 等同於 `Foo<out TUpper>`。這意味著當 `T` 未知時，您可以安全地從 `Foo<*>` *讀取* `TUpper` 的值。
- 對於 `Foo<in T>`（其中 `T` 是逆變型別參數），`Foo<*>` 等同於 `Foo<in Nothing>`。這意味著當 `T` 未知時，您無法以安全的方式向 `Foo<*>` *寫入*任何內容。
- 對於 `Foo<T : TUpper>`（其中 `T` 是上界為 `TUpper` 的不變型別參數），`Foo<*>` 在讀取值時等同於 `Foo<out TUpper>`，而在寫入值時等同於 `Foo<in Nothing>`。

如果泛型型別具有多個型別參數，則每個參數都可以獨立投影。
例如，如果型別宣告為 `interface Function<in T, out U>`，您可以使用以下星號投影：

* `Function<*, String>` 代表 `Function<in Nothing, String>`。
* `Function<Int, *>` 代表 `Function<Int, out Any?>`。
* `Function<*, *>` 代表 `Function<in Nothing, out Any?>`。

> 星號投影非常類似於 Java 的原始型別（raw types），但更加安全。
>
{style="note"}

### 捕獲型別 (Captured types) {id="captured-types"}

當您使用型別投影（例如 `out T` 或 `in T`）時，編譯器會在內部將未知的具體型別表示為[*捕獲型別* (captured type)](https://kotlinlang.org/spec/type-system.html#type-capturing)。捕獲型別是具有已知上界與下界的未知型別。

捕獲型別是無法明確表示的（non-denotable），因此您無法在 Kotlin 程式碼中直接撰寫它們。相反地，您最常會在編譯器診斷訊息中看到捕獲型別，例如 `CapturedType(out X)`。例如，以下型別不符的診斷訊息包含了一個捕獲型別：

```kotlin
val array: Array<out CharSequence> = arrayOf("str")
val item: Int = array.get(0)
// Initializer type mismatch: expected 'Int', actual 'CapturedType(out CharSequence)'
```

編譯器在讀取操作時使用捕獲型別的上界，而在寫入操作時使用其下界來判斷哪些值是型別安全的：

```kotlin
// 投影型別為 Array<out CharSequence>
val array: Array<out CharSequence> = arrayOf("Kotlin")

// get() 讀取操作使用捕獲型別的上界 CharSequence
val item = array.get(0)

// set() 寫入操作使用捕獲型別的下界 Nothing，
// 這會導致錯誤
array.set(0, "New value")
// Receiver type 'Array<out CharSequence>' contains out projection
// which prohibits the use of 'fun set(index: Int, value: T): Unit'
```

在此範例中：

* 變數 `array` 具有投影型別 `Array<out CharSequence>`。編譯器將投影型別引數 `out CharSequence` 表示為捕獲型別，以 `CharSequence` 為其上界，`Nothing` 為其下界。
* 對於 `get()` 操作，編譯器將捕獲型別近似為其上界 `CharSequence`，並推論出 `item` 的型別為 `CharSequence`。
* 對於 `set()` 操作，捕獲型別以 `Nothing` 為其下界。由於 `Nothing` 沒有任何執行個體，因此向投影型別寫入值是不具型別安全性的，會導致錯誤。

## 泛型函式 {id="generic-functions"}

類別不是唯一可以擁有型別參數的宣告。函式也可以。型別參數放置在函式名稱的*前面*：

```kotlin
fun <T> singletonList(item: T): List<T> {
    // ...
}

fun <T> T.basicToString(): String { // 擴充函式
    // ...
}
```

若要呼叫泛型函式，請在呼叫點的函式名稱*後面*指定型別引數：

```kotlin
val l = singletonList<Int>(1)
```

如果可以從上下文中推論出型別引數，則可以省略它們，因此以下範例也可以正常運作：

```kotlin
val l = singletonList(1)
```

## 泛型約束 {id="generic-constraints"}

可用於取代給定型別參數的所有可能型別的集合，可能會受到*泛型約束 (generic constraints)* 的限制。

### 上界 {id="upper-bounds"}

最常見的約束型別是*上界 (upper bound)*，對應於 Java 的 `extends` 關鍵字：

```kotlin
fun <T : Comparable<T>> sort(list: List<T>) {  ... }
```

冒號後指定的型別即為*上界*，表示只有 `Comparable<T>` 的子型別可以用來取代 `T`。例如：

```kotlin
sort(listOf(1, 2, 3)) // 正確。Int 是 Comparable<Int> 的子型別
sort(listOf(HashMap<Int, String>())) // 錯誤：HashMap<Int, String> 不是 Comparable<HashMap<Int, String>> 的子型別
```

預設的上界（若未指定）是 `Any?`。尖括號內只能指定一個上界。
如果同一個型別參數需要多個上界，您需要獨立的 *where* 子句：

```kotlin
fun <T> copyWhenGreater(list: List<T>, threshold: T): List<String>
    where T : CharSequence,
          T : Comparable<T> {
    return list.filter { it > threshold }.map { it.toString() }
}
```

傳入的型別必須同時滿足 `where` 子句的所有條件。在上述範例中，`T` 型別必須*同時*實作 `CharSequence` 和 `Comparable`。

## 絕對非 null 型別 {id="definitely-non-nullable-types"}

為了使與泛型 Java 類別和介面的互通更加容易，Kotlin 支援將泛型型別參數宣告為**絕對非 null (definitely non-nullable)**。

若要將泛型型別 `T` 宣告為絕對非 null，請使用 `& Any` 宣告該型別。例如：`T & Any`。

絕對非 null 型別必須具有可為 null 的[上界](#upper-bounds)。

宣告絕對非 null 型別最常見的使用案例，是當您想要覆寫包含 `@NotNull` 作為引數的 Java 方法時。例如，考慮 `load()` 方法：

```java
import org.jetbrains.annotations.*;

public interface Game<T> {
    public T save(T x) {}
    @NotNull
    public T load(@NotNull T x) {}
}
```

要在 Kotlin 中成功覆寫 `load()` 方法，您需要將 `T1` 宣告為絕對非 null：

```kotlin
interface ArcadeGame<T1> : Game<T1> {
    override fun save(x: T1): T1
    // T1 是絕對非 null 的
    override fun load(x: T1 & Any): T1 & Any
}
```

如果僅使用 Kotlin 開發，您不太需要明確宣告絕對非 null 型別，因為 Kotlin 的型別推論會為您處理好這件事。

## 型別消除 {id="type-erasure"}

Kotlin 針對泛型宣告使用情況所執行的型別安全檢查是在編譯期完成的。
在執行時期，泛型型別的執行個體不會保留有關其實際型別引數的任何資訊。
該型別資訊被稱為已被*消除 (erased)*。例如，`Foo<Bar>` 和 `Foo<Baz?>` 的執行個體都會被消除為僅僅是 `Foo<*>`。

### 泛型型別檢查與轉換 {id="generics-type-checks-and-casts"}

由於型別消除，在執行時期沒有通用的方法可以檢查泛型型別的執行個體是否是使用特定型別引數建立的，且編譯器禁止諸如 `ints is List<Int>` 或 `list is T`（型別參數）之類的 `is` 檢查。但是，您可以針對星號投影型別來檢查執行個體：

```kotlin
if (something is List<*>) {
    something.forEach { println(it) } // 項目型別為 `Any?`
}
```

同樣地，當您已經在靜態（編譯期）檢查過執行個體的型別引數時，您可以進行涉及該型別非泛型部分的 `is` 檢查或轉換。請注意，在這種情況下會省略尖括號：

```kotlin
fun handleStrings(list: MutableList<String>) {
    if (list is ArrayList) {
        // `list` 智慧轉換為 `ArrayList<String>`
    }
}
```

相同的語法（但省略型別引數）可用於不考慮型別引數的轉換：`list as ArrayList`。

泛型函式呼叫的型別引數也僅在編譯期進行檢查。在函式主體內部，型別參數不能用於型別檢查，且轉換為型別參數的型別轉換（`foo as T`）是未受檢的 (unchecked)。唯一的例外是帶有[具體化型別參數](inline-functions.md#reified-type-parameters)的 inline 函式，它們會在每個呼叫點將其實際型別引數內嵌。這使得能夠對型別參數進行型別檢查和轉換。然而，上述限制仍然適用於在檢查或轉換內部使用的泛型型別執行個體。例如，在型別檢查 `arg is T` 中，如果 `arg` 本身就是泛型型別的執行個體，它的型別引數仍然會被消除。

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
val stringToStringList = somePair.asPairOf<String, List<String>>() // 可編譯但破壞了型別安全！
// 展開範例以查看更多詳細資訊

//sampleEnd

fun main() {
    println("stringToSomething = " + stringToSomething)
    println("stringToInt = " + stringToInt)
    println("stringToList = " + stringToList)
    println("stringToStringList = " + stringToStringList)
    //println(stringToStringList?.second?.forEach() {it.length}) // 這將擲出 ClassCastException，因為清單項目不是 String
}
```
{kotlin-runnable="true"}

### 未受檢轉換 {id="unchecked-casts"}

轉換為具有具體型別引數的泛型型別（例如 `foo as List<String>`）無法在執行時期進行檢查。  
當高階程式邏輯隱含了型別安全，但編譯器無法直接推論時，可以使用這些未受檢轉換。請參閱以下範例。

```kotlin
fun readDictionary(file: File): Map<String, *> = file.inputStream().use { 
    TODO("Read a mapping of strings to arbitrary elements.")
}

// 我們將包含 `Int` 的 Map 儲存到此檔案中
val intsFile = File("ints.dictionary")

// 警告：Unchecked cast: `Map<String, *>` to `Map<String, Int>`
val intsDictionary: Map<String, Int> = readDictionary(intsFile) as Map<String, Int>
```
最後一行的轉換會出現警告。編譯器無法在執行時期對其進行完整檢查，且不保證 Map 中的值為 `Int`。

若要避免未受檢轉換，您可以重新設計程式結構。在上述範例中，您可以針對不同型別使用具有型別安全實作的 `DictionaryReader<T>` 和 `DictionaryWriter<T>` 介面。您可以引進合理的抽象化，將未受檢轉換從呼叫點轉移到實作細節中。正確使用[泛型差異](#variance)也能有所幫助。

對於泛型函式，使用[具體化型別參數](inline-functions.md#reified-type-parameters)會讓類似 `arg as T` 的轉換成為受檢轉換，除非 `arg` 的型別擁有*其自身*被消除的型別引數。

未受檢轉換的警告可以透過在發生該警告的陳述式或宣告上使用 `@Suppress("UNCHECKED_CAST")` 進行[註解](annotations.md)來隱藏：

```kotlin
inline fun <reified T> List<*>.asListOfType(): List<T>? =
    if (all { it is T })
        @Suppress("UNCHECKED_CAST")
        this as List<T> else
        null
```

>**在 JVM 上**：[陣列型別](arrays.md)（`Array<Foo>`）會保留有關其元素消除型別的資訊，且對陣列型別的型別轉換是部分受檢的：元素型別的可 null 性和實際型別引數仍會被消除。例如，如果 `foo` 是一個持有任何 `List<*>` 的陣列，則轉換 `foo as Array<List<String>?>` 都將成功，無論其是否可為 null。
>
{style="note"}

## 型別引數的底線運算子 {id="underscore-operator-for-type-arguments"}

底線運算子 `_` 可用於型別引數。當其他型別已明確指定時，使用它可以自動推論該引數的型別：

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
```