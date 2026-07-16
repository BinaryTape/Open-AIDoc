[//]: # (title: 在 Spring Boot 项目中处理集合)

<tldr>
    <p>这是 <strong>Kotlin Spring Boot 入门</strong>教程的一部分。在继续之前，请确保你已完成前面的步骤：</p><br/>
    <p><a href="jvm-create-project-with-spring-boot.md">使用 Kotlin 创建 Spring Boot 项目</a><br/><a href="jvm-spring-boot-add-data-class.md">向 Spring Boot 项目添加数据类</a><br/><strong>为 Spring Boot 项目添加数据库支持</strong><br/></p>
</tldr>

在这一部分中，你将学习如何在 Kotlin 中对集合执行各种操作。
虽然在许多情况下，SQL 可以帮助完成过滤和排序等数据操作，但在实际应用中，我们经常需要处理集合来操作数据。

下面你将找到一些基于演示应用程序中已有的数据对象来处理集合的实用方法。
在所有示例中，我们都假设首先通过调用 `service.findMessages()` 函数来检索数据库中存储的所有消息，然后执行各种操作来对消息列表进行过滤、排序、分组或转换。

## 获取元素

Kotlin 集合提供了一组用于从集合中获取单个元素的函数。
可以通过位置或匹配条件从集合中获取单个元素。

例如，通过相应的函数 `first()` 和 `last()` 可以获取集合的第一个和最后一个元素：

```kotlin
@GetMapping("/firstAndLast")
fun firstAndLast(): `List<Message>` {
    val messages = service.findMessages()
    return listOf(messages.first(), messages.last())
}
```

在上面的示例中，获取集合的第一个和最后一个元素，并创建一个包含两个元素的新列表，该列表将被序列化为 JSON 文档。

要获取特定位置的元素，可以使用 [`elementAt()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/element-at.html) 函数。

`first()` 和 `last()` 函数还允许你搜索集合中符合给定断言的元素。
例如，以下是如何在列表中查找第一条消息长度超过 10 个字符的 `Message` 实例：

```kotlin
@GetMapping("/firstMessageLongerThan10")
fun firstMessageLongerThan10(): Message {
    val messages = service.findMessages()
    return messages.first { it.text.length > 10 }
}
```

当然，可能存在没有任何消息超过给定字符限制的情况。
在这种情况下，上面的代码将产生 NoSuchElementException。
或者，你可以使用 `firstOrNull()` 函数，在集合中没有匹配元素时返回 null。
然后，程序员负责检查结果是否为 null：

```kotlin
@GetMapping("/retrieveFirstMessageLongerThan10")
fun firstMessageOrNull(): Message {
    val messages = service.findMessages()
    return messages.firstOrNull { 
        it.text.length > 10 
    } ?: Message(null, "Default message")
}

```

## 过滤元素

*过滤*是集合处理中最常见的任务之一。
标准库包含一组扩展函数，让你可以在单次调用中过滤集合。
这些函数保持原始集合不变，并生成一个包含过滤后元素的新集合：

```kotlin
@GetMapping("/filterMessagesLongerThan10")
fun filterMessagesLongerThan10(): `List<Message>` {
    val messages = service.findMessages()
    return messages.filter { it.text.length > 10 }
}
```

这段代码看起来与你使用 `first()` 函数查找文本长度大于 10 的单个元素的示例非常相似。
区别在于 `filter()` 返回的是匹配条件的元素列表。

## 排序元素

元素的顺序是某些集合类型的一个重要方面。
Kotlin 标准库提供了许多以各种方式进行排序的函数：自然顺序、自定义顺序、逆序和随机顺序。

例如，让我们按最后一个字母对列表中的消息进行排序。
这可以通过使用 `sortedBy()` 函数来实现，该函数使用一个选择器从集合对象中提取所需的值。
然后将根据提取的值对列表中的元素进行比较：

```kotlin
@GetMapping("/sortByLastLetter")
fun sortByLastLetter(): `List<Message>` {
    val messages = service.findMessages()
    return messages.sortedBy { it.text.last() }
}
```

## 分组元素

分组可能需要实现一些相当复杂的逻辑，即元素应该如何分组在一起。
[`groupBy()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/group-by.html) 函数接受一个 lambda表达式并返回一个 `Map`。
在这个 map 中，每个键是 lambda表达式的结果，相应的值是返回此结果的元素 `List`。

让我们通过匹配特定的词（例如 "hello" 和 "bye"）对消息进行分组。
如果消息的文本不包含任何提供的词，则将其添加到名为 "other" 的单独组中：

```kotlin
@GetMapping("/groups")
fun groups(): Map<String, List<Message>> {
    val messages = service.findMessages()
    val groups = listOf("hello", "bye")

    val map = messages.groupBy { message ->
        groups.firstOrNull {
            message.text.contains(it, ignoreCase = true)
        } ?: "other"
    }

    return map
}
```

## 转换操作

集合的一个常见任务是将集合元素从一种类型转换为另一种类型。
当然，Kotlin 标准库为此类任务提供了许多[转换函数](collection-transformations.md)。

例如，让我们将 `Message` 对象列表转换为字符串对象列表，这些字符串对象由消息的 `id` 和 `text` 正文串联而成。
为此，我们可以使用 `map()` 函数，它将给定的 lambda表达式应用于每个后续元素并返回 lambda表达式结果的列表：

```kotlin
@GetMapping("/transformMessagesToListOfStrings")
fun transformMessagesToListOfStrings(): `List<String>` {
    val messages = service.findMessages()
    return messages.map { "${it.id} ${it.text}" }
}
```

## 聚合操作

聚合操作根据一组值计算出单个值。
聚合操作的一个示例是计算所有消息长度的平均值：

```kotlin
@GetMapping("/averageMessageLength")
fun averageMessageLength(): Double {
    val messages = service.findMessages()
    return messages.map { it.text.length }.average()
}
```

首先，使用 `map()` 函数将消息列表转换为代表每条消息长度的数值列表。
然后你可以使用 average 函数计算最终结果。

聚合函数的其他示例包括 `min()`、`max()`、`sum()` 和 `count()`。

对于更特殊的情况，还有 [`reduce()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/reduce.html) 和 [`fold()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/fold.html) 函数，它们按顺序将提供的操作应用于集合元素并返回累积结果。

例如，让我们找到其中文本最长的消息：

```kotlin
@GetMapping("findTheLongestMessage")
fun reduce(): Message {
    val messages = service.findMessages()
    return messages.reduce { first, second ->
        if (first.text.length > second.text.length) first else second
    }
}
```

## 下一步

转到[下一部分](jvm-spring-boot-using-crudrepository.md)。