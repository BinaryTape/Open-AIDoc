[//]: # (title: Ktor Server 中的工作階段驗證)

<show-structure for="chapter" depth="2"/>

<tldr>
<p>
<b>必要相依性</b>: <code>io.ktor:ktor-server-auth</code>, <code>io.ktor:ktor-server-sessions</code>
</p>
<var name="example_name" value="auth-form-session"/>
<p>
    <b>程式碼範例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor 支援 Kotlin/Native，允許您在不需要額外執行階段或虛擬機的情況下執行伺服器。">Native 伺服器</Links> 支援</b>: ✖️
</p>
</tldr>

[工作階段 (Session)](server-sessions.md) 提供了一種在不同 HTTP 請求之間保留資料的機制。常見的使用案例包括儲存已登入使用者的 ID、購物籃的內容，或在用戶端保留使用者偏好設定。 

在 Ktor 中，已具有關聯工作階段的使用者可以使用 `session` 提供者進行驗證。例如，當使用者第一次使用 [Web 表單](server-form-based-auth.md)登入時，您可以將使用者名稱儲存到 Cookie 工作階段中，並在後續請求中使用 `session` 提供者對此使用者進行授權。

> 您可以在 [Ktor Server 中的驗證與授權](server-auth.md)章節中取得關於 Ktor 驗證與授權的一般資訊。

> Ktor 還提供了一種型別安全的工作階段驗證配置。它為路由處理常式提供非 null 的 principal 以及對已儲存工作階段的讀寫存取權限，並將工作階段型別與 principal 型別分開。請參閱
> [型別安全的工作階段驗證](server-typed-session-auth.md)。
>
{style="tip"}

## 新增相依性 {id="add_dependencies"}
若要啟用 `session` 驗證，您需要在建置指令碼中包含以下構件：

* 新增用於使用工作階段的 `ktor-server-sessions` 相依性：

  <var name="artifact_name" value="ktor-server-sessions"/>
  <var name="ktor_version_catalog_name" value="ktorLibs.server.sessions"/>
  <Tabs group="languages">
      <TabItem title="Gradle (Kotlin)" group-key="kotlin">
          <code-block lang="Kotlin" code="              implementation(%ktor_version_catalog_name%)"/>
          <note>
              上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
              Ktor 版本目錄</a>來指定 Ktor 相依性。
          </note>
      </TabItem>
      <TabItem title="Gradle (Groovy)" group-key="groovy">
          <code-block lang="Groovy" code="              implementation %ktor_version_catalog_name%"/>
          <note>
              上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
              Ktor 版本目錄</a>來指定 Ktor 相依性。
          </note>
      </TabItem>
      <TabItem title="Maven" group-key="maven">
          <code-block lang="XML" code="              &lt;dependency&gt;&#10;                  &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                  &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                  &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;              &lt;/dependency&gt;"/>
      </TabItem>
  </Tabs>

* 新增用於驗證的 `ktor-server-auth` 相依性：

  <var name="artifact_name" value="ktor-server-auth"/>
  <var name="ktor_version_catalog_name" value="ktorLibs.server.auth"/>
  <Tabs group="languages">
      <TabItem title="Gradle (Kotlin)" group-key="kotlin">
          <code-block lang="Kotlin" code="              implementation(%ktor_version_catalog_name%)"/>
          <note>
              上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
              Ktor 版本目錄</a>來指定 Ktor 相依性。
          </note>
      </TabItem>
      <TabItem title="Gradle (Groovy)" group-key="groovy">
          <code-block lang="Groovy" code="              implementation %ktor_version_catalog_name%"/>
          <note>
              上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
              Ktor 版本目錄</a>來指定 Ktor 相依性。
          </note>
      </TabItem>
      <TabItem title="Maven" group-key="maven">
          <code-block lang="XML" code="              &lt;dependency&gt;&#10;                  &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                  &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                  &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;              &lt;/dependency&gt;"/>
      </TabItem>
  </Tabs>

## 工作階段驗證流程 {id="flow"}

使用工作階段的驗證流程可能會有所不同，取決於使用者在您的應用程式中如何進行驗證。讓我們看看它在[表單型驗證](server-form-based-auth.md)中的運作方式：

1. 用戶端向伺服器發送包含 Web 表單資料（包括使用者名稱與密碼）的請求。
2. 伺服器驗證用戶端傳送的憑據，將使用者名稱儲存到 Cookie 工作階段中，並回傳請求的內容以及包含使用者名稱的 Cookie。
3. 用戶端攜帶 Cookie 對受保護的資源發送後續請求。
4. 根據接收到的 Cookie 資料，Ktor 會檢查該使用者是否存在 Cookie 工作階段，並可選擇對接收到的工作階段資料執行額外驗證。在驗證成功的情況下，伺服器會回傳請求的內容。

## 安裝工作階段驗證 {id="install"}
若要安裝 `session` 驗證提供者，請在 `install` 區塊中以所需的工作階段型別呼叫 [session](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/session.html) 函式：

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.sessions.*
//...
install(Authentication) {
    session<UserSession> {
        // 設定工作階段驗證
    }
}
```

## 設定工作階段驗證 {id="configure"}

本節示範如何透過[表單型驗證](server-form-based-auth.md)對使用者進行驗證、將該使用者的資訊儲存到 Cookie 工作階段中，然後在後續請求中使用 `session` 提供者授權此使用者。

> 如需完整範例，請參閱
> [auth-form-session](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-form-session)。

### 步驟 1：建立資料類別 {id="data-class"}

首先，您需要建立一個用於儲存工作階段資料的資料類別：

```kotlin
@Serializable
data class UserSession(val name: String, val count: Int)
```

### 步驟 2：安裝並設定工作階段 {id="install-session"}

建立資料類別後，您需要安裝並設定 `Sessions` 外掛程式。以下範例安裝並設定具有指定 Cookie 路徑與過期時間的 Cookie 工作階段。

```kotlin
install(Sessions) {
    cookie<UserSession>("user_session") {
        cookie.path = "/"
        cookie.maxAgeInSeconds = 60
    }
}
```

> 若要進一步了解如何設定工作階段，請參閱[工作階段設定概觀](server-sessions.md#configuration_overview)。

### 步驟 3：設定工作階段驗證 {id="configure-session-auth"}

`session` 驗證提供者透過 [`SessionAuthenticationProvider.Config`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-session-authentication-provider/-config/index.html) 類別公開其設定。在以下範例中，指定了以下設定：

* `validate()` 函式會檢查[工作階段執行個體](#data-class)，並在驗證成功的情況下傳回型別為 `Any` 的 principal。
* `challenge()` 函式指定了驗證失敗時執行的操作。例如，您可以重新導向回登入頁面或傳送 [`UnauthorizedResponse`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-unauthorized-response/index.html)。

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

### 步驟 4：將使用者資料儲存於工作階段中 {id="save-session"}

若要將已登入使用者的資訊儲存到工作階段，請使用 [`call.sessions.set()`](server-sessions.md#use_sessions) 函式。

以下範例展示了使用 Web 表單的簡單驗證流程：

```kotlin
authenticate("auth-form") {
    post("/login") {
        val principal =
            call.principal<UserIdPrincipal>()
        val userName = principal?.name.toString()
        val session = UserSession(
            name = userName,
            count = 1
        )
        call.sessions.set(session)
        call.respondRedirect("/hello")
    }
}
```

> 有關表單型驗證流程的詳細資訊，請參閱[表單型驗證](server-form-based-auth.md)文件。

### 步驟 5：保護特定資源 {id="authenticate-route"}

設定好 `session` 提供者後，您可以使用 [`authenticate()`](server-auth.md#authenticate-route) 函式來保護應用程式中的特定資源。

驗證成功後，您可以在路由處理常式中使用 `call.principal()` 函式來擷取已驗證的 principal（在此例中為 [`UserSession`](#data-class) 執行個體）：

```kotlin
authenticate("auth-session") {
    get("/hello") {
        val userSession = call.principal<UserSession>()
        val next = userSession?.copy(
            count = userSession.count + 1
        )
        call.sessions.set(next)
        call.respondText(
            "Hello, ${userSession?.name}! " +
                "Visit count is ${userSession?.count}."
        )
    }
}
```

> 如需完整範例，請參閱
> [auth-form-session](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-form-session)。