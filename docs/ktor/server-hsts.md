[//]: # (title: HSTS)

<primary-label ref="server-plugin"/>

<var name="plugin_name" value="HSTS"/>
<var name="package_name" value="io.ktor.server.plugins.hsts"/>
<var name="artifact_name" value="ktor-server-hsts"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.hsts"/>

<tldr>
<p>
<b>所需依赖项</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="ssl-engine-main-hsts"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor 支持 Kotlin/Native，允许您在无需额外运行时或虚拟机的情况下运行服务器。">Native 服务器</Links>支持</b>：✅
</p>
</tldr>

[%plugin_name%](https://api.ktor.io/ktor-server-hsts/io.ktor.server.plugins.hsts/-h-s-t-s.html) 插件根据 [RFC 6797](https://tools.ietf.org/html/rfc6797) 为请求添加必需的 _HTTP 严格传输安全 (HTTP Strict Transport Security)_ 标头。当浏览器接收到 HSTS 策略标头后，在给定期限内将不再尝试使用不安全的连接来连接服务器。

> 请注意，通过不安全的 HTTP 连接传输时，HSTS 策略标头会被忽略。为了使 HSTS 生效，应通过[安全](server-ssl.md)连接提供服务。

## 添加依赖项 {id="add_dependencies"}

<p>
    要使用 <code>%plugin_name%</code>，请将 <code>%artifact_name%</code> 工件添加到构建脚本中：
</p>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目录 (version catalog)</a> 来指定 Ktor 依赖项。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目录 (version catalog)</a> 来指定 Ktor 依赖项。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## 安装 %plugin_name% {id="install_plugin"}

<p>
    要将 <code>%plugin_name%</code> 插件<a href="server-plugins.md#install">安装</a>到应用程序中，
    请将其传递给指定<Links href="server-modules.md" summary="模块允许您通过对路由进行分组来组织应用程序的结构。">模块</Links>中的 <code>install</code> 函数。
    以下示例展示了如何安装 <code>%plugin_name%</code>：
</p>
<list>
    <li>
        在 <code>embeddedServer()</code> 函数调用中。
    </li>
    <li>
        在 <code>Application</code> 类显式定义的 <code>module()</code> 扩展函数中。
    </li>
</list>
<Tabs>
    <TabItem title="embeddedServer">
        <code-block lang="kotlin" code="            import io.ktor.server.engine.*&#10;            import io.ktor.server.netty.*&#10;            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;&#10;            fun main() {&#10;                embeddedServer(Netty, port = 8080) {&#10;                    install(%plugin_name%)&#10;                    // ...&#10;                }.start(wait = true)&#10;            }"/>
    </TabItem>
    <TabItem title="module">
        <code-block lang="kotlin" code="            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;            // ...&#10;            fun Application.module() {&#10;                install(%plugin_name%)&#10;                // ...&#10;            }"/>
    </TabItem>
</Tabs>
<p>
    <code>%plugin_name%</code> 插件也可以<a href="server-plugins.md#install-route">安装到特定路由</a>。
    如果您需要针对不同的应用程序资源使用不同的 <code>%plugin_name%</code> 配置，这会非常有用。
</p>

## 配置 %plugin_name% {id="configure"}

`%plugin_name%` 通过 [HSTSConfig](https://api.ktor.io/ktor-server-hsts/io.ktor.server.plugins.hsts/-h-s-t-s-config/index.html) 公开其设置。下面的示例展示了如何使用 `maxAgeInSeconds` 属性来指定客户端应在已知 HSTS 主机列表中保留该主机的时长：

```kotlin
install(HSTS) {
    maxAgeInSeconds = 10
}
```

您还可以使用 `withHost` 为不同的主机提供不同的 HSTS 配置：

```kotlin
install(HSTS) {
    maxAgeInSeconds = 10
    withHost("sample-host") {
        maxAgeInSeconds = 60
        includeSubDomains = false
    }
}
```

您可以在此处找到完整示例：[ssl-engine-main-hsts](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/ssl-engine-main-hsts)。