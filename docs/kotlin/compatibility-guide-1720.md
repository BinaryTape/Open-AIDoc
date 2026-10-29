[//]: # (title: Kotlin 1.7.20 兼容性指南)

_[保持语言现代性](kotlin-evolution-principles.md)_ 和 _[舒适更新](kotlin-evolution-principles.md)_ 是 Kotlin 语言设计的核心原则。前者指出应当移除阻碍语言演进的构造，后者则指出这种移除应当事先进行良好的沟通，以使代码迁移尽可能顺畅。

通常不兼容的变化仅发生在功能版本中，但这次我们必须在增量版本中引入两个此类变化，以限制由 Kotlin 1.7 中的变化引起的问题扩散。

本文档对这些变化进行了总结，为从 Kotlin 1.7.0 和 1.7.10 迁移到 Kotlin 1.7.20 提供参考。

## 基本术语 {id="basic-terms"}

在本文档中，我们引入了几种兼容性：

- _源码_：源码不兼容的变化会导致以前可以正常编译（没有错误或警告）的代码不再能够编译
- _二进制_：如果两个二进制构件在交换后不会导致加载或链接错误，则称它们是二进制兼容的
- _行为_：如果同一个程序在应用更改前后表现出不同的行为，则称该更改为行为不兼容

请记住，这些定义仅针对纯 Kotlin。从其他语言的角度（例如 Java）来看 Kotlin 代码的兼容性不在本文档的讨论范围内。

## 语言 {id="language"}

### 回退修复正确约束处理的尝试

> **问题**：[KT-53813](https://youtrack.jetbrains.com/issue/KT-53813)
>
> **组件**：核心语言
>
> **不兼容更改类型**：源码
>
> **简要总结**：回退在实现 [KT-52668](https://youtrack.jetbrains.com/issue/KT-52668) 中描述的更改后，为修复 Kotlin 1.7.0 中出现的类型推断约束处理问题所做的尝试。该尝试曾在 1.7.10 中进行，但反过来又引入了新问题。
>
> **弃用周期**：
>
> - 1.7.20：回退到 1.7.0 的行为

### 禁止某些构建器推断情况，以避免与多个 lambda表达式和解析产生冲突 {id="forbid-some-builder-inference-cases-to-avoid-problematic-interaction-with-multiple-lambdas-and-resolution"}

> **问题**：[KT-53797](https://youtrack.jetbrains.com/issue/KT-53797)
>
> **组件**：核心语言
>
> **不兼容更改类型**：源码
>
> **简要总结**：Kotlin 1.7 引入了一项名为不受限的构建器推断的功能，这样即使是传递给未加 `@BuilderInference` 注解的形参的 lambda表达式 也可以从构建器推断中受益。然而，如果在一次函数调用中出现多个此类 lambda表达式，可能会导致一些问题。
> 
> 在 Kotlin 1.7.20 中，如果超过一个 lambda表达式 对应的形参未加 `@BuilderInference` 注解，且需要使用构建器推断来完成该 lambda表达式 中的类型推断，则将报告错误。
>
> **弃用周期**：
>
> - 1.7.20：对此类 lambda表达式 报告错误，  
> 可以使用 `-XXLanguage:+NoBuilderInferenceWithoutAnnotationRestriction` 临时恢复到 1.7.20 之前的行为