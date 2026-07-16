[//]: # (title: Ktor ServerにおけるBasic認証)

<show-structure for="chapter" depth="2"/>

<var name="artifact_name" value="ktor-server-auth"/>

<tldr>
<p>
<b>必須の依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<p>
<b>コード例</b>: <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-basic">auth-basic</a>, <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-basic-hash-table">auth-basic-hash-table</a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">Nativeサーバー</Links>のサポート</b>: ✅
</p>
</tldr>

Basic認証スキームは、アクセス制御と認証に使用される[HTTPフレームワーク](https://developer.mozilla.org/ja/docs/Web/HTTP/Authentication)の一部です。このスキームでは、ユーザーの認証情報は、Base64を使用してエンコードされたユーザー名とパスワードのペアとして送信されます。

Ktorでは、ユーザーのログインや特定の[ルート](server-routing.md)の保護にBasic認証を使用できます。Ktorにおける認証の一般的な情報については、[Ktor Serverにおける認証と認可](server-auth.md)セクションを参照してください。

> Basic認証はユーザー名とパスワードをプレーンテキストとして送信するため、機密情報を保護するには[HTTPS/TLS](server-ssl.md)を使用する必要があります。

## 依存関係の追加 {id="add_dependencies"}
`basic`認証を有効にするには、ビルドスクリプトに`%artifact_name%`アーティファクトを含める必要があります。

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

## Basic認証のフロー {id="flow"}

Basic認証のフローは以下の通りです：

1. クライアントが、サーバーアプリケーション内の特定の[ルート](server-routing.md)に対して、`Authorization`ヘッダーなしでリクエストを送信します。
2. サーバーはクライアントに対して`401` (Unauthorized) レスポンスステータスを返し、`WWW-Authenticate`レスポンスヘッダーを使用して、ルートの保護にBasic認証スキームが使用されているという情報を提供します。典型的な`WWW-Authenticate`ヘッダーは以下のようになります：
   
   ```
   WWW-Authenticate: Basic realm="Access to the '/' path", charset="UTF-8"
   ```
   {style="block"}
   
   Ktorでは、`basic`認証プロバイダーを[構成](#configure-provider)する際に、対応するプロパティを使用してrealm（レルム）とcharset（文字セット）を指定できます。

3. 通常、クライアントはユーザーが認証情報を入力できるログインダイアログを表示します。その後、クライアントはBase64でエンコードされたユーザー名とパスワードのペアを含む`Authorization`ヘッダーを付けてリクエストを送信します。例：
   
   ```
   Authorization: Basic amV0YnJhaW5zOmZvb2Jhcg
   ```
   {style="block"}

4. サーバーはクライアントから送信された認証情報を[検証](#configure-provider)し、要求されたコンテンツを返します。

## Basic認証のインストール {id="install"}
`basic`認証プロバイダーをインストールするには、`install`ブロック内で[basic](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/basic.html)関数を呼び出します。

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
// ...
install(Authentication) {
    basic {
        // Basic認証の構成
    }
}
```

オプションで、[特定のルートを認証する](#authenticate-route)ために使用できる[プロバイダー名](server-auth.md#provider-name)を指定することもできます。

## Basic認証の構成 {id="configure"}

Ktorでさまざまな認証プロバイダーを構成する方法の概要については、[認証の構成](server-auth.md#configure)を参照してください。このセクションでは、`basic`認証プロバイダー固有の構成について説明します。

### ステップ1：Basicプロバイダーを構成する {id="configure-provider"}

`basic`認証プロバイダーは、[BasicAuthenticationProvider.Configuration](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-basic-authentication-provider/-config/index.html)クラスを通じて設定を公開しています。以下の例では、次の設定が指定されています。
* `realm`プロパティは、`WWW-Authenticate`ヘッダーで渡されるレルムを設定します。
* `validate`関数は、ユーザー名とパスワードを検証します。

```kotlin
install(Authentication) {
    basic("auth-basic") {
        realm = "Access to the '/' path"
        validate { credentials ->
            if (credentials.name == "jetbrains" && credentials.password == "foobar") {
                UserIdPrincipal(credentials.name)
            } else {
                null
            }
        }
    }
}
```
   
`validate`関数は`UserPasswordCredential`をチェックし、認証に成功した場合は`UserIdPrincipal`を、失敗した場合は`null`を返します。
> [UserHashedTableAuth](#validate-user-hash)を使用して、ユーザー名とパスワードのハッシュを保持するメモリ内テーブルに保存されたユーザーを検証することもできます。

### ステップ2：特定のリソースを保護する {id="authenticate-route"}

`basic`プロバイダーを構成した後、**[authenticate](server-auth.md#authenticate-route)**関数を使用してアプリケーション内の特定のリソースを保護できます。認証に成功した場合、ルートハンドラー内で`call.principal`関数を使用して認証済みの[UserIdPrincipal](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-id-principal/index.html)を取得し、認証されたユーザーの名前を取得できます。

```kotlin
routing {
    authenticate("auth-basic") {
        get("/") {
            call.respondText("Hello, ${call.principal<UserIdPrincipal>()?.name}!")
        }
    }
}
```

## UserHashedTableAuthで検証する {id="validate-user-hash"}

Ktorでは、[UserHashedTableAuth](#validate-user-hash)を使用して、ユーザー名とパスワードのハッシュを保持するメモリ内テーブルに保存されたユーザーを[検証](#configure-provider)できます。これにより、データソースが漏洩した場合でもユーザーのパスワードが侵害されるのを防ぐことができます。

ユーザーの検証に`UserHashedTableAuth`を使用するには、以下の手順に従ってください：

1. [getDigestFunction](https://api.ktor.io/ktor-utils/io.ktor.util/get-digest-function.html)関数を使用して、指定されたアルゴリズムとソルトプロバイダーでダイジェスト関数を作成します：
   
   ```kotlin
   val digestFunction = getDigestFunction("SHA-256") { "ktor${it.length}" }
   ```

2. `UserHashedTableAuth`の新しいインスタンスを初期化し、以下のプロパティを指定します：
   * `table`プロパティを使用して、ユーザー名とハッシュ化されたパスワードのテーブルを提供します。
   * `digester`プロパティにダイジェスト関数を割り当てます。
   
   ```kotlin
   val hashedUserTable = UserHashedTableAuth(
       table = mapOf(
           "jetbrains" to digestFunction("foobar"),
           "admin" to digestFunction("password")
       ),
       digester = digestFunction
   )
   ```
   
3. `validate`関数内で、[UserHashedTableAuth.authenticate](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-hashed-table-auth/authenticate.html)関数を呼び出してユーザーを認証し、認証情報が有効な場合は`UserIdPrincipal`のインスタンスを返します：

   ```kotlin
   install(Authentication) {
       basic("auth-basic-hashed") {
           realm = "Access to the '/' path"
           validate { credentials ->
               hashedUserTable.authenticate(credentials)
           }
       }
   }