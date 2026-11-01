[//]: # (title: 型別安全驗證)

<show-structure for="chapter" depth="2"/>
<primary-label ref="experimental"/>

<var name="artifact_name" value="ktor-server-auth"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.auth"/>

<tldr>
<p>
<b>必要相依性</b>：<code>io.ktor:%artifact_name%</code>
</p>
</tldr>

<link-summary>
型別安全驗證方案 API 將 principal 型別繫結至路由，讓您無需進行轉換或 null 檢查即可讀取非 null 的 principal。
</link-summary>

Ktor 提供了型別安全驗證方案 API，將驗證方案繫結至 principal 型別。您只需建立一次方案，將該方案傳遞給路由，便能在無需轉換或 null 檢查的情況下讀取 principal。

> 此 API 是 [`install(Authentication)`](server-auth.md) 做法的替代方案。這兩種 API 均可在同一個應用程式中使用，且您可以將使用其中一種 API 的路由巢狀嵌入使用另一種 API 的路由中。
> 
{style="tip"}

## 新增相依性 {id="add_dependencies"}

若要使用型別化驗證，請將 `ktor-server-auth` 構件新增至您的建置指令碼：

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

如果使用 `jwt` 方案，請新增 `ktor-server-auth-jwt` 構件：

<var name="artifact_name" value="ktor-server-auth-jwt"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.auth.jwt"/>
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

如果使用 `apiKey` 方案，請新增 `ktor-server-auth-api-key` 構件：

<var name="artifact_name" value="ktor-server-auth-api-key"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.auth.apiKey"/>
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

## 啟用此 API {id="prerequisites"}

此 API 標記為 `@ExperimentalKtorApi`，因此您必須選擇加入 (opt in)：

```kotlin
@OptIn(ExperimentalKtorApi::class)
fun Application.module() {
    // ...
}
```

路由建構函式使用 Kotlin [上下文參數 (context parameters)](https://kotlinlang.org/docs/context-parameters.html)。Kotlin 2.4.0 預設啟用上下文參數。若使用 Kotlin 2.2.x 或 2.3.x，請在建置指令碼中啟用它們：

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xcontext-parameters")
    }
}
```

## 定義 principal {id="principal"}

Principal 代表應用程式與已驗證呼叫者關聯的身分或其他資訊。Principal 型別必須為非 null。

```kotlin
data class User(
    val id: String,
    val email: String
)
```

## 建立方案 {id="create-scheme"}

每種驗證方法都提供一個工廠函式，該函式接受 principal 型別、名稱和設定區塊。`validate {}` 區塊會傳回您的 principal 型別，或在憑據被拒絕時傳回 `null`：

```kotlin
val jwtAuth = jwt<User>("my-jwt") {
    realm = "my-app"
    verifier(jwkProvider, issuer)
    validate { credential ->
        val payload = credential.payload
        User(
            id = payload.subject,
            email = payload.getClaim("email").asString()
        )
    }
}
```

此工廠會傳回一個值。將其儲存並傳遞給需要它的路由。

| 工廠函式 | 構件 | 備註 |
|-------------------------------------|----------------------------|-----------------------------------------|
| `basic<P>()` | `ktor-server-auth` | 請參閱 [Ktor Server 中的基本驗證](server-basic-auth.md) |
| `digest<P>()` | `ktor-server-auth` | 僅限 JVM。請參閱 [Ktor Server 中的摘要驗證](server-digest-auth.md) |
| `bearer<P>()` | `ktor-server-auth` | 請參閱 [Ktor Server 中的 Bearer 驗證](server-bearer-auth.md) |
| `form<P>()` | `ktor-server-auth` | 請參閱 [Ktor Server 中的表單驗證](server-form-based-auth.md) |
| `session<S, P>()` | `ktor-server-auth` | 請參閱[型別安全工作階段驗證](server-typed-session-auth.md) |
| `apiKey<P>()` | `ktor-server-auth-api-key` | 請參閱 [API 金鑰驗證](server-api-key-auth.md) |
| `jwt<P>()` | `ktor-server-auth-jwt` | 僅限 JVM。請參閱 [JSON Web Tokens](server-jwt.md) |
| `oauth2()`, `oauth2Session<P, S>()` | `ktor-server-auth` | 請參閱 [OAuth 2.0 流程](server-oauth2-flows.md) |

方案名稱必須是唯一的。如果您使用相同名稱建立了兩個不同的方案，當路由嘗試使用第二個方案時將會失敗。

## 保護路由 {id="protect-routes"}

若要保護路由，請將方案傳遞至 `authenticateWith()` 函式。在該區塊內部，`call.principal` 具有該方案所定義的 principal 型別，且保證為非 null：

```kotlin
routing {
    authenticateWith(jwtAuth) {
        get("/profile") {
            val user: User = call.principal
            call.respondText(user.email)
        }
    }
}
```

## 將驗證設為選用 {id="optional"}

當路由需要同時為已登入和匿名呼叫者提供服務時，請使用 `authenticateWithOptional()` 函式。在該區塊內部，使用 `call.principalOrNull` 來存取 principal：

```kotlin
routing {
    authenticateWithOptional(jwtAuth) {
        get("/me") {
            val user = call.principalOrNull
            call.respondText(user?.email ?: "anonymous")
        }
    }
}
```

不帶憑據的請求會成功，並使 `call.principalOrNull` 保持為 `null`。帶有無效憑據的請求仍會失敗。

## 接受多個方案 {id="any-of"}

使用 `authenticateWithAnyOf()` 函式在同一個路由上接受多個方案。Ktor 會依照您列出的順序嘗試各個方案，第一個成功的方案將提供 principal。

所有方案產生的 principal 必須符合您在呼叫時宣告的通用型別：

```kotlin
interface AppUser {
    val email: String
}

