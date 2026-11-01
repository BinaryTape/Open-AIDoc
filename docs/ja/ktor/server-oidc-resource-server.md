[//]: # (title: OpenID Connect リソースサーバー)

<show-structure for="chapter" depth="2"/>
<primary-label ref="experimental"/>

<var name="artifact_name" value="ktor-server-auth-oidc"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">Native サーバー</Links>のサポート</b>: ✖️
</p>
</tldr>

<link-summary>
OpenID Connect プロバイダーによって発行されたアクセストークンを、ローカルで JWT として検証するか、トークンイントロスペクションを通じて検証します。
</link-summary>

リソースサーバーは、他の誰かが発行したトークンを受け付ける API です。ログインページを提供したり、ブラウザセッションを使用したりすることはありません。クライアントがアクセストークンを送信し、サーバーは保護されたリソースへのアクセスを許可する前にそのトークンを検証します。

> ブラウザサインインについては、[OpenID Connect ブラウザログイン](server-oidc-browser-login.md)を参照してください。
> 
> ディスカバリー、トークンタイプ、プラグインのセットアップについては、[OpenID Connect](server-oidc.md)を参照してください。
> 
{style="tip"}

<note>
    <p>
        OpenID Connect プラグインは実験的（experimental）であり、JVM でのみ利用可能で、<code>@OptIn(ExperimentalKtorApi::class)</code> が必要です。このプラグインは <Links href="server-typed-auth.md" summary="The type-safe authentication scheme API binds the principal type to the route, so you can read a non-null principal without
casts or null checks.">型安全な認証 API</Links> を使用しており、これには Kotlin のコンテキストパラメーターが必要です。
    </p>
</note>

## JWT アクセストークンの検証 {id="jwt-bearer"}

多くのプロバイダーは、署名付き JSON Web Token (JWT) としてアクセストークンを発行します。API が想定する audience を設定し、`provider.jwtBearer` でルートを保護します。

```kotlin
suspend fun Application.module() {
    val oidc = install(Oidc)

    val auth0 = oidc.identityProvider("auth0") {
        issuer = "https://my-tenant.auth0.com"
        bearer {
            audience = setOf("https://api.example.com")
        }
    }

    routing {
        authenticateWith(auth0.jwtBearer) {
            get("/orders") {
                val subject = call.principal.claims.subject
                call.respondText("Hello $subject")
            }
        }
    }
}
```

`audience` プロパティは必須であり、空にしてはなりません。これはプロバイダー側で API を識別するためのものであり、通常は OAuth クライアント ID とは異なります。

プラグインは `Authorization: Bearer` ヘッダーからトークンを読み取り、プロバイダーの JWKS エンドポイントから署名鍵を取得して、署名、発行者（issuer）、audience、有効期限をチェックします。

## 不透明（opaque）トークンの検証 {id="introspection"}

すべてのプロバイダーが JWT を発行するわけではありません。不透明（_opaque_）トークンは読み取り可能なコンテンツを持たないランダムな文字列であるため、サーバー側でローカルに検証することはできません。これは意図的なトレードオフです。不透明トークンは傍受されても何も漏洩せず、使用するたびにプロバイダーに問い合わせが行われるため、取り消し（revoke）を行えば即座に無効化できます。一方、JWT は期限切れになるまで有効なままです。

不透明トークンを検証するために、サーバーは [RFC 7662](https://www.rfc-editor.org/rfc/rfc7662) で定義されているトークンイントロスペクション（_token introspection_）を使用します。サーバーはトークンをイントロスペクションエンドポイントに送信し、自身を認証した上で、トークンがアクティブであるかどうかや、サブジェクト（subject）、スコープ、クライアント、有効期限などの関連メタデータを示すレスポンスを受け取ります。

`introspection { }` ブロックを追加し、`provider.introspectionBearer` を使用します。

```kotlin
val auth0Issuer = "https://my-tenant.auth0.com"

val auth0 = oidc.identityProvider("auth0") {
    issuer = auth0Issuer
    bearer {
        audience = setOf("https://api.example.com")
        introspection {
            endpoint = "$auth0Issuer/oauth/introspect"
            clientId = "api-client"
            clientSecret = System.getenv("INTROSPECTION_SECRET")
        }
    }
}

routing {
    authenticateWith(auth0.introspectionBearer) {
        get("/orders") {
            val result = call.principal.introspection
            call.respondText("Hello ${result.username}")
        }
    }
}
```

イントロスペクションエンドポイントは OpenID Connect のディスカバリードキュメントには含まれていないため、プロバイダーのドキュメントに従って明示的に設定してください。上記の例では、外部の `issuer` プロパティが `introspection { }` ブロック内から利用できないため、issuer URL をローカル変数に格納しています。

`clientId` および `clientSecret` プロパティは、ユーザーではなく API 自身をプロバイダーに対して識別するためのものです。イントロスペクションは特権操作であるため、ほとんどのプロバイダーではイントロスペクションの実行を許可された専用のクライアントが必要です。

デフォルトでは、プラグインは HTTP Basic 認証を使用します。認証情報をフォーム本文で送信するには、代わりに `authMethod = ClientAuthenticationMethod.ClientSecretPost` を設定します。

トークンは、レスポンスに `active: true` が含まれ、その audience が設定済みの `audience` と交差し（一致するものが含まれ）、返された `iss`、`exp`、`nbf` の値がすべて有効である場合にのみ承認されます。

イントロスペクションは認証試行ごとにネットワークリクエストを必要とし、プロバイダーの可用性に依存します。プロバイダーが JWT を発行する場合は [JWT の検証](#jwt-bearer) を優先し、JWT を発行しない場合や、レイテンシーよりも即時失効が重視される場合にはイントロスペクションを使用してください。

## 別の場所からトークンを読み取る {id="token-extractor"}

デフォルトでは、プラグインは `Authorization` ヘッダーからトークンを読み取ります。別の場所から読み取るには、カスタムエクストラクターを設定します。

```kotlin
bearer {
    audience = setOf("https://api.example.com")
    tokenExtractor = { call.request.cookies["access_token"] }
}
```

トークンが存在しない場合は `null` を返します。その場合、リクエストは未認証として失敗します。

## 保護されたリソースのメタデータを公開する {id="protected-resource"}

[RFC 9728](https://www.rfc-editor.org/rfc/rfc9728) を使用すると、クライアントにあらかじめ認可サーバーを設定しておく代わりに、API が信頼している認可サーバーをクライアント自身に検出（ディスカバリー）させることができます。これはマシン間（M2M）クライアントや MCP サーバーに役立ちます。

プラグインをインストールする際に、保護されたリソースのメタデータを設定します。

```kotlin
val oidc = install(Oidc) {
    protectedResource("https://api.example.com") {
        resourceName = "Orders API"
    }
}
```

これにより、`/.well-known/oauth-protected-resource` でドキュメントが配信されます。プラグインは登録されたプロバイダーから以下の値を導出します。

* `authorizationServers` — `bearer { }` ブロックを持つすべてのプロバイダーの issuer。
* `scopesSupported` — それらのプロバイダーが要求するスコープ。
* `bearerMethodsSupported` — プロバイダーが標準の authorization ヘッダーを読み取る場合は `header`。

導出された値を上書きするには、これらのプロパティのいずれかを明示的に設定します。

保護されたリソースを設定すると、チャレンジ（challenge）も変更されます。拒否されたリクエストには、`WWW-Authenticate: Bearer` ヘッダーの代わりにメタデータドキュメントへのポインターが含まれます。

```http
WWW-Authenticate: Bearer resource_metadata="https://api.example.com/.well-known/oauth-protected-resource"
```

## 認証エラーの処理 {id="errors"}

### 認証エラーレスポンス {id="errors-response"}

拒否されたトークンは、`WWW-Authenticate: Bearer` ヘッダーとともに `401 Unauthorized` を返します。

このチャレンジには `error`、`error_description`、`realm` パラメーターは含まれません。その結果、クライアントはトークンの欠落と有効期限切れ、あるいは不正な署名と誤った audience の違いを区別できません。拒否されたトークンの診断の詳細については、[トークンが拒否された理由を特定する](#errors-logging) を参照してください。

以下の条件で `401 Unauthorized` が発生します。

| 原因                                               | 備考                                               |
|----------------------------------------------------|----------------------------------------------------|
| トークンがない、または不正な形式の `Authorization` ヘッダー |                                                    |
| 不正な署名                                         |                                                    |
| 誤った issuer または誤った audience                |                                                    |
| 期限切れのトークン                                 | `clockSkew` の許容時間の経過後                      |
| `none`、`HS256`、`HS384`、または `HS512` アルゴリズム | 常に拒否                                           |
| `allowedAlgorithms` 以外のアルゴリズム             |                                                    |
| 不明な `kid`                                       | 取得した JWKS ドキュメントにキーが存在しない       |
| イントロスペクションが `active: false` を返した    |                                                    |
| イントロスペクションが誤った audience または期限切れの audience を返した |                                                    |

不明な `kid` は、トークンが取得した JWKS ドキュメント内に存在しないキーを参照していることを示しており、そのため `401 Unauthorized` が返されます。

### サーバー側の検証失敗の処理 {id="errors-500"}

一部の障害では、トークン自体が無効であると確定することなく、プラグインがトークンの検証を完了できなくなります。これらの障害は `500 Internal Server Error` になります。

| 障害                                                                       | 例外                                                           |
|----------------------------------------------------------------------------|----------------------------------------------------------------|
| JWKS エンドポイントに到達できない                                          | `OidcSigningKeyUnavailableException`                           |
| JWKS ドキュメントを解析できない                                            | `OidcSigningKeyUnavailableException`                           |
| JWKS リクエストのレート制限に達した                                        | `OidcSigningKeyUnavailableException`                           |
| イントロスペクションエンドポイントに到達できない、または 2xx 以外のステータスが返された | `ResponseException`、`IOException`、またはデシリアライズエラー   |
| `fetchUserInfo` リクエストがトランスポートレベルで失敗した                | 同上                                                           |
| セッショントークンのリフレッシュがトランスポートレベルで失敗した           | 同上。[サインインエラーの処理](server-oidc-browser-login.md#errors) を参照 |

したがって、アイデンティティプロバイダーの障害により、認証済みリクエストが `500 Internal Server Error` で失敗する可能性があります。

JWK リクエストのレート制限はデフォルトで有効になっており、これも署名鍵のルックアップ失敗の原因となる可能性があります。鍵のルックアップは毎分 10 リクエストに制限されており、キャッシュに存在しない kid のルックアップはこの制限にカウントされます。鍵ローテーション時など、これまで見たことのない鍵で署名されたトークンが大量に届くと、この制限に達してしまうことがあります。

制限を増やすには、`jwkRateLimit` を設定します。

```kotlin
jwt { 
    jwkRateLimit(bucketSize = 60)
}
```

より適切なレスポンスを返すには、[`StatusPages`](server-status-pages.md) プラグインをインストールします。

```kotlin
install(StatusPages) {
    exception<OidcSigningKeyUnavailableException> { call, cause ->
        val log = call.application.log
        log.error("Signing key unavailable", cause)
        call.respond(HttpStatusCode.ServiceUnavailable)
    }
}
```

`503 Service Unavailable` は、アイデンティティプロバイダーが復旧した後にリクエストが成功する可能性があることを示します。

専用の例外型が用意されているのは署名鍵の障害のみであり、このようにグローバルにキャッチする価値があるのもこれだけです。残りのエラーは `ResponseException` や `IOException` として表面化しますが、これらは他の [HTTP クライアント](client-create-and-configure.md) 操作でも使用されます。これらの例外型をグローバルに処理すると、無関係な障害がプロバイダーの停止として報告される可能性があるため避けてください。それらを発生させうる操作の近くで処理するか、`500 Internal Server Error` になることを許容してください。

### トークンが拒否された理由を特定する {id="errors-logging"}

トークンの拒否に関する詳細は `TRACE` レベルでログ出力されます。これらを有効にするには、プラグインパッケージのロギングを設定します。Logback を使用している場合は、通常 <Path>src/main/resources/logback.xml</Path> にある <Path>logback.xml</Path> に以下を追加します。

```xml

<configuration>
    <logger name="io.ktor.server.auth.oidc" level="TRACE"/>
</configuration>
```

各プロバイダーは `io.ktor.server.auth.oidc.OidcProvider[<name>]` の下でログを出力するため、他のプロバイダーのノイズを避けながら単一のプロバイダーのログレベルだけを上げることができます。

ログメッセージにより、失敗した検証チェックが特定されます（例: `JWT algorithm HS256 is not accepted` や `JWT kid abc123 does not match any JWK`）。

### 401 レスポンスをカスタマイズする {id="errors-custom"}

`bearer {}` 設定には認証失敗ハンドラーが用意されていません。レスポンスをカスタマイズするには、保護されたルートで `onUnauthorized` ハンドラーを設定します。

```kotlin
routing {
    authenticateWith(
        auth0.jwtBearer,
        onUnauthorized = { cause ->
            call.respond(
                HttpStatusCode.Unauthorized,
                mapOf("error" to "invalid_token")
            )
        }
    ) {
        get("/orders") {
            call.respondText("ok")
        }
    }
}
```

ルートレベルのハンドラーは、`WWW-Authenticate` ヘッダーを含め、組み込みのレスポンスを完全に置き換えます。[保護されたリソースのメタデータ](#protected-resource) を設定していた場合、`resource_metadata` パラメーターも削除されます。クライアントがこれに依存している場合は、ヘッダーを明示的に追加してください。

複数の認証スキームを受け付けるルートには、`authenticateWithAnyOf(..., onUnauthorized = ...)` を使用します。

### クライアント ID を audience として再利用しない {id="audience-overlap"}

`bearer { audience }` に `oauth { }` ブロックの `clientId` が含まれている場合、プロバイダーが `token_use` または `typ` クレームで区別していない限り、ログイン用に発行された ID トークンが API のアクセストークンとして通ってしまう可能性があります。すべてのプロバイダーがこれを区別しているわけではありません。

API には独自のリソース識別子を割り当ててください。

```kotlin
oidc.identityProvider("auth0") {
    issuer = "https://my-tenant.auth0.com"
    bearer {
        // ログインクライアント ID ではなく、リソース識別子
        audience = setOf("https://api.example.com")
    }
    oauth {
        clientId = "web-client"
        clientSecret = System.getenv("WEB_CLIENT_SECRET")
    }
}
```

プラグインは起動時に、API の audience と OAuth クライアント ID の重複を検出すると警告をログに出力します。

> ディスカバリー、トークン検証設定、テストの詳細については、[OpenID Connect](server-oidc.md) を参照してください。
> 
> 同じプロバイダーを使用したブラウザサインインについては、[OpenID Connect ブラウザログイン](server-oidc-browser-login.md) を参照してください。
> 
{style="tip"}