[//]: # (title: OpenID Connect)

<show-structure for="chapter" depth="2"/>
<primary-label ref="experimental"/>

<var name="artifact_name" value="ktor-server-auth-oidc"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.auth.oidc"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">Nativeサーバー</Links>のサポート</b>: ✖️
</p>
</tldr>

<link-summary>
OpenID Connectプラグインを使用すると、プロバイダーのディスカバリードキュメントを利用して、issuer（発行者）URLからトークン検証とブラウザログインを設定できます。
</link-summary>

[OpenID Connect](https://openid.net/developers/how-connect-works/) (OIDC) は、OAuth 2.0 の上に構築されたアイデンティティレイヤーです。
OAuth 2.0 が委譲認可（delegated authorization）のフレームワークを提供するのに対し、OIDC はクライアントがエンドユーザーの身元を検証できるようにすることで認証を追加します。OIDC は ID トークンでアイデンティティ情報を提供します。

`Oidc` プラグインは、以下の典型的なシナリオをサポートしています:

* **API の保護。** 保護されたルートへのアクセスを許可する前に、OpenID Connect プロバイダーによって発行されたトークンを検証します。詳細については、[OpenID Connect リソースサーバー](server-oidc-resource-server.md)を参照してください。
* **ユーザーのサインイン。** 認証のためにユーザーを OpenID Connect プロバイダーにリダイレクトし、サインイン後のコールバックを処理します。詳細については、[OpenID Connect ブラウザログイン](server-oidc-browser-login.md)を参照してください。

どちらのシナリオも、プロバイダーの issuer URL から始まります。プラグインはプロバイダーのディスカバリードキュメントを読み取り、エンドポイント、署名鍵、サポートされているアルゴリズムを特定します。

<note>
    <p>
        OpenID Connect プラグインは実験的（experimental）機能であり、JVM 上でのみ利用可能で、
        <code>@OptIn(ExperimentalKtorApi::class)</code> が必要です。このプラグインは
        <Links href="server-typed-auth.md" summary="The type-safe authentication scheme API binds the principal type to the route, so you can read a non-null principal without
casts or null checks.">型安全な認証 API</Links> を使用しており、これには Kotlin のコンテキストパラメータが必要です。
    </p>
</note>

## 依存関係の追加 {id="add_dependencies"}

`Oidc` プラグインを使用するには、ビルドスクリプトに `%artifact_name%` アーティファクトを追加します:

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

> このアーティファクトは JVM でのみ利用可能です。
> 
{style="note"}

## アイデンティティプロバイダーの登録 {id="register"}

`Oidc` プラグインをインストールし、発行者（issuer）ごとにアイデンティティプロバイダーを登録します:

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

`identityProvider()` 関数は、呼び出し元に復帰する前にディスカバリードキュメントを取得するため、[suspend アプリケーションモジュール](server-modules.md#concurrent-modules)などのサスペンド関数内から呼び出す必要があります。

プロバイダー名は、生成されるルートパスや認証スキーム名で使用されます。小文字、数字、およびハイフンで区切られたセグメントを含める必要があります。たとえば、`google` や `my-idp` は有効な名前ですが、`Google` や `my_idp` は無効です。

各プロバイダー名と issuer は一意でなければなりません。同じ名前または issuer を複数回登録すると、`IllegalArgumentException` がスローされます。

`identityProvider()` 関数は `OidcProvider` を返します。これを使用してルートを保護します。構成に応じて、プロバイダーは `authenticateWith()` で使用できる最大 3 つの認証スキームを公開します:

| 構成内容                        | スキーム                       | 保護対象                              |
|--------------------------------|--------------------------------|---------------------------------------|
| `bearer { }`                   | `provider.jwtBearer`           | JWT アクセストークンを受信する API    |
| `bearer { introspection { } }` | `provider.introspectionBearer` | 不透明（opaque）アクセストークンを受信する API |
| `oauth { }`                    | `provider.session`             | ブラウザログインの背後にあるルート    |

構成されていないスキームを読み取ろうとすると、`IllegalStateException` がスローされます。例外メッセージには、そのスキームを有効にするために必要な構成ブロックが示されます。

> 詳細については、[OpenID Connect リソースサーバー](server-oidc-resource-server.md) および [OpenID Connect ブラウザログイン](server-oidc-browser-login.md) を参照してください。
> 
{style="tip"}

## ディスカバリーの仕組み {id="discovery"}

プラグインは `<issuer>/.well-known/openid-configuration` を取得し、そこからプロバイダーのエンドポイントと署名鍵を読み取ります。認可エンドポイント、トークンエンドポイント、または JWKS URL を手動で構成する必要はありません。

ディスカバリードキュメント内の `issuer` の値は、末尾のスラッシュを含め、設定した `issuer` と完全に一致している必要があります。この比較はセキュリティチェックであるため、プラグインはいずれの値も正規化しません。

最初のリクエストの後、プラグインは `discoveryRefreshInterval`（デフォルトは 15 分）で指定された間隔でドキュメントを再読み込みします。これにより、アプリケーションを再起動することなく、鍵のローテーションを反映できます:

```kotlin
val oidc = install(Oidc) {
    discoveryRefreshInterval = 15.minutes
    initialDiscoveryAttempts = 3
    initialDiscoveryRetryDelay = 5.seconds
}
```

定期的なディスカバリーのリフレッシュを無効にするには、`discoveryRefreshInterval` を `Duration.ZERO` に設定します。

## ディスカバリーの失敗を処理する {id="discovery-errors"}

ディスカバリーの失敗は、[アプリケーションの起動時](#discovery-errors-startup)と[アプリケーションの実行中](#discovery-errors-runtime)で異なる方法で処理されます。

### 起動時 {id="discovery-errors-startup"}

最初のディスカバリーリクエストが失敗した場合、`identityProvider()` は `OidcDiscoveryException` をスローします。この例外はモジュール関数から抜け出し、アプリケーションは起動しません。

デフォルトでは、プラグインはディスカバリーの試行を 1 回だけ行います。起動時にプロバイダーが一時的に利用できない可能性がある場合は、試行回数を増やしてください:

```kotlin
val oidc = install(Oidc) {
    initialDiscoveryAttempts = 5
    initialDiscoveryRetryDelay = 3.seconds
}
```

リトライはネットワークエラーおよび HTTP エラーに適用されます。issuer の不一致や、必要なエンドポイントが欠落しているディスカバリードキュメントなど、構成エラーには適用されません。これらのエラーは `IllegalArgumentException` で即座に失敗します。

### 実行中 {id="discovery-errors-runtime"}

定期的なリフレッシュが失敗した場合、プラグインは最後に取得したディスカバリードキュメントをそのまま使用し続けます。その後、`discoveryRefreshFailureDelay`（デフォルトは 1 分）の後にリトライし、成功するまでリトライを続けます。

リフレッシュの失敗はデフォルトではログに記録されません。これらを監視するには、`OidcMetadataRefreshFailed` イベントをサブスクライブします:

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

## 静的メタデータの構成 {id="static-metadata"}

プロバイダーのエンドポイントが事前に分かっている場合や、テスト用の静的構成が必要な場合は、`metadata` プロパティを使用します:

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

`metadata` を設定すると、最初のディスカバリーリクエストがスキップされ、そのプロバイダーに対する定期的なディスカバリーリフレッシュが無効になります。その場合、鍵のローテーション後も含め、メタデータを最新の状態に維持する責任はアプリケーション側にあります。

静的ドキュメント内の issuer は、依然として構成された `issuer` と一致している必要があります。また、JWKS エンドポイントへは依然として HTTP 経由でアクセスされます。テスト中にこのリクエストを回避するには、[外部プロバイダーなしでテストする](#testing)を参照してください。

## トークンの種類 {id="tokens"}

各認証[スキーム](#register)は特定のプリンシパルタイプを生成するため、ルートは常に自分が何を保持しているかを把握できます:

| スキーム                       | プリンシパル             | 出所                                    |
|--------------------------------|--------------------------|-----------------------------------------|
| `provider.session`             | `OidcToken.Id`           | ブラウザログイン                        |
| `provider.jwtBearer`           | `OidcToken.Access`       | ローカルで検証された JWT アクセストークン |
| `provider.introspectionBearer` | `OidcToken.Introspected` | プロバイダーによって確認されたアクセストークン |

`OidcToken.Id` および `OidcToken.Access` は、未加工の JWT クレーム用の `claims` と、`subject`、`name`、`email` などの正規化されたユーザーフィールド用の `userInfo` を公開します。`OidcToken.Introspected` は代わりに `introspection` を公開します。

## トークンをアプリケーションプリンシパルにマッピングする {id="map-principal"}

ルートは多くの場合、OIDC トークンではなくアプリケーション固有のプリンシパルを扱います。`.mapPrincipal()` 関数を使用して、アプリケーションの型を生成する新しい認証スキームを作成します:

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

`null` を返すとリクエストは拒否されます。この動作を利用して、対応するアプリケーションアカウントが既に存在しない場合に、有効なトークンであっても拒否することができます。

プリンシパルのマッピングは、OAuth コールバック中ではなく、スキームがルートを認証するときに実行されます。たとえば、サインインしたユーザーが後でデータベースから削除された場合、有効なアプリケーションセッションが維持されるのではなく、次のリクエストでそのユーザーは拒否されます。

## 設定ファイルから構成する {id="config-file"}

クライアントシークレットはソースコードではなく設定ファイルに保存します。たとえば、<Path>application.yaml</Path> ファイル内では次のようになります:

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

> 設定ファイルの取り扱いに関する詳細については、[ファイルでの構成](server-configuration-file.topic)を参照してください。
> 
{style="tip"}

その後、設定を `OidcEnvConfig` として読み取ることができます:

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

プラグインはこの構成を自動的には読み込みません。`OidcEnvConfig` は値を読み取るための便利な型です。値がどこから取得され、どのように適用されるかはアプリケーションによって決定されます。

## トークン検証の構成 {id="jwt-config"}

トークンの検証方法を構成するには `jwt {}` ブロックを使用します。デフォルト値は安全に設定されているため、必要な場合にのみ変更してください:

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

* `clockSkew` は、`exp` および `nbf` に適用される許容誤差（ゆらぎ）を指定します。デフォルトは 60 秒です。
* `allowedAlgorithms` は、受け入れられる署名アルゴリズムを制限します。このオプションが設定されていない場合、ID トークンはディスカバリードキュメントが提示するアルゴリズムへとフォールバックします。RSA および EC アルゴリズムのみを指定できます。
* `jwkCache` と `jwkRateLimit` は、JWKS エンドポイントに問い合わせる頻度を制御します。レート制限はデフォルトで 1 分あたり 10 リクエストで有効になっています。制限を超えた場合、トークンを拒否するのではなく、リクエストは `OidcSigningKeyUnavailableException` で失敗します。予想されるキャッシュミスのピークトラフィックに対応できるように制限を設定してください。詳細については、[サーバー側の検証失敗を処理する](server-oidc-resource-server.md#errors-500)を参照してください。

`none` アルゴリズムおよびすべての HMAC アルゴリズム（`HS256`、`HS384`、`HS512`）は、構成に関係なく常に拒否されます。サードパーティによって発行されたトークンを検証する手段として、共有シークレットは安全ではありません。

`jwkProviderFactory` を `jwkCache` または `jwkRateLimit` と組み合わせることはできません。カスタム JWK プロバイダーファクトリを提供する場合、キャッシュの管理はアプリケーションの責任となります。

## 外部プロバイダーなしでテストする {id="testing"}

`OpenIdTestKeys` はインメモリのキーペアを生成し、そのキーで署名されたトークンを発行します。これを静的メタデータと組み合わせることで、実際の issuer、audience、アルゴリズム、および署名チェックを実行しながら、ネットワーク呼び出しを一切行わない完全な OIDC セットアップを実現できます:

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

`jwt(keys)` 関数は、検証ツールがインメモリの公開鍵を使用するように構成し、許可されるアルゴリズムを制限するため、JWKS リクエストは行われません。

アクセストークンの作成には `keys.accessToken { }` を、ID トークンには `keys.idToken(subject) { }` を使用します。どちらも `issuer`、`audience`、`expiresAt`、およびカスタムの `claim()` 値を受け入れます。

EC 署名をテストするには、`rsa()` 関数の代わりに `OpenIdTestKeys.ec()` 関数を使用します。

## 本番環境向けのセキュリティ設定を確認する {id="production"}

プラグインは以下のセキュリティデフォルトを適用します:

* すべてのログインで PKCE が有効化され、`S256` が使用されます。
* 認可状態（authorization state）は、有効期間 10 分の AES-256-GCM 暗号化 Cookie に保存されます。
* セッション Cookie は `HttpOnly` かつ `SameSite=Lax` であり、開発モード以外では `Secure` です。
* プラグインによって生成されたルートに対して CSRF 保護が有効になります。
* すべての ID トークンで `nonce` と `at_hash` がチェックされます。

本番環境にデプロイする前に、以下の設定を確認してください:

| 設定                           | デフォルト                   | 変更すべき理由                                                                                  |
|--------------------------------|------------------------------|-------------------------------------------------------------------------------------------------|
| `oauth { stateEncryptionKey }` | プロセスごとに新しいランダム鍵 | 再起動時に進行中のログインが中断され、複数インスタンス間で失敗する                              |
| `sessions { storage }`         | `SessionStorageMemory()`     | 再起動時にセッションが失われ、インスタンス間で共有されない                                      |
| `bearer { audience }`          | —                            | OAuth の `clientId` を含めてはなりません。[クライアント ID を audience として再利用しない](server-oidc-resource-server.md#audience-overlap) を参照してください |
| `initialDiscoveryAttempts`     | `1`                          | プロバイダーからの応答が 1 回遅延しただけで、アプリケーションの起動が妨げられる可能性がある      |
| `jwt { clockSkew }`            | `60.seconds`                 | クロックが厳密に同期している場合は値を小さくする                                                |
| `discoveryRefreshInterval`     | `15.minutes`                 | プロバイダーが頻繁に鍵をローテーションする場合は間隔を短くする                                  |
| `codeChallengeMethod`          | `S256`                       | PKCE を有効のまま維持する                                                                       |
| `sessions { csrfProtection }`  | `originMatchesHost()`        | CSRF 保護を有効のまま維持する                                                                   |

プラグインは、最初の 3 つの設定がこれらのデフォルト値を使用している場合、起動時に警告をログに出力します。本番環境では、これらの警告をエラーとして扱うことを検討してください。

## 実装されている仕様 {id="specs"}

このプラグインは、認可コードフローとその機能で使用される関連仕様を実装しています:

* [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html) — `nonce`、`azp`、`at_hash` を含む ID トークンの検証
* [OpenID Connect Discovery 1.0](https://openid.net/specs/openid-connect-discovery-1_0.html) — [ディスカバリーの仕組み](#discovery)
* [RP-Initiated Logout 1.0](https://openid.net/specs/openid-connect-rpinitiated-1_0.html) —
  [ユーザーのサインアウト](server-oidc-browser-login.md#logout)
* [RFC 6749](https://www.rfc-editor.org/rfc/rfc6749) §4.1 — 認可コードフロー
* [RFC 6750](https://www.rfc-editor.org/rfc/rfc6750) — Bearer トークンと `WWW-Authenticate` チャレンジ
* [RFC 7636](https://www.rfc-editor.org/rfc/rfc7636) — [PKCE](server-oidc-browser-login.md#pkce)
* [RFC 7662](https://www.rfc-editor.org/rfc/rfc7662) —
  [トークンイントロスペクション](server-oidc-resource-server.md#introspection)
* [RFC 8707](https://www.rfc-editor.org/rfc/rfc8707) —
  [リソースインジケーター](server-oidc-browser-login.md#resource-indicators)
* [RFC 9207](https://www.rfc-editor.org/rfc/rfc9207) — `iss` 認可レスポンスパラメータ
* [RFC 9728](https://www.rfc-editor.org/rfc/rfc9728) —
  [保護対象リソースメタデータ](server-oidc-resource-server.md#protected-resource)

## 制限事項 {id="limitations"}

* プラグインは JVM でのみ利用可能です。
* API は実験的（experimental）であり、変更される可能性があります。
* 認可コードフローのみがサポートされています。インプリシット（implicit）フローおよびハイブリッドフローはサポートされていません。
* PKCE は `S256` に固定されています。カスタムのチャレンジ方法は拒否されます。
* 暗号化された（JWE）UserInfo レスポンスはサポートされていません。
* ID トークンを返さないログインコールバックはサポートされていません。OIDC を実装していないプロバイダーに対するアクセストークンのみのログインには、[`oauth`](server-oauth.md) プロバイダーを使用してください。
* イントロスペクションエンドポイントはディスカバリーから読み取られません。明示的に構成する必要があります。