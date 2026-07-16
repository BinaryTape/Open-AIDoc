[//]: # (title: 在 Ktor Server 中跟踪请求)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="artifact_name" value="ktor-server-call-id"/>
<var name="package_name" value="io.ktor.server.plugins.callid"/>
<var name="plugin_name" value="CallId"/>

<tldr>
<p>
<b>所需依赖项</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="call-id"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor 支持 Kotlin/Native，允许您在没有额外运行时或虚拟机的情况下运行服务器。">原生服务器</Links>支持</b>：✅
</p>
</tldr>

<link-summary>
%plugin_name% 服务器插件允许您通过使用唯一的调用 ID 来跟踪客户端请求。
</link-summary>

[%plugin_name%](https://api.ktor.io/ktor-server-call-id/io.ktor.server.plugins.callid/-call-id.html) 插件允许您通过使用唯一的请求 ID 或调用 ID 端到端地跟踪客户端请求。通常，在 Ktor 中使用调用 ID 的流程如下：
1. 首先，您需要通过以下方式之一获取特定请求的调用 ID：
   * 反向代理（如 Nginx）或云提供商（如 [Heroku](heroku.md)）可能会在特定的标头中添加调用 ID，例如 `X-Request-Id`。在这种情况下，Ktor 允许您[获取](#retrieve)调用 ID。
   * 否则，如果请求未携带调用 ID，您可以在 Ktor 服务器上[生成](#generate)它。
2. 接下来，Ktor 使用预定义字典[验证](#verify)获取/生成的调用 ID。您也可以提供自己的条件来验证调用 ID。
3. 最后，您可以将调用 ID 在特定的标头（例如 `X-Request-Id`）中[发送](#send)给客户端。

将 `%plugin_name%` 与 [CallLogging](server-call-logging.md) 结合使用，通过[将调用 ID 放入](#put-call-id-mdc) MDC 上下文并配置日志记录器以显示每个请求的调用 ID，可以帮助您对调用进行故障排除。

> 在客户端，Ktor 提供了 [CallId](client-call-id.md) 插件用于跟踪客户端请求。

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
    要将 <code>%plugin_name%</code> 插件<a href="#install">安装</a>到应用程序，请将其传递给指定的<Links href="/ktor/server-modules" summary="模块允许您通过对路由进行分组来构建应用程序结构。">模块</Links>中的 <code>install</code> 函数。
    下面的代码片段显示了如何安装 <code>%plugin_name%</code> ...
</p>
<list>
    <li>
        ... 在 <code>embeddedServer</code> 函数调用内部。
    </li>
    <li>
        ... 在显式定义的 <code>module</code> 内部，该模块是 <code>Application</code> 类的一个扩展函数。
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

## 配置 %plugin_name% {id="configure"}

### 获取调用 ID {id="retrieve"}

`%plugin_name%` 提供了几种获取调用 ID 的方法：

* 要从指定的标头中获取调用 ID，请使用 `retrieveFromHeader` 函数，例如：
   ```kotlin
   install(CallId) {
       retrieveFromHeader(HttpHeaders.XRequestId)
   }
   ```
   您还可以使用 `header` 函数在同一个标头中[获取并发送调用 ID](#send)。

* 如果需要，您可以从 `ApplicationCall` 中获取调用 ID：
   ```kotlin
   install(CallId) {
       retrieve { call ->
           call.request.header(HttpHeaders.XRequestId)
       }
   }
   ```
请注意，所有获取的调用 ID 都会使用默认字典进行[验证](#verify)。

### 生成调用 ID {id="generate"}

如果传入的请求不包含调用 ID，您可以使用 `generate` 函数生成它：
* 下面的示例显示了如何从预定义字典生成指定长度的调用 ID：
   ```kotlin
   install(CallId) {
       generate(10, "abcde12345")
   }
   ```
* 在下面的示例中，`generate` 函数接受一个用于生成调用 ID 的代码块：
   ```kotlin
   install(CallId) {
       val counter = atomic(0)
       generate {
           "generated-call-id-${counter.getAndIncrement()}"
       }
   }
   ```

### 验证调用 ID {id="verify"}

所有[获取](#retrieve)/[生成](#generate)的调用 ID 都会使用默认字典进行验证，如下所示：

```kotlin
CALL_ID_DEFAULT_DICTIONARY: String = "abcdefghijklmnopqrstuvwxyz0123456789+/=-"
```
这意味着包含大写字母的调用 ID 将无法通过验证。如果需要，您可以使用 `verify` 函数应用不太严格的规则：

```kotlin
install(CallId) {
    verify { callId: String ->
        callId.isNotEmpty()
    }
}
```

您可以在此处找到完整示例：[call-id](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/call-id)。

### 将调用 ID 发送到客户端 {id="send"}

在[获取](#retrieve)/[生成](#generate)调用 ID 后，您可以将其发送给客户端：

* `header` 函数可用于[获取调用 ID](#retrieve)并在同一个标头中发送它：

   ```kotlin
   install(CallId) {
       header(HttpHeaders.XRequestId)
   }
   ```

  您可以在此处 find 完整示例：[call-id](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/call-id)。

* `replyToHeader` 函数在指定的标头中发送调用 ID：
   ```kotlin
   install(CallId) {
       replyToHeader(HttpHeaders.XRequestId)
   }
   ```

* If required, you can use `ApplicationCall` to send a call ID in a [response](server-responses.md):
   ```kotlin
   reply { call, callId ->
       call.response.header(HttpHeaders.XRequestId, callId)
   }
   ```

## 将调用 ID 放入 MDC {id="put-call-id-mdc"}

将 `%plugin_name%` 与 [CallLogging](server-call-logging.md) 结合使用，通过将调用 ID 放入 MDC 上下文并配置日志记录器以显示每个请求的调用 ID，可以帮助您对调用进行故障排除。为此，请在 `CallLogging` 配置块内调用 `callIdMdc` 函数，并指定要放入 MDC 上下文的所需键：

```kotlin
install(CallLogging) {
    callIdMdc("call-id")
}
```

此键可以传递给[日志记录器配置](server-logging.md#configure-logger)以在日志中显示调用 ID。例如，`logback.xml` 文件可能如下所示：
```
<appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
    <encoder>
        <pattern>%d{YYYY-MM-dd HH:mm:ss.SSS} [%thread] %X{call-id} %-5level %logger{36} - %msg%n</pattern>
    </encoder>
</appender>
```

您可以在此处找到完整示例：[call-id](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/call-id)。