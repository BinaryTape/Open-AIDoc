[//]: # (title: Kotlin 2.1.0 の新機能)

<web-summary>新しい言語機能、Kotlin Multiplatform、JVM、Native、JS、Wasm のアップデート、および Gradle と Maven のビルドツールサポートを網羅した Kotlin 2.1.0 のリリースノートをご覧ください。</web-summary>

_[リリース日: 2024年11月27日](releases.md#release-history)_

Kotlin 2.1.0 がリリースされました！主なハイライトは以下の通りです：

* **プレビュー版の新しい言語機能**: [対象（subject）を持つ `when` におけるガード条件](#guard-conditions-in-when-with-a-subject)、
  [非ローカルな `break` と `continue`](#non-local-break-and-continue)、[マルチダラー文字列補間](#multi-dollar-string-interpolation)。
* **K2 コンパイラのアップデート**: [コンパイラチェックの柔軟性の向上](#extra-compiler-checks) と [kapt 実装の改善](#improved-k2-kapt-implementation)。
* **Kotlin Multiplatform**: [Swift エクスポートの基本サポート](#basic-support-for-swift-export)の導入、
  [コンパイラオプション用の Stable な Gradle DSL](#new-gradle-dsl-for-compiler-options-in-multiplatform-projects-promoted-to-stable) など。
* **Kotlin/Native**: [`iosArm64` のティア 1 への昇格](#iosarm64-promoted-to-tier-1) およびその他のアップデート。
* **Kotlin/Wasm**: [インクリメンタルコンパイルのサポート](#support-for-incremental-compilation)を含む複数のアップデート。
* **Gradle サポート**: [新しいバージョンの Gradle および Android Gradle plugin との互換性の向上](#gradle-improvements)、
  および [Kotlin Gradle plugin API の更新](#new-api-for-kotlin-gradle-plugin-extensions)。
* **ドキュメント**: [Kotlin ドキュメントの大幅な改善](#documentation-updates)。

> Kotlin のリリースサイクルに関する情報は、[Kotlin のリリースプロセス](releases.md)をご覧ください。
>
{style="tip"}

## IDE サポート

2.1.0 をサポートする Kotlin プラグインは、最新の IntelliJ IDEA および Android Studio に同梱されています。
IDE の Kotlin プラグインを更新する必要はありません。
ビルドスクリプト内の Kotlin バージョンを 2.1.0 に変更するだけで利用可能です。

詳細は [新しい Kotlin バージョンへのアップデート](releases.md#update-to-a-new-kotlin-version) をご覧ください。

## 言語

K2 コンパイラを搭載した Kotlin 2.0.0 のリリースの後、JetBrains チームは新しい機能による言語の改善に注力しています。
今回のリリースでは、いくつかの新しい言語デザインの改善を発表できることを嬉しく思います。

これらの機能はプレビューとして利用可能です。ぜひお試しいただき、フィードバックをお寄せください：

* [対象（subject）を持つ `when` におけるガード条件](#guard-conditions-in-when-with-a-subject)
* [非ローカルな `break` と `continue`](#non-local-break-and-continue)
* [マルチダラー文字列補間：文字列リテラル内のドル記号（$）の扱いの改善](#multi-dollar-string-interpolation)

> すべての機能は、K2 モードを有効にした IntelliJ IDEA の最新 2024.3 バージョンで IDE サポートが提供されています。
>
> 詳細は [IntelliJ IDEA 2024.3 のブログ記事](https://blog.jetbrains.com/idea/2024/11/intellij-idea-2024-3/) をご覧ください。
>
{style="tip"}

[Kotlin 言語のデザイン機能と提案の完全なリストを見る](kotlin-language-features-and-proposals.md)。

本リリースでは、以下の言語アップデートも行われています：

* [API 拡張時のオプトイン要求のサポート](#support-for-requiring-opt-in-to-extend-apis)
* [ジェネリック型を持つ関数のオーバーロード解像度の改善](#improved-overload-resolution-for-functions-with-generic-types)
* [sealed クラスを使用した when 式の網羅性チェックの改善](#improved-exhaustiveness-checks-for-when-expressions-with-sealed-classes)

### 対象（subject）を持つ when におけるガード条件

> この機能は [プレビュー版](kotlin-evolution-principles.md#pre-stable-features) であり、
> オプトインが必要です（詳細は後述）。
> 
> [YouTrack](https://youtrack.jetbrains.com/issue/KT-71140) でのフィードバックをお待ちしております。
>
{style="warning"}

2.1.0 からは、対象（subject）を持つ `when` 式または文でガード条件を使用できるようになります。

ガード条件を使用すると、`when` 式のブランチに複数の条件を含めることができ、複雑な制御フローをより明示的かつ簡潔にすると同時に、コード構造をフラットにすることができます。

ブランチにガード条件を含めるには、プライマリ条件の後に `if` で区切って配置します：

```kotlin
sealed interface Animal {
    data class Cat(val mouseHunter: Boolean) : Animal {
        fun feedCat() {}
    }

    data class Dog(val breed: String) : Animal {
        fun feedDog() {}
    }
}

fun feedAnimal(animal: Animal) {
    when (animal) {
        // プライマリ条件のみのブランチ。`animal` が `Dog` の場合に `feedDog()` を呼び出す
        is Animal.Dog -> animal.feedDog()
        // プライマリ条件とガード条件の両方を持つブランチ。`animal` が `Cat` かつ `mouseHunter` ではない場合に `feedCat()` を呼び出す
        is Animal.Cat if !animal.mouseHunter -> animal.feedCat()
        // 上記のどの条件にも一致しない場合、"Unknown animal" を出力する
        else -> println("Unknown animal")
    }
}
```

単一の `when` 式の中で、ガード条件のあるブランチとないブランチを組み合わせることができます。
ガード条件のあるブランチのコードは、プライマリ条件とガード条件の両方が `true` の場合にのみ実行されます。
プライマリ条件が一致しない場合、ガード条件は評価されません。
さらに、ガード条件は `else if` もサポートしています。

プロジェクトでガード条件を有効にするには、コマンドラインで以下のコンパイラオプションを使用します：

```bash
kotlinc -Xwhen-guards main.kt
```

または、Gradle ビルドファイルの `compilerOptions {}` ブロックに追加します：

```kotlin
// build.gradle.kts
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xwhen-guards")
    }
}
```

### 非ローカルな break と continue

> この機能は [プレビュー版](kotlin-evolution-principles.md#pre-stable-features) であり、
> オプトインが必要です（詳細は後述）。
> 
> [YouTrack](https://youtrack.jetbrains.com/issue/KT-1436) でのフィードバックをお待ちしております。
>
{style="warning"}

Kotlin 2.1.0 では、長らく待ち望まれていたもう一つの機能である、非ローカルな `break` と `continue` を使用できる機能のプレビューが追加されました。
この機能により、インライン関数のスコープ内で使用できるツールセットが拡張され、プロジェクト内のボイラープレートコードが削減されます。

以前は、非ローカルな `return` のみが使用可能でした。
今回の更新で、Kotlin は非ローカルな `break` および `continue` [ジャンプ式](returns.md) もサポートするようになりました。
これにより、ループを囲むインライン関数に引数として渡されるラムダ内でこれらを適用できるようになります：

```kotlin
fun processList(elements: List<Int>): Boolean {
    for (element in elements) {
        val variable = element.nullableMethod() ?: run {
            log.warning("Element is null or invalid, continuing...")
            continue
        }
        if (variable == 0) return true // 変数が 0 の場合、true を返す
    }
    return false
}
```

プロジェクトでこの機能を試すには、コマンドラインで `-Xnon-local-break-continue` コンパイラオプションを使用します：

```bash
kotlinc -Xnon-local-break-continue main.kt
```

または、Gradle ビルドファイルの `compilerOptions {}` ブロックに追加します：

```kotlin
// build.gradle.kts
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xnon-local-break-continue")
    }
}
```

将来の Kotlin リリースでこの機能を Stable にする予定です。
非ローカルな `break` および `continue` の使用中に問題が発生した場合は、当社の [イシュートラッカー](https://youtrack.jetbrains.com/issue/KT-1436) に報告してください。

### マルチダラー文字列補間

> この機能は [プレビュー版](kotlin-evolution-principles.md#pre-stable-features) であり、
> オプトインが必要です（詳細は後述）。
> 
> [YouTrack](https://youtrack.jetbrains.com/issue/KT-2425) でのフィードバックをお待ちしております。
>
{style="warning"}

Kotlin 2.1.0 ではマルチダラー文字列補間のサポートが導入され、文字列リテラル内でのドル記号（`$`）の扱いが改善されました。
この機能は、テンプレートエンジン、JSON スキーマ、その他のデータ形式など、複数のドル記号を必要とするコンテキストで役立ちます。

Kotlin の文字列補間では通常 1 つのドル記号を使用します。
しかし、財務データやテンプレートシステムでよく見られるような、文字列内でリテラルのドル記号を使用する場合、`${'$'}` のような回避策が必要でした。
マルチダラー補間機能を有効にすると、補間をトリガーするドル記号の数を構成でき、それより少ない数のドル記号は文字列リテラルとして扱われます。

以下は、マルチダラー文字列を使用してプレースホルダーを含む JSON スキーマの複数行文字列を生成する例です：

```kotlin
val `KClass<*>`.jsonSchema : String
    get() = $"""
    {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "$id": "https://example.com/product.schema.json",
      "$dynamicAnchor": "meta"
      "title": "${simpleName ?: qualifiedName ?: "unknown"}",
      "type": "object"
    }
    """
```

この例では、冒頭の `$` は、補間をトリガーするために **2 つのドル記号**（`$$`）が必要であることを意味します。
これにより、`$schema`、`$id`、および `$dynamicAnchor` が補間マーカーとして解釈されるのを防ぎます。

このアプローチは、プレースホルダーの構文にドル記号を使用するシステムを扱う際に特に役立ちます。

この機能を有効にするには、コマンドラインで以下のコンパイラオプションを使用します：

```bash
kotlinc -Xmulti-dollar-interpolation main.kt
```

または、Gradle ビルドファイルの `compilerOptions {}` ブロックを更新します：

```kotlin
// build.gradle.kts
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xmulti-dollar-interpolation")
    }
}
```

既存のコードで 1 つのドル記号による標準的な文字列補間を使用している場合、変更は不要です。
文字列内でリテラルのドル記号が必要な場合は、いつでも `$` を使用できます。

### API 拡張時のオプトイン要求のサポート

Kotlin 2.1.0 では [`@SubclassOptInRequired`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-subclass-opt-in-required/) アノテーションが導入されました。
これにより、ライブラリの作者は、ユーザーが実験的なインターフェースを実装したり、実験的なクラスを継承したりする前に、明示的なオプトインを要求できるようになります。

この機能は、ライブラリ API が使用するには十分安定しているものの、新しい抽象関数が追加されるなどして進化する可能性があり、継承に関しては不安定である場合に役立ちます。

API 要素にオプトイン要件を追加するには、アノテーションクラスへの参照を指定して `@SubclassOptInRequired` アノテーションを使用します：

```kotlin
@RequiresOptIn(
level = RequiresOptIn.Level.WARNING,
message = "Interfaces in this library are experimental"
)
annotation class UnstableApi()

@SubclassOptInRequired(UnstableApi::class)
interface CoreLibraryApi
```

この例では、`CoreLibraryApi` インターフェースを実装する前に、ユーザーにオプトインを要求します。
ユーザーは以下のようにオプトインできます：

```kotlin
@OptIn(UnstableApi::class)
interface MyImplementation: CoreLibraryApi
```

> `@SubclassOptInRequired` アノテーションを使用してオプトインを要求する場合、その要件は [内部クラスやネストしたクラス](nested-classes.md) には伝播されません。
>
{style="note"}

API で `@SubclassOptInRequired` アノテーションを使用する実例については、`kotlinx.coroutines` ライブラリの [`SharedFlow`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-shared-flow/) インターフェースを確認してください。

### ジェネリック型を持つ関数のオーバーロード解像度の改善

以前は、ある関数のオーバーロードにおいて、一部がジェネリック型の値パラメータを持ち、他が同じ位置に関数型を持っていた場合、解像度の挙動が矛盾することがありました。

これにより、オーバーロードがメンバ関数か拡張関数かによって挙動が異なっていました。例えば：

```kotlin
class KeyValueStore<K, V> {
    fun store(key: K, value: V) {} // 1
    fun store(key: K, lazyValue: () -> V) {} // 2
}

fun <K, V> KeyValueStore<K, V>.storeExtension(key: K, value: V) {} // 1 
fun <K, V> KeyValueStore<K, V>.storeExtension(key: K, lazyValue: () -> V) {} // 2

fun test(kvs: KeyValueStore<String, Int>) {
    // メンバ関数
    kvs.store("", 1)    // 1 に解決される
    kvs.store("") { 1 } // 2 に解決される

    // 拡張関数
    kvs.storeExtension("", 1)    // 1 に解決される
    kvs.storeExtension("") { 1 } // 解決されない
}
```

この例では、`KeyValueStore` クラスに `store()` 関数の 2 つのオーバーロードがあり、一方はジェネリック型 `K` と `V` の関数パラメータを持ち、もう一方はジェネリック型 `V` を返すラムダ関数を持ちます。同様に、拡張関数 `storeExtension()` にも 2 つのオーバーロードがあります。

ラムダ関数の有無で `store()` 関数が呼び出された際、コンパイラは正しくオーバーロードを解決しました。
しかし、拡張関数 `storeExtension()` がラムダ関数を伴って呼び出された際、コンパイラは両方のオーバーロードが適用可能であると誤って判断したため、正しいオーバーロードを解決できませんでした。

この問題を修正するために、新しいヒューリスティックを導入しました。これにより、別の引数からの情報に基づいてジェネリック型の関数パラメータがラムダ関数を受け入れられない場合、コンパイラは候補となるオーバーロードを破棄できるようになります。
この変更によりメンバ関数と拡張関数の挙動が一貫するようになり、Kotlin 2.1.0 ではデフォルトで有効になっています。

### sealed クラスを使用した when 式の網羅性チェックの改善

以前のバージョンの Kotlin では、sealed の上限境界（upper bounds）を持つ型パラメータにおいて、`sealed class` 階層のすべてのケースがカバーされている場合でも、コンパイラは `when` 式に `else` ブランチを要求していました。
この挙動は Kotlin 2.1.0 で対処・改善され、網羅性チェックがより強力になりました。これにより、冗長な `else` ブランチを削除し、`when` 式をよりクリーンで直感的に保つことができます。

変更を示す例は以下の通りです：

```kotlin
sealed class Result
object Error: Result()
class Success(val value: String): Result()

fun <T : Result> render(result: T) = when (result) {
    Error -> "Error!"
    is Success -> result.value
    // else ブランチは不要になりました
}
```

## Kotlin K2 コンパイラ

Kotlin 2.1.0 では、K2 コンパイラが [コンパイラチェックの柔軟な利用](#extra-compiler-checks) や [警告の抑制](#global-warning-suppression) を提供するようになり、[kapt プラグインのサポートも改善](#improved-k2-kapt-implementation) されました。

### 追加のコンパイラチェック

Kotlin 2.1.0 では、K2 コンパイラで追加のチェックを有効にできるようになりました。
これらは通常、コンパイルに不可欠ではない宣言、式、型の追加チェックですが、以下のケースを検証したい場合に有用です：

| チェック型 | コメント |
|-------------------------------------------------------|------------------------------------------------------------------------------------------|
| `REDUNDANT_NULLABLE` | `Boolean?` の代わりに `Boolean??` が使用されている |
| `PLATFORM_CLASS_MAPPED_TO_KOTLIN` | `kotlin.String` の代わりに `java.lang.String` が使用されている |
| `ARRAY_EQUALITY_OPERATOR_CAN_BE_REPLACED_WITH_EQUALS` | `arrayOf("") == arrayOf("")` の代わりに `arrayOf("").contentEquals(arrayOf(""))` が使用されている |
| `REDUNDANT_CALL_OF_CONVERSION_METHOD` | `42.toInt()` の代わりに `42` が使用されている |
| `USELESS_CALL_ON_NOT_NULL` | `"".orEmpty()` の代わりに `""` が使用されている |
| `REDUNDANT_SINGLE_EXPRESSION_STRING_TEMPLATE` | `"$string"` の代わりに `string` が使用されている |
| `UNUSED_ANONYMOUS_PARAMETER` | ラムダ式でパラメータが渡されているが、一度も使用されていない |
| `REDUNDANT_VISIBILITY_MODIFIER` | `class Klass` の代わりに `public class Klass` が使用されている |
| `REDUNDANT_MODALITY_MODIFIER` | `class Klass` の代わりに `final class Klass` が使用されている |
| `REDUNDANT_SETTER_PARAMETER_TYPE` | `set(value: Int)` の代わりに `set(value)` が使用されている |
| `CAN_BE_VAL` | `var local = 0` が定義されているが再代入されておらず、代わりに `val local = 42` にできる |
| `ASSIGNED_VALUE_IS_NEVER_READ` | `val local = 42` が定義されているが、その後のコードで一度も読み取られていない |
| `UNUSED_VARIABLE` | `val local = 0` が定義されているが、コード内で一度も使用されていない |
| `REDUNDANT_RETURN_UNIT_TYPE` | `fun foo(): Unit {}` の代わりに `fun foo() {}` が使用されている |
| `UNREACHABLE_CODE` | コードステートメントが存在するが、決して実行されない |

チェックに該当する場合、問題を修正するための提案を含むコンパイラ警告が表示されます。

追加のチェックはデフォルトで無効になっています。
これらを有効にするには、コマンドラインで `-Wextra` コンパイラオプションを使用するか、Gradle ビルドファイルの `compilerOptions {}` ブロックで `extraWarnings` を指定します：

```kotlin
// build.gradle.kts
kotlin {
    compilerOptions {
        extraWarnings.set(true)
    }
}
```

コンパイラオプションの定義と使用方法についての詳細は、[Kotlin Gradle プラグインにおけるコンパイラオプション](gradle-compiler-options.md) を参照してください。

### グローバルな警告の抑制

2.1.0 では、Kotlin コンパイラに要望の多かった機能である、警告をグローバルに抑制する機能が追加されました。

コマンドラインで `-Xsuppress-warning=WARNING_NAME` 構文を使用するか、ビルドファイルの `compilerOptions {}` ブロックで `freeCompilerArgs` 属性を使用することで、プロジェクト全体で特定の警告を抑制できるようになりました。

例えば、プロジェクトで [追加のコンパイラチェック](#extra-compiler-checks) を有効にしているものの、そのうちの 1 つを抑制したい場合は以下のように記述します：

```kotlin
// build.gradle.kts
kotlin {
    compilerOptions {
        extraWarnings.set(true)
        freeCompilerArgs.add("-Xsuppress-warning=CAN_BE_VAL")
    }
}
```

警告の名前がわからない場合は、対象の要素を選択して電球アイコンをクリックする（または <shortcut>Cmd + Enter</shortcut>/<shortcut>Alt + Enter</shortcut> を使用する）ことで確認できます：

![Warning name intention](warning-name-intention.png){width=500}

この新しいコンパイラオプションは現在 [Experimental](components-stability.md#stability-levels-explained) です。
また、以下の詳細にも注意してください：

* エラーの抑制は許可されていません。
* 不明な警告名を渡すと、コンパイルエラーになります。
* 複数の警告を一度に指定できます：
  
   <tabs>
   <tab title="コマンドライン">

   ```bash
   kotlinc -Xsuppress-warning=NOTHING_TO_INLINE -Xsuppress-warning=NO_TAIL_CALLS_FOUND main.kt
   ```

   </tab>
   <tab title="ビルドファイル">

   ```kotlin
   // build.gradle.kts
   kotlin {
       compilerOptions {
           freeCompilerArgs.addAll(
               listOf(
                   "-Xsuppress-warning=NOTHING_TO_INLINE",
                   "-Xsuppress-warning=NO_TAIL_CALLS_FOUND"
               )
           )
       }
   }
   ```

   </tab>
   </tabs>

### Improved K2 kapt 実装

> K2 コンパイラ用の kapt プラグイン (K2 kapt) は [Alpha](components-stability.md#stability-levels-explained) 段階にあります。
> 内容は随時変更される可能性があります。
> 
> [YouTrack](https://youtrack.jetbrains.com/issue/KT-71439/K2-kapt-feedback) でのフィードバックをお待ちしております。
>
{style="warning"}

現在、[kapt](kapt.md) プラグインを使用しているプロジェクトはデフォルトで K1 コンパイラで動作し、Kotlin バージョン 1.9 までをサポートしています。

Kotlin 1.9.20 では、K2 コンパイラを用いた kapt プラグインの実験的実装（K2 kapt）をリリースしました。
今回、技術的およびパフォーマンス上の問題を軽減するために、K2 kapt の内部実装を改善しました。

新しい K2 kapt 実装に新機能は追加されていませんが、以前の K2 kapt 実装と比較してパフォーマンスが大幅に向上しています。
さらに、K2 kapt プラグインの挙動は K1 kapt に非常に近くなっています。

新しい K2 kapt プラグイン実装を使用するには、以前の K2 kapt プラグインと同様に有効化します。
プロジェクトの `gradle.properties` ファイルに以下のオプションを追加してください：

```kotlin
kapt.use.k2=true
```

今後のリリースでは、K1 kapt に代わって K2 kapt 実装がデフォルトで有効になる予定です。そのため、手動で有効にする必要はなくなります。

新しい実装が安定する前に、皆さまからの [フィードバック](https://youtrack.jetbrains.com/issue/KT-71439/K2-kapt-feedback) をいただけますと幸いです。

### 符号なし型と非プリミティブ型間のオーバーロード衝突の解決

このリリースでは、符号なし型と非プリミティブ型に対して関数がオーバーロードされた場合に、以前のバージョンで発生していたオーバーロード衝突の解決の問題に対処しました。以下のような例が該当します：

#### オーバーロードされた拡張関数

```kotlin
fun Any.doStuff() = "Any"
fun UByte.doStuff() = "UByte"

fun main() {
    val uByte: UByte = UByte.MIN_VALUE
    uByte.doStuff() // Kotlin 2.1.0 より前ではオーバーロード解像度の曖昧さが発生
}
```

以前のバージョンでは、`Any` と `UByte` の両方の拡張が適用可能であったため、`uByte.doStuff()` の呼び出しで曖昧さが発生していました。

#### オーバーロードされたトップレベル関数

```kotlin
fun doStuff(value: Any) = "Any"
fun doStuff(value: UByte) = "UByte"

fun main() {
    val uByte: UByte = UByte.MIN_VALUE
    doStuff(uByte) // Kotlin 2.1.0 より前ではオーバーロード解像度の曖昧さが発生
}
```

同様に、コンパイラが `Any` バージョンと `UByte` バージョンのどちらを使用すべきか判断できなかったため、`doStuff(uByte)` の呼び出しは曖昧でした。
2.1.0 では、コンパイラはこれらのケースを正しく処理し、より具体的な型（この場合は `UByte`）を優先することで曖昧さを解決するようになりました。

## Kotlin/JVM

バージョン 2.1.0 から、コンパイラは Java 23 バイトコードを含むクラスを生成できるようになりました。

### JSpecify Nullability ミスマッチ診断の厳格モードへの変更

Kotlin 2.1.0 では、`org.jspecify.annotations` からの Nullability アノテーションの処理が厳格化され、Java 相互運用における型安全性が向上しました。

以下の Nullability アノテーションが影響を受けます：

* `org.jspecify.annotations.Nullable`
* `org.jspecify.annotations.NonNull`
* `org.jspecify.annotations.NullMarked`
* `org.jspecify.nullness` にあるレガシーアノテーション (JSpecify 0.2 以前)

Kotlin 2.1.0 から、Nullability のミスマッチはデフォルトで警告からエラーに引き上げられました。これにより、`@NonNull` や `@Nullable` などのアノテーションが型チェック中に強制され、実行時の予期しない Nullability の問題を防ぎます。

また、`@NullMarked` アノテーションはそのスコープ内のすべてのメンバの Nullability に影響を与え、アノテーションが付与された Java コードを扱う際の挙動がより予測可能になります。

新しいデフォルトの挙動を示す例は以下の通りです：

```java
// Java
import org.jspecify.annotations.*;
public class SomeJavaClass {
    @NonNull
    public String foo() { //...
    }

    @Nullable
    public String bar() { //...
    }
}
```

```kotlin
// Kotlin
fun test(sjc: SomeJavaClass) {
    // Non-null の結果にアクセス。これは許可されます
    sjc.foo().length

    // デフォルトの厳格モードでは、結果が Nullable であるためエラーが発生します
    // エラーを避けるには、代わりに ?.length を使用してください
    sjc.bar().length
}
```

これらのアノテーションの診断の重要度は手動で制御できます。
その場合は、`-Xnullability-annotations` コンパイラオプションを使用してモードを選択します：

* `ignore`: Nullability のミスマッチを無視します。
* `warning`: Nullability のミスマッチに対して警告を報告します。
* `strict`: Nullability のミスマッチに対してエラーを報告します（デフォルト）。

詳細は [Nullability アノテーション](java-interop.md#nullability-annotations) を参照してください。

## Kotlin Multiplatform

Kotlin 2.1.0 では、[Swift エクスポートの基本サポート](#basic-support-for-swift-export) が導入され、[Kotlin Multiplatform ライブラリの公開がより簡単に](#ability-to-publish-kotlin-libraries-from-any-host) なりました。
また、Gradle 周辺の改善にも注力しており、[コンパイラオプションを設定するための新しい DSL](#new-gradle-dsl-for-compiler-options-in-multiplatform-projects-promoted-to-stable) を Stable にし、[Isolated Projects 機能のプレビュー](#preview-gradle-s-isolated-projects-in-kotlin-multiplatform) を導入しました。

### マルチプラットフォームプロジェクトにおけるコンパイラオプション用の新しい Gradle DSL が Stable に昇格

Kotlin 2.0.0 では、マルチプラットフォームプロジェクト全体でコンパイラオプションの構成を簡素化するために、[新しい実験的な Gradle DSL を導入しました](whatsnew20.md#new-gradle-dsl-for-compiler-options-in-multiplatform-projects)。
Kotlin 2.1.0 では、この DSL が Stable に昇格しました。

プロジェクト全体の構成は、3 つのレイヤーに分かれています。最高位がエクステンションレベル、次がターゲットレベル、そして最低位がコンパイルユニット（通常はコンパイルタスク）です：

![Kotlin コンパイラオプションのレベル](compiler-options-levels.svg){width=700}

異なるレベルの詳細や、レベル間でコンパイラオプションを構成する方法については、[コンパイラオプション](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#compiler-options) を参照してください。

### Kotlin Multiplatform における Gradle の Isolated Projects のプレビュー

> この機能は [Experimental](components-stability.md#stability-levels-explained) であり、現在 Gradle ではプレ Alpha 段階にあります。
> Gradle バージョン 8.10 でのみ使用し、評価目的のみに留めてください。この機能は、随時廃止または変更される可能性があります。
> 
> [YouTrack](https://youtrack.jetbrains.com/issue/KT-57279/Support-Gradle-Project-Isolation-Feature-for-Kotlin-Multiplatform) でのフィードバックをお待ちしております。
> オプトインが必要です（詳細は後述）。
>
{style="warning"}

Kotlin 2.1.0 では、マルチプラットフォームプロジェクトで Gradle の [Isolated Projects](https://docs.gradle.org/current/userguide/isolated_projects.html) 機能のプレビューが可能です。

Gradle の Isolated Projects 機能は、個々の Gradle プロジェクトの構成を互いに「隔離（アイソレート）」することで、ビルドパフォーマンスを向上させます。
各プロジェクトのビルドロジックは他のプロジェクトの可変状態への直接アクセスが制限され、安全な並列実行が可能になります。
この機能をサポートするために、Kotlin Gradle プラグインのモデルにいくつかの変更を加えました。このプレビュー期間中の皆さまの体験談をお待ちしております。

Kotlin Gradle プラグインの新しいモデルを有効にするには、2 つの方法があります：

* 方法 1: **Isolated Projects を有効にせずに互換性をテストする** –
  Isolated Projects 機能を有効にせずに、Kotlin Gradle プラグインの新しいモデルとの互換性を確認するには、プロジェクトの `gradle.properties` ファイルに以下の Gradle プロパティを追加します：

  ```none
  # gradle.properties
  kotlin.kmp.isolated-projects.support=enable
  ```

* 方法 2: **Isolated Projects を有効にしてテストする** –
  Gradle で Isolated Projects 機能を有効にすると、Kotlin Gradle プラグインは自動的に新しいモデルを使用するように構成されます。
  Isolated Projects 機能を有効にするには、[システムプロパティを設定](https://docs.gradle.org/current/userguide/isolated_projects.html#how_do_i_use_it) してください。この場合、プロジェクトに Kotlin Gradle プラグイン用の Gradle プロパティを追加する必要はありません。

### Swift エクスポートの基本サポート

> この機能は現在開発の初期段階にあります。随時廃止または変更される可能性があります。
> オプトインが必要であり（詳細は後述）、評価目的のみに使用してください。
> [YouTrack](https://kotl.in/issue) でのフィードバックをお待ちしております。
> 
{style="warning"}

バージョン 2.1.0 では、Kotlin における Swift エクスポートをサポートするための第一歩を踏み出しました。これにより、Objective-C ヘッダーを使用せずに、Kotlin ソースを Swift インターフェースに直接エクスポートできるようになります。
これにより、Apple ターゲット向けのマルチプラットフォーム開発がより容易になります。

現在の基本サポートには、以下の機能が含まれています：

* 複数の Gradle モジュールを Kotlin から Swift へ直接エクスポートする機能。
* `moduleName` プロパティによるカスタム Swift モジュール名の定義。
* `flattenPackage` プロパティによるパッケージ構造の集約ルールの設定。

プロジェクトで Swift エクスポートを設定するための開始点として、以下のビルドファイルを使用できます：

```kotlin
// build.gradle.kts 
kotlin {

    iosX64()
    iosArm64()
    iosSimulatorArm64()

    @OptIn(ExperimentalSwiftExportDsl::class)
    swiftExport {
        // ルートモジュール名
        moduleName = "Shared"

        // 集約ルール
        // 生成された Swift コードからパッケージプレフィックスを削除する
        flattenPackage = "com.example.sandbox"

        // 外部モジュールをエクスポート
        export(project(":subproject")) {
            // エクスポートされたモジュール名
            moduleName = "Subproject"
            // エクスポートされた依存関係の集約ルール
            flattenPackage = "com.subproject.library"
        }
    }
}
```

Swift エクスポートがすでに設定されている [公開サンプル](https://github.com/Kotlin/swift-export-sample) をクローンすることも可能です。

コンパイラは、必要なすべてのファイル（`swiftmodule` ファイル、静的 `a` ライブラリ、ヘッダーおよび `modulemap` ファイルを含む）を自動的に生成し、アプリのビルドディレクトリにコピーします。これには Xcode からアクセス可能です。

#### Swift エクスポートを有効にする方法

この機能は現在開発の初期段階にあることに留意してください。

Swift エクスポートは現在、iOS フレームワークを Xcode プロジェクトに接続するために [直接統合 (direct integration)](https://kotlinlang.org/docs/multiplatform/multiplatform-direct-integration.html) を使用しているプロジェクトで動作します。
これは、Android Studio または [Web ウィザード](https://kmp.jetbrains.com/) で作成された Kotlin Multiplatform プロジェクトの標準的な構成です。

プロジェクトで Swift エクスポートを試すには：

1. `gradle.properties` ファイルに以下の Gradle オプションを追加します：

   ```none
   # gradle.properties
   kotlin.experimental.swift-export.enabled=true
   ```

2. Xcode でプロジェクト設定を開きます。
3. **Build Phases** タブで、`embedAndSignAppleFrameworkForXcode` タスクを含む **Run Script** フェーズを探します。
4. スクリプトを調整し、代わりに `embedSwiftExportForXcode` タスクを Run Script フェーズで実行するようにします：

   ```bash
   ./gradlew :<Shared モジュール名>:embedSwiftExportForXcode
   ```

   ![Swift エクスポートスクリプトの追加](xcode-swift-export-run-script-phase.png){width=700}

#### Swift エクスポートに関するフィードバック

将来の Kotlin リリースで、Swift エクスポートのサポートを拡張し、安定させる予定です。
[こちらの YouTrack イシュー](https://youtrack.jetbrains.com/issue/KT-64572) にフィードバックをお寄せください。

### あらゆるホストからの Kotlin ライブラリの公開機能

> この機能は現在 [Experimental](components-stability.md#stability-levels-explained) です。
> オプトインが必要であり（詳細は後述）、評価目的のみに使用してください。
> [YouTrack](https://youtrack.jetbrains.com/issue/KT-71290) でのフィードバックをお待ちしております。
>
{style="warning"}

Kotlin コンパイラは、Kotlin ライブラリを公開するために `.klib` アーティファクトを生成します。
以前は、Mac を必要とする Apple プラットフォームターゲットを除き、どのホストからも必要なアーティファクトを取得できました。
これにより、iOS、macOS、tvOS、および watchOS ターゲットを対象とする Kotlin Multiplatform プロジェクトに特別な制約が課されていました。

Kotlin 2.1.0 ではこの制限を撤廃し、クロスコンパイルのサポートを追加しました。
現在、[サポートされている任意のホスト](native-target-support.md#hosts) を使用して `.klib` アーティファクトを生成できるようになり、Kotlin および Kotlin Multiplatform ライブラリの公開プロセスが大幅に簡素化されます。

#### あらゆるホストからのライブラリ公開を有効にする方法

プロジェクトでクロスコンパイルを試すには、`gradle.properties` ファイルに以下のバイナリオプションを追加します：

```none
# gradle.properties
kotlin.native.enableKlibsCrossCompilation=true
```

この機能は現在実験的であり、いくつかの制限があります。以下の場合は依然として Mac を使用する必要があります：

* ライブラリに [cinterop 依存関係](native-c-interop.md) がある場合。
* プロジェクトに [CocoaPods 統合](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-overview.html) が設定されている場合。
* Apple ターゲット向けの [最終バイナリ](https://kotlinlang.org/docs/multiplatform/multiplatform-build-native-binaries.html) をビルドまたはテストする必要がある場合。

#### ライブラリ公開に関するフィードバック

将来の Kotlin リリースで、この機能を安定させ、ライブラリ公開をさらに改善する予定です。
当社のイシュートラッカー [YouTrack](https://youtrack.jetbrains.com/issue/KT-71290) にフィードバックをお寄せください。

詳細は [マルチプラットフォームライブラリの公開](https://kotlinlang.org/docs/multiplatform/multiplatform-publish-lib-setup.html) を参照してください。

### 非パック型（non-packed）klib のサポート

Kotlin 2.1.0 では、非パック型の `.klib` ファイルアーティファクトを生成できるようになりました。
これにより、klib を最初に解凍することなく、直接依存関係を構成するオプションが得られます。

この変更により、Kotlin/Wasm、Kotlin/JS、および Kotlin/Native プロジェクトにおけるコンパイル時間とリンク時間が短縮され、パフォーマンスが向上する可能性もあります。

例えば、当社のベンチマークでは、1 つのリンクタスクと 10 個のコンパイルタスクを持つプロジェクト（9 つの簡略化されたプロジェクトに依存する単一のネイティブ実行バイナリをビルド）において、総ビルド時間が約 3% 改善されました。ただし、ビルド時間への実際の影響は、サブプロジェクトの数とそのサイズの両方に依存します。

#### プロジェクトの設定方法

デフォルトでは、Kotlin のコンパイルおよびリンクタスクは新しい非パック型アーティファクトを使用するように構成されています。

klib を解決するためのカスタムビルドロジックを設定しており、新しい解凍済みアーティファクトを使用したい場合は、Gradle ビルドファイルで優先する klib パッケージ解決バリアントを明示的に指定する必要があります：

```kotlin
// build.gradle.kts
import org.jetbrains.kotlin.gradle.plugin.attributes.KlibPackaging
// ...
val resolvableConfiguration = configurations.resolvable("resolvable") {

    // 新しい非パック型（non-packed）構成の場合:
    attributes.attribute(KlibPackaging.ATTRIBUTE, project.objects.named(KlibPackaging.NON_PACKED))

    // 以前のパック型（packed）構成の場合:
    attributes.attribute(KlibPackaging.ATTRIBUTE, project.objects.named(KlibPackaging.PACKED))
}
```

非パック型の `.klib` ファイルは、以前のパック型と同じプロジェクトのビルドディレクトリ内のパスに生成されます。
一方で、パック型 klib は `build/libs` ディレクトリに配置されるようになりました。

属性が指定されていない場合は、パック型バリアントが使用されます。
利用可能な属性とバリアントのリストは、以下のコンソールコマンドで確認できます：

```shell
./gradlew outgoingVariants
```

この機能に関するフィードバックを [YouTrack](https://kotl.in/issue) でお待ちしております。

### 旧 `android` ターゲットのさらなる非推奨化

Kotlin 2.1.0 では、旧 `android` ターゲット名に対する非推奨警告がエラーに引き上げられました。

Android をターゲットとする Kotlin Multiplatform プロジェクトでは `androidTarget` オプションを使用することを推奨しています。
これは、Google から提供される予定の新しい Android/KMP プラグインのために `android` という名前を空けておくための一時的な措置です。

新しいプラグインが利用可能になった際に、さらなる移行手順を提供します。
Google からの新しい DSL が、Kotlin Multiplatform における Android ターゲットサポートの推奨オプションとなります。

詳細は、[Kotlin Multiplatform 互換性ガイド](https://kotlinlang.org/docs/multiplatform/multiplatform-compatibility-guide.html#rename-of-android-target-to-androidtarget) を参照してください。

### 同一タイプの複数ターゲット宣言のサポート廃止

Kotlin 2.1.0 より前は、マルチプラットフォームプロジェクトにおいて同一タイプのターゲットを複数宣言することが可能でした。
しかし、これによりターゲットの区別が難しくなり、共有ソースセットを効果的にサポートすることも困難になっていました。
ほとんどの場合、個別の Gradle プロジェクトを使用するなどのよりシンプルな構成の方がうまく機能します。
移行方法の詳細と例については、Kotlin Multiplatform 互換性ガイドの [同様のターゲットを複数宣言する](https://kotlinlang.org/docs/multiplatform/multiplatform-compatibility-guide.html#declaring-several-similar-targets) を参照してください。

Kotlin 1.9.20 では、同一タイプのターゲットを複数宣言した場合に非推奨警告が表示されていました。
Kotlin 2.1.0 では、この非推奨警告が Kotlin/JS 以外のすべてのターゲットでエラーとなりました。
Kotlin/JS ターゲットが除外されている理由については、[YouTrack のこちらのイシュー](https://youtrack.jetbrains.com/issue/KT-47038/KJS-MPP-Split-JS-target-into-JsBrowser-and-JsNode) を参照してください。

## Kotlin/Native

Kotlin 2.1.0 では、[`iosArm64` ターゲットサポートのアップグレード](#iosarm64-promoted-to-tier-1)、[cinterop キャッシュプロセスの改善](#changes-to-caching-in-cinterop)、およびその他の更新が含まれています。

### iosArm64 がティア 1 に昇格

[Kotlin Multiplatform](https://kotlinlang.org/docs/multiplatform/get-started.html) 開発において極めて重要な `iosArm64` ターゲットが、ティア 1 に昇格しました。これは Kotlin/Native コンパイラにおける最高レベルのサポートです。

これは、ターゲットが CI パイプラインで定期的にテストされ、コンパイルおよび実行が可能であることを保証します。また、このターゲットについては、コンパイラリリース間でのソースおよびバイナリ互換性も提供されます。

ターゲットティアの詳細は、[Kotlin/Native ターゲットサポート](native-target-support.md) を参照してください。

### LLVM を 11.1.0 から 16.0.0 へアップデート

Kotlin 2.1.0 では、LLVM をバージョン 11.1.0 から 16.0.0 にアップデートしました。
新しいバージョンにはバグ修正とセキュリティアップデートが含まれています。
特定のケースでは、コンパイラの最適化やコンパイル速度の向上も提供されます。

プロジェクトに Linux ターゲットがある場合は、Kotlin/Native コンパイラがすべての Linux ターゲットでデフォルトで `lld` リンカーを使用するようになったことに注意してください。

このアップデートがコードに影響を与えることはないはずですが、問題が発生した場合は [イシュートラッカー](http://kotl.in/issue) に報告してください。

### cinterop におけるキャッシュの変更

Kotlin 2.1.0 では、cinterop のキャッシュプロセスに変更を加えています。
[`CacheableTask`](https://docs.gradle.org/current/javadoc/org/gradle/api/tasks/CacheableTask.html) アノテーションタイプは使用されなくなりました。
新しい推奨される方法は、[`cacheIf`](https://docs.gradle.org/current/kotlin-dsl/gradle/org.gradle.api.tasks/-task-outputs/cache-if.html) 出力タイプを使用してタスクの結果をキャッシュすることです。

これにより、[定義ファイル](native-definition-file.md) で指定されたヘッダーファイルへの変更を `UP-TO-DATE` チェックが検出できず、ビルドシステムがコードを再コンパイルしないという問題が解決されるはずです。

### mimalloc メモリアロケータの非推奨化

Kotlin 1.9.0 で新しいメモリアロケータを導入し、Kotlin 1.9.20 でそれをデフォルトとして有効にしました。
新しいアロケータは、ガベージコレクションをより効率的にし、Kotlin/Native メモリマネージャのランタイムパフォーマンスを向上させるように設計されています。

新しいメモリアロケータは、以前のデフォルトアロケータであった [mimalloc](https://github.com/microsoft/mimalloc) を置き換えました。
そして今回、Kotlin/Native コンパイラにおいて mimalloc を非推奨とする段階に至りました。

ビルドスクリプトから `-Xallocator=mimalloc` コンパイラオプションを削除できます。
問題が発生した場合は、[イシュートラッカー](http://kotl.in/issue) に報告してください。

Kotlin におけるメモリアロケータとガベージコレクションの詳細は、[Kotlin/Native メモリ管理](native-memory-manager.md) を参照してください。

## Kotlin/Wasm

Kotlin/Wasm では、[インクリメンタルコンパイルのサポート](#support-for-incremental-compilation) を含む複数のアップデートが行われました。

### インクリメンタルコンパイルのサポート

以前は、Kotlin コードに変更を加えた際、Kotlin/Wasm ツールチェーンはコードベース全体を再コンパイルする必要がありました。

2.1.0 から、Wasm ターゲットにおいてインクリメンタルコンパイルがサポートされます。
開発タスクにおいて、コンパイラは前回のコンパイルからの変更に関連するファイルのみを再コンパイルするようになり、コンパイル時間が著しく短縮されます。

この変更により、現在コンパイル速度は 2 倍になっており、今後のリリースでさらなる改善を計画しています。

現在の設定では、Wasm ターゲットのインクリメンタルコンパイルはデフォルトで無効になっています。
インクリメンタルコンパイルを有効にするには、プロジェクトの `local.properties` または `gradle.properties` ファイルに以下の行を追加してください：

```none
# gradle.properties
kotlin.incremental.wasm=true
```

Kotlin/Wasm のインクリメンタルコンパイルを試し、[フィードバックを共有してください](https://youtrack.jetbrains.com/issue/KT-72158/Kotlin-Wasm-incremental-compilation-feedback)。
皆さまの知見は、この機能を Stable にし、より早くデフォルトで有効にするための助けとなります。

### Browser API が kotlinx-browser スタンドアロンライブラリに移動

以前は、Web API および関連ターゲットのユーティリティの宣言は Kotlin/Wasm 標準ライブラリの一部でした。

本リリースでは、`org.w3c.*` の宣言が Kotlin/Wasm 標準ライブラリから新しい [kotlinx-browser ライブラリ](https://github.com/kotlin/kotlinx-browser) に移動されました。
このライブラリには、`org.khronos.webgl`、`kotlin.dom`、`kotlinx.browser` など、他の Web 関連パッケージも含まれています。

この分離によりモジュール性が提供され、Kotlin のリリースサイクル外で Web 関連 API を独立して更新できるようになります。
また、Kotlin/Wasm 標準ライブラリには、あらゆる JavaScript 環境で利用可能な宣言のみが含まれるようになります。

移動されたパッケージの宣言を使用するには、プロジェクトのビルド構成ファイルに `kotlinx-browser` の依存関係を追加する必要があります：

```kotlin
// build.gradle.kts
val wasmJsMain by getting {
    dependencies {
        implementation("org.jetbrains.kotlinx:kotlinx-browser:0.3")
    }
}
```

### Kotlin/Wasm のデバッグ体験の向上

以前、Web ブラウザで Kotlin/Wasm コードをデバッグする際、デバッグインターフェースで変数プロパティが低レベルな表現で表示されることがありました。
これにより、アプリケーションの現在の状態を追跡するのが困難な場合がよくありました。

![Kotlin/Wasm old debugger](wasm-old-debugger.png){width=700}

この体験を改善するために、変数ビューにカスタムフォーマッタが追加されました。
この実装には、Firefox や Chromium ベースの主要なブラウザでサポートされている [custom formatters API](https://firefox-source-docs.mozilla.org/devtools-user/custom_formatters/index.html) が使用されています。

この変更により、変数の値をよりユーザーフレンドリーで理解しやすい方法で表示・検索できるようになりました。

![Kotlin/Wasm improved debugger](wasm-debugger-improved.png){width=700}

新しいデバッグ体験を試すには：

1. `wasmJs {}` のコンパイラオプションに以下のオプションを追加します：

   ```kotlin
   // build.gradle.kts
   kotlin {
       wasmJs {
           // ...
   
           compilerOptions {
               freeCompilerArgs.add("-Xwasm-debugger-custom-formatters")
           }
       }
   }
   ```

2. ブラウザでカスタムフォーマッタを有効にします：

   * Chrome DevTools の場合、**Settings | Preferences | Console** から設定可能です：

     ![Enable custom formatters in Chrome](wasm-custom-formatters-chrome.png){width=700}

   * Firefox DevTools の場合、**Settings | Advanced settings** から設定可能です：

     ![Enable custom formatters in Firefox](wasm-custom-formatters-firefox.png){width=700}

### Kotlin/Wasm バイナリサイズの削減

本番ビルドで生成される Wasm バイナリのサイズが最大 30% 削減され、パフォーマンスの向上も見られる場合があります。
これは、`--closed-world`、`--type-ssa`、`--type-merging` の Binaryen オプションがすべての Kotlin/Wasm プロジェクトで安全に使用できると判断され、デフォルトで有効になったためです。

### Kotlin/Wasm における JavaScript 配列の相互運用性の向上

Kotlin/Wasm の標準ライブラリは JavaScript 配列用に `JsArray<T>` 型を提供していますが、`JsArray<T>` を Kotlin ネイティブの `Array` や `List` 型に変換する直接的なメソッドがありませんでした。

この欠落により、配列変換のためのカスタム関数を作成する必要があり、Kotlin と JavaScript コード間の相互運用性が複雑になっていました。

本リリースでは、`JsArray<T>` を `Array<T>` に、またはその逆へ自動的に変換するアダプター関数が導入され、配列操作が簡素化されました。

以下は、ジェネリック型（Kotlin の `List<T>` および `Array<T>` と JavaScript の `JsArray<T>`）間の変換例です。

```kotlin
val list: `List<JsString>` =
    listOf("Kotlin", "Wasm").map { it.toJsString() }

// .toJsArray() を使用して List または Array を JsArray に変換
val jsArray: JsArray<JsString> = list.toJsArray()

// .toArray() および .toList() を使用して Kotlin 型に戻す 
val kotlinArray: `Array<JsString>` = jsArray.toArray()
val kotlinList: `List<JsString>` = jsArray.toList()
```

型付き配列を対応する Kotlin 型に変換するための同様のメソッドも利用可能です（例: `IntArray` と `Int32Array`）。詳細な情報と実装については、[`kotlinx-browser` リポジトリ](https://github.com/Kotlin/kotlinx-browser/blob/dfbdceed314567983c98f1d66e8c2e10d99c5a55/src/wasmJsMain/kotlin/arrayCopy.kt) を参照してください。

以下は、型付き配列（Kotlin の `IntArray` と JavaScript の `Int32Array`）間の変換例です。

```kotlin
import org.khronos.webgl.*

    // ...

    val intArray: IntArray = intArrayOf(1, 2, 3)
    
    // .toInt32Array() を使用して Kotlin の IntArray を JavaScript の Int32Array に変換
    val jsInt32Array: Int32Array = intArray.toInt32Array()
    
    // .toIntArray() を使用して JavaScript の Int32Array を Kotlin の IntArray に戻す
    val kotlinIntArray: IntArray = jsInt32Array.toIntArray()
```

### Kotlin/Wasm における JavaScript 例外詳細へのアクセスのサポート

以前、Kotlin/Wasm で JavaScript の例外が発生した際、`JsException` 型は元の JavaScript エラーからの詳細情報を含まない汎用的なメッセージのみを提供していました。

Kotlin 2.1.0 から、特定のコンパイラオプションを有効にすることで、`JsException` に元のエラーメッセージとスタックトレースを含めるように構成できるようになりました。これにより、JavaScript に起因する問題を診断するためのより多くのコンテキストが得られます。

この挙動は、特定のブラウザでのみ利用可能な `WebAssembly.JSTag` API に依存します：

* **Chrome**: バージョン 115 以降でサポート
* **Firefox**: バージョン 129 以降でサポート
* **Safari**: 未サポート

デフォルトで無効になっているこの機能を有効にするには、`build.gradle.kts` ファイルに以下のコンパイラオプションを追加してください：

```kotlin
// build.gradle.kts
kotlin {
    wasmJs {
        compilerOptions {
            freeCompilerArgs.add("-Xwasm-attach-js-exception")
        }
    }
}
```

新しい挙動を示す例は以下の通りです：

```kotlin
external object JSON {
    fun <T: JsAny> parse(json: String): T
}

fun main() {
    try {
        JSON.parse("an invalid JSON")
    } catch (e: JsException) {
        println("Thrown value is: ${e.thrownValue}")
        // Thrown value is: SyntaxError: Unexpected token 'a', "an invalid JSON" is not valid JSON

        println("Message: ${e.message}")
        // Message: Unexpected token 'a', "an invalid JSON" is not valid JSON

        println("Stacktrace:")
        // Stacktrace:

        // JavaScript のフルスタックトレースを出力 
        e.printStackTrace()
    }
}
```

`-Xwasm-attach-js-exception` オプションが有効な場合、`JsException` は JavaScript エラーからの具体的な詳細を提供します。オプションがない場合、`JsException` は JavaScript コードの実行中に例外がスローされたことを示す汎用的なメッセージのみを含みます。

### デフォルトエクスポートの廃止

名前付きエクスポートへの移行の一環として、以前は JavaScript で Kotlin/Wasm エクスポートに対してデフォルトインポートが使用された際、コンソールにエラーが出力されていました。

2.1.0 では、名前付きエクスポートを完全にサポートするために、デフォルトインポートが完全に削除されました。

Kotlin/Wasm ターゲット向けに JavaScript でコーディングする場合、デフォルトインポートの代わりに対応する名前付きインポートを使用する必要があります。

この変更は、名前付きエクスポートに移行するための非推奨サイクルの最終段階となります：

**バージョン 2.0.0:** デフォルトエクスポート経由でのエンティティのエクスポートが非推奨であることを説明する警告メッセージがコンソールに出力されました。

**バージョン 2.0.20:** 対応する名前付きインポートの使用を要求するエラーが発生しました。

**バージョン 2.1.0:** デフォルトインポートの使用が完全に削除されました。

### サブプロジェクト固有の Node.js 設定

`rootProject` の `NodeJsRootPlugin` クラスのプロパティを定義することで、プロジェクトの Node.js 設定を構成できます。
2.1.0 では、新しいクラス `NodeJsPlugin` を使用して、各サブプロジェクトごとにこれらの設定を構成できるようになりました。
以下は、サブプロジェクトに特定の Node.js バージョンを設定する方法を示す例です：

```kotlin
// build.gradle.kts
project.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsPlugin> {
    project.the<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsEnvSpec>().version = "22.0.0"
}
```

プロジェクト全体でこの新しいクラスを使用するには、`allprojects {}` ブロックに同じコードを追加します：

```kotlin
// build.gradle.kts
allprojects {
    project.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsPlugin> {
        project.the<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsEnvSpec>().version = "使用する Node.js バージョン"
    }
}
```

Gradle のコンベンションプラグインを使用して、特定のサブプロジェクトのセットに設定を適用することもできます。

## Kotlin/JS

### プロパティにおける非識別子文字のサポート

以前の Kotlin/JS では、バッククォートで囲まれたスペースを含む[テストメソッド名](coding-conventions.md#names-for-test-methods)の使用が許可されていませんでした。

同様に、ハイフンやスペースなど、Kotlin の識別子として許可されていない文字を含む JavaScript オブジェクトのプロパティにアクセスすることもできませんでした：

```kotlin
external interface Headers {
    var accept: String?

    // ハイフンのため Kotlin の識別子として無効
    var `content-length`: String?
}

val headers: Headers = TODO("JS ライブラリから提供される値")
val accept = headers.accept
// プロパティ名のハイフンのためエラーが発生する
val length = headers.`content-length`
```

この挙動は、非識別子文字を使用してそのようなプロパティにアクセスできる JavaScript や TypeScript とは異なっていました。

Kotlin 2.1.0 から、この機能がデフォルトで有効になりました。
Kotlin/JS でバッククォート（``）や `@JsName` アノテーションを使用して、非識別子文字を含む JavaScript プロパティとのやり取りや、テストメソッド名の使用ができるようになりました。

さらに、`@JsName` および `@JsQualifier` アノテーションを使用して、Kotlin のプロパティ名を JavaScript の対応するものにマップすることもできます：

```kotlin
object Bar {
    val `property example`: String = "bar"
}

@JsQualifier("fooNamespace")
external object Foo {
    val `property example`: String
}

@JsExport
object Baz {
    val `property example`: String = "bar"
}

fun main() {
    // JavaScript では、これは Bar.property_example_HASH にコンパイルされる
    println(Bar.`property example`)
    // JavaScript では、これは fooNamespace["property example"] にコンパイルされる
    println(Foo.`property example`)
    // JavaScript では、これは Baz["property example"] にコンパイルされる
    println(Baz.`property example`)
}
```

### ES2015 アロー関数の生成サポート

Kotlin 2.1.0 の Kotlin/JS では、匿名関数の代わりに `(a, b) => expression` のような ES2015 アロー関数の生成がサポートされました。

アロー関数を使用することで、特に実験的な `-Xir-generate-inline-anonymous-functions` モードを使用している場合に、プロジェクトのバンドルサイズを縮小できます。また、生成されたコードが現代的な JS とより適合するようになります。

この機能は、ES2015 をターゲットにしている場合にデフォルトで有効になります。
あるいは、`-Xes-arrow-functions` コマンドライン引数を使用して手動で有効にすることもできます。

[公式ドキュメントで ES2015 (ECMAScript 2015, ES6)](https://262.ecma-international.org/6.0/) について詳しく学ぶ。

## Gradle の改善

Kotlin 2.1.0 は、Gradle 7.6.3 から 8.6 と完全に互換性があります。
Gradle バージョン 8.7 から 8.10 もサポートされていますが、1 つだけ例外があります。
Kotlin Multiplatform Gradle プラグインを使用している場合、JVM ターゲットで `withJava()` 関数を呼び出しているマルチプラットフォームプロジェクトで非推奨警告が表示されることがあります。
この問題については、できるだけ早く修正する予定です。

詳細は、[YouTrack の関連イシュー](https://youtrack.jetbrains.com/issue/KT-66542) を参照してください。

最新の Gradle リリースまでのバージョンも使用可能ですが、その場合は非推奨警告が発生したり、一部の新しい Gradle 機能が動作しなかったりする可能性があることに留意してください。

### サポートされる最小の AGP バージョンが 7.3.1 に引き上げ

Kotlin 2.1.0 から、サポートされる Android Gradle プラグインの最小バージョンは 7.3.1 になりました。

### サポートされる最小の Gradle バージョンが 7.6.3 に引き上げ

Kotlin 2.1.0 から、サポートされる Gradle の最小バージョンは 7.6.3 になりました。

### Kotlin Gradle プラグインエクステンション用の新しい API

Kotlin 2.1.0 では、Kotlin Gradle プラグインを構成するための独自のプラグインをより簡単に作成できる新しい API が導入されました。
この変更により、`KotlinTopLevelExtension` および `KotlinTopLevelExtensionConfig` インターフェースが非推奨となり、プラグイン作者向けに以下のインターフェースが導入されました：

| 名前 | 説明 |
|--------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `KotlinBaseExtension` | プロジェクト全体の共通の Kotlin JVM、Android、および Multiplatform プラグインオプションを構成するためのプラグイン DSL エクステンション型：<list><li>`org.jetbrains.kotlin.jvm`</li><li>`org.jetbrains.kotlin.android`</li><li>`org.jetbrains.kotlin.multiplatform`</li></list> |
| `KotlinJvmExtension` | プロジェクト全体の Kotlin **JVM** プラグインオプションを構成するためのプラグイン DSL エクステンション型。 |
| `KotlinAndroidExtension` | プロジェクト全体の Kotlin **Android** プラグインオプションを構成するためのプラグイン DSL エクステンション型。 |

例えば、JVM プロジェクトと Android プロジェクトの両方に対してコンパイラオプションを構成したい場合は、`KotlinBaseExtension` を使用します：

```kotlin
configure<KotlinBaseExtension> {
    if (this is HasConfigurableKotlinCompilerOptions<*>) {
        with(compilerOptions) {
            if (this is KotlinJvmCompilerOptions) {
                jvmTarget.set(JvmTarget.JVM_17)
            }
        }
    }
}
```

これにより、JVM プロジェクトと Android プロジェクトの両方で JVM ターゲットが 17 に構成されます。

JVM プロジェクト専用にコンパイラオプションを構成するには、`KotlinJvmExtension` を使用します：

```kotlin
configure<KotlinJvmExtension> {
    compilerOptions {
        jvmTarget.set(JvmTarget.JVM_17)
    }

    target.mavenPublication {
        groupId = "com.example"
        artifactId = "example-project"
        version = "1.0-SNAPSHOT"
    }
}
```

この例も同様に JVM プロジェクトの JVM ターゲットを 17 に構成します。
さらに、プロジェクトの出力が Maven リポジトリに公開されるように Maven 公開（publication）も構成しています。

`KotlinAndroidExtension` も全く同じ方法で使用できます。

### Kotlin Gradle プラグイン API からコンパイラシンボルを隠蔽

以前の KGP はランタイム依存関係に `org.jetbrains.kotlin:kotlin-compiler-embeddable` を含んでいたため、ビルドスクリプトのクラスパスで内部的なコンパイラシンボルが利用可能でした。
これらのシンボルは内部使用のみを目的としていました。

Kotlin 2.1.0 から、KGP は `org.jetbrains.kotlin:kotlin-compiler-embeddable` クラスファイルのサブセットを自身の JAR ファイルにバンドルし、それらを段階的に削除しています。
この変更は、互換性の問題を防止し、KGP のメンテナンスを簡素化することを目的としています。

`kotlinter` などのプラグインといったビルドロジックの他の部分が、KGP にバンドルされているものとは異なるバージョンの `org.jetbrains.kotlin:kotlin-compiler-embeddable` に依存している場合、衝突や実行時の例外が発生する可能性があります。

このような問題を防止するため、KGP と共に `org.jetbrains.kotlin:kotlin-compiler-embeddable` がビルドクラスパスに存在する場合、KGP は警告を表示するようになりました。

長期的な解決策として、`org.jetbrains.kotlin:kotlin-compiler-embeddable` のクラスを使用しているプラグインの作者の方は、それらを隔離されたクラスローダーで実行することをお勧めします。
例えば、クラスローダーまたはプロセスアイソレーションを備えた [Gradle Workers API](https://docs.gradle.org/current/userguide/worker_api.html) を使用することで実現できます。

#### Gradle Workers API の使用

この例は、Gradle プラグインを生成するプロジェクトで Kotlin コンパイラを安全に使用する方法を示しています。
まず、ビルドスクリプトに compile-only 依存関係を追加します。これにより、コンパイル時のみシンボルが利用可能になります：

```kotlin
// build.gradle.kts
dependencies {
    compileOnly("org.jetbrains.kotlin:kotlin-compiler-embeddable:%kotlinVersion%")
}
```

次に、Kotlin コンパイラのバージョンを出力する Gradle work action を定義します：

```kotlin
import org.gradle.workers.WorkAction
import org.gradle.workers.WorkParameters
import org.jetbrains.kotlin.config.KotlinCompilerVersion
abstract class ActionUsingKotlinCompiler : WorkAction<WorkParameters.None> {
    override fun execute() {
        println("Kotlin compiler version: ${KotlinCompilerVersion.getVersion()}")
    }
}
```

次に、クラスローダーアイソレーションを使用してこのアクションを worker executor にサブミットするタスクを作成します：

```kotlin
import org.gradle.api.DefaultTask
import org.gradle.api.file.ConfigurableFileCollection
import org.gradle.api.tasks.Classpath
import org.gradle.api.tasks.TaskAction
import org.gradle.workers.WorkerExecutor
import javax.inject.Inject
abstract class TaskUsingKotlinCompiler: DefaultTask() {
    @get:Inject
    abstract val executor: WorkerExecutor

    @get:Classpath
    abstract val kotlinCompiler: ConfigurableFileCollection

    @TaskAction
    fun compile() {
        val workQueue = executor.classLoaderIsolation {
            classpath.from(kotlinCompiler)
        }
        workQueue.submit(ActionUsingKotlinCompiler::class.java) {}
    }
}
```

最後に、Gradle プラグインで Kotlin コンパイラのクラスパスを構成します：

```kotlin
import org.gradle.api.Plugin
import org.gradle.api.Project
abstract class MyPlugin: Plugin<Project> {
    override fun apply(target: Project) {
        val myDependencyScope = target.configurations.create("myDependencyScope")
        target.dependencies.add(myDependencyScope.name, "$KOTLIN_COMPILER_EMBEDDABLE:$KOTLIN_COMPILER_VERSION")
        val myResolvableConfiguration = target.configurations.create("myResolvable") {
            extendsFrom(myDependencyScope)
        }
        target.tasks.register("myTask", TaskUsingKotlinCompiler::class.java) {
            kotlinCompiler.from(myResolvableConfiguration)
        }
    }

    companion object {
        const val KOTLIN_COMPILER_EMBEDDABLE = "org.jetbrains.kotlin:kotlin-compiler-embeddable"
        const val KOTLIN_COMPILER_VERSION = "%kotlinVersion%"
    }
}
```

## Compose コンパイラのアップデート

### 複数の安定性構成ファイルのサポート

Compose コンパイラは複数の安定性構成（stability configuration）ファイルを解釈できますが、Compose Compiler Gradle プラグインの `stabilityConfigurationFile` オプションでは以前は単一のファイルしか指定できませんでした。
Kotlin 2.1.0 ではこの機能が作り直され、単一のモジュールに対して複数の安定性構成ファイルを使用できるようになりました：

* `stabilityConfigurationFile` オプションは非推奨となりました。
* 新しいオプション `stabilityConfigurationFiles`（型は `ListProperty<RegularFile>`）が導入されました。

新しいオプションを使用して Compose コンパイラに複数のファイルを渡す方法は以下の通りです：

```kotlin
// build.gradle.kt
composeCompiler {
    stabilityConfigurationFiles.addAll(
        project.layout.projectDirectory.file("configuration-file1.conf"),
        project.layout.projectDirectory.file("configuration-file2.conf"),
    )
}
```

### 中断可能なコンポジション（Pausable composition）

中断可能なコンポジションは、コンパイラがスキップ可能な関数を生成する方法を変更する新しい実験的な機能です。
この機能を有効にすると、実行中にスキップポイントでコンポジションをサスペンド（中断）できるようになり、長時間実行されるコンポジションプロセスを複数のフレームに分割できるようになります。
中断可能なコンポジションは、レイジーリストやその他のパフォーマンス重視のコンポーネントで、ブロッキング方式で実行されるとフレームドロップの原因となる可能性のあるコンテンツをプリフェッチするために使用されます。

中断可能なコンポジションを試すには、Compose コンパイラの Gradle 構成に以下の機能フラグを追加してください：

```kotlin
// build.gradle.kts
composeCompiler {
    featureFlags = setOf(
        ComposeFeatureFlag.PausableComposition
    )
}
```

> この機能のランタイムサポートは、`androidx.compose.runtime` の 1.8.0-alpha02 バージョンで追加されました。
> それ以前のランタイムバージョンで使用しても、機能フラグは効果がありません。
>
{style="note"}

### open およびオーバーライドされた @Composable 関数に関する変更

仮想的な（open、abstract、およびオーバーライドされた）`@Composable` 関数は、再実行可能（restartable）にできなくなりました。
再実行可能なグループのコード生成が継承と[正しく動作しない](https://issuetracker.google.com/329477544)呼び出しを生成しており、実行時のクラッシュを引き起こしていました。

これは、仮想関数が再実行されたりスキップされたりしなくなることを意味します。それらの状態が無効化されるたびに、ランタイムは代わりに親のコンポーザブルを再構成します。
コードが再構成（recomposition）に敏感な場合、実行時の挙動の変化に気づくかもしれません。

### パフォーマンスの改善

Compose コンパイラは、`@Composable` 型を変換するためにモジュールの IR の完全なコピーを作成していました。
Compose に関係のない要素をコピーすることによるメモリ消費の増加に加え、この挙動は[特定の境界例](https://issuetracker.google.com/365066530)で後続のコンパイラプラグインを破損させていました。

このコピー操作が削除され、コンパイル時間が短縮される可能性があります。

## 標準ライブラリ

### 標準ライブラリ API の非推奨重要度の変更

Kotlin 2.1.0 では、いくつかの標準ライブラリ API の非推奨重要度を警告（warning）からエラー（error）に引き上げています。
コードがこれらの API に依存している場合は、互換性を確保するためにコードを更新する必要があります。
主な変更点は以下の通りです：

* **`Char` および `String` 用のロケール依存のケース変換関数が非推奨に:**
  `Char.toLowerCase()`、`Char.toUpperCase()`、`String.toUpperCase()`、および `String.toLowerCase()` などの関数が非推奨となり、使用するとエラーになります。
  これらをロケールに依存しない代替関数や他のケース変換メカニズムに置き換えてください。
  デフォルトのロケールを引き続き使用したい場合は、`String.toLowerCase()` などの呼び出しを、ロケールを明示的に指定する `String.lowercase(Locale.getDefault())` に置き換えてください。
  ロケールに依存しない変換の場合は、デフォルトで不変のロケール（invariant locale）を使用する `String.lowercase()` に置き換えてください。

* **Kotlin/Native の freezing API が非推奨に:**
  以前 `@FreezingIsDeprecated` アノテーションが付与されていた freezing 関連の宣言を使用すると、エラーが発生するようになりました。
  この変更は、スレッド間でオブジェクトを共有するために freezing を必要としていた Kotlin/Native のレガシーメモリマネージャからの移行を反映したものです。
  新しいメモリモデルで freezing 関連 API から移行する方法については、[Kotlin/Native 移行ガイド](native-migration-guide.md#update-your-code) を参照してください。
  詳細は、[freezing の非推奨に関する発表](whatsnew1720.md#freezing) を参照してください。

* **`appendln()` が `appendLine()` のために非推奨に:**
  `StringBuilder.appendln()` および `Appendable.appendln()` 関数が非推奨となり、使用するとエラーになります。
  これらを置き換えるには、代わりに `StringBuilder.appendLine()` または `Appendable.appendLine()` 関数を使用してください。
  `appendln()` が非推奨となった理由は、Kotlin/JVM において、OS ごとにデフォルト値が異なる `line.separator` システムプロパティを使用しているためです。Kotlin/JVM では、このプロパティは Windows では `\r
` (CR LF)、その他のシステムでは `
` (LF) にデフォルト設定されます。
  一方で、`appendLine()` 関数は改行セパレータとして一貫して `
` (LF) を使用し、プラットフォーム間での一貫した挙動を保証します。

本リリースで影響を受ける API の完全なリストについては、[KT-71628](https://youtrack.jetbrains.com/issue/KT-71628) YouTrack イシューを参照してください。

### java.nio.file.Path 用の Stable なファイルツリー探索拡張

Kotlin 1.7.20 で導入された、ファイルツリーを走査できる `java.nio.file.Path` クラス用の実験的な [拡張関数](extensions.md#extension-functions) がありました。
Kotlin 2.1.0 では、以下のファイルツリー探索拡張が [Stable](components-stability.md#stability-levels-explained) になりました：

* `walk()`：指定されたパスをルートとするファイルツリーを遅延（lazy）走査します。
* `fileVisitor()`：`FileVisitor` を個別に作成できるようにします。
  `FileVisitor` は、探索中にディレクトリやファイルに対して実行されるアクションを指定します。
* `visitFileTree(fileVisitor: FileVisitor, ...)`：内部で `java.nio.file.Files.walkFileTree()` 関数を使用して、ファイルツリーを走査し、遭遇した各エントリに対して指定された `FileVisitor` を呼び出します。
* `visitFileTree(..., builderAction: FileVisitorBuilder.() -> Unit)`：提供された `builderAction` を用いて `FileVisitor` を作成し、`visitFileTree(fileVisitor, ...)` 関数を呼び出します。
* `sealed interface FileVisitorBuilder`：カスタムの `FileVisitor` 実装を定義できます。
* `enum class PathWalkOption`：`Path.walk()` 関数用の走査オプションを提供します。

以下の例は、これらのファイル走査 API を使用してカスタムの `FileVisitor` の挙動を作成する方法を示しています。これにより、ファイルやディレクトリを訪れる際の具体的なアクションを定義できます。

例えば、`FileVisitor` を明示的に作成して後で使用することができます：

```kotlin
val cleanVisitor = fileVisitor {
    onPreVisitDirectory { directory, attributes ->
        // プレースホルダー：ディレクトリ訪問時のロジックを追加
        FileVisitResult.CONTINUE
    }

    onVisitFile { file, attributes ->
        // プレースホルダー：ファイル訪問時のロジックを追加
        FileVisitResult.CONTINUE
    }
}

// プレースホルダー：探索前の一般的なセットアップロジックをここに追加
projectDirectory.visitFileTree(cleanVisitor)
```

また、`builderAction` を用いて `FileVisitor` を作成し、即座に走査に使用することもできます：

```kotlin
projectDirectory.visitFileTree {
    // builderAction を定義：
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

さらに、`walk()` 関数を使用して、指定されたパスをルートとするファイルツリーを走査できます：

```kotlin
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

        // .class 拡張子を持つファイルを削除
        onVisitFile { file, _ ->
            if (file.extension == "class") {
                file.deleteExisting()
            }
            FileVisitResult.CONTINUE
        }
    }

    // ルートディレクトリとファイルをセットアップ
    val rootDirectory = createTempDirectory("Project")

    // A.kt と A.class ファイルを含む src ディレクトリを作成
    rootDirectory.resolve("src").let { srcDirectory ->
        srcDirectory.createDirectory()
        srcDirectory.resolve("A.kt").createFile()
        srcDirectory.resolve("A.class").createFile()
    }

    // Project.jar ファイルを含む build ディレクトリを作成
    rootDirectory.resolve("build").let { buildDirectory ->
        buildDirectory.createDirectory()
        buildDirectory.resolve("Project.jar").createFile()
    }

    // walk() 関数を使用：
    val directoryStructure = rootDirectory.walk(PathWalkOption.INCLUDE_DIRECTORIES)
        .map { it.relativeTo(rootDirectory).toString() }
        .toList().sorted()
    println(directoryStructure)
    // "[, build, build/Project.jar, src, src/A.class, src/A.kt]"
  
    // cleanVisitor でファイルツリーを走査し、rootDirectory.visitFileTree(cleanVisitor) のクリーンアップルールを適用
    val directoryStructureAfterClean = rootDirectory.walk(PathWalkOption.INCLUDE_DIRECTORIES)
        .map { it.relativeTo(rootDirectory).toString() }
        .toList().sorted()
    println(directoryStructureAfterClean)
    // "[, src, src/A.kt]"
}
```

## ドキュメントの更新

Kotlin ドキュメントにいくつかの注目すべき変更が加えられました：

### 言語コンセプト

* [Null 安全性](null-safety.md) ページの改善 – コード内で `null` 値を安全に処理する方法を学びます。
* [オブジェクト宣言と式](object-declarations.md) ページの改善 – クラスの定義とインスタンスの作成を単一のステップで行う方法を学びます。
* [when 式と文](control-flow.md#when-expressions-and-statements) セクションの改善 – `when` 条件式とその使用方法について学びます。
* [Kotlin ロードマップ](roadmap.md)、[Kotlin の進化の原則](kotlin-evolution-principles.md)、および [Kotlin 言語の機能と提案](kotlin-language-features-and-proposals.md) ページの更新 – Kotlin の計画、進行中の開発、および指針となる原則について学びます。

### Compose コンパイラ

* [Compose コンパイラドキュメント](compose-compiler-migration-guide.md) が「コンパイラとプラグイン」セクションに移動しました – Compose コンパイラ、コンパイラオプション、および移行手順について学びます。

### API リファレンス

* 新しい [Kotlin Gradle プラグイン API リファレンス](https://kotlinlang.org/api/kotlin-gradle-plugin) – Kotlin Gradle プラグインおよび Compose コンパイラ Gradle プラグインの API リファレンスを探索してください。

### マルチプラットフォーム開発

* 新しい [マルチプラットフォーム向け Kotlin ライブラリの構築](https://kotlinlang.org/docs/api-guidelines-build-for-multiplatform.html) ページ – Kotlin Multiplatform 向けのライブラリ設計方法について学びます。
* 新しい [Kotlin Multiplatform 入門](https://kotlinlang.org/docs/multiplatform/get-started.html) ページ – Kotlin Multiplatform の主要な概念、依存関係、ライブラリなどについて学びます。
* 新しい [iOS 統合](https://kotlinlang.org/docs/multiplatform/multiplatform-ios-integration-overview.html) セクション – Kotlin Multiplatform の共有モジュールを iOS アプリに統合する方法を学びます。
* 新しい [Kotlin/Native 定義ファイル](native-definition-file.md) ページ – C および Objective-C ライブラリを利用するための定義ファイルの作成方法を学びます。
* [WASI を使ってみる](wasm-wasi.md) – 様々な WebAssembly 仮想マシンで WASI を使用してシンプルな Kotlin/Wasm アプリケーションを実行する方法を学びます。

### ツール

* [新しい Dokka 移行ガイド](dokka-migration.md) – Dokka Gradle プラグイン v2 への移行方法を学びます。

## Kotlin 2.1.0 互換性ガイド

Kotlin 2.1.0 はフィーチャーリリース（機能リリース）であるため、以前のバージョンの言語で書かれたコードと互換性のない変更が含まれる可能性があります。
これらの変更の詳細は、[Kotlin 2.1.0 互換性ガイド](compatibility-guide-21.md) を参照してください。

## Kotlin 2.1.0 のインストール

IntelliJ IDEA 2023.3 および Android Studio Iguana (2023.2.1) Canary 15 以降、Kotlin プラグインは IDE に含まれる同梱プラグインとして配布されるようになりました。つまり、JetBrains Marketplace からプラグインをインストールすることはできなくなりました。

新しい Kotlin バージョンに更新するには、ビルドスクリプト内の [Kotlin バージョンを 2.1.0 に変更](releases.md#update-to-a-new-kotlin-version) してください。