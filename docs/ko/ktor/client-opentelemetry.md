[//]: # (title: Ktor Client에서 OpenTelemetry를 사용한 분산 추적)

<show-structure for="chapter" depth="2"/>
<primary-label ref="client-plugin"/>
<var name="plugin_name" value="KtorClientTelemetry"/>

<tldr>
<p>
<b>필수 종속성</b>: <code>io.opentelemetry.instrumentation:opentelemetry-ktor-3.0</code>
</p>
<var name="example_name" value="opentelemetry"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

Ktor는 트레이스(trace), 메트릭(metric), 로그(log)와 같은 텔레메트리 데이터를 수집하기 위한 오픈 소스 관찰 가능성(observability) 프레임워크인 [OpenTelemetry](https://opentelemetry.io/)와 연동됩니다. OpenTelemetry는 애플리케이션을 계측(instrument)하고 Grafana나 Jaeger와 같은 모니터링 및 관찰 가능성 도구로 데이터를 내보내는 표준적인 방법을 제공합니다.

`%plugin_name%` 플러그인을 사용하면 나가는(outgoing) HTTP 요청을 자동으로 추적할 수 있습니다. 메서드, URL, 상태 코드와 같은 메타데이터를 캡처하고 여러 서비스 간에 트레이스 컨텍스트를 전파합니다. 또한 스팬 속성(span attributes)을 커스터마이징하거나 자체 OpenTelemetry 구성을 사용할 수도 있습니다.

> 서버에서는 OpenTelemetry가 서버로 들어오는 HTTP 요청을 계측할 수 있도록 [KtorServerTelemetry](server-opentelemetry.md) 플러그인을 제공합니다.

## 종속성 추가 {id="add_dependencies"}

<p>
    <code>%plugin_name%</code>을(를) 사용하려면 빌드 스크립트에 <code>%artifact_name%</code> 아티팩트를 추가하세요:
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
## OpenTelemetry 구성 {id="configure-otel"}

Ktor 애플리케이션에 `%plugin_name%` 플러그인을 설치하기 전에 `OpenTelemetry` 인스턴스를 구성하고 초기화해야 합니다. 이 인스턴스는 트레이스와 메트릭을 포함한 텔레메트리 데이터를 관리하는 역할을 담당합니다.

### 자동 구성 {id="automatic-configuration"}

OpenTelemetry를 구성하는 일반적인 방법은 [`AutoConfiguredOpenTelemetrySdk`](https://javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-extension-autoconfigure/latest/io/opentelemetry/sdk/autoconfigure/AutoConfiguredOpenTelemetrySdk.html)를 사용하는 것입니다. 이를 통해 시스템 속성과 환경 변수를 기반으로 익스포터(exporter) 및 리소스를 자동으로 구성하여 설정을 단순화할 수 있습니다.

자동으로 감지된 구성을 커스터마이징할 수도 있습니다. 예를 들어 `service.name` 리소스 속성을 추가하는 방식입니다:

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

### 프로그래밍 방식 구성 {id="programmatic-configuration"}

환경 기반 구성에 의존하는 대신 코드에서 직접 익스포터, 프로세서, 프로파게이터를 정의하려면 [`OpenTelemetrySdk`](https://javadoc.io/doc/io.opentelemetry/opentelemetry-sdk/latest/io/opentelemetry/sdk/OpenTelemetrySdk.html)를 사용할 수 있습니다.

다음 예제는 OTLP 익스포터, 스팬 프로세서, 트레이스 컨텍스트 프로파게이터를 사용하여 프로그래밍 방식으로 OpenTelemetry를 구성하는 방법을 보여줍니다:

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

텔레메트리 설정을 완벽하게 제어해야 하거나 배포 환경에서 자동 구성에 의존할 수 없는 경우 이 방식을 사용하세요.

> 자세한 내용은 [OpenTelemetry SDK 컴포넌트 문서](https://opentelemetry.io/docs/languages/java/sdk/#sdk-components)를 참조하세요.
>
{style="tip"}

## %plugin_name% 설치 {id="install_plugin"}

`%plugin_name%` 플러그인을 설치하려면 [클라이언트 구성 블록](client-create-and-configure.md#configure-client) 내부의 `install` 함수에 전달하고 [구성된 `OpenTelemetry` 인스턴스](#configure-otel)를 설정하세요:

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

## 트레이싱 구성 {id="configure-tracing"}

Ktor 클라이언트가 나가는 HTTP 호출에 대해 OpenTelemetry 스팬을 기록하고 내보내는 방식을 커스터마이징할 수 있습니다. 아래 옵션을 사용하여 어떤 요청을 추적할지, 스팬의 이름을 어떻게 지정할지, 어떤 속성을 포함할지, 어떤 헤더를 캡처할지, 스팬 종류(kind)를 어떻게 결정할지 조정할 수 있습니다.

> 이러한 개념에 대한 자세한 내용은 [OpenTelemetry 트레이싱 문서](https://opentelemetry.io/docs/concepts/signals/traces/)를 참조하세요.

### 추가 HTTP 메서드 추적 {id="config-known-methods"}

기본적으로 플러그인은 표준 HTTP 메서드(`GET`, `POST`, `PUT` 등)를 추적합니다. 추가 메서드나 커스텀 메서드를 추적하려면 `knownMethods` 프로퍼티를 구성하세요:

```kotlin
install(%plugin_name%) {
    // ...
    knownMethods(HttpMethod.DefaultMethods + CUSTOM_METHOD)
}
```
### 요청 헤더 캡처 {id="config-request-headers"}

특정 HTTP 요청 헤더를 스팬 속성으로 포함하려면 `capturedRequestHeaders` 프로퍼티를 사용하세요:

```kotlin
install(%plugin_name%) {
    // ...
    capturedRequestHeaders(HttpHeaders.UserAgent)
}
```

### 응답 헤더 캡처 {id="capture-response-headers"}

특정 HTTP 응답 헤더를 스팬 속성으로 캡처하려면 `capturedResponseHeaders` 프로퍼티를 사용하세요:

```kotlin
install(%plugin_name%) {
    // ...
    capturedResponseHeaders(HttpHeaders.ContentType, CUSTOM_HEADER)
}
```

### 커스텀 속성 추가 {id="config-custom-attributes"}

스팬의 시작 또는 종료 시점에 커스텀 속성을 추가하려면 `attributesExtractor` 프로퍼티를 사용하세요:

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

## 다음 단계 {id="next-steps"}

%plugin_name%을(를) 설치하고 구성한 후에는 [`KtorServerTelemetry`](server-opentelemetry.md)를 사용하는 서비스와 같이 텔레메트리가 활성화된 서비스로 요청을 전송하여 스팬이 생성되고 전파되는지 확인할 수 있습니다. [Jaeger](https://www.jaegertracing.io/), [Zipkin](https://zipkin.io/) 또는 [Grafana Tempo](https://grafana.com/oss/tempo/)와 같은 관찰 가능성 백엔드에서 트레이스의 양쪽 측면을 확인하면 분산 추적이 엔드투엔드(end-to-end)로 작동하는지 검증할 수 있습니다.