data class JwtUser(
    override val email: String,
    val id: String
) : AppUser

data class ApiUser(override val email: String) : AppUser

val jwtScheme = jwt<JwtUser>("my-jwt") { /* ... */ }
val apiKeyScheme = apiKey<ApiUser>("my-api-key") { /* ... */ }

routing {
    // AppUser is 
    authenticateWithAnyOf<AppUser>(jwtScheme, apiKeyScheme) {
        get("/profile") {
            call.respondText(call.principal.email)
        }
    }
}
```

> 在 `authenticateWithAnyOf()` 內部，僅有 `call.principal` 可用。屬於單一方案的額外功能（例如[工作階段方案](server-typed-session-auth.md)中的 `call.session`）則無法使用。
>
{style="note"}

## 允許匿名呼叫者 {id="anonymous"}

使用 `orAnonymous()` 函式建構一個為無憑據呼叫者提供服務的方案。不帶憑據的請求將取得您的區塊所傳回的 principal。帶有無效憑據的請求仍會失敗。

結果會是一個其 principal 型別為兩者之通用超型別 (common supertype) 的方案：

```kotlin
interface Identity

data class AuthenticatedUser(val id: String) : Identity
data class GuestUser(val label: String = "guest") : Identity

val feedAuth = jwt<AuthenticatedUser>("my-jwt") {
    verifier(jwkProvider, issuer)
    validate { credential ->
        AuthenticatedUser(credential.payload.subject)
    }
}.orAnonymous { GuestUser() }

routing {
    authenticateWith(feedAuth) {
        get("/feed") {
            when (val user = call.principal) {
                is AuthenticatedUser ->
                    call.respondText(user.id)
                is GuestUser ->
                    call.respondText(user.label)
            }
        }
    }
}
```

## 轉換 principal {id="map-principal"}

使用 `mapPrincipal()` 函式將 principal 轉換為另一種型別，例如從資料庫載入使用者記錄：

```kotlin
data class AppUser(val id: String, val email: String)

val appAuth = jwtAuth.mapPrincipal { jwtUser ->
    userDirectory.find(jwtUser.id)?.let { row ->
        AppUser(id = row.id, email = row.email)
    }
}
```

轉換僅在方案產生 principal 之後執行。如果轉換傳回 `null`，請求將會被拒絕並傳回 `401 Unauthorized`。

## 檢查角色 {id="roles"}

角色檢查為自選啟用 (opt-in)。定義實作 `AuthenticationRole` 的角色型別，然後使用 `withRoles()` 建構具備角色感知能力的方案：

```kotlin
enum class Role : AuthenticationRole {
    User, Admin, Moderator
}

