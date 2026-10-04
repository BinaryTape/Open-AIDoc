[//]: # (title: テストページ)

<web-summary>このページはテスト目的専用です。</web-summary>

<no-index/>

<tldr>
   <p>これは画像付きのブロックです（<strong>Compose Multiplatform の入門</strong>チュートリアルから引用）。</p>
   <p><img src="icon-1-done.svg" width="20" alt="第1ステップ"/> <a href="jvm-create-project-with-spring-boot.md">Kotlin を使用して Spring Boot プロジェクトを作成する</a><br/>
      <img src="icon-2-done.svg" width="20" alt="第2ステップ"/> <a href="jvm-spring-boot-add-data-class.md">Spring Boot プロジェクトにデータクラスを追加する</a><br/>
      <img src="icon-3.svg" width="20" alt="第3ステップ"/> <strong>Spring Boot プロジェクトにデータベースサポートを追加する</strong><br/>
      <img src="icon-4-todo.svg" width="20" alt="第4ステップ"/> データベースアクセスに Spring Data CrudRepository を使用する><br/>
    </p>
</tldr>

## 同期タブ {id="synchronized-tabs"}

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("kapt") version "1.9.23"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id "org.jetbrains.kotlin.kapt" version "1.9.23"
}
```

</tab>
</tabs>

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("plugin.noarg") version "1.9.23"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id "org.jetbrains.kotlin.plugin.noarg" version "1.9.23"
}
```

</tab>
</tabs>

## セクション {id="sections"}

### 折りたたまれたセクション {initial-collapse-state="collapsed" collapsible="true" id="collapsed-section"}

ここにテキストとコードブロックがあります:

```kotlin
plugins {
    kotlin("plugin.noarg") version "1.9.23"
}
```

## コードブロック {id="codeblocks"}

単なるコードブロック:

```kotlin
    import java.util.*

@Service
class MessageService(val db: MessageRepository) {
    fun findMessages(): List<Message> = db.findAll().toList()

    fun findMessageById(id: String): List<Message> = db.findById(id).toList()

    fun save(message: Message) {
        db.save(message)
    }

    fun <T : Any> Optional<out T>.toList(): List<T> =
        if (isPresent) listOf(get()) else emptyList()
}
```

### 展開可能なコードブロック {id="expandable-codeblock"}

```kotlin
package com.example.demo

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@SpringBootApplication
class DemoApplication

fun main(args: Array<String>) {
    runApplication<DemoApplication>(*args)
}

@RestController
class MessageController {
    @GetMapping("/")
    fun index(@RequestParam("name") name: String) = "Hello, $name!"
}
```
{initial-collapse-state="collapsed" collapsible="true"}

### 実行可能なコードブロック {id="runnable-codeblock"}

