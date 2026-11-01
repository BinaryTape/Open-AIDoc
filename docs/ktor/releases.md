[//]: # (title: Ktor 发布版本)

<show-structure for="chapter" depth="2"/>

Ktor 遵循[语义化版本控制 (Semantic Versioning)](https://semver.org/)：

- _主要版本_（x.0.0）包含不兼容的 API 变更。
- _次要版本_（x.y.0）提供向后兼容的新功能。
- _补丁版本_（x.y.z）包含向后兼容的修复。

对于每个主要和次要版本，我们还会发布多个预览（EAP）版本，供您在新功能正式发布前先行试用。欲了解更多详情，请参阅[抢先体验计划](https://ktor.io/eap/)。

## Gradle 插件 {id="gradle"}

[Gradle Ktor 插件](https://github.com/ktorio/ktor-build-plugins)与框架保持相同的发布周期。
您可以在 [Gradle Plugin Portal](https://plugins.gradle.org/plugin/io.ktor.plugin) 上找到所有插件发布版本。

## IntelliJ Ultimate 插件 {id="intellij"}

[IntelliJ Ktor 插件](https://www.jetbrains.com/help/idea/ktor.html)独立于 Ktor 框架发布，
并与 [IntelliJ IDEA Ultimate](https://www.jetbrains.com/idea/download/other.html) 采用相同的发布周期。

### 更新到新版本 {id="update"}

IntelliJ Ktor 插件允许您将 Ktor 项目迁移至最新版本。
您可以从[迁移项目](https://www.jetbrains.com/help/idea/ktor.html#migrate)部分了解更多信息。

## 版本详情 {id="release-details"}

下表列出了最新 Ktor 版本的详细信息。

<table>

<tr>
<td>版本</td><td>发布日期</td><td>亮点</td>
</tr>

<tr>
<td>3.6.1</td><td>2026 年 10 月 30 日</td><td>
<p>
补丁版本，修复了连接管理、请求取消、流传输、WebSocket 以及特定平台引擎的各种问题，同时改进了路由、HTTP 规范遵循和资源处理。
</p>
<var name="version" value="3.6.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>3.6.0</td><td>2026 年 9 月 17 日</td><td>
<p>
次要版本，为 Netty 添加了实验性 HTTP/3 支持，为 Kotlin Multiplatform 提供了默认客户端引擎，增加了 JVM WebRTC 支持，并在客户端和服务端带来了其他功能与改进。
</p>
欲了解更多详情，请参阅 <Links href="whats-new-360.md" summary="">Ktor 3.6.0 的最新变化</Links>。
<var name="version" value="3.6.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>3.5.2</td><td>2026 年 8 月 4 日</td><td>
<p>
专注于稳定性和性能的补丁版本，增强了速率限制支持，恢复了文本处理性能，并修复了 I/O 处理、OpenAPI 和配置方面的问题。
</p>
<var name="version" value="3.5.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>3.5.1</td><td>2026 年 6 月 26 日</td><td>
<p>
补丁版本，包括 OpenAPI 插件改进、扩展的身份验证 KDoc 文档，以及广泛的错误修复，涵盖 Kotlin 2.4 编译器兼容性、HTTP 与缓存行为、身份验证、WebRTC 稳定性以及跨 JVM、Darwin、Android 和 Windows 的特定平台问题。
</p>
<var name="version" value="3.5.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>3.5.0</td><td>2026 年 5 月 15 日</td><td>
<p>
次要版本，引入了 RFC 7616 Digest 身份验证支持、针对 OkHttp 和 Apache5 的自定义 DNS 解析器配置、请求参数辅助函数，并在配置、会话以及 JavaScript 兼容性方面进行了其他改进。
欲了解更多详情，请参阅 <Links href="whats-new-350.md" summary="">Ktor 3.5.0 的最新变化</Links>。
</p>
<var name="version" value="3.5.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>3.4.3</td><td>2026 年 4 月 22 日</td><td>
<p>
专注于稳定性的补丁版本，修复了 OpenAPI 架构推断、客户端引擎生命周期问题，以及若干并发和特定平台错误。
</p>
<var name="version" value="3.4.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>3.4.2</td><td>2026 年 3 月 27 日</td><td>
<p>
补丁版本，通过内存分配优化和 WebSocket 修复提升了客户端和引擎的性能，并解决了涉及 OpenAPI、日志记录、GraalVM 兼容性、Netty、Darwin、依赖注入、压缩、证书固定（Certificate Pinning）以及 Kotlin/Native 的广泛问题。
</p>
<var name="version" value="3.4.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>3.4.1</td><td>2026 年 3 月 4 日</td><td>
<p>
补丁版本，包含重要的回归修复，包括解决<a href="whats-new-340.md#use-engine-dispatcher">在 3.4.0 中引入的 Flow 不变性错误</a>并恢复正常的 <code>StreamResetException</code> 传播。该版本还包括性能改进、OpenAPI 增强，以及跨引擎和平台的多个稳定性修复。
</p>
<var name="version" value="3.4.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>3.4.0</td><td>2026 年 1 月 23 日</td><td>
<p>
次要版本，引入了运行时生成的 OpenAPI 规范、Zstd 和 Jackson 3 支持、针对 OkHttp 的全双工流传输，以及数十个增强整个框架可靠性的错误修复。
</p>
<var name="version" value="3.4.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>3.3.3</td><td>2025 年 11 月 26 日</td><td>
<p>
补丁版本，在 Jetty Client 上添加了明文 HTTP/2（h2c）支持，改进了日志记录和 OpenAPI 生成，并修复了引擎、SSE 处理、重复响应、HTTP/2 标头和客户端缓存中的错误。
</p>
<var name="version" value="3.3.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>3.3.2</td><td>2025 年 11 月 5 日</td><td>
<p>
补丁版本，为 Darwin 添加了 SOCKS 代理支持，优化了 WebRTC 客户端目标和 Java 代理处理，并修复了 HTTP 重试、OpenAPI、缓存以及 Android 上 Netty 的多个问题。
</p>
<var name="version" value="3.3.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>3.3.1</td><td>2025 年 10 月 8 日</td><td>
<p>
补丁版本，将 Kotlin 更新至 2.2.20，并修复了多个问题，包括 Content-Length 解析错误、缺少 <code>ClientSSESession</code> 的序列化器、Netty 配置与关闭错误，并增加了在 bootJar 内提供静态资源服务的支持。
</p>
<var name="version" value="3.3.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>3.3.0</td><td>2025 年 9 月 11 日</td><td>
<p>
次要版本，引入了实验性 OpenAPI 生成预览、改进的静态内容处理、面向 Android 和 JS/Wasm 的 WebRTC 客户端等主要功能，并升级至 Jetty、OkHttp 和 Kotlin 2.2。欲了解更多信息，请参阅 <Links href="whats-new-330.md" summary="">Ktor 3.3.0 的最新变化</Links>。
</p>
<var name="version" value="3.3.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>3.2.3</td><td>2025 年 7 月 29 日</td><td>
<p>
补丁版本，对 YAML 配置处理、DI 解析以及 Wasm/JS 稳定性进行了改进，同时修复了多部分内容（multipart）解析、CIO <code>100 Continue</code> 响应格式化、<code>ByteReadChannel</code> 中的无限读取循环以及服务器关闭问题。
</p>
<var name="version" value="3.2.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>3.2.2</td><td>2025 年 7 月 14 日</td><td>
<p>
补丁版本，改进了 SSE 字段序列化顺序，并解决了多个问题，包括 CORS 预检处理、测试应用程序流传输、配置反序列化错误，以及跨平台缺失标头的问题（包括 3.2.1 中影响 wasmJs 和 Darwin 目标的回归问题）。
</p>
<var name="version" value="3.2.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>3.2.1</td><td>2025 年 7 月 4 日</td><td>
<p>
补丁版本，包含对时间 API、模板和发布的改进，以及针对插件行为、Netty、OkHttp 和 3.2.0 中引入的启动问题的严重错误修复。
</p>
<var name="version" value="3.2.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>3.2.0</td><td>2025 年 6 月 12 日</td><td>
<p>
次要版本，引入了类型化配置反序列化、新的依赖注入与 HTMX 模块、Gradle 版本目录支持以及挂起（suspend）模块支持。欲了解更多信息，请参阅 <Links href="whats-new-320.md" summary="">Ktor 3.2.0 的最新变化</Links>。
</p>
<var name="version" value="3.2.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>3.1.3</td><td>2025 年 5 月 5 日</td><td><p>
补丁版本，包含性能改进（如更快的字节操作和多部分内容处理），以及更安全的令牌刷新处理。该版本还修复了指标中的内存问题，改进了标头行为，解决了 WebSocket、OkHttp、Apache5 和 Netty 方面的错误，并更新了 JTE 以支持 Kotlin 2.1.0。
</p>
<var name="version" value="3.1.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>3.1.2</td><td>2025 年 3 月 27 日</td><td><p>
补丁版本，将 Kotlin 更新至 2.1.20 并修复了各种问题，包括 Base64 解码、认证令牌清除、Android 服务器启动错误、WebSocket 标头格式化以及 SSE 会话取消。
</p>
<var name="version" value="3.1.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>3.1.1</td><td>2025 年 2 月 24 日</td><td><p>
补丁版本，改进了日志记录并修复了 WebSocket 超时处理。修复了多个错误，包括 HTTP 缓存不一致、表单数据复制错误、gzip 处理崩溃，以及导致段池损坏的并发问题。
</p>
<var name="version" value="3.1.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>3.1.0</td><td>2025 年 2 月 11 日</td><td><p>
次要版本，引入了多种 SSE 功能，并扩展了 CIO 引擎和 WebSocket 支持。该版本增强了平台兼容性、日志记录和身份验证，同时修复了与字节通道处理、HTTP 请求失败和并发问题相关的严重错误。
</p>
<var name="version" value="3.1.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>3.0.3</td><td>2024 年 12 月 18 日</td><td><p>
补丁版本，包含多项错误修复，包括修复 <code>browserProductionWebpack</code> 中的构建错误、gzip 压缩内容处理以及 <code>FormFieldLimit</code> 配置覆盖问题。此版本还包含核心性能改进和适当的测试应用程序关闭机制。
</p>
<var name="version" value="3.0.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>3.0.2</td><td>2024 年 12 月 4 日</td><td><p>
补丁版本，解决了与响应损坏、截断主体、连接处理和错误标头相关的多个错误修复，并扩展了二进制编码支持以及针对 Android 的性能增强。
</p>
<var name="version" value="3.0.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>2.3.13</td><td>2024 年 11 月 20 日</td><td><p>
补丁版本，包含错误修复、安全补丁和改进，包括新增对 <code>watchosDeviceArm64</code> 目标平台的支持。  
</p>
<var name="version" value="2.3.13"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>3.0.1</td><td>2024 年 10 月 29 日</td><td><p>
补丁版本，包含客户端与服务器日志记录的改进，以及多项错误修复。  
</p>
<var name="version" value="3.0.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>3.0.0</td><td>2024 年 10 月 9 日</td><td><p>
主要版本，包含多项改进和错误修复，包括新增对 Android Native 目标平台的支持。
有关重大变更的更多信息，请参阅<Links href="migrating-3.md" summary="">迁移指南</Links>。
</p>
<var name="version" value="3.0.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>3.0.0-rc-2</td><td>2024 年 10 月 2 日</td><td><p>
主要版本的候选发布版，包含多项带破坏性变更的改进、错误修复及功能，例如针对 XML 的多平台支持。
</p>
<var name="version" value="3.0.0-rc-2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>3.0.0-rc-1</td><td>2024 年 9 月 9 日</td><td><p>
主要版本的候选发布版，包含显著改进和错误修复。该更新增强了向后兼容性，并提供了扩展的 <code>staticZip</code> 支持。
</p>
<var name="version" value="3.0.0-rc-1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>3.0.0-beta-2</td><td>2024 年 7 月 15 日</td><td><p>
主要版本的预发布版，包含多项改进和错误修复，包括 SSE 支持改进以及适用于 Kotlin/Wasm 的 Ktor 客户端。
</p>
<var name="version" value="3.0.0-beta-2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>2.3.12</td><td>2024 年 6 月 20 日</td><td><p>
补丁版本，包含 Ktor Core 和 Ktor Server 中的错误修复，以及 Netty 和 OpenAPI 的版本更新。
</p>
<var name="version" value="2.3.12"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>2.3.11</td><td>2024 年 5 月 9 日</td><td><p>
补丁版本，包含为测试客户端引擎应用套接字超时（socket timeout）的错误修复。
</p>
<var name="version" value="2.3.11"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>2.3.10</td><td>2024 年 4 月 8 日</td><td><p>
补丁版本，包含针对 CallLogging 和 SSE 服务端插件的各种错误修复，改进了 Android 客户端日志记录等。
</p>
<var name="version" value="2.3.10"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>2.3.9</td><td>2024 年 3 月 4 日</td><td><p>
补丁版本，包含 ContentNegotiation 客户端插件的错误修复，并添加了通过 HTTP 发送安全 Cookie 的支持。
</p>
<var name="version" value="2.3.9"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>2.3.8</td><td>2024 年 1 月 31 日</td><td><p>
补丁版本，包含 URLBuilder、CORS 和 WebSocket 插件的各种错误修复。
</p>
<var name="version" value="2.3.8"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>2.3.7</td><td>2023 年 12 月 7 日</td><td>
<p>
补丁版本，包括 ContentNegotiation、WebSocket 的错误修复，以及 Native Server 中的内存使用优化。
</p>
<var name="version" value="2.3.7"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>3.0.0-beta-1</td><td>2023 年 11 月 23 日</td><td>
<p>
主要版本的预发布版，包含多项改进和错误修复，包括客户端和服务端 SSE 支持。
</p>
<var name="version" value="3.0.0-beta-1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>2.3.6</td><td>2023 年 11 月 7 日</td><td>
<p>
补丁版本，包含对 2.3.5 中破坏性变更的修复以及其他各种错误修复。
</p>
<var name="version" value="2.3.6"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>2.3.5</td><td>2023 年 10 月 5 日</td><td>
<p>
补丁版本，包含 Darwin 和 Apache5 引擎配置中的修复。
</p>
<var name="version" value="2.3.5"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>2.3.4</td><td>2023 年 8 月 31 日</td><td>
<p>
补丁版本，包含 HTTP Cookie 标头中的错误修复以及 NoTransformationFoundException 错误修复。
</p>
<var name="version" value="2.3.4"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>2.3.3</td><td>2023 年 8 月 1 日</td><td>
<p>
补丁版本，包含对 <code>linuxArm64</code> 的客户端和服务端支持以及各种错误修复。
</p>
<var name="version" value="2.3.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>2.3.2</td><td>2023 年 6 月 28 日</td><td>
<p>
补丁版本，将 Kotlin 版本升级至 <code>1.8.22</code> 并包含多项错误修复。
</p>
<var name="version" value="2.3.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>2.3.1</td><td>2023 年 5 月 31 日</td><td>
<p>
补丁版本，包括服务器配置的改进以及各种错误修复。
</p>
<var name="version" value="2.3.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>2.3.0</td><td>2023 年 4 月 19 日</td><td>
<p>
功能版本，添加了对多配置文件、路由中正则表达式模式等的支持。
</p>
<var name="version" value="2.3.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>2.2.4</td><td>2023 年 2 月 28 日</td><td>
<p>
补丁版本，包含 HTTP 客户端、路由和 ContentNegotiation 中的各种错误修复。
</p>
<var name="version" value="2.2.4"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>2.2.3</td><td>2023 年 1 月 31 日</td><td>
<p>
补丁版本，包括 OAuth2 的多平台功能以及各种错误修复。
</p>
<var name="version" value="2.2.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>2.2.2</td><td>2023 年 1 月 3 日</td><td>
<p>
补丁版本，包含针对 <code>2.2.1</code> 的错误修复、Swagger 插件的改进与修复等。
</p>
<var name="version" value="2.2.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>2.2.1</td><td>2022 年 12 月 7 日</td><td>
<p>
针对 <code>2.2.0</code> 中 <code>java.lang.NoClassDefFoundError: kotlinx/atomicfu/AtomicFU</code> 错误的补丁版本。
</p>
<var name="version" value="2.2.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>2.2.0</td><td>2022 年 12 月 7 日</td><td>
<p>
多项功能发布版本，包括 Swagger UI 托管、新插件 API、会话的多平台支持等。
欲了解更多信息，请参阅<Links href="migration-to-22x.md" summary="">从 2.0.x 迁移到 2.2.x</Links>指南。
</p>
<var name="version" value="2.2.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>2.1.3</td><td>2022 年 10 月 26 日</td><td>
<p>
包含多项错误修复的补丁版本。
</p>
<var name="version" value="2.1.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>2.1.2</td><td>2022 年 9 月 29 日</td><td>
<p>
补丁版本，包含路由、测试引擎和 Ktor 客户端中的错误修复。
</p>
<var name="version" value="2.1.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>2.1.1</td><td>2022 年 9 月 6 日</td><td>
<p>
补丁版本，包含 Ktor 客户端和服务端的各种错误修复。
</p>
<var name="version" value="2.1.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>2.1.0</td><td>2022 年 8 月 11 日</td><td>
<p>
次要版本，添加了对 YAML 配置的支持以及其他各种改进和错误修复。
</p>
<var name="version" value="2.1.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>2.0.3</td><td>2022 年 6 月 28 日</td><td>
<p>
补丁版本，包含错误修复并将 <code>kotlinx.coroutines</code> 版本升级至 <code>1.6.2</code>。
</p>
<var name="version" value="2.0.3"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>2.0.2</td><td>2022 年 5 月 27 日</td><td>
<p>
补丁版本，包含各种改进、错误修复及依赖项版本升级。
</p>
<var name="version" value="2.0.2"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>2.0.1</td><td>2022 年 4 月 28 日</td><td>
<p>
补丁版本，包含各种错误修复，并将 Kotlin 版本更新至 <code>1.6.21</code>。
</p>
<var name="version" value="2.0.1"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>2.0.0</td><td>2022 年 4 月 11 日</td><td>
<p>
主要版本，更新了 API 文档并包含多项新功能。有关破坏性变更以及如何从 <code>1.x.x</code> 迁移的更多信息，请参阅<Links href="migration-to-20x.md" summary="">迁移指南</Links>。
</p>
<var name="version" value="2.0.0"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

<tr>
<td>1.6.8</td><td>2022 年 3 月 15 日</td><td>
<p>
包含依赖项版本升级的补丁版本。
</p>
<var name="version" value="1.6.8"/>
<p>
    <a href="https://github.com/ktorio/ktor/releases/tag/%version%">在 GitHub 上查看更新日志</a>
</p>
</td>
</tr>

</table>