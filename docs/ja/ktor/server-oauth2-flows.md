[//]: # (title: OAuth 2.0 フロー)

<show-structure for="chapter" depth="2"/>
<primary-label ref="experimental"/>

<var name="artifact_name" value="ktor-server-auth"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:%artifact_name%</code>, <code>io.ktor:ktor-server-sessions</code>
</p>
</tldr>

<link-summary>
型付きの OAuth 2.0 フローは、独自のログインルートとコールバックルートをインストールし、型付きセッションを通じてユーザーのサインイン状態を維持できます。
</link-summary>

Ktor は、[型安全な認証スキーム API](server-typed-auth.md) の一部として、2 つの型付き OAuth 2.0 フローを提供しています。

* `oauth2Session` はユーザーをサインインさせてセッションを保存し、アプリケーションのルートを保護するためのスキームを提供します。特別な理由がない限り、こちらを使用してください。
* `oauth2` はユーザーをサインインさせ、コールバック内でトークンを渡します。その後のルートは保護しません。

フローは `authenticateWith()` に渡すスキームではありません。ルーティングに `install()` する値であり、ログインルートとコールバックルートを自動的に作成します。

<note>
    <p>
        型安全な認証スキーム API は実験的（experimental）です。いつでも廃止または変更される可能性があります。
        オプトインが必要です。詳細については、
        <a href="server-typed-auth.md#prerequisites">型安全な認証のドキュメント</a>を参照してください。
    </p>
</note>

> このトピックでは型付き API について説明します。従来の `oauth` プロバイダーについては、[OAuth](server-oauth.md) を参照してください。
>
{style="note"}

## フローの仕組み {id="flow"}

1. ユーザーがログインパスにアクセスします。Ktor はユーザーを OAuth プロバイダーにリダイレクトします。
2. ユーザーがプロバイダー側で要求された権限を承認します。
3. プロバイダーが認可コードとともにコールバックパスにリダイレクトして戻します。
4. Ktor がそのコードをアクセストークンと交換します。
5. `oauth2Session` の場合、Ktor はセッションを保存してプリンシパルを解決し、コールバックハンドラーを実行します。

## oauth2Session を使用してユーザーをサインインさせる {id="oauth2-session"}

フローがプロバイダーのトークンエンドポイントを呼び出すには [HttpClient](client-create-and-configure.md) が必要となるため、`io.ktor:ktor-client-cio` などのクライアントエンジンの依存関係も追加してください。

ルートで処理するプリンシパルと、Ktor が呼び出し元用に保存するセッションの 2 つの型を宣言します。

```kotlin
data class User(val id: String, val email: String)
data class UserSession(val accessToken: String)
```

次にフローを作成します。型引数の順序に注意してください。第 1 引数がプリンシパル、第 2 引数がセッションです。

```kotlin
val googleAuthorizeUrl =
    "https://accounts.google.com/o/oauth2/auth"
val googleTokenUrl = "https://oauth2.googleapis.com/token"
val profileScope =
    "https://www.googleapis.com/auth/userinfo.profile"

val googleAuth = oauth2Session<User, UserSession>("google") {
    client = HttpClient(CIO)
    settings = OAuthServerSettings.OAuth2ServerSettings(
        name = "google",
        authorizeUrl = googleAuthorizeUrl,
        accessTokenUrl = googleTokenUrl,
        requestMethod = HttpMethod.Post,
        clientId = System.getenv("GOOGLE_CLIENT_ID"),
        clientSecret = System.getenv("GOOGLE_CLIENT_SECRET"),
        defaultScopes = listOf(profileScope)
    )
    loginPath = "/login"
    callback("/callback") {
        call.respondRedirect("/profile")
    }
    sessions {
        sessionCreator = { token ->
            UserSession(token.accessToken)
        }
        validate { session ->
            userService.loadUser(session.accessToken)
        }
    }
}
```

`sessions` ブロックには 2 つの役割があります。

* `sessionCreator` は、トークンレスポンスを保存したいセッションに変換します。これはトークン交換の直後に 1 回だけ実行されます。
* `validate` は、保存されたセッションをプリンシパルに変換します。これは保護されたルートへのリクエストごとに実行されます。

どちらも必須です。

フローをインストールし、`flow.session` でルートを保護します。

```kotlin
routing {
    install(googleAuth)

    authenticateWith(googleAuth.session) {
        get("/profile") {
            val user = call.principal
            val session = call.session
            val token = session.accessToken
            call.respondText("${user.email} ($token)")
        }
    }
}
```

`install()` はログインルートを作成し、コールバックルートを作成し、セッションスキーム用の [Sessions](server-sessions.md) プラグインをインストールします。ご自身で `Sessions` をインストールする必要はありません。

保護されたルート内では、`call.principal` が `User` となり、`call.session` が `UserSession` となります。セッションでできることの詳細については、[型安全なセッション認証](server-typed-session-auth.md) を参照してください。

## 保護されたルートはリダイレクトしない {id="redirects"}

フローによって自動作成されるルート（ログインパスおよびコールバックパス）は、未認証のアクセス者を OAuth プロバイダーにリダイレクトします。一方、`authenticateWith(flow.session)` で保護されたルートは**リダイレクトしません**。有効なセッションのないリクエストには `401 Unauthorized` が返されます。

ユーザーをプロバイダーに送るには、次の 2 つの方法があります。

* サインインページから `loginPath` へのリンクを設ける。
* セッションが存在しない場合に、手動でそこへリダイレクトする:

  ```kotlin
  val googleAuth = oauth2Session<User, UserSession>("google") {
      // ...
      sessions {
          sessionCreator = { token ->
              UserSession(token.accessToken)
          }
          validate { session ->
              userService.loadUser(session.accessToken)
          }
          onUnauthorized = { call.respondRedirect("/login") }
      }
  }
  ```

## サインインの失敗を処理する {id="errors"}

2 つのハンドラーが、サインインが失敗する 2 つのケースをカバーします。

フロー上の `onUnauthorized` は、ユーザーによる同意拒否、トークン交換の失敗、`sessionCreator` や `validate` が `null` を返した場合などの OAuth エラーを処理します。

```kotlin
val googleAuth = oauth2Session<User, UserSession>("google") {
    // ...
    onUnauthorized = { cause ->
        call.respondRedirect("/login?error=${cause}")
    }
}
```

## 複数のプロバイダーを使用する {id="provider-lookup"}

リクエストごとにプロバイダーを選択するには、`settings` の代わりに `providerLookup` を設定します。このブロックはルーティングコンテキストで実行されるため、パス、クエリパラメータ、ヘッダーを読み取ることができます。

```kotlin
val socialAuth = oauth2Session<User, UserSession>("social") {
    client = HttpClient(CIO)
    providerLookup = {
        when (call.parameters["provider"]) {
            "google" -> googleSettings
            "github" -> githubSettings
            else -> null
        }
    }
    loginPath = "/login/{provider}"
    callback("/callback/{provider}") {
        call.respondRedirect("/profile")
    }
    sessions {
        sessionCreator = { token ->
            UserSession(token.accessToken)
        }
        validate { session ->
            userService.loadUser(session.accessToken)
        }
    }
}
```

`settings` または `providerLookup` のいずれか一方のみを設定してください。両方を同時に設定することはできません。

## セッションなしでサインインする {id="oauth2"}

サインイン後に独自の JWT を発行する場合など、Ktor が以降のルートを保護する必要がない場合は `oauth2` を使用します。コールバックハンドラーはトークンレスポンスを受け取ります。

```kotlin
val githubAuthorizeUrl =
    "https://github.com/login/oauth/authorize"
val githubTokenUrl =
    "https://github.com/login/oauth/access_token"

val githubOAuth = oauth2("github") {
    client = HttpClient(CIO)
    settings = OAuthServerSettings.OAuth2ServerSettings(
        name = "github",
        authorizeUrl = githubAuthorizeUrl,
        accessTokenUrl = githubTokenUrl,
        requestMethod = HttpMethod.Post,
        clientId = System.getenv("GITHUB_CLIENT_ID"),
        clientSecret = System.getenv("GITHUB_CLIENT_SECRET")
    )
    loginPath = "/login"
    callback("/callback") { token ->
        val jwt = tokenService.issueToken(token.accessToken)
        call.respondText(jwt)
    }
}

routing {
    install(githubOAuth)
}
```

ここには `flow.session` がないため、`authenticateWith()` に渡すものはありません。[`jwt`](server-jwt.md) などの別のスキームでルートを保護してください。

## セキュリティに関する注意事項 {id="security"}

* `clientSecret` はソース管理に含めないでください。環境変数または[設定ファイル](server-configuration-file.topic)から読み取ります。
* コールバックは、新しく生成されたセッション ID でセッションを保存し、コールバックリクエストとともに届いたセッション ID は破棄します。これにより、セッション固定化攻撃（Session Fixation）を防止します。
* デフォルトのセッショントランスポートはセッションデータをサーバー側に保持し、クライアントには ID のみを送信します。値によるトランスポート（by-value transport）に切り替える場合は、トランスフォーマーを追加してください。[トランスポートの選択](server-typed-session-auth.md#transport)を参照してください。

## 次のステップ {id="next"}

* [型安全な認証](server-typed-auth.md) では、ロール、オプションの認証、および API のその他の機能について説明しています。
* [型安全なセッション認証](server-typed-session-auth.md) では、セッション、トランスポート、およびユーザーのサインアウトについて説明しています。
* [OpenID Connect](server-oidc.md) では、OpenID Connect 発行者（issuer）URL からこれらのフローを自動的に構成する方法について説明しています。