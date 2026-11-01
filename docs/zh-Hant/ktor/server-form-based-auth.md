[//]: # (title: Ktor Server 中的表單式身分驗證)

<show-structure for="chapter" depth="2"/>

<var name="artifact_name" value="ktor-server-auth"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.auth"/>

<tldr>
<p>
<b>必要相依性</b>: <code>io.ktor:%artifact_name%</code>
</p>
<p>
<b>程式碼範例</b>:
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-form-html-dsl">auth-form-html-dsl</a>,
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-form-session">auth-form-session</a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor 支援 Kotlin/Native，可讓你在無需額外執行階段或虛擬機的情況下執行伺服器。">原生伺服器</Links> 支援</b>: ✅
</p>
</tldr>

表單式身分驗證使用 [Web 表單](https://developer.mozilla.org/en-US/docs/Learn/Forms)來收集憑據資訊並驗證使用者身分。
若要在 Ktor 中建立 Web 表單，你可以使用 [HTML DSL](server-html-dsl.md#html_response)，或者在 JVM [範本引擎](server-templating.md)（例如 FreeMarker、Velocity 等）中進行選擇。

> 鑑於使用表單式身分驗證時使用者名稱和密碼是以純文字傳遞，你需要使用 [HTTPS/TLS](server-ssl.md) 來保護機密資訊。

## 新增相依性 {id="add_dependencies"}
若要啟用 `form` 身分驗證，你需要在組建指令碼中包含 `%artifact_name%` 構件：

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目錄</a> 來指定 Ktor 相依性。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目錄</a> 來指定 Ktor 相依性。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## 表單式身分驗證流程 {id="flow"}

表單式身分驗證流程大致如下：

1. 未經身分驗證的用戶端向伺服器應用程式中的特定[路由](server-routing.md)發出請求。
2. 伺服器傳回一個至少包含 HTML 式 Web 表單的 HTML 頁面，提示使用者輸入使用者名稱和密碼。 
   > Ktor 允許你使用 [Kotlin DSL](server-html-dsl.md) 建構表單，或者你也可以在各種 JVM 範本引擎（例如 FreeMarker、Velocity 等）之間進行選擇。
3. 當使用者提交使用者名稱和密碼時，用戶端會向伺服器發送一個包含 Web 表單資料（其中包含使用者名稱和密碼）的請求。
   
   ```kotlin
   POST http://localhost:8080/login
   Content-Type: application/x-www-form-urlencoded
   
   username=jetbrains&password=foobar
   
   ```
   
   在 Ktor 中，你需要[指定參數名稱](#configure-provider)以用於擷取使用者名稱和密碼。

4. 伺服器[驗證](#configure-provider)用戶端傳送的憑據，並回應所請求的內容。

## 安裝表單身分驗證 {id="install"}
若要安裝 `form` 身分驗證提供者，請在 `install` 區塊內呼叫 [form](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/form.html) 函式：

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
// ...
install(Authentication) {
    form {
        // 設定表單身分驗證
    }
}
```

你可以選擇性指定一個[提供者名稱](server-auth.md#provider-name)，用於[驗證指定路由](#authenticate-route)。

## 設定表單身分驗證 {id="configure"}

### 步驟 1：設定表單提供者 {id="configure-provider"}

<Tabs group="auth-dsl">
<TabItem title="Named provider" group-key="classic">

`form` 身分驗證提供者透過 [FormAuthenticationProvider.Config](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-form-authentication-provider/-config/index.html) 類別公開其設定。在以下範例中，指定了以下設定：
* `userParamName` 和 `passwordParamName` 屬性指定用於擷取使用者名稱與密碼的參數名稱。
* `validate` 函式用於驗證使用者名稱和密碼。
  `validate` 函式會檢查 `UserPasswordCredential`，並在身分驗證成功時傳回 `UserIdPrincipal`，若驗證失敗則傳回 `null`。
* `challenge` 函式指定身分驗證失敗時要執行的操作。例如，你可以重新導向回登入頁面或傳送 [UnauthorizedResponse](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-unauthorized-response/index.html)。

```kotlin
install(Authentication) {
    form("auth-form") {
        userParamName = "username"
        passwordParamName = "password"
        validate { credentials ->
            val isValid = credentials.name == "jetbrains" &&
                credentials.password == "foobar"
            if (isValid) {
                UserIdPrincipal(credentials.name)
            } else {
                null
            }
        }
        challenge {
            val message = "Credentials are not valid"
            val status = HttpStatusCode.Unauthorized
            call.respond(status, message)
        }
    }
}
```

</TabItem>
<TabItem title="Type-safe" group-key="typed">

<note>
    <p>
        型別安全身分驗證方案 API 為實驗功能。它可能隨時被移除或變更。
        需要明確啟用（Opt-in）。如需更多詳細資訊，請參閱
        <a href="server-typed-auth.md#prerequisites">型別安全身分驗證文件</a>。
    </p>
</note>

`form()` 函式會為你所選擇的主體型別建立一個方案。不需要 `install(Authentication)`
步驟：該方案是一個值，你可以將其傳遞給需要的路由。

```kotlin
data class User(val name: String)

val formAuth = form<User>("auth-form") {
    usernameField = "username"
    passwordField = "password"
    validate { credentials ->
        val isValid = credentials.name == "jetbrains" &&
            credentials.password == "foobar"
        if (isValid) User(credentials.name) else null
    }
    onUnauthorized = {
        val message = "Credentials are not valid"
        call.respond(HttpStatusCode.Unauthorized, message)
    }
}
```

有兩個名稱與傳統提供者不同。表單欄位名稱是 `usernameField` 和 `passwordField`，而非
`userParamName` 和 `passwordParamName`。失敗處理常式是 `onUnauthorized`，而非 `challenge`。如需
完整的 API，請參閱[型別安全身分驗證](server-typed-auth.md)。

</TabItem>
</Tabs>

> 如同 `basic` 身分驗證，你也可以使用 [UserHashedTableAuth](server-basic-auth.md#validate-user-hash) 來驗證儲存在記憶體內部表格中的使用者，該表格保存了使用者名稱與密碼雜湊。

### 步驟 2：保護特定資源 {id="authenticate-route"}

<Tabs group="auth-dsl">
<TabItem title="Named provider" group-key="classic">

設定好 `form` 提供者後，你需要定義接收資料的 `post` 路由。
接著，將此路由加入到 **[authenticate](server-auth.md#authenticate-route)** 函式中。
身分驗證成功時，你可以在路由處理常式內使用 `call.principal` 函式擷取經過驗證的 [UserIdPrincipal](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-id-principal/index.html)，並取得該已驗證使用者的名稱。

```kotlin
routing {
    authenticate("auth-form") {
        post("/login") {
            val user = call.principal<UserIdPrincipal>()
            call.respondText("Hello, ${user?.name}!")
        }
    }
}
```

</TabItem>
<TabItem title="Type-safe" group-key="typed">

定義傳送表單資料的 `post` 路由，並將其包裝在 `authenticateWith()` 中。在此區塊內，
`call.principal` 是你的主體型別且絕不為 `null`：

```kotlin
routing {
    authenticateWith(formAuth) {
        post("/login") {
            call.respondText("Hello, ${call.principal.name}!")
        }
    }
}
```

</TabItem>
</Tabs>

你可以使用[工作階段身分驗證](server-session-auth.md)來儲存已登入使用者的 ID。
例如，當使用者首次使用 Web 表單登入時，你可以將使用者名稱儲存至 Cookie 工作階段中，並在後續請求中使用 `session` 提供者對該使用者進行授權。