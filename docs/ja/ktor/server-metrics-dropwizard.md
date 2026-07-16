[//]: # (title: Dropwizardメトリクス)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="DropwizardMetrics"/>
<var name="package_name" value="io.ktor.server.metrics.dropwizard"/>
<var name="artifact_name" value="ktor-server-metrics"/>

<tldr>
<p>
<b>必須依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="dropwizard-metrics"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="KtorはKotlin/Nativeをサポートしており、追加のランタイムや仮想マシンなしでサーバーを実行できます。">Nativeサーバー</Links>のサポート</b>: ✖️
</p>
</tldr>

<link-summary>%plugin_name%プラグインを使用すると、Metricsライブラリを設定して、サーバーや受信リクエストに関する有用な情報を取得できます。</link-summary>

[%plugin_name%](https://api.ktor.io/ktor-server-metrics/io.ktor.server.metrics.dropwizard/-dropwizard-metrics.html)プラグインを使用すると、[Metrics](http://metrics.dropwizard.io/)ライブラリを設定して、サーバーや受信リクエストに関する有用な情報を取得できます。

## 依存関係の追加 {id="add_dependencies"}
`%plugin_name%`を有効にするには、ビルドスクリプトに以下のアーティファクトを含める必要があります。
* `%artifact_name%`依存関係を追加します。

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

* オプションとして、特定のレポーターに必要な依存関係を追加します。以下の例は、JMX経由でメトリクスをレポートするために必要なアーティファクトを追加する方法を示しています。

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
  
  `$dropwizard_version`は、`metrics-jmx`アーティファクトの必要なバージョン（例：`%dropwizard_version%`）に置き換えることができます。

## %plugin_name%のインストール {id="install_plugin"}

<p>
    <code>%plugin_name%</code>プラグインをアプリケーションに<a href="#install">インストール</a>するには、指定された<Links href="/ktor/server-modules" summary="モジュールを使用すると、ルートをグループ化してアプリケーションを構造化できます。">モジュール</Links>内の<code>install</code>関数に渡します。
    以下のコードスニペットは、<code>%plugin_name%</code>をインストールする方法を示しています...
</p>
<list>
    <li>
        ... <code>embeddedServer</code>関数の呼び出し内。
    </li>
    <li>
        ... <code>Application</code>クラスの拡張関数である、明示的に定義された<code>module</code>内。
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

## %plugin_name%の設定 {id="configure_plugin"}

`%plugin_name%`では、`registry`プロパティを使用して、サポートされている任意の[メトリクスレポーター](http://metrics.dropwizard.io/)を使用できます。SLF4JとJMXレポーターの設定方法を見てみましょう。

### SLF4Jレポーター {id="slf4j"}

SLF4Jレポーターを使用すると、SLF4Jがサポートする任意の出力に定期的にレポートを出すことができます。
例えば、10秒ごとにメトリクスを出力するには、次のようにします。

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

完全な例はこちらで確認できます: [dropwizard-metrics](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/dropwizard-metrics)。

アプリケーションを実行して[http://0.0.0.0:8080](http://0.0.0.0:8080)を開くと、出力は以下のようになります。

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

### JMXレポーター {id="jmx"}

JMXレポーターを使用すると、すべてのメトリクスをJMXに公開し、`jconsole`を使用してそれらのメトリクスを表示できます。

```kotlin
install(DropwizardMetrics) {
    JmxReporter.forRegistry(registry)
        .convertRatesTo(TimeUnit.SECONDS)
        .convertDurationsTo(TimeUnit.MILLISECONDS)
        .build()
        .start()
}
```

完全な例はこちらで確認できます: [dropwizard-metrics](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/dropwizard-metrics)。

アプリケーションを実行し、[JConsole](https://docs.oracle.com/en/java/javase/17/management/using-jconsole.html)を使用してそのプロセスに接続すると、メトリクスは以下のようになります。

![Ktor Metrics: JMX](jmx.png){width="758"}

## 公開されるメトリクス {id="exposed-metrics"}

`%plugin_name%`は以下のメトリクスを公開します。

- Ktor固有のメトリクスと[JVMメトリクス](#jvm-metrics)を含む[グローバルメトリクス](#global-metrics)。
- [エンドポイントのメトリクス](#endpoint-metrics)。

### グローバルメトリクス {id="global-metrics"}

グローバルメトリクスには、以下のKtor固有のメトリクスが含まれます。

* `ktor.calls.active`:`Count` - 未完了のアクティブなリクエストの数。
* `ktor.calls.duration` - 呼び出しの期間に関する情報。
* `ktor.calls.exceptions` - 例外の数に関する情報。
* `ktor.calls.status.NNN` - 特定のHTTPステータスコード`NNN`が発生した回数に関する情報。

メトリクス名は`ktor.calls`プレフィックスで始まることに注意してください。これは`baseName`プロパティを使用してカスタマイズできます。

```kotlin
install(DropwizardMetrics) {
    baseName = "my.prefix"
}
```

### エンドポイントごとのメトリクス {id="endpoint-metrics"}

* `"/uri(method:VERB).NNN"` - このパスと動詞に対して、特定のHTTPステータスコード`NNN`が発生した回数に関する情報。
* `"/uri(method:VERB).meter"` - このパスと動詞に対する呼び出し回数に関する情報。
* `"/uri(method:VERB).timer"` - このエンドポイントの期間に関する情報。

### JVMメトリクス {id="jvm-metrics"}

HTTPメトリクスに加えて、KtorはJVMを監視するためのメトリクスセットを公開します。これらのメトリクスは`registerJvmMetricSets`プロパティを使用して無効にできます。

```kotlin
install(DropwizardMetrics) {
    registerJvmMetricSets = false
}
```

完全な例はこちらで確認できます: [dropwizard-metrics](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/dropwizard-metrics)。