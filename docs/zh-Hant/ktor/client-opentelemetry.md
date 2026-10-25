[//]: # (title: 在 Ktor Client 中使用 OpenTelemetry 進行分散式追蹤)

<show-structure for="chapter" depth="2"/>
<primary-label ref="client-plugin"/>
<var name="plugin_name" value="KtorClientTelemetry"/>

<tldr>
<p>
<b>必要相依性</b>：<code>io.opentelemetry.instrumentation:opentelemetry-ktor-3.0</code>
</p>
<var name="example_name" value="opentelemetry"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

Ktor 與 [OpenTelemetry](https://opentelemetry.io/) 整合 — 這是一個開源的可觀測性架構，用於收集追蹤（traces）、指標（metrics）和記錄（logs）等遙測資料。它提供了一種標準方法來檢測應用程式，並將資料匯出到 Grafana 或 Jaeger 等監控與可觀測性工具。

`%plugin_name%` 外掛程式可讓您自動追蹤傳出的 HTTP 請求。它會擷取方法、URL 和狀態碼等元資料，並跨服務傳播追蹤上下文。您還可以自訂 span 屬性或使用自己的 OpenTelemetry 配置。

> 在伺服器端，OpenTelemetry 提供了 [KtorServerTelemetry](server-opentelemetry.md) 外掛程式，用於檢測傳入伺服器的 HTTP 請求。

## 新增相依性 {id="add_dependencies"}

<p>
    若要使用 <code>%plugin_name%</code>，請將 <code>%artifact_name%</code> 構件新增至您的建置指令碼中：
</p>

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;io.opentelemetry.instrumentation:opentelemetry-ktor-3.0:%opentelemetry_version%&quot;)"/>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;io.opentelemetry.instrumentation:opentelemetry-ktor-3.0:%opentelemetry_version%&quot;"/>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="             &lt;dependencies&gt;&#10;              &lt;dependency&gt;&#10;                &lt;groupId&gt;io.opentelemetry.instrumentation&lt;/groupId&gt;&#10;                &lt;artifactId&gt;opentelemetry-ktor-3.0&lt;/artifactId&gt;&#10;                &lt;version&gt;%opentelemetry_version%&lt;/version&gt;&#10;              &lt;/dependency&gt;&#10;            &lt;/dependencies&gt;"/>
    </TabItem>
</Tabs>
## 配置 OpenTelemetry {id="configure-otel"}

在 Ktor 應用程式中安裝 `%plugin_name%` 外掛程式之前，您需要配置並初始化一個 `OpenTelemetry` 執行個體。該執行個體負責管理遙測資料，包括追蹤和指標。

### 自動配置 {id="automatic-configuration"}

配置 OpenTelemetry 的常見方式是使用
[`AutoConfiguredOpenTelemetrySdk`](https://javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-extension-autoconfigure/latest/io/opentelemetry/sdk/autoconfigure/AutoConfiguredOpenTelemetrySdk.html)。
這會根據系統屬性和環境變數自動配置 exporter 和資源，進而簡化設定。

您仍然可以自訂自動偵測到的配置 — 例如，新增一個 `service.name` 資源屬性：

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

### 程式化配置 {id="programmatic-configuration"}

若要在程式碼中定義 exporter、processor 和 propagator，而不是依賴以環境為基礎的配置，您可以使用 [`OpenTelemetrySdk`](https://javadoc.io/doc/io.opentelemetry/opentelemetry-sdk/latest/io/opentelemetry/sdk/OpenTelemetrySdk.html)。

以下範例示範如何透過程式碼配置包含 OTLP exporter、span processor 和追蹤上下文 propagator 的 OpenTelemetry：

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

如果您需要完全掌控遙測設定，或者您的部署環境無法依賴自動配置，請使用此方法。

> 如需更多資訊，請參閱
> [OpenTelemetry SDK 元件文件](https://opentelemetry.io/docs/languages/java/sdk/#sdk-components)。
>
{style="tip"}

## 安裝 %plugin_name% {id="install_plugin"}

若要安裝 `%plugin_name%` 外掛程式，請將其傳入[用戶端配置區塊](client-create-and-configure.md#configure-client)內的 `install` 函式中，並設定[已配置的 `OpenTelemetry` 執行個體](#configure-otel)：

```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.auth.*
//...

val client = HttpClient(CIO) {
    val openTelemetry = getOpenTelemetry(serviceName = "opentelemetry-ktor-client")

    install(%plugin_name%) {
        setOpenTelemetry(openTelemetry)
    }
}
```

## 配置追蹤 {id="configure-tracing"}

您可以自訂 Ktor 用戶端如何記錄並匯出傳出 HTTP 呼叫的 OpenTelemetry span。以下選項允許您調整追蹤哪些請求、span 如何命名、包含哪些屬性、擷取哪些標頭，以及如何決定 span 的種類（kind）。

> 如需有關這些概念的更多資訊，請參閱
> [OpenTelemetry 追蹤文件](https://opentelemetry.io/docs/concepts/signals/traces/)。

### 追蹤其他 HTTP 方法 {id="config-known-methods"}

預設情況下，該外掛程式會追蹤標準 HTTP 方法（`GET`、`POST`、`PUT` 等）。若要追蹤其他或自訂方法，請配置 `knownMethods` 屬性：

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

### 擷取回應標頭 {id="capture-response-headers"}

若要將特定的 HTTP 回應標頭擷取為 span 屬性，請使用 `capturedResponseHeaders` 屬性：

```kotlin
install(%plugin_name%) {
    // ...
    capturedResponseHeaders(HttpHeaders.ContentType, CUSTOM_HEADER)
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

## 後續步驟 {id="next-steps"}

安裝並配置好 %plugin_name% 後，您可以透過向同時啟用了遙測的服務（例如使用 [`KtorServerTelemetry`](server-opentelemetry.md) 的服務）發送請求，來驗證 span 是否正在建立並傳播。在 [Jaeger](https://www.jaegertracing.io/)、[Zipkin](https://zipkin.io/) 或 [Grafana Tempo](https://grafana.com/oss/tempo/) 等可觀測性後端中檢視追蹤的兩端，即可確認分散式追蹤是否正常進行端到端運作。