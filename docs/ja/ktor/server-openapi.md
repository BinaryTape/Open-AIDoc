[//]: # (title: OpenAPI)

<primary-label ref="server-plugin"/>

<var name="artifact_name" value="ktor-server-openapi"/>
<var name="package_name" value="io.ktor.server.plugins.openapi"/>
<var name="plugin_api_link" value="https://api.ktor.io/ktor-server-openapi/io.ktor.server.plugins.openapi/open-a-p-i.html"/>

<tldr>
<p>
<b>必須の依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="json-kotlinx-openapi"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">Nativeサーバー</Links>のサポート</b>: ✖️
</p>
</tldr>

<link-summary>
OpenAPIプラグインを使用すると、プロジェクトのOpenAPIドキュメントを生成できます。
</link-summary>

Ktorを使用すると、OpenAPI仕様に基づいたOpenAPIドキュメントを提供できます。

OpenAPI仕様は、次のいずれかの方法で提供できます。

* [既存のYAMLまたはJSONファイルを提供する](#static-openapi-file)。
* [OpenAPIコンパイラ拡張およびランタイムAPIを使用して、ランタイムに仕様を生成する](#generate-runtime-openapi-metadata)。

どちらの場合も、OpenAPIプラグインはサーバー上で仕様を組み立て、HTMLとしてドキュメントをレンダリングします。

## 依存関係の追加 {id="add_dependencies"}

* OpenAPIドキュメントを提供するには、ビルドスクリプトに `%artifact_name%` アーティファクトを追加する必要があります。

  <Tabs group="languages">
      <TabItem title="Gradle (Kotlin)" group-key="kotlin">
          <code-block lang="Kotlin" code="              implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"/>
      </TabItem>
      <TabItem title="Gradle (Groovy)" group-key="groovy">
          <code-block lang="Groovy" code="              implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"/>
      </TabItem>
      <TabItem title="Maven" group-key="maven">
          <code-block lang="XML" code="              &lt;dependency&gt;&#10;                  &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                  &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                  &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;              &lt;/dependency&gt;"/>
      </TabItem>
  </Tabs>

* オプションで、[コードジェネレーター](https://github.com/swagger-api/swagger-codegen-generators)をカスタマイズしたい場合は、`swagger-codegen-generators` 依存関係を追加します。

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

  `$swagger_codegen_version` は、`swagger-codegen-generators` アーティファクトの必要なバージョン（例：`%swagger_codegen_version%`）に置き換えることができます。

> Ktor 3.4.0では、`OpenAPI` プラグインは `ktor-server-routing-openapi` 依存関係を必要とします。
> これは意図的な破壊的変更ではなく、Ktor 3.4.1で修正される予定です。
> ランタイムエラーを避けるため、Ktor 3.4.0を使用している場合は手動で依存関係を追加してください。
>
{style="warning"}

## 静的なOpenAPIファイルを使用する {id="static-openapi-file"}

既存の仕様からOpenAPIドキュメントを提供するには、OpenAPIドキュメントへのパスを指定して [`openAPI()`](%plugin_api_link%) 関数を使用します。

次の例では、`openapi` パスに `GET` エンドポイントを作成し、提供されたOpenAPI仕様ファイルからSwagger UIをレンダリングします。

```kotlin
import io.ktor.server.plugins.openapi.*

// ...
routing {
    openAPI(path="openapi", swaggerFile = "openapi/documentation.yaml")
}
```

プラグインはまずアプリケーションのリソースから仕様を探します。見つからない場合は、`java.io.File` を使用してファイルシステムからの読み込みを試みます。

## ランタイムOpenAPIメタデータを生成する

静的ファイルに依存する代わりに、OpenAPIコンパイラプラグインとルートアノテーションによって生成されたメタデータを使用して、ランタイムにOpenAPI仕様を生成できます。

このモードでは、OpenAPIプラグインはルーティングツリーから直接仕様を組み立てます。

```kotlin
 openAPI(path = "openapi") {
    info = OpenApiInfo("My API", "1.0")
    source = OpenApiDocSource.Routing {
        routingRoot.descendants()
    }
}
```

これにより、アプリケーションの現在の状態を反映した、生成されたOpenAPIドキュメントに `/openapi` パスでアクセスできます。

> OpenAPIコンパイラ拡張およびランタイムAPIの詳細については、[OpenAPI仕様の生成](openapi-spec-generation.md)を参照してください。
> 
{style="tip"}

## OpenAPIの設定 {id="configure-openapi"}

デフォルトでは、ドキュメントは `StaticHtml2Codegen` を使用してレンダリングされます。`openAPI {}` ブロック内でレンダラーをカスタマイズできます。

> `StaticHtmlCodegen` および `StaticHtml2Codegen` は OpenAPI 3.0.x ドキュメントのみをサポートしています。これらを OpenAPI 3.1 ドキュメントで使用すると、不完全または不正確な HTML が生成される可能性があります。OpenAPI 3.1 の場合は、Swagger UI 5.x を備えた [`swaggerUI()`](server-swagger-ui.md) 関数を使用してください。OpenAPI プラグインの HTML レンダラーを引き続き使用する必要がある場合は、仕様を OpenAPI 3.0.3 のままにしてください。
>
{style="note"}

```kotlin
routing {
    openAPI(path="openapi", swaggerFile = "openapi/documentation.yaml") {
        codegen = StaticHtmlCodegen()
    }
}