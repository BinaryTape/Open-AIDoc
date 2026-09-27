[//]: # (title: Kotlin %kotlinEapVersion% の新機能)

<primary-label ref="eap"/>

<show-structure depth="1"/>

<web-summary>Kotlin Early Access Preview (EAP) のリリースノートを確認し、正式リリース前の最新の実験的 Kotlin 機能を試してみましょう。</web-summary>

_[リリース日: %kotlinEapReleaseDate%](eap.md#build-details)_

> このドキュメントは Early Access Preview (EAP) リリースのすべての機能を網羅しているわけではありませんが、主要な改善点について詳しく説明します。
>
> 変更点の完全なリストについては、[GitHub の変更履歴](https://github.com/JetBrains/kotlin/releases/tag/v%kotlinEapVersion%)を参照してください。
>
{style="note"}

Kotlin %kotlinEapVersion% がリリースされました！この EAP リリースの主な内容は以下の通りです。

* **言語**: [`only-syntax` モードでの名前ベースの分解宣言の安定化](#stable-language-features) と [新しい実験的なコンパニオン拡張およびブロック](#companion-extensions-and-blocks)
* **標準ライブラリ**: [`if` 式を使用した一般的なパターンを簡素化する新しい実験的関数](#standard-library-new-functions-for-simplifying-common-patterns-with-if-expressions)
* **Kotlin/JS**: [`es2020` ターゲットのサポート](#kotlin-js-support-for-the-es2020-target)
* **Kotlin コンパイラ**: [`.klib` コンパイル時におけるより一貫したインライン関数の動作](#consistent-cross-module-function-inlining-during-klib-compilation)<!--and a [new experimental compilation scheme for Kotlin Multiplatform]().-->

> Kotlin のリリースサイクルに関する情報は、[Kotlin のリリースプロセス](releases.md)を参照してください。
>
{style="tip"}

## Kotlin %kotlinEapVersion% へのアップデート {id="update-to-kotlin-kotlineapversion"}

最新バージョンの Kotlin は、最新バージョンの [IntelliJ IDEA](https://www.jetbrains.com/idea/download/) および [Android Studio](https://developer.android.com/studio) に含まれています。

新しい Kotlin バージョンにアップデートするには、IDE が最新バージョンに更新されていることを確認し、ビルドスクリプト内の [Kotlin バージョンを %kotlinEapVersion% に変更](releases.md#update-to-a-new-kotlin-version)してください。

## 言語 {id="language"}

Kotlin %kotlinEapVersion% では、以前のリリースで導入された 2 つの言語機能が安定化されました。また、実験的なコンパニオン拡張（companion extensions）とコンパニオンブロック（companion blocks）が導入されています。

### 安定化した言語機能 {id="stable-language-features"}

<secondary-label ref="language"/>

Kotlin 2.3.20 および 2.4.0 では、いくつかの言語機能が [実験的 (Experimental)](components-stability.md#stability-levels-explained) として導入されました。今回のリリースで、以下の言語機能が [安定 (Stable)](components-stability.md#stability-levels-explained) になったことをお知らせします。

* `only-syntax` モードでの [名前ベースの分解宣言](destructuring-declarations.md#name-based-destructuring)。

  このモードでは、「従来の」分解宣言構文 `val (x, y)` は位置ベースの動作を維持し、「新しい」構文 `(val x, val y)` は名前ベースの分解を実行します。

* [コンパイル時定数の改善](whatsnew24.md#improved-compile-time-constants)。

### コンパニオン拡張とコンパニオンブロック {id="companion-extensions-and-blocks"}

<primary-label ref="experimental-opt-in"/>

<secondary-label ref="language"/>

Kotlin %kotlinEapVersion% では、コンパニオン拡張とコンパニオンブロックが導入されました。

以前は、型の名前を通じてアクセスできる拡張、関数、およびプロパティを宣言するには、その型がコンパニオンオブジェクトを持っている必要がありました。コンパニオン拡張とブロックはこの要件を取り除き、以下のことを可能にします。

* 拡張対象の型にコンパニオンオブジェクトがない場合でも、トップレベルの拡張に `companion` 修飾子を追加することでコンパニオン拡張を宣言できます。
* オブジェクトインスタンスを作成することなく、クラスやインターフェース内の `companion {}` ブロックに関数やプロパティを宣言できます。静的メンバーをサポートするプラットフォームでは、コンパイラはこれらの宣言を静的メンバーとして生成します。そのため、JVM 上でこれらに `@JvmStatic` アノテーションを付与する必要はありません。

以下は、`UnitX` をコンパニオン拡張として宣言し、`Zero` をコンパニオンブロック内で宣言する例です。

```kotlin
// UnitX をコンパニオン拡張として宣言します
companion val Vector.UnitX get() = Vector(1.0, 0.0)

data class Vector(val x: Double, val y: Double) {
    companion {
        // Zero をコンパニオンブロック内で宣言します
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

設計の詳細については、この機能の [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0449-companions-block-extension.md) を参照してください。

コンパニオン拡張とコンパニオンブロックは [実験的 (Experimental)](components-stability.md#stability-levels-explained) です。オプトインするには、ビルドファイルに以下のコンパイラオプションを追加してください。

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

フィードバックを [YouTrack](https://youtrack.jetbrains.com/issue/KT-11968) でお待ちしております。

## 標準ライブラリ: if 式を使用した一般的なパターンを簡素化する新関数 {id="standard-library-new-functions-for-simplifying-common-patterns-with-if-expressions"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="standard-library"/>

Kotlin %kotlinEapVersion% では、`Boolean` 値を返す前に検査したり、その値に応じて null 許容（nullable）の結果を返したりできる新しい標準ライブラリ関数が導入されました。

以前は、これらのパターンには `else` ブランチを伴う明示的な `if` 式が必要でした。これらを以下の関数で簡素化できるようになりました。

* `onTrue()` は、`Boolean` 値が `true` の場合に指定されたコードブロックを実行し、元の Boolean 値を返します。
* `onFalse()` は、`Boolean` 値が `false` の場合に指定されたコードブロックを実行し、元の Boolean 値を返します。
* `ifOrNull()` は、`Boolean` 値が `true` の場合に指定されたコードブロックを実行してその結果を返します。値が `false` の場合、関数はブロックを実行せずに `null` を返します。

これらの関数は [実験的 (Experimental)](components-stability.md#stability-levels-explained) であり、`@OptIn(ExperimentalStdlibApi::class)` アノテーションまたは `-opt-in=kotlin.ExperimentalStdlibApi` コンパイラオプションによるオプトインが必要です。

以下に例を示します。

```kotlin
@OptIn(ExperimentalStdlibApi::class)
fun main() {
    val tags = mutableSetOf("kotlin", "jvm")

    // add() が true を返したときにメッセージを出力するために onTrue() 関数を使用します
    val added = tags.add("wasm").onTrue {
        println("Tag added")
    }
    println(added)
    // Tag added
    // true

    // remove() が false を返したときにメッセージを出力するために onFalse() 関数を使用します
    val removed = tags.remove("native").onFalse {
        println("Tag not found")
    }
    println(removed)
    // Tag not found
    // false

    // tags に "wasm" が含まれている場合にメッセージを返すために ifOrNull() 関数を使用します
    val message = ifOrNull("wasm" in tags) {
        "Wasm tag is available"
    }
    println(message)
    // Wasm tag is available
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.5.0-Beta1" validate="false"}

フィードバックを [YouTrack](https://youtrack.jetbrains.com/issue/KT-6938) でお待ちしております。

## Kotlin/JS: es2020 ターゲットのサポート {id="kotlin-js-support-for-the-es2020-target"}
<secondary-label ref="js"/>

Kotlin %kotlinEapVersion% では、Kotlin/JS コンパイラおよび Gradle プラグインに `es2020` ターゲットが追加されました。以前は `es5` と `es2015` ターゲットのみが利用可能であり、`BigInt` などの新しい JavaScript 機能のサポートは ES2015 をターゲットとして個別に有効にする必要がありました。ES2020 をターゲットにすることで、追加の設定なしで `BigInt` を含む ECMAScript 2020 までのすべてのサポートされている JavaScript 機能を使用できます。

新しいターゲットを有効にするには、`compilerOptions` ブロックで `target` を `es2020` に設定します。

```kotlin
kotlin { 
    js { 
        compilerOptions { 
            target.set("es2020") 
        }
    }
}
```

## Kotlin コンパイラ {id="kotlin-compiler"}

Kotlin %kotlinEapVersion% では、`.klib` コンパイル時における関数インライン化のさらなる改善や、型推論パフォーマンスの向上などの実験的機能がもたらされます<!-- and a new compilation scheme for Kotlin Multiplatform -->。

### klib コンパイル時における一貫したモジュール間関数インライン化 {id="consistent-cross-module-function-inlining-during-klib-compilation"}

<secondary-label ref="compiler"/>

Kotlin 2.4.0 では、`.klib` コンパイル時に [Kotlin/Native、Kotlin/JS、および Kotlin/Wasm におけるモジュール内の一貫した関数インライン化](whatsnew24.md#consistent-intra-module-function-inlining-during-klib-compilation) が有効になりました。異なる Kotlin プラットフォーム間での関数インライン化の一貫性により、互換性の保証を提供しやすくなります。

Kotlin 2.4.0 では、プロジェクト内のすべてのインライン関数が一貫してインライン化されることを保証する、`.klib` コンパイル時の**モジュール間 (cross-module)** インライン化を有効にする機能も導入されました。Kotlin %kotlinEapVersion% では、モジュール間インライン化がデフォルトで有効になります。

この機能で予期しない問題が発生した場合は、以下のコマンドラインコンパイラオプションで無効にすることができます。

```bash
-Xklib-ir-inliner=disabled
```

フィードバックの共有や問題の報告は [YouTrack](https://kotl.in/issue) でお願いします。

### 型推論パフォーマンスの向上 {id="improved-type-inference-performance"}

<primary-label ref="experimental-opt-in"/>

<secondary-label ref="compiler"/>

Kotlin %kotlinEapVersion% では、型推論中に生成される制約の数を減らすことで、コンパイラのパフォーマンスが向上しました。以前は、複雑なジェネリクスコードが過剰な制約を生成し、コンパイルや IDE の解析がハングすることがありました。この変更は、特定のコーナーケース、特にビルダー推論（builder inference）や変則的な境界を持つ複雑なプラットフォーム型が関与するものにおいて、型推論に影響を与える可能性があります。その結果、コンパイラが異なる型を推論したり、異なるオーバーロードを選択したり、異なる診断を報告したりする場合があります。これらの差異は、この改善による予期された結果である可能性があります。

この機能はデフォルトで有効になっています。以前の型推論の動作に戻すには、`-XXLanguage:-EliminateSecondKindIncorporation` オプションを使用してください。

フィードバックを [YouTrack](https://youtrack.jetbrains.com/issue/KT-85879) でお待ちしております。

<!--
### Kotlin Multiplatform 向けの新しい実験的コンパイルスキーム {id="new-experimental-compilation-scheme-for-kotlin-multiplatform"}

<primary-label ref="experimental-opt-in"/>

<secondary-label ref="compiler"/>

Kotlin %kotlinEapVersion% では、Kotlin Multiplatform (KMP) 向けの新しい実験的コンパイルスキームが導入され、コンパイラが共通ソースセットを IDE とより一貫して処理するようになります。この変更により、共通コードが誤ってプラットフォーム固有の宣言に解決されるのを防ぎ、オーバーロード解決と型推論の一貫性が向上し、共通ソースセットのインクリメンタルコンパイルが可能になります。KMP の分離コンパイルの詳細と試す方法については、[ブログ記事](TBD) を参照してください。
-->

## 互換性を損なう変更と非推奨化 {id="breaking-changes-and-deprecations"}

Kotlin %kotlinEapVersion% では、Kotlin コンパイラの実行に必要な最小 JDK バージョンを JDK 8 から JDK 17 に引き上げる第一歩として、警告が導入されました。開発を加速させ、より新しい Java バージョンを必要とする新しいライブラリにコンパイラがアクセスできるようにするために、最低必須 JDK を引き上げています。JDK 17 はサポート期間が長く、Gradle や Maven の新しいバージョンとの互換性を維持するのにも役立ちます。この警告を回避するには、`-Xallow-pre-17-runtime-jdk` コンパイラオプションを使用してください。このオプションは、JDK 17 が必須となる Kotlin 2.5.20 または 2.6.0 で削除される予定です。

プロジェクトのアップグレードに問題がある場合は、[YouTrack](https://kotl.in/issue) で経験を共有するか、Kotlin Slack で開発者に直接お問い合わせください。[招待を受け取り](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up?_gl=1*ju6cbn*_ga*MTA3MTk5NDkzMC4xNjQ2MDY3MDU4*_ga_9J976DJZ68*MTY1ODMzNzA3OS4xMDAuMS4xNjU4MzQwODEwLjYw)、[#compiler](https://kotlinlang.slack.com/archives/C7L3JB43G) チャンネルに参加してください。