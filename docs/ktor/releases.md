[//]: # (title: Ktor 版本发布)

<show-structure for="chapter" depth="2"/>

Ktor 遵循[语义化版本控制](https://semver.org/)：

- _主要版本_ (x.0.0) 包含不兼容的 API 变更。
- _次要版本_ (x.y.0) 提供向后兼容的新功能。
- _修订版本_ (x.y.z) 包含向后兼容的修复。

对于每个主要和次要版本，我们还会发布几个预览 (EAP) 版本，以便您在正式发布前试用新功能。欲了解更多详情，请参阅[抢先体验计划](https://ktor.io/eap/)。

## Gradle 插件 {id="gradle"}

[Gradle Ktor 插件](https://github.com/ktorio/ktor-build-plugins)与框架处于相同的发布周期。
您可以在 [Gradle 插件门户](https://plugins.gradle.org/plugin/io.ktor.plugin)上找到所有插件版本。

## IntelliJ Ultimate 插件 {id="intellij"}

[IntelliJ Ktor 插件](https://www.jetbrains.com/help/idea/ktor.html)独立于 Ktor 框架发布，并使用与 [IntelliJ IDEA Ultimate](https://www.jetbrains.com/idea/download/other.html) 相同的发布周期。

### 更新到新版本 {id="update"}

IntelliJ Ktor 插件允许您将 Ktor 项目迁移到最新版本。
您可以从[迁移项目](https://www.jetbrains.com/help/idea/ktor.html#migrate)章节了解更多信息。

## 发布详情 {id="release-details"}

下表列出了最新 Ktor 版本的详细信息。

<table>

<tr>
<td>版本</td><td>发布日期</td><td>亮点</td>
</tr>

<tr>
<td>3.5.1</td><td>2026 年 6 月 26 日</td><td>
<p>
一个修订版本，包含 OpenAPI 插件改进、扩展的身份验证 KDoc 文档，以及广泛的错误修复，涵盖 Kotlin 2.4 编译器兼容性、HTTP 和缓存行为、身份验证、WebRTC 稳定性以及跨 JVM、Darwin、Android 和 Windows 的平台特定问题。
</p>
<var name="version" value="3.5.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看变更日志</a>
</p>
</td>
</tr>

<tr>
<td>3.5.0</td><td>2026 年 5 月 15 日</td><td>
<p>
一个次要版本，引入了 RFC 7616 摘要身份验证支持、针对 OkHttp 和 Apache5 的自定义 DNS 解析器配置、请求参数助手函数，以及在配置、会话和 JavaScript 兼容性方面的其他改进。
欲了解更多详情，请参阅 <Links href="/ktor/whats-new-350" summary="undefined">Ktor 3.5.0 最新变化</Links>。
</p>
<var name="version" value="3.5.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看变更日志</a>
</p>
</td>
</tr>

<tr>
<td>3.4.3</td><td>2026 年 4 月 22 日</td><td>
<p>
一个修订版本，专注于稳定性，修复了 OpenAPI 架构推断、客户端引擎生命周期问题以及多个并发和特定于平台的错误。
</p>
<var name="version" value="3.4.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看变更日志</a>
</p>
</td>
</tr>

<tr>
<td>3.4.2</td><td>2026 年 3 月 27 日</td><td>
<p>
一个修订版本，通过分配优化和 WebSocket 修复提升了客户端和引擎的性能，同时解决了一系列涉及 OpenAPI、日志记录、GraalVM 兼容性、Netty、Darwin、依赖注入、压缩、证书锁定以及 Kotlin/Native 的问题。
</p>
<var name="version" value="3.4.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看变更日志</a>
</p>
</td>
</tr>

<tr>
<td>3.4.1</td><td>2026 年 3 月 4 日</td><td>
<p>
一个修订版本，包含重要的回归修复，包括解决 <a href="whats-new-340.md#use-engine-dispatcher">使用引擎调度器的 HttpStatement 执行问题</a> 并恢复了正确的 <code>StreamResetException</code> 传播。它还包含性能改进、OpenAPI 增强以及跨引擎和平台的多个稳定性修复。
</p>
<var name="version" value="3.4.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看变更日志</a>
</p>
</td>
</tr>

<tr>
<td>3.4.0</td><td>2026 年 1 月 23 日</td><td>
<p>
一个次要版本，引入了运行时生成的 OpenAPI 规范、Zstd 和 Jackson 3 支持、OkHttp 的双工流，以及数十个增强整个框架可靠性的错误修复。
</p>
<var name="version" value="3.4.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看变更日志</a>
</p>
</td>
</tr>

<tr>
<td>3.3.3</td><td>2025 年 11 月 26 日</td><td>
<p>
一个修订版本，在 Jetty Client 上增加了对明文 HTTP/2 (h2c) 的支持，改进了日志记录和 OpenAPI 生成，并修复了引擎、SSE 处理、双重响应、HTTP/2 标头和客户端缓存中的错误。
</p>
<var name="version" value="3.3.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看变更日志</a>
</p>
</td>
</tr>

<tr>
<td>3.3.2</td><td>2025 年 11 月 5 日</td><td>
<p>
一个修订版本，为 Darwin 增加了 SOCKS 代理支持，优化了 WebRTC 客户端目标和 Java 代理处理，并修复了 HTTP 重试、OpenAPI、缓存以及 Android 上的 Netty 中的多个问题。
</p>
<var name="version" value="3.3.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看变更日志</a>
</p>
</td>
</tr>

<tr>
<td>3.3.1</td><td>2025 年 10 月 8 日</td><td>
<p>
一个修订版本，将 Kotlin 更新至 2.2.20，并修复了包括 Content-Length 解析错误、<code>ClientSSESession</code> 缺失序列化程序、Netty 配置和停机错误在内的多项问题，并增加了对在 bootJar 中提供静态资源的支持。
</p>
<var name="version" value="3.3.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看变更日志</a>
</p>
</td>
</tr>

<tr>
<td>3.3.0</td><td>2025 年 9 月 11 日</td><td>
<p>
一个次要版本，引入了主要功能，如实验性 OpenAPI 生成预览、改进的静态内容处理、适用于 Android 和 JS/Wasm 的 WebRTC 客户端，以及向 Jetty、OkHttp 和 Kotlin 2.2 的升级。欲了解更多详情，请参阅 <Links href="/ktor/whats-new-330" summary="undefined">Ktor 3.3.0 最新变化</Links>。
</p>
<var name="version" value="3.3.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看变更日志</a>
</p>
</td>
</tr>

<tr>
<td>3.2.3</td><td>2025 年 7 月 29 日</td><td>
<p>
一个修订版本，引入了对 YAML 配置处理、DI 解析以及 Wasm/JS 稳定性的改进，同时修复了分段解析、CIO <code>100 Continue</code> 响应格式化、<code>ByteReadChannel</code> 中的无限读取循环以及服务器停机问题。
</p>
<var name="version" value="3.2.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看变更日志</a>
</p>
</td>
</tr>

<tr>
<td>3.2.2</td><td>2025 年 7 月 14 日</td><td>
<p>
一个修订版本，改进了 SSE 字段序列化顺序，并解决了包括 CORS 预检处理、测试应用流式传输、配置反序列化错误以及跨平台缺失标头在内的多项问题（包括 3.2.1 中影响 wasmJs 和 Darwin 目标的回归问题）。
</p>
<var name="version" value="3.2.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看变更日志</a>
</p>
</td>
</tr>

<tr>
<td>3.2.1</td><td>2025 年 7 月 4 日</td><td>
<p>
一个修订版本，包括对时间 API、模板和发布的改进，以及针对 3.2.0 中引入的插件行为、Netty、OkHttp 和启动问题的关键错误修复。
</p>
<var name="version" value="3.2.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看变更日志</a>
</p>
</td>
</tr>

<tr>
<td>3.2.0</td><td>2025 年 6 月 12 日</td><td>
<p>
一个次要版本，引入了类型化配置反序列化、新的依赖注入和 HTMX 模块、Gradle 版本目录支持以及挂起模块支持。欲了解更多详情，请参阅 <Links href="/ktor/whats-new-320" summary="undefined">Ktor 3.2.0 最新变化</Links>。
</p>
<var name="version" value="3.2.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看变更日志</a>
</p>
</td>
</tr>

<tr>
<td>3.1.3</td><td>2025 年 5 月 5 日</td><td><p>
一个修订版本，包括性能改进（如更快的字节操作和分段处理）以及更安全的令牌刷新处理。它还修复了指标中的内存问题，改进了标头行为，解决了 WebSockets、OkHttp、Apache5 和 Netty 中的错误，并更新了 JTE 以支持 Kotlin 2.1.0。
</p>
<var name="version" value="3.1.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看变更日志</a>
</p>
</td>
</tr>

<tr>
<td>3.1.2</td><td>2025 年 3 月 27 日</td><td><p>
一个修订版本，将 Kotlin 更新至 2.1.20，并修复了各种问题，包括 Base64 解码、身份验证令牌清除、Android 服务器启动错误、WebSocket 标头格式化和 SSE 会话取消。 
</p>
<var name="version" value="3.1.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看变更日志</a>
</p>
</td>
</tr>

<tr>
<td>3.1.1</td><td>2025 年 2 月 24 日</td><td><p>
一个修订版本，改进了日志记录并修复了 WebSocket 超时处理。它修复了多个错误，包括 HTTP 缓存不一致、表单数据复制错误、gzip 处理崩溃以及导致段池损坏的并发问题。
</p>
<var name="version" value="3.1.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看变更日志</a>
</p>
</td>
</tr>

<tr>
<td>3.1.0</td><td>2025 年 2 月 11 日</td><td><p>
一个次要版本，引入了各种 SSE 功能，并扩展了 CIO 引擎和 WebSocket 支持。它增强了平台兼容性、日志记录和身份验证，同时修复了与字节通道处理、HTTP 请求失败和并发问题相关的关键错误。
</p>
<var name="version" value="3.1.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看变更日志</a>
</p>
</td>
</tr>

<tr>
<td>3.0.3</td><td>2024 年 12 月 18 日</td><td><p>
一个修订版本，包含各种错误修复，包括修复 <code>browserProductionWebpack</code> 中的构建错误、gzipped 内容处理以及 <code>FormFieldLimit</code> 配置覆盖。此版本还包括核心性能改进和正确的测试应用停机。
</p>
<var name="version" value="3.0.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看变更日志</a>
</p>
</td>
</tr>

<tr>
<td>3.0.2</td><td>2024 年 12 月 4 日</td><td><p>
一个修订版本，解决了与响应损坏、正文截断、连接处理和错误标头相关的多个错误修复，同时扩展了二进制编码支持并增强了 Android 的性能。 
</p>
<var name="version" value="3.0.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看变更日志</a>
</p>
</td>
</tr>

<tr>
<td>2.3.13</td><td>2024 年 11 月 20 日</td><td><p>
一个修订版本，包含错误修复、安全补丁和改进，包括增加了对 <code>watchosDeviceArm64</code> 目标的支持。  
</p>
<var name="version" value="2.3.13"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看变更日志</a>
</p>
</td>
</tr>

<tr>
<td>3.0.1</td><td>2024 年 10 月 29 日</td><td><p>
一个修订版本，包括客户端和服务器日志记录的改进，以及各种错误修复。  
</p>
<var name="version" value="3.0.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看变更日志</a>
</p>
</td>
</tr>

<tr>
<td>3.0.0</td><td>2024 年 10 月 9 日</td><td><p>
一个主要版本，包含改进和错误修复，包括增加了对 Android Native 目标的支持。
欲了解更多关于破坏性变更的信息，请参阅<Links href="/ktor/migrating-3" summary="undefined">迁移指南</Links>。
</p>
<var name="version" value="3.0.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看变更日志</a>
</p>
</td>
</tr>

<tr>
<td>3.0.0-rc-2</td><td>2024 年 10 月 2 日</td><td><p>
一个主要发布候选版，包含各种改进（带破坏性变更）、错误修复和功能，例如对 XML 的多平台支持。
</p>
<var name="version" value="3.0.0-rc-2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看变更日志</a>
</p>
</td>
</tr>

<tr>
<td>3.0.0-rc-1</td><td>2024 年 9 月 9 日</td><td><p>
一个主要发布候选版，包含显著的改进和错误修复。此更新增强了向后兼容性，并具有扩展的 <code>staticZip</code> 支持。
</p>
<var name="version" value="3.0.0-rc-1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看变更日志</a>
</p>
</td>
</tr>

<tr>
<td>3.0.0-beta-2</td><td>2024 年 7 月 15 日</td><td><p>
一个主要预发布版本，包含各种改进和错误修复，包括 SSE 支持改进和适用于 Kotlin/Wasm 的 Ktor 客户端。
</p>
<var name="version" value="3.0.0-beta-2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看变更日志</a>
</p>
</td>
</tr>

<tr>
<td>2.3.12</td><td>2024 年 6 月 20 日</td><td><p>
一个修订版本，包括 Ktor 核心和 Ktor 服务器中的错误修复，以及 Netty 和 OpenAPI 的版本更新。
</p>
<var name="version" value="2.3.12"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看变更日志</a>
</p>
</td>
</tr>

<tr>
<td>2.3.11</td><td>2024 年 5 月 9 日</td><td><p>
一个修订版本，包括一个关于将套接字超时应用于测试客户端引擎的错误修复。
</p>
<var name="version" value="2.3.11"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看变更日志</a>
</p>
</td>
</tr>

<tr>
<td>2.3.10</td><td>2024 年 4 月 8 日</td><td><p>
一个修订版本，包括对 CallLogging 和 SSE 服务器插件的各种错误修复，改进了 Android 客户端日志记录等。
</p>
<var name="version" value="2.3.10"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看变更日志</a>
</p>
</td>
</tr>

<tr>
<td>2.3.9</td><td>2024 年 3 月 4 日</td><td><p>
一个修订版本，包括对 ContentNegotiation 客户端插件的错误修复，以及增加了对通过 HTTP 发送安全 Cookie 的支持。
</p>
<var name="version" value="2.3.9"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看变更日志</a>
</p>
</td>
</tr>

<tr>
<td>2.3.8</td><td>2024 年 1 月 31 日</td><td><p>
一个修订版本，包括对 URLBuilder、CORS 和 WebSocket 插件的各种错误修复。
</p>
<var name="version" value="2.3.8"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看变更日志</a>
</p>
</td>
</tr>

<tr>
<td>2.3.7</td><td>2023 年 12 月 7 日</td><td>
<p>
一个修订版本，包括 ContentNegotiation、WebSockets 以及 Native Server 中内存使用情况的错误修复。
</p>
<var name="version" value="2.3.7"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看变更日志</a>
</p>
</td>
</tr>

<tr>
<td>3.0.0-beta-1</td><td>2023 年 11 月 23 日</td><td>
<p>
一个主要预发布版本，包含各种改进和错误修复，包括客户端和服务器的 SSE 支持。
</p>
<var name="version" value="3.0.0-beta-1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看变更日志</a>
</p>
</td>
</tr>

<tr>
<td>2.3.6</td><td>2023 年 11 月 7 日</td><td>
<p>
一个修订版本，包括对 2.3.5 中破坏性变更的修复以及其他各种错误修复。
</p>
<var name="version" value="2.3.6"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看变更日志</a>
</p>
</td>
</tr>

<tr>
<td>2.3.5</td><td>2023 年 10 月 5 日</td><td>
<p>
一个修订版本，包括对 Darwin 和 Apache5 引擎配置的修复。
</p>
<var name="version" value="2.3.5"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看变更日志</a>
</p>
</td>
</tr>

<tr>
<td>2.3.4</td><td>2023 年 8 月 31 日</td><td>
<p>
一个修订版本，包括 HTTP Cookie 标头和 NoTransformationFoundException 错误的错误修复。
</p>
<var name="version" value="2.3.4"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看变更日志</a>
</p>
</td>
</tr>

<tr>
<td>2.3.3</td><td>2023 年 8 月 1 日</td><td>
<p>
一个修订版本，包括客户端和服务器对 <code>linuxArm64</code> 的支持以及各种错误修复。
</p>
<var name="version" value="2.3.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看变更日志</a>
</p>
</td>
</tr>

<tr>
<td>2.3.2</td><td>2023 年 6 月 28 日</td><td>
<p>
一个修订版本，将 Kotlin 版本升级到 <code>1.8.22</code> 并包含各种错误修复。
</p>
<var name="version" value="2.3.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看变更日志</a>
</p>
</td>
</tr>

<tr>
<td>2.3.1</td><td>2023 年 5 月 31 日</td><td>
<p>
一个修订版本，包括服务器配置的改进和各种错误修复。
</p>
<var name="version" value="2.3.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看变更日志</a>
</p>
</td>
</tr>

<tr>
<td>2.3.0</td><td>2023 年 4 月 19 日</td><td>
<p>
一个功能发布版本，增加了对多个配置文件、路由中的正则表达式模式等的支持。
</p>
<var name="version" value="2.3.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看变更日志</a>
</p>
</td>
</tr>

<tr>
<td>2.2.4</td><td>2023 年 2 月 28 日</td><td>
<p>
一个修订版本，包含 HTTP 客户端、路由和 ContentNegotiation 中的各种错误修复。
</p>
<var name="version" value="2.2.4"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看变更日志</a>
</p>
</td>
</tr>

<tr>
<td>2.2.3</td><td>2023 年 1 月 31 日</td><td>
<p>
一个修订版本，包括 OAuth2 的多平台功能和各种错误修复。
</p>
<var name="version" value="2.2.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看变更日志</a>
</p>
</td>
</tr>

<tr>
<td>2.2.2</td><td>2023 年 1 月 3 日</td><td>
<p>
一个修订版本，包括针对 <code>2.2.1</code> 的错误修复、对 Swagger 插件的改进和修复等。
</p>
<var name="version" value="2.2.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看变更日志</a>
</p>
</td>
</tr>

<tr>
<td>2.2.1</td><td>2022 年 12 月 7 日</td><td>
<p>
针对 <code>2.2.0</code> 中 <code>java.lang.NoClassDefFoundError: kotlinx/atomicfu/AtomicFU</code> 错误的修订版本。
</p>
<var name="version" value="2.2.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看变更日志</a>
</p>
</td>
</tr>

<tr>
<td>2.2.0</td><td>2022 年 12 月 7 日</td><td>
<p>
一个包含多个功能的版本，包括 Swagger UI 托管、新插件 API、Session 的多平台支持等。
欲了解更多信息，请参阅<Links href="/ktor/migration-to-22x" summary="undefined">从 2.0.x 迁移到 2.2.x</Links> 指南。
</p>
<var name="version" value="2.2.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看变更日志</a>
</p>
</td>
</tr>

<tr>
<td>2.1.3</td><td>2022 年 10 月 26 日</td><td>
<p>
一个包含各种错误修复的修订版本。
</p>
<var name="version" value="2.1.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看变更日志</a>
</p>
</td>
</tr>

<tr>
<td>2.1.2</td><td>2022 年 9 月 29 日</td><td>
<p>
一个包含路由、测试引擎和 Ktor 客户端中错误修复的修订版本。
</p>
<var name="version" value="2.1.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看变更日志</a>
</p>
</td>
</tr>

<tr>
<td>2.1.1</td><td>2022 年 9 月 6 日</td><td>
<p>
一个包含 Ktor 客户端和服务器中各种错误修复的修订版本。
</p>
<var name="version" value="2.1.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看变更日志</a>
</p>
</td>
</tr>

<tr>
<td>2.1.0</td><td>2022 年 8 月 11 日</td><td>
<p>
一个次要版本，增加了对 YAML 配置的支持以及各种其他改进与错误修复。
</p>
<var name="version" value="2.1.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看变更日志</a>
</p>
</td>
</tr>

<tr>
<td>2.0.3</td><td>2022 年 6 月 28 日</td><td>
<p>
一个包含错误修复并将 <code>kotlinx.coroutines</code> 版本升级到 <code>1.6.2</code> 的修订版本。
</p>
<var name="version" value="2.0.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看变更日志</a>
</p>
</td>
</tr>

<tr>
<td>2.0.2</td><td>2022 年 5 月 27 日</td><td>
<p>
一个包含各种改进、错误修复和依赖版本升级的修订版本。
</p>
<var name="version" value="2.0.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看变更日志</a>
</p>
</td>
</tr>

<tr>
<td>2.0.1</td><td>2022 年 4 月 28 日</td><td>
<p>
一个包含各种错误修复并将 Kotlin 版本更新到 <code>1.6.21</code> 的修订版本。
</p>
<var name="version" value="2.0.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看变更日志</a>
</p>
</td>
</tr>

<tr>
<td>2.0.0</td><td>2022 年 4 月 11 日</td><td>
<p>
一个主要版本，包含更新的 API 文档和各种新功能。欲了解更多关于破坏性变更以及如何从 <code>1.x.x</code> 迁移的信息，请参阅<Links href="/ktor/migration-to-20x" summary="undefined">迁移指南</Links>。
</p>
<var name="version" value="2.0.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看变更日志</a>
</p>
</td>
</tr>

<tr>
<td>1.6.8</td><td>2022 年 3 月 15 日</td><td>
<p>
一个包含依赖版本升级的修订版本。
</p>
<var name="version" value="1.6.8"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看变更日志</a>
</p>
</td>
</tr>

</table>