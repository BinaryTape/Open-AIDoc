[//]: # (title: Ktor Server 中的 Bearer 驗證)

<show-structure for="chapter" depth="2"/>

<var name="artifact_name" value="ktor-server-auth"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.auth"/>

<tldr>
<p>
<b>必要相依性</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="auth-bearer"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor 支援 Kotlin/Native，可讓您在無需額外執行階段或虛擬機器的情況下執行伺服器。">原生伺服器</Links> 支援</b>：✅
</p>
</tldr>

Bearer 驗證機制是用於存取控制與驗證的 [HTTP 架構](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication) 的一部分。此機制涉及稱為 Bearer 權杖的安全權杖。Bearer 驗證機制常作為 [OAuth](server-oauth.md) 或 [JWT](server-jwt.md) 的一部分使用，但您也可以為授權 Bearer 權杖提供自訂邏輯。

您可以在 [Ktor Server 中的驗證與授權](server-auth.md) 章節中取得有關 Ktor 驗證的一般資訊。

> Bearer 驗證應僅透過 [HTTPS/TLS](server-ssl.md) 使用。

## 新增相依性 {id="add_dependencies"}
若要啟用 `bearer` 驗證，您需要在建置指令碼中包含 `%artifact_name%` 構件：

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

## Bearer 驗證流程 {id="flow"}

一般而言，Bearer 驗證流程如下所示：

1. 使用者成功通過驗證並獲取存取授權後，伺服器會向用戶端傳回存取權杖。
2. 用戶端可以使用 `Bearer` 機制在 `Authorization` 標頭中傳遞權杖，向受保護的資源發出請求。
   ```HTTP
   GET http://localhost:8080/
   Authorization: Bearer abc123
   
   
   ```
3. 伺服器接收請求並[驗證](#configure)權杖。
4. 驗證通過後，伺服器回應受保護資源的內容。

## 安裝 Bearer 驗證 {id="install"}
若要安裝 `bearer` 驗證提供者，請在 `install` 區塊內呼叫 [bearer](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/bearer.html) 函式：

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
// ...
install(Authentication) {
    bearer {
        // 設定 bearer 驗證
    }
}
```

您可以選擇性指定一個[提供者名稱](server-auth.md#provider-name)，用於[驗證指定的路由](#authenticate-route)。

## 設定 Bearer 驗證 {id="configure"}

若要大致了解如何在 Ktor 中設定不同的驗證提供者，請參閱[設定驗證](server-auth.md#configure)。在本節中，我們將介紹 `bearer` 驗證提供者的具體配置細節。 

### 步驟 1：設定 Bearer 提供者 {id="configure-provider"}

<Tabs group="auth-dsl">
<TabItem title="Classic" group-key="classic">

`bearer` 驗證提供者透過 [BearerAuthenticationProvider.Configuration](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-bearer-authentication-provider/-config/index.html) 類別公開其設定。在以下範例中，指定了以下設定：
* `realm` 屬性設定要在 `WWW-Authenticate` 標頭中傳遞的領域 (realm)。
* `authenticate` 函式檢查用戶端傳送的權杖，在驗證成功時傳回 `UserIdPrincipal`，驗證失敗時傳回 `null`。

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

</TabItem>
<TabItem title="Type-safe" group-key="typed">

<note>
    <p>
        型別安全驗證機制 API 為實驗功能。它隨時可能被移除或變更。
        需要明確選擇採用 (Opt-in)。如需更多詳細資訊，請參閱
        <a href="server-typed-auth.md#prerequisites">型別安全驗證文件</a>。
    </p>
</note>

`bearer()` 函式會為您選擇的主體型別建立機制。不需要 `install(Authentication)` 步驟：此機制是一個您可以傳遞給所需路由的值。

```kotlin
data class User(val name: String)

val bearerAuth = bearer<User>("auth-bearer") {
    realm = "Access to the '/' path"
    validate { tokenCredential ->
        if (tokenCredential.token == "abc123") {
            User("jetbrains")
        } else {
            null
        }
    }
}
```

請注意名稱的變更：傳統提供者使用 `authenticate`，而型別安全機制與其他型別安全機制一樣，使用 `validate`。它會傳回您的主體型別，若驗證失敗則傳回 `null`。

您也可以設定 `authHeader` 以從 `Authorization` 標頭以外的位置讀取權杖，並設定 `authSchemes` 以接受 `Bearer` 以外的機制。如需完整的 API，請參閱[型別安全驗證](server-typed-auth.md)。

</TabItem>
</Tabs>

### 步驟 2：保護特定資源 {id="authenticate-route"}

<Tabs group="auth-dsl">
<TabItem title="Classic" group-key="classic">

設定 `bearer` 提供者後，您可以使用 **[authenticate](server-auth.md#authenticate-route)** 函式保護應用程式中的特定資源。在驗證成功的情況下，您可以在路由處理常式內使用 `call.principal` 函式擷取經過驗證的 [UserIdPrincipal](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-id-principal/index.html)，並取得經過驗證的使用者名稱。

```kotlin
routing {
    authenticate("auth-bearer") {
        get("/") {
            val user = call.principal<UserIdPrincipal>()
            call.respondText("Hello, ${user?.name}!")
        }
    }
}
```

</TabItem>
<TabItem title="Type-safe" group-key="typed">

將機制傳遞給 `authenticateWith()`。在該區塊內，`call.principal` 即為您的主體型別且絕不為 `null`，因此不需要進行轉換或 null 檢查：

```kotlin
routing {
    authenticateWith(bearerAuth) {
        get("/") {
            call.respondText("Hello, ${call.principal.name}!")
        }
    }
}
```

</TabItem>
</Tabs>