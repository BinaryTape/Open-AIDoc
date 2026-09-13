[//]: # (title: 未使用戻り値チェッカー)

<primary-label ref="experimental-general"/>

> この機能は、将来のKotlinリリースで安定化および改善される予定です。
> フィードバックは、課題トラッカー [YouTrack](https://youtrack.jetbrains.com/issue/KT-12719) までお寄せください。
> 
> 詳細については、関連する [KEEP提案](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0412-unused-return-value-checker.md) を参照してください。
>
{style="note"}

未使用戻り値チェッカーを使用すると、 _無視された結果_（ignored results）を検出できます。
これらは、`Unit`、`Nothing`、または `Nothing?` 以外を返す式から得られた値のうち、以下のいずれにも該当しないものを指します：

* 変数やプロパティに格納されている。
* 返り値として返されている、またはスローされている。
* 別の関数の引数として渡されている。
* 呼び出しまたはセーフコールのレシーバとして使用されている。
* `if`、`when`、`while` などの条件式でチェックされている。
* ラムダの最後の文として使用されている。

このチェッカーは、`++` や `--` などのインクリメント操作や、右辺で現在の関数を抜けるような論理演算のショートカット（例：`condition || return`）については、無視された結果として報告しません。

未使用戻り値チェッカーを使用することで、関数呼び出しが意味のある結果を生成しているにもかかわらず、その結果が暗黙的に破棄されているバグを特定できます。これにより、予期しない動作を防ぎ、そのような問題の追跡を容易にすることができます。

以下は、文字列が作成されたものの使用されていないため、チェッカーが無視された結果として報告する例です：

```kotlin
fun formatGreeting(name: String): String {
    if (name.isBlank()) return "Hello, anonymous user!"
    if (!name.contains(' ')) {
        // チェッカーはこの結果が無視されているという警告を報告します：
        // "Unused return value of 'plus'."
        "Hello, " + name.replaceFirstChar(Char::titlecase) + "!"
    }
    val (first, last) = name.split(' ')
    return "Hello, $first! Or should I call you Dr. $last?"
}
```

## 未使用戻り値チェッカーの設定 {id="configure-the-unused-return-value-checker"}

コンパイラが無視された結果をどのように報告するかは、`-Xreturn-value-checker` コンパイラオプションで制御できます。

以下のモードがあります：

* `disable`: 未使用戻り値チェッカーを無効にします（デフォルト）。
* `check`: チェッカーを有効にし、[マークされた関数](#mark-functions-to-check-ignored-results)からの無視された結果に対して警告を報告します。
* `full`: チェッカーを有効にし、プロジェクト内のすべての関数を[マーク済み](#mark-functions-to-check-ignored-results)として扱い、無視された結果に対して警告を報告します。

> すべてのマークされた関数はその性質が伝播され、あなたのコードを依存関係として使用するプロジェクトでチェッカーが有効になっている場合、無視された結果が報告されます。
> 
{style="note"}

プロジェクトで未使用戻り値チェッカーを使用するには、ビルド設定ファイルにコンパイラオプションを追加します：

<tabs>
<tab id="kotlin" title="Gradle">

```kotlin
// build.gradle(.kts)
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xreturn-value-checker=check")
    }
}
```
</tab>

<tab id="maven" title="Maven">

```xml
<!-- pom.xml -->
<plugin>
    <groupId>org.jetbrains.kotlin</groupId>
    ..
    <configuration>
        <args>
            <arg>-Xreturn-value-checker=check</arg>
        </args>
    </configuration>
</plugin>
```

</tab>
</tabs>

## 無視された結果をチェックする関数をマークする {id="mark-functions-to-check-ignored-results"}

[-Xreturn-value-checker コンパイラオプション](#configure-the-unused-return-value-checker)を `check` に設定すると、チェッカーは、Kotlin標準ライブラリのほとんどの関数のよう、マークされている式からの無視された結果のみを報告します。

自身のコードをマークするには、[`@MustUseReturnValues`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-must-use-return-values/) アノテーションを使用します。チェッカーの対象にしたいスコープに応じて、ファイル、クラス、または関数に適用できます。

例えば、ファイル全体をマークできます：

```kotlin
// このファイル内のすべての関数とクラスをマークし、チェッカーが未使用の戻り値を報告するようにします
@file:MustUseReturnValues

package my.project

fun someFunction(): String
```

または、特定のクラスをマークします：

```kotlin
// このクラス内のすべての関数をマークし、チェッカーが未使用の戻り値を報告するようにします
@MustUseReturnValues
class Greeter {
    fun greet(name: String): String = "Hello, $name"
}

fun someFunction(): Int = ...
```

> `-Xreturn-value-checker` コンパイラオプションを `full` に設定することで、プロジェクト全体にチェッカーを適用できます。このオプションを使用する場合、コードに `@MustUseReturnValues` をアノテートする必要はありません。
>
{style="note"}

## 無視された結果の報告を抑制する {id="suppress-reports-for-ignored-results"}

特定の関数に対して報告を抑制するには、[`@IgnorableReturnValue`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-ignorable-return-value/) をアノテートします。`MutableList.add` のように、結果を無視することが一般的で想定内である関数にアノテートしてください：

```kotlin
@IgnorableReturnValue
fun <T> MutableList<T>.addAndIgnoreResult(element: T): Boolean {
    return add(element)
}
```

関数自体にアノテートせずに警告を抑制することもできます。これを行うには、アンダースコア構文（`_`）を使用して、結果を特別な名前のない変数に代入します：

```kotlin
// 無視できない関数
fun computeValue(): Int = 42

fun main() {

    // 警告を報告：結果が無視されています
    computeValue()

    // 特別な未使用変数を使用して、この呼び出し箇所でのみ警告を抑制します
    val _ = computeValue()
}
```

### 関数のオーバーライドにおける無視された結果 {id="ignored-results-in-function-overrides"}

関数をオーバーライドすると、そのオーバーライドはベース宣言のアノテーションによって定義された報告ルールを継承します。これは、ベース宣言がKotlin標準ライブラリや他のライブラリ依存関係の一部である場合にも適用されるため、`Any.hashCode()` などの関数のオーバーライドに対しても、チェッカーは無視された結果を報告します。

また、`@IgnorableReturnValue` が付いた関数を、[戻り値の使用を要求する](#mark-functions-to-check-ignored-results)別の関数でオーバーライドすることはできません。ただし、`@MustUseReturnValues` がアノテートされたクラスやインターフェースにおいて、その結果を安全に無視できる場合には、オーバーライドに `@IgnorableReturnValue` をマークすることができます：

```kotlin
@MustUseReturnValues
interface Greeter {
    fun greet(name: String): String
}

object SilentGreeter : Greeter {
    @IgnorableReturnValue
    override fun greet(name: String): String = ""
}

fun check(g: Greeter) {
    // 警告を報告：未使用の戻り値
    g.greet("John")

    // 警告なし
    SilentGreeter.greet("John")
}
```

## 高階関数における未使用の結果のチェック {id="check-for-unused-results-in-higher-order-functions"}

`let` スコープ関数などの一部の高階関数は、ラムダの結果を返します。
高階関数の未使用のラムダ結果をチェックするには、関数のコントラクトに[試験的](components-stability.md#stability-levels-explained)（Experimental）な `returnsResultOf()` コントラクトを追加します。

> Kotlinのコントラクトは試験的（Experimental）です。オプトインするには、コントラクトを持つ関数を宣言する際に `@OptIn(ExperimentalContracts::class)` アノテーションを追加してください。
>
{style="warning"}

例を以下に示します：

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

これにより、`.customLet()` のようなこのコントラクトを持つ関数を使用して、ラムダの結果が使用されているかどうかをチェックできます：

```kotlin
fun handleNullablePackageName(packageName: String?, builder: StringBuilder) {
    // チェッカーは、append() の戻り値を無視できるため、警告を報告しません
    packageName?.customLet { builder.append(it) }

    // チェッカーは、返された文字列が使用されていないため、警告を報告します
    packageName?.customLet { "kotlin.$it" }
}
```

> `returnsResultOf()` コントラクトを使用するには、別途コンパイラオプションでのオプトインが必要です。これを使用すると、2.4.0より前のバージョンのKotlinコンパイラでは読み取ることができない、プレリリースバイナリが生成されることに注意してください。
>
{style="warning"}

プロジェクトでオプトインするには、ビルドファイルに以下のコンパイラオプションを追加します：

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

</tab> 
<tab title="Maven" group-key="maven">

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

## Javaアノテーションとの相互運用性 {id="interoperability-with-java-annotations"}

一部のJavaライブラリでは、異なるアノテーションを使用して同様のメカニズムを採用しています。
未使用戻り値チェッカーは、以下のアノテーションを `@MustUseReturnValues` を使用するのと同等として扱います：

* [`com.google.errorprone.annotations.CheckReturnValue`](https://errorprone.info/api/latest/com/google/errorprone/annotations/CheckReturnValue.html)
* [`edu.umd.cs.findbugs.annotations.CheckReturnValue`](https://findbugs.sourceforge.net/api/edu/umd/cs/findbugs/annotations/CheckReturnValue.html)
* [`org.jetbrains.annotations.CheckReturnValue`](https://javadoc.io/doc/org.jetbrains/annotations/latest/org/jetbrains/annotations/CheckReturnValue.html)
* [`org.springframework.lang.CheckReturnValue`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/lang/CheckReturnValue.html)
* [`org.jooq.CheckReturnValue`](https://www.jooq.org/javadoc/latest/org.jooq/org/jooq/CheckReturnValue.html)

また、[`com.google.errorprone.annotations.CanIgnoreReturnValue`](https://errorprone.info/api/latest/com/google/errorprone/annotations/CanIgnoreReturnValue.html) を `@IgnorableReturnValue` を使用するのと同等として扱います。