[//]: # (title: LDAP)

<show-structure for="chapter" depth="2"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:ktor-server-auth</code>, <code>io.ktor:ktor-server-auth-ldap</code>
</p>
<var name="example_name" value="auth-ldap"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">Native サーバー</Links>のサポート</b>: ✖️
</p>
</tldr>

LDAP は、ユーザーに関する情報を保存できるさまざまなディレクトリサービスと連携するためのプロトコルです。Ktor では、[basic](server-basic-auth.md)、[digest](server-digest-auth.md)、または[フォームベース（form-based）](server-form-based-auth.md)の認証スキームを使用して LDAP ユーザーを認証できます。

> Ktor における認証と認可の一般的な情報については、[Ktor Server での認証と認可](server-auth.md)セクションを参照してください。

## 依存関係の追加 {id="add_dependencies"}
`LDAP` 認証を有効にするには、ビルドスクリプトに `ktor-server-auth` および `ktor-server-auth-ldap` アーティファクトを含める必要があります。

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

## LDAP の設定 {id="configure"}

### ステップ 1: 認証プロバイダーを選択する {id="choose-auth"}

LDAP ユーザーを認証するには、まずユーザー名とパスワードの検証を行う認証プロバイダーを選択する必要があります。Ktor では、[basic](server-basic-auth.md)、[digest](server-digest-auth.md)、または[form-based](server-form-based-auth.md) プロバイダーをこの用途に使用できます。例えば、`basic` 認証プロバイダーを使用するには、`install` ブロック内で [basic](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/basic.html) 関数を呼び出します。

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.ldap.*
//...
install(Authentication) {
    basic {
        validate { credentials ->
            // LDAP ユーザーを認証
        }
    }
}
```

`validate` 関数は、ユーザーの資格情報を検証するために使用されます。
 

### ステップ 2: LDAP ユーザーを認証する {id="authenticate"}

LDAP ユーザーを認証するには、[ldapAuthenticate](https://api.ktor.io/ktor-server-auth-ldap/io.ktor.server.auth.ldap/ldap-authenticate.html) 関数を呼び出す必要があります。この関数は [UserPasswordCredential](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-password-credential/index.html) を受け取り、指定された LDAP サーバーに対してそれを検証します。

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

`validate` 関数は、認証に成功した場合は [UserIdPrincipal](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-id-principal/index.html) を返し、失敗した場合は `null` を返します。

必要に応じて、認証されたユーザーに対して追加の検証を加えることもできます。

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
        型安全な認証スキームの API は実験的なものです。予告なく削除または変更される可能性があります。
        利用にはオプトインが必要です。詳細については、
        <a href="server-typed-auth.md#prerequisites">型安全な認証のドキュメント</a>を参照してください。
    </p>
</note>

LDAP 専用の型安全な認証スキームはありません。型安全な [`basic`](server-basic-auth.md)、[`digest`](server-digest-auth.md)、または [`form`](server-form-based-auth.md) スキームの `validate` ブロック内で `ldapAuthenticate` を呼び出してください。

独自のプリンシパル型を返すには、`ldapAuthenticate` にブロックを渡します。

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

このブロックでは、認証されたユーザーに対する検証を追加することもできます。

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

完全な API については、[型安全な認証](server-typed-auth.md)を参照してください。

</TabItem>
</Tabs>

### ステップ 3: 特定のリソースを保護する {id="authenticate-route"}

<Tabs group="auth-dsl">
<TabItem title="Classic" group-key="classic">

LDAP の設定後、**[authenticate](server-auth.md#authenticate-route)** 関数を使用してアプリケーション内の特定のリソースを保護できます。認証に成功した場合、ルートハンドラー内で `call.principal` 関数を使用して認証済みの [UserIdPrincipal](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-id-principal/index.html) を取得し、認証されたユーザーの名前を取得できます。

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

スキームを `authenticateWith()` に渡します。ブロック内では、`call.principal` は指定したプリンシパル型になり、`null` になることはないため、キャストや null チェックは不要です。

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

完全に実行可能なサンプルはこちらで確認できます: [auth-ldap](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-ldap)

> 現在の LDAP 実装は同期的（synchronous）であることに注意してください。