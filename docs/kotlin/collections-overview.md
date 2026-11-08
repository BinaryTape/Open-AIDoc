[//]: # (title: 集合概述)

Kotlin 标准库提供了一套全面的工具来处理集合。集合是一组与你要解决的问题相关且通常一起处理的项。集合通常包含相同类型或其子类型的元素。集合中的对象称为 _元素_ 或 _项_。

集合 API 是泛型的，因此你可以对内置类型和用户定义类型使用相同的函数和接口。`kotlin.collections` 包包含集合接口和相关函数。

Kotlin 提供了三种主要的集合类型：

* [_List_](collection-types.md#list) 是一个有序集合。它支持按索引访问，并且可以包含重复元素。例如，你可以使用 List 来存储电话号码的各个数字。
* [_Set_](collection-types.md#set) 是唯一元素的集合。它不保证迭代顺序，但特定实现可以保留插入顺序或对元素进行排序。例如，你可以使用 Set 来存储彩票上的号码。
* [_Map_](collection-types.md#map)（或 _字典_）是一组键值对。每个键都是唯一的，并映射到一个值。例如，你可以使用 Map 将员工 ID 与其职位相关联。

Kotlin 还提供了 [`ArrayDeque`](collection-types.md#arraydeque)。它是一个双端队列，你可以将其用作队列或栈。

> 数组不是一种集合类型。请在[何时使用数组](arrays.md#when-to-use-arrays)中了解如何在数组与集合之间进行选择。
>
{style="note"}

要了解 `List`、`Set` 和 `Map`，请阅读对应章节或观看 Kotlin 技术布道师 Sebastian Aigner 的视频：

<video src="https://www.youtube.com/v/F8jj7e-_jFA" title="Kotlin Collections Overview"/>

## 只读集合与可变集合 {id="read-only-and-mutable-collections"}

每种主要集合类型都有一个只读接口（如 `List`）和一个对应的可变接口（如 `MutableList`）。只读接口提供用于访问元素的操作，而可变接口则添加了用于添加、移除和更新元素的操作。

当调用方不需要修改集合时，优先使用只读接口。这能让你的意图在 API 中更加明确，并防止通过该接口发生意外修改。相比之下，不可变集合在创建后不允许更改其元素。如需不可变且持久化的实现，请使用 [`kotlinx-collections-immutable`](https://kotlinlang.org/api/kotlinx.collections.immutable/) 库。

这些接口构成了如下层次结构：

![Collection interfaces hierarchy](collections-diagram.png){width="500"}

[`Collection<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-collection/index.html) 是 `List` 和 `Set` 的公共超接口。它提供了检查集合大小等操作。`Collection` 继承自 `Iterable<T>` 接口，后者支持对元素进行迭代。`Map` 没有继承 `Collection`。

你可以将 `Collection` 用作适用于不同集合类型的函数的形参。对于特定类型的操作，请使用继承自 `Collection` 的接口，例如 [`List`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/index.html) 或 [`Set`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-set/index.html)。