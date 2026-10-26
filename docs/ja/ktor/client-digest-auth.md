[//]: # (title: Ktor Client における Digest 認証)

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:ktor-client-auth</code>
</p>
<var name="example_name" value="client-auth-digest"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

Digest 認証スキームでは、ユーザー名とパスワードをネットワーク経由で送信する前にハッシュ関数が適用されます。

> サーバー側では、Ktor は digest 認証を処理するための [Authentication](server-digest-auth.md) プラグインを提供しています。

## 依存関係の追加 {id="add_dependencies"}

認証を有効にするには、ビルドスクリプトに `ktor-client-auth` アーティファクトを含めます。

<var name="artifact_name" value="ktor-client-auth"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"/>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"/>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>
<tip>
    Ktor クライアントに必要なアーティファクトの詳細については、<Links href="client-dependencies.md" summary="Learn how to add client dependencies to an existing project.">クライアントの依存関係の追加</Links>を参照してください。
</tip>

## Digest 認証のフロー {id="flow"}

Digest 認証のフローは以下のようになります。

1. クライアントは、サーバーアプリケーションの特定のリソースに対して `Authorization` ヘッダーを付けずにリクエストを送信します。
2. サーバーは、クライアントに `401` (Unauthorized) レスポンスステータスを返し、`WWW-Authenticate` レスポンスヘッダーを使用して、ルートの保護に Digest 認証スキームが使用されているという情報を提供します。典型的な `WWW-Authenticate` ヘッダーは次のようになります。

   ```
   WWW-Authenticate: Digest
           realm="Access to the '/' path",
           nonce="e4549c0548886bc2",
           algorithm="MD5"
   ```
   {style="block"}

3. 通常、クライアントはユーザーが認証情報を入力できるログインダイアログを表示します。その後、クライアントは以下の `Authorization` ヘッダーを付けてリクエストを送信します。

   ```
   Authorization: Digest username="jetbrains",
           realm="Access to the '/' path",
           nonce="e4549c0548886bc2",
           uri="/",
           algorithm=MD5,
           response="6299988bb4f05c0d8ad44295873858cf"
   ```
   {style="block"}

   `response` の値は次の方法で生成されます。

   a. `HA1 = MD5(username:realm:password)`

   b. `HA2 = MD5(method:digestURI)`

   c. `response = MD5(HA1:nonce:HA2)`

4. サーバーはクライアントから送信された認証情報を検証し、要求されたコンテンツを返します。

## Digest 認証の設定 {id="configure"}

`Digest` スキームを使用して `Authorization` ヘッダーでユーザー認証情報を送信するには、次のように `digest` 認証プロバイダーを設定する必要があります。

1. `install` ブロック内で [digest](https://api.ktor.io/ktor-client-auth/io.ktor.client.plugins.auth.providers/digest.html) 関数を呼び出します。
2. [DigestAuthCredentials](https://api.ktor.io/ktor-client-auth/io.ktor.client.plugins.auth.providers/-digest-auth-credentials/index.html) を使用して必要な認証情報を提供し、このオブジェクトを [credentials](https://api.ktor.io/ktor-client-auth/io.ktor.client.plugins.auth.providers/-digest-auth-config/credentials.html) 関数に渡します。
3. 必要に応じて、`realm` プロパティを使用してレルムを設定します。

```kotlin
val client = HttpClient(CIO) {
    install(Auth) {
        digest {
            credentials {
                DigestAuthCredentials(username = "jetbrains", password = "foobar")
            }
            realm = "Access to the '/' path"
        }
    }
}
```

> 完全な例はこちらで確認できます: [client-auth-digest](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-auth-digest)。