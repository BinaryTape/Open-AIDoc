[//]: # (title: 讀取標準輸入)

使用 `readln()` 函式從標準輸入讀取資料。它會將整行內容讀取為字串：

```kotlin
// 讀取使用者輸入並將其儲存在變數中。例如：Hi there!
val myInput = readln()

println(myInput)
// Hi there!

// 讀取並列印使用者輸入，不將其儲存在變數中。例如：Hi, Kotlin!
println(readln())
// Hi, Kotlin!
```

您也可以將多行輸入讀取為單一字串。
使用 [`joinToString()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.sequences/join-to-string.html) 函式來組合這些行：

```kotlin
val input = generateSequence(::readlnOrNull)
  .joinToString("
")
```

> 使用 [`readlnOrNull()`](#handle-standard-input-safely) 代替 `readln()` 讀取輸入直到檔案結尾，且不會拋出例外。
> 
{style="note"}

若要處理字串以外的資料型別，您可以使用 `.toInt()`、`.toLong()`、`.toDouble()`、`.toFloat()` 或 `.toBoolean()` 等轉換函式來轉換輸入。
可以讀取多個不同資料型別的輸入，並將每個輸入儲存在一個變數中：

```kotlin
// 將輸入從字串轉換為整數值。例如：12
val myNumber = readln().toInt()
println(myNumber)
// 12

// 將輸入從字串轉換為 double 值。例如：345 
val myDouble = readln().toDouble()
println(myDouble)
// 345.0

// 將輸入從字串轉換為布林值。例如：true
val myBoolean = readln().toBoolean()
println(myBoolean)
// true
```

這些轉換函式假設使用者輸入的是目標資料型別的有效表示形式。例如，使用 `.toInt()` 將 "hello" 轉換為整數會導致例外，因為該函式預期字串輸入為數字。

若要讀取由分隔符號分隔的數個輸入元素，請使用指定分隔符號的 `.split()` 函式。以下程式碼範例從標準輸入讀取內容，根據分隔符號將輸入拆分為元素列表，並將列表中的每個元素轉換為特定型別：

```kotlin
// 讀取輸入（假設元素以空格分隔），並將其轉換為整數。例如：1 2 3 
val numbers = readln().split(' ').map { it.toInt() }
println(numbers)
//[1, 2, 3] 

// 讀取輸入（假設元素以逗號分隔），並將其轉換為 double。例如：4,5,6
val doubles = readln().split(',').map { it.toDouble() }
println(doubles)
//[4.0, 5.0, 6.0]
```

> 關於在 Kotlin/JVM 中讀取使用者輸入的另一種方式，請參閱 [使用 Java Scanner 的標準輸入](standard-input.md)。
>
{style="note"}

## 安全地處理標準輸入

您可以使用 `.toIntOrNull()` 函式安全地將使用者輸入從字串轉換為整數。如果轉換成功，此函式會回傳整數。但是，如果輸入不是整數的有效表示形式，它會回傳 `null`：

```kotlin
// 如果輸入無效則回傳 null。例如：Hello!
val wrongInt = readln().toIntOrNull()
println(wrongInt)
// null

// 將有效的輸入從字串轉換為整數。例如：13
val correctInt = readln().toIntOrNull()
println(correctInt)
// 13
```

`readlnOrNull()` 函式也有助於安全地處理使用者輸入。`readlnOrNull()` 函式從標準輸入讀取，如果到達輸入末尾則回傳 null，而在這種情況下 `readln()` 則會拋出例外。