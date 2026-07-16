[//]: # (title: Dropwizard 指标)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="DropwizardMetrics"/>
<var name="package_name" value="io.ktor.server.metrics.dropwizard"/>
<var name="artifact_name" value="ktor-server-metrics"/>

<tldr>
<p>
<b>必需的依赖项</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="dropwizard-metrics"/>
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

<link-summary>%plugin_name% 插件允许您配置 Metrics 库，以获取有关服务器和传入请求的有价值信息。</link-summary>

[%plugin_name%](https://api.ktor.io/ktor-server-metrics/io.ktor.server.metrics.dropwizard/-dropwizard-metrics.html) 插件允许您配置 [Metrics](http://metrics.dropwizard.io/) 库，以获取有关服务器和传入请求的有价值信息。

## 添加依赖项 {id="add_dependencies"}
要启用 `%plugin_name%`，您需要在构建脚本中包含以下构件：
* 添加 `%artifact_name%` 依赖项：

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

* （可选）为特定报告器添加所需的依赖项。以下示例展示了如何添加通过 JMX 报告指标所需的构件：

  <var name="group_id" value="io.dropwizard.metrics"/>
  <var name="artifact_name" value="metrics-jmx"/>
  <var name="version" value="dropwizard_version"/>
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
  
  您可以将 `$dropwizard_version` 替换为 `metrics-jmx` 构件所需的版本，例如 `%dropwizard_version%`。

## 安装 %plugin_name% {id="install_plugin"}

<p>
    要在应用程序中<a href="#install">安装</a> <code>%plugin_name%</code> 插件，请将其传递给指定<Links href="/ktor/server-modules" summary="模块允许您通过对路由进行分组来构建应用程序结构。">模块</Links>中的 <code>install</code> 函数。
    以下代码片段展示了如何安装 <code>%plugin_name%</code> ...
</p>
<list>
    <li>
        ... 在 <code>embeddedServer</code> 函数调用中。
    </li>
    <li>
        ... 在显式定义的 <code>module</code> 中，该模块是 <code>Application</code> 类的扩展函数。
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

## 配置 %plugin_name% {id="configure_plugin"}

`%plugin_name%` 允许您使用 `registry` 属性来使用任何支持的[指标报告器](http://metrics.dropwizard.io/)。让我们来看看如何配置 SLF4J 和 JMX 报告器。

### SLF4J 报告器 {id="slf4j"}

SLF4J 报告器允许您定期向 SLF4J 支持的任何输出发送报告。
例如，要每 10 秒输出一次指标，您可以：

```kotlin
install(DropwizardMetrics) {
    Slf4jReporter.forRegistry(registry)
        .outputTo(this@module.log)
        .convertRatesTo(TimeUnit.SECONDS)
        .convertDurationsTo(TimeUnit.MILLISECONDS)
        .build()
        .start(10, TimeUnit.SECONDS)
}
```

您可以在此处找到完整示例：[dropwizard-metrics](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/dropwizard-metrics)。

如果您运行应用程序并打开 [http://0.0.0.0:8080](http://0.0.0.0:8080)，输出将如下所示：

```Bash
[DefaultDispatcher-worker-1] INFO  Application - Responding at http://0.0.0.0:8080
... type=COUNTER, name=ktor.calls.active, count=0
... type=METER, name=ktor.calls./(method:GET).200, count=6, m1_rate=1.2, m5_rate=1.2, m15_rate=1.2, mean_rate=0.98655785084844, rate_unit=events/second
... type=METER, name=ktor.calls./(method:GET).meter, count=6, m1_rate=1.2, m5_rate=1.2, m15_rate=1.2, mean_rate=0.9841134429134598, rate_unit=events/second
... type=METER, name=ktor.calls.exceptions, count=0, m1_rate=0.0, m5_rate=0.0, m15_rate=0.0, mean_rate=0.0, rate_unit=events/second
... type=METER, name=ktor.calls.status.200, count=6, m1_rate=1.2, m5_rate=1.2, m15_rate=1.2, mean_rate=0.9866015088545449, rate_unit=events/second
... type=TIMER, name=ktor.calls./(method:GET).timer, count=6, min=0.359683, max=14.213046, mean=2.691307542732234, stddev=5.099546889849414, p50=0.400967, p75=0.618972, p95=14.213046, p98=14.213046, p99=14.213046, p999=14.213046, m1_rate=1.2, m5_rate=1.2, m15_rate=1.2, mean_rate=0.9830677128229028, rate_unit=events/second, duration_unit=milliseconds
... type=TIMER, name=ktor.calls.duration, count=6, min=0.732149, max=33.735719, mean=6.238046092985701, stddev=12.169258340009847, p50=0.778864, p75=1.050454, p95=33.735719, p98=33.735719, p99=33.735719, p999=33.735719, m1_rate=0.2, m5_rate=0.2, m15_rate=0.2, mean_rate=0.6040311229887146, rate_unit=events/second, duration_unit=milliseconds
```

### JMX 报告器 {id="jmx"}

JMX 报告器允许您将所有指标公开给 JMX，从而允许您使用 `jconsole` 查看这些指标。

```kotlin
install(DropwizardMetrics) {
    JmxReporter.forRegistry(registry)
        .convertRatesTo(TimeUnit.SECONDS)
        .convertDurationsTo(TimeUnit.MILLISECONDS)
        .build()
        .start()
}
```

您可以在此处找到完整示例：[dropwizard-metrics](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/dropwizard-metrics)。

如果您运行应用程序并使用 [JConsole](https://docs.oracle.com/en/java/javase/17/management/using-jconsole.html) 连接到其进程，指标将如下所示：

![Ktor 指标：JMX](jmx.png){width="758"}

## 公开的指标 {id="exposed-metrics"}

`%plugin_name%` 公开了以下指标：

- [全局指标](#global-metrics)，包括 Ktor 特定指标和 [JVM 指标](#jvm-metrics)。
- [端点指标](#endpoint-metrics)。

### 全局指标 {id="global-metrics"}

全局指标包括以下 Ktor 特定指标：

* `ktor.calls.active`：`Count` - 未完成的活跃请求数。
* `ktor.calls.duration` - 有关调用持续时间的信息。
* `ktor.calls.exceptions` - 有关异常数量的信息。
* `ktor.calls.status.NNN` - 有关特定 HTTP 状态码 `NNN` 发生次数的信息。

请注意，指标名称以 `ktor.calls` 前缀开头。您可以使用 `baseName` 属性对其进行自定义：

```kotlin
install(DropwizardMetrics) {
    baseName = "my.prefix"
}
```

### 每个端点的指标 {id="endpoint-metrics"}

* `"/uri(method:VERB).NNN"` - 对于此路径和谓词，特定 HTTP 状态码 `NNN` 发生次数的信息。
* `"/uri(method:VERB).meter"` - 有关此路径和谓词的调用次数的信息。
* `"/uri(method:VERB).timer"` - 有关此端点持续时间的信息。

### JVM 指标 {id="jvm-metrics"}

除了 HTTP 指标外，Ktor 还公开了一组用于监控 JVM 的指标。您可以使用 `registerJvmMetricSets` 属性禁用这些指标：

```kotlin
install(DropwizardMetrics) {
    registerJvmMetricSets = false
}
```

您可以在此处找到完整示例：[dropwizard-metrics](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/dropwizard-metrics)。