val roleAuth = jwtAuth.withRoles { user ->
    roleService.resolveRoles(user.id)
}
```

`withRoles {}` 區塊會在每次驗證成功的請求中執行。您可以用它從資料庫、快取或 principal 本身載入角色。

使用 `roles` 參數宣告路由所需的角色：

```kotlin
routing {
    authenticateWith(roleAuth, roles = setOf(Role.Admin)) {
        get("/admin") {
            val userRoles: Set<Role> = call.principal.roles
            call.respondText(userRoles.joinToString { it.name })
        }
    }
}
```

通過驗證但缺少所需角色的呼叫者會收到 `403 Forbidden`。呼叫者必須具備集合中的所有角色，而非僅具備其中之一。

傳入 `roles = null` 可解析角色但不強制要求任何角色。這在處理常式自行做出判斷時非常有用：

```kotlin
authenticateWith(roleAuth, roles = null) {
    get("/dashboard") {
        if (Role.Admin in call.principal.roles) {
            call.respondText("admin view")
        } else {
            call.respondText("user view")
        }
    }
}
```

`roles` 屬性僅存在於具備角色感知能力的路由內部。在由一般方案保護的路由上，它將無法通過編譯。

## 處理失敗情況 {id="failures"}

可能發生兩種失敗情況，且它們是分開處理的：

* `onUnauthorized` 在驗證失敗時執行。預設回應為 `401 Unauthorized`。
* `onForbidden` 在驗證成功但呼叫者缺少所需角色時執行。預設回應為 `403 Forbidden`。

在方案上設定處理常式，以涵蓋使用該方案的每個路由：

```kotlin
val jwtAuth = jwt<User>("my-jwt") {
    verifier(jwkProvider, issuer)
    validate { credential -> /* ... */ }
    onUnauthorized = { cause ->
        val message = cause.toString()
        call.respond(HttpStatusCode.Unauthorized, message)
    }
}

val roleAuth = jwtAuth.withRoles(
    onForbidden = {
        val forbidden = HttpStatusCode.Forbidden
        call.respondText("Not allowed", status = forbidden)
    }
) { user ->
    roleService.resolveRoles(user.id)
}
```

或者在單一路由上設定處理常式，這將會覆寫方案層級的設定：

```kotlin
authenticateWith(
    roleAuth,
    roles = setOf(Role.Admin),
    onUnauthorized = { call.respondRedirect("/login") },
    onForbidden = {
        val forbidden = HttpStatusCode.Forbidden
        call.respondText("Admins only", status = forbidden)
    },
) {
    get("/admin") {
        call.respondText(call.principal.email)
    }
}
```

Ktor 依以下順序尋找未授權處理常式：

1. 傳遞給 `authenticateWith()` 的處理常式。
2. 在方案上設定的 `onUnauthorized` 處理常式。
3. 提供者的預設挑戰機制 (challenge)。

如果它們都未回應，請求將失敗並傳回 `401 Unauthorized`。

對於 `authenticateWithAnyOf()`，處理常式會接收一個將方案名稱對應至失敗原因的 Map，讓您可以回報每個方案失敗的原因：

```kotlin
authenticateWithAnyOf<AppUser>(
    jwtScheme,
    apiKeyScheme,
    onUnauthorized = { failures ->
        val schemes = failures.keys.joinToString()
        call.respond(HttpStatusCode.Unauthorized, schemes)
    }
) {
    get("/profile") { /* ... */ }
}
```

## 與傳統 API 結合 {id="mixing"}

這兩種驗證 API 均可在同一個應用程式中使用。您可以將型別安全路由巢狀嵌入由指定名稱的提供者 API 保護的路由中，或將基於提供者的路由巢狀嵌入型別安全路由中：

```kotlin
routing {
    authenticate("auth-session") {
        authenticateWith(basicAuth) {
            get("/admin") {
                val basicUser = call.principal
                val sessionUser = 
                    checkNotNull(call.principal<SessionUser>())
                if (basicUser.name == sessionUser.name) {
                    call.respondText("You are ${basicUser.name}!")
                } else {
                    call.respondText("Who are you?")
                }
            }
        }
    }

    authenticate(basicAuth.name) {
        get("/hello") {
            val user = checkNotNull(call.principal<BasicUser>())
            call.respondText("Hello ${user.name}!")
        }
    }
}
```

巢狀驗證層會依順序套用。

## 限制 {id="limitations"}

* 此 API 處於實驗階段。它可能會在次要版本中變更。
* 此 API 使用 Kotlin 上下文參數 (context parameters)，需要 Kotlin 2.4.0 或 `-Xcontext-parameters` 編譯器選項。
* `authenticateWithAnyOf()` 函式僅提供 `call.principal`。特定於方案的屬性（例如 `call.session`）在其中無法使用。
* 目前沒有與 LDAP 提供者等效的型別安全版本。請改為在型別化的 `validate {}` 區塊內部呼叫 [`ldapAuthenticate()`](server-ldap.md)。