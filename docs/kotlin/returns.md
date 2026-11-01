[//]: # (title: 返回与跳转)

Kotlin 具有三种结构化跳转表达式：

* `return` 默认从最近的封闭函数或[匿名函数](lambdas.md#anonymous-functions)中返回。
* `break` 终止最近的封闭循环。
* `continue` 进入最近封闭循环的下一步。

所有这些表达式都可以作为更大表达式的一部分使用：

```kotlin
val s = person.name ?: return
```

这些表达式的类型为 [Nothing 类型](exceptions.md#the-nothing-type)。

## Break 与 continue 标签 {id="break-and-continue-labels"}

Kotlin 中的任何表达式都可以使用*标签*（label）进行标记。
标签的格式为一个标识符后跟 `@` 符号，例如 `abc@` 或 `fooBar@`。
要为表达式添加标签，只需在其前面加上标签即可。

```kotlin
loop@ for (i in 1..100) {
    // ...
}
```

现在，你可以使用标签来限定 `break` 或 `continue`：

```kotlin
loop@ for (i in 1..100) {
    for (j in 1..100) {
        if (...) break@loop
    }
}
```

带标签限定的 `break` 会跳转到带有该标签的循环紧随其后的执行点。
`continue` 会推进到该循环的下一次迭代。

> 在某些情况下，你可以*非局部*地应用 `break` 和 `continue`，而无需显式定义标签。
> 此类非局部用法在封闭[内联函数](inline-functions.md#break-and-continue)所使用的 lambda 表达式中是有效的。
>
{style="note"}

## 返回到标签 {id="return-to-labels"}

在 Kotlin 中，函数可以通过使用函数字面量、局部函数以及对象表达式进行嵌套。
限定的 `return` 允许你从外层函数中返回。

最重要的用例是从 lambda 表达式中返回。要从 lambda 表达式返回，请为其添加标签并限定 `return`：

```kotlin
//sampleStart
fun foo() {
    listOf(1, 2, 3, 4, 5).forEach lit@{
        if (it == 3) return@lit // 局部返回到该 lambda 的调用方 - 即 forEach 循环
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

现在，它仅从该 lambda 表达式中返回。通常使用*隐式标签*更为方便，因为此类标签与接收该 lambda 的函数同名。

```kotlin
//sampleStart
fun foo() {
    listOf(1, 2, 3, 4, 5).forEach {
        if (it == 3) return@forEach // 局部返回到该 lambda 的调用方 - 即 forEach 循环
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

或者，你可以使用[匿名函数](lambdas.md#anonymous-functions)替代 lambda 表达式。
匿名函数中的 `return` 语句将从该匿名函数本身返回。

```kotlin
//sampleStart
fun foo() {
    listOf(1, 2, 3, 4, 5).forEach(fun(value: Int) {
        if (value == 3) return  // 局部返回到该匿名函数的调用方 - 即 forEach 循环
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

请注意，上述三个示例中局部返回的使用类似于常规循环中 `continue` 的使用。

对于 `break` 并没有直接对应的等价物，但可以通过添加一个外层 `run` lambda 并从中进行非局部返回来模拟：

```kotlin
//sampleStart
fun foo() {
    run loop@{
        listOf(1, 2, 3, 4, 5).forEach {
            if (it == 3) return@loop // 从传递给 run 的 lambda 中进行非局部返回
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

此处的非局部返回之所以可行，是因为嵌套的 `forEach()` lambda 充当了[内联函数](inline-functions.md)。

当返回值时，解析器会优先考虑带限定符的返回：

```kotlin
return@a 1
```

这表示“在标签 `@a` 处返回 `1`”，而不是“返回带标签的表达式 `(@a 1)`”。

> 在某些情况下，你可以从 lambda 表达式返回而无需使用标签。此类*非局部*返回位于 lambda 中，但会退出封闭[内联函数](inline-functions.md#returns)。
>
{style="note"}