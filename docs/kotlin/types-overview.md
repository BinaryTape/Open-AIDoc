[//]: # (title: 类型概览)

在 Kotlin 中，一切皆为对象，这意味着你可以在任何变量上调用成员函数和属性。
虽然某些类型在运行时具有作为原生值（例如数字、字符和布尔）的优化内部表示，但对于你而言，它们的表现和行为就像普通的类一样。

本节介绍了 Kotlin 中使用的基本类型：

* [数字](numbers.md)及其[无符号对应类型](unsigned-integer-types.md)
* [布尔](booleans.md)
* [字符](characters.md)
* [字符串](strings.md)
* [数组](arrays.md)

要了解其他 Kotlin 类型（例如 `Nothing`、`Any` 和 `Unit`），请查阅 Kotlin API 参考：

* [`Any`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-any/)
* [`Nothing`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-nothing.html)
* [`Unit`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-unit/)

Kotlin 还有不可表示类型（non-denotable types）。它们是无法直接在 Kotlin 代码中编写的类型。相反，编译器会在内部使用它们，例如为了与其他语言进行互操作。Kotlin 创建不可表示类型是为了表示比 Kotlin 源码语法所允许的更精确的类型信息。

即使你无法自行声明不可表示类型，也可能会在编译器诊断、IDE 工具提示或推断类型显示中遇到它们。详细了解不可表示类型：

* [平台类型](java-interop.md#null-safety-and-platform-types)
* [](typecasts.md#intersection-types)
* [](numbers.md#integer-literal-types)
* [](generics.md#captured-types)
* [Kotlin 语言规范：类型系统](https://kotlinlang.org/spec/type-system.html)

> [了解如何在 Kotlin 中进行类型检查和转换](typecasts.md)。
>
{style="tip"}