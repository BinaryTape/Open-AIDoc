[//]: # (title: Ktor Client 中的基本驗證)

<tldr>
<p>
<b>必要的相依性</b>：<code>io.ktor:ktor-client-auth</code>
</p>
<var name="example_name" value="client-auth-basic"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

基本[驗證方案](client-auth.md)可用於使用者登入。在此方案中，使用者憑據會以使用 Base64 編碼的使用者名稱/密碼配對形式傳輸。

> 在伺服器端，Ktor 提供了 [Authentication](server-basic-auth.md) 外掛程式來處理基本驗證。

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
    若要進一步了解 Ktor 用戶端所需的構件，請參閱<Links href="client-dependencies.md" summary="了解如何將用戶端相依性新增至現有專案。">新增用戶端相依性</Links>。
</tip>

## 基本驗證流程 {id="flow"}

基本驗證流程如下：

1. 用戶端向伺服器應用程式中的受保護資源發出不帶 `Authorization` 標頭的請求。
2. 伺服器以 `401 Unauthorized` 回應狀態回應，並使用 `WWW-Authenticate` 回應標頭來指出需要 Basic 驗證。典型的 `WWW-Authenticate` 標頭如下所示：

   ```
   WWW-Authenticate: Basic realm="Access to the '/' path", charset="UTF-8"
   ```
   {style="block"}

   Ktor 用戶端允許你透過使用 [`sendWithoutRequest()` 函式](#configure)搶先發送憑據，而無需等待 `WWW-Authenticate` 標頭。

3. 用戶端通常會提示使用者輸入憑據。接著發出帶有 `Authorization` 標頭的請求，其中包含使用 Base64 編碼的使用者名稱和密碼配對，例如：

   ```
   Authorization: Basic amV0YnJhaW5zOmZvb2Jhcg
   ```
   {style="block"}

4. 伺服器驗證用戶端發送的憑據，並回應請求的內容。

## 設定基本驗證 {id="configure"}

若要使用 `Basic` 配置在 `Authorization` 標頭中發送使用者憑據，你需要設定 `basic` 驗證提供者：

1. 在 `install(Auth)` 區塊內呼叫 [`basic`](https://api.ktor.io/ktor-client-auth/io.ktor.client.plugins.auth.providers/basic.html) 函式。
2. 使用 [`BasicAuthCredentials`](https://api.ktor.io/ktor-client-auth/io.ktor.client.plugins.auth.providers/-basic-auth-credentials/index.html) 提供所需的憑據，並將此物件傳遞給 [`credentials`](https://api.ktor.io/ktor-client-auth/io.ktor.client.plugins.auth.providers/-basic-auth-config/credentials.html) 函式。
3. 使用 `realm` 屬性設定領域（realm）。

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

4. （可選）使用 `sendWithoutRequest` 函式啟用搶先驗證，該函式會檢查請求參數並決定是否在初始請求中附加憑據。

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
5. （可選）停用憑據快取。預設情況下，`credentials {}` 提供者傳回的憑據會被快取，以便跨請求重複使用。你可以透過 `cacheTokens` 選項停用快取：

    ```kotlin
    basic {
        cacheTokens = false   // 每次請求均重新載入憑據
        // ...
    }
    ```
    當憑據可能在用戶端工作階段期間發生變更，或者必須反映最新的儲存狀態時，停用快取將會非常實用。

    > 有關以程式化方式清除快取憑據的詳細資訊，請參閱通用的[權杖快取與快取控制](client-auth.md#token-caching)章節。

> 如需 Ktor Client 中基本驗證的完整範例，請參閱 [client-auth-basic](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-auth-basic)。