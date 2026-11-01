[//]: # (title: Ktor Server でのセッション認証)

<show-structure for="chapter" depth="2"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:ktor-server-auth</code>, <code>io.ktor:ktor-server-sessions</code>
</p>
<var name="example_name" value="auth-form-session"/>
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

[セッション](server-sessions.md)は、異なる HTTP リクエスト間でデータを保持するためのメカニズムを提供します。典型的なユースケースには、ログインしたユーザーの ID の保存、ショッピングカートの内容、またはクライアント側でのユーザー設定の保持などがあります。

Ktor では、関連付けられたセッションをすでに持っているユーザーを `session` プロバイダーを使用して認証できます。たとえば、ユーザーが最初に [Web フォーム](server-form-based-auth.md)を使用してログインしたときに、ユーザー名を Cookie セッションに保存し、後続のリクエストで `session` プロバイダーを使用してこのユーザーを認可できます。

> Ktor での認証と認可に関する一般的な情報については、[Ktor Server での認証と認可](server-auth.md)セクションを参照してください。

> Ktor は型安全なセッション認証スキームも提供しています。これにより、ルートハンドラーに非 null のプリンシパルと保存されたセッションへの読み書きアクセス権が提供され、セッション型がプリンシパル型と分離されて保持されます。[型安全なセッション認証](server-typed-session-auth.md)を参照してください。
>
{style="tip"}

## 依存関係の追加 {id="add_dependencies"}
`session` 認証を有効にするには、ビルドスクリプトに以下のアーティファクトを含める必要があります。

* セッションを使用するために `ktor-server-sessions` 依存関係を追加します。

  <var name="artifact_name" value="ktor-server-sessions"/>
  <var name="ktor_version_catalog_name" value="ktorLibs.server.sessions"/>
  <Tabs group="languages">
      <TabItem title="Gradle (Kotlin)" group-key="kotlin">
          <code-block lang="Kotlin" code="              implementation(%ktor_version_catalog_name%)"/>
          <note>
              上記のコードスニペットでは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">
              Ktor バージョンカタログ</a>を使用しています。
          </note>
      </TabItem>
      <TabItem title="Gradle (Groovy)" group-key="groovy">
          <code-block lang="Groovy" code="              implementation %ktor_version_catalog_name%"/>
          <note>
              上記のコードスニペットでは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">
              Ktor バージョンカタログ</a>を使用しています。
          </note>
      </TabItem>
      <TabItem title="Maven" group-key="maven">
          <code-block lang="XML" code="              &lt;dependency&gt;&#10;                  &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                  &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                  &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;              &lt;/dependency&gt;"/>
      </TabItem>
  </Tabs>

* 認証用に `ktor-server-auth` 依存関係を追加します。

  <var name="artifact_name" value="ktor-server-auth"/>
  <var name="ktor_version_catalog_name" value="ktorLibs.server.auth"/>
  <Tabs group="languages">
      <TabItem title="Gradle (Kotlin)" group-key="kotlin">
          <code-block lang="Kotlin" code="              implementation(%ktor_version_catalog_name%)"/>
          <note>
              上記のコードスニペットでは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">
              Ktor バージョンカタログ</a>を使用しています。
          </note>
      </TabItem>
      <TabItem title="Gradle (Groovy)" group-key="groovy">
          <code-block lang="Groovy" code="              implementation %ktor_version_catalog_name%"/>
          <note>
              上記のコードスニペットでは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">
              Ktor バージョンカタログ</a>を使用しています。
          </note>
      </TabItem>
      <TabItem title="Maven" group-key="maven">
          <code-block lang="XML" code="              &lt;dependency&gt;&#10;                  &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                  &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                  &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;              &lt;/dependency&gt;"/>
      </TabItem>
  </Tabs>

## セッション認証のフロー {id="flow"}

セッションによる認証フローは、アプリケーションでユーザーがどのように認証されるかによって異なり、またそれに依存します。[フォームベース認証](server-form-based-auth.md)でのフロー例を見てみましょう。

1. クライアントがサーバーに対して、Web フォームデータ（ユーザー名とパスワードを含む）を含んだリクエストを送信します。
2. サーバーがクライアントから送信された資格情報を検証し、ユーザー名を Cookie セッションに保存して、要求されたコンテンツとユーザー名を含む Cookie を返します。
3. クライアントが保護されたリソースに対して Cookie を伴う後続のリクエストを送信します。
4. 受信した Cookie データに基づいて、Ktor はこのユーザーの Cookie セッションが存在するかを確認し、任意で受信したセッションデータに対して追加の検証を実行します。検証に成功した場合、サーバーは要求されたコンテンツを返します。

## セッション認証のインストール {id="install"}
`session` 認証プロバイダーをインストールするには、`install` ブロック内で必要なセッション型を指定して [session](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/session.html) 関数を呼び出します。

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.sessions.*
//...
install(Authentication) {
    session<UserSession> {
        // セッション認証を設定
    }
}
```

## セッション認証の設定 {id="configure"}

このセクションでは、[フォームベース認証](server-form-based-auth.md)でユーザーを認証し、そのユーザーに関する情報を Cookie セッションに保存して、後続のリクエストで `session` プロバイダーを使用してこのユーザーを認可する方法を説明します。

> 完全な例については、[auth-form-session](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-form-session) を参照してください。

### ステップ 1: データクラスの作成 {id="data-class"}

まず、セッションデータを保存するためのデータクラスを作成する必要があります。

```kotlin
@Serializable
data class UserSession(val name: String, val count: Int)
```

### ステップ 2: セッションのインストールと設定 {id="install-session"}

データクラスを作成した後、`Sessions` プラグインをインストールして設定する必要があります。以下の例では、指定された Cookie パスと有効期限を持つ Cookie セッションをインストールおよび設定しています。

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

`session` 認証プロバイダーは、[`SessionAuthenticationProvider.Config`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-session-authentication-provider/-config/index.html) クラスを介してその設定を公開します。以下の例では、次の設定が指定されています。

* `validate()` 関数は [セッションインスタンス](#data-class) をチェックし、認証に成功した場合は `Any` 型のプリンシパルを返します。
* `challenge()` 関数は、認証が失敗したときに実行されるアクションを指定します。たとえば、ログインページにリダイレクトしたり、[`UnauthorizedResponse`](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-unauthorized-response/index.html) を送信したりできます。

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

ログインしたユーザーに関する情報をセッションに保存するには、[`call.sessions.set()`](server-sessions.md#use_sessions) 関数を使用します。

以下の例は、Web フォームを使用したシンプルな認証フローを示しています。

```kotlin
authenticate("auth-form") {
    post("/login") {
        val principal =
            call.principal<UserIdPrincipal>()
        val userName = principal?.name.toString()
        val session = UserSession(
            name = userName,
            count = 1
        )
        call.sessions.set(session)
        call.respondRedirect("/hello")
    }
}
```

> フォームベース認証フローの詳細については、[フォームベース認証](server-form-based-auth.md)のドキュメントを参照してください。

### ステップ 5: 特定のリソースの保護 {id="authenticate-route"}

`session` プロバイダーを設定した後、[`authenticate()`](server-auth.md#authenticate-route) 関数を使用してアプリケーション内の特定のリソースを保護できます。

認証に成功すると、ルートハンドラー内で `call.principal()` 関数を使用して、認証されたプリンシパル（この場合は [`UserSession`](#data-class) インスタンス）を取得できます。

```kotlin
authenticate("auth-session") {
    get("/hello") {
        val userSession = call.principal<UserSession>()
        val next = userSession?.copy(
            count = userSession.count + 1
        )
        call.sessions.set(next)
        call.respondText(
            "Hello, ${userSession?.name}! " +
                "Visit count is ${userSession?.count}."
        )
    }
}
```

> 完全な例については、[auth-form-session](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-form-session) を参照してください。