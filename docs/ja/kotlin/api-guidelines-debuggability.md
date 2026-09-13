[//]: # (title: デバッグのしやすさ)

ライブラリのユーザーは、提供された機能を利用して開発を行いますが、作成された機能には特定して解決すべきエラーが含まれることがあります。
このエラー解決プロセスは、開発中のデバッガー内、または本番環境でのロギングやオブザーバビリティ（可観測性）ツールを使用して行われる可能性があります。
ライブラリで以下のベストプラクティスに従うことで、デバッグをより容易にすることができます。

## 状態を持つ型に toString メソッドを提供する {id="provide-a-tostring-method-for-stateful-types"}

状態を持つすべての型に対して、意味のある `toString` 実装を提供してください。
この実装は、内部的な型であっても、インスタンスの現在の内容を理解可能な形式で返す必要があります。

型の `toString` 表現はログに出力されることが多いため、このメソッドを実装する際はセキュリティを考慮し、機密性の高いユーザーデータを返さないようにしてください。

状態を記述するために使用する形式は、ライブラリ内の異なる型全体で可能な限り一貫性を持たせてください。
この形式が API によって実装される規約の一部である場合は、明示的に説明し、十分に文書化する必要があります。
`toString` メソッドからの出力は、自動テストスイートなどでのパースをサポートする場合があります。

例として、サービス サブスクリプションをサポートするライブラリの以下の型を考えてみましょう。

```kotlin
enum class SubscriptionResultReason {
    Success, InsufficientFunds, IncompatibleAccount
}

class SubscriptionResult(
    val result: Boolean,
    val reason: SubscriptionResultReason,
    val description: String
)
```

`toString` メソッドがない場合、`SubscriptionResult` インスタンスを出力してもあまり役立ちません。

```kotlin
fun main() {
    val result = SubscriptionResult(
       false,
       IncompatibleAccount,
       "Users account does not support this type of subscription"
    )
    
    // prints 'org.example.SubscriptionResult@13221655'
    println(result)
}
```

また、デバッガーでも情報はすぐには表示されません。

![Results in the debugger](debugger-result.png){width=500}

シンプルな `toString` 実装を追加することで、どちらの場合も出力が大幅に改善されます。

```kotlin
// prints 'Subscription failed (reason=IncompatibleAccount, description="Users 
// account does not support this type of subscription")'
override fun toString(): String {
    val resultText = if(result) "succeeded" else "failed"
    return "Subscription $resultText (reason=$reason, description=\"$description\")"
}
```

![Adding toString results in a much better result](debugger-result-tostring.png){width=700}

`toString` メソッドを自動的に取得するためにデータクラス（data class）を使用したくなるかもしれませんが、後方互換性の理由から推奨されません。
データクラスについては、「[API でのデータクラスの使用を避ける](api-guidelines-backward-compatibility.md#avoid-using-data-classes-in-your-api)」セクションで詳しく説明しています。

`toString` メソッドで記述される状態は、ドメイン領域の情報である必要はないことに注意してください。
それは、進行中のリクエストのステータス（上記の例のように）、外部サービスへの接続の健全性、または進行中の操作内の中間状態に関連するものでも構いません。

例として、以下のビルダー型を考えてみましょう。

```kotlin
class Person(
    val name: String?,
    val age: Int?,
    val children: List<Person>
) {
    override fun toString(): String =
        "Person(name=$name, age=$age, children=$children)"
}

class PersonBuilder {
    var name: String? = null
    var age: Int? = null
    val children = arrayListOf<Person>()

    fun child(personBuilder: PersonBuilder.() -> Unit = {}) {
       children.add(person(personBuilder))
    }
    fun build(): Person = Person(name, age, children)
}

fun person(personBuilder: PersonBuilder.() -> Unit = {}): Person = 
    PersonBuilder().apply(personBuilder).build()
```

この型は次のように使用します。

![Using the builder type example](halt-breakpoint.png){width=500}

上記の画像のブレークポイントでコードを停止させると、表示される情報は役に立ちません。

![Halting code at the breakpoint result](halt-result.png){width=500}

シンプルな `toString` 実装を追加すると、より役立つ出力が得られます。

```kotlin
override fun toString(): String =
    "PersonBuilder(name=$name, age=$age, children=$children)"
```

この追加により、デバッガーには次のように表示されます。

![Adding toString to the halt point](halt-tostring-result.png){width=700}

これにより、どのフィールドが設定されており、どれが設定されていないかを即座に確認できます。

## 例外処理のポリシーを採用し、文書化する {id="adopt-and-document-a-policy-for-handling-exceptions"}

「[適切なエラー処理メカニズムを選択する](api-guidelines-consistency.md#choose-the-appropriate-error-handling-mechanism)」セクションで説明したように、ライブラリが例外をスローしてエラーを通知するのが適切な場合があります。この目的のために、独自の例外型を作成することもできます。

低レベルの API を抽象化して簡素化するライブラリは、依存関係によってスローされる例外も処理する必要があります。ライブラリは、例外を抑制する、そのまま渡す、別の型の例外に変換する、あるいは別の方法でユーザーにエラーを通知することを選択できます。

コンテキストに応じて、これらのオプションのいずれも有効である可能性があります。例えば：

* ユーザーがライブラリ B を簡素化する利便性のためだけにライブラリ A を採用する場合、ライブラリ A はライブラリ B によって生成された例外をそのまま再スローするのが適切な場合があります。
* ライブラリ A が純粋に内部的な実装の詳細としてライブラリ B を採用している場合、ライブラリ B からスローされるライブラリ固有の例外がライブラリ A のユーザーに公開されるべきではありません。

ユーザーがライブラリを効果的に利用できるように、一貫した例外処理のアプローチを採用し、文書化する必要があります。これは特にデバッグにおいて重要です。ライブラリのユーザーは、デバッガーやログにおいて、例外があなたのライブラリから発生したものであることを識別できる必要があります。

例外の型はエラーの種類を示す必要があり、例外に含まれるデータはユーザーが問題の根本原因を特定するのに役立つものであるべきです。
一般的なパターンは、低レベルの例外をライブラリ固有の例外でラップし、元の例外を `cause` としてアクセス可能にすることです。

## カスタム例外でコルーチンのスタックトレース復元をサポートする {id="support-coroutine-stack-trace-recovery-for-custom-exceptions"}
<primary-label ref="experimental-general"/>

ライブラリ内のカスタム例外型にコルーチンの[スタックトレース復元 (stack trace recovery)](coroutines-debugging.md#stack-trace-recovery)のサポートを追加することで、デバッグをより容易にすることができます。
これにより、`kotlinx.coroutines` ライブラリや Kotlin のその他の非同期ランタイムに対するライブラリのサポートが向上します。

コルーチンがサスペンド関数を通じて別のコルーチンから例外を受け取ると、スタックトレース復元はその関数呼び出しに至るスタックフレームを含む例外のコピーを作成します。

`kotlinx.coroutines` ライブラリは、例外メッセージのみ、cause（原因）のみ、その両方、または引数を取らないコンストラクタを持つ例外に対して、自動的にスタックトレース復元を実行します。
ライブラリ内の例外型が行番号やエラーコードなどの追加のコンストラクタ引数を必要とする場合は、[`StackTraceRecoverable`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.coroutines.debug/-stack-trace-recoverable/) インターフェースを実装してください。

このインターフェースを実装するには、[`copyForStackTraceRecovery()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.coroutines.debug/-stack-trace-recoverable/copy-for-stack-trace-recovery.html) 関数をオーバーライドします。
オーバーライド内では、スタックトレース復元用の新しい例外インスタンスを返すか、`kotlinx.coroutines` ライブラリに例外をコピーさせたくない場合は `null` を返します。

`StackTraceRecoverable` インターフェースは Kotlin 標準ライブラリの一部であるため、これを実装しても `kotlinx.coroutines` ライブラリへの依存関係は追加されません。

以下は、スタックトレース復元のために新しいインスタンスを作成する際に `line` プロパティを保持するカスタム例外の例です。

```kotlin
import kotlin.coroutines.ExperimentalStdlibCoroutineSupportApi
import kotlin.coroutines.debug.StackTraceRecoverable

@OptIn(ExperimentalStdlibCoroutineSupportApi::class)
class FileEditException
// IllegalStateException のコンストラクタに cause を渡すために
// プライベートコンストラクタが必要
private constructor(
    val line: Int,
    private val detail: String,
    cause: Throwable?,
) : IllegalStateException("When editing line $line: $detail", cause),
    // スタックトレース復元のために StackTraceRecoverable を実装
    StackTraceRecoverable<FileEditException> {

    constructor(line: Int, detail: String) : this(line, detail, null)

    // 行番号とメッセージの詳細をコピー
    override fun copyForStackTraceRecovery(): FileEditException =
        FileEditException(line, detail, this)
    }

fun main() {
    val original = FileEditException(15, "Unexpected token")
    
    // 通常、動作をテストする場合を除き、この関数を直接呼び出す必要はありません
    // kotlinx.coroutines ライブラリがスタックトレース復元時に自動的に呼び出します
    val copy = original.copyForStackTraceRecovery()

    println(copy.message)
    // When editing line 15: Unexpected token

    println(copy.cause == original)
    // true
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.4.20"}

## 次のステップ {id="next-step"}

ガイドの次のパートでは、テストのしやすさについて学びます。

[次のパートへ進む](api-guidelines-testability.md)