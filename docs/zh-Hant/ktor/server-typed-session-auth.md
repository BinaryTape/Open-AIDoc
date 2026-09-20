[//]: # (title: 型別安全的工作階段驗證)

<show-structure for="chapter" depth="2"/>
<primary-label ref="experimental"/>

<var name="artifact_name" value="ktor-server-auth"/>

<tldr>
<p>
<b>必要相依性</b>：<code>io.ktor:%artifact_name%</code>、<code>io.ktor:ktor-server-sessions</code>
</p>
</tldr>

<link-summary>
型別安全驗證方案 API 的 session 方案為路由提供了非 null 的 principal，以及對儲存的工作階段之讀寫存取權。
</link-summary>

`session` 方案是[型別安全驗證方案 API](server-typed-auth.md) 的一部分。它將具名提供者[工作階段驗證](server-session-auth.md)合併處理的兩件事分開：

* **工作階段 (session)** 是你為呼叫端儲存的值，例如存取權杖或使用者 ID。
* **principal** 則是路由處理常式所處理的對象，例如完整的使用者記錄。

在受保護的路由內部，`call.session` 可取得儲存的工作階段，而 `call.principal` 則可取得 principal。兩者皆為非 null 且具有正確的型別。

<note>
    <p>
        型別安全驗證方案 API 目前為實驗性功能。隨時可能被廢棄或變更。需要明確選擇加入 (Opt-in)。若需更多詳細資訊，請參閱<a href="server-typed-auth.md#prerequisites">啟用 API</a>。
    </p>
</note>

## 建立工作階段方案 {id="create-scheme"}

`session<S, P>()` 工廠函式第一個引數為工作階段型別，第二個為 principal 型別。`validate` 區塊可將工作階段轉換為 principal，或傳回 `null` 以拒絕該工作階段。

預設情況下，沒有有效工作階段的請求會收到 `401 Unauthorized`。對於瀏覽器應用程式，你可以改為將呼叫端重新導向至登入頁面。設定 `onUnauthorized` 處理常式以變更回應：

```kotlin
data class UserSession(val userId: String)
data class User(val id: String, val email: String)

val sessionAuth = session<UserSession, User>("auth-session") {
    validate { session ->
        userRepository.findById(session.userId)
    }
    onUnauthorized = {
        call.respondRedirect("/login")
    }
}
```

傳遞給 `authenticateWith()` 的處理常式會針對該路由覆寫此處理常式。如需完整的順序說明，請參閱[處理失敗情況](server-typed-auth.md#failures)。

## 選擇傳輸機制 {id="transport"}

`transport` 屬性控制工作階段如何在用戶端與伺服器之間傳遞：

| 傳輸機制 | 用戶端持有的內容 | 工作階段資料存放位置 |
|---------------------------------|------------------------------------|--------------------------------------|
| `SessionTransportType.CookieId` | Cookie 中的工作階段 ID | 伺服器端的 `SessionStorage` 中 |
| `SessionTransportType.HeaderId` | 標頭中的工作階段 ID | 伺服器端的 `SessionStorage` 中 |
| `SessionTransportType.Cookie` | Cookie 中已序列化的工作階段 | 用戶端 |
| `SessionTransportType.Header` | 標頭中已序列化的工作階段 | 用戶端 |

預設為由記憶體儲存支援的 `CookieId`，它將工作階段資料保留在伺服器上：

```kotlin
val storage = SessionStorageMemory()

val sessionAuth = session<UserSession, User>("auth-session") {
    transport = SessionTransportType.CookieId(storage) {
        cookie.path = "/"
        cookie.maxAgeInSeconds = 3600
        cookie.httpOnly = true
    }
    validate { session ->
        userRepository.findById(session.userId)
    }
}
```

`SessionStorageMemory` 在重新啟動時會遺失所有資料，且無法在執行個體之間共用，因此適合用於本機開發。在正式環境中，請使用持久化儲存（例如 `directorySessionStorage()`）或你自己的 `SessionStorage` 實作。

> `Cookie` 與 `Header` 傳輸機制會將工作階段的值傳送給用戶端。該值即為呼叫端的身分，因此若缺乏保護，用戶端可以偽造它並以任何人的身分登入。如果你使用傳值 (by-value) 的傳輸機制，請新增轉換器，例如 `SessionTransportTransformerEncrypt`：
> ```kotlin
> val transformer = SessionTransportTransformerEncrypt(
>     encryptKey, 
>     signKey
> )
> transport = SessionTransportType.Cookie {
>     transform(transformer)
> }
> ```
>
{style="warning"}

## 安裝 Sessions 外掛程式 {id="install-sessions"}

工作階段方案會透過 [Sessions](server-sessions.md) 外掛程式讀取工作階段，因此在任何路由使用該方案之前，必須先安裝此外掛程式。將方案傳遞給 `install()`，Ktor 就會套用你所設定的傳輸機制：

```kotlin
fun Application.module() {
    install(sessionAuth)

    routing {
        authenticateWith(sessionAuth) {
            get("/profile") {
                call.respondText(call.principal.email)
            }
        }
    }
}
```

你也可以將它安裝在單一路由子樹上：

```kotlin
routing {
    route("/app") {
        install(sessionAuth)

        authenticateWith(sessionAuth) {
            get("/profile") { /* ... */ }
        }
    }
}
```

如果你自行設定 `Sessions`，請在設定區塊內呼叫 `applyTransport()`，以確保方案與外掛程式在名稱、型別和傳輸機制上保持一致：

```kotlin
install(Sessions) {
    sessionAuth.applyTransport()
    cookie<OtherSession>("other-session")
}
```

如果缺少該外掛程式，或者外掛程式中沒有符合該方案名稱與工作階段型別的提供者，此方案會在啟動時失敗。

## 讀取與變更工作階段 {id="read-write"}

在受工作階段方案保護的路由內部，`call.session` 是一個可讀寫的屬性：

```kotlin
routing {
    authenticateWith(sessionAuth) {
        get("/profile") {
            val session = call.session
            call.respondText("Signed in as ${session.userId}")
        }

        post("/switch-team") {
            val teamId = call.receiveText()
            call.session = call.session.copy(teamId = teamId)
            call.respondText("Switched")
        }
    }
}
```

在同一個區塊中可以使用以下存取子：

| 存取子 | 用途 |
|--------------------------|----------------------------------------------------------------------------|
| `call.session` | 讀取或取代工作階段。 |
| `call.updateSession { }` | 讀取工作階段、套用變更、儲存結果並傳回。 |
| `call.clearSession()` | 移除工作階段，將呼叫端登出。 |

當新值取決於舊值時，請使用 `updateSession`：

```kotlin
post("/increment") {
    val updated = call.updateSession {
        it.copy(visits = it.visits + 1)
    }
    call.respondText("Visits: ${updated.visits}")
}
```

在 `authenticateWithOptional()` 內部，可能完全沒有工作階段，因此 `call.session` 無法使用。請改用 `call.sessionOrNull`：

```kotlin
routing {
    authenticateWithOptional(sessionAuth) {
        get("/greeting") {
            val message = when (call.sessionOrNull) {
                null -> "Hello, guest"
                else -> "Welcome back"
            }
            call.respondText(message)
        }
    }
}
```

## 讓使用者登入與登出 {id="login-logout"}

方案上的 `setSession()` 與 `clearSession()` 可在任何路由上運作，無論該路由是否受該方案保護。

登入邏輯應放置於不受該方案保護的路由上。此時呼叫端尚未擁有工作階段，因此受保護的路由會在你的處理常式執行之前就拒絕該請求：

```kotlin
routing {
    post("/login") {
        val credentials = call.receive<LoginRequest>()
        val user = userRepository.authenticate(credentials)
            ?: return@post call.respond(
                HttpStatusCode.Unauthorized
            )

        sessionAuth.setSession(UserSession(userId = user.id))
        call.respondText("Signed in")
    }

    post("/logout") {
        sessionAuth.clearSession()
        call.respondText("Signed out")
    }
}
```

## 在驗證期間更新工作階段 {id="transform-session"}

使用 `transformSession` 可以在 `validate` 執行之前，將已儲存的工作階段變更作為驗證的一部分。這對於包含到期權杖的工作階段非常有用。

傳回用於此請求的工作階段，或傳回 `null` 以拒絕該請求。僅當你傳回的值與傳入的值不同時，Ktor 才會將工作階段寫回：

```kotlin
val sessionAuth = session<UserSession, User>("auth-session") {
    transformSession { session ->
        if (session.expiresAt > Clock.System.now()) {
            session
        } else {
            tokenService.refresh(session.refreshToken)
        }
    }
    validate { session ->
        userRepository.findById(session.userId)
    }
}
```

## 新增 CSRF 防護 {id="csrf"}

Cookie 傳輸機制會在每次請求時自動傳送工作階段，包括由其他網站發起的請求。使用 `csrfProtection {}` 區塊為此方案保護的路由安裝 [CSRF](https://api.ktor.io/ktor-server/ktor-server-plugins/ktor-server-csrf/io.ktor.server.plugins.csrf/-c-s-r-f.html) 外掛程式：

```kotlin
val sessionAuth = session<UserSession, User>("auth-session") {
    csrfProtection {
        allowOrigin("https://app.example.com")
        originMatchesHost()
    }
    validate { session ->
        userRepository.findById(session.userId)
    }
}
```

> 若要進一步了解角色、可選驗證以及 API 的其餘部分，請參閱[型別安全驗證](server-typed-auth.md)。
> 
> 有關使用 `Sessions` 外掛程式的更多詳細資訊，請參閱 [Sessions](server-sessions.md)。
> 
{style="tip"}