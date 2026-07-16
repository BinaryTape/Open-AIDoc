[//]: # (title: Ktor Serverにおけるフォームベース認証)

<show-structure for="chapter" depth="2"/>

<var name="artifact_name" value="ktor-server-auth"/>

<tldr>
<p>
<b>必須の依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<p>
<b>コード例</b>:
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-form-html-dsl">auth-form-html-dsl</a>,
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-form-session">auth-form-session</a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">Nativeサーバー</Links>のサポート</b>: ✅
</p>
</tldr>

フォームベース認証は、[ウェブフォーム](https://developer.mozilla.org/ja/docs/Learn/Forms)を使用して資格情報を収集し、ユーザーを認証します。
Ktorでウェブフォームを作成するには、[HTML DSL](server-html-dsl.md#html_response)を使用するか、FreeMarkerやVelocityなどのJVM[テンプレートエンジン](server-templating.md)から選択できます。

> フォームベース認証を使用する場合、ユーザー名とパスワードはプレーンテキストとして送信されるため、機密情報を保護するために[HTTPS/TLS](server-ssl.md)を使用する必要があります。

## 依存関係の追加 {id="add_dependencies"}
`form`認証を有効にするには、ビルドスクリプトに`%artifact_name%`アーティファクトを含める必要があります。

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"></code-block>
    </TabItem>
</Tabs>

## フォームベース認証のフロー {id="flow"}

フォームベース認証のフローは以下のようになります。

1. 認証されていないクライアントが、サーバーアプリケーションの特定の[ルート](server-routing.md)にリクエストを送信します。
2. サーバーは、ユーザーにユーザー名とパスワードの入力を求めるHTMLベースのウェブフォームを少なくとも含むHTMLページを返します。
   > Ktorでは、[Kotlin DSL](server-html-dsl.md)を使用してフォームを作成できるほか、FreeMarkerやVelocityなどの様々なJVMテンプレートエンジンを選択することもできます。
3. ユーザーがユーザー名とパスワードを送信すると、クライアントはウェブフォームのデータ（ユーザー名とパスワードを含む）を含むリクエストをサーバーに送信します。
   
   ```kotlin
   POST http://localhost:8080/login
   Content-Type: application/x-www-form-urlencoded
   
   username=jetbrains&password=foobar
   
   ```
   
   Ktorでは、ユーザー名とパスワードを取得するために使用する[パラメーター名を指定](#configure-provider)する必要があります。

4. サーバーは、クライアントから送信された[資格情報を検証](#configure-provider)し、要求されたコンテンツを返します。

## フォーム認証のインストール {id="install"}
`form`認証プロバイダーをインストールするには、`install`ブロック内で[form](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/form.html)関数を呼び出します。

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
// ...
install(Authentication) {
    form {
        // フォーム認証を設定
    }
}
```

オプションで、[特定のルートを認証](#authenticate-route)するために使用できる[プロバイダー名](server-auth.md#provider-name)を指定することもできます。

## フォーム認証の設定 {id="configure"}

### ステップ1: フォームプロバイダーの設定 {id="configure-provider"}
`form`認証プロバイダーは、[FormAuthenticationProvider.Config](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-form-authentication-provider/-config/index.html)クラスを介して設定を公開します。以下の例では、次の設定が指定されています。
* `userParamName`プロパティと`passwordParamName`プロパティは、ユーザー名とパスワードを取得するために使用するパラメーター名を指定します。
* `validate`関数は、ユーザー名とパスワードを検証します。
  `validate`関数は`UserPasswordCredential`をチェックし、認証に成功した場合は`UserIdPrincipal`を返し、失敗した場合は`null`を返します。
* `challenge`関数は、認証が失敗した場合に実行されるアクションを指定します。例えば、ログインページにリダイレクトしたり、[UnauthorizedResponse](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-unauthorized-response/index.html)を送信したりできます。

```kotlin
install(Authentication) {
    form("auth-form") {
        userParamName = "username"
        passwordParamName = "password"
        validate { credentials ->
            if (credentials.name == "jetbrains" && credentials.password == "foobar") {
                UserIdPrincipal(credentials.name)
            } else {
                null
            }
        }
        challenge {
            call.respond(HttpStatusCode.Unauthorized, "Credentials are not valid")
        }
    }
}
```

> `basic`認証と同様に、ユーザー名とパスワードのハッシュを保持するインメモリテーブルに保存されたユーザーを検証するために、[UserHashedTableAuth](server-basic-auth.md#validate-user-hash)を使用することもできます。

### ステップ2: 特定のリソースの保護 {id="authenticate-route"}

`form`プロバイダーを設定した後、データが送信される`post`ルートを定義する必要があります。
次に、このルートを**[authenticate](server-auth.md#authenticate-route)**関数の中に追加します。
認証に成功した場合、ルートハンドラー内で`call.principal`関数を使用して認証済みの[UserIdPrincipal](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-id-principal/index.html)を取得し、認証されたユーザーの名前を取得できます。

```kotlin
routing {
    authenticate("auth-form") {
        post("/login") {
            call.respondText("Hello, ${call.principal<UserIdPrincipal>()?.name}!")
        }
    }
}
```

ログインしたユーザーのIDを保存するために、[セッション認証](server-session-auth.md)を使用できます。
例えば、ユーザーが初めてウェブフォームを使用してログインしたときに、ユーザー名をクッキーセッションに保存し、その後のリクエストでは`session`プロバイダーを使用してそのユーザーを認可することができます。