[//]: # (title: Swagger UI)

<primary-label ref="server-plugin"/>

<var name="artifact_name" value="ktor-server-swagger"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.swagger"/>
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
    <b><Links href="server-native.md" summary="KtorはKotlin/Nativeをサポートしており、追加のランタイムや仮想マシンなしでサーバーを実行できます。">Nativeサーバー</Links>のサポート</b>: ✖️
</p>
</tldr>

<link-summary>
SwaggerUIプラグインを使用すると、プロジェクト用のSwagger UIを生成できます。
</link-summary>

Ktorを使用すると、OpenAPI仕様に基づいてプロジェクト用のSwagger UIを生成し、配信することができます。
Swagger UIを使用すると、ブラウザから直接APIエンドポイントを可視化し、対話的に操作できます。

OpenAPI仕様は、次のいずれかの方法で提供できます。

* [既存のYAMLまたはJSONファイルを提供する](#static-openapi-file)。
* [OpenAPIコンパイラ拡張機能とランタイムAPIを使用して実行時に仕様を生成する](#generate-runtime-openapi-metadata)。

## 依存関係の追加 {id="add_dependencies"}

Swagger UIを配信するには、ビルドスクリプトに `%artifact_name%` アーティファクトを追加する必要があります。

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上記のコードスニペットでは、Ktorの依存関係を指定するために<a href="server-dependencies.topic#using-version-catalog">
            Ktorバージョンカタログ</a>を使用しています。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上記のコードスニペットでは、Ktorの依存関係を指定するために<a href="server-dependencies.topic#using-version-catalog">
            Ktorバージョンカタログ</a>を使用しています。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## 静的なOpenAPIファイルの使用 {id="static-openapi-file"}

既存のOpenAPI仕様ファイルからSwagger UIを配信するには、[`swaggerUI()`](%plugin_api_link%) 関数を使用してファイルの場所を指定します。

次の例では、`swagger` パスに `GET` エンドポイントを作成し、提供されたOpenAPI仕様ファイルからSwagger UIをレンダリングします。

```kotlin
import io.ktor.server.plugins.swagger.*

// ...
routing {
    swaggerUI(path = "swagger", swaggerFile = "openapi/documentation.yaml")
}
```

プラグインはまずアプリケーションのリソース内で仕様を検索します。見つからない場合は、`java.io.File` を使用してファイルシステムから読み込みを試みます。

## ランタイムOpenAPIメタデータの生成 {id="generate-runtime-openapi-metadata"}

静的ファイルに依存する代わりに、OpenAPIコンパイラプラグインとルートアノテーションによって生成されたメタデータを使用して、実行時にOpenAPI仕様を生成できます。

```kotlin
swaggerUI("/swaggerUI") {
    info = OpenApiInfo("My API", "1.0")
    source = OpenApiDocSource.Routing(ContentType.Application.Json) {
        routingRoot.descendants()
    }
}
```

これにより、アプリケーションの現在の状態を反映した生成済みのOpenAPIドキュメントに `/swaggerUI` パスでアクセスできます。

> OpenAPIコンパイラ拡張機能およびランタイムAPIの詳細については、[OpenAPI仕様の生成](openapi-spec-generation.md)を参照してください。
>
{style="tip"}

## Swagger UIの設定 {id="configure-swagger-ui"}

`swaggerUI {}` 設定ブロックを使用すると、OpenAPIドキュメントの設定やSwagger UIのカスタマイズを行うことができます。

### ドキュメントのメタデータを設定する {id="configure-document-metadata"}

設定ブロック内でトップレベルのOpenAPIメタデータを直接定義できます。

たとえば、一般的なAPI情報を指定するには `info` を使用し、タグとその説明を定義するには `tag()` を使用します。

```kotlin
swaggerUI("/swagger") {
    info = OpenApiInfo("Books API from routes", "1.0.0")
    tag(
        name = "Books",
        description = "Operations on books"
    )
}
```
また、サーバー、セキュリティ要件、再利用可能なコンポーネント、外部ドキュメント、仕様拡張など、他のトップレベルのOpenAPIプロパティを設定することも可能です。

> 利用可能なすべてのオプションについては、[`SwaggerConfig`](https://api.ktor.io/ktor-server-swagger/io.ktor.server.plugins.swagger/-swagger-config/index.html) APIリファレンスを参照してください。
> 
{style="tip"}

### Swagger UIのバージョンを設定する {id="configure-the-swagger-ui-version"}

デフォルトでは、Ktorは事前定義されたSwagger UIのバージョンを使用します。別のバージョンを使用するには、`version` プロパティを設定します。

```kotlin
routing {
    swaggerUI(path = "swagger", swaggerFile = "openapi/documentation.yaml") {
        version = "5.31.0"
    }
}
```

> OpenAPI 3.1.xドキュメントにはSwagger UI 5.xが必要ですが、Swagger UI 4.xはOpenAPI 3.0.xのみをサポートしています。
>
{style="note"}

## CORSの設定 {id="configure-cors"}

Swagger UIがAPIエンドポイントに正しくアクセスできるようにするには、まず[クロスオリジンリソース共有（CORS）](server-cors.md)を設定する必要があります。

以下の例では、次のCORS設定を適用しています。
* `anyHost` は、任意のホストからのクロスオリジンリクエストを有効にします。
* `allowHeader` は、[コンテンツネゴシエーション](server-serialization.md)に使用される `Content-Type` クライアントヘッダーを許可します。

```kotlin
install(CORS) {
    anyHost()
    allowHeader(HttpHeaders.ContentType)
}
```