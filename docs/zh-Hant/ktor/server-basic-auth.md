[//]: # (title: Ktor Server 中的基本身份驗證)

<show-structure for="chapter" depth="2"/>

<var name="artifact_name" value="ktor-server-auth"/>

<tldr>
<p>
<b>必要相依性</b>：<code>io.ktor:%artifact_name%</code>
</p>
<p>
<b>程式碼範例</b>：<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-basic">auth-basic</a>、<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-basic-hash-table">auth-basic-hash-table</a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor 支援 Kotlin/Native，可讓您在不使用額外執行階段或虛擬機的情況下執行伺服器。">原生伺服器</Links> 支援</b>：✅
</p>
</tldr>

基本身份驗證 (Basic authentication) 配置架構是 [HTTP 架構](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication) 的一部分，用於存取控制和身份驗證。在此架構中，使用者憑據會以使用 Base64 編碼的使用者名稱／密碼對進行傳輸。

Ktor 允許您使用基本身份驗證來讓使用者登入並保護特定的 [路由 (routes)](server-routing.md)。您可以在 [Ktor Server 中的身份驗證與授權](server-auth.md) 章節中取得關於 Ktor 身份驗證的一般資訊。

> 鑒於基本身份驗證以明文形式傳遞使用者名稱和密碼，您需要使用 [HTTPS/TLS](server-ssl.md) 來保護敏感資訊。

## 新增相依性 {id="add_dependencies"}
若要啟用 `basic` 身份驗證，您需要在組建指令碼中包含 `%artifact_name%` 構件：

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

## 基本身份驗證流程 {id="flow"}

基本身份驗證流程如下所示：

1. 用戶端向伺服器應用程式中的特定 [路由 (route)](server-routing.md) 發送不含 `Authorization` 標頭的請求。
2. 伺服器向用戶端回傳 `401 (Unauthorized)` 回應狀態，並使用 `WWW-Authenticate` 回應標頭提供有關使用基本身份驗證架構來保護路由的資訊。典型的 `WWW-Authenticate` 標頭如下所示：
   
   ```
   WWW-Authenticate: Basic realm="Access to the '/' path", charset="UTF-8"
   ```
   {style="block"}
   
   在 Ktor 中，您可以在 [配置](#configure-provider) `basic` 身份驗證提供者時，使用對應的屬性來指定 realm 和 charset。

3. 通常，用戶端會顯示一個登入對話方塊，供使用者輸入憑據。接著，用戶端會發送帶有 `Authorization` 標頭的請求，其中包含使用 Base64 編碼的使用者名稱和密碼對，例如：
   
   ```
   Authorization: Basic amV0YnJhaW5zOmZvb2Jhcg
   ```
   {style="block"}

4. 伺服器 [驗證](#configure-provider) 用戶端發送的憑據，並回傳請求的內容。

## 安裝基本身份驗證 {id="install"}
若要安裝 `basic` 身份驗證提供者，請在 `install` 區塊內呼叫 [basic](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/basic.html) 函式：

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
// ...
install(Authentication) {
    basic {
        // 配置基本身份驗證
    }
}
```

您可以選擇性地指定一個 [提供者名稱](server-auth.md#provider-name)，用於 [驗證指定的路由](#authenticate-route)。

## 配置基本身份驗證 {id="configure"}

若要了解如何在 Ktor 中配置不同身份驗證提供者的一般概念，請參閱 [配置身份驗證](server-auth.md#configure)。在本節中，我們將探討 `basic` 身份驗證提供者的特定配置。

### 步驟 1：配置 basic 提供者 {id="configure-provider"}

`basic` 身份驗證提供者透過 [BasicAuthenticationProvider.Configuration](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-basic-authentication-provider/-config/index.html) 類別公開其設定。在下方的範例中，指定了以下設定：
* `realm` 屬性設定要在 `WWW-Authenticate` 標頭中傳遞的領域。
* `validate` 函式用於驗證使用者名稱和密碼。

```kotlin
install(Authentication) {
    basic("auth-basic") {
        realm = "Access to the '/' path"
        validate { credentials ->
            if (credentials.name == "jetbrains" && credentials.password == "foobar") {
                UserIdPrincipal(credentials.name)
            } else {
                null
            }
        }
    }
}
```
   
`validate` 函式會檢查 `UserPasswordCredential`，並在身份驗證成功時回傳 `UserIdPrincipal`，若身份驗證失敗則回傳 `null`。 
> 您也可以使用 [UserHashedTableAuth](#validate-user-hash) 來驗證儲存在記憶體內表格中的使用者，該表格保存了使用者名稱和密碼雜湊。

### 步驟 2：保護特定資源 {id="authenticate-route"}

配置好 `basic` 提供者後，您可以使用 **[authenticate](server-auth.md#authenticate-route)** 函式來保護應用程式中的特定資源。在身份驗證成功的情況下，您可以在路由處理常式中使用 `call.principal` 函式擷取已通過驗證的 [UserIdPrincipal](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-id-principal/index.html)，並取得已驗證使用者的名稱。

```kotlin
routing {
    authenticate("auth-basic") {
        get("/") {
            call.respondText("Hello, ${call.principal<UserIdPrincipal>()?.name}!")
        }
    }
}
```

## 使用 UserHashedTableAuth 進行驗證 {id="validate-user-hash"}

Ktor 允許您使用 [UserHashedTableAuth](#validate-user-hash) 來 [驗證](#configure-provider) 儲存在記憶體內表格中的使用者，該表格保存了使用者名稱和密碼雜湊。這可以讓您的資料來源在遭洩漏時，不會洩漏使用者密碼。

若要使用 `UserHashedTableAuth` 驗證使用者，請按照以下步驟操作：

1. 使用 [getDigestFunction](https://api.ktor.io/ktor-utils/io.ktor.util/get-digest-function.html) 函式建立具有指定演算法和鹽值 (salt) 提供者的摘要函式：
   
   ```kotlin
   val digestFunction = getDigestFunction("SHA-256") { "ktor${it.length}" }
   ```

2. 初始化 `UserHashedTableAuth` 的新執行個體並指定以下屬性：
   * 使用 `table` 屬性提供使用者名稱和雜湊密碼的表格。
   * 將摘要函式指派給 `digester` 屬性。
   
   ```kotlin
   val hashedUserTable = UserHashedTableAuth(
       table = mapOf(
           "jetbrains" to digestFunction("foobar"),
           "admin" to digestFunction("password")
       ),
       digester = digestFunction
   )
   ```
   
3. 在 `validate` 函式內部，呼叫 [UserHashedTableAuth.authenticate](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-hashed-table-auth/authenticate.html) 函式來驗證使用者，如果憑據有效，則回傳 `UserIdPrincipal` 的執行個體：

   ```kotlin
   install(Authentication) {
       basic("auth-basic-hashed") {
           realm = "Access to the '/' path"
           validate { credentials ->
               hashedUserTable.authenticate(credentials)
           }
       }
   }