[//]: # (title: LDAP)

<show-structure for="chapter" depth="2"/>

<tldr>
<p>
<b>必要的相依性</b>：<code>io.ktor:ktor-server-auth</code>, <code>io.ktor:ktor-server-auth-ldap</code>
</p>
<var name="example_name" value="auth-ldap"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor 支援 Kotlin/Native，並允許您在沒有額外執行階段或虛擬機的情況下執行伺服器。">原生伺服器</Links> 支援</b>：✖️
</p>
</tldr>

LDAP 是一種用於處理各種可儲存使用者資訊之目錄服務的協定。Ktor 允許您使用 [basic](server-basic-auth.md)、[digest](server-digest-auth.md) 或 [form-based](server-form-based-auth.md) 驗證方案來驗證 LDAP 使用者。

> 您可以在 [Ktor 伺服器中的驗證與授權](server-auth.md) 章節中取得有關 Ktor 驗證與授權的一般資訊。

## 新增相依性 {id="add_dependencies"}
若要啟用 `LDAP` 驗證，您需要在組建指令碼中包含 `ktor-server-auth` 和 `ktor-server-auth-ldap` 構件：

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" title="Sample" code="            implementation(&quot;io.ktor:ktor-server-auth:$ktor_version&quot;)&#10;            implementation(&quot;io.ktor:ktor-server-auth-ldap:$ktor_version&quot;)"/>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" title="Sample" code="            implementation &quot;io.ktor:ktor-server-auth:$ktor_version&quot;&#10;            implementation &quot;io.ktor:ktor-server-auth-ldap:$ktor_version&quot;"/>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" title="Sample" code="&amp;lt;dependency&amp;gt;&#10;&amp;lt;groupId&amp;gt;io.ktor&amp;lt;/groupId&amp;gt;&#10;&amp;lt;artifactId&amp;gt;ktor-server-auth&amp;lt;/artifactId&amp;gt;&#10;&amp;lt;version&amp;gt;${ktor_version}&amp;lt;/version&amp;gt;&#10;&amp;lt;/dependency&amp;gt;&#10;&amp;lt;dependency&amp;gt;&#10;&amp;lt;groupId&amp;gt;io.ktor&amp;lt;/groupId&amp;gt;&#10;&amp;lt;artifactId&amp;gt;ktor-server-auth-ldap&amp;lt;/artifactId&amp;gt;&#10;&amp;lt;version&amp;gt;${ktor_version}&amp;lt;/version&amp;gt;&#10;&amp;lt;/dependency&amp;gt;"/>
   </TabItem>
</Tabs>

## 設定 LDAP {id="configure"}

### 步驟 1：選擇驗證提供者 {id="choose-auth"}

若要驗證 LDAP 使用者，您首先需要選擇一個用於使用者名稱與密碼校驗的驗證提供者。在 Ktor 中，[basic](server-basic-auth.md)、[digest](server-digest-auth.md) 或 [form-based](server-form-based-auth.md) 提供者均可用於此目的。例如，若要使用 `basic` 驗證提供者，請在 `install` 區塊中呼叫 [basic](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/basic.html) 函式。

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.ldap.*
//...
install(Authentication) {
    basic {
        validate { credentials ->
            // 驗證 LDAP 使用者
        }
    }
}
```

`validate` 函式將用於檢查使用者憑據。
 

### 步驟 2：驗證 LDAP 使用者 {id="authenticate"}

若要驗證 LDAP 使用者，您需要呼叫 [ldapAuthenticate](https://api.ktor.io/ktor-server-auth-ldap/io.ktor.server.auth.ldap/ldap-authenticate.html) 函式。此函式接受 [UserPasswordCredential](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-password-credential/index.html) 並根據指定的 LDAP 伺服器進行校驗。

<Tabs group="auth-dsl">
<TabItem title="Classic" group-key="classic">

```kotlin
install(Authentication) {
    basic("auth-ldap") {
        validate { credentials ->
            val url = "ldap://0.0.0.0:389"
            val userDNFormat = "cn=%s,dc=ktor,dc=io"
            ldapAuthenticate(credentials, url, userDNFormat)
        }
    }
}
```

`validate` 函式在驗證成功時會傳回 [UserIdPrincipal](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-id-principal/index.html)，若驗證失敗則傳回 `null`。

您可以選擇性地為已驗證使用者新增額外的校驗。

```kotlin
install(Authentication) {
    basic("auth-ldap") {
        validate { credentials ->
            val url = "ldap://localhost:389"
            val userDNFormat = "cn=%s,dc=ktor,dc=io"
            ldapAuthenticate(credentials, url, userDNFormat) {
                if (it.name == it.password) {
                    UserIdPrincipal(it.name)
                } else {
                    null
                }
            }
        }
    }
}
```

</TabItem>
<TabItem title="Type-safe" group-key="typed">

<note>
    <p>
        型別安全驗證方案 API 為實驗性功能。它可能隨時被移除或變更。
        需要明確加入（opt-in）。如需更多詳細資訊，請參閱
        <a href="server-typed-auth.md#prerequisites">啟用 API</a>。
    </p>
</note>

目前沒有專門針對 LDAP 的型別安全驗證方案。請在型別安全 [`basic`](server-basic-auth.md)、[`digest`](server-digest-auth.md) 或 [`form`](server-form-based-auth.md) 方案的 `validate` 區塊內呼叫 `ldapAuthenticate`。

將區塊傳遞給 `ldapAuthenticate` 以傳回您自訂的 principal 型別：

```kotlin
data class User(val name: String)

val ldapAuth = basic<User>("auth-ldap") {
    validate { credentials ->
        val url = "ldap://0.0.0.0:389"
        val userDNFormat = "cn=%s,dc=ktor,dc=io"
        ldapAuthenticate(credentials, url, userDNFormat) {
            User(it.name)
        }
    }
}
```

該區塊還允許您為已驗證使用者新增校驗：

```kotlin
val ldapAuth = basic<User>("auth-ldap") {
    validate { credentials ->
        val url = "ldap://localhost:389"
        val userDNFormat = "cn=%s,dc=ktor,dc=io"
        ldapAuthenticate(credentials, url, userDNFormat) {
            if (it.name == it.password) {
                User(it.name)
            } else {
                null
            }
        }
    }
}
```

如需完整的 API，請參閱[型別安全驗證](server-typed-auth.md)。

</TabItem>
</Tabs>

### 步驟 3：保護特定資源 {id="authenticate-route"}

<Tabs group="auth-dsl">
<TabItem title="Classic" group-key="classic">

設定 LDAP 後，您可以使用 **[authenticate](server-auth.md#authenticate-route)** 函式來保護應用程式中的特定資源。在驗證成功的情況下，您可以在路由處理常式中使用 `call.principal` 函式取得已驗證的 [UserIdPrincipal](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-id-principal/index.html)，並獲取已驗證使用者的名稱。

```kotlin
routing {
    authenticate("auth-ldap") {
        get("/") {
            val user = call.principal<UserIdPrincipal>()
            call.respondText("Hello, ${user?.name}!")
        }
    }
}
```

</TabItem>
<TabItem title="Type-safe" group-key="typed">

將方案傳遞給 `authenticateWith()`。在該區塊內，`call.principal` 即為您的 principal 型別且永遠不會為 `null`，因此不需要型別轉換或 null 檢查：

```kotlin
routing {
    authenticateWith(ldapAuth) {
        get("/") {
            call.respondText("Hello, ${call.principal.name}!")
        }
    }
}
```

</TabItem>
</Tabs>

您可以在此處找到完整的可執行範例：[auth-ldap](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-ldap)。

> 請記住，目前的 LDAP 實作是同步的。