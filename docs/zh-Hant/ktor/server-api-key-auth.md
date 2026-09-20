[//]: # (title: API Key 驗證)

<show-structure for="chapter" depth="2"/>

<var name="artifact_name" value="ktor-server-auth-api-key"/>

<tldr>
<p>
<b>必要相依性</b>：<code>io.ktor:ktor-server-auth</code>, <code>io.ktor:%artifact_name%</code>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor 支援 Kotlin/Native，可讓您在沒有額外執行階段或虛擬機的情況下執行伺服器。">原生伺服器</Links> 支援</b>：✅
</p>
</tldr>

API Key 驗證是一種簡單的驗證方式，用戶端會在請求中傳遞一個私密金鑰（通常位於標頭中）。此金鑰同時作為識別碼與驗證機制。

Ktor 允許您使用 API Key 驗證來保護 [路由](server-routing.md) 並驗證用戶端請求。

> 您可以在 [Ktor Server 中的驗證與授權](server-auth.md) 章節中取得有關 Ktor 驗證的一般資訊。

> API Key 應保持私密並安全地傳輸。建議使用 [HTTPS/TLS](server-ssl.md) 來保護傳輸中的 API Key。
>
{style="note"}

## 新增相依性 {id="add_dependencies"}

若要啟用 API Key 驗證，請在建置指令碼中新增 `ktor-server-auth` 與 `%artifact_name%` 成員：

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">

```kotlin
implementation("io.ktor:%artifact_name%:$ktor_version")
implementation("io.ktor:ktor-server-auth:$ktor_version")
```
</TabItem>
<TabItem title="Gradle (Groovy)" group-key="groovy">

```Groovy
implementation "io.ktor:%artifact_name%:$ktor_version"
implementation "io.ktor:ktor-server-auth:$ktor_version"

```
</TabItem>

<TabItem title="Maven" group-key="maven">

```xml
<dependency>
    <groupId>io.ktor</groupId>
    <artifactId>%artifact_name%-jvm</artifactId>
    <version>${ktor_version}</version>
</dependency>
<dependency>
    <groupId>io.ktor</groupId>
    <artifactId>ktor-server-auth</artifactId>
    <version>${ktor_version}</version>
</dependency>
```

</TabItem>
</Tabs>

## API Key 驗證流程 {id="flow"}

API Key 驗證流程如下：

1. 用戶端向伺服器應用程式中的特定 [路由](server-routing.md) 發出請求，並在標頭（通常是 `X-API-Key`）中包含 API Key。
2. 伺服器使用自訂驗證邏輯來驗證 API Key。
3. 如果金鑰有效，伺服器將回傳請求的內容。如果金鑰無效或缺失，伺服器將回傳 `401 Unauthorized` 狀態。

## 安裝 API Key 驗證 {id="install"}

若要安裝 `apiKey` 驗證提供者，請在 `install(Authentication)` 區塊內呼叫 [`apiKey`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/api-key.html) 函式：

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
// ...
install(Authentication) {
    apiKey {
        // 設定 API Key 驗證
    }
}
```

您可以選擇性地指定一個 [供應者名稱](server-auth.md#provider-name)，用於 [驗證指定的路由](#authenticate-route)。

## 設定 API Key 驗證 {id="configure"}

在本節中，我們將查看 `apiKey` 驗證提供者的具體設定。

> 若要了解如何在 Ktor 中設定不同的驗證提供者，請參閱 [設定驗證](server-auth.md#configure)。

### 步驟 1：設定 API Key 提供者 {id="configure-provider"}

<Tabs group="auth-dsl">
<TabItem title="傳統" group-key="classic">

`apiKey` 驗證提供者透過 [`ApiKeyAuthenticationProvider.Config`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-api-key-authentication-provider/-config/index.html) 類別公開其設定。在下方的範例中，指定了以下設定：

* `validate` 函式接收從請求中擷取的 API Key，並在驗證成功時傳回 `Principal`，若驗證失敗則傳回 `null`。

這是一個最小範例：

```kotlin
data class AppPrincipal(val key: String) : Principal

install(Authentication) {
    apiKey {
        validate { keyFromHeader ->
            val expectedApiKey = "this-is-expected-key"
            keyFromHeader
                .takeIf { it == expectedApiKey }
                ?.let { AppPrincipal(it) }
        }
    }
}
```

</TabItem>
<TabItem title="型別安全" group-key="typed">

<note>
    <p>
        型別安全驗證方案 API 為實驗功能。它隨時可能被捨棄或變更。需要選擇加入（Opt-in）。如需更多詳細資訊，請參閱
        <a href="server-typed-auth.md#prerequisites">啟用 API</a>。
    </p>
</note>

`apiKey()` 函式會為您選擇的 principal 型別建立一個方案。不需要 `install(Authentication)` 步驟：該方案是一個值，您可以將其傳遞給需要它的路由。

```kotlin
data class AppPrincipal(val key: String)

val apiKeyAuth = apiKey<AppPrincipal>("api-key") {
    validate { keyFromHeader ->
        val expectedApiKey = "this-is-expected-key"
        keyFromHeader
            .takeIf { it == expectedApiKey }
            ?.let { AppPrincipal(it) }
    }
}
```

與傳統提供者不同，名稱是必填的。如需完整 API，請參閱 [型別安全驗證](server-typed-auth.md)。

</TabItem>
</Tabs>

#### 自訂金鑰位置 {id="key-location"}

預設情況下，`apiKey` 提供者會在 `X-API-Key` 標頭中尋找 API Key。

您可以使用 `headerName` 來指定自訂標頭：

<Tabs group="auth-dsl">
<TabItem title="傳統" group-key="classic">

```kotlin
apiKey("api-key-header") {
    headerName = "X-Secret-Key"
    validate { key ->
        // ...
    }
}
```

</TabItem>
<TabItem title="型別安全" group-key="typed">

```kotlin
val apiKeyAuth = apiKey<AppPrincipal>("api-key-header") {
    headerName = "X-Secret-Key"
    validate { key ->
        // ...
    }
}
```

</TabItem>
</Tabs>

### 步驟 2：驗證 API Key {id="validate"}

驗證邏輯取決於您的應用程式需求。以下是常見的方法：

#### 靜態金鑰比較 {id="static-key"}

對於簡單的情況，您可以與預定義的金鑰進行比較：

```kotlin
apiKey {
    validate { keyFromHeader ->
        val expectedApiKey = 
            environment.config.property("api.key").getString()
        keyFromHeader
            .takeIf { it == expectedApiKey }
            ?.let { AppPrincipal(it) }
    }
}
```

> 請將敏感的 API Key 儲存在設定檔或環境變數中，而非原始碼中。
>
{style="note"}

#### 資料庫查找 {id="database-lookup"}

對於多個 API Key，請針對資料庫進行驗證：

```kotlin
apiKey {
    validate { keyFromHeader ->
        // 在資料庫中查找金鑰
        val user = database.findUserByApiKey(keyFromHeader)
        user?.let { UserIdPrincipal(it.username) }
    }
}
```

#### 多重驗證標準 {id="multiple-criteria"}

您可以實作複雜的驗證邏輯：

```kotlin
apiKey {
    validate { keyFromHeader ->
        val apiKey = database.findApiKey(keyFromHeader)

        // 檢查金鑰是否存在、是否處於啟用狀態且未過期
        if (apiKey != null &&
            apiKey.isActive &&
            apiKey.expiresAt > Clock.System.now()
        ) {
            UserIdPrincipal(apiKey.userId)
        } else {
            null
        }
    }
}
```

### 步驟 3：設定質問 {id="challenge"}

您可以使用 `challenge` 函式自訂驗證失敗時傳送的回應：

```kotlin
apiKey {
    validate { key ->
        // 驗證邏輯
    }
    challenge { defaultScheme, realm ->
        call.respond(
            HttpStatusCode.Unauthorized,
            "Invalid or missing API key"
        )
    }
}
```

### 步驟 4：保護特定資源 {id="authenticate-route"}

<Tabs group="auth-dsl">
<TabItem title="傳統" group-key="classic">

設定好 `apiKey` 提供者後，您可以使用 [`authenticate`](server-auth.md#authenticate-route) 函式保護應用程式中的特定資源。在驗證成功的情況下，您可以在路由處理常式中使用 `call.principal` 函式擷取已驗證的 Principal。

```kotlin
routing {
    authenticate {
        get("/") {
            val principal = call.principal<AppPrincipal>()!!
            val key = principal.key
            call.respondText("Hello! Your key: $key")
        }
    }
}
```

</TabItem>
<TabItem title="型別安全" group-key="typed">

將該方案傳遞給 `authenticateWith()`。在區塊內，`call.principal` 為您的 principal 型別且絕不為 `null`，因此不需要 `!!`：

```kotlin
routing {
    authenticateWith(apiKeyAuth) {
        get("/") {
            val key = call.principal.key
            call.respondText("Hello! Your key: $key")
        }
    }
}
```

</TabItem>
</Tabs>

## API Key 驗證範例 {id="complete-example"}

這是一個 API Key 驗證的完整最小範例：

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

data class AppPrincipal(val key: String) : Principal

fun Application.module() {
    val expectedApiKey = "this-is-expected-key"

    install(Authentication) {
        apiKey {
            validate { keyFromHeader ->
                keyFromHeader
                    .takeIf { it == expectedApiKey }
                    ?.let { AppPrincipal(it) }
            }
        }
    }

    routing {
        authenticate {
            get("/") {
                val principal = call.principal<AppPrincipal>()!!
                call.respondText("Key: ${principal.key}")
            }
        }
    }
}
```

## 最佳實務 {id="best-practices"}

在實作 API Key 驗證時，請考慮以下最佳實務：

1. **使用 HTTPS**：務必透過 HTTPS 傳輸 API Key 以防止攔截。
2. **安全儲存**：切勿將 API Key 硬編碼在原始碼中。請使用環境變數或安全的設定管理工具。
3. **金鑰輪換**：實作定期輪換 API Key 的機制。
4. **速率限制**：將 API Key 驗證與速率限制相結合，以防止濫用。
5. **記錄**：記錄驗證失敗以進行安全性監控，但切勿記錄實際的 API Key。
6. **金鑰格式**：為 API Key 使用加密安全的隨機字串（例如 UUID 或 Base64 編碼的隨機位元組）。
7. **多重金鑰**：考慮為不同應用程式或用途支援每個使用者擁有多個 API Key。
8. **過期機制**：實作金鑰過期機制以增強安全性。