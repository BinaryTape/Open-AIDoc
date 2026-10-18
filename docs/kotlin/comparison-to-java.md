[//]: # (title: 与 Java 的比较)

## Kotlin 解决的一些 Java 问题 {id="some-java-issues-addressed-in-kotlin"}

Kotlin 修复了 Java 所面临的一系列问题：

* Null 引用[由类型系统控制](null-safety.md)。
* [无原始类型 (raw types)](java-interop.md#java-generics-in-kotlin)
* Kotlin 中的数组是[不可变的 (invariant)](arrays.md)
* Kotlin 拥有完善的[函数类型](lambdas.md#function-types)，而非 Java 的 SAM 转换
* 无通配符的[使用处型变 (Use-site variance)](generics.md#use-site-variance-type-projections)
* Kotlin 没有受检[异常](exceptions.md)
* [区分只读集合与可变集合的独立接口](collections-overview.md)
* Kotlin 为 `Enum.values()` 提供了[兼具高性能与易用性的替代方案](enum-classes.md#find-enum-constants)

## Java 拥有而 Kotlin 没有的特性 {id="what-java-has-that-kotlin-does-not"}

* [受检异常](exceptions.md)
* 不是类的[基本类型 (Primitive types)](types-overview.md)。字节码会在可能的情况下使用基本类型，但它们在语言层面无法显式直接使用。
* [static 成员](classes.md)被[伴生对象](object-declarations.md#companion-objects)、[顶层函数](functions.md)、[扩展函数](extensions.md#extension-functions)或 [@JvmStatic](java-to-kotlin-interop.md#static-methods) 取代。
* [通配符类型 (Wildcard-types)](generics.md)被[声明处型变 (declaration-site variance)](generics.md#declaration-site-variance)和[类型投影](generics.md#type-projections)取代。
* [三元运算符 `a ? b : c`](control-flow.md#if-expression) 被 [if 表达式](control-flow.md#if-expression)取代。
* [Records](https://openjdk.org/jeps/395)
* package-private（包级私有）[可见性修饰符](visibility-modifiers.md)

> Kotlin 没有模式匹配，但 [Kotlin 中的智能转换](typecasts.md#smart-casts)提供了类似于 [Java 中的模式匹配](https://openjdk.org/projects/amber/design-notes/patterns/pattern-matching-for-java) 的功能。
>
> 欲了解详情，请观看 [JetBrains 官方 Kotlin 频道上的视频](https://www.youtube.com/watch?v=yJDoa42X-wQ)。
>
{style="note"}

## Kotlin 拥有而 Java 没有的特性 {id="what-kotlin-has-that-java-does-not"}

* [Lambda 表达式](lambdas.md) + [内联函数](inline-functions.md) = 高性能的自定义控制结构
* [扩展函数](extensions.md)
* [空安全 (Null-safety)](null-safety.md)
* [字符串模板](strings.md)
* [属性](properties.md)
* [主构造函数](classes.md)
* [头等公民委托支持 (First-class delegation)](delegation.md)
* [变量和属性类型的类型推断](types-overview.md)（**Java 10**：[局部变量类型推断](https://openjdk.org/jeps/286)）
* [单例](object-declarations.md)
* [声明处型变与类型投影](generics.md)
* [区间表达式](ranges.md)
* [运算符重载](operator-overloading.md)
* [伴生对象](classes.md#companion-objects)
* [数据类](data-classes.md)
* [协程](coroutines-overview.md)
* [顶层函数](functions.md)
* [带默认值的形参](functions.md#parameters-with-default-values)
* [具名参数](functions.md#named-arguments)
* [中缀函数](functions.md#infix-notation)
* [Expect 与 actual 声明](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html)
* [显式 API 模式](whatsnew14.md#explicit-api-mode-for-library-authors)以及[对 API 暴露面的更佳控制](opt-in-requirements.md)

> Java 没有智能转换，但[模式匹配](https://openjdk.org/projects/amber/design-notes/patterns/pattern-matching-for-java)提供了类似于 [Kotlin 中的智能转换](typecasts.md#smart-casts) 的功能。
>
> 欲了解详情，请观看 [JetBrains 官方 Kotlin 频道上的视频](https://www.youtube.com/watch?v=yJDoa42X-wQ)。
>
{style="note"}

## 后续步骤 {id="what-s-next"}

了解如何：
* 在 Java 和 Kotlin 中执行[字符串的常见任务](java-to-kotlin-idioms-strings.md)。
* 在 Java 和 Kotlin 中执行[集合的常见任务](java-to-kotlin-collections-guide.md)。
* 在 Java 和 Kotlin 中[处理为 null 性](java-to-kotlin-nullability-guide.md)。