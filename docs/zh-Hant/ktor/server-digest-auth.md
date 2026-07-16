[//]: # (title: Ktor Server 中的 Digest 驗證)

<show-structure for="chapter" depth="2"/>

<var name="artifact_name" value="ktor-server-auth"/>

<tldr>
<p>
<b>必要的相依性</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="auth-digest"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor 支援 Kotlin/Native，允許您在沒有額外執行階段或虛擬機的情況下執行伺服器。">原生伺服器 (Native server)</Links> 支援</b>：✖️
</p>
</tldr>

Digest 驗證方案是 [HTTP 架構](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication) 的一部分，用於存取控制與驗證。在此方案中，在透過網路傳送使用者名稱與密碼之前，會先對其套用雜湊函式。

Ktor 允許您使用 Digest 驗證來登入使用者並保護特定的 [路由 (routes)](server-routing.md)。您可以在 [Ktor Server 中的驗證與授權](server-auth.md) 章節中取得關於 Ktor 驗證的一般資訊。

## 新增相依性 {id="add_dependencies"}
若要啟用 `digest` 驗證，您需要在建置指令碼中包含 `%artifact_name%` 構件：

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

## Digest 驗證流程 {id="flow"}

Digest 驗證流程如下所示：

1. 用戶端向伺服器應用程式中的特定 [路由 (route)](server-routing.md) 發送一個不含 `Authorization` 標頭的請求。
2. 伺服器向用戶端傳回 `401` (Unauthorized) 回應狀態，並使用 `WWW-Authenticate` 回應標頭提供資訊，說明該路由使用 Digest 驗證方案進行保護。典型的 `WWW-Authenticate` 標頭如下所示：

   ```
   WWW-Authenticate: Digest
           realm="Access to the '/' path",
           nonce="e4549c0548886bc2",
           algorithm="MD5"
   ```
   {style="block"}

   在 Ktor 中，您可以在 [配置](#configure-provider) `digest` 驗證提供者時指定領域 (realm) 以及產生 nonce 值的方式。

3. 通常用戶端會顯示一個登入對話方塊，讓使用者輸入憑據。接著，用戶端會發送帶有以下 `Authorization` 標頭的請求：

   ```
   Authorization: Digest username="jetbrains",
           realm="Access to the '/' path",
           nonce="e4549c0548886bc2",
           uri="/",
           algorithm=MD5,
           response="6299988bb4f05c0d8ad44295873858cf"
   ```
   {style="block"}

   `response` 值的產生方式如下：
   
   a. `HA1 = MD5(username:realm:password)`
   > 此部分 [儲存](#digest-table) 在伺服器上，Ktor 可用來驗證使用者憑據。
   
   b. `HA2 = MD5(method:digestURI)`
   
   c. `response = MD5(HA1:nonce:HA2)`

4. 伺服器 [驗證](#configure-provider) 用戶端傳送的憑據，並回應所請求的內容。

## 安裝 Digest 驗證 {id="install"}
若要安裝 `digest` 驗證提供者，請在 `install` 區塊內呼叫 [digest](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/digest.html) 函式：

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
// ...
install(Authentication) {
    digest {
        // 配置 Digest 驗證
    }
}
```
您可以選擇性地指定一個 [提供者名稱 (provider name)](server-auth.md#provider-name)，該名稱可用於 [驗證指定的路由](#authenticate-route)。

## 配置 Digest 驗證 {id="configure"}

若要了解如何在 Ktor 中配置不同驗證提供者的一般概念，請參閱 [配置驗證](server-auth.md#configure)。在本節中，我們將探討 `digest` 驗證提供者的特定配置。

### 步驟 1：提供包含 Digest 的使用者表 {id="digest-table"}

`digest` 驗證提供者使用 Digest 訊息的 `HA1` 部分來驗證使用者憑據。因此，您可以提供一個包含使用者名稱及其對應 `HA1` 雜湊值的使用者表。在下面的範例中，使用 `getMd5Digest` 函式來產生 `HA1` 雜湊值：

```kotlin
fun getMd5Digest(str: String): ByteArray = MessageDigest.getInstance("MD5").digest(str.toByteArray(UTF_8))

val myRealm = "Access to the '/' path"
val userTable: Map<String, ByteArray> = mapOf(
    "jetbrains" to getMd5Digest("jetbrains:$myRealm:foobar"),
    "admin" to getMd5Digest("admin:$myRealm:password")
)
```

### 步驟 2：配置 Digest 提供者 {id="configure-provider"}

`digest` 驗證提供者透過 [DigestAuthenticationProvider.Config](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-digest-authentication-provider/-config/index.html) 類別公開其設定。在下面的範例中，指定了以下設定：
* `realm` 屬性設定要在 `WWW-Authenticate` 標頭中傳遞的領域。
* `digestProvider` 函式為指定的使用者名稱獲取 Digest 的 `HA1` 部分。
* （選用）`validate` 函式允許您將憑據映射到自訂的 Principal。

```kotlin
fun Application.main() {
    install(Authentication) {
        digest("auth-digest") {
            realm = myRealm
            digestProvider { userName, realm ->
                userTable[userName]
            }
            validate { credentials ->
                if (credentials.userName.isNotEmpty()) {
                    CustomPrincipal(credentials.userName, credentials.realm)
                } else {
                    null
                }
            }
        }
    }
}

data class CustomPrincipal(val userName: String, val realm: String)
```

您也可以使用 [nonceManager](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-digest-authentication-provider/-config/nonce-manager.html) 屬性來指定產生 nonce 值的方式。

### 步驟 3：保護特定資源 {id="authenticate-route"}

配置完 `digest` 提供者後，您可以使用 **[authenticate](server-auth.md#authenticate-route)** 函式來保護應用程式中的特定資源。在驗證成功的情況下，您可以在路由處理常式中使用 `call.principal` 函式擷取已驗證的 [Principal](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-principal/index.html)，並取得已驗證使用者的名稱。

```kotlin
routing {
    authenticate("auth-digest") {
        get("/") {
            call.respondText("Hello, ${call.principal<CustomPrincipal>()?.userName}!")
        }
    }
}