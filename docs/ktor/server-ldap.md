[//]: # (title: LDAP)

<show-structure for="chapter" depth="2"/>

<tldr>
<p>
<b>必需依赖项</b>：<code>io.ktor:ktor-server-auth</code>、<code>io.ktor:ktor-server-auth-ldap</code>
</p>
<var name="example_name" value="auth-ldap"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor 支持 Kotlin/Native，允许您在没有额外运行时或虚拟机的情况下运行服务器。">Native 服务器</Links>支持</b>：✖️
</p>
</tldr>

LDAP 是一种用于与各种可存储用户信息的目录服务配合使用的协议。Ktor 允许您使用 [basic](server-basic-auth.md)、[digest](server-digest-auth.md) 或[基于表单](server-form-based-auth.md)的身份验证方案来验证 LDAP 用户。

> 您可以在 [Ktor Server 中的身份验证与授权](server-auth.md)部分获取关于 Ktor 身份验证和授权的常规信息。

## 添加依赖项 {id="add_dependencies"}
要启用 `LDAP` 身份验证，您需要在构建脚本中包含 `ktor-server-auth` 和 `ktor-server-auth-ldap` 构件：

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

## 配置 LDAP {id="configure"}

### 第 1 步：选择身份验证提供程序 {id="choose-auth"}

要对 LDAP 用户进行身份验证，首先需要选择用于用户名和密码验证的身份验证提供程序。在 Ktor 中，可以使用 [basic](server-basic-auth.md)、[digest](server-digest-auth.md) 或[基于表单](server-form-based-auth.md)的提供程序。例如，若要使用 `basic` 身份验证提供程序，请在 `install` 块中调用 [basic](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/basic.html) 函数。

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.ldap.*
//...
install(Authentication) {
    basic {
        validate { credentials ->
            // 对 LDAP 用户进行身份验证
        }
    }
}
```

`validate` 函数将用于检查用户凭据。
 

### 第 2 步：验证 LDAP 用户身份 {id="authenticate"}

要验证 LDAP 用户身份，需要调用 [ldapAuthenticate](https://api.ktor.io/ktor-server-auth-ldap/io.ktor.server.auth.ldap/ldap-authenticate.html) 函数。该函数接收 [UserPasswordCredential](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-password-credential/index.html) 并根据指定的 LDAP 服务器对其进行验证。

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

在身份验证成功时，`validate` 函数将返回 [UserIdPrincipal](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-id-principal/index.html)；若验证失败，则返回 `null`。

（可选）您可以为已通过身份验证的用户添加额外的验证逻辑。

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
        类型安全身份验证方案 API 目前为实验性功能。它可能会在任何时候被移除或更改。
        需要明确选择启用（Opt-in）。有关更多详细信息，请参阅
        <a href="server-typed-auth.md#prerequisites">类型安全身份验证文档</a>。
    </p>
</note>

目前没有专用于 LDAP 的类型安全身份验证方案。请在类型安全 [`basic`](server-basic-auth.md)、[`digest`](server-digest-auth.md) 或 [`form`](server-form-based-auth.md) 方案的 `validate` 块内调用 `ldapAuthenticate`。

向 `ldapAuthenticate` 传递一个代码块以返回自定义的 Principal 类型：

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

该代码块还允许您为已通过身份验证的用户添加校验：

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

如需了解完整的 API，请参阅[类型安全身份验证](server-typed-auth.md)。

</TabItem>
</Tabs>

### 第 3 步：保护特定资源 {id="authenticate-route"}

<Tabs group="auth-dsl">
<TabItem title="Classic" group-key="classic">

配置好 LDAP 后，可以使用 **[authenticate](server-auth.md#authenticate-route)** 函数来保护应用程序中的特定资源。在身份验证成功的情况下，可以在路由处理程序中使用 `call.principal` 函数检索已验证的 [UserIdPrincipal](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-id-principal/index.html)，并获取已验证用户的名称。

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

将该方案传递给 `authenticateWith()`。在该代码块内，`call.principal` 即为您的 Principal 类型，且绝不会为 `null`，因此不需要进行类型转换或 null 检查：

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

可以在此处找到完整的可运行示例：[auth-ldap](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-ldap)。

> 请注意，当前的 LDAP 实现是同步的。