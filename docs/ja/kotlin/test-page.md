[//]: # (title: テストページ)

<web-summary>このページはテスト目的のみに使用されます。</web-summary>

<no-index/>

<tldr>
   <p>これは画像を含むブロックです（<strong>Compose Multiplatformの基本</strong>チュートリアルから引用）。</p>
   <p><img src="icon-1-done.svg" width="20" alt="ステップ1"/> <a href="jvm-create-project-with-spring-boot.md">KotlinでSpring Bootプロジェクトを作成する</a><br/>
      <img src="icon-2-done.svg" width="20" alt="ステップ2"/> <a href="jvm-spring-boot-add-data-class.md">Spring Bootプロジェクトにデータクラスを追加する</a><br/>
      <img src="icon-3.svg" width="20" alt="ステップ3"/> <strong>Spring Bootプロジェクトにデータベースサポートを追加する</strong><br/>
      <img src="icon-4-todo.svg" width="20" alt="ステップ4"/> データベースアクセスにSpring Data CrudRepositoryを使用する<br/>
    </p>
</tldr>

## 同期タブ

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

## セクション

### 折りたたみセクション {initial-collapse-state="collapsed" collapsible="true"}

ここにテキストとコードブロックがあります：

```kotlin
plugins {
    kotlin("plugin.noarg") version "1.9.23"
}
```

## コードブロック

単一のコードブロック：

```kotlin
    import java.util.*

@Service
class MessageService(val db: MessageRepository) {
    fun findMessages(): `List<Message>` = db.findAll().toList()

    fun findMessageById(id: String): `List<Message>` = db.findById(id).toList()

    fun save(message: Message) {
        db.save(message)
    }

    fun <T : Any> Optional<out T>.toList(): `List<T>` =
        if (isPresent) listOf(get()) else emptyList()
}
```

### 展開可能なコードブロック

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

### 実行可能なコードブロック

```kotlin
data class User(val name: String, val id: Int)

fun main() {
    val user = User("Alex", 1)
    
    //sampleStart
    // 出力が読みやすくなるように、toString()関数を自動的に使用します
    println(user)            
    // User(name=Alex, id=1)
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

## テーブル

### Markdownテーブル

| プリミティブ型の配列                                                                    | Javaでの対応 |
|---------------------------------------------------------------------------------------|--------------------|
| [`BooleanArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-boolean-array/) | `boolean[]`        |
| [`ByteArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-byte-array/)       | `byte[]`           |
| [`CharArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-char-array/)       | `char[]`           |
| [`DoubleArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-double-array/)   | `double[]`         |
| [`FloatArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-float-array/)     | `float[]`          |
| [`IntArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-int-array/)         | `int[]`            |
| [`LongArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-long-array/)       | `long[]`           |
| [`ShortArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-short-array/)     | `short[]`          |

### XMLテーブル

<table>
    <tr>
        <td><strong>最終更新日</strong></td>
        <td><strong>2023年12月</strong></td>
    </tr>
    <tr>
        <td><strong>次回の更新</strong></td>
        <td><strong>2024年6月</strong></td>
    </tr>
</table>

### コードブロックを含むXMLテーブル

シンプルなテーブル：

<table>
    <tr>
        <td>以前</td>
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

より複雑なテーブル：

<table>
    <tr>
        <td></td>
        <td>以前</td>
        <td>現在</td>
    </tr>
    <tr>
        <td rowspan="2"><code>jvmMain</code>コンパイルの依存関係</td>
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
        <td><code>jvmMain</code>ソースセットの依存関係</td>
<td colspan="2">

```kotlin
jvmMain<Scope>
```

</td>
    </tr>
    <tr>
        <td><code>jvmTest</code>コンパイルの依存関係</td>
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
        <td><code>jvmTest</code>ソースセットの依存関係</td>
<td colspan="2">

```kotlin
jvmTest<Scope>
```

</td>
    </tr>
</table>

## リスト

### 番号付きリスト

1. 1つ目
2. 2つ目
3. 3つ目
    1. 3の1
    2. 3の2
    3. 3の3
        1. 3の1の1
4. 内部にコードブロックがある場合：

   ```kotlin
   jvmTest<Scope>
   ```

### 番号なしリスト

* 最初の項目
* 2番目の項目
* 3番目の項目
    * もう一つ
    * さらにもう一つ
        * おっと、さらにもう一つ
* 内部にコードブロックがある場合：

   ```kotlin
   jvmTest<Scope>
   ```

### 定義リスト

<deflist collapsible="true">
   <def title="折りたたみアイテム #1">
      <p><code>CrudRepository</code>インターフェースの<code>findById()</code>関数の戻り値の型は、<code>Optional</code>クラスのインスタンスです。しかし、一貫性を保つために、単一のメッセージを含む<code>List</code>を返すのが便利です。そのためには、<code>Optional</code>の値が存在する場合はその値をアンラップし、値を含むリストを返す必要があります。これは、<code>Optional</code>型に対する<a href="extensions.md#extension-functions">拡張関数（extension function）</a>として実装できます。</p>
      <p>コード内の<code>Optional&lt;out T&gt;.toList()</code>において、<code>.toList()</code>は<code>Optional</code>の拡張関数です。拡張関数を使用すると、任意のクラスに新しい関数を追加できます。これは、ライブラリクラスの機能を拡張したい場合に特に便利です。</p>
   </def>
   <def title="折りたたみアイテム #2">
      <p><a href="https://docs.spring.io/spring-data/relational/reference/#jdbc.entity-persistence">この関数は</a>、新しいオブジェクトがデータベース内にIDを持っていないことを前提として動作します。したがって、挿入の際にはIDは<b>nullである必要</b>があります。</p>
      <p> IDが<i>null</i>でない場合、<code>CrudRepository</code>はそのオブジェクトがすでにデータベースに存在するとみなし、挿入（insert）操作ではなく更新（update）操作として扱います。挿入操作の後、<code>id</code>はデータストアによって生成され、<code>Message</code>インスタンスに再度割り当てられます。そのため、<code>id</code>プロパティは<code>var</code>キーワードを使用して宣言する必要があります。</p>
      <p></p>
   </def>
</deflist>

## テキスト要素

* **太字テキスト**
* _斜体テキスト_
* `inline code`
* [内部アンカー](#lists)
* [内部リンク](roadmap.md)
* [外部リンク](https://jetbrains.com)
* 絵文字 ❌✅🆕

## 変数
* 変数の使用：最新のKotlinバージョンは %kotlinVersion% です

## 埋め込み要素

### YouTubeの動画

<video src="https://www.youtube.com/v/Ol_96CHKqg8" title="What's new in Kotlin 1.9.20"/>

### 画像

標準（Markdown）：

![テストを作成する](create-test.png){width="700"}

標準（XML）：

<img src="multiplatform-web-wizard.png" alt="マルチプラットフォームWebウィザード" width="400"/>

インライン：

![YouTrack](youtrack-logo.png){width=30}{type="joined"}

ズーム可能：

![クラス図](ksp-class-diagram.svg){thumbnail="true" width="700" thumbnail-same-file="true"}

ボタンスタイル：

<a href="https://kmp.jetbrains.com">
   <img src="multiplatform-create-project-button.png" alt="プロジェクトを作成する" style="block"/>
</a>

## ノート

警告：

> kaptコンパイラプラグインにおけるK2のサポートは[実験的（Experimental）](components-stability.md)です。
> オプトインが必要です（詳細は以下を参照）。評価目的でのみ使用してください。
>
{style="warning"}

注記：

> Kotlin/Nativeに同梱されているネイティブプラットフォームライブラリ（Foundation、UIKit、POSIXなど）については、一部のAPIのみ`@ExperimentalForeignApi`でのオプトインが必要です。その場合、オプトインを要求する警告が表示されます。
>
{style="note"}

ヒント：

> Kotlin/Nativeに同梱されているネイティブプラットフォームライブラリ（Foundation、UIKit、POSIXなど）については、一部のAPIのみ`@ExperimentalForeignApi`でのオプトインが必要です。その場合、オプトインを要求する警告が表示されます。
>
{style="tip"}