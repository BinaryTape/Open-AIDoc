[//]: # (title: 工作階段 (Sessions))

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="Sessions"/>
<var name="package_name" value="io.ktor.server.sessions"/>
<var name="artifact_name" value="ktor-server-sessions"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.sessions"/>

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
    <b><Links href="server-native.md" summary="Ktor 支援 Kotlin/Native，並允許你在沒有額外執行階段或虛擬機的情況下執行伺服器。">原生伺服器</Links> 支援</b>：✅
</p>
</tldr>

<link-summary>
Sessions 外掛程式提供了一種在不同 HTTP 請求之間保留資料的機制。
</link-summary>

[%plugin_name%](https://api.ktor.io/ktor-server-sessions/io.ktor.server.sessions/-sessions.html) 外掛程式提供了一種在不同 HTTP 請求之間保留資料的機制。常見的使用案例包括儲存已登入使用者的 ID、購物車內容，或在用戶端保留使用者偏好設定。在 Ktor 中，你可以使用 Cookie 或自訂標頭來實作工作階段，選擇將工作階段資料儲存在伺服器上還是傳遞給用戶端，對工作階段資料進行簽名與加密等。

在本主題中，我們將介紹如何安裝 `%plugin_name%` 外掛程式、進行配置，以及在[路由處理常式](server-routing.md#define_route)中存取工作階段資料。

## 新增相依性 {id="add_dependencies"}
若要啟用對工作階段的支援，你需要在組建指令碼中包含 `%artifact_name%` 構件：

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

## 安裝 Sessions {id="install_plugin"}

<p>
    若要將 <code>%plugin_name%</code> 外掛程式<a href="server-plugins.md#install">安裝</a>至你的應用程式中，
    請在指定的 <Links href="server-modules.md" summary="模組允許你透過分組路由來結構化你的應用程式。">模組</Links> 中將其傳遞給 <code>install</code> 函式。
    以下範例示範如何安裝 <code>%plugin_name%</code>：
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
<p>
    <code>%plugin_name%</code> 外掛程式也可以<a href="server-plugins.md#install-route">安裝到特定路由</a>。
    如果你需要為不同的應用程式資源使用不同的 <code>%plugin_name%</code> 配置，這會非常有用。
</p>

## 工作階段配置概覽 {id="configuration_overview"}
若要配置 `%plugin_name%` 外掛程式，你需要執行以下步驟：
1. *[建立資料類別](#data_class)*：在配置工作階段之前，你需要建立一個用於儲存工作階段資料的 [資料類別 (data class)](https://kotlinlang.org/docs/data-classes.html)。
2. *[選擇如何在伺服器與用戶端之間傳遞資料](#cookie_header)*：使用 Cookie 或自訂標頭。Cookie 更適合純 HTML 應用程式，而自訂標頭則適用於 API。
3. *[選擇工作階段有效負載的儲存位置](#client_server)*：儲存在用戶端或伺服器上。你可以使用 Cookie/標頭值將序列化的工作階段資料傳遞給用戶端，也可以將有效負載儲存在伺服器上並僅傳遞工作階段識別碼。

   如果你想在伺服器上儲存工作階段有效負載，你可以*[選擇其儲存方式](#storages)*：儲存在伺服器記憶體中或資料夾中。你也可以實作自訂存儲來保存工作階段資料。
4. *[保護工作階段資料](#protect_session)*：為了保護傳遞給用戶端的敏感工作階段資料，你需要對工作階段有效負載進行簽名與加密。

配置 `%plugin_name%` 後，你可以在[路由處理常式](server-routing.md#define_route)中[取得並設定工作階段資料](#use_sessions)。

## 建立資料類別 {id="data_class"}

在配置工作階段之前，你需要建立一個用於儲存工作階段資料的 [資料類別 (data class)](https://kotlinlang.org/docs/data-classes.html)。
例如，下方的 `UserSession` 類別將用於儲存工作階段 ID 和頁面檢視次數：

```kotlin
@Serializable
data class UserSession(val id: String, val count: Int)
```

如果你打算使用多個工作階段，則需要建立多個資料類別。

## 傳遞工作階段資料：Cookie 與標頭 {id="cookie_header"}

### Cookie {id="cookie"}
若要使用 Cookie 傳遞工作階段資料，請在 `install(Sessions)` 區塊內呼叫帶有指定名稱和資料類別的 `cookie` 函式：
```kotlin
install(Sessions) {
    cookie<UserSession>("user_session")
}
```
在上述範例中，工作階段資料將透過新增至 `Set-Cookie` 標頭的 `user_session` 屬性傳遞給用戶端。你可以透過在 `cookie` 區塊中傳遞引數來配置其他 Cookie 屬性。例如，以下程式碼片段示範如何指定 Cookie 的路徑和過期時間：

```kotlin
install(Sessions) {
    cookie<UserSession>("user_session") {
        cookie.path = "/"
        cookie.maxAgeInSeconds = 10
    }
}
```

如果未明確公開所需的屬性，請使用 `extensions` 屬性。例如，你可以透過以下方式傳遞 `SameSite` 屬性：
```kotlin
install(Sessions) {
    cookie<UserSession>("user_session") {
        cookie.extensions["SameSite"] = "lax"
    }
}
```
若要進一步了解可用的配置設定，請參閱 [CookieConfiguration](https://api.ktor.io/ktor-server-sessions/io.ktor.server.sessions/-cookie-configuration/index.html)。

> 在將應用程式[部署](server-deployment.md)至正式環境之前，請確保將 `secure` 屬性設定為 `true`。這將強制僅透過[安全連線](server-ssl.md)傳輸 Cookie，並防止工作階段資料遭受 HTTPS 降級攻擊。
>
{type="warning"}

### 標頭 {id="header"}
若要使用自訂標頭傳遞工作階段資料，請在 `install(Sessions)` 區塊內呼叫帶有指定名稱和資料類別的 `header` 函式：

```kotlin
install(Sessions) {
    header<CartSession>("cart_session")
}
```

在上述範例中，工作階段資料將使用 `cart_session` 自訂標頭傳遞給用戶端。
在用戶端，你需要將此標頭附加到每個請求中以取得工作階段資料。

> 如果你使用 [CORS](server-cors.md) 外掛程式來處理跨來源請求，請將自訂標頭新增至 `CORS` 配置中，如下所示：
> ```kotlin
> install(CORS) {
>     allowHeader("cart_session")
>     exposeHeader("cart_session")
> }
> ```

### 僅在修改時傳送工作階段資料 {id="send_only_if_modified"}

預設情況下，Ktor 會在每個回應中傳送工作階段資料，即使資料未發生變更。

若要僅在工作階段資料被修改時才傳送，請在工作階段配置中啟用 `sendOnlyIfModified` 旗標：

```kotlin
install(Sessions) {
    cookie<MySession>("SESSION") {
        sendOnlyIfModified = true
    }
}
```

此選項適用於以 [Cookie](#cookie) 和[以標頭為基礎](#header)的工作階段。

## 儲存工作階段有效負載：用戶端與伺服器 {id="client_server"}

在 Ktor 中，你可以透過兩種方式管理工作階段資料：
- _在用戶端和伺服器之間傳遞工作階段資料_。
   
  如果僅將工作階段名稱傳遞給 [cookie 或 header](#cookie_header) 函式，則工作階段資料將在用戶端和伺服器之間傳遞。在這種情況下，你需要[簽名並加密](#protect_session)工作階段有效負載，以保護傳遞給用戶端的敏感工作階段資料。
- _在伺服器上儲存工作階段資料，並僅在用戶端和伺服器之間傳遞工作階段 ID_。
   
  在這種情況下，你可以選擇有效負載在伺服器上的[儲存位置](#storages)。例如，你可以將工作階段資料儲存在記憶體中、指定的資料夾中，或者實作自己的自訂存儲。

## 在伺服器上儲存工作階段有效負載 {id="storages"}

Ktor 允許你在[伺服器上](#client_server)儲存工作階段資料，並僅在伺服器與用戶端之間傳遞工作階段 ID。在此情況下，你可以選擇有效負載在伺服器上的保存位置。

### 記憶體內儲存 {id="in_memory_storage"}
[SessionStorageMemory](https://api.ktor.io/ktor-server-sessions/io.ktor.server.sessions/-session-storage-memory/index.html) 允許在記憶體中儲存工作階段內容。此存儲會在伺服器執行期間保留資料，一旦伺服器停止就會捨棄資訊。例如，你可以如下在伺服器記憶體中儲存 Cookie：

```kotlin
cookie<CartSession>("cart_session", SessionStorageMemory()) {
}
```

你可以在此處找到完整的範例：[session-cookie-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/session-cookie-server)。

> 請注意，`SessionStorageMemory` 僅適用於開發環境。

### 目錄儲存 {id="directory_storage"}

[directorySessionStorage](https://api.ktor.io/ktor-server-sessions/io.ktor.server.sessions/directory-session-storage.html) 可用於將工作階段資料儲存在指定目錄下的檔案中。例如，若要將工作階段資料儲存在 `build/.sessions` 目錄下的檔案中，請依此方式建立 `directorySessionStorage`：
```kotlin
header<CartSession>("cart_session", directorySessionStorage(File("build/.sessions"))) {
}
```

你可以在此處找到完整的範例：[session-header-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/session-header-server)。

### 自訂儲存 {id="custom_storage"}

Ktor 提供了 [SessionStorage](https://api.ktor.io/ktor-server-sessions/io.ktor.server.sessions/-session-storage/index.html) 介面，可讓你實作自訂存儲。
```kotlin
interface SessionStorage {
    suspend fun invalidate(id: String)
    suspend fun write(id: String, value: String)
    suspend fun read(id: String): String
}
```
這三個函式都是[掛起函式 (suspending function)](https://kotlinlang.org/docs/composing-suspending-functions.html)。你可以將 [SessionStorageMemory](https://github.com/ktorio/ktor/blob/main/ktor-server/ktor-server-plugins/ktor-server-sessions/common/src/io/ktor/server/sessions/SessionStorageMemory.kt) 作為參考。

## 保護工作階段資料 {id="protect_session"}

### 對工作階段資料進行簽名 {id="sign_session"}

對工作階段資料進行簽名可以防止工作階段內容被修改，但允許使用者檢視該內容。
若要簽名工作階段，請將簽名金鑰傳遞給 `SessionTransportTransformerMessageAuthentication` 建構函式，並將此執行個體傳遞給 `transform` 函式：

```kotlin
install(Sessions) {
    val secretSignKey = "6819b57a326945c1968f45236589".hexToByteArray()
    cookie<CartSession>("cart_session", SessionStorageMemory()) {
        cookie.path = "/"
        transform(SessionTransportTransformerMessageAuthentication(secretSignKey))
    }
}
```

`SessionTransportTransformerMessageAuthentication` 預設使用 `HmacSHA256` 作為驗證演算法，此演算法可以變更。

### 對工作階段資料進行簽名與加密 {id="sign_encrypt_session"}

對工作階段資料進行簽名與加密可以防止讀取和修改工作階段內容。
若要簽名並加密工作階段，請將簽名/加密金鑰傳遞給 `SessionTransportTransformerEncrypt` 建構函式，並將此執行個體傳遞給 `transform` 函式：

```kotlin
install(Sessions) {
    val secretEncryptKey = "00112233445566778899aabbccddeeff".hexToByteArray()
    val secretSignKey = "6819b57a326945c1968f45236589".hexToByteArray()
    cookie<UserSession>("user_session") {
        cookie.path = "/"
        cookie.maxAgeInSeconds = 10
        transform(SessionTransportTransformerEncrypt(secretEncryptKey, secretSignKey))
    }
}
```

> 請注意，[加密方法已在 Ktor 版本 `3.0.0` 中更新](migrating-3.md#session-encryption-method-update)。
> 如果你正在從較早版本進行遷移，請在 `SessionTransportTransformerEncrypt` 的建構函式中使用 `backwardCompatibleRead` 屬性，
> 以確保與現有工作階段相容。
>
{style="note"}

預設情況下，`SessionTransportTransformerEncrypt` 使用 `AES` 和 `HmacSHA256` 演算法，這些演算法可以變更。

> 請注意，簽名/加密金鑰不應在程式碼中寫死指定。你可以使用[組態檔案](server-configuration-file.topic#configuration-file-overview)中的自訂群組來儲存簽名/加密金鑰，並使用[環境變數](server-configuration-file.topic#environment-variables)對其進行初始化。
>
{type="warning"}

## 取得與設定工作階段內容 {id="use_sessions"}
若要為特定[路由](server-routing.md)設定工作階段內容，請使用 `call.sessions` 屬性。`set` 方法允許你建立新的工作階段執行個體：

```kotlin
get("/login") {
    call.sessions.set(UserSession(id = "123abc", count = 0))
    call.respondRedirect("/user")
}
```

若要取得工作階段內容，你可以呼叫 `get`，並傳入已註冊的工作階段型別作為型別參數：

```kotlin
get("/user") {
    val userSession = call.sessions.get<UserSession>()
    if (userSession != null) {
}
```

若要修改工作階段（例如累加計數器），你需要呼叫資料類別的 `copy` 方法：

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

當你因任何原因需要清除工作階段時（例如使用者登出時），請呼叫 `clear` 函式：

```kotlin
get("/logout") {
    call.sessions.clear<UserSession>()
    call.respondRedirect("/user")
}
```

你可以在此處找到完整的範例：[session-cookie-client](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/session-cookie-client)。

## 延遲擷取工作階段 {id="deferred-session-retrieval"}

預設情況下，Ktor 會為每個包含工作階段的請求嘗試從存儲中讀取工作階段，而不管
該路由是否實際需要它。這種行為可能會導致不必要的開銷 —— 特別是在使用自訂工作階段存儲的應用程式中。

你可以透過啟用 `io.ktor.server.sessions.deferred` 系統屬性來延遲工作階段的載入：

```kotlin
System.setProperty("io.ktor.server.sessions.deferred", "true")
```

## 範例 {id="examples"}

以下可執行的範例示範了如何使用 `%plugin_name%` 外掛程式：

- [session-cookie-client](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/session-cookie-client) 示範如何使用 [Cookie](#cookie) 將[已簽名與加密](#sign_encrypt_session)的工作階段有效負載傳遞給[用戶端](#client_server)。
- [session-cookie-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/session-cookie-server) 示範如何將工作階段有效負載保存在[伺服器記憶體](#in_memory_storage)中，並使用 [Cookie](#cookie) 將[已簽名](#sign_session)的工作階段 ID 傳遞給用戶端。
- [session-header-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/session-header-server) 示範如何將工作階段有效負載保存在伺服器的[目錄儲存](#directory_storage)中，並使用[自訂標頭](#header)將[已簽名](#sign_session)的工作階段 ID 傳遞給用戶端。