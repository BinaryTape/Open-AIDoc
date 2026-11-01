[//]: # (title: 型別安全的工作階段驗證)

<show-structure for="chapter" depth="2"/>
<primary-label ref="experimental"/>

<var name="artifact_name" value="ktor-server-auth"/>

<tldr>
<p>
<b>必要的相依性</b>：<code>io.ktor:%artifact_name%</code>, <code>io.ktor:ktor-server-sessions</code>
</p>
</tldr>

<link-summary>
型別安全驗證機制 API 的 session 機制為路由提供非 null 的 principal，以及對儲存的工作階段之讀寫存取權限。
</link-summary>

`session` 機制是[型別安全驗證機制 API](server-typed-auth.md) 的一部分。它將具名提供者[工作階段驗證](server-session-auth.md)中結合在一起的兩件事區分開來：

* **工作階段 (session)** 是你為呼叫端儲存的值，例如存取權杖或使用者 ID。
* **principal** 是路由處理常式所處理的對象，例如完整的使用者記錄。

在受保護的路由內部，`call.session` 為你提供儲存的工作階段，而 `call.principal` 則提供 principal。兩者皆為非 null 且具有正確的型別。

<note>
    <p>
        型別安全驗證機制 API 為實驗性功能。它隨時可能被棄用或變更。
        需要明確選擇加入 (Opt-in)。若要了解更多詳細資訊，請參閱
        <a href="server-typed-auth.md#prerequisites">型別安全驗證文件</a>。
    </p>
</note>

## 建立工作階段機制 {id="create-scheme"}

`session<S, P>()` 工廠方法首先接收工作階段型別，其次接收 principal 型別。`validate` 區塊將工作階段轉換為 principal，或傳回 `null` 以拒絕該工作階段。

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

傳遞給 `authenticateWith()` 的處理常式會針對該路由覆寫此處理常式。如需完整的順序，請參閱[處理失敗](server-typed-auth.md#failures)。

## 選擇傳輸機制 {id="transport"}

`transport` 屬性控制工作階段如何在用戶端與伺服器之間傳輸：

| 傳輸機制 | 用戶端持有的內容 | 工作階段資料所在位置 |
|---------------------------------|------------------------------------|--------------------------------------|
| `SessionTransportType.CookieId` | Cookie 中的工作階段 ID | 在伺服器上的 `SessionStorage` 中 |
| `SessionTransportType.HeaderId` | 標頭中的工作階段 ID | 在伺服器上的 `SessionStorage` 中 |
| `SessionTransportType.Cookie`   | Cookie 中序列化的工作階段 | 在用戶端上 |
| `SessionTransportType.Header`   | 標頭中序列化的工作階段 | 在用戶端上 |

預設為由記憶體內部儲存支援的 `CookieId`，它會將工作階段資料保留在伺服器上：

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

`SessionStorageMemory` 在重新啟動時會遺失所有資料，且不會在執行個體之間共享，因此適合本機開發。在正式環境中，請使用持久化儲存空間，例如 `directorySessionStorage()` 或你自己的 `SessionStorage` 實作。

> `Cookie` 和 `Header` 傳輸機制會將工作階段值傳送給用戶端。該值代表呼叫者的身分，因此若缺乏保護，用戶端可以偽造它並以任何人的身分登入。如果你使用傳值 (by-value) 傳輸機制，請新增轉換器，例如 `SessionTransportTransformerEncrypt`：
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

工作階段機制透過 [Sessions](server-sessions.md) 外掛程式讀取工作階段，因此在任何路由使用該機制之前，必須先安裝此外掛程式。將該機制傳遞給 `install()`，Ktor 就會套用你所設定的傳輸機制：

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

你也可以將其安裝在單一路由子樹狀結構上：

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

如果你自行設定 `Sessions`，請在設定區塊內呼叫 `applyTransport()`，以確保該機制與外掛程式在名稱、型別和傳輸機制上保持一致：

```kotlin
install(Sessions) {
    sessionAuth.applyTransport()
    cookie<OtherSession>("other-session")
}
```

如果缺少該外掛程式，或者它沒有與該機制的名稱及工作階段型別相符的提供者，該機制會在啟動時失敗。

## 讀取與變更工作階段 {id="read-write"}

在受工作階段機制保護的路由內部，`call.session` 是一個可讀寫的屬性：

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

同一個區塊中可以使用以下存取子：

| 存取子 | 用途 |
|--------------------------|----------------------------------------------------------------------------|
| `call.session`           | 讀取或取代工作階段。 |
| `call.updateSession { }` | 讀取工作階段、套用你的變更、儲存結果並傳回。 |
| `call.clearSession()`    | 移除工作階段，將呼叫端登出。 |

當新值取決於舊值時，請使用 `updateSession`：

```kotlin
post("/increment") {
    val updated = call.updateSession {
        it.copy(visits = it.visits + 1)
    }
    call.respondText("Visits: ${updated.visits}")
}
```

在 `authenticateWithOptional()` 內部，可能完全沒有工作階段，因此 `call.session` 不可用。請改用 `call.sessionOrNull`：

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

機制上的 `setSession()` 和 `clearSession()` 可以在任何路由上運作，無論該路由是否受該機制保護。

登入功能應放在不受該機制保護的路由上。此時呼叫端尚未擁有工作階段，因此受保護的路由會在你的處理常式執行之前就拒絕該請求：

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

使用 `transformSession` 在 `validate` 執行之前、作為驗證的一部分來變更儲存的工作階段。這對於攜帶具時效性權杖的工作階段非常有用。

傳回要用於此請求的工作階段，或傳回 `null` 以拒絕請求。Ktor 僅在你傳回的值與傳入的值不同時，才會將工作階段寫回：

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

Cookie 傳輸機制會在每個請求中自動傳送工作階段，包括由其他網站發起的請求。使用 `csrfProtection {}` 區塊為此機制保護的路由安裝 [CSRF](https://api.ktor.io/ktor-server/ktor-server-plugins/ktor-server-csrf/io.ktor.server.plugins.csrf/-c-s-r-f.html) 外掛程式：

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

> 若要進一步了解角色、選用驗證以及 API 的其餘部分，請參閱[型別安全驗證](server-typed-auth.md)。
> 
> 如需使用 `Sessions` 外掛程式的詳細資訊，請參閱 [Sessions](server-sessions.md)。
> 
{style="tip"}