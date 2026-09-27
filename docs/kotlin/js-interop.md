[//]: # (title: 在 Kotlin 中使用 JavaScript 代码)

Kotlin 最初设计时考虑了与 Java 平台的轻松互操作：它将 Java 类视为 Kotlin 类，而 Java 也将 Kotlin 类视为 Java 类。

然而，JavaScript 是一种动态类型语言，这意味着它在编译时不会检查类型。你可以通过 [dynamic](dynamic-type.md) 类型在 Kotlin 中自由地与 JavaScript 通信。如果你想发挥 Kotlin 类型系统的全部威力，可以为 JavaScript 库创建 external 声明，这些声明将被 Kotlin 编译器和周边工具理解。

## 内联 JavaScript {id="inline-javascript"}

你可以使用 [`js()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.js/js.html) 函数将 JavaScript 代码内联到 Kotlin 代码中：

```kotlin
fun jsTypeOf(o: Any): String {
    return js("typeof o")
}
```

JavaScript 代码内联完全支持 [ES2015 特性](js-project-setup.md#set-an-ecmascript-target)，包括：

* `const` 与 `let` 变量声明
* ES 类
* 生成器
* Lambda 表达式（[箭头函数](whatsnew21.md#support-for-generating-es2015-arrow-functions)）
* 扩展与 rest 运算符
* 模板字符串

因为 `js` 的实参是在编译时解析并“原样”翻译为 JavaScript 代码的，所以它必须是一个字符串常量。因此，以下代码是不正确的：

```kotlin
fun jsTypeOf(o: Any): String {
    return js(getTypeof() + " o") // 错误：实参必须是字符串常量
    // 编译器无法计算字符串串联
}

fun getTypeof() = "typeof"
```

相反，例如要内联 rest 运算符，请使用字符串常量：

```kotlin
fun runSumExample() {
    val sum = js("(...nums) => nums.reduce((a, b) => a + b, 0)")
    println(sum(1, 2, 3, 4))
}
```

> 调用 `js()` 会返回一个 [`dynamic`](dynamic-type.md) 类型的结果，它在编译时不提供类型安全性。
>
{style="note"}

## `external` 修饰符 {id="external-modifier"}

为了告诉 Kotlin 某个声明是用纯 JavaScript 编写的，你应该使用 `external` 修饰符对其进行标记。当编译器看到这样的声明时，它会假定相应类、函数或属性的实现是由外部提供的（由开发者提供或通过 [npm 依赖项](js-project-setup.md#npm-dependencies)提供），因此不会尝试从该声明生成任何 JavaScript 代码。这也是为什么 `external` 声明不能有函数体的原因。例如：

```kotlin
external fun alert(message: Any?): Unit

external class Node {
    val firstChild: Node

    fun append(child: Node): Node

    fun removeChild(child: Node): Node

    // 等等
}

external val window: Window
```

请注意，`external` 修饰符会被嵌套声明继承。这就是为什么在上述示例的 `Node` 类中，成员函数和属性之前没有 `external` 修饰符的原因。

`external` 修饰符仅允许用于软件包级声明。你不能在非 `external` 类中声明 `external` 成员。

### 声明类的（静态）成员 {id="declare-static-members-of-a-class"}

在 JavaScript 中，你可以在原型或类本身上定义成员：

``` javascript
function MyClass() { ... }
MyClass.sharedMember = function() { /* 实现 */ };
MyClass.prototype.ownMember = function() { /* 实现 */ };
```

Kotlin 中没有这种语法。但是，在 Kotlin 中我们有 [`companion`](object-declarations.md#companion-objects) 对象。Kotlin 以特殊方式处理 `external` 类的伴侣对象：它不会期望一个对象，而是将伴侣对象的成员视为类本身的成员。上面示例中的 `MyClass` 可以描述如下：

```kotlin
external class MyClass {
    companion object {
        fun sharedMember()
    }

    fun ownMember()
}
```

### 声明带有默认值的形参 {id="declare-parameters-with-default-values"}

如果你正在为一个带有默认值形参的 JavaScript 函数编写 external 声明，请使用 `definedExternally`。这将默认值的生成委托给 JavaScript 函数本身：

```kotlin
external fun myFunWithOptionalArgs(
    x: Int,
    y: String = definedExternally,
    z: String = definedExternally
)
```

有了这个 external 声明，你可以使用一个必选实参和两个可选实参来调用 `myFunWithOptionalArgs`，其中默认值由 `myFunWithOptionalArgs` 的 JavaScript 实现计算。

### 扩展 JavaScript 类 {id="extend-javascript-classes"}

你可以像扩展 Kotlin 类一样轻松扩展 JavaScript 类。只需定义一个 `external open` 类，并由一个非 `external` 类扩展它。例如：

```kotlin
open external class Foo {
    open fun run()
    fun stop()
}

class Bar : Foo() {
    override fun run() {
        window.alert("Running!")
    }

    fun restart() {
        window.alert("Restarting")
    }
}
```

这里有一些限制：

- 当外部基类的函数通过签名重载时，你不能在派生类中重写它。
- 你不能重写包含带有默认值形参的函数。
- 外部类不能扩展非外部类。

### external 接口 {id="external-interfaces"}

JavaScript 没有接口的概念。当一个函数期望其形参支持 `foo` 和 `bar` 两个方法时，你只需传入一个实际拥有这些方法的对象即可。

你可以在静态类型的 Kotlin 中使用接口来表达这个概念：

```kotlin
external interface HasFooAndBar {
    fun foo()

    fun bar()
}

external fun myFunction(p: HasFooAndBar)
```

external 接口的一个典型用例是描述设置对象。例如：

```kotlin
external interface JQueryAjaxSettings {
    var async: Boolean

    var cache: Boolean

    var complete: (JQueryXHR, String) -> Unit

    // 等等
}

fun JQueryAjaxSettings(): JQueryAjaxSettings = js("{}")

external class JQuery {
    companion object {
        fun get(settings: JQueryAjaxSettings): JQueryXHR
    }
}

fun sendQuery() {
    JQuery.get(JQueryAjaxSettings().apply {
        complete = { (xhr, data) ->
            window.alert("Request complete")
        }
    })
}
```

External 接口有一些限制：

- 它们不能用于 `is` 检查的右侧。
- 它们不能作为 reified 类型实参传递。
- 它们不能用于类字面量表达式（如 `I::class`）。
- 转换为 external 接口的 `as` 转换总是成功的。
    转换为 external 接口会产生 “Unchecked cast to external interface” 编译时警告。可以使用 `@Suppress("UNCHECKED_CAST_TO_EXTERNAL_INTERFACE")` 注解消除该警告。

    IntelliJ IDEA 还可以自动生成 `@Suppress` 注解。通过灯泡图标或 Alt-Enter 打开意图菜单，然后点击 “Unchecked cast to external interface” 检查旁边的微小箭头。在这里，你可以选择抑制范围，IDE 将相应地在你的文件中添加注解。

### 转换 {id="casts"}

除了在转换不可行时会抛出 `ClassCastException` 的[“不安全”转换运算符](typecasts.md#unsafe-cast-operator) `as` 之外，Kotlin/JS 还提供了 [`unsafeCast<T>()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.js/unsafe-cast.html)。使用 `unsafeCast` 时，在运行时*完全不进行类型检查*。例如，考虑以下两个方法：

```kotlin
fun usingUnsafeCast(s: Any) = s.unsafeCast<String>()
fun usingAsOperator(s: Any) = s as String
```

它们将分别被编译为：

```javascript
function usingUnsafeCast(s) {
    return s;
}

function usingAsOperator(s) {
    var tmp$;
    return typeof (tmp$ = s) === 'string' ? tmp$ : throwCCE();
}
```

## 相等 {id="equality"}

与其他平台相比，Kotlin/JS 在相等检查方面具有特定的语义。

在 Kotlin/JS 中，Kotlin 的[引用相等](equality.md#referential-equality)运算符 (`===`) 始终翻译为 JavaScript 的[严格相等](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Strict_equality)运算符 (`===`)。

JavaScript 的 `===` 运算符不仅检查两个值是否相等，还检查这两个值的类型是否相等：

 ```kotlin
fun main() {
    val name = "kotlin"
    val value1 = name.substring(0, 1)
    val value2 = name.substring(0, 1)

    println(value1 === value2)
    // 在 Kotlin/JS 上打印 'true'
    // 在其他平台上打印 'false'
}
 ```

此外，在 Kotlin/JS 中，[`Byte`、`Short`、`Int`、`Float` 和 `Double`](js-to-kotlin-interop.md#kotlin-types-in-javascript) 数值类型在运行时都由 JavaScript 的 `Number` 类型表示。因此，这五种类型的值是无法区分的：

 ```kotlin
fun main() {
    println(1.0 as Any === 1 as Any)
    // 在 Kotlin/JS 上打印 'true'
    // 在其他平台上打印 'false'
}
 ```

> 有关 Kotlin 中相等的更多信息，请参阅[相等](equality.md)文档。
> 
{style="tip"}