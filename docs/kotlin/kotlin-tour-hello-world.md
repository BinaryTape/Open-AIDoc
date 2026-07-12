.

要在模板表达式中求值一小段代码，请在美元符号 `$` 后将代码放在花括号 `{}` 中。

例如：

```kotlin
fun main() { 
//sampleStart
    val customers = 10
    println("There are $customers customers")
    // There are 10 customers
    
    println("There are ${customers + 1} customers")
    // There are 11 customers
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-string-templates"}

有关更多信息，请参阅[字符串模板](strings.md#string-templates)。

您会注意到变量没有声明任何类型。Kotlin 会自动推断类型：`Int`。本教程将在[下一章](kotlin-tour-basic-types.md)中介绍 Kotlin 的各种基本类型以及如何声明它们。

## 练习 {completion-point="true"}

### 习题 {initial-collapse-state="collapsed" collapsible="true"}

完成代码，使程序向标准输出打印 `"Mary is 20 years old"`：

|---|---|
```kotlin
fun main() {
    val name = "Mary"
    val age = 20
    // 在此处编写您的代码
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-hello-world-exercise"}

|---|---|
```kotlin
fun main() {
    val name = "Mary"
    val age = 20
    println("$name is $age years old")
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解法" id="kotlin-tour-hello-world-solution"}

<seealso></seealso>

<list id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-basic-types.md" mode="classic" icon="arrow-right" icon-position="right">下一步</a>
  </li>
</list>