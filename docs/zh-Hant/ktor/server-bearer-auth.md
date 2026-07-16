[//]: # (title: Ktor 伺服器中的 Bearer 驗證)

<show-structure for="chapter" depth="2"/>

<var name="artifact_name" value="ktor-server-auth"/>

<tldr>
<p>
<b>必要的相依性</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="auth-bearer"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">原生伺服器</Links> 支援</b>：✅
</p>
</tldr>

Bearer 驗證方案是 [HTTP 架構](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication) 用於存取控制和驗證的一部分。此方案涉及稱為 Bearer 權杖的安全權杖。Bearer 驗證方案通常作為 [OAuth](server-oauth.md) 或 [JWT](server-jwt.md) 的一部分使用，但您也可以為授權 Bearer 權杖提供自訂邏輯。

您可以在 [Ktor 伺服器中的驗證與授權](server-auth.md) 章節中獲取有關 Ktor 驗證的一般資訊。

> Bearer 驗證應僅透過 [HTTPS/TLS](server-ssl.md) 使用。

## 新增相依性 {id="add_dependencies"}
若要啟用 `bearer` 驗證，您需要在建置指令碼中包含 `%artifact_name%` 構件：

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

## Bearer 驗證流程 {id="flow"}

一般而言，Bearer 驗證流程可能如下所示：

1. 在使用者成功驗證並授權存取後，伺服器會向用戶端傳回一個存取權杖。
2. 用戶端可以使用 Bearer 方案，透過在 `Authorization` 標頭中傳遞權杖，向受保護的資源發出請求。
   ```HTTP
   GET http://localhost:8080/
   Authorization: Bearer abc123
   
   
   ```
3. 伺服器接收請求並[驗證](#configure)權杖。
4. 驗證後，伺服器會回應受保護資源的內容。

## 安裝 Bearer 驗證 {id="install"}
若要安裝 `bearer` 驗證提供者，請在 `install` 區塊內呼叫 [bearer](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/bearer.html) 函式：

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
// ...
install(Authentication) {
    bearer {
        // 配置 Bearer 驗證
    }
}
```

您可以選擇性地指定一個[提供者名稱](server-auth.md#provider-name)，該名稱可用於[驗證指定的路由](#authenticate-route)。

## 配置 Bearer 驗證 {id="configure"}

若要瞭解如何在 Ktor 中配置不同驗證提供者的一般概念，請參閱[配置驗證](server-auth.md#configure)。在本節中，我們將探討 `bearer` 驗證提供者的配置細節。 

### 步驟 1：配置 Bearer 提供者 {id="configure-provider"}

`bearer` 驗證提供者透過 [BearerAuthenticationProvider.Configuration](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-bearer-authentication-provider/-config/index.html) 類別公開其設定。在下方的範例中，指定了以下設定：
* `realm` 屬性設定了要在 `WWW-Authenticate` 標頭中傳遞的領域 (realm)。
* `authenticate` 函式會檢查用戶端傳送的權杖，並在驗證成功時傳回 `UserIdPrincipal`，若驗證失敗則傳回 `null`。

```kotlin
install(Authentication) {
    bearer("auth-bearer") {
        realm = "Access to the '/' path"
        authenticate { tokenCredential ->
            if (tokenCredential.token == "abc123") {
                UserIdPrincipal("jetbrains")
            } else {
                null
            }
        }
    }
}
```

### 步驟 2：保護特定資源 {id="authenticate-route"}

配置 `bearer` 提供者後，您可以使用 **[authenticate](server-auth.md#authenticate-route)** 函式保護應用程式中的特定資源。在驗證成功的情況下，您可以在路由處理常式中使用 `call.principal` 函式擷取已驗證的 [UserIdPrincipal](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-id-principal/index.html)，並獲取已驗證使用者的名稱。

```kotlin
routing {
    authenticate("auth-bearer") {
        get("/") {
            call.respondText("Hello, ${call.principal<UserIdPrincipal>()?.name}!")
        }
    }
}