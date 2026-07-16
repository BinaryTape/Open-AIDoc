[//]: # (title: 在 Spring Boot 專案中處理集合)

<tldr>
    <p>這是 <strong>Spring Boot 與 Kotlin 入門</strong> 教學的一部分。在繼續之前，請確保您已完成前面的步驟：</p><br/>
    <p><a href="jvm-create-project-with-spring-boot.md">使用 Kotlin 建立 Spring Boot 專案</a><br/><a href="jvm-spring-boot-add-data-class.md">將資料類別新增至 Spring Boot 專案</a><br/><strong>為 Spring Boot 專案新增資料庫支援</strong><br/></p>
</tldr>

在此部分，您將學習如何在 Kotlin 中對集合執行各種操作。
雖然在許多情況下 SQL 可以協助執行篩選和排序等資料操作，但在實際應用程式中，我們經常必須處理集合來操作資料。

以下您將發現一些根據我們範例應用程式中既有資料物件處理集合的實用技巧。
在所有範例中，我們假設先透過呼叫 `service.findMessages()` 函式獲取儲存在資料庫中的所有訊息，接著執行各種操作來篩選、排序、分組或轉換訊息清單。

## 檢索元素

Kotlin 集合提供了一組用於從集合中檢索單一元素的函式。可以依據位置或相符條件從集合中檢索單一元素。

例如，使用對應的函式 `first()` 與 `last()` 可以檢索集合的第一個和最後一個元素：

```kotlin
@GetMapping("/firstAndLast")
fun firstAndLast(): `List<Message>` {
    val messages = service.findMessages()
    return listOf(messages.first(), messages.last())
}
```

在上述範例中，檢索集合的第一個和最後一個元素，並建立一個包含兩個元素的新清單，該清單將被序列化為 JSON 文件。

若要檢索特定位置的元素，您可以使用 [`elementAt()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/element-at.html) 函式。

`first()` 與 `last()` 函式也都允許您在集合中搜尋符合指定述句（predicate）的元素。例如，以下是如何在清單中尋找訊息長度超過 10 個字元的第一個 `Message` 執行個體：

```kotlin
@GetMapping("/firstMessageLongerThan10")
fun firstMessageLongerThan10(): Message {
    val messages = service.findMessages()
    return messages.first { it.text.length > 10 }
}
```

當然，也可能發生沒有任何訊息長度超過指定字元限制的情況。在這種情況下，上述程式碼會產生 NoSuchElementException。或者，您可以使用 `firstOrNull()` 函式，在集合中沒有相符元素時傳回 null。接著由開發人員負責檢查結果是否為 null：

```kotlin
@GetMapping("/retrieveFirstMessageLongerThan10")
fun firstMessageOrNull(): Message {
    val messages = service.findMessages()
    return messages.firstOrNull { 
        it.text.length > 10 
    } ?: Message(null, "Default message")
}

```

## 篩選元素

*篩選* 是集合處理中最常見的任務之一。標準程式庫包含一組擴充函式，可讓您在單次呼叫中篩選集合。這些函式不會改變原始集合，而是產生包含篩選後元素的新集合：

```kotlin
@GetMapping("/filterMessagesLongerThan10")
fun filterMessagesLongerThan10(): `List<Message>` {
    val messages = service.findMessages()
    return messages.filter { it.text.length > 10 }
}
```

這段程式碼看起來與使用 `first()` 函式尋找文字長度大於 10 的單一元素的範例非常相似。區別在於 `filter()` 會傳回符合條件的元素清單。

## 排序元素

元素的順序是某些集合類型的重要面向。Kotlin 標準程式庫提供了許多以各種方式進行排序的函式：自然順序、自訂順序、反向順序和隨機順序。

例如，讓我們依據最後一個字母對清單中的訊息進行排序。這可以透過使用 `sortedBy()` 函式來達成，該函式使用選擇器（selector）從集合物件中提取所需的值。接著會根據提取出的值對清單中的元素進行比較：

```kotlin
@GetMapping("/sortByLastLetter")
fun sortByLastLetter(): `List<Message>` {
    val messages = service.findMessages()
    return messages.sortedBy { it.text.last() }
}
```

## 分組元素

分組可能需要實作一些關於元素應如何分組的複雜邏輯。[`groupBy()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/group-by.html) 函式接收一個 Lambda 並傳回一個 `Map`。在此 Map 中，每個鍵（key）是 Lambda 的結果，而對應的值（value）則是傳回該結果的元素 `List`。

讓我們透過比對特定單字（例如 「hello」 和 「bye」）來對訊息進行分組。如果訊息的文字不包含任何提供的單字，則將其新增至名為 「other」 的獨立分組中：

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

## 轉換操作

處理集合的一個常見任務是將集合元素從一種類型轉換為另一種類型。當然，Kotlin 標準程式庫為此類任務提供了許多 [轉換函式](collection-transformations.md)。

例如，讓我們將 `Message` 物件清單轉換為字串物件清單，該字串是由訊息的 `id` 和 `text` 主體串接而成。為此，我們可以使用 `map()` 函式，它將指定的 Lambda 函式套用於每個後續元素，並傳回 Lambda 結果的清單：

```kotlin
@GetMapping("/transformMessagesToListOfStrings")
fun transformMessagesToListOfStrings(): `List<String>` {
    val messages = service.findMessages()
    return messages.map { "${it.id} ${it.text}" }
}
```

## 聚合操作

聚合操作會從一組集合值中運算出單一值。聚合操作的一個範例是計算所有訊息長度的平均值：

```kotlin
@GetMapping("/averageMessageLength")
fun averageMessageLength(): Double {
    val messages = service.findMessages()
    return messages.map { it.text.length }.average()
}
```

首先，使用 `map()` 函式將訊息清單轉換為代表每條訊息長度的值清單。接著您可以使用 average 函式來計算最終結果。

聚合函式的其他範例包括 `min()`、`max()`、`sum()` 和 `count()`。

對於更特定的情況，有 [`reduce()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/reduce.html) 和 [`fold()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/fold.html) 函式，它們會依序將指定的運算套用於集合元素並傳回累加結果。

例如，讓我們找出其中文字最長的訊息：

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

前往 [下一章節](jvm-spring-boot-using-crudrepository.md)。