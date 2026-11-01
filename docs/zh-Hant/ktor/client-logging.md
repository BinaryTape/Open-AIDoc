[//]: # (title: Ktor Client 中的日誌記錄)

<show-structure for="chapter" depth="2"/>
<primary-label ref="client-plugin"/>

<tldr>
<p>
<b>必要相依性</b>：<code>io.ktor:ktor-client-logging</code>
</p>
<var name="example_name" value="client-logging"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

日誌記錄是一種透過記錄重要事件、錯誤或資訊性訊息，來追蹤程式正在執行的操作並診斷問題的方法。

Ktor 提供了使用 [Logging](https://api.ktor.io/ktor-client-logging/io.ktor.client.plugins.logging/-logging) 外掛程式記錄 HTTP 呼叫的功能。
此外掛程式針對不同平台提供了不同的記錄器 (logger) 類型。

> 在伺服器端，Ktor 提供了用於應用程式日誌記錄的 [Logging](server-logging.md) 外掛程式，以及用於記錄用戶端請求的 [CallLogging](server-call-logging.md) 外掛程式。

## JVM {id="jvm"}

<snippet id="jvm-logging">
  <p>
    在 <a href="client-engines.md#jvm">JVM</a> 上，Ktor 使用 Simple Logging Facade for Java
    (<a href="http://www.slf4j.org/">SLF4J</a>) 作為日誌記錄的抽象層。SLF4J 將日誌 API 與底層的日誌實作分離，
    讓你可以整合最符合應用程式需求的日誌架構。
    常見的選擇包括 <a href="https://logback.qos.ch/">Logback</a> 或 
    <a href="https://logging.apache.org/log4j">Log4j</a>。如果未提供任何架構，SLF4J 將預設使用無操作 (NOP) 實作，這基本上會停用日誌記錄。
  </p>

  <p>
    若要啟用日誌記錄，請引入包含所需 SLF4J 實作的構件，例如 <a href="https://logback.qos.ch/">Logback</a>：
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
    在 Android 上，我們建議使用 SLF4J Android 程式庫：
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

針對 [Native 目標](client-engines.md#native)，`Logging` 外掛程式提供了一個會將所有內容輸出至標準輸出串流 (`STDOUT`) 的記錄器。

## 多平台 (Multiplatform) {id="multiplatform"}

在[多平台專案](client-create-multiplatform-application.md)中，你可以指定[自訂記錄器](#custom_logger)，例如 [Napier](https://github.com/AAkira/Napier)。

## 新增相依性 {id="add_dependencies"}

若要新增 `Logging` 外掛程式，請在建置指令碼中引入以下構件：

  <var name="artifact_name" value="ktor-client-logging"/>
  <var name="ktor_version_catalog_name" value="ktorLibs.client.logging"/>
  <Tabs group="languages">
      <TabItem title="Gradle (Kotlin)" group-key="kotlin">
          <code-block lang="Kotlin" code="              implementation(%ktor_version_catalog_name%)"/>
          <note>
              上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
              Ktor version catalog</a> 來指定 Ktor 相依性。
          </note>
      </TabItem>
      <TabItem title="Gradle (Groovy)" group-key="groovy">
          <code-block lang="Groovy" code="              implementation %ktor_version_catalog_name%"/>
          <note>
              上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
              Ktor version catalog</a> 來指定 Ktor 相依性。
          </note>
      </TabItem>
      <TabItem title="Maven" group-key="maven">
          <code-block lang="XML" code="              &lt;dependency&gt;&#10;                  &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                  &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                  &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;              &lt;/dependency&gt;"/>
      </TabItem>
  </Tabs>
  <tip>
      若要了解更多關於 Ktor 用戶端所需的構件，請參閱<Links href="client-dependencies.md" summary="了解如何向現有專案新增用戶端相依性。">新增用戶端相依性</Links>。
  </tip>

## 安裝 Logging {id="install_plugin"}

若要安裝 `Logging`，請在[用戶端設定區塊](client-create-and-configure.md#configure-client)內將其傳遞給 `install` 函式：

```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.logging.*
//...
val client = HttpClient(CIO) {
    install(Logging)
}
```

## 設定 Logging {id="configure_plugin"}

`Logging` 外掛程式的設定由 [Logging.Config](https://api.ktor.io/ktor-client-logging/io.ktor.client.plugins.logging/-logging-config) 類別提供。以下範例展示了一個組態範例：

`logger`
: 指定 Logger 執行個體。`Logger.DEFAULT` 使用 SLF4J 日誌架構。針對 Native 目標，請將此屬性設定為 `Logger.SIMPLE`。

`level`
: 指定記錄等級。`LogLevel.HEADERS` 將僅記錄請求／回應標頭。

`filter()`
: 允許你篩選符合指定述詞之請求的日誌訊息。在以下範例中，只有傳送至 `ktor.io` 的請求才會被記錄。

`sanitizeHeader()`
: 允許你清理敏感標頭，避免其值出現在日誌中。在以下範例中，`Authorization` 標頭的值在記錄時將被替換為「***」。

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

### 提供自訂記錄器 {id="custom_logger"}

若要在用戶端應用程式中使用自訂記錄器，你需要建立一個 `Logger` 執行個體並覆寫 `log` 函式。
以下範例展示了如何使用 [Napier](https://github.com/AAkira/Napier) 程式庫來記錄 HTTP 呼叫：

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