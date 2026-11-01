[//]: # (title: HTTP 请求生命周期)

<primary-label ref="server-plugin"/>

<var name="plugin_name" value="HttpRequestLifecycle"/>
<var name="example_name" value="server-http-request-lifecycle"/>

<tldr>
<p>
<b>所需依赖项</b>: <code>io.ktor:ktor-server-core</code>
</p>
<p>
    <b>代码示例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
<b>支持的引擎</b>: <code>Netty</code>, <code>CIO</code>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">Native 服务器</Links> 支持</b>: ✖️
</p>
</tldr>

默认情况下，即使客户端断开连接，Ktor 也会继续处理请求。[`%plugin_name%`](https://api.ktor.io/ktor-http/io.ktor.http/-http-request-lifecycle.html) 插件允许你在客户端断开连接时立即取消请求处理。

这对于运行时间较长或资源密集型的请求非常有用，当客户端不再等待响应时，这些请求应当停止执行。

## 安装与配置 %plugin_name% {id="install_plugin"}

要启用 `HttpRequestLifecycle` 插件，请在应用程序模块中使用 `install` 函数安装它，并设置 `cancelCallOnClose` 属性：

```kotlin
import io.ktor.server.application.*
import io.ktor.server.http.HttpRequestLifecycle

fun Application.module() {
    install(HttpRequestLifecycle) {
        cancelCallOnClose = true
    }
}
```

启用 `cancelCallOnClose` 属性后，`%plugin_name%` 插件会为每个请求安装一个取消处理程序。当客户端断开连接时，只有处理该特定路由的协程会被取消。

取消会通过结构化并发传播，因此从请求协程启动的任何子协程（例如使用 `launch` 或 `async`）也会被取消。在下一个挂起点将抛出 `CancellationException`。

## 处理取消 {id="handle_cancellation"}

你可以捕获 `CancellationException` 来执行清理操作，例如释放资源或停止后台工作：

```kotlin
fun Application.module() {
    install(HttpRequestLifecycle) {
        cancelCallOnClose = true
    }

    routing {
        get("/long-process") {
            try {
                while (isActive) {
                    delay(10_000)
                    log.info("Very important work.")
                }
                call.respond("Completed")
            } catch (e: CancellationException) {
                log.info("Cleaning up resources.")
            }
        }
    }
}
```

> 协程取消是协作式的。阻塞或 CPU 密集型代码不会自动中断。
> 如果请求处理执行长时间运行的工作，请调用 `call.coroutineContext.ensureActive()` 以响应取消。
>
> 要了解更多信息，请参阅 [协程取消](https://kotlinlang.org/docs/cancellation-and-timeouts.html)。
{style="note"}

> 有关完整示例，请参阅 [%example_name%](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%)。

## 限制 {id="limitations"}

该插件仅在 `CIO` 和 `Netty` 引擎上得到完全支持。基于 Servlet 的引擎（或其他不受支持的引擎）无法可靠地检测客户端断开连接。只有当服务器尝试写入响应时才能检测到取消。