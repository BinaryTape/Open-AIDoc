[//]: # (title: Ktor Client 中的 Bearer 身份验证)

<show-structure for="chapter" depth="3"/>

<tldr>
<p>
<b>所需依赖项</b>：<code>io.ktor:ktor-client-auth</code>
</p>
<var name="example_name" value="client-auth-oauth-google"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

Bearer 身份验证使用被称为 _Bearer 令牌_（bearer tokens）的安全令牌。这些令牌通常用于 OAuth 2.0 流程中，通过 Google、Facebook 和 X 等外部提供程序对用户进行授权。

您可以在 [Ktor 服务器文档的 OAuth 授权流程部分](server-oauth.md#flow)中详细了解 OAuth 流程。

> 在服务器端，Ktor 提供了 [Authentication](server-bearer-auth.md) 插件来处理 Bearer 身份验证。

## 添加依赖项 {id="add_dependencies"}

要启用身份验证，请在构建脚本中包含 `ktor-client-auth` 工件：

<var name="artifact_name" value="ktor-client-auth"/>
<var name="ktor_version_catalog_name" value="ktorLibs.client.auth"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目录</a>来指定 Ktor 依赖项。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目录</a>来指定 Ktor 依赖项。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>
<tip>
    要了解更多有关 Ktor 客户端所需工件的信息，请参阅<Links href="client-dependencies.md" summary="了解如何向现有项目添加客户端依赖项。">添加客户端依赖项</Links>。
</tip>

## 配置 Bearer 身份验证 {id="configure"}

Ktor 客户端允许您使用 `Bearer` 方案在 `Authorization` 请求头中发送令牌。您还可以定义在令牌过期时刷新令牌的逻辑。

要配置 Bearer 身份验证，请安装 `Auth` 插件并配置 `bearer` 提供程序：

```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.auth.*
//...
val client = HttpClient(CIO) {
   install(Auth) {
      bearer {
         // 配置 Bearer 身份验证
      }
   }
}
```

### 加载令牌 {id="load-tokens"}

使用 `loadTokens {}` 回调来提供初始访问令牌与刷新令牌。通常，该回调会从本地存储加载已缓存的令牌，并将它们作为 `BearerTokens` 实例返回。

```kotlin
install(Auth) {
   bearer {
       loadTokens {
           // 从本地存储加载令牌并将其作为 'BearerTokens' 实例返回
           BearerTokens("abc123", "xyz111")
       }
   }
}
```

在此示例中，客户端在 `Authorization` 请求头中发送 `abc123` 访问令牌：

```HTTP
GET http://localhost:8080/
Authorization: Bearer abc123
```

### 刷新令牌 {id="refresh-tokens"}

使用 `refreshTokens {}` 回调来定义当当前访问令牌失效时客户端获取新令牌的方式：

```kotlin
install(Auth) {
   bearer {
       // 加载令牌 ...
       refreshTokens { // this: RefreshTokensParams
           // 刷新令牌并将其作为 'BearerTokens' 实例返回
           BearerTokens("def456", "xyz111")
       }
   }
}
```
   
刷新过程如下：
   
1. 客户端使用无效的访问令牌向受保护的资源发起请求。
2. 资源服务器返回 `401 Unauthorized` 响应。
3. 客户端自动调用 `refreshTokens {}` 回调以获取新令牌。
4. 客户端使用新令牌重试对受保护资源的请求。

当多个请求同时因 `401 Unauthorized` 失败时，客户端仅执行一次令牌刷新。首个收到 `401` 响应的请求会触发 `refreshTokens {}` 回调。其他请求则等待刷新操作完成，然后使用新令牌重试。

> 如果安装了[多个提供程序](client-auth.md#realm)，响应中应当包含 `WWW-Authenticate` 请求头。如果客户端只安装了一个身份验证提供程序，即使缺少 `WWW-Authenticate` 请求头或该请求头指定了不同的方案，Ktor 也会针对 `401 Unauthorized` 响应尝试使用该提供程序。
>
{style="tip"}

### 无需等待 401 即可发送凭据 {id="send-credentials-without-waiting-for-401"}

默认情况下，客户端仅在收到 `401 Unauthorized` 响应后才会发送凭据。

您可以使用 `sendWithoutRequest {}` 回调函数覆盖此行为。该回调决定客户端在发送请求之前是否应附加凭据。

例如，以下配置在访问 Google API 时始终发送令牌：

```kotlin
install(Auth) {
   bearer {
       // 加载与刷新令牌 ...
       sendWithoutRequest { request ->
           request.url.host == "www.googleapis.com"
       }
   }
}
```

### 缓存令牌 {id="cache-tokens"}

使用 `cacheTokens` 属性控制是否在请求之间缓存 Bearer 令牌。

如果禁用了缓存，客户端将针对每个请求调用 `loadTokens {}` 函数：
   
```kotlin
install(Auth) {
    bearer {
        cacheTokens = false   // 针对每个请求重新加载令牌
        loadTokens {
            loadDynamicTokens()
        }
    }
}
```

当令牌变动频繁时，禁用缓存会很有用。
   
> 有关以编程方式清除缓存凭据的详细信息，请参阅常规的[令牌缓存与缓存控制](client-auth.md#token-caching)文档。
> 
{style="tip"}

## 示例：使用 Bearer 身份验证访问 Google API {id="example-oauth-google"}

此示例演示了如何对 Google API 使用 Bearer 身份验证，Google API 使用 [OAuth 2.0 协议](https://developers.google.com/identity/protocols/oauth2)进行身份验证和授权。 

示例应用程序 [client-auth-oauth-google](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-auth-oauth-google) 用于检索用户的 Google 个人资料信息。 

### 获取客户端凭据 {id="google-client-credentials"}

要访问 Google API，首先需要获取 OAuth 客户端凭据：

1. 创建或登录 Google 帐号。
2. 打开 [Google Cloud Console](https://console.cloud.google.com/apis/credentials)。
3. 创建一个应用类型为 `Android` 的 `OAuth client ID`。您将使用此客户端 ID 来获取[授权许可](#step1)。

### OAuth 授权流程 {id="oauth-flow"}

OAuth 授权流程包含以下步骤：

1. 客户端向资源所有者发送[授权请求](#step1)。
2. 资源所有者[返回授权码](#step2)。
3. 客户端将[授权码发送](#step3)给授权服务器。
4. 授权服务器[返回访问令牌和刷新令牌](#step4)。
5. 客户端[使用访问令牌向资源服务器发送请求](#step5)。
6. 资源服务器[返回受保护的资源](#step6)。
7. 访问令牌过期后，客户端[使用过期令牌发送请求](#step7)。
8. 资源服务器[返回 401 Unauthorized 响应](#step8)。
9. 客户端将[刷新令牌发送](#step9)给授权服务器。
10. 授权服务器[返回新的访问令牌和刷新令牌](#step10)。
11. 客户端[使用新的访问令牌向资源服务器发送新请求](#step11)。
12. 资源服务器[返回受保护的资源](#step12)。

以下部分说明 Ktor 客户端如何实现每个步骤。

#### 授权请求 {id="step1"}

首先，构造用于请求必要权限的授权 URL。这是通过附加所需的查询形参来实现的：

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

- `client_id`：用于访问 Google API 的 [OAuth 客户端 ID](#google-client-credentials)。
- `scope`：应用程序请求的权限。在此例中，它是有关用户个人资料的信息。
- `response_type`：用于获取访问令牌的授权类型。设置为 `"code"` 以获取授权码。
- `redirect_uri`：`http://127.0.0.1:8080` 值表示使用环回 IP 地址（Loopback IP address）流程来获取授权码。
   > 要使用此 URL 接收授权码，您的应用程序必须正在侦听本地 Web 服务器。例如，您可以使用 [Ktor 服务器](server-create-and-configure.topic)将授权码作为查询参数获取。
- `access_type`：设置为 `offline`，以便在用户不在浏览器前时应用程序也可以刷新访问令牌。

#### 授权许可（授权码） {id="step2"}

授予访问权限后，浏览器将返回一个授权码。复制该代码并将其存储在变量中：

```kotlin
val authorizationCode = readln()
```

#### 使用授权码换取令牌 {id="step3"}

接下来，使用授权码换取令牌。为此，请创建一个客户端并安装带有 JSON 序列化器的 [`ContentNegotiation`](client-serialization.md) 插件：

```kotlin
val client = HttpClient(CIO) {
    install(ContentNegotiation) {
        json()
    }
}
```

从 Google OAuth 令牌端点接收的令牌需要使用此序列化器进行反序列化。

使用创建的客户端，将授权码和其他必要选项作为[表单参数](client-requests.md#form_parameters)传递给令牌端点：

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

令牌端点返回一个 JSON 响应，客户端会将其反序列化为 `TokenInfo` 实例。`TokenInfo` 类如下所示：

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

#### 存储令牌 {id="step4"}

收到令牌后，将其存储起来，以便提供给 `loadTokens {}` 和 `refreshTokens {}` 回调。在此示例中，存储介质是一个可变的 `BearerTokens` 列表：

```kotlin
        val bearerTokenStorage = mutableListOf<BearerTokens>()

        bearerTokenStorage.add(BearerTokens(tokenInfo.accessToken, tokenInfo.refreshToken!!))
```

> 请在[初始化客户端](#step3)之前创建令牌存储，因为在客户端配置中将会使用到它。
>
{style="note"}

#### 使用有效令牌发送请求 {id="step5"}

现在已获得有效令牌，客户端可以向受保护的 Google API 发送请求并检索用户信息。

在此之前，请将客户端配置为使用 Bearer 身份验证：

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

指定了以下设置： 

* `loadTokens` 回调从[存储](#step4)中检索令牌。
* 调用 Google API 时，`sendWithoutRequest {}` 回调无需等待 `401 Unauthorized` 响应即可发送访问令牌。

使用此客户端，您现在可以向受保护的资源发送请求：

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

#### 访问受保护的资源 {id="step6"}

资源服务器以 JSON 格式返回有关用户的信息。您可以将响应反序列化为 `UserInfo` 类实例并显示个性化问候语：

```kotlin
val userInfo: UserInfo = response.body()
println("Hello, ${userInfo.name}!")
```

`UserInfo` 类如下所示：

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

#### 使用已过期的令牌发送请求 {id="step7"}

在某个时刻，客户端重复执行[步骤 5](#step5)中的请求，但此时访问令牌已过期。

#### 401 Unauthorized 响应 {id="step8"}

当令牌不再有效时，资源服务器会返回 `401 Unauthorized` 响应。随后客户端调用负责获取新令牌的 `refreshTokens {}` 回调。

> `401 Unauthorized` 响应会返回包含错误详情的 JSON 数据。在[接收响应时需要对其进行处理](#step12)。
>
{style="tip"}

#### 刷新访问令牌 {id="step9"}

要获取新的访问令牌，请配置 `refreshTokens {}` 回调以向令牌端点发送另一个请求。这次，使用 `refresh_token` 授权类型代替 `authorization_code`：

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

`refreshTokens {}` 回调使用 `RefreshTokensParams` 作为接收者，并允许您访问以下设置：

* `client` 实例，可用于提交表单参数。
* `oldTokens` 属性用于访问刷新令牌并将其发送到令牌端点。
* `HttpRequestBuilder.markAsRefreshTokenRequest()` 函数将请求标记为令牌刷新请求。以此方式标记的请求将被排除在身份验证重试机制之外。这样可以防止在刷新请求本身因 `401 Unauthorized` 失败时客户端再次尝试刷新令牌，从而避免无限刷新循环。

#### 保存已刷新的令牌 {id="step10"}

收到新令牌后，将它们保存在[令牌存储](#step4)中。至此，`refreshTokens {}` 回调如下所示：

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

#### 使用新令牌发送请求 {id="step11"}

存储好已刷新的访问令牌后，向受保护资源发送的下一次请求应该会成功：
```kotlin
val response: HttpResponse = client.get("https://www.googleapis.com/oauth2/v2/userinfo")
```

#### 处理 API 错误 {id="step12"}

鉴于 [`401 Unauthorized` 响应](#step8)返回包含错误详情的 JSON 数据，请更新示例以将错误响应读取为 `ErrorInfo` 对象：

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

`ErrorInfo` 类定义如下：

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

> 有关完整示例，请参阅 [client-auth-oauth-google](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-auth-oauth-google)。
> 
{style="tip"}