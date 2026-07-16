[//]: # (title: OpenAPI仕様の生成)

<show-structure for="chapter" depth="2"/>
<secondary-label ref="server-feature"/>

<var name="artifact_name" value="ktor-server-routing-openapi"/>
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

Ktorは、1つ以上のドキュメントソースから実行時にOpenAPI仕様を構築するためのサポートを提供しています。

この機能は、以下を通じて利用可能です：
* OpenAPIコンパイラ拡張（Ktor Gradleプラグインに含まれています）：コンパイル時にルーティングコードを分析し、実行時にOpenAPIメタデータを登録するKotlinコードを生成します。
* ルーティングアノテーション実行時API：実行中のアプリケーション内のルートにOpenAPIメタデータを直接アタッチします。

これらの一方または両方を使用し、[OpenAPI](server-openapi.md)および[SwaggerUI](server-swagger-ui.md)プラグインと組み合わせることで、インタラクティブなAPIドキュメントを提供できます。

> OpenAPI Gradle拡張にはKotlin 2.2.20が必要です。他のバージョンを使用すると、コンパイルエラーが発生する可能性があります。
>
{style="note"}

## 依存関係の追加

* OpenAPIメタデータの生成を有効にするには、プロジェクトにKtorコンパイラプラグインを適用します。

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

    Gradleとは異なり、MavenはKtorコンパイラプラグインの組み込み統合を提供していません。OpenAPI仕様の生成を有効にするには、コンパイラプラグインを手動で設定する必要があります。

    1. Ktor Mavenプラグインを適用します（アプリケーションの実行およびパッケージ化に必要です）：
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
    2. コンパイラプラグインはJARファイルとして利用可能である必要があります。以下の設定を追加して、自動的にダウンロードし、安定した場所にコピーするようにします：

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
  
    3. Kotlinコンパイラを設定します：

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

* 実行時ルートアノテーションを使用するには、ビルドスクリプトに`%artifact_name%`アーティファクトを追加します：

  <Tabs group="languages">
      <TabItem title="Gradle (Kotlin)" group-key="kotlin">
          <code-block lang="Kotlin" code="              implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
      </TabItem>
      <TabItem title="Gradle (Groovy)" group-key="groovy">
          <code-block lang="Groovy" code="              implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
      </TabItem>
      <TabItem title="Maven" group-key="maven">
          <code-block lang="XML" code="              &lt;dependency&gt;&#10;                  &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                  &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                  &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;              &lt;/dependency&gt;"></code-block>
      </TabItem>
  </Tabs>

## OpenAPIコンパイラ拡張の設定 {id="configure-the-extension"}

OpenAPIコンパイラ拡張は、コンパイル時にルーティングメタデータを収集する方法を制御します。
これは、最終的なOpenAPIドキュメント自体を定義するものではありません。

コンパイル中、プラグインはOpenAPI実行時APIを使用して、ルーティング宣言、コードパターン、およびコメントから派生したメタデータを登録するKotlinコードを生成します。

APIのタイトル、バージョン、サーバー、セキュリティスキーム、詳細なスキーマなどの一般的なOpenAPI情報は、[仕様が生成されるとき](#generate-and-serve-the-specification)に実行時に提供されます。

コンパイラプラグイン拡張を設定するには、<Path>build.gradle.kts</Path>ファイルの`ktor`拡張内の`openApi {}`ブロックを使用します：

```kotlin
ktor {
    openApi {
        enabled = true
        codeInferenceEnabled = true
        onlyCommented = false
    }
}
```

### 設定オプション

<deflist>
<def>
<title><code>enabled</code></title>
OpenAPIルートアノテーションコードの生成を有効または無効にします。デフォルトは<code>false</code>です。
</def>
<def>
<title><code>codeInferenceEnabled</code></title>
コンパイラがルーティングコードからOpenAPIメタデータを推論しようとするかどうかを制御します。デフォルトは<code>true</code>です。
推論によって誤った結果が生じる場合や、アノテーションを使用して明示的にメタデータを定義したい場合は、このオプションを無効にしてください。
詳細については、<a href="#code-inference">コード推論ルール</a>を参照してください。
</def>
<def>
<title><code>onlyCommented</code></title>
メタデータの生成を、コメントアノテーションを含むルートのみに制限します。デフォルトは<code>false</code>で、<code>@ignore</code>で明示的にマークされたものを除き、すべてのルーティング呼び出しが処理されることを意味します。
</def>
</deflist>

### ルーティング構造の分析

Ktorコンパイラプラグインは、サーバーのルーティングDSLを分析して、APIの構造的な形状を決定します。この分析はルート宣言のみに基づいて行われ、ルートハンドラーの内容は検査されません。

ルーティングAPIツリーのセレクターから、以下が自動的に推論されます：
- マージされたパス（例：`/api/v1/users/{id}`）。
- HTTPメソッド（`GET`や`POST`など）。
- パスパラメータ。

```kotlin
routing {
    route("/api/v1") {
        get("/users") { }
        get("/users/{id}") { }
        post("/users") { }
    }
}
```

リクエストパラメータ、ボディ、レスポンスはルートラムダの内部で処理されるため、コンパイラはルーティング構造だけから完全なOpenAPI記述を推論することはできません。生成されるメタデータを充実させるために、Ktorは[アノテーション](#annotate-routes)と、一般的なリクエスト処理パターンに基づく[自動推論](#code-inference)をサポートしています。

### コード推論

コード推論が有効な場合、コンパイラプラグインは一般的なKtorの使用パターンを認識し、同等の実行時アノテーションを自動的に生成します。

次の表は、サポートされている推論ルールをまとめたものです：

| ルール                | 説明                                                    | 入力                                                                      | 出力（annotateスコープから）                                             |
|---------------------|----------------------------------------------------------------|----------------------------------------------------------------------------|--------------------------------------------------------------------------|
| リクエストボディ        | `ContentNegotiation`の読み取りからリクエストボディスキーマを提供   | `call.receive<T>()`                                                        | `requestBody { schema = jsonSchema<T>() }`                               |
| レスポンスボディ       | `ContentNegotiation`の書き込みからレスポンスボディスキーマを提供 | `call.respond<T>()`                                                        | `responses { HttpStatusCode.OK { schema = jsonSchema<T>() } }`           |
| レスポンスヘッダー    | レスポンスにカスタムヘッダーを含める                          | `call.response.header("X-Foo", "Bar")`                                     | `responses { HttpStatusCode.OK { headers { header("X-Foo", "Bar") } } }` |
| パスパラメータ     | パスパラメータの参照を検出                                | `call.parameters["id"]`                                                    | `parameters { path("id") }`                                              |
| クエリパラメータ    | クエリパラメータの参照を検出                               | `call.queryParameters["name"]`                                             | `parameters { query("name") }`                                           |
| リクエストヘッダー     | リクエストヘッダーの参照を検出                                | `call.request.headers["X-Foo"]`                                            | `parameters { header("X-Foo") }`                                         |
| Resource APIルート | ResourcesルーティングAPIの呼び出し構造を推論            | `call.get<List> { /**/ }; @Resource("/list") class List(val name: String)` | `parameters { query("name") }`                                           |

推論は可能な限り抽出された関数を追跡し、典型的なリクエストおよびレスポンスフローに対して一貫したドキュメントを生成しようとします。

#### 特定のエンドポイントの推論を無効にする

特定のエンドポイントに対して推論が正しくないメタデータを生成する場合、`ignore`マーカーを追加することで除外できます：

```kotlin
// ignore!
get("/comments") {
    // ...
}
```

## ルートへのアノテーション追加 {id="annotate-routes"}

仕様を充実させるために、Ktorはルートにアノテーションを付ける2つの方法をサポートしています：

- [コメントベースのアノテーション](#comment-annotations)：コンパイラプラグインによって分析されます。
- [実行時ルートアノテーション](#runtime-route-annotations)：`.describe {}` DSLを使用して定義されます。

どちらのアプローチも使用でき、両方を組み合わせることも可能です。

### コメントベースのルートアノテーション {id="comment-annotations"}

コメントベースのアノテーションは、コードから推論できないメタデータを提供し、既存のルートとシームレスに統合されます。

メタデータは、行の先頭にキーワードを置き、その後にコロン（`:`）と値を続けることで定義されます。

コメントはルート宣言に直接アタッチできます：

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

#### フォーマットルール

- キーワードは行の先頭にある必要があります。
- コロン（`:`）がキーワードと値を区切ります。
- 複数形（例：`Tags`、`Responses`）はグループ化された定義を可能にします。
- 単数形（例：`Tag`、`Response`）もサポートされています。
- トップレベルの箇条書き（`-`）はオプションであり、フォーマットにのみ影響します。

以下のバリアントは同等です：

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

#### サポートされているコメントフィールド

| タグ            | フォーマット                                          | 説明                      |
|----------------|-------------------------------------------------|----------------------------------|
| `Tag`          | `Tag: name`                                     | エンドポイントをタグでグループ化します  |
| `Path`         | `Path: [Type] name description`                 | パスパラメータ                   |
| `Query`        | `Query: [Type] name description`                | クエリパラメータ                  |
| `Header`       | `Header: [Type] name description`               | ヘッダーパラメータ                 |
| `Cookie`       | `Cookie: [Type] name description`               | クッキーパラメータ                 |
| `Body`         | `Body: contentType [Type] description`          | リクエストボディ                     |
| `Response`     | `Response: code contentType [Type] description` | レスポンス定義              |
| `Deprecated`   | `Deprecated: reason`                            | エンドポイントを非推奨としてマークします |
| `Description`  | `Description: text`                             | 詳細な説明             |
| `Security`     | `Security: scheme`                              | セキュリティ要件            |
| `ExternalDocs` | `ExternalDocs: href`                            | 外部ドキュメントへのリンク      |

### 実行時ルートアノテーション {id="runtime-route-annotations"}

<primary-label ref="experimental"/>

動的ルーティング、インターセプター、または条件付きロジックを使用している場合など、コンパイル時の分析が不十分なケースでは、`.describe {}`拡張関数を使用して実行時にルートにOpenAPIオペレーションメタデータを直接アタッチできます。

アノテーションが付けられた各ルートは、生成されたOpenAPI仕様において単一のHTTP操作（例：`GET /users`）を表すOpenAPI [Operationオブジェクト](https://swagger.io/specification/#operation-object)を定義します。
メタデータは実行時にルーティングツリーにアタッチされ、OpenAPIおよびSwagger UIプラグインによって消費されます。

`.describe {}` DSLはOpenAPI仕様に直接マップされます。プロパティ名と構造は、パラメータ、リクエストボディ、レスポンス、セキュリティ要件、サーバー、コールバック、仕様拡張（`x-*`）を含む、Operationオブジェクトに対して定義されたフィールドに対応しています。

実行時ルートアノテーションAPIは実験的であり、`@OptIn(ExperimentalKtorApi::class)`を使用してオプトインする必要があります：

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

実行時アノテーションは、コンパイラによって生成されたメタデータおよびコメントベースのメタデータとマージされます。
同じOpenAPIフィールドが複数のソースで定義されている場合、実行時アノテーションによって提供される値が[優先](#metadata-precedence)されます。

## OpenAPI仕様からルートを隠す

生成されるOpenAPIドキュメントからルートとその子を除外するには、`Route.hide()`関数を使用します：

```kotlin
@OptIn(ExperimentalKtorApi::class)
get("/routes") {
    // ....
}.hide()
```

これは、[OpenAPI仕様自体を生成](#assemble-and-serve-the-specification)するために使用されるルートを含む、公開すべきでない内部用、管理用、または診断用のエンドポイントに役立ちます。

OpenAPIおよびSwagger UIプラグインは自動的に`.hide()`を呼び出すため、それらのルートは結果のドキュメントから除外されます。

## スキーマ推論

Ktorは、OpenAPI仕様を構築する際に、リクエストおよびレスポンス型のJSONスキーマを自動的に生成します。デフォルトでは、データクラス上の`kotlinx-serialization`記述子を使用した型参照からスキーマが推論されます。これにより、追加の労力をかけずに、ほとんどの一般的なデータモデルをドキュメント化できます。

### アノテーションによるスキーマのカスタマイズ

データクラスに[`@JsonSchema`](https://api.ktor.io/ktor-openapi-schema/io.ktor.openapi/-json-schema/index.html)アノテーションを追加することで、自動生成されたJSONスキーマフィールドをオーバーライドできます。これにより、説明の追加やフィールドの必須化などを行うことができます。

```kotlin
@JsonSchema.Description("Represents a news article")
data class Article(
    val title: String,
    val content: String
)
```

### リフレクションベースのスキーマ推論の使用

`kotlinx-serialization`の代わりにJacksonやGsonを使用しているプロジェクトでは、リフレクションベースのスキーマ推論を使用できます。そのためには、OpenAPIまたはSwaggerUIプラグインの`Routing`ソースにある`schemaInference`フィールドを設定します。

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

### リフレクションの動作のカスタマイズ

カスタムの`SchemaReflectionAdapter`を提供して、直接サポートされていないアノテーションや命名規則を処理できます。

`SchemaReflectionAdapter`は`ReflectionJsonSchemaInference`のフィールドであり、プロパティ名、無視されるフィールド、null許容ルールなどのデフォルトの動作をオーバーライドできます。

たとえば、Gsonの`@SerializedName`アノテーションをサポートするように動作をカスタマイズできます：

```kotlin
ReflectionJsonSchemaInference(object : SchemaReflectionAdapter {
    override fun getName(type: KType): String? {
        return (type.classifier as? `KClass<*>`)?.let {
            findAnnotations(SerializedName::class)?.value ?: it.simpleName
        }
    }
})
```

## 仕様の生成と提供

OpenAPI仕様は、実行時ルートアノテーションとコンパイラプラグインによって生成されたメタデータから実行時に組み立てられます。

以下の方法で仕様を公開できます：

- [OpenAPIドキュメントを手動で組み立てて提供する](#assemble-and-serve-the-specification)。
- [OpenAPI](server-openapi.md)または[SwaggerUI](server-swagger-ui.md)プラグインを使用して、仕様とインタラクティブなドキュメントを提供する。

### 仕様の組み立てと提供

実行時に完全なOpenAPIドキュメントを組み立てるには、`OpenApiDoc`インスタンスを作成し、仕様に含めるべきルートを提供します。

ドキュメントは、ルーティングツリーからのコンパイラ生成メタデータと実行時ルートアノテーションから組み立てられます。結果の`OpenApiDoc`インスタンスは、常にアプリケーションの現在の状態を反映します。

通常、ルートハンドラーからドキュメントを構築し、それを直接レスポンスとして返します：

```kotlin

        get("/docs.json") {
            val doc = OpenApiDoc(info = OpenApiInfo("My API", "1.0")) + call.application.routingRoot.descendants()
            call.respond(doc)
```

この例では、OpenAPIドキュメントは[`ContentNegotiation`](server-serialization.md)プラグインを使用してシリアライズされます。これには、JSONシリアライザー（例：`kotlinx.serialization`）がインストールされていることを前提としています。

追加のビルドや生成ステップは必要ありません。ルートやアノテーションへの変更は、次回仕様がリクエストされたときに自動的に反映されます。

> シリアライズを明示的に行いたい場合や、`ContentNegotiation`に依存したくない場合は、手動でドキュメントをエンコードしてJSONをレスポンスとして返すことができます：
> 
> ```kotlin
> call.respondText(
>   Json.encodeToString(docs),
>   ContentType.Application.Json
> )
>```
>
{style="note"}

### インタラクティブなドキュメントの提供

インタラクティブなUIを通じてOpenAPI仕様を公開するには、[OpenAPI](server-openapi.md)および[Swagger UI](server-swagger-ui.md)プラグインを使用します。

両方のプラグインは実行時に仕様を組み立て、ルーティングツリーからメタデータを直接読み取ることができます。
これらはドキュメントのレンダリング方法が異なります：
- OpenAPIプラグインはサーバー上でドキュメントをレンダリングし、事前生成されたHTMLを提供します。
- Swagger UIプラグインはOpenAPI仕様をJSONまたはYAMLとして提供し、Swagger UIを使用してブラウザでUIをレンダリングします。

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

### メタデータの優先順位

最終的なOpenAPI仕様は、複数のソースから提供されたメタデータをマージすることによって実行時に組み立てられます。

以下のソースが順番に適用されます：

1. コンパイラ生成メタデータ（以下を含む）：
    - [ルーティング構造の分析](#routing-structure-analysis)
    - [コード推論](#code-inference)
2. [コメントベースのルートアノテーション](#comment-annotations)
3. [実行時ルートアノテーション](#runtime-route-annotations)

同じOpenAPIフィールドが複数のソースで定義されている場合、実行時アノテーションによって提供される値は、コメントベースのアノテーションやコンパイラ生成メタデータよりも優先されます。

明示的にオーバーライドされていないメタデータは保持され、最終的なドキュメントにマージされます。