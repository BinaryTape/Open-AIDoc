[//]: # (title: Kotlin 1.7.20 の新機能)

<web-summary>Kotlin 1.7.20 のリリースノートを読み、新しい言語機能、Kotlin Multiplatform、JVM、Native、JS へのアップデート、および Gradle と Maven のビルドツールサポートについて確認してください。</web-summary>

<tldr>
   <p>Kotlin 1.7.20 の IDE サポートは、IntelliJ IDEA 2021.3、2022.1、および 2022.2 で利用可能です。</p>
</tldr>

_[リリース日: 2022年9月29日](releases.md#release-history)_

Kotlin 1.7.20 がリリースされました！このリリースの主なハイライトは以下の通りです。

* [新しい Kotlin K2 コンパイラが `all-open`、SAM with receiver、Lombok、およびその他のコンパイラプラグインをサポート](#support-for-kotlin-k2-compiler-plugins)
* [オープンエンドの範囲（open-ended ranges）を作成するための `..<` 演算子のプレビューを導入](#preview-of-the-operator-for-creating-open-ended-ranges)
* [新しい Kotlin/Native メモリマネージャーがデフォルトで有効に](#the-new-kotlin-native-memory-manager-enabled-by-default)
* [JVM 向けの新しい実験的機能：ジェネリックな基底型（generic underlying type）を持つインラインクラスを導入](#generic-inline-classes)

また、このビデオで変更点の短い概要を確認できます。

<video src="https://www.youtube.com/v/OG9npowJgE8" title="What's new in Kotlin 1.7.20"/>

> Kotlin のリリースサイクルに関する情報は、[Kotlin のリリースプロセス](releases.md)を参照してください。
>
{style="tip"}

## Kotlin K2 コンパイラプラグインのサポート

Kotlin チームは K2 コンパイラの安定化を続けています。
K2 はまだ **Alpha** 段階ですが（[Kotlin 1.7.0 リリース](whatsnew17.md#new-kotlin-k2-compiler-for-the-jvm-in-alpha)で発表された通り）、現在はいくつかのコンパイラプラグインをサポートしています。新しいコンパイラに関する Kotlin チームからの最新情報は、[この YouTrack イシュー](https://youtrack.jetbrains.com/issue/KT-52604)で確認できます。

この 1.7.20 リリースより、Kotlin K2 コンパイラは以下のプラグインをサポートします。

* [`all-open`](all-open-plugin.md)
* [`no-arg`](no-arg-plugin.md)
* [SAM with receiver](sam-with-receiver-plugin.md)
* [Lombok](lombok.md)
* AtomicFU
* `jvm-abi-gen`

> 新しい K2 コンパイラの Alpha バージョンは JVM プロジェクトでのみ動作します。
> Kotlin/JS、Kotlin/Native、またはその他のマルチプラットフォームプロジェクトはサポートしていません。
>
{style="warning"}

新しいコンパイラとその利点については、以下のビデオで詳しく学ぶことができます：
* [The Road to the New Kotlin Compiler](https://www.youtube.com/watch?v=iTdJJq_LyoY)
* [K2 Compiler: a Top-Down View](https://www.youtube.com/watch?v=db19VFLZqJM)

### Kotlin K2 コンパイラを有効にする方法

Kotlin K2 コンパイラを有効にしてテストするには、以下のコンパイラオプションを使用します。

```bash
-Xuse-k2
```

`build.gradle(.kts)` ファイルで次のように指定できます。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
tasks.withType<KotlinCompile> {
    kotlinOptions.useK2 = true
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
compileKotlin {
    kotlinOptions.useK2 = true
}
```
</tab>
</tabs>

JVM プロジェクトでのパフォーマンス向上を確認し、旧コンパイラの結果と比較してみてください。

### 新しい K2 コンパイラへのフィードバック

どのような形でのフィードバックも歓迎します：
* Kotlin Slack で K2 開発者に直接フィードバックを送る：[招待を受ける](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up?_gl=1*ju6cbn*_ga*MTA3MTk5NDkzMC4xNjQ2MDY3MDU4*_ga_9J976DJZ68*MTY1ODMzNzA3OS4xMDAuMS4xNjU4MzQwODEwLjYw) して [#k2-early-adopters](https://kotlinlang.slack.com/archives/C03PK0PE257) チャンネルに参加してください。
* 新しい K2 コンパイラで直面した問題について [課題トラッカー](https://kotl.in/issue) に報告する。
* [**Send usage statistics**（使用統計の送信）オプションを有効にする](https://www.jetbrains.com/help/idea/settings-usage-statistics.html) ことで、JetBrains が K2 の使用に関する匿名データを収集できるようにする。

## 言語

Kotlin 1.7.20 では、新しい言語機能のプレビュー版が導入されたほか、ビルダー型推論に制限が課されました。

* [オープンエンドの範囲を作成するための ..< 演算子のプレビュー](#preview-of-the-operator-for-creating-open-ended-ranges)
* [新しい data object 宣言](#improved-string-representations-for-singletons-and-sealed-class-hierarchies-with-data-objects)
* [ビルダー型推論の新しい制限](#new-builder-type-inference-restrictions)

### オープンエンドの範囲を作成するための ..< 演算子のプレビュー

> この新しい演算子は[実験的（Experimental）](components-stability.md#stability-levels-explained)であり、IDE でのサポートは限定的です。
>
{style="warning"}

このリリースでは、新しい `..<` 演算子が導入されました。Kotlin には値の範囲を表すための `..` 演算子があります。新しい `..<` 演算子は `until` 関数のように動作し、オープンエンド（上限を含まない）の範囲を定義するのに役立ちます。

<video src="https://www.youtube.com/watch?v=v0AHdAIBnbs" title="New operator for open-ended ranges"/>

私たちの調査によると、この新しい演算子はオープンエンドの範囲を表現し、上限が含まれないことを明確にするのに適しています。

以下は、`when` 式で `..<` 演算子を使用する例です。

```kotlin
when (value) {
    in 0.0..<0.25 -> // 第1四半期
    in 0.25..<0.5 -> // 第2四半期
    in 0.5..<0.75 -> // 第3四半期
    in 0.75..1.0 ->  // 第4四半期  <- ここは閉じた範囲（closed range）であることに注意
}
```
{validate="false"}

#### 標準ライブラリ API の変更

共通の Kotlin 標準ライブラリの `kotlin.ranges` パッケージに、以下の新しい型と操作が導入されます。

##### 新しい OpenEndRange&lt;T&gt; インターフェース

オープンエンドの範囲を表す新しいインターフェースは、既存の `ClosedRange<T>` インターフェースと非常によく似ています。

```kotlin
interface OpenEndRange<T : Comparable<T>> {
    // 下限
    val start: T
    // 上限、範囲には含まれない
    val endExclusive: T
    operator fun contains(value: T): Boolean = value >= start && value < endExclusive
    fun isEmpty(): Boolean = start >= endExclusive
}
```
{validate="false"}

##### 既存のイテラブルな範囲での OpenEndRange の実装

開発者が上限を除外した範囲を必要とする場合、現在は `until` 関数を使用して、同じ値を持つ閉じたイテラブルな範囲を実質的に生成しています。これらの範囲を `OpenEndRange<T>` を受け取る新しい API で利用できるようにするため、既存のイテラブルな範囲（`IntRange`、`LongRange`、`CharRange`、`UIntRange`、`ULongRange`）にそのインターフェースを実装することにしました。これにより、これらは `ClosedRange<T>` と `OpenEndRange<T>` の両方のインターフェースを同時に実装することになります。

```kotlin
class IntRange : IntProgression(...), ClosedRange<Int>, OpenEndRange<Int> {
    override val start: Int
    override val endInclusive: Int
    override val endExclusive: Int
}
```
{validate="false"}

##### 標準型向けの rangeUntil 演算子

`rangeUntil` 演算子は、現在 `rangeTo` 演算子で定義されているのと同じ型と組み合わせに対して提供されます。プロトタイプの目的で拡張関数として提供していますが、一貫性のために、オープンエンド範囲 API を安定化させる前に、後でメンバー関数にする予定です。

#### ..&lt; 演算子を有効にする方法

`..<` 演算子を使用したり、独自の型に対してその演算子の規約を実装したりするには、`-language-version 1.8` コンパイラオプションを有効にします。

標準型のオープンエンド範囲をサポートするために導入された新しい API 要素は、実験的な標準ライブラリ API の常として、オプトイン（`@OptIn(ExperimentalStdlibApi::class)`）が必要です。あるいは、`-opt-in=kotlin.ExperimentalStdlibApi` コンパイラオプションを使用することもできます。

[この KEEP ドキュメントで新しい演算子の詳細を読むことができます](https://github.com/kotlin/KEEP/blob/open-ended-ranges/proposals/open-ended-ranges.md)。

### data object を使用した、シングルトンおよび sealed クラス階層の文字列表現の改善

> Data object は[実験的（Experimental）](components-stability.md#stability-levels-explained)であり、現時点では IDE でのサポートは限定的です。
>
{style="warning"}

このリリースでは、新しい種類の `object` 宣言である `data object` が導入されました。[Data object](https://youtrack.jetbrains.com/issue/KT-4107) は、概念的には通常の `object` 宣言と同一ですが、標準でクリーンな `toString` 表現を提供します。

<video src="https://www.youtube.com/v/ovAqcwFhEGc" title="Data objects in Kotlin 1.7.20"/>

```kotlin
package org.example
object MyObject
data object MyDataObject

fun main() {
    println(MyObject) // org.example.MyObject@1f32e575
    println(MyDataObject) // MyDataObject
}
```

これにより、`data object` 宣言は `data class` 宣言と一緒に使用する sealed クラス階層に最適です。このスニペットでは、`EndOfFile` を単なる `object` ではなく `data object` として宣言することで、手動でオーバーライドしなくても適切な `toString` が得られ、付随する `data class` 定義との対称性が維持されます。

```kotlin
sealed class ReadResult {
    data class Number(val value: Int) : ReadResult()
    data class Text(val value: String) : ReadResult()
    data object EndOfFile : ReadResult()
}

fun main() {
    println(ReadResult.Number(1)) // Number(value=1)
    println(ReadResult.Text("Foo")) // Text(value=Foo)
    println(ReadResult.EndOfFile) // EndOfFile
}
```

#### data object を有効にする方法

コード内で data object 宣言を使用するには、`-language-version 1.9` コンパイラオプションを有効にします。Gradle プロジェクトでは、`build.gradle(.kts)` に以下を追加することで有効にできます。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile>().configureEach {
    // ...
    kotlinOptions.languageVersion = "1.9"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
compileKotlin {
    // ...
    kotlinOptions.languageVersion = '1.9'
}
```
</tab>
</tabs>

data object についての詳細を読み、[対応する KEEP ドキュメント](https://github.com/Kotlin/KEEP/pull/316)で実装に関するフィードバックを共有してください。

### ビルダー型推論の新しい制限

Kotlin 1.7.20 では、[ビルダー型推論の使用](using-builders-with-builder-inference.md)に対して、コードに影響を与える可能性のある大きな制限がいくつか課されました。これらの制限は、ビルダーラムダ関数を含むコードに適用され、ラムダ自体を解析せずにパラメーターを導出することが不可能な場合に適用されます。パラメーターが引数として使用されている場合、コンパイラは常にエラーを表示し、型を明示的に指定するように求めます。

これは破壊的変更ですが、私たちの調査ではこれらのケースは非常にまれであり、制限がコードに影響を与えることはほとんどないはずです。もし影響がある場合は、以下のケースを検討してください。

* メンバーを隠す拡張関数を伴うビルダー推論。

  コードに、ビルダー推論中に使用されるのと同じ名前の拡張関数が含まれている場合、コンパイラはエラーを表示します。

    ```kotlin
    class Data {
        fun doSmth() {} // 1
    }
    
    fun <T> T.doSmth() {} // 2
    
    fun test() {
        buildList {
            this.add(Data())
            this.get(0).doSmth() // 2 に解決され、エラーにつながる
        }
    }
    ```
    {validate="false"} 
  
  コードを修正するには、型を明示的に指定する必要があります。

    ```kotlin
    class Data {
        fun doSmth() {} // 1
    }
    
    fun <T> T.doSmth() {} // 2
    
    fun test() {
        buildList<Data> { // 型引数！
            this.add(Data())
            this.get(0).doSmth() // 1 に解決される
        }
    }
    ```

* 複数のラムダがあり、型引数が明示的に指定されていないビルダー推論。

  ビルダー推論に 2 つ以上のラムダブロックがある場合、それらは型に影響を与えます。エラーを防ぐために、コンパイラは型を指定することを要求します。

    ```kotlin
    fun <T: Any> buildList(
        first: MutableList<T>.() -> Unit, 
        second: MutableList<T>.() -> Unit
    ): `List<T>` {
        val list = mutableListOf<T>()
        list.first()
        list.second()
        return list 
    }
    
    fun main() {
        buildList(
            first = { // this: MutableList<String>
                add("")
            },
            second = { // this: MutableList<Int> 
                val i: Int = get(0)
                println(i)
            }
        )
    }
    ```
    {validate="false"}

  エラーを修正するには、型を明示的に指定し、型の不一致を修正する必要があります。

    ```kotlin
    fun main() {
        buildList<Int>(
            first = { // this: MutableList<Int>
                add(0)
            },
            second = { // this: MutableList<Int>
                val i: Int = get(0)
                println(i)
            }
        )
    }
    ```

上記のケースに該当しない場合は、私たちのチームに [問題を報告](https://kotl.in/issue) してください。

このビルダー推論のアップデートに関する詳細は、この [YouTrack イシュー](https://youtrack.jetbrains.com/issue/KT-53797) を参照してください。

## Kotlin/JVM

Kotlin 1.7.20 では、ジェネリックなインラインクラスが導入され、委譲プロパティのバイトコード最適化がさらに追加されました。また、kapt スタブ生成タスクで IR がサポートされ、kapt で最新の Kotlin 機能すべてを使用できるようになりました。

* [ジェネリックなインラインクラス](#generic-inline-classes)
* [委譲プロパティのさらなる最適化ケース](#more-optimized-cases-of-delegated-properties)
* [kapt スタブ生成タスクにおける JVM IR バックエンドのサポート](#support-for-the-jvm-ir-backend-in-kapt-stub-generating-task)

### ジェネリックなインラインクラス

> ジェネリックなインラインクラスは[実験的（Experimental）](components-stability.md#stability-levels-explained)な機能です。
> いつでも削除または変更される可能性があります。オプトインが必要です（詳細は下記参照）。評価目的でのみ使用してください。
> [YouTrack](https://youtrack.jetbrains.com/issue/KT-52994) でのフィードバックをお待ちしております。
>
{style="warning"}

Kotlin 1.7.20 では、JVM インラインクラスの基底型を型パラメーターにできるようになりました。コンパイラはそれを `Any?` に、一般的には型パラメーターの上限（upper bound）にマップします。

<video src="https://www.youtube.com/v/0JRPA0tt9og" title="Generic inline classes in Kotlin 1.7.20"/>

以下の例を考えてみましょう。

```kotlin
@JvmInline
value class UserId<T>(val value: T)

fun compute(s: UserId<String>) {} // コンパイラは fun compute-<hashcode>(s: Any?) を生成
```

この関数はインラインクラスをパラメーターとして受け取ります。パラメーターは型引数ではなく、上限にマップされます。

この機能を有効にするには、`-language-version 1.8` コンパイラオプションを使用します。

この機能に関するフィードバックを [YouTrack](https://youtrack.jetbrains.com/issue/KT-52994) でお待ちしております。

### 委譲プロパティのさらなる最適化ケース

Kotlin 1.6.0 では、プロパティへの委譲において `$delegate` フィールドを省略し、[参照されたプロパティへの直接アクセスを生成する](whatsnew16.md#optimize-delegated-properties-which-call-get-set-on-the-given-kproperty-instance)ことで最適化を行いました。1.7.20 では、この最適化をより多くのケースに実装しました。
デリゲートが以下の場合、`$delegate` フィールドが省略されるようになります。

* 名前付きオブジェクト（named object）：

  ```kotlin
  object NamedObject {
      operator fun getValue(thisRef: Any?, property: KProperty<*>): String = ...
  }
  
  val s: String by NamedObject
  ```
  {validate="false"}

* [バッキングフィールド（backing field）](properties.md#backing-fields)と、同じモジュール内にデフォルトのゲッターを持つ `final val` プロパティ：

  ```kotlin
  val impl: ReadOnlyProperty<Any?, String> = ...
  
  class A {
      val s: String by impl
  }
  ```
  {validate="false"}

* 定数式、列挙型のエントリ、`this`、または `null`。以下は `this` の例です。

  ```kotlin
  class A {
      operator fun getValue(thisRef: Any?, property: KProperty<*>) ...
   
      val s by this
  }
  ```
  {validate="false"}

[委譲プロパティ](delegated-properties.md)についてさらに詳しく学びましょう。

この機能に関するフィードバックを [YouTrack](https://youtrack.jetbrains.com/issue/KT-23397) でお待ちしております。

### kapt スタブ生成タスクにおける JVM IR バックエンドのサポート

> kapt スタブ生成タスクにおける JVM IR バックエンドのサポートは[実験的（Experimental）](components-stability.md)な機能です。
> いつでも変更される可能性があります。オプトインが必要です（詳細は下記参照）。評価目的でのみ使用してください。
>
{style="warning"}

1.7.20 より前は、kapt スタブ生成タスクは古いバックエンドを使用しており、[リピータブル（繰り返し可能）なアノテーション](annotations.md#repeatable-annotations)は [kapt](kapt.md) で動作しませんでした。Kotlin 1.7.20 では、kapt スタブ生成タスクに [JVM IR バックエンド](whatsnew15.md#stable-jvm-ir-backend) のサポートを追加しました。これにより、リピータブルなアノテーションを含む最新の Kotlin 機能をすべて kapt で使用できるようになります。

kapt で IR バックエンドを使用するには、`gradle.properties` ファイルに以下のオプションを追加してください。

```none
kapt.use.jvm.ir=true
```

この機能に関するフィードバックを [YouTrack](https://youtrack.jetbrains.com/issue/KT-49682) でお待ちしております。

## Kotlin/Native

Kotlin 1.7.20 では、新しい Kotlin/Native メモリマネージャーがデフォルトで有効になり、`Info.plist` ファイルをカスタマイズするオプションが提供されます。

* [新しいデフォルトメモリマネージャー](#the-new-kotlin-native-memory-manager-enabled-by-default)
* [Info.plist ファイルのカスタマイズ](#customizing-the-info-plist-file)

### 新しい Kotlin/Native メモリマネージャーがデフォルトで有効に

このリリースでは、新しいメモリマネージャーにさらなる安定性とパフォーマンスの向上がもたらされ、新しいメモリマネージャーを [Beta](components-stability.md) に昇格させることができました。

以前のメモリマネージャーでは、`kotlinx.coroutines` ライブラリの実装に関する問題を含め、並行処理や非同期コードの作成が複雑でした。これは Kotlin Multiplatform Mobile の採用を妨げる要因となっていました。並行処理の制限が、iOS と Android プラットフォーム間での Kotlin コードの共有に問題を引き起こしていたためです。新しいメモリマネージャーは、ついに [Kotlin Multiplatform Mobile を Beta に昇格させる](https://blog.jetbrains.com/kotlin/2022/05/kotlin-multiplatform-mobile-beta-roadmap-update/) 道を切り開きました。

新しいメモリマネージャーはコンパイラキャッシュもサポートしており、コンパイル時間は以前のリリースと同等になっています。新しいメモリマネージャーの利点の詳細については、プレビュー版に関する [オリジナルのブログ投稿](https://blog.jetbrains.com/kotlin/2021/08/try-the-new-kotlin-native-memory-manager-development-preview/) を参照してください。より詳細な技術情報は [ドキュメント](native-memory-manager.md) で確認できます。

#### 設定とセットアップ

Kotlin 1.7.20 以降、新しいメモリマネージャーがデフォルトになります。追加の設定はほとんど必要ありません。

既に手動で有効にしている場合は、`gradle.properties` から `kotlin.native.binary.memoryModel=experimental` オプションを削除するか、`build.gradle(.kts)` ファイルから `binaryOptions["memoryModel"] = "experimental"` を削除できます。

必要であれば、`gradle.properties` の `kotlin.native.binary.memoryModel=strict` オプションを使用して、レガシーメモリマネージャーに戻すことができます。ただし、レガシーメモリマネージャーではコンパイラキャッシュのサポートが利用できなくなったため、コンパイル時間が悪化する可能性があります。

#### フリーズ（Freezing）

新しいメモリマネージャーでは、フリーズは非推奨（deprecated）になりました。レガシーマネージャーでコードを動作させる必要がある場合（レガシーでは依然としてフリーズが必要）を除き、使用しないでください。これは、レガシーメモリマネージャーのサポートを維持する必要があるライブラリの作者や、新しいメモリマネージャーで問題が発生した場合のフォールバックを用意しておきたい開発者にとって役立つ場合があります。

そのような場合、一時的に新しいマネージャーとレガシーマネージャーの両方をサポートすることができます。非推奨の警告を無視するには、以下のいずれかを行ってください。

* 非推奨の API の使用箇所に `@OptIn(FreezingIsDeprecated::class)` を付ける。
* Gradle のすべての Kotlin ソースセットに `languageSettings.optIn("kotlin.native.FreezingIsDeprecated")` を適用する。
* コンパイラフラグ `-opt-in=kotlin.native.FreezingIsDeprecated` を渡す。

#### Swift/Objective-C からの Kotlin 中断関数の呼び出し

新しいメモリマネージャーでも、Swift や Objective-C からメインスレッド以外で Kotlin の `suspend` 関数を呼び出すことには依然として制限がありますが、新しい Gradle オプションでこれを解除できます。

この制限は、もともとレガシーメモリマネージャーにおいて、コードが継続（continuation）を元のスレッドで再開するようにディスパッチする場合のために導入されました。このスレッドがサポートされているイベントループを持っていない場合、タスクは実行されず、コルーチンが再開されることもありませんでした。

特定のケースでは、この制限は不要になりましたが、すべての必要な条件のチェックを簡単に実装することはできません。このため、新しいメモリマネージャーでも制限は維持しつつ、無効にするためのオプションを導入することにしました。これには、`gradle.properties` に以下のオプションを追加します。

```none
kotlin.native.binary.objcExportSuspendFunctionLaunchThreadRestriction=none
```

> `kotlinx.coroutines` の `native-mt` バージョンや、同じ「元のスレッドにディスパッチする」アプローチを持つ他のライブラリを使用している場合は、このオプションを追加しないでください。
>
{style="warning"}

Kotlin チームは、このオプションを実装してくれた [Ahmed El-Helw](https://github.com/ahmedre) 氏に非常に感謝しています。

#### フィードバックをお寄せください

これは私たちのエコシステムにおける重要な変更です。さらなる改善のために、皆様からのフィードバックをお待ちしております。

プロジェクトで新しいメモリマネージャーを試し、[私たちの課題トラッカーである YouTrack でフィードバックを共有してください](https://youtrack.jetbrains.com/issue/KT-48525)。

### Info.plist ファイルのカスタマイズ

フレームワークを生成する際、Kotlin/Native コンパイラは情報プロパティリストファイルである `Info.plist` を生成します。以前は、その内容をカスタマイズするのは面倒でした。Kotlin 1.7.20 では、以下のプロパティを直接設定できるようになりました。

| プロパティ                     | バイナリオプション           |
|------------------------------|----------------------------|
| `CFBundleIdentifier`         | `bundleId`                 |
| `CFBundleShortVersionString` | `bundleShortVersionString` |
| `CFBundleVersion`            | `bundleVersion`            |

これを行うには、対応するバイナリオプションを使用します。コンパイラフラグ `-Xbinary=$option=$value` を渡すか、必要なフレームワークの Gradle DSL で `binaryOption(option, value)` を設定します。

Kotlin チームは、この機能を実装してくれた Mads Ager 氏に非常に感謝しています。

## Kotlin/JS

Kotlin/JS は、開発者のエクスペリエンスを向上させ、パフォーマンスを向上させるいくつかの機能強化を受けました。

* 依存関係の読み込みの効率化により、インクリメンタルビルドとクリーンビルドの両方で Klib の生成が高速化されました。
* [開発用バイナリのインクリメンタルコンパイル](js-ir-compiler.md#incremental-compilation-for-development-binaries) が再構築され、クリーンビルドのシナリオで大幅な改善が見られ、インクリメンタルビルドが高速化され、安定性が向上しました。
* ネストされたオブジェクト、sealed クラス、およびコンストラクタのデフォルト値を持つパラメーターに対する `.d.ts` 生成を改善しました。

## Gradle

Kotlin Gradle プラグインのアップデートは、新しい Gradle 機能および最新の Gradle バージョンとの互換性に焦点を当てています。

Kotlin 1.7.20 には、Gradle 7.1 をサポートするための変更が含まれています。非推奨のメソッドとプロパティが削除または置換されたため、Kotlin Gradle プラグインによって生成される非推奨の警告の数が減り、将来の Gradle 8.0 サポートへの道が開かれました。

ただし、注意が必要ないくつかの破壊的変更の可能性があります。

### ターゲット設定

* `org.jetbrains.kotlin.gradle.dsl.SingleTargetExtension` にジェネリックパラメーター `SingleTargetExtension<T : KotlinTarget>` が追加されました。
* `kotlin.targets.fromPreset()` 規約が非推奨になりました。代わりに `kotlin.targets { fromPreset() }` を引き続き使用できますが、[ターゲットを明示的に設定する](https://kotlinlang.org/docs/multiplatform/multiplatform-discover-project.html#targets) ことを推奨します。
* Gradle によって自動生成されるターゲットアクセサーは、`kotlin.targets { }` ブロック内では利用できなくなりました。代わりに `findByName("targetName")` メソッドを使用してください。

  なお、`kotlin.targets` の場合（例：`kotlin.targets.linuxX64`）、そのようなアクセサーは引き続き利用可能です。

### ソースディレクトリの設定

Kotlin Gradle プラグインは、Kotlin の `SourceDirectorySet` を Java の `SourceSet` グループの `kotlin` 拡張として追加するようになりました。これにより、[Java、Groovy、Scala](https://docs.gradle.org/7.1/release-notes.html#easier-source-set-configuration-in-kotlin-dsl) と同様の方法で、`build.gradle.kts` ファイルでソースディレクトリを設定できるようになりました。

```kotlin
sourceSets {
    main {
        kotlin {
            java.setSrcDirs(listOf("src/java"))
            kotlin.setSrcDirs(listOf("src/kotlin"))
        }
    }
}
```

非推奨となった Gradle の規約を使用して Kotlin のソースディレクトリを指定する必要はもうありません。

`kotlin` 拡張を使用して `KotlinSourceSet` にアクセスすることもできることを覚えておいてください。

```kotlin
kotlin {
    sourceSets {
        main {
        // ...
        }
    }
}
```

### JVM ツールチェーン設定の新しいメソッド

このリリースでは、[JVM ツールチェーン機能](gradle-configure-project.md#gradle-java-toolchains-support) を有効にするための新しい `jvmToolchain()` メソッドが提供されます。`implementation` や `vendor` などの追加の [設定フィールド](https://docs.gradle.org/current/javadoc/org/gradle/jvm/toolchain/JavaToolchainSpec.html) が不要な場合は、Kotlin 拡張からこのメソッドを使用できます。

```kotlin
kotlin {
    jvmToolchain(17)
}
```

これにより、追加の設定なしで Kotlin プロジェクトのセットアッププロセスが簡素化されます。
このリリース以前は、JDK バージョンを以下の方法でしか指定できませんでした。

```kotlin
kotlin {
    jvmToolchain {
        languageVersion.set(JavaLanguageVersion.of(17))
    }
}
```

## 標準ライブラリ

Kotlin 1.7.20 は、ファイルツリーを探索できる `java.nio.file.Path` クラス向けの新しい [拡張関数](extensions.md#extension-functions) を提供します。

* `walk()` は、指定されたパスをルートとするファイルツリーを遅延（lazily）探索します。
* `fileVisitor()` を使用すると、`FileVisitor` を個別に作成できます。`FileVisitor` は、探索中のディレクトリとファイルに対するアクションを定義します。
* `visitFileTree(fileVisitor: FileVisitor, ...)` は、準備された `FileVisitor` を消費し、内部で `java.nio.file.Files.walkFileTree()` を使用します。
* `visitFileTree(..., builderAction: FileVisitorBuilder.() -> Unit)` は、`builderAction` を使用して `FileVisitor` を作成し、`visitFileTree(fileVisitor, ...)` 関数を呼び出します。
* `FileVisitor` の戻り型である `FileVisitResult` は、ファイルの処理を継続するデフォルト値 `CONTINUE` を持ちます。

> `java.nio.file.Path` の新しい拡張関数は[実験的（Experimental）](components-stability.md)です。
> いつでも変更される可能性があります。オプトインが必要です（詳細は下記参照）。評価目的でのみ使用してください。
>
{style="warning"}

これらの新しい拡張関数を使用して、以下のようなことができます。

* `FileVisitor` を明示的に作成して使用する：

  ```kotlin
  val cleanVisitor = fileVisitor {
      onPreVisitDirectory { directory, attributes ->
          // ディレクトリ訪問時のロジック
          FileVisitResult.CONTINUE
      }
  
      onVisitFile { file, attributes ->
          // ファイル訪問時のロジック
          FileVisitResult.CONTINUE
      }
  }
  
  // ここに何らかのロジックが入る可能性があります
  
  projectDirectory.visitFileTree(cleanVisitor)
  ```

* `builderAction` を指定して `FileVisitor` を作成し、すぐに使用する：

  ```kotlin
  projectDirectory.visitFileTree {
  // builderAction の定義:
      onPreVisitDirectory { directory, attributes ->
          // ディレクトリ訪問時のロジック
          FileVisitResult.CONTINUE
      }
  
      onVisitFile { file, attributes ->
          // ファイル訪問時のロジック
          FileVisitResult.CONTINUE
      }
  }
  ```

* `walk()` 関数を使用して、指定されたパスをルートとするファイルツリーを探索する：

  ```kotlin
  @OptIn(kotlin.io.path.ExperimentalPathApi::class)
  fun traverseFileTree() {
      val cleanVisitor = fileVisitor {
          onPreVisitDirectory { directory, _ ->
              if (directory.name == "build") {
                  directory.toFile().deleteRecursively()
                  FileVisitResult.SKIP_SUBTREE
              } else {
                  FileVisitResult.CONTINUE
              }
          }
  
          onVisitFile { file, _ ->
              if (file.extension == "class") {
                  file.deleteExisting()
              }
              FileVisitResult.CONTINUE
          }
      }
  
      val rootDirectory = createTempDirectory("Project")
  
      rootDirectory.resolve("src").let { srcDirectory ->
          srcDirectory.createDirectory()
          srcDirectory.resolve("A.kt").createFile()
          srcDirectory.resolve("A.class").createFile()
      }
  
      rootDirectory.resolve("build").let { buildDirectory ->
          buildDirectory.createDirectory()
          buildDirectory.resolve("Project.jar").createFile()
      }
  
   
  // walk 関数を使用する:
      val directoryStructure = rootDirectory.walk(PathWalkOption.INCLUDE_DIRECTORIES)
          .map { it.relativeTo(rootDirectory).toString() }
          .toList().sorted()
      assertPrints(directoryStructure, "[, build, build/Project.jar, src, src/A.class, src/A.kt]")
  
      rootDirectory.visitFileTree(cleanVisitor)
  
      val directoryStructureAfterClean = rootDirectory.walk(PathWalkOption.INCLUDE_DIRECTORIES)
          .map { it.relativeTo(rootDirectory).toString() }
          .toList().sorted()
      assertPrints(directoryStructureAfterClean, "[, src, src/A.kt]")
  //sampleEnd
  }
  ```

実験的 API の常として、新しい拡張機能にはオプトインが必要です：`@OptIn(kotlin.io.path.ExperimentalPathApi::class)` または `@kotlin.io.path.ExperimentalPathApi`。あるいは、コンパイラオプション `-opt-in=kotlin.io.path.ExperimentalPathApi` を使用できます。

YouTrack での [`walk()` 関数](https://youtrack.jetbrains.com/issue/KT-52909) および [visit 拡張関数](https://youtrack.jetbrains.com/issue/KT-52910) に関するフィードバックをお待ちしております。

## ドキュメントの更新

前回のリリース以降、Kotlin ドキュメントにはいくつかの注目すべき変更がありました。

### 刷新および改善されたページ

* [Basic types overview（基本型の概要）](types-overview.md) – Kotlin で使用される基本型（数値、ブール値、文字、文字列、配列、および符号なし整数）について学べます。
* [IDEs for Kotlin development（Kotlin 開発用 IDE）](kotlin-ide.md) – Kotlin の公式サポートがある IDE と、コミュニティがサポートするプラグインがあるツールのリストを確認できます。

### Kotlin Multiplatform ジャーナルの新しい記事

* [Native and cross-platform app development: how to choose?（ネイティブとクロスプラットフォームのアプリ開発：どちらを選ぶべきか？）](https://kotlinlang.org/docs/multiplatform/native-and-cross-platform.html) – クロスプラットフォームアプリ開発とネイティブアプローチの概要と利点を確認してください。
* [The six best cross-platform app development frameworks（6つの最高のクロスプラットフォームアプリ開発フレームワーク）](https://kotlinlang.org/docs/multiplatform/cross-platform-frameworks.html) – クロスプラットフォームプロジェクトに最適なフレームワークを選択するのに役立つ主要な側面について読んでください。

### 新規および更新されたチュートリアル

* [Get started with Kotlin Multiplatform（Kotlin Multiplatform を使い始める）](https://kotlinlang.org/docs/multiplatform/multiplatform-create-first-app.html) – Kotlin を使用したクロスプラットフォームモバイル開発について学び、Android と iOS の両方で動作するアプリを作成します。
* [Build a web application with React and Kotlin/JS（React と Kotlin/JS で Web アプリケーションを構築する）](js-react.md) – Kotlin の DSL と一般的な React プログラムの機能を探索しながら、ブラウザアプリを作成します。

### リリースドキュメントの変更

リリースごとの推奨 kotlinx ライブラリリストの提供を終了しました。このリストには、Kotlin 自体で推奨およびテストされたバージョンのみが含まれていました。一部のライブラリが互いに依存しており、推奨される Kotlin バージョンとは異なる特別な kotlinx バージョンが必要であることを考慮していませんでした。

プロジェクトで Kotlin のバージョンをアップグレードする際に、どの kotlinx ライブラリバージョンを使用すべきかを明確にするために、ライブラリの相互関係と依存関係に関する情報を提供する方法を検討しています。

## Kotlin 1.7.20 のインストール

[IntelliJ IDEA](https://www.jetbrains.com/idea/download/) 2021.3、2022.1、および 2022.2 は、Kotlin プラグインを 1.7.20 にアップデートすることを自動的に提案します。

> Android Studio Dolphin (213)、Electric Eel (221)、および Flamingo (222) の場合、Kotlin プラグイン 1.7.20 は今後の Android Studio のアップデートで提供されます。
>
{style="note"}

新しいコマンドラインコンパイラは、[GitHub リリースページ](https://github.com/JetBrains/kotlin/releases/tag/v1.7.20) からダウンロード可能です。

### Kotlin 1.7.20 の互換性ガイド

Kotlin 1.7.20 は増分リリースですが、Kotlin 1.7.0 で導入された問題の拡散を制限するために、行わなければならなかった互換性のない変更がいくつかあります。

そのような変更の詳細なリストについては、[Kotlin 1.7.20 互換性ガイド](compatibility-guide-1720.md) を参照してください。