[//]: # (title: BOM 제거기)

<var name="artifact_name" value="ktor-client-bom-remover"/>
<primary-label ref="client-plugin"/>

<tldr>
<p>
<b>필수 의존성</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="client-bom-remover"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
BOMRemover 플러그인을 사용하면 응답 본문(response body)에서 BOM(Byte Order Mark)을 제거할 수 있습니다.
</link-summary>

[BOM(Byte Order Mark)](https://en.wikipedia.org/wiki/Byte_order_mark)은 유니코드 파일이나 스트림에 인코딩된 문자입니다. BOM의 주요 목적은 텍스트의 스트림 인코딩과 16비트 및 32비트 인코딩의 바이트 순서(byte order)를 알리는 것입니다.

어떤 경우에는 응답 본문에서 BOM을 제거해야 할 필요가 있습니다. 예를 들어, UTF-8 인코딩에서 BOM의 존재는 선택 사항이며, BOM 처리 방법을 모르는 소프트웨어에서 이를 읽을 때 문제가 발생할 수 있습니다.

Ktor 클라이언트는 UTF-8, UTF-16 (BE), UTF-16 (LE), UTF-32 (BE), UTF-32 (LE) 인코딩의 응답 본문에서 BOM을 제거하는 [BOMRemover](https://api.ktor.io/ktor-client-bom-remover/io.ktor.client.plugins.bomremover/index.html) 플러그인을 제공합니다.

> BOM을 제거할 때 Ktor는 초기 응답의 길이를 유지하는 `Content-Length` 헤더를 변경하지 않는다는 점에 유의하세요.
>
{style="note"}

## 의존성 추가하기 {id="add_dependencies"}

`BOMRemover`를 사용하려면 빌드 스크립트에 `%artifact_name%` 아티팩트를 포함해야 합니다.

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"></code-block>
    </TabItem>
</Tabs>
<p>
    Ktor 클라이언트에 필요한 아티팩트에 대한 자세한 내용은 <Links href="/ktor/client-dependencies" summary="기존 프로젝트에 클라이언트 의존성을 추가하는 방법을 알아봅니다.">클라이언트 의존성 추가</Links>에서 확인할 수 있습니다.
</p>

## BOMRemover 설치하기 {id="install_plugin"}

`BOMRemover`를 설치하려면 [클라이언트 구성 블록](client-create-and-configure.md#configure-client) 내의 `install` 함수에 이를 전달하세요.

```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.bomremover.*
//...
val client = HttpClient(CIO) {
    install(BOMRemover)
}