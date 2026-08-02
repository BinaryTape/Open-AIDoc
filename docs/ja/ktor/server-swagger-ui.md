[//]: # (title: Swagger UI)

<primary-label ref="server-plugin"/>

<var name="artifact_name" value="ktor-server-swagger"/>
<var name="package_name" value="io.ktor.server.plugins.swagger"/>
<var name="plugin_api_link" value="https://api.ktor.io/ktor-server-swagger/io.ktor.server.plugins.swagger/swagger-u-i.html"/>

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
    <b><Links href="/ktor/server-native" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">Native サーバー</Links>のサポート</b>: ✖️
</p>
</tldr>

<link-summary>
SwaggerUI プラグインを使用すると、プロジェクトの Swagger UI を生成できます。
</link-summary>

Ktor を使用すると、OpenAPI 仕様に基づいてプロジェクトの Swagger UI を生成し、提供できます。
Swagger UI を使用すると、ブラウザから直接 API エンドポイントを視覚化し、操作できます。

OpenAPI 仕様は、次のいずれかの方法で提供できます。

* [既存の YAML または JSON ファイルを提供する](#static-openapi-file)。
* [OpenAPI コンパイラ拡張機能とランタイム API を使用して、実行時に仕様を生成する](#generate-runtime-openapi-metadata)。

## 依存関係の追加 {id="add_dependencies"}

Swagger UI を提供するには、ビルドスクリプトに `%artifact_name%` アーティファクトを追加する必要があります。

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

> Ktor 3.4.0 では、`SwaggerUI` プラグインに `ktor-server-routing-openapi` 依存関係が必要です。
> これは意図的な破壊的変更ではなく、Ktor 3.4.1 で修正される予定です。
> ランタイムエラーを避けるため、Ktor 3.4.0 を使用している場合は手動で依存関係を追加してください。
> 
{style="warning"}

## 静的な OpenAPI ファイルを使用する {id="static-openapi-file"}

既存の OpenAPI 仕様ファイルから Swagger UI を提供するには、[`swaggerUI()`](%plugin_api_link%) 関数を使用し、ファイルの場所を指定します。

次の例では、`swagger` パスに `GET` エンドポイントを作成し、提供された OpenAPI 仕様ファイルから Swagger UI をレンダリングします。

```kotlin
import io.ktor.server.plugins.swagger.*

// ...
routing {
    swaggerUI(path = "swagger", swaggerFile = "openapi/documentation.yaml")
}
```

プラグインはまずアプリケーションのリソースから仕様を探します。見つからない場合は、`java.io.File` を使用してファイルシステムからのロードを試みます。

## ランタイム OpenAPI メタデータの生成

静的ファイルに依存する代わりに、OpenAPI コンパイラプラグインとルートアノテーションによって生成されたメタデータを使用して、実行時に OpenAPI 仕様を生成できます。

```kotlin
swaggerUI("/swaggerUI") {
    info = OpenApiInfo("My API", "1.0")
    source = OpenApiDocSource.Routing(ContentType.Application.Json) {
        routingRoot.descendants()
    }
}
```

これにより、アプリケーションの現在の状態を反映した、生成された OpenAPI ドキュメントに `/swaggerUI` パスでアクセスできます。

> OpenAPI コンパイラ拡張機能とランタイム API の詳細については、[OpenAPI 仕様の生成](openapi-spec-generation.md)を参照してください。
>
{style="tip"}

## Swagger UI の設定

`swaggerUI {}` ブロック内で Swagger UI をカスタマイズできます。例えば、デフォルトの Swagger UI バージョンをオーバーライドできます。

```kotlin
routing {
    swaggerUI(path = "swagger", swaggerFile = "openapi/documentation.yaml") {
        version = "5.31.0"
    }
}
```

> OpenAPI 3.1.x ドキュメントには Swagger UI 5.x が必要ですが、Swagger UI 4.x は OpenAPI 3.0.x のみをサポートしています。
>
{style="note"}

## CORS の設定 {id="configure-cors"}

Swagger UI が API エンドポイントに正しくアクセスできるようにするには、まず [Cross-Origin Resource Sharing (CORS)](server-cors.md) を設定する必要があります。

以下の例では、次の CORS 設定を適用しています。
* `anyHost` は、任意のホストからのクロスオリジンリクエストを有効にします。
* `allowHeader` は、[コンテンツネゴシエーション](server-serialization.md)に使用される `Content-Type` クライアントヘッダーを許可します。

```kotlin
install(CORS) {
    anyHost()
    allowHeader(HttpHeaders.ContentType)
}