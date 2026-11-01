[//]: # (title: BOM リムーバー)

<var name="artifact_name" value="ktor-client-bom-remover"/>
<var name="ktor_version_catalog_name" value="ktorLibs.client.bomRemover"/>
<primary-label ref="client-plugin"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="client-bom-remover"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
BOMRemover プラグインを使用すると、レスポンスボディからバイト順マーク（BOM）を削除できます。
</link-summary>

[バイト順マーク（BOM: Byte Order Mark）](https://en.wikipedia.org/wiki/Byte_order_mark)は、Unicode ファイルまたはストリームでエンコードされる文字です。BOM の主な目的は、テキストのストリームエンコーディングと、16 ビットおよび 32 ビットエンコーディングのバイト順を示すことです。

場合によっては、レスポンスボディから BOM を削除する必要があります。例えば、UTF-8 エンコーディングでは BOM の存在は任意であり、BOM の処理方法に対応していないソフトウェアで読み込まれた場合に問題が発生することがあります。

Ktor クライアントは、UTF-8、UTF-16 (BE)、UTF-16 (LE)、UTF-32 (BE)、UTF-32 (LE) エンコーディングのレスポンスボディから BOM を削除する [BOMRemover](https://api.ktor.io/ktor-client-bom-remover/io.ktor.client.plugins.bomremover/index.html) プラグインを提供しています。

> BOM を削除する際、Ktor は `Content-Length` ヘッダーを変更しないため、初期レスポンスの長さが保持されることに注意してください。
>
{style="note"}

## 依存関係の追加 {id="add_dependencies"}

`BOMRemover` を使用するには、ビルドスクリプトに `%artifact_name%` アーティファクトを含める必要があります。

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上記のコードスニペットでは、<a href="server-dependencies.topic#using-version-catalog">
            Ktor バージョンカタログ</a>を使用して Ktor の依存関係を指定しています。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上記のコードスニペットでは、<a href="server-dependencies.topic#using-version-catalog">
            Ktor バージョンカタログ</a>を使用して Ktor の依存関係を指定しています。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>
<tip>
    Ktor クライアントに必要なアーティファクトの詳細については、<Links href="client-dependencies.md" summary="既存のプロジェクトにクライアント依存関係を追加する方法を説明します。">クライアントの依存関係の追加</Links>を参照してください。
</tip>

## BOMRemover のインストール {id="install_plugin"}

`BOMRemover` をインストールするには、[クライアント設定ブロック](client-create-and-configure.md#configure-client)内の `install` 関数に渡します。

```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.bomremover.*
//...
val client = HttpClient(CIO) {
    install(BOMRemover)
}
```