[//]: # (title: OpenID Connect)

<show-structure for="chapter" depth="2"/>
<primary-label ref="experimental"/>

<var name="artifact_name" value="ktor-server-auth-oidc"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor は Kotlin/Native をサポートしており、追加のランタイムや仮想マシンなしでサーバーを実行できます。">Native サーバー</Links>のサポート</b>: ✖️
</p>
</tldr>

<link-summary>
OpenID Connect プラグインを使用すると、プロバイダーのディスカバリードキュメントを利用して、発行者 URL（issuer URL）からトークン検証やブラウザーログインを設定できます。
</link-summary>

[OpenID Connect](https://openid.net/developers/how-connect-works/)（OIDC）は、OAuth 2.0 の上位に位置するアイデンティティレイヤーです。
OAuth 2.0 が委譲された認可のためのフレームワークを提供するのに対し、OIDC はクライアントがエンドユーザーの身元（アイデンティティ）を検証できるようにすることで認証機能を追加します。身元情報は ID トークンで提供されます。

`Oidc` プラグインは、以下の典型的なシナリオをサポートしています。

* **API の保護。** 保護されたルートへのアクセスを許可する前に、OpenID Connect プロバイダーによって発行されたトークンを検証します。詳細については、[OpenID Connect リソースサーバー](server-oidc-resource-server.md)を参照してください。
* **ユーザーのサインイン。** 認証のためにユーザーを OpenID Connect プロバイダーにリダイレクトし、サインイン後のコールバックを処理します。詳細については、[OpenID Connect ブラウザーログイン](server-oidc-browser-login.md)を参照してください。

どちらのシナリオも、プロバイダーの発行者 URL から始まります。プラグインはプロバイダーのディスカバリードキュメントを読み取り、エンドポイント、署名鍵、およびサポートされているアルゴリズムを特定します。

<note>
    <p>
        OpenID Connect プラグインは実験的（experimental）であり、JVM でのみ利用可能です。また、
        <code>@OptIn(ExperimentalKtorApi::class)</code> が必要です。このプラグインは
        <Links href="/ktor/server-typed-auth" summary="タイプセーフな認証スキーム API はプリンシパル型をルートにバインドするため、キャストや null チェックを行うことなく非 null のプリンシパルを読み取ることができます。">タイプセーフ認証 API</Links> を使用しており、これには Kotlin のコンテキストパラメーターが必要です。
    </p>
</note>

## 依存関係の追加 {id="add_dependencies"}

`Oidc` プラグインを使用するには、ビルドスクリプトに `%artifact_name%` アーティファクトを追加します。

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"/>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"/>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

> このアーティファクトは JVM でのみ利用可能です。
> 
{style="note"}

## アイデンティティプロバイダーの登録 {id="register"}

`Oidc` プラグインをインストールし、発行者ごとにアイデンティティプロバイダーを登録します。

```kotlin
suspend fun Application.module() {
    val oidc = install(Oidc)

    val google = oidc.identityProvider("google") {
        issuer = "https://accounts.google.com"
        bearer {
            audience = setOf("my-api")
        }
    }
}
```

`identityProvider()` 関数はディスカバリードキュメントを取得してから復帰するため、[サスペンドアプリケーションモジュール](server-modules.md#concurrent-modules)などのサスペンド関数内から呼び出す必要があります。

プロバイダー名は、生成されるルートパスや認証スキーム名で使用されます。プロバイダー名には小文字、数字、およびハイフンで区切られたセグメントを含める必要があります。たとえば、`google` や `my-idp` は有効な名前ですが、`Google` や `my_idp` は無効です。

各プロバイダー名と発行者は一意である必要があります。同じ名前または発行者を複数回登録すると、`IllegalArgumentException` がスローされます。

`identityProvider()` 関数は `OidcProvider` を返します。これを使用してルートを保護します。設定内容に応じて、プロバイダーは `authenticateWith()` で使用できる最大 3 つの認証スキームを公開します。

| 設定ブロック | スキーム | 保護対象 |
|--------------------------------|--------------------------------|---------------------------------------|
| `bearer { }`                   | `provider.jwtBearer`           | JWT アクセストークンを受信する API |
| `bearer { introspection { } }` | `provider.introspectionBearer` | 不透明な（opaque）アクセストークンを受信する API |
| `oauth { }`                    | `provider.session`             | ブラウザーログイン配下のルート |

設定されていないスキームを読み取ろうとすると、`IllegalStateException` がスローされます。例外メッセージには、スキームを有効にするために必要な設定ブロックが示されます。

> 詳細については、[OpenID Connect リソースサーバー](server-oidc-resource-server.md)および [OpenID Connect ブラウザーログイン](server-oidc-browser-login.md)を参照してください。
> 
{style="tip"}

## ディスカバリーの仕組み {id="discovery"}

プラグインは `<issuer>/.well-known/openid-configuration` を取得し、そこからプロバイダーのエンドポイントと署名鍵を読み取ります。認可エンドポイント、トークンエンドポイント、または JWKS URL を手動で設定する必要はありません。

ディスカバリードキュメント内の `issuer` の値は、末尾のスラッシュも含めて、設定された `issuer` と完全に一致している必要があります。この比較はセキュリティチェックであるため、プラグインはどちらの値も正規化しません。

最初のリクエストの後、プラグインは `discoveryRefreshInterval`（デフォルトは 15 分）で指定された間隔でドキュメントを再読み込みします。これにより、アプリケーションを再起動することなくキーローテーションを反映できます。

```kotlin
val oidc = install(Oidc) {
    discoveryRefreshInterval = 15.minutes
    initialDiscoveryAttempts = 3
    initialDiscoveryRetryDelay = 5.seconds
}
```

定期的なディスカバリー更新を無効にするには、`discoveryRefreshInterval` を `Duration.ZERO` に設定します。

## ディスカバリーの失敗を処理する {id="discovery-errors"}

ディスカバリーの失敗の処理方法は、[アプリケーションの起動時](#discovery-errors-startup)と[アプリケーションの実行中](#discovery-errors-runtime)で異なります。

### 起動時 {id="discovery-errors-startup"}

最初のディスカバリーリクエストが失敗した場合、`identityProvider()` は `OidcDiscoveryException` をスローします。例外はモジュール関数から脱出し、アプリケーションは起動しません。

デフォルトでは、プラグインはディスカバリーの試行を 1 回行います。起動時にプロバイダーが一時的に利用できない可能性がある場合は、試行回数を増やしてください。

```kotlin
val oidc = install(Oidc) {
    initialDiscoveryAttempts = 5
    initialDiscoveryRetryDelay = 3.seconds
}
```

リトライはネットワークエラーおよび HTTP エラーに適用されます。発行者の不一致や、必要なエンドポイントが不足しているディスカバリードキュメントなどの設定エラーには適用されません。これらのエラーは `IllegalArgumentException` で即座に失敗します。

### 実行中 {id="discovery-errors-runtime"}

定期的な更新が失敗した場合、プラグインは直近に取得されたディスカバリードキュメントを引き続き使用します。`discoveryRefreshFailureDelay`（デフォルトは 1 分）の後にリトライし、成功するまでリトライを続けます。

更新の失敗はデフォルトではログに記録されません。これらを監視するには、`OidcMetadataRefreshFailed` イベントをサブスクライブします。

```kotlin
monitor.subscribe(OidcMetadataRefreshFailed) { failure ->
    log.warn(
        "OIDC refresh failed for {} ({} in a row)",
        failure.provider.name,
        failure.consecutiveFailures,
        failure.cause
    )
}
```

## 静的メタデータの設定 {id="static-metadata"}

プロバイダーのエンドポイントが事前に分かっている場合や、テスト用に静的な設定が必要な場合は、`metadata` プロパティを使用します。

```kotlin
val provider = oidc.identityProvider("static") {
    issuer = issuerUrl
    metadata = OpenIdProviderMetadata(
        issuer = issuerUrl,
        authorizationEndpoint = "$issuerUrl/authorize",
        tokenEndpoint = "$issuerUrl/token",
        jwksUri = "$issuerUrl/jwks",
    )
}
```

`metadata` を設定すると、最初のディスカバリーリクエストがスキップされ、そのプロバイダーの定期的なディスカバリー更新が無効になります。この場合、キーローテーション後も含め、メタデータを最新の状態に保つ責任はアプリケーション側にあります。

静的ドキュメント内の発行者は、設定された `issuer` と一致している必要があります。JWKS エンドポイントへは依然として HTTP 経由でアクセスされます。テスト中にそのリクエストを回避するには、[外部プロバイダーなしでのテスト](#testing)を参照してください。

## トークンの種類 {id="tokens"}

各認証[スキーム](#register)は特定のプリンシパル型を生成するため、ルートは自身が何を保持しているかを常に把握できます。

| スキーム | プリンシパル | ソース |
|--------------------------------|--------------------------|-----------------------------------------|
| `provider.session`             | `OidcToken.Id`           | ブラウザーログイン |
| `provider.jwtBearer`           | `OidcToken.Access`       | ローカルで検証された JWT アクセストークン |
| `provider.introspectionBearer` | `OidcToken.Introspected` | プロバイダーによって確認されたアクセストークン |

`OidcToken.Id` と `OidcToken.Access` は、生の JWT クレーム用の `claims` と、`subject`、`name`、`email` などの正規化されたユーザーフィールド用の `userInfo` を公開します。`OidcToken.Introspected` は代わりに `introspection` を公開します。

## トークンをアプリケーションプリンシパルにマッピングする {id="map-principal"}

ルートは多くの場合、OIDC トークンではなくアプリケーション固有のプリンシパルを扱います。`.mapPrincipal()` 関数を使用して、独自のアプリケーション型を生成する新しい認証スキームを作成します。

```kotlin
data class AppUser(val id: String, val email: String?)

val apiAuth = google.jwtBearer.mapPrincipal { token ->
    val id = token.claims.subject ?: return@mapPrincipal null
    AppUser(id, token.userInfo?.email)
}

routing {
    authenticateWith(apiAuth) {
        get("/me") {
            call.respond(call.principal.id)
        }
    }
}
```

`null` を返すとリクエストは拒否されます。この動作を利用して、トークン自体は有効でも対応するアプリケーションアカウントが既に存在しない場合にリクエストを拒否できます。

プリンシパルのマッピングは、OAuth コールバック中ではなく、スキームがルートを認証するときに実行されます。たとえば、サインイン済みのユーザーが後からデータベースから削除された場合、有効なアプリケーションセッションを保持し続けるのではなく、次のリクエスト時に拒否されます。

## 設定ファイルからの設定 {id="config-file"}

クライアントシークレットはソースコードではなく設定ファイルに保存します。たとえば、<Path>application.yaml</Path> ファイル内では以下のように記述します。

```yaml
ktor:
  oidc:
    google:
      issuer: "https://accounts.google.com"
      clientId: "$GOOGLE_CLIENT_ID"
      clientSecret: "$GOOGLE_CLIENT_SECRET"
      scopes: ["openid", "profile", "email"]
```

`$GOOGLE_CLIENT_ID` と `$GOOGLE_CLIENT_SECRET` は環境変数を参照します。

> 設定ファイルの取り扱いに関する詳細については、[ファイルでの設定](server-configuration-file.topic)を参照してください。
> 
{style="tip"}

その後、設定を `OidcEnvConfig` として読み取ることができます。

```kotlin
val env = environment.config
    .property("ktor.oidc.google")
    .getAs<OidcEnvConfig>()

val google = oidc.identityProvider("google") {
    issuer = env.issuer
    oauth {
        clientId = env.clientId
        clientSecret = env.clientSecret
        scopes = env.scopes
    }
}
```

プラグインはこの設定を自動的には読み込みません。`OidcEnvConfig` は値を読み取るための便利な型です。値がどこから取得され、どのように適用されるかはアプリケーションによって決定されます。

## トークン検証の設定 {id="jwt-config"}

`jwt {}` ブロックを使用して、トークンの検証方法を設定します。デフォルトで安全な設定になっているため、必要な場合にのみ変更してください。

```kotlin
oidc.identityProvider("google") {
    issuer = "https://accounts.google.com"
    jwt {
        clockSkew = 30.seconds
        allowedAlgorithms = setOf(
            SignatureAlgorithm.RSA_SHA_256
        )
        jwkCache(maxEntries = 10, duration = 1.hours)
        jwkRateLimit(bucketSize = 10)
    }
}
```

* `clockSkew` は、`exp` および `nbf` に適用される許容時間（leeway）を指定します。デフォルトは 60 秒です。
* `allowedAlgorithms` は、受け入れられる署名アルゴリズムを制限します。このオプションが設定されていない場合、ID トークンはディスカバリードキュメントが提示するアルゴリズムへとフォールバックします。指定できるのは RSA および EC アルゴリズムのみです。
* `jwkCache` と `jwkRateLimit` は、JWKS エンドポイントに問い合わせる頻度を制御します。レート制限はデフォルトで有効になっており、毎分 10 リクエストに設定されています。制限を超えた場合、トークンを拒否するのではなく、リクエストは `OidcSigningKeyUnavailableException` で失敗します。予想されるピーク時のキャッシュミス負荷に対応できるように制限を設定してください。詳細については、[サーバー側の検証失敗の処理](server-oidc-resource-server.md#errors-500)を参照してください。

設定にかかわらず、`none` アルゴリズムおよびすべての HMAC アルゴリズム（`HS256`、`HS384`、`HS512`）は常に拒否されます。共有シークレットは、サードパーティによって発行されたトークンを検証するための安全な方法ではありません。

`jwkProviderFactory` は、`jwkCache` または `jwkRateLimit` と組み合わせることはできません。カスタムの JWK プロバイダーファクトリを提供する場合は、アプリケーションがキャッシュを管理する責任を負います。

## 外部プロバイダーなしでのテスト {id="testing"}

`OpenIdTestKeys` はインメモリのキーペアを生成し、そのキーで署名されたトークンを発行します。これを静的メタデータと組み合わせることで、実際のネットワーク呼び出しを行うことなく、本物の発行者、オーディエンス、アルゴリズム、署名チェックを実行する完全な OIDC セットアップを構築できます。

```kotlin
@Test
fun `rejects a token for another audience`() = testApplication {
    val issuerUrl = "https://test-issuer"
    val keys = OpenIdTestKeys.rsa(
        issuer = issuerUrl,
        audience = "my-api"
    )

    application {
        val oidc = install(Oidc)
        val provider = oidc.identityProvider("test") {
            issuer = issuerUrl
            metadata = OpenIdProviderMetadata(
                issuer = issuerUrl,
                authorizationEndpoint = "$issuerUrl/authorize",
                tokenEndpoint = "$issuerUrl/token",
                jwksUri = "$issuerUrl/jwks",
            )
            jwt(keys)
            bearer { audience = setOf("my-api") }
        }

        routing {
            authenticateWith(provider.jwtBearer) {
                get("/protected") {
                    call.respondText(call.principal.value)
                }
            }
        }
    }

    val token = keys.accessToken {
        subject = "user-1"
        audience = "some-other-api"
    }

    val response = client.get("/protected") {
        bearerAuth(token)
    }

    assertEquals(HttpStatusCode.Unauthorized, response.status)
}
```

`jwt(keys)` 関数は、インメモリの公開鍵を使用するように検証ツールを設定し、許可されるアルゴリズムを制限するため、JWKS リクエストは行われません。

アクセストークンを作成するには `keys.accessToken { }` を、ID トークンを作成するには `keys.idToken(subject) { }` を使用します。どちらも `issuer`、`audience`、`expiresAt`、およびカスタムの `claim()` 値を受け入れます。

EC 署名をテストするには、`rsa()` 関数の代わりに `OpenIdTestKeys.ec()` 関数を使用します。

## 本番環境向けセキュリティ設定の確認 {id="production"}

このプラグインは、以下のデフォルトのセキュリティ設定を適用します。

* PKCE はすべてのログインで有効になっており、`S256` を使用します。
* 認可状態（authorization state）は、有効期限 10 分の AES-256-GCM 暗号化 Cookie に保存されます。
* セッション Cookie は `HttpOnly` かつ `SameSite=Lax` であり、開発モード以外では `Secure` です。
* プラグインによって生成されたルートに対して CSRF 保護が有効になっています。
* すべての ID トークンで `nonce` と `at_hash` がチェックされます。

本番環境にデプロイする前に、以下の設定を確認してください。

| 設定項目 | デフォルト値 | 変更すべき理由 |
|--------------------------------|------------------------------|-------------------------------------------------------------------------------------------------|
| `oauth { stateEncryptionKey }` | プロセスごとに新しいランダムキー | 再起動時に進行中のログインが中断され、複数インスタンス間で失敗します |
| `sessions { storage }`         | `SessionStorageMemory()`     | セッションは再起動時に失われ、複数インスタンス間で共有されません |
| `bearer { audience }`          | —                            | OAuth の `clientId` を含めてはなりません。[クライアント ID をオーディエンスとして再利用しない](server-oidc-resource-server.md#audience-overlap)を参照してください |
| `initialDiscoveryAttempts`     | `1`                          | プロバイダーからの 1 回の遅い応答でアプリケーションが起動できなくなる可能性があります |
| `jwt { clockSkew }`            | `60.seconds`                 | クロックが厳密に同期している場合は値を小さくします |
| `discoveryRefreshInterval`     | `15.minutes`                 | プロバイダーが頻繁にキーをローテーションする場合は間隔を短くします |
| `codeChallengeMethod`          | `S256`                       | PKCE を有効のまま維持します |
| `sessions { csrfProtection }`  | `originMatchesHost()`        | CSRF 保護を有効のまま維持します |

プラグインは、起動時に最初の 3 つの設定がこれらのデフォルト値を使用している場合、警告をログに出力します。本番環境では、これらの警告をエラーとして扱うことを検討してください。

## 実装されている仕様 {id="specs"}

このプラグインは認可コードフローと、その機能で使用される関連仕様を実装しています。

* [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html) — `nonce`、`azp`、`at_hash` を含む ID トークンの検証
* [OpenID Connect Discovery 1.0](https://openid.net/specs/openid-connect-discovery-1_0.html) — [ディスカバリーの仕組み](#discovery)
* [RP-Initiated Logout 1.0](https://openid.net/specs/openid-connect-rpinitiated-1_0.html) —
  [ユーザーのサインアウト](server-oidc-browser-login.md#logout)
* [RFC 6749](https://www.rfc-editor.org/rfc/rfc6749) §4.1 — 認可コードフロー
* [RFC 6750](https://www.rfc-editor.org/rfc/rfc6750) — ベアラートークンと `WWW-Authenticate` チャレンジ
* [RFC 7636](https://www.rfc-editor.org/rfc/rfc7636) — [PKCE](server-oidc-browser-login.md#pkce)
* [RFC 7662](https://www.rfc-editor.org/rfc/rfc7662) —
  [トークンイントロスペクション](server-oidc-resource-server.md#introspection)
* [RFC 8707](https://www.rfc-editor.org/rfc/rfc8707) —
  [リソースインジケーター](server-oidc-browser-login.md#resource-indicators)
* [RFC 9207](https://www.rfc-editor.org/rfc/rfc9207) — `iss` 認可レスポンスパラメーター
* [RFC 9728](https://www.rfc-editor.org/rfc/rfc9728) —
  [保護対象リソースのメタデータ](server-oidc-resource-server.md#protected-resource)

## 制限事項 {id="limitations"}

* このプラグインは JVM でのみ利用可能です。
* API は実験的であり、変更される可能性があります。
* 認可コードフローのみがサポートされています。インプリシット（implicit）フローおよびハイブリッドフローはサポートされていません。
* PKCE は `S256` に固定されています。カスタムのチャレンジメソッドは拒否されます。
* 暗号化された（JWE）UserInfo レスポンスはサポートされていません。
* ID トークンを返さないログインコールバックはサポートされていません。OIDC を実装していないプロバイダーに対するアクセストークンのみのログインには、[`oauth`](server-oauth.md) プロバイダーを使用してください。
* イントロスペクションエンドポイントはディスカバリーから読み取られません。明示的に設定する必要があります。