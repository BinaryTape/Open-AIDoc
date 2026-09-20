[//]: # (title: OpenID Connect リソースサーバー)

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
OpenID Connect プロバイダーによって発行されたアクセストークンを、JWT としてローカルで、またはトークンイントロスペクションを介して検証します。
</link-summary>

リソースサーバーとは、第三者が発行したトークンを受け入れる API です。ログインページを提供したり、ブラウザセッションを使用したりすることはありません。クライアントがアクセストークンを送信し、サーバーは保護されたリソースへのアクセスを許可する前にそれを検証します。

> ブラウザでのサインインについては、[OpenID Connect ブラウザログイン](server-oidc-browser-login.md)を参照してください。
> 
> ディスカバリ、トークンタイプ、プラグインのセットアップについては、[OpenID Connect](server-oidc.md)を参照してください。
> 
{style="tip"}

<note>
    <p>
        OpenID Connect プラグインは実験的（experimental）であり、JVM でのみ利用可能で、
        <code>@OptIn(ExperimentalKtorApi::class)</code> が必要です。このプラグインは
        <Links href="/ktor/server-typed-auth" summary="The type-safe authentication scheme API binds the principal type to the route, so you can read a non-null principal without
casts or null checks.">型安全な認証 API</Links> を使用しており、これには Kotlin の context parameters が必要です。
    </p>
</note>

## JWT アクセストークンの検証 {id="jwt-bearer"}

多くのプロバイダーは、アクセストークンを署名付き JSON Web Token（JWT）として発行します。API が期待するオーディエンス（audience）を設定し、`provider.jwtBearer` でルートを保護します。

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

`audience` プロパティは必須であり、空にしてはいけません。これはプロバイダー側で API を識別するためのものであり、通常は OAuth クライアント ID とは異なります。

プラグインは `Authorization: Bearer` ヘッダーからトークンを読み取り、プロバイダーの JWKS エンドポイントから署名キーを取得して、署名、発行者（issuer）、オーディエンス（audience）、および有効期限をチェックします。

## オペークトークンの検証 {id="introspection"}

すべてのプロバイダーが JWT を発行するわけではありません。オペーク（opaque）トークンは読み取り可能なコンテンツを持たないランダムな文字列であるため、サーバーはそれをローカルで検証できません。これは意図的なトレードオフです。オペークトークンは傍受されても情報が漏洩せず、使用するたびにプロバイダーに問い合わせが行われるため、取り消し（revocation）を行えば即座に無効化できます。一方、JWT は有効期限が切れるまで有効なままになります。

オペークトークンを検証するために、サーバーは [RFC 7662](https://www.rfc-editor.org/rfc/rfc7662) で定義されている*トークンイントロスペクション（token introspection）*を使用します。サーバーはイントロスペクションエンドポイントにトークンを送信し、自身の認証を行い、トークンがアクティブであるかどうかや、サブジェクト、スコープ、クライアント、有効期限などの関連メタデータを示すレスポンスを受け取ります。

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

イントロスペクションエンドポイントは OpenID Connect のディスカバリドキュメントには含まれていないため、プロバイダーのドキュメントに従って明示的に設定してください。上記の例では、外部の `issuer` プロパティが `introspection { }` ブロック内から利用できないため、発行者 URL がローカル変数に格納されています。

`clientId` および `clientSecret` プロパティは、ユーザーではなく API 自身をプロバイダーに対して認証するためのものです。イントロスペクションは特権操作であるため、ほとんどのプロバイダーでは、その実行を許可された専用のクライアントが必要となります。

デフォルトでは、プラグインは HTTP Basic 認証を使用します。代わりにフォーム本文（form body）で認証情報を送信する場合は、`authMethod = ClientAuthenticationMethod.ClientSecretPost` を設定します。

トークンは、レスポンスに `active: true` が含まれ、そのオーディエンスが設定された `audience` と一致（積集合が存在）し、返された `iss`、`exp`、`nbf` の値がすべて有効である場合にのみ受け入れられます。

イントロスペクションは認証の試行ごとにネットワークリクエストを必要とし、プロバイダーの可用性に依存します。プロバイダーが JWT を発行する場合は [JWT 検証](#jwt-bearer) を優先し、そうでない場合やレイテンシよりも即座の失効が重要な場合にイントロスペクションを使用してください。

## 別の場所からトークンを読み取る {id="token-extractor"}

デフォルトでは、プラグインは `Authorization` ヘッダーからトークンを読み取ります。別の場所から読み取るには、カスタムの抽出関数（extractor）を設定します。

```kotlin
bearer {
    audience = setOf("https://api.example.com")
    tokenExtractor = { call.request.cookies["access_token"] }
}
```

トークンが存在しない場合は `null` を返します。その場合、リクエストは未認証として失敗します。

## 保護されたリソースのメタデータを公開する {id="protected-resource"}

[RFC 9728](https://www.rfc-editor.org/rfc/rfc9728) を使用すると、クライアントにあらかじめ認可サーバーを設定しておく代わりに、API が信頼している認可サーバーをクライアントが検出（ディスカバリ）できるようになります。これはマシンツーマシン（M2M）クライアントや MCP サーバーに役立ちます。

プラグインをインストールする際に、保護されたリソースのメタデータを設定します。

```kotlin
val oidc = install(Oidc) {
    protectedResource("https://api.example.com") {
        resourceName = "Orders API"
    }
}
```

これにより、`/.well-known/oauth-protected-resource` でドキュメントが配信されます。プラグインは、登録されているプロバイダーから以下の値を導出します。

* `authorizationServers` — `bearer { }` ブロックを持つすべてのプロバイダーの発行者（issuer）。
* `scopesSupported` — それらのプロバイダーが要求するスコープ。
* `bearerMethodsSupported` — プロバイダーが標準の認証ヘッダーを読み取る場合は `header`。

導出された値を上書きするには、これらのプロパティのいずれかを明示的に設定します。

保護されたリソースを設定すると、チャレンジも変更されます。拒否されたリクエストには、通常の `WWW-Authenticate: Bearer` ヘッダーの代わりに、メタデータドキュメントへのポインタが含まれます。

```http
WWW-Authenticate: Bearer resource_metadata="https://api.example.com/.well-known/oauth-protected-resource"
```

## 認証エラーの処理 {id="errors"}

### 認証エラーレスポンス {id="errors-response"}

拒否されたトークンは、`WWW-Authenticate: Bearer` ヘッダーを伴う `401 Unauthorized` を生成します。

チャレンジには `error`、`error_description`、`realm` パラメータは含まれません。その結果、クライアントはトークンの欠落と有効期限切れ、または署名不正とオーディエンスの不一致を区別できません。拒否されたトークンの診断詳細については、[トークンが拒否された理由を特定する](#errors-logging) を参照してください。

以下の条件で `401 Unauthorized` が生成されます。

| 原因 | 備考 |
|----------------------------------------------------|----------------------------------------------------|
| トークンがない、または `Authorization` ヘッダーの形式が不正 | |
| 署名が不正 | |
| 発行者またはオーディエンスが不正 | |
| 有効期限切れのトークン | `clockSkew` の許容時間後 |
| アルゴリズムが `none`、`HS256`、`HS384`、または `HS512` | 常に拒否 |
| `allowedAlgorithms` 以外のアルゴリズム | |
| 不明な `kid` | 取得された JWKS ドキュメントにキーが存在しない |
| イントロスペクションが `active: false` を返した | |
| イントロスペクションが不正または期限切れのオーディエンスを返した | |

不明な `kid` は、トークンが参照しているキーが取得した JWKS ドキュメント内に存在しないことを示しており、そのため `401 Unauthorized` となります。

### サーバー側の検証エラーを処理する {id="errors-500"}

一部の障害は、トークン自体が無効であると判断することなく、プラグインによるトークン検証の完了を妨げます。これらの障害は `500 Internal Server Error` となります。

| 障害内容 | 例外 |
|----------------------------------------------------|------------------------------------------------|
| JWKS エンドポイントに到達できない | `OidcSigningKeyUnavailableException` |
| JWKS ドキュメントを解析できない | `OidcSigningKeyUnavailableException` |
| JWKS リクエストのレート制限を超過した | `OidcSigningKeyUnavailableException` |
| イントロスペクションエンドポイントに到達できない、または 2xx 以外のステータスで応答した | `ResponseException`、`IOException`、またはデシリアライズエラー |
| `fetchUserInfo` リクエストがトランスポート層で失敗した | 同上 |
| セッショントークンのリフレッシュがトランスポート層で失敗した | 同上。[サインインエラーの処理](server-oidc-browser-login.md#errors) を参照 |

したがって、アイデンティティプロバイダーの障害により、認証済みリクエストが `500 Internal Server Error` で失敗する可能性があります。

JWK リクエストのレート制限はデフォルトで有効になっており、これが署名キーの検索失敗の原因となることもあります。キーの検索は 1 分あたり 10 リクエストに制限されており、キャッシュに存在しない kid の検索はこの制限にカウントされます。キーローテーション中などに、これまで見られなかったキーで署名されたトークンが急増すると、制限を使い果たす可能性があります。

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

`503 Service Unavailable` は、アイデンティティプロバイダーが回復した後にリクエストが成功する可能性があることを示します。

署名キーの障害のみが専用の例外タイプを持っており、このようにグローバルに捕捉する価値があるのはこれだけです。それ以外の障害は `ResponseException` または `IOException` として表面化しますが、これらは他の [HTTP クライアント](client-create-and-configure.md) 操作でも使用されます。無関係な障害がプロバイダーの停止として報告される可能性があるため、これらの例外タイプをグローバルに処理することは避けてください。それらを発生させる可能性のある操作の近くで処理するか、そのまま `500 Internal Server Error` になることを許容してください。

### トークンが拒否された理由を特定する {id="errors-logging"}

トークンの拒否に関する詳細は `TRACE` レベルでログに記録されます。それらを有効にするには、プラグインパッケージのロギングを設定します。Logback を使用している場合は、通常 <Path>src/main/resources/logback.xml</Path> にある <Path>logback.xml</Path> に以下を追加します。

```xml

<configuration>
    <logger name="io.ktor.server.auth.oidc" level="TRACE"/>
</configuration>
```

各プロバイダーは `io.ktor.server.auth.oidc.OidcProvider[<name>]` の下でログを記録するため、他のノイズを増やさずに単一のプロバイダーのレベルのみを引き上げることができます。

ログメッセージは、失敗した検証チェックを特定します（例: `JWT algorithm HS256 is not accepted` や `JWT kid abc123 does not match any JWK` など）。

### 401 レスポンスをカスタマイズする {id="errors-custom"}

`bearer {}` 設定には認証失敗ハンドラーが用意されていません。レスポンスをカスタマイズするには、保護されたルートに `onUnauthorized` ハンドラーを設定します。

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

ルートレベルのハンドラーは、`WWW-Authenticate` ヘッダーを含め、組み込みのレスポンスを完全に置き換えます。[保護されたリソースのメタデータ](#protected-resource) を設定している場合、`resource_metadata` パラメータも削除されます。クライアントがこのヘッダーに依存している場合は、明示的に追加してください。

複数の認証スキームを受け入れるルートには、`authenticateWithAnyOf(..., onUnauthorized = ...)` を使用します。

### クライアント ID をオーディエンスとして再利用しない {id="audience-overlap"}

`bearer { audience }` に `oauth { }` ブロックの `clientId` が含まれている場合、プロバイダーが `token_use` または `typ` クレームで区別していない限り、ログイン用に発行された ID トークンが API のアクセストークンとして通ってしまう可能性があります。すべてのプロバイダーがこの区別を行っているわけではありません。

API には固有のリソース識別子を割り当ててください。

```kotlin
oidc.identityProvider("auth0") {
    issuer = "https://my-tenant.auth0.com"
    bearer {
        // ログインクライアントIDではなく、リソース識別子を指定
        audience = setOf("https://api.example.com")
    }
    oauth {
        clientId = "web-client"
        clientSecret = System.getenv("WEB_CLIENT_SECRET")
    }
}
```

プラグインは、起動時に API のオーディエンスと OAuth クライアント ID の重複を検出すると、警告をログに出力します。

> ディスカバリ、トークン検証設定、テストの詳細については、[OpenID Connect](server-oidc.md) を参照してください。
> 
> 同じプロバイダーを使用したブラウザサインインについては、[OpenID Connect ブラウザログイン](server-oidc-browser-login.md) を参照してください。
> 
{style="tip"}