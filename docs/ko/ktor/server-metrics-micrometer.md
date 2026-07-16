[//]: # (title: Micrometer 메트릭)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

[micrometer_jvm_metrics]: https://micrometer.io/docs/ref/jvm

<var name="package_name" value="io.ktor.server.metrics.micrometer"/>

<tldr>
<p>
<b>필수 의존성</b>: <code>io.ktor:ktor-server-metrics-micrometer</code>
</p>
<var name="example_name" value="micrometer-metrics"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor는 Kotlin/Native를 지원하며 추가 런타임이나 가상 머신 없이 서버를 실행할 수 있게 해줍니다.">Native 서버</Links> 지원</b>: ✖️
</p>
</tldr>

<link-summary>MicrometerMetrics 플러그인은 Ktor 서버 애플리케이션에서 Micrometer 메트릭을 활성화하며 Prometheus, JMX, Elastic 등 필요한 모니터링 시스템을 선택할 수 있게 해줍니다.</link-summary>

[MicrometerMetrics](https://api.ktor.io/ktor-server-metrics-micrometer/io.ktor.server.metrics.micrometer/-micrometer-metrics) 플러그인은 Ktor 서버 애플리케이션에서 [Micrometer](https://micrometer.io/docs) 메트릭을 활성화하며 Prometheus, JMX, Elastic 등 필요한 모니터링 시스템을 선택할 수 있게 해줍니다. 기본적으로 Ktor는 HTTP 요청 모니터링을 위한 메트릭과 [JVM 모니터링][micrometer_jvm_metrics]을 위한 일련의 저수준 메트릭을 노출합니다. 이러한 메트릭을 사용자 정의하거나 새로운 메트릭을 생성할 수 있습니다.

## 의존성 추가 {id="add_dependencies"}
`MicrometerMetrics`를 활성화하려면 빌드 스크립트에 다음 아티팩트를 포함해야 합니다:
* `ktor-server-metrics-micrometer` 의존성 추가:

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
  
* 모니터링 시스템에 필요한 의존성을 추가합니다. 아래 예제는 Prometheus용 아티팩트를 추가하는 방법을 보여줍니다:

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
  
  `$prometheus_version`을 `micrometer-registry-prometheus` 아티팩트의 필요한 버전(예: `%prometheus_version%`)으로 교체할 수 있습니다.

## MicrometerMetrics 설치 {id="install_plugin"}

<var name="plugin_name" value="MicrometerMetrics"/>
<p>
    애플리케이션에 <code>%plugin_name%</code> 플러그인을 <a href="#install">설치</a>하려면,
    지정된 <Links href="/ktor/server-modules" summary="모듈을 사용하면 라우트를 그룹화하여 애플리케이션을 구조화할 수 있습니다.">모듈</Links> 내의 <code>install</code> 함수에 전달하십시오.
    아래 코드 스니펫은 <code>%plugin_name%</code>을 설치하는 방법을 보여줍니다...
</p>
<list>
    <li>
        ... <code>embeddedServer</code> 함수 호출 내부에서 설치.
    </li>
    <li>
        ... Application 클래스의 확장 함수인 명시적으로 정의된 <code>module</code> 내부에서 설치.
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

### 노출되는 메트릭 {id="ktor_metrics"}
Ktor는 HTTP 요청 모니터링을 위해 다음 메트릭을 노출합니다:
* `ktor.http.server.requests.active`: 동시 HTTP 요청 수를 측정하는 [게이지(gauge)](https://micrometer.io/docs/concepts#_gauges)입니다. 이 메트릭은 태그를 제공하지 않습니다.
* `ktor.http.server.requests`: 각 요청의 시간을 측정하는 [타이머(timer)](https://micrometer.io/docs/concepts#_timers)입니다. 이 메트릭은 요청된 URL의 `address`, HTTP 메서드의 `method`, 요청을 처리하는 Ktor 라우트의 `route` 등 요청 데이터를 모니터링하기 위한 태그 세트를 제공합니다.

`metricName` [구성](#configure_metrics) 속성을 사용하여 기본 `ktor.http.server.requests` 접두사를 사용자 정의할 수 있습니다.

> 메트릭 이름은 구성된 모니터링 시스템에 따라 [다를](https://micrometer.io/docs/concepts#_naming_meters) 수 있습니다.

HTTP 메트릭 외에도 Ktor는 [JVM 모니터링](#jvm_metrics)을 위한 일련의 메트릭을 노출합니다.

## 레지스트리 생성 {id="create_registry"}

`MicrometerMetrics`를 설치한 후에는 [모니터링 시스템을 위한 레지스트리](https://micrometer.io/docs/concepts#_registry)를 생성하고 이를 `registry` 속성에 할당해야 합니다. 아래 예제에서는 서로 다른 [라우트 핸들러](server-routing.md)에서 이 레지스트리를 재사용할 수 있도록 `install` 블록 외부에서 `PrometheusMeterRegistry`를 생성합니다:

```kotlin
fun Application.module() {
    val appMicrometerRegistry = PrometheusMeterRegistry(PrometheusConfig.DEFAULT)
    install(MicrometerMetrics) {
        registry = appMicrometerRegistry
    }
}
```

## 메트릭 구성 {id="configure_metrics"}

`MicrometerMetrics` 플러그인은 [MicrometerMetricsConfig](https://api.ktor.io/ktor-server-metrics-micrometer/io.ktor.server.metrics.micrometer/-micrometer-metrics-config/index.html)를 통해 액세스할 수 있는 다양한 구성 옵션을 제공합니다.

### 타이머 {id="timers"}
각 타이머의 태그를 사용자 정의하려면 각 요청마다 호출되는 `timers` 함수를 사용할 수 있습니다:
```kotlin
install(MicrometerMetrics) {
    // ...
    timers { call, exception ->
        tag("region", call.request.headers["regionId"])
    }
}
```

### 분포 통계 {id="distribution_statistics"}
`distributionStatisticConfig` 속성을 사용하여 [분포 통계(distribution statistics)](https://micrometer.io/docs/concepts#_configuring_distribution_statistics)를 구성할 수 있습니다. 예시는 다음과 같습니다:

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

### JVM 및 시스템 메트릭 {id="jvm_metrics"}
[HTTP 메트릭](#ktor_metrics) 외에도 Ktor는 [JVM 모니터링][micrometer_jvm_metrics]을 위한 일련의 메트릭을 노출합니다. `meterBinders` 속성을 사용하여 이러한 메트릭 목록을 사용자 정의할 수 있습니다. 예시는 다음과 같습니다:

```kotlin
install(MicrometerMetrics) {
    meterBinders = listOf(
        JvmMemoryMetrics(),
        JvmGcMetrics(),
        ProcessorMetrics()
    )
}
```

빈 목록을 할당하여 이러한 메트릭을 완전히 비활성화할 수도 있습니다.

## Prometheus: 스크랩 엔드포인트 노출 {id="prometheus_endpoint"}
Prometheus를 모니터링 시스템으로 사용하는 경우, Prometheus 스크래퍼(scraper)를 위한 HTTP 엔드포인트를 노출해야 합니다. Ktor에서는 다음과 같은 방법으로 이를 수행할 수 있습니다:
1. 필요한 주소(아래 예제에서는 `/metrics`)로 GET 요청을 허용하는 전용 [라우트](server-routing.md)를 생성합니다.
2. `call.respond`를 사용하여 스크래핑 데이터를 Prometheus로 전송합니다.

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

   전체 예제는 여기에서 확인할 수 있습니다: [micrometer-metrics](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/micrometer-metrics).