```kotlin
data class User(val name: String, val id: Int)

fun main() {
    val user = User("Alex", 1)
    
    //sampleStart
    // 出力が読みやすくなるよう自動的に toString() 関数を使用します
    println(user)            
    // User(name=Alex, id=1)
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

## テーブル {id="tables"}

### Markdown テーブル {id="markdown-table"}

| プリミティブ型配列                                                                     | Java での同等物        |
|---------------------------------------------------------------------------------------|--------------------|
| [`BooleanArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-boolean-array/) | `boolean[]`        |
| [`ByteArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-byte-array/)       | `byte[]`           |
| [`CharArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-char-array/)       | `char[]`           |
| [`DoubleArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-double-array/)   | `double[]`         |
| [`FloatArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-float-array/)     | `float[]`          |
| [`IntArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-int-array/)         | `int[]`            |
| [`LongArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-long-array/)       | `long[]`           |
| [`ShortArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-short-array/)     | `short[]`          |

### XML テーブル {id="xml-table"}

<table>
    <tr>
        <td><strong>最終更新日</strong></td>
        <td><strong>2023年12月</strong></td>
    </tr>
    <tr>
        <td><strong>次回アップデート</strong></td>
        <td><strong>2024年6月</strong></td>
    </tr>
</table>

### コードブロックを含む XML テーブル {id="xml-table-with-codeblocks-inside"}

シンプルなテーブル:

<table>
    <tr>
        <td>変更前</td>
        <td>現在</td>
    </tr>
    <tr>
<td>

```kotlin
kotlin {
    targets {
        configure(['windows',
            'linux']) {
        }
    }
}
```

</td>
<td>

```kotlin
kotlin {
    targets {
        configure([findByName('windows'),
            findByName('linux')]) {
        }
    }
}
```

</td>
    </tr>
</table>

より複雑なテーブル:

<table>
    <tr>
        <td></td>
        <td>変更前</td>
        <td>現在</td>
    </tr>
    <tr>
        <td rowspan="2"><code>jvmMain</code> コンパイルの依存関係</td>
<td>

```kotlin
jvm<Scope>
```

</td>
<td>

```kotlin
jvmCompilation<Scope>
```

</td>
    </tr>
    <tr>
<td>

```kotlin
dependencies {
    add("jvmImplementation",
        "foo.bar.baz:1.2.3")
}
```

</td>
<td>

```kotlin
dependencies {
    add("jvmCompilationImplementation",
        "foo.bar.baz:1.2.3")
}
```

</td>
    </tr>
    <tr>
        <td><code>jvmMain</code> ソースセットの依存関係</td>
<td colspan="2">

```kotlin
jvmMain<Scope>
```

</td>
    </tr>
    <tr>
        <td><code>jvmTest</code> コンパイルの依存関係</td>
<td>

```kotlin
jvmTest<Scope>
```

</td>
<td>

```kotlin
jvmTestCompilation<Scope>
```

</td>
    </tr>
    <tr>
        <td><code>jvmTest</code> ソースセットの依存関係</td>
<td colspan="2">

```kotlin
jvmTest<Scope>
```

</td>
    </tr>
</table>

## リスト {id="lists"}

### 番号付きリスト {id="ordered-list"}

1. 1
2. 2
3. 3
    1. 3.1
    2. 3.2
    3. 3.3
        1. 3.1.1
4. コードブロックを含む項目:

   ```kotlin
   jvmTest<Scope>
   ```

### 順不同リスト {id="non-ordered-list"}

* 1つ目の箇条書き
* 2つ目の箇条書き
* 3つ目の箇条書き
    * もう1つ
    * さらに1つ
        * おっと、もう1つ
* コードブロックを含む項目:

   ```kotlin
   jvmTest<Scope>
   ```

### 定義リスト {id="definition-list"}

<deflist collapsible="true">
   <def title="折りたたみ可能な項目 #1">
      <p><code>CrudRepository</code> インターフェースの <code>findById()</code> 関数の戻り値の型は、<code>Optional</code> クラスのインスタンスです。しかし、一貫性を保つために単一のメッセージを含む <code>List</code> を返す方が便利です。そのためには、<code>Optional</code> の値が存在する場合はアンラップし、その値を含むリストを返す必要があります。これは、<code>Optional</code> 型への<a href="extensions.md#extension-functions">拡張関数</a>として実装できます。</p>
      <p>コード内の <code>Optional&lt;out T&gt;.toList()</code> では、<code>.toList()</code> が <code>Optional</code> に対する拡張関数です。拡張関数を使用すると、任意のクラスに機能を追加する関数を作成できます。これは、ライブラリクラスの機能を拡張したい場合に特に便利です。</p>
   </def>
   <def title="折りたたみ可能な項目 #2">
      <p><a href="https://docs.spring.io/spring-data/relational/reference/#jdbc.entity-persistence">この関数</a>は、新しいオブジェクトがデータベース内に id を持っていないという前提で動作します。そのため、挿入時には id が <b>null である必要</b>があります。</p>
      <p>id が <i>null</i> でない場合、<code>CrudRepository</code> はオブジェクトがデータベースにすでに存在すると想定し、<i>insert</i> 操作ではなく <i>update</i> 操作とみなします。insert 操作の後、<code>id</code> はデータストアによって生成され、<code>Message</code> インスタンスに再代入されます。これが、<code>id</code> プロパティを <code>var</code> キーワードを使用して宣言する必要がある理由です。</p>
      <p></p>
   </def>
</deflist>

### Clear 定義リスト {id="clear-definition-list"}

<deflist appearance="clear" collapsible="true">
<def title="展開可能な項目 #1">

番号なしの展開可能な項目です。ウィジェットの外枠のみをテストするため、本文はプレーンテキストになっています。

</def>
<def title="展開可能な項目 #2">

2つ目の展開可能な項目です。これを展開しても、兄弟項目の状態が変化してはなりません。

</def>
<def title="展開可能な項目 #3">

番号なしリストを締めくくる、3つ目の展開可能な項目です。

</def>
</deflist>

### 番号付き Clear 定義リスト {id="numbered-clear-definition-list"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="番号付き項目 #1">

生成された番号 1 とともに描画される番号付き項目の説明です。

</def>
<def title="番号付き項目 #2">

生成された番号 2 とともに描画される番号付き項目の説明です。

</def>
<def title="番号付き項目 #3">

生成された番号 3 とともに描画される番号付き項目の説明です。

</def>
<def title="番号付き項目 #4">

生成された番号 4 とともに描画される番号付き項目の説明です。

</def>
<def title="番号付き項目 #5">

生成された番号 5 とともに描画される番号付き項目の説明です。

</def>
<def title="番号付き項目 #6">

生成された番号 6 とともに描画される番号付き項目の説明です。

</def>
<def title="生成された番号のぶら下げインデントが崩れないことを確認するために、狭いビューポートで複数行に折り返す必要がある意図的に長い項目のタイトル">

生成された番号 7 とともに描画される番号付き項目の説明です。

</def>
<def title="番号付き項目 #8">

生成された番号 8 とともに描画される番号付き項目の説明です。

</def>
<def title="番号付き項目 #9">

生成された番号 9 とともに描画される番号付き項目の説明です。

</def>
<def title="番号付き項目 #10">

生成された番号 10 とともに描画される番号付き項目の説明です。

</def>
<def title="番号付き項目 #11">

生成された番号 11 とともに描画される番号付き項目の説明です。

</def>
</deflist>

## 演習 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="文字列テンプレートを使用して挨拶を出力する" id="test-page-practice-1">

プログラムが標準出力に `"Mary is 20 years old"` を出力するようにコードを完成させてください:

```kotlin
fun main() {
    val name = "Mary"
    val age = 20
    // ここにコードを記述してください
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="test-page-exercise-1"}

```kotlin
fun main() {
    val name = "Mary"
    val age = 20
    println("$name is $age years old")
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="test-page-solution-1"}

</def>
<def title="2つの結果が一致するかどうかを確認する" id="test-page-practice-2">

両方の結果が等しい場合は `You win :)` を、それ以外の場合は `You lose :(` を出力するように `if` を使用してください。

> この演習にはネストされたヒントも含まれているため、演習自体を折りたたむことなく内側の折りたたみリストが開く必要があります。
>
{style="tip"}

<deflist collapsible="true">
    <def title="ヒント">
        結果を比較するには等価演算子 (<code>==</code>) を使用します。
    </def>
</deflist>

```kotlin
fun main() {
    val firstResult = 3
    val secondResult = 3
    // ここにコードを記述してください
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="test-page-exercise-2"}

```kotlin
fun main() {
    val firstResult = 3
    val secondResult = 3
    if (firstResult == secondResult)
        println("You win :)")
    else
        println("You lose :(")
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="test-page-solution-2"}

</def>
<def title="数値のリストをフィルタリングする" id="test-page-practice-3">

`filter()` を使用して、リストの偶数のみを出力してください:

```kotlin
fun main() {
    val numbers = listOf(1, 2, 3, 4, 5)
    println(numbers)
    // ここにコードを記述してください
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="test-page-exercise-3"}

```kotlin
fun main() {
    val numbers = listOf(1, 2, 3, 4, 5)
    println(numbers)
    println(numbers.filter { it % 2 == 0 })
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="test-page-solution-3"}

</def>
</deflist>

## テキスト要素 {id="text-elements"}

* **太字テキスト**
* _斜体テキスト_
* `inline code`
* [内部アンカー](#lists)
* [内部リンク](roadmap.md)
* [外部リンク](https://jetbrains.com)
* 絵文字 ❌✅🆕

## 変数 {id="variables"}
* 変数の使用: 最新の Kotlin バージョンは %kotlinVersion% です

## 埋め込み要素 {id="embedded-elements"}

### YouTube からの動画 {id="video-from-youtube"}

<video src="https://www.youtube.com/v/Ol_96CHKqg8" title="What's new in Kotlin 1.9.20"/>

### 画像 {id="pictures"}

標準 (Markdown):

![テストを作成する](create-test.png){width="700"}

標準 (XML):

<img src="multiplatform-web-wizard.png" alt="Multiplatform web wizard" width="400"/>

インライン:

![YouTrack](youtrack-logo.png){width=30}{type="joined"}

ズーム可能:

![クラス図](ksp-class-diagram.svg){thumbnail="true" width="700" thumbnail-same-file="true"}

ボタンスタイル:

<a href="https://kmp.jetbrains.com">
   <img src="multiplatform-create-project-button.png" alt="プロジェクトを作成" style="block"/>
</a>

## ノート {id="notes"}

警告:

> kapt コンパイラープラグインでの K2 のサポートは[実験的 (Experimental)](components-stability.md)です。
> オプトインが必要です（詳細は以下を参照）。評価目的のみに使用してください。
>
{style="warning"}

注記:

> Kotlin/Native に同梱されているネイティブプラットフォームライブラリ（Foundation、UIKit、POSIX など）については、一部の API のみ
> `@ExperimentalForeignApi` によるオプトインが必要です。そのような場合、オプトインを要求する警告が表示されます。
>
{style="note"}

ヒント:

> Kotlin/Native に同梱されているネイティブプラットフォームライブラリ（Foundation、UIKit、POSIX など）については、一部の API のみ
> `@ExperimentalForeignApi` によるオプトインが必要です。そのような場合、オプトインを要求する警告が表示されます。
>
{style="tip"}