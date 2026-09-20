[//]: # (title: OAuth 2.0 フロー)

<show-structure for="chapter" depth="2"/>
<primary-label ref="experimental"/>

<var name="artifact_name" value="ktor-server-auth"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:%artifact_name%</code>、<code>io.ktor:ktor-server-sessions</code>
</p>
</tldr>

<link-summary>
型付き OAuth 2.0 フローは独自のログインおよびコールバックルートをインストールし、型付きセッションを通じてユーザーのサインイン状態を維持できます。
</link-summary>

Ktor は、[型安全な認証スキーム API](server-typed-auth.md) の一部として 2 つの型付き OAuth 2.0 フローを提供します。

* `oauth2Session` はユーザーをサインインさせ、セッションを保存し、アプリケーションのルートを保護するためのスキームを提供します。特別な理由がない限り、こちらを使用してください。
* `oauth2` はユーザーをサインインさせ、コールバック内でトークンを渡します。その後のルートは保護しません。

フローは `authenticateWith()` に渡すスキームではありません。ルーティングに `install()` する値であり、ログインルートとコールバックルートを自動的に作成します。

<note>
    <p>
        型安全な認証スキーム API は実験的（experimental）です。予告なしに削除または変更される可能性があります。
        オプトインが必要です。詳細については、
        <a href="server-typed-auth.md#prerequisites">API を有効にする</a>を参照してください。
    </p>
</note>

> このトピックでは型付き API について説明します。クラシックな `oauth` プロバイダーについては、[OAuth](server-oauth.md) を参照してください。
>
{style="note"}

## フローの仕組み {id="flow"}

1. ユーザーがログインパスにアクセスします。Ktor はユーザーを OAuth プロバイダーにリダイレクトします。
2. ユーザーはプロバイダー側で要求された権限を承認します。
3. プロバイダーは認可コード（authorization code）を付けてコールバックパスにリダイレクトして戻します。
4. Ktor はコードをアクセストークンと交換します。
5. `oauth2Session` の場合、Ktor はセッションを保存してプリンシパル（principal）を解決し、コールバックハンドラーを実行します。

## oauth2Session でユーザーをサインインさせる {id="oauth2-session"}

フローがプロバイダーのトークンエンドポイントを呼び出すには [HttpClient](client-create-and-configure.md) が必要なため、`io.ktor:ktor-client-cio` などのクライアントエンジン依存関係も追加してください。

ルートが処理するプリンシパルと、Ktor が呼び出し元のために保存するセッションの 2 つの型を宣言します。

```kotlin
data class User(val id: String, val email: String)
data class UserSession(val accessToken: String)
```

次にフローを作成します。型引数の順序に注意してください。プリンシパルが最初で、セッションが 2 番目です。

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

`sessions` ブロックは 2 つの役割を果たします。

* `sessionCreator` はトークンレスポンスを保存したいセッションに変換します。トークン交換の直後に 1 回実行されます。
* `validate` は保存されたセッションをプリンシパルに変換します。保護されたルートへのリクエストごとに実行されます。

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

`install()` はログインルートとコールバックルートを作成し、セッションスキーム用の [Sessions](server-sessions.md) プラグインをインストールします。ご自身で `Sessions` をインストールする必要はありません。

保護されたルート内では、`call.principal` は `User` になり、`call.session` は `UserSession` になります。セッションで実行できるすべての機能については、[型安全なセッション認証](server-typed-session-auth.md)を参照してください。

## 保護されたルートはリダイレクトしない {id="redirects"}

フローによって作成されるログインパスとコールバックパスのルートは、未認証の訪問者を OAuth プロバイダーにリダイレクトします。`authenticateWith(flow.session)` で保護されたルートは**リダイレクトしません**。有効なセッションがないリクエストには `401 Unauthorized` が返されます。

ユーザーをプロバイダーに送るには、以下の 2 つの方法があります。

* サインインページから `loginPath` へのリンクを設置する。
* セッションが存在しない場合に、自分でそこへリダイレクトする。

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

## サインイン失敗の処理 {id="errors"}

サインインが失敗する 2 つのケースに対応する 2 つのハンドラーが用意されています。

フローの `onUnauthorized` は、ユーザーによる同意の拒否、トークン交換の失敗、`sessionCreator` や `validate` が `null` を返すといった OAuth エラーを処理します。

```kotlin
val googleAuth = oauth2Session<User, UserSession>("google") {
    // ...
    onUnauthorized = { cause ->
        call.respondRedirect("/login?error=${cause}")
    }
}
```

## 複数のプロバイダーを使用する {id="provider-lookup"}

リクエストごとにプロバイダーを選択するには、`settings` の代わりに `providerLookup` を設定します。このブロックはルーティングコンテキスト内で実行されるため、パス、クエリパラメータ、ヘッダーを読み取ることができます。

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

`settings` または `providerLookup` のいずれか一方のみを設定してください。両方を設定することはできません。

## セッションなしでのサインイン {id="oauth2"}

サインイン後に独自の JWT を発行する場合など、その後のルートを Ktor に保護させる必要がない場合は、`oauth2` を使用します。コールバックハンドラーがトークンレスポンスを受け取ります。

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

ここには `flow.session` がないため、`authenticateWith()` に渡すものはありません。[`jwt`](server-jwt.md) など、別のスキームを使用してルートを保護してください。

## セキュリティに関する注意事項 {id="security"}

* `clientSecret` はソースコード管理に含めないでください。環境変数または[設定ファイル](server-configuration-file.topic)から読み取ってください。
* コールバックは新しく生成されたセッション ID のもとでセッションを保存し、コールバックリクエストと一緒に届いた既存のセッション ID は破棄します。これによりセッション固定化攻撃（session fixation）を防ぎます。
* デフォルトのセッショントランスポートはセッションデータをサーバー側に保持し、クライアントには ID のみを送信します。値渡し（by-value）のトランスポートに切り替える場合は、トランスフォーマーを追加してください。[トランスポートの選択](server-typed-session-auth.md#transport)を参照してください。

## 次のステップ {id="next"}

* [型安全な認証](server-typed-auth.md)では、ロール、オプション認証、およびその他の API について説明しています。
* [型安全なセッション認証](server-typed-session-auth.md)では、セッション、トランスポート、およびユーザーのサインアウトについて説明しています。
* [OpenID Connect](server-oidc.md) は、OpenID Connect 発行者 URL からこれらのフローを自動的に構成します。