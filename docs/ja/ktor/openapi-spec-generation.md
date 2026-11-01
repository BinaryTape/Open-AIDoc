[//]: # (title: OpenAPI仕様の生成)

<show-structure for="chapter" depth="2"/>
<secondary-label ref="server-feature"/>

<var name="artifact_name" value="ktor-server-routing-openapi"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.routingOpenapi"/>
<var name="package_name" value="io.ktor.server.routing.openapi"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<p>
<b>コード例</b>:
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/openapi-spec-gen">
    openapi-spec-gen
</a>,
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/openapi-spec-gen-maven">
    openapi-spec-gen-maven
</a>
</p>
</tldr>

Ktorは、1つ以上のドキュメントソースから実行時にOpenAPI仕様を構築するサポートを提供しています。

この機能は以下を通じて利用できます:
* OpenAPIコンパイラー拡張（Ktor Gradleプラグインに含まれる）: コンパイル時にルーティングコードを解析し、実行時にOpenAPIメタデータを登録するKotlinコードを生成します。
* ルーティングアノテーションのランタイムAPI: 実行中のアプリケーション内でルートに直接OpenAPIメタデータを付加します。

これらを片方または両方使用し、[OpenAPI](server-openapi.md)および[SwaggerUI](server-swagger-ui.md)プラグインと組み合わせることで、インタラクティブなAPIドキュメントを提供できます。

> OpenAPI Gradle拡張にはKotlin 2.2.20が必要です。他のバージョンを使用するとコンパイルエラーが発生する可能性があります。
>
{style="note"}

## 依存関係の追加 {id="add-dependencies"}

* OpenAPIメタデータの生成を有効にするには、Ktorコンパイラープラグインをプロジェクトに適用します。

  <Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin" id="add-ktor-plugin-gradle-kotlin">

    ```kotlin
    plugins {
        id("io.ktor.plugin") version "%ktor_version%"
    }
    ```

    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy" id="add-ktor-plugin-gradle-groovy">

    ```groovy
    plugins {
        id 'io.ktor.plugin' version "%ktor_version%"
    }
    ```

    </TabItem>
    <TabItem title="Maven" group-key="maven" id="add-ktor-plugin-maven">

    Gradleとは異なり、MavenはKtorコンパイラープラグインの組み込み統合を提供していません。OpenAPI仕様の生成を有効にするには、コンパイラープラグインを手動で設定する必要があります。

    1. Ktor Mavenプラグインを適用します（アプリケーションの実行とパッケージ化に必要です）:
       ```xml
       <build>
           <plugins>
               <plugin>
                   <groupId>io.ktor</groupId>
                   <artifactId>ktor-maven-plugin</artifactId>
                   <version>%ktor_version%</version>
               </plugin>
           </plugins>
       </build>
       ```
    2. コンパイラープラグインはJARファイルとして利用可能である必要があります。安定した場所に自動的にダウンロードしてコピーするために、以下の設定を追加します:

       ```xml
       <plugin>
           <groupId>org.apache.maven.plugins</groupId>
           <artifactId>maven-dependency-plugin</artifactId>
           <version>3.9.0</version>
           <executions>
               <execution>
                   <id>copy-ktor-compiler-plugin</id>
                   <phase>generate-sources</phase>
                   <goals>
                       <goal>copy</goal>
                   </goals>
                   <configuration>
                       <artifactItems>
                           <artifactItem>
                               <groupId>io.ktor</groupId>
                               <artifactId>ktor-compiler-plugin</artifactId>
                               <version>%ktor_version%</version>
                               <outputDirectory>${project.build.directory}/kotlin-plugins</outputDirectory>
                               <destFileName>ktor-compiler-plugin.jar</destFileName>
                           </artifactItem>
                       </artifactItems>
                   </configuration>
               </execution>
           </executions>
       </plugin>
       ```
  
    3. Kotlinコンパイラーを設定します:

       ```xml
       <plugin>
           <groupId>org.jetbrains.kotlin</groupId>
           <artifactId>kotlin-maven-plugin</artifactId>
           <version>%kotlin_version%</version>

           <configuration>
               <jvmTarget>21</jvmTarget>

               <compilerPlugins>
                   <plugin>kotlinx-serialization</plugin>
               </compilerPlugins>

               <args>
                   <arg>-Xplugin=${project.build.directory}/kotlin-plugins/ktor-compiler-plugin.jar</arg>

                   <arg>-P</arg>
                   <arg>plugin:io.ktor.ktor-compiler-plugin:openApiEnabled=true</arg>

                   <arg>-P</arg>
                   <arg>plugin:io.ktor.ktor-compiler-plugin:openApiCodeInference=true</arg>

                   <arg>-P</arg>
                   <arg>plugin:io.ktor.ktor-compiler-plugin:openApiOnlyCommented=false</arg>
               </args>
           </configuration>

           <dependencies>
               <dependency>
                   <groupId>io.ktor</groupId>
                   <artifactId>ktor-compiler-plugin</artifactId>
                   <version>%ktor_version%</version>
               </dependency>
               <dependency>
                   <groupId>org.jetbrains.kotlin</groupId>
                   <artifactId>kotlin-maven-serialization</artifactId>
                   <version>${kotlin_version}</version>
               </dependency>
           </dependencies>
           <executions>
               <execution>
                   <id>compile</id>
                   <phase>compile</phase>
                   <goals>
                       <goal>compile</goal>
                   </goals>
               </execution>
               <execution>
                   <id>test-compile</id>
                   <phase>test-compile</phase>
                   <goals>
                       <goal>test-compile</goal>
                   </goals>
               </execution>
           </executions>
       </plugin>
       ```
  
   </TabItem>
  </Tabs>

* ランタイムルートアノテーションを使用するには、ビルドスクリプトに `%artifact_name%` アーティファクトを追加します:

  <Tabs group="languages">
      <TabItem title="Gradle (Kotlin)" group-key="kotlin">
          <code-block lang="Kotlin" code="              implementation(%ktor_version_catalog_name%)"/>
          <note>
              上記のコードスニペットでは、Ktorの依存関係を指定するために<a href="server-dependencies.topic#using-version-catalog">Ktorバージョンカタログ</a>を使用しています。
          </note>
      </TabItem>
      <TabItem title="Gradle (Groovy)" group-key="groovy">
          <code-block lang="Groovy" code="              implementation %ktor_version_catalog_name%"/>
          <note>
              上記のコードスニペットでは、Ktorの依存関係を指定するために<a href="server-dependencies.topic#using-version-catalog">Ktorバージョンカタログ</a>を使用しています。
          </note>
      </TabItem>
      <TabItem title="Maven" group-key="maven">
          <code-block lang="XML" code="              &lt;dependency&gt;&#10;                  &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                  &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                  &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;              &lt;/dependency&gt;"/>
      </TabItem>
  </Tabs>

## OpenAPIコンパイラー拡張の設定 {id="configure-the-extension"}

OpenAPIコンパイラー拡張は、コンパイル時にルーティングメタデータを収集する方法を制御します。
最終的なOpenAPIドキュメント自体を定義するわけではありません。

コンパイル中、プラグインはルーティング宣言、コードパターン、およびコメントから派生したメタデータを登録するために、OpenAPIランタイムAPIを使用するKotlinコードを生成します。

APIのタイトル、バージョン、サーバー、セキュリティスキーム、詳細なスキーマなどの一般的なOpenAPI情報は、[仕様が生成される際](#generate-and-serve-the-specification)に実行時に提供されます。

コンパイラープラグイン拡張を設定するには、<Path>build.gradle.kts</Path> ファイル内の `ktor` 拡張ブロックの中で `openApi {}` ブロックを使用します:

```kotlin
ktor {
    openApi {
        enabled = true
        codeInferenceEnabled = true
        onlyCommented = false
    }
}
```

### 設定オプション {id="configuration-options"}

<deflist>
<def>
<title><code>enabled</code></title>
OpenAPIルートアノテーションコード生成を有効または無効にします。デフォルトは <code>false</code> です。
</def>
<def>
<title><code>codeInferenceEnabled</code></title>
コンパイラーがルーティングコードからOpenAPIメタデータを推論しようとするかどうかを制御します。デフォルトは <code>true</code> です。推論によって不正確な結果が生じる場合や、アノテーションを使用して明示的にメタデータを定義したい場合は、このオプションを無効にしてください。
詳細については、<a href="#code-inference">コード推論ルール</a>を参照してください。
</def>
<def>
<title><code>onlyCommented</code></title>
コメントアノテーションを含むルートのみにメタデータ生成を制限します。デフォルトは <code>false</code> であり、明示的に <code>@ignore</code> とマークされているものを除き、すべてのルーティング呼び出しが処理されます。
</def>
</deflist>

### ルーティング構造の解析 {id="routing-structure-analysis"}

Ktorコンパイラープラグインは、サーバールーティングDSLを解析してAPIの構造的な形状を決定します。この解析はルート宣言のみに基づいて行われ、ルートハンドラーの内容は検査されません。

ルーティングAPIツリー内のセレクターから、以下が自動的に推論されます:
- マージされたパス（例: `/api/v1/users/{id}`）
- HTTPメソッド（`GET` や `POST` など）
- パスパラメーター

```kotlin
routing {
    route("/api/v1") {
        get("/users") { }
        get("/users/{id}") { }
        post("/users") { }
    }
}
```

リクエストパラメーター、ボディ、レスポンスはルートラムダ内で処理されるため、コンパイラーはルーティング構造だけから完全なOpenAPI記述を推論することはできません。生成されるメタデータを充実させるために、Ktorは一般的なリクエスト処理パターンに基づく[アノテーション](#annotate-routes)と[自動推論](#code-inference)をサポートしています。

### コード推論 {id="code-inference"}

コード推論が有効になっている場合、コンパイラープラグインは一般的なKtorの使用パターンを認識し、同等のランタイムアノテーションを自動的に生成します。

次の表は、サポートされている推論ルールの概要です:

| ルール | 説明 | 入力 | 出力 (annotateスコープから) |
|---------------------|----------------------------------------------------------------|----------------------------------------------------------------------------|--------------------------------------------------------------------------|
| リクエストボディ | `ContentNegotiation` の読み取りからリクエストボディスキーマを提供 | `call.receive<T>()` | `requestBody { schema = jsonSchema<T>() }` |
| レスポンスボディ | `ContentNegotiation` の書き込みからレスポンスボディスキーマを提供 | `call.respond<T>()` | `responses { HttpStatusCode.OK { schema = jsonSchema<T>() } }` |
| レスポンスヘッダー | レスポンス用のカスタムヘッダーを含める | `call.response.header("X-Foo", "Bar")` | `responses { HttpStatusCode.OK { headers { header("X-Foo", "Bar") } } }` |
| パスパラメーター | パスパラメーターの参照を検出 | `call.parameters["id"]` | `parameters { path("id") }` |
| クエリパラメーター | クエリパラメーターの参照を検出 | `call.queryParameters["name"]` | `parameters { query("name") }` |
| リクエストヘッダー | リクエストヘッダーの参照を検出 | `call.request.headers["X-Foo"]` | `parameters { header("X-Foo") }` |
| Resources APIルート | ResourcesルーティングAPIの呼び出し構造を推論 | `call.get<List> { /**/ }; @Resource("/list") class List(val name: String)` | `parameters { query("name") }` |

推論は可能な限り抽出された関数を追跡し、典型的なリクエストおよびレスポンスフローに対して一貫したドキュメントを生成しようとします。

#### 特定のエンドポイントで推論を無効にする {id="disable-inference-for-an-endpoint"}

特定のエンドポイントで推論によって不正確なメタデータが生成される場合、`ignore` マーカーを追加することでそのエンドポイントを除外できます:

```kotlin
// ignore!
get("/comments") {
    // ...
}
```

## ルートのアノテーション {id="annotate-routes"}

仕様を充実させるために、Ktorはルートにアノテーションを付加する2つの方法をサポートしています:

- コンパイラープラグインによって解析される[コメントベースのアノテーション](#comment-annotations)
- `.describe {}` DSLを使用して定義される[ランタイムルートアノテーション](#runtime-route-annotations)

どちらか一方のアプローチを使用することも、両方を組み合わせることもできます。

### コメントベースのルートアノテーション {id="comment-annotations"}

コメントベースのアノテーションは、コードから推論できないメタデータを提供し、既存のルートとシームレスに統合されます。

メタデータは、行の先頭にキーワードを配置し、その後にコロン（`:`）と値を記述することによって定義されます。

コメントはルート宣言に直接付加できます:

```kotlin
/**
 * Get a single user by ID.
 *
 * Path: id [ULong] the ID of the user
 *
 * Responses:
 *   – 400 The ID parameter is malformatted or missing.
 *   – 404 The user for the given ID does not exist.
 *   – 200 [User] The user found with the given ID.
 */
get("/{id}") {
    val id = call.parameters["id"]?.toULongOrNull()
        ?: return@get call.respond(HttpStatusCode.BadRequest)
    val user = list.find { it.id == id }
        ?: return@get call.respond(HttpStatusCode.NotFound)
    call.respond(user)
}
```

#### フォーマットルール {id="formatting-rules"}

- キーワードは行の先頭になければなりません。
- コロン（`:`）でキーワードと値を区切ります。
- 複数形（例: `Tags`、`Responses`）を使用すると、グループ化された定義が可能です。
- 単数形（例: `Tag`、`Response`）もサポートされています。
- トップレベルの箇条書き（`-`）は任意であり、フォーマットにのみ影響します。

以下のバリエーションは同等です:

```kotlin
/**
 * Tag: widgets
 * 
 * Tags:
 *   - widgets
 * 
 * - Tags:
 *  - widgets
 */
```

#### サポートされているコメントフィールド {id="supported-comment-fields"}

| タグ | フォーマット | 説明 |
|----------------|-------------------------------------------------|----------------------------------|
| `Tag` | `Tag: name` | エンドポイントをタグでグループ化 |
| `Path` | `Path: [Type] name description` | パスパラメーター |
| `Query` | `Query: [Type] name description` | クエリパラメーター |
| `Header` | `Header: [Type] name description` | ヘッダーパラメーター |
| `Cookie` | `Cookie: [Type] name description` | クッキーパラメーター |
| `Body` | `Body: contentType [Type] description` | リクエストボディ |
| `Response` | `Response: code contentType [Type] description` | レスポンス定義 |
| `Deprecated` | `Deprecated: reason` | エンドポイントを非推奨としてマーク |
| `Description` | `Description: text` | 詳細な説明 |
| `Security` | `Security: scheme` | セキュリティ要件 |
| `ExternalDocs` | `ExternalDocs: href` | 外部ドキュメントへのリンク |

### ランタイムルートアノテーション {id="runtime-route-annotations"}

<primary-label ref="experimental"/>

動的ルーティング、インターセプター、条件ロジックを使用している場合など、コンパイル時解析では不十分な場合、`.describe {}` 拡張関数を使用して実行時にルートへ直接OpenAPI操作メタデータを付加できます。

アノテーションが付加された各ルートは、生成されたOpenAPI仕様における単一のHTTP操作（例: `GET /users`）を表すOpenAPI [Operationオブジェクト](https://swagger.io/specification/#operation-object)を定義します。メタデータは実行時にルーティングツリーに付加され、OpenAPIおよびSwagger UIプラグインによって利用されます。

`.describe {}` DSLはOpenAPI仕様に直接マッピングされます。プロパティ名と構造は、パラメーター、リクエストボディ、レスポンス、セキュリティ要件、サーバー、コールバック、仕様拡張（`x-*`）を含む、Operationオブジェクトに対して定義されたフィールドに対応しています。

ランタイムルートアノテーションAPIは実験的（experimental）であり、`@OptIn(ExperimentalKtorApi::class)` を使用したオプトインが必要です:

```kotlin
                @OptIn(ExperimentalKtorApi::class)
                get("/users") {
                    val query = call.parameters["q"]
                    val result = if (query != null) {
                        list.filter {it.name.contains(query, ignoreCase = true)  }
                    } else {
                        list
                    }

                    call.respond(result)
                }.describe {
                    summary = "Get users"
                    description = "Retrieves a list of users."
                    parameters {
                        query("q") {
                            description = "An encoded query"
                            required = false
                        }
                    }
                    responses {
                        HttpStatusCode.OK {
                            description = "A list of users"
                            schema = jsonSchema<List<User>>()
                        }
                        HttpStatusCode.BadRequest {
                            description = "Invalid query"
                            ContentType.Text.Plain()
                        }
                    }
                }
```

> 利用可能なフィールドの完全なリストについては、[OpenAPI仕様](https://swagger.io/specification/#operation-object)を参照してください。
>
{style="tip"}

ランタイムアノテーションは、コンパイラーが生成したメタデータおよびコメントベースのメタデータとマージされます。同じOpenAPIフィールドが複数のソースによって定義されている場合、ランタイムアノテーションによって提供された値が[優先](#metadata-precedence)されます。

## OpenAPI仕様からルートを非表示にする {id="hide-routes-from-the-openapi-specification"}

生成されるOpenAPIドキュメントからルートとその子ルートを除外するには、`Route.hide()` 関数を使用します:

```kotlin
@OptIn(ExperimentalKtorApi::class)
get("/routes") {
    // ....
}.hide()
```

これは、公開すべきではない内部用、管理用、診断用のエンドポイントや、[OpenAPI仕様自体を生成](#assemble-and-serve-the-specification)するために使用されるルートに対して便利です。

OpenAPIおよびSwagger UIプラグインは自動的に `.hide()` を呼び出すため、それらのルートは生成されるドキュメントから除外されます。

## スキーマ推論 {id="schema-inference"}

Ktorは、OpenAPI仕様を構築する際にリクエストタイプおよびレスポンスタイプのJSONスキーマを自動的に生成します。デフォルトでは、データクラス上の `kotlinx-serialization` ディスクリプターを使用して型参照からスキーマが推論されます。これにより、余分な労力をかけることなく、最も一般的なデータモデルを文書化できます。

### アノテーションによるスキーマのカスタマイズ {id="customize-schemas-with-annotations"}

データクラスに [`@JsonSchema`](https://api.ktor.io/ktor-openapi-schema/io.ktor.openapi/-json-schema/index.html) アノテーションを追加することで、自動生成されたJSONスキーマのフィールドをオーバーライドできます。これにより、説明の追加やプロパティの必須マーク付けなどを行うことができます:

```kotlin
@JsonSchema.Description("Represents a news article")
data class Article(
    val title: String,
    val content: String
)
```

### リフレクションベースのスキーマ推論の使用 {id="use-reflection-based-schema-inference"}

`kotlinx-serialization` の代わりにJacksonやGsonを使用しているプロジェクトでは、リフレクションベースのスキーマ推論を使用できます。これを行うには、OpenAPIまたはSwaggerUIプラグインの `Routing` ソースで `schemaInference` フィールドを設定します:

```kotlin
openAPI("docs") {
    outputPath = "docs/routes"
    info = OpenApiInfo("Books API from routes", "1.0.0")
    source = OpenApiDocSource.Routing(
        contentType = ContentType.Application.Json,
        schemaInference = ReflectionJsonSchemaInference.Default,
    )
}
```

### リフレクション動作のカスタマイズ {id="customize-reflection-behavior"}

直接サポートされていないアノテーションや命名規則を処理するために、カスタムの `SchemaReflectionAdapter` を提供できます。

`SchemaReflectionAdapter` は `ReflectionJsonSchemaInference` のフィールドであり、プロパティ名、無視されるフィールド、null許容性のルールなどのデフォルト動作をオーバーライドできます。

たとえば、Gsonの `@SerializedName` アノテーションをサポートするように動作をカスタマイズできます:

```kotlin
ReflectionJsonSchemaInference(object : SchemaReflectionAdapter {
    override fun getName(type: KType): String? {
        return (type.classifier as? KClass<*>)?.let {
            findAnnotations(SerializedName::class)?.value ?: it.simpleName
        }
    }
})
```

### カスタムスキーマの提供 {id="custom-schemas"}

自動スキーマ推論やアノテーションでは不十分な場合、[`JsonSchema`](https://api.ktor.io/ktor-openapi-schema/io.ktor.openapi/-json-schema/index.html) クラスを使用して手動でJSONスキーマを構築できます。

これにより、型、フォーマット、ネストされた構造、またはタプル風の配列定義のための `prefixItems` などの高度な構造を含め、サポートされているすべてのスキーマプロパティを明示的に定義できます。

利用可能なプロパティの完全なリストについては、[`JsonSchema` APIドキュメント](https://api.ktor.io/ktor-openapi-schema/io.ktor.openapi/-json-schema/index.html)を参照してください。

## 仕様の生成と提供 {id="generate-and-serve-the-specification"}

OpenAPI仕様は、ランタイムルートアノテーションとコンパイラープラグインによって生成されたメタデータから実行時に組み立てられます。

以下の方法で仕様を公開できます:

- [OpenAPIドキュメントを手動で組み立てて提供する](#assemble-and-serve-the-specification)。
- [OpenAPI](server-openapi.md)または[SwaggerUI](server-swagger-ui.md)プラグインを使用して、仕様とインタラクティブなドキュメントを提供する。

### 仕様の組み立てと提供 {id="assemble-and-serve-the-specification"}

実行時に完全なOpenAPIドキュメントを組み立てるには、`OpenApiDoc` インスタンスを作成し、仕様に含めるべきルートを指定します。

ドキュメントは、コンパイラーが生成したメタデータとルーティングツリーからのランタイムルートアノテーションから組み立てられます。結果として得られる `OpenApiDoc` インスタンスは、常にアプリケーションの現在の状態を反映します。

通常、ルートハンドラーからドキュメントを構築し、それを直接レスポンスとして返します:

```kotlin

        get("/docs.json") {
            val doc = OpenApiDoc(info = OpenApiInfo("My API", "1.0")) + call.application.routingRoot.descendants()
            call.respond(doc)
```

この例では、OpenAPIドキュメントは [`ContentNegotiation`](server-serialization.md) プラグインを使用してシリアライズされます。これには、JSONシリアライザー（例: `kotlinx.serialization`）がインストールされていることが前提となります。

追加のビルドステップや生成ステップは必要ありません。ルートやアノテーションへの変更は、次回仕様がリクエストされたときに自動的に反映されます。

> シリアライズを明示的に行いたい場合や、`ContentNegotiation` への依存を避けたい場合は、ドキュメントを手動でエンコードしてJSONで応答することができます:
> 
> ```kotlin
> call.respondText(
>   Json.encodeToString(docs),
>   ContentType.Application.Json
> )
>```
>
{style="note"}

### インタラクティブなドキュメントの提供 {id="serve-interactive-documentation"}

インタラクティブなUIを通じてOpenAPI仕様を公開するには、[OpenAPI](server-openapi.md)および[Swagger UI](server-swagger-ui.md)プラグインを使用します。

両方のプラグインは実行時に仕様を組み立て、ルーティングツリーからメタデータを直接読み取ることができます。
これらは、ドキュメントのレンダリング方法において異なります:
- OpenAPIプラグインはサーバー上でドキュメントをレンダリングし、事前生成されたHTMLを提供します。
- Swagger UIプラグインはOpenAPI仕様をJSONまたはYAMLとして提供し、Swagger UIを使用してブラウザー内でUIをレンダリングします。

```kotlin
// OpenAPI UIを提供
openAPI("/openApi")

// Swagger UIを提供
swaggerUI("/swaggerUI") {
    info = OpenApiInfo("My API", "1.0")
    source = OpenApiDocSource.Routing(
        contentType = ContentType.Application.Json,
    )
}
```

### メタデータの優先順位 {id="metadata-precedence"}

最終的なOpenAPI仕様は、複数のソースから提供されたメタデータをマージすることによって実行時に組み立てられます。

以下のソースが順番に適用されます:

1. コンパイラー生成のメタデータ（以下を含む）:
    - [ルーティング構造の解析](#routing-structure-analysis)
    - [コード推論](#code-inference)
2. [コメントベースのルートアノテーション](#comment-annotations)
3. [ランタイムルートアノテーション](#runtime-route-annotations)

同じOpenAPIフィールドが複数のソースによって定義されている場合、ランタイムアノテーションによって提供された値が、コメントベースのアノテーションおよびコンパイラー生成メタデータよりも優先されます。

明示的にオーバーライドされていないメタデータは保持され、最終的なドキュメントにマージされます。