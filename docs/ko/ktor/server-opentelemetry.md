[//]: # (title: Ktor 서버의 OpenTelemetry를 이용한 분산 추적)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>
<var name="plugin_name" value="KtorServerTelemetry"/>
<var name="package_name" value="io.opentelemetry.instrumentation"/>
<var name="artifact_name" value="opentelemetry-ktor-3.0"/>

<tldr>
<p>
<b>필수 의존성</b>: <code>io.opentelemetry.instrumentation:opentelemetry-ktor-3.0</code>
</p>
<var name="example_name" value="opentelemetry"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<snippet id="opentelemetry-description">

Ktor는 트레이스(trace), 메트릭(metric), 로그(log)와 같은 텔레메트리 데이터를 수집하기 위한 오픈 소스 관측성(observability) 프레임워크인 [OpenTelemetry](https://opentelemetry.io/)와 통합됩니다. 이는 애플리케이션을 계측(instrument)하고 Grafana나 Jaeger와 같은 모니터링 및 관측성 도구로 데이터를 내보내는 표준 방법을 제공합니다.

</snippet>

`%plugin_name%` 플러그인은 Ktor 서버 애플리케이션에서 들어오는 HTTP 요청의 분산 추적을 가능하게 합니다. 이 플러그인은 경로(route), HTTP 메서드 및 상태 코드 정보를 포함하는 [스팬(span)](https://opentelemetry.io/docs/concepts/signals/traces/#spans)을 자동으로 생성하고, 들어오는 요청 헤더에서 기존 트레이스 컨텍스트를 추출하며, 스팬 이름, 속성(attribute) 및 스팬 종류(span kind)를 사용자 정의할 수 있도록 합니다.

> 클라이언트 측에서 OpenTelemetry는 외부 서비스로의 나가는 HTTP 호출에 대한 트레이스를 수집하는 [KtorClientTelemetry](client-opentelemetry.md) 플러그인을 제공합니다.

## 의존성 추가 {id="add_dependencies"}

<p>
    <code>%plugin_name%</code>을 사용하려면 빌드 스크립트에 <code>%artifact_name%</code> 아티팩트를 포함해야 합니다:
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

## OpenTelemetry 구성 {id="configure-otel"}

Ktor 애플리케이션에 `%plugin_name%` 플러그인을 설치하기 전에 `OpenTelemetry` 인스턴스를 구성하고 초기화해야 합니다. 이 인스턴스는 트레이스와 메트릭을 포함한 텔레메트리 데이터를 관리하는 역할을 합니다.

### 자동 구성

OpenTelemetry를 구성하는 일반적인 방법은 [`AutoConfiguredOpenTelemetrySdk`](https://javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-extension-autoconfigure/latest/io/opentelemetry/sdk/autoconfigure/AutoConfiguredOpenTelemetrySdk.html)를 사용하는 것입니다. 이는 시스템 속성과 환경 변수를 기반으로 익스포터(exporter)와 리소스를 자동으로 구성하여 설정을 단순화합니다.

자동으로 감지된 구성을 여전히 사용자 정의할 수 있습니다. 예를 들어 `service.name` 리소스 속성을 추가할 수 있습니다:

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

### 프로그래밍 방식 구성

환경 기반 구성에 의존하는 대신 코드에서 익스포터, 프로세서 및 프로파게이터(propagator)를 정의하려면 [`OpenTelemetrySdk`](https://javadoc.io/doc/io.opentelemetry/opentelemetry-sdk/latest/io/opentelemetry/sdk/OpenTelemetrySdk.html)를 사용할 수 있습니다.

다음 예제는 OTLP 익스포터, 스팬 프로세서 및 트레이스 컨텍스트 프로파게이터를 사용하여 프로그래밍 방식으로 OpenTelemetry를 구성하는 방법을 보여줍니다:

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

텔레메트리 설정에 대한 완전한 제어가 필요하거나 배포 환경이 자동 구성에 의존할 수 없는 경우 이 접근 방식을 사용하세요.

> 자세한 내용은 [OpenTelemetry SDK 구성 요소 문서](https://opentelemetry.io/docs/languages/java/sdk/#sdk-components)를 참조하십시오.
>
{style="tip"}

## %plugin_name% 설치 {id="install_plugin"}

애플리케이션에 `%plugin_name%` 플러그인을 [설치](server-plugins.md#install)하려면, 지정된 [모듈](server-modules.md)에서 `install` 함수에 이를 전달하고 [구성된 `OpenTelemetry` 인스턴스](#configure-otel)를 설정합니다:

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

> %plugin_name%이 다른 로깅이나 텔레메트리 관련 플러그인보다 먼저 설치되었는지 확인하세요.
>
{style="note"}

## 추적 구성 {id="configuration"}

Ktor 서버가 OpenTelemetry 스팬을 기록하고 내보내는 방식을 사용자 정의할 수 있습니다. 아래 옵션을 사용하면 추적할 요청, 스팬 이름 지정 방식, 포함할 속성, 스팬 종류 결정 방식을 조정할 수 있습니다.

> 이러한 개념에 대한 자세한 내용은 [OpenTelemetry 추적 문서](https://opentelemetry.io/docs/concepts/signals/traces/)를 참조하십시오.

### 추가 HTTP 메서드 추적 {id="config-known-methods"}

기본적으로 플러그인은 표준 HTTP 메서드(`GET`, `POST`, `PUT` 등)를 추적합니다. 추가적인 또는 사용자 정의 메서드를 추적하려면 `knownMethods` 속성을 구성하십시오:

```kotlin
install(%plugin_name%) {
    // ...
    knownMethods(HttpMethod.DefaultMethods + CUSTOM_METHOD)
}
```

### 헤더 캡처 {id="config-request-headers"}

특정 HTTP 요청 헤더를 스팬 속성으로 포함하려면 `capturedRequestHeaders` 속성을 사용하십시오:

```kotlin
install(%plugin_name%) {
    // ...
    capturedRequestHeaders(HttpHeaders.UserAgent)
}
```

### 스팬 종류 선택 {id="config-span-kind"}

요청 특성에 따라 스팬 종류(`SERVER`, `CLIENT`, `PRODUCER`, `CONSUMER` 등)를 재정의하려면 `spanKindExtractor` 속성을 사용하십시오:

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

### 사용자 정의 속성 추가 {id="config-custom-attributes"}

스팬의 시작 또는 종료 시점에 사용자 정의 속성을 첨부하려면 `attributesExtractor` 속성을 사용하십시오:

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

### 추가 속성 {id="additional-properties"}

애플리케이션 전반에서 추적 동작을 미세 조정하기 위해 프로파게이터, 속성 제한, 계측 활성화/비활성화와 같은 추가 OpenTelemetry 속성을 구성할 수도 있습니다. 자세한 내용은 [OpenTelemetry Java 구성 가이드](https://opentelemetry.io/docs/languages/java/configuration/)를 참조하십시오.

## Grafana LGTM으로 텔레메트리 데이터 확인

텔레메트리 데이터를 시각화하고 확인하려면 트레이스, 메트릭 및 로그를 Grafana와 같은 분산 추적 백엔드로 내보낼 수 있습니다. `grafana/otel-lgtm` 올인원(all-in-one) 이미지는 [Grafana](https://grafana.com/), [Tempo](https://grafana.com/oss/tempo/)(트레이스), [Loki](https://grafana.com/oss/loki/)(로그) 및 [Mimir](https://grafana.com/oss/mimir/)(메트릭)를 번들로 제공합니다.

### Docker Compose 사용

다음 내용으로 **docker-compose.yml** 파일을 만듭니다:

```yaml
services:
  grafana-lgtm:
    image: grafana/otel-lgtm:latest
    ports:
      - "4317:4317"   # OTLP gRPC 수신기 (트레이스, 메트릭, 로그)
      - "4318:4318"   # OTLP HTTP 수신기
      - "3000:3000"   # Grafana UI
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin
    restart: unless-stopped
```

Grafana LGTM 올인원 컨테이너를 시작하려면 다음 명령을 실행하십시오:

```shell
docker compose up -d
```

### Docker CLI 사용

또는 Docker 명령줄을 사용하여 Grafana를 직접 실행할 수 있습니다:

```shell
docker run -d --name grafana_lgtm \
    -p 4317:4317 \   # OTLP gRPC 수신기 (트레이스, 메트릭, 로그)
    -p 4318:4318 \   # OTLP HTTP 수신기
    -p 3000:3000 \   # Grafana UI
    -e GF_SECURITY_ADMIN_USER=admin \
    -e GF_SECURITY_ADMIN_PASSWORD=admin \
    grafana/otel-lgtm:latest
```

### 애플리케이션 내보내기 구성

Ktor 애플리케이션에서 OTLP 엔드포인트로 텔레메트리를 보내려면 gRPC 프로토콜을 사용하도록 OpenTelemetry SDK를 구성하십시오. SDK를 빌드하기 전에 환경 변수를 통해 이러한 값을 설정할 수 있습니다:

```shell
export OTEL_TRACES_EXPORTER=otlp
export OTEL_EXPORTER_OTLP_PROTOCOL=grpc
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
```

또는 JVM 플래그를 사용하십시오:

```text
-Dotel.traces.exporter=otlp -Dotel.exporter.otlp.protocol=grpc -Dotel.exporter.otlp.endpoint=http://localhost:4317
```

### Grafana UI 접속

실행되면 Grafana UI는 [http://localhost:3000/](http://localhost:3000/)에서 사용할 수 있습니다.

<procedure>
    <step>
        [http://localhost:3000/](http://localhost:3000/)에서 Grafana UI를 엽니다.
    </step>
    <step>
        기본 자격 증명으로 로그인합니다:
        <list>
            <li><ui-path>User:</ui-path><code>admin</code></li>
            <li><ui-path>Password:</ui-path><code>admin</code></li>
        </list>
    </step>
    <step>
        왼쪽 탐색 메뉴에서 <ui-path>Drilldown → Traces</ui-path>로 이동합니다:
        <img src="opentelemetry-grafana-ui.png" alt="Grafana UI Drilldown 트레이스 뷰" width="706" corners="rounded"/>
        <ui-path>Traces</ui-path> 뷰에서는 다음을 수행할 수 있습니다:
        <list>
            <li>Rate, Errors 또는 Duration 메트릭을 선택합니다.</li>
            <li>스팬 필터(예: 서비스 이름 또는 스팬 이름별)를 적용하여 데이터를 좁힙니다.</li>
            <li>트레이스를 보고, 세부 정보를 조사하며, 스팬 타임라인과 상호 작용합니다.</li>
        </list>
    </step>
</procedure>