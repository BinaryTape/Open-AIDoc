[//]: # (title: OpenAPI)

<primary-label ref="server-plugin"/>

<var name="artifact_name" value="ktor-server-openapi"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.openapi"/>
<var name="package_name" value="io.ktor.server.plugins.openapi"/>
<var name="plugin_api_link" value="https://api.ktor.io/ktor-server-openapi/io.ktor.server.plugins.openapi/open-a-p-i.html"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="json-kotlinx-openapi"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="server-native.md" summary="KtorはKotlin/Nativeをサポートしており、追加のランタイムや仮想マシンなしでサーバーを実行できます。">ネイティブサーバー</Links>のサポート</b>: ✖️
</p>
</tldr>

<link-summary>
OpenAPIプラグインを使用すると、プロジェクト用のOpenAPIドキュメントを生成できます。
</link-summary>

Ktorを使用すると、OpenAPI仕様に基づいてOpenAPIドキュメントを提供できます。

OpenAPI仕様は、次のいずれかの方法で提供できます:

* [既存のYAMLまたはJSONファイルを提供する](#static-openapi-file)。
* [OpenAPIコンパイラ拡張とランタイムAPIを使用して、実行時に仕様を生成する](#generate-runtime-openapi-metadata)。

どちらの場合も、OpenAPIプラグインがサーバー上で仕様を組み立て、ドキュメントをHTMLとしてレンダリングします。

## 依存関係の追加 {id="add_dependencies"}

* OpenAPIドキュメントを提供するには、ビルドスクリプトに`%artifact_name%`アーティファクトを追加する必要があります:

  <Tabs group="languages">
      <TabItem title="Gradle (Kotlin)" group-key="kotlin">
          <code-block lang="Kotlin" code="              implementation(%ktor_version_catalog_name%)"/>
          <note>
              上記のコードスニペットでは、Ktorの依存関係を指定するために<a href="server-dependencies.topic#using-version-catalog">
              Ktorバージョンカタログ</a>を使用しています。
          </note>
      </TabItem>
      <TabItem title="Gradle (Groovy)" group-key="groovy">
          <code-block lang="Groovy" code="              implementation %ktor_version_catalog_name%"/>
          <note>
              上記のコードスニペットでは、Ktorの依存関係を指定するために<a href="server-dependencies.topic#using-version-catalog">
              Ktorバージョンカタログ</a>を使用しています。
          </note>
      </TabItem>
      <TabItem title="Maven" group-key="maven">
          <code-block lang="XML" code="              &lt;dependency&gt;&#10;                  &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                  &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                  &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;              &lt;/dependency&gt;"/>
      </TabItem>
  </Tabs>

* 必要に応じて、[コードジェネレーター](https://github.com/swagger-api/swagger-codegen-generators)をカスタマイズしたい場合は`swagger-codegen-generators`依存関係を追加します:

  <var name="group_id" value="io.swagger.codegen.v3"/>
  <var name="artifact_name" value="swagger-codegen-generators"/>
  <var name="version" value="swagger_codegen_version"/>
  <Tabs group="languages">
      <TabItem title="Gradle (Kotlin)" group-key="kotlin">
          <code-block lang="Kotlin" code="              implementation(&quot;%group_id%:%artifact_name%:$%version%&quot;)"/>
      </TabItem>
      <TabItem title="Gradle (Groovy)" group-key="groovy">
          <code-block lang="Groovy" code="              implementation &quot;%group_id%:%artifact_name%:$%version%&quot;"/>
      </TabItem>
      <TabItem title="Maven" group-key="maven">
          <code-block lang="XML" code="              &lt;dependency&gt;&#10;                  &lt;groupId&gt;%group_id%&lt;/groupId&gt;&#10;                  &lt;artifactId&gt;%artifact_name%&lt;/artifactId&gt;&#10;                  &lt;version&gt;${%version%}&lt;/version&gt;&#10;              &lt;/dependency&gt;"/>
      </TabItem>
  </Tabs>

  `$swagger_codegen_version`は、必要な`swagger-codegen-generators`アーティファクトのバージョン（例: `%swagger_codegen_version%`）に置き換えることができます。

## 静的OpenAPIファイルの使用 {id="static-openapi-file"}

既存の仕様からOpenAPIドキュメントを提供するには、OpenAPIドキュメントへのパスを指定して[`openAPI()`](%plugin_api_link%)関数を使用します。

以下の例では、`openapi`パスに`GET`エンドポイントを作成し、提供されたOpenAPI仕様ファイルからSwagger UIをレンダリングします:

```kotlin
import io.ktor.server.plugins.openapi.*

// ...
routing {
    openAPI(path="openapi", swaggerFile = "openapi/documentation.yaml")
}
```

プラグインはまずアプリケーションリソース内で仕様を検索します。見つからない場合は、`java.io.File`を使用してファイルシステムからのロードを試みます。

## ランタイムOpenAPIメタデータの生成 {id="generate-runtime-openapi-metadata"}

静的ファイルに頼る代わりに、OpenAPIコンパイラプラグインとルートアノテーションによって生成されたメタデータを使用して、実行時にOpenAPI仕様を生成できます。

このモードでは、OpenAPIプラグインがルーティングツリーから直接仕様を組み立てます:

```kotlin
 openAPI(path = "openapi") {
    info = OpenApiInfo("My API", "1.0")
    source = OpenApiDocSource.Routing {
        routingRoot.descendants()
    }
}
```

これにより、アプリケーションの現在の状態を反映した、生成されたOpenAPIドキュメントに`/openapi`パスからアクセスできます。

> OpenAPIコンパイラ拡張およびランタイムAPIの詳細については、[OpenAPI仕様の生成](openapi-spec-generation.md)を参照してください。
> 
{style="tip"}

## OpenAPIの設定 {id="configure-openapi"}

`openAPI {}`設定ブロックを使用すると、生成されるOpenAPIドキュメントと、Ktorがドキュメントをレンダリングする方法を設定できます。

### ドキュメントメタデータの設定 {id="configure-document-metadata"}

トップレベルのOpenAPIメタデータは、設定ブロック内で直接定義できます。

たとえば、一般的なAPI情報を指定するには`info`を使用し、タグとその説明を定義するには`tag()`を使用します:

```kotlin
openAPI("openapi") {
    info = OpenApiInfo("Books API from routes", "1.0.0")
    tag(
        name = "Books",
        description = "Operations on books"
    )
}
```

また、サーバー、セキュリティ要件、再利用可能なコンポーネント、外部ドキュメント、仕様拡張など、他のトップレベルのOpenAPIプロパティを設定することもできます。

> 利用可能なすべてのオプションについては、[`OpenAPIConfig`](https://api.ktor.io/ktor-server-openapi/io.ktor.server.plugins.openapi/-open-a-p-i-config/index.html) APIリファレンスを参照してください。
>
{style="tip"}

### ドキュメントレンダラーの設定 {id="configure-the-document-renderer"}

デフォルトでは、ドキュメントは`StaticHtml2Codegen`を使用してレンダリングされます。

別のレンダラーを使用するには、`codegen`プロパティに割り当てます:

```kotlin
routing {
    openAPI(path="openapi", swaggerFile = "openapi/documentation.yaml") {
        codegen = StaticHtmlCodegen()
    }
}
```

> `StaticHtmlCodegen`および`StaticHtml2Codegen`はOpenAPI 3.0.xドキュメントのみをサポートしています。これらをOpenAPI 3.1ドキュメントで使用すると、不完全または不正確なHTMLが生成される可能性があります。OpenAPI 3.1の場合は、Swagger UI 5.xとともに[`swaggerUI()`](server-swagger-ui.md)関数を使用してください。引き続きOpenAPIプラグインのHTMLレンダラーを使用する必要がある場合は、仕様をOpenAPI 3.0.3のままにしてください。
>
{style="note"}