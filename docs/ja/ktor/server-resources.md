[//]: # (title: 型安全なルーティング)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="Resources"/>
<var name="package_name" value="io.ktor.server.resources"/>
<var name="artifact_name" value="ktor-server-resources"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.resources"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="resource-routing"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="server-native.md" summary="KtorはKotlin/Nativeをサポートしており、追加のランタイムや仮想マシンなしでサーバーを実行できます。">Native サーバー</Links>のサポート</b>: ✅
</p>
</tldr>

<link-summary>Resourcesプラグインを使用すると、型安全なルーティングを実装できます。</link-summary>

Ktorは、型安全な[ルーティング](server-routing.md)を実装できる [Resources](https://api.ktor.io/ktor-resources/io.ktor.resources/-resources/index.html) プラグインを提供しています。これを行うには、型付きルートとして機能するクラスを作成し、そのクラスに `@Resource` キーワードでアノテーションを付加する必要があります。なお、`@Resource` アノテーションは kotlinx.serialization ライブラリによって提供される `@Serializable` の振る舞いを持ちます。

> Ktorクライアントは、サーバーに対して[型付きリクエスト](client-resources.md)を送信する機能を提供します。

## 依存関係の追加 {id="add_dependencies"}

### kotlinx.serialization の追加 {id="add_serialization"}

[リソースクラス](#resource_classes)は `@Serializable` の振る舞いを持つ必要があるため、[Setup](https://github.com/Kotlin/kotlinx.serialization#setup) セクションで説明されているようにKotlinシリアライゼーションプラグインを追加する必要があります。

### %plugin_name% 依存関係の追加 {id="add_plugin_dependencies"}

<p>
    <code>%plugin_name%</code> を使用するには、ビルドスクリプトに <code>%artifact_name%</code> アーティファクトを追加します。
</p>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上記のコードスニペットでは、Ktorの依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">
            Ktor バージョンカタログ</a> を使用しています。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上記のコードスニペットでは、Ktorの依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">
            Ktor バージョンカタログ</a> を使用しています。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## %plugin_name% のインストール {id="install_plugin"}

<p>
    アプリケーションに <code>%plugin_name%</code> プラグインを<a href="server-plugins.md#install">インストール</a>するには、指定された<Links href="server-modules.md" summary="モジュールを使用すると、ルートをグループ化してアプリケーションを構造化できます。">モジュール</Links>内の <code>install</code> 関数に渡します。
    次の例は、<code>%plugin_name%</code> をインストールする方法を示しています。
</p>
<list>
    <li>
        <code>embeddedServer()</code> 関数の呼び出し内。
    </li>
    <li>
        <code>Application</code> クラスで明示的に定義された <code>module()</code> 拡張関数内。
    </li>
</list>
<Tabs>
    <TabItem title="embeddedServer">
        <code-block lang="kotlin" code="            import io.ktor.server.engine.*&#10;            import io.ktor.server.netty.*&#10;            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;&#10;            fun main() {&#10;                embeddedServer(Netty, port = 8080) {&#10;                    install(%plugin_name%)&#10;                    // ...&#10;                }.start(wait = true)&#10;            }"/>
    </TabItem>
    <TabItem title="module">
        <code-block lang="kotlin" code="            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;            // ...&#10;            fun Application.module() {&#10;                install(%plugin_name%)&#10;                // ...&#10;            }"/>
    </TabItem>
</Tabs>

## リソースクラスの作成 {id="resource_classes"}

<snippet id="resource_classes_server">

各リソースクラスには `@Resource` アノテーションを付加する必要があります。
以下では、単一のパスセグメントの定義、クエリパラメータやパスパラメータなど、リソースクラスのいくつかの例を見ていきます。

### リソースのURL {id="resource_url"}

以下の例は、`/articles` パスに応答するリソースを指定する `Articles` クラスを定義する方法を示しています。

```kotlin
import io.ktor.resources.*

@Resource("/articles")
class Articles()
```

### クエリパラメータを持つリソース {id="resource_query_param"}

以下の `Articles` クラスには、[クエリパラメータ](server-requests.md#query_parameters)として機能する文字列プロパティ `sort` があり、`sort` クエリパラメータを持つパス `/articles?sort=new` に応答するリソースを定義できます。

```kotlin
@Resource("/articles")
class Articles(val sort: String? = "new")
```

### ネストされたクラスを持つリソース {id="resource_nested"}

クラスをネストして、複数のパスセグメントを含むリソースを作成できます。この場合、ネストされたクラスには外部クラスの型を持つプロパティが必要であることに注意してください。
以下の例は、`/articles/new` パスに応答するリソースを示しています。

```kotlin
@Resource("/articles")
class Articles() {
    @Resource("new")
    class New(val parent: Articles = Articles())
}
```

### パスパラメータを持つリソース {id="resource_path_param"}

以下の例は、パスセグメントに一致し、それを `id` という名前のパラメータとしてキャプチャする[ネストされた](#resource_nested) `{id}` 整数[パスパラメータ](server-routing.md#path_parameter)を追加する方法を示しています。

```kotlin
@Resource("/articles")
class Articles() {
    @Resource("{id}")
    class Id(val parent: Articles = Articles(), val id: Long)
}
```

例として、このリソースは `/articles/12` への応答に使用できます。

</snippet>

### 例: CRUD操作用のリソース {id="example_crud"}

上記の例をまとめて、CRUD操作用の `Articles` リソースを作成してみましょう。

```kotlin
@Resource("/articles")
class Articles(val sort: String? = "new") {
    @Resource("new")
    class New(val parent: Articles = Articles())

    @Resource("{id}")
    class Id(val parent: Articles = Articles(), val id: Long) {
        @Resource("edit")
        class Edit(val parent: Id)
    }
}
```

このリソースは、すべての記事の一覧表示、新しい記事の投稿、編集などに使用できます。次のセクションで、このリソースに対する[ルートハンドラーの定義](#define_route)方法を見ていきます。

> 完全な例はこちらで確認できます: [resource-routing](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/resource-routing)。

## ルートハンドラーの定義 {id="define_route"}

型付きリソースに対する[ルートハンドラーを定義](server-routing.md#define_route)するには、動詞関数（`get`、`post`、`put` など）にリソースクラスを渡す必要があります。
例えば、以下のルートハンドラーは `/articles` パスに応答します。

```kotlin
@Resource("/articles")
class Articles()

fun Application.module() {
    install(Resources)
    routing {
        get<Articles> { articles ->
            // すべての記事を取得 ...
            call.respondText("List of articles: $articles")
        }
    }
}
```

以下の例は、[例: CRUD操作用のリソース](#example_crud) で作成した `Articles` リソースに対してルートハンドラーを定義する方法を示しています。ルートハンドラー内では、パラメータとして `Article` にアクセスし、そのプロパティ値を取得できる点に注意してください。

```kotlin
fun Application.module() {
    install(Resources)
    routing {
        get<Articles> { article ->
            // すべての記事を取得 ...
            call.respondText("List of articles sorted starting from ${article.sort}")
        }
        get<Articles.New> {
            // 新しい記事を作成するためのフィールドを持つページを表示 ...
            call.respondText("Create a new article")
        }
        post<Articles> {
            // 記事を保存 ...
            call.respondText("An article is saved", status = HttpStatusCode.Created)
        }
        get<Articles.Id> { article ->
            // idが ${article.id} の記事を表示 ...
            call.respondText("An article with id ${article.id}", status = HttpStatusCode.OK)
        }
        get<Articles.Id.Edit> { article ->
            // 記事を編集するためのフィールドを持つページを表示 ...
            call.respondText("Edit an article with id ${article.parent.id}", status = HttpStatusCode.OK)
        }
        put<Articles.Id> { article ->
            // 記事を更新 ...
            call.respondText("An article with id ${article.id} updated", status = HttpStatusCode.OK)
        }
        delete<Articles.Id> { article ->
            // 記事を削除 ...
            call.respondText("An article with id ${article.id} deleted", status = HttpStatusCode.OK)
        }
    }
}
```

各エンドポイントでのリクエスト処理に関するヒントをいくつか紹介します。

- `get<Articles>`

   このルートハンドラーは、`sort` クエリパラメータに従ってソートされたすべての記事を返すことが想定されています。
   例えば、これはすべての記事を含む[HTMLページ](server-responses.md#html)や[JSONオブジェクト](server-responses.md#object)になります。

- `get<Articles.New>`

   このエンドポイントは、新しい記事を作成するためのフィールドを含む[Webフォーム](server-responses.md#html)を応答として返します。
- `post<Articles>`

   `post<Articles>` エンドポイントは、Webフォームを使用して送信された[パラメータ](server-requests.md#form_parameters)を受け取ることが想定されています。
   Ktorでは、`ContentNegotiation` プラグインを使用してJSONデータを[オブジェクト](server-requests.md#objects)として受け取ることもできます。
- `get<Articles.Id>`

   このルートハンドラーは、指定された識別子を持つ記事を返すことが想定されています。
   これは記事を表示する[HTMLページ](server-responses.md#html)や、記事データを含む[JSONオブジェクト](server-responses.md#object)になります。
- `get<Articles.Id.Edit>`

  このエンドポイントは、既存の記事を編集するためのフィールドを含む[Webフォーム](server-responses.md#html)を応答として返します。
- `put<Articles.Id>`

   `post<Articles>` エンドポイントと同様に、`put` ハンドラーはWebフォームを使用して送信された[フォームパラメータ](server-requests.md#form_parameters)を受け取ります。
- `delete<Articles.Id>`

   このルートハンドラーは、指定された識別子を持つ記事を削除します。

完全な例はこちらで確認できます: [resource-routing](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/resource-routing)。

## リソースからのリンクの構築 {id="resource_links"}

リソース定義はルーティングに使用するだけでなく、リンクの構築にも使用できます。
これは_リバースルーティング_（reverse routing）と呼ばれることもあります。
リソースからのリンクの構築は、[HTML DSL](server-html-dsl.md) で作成されたHTMLドキュメントにリンクを追加する必要がある場合や、[リダイレクトレスポンス](server-responses.md#redirect)を生成する必要がある場合に役立ちます。

`Resources` プラグインは `Application` をオーバーロードされた [href](https://api.ktor.io/ktor-server-resources/io.ktor.server.resources/href.html) メソッドで拡張し、`Resource` からリンクを生成できるようにします。例えば、以下のコードスニペットは[上記で定義した](#example_crud) `Edit` リソース用のリンクを作成します。

```kotlin
val link: String = href(Articles.Id.Edit(Articles.Id(id = 123)))
```

祖父母にあたる `Articles` リソースがデフォルト値 `new` を持つ `sort` クエリパラメータを定義しているため、`link` 変数には以下が含まれます。

```
/articles/123/edit?sort=new
```

ホストとプロトコルを指定するURLを生成するには、`href` メソッドに `URLBuilder` を渡すことができます。
この例に示すように、`URLBuilder` を使用して追加のクエリパラメータを指定することもできます。

```kotlin
val urlBuilder = URLBuilder(URLProtocol.HTTPS, "ktor.io", parameters = parametersOf("token", "123"))
href(Articles(sort = null), urlBuilder)
val link: String = urlBuilder.buildString()
```

その結果、`link` 変数には以下が含まれます。

```
https://ktor.io/articles?token=123
```

### 例 {id="example_build_links"}

以下の例は、リソースから構築されたリンクをHTMLレスポンスに追加する方法を示しています。

```kotlin
get {
    call.respondHtml {
        body {
            this@module.apply {
                p {
                    val link: String = href(Articles())
                    a(link) { +"Get all articles" }
                }
                p {
                    val link: String = href(Articles.New())
                    a(link) { +"Create a new article" }
                }
                p {
                    val link: String = href(Articles.Id.Edit(Articles.Id(id = 123)))
                    a(link) { +"Edit an exising article" }
                }
                p {
                    val urlBuilder = URLBuilder(URLProtocol.HTTPS, "ktor.io", parameters = parametersOf("token", "123"))
                    href(Articles(sort = null), urlBuilder)
                    val link: String = urlBuilder.buildString()
                    i { a(link) { +link } }
                }
            }
        }
    }
}
```

完全な例はこちらで確認できます: [resource-routing](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/resource-routing)。