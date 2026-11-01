[//]: # (title: 型安全なリクエスト)

<show-structure for="chapter" depth="2"/>
<primary-label ref="client-plugin"/>

<var name="plugin_name" value="Resources"/>
<var name="artifact_name" value="ktor-client-resources"/>
<var name="ktor_version_catalog_name" value="ktorLibs.client.resources"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="client-type-safe-requests"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
Resources プラグインを使用して型安全なリクエストを行う方法を学びます。
</link-summary>

Ktor は、型安全な[クライアントリクエスト](client-requests.md)を行うための `%plugin_name%` プラグインを提供しています。
これを実現するには、サーバーエンドポイントを表すクラスを定義し、それに `@Resource` キーワードでアノテーションを付与します。

リソースクラスは `kotlinx.serialization` を使用して、プロパティをパスパラメータおよびクエリパラメータに変換します。

> サーバー側では、Ktor は[型安全なルーティング](server-resources.md)を提供しています。
>
{style="tip"}

## 依存関係の追加 {id="add_dependencies"}

### kotlinx.serialization の追加 {id="add_serialization"}

`Resources` プラグインは `kotlinx.serialization` に依存しています。[`kotlinx.serialization` セットアップガイド](https://github.com/Kotlin/kotlinx.serialization#setup)の説明に従って、Kotlin シリアライゼーションプラグインを有効にしてください。

### %plugin_name% の依存関係の追加 {id="add_plugin_dependencies"}

<p>
    <code>%plugin_name%</code> を使用するには、ビルドスクリプトに <code>%artifact_name%</code> アーティファクトを追加します:
</p>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上記のコードスニペットでは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">
            Ktor バージョンカタログ</a>を使用しています。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上記のコードスニペットでは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">
            Ktor バージョンカタログ</a>を使用しています。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>
<tip>
    Ktor クライアントで必要なアーティファクトの詳細については、<Links href="client-dependencies.md" summary="Learn how to add client dependencies to an existing project.">クライアントの依存関係の追加</Links>を参照してください。
</tip>

## %plugin_name% のインストール {id="install_plugin"}

`%plugin_name%` プラグインをインストールするには、[クライアント設定ブロック](client-create-and-configure.md#configure-client)で `install` 関数に渡します:

```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.resources.*
//...
val client = HttpClient(CIO) {
    install(Resources)
}
```

## リソースクラスの作成 {id="resource_classes"}

各リソースクラスには `@Resource` アノテーションを付与する必要があります。
以下では、単一のパスセグメントの定義、クエリパラメータやパスパラメータなど、いくつかのリソースクラスの例を見ていきます。

### リソース URL {id="resource_url"}

以下の例は、`/articles` パスに応答するリソースを指定する `Articles` クラスを定義する方法を示しています。

```kotlin
import io.ktor.resources.*

@Resource("/articles")
class Articles()
```

### クエリパラメータを持つリソース {id="resource_query_param"}

以下の `Articles` クラスは、[クエリパラメータ](server-requests.md#query_parameters)として機能する `sort` 文字列プロパティを持ち、`sort` クエリパラメータを伴う `/articles?sort=new` パスに応答するリソースを定義できます。

```kotlin
@Resource("/articles")
class Articles(val sort: String? = "new")
```

### ネストされたクラスを持つリソース {id="resource_nested"}

クラスをネストすることで、複数のパスセグメントを含むリソースを作成できます。この場合、ネストされたクラスには外部クラスの型のプロパティが必要であることに注意してください。
以下の例は、`/articles/new` パスに応答するリソースを示しています。

```kotlin
@Resource("/articles")
class Articles() {
    @Resource("new")
    class New(val parent: Articles = Articles())
}
```

### パスパラメータを持つリソース {id="resource_path_param"}

以下の例は、パスセグメントにマッチし、それを `id` という名前のパラメータとしてキャプチャする[ネストされた](#resource_nested) `{id}` 整数[パスパラメータ](server-routing.md#path_parameter)を追加する方法を示しています。

```kotlin
@Resource("/articles")
class Articles() {
    @Resource("{id}")
    class Id(val parent: Articles = Articles(), val id: Long)
}
```

例として、このリソースは `/articles/12` へのリクエストに使用できます。

### 例: CRUD 操作用のリソース {id="example_crud"}

以下の例では、CRUD 操作用の `Articles` リソースを作成します:

```kotlin
@Resource("/articles")
class Articles() {
    @Resource("new")
    class New(val parent: Articles = Articles())

    @Resource("{id}")
    class Id(val parent: Articles = Articles(), val id: Long) {
        @Resource("edit")
        class Edit(val parent: Id)
    }
}
```

このリソースは、すべての記事の一覧取得、新しい記事の投稿、および既存記事の編集に使用できます。

次のセクションでは、このリソースを使用して[型安全なリクエストを行う](#make_requests)方法を示します。

> 完全なサンプルコードについては、[client-type-safe-requests](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-type-safe-requests) を参照してください。
>
{style="tip"}

## 型安全なリクエストの実行 {id="make_requests"}

型付けされたリソースに対して[リクエストを送信する](client-requests.md)には、`request()`、`get()`、`post()`、`put()` などのリクエスト関数にリソースクラスのインスタンスを渡します。

以下の例では、`/articles` パスにリクエストを送信します:

```kotlin
@Resource("/articles")
class Articles()

fun main() {
    runBlocking {
        val client = HttpClient(CIO) {
            install(Resources)
            // ...
        }
        val getAllArticles = client.get(Articles())
    }
}
```

以下の例では、[例: CRUD 操作用のリソース](#example_crud) で作成した `Articles` リソースに対して型付けされたリクエストを送信します。

```kotlin
fun main() {
    defaultServer(Application::module).start()
    runBlocking {
        val client = HttpClient(CIO) {
            install(Resources)
            defaultRequest {
                host = "0.0.0.0"
                port = 8080
                url { protocol = URLProtocol.HTTP }
            }
        }

        val getAllArticles = client.get(Articles())
        val newArticle = client.get(Articles.New())
        val postArticle = client.post(Articles()) { setBody("Article content") }
        val getArticle = client.get(Articles.Id(id = 12))
        val editArticlePage = client.get(Articles.Id.Edit(Articles.Id(id = 12)))
        val putArticle = client.put(Articles.Id(id = 12)) { setBody("New article content") }
        val deleteArticle = client.delete(Articles.Id(id = 12))
}
```

[`defaultRequest()`](client-default-request.md) 関数は、すべてのリクエストに対するデフォルト URL を指定します。

> クライアントプラグインや計装（インストルメンテーション）を開発する際、`RESOURCE` リクエスト属性を介して型安全なリクエストに使用されたリソースインスタンスにアクセスできます:
>  ```kotlin
>  onRequest { call, _ ->
>    val resource = call.attributes.getOrNull(RESOURCE)
>  }
>  ```
> 
{style="tip"}

> 完全なサンプルコードについては、[client-type-safe-requests](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-type-safe-requests) を参照してください。
>
{style="tip"}