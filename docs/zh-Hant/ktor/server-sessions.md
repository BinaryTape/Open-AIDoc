[//]: # (title: Sessions)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="Sessions"/>
<var name="package_name" value="io.ktor.server.sessions"/>
<var name="artifact_name" value="ktor-server-sessions"/>

<tldr>
<p>
<b>必要相依性</b>：<code>io.ktor:%artifact_name%</code>
</p>
<p><b>程式碼範例</b>：
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/session-cookie-client">session-cookie-client</a>、
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/session-cookie-server">session-cookie-server</a>、
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/session-header-server">session-header-server</a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor 支援 Kotlin/Native，允許您在沒有額外執行階段或虛擬機的情況下執行伺服器。">原生伺服器</Links> 支援</b>：✅
</p>
</tldr>

<link-summary>
Sessions 外掛程式提供了一種在不同 HTTP 請求之間持久化資料的機制。
</link-summary>

[%plugin_name%](https://api.ktor.io/ktor-server-sessions/io.ktor.server.sessions/-sessions.html) 外掛程式提供了一種在不同 HTTP 請求之間持久化資料的機制。典型的使用案例包括儲存已登入使用者的 ID、購物車內容，或在用戶端保留使用者偏好設定。在 Ktor 中，您可以使用 cookie 或自訂 header 來實作 session，並選擇將 session 資料儲存在伺服器端或傳遞給用戶端，還能對 session 資料進行簽名與加密等操作。

在本主題中，我們將探討如何安裝 `%plugin_name%` 外掛程式、進行配置，以及如何在 [路由處理常式](server-routing.md#define_route) 中存取 session 資料。

## 新增相依性 {id="add_dependencies"}
若要啟用對於 sessions 的支援，您需要在建置指令碼中包含 `%artifact_name%` 構件：

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

## 安裝 Sessions {id="install_plugin"}

<p>
    若要將 <code>%plugin_name%</code> 外掛程式<a href="#install">安裝</a>至應用程式，
    請將其傳遞給指定 <Links href="/ktor/server-modules" summary="模組允許您透過分組路由來組織應用程式結構。">模組</Links> 中的 <code>install</code> 函式。
    下方的程式碼片段展示了如何安裝 <code>%plugin_name%</code> ...
</p>
<list>
    <li>
        ... 在 <code>embeddedServer</code> 函式呼叫內。
    </li>
    <li>
        ... 在明確定義的 <code>module</code> 內，該模組是 <code>Application</code> 類別的擴充函式。
    </li>
</list>
<Tabs>
    <TabItem title="embeddedServer">
        <code-block lang="kotlin" code="            import io.ktor.server.engine.*&#10;            import io.ktor.server.netty.*&#10;            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;&#10;            fun main() {&#10;                embeddedServer(Netty, port = 8080) {&#10;                    install(%plugin_name%)&#10;                    // ...&#10;                }.start(wait = true)&#10;            }"></code-block>
    </TabItem>
    <TabItem title="module">
        <code-block lang="kotlin" code="            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;            // ...&#10;            fun Application.module() {&#10;                install(%plugin_name%)&#10;                // ...&#10;            }"></code-block>
    </TabItem>
</Tabs>
<p>
    <code>%plugin_name%</code> 外掛程式也可以<a href="#install-route">安裝到特定的路由</a>。
    如果您需要針對不同的應用程式資源使用不同的 <code>%plugin_name%</code> 配置，這會非常有用。
</p>

## Session 配置概覽 {id="configuration_overview"}
若要配置 `%plugin_name%` 外掛程式，您需要執行以下步驟：
1. *[建立資料類別](#data_class)*：在配置 session 之前，您需要建立一個 [資料類別](https://kotlinlang.org/docs/data-classes.html) 來儲存 session 資料。
2. *[選擇如何在伺服器與用戶端之間傳遞資料](#cookie_header)*：使用 cookie 或自訂 header。Cookie 較適合純 HTML 應用程式，而自訂 header 則適用於 API。
3. *[選擇 session 內容 (payload) 的存儲位置](#client_server)*：儲存在用戶端或伺服器端。您可以使用 cookie/header 值將序列化的 session 資料傳遞給用戶端，或者將內容儲存在伺服器端並僅傳遞 session 識別碼。

   如果您想將 session 內容儲存在伺服器端，可以 *[選擇存儲方式](#storages)*：儲存在伺服器記憶體中或資料夾中。您也可以實作自訂存儲來保留 session 資料。
4. *[保護 session 資料](#protect_session)*：為了保護傳遞給用戶端的敏感 session 資料，您需要對 session 內容進行簽名與加密。

配置好 `%plugin_name%` 後，您可以在 [路由處理常式](server-routing.md#define_route) 中 [取得與設定 session 資料](#use_sessions)。

## 建立資料類別 {id="data_class"}

在配置 session 之前，您需要建立一個 [資料類別](https://kotlinlang.org/docs/data-classes.html) 用於儲存 session 資料。
例如，下方的 `UserSession` 類別將用於儲存 session ID 和頁面瀏覽次數：

```kotlin
@Serializable
data class UserSession(val id: String, val count: Int)
```

如果您打算使用多個 session，則需要建立多個資料類別。

## 傳遞 session 資料：Cookie vs Header {id="cookie_header"}

### Cookie {id="cookie"}
若要使用 cookie 傳遞 session 資料，請在 `install(Sessions)` 區塊中呼叫 `cookie` 函式，並指定名稱與資料類別：
```kotlin
install(Sessions) {
    cookie<UserSession>("user_session")
}
```
在上述範例中，session 資料將透過新增至 `Set-Cookie` header 的 `user_session` 屬性傳遞給用戶端。您可以透過在 `cookie` 區塊內傳遞其他 cookie 屬性來進行配置。例如，下方的程式碼片段展示了如何指定 cookie 的路徑與過期時間：

```kotlin
install(Sessions) {
    cookie<UserSession>("user_session") {
        cookie.path = "/"
        cookie.maxAgeInSeconds = 10
    }
}
```

如果需要的屬性沒有明確公開，請使用 `extensions` 屬性。例如，您可以透過以下方式傳遞 `SameSite` 屬性：
```kotlin
install(Sessions) {
    cookie<UserSession>("user_session") {
        cookie.extensions["SameSite"] = "lax"
    }
}
```
若要進一步了解可用的配置設定，請參閱 [CookieConfiguration](https://api.ktor.io/ktor-server-sessions/io.ktor.server.sessions/-cookie-configuration/index.html)。

> 在將應用程式 [部署](server-deployment.md) 到正式環境之前，請確保 `secure` 屬性設定為 `true`。這能確保僅透過 [安全連線](server-ssl.md) 傳輸 cookie，並保護 session 資料免受 HTTPS 降級攻擊。
>
{type="warning"}

### Header {id="header"}
若要使用自訂 header 傳遞 session 資料，請在 `install(Sessions)` 區塊中呼叫 `header` 函式，並指定名稱與資料類別：

```kotlin
install(Sessions) {
    header<CartSession>("cart_session")
}
```

在上述範例中，session 資料將透過 `cart_session` 自訂 header 傳遞給用戶端。
在用戶端，您需要在每個請求中附加此 header 以獲取 session 資料。

> 如果您使用 [CORS](server-cors.md) 外掛程式來處理跨來源請求，請將您的自訂 header 新增至 `CORS` 配置中，如下所示：
> ```kotlin
> install(CORS) {
>     allowHeader("cart_session")
>     exposeHeader("cart_session")
> }
> ```

## 存儲 session 內容：用戶端 vs 伺服器端 {id="client_server"}

在 Ktor 中，您可以透過兩種方式管理 session 資料：
- _在用戶端與伺服器端之間傳遞 session 資料_。
   
  如果您僅將 session 名稱傳遞給 [cookie 或 header](#cookie_header) 函式，session 資料將在用戶端與伺服器端之間傳遞。在這種情況下，您需要對 session 內容進行 [簽名與加密](#protect_session)，以保護傳遞給用戶端的敏感 session 資料。
- _將 session 資料儲存在伺服器端，並僅在用戶端與伺服器端之間傳遞 session ID_。
   
  在這種情況下，您可以選擇 session 內容在伺服器上的 [存儲位置](#storages)。例如，您可以將 session 資料儲存在記憶體、指定的資料夾中，或者實作您自己的自訂存儲。

## 在伺服器端儲存 session 內容 {id="storages"}

Ktor 允許您 [在伺服器端](#client_server) 儲存 session 資料，並僅在伺服器與用戶端之間傳遞 session ID。在這種情況下，您可以選擇在伺服器上的何處保留內容。

### 記憶體存儲 {id="in_memory_storage"}
[SessionStorageMemory](https://api.ktor.io/ktor-server-sessions/io.ktor.server.sessions/-session-storage-memory/index.html) 允許將 session 內容儲存在記憶體中。此存儲會在伺服器執行期間保留資料，一旦伺服器停止，資訊就會被捨棄。例如，您可以按如下方式將 cookie 儲存在伺服器記憶體中：

```kotlin
cookie<CartSession>("cart_session", SessionStorageMemory()) {
}
```

您可以在此處找到完整範例：[session-cookie-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/session-cookie-server)。

> 請注意，`SessionStorageMemory` 僅供開發使用。

### 目錄存儲 {id="directory_storage"}

[directorySessionStorage](https://api.ktor.io/ktor-server-sessions/io.ktor.server.sessions/directory-session-storage.html) 可用於將 session 資料儲存在指定目錄下的檔案中。例如，若要將 session 資料儲存在 `build/.sessions` 目錄下的檔案中，請以此方式建立 `directorySessionStorage`：
```kotlin
header<CartSession>("cart_session", directorySessionStorage(File("build/.sessions"))) {
}
```

您可以在此處找到完整範例：[session-header-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/session-header-server)。

### 自訂存儲 {id="custom_storage"}

Ktor 提供了 [SessionStorage](https://api.ktor.io/ktor-server-sessions/io.ktor.server.sessions/-session-storage/index.html) 介面，允許您實作自訂存儲。
```kotlin
interface SessionStorage {
    suspend fun invalidate(id: String)
    suspend fun write(id: String, value: String)
    suspend fun read(id: String): String
}
```
這三個函式都是 [掛起函式](https://kotlinlang.org/docs/composing-suspending-functions.html)。您可以參考 [SessionStorageMemory](https://github.com/ktorio/ktor/blob/main/ktor-server/ktor-server-plugins/ktor-server-sessions/common/src/io/ktor/server/sessions/SessionStorageMemory.kt) 作為實作參考。

## 保護 session 資料 {id="protect_session"}

### 對 session 資料進行簽名 {id="sign_session"}

對 session 資料進行簽名可以防止修改 session 內容，但仍允許使用者查看該內容。
若要對 session 進行簽名，請將簽名金鑰傳遞給 `SessionTransportTransformerMessageAuthentication` 建構函式，並將此執行個體傳遞給 `transform` 函式：

```kotlin
install(Sessions) {
    val secretSignKey = hex("6819b57a326945c1968f45236589")
    cookie<CartSession>("cart_session", SessionStorageMemory()) {
        cookie.path = "/"
        transform(SessionTransportTransformerMessageAuthentication(secretSignKey))
    }
}
```

`SessionTransportTransformerMessageAuthentication` 預設使用 `HmacSHA256` 作為驗證演算法，此設定可以更改。 

### 對 session 資料進行簽名與加密 {id="sign_encrypt_session"}

對 session 資料進行簽名與加密可以防止讀取及修改 session 內容。
若要對 session 進行簽名與加密，請將簽名/加密金鑰傳遞給 `SessionTransportTransformerEncrypt` 建構函式，並將此執行個體傳遞給 `transform` 函式：

```kotlin
install(Sessions) {
    val secretEncryptKey = hex("00112233445566778899aabbccddeeff")
    val secretSignKey = hex("6819b57a326945c1968f45236589")
    cookie<UserSession>("user_session") {
        cookie.path = "/"
        cookie.maxAgeInSeconds = 10
        transform(SessionTransportTransformerEncrypt(secretEncryptKey, secretSignKey))
    }
}
```

> 請注意，[加密方法已在 Ktor 3.0.0 版本中更新](migrating-3.md#session-encryption-method-update)。如果您是從舊版本遷移，請在 `SessionTransportTransformerEncrypt` 的建構函式中使用 `backwardCompatibleRead` 屬性，以確保與現有 session 的相容性。
>
{style="note"}

預設情況下，`SessionTransportTransformerEncrypt` 使用 `AES` 和 `HmacSHA256` 演算法，這些都可以更改。 

> 請注意，簽名/加密金鑰不應在程式碼中指定。您可以在 [配置檔案](server-configuration-file.topic#configuration-file-overview) 中使用自訂組別來儲存簽名/加密金鑰，並使用 [環境變數](server-configuration-file.topic#environment-variables) 來初始化它們。
>
{type="warning"}

## 取得與設定 session 內容 {id="use_sessions"}
若要為特定 [路由](server-routing.md) 設定 session 內容，請使用 `call.sessions` 屬性。`set` 方法允許您建立一個新的 session 執行個體：

```kotlin
get("/login") {
    call.sessions.set(UserSession(id = "123abc", count = 0))
    call.respondRedirect("/user")
}
```

若要取得 session 內容，您可以呼叫 `get` 並接收其中一個已註冊的 session 型別作為型別參數：

```kotlin
get("/user") {
    val userSession = call.sessions.get<UserSession>()
    if (userSession != null) {
}
```

若要修改 session（例如增加計數器），您需要呼叫資料類別的 `copy` 方法：

```kotlin
get("/user") {
    val userSession = call.sessions.get<UserSession>()
    if (userSession != null) {
        call.sessions.set(userSession.copy(count = userSession.count + 1))
        call.respondText("Session ID is ${userSession.id}. Reload count is ${userSession.count}.")
    } else {
        call.respondText("Session doesn't exist or is expired.")
    }
}
```

當您出於任何原因需要清除 session 時（例如當使用者登出時），請呼叫 `clear` 函式：

```kotlin
get("/logout") {
    call.sessions.clear<UserSession>()
    call.respondRedirect("/user")
}
```

您可以在此處找到完整範例：[session-cookie-client](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/session-cookie-client)。

## 延遲獲取 session

預設情況下，Ktor 會嘗試為每個包含 session 的請求從存儲中讀取 session，而不論路由是否真的需要它。這種行為可能會導致不必要的開銷——尤其是在使用自訂 session 存儲的應用程式中。

您可以透過啟用 `io.ktor.server.sessions.deferred` 系統屬性來延遲載入 session：

```kotlin
System.setProperty("io.ktor.server.sessions.deferred", "true")
```

## 範例 {id="examples"}

下方的可執行範例展示了如何使用 `%plugin_name%` 外掛程式：

- [session-cookie-client](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/session-cookie-client) 展示了如何使用 [cookie](#cookie) 將 [簽名且加密](#sign_encrypt_session) 的 session 內容傳遞給 [用戶端](#client_server)。
- [session-cookie-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/session-cookie-server) 展示了如何將 session 內容保留在 [伺服器記憶體](#in_memory_storage) 中，並使用 [cookie](#cookie) 將 [簽名過的](#sign_session) session ID 傳遞給用戶端。
- [session-header-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/session-header-server) 展示了如何將 session 內容儲存在伺服器端的 [目錄存儲](#directory_storage) 中，並使用 [自訂 header](#header) 將 [簽名過的](#sign_session) session ID 傳遞給用戶端。