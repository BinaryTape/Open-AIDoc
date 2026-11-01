[//]: # (title: OAuth)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="OAuth"/>
<var name="artifact_name" value="ktor-server-auth"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.auth"/>

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
    <b><Links href="server-native.md" summary="KtorはKotlin/Nativeをサポートしており、追加のランタイムや仮想マシンなしでサーバーを実行できます。">Nativeサーバー</Links>のサポート</b>: ✅
</p>
</tldr>

[OAuth](https://oauth.net/) はアクセス委譲（access delegation）のためのオープンスタンダードです。OAuthを使用すると、Google、Facebook、Twitterなどの外部プロバイダーを利用してアプリケーションのユーザーを認可（authorize）できます。

`oauth` プロバイダーは認可コードフロー（authorization code flow）をサポートしています。OAuthパラメーターを1か所で設定でき、Ktorは必要なパラメーターを指定された認可サーバーへ自動的にリクエストします。

> Ktorにおける認証と認可に関する一般的な情報については、[Ktor Serverにおける認証と認可](server-auth.md)セクションを参照してください。

> Ktorは型安全なOAuth 2.0フローも提供しています。名前付きプロバイダーを設定する代わりに、フロー値を作成してインストールすると、Ktorがログインおよびコールバックルートを自動生成します。`oauth2Session` フローでは、サインイン後にアプリケーションルートを保護するためのスキームも提供されます。詳細は [OAuth 2.0フロー](server-oauth2-flows.md) を参照してください。
>
{style="tip"}

> プロバイダーがOpenID Connectをサポートしている場合、`Oidc` プラグインを使用するとさらに便利です。プロバイダーのディスカバリードキュメントを読み込むため、認可エンドポイント、トークンエンドポイント、JWKSエンドポイントの代わりにissuer URLを設定するだけで済み、PKCE、IDトークンの検証、セッション、ログアウトが自動的に処理されます。詳細は [OpenID Connect](server-oidc.md) を参照してください。
>
{style="tip"}

## 依存関係の追加 {id="add_dependencies"}

<p>
    <code>%plugin_name%</code> を使用するには、ビルドスクリプトに <code>%artifact_name%</code> アーティファクトを追加します。
</p>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上記のコードスニペットでは、Ktorの依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">Ktorバージョンカタログ</a> を使用しています。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上記のコードスニペットでは、Ktorの依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">Ktorバージョンカタログ</a> を使用しています。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## Sessionsプラグインのインストール {id="install-the-sessions-plugin"}

クライアントが保護されたリソースにアクセスしようとするたびに認可を要求するのを避けるため、認可の成功時にアクセストークンをセッションに保存できます。
その後、保護されたルートのハンドラー内で現在のセッションからアクセストークンを取得し、リソースのリクエストに使用できます。

```kotlin
import io.ktor.server.sessions.*

fun Application.main(
    httpClient: HttpClient = applicationHttpClient
) {
    install(Sessions) {
        cookie<UserSession>("user_session")
    }
}

@Serializable
data class UserSession(val state: String, val token: String)
```

## OAuth認可フロー {id="flow"}

KtorアプリケーションにおけるOAuth認可フローは次のようになります。

1. ユーザーがKtorアプリケーションのログインページを開きます。
2. Ktorは特定のプロバイダーの認可ページへの自動リダイレクトを行い、必要な[パラメーター](#configure-oauth-provider)を渡します。
    * 選択したプロバイダーのAPIへのアクセスに使用されるクライアントID。
    * 認可完了後に開かれるKtorアプリケーションのページを指定するコールバックまたはリダイレクトURL。
    * Ktorアプリケーションに必要なサードパーティリソースのスコープ。
    * アクセストークンを取得するために使用されるグラントタイプ（Authorization Code）。
    * CSRF攻撃の緩和とユーザーのリダイレクトに使用される `state` パラメーター。
    * 特定のプロバイダー固有のオプションパラメーター。
3. 認可ページには、Ktorアプリケーションに必要な権限レベルを示す同意画面が表示されます。これらの権限は、[ステップ2: OAuthプロバイダーの設定](#configure-oauth-provider)で設定された指定スコープによって決まります。
4. ユーザーが要求された権限を承認すると、認可サーバーは指定されたリダイレクトURLにリダイレクトし、認可コードを送信します。
5. Ktorは指定されたアクセストークンURLに対して、以下のパラメーターを含めてもう一度自動リクエストを行います。
    * 認可コード
    * クライアントIDとクライアントシークレット

   認可サーバーはアクセストークンを返して応答します。
6. クライアントはこのトークンを使用して、選択したプロバイダーの必要なサービスにリクエストを行うことができます。ほとんどの場合、トークンは `Authorization` ヘッダーに `Bearer` スキームを使用して送信されます。
7. サービスはトークンを検証し、認可のためにそのスコープを使用して、要求されたデータを返します。

## OAuthのインストール {id="install"}

`oauth` 認証プロバイダーをインストールするには、`install` ブロック内で [oauth](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/oauth.html) 関数を呼び出します。オプションで [プロバイダー名を指定](server-auth.md#provider-name) することもできます。
例えば、"auth-oauth-google" という名前で `oauth` プロバイダーをインストールする場合は以下のようになります。

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*

fun Application.main(
    httpClient: HttpClient = applicationHttpClient
) {
    install(Authentication) {
        oauth("auth-oauth-google") {
            // OAuth認証の設定
            urlProvider = { "http://localhost:8080/callback" }
            client = httpClient
        }
    }
}
```

## OAuthの設定 {id="configure-oauth"}

このセクションでは、Googleを使用してアプリケーションのユーザーを認可するための `oauth` プロバイダーの設定方法を説明します。
実行可能な完全な例については、[auth-oauth-google](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-oauth-google) を参照してください。

### 前提条件: 認可認証情報の作成 {id="authorization-credentials"}

Google APIにアクセスするには、Google Cloud Consoleで認可認証情報を作成する必要があります。

1. Google Cloud Consoleで [認証情報](https://console.cloud.google.com/apis/credentials) ページを開きます。
2. **認証情報を作成** をクリックし、`OAuth クライアント ID` を選択します。
3. ドロップダウンから `ウェブ アプリケーション` を選択します。
4. 以下の設定を指定します。
    * **承認済みの JavaScript 生成元**: `http://localhost:8080`
    * **承認済みのリダイレクト URI**: `http://localhost:8080/callback`
      Ktorでは、認可完了時に開かれるリダイレクトルートを指定するために [urlProvider](#configure-oauth-provider) プロパティが使用されます。

5. **作成** をクリックします。
6. 表示されたダイアログから、`oauth` プロバイダーの設定に使用する作成されたクライアントIDとクライアントシークレットをコピーします。

### ステップ1: HTTPクライアントの作成 {id="create-http-client"}

`oauth` プロバイダーを設定する前に、サーバーがOAuthサーバーへのリクエストを行うために使用する [HttpClient](client-create-and-configure.md) を作成する必要があります。[APIへのリクエスト後](#request-api)に受信したJSONデータをデシリアライズするには、JSONシリアライザーを備えた [ContentNegotiation](client-serialization.md) クライアントプラグインが必要です。

```kotlin
val applicationHttpClient = HttpClient(CIO) {
    install(ContentNegotiation) {
        json(Json {
            ignoreUnknownKeys = true
        })
    }
}
```

サーバーの[テスト](server-testing.md)で別のクライアントインスタンスを作成できるように、クライアントインスタンスは `main` [モジュール関数](server-modules.md)に渡されます。

```kotlin
fun Application.main(
    httpClient: HttpClient = applicationHttpClient
) {
}
```

### ステップ2: OAuthプロバイダーの設定 {id="configure-oauth-provider"}

以下のコードスニペットは、`auth-oauth-google` という名前の `oauth` プロバイダーを作成および設定する方法を示しています。
固定のOAuth設定を持つプロバイダーには、`settings` プロパティを使用します。

```kotlin
val googleAuthorizeUrl =
    "https://accounts.google.com/o/oauth2/auth"
val googleTokenUrl =
    "https://accounts.google.com/o/oauth2/token"
val profileScope =
    "https://www.googleapis.com/auth/userinfo.profile"
val googleClientId =
    System.getenv("GOOGLE_CLIENT_ID").orEmpty()
val googleClientSecret =
    System.getenv("GOOGLE_CLIENT_SECRET").orEmpty()
val redirects = ConcurrentMap<String, String>()
install(Authentication) {
    oauth("auth-oauth-google") {
        // OAuth認証の設定
        urlProvider = { "http://localhost:8080/callback" }
        settings = OAuthServerSettings.OAuth2ServerSettings(
                name = "google",
                authorizeUrl = googleAuthorizeUrl,
                accessTokenUrl = googleTokenUrl,
                requestMethod = HttpMethod.Post,
                clientId = googleClientId,
                clientSecret = googleClientSecret,
                defaultScopes = listOf(profileScope),
                extraAuthParameters =
                    listOf("access_type" to "offline"),
                onStateCreated = { call, state ->
                    // 新しいstateをリダイレクトURLとともに保存
                    val query = call.request.queryParameters
                    query["redirectUrl"]?.let {
                        redirects[state] = it
                    }
                }
            )
        fallback = { cause ->
            if (cause is OAuth2RedirectError) {
                respondRedirect("/login-after-fallback")
            } else {
                respond(
                    HttpStatusCode.Forbidden,
                    cause.message
                )
            }
        }
        client = httpClient
    }
}
```

* `urlProvider` は、認可が完了したときに呼び出される[リダイレクトルート](#redirect-route)を指定します。
  > このルートが[**承認済みのリダイレクト URI**](#authorization-credentials)のリストに追加されていることを確認してください。
* `settings` プロパティは、プロバイダーの静的なOAuth設定を指定します。これらの設定は [OAuthServerSettings](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-o-auth-server-settings/index.html) クラスで表され、KtorがOAuthサーバーへ自動的にリクエストを行えるようにします。静的なプロバイダー設定では、`providerLookup` よりも `settings` を優先してください。これにより、生成される [OpenAPI仕様](openapi-spec-generation.md) のメタデータをKtorが推論できるようにもなります。
* `fallback` プロパティは、リダイレクトまたはカスタムレスポンスで応答することにより、OAuthフローのエラーを処理します。
* `client` プロパティは、KtorがOAuthサーバーへのリクエストを行うために使用する [HttpClient](#create-http-client) を指定します。

> 特定の呼び出しに対してOAuth設定を動的に解決するために、`providerLookup` プロパティも引き続きサポートされています。テナント固有の認証情報やエンドポイントなど、プロバイダーの設定がリクエストデータに依存する場合に使用してください。

### ステップ3: ログインルートの追加 {id="login-route"}

`oauth` プロバイダーを設定したら、`oauth` プロバイダーの名前を受け取る `authenticate` 関数内で[保護されたログインルートを作成](server-auth.md#authenticate-route)する必要があります。Ktorがこのルートへのリクエストを受信すると、[settings](#configure-oauth-provider) で定義された `authorizeUrl` に自動的にリダイレクトされます。

```kotlin
routing {
    authenticate("auth-oauth-google") {
        get("/login") {
            // 自動的に'authorizeUrl'にリダイレクト
        }
    }
}
```

ユーザーには、Ktorアプリケーションに必要な権限レベルを示す認可ページが表示されます。これらの権限は、[settings](#configure-oauth-provider) で指定された `defaultScopes` によって決まります。

### ステップ4: リダイレクトルートの追加 {id="redirect-route"}

ログインルートとは別に、[ステップ2: OAuthプロバイダーの設定](#configure-oauth-provider)で指定した `urlProvider` 用のリダイレクトルートを作成する必要があります。

このルート内では、`call.principal` 関数を使用して [OAuthAccessTokenResponse](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-o-auth-access-token-response/index.html) オブジェクトを取得できます。`OAuthAccessTokenResponse` を使用すると、トークンやOAuthサーバーから返されたその他のパラメーターにアクセスできます。

```kotlin
    routing {
        authenticate("auth-oauth-google") {
            get("/login") {
                // 自動的に'authorizeUrl'にリダイレクト
            }

            get("/callback") {
                val currentPrincipal:
                    OAuthAccessTokenResponse.OAuth2? =
                        call.principal()
                // 認可前にURLが見つからない場合はホームにリダイレクト
                currentPrincipal?.let { principal ->
                    principal.state?.let { state ->
                        val session = UserSession(
                            state,
                            principal.accessToken
                        )
                        call.sessions.set(session)
                        redirects.remove(state)?.let { url ->
                            call.respondRedirect(url)
                            return@get
                        }
                    }
                }
                call.respondRedirect("/home")
            }
        }
    }
```

この例では、トークンを受信した後に次のアクションが実行されます。

* トークンは [Session](server-sessions.md) に保存され、その内容は他のルート内からアクセスできます。
* ユーザーは、Google APIへのリクエストが行われる次のルートにリダイレクトされます。
* 要求されたルートが見つからない場合、ユーザーは `/home` ルートにリダイレクトされます。

### ステップ5: APIへのリクエスト {id="request-api"}

[リダイレクトルート](#redirect-route)内でトークンを受け取り、セッションに保存した後は、このトークンを使用して外部APIへのリクエストを行うことができます。以下のコードスニペットは、[HttpClient](#create-http-client) を使用してそのようなリクエストを行い、`Authorization` ヘッダーにこのトークンを送信してユーザー情報を取得する方法を示しています。

リクエストを実行してレスポンスボディを返す `getPersonalGreeting` という新しい関数を作成します。

```kotlin
private suspend fun getPersonalGreeting(
    httpClient: HttpClient,
    userSession: UserSession
): UserInfo = httpClient.get(
    "https://www.googleapis.com/oauth2/v2/userinfo"
) {
    headers {
        val bearer = "Bearer ${userSession.token}"
        append(HttpHeaders.Authorization, bearer)
    }
}.body()
```

その後、`get` ルート内でこの関数を呼び出してユーザー情報を取得できます。

```kotlin
get("/{path}") {
    val userSession: UserSession? = getSession(call)
    if (userSession != null) {
        val userInfo: UserInfo =
            getPersonalGreeting(httpClient, userSession)
        call.respondText("Hello, ${userInfo.name}!")
    }
}
```

実行可能な完全な例については、[auth-oauth-google](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-oauth-google) を参照してください。