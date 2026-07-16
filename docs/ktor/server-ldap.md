[//]: # (title: LDAP)

<show-structure for="chapter" depth="2"/>

<tldr>
<p>
<b>所需依赖项</b>：<code>io.ktor:ktor-server-auth</code>, <code>io.ktor:ktor-server-auth-ldap</code>
</p>
<var name="example_name" value="auth-ldap"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">原生服务器</Links>支持</b>：✖️
</p>
</tldr>

LDAP 是一种用于处理各种存储用户信息的目录服务的协议。Ktor 允许您使用 [基本](server-basic-auth.md) (basic)、[摘要](server-digest-auth.md) (digest) 或 [基于表单](server-form-based-auth.md) (form-based) 的身份验证架构来验证 LDAP 用户。

> 您可以在 [Ktor Server 中的身份验证与授权](server-auth.md) 章节中获取有关 Ktor 身份验证与授权的常规信息。

## 添加依赖项 {id="add_dependencies"}
要启用 `LDAP` 身份验证，您需要在构建脚本中包含 `ktor-server-auth` 和 `ktor-server-auth-ldap` 构件：

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" title="示例" code="            implementation(&quot;io.ktor:ktor-server-auth:$ktor_version&quot;)&#10;            implementation(&quot;io.ktor:ktor-server-auth-ldap:$ktor_version&quot;)"></code-block>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" title="示例" code="            implementation &quot;io.ktor:ktor-server-auth:$ktor_version&quot;&#10;            implementation &quot;io.ktor:ktor-server-auth-ldap:$ktor_version&quot;"></code-block>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" title="示例" code="&amp;lt;dependency&amp;gt;&#10;&amp;lt;groupId&amp;gt;io.ktor&amp;lt;/groupId&amp;gt;&#10;&amp;lt;artifactId&amp;gt;ktor-server-auth&amp;lt;/artifactId&amp;gt;&#10;&amp;lt;version&amp;gt;${ktor_version}&amp;lt;/version&amp;gt;&#10;&amp;lt;/dependency&amp;gt;&#10;&amp;lt;dependency&amp;gt;&#10;&amp;lt;groupId&amp;gt;io.ktor&amp;lt;/groupId&amp;gt;&#10;&amp;lt;artifactId&amp;gt;ktor-server-auth-ldap&amp;lt;/artifactId&amp;gt;&#10;&amp;lt;version&amp;gt;${ktor_version}&amp;lt;/version&amp;gt;&#10;&amp;lt;/dependency&amp;gt;"></code-block>
   </TabItem>
</Tabs>

## 配置 LDAP {id="configure"}

### 步骤 1：选择身份验证提供者 {id="choose-auth"}

要验证 LDAP 用户，您首先需要为用户名和密码验证选择一个身份验证提供者。在 Ktor 中，[基本](server-basic-auth.md) (basic)、[摘要](server-digest-auth.md) (digest) 或 [基于表单](server-form-based-auth.md) (form-based) 提供者均可用于此目的。例如，要使用 `basic` 身份验证提供者，请在 `install` 块内调用 [basic](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/basic.html) 函数。

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.ldap.*
//...
install(Authentication) {
    basic {
        validate { credentials ->
            // 验证 LDAP 用户
        }
    }
}
```

`validate` 函数将用于检查用户凭据。
 

### 步骤 2：验证 LDAP 用户 {id="authenticate"}

要验证 LDAP 用户，您需要调用 [ldapAuthenticate](https://api.ktor.io/ktor-server-auth-ldap/io.ktor.server.auth.ldap/ldap-authenticate.html) 函数。此函数接受 [UserPasswordCredential](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-password-credential/index.html) 并根据指定的 LDAP 服务器对其进行验证。

```kotlin
install(Authentication) {
    basic("auth-ldap") {
        validate { credentials ->
            ldapAuthenticate(credentials, "ldap://0.0.0.0:389", "cn=%s,dc=ktor,dc=io")
        }
    }
}
```

在身份验证成功的情况下，`validate` 函数返回 [UserIdPrincipal](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-id-principal/index.html)，如果身份验证失败则返回 `null`。

（可选）您可以为已验证身份的用户添加额外的验证。

```kotlin
install(Authentication) {
    basic("auth-ldap") {
        validate { credentials ->
            ldapAuthenticate(credentials, "ldap://localhost:389", "cn=%s,dc=ktor,dc=io") {
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

### 步骤 3：保护特定资源 {id="authenticate-route"}

配置 LDAP 后，您可以使用 **[authenticate](server-auth.md#authenticate-route)** 函数保护应用程序中的特定资源。在身份验证成功的情况下，您可以在路由处理程序中使用 `call.principal` 函数检索已验证身份的 [UserIdPrincipal](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-id-principal/index.html) 并获取已验证身份的用户的名称。

```kotlin
routing {
    authenticate("auth-ldap") {
        get("/") {
            call.respondText("Hello, ${call.principal<UserIdPrincipal>()?.name}!")
        }
    }
}
```

您可以在此处找到完整的可运行示例：[auth-ldap](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-ldap)。

> 请记住，当前的 LDAP 实现是同步的。