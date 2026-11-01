[//]: # (title: HTMX 集成)

<show-structure for="chapter" depth="2"/>
<primary-label ref="experimental"/>

<tldr>
<p>
<b>所需依赖项</b>：<code>io.ktor:ktor-htmx</code>、<code>io.ktor:ktor-htmx-html</code>、
<code>io.ktor:ktor-server-htmx</code>
</p>
<var name="example_name" value="htmx-integration"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

[HTMX](https://htmx.org/) 是一个轻量级 JavaScript 库，可通过 HTML 属性实现动态客户端行为。它支持诸如 AJAX、CSS 过渡（transitions）、WebSocket 以及 Server-Sent Events 等功能，而无需编写 JavaScript。

Ktor 通过一组共享模块为 HTMX 提供实验性的一等公民支持，简化了服务器和客户端上下文中的集成。这些模块提供了用于处理 HTMX 标头、使用 Kotlin DSL 定义 HTML 属性以及在服务器上处理特定于 HTMX 的路由逻辑的工具。

## 模块概述 {id="modules-overview"}

Ktor 的 HTMX 支持分布在三个实验性模块中：

| 模块 | 描述 |
|--------------------|--------------------------------------------|
| `ktor-htmx`        | 核心定义与标头常量 |
| `ktor-htmx-html`   | 与 Kotlin HTML DSL 的集成 |
| `ktor-server-htmx` | 对特定于 HTMX 请求的路由支持 |

所有 API 均标记有 `@ExperimentalKtorApi`，需要通过 `@OptIn(ExperimentalKtorApi::class)` 选择使用。

## HTMX 标头 {id="htmx-headers"}

您可以使用核心 `ktor-htmx` 模块中预定义的常量，以类型安全的方式访问或设置 HTMX 标头。这些常量有助于在检测触发器、历史记录恢复或内容交换等 HTMX 行为时避免使用魔术字符串（magic strings）。

### 请求标头 {id="request-headers"}

使用 `HxRequestHeaders` 对象在您的应用程序中读取或匹配 HTMX 请求标头：

<deflist type="wide">
<def title="HxRequestHeaders.Request">对于 HTMX 请求始终为 <code>true</code></def>
<def title="HxRequestHeaders.Target">目标元素的 ID</def>
<def title="HxRequestHeaders.Trigger">触发元素的 ID</def>
<def title="HxRequestHeaders.TriggerName">触发元素的名称</def>
<def title="HxRequestHeaders.Boosted">指示是否通过 hx-boost 发出请求</def>
<def title="HxRequestHeaders.CurrentUrl">当前浏览器 URL</def>
<def title="HxRequestHeaders.HistoryRestoreRequest">用于历史记录恢复</def>
<def title="HxRequestHeaders.Prompt">用户对 hx-prompt 的响应</def>
</deflist>

### 响应标头 {id="response-headers"}

您可以使用 `HxResponseHeaders` 对象来访问 HTMX 响应标头的常量：

<deflist type="wide">
<def title="HxResponseHeaders.Location">客户端重定向且无需重新加载页面</def>
<def title="HxResponseHeaders.PushUrl">将 URL 推入历史记录堆栈</def>
<def title="HxResponseHeaders.Redirect">客户端重定向</def>
<def title="HxResponseHeaders.Refresh">强制全页刷新</def>
<def title="HxResponseHeaders.ReplaceUrl">替换当前 URL</def>
<def title="HxResponseHeaders.Reswap">控制响应内容的交换方式</def>
<def title="HxResponseHeaders.Retarget">更新内容更新的目标</def>
<def title="HxResponseHeaders.Reselect">选择响应中需要交换的部分</def>
<def title="HxResponseHeaders.Trigger">触发客户端事件</def>
<def title="HxResponseHeaders.TriggerAfterSettle">在稳定（settle）后触发事件</def>
<def title="HxResponseHeaders.TriggerAfterSwap">在交换后触发事件</def>
</deflist>

## 交换模式 {id="swap-modes"}

您可以使用核心 `ktor-htmx` 模块中的 `HxSwap` 对象来访问不同 HTMX 交换模式的常量。

<deflist type="medium">
<def title="HxSwap.innerHtml">替换内部 HTML（默认）</def>
<def title="HxSwap.outerHtml ">替换整个元素</def>
<def title="HxSwap.textContent">仅替换文本内容</def>
<def title="HxSwap.beforeBegin">插入到目标元素之前</def>
<def title="HxSwap.afterBegin">作为第一个子节点插入</def>
<def title="HxSwap.beforeEnd">作为最后一个子节点插入</def>
<def title="HxSwap.afterEnd">插入到目标元素之后</def>
<def title="HxSwap.delete">删除目标元素</def>
<def title="HxSwap.none">不追加任何内容</def>
</deflist>

## HTML DSL 扩展 {id="html-dsl-extensions"}

`ktor-htmx-html` 模块为 Kotlin 的 HTML DSL 添加了扩展函数，允许您直接向 HTML 元素添加 HTMX 属性：

```kotlin
@OptIn(ExperimentalKtorApi::class)
html {
    body {
        button {
            attributes.hx {
                get = "/data"
                target = "#result"
                swap = HxSwap.outerHtml
                trigger = "click"
            }
            +"Load Data"
        }
    }
}
```

上述示例会生成带有 HTMX 属性的 HTML：

```html
<button hx-get="/api/data" hx-target="#result-div" hx-swap="outerHTML" hx-trigger="click">Load Data</button>
```

## 服务器端路由 {id="server-side-routing"}

`ktor-server-htmx` 模块通过 `hx` DSL 块提供支持 HTMX 感知的路由：

```kotlin
@OptIn(ExperimentalKtorApi::class)
routing {
    route("api") {
        // 普通路由（同时处理 HTMX 和非 HTMX 请求）
        get {
            call.respondText("Regular response")
        }
        
        // 仅匹配 HTMX 请求（存在 HX-Request 标头）
        hx.get {
            call.respondText("HTMX response")
        }
        
        // 匹配具有特定目标的 HTMX 请求
        hx {
            target("#result-div") {
                get {
                    call.respondText("Response for #result-div")
                }
            }
            
            // 匹配具有特定触发器的 HTMX 请求
            trigger("#load-button") {
                get {
                    call.respondText("Response for #load-button clicks")
                }
            }
        }
    }
}
```

这些功能允许您的应用程序根据客户端发送的 HTMX 标头作出不同的响应。