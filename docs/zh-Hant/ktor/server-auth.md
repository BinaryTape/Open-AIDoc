[//]: # (title: Ktor Server 中的身份驗證與授權)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="Authentication"/>
<var name="package_name" value="io.ktor.server.auth"/>
<var name="artifact_name" value="ktor-server-auth"/>

<tldr>
<p>
<b>必要的相依性</b>：<code>io.ktor:%artifact_name%</code>
</p>
</tldr>

<link-summary>
Authentication 外掛程式負責處理 Ktor 中的身份驗證與授權。
</link-summary>

Ktor 提供
[Authentication](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-authentication/index.html)
外掛程式來處理身份驗證與授權。典型使用案例包括登入使用者、授予對特定資源的存取權限，以及在各方之間安全地傳輸資訊。您也可以將 `Authentication`
與 [Sessions](server-sessions.md)（工作階段）搭配使用，以在請求之間保留使用者的資訊。

> 在用戶端，Ktor 提供了 [Authentication](client-auth.md) 外掛程式來處理身份驗證與授權。

## 支援的身份驗證類型 {id="supported"}
Ktor 支援以下身份驗證與授權配置：

### HTTP 身份驗證 {id="http-auth"}
HTTP 為存取控制和身份驗證提供了一個[通用架構](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication)。在 Ktor 中，您可以使用以下 HTTP 身份驗證機制：
* [Basic](server-basic-auth.md) - 使用 `Base64` 編碼來提供使用者名稱和密碼。若不與 HTTPS 結合使用，通常不建議使用。
* [Digest](server-digest-auth.md) - 一種透過對使用者名稱和密碼套用雜湊函式，以加密形式傳輸使用者憑據的身份驗證方法。
* [Bearer](server-bearer-auth.md) - 一種涉及稱為 bearer token（持票者權杖）的安全權杖身份驗證機制。
  Bearer 身份驗證機制通常作為 [OAuth](server-oauth.md) 或 [JWT](server-jwt.md) 的一部分使用，但您也可以為授權 bearer token 提供自訂邏輯。
* [API Key](server-api-key-auth.md) - 一種簡單的身份驗證方法，用戶端在標頭中傳遞秘密金鑰。

### 表單身份驗證 {id="form-auth"}
[表單身份驗證](server-form-based-auth.md)使用 [Web 表單](https://developer.mozilla.org/en-US/docs/Learn/Forms)來收集憑據資訊並驗證使用者身份。

### JSON Web Tokens (JWT) {id="jwt"}
[JSON Web Token](server-jwt.md) 是一種開放標準，用於將資訊作為 JSON 物件在各方之間安全地傳輸。您可以使用 JSON Web Token 進行授權：當使用者登入後，每個請求都將包含一個權杖，允許使用者存取該權杖所許可的資源。在 Ktor 中，您可以使用 `jwt` 身份驗證來驗證權杖並驗證其中包含的宣告（claims）。

### LDAP {id="ldap"}
[LDAP](server-ldap.md) 是一種用於目錄服務身份驗證的開放式跨平台協定。Ktor 提供 [ldapAuthenticate](https://api.ktor.io/ktor-server-auth-ldap/io.ktor.server.auth.ldap/ldap-authenticate.html) 函式，用於根據指定的 LDAP 伺服器驗證使用者憑據。

### OAuth {id="oauth"}
[OAuth](server-oauth.md) 是一種用於保護 API 存取權限的開放標準。Ktor 中的 `oauth` 提供者允許您使用外部提供者（如 Google、Facebook、Twitter 等）實作身份驗證。

### OpenID Connect {id="oidc"}

[OpenID Connect](server-oidc.md) 是建構在 OAuth 2.0 之上的身份識別層。`Oidc` 外掛程式會讀取提供者的探索文件（discovery document），因此您只需設定發行者 URL（issuer URL），而無需配置端點和簽章金鑰。它可以在 [API](server-oidc-resource-server.md) 中驗證存取權杖，並執行[瀏覽器登入](server-oidc-browser-login.md)，包括 PKCE、工作階段和登出。

該外掛程式為實驗功能，且僅在 JVM 上可用。

### Session {id="sessions"}
[Sessions](server-sessions.md)（工作階段）提供了一種在不同 HTTP 請求之間持久化資料的機制。典型使用案例包括儲存已登入使用者的 ID、購物車內容，或在用戶端保留使用者偏好。在 Ktor 中，已經擁有相關聯工作階段的使用者可以使用 `session` 提供者進行驗證。請從 [Ktor Server 中的 Session 身份驗證](server-session-auth.md)了解如何操作。

### 自訂 {id="custom"}

Ktor 提供兩種自訂身份驗證與授權行為的方式：

* 使用[自訂身份驗證提供者](#custom-auth-provider)。
* 使用[自訂外掛程式](server-custom-plugins.md)來實作授權邏輯。例如，您可以使用 `AuthenticationChecked` [hook](server-custom-plugins.md#call-handling) 來驗證存取權限。如需更多資訊，請參閱 [custom-plugin-authorization](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/custom-plugin-authorization) 範例。

## 型別安全身份驗證配置 API {id="type-safe"}

<primary-label ref="experimental"/>

Ktor 還提供了一個[型別安全身份驗證配置 API](server-typed-auth.md)，將配置與委託主體型別繫結。
在受保護的路由內部，`call.principal` 即為該委託主體型別，且保證為非 `null`，因此不需要型別轉換或 null 檢查。
該 API 還支援選擇性啟用的[角色檢查](server-typed-auth.md#roles)、[匿名備援](server-typed-auth.md#anonymous)、具型別的[工作階段](server-typed-session-auth.md)以及 [OAuth 2.0 流程](server-oauth2-flows.md)。

> 此 API 是本主題所述具名提供者方法的替代方案。
> 兩種 API 均可在同一個應用程式中使用。如需更多資訊，請參閱[型別安全身份驗證](server-typed-auth.md)。
>
{style="note"}

## 新增相依性 {id="add_dependencies"}

<p>
    要使用 <code>%plugin_name%</code>，您需要在組建指令碼中包含 <code>%artifact_name%</code> 構件：
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

請注意，某些身份驗證提供者（例如 [JWT](server-jwt.md) 和 [LDAP](server-ldap.md)）需要額外的構件。

## 安裝 Authentication {id="install"}

<p>
    若要將 <code>%plugin_name%</code> 外掛程式<a href="#install">安裝</a>到應用程式，請將其傳遞給指定<Links href="/ktor/server-modules" summary="Modules allow you to structure your application by grouping routes.">模組</Links>中的 <code>install</code> 函式。
    以下範例顯示了如何安裝 <code>%plugin_name%</code>：
</p>
<list>
    <li>
        在 <code>embeddedServer()</code> 函式呼叫內部。
    </li>
    <li>
        在 <code>Application</code> 類別上明確定義的 <code>module()</code> 擴充函式內部。
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

## 配置 Authentication {id="configure"}
[安裝 Authentication](#install) 後，您可以按照以下步驟配置並使用 `Authentication`：

### 步驟 1：選擇身份驗證提供者 {id="choose-provider"}

若要使用特定的身份驗證提供者，例如 [basic](server-basic-auth.md)、[digest](server-digest-auth.md) 或 [form](server-form-based-auth.md)，
您需要在 `install` 區塊內呼叫相應的函式。例如，要使用 basic 身份驗證，
請呼叫 [`.basic()`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/basic.html)
函式：

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
// ...
install(Authentication) {
    basic {
        // 配置 basic 身份驗證
    }
}
```

在此函式內，您可以[配置](#configure-provider)該提供者特定的設定。

> 如果內建提供者不符合您的需求，您可以實作[自訂身份驗證提供者](#custom-auth-provider)。
> 
{style="note"}

### 步驟 2：指定提供者名稱 {id="provider-name"}

[使用特定提供者](#choose-provider)的函式可以選擇指定提供者名稱。以下程式碼範例分別以 `"auth-basic"` 和 `"auth-form"` 名稱安裝了 [basic](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/basic.html) 和 [form](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/form.html) 提供者：

```kotlin
install(Authentication) {
    basic("auth-basic") {
        // 配置 basic 身份驗證
    }
    form("auth-form") {
        // 配置 form 身份驗證
    }
    // ...
}
```
{disable-links="false"}

這些名稱稍後可用於[使用不同提供者驗證不同路由](#authenticate-route)。
> 請注意，提供者名稱應該是唯一的，且您只能定義一個不帶名稱的提供者。
>
{style="note"}

### 步驟 3：配置提供者 {id="configure-provider"}

每個[提供者類型](#choose-provider)都有自己的配置。例如，
[`BasicAuthenticationProvider.Config`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-basic-authentication-provider/-config/index.html)
類別為 [`.basic()`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/basic.html) 函式提供選項。此類別中的關鍵函式是 [`validate()`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-basic-authentication-provider/-config/validate.html)，負責驗證使用者名稱和密碼。以下程式碼範例展示了其用法：

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

為了理解 `validate()` 函式的運作方式，我們需要引入兩個術語：

* **委託主體 (principal)** 是一個可以被驗證的實體：使用者、電腦、服務等。在 Ktor 中，各種身份驗證提供者可能會使用不同的委託主體。例如，`basic`、`digest` 和 `form` 提供者驗證 [`UserIdPrincipal`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-id-principal/index.html)，而 `jwt` 提供者驗證 [`JWTPrincipal`](https://api.ktor.io/ktor-server-auth-jwt/io.ktor.server.auth.jwt/-j-w-t-principal/index.html)。
  > 您也可以建立自訂委託主體。這在以下情況可能很有用：
  > - 將憑據映射到自訂委託主體，可讓您在[路由處理常式](#get-principal)中獲取有關已驗證委託主體的額外資訊。
  > - 如果您使用 [Session 身份驗證](server-session-auth.md)，委託主體可能是一個儲存工作階段資料的資料類別。
* **憑據 (credential)** 是伺服器用來驗證委託主體的一組屬性：使用者/密碼配對、API 金鑰等。例如，`basic` 和 `form` 提供者使用 [`UserPasswordCredential`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-password-credential/index.html) 來驗證使用者名稱和密碼，而 `jwt` 則驗證 [`JWTCredential`](https://api.ktor.io/ktor-server-auth-jwt/io.ktor.server.auth.jwt/-j-w-t-credential/index.html)。

因此，`validate()` 函式會檢查指定的憑據，並在驗證成功時傳回委託主體 `Any`，若驗證失敗則傳回 `null`。

> 若要根據特定標準跳過身份驗證，請使用 [`skipWhen()`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-authentication-provider/-config/skip-when.html)。例如，如果 [工作階段](server-sessions.md) 已存在，您可以跳過 `basic` 身份驗證：
> ```kotlin
> basic {
>     skipWhen { call -> call.sessions.get<UserSession>() != null }
> }

### 步驟 4：保護特定資源 {id="authenticate-route"}

最後一步是保護應用程式中的特定資源。您可以使用 [`authenticate()`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/authenticate.html) 函式來達成。此函式接受兩個選用參數：

- 用於驗證巢狀路由的[提供者名稱](#provider-name)。
  以下程式碼片段使用名為 _auth-basic_ 的提供者來保護 `/login` 和 `/orders` 路由：
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
- 用於解析巢狀身份驗證提供者的策略。
  此策略由 [`AuthenticationStrategy`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-authentication-strategy/index.html) 列舉值表示。

  例如，用戶端應為所有註冊為 `AuthenticationStrategy.Required` 策略的提供者提供身份驗證資料。
  在下面的程式碼片段中，只有通過 [Session 身份驗證](server-session-auth.md)的使用者才能嘗試使用 basic 身份驗證存取 `/admin` 路由：
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

> 如需完整範例，請參閱 [auth-form-session-nested](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-form-session-nested)。

### 步驟 5：在路由處理常式中獲取委託主體 {id="get-principal"}

身份驗證成功後，您可以在路由處理常式中使用 `call.principal()` 函式擷取已驗證的委託主體。此函式接受[已配置身份驗證提供者](#configure-provider)傳回的特定委託主體類型。在以下範例中，`call.principal()` 用於獲取 `UserIdPrincipal` 並取得已驗證使用者的名稱。

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

如果您使用 [Session 身份驗證](server-session-auth.md)，委託主體可能是一個儲存工作階段資料的資料類別。因此，您需要將此資料類別傳遞給 `call.principal()`：

```kotlin
authenticate("auth-session") {
    get("/hello") {
        val userSession = call.principal<UserSession>()
    }
}
```

在[巢狀身份驗證提供者](#authenticate-route)的情況下，您可以將[提供者名稱](#provider-name)傳遞給 `call.principal()`，以獲取所需提供者的委託主體。

在下面的範例中，傳遞了 `"auth-session"` 值來獲取最頂層 session 提供者的委託主體：

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

## 自訂身份驗證提供者 {id="custom-auth-provider"}

當內建提供者不符合您的需求時，請使用 [`provider()`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-authentication-config/provider.html) 函式實作自訂身份驗證邏輯：

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

在上述範例中，`provider("custom")` 函式註冊了一個具名的身份驗證提供者，稍後可以透過 `authenticate("custom")` 套用於路由。

在提供者內部，`authenticate {}` 區塊會針對每個傳入請求執行，並讓您透過內容物件完全控制身份驗證程序。這包括存取當前呼叫 (`context.call`)，以及檢查標頭、參數或其他請求資料的能力。

您可以使用 [`DynamicProviderConfig`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-dynamic-provider-config/index.html) 類別提供的選項來配置額外的提供者行為。