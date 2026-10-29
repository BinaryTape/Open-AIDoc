[//]: # (title: Kotlin 1.4.30 の新機能)

<web-summary>新しい言語機能、Kotlin マルチプラットフォーム、JVM、Native、JS への更新、および Gradle と Maven のビルドツールサポートを網羅した Kotlin 1.4.30 のリリースノートをお読みください。</web-summary>

_[リリース日: 2021年2月3日](releases.md#release-history)_

Kotlin 1.4.30 では、新しい言語機能のプレビュー版が提供され、Kotlin/JVM コンパイラの新しい IR バックエンドが Beta に昇格したほか、さまざまなパフォーマンスと機能の改善が行われています。

新機能については、[こちらのブログ投稿](https://blog.jetbrains.com/kotlin/2021/02/kotlin-1-4-30-released/)でもご確認いただけます。

> Kotlin のリリースサイクルの詳細については、[Kotlin のリリースプロセス](releases.md)を参照してください。
>
{style="tip"}

## 言語機能 {id="language-features"}

Kotlin 1.5.0 では、JVM レコード（records）のサポート、シールドインターフェース（sealed interfaces）、および安定版のインラインクラス（inline classes）という新しい言語機能が導入される予定です。
Kotlin 1.4.30 では、これらの機能と改善をプレビューモードで試すことができます。1.5.0 のリリース前に対処できるよう、対応する YouTrack チケットでフィードバックを共有していただければ幸いです。

* [JVM レコードのサポート](#jvm-records-support)
* [シールドインターフェース](#sealed-interfaces) と [シールドクラスの改善](#package-wide-sealed-class-hierarchies)
* [改善されたインラインクラス](#improved-inline-classes)

これらの言語機能や改善をプレビューモードで有効にするには、特定のコンパイラオプションを追加してオプトインする必要があります。詳細は以下のセクションを参照してください。

新機能のプレビューの詳細については、[こちらのブログ投稿](https://blog.jetbrains.com/kotlin/2021/02/new-language-features-preview-in-kotlin-1-4-30/)をご覧ください。

### JVM レコードのサポート {id="jvm-records-support"}

> JVM レコード機能は[実験的（Experimental）](components-stability.md)です。将来的に削除または変更される可能性があります。
> オプトインが必要であり（詳細は以下を参照）、評価目的でのみ使用してください。[YouTrack](https://youtrack.jetbrains.com/issue/KT-42430) でのフィードバックをお待ちしております。
>
{style="warning"}

[JDK 16 のリリース](https://openjdk.java.net/projects/jdk/16/)には、[record](https://openjdk.java.net/jeps/395) と呼ばれる新しい Java クラス型を安定化させる計画が含まれています。Kotlin のすべての利点を提供し、Java との相互運用性を維持するために、Kotlin は実験的なレコードクラスのサポートを導入しています。

Java で宣言されたレコードクラスは、Kotlin のプロパティを持つクラスと同じように使用できます。追加の手順は必要ありません。

1.4.30 以降、[データクラス](data-classes.md)に `@JvmRecord` アノテーションを使用することで、Kotlin でレコードクラスを宣言できるようになりました。

```kotlin
@JvmRecord
data class User(val name: String, val age: Int)
```

JVM レコードのプレビュー版を試すには、コンパイラオプション `-Xjvm-enable-preview` と `-language-version 1.5` を追加してください。

JVM レコードのサポートについては引き続き作業を進めております。この [YouTrack チケット](https://youtrack.jetbrains.com/issue/KT-42430) を通じてフィードバックをお寄せいただければ幸いです。

実装、制限、および構文の詳細については、[KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/jvm-records.md) を参照してください。

### シールドインターフェース {id="sealed-interfaces"}

> シールドインターフェースは[実験的（Experimental）](components-stability.md)です。将来的に削除または変更される可能性があります。
> オプトインが必要であり（詳細は以下を参照）、評価目的でのみ使用してください。[YouTrack](https://youtrack.jetbrains.com/issue/KT-42433) でのフィードバックをお待ちしております。
>
{style="warning"}

Kotlin 1.4.30 では、*シールドインターフェース（sealed interfaces）* のプロトタイプを導入します。これらはシールドクラス（sealed classes）を補完し、より柔軟な制限付きクラス階層を構築することを可能にします。

これらは、同じモジュール外では実装できない「内部的な」インターフェースとして機能します。この事実を利用して、たとえば網羅的な `when` 式を記述することができます。

```kotlin
sealed interface Polygon

class Rectangle(): Polygon
class Triangle(): Polygon

// when() は網羅的です。モジュールのコンパイル後に
// 他の Polygon の実装が現れることはありません
fun draw(polygon: Polygon) = when (polygon) {
    is Rectangle -> // ...
    is Triangle -> // ...
}

```

もう一つのユースケースとして、シールドインターフェースを使用すると、1つのクラスが2つ以上のシールドスーパークラスを継承できるようになります。

```kotlin
sealed interface Fillable {
   fun fill()
}
sealed interface Polygon {
   val vertices: List<Point>
}

class Rectangle(override val vertices: List<Point>): Fillable, Polygon {
   override fun fill() { /*...*/ }
}
```

シールドインターフェースのプレビュー版を試すには、コンパイラオプション `-language-version 1.5` を追加してください。このバージョンに切り替えると、インターフェースで `sealed` 修飾子を使用できるようになります。この [YouTrack チケット](https://youtrack.jetbrains.com/issue/KT-42433) を通じてフィードバックをお寄せいただければ幸いです。

[シールドインターフェースの詳細](sealed-classes.md)。

### パッケージ全体のシールドクラス階層 {id="package-wide-sealed-class-hierarchies"}

> パッケージ全体のシールドクラス階層は[実験적（Experimental）](components-stability.md)です。将来的に削除または変更される可能性があります。
> オプトインが必要であり（詳細は以下を参照）、評価目的でのみ使用してください。[YouTrack](https://youtrack.jetbrains.com/issue/KT-42433) でのフィードバックをお待ちしております。
>
{style="warning"}

シールドクラスが、より柔軟な階層を形成できるようになりました。同じコンパイル単位かつ同じパッケージ内のすべてのファイルにサブクラスを持つことができます。以前は、すべてのサブクラスが同じファイル内に記述されている必要がありました。

直接のサブクラスは、トップレベルに配置することも、他の任意の数の名前付きクラス、名前付きインターフェース、または名前付きオブジェクト内にネストすることもできます。シールドクラスのサブクラスは、適切に修飾された（qualified）名前を持つ必要があり、ローカルオブジェクトや匿名オブジェクトにすることはできません。

パッケージ全体のシールドクラス階層を試すには、コンパイラオプション `-language-version 1.5` を追加してください。この [YouTrack チケット](https://youtrack.jetbrains.com/issue/KT-42433) を通じてフィードバックをお寄せいただければ幸いです。

[パッケージ全体のシールドクラス階層の詳細](sealed-classes.md#inheritance)。

### 改善されたインラインクラス {id="improved-inline-classes"}

> インラインバリュークラス（inline value classes）は [Beta](components-stability.md) です。ほぼ安定していますが、将来的に移行手順が必要になる可能性があります。変更を最小限に抑えるよう最善を尽くします。インラインクラス機能に関するフィードバックを [YouTrack](https://youtrack.jetbrains.com/issue/KT-42434) でお待ちしております。
>
{style="warning"}

Kotlin 1.4.30 では、[インラインクラス](inline-classes.md)を [Beta](components-stability.md) に昇格させ、以下の機能追加と改善を行いました。

* インラインクラスは[値ベース（value-based）](https://docs.oracle.com/en/java/javase/15/docs/api/java.base/java/lang/doc-files/ValueBased.html)であるため、`value` 修飾子を使用して定義できるようになりました。現在、`inline` 修飾子と `value` 修飾子は互いに同等です。将来の Kotlin バージョンでは、`inline` 修飾子を非推奨にする予定です。

  今後、JVM バックエンドではクラス宣言の前に `@JvmInline` アノテーションが必要になります。
  
  ```kotlin
  inline class Name(private val s: String)
  
  value class Name(private val s: String)
  
  // JVM バックエンドの場合
  @JvmInline
  value class Name(private val s: String)
  ```

* インラインクラスに `init` ブロックを持たせることができるようになりました。クラスがインスタンス化された直後に実行されるコードを追加できます。
  
  ```kotlin
  @JvmInline
  value class Negative(val x: Int) {
    init {
        require(x < 0) { }
    }
  }
  ```

* Java コードからのインラインクラスを使用した関数の呼び出し：Kotlin 1.4.30 より前は、マングリング（名前の難読化）のために、インラインクラスを受け取る関数を Java から呼び出すことができませんでした。
  今後は、手動でマングリングを無効にすることができます。このような関数を Java コードから呼び出すには、関数宣言の前に `@JvmName` アノテーションを追加する必要があります。

  ```kotlin
  inline class UInt(val x: Int)
  
  fun compute(x: Int) { }
  
  @JvmName("computeUInt")
  fun compute(x: UInt) { }
  ```

* 本リリースでは、不適切な動作を修正するために関数のマングリングスキームを変更しました。これらの変更により ABI が変更されました。

  1.4.30 以降、Kotlin コンパイラはデフォルトで新しいマングリングスキームを使用します。コンパイラに古い 1.4.0 のマングリングスキームを強制的に使用させ、バイナリ互換性を維持するには、`-Xuse-14-inline-classes-mangling-scheme` コンパイラフラグを使用してください。

Kotlin 1.4.30 はインラインクラスを Beta に昇格させ、将来のリリースのいずれかで Stable にする予定です。この [YouTrack チケット](https://youtrack.jetbrains.com/issue/KT-42434) を通じてフィードバックをお寄せいただければ幸いです。

インラインクラスのプレビュー版を試すには、コンパイラオプション `-Xinline-classes` または `-language-version 1.5` を追加してください。

マングリングアルゴリズムの詳細については、[KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/inline-classes.md) を参照してください。

[インラインクラスの詳細](inline-classes.md)。

## Kotlin/JVM {id="kotlin-jvm"}

### JVM IR コンパイラバックエンドが Beta に到達 {id="jvm-ir-compiler-backend-reaches-beta"}

1.4.0 で [Alpha](components-stability.md) として提供された Kotlin/JVM 用の [IR ベースのコンパイラバックエンド](whatsnew14.md#unified-backends-and-extensibility)が Beta に到達しました。これは、IR バックエンドが Kotlin/JVM コンパイラのデフォルトになる前の、最後のプレステータスレベルです。

IR コンパイラによって生成されたバイナリの使用制限を廃止します。以前は、新しい JVM IR バックエンドでコンパイルされたコードは、新しいバックエンドを有効にしている場合にのみ使用できました。1.4.30 以降、そのような制限はなくなるため、新しいバックエンドを使用してライブラリなどのサードパーティ向けのコンポーネントを構築できます。新しいバックエンドの Beta 版を試し、弊社の[課題トラッカー](https://kotl.in/issue)でフィードバックを共有してください。

新しい JVM IR バックエンドを有効にするには、プロジェクトの構成ファイルに以下の行を追加してください。
* Gradle の場合:

  <tabs group="build-script">
  <tab title="Kotlin" group-key="kotlin">

  ```kotlin
  tasks.withType(org.jetbrains.kotlin.gradle.dsl.KotlinJvmCompile::class) {
    kotlinOptions.useIR = true
  }
  ```
  
  </tab>
  <tab title="Groovy" group-key="groovy">
  
  ```groovy
  tasks.withType(org.jetbrains.kotlin.gradle.dsl.KotlinJvmCompile) {
    kotlinOptions.useIR = true
  }
  ```

  </tab>
  </tabs>

* Maven の場合:

  ```xml
  <configuration>
      <args>
          <arg>-Xuse-ir</arg>
      </args>
  </configuration>
  ```

JVM IR バックエンドがもたらす変更の詳細については、[こちらのブログ投稿](https://blog.jetbrains.com/kotlin/2021/02/the-jvm-backend-is-in-beta-let-s-make-it-stable-together/)をご覧ください。

## Kotlin/Native {id="kotlin-native"}

### パフォーマンスの改善 {id="performance-improvements"}

Kotlin/Native では 1.4.30 でさまざまなパフォーマンスの改善が行われ、コンパイル時間が短縮されました。
たとえば、[Networking and data storage with Kotlin Multiplatform Mobile](https://github.com/kotlin-hands-on/kmm-networking-and-data-storage/tree/final) サンプルでのフレームワークの再ビルドに必要な時間は、9.5秒（1.4.10）から4.5秒（1.4.30）に短縮されました。

### Apple watchOS 64ビットシミュレータターゲット {id="apple-watchos-64-bit-simulator-target"}

x86 シミュレータターゲットは、バージョン 7.0 以降の watchOS で非推奨になりました。最新の watchOS バージョンに対応するため、Kotlin/Native には 64ビットアーキテクチャでシミュレータを実行するための新しいターゲット `watchosX64` が追加されました。

### Xcode 12.2 ライブラリのサポート {id="support-for-xcode-12-2-libraries"}

Xcode 12.2 で提供される新しいライブラリのサポートを追加しました。Kotlin コードからこれらを使用できるようになります。

## Kotlin/JS {id="kotlin-js"}

### トップレベルプロパティの遅延初期化 {id="lazy-initialization-of-top-level-properties"}

> トップレベルプロパティの遅延初期化（Lazy initialization）は[実験的（Experimental）](components-stability.md)です。将来的に削除または変更される可能性があります。
> オプトインが必要であり（詳細は以下を参照）、評価目的でのみ使用してください。[YouTrack](https://youtrack.jetbrains.com/issue/KT-44320) でのフィードバックをお待ちしております。
>
{style="warning"}

Kotlin/JS 用の [IR バックエンド](js-ir-compiler.md)に、トップレベルプロパティの遅延初期化のプロトタイプ実装が導入されました。これにより、アプリケーションの起動時にすべてのトップレベルプロパティを初期化する必要性が減り、アプリケーションの起動時間が大幅に向上するはずです。

遅延初期化については引き続き改善を進めてまいります。現在のプロトタイプを試して、その感想や結果をこの [YouTrack チケット](https://youtrack.jetbrains.com/issue/KT-44320) または公式 [Kotlin Slack](https://kotlinlang.slack.com)（招待は[こちら](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)）の [`#javascript`](https://kotlinlang.slack.com/archives/C0B8L3U69) チャンネルで共有してください。

遅延初期化を使用するには、JS IR コンパイラでコードをコンパイルする際に `-Xir-property-lazy-initialization` コンパイラオプションを追加してください。

## Gradle プロジェクトの改善 {id="gradle-project-improvements"}

### Gradle 構成キャッシュ（Configuration cache）のサポート {id="support-the-gradle-configuration-cache"}

1.4.30 以降、Kotlin Gradle プラグインは [構成キャッシュ](https://docs.gradle.org/current/userguide/configuration_cache.html) 機能をサポートします。これによりビルドプロセスが高速化されます。コマンドを実行すると、Gradle は構成フェーズを実行してタスクグラフを計算します。Gradle はその結果をキャッシュし、その後のビルドで再利用します。

この機能の使用を開始するには、[Gradle コマンドを使用する](https://docs.gradle.org/current/userguide/configuration_cache.html#config_cache:usage)か、[IntelliJ ベースの IDE をセットアップ](https://docs.gradle.org/current/userguide/configuration_cache.html#config_cache:ide:intellij)してください。

## 標準ライブラリ {id="standard-library"}

### テキストの大文字・小文字変換用のロケールに依存しない API {id="locale-agnostic-api-for-upper-lowercasing-text"}

> ロケールに依存しない（locale-agnostic）API 機能は[実験的（Experimental）](components-stability.md)です。将来的に削除または変更される可能性があります。
> 評価目的でのみ使用してください。
> [YouTrack](https://youtrack.jetbrains.com/issue/KT-42437) でのフィードバックをお待ちしております。
>
{style="warning"}

本リリースでは、文字列や文字の大文字・小文字を変更するための、ロケールに依存しない実験的な API を導入します。
現在の `toLowerCase()`、`toUpperCase()`、`capitalize()`、`decapitalize()` API 関数はロケールに依存しています。つまり、異なるプラットフォームのロケール設定がコードの動作に影響を与える可能性があります。たとえば、トルコ語のロケールでは、文字列 "kotlin" を `toUpperCase` を使用して変換すると、結果は "KOTLIN" ではなく "KOTLİN" になります。

```kotlin
// 現在の API
println("Needs to be capitalized".toUpperCase()) // NEEDS TO BE CAPITALIZED

// 新しい API
println("Needs to be capitalized".uppercase()) // NEEDS TO BE CAPITALIZED
```

Kotlin 1.4.30 は以下の代替手段を提供します。

* `String` 関数用:

  |**以前のバージョン**|**1.4.30 の代替手段**| 
  | --- | --- |
  |`String.toUpperCase()`|`String.uppercase()`|
  |`String.toLowerCase()`|`String.lowercase()`|
  |`String.capitalize()`|`String.replaceFirstChar { it.uppercase() }`|
  |`String.decapitalize()`|`String.replaceFirstChar { it.lowercase() }`|

* `Char` 関数用:

  |**以前のバージョン**|**1.4.30 の代替手段**| 
  | --- | --- |
  |`Char.toUpperCase()`|`Char.uppercaseChar(): Char`<br/>`Char.uppercase(): String`|
  |`Char.toLowerCase()`|`Char.lowercaseChar(): Char`<br/>`Char.lowercase(): String`|
  |`Char.toTitleCase()`|`Char.titlecaseChar(): Char`<br/>`Char.titlecase(): String`|

> Kotlin/JVM の場合、明示的な `Locale` パラメータを持つオーバーロードされた `uppercase()`、`lowercase()`、および `titlecase()` 関数もあります。
>
{style="note"}

テキスト処理関数の変更内容の完全なリストについては、[KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/stdlib/locale-agnostic-string-conversions.md) を参照してください。

### 明確な Char-to-code および Char-to-digit 変換 {id="clear-char-to-code-and-char-to-digit-conversions"}

> `Char` 変換用の明確な API 機能は[実験的（Experimental）](components-stability.md)です。将来的に削除または変更される可能性があります。
> 評価目的でのみ使用してください。
> [YouTrack](https://youtrack.jetbrains.com/issue/KT-44333) でのフィードバックをお待ちしております。
>
{style="warning"}

現在の `Char` から数値への変換関数（異なる数値型で表現された UTF-16 コードを返す）は、文字列の数値を返す同様の String-to-Int 変換と混同されることがよくあります。

```kotlin
"4".toInt() // 4 を返す
'4'.toInt() // 52 を返す
// また、Char '4' に対して数値 4 を返す共通の関数はありませんでした
```

この混乱を避けるために、`Char` 変換を以下の2つの明確な名前の関数セットに分けることにしました。

* `Char` の整数コードを取得する関数、および指定されたコードから `Char` を構築する関数：
 
  ```kotlin
  fun Char(code: Int): Char
  fun Char(code: UShort): Char
  val Char.code: Int
  ```

* `Char` をそれが表す数字の数値に変換する関数：

  ```kotlin
  fun Char.digitToInt(radix: Int): Int
  fun Char.digitToIntOrNull(radix: Int): Int?
  ```
* 非負の1桁の数字を表す `Int` を、対応する `Char` 表現に変換するための拡張関数：

  ```kotlin
  fun Int.digitToChar(radix: Int): Char
  ```

詳細は [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/stdlib/char-int-conversions.md) を参照してください。

<h2>Serialization の更新</h2>

Kotlin 1.4.30 と共に、いくつかの新機能を含む `kotlinx.serialization` [1.1.0-RC](https://github.com/Kotlin/kotlinx.serialization/releases/tag/v1.1.0-RC) をリリースします。

* インラインクラスのシリアル化サポート
* 符号なしプリミティブ型のシリアル化サポート

### インラインクラスのシリアル化サポート {id="inline-classes-serialization-support"}

Kotlin 1.4.30 以降、インラインクラスを[シリアル化可能（serializable）](serialization.md)にできるようになりました。

```kotlin
@Serializable
inline class Color(val rgb: Int)
```

> この機能には、新しい 1.4.30 IR コンパイラが必要です。
>
{style="note"}

シリアル化フレームワークは、シリアル化可能なインラインクラスが他のシリアル化可能なクラスで使用される場合、それらをボックス化しません。

詳細は `kotlinx.serialization` の[ドキュメント](https://github.com/Kotlin/kotlinx.serialization/blob/master/docs/inline-classes.md#serializable-inline-classes)をご覧ください。

### 符号なしプリミティブ型のシリアル化サポート {id="unsigned-primitive-type-serialization-support"}

1.4.30 からは、符号なしプリミティブ型（`UInt`、`ULong`、`UByte`、`UShort`）に対して [kotlinx.serialization](https://github.com/Kotlin/kotlinx.serialization) の標準 JSON シリアライザーを使用できます。

```kotlin
@Serializable
class Counter(val counted: UByte, val description: String)
fun main() {
   val counted = 239.toUByte()
   println(Json.encodeToString(Counter(counted, "tries")))
}
```

詳細は `kotlinx.serialization` の[ドキュメント](https://github.com/Kotlin/kotlinx.serialization/blob/master/docs/inline-classes.md#unsigned-types-support-json-only)をご覧ください。