[//]: # (title: Ktor Client 中的 Bearer 身分驗證)

<show-structure for="chapter" depth="3"/>

<tldr>
<p>
<b>必要相依性</b>：<code>io.ktor:ktor-client-auth</code>
</p>
<var name="example_name" value="client-auth-oauth-google"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

Bearer 身分驗證使用稱為 _bearer 權杖 (bearer tokens)_ 的安全性權杖。這些權杖通常用於 OAuth 2.0 流程中，透過 Google、Facebook 和 X 等外部提供者對使用者進行授權。

你可以在 [Ktor 伺服器文件的 OAuth 授權流程章節](server-oauth.md#flow)中進一步了解 OAuth 流程。

> 在伺服器端，Ktor 提供 [Authentication](server-bearer-auth.md) 外掛程式來處理 Bearer 身分驗證。

## 新增相依性 {id="add_dependencies"}

若要啟用身分驗證，請在組建指令碼中包含 `ktor-client-auth` 產物：

<var name="artifact_name" value="ktor-client-auth"/>
<var name="ktor_version_catalog_name" value="ktorLibs.client.auth"/>
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
<tip>
    若要進一步了解 Ktor 用戶端所需的產物，請參閱 <Links href="client-dependencies.md" summary="了解如何將用戶端相依性新增至現有專案。">新增用戶端相依性</Links>。
</tip>

## 設定 Bearer 身分驗證 {id="configure"}

Ktor 用戶端允許你使用 `Bearer` 配置在 `Authorization` 標頭中傳送權杖。你也可以定義在權杖過期時重新整理權杖的邏輯。

若要設定 Bearer 身分驗證，請安裝 `Auth` 外掛程式並設定 `bearer` 提供者：

```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.auth.*
//...
val client = HttpClient(CIO) {
   install(Auth) {
      bearer {
         // 設定 Bearer 身分驗證
      }
   }
}
```

### 載入權杖 {id="load-tokens"}

使用 `loadTokens {}` 回呼提供初始的存取權杖與重新整理權杖。通常，此回呼會從本機存儲載入快取的權杖，並將其作為 `BearerTokens` 執行個體傳回。

```kotlin
install(Auth) {
   bearer {
       loadTokens {
           // 從本機存儲載入權杖並將其作為 'BearerTokens' 執行個體傳回
           BearerTokens("abc123", "xyz111")
       }
   }
}
```

在此範例中，用戶端會在 `Authorization` 標頭中傳送 `abc123` 存取權杖：

```HTTP
GET http://localhost:8080/
Authorization: Bearer abc123
```

### 重新整理權杖 {id="refresh-tokens"}

使用 `refreshTokens {}` 回呼來定義當目前的存取權杖失效時，用戶端該如何取得新權杖：

```kotlin
install(Auth) {
   bearer {
       // 載入權杖 ...
       refreshTokens { // this: RefreshTokensParams
           // 重新整理權杖並將其作為 'BearerTokens' 執行個體傳回
           BearerTokens("def456", "xyz111")
       }
   }
}
```
   
重新整理流程如下：
   
1. 用戶端使用無效的存取權杖向受保護的資源發出請求。
2. 資源伺服器傳回 `401 Unauthorized` 回應。
3. 用戶端自動叫用 `refreshTokens {}` 回呼以取得新權杖。
4. 用戶端使用新權杖重試對受保護資源的請求。

當多個請求同時失敗並出現 `401 Unauthorized` 時，用戶端僅會執行一次權杖重新整理。第一個收到 `401` 回應的請求會觸發 `refreshTokens {}` 回呼。其他請求則會等待重新整理操作完成，然後使用新權杖重試。

> 如果安裝了[多個提供者](client-auth.md#realm)，回應中應包含 `WWW-Authenticate` 標頭。
> 如果用戶端僅安裝了一個身分驗證提供者，即使 `WWW-Authenticate` 標頭缺失或指定了不同的配置，Ktor 也會針對 `401 Unauthorized` 回應嘗試使用該提供者。
>
{style="tip"}

### 無需等待 401 即可傳送憑據 {id="send-credentials-without-waiting-for-401"}

預設情況下，用戶端僅在收到 `401 Unauthorized` 回應後才會傳送憑據。

你可以使用 `sendWithoutRequest {}` 回呼函式覆寫此行為。該回呼會決定用戶端是否應在傳送請求之前附加憑據。

例如，以下設定會在存取 Google API 時一律傳送權杖：

```kotlin
install(Auth) {
   bearer {
       // 載入與重新整理權杖 ...
       sendWithoutRequest { request ->
           request.url.host == "www.googleapis.com"
       }
   }
}
```

### 快取權杖 {id="cache-tokens"}

使用 `cacheTokens` 屬性來控制是否在請求之間快取 Bearer 權杖。

如果停用快取，用戶端會針對每個請求呼叫 `loadTokens {}` 函式：
   
```kotlin
install(Auth) {
    bearer {
        cacheTokens = false   // 針對每個請求重新載入權杖
        loadTokens {
            loadDynamicTokens()
        }
    }
}
```

當權杖頻繁變更時，停用快取會很有幫助。
   
> 有關透過程式設計方式清除快取憑據的詳細資訊，請參閱通用的[權杖快取與快取控制](client-auth.md#token-caching)文件。
> 
{style="tip"}

## 範例：使用 Bearer 身分驗證存取 Google API {id="example-oauth-google"}

本範例示範如何對 Google API 使用 Bearer 身分驗證，該 API 使用 [OAuth 2.0 協定](https://developers.google.com/identity/protocols/oauth2)進行身分驗證與授權。

範例應用程式 [client-auth-oauth-google](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-auth-oauth-google) 會擷取使用者的 Google 個人資料資訊。

### 取得用戶端憑據 {id="google-client-credentials"}

若要存取 Google API，你首先需要取得 OAuth 用戶端憑據：

1. 建立或登入 Google 帳戶。
2. 開啟 [Google Cloud Console](https://console.cloud.google.com/apis/credentials)。
3. 建立應用程式類型為 `Android` 的 `OAuth client ID`。你將使用此用戶端 ID 來取得[授權許可](#step1)。

### OAuth 授權流程 {id="oauth-flow"}

OAuth 授權流程包含以下步驟：

1. 用戶端向資源擁有者傳送[授權請求](#step1)。
2. 資源擁有者[傳回授權碼](#step2)。
3. 用戶端將[授權碼傳送](#step3)給授權伺服器。
4. 授權伺服器[傳回存取與重新整理權杖](#step4)。
5. 用戶端[使用存取權杖向資源伺服器傳送請求](#step5)。
6. 資源伺服器[傳回受保護的資源](#step6)。
7. 存取權杖過期後，用戶端[使用過期權杖傳送請求](#step7)。
8. 資源伺服器[回應 401 Unauthorized](#step8)。
9. 用戶端將[重新整理權杖傳送](#step9)給授權伺服器。
10. 授權伺服器[傳回新的存取與重新整理權杖](#step10)。
11. 用戶端[使用新的存取權杖向資源伺服器傳送新請求](#step11)。
12. 資源伺服器[傳回受保護的資源](#step12)。

以下章節將說明 Ktor 用戶端如何實作每個步驟。

#### 授權請求 {id="step1"}

首先，建構用於請求所需權限的授權 URL。這是透過附加必要的查詢參數來完成的：

```kotlin
val authorizationUrlQuery = parameters {
    append("client_id", System.getenv("GOOGLE_CLIENT_ID"))
    append("scope", "https://www.googleapis.com/auth/userinfo.profile")
    append("response_type", "code")
    append("redirect_uri", "http://127.0.0.1:8080")
    append("access_type", "offline")
}.formUrlEncode()
println("https://accounts.google.com/o/oauth2/auth?$authorizationUrlQuery")
println("Open a link above, get the authorization code, insert it below, and press Enter.")
```

- `client_id`：用於存取 Google API 的 [OAuth 用戶端 ID](#google-client-credentials)。
- `scope`：應用程式請求的權限。在此範例中，為使用者的個人資料資訊。
- `response_type`：用於取得存取權杖的授權類型。設定為 `"code"` 以取得授權碼。
- `redirect_uri`：`http://127.0.0.1:8080` 值表示使用 _回環 IP 位址 (Loopback IP address)_ 流程來取得授權碼。
   > 若要使用此 URL 接收授權碼，你的應用程式必須在本機 Web 伺服器上進行監聽。
   > 例如，你可以使用 [Ktor 伺服器](server-create-and-configure.topic)以查詢參數形式取得授權碼。
- `access_type`：設定為 `offline`，以便應用程式在使用者不在瀏覽器前時仍可重新整理存取權杖。

#### 授權許可 (code) {id="step2"}

授與存取權限後，瀏覽器會傳回授權碼。複製該代碼並將其儲存在變數中：

```kotlin
val authorizationCode = readln()
```

#### 使用授權碼交換權杖 {id="step3"}

接下來，使用授權碼交換權杖。為此，請建立一個用戶端並安裝帶有 JSON 序列化程式的 [`ContentNegotiation`](client-serialization.md) 外掛程式：

```kotlin
val client = HttpClient(CIO) {
    install(ContentNegotiation) {
        json()
    }
}
```

需要此序列化程式來還原序列化從 Google OAuth 權杖端點收到的權杖。

使用建立的用戶端，將授權碼和其他必要選項作為[表單參數](client-requests.md#form_parameters)傳遞給權杖端點：

```kotlin
val tokenInfo: TokenInfo = client.submitForm(
    url = "https://accounts.google.com/o/oauth2/token",
    formParameters = parameters {
        append("grant_type", "authorization_code")
        append("code", authorizationCode)
        append("client_id", System.getenv("GOOGLE_CLIENT_ID"))
        append("client_secret", System.getenv("GOOGLE_CLIENT_SECRET"))
        append("redirect_uri", "http://127.0.0.1:8080")
    }
).body()
```

權杖端點會傳回 JSON 回應，用戶端會將其還原序列化為 `TokenInfo` 執行個體。`TokenInfo` 類別如下所示：

```kotlin
import kotlinx.serialization.*

@Serializable
data class TokenInfo(
    @SerialName("access_token") val accessToken: String,
    @SerialName("expires_in") val expiresIn: Int,
    @SerialName("refresh_token") val refreshToken: String? = null,
    val scope: String,
    @SerialName("token_type") val tokenType: String,
    @SerialName("id_token") val idToken: String,
)
```

#### 儲存權杖 {id="step4"}

收到權杖後，請將其儲存起來，以便提供給 `loadTokens {}` 和 `refreshTokens {}` 回呼。在此範例中，儲存體是一個由 `BearerTokens` 組成的可變清單：

```kotlin
        val bearerTokenStorage = mutableListOf<BearerTokens>()

        bearerTokenStorage.add(BearerTokens(tokenInfo.accessToken, tokenInfo.refreshToken!!))
```

> 請在[初始化用戶端](#step3)之前建立權杖存儲，因為它將在用戶端設定內部使用。
>
{style="note"}

#### 使用有效權杖傳送請求 {id="step5"}

現在有了有效的權杖，用戶端可以向受保護的 Google API 發出請求並擷取使用者資訊。

在此之前，請設定用戶端以使用 Bearer 身分驗證：

```kotlin
        val client = HttpClient(CIO) {
            install(ContentNegotiation) {
                json()
            }

            install(Auth) {
                bearer {
                    loadTokens {
                        bearerTokenStorage.last()
                    }
                    sendWithoutRequest { request ->
                        request.url.host == "www.googleapis.com"
                    }
                }
            }
        }
```

指定了以下設定：

* `loadTokens` 回呼從[存儲](#step4)中擷取權杖。
* `sendWithoutRequest {}` 回呼在呼叫 Google API 時傳送存取權杖，而無需等待 `401 Unauthorized` 回應。

使用此用戶端，你現在可以向受保護的資源發出請求：

```kotlin
while (true) {
    println("Make a request? Type 'yes' and press Enter to proceed.")
    when (readln()) {
        "yes" -> {
            val response: HttpResponse = client.get("https://www.googleapis.com/oauth2/v2/userinfo")
            try {
                val userInfo: UserInfo = response.body()
                println("Hello, ${userInfo.name}!")
            } catch (e: Exception) {
                val errorInfo: ErrorInfo = response.body()
                println(errorInfo.error.message)
            }
        }
        else -> return@runBlocking
    }
}
```

#### 存取受保護的資源 {id="step6"}

資源伺服器會以 JSON 格式傳回使用者的相關資訊。你可以將回應還原序列化為 `UserInfo` 類別執行個體並顯示個人問候語：

```kotlin
val userInfo: UserInfo = response.body()
println("Hello, ${userInfo.name}!")
```

`UserInfo` 類別如下所示：

```kotlin
import kotlinx.serialization.*

@Serializable
data class UserInfo(
    val id: String,
    val name: String,
    @SerialName("given_name") val givenName: String,
    @SerialName("family_name") val familyName: String,
    val picture: String,
    val locale: String
)
```

#### 使用過期權杖傳送請求 {id="step7"}

在某個時間點，用戶端會重複[步驟 5](#step5) 中的請求，但此時存取權杖已過期。

#### 401 Unauthorized 回應 {id="step8"}

當權杖不再有效時，資源伺服器會傳回 `401 Unauthorized` 回應。接著用戶端會叫用負責取得新權杖的 `refreshTokens {}` 回呼。

> `401 Unauthorized` 回應會傳回包含錯誤詳細資料的 JSON 資料。這需要在[接收回應時進行處理](#step12)。
>
{style="tip"}

#### 重新整理存取權杖 {id="step9"}

若要取得新的存取權杖，請設定 `refreshTokens {}` 回呼向權杖端點發出另一個請求。這次使用 `refresh_token` 授權類型取代 `authorization_code`：

```kotlin
install(Auth) {
    bearer {
        refreshTokens {
            val refreshTokenInfo: TokenInfo = client.submitForm(
                url = "https://accounts.google.com/o/oauth2/token",
                formParameters = parameters {
                    append("grant_type", "refresh_token")
                    append("client_id", System.getenv("GOOGLE_CLIENT_ID"))
                    append("refresh_token", oldTokens?.refreshToken ?: "")
                }
            ) { markAsRefreshTokenRequest() }.body()
        }
    }
}
```

`refreshTokens {}` 回呼使用 `RefreshTokensParams` 作為接收者，並允許你存取以下設定：

* `client` 執行個體，可用於提交表單參數。
* `oldTokens` 屬性用於存取重新整理權杖並將其傳送至權杖端點。
* `HttpRequestBuilder.markAsRefreshTokenRequest()` 函式將請求標記為權杖重新整理請求。以這種方式標記的請求將從身分驗證重試機制中排除。這可以防止在重新整理請求本身因 `401 Unauthorized` 失敗時，用戶端再次嘗試重新整理權杖，從而避免無限重新整理迴圈。

#### 儲存重新整理後的權杖 {id="step10"}

收到新權杖後，將其儲存在[權杖存儲](#step4)中。如此一來，`refreshTokens {}` 回呼如下所示：

```kotlin
refreshTokens {
    val refreshTokenInfo: TokenInfo = client.submitForm(
        url = "https://accounts.google.com/o/oauth2/token",
        formParameters = parameters {
            append("grant_type", "refresh_token")
            append("client_id", System.getenv("GOOGLE_CLIENT_ID"))
            append("refresh_token", oldTokens?.refreshToken ?: "")
        }
    ) { markAsRefreshTokenRequest() }.body()
    bearerTokenStorage.add(BearerTokens(refreshTokenInfo.accessToken, oldTokens?.refreshToken!!))
    bearerTokenStorage.last()
}
```

#### 使用新權杖傳送請求 {id="step11"}

儲存重新整理後的存取權杖後，下一次對受保護資源的請求應該就會成功：
```kotlin
val response: HttpResponse = client.get("https://www.googleapis.com/oauth2/v2/userinfo")
```

#### 處理 API 錯誤 {id="step12"}

鑑於 [`401 Unauthorized` 回應](#step8)會傳回包含錯誤詳細資料的 JSON 資料，請更新範例以將錯誤回應讀取為 `ErrorInfo` 物件：

```kotlin
val response: HttpResponse = client.get("https://www.googleapis.com/oauth2/v2/userinfo")
try {
    val userInfo: UserInfo = response.body()
    println("Hello, ${userInfo.name}!")
} catch (e: Exception) {
    val errorInfo: ErrorInfo = response.body()
    println(errorInfo.error.message)
}
```

`ErrorInfo` 類別定義如下：

```kotlin
import kotlinx.serialization.*

@Serializable
data class ErrorInfo(val error: ErrorDetails)

@Serializable
data class ErrorDetails(
    val code: Int,
    val message: String,
    val status: String,
)
```

> 有關完整範例，請參閱 [client-auth-oauth-google](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-auth-oauth-google)。
> 
{style="tip"}