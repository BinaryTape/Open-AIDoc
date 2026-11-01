[//]: # (title: 在 Ktor Server 中使用 OpenTelemetry 进行分布式跟踪)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>
<var name="plugin_name" value="KtorServerTelemetry"/>
<var name="package_name" value="io.opentelemetry.instrumentation"/>
<var name="artifact_name" value="opentelemetry-ktor-3.0"/>

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

<snippet id="opentelemetry-description">

Ktor 与 [OpenTelemetry](https://opentelemetry.io/) 相集成 — 这是一个用于收集跟踪、指标和日志等遥测数据的开源可观测性框架。它提供了一种用于对应用程序进行插桩，并将数据导出至 Grafana 或 Jaeger 等监控与可观测性工具的标准方法。

</snippet>

`%plugin_name%` 插件可在 Ktor 服务器应用程序中对传入的 HTTP 请求启用分布式跟踪。它会自动创建包含路由、HTTP 方法和状态码信息的 [span](https://opentelemetry.io/docs/concepts/signals/traces/#spans)，从传入的请求头中提取现有跟踪上下文，并允许自定义 span 名称、属性和 span 种类。

> 在客户端，OpenTelemetry 提供了 [KtorClientTelemetry](client-opentelemetry.md) 插件，用于收集发往外部服务的传出 HTTP 调用的跟踪。

## 添加依赖项 {id="add_dependencies"}

<p>
    要使用 <code>%plugin_name%</code>，请将 <code>%artifact_name%</code> 工件添加到构建脚本中：
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

在 Ktor 应用程序中安装 `%plugin_name%` 插件之前，需要配置并初始化一个 `OpenTelemetry` 实例。该实例负责管理遥测数据，包括跟踪和指标。

### 自动配置 {id="automatic-configuration"}

配置 OpenTelemetry 的一种常见方式是使用 [`AutoConfiguredOpenTelemetrySdk`](https://javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-extension-autoconfigure/latest/io/opentelemetry/sdk/autoconfigure/AutoConfiguredOpenTelemetrySdk.html)。这可以通过根据系统属性和环境变量自动配置导出器与资源来简化设置。

您仍然可以自定义自动检测到的配置 — 例如，通过添加 `service.name` 资源属性：

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

若要在代码中定义导出器、处理器和传播器，而不是依赖基于环境的配置，可以使用 [`OpenTelemetrySdk`](https://javadoc.io/doc/io.opentelemetry/opentelemetry-sdk/latest/io/opentelemetry/sdk/OpenTelemetrySdk.html)。

以下示例演示了如何通过编程方式使用 OTLP 导出器、span 处理器和跟踪上下文传播器来配置 OpenTelemetry：

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

如果您需要对遥测设置进行完全控制，或者部署环境无法依赖自动配置，请使用此方法。

> 要了解更多信息，请参阅 [OpenTelemetry SDK 组件文档](https://opentelemetry.io/docs/languages/java/sdk/#sdk-components)。
>
{style="tip"}

## 安装 %plugin_name% {id="install_plugin"}

要将 `%plugin_name%` 插件[安装](server-plugins.md#install)到应用程序中，请将其传递给指定[模块](server-modules.md)中的 `install` 函数，并设置[已配置的 `OpenTelemetry` 实例](#configure-otel)：

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

> 请确保在安装任何其他日志记录或遥测相关插件之前安装 %plugin_name%。
>
{style="note"}

## 配置跟踪 {id="configuration"}

您可以自定义 Ktor 服务器记录和导出 OpenTelemetry span 的方式。通过以下选项，您可以调整要跟踪哪些请求、span 的命名方式、span 包含哪些属性以及如何确定 span 种类。

> 有关这些概念的更多信息，请参阅 [OpenTelemetry 跟踪文档](https://opentelemetry.io/docs/concepts/signals/traces/)。

### 跟踪其他 HTTP 方法 {id="config-known-methods"}

默认情况下，该插件会跟踪标准 HTTP 方法（`GET`、`POST`、`PUT` 等）。要跟踪其他或自定义方法，请配置 `knownMethods` 属性：

```kotlin
install(%plugin_name%) {
    // ...
    knownMethods(HttpMethod.DefaultMethods + CUSTOM_METHOD)
}
```

### 捕获请求头 {id="config-request-headers"}

要将特定的 HTTP 请求头作为 span 属性包含在内，请使用 `capturedRequestHeaders` 属性：

```kotlin
install(%plugin_name%) {
    // ...
    capturedRequestHeaders(HttpHeaders.UserAgent)
}
```

### 选择 span 种类 {id="config-span-kind"}

要根据请求特征重写 span 种类（例如 `SERVER`、`CLIENT`、`PRODUCER`、`CONSUMER`），请使用 `spanKindExtractor` 属性：

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

### 添加自定义属性 {id="config-custom-attributes"}

要在 span 开始或结束时附加自定义属性，请使用 `attributesExtractor` 属性：

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

### 其他属性 {id="additional-properties"}

要对整个应用程序的跟踪行为进行微调，您还可以配置其他 OpenTelemetry 属性，例如传播器、属性限制以及启用/禁用插桩。更多详情请参阅 [OpenTelemetry Java 配置指南](https://opentelemetry.io/docs/languages/java/configuration/)。

## 使用 Grafana LGTM 验证遥测数据 {id="verify-telemetry-data-with-grafana-lgtm"}

为了可视化和验证您的遥测数据，您可以将跟踪、指标和日志导出到分布式跟踪后端，例如 Grafana。`grafana/otel-lgtm` 多合一镜像打包了 [Grafana](https://grafana.com/)、[Tempo](https://grafana.com/oss/tempo/)（跟踪）、[Loki](https://grafana.com/oss/loki/)（日志）以及 [Mimir](https://grafana.com/oss/mimir/)（指标）。

### 使用 Docker Compose {id="using-docker-compose"}

创建包含以下内容的 **docker-compose.yml** 文件：

```yaml
services:
  grafana-lgtm:
    image: grafana/otel-lgtm:latest
    ports:
      - "4317:4317"   # OTLP gRPC 接收器 (跟踪、指标、日志)
      - "4318:4318"   # OTLP HTTP 接收器
      - "3000:3000"   # Grafana UI
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin
    restart: unless-stopped
```

要启动 Grafana LGTM 多合一容器，请运行以下命令：

```shell
docker compose up -d
```

### 使用 Docker CLI {id="using-docker-cli"}

或者，您可以直接使用 Docker 命令行运行 Grafana：

```shell
docker run -d --name grafana_lgtm \
    -p 4317:4317 \   # OTLP gRPC 接收器 (跟踪、指标、日志)
    -p 4318:4318 \   # OTLP HTTP 接收器
    -p 3000:3000 \   # Grafana UI
    -e GF_SECURITY_ADMIN_USER=admin \
    -e GF_SECURITY_ADMIN_PASSWORD=admin \
    grafana/otel-lgtm:latest
```

### 应用程序导出配置 {id="application-export-configuration"}

要将遥测数据从 Ktor 应用程序发送到 OTLP 端点，请将 OpenTelemetry SDK 配置为使用 gRPC 协议。您可以在构建 SDK 之前通过环境变量设置这些值：

```shell
export OTEL_TRACES_EXPORTER=otlp
export OTEL_EXPORTER_OTLP_PROTOCOL=grpc
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
```

或者使用 JVM 标记：

```text
-Dotel.traces.exporter=otlp -Dotel.exporter.otlp.protocol=grpc -Dotel.exporter.otlp.endpoint=http://localhost:4317
```

### 访问 Grafana UI {id="accessing-grafana-ui"}

运行后，Grafana UI 将可通过 [http://localhost:3000/](http://localhost:3000/) 访问。

<procedure>
    <step>
        在 <a href="http://localhost:3000/">http://localhost:3000/</a> 打开 Grafana UI。
    </step>
    <step>
        使用默认凭据登录：
        <list>
            <li><ui-path>User:</ui-path><code>admin</code></li>
            <li><ui-path>Password:</ui-path><code>admin</code></li>
        </list>
    </step>
    <step>
        在左侧导航菜单中，转到 <ui-path>Drilldown → Traces</ui-path>：
        <img src="opentelemetry-grafana-ui.png" alt="Grafana UI Drilldown traces view" width="706" corners="rounded"/>
        进入 <ui-path>Traces</ui-path> 视图后，您可以：
        <list>
            <li>选择 Rate、Errors 或 Duration 指标。</li>
            <li>应用 span 筛选器（例如按服务名称或 span 名称）来缩小数据范围。</li>
            <li>查看跟踪、检查详细信息并与 span 时间线进行交互。</li>
        </list>
    </step>
</procedure>