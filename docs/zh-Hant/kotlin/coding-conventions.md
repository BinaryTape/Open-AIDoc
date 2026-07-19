[//]: # (title: 程式碼慣例)

作為字串常值：

```kotlin
val KClass<*>.jsonSchema : String
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

始終使用不可變集合介面 (`Collection`、`List`、`Set`、`Map`) 來宣告不會被修改的集合。當使用工廠函式建立集合執行個體時，儘可能使用傳回不可變集合型別的函式：

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

優先使用高階函數 (`filter`、`map` 等) 而非迴圈。例外：`forEach`（優先使用一般 `for` 迴圈，除非 `forEach` 的接收者是可 null 的，或者 `forEach` 是較長呼叫鏈的一部分）。

在具有多個高階函數的複雜運算式與迴圈之間進行選擇時，請了解每種情況下執行的操作成本，並牢記效能考量。 

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
* 計算成本低（或在首次叫用時快取）。
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