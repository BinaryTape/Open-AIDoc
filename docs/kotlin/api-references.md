[//]: # (title: API 参考)

<web-summary>探索 Kotlin 官方库和工具的 API 文档，包括标准库、协程、序列化等。</web-summary>

欢迎来到 Kotlin API 参考页面。在这里，您可以找到官方 Kotlin 库和工具的 API 文档链接。

> 如果您正在寻找 Kotlin 多平台库，请在 [**klibs.io**](https://klibs.io) 上浏览。
>
{style="tip"}

<p></p> <!-- workaround for MRK057: Paragraph can only contain inline elements -->
<panels columns="2">
    <panel>
        <title>标准库 (stdlib)</title>
        <p>Kotlin 标准库提供了 Kotlin 编程的核心功能，包括集合、文本和字符串处理、区间、序列等基本 API。它扩展了平台特定的 API，并提供了一个以 Kotlin 为主的 API 来与之交互。</p>
        <img src="github.svg" width="18" alt="GitHub"/> <a href="https://github.com/JetBrains/kotlin">在 GitHub 上查看</a><br/><br/>
        <a href="https://kotlinlang.org/api/core/kotlin-stdlib/" as="button" icon="arrow-right" icon-position="right">浏览 API</a>
    </panel>
    <panel>
        <title>测试库 (kotlin.test)</title>
        <p>一个多平台测试库，提供了通用的测试注解和工具函数。它支持与每个平台上的流行测试框架集成，并在 Kotlin 生态系统中提供统一的测试体验。</p>
        <img src="github.svg" width="18" alt="GitHub"/> <a href="https://github.com/JetBrains/kotlin">在 GitHub 上查看</a><br/><br/>
        <a href="https://kotlinlang.org/api/core/kotlin-test/" as="button" icon="arrow-right" icon-position="right">浏览 API</a>
    </panel>
    <panel>
        <title>协程 (kotlinx.coroutines)</title>
        <p>一个使用 Kotlin 协程进行异步编程的强大库。它提供了支持结构化并发、异步流、互斥锁和信号量等同步原语、测试等功能的工具。</p>
        <img src="github.svg" width="18" alt="GitHub"/> <a href="https://github.com/Kotlin/kotlinx.coroutines">在 GitHub 上查看</a><br/><br/>
        <a href="https://kotlinlang.org/api/kotlinx.coroutines/" as="button" icon="arrow-right" icon-position="right">浏览 API</a>
    </panel>
    <panel>
        <title>序列化 (kotlinx.serialization)</title>
        <p>一个多平台序列化库。它提供了一种类型安全、编译时的机制，用于在 Kotlin 对象与 JSON、CBOR 和 Protocol Buffers 等各种格式之间进行互相转换。</p>
        <img src="github.svg" width="18" alt="GitHub"/> <a href="https://github.com/Kotlin/kotlinx.serialization">在 GitHub 上查看</a><br/><br/>
        <a href="https://kotlinlang.org/api/kotlinx.serialization/" as="button" icon="arrow-right" icon-position="right">浏览 API</a>
    </panel>
    <panel>
        <title>Kotlin I/O 库 (kotlinx-io)</title>
        <p>一个用于底层 I/O 操作的多平台库。它定义了用于读写二进制流和缓冲区的抽象，旨在高效且可移植到所有 Kotlin 平台。</p>
        <img src="github.svg" width="18" alt="GitHub"/> <a href="https://github.com/Kotlin/kotlinx-io">在 GitHub 上查看</a><br/><br/>
        <a href="https://kotlinlang.org/api/kotlinx-io/" as="button" icon="arrow-right" icon-position="right">浏览 API</a>
    </panel>
    <panel>
        <title>日期和时间 (kotlinx-datetime)</title>
        <p>一个用于基于日历进行计算的多平台库。它提供了日期值的表示方式，并支持特定时区的操作。</p>
        <img src="github.svg" width="18" alt="GitHub"/> <a href="https://github.com/Kotlin/kotlinx-datetime">在 GitHub 上查看</a><br/><br/>
        <a href="https://kotlinlang.org/api/kotlinx-datetime/" as="button" icon="arrow-right" icon-position="right">浏览 API</a>
    </panel>
    <panel>
        <title>不可变集合 (kotlinx.collections.immutable)</title>
        <p>一个提供不可变和持久化集合接口及实现的多平台库。它提供了高效的写时复制操作，可在不同版本之间共享结构，因此更新集合时不会复制整个集合。</p>
        <img src="github.svg" width="18" alt="GitHub"/> <a href="https://github.com/Kotlin/kotlinx.collections.immutable">在 GitHub 上查看</a><br/><br/>
        <a href="https://kotlinlang.org/api/kotlinx.collections.immutable/" as="button" icon="arrow-right" icon-position="right">浏览 API</a>
    </panel>
    <panel>
        <title>Kotlin Gradle 插件 (kotlin-gradle-plugin)</title>
        <p>用于编译、测试和打包 Kotlin 代码的 Kotlin Gradle 插件。这些插件简化了 JVM 和多平台构建，管理依赖项，并与 IDE 和 CI 系统集成。</p>
        <img src="github.svg" width="18" alt="GitHub"/> <a href="https://github.com/JetBrains/kotlin/tree/master/libraries/tools/kotlin-gradle-plugin">在 GitHub 上查看</a><br/><br/>
        <a href="https://kotlinlang.org/api/kotlin-gradle-plugin/" as="button" icon="arrow-right" icon-position="right">浏览 API</a>
    </panel>
    <panel>
        <title>Ktor</title>
        <p>一个用于在连接系统中使用 Kotlin 构建异步客户端和服务器的框架。Ktor 专为可扩展性和灵活性而设计，并与协程深度集成，以实现非阻塞 I/O 和结构化并发。</p>
        <img src="github.svg" width="18" alt="GitHub"/> <a href="https://github.com/ktorio/ktor">在 GitHub 上查看</a><br/><br/>
        <a href="https://api.ktor.io/" as="button" icon="arrow-right" icon-position="right">浏览 API</a>
    </panel>
    <panel>
        <title>JVM 元数据 (kotlin-metadata-jvm)</title>
        <p>一个用于读写存储在 JVM 类文件中的 Kotlin 元数据的库。它主要供注解处理器、静态分析器和编译器插件等工具使用。</p>
        <img src="github.svg" width="18" alt="GitHub"/> <a href="https://github.com/JetBrains/kotlin/tree/master/libraries/kotlinx-metadata">在 GitHub 上查看</a><br/><br/>
        <a href="https://kotlinlang.org/api/kotlinx-metadata-jvm/" as="button" icon="arrow-right" icon-position="right">浏览 API</a>
    </panel>
    <panel>
        <title>Compose Multiplatform Material3</title>
        <p>一个用于使用 Material Design 3 组件构建用户界面的多平台库。该 API 参考包含 Material 3 组件库，您可以在其中预览可组合项。</p>
        <img src="github.svg" width="18" alt="GitHub"/> <a href="https://github.com/JetBrains/compose-multiplatform-core/tree/jb-main/compose/material3">在 GitHub 上查看</a><br/><br/>
        <a href="https://kotlinlang.org/api/compose-multiplatform/material3/" as="button" icon="arrow-right" icon-position="right">浏览 API</a>
    </panel>
</panels>