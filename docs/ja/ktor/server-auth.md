[//]: # (title: Ktor Serverにおける認証と認可)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="Authentication"/>
<var name="package_name" value="io.ktor.server.auth"/>
<var name="artifact_name" value="ktor-server-auth"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
</tldr>

<link-summary>
Authenticationプラグインは、Ktorにおける認証と認可を処理します。
</link-summary>

Ktorは、認証と認可を処理するために [Authentication](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-authentication/index.html) プラグインを提供しています。一般的な使用シナリオには、ユーザーのログイン、特定のリソースへのアクセスの許可、関係者間での情報の安全な送信が含まれます。また、`Authentication` を [セッション](server-sessions.md) と併用して、リクエスト間でユーザー情報を保持することもできます。

> クライアント側では、Ktorは認証と認可を処理するための [Authentication](client-auth.md) プラグインを提供しています。

## サポートされている認証タイプ {id="supported"}
Ktorは、以下の認証および認可スキームをサポートしています。

### HTTP認証 {id="http-auth"}
HTTPは、アクセス制御と認証のための [一般的なフレームワーク](https://developer.mozilla.org/ja/docs/Web/HTTP/Authentication) を提供しています。Ktorでは、以下のHTTP認証スキームを使用できます。
* [Basic](server-basic-auth.md) - `Base64` エンコードを使用してユーザー名とパスワードを提供します。HTTPSと組み合わせて使用しない場合は、一般的に推奨されません。
* [Digest](server-digest-auth.md) - ユーザー名とパスワードにハッシュ関数を適用することで、暗号化された形式でユーザーの資格情報を通信する認証方法です。
* [Bearer](server-bearer-auth.md) - ベアラートークンと呼ばれるセキュリティトークンを含む認証スキームです。
  Bearer認証スキームは [OAuth](server-oauth.md) や [JWT](server-jwt.md) の一部として使用されますが、ベアラートークンの認可にカスタムロジックを提供することもできます。
* [API Key](server-api-key-auth.md) - クライアントがヘッダーで秘密鍵を渡すシンプルな認証方法です。

### フォームベース認証 {id="form-auth"}
[フォームベース](server-form-based-auth.md)認証は、[Webフォーム](https://developer.mozilla.org/ja/docs/Learn/Forms)を使用して資格情報を収集し、ユーザーを認証します。

### JSON Web Tokens (JWT) {id="jwt"}
[JSON Web Token](server-jwt.md) は、関係者間で情報をJSONオブジェクトとして安全に送信するためのオープン標準です。認可にJSON Web Tokenを使用できます。ユーザーがログインすると、各リクエストにトークンが含まれ、そのトークンで許可されているリソースにユーザーがアクセスできるようになります。Ktorでは、`jwt` 認証を使用して、トークンの検証とその中に含まれるクレームの妥当性確認を行うことができます。

### LDAP {id="ldap"}
[LDAP](server-ldap.md) は、ディレクトリサービス認証に使用されるオープンでクロスプラットフォームなプロトコルです。Ktorは、指定されたLDAPサーバーに対してユーザー資格情報を認証するための [ldapAuthenticate](https://api.ktor.io/ktor-server-auth-ldap/io.ktor.server.auth.ldap/ldap-authenticate.html) 関数を提供しています。

### OAuth {id="oauth"}
[OAuth](server-oauth.md) は、APIへのアクセスを保護するためのオープン標準です。Ktorの `oauth` プロバイダーを使用すると、Google、Facebook、Twitterなどの外部プロバイダーを使用した認証を実装できます。

### OpenID Connect {id="oidc"}

[OpenID Connect](server-oidc.md) は、OAuth 2.0の上に構築されたIDレイヤーです。`Oidc` プラグインはプロバイダーのディスカバリードキュメントを読み取るため、エンドポイントや署名キーの代わりに発行者（issuer）URLを設定します。[API](server-oidc-resource-server.md) でアクセストークンを検証したり、PKCE、セッション、ログアウトを含む [ブラウザサインイン](server-oidc-browser-login.md) を実行したりできます。

このプラグインは実験的（experimental）であり、JVMでのみ利用可能です。

### セッション {id="sessions"}
[セッション](server-sessions.md) は、異なるHTTPリクエスト間でデータを永続化するためのメカニズムを提供します。一般的なユースケースには、ログインしたユーザーのID、ショッピングバスケットの内容の保存、またはクライアントでのユーザー設定の保持が含まれます。Ktorでは、既に関連付けられたセッションを持つユーザーを `session` プロバイダーを使用して認証できます。詳細については、[Ktor Serverでのセッション認証](server-session-auth.md) を参照してください。

### カスタム {id="custom"}

Ktorは、認証と認可の動作をカスタマイズするための2つの方法を提供しています。

* [カスタム認証プロバイダー](#custom-auth-provider) を使用する。
* [カスタムプラグイン](server-custom-plugins.md) を使用して認可ロジックを実装する。例えば、`AuthenticationChecked` [フック](server-custom-plugins.md#call-handling) を使用してアクセスを検証できます。詳細については、[custom-plugin-authorization](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/custom-plugin-authorization) の例を参照してください。

## 型安全な認証スキームAPI {id="type-safe"}

<primary-label ref="experimental"/>

Ktorは、スキームをプリンシパル型にバインドする [型安全な認証スキームAPI](server-typed-auth.md) も提供しています。
保護されたルート内では、`call.principal` はそのプリンシパル型となり、非 `null` であることが保証されるため、キャストやnullチェックは不要です。
このAPIは、オプトインの [ロールチェック](server-typed-auth.md#roles)、[匿名フォールバック](server-typed-auth.md#anonymous)、型付き [セッション](server-typed-session-auth.md)、および [OAuth 2.0フロー](server-oauth2-flows.md) もサポートしています。

> このAPIは、このトピックで説明されている名前付きプロバイダーによるアプローチの代替手段です。
> 両方のAPIを同じアプリケーション内で使用できます。詳細については、[型安全な認証](server-typed-auth.md) を参照してください。
>
{style="note"}

## 依存関係の追加 {id="add_dependencies"}

<p>
    <code>%plugin_name%</code> を使用するには、ビルドスクリプトに <code>%artifact_name%</code> アーティファクトを含める必要があります。
</p>
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

[JWT](server-jwt.md) や [LDAP](server-ldap.md) など、一部の認証プロバイダーには追加のアーティファクトが必要であることに注意してください。

## Authenticationのインストール {id="install"}

<p>
    <code>%plugin_name%</code> プラグインをアプリケーションに <a href="#install">インストール</a> するには、指定された <Links href="/ktor/server-modules" summary="Modules allow you to structure your application by grouping routes.">モジュール</Links> 内の <code>install</code> 関数に渡します。
    以下の例は、<code>%plugin_name%</code> のインストール方法を示しています。
</p>
<list>
    <li>
        <code>embeddedServer()</code> 関数の呼び出し内。
    </li>
    <li>
        <code>Application</code> クラスの拡張関数である明示的に定義された <code>module()</code> 内。
    </li>
</list>
<Tabs>
    <TabItem title="embeddedServer">
        <code-block lang="kotlin" code="            import io.ktor.server.engine.*&#10;            import io.ktor.server.netty.*&#10;            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;&#10;            fun main() {&#10;                embeddedServer(Netty, port = 8080) {&#10;                    install(%plugin_name%)&#10;                    // ...&#10;                }.start(wait = true)&#10;            }"/>
    </TabItem>
    <TabItem title="module">
        <code-block lang="kotlin" code="            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;            // ...&#10;            fun Application.module() {&#10;                install(%plugin_name%)&#10;                // ...&#10;            }"/>
    </TabItem>
</Tabs>

## Authenticationの設定 {id="configure"}
[Authenticationのインストール](#install) 後、次のように `Authentication` を設定して使用できます。

### ステップ1: 認証プロバイダーを選択する {id="choose-provider"}

[basic](server-basic-auth.md)、[digest](server-digest-auth.md)、または [form](server-form-based-auth.md) などの特定の認証プロバイダーを使用するには、`install` ブロック内で対応する関数を呼び出す必要があります。例えば、Basic認証を使用するには、[`.basic()`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/basic.html) 関数を呼び出します。

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
// ...
install(Authentication) {
    basic {
        // Configure basic authentication
    }
}
```

この関数内で、このプロバイダーに固有の設定を [行う](#configure-provider) ことができます。

> 組み込みのプロバイダーが要件に合わない場合は、[カスタム認証プロバイダー](#custom-auth-provider) を実装できます。
> 
{style="note"}

### ステップ2: プロバイダー名を指定する {id="provider-name"}

[特定のプロバイダーを使用するための関数](#choose-provider) では、オプションでプロバイダー名を指定できます。以下のコードサンプルは、[basic](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/basic.html) プロバイダーと [form](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/form.html) プロバイダーを、それぞれ `"auth-basic"` と `"auth-form"` という名前でインストールします。

```kotlin
install(Authentication) {
    basic("auth-basic") {
        // Configure basic authentication
    }
    form("auth-form") {
        // Configure form authentication
    }
    // ...
}
```
{disable-links="false"}

これらの名前は、後で異なるプロバイダーを使用して [異なるルートを認証](#authenticate-route) するために使用できます。
> プロバイダー名は一意である必要があり、名前のないプロバイダーは1つしか定義できないことに注意してください。
>
{style="note"}

### ステップ3: プロバイダーを設定する {id="configure-provider"}

各 [プロバイダータイプ](#choose-provider) には独自の設定があります。例えば、[`BasicAuthenticationProvider.Config`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-basic-authentication-provider/-config/index.html) クラスは、[`.basic()`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/basic.html) 関数にオプションを提供します。このクラスの主要な関数は [`validate()`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-basic-authentication-provider/-config/validate.html) で、ユーザー名とパスワードの検証を担当します。次のコード例は、その使用方法を示しています。

```kotlin
install(Authentication) {
    basic("auth-basic") {
        realm = "Access to the '/' path"
        validate { credentials ->
            val isValid = credentials.name == "jetbrains" &&
                credentials.password == "foobar"
            if (isValid) {
                UserIdPrincipal(credentials.name)
            } else {
                null
            }
        }
    }
}
```

`validate()` 関数の仕組みを理解するために、2つの用語を導入する必要があります。

* **プリンシパル (Principal)** は、認証可能なエンティティです。ユーザー、コンピューター、サービスなどが該当します。Ktorでは、認証プロバイダーごとに異なるプリンシパルを使用する場合があります。例えば、`basic`、`digest`、`form` プロバイダーは [`UserIdPrincipal`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-id-principal/index.html) を認証し、`jwt` プロバイダーは [`JWTPrincipal`](https://api.ktor.io/ktor-server-auth-jwt/io.ktor.server.auth.jwt/-j-w-t-principal/index.html) を検証します。
  > カスタムプリンシパルを作成することもできます。これは以下のような場合に役立ちます。
  > - 資格情報をカスタムプリンシパルにマッピングすることで、[ルートハンドラー](#get-principal) 内で認証されたプリンシパルに関する追加情報を持たせることができます。
  > - [セッション認証](server-session-auth.md) を使用する場合、プリンシパルはセッションデータを格納するデータクラスになることがあります。
* **クレデンシャル (Credential)** は、サーバーがプリンシパルを認証するためのプロパティのセットです。ユーザー名とパスワードのペア、APIキーなどが該当します。例えば、`basic` プロバイダーと `form` プロバイダーは、ユーザー名とパスワードを検証するために [`UserPasswordCredential`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-password-credential/index.html) を使用し、`jwt` は [`JWTCredential`](https://api.ktor.io/ktor-server-auth-jwt/io.ktor.server.auth.jwt/-j-w-t-credential/index.html) を検証します。

つまり、`validate()` 関数は指定されたクレデンシャルをチェックし、認証に成功した場合はプリンシパル `Any` を返し、失敗した場合は `null` を返します。

> 特定の条件に基づいて認証をスキップするには、[`skipWhen()`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-authentication-provider/-config/skip-when.html) を使用します。
> 例えば、[セッション](server-sessions.md) が既に存在する場合に `basic` 認証をスキップできます。
> ```kotlin
> basic {
>     skipWhen { call -> call.sessions.get<UserSession>() != null }
> }
> ```

### ステップ4: 特定のリソースを保護する {id="authenticate-route"}

最後のステップは、アプリケーション内の特定のリソースを保護することです。これを行うには、[`authenticate()`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/authenticate.html) 関数を使用します。この関数は、2つのオプションパラメータを受け取ります。

- ネストされたルートを認証するために使用される [プロバイダーの名前](#provider-name)。
  以下のコードスニペットでは、`auth-basic` という名前のプロバイダーを使用して、`/login` ルートと `/orders` ルートを保護しています。
   ```kotlin
   routing {
       authenticate("auth-basic") {
           get("/login") {
               // ...
           }    
           get("/orders") {
               // ...
           }    
       }
       get("/") {
           // ...
       }
   }
   ```
- ネストされた認証プロバイダーを解決するために使用される戦略。
  この戦略は、[`AuthenticationStrategy`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-authentication-strategy/index.html) 列挙値によって表されます。

  例えば、`AuthenticationStrategy.Required` 戦略で登録されたすべてのプロバイダーに対して、クライアントは認証データを提供する必要があります。
  以下のコードスニペットでは、[セッション認証](server-session-auth.md) に合格したユーザーのみが、Basic認証を使用して `/admin` ルートへのアクセスを試みることができます。
   ```kotlin
   routing {
       val required = AuthenticationStrategy.Required
       authenticate("auth-session", strategy = required) {
           get("/hello") {
               // ...
           }
           authenticate("auth-basic", strategy = required) {
               get("/admin") {
                   // ...
               }
           }
       }
   }
   ```

> 完全な例については、[auth-form-session-nested](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-form-session-nested) を参照してください。

### ステップ5: ルートハンドラー内でプリンシパルを取得する {id="get-principal"}

認証に成功すると、`call.principal()` 関数を使用してルートハンドラー内で認証されたプリンシパルを取得できます。この関数は、[設定された認証プロバイダー](#configure-provider) によって返される特定のプリンシパル型を受け入れます。次の例では、`call.principal()` を使用して `UserIdPrincipal` を取得し、認証されたユーザーの名前を取得しています。

```kotlin
routing {
    authenticate("auth-basic") {
        get("/") {
            val user = call.principal<UserIdPrincipal>()
            call.respondText("Hello, ${user?.name}!")
        }
    }
}
```

[セッション認証](server-session-auth.md) を使用する場合、プリンシパルはセッションデータを格納するデータクラスになることがあります。そのため、このデータクラスを `call.principal()` に渡す必要があります。

```kotlin
authenticate("auth-session") {
    get("/hello") {
        val userSession = call.principal<UserSession>()
    }
}
```

[ネストされた認証プロバイダー](#authenticate-route) の場合、[プロバイダー名](#provider-name) を `call.principal()` に渡すことで、目的のプロバイダーのプリンシパルを取得できます。

以下の例では、最上位のセッションプロバイダーのプリンシパルを取得するために `"auth-session"` 値が渡されています。

```kotlin
val required = AuthenticationStrategy.Required
authenticate("auth-session", strategy = required) {
    authenticate("auth-basic", strategy = required) {
        get("/admin") {
            val userSession =
                call.principal<UserSession>(
                    "auth-session"
                )
        }
    }
}
```

## カスタム認証プロバイダー {id="custom-auth-provider"}

組み込みのプロバイダーが要件に合わない場合は、[`provider()`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-authentication-config/provider.html) 関数を使用してカスタム認証ロジックを実装します。

```kotlin
provider("custom") {
  authenticate { context ->
    val headers = context.call.request.headers
    val exampleHeader = headers["Example-Header"]
    if (exampleHeader == null) {
      val message = "No example header found"
      val cause = AuthenticationFailedCause.Error(message)
      context.challenge(key = this, cause) { challenge, call ->
        call.respondText("Challenge")
        challenge.complete()
      }
    }
  }
}
```

上の例では、`provider("custom")` 関数が名前付き認証プロバイダーを登録しており、これは後で `authenticate("custom")` を使用してルートに適用できます。

プロバイダー内では、リクエストごとに `authenticate {}` ブロックが実行され、コンテキストオブジェクトを通じて認証プロセスを完全に制御できます。これには、現在のコール (`context.call`) へのアクセスや、ヘッダー、パラメータ、その他のリクエストデータの検査が含まれます。

[`DynamicProviderConfig`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-dynamic-provider-config/index.html) クラスによって提供されるオプションを使用して、追加のプロバイダー動作を設定できます。