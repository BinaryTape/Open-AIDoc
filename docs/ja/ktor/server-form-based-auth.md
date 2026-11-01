[//]: # (title: Ktor Server でのフォームベース認証)

<show-structure for="chapter" depth="2"/>

<var name="artifact_name" value="ktor-server-auth"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.auth"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<p>
<b>コード例</b>:
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-form-html-dsl">auth-form-html-dsl</a>,
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-form-session">auth-form-session</a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">Native サーバー</Links>のサポート</b>: ✅
</p>
</tldr>

フォームベース認証は、[Web フォーム](https://developer.mozilla.org/en-US/docs/Learn/Forms) を使用して認証情報を収集し、ユーザーを認証します。
Ktor で Web フォームを作成するには、[HTML DSL](server-html-dsl.md#html_response) を使用するか、FreeMarker や Velocity などの JVM [テンプレートエンジン](server-templating.md) から選択できます。

> フォームベース認証を使用する場合、ユーザー名とパスワードは平文で送信されるため、機密情報を保護するには [HTTPS/TLS](server-ssl.md) を使用する必要があります。

## 依存関係の追加 {id="add_dependencies"}
`form` 認証を有効にするには、ビルドスクリプトに `%artifact_name%` アーティファクトを含める必要があります:

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上記のコードスニペットでは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">
            Ktor バージョンカタログ</a> を使用しています。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上記のコードスニペットでは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">
            Ktor バージョンカタログ</a> を使用しています。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## フォームベース認証のフロー {id="flow"}

フォームベース認証のフローは次のようになります:

1. 未認証のクライアントが、サーバーアプリケーション内の特定の [ルート](server-routing.md) にリクエストを送信します。
2. サーバーは、少なくともユーザーにユーザー名とパスワードを要求する HTML ベースの Web フォームを含む HTML ページを返します。
   > Ktor では、[Kotlin DSL](server-html-dsl.md) を使用してフォームを構築することも、FreeMarker や Velocity などのさまざまな JVM テンプレートエンジンから選択することもできます。
3. ユーザーがユーザー名とパスワードを送信すると、クライアントは Web フォームのデータ（ユーザー名とパスワードを含む）を含むリクエストをサーバーに送信します。
   
   ```kotlin
   POST http://localhost:8080/login
   Content-Type: application/x-www-form-urlencoded
   
   username=jetbrains&password=foobar
   
   ```
   
   Ktor では、ユーザー名とパスワードの取得に使用される [パラメータ名を指定](#configure-provider) する必要があります。

4. サーバーはクライアントから送信された認証情報を [検証](#configure-provider) し、要求されたコンテンツで応答します。

## form 認証のインストール {id="install"}
`form` 認証プロバイダーをインストールするには、`install` ブロック内で [form](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/form.html) 関数を呼び出します:

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
// ...
install(Authentication) {
    form {
        // フォーム認証の設定
    }
}
```

オプションで、[指定したルートの認証](#authenticate-route) に使用できる [プロバイダー名](server-auth.md#provider-name) を指定することもできます。

## form 認証の設定 {id="configure"}

### ステップ 1: フォームプロバイダーの設定 {id="configure-provider"}

<Tabs group="auth-dsl">
<TabItem title="名前付きプロバイダー" group-key="classic">

`form` 認証プロバイダーは、[FormAuthenticationProvider.Config](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-form-authentication-provider/-config/index.html) クラスを通じてその設定を公開します。以下の例では、次の設定が指定されています:
* `userParamName` および `passwordParamName` プロパティは、ユーザー名とパスワードを取得するために使用されるパラメータ名を指定します。
* `validate` 関数はユーザー名とパスワードを検証します。
  `validate` 関数は `UserPasswordCredential` をチェックし、認証に成功した場合は `UserIdPrincipal` を、認証に失敗した場合は `null` を返します。
* `challenge` 関数は、認証に失敗した場合に実行されるアクションを指定します。たとえば、ログインページにリダイレクトしたり、[UnauthorizedResponse](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-unauthorized-response/index.html) を送信したりできます。

```kotlin
install(Authentication) {
    form("auth-form") {
        userParamName = "username"
        passwordParamName = "password"
        validate { credentials ->
            val isValid = credentials.name == "jetbrains" &&
                credentials.password == "foobar"
            if (isValid) {
                UserIdPrincipal(credentials.name)
            } else {
                null
            }
        }
        challenge {
            val message = "Credentials are not valid"
            val status = HttpStatusCode.Unauthorized
            call.respond(status, message)
        }
    }
}
```

</TabItem>
<TabItem title="タイプセーフ" group-key="typed">

<note>
    <p>
        タイプセーフな認証スキーム API は実験的なものです。いつでも削除または変更される可能性があります。
        オプトインが必要です。詳細については、
        <a href="server-typed-auth.md#prerequisites">タイプセーフ認証のドキュメント</a> を参照してください。
    </p>
</note>

`form()` 関数は、選択したプリンシパル型用のスキームを作成します。`install(Authentication)`
のステップはありません。スキームは、それを必要とするルートに渡す値です。

```kotlin
data class User(val name: String)

val formAuth = form<User>("auth-form") {
    usernameField = "username"
    passwordField = "password"
    validate { credentials ->
        val isValid = credentials.name == "jetbrains" &&
            credentials.password == "foobar"
        if (isValid) User(credentials.name) else null
    }
    onUnauthorized = {
        val message = "Credentials are not valid"
        call.respond(HttpStatusCode.Unauthorized, message)
    }
}
```

クラシックなプロバイダーとは2つの名称が異なります。フォームフィールドは `userParamName` や `passwordParamName` ではなく、`usernameField` と `passwordField` になります。失敗ハンドラーは `challenge` ではなく `onUnauthorized` です。完全な API については、[タイプセーフ認証](server-typed-auth.md) を参照してください。

</TabItem>
</Tabs>

> `basic` 認証と同様に、ユーザー名とパスワードハッシュを保持するインメモリテーブルに保存されたユーザーを検証するために、[UserHashedTableAuth](server-basic-auth.md#validate-user-hash) を使用することもできます。

### ステップ 2: 特定のリソースの保護 {id="authenticate-route"}

<Tabs group="auth-dsl">
<TabItem title="名前付きプロバイダー" group-key="classic">

`form` プロバイダーを設定した後、データが送信される `post` ルートを定義する必要があります。
次に、このルートを **[authenticate](server-auth.md#authenticate-route)** 関数の内部に追加します。
認証に成功した場合、ルートハンドラー内で `call.principal` 関数を使用して認証済みの [UserIdPrincipal](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-id-principal/index.html) を取得し、認証されたユーザーの名前を取得できます。

```kotlin
routing {
    authenticate("auth-form") {
        post("/login") {
            val user = call.principal<UserIdPrincipal>()
            call.respondText("Hello, ${user?.name}!")
        }
    }
}
```

</TabItem>
<TabItem title="タイプセーフ" group-key="typed">

フォームデータが送信される `post` ルートを定義し、それを `authenticateWith()` でラップします。ブロック内では、`call.principal` は独自のプリンシパル型になり、`null` になることはありません:

```kotlin
routing {
    authenticateWith(formAuth) {
        post("/login") {
            call.respondText("Hello, ${call.principal.name}!")
        }
    }
}
```

</TabItem>
</Tabs>

ログインしたユーザーの ID を保存するために、[セッション認証](server-session-auth.md) を使用できます。
たとえば、ユーザーが初めて Web フォームを使用してログインしたときに、ユーザー名を Cookie セッションに保存し、以降のリクエストでは `session` プロバイダーを使用してこのユーザーを認可できます。