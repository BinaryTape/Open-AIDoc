[//]: # (title: Ktor Server 中的表單驗證)

<show-structure for="chapter" depth="2"/>

<var name="artifact_name" value="ktor-server-auth"/>

<tldr>
<p>
<b>必要的相依性</b>：<code>io.ktor:%artifact_name%</code>
</p>
<p>
<b>程式碼範例</b>：
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-form-html-dsl">auth-form-html-dsl</a>、
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-form-session">auth-form-session</a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor 支援 Kotlin/Native，允許您在不使用額外執行階段或虛擬機的情況下執行伺服器。">Native 伺服器</Links> 支援</b>：✅
</p>
</tldr>

表單驗證使用 [Web 表單](https://developer.mozilla.org/en-US/docs/Learn/Forms) 來收集憑據資訊並對使用者進行驗證。
若要在 Ktor 中建立 Web 表單，您可以使用 [HTML DSL](server-html-dsl.md#html_response) 或在 JVM [範本引擎](server-templating.md)（如 FreeMarker、Velocity 等）中進行選擇。

> 鑒於使用表單驗證時，使用者名稱和密碼是以明文形式傳遞，您需要使用 [HTTPS/TLS](server-ssl.md) 來保護敏感資訊。

## 新增相依性 {id="add_dependencies"}
若要啟用 `form` 驗證，您需要在組建指令碼中包含 `%artifact_name%` 構件：

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"></code-block>
    </TabItem>
</Tabs>

## 表單驗證流程 {id="flow"}

表單驗證流程如下所示：

1. 未經驗證的用戶端向伺服器應用程式中的特定 [路由](server-routing.md) 發送請求。
2. 伺服器傳回一個 HTML 頁面，其中至少包含一個 HTML Web 表單，提示使用者輸入使用者名稱和密碼。 
   > Ktor 允許您使用 [Kotlin DSL](server-html-dsl.md) 建置表單，或者您也可以在各種 JVM 範本引擎（如 FreeMarker、Velocity 等）中進行選擇。
3. 當使用者提交使用者名稱和密碼時，用戶端會向伺服器發送一個包含 Web 表單資料（包括使用者名稱 and 密碼）的請求。
   
   ```kotlin
   POST http://localhost:8080/login
   Content-Type: application/x-www-form-urlencoded
   
   username=jetbrains&password=foobar
   
   ```
   
   在 Ktor 中，您需要[指定參數名稱](#configure-provider)，用於獲取使用者名稱和密碼。

4. 伺服器[驗證](#configure-provider)用戶端發送的憑據並回應所請求的內容。

## 安裝表單驗證 {id="install"}
若要安裝 `form` 驗證提供者，請在 `install` 區塊內呼叫 [form](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/form.html) 函式：

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
// ...
install(Authentication) {
    form {
        // 設定表單驗證
    }
}
```

您可以選擇性地指定一個 [提供者名稱](server-auth.md#provider-name)，用於[驗證指定的路由](#authenticate-route)。

## 設定表單驗證 {id="configure"}

### 步驟 1：設定表單提供者 {id="configure-provider"}
`form` 驗證提供者透過 [FormAuthenticationProvider.Config](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-form-authentication-provider/-config/index.html) 類別公開其設定。在下面的範例中，指定了以下設定：
* `userParamName` 和 `passwordParamName` 屬性指定了用於獲取使用者名稱和密碼的參數名稱。
* `validate` 函式負責驗證使用者名稱和密碼。
  `validate` 函式會檢查 `UserPasswordCredential`，並在驗證成功時傳回 `UserIdPrincipal`，如果驗證失敗則傳回 `null`。
* `challenge` 函式指定了驗證失敗時執行的操作。例如，您可以重新導向回登入頁面或傳送 [UnauthorizedResponse](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-unauthorized-response/index.html)。

```kotlin
install(Authentication) {
    form("auth-form") {
        userParamName = "username"
        passwordParamName = "password"
        validate { credentials ->
            if (credentials.name == "jetbrains" && credentials.password == "foobar") {
                UserIdPrincipal(credentials.name)
            } else {
                null
            }
        }
        challenge {
            call.respond(HttpStatusCode.Unauthorized, "Credentials are not valid")
        }
    }
}
```

> 至於 `basic` 驗證，您也可以使用 [UserHashedTableAuth](server-basic-auth.md#validate-user-hash) 來驗證儲存在記憶體表格中的使用者，該表格保存了使用者名稱和密碼雜湊值。

### 步驟 2：保護特定資源 {id="authenticate-route"}

設定好 `form` 提供者後，您需要定義一個用於接收資料的 `post` 路由。
然後，將此路由加入 **[authenticate](server-auth.md#authenticate-route)** 函式中。
在驗證成功的情況下，您可以使用 `call.principal` 函式在路由處理常式中獲取已驗證的 [UserIdPrincipal](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-id-principal/index.html)，並獲取已驗證使用者的名稱。

```kotlin
routing {
    authenticate("auth-form") {
        post("/login") {
            call.respondText("Hello, ${call.principal<UserIdPrincipal>()?.name}!")
        }
    }
}
```

您可以使用 [Session 驗證](server-session-auth.md) 來儲存已登入使用者的 ID。
例如，當使用者第一次使用 Web 表單登入時，您可以將使用者名稱儲存到 Cookie 工作階段中，並在後續請求中使用 `session` 提供者對該使用者進行授權。