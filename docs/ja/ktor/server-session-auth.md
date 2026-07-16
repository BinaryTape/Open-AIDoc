[//]: # (title: Ktor Server におけるセッション認証)

<show-structure for="chapter" depth="2"/>

<tldr>
<p>
<b>必要となる依存関係</b>: <code>io.ktor:ktor-server-auth</code>, <code>io.ktor:ktor-server-sessions</code>
</p>
<var name="example_name" value="auth-form-session"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">Native サーバー</Links>のサポート</b>: ✖️
</p>
</tldr>

[セッション](server-sessions.md)は、異なる HTTP リクエスト間でデータを保持するための仕組みを提供します。典型的なユースケースには、ログインしたユーザーの ID やショッピングカートの内容の保存、クライアント上でのユーザー設定の保持などが含まれます。 

Ktor では、すでに関連付けられたセッションを持つユーザーを `session` プロバイダーを使用して認証できます。例えば、ユーザーが初めて[ウェブフォーム](server-form-based-auth.md)を使用してログインしたときに、ユーザー名をクッキーセッションに保存し、その後のリクエストで `session` プロバイダーを使用してこのユーザーを認可することができます。

> Ktor における認証と認可に関する一般的な情報は、[Ktor Server での認証と認可](server-auth.md)セクションで確認できます。

## 依存関係の追加 {id="add_dependencies"}
`session` 認証を有効にするには、ビルドスクリプトに以下のアーティファクトを含める必要があります。

* セッションを使用するために `ktor-server-sessions` 依存関係を追加します。

  <var name="artifact_name" value="ktor-server-sessions"/>
  <Tabs group="languages">
      <TabItem title="Gradle (Kotlin)" group-key="kotlin">
          <code-block lang="Kotlin" code="              implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
      </TabItem>
      <TabItem title="Gradle (Groovy)" group-key="groovy">
          <code-block lang="Groovy" code="              implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
      </TabItem>
      <TabItem title="Maven" group-key="maven">
          <code-block lang="XML" code="              &lt;dependency&gt;&#10;                  &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                  &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                  &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;              &lt;/dependency&gt;"></code-block>
      </TabItem>
  </Tabs>

* 認証のために `ktor-server-auth` 依存関係を追加します。

  <var name="artifact_name" value="ktor-server-auth"/>
  <Tabs group="languages">
      <TabItem title="Gradle (Kotlin)" group-key="kotlin">
          <code-block lang="Kotlin" code="              implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
      </TabItem>
      <TabItem title="Gradle (Groovy)" group-key="groovy">
          <code-block lang="Groovy" code="              implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
      </TabItem>
      <TabItem title="Maven" group-key="maven">
          <code-block lang="XML" code="              &lt;dependency&gt;&#10;                  &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                  &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                  &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;              &lt;/dependency&gt;"></code-block>
      </TabItem>
  </Tabs>

## セッション認証のフロー {id="flow"}

セッションによる認証フローは、アプリケーションでユーザーがどのように認証されるかによって異なる場合があります。[フォームベースの認証](server-form-based-auth.md)の場合の例を見てみましょう。

1. クライアントは、ウェブフォームデータ（ユーザー名とパスワードを含む）を含むリクエストをサーバーに送信します。
2. サーバーは、クライアントから送信された認証情報を検証し、ユーザー名をクッキーセッションに保存し、リクエストされたコンテンツとユーザー名を含むクッキーを返します。
3. クライアントは、保護されたリソースに対してクッキーを含む後続のリクエストを行います。
4. 受信したクッキーデータに基づき、Ktor はこのユーザーのクッキーセッションが存在することを確認し、オプションで受信したセッションデータに対して追加の検証を行います。検証が成功した場合、サーバーはリクエストされたコンテンツを返します。

## セッション認証のインストール {id="install"}
`session` 認証プロバイダーをインストールするには、`install` ブロック内で必要なセッションタイプを指定して [session](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/session.html) 関数を呼び出します。

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.sessions.*
//...
install(Authentication) {
    session<UserSession> {
        // セッション認証の設定
    }
}
```

## セッション認証の設定 {id="configure"}

このセクションでは、[フォームベースの認証](server-form-based-auth.md)を使用してユーザーを認証し、そのユーザーに関する情報をクッキーセッションに保存し、その後のリクエストで `session` プロバイダーを使用してこのユーザーを認可する方法を説明します。

> 完全な例については、[auth-form-session](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-form-session) を参照してください。

### ステップ 1: データクラスの作成 {id="data-class"}

まず、セッションデータを保存するためのデータクラスを作成する必要があります。

```kotlin
@Serializable
data class UserSession(val name: String, val count: Int)
```

### ステップ 2: セッションのインストールと設定 {id="install-session"}

データクラスを作成した後、`Sessions` プラグインをインストールして設定する必要があります。以下の例では、指定されたクッキーパスと有効期限を持つクッキーセッションをインストールして設定しています。

```kotlin
install(Sessions) {
    cookie<UserSession>("user_session") {
        cookie.path = "/"
        cookie.maxAgeInSeconds = 60
    }
}
```

> セッションの設定の詳細については、[セッション設定の概要](server-sessions.md#configuration_overview)を参照してください。

### ステップ 3: セッション認証の設定 {id="configure-session-auth"}

`session` 認証プロバイダーは、[
`SessionAuthenticationProvider.Config`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-session-authentication-provider/-config/index.html)
クラスを通じて設定を公開します。以下の例では、次の設定が指定されています。

* `validate()` 関数は、[セッションインスタンス](#data-class)をチェックし、認証に成功した場合は `Any` 型のプリンシパルを返します。
* `challenge()` 関数は、認証が失敗したときに実行されるアクションを指定します。例えば、ログインページにリダイレクトしたり、[
  `UnauthorizedResponse`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-unauthorized-response/index.html) を送信したりできます。

```kotlin
install(Authentication) {
    session<UserSession>("auth-session") {
        validate { session ->
            if(session.name.startsWith("jet")) {
                session
            } else {
                null
            }
        }
        challenge {
            call.respondRedirect("/login")
        }
    }
}
```

### ステップ 4: セッションにユーザーデータを保存する {id="save-session"}

ログインしたユーザーに関する情報をセッションに保存するには、[
`call.sessions.set()`](server-sessions.md#use_sessions)
関数を使用します。

以下の例は、ウェブフォームを使用したシンプルな認証フローを示しています。

```kotlin
authenticate("auth-form") {
    post("/login") {
        val userName = call.principal<UserIdPrincipal>()?.name.toString()
        call.sessions.set(UserSession(name = userName, count = 1))
        call.respondRedirect("/hello")
    }
}
```

> フォームベースの認証フローの詳細については、[フォームベースの認証](server-form-based-auth.md)のドキュメントを参照してください。

### ステップ 5: 特定のリソースを保護する {id="authenticate-route"}

`session` プロバイダーを設定した後、アプリケーション内の特定のリソースを [`authenticate()`](server-auth.md#authenticate-route) 関数を使用して保護できます。

認証に成功すると、ルートハンドラー内で `call.principal()` 関数を使用して、認証されたプリンシパル（この場合は [`UserSession`](#data-class) インスタンス）を取得できます。

```kotlin
authenticate("auth-session") {
    get("/hello") {
        val userSession = call.principal<UserSession>()
        call.sessions.set(userSession?.copy(count = userSession.count + 1))
        call.respondText("Hello, ${userSession?.name}! Visit count is ${userSession?.count}.")
    }
}
```

> 完全な例については、[auth-form-session](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-form-session) を参照してください。