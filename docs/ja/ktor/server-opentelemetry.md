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
    <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<snippet id="opentelemetry-description">

Ktor は [OpenTelemetry](https://opentelemetry.io/) と統合されています。OpenTelemetry は、トレース、メトリクス、ログなどのテレメトリデータを収集するためのオープンソースのオブザーバビリティフレームワークです。アプリケーションを計装し、Grafana や Jaeger などのモニタリングおよびオブザーバビリティツールにデータをエクスポートするための標準的な方法を提供します。

</snippet>

`%plugin_name%` プラグインは、Ktor サーバーアプリケーションにおける受信 HTTP リクエストの分散トレーシングを有効にします。ルート、HTTP メソッド、ステータスコード情報を含む[スパン](https://opentelemetry.io/docs/concepts/signals/traces/#spans)を自動的に作成し、受信リクエストヘッダーから既存のトレースコンテキストを抽出します。また、スパン名、属性、スパンの種類のカスタマイズも可能です。

> クライアント側では、OpenTelemetry は [KtorClientTelemetry](client-opentelemetry.md) プラグインを提供しており、外部サービスへの送信 HTTP コールのトレースを収集します。

## 依存関係の追加 {id="add_dependencies"}

<p>
    <code>%plugin_name%</code> を使用するには、ビルドスクリプトに <code>%artifact_name%</code> アーティファクトを含める必要があります。
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

## OpenTelemetry の設定 {id="configure-otel"}

Ktor アプリケーションに `%plugin_name%` プラグインをインストールする前に、`OpenTelemetry` インスタンスを設定して初期化する必要があります。このインスタンスは、トレースやメトリクスを含むテレメトリデータの管理を担当します。

### 自動設定

OpenTelemetry を設定する一般的な方法は、[`AutoConfiguredOpenTelemetrySdk`](https://javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-extension-autoconfigure/latest/io/opentelemetry/sdk/autoconfigure/AutoConfiguredOpenTelemetrySdk.html) を使用することです。これにより、システムプロパティや環境変数に基づいてエクスポーターやリソースを自動的に構成し、セットアップを簡素化できます。

自動的に検出された構成をカスタマイズすることも可能です。例えば、`service.name` リソース属性を追加する場合は以下のようになります。

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

### プログラムによる設定

環境ベースの設定に依存せず、コード内でエクスポーター、プロセッサ、プロパゲーターを定義するには、[`OpenTelemetrySdk`](https://javadoc.io/doc/io.opentelemetry/opentelemetry-sdk/latest/io/opentelemetry/sdk/OpenTelemetrySdk.html) を使用できます。

以下の例は、OTLP エクスポーター、スパンプロセッサ、およびトレースコンテキストプロパゲーターを使用してプログラムで OpenTelemetry を設定する方法を示しています。

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

テレメトリのセットアップを完全に制御する必要がある場合や、デプロイ環境で自動設定に依存できない場合に、このアプローチを使用してください。

> 詳細については、[OpenTelemetry SDK コンポーネントのドキュメント](https://opentelemetry.io/docs/languages/java/sdk/#sdk-components)を参照してください。
>
{style="tip"}

## %plugin_name% のインストール {id="install_plugin"}

`%plugin_name%` プラグインをアプリケーションに[インストール](server-plugins.md#install)するには、指定された[モジュール](server-modules.md)で `install` 関数に渡し、[設定済みの `OpenTelemetry` インスタンス](#configure-otel)をセットします。

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

> %plugin_name% が、他のロギングまたはテレメトリ関連のプラグインよりも前にインストールされていることを確認してください。
>
{style="note"}

## トレーシングの設定 {id="configuration"}

Ktor サーバーが OpenTelemetry スパンを記録およびエクスポートする方法をカスタマイズできます。以下のオプションを使用して、どのリクエストをトレースするか、スパンの名前、含まれる属性、およびスパンの種類の決定方法を調整できます。

> これらの概念の詳細については、[OpenTelemetry トレーシングドキュメント](https://opentelemetry.io/docs/concepts/signals/traces/)を参照してください。

### 追加の HTTP メソッドのトレース {id="config-known-methods"}

デフォルトでは、プラグインは標準の HTTP メソッド（`GET`、`POST`、`PUT` など）をトレースします。追加またはカスタムメソッドをトレースするには、`knownMethods` プロパティを設定します。

```kotlin
install(%plugin_name%) {
    // ...
    knownMethods(HttpMethod.DefaultMethods + CUSTOM_METHOD)
}
```

### ヘッダーのキャプチャ {id="config-request-headers"}

特定の HTTP リクエストヘッダーをスパン属性として含めるには、`capturedRequestHeaders` プロパティを使用します。

```kotlin
install(%plugin_name%) {
    // ...
    capturedRequestHeaders(HttpHeaders.UserAgent)
}
```

### スパンの種類の選択 {id="config-span-kind"}

リクエストの特性に基づいてスパンの種類（`SERVER`、`CLIENT`、`PRODUCER`、`CONSUMER` など）を上書きするには、`spanKindExtractor` プロパティを使用します。

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

スパンの開始時または終了時にカスタム属性をアタッチするには、`attributesExtractor` プロパティを使用します。

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

### 追加のプロパティ {id="additional-properties"}

アプリケーション全体のトレーシング動作を微調整するために、プロパゲーター、属性制限、インストゥルメンテーションの有効化/無効化などの追加の OpenTelemetry プロパティを設定することもできます。詳細については、[OpenTelemetry Java 設定ガイド](https://opentelemetry.io/docs/languages/java/configuration/)を参照してください。

## Grafana LGTM によるテレメトリデータの検証

テレメトリデータを視覚化して検証するために、トレース、メトリクス、ログを Grafana などの分散トレーシングバックエンドにエクスポートできます。`grafana/otel-lgtm` オールインワンイメージには、[Grafana](https://grafana.com/)、[Tempo](https://grafana.com/oss/tempo/) (トレース)、[Loki](https://grafana.com/oss/loki/) (ログ)、[Mimir](https://grafana.com/oss/mimir/) (メトリクス) がバンドルされています。

### Docker Compose を使用する

以下の内容で **docker-compose.yml** ファイルを作成します。

```yaml
services:
  grafana-lgtm:
    image: grafana/otel-lgtm:latest
    ports:
      - "4317:4317"   # OTLP gRPC 受信機 (トレース、メトリクス、ログ)
      - "4318:4318"   # OTLP HTTP 受信機
      - "3000:3000"   # Grafana UI
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin
    restart: unless-stopped
```

Grafana LGTM オールインワンコンテナを起動するには、次のコマンドを実行します。

```shell
docker compose up -d
```

### Docker CLI を使用する

あるいは、Docker コマンドラインを使用して直接 Grafana を実行することもできます。

```shell
docker run -d --name grafana_lgtm \
    -p 4317:4317 \   # OTLP gRPC 受信機 (トレース、メトリクス、ログ)
    -p 4318:4318 \   # OTLP HTTP 受信機
    -p 3000:3000 \   # Grafana UI
    -e GF_SECURITY_ADMIN_USER=admin \
    -e GF_SECURITY_ADMIN_PASSWORD=admin \
    grafana/otel-lgtm:latest
```

### アプリケーションのエクスポート設定

Ktor アプリケーションから OTLP エンドポイントにテレメトリを送信するには、gRPC プロトコルを使用するように OpenTelemetry SDK を設定します。SDK をビルドする前に、環境変数を介してこれらの値を設定できます。

```shell
export OTEL_TRACES_EXPORTER=otlp
export OTEL_EXPORTER_OTLP_PROTOCOL=grpc
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
```

または、JVM フラグを使用します。

```text
-Dotel.traces.exporter=otlp -Dotel.exporter.otlp.protocol=grpc -Dotel.exporter.otlp.endpoint=http://localhost:4317
```

### Grafana UI へのアクセス

実行されると、Grafana UI は [http://localhost:3000/](http://localhost:3000/) で利用可能になります。

<procedure>
    <step>
        Grafana UI を [http://localhost:3000/](http://localhost:3000/) で開きます。
    </step>
    <step>
        デフォルトの認証情報でログインします：
        <list>
            <li><ui-path>ユーザー:</ui-path><code>admin</code></li>
            <li><ui-path>パスワード:</ui-path><code>admin</code></li>
        </list>
    </step>
    <step>
        左側のナビゲーションメニューで、<ui-path>Drilldown → Traces</ui-path> に移動します。
        <img src="opentelemetry-grafana-ui.png" alt="Grafana UI Drilldown traces view" width="706" corners="rounded"/>
        <ui-path>Traces</ui-path> ビューでは、以下のことができます：
        <list>
            <li>Rate（レート）、Errors（エラー）、または Duration（期間）のメトリクスを選択する。</li>
            <li>スパンフィルター（サービス名やスパン名など）を適用してデータを絞り込む。</li>
            <li>トレースを表示し、詳細を調査し、スパンのタイムラインを操作する。</li>
        </list>
    </step>
</procedure>