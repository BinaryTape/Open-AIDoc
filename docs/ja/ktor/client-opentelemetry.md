[//]: # (title: Ktor ClientでのOpenTelemetryによる分散トレーシング)

<show-structure for="chapter" depth="2"/>
<primary-label ref="client-plugin"/>
<var name="plugin_name" value="KtorClientTelemetry"/>

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

Ktorは、トレース、メトリクス、ログなどのテレメトリデータを収集するためのオープンソースのオブザーバビリティフレームワークである[OpenTelemetry](https://opentelemetry.io/)と統合されています。アプリケーションを計装（インストルメンテーション）し、GrafanaやJaegerなどの監視・オブザーバビリティツールにデータをエクスポートするための標準的な方法を提供します。

`%plugin_name%` プラグインを使用すると、送信HTTPリクエストを自動的にトレースできます。メソッド、URL、ステータスコードなどのメタデータをキャプチャし、サービス間でトレースコンテキストを伝播します。また、スパン属性をカスタマイズしたり、独自のOpenTelemetry構成を使用したりすることもできます。

> サーバー側では、OpenTelemetryはサーバーへの受信HTTPリクエストを計装するための [KtorServerTelemetry](server-opentelemetry.md) プラグインを提供しています。

## 依存関係の追加 {id="add_dependencies"}

<p>
    <code>%plugin_name%</code> を使用するには、ビルドスクリプトに <code>%artifact_name%</code> アーティファクトを追加します。
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
## OpenTelemetryの構成 {id="configure-otel"}

Ktorアプリケーションに `%plugin_name%` プラグインをインストールする前に、`OpenTelemetry` インスタンスを構成して初期化する必要があります。このインスタンスは、トレースやメトリクスを含むテレメトリデータの管理を担当します。

### 自動構成 {id="automatic-configuration"}

OpenTelemetryを構成する一般的な方法は、[`AutoConfiguredOpenTelemetrySdk`](https://javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-extension-autoconfigure/latest/io/opentelemetry/sdk/autoconfigure/AutoConfiguredOpenTelemetrySdk.html) を使用することです。これにより、システムプロパティや環境変数に基づいてエクスポーターとリソースが自動的に構成され、セットアップが簡素化されます。

自動検出された構成をカスタマイズすることも可能です。たとえば、`service.name` リソース属性を追加できます。

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

### プログラムによる構成 {id="programmatic-configuration"}

環境変数ベースの構成に頼る代わりに、コード内でエクスポーター、プロセッサー、プロパゲーターを定義したい場合は、[`OpenTelemetrySdk`](https://javadoc.io/doc/io.opentelemetry/opentelemetry-sdk/latest/io/opentelemetry/sdk/OpenTelemetrySdk.html) を使用できます。

次の例は、OTLPエクスポーター、スパンプロセッサー、およびトレースコンテキストプロパゲーターを使用して、プログラムでOpenTelemetryを構成する方法を示しています。

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

テレメトリのセットアップを完全に制御する必要がある場合や、デプロイ環境で自動構成に頼ることができない場合は、このアプローチを使用してください。

> 詳細については、[OpenTelemetry SDK components のドキュメント](https://opentelemetry.io/docs/languages/java/sdk/#sdk-components)を参照してください。
>
{style="tip"}

## %plugin_name% のインストール {id="install_plugin"}

`%plugin_name%` プラグインをインストールするには、[クライアント構成ブロック](client-create-and-configure.md#configure-client)内で `install` 関数に渡し、[構成済みの `OpenTelemetry` インスタンス](#configure-otel)を設定します。

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

## トレーシングの構成 {id="configure-tracing"}

送信HTTP呼び出しに対してKtorクライアントがOpenTelemetryスパンを記録およびエクスポートする方法をカスタマイズできます。以下のオプションを使用して、どのリクエストをトレースするか、スパンにどのように名前を付けるか、どのような属性を含めるか、どのヘッダーをキャプチャするか、スパン種別（kind）をどのように決定するかを調整できます。

> これらの概念の詳細については、[OpenTelemetry tracing のドキュメント](https://opentelemetry.io/docs/concepts/signals/traces/)を参照してください。

### 追加のHTTPメソッドのトレース {id="config-known-methods"}

デフォルトでは、プラグインは標準のHTTPメソッド（`GET`、`POST`、`PUT` など）をトレースします。追加のメソッドやカスタムメソッドをトレースするには、`knownMethods` プロパティを構成します。

```kotlin
install(%plugin_name%) {
    // ...
    knownMethods(HttpMethod.DefaultMethods + CUSTOM_METHOD)
}
```
### ヘッダーのキャプチャ {id="config-request-headers"}

特定のHTTPリクエストヘッダーをスパン属性として含めるには、`capturedRequestHeaders` プロパティを使用します。

```kotlin
install(%plugin_name%) {
    // ...
    capturedRequestHeaders(HttpHeaders.UserAgent)
}
```

### レスポンスヘッダーのキャプチャ {id="capture-response-headers"}

特定のHTTPレスポンスヘッダーをスパン属性としてキャプチャするには、`capturedResponseHeaders` プロパティを使用します。

```kotlin
install(%plugin_name%) {
    // ...
    capturedResponseHeaders(HttpHeaders.ContentType, CUSTOM_HEADER)
}
```

### カスタム属性の追加 {id="config-custom-attributes"}

スパンの開始時または終了時にカスタム属性を付加するには、`attributesExtractor` プロパティを使用します。

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

## 次のステップ {id="next-steps"}

`%plugin_name%` のインストールと構成が完了したら、[`KtorServerTelemetry`](server-opentelemetry.md) を使用しているサービスなど、テレメトリが有効になっているサービスにリクエストを送信することで、スパンが作成されて伝播していることを確認できます。[Jaeger](https://www.jaegertracing.io/)、[Zipkin](https://zipkin.io/)、または [Grafana Tempo](https://grafana.com/oss/tempo/) などのオブザーバビリティバックエンドでトレースの両側を確認することで、分散トレーシングがエンドツーエンドで機能していることを確認できます。