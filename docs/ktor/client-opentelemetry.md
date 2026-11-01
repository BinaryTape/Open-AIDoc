[//]: # (title: 在 Ktor Client 中通过 OpenTelemetry 进行分布式跟踪)

<show-structure for="chapter" depth="2"/>
<primary-label ref="client-plugin"/>
<var name="plugin_name" value="KtorClientTelemetry"/>

<tldr>
<p>
<b>所需依赖项</b>：<code>io.opentelemetry.instrumentation:opentelemetry-ktor-3.0</code>
</p>
<var name="example_name" value="opentelemetry"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

Ktor 与 [OpenTelemetry](https://opentelemetry.io/) 相集成，后者是一个开源的可观测性框架，用于收集跟踪（traces）、指标（metrics）和日志等遥测数据。它提供了一种用于检测应用程序并将数据导出到 Grafana 或 Jaeger 等监控与可观测性工具的标准方式。

`%plugin_name%` 插件允许你自动跟踪外发 HTTP 请求。它会捕获诸如方法、URL 和状态码等元数据，并在各服务之间传播跟踪上下文。你还可以自定义 span 特性，或者使用你自己的 OpenTelemetry 配置。

> 在服务端，OpenTelemetry 提供了 [KtorServerTelemetry](server-opentelemetry.md) 插件，用于检测发送到服务器的传入 HTTP 请求。

## 添加依赖项 {id="add_dependencies"}

<p>
    要使用 <code>%plugin_name%</code>，请将 <code>%artifact_name%</code> 构件添加到你的构建脚本中：
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

在 Ktor 应用程序中安装 `%plugin_name%` 插件之前，你需要配置并初始化一个 `OpenTelemetry` 实例。该实例负责管理包括跟踪和指标在内的遥测数据。

### 自动配置 {id="automatic-configuration"}

配置 OpenTelemetry 的一种常用方法是使用 [`AutoConfiguredOpenTelemetrySdk`](https://javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-extension-autoconfigure/latest/io/opentelemetry/sdk/autoconfigure/AutoConfiguredOpenTelemetrySdk.html)。这可以通过根据系统属性和环境变量自动配置导出器和资源来简化设置。

你仍然可以自定义自动检测到的配置——例如，通过添加 `service.name` 资源特性：

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

### 编程式配置 {id="programmatic-configuration"}

要在代码中定义导出器、处理器和传播器，而不是依赖基于环境的配置，可以使用 [`OpenTelemetrySdk`](https://javadoc.io/doc/io.opentelemetry/opentelemetry-sdk/latest/io/opentelemetry/sdk/OpenTelemetrySdk.html)。

以下示例展示了如何以编程方式通过 OTLP 导出器、span 处理器和跟踪上下文传播器来配置 OpenTelemetry：

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

如果你需要完全控制遥测设置，或者你的部署环境无法依赖自动配置，请使用此方法。

> 有关更多信息，请参阅 [OpenTelemetry SDK 组件文档](https://opentelemetry.io/docs/languages/java/sdk/#sdk-components)。
>
{style="tip"}

## 安装 %plugin_name% {id="install_plugin"}

要安装 `%plugin_name%` 插件，请将其传递给[客户端配置块](client-create-and-configure.md#configure-client)内的 `install` 函数，并设置[已配置的 `OpenTelemetry` 实例](#configure-otel)：

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

## 配置跟踪 {id="configure-tracing"}

你可以自定义 Ktor 客户端如何针对外发 HTTP 调用记录和导出 OpenTelemetry span。以下选项允许你调整跟踪哪些请求、span 如何命名、它们包含哪些特性、捕获哪些标头以及如何确定 span 类型。

> 有关这些概念的更多信息，请参阅 [OpenTelemetry 跟踪文档](https://opentelemetry.io/docs/concepts/signals/traces/)。

### 跟踪其他 HTTP 方法 {id="config-known-methods"}

默认情况下，该插件会跟踪标准 HTTP 方法（`GET`、`POST`、`PUT` 等）。要跟踪其他或自定义方法，请配置 `knownMethods` 属性：

```kotlin
install(%plugin_name%) {
    // ...
    knownMethods(HttpMethod.DefaultMethods + CUSTOM_METHOD)
}
```
### 捕获标头 {id="config-request-headers"}

要将特定的 HTTP 请求标头作为 span 特性包含在内，请使用 `capturedRequestHeaders` 属性：

```kotlin
install(%plugin_name%) {
    // ...
    capturedRequestHeaders(HttpHeaders.UserAgent)
}
```

### 捕获响应标头 {id="capture-response-headers"}

要将特定的 HTTP 响应标头捕获为 span 特性，请使用 `capturedResponseHeaders` 属性：

```kotlin
install(%plugin_name%) {
    // ...
    capturedResponseHeaders(HttpHeaders.ContentType, CUSTOM_HEADER)
}
```

### 添加自定义特性 {id="config-custom-attributes"}

要在 span 的开始或结束处附加自定义特性，请使用 `attributesExtractor` 属性：

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

## 后续步骤 {id="next-steps"}

在安装并配置好 %plugin_name% 之后，你可以通过向同样启用了遥测的服务（例如使用 [`KtorServerTelemetry`](server-opentelemetry.md) 的服务）发送请求，来验证 span 是否已被创建并传播。在 [Jaeger](https://www.jaegertracing.io/)、[Zipkin](https://zipkin.io/) 或 [Grafana Tempo](https://grafana.com/oss/tempo/) 等可观测性后端中查看跟踪的两端，即可确认分布式跟踪是否端到端正常工作。