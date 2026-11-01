[//]: # (title: Ktor Server 中的驗證與授權)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="Authentication"/>
<var name="package_name" value="io.ktor.server.auth"/>
<var name="artifact_name" value="ktor-server-auth"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.auth"/>

<tldr>
<p>
<b>必要相依性</b>：<code>io.ktor:%artifact_name%</code>
</p>
</tldr>

<link-summary>
Authentication 外掛程式負責處理 Ktor 中的驗證與授權。
</link-summary>

Ktor 提供了 [Authentication](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-authentication/index.html) 外掛程式來處理驗證與授權。常見的使用案例包括讓使用者登入、授予對特定資源的存取權限，以及在雙方之間安全地傳輸資訊。你也可以將 `Authentication` 與 [工作階段 (Sessions)](server-sessions.md) 搭配使用，以在不同請求之間保留使用者的資訊。

> 在用戶端上，Ktor 提供了 [Authentication](client-auth.md) 外掛程式來處理驗證與授權。

## 支援的驗證類型 {id="supported"}
Ktor 支援以下驗證與授權配置：

### HTTP 驗證 {id="http-auth"}
HTTP 提供了用於存取控制和驗證的[通用架構](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication)。在 Ktor 中，你可以使用以下 HTTP 驗證配置：
* [Basic](server-basic-auth.md) - 使用 `Base64` 編碼提供使用者名稱和密碼。若未與 HTTPS 結合使用，通常不建議採用。
* [Digest](server-digest-auth.md) - 一種透過對使用者名稱和密碼套用雜湊函式，以加密形式傳遞使用者憑據的驗證方法。
* [Bearer](server-bearer-auth.md) - 一種涉及稱為 Bearer 權杖的安全權杖的驗證配置。Bearer 驗證配置通常作為 [OAuth](server-oauth.md) 或 [JWT](server-jwt.md) 的一部分使用，但你也可以提供自訂邏輯來授權 Bearer 權杖。
* [API Key](server-api-key-auth.md) - 一種簡單的驗證方法，用戶端在標頭中傳遞秘密金鑰。

### 表單式驗證 {id="form-auth"}
[表單式](server-form-based-auth.md)驗證使用 [Web 表單](https://developer.mozilla.org/en-US/docs/Learn/Forms)來收集憑據資訊並驗證使用者。

### JSON Web Tokens (JWT) {id="jwt"}
[JSON Web Token](server-jwt.md) 是一種開放標準，用於以 JSON 物件在雙方之間安全地傳輸資訊。你可以使用 JSON Web Token 進行授權：當使用者登入後，每個請求都會包含一個權杖，允許使用者存取該權杖所允許的資源。在 Ktor 中，你可以使用 `jwt` 驗證來驗證權杖並檢驗其中包含的宣告（claims）。

### LDAP {id="ldap"}
[LDAP](server-ldap.md) 是一種開放且跨平台的通訊協定，用於目錄服務驗證。Ktor 提供了 [ldapAuthenticate](https://api.ktor.io/ktor-server-auth-ldap/io.ktor.server.auth.ldap/ldap-authenticate.html) 函式，用於針對指定的 LDAP 伺服器驗證使用者憑據。

### OAuth {id="oauth"}
[OAuth](server-oauth.md) 是一項用於保護 API 存取的開放標準。Ktor 中的 `oauth` 提供者允許你使用外部提供者（例如 Google、Facebook、Twitter 等）來實作驗證。

### OpenID Connect {id="oidc"}

[OpenID Connect](server-oidc.md) 是建置在 OAuth 2.0 之上的身分層。`Oidc` 外掛程式會讀取提供者的探索文件（discovery document），因此你只需設定發行者 URL，而無需手動設定端點和簽署金鑰。它可以在 [API](server-oidc-resource-server.md) 中驗證存取權杖，並執行[瀏覽器登入](server-oidc-browser-login.md)，包括 PKCE、工作階段以及登出。

此外掛程式為實驗功能，且僅在 JVM 上可用。

### Session {id="sessions"}
[工作階段 (Sessions)](server-sessions.md) 提供了一種在不同 HTTP 請求之間保留資料的機制。常見的使用案例包括儲存已登入使用者的 ID、購物車內容，或在用戶端保留使用者偏好設定。在 Ktor 中，已經擁有相關聯工作階段的使用者可以透過 `session` 提供者進行驗證。請參閱 [Ktor Server 中的工作階段驗證](server-session-auth.md)以了解如何執行此操作。

### 自訂 {id="custom"}

Ktor 提供了兩種自訂驗證和授權行為的方法：

* 使用[自訂驗證提供者](#custom-auth-provider)。
* 使用[自訂外掛程式](server-custom-plugins.md)來實作授權邏輯。例如，你可以使用 `AuthenticationChecked` [掛鉤](server-custom-plugins.md#call-handling)來驗證存取權限。如需更多資訊，請參閱 [custom-plugin-authorization](https://github.com/ktorio/ktor-documentation/blob/%ktor_version%/codeSnippets/snippets/custom-plugin-authorization) 範例。

## 型別安全的驗證配置 API {id="type-safe"}

<primary-label ref="experimental"/>

Ktor 還提供了[型別安全的驗證配置 API](server-typed-auth.md)，將配置繫結至主體型別。
在受保護的路由中，`call.principal` 即為主體型別，且保證為非 `null`，因此不需要進行轉換或 null 檢查。
該 API 還支援選擇性啟用的[角色檢查](server-typed-auth.md#roles)、[匿名備援](server-typed-auth.md#anonymous)、具型別的[工作階段](server-typed-session-auth.md)以及 [OAuth 2.0 流程](server-oauth2-flows.md)。

> 此 API 是本主題中所述具名提供者方法的替代方案。
> 兩種 API 可以在同一個應用程式中使用。如需更多資訊，請參閱[型別安全驗證](server-typed-auth.md)。
>
{style="note"}

## 新增相依性 {id="add_dependencies"}

<p>
    若要使用 <code>%plugin_name%</code>，請將 <code>%artifact_name%</code> 產物新增至你的建置指令碼：
</p>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor version catalog</a> 來指定 Ktor 相依性。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor version catalog</a> 來指定 Ktor 相依性。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

請注意，某些驗證提供者（例如 [JWT](server-jwt.md) 和 [LDAP](server-ldap.md)）需要額外的產物。

## 安裝 Authentication {id="install"}

<p>
    若要將 <code>%plugin_name%</code> 外掛程式<a href="server-plugins.md#install">安裝</a>至你的應用程式，
    請將其傳遞至指定<Links href="server-modules.md" summary="模組允許你透過對路由進行分組來組織應用程式的結構。">模組</Links>中的 <code>install</code> 函式。
    以下範例展示了如何安裝 <code>%plugin_name%</code>：
</p>
<list>
    <li>
        在 <code>embeddedServer()</code> 函式呼叫中。
    </li>
    <li>
        在 <code>Application</code> 類別上明確定義的 <code>module()</code> 擴充函式中。
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

## 設定 Authentication {id="configure"}
在[安裝 Authentication](#install) 之後，你可以按照以下方式設定並使用 `Authentication`：

### 步驟 1：選擇驗證提供者 {id="choose-provider"}

若要使用特定的驗證提供者，例如 [basic](server-basic-auth.md)、[digest](server-digest-auth.md) 或 [form](server-form-based-auth.md)，你需要在 `install` 區塊中呼叫對應的函式。例如，若要使用 basic 驗證，請呼叫 [`.basic()`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/basic.html) 函式：

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
// ...
install(Authentication) {
    basic {
        // 設定 basic 驗證
    }
}
```

在此函式中，你可以[進行設定](#configure-provider)專屬於此提供者的選項。

> 如果內建的提供者不符合你的需求，你可以實作[自訂驗證提供者](#custom-auth-provider)。
> 
{style="note"}

### 步驟 2：指定提供者名稱 {id="provider-name"}

用於[使用特定提供者](#choose-provider)的函式允許你選擇性地指定提供者名稱。以下程式碼範例分別使用 `"auth-basic"` 和 `"auth-form"` 名稱安裝 [basic](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/basic.html) 與 [form](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/form.html) 提供者：

```kotlin
install(Authentication) {
    basic("auth-basic") {
        // 設定 basic 驗證
    }
    form("auth-form") {
        // 設定 form 驗證
    }
    // ...
}
```
{disable-links="false"}

這些名稱稍後可用於使用不同的提供者來[驗證不同的路由](#authenticate-route)。
> 請注意，提供者名稱應是唯一的，且你只能定義一個未命名的提供者。
>
{style="note"}

### 步驟 3：設定提供者 {id="configure-provider"}

每個[提供者類型](#choose-provider)都有自己的設定。例如，[`BasicAuthenticationProvider.Config`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-basic-authentication-provider/-config/index.html) 類別為 [`.basic()`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/basic.html) 函式提供設定選項。此類別中的關鍵函式是 [`validate()`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-basic-authentication-provider/-config/validate.html)，負責驗證使用者名稱和密碼。以下程式碼範例展示了其用法：

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

若要了解 `validate()` 函式如何運作，我們需要介紹兩個術語：

* _主體 (Principal)_ 是一個可以被驗證的實體：使用者、電腦、服務等。在 Ktor 中，各種驗證提供者可能會使用不同的主體。例如，`basic`、`digest` 和 `form` 提供者驗證 [`UserIdPrincipal`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-id-principal/index.html)，而 `jwt` 提供者則驗證 [`JWTPrincipal`](https://api.ktor.io/ktor-server-auth-jwt/io.ktor.server.auth.jwt/-j-w-t-principal/index.html)。
  > 你也可以建立自訂主體。這在以下情況中可能會很有用：
  > - 將憑據對應至自訂主體，可讓你在[路由處理常式](#get-principal)內取得關於已驗證主體的其他資訊。
  > - 如果你使用[工作階段驗證](server-session-auth.md)，主體可以是一個儲存工作階段資料的資料類別。
* _憑據 (Credential)_ 是伺服器用於驗證主體的一組屬性：使用者名稱/密碼配對、API 金鑰等。例如，`basic` 和 `form` 提供者使用 [`UserPasswordCredential`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-password-credential/index.html) 來驗證使用者名稱和密碼，而 `jwt` 則驗證 [`JWTCredential`](https://api.ktor.io/ktor-server-auth-jwt/io.ktor.server.auth.jwt/-j-w-t-credential/index.html)。

因此，`validate()` 函式會檢查指定的憑據，在驗證成功時回傳主體 `Any`，若驗證失敗則回傳 `null`。

> 若要根據特定條件跳過驗證，請使用 [`skipWhen()`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-authentication-provider/-config/skip-when.html)。
> 例如，如果 [工作階段](server-sessions.md) 已存在，你可以跳過 `basic` 驗證：
> ```kotlin
> basic {
>     skipWhen { call -> call.sessions.get<UserSession>() != null }
> }

### 步驟 4：保護特定資源 {id="authenticate-route"}

最後一步是保護應用程式中的特定資源。你可以使用 [`authenticate()`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/authenticate.html) 函式來完成此操作。此函式接受兩個選用參數：

- 用於驗證巢狀路由的[提供者名稱](#provider-name)。
  以下程式碼片段使用名稱為 _auth-basic_ 的提供者來保護 `/login` 和 `/orders` 路由：
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
- 用於解析巢狀驗證提供者的策略。
  此策略由 [`AuthenticationStrategy`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-authentication-strategy/index.html) 列舉值表示。

  例如，用戶端應為所有使用 `AuthenticationStrategy.Required` 策略註冊的提供者提供驗證資料。
  在以下程式碼片段中，只有通過[工作階段驗證](server-session-auth.md)的使用者才能嘗試使用 basic 驗證存取 `/admin` 路由：
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

> 完整範例請參閱 [auth-form-session-nested](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-form-session-nested)。

### 步驟 5：在路由處理常式中取得主體 {id="get-principal"}

驗證成功後，你可以在路由處理常式中使用 `call.principal()` 函式擷取已驗證的主體。此函式接受由[已設定的驗證提供者](#configure-provider)回傳的特定主體型別。在以下範例中，`call.principal()` 用於取得 `UserIdPrincipal` 並獲取已驗證使用者的名稱。

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

如果你使用[工作階段驗證](server-session-auth.md)，主體可以是一個儲存工作階段資料的資料類別。
因此，你需要將此資料類別傳遞給 `call.principal()`：

```kotlin
authenticate("auth-session") {
    get("/hello") {
        val userSession = call.principal<UserSession>()
    }
}
```

在[巢狀驗證提供者](#authenticate-route)的情況下，你可以將[提供者名稱](#provider-name)傳遞給 `call.principal()`，以取得所需提供者的主體。

在以下範例中，傳遞了 `"auth-session"` 值以取得最頂層工作階段提供者的主體：

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

## 自訂驗證提供者 {id="custom-auth-provider"}

當內建提供者不符合你的需求時，請使用 [`provider()`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-authentication-config/provider.html) 函式來實作自訂驗證邏輯：

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

在上述範例中，`provider("custom")` 函式註冊了一個具名驗證提供者，稍後可以使用 `authenticate("custom")` 將其套用至路由。

在提供者內部，系統會對每個傳入請求執行 `authenticate {}` 區塊，並透過 context 物件讓你完全掌控驗證流程。這包括存取目前呼叫（`context.call`）以及檢查標頭、參數或其他請求資料的能力。

你可以使用 [`DynamicProviderConfig`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-dynamic-provider-config/index.html) 類別提供的選項來設定其他提供者行為。