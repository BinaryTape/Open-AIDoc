[//]: # (title: Ktor Server 中的基本驗證)

<show-structure for="chapter" depth="2"/>

<var name="artifact_name" value="ktor-server-auth"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.auth"/>

<tldr>
<p>
<b>必要相依性</b>：<code>io.ktor:%artifact_name%</code>
</p>
<p>
<b>程式碼範例</b>：<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-basic">auth-basic</a>、<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-basic-hash-table">auth-basic-hash-table</a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor 支援 Kotlin/Native，並允許您在沒有額外執行階段或虛擬機的情況下執行伺服器。">原生伺服器</Links>支援</b>：✅
</p>
</tldr>

Basic 驗證機制是 [HTTP 架構](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication)的一部分，用於存取控制與驗證。在此機制中，使用者憑據會以使用 Base64 編碼的使用者名稱/密碼配對形式傳輸。

Ktor 允許您使用基本驗證來登入使用者並保護特定[路由](server-routing.md)。您可以在 [Ktor Server 中的驗證與授權](server-auth.md)章節中取得關於 Ktor 驗證的一般資訊。

> 鑑於基本驗證以明文形式傳遞使用者名稱和密碼，您需要使用 [HTTPS/TLS](server-ssl.md) 來保護敏感資訊。

## 新增相依性 {id="add_dependencies"}
若要啟用 `basic` 驗證，您需要在組建指令碼中包含 `%artifact_name%` 構件：

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目錄</a>來指定 Ktor 相依性。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目錄</a>來指定 Ktor 相依性。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## 基本驗證流程 {id="flow"}

基本驗證流程如下所示：

1. 用戶端向伺服器應用程式中的特定[路由](server-routing.md)發出未包含 `Authorization` 標頭的請求。
2. 伺服器向用戶端回應 `401`（Unauthorized）回應狀態，並使用 `WWW-Authenticate` 回應標頭提供資訊，指出該路由受基本驗證機制保護。典型的 `WWW-Authenticate` 標頭如下所示：
   
   ```
   WWW-Authenticate: Basic realm="Access to the '/' path", charset="UTF-8"
   ```
   {style="block"}
   
   在 Ktor 中，您可以在[設定](#configure-provider) `basic` 驗證提供程式時，使用對應的屬性來指定 realm 與 charset。

3. 通常，用戶端會顯示登入對話方塊供使用者輸入憑據。接著，用戶端發出包含以 Base64 編碼的使用者名稱和密碼配對之 `Authorization` 標頭的請求，例如：
   
   ```
   Authorization: Basic amV0YnJhaW5zOmZvb2Jhcg
   ```
   {style="block"}

4. 伺服器[驗證](#configure-provider)用戶端傳送的憑據，並回應所請求的內容。

## 安裝基本驗證 {id="install"}
若要安裝 `basic` 驗證提供程式，請在 `install` 區塊內呼叫 [basic](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/basic.html) 函式：

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
// ...
install(Authentication) {
    basic {
        // 設定基本驗證
    }
}
```

您可以選擇性指定[提供程式名稱](server-auth.md#provider-name)，該名稱可用於[驗證指定的路由](#authenticate-route)。

## 設定基本驗證 {id="configure"}

若要整體了解如何在 Ktor 中設定不同的驗證提供程式，請參閱[設定驗證](server-auth.md#configure)。在本節中，我們將介紹 `basic` 驗證提供程式的具體設定方式。

### 步驟 1：設定 basic 提供程式 {id="configure-provider"}

<Tabs group="auth-dsl">
<TabItem title="具名提供程式" group-key="classic">

`basic` 驗證提供程式透過 [BasicAuthenticationProvider.Configuration](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-basic-authentication-provider/-config/index.html) 類別公開其設定。在以下範例中，指定了下列設定：
* `realm` 屬性設定要在 `WWW-Authenticate` 標頭中傳遞的 realm。
* `validate` 函式驗證使用者名稱與密碼。

```kotlin
install(Authentication) {
    basic("auth-basic") {
        realm = "Access to the '/' path"
        validate { credentials ->
            val isValid = credentials.name == "jetbrains" &&
                credentials.password == "foobar"
            if (isValid) {
                UserIdPrincipal(credentials.name)
            } else {
                null
            }
        }
    }
}
```
   
`validate` 函式會檢查 `UserPasswordCredential`，並在驗證成功時傳回 `UserIdPrincipal`，若驗證失敗則傳回 `null`。
> 您也可以使用 [UserHashedTableAuth](#validate-user-hash) 來驗證儲存在保存使用者名稱與密碼雜湊值的記憶體內部表格中的使用者。

</TabItem>
<TabItem title="型別安全" group-key="typed">

<note>
    <p>
        型別安全驗證方案 API 處於實驗階段。它可能會隨時被棄用或變更。需要明確選擇加入（Opt-in）。如需更多詳細資訊，請參閱
        <a href="server-typed-auth.md#prerequisites">型別安全驗證文件</a>。
    </p>
</note>

`basic()` 函式會為您所選擇的主體（principal）型別建立配置。不需要 `install(Authentication)` 步驟：該配置是一個值，您只需將其傳遞給需要的路由即可。

```kotlin
data class User(val name: String)

val basicAuth = basic<User>("auth-basic") {
    realm = "Access to the '/' path"
    validate { credentials ->
        val isValid = credentials.name == "jetbrains" &&
            credentials.password == "foobar"
        if (isValid) User(credentials.name) else null
    }
}
```

`validate` 函式檢查 `UserPasswordCredential` 並傳回您的主體型別，若驗證失敗則傳回 `null`。如需完整的 API，請參閱[型別安全驗證](server-typed-auth.md)。

</TabItem>
</Tabs>

### 步驟 2：保護特定資源 {id="authenticate-route"}

<Tabs group="auth-dsl">
<TabItem title="具名提供程式" group-key="classic">

設定 `basic` 提供程式後，您可以使用 **[authenticate](server-auth.md#authenticate-route)** 函式來保護應用程式中的特定資源。在驗證成功的情況下，您可以在路由處理常式內使用 `call.principal` 函式擷取經過驗證的 [UserIdPrincipal](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-id-principal/index.html)，並取得經過驗證的使用者名稱。

```kotlin
routing {
    authenticate("auth-basic") {
        get("/") {
            val user = call.principal<UserIdPrincipal>()
            call.respondText("Hello, ${user?.name}!")
        }
    }
}
```

</TabItem>
<TabItem title="型別安全" group-key="typed">

將配置傳遞給 `authenticateWith()`。在區塊內，`call.principal` 即為您的主體型別且絕不為 `null`，因此不需要轉換或 null 檢查：

```kotlin
routing {
    authenticateWith(basicAuth) {
        get("/") {
            call.respondText("Hello, ${call.principal.name}!")
        }
    }
}
```

</TabItem>
</Tabs>

## 使用 UserHashedTableAuth 進行驗證 {id="validate-user-hash"}

Ktor 允許您使用 [UserHashedTableAuth](#validate-user-hash) 來[驗證](#configure-provider)儲存在保存使用者名稱和密碼雜湊值的記憶體內部表格中的使用者。即使您的資料來源外洩，這也能確保使用者的密碼不會外洩。

若要使用 `UserHashedTableAuth` 來驗證使用者，請依照下列步驟操作：

1. 使用 [getDigestFunction](https://api.ktor.io/ktor-utils/io.ktor.util/get-digest-function.html) 函式建立具有指定演算法和 salt 提供程式的摘要函式：
   
   ```kotlin
   val digestFunction = getDigestFunction("SHA-256") {
       "ktor${it.length}"
   }
   ```

2. 初始化 `UserHashedTableAuth` 的新執行個體，並指定下列屬性：
   * 使用 `table` 屬性提供包含使用者名稱與雜湊密碼的表格。
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
   
3. 在 `validate` 函式內，呼叫 [UserHashedTableAuth.authenticate](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-hashed-table-auth/authenticate.html) 函式來驗證使用者，並在憑據有效時傳回 `UserIdPrincipal` 的執行個體：

   ```kotlin
   install(Authentication) {
       basic("auth-basic-hashed") {
           realm = "Access to the '/' path"
           validate { credentials ->
               hashedUserTable.authenticate(credentials)
           }
       }
   }
   ```