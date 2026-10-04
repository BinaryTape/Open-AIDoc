[//]: # (title: 类型概述)

在 Kotlin 中，一切皆为对象，这意味着你可以在任何变量上调用成员函数和属性。某些类型（例如数字、字符和布尔值）在运行时具有作为原始值（primitive values）的优化内部表示，但在 Kotlin 代码中，它们的外观和行为与常规类无异。

## 基本类型 {id="basic-types"}

本节介绍了 Kotlin 中使用的基本类型：

| **类别**                                                 | **基本类型**                       | **定义**                       |
|----------------------------------------------------------|------------------------------------|--------------------------------|
| [整数](numbers.md#integer-types)                         | `Byte`、`Short`、`Int`、`Long`     | 整数                           |
| [无符号整数](unsigned-integer-types.md)                  | `UByte`、`UShort`、`UInt`、`ULong` | 非负整数                       |
| [浮点数](numbers.md#floating-point-types)                | `Float`、`Double`                  | 带小数部分的数字               |
| [布尔值](booleans.md)                                    | `Boolean`                          | 逻辑值：`true` 和 `false`      |
| [字符](characters.md)                                    | `Char`                             | 单个字符                       |
| [字符串](strings.md)                                     | `String`                           | 字符序列                       |
| [数组](arrays.md)                                        | `Array<T>`、基本类型数组           | 固定大小的值序列               |

> 默认情况下，所有类型都是不可为 null 的。要允许 `null` 值，请在变量类型后紧跟一个 `?` 符号进行声明。例如 `String?`。详细了解请参阅[空安全](null-safety.md#nullable-types-and-non-nullable-types)。
> 
{style="note"}

要了解其他 Kotlin 类型（例如 `Nothing`、`Any` 和 `Unit`），请浏览 Kotlin API 参考：

* [`Any`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-any/) – Kotlin 类继承层次结构的根。
* [`Nothing`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-nothing.html) – 没有值的类型。
* [`Unit`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-unit/) – 仅有一个值（`Unit`）的类型。对于带有块体且未显式声明返回值类型的函数，编译器会将其推断为返回值类型。参见[返回 Unit 的函数](functions.md#unit-returning-functions)。

## 不可指称类型 {id="non-denotable-types"}

Kotlin 还包含不可指称类型（Non-denotable types）。它们是无法直接在 Kotlin 代码中书写的类型。相反，编译器在内部使用它们，例如用于与其他语言的互操作。Kotlin 创建不可指称类型来表示比 Kotlin 源码语法所允许的更为精确的类型信息。

尽管你无法自行声明不可指称类型，但你可能会在编译器诊断、IDE 工具提示或推断类型显示中遇到它们。详细了解不可指称类型，请参阅：

* [平台类型](java-interop.md#null-safety-and-platform-types)
* [](typecasts.md#intersection-types)
* [](numbers.md#integer-literal-types)
* [](generics.md#captured-types)
* [Kotlin 语言规范：类型系统](https://kotlinlang.org/spec/type-system.html)

> [了解如何在 Kotlin 中执行类型检查与转换](typecasts.md)。
>
{style="tip"}