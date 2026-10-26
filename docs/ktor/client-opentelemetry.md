[//]: # (title: 在 Ktor Client 中使用 OpenTelemetry 进行分布式跟踪)

<show-structure for="chapter" depth="2"/>
<primary-label ref="client-plugin"/>
<var name="plugin_name" value="KtorClientTelemetry"/>

<tldr>
<p>
<b>必需的依赖项</b>: <code>io.opentelemetry.instrumentation:opentelemetry-ktor-3.0</code>
</p>
<var name="example_name" value="opentelemetry"/>
<p>
    <b>代码示例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

Ktor 与 [OpenTelemetry](https://opentelemetry.io/) 进行了集成——这是一个用于收集跟踪、指标和日志等遥测数据的开源可观测性框架。它提供了一种标准化的方式来对应用程序进行插桩，并将数据导出到 Grafana 或 Jaeger 等监控和可观测性工具中。

`%plugin_name%` 插件允许你自动跟踪出站 HTTP 请求。它会捕获诸如方法、URL 和状态码等元数据，并在各个服务之间传播跟踪上下文。你还可以自定义 span 特性或使用自己的 OpenTelemetry 配置。

> 在服务器端，OpenTelemetry 提供了 [KtorServerTelemetry](server-opentelemetry.md) 插件，用于对传入服务器的 HTTP 请求进行插桩。

## 添加依赖项 {id="add_dependencies"}

<p>
    要使用 <code>%plugin_name%</code>，请在构建脚本中添加 <code>%artifact_name%</code> 工件：
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

配置 OpenTelemetry 的常用方法是使用 [`AutoConfiguredOpenTelemetrySdk`](https://javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-extension-autoconfigure/latest/io/opentelemetry/sdk/autoconfigure/AutoConfiguredOpenTelemetrySdk.html)。它通过根据系统属性和环境变量自动配置导出器与资源来简化设置。

你仍然可以自定义自动检测到的配置——例如，添加 `service.name` 资源特性：

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

如果要在代码中定义导出器、处理器和传播器，而不是依赖基于环境的配置，可以使用 [`OpenTelemetrySdk`](https://javadoc.io/doc/io.opentelemetry/opentelemetry-sdk/latest/io/opentelemetry/sdk/OpenTelemetrySdk.html)。

以下示例演示了如何通过编程方式使用 OTLP 导出器、span 处理器以及跟踪上下文传播器来配置 OpenTelemetry：

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

如果你需要对遥测设置进行完全控制，或者部署环境无法依赖自动配置，请使用此方法。

> 要了解更多信息，请参阅 [OpenTelemetry SDK 组件文档](https://opentelemetry.io/docs/languages/java/sdk/#sdk-components)。
>
{style="tip"}

## 安装 %plugin_name% {id="install_plugin"}

要安装 `%plugin_name%` 插件，请将其传递给[客户端配置块](client-create-and-configure.md#configure-client)中的 `install` 函数，并设置[已配置的 `OpenTelemetry` 实例](#configure-otel)：

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

你可以自定义 Ktor 客户端如何为出站 HTTP 调用记录并导出 OpenTelemetry span。通过以下选项，你可以调整跟踪哪些请求、span 如何命名、包含哪些特性、捕获哪些标头以及如何确定 span 种类。

> 要详细了解这些概念，请参阅 [OpenTelemetry 跟踪文档](https://opentelemetry.io/docs/concepts/signals/traces/)。

### 跟踪其他 HTTP 方法 {id="config-known-methods"}

默认情况下，该插件会跟踪标准 HTTP 方法（`GET`、`POST`、`PUT` 等）。若要跟踪其他或自定义方法，请配置 `knownMethods` 属性：

```kotlin
install(%plugin_name%) {
    // ...
    knownMethods(HttpMethod.DefaultMethods + CUSTOM_METHOD)
}
```
### 捕获标头 {id="config-request-headers"}

若要将特定的 HTTP 请求标头包含为 span 特性，请使用 `capturedRequestHeaders` 属性：

```kotlin
install(%plugin_name%) {
    // ...
    capturedRequestHeaders(HttpHeaders.UserAgent)
}
```

### 捕获响应标头 {id="capture-response-headers"}

若要将特定的 HTTP 响应标头捕获为 span 特性，请使用 `capturedResponseHeaders` 属性：

```kotlin
install(%plugin_name%) {
    // ...
    capturedResponseHeaders(HttpHeaders.ContentType, CUSTOM_HEADER)
}
```

### 添加自定义特性 {id="config-custom-attributes"}

若要在 span 的开始或结束时附加自定义特性，请使用 `attributesExtractor` 属性：

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

安装并配置 `%plugin_name%` 后，你可以通过向同样启用了遥测的服务（例如使用 [`KtorServerTelemetry`](server-opentelemetry.md) 的服务）发送请求，来验证是否正在创建和传播 span。在诸如 [Jaeger](https://www.jaegertracing.io/)、[Zipkin](https://zipkin.io/) 或 [Grafana Tempo](https://grafana.com/oss/tempo/) 等可观测性后端中查看跟踪的两端，即可确认分布式跟踪是否在端到端正常工作。