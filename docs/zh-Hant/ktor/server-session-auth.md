[//]: # (title: Ktor Server 中的工作階段驗證 (Session authentication))

<show-structure for="chapter" depth="2"/>

<tldr>
<p>
<b>必要的相依性</b>：<code>io.ktor:ktor-server-auth</code>, <code>io.ktor:ktor-server-sessions</code>
</p>
<var name="example_name" value="auth-form-session"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor 支援 Kotlin/Native，可讓您在不使用額外執行階段或虛擬機的情況下執行伺服器。">原生伺服器 (Native server)</Links> 支援</b>：✖️
</p>
</tldr>

[工作階段 (Sessions)](server-sessions.md) 提供了一種在不同 HTTP 請求之間持久化資料的機制。典型的使用案例包括儲存已登入使用者的 ID、購物車內容，或在用戶端保留使用者偏好設定。 

在 Ktor 中，已經具有關聯工作階段的使用者可以使用 `session` 提供者進行驗證。例如，當使用者第一次使用 [Web 表單 (web form)](server-form-based-auth.md) 登入時，您可以將使用者名稱儲存到 cookie 工作階段中，並在後續請求中使用 `session` 提供者對該使用者進行授權。

> 您可以在 [Ktor Server 中的驗證與授權](server-auth.md) 章節中取得關於 Ktor 驗證與授權的一般資訊。

## 新增相依性 {id="add_dependencies"}
要啟用 `session` 驗證，您需要在組建指令碼中包含以下構件：

* 新增 `ktor-server-sessions` 相依性以使用工作階段：

  <var name="artifact_name" value="ktor-server-sessions"/>
  <Tabs group="languages">
      <TabItem title="Gradle (Kotlin)" group-key="kotlin">
          <code-block lang="Kotlin" code="              implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
      </TabItem>
      <TabItem title="Gradle (Groovy)" group-key="groovy">
          <code-block lang="Groovy" code="              implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
      </TabItem>
      <TabItem title="Maven" group-key="maven">
          <code-block lang="XML" code="              &lt;dependency&gt;&#10;                  &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                  &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                  &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;              &lt;/dependency&gt;"></code-block>
      </TabItem>
  </Tabs>

* 新增 `ktor-server-auth` 相依性以進行驗證：

  <var name="artifact_name" value="ktor-server-auth"/>
  <Tabs group="languages">
      <TabItem title="Gradle (Kotlin)" group-key="kotlin">
          <code-block lang="Kotlin" code="              implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
      </TabItem>
      <TabItem title="Gradle (Groovy)" group-key="groovy">
          <code-block lang="Groovy" code="              implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
      </TabItem>
      <TabItem title="Maven" group-key="maven">
          <code-block lang="XML" code="              &lt;dependency&gt;&#10;                  &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                  &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                  &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;              &lt;/dependency&gt;"></code-block>
      </TabItem>
  </Tabs>

## 工作階段驗證流程 {id="flow"}

工作階段的驗證流程可能會有所不同，具體取決於您的應用程式如何驗證使用者。讓我們看看使用 [表單型驗證 (form-based authentication)](server-form-based-auth.md) 時的情況：

1. 用戶端向伺服器發送包含 Web 表單資料（包括使用者名稱和密碼）的請求。
2. 伺服器驗證用戶端傳送的憑據，將使用者名稱儲存到 cookie 工作階段中，並回傳請求內容以及包含使用者名稱的 cookie。
3. 用戶端攜帶 cookie 對受保護資源發送後續請求。
4. 根據接收到的 cookie 資料，Ktor 會檢查該使用者是否存在 cookie 工作階段，並（選填）對接收到的工作階段資料執行額外驗證。如果驗證成功，伺服器將回傳請求的內容。

## 安裝工作階段驗證 {id="install"}
要安裝 `session` 驗證提供者，請在 `install` 區塊內呼叫 [session](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/session.html) 函式並指定所需的工作階段類型：

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.sessions.*
//...
install(Authentication) {
    session<UserSession> {
        // 配置工作階段驗證
    }
}
```

## 配置工作階段驗證 {id="configure"}

本節示範如何透過 [表單型驗證 (form-based authentication)](server-form-based-auth.md) 驗證使用者，將該使用者的資訊儲存到 cookie 工作階段中，然後在後續請求中使用 `session` 提供者對該使用者進行授權。

> 如需完整範例，請參閱
> [auth-form-session](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-form-session)。

### 步驟 1：建立資料類別 {id="data-class"}

首先，您需要建立一個用於儲存工作階段資料的資料類別：

```kotlin
@Serializable
data class UserSession(val name: String, val count: Int)
```

### 步驟 2：安裝與配置工作階段 {id="install-session"}

建立資料類別後，您需要安裝並配置 `Sessions` 外掛程式。下面的範例安裝並配置了一個具有指定 cookie 路徑 and 過期時間的 cookie 工作階段。

```kotlin
install(Sessions) {
    cookie<UserSession>("user_session") {
        cookie.path = "/"
        cookie.maxAgeInSeconds = 60
    }
}
```

> 若要進一步了解如何配置工作階段，請參閱 [工作階段配置概覽](server-sessions.md#configuration_overview)。

### 步驟 3：配置工作階段驗證 {id="configure-session-auth"}

`session` 驗證提供者透過 [`SessionAuthenticationProvider.Config`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-session-authentication-provider/-config/index.html) 類別公開其設定。在下面的範例中，指定了以下設定：

* `validate()` 函式會檢查 [工作階段執行個體](#data-class)，並在驗證成功時回傳一個 `Any` 型別的主體 (principal)。
* `challenge()` 函式指定驗證失敗時執行的操作。例如，您可以重導向回登入頁面或傳送 [`UnauthorizedResponse`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-unauthorized-response/index.html)。

```kotlin
install(Authentication) {
    session<UserSession>("auth-session") {
        validate { session ->
            if(session.name.startsWith("jet")) {
                session
            } else {
                null
            }
        }
        challenge {
            call.respondRedirect("/login")
        }
    }
}
```

### 步驟 4：在工作階段中儲存使用者資料 {id="save-session"}

要將已登入使用者的資訊儲存到工作階段中，請使用 [`call.sessions.set()`](server-sessions.md#use_sessions) 函式。

以下範例顯示了一個使用 Web 表單的簡單驗證流程：

```kotlin
authenticate("auth-form") {
    post("/login") {
        val userName = call.principal<UserIdPrincipal>()?.name.toString()
        call.sessions.set(UserSession(name = userName, count = 1))
        call.respondRedirect("/hello")
    }
}
```

> 關於表單型驗證流程的更多詳細資訊，請參閱 [表單型驗證](server-form-based-auth.md) 文件。

### 步驟 5：保護特定資源 {id="authenticate-route"}

配置好 `session` 提供者後，您可以使用 [`authenticate()`](server-auth.md#authenticate-route) 函式保護應用程式中的特定資源。

驗證成功後，您可以在路由處理常式中使用 `call.principal()` 函式取得已驗證的主體（在此範例中為 [`UserSession`](#data-class) 執行個體）：

```kotlin
authenticate("auth-session") {
    get("/hello") {
        val userSession = call.principal<UserSession>()
        call.sessions.set(userSession?.copy(count = userSession.count + 1))
        call.respondText("Hello, ${userSession?.name}! Visit count is ${userSession?.count}.")
    }
}
```

> 如需完整範例，請參閱
> [auth-form-session](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-form-session)。