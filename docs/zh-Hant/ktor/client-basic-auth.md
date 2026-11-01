[//]: # (title: Ktor Client 中的基本驗證)

<tldr>
<p>
<b>必要相依性</b>: <code>io.ktor:ktor-client-auth</code>
</p>
<var name="example_name" value="client-auth-basic"/>
<p>
    <b>程式碼範例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

基本[驗證配置](client-auth.md)可用於使用者登入。在此配置中，使用者憑據會以 Base64 編碼的使用者名稱/密碼配對形式傳輸。

> 在伺服器端，Ktor 提供了 [Authentication](server-basic-auth.md) 外掛程式來處理基本驗證。

## 新增相依性 {id="add_dependencies"}

若要啟用驗證，請在組建指令碼中包含 `ktor-client-auth` 產物：

<var name="artifact_name" value="ktor-client-auth"/>
<var name="ktor_version_catalog_name" value="ktorLibs.client.auth"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目錄 (version catalog)</a> 來指定 Ktor 相依性。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目錄 (version catalog)</a> 來指定 Ktor 相依性。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>
<tip>
    若要進一步了解 Ktor 用戶端所需的構件，請參閱 <Links href="client-dependencies.md" summary="了解如何將用戶端相依性新增至現有專案。">新增用戶端相依性</Links>。
</tip>

## 基本驗證流程 {id="flow"}

基本驗證流程如下：

1. 用戶端向伺服器應用程式中的受保護資源發出請求，且未包含 `Authorization` 標頭。
2. 伺服器回應 `401 Unauthorized` 回應狀態，並使用 `WWW-Authenticate` 回應標頭指出需要基本驗證 (Basic authentication)。典型的 `WWW-Authenticate` 標頭如下所示：

   ```
   WWW-Authenticate: Basic realm="Access to the '/' path", charset="UTF-8"
   ```
   {style="block"}

   Ktor 用戶端允許你透過使用 [`sendWithoutRequest()` 函式](#configure)，預先傳送憑據——無需等待 `WWW-Authenticate` 標頭。

3. 用戶端通常會提示使用者輸入憑據。接著發出帶有 `Authorization` 標頭的請求，其中包含使用 Base64 編碼的使用者名稱和密碼配對，例如：

   ```
   Authorization: Basic amV0YnJhaW5zOmZvb2Jhcg
   ```
   {style="block"}

4. 伺服器驗證用戶端傳送的憑據，並回應所請求的內容。

## 設定基本驗證 {id="configure"}

若要使用 `Basic` 配置在 `Authorization` 標頭中傳送使用者憑據，你需要設定 `basic` 驗證提供者：

1. 在 `install(Auth)` 區塊內呼叫 [`basic`](https://api.ktor.io/ktor-client-auth/io.ktor.client.plugins.auth.providers/basic.html) 函式。
2. 使用 [`BasicAuthCredentials`](https://api.ktor.io/ktor-client-auth/io.ktor.client.plugins.auth.providers/-basic-auth-credentials/index.html) 提供所需的憑據，並將此物件傳遞給 [`credentials`](https://api.ktor.io/ktor-client-auth/io.ktor.client.plugins.auth.providers/-basic-auth-config/credentials.html) 函式。
3. 使用 `realm` 屬性設定領域 (realm)。

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

4. （選用）使用 `sendWithoutRequest` 函式啟用預先驗證，該函式會檢查請求參數並決定是否在初始請求中附加憑據。

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
5. （選用）停用憑據快取。預設情況下，`credentials {}` 提供者回傳的憑據會被快取，以便跨請求重複使用。你可以使用 `cacheTokens` 選項停用快取：

    ```kotlin
    basic {
        cacheTokens = false   // Reloads credentials for every request
        // ...
    }
    ```
    當憑據在用戶端工作階段期間可能變更，或必須反映最新儲存的狀態時，停用快取將非常有用。

    > 如需透過程式化方式清除快取憑據的詳細資訊，請參閱通用的[權杖快取與快取控制](client-auth.md#token-caching)章節。

> 如需 Ktor Client 中基本驗證的完整範例，請參閱 [client-auth-basic](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-auth-basic)。