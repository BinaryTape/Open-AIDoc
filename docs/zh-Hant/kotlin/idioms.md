[//]: # (title: 慣用法)

Kotlin 中一些常見且常用的慣用法集合。如果您有喜愛的慣用法，歡迎透過發送提取要求來貢獻。

## 建立 DTO（POJO/POCO） {id="create-dtos-pojos-pocos"}

```kotlin
data class Customer(val name: String, val email: String)
```

為 `Customer` 類別提供以下功能：

* 所有屬性的 getter（若是 `var` 則包含 setter）
* `equals()`
* `hashCode()`
* `toString()`
* `copy()`
* 所有屬性對應的 `component1()`、`component2()`……（請參閱[資料類別 (Data classes)](data-classes.md)）

## 函式參數的預設值 {id="default-values-for-function-parameters"}

```kotlin
fun foo(a: Int = 0, b: String = "") { ... }
```

## 篩選清單 {id="filter-a-list"}

```kotlin
val positives = list.filter { x -> x > 0 }
```

或者更簡短的寫法：

```kotlin
val positives = list.filter { it > 0 }
```

了解 [Java 與 Kotlin 篩選之間的差異](java-to-kotlin-collections-guide.md#filter-elements)。

## 檢查元素是否存在於集合中 {id="check-the-presence-of-an-element-in-a-collection"}

```kotlin
if ("john@example.com" in emailsList) { ... }

if ("jane@example.com" !in emailsList) { ... }
```

## 字串插值 {id="string-interpolation"}

```kotlin
println("Name $name")
```

了解 [Java 與 Kotlin 字串連接之間的差異](java-to-kotlin-idioms-strings.md#concatenate-strings)。

## 安全地讀取標準輸入 {id="read-standard-input-safely"}

```kotlin
// 讀取一個字串，如果輸入無法轉換為整數則傳回 null。例如：Hi there!
val wrongInt = readln().toIntOrNull()
println(wrongInt)
// null

// 讀取一個可轉換為整數的字串並傳回整數。例如：13
val correctInt = readln().toIntOrNull()
println(correctInt)
// 13
```

若要了解更多資訊，請參閱[讀取標準輸入](read-standard-input.md)。

## 執行個體檢查 {id="instance-checks"}

```kotlin
when (x) {
    is Foo -> ...
    is Bar -> ...
    else   -> ...
}
```

## 唯讀清單 {id="read-only-list"}

```kotlin
val list = listOf("a", "b", "c")
```
## 唯讀 Map {id="read-only-map"}

```kotlin
val map = mapOf("a" to 1, "b" to 2, "c" to 3)
```

## 存取 Map 項目 {id="access-a-map-entry"}

```kotlin
println(map["key"])
map["key"] = value
```

## 遍歷 Map 或 Pair 清單 {id="traverse-a-map-or-a-list-of-pairs"}

```kotlin
for ((k, v) in map) {
    println("$k -> $v")
}
```

`k` 與 `v` 可以是任何方便的名稱，例如 `name` 和 `age`。

## 走訪區間 {id="iterate-over-a-range"}

```kotlin
for (i in 1..100) { ... }  // 包含 100
for (i in 1..<100) { ... } // 不包含 100
for (x in 2..10 step 2) { ... }
for (x in 10 downTo 1) { ... }
(1..10).forEach { ... }
```

## 延遲屬性 {id="lazy-property"}

```kotlin
val p: String by lazy { // 該值僅在第一次存取時計算
    // 計算字串
}
```

## 擴充函式 {id="extension-functions"}

```kotlin
fun String.spaceToCamelCase() { ... }

"Convert this to camelcase".spaceToCamelCase()
```

## 建立單例 {id="create-a-singleton"}

```kotlin
object Resource {
    val name = "Name"
}
```

## 使用內嵌值類別實現型別安全的值 {id="use-inline-value-classes-for-type-safe-values"}

```kotlin
@JvmInline
value class EmployeeId(private val id: String)

@JvmInline
value class CustomerId(private val id: String)
```

如果不小心混淆了 `EmployeeId` 和 `CustomerId`，將會觸發編譯錯誤。

> `@JvmInline` 註解僅在 JVM 後端需要。
>
{style="note"}

## 具現化抽象類別 {id="instantiate-an-abstract-class"}

```kotlin
abstract class MyAbstractClass {
    abstract fun doSomething()
    abstract fun sleep()
}

fun main() {
    val myObject = object : MyAbstractClass() {
        override fun doSomething() {
            // ...
        }

        override fun sleep() { // ...
        }
    }
    myObject.doSomething()
}
```

## If-not-null 簡寫 {id="if-not-null-shorthand"}

```kotlin
val files = File("Test").listFiles()

println(files?.size) // 如果 files 不為 null，則印出 size
```

## If-not-null-else 簡寫 {id="if-not-null-else-shorthand"}

```kotlin
val files = File("Test").listFiles()

// 用於簡單的備援值：
println(files?.size ?: "empty") // 如果 files 為 null，此處會印出 "empty"

// 若要在程式碼區塊中計算較複雜的備援值，請使用 `run`
val filesSize = files?.size ?: run { 
    val someSize = getSomeSize()
    someSize * 2
}
println(filesSize)
```

## 若為 null 則執行運算式 {id="execute-an-expression-if-null"}

```kotlin
val values = ...
val email = values["email"] ?: throw IllegalStateException("Email is missing!")
```

## 取得可能為空的集合的第一個項目 {id="get-first-item-of-a-possibly-empty-collection"}

```kotlin
val emails = ... // 可能為空
val mainEmail = emails.firstOrNull() ?: ""
```

了解 [Java 與 Kotlin 取得第一個項目之間的差異](java-to-kotlin-collections-guide.md#get-the-first-and-the-last-items-of-a-possibly-empty-collection)。

## 若不為 null 則執行 {id="execute-if-not-null"}

```kotlin
val value = ...

value?.let {
    ... // 若不為 null 則執行此區塊
}
```

## 若不為 null 則對應可 null 值 {id="map-nullable-value-if-not-null"}

```kotlin
val value = ...

val mapped = value?.let { transformValue(it) } ?: defaultValue 
// 如果該值或轉換結果為 null，則傳回 defaultValue。
```

## 在 when 陳述式上 return {id="return-on-when-statement"}

```kotlin
fun transform(color: String): Int {
    return when (color) {
        "Red" -> 0
        "Green" -> 1
        "Blue" -> 2
        else -> throw IllegalArgumentException("Invalid color param value")
    }
}
```

## try-catch 運算式 {id="try-catch-expression"}

```kotlin
fun test() {
    val result = try {
        count()
    } catch (e: ArithmeticException) {
        throw IllegalStateException(e)
    }

    // 使用 result 進行處理
}
```

## if 運算式 {id="if-expression"}

```kotlin
val y = if (x == 1) {
    "one"
} else if (x == 2) {
    "two"
} else {
    "other"
}
```

## 傳回 Unit 的方法的 Builder 風格用法 {id="builder-style-usage-of-methods-that-return-unit"}

```kotlin
fun arrayOfMinusOnes(size: Int): IntArray {
    return IntArray(size).apply { fill(-1) }
}
```

## 單一運算式函式 {id="single-expression-functions"}

```kotlin
fun theAnswer() = 42
```

這等同於

```kotlin
fun theAnswer(): Int {
    return 42
}
```

這可以有效地與其他慣用法結合，讓程式碼更精簡。例如搭配 `when` 運算式：

```kotlin
fun transform(color: String): Int = when (color) {
    "Red" -> 0
    "Green" -> 1
    "Blue" -> 2
    else -> throw IllegalArgumentException("Invalid color param value")
}
```

## 在物件執行個體上呼叫多個方法 (with) {id="call-multiple-methods-on-an-object-instance-with"}

```kotlin
class Turtle {
    fun penDown()
    fun penUp()
    fun turn(degrees: Double)
    fun forward(pixels: Double)
}

val myTurtle = Turtle()
with(myTurtle) { // 繪製一個 100 像素的正方形
    penDown()
    for (i in 1..4) {
        forward(100.0)
        turn(90.0)
    }
    penUp()
}
```

## 設定物件的屬性 (apply) {id="configure-properties-of-an-object-apply"}

```kotlin
val myRectangle = Rectangle().apply {
    length = 4
    breadth = 5
    color = 0xFAFAFA
}
```

這對於設定未包含在物件建構函式中的屬性非常有用。

## Java 7 的 try-with-resources {id="java-7-s-try-with-resources"}

```kotlin
val stream = Files.newInputStream(Paths.get("/some/file.txt"))
stream.buffered().reader().use { reader ->
    println(reader.readText())
}
```

## 需要泛型型別資訊的泛型函式 {id="generic-function-that-requires-the-generic-type-information"}

```kotlin
//  public final class Gson {
//     ...
//     public <T> T fromJson(JsonElement json, Class<T> classOfT) throws JsonSyntaxException {
//     ...

inline fun <reified T: Any> Gson.fromJson(json: JsonElement): T = this.fromJson(json, T::class.java)
```

## 交換兩個變數 {id="swap-two-variables"}

```kotlin
var a = 1
var b = 2
a = b.also { b = a }
```

## 將程式碼標記為未完成 (TODO) {id="mark-code-as-incomplete-todo"}
 
Kotlin 的標準函式庫提供了一個 `TODO()` 函式，它一律會拋出 `NotImplementedError`。
其傳回型別為 `Nothing`，因此無論預期的型別為何都可以使用。
此外還有一個接受原因參數的多載：

```kotlin
fun calcTaxes(): BigDecimal = TODO("Waiting for feedback from accounting")
```

IntelliJ IDEA 的 Kotlin 外掛程式能夠理解 `TODO()` 的語意，並自動在 TODO 工具視窗中新增程式碼指標。

## 下一步？ {id="what-s-next"}

* 使用符合 Kotlin 慣用法風格來解 [Advent of Code 謎題](advent-of-code.md)。
* 了解如何在 Java 與 Kotlin 中執行[字串的典型任務](java-to-kotlin-idioms-strings.md)。
* 了解如何在 Java 與 Kotlin 中執行[集合的典型任務](java-to-kotlin-collections-guide.md)。
* 了解如何在 Java 與 Kotlin 中[處理可 null 性](java-to-kotlin-nullability-guide.md)。