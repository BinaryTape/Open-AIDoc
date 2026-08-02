[//]: # (title: Kotlin 2.4.0 の新機能)

<show-structure depth="1"/>

<web-summary>Kotlin 2.4.0 のリリースノートを読み、新しい言語機能、Kotlin Multiplatform、JVM、Native、JS、Wasm のアップデート、および Gradle と Maven のビルドツールサポートについて確認してください。</web-summary>

<tldr>
    <p>バグ修正リリース 2.4.10 の詳細については、<a href="https://github.com/JetBrains/kotlin/releases/tag/v2.4.10">変更ログ（changelog）</a>を参照してください。</p>
</tldr>

Kotlin 2.4.0 がリリースされました！主なハイライトは以下の通りです。

* **言語:** [安定したコンテキストパラメータ、明示的なバッキングフィールド、およびアノテーションの使用箇所ターゲットに関する複数の機能](#stable-features)
* **標準ライブラリ:** [UUID API のサポートを安定化](#stable-uuid-api-in-the-common-kotlin-standard-library)および[ソート順序チェックのサポート](#support-for-checking-sorted-order)
* **Kotlin/JVM:** [Java 26 のサポート](#support-for-java-26)および[メタデータ内のアノテーションをデフォルトで有効化](#annotations-in-metadata-enabled-by-default)
* **Kotlin/Native:** [Swift パッケージの依存関係としてのサポート、Swift export のアップデート、および CMS GC をデフォルトで有効化](#kotlin-native)
* **Kotlin/Wasm:** [インクリメンタルコンパイルをデフォルトで有効化し、WebAssembly コンポーネントモデルをサポート](#kotlin-wasm)
* **Kotlin/JS:** [値クラス（value class）のエクスポートと JS コードのインライン化における ES2015 機能のサポート](#kotlin-js)
* **Gradle:** [Gradle 9.5.0 との互換性](#gradle)
* **Maven:** [Java と JVM ターゲットバージョンの自動調整](#maven)
* **Kotlin コンパイラ:** [`.klib` コンパイル中のインライン関数動作の整合性を向上](#consistent-intra-module-function-inlining-during-klib-compilation)

> Kotlin のリリースサイクルに関する情報は、[Kotlin のリリースプロセス](releases.md)を参照してください。
>
{style="tip"}

## Kotlin 2.4.0 へのアップデート

Kotlin の最新バージョンは、[IntelliJ IDEA](https://www.jetbrains.com/idea/download/) および [Android Studio](https://developer.android.com/studio) の最新バージョンに含まれています。

新しい Kotlin バージョンにアップデートするには、IDE が最新バージョンであることを確認し、ビルドスクリプトで [Kotlin バージョンを 2.4.0 に変更](releases.md#update-to-a-new-kotlin-version)してください。

## 新機能 {id=new-stable-features}
<primary-label ref="stable"/>

以前の Kotlin リリースでは、いくつかの新機能が実験的（Experimental）として導入されました。以下の機能は Kotlin 2.4.0 で[安定（Stable）](components-stability.md#stability-levels-explained)へと昇格したため、使用するためにオプトインする必要はなくなりました。

* [コンテキストパラメータ (Context parameters)](context-parameters.md)（[コンテキスト引数](#explicit-context-arguments-for-context-parameters)と[呼び出し可能参照](https://github.com/Kotlin/KEEP/blob/context-parameters/proposals/context-parameters.md#callable-references)を除く）
* [プロパティの `@all` メタターゲット](annotations.md#all-meta-target)
* [使用箇所アノテーションターゲット（use-site annotation targets）の新しいデフォルトルール](annotations.md#defaults-when-no-use-site-targets-are-specified)
* [明示的なバッキングフィールド (Explicit backing fields)](properties.md#explicit-backing-fields)
* [共通 Kotlin 標準ライブラリでの安定した UUID API](#stable-uuid-api-in-the-common-kotlin-standard-library)
* [JVM 上で符号なし整数を `BigInteger` に変換するための新しい API](#new-api-for-converting-unsigned-integers-to-biginteger-on-the-jvm)
* [ソート順序チェックのサポート](#support-for-checking-sorted-order)
* [JavaScript/TypeScript への値クラスのエクスポートのサポート](#support-for-value-class-export-to-javascript-typescript)
* [JS コードのインライン化時における ES2015 機能のサポート](#support-for-es2015-features-when-inlining-js-code)
* [Maven: Java と JVM ターゲットバージョンの自動調整](#automatic-alignment-between-java-and-jvm-target-versions)
* [Maven Toolchains のサポート](#support-for-maven-toolchains)

## 新機能 {id=new-experimental-features}
<primary-label ref="experimental-exp"/>

* [コンテキストパラメータに対する明示的なコンテキスト引数](#explicit-context-arguments-for-context-parameters)
* [コレクションリテラルのサポート](#support-for-collection-literals)
* [コンパイル時定数の改善](#improved-compile-time-constants)
* [高階関数に対する未使用の結果チェックの改善](#improved-unused-result-checks-for-higher-order-functions) 
* [オプションパラメータのバージョンベースのオーバーロードを生成する新しい `@IntroducedAt` アノテーション](#new-introducedat-annotation-to-generate-version-based-overloads-for-optional-parameters)
* [`null` 値と存在しないキーを区別するための新しいマップフォールバック関数](#new-map-fallback-functions-to-distinguish-null-values-and-missing-keys)
* [Swift パッケージのインポート](#swift-package-import)
* [Swift export が Alpha に昇格し、並行処理のサポートが向上](#swift-export-goes-alpha-with-improved-concurrency-support)
* [WebAssembly コンポーネントモデルのサポート](#support-for-the-webassembly-component-model)

## 言語

Kotlin 2.4.0 では、コンテキストパラメータ、明示的なバッキングフィールド、およびアノテーションの使用箇所ターゲット機能が[安定（Stable）](components-stability.md#stability-levels-explained)に昇格しました。また、本リリースでは[コンテキストパラメータに対する明示的なコンテキスト引数](#explicit-context-arguments-for-context-parameters)が導入されています。

### 安定した機能
<secondary-label ref="language"/>

Kotlin 2.2.0 および 2.3.0 では、いくつかの言語機能が[実験的（Experimental）](components-stability.md#stability-levels-explained)として導入されました。本リリースで、以下の言語機能が[安定（Stable）](components-stability.md#stability-levels-explained)になったことをお知らせします。

* [コンテキストパラメータ](whatsnew22.md#preview-of-context-parameters)（[コンテキスト引数](#explicit-context-arguments-for-context-parameters)と[呼び出し可能参照](https://github.com/Kotlin/KEEP/blob/context-parameters/proposals/context-parameters.md#callable-references)を除く）
* [プロパティの `@all` メタターゲット](annotations.md#all-meta-target)
* [使用箇所アノテーションターゲットの新しいデフォルトルール](annotations.md#defaults-when-no-use-site-targets-are-specified)
* [明示的なバッキングフィールド](properties.md#explicit-backing-fields)

[Kotlin 言語デザインの機能とプロポーザルの全リストを確認する](kotlin-language-features-and-proposals.md)。

### インポートの最後のセグメントに対する非推奨警告の廃止
<secondary-label ref="language"/>

以前の Kotlin バージョンでは、非推奨（deprecated）のクラスをインポートすると、呼び出し箇所だけでなく、インポートディレクティブ自体でも非推奨エラーが報告されていました。インポート時の非推奨エラーを抑制する方法がなかったため、ファイル全体で非推奨レポートを抑制したり、スターインポートを使用したりして回避していたかもしれません。

呼び出されるシンボルのインポートに対して非推奨を報告することは、ほとんどの場合において有用ではないため、Kotlin 2.4.0 では、インポートディレクティブの最後のセグメントで非推奨のシンボルが参照されている場合に警告を表示しなくなりました。

詳細については、[KT-30155](https://youtrack.jetbrains.com/issue/KT-30155) を参照してください。

### コンテキストパラメータに対する明示的なコンテキスト引数
<primary-label ref="experimental-opt-in"/>

<secondary-label ref="language"/>

Kotlin 2.4.0 では、[コンテキストパラメータ](context-parameters.md)に対する明示的なコンテキスト引数が導入されました。

Kotlin 2.3.20 では、[コンテキストパラメータのオーバーロード解決が変更されました](whatsnew2320.md#changes-to-overload-resolution-for-context-parameters)。その結果、コンテキストパラメータのみが異なるオーバーロードの呼び出しがあいまいになる可能性があります。

呼び出し箇所で明示的なコンテキスト引数を渡すことで、このあいまいさを解消できるようになりました。

以下に例を示します。

```kotlin
class EmailSender
class SmsSender

context(emailSender: EmailSender)
fun sendNotification() {
    println("Sent email notification")
}

context(smsSender: SmsSender)
fun sendNotification() {
    println("Sent SMS notification")
}

context(defaultEmailSender: EmailSender, defaultSmsSender: SmsSender)
fun notifyUser() {
    
    // EmailSender コンテキストパラメータを持つオーバーロードを選択
    sendNotification(emailSender = defaultEmailSender)

    // SmsSender コンテキストパラメータを持つオーバーロードを選択
    sendNotification(smsSender = defaultSmsSender)
}
```

また、`context()` 関数の代わりに明示的なコンテキスト引数を使用することで、ネストを減らし、一部の呼び出しを読みやすくすることもできます。複数の呼び出しで同じコンテキスト引数を使用する必要がある場合は、代わりに `context()` 関数を使用してください。

この機能は[実験的（Experimental）](components-stability.md#stability-levels-explained)です。オプトインするには、ビルドファイルに以下のコンパイラオプションを追加してください。

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xexplicit-context-arguments")
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
                    <arg>-Xexplicit-context-arguments</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

</tab>
</tabs>

詳細については、この機能の [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0448-explicit-context-arguments.md) を参照してください。

### コレクションリテラルのサポート
<primary-label ref="experimental-opt-in"/>

<secondary-label ref="language"/>

Kotlin 2.4.0 では、コレクションリテラルの実験的なサポートが導入されました。ブラケット `[]` を使用して、よりシンプルかつ簡潔にコレクションを作成できるようになりました。

例えば以下の通りです。

```kotlin
fun main() {
    // 明示的な型宣言を伴うミュータブルなリスト
    // val shapes: MutableList<String> = mutableListOf("triangle", "square", "circle")

    // ブラケット構文を用いたミュータブルなリスト
    val shapes: MutableList<String> = ["triangle", "square", "circle"]
    println(shapes)
    // [triangle, square, circle]
}
```
{validate="false"}

> 現在、コレクションリテラルを使用して Java で定義されたコレクションを構築することはできません。詳細については、[KT-80494](https://youtrack.jetbrains.com/issue/KT-80494) を参照してください。
>
{style="note"}

コンパイラがコレクション型を推論するのに十分な情報を持っていない場合、デフォルトで `List` 型になります。

```kotlin
fun main() {
    val fruit = ["apple", "banana", "cherry"]
    
    println(fruit)
    // [apple, banana, cherry]
}
```
{validate="false"}

また、独自の型でブラケット構文を使用するために、カスタムの `operator fun of` 関数を宣言することもできます。例えば、以下のような `DoubleMatrix` クラスがあるとします。

```kotlin
class DoubleMatrix(vararg val rows: Row) {
    companion object {
        operator fun of(vararg rows: Row) = DoubleMatrix(*rows)
    }
    class Row(vararg val elements: Double) {
        companion object {
            operator fun of(vararg elements: Double) = Row(*elements)
        }
    }
}
```
{validate="false"}

以下のようにして `identityMatrix` クラスのインスタンスを作成できます。

```kotlin
fun main() {
    val identityMatrix: DoubleMatrix = [
        [1.0, 0.0, 0.0],
        [0.0, 1.0, 0.0],
        [0.0, 0.0, 1.0],
    ]
}
```
{validate="false"}

この例では、コンパイラはネストされたコレクションリテラルを、対応する `operator fun of` 関数の呼び出しに変換します。コンパイラはこれらの呼び出しを再帰的に解決し、期待される型を使用して正しいオーバーロードを選択します。

この機能は[実験的（Experimental）](components-stability.md#stability-levels-explained)です。オプトインするには、ビルドファイルに以下のコンパイラオプションを追加してください。

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xcollection-literals")
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
                    <arg>-Xcollection-literals</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

</tab>
</tabs>

詳細については、この機能の [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0416-collection-literals.md) を参照してください。

### コンパイル時定数の改善
<primary-label ref="experimental-opt-in"/>

<secondary-label ref="language"/>

Kotlin 2.4.0 では、[コンパイル時定数](properties.md#compile-time-constants)に対する実験的な改善が行われ、数値型および文字列型のサポートの一貫性が向上し、より使いやすくなりました。これらの改善には、以下のサポートが含まれます。

* 符号なし型（Unsigned type）の操作。
* `.lowercase()`、`.uppercase()`、`.trim()` などの文字列用標準ライブラリ関数。
* [列挙型定数（enum constants）](enum-classes.md#working-with-enum-constants)の `.name` プロパティおよび [`KCallable` インターフェース](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-callable/)の評価。

どの関数がコンパイル時に評価されるかを明確にするため、Kotlin 2.4.0 では `IntrinsicConstEvaluation` アノテーションを導入しました。一部の関数はコンパイル時に評価されますが、まだアノテーションが付与されていません。今後のリリースで、残りの関数にもアノテーションが追加される予定です。サポートされている関数のリストについては、KEEP の [付録（appendix）](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0444-improve-compile-time-constants.md#appendix) を参照してください。

この機能は[実験的（Experimental）](components-stability.md#stability-levels-explained)です。オプトインするには、ビルドファイルに以下のコンパイラオプションを追加してください。

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xintrinsic-const-evaluation")
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
                    <arg>-Xintrinsic-const-evaluation</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

</tab>
</tabs>

詳細については、この機能の [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0444-improve-compile-time-constants.md) を参照してください。

### 高階関数に対する未使用の結果チェックの改善
<primary-label ref="experimental-opt-in"/>

<secondary-label ref="language"/>

Kotlin 2.4.0 では、[未使用の戻り値チェッカー（unused return value checker）](unused-return-value-checker.md)を改善するために、新しい実験的な `returnsResultOf()` コントラクトを導入しました。

このコントラクトにより、チェッカーは無視できる未使用の結果と、`let` スコープ関数のようにラムダの結果を返す高階関数からの意味のある未使用の結果を区別できるようになります。

> Kotlin コントラクトは[実験的（Experimental）](components-stability.md#stability-levels-explained)です。オプトインするには、コントラクトを持つ関数を宣言する際に `@OptIn(ExperimentalContracts::class)` アノテーションを追加してください。
>
{style="warning"}

この機能を使用するには、関数のコントラクトに `returnsResultOf()` を追加します。

```kotlin
import kotlin.contracts.ExperimentalContracts
import kotlin.contracts.contract

@OptIn(ExperimentalContracts::class)
inline fun <T, R> T.customLet(block: (T) -> R): R {
    contract {
        returnsResultOf(block)
    }
    return block(this)
}
```

以下は、Nullable な値でカスタムの `.customLet()` 関数を使用する例です。

```kotlin
fun handleNullablePackageName(packageName: String?, builder: StringBuilder) {
    // append() 関数の戻り値は無視できるため、
    // チェッカーは警告を報告しません
    packageName?.customLet { builder.append(it) }

    // 返された文字列が使用されていないため、
    // チェッカーは警告を報告します
    packageName?.customLet { "kotlin.$it" }
}
```

未使用の戻り値チェッカーは[実験的（Experimental）](components-stability.md#stability-levels-explained)であり、未使用の戻り値を報告するには有効にする必要があります。
チェッカーの有効化と構成に関する詳細については、[未使用の戻り値チェッカー](unused-return-value-checker.md#configure-the-unused-return-value-checker)を参照してください。

#### 有効化する方法 {id=how-to-enable-unused-return-value-checker}

`returnsResultOf()` コントラクトは[実験的（Experimental）](components-stability.md#stability-levels-explained)です。これを使用すると、以前の Kotlin コンパイラバージョンでは読み取れないプレリリースバイナリが生成されることに注意してください。オプトインするには、ビルドファイルに以下のコンパイラオプションを追加してください。

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
// build.gradle(.kts)
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xallow-returns-result-of")
    }
}
```

</tab> <tab title="Maven" group-key="maven">

```xml
<!-- pom.xml -->
<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <configuration>
                <args>
                    <arg>-Xallow-returns-result-of</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```
</tab> 
</tabs>

### オプションパラメータのバージョンベースのオーバーロードを生成する新しい `@IntroducedAt` アノテーション
<primary-label ref="experimental-opt-in"/>

<secondary-label ref="language"/>

Kotlin 2.4.0 では、公開 API に新しいオプションパラメータを追加する際にバイナリ互換性を維持するための `@IntroducedAt` アノテーションを導入しました。

以前は、関数にオプションパラメータを追加する際、必要以上のオーバーロードを生成する可能性がある `@JvmOverloads` を使用するか、バイナリ互換性を維持するために古いシグネチャを非表示の非推奨（deprecated）オーバーロードとして保持する必要がありました。

`@IntroducedAt` アノテーションを使用すると、新しく追加されたオプションパラメータに、それが導入されたバージョンをアノテーションとして付与できます。コンパイラはこの情報を使用して、対応する非表示のオーバーロードを自動的に生成します。

このアノテーションは[実験的（Experimental）](components-stability.md#stability-levels-explained)です。オプトインするには、`@OptIn(ExperimentalVersionOverloading::class)` アノテーションを使用します。

以下に例を示します。

```kotlin
@OptIn(ExperimentalVersionOverloading::class)
fun Button(
    label: String = "",
    color: Color = DefaultColor,
    @IntroducedAt("1.1") borderColor: Color = DefaultBorderColor,
    @IntroducedAt("1.2") borderStyle: Style = DefaultBorderStyle,
    @IntroducedAt("1.2") borderWidth: Int = 1,
    onClick: () -> Unit
) {
    // 関数本体
}
```

この例では、コンパイラは `Button()` 関数の古いバージョンに対する非表示のオーバーロードを生成します。

`@IntroducedAt` と `@JvmOverloads` の両方がオーバーロードを生成するため、これらを併用するとオーバーロードの衝突が発生する可能性があります。両方のアノテーションを使用した場合、コンパイラは警告を報告します。警告を抑制した場合、コンパイラは `@IntroducedAt` アノテーションから生成されたオーバーロードを優先します。

## 標準ライブラリ

Kotlin 2.4.0 では、共通 Kotlin 標準ライブラリにおける UUID のサポートが安定化しました。また、JVM 上で符号なし整数を `BigInteger` に変換するための新しい拡張関数や、ソート順序をチェックするためのサポートも追加されました。

### 共通 Kotlin 標準ライブラリでの安定した UUID API
<secondary-label ref="standard-library"/>

Kotlin 2.0.20 では、[UUID を生成するためのクラス](whatsnew2020.md#support-for-uuids-in-the-common-kotlin-standard-library)（Universally Unique Identifiers）が導入され、Kotlin と Java の UUID 間の変換サポートが追加されました。その後のリリースで、以下のサポートを追加することで、この実験的機能は段階的に改善されました。

* [`<` および `>` 演算子による UUID の比較](whatsnew2120.md#changes-in-uuid-parsing-formatting-and-comparability)
* [16進数とハイフンの形式およびプレーンテキスト形式からの UUID のパース](uuids.md#parse-uuids)
* [無効な UUID をパースした際の `null` の返却](whatsnew23.md#support-for-returning-null-when-parsing-invalid-uuids)

Kotlin 2.4.0 では、[`kotlin.uuid.Uuid` API](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/) が[安定（Stable）](components-stability.md#stability-levels-explained)になりました。唯一の例外は、[V4 および V7 UUID を生成するための関数](whatsnew23.md#support-for-generating-v7-uuids-for-specific-timestamps)で、これらは引き続き[実験的（Experimental）](components-stability.md#stability-levels-explained)であり、オプトインが必要です。

UUID の操作方法に関する詳細は、[UUIDs](uuids.md) を参照してください。

### ソート順序チェックのサポート
<secondary-label ref="standard-library"/>

Kotlin 2.4.0 では、Iterable、配列、および Sequence におけるソート順序をチェックするための新しい拡張関数が追加されました。

以下の拡張関数が含まれます。

* `.isSorted()`
* `.isSortedDescending()`
* `.isSortedWith(comparator)`
* `.isSortedBy(selector)`
* `.isSortedByDescending(selector)`

これらの拡張関数を使用すると、再度ソートしたり独自のヘルパー関数を作成したりすることなく、要素が既にソートされているかどうかをチェックできます。要素が指定された順序である場合、または要素が 2 つ未満の場合は `true` を返し、そうでない場合は `false` を返します。これらの関数は順序外のペアを見つけた時点で停止するため、大規模な入力に対しても効率的です。

以下は、`.isSorted()` および `.isSortedBy()` 関数を使用したソート順序のチェック例です。

```kotlin
data class User(val name: String, val age: Int)

fun main() {
    val numbers = listOf(1, 2, 3, 4)
    println(numbers.isSorted())
    // true

    val users = listOf(
        User("Alice", 24),
        User("Bob", 31),
        User("Charlie", 29),
    )
    println(users.isSortedBy(User::age))
    // false
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.4.0-Beta2" id="kotlin-2-4-0-check-sorted-order"}

### JVM 上で符号なし整数を `BigInteger` に変換するための新しい API
<secondary-label ref="standard-library"/>

Kotlin 2.4.0 では、JVM 上に `UInt.toBigInteger()` および `ULong.toBigInteger()` 拡張関数が導入されました。

以前は、`UInt` および `ULong` の値を `BigInteger` に変換するには、文字列ベースの回避策やカスタムの変換ロジックが必要でした。Kotlin 2.4.0 以降では、`.toBigInteger()` を使用して符号なし整数の値を直接 `BigInteger` に変換できます。

以下に例を示します。

```kotlin
fun main() {
    //sampleStart
    val unsignedLong = Long.MAX_VALUE.toULong() + 1uL
    val unsignedInt = UInt.MAX_VALUE

    println(unsignedLong.toBigInteger())
    // 9223372036854775808

    println(unsignedInt.toBigInteger())
    // 4294967295
   //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.4.0-Beta2" id="kotlin-2-4-0-convert-unsigned-int"}

### null 値と存在しないキーを区別するための新しいマップフォールバック関数
<primary-label ref="experimental-opt-in"/>

<secondary-label ref="standard-library"/>

Kotlin 2.4.0 では、Nullable な値を持つマップ向けに、既存の [`.getOrElse()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/get-or-else.html) および [`.getOrPut()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/get-or-put.html) [マップ拡張関数](map-operations.md)の新しいバリアントが追加されました。これらの関数は、キーに対する値を取得するか、フォールバックとしてデフォルト値を使用します。Nullable な値を持つマップにおいて、新しいバリアントを使用すると、格納されている `null` 値を「存在しないキー」として扱うか、「既存の値」として扱うかを選択でき、その選択が関数名で明確になります。

新しい拡張関数には以下が含まれます。

* `.getOrElseIfNull(key, defaultValue)` および `.getOrPutIfNull(key, defaultValue)`：既存の `.getOrElse()` および `.getOrPut()` 関数と同様に、キーが存在しないか `null` 値を持つ場合にデフォルト値を返します。
* `.getOrElseIfMissing(key, defaultValue)` および `.getOrPutIfMissing(key, defaultValue)`：マップに指定されたキーが含まれていない場合にのみデフォルト値を返します。

これらの API は[実験的（Experimental）](components-stability.md#stability-levels-explained)であり、`@OptIn(ExperimentalStdlibApi::class)` アノテーションによるオプトインが必要です。

以下は、キーが存在し `null` 値を持つ場合の `.getOrPutIfNull()` と `.getOrPutIfMissing()` の違いを示す例です。

```kotlin
@OptIn(ExperimentalStdlibApi::class)
fun main() {
    val mapForNull = mutableMapOf<String, String?>("user" to null)
    val mapForMissing = mutableMapOf<String, String?>("user" to null)

    // "user" が null 値を持つ場合に値を置き換える
    mapForNull.getOrPutIfNull("user") { "default_user" }

    println(mapForNull)
    // {user=default_user}

    // "user" がマップに存在するため null 値を保持する
    mapForMissing.getOrPutIfMissing("user") { "default_user" }

    println(mapForMissing)
    // {user=null}
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.4.0" id="kotlin-2-4-0-getorput-diff"}

また、Nullable な値を格納するキャッシュに対して `.getOrElseIfMissing()` および `.getOrPutIfMissing()` 関数を使用することもできます。`defaultValue` が `null` を返した場合、マップはそれを保存し、同じキーに対して再度 `defaultValue` を呼び出すことはありません。

以下に例を示します。

```kotlin
data class Response(val body: String)

class Service {
    var queryCount = 0

    fun query(key: String): Response? {
        queryCount += 1
        return null
    }
}

//sampleStart
@OptIn(ExperimentalStdlibApi::class)
fun main() {
    val service = Service()
    val cache = mutableMapOf<String, Response?>()

    fun getCachedResponseOrQuery(key: String): Response? =
        cache.getOrPutIfMissing(key) { service.query(key) }

    // キャッシュに "user" が含まれていないため null を格納する
    getCachedResponseOrQuery("user")

    println(cache)
    // {user=null}

    // キャッシュされた null を使用し、サービスに再度問い合わせることはない
    getCachedResponseOrQuery("user")

    println(service.queryCount)
    // 1
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.4.0" id="kotlin-2-4-0-getorif-missing"}

[YouTrack](https://youtrack.jetbrains.com/issue/KT-67337) でのフィードバックをお待ちしております。

## Kotlin/JVM

Kotlin 2.4.0 では、新しい Java バージョンのサポートと、メタデータ内のアノテーションのデフォルト有効化が行われました。

### Java 26 のサポート
<secondary-label ref="jvm"/>

Kotlin 2.4.0 以降、コンパイラは Java 26 バイトコードを含むクラスを生成できるようになりました。

### メタデータ内のアノテーションをデフォルトで有効化
<secondary-label ref="jvm"/>

Kotlin 2.2.0 の Kotlin Metadata JVM ライブラリにおいて、[Kotlin メタデータに格納されたアノテーションの読み取りサポートが導入されました](whatsnew22.md#support-for-reading-and-writing-annotations-in-kotlin-metadata)。このサポートにより、Kotlin コンパイラはアノテーションを JVM バイトコードと共にメタデータに書き込み、Kotlin Metadata JVM ライブラリからアクセス可能にします。その結果、アノテーションプロセッサやその他のツールは、リフレクションを使用したりソースコードを修正したりすることなく、メタデータレベルでこれらのアノテーションを理解および操作できるようになります。

Kotlin 2.4.0 では、このサポートがデフォルトで有効になっています。

## Kotlin/Native

Kotlin 2.4.0 以降、[Swift export が Alpha に昇格しました](#swift-export-goes-alpha-with-improved-concurrency-support)。
本リリースでは、[Swift パッケージのインポート](#swift-package-import)、Xcode 26.4 のサポート、メモリ消費の改善、およびガベージコレクションの改善も行われています。

### ガベージコレクタにおけるコンカレント・マークのデフォルト化
<secondary-label ref="native"/>

Kotlin 2.0.20 において、Kotlin チームはコンカレント・マーク・アンド・スイープ・ガベージコレクタ (CMS GC) の [実験的なサポートを導入しました](whatsnew2020.md#concurrent-marking-in-garbage-collector)。ユーザーからのフィードバック対応とデグレードの修正を経て、Kotlin 2.4.0 より CMS をデフォルトで有効にする準備が整いました。

以前のデフォルト設定であったパラレル・マーク・コンカレント・スイープ (PMCS) では、GC がヒープ内のオブジェクトをマークする間、アプリケーションスレッドを停止させる必要がありました。対照的に、CMS ではマークフェーズをアプリケーションスレッドと並行して実行できます。

これにより、GC による停止時間が大幅に短縮され、アプリの応答性が向上します。これは、レイテンシに敏感なアプリケーションのパフォーマンスにおいて重要です。CMS は、[Compose Multiplatform](https://blog.jetbrains.com/kotlin/2024/10/compose-multiplatform-1-7-0-released/#performance-improvements-on-ios) で構築された UI アプリケーションのベンチマークにおいて、すでにその効果を実証しています。

問題が発生した場合は、PMCS に戻すことができます。そのためには、`gradle.properties` ファイルで以下の[バイナリオプション](native-binary-options.md)を設定してください。

```none
kotlin.native.binary.gc=pmcs
```

Kotlin/Native のガベージコレクタに関する詳細は、[ドキュメント](native-memory-manager.md#garbage-collector)を参照してください。

### 脱仮想化（devirtualization）分析中のメモリ消費量の削減
<secondary-label ref="native"/>

以前は、脱仮想化（devirtualization）分析は Kotlin/Native コンパイラにおいて最もメモリを消費するフェーズの一つでした。特に、大規模なプロジェクトにおいて、リンク・リリース・タスクが過剰なメモリを消費していました。

Kotlin 2.4.0 では、リンク・リリース・タスク中のピークメモリ消費量を削減する改善が導入されました。

EAP ユーザーの一人によるベンチマークによると、改善された脱仮想化分析により、リンク・リリース・タスクのメモリ消費量が半分に削減され、少なくとも 13 GB の節約になりました。

### Xcode 26.4 のサポート
<secondary-label ref="native"/>

Kotlin 2.4.0 以降、Kotlin/Native コンパイラは Xcode の最新安定バージョンの一つである Xcode 26.4 をサポートします。

Xcode をアップデートして最新の API にアクセスし、Apple オペレーティングシステム向けの Kotlin プロジェクトの作業を継続できるようになります。

### LLVM のバージョン 21 へのアップデート
<secondary-label ref="native"/>

Kotlin 2.4.0 では、LLVM をバージョン 19 から 21 にアップデートしました。新しいバージョンにはパフォーマンスの向上が含まれており、Kotlin/Native コンパイラを最新の状態に保つのに役立ちます。

このアップデートはコードに影響を与えないはずですが、問題が発生した場合は [Issue Tracker](http://kotl.in/issue) に報告してください。

### Apple ターゲットサポートの変更
<secondary-label ref="native"/>

Kotlin 2.4.0 では、Apple ターゲットのデフォルトの最小サポートバージョンが引き上げられました。

* iOS および tvOS：14.0 から 15.0 へ
* macOS：11.0 から 12.0 へ
* watchOS：7.0 から 8.0 へ

プロジェクトでデフォルトよりも低いバージョンをサポートする必要がある場合は、ビルドファイルで `freeCompilerArgs` オプションを使用してください。

```kotlin
kotlin {
    targets.withType<org.jetbrains.kotlin.gradle.plugin.mpp.KotlinNativeTarget>().configureEach {
        binaries.configureEach {
            freeCompilerArgs += "-Xoverride-konan-properties=minVersion.ios=14.0"
            freeCompilerArgs += "-Xoverride-konan-properties=minVersion.macos=11.0"
            freeCompilerArgs += "-Xoverride-konan-properties=minVersion.tvos=14.0"
            freeCompilerArgs += "-Xoverride-konan-properties=minVersion.watchos=7.0"
        }
    }
}
```

### Swift export が並行処理のサポート向上と共に Alpha に昇格
<primary-label ref="alpha"/>

<secondary-label ref="native"/>

Kotlin 2.4.0 以降、Swift export を通じた Swift との Kotlin の相互運用性が正式に Alpha になりました！
本リリースでは、並行処理（Concurrency）のサポートに大きな改善が加えられ、Swift export にネイティブで直接的な構造化された並行処理（Structured Concurrency）が追加されたほか、`kotlinx.coroutines` の Flow を Swift にエクスポートできるようになりました。

#### 構造化された並行処理のサポート
Swift から Kotlin の Suspend コードをシームレスに呼び出せるようになりました。Kotlin の [`suspend` 関数](composing-suspending-functions.md) および Suspend 関数型は、Swift のイディオマティックな `async` 対応版としてエクスポートされます。

```kotlin
// Kotlin
suspend fun hello(): String {
    delay(1000)
    return "Hello Swift! This is Kotlin."
}
```

```swift
// Swift
let msg = try await hello()
```
#### Flow 型の Swift へのエクスポート

このアップデートでは、`kotlinx.coroutines` の Flow を Swift にエクスポートするサポートも追加されました。`kotlinx.coroutines` の Flow は、並行して生成および消費できる非同期のデータストリームを表します。これらは、データベースの更新、ネットワークリクエスト、または UI イベントの監視などのリアクティブプログラミングパターンで一般的に使用されます。

以前は、[`kotlinx.coroutines.flow`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-flow/) の `Flow` インターフェースを Swift に公開するには、サードパーティのソリューションが必要でした。今回、Flow を Swift のイディオマティックな対応版である [`AsyncSequence`](https://developer.apple.com/documentation/Swift/AsyncSequence) として標準機能でエクスポートできるようになりました。

この機能はデフォルトで有効になっています。型情報を保持したまま、`Flow` 型を持つ任意のパブリック API を Swift にエクスポートできます。例：

```kotlin
// Kotlin
// Flow をエクスポートする際も String 型が保持されます
fun flowOfStrings(): Flow<String> = flowOf("hello", "any", "world")
```

```Swift
// Swift
var actual: [String] = []

// Kotlin から String 型が正しく推論されます
for try await element in flowOfStrings().asAsyncSequence() {
    actual.append(element)
}
```

Swift export に関する詳細は、[ドキュメント](native-swift-export.md)を参照してください。

### Swift パッケージのインポート
<primary-label ref="experimental-general"/>

<secondary-label ref="native"/>

Kotlin Multiplatform プロジェクトにおいて、Gradle 設定で iOS アプリの依存関係として [Swift パッケージ](https://docs.swift.org/swiftpm/documentation/packagemanagerdocs/) を宣言できるようになりました。

```kotlin
// build.gradle.kts
kotlin {
    swiftPMDependencies {
        swiftPackage(
            url = url("https://github.com/firebase/firebase-ios-sdk.git"),
            version = from("12.11.0"),
            products = listOf(
                product("FirebaseAI"),
                product("FirebaseAnalytics"),
                ...
}
```
{validate="false"}

動作するサンプルや詳細な情報については、[SwiftPM import](https://kotlinlang.org/docs/multiplatform/multiplatform-spm-import.html) を参照してください。

プロジェクトが CocoaPods 依存関係に依存している場合は、現在のセットアップを Swift パッケージを使用するように移行できます。KMP ツールはこのユースケースを考慮しており、プロジェクトの自動再構成を支援します。詳細は、[CocoaPods 移行ガイド](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-spm-migration.html)を参照してください。

## Kotlin/Wasm

Kotlin 2.4.0 では、Kotlin/Wasm のインクリメンタルコンパイルがデフォルトで有効になり、WebAssembly コンポーネントモデルのサポートが導入されました。

### インクリメンタルコンパイルをデフォルトで有効化
<secondary-label ref="wasm"/>

Kotlin/Wasm は Kotlin 2.1.0 でインクリメンタルコンパイルを導入しました。Kotlin 2.4.0 以降、これは[安定（Stable）](components-stability.md#stability-levels-explained)になり、デフォルトで有効になっています。この機能により、コンパイラは最近の変更の影響を受けたファイルのみを再ビルドするため、ビルド時間が大幅に短縮されます。

インクリメンタルコンパイルを無効にするには、プロジェクトの `local.properties` または `gradle.properties` ファイルに以下の行を追加してください。

```none
# gradle.properties
kotlin.incremental.wasm=false
```

問題が発生した場合は、[YouTrack](https://kotl.in/issue) に報告してください。

### Chrome DevTools における内部変数の表示改善
<secondary-label ref="wasm"/>

Kotlin 2.4.0 では、一時的な変数、合成（synthetic）変数、および内部変数をユーザー定義変数と区別しやすくすることで、Chrome DevTools における Kotlin/Wasm のデバッグ体験を向上させました。

Kotlin コンパイラおよび Compose などのコンパイラプラグインは、これらの変数を生成することがあります。これらはデフォルトで `~` プレフィックスを使用するようになり、Chrome DevTools が名前でソートする際にまとめてグループ化され、変数リストの末尾に移動されます。

### WebAssembly コンポーネントモデルのサポート
<primary-label ref="experimental-general"/>

<secondary-label ref="wasm"/>

Kotlin/Wasm は Kotlin 2.4.0 において、[WebAssembly コンポーネントモデル（WebAssembly Component Model）](https://component-model.bytecodealliance.org/) の実験的なサポートを導入し、さらに一歩前進しました。このプロポーザルは、標準化されたインターフェースと型を通じて Wasm モジュールからコンポーネントを構築する方法を定義しています。このアプローチは、Wasm を低レベルのバイナリ命令形式から、再利用可能で言語に依存しないコンポーネントを構成するためのシステムへと進化させるのに役立ちます。これにより、Kotlin/Wasm はブラウザを超えて活用できるようになります。例えば、Kotlin と WebAssembly は、FaaS（Function-as-a-Service）やサーバーレスアプリケーションに非常に適しています。

この機能を試すには、[`wasi:http` で構築されたシンプルなサーバー](https://github.com/Kotlin/sample-wasi-http-kotlin/) をチェックしてください。

<img src="kotlin-wasm-wasi-http.gif" alt="WebAssembly コンポーネントモデルを使用した Kotlin/Wasm" width="600"/>

[YouTrack](https://youtrack.jetbrains.com/issue/KT-64569/Kotlin-Wasm-Support-Component-Model) でフィードバックを共有してください。

## Kotlin/JS

Kotlin 2.4.0 では、JavaScript/TypeScript へのエクスポート機能がさらに強化され、値クラス、インターフェース、型の変性（variance）のエクスポート、および JS コードのインライン化時における ES2015 機能がサポートされました。

### JavaScript/TypeScript への値クラスのエクスポートのサポート
<secondary-label ref="js"/>

以前は、通常の Kotlin クラスのみが JavaScript/TypeScript にエクスポート可能でした。
Kotlin 2.4.0 ではこの制限がなくなりました。Kotlin の [インライン値クラス（inline value classes）](inline-classes.md) を通常の TypeScript クラスとしてエクスポートできるようになりました。

値クラスをエクスポートするには、Kotlin 側で `@JsExport` アノテーションを付与します。

```Kotlin
// Kotlin
@JsExport
@JvmInline
value class Email(val address: String) {
    init { require(address.contains("@")) { "Invalid email" } }
}

@JsExport
class AuthService {
    suspend fun login(email: Email): String = ...
}
```

TypeScript 側からは、通常のクラスのように見えます。

```TypeScript
// TypeScript
import { AuthService, Email } from "..."
const auth = new AuthService();

console.log(await auth.login(new Email("jane@example.com"))); 
// "Welcome, jane@example.com!"
console.log(await auth.login(new Email("not-an-email"))); 
// "Invalid email"
```

詳細は、[`@JsExport` アノテーション](js-to-kotlin-interop.md#jsexport-annotation) を参照してください。

### JS コードのインライン化時における ES2015 機能のサポート
<secondary-label ref="js"/>

Kotlin 2.4.0 以降、JavaScript コードのインライン化において [ES2015 機能](js-project-setup.md#support-for-es2015-features) を完全にサポートするようになりました。

これは、サードパーティライブラリとの相互運用性や、自動生成されるアプリケーションコードを直接制御する場合に有用です。

[`js()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.js/js.html) 呼び出しの中で、以下を含むモダンな JS 機能を使用できるようになりました。

* `const` および `let` 変数宣言
* ES クラス
* ジェネレータ
* ラムダ（[アロー関数](whatsnew21.md#support-for-generating-es2015-arrow-functions)）
* スプレッド演算子およびレスト演算子
* テンプレート文字列

`js()` 関数のパラメータは、コンパイル時にパースされ、JavaScript コードに「そのまま」変換されるため、文字列定数である必要があることに注意してください。
例えば、スプレッド演算子をインライン化するには以下のようにします。

```kotlin
fun spreadExample(): dynamic = js("""
    const add = (a, b, c) => a + b + c;

    const nums = [1, 2, 3];
    const sum = add(...nums);

    const a = [1, 2, 3];
    const b = [...a, 4, 5, 6];

    return { sum, b: b };
""")
```

JavaScript コードのインライン化に関する詳細は、[ドキュメント](js-interop.md#inline-javascript) を参照してください。

### TypeScript へのエクスポート時に型の変性を保持
<secondary-label ref="js"/>

以前は、型を TypeScript にエクスポートする際、ジェネリックな位置における Kotlin の [変性（variance）](generics.md#variance) 情報が失われていました。

Kotlin 2.4.0 では、エクスポート中も変性アノテーションが保存され、TypeScript の [変性アノテーション（variance annotations）](https://www.typescriptlang.org/docs/handbook/2/generics.html#variance-annotations) にマッピングされるようになりました。

Kotlin コードで、ジェネリック型パラメータの変性を定義します。

```Kotlin
// Kotlin
// 'out' は共変（covariance）を示す（インターフェースは T を生成するのみ）
interface Producer<out T> {
    fun produce(): T
}

// 'in' は反変（contravariance）を示す（インターフェースは T を消費するのみ）
interface Consumer<in T> {
    fun consume(item: T)
}
```

Kotlin 2.4.0 では、生成される TypeScript 出力において `in` および `out` キーワードが保持されます。

```TypeScript
// 生成された .d.ts
export interface Producer<out T> {
    produce(): T;
}

export interface Consumer<in T> {
    consume(item: T): void;
}
```

### インターフェースのエクスポートの改善
<secondary-label ref="js"/>

Kotlin 2.4.0 では、Kotlin インターフェースを JavaScript/TypeScript にエクスポートするのがより便利になりました。

新しい `@JsNoRuntime` アノテーションは、以前必要だった Kotlin インターフェースを実装するためのメタデータを削除し、外部インターフェースがデフォルトで動作するのと同様に、通常の TypeScript インターフェースに直接マッピングできるようにします。

Kotlin インターフェースをエクスポートするには、例えば Kotlin Multiplatform プロジェクトの場合、共通コード（common code）で `@JsNoRuntime` を付与します。

```kotlin
// commonMain
import kotlin.js.JsNoRuntime

@JsNoRuntime
expect interface DataProcessor {
    fun process(data: String): Int 
}
```

次に、JS 固有のソースコードで実際の（actual）実装を提供します。

```kotlin
// jsMain
@JsNoRuntime
actual interface DataProcessor {
    actual fun process(data: String)
} 
```

Kotlin インターフェースを実装するためのメタデータが削除されるため、インターフェースは通常の TypeScript インターフェースにマッピングされます。

```TypeScript
// 生成された .d.ts
export interface DataProcessor {
    process(data: string): void;
}
```

TypeScript が Kotlin インターフェースを通常の TypeScript インターフェースとして扱えるようにするため、`@JsNoRuntime` アノテーションは標準のインターフェースにのみ許可されます。したがって、以下の操作は禁止されています。

* `is` および `as` 型チェック。
* [`::class` 構文](js-reflection.md)によるクラス参照。
* インターフェースを inline reified 型引数として渡すこと。

> 外部（external）インターフェースに `@JsNoRuntime` を付与しないでください。コンパイラ警告が発生します。
>
{type="note"}

### インターフェースのエクスポートに関する制限の緩和
<primary-label ref="experimental-general"/>

<secondary-label ref="js"/>

Kotlin 2.4.0 では `@JsExport` の安定化に向けてさらなる一歩を踏み出し、Kotlin インターフェースのエクスポート方法を改善しました。

ネストされたクラスや名前付きコンパニオンオブジェクトを持つ Kotlin インターフェースをエクスポートできるようになりました。

```kotlin
@JsExport
interface Identity {
    class Metadata(val tag: String)

    companion object Registry {
        val defaultTag = "GUEST"
    }
}
```

詳細は、[`@JsExport` アノテーション](js-to-kotlin-interop.md#jsexport-annotation) を参照してください。

## Gradle

Kotlin 2.4.0 は、Gradle 7.6.3 から 9.5.0 までと完全に互換性があります。最新の Gradle リリースまでのバージョンも使用できますが、非推奨の警告が表示されたり、一部の新しい Gradle 機能が動作しなかったりする可能性があることに注意してください。
また、Kotlin 2.4.0 では、プラットフォーム間でのデフォルトモジュール名の一貫性向上や、Kotlin/JVM の Problems API へのコンパイラメッセージの書き込みなどの改善も行われています。

### 最小サポート AGP バージョンの引き上げ（8.5.2）
<secondary-label ref="gradle"/>

Kotlin 2.4.0 以降、サポートされる最小の Android Gradle plugin バージョンは 8.5.2 になりました。

### プラットフォーム間での一貫したモジュール名
<secondary-label ref="gradle"/>

Kotlin 2.4.0 より前は、デフォルトのモジュール名がプラットフォームごとに異なっていました。この不整合は名前の衝突や解決の問題を引き起こす可能性がありました。Kotlin 2.4.0 では、すべてのプラットフォームでデフォルト名を `{group}:{project_name}` に標準化しました。

JVM モジュール名を以前のバージョンに戻す必要がある場合は、Kotlin/JVM プロジェクトの `build.gradle.kts` ファイルに以下を追加してください。

```kotlin
kotlin {
    compilerOptions.moduleName(project.name)
}
```

マルチプラットフォームプロジェクトの場合：

```kotlin
kotlin {
    jvm {
        compilerOptions.moduleName(project.name)
    }
}
```

### Kotlin/JVM のコンパイラメッセージを Problems API に書き込み
<secondary-label ref="gradle"/>

Kotlin 2.2.0 において、Kotlin Gradle plugin (KGP) は、Gradle の CLI と IntelliJ IDEA の両方で一貫した体験を提供するために、[Gradle の Problems API](https://docs.gradle.org/current/userguide/reporting_problems.html) への診断レポートを開始しました。

Kotlin 2.4.0 では、プラグインは Kotlin/JVM のコンパイラメッセージも Problems API に書き込むようになり、API がすべてのログとメッセージの単一ソースになることに一歩近づきました。

## Maven

Kotlin 2.4.0 では、Maven Toolchains のサポートと、Java および JVM ターゲットバージョンの自動調整により、プロジェクト構成がさらに容易になりました。

### Java と JVM ターゲットバージョンの自動調整
<secondary-label ref="maven"/>

プロジェクト構成を簡素化し互換性の問題を回避するために、Kotlin Maven plugin は、プロジェクトで構成された Java コンパイラバージョンと JVM ターゲットバージョンを自動的に調整するようになりました。

これにより、Kotlin と Maven のコンパイラが同じバイトコードバージョンをターゲットにすることが保証され、Kotlin が生成したバイトコードがプロジェクトの残りの部分や意図したデプロイ環境と互換性がないという問題を回避できます。

`<extensions>` オプションを有効にすると、`kotlin.compiler.jvmTarget` または `kotlin.compiler.jdkRelease` オプションを設定する必要はありません。どちらも定義されていない場合、Kotlin Maven plugin は以下の順序で JVM ターゲットバージョンを自動的に解決します。

1. プロジェクトプロパティまたは `maven-compiler-plugin` 構成内で定義された `maven.compiler.release` バージョン。

   この場合、Kotlin コンパイラに対して `jvmTarget` と `jdkRelease` コンパイラオプションの両方が設定され、API が特定の JDK バージョンに制限されます。

2. Maven release バージョンが設定されていない場合は、`maven.compiler.target` バージョン。コンパイラターゲットは、プロジェクトプロパティまたは `maven-compiler-plugin` 構成内で定義できます。

   この場合、Kotlin の `jvmTarget` のみが設定され、API は特定の JDK バージョンに制限されません。

これにより、Kotlin プロジェクトの構成が大幅に簡素化され、`pom.xml` ファイルは以下のようになります。

```xml
<properties>
    <maven.compiler.release>17</maven.compiler.release>
    <kotlin.version>%kotlinVersion%</kotlin.version>
</properties>

<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <version>${kotlin.version}</version>
            <extensions>true</extensions>
        </plugin>
    </plugins>
</build>
```

ビルド中、プラグインは同様のメッセージを出力します。

```none
[INFO] Using jvmTarget=17 (derived from maven.compiler.release=17)
```

> `<extensions>` オプションは、プロジェクトレベルのプロパティとグローバルな `maven-compiler-plugin` 構成のみをチェックします。
> プラグインの `<executions>` セクション内で定義された構成はチェックしません。
>
{style="note"}

自動プロジェクト構成に関する詳細は、[ドキュメント](maven-configure-project.md#jvm-target-version) を参照してください。

### Maven Toolchains のサポート
<secondary-label ref="maven"/>

Kotlin 2.4.0 では、Kotlin Maven plugin に [Maven Toolchains](https://maven.apache.org/guides/mini/guide-using-toolchains.html) のサポートが導入されました。

この機能は、ビルドで使用する JDK バージョンの管理に役立ちます。Maven Toolchains を使用すると、Maven を実行している JVM バージョン（`JAVA_HOME` で設定）とは無関係に、Kotlin のコンパイルに使用する JDK バージョンを指定できます。ビルドで `maven-toolchains-plugin` が構成されている場合、Kotlin Maven plugin は、Maven コンパイラプラグインや他の Maven プラグインと同様に、選択された JDK ツールチェーンを自動的に取得します。これにより、Kotlin のコンパイルを含むビルド内のすべてのプラグインで使用される JDK を制御するための単一のツールチェーンを構成できます。

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-toolchains-plugin</artifactId>
    <version>3.2.0</version>
    <executions>
        <execution>
            <goals>
                <goal>toolchain</goal>
            </goals>
        </execution>
    </executions>
    <configuration>
        <toolchains>
            <jdk>
                <version>21</version>
            </jdk>
        </toolchains>
    </configuration>
</plugin>
```
JDK バージョンを設定するさまざまな方法の優先順位に注意してください。

1. `jdkHome`：`kotlin-maven-plugin` 構成内の `jdkHome`。明示的に設定された `jdkHome` オプションは、常にツールチェーンバージョンよりも優先されます。
2. `maven-toolchains-plugin` 内の JDK バージョン。Maven Toolchains を介して設定された JDK バージョンは、`JAVA_HOME` パスで設定された JDK バージョンを上書きします。
3. `JAVA_HOME` パス。

また、プラグイン固有の `<jdkToolchain>` オプションを使用して、`kotlin-maven-plugin` のツールチェーンで JDK バージョンを直接設定することもできます。`maven-toolchains-plugin` を使用する場合と比較して、このパラメータは Kotlin のコンパイルのみに影響し、ビルド内の他のプラグインには影響しません。

> 現在、`maven-toolchains-plugin` を特定の JDK バージョンを使用するように設定しても、`kotlin-maven-plugin` の `kapt` および `test-kapt` ゴールには影響しません。これを回避するには、`JAVA_HOME` パスに必要なバージョンを設定してください。詳細は、[KT-79897](https://youtrack.jetbrains.com/issue/KT-79897) を参照してください。
>
{style="note"}

Kotlin Maven プロジェクトの構成に関する詳細は、[ドキュメント](maven-configure-project.md) を参照してください。

## ビルドツール API
<secondary-label ref="bta"/>

Kotlin 2.4.0 では、ビルドツール API (Build Tools API, BTA) に多くの改善が加えられました。BTA は以下の通りです。

* ほとんどの JVM および共通コンパイラオプションに対して、新しい型安全な抽象化を導入しました。BTA がクライアントの代わりにフォーマットを処理するようになったため、エラーのリスクが軽減され、追加の支援レイヤーが提供されます。この変更は実行時には後方互換性がありますが、ソースの互換性が損なわれる可能性があります。
* インクリメンタルコンパイルにおいて、異なる Kotlin バージョンの構成やコンパイラオプションの変更など、ソース以外の変更を追跡できるようになりました。ビルドシステムは `BaseIncrementalCompilationConfiguration.TRACK_CONFIGURATION_INPUTS` オプションを介してこの動作を制御できます。
* `AbiValidationToolchain` を介して [バイナリ互換性検証（Binary compatibility validation）](gradle-binary-compatibility-validation.md) をサポートするようなり、他のビルドシステムがこの機能を追加しやすくなりました。
* ビルドシステムが [`CompilerMessageRenderer`](https://github.com/JetBrains/kotlin/blob/2.4.0/compiler/build-tools/kotlin-build-tools-api/src/main/kotlin/org/jetbrains/kotlin/buildtools/api/CompilerMessageRenderer.kt) インターフェースおよび [`JvmCompilationOperation` ビルダー](https://github.com/JetBrains/kotlin/blob/2.4.0/compiler/build-tools/kotlin-build-tools-api/src/main/kotlin/org/jetbrains/kotlin/buildtools/api/jvm/operations/JvmCompilationOperation.kt#L59) を介してコンパイラメッセージの表示方法をカスタマイズできる新機能を導入しました。
* [Kotlin デーモン (Kotlin daemon)](kotlin-daemon.md) のロギングを構成するための新しいオプションを導入しました。
  * `LOGS_PATH` — デーモンログファイルのディレクトリ。
  * `LOGS_FILE_SIZE_LIMIT` — ログファイルの最大サイズ（バイト）。
  * `LOGS_FILE_COUNT_LIMIT` — 保持されるログファイルの最大数。

  デフォルトでは、制限は Kotlin コンパイラバージョンに固有の値に設定されます。制限をなくすには、ビルドツールでオプションを `null` に設定する必要があります。

  ビルドシステムは [実行ポリシー](https://github.com/JetBrains/kotlin/blob/2.4.0/compiler/build-tools/kotlin-build-tools-api/src/main/kotlin/org/jetbrains/kotlin/buildtools/api/ExecutionPolicy.kt) を構成する際にオプションを設定できます。

  ```kotlin
  val executionPolicy = kotlinToolchains.daemonExecutionPolicy {
      set(ExecutionPolicy.WithDaemon.LOGS_PATH, Paths("/var/log/kotlin-daemon"))
      set(ExecutionPolicy.WithDaemon.LOGS_FILE_SIZE_LIMIT, 10_485_760L)
      set(ExecutionPolicy.WithDaemon.LOGS_FILE_COUNT_LIMIT, 10)
  }
  ```

## Kotlin コンパイラ

Kotlin 2.4.0 では、`.klib` コンパイル中に同じモジュール内で宣言されたインライン関数に対して、より一貫した動作が含まれています。

### klib コンパイル中のモジュール内関数インライン化の整合性向上
<secondary-label ref="compiler"/>

以前は、[関数インライン化](inline-functions.md) の動作は Kotlin プラットフォームごとに異なっていました。JetBrains チームは、同じ互換性保証を確実にするために、サポートされているすべてのプラットフォームでこれを統一することに取り組んでいます。

Kotlin/JVM では、関数のインライン化はコンパイル時に発生します。そのため、Kotlin ソースが Kotlin/JVM コンパイラでコンパイルされる際、インライン関数の本体が呼び出し箇所にインライン化されるため、生成されるクラスファイルのバイトコードにはインライン関数の呼び出しが含まれず、コンパイル中に動作が固定されます。

それとは対照的に、Kotlin/Native、Kotlin/JS、および Kotlin/Wasm では、関数のインライン化はソースから klib へのコンパイル中には行われず、バイナリ生成中のみに行われていました。その結果、`.klib` コンパイル中にインライン関数の動作が固定されず、`.klib` ライブラリは Kotlin/JVM が提供するようなインライン関数に対する同じ互換性保証を提供していませんでした。

Kotlin 2.4.0 では、`.klib` アーティファクト生成時にモジュール内（intra-module）のインライン化を有効にすることで、インライン関数の動作統一に向けた第一歩を踏み出しました。

```kotlin
// 既存の logging.klib ライブラリ
inline fun logDebug(message: String) {
    println("[DEBUG] $message")
}
```

```kotlin
// 現在コンパイル中の App モジュール
inline fun greetUser(name: String) {
    println("Hello, $name!")
}

fun main() {
    logDebug("App started") // インライン化されない：別のモジュールで宣言されている
    greetUser("Alice")      // インライン化される：同じモジュールで宣言されている
}
```

`.klib` にコンパイルされる際、コードは以下のようになります。

```kotlin
// 疑似コード
fun main() {
    logDebug("App started")  // インライン化されない、別のモジュールで宣言されている
    val tmp0 = "Alice"
    println("Hello, $tmp0!") // greetUser() からインライン化される
}
```

これは、同じモジュール内で宣言されたインライン関数のみが `.klib` コンパイル中にインライン化されることを意味します。この場合、他の関数はプラットフォーム固有のバイナリ生成中にインライン化されます。

#### 有効化する方法 {id=how-to-enable-intra-module-inlining}

2.4.0 以降、モジュール内インライン化は Kotlin/Native、Kotlin/JS、および Kotlin/Wasm でデフォルトで有効になっています。

この機能で予期しない問題が発生した場合は、コマンドラインで以下のコンパイラオプションを使用して無効にすることができます。

```bash
-Xklib-ir-inliner=disabled
```

次のステップは、プロジェクト内のすべてのインライン関数が一貫してインライン化されるように、モジュール間（cross-module）のインライン化を有効にすることです。この変更は将来の Kotlin リリースで予定されていますが、コマンドラインで以下のコンパイラオプションを使用してすでに試すことができます。

```bash
-Xklib-ir-inliner=full
```

フィードバックを共有し、[YouTrack](https://kotl.in/issue) に問題を報告してください。

### Kotlin コンパイラ間での一貫した部分ライブラリリンケージ
<secondary-label ref="compiler"/>

Kotlin 1.9.0 では、Kotlin/Native および Kotlin/JS コンパイラの両方で部分ライブラリリンケージ（partial library linkage）がデフォルトで有効になり、Kotlin 2.0.0 では Kotlin/Wasm がそれに続きました。この機能により、コンパイラは Kotlin ライブラリにおけるリンケージの問題を Kotlin/JVM と一貫して処理するようになります。

それ以来、否定的なフィードバックはなく、ユーザーがプロジェクトで部分リンケージを無効にしていることも見受けられませんでした。そのため、Kotlin 2.4.0 以降、部分リンケージは常に有効になり、`-Xpartial-linkage` コンパイラオプションは非推奨になりました。

すべての Kotlin コンパイラのデフォルトログレベルは `SILENT` です。リンケージの問題はコンパイル中に報告されません。プロジェクトでこの動作を変更するには、ビルドファイルで `-Xpartial-linkage-loglevel` コンパイラオプションを設定してください。

```kotlin
// build.gradle.kts
kotlin {
    macosX64("native") {
        binaries.executable()
        
        compilations.configureEach {
            compilerOptions.configure {
                // リンケージの問題を “info” ログレベルで報告する場合:
                freeCompilerArgs.add("-Xpartial-linkage-loglevel=INFO")

                // 問題をエラーとして報告する場合:
                freeCompilerArgs.add("-Xpartial-linkage-loglevel=ERROR")
            }
        }
    }
}
```
{validate="false"}

* `INFO` リンケージの問題を「info」ログレベルで報告します。
* `WARNING` コンパイル時に警告を報告し、コンパイルログに記録します。
* `ERROR` リンケージの問題が発生した場合にコンパイルを失敗させ、コンパイルログにエラーを報告します。リンケージの問題をより詳しく調査するには、このオプションを使用してください。

この機能で問題が発生した場合は、[Issue Tracker](https://kotl.in/issue) に報告してください。

## Kotlin コンパイラプラグイン

Kotlin 2.4.0 では、Kotlin のコンパイラプラグインにも注目すべきアップデートがありました。kapt プラグインはコンパイルクラスパスから不要なアノテーションプロセッサを除外できるようになり、Power-assert プラグインは新しいランタイムライブラリを通じて簡素化された構成を提供します。

### kapt: コンパイルクラスパスからアノテーションプロセッサを除外

Kotlin 2.4.0 では、Kotlin Gradle plugin と同様に、アノテーションプロセッサの検出のための `includeCompileClasspath` 構成オプションのサポートが追加されました。新しいオプションにより、不要なアノテーションプロセッサをコンパイルクラスパスから除外できます。

ビルドファイルでこれを構成するには、kapt プラグインの `<execution>` セクションで `includeCompileClasspath` オプションを `false` に設定します。

```xml
<execution>
    <id>kapt</id>
        <goals><goal>kapt</goal></goals>
        <configuration>
            <!-- 新しいオプションを追加 -->
            <includeCompileClasspath>false</includeCompileClasspath> 
            <sourceDirs>...</sourceDirs>
            <annotationProcessorPaths>...</annotationProcessorPaths>
        </configuration>
</execution>
```

または、`<properties>` セクションで `kapt.include.compile.classpath` を使用して同じことができます。

```xml
<properties>
    <kapt.include.compile.classpath>false</kapt.include.compile.classpath>
</properties>
```

このオプションを `false` に設定すると、kapt 構成の `<annotationProcessorPaths>` セクションに含まれていないアノテーションプロセッサは、kapt 処理から除外されます。

`includeCompileClasspath` が設定されておらず、kapt が `<annotationProcessorPaths>` セクションで明示的に定義されていないアノテーションプロセッサをコンパイルクラスパス上で検出した場合、以下の非推奨警告が表示されます。

```text
[WARNING] Annotation processors discovery from compile classpath is deprecated. Set 'kapt.include.compile.classpath=false' to disable discovery.
```

kapt の構成に関する詳細は、[ドキュメント](kapt.md) を参照してください。

### Power-assert: 新しいランタイムライブラリ

Kotlin 2.4.0 では、新しいランタイムライブラリにより、Power-assert 対応の関数がより見つけやすくなり、構成も容易になりました。

以前は、Power-assert を採用するには、複雑なビルド構成と関数パラメータの規約が必要でした。本リリース以降、Power-assert 対応の関数は、新しいランタイムライブラリを使用してコンパイラプラグインの変換と直接統合できるようになりました。

これにより、プラグインユーザーとライブラリ作成者の両方に大きな改善がもたらされます。

* 新しい `CallExplanation` データ構造は、呼び出し箇所に関する詳細な情報を提供します。これにより、アサーション失敗時のより動的な図のレンダリングや、外部ツールとのより良い統合が可能になります。
* 新しい `@PowerAssert` アノテーションにより、アサーション関数がコンパイラプラグインによって即座に検出可能になります。これにより、ライブラリに Power-assert の標準サポートをすぐに追加できるようになります。

> 新機能を試すためのプレイグラウンドとして、[サンプルコレクション](https://github.com/bnorm/power-assert-examples#power-assert-examples) を使用してください。
>
{style="tip"}

詳細は、[ドキュメント](power-assert.md#use-the-power-assert-plugin) を参照してください。

## Compose コンパイラ

Kotlin 2.4.0 の Compose コンパイラは、より一貫したインクリメンタルコンパイルを提供し、いくつかの機能フラグの非推奨サイクルを進めています。

### 内部宣言に対する一貫したインクリメンタルコンパイル
<secondary-label ref="compose-compiler"/>

Kotlin 2.4.0 以降、Compose コンパイラはより一貫したインクリメンタルコンパイルを提供します。異なるファイル間での内部（internal）型の安定性が実行時に推論されるようになりました。これにより、クラスの使用箇所が再コンパイルされない場合でも、Compose は推論された安定性数値を更新できます。

副次的な影響として、`@Composable` 関数が別のファイルの `internal` クラスをパラメータとして使用する場合、アーティファクトのサイズが増加する可能性があります。これは、安定性を実行時に決定する必要があるため、コンパイラが安定な場合と不安定な場合の両方の実行パスをエンコードすることが原因です。この実行時安定性のオーバーヘッドは、アプリ全体の最適化を行うミニファイア（R8 など）によって、不要な実行パスを推論して排除できるため、削除されます。

このアップデートは最終的な安定性数値を変更しないため、`@Composable` 関数の動作は変わりません。

### 機能フラグの非推奨
<secondary-label ref="compose-compiler"/>

Kotlin 2.4.0 では、安定（Stable）に昇格しデフォルトで有効になった実験的な機能フラグの非推奨サイクルを進めています。

* `StrongSkipping`、`IntrinsicRemember`、および関連する DSL プロパティは `DeprecationLevel.ERROR` に引き上げられました。これらは Kotlin 2.5.0 で削除される予定です。
* `OptimizeNonSkippingGroups` および `PausableComposition` は非推奨になりました。これらは Kotlin 2.6.0 で削除される予定です。

## 破壊的変更と非推奨

このセクションでは、重要な破壊的変更と非推奨事項をハイライトします。完全な概要については、[互換性ガイド](compatibility-guide-24.md) を参照してください。

* Kotlin 2.4.0 以降、コンパイラは `-language-version=1.9` をサポートしなくなりました。その結果、K1 コンパイラはサポートされなくなりました。
* Kotlin 2.4.0 では、Kotlin Gradle plugin におけるバイナリ互換性検証の DSL を合理化し、一部を非推奨にしました。最新の DSL については、[Kotlin Gradle plugin におけるバイナリ互換性検証](gradle-binary-compatibility-validation.md) を参照してください。
* [`KotlinScriptMojo` Maven プラグインによる Kotlin スクリプト実行のサポートが削除されました](compatibility-guide-22.md#deprecations-to-kotlin-scripting)。

## ドキュメントの更新
Kotlin エコシステムにおいて、以下のドキュメント変更を行いました。

* [Compose Multiplatform アプリにおける Liquid Glass](https://kotlinlang.org/docs/multiplatform/ios-liquid-glass.html) – iOS アプリを完全に Compose 主導のナビゲーションから、iOS 26 Liquid Glass スタイリングを使用したネイティブ SwiftUI ナビゲーションに移行。
* [KMP モジュールへの依存関係としての Swift パッケージの追加](https://kotlinlang.org/docs/multiplatform/multiplatform-spm-import.html) – KMP プロジェクトで SwiftPM 依存関係をセットアップする方法を学ぶ。
* [Kotlin Multiplatform プロジェクトを CocoaPods から SwiftPM 依存関係に切り替える](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-spm-migration.html)（手動または [Junie を使用](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-spm-migration-ai.html)） – Junie と Kotlin AI スキルを使用して移行を容易にする方法を学ぶ。
* [KMP アプリ用の TeamCity の構成](https://kotlinlang.org/docs/multiplatform/configure-teamcity-for-kmp.html) – TeamCity を使用して KMP アプリケーションをビルド、テスト、およびデプロイ。
* [Navigation 3 の推奨シリアル化アプローチ](https://kotlinlang.org/docs/multiplatform/compose-navigation-3.html#recommended-serialization-approaches) – CMP アプリケーションの Navigation 3 でシリアル化を使用するための最適な方法を確認。
* [Multiplatform ViewModel](https://kotlinlang.org/docs/multiplatform/compose-viewmodel.html) – マルチプラットフォームプロジェクトで ViewModel をセットアップし、操作する方法を学ぶ。
* [Kotlin によるバックエンド開発](server-overview.md) – バックエンド開発に使用できるさまざまなフレームワークを探索。
* [Spring Boot と Claude でタスク管理アプリを作成する](spring-boot-claude.md) – Claude が Spring Boot を使用してゼロからアプリを作成するのをどのように支援するかを学ぶ。
* [Maven プロジェクトを構成する](maven-configure-project.md) – 既存の Java Maven プロジェクトまたは新しい Kotlin Maven プロジェクトで Kotlin コンパイルをセットアップ。
* [Maven で Kotlin プロジェクトをテストする](jvm-test-maven.md) – JUnit でテストを作成し、Maven プラグインを使用してユニットテストおよび統合テストを実行する方法を学ぶ。
* [Kotlin プロジェクトでアノテーションプロセッサを使用する](jvm-annotation-processors.md) – バックエンドプロジェクトでアノテーションを処理するために kapt と KSP のどちらかを選択。
* [Kotlin AI スキル](kotlin-ai-skills.md) – エージェントスキルを使用して、Kotlin 固有のタスクの実行を支援。
* [Kotlin Language Server](kotlin-lsp.md) – JetBrains による公式の Kotlin 用 Language Server Protocol (LSP) 実装について読む。
* [数値型（Numbers）](numbers.md) – Kotlin の数値型とその操作方法を探索。
* [KSP を使い始める](ksp-quickstart.md) – KSP ベースのプロセッサをプロジェクトに追加したり、独自のプロセッサを作成したりする方法を学ぶ。
* [kapt から KSP に移行する](ksp-kapt-migration.md) – Kotlin の機能を最大限に活用するためにアノテーションプロセッサを移行。
* [Lincheck の概要](lincheck-guide.md) – JVM 上の並行コードをテストするために Lincheck が舞台裏でどのように動作するかを理解。
* [Lincheck を使い始める](lincheck-getting-started.md) – プロジェクトを作成し、Lincheck でテストを実行。
* [Lincheck で任意のコードをテストする](lincheck-testing-arbitrary-code.md) – Lincheck で並行コードをテストする方法を学ぶ。
* [Lincheck でデータ構造をテストする方法](lincheck-how-to-test-data-structures.md) – Lincheck のデータ構造テストプロセスを深く掘り下げる。
* [Lincheck によるテスト戦略](lincheck-testing-strategies.md) – Lincheck のテスト戦略（モデルチェックとストレス解消テスト）について学ぶ。
* [Lincheck によるテスト戦略の構成](lincheck-testing-strategies-options.md) – Lincheck のテスト戦略に関するさまざまなオプションを探索。
* [Dokku を使用して Ktor アプリケーションをデプロイする](https://ktor.io/docs/dokku.html) – Dokku を使用したデプロイワークフローについて学ぶ。