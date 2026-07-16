[//]: # (title: BOMリムーバー)

<var name="artifact_name" value="ktor-client-bom-remover"/>
<primary-label ref="client-plugin"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="client-bom-remover"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
BOMRemoverプラグインを使用すると、レスポンスボディからバイトオーダーマーク (BOM) を削除できます。
</link-summary>

[バイトオーダーマーク (BOM)](https://en.wikipedia.org/wiki/Byte_order_mark) は、Unicodeファイルまたはストリームでエンコードされた文字です。BOMの主な目的は、テキストのストリームエンコーディングと、16ビットおよび32ビットエンコーディングのバイト順を示すことです。

場合によっては、レスポンスボディからBOMを削除する必要があります。例えば、UTF-8エンコーディングではBOMの存在は任意ですが、BOMの処理方法を解釈できないソフトウェアで読み取られた場合に問題が発生することがあります。

Ktorクライアントは、UTF-8、UTF-16 (BE)、UTF-16 (LE)、UTF-32 (BE)、およびUTF-32 (LE) エンコーディングのレスポンスボディからBOMを削除する [BOMRemover](https://api.ktor.io/ktor-client-bom-remover/io.ktor.client.plugins.bomremover/index.html) プラグインを提供しています。

> BOMを削除しても、Ktorは `Content-Length` ヘッダーを変更しないため、ヘッダーには初期レスポンスの長さが保持されることに注意してください。
>
{style="note"}

## 依存関係の追加 {id="add_dependencies"}

`BOMRemover` を使用するには、ビルドスクリプトに `%artifact_name%` アーティファクトを含める必要があります。

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
    Ktorクライアントに必要なアーティファクトの詳細については、<Links href="/ktor/client-dependencies" summary="既存のプロジェクトにクライアントの依存関係を追加する方法を学びます。">クライアントの依存関係の追加</Links> を参照してください。
</p>

## BOMRemoverのインストール {id="install_plugin"}

`BOMRemover` をインストールするには、[クライアント設定ブロック](client-create-and-configure.md#configure-client) 内の `install` 関数に渡します。

```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.bomremover.*
//...
val client = HttpClient(CIO) {
    install(BOMRemover)
}