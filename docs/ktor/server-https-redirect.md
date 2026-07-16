[//]: # (title: HttpsRedirect)

<primary-label ref="server-plugin"/>

<var name="plugin_name" value="HttpsRedirect"/>
<var name="package_name" value="io.ktor.server.plugins.httpsredirect"/>
<var name="artifact_name" value="ktor-server-http-redirect"/>

<tldr>
<p>
<b>所需依赖项</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="ssl-engine-main-redirect"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor 支持 Kotlin/Native，并允许您在没有额外运行时或虚拟机的情况下运行服务器。">Native 服务器</Links> 支持</b>：✅
</p>
</tldr>

[%plugin_name%](https://api.ktor.io/ktor-server-http-redirect/io.ktor.server.plugins.httpsredirect/-https-redirect.html) 插件在处理调用之前，会将所有 HTTP 请求重定向到其 [HTTPS 对应项](server-ssl.md)。默认情况下，资源返回 `301 Moved Permanently`，但也可以配置为返回 `302 Found`。

## 添加依赖项 {id="add_dependencies"}

<p>
    要使用 <code>%plugin_name%</code>，您需要在构建脚本中包含 <code>%artifact_name%</code> 构件：
</p>
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

## 安装 %plugin_name% {id="install_plugin"}

<p>
    要将 <code>%plugin_name%</code> 插件<a href="#install">安装</a>到应用，
    请在指定的<Links href="/ktor/server-modules" summary="模块允许您通过对路由进行分组来组织应用结构。">模块</Links>中将其传递给 <code>install</code> 函数。
    以下代码段展示了如何安装 <code>%plugin_name%</code> ...
</p>
<list>
    <li>
        ... 在 <code>embeddedServer</code> 函数调用中。
    </li>
    <li>
        ... 在显式定义的 <code>module</code>（它是 <code>Application</code> 类的扩展函数）中。
    </li>
</list>
<Tabs>
    <TabItem title="embeddedServer">
        <code-block lang="kotlin" code="            import io.ktor.server.engine.*&#10;            import io.ktor.server.netty.*&#10;            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;&#10;            fun main() {&#10;                embeddedServer(Netty, port = 8080) {&#10;                    install(%plugin_name%)&#10;                    // ...&#10;                }.start(wait = true)&#10;            }"></code-block>
    </TabItem>
    <TabItem title="module">
        <code-block lang="kotlin" code="            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;            // ...&#10;            fun Application.module() {&#10;                install(%plugin_name%)&#10;                // ...&#10;            }"></code-block>
    </TabItem>
</Tabs>

上面的代码使用默认配置安装了 `%plugin_name%` 插件。

>当位于反向代理之后时，您需要安装 `ForwardedHeader` 或 `XForwardedHeader` 插件以正确检测 HTTPS 请求。如果在安装这些插件之一后遇到无限重定向，请查看 [此常见问题解答条目](FAQ.topic#infinite-redirect) 了解更多详情。
>
{type="note"}

## 配置 %plugin_name% {id="configure"}

以下代码段展示了如何配置所需的 HTTPS 端口，并为请求的资源返回 `301 Moved Permanently`：

```kotlin
install(HttpsRedirect) {
    sslPort = 8443
    permanentRedirect = true
}
```

您可以在此处找到完整示例：[ssl-engine-main-redirect](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/ssl-engine-main-redirect)。