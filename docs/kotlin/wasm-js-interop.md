[//]: # (title: 与 JavaScript 的互操作性)

<primary-label ref="beta"/> 

Kotlin/Wasm 允许你在 Kotlin 中使用 JavaScript 代码，以及在 JavaScript 中使用 Kotlin 代码。

与 [Kotlin/JS](js-overview.md) 一样，Kotlin/Wasm 编译器也具有与 JavaScript 的互操作性。如果你熟悉 Kotlin/JS 的互操作性，你会发现 Kotlin/Wasm 的互操作性与之类似。但是，有一些关键差异需要注意。

> Kotlin/Wasm 处于 [Beta](components-stability.md) 阶段。它可能随时发生变化。请在生产环境之前的场景中使用。我们欢迎你在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-56492) 中提供反馈。
>
{style="note"}

## 在 Kotlin 中使用 JavaScript 代码

了解如何通过使用 `external` 声明、带有 JavaScript 代码片段的函数以及 `@JsModule` 注解在 Kotlin 中使用 JavaScript 代码。

### 外部声明 (External declarations)

外部 JavaScript 代码在 Kotlin 中默认是不可见的。要在 Kotlin 中使用 JavaScript 代码，你可以使用 `external` 声明来描述其 API。

#### JavaScript 函数

考虑这个 JavaScript 函数： 

```javascript
function greet (name) {
    console.log("Hello, " + name + "!");
}
```

你可以在 Kotlin 中将其声明为一个 `external` 函数：

```kotlin
external fun greet(name: String)
```

外部函数没有主体，你可以像调用普通的 Kotlin 函数一样调用它：

```kotlin
fun main() {
    greet("Alice")
}
```

#### JavaScript 属性

考虑这个全局 JavaScript 变量：

```javascript
let globalCounter = 0;
```

你可以在 Kotlin 中使用外部 `var` 或 `val` 属性来声明它：

```kotlin
external var globalCounter: Int
```

这些属性是在外部初始化的。在 Kotlin 代码中，这些属性不能有 `= value` 初始值设定项。

#### JavaScript 类

考虑这个 JavaScript 类：

```javascript
class Rectangle {
    constructor (height, width) {
        this.height = height;
        this.width = width;
    }

    area () {
        return this.height * this.width;
    }
}
```

你可以在 Kotlin 中将其作为外部类使用：

```kotlin
external class Rectangle(height: Double, width: Double) : JsAny {
    val height: Double
    val width: Double
    fun area(): Double
}
```

`external` 类中的所有声明都被隐式视为外部的。

#### 外部接口 (External interfaces)

你可以在 Kotlin 中描述 JavaScript 对象的形状。考虑这个 JavaScript 函数及其返回值：

```javascript
function createUser (name, age) {
    return { name: name, age: age };
}
```

了解如何使用 `external interface User` 类型在 Kotlin 中描述其形状：

```kotlin
external interface User : JsAny {
    val name: String
    val age: Int
}

external fun createUser(name: String, age: Int): User
```

外部接口没有运行时类型信息，是一个仅限编译时的概念。因此，与常规接口相比，外部接口有一些限制：
* 你不能在 `is` 检查的右侧使用它们。
* 你不能在类文字表达式中使用它们（例如 `User::class`）。
* 你不能将它们作为具体化（reified）类型参数传递。
* 使用 `as` 转换为外部接口总是会成功。

#### 外部对象 (External objects)

考虑这些包含对象的 JavaScript 变量：

```javascript
let Counter = {
    value: 0,
    step: 1,
    increment () {
        this.value += this.step;
    }
};
```

你可以在 Kotlin 中将它们作为外部对象使用：

```kotlin
external object Counter : JsAny {
    fun increment()
    val value: Int
    var step: Int
}
```

#### 外部类型层次结构 (External type hierarchy)

与常规类和接口类似，你可以声明外部声明来扩展其他外部类并实现外部接口。但是，你不能在同一个类型层次结构中混合使用外部和非外部声明。

