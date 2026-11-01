[//]: # (title: Ktor Client 中的 Digest 身份验证)

<tldr>
<p>
<b>必需依赖项</b>：<code>io.ktor:ktor-client-auth</code>
</p>
<var name="example_name" value="client-auth-digest"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

在 Digest 身份验证方案中，在通过网络发送用户名和密码之前，会先对其应用哈希函数。

> 在服务器端，Ktor 提供了 [Authentication](server-digest-auth.md) 插件来处理 Digest 身份验证。

## 添加依赖项 {id="add_dependencies"}

要启用身份验证，请在构建脚本中包含 `ktor-client-auth` 构件：

<var name="artifact_name" value="ktor-client-auth"/>
<var name="ktor_version_catalog_name" value="ktorLibs.client.auth"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目录</a>来指定 Ktor 依赖项。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目录</a>来指定 Ktor 依赖项。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>
<tip>
    要了解更多关于 Ktor 客户端所需构件的信息，请参阅<Links href="client-dependencies.md" summary="了解如何向现有项目添加客户端依赖项。">添加客户端依赖项</Links>。
</tip>

## Digest 身份验证流程 {id="flow"}

Digest 身份验证流程如下：

1. 客户端向服务器应用程序中的特定资源发送不带 `Authorization` 标头的请求。
2. 服务器向客户端返回 `401` (Unauthorized) 响应状态，并使用 `WWW-Authenticate` 响应标头提供相关信息，指示该路由使用 Digest 身份验证方案进行保护。典型的 `WWW-Authenticate` 标头如下所示：

   ```
   WWW-Authenticate: Digest
           realm="Access to the '/' path",
           nonce="e4549c0548886bc2",
           algorithm="MD5"
   ```
   {style="block"}

3. 通常，客户端会显示一个供用户输入凭据的登录对话框。随后，客户端会发送带有以下 `Authorization` 标头的请求：

   ```
   Authorization: Digest username="jetbrains",
           realm="Access to the '/' path",
           nonce="e4549c0548886bc2",
           uri="/",
           algorithm=MD5,
           response="6299988bb4f05c0d8ad44295873858cf"
   ```
   {style="block"}

   `response` 值的生成方式如下：

   a. `HA1 = MD5(username:realm:password)`

   b. `HA2 = MD5(method:digestURI)`

   c. `response = MD5(HA1:nonce:HA2)`

4. 服务器验证客户端发送的凭据，并返回请求的内容。

## 配置 Digest 身份验证 {id="configure"}

若要使用 `Digest` 方案在 `Authorization` 标头中发送用户凭据，需要按如下方式配置 `digest` 身份验证提供程序：

1. 在 `install` 块内调用 [digest](https://api.ktor.io/ktor-client-auth/io.ktor.client.plugins.auth.providers/digest.html) 函数。
2. 使用 [DigestAuthCredentials](https://api.ktor.io/ktor-client-auth/io.ktor.client.plugins.auth.providers/-digest-auth-credentials/index.html) 提供所需的凭据，并将该对象传递给 [credentials](https://api.ktor.io/ktor-client-auth/io.ktor.client.plugins.auth.providers/-digest-auth-config/credentials.html) 函数。
3. （可选）使用 `realm` 属性配置 realm。

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

> 您可以在此处找到完整示例：[client-auth-digest](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-auth-digest)。