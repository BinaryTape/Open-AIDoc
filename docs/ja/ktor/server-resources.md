[//]: # (title: 型安全なルーティング)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="Resources"/>
<var name="package_name" value="io.ktor.server.resources"/>
<var name="artifact_name" value="ktor-server-resources"/>

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
    <b><Links href="/ktor/server-native" summary="KtorはKotlin/Nativeをサポートしており、追加のランタイムや仮想マシンなしでサーバーを実行できます。">Nativeサーバー</Links>のサポート</b>: ✅
</p>
</tldr>

<link-summary>Resourcesプラグインを使用すると、型安全なルーティングを実装できます。</link-summary>

Ktorは、型安全な[ルーティング](server-routing.md)を実装できる[Resources](https://api.ktor.io/ktor-resources/io.ktor.resources/-resources/index.html)プラグインを提供しています。これを実現するには、型付きルートとして機能するクラスを作成し、そのクラスに`@Resource`キーワードを使用してアノテーションを付加する必要があります。`@Resource`アノテーションは、kotlinx.serializationライブラリによって提供される`@Serializable`の振る舞いを持つことに注意してください。

> Ktorクライアントは、サーバーに対して[型付きリクエスト](client-resources.md)を行う機能を提供しています。

## 依存関係の追加 {id="add_dependencies"}

### kotlinx.serializationの追加 {id="add_serialization"}

[リソースクラス](#resource_classes)は`@Serializable`の振る舞いを持つ必要があるため、[Setup](https://github.com/Kotlin/kotlinx.serialization#setup)セクションの記述に従ってKotlin serializationプラグインを追加する必要があります。

### %plugin_name% 依存関係の追加 {id="add_plugin_dependencies"}

<p>
    <code>%plugin_name%</code>を使用するには、ビルドスクリプトに<code>%artifact_name%</code>アーティファクトを含める必要があります。
</p>
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

## %plugin_name% のインストール {id="install_plugin"}

<p>
    アプリケーションに<code>%plugin_name%</code>プラグインを<a href="#install">インストール</a>するには、
    指定された<Links href="/ktor/server-modules" summary="モジュールを使用すると、ルートをグループ化してアプリケーションを構造化できます。">モジュール</Links>内の<code>install</code>関数に渡します。
    以下のコードスニペットは、<code>%plugin_name%</code>をインストールする方法を示しています。
</p>
<list>
    <li>
        ... <code>embeddedServer</code>関数の呼び出し内。
    </li>
    <li>
        ... <code>Application</code>クラスの拡張関数である、明示的に定義された<code>module</code>内。
    </li>
</list>
<Tabs>
    <TabItem title="embeddedServer">
        <code-block lang="kotlin" code="            import io.ktor.server.engine.*&#10;            import io.ktor.server.netty.*&#10;            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;&#10;            fun main() {&#10;                embeddedServer(Netty, port = 8080) {&#10;                    install(%plugin_name%)&#10;                    // ...&#10;                }.start(wait = true)&#10;            }"></code-block>
    </TabItem>
    <TabItem title="module">
        <code-block lang="kotlin" code="            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;            // ...&#10;            fun Application.module() {&#10;                install(%plugin_name%)&#10;                // ...&#10;            }"></code-block>
    </TabItem>
</Tabs>

## リソースクラスの作成 {id="resource_classes"}

<snippet id="resource_classes_server">

各リソースクラスには`@Resource`アノテーションを付ける必要があります。
以下では、単一のパスセグメントの定義、クエリおよびパスパラメーターなど、リソースクラスのいくつかの例を見ていきます。

### リソースURL {id="resource_url"}

以下の例は、`/articles`パスに応答するリソースを指定する`Articles`クラスを定義する方法を示しています。

```kotlin
import io.ktor.resources.*

@Resource("/articles")
class Articles()
```

### クエリパラメーターを持つリソース {id="resource_query_param"}

以下の`Articles`クラスは、[クエリパラメーター](server-requests.md#query_parameters)として機能する`sort`文字列プロパティを持っており、`/articles?sort=new`のような`sort`クエリパラメーターを持つパスに応答するリソースを定義できます。

```kotlin
@Resource("/articles")
class Articles(val sort: String? = "new")
```

### ネストされたクラスを持つリソース {id="resource_nested"}

クラスをネストして、複数のパスセグメントを含むリソースを作成できます。この場合、ネストされたクラスは外部クラスの型のプロパティを持つ必要があることに注意してください。
以下の例は、`/articles/new`パスに応答するリソースを示しています。

```kotlin
@Resource("/articles")
class Articles() {
    @Resource("new")
    class New(val parent: Articles = Articles())
}
```

### パスパラメーターを持つリソース {id="resource_path_param"}

以下の例は、パスセグメントに一致し、`id`という名前のパラメーターとしてキャプチャする、[ネストされた](#resource_nested) `{id}` 整数[パスパラメーター](server-routing.md#path_parameter)を追加する方法を示しています。

```kotlin
@Resource("/articles")
class Articles() {
    @Resource("{id}")
    class Id(val parent: Articles = Articles(), val id: Long)
}
```

例として、このリソースは`/articles/12`への応答に使用できます。

</snippet>

### 例: CRUD操作用のリソース {id="example_crud"}

上記の例をまとめて、CRUD操作用の`Articles`リソースを作成してみましょう。

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

このリソースは、すべての記事の一覧表示、新しい記事の投稿、編集などに使用できます。このリソースに対する[ルートハンドラーの定義](#define_route)については、次の章で説明します。

> 完全な例はこちらにあります: [resource-routing](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/resource-routing)

## ルートハンドラーの定義 {id="define_route"}

型付きリソースの[ルートハンドラーを定義](server-routing.md#define_route)するには、動詞関数（`get`、`post`、`put`など）にリソースクラスを渡す必要があります。
例えば、以下のルートハンドラーは`/articles`パスに応答します。

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

以下の例は、[例: CRUD操作用のリソース](#example_crud)で作成した`Articles`リソースのルートハンドラーを定義する方法を示しています。ルートハンドラー内では、`Article`をパラメーターとしてアクセスし、そのプロパティ値を取得できることに注意してください。

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
            // ID ${article.id} の記事を表示 ...
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

各エンドポイントのリクエスト処理に関するいくつかのヒントを以下に示します。

- `get<Articles>`

   このルートハンドラーは、`sort`クエリパラメーターに従ってソートされたすべての記事を返すことが想定されています。
   例えば、これはすべての記事を含む[HTMLページ](server-responses.md#html)や[JSONオブジェクト](server-responses.md#object)になります。

- `get<Articles.New>`

   このエンドポイントは、新しい記事を作成するためのフィールドを含む[ウェブフォーム](server-responses.md#html)で応答します。
- `post<Articles>`

   `post<Articles>`エンドポイントは、ウェブフォームを使用して送信された[パラメーター](server-requests.md#form_parameters)を受信することが想定されています。
   Ktorでは、`ContentNegotiation`プラグインを使用してJSONデータを[オブジェクト](server-requests.md#objects)として受信することもできます。
- `get<Articles.Id>`

   このルートハンドラーは、指定された識別子を持つ記事を返すことが想定されています。
   これは、記事を表示する[HTMLページ](server-responses.md#html)や、記事データを含む[JSONオブジェクト](server-responses.md#object)になります。
- `get<Articles.Id.Edit>`

  このエンドポイントは、既存の記事を編集するためのフィールドを含む[ウェブフォーム](server-responses.md#html)で応答します。
- `put<Articles.Id>`

   `post<Articles>`エンドポイントと同様に、`put`ハンドラーはウェブフォームを使用して送信された[フォームパラメーター](server-requests.md#form_parameters)を受信します。
- `delete<Articles.Id>`

   このルートハンドラーは、指定された識別子を持つ記事を削除します。

完全な例はこちらにあります: [resource-routing](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/resource-routing)

## リソースからのリンク構築 {id="resource_links"}

ルーティングにリソース定義を使用するだけでなく、リンクの構築にも使用できます。
これは*リバースルーティング（reverse routing）*と呼ばれることもあります。
リソースからのリンク構築は、[HTML DSL](server-html-dsl.md)で作成されたHTMLドキュメントにこれらのリンクを追加する必要がある場合や、[リダイレクトレスポンス](server-responses.md#redirect)を生成する必要がある場合に役立ちます。

`Resources`プラグインは、オーバーロードされた[href](https://api.ktor.io/ktor-server-resources/io.ktor.server.resources/href.html)メソッドで`Application`を拡張しており、これにより`Resource`からリンクを生成できます。例えば、以下のコードスニペットは、[上記で定義した](#example_crud)`Edit`リソースのリンクを作成します。

```kotlin
val link: String = href(Articles.Id.Edit(Articles.Id(id = 123)))
```

親リソースである`Articles`が`sort`クエリパラメーターをデフォルト値`new`で定義しているため、`link`変数には以下が含まれます。

```
/articles/123/edit?sort=new
```

ホストとプロトコルを指定するURLを生成するには、`href`メソッドに`URLBuilder`を渡すことができます。
この例に示すように、追加のクエリパラメーターも`URLBuilder`を使用して指定できます。

```kotlin
val urlBuilder = URLBuilder(URLProtocol.HTTPS, "ktor.io", parameters = parametersOf("token", "123"))
href(Articles(sort = null), urlBuilder)
val link: String = urlBuilder.buildString()
```

その後、`link`変数には以下が含まれます。

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

完全な例はこちらにあります: [resource-routing](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/resource-routing)