#### 带有 `@nativeInvoke` 的可调用 JavaScript 对象
<primary-label ref="experimental-opt-in"/>

你可以在 `external` 声明（类或接口）的 Kotlin 成员函数上使用 `@nativeInvoke` 注解，使其可以作为 JavaScript 函数调用。

通过此注解，在 Kotlin 中对该函数的每次调用都会转换为对 JavaScript 对象的直接调用：

```kotlin
import kotlin.js.nativeInvoke

@OptIn(ExperimentalWasmJsInterop::class)
external class JsAction {
    @nativeInvoke
    operator fun invoke(data: String)
}

fun main() {
    val action = JsAction() 
    action("Run task")
}
```

> `@nativeInvoke` 注解是一个临时解决方案，直到有了稳定互操作性的设计。目前，当你使用 `@nativeInvoke` 时，编译器会报告警告。
>
{style="note"}

### 带有 JavaScript 代码的 Kotlin 函数

通过定义带有 `= js("code")` 主体的函数，你可以将 JavaScript 片段添加到 Kotlin/Wasm 代码中：

```kotlin
fun getCurrentURL(): String =
    js("window.location.href")
```

如果你想运行一段 JavaScript 语句块，请使用花括号 `{}` 包裹字符串中的代码：

```kotlin
fun setLocalSettings(value: String): Unit = js(
    """{
        localStorage.setItem('settings', value);
}"""
)
```

如果你想返回一个对象，请在花括号 `{}` 外包裹圆括号 `()`：

```kotlin
fun createJsUser(name: String, age: Int): JsAny =
    js("({ name: name, age: age })")
```

