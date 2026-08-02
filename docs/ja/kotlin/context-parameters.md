[//]: # (title: コンテキストパラメータ)

> コンテキストパラメータ（Context parameters）は、[コンテキストレシーバー](whatsnew1620.md#prototype-of-context-receivers-for-kotlin-jvm)と呼ばれていた古い試験的機能を置き換えるものです。
> 主な違いについては、[コンテキストパラメータのデザインドキュメント](https://github.com/Kotlin/KEEP/blob/master/proposals/context-parameters.md#summary-of-changes-from-the-previous-proposal)（英語）で確認できます。
> コンテキストレシーバーからコンテキストパラメータへの移行については、関連する[ブログ記事](https://blog.jetbrains.com/kotlin/2025/04/update-on-context-parameters/)で説明されているように、IntelliJ IDEAのアシスト機能を使用できます。
>
{style="tip"}

コンテキストパラメータを使用すると、関数やプロパティが、周囲のコンテキストで暗黙的に利用可能な依存関係を宣言できるようになります。

コンテキストパラメータを使用すれば、一連の関数呼び出しの間で共有され、めったに変更されないサービスや依存関係などの値を、手動で渡し続ける必要がなくなります。

プロパティや関数に対してコンテキストパラメータを宣言するには、`context` キーワードに続けて、`name: Type` 形式で宣言されたパラメータのリストを使用します。以下は、`UserService` インターフェースへの依存関係を持つ例です。

```kotlin
// UserService はコンテキストで必要とされる依存関係を定義します
interface UserService {
    fun log(message: String)
    fun findUserById(id: Int): String
}

// コンテキストパラメータを持つ関数を宣言します
context(users: UserService)
fun outputMessage(message: String) {
    // コンテキストの users から log を使用します
    users.log("Log: $message")
}

// コンテキストパラメータを持つプロパティを宣言します
context(users: UserService)
val firstUser: String
    // コンテキストの users から findUserById を使用します    
    get() = users.findUserById(1)

fun main() {
    val users = object : UserService {
        override fun log(message: String) {
            println(message)
        }

        override fun findUserById(id: Int): String {
            return "User $id"
        }
    }

    context(users) {
        outputMessage("Looking up the first user")
        println(firstUser)
        // User 1
    }
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.4"}

パラメータを直接参照する必要がない場合は、コンテキストパラメータ名として `_` を使用できます。匿名のコンテキストパラメータは、呼び出される関数が必要とするコンテキストパラメータを引き続き満たすことができますが、名前を使ってアクセスすることはできません。その値に明示的にアクセスするには、`contextOf<T>()` を使用します：

```kotlin
// コンテキストパラメータ名として "_" を使用します
context(_: UserService)
fun logWelcome() {
    // 匿名のパラメータは outputMessage() が必要とする
    // UserService コンテキストパラメータを満たします
    outputMessage("Welcome!")

    // UserService の値を明示的に取得します
    contextOf<UserService>().log("Hi!")
}
```

## コンテキストパラメータの解決

Kotlinは、現在のスコープ内で一致するコンテキスト値を検索することで、呼び出し側（call site）でコンテキストパラメータを解決します。Kotlinはそれらを型によって照合します。
同じスコープ階層に複数の互換性のある値が存在する場合、コンパイラは曖昧さ（ambiguity）エラーを報告します。

```kotlin
// UserService はコンテキストで必要とされる依存関係を定義します
interface UserService {
    fun log(message: String)
}

// コンテキストパラメータを持つ関数を宣言します
context(users: UserService)
fun outputMessage(message: String) {
    users.log("Log: $message")
}

fun main() {
    // UserService を実装します 
    val serviceA = object : UserService {
        override fun log(message: String) = println("A: $message")
    }

    // UserService を実装します
    val serviceB = object : UserService {
        override fun log(message: String) = println("B: $message")
    }

    // 呼び出し側で、serviceA と serviceB の両方が期待される UserService 型に一致します
    context(serviceA, serviceB) {
        // これは曖昧さエラーになります
        outputMessage("This will not compile")
    }
}
```

### コンテキスト引数を明示的に渡す
<primary-label ref="experimental-opt-in"/>

オーバーロードがコンテキストパラメータのみで異なる場合、複数の一致するコンテキスト値が利用可能であれば、呼び出しが曖昧（ambiguous）になる可能性があります。

この曖昧さを解決するには、呼び出し側で明示的なコンテキスト引数（explicit context argument）を渡します：

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
    // EmailSender コンテキストパラメータを持つオーバーロードを選択します
    sendNotification(emailSender = defaultEmailSender)

    // SmsSender コンテキストパラメータを持つオーバーロードを選択します
    sendNotification(smsSender = defaultSmsSender)
}
```

また、一部の関数呼び出しでネストを減らすために、明示的なコンテキスト引数を使用することもできます：

* 単一の呼び出しの場合、明示的なコンテキスト引数を使用して、呼び出しを読みやすくします。
* 複数の呼び出しで同じコンテキスト引数を使用する場合は、`context()` 関数を使用します。

この機能は[試験的](components-stability.md#stability-levels-explained)です。オプトインするには、ビルドファイルに以下のコンパイラオプションを追加してください：

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

## 制限事項

コンテキストパラメータは継続的に改善が行われており、現在の制限事項には以下のものが含まれます：

* コンストラクタにはコンテキストパラメータを宣言できません。
* コンテキストパラメータを持つプロパティは、バッキングフィールド（backing field）や初期化子（initializer）を持つことができません。
* コンテキストパラメータを持つプロパティは、委譲（delegation）を使用できません。

これらの制限はありますが、コンテキストパラメータは依存関係注入の簡略化、DSL設計の向上、およびスコープ限定の操作を通じて、依存関係の管理を簡素化します。