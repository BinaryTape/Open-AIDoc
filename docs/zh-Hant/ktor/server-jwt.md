[//]: # (title: JSON Web Token)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="Authentication JWT"/>

<tldr>
<p>
<b>必要相依性</b>：<code>io.ktor:ktor-server-auth</code>、<code>io.ktor:ktor-server-auth-jwt</code>
</p>
<p>
<b>程式碼範例</b>： 
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-jwt-hs256">auth-jwt-hs256</a>、 
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-jwt-rs256">auth-jwt-rs256</a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor 支援 Kotlin/Native，並允許你在沒有額外執行階段或虛擬機的情況下執行伺服器。">Native 伺服器</Links>支援</b>：✖️
</p>
</tldr>

<link-summary>
%plugin_name% 外掛程式允許你使用 JSON Web Token 驗證用戶端。
</link-summary>

[JSON Web Token (JWT)](https://jwt.io/) 是一項開放標準，定義了一種以 JSON 物件在雙方之間安全傳輸資訊的方法。由於此資訊是使用共用密鑰（透過 `HS256` 演算法）或公開/私有金鑰組（例如 `RS256`）進行簽署的，因此可以被驗證與信任。

Ktor 處理在 `Authorization` 標頭中使用 `Bearer` 配置傳遞的 JWT，並允許你：
* 驗證 JSON web token 的簽章；
* 對 JWT 負載（payload）執行額外的驗證。

> 你可以在 [Ktor Server 中的驗證與授權](server-auth.md) 章節中取得關於 Ktor 驗證與授權的一般資訊。

> 如果權杖來自 OpenID Connect 提供者，`Oidc` 外掛程式會從發行者 URL 解析 JWKS 端點，並在金鑰輪換時重新整理它，因此你不需要手動設定 `JwkProvider`。它還會拒絕作為存取權杖提供的 ID 權杖。請參閱 [OpenID Connect 資源伺服器](server-oidc-resource-server.md)。
>
{style="tip"}

## 新增相依性 {id="add_dependencies"}
若要啟用 `JWT` 驗證，你需要在建置指令碼中包含 `ktor-server-auth` 與 `ktor-server-auth-jwt` 構件：

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
Ktor 中的 JWT 授權流程可能如下所示：
1. 用戶端向伺服器應用程式中特定的驗證[路由](server-routing.md)發出帶有憑據的 `POST` 請求。下方的範例顯示了使用 JSON 傳遞憑據的 [HTTP 用戶端](https://www.jetbrains.com/help/idea/http-client-in-product-code-editor.html) `POST` 請求：
   ```HTTP
   POST http://localhost:8080/login
   Content-Type: application/json
   
   {
     "username": "jetbrains",
     "password": "foobar"
   }
   ```
2. 如果憑據有效，伺服器會產生 JSON web token 並使用指定的演算法對其進行簽署。例如，這可以是使用特定共用密鑰的 `HS256`，或是使用公開/私有金鑰組的 `RS256`。
3. 伺服器將產生的 JWT 發送給用戶端。
4. 用戶端現在可以向受保護的資源發出請求，並在 `Authorization` 標頭中使用 `Bearer` 配置傳遞 JSON web token。
   ```HTTP
   GET http://localhost:8080/hello
   Authorization: Bearer {{auth_token}}
   ```
5. 伺服器接收請求並執行以下驗證：
   * 驗證權杖的簽章。請注意，[驗證方式](#configure-verifier)取決於用於簽署權杖的演算法。
   * 對 JWT 負載執行[額外驗證](#validate-payload)。
6. 驗證完成後，伺服器會回應受保護資源的內容。

## 安裝 JWT {id="install"}
若要安裝 `jwt` 驗證提供者，請在 `install` 區塊內呼叫 [jwt](https://api.ktor.io/ktor-server-auth-jwt/io.ktor.server.auth.jwt/jwt.html) 函式：

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
你可以選擇性指定一個[提供者名稱](server-auth.md#provider-name)，可用於[驗證指定的路由](#authenticate-route)。

## 設定 JWT {id="configure-jwt"}
在本節中，我們將探討如何在伺服器端 Ktor 應用程式中使用 JSON web token。我們將示範兩種簽署權杖的方法，因為它們驗證權杖的方式略有不同：
* 使用帶有指定共用密鑰的 `HS256`。 
* 使用帶有公開/私有金鑰組的 `RS256`。

你可以在此處找到完整的專案：[auth-jwt-hs256](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-jwt-hs256)、[auth-jwt-rs256](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-jwt-rs256)。

### 步驟 1：配置 JWT 設定 {id="jwt-settings"}

若要配置與 JWT 相關的設定，你可以在[設定檔](server-configuration-file.topic)中建立自訂的 `jwt` 群組。例如，`application.conf` 檔案可能如下所示：

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

> 請注意，機密資訊不應以純文字形式儲存在設定檔中。請考慮使用[環境變數](server-configuration-file.topic#environment-variables)來指定此類參數。
>
{type="warning"}

你可以透過以下方式[在程式碼中存取這些設定](server-configuration-file.topic#read-configuration-in-code)：

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

若要產生 JSON web token，可以使用 [JWTCreator.Builder](https://javadoc.io/doc/com.auth0/java-jwt/latest/com/auth0/jwt/JWTCreator.Builder.html)。下方的程式碼片段展示了如何針對 `HS256` 與 `RS256` 演算法進行此操作：

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

1. `post("/login")` 定義了用於接收 `POST` 請求的驗證[路由](server-routing.md)。
2. `call.receive<User>()` [接收](server-serialization.md#receive_data)以 JSON 物件發送的使用者憑據，並將其轉換為 `User` 類別物件。
3. `JWT.create()` 使用指定的 JWT 設定產生權杖，新增帶有接收到的使用者名稱的自訂宣告（claim），並使用指定的演算法對權杖進行簽署：
   * 對於 `HS256`，使用共用密鑰簽署權杖。
   * 對於 `RS256`，使用公開/私有金鑰組。
4. `call.respond` 將權杖以 JSON 物件形式[發送](server-serialization.md#send_data)給用戶端。

### 步驟 3：設定 realm {id="realm"}
`realm` 屬性允許你設定在存取[受保護路由](#authenticate-route)時，於 `WWW-Authenticate` 標頭中傳遞的 realm。

```kotlin
val myRealm = jwtConfig.property("jwt.realm").getString()
install(Authentication) {
    jwt("auth-jwt") {
        realm = myRealm
    }
}
```

### 步驟 4：設定權杖驗證器 {id="configure-verifier"}

`verifier` 函式允許你驗證權杖格式及其簽章：
* 對於 `HS256`，你需要傳遞 [JWTVerifier](https://www.javadoc.io/doc/com.auth0/java-jwt/latest/com/auth0/jwt/JWTVerifier.html) 執行個體以驗證權杖。
* 對於 `RS256`，你需要傳遞 [JwkProvider](https://www.javadoc.io/doc/com.auth0/jwks-rsa/latest/com/auth0/jwk/JwkProvider.html)，它指定了用於存取驗證權杖所需公鑰的 JWKS 端點。在我們的例子中，發行者是 `http://0.0.0.0:8080`，因此 JWKS 端點位址將是 `http://0.0.0.0:8080/.well-known/jwks.json`。

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

### 步驟 5：驗證 JWT 負載 {id="validate-payload"}

<Tabs group="auth-dsl">
<TabItem title="Classic" group-key="classic">

1. `validate` 函式允許你對 JWT 負載執行驗證。此函式是必要的：如果未進行設定，提供者初始化時將擲出 `IllegalArgumentException`。請檢查 `credential` 參數，它代表一個 [JWTCredential](https://api.ktor.io/ktor-server-auth-jwt/io.ktor.server.auth.jwt/-j-w-t-credential/index.html) 物件並包含 JWT 負載。在下方的範例中，檢查了自訂 `username` 宣告的值。
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
2. `challenge` 函式允許你設定在驗證失敗時要發送的回應。
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
        型別安全驗證方案 API 仍處於實驗階段，可能隨時被移除或變更。需要明確選擇啟用（Opt-in）。如需更多詳細資訊，請參閱
        <a href="server-typed-auth.md#prerequisites">型別安全驗證說明文件</a>。
    </p>
</note>

`jwt()` 函式會為你選擇的 principal 型別建立方案。這裡沒有 `install(Authentication)` 步驟：該方案是一個值，你可以將其傳遞給需要的路由。

在 `validate` 內讀取你需要的宣告，並傳回自訂型別。接著路由處理常式便可使用該型別，而不是 `JWTPrincipal`：

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

設定 `jwt` 提供者後，你可以使用 **[authenticate](server-auth.md#authenticate-route)** 函式來保護應用程式中的特定資源。在驗證成功的情況下，你可以在路由處理常式內使用 `call.principal` 函式擷取已驗證的 [JWTPrincipal](https://api.ktor.io/ktor-server-auth-jwt/io.ktor.server.auth.jwt/-j-w-t-principal/index.html) 並取得 JWT 負載。在下方的範例中，擷取了自訂 `username` 宣告的值以及權杖到期時間。

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

將方案傳遞給 `authenticateWith()`。宣告已在 `validate` 中讀取，因此處理常式會使用自訂型別，且不需要 null 檢查：

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