Kotlin/Wasm 以特殊方式处理对 `js()` 函数的调用，其实现具有一些限制：
* `js()` 函数调用必须提供字符串字面量实参。
* `js()` 函数调用必须是函数体中唯一的表达式。
* `js()` 函数仅允许在软件包级函数中调用。
* 必须显式提供函数返回值类型。
* [类型](#type-correspondence)受到限制，类似于 `external fun`。

Kotlin 编译器将代码字符串放入生成的 JavaScript 文件中的函数内，并将其导入为 WebAssembly 格式。Kotlin 编译器不会验证这些 JavaScript 片段。如果存在 JavaScript 语法错误，它们将在你运行 JavaScript 代码时被报告。

> `@JsFun` 注解具有类似的功能，并且可能会被弃用。
>
{style="note"}

### JavaScript 模块

默认情况下，外部声明对应于 JavaScript 全局作用域。如果你使用 [`@JsModule` 注解](js-modules.md#jsmodule-annotation)标记 Kotlin 文件，那么其中的所有外部声明都将从指定的模块中导入。

考虑这个 JavaScript 代码示例：

```javascript
// users.mjs
export let maxUsers = 10;

export class User {
    constructor (username) {
        this.username = username;
    }
}
```

在 Kotlin 中通过 `@JsModule` 注解使用此 JavaScript 代码：

```kotlin
// Kotlin
@file:JsModule("./users.mjs")

external val maxUsers: Int

external class User : JsAny {
    constructor(username: String)

    val username: String
}
```

### 数组互操作性

你可以将 JavaScript 的 `JsArray<T>` 复制到 Kotlin 原生的 `Array` 或 `List` 类型中；同样地，你也可以将这些 Kotlin 类型复制到 `JsArray<T>`。

要将 `JsArray<T>` 转换为 `Array<T>` 或反之亦然，请使用可用的 [适配器函数](https://github.com/Kotlin/kotlinx-browser/blob/dfbdceed314567983c98f1d66e8c2e10d99c5a55/src/wasmJsMain/kotlin/arrayCopy.kt) 之一。

以下是泛型类型之间转换的示例：

```kotlin
val list: `List<JsString>` =
    listOf("Kotlin", "Wasm").map { it.toJsString() }

// 使用 .toJsArray() 将 List 或 Array 转换为 JsArray
val jsArray: JsArray<JsString> = list.toJsArray()

// 使用 .toArray() 和 .toList() 将其转回 Kotlin 类型 
val kotlinArray: `Array<JsString>` = jsArray.toArray()
val kotlinList: `List<JsString>` = jsArray.toList()
```

类似的适配器函数也可用于将类型化数组转换为其 Kotlin 等效项（例如 `IntArray` 和 `Int32Array`）。有关详细信息和实现，请参阅 [`kotlinx-browser` 仓库](https://github.com/Kotlin/kotlinx-browser/blob/dfbdceed314567983c98f1d66e8c2e10d99c5a55/src/wasmJsMain/kotlin/arrayCopy.kt)。

以下是类型化数组之间转换的示例：

```kotlin
import org.khronos.webgl.*

    // ...

    val intArray: IntArray = intArrayOf(1, 2, 3)
    
    // 使用 .toInt32Array() 将 Kotlin IntArray 转换为 JavaScript Int32Array
    val jsInt32Array: Int32Array = intArray.toInt32Array()
    
    // 使用 toIntArray() 将 JavaScript Int32Array 转回 Kotlin IntArray
    val kotlinIntArray: IntArray = jsInt32Array.toIntArray()
```

## 在 JavaScript 中使用 Kotlin 代码

了解如何通过使用 `@JsExport` 注解在 JavaScript 中使用你的 Kotlin 代码。

### 带有 @JsExport 注解的函数

要使 Kotlin/Wasm 函数对 JavaScript 代码可用，请使用 `@JsExport` 注解：

```kotlin
// Kotlin/Wasm

@JsExport
fun addOne(x: Int): Int = x + 1
```

标记有 `@JsExport` 注解的 Kotlin/Wasm 函数在生成的 `.mjs` 模块的 `default` 导出对象上作为属性可见。然后你可以在 JavaScript 中使用此函数：

```javascript
// JavaScript

import exports from "./module.mjs"

exports.addOne(10)
```

Kotlin/Wasm 编译器能够根据你 Kotlin 代码中的任何 `@JsExport` 声明生成 TypeScript 定义。这些定义可以被 IDE 和 JavaScript 工具用来提供代码自动补全、辅助类型检查，并使从 JavaScript 和 TypeScript 中消费 Kotlin 代码变得更加容易。

Kotlin/Wasm 编译器会收集任何标记有 `@JsExport` 注解的顶层函数，并在 `.d.ts` 文件中自动生成 TypeScript 定义。

要生成 TypeScript 定义，请在 `build.gradle.kts` 文件的 `wasmJs{}` 块中添加 `generateTypeScriptDefinitions()` 函数：

```kotlin
kotlin {
    wasmJs {
        binaries.executable()
        browser {
        }
        generateTypeScriptDefinitions()
    }
}
```

> 在 Kotlin/Wasm 中生成 TypeScript 声明文件是[实验性的](components-stability.md#stability-levels-explained)。它可能随时被弃用或更改。
>
{style="warning"}

## 类型对应关系

Kotlin/Wasm 在 JavaScript 互操作声明的签名中仅允许某些类型。这些限制统一适用于带有 `external`、`= js("code")` 或 `@JsExport` 的声明。

了解 Kotlin 类型如何对应 JavaScript 类型：

| Kotlin                                                     | JavaScript                        |
|------------------------------------------------------------|-----------------------------------|
| `Byte`, `Short`, `Int`, `Char`, `UByte`, `UShort`, `UInt`, | `Number`                          |
| `Float`, `Double`,                                         | `Number`                          |
| `Long`, `ULong`,                                           | `BigInt`                          |
| `Boolean`,                                                 | `Boolean`                         |
| `String`,                                                  | `String`                          |
| 返回位置的 `Unit`                                          | `undefined`                       |
| 函数类型，例如 `(String) -> Int`                           | Function                          |
| `JsAny` 及其子类型                                         | 任何 JavaScript 值                |
| `JsReference`                                              | 对 Kotlin 对象的不透明引用         |
| 其他类型                                                   | 不支持                             |

你也可以使用这些类型的可空版本。

### JsAny 类型

JavaScript 值在 Kotlin 中使用 `JsAny` 类型及其子类型表示。

Kotlin/Wasm 标准库提供了其中一些类型的表示：
* 软件包 `kotlin.js`：
    * `JsAny`
    * `JsBoolean`, `JsNumber`, `JsString`
    * `JsArray`
    * `Promise`

你还可以通过声明 `external` 接口或类来创建自定义 `JsAny` 子类型。

### JsReference 类型

Kotlin 值可以使用 `JsReference` 类型作为不透明引用传递给 JavaScript。

例如，如果你想将此 Kotlin 类 `User` 暴露给 JavaScript：

```kotlin
class User(var name: String)
```

你可以使用 `toJsReference()` 函数创建 `JsReference<User>` 并将其返回给 JavaScript：

```kotlin
@JsExport
fun createUser(name: String): JsReference<User> {
    return User(name).toJsReference()
}
```

这些引用在 JavaScript 中无法直接使用，其行为类似于空的已冻结 JavaScript 对象。要对这些对象进行操作，你需要使用 `get()` 方法向 JavaScript 导出更多函数，并在其中解包引用值：

```kotlin
@JsExport
fun setUserName(user: JsReference<User>, name: String) {
    user.get().name = name
}
```

你可以在 JavaScript 中创建一个类并更改其名称：

```javascript
import UserLib from "./userlib.mjs"

let user = UserLib.createUser("Bob");
UserLib.setUserName(user, "Alice");
```

### 类型参数

如果 JavaScript 互操作声明的类型参数具有 `JsAny` 或其子类型的上界，则可以拥有类型参数。例如：

```kotlin
external fun <T : JsAny> processData(data: JsArray<T>): T
```

## 异常处理

你可以使用 Kotlin `try-catch` 表达式在 Kotlin/Wasm 代码中捕获 JavaScript 异常。异常处理工作方式如下：

* 从 JavaScript 抛出的异常：详细信息在 Kotlin 侧可用。如果此类异常传播回 JavaScript，它将不再被包装到 WebAssembly 中。

* 从 Kotlin 抛出的异常：它们可以在 JavaScript 侧作为常规 JS 错误被捕获。

以下是一个演示在 Kotlin 侧捕获 JavaScript 异常的示例：

```kotlin
external object JSON {
    fun <T: JsAny> parse(json: String): T
}

fun main() {
    try {
        JSON.parse("an invalid JSON")
    } catch (e: JsException) {
        println("Thrown value is: ${e.thrownValue}")
        // SyntaxError: Unexpected token 'a', "an invalid JSON" is not valid JSON

        println("Message: ${e.message}")
        // Message: Unexpected token 'a', "an invalid JSON" is not valid JSON

        println("Stacktrace:")
        // Stacktrace:

        // 打印完整的 JavaScript 堆栈跟踪 
        e.printStackTrace()
    }
}
```

这种异常处理在支持 [`WebAssembly.JSTag`](https://webassembly.github.io/exception-handling/js-api/#dom-webassembly-jstag) 功能的现代浏览器中可以自动工作：

* Chrome 115+
* Firefox 129+
* Safari 18.4+

## Kotlin/Wasm 与 Kotlin/JS 互操作性的差异

虽然 Kotlin/Wasm 互操作性与 Kotlin/JS 互操作性有相似之处，但仍有一些关键差异需要注意：

|                         | **Kotlin/Wasm**                                                                                                                                                                                                     | **Kotlin/JS**                                                                                                                                       |
|-------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| **外部枚举**      | 不支持外部枚举类。                                                                                                                                                                              | 支持外部枚举类。                                                                                                                     |
| **类型扩展**     | 不支持非外部类型扩展外部类型。                                                                                                                                                        | 支持非外部类型。                                                                                                                        |
| **`JsName` 注解** | 仅在注解外部声明时有效。                                                                                                                                                           | 可用于更改常规非外部声明的名称。                                                                                   |
| **`js()` 函数**       | `js("code")` 函数调用允许作为软件包级函数的单一表达式主体。                                                                                                                     | `js("code")` 函数可以在任何上下文中调用并返回 `dynamic` 值。                                                               |
| **模块系统**      | 仅支持 ES 模块。没有与 `@JsNonModule` 注解类似的东西。将其导出作为 `default` 对象上的属性提供。仅允许导出软件包级函数。                           | 支持 ES 模块和旧版模块系统。提供命名的 ESM 导出。允许导出类和对象。                                    |
| **类型**               | 对所有互操作声明 `external`、`= js("code")` 和 `@JsExport` 统一应用更严格的类型限制。允许精选数量的 [内置 Kotlin 类型和 `JsAny` 子类型](#type-correspondence)。 | 允许在 `external` 声明中使用所有类型。限制[可在 `@JsExport` 中使用的类型](js-to-kotlin-interop.md#kotlin-types-in-javascript)。 |
| **Long**                | 类型对应于 JavaScript `BigInt`。                                                                                                                                                                            | 在 JavaScript 中作为自定义类可见。                                                                                                            |
| **数组**              | 尚未在互操作中直接支持。你可以改用新的 `JsArray` 类型。                                                                                                                                  | 实现为 JavaScript 数组。                                                                                                                   |
| **其他类型**         | 需要 `JsReference<>` 才能将 Kotlin 对象传递给 JavaScript.                                                                                                                                                      | 允许在外部声明中使用非外部 Kotlin 类类型。                                                                         |
| **异常处理**  | 你可以使用 `JsException` 和 `Throwable` 类型捕获任何 JavaScript 异常。                                                                                                                                | 可以使用 `Throwable` 类型捕获 JavaScript `Error`。可以使用 `dynamic` 类型捕获任何 JavaScript 异常。                            |
| **动态类型**       | 不支持 `dynamic` 类型。请改用 `JsAny`（见下方的代码示例）。                                                                                                                                   | 支持 `dynamic` 类型。                                                                                                                     |

> Kotlin/Wasm 不支持用于与无类型或弱类型对象进行互操作的 Kotlin/JS [动态类型 (dynamic type)](dynamic-type.md)。你可以使用 `JsAny` 类型来代替 `dynamic` 类型：
>
> ```kotlin
> // Kotlin/JS
> fun processUser(user: dynamic, age: Int) {
>     // ...
>     user.profile.updateAge(age)
>     // ...
> }
>
> // Kotlin/Wasm
> private fun updateUserAge(user: JsAny, age: Int): Unit =
>     js("{ user.profile.updateAge(age); }")
>
> fun processUser(user: JsAny, age: Int) {
>     // ...
>     updateUserAge(user, age)
>     // ...
> }
> ```
>
{style="note"}

## Web 相关的浏览器 API

[`kotlinx-browser` 库](https://github.com/kotlin/kotlinx-browser) 是一个独立的库，提供了 JavaScript 浏览器 API，包括：
* 软件包 `org.khronos.webgl`：
  * 类型化数组，如 `Int8Array`。
  * WebGL 类型。
* 软件包 `org.w3c.dom.*`：
  * DOM API 类型。
* 软件包 `kotlinx.browser`：
  * DOM API 全局对象，如 `window` 和 `document`。

要使用 `kotlinx-browser` 库中的声明，请在项目的构建配置文件中将其添加为依赖项：

```kotlin
val wasmJsMain by getting {
    dependencies {
        implementation("org.jetbrains.kotlinx:kotlinx-browser:0.3")
    }
}