[//]: # (title: パッケージとインポート)

Kotlinプロジェクトでは、コードはパッケージとインポートを使用して整理されます。

* **パッケージ**は、1つ以上のKotlinファイルのコンテナです。ファイルは `package` ヘッダーを使用してパッケージにリンクされます。
* **インポート**は、他のパッケージのエンティティを現在のファイルで利用可能にするためのディレクティブです。

## パッケージヘッダー

ソースファイルはパッケージヘッダーから始まる場合があります。

```kotlin
package org.example

fun printMessage() { /*...*/ }
class Message(val text: String) { /*...*/ }
```

クラスや関数といったソースファイルのすべての内容は、このパッケージに含まれます。
それらの完全修飾名（fully qualified name）は、パッケージ名とエンティティ名を組み合わせたものになります。
この例では：

* `printMessage()` の完全修飾名は `org.example.printMessage` です。
* `Message` の完全修飾名は `org.example.Message` です。

ファイルにパッケージヘッダーがない場合、その内容はルートパッケージ（root package）に属します。

## インポート

別のパッケージにあるファイルのエンティティを使用するには、`import` ディレクティブを使用します。
デフォルトのインポートに加えて、各ファイルには独自のインポートを宣言できます。

### 単一のエンティティをインポートする

特定のエンティティをインポートすると、修飾なしでそれを使用できるようになります：

```kotlin
// Message に修飾なしでアクセスできるようになります
import org.example.Message 

fun main() {
    val message = Message("Hello")
    println(message.text)
}
```

### スコープ内の内容をインポートする

アスタリスク `*` で終わるスターインポート（star import）は、対応するスコープ内のすべての名前付きエンティティをインポートします：

```kotlin
// org.example 内のすべてのものにアクセスできるようになります
import org.example.* 

fun main() {
    printMessage()
    val message = Message("Hi")
}
```

スターインポートと明示的なインポートの両方で同じエンティティをインポートした場合、オーバーロード解決（overload resolution）の際には明示的なインポートが優先されます。

### エイリアスを使用して名前の衝突を解決する

インポートした2つのエンティティが同じ名前の場合、`as` キーワードを使用して、そのうちの1つをローカルでリネームできます：

```kotlin
// Message は org.example.Message を指す
import org.example.Message

// TestMessage は org.test.Message を指す
import org.test.Message as TestMessage

fun main() {
    val a = Message("from example")
    val b = TestMessage("from test")
}
```

### インポートできるもの

`import` キーワードはクラスだけに限定されません。パッケージ、クラス、オブジェクト、またはenumのいずれに属しているかにかかわらず、以下のエンティティをインポートできます：

* パッケージ内に直接宣言されたトップレベルの関数とプロパティ：
    ```kotlin
    import org.example.printMessage // トップレベル関数
    import org.example.VERSION      // トップレベルプロパティ
    ```
* [オブジェクト宣言](object-declarations.md#object-declarations-overview)の関数とプロパティ：
    ```kotlin
    import org.example.Config.DEFAULT_TIMEOUT // オブジェクトのプロパティ
    import org.example.Config.loadSettings    // オブジェクトの関数
    ```
* 包摂するクラス名を介して参照される[コンパニオンオブジェクト](object-declarations.md#companion-objects)のメンバー：
    ```kotlin
    import org.example.MyClass.create // MyClass.Companion.create を指す
    ```
* [enum 定数](enum-classes.md)：
    ```kotlin
    import org.example.Color.RED
    import org.example.Color.GREEN
    ```
* ネストしたクラス：
    ```kotlin
    import org.example.Outer.Nested
    ```

## デフォルトのインポート

デフォルトで、多数のパッケージがすべての Kotlin ファイルにインポートされます。

* [kotlin.*](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/index.html)
* [kotlin.annotation.*](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.annotation/index.html)
* [kotlin.collections.*](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/index.html)
* [kotlin.comparisons.*](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.comparisons/index.html)
* [kotlin.io.*](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.io/index.html)
* [kotlin.ranges.*](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.ranges/index.html)
* [kotlin.sequences.*](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.sequences/index.html)
* [kotlin.text.*](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/index.html)
* [kotlin.math.*](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.math/index.html)

ターゲットプラットフォームに応じて、追加のパッケージがインポートされます。

* JVM:
  * [java.lang.*](https://docs.oracle.com/javase/8/docs/api/java/lang/package-summary.html)
  * [kotlin.jvm.*](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.jvm/index.html)

* JS:
  * [kotlin.js.*](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.js/index.html)

## 可視性とインポート

エンティティをインポートできるかどうかは、その[可視性修飾子](visibility-modifiers.md)に依存します：

* `public` エンティティはどこでもインポートできます。
* `internal` エンティティは、同じモジュール内でのみインポートできます。
* `protected` エンティティはインポートできません。
* トップレベルの `private` エンティティは、それが宣言されているファイル内でのみアクセス可能です。
* その他の `private` エンティティはインポートできません。