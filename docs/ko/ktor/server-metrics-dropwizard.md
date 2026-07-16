[//]: # (title: Dropwizard 메트릭)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="DropwizardMetrics"/>
<var name="package_name" value="io.ktor.server.metrics.dropwizard"/>
<var name="artifact_name" value="ktor-server-metrics"/>

<tldr>
<p>
<b>필수 의존성</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="dropwizard-metrics"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">Native 서버</Links> 지원</b>: ✖️
</p>
</tldr>

<link-summary>%plugin_name% 플러그인을 사용하면 Metrics 라이브러리를 구성하여 서버 및 들어오는 요청에 대한 유용한 정보를 얻을 수 있습니다.</link-summary>

[%plugin_name%](https://api.ktor.io/ktor-server-metrics/io.ktor.server.metrics.dropwizard/-dropwizard-metrics.html) 플러그인을 사용하면 [Metrics](http://metrics.dropwizard.io/) 라이브러리를 구성하여 서버 및 들어오는 요청에 대한 유용한 정보를 얻을 수 있습니다.

## 의존성 추가 {id="add_dependencies"}
`%plugin_name%`을 활성화하려면 빌드 스크립트에 다음 아티팩트를 포함해야 합니다:
* `%artifact_name%` 의존성을 추가합니다:

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

* 선택적으로, 특정 리포터에 필요한 의존성을 추가합니다. 아래 예제는 JMX를 통해 메트릭을 보고하는 데 필요한 아티팩트를 추가하는 방법을 보여줍니다:

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
  
  `$dropwizard_version`을 `metrics-jmx` 아티팩트의 필요한 버전(예: `%dropwizard_version%`)으로 교체할 수 있습니다.

## %plugin_name% 설치 {id="install_plugin"}

<p>
    애플리케이션에 <code>%plugin_name%</code> 플러그인을 <a href="#install">설치(install)</a>하려면,
    지정된 <Links href="/ktor/server-modules" summary="Modules allow you to structure your application by grouping routes.">모듈(module)</Links>의 <code>install</code> 함수에 전달하세요.
    아래 코드 스니펫은 <code>%plugin_name%</code>을 설치하는 방법을 보여줍니다...
</p>
<list>
    <li>
        ... <code>embeddedServer</code> 함수 호출 내부에서.
    </li>
    <li>
        ... <code>Application</code> 클래스의 확장 함수인 명시적으로 정의된 <code>module</code> 내부에서.
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

## %plugin_name% 구성 {id="configure_plugin"}

`%plugin_name%`은 `registry` 프로퍼티를 사용하여 지원되는 모든 [Metric 리포터](http://metrics.dropwizard.io/)를 사용할 수 있게 해줍니다. SLF4J 및 JMX 리포터를 구성하는 방법을 살펴보겠습니다.

### SLF4J 리포터 {id="slf4j"}

SLF4J 리포터를 사용하면 SLF4J가 지원하는 모든 출력으로 보고서를 주기적으로 내보낼 수 있습니다.
예를 들어, 10초마다 메트릭을 출력하려면 다음과 같이 합니다:

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

전체 예제는 여기에서 찾을 수 있습니다: [dropwizard-metrics](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/dropwizard-metrics).

애플리케이션을 실행하고 [http://0.0.0.0:8080](http://0.0.0.0:8080)을 열면, 출력은 다음과 같습니다:

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

### JMX 리포터 {id="jmx"}

JMX 리포터를 사용하면 모든 메트릭을 JMX에 노출하여 `jconsole`을 통해 해당 메트릭을 볼 수 있습니다.

```kotlin
install(DropwizardMetrics) {
    JmxReporter.forRegistry(registry)
        .convertRatesTo(TimeUnit.SECONDS)
        .convertDurationsTo(TimeUnit.MILLISECONDS)
        .build()
        .start()
}
```

전체 예제는 여기에서 찾을 수 있습니다: [dropwizard-metrics](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/dropwizard-metrics).

애플리케이션을 실행하고 [JConsole](https://docs.oracle.com/en/java/javase/17/management/using-jconsole.html)을 사용하여 해당 프로세스에 연결하면, 메트릭은 다음과 같이 표시됩니다:

![Ktor Metrics: JMX](jmx.png){width="758"}

## 노출된 메트릭 {id="exposed-metrics"}

`%plugin_name%`은 다음 메트릭을 노출합니다:

- Ktor 전용 및 [JVM 메트릭](#jvm-metrics)을 포함하는 [전역 메트릭](#global-metrics).
- [엔드포인트용 메트릭](#endpoint-metrics).

### 전역 메트릭 {id="global-metrics"}

전역 메트릭에는 다음과 같은 Ktor 전용 메트릭이 포함됩니다:

* `ktor.calls.active`:`Count` - 완료되지 않은 활성 요청의 수.
* `ktor.calls.duration` - 호출 기간에 대한 정보.
* `ktor.calls.exceptions` - 예외 발생 횟수에 대한 정보.
* `ktor.calls.status.NNN` - 특정 HTTP 상태 코드 `NNN`이 발생한 횟수에 대한 정보.

메트릭 이름은 `ktor.calls` 접두사로 시작됩니다. `baseName` 프로퍼티를 사용하여 이를 커스텀할 수 있습니다:

```kotlin
install(DropwizardMetrics) {
    baseName = "my.prefix"
}
```

### 엔드포인트별 메트릭 {id="endpoint-metrics"}

* `"/uri(method:VERB).NNN"` - 이 경로와 동사(verb)에 대해 특정 HTTP 상태 코드 `NNN`이 발생한 횟수에 대한 정보.
* `"/uri(method:VERB).meter"` - 이 경로와 동사에 대한 호출 횟수에 대한 정보.
* `"/uri(method:VERB).timer"` - 이 엔드포인트의 기간(duration)에 대한 정보.

### JVM 메트릭 {id="jvm-metrics"}

HTTP 메트릭 외에도 Ktor는 JVM 모니터링을 위한 일련의 메트릭을 노출합니다. `registerJvmMetricSets` 프로퍼티를 사용하여 이러한 메트릭을 비활성화할 수 있습니다:

```kotlin
install(DropwizardMetrics) {
    registerJvmMetricSets = false
}
```

전체 예제는 여기에서 찾을 수 있습니다: [dropwizard-metrics](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/dropwizard-metrics).