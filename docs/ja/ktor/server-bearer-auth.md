[//]: # (title: Ktor Server における Bearer 認証)

<show-structure for="chapter" depth="2"/>

<var name="artifact_name" value="ktor-server-auth"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="auth-bearer"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor は Kotlin/Native をサポートしており、追加のランタイムや仮想マシンなしでサーバーを実行できます。">Native サーバー</Links>のサポート</b>: ✅
</p>
</tldr>

Bearer 認証スキームは、アクセス制御と認証に使用される [HTTP フレームワーク](https://developer.mozilla.org/ja/docs/Web/HTTP/Authentication)の一部です。このスキームには、Bearer トークンと呼ばれるセキュリティトークンが含まれます。Bearer 認証スキームは [OAuth](server-oauth.md) または [JWT](server-jwt.md) の一部として使用されますが、Bearer トークンを認可するためのカスタムロジックを提供することもできます。

Ktor における認証の全般的な情報については、[Ktor Server における認証と認可](server-auth.md)セクションを参照してください。

> Bearer 認証は [HTTPS/TLS](server-ssl.md) 経由でのみ使用してください。

## 依存関係の追加 {id="add_dependencies"}
`bearer` 認証を有効にするには、ビルドスクリプトに `%artifact_name%` アーティファクトを含める必要があります。

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

## Bearer 認証のフロー {id="flow"}

一般的に、Bearer 認証のフローは次のようになります。

1. ユーザーが正常に認証およびアクセスの認可を受けた後、サーバーはクライアントにアクセストークンを返します。
2. クライアントは、`Bearer` スキーマを使用して `Authorization` ヘッダーにトークンを渡し、保護されたリソースにリクエストを行うことができます。
   ```HTTP
   GET http://localhost:8080/
   Authorization: Bearer abc123
   
   
   ```
3. サーバーはリクエストを受信し、トークンを[検証](#configure)します。
4. 検証後、サーバーは保護されたリソースの内容をレスポンスとして返します。

## Bearer 認証のインストール {id="install"}
`bearer` 認証プロバイダーをインストールするには、`install` ブロック内で [bearer](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/bearer.html) 関数を呼び出します。

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
// ...
install(Authentication) {
    bearer {
        // Bearer 認証の設定
    }
}
```

オプションで、[特定のルートを認証する](#authenticate-route)ために使用できる[プロバイダー名](server-auth.md#provider-name)を指定できます。

## Bearer 認証の設定 {id="configure"}

Ktor でのさまざまな認証プロバイダーの設定方法の概要については、[認証の設定](server-auth.md#configure)を参照してください。このセクションでは、`bearer` 認証プロバイダー固有の設定について説明します。 

### ステップ 1: Bearer プロバイダーの設定 {id="configure-provider"}

`bearer` 認証プロバイダーは、[BearerAuthenticationProvider.Configuration](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-bearer-authentication-provider/-config/index.html) クラスを介して設定を公開します。以下の例では、次の設定が指定されています。
* `realm` プロパティは、`WWW-Authenticate` ヘッダーで渡される realm を設定します。
* `authenticate` 関数は、クライアントから送信されたトークンをチェックし、認証に成功した場合は `UserIdPrincipal` を、失敗した場合は `null` を返します。

```kotlin
install(Authentication) {
    bearer("auth-bearer") {
        realm = "Access to the '/' path"
        authenticate { tokenCredential ->
            if (tokenCredential.token == "abc123") {
                UserIdPrincipal("jetbrains")
            } else {
                null
            }
        }
    }
}
```

### ステップ 2: 特定のリソースの保護 {id="authenticate-route"}

`bearer` プロバイダーを設定した後、**[authenticate](server-auth.md#authenticate-route)** 関数を使用してアプリケーション内の特定のリソースを保護できます。認証に成功した場合、ルートハンドラー内で `call.principal` 関数を使用して認証済みの [UserIdPrincipal](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-id-principal/index.html) を取得し、認証されたユーザーの名前を取得できます。

```kotlin
routing {
    authenticate("auth-bearer") {
        get("/") {
            call.respondText("Hello, ${call.principal<UserIdPrincipal>()?.name}!")
        }
    }
}