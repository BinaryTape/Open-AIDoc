[//]: # (title: Micrometer メトリクス)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

[micrometer_jvm_metrics]: https://micrometer.io/docs/ref/jvm

<var name="package_name" value="io.ktor.server.metrics.micrometer"/>

<tldr>
<p>
<b>必須の依存関係</b>: <code>io.ktor:ktor-server-metrics-micrometer</code>
</p>
<var name="example_name" value="micrometer-metrics"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor は Kotlin/Native をサポートしており、追加のランタイムや仮想マシンなしでサーバーを実行できます。">Native サーバー</Links>のサポート</b>: ✖️
</p>
</tldr>

<link-summary>MicrometerMetrics プラグインは、Ktor サーバーアプリケーションで Micrometer メトリクスを有効にし、Prometheus、JMX、Elastic などの必要なモニタリングシステムを選択できるようにします。</link-summary>

[MicrometerMetrics](https://api.ktor.io/ktor-server-metrics-micrometer/io.ktor.server.metrics.micrometer/-micrometer-metrics) プラグインは、Ktor サーバーアプリケーションで [Micrometer](https://micrometer.io/docs) メトリクスを有効にし、Prometheus、JMX、Elastic などの必要なモニタリングシステムを選択できるようにします。デフォルトでは、Ktor は HTTP リクエストをモニタリングするためのメトリクスと、[JVM をモニタリングする][micrometer_jvm_metrics]ための一連の低レベルメトリクスを公開します。これらのメトリクスをカスタマイズしたり、新しいメトリクスを作成したりすることもできます。

## 依存関係の追加 {id="add_dependencies"}
`MicrometerMetrics` を有効にするには、ビルドスクリプトに以下のアーティファクトを含める必要があります。
* `ktor-server-metrics-micrometer` 依存関係を追加します。

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
  
* モニタリングシステムに必要な依存関係を追加します。以下の例は、Prometheus 用のアーティファクトを追加する方法を示しています。

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
  
  `$prometheus_version` は、`micrometer-registry-prometheus` アーティファクトの必要なバージョン（例: `%prometheus_version%`）に置き換えることができます。

## MicrometerMetrics のインストール {id="install_plugin"}

<var name="plugin_name" value="MicrometerMetrics"/>
<p>
    アプリケーションに <code>%plugin_name%</code> プラグインを<a href="#install">インストール</a>するには、
    指定された<Links href="/ktor/server-modules" summary="モジュールを使用すると、ルートをグループ化してアプリケーションを構造化できます。">モジュール</Links>内の <code>install</code> 関数に渡します。
    以下のコードスニペットは、<code>%plugin_name%</code> をインストールする方法を示しています。
</p>
<list>
    <li>
        ... <code>embeddedServer</code> 関数の呼び出し内。
    </li>
    <li>
        ... <code>Application</code> クラスの拡張関数である明示的に定義された <code>module</code> 内。
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

### 公開されるメトリクス {id="ktor_metrics"}
Ktor は HTTP リクエストをモニタリングするために以下のメトリクスを公開します。
* `ktor.http.server.requests.active`: 同時実行 HTTP リクエストの数をカウントする [gauge (ゲージ)](https://micrometer.io/docs/concepts#_gauges)。このメトリクスにはタグはありません。
* `ktor.http.server.requests`: 各リクエストの時間を測定する [timer (タイマー)](https://micrometer.io/docs/concepts#_timers)。このメトリクスは、リクエストされた URL の `address`、HTTP メソッドの `method`、リクエストを処理する Ktor ルートの `route` など、リクエストデータをモニタリングするための一連のタグを提供します。

デフォルトの `ktor.http.server.requests` プレフィックスは、`metricName` [設定](#configure_metrics)プロパティを使用してカスタマイズできます。

> メトリクス名は、設定されたモニタリングシステムによって[異なる](https://micrometer.io/docs/concepts#_naming_meters)場合があります。

HTTP メトリクスに加えて、Ktor は [JVM をモニタリングする](#jvm_metrics)ための一連のメトリクスを公開します。

## レジストリの作成 {id="create_registry"}

`MicrometerMetrics` をインストールした後、[モニタリングシステムのレジストリ](https://micrometer.io/docs/concepts#_registry)を作成し、それを `registry` プロパティに割り当てる必要があります。以下の例では、このレジストリを異なる[ルートハンドラー](server-routing.md)で再利用できるように、`PrometheusMeterRegistry` を `install` ブロックの外側で作成しています。

```kotlin
fun Application.module() {
    val appMicrometerRegistry = PrometheusMeterRegistry(PrometheusConfig.DEFAULT)
    install(MicrometerMetrics) {
        registry = appMicrometerRegistry
    }
}
```

## メトリクスの設定 {id="configure_metrics"}

`MicrometerMetrics` プラグインは、[MicrometerMetricsConfig](https://api.ktor.io/ktor-server-metrics-micrometer/io.ktor.server.metrics.micrometer/-micrometer-metrics-config/index.html) を使用してアクセスできるさまざまな設定オプションを提供します。

### タイマー {id="timers"}
各タイマーのタグをカスタマイズするには、リクエストごとに呼び出される `timers` 関数を使用できます。
```kotlin
install(MicrometerMetrics) {
    // ...
    timers { call, exception ->
        tag("region", call.request.headers["regionId"])
    }
}
```

### 分布統計 {id="distribution_statistics"}
`distributionStatisticConfig` プロパティを使用して、[分布統計](https://micrometer.io/docs/concepts#_configuring_distribution_statistics)を設定します。例：

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

### JVM およびシステムメトリクス {id="jvm_metrics"}
[HTTP メトリクス](#ktor_metrics)に加えて、Ktor は [JVM をモニタリングする][micrometer_jvm_metrics]ための一連のメトリクスを公開します。`meterBinders` プロパティを使用して、これらのメトリクスのリストをカスタマイズできます。例：

```kotlin
install(MicrometerMetrics) {
    meterBinders = listOf(
        JvmMemoryMetrics(),
        JvmGcMetrics(),
        ProcessorMetrics()
    )
}
```

また、空のリストを割り当てて、これらのメトリクスを完全に無効にすることもできます。

## Prometheus: スクレイプエンドポイントの公開 {id="prometheus_endpoint"}
モニタリングシステムとして Prometheus を使用する場合、HTTP エンドポイントを Prometheus スクレイパーに公開する必要があります。Ktor では、以下の方法で行うことができます。
1. 必要なアドレス（以下の例では `/metrics`）で GET リクエストを受け取る専用の[ルート](server-routing.md)を作成します。
2. `call.respond` を使用して、スクレイピングデータを Prometheus に送信します。

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

   完全な例はこちらにあります: [micrometer-metrics](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/micrometer-metrics)