[//]: # (title: OAuth)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="OAuth"/>
<var name="artifact_name" value="ktor-server-auth"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="auth-oauth-google"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">ネイティブサーバー</Links>のサポート</b>: ✅
</p>
</tldr>

[OAuth](https://oauth.net/) は、アクセス権限の委譲（access delegation）のためのオープン標準です。OAuthを使用すると、Google、Facebook、Twitterなどの外部プロバイダーを利用して、アプリケーションのユーザーを認可できます。

`oauth` プロバイダーは、認可コードフロー（authorization code flow）をサポートしています。OAuthのパラメータを1か所で設定でき、Ktorは必要なパラメータを使用して指定された認可サーバーに自動的にリクエストを送信します。

> Ktorにおける認証と認可に関する一般的な情報は、[Ktor Serverにおける認証と認可](server-auth.md)セクションを参照してください。

## 依存関係の追加 {id="add_dependencies"}

<p>
    <code>%plugin_name%</code>を使用するには、ビルドスクリプトに <code>%artifact_name%</code> アーティファクトを含める必要があります。
</p>
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

## Sessionsプラグインのインストール

クライアントが保護されたリソースにアクセスしようとするたびに認可を要求するのを避けるために、認可が成功した際にアクセストークンをセッションに保存できます。
その後、保護されたルートのハンドラー内で現在のセッションからアクセストークンを取得し、それを使用してリソースをリクエストできます。

```kotlin
import io.ktor.server.sessions.*

fun Application.main(httpClient: HttpClient = applicationHttpClient) {
    install(Sessions) {
        cookie<UserSession>("user_session")
    }
}

@Serializable
data class UserSession(val state: String, val token: String)
```

## OAuth認可フロー {id="flow"}

KtorアプリケーションにおけるOAuth認可フローは、以下のようになります。

1. ユーザーがKtorアプリケーションのログインページを開きます。
2. Ktorは特定のプロバイダーの認可ページへ自動的にリダイレクトし、必要な[パラメータ](#configure-oauth-provider)を渡します。
    * 選択したプロバイダーのAPIにアクセスするためのクライアントID。
    * 認可完了後に開かれるKtorアプリケーションのページを指定する、コールバックまたはリダイレクトURL。
    * Ktorアプリケーションが必要とするサードパーティリソースのスコープ。
    * アクセストークンを取得するために使用されるグラントタイプ（認可コード）。
    * CSRF攻撃の緩和およびユーザーのリダイレクトに使用される `state` パラメータ。
    * 特定のプロバイダー固有のオプションパラメータ。
3. 認和ページには、Ktorアプリケーションが要求する権限レベルを示す同意画面が表示されます。これらの権限は、[ステップ2: OAuthプロバイダーの設定](#configure-oauth-provider)で設定したスコープに依存します。
4. ユーザーが要求された権限を承認すると、認可サーバーは指定されたリダイレクトURLにリダイレクトし、認可コードを送信します。
5. Ktorは指定されたアクセストークンURLに対して、以下のパラメータを含む自動リクエストをもう一度送信します。
    * 認可コード。
    * クライアントIDとクライアントシークレット。

   認可サーバーはアクセストークンを返して応答します。
6. クライアントはこのトークンを使用して、選択したプロバイダーの必要なサービスにリクエストを送信できます。ほとんどの場合、トークンは `Bearer` スキームを使用して `Authorization` ヘッダーで送信されます。
7. サービスはトークンを検証し、そのスコープを認可に使用して、要求されたデータを返します。

## OAuthのインストール {id="install"}

`oauth` 認証プロバイダーをインストールするには、`install` ブロック内で [oauth](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/oauth.html) 関数を呼び出します。オプションで、[プロバイダー名を指定](server-auth.md#provider-name)することもできます。
例えば、"auth-oauth-google" という名前で `oauth` プロバイダーをインストールする場合は、以下のようになります。

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*

fun Application.main(httpClient: HttpClient = applicationHttpClient) {
    install(Authentication) {
        oauth("auth-oauth-google") {
            // oauth認証の設定
            urlProvider = { "http://localhost:8080/callback" }
        }
    }
}
```

## OAuthの設定 {id="configure-oauth"}

このセクションでは、Googleを使用してアプリケーションのユーザーを認可するための `oauth` プロバイダーの設定方法を説明します。
実行可能な完全な例については、[auth-oauth-google](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-oauth-google) を参照してください。

### 事前準備: 認可資格情報の作成 {id="authorization-credentials"}

Google APIにアクセスするには、Google Cloud Consoleで認可資格情報を作成する必要があります。

1. Google Cloud Consoleの[認証情報](https://console.cloud.google.com/apis/credentials)ページを開きます。
2. **認証情報を作成**をクリックし、`OAuth クライアント ID` を選択します。
3. ドロップダウンから `ウェブ アプリケーション` を選択します。
4. 以下の設定を指定します。
    * **承認済みの JavaScript 生成元**: `http://localhost:8080`
    * **承認済みのリダイレクト URI**: `http://localhost:8080/callback`
      Ktorでは、認可完了時に開かれるリダイレクトルートを指定するために [urlProvider](#configure-oauth-provider) プロパティが使用されます。

5. **作成**をクリックします。
6. 表示されたダイアログで、`oauth` プロバイダーの設定に使用する、作成されたクライアントIDとクライアントシークレットをコピーします。

### ステップ1: HTTPクライアントの作成 {id="create-http-client"}

`oauth` プロバイダーを設定する前に、サーバーがOAuthサーバーにリクエストを送信するために使用する [HttpClient](client-create-and-configure.md) を作成する必要があります。[APIへのリクエスト後](#request-api)に受信したJSONデータをデシリアライズするために、JSONシリアライザーを備えた [ContentNegotiation](client-serialization.md) クライアントプラグインが必要です。

```kotlin
val applicationHttpClient = HttpClient(CIO) {
    install(ContentNegotiation) {
        json(Json {
            ignoreUnknownKeys = true
        })
    }
}
```

クライアントインスタンスは、サーバーの[テスト](server-testing.md)で別のクライアントインスタンスを作成できるように、`main` [モジュール関数](server-modules.md)に渡されます。

```kotlin
fun Application.main(httpClient: HttpClient = applicationHttpClient) {
}
```

### ステップ2: OAuthプロバイダーの設定 {id="configure-oauth-provider"}

以下のコードスニペットは、`auth-oauth-google` という名前で `oauth` プロバイダーを作成および設定する方法を示しています。

```kotlin
val redirects = ConcurrentMap<String, String>()
install(Authentication) {
    oauth("auth-oauth-google") {
        // oauth認証の設定
        urlProvider = { "http://localhost:8080/callback" }
        providerLookup = {
            OAuthServerSettings.OAuth2ServerSettings(
                name = "google",
                authorizeUrl = "https://accounts.google.com/o/oauth2/auth",
                accessTokenUrl = "https://accounts.google.com/o/oauth2/token",
                requestMethod = HttpMethod.Post,
                clientId = System.getenv("GOOGLE_CLIENT_ID"),
                clientSecret = System.getenv("GOOGLE_CLIENT_SECRET"),
                defaultScopes = listOf("https://www.googleapis.com/auth/userinfo.profile"),
                extraAuthParameters = listOf("access_type" to "offline"),
                onStateCreated = { call, state ->
                    // 新しいstateをリダイレクトURLの値とともに保存
                    call.request.queryParameters["redirectUrl"]?.let {
                        redirects[state] = it
                    }
                }
            )
        }
        fallback = { cause ->
            if (cause is OAuth2RedirectError) {
                respondRedirect("/login-after-fallback")
            } else {
                respond(HttpStatusCode.Forbidden, cause.message)
            }
        }
        client = httpClient
    }
}
```

* `urlProvider` は、認可完了時に呼び出される[リダイレクトルート](#redirect-route)を指定します。
  > このルートが[**承認済みのリダイレクト URI**](#authorization-credentials)のリストに追加されていることを確認してください。
* `providerLookup` を使用すると、必要なプロバイダーのOAuth設定を指定できます。これらの設定は [OAuthServerSettings](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-o-auth-server-settings/index.html) クラスによって表され、KtorがOAuthサーバーに対して自動リクエストを行えるようにします。
* `fallback` プロパティは、リダイレクトまたはカスタムレスポンスで応答することにより、OAuthフローのエラーを処理します。
* `client` プロパティは、KtorがOAuthサーバーにリクエストを送信するために使用する [HttpClient](#create-http-client) を指定します。

### ステップ3: ログインルートの追加 {id="login-route"}

`oauth` プロバイダーを設定した後に、`oauth` プロバイダーの名前を受け取る `authenticate` 関数内に[保護されたログインルートを作成](server-auth.md#authenticate-route)する必要があります。Ktorがこのルートへのリクエストを受信すると、[providerLookup](#configure-oauth-provider) で定義された `authorizeUrl` へ自動的にリダイレクトされます。

```kotlin
routing {
    authenticate("auth-oauth-google") {
        get("/login") {
            // 自動的に 'authorizeUrl' にリダイレクトされます
        }
    }
}
```

ユーザーには、Ktorアプリケーションが必要とする権限レベルを示す認可ページが表示されます。これらの権限は、[providerLookup](#configure-oauth-provider) で指定された `defaultScopes` に依存します。

### ステップ4: リダイレクトルートの追加 {id="redirect-route"}

ログインルートとは別に、[ステップ2: OAuthプロバイダーの設定](#configure-oauth-provider)で指定した `urlProvider` 用のリダイレクトルートを作成する必要があります。

このルート内では、`call.principal` 関数を使用して [OAuthAccessTokenResponse](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-o-auth-access-token-response/index.html) オブジェクトを取得できます。`OAuthAccessTokenResponse` を使用すると、トークンやOAuthサーバーから返されたその他のパラメータにアクセスできます。

```kotlin
    routing {
        authenticate("auth-oauth-google") {
            get("/login") {
                // 自動的に 'authorizeUrl' にリダイレクトされます
            }

            get("/callback") {
                val currentPrincipal: OAuthAccessTokenResponse.OAuth2? = call.principal()
                // 認可前にURLが見つからない場合はホームにリダイレクト
                currentPrincipal?.let { principal ->
                    principal.state?.let { state ->
                        call.sessions.set(UserSession(state, principal.accessToken))
                        redirects.remove(state)?.let { redirect ->
                            call.respondRedirect(redirect)
                            return@get
                        }
                    }
                }
                call.respondRedirect("/home")
            }
        }
    }
```

この例では、トークン受信後に以下のアクションが実行されます。

* トークンが[セッション](server-sessions.md)に保存されます。この内容は他のルート内からアクセスできます。
* ユーザーは、Google APIへのリクエストが行われる次のルートへリダイレクトされます。
* 要求されたルートが見つからない場合、ユーザーは `/home` ルートにリダイレクトされます。

### ステップ5: APIへのリクエスト {id="request-api"}

[リダイレクトルート](#redirect-route)内でトークンを受信してセッションに保存した後、このトークンを使用して外部APIにリクエストを送信できます。以下のコードスニペットは、[HttpClient](#create-http-client) を使用してそのようなリクエストを行い、`Authorization` ヘッダーでこのトークンを送信してユーザー情報を取得する方法を示しています。

リクエストを行い、レスポンスボディを返す `getPersonalGreeting` という新しい関数を作成します。

```kotlin
private suspend fun getPersonalGreeting(
    httpClient: HttpClient,
    userSession: UserSession
): UserInfo = httpClient.get("https://www.googleapis.com/oauth2/v2/userinfo") {
    headers {
        append(HttpHeaders.Authorization, "Bearer ${userSession.token}")
    }
}.body()
```

その後、`get` ルート内でこの関数を呼び出して、ユーザー情報を取得できます。

```kotlin
get("/{path}") {
    val userSession: UserSession? = getSession(call)
    if (userSession != null) {
        val userInfo: UserInfo = getPersonalGreeting(httpClient, userSession)
        call.respondText("Hello, ${userInfo.name}!")
    }
}
```

実行可能な完全な例については、[auth-oauth-google](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-oauth-google) を参照してください。