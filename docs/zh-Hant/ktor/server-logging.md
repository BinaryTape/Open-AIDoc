[//]: # (title: Ktor 伺服器中的日誌記錄)

<show-structure for="chapter" depth="2"/>

<tldr>
<var name="example_name" value="logging"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
Ktor 使用 SLF4J API 作為各種日誌框架（例如 Logback 或 Log4j）的門面，並允許您記錄應用程式事件。
</link-summary>

Ktor 根據所使用的平台提供不同的方式來記錄您的應用程式：

- 在 JVM 上，Ktor 使用 [SLF4J API](http://www.slf4j.org/) 作為各種日誌框架（例如 [Logback](https://logback.qos.ch/) 或 [Log4j](https://logging.apache.org/log4j)）的門面，並允許您記錄應用程式事件。
要啟用日誌記錄，您需要為所需的框架新增 [相依性](#add_dependencies) 並提供該框架特定的 [配置](#configure-logger)。
  > 您也可以安裝並配置 [CallLogging](server-call-logging.md) 外掛程式來記錄用戶端請求。
- 對於 [原生伺服器](server-native.md)，Ktor 提供了一個將所有內容列印到標準輸出的記錄器。

## JVM {id="jvm"}
### 新增記錄器相依性 {id="add_dependencies"}
要啟用日誌記錄，您需要包含所需日誌框架的構件。
例如，Logback 需要以下相依性：

<var name="group_id" value="ch.qos.logback"/>
<var name="artifact_name" value="logback-classic"/>
<var name="version" value="logback_version"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;%group_id%:%artifact_name%:$%version%&quot;)"/>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;%group_id%:%artifact_name%:$%version%&quot;"/>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;%group_id%&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%&lt;/artifactId&gt;&#10;                &lt;version&gt;${%version%}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

要使用 Log4j，您需要新增 `org.apache.logging.log4j:log4j-core` 和 `org.apache.logging.log4j:log4j-slf4j2-impl` 構件。

### 配置記錄器 {id="configure-logger"}

要了解如何配置所選的日誌框架，請參閱其文件，例如：
- [Logback 配置](http://logback.qos.ch/manual/configuration.html)
- [Log4j 配置](https://logging.apache.org/log4j/2.x/manual/configuration.html)

例如，要配置 Logback，您需要將 `logback.xml` 檔案放在類別路徑的根目錄中（例如 `src/main/resources`）。
下方的範例顯示了一個使用 `STDOUT` appender 的 Logback 配置範例，它將日誌輸出到主控台。

```xml
<configuration>
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
    <root level="trace">
        <appender-ref ref="STDOUT"/>
    </root>
    <logger name="io.netty" level="INFO"/>
</configuration>
```

如果您想將日誌輸出到檔案，可以使用 `FILE` appender。

```xml
<configuration>
    <appender name="FILE" class="ch.qos.logback.core.FileAppender">
        <file>testFile.log</file>
        <append>true</append>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
    <root level="trace">
        <appender-ref ref="FILE"/>
    </root>
    <logger name="io.netty" level="INFO"/>
</configuration>
```

您可以在此處找到完整的範例：[logging](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/logging)。

## Native {id="native"}

要為原生伺服器配置日誌層級，請在 [執行](server-run.md) 應用程式時將以下值之一指派給 `KTOR_LOG_LEVEL` 環境變數：
- _TRACE_
- _DEBUG_
- _INFO_
- _WARN_
- _ERROR_

例如，_TRACE_ 層級會啟用 [路由追蹤](server-routing.md#trace_routes)，這有助於您確定某些路由未被執行的原因。

## 在程式碼中存取記錄器 {id="access_logger"}
Logger 執行個體由一個實作 [Logger](https://api.ktor.io/ktor-utils/io.ktor.util.logging/-logger/index.html) 介面的類別來表示。您可以使用 [Application.log](https://api.ktor.io/ktor-server-core/io.ktor.server.application/log.html) 屬性在 `Application` 內部存取 Logger 執行個體。例如，下方的程式碼片段顯示了如何在 [模組](server-modules.md) 內部將訊息新增到日誌中。

```kotlin
import io.ktor.server.application.*

fun Application.module() {
    log.info("Hello from module!")
}
```

您也可以使用 `call.application.environment.log` 屬性從 [ApplicationCall](https://api.ktor.io/ktor-server-core/io.ktor.server.application/-application-call/index.html) 存取 Logger。

```kotlin
routing {
    get("/api/v1") {
        call.application.environment.log.info("Hello from /api/v1!")
    }
}
```

## 在外掛程式與檔案中進行日誌記錄 {id="plugins_and_files"}

不建議在外掛程式和檔案中使用應用程式日誌。最好為每個外掛程式或檔案使用單獨的記錄器。為此，您可以使用任何日誌程式庫。

對於多平台專案，您可以使用 [KtorSimpleLogger](https://api.ktor.io/ktor-utils/io.ktor.util.logging/-ktor-simple-logger.html) 類別：

```kotlin
package com.example

import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.util.logging.*

internal val LOGGER = KtorSimpleLogger("com.example.RequestTracePlugin")

val RequestTracePlugin = createRouteScopedPlugin("RequestTracePlugin", { }) {
    onCall { call ->
        LOGGER.trace("Processing call: ${call.request.uri}")
    }
}