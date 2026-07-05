[//]: # (title: シールドクラスとインターフェース)

シールド (sealed) クラスおよびインターフェースは、クラス階層の継承を制御できるようにします。
シールドクラスのすべての直接のサブクラスはコンパイル時に既知となります。シールドクラスが定義されているモジュールおよびパッケージの外で、他のサブクラスを定義することはできません。同じロジックがシールドインターフェースとその実装にも適用されます。シールドインターフェースを含むモジュールがコンパイルされると、新しい実装を作成することはできません。

> **直接のサブクラス (Direct subclasses)** とは、そのスーパークラスを直接継承するクラスのことです。
> 
> **間接的なサブクラス (Indirect subclasses)** とは、スーパークラスから 2 段階以上離れて継承するクラスのことです。
>
{style="note"}

シールドクラスやインターフェースを `when` 式と組み合わせると、考えられるすべてのサブクラスの振る舞いを網羅でき、コードに悪影響を与えるような新しいサブクラスが作成されないことを保証できます。

シールドクラスは、以下のようなシナリオで最も効果を発揮します：

* **限定的なクラス継承が望ましい場合：** コンパイル時にすべてが既知である、あらかじめ定義された有限のサブクラスのセットがある場合。
* **型安全な設計が必要な場合：** プロジェクトにおいて安全性とパターンマッチングが重要な場合。特に状態管理や複雑な条件ロジックの処理において。例については、 [when 式でシールドクラスを使用する](#use-sealed-classes-with-when-expression) を参照してください。
* **クローズドな API を扱う場合：** サードパーティのクライアントが意図した通りに API を使用することを保証する、堅牢でメンテナンス性の高いライブラリ用公開 API を作成したい場合。

より詳細な実用例については、[ユースケースのシナリオ](#use-case-scenarios) を参照してください。

> Java 15 では [同様の概念](https://docs.oracle.com/en/java/javase/15/language/sealed-classes-and-interfaces.html#GUID-0C709461-CC33-419A-82BF-61461336E65F) が導入されました。Java のシールドクラスでは、`sealed` キーワードと `permits` 句を使用して制限された階層を定義します。
>
{style="tip"}

## シールドクラスまたはインターフェースの宣言

シールドクラスまたはインターフェースを宣言するには、`sealed` 修飾子を使用します：

```kotlin
// シールドインターフェースを作成
sealed interface Error

// シールドインターフェース Error を実装するシールドクラスを作成
sealed class IOError(): Error

// シールドクラス 'IOError' を継承するサブクラスを定義
class FileReadError(val file: File): IOError()
class DatabaseError(val source: DataSource): IOError()

// 'Error' シールドインターフェースを実装するシングルトンオブジェクトを作成
object RuntimeError : Error
```

この例は、ライブラリがスローする可能性のあるエラーをライブラリユーザーが処理できるようにするための、エラークラスを含むライブラリの API を表している可能性があります。
もしそのようなエラークラスの階層に、公開 API で公開されているインターフェースや抽象クラスが含まれている場合、クライアントコードで他の開発者がそれらを実装したり継承したりすることを防ぐ手段はありません。
ライブラリはその外部で宣言されたエラーを知らないため、それらを自身のクラスと一貫性を持って処理することができません。
しかし、エラークラスの階層を **シールド (sealed)** にすることで、ライブラリの作成者は考えられるすべてのエラータイプを把握でき、後から他のエラータイプが出現しないことを確信できます。

この例の階層は以下のようになります：

![Hierarchy illustration of sealed classes and interfaces](sealed-classes-interfaces.svg){width=700}

### コンストラクタ

シールドクラス自体は常に [抽象クラス (abstract class)](classes.md#abstract-classes) であり、その結果、直接インスタンス化することはできません。
しかし、コンストラクタを含んだり継承したりすることは可能です。これらのコンストラクタは、シールドクラス自体のインスタンスを作成するためではなく、そのサブクラスのために存在します。以下の `Error` というシールドクラスとそのいくつかのサブクラスをインスタンス化する例を考えてみましょう。

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

シールドクラス内で [`enum`](enum-classes.md) クラスを使用して、列挙定数で状態を表し、詳細な情報を提供することができます。各 enum 定数は **単一の** インスタンスとしてのみ存在しますが、シールドクラスのサブクラスは **複数の** インスタンスを持つことができます。
この例では、`sealed class Error` とそのサブクラスが、エラーの深刻度を表すために `enum` を使用しています。
各サブクラスのコンストラクタは `severity` を初期化し、その状態を変更できます：

```kotlin
enum class ErrorSeverity { MINOR, MAJOR, CRITICAL }

sealed class Error(val severity: ErrorSeverity) {
    class FileReadError(val file: File): Error(ErrorSeverity.MAJOR)
    class DatabaseError(val source: DataSource): Error(ErrorSeverity.CRITICAL)
    object RuntimeError : Error(ErrorSeverity.CRITICAL)
    // ここにさらなるエラータイプを追加可能
}
```

シールドクラスのコンストラクタは、2 つの [可視性 (visibilities)](visibility-modifiers.md) のいずれかを持つことができます：`protected` (デフォルト) または `private` です：

```kotlin
sealed class IOError {
    // シールドクラスのコンストラクタはデフォルトで protected です。
    // このクラス内とそのサブクラスからのみ参照可能です。
    constructor() { /*...*/ }

    // private コンストラクタ。このクラス内からのみ参照可能です。
    // シールドクラスで private コンストラクタを使用すると、インスタンス化をさらに厳格に制御でき、
    // クラス内での特定の初期化手順を可能にします。
    private constructor(description: String): this() { /*...*/ }

    // シールドクラスでは public および internal コンストラクタは許可されないため、これはエラーになります
    // public constructor(code: Int): this() {} 
}
```

## 継承

シールドクラスおよびインターフェースの直接のサブクラスは、同じパッケージ内で宣言する必要があります。それらはトップレベルで宣言することも、他の任意の数の名前付きクラス、名前付きインターフェース、または名前付きオブジェクトの中にネストさせることもできます。サブクラスは、[プロパティのオーバーライド](inheritance.md#overriding-properties) を含め、Kotlin の通常の継承ルールと互換性がある限り、どのような [可視性](visibility-modifiers.md) も持つことができます。

シールドクラスのサブクラスは、適切に修飾された名前 (properly qualified name) を持たなければなりません。ローカルオブジェクトや匿名オブジェクトにすることはできません。

> `enum` クラスは、シールドクラスやその他のクラスを継承することはできません。ただし、シールドインターフェースを実装することはできます：
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

これらの制限は間接的なサブクラスには適用されません。シールドクラスの直接のサブクラスが sealed としてマークされていない場合、その修飾子が許可する任意の方法で拡張できます：

```kotlin
// シールドインターフェース 'Error' は、同じパッケージとモジュール内でのみ実装を持つ
sealed interface Error

// シールドクラス 'IOError' は 'Error' を継承し、同じパッケージ内でのみ拡張可能
sealed class IOError(): Error

// open クラス 'CustomError' は 'Error' を継承し、参照可能な場所であればどこでも拡張可能
open class CustomError(): Error
```

### マルチプラットフォームプロジェクトにおける継承

[マルチプラットフォームプロジェクト](https://kotlinlang.org/docs/multiplatform/get-started.html) には、もう一つ継承の制限があります。シールドクラスの直接のサブクラスは、同じ [ソースセット](https://kotlinlang.org/docs/multiplatform/multiplatform-discover-project.html#source-sets) 内に存在しなければなりません。これは、[`expect` および `actual` 修飾子](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html) のないシールドクラスに適用されます。

シールドクラスが共通ソースセットで `expect` として宣言され、プラットフォームソースセットで `actual` 実装を持つ場合、`expect` と `actual` の両方のバージョンがそれぞれのソースセットでサブクラスを持つことができます。さらに、階層構造を使用している場合は、`expect` 宣言と `actual` 宣言の間の任意のソースセットでサブクラスを作成できます。

[マルチプラットフォームプロジェクトの階層構造についての詳細](https://kotlinlang.org/docs/multiplatform/multiplatform-hierarchy.html) を参照してください。

## when 式でシールドクラスを使用する

シールドクラスを使用する主な利点は、[`when`](control-flow.md#when-expressions-and-statements) 式で使用したときに発揮されます。
シールドクラスと共に `when` 式を使用すると、Kotlin コンパイラは、考えられるすべてのケースが網羅されているかどうかを厳密にチェックできます。このような場合、`else` 句を追加する必要はありません：

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
    // すべてのケースが網羅されているため、`else` 句は不要です
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

> `when` 式での繰り返しを減らすために、コンテキスト依存の解決 (context-sensitive resolution) を試してみてください (現在プレビュー中)。
> この機能により、期待される型が既知である場合に、シールドクラスのメンバーをマッチングする際に型名を省略できるようになります。
>
> 詳細については、[コンテキスト依存の解決のプレビュー](whatsnew22.md#preview-of-context-sensitive-resolution) または関連する [KEEP プロポーザル](https://github.com/Kotlin/KEEP/blob/improved-resolution-expected-type/proposals/context-sensitive-resolution.md) を参照してください。
> 
{style="tip"}

シールドクラスを `when` 式で使用する場合、ガード条件を追加して単一の分岐内にさらにチェックを含めることもできます。
詳細については、[when 式のガード条件](control-flow.md#guard-conditions-in-when-expressions) を参照してください。

> マルチプラットフォームプロジェクトにおいて、共通コード内の [`expect` 宣言](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html) として `when` 式を持つシールドクラスがある場合、依然として `else` 分岐が必要です。これは、プラットフォームの `actual` 実装のサブクラスが、共通コードでは未知のシールドクラスを拡張している可能性があるためです。
>
{style="note"}

## ユースケースのシナリオ

シールドクラスとインターフェースが特に有用な、いくつかの実用的なシナリオを見てみましょう。

### UI アプリケーションにおける状態管理

シールドクラスを使用して、アプリケーションのさまざまな UI 状態を表現できます。
このアプローチにより、構造化された安全な方法で UI の変更を処理できます。
この例は、さまざまな UI 状態を管理する方法を示しています：

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

### 支払い方法の処理

実際のビジネスアプリケーションにおいて、さまざまな支払い方法を効率的に処理することは一般的な要件です。
シールドクラスと `when` 式を使用して、このようなビジネスロジックを実装できます。
さまざまな支払い方法をシールドクラスのサブクラスとして表現することで、トランザクション処理のための明確で管理しやすい構造を構築できます：

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

`Payment` は、eコマースシステムにおけるさまざまな支払い方法 (`CreditCard`、`PayPal`、`Cash`) を表すシールドクラスです。各サブクラスは、`CreditCard` なら `number` や `expiryDate`、`PayPal` なら `email` といった固有のプロパティを持つことができます。

`processPayment()` 関数は、異なる支払い方法をどのように処理するかを示しています。
このアプローチにより、考えられるすべての支払いタイプが考慮され、将来新しい支払い方法が追加された際にもシステムは柔軟性を保つことができます。

### API のリクエスト・レスポンス処理

シールドクラスとシールドインターフェースを使用して、API リクエストとレスポンスを処理するユーザー認証システムを実装できます。
このユーザー認証システムにはログインとログアウトの機能があります。
`ApiRequest` シールドインターフェースは、ログイン用の `LoginRequest` とログアウト操作用の `LogoutRequest` という特定のリクエストタイプを定義しています。
シールドクラスの `ApiResponse` は、ユーザーデータを含む `UserSuccess`、ユーザーが見つからない場合の `UserNotFound`、および失敗時の `Error` といった異なるレスポンスシナリオをカプセル化しています。`handleRequest` 関数は、`when` 式を使用してこれらのリクエストを型安全な方法で処理し、`getUserById` はユーザー情報の取得をシミュレートします：

```kotlin
// 必要なモジュールのインポート
import io.ktor.server.application.*
import io.ktor.server.resources.*

import kotlinx.serialization.*

// Ktor リソースを使用した API リクエスト用のシールドインターフェースを定義
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

// ユーザーの認証情報を検証する関数 (デモ用)
fun isValidUser(username: String, password: String): Boolean {
    // 検証ロジック (これはプレースホルダーです)
    return username == "validUser" && password == "validPass"
}

// 詳細なレスポンスで API リクエストを処理する関数
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
            // この例ではログアウト操作は常に成功すると仮定
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
    // エラー処理も Error レスポンスを返すことになるでしょう
}

// 使用例を示すメイン関数
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

## 次のステップ

[Kotlin の継承](inheritance.md) について詳細を学ぶ。