[//]: # (title: Ktor Server での Bearer 認証)

<show-structure for="chapter" depth="2"/>

<var name="artifact_name" value="ktor-server-auth"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.auth"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="auth-bearer"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor は Kotlin/Native をサポートしており、追加のランタイムや仮想マシンなしでサーバーを実行できます。">Native サーバー</Links>のサポート</b>: ✅
</p>
</tldr>

Bearer 認証スキームは、アクセス制御と認証に使用される [HTTP フレームワーク](https://developer.mozilla.org/ja/docs/Web/HTTP/Authentication) の一部です。このスキームには、Bearer トークンと呼ばれるセキュリティトークンが使用されます。Bearer 認証スキームは [OAuth](server-oauth.md) や [JWT](server-jwt.md) の一部として使用されますが、Bearer トークンを認可するためのカスタムロジックを提供することもできます。

Ktor における認証全般に関する情報は、[Ktor Server での認証と認可](server-auth.md) セクションで確認できます。

> Bearer 認証は、[HTTPS/TLS](server-ssl.md) 経由でのみ使用してください。

## 依存関係の追加 {id="add_dependencies"}
`bearer` 認証を有効にするには、ビルドスクリプトに `%artifact_name%` アーティファクトを含める必要があります。

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上記のコードスニペットでは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">
            Ktor バージョンカタログ</a> を使用しています。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上記のコードスニペットでは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">
            Ktor バージョンカタログ</a> を使用しています。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## Bearer 認証フロー {id="flow"}

一般的に、Bearer 認証のフローは以下のようになります。

1. ユーザーの認証とアクセスの認可が正常に行われた後、サーバーはクライアントにアクセストークンを返します。
2. クライアントは、`Bearer` スキーマを使用して `Authorization` ヘッダーにトークンを渡すことで、保護されたリソースにリクエストを送信できます。
   ```HTTP
   GET http://localhost:8080/
   Authorization: Bearer abc123
   
   
   ```
3. サーバーがリクエストを受信し、トークンを[検証](#configure)します。
4. 検証後、サーバーは保護されたリソースのコンテンツで応答します。

## Bearer 認証のインストール {id="install"}
`bearer` 認証プロバイダーをインストールするには、`install` ブロック内で [bearer](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/bearer.html) 関数を呼び出します。

```kotlin
import io.ktor.server.application.*
import io.ktor.server.auth.*
// ...
install(Authentication) {
    bearer {
        // Bearer 認証を設定
    }
}
```

オプションで、[特定のルートを認証](#authenticate-route)するために使用できる[プロバイダー名](server-auth.md#provider-name)を指定できます。

## Bearer 認証の設定 {id="configure"}

Ktor でさまざまな認証プロバイダーを設定する方法の概要については、[認証の設定](server-auth.md#configure) を参照してください。このセクションでは、`bearer` 認証プロバイダー固有の設定について見ていきます。

### ステップ 1: Bearer プロバイダーの設定 {id="configure-provider"}

<Tabs group="auth-dsl">
<TabItem title="Classic" group-key="classic">

`bearer` 認証プロバイダーは、[BearerAuthenticationProvider.Configuration](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-bearer-authentication-provider/-config/index.html) クラスを介して設定を公開しています。以下の例では、次の設定が指定されています。
* `realm` プロパティは、`WWW-Authenticate` ヘッダーに渡されるレルムを設定します。
* `authenticate` 関数はクライアントから送信されたトークンをチェックし、認証に成功した場合は `UserIdPrincipal` を、失敗した場合は `null` を返します。

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

</TabItem>
<TabItem title="Type-safe" group-key="typed">

<note>
    <p>
        型安全な認証スキーム API は実験的です。いつでも廃止または変更される可能性があります。
        オプトインが必要です。詳細については、
        <a href="server-typed-auth.md#prerequisites">型安全な認証のドキュメント</a> を参照してください。
    </p>
</note>

`bearer()` 関数は、任意のプリンシパル型のスキームを作成します。`install(Authentication)`
ステップはありません。スキームは、それを必要とするルートに渡す値です。

```kotlin
data class User(val name: String)

val bearerAuth = bearer<User>("auth-bearer") {
    realm = "Access to the '/' path"
    validate { tokenCredential ->
        if (tokenCredential.token == "abc123") {
            User("jetbrains")
        } else {
            null
        }
    }
}
```

名前に変更があることに注意してください。従来のプロバイダーでは `authenticate` を使用しますが、他の型安全スキームと同様に、型安全スキームでは `validate` を使用します。これは定義したプリンシパル型を返し、認証に失敗した場合は `null` を返します。

また、`authHeader` を設定して `Authorization` ヘッダー以外の場所からトークンを読み取ったり、`authSchemes` を設定して `Bearer` 以外のスキームを受け入れたりすることもできます。完全な API については、[型安全な認証](server-typed-auth.md) を参照してください。

</TabItem>
</Tabs>

### ステップ 2: 特定のリソースの保護 {id="authenticate-route"}

<Tabs group="auth-dsl">
<TabItem title="Classic" group-key="classic">

`bearer` プロバイダーを設定した後は、**[authenticate](server-auth.md#authenticate-route)** 関数を使用してアプリケーション内の特定のリソースを保護できます。認証に成功した場合、ルートハンドラー内で `call.principal` 関数を使用して認証済みの [UserIdPrincipal](https://api.ktor.io/ktor-server-auth/io.ktor.server.auth/-user-id-principal/index.html) を取得し、認証されたユーザーの名前を取得できます。

```kotlin
routing {
    authenticate("auth-bearer") {
        get("/") {
            val user = call.principal<UserIdPrincipal>()
            call.respondText("Hello, ${user?.name}!")
        }
    }
}
```

</TabItem>
<TabItem title="Type-safe" group-key="typed">

スキームを `authenticateWith()` に渡します。ブロック内では、`call.principal` は指定したプリンシパル型となり、決して `null` にならないため、キャストや null チェックは不要です:

```kotlin
routing {
    authenticateWith(bearerAuth) {
        get("/") {
            call.respondText("Hello, ${call.principal.name}!")
        }
    }
}
```

</TabItem>
</Tabs>