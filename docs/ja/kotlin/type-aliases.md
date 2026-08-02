[//]: # (title: 型エイリアス)

型エイリアス（Type aliases）は、既存の型に対して別名を提供します。型名が長すぎる場合や頻繁に使用される場合、型式をより短く、理解しやすいものにすることができます。

例えば、ジェネリック型、関数型、ネストしたクラスや内部クラスに対してエイリアスを作成できます：

```kotlin
// ジェネリック型
typealias UserIndex = Map<Long, User>
typealias FileTable<K> = MutableMap<K, MutableList<File>>

// 関数型
typealias RequestHandler = (Request) -> Response
typealias Predicate<T> = (T) -> Boolean

// 内部クラスとネストしたクラス
class Database {
    inner class Transaction
}
typealias DatabaseTransaction = Database.Transaction
```

型エイリアスは新しい型を導入するものではありません。既存の型に対して代替名を導入するものです。エイリアスとその基底型（underlying type）は相互に置き換え可能です。例えば、`typealias Predicate<T>` を追加して `Predicate<Int>` を使用すると、コンパイラはそれを `(Int) -> Boolean` に展開します。そのため、基底型が期待される場所であればどこでもエイリアスで宣言された値を使用でき、その逆も可能です：

```kotlin
typealias Predicate<T> = (T) -> Boolean

fun evaluate(predicate: Predicate<Int>) = predicate(42)

fun main() {
    val isPositive: (Int) -> Boolean = { it > 0 }
    println(evaluate(isPositive))
    // true

    val isValid: Predicate<Int> = { it > 0 }
    println(listOf(1, -2).filter(isValid))
    // [1]
}
```
{kotlin-runnable="true"}

## 型エイリアスの宣言

型エイリアスは以下の場所で宣言できます：

* Kotlinファイルの最上位（トップレベル）。[トップレベルの型エイリアス](#top-level-type-aliases)となります。
* クラス、インターフェース、またはオブジェクトの内部。[ネストした型エイリアス](#nested-type-aliases)となります。

関数内や[ラムダ式](lambdas.md#lambda-expressions-and-anonymous-functions)の中などのローカルスコープで型エイリアスを宣言することはできません。

宣言場所によって型エイリアスのスコープが決まり、可視性（visibility）によってどのコードがそれにアクセスできるかが決まります。デフォルトでは、型エイリアスは `public` です。[ネストした型エイリアス](#nested-type-aliases)は、それを含んでいるクラス、インターフェース、またはオブジェクトにアクセスできる場所でのみアクセス可能です。例えば、`internal` クラス内の `public` エイリアスは、モジュール外からはアクセスできません。

型エイリアスは、自身の[可視性](visibility-modifiers.md)よりも制限の強い基底型を公開することはできません。例えば、`public` な型エイリアスが `private` なクラスを参照することはできません。

### トップレベルの型エイリアス

トップレベルの型エイリアスはパッケージレベルの宣言です。同じパッケージ内であれば、修飾なしの名前でエイリアスを参照できます。別のパッケージからエイリアスを使用するには、エイリアスをインポートするか、完全修飾名で参照します：

```kotlin
// UserId.kt
package org.example.users

typealias UserId = Long

// 同じパッケージ内のエイリアスを修飾名なしで参照
fun createUser(id: UserId) {
    // ...
}

// UserService.kt
package org.example.services

import org.example.users.UserId

// インポートされたエイリアスを修飾名なしで使用
fun findUser(id: UserId) {
    // ...
}

// 完全修飾名を使用
fun deleteUser(id: org.example.users.UserId) {
    // ...
}
```

### ネストした型エイリアス

ネストした型エイリアスを使用すると、カプセル化が向上し、パッケージレベルの煩雑さが軽減され、内部実装が簡素化されるため、よりクリーンで保守性の高いコードが可能になります。ネストした型エイリアスは、[ネストしたクラス](nested-classes.md)と同じスコープおよび名前解決のルールに従います。

代替名がその宣言のコンテキスト内でのみ関連する場合は、クラス、インターフェース、またはオブジェクトの内部で型エイリアスを宣言します。これにより、エイリアスを使用するコードの近くにエイリアスを配置でき、パッケージスコープに余計な名前が追加されるのを防ぐことができます。

包含する宣言内では、修飾なしの名前でエイリアスを参照できます。宣言の外では、包含する宣言の名前でエイリアスを修飾します：

```kotlin
class UserRepository {
    typealias UserIndex = Map<UserId, User>

    // UserRepository内では修飾名なしでエイリアスを参照
    fun saveAll(users: UserIndex) {
        // ...
    }
}

// UserRepository外では修飾名でエイリアスを参照
fun synchronizeUsers(users: UserRepository.UserIndex) {
    // ...
}
```

> ネストした型エイリアスは、Kotlinマルチプラットフォームの [`expect/actual` 宣言](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html)ではサポートされていません。
>
{style="note"}

#### 型パラメータ

ネストした型エイリアスで型パラメータを使用するには、エイリアスの宣言にそれらを追加します：

```kotlin
class Graph<Node> {
    typealias Path<T> = List<T>
}

val cityPath: Graph.Path<String> = listOf("London", "Berlin")
```

この例では、`Path` は独自の型パラメータ `T` を宣言しています。`Graph.Path<String>` において、`String` は `T` に対する型引数であり、`Graph` によって宣言された `Node` 型パラメータとは独立しています。

包含するクラスやインターフェースによって宣言された型パラメータを参照すると、コンパイラはエラーを報告します：

```kotlin
class Graph<Node> {
    typealias Path = List<Node>
    // Unresolved reference 'Node'.（解決できない参照 'Node'）
}
```

ここで、`Path` は独自の型パラメータを宣言する代わりに、`Graph` の `Node` を参照しています。