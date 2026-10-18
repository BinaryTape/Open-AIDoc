[//]: # (title: シールドクラスとシールドインターフェース)

_シールド（Sealed）_ クラスおよびインターフェースは、クラス階層の継承を厳密に制御できるようにします。
シールドクラスのすべての直接のサブクラスはコンパイル時に認識されます。シールドクラスが定義されているモジュールおよびパッケージの外側に、他のサブクラスが出現することはできません。同じロジックがシールドインターフェースとその実装にも適用されます。シールドインターフェースを含むモジュールが一度コンパイルされると、新しい実装を作成することはできなくなります。

> 直接のサブクラス（Direct subclasses）とは、スーパークラスから直接継承しているクラスのことです。
> 
> 間接のサブクラス（Indirect subclasses）とは、スーパークラスから2階層以上離れて継承しているクラスのことです。
>
{style="note"}

シールドクラスやインターフェースを `when` 式と組み合わせると、起こりうるすべてのサブクラスの挙動を網羅でき、コードに悪影響を与える新たなサブクラスが作られないことを保証できます。

シールドクラスは、以下のようなシナリオで最も効果を発揮します：

* **制限されたクラス継承が望まれる場合:** あるクラスを拡張するサブクラスが事前に定義された有限のセットであり、それらすべてがコンパイル時に判明している場合。
* **型安全な設計が必要な場合:** プロジェクトにおいて安全性とパターンマッチングが極めて重要な場合。特に、状態管理や複雑な条件付きロジックの処理に適しています。例については、[when 式でのシールドクラスの使用](#use-sealed-classes-with-when-expression) を確認してください。
* **閉じた API を扱う場合:** サードパーティのクライアントが意図したとおりに API を使用できるように、ライブラリ向けに堅牢で保守性の高いパブリック API を提供したい場合。

より詳細な実際の応用例については、[ユースケースのシナリオ](#use-case-scenarios) を参照してください。

> Java 15 では[同様の概念](https://docs.oracle.com/en/java/javase/15/language/sealed-classes-and-interfaces.html#GUID-0C709461-CC33-419A-82BF-61461336E65F)が導入されました。Java のシールドクラスでは、`sealed` キーワードと `permits` 句を使用して制限された階層を定義します。
>
{style="tip"}

## シールドクラスまたはインターフェースの宣言 {id="declare-a-sealed-class-or-interface"}

シールドクラスまたはインターフェースを宣言するには、`sealed` 修飾子を使用します：

```kotlin
// シールドインターフェースの作成
sealed interface Error

// シールドインターフェース Error を実装するシールドクラスの作成
sealed class IOError(): Error

// シールドクラス 'IOError' を継承するサブクラスの定義
class FileReadError(val file: File): IOError()
class DatabaseError(val source: DataSource): IOError()

// 'Error' シールドインターフェースを実装するシングルトンオブジェクトの作成
object RuntimeError : Error
```

この例は、ライブラリのユーザーがスローされる可能性のあるエラーを処理できるように、エラークラスを含んだライブラリの API を表していると考えられます。
もしそのようなエラークラスの階層にパブリック API として公開されたインターフェースや抽象クラスが含まれていた場合、他の開発者がクライアントコード内でそれらを実装または継承することを防ぐ手段はありません。
ライブラリ側はその外部で宣言されたエラーについて認識できないため、自身のエラークラスと一貫した方法で処理することができません。
しかし、エラークラスの**シールド**された階層を使用すれば、ライブラリの作成者は可能性のあるすべてのエラー型を把握でき、後から別のエラー型が追加されないことを確信できます。

この例の階層構造は以下のようになります：

![シールドクラスとインターフェースの階層構造の図解](sealed-classes-interfaces.svg){width=700}

### コンストラクタ {id="constructors"}

シールドクラス自体は常に[抽象クラス (abstract class)](classes.md#abstract-classes)であり、結果として直接インスタンス化することはできません。
ただし、コンストラクタを含めたり継承したりすることは可能です。これらのコンストラクタはシールドクラス自体のインスタンスを生成するためのものではなく、そのサブクラスのためのものです。`Error` というシールドクラスと、それをインスタンス化するいくつかのサブクラスの例を見てみましょう：

```kotlin
sealed class Error(val message: String) {
    class NetworkError : Error("Network failure")
    class DatabaseError : Error("Database cannot be reached")
    class UnknownError : Error("An unknown error has occurred")
}

fun main() {
    val errors = listOf(Error.NetworkError(), Error.DatabaseError(), Error.UnknownError())
    errors.forEach { println(it.message) }
}
// Network failure 
// Database cannot be reached 
// An unknown error has occurred
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.5"}

シールドクラス内で [`enum`](enum-classes.md) クラスを使用し、enum 定数を用いて状態を表したり詳細情報を追加したりできます。各 enum 定数は**単一**のインスタンスとしてのみ存在しますが、シールドクラスのサブクラスは**複数**のインスタンスを持つことができます。
この例では、`sealed class Error` とそのいくつかのサブクラスが、エラーの重大度を示すために `enum` を利用しています。
各サブクラスのコンストラクタは `severity` を初期化し、その状態を変更することができます：

```kotlin
enum class ErrorSeverity { MINOR, MAJOR, CRITICAL }

sealed class Error(val severity: ErrorSeverity) {
    class FileReadError(val file: File): Error(ErrorSeverity.MAJOR)
    class DatabaseError(val source: DataSource): Error(ErrorSeverity.CRITICAL)
    object RuntimeError : Error(ErrorSeverity.CRITICAL)
    // ここに追加のエラー型を追加可能
}
```

シールドクラスのコンストラクタは、2つの[可視性](visibility-modifiers.md)のうちいずれかを持つことができます：`protected`（デフォルト）または `private` です：

```kotlin
sealed class IOError {
    // シールドクラスのコンストラクタはデフォルトで protected の可視性を持ちます。このクラス内およびそのサブクラスから参照可能です
    constructor() { /*...*/ }

    // private コンストラクタ。このクラス内からのみ参照可能です。
    // シールドクラスで private コンストラクタを使用すると、インスタンス化をより厳格に制御でき、クラス内での特定の初期化手順が可能になります。
    private constructor(description: String): this() { /*...*/ }

    // public および internal コンストラクタはシールドクラスでは許可されていないため、エラーが発生します
    // public constructor(code: Int): this() {} 
}
```

## 継承 {id="inheritance"}

シールドクラスおよびシールドインターフェースの直接のサブクラスは、同じパッケージ内で宣言されている必要があります。それらはトップレベルで定義されていても、名前付きクラス、名前付きインターフェース、または名前付きオブジェクトの中にネストされていても構いません。[プロパティのオーバーライド](inheritance.md#overriding-properties)を含む Kotlin の通常の継承ルールと互換性がある限り、サブクラスは任意の[可視性](visibility-modifiers.md)を持つことができます。

シールドクラスのサブクラスには、適切に修飾された名前（qualified name）が必要です。ローカルオブジェクトや匿名オブジェクトにすることはできません。

> `enum` クラスはシールドクラスやその他のクラスを継承することはできません。ただし、シールドインターフェースを実装することは可能です：
>
> ```kotlin
> sealed interface Error
> 
> // シールドインターフェース Error を実装する enum クラス
> enum class ErrorType : Error {
>     FILE_ERROR, DATABASE_ERROR
> }
>
> ```
> 
{style="note"}

これらの制限は間接のサブクラスには適用されません。シールドクラスの直接のサブクラスが sealed としてマークされていない場合、その修飾子が許す任意の方法で拡張できます：

```kotlin
// シールドインターフェース 'Error' は、同じパッケージおよびモジュール内でのみ実装を持ちます
sealed interface Error

// シールドクラス 'IOError' は 'Error' を拡張し、同じパッケージ内でのみ拡張可能です
sealed class IOError(): Error

// open クラス 'CustomError' は 'Error' を拡張し、自身が可視である場所ならどこからでも継承可能です
open class CustomError(): Error
```

### マルチプラットフォームプロジェクトにおける継承 {id="inheritance-in-multiplatform-projects"}

[マルチプラットフォームプロジェクト](https://kotlinlang.org/docs/multiplatform/get-started.html)には、継承に関するもう1つの制限があります。シールドクラスの直接のサブクラスは、同じ[ソースセット](https://kotlinlang.org/docs/multiplatform/multiplatform-discover-project.html#source-sets)内に存在しなければなりません。これは、[expect および actual 修飾子](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html)を持たないシールドクラスに適用されます。

シールドクラスが共通のソースセット内で `expect` として宣言され、プラットフォームのソースセット内に `actual` 実装を持つ場合、`expect` バージョンと `actual` バージョンの両方がそれぞれのソースセット内でサブクラスを持つことができます。さらに、階層構造を使用している場合は、`expect` 宣言と `actual` 宣言の間にある任意のソースセットでサブクラスを作成できます。

[マルチプラットフォームプロジェクトの階層構造についての詳細](https://kotlinlang.org/docs/multiplatform/multiplatform-hierarchy.html)をご覧ください。

## when 式でのシールドクラスの使用 {id="use-sealed-classes-with-when-expression"}

シールドクラスを使用する最大の利点は、[`when`](control-flow.md#when-expressions-and-statements) 式で使用したときに発揮されます。
シールドクラスと組み合わせて `when` 式を使用すると、Kotlin コンパイラは可能なすべてのケースが網羅されているかを網羅的にチェック（exhaustive check）できます。
そのような場合、`else` 節を追加する必要はありません：

```kotlin
// シールドクラスとそのサブクラス
sealed class Error {
    class FileReadError(val file: String): Error()
    class DatabaseError(val source: String): Error()
    object RuntimeError : Error()
}

//sampleStart
// エラーをログ出力する関数
fun log(e: Error) = when(e) {
    is Error.FileReadError -> println("Error while reading file ${e.file}")
    is Error.DatabaseError -> println("Error while reading from database ${e.source}")
    Error.RuntimeError -> println("Runtime error")
    // すべてのケースが網羅されているため `else` 節は不要
}
//sampleEnd

// すべてのエラーをリスト化
fun main() {
    val errors = listOf(
        Error.FileReadError("example.txt"),
        Error.DatabaseError("usersDatabase"),
        Error.RuntimeError
    )

    errors.forEach { log(it) }
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.5"}

> `when` 式での重複記述を減らすために、コンテキスト依存の解決（context-sensitive resolution、現在はプレビュー段階）を試してみてください。
> この機能を使用すると、期待される型が既知である場合、シールドクラスのメンバーをマッチングするときに型名を省略できます。
>
> 詳細については、[コンテキスト依存の解決のプレビュー](whatsnew22.md#preview-of-context-sensitive-resolution)または関連する [KEEP プロポーザル](https://github.com/Kotlin/KEEP/blob/improved-resolution-expected-type/proposals/context-sensitive-resolution.md)を参照してください。
> 
{style="tip"}

シールドクラスを `when` 式で使用する場合、ガード条件（guard condition）を追加して単一の分岐内にさらなるチェックを含めることもできます。
詳細については、[when 式におけるガード条件](control-flow.md#guard-conditions-in-when-expressions)を参照してください。

> マルチプラットフォームプロジェクトにおいて、共通コード内の[expect 宣言](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html)としてシールドクラスを持つ `when` 式を使用している場合でも、`else` 分岐が必要です。
> これは、プラットフォーム側の `actual` 実装のサブクラスが、共通コードでは認識されていない形でシールドクラスを継承している可能性があるためです。
>
{style="note"}

## リフレクションによるシールドサブクラスの検査 {id="inspect-sealed-subclasses-with-reflection"}

実行時にシールドクラスまたはインターフェースの直接のサブクラスを検査するために、[リフレクション (Reflection)](reflection.md) 機能を使用できます。
これは、フレームワークのコードがシールド階層のバリエーションを発見するのに役立ちます。例えば、シリアライザーを登録したり、すべてのバリエーションにハンドラーが存在することを確認したりできます。

既知の直接のサブクラスを検査する必要がある場合は、[sealedSubclasses](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-class/sealed-subclasses.html) を使用します。
このメソッドは、通常のクラスまたはオブジェクト宣言を表すことができる [`KClass`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-class/) を返します。オブジェクト宣言の場合、[`objectInstance`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-class/object-instance.html) はそのシングルトンインスタンスを返します：

```kotlin
sealed interface Status
data class Send(val message: String) : Status
data object Start : Status
data object Stop : Status

fun main() {
    // シールド階層で認識されている直接のサブクラスを取得
    val subclasses = Status::class.sealedSubclasses
    println(subclasses.mapNotNull { it.simpleName })
    // [Send, Start, Stop]

    val singletonStatus = subclasses.mapNotNull { subclass ->
        // Send は通常のクラスであるため null を返す
        subclass.objectInstance
    }
    println(singletonStatus)
    // [Start, Stop]
}
```

この例では、`Send` の各値は個別に構築される必要があるため、`objectInstance` は `Send` を除外します。`Start` と `Stop` はオブジェクト宣言であるため、コンパイラは既存のシングルトンインスタンスを返します。

> 直接のサブクラスの1つが同様に sealed である場合、その `sealedSubclasses` を再帰的に走査して完全な階層を収集してください。
> 
{style="tip"}

## ユースケースのシナリオ {id="use-case-scenarios"}

シールドクラスとインターフェースが特に役立ついくつかの実践的なシナリオを見てみましょう。

### UI アプリケーションにおける状態管理 {id="state-management-in-ui-applications"}

アプリケーション内のさまざまな UI 状態を表すためにシールドクラスを使用できます。
このアプローチにより、UI の変更を構造化して安全に処理できます。
次の例は、さまざまな UI 状態を管理する方法を示しています：

```kotlin
sealed class UIState { 
    data object Loading : UIState()
    data class Success(val data: String) : UIState()
    data class Error(val exception: Exception) : UIState()
}

fun updateUI(state: UIState) { 
    when (state) {
        is UIState.Loading -> showLoadingIndicator()
        is UIState.Success -> showData(state.data)
        is UIState.Error -> showError(state.exception) 
    }
}
```

### 支払い方法の処理 {id="payment-method-handling"}

実際のビジネスアプリケーションにおいて、さまざまな支払い方法を効率的に処理することは一般的な要件です。
このようなビジネスロジックを実装するために、シールドクラスと `when` 式を併用できます。
さまざまな支払い方法をシールドクラスのサブクラスとして表現することで、トランザクション処理のための明確で管理しやすい構造が確立されます：

```kotlin
sealed class Payment {
    data class CreditCard(val number: String, val expiryDate: String) : Payment()
    data class PayPal(val email: String) : Payment()
    data object Cash : Payment()
}

fun processPayment(payment: Payment) { 
    when (payment) {
        is Payment.CreditCard -> processCreditCardPayment(payment.number, payment.expiryDate)
        is Payment.PayPal -> processPayPalPayment(payment.email)
        is Payment.Cash -> processCashPayment() 
    }
}
```

`Payment` は、Eコマースシステムにおけるさまざまな支払い方法を表すシールドクラスです：
`CreditCard`、`PayPal`、および `Cash` があります。各サブクラスは、`CreditCard` の `number` や `expiryDate`、`PayPal` の `email` のように、固有のプロパティを持つことができます。

`processPayment()` 関数は、さまざまな支払い方法を処理する方法を示しています。
このアプローチにより、考えられるすべての支払いタイプが考慮され、将来新しい支払い方法が追加された場合でもシステムに柔軟性が保たれます。

### API のリクエスト・レスポンス処理 {id="api-request-response-handling"}

API のリクエストとレスポンスを処理するユーザー認証システムを実装するために、シールドクラスとシールドインターフェースを使用できます。
このユーザー認証システムには、ログイン機能とログアウト機能があります。
`ApiRequest` シールドインターフェースは特定のリクエストタイプを定義します：ログイン操作用の `LoginRequest` と、ログアウト操作用の `LogoutRequest` です。
シールドクラス `ApiResponse` は、ユーザーデータを持つ `UserSuccess`、ユーザーが存在しない場合の `UserNotFound`、何らかのエラーが発生した場合の `Error` という異なるレスポンスシナリオをカプセル化します。`handleRequest` 関数は `when` 式を使用してこれらのリクエストを型安全に処理し、`getUserById` はユーザーの取得をシミュレートします：

```kotlin
// 必要なモジュールのインポート
import io.ktor.server.application.*
import io.ktor.server.resources.*

import kotlinx.serialization.*

// Ktor リソースを使用して API リクエスト用のシールドインターフェースを定義
@Resource("api")
sealed interface ApiRequest

@Serializable
@Resource("login")
data class LoginRequest(val username: String, val password: String) : ApiRequest

@Serializable
@Resource("logout")
object LogoutRequest : ApiRequest

// 詳細なレスポンスタイプを持つ ApiResponse シールドクラスを定義
sealed class ApiResponse {
    data class UserSuccess(val user: UserData) : ApiResponse()
    data object UserNotFound : ApiResponse()
    data class Error(val message: String) : ApiResponse()
}

// 成功レスポンスで使用されるユーザーデータクラス
data class UserData(val userId: String, val name: String, val email: String)

// ユーザーの資格情報を検証する関数（デモ目的）
fun isValidUser(username: String, password: String): Boolean {
    // 何らかのバリデーションロジック（プレースホルダー）
    return username == "validUser" && password == "validPass"
}

// 詳細なレスポンスを伴って API リクエストを処理する関数
fun handleRequest(request: ApiRequest): ApiResponse {
    return when (request) {
        is LoginRequest -> {
            if (isValidUser(request.username, request.password)) {
                ApiResponse.UserSuccess(UserData("userId", "userName", "userEmail"))
            } else {
                ApiResponse.Error("Invalid username or password")
            }
        }
        is LogoutRequest -> {
            // この例ではログアウト操作が常に成功すると仮定
            ApiResponse.UserSuccess(UserData("userId", "userName", "userEmail")) // デモ用
        }
    }
}

// getUserById 呼び出しをシミュレートする関数
fun getUserById(userId: String): ApiResponse {
    return if (userId == "validUserId") {
        ApiResponse.UserSuccess(UserData("validUserId", "John Doe", "john@example.com"))
    } else {
        ApiResponse.UserNotFound
    }
    // エラーハンドリングも同様に Error レスポンスを返す
}

// 使用法を実演する main 関数
fun main() {
    val loginResponse = handleRequest(LoginRequest("user", "pass"))
    println(loginResponse)

    val logoutResponse = handleRequest(LogoutRequest)
    println(logoutResponse)

    val userResponse = getUserById("validUserId")
    println(userResponse)

    val userNotFoundResponse = getUserById("invalidId")
    println(userNotFoundResponse)
}
```

## 次のステップ {id="what-s-next"}

[Kotlin における継承](inheritance.md)についてさらに詳しく学びましょう。