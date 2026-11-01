[//]: # (title: Ktor Server における OpenTelemetry を使用した分散トレーシング)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>
<var name="plugin_name" value="KtorServerTelemetry"/>
<var name="package_name" value="io.opentelemetry.instrumentation"/>
<var name="artifact_name" value="opentelemetry-ktor-3.0"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.opentelemetry.instrumentation:opentelemetry-ktor-3.0</code>
</p>
<var name="example_name" value="opentelemetry"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<snippet id="opentelemetry-description">

Ktor は、トレース、メトリクス、ログなどのテレメトリデータを収集するためのオープンソースのオブザーバビリティフレームワークである [OpenTelemetry](https://opentelemetry.io/) と統合されています。アプリケーションのインストルメンテーションを行い、Grafana や Jaeger などの監視・オブザーバビリティツールにデータをエクスポートする標準的な方法を提供します。

</snippet>

`%plugin_name%` プラグインは、Ktor サーバーアプリケーションにおける受信 HTTP リクエストの分散トレーシングを可能にします。ルート、HTTP メソッド、ステータスコード情報を含む [スパン（span）](https://opentelemetry.io/docs/concepts/signals/traces/#spans) を自動的に作成し、受信リクエストヘッダーから既存のトレースコンテキストを抽出し、スパン名、属性、スパンの種類（kind）をカスタマイズできるようにします。

> クライアント側では、外部サービスへの送信 HTTP 呼び出しのトレースを収集する [KtorClientTelemetry](client-opentelemetry.md) プラグインが OpenTelemetry によって提供されています。

## 依存関係の追加 {id="add_dependencies"}

<p>
    <code>%plugin_name%</code> を使用するには、ビルドスクリプトに <code>%artifact_name%</code> アーティファクトを追加します:
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

## OpenTelemetry の設定 {id="configure-otel"}

Ktor アプリケーションに `%plugin_name%` プラグインをインストールする前に、`OpenTelemetry` インスタンスを設定して初期化する必要があります。このインスタンスは、トレースやメトリクスを含むテレメトリデータの管理を担当します。

### 自動設定 {id="automatic-configuration"}

OpenTelemetry を設定する一般的な方法は、[`AutoConfiguredOpenTelemetrySdk`](https://javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-extension-autoconfigure/latest/io/opentelemetry/sdk/autoconfigure/AutoConfiguredOpenTelemetrySdk.html) を使用することです。これにより、システムプロパティや環境変数に基づいてエクスポーターとリソースが自動的に構成され、セットアップが簡素化されます。

自動検出された設定は引き続きカスタマイズできます。例えば、`service.name` リソース属性を追加することができます:

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

### プログラムによる設定 {id="programmatic-configuration"}

環境ベースの設定に頼らず、コード内でエクスポーター、プロセッサー、プロパゲーターを定義するには、[`OpenTelemetrySdk`](https://javadoc.io/doc/io.opentelemetry/opentelemetry-sdk/latest/io/opentelemetry/sdk/OpenTelemetrySdk.html) を使用できます。

次の例は、OTLP エクスポーター、スパンプロセッサー、およびトレースコンテキストプロパゲーターを使用して、プログラムで OpenTelemetry を設定する方法を示しています:

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

テレメトリのセットアップを完全に制御する必要がある場合や、デプロイ環境で自動設定に頼ることができない場合は、このアプローチを使用してください。

> 詳細については、[OpenTelemetry SDK コンポーネントのドキュメント](https://opentelemetry.io/docs/languages/java/sdk/#sdk-components)を参照してください。
>
{style="tip"}

## %plugin_name% のインストール {id="install_plugin"}

アプリケーションに `%plugin_name%` プラグインを[インストール](server-plugins.md#install)するには、指定された[モジュール](server-modules.md)内の `install` 関数に渡し、[設定済みの `OpenTelemetry` インスタンス](#configure-otel)を設定します:

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

> 他のロギングやテレメトリ関連のプラグインよりも前に %plugin_name% がインストールされていることを確認してください。
>
{style="note"}

## トレーシングの設定 {id="configuration"}

Ktor サーバーが OpenTelemetry スパンをどのように記録およびエクスポートするかをカスタマイズできます。以下のオプションを使用して、どのリクエストをトレースするか、スパンをどのように命名するか、どのような属性を含めるか、スパンの種類をどのように決定するかを調整できます。

> これらの概念の詳細については、[OpenTelemetry トレーシングドキュメント](https://opentelemetry.io/docs/concepts/signals/traces/)を参照してください。

### 追加の HTTP メソッドのトレース {id="config-known-methods"}

デフォルトでは、このプラグインは標準の HTTP メソッド（`GET`、`POST`、`PUT` など）をトレースします。追加のメソッドやカスタムメソッドをトレースするには、`knownMethods` プロパティを設定します:

```kotlin
install(%plugin_name%) {
    // ...
    knownMethods(HttpMethod.DefaultMethods + CUSTOM_METHOD)
}
```

### ヘッダーのキャプチャ {id="config-request-headers"}

特定の HTTP リクエストヘッダーをスパン属性として含めるには、`capturedRequestHeaders` プロパティを使用します:

```kotlin
install(%plugin_name%) {
    // ...
    capturedRequestHeaders(HttpHeaders.UserAgent)
}
```

### スパンの種類（Span kind）の選択 {id="config-span-kind"}

リクエストの特性に基づいてスパンの種類（`SERVER`、`CLIENT`、`PRODUCER`、`CONSUMER` など）をオーバーライドするには、`spanKindExtractor` プロパティを使用します:

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

### カスタム属性の追加 {id="config-custom-attributes"}

スパンの開始時または終了時にカスタム属性を付与するには、`attributesExtractor` プロパティを使用します:

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

### その他のプロパティ {id="additional-properties"}

アプリケーション全体のトレーシング動作を微調整するために、プロパゲーター、属性の制限、インストルメンテーションの有効化/無効化などの追加の OpenTelemetry プロパティを設定することもできます。詳細については、[OpenTelemetry Java 設定ガイド](https://opentelemetry.io/docs/languages/java/configuration/)を参照してください。

## Grafana LGTM でテレメトリデータを検証する {id="verify-telemetry-data-with-grafana-lgtm"}

テレメトリデータを可視化および検証するために、Grafana などの分散トレーシングバックエンドにトレース、メトリクス、ログをエクスポートできます。`grafana/otel-lgtm` オールインワンイメージには、[Grafana](https://grafana.com/)、[Tempo](https://grafana.com/oss/tempo/)（トレース）、[Loki](https://grafana.com/oss/loki/)（ログ）、[Mimir](https://grafana.com/oss/mimir/)（メトリクス）がバンドルされています。

### Docker Compose を使用する {id="using-docker-compose"}

次の内容で **docker-compose.yml** ファイルを作成します:

```yaml
services:
  grafana-lgtm:
    image: grafana/otel-lgtm:latest
    ports:
      - "4317:4317"   # OTLP gRPC receiver (traces, metrics, logs)
      - "4318:4318"   # OTLP HTTP receiver
      - "3000:3000"   # Grafana UI
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin
    restart: unless-stopped
```

Grafana LGTM オールインワンコンテナを起動するには、次のコマンドを実行します:

```shell
docker compose up -d
```

### Docker CLI を使用する {id="using-docker-cli"}

または、Docker コマンドラインを使用して Grafana を直接実行することもできます:

```shell
docker run -d --name grafana_lgtm \
    -p 4317:4317 \   # OTLP gRPC receiver (traces, metrics, logs)
    -p 4318:4318 \   # OTLP HTTP receiver
    -p 3000:3000 \   # Grafana UI
    -e GF_SECURITY_ADMIN_USER=admin \
    -e GF_SECURITY_ADMIN_PASSWORD=admin \
    grafana/otel-lgtm:latest
```

### アプリケーションのエクスポート設定 {id="application-export-configuration"}

Ktor アプリケーションから OTLP エンドポイントにテレメトリを送信するには、gRPC プロトコルを使用するように OpenTelemetry SDK を設定します。SDK をビルドする前に、環境変数を介してこれらの値を設定できます:

```shell
export OTEL_TRACES_EXPORTER=otlp
export OTEL_EXPORTER_OTLP_PROTOCOL=grpc
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
```

または、JVM フラグを使用します:

```text
-Dotel.traces.exporter=otlp -Dotel.exporter.otlp.protocol=grpc -Dotel.exporter.otlp.endpoint=http://localhost:4317
```

### Grafana UI へのアクセス {id="accessing-grafana-ui"}

起動すると、Grafana UI は [http://localhost:3000/](http://localhost:3000/) で利用可能になります。

<procedure>
    <step>
        <a href="http://localhost:3000/">http://localhost:3000/</a> で Grafana UI を開きます。
    </step>
    <step>
        デフォルトの認証情報でログインします:
        <list>
            <li><ui-path>User:</ui-path><code>admin</code></li>
            <li><ui-path>Password:</ui-path><code>admin</code></li>
        </list>
    </step>
    <step>
        左側のナビゲーションメニューで、<ui-path>Drilldown → Traces</ui-path> に移動します:
        <img src="opentelemetry-grafana-ui.png" alt="Grafana UI Drilldown traces view" width="706" corners="rounded"/>
        <ui-path>Traces</ui-path> ビューに入ると、次の操作が可能です:
        <list>
            <li>Rate（レート）、Errors（エラー）、または Duration（所要時間）メトリクスを選択する。</li>
            <li>スパンフィルター（サービス名やスパン名など）を適用してデータを絞り込む。</li>
            <li>トレースの表示、詳細の確認、スパンタイムラインの操作を行う。</li>
        </list>
    </step>
</procedure>