[//]: # (title: Ktor Client での Basic 認証)

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:ktor-client-auth</code>
</p>
<var name="example_name" value="client-auth-basic"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

Basic [認証スキーム](client-auth.md)は、ユーザーのログインに使用できます。このスキームでは、ユーザーの認証情報は Base64 でエンコードされたユーザー名とパスワードのペアとして送信されます。

> サーバー側では、Ktor は Basic 認証を処理するための [Authentication](server-basic-auth.md) プラグインを提供しています。

## 依存関係の追加 {id="add_dependencies"}

認証を有効にするには、ビルドスクリプトに `ktor-client-auth` アーティファクトを含めます。

<var name="artifact_name" value="ktor-client-auth"/>
<var name="ktor_version_catalog_name" value="ktorLibs.client.auth"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上記コードスニペットでは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">
            Ktor バージョンカタログ</a> を使用しています。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上記コードスニペットでは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">
            Ktor バージョンカタログ</a> を使用しています。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>
<tip>
    Ktor クライアントに必要なアーティファクトの詳細については、<Links href="client-dependencies.md" summary="Learn how to add client dependencies to an existing project.">クライアントの依存関係の追加</Links> を参照してください。
</tip>

## Basic 認証のフロー {id="flow"}

Basic 認証のフローは次のようになります。

1. クライアントが、`Authorization` ヘッダーを含めずにサーバーアプリケーションの保護されたリソースにリクエストを送信します。
2. サーバーは `401 Unauthorized` レスポンスステータスを返し、`WWW-Authenticate` レスポンスヘッダーを使用して Basic 認証が必要であることを示します。一般的な `WWW-Authenticate` ヘッダーは次のようになります。

   ```
   WWW-Authenticate: Basic realm="Access to the '/' path", charset="UTF-8"
   ```
   {style="block"}

   Ktor クライアントでは、[`sendWithoutRequest()` 関数](#configure) を使用することで、`WWW-Authenticate` ヘッダーを待たずに事前に（preemptively）認証情報を送信できます。

3. クライアントは通常、ユーザーに認証情報の入力を求めます。その後、Base64 でエンコードされたユーザー名とパスワードのペアを含む `Authorization` ヘッダーを付加してリクエストを送信します。例:

   ```
   Authorization: Basic amV0YnJhaW5zOmZvb2Jhcg
   ```
   {style="block"}

4. サーバーはクライアントから送信された認証情報を検証し、リクエストされたコンテンツを返します。

## Basic 認証の設定 {id="configure"}

`Basic` スキームを使用して `Authorization` ヘッダーでユーザー認証情報を送信するには、`basic` 認証プロバイダーを設定する必要があります。

1. `install(Auth)` ブロック内で [`basic`](https://api.ktor.io/ktor-client-auth/io.ktor.client.plugins.auth.providers/basic.html) 関数を呼び出します。
2. [`BasicAuthCredentials`](https://api.ktor.io/ktor-client-auth/io.ktor.client.plugins.auth.providers/-basic-auth-credentials/index.html) を使用して必要な認証情報を指定し、このオブジェクトを [`credentials`](https://api.ktor.io/ktor-client-auth/io.ktor.client.plugins.auth.providers/-basic-auth-config/credentials.html) 関数に渡します。
3. `realm` プロパティを使用してレルムを設定します。

   ```kotlin
   val client = HttpClient(CIO) {
       install(Auth) {
           basic {
               credentials {
                   BasicAuthCredentials(username = "jetbrains", password = "foobar")
               }
               realm = "Access to the '/' path"
           }
       }
   }
   ```

4. （オプション）`sendWithoutRequest` 関数を使用してプリエンプティブ認証を有効にします。この関数はリクエストパラメータを確認し、最初のリクエストに認証情報を付加するかどうかを決定します。

   ```kotlin
   install(Auth) {
       basic {
           // ...
           sendWithoutRequest { request ->
               request.url.host == "0.0.0.0"
           }
       }
   }
   ```
5. （オプション）認証情報のキャッシュを無効にします。デフォルトでは、`credentials {}` プロバイダーによって返された認証情報はリクエスト間で再利用できるようにキャッシュされます。`cacheTokens` オプションを使用してキャッシュを無効にできます。

    ```kotlin
    basic {
        cacheTokens = false   // リクエストごとに認証情報を再読み込みします
        // ...
    }
    ```
    キャッシュの無効化は、クライアントセッション中に認証情報が変更される可能性がある場合や、最新の保存状態を反映する必要がある場合に役立ちます。

    > キャッシュされた認証情報をプログラムでクリアする詳細については、全般的な [トークンのキャッシュとキャッシュ制御](client-auth.md#token-caching) セクションを参照してください。

> Ktor Client における Basic 認証の完全な例については、[client-auth-basic](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-auth-basic) を参照してください。