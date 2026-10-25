[//]: # (title: Ktor Client 中的 Digest 驗證)

<tldr>
<p>
<b>必要相依性</b>: <code>io.ktor:ktor-client-auth</code>
</p>
<var name="example_name" value="client-auth-digest"/>
<p>
    <b>程式碼範例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

在 Digest 驗證機制中，在透過網路傳送使用者名稱和密碼之前，會先對其套用雜湊函式。

> 在伺服器端，Ktor 提供了 [Authentication](server-digest-auth.md) 外掛程式來處理 digest 驗證。

## 新增相依性 {id="add_dependencies"}

若要啟用驗證，請在建置指令碼中包含 `ktor-client-auth` 構件：

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
    若要了解更多 Ktor 用戶端所需的構件，請參閱<Links href="client-dependencies.md" summary="了解如何將用戶端相依性新增至現有專案。">新增用戶端相依性</Links>。
</tip>

## Digest 驗證流程 {id="flow"}

Digest 驗證流程如下所示：

1. 用戶端向伺服器應用程式中的特定資源發出未帶有 `Authorization` 標頭的請求。
2. 伺服器向用戶端回應用 `401` (Unauthorized) 回應狀態，並使用 `WWW-Authenticate` 回應標頭提供資訊，指出該路由使用 digest 驗證機制進行保護。一般的 `WWW-Authenticate` 標頭如下所示：

   ```
   WWW-Authenticate: Digest
           realm="Access to the '/' path",
           nonce="e4549c0548886bc2",
           algorithm="MD5"
   ```
   {style="block"}

3. 通常，用戶端會顯示登入對話方塊供使用者輸入憑據。接著，用戶端發出帶有以下 `Authorization` 標頭的請求：

   ```
   Authorization: Digest username="jetbrains",
           realm="Access to the '/' path",
           nonce="e4549c0548886bc2",
           uri="/",
           algorithm=MD5,
           response="6299988bb4f05c0d8ad44295873858cf"
   ```
   {style="block"}

   `response` 的值依以下方式產生：

   a. `HA1 = MD5(username:realm:password)`

   b. `HA2 = MD5(method:digestURI)`

   c. `response = MD5(HA1:nonce:HA2)`

4. 伺服器驗證用戶端傳送的憑據，並回應所請求的內容。

## 設定 digest 驗證 {id="configure"}

若要使用 `Digest` 機制在 `Authorization` 標頭中傳送使用者憑據，你需要按照以下方式設定 `digest` 驗證提供者：

1. 在 `install` 區塊中呼叫 [digest](https://api.ktor.io/ktor-client-auth/io.ktor.client.plugins.auth.providers/digest.html) 函式。
2. 使用 [DigestAuthCredentials](https://api.ktor.io/ktor-client-auth/io.ktor.client.plugins.auth.providers/-digest-auth-credentials/index.html) 提供所需的憑據，並將此物件傳遞給 [credentials](https://api.ktor.io/ktor-client-auth/io.ktor.client.plugins.auth.providers/-digest-auth-config/credentials.html) 函式。
3. （可選）使用 `realm` 屬性設定 realm。

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

> 你可以在此處找到完整的範例：[client-auth-digest](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-auth-digest)。