[//]: # (title: Ktor Client 中的基本身份验证)

<tldr>
<p>
<b>所需依赖项</b>：<code>io.ktor:ktor-client-auth</code>
</p>
<var name="example_name" value="client-auth-basic"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

基本[身份验证方案](client-auth.md)可用于用户登录。在此方案中，用户凭据以使用 Base64 编码的用户名/密码对形式进行传输。

> 在服务器端，Ktor 提供了 [Authentication](server-basic-auth.md) 插件来处理基本身份验证。

## 添加依赖项 {id="add_dependencies"}

要启用身份验证，请在构建脚本中包含 `ktor-client-auth` 工件：

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
    要详细了解 Ktor 客户端所需的工件，请参阅<Links href="client-dependencies.md" summary="了解如何向现有项目添加客户端依赖项。">添加客户端依赖项</Links>。
</tip>

## 基本身份验证流程 {id="flow"}

基本身份验证流程如下：

1. 客户端向服务器应用程序中的受保护资源发起请求，且不携带 `Authorization` 标头。
2. 服务器返回 `401 Unauthorized` 响应状态，并使用 `WWW-Authenticate` 响应标头指示需要基本身份验证。典型的 `WWW-Authenticate` 标头如下所示：

   ```
   WWW-Authenticate: Basic realm="Access to the '/' path", charset="UTF-8"
   ```
   {style="block"}

   Ktor 客户端允许您通过使用 [`sendWithoutRequest()` 函数](#configure)抢先发送凭据，而无需等待 `WWW-Authenticate` 标头。

3. 客户端通常会提示用户输入凭据。然后，它会发起带有 `Authorization` 标头的请求，其中包含使用 Base64 编码的用户名和密码对，例如：

   ```
   Authorization: Basic amV0YnJhaW5zOmZvb2Jhcg
   ```
   {style="block"}

4. 服务器验证客户端发送的凭据，并返回所请求的内容。

## 配置基本身份验证 {id="configure"}

要使用 `Basic` 方案在 `Authorization` 标头中发送用户凭据，您需要配置 `basic` 身份验证提供程序：

1. 在 `install(Auth)` 块内调用 [`basic`](https://api.ktor.io/ktor-client-auth/io.ktor.client.plugins.auth.providers/basic.html) 函数。
2. 使用 [`BasicAuthCredentials`](https://api.ktor.io/ktor-client-auth/io.ktor.client.plugins.auth.providers/-basic-auth-credentials/index.html) 提供所需凭据，并将此对象传递给 [`credentials`](https://api.ktor.io/ktor-client-auth/io.ktor.client.plugins.auth.providers/-basic-auth-config/credentials.html) 函数。
3. 使用 `realm` 属性配置 realm。

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

4. （可选）使用 `sendWithoutRequest` 函数启用抢先式身份验证，该函数会检查请求形参并决定是否将凭据附加到初始请求中。

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
5. （可选）禁用凭据缓存。默认情况下，`credentials {}` 提供程序返回的凭据会被缓存以便在多个请求间复用。您可以使用 `cacheTokens` 选项禁用缓存：

    ```kotlin
    basic {
        cacheTokens = false   // 为每个请求重新加载凭据
        // ...
    }
    ```
    当凭据可能在客户端会话期间发生更改或必须反映最新存储状态时，禁用缓存非常有用。

    > 有关以编程方式清除已缓存凭据的详细信息，请参阅通用的[令牌缓存与缓存控制](client-auth.md#token-caching)部分。

> 有关 Ktor Client 中基本身份验证的完整示例，请参阅 [client-auth-basic](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-auth-basic)。