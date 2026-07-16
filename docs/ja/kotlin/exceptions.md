[//]: # (title: 例外とエラー処理)

<web-summary>Kotlinがランタイムエラーを処理するためにどのように例外を使用するかについて学びます。</web-summary>

例外（Exceptions）は、プログラムの実行を妨げる可能性のあるランタイムエラーが発生した場合でも、コードをより予測可能な形で動作させるのに役立ちます。
Kotlinでは、デフォルトですべての例外を「非チェック例外（unchecked exceptions）」として扱います。
非チェック例外は例外処理のプロセスを簡素化します。例外をキャッチすることはできますが、明示的に処理したり[宣言](java-to-kotlin-interop.md#checked-exceptions)したりする必要はありません。

> Java、Swift、Objective-Cとやり取りする際のKotlinの例外処理の詳細については、
> [Java、Swift、Objective-Cとの例外の相互運用性](#java-swift-objective-cとの例外の相互運用性)セクションを参照してください。
> 
{style="tip"}

例外の処理は、主に2つのアクションで構成されます：

* **例外のスロー（Throwing exceptions）：** 問題が発生したことを示します。
* **例外のキャッチ（Catching exceptions）：** 問題を解決するか、開発者やアプリケーションのユーザーに通知することで、予期しない例外を手動で処理します。

例外は [`Exception`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-exception/) クラスのサブクラスによって表されます。`Exception` 自体は [`Throwable`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-throwable/) クラスのサブクラスです。階層の詳細については、[例外の階層](#例外の階層)セクションを参照してください。`Exception` は [`openクラス`](inheritance.md) であるため、アプリケーションの特定のニーズに合わせて [カスタム例外](#カスタム例外の作成) を作成できます。

## 例外のスロー

`throw` キーワードを使用して、手動で例外をスローできます。
例外のスローは、コード内で予期しないランタイムエラーが発生したことを示します。
例外は [オブジェクト](classes.md#creating-instances) であり、例外をスローすると例外クラスのインスタンスが作成されます。

パラメータなしで例外をスローできます：

```kotlin
throw IllegalArgumentException()
```

問題の原因をよりよく理解するために、カスタムメッセージや元の原因（cause）などの追加情報を含めることができます：

```kotlin
val cause = IllegalStateException("Original cause: illegal state")

// userInputが負の場合にIllegalArgumentExceptionをスローする
// さらに、cause（IllegalStateException）によって表される元の原因を表示する
if (userInput < 0) {
    throw IllegalArgumentException("Input must be non-negative", cause)
}
```

この例では、ユーザーが負の値を入力したときに `IllegalArgumentException` がスローされます。
カスタムエラーメッセージを作成し、例外の元の原因（`cause`）を保持できます。これらは [スタックトレース](#スタックトレース) に含まれます。

### 事前条件関数による例外のスロー

Kotlinでは、事前条件関数（precondition functions）を使用して自動的に例外をスローする追加の方法を提供しています。
事前条件関数には以下が含まれます：

| 事前条件関数 | ユースケース | スローされる例外 |
|----------------------------------|------------------------------------------|------------------------------------------------------------------------------------------------------------------|
| [`require()`](#require関数) | ユーザー入力の有効性をチェックする | [`IllegalArgumentException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-illegal-argument-exception/)   |
| [`check()`](#check関数) | オブジェクトまたは変数の状態の有効性をチェックする | [`IllegalStateException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-illegal-state-exception/)         |
| [`error()`](#error関数) | 不正な状態または条件を示す | [`IllegalStateException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-illegal-state-exception/)         |

これらの関数は、特定の条件が満たされない場合にプログラムのフローを継続できない状況に適しています。
これによりコードが簡素化され、これらのチェックを効率的に処理できるようになります。

#### require() 関数

[`require()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/require.html) 関数は、関数の動作にとって入力引数が不可欠であり、それらが無効な場合に関数を続行できない場合に、引数の検証に使用します。

`require()` 内の条件が満たされない場合、[`IllegalArgumentException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-illegal-argument-exception/) をスローします：

```kotlin
fun getIndices(count: Int): `List<Int>` {
    require(count >= 0) { "Count must be non-negative. You set count to $count." }
    return List(count) { it + 1 }
}

fun main() {
    // これはIllegalArgumentExceptionで失敗します
    println(getIndices(-1))
    
    // 動作する例を見るには、以下の行のコメントを解除してください
    // println(getIndices(3))
    // [1, 2, 3]
}
```
{kotlin-runnable="true"}

> `require()` 関数を使用すると、コンパイラは [スマートキャスト](typecasts.md#smart-casts) を実行できます。
> チェックに成功すると、変数は自動的に非Null型にキャストされます。
> これらの関数は、処理を進める前に変数がNullでないことを確認するためのNull許容性のチェックによく使用されます。例えば：
>
> ```kotlin
> fun printNonNullString(str: String?) {
>     // Null許容性のチェック
>     require(str != null) 
>     // このチェックに成功した後、'str'は非Nullであることが保証され、
>     // 自動的に非NullのStringにスマートキャストされます
>     println(str.length)
> }
> ```
>
{style="note"}

#### check() 関数

[`check()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/check.html) 関数は、オブジェクトまたは変数の状態を検証するために使用します。
チェックに失敗した場合、それは対処が必要なロジックエラーがあることを示します。

`check()` 関数で指定された条件が `false` の場合、[`IllegalStateException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-illegal-state-exception/) をスローします：

```kotlin
fun main() {
    var someState: String? = null

    fun getStateValue(): String {

        val state = checkNotNull(someState) { "State must be set beforehand!" }
        check(state.isNotEmpty()) { "State must be non-empty!" }
        return state
    }
    // 下の行のコメントを解除すると、プログラムはIllegalStateExceptionで失敗します
    // getStateValue()

    someState = ""

    // 下の行のコメントを解除すると、プログラムはIllegalStateExceptionで失敗します
    // getStateValue() 
    someState = "non-empty-state"

    // これは "non-empty-state" を出力します
    println(getStateValue())
}
```
{kotlin-runnable="true"}

> `check()` 関数を使用すると、コンパイラは [スマートキャスト](typecasts.md#smart-casts) を実行できます。
> チェックに成功すると、変数は自動的に非Null型にキャストされます。
> これらの関数は、処理を進める前に変数がNullでないことを確認するためのNull許容性のチェックによく使用されます。例えば：
>
> ```kotlin
> fun printNonNullString(str: String?) {
>     // Null許容性のチェック
>     check(str != null) 
>     // このチェックに成功した後、'str'は非Nullであることが保証され、
>     // 自動的に非NullのStringにスマートキャストされます
>     println(str.length)
> }
> ```
>
{style="note"}

#### error() 関数

[`error()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/error.html) 関数は、論理的に発生してはならない不正な状態や条件を知らせるために使用されます。
予期しない状態に遭遇したときなど、意図的に例外をスローしたいシナリオに適しています。
この関数は特に `when` 式で有用で、論理的に発生し得ないケースを処理する明確な方法を提供します。

次の例では、`error()` 関数を使用して未定義のユーザーロールを処理しています。
ロールが定義済みのもののいずれでもない場合、[`IllegalStateException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-illegal-state-exception/) がスローされます：

```kotlin
class User(val name: String, val role: String)

fun processUserRole(user: User) {
    when (user.role) {
        "admin" -> println("${user.name} is an admin.")
        "editor" -> println("${user.name} is an editor.")
        "viewer" -> println("${user.name} is a viewer.")
        else -> error("Undefined role: ${user.role}")
    }
}

fun main() {
    // これは期待通りに動作します
    val user1 = User("Alice", "admin")
    processUserRole(user1)
    // Alice is an admin.

    // これはIllegalStateExceptionをスローします
    val user2 = User("Bob", "guest")
    processUserRole(user2)
}
```
{kotlin-runnable="true"}

## try-catch ブロックを使用した例外の処理

例外がスローされると、プログラムの通常の実行が中断されます。
`try` と `catch` キーワードを使用することで、例外を適切に処理し、プログラムの安定性を維持できます。
`try` ブロックには例外をスローする可能性のあるコードを記述し、`catch` ブロックは例外が発生した場合にそれをキャッチして処理します。
例外は、その特定の型または例外の [スーパークラス](inheritance.md) に一致する最初の `catch` ブロックによってキャッチされます。

`try` と `catch` キーワードを一緒に使用する方法は次のとおりです：

```kotlin
try {
    // 例外をスローする可能性のあるコード
} catch (e: SomeException) {
    // 例外を処理するためのコード
}
```

`try-catch` を式（expression）として使用することも一般的で、`try` ブロックまたは `catch` ブロックのいずれかから値を返すことができます：

```kotlin
fun main() {
    val num: Int = try {

        // count()が正常に完了した場合、その戻り値がnumに代入されます
        count()
        
    } catch (e: ArithmeticException) {
        
        // count()が例外をスローした場合、catchブロックは-1を返し、
        // それがnumに代入されます
        -1
    }
    println("Result: $num")
}

// ArithmeticExceptionをスローする可能性のある関数をシミュレート
fun count(): Int {
    
    // この値を変更して、numに別の値を返すようにします
    val a = 0
    
    return 10 / a
}
```
{kotlin-runnable="true"}

同じ `try` ブロックに対して複数の `catch` ハンドラーを使用できます。
異なる例外を個別に処理するために、必要なだけ `catch` ブロックを追加できます。
複数の `catch` ブロックがある場合、コードの上から下の順序に従って、最も具体的な例外から最も一般的な例外の順に並べることが重要です。
この順序はプログラムの実行フローと一致します。

[カスタム例外](#カスタム例外の作成) を使用したこの例を考えてみましょう：

```kotlin
open class WithdrawalException(message: String) : Exception(message)
class InsufficientFundsException(message: String) : WithdrawalException(message)

fun processWithdrawal(amount: Double, availableFunds: Double) {
    if (amount > availableFunds) {
        throw InsufficientFundsException("Insufficient funds for the withdrawal.")
    }
    if (amount < 1 || amount % 1 != 0.0) {
        throw WithdrawalException("Invalid withdrawal amount.")
    }
    println("Withdrawal processed")
}

fun main() {
    val availableFunds = 500.0

    // この値を変更して、さまざまなシナリオをテストしてください
    val withdrawalAmount = 500.5

    try {
        processWithdrawal(withdrawalAmount.toDouble(), availableFunds)

    // catchブロックの順序が重要です！
    } catch (e: InsufficientFundsException) {
        println("Caught an InsufficientFundsException: ${e.message}")
    } catch (e: WithdrawalException) {
        println("Caught a WithdrawalException: ${e.message}")
    }
}
```
{kotlin-runnable="true"}

`WithdrawalException` を処理する一般的な `catch` ブロックは、より具体的な `catch` ブロックで先にキャッチされない限り、`InsufficientFundsException` などの具体的なものを含め、その型のすべての例外をキャッチします。

### finally ブロック

`finally` ブロックには、`try` ブロックが正常に完了したか、例外をスローしたかにかかわらず、常に実行されるコードが含まれます。
`finally` ブロックを使用すると、`try` および `catch` ブロックの実行後に後処理コードを実行できます。
これはファイルやネットワーク接続などのリソースを扱う場合に特に重要で、`finally` によってそれらが適切に閉じられたり解放されたりすることが保証されます。

通常、`try-catch-finally` ブロックを組み合わせて使用する方法は次のとおりです：

```kotlin
try {
    // 例外をスローする可能性のあるコード
}
catch (e: YourException) {
    // 例外ハンドラー
}
finally {
    // 常に実行されるコード
}
```

`try` 式の戻り値は、`try` ブロックまたは `catch` ブロックのいずれかで最後に実行された式によって決定されます。
例外が発生しなかった場合は `try` ブロックから、例外が処理された場合は `catch` ブロックから結果が返されます。
`finally` ブロックは常に実行されますが、`try-catch` ブロックの結果は変更しません。

例を見てみましょう：

```kotlin
fun divideOrNull(a: Int): Int {
    
    // tryブロックは常に実行されます
    // ここで例外（ゼロ除算）が発生すると、直ちにcatchブロックにジャンプします
    try {
        val b = 44 / a
        println("try block: Executing division: $b")
        return b
    }
    
    // ArithmeticException（a == 0の場合のゼロ除算）によりcatchブロックが実行されます
    catch (e: ArithmeticException) {
        println("catch block: Encountered ArithmeticException $e")
        return -1
    }
    finally {
        println("finally block: The finally block is always executed")
    }
}

fun main() {
    
    // この値を変更して別の結果を得ます。ArithmeticExceptionの場合は -1 が返されます
    divideOrNull(0)
}
```
{kotlin-runnable="true"}

> Kotlinにおいて、`FileInputStream` や `FileOutputStream` などのファイルストリームのように、[`AutoClosable`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-auto-closeable/) インターフェースを実装するリソースを管理する慣用的な方法は、[`.use()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/use.html) 関数を使用することです。
> この関数は、例外がスローされたかどうかにかかわらず、コードブロックが完了すると自動的にリソースを閉じます。これにより、`finally` ブロックの必要性がなくなります。
> その結果、Kotlinはリソース管理のために [Javaの try-with-resources](https://docs.oracle.com/javase/tutorial/essential/exceptions/tryResourceClose.html) のような特別な構文を必要としません。
> 
> ```kotlin
> FileWriter("test.txt").use { writer ->
>     writer.write("some text")
>     // このブロックの後、.use 関数は finally ブロックと同様に、自動的に writer.close() を呼び出します
> }
> ```
> 
{style="note"}

例外を処理せずにリソースのクリーンアップが必要な場合は、`catch` ブロックなしで `try` と `finally` ブロックを使用することもできます：

```kotlin
class MockResource { 
    fun use() { 
        println("Resource being used") 
        // リソースの使用をシミュレート
        // ゼロ除算が発生すると ArithmeticException をスローします
        val result = 100 / 0
        
        // 例外がスローされた場合、この行は実行されません
        println("Result: $result") 
    }
    
    fun close() { 
        println("Resource closed") 
    }
}

fun main() { 
    val resource = MockResource()
//sampleStart 
    try {
        
        // リソースの使用を試みる
        resource.use()
        
    } finally {
        
        // 例外が発生したとしても、リソースが常に閉じられることを保証する
        resource.close()
    }

    // 例外がスローされた場合、この行は出力されません
    println("End of the program")
//sampleEnd
}
```
{kotlin-runnable="true"}

見ての通り、`finally` ブロックは、例外が発生したかどうかにかかわらず、リソースが閉じられることを保証します。

Kotlinでは、特定のニーズに応じて `catch` ブロックのみ、`finally` ブロックのみ、またはその両方を使用できる柔軟性がありますが、`try` ブロックには常に少なくとも1つの `catch` ブロックまたは `finally` ブロックが伴わなければなりません。

## カスタム例外の作成

Kotlinでは、組み込みの `Exception` クラスを継承するクラスを作成することで、カスタム例外を定義できます。
これにより、アプリケーションのニーズに合わせた、より具体的なエラータイプを作成できます。

作成するには、`Exception` を継承するクラスを定義します：

```kotlin
class MyException: Exception("My message")
```

この例では、デフォルトのエラーメッセージ "My message" が設定されていますが、必要に応じて空にすることもできます。

> Kotlinの例外は状態を持つ（stateful）オブジェクトであり、作成時のコンテキストに固有の情報（[スタックトレース](#スタックトレース)）を保持します。
> [オブジェクト宣言](object-declarations.md#object-declarations-overview)（`object`）を使用して例外を作成することは避けてください。
> 代わりに、必要なときに毎回例外の新しいインスタンスを作成してください。
> そうすることで、例外の状態が特定のコンテキストを正確に反映するようになります。
>
{style="tip"}

カスタム例外は、`ArithmeticException` サブクラスなどの既存の例外サブクラスのサブクラスにすることもできます：

```kotlin
class NumberTooLargeException: ArithmeticException("My message")
```

> カスタム例外のサブクラスを作成したい場合は、親クラスを `open` として宣言する必要があります。
> なぜなら、[クラスはデフォルトで final](inheritance.md) であり、そうしないとサブクラス化できないからです。
> 
> 例えば：
>
> ```kotlin
> // カスタム例外を open クラスとして宣言し、サブクラス化可能にする
> open class MyCustomException(message: String): Exception(message)
>
> // カスタム例外のサブクラスを作成する
> class SpecificCustomException: MyCustomException("Specific error message")
> ```
>
{style="note"}

カスタム例外は、組み込みの例外と同じように動作します。`throw` キーワードを使用してスローし、`try-catch-finally` ブロックで処理できます。例を見てみましょう：

```kotlin
class NegativeNumberException: Exception("Parameter is less than zero.")
class NonNegativeNumberException: Exception("Parameter is a non-negative number.")

fun myFunction(number: Int) {
    if (number < 0) throw NegativeNumberException()
    else if (number >= 0) throw NonNegativeNumberException()
}

fun main() {
    
    // この関数の値を変更して、別の例外を発生させてください
    myFunction(1)
}
```
{kotlin-runnable="true"}

多様なエラーシナリオを持つアプリケーションでは、例外の階層を作成することで、コードをより明確かつ具体的にできます。
これは、[抽象クラス](classes.md#abstract-classes) または [封印されたクラス（sealed class）](sealed-classes.md#constructors) を共通の例外機能のベースとして使用し、詳細な例外タイプのために具体的なサブクラスを作成することで実現できます。
さらに、デフォルト値を持つパラメータを含むカスタム例外は柔軟性を提供し、さまざまなメッセージでの初期化を可能にし、よりきめ細かいエラー処理を可能にします。

封印されたクラス `AccountException` を例外階層েরベースとし、デフォルト値を持つパラメータの使用例を示すサブクラス `APIKeyExpiredException` を使用した例を見てみましょう：

```kotlin
//sampleStart
// アカウント関連エラーの例外階層のベースとなる封印されたクラスを作成
sealed class AccountException(message: String, cause: Throwable? = null):
Exception(message, cause)

// AccountException のサブクラスを作成
class InvalidAccountCredentialsException : AccountException("Invalid account credentials detected")

// カスタムメッセージと原因の追加を可能にする AccountException のサブクラス
class APIKeyExpiredException(message: String = "API key expired", cause: Throwable? = null)	: AccountException(message, cause)

// プレースホルダー関数の値を変更して、異なる結果を得る
fun areCredentialsValid(): Boolean = true
fun isAPIKeyExpired(): Boolean = true
//sampleEnd

// アカウントの資格情報とAPIキーを検証
fun validateAccount() {
    if (!areCredentialsValid()) throw InvalidAccountCredentialsException()
    if (isAPIKeyExpired()) {
        // 特定の原因を指定して APIKeyExpiredException をスローする例
        val cause = RuntimeException("API key validation failed due to network error")
        throw APIKeyExpiredException(cause = cause)
    }
}

fun main() {
    try {
        validateAccount()
        println("Operation successful: Account credentials and API key are valid.")
    } catch (e: AccountException) {
        println("Error: ${e.message}")
        e.cause?.let { println("Caused by: ${it.message}") }
    }
}
```
{kotlin-runnable="true"}

## Nothing 型

Kotlinでは、すべての式に型があります。
式 `throw IllegalArgumentException()` の型は [`Nothing`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-nothing.html) です。これは、他のすべての型のサブタイプである組み込み型であり、[ボトム型（bottom type）](https://en.wikipedia.org/wiki/Bottom_type) としても知られています。
これは、`Nothing` が型エラーを引き起こすことなく、他の型が期待される場所で戻り値の型やジェネリック型として使用できることを意味します。

`Nothing` は、常に例外をスローするか無限ループのような終わりのない実行パスに入るため、正常に完了することのない関数や式を表すために使用される特別な型です。
まだ実装されていない関数や、常に例外をスローするように設計された関数をマークするために `Nothing` を使用でき、コンパイラとコードの読者の両方に意図を明確に示すことができます。
コンパイラが関数のシグネチャで `Nothing` 型を推論すると、警告が表示されます。
明示的に `Nothing` を戻り値の型として定義することで、この警告を消すことができます。

このKotlinコードは `Nothing` 型の使用例を示しています。コンパイラは関数呼び出しに続くコードを到達不能（unreachable）としてマークします：

```kotlin
class Person(val name: String?)

fun fail(message: String): Nothing {
    throw IllegalArgumentException(message)
    // この関数が正常に値を返すことはありません。
    // 常に例外をスローします。
}

fun main() {
    // 'name'がnullのPersonのインスタンスを作成
    val person = Person(name = null)
    
    val s: String = person.name ?: fail("Name required")

    // この時点で 's' が初期化されていることが保証されます
    println(s)
}
```
{kotlin-runnable="true"}

Kotlinの [`TODO()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-t-o-d-o.html) 関数も `Nothing` 型を使用しており、将来の実装が必要なコード領域を強調するためのプレースホルダーとして機能します：

```kotlin
fun notImplementedFunction(): Int {
    TODO("This function is not yet implemented")
}

fun main() {
    val result = notImplementedFunction()
    // これは NotImplementedError をスローします
    println(result)
}
```
{kotlin-runnable="true"}

見ての通り、`TODO()` 関数は常に [`NotImplementedError`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-not-implemented-error/) 例外をスローします。

## 例外クラス

Kotlinで見られる一般的な例外タイプをいくつか見てみましょう。これらはすべて [`RuntimeException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-runtime-exception/) クラスのサブクラスです：

* [`ArithmeticException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-arithmetic-exception/): ゼロ除算のように、算術演算の実行が不可能な場合に発生します。

    ```kotlin
    val example = 2 / 0 // ArithmeticException をスロー
    ```

* [`IndexOutOfBoundsException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-index-out-of-bounds-exception/): 配列や文字列などのインデックスが範囲外であることを示すためにスローされます。

    ```kotlin
    val myList = mutableListOf(1, 2, 3)
    myList.removeAt(3)  // IndexOutOfBoundsException をスロー
    ```

    > この例外を避けるには、[`getOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/get-or-null.html) 関数のようなより安全な代替手段を使用してください：
    > 
    > ```kotlin
    > val myList = listOf(1, 2, 3)
    > // IndexOutOfBoundsException の代わりに null を返す
    > val element = myList.getOrNull(3)
    > println("Element at index 3: $element")
    > ```
    > 
    {style="note"}

* [`NoSuchElementException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-no-such-element-exception/): 特定のコレクションに存在しない要素にアクセスしたときにスローされます。[`first()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first.html) や [`last()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/last.html) のような、特定の要素を期待するメソッドを使用するときに発生します。

    ```kotlin
    val emptyList = listOf<Int>()
    val firstElement = emptyList.first()  // NoSuchElementException をスロー
    ```

    > この例外を避けるには、[`firstOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first-or-null.html) 関数のようなより安全な代替手段を使用してください：
    >
    > ```kotlin
    > val emptyList = listOf<Int>()
    > // NoSuchElementException の代わりに null を返す
    > val firstElement = emptyList.firstOrNull()
    > println("First element in empty list: $firstElement")
    > ```
    >
    {style="note"}

* [`NumberFormatException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-number-format-exception/): 文字列を数値型に変換しようとしたが、文字列が適切な形式ではない場合に発生します。

    ```kotlin
    val string = "This is not a number"
    val number = string.toInt() // NumberFormatException をスロー
    ```
    
    > この例外を避けるには、[`toIntOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/to-int-or-null.html) 関数のようなより安全な代替手段を使用してください：
    >
    > ```kotlin
    > val nonNumericString = "not a number"
    > // NumberFormatException の代わりに null を返す
    > val number = nonNumericString.toIntOrNull()
    > println("Converted number: $number")
    > ```
    >
    {style="note"}

* [`NullPointerException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-null-pointer-exception/): アプリケーションが `null` 値を持つオブジェクト参照を使用しようとしたときにスローされます。
KotlinのNull安全機能は NullPointerException のリスクを大幅に軽減しますが、`!!` 演算子の意図的な使用や、KotlinのNull安全機能がないJavaとのやり取りの際に発生する可能性があります。

    ```kotlin
    val text: String? = null
    println(text!!.length)  // NullPointerException をスロー
    ```

Kotlinではすべての例外が非チェック例外であり、明示的にキャッチする必要はありませんが、必要に応じてキャッチできる柔軟性があります。

### 例外の階層

Kotlinの例外階層のルートは [`Throwable`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-throwable/) クラスです。
これには2つの直接のサブクラス、[`Error`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-error/) と [`Exception`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-exception/) があります：

* `Error` サブクラスは、アプリケーション自体では回復できない可能性のある、深刻で根本的な問題を表します。
これらは通常、[`OutOfMemoryError`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-out-of-memory-error/) や `StackOverflowError` のように、処理を試みるべきではない問題です。

* `Exception` サブクラスは、処理したい可能性のある条件に使用されます。
`Exception` 型のサブタイプ、例えば [`RuntimeException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-runtime-exception/) や `IOException` (Input/Output Exception) などは、アプリケーションにおける例外的なイベントを扱います。

![例外の階層 - Throwableクラス](throwable.svg){width=700}

`RuntimeException` は通常、プログラムコード内の不十分なチェックが原因で発生し、プログラムによって防ぐことができます。
Kotlinは、`NullPointerException` のような一般的な `RuntimeExceptions` を防ぐのに役立ち、ゼロ除算のような潜在的なランタイムエラーに対してコンパイル時の警告を提供します。次の図は、`RuntimeException` から派生したサブタイプの階層を示しています：

![RuntimeExceptionの階層](runtime-exception.svg){width=700}

## スタックトレース

*スタックトレース（stack trace）*は、デバッグに使用される、実行環境によって生成されるレポートです。
これは、プログラムの特定のポイント、特にエラーや例外が発生した場所に繋がる一連の関数呼び出しを示します。

JVM環境で例外が発生したためにスタックトレースが自動的に印刷される例を見てみましょう：

```kotlin
fun main() {
//sampleStart    
    throw ArithmeticException("This is an arithmetic exception!")
//sampleEnd    
}
```
{kotlin-runnable="true"}

JVM環境でこのコードを実行すると、次の出力が生成されます：

```text
Exception in thread "main" java.lang.ArithmeticException: This is an arithmetic exception!
    at MainKt.main(Main.kt:3)
    at MainKt.main(Main.kt)
```

最初の行は例外の説明で、以下が含まれます：

* 例外の型: `java.lang.ArithmeticException`
* スレッド: `main` 
* 例外メッセージ: `"This is an arithmetic exception!"`

例外の説明の後に `at` で始まる各行がスタックトレースです。1つの行は*スタックトレース要素（stack trace element）*または*スタックフレーム（stack frame）*と呼ばれます：

* `at MainKt.main (Main.kt:3)`: これはメソッド名 (`MainKt.main`) と、そのメソッドが呼び出されたソースファイルと行番号 (`Main.kt:3`) を示します。
* `at MainKt.main (Main.kt)`: これは、例外が `Main.kt` ファイルの `main()` 関数で発生したことを示します。

## Java、Swift、Objective-Cとの例外の相互運用性

Kotlinではすべての例外を非チェック例外として扱うため、チェック例外と非チェック例外を区別する言語からそのような例外が呼び出されると、複雑な事態を招く可能性があります。
KotlinとJava、Swift、Objective-Cのような言語間での例外処理のこの差異に対処するために、[`@Throws`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-throws/) アノテーションを使用できます。
このアノテーションは、発生し得る例外について呼び出し元に警告します。
詳細については、[JavaからKotlinを呼び出す](java-to-kotlin-interop.md#checked-exceptions) および [Swift/Objective-Cとの相互運用性](native-objc-interop.md#errors-and-exceptions) を参照してください。