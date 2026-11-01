[//]: # (title: 返回與跳轉)

Kotlin 具有三種結構化跳轉運算式：

* `return` 預設從最接近的外層函式或[匿名函式](lambdas.md#anonymous-functions)返回。
* `break` 終止最接近的外層迴圈。
* `continue` 繼續執行最接近的外層迴圈的下一步。

所有這些運算式都可以作為更大運算式的一部分使用：

```kotlin
val s = person.name ?: return
```

這些運算式的型別為 [Nothing 型別](exceptions.md#the-nothing-type)。

## Break 與 continue 標籤 {id="break-and-continue-labels"}

Kotlin 中的任何運算式都可以使用*標籤* (label) 進行標記。
標籤的形式為識別符號後接 `@` 符號，例如 `abc@` 或 `fooBar@`。
要為運算式標記標籤，只需在運算式前方新增標籤即可。

```kotlin
loop@ for (i in 1..100) {
    // ...
}
```

現在，你可以使用標籤來限定 `break` 或 `continue`：

```kotlin
loop@ for (i in 1..100) {
    for (j in 1..100) {
        if (...) break@loop
    }
}
```

帶有標籤限定的 `break` 會跳轉到標記有該標籤的迴圈緊接之後的執行點。
`continue` 則推進至該迴圈的下一次反覆運算。

> 在某些情況下，你可以*非區域性地* (non-locally) 套用 `break` 與 `continue`，而無需明確定義標籤。
> 這種非區域用法在外層 [inline 函式](inline-functions.md#break-and-continue)中使用的 Lambda 運算式內是有效的。
>
{style="note"}

## 返回到標籤 {id="return-to-labels"}

在 Kotlin 中，函式可以透過函式常值、區域函式和物件運算式進行巢狀。
帶有限定詞的 `return` 允許你從外層函式返回。

最重要的使用案例是從 Lambda 運算式返回。要從 Lambda 運算式返回，請為其加上標籤並限定 `return`：

```kotlin
//sampleStart
fun foo() {
    listOf(1, 2, 3, 4, 5).forEach lit@{
        if (it == 3) return@lit // 區域返回至 Lambda 的呼叫者 - 即 forEach 迴圈
        print(it)
    }
    print(" done with explicit label")
}
//sampleEnd

fun main() {
    foo()
}
```
{kotlin-runnable="true"}

現在，它只會從 Lambda 運算式返回。通常使用*隱式標籤*會更方便，因為此類標籤與接收該 Lambda 的函式同名。

```kotlin
//sampleStart
fun foo() {
    listOf(1, 2, 3, 4, 5).forEach {
        if (it == 3) return@forEach // 區域返回至 Lambda 的呼叫者 - 即 forEach 迴圈
        print(it)
    }
    print(" done with implicit label")
}
//sampleEnd

fun main() {
    foo()
}
```
{kotlin-runnable="true"}

或者，你也可以將 Lambda 運算式替換為[匿名函式](lambdas.md#anonymous-functions)。
匿名函式中的 `return` 陳述式將從該匿名函式本身返回。

```kotlin
//sampleStart
fun foo() {
    listOf(1, 2, 3, 4, 5).forEach(fun(value: Int) {
        if (value == 3) return  // 區域返回至匿名函式的呼叫者 - 即 forEach 迴圈
        print(value)
    })
    print(" done with anonymous function")
}
//sampleEnd

fun main() {
    foo()
}
```
{kotlin-runnable="true"}

請注意，前三個範例中區域返回的使用方式與一般迴圈中 `continue` 的用法類似。

對於 `break` 沒有直接對應的語法，但可以透過新增一個外層的 `run` Lambda 並從中進行非區域返回來模擬：

```kotlin
//sampleStart
fun foo() {
    run loop@{
        listOf(1, 2, 3, 4, 5).forEach {
            if (it == 3) return@loop // 從傳遞給 run 的 Lambda 進行非區域返回
            print(it)
        }
    }
    print(" done with nested loop")
}
//sampleEnd

fun main() {
    foo()
}
```
{kotlin-runnable="true"}

這裡之所以能進行非區域返回，是因為巢狀的 `forEach()` Lambda 做為 [inline 函式](inline-functions.md)運作。

當傳回值時，剖析器會優先考慮帶限定詞的返回：

```kotlin
return@a 1
```

這意味著「在標籤 `@a` 處返回 `1`」，而不是「返回帶標籤的運算式 `(@a 1)`」。

> 在某些情況下，你可以從 Lambda 運算式返回而無需使用標籤。此類*非區域*返回位於 Lambda 中，但會退出外層的 [inline 函式](inline-functions.md#returns)。
>
{style="note"}