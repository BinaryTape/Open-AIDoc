[//]: # (title: 압축)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="artifact_name" value="ktor-server-compression"/>
<var name="package_name" value="io.ktor.server.plugins.compression"/>
<var name="plugin_name" value="Compression"/>

<tldr>
<p>
<b>필수 의존성</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="compression"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor는 Kotlin/Native를 지원하며 추가 런타임이나 가상 머신 없이 서버를 실행할 수 있게 해줍니다.">네이티브 서버</Links> 지원</b>: ✖️
</p>
</tldr>

Ktor는 [`Compression`](https://api.ktor.io/ktor-server-compression/io.ktor.server.plugins.compression/-compression.html) 플러그인을 사용하여 응답 본문을 압축하고 요청 본문의 압축을 해제하는 기능을 제공합니다.

`Compression` 플러그인을 사용하면 다음과 같은 작업을 수행할 수 있습니다:
- `gzip`, `zstd`, `deflate`를 포함한 다양한 압축 알고리즘을 사용합니다.
- 콘텐츠 유형(content type)이나 응답 크기와 같이 데이터 압축에 필요한 조건을 지정합니다.
- 특정 요청 매개변수를 기반으로 데이터를 압축합니다.

> `%plugin_name%` 플러그인은 현재 `SSE` 응답을 지원하지 않습니다.
>
{style="warning"}

> Ktor에서 미리 압축된 정적 파일을 제공하는 방법을 알아보려면 [미리 압축된 파일](server-static-content.md#precompressed)을 참조하세요.

## 의존성 추가 {id="add_dependencies"}

<p>
    <code>%plugin_name%</code>을 사용하려면 빌드 스크립트에 <code>%artifact_name%</code> 아티팩트를 포함해야 합니다:
</p>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"/>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"/>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

Zstandard 압축을 포함하려면 `ktor-server-compression-zstd` 의존성을 추가하세요:

   <var name="artifact_name" value="ktor-server-compression-zstd"/>
   <Tabs group="languages">
       <TabItem title="Gradle (Kotlin)" group-key="kotlin">
           <code-block lang="Kotlin" code="               implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"/>
       </TabItem>
       <TabItem title="Gradle (Groovy)" group-key="groovy">
           <code-block lang="Groovy" code="               implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"/>
       </TabItem>
       <TabItem title="Maven" group-key="maven">
           <code-block lang="XML" code="               &lt;dependency&gt;&#10;                   &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                   &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                   &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;               &lt;/dependency&gt;"/>
       </TabItem>
   </Tabs>

## %plugin_name% 설치 {id="install_plugin"}

<p>
    애플리케이션에 <code>%plugin_name%</code> 플러그인을 <a href="#install">설치</a>하려면, 지정된 <Links href="/ktor/server-modules" summary="모듈을 사용하면 경로를 그룹화하여 애플리케이션을 구조화할 수 있습니다.">모듈</Links>의 <code>install</code> 함수에 전달하세요.
    아래 코드 스니펫은 <code>%plugin_name%</code>을 설치하는 방법을 보여줍니다...
</p>
<list>
    <li>
        ... <code>embeddedServer</code> 함수 호출 내부에서 설치.
    </li>
    <li>
        ... <code>Application</code> 클래스의 확장 함수인 명시적으로 정의된 <code>module</code> 내부에서 설치.
    </li>
</list>
<Tabs>
    <TabItem title="embeddedServer">
        <code-block lang="kotlin" code="            import io.ktor.server.engine.*&#10;            import io.ktor.server.netty.*&#10;            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;&#10;            fun main() {&#10;                embeddedServer(Netty, port = 8080) {&#10;                    install(%plugin_name%)&#10;                    // ...&#10;                }.start(wait = true)&#10;            }"/>
    </TabItem>
    <TabItem title="module">
        <code-block lang="kotlin" code="            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;            // ...&#10;            fun Application.module() {&#10;                install(%plugin_name%)&#10;                // ...&#10;            }"/>
    </TabItem>
</Tabs>

이렇게 하면 서버에서 `gzip`, `deflate`, `identity` 인코더가 활성화됩니다.

## 압축 설정 구성 {id="configure"}

다양한 방법으로 압축을 구성할 수 있습니다: 특정 인코더만 활성화하기, 우선순위 지정하기, 특정 콘텐츠 유형만 압축하기 등입니다.

### 특정 인코더 추가 {id="add_specific_encoders"}

특정 인코더만 활성화하려면 해당 확장 함수를 호출하세요. 예시는 다음과 같습니다:

```kotlin
install(Compression) {
    gzip()
    deflate()
    zstd()
}
```

`priority` 속성을 설정하여 각 압축 알고리즘의 우선순위를 지정할 수 있습니다:

```kotlin
install(Compression) {
    gzip {
        priority = 0.9
    }
    deflate {
        priority = 1.0
    }
    zstd {
        priority = 0.8
    }
}
```

위의 예제에서 `deflate`는 더 높은 우선순위 값을 가지며 `gzip` 및 `zstd`보다 우선합니다. 서버는 먼저 [Accept-Encoding](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Encoding) 헤더 내의 [품질(quality)](https://developer.mozilla.org/en-US/docs/Glossary/Quality_Values) 값을 확인한 다음, 지정된 우선순위를 고려합니다.

### 콘텐츠 유형 구성 {id="configure_content_type"}

기본적으로 Ktor는 `audio`, `video`, `image`, `text/event-stream`과 같은 특정 콘텐츠 유형을 압축하지 않습니다.
`matchContentType`을 호출하여 압축할 콘텐츠 유형을 선택하거나, `excludeContentType`을 사용하여 압축에서 제외할 미디어 유형을 지정할 수 있습니다. 아래 코드 스니펫은 `gzip`을 사용하여 JavaScript 코드를 압축하고, `deflate`를 사용하여 모든 텍스트 하위 유형을 압축하는 방법을 보여줍니다:

```kotlin
install(Compression) {
    gzip {
        matchContentType(
            ContentType.Application.JavaScript
        )
    }
    deflate {
        matchContentType(
            ContentType.Text.Any
        )
    }
}
```

전체 예제는 여기에서 확인할 수 있습니다: [compression](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/compression).

### 응답 크기 구성 {id="configure_response_size"}

`%plugin_name%` 플러그인을 사용하면 지정된 값을 초과하지 않는 크기의 응답에 대해 압축을 비활성화할 수 있습니다. 이를 위해 `minimumSize` 함수에 원하는 값(바이트 단위)을 전달하세요:

```kotlin
    install(Compression) {
    deflate {
        minimumSize(1024)
    }
}

```

### 사용자 정의 조건 지정 {id="specify_custom_conditions"}

필요한 경우 `condition` 함수를 사용하여 사용자 정의 조건을 제공하고 특정 요청 매개변수에 따라 데이터를 압축할 수 있습니다. 아래 코드 스니펫은 지정된 URI에 대한 요청을 압축하는 방법을 보여줍니다:

```kotlin
install(Compression) {
    gzip {
        condition {
            request.uri == "/orders"
        }
    }
}
```

## HTTPS 보안 {id="security"}

압축이 활성화된 HTTPS는 [BREACH](https://en.wikipedia.org/wiki/BREACH) 공격에 취약합니다. 이 공격을 완화하기 위해 다양한 방법을 사용할 수 있습니다. 예를 들어, 리퍼러(referrer) 헤더가 교차 사이트 요청(cross-site request)임을 나타낼 때마다 압축을 비활성화할 수 있습니다. Ktor에서는 리퍼러 헤더 값을 확인하여 이를 수행할 수 있습니다:

```kotlin
install(Compression) {
    gzip {
        condition {
            request.headers[HttpHeaders.Referrer]?.startsWith("https://my.domain/") == true
        }
    }
}
```

## Zstandard 압축 레벨 {id="compression_level"}

`level` 매개변수를 사용하여 `zstd`의 압축 레벨을 구성할 수 있습니다. 기본 압축 레벨은 `3`이지만, 필요에 따라 조정할 수 있습니다.

```kotlin
install(Compression) {
    // 기본값은 level = 3
    zstd(level = 20)
}
```

## 압축 해제 {id="decompression"}

기본적으로 `Compression` 플러그인은 서버 응답을 압축합니다. 요청 압축 해제를 활성화하려면 `mode` 속성을 `CompressionConfig.Mode.DecompressRequest`로 설정하세요:

```kotlin
install(Compression) { 
    mode = CompressionConfig.Mode.DecompressRequest
    gzip()
}
```

요청 압축 해제가 활성화되면, 플러그인은 구성된 디코더를 사용하여 역직렬화(deserialization) 및 멀티파트 처리와 같은 다른 수신 변환(receive transformations)에 의해 처리되기 전에 요청 본문의 압축을 해제합니다.

## 커스텀 인코더 구현 {id="custom_encoder"}

필요한 경우 [ContentEncoder](https://api.ktor.io/ktor-utils/io.ktor.util/-content-encoder/index.html) 인터페이스를 구현하여 자신만의 인코더를 제공할 수 있습니다.
구현 예시로 [GzipEncoder](https://github.com/ktorio/ktor/blob/b5b59ca3ae61601e6175f334e6a1252609638e61/ktor-server/ktor-server-plugins/ktor-server-compression/jvm/src/io/ktor/server/plugins/compression/Encoders.kt#L41)를 참조하세요.