[//]: # (title: Spring Bootプロジェクトでコレクションを操作する)

<tldr>
    <p>これは「<strong>Spring BootとKotlinを始める</strong>」チュートリアルの一部です。次に進む前に、以前の手順を完了していることを確認してください。</p><br/>
    <p><a href="jvm-create-project-with-spring-boot.md">KotlinでSpring Bootプロジェクトを作成する</a><br/><a href="jvm-spring-boot-add-data-class.md">Spring Bootプロジェクトにデータクラスを追加する</a><br/><strong>Spring Bootプロジェクトにデータベースサポートを追加する</strong><br/></p>
</tldr>

このパートでは、Kotlinでコレクションに対してさまざまな操作を実行する方法を学びます。
多くの場合、SQLはフィルタリングやソートなどのデータ操作に役立ちますが、実際のアプリケーションでは、データを操作するためにコレクションを扱うことがよくあります。

以下に、デモアプリケーションに既に存在するデータオブジェクトに基づいた、コレクション操作のための便利なレシピをいくつか紹介します。
すべての例において、`service.findMessages()` 関数を呼び出してデータベースに保存されているすべてのメッセージを取得し、その後、メッセージのリストに対してフィルタリング、ソート、グループ化、変換などのさまざまな操作を実行することを想定しています。

## 要素の取得

Kotlinのコレクションは、コレクションから単一の要素を取得するための一連の関数を提供しています。
位置、または一致する条件によって、コレクションから単一の要素を取得することが可能です。

例えば、コレクションの最初と最後の要素を取得するには、対応する関数 `first()` と `last()` を使用します。

```kotlin
@GetMapping("/firstAndLast")
fun firstAndLast(): `List<Message>` {
    val messages = service.findMessages()
    return listOf(messages.first(), messages.last())
}
```

上記の例では、コレクションの最初と最後の要素を取得し、JSONドキュメントにシリアライズされる2つの要素を持つ新しいリストを作成します。

特定の位置にある要素を取得するには、[`elementAt()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/element-at.html) 関数を使用できます。

`first()` と `last()` 関数の両方で、指定された述語（predicate）に一致する要素をコレクションから検索することもできます。
例えば、メッセージの長さが10文字を超える、リスト内の最初の `Message` インスタンスを見つける方法は次のとおりです。

```kotlin
@GetMapping("/firstMessageLongerThan10")
fun firstMessageLongerThan10(): Message {
    val messages = service.findMessages()
    return messages.first { it.text.length > 10 }
}
```

もちろん、指定された文字数制限を超えるメッセージが存在しない場合もあります。
その場合、上記のコードは `NoSuchElementException` を生成します。
代わりに、`firstOrNull()` 関数を使用すると、コレクション内に一致する要素がない場合に null を返すことができます。
その後、結果が null かどうかを確認するのはプログラマーの責任となります。

```kotlin
@GetMapping("/retrieveFirstMessageLongerThan10")
fun firstMessageOrNull(): Message {
    val messages = service.findMessages()
    return messages.firstOrNull { 
        it.text.length > 10 
    } ?: Message(null, "Default message")
}

```

## 要素のフィルタリング

「フィルタリング」は、コレクション処理において最も一般的なタスクの1つです。
標準ライブラリには、1回の呼び出しでコレクションをフィルタリングできる拡張関数のグループが含まれています。
これらの関数は元のコレクションを変更せず、フィルタリングされた要素を含む新しいコレクションを生成します。

```kotlin
@GetMapping("/filterMessagesLongerThan10")
fun filterMessagesLongerThan10(): `List<Message>` {
    val messages = service.findMessages()
    return messages.filter { it.text.length > 10 }
}
```

このコードは、テキストの長さが10を超える単一の要素を見つけるために `first()` 関数を使用した例と非常によく似ています。
違いは、`filter()` が条件に一致する要素のリストを返す点です。

## 要素のソート

要素の順序は、特定のコレクション型において重要な側面です。
Kotlinの標準ライブラリは、自然順、カスタム順、逆順、ランダム順など、さまざまな方法でソートするための多数の関数を提供しています。

例えば、リスト内のメッセージを最後の文字でソートしてみましょう。
これは、セレクターを使用してコレクションオブジェクトから必要な値を抽出する `sortedBy()` 関数を使用することで可能です。
リスト内の要素の比較は、抽出された値に基づいて行われます。

```kotlin
@GetMapping("/sortByLastLetter")
fun sortByLastLetter(): `List<Message>` {
    val messages = service.findMessages()
    return messages.sortedBy { it.text.last() }
}
```

## 要素のグループ化

グループ化には、要素をどのようにグループ化すべきかについて、非常に複雑なロジックの実装が必要になる場合があります。
[`groupBy()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/group-by.html) 関数はラムダを受け取り、 `Map` を返します。
このマップでは、各キーはラムダの結果であり、対応する値はその結果が返された要素の `List` です。

メッセージを「hello」や「bye」などの特定の単語に一致させることでグループ化してみましょう。
メッセージのテキストに指定された単語が含まれていない場合は、「other」という別のグループに追加します。

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

## 変換操作

コレクションにおける一般的なタスクは、コレクションの要素をある型から別の型に変換することです。
もちろん、Kotlin標準ライブラリにはそのようなタスクのための多数の[変換関数](collection-transformations.md)が用意されています。

例えば、`Message` オブジェクトのリストを、メッセージの `id` と `text` 本体を連結して構成される String オブジェクトのリストに変換してみましょう。
そのために、指定されたラムダ関数を後続の各要素に適用し、ラムダの結果のリストを返す `map()` 関数を使用できます。

```kotlin
@GetMapping("/transformMessagesToListOfStrings")
fun transformMessagesToListOfStrings(): `List<String>` {
    val messages = service.findMessages()
    return messages.map { "${it.id} ${it.text}" }
}
```

## 集計操作

集計操作は、値のコレクションから単一の値を計算します。
集計操作の例としては、すべてのメッセージの長さの平均を計算することが挙げられます。

```kotlin
@GetMapping("/averageMessageLength")
fun averageMessageLength(): Double {
    val messages = service.findMessages()
    return messages.map { it.text.length }.average()
}
```

まず、`map()` 関数を使用して、メッセージのリストを各メッセージの長さを表す値のリストに変換します。
その後、`average()` 関数を使用して最終結果を算出できます。

その他の集計関数の例としては、`mix()`、`max()`、`sum()`、`count()` があります。

より特定のケースのために、コレクションの要素に指定された操作を順番に適用し、累積された結果を返す [`reduce()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/reduce.html) 関数と [`fold()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/fold.html) 関数があります。

例えば、その中で最も長いテキストを持つメッセージを見つけてみましょう。

```kotlin
@GetMapping("findTheLongestMessage")
fun reduce(): Message {
    val messages = service.findMessages()
    return messages.reduce { first, second ->
        if (first.text.length > second.text.length) first else second
    }
}
```

## 次のステップ

[次のセクション](jvm-spring-boot-using-crudrepository.md)に進んでください。