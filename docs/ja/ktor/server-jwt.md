[//]: # (title: JSON Web Tokens)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="Authentication JWT"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:ktor-server-auth</code>, <code>io.ktor:ktor-server-auth-jwt</code>
</p>
<p>
<b>コード例</b>: 
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-jwt-hs256">auth-jwt-hs256</a>, 
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-jwt-rs256">auth-jwt-rs256</a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">Native サーバー</Links>のサポート</b>: ✖️
</p>
</tldr>

<link-summary>
%plugin_name% プラグインを使用すると、JSON Web Token を使用してクライアントを認証できます。
</link-summary>

[JSON Web Token (JWT)](https://jwt.io/) は、当事者間で情報を JSON オブジェクトとして安全に送信する方法を定義したオープン標準です。この情報は、共有シークレット（`HS256` アルゴリズムなど）または公開鍵/秘密鍵のペア（`RS256` など）を使用して署名されているため、検証および信頼することができます。

Ktor は、`Bearer` スキームを使用して `Authorization` ヘッダーで渡された JWT を処理し、以下の操作を実行できます。
* JSON Web Token の署名を検証する
* JWT ペイロードに対して追加の検証を実行する

> Ktor における認証と認可の一般的な情報については、[Ktor Server での認証と認可](server-auth.md)セクションを参照してください。

> トークンが OpenID Connect プロバイダーからのものである場合、`Oidc` プラグインは発行者 URL から JWKS エンドポイントを解決し、キーのローテーション時に更新するため、`JwkProvider` を手動で構成する必要はありません。また、アクセストークンとして提示された ID トークンを拒否します。[OpenID Connect リソースサーバー](server-oidc-resource-server.md)を参照してください。
>
{style="tip"}

## 依存関係の追加 {id="add_dependencies"}
`JWT` 認証を有効にするには、ビルドスクリプトに `ktor-server-auth` および `ktor-server-auth-jwt` アーティファクトを含める必要があります。

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" title="Sample" code="            implementation(&quot;io.ktor:ktor-server-auth:$ktor_version&quot;)&#10;            implementation(&quot;io.ktor:ktor-server-auth-jwt:$ktor_version&quot;)"/>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" title="Sample" code="            implementation &quot;io.ktor:ktor-server-auth:$ktor_version&quot;&#10;            implementation &quot;io.ktor:ktor-server-auth-jwt:$ktor_version&quot;"/>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" title="Sample" code="&amp;lt;dependency&amp;gt;&#10;&amp;lt;groupId&amp;gt;io.ktor&amp;lt;/groupId&amp;gt;&#10;&amp;lt;artifactId&amp;gt;ktor-server-auth-jvm&amp;lt;/artifactId&amp;gt;&#10;&amp;lt;version&amp;gt;${ktor_version}&amp;lt;/version&amp;gt;&#10;&amp;lt;/dependency&amp;gt;&#10;&amp;lt;dependency&amp;gt;&#10;&amp;lt;groupId&amp;gt;io.ktor&amp;lt;/groupId&amp;gt;&#10;&amp;lt;artifactId&amp;gt;ktor-server-auth-jwt-jvm&amp;lt;/artifactId&amp;gt;&#10;&amp;lt;version&amp;gt;${ktor_version}&amp;lt;/version&amp;gt;&#10;&amp;lt;/dependency&amp;gt;"/>
   </TabItem>
</Tabs>

## JWT 認可フロー {id="flow"}
Ktor における JWT 認可フローは次のようになります。
1. クライアントは、サーバーアプリケーション内の特定の認証[ルート](server-routing.md)に対してクレデンシャルを含む `POST` リクエストを送信します。以下の例は、JSON でクレデンシャルを渡す [HTTP クライアント](https://www.jetbrains.com/help/idea/http-client-in-product-code-editor.html)の `POST` リクエストを示しています。
   ```HTTP
   POST http://localhost:8080/login
   Content-Type: application/json
   
   {
     "username": "jetbrains",
     "password": "foobar"
   }
   ```
2. クレデンシャルが有効な場合、サーバーは JSON Web Token を生成し、指定されたアルゴリズムで署名します。たとえば、特定の共有シークレットを使用する `HS256` や、公開鍵/秘密鍵のペアを使用する `RS256` などです。
3. サーバーは生成された JWT をクライアントに送信します。
4. クライアントは、`Bearer` スキームを使用して `Authorization` ヘッダーに JSON Web Token を含め、保護されたリソースにリクエストを送信できるようになります。
   ```HTTP
   GET http://localhost:8080/hello
   Authorization: Bearer {{auth_token}}
   ```
5. サーバーはリクエストを受信し、次の検証を実行します。
   * トークンの署名を検証します。[検証方法](#configure-verifier)はトークンの署名に使用されたアルゴリズムによって異なる点に注意してください。
   * JWT ペイロードに対して[追加の検証](#validate-payload)を実行します。
6. 検証後、サーバーは保護されたリソースのコンテンツで応答します。

## JWT のインストール {id="install"}
`jwt` 認証プロバイダーをインストールするには、`install` ブロック内で [jwt](https://api.ktor.io/ktor-server-auth-jwt/io.ktor.server.auth.jwt/jwt.html) 関数を呼び出します。

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
//...
install(Authentication) {
    jwt {
        // Configure jwt authentication
    }
}
```
オプションで、[指定したルートを認証](#authenticate-route)するために使用できる[プロバイダー名](server-auth.md#provider-name)を指定できます。

## JWT の構成 {id="configure-jwt"}
このセクションでは、Ktor サーバーアプリケーションで JSON Web Token を使用する方法について説明します。トークンの検証方法が少し異なるため、トークンの署名に関する2つのアプローチを示します。
* 指定された共有シークレットで `HS256` を使用する。
* 公開鍵/秘密鍵のペアで `RS256` を使用する。

完全なプロジェクトはこちらで確認できます: [auth-jwt-hs256](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-jwt-hs256)、[auth-jwt-rs256](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-jwt-rs256)。

### ステップ 1: JWT 設定の構成 {id="jwt-settings"}

JWT 関連の設定を構成するには、[設定ファイル](server-configuration-file.topic)内にカスタムの `jwt` グループを作成できます。たとえば、`application.conf` ファイルは次のようになります。

<Tabs group="sign-alg">
<TabItem title="HS256" group-key="hs256">

```
jwt {
    secret = "secret"
    issuer = "http://0.0.0.0:8080/"
    audience = "http://0.0.0.0:8080/hello"
    realm = "Access to 'hello'"
}
```

</TabItem>
<TabItem title="RS256" group-key="rs256">

```
jwt {
    privateKey = "MIIBVQIBADANBgkqhkiG9w0BAQEFAASCAT8wggE7AgEAAkEAtfJaLrzXILUg1U3N1KV8yJr92GHn5OtYZR7qWk1Mc4cy4JGjklYup7weMjBD9f3bBVoIsiUVX6xNcYIr0Ie0AQIDAQABAkEAg+FBquToDeYcAWBe1EaLVyC45HG60zwfG1S4S3IB+y4INz1FHuZppDjBh09jptQNd+kSMlG1LkAc/3znKTPJ7QIhANpyB0OfTK44lpH4ScJmCxjZV52mIrQcmnS3QzkxWQCDAiEA1Tn7qyoh+0rOO/9vJHP8U/beo51SiQMw0880a1UaiisCIQDNwY46EbhGeiLJR1cidr+JHl86rRwPDsolmeEF5AdzRQIgK3KXL3d0WSoS//K6iOkBX3KMRzaFXNnDl0U/XyeGMuUCIHaXv+n+Brz5BDnRbWS+2vkgIe9bUNlkiArpjWvX+2we"
    issuer = "http://0.0.0.0:8080/"
    audience = "http://0.0.0.0:8080/hello"
    realm = "Access to 'hello'"
}
```

</TabItem>
</Tabs>

> シークレット情報を設定ファイルにプレーンテキストで保存しないでください。このようなパラメータを指定するには、[環境変数](server-configuration-file.topic#environment-variables)の使用を検討してください。
>
{type="warning"}

コード内で[これらの設定にアクセス](server-configuration-file.topic#read-configuration-in-code)するには、次のように記述します。

<Tabs group="sign-alg">
<TabItem title="HS256" group-key="hs256">

```kotlin
val jwtConfig = environment.config
val secret = jwtConfig.property("jwt.secret").getString()
val issuer = jwtConfig.property("jwt.issuer").getString()
val audience = jwtConfig
    .property("jwt.audience").getString()
val myRealm = jwtConfig.property("jwt.realm").getString()
```

</TabItem>
<TabItem title="RS256" group-key="rs256">

```kotlin
val jwtConfig = environment.config
val privateKeyString = jwtConfig
    .property("jwt.privateKey").getString()
val issuer = jwtConfig.property("jwt.issuer").getString()
val audience = jwtConfig
    .property("jwt.audience").getString()
val myRealm = jwtConfig.property("jwt.realm").getString()
```

</TabItem>
</Tabs>

### ステップ 2: トークンの生成 {id="generate"}

JSON Web Token を生成するには、[JWTCreator.Builder](https://javadoc.io/doc/com.auth0/java-jwt/latest/com/auth0/jwt/JWTCreator.Builder.html) を使用できます。以下のコードスニペットは、`HS256` と `RS256` の両方のアルゴリズムでこれを行う方法を示しています。

<Tabs group="sign-alg">
<TabItem title="HS256" group-key="hs256">

```kotlin
post("/login") {
    val user = call.receive<User>()
    // Check username and password
    // ...
    val expiresAt = System.currentTimeMillis() + 60000
    val token = JWT.create()
        .withAudience(audience)
        .withIssuer(issuer)
        .withClaim("username", user.username)
        .withExpiresAt(Date(expiresAt))
        .sign(Algorithm.HMAC256(secret))
    call.respond(hashMapOf("token" to token))
}
```

</TabItem>
<TabItem title="RS256" group-key="rs256">

```kotlin
post("/login") {
    val user = call.receive<User>()
    // Check username and password
    // ...
    val keyId = "6f8856ed-9189-488f-9011-0ff4b6c08edc"
    val publicKey = jwkProvider.get(keyId).publicKey
    val decoded = Base64.getDecoder()
        .decode(privateKeyString)
    val keySpecPKCS8 = PKCS8EncodedKeySpec(decoded)
    val privateKey = KeyFactory.getInstance("RSA")
        .generatePrivate(keySpecPKCS8)
    val algorithm = Algorithm.RSA256(
        publicKey as RSAPublicKey,
        privateKey as RSAPrivateKey
    )
    val expiresAt = System.currentTimeMillis() + 60000
    val token = JWT.create()
        .withAudience(audience)
        .withIssuer(issuer)
        .withClaim("username", user.username)
        .withExpiresAt(Date(expiresAt))
        .sign(algorithm)
    call.respond(hashMapOf("token" to token))
}
```

</TabItem>
</Tabs>

1. `post("/login")` は、`POST` リクエストを受信するための認証[ルート](server-routing.md)を定義します。
2. `call.receive<User>()` は、JSON オブジェクトとして送信されたユーザークレデンシャルを[受信](server-serialization.md#receive_data)し、`User` クラスオブジェクトに変換します。
3. `JWT.create()` は、指定された JWT 設定でトークンを生成し、受信したユーザー名を含むカスタムクレームを追加して、指定されたアルゴリズムでトークンに署名します。
   * `HS256` の場合、トークンの署名に共有シークレットが使用されます。
   * `RS256` の場合、公開鍵/秘密鍵のペアが使用されます。
4. `call.respond` は、トークンを JSON オブジェクトとしてクライアントに[送信](server-serialization.md#send_data)します。

### ステップ 3: レルムの構成 {id="realm"}
`realm` プロパティを使用すると、[保護されたルート](#authenticate-route)へのアクセス時に `WWW-Authenticate` ヘッダーで渡されるレルムを設定できます。

```kotlin
val myRealm = jwtConfig.property("jwt.realm").getString()
install(Authentication) {
    jwt("auth-jwt") {
        realm = myRealm
    }
}
```

### ステップ 4: トークン検証機能の構成 {id="configure-verifier"}

`verifier` 関数を使用すると、トークンの形式とその署名を検証できます。
* `HS256` の場合、トークンを検証するために [JWTVerifier](https://www.javadoc.io/doc/com.auth0/java-jwt/latest/com/auth0/jwt/JWTVerifier.html) インスタンスを渡す必要があります。
* `RS256` の場合、トークンの検証に使用される公開鍵にアクセスするための JWKS エンドポイントを指定する [JwkProvider](https://www.javadoc.io/doc/com.auth0/jwks-rsa/latest/com/auth0/jwk/JwkProvider.html) を渡す必要があります。この例では発行者が `http://0.0.0.0:8080` であるため、JWKS エンドポイントのアドレスは `http://0.0.0.0:8080/.well-known/jwks.json` になります。

<Tabs group="sign-alg">
<TabItem title="HS256" group-key="hs256">

```kotlin
val jwtConfig = environment.config
val secret = jwtConfig.property("jwt.secret").getString()
val issuer = jwtConfig.property("jwt.issuer").getString()
val audience = jwtConfig
    .property("jwt.audience").getString()
val myRealm = jwtConfig.property("jwt.realm").getString()
install(Authentication) {
    jwt("auth-jwt") {
        realm = myRealm
        verifier(JWT
                .require(Algorithm.HMAC256(secret))
                .withAudience(audience)
                .withIssuer(issuer)
                .build())
    }
}
```

</TabItem>
<TabItem title="RS256" group-key="rs256">

```kotlin
val issuer = jwtConfig.property("jwt.issuer").getString()
val audience = jwtConfig
    .property("jwt.audience").getString()
val myRealm = jwtConfig.property("jwt.realm").getString()
val jwkProvider = JwkProviderBuilder(issuer)
    .cached(10, 24, TimeUnit.HOURS)
    .rateLimited(10, 1, TimeUnit.MINUTES)
    .build()
install(Authentication) {
    jwt("auth-jwt") {
        realm = myRealm
        verifier(jwkProvider, issuer) {
            acceptLeeway(3)
        }
    }
}
```

</TabItem>
</Tabs>

### ステップ 5: JWT ペイロードの検証 {id="validate-payload"}

<Tabs group="auth-dsl">
<TabItem title="Classic" group-key="classic">

1. `validate` 関数を使用すると、JWT ペイロードの検証を実行できます。この関数は必須です。構成しない場合、プロバイダーの初期化時に `IllegalArgumentException` がスローされます。JWT ペイロードを含み [JWTCredential](https://api.ktor.io/ktor-server-auth-jwt/io.ktor.server.auth.jwt/-j-w-t-credential/index.html) オブジェクトを表す `credential` パラメータをチェックします。以下の例では、カスタムの `username` クレームの値がチェックされています。
   ```kotlin
   install(Authentication) {
       jwt("auth-jwt") {
           validate { credential ->
               val payload = credential.payload
               val claim = payload.getClaim("username")
               if (claim.asString() != "") {
                   JWTPrincipal(credential.payload)
               } else {
                   null
               }
           }
       }
   }
   ```
   
   認証に成功した場合は、[JWTPrincipal](https://api.ktor.io/ktor-server-auth-jwt/io.ktor.server.auth.jwt/-j-w-t-principal/index.html) を返します。
2. `challenge` 関数を使用すると、認証に失敗した場合に送信されるレスポンスを構成できます。
   ```kotlin
   install(Authentication) {
       jwt("auth-jwt") {
           challenge { defaultScheme, realm ->
               val text = "Token is not valid or has expired"
               val status = HttpStatusCode.Unauthorized
               call.respond(status, text)
           }
       }
   }
   ```

</TabItem>
<TabItem title="Type-safe" group-key="typed">

<note>
    <p>
        型安全な認証スキーム API は試験的なものです。いつでも廃止または変更される可能性があります。
        オプトインが必要です。詳細については、
        <a href="server-typed-auth.md#prerequisites">型安全な認証のドキュメント</a>を参照してください。
    </p>
</note>

`jwt()` 関数は、任意のプリンシパル型のスキームを作成します。`install(Authentication)` のステップはありません。スキームは、それを必要とするルートに渡す値です。

`validate` の内部で必要なクレームを読み取り、独自の型を返します。これにより、ルートハンドラーは `JWTPrincipal` の代わりにその型を操作できるようになります。

```kotlin
data class User(val username: String, val expiresAt: Long?)

val jwtAuth = jwt<User>("auth-jwt") {
    realm = myRealm
    verifier(
        JWT.require(Algorithm.HMAC256(secret))
            .withAudience(audience)
            .withIssuer(issuer)
            .build()
    )
    validate { credential ->
        val payload = credential.payload
        val username = payload.getClaim("username").asString()
        if (username != "") {
            User(username, credential.expiresAt?.time)
        } else {
            null
        }
    }
    onUnauthorized = {
        val message = "Token is not valid or has expired"
        call.respond(HttpStatusCode.Unauthorized, message)
    }
}
```

失敗ハンドラーは `challenge` ではなく `onUnauthorized` です。完全な API については、[型安全な認証](server-typed-auth.md)を参照してください。

</TabItem>
</Tabs>

### ステップ 6: 特定のリソースの保護 {id="authenticate-route"}

<Tabs group="auth-dsl">
<TabItem title="Classic" group-key="classic">

`jwt` プロバイダーを構成した後、**[authenticate](server-auth.md#authenticate-route)** 関数を使用してアプリケーション内の特定のリソースを保護できます。認証に成功した場合、ルートハンドラー内で `call.principal` 関数を使用して認証済みの [JWTPrincipal](https://api.ktor.io/ktor-server-auth-jwt/io.ktor.server.auth.jwt/-j-w-t-principal/index.html) を取得し、JWT ペイロードを取得できます。以下の例では、カスタムの `username` クレームの値とトークンの有効期限が取得されています。

```kotlin
routing {
    authenticate("auth-jwt") {
        get("/hello") {
            val principal = call.principal<JWTPrincipal>()
            val payload = principal!!.payload
            val username = payload.getClaim("username")
                .asString()
            val now = System.currentTimeMillis()
            val expiresAt = principal.expiresAt?.time
                ?.minus(now)
            call.respondText(
                "Hello, $username! " +
                    "Token is expired at $expiresAt ms."
            )
        }
    }
}
```

</TabItem>
<TabItem title="Type-safe" group-key="typed">

スキームを `authenticateWith()` に渡します。クレームはすでに `validate` で読み取られているため、ハンドラーは独自の型を操作でき、null チェックは不要です。

```kotlin
routing {
    authenticateWith(jwtAuth) {
        get("/hello") {
            val user = call.principal
            val now = System.currentTimeMillis()
            val expiresIn = user.expiresAt?.minus(now)
            call.respondText(
                "Hello, ${user.username}! " +
                    "Token is expired at $expiresIn ms."
            )
        }
    }
}
```

</TabItem>
</Tabs>