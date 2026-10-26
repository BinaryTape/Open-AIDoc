[//]: # (title: Kotlin %kotlinEapVersion% の新機能)

<primary-label ref="eap"/>

<show-structure depth="1"/>

<web-summary>Kotlin Early Access Preview（EAP）のリリースノートを読み、公式リリースに先駆けて最新の実験的Kotlin機能を試してみてください。</web-summary>

_[リリース日: %kotlinEapReleaseDate%](eap.md#build-details)_

> 本ドキュメントでは、Early Access Preview（EAP）リリースのすべての機能を取り上げているわけではありませんが、いくつかの主要な改善点を紹介します。
>
> 変更点の完全なリストについては、[GitHubのチェンジログ](https://github.com/JetBrains/kotlin/releases/tag/v%kotlinEapVersion%)を参照してください。
>
{style="note"}

Kotlin %kotlinEapVersion% がリリースされました！ 今回のEAPリリースの詳細は以下のとおりです:

* **言語**: [`only-syntax` モードでの安定版の名前ベースの分解宣言、未使用の戻り値チェッカー、および改善されたコンパイル時定数](#stable-language-features)。
* **標準ライブラリ**: [`if` 式を用いた一般的なパターンを簡素化する新しい実験的関数](#new-functions-for-simplifying-common-patterns-with-if-expressions)、および[Unicodeコードポイントの実験的サポート](#support-for-unicode-code-points)。
* **Kotlin/JVM**: [Java 28 のサポート](#kotlin-jvm)。
* **Kotlin/Native**: [Appleターゲットでのインクリメンタルコンパイルのデフォルト有効化](#incremental-compilation-enabled-by-default-on-apple-targets)、および[新しいDSLを備えたSwift exportのBeta版](#swift-export-goes-beta-with-a-new-gradle-dsl)。
* **Kotlin Multiplatform**: [Kotlin Multiplatform向けの新しい実験的コンパイルスキーム](#new-experimental-compilation-scheme-for-kotlin-multiplatform)、および[マルチプラットフォームライブラリ向けの新しい公開フォーマット](#new-publication-format-for-kotlin-multiplatform-libraries)。
* **Kotlin/JS**: [`es2020` ターゲットのサポート](#kotlin-js)。
* **Kotlinコンパイラ**: [`klib` コンパイル時における、より一貫したインライン関数の動作](#consistent-cross-module-function-inlining-during-klib-compilation)。

> Kotlinのリリースサイクルに関する情報については、[Kotlinのリリースプロセス](releases.md)を参照してください。
>
{style="tip"}

## Kotlin %kotlinEapVersion% へのアップデート {id="update-to-kotlin-kotlineapversion"}

最新バージョンのKotlinは、[IntelliJ IDEA](https://www.jetbrains.com/idea/download/) および [Android Studio](https://developer.android.com/studio) の最新バージョンに含まれています。

新しいKotlinバージョンに更新するには、IDEが最新バージョンに更新されていることを確認し、ビルドスクリプトで[Kotlinバージョンを %kotlinEapVersion% に変更](releases.md#update-to-a-new-kotlin-version)してください。

## 言語 {id="language"}

Kotlin %kotlinEapVersion% では、以前のリリースで導入された複数の言語機能が安定化（Stable）されました。また、実験的なコンパニオン拡張（companion extensions）とコンパニオンブロック（companion blocks）、および完全な値クラス（full value classes）も導入されています。

### 安定化した言語機能 {id="stable-language-features"}

<secondary-label ref="language"/>

Kotlin 2.3.0〜2.4.0 では、いくつかの言語機能が[実験的（Experimental）](components-stability.md#stability-levels-explained)として導入されました。本リリースにおいて、以下の言語機能が[安定版（Stable）](components-stability.md#stability-levels-explained)となったことをお知らせします:

* [改善されたコンパイル時定数](whatsnew24.md#improved-compile-time-constants)。

* オプショナルパラメータに対してバージョンベースのオーバーロードを生成する[`@IntroducedAt` アノテーション](whatsnew24.md#new-introducedat-annotation-to-generate-version-based-overloads-for-optional-parameters)。

* デフォルトで有効化された[未使用の戻り値チェッカー](whatsnew23.md#unused-return-value-checker)。

* `only-syntax` モードでの[名前ベースの分解宣言（Name-based destructuring）](destructuring-declarations.md#name-based-destructuring)（これがデフォルトになりました）。

  このモードでは、「従来の」分解構文である `val (x, y)` は位置ベースの挙動を維持しつつ、「新しい」構文である `(val x, val y)` が名前ベースの分解宣言を実行します。この機能の概要は以下の動画でご確認いただけます:

  <video src="https://www.youtube.com/v/He8J34KHEY4" title="Kotlin's Name-Based Destructuring"/>

### コンパニオン拡張とコンパニオンブロック {id="companion-extensions-and-blocks"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="language"/>

Kotlin %kotlinEapVersion% では、コンパニオン拡張とコンパニオンブロックが導入されています。

従来、型の名前を通じてアクセスできる拡張、関数、プロパティを宣言するには、その型にコンパニオンオブジェクト（companion object）が存在する必要がありました。コンパニオン拡張とコンパニオンブロックはこの要件を取り払い、以下を可能にします:

* 拡張対象の型にコンパニオンオブジェクトが存在しない場合でも、トップレベルの拡張に `companion` 修飾子を付与することで、コンパニオン拡張を宣言する。
* オブジェクトインスタンスを生成することなく、クラスまたはインターフェース内の `companion {}` ブロックに関数やプロパティを宣言する。静的メンバーをサポートするプラットフォームでは、コンパイラはこれらの宣言を静的メンバーとして生成します。その結果、JVM上で `@JvmStatic` アノテーションを付与する必要がなくなります。

以下は、`UnitX` をコンパニオン拡張として宣言し、`Zero` をコンパニオンブロック内で宣言する例です:

```kotlin
// UnitX をコンパニオン拡張として宣言
companion val Vector.UnitX get() = Vector(1.0, 0.0)

data class Vector(val x: Double, val y: Double) {
    companion {
        // Zero をコンパニオンブロック内で宣言
        val Zero: Vector get() = Vector(0.0, 0.0)
    }
}

fun main() {
    println(Vector.UnitX)
    // Vector(x=1.0, y=0.0)

    println(Vector.Zero)
    // Vector(x=0.0, y=0.0)
}
```

設計の詳細については、この機能の [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0449-companions-block-extension.md) を参照してください。また、JetBrainsの[ブログ記事](https://blog.jetbrains.com/kotlin/2026/09/the-companions-to-come/)でもこの機能について読むことができます。

コンパニオン拡張およびブロックは[実験的（Experimental）](components-stability.md#stability-levels-explained)です。オプトインするには、ビルドファイルに以下のコンパイラオプションを追加してください:

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xcompanion-blocks-and-extensions")
    }
}
```

</tab>
<tab title="Maven" group-key="maven">

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <configuration>
                <args>
                    <arg>-Xcompanion-blocks-and-extensions</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

</tab>
</tabs>

[YouTrack](https://youtrack.jetbrains.com/issue/KT-11968) でのフィードバックをお待ちしております。

### 完全な値クラス（Full value classes） {id="full-value-classes"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="language"/>

Kotlin %kotlinEapVersion% より前は、[インライン値クラス（inline value classes）](inline-classes.md)によって単一の値をラップするカスタム型を作成できました。型に複数のプロパティが必要な場合は、通常のクラスやデータクラスを使用する必要がありました。しかし、それらのクラスでは、同じデータを含む2つのインスタンスであっても参照によって区別できてしまい、その型にとって参照の区別に意味がない場合でも区別されてしまいます。これによりランタイムの最適化が制限されたり、同一のオブジェクト参照が保持されているかどうかにコードが不必要に依存してしまう可能性がありました。

Kotlin %kotlinEapVersion% では、プロパティ全体で1つの値を構成し、個々のインスタンスの同一性（identity）が問題とならない型を定義できる、実験的な完全な値クラス（full value classes）が導入されました。たとえば、実部（real）と虚部（imaginary）のプロパティを持つ複素数を表す完全な値クラス `Complex` を次のように宣言できます:

```kotlin
value class Complex(val real: Double, val imaginary: Double)
```

コンパイラは、データクラスと同様に、完全な値クラスに対して `equals()`、`hashCode()`、`toString()` 関数を自動的に生成します。ただし、以下の違いがあります:

* `componentN()` 関数は生成されません。代わりに[名前ベースの分解宣言](destructuring-declarations.md#name-based-destructuring)を使用できます。オプトインは不要です。
* `copy()` 関数は生成されません。将来的には、代わりに `copy vars` を使用できるようになる予定です。詳細については、[KT-44653](https://youtrack.jetbrains.com/issue/KT-44653) を参照してください。

データクラスとの違いについての詳細は、KEEPの[継承に関するセクション](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0454-better-immutability-value-classes-MFVC.md#mfvc-and-inheritance)を参照してください。

#### 抽象値クラス（Abstract value classes） {id="abstract-value-classes"}

完全な値クラスは抽象（abstract）にすることができます。[インターフェース](interfaces.md)とは異なり、構築時にすべてのサブクラスが実行する初期化ロジックを定義できます。

たとえば、`OrderedInterval` 値クラスはコンストラクタパラメータとして `start` と `end` を受け取ります。`IntInterval` 値クラスは、それらの値を `start` プロパティと `end` プロパティに格納します。

```kotlin
sealed value class OrderedInterval<T : Comparable<T>> protected constructor(
    start: T,
    end: T,
) {
    init {
        require(start <= end)
    }
}

value class IntInterval(
    val start: Int,
    val end: Int
) : OrderedInterval<Int>(start, end)
```

詳細については、KEEPの[継承に関するセクション](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0454-better-immutability-value-classes-MFVC.md#mfvc-and-inheritance)を参照してください。

#### 値オブジェクト（Value objects） {id="value-objects"}

完全な値クラスはプロパティを持たないことも可能です。これらは*値オブジェクト（value objects）*と呼ばれ、状態やトークンのように同一性を持たず、取り得る値が1つしかない型を表すのに役立ちます。例えば:

```kotlin
sealed interface UserResponse

value class UserFound(val user: User) : UserResponse
value object UserUnknown : UserResponse
```

詳細については、KEEPの[値オブジェクトに関するセクション](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0454-better-immutability-value-classes-MFVC.md#value-objects)を参照してください。

#### 有効化の方法 {id="how-to-enable"}

この機能は[実験的（Experimental）](components-stability.md#stability-levels-explained)です。オプトインするには、ビルドファイルに以下のコンパイラオプションを追加してください:

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xfull-value-classes")
    }
}
```

</tab>
<tab title="Maven" group-key="maven">

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <configuration>
                <args>
                    <arg>-Xfull-value-classes</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

</tab>
</tabs>

#### インライン値クラスの宣言に対する変更 {id="changes-to-inline-value-class-declarations"}

これらの新しい値クラスの登場に伴い、`value class` は必ずしもインラインを意味するものではなくなりました。インライン値クラスは外部から観察可能なインライン表現を持ちますが、他の値クラスはそのランタイム表現を同様の方法で公開しません。この違いは、インライン値クラスを別個に扱うSpringやシリアライゼーションライブラリにとって重要です。

この区別を明示的にするため、将来的には、インライン値クラスは `inline` 修飾子および `@JvmInline value class` 宣言を通じて明示的に宣言することがコンパイラによって要求されるようになります。プレーンな `value class` 宣言はインラインとしては扱われなくなります。

この動作を変更するための段階的な移行が計画されています:

* Kotlin 2.5.20 では、修飾子のない単一フィールドの値クラスに対して警告を報告します。
* Kotlin 2.6.0 または 2.7.0 では、この警告がエラーに引き上げられます。

コードをこの変更に備えさせるために、`-Xinline-value-class-migration=warning` および `-Xinline-value-class-migration=strict` コンパイラオプションを使用できます。

詳細については、[KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0468-inline-value-classes.md#migration) を参照してください。

##### ライブラリのクラスを値クラスへ移行するための準備 {id="prepare-your-library-s-classes-for-migration-to-value-classes"}

ライブラリの作者は、`@WillBecomeValue` アノテーションを使用して、ライブラリの通常のクラスが将来完全な値クラスに移行することへの準備ができます。参照等価性（`===`）、同期処理（synchronization）、または同一性ハッシュコード（identity hash codes）などを通じてユーザーのコードがオブジェクトの同一性に依存している場合、コンパイラは警告を発します。これらの警告により、クラスを移行する前にユーザーがコードを更新するための猶予が生まれます。

このアノテーションは[実験的（Experimental）](components-stability.md#stability-levels-explained)であり、`@OptIn(ExperimentalValueClassApi::class)` によるオプトインが必要です。ライブラリのユーザーがアノテーション付きクラスを使用する際には、このオプトインは不要です。

詳細については、[KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0470-will-become-value.md) を参照してください。

### 構造クラスにおける等価性比較チェックの改善 {id="improved-checks-for-equality-comparisons-on-structural-classes"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="language"/>

Kotlin %kotlinEapVersion% では、データクラス、データオブジェクト、finalな値クラス、およびenumクラス（これらを総称して*構造クラス（structural classes）*と呼びます）が関与する等価性比較の追加解析が導入されました。

コンパイラはこれらのクラスに対して厳格な等価性チェックを行い、オペランドの既知の型に基づいて、`==` で常に `false` を返す比較や `!=` で常に `true` を返す比較を報告します。これらのチェックは、両方のクラスが同じプロパティを持っている場合であっても、ベクトルとポイントを比較してしまうようなミスを検出するのに役立ちます:

```kotlin
data class Point(val x: Double, val y: Double) {
    companion object {
        val ZERO: Point = Point(0.0, 0.0)
    }
}

data class Vector(val x: Double, val y: Double)

fun normalize(v: Vector) {
    if (v == Point.ZERO) {
        // 診断: この比較は常に false です。
        // Vector が Point と比較されています。
    }
    // ...
}
```

コンパイラは等価性チェックを利用して右辺のオペランドをスマートキャストすることもできます。

この機能を有効にするには、ビルドファイルに以下のコンパイラオプションを追加してください:

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xstrict-equality-for-structural-classes")
    }
}
```

</tab>
<tab title="Maven" group-key="maven">

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <configuration>
                <args>
                    <arg>-Xstrict-equality-for-structural-classes</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

</tab>
</tabs>

詳細については、この機能の [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0456-equals.md) を参照してください。

## 標準ライブラリ {id="standard-library"}

本リリースでは、Kotlin標準ライブラリに `if` 式を簡素化する新しい実験的関数と、Unicodeコードポイントの実験的サポートが追加されました。

### if 式を用いた一般的なパターンを簡素化する新しい関数 {id="new-functions-for-simplifying-common-patterns-with-if-expressions"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="standard-library"/>

Kotlin %kotlinEapVersion% では、`Boolean` 値を返す前に検査したり、その値に応じて null 許容（nullable）な結果を返したりできる新しい標準ライブラリ関数が導入されました。

以前は、これらのパターンには `else` 分岐を含む明示的な `if` 式が必要でした。今後は、以下の関数を使用してそれらを簡素化できます:

* `onTrue()` は、`Boolean` 値が `true` の場合に指定されたコードブロックを実行し、元の Boolean 値を返します。
* `onFalse()` は、`Boolean` 値が `false` の場合に指定されたコードブロックを実行し、元の Boolean 値を返します。
* `ifOrNull()` は、`Boolean` 値が `true` の場合に指定されたコードブロックを実行してその結果を返します。値が `false` の場合、関数はブロックを実行せずに `null` を返します。

これらの関数は[実験的（Experimental）](components-stability.md#stability-levels-explained)であり、`@OptIn(ExperimentalStdlibApi::class)` アノテーションまたは `-opt-in=kotlin.ExperimentalStdlibApi` コンパイラオプションによるオプトインが必要です。

以下に例を示します:

```kotlin
@OptIn(ExperimentalStdlibApi::class)
fun main() {
    val tags = mutableSetOf("kotlin", "jvm")

    // add() が true を返したときにメッセージを出力するために onTrue() 関数を使用
    val added = tags.add("wasm").onTrue {
        println("Tag added")
    }
    println(added)
    // Tag added
    // true

    // remove() が false を返したときにメッセージを出力するために onFalse() 関数を使用
    val removed = tags.remove("native").onFalse {
        println("Tag not found")
    }
    println(removed)
    // Tag not found
    // false

    // "wasm" が tags に含まれている場合にメッセージを返すために ifOrNull() 関数を使用
    val message = ifOrNull("wasm" in tags) {
        "Wasm tag is available"
    }
    println(message)
    // Wasm tag is available
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.5.0-Beta1" validate="false"}

[YouTrack](https://youtrack.jetbrains.com/issue/KT-6938) でのフィードバックをお待ちしております。

### Unicodeコードポイントのサポート {id="support-for-unicode-code-points"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="standard-library"/>

Kotlin %kotlinEapVersion% では、`CodePoint` インライン値クラスおよび `kotlin.text.unicode` パッケージに関連APIが導入されました。これにより、プラットフォーム間でUnicodeコードポイントを扱えるようになります。

`Char` は1つのUTF-16コードユニットを表します。しかし、一部のUnicodeコードポイントはサロゲートペアとして知られる2つの `Char` 値を必要とします。プログラムが文字列を `Char` 値としてイテレートすると、サロゲートペアの各半分が別々の要素として処理されてしまいます。

`CodePoint` 値クラスはUnicodeコードポイントを表し、その整数値を保持するために基底型として `Int` を使用します。これを表すのに必要なUTF-16コードユニットの数、Unicodeカテゴリ、文字（letter）か数字（digit）か空白（whitespace）かといったプロパティへのアクセスを提供します。

新しいAPIにより、コードポイントのカウントやイテレート、大文字小文字の変換、テキスト内での追加・挿入・置換・削除が行えるようになります。また、コードポイントの比較、算術演算の実行、範囲の作成、双方向へのテキストトラバースも可能です。テキストAPIは、位置指定に引き続きUTF-16コードユニットのオフセットを使用します。

これらのAPIは[実験的（Experimental）](components-stability.md#stability-levels-explained)であり、`@OptIn(ExperimentalUnicodeApi::class)` アノテーションまたは `-opt-in=kotlin.text.unicode.ExperimentalUnicodeApi` コンパイラオプションによるオプトインが必要です。

詳細については、この機能の [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/stdlib/KEEP-0400-unicode-codepoints.md) を参照してください。

## Kotlin/JVM {id="kotlin-jvm"}
<secondary-label ref="jvm"/>

Kotlin %kotlinEapVersion% 以降、コンパイラはJava 28バイトコードを含むクラスを生成できるようになりました。

## Kotlin/Native {id="kotlin-native"}

Kotlin %kotlinEapVersion% では、Appleターゲットにおいてインクリメンタルコンパイルがデフォルトで有効化され、新しいGradle DSLとともにSwift exportがBeta版に昇格しました。

### Appleターゲットでインクリメンタルコンパイルがデフォルトで有効化 {id="incremental-compilation-enabled-by-default-on-apple-targets"}

<secondary-label ref="native"/>

Kotlin %kotlinEapVersion% 以降、Appleターゲットにおいて `klib` アーティファクトのインクリメンタルコンパイルがデフォルトで有効になりました。

インクリメンタルコンパイルを使用すると、プロジェクトモジュールによって生成された `klib` アーティファクトの一部のみが変更された場合、`klib` の影響を受ける部分のみがバイナリへと再コンパイルされます。

この最適化は [Kotlin 1.9.20](whatsnew1920.md#incremental-compilation-of-klib-artifacts) で初めて導入され、特定のケースにおいてデバッグビルドのコンパイル時間を大幅に短縮することが実証されています。

この新しいデフォルト設定はAppleターゲットにのみ適用されます。Windows（[MinGWツールチェーン](https://www.mingw-w64.org/)）ではインクリメンタルコンパイルはサポートされていません。また、Linuxの場合は引き続き以下によるオプトインが必要です:

```properties
kotlin.incremental.native=true
```

なお、状況によっては、この最適化によりクリーンビルド時のパフォーマンスコストが発生する場合があります。それを回避するために、クリーンビルド時に特別なコンパイルモードを実行するよう設計された新しい[バイナリオプション](native-binary-options.md#how-to-enable)を試すことができます。このオプションは[実験的（Experimental）](components-stability.md#stability-levels-explained)であり、以下でオプトインできます:

```properties
kotlin.native.binary.batchedCacheBuild=true
```

インクリメンタルコンパイルで予期しない問題が発生した場合は、`gradle.properties` ファイルに以下のオプションを設定することで手動で無効化できます:

```properties
kotlin.incremental.native=false
```

問題が発生した場合は、[YouTrack](https://kotl.in/issue) に報告してください。

コンパイル時間を改善するためのヒントについては、[ドキュメント](native-improving-compilation-time.md)を参照してください。

### 新しいGradle DSLを備えたSwift exportがBeta版に {id="swift-export-goes-beta-with-a-new-gradle-dsl"}

<primary-label ref="beta"/>
<secondary-label ref="native"/>

Kotlin %kotlinEapVersion% では、Swift exportが[Beta](components-stability.md#stability-levels-explained)へと昇格し、より使いやすいGradle DSLが提供されます。新しいDSLは重複を減らし設定の再利用性を高め、KotlinコードをSwiftに公開しやすくします。

主な変更点は以下のとおりです:

| 機能 | 変更前 | 変更後 |
|---------------------------------|-----------------------------------------------------------------|-------------------------------------------------------|
| エントリポイント | `swiftExport {}` | `export { swift {} }` |
| 折りたたみルールプロパティ | `flattenPackage = "com.example.sandbox"` | `rootPackage = "com.example.sandbox"` |
| 宣言された依存関係のエクスポート | `export(project(":subproject")) {}` | 自動的にエクスポート（明示的な `export()` は不要） |
| 依存関係設定のオーバーライド | `export(libs.utils) {}` | `xcodeIntegration { configure(libs.utils) {} }` |
| コンパイラ引数 | `configure { freeCompilerArgs.add("-Xexpect-actual-classes") }` | 削除 |

以下は、新しいSwift export DSLを使用した完全なビルド設定の例です:

```kotlin
// subproject/build.gradle.kts
kotlin {

    iosArm64()
    iosSimulatorArm64()

    // この設定は、":subproject" を ":shared" の
    // 依存関係としてエクスポートする際に使用されます
    export {
        swift {
            // ルートモジュール名を設定
            moduleName = "Subproject"

            // 折りたたみルールを設定
            // 生成されるSwiftコードからパッケージプレフィックスを削除
            rootPackage = "com.subproject.library"
        }
    }
}

// shared/build.gradle.kts
kotlin {

    iosArm64()
    iosSimulatorArm64()

    export {
        swift {
            // ルートモジュール名を設定
            moduleName = "Shared"

            // 折りたたみルールを設定
            // 生成されるSwiftコードからパッケージプレフィックスを削除
            rootPackage = "com.example.sandbox"

            // このモジュールに対してXcode統合を有効化
            xcodeIntegration {
                // 外部モジュールのエクスポートを設定
                configure(libs.utils) {
                    // 任意: エクスポートされるモジュール名をオーバーライド
                    moduleName = "Utils"
                    // 任意: エクスポートされる依存関係の折りたたみルールをオーバーライド
                    rootPackage = "com.example.utils"
                }
            }
        }
    }

    sourceSets {
        commonMain {
            dependencies {
                // これらの依存関係は自動的に
                // Swift exportに含まれます
                api(project(":subproject"))
                api(libs.utils)
            }
        }
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="Full DSL example"}

さらに、Swift exportの設定が公開可能になりました。ライブラリ作者がオプションのオーバーライドを提供している場合、GradleはSwift exportの実行中にそれらを自動的に読み込んで適用します。

問題が発生した場合は、[YouTrack](https://kotl.in/issue) に報告するか、[招待を受け取って](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up?_gl=1*ju6cbn*_ga*MTA3MTk5NDkzMC4xNjQ2MDY3MDU4*_ga_9J976DJZ68*MTY1ODMzNzA3OS4xMDAuMS4xNjU4MzQwODEwLjYw) Kotlin Slackの [#swift-export](https://kotlinlang.slack.com/archives/C073GUW6WN9) チャンネルに参加してください。

## Kotlin Multiplatform {id="kotlin-multiplatform"}

Kotlin %kotlinEapVersion% では、Kotlin Multiplatform向けの新しい実験的コンパイルスキームと、公開されるマルチプラットフォームライブラリのサイズを大幅に削減する新しい公開フォーマットが導入されました。

### Kotlin Multiplatform向けの新しい実験的コンパイルスキーム {id="new-experimental-compilation-scheme-for-kotlin-multiplatform"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="multiplatform"/>

Kotlin %kotlinEapVersion% では、共通ソースセット（common source sets）に対するコンパイラの処理をIDEの挙動とより一貫させる、Kotlin Multiplatform（KMP）向けの新しい実験的コンパイルスキームが導入されました。この変更により、共通コードがプラットフォーム固有の宣言を誤って解決してしまうことが防止され、オーバーロード解決や型推論の一貫性が向上し、共通ソースセットに対するインクリメンタルコンパイルの実装が可能になります。KMPの分離コンパイル（separate compilation）の詳細と試用方法については、[ブログ記事](https://blog.jetbrains.com/kotlin/2026/09/a-more-reliable-compilation-scheme-for-kotlin-multiplatform-modules/)を参照してください。

### Kotlin Multiplatformライブラリ向けの新しい公開フォーマット {id="new-publication-format-for-kotlin-multiplatform-libraries"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="multiplatform"/>

Kotlin %kotlinEapVersion% では、公開ライブラリのサイズを大幅に削減するKotlin Multiplatformライブラリ向けの新しい公開フォーマットが導入されました。この新しいフォーマットでは、プラットフォームアーティファクト（JVMおよびAndroidを除く）が単一の `.kar` アーカイブ（XZで追加圧縮されたZIPアーカイブ）として公開されます。

この変更は、Maven Centralに最近導入された[公開サイズ制限](https://central.sonatype.org/publish/maven-central-publishing-limits/)に対応するものです。新しいフォーマットでは、新しいターゲットを追加しても新しいファイルが生成されないため、公開サイズがそれほど増加しません。場合によっては、全体の公開サイズが以前の単一ターゲットの公開サイズよりも小さくなることさえあります。たとえば、[cryptography-kotlin](https://github.com/whyoleg/cryptography-kotlin) ライブラリでは、マルチモジュールプロジェクト全体で公開アーティファクト群が7539ファイル・91 MBから、1036ファイル・23 MBへと縮小されました。

特定のモジュールで新しいフォーマットを有効にするには、そのモジュールのビルドスクリプトで以下のように設定します:

```kotlin
kotlin {
    publishing {
        publicationFormat.set(KotlinPublicationFormat.KOTLIN_ARCHIVE)
    }
}
```

または、プロジェクト内のすべてのモジュールで有効にするには、`gradle.properties` ファイルに以下のプロパティを追加します:

```properties
kotlin.publicationFormat=KOTLIN_ARCHIVE
```

新しいフォーマットでの公開はまだ[実験的（Experimental）](components-stability.md#stability-levels-explained)ですが、そのようなアーティファクトの消費（利用）はすでにすべてのプロジェクトで利用可能です。この変更はライブラリの作者にのみ関係するものであり、最終的なアプリケーションの開発者には影響しません。

フィードバックの共有や問題の報告は [YouTrack](https://kotl.in/issue) までお寄せください。

## Kotlin/JS {id="kotlin-js"}
<secondary-label ref="js"/>

Kotlin %kotlinEapVersion% では、Kotlin/JSコンパイラおよびGradleプラグインに `es2020` ターゲットが追加されました。以前は `es5` および `es2015` ターゲットのみが利用可能で、`BigInt` などのより新しいJavaScript機能のサポートはES2015をターゲットとしたうえで個別に有効化する必要がありました。ES2020をターゲットにすることで、追加の設定なしで `BigInt` を含むECMAScript 2020までのサポートされているすべてのJavaScript機能を使用できます。

新しいターゲットを有効にするには、`compilerOptions {}` ブロックで `target` を `es2020` に設定します:

```kotlin
kotlin {
    js {
        compilerOptions {
            target.set("es2020")
        }
    }
}
```

## Kotlinコンパイラ {id="kotlin-compiler"}

Kotlin %kotlinEapVersion% では、`klib` コンパイル時の関数インライン化がさらに改善され、型推論のパフォーマンスが向上しています。

### klib コンパイル時における一貫したモジュール間関数インライン化 {id="consistent-cross-module-function-inlining-during-klib-compilation"}

<secondary-label ref="compiler"/>

Kotlin 2.4.0 では、`klib` コンパイル時の [Kotlin/Native、Kotlin/JS、および Kotlin/Wasm におけるモジュール内の一貫した関数インライン化](whatsnew24.md#consistent-intra-module-function-inlining-during-klib-compilation)が有効化されました。異なるKotlinプラットフォーム間での関数インライン化の一貫性により、互換性の保証が容易になります。

また、Kotlin 2.4.0 では `klib` コンパイル時に**モジュール間（cross-module）**のインライン化を有効にする機能も導入され、プロジェクト内のすべてのインライン関数が一貫してインライン化されるようになりました。Kotlin %kotlinEapVersion% では、モジュール間のインライン化がデフォルトで有効化されています。

この機能で予期しない問題が発生した場合は、以下のコマンドラインコンパイラオプションで無効化できます:

```bash
-Xklib-ir-inliner=disabled
```

フィードバックの共有や問題の報告は [YouTrack](https://kotl.in/issue) までお寄せください。

### 型推論パフォーマンスの向上 {id="improved-type-inference-performance"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="compiler"/>

Kotlin %kotlinEapVersion% では、型推論時に生成される制約の数を減らすことで、コンパイラのパフォーマンスが向上しました。従来、複雑なジェネリクスコードでは過剰な制約が生成され、コンパイルやIDE解析がハングアップすることがありました。この変更は、特定のコーナーケース（特にビルダー推論や異常な境界を持つ複雑なプラットフォーム型が関係するもの）における型推論に影響を与える可能性があります。その結果、コンパイラが異なる型を推論したり、異なるオーバーロードを選択したり、異なる診断結果を報告したりする場合があります。これらの差異は、本改善に伴う想定された動作である場合があります。

この機能はデフォルトで有効になっています。以前の型推論の動作に戻すには、`-XXLanguage:-EliminateSecondKindIncorporation` オプションを使用してください。

[YouTrack](https://youtrack.jetbrains.com/issue/KT-85879) でのフィードバックをお待ちしております。

## 破壊的変更と非推奨 {id="breaking-changes-and-deprecations"}

Kotlin %kotlinEapVersion% では、Kotlinコンパイラの実行に必要な最小JDKバージョンをJDK 8からJDK 17に引き上げるための次のステップとして、エラーが導入されました。開発を迅速化し、より新しいJavaバージョンを必要とする新しいライブラリをコンパイラから利用できるようにするため、必要な最小JDKバージョンを引き上げています。JDK 17には長いサポート期間があり、より新しいバージョンのGradleやMavenとの互換性を維持するのにも役立ちます。このエラーを回避するには、コンパイラオプション `-Xallow-pre-17-runtime-jdk` を使用してください。このオプションは、JDK 17が必須となるKotlin 2.5.20または2.6.0で削除される予定です。

プロジェクトのアップグレードで問題が発生した場合は、[YouTrack](https://kotl.in/issue) で状況を共有するか、Kotlin Slackで開発者に直接お問い合わせください。[招待を受け取って](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up?_gl=1*ju6cbn*_ga*MTA3MTk5NDkzMC4xNjQ2MDY3MDU4*_ga_9J976DJZ68*MTY1ODMzNzA3OS4xMDAuMS4xNjU4MzQwODEwLjYw) [#compiler](https://kotlinlang.slack.com/archives/C7L3JB43G) チャンネルに参加してください。