[//]: # (title: Ktor ServerにおけるBasic認証)

<show-structure for="chapter" depth="2"/>

<var name="artifact_name" value="ktor-server-auth"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.auth"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<p>
<b>コード例</b>: <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-basic">auth-basic</a>, <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-basic-hash-table">auth-basic-hash-table</a>
</p>
<p>
    <b><Links href="server-native.md" summary="KtorはKotlin/Nativeをサポートしており、追加のランタイムや仮想マシンなしでサーバーを実行できます。">Nativeサーバー</Links>のサポート</b>: ✅
</p>
</tldr>

Basic認証スキームは、アクセス制御と認証に使用される[HTTPフレームワーク](https://developer.mozilla.org/ja/docs/Web/HTTP/Authentication)の一部です。このスキームでは、ユーザーの認証情報（クレデンシャル）はBase64でエンコードされたユーザー名/パスワードのペアとして送信されます。

Ktorを使用すると、Basic認証を利用してユーザーのログインや特定の[ルート](server-routing.md)の保護を行うことができます。Ktorにおける認証全般に関する情報は、[Ktor Serverにおける認証と認可](server-auth.md)セクションを参照してください。

> Basic認証ではユーザー名とパスワードが平文で送信されるため、機密情報を保護するには[HTTPS/TLS](server-ssl.md)を使用する必要があります。

## 依存関係の追加 {id="add_dependencies"}
`basic`認証を有効にするには、ビルドスクリプトに`%artifact_name%`アーティファクトを含める必要があります。

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上記コードスニペットでは、Ktorの依存関係を指定するために<a href="server-dependencies.topic#using-version-catalog">
            Ktorバージョンカタログ</a>を使用しています。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上記コードスニペットでは、Ktorの依存関係を指定するために<a href="server-dependencies.topic#using-version-catalog">
            Ktorバージョンカタログ</a>を使用しています。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## Basic認証のフロー {id="flow"}

Basic認証のフローは以下のようになります。

1. クライアントがサーバーアプリケーションの特定の[ルート](server-routing.md)に対して、`Authorization`ヘッダーなしでリクエストを送信します。
2. サーバーはクライアントに対して`401`（Unauthorized）レスポンスステータスで応答し、`WWW-Authenticate`レスポンスヘッダーを使用してルートの保護にBasic認証スキームが使用されていることを伝えます。典型的な`WWW-Authenticate`ヘッダーは次のようになります。
   
   ```
   WWW-Authenticate: Basic realm="Access to the '/' path", charset="UTF-8"
   ```
   {style="block"}
   
   Ktorでは、`basic`認証プロバイダーの[設定](#configure-provider)時に関連するプロパティを使用してレルム（realm）と文字セット（charset）を指定できます。

3. 通常、クライアントはユーザーが認証情報を入力できるログインダイアログを表示します。その後、クライアントはBase64でエンコードされたユーザー名とパスワードのペアを含む`Authorization`ヘッダーを付与してリクエストを送信します。例:
   
   ```
   Authorization: Basic amV0YnJhaW5zOmZvb2Jhcg
   ```
   {style="block"}

4. サーバーはクライアントから送信された認証情報を[検証](#configure-provider)し、リクエストされたコンテンツを応答します。

## Basic認証のインストール {id="install"}
`basic`認証プロバイダーをインストールするには、`install`ブロック内で[basic](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/basic.html)関数を呼び出します。

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
// ...
install(Authentication) {
    basic {
        // Basic認証の設定
    }
}
```

オプションで、[指定したルートを認証](#authenticate-route)するために使用できる[プロバイダー名](server-auth.md#provider-name)を指定することもできます。

## Basic認証の設定 {id="configure"}

Ktorでさまざまな認証プロバイダーを設定する一般的な方法については、[認証の設定](server-auth.md#configure)を参照してください。このセクションでは、`basic`認証プロバイダー固有の設定について見ていきます。

### ステップ1: basicプロバイダーを設定する {id="configure-provider"}

<Tabs group="auth-dsl">
<TabItem title="名前付きプロバイダー" group-key="classic">

`basic`認証プロバイダーは、[BasicAuthenticationProvider.Configuration](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-basic-authentication-provider/-config/index.html)クラスを介して設定を公開します。以下の例では、次の設定が指定されています。
* `realm`プロパティは、`WWW-Authenticate`ヘッダーで渡されるレルムを設定します。
* `validate`関数は、ユーザー名とパスワードを検証します。

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
   
`validate`関数は`UserPasswordCredential`をチェックし、認証に成功した場合は`UserIdPrincipal`を返し、認証に失敗した場合は`null`を返します。
> また、ユーザー名とパスワードハッシュを保持するインメモリテーブルに格納されたユーザーを検証するために、[UserHashedTableAuth](#validate-user-hash)を使用することもできます。

</TabItem>
<TabItem title="タイプセーフ" group-key="typed">

<note>
    <p>
        タイプセーフな認証スキームAPIは実験的（Experimental）です。いつでも廃止または変更される可能性があります。
        使用にはオプトインが必要です。詳細については、
        <a href="server-typed-auth.md#prerequisites">タイプセーフ認証のドキュメント</a>を参照してください。
    </p>
</note>

`basic()`関数は、任意のプリンシパル型に対するスキームを作成します。`install(Authentication)`ステップは不要です。スキームは、それを必要とするルートに渡す値となります。

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

`validate`関数は`UserPasswordCredential`をチェックし、プリンシパル型を返します。認証に失敗した場合は`null`を返します。完全なAPIについては、[タイプセーフ認証](server-typed-auth.md)を参照してください。

</TabItem>
</Tabs>

### ステップ2: 特定のリソースを保護する {id="authenticate-route"}

<Tabs group="auth-dsl">
<TabItem title="名前付きプロバイダー" group-key="classic">

`basic`プロバイダーを設定した後、**[authenticate](server-auth.md#authenticate-route)**関数を使用してアプリケーション内の特定のリソースを保護できます。認証に成功した場合、ルートハンドラー内で`call.principal`関数を使用して認証済みの[UserIdPrincipal](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-id-principal/index.html)を取得し、認証されたユーザーの名前を取得できます。

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
<TabItem title="タイプセーフ" group-key="typed">

スキームを`authenticateWith()`に渡します。ブロック内では`call.principal`が指定したプリンシパル型となり、決して`null`にはならないため、キャストやnullチェックは不要です。

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

## UserHashedTableAuthによる検証 {id="validate-user-hash"}

Ktorでは、[UserHashedTableAuth](#validate-user-hash)を使用して、ユーザー名とパスワードハッシュを保持するインメモリテーブルに保存されたユーザーを[検証](#configure-provider)できます。これにより、データソースが漏洩した場合でもユーザーのパスワードが漏洩するのを防ぐことができます。

`UserHashedTableAuth`を使用してユーザーを検証するには、以下の手順に従います。

1. [getDigestFunction](https://api.ktor.io/ktor-utils/io.ktor.util/get-digest-function.html)関数を使用して、指定したアルゴリズムとソルトプロバイダーでダイジェスト関数を作成します。
   
   ```kotlin
   val digestFunction = getDigestFunction("SHA-256") {
       "ktor${it.length}"
   }
   ```

2. `UserHashedTableAuth`の新しいインスタンスを初期化し、次のプロパティを指定します。
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
   
3. `validate`関数の内部で[UserHashedTableAuth.authenticate](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-hashed-table-auth/authenticate.html)関数を呼び出してユーザーを認証し、認証情報が有効な場合は`UserIdPrincipal`のインスタンスを返します。

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