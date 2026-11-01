[//]: # (title: 콘텐츠 인코딩)

<primary-label ref="client-plugin"/>

<var name="artifact_name" value="ktor-client-encoding"/>
<var name="ktor_version_catalog_name" value="ktorLibs.client.encoding"/>

<tldr>
<p>
<b>필수 의존성</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="client-content-encoding"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
ContentEncoding 플러그인을 사용하면 지정된 압축 알고리즘('gzip' 및 'deflate' 등)을 활성화하고 관련 설정을 구성할 수 있습니다.
</link-summary>

Ktor 클라이언트는 지정된 압축 알고리즘(`gzip` 및 `deflate` 등)을 활성화하고 해당 설정을 구성할 수 있는 [`ContentEncoding`](https://api.ktor.io/ktor-client-encoding/io.ktor.client.plugins.compression/-content-encoding) 플러그인을 제공합니다. 

이 플러그인은 다음과 같은 기능을 제공합니다:
* 지정된 품질 값(quality value)과 함께 `Accept-Encoding` 헤더를 설정합니다.
* 선택적으로 요청 본문을 인코딩합니다.
* 원본 페이로드를 얻기 위해 [서버로부터 수신한 콘텐츠](client-responses.md#body)를 디코딩(압축 해제)합니다.

## 의존성 추가 {id="add_dependencies"}

`ContentEncoding`을 사용하려면 빌드 스크립트에 `%artifact_name%` 아티팩트를 추가합니다:

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            위 코드 조각은 Ktor 의존성을 지정하기 위해 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 버전 카탈로그</a>를 사용합니다.
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            위 코드 조각은 Ktor 의존성을 지정하기 위해 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 버전 카탈로그</a>를 사용합니다.
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>
<tip>
    Ktor 클라이언트에 필요한 아티팩트에 대한 자세한 내용은 <Links href="client-dependencies.md" summary="기존 프로젝트에 클라이언트 의존성을 추가하는 방법을 알아봅니다.">클라이언트 의존성 추가</Links>를 참조하세요.
</tip>

## `ContentEncoding` 설치 {id="install_plugin"}

`ContentEncoding`을 설치하려면 [클라이언트 구성 블록](client-create-and-configure.md#configure-client) 내부의 `install` 함수에 전달합니다:

```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.compression.*
//...
val client = HttpClient(CIO) {
    install(ContentEncoding)
}
```

## `ContentEncoding` 구성 {id="configure_plugin"}

### 인코더 활성화 {id="enable-encoders"}

지원할 인코더를 구성하고 품질 값(`Accept-Encoding` 헤더에 사용됨)을 지정할 수 있습니다.

아래 [예제](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-content-encoding)는 사용자 지정 품질 값으로 `deflate` 및 `gzip` 인코더를 활성화합니다:

```kotlin
val client = HttpClient(CIO) {
    install(ContentEncoding) {
        deflate(1.0F)
        gzip(0.9F)
    }
}
```

필요한 경우 [`ContentEncoder`](https://api.ktor.io/ktor-utils/io.ktor.util/-content-encoder/index.html) 인터페이스를 구현하여 커스텀 인코더를 생성하고 `customEncoder()` 함수를 사용하여 등록할 수 있습니다.

### `mode` 프로퍼티 설정 {id="set-the-mode-property"}

기본적으로 `ContentEncoding`은 응답 압축 해제만 처리합니다. `mode` 프로퍼티를 사용하여 플러그인의 동작 방식을 정의할 수 있습니다.

사용 가능한 값은 다음과 같습니다:
<deflist>
<def>
<title><code>ContentEncodingConfig.Mode.DecompressResponse</code></title>
응답만 압축 해제합니다. 기본 모드입니다.
</def>
<def>
<title><code>ContentEncodingConfig.Mode.CompressRequest</code></title>
요청 본문 압축만 활성화합니다.
</def>
<def>
<title><code>ContentEncodingConfig.Mode.All</code></title>
응답 압축 해제와 요청 압축을 모두 활성화합니다.
</def>
</deflist>

## 요청 본문 인코딩 {id="encode_request_body"}

요청 압축을 활성화하려면 `mode` 프로퍼티를 설정하고 [`HttpRequestBuilder`](https://api.ktor.io/ktor-client-core/io.ktor.client.request/-http-request-builder/index.html) 블록 내부에서 `compress()` 함수를 사용합니다:

```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.compression.*
//...
val client = HttpClient(CIO) {
    install(ContentEncoding) {
        mode = ContentEncodingConfig.Mode.CompressRequest
        gzip()
    }
}
client.post("/upload") {
    compress("gzip")
    setBody(someLongBody)
}
```

이 예제에서:

* `mode = ContentEncodingConfig.Mode.CompressRequest`는 요청 압축을 활성화합니다.
* `gzip()`은 gzip 인코더를 등록합니다.
* `compress("gzip")`은 이 특정 요청에 gzip 압축을 적용합니다.
* `Content-Encoding` 헤더가 자동으로 추가됩니다.

> 응답 처리에 대한 자세한 내용은 [응답 수신](client-responses.md)을 참조하세요.
>
{style="tip"}