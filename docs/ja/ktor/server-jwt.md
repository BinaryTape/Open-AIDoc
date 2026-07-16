[//]: # (title: JSON Web Tokens)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="Authentication JWT"/>

<tldr>
<p>
<b>必須の依存関係</b>: <code>io.ktor:ktor-server-auth</code>, <code>io.ktor:ktor-server-auth-jwt</code>
</p>
<p>
<b>コード例</b>: 
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-jwt-hs256">auth-jwt-hs256</a>, 
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-jwt-rs256">auth-jwt-rs256</a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor は Kotlin/Native をサポートしており、追加のランタイムや仮想マシンなしでサーバーを実行できます。">Native サーバー</Links> のサポート</b>: ✖️
</p>
</tldr>

<link-summary>
%plugin_name% プラグインを使用すると、JSON Web Token を使用してクライアントを認証できます。
</link-summary>

[JSON Web Token (JWT)](https://jwt.io/) は、情報を JSON オブジェクトとして関係者間で安全に送信するための方法を定義したオープン標準です。この情報は、共有シークレット（`HS256` アルゴリズムを使用）または公開鍵/秘密鍵のペア（例：`RS256`）を使用して署名されているため、検証および信頼することができます。

Ktor は、`Bearer` スキーマを使用して `Authorization` ヘッダーで渡される JWT を処理し、以下のことを可能にします。
* JSON Web Token の署名を検証する。
* JWT ペイロードに対して追加の検証を実行する。

> Ktor における認証と認可に関する一般的な情報は、[Ktor サーバーにおける認証と認可](server-auth.md) セクションで確認できます。

## 依存関係の追加 {id="add_dependencies"}
`JWT` 認証を有効にするには、ビルドスクリプトに `ktor-server-auth` と `ktor-server-auth-jwt` アーティファクトを含める必要があります。

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" title="Sample" code="            implementation(&quot;io.ktor:ktor-server-auth:$ktor_version&quot;)&#10;            implementation(&quot;io.ktor:ktor-server-auth-jwt:$ktor_version&quot;)"></code-block>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" title="Sample" code="            implementation &quot;io.ktor:ktor-server-auth:$ktor_version&quot;&#10;            implementation &quot;io.ktor:ktor-server-auth-jwt:$ktor_version&quot;"></code-block>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" title="Sample" code="&amp;lt;dependency&amp;gt;&#10;&amp;lt;groupId&amp;gt;io.ktor&amp;lt;/groupId&amp;gt;&#10;&amp;lt;artifactId&amp;gt;ktor-server-auth-jvm&amp;lt;/artifactId&amp;gt;&#10;&amp;lt;version&amp;gt;${ktor_version}&amp;lt;/version&amp;gt;&#10;&amp;lt;/dependency&amp;gt;&#10;&amp;lt;dependency&amp;gt;&#10;&amp;lt;groupId&amp;gt;io.ktor&amp;lt;/groupId&amp;gt;&#10;&amp;lt;artifactId&amp;gt;ktor-server-auth-jwt-jvm&amp;lt;/artifactId&amp;gt;&#10;&amp;lt;version&amp;gt;${ktor_version}&amp;lt;/version&amp;gt;&#10;&amp;lt;/dependency&amp;gt;"></code-block>
   </TabItem>
</Tabs>

## JWT 認可フロー {id="flow"}
Ktor における JWT 認可フローは以下のようになります。
1. クライアントは、サーバーアプリケーション内の特定の認証 [ルート (route)](server-routing.md) に対して、資格情報を含む `POST` リクエストを送信します。以下の例は、JSON で渡された資格情報を使用した [HTTP クライアント](https://www.jetbrains.com/help/idea/http-client-in-product-code-editor.html) の `POST` リクエストを示しています。
   ```HTTP
   POST http://localhost:8080/login
   Content-Type: application/json
   
   {
     "username": "jetbrains",
     "password": "foobar"
   }
   ```
2. 資格情報が有効な場合、サーバーは JSON Web Token を生成し、指定されたアルゴリズムで署名します。たとえば、これは特定の共有シークレットを使用した `HS256` や、公開鍵/秘密鍵のペアを使用した `RS256` などです。
3. サーバーは生成された JWT をクライアントに送信します。
4. クライアントは、`Bearer` スキーマを使用して `Authorization` ヘッダーに JSON Web Token を含めることで、保護されたリソースにリクエストを送信できるようになります。
   ```HTTP
   GET http://localhost:8080/hello
   Authorization: Bearer {{auth_token}}
   ```
5. サーバーはリクエストを受信し、以下の検証を実行します。
   * トークンの署名を検証します。[検証方法](#configure-verifier) は、トークンの署名に使用されたアルゴリズムによって異なることに注意してください。
   * JWT ペイロードに対して [追加の検証](#validate-payload) を実行します。
6. 検証後、サーバーは保護されたリソースの内容を応答として返します。

## JWT のインストール {id="install"}
`jwt` 認証プロバイダーをインストールするには、`install` ブロック内で [jwt](https://api.ktor.io/ktor-server-auth-jwt/io.ktor.server.auth.jwt/jwt.html) 関数を呼び出します。

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
//...
install(Authentication) {
    jwt {
        // jwt 認証を構成する
    }
}
```
オプションで、[特定のルートを認証する](#authenticate-route) ために使用できる [プロバイダー名](server-auth.md#provider-name) を指定することもできます。

## JWT の構成 {id="configure-jwt"}
このセクションでは、Ktor サーバーアプリケーションで JSON Web Token を使用する方法を見ていきます。トークンの検証方法が若干異なるため、トークンの署名に関する 2 つのアプローチを示します。
* 指定された共有シークレットを使用して `HS256` を使用する。
* 公開鍵/秘密鍵のペアを使用して `RS256` を使用する。

完全なプロジェクトはこちらで見つけることができます: [auth-jwt-hs256](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-jwt-hs256), [auth-jwt-rs256](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-jwt-rs256)。

### ステップ 1: JWT 設定の構成 {id="jwt-settings"}

JWT 関連の設定を構成するために、[設定ファイル](server-configuration-file.topic) にカスタムの `jwt` グループを作成できます。たとえば、`application.conf` ファイルは以下のようになります。

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

> 秘密情報は設定ファイルにプレーンテキストで保存しないでください。これらのパラメータを指定するには、[環境変数](server-configuration-file.topic#environment-variables) の使用を検討してください。
>
{type="warning"}

これらの設定には、次のようにして [コード内でアクセス](server-configuration-file.topic#read-configuration-in-code) できます。

<Tabs group="sign-alg">
<TabItem title="HS256" group-key="hs256">

```kotlin
val secret = environment.config.property("jwt.secret").getString()
val issuer = environment.config.property("jwt.issuer").getString()
val audience = environment.config.property("jwt.audience").getString()
val myRealm = environment.config.property("jwt.realm").getString()
```

</TabItem>
<TabItem title="RS256" group-key="rs256">

```kotlin
val privateKeyString = environment.config.property("jwt.privateKey").getString()
val issuer = environment.config.property("jwt.issuer").getString()
val audience = environment.config.property("jwt.audience").getString()
val myRealm = environment.config.property("jwt.realm").getString()
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
    // ユーザー名とパスワードをチェック
    // ...
    val token = JWT.create()
        .withAudience(audience)
        .withIssuer(issuer)
        .withClaim("username", user.username)
        .withExpiresAt(Date(System.currentTimeMillis() + 60000))
        .sign(Algorithm.HMAC256(secret))
    call.respond(hashMapOf("token" to token))
}
```

</TabItem>
<TabItem title="RS256" group-key="rs256">

```kotlin
post("/login") {
    val user = call.receive<User>()
    // ユーザー名とパスワードをチェック
    // ...
    val publicKey = jwkProvider.get("6f8856ed-9189-488f-9011-0ff4b6c08edc").publicKey
    val keySpecPKCS8 = PKCS8EncodedKeySpec(Base64.getDecoder().decode(privateKeyString))
    val privateKey = KeyFactory.getInstance("RSA").generatePrivate(keySpecPKCS8)
    val token = JWT.create()
        .withAudience(audience)
        .withIssuer(issuer)
        .withClaim("username", user.username)
        .withExpiresAt(Date(System.currentTimeMillis() + 60000))
        .sign(Algorithm.RSA256(publicKey as RSAPublicKey, privateKey as RSAPrivateKey))
    call.respond(hashMapOf("token" to token))
}
```

</TabItem>
</Tabs>

1. `post("/login")` は、`POST` リクエストを受信するための認証 [ルート](server-routing.md) を定義します。
2. `call.receive<User>()` は、JSON オブジェクトとして送信されたユーザー資格情報を [受信](server-serialization.md#receive_data) し、`User` クラスオブジェクトに変換します。
3. `JWT.create()` は、指定された JWT 設定でトークンを生成し、受信したユーザー名を含むカスタムクレームを追加し、指定されたアルゴリズムでトークンに署名します。
   * `HS256` の場合、トークンの署名には共有シークレットが使用されます。
   * `RS256` の場合、公開鍵/秘密鍵のペアが使用されます。
4. `call.respond` は、トークンを JSON オブジェクトとしてクライアントに [送信](server-serialization.md#send_data) します。

### ステップ 3: realm の構成 {id="realm"}
`realm` プロパティを使用すると、[保護されたルート](#authenticate-route) にアクセスしたときに `WWW-Authenticate` ヘッダーで渡される realm を設定できます。

```kotlin
val myRealm = environment.config.property("jwt.realm").getString()
install(Authentication) {
    jwt("auth-jwt") {
        realm = myRealm
    }
}
```

### ステップ 4: トークン検証機能（verifier）の構成 {id="configure-verifier"}

`verifier` 関数を使用すると、トークンの形式とその署名を検証できます。
* `HS256` の場合、トークンを検証するために [JWTVerifier](https://www.javadoc.io/doc/com.auth0/java-jwt/latest/com/auth0/jwt/JWTVerifier.html) インスタンスを渡す必要があります。
* `RS256` の場合、[JwkProvider](https://www.javadoc.io/doc/com.auth0/jwks-rsa/latest/com/auth0/jwk/JwkProvider.html) を渡す必要があります。これは、トークンの検証に使用される公開鍵にアクセスするための JWKS エンドポイントを指定します。今回の例では、issuer が `http://0.0.0.0:8080` であるため、JWKS エンドポイントのアドレスは `http://0.0.0.0:8080/.well-known/jwks.json` になります。

<Tabs group="sign-alg">
<TabItem title="HS256" group-key="hs256">

```kotlin
val secret = environment.config.property("jwt.secret").getString()
val issuer = environment.config.property("jwt.issuer").getString()
val audience = environment.config.property("jwt.audience").getString()
val myRealm = environment.config.property("jwt.realm").getString()
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
val issuer = environment.config.property("jwt.issuer").getString()
val audience = environment.config.property("jwt.audience").getString()
val myRealm = environment.config.property("jwt.realm").getString()
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

1. `validate` 関数を使用すると、JWT ペイロードに対して検証を実行できます。この関数は必須です。構成しない場合、プロバイダーの初期化時に `IllegalArgumentException` がスローされます。`credential` パラメーターをチェックしてください。これは [JWTCredential](https://api.ktor.io/ktor-server-auth-jwt/io.ktor.server.auth.jwt/-j-w-t-credential/index.html) オブジェクトを表し、JWT ペイロードを含んでいます。以下の例では、カスタムクレーム `username` の値をチェックしています。
   ```kotlin
   install(Authentication) {
       jwt("auth-jwt") {
           validate { credential ->
               if (credential.payload.getClaim("username").asString() != "") {
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
               call.respond(HttpStatusCode.Unauthorized, "Token is not valid or has expired")
           }
       }
   }
   ```

### ステップ 6: 特定のリソースの保護 {id="authenticate-route"}

`jwt` プロバイダーを構成した後、**[authenticate](server-auth.md#authenticate-route)** 関数を使用してアプリケーション内の特定のリソースを保護できます。認証に成功した場合は、ルートハンドラー内で `call.principal` 関数を使用して認証済みの [JWTPrincipal](https://api.ktor.io/ktor-server-auth-jwt/io.ktor.server.auth.jwt/-j-w-t-principal/index.html) を取得し、JWT ペイロードを取得できます。以下の例では、カスタムクレーム `username` の値とトークンの有効期限を取得しています。

```kotlin
routing {
    authenticate("auth-jwt") {
        get("/hello") {
            val principal = call.principal<JWTPrincipal>()
            val username = principal!!.payload.getClaim("username").asString()
            val expiresAt = principal.expiresAt?.time?.minus(System.currentTimeMillis())
            call.respondText("Hello, $username! Token is expired at $expiresAt ms.")
        }
    }
}