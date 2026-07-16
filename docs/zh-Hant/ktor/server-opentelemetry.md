[//]: # (title: 在 Ktor Server 中使用 OpenTelemetry 進行分散式追蹤)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>
<var name="plugin_name" value="KtorServerTelemetry"/>
<var name="package_name" value="io.opentelemetry.instrumentation"/>
<var name="artifact_name" value="opentelemetry-ktor-3.0"/>

<tldr>
<p>
<b>必要的相依性</b>：<code>io.opentelemetry.instrumentation:opentelemetry-ktor-3.0</code>
</p>
<var name="example_name" value="opentelemetry"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<snippet id="opentelemetry-description">

Ktor 與 [OpenTelemetry](https://opentelemetry.io/) 整合 — 這是一個開源的觀測性架構，用於收集追蹤 (trace)、指標 (metric) 和記錄 (log) 等遙測資料。它提供了一種標準化的方式來檢測應用程式，並將資料匯出到 Grafana 或 Jaeger 等監控與觀測工具。

</snippet>

`%plugin_name%` 外掛程式可以對 Ktor 伺服器應用程式中的傳入 HTTP 請求進行分散式追蹤。它會自動建立包含路徑 (route)、HTTP 方法和狀態碼資訊的 [span](https://opentelemetry.io/docs/concepts/signals/traces/#spans)，從傳入的請求標頭中提取現有的追蹤內容 (trace context)，並允許自訂 span 名稱、屬性 (attribute) 和 span 種類 (span kind)。

> 在用戶端，OpenTelemetry 提供了 [KtorClientTelemetry](client-opentelemetry.md) 外掛程式，用於收集對外部服務的傳出 HTTP 呼叫追蹤。

## 新增相依性 {id="add_dependencies"}

<p>
    若要使用 <code>%plugin_name%</code>，您需要在組建指令碼中包含 <code>%artifact_name%</code> 構件：
</p>

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;io.opentelemetry.instrumentation:opentelemetry-ktor-3.0:%opentelemetry_version%&quot;)"></code-block>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;io.opentelemetry.instrumentation:opentelemetry-ktor-3.0:%opentelemetry_version%&quot;"></code-block>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="             &lt;dependencies&gt;&#10;              &lt;dependency&gt;&#10;                &lt;groupId&gt;io.opentelemetry.instrumentation&lt;/groupId&gt;&#10;                &lt;artifactId&gt;opentelemetry-ktor-3.0&lt;/artifactId&gt;&#10;                &lt;version&gt;%opentelemetry_version%&lt;/version&gt;&#10;              &lt;/dependency&gt;&#10;            &lt;/dependencies&gt;"></code-block>
    </TabItem>
</Tabs>

## 配置 OpenTelemetry {id="configure-otel"}

在您的 Ktor 應用程式中安裝 `%plugin_name%` 外掛程式之前，您需要配置並初始化一個 `OpenTelemetry` 執行個體。此執行個體負責管理遙測資料，包括追蹤和指標。

### 自動配置

配置 OpenTelemetry 的常見方式是使用 [`AutoConfiguredOpenTelemetrySdk`](https://javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-extension-autoconfigure/latest/io/opentelemetry/sdk/autoconfigure/AutoConfiguredOpenTelemetrySdk.html)。這可以透過根據系統屬性和環境變數自動配置匯出器 (exporter) 和資源 (resource)，進而簡化設定。

您仍然可以自訂自動偵測到的配置 — 例如，透過新增 `service.name` 資源屬性：

```kotlin
package com.example

import io.opentelemetry.api.OpenTelemetry
import io.opentelemetry.sdk.autoconfigure.AutoConfiguredOpenTelemetrySdk
import io.opentelemetry.semconv.ServiceAttributes

fun getOpenTelemetry(serviceName: String): OpenTelemetry {

    return AutoConfiguredOpenTelemetrySdk.builder().addResourceCustomizer { oldResource, _ ->
        oldResource.toBuilder()
            .putAll(oldResource.attributes)
            .put(ServiceAttributes.SERVICE_NAME, serviceName)
            .build()
    }.build().openTelemetrySdk
}

```

### 程式化配置

若要在程式碼中定義匯出器、處理器 (processor) 和傳播器 (propagator)，而不是依賴基於環境的配置，您可以使用 [`OpenTelemetrySdk`](https://javadoc.io/doc/io.opentelemetry/opentelemetry-sdk/latest/io/opentelemetry/sdk/OpenTelemetrySdk.html)。

以下範例顯示如何使用 OTLP 匯出器、span 處理器和追蹤內容傳播器以程式化方式配置 OpenTelemetry：

```kotlin
import io.opentelemetry.api.OpenTelemetry
import io.opentelemetry.api.trace.propagation.W3CTraceContextPropagator
import io.opentelemetry.context.propagation.ContextPropagators
import io.opentelemetry.exporter.otlp.trace.OtlpGrpcSpanExporter
import io.opentelemetry.sdk.OpenTelemetrySdk
import io.opentelemetry.sdk.trace.SdkTracerProvider
import io.opentelemetry.sdk.trace.export.BatchSpanProcessor

fun configureOpenTelemetry(): OpenTelemetry {
    val spanExporter = OtlpGrpcSpanExporter.builder()
        .setEndpoint("http://localhost:4317")
        .build()

    val tracerProvider = SdkTracerProvider.builder()
        .addSpanProcessor(BatchSpanProcessor.builder(spanExporter).build())
        .build()

    return OpenTelemetrySdk.builder()
        .setTracerProvider(tracerProvider)
        .setPropagators(ContextPropagators.create(W3CTraceContextPropagator.getInstance()))
        .buildAndRegisterGlobal()
}
```

如果您需要完全控制遙測設定，或者您的部署環境無法依賴自動配置時，請使用此方法。

> 欲了解更多資訊，請參閱 [OpenTelemetry SDK 組件文件](https://opentelemetry.io/docs/languages/java/sdk/#sdk-components)。
>
{style="tip"}

## 安裝 %plugin_name% {id="install_plugin"}

若要將 `%plugin_name%` 外掛程式[安裝](server-plugins.md#install)到應用程式中，請將其傳遞給指定[模組](server-modules.md)中的 `install` 函式，並設定[已配置的 `OpenTelemetry` 執行個體](#configure-otel)：

<Tabs>
<TabItem title="embeddedServer">

```kotlin
    import io.ktor.server.engine.*
    import io.ktor.server.netty.*
    import io.ktor.server.application.*
    import %package_name%.*

    fun main() {
        embeddedServer(Netty, port = 8080) {
            val openTelemetry = getOpenTelemetry(serviceName = "opentelemetry-ktor-sample-server")

            install(%plugin_name%){
                setOpenTelemetry(openTelemetry)
            }
            // ...
        }.start(wait = true)
    }
```
</TabItem>
<TabItem title="module">

```kotlin

    import io.ktor.server.application.*
    import %package_name%.*
    // ...

    fun Application.module() {
        val openTelemetry = getOpenTelemetry(serviceName = "opentelemetry-ktor-sample-server")

        install(%plugin_name%){
            setOpenTelemetry(openTelemetry)
        }
        // ...
    }
```
</TabItem>
</Tabs>

> 請確保在安裝任何其他記錄或遙測相關的外掛程式之前，先安裝 `%plugin_name%`。
>
{style="note"}

## 配置追蹤 {id="configuration"}

您可以自訂 Ktor 伺服器記錄和匯出 OpenTelemetry span 的方式。下列選項允許您調整要追蹤哪些請求、span 如何命名、它們包含哪些屬性，以及如何確定 span 種類。

> 關於這些概念的更多資訊，請參閱 [OpenTelemetry 追蹤文件](https://opentelemetry.io/docs/concepts/signals/traces/)。

### 追蹤額外的 HTTP 方法 {id="config-known-methods"}

預設情況下，此外掛程式會追蹤標準 HTTP 方法 (`GET`、`POST`、`PUT` 等)。若要追蹤額外或自訂的方法，請配置 `knownMethods` 屬性：

```kotlin
install(%plugin_name%) {
    // ...
    knownMethods(HttpMethod.DefaultMethods + CUSTOM_METHOD)
}
```

### 擷取標頭 {id="config-request-headers"}

若要將特定的 HTTP 請求標頭作為 span 屬性包含在內，請使用 `capturedRequestHeaders` 屬性：

```kotlin
install(%plugin_name%) {
    // ...
    capturedRequestHeaders(HttpHeaders.UserAgent)
}
```

### 選擇 span 種類 {id="config-span-kind"}

若要根據請求特性覆寫 span 種類（例如 `SERVER`、`CLIENT`、`PRODUCER`、`CONSUMER`），請使用 `spanKindExtractor` 屬性：

```kotlin
install(%plugin_name%) {
    // ...
    spanKindExtractor {
        if (httpMethod == HttpMethod.Post) {
            SpanKind.PRODUCER
        } else {
            SpanKind.CLIENT
        }
    }
}
```

### 新增自訂屬性 {id="config-custom-attributes"}

若要在 span 的開始或結束時附加自訂屬性，請使用 `attributesExtractor` 屬性：

```kotlin
install(%plugin_name%) {
    // ...
    attributesExtractor {
        onStart {
            attributes.put("start-time", System.currentTimeMillis())
        }
        onEnd {
            attributes.put("end-time", Instant.now().toEpochMilli())
        }
    }
}
```

### 其他屬性 {id="additional-properties"}

若要微調整個應用程式的追蹤行為，您還可以配置其他的 OpenTelemetry 屬性，例如傳播器、屬性限制以及啟用/停用檢測。欲了解更多細節，請參閱 [OpenTelemetry Java 配置指南](https://opentelemetry.io/docs/languages/java/configuration/)。

## 使用 Grafana LGTM 驗證遙測資料

若要視覺化並驗證您的遙測資料，您可以將追蹤、指標和記錄匯出到分散式追蹤後端，例如 Grafana。`grafana/otel-lgtm` 一體化映像封裝了 [Grafana](https://grafana.com/)、[Tempo](https://grafana.com/oss/tempo/)（追蹤）、[Loki](https://grafana.com/oss/loki/)（記錄）和 [Mimir](https://grafana.com/oss/mimir/)（指標）。

### 使用 Docker Compose

建立一個內容如下的 **docker-compose.yml** 檔案：

```yaml
services:
  grafana-lgtm:
    image: grafana/otel-lgtm:latest
    ports:
      - "4317:4317"   # OTLP gRPC 接收器 (追蹤、指標、記錄)
      - "4318:4318"   # OTLP HTTP 接收器
      - "3000:3000"   # Grafana UI
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin
    restart: unless-stopped
```

執行以下指令來啟動 Grafana LGTM 一體化容器：

```shell
docker compose up -d
```

### 使用 Docker CLI

或者，您也可以直接使用 Docker 命令列執行 Grafana：

```shell
docker run -d --name grafana_lgtm \
    -p 4317:4317 \   # OTLP gRPC 接收器 (追蹤、指標、記錄)
    -p 4318:4318 \   # OTLP HTTP 接收器
    -p 3000:3000 \   # Grafana UI
    -e GF_SECURITY_ADMIN_USER=admin \
    -e GF_SECURITY_ADMIN_PASSWORD=admin \
    grafana/otel-lgtm:latest
```

### 應用程式匯出配置

若要將遙測資料從 Ktor 應用程式傳送到 OTLP 端點，請配置 OpenTelemetry SDK 使用 gRPC 協定。您可以在建置 SDK 之前透過環境變數設定這些值：

```shell
export OTEL_TRACES_EXPORTER=otlp
export OTEL_EXPORTER_OTLP_PROTOCOL=grpc
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
```

或使用 JVM 旗標：

```text
-Dotel.traces.exporter=otlp -Dotel.exporter.otlp.protocol=grpc -Dotel.exporter.otlp.endpoint=http://localhost:4317
```

### 存取 Grafana UI

啟動後，Grafana UI 網址為 [http://localhost:3000/](http://localhost:3000/)。

<procedure>
    <step>
        在瀏覽器開啟 Grafana UI：[http://localhost:3000/](http://localhost:3000/)。
    </step>
    <step>
        使用預設憑據登入：
        <list>
            <li><ui-path>User：</ui-path><code>admin</code></li>
            <li><ui-path>Password：</ui-path><code>admin</code></li>
        </list>
    </step>
    <step>
        在左側導覽功能表中，前往 <ui-path>Drilldown → Traces</ui-path>：
        <img src="opentelemetry-grafana-ui.png" alt="Grafana UI Drilldown 追蹤檢視" width="706" corners="rounded"/>
        在 <ui-path>Traces</ui-path> 檢視中，您可以：
        <list>
            <li>選擇 Rate (速率)、Errors (錯誤) 或 Duration (時長) 指標。</li>
            <li>套用 span 篩選器（例如透過服務名稱或 span 名稱）來縮小資料範圍。</li>
            <li>檢視追蹤、檢查詳細資訊，並與 span 時間軸互動。</li>
        </list>
    </step>
</procedure>