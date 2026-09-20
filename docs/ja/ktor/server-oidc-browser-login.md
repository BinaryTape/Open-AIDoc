[//]: # (title: OpenID Connect ブラウザログイン)

<show-structure for="chapter" depth="2"/>
<primary-label ref="experimental"/>

<var name="artifact_name" value="ktor-server-auth-oidc"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">Native サーバー</Links>のサポート</b>: ✖️
</p>
</tldr>

<link-summary>
OpenID Connect プロバイダーを介してユーザーをサインインさせます。このプラグインはログインおよびコールバックルートを作成し、セッションによってユーザーのサインイン状態を維持します。
</link-summary>

このトピックでは、OpenID Connect を使用してブラウザからユーザーをサインインさせ、セッションを管理し、ログアウトやトークンのリフレッシュを処理する方法について説明します。

> OpenID Connect プロバイダーによって発行されたトークンを検証する方法については、[OpenID Connect リソースサーバー](server-oidc-resource-server.md)を参照してください。
> 
> ディスカバリーとプラグインのセットアップについては、[OpenID Connect](server-oidc.md)を参照してください。
> 
{style="tip"}

<note>
    <p>
        OpenID Connect プラグインは実験的（Experimental）であり、JVM でのみ利用可能で、
        <code>@OptIn(ExperimentalKtorApi::class)</code> が必要です。このプラグインは、Kotlin のコンテキストパラメータ（Context Parameters）を必要とする
        <Links href="/ktor/server-typed-auth" summary="The type-safe authentication scheme API binds the principal type to the route, so you can read a non-null principal without
casts or null checks.">型安全な認証 API</Links>を使用します。
    </p>
</note>

## フローの仕組み {id="flow"}

1. ユーザーが `/oidc/{name}/login` を開きます。
2. Ktor は `state`、`nonce`、および PKCE チャレンジを付与して、ユーザーをプロバイダーへリダイレクトします。
3. ユーザーはプロバイダーでサインインし、要求されたスコープを承認します。
4. プロバイダーは認可コードを付けてユーザーを `/oidc/{name}/callback` へ送り返します。
5. Ktor は認可コードをトークンと交換し、ID トークンを検証してセッションを保存します。
6. `onAuthenticated` ハンドラーが実行されます。

プラグインは以下のルートを作成します:

| ルート                   | メソッド | 作成タイミング            |
|-------------------------|--------|---------------------------|
| `/oidc/{name}/login`    | `GET`  | 常に                      |
| `/oidc/{name}/callback` | `GET`  | 常に                      |
| `/oidc/{name}/logout`   | `POST` | `logout()` の呼び出し時   |
| `/oidc/{name}/refresh`  | `POST` | `refresh()` の呼び出し時  |

コールバックルートを許可されたリダイレクト URI としてプロバイダーに登録してください。

## ユーザーのサインイン {id="oauth"}

サインイン成功を処理するには、OAuth 認証情報を設定し、`onAuthenticated` ハンドラーを使用します:

```kotlin
suspend fun Application.module() {
    val oidc = install(Oidc)

    val google = oidc.identityProvider("google") {
        issuer = "https://accounts.google.com"
        oauth {
            clientId = System.getenv("GOOGLE_CLIENT_ID")
            clientSecret = System.getenv("GOOGLE_CLIENT_SECRET")
            onAuthenticated { idToken ->
                val subject = idToken.userInfo.subject
                userService.recordLogin(subject)
                call.respondRedirect("/dashboard")
            }
        }
    }
}
```

`onAuthenticated` ハンドラーは、セッションが保存された後、コールバック成功時の最後に 1 回実行されます。
このハンドラーがない場合、ログイン成功時には空のボディを持つ `200 OK` が返されます。

`scopes` プロパティのデフォルトは `listOf("openid", "profile", "email")` です。値を代入するとデフォルトのリストに追加されるのではなく置き換えられます。また、結果のリストには依然として `openid` が含まれている必要があります:

```kotlin
oauth {
    clientId = System.getenv("GOOGLE_CLIENT_ID")
    clientSecret = System.getenv("GOOGLE_CLIENT_SECRET")
    scopes = listOf("openid", "email", "calendar.read")
}
```

プロバイダーが ID トークンに含めていないクレームを取得するには、`fetchUserInfo = true` を設定します。これにより、ログインのたびに UserInfo エンドポイントへのリクエストが追加されます。

> クライアントシークレットはソースコード外の設定ファイルに保存してください。詳細については、[設定ファイルからの設定](server-oidc.md#config-file)を参照してください。
>
{style="tip"}

## ルートのカスタマイズ {id="paths"}

生成されるすべてのパスをカスタマイズできます。`loginUri` および `redirectUri` プロパティは `URLBuilder` ブロックを受け取り、`logout()` および `refresh()` は `path` を受け取ります:

```kotlin
oauth {
    clientId = System.getenv("GOOGLE_CLIENT_ID")
    clientSecret = System.getenv("GOOGLE_CLIENT_SECRET")
    loginUri = { path("auth", "google", "signin") }
    redirectUri = { path("auth", "google", "callback") }
    logout(path = "/auth/google/signout")
    refresh(path = "/auth/google/renew")
}
```

`redirectUri` プロパティは、プロバイダーに登録されたリダイレクト URI と一致している必要があります。この値を変更した場合は、登録されているリダイレクト URI も更新してください。

これらのビルダーはいずれもクエリパラメータをサポートしていません。プラグインはクエリパラメータを含むパスを拒否します。

## セッションでルートを保護する {id="session"}

`provider.session` スキームは、既存のセッションを使用してユーザーを認証します。ブロック内では、`call.principal` は `OidcToken.Id` になります:

```kotlin
routing {
    authenticateWith(google.session) {
        get("/dashboard") {
            val user = call.principal.userInfo
            call.respondText("Hello ${user.name}")
        }
    }
}
```

OIDC トークンの代わりにアプリケーション固有のプリンシパルを扱うには、`mapPrincipal()` を使用してスキームをマッピングします:

```kotlin
data class AppUser(val id: String, val email: String?)

val sessionAuth = google.session.mapPrincipal { token ->
    val info = token.userInfo
    userService.find(info.subject) ?: AppUser(
        id = info.subject,
        email = info.email
    )
}
```

> 詳細については、[トークンをアプリケーションプリンシパルにマッピングする](server-oidc.md#map-principal)を参照してください。
> 
{style="tip"}

## セッションの設定 {id="sessions"}

セッションはデフォルトで有効になっています。Cookie 名やセッションストレージを設定するには、`sessions { }` ブロックを使用します:

```kotlin
oauth {
    clientId = System.getenv("GOOGLE_CLIENT_ID")
    clientSecret = System.getenv("GOOGLE_CLIENT_SECRET")
    sessions {
        name = "GOOGLE_SESSION"
        storage = directorySessionStorage(
            File("build/.sessions")
        )
        cookie {
            cookie.path = "/"
            cookie.maxAgeInSeconds = 3600
        }
    }
}
```

Cookie 名のデフォルトは `{PROVIDER_NAME}_SESSION` です。プラグインは開発モード以外では `HttpOnly`、`SameSite=Lax`、および `Secure` を設定します。これらの設定をオーバーライドするのは必要な場合のみにしてください。

トランスポートは常に `SessionTransportType.CookieId` であり、変更できません。ブラウザに送信されるのはセッション ID のみです。ID トークン、アクセストークン、およびリフレッシュトークンは、サーバー側の `storage` 内に保持されます。

セッションストレージのデフォルトは `SessionStorageMemory()` であり、アプリケーションが再起動するとすべてのセッションが失われ、インスタンス間でセッションが共有されません。本番環境にデプロイする前に、永続ストレージまたは共有ストレージを設定してください。

> セッションの操作に関する詳細については、[セッション](server-sessions.md)を参照してください。
> 
{style="tip"}

## CSRF に対する保護 {id="csrf"}

プラグインによって生成されるルートは、オリジンチェックによって保護されています:

```kotlin
sessions {
    csrfProtection {
        originMatchesHost()
    }
}
```

この保護はデフォルトで有効になっているため、変更が必要な場合のみこのブロックを設定してください。

`disableCsrfProtection()` 関数を使用すると CSRF 保護を無効にできます。ただし、ログアウトおよびリフレッシュのルートはセッション Cookie を含むブラウザからの `POST` リクエストを受け付けるため、これらのルートは CSRF から保護された状態を維持する必要があります。

## ユーザーのサインアウト {id="logout"}

ユーザーをサインアウトさせるには、`logout()` 関数を使用します:

```kotlin
oauth {
    clientId = System.getenv("GOOGLE_CLIENT_ID")
    clientSecret = System.getenv("GOOGLE_CLIENT_SECRET")
    logout(
        postLogoutRedirectUri = { path("signed-out") }
    )
}
```

`/oidc/google/logout` への `POST` リクエストはセッションをクリアし、`303 See Other` を返してユーザーをプロバイダーの `end_session_endpoint` にリダイレクトします。

プロバイダーはディスカバリードキュメントで `end_session_endpoint` を公開している必要があります。Ktor はルート登録時にこれを確認するため、このエンドポイントを持たないプロバイダーを使用していると、サインアウト時ではなくアプリケーションの起動時に失敗します。お使いのプロバイダーがこのエンドポイントをサポートしていない場合は、`logout()` を呼び出す代わりにセッションを直接クリアしてください。

リダイレクトする代わりに追加のロジックを実行したり、カスタムレスポンスを返したりするには、ハンドラーを渡します:

```kotlin
logout {
    call.respondRedirect("/goodbye")
}
```

サインアウトしても、プロバイダー側のリフレッシュトークンは失効しません。

## セッションを最新に保つ {id="refresh"}

ID トークンには有効期限があります。デフォルトでは、プラグインはトークンを自動でリフレッシュしません。トークンの有効期限が `exp` の値を過ぎると、セッションはクリアされ、ユーザーは再度サインインする必要があります。

トークンを自動的にリフレッシュするには、リフレッシュ戦略を設定します:

```kotlin
sessions {
    tokenRefreshStrategy = OidcTokenRefreshStrategy.Auto(
        beforeExpiry = 30.seconds
    )
}
```

リフレッシュされたトークンは、既存のトークンと同じ `sub` 値を持つ必要があります。そうでない場合、リフレッシュされたトークンは破棄されます。

自動リフレッシュには `OidcTokenRefreshStrategy.Auto` を使用します。カスタムのリフレッシュ動作には `OidcTokenRefreshStrategy.Custom` を使用します:

```kotlin
sessions {
    val custom = OidcTokenRefreshStrategy.Custom { provider, token, now ->
        val expiresAt = token.claims.expiresAt
        val stale = expiresAt != null && expiresAt <= now + 5.minutes
        val refreshToken = token.refreshToken
        if (stale && refreshToken != null) {
            provider.refreshToken(refreshToken).idToken
        } else {
            token
        }
    }
    tokenRefreshStrategy = custom
}
```

既存のセッションを保持する場合は `token` を、保存されたセッションを置き換える場合は新しい `OidcToken.Id` を、リフレッシュトークンが利用できない場合は `null` を返します。コールバックが `null` を返すか例外をスローした場合、現在のトークンが有効な間はセッションが利用可能なまま維持され、期限切れになるとクリアされます。セッションを即座に終了するには、代わりに [セッション](server-sessions.md) プラグインを使用してセッションをクリアしてください。

コールバックはセッションスキームで認証されたすべてのリクエストに対して実行されるため、処理は軽量に保ってください。時計を直接読み取る代わりに `now` パラメータを使用することで、リクエスト内のすべての時間比較で同じ値が使用されるようになります。

`now` パラメータおよび `claims.expiresAt` は `kotlin.time.Instant` であり、実験的（Experimental）です。これらを比較する戦略には、プラグインで必要とされるオプトインに加えて `@OptIn(ExperimentalTime::class)` が必要です。

オンデマンドのリフレッシュ用のルートを追加することもできます:

```kotlin
oauth {
    clientId = System.getenv("GOOGLE_CLIENT_ID")
    clientSecret = System.getenv("GOOGLE_CLIENT_SECRET")
    refresh()
}
```

`/oidc/google/refresh` への `POST` リクエストは、成功時には `200 OK` を返し、セッションをリフレッシュできない場合は `401 Unauthorized` を返します。`401` レスポンスの場合、トークンが期限切れになるまで既存のセッションは変更されません。

### トークンを手動でリフレッシュする {id="manual-refresh"}

生成されたリフレッシュルートを使用しないケース（スケジュールされたジョブや、ダウンストリーム API を呼び出す前のリフレッシュなど）では、プロバイダーの `refreshToken()` 関数を呼び出します:

```kotlin
val refreshToken = call.principal.refreshToken
if (refreshToken != null) {
    val result = google.refreshToken(refreshToken)
    val newIdToken = result.idToken
    if (newIdToken != null) {
        call.session = newIdToken
    }
}
```

`OidcTokenRefreshResult` は未加工のトークンレスポンス（`accessToken`、`refreshToken`、`expiresIn`、`tokenType`、および `scope`）を保持します。プロバイダーが ID トークンを返さない場合、`idToken` プロパティは null になるため、セッションを保存する前に確認してください。

リフレッシュ中にプロバイダーは以下の例外をスローすることがあります:
* プロバイダーがリクエストを拒否した場合の `ResponseException`。
* 返されたトークンの検証に失敗した場合の `OidcTokenRejectedException`。
* ID トークンを検証できない場合の `OidcSigningKeyUnavailableException`。詳細については、[サーバー側の検証失敗の処理](server-oidc-resource-server.md#errors-500)を参照してください。

同じリフレッシュトークンを使用した並行呼び出しは、プロバイダーへの単一のリクエストを共有します。結果は `tokenRefreshCacheTtl` の間再利用されるため、追加の同期処理は不要です。

> `exp` クレームのない ID トークンは、期限切れとして扱われることもリフレッシュされることもありません。セッションは Cookie が有効である限り有効なままになります。
>
{style="note"}

## セッションなしでサインインする {id="no-session"}

独自のセッションを管理する場合や独自のトークンを発行する場合は、プラグインのセッションサポートを無効にします:

```kotlin
oauth {
    clientId = System.getenv("GOOGLE_CLIENT_ID")
    clientSecret = System.getenv("GOOGLE_CLIENT_SECRET")
    disableSessions()
    onAuthenticated { idToken ->
        val token = myTokenService.issue(idToken.userInfo)
        call.respondText(token)
    }
}
```

セッションが無効化されている場合、`onAuthenticated` は必須です。このモードでは `provider.session`、`logout()`、および `refresh()` 関数は利用できません。

## 複数のプロバイダーを使用する {id="multiple"}

発行者（Issuer）ごとに 1 つのアイデンティティプロバイダーを登録します。各プロバイダーには独自のルート、Cookie、および認証スキームがあります:

```kotlin
val google = oidc.identityProvider("google") {
    issuer = "https://accounts.google.com"
    oauth {
        clientId = System.getenv("GOOGLE_CLIENT_ID")
        clientSecret = System.getenv("GOOGLE_CLIENT_SECRET")
    }
}

val github = oidc.identityProvider("github-idp") {
    issuer = "https://idp.example.com"
    oauth {
        clientId = System.getenv("IDP_CLIENT_ID")
        clientSecret = System.getenv("IDP_CLIENT_SECRET")
    }
}
```

上記の例では、ログインページは `/oidc/google/login` および `/oidc/github-idp/login` にリンクします。いずれのプロバイダーでも同じルートを認証できるようにするには、両方を共通のプリンシパル型にマッピングし、`authenticateWithAnyOf()` 関数を使用します。

## スコープ付きトークンを要求する {id="resource-indicators"}

特定の API に対するアクセストークンを要求するには、`resourceIndicators` プロパティ（[RFC 8707](https://www.rfc-editor.org/rfc/rfc8707)）を使用します:

```kotlin
oauth {
    clientId = System.getenv("GOOGLE_CLIENT_ID")
    clientSecret = System.getenv("GOOGLE_CLIENT_SECRET")
    resourceIndicators = listOf("https://api.example.com")
}
```

この値は、API が[保護されたリソースのメタデータ](server-oidc-resource-server.md#protected-resource)で公開している識別子と一致している必要があります。

## PKCE の仕組み {id="pkce"}

認可コードはユーザーのブラウザを介して返され、管理外のソフトウェアを通過します。同じ URL スキームに登録された悪意のあるアプリやログ記録プロキシなどの別のアプリケーションがコードを取得し、それをトークンと引き換えようとする可能性があります。

PKCE（[RFC 7636](https://www.rfc-editor.org/rfc/rfc7636)）は、追加のシークレットなしで認可コードが使用されるのを防ぎます。ユーザーをリダイレクトする前に、Ktor は _verifier_（検証子）と呼ばれるランダムなシークレットを生成し、その SHA-256 ハッシュである _challenge_（チャレンジ）のみをプロバイダーに送信します。その後、Ktor がコードを交換する際に verifier を提示し、プロバイダーはそれが保存していた challenge にハッシュ化されるかを確認します。

verifier は認可リクエスト中にプロバイダーに送信されず、ブラウザのスクリプトからも読み取ることはできません。Ktor は、プラグインが設定する AES-256-GCM で暗号化された Cookie 内に `state` および `nonce` の値とともに verifier を保存するため、ブラウザは鍵を持たない暗号文のみを保持します。Cookie を復号するには `stateEncryptionKey` が必要です。

Ktor はすべてのログインで PKCE を使用します。`codeChallengeMethod` のデフォルトは `CodeChallengeMethod.S256` であり、`S256` のみがサポートされています。カスタムのチャレンジメソッドは拒否されます。verifier はその Cookie に保存されるため、ログインには[時間制限](#errors-state)があります。

## サインインエラーの処理 {id="errors"}

### ログイン失敗への応答 {id="errors-handler"}

コールバックを完了できない場合、`onAuthenticationFailed` ハンドラーが実行されます:

```kotlin
oauth {
    clientId = System.getenv("GOOGLE_CLIENT_ID")
    clientSecret = System.getenv("GOOGLE_CLIENT_SECRET")
    onAuthenticationFailed { cause ->
        val reason = (cause as? AuthenticationFailedCause.Error)
            ?.message
        call.application.log.info("Login failed: $reason")
        call.respondRedirect("/oidc/google/login")
    }
}
```

ハンドラーは例外ではなく `AuthenticationFailedCause` を受け取ります。`AuthenticationFailedCause.Error` は、失敗に関する詳細を含む `message` を提供します。

ハンドラーがない場合、ログイン失敗時には空のボディを持つ `401 Unauthorized` が返されます。ブラウザアプリケーションの場合、ユーザーをログインルートにリダイレクトして新しい認証フローを開始させることができます。

ハンドラーはレスポンスを生成する必要があります。生成しない場合、Ktor は失敗によって登録されたチャレンジにフォールバックするか、チャレンジが利用できない場合は `401 Unauthorized` で応答します。

トークンエンドポイントが認可コードを `invalid_grant` として拒否した場合（コードが期限切れであるか、すでに使用されている場合に発生します）、プロバイダーへのリダイレクトがフォールバックとして登録されます。ハンドラーが応答しない場合、ログインフローが再開されます。

たとえばユーザーがコールバックページをリロードして同じコードの再利用を試みた場合などに、フローを再開することは有用です。ただし、これが繰り返されるリスクがあります。`invalid_grant` のレスポンスが繰り返されると、リダイレクトループが発生する可能性があります。これは、クライアントシークレットが正しくない場合やシステムクロックによってコードが期限切れとみなされる場合など、すべての認可コードが失敗するときに発生することがあります。

フォールバックリダイレクトを防ぐには、ハンドラー内でレスポンスを返します。1 回のみのリトライを許可するには、リトライがすでに行われたかどうかを追跡します:

```kotlin
onAuthenticationFailed { cause ->
    val retried =
        call.request.cookies["oidc_retry"] != null
    if (cause is OAuth2InvalidGrantError && !retried) {
        call.response.cookies.append(
            name = "oidc_retry",
            value = "1",
            maxAge = 120,
            path = "/",
            httpOnly = true
        )
        call.respondRedirect("/oidc/google/login")
    } else {
        call.response.cookies.append(
            name = "oidc_retry",
            value = "",
            maxAge = 0,
            path = "/"
        )
        call.application.log.warn("Login failed: $cause")
        call.respond(HttpStatusCode.Unauthorized)
    }
}
```

短寿命の Cookie により、リトライがすでに行われたかどうかが記録されます。2 回目の失敗では、再度リダイレクトする代わりにエラーが返されます。Cookie はそのエラー時にクリアされ、2 分後に自動的に期限切れになるため、その後のログインには影響しません。

### ログイン有効時間は 10 分間 {id="errors-state"}

`state`、`nonce`、および PKCE verifier は、10 分で期限切れになる暗号化 Cookie に保持されます。これは設定で変更できません。

ログインページを開いたまま離席し、1 時間後に戻ってきたユーザーはコールバックで失敗します。`stateEncryptionKey` を設定していない限り、アプリケーションの再起動時にログインが進行中だったユーザーも同様に失敗します:

```kotlin
oauth {
    clientId = System.getenv("GOOGLE_CLIENT_ID")
    clientSecret = System.getenv("GOOGLE_CLIENT_SECRET")
    stateEncryptionKey = OidcStateEncryptionKey.of(stateKey)
}
```

キーは厳密に 32 バイトである必要があります。明示的なキーがない場合、プラグインはプロセスごとに新しいキーを生成します。その結果、アプリケーションの再起動後に進行中のログインは失敗し、ロードバランサー背後にあるインスタンス間で継続することもできません。`OidcStateEncryptionKey.rotating(current, previous)` を使用すると、進行中のログインフローを無効にすることなくキーを変更できます。

期限切れのログインと偽造されたコールバックは同じ失敗を生じるため、ハンドラーはそれらを区別できません。これが、デフォルトでログインルートへリダイレクトされる理由です。

### 認証失敗の原因 {id="errors-causes"}

| 原因                                   | 一般的な理由                                                                    |
|----------------------------------------|---------------------------------------------------------------------------------|
| プロバイダーが `error=` を返した        | ユーザーが同意を拒否した                                                        |
| state Cookie が存在しないか期限切れ    | 10 分の有効時間が経過した、または `stateEncryptionKey` なしで再起動した          |
| state Cookie を復号できない            | 偽造されたコールバック、またはキーがローテーションされた                         |
| `iss` の不一致または欠落               | プロバイダー間の混同（[RFC 9207](https://www.rfc-editor.org/rfc/rfc9207)）      |
| `nonce` の不一致                       | リプレイされた ID トークン                                                      |
| `at_hash` の不一致                     | ID トークンがアクセストークンと一致しない                                        |
| レスポンスに `id_token` が含まれない   | プロバイダーが OIDC フローを実行していない                                      |
| ID トークンの検証失敗                  | 署名、issuer、audience、`exp`、`iat`、`azp`、または `sub`                      |
| トークンエンドポイントがエラーを返した  | 期限切れまたは再利用された認可コード                                            |

### プロバイダーの可用性エラーの処理 {id="errors-500"}

一部の失敗は `onAuthenticationFailed` に到達せず、代わりに `500 Internal Server Error` として表面化します。詳細については、[サーバー側の検証失敗の処理](server-oidc-resource-server.md#errors-500)を参照してください。

これは自動トークンリフレッシュ中に発生する可能性があります。`OidcTokenRefreshStrategy.Auto` では、通常のリクエストを処理している最中にリフレッシュが実行されます。そのため、プロバイダーが利用できない場合、リクエストは `500` レスポンスで失敗することがあります。

セッションがどうなるかは、リフレッシュが失敗した理由によって異なります:

| 失敗の内容                                      | セッション                                   | 結果                                                              |
|-------------------------------------------------|----------------------------------------------|-------------------------------------------------------------------|
| リフレッシュされたトークンが無効                | クリアされる                                 | `401`、Cookie が削除される。セッションは復旧不可                  |
| プロバイダーに到達できない、またはエラーを返す  | すでに期限切れでない限り保持される           | 例外が伝播するため `500`                                          |
| レスポンスに ID トークンがない、または `sub` 変更 | 有効な間は保持され、期限切れになるとクリア   | 古いトークンが期限切れになるまで動作する                          |

セッションがクリアされると、次の保護されたリクエストは未認証となり、ユーザーは再度サインインする必要があります。

> ディスカバリー、セッションセキュリティのデフォルト設定、およびテストの詳細については、[OpenID Connect](server-oidc.md)を参照してください。
> 
> API でのトークン検証については、[OpenID Connect リソースサーバー](server-oidc-resource-server.md)を参照してください。
> 
> セッションストレージと Cookie の設定については、[セッション](server-sessions.md)を参照してください。
> 
{style="tip"}