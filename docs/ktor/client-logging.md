[//]: # (title: Ktor Client 中的日志记录)

<show-structure for="chapter" depth="2"/>
<primary-label ref="client-plugin"/>

<tldr>
<p>
<b>所需依赖项</b>：<code>io.ktor:ktor-client-logging</code>
</p>
<var name="example_name" value="client-logging"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

日志记录是一种通过记录重要事件、错误或信息性消息来跟踪程序运行状况并诊断问题的方式。

Ktor 提供了使用 [Logging](https://api.ktor.io/ktor-client-logging/io.ktor.client.plugins.logging/-logging) 插件记录 HTTP 调用的功能。
该插件针对不同平台提供了不同的记录器类型。

> 在服务器端，Ktor 提供了用于应用程序日志记录的 [Logging](server-logging.md) 插件以及用于记录客户端请求的 [CallLogging](server-call-logging.md) 插件。

## JVM {id="jvm"}

<snippet id="jvm-logging">
  <p>
    在 <a href="client-engines.md#jvm">JVM</a> 上，Ktor 使用 Java 简易日志门面
    （<a href="http://www.slf4j.org/">SLF4J</a>）作为日志记录的抽象层。SLF4J 将日志记录 API 与底层日志实现解耦，
    允许你集成最适合应用程序需求的日志框架。
    常见的选择包括 <a href="https://logback.qos.ch/">Logback</a> 或 
    <a href="https://logging.apache.org/log4j">Log4j</a>。如果未提供框架，SLF4J 将默认采用无操作（NOP）实现，这在本质上会禁用日志记录。
  </p>

  <p>
    要启用日志记录，请包含带有相应 SLF4J 实现的工件，例如 <a href="https://logback.qos.ch/">Logback</a>：
  </p>
  <var name="group_id" value="ch.qos.logback"/>
  <var name="artifact_name" value="logback-classic"/>
  <var name="version" value="logback_version"/>
  <Tabs group="languages">
      <TabItem title="Gradle (Kotlin)" group-key="kotlin">
          <code-block lang="Kotlin" code="              implementation(&quot;%group_id%:%artifact_name%:$%version%&quot;)"/>
      </TabItem>
      <TabItem title="Gradle (Groovy)" group-key="groovy">
          <code-block lang="Groovy" code="              implementation &quot;%group_id%:%artifact_name%:$%version%&quot;"/>
      </TabItem>
      <TabItem title="Maven" group-key="maven">
          <code-block lang="XML" code="              &lt;dependency&gt;&#10;                  &lt;groupId&gt;%group_id%&lt;/groupId&gt;&#10;                  &lt;artifactId&gt;%artifact_name%&lt;/artifactId&gt;&#10;                  &lt;version&gt;${%version%}&lt;/version&gt;&#10;              &lt;/dependency&gt;"/>
      </TabItem>
  </Tabs>
</snippet>

### Android {id="android"}

<p>
    在 Android 上，我们建议使用 SLF4J Android 库：
</p>
 <var name="group_id" value="org.slf4j"/>
  <var name="artifact_name" value="slf4j-android"/>
  <var name="version" value="slf4j_version"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;%group_id%:%artifact_name%:$%version%&quot;)"/>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;%group_id%:%artifact_name%:$%version%&quot;"/>
    </TabItem>
</Tabs>

## Native {id="native"}

对于 [Native 目标](client-engines.md#native)，`Logging` 插件提供了一个将所有内容输出到标准输出流（`STDOUT`）的记录器。

## 多平台 {id="multiplatform"}

在[多平台项目](client-create-multiplatform-application.md)中，你可以指定[自定义记录器](#custom_logger)，例如 [Napier](https://github.com/AAkira/Napier)。

## 添加依赖项 {id="add_dependencies"}

要添加 `Logging` 插件，请在构建脚本中包含以下工件：

  <var name="artifact_name" value="ktor-client-logging"/>
  <var name="ktor_version_catalog_name" value="ktorLibs.client.logging"/>
  <Tabs group="languages">
      <TabItem title="Gradle (Kotlin)" group-key="kotlin">
          <code-block lang="Kotlin" code="              implementation(%ktor_version_catalog_name%)"/>
          <note>
              上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">Ktor 版本目录</a>指定 Ktor 依赖项。
          </note>
      </TabItem>
      <TabItem title="Gradle (Groovy)" group-key="groovy">
          <code-block lang="Groovy" code="              implementation %ktor_version_catalog_name%"/>
          <note>
              上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">Ktor 版本目录</a>指定 Ktor 依赖项。
          </note>
      </TabItem>
      <TabItem title="Maven" group-key="maven">
          <code-block lang="XML" code="              &lt;dependency&gt;&#10;                  &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                  &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                  &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;              &lt;/dependency&gt;"/>
      </TabItem>
  </Tabs>
  <tip>
      要了解关于 Ktor 客户端所需工件的更多信息，请参阅<Links href="client-dependencies.md" summary="了解如何向现有项目中添加客户端依赖项。">添加客户端依赖项</Links>。
  </tip>

## 安装 Logging {id="install_plugin"}

要安装 `Logging`，请在[客户端配置块](client-create-and-configure.md#configure-client)内将其传递给 `install` 函数：

```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.logging.*
//...
val client = HttpClient(CIO) {
    install(Logging)
}
```

## 配置 Logging {id="configure_plugin"}

`Logging` 插件的配置由 [Logging.Config](https://api.ktor.io/ktor-client-logging/io.ktor.client.plugins.logging/-logging-config) 类提供。以下示例展示了一个示例配置：

`logger`
: 指定一个 Logger 实例。`Logger.DEFAULT` 使用 SLF4J 日志框架。对于 Native 目标，请将此属性设置为 `Logger.SIMPLE`。

`level`
: 指定日志级别。`LogLevel.HEADERS` 将仅记录请求/响应标头。

`filter()`
: 允许你针对与指定谓词匹配的请求筛选日志消息。在以下示例中，只有针对 `ktor.io` 发起的请求才会记录到日志中。

`sanitizeHeader()`
: 允许你对敏感标头进行脱敏，避免其值出现在日志中。在以下示例中，记录日志时 `Authorization` 标头的值将被替换为“***”。

```kotlin
package com.example

import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.logging.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import kotlinx.coroutines.runBlocking

fun main() {
    runBlocking {
        val client = HttpClient(CIO) {
            install(Logging) {
                logger = Logger.DEFAULT
                level = LogLevel.HEADERS
                filter { request ->
                    request.url.host.contains("ktor.io")
                }
                sanitizeHeader { header -> header == HttpHeaders.Authorization }
            }
        }

        val response1: HttpResponse = client.get("https://ktor.io/")
        val response2: HttpResponse = client.get("https://jetbrains.com/")
    }
}
```

如需完整示例，请参阅 [client-logging](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-logging)。

### 提供自定义记录器 {id="custom_logger"}

要在客户端应用程序中使用自定义记录器，你需要创建一个 `Logger` 实例并重写 `log` 函数。
以下示例演示了如何使用 [Napier](https://github.com/AAkira/Napier) 库记录 HTTP 调用：

```kotlin
package com.example

import io.github.aakira.napier.DebugAntilog
import io.github.aakira.napier.Napier
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.logging.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import kotlinx.coroutines.runBlocking

fun main() {
    runBlocking {
        val client = HttpClient(CIO) {
            install(Logging) {
                logger = object: Logger {
                    override fun log(message: String) {
                        Napier.v("HTTP Client", null, message)
                    }
                }
                level = LogLevel.HEADERS
            }
        }.also { Napier.base(DebugAntilog()) }

        val response: HttpResponse = client.get("https://ktor.io/")
    }
}

```

如需完整示例，请参阅 [client-logging-napier](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-logging-napier)。