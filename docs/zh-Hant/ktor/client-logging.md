[//]: # (title: Ktor Client 中的日誌記錄)

<show-structure for="chapter" depth="2"/>
<primary-label ref="client-plugin"/>

<tldr>
<p>
<b>必要的相依性</b>：<code>io.ktor:ktor-client-logging</code>
</p>
<var name="example_name" value="client-logging"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

日誌記錄是一種追蹤程式執行情況，並透過記錄重要事件、錯誤或資訊訊息來診斷問題的方式。

Ktor 提供了使用 [Logging](https://api.ktor.io/ktor-client-logging/io.ktor.client.plugins.logging/-logging) 外掛程式記錄 HTTP 呼叫的功能。
此外掛程式為不同平台提供不同的日誌記錄器類型。

> 在伺服器端，Ktor 為應用程式日誌記錄提供 [Logging](server-logging.md) 外掛程式，並為記錄用戶端請求提供 [CallLogging](server-call-logging.md) 外掛程式。

## JVM

<snippet id="jvm-logging">
  <p>
    在 <a href="#jvm">JVM</a> 上，Ktor 使用 Simple Logging Facade for Java
    (<a href="http://www.slf4j.org/">SLF4J</a>) 作為日誌記錄的抽象層。SLF4J 將日誌記錄 API 與底層日誌記錄實作解耦，
    讓您可以整合最符合應用程式需求的日誌記錄架構。
    常見的選擇包括 <a href="https://logback.qos.ch/">Logback</a> 或 
    <a href="https://logging.apache.org/log4j">Log4j</a>。若未提供架構，SLF4J 將預設使用無操作 (NOP) 實作，
    這實際上會停用日誌記錄。
  </p>

  <p>
    若要啟用日誌記錄，請包含具有所需 SLF4J 實作的構件，例如 <a href="https://logback.qos.ch/">Logback</a>：
  </p>
  <var name="group_id" value="ch.qos.logback"/>
  <var name="artifact_name" value="logback-classic"/>
  <var name="version" value="logback_version"/>
  <Tabs group="languages">
      <TabItem title="Gradle (Kotlin)" group-key="kotlin">
          <code-block lang="Kotlin" code="              implementation(&quot;%group_id%:%artifact_name%:$%version%&quot;)"></code-block>
      </TabItem>
      <TabItem title="Gradle (Groovy)" group-key="groovy">
          <code-block lang="Groovy" code="              implementation &quot;%group_id%:%artifact_name%:$%version%&quot;"></code-block>
      </TabItem>
      <TabItem title="Maven" group-key="maven">
          <code-block lang="XML" code="              &lt;dependency&gt;&#10;                  &lt;groupId&gt;%group_id%&lt;/groupId&gt;&#10;                  &lt;artifactId&gt;%artifact_name%&lt;/artifactId&gt;&#10;                  &lt;version&gt;${%version%}&lt;/version&gt;&#10;              &lt;/dependency&gt;"></code-block>
      </TabItem>
  </Tabs>
</snippet>

### Android

<p>
    在 Android 上，我們建議使用 SLF4J Android 程式庫：
</p>
 <var name="group_id" value="org.slf4j"/>
  <var name="artifact_name" value="slf4j-android"/>
  <var name="version" value="slf4j_version"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;%group_id%:%artifact_name%:$%version%&quot;)"></code-block>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;%group_id%:%artifact_name%:$%version%&quot;"></code-block>
    </TabItem>
</Tabs>

## Native

對於 [Native 目標](client-engines.md#native)，`Logging` 外掛程式提供了一個將所有內容列印到標準輸出串流 (`STDOUT`) 的日誌記錄器。

## 多平台

在 [多平台專案](client-create-multiplatform-application.md) 中，您可以指定 [自訂日誌記錄器](#custom_logger)，例如 [Napier](https://github.com/AAkira/Napier)。

## 新增相依性 {id="add_dependencies"}

若要新增 `Logging` 外掛程式，請將以下構件包含在您的建置指令碼中：

  <var name="artifact_name" value="ktor-client-logging"/>
  <Tabs group="languages">
      <TabItem title="Gradle (Kotlin)" group-key="kotlin">
          <code-block lang="Kotlin" code="              implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
      </TabItem>
      <TabItem title="Gradle (Groovy)" group-key="groovy">
          <code-block lang="Groovy" code="              implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
      </TabItem>
      <TabItem title="Maven" group-key="maven">
          <code-block lang="XML" code="              &lt;dependency&gt;&#10;                  &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                  &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                  &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;              &lt;/dependency&gt;"></code-block>
      </TabItem>
  </Tabs>
  <tip>
      若要進一步了解 Ktor 用戶端所需的構件，請參閱 <Links href="/ktor/client-dependencies" summary="了解如何將用戶端相依性新增至現有專案。">新增用戶端相依性</Links>。
  </tip>

## 安裝 Logging {id="install_plugin"}

若要安裝 `Logging`，請將其傳遞給 [用戶端配置區塊](client-create-and-configure.md#configure-client) 內的 `install` 函式：

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

`Logging` 外掛程式的配置是由 [Logging.Config](https://api.ktor.io/ktor-client-logging/io.ktor.client.plugins.logging/-logging-config) 類別提供的。以下範例顯示了配置範本：

`logger`
: 指定日誌記錄器執行個體。`Logger.DEFAULT` 使用 SLF4J 日誌記錄架構。對於 Native 目標，請將此屬性設定為 `Logger.SIMPLE`。

`level`
: 指定日誌記錄級別。`LogLevel.HEADERS` 將僅記錄請求/回應標頭。

`filter()`
: 允許您為符合指定述句的請求篩選日誌訊息。在下面的範例中，只有發送到 `ktor.io` 的請求會進入日誌。

`sanitizeHeader()`
: 允許您淨化敏感標頭，以避免它們的值出現在日誌中。在下面的範例中，`Authorization` 標頭值在記錄時將被替換為 '***'。

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

如需完整範例，請參閱 [client-logging](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-logging)。

### 提供自訂日誌記錄器 {id="custom_logger"}

若要在您的用戶端應用程式中使用自訂日誌記錄器，您需要建立一個 `Logger` 執行個體並覆寫 `log` 函式。
以下範例顯示如何使用 [Napier](https://github.com/AAkira/Napier) 程式庫來記錄 HTTP 呼叫：

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

如需完整範例，請參閱 [client-logging-napier](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-logging-napier)。