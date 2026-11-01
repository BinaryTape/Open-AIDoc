[//]: # (title: BOM remover)

<var name="artifact_name" value="ktor-client-bom-remover"/>
<var name="ktor_version_catalog_name" value="ktorLibs.client.bomRemover"/>
<primary-label ref="client-plugin"/>

<tldr>
<p>
<b>필수 의존성</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="client-bom-remover"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
BOMRemover 플러그인을 사용하면 응답 본문에서 바이트 순서 마크(Byte Order Mark, BOM)를 제거할 수 있습니다.
</link-summary>

[바이트 순서 마크(Byte Order Mark, BOM)](https://en.wikipedia.org/wiki/Byte_order_mark)는 유니코드 파일 또는 스트림에 인코딩되는 문자입니다. BOM의 주요 목적은 텍스트 스트림의 인코딩과 16비트 및 32비트 인코딩의 바이트 순서를 나타내는 것입니다.

어떤 경우에는 응답 본문에서 BOM을 제거해야 합니다. 예를 들어, UTF-8 인코딩에서 BOM의 존재는 선택 사항이며, BOM 처리 방법을 모르는 소프트웨어에서 읽을 때 문제를 일으킬 수 있습니다.

Ktor 클라이언트는 UTF-8, UTF-16 (BE), UTF-16 (LE), UTF-32 (BE), UTF-32 (LE) 인코딩의 응답 본문에서 BOM을 제거하는 [BOMRemover](https://api.ktor.io/ktor-client-bom-remover/io.ktor.client.plugins.bomremover/index.html) 플러그인을 제공합니다.

> BOM을 제거할 때 Ktor는 초기 응답의 길이를 유지하므로 `Content-Length` 헤더를 변경하지 않는다는 점에 유의하세요.
>
{style="note"}

## 의존성 추가 {id="add_dependencies"}

`BOMRemover`를 사용하려면 빌드 스크립트에 `%artifact_name%` 아티팩트를 포함해야 합니다:

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            위 코드 스니펫은 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 버전 카탈로그</a>를 사용하여 Ktor 의존성을 지정합니다.
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            위 코드 스니펫은 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 버전 카탈로그</a>를 사용하여 Ktor 의존성을 지정합니다.
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>
<tip>
    Ktor 클라이언트에 필요한 아티팩트에 대해 자세히 알아보려면 <Links href="client-dependencies.md" summary="기존 프로젝트에 클라이언트 의존성을 추가하는 방법을 알아봅니다.">클라이언트 의존성 추가</Links>를 참조하세요.
</tip>

## BOMRemover 설치 {id="install_plugin"}

`BOMRemover`를 설치하려면 [클라이언트 구성 블록](client-create-and-configure.md#configure-client) 내부의 `install` 함수에 전달하세요:

```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.bomremover.*
//...
val client = HttpClient(CIO) {
    install(BOMRemover)
}
```