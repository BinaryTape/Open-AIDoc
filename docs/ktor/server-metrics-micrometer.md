[//]: # (title: Micrometer 指标)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

[micrometer_jvm_metrics]: https://micrometer.io/docs/ref/jvm

<var name="package_name" value="io.ktor.server.metrics.micrometer"/>

<tldr>
<p>
<b>所需依赖项</b>：<code>io.ktor:ktor-server-metrics-micrometer</code>
</p>
<var name="example_name" value="micrometer-metrics"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor 支持 Kotlin/Native，允许您在没有额外运行时或虚拟机的情况下运行服务器。">原生服务器</Links>支持</b>：✖️
</p>
</tldr>

<link-summary>MicrometerMetrics 插件可在您的 Ktor 服务器应用程序中启用 Micrometer 指标，并允许您选择所需的监控系统，例如 Prometheus、JMX、Elastic 等。</link-summary>

[MicrometerMetrics](https://api.ktor.io/ktor-server-metrics-micrometer/io.ktor.server.metrics.micrometer/-micrometer-metrics) 插件可在您的 Ktor 服务器应用程序中启用 [Micrometer](https://micrometer.io/docs) 指标，并允许您选择所需的监控系统，例如 Prometheus、JMX、Elastic 等。默认情况下，Ktor 公开用于监控 HTTP 请求的指标，以及一组用于[监控 JVM][micrometer_jvm_metrics] 的低级指标。您可以自定义这些指标或创建新指标。

## 添加依赖项 {id="add_dependencies"}
要启用 `MicrometerMetrics`，您需要在构建脚本中包含以下构件：
* 添加 `ktor-server-metrics-micrometer` 依赖项：

  <var name="artifact_name" value="ktor-server-metrics-micrometer"/>
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
  
* 添加监控系统所需的依赖项。下面的示例展示了如何添加 Prometheus 的构件：

  <var name="group_id" value="io.micrometer"/>
  <var name="artifact_name" value="micrometer-registry-prometheus"/>
  <var name="version" value="prometheus_version"/>
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
  
  您可以将 `$prometheus_version` 替换为所需的 `micrometer-registry-prometheus` 构件版本，例如 `%prometheus_version%`。

## 安装 MicrometerMetrics {id="install_plugin"}

<var name="plugin_name" value="MicrometerMetrics"/>
<p>
    要将 <code>%plugin_name%</code> 插件<a href="#install">安装</a>到应用程序中，请将其传递给指定<Links href="/ktor/server-modules" summary="模块允许您通过对路由进行分组来构建应用程序结构。">模块</Links>中的 <code>install</code> 函数。
    下面的代码片段展示了如何安装 <code>%plugin_name%</code> ...
</p>
<list>
    <li>
        ... 在 <code>embeddedServer</code> 函数调用中。
    </li>
    <li>
        ... 在显式定义的 <code>module</code>（它是 <code>Application</code> 类的扩展函数）中。
    </li>
</list>
<Tabs>
    <TabItem title="embeddedServer">
        <code-block lang="kotlin" code="            import io.ktor.server.engine.*&#10;            import io.ktor.server.netty.*&#10;            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;&#10;            fun main() {&#10;                embeddedServer(Netty, port = 8080) {&#10;                    install(%plugin_name%)&#10;                    // ...&#10;                }.start(wait = true)&#10;            }"></code-block>
    </TabItem>
    <TabItem title="module">
        <code-block lang="kotlin" code="            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;            // ...&#10;            fun Application.module() {&#10;                install(%plugin_name%)&#10;                // ...&#10;            }"></code-block>
    </TabItem>
</Tabs>

### 公开的指标 {id="ktor_metrics"}
Ktor 公开以下指标用于监控 HTTP 请求：
* `ktor.http.server.requests.active`：一个 [gauge](https://micrometer.io/docs/concepts#_gauges)，用于统计并发 HTTP 请求的数量。此指标不提供任何标签。
* `ktor.http.server.requests`：一个 [timer](https://micrometer.io/docs/concepts#_timers)，用于测量每个请求的时间。此指标提供了一组用于监控请求数据的标签，包括请求 URL 的 `address`、HTTP 方法的 `method`、处理请求的 Ktor 路由的 `route` 等。

您可以使用 `metricName` [配置](#configure_metrics)属性来自定义默认的 `ktor.http.server.requests` 前缀。

> 指标名称可能会有所[不同](https://micrometer.io/docs/concepts#_naming_meters)，具体取决于所配置的监控系统。

除了 HTTP 指标外，Ktor 还公开了一组用于[监控 JVM](#jvm_metrics) 的指标。

## 创建注册表 {id="create_registry"}

安装 `MicrometerMetrics` 后，您需要为您的[监控系统创建一个注册表](https://micrometer.io/docs/concepts#_registry)，并将其分配给 `registry` 属性。在下面的示例中，`PrometheusMeterRegistry` 是在 `install` 块之外创建的，以便能够在不同的[路由处理程序](server-routing.md)中重用此注册表：

```kotlin
fun Application.module() {
    val appMicrometerRegistry = PrometheusMeterRegistry(PrometheusConfig.DEFAULT)
    install(MicrometerMetrics) {
        registry = appMicrometerRegistry
    }
}
```

## 配置指标 {id="configure_metrics"}

`MicrometerMetrics` 插件提供了各种配置选项，可以使用 [MicrometerMetricsConfig](https://api.ktor.io/ktor-server-metrics-micrometer/io.ktor.server.metrics.micrometer/-micrometer-metrics-config/index.html) 进行访问。

### 计时器 {id="timers"}
要为每个计时器自定义标签，您可以使用为每个请求调用的 `timers` 函数：
```kotlin
install(MicrometerMetrics) {
    // ...
    timers { call, exception ->
        tag("region", call.request.headers["regionId"])
    }
}
```

### 分布统计 {id="distribution_statistics"}
您可以使用 `distributionStatisticConfig` 属性配置[分布统计](https://micrometer.io/docs/concepts#_configuring_distribution_statistics)，例如：

```kotlin
install(MicrometerMetrics) {
    distributionStatisticConfig = DistributionStatisticConfig.Builder()
        .percentilesHistogram(true)
        .maximumExpectedValue(Duration.ofSeconds(20).toNanos().toDouble())
        .serviceLevelObjectives(
            Duration.ofMillis(100).toNanos().toDouble(),
            Duration.ofMillis(500).toNanos().toDouble()
        )
        .build()
}
```

### JVM 和系统指标 {id="jvm_metrics"}
除了 [HTTP 指标](#ktor_metrics)，Ktor 还公开了一组用于[监控 JVM][micrometer_jvm_metrics] 的指标。您可以使用 `meterBinders` 属性自定义这些指标的列表，例如：

```kotlin
install(MicrometerMetrics) {
    meterBinders = listOf(
        JvmMemoryMetrics(),
        JvmGcMetrics(),
        ProcessorMetrics()
    )
}
```

您也可以分配一个空列表来完全禁用这些指标。

## Prometheus：公开抓取端点 {id="prometheus_endpoint"}
如果您使用 Prometheus 作为监控系统，则需要向 Prometheus 抓取器公开一个 HTTP 端点。在 Ktor 中，您可以通过以下方式实现：
1. 创建一个专用的[路由](server-routing.md)，用于接收指定地址（在下面的示例中为 `/metrics`）的 GET 请求。
2. 使用 `call.respond` 将抓取数据发送到 Prometheus。

   ```kotlin
   fun Application.module() {
       val appMicrometerRegistry = PrometheusMeterRegistry(PrometheusConfig.DEFAULT)
       install(MicrometerMetrics) {
           registry = appMicrometerRegistry
       }
       routing {
           get("/metrics") {
               call.respond(appMicrometerRegistry.scrape())
           }
       }
   }
   ```

   您可以在此处找到完整示例：[micrometer-metrics](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/micrometer-metrics)。