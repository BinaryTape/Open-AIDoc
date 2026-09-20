[//]: # (title: JSON Web Tokens)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="Authentication JWT"/>

<tldr>
<p>
<b>必要相依性</b>：<code>io.ktor:ktor-server-auth</code>、<code>io.ktor:ktor-server-auth-jwt</code>
</p>
<p>
<b>程式碼範例</b>： 
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-jwt-hs256">auth-jwt-hs256</a>, 
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-jwt-rs256">auth-jwt-rs256</a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor 支援 Kotlin/Native，並允許您在沒有額外執行階段或虛擬機的情況下執行伺服器。">原生伺服器</Links> 支援</b>：✖️
</p>
</tldr>

<link-summary>
%plugin_name% 外掛程式允許您使用 JSON Web Token 驗證用戶端。 
</link-summary>

[JSON Web Token (JWT)](https://jwt.io/) 是一個開放標準，定義了一種將資訊作為 JSON 物件在各方之間安全傳輸的方式。由於此資訊使用共用金鑰（使用 `HS256` 演算法）或公鑰/私鑰對（例如 `RS256`）進行簽名，因此可以被驗證和信任。

Ktor 處理在 `Authorization` 標頭中以 `Bearer` 配置傳遞的 JWT，並允許您：
* 驗證 JSON Web Token 的簽名；
* 對 JWT 承載內容 (payload) 執行額外的驗證。

> 您可以在 [Ktor Server 中的驗證與授權](server-auth.md) 章節中取得有關 Ktor 驗證與授權的一般資訊。

> 如果權杖來自 OpenID Connect 提供程式，`Oidc` 外掛程式會從發行者 URL 解析 JWKS 端點，並在金鑰輪換時重新整理，因此您不需要手動設定 `JwkProvider`。它還會拒絕作為存取權杖出示的 ID 權杖。請參閱 [OpenID Connect 資源伺服器](server-oidc-resource-server.md)。
>
{style="tip"}

## 新增相依性 {id="add_dependencies"}
要啟用 `JWT` 驗證，您需要在建置指令碼中包含 `ktor-server-auth` 和 `ktor-server-auth-jwt` 構件：

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

## JWT 授權流程 {id="flow"}
Ktor 中的 JWT 授權流程如下所示：
1. 用戶端向伺服器應用程式中的特定驗證[路由](server-routing.md)發送帶有憑據的 `POST` 請求。下面的範例顯示了一個 [HTTP 用戶端](https://www.jetbrains.com/help/idea/http-client-in-product-code-editor.html) 的 `POST` 請求，憑據以 JSON 格式傳遞：
   ```HTTP
   POST http://localhost:8080/login
   Content-Type: application/json
   
   {
     "username": "jetbrains",
     "password": "foobar"
   }
   ```
2. 如果憑據有效，伺服器會產生一個 JSON Web Token 並使用指定的演算法對其進行簽名。例如，這可能是帶有特定共用金鑰的 `HS256`，或是帶有公鑰/私鑰對的 `RS256`。
3. 伺服器將產生的 JWT 發送給用戶端。
4. 用戶端現在可以使用在 `Authorization` 標頭中以 `Bearer` 配置傳遞的 JSON Web Token，向受保護的資源發送請求。
   ```HTTP
   GET http://localhost:8080/hello
   Authorization: Bearer {{auth_token}}
   ```
5. 伺服器接收請求並執行以下驗證：
   * 驗證權杖 (token) 的簽名。請注意，[驗證方式](#configure-verifier)取決於用於簽名權杖的演算法。
   * 對 JWT 承載內容 (payload) 執行[額外的驗證](#validate-payload)。
6. 驗證後，伺服器會回應受保護資源的內容。

## 安裝 JWT {id="install"}
要安裝 `jwt` 驗證提供程式，請在 `install` 區塊內呼叫 [jwt](https://api.ktor.io/ktor-server-auth-jwt/io.ktor.server.auth.jwt/jwt.html) 函式：

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
//...
install(Authentication) {
    jwt {
        // 配置 jwt 驗證
    }
}
```
您可以選擇性地指定一個[提供程式名稱 (provider name)](server-auth.md#provider-name)，該名稱可用於[驗證指定的路由](#authenticate-route)。

## 設定 JWT {id="configure-jwt"}
在本節中，我們將了解如何在伺服器端 Ktor 應用程式中使用 JSON Web Token。我們將展示兩種簽名權杖的方法，因為它們需要稍微不同的方式來驗證權杖：
* 使用帶有指定共用金鑰的 `HS256`。 
* 使用帶有公鑰/私鑰對的 `RS256`。

您可以在此處找到完整的專案：[auth-jwt-hs256](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-jwt-hs256)、[auth-jwt-rs256](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-jwt-rs256)。

### 步驟 1：設定 JWT 設定 {id="jwt-settings"}

要設定 JWT 相關設定，您可以在 [設定檔](server-configuration-file.topic) 中建立一個自訂的 `jwt` 群組。例如，`application.conf` 檔案可能如下所示：

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

> 請注意，秘密資訊不應以純文字形式儲存在設定檔中。請考慮使用[環境變數](server-configuration-file.topic#environment-variables)來指定這些參數。
>
{type="warning"}

您可以透過以下方式[在程式碼中存取這些設定](server-configuration-file.topic#read-configuration-in-code)：

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

### 步驟 2：產生權杖 {id="generate"}

要產生 JSON Web Token，您可以使用 [JWTCreator.Builder](https://javadoc.io/doc/com.auth0/java-jwt/latest/com/auth0/jwt/JWTCreator.Builder.html)。下面的程式碼片段顯示了如何針對 `HS256` 和 `RS256` 演算法執行此操作：

<Tabs group="sign-alg">
<TabItem title="HS256" group-key="hs256">

```kotlin
post("/login") {
    val user = call.receive<User>()
    // 檢查使用者名稱和密碼
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
    // 檢查使用者名稱和密碼
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

1. `post("/login")` 定義了一個用於接收 `POST` 請求的驗證[路由](server-routing.md)。
2. `call.receive<User>()` [接收](server-serialization.md#receive_data)以 JSON 物件發送的使用者憑據，並將其轉換為 `User` 類別物件。
3. `JWT.create()` 使用指定的 JWT 設定產生權杖，新增一個包含所接收使用者名稱的自訂宣告 (claim)，並使用指定的演算法對權杖進行簽名：
   * 對於 `HS256`，使用共用金鑰對權杖進行簽名。
   * 對於 `RS256`，使用公鑰/私鑰對進行簽名。
4. `call.respond` 將權杖作為 JSON 物件[發送](server-serialization.md#send_data)給用戶端。

### 步驟 3：設定領域 (realm) {id="realm"}
`realm` 屬性允許您設定存取[受保護路由](#authenticate-route)時要在 `WWW-Authenticate` 標頭中傳遞的領域。

```kotlin
val myRealm = jwtConfig.property("jwt.realm").getString()
install(Authentication) {
    jwt("auth-jwt") {
        realm = myRealm
    }
}
```

### 步驟 4：設定權杖驗證器 {id="configure-verifier"}

`verifier` 函式允許您驗證權杖格式及其簽名：
* 對於 `HS256`，您需要傳遞一個 [JWTVerifier](https://www.javadoc.io/doc/com.auth0/java-jwt/latest/com/auth0/jwt/JWTVerifier.html) 執行個體來驗證權杖。
* 對於 `RS256`，您需要傳遞 [JwkProvider](https://www.javadoc.io/doc/com.auth0/jwks-rsa/latest/com/auth0/jwk/JwkProvider.html)，它指定一個 JWKS 端點，用於存取驗證權杖所需的公鑰。在我們的案例中，發行者是 `http://0.0.0.0:8080`，因此 JWKS 端點位址將是 `http://0.0.0.0:8080/.well-known/jwks.json`。

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

### 步驟 5：驗證 JWT 承載內容 (payload) {id="validate-payload"}

<Tabs group="auth-dsl">
<TabItem title="Classic" group-key="classic">

1. `validate` 函式允許您對 JWT 承載內容執行驗證。此函式是必需的：如果您沒有配置它，提供程式初始化將拋出 `IllegalArgumentException`。請檢查 `credential` 參數，它代表一個 [JWTCredential](https://api.ktor.io/ktor-server-auth-jwt/io.ktor.server.auth.jwt/-j-w-t-credential/index.html) 物件並包含 JWT 承載內容。在下面的範例中，會檢查自訂 `username` 宣告的值。
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
   
   驗證成功時，傳回 [JWTPrincipal](https://api.ktor.io/ktor-server-auth-jwt/io.ktor.server.auth.jwt/-j-w-t-principal/index.html)。 
2. `challenge` 函式允許您設定在驗證失敗時發送的回應。
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
        型別安全的驗證配置 API 是實驗性的。它可能隨時被移除或更改。
        需要明確宣告選擇加入 (Opt-in)。如需更多詳細資訊，請參閱
        <a href="server-typed-auth.md#prerequisites">啟用 API</a>。
    </p>
</note>

`jwt()` 函式會為您選擇的 principal 型別建立一個配置 (scheme)。這裡沒有 `install(Authentication)` 步驟：該配置是一個值，您可以將其傳遞給需要的路由。

在 `validate` 內讀取您需要的宣告 (claims) 並傳回您自己的型別。然後路由處理常式就可以使用該型別，而不是 `JWTPrincipal`：

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

失敗處理常式是 `onUnauthorized` 而不是 `challenge`。如需完整的 API，請參閱[型別安全驗證](server-typed-auth.md)。

</TabItem>
</Tabs>

### 步驟 6：保護特定資源 {id="authenticate-route"}

<Tabs group="auth-dsl">
<TabItem title="Classic" group-key="classic">

設定完 `jwt` 提供程式後，您可以使用 **[authenticate](server-auth.md#authenticate-route)** 函式保護應用程式中的特定資源。在驗證成功的情況下，您可以使用 `call.principal` 函式在路由處理常式內部擷取已驗證的 [JWTPrincipal](https://api.ktor.io/ktor-server-auth-jwt/io.ktor.server.auth.jwt/-j-w-t-principal/index.html) 並取得 JWT 承載內容。在下面的範例中，會擷取自訂 `username` 宣告的值和權杖到期時間。

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

將配置傳遞給 `authenticateWith()`。由於宣告已經在 `validate` 中讀取，因此處理常式可以使用您自己的型別，且不需要進行 null 檢查：

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