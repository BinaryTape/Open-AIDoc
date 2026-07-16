[//]: # (title: LDAP)

<show-structure for="chapter" depth="2"/>

<tldr>
<p>
<b>必須の依存関係</b>: <code>io.ktor:ktor-server-auth</code>, <code>io.ktor:ktor-server-auth-ldap</code>
</p>
<var name="example_name" value="auth-ldap"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">ネイティブサーバー</Links>のサポート</b>: ✖️
</p>
</tldr>

LDAPは、ユーザーに関する情報を保存できるさまざまなディレクトリサービスを操作するためのプロトコルです。Ktorでは、[ベーシック](server-basic-auth.md)、[ダイジェスト](server-digest-auth.md)、または[フォームベース](server-form-based-auth.md)の認証スキームを使用してLDAPユーザーを認証できます。

> Ktorにおける認証と認可に関する一般的な情報は、[Ktorサーバーにおける認証と認可](server-auth.md)セクションで確認できます。

## 依存関係の追加 {id="add_dependencies"}
`LDAP`認証を有効にするには、ビルドスクリプトに`ktor-server-auth`と`ktor-server-auth-ldap`アーティファクトを含める必要があります。

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" title="Sample" code="            implementation(&quot;io.ktor:ktor-server-auth:$ktor_version&quot;)&#10;            implementation(&quot;io.ktor:ktor-server-auth-ldap:$ktor_version&quot;)"></code-block>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" title="Sample" code="            implementation &quot;io.ktor:ktor-server-auth:$ktor_version&quot;&#10;            implementation &quot;io.ktor:ktor-server-auth-ldap:$ktor_version&quot;"></code-block>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" title="Sample" code="&amp;lt;dependency&amp;gt;&#10;&amp;lt;groupId&amp;gt;io.ktor&amp;lt;/groupId&amp;gt;&#10;&amp;lt;artifactId&amp;gt;ktor-server-auth&amp;lt;/artifactId&amp;gt;&#10;&amp;lt;version&amp;gt;${ktor_version}&amp;lt;/version&amp;gt;&#10;&amp;lt;/dependency&amp;gt;&#10;&amp;lt;dependency&amp;gt;&#10;&amp;lt;groupId&amp;gt;io.ktor&amp;lt;/groupId&amp;gt;&#10;&amp;lt;artifactId&amp;gt;ktor-server-auth-ldap&amp;lt;/artifactId&amp;gt;&#10;&amp;lt;version&amp;gt;${ktor_version}&amp;lt;/version&amp;gt;&#10;&amp;lt;/dependency&amp;gt;"></code-block>
   </TabItem>
</Tabs>

## LDAPの構成 {id="configure"}

### ステップ1：認証プロバイダーの選択 {id="choose-auth"}

LDAPユーザーを認証するには、まずユーザー名とパスワードを検証するための認証プロバイダーを選択する必要があります。Ktorでは、[ベーシック](server-basic-auth.md)、[ダイジェスト](server-digest-auth.md)、または[フォームベース](server-form-based-auth.md)のプロバイダーをこれに使用できます。例えば、`basic`認証プロバイダーを使用するには、`install`ブロック内で[basic](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/basic.html)関数を呼び出します。

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.ldap.*
//...
install(Authentication) {
    basic {
        validate { credentials ->
            // Authenticate an LDAP user
        }
    }
}
```

`validate`関数は、ユーザーの認証情報をチェックするために使用されます。
 

### ステップ2：LDAPユーザーの認証 {id="authenticate"}

LDAPユーザーを認証するには、[ldapAuthenticate](https://api.ktor.io/ktor-server-auth-ldap/io.ktor.server.auth.ldap/ldap-authenticate.html)関数を呼び出す必要があります。この関数は[UserPasswordCredential](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-password-credential/index.html)を受け取り、指定されたLDAPサーバーに対して検証を行います。

```kotlin
install(Authentication) {
    basic("auth-ldap") {
        validate { credentials ->
            ldapAuthenticate(credentials, "ldap://0.0.0.0:389", "cn=%s,dc=ktor,dc=io")
        }
    }
}
```

`validate`関数は、認証に成功した場合には[UserIdPrincipal](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-id-principal/index.html)を返し、認証に失敗した場合には`null`を返します。

オプションで、認証されたユーザーに対して追加の検証を加えることができます。

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

### ステップ3：特定のリソースの保護 {id="authenticate-route"}

LDAPを構成した後、**[authenticate](server-auth.md#authenticate-route)**関数を使用してアプリケーション内の特定のリソースを保護できます。認証に成功した場合、ルートハンドラー内で`call.principal`関数を使用して認証済みの[UserIdPrincipal](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-id-principal/index.html)を取得し、認証されたユーザーの名前を取得できます。

```kotlin
routing {
    authenticate("auth-ldap") {
        get("/") {
            call.respondText("Hello, ${call.principal<UserIdPrincipal>()?.name}!")
        }
    }
}
```

実行可能な完全な例はこちらで確認できます：[auth-ldap](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-ldap)。

> 現在のLDAP実装は同期（synchronous）であることに注意してください。