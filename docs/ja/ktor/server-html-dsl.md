[//]: # (title: HTML DSL)

<var name="artifact_name" value="ktor-server-html-builder"/>
<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="html"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">Native サーバー</Links>のサポート</b>: ✅
</p>
</tldr>

HTML DSL は [kotlinx.html](https://github.com/Kotlin/kotlinx.html) ライブラリを Ktor に統合し、HTML ブロックを使用してクライアントにレスポンスを返すことを可能にします。HTML DSL を使用すると、Kotlin で純粋な HTML を記述したり、ビューに変数を挿入したり、テンプレートを使用して複雑な HTML レイアウトを構築したりできます。

## 依存関係の追加 {id="add_dependencies"}
HTML DSL は[インストール](server-plugins.md#install)の必要はありませんが、`%artifact_name%` アーティファクトが必要です。以下のようにビルドスクリプトに含めることができます。

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
  

## レスポンスで HTML を送信する {id="html_response"}
HTML レスポンスを送信するには、必要な[ルート](server-routing.md)内で [respondHtml](https://api.ktor.io/ktor-server-html-builder/io.ktor.server.html/respond-html.html) メソッドを呼び出します。
以下の例は、サンプルの HTML DSL と、クライアントに送信される対応する HTML を示しています。

<Tabs>
<TabItem title="Kotlin">

```kotlin
import io.ktor.server.application.*
import io.ktor.server.html.*
import io.ktor.http.*
import io.ktor.server.routing.*
import kotlinx.html.*

fun Application.module() {
    routing {
        get("/") {
            val name = "Ktor"
            call.respondHtml(HttpStatusCode.OK) {
                head {
                    title {
                        +name
                    }
                }
                body {
                    h1 {
                        +"Hello from $name!"
                    }
                }
            }
        }
    }
}
```

</TabItem>
<TabItem title="HTML">

```html
<html>
<head>
    <title>Ktor</title>
</head>
<body>
<h1>Hello from Ktor!</h1>
</body>
</html>
```

</TabItem>
</Tabs>

次の例は、ユーザーから[認証情報](server-form-based-auth.md)を収集するために使用される HTML フォームでレスポンスを返す方法を示しています。

<Tabs>
<TabItem title="Kotlin">

```kotlin
get("/login") {
    call.respondHtml {
        body {
            form(action = "/login", encType = FormEncType.applicationXWwwFormUrlEncoded, method = FormMethod.post) {
                p {
                    +"Username:"
                    textInput(name = "username")
                }
                p {
                    +"Password:"
                    passwordInput(name = "password")
                }
                p {
                    submitInput() { value = "Login" }
                }
            }
        }
    }
}
```

</TabItem>
<TabItem title="HTML">

```html
<html>
<body>
<form action="/login" enctype="application/x-www-form-urlencoded" method="post">
    <p>Username:<input type="text" name="username"></p>
    <p>Password:<input type="password" name="password"></p>
    <p><input type="submit" value="Login"></p>
</form>
</body>
</html>
```

</TabItem>
</Tabs>

完全な例については、[auth-form-html-dsl](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-form-html-dsl) を参照してください。

> サーバー側でフォームパラメータを受け取る方法の詳細については、[フォームパラメータ](server-requests.md#form_parameters)を参照してください。
> 
> kotlinx.html を使用した HTML 生成の詳細については、[kotlinx.html wiki](https://github.com/Kotlin/kotlinx.html/wiki) を参照してください。

## HTML 部分テンプレートの送信 {id="html_fragments"}

完全な HTML ドキュメントの生成に加えて、`.respondHtmlFragment()` 関数を使用して HTML フラグメントでレスポンスを返すこともできます。

HTML フラグメントは、HTMX のようなライブラリで使用される動的な更新など、完全な `<html>` ドキュメントを必要としない部分的なマークアップを返す場合に便利です。

<Tabs>
<TabItem title="Kotlin">

```kotlin
import io.ktor.server.application.*
import io.ktor.server.html.*
import io.ktor.http.*
import io.ktor.server.routing.*
import kotlinx.html.*

fun Application.module() {
    routing {
        get("/fragment") {
            call.respondHtmlFragment(HttpStatusCode.Created) {
                div("fragment") {
                    span { +"Created!" }
                }
            }
        }
    }
}
```

</TabItem>
<TabItem title="HTML">

```html
<div class="fragment">
    <span>
        Created!
    </span>
</div>

```

</TabItem>
</Tabs>

この関数は `.respondHtml()` と同様に動作しますが、ルート HTML 要素を追加せずに、ビルダー内で定義したコンテンツのみをレンダリングします。

## テンプレート {id="templates"}

単純な HTML の生成に加えて、Ktor は複雑なレイアウトを構築するために使用できるテンプレートエンジンを提供します。HTML ページのさまざまな部分に対してテンプレートの階層を作成できます。たとえば、ページ全体のリミットテンプレート、ページヘッダーとフッターの子テンプレートなどです。Ktor はテンプレートを操作するための以下の API を提供しています。

1. 指定されたテンプレートに基づいて構築された HTML でレスポンスを返すには、[respondHtmlTemplate](https://api.ktor.io/ktor-server-html-builder/io.ktor.server.html/respond-html-template.html) メソッドを呼び出します。
2. テンプレートを作成するには、[Template](https://api.ktor.io/ktor-server-html-builder/io.ktor.server.html/-template/index.html) インターフェースを実装し、HTML を提供する `Template.apply` メソッドをオーバーライドする必要があります。
3. 作成されたテンプレートクラス内で、さまざまなコンテンツタイプのプレースホルダーを定義できます。
    * [Placeholder](https://api.ktor.io/ktor-server-html-builder/io.ktor.server.html/-placeholder/index.html) はコンテンツを挿入するために使用されます。[PlaceholderList](https://api.ktor.io/ktor-server-html-builder/io.ktor.server.html/-placeholder-list/index.html) は、複数回表示されるコンテンツ（例：リストアイテム）を挿入するために使用できます。
    * [TemplatePlaceholder](https://api.ktor.io/ktor-server-html-builder/io.ktor.server.html/-template-placeholder/index.html) は、子テンプレートを挿入してネストされたレイアウトを作成するために使用できます。
    

### 例 {id="example"}
テンプレートを使用して階層的なレイアウトを作成する方法の[例](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/html-templates)を見てみましょう。次のような HTML があると仮定します。
```html
<body>
<h1>Ktor</h1>
<article>
    <h2>Hello from Ktor!</h2>
    <p>Kotlin Framework for creating connected systems.</p>
    <ul>
       <li><b>One</b></li>
       <li>Two</li>
    </ul>
</article>
</body>
```
このページのレイアウトを 2 つの部分に分けることができます。
* ページヘッダー用のルートレイアウトテンプレートと、記事用の子テンプレート。
* 記事コンテンツ用の子テンプレート。

これらのレイアウトをステップバイステップで実装してみましょう。
  
1. `respondHtmlTemplate` メソッドを呼び出し、パラメータとしてテンプレートクラスを渡します。この例では、`Template` インターフェースを実装する必要がある `LayoutTemplate` クラスです。
   ```kotlin
   get("/") {
       call.respondHtmlTemplate(LayoutTemplate()) {
           // ...
       }
   }
   ```
   ブロック内では、テンプレートにアクセスしてそのプロパティ値を指定できます。これらの値は、テンプレートクラスで指定されたプレースホルダーを置き換えます。次のステップで `LayoutTemplate` を作成し、そのプロパティを定義します。
  
2. ルートレイアウトテンプレートは以下のようになります。
   ```kotlin
   class LayoutTemplate: Template<HTML> {
       val header = Placeholder<FlowContent>()
       val content = TemplatePlaceholder<ArticleTemplate>()
       override fun HTML.apply() {
           body {
               h1 {
                   insert(header)
               }
               insert(ArticleTemplate(), content)
           }
       }
   }
   ```

   このクラスは 2 つのプロパティを公開しています。
   * `header` プロパティは、`h1` タグ内に挿入されるコンテンツを指定します。
   * `content` プロパティは、記事コンテンツ用の子テンプレートを指定します。

3. 子テンプレートは以下のようになります。
   ```kotlin
   class ArticleTemplate : Template<FlowContent> {
       val articleTitle = Placeholder<FlowContent>()
       val articleText = Placeholder<FlowContent>()
       val list = TemplatePlaceholder<ListTemplate>()
       override fun FlowContent.apply() {
           article {
               h2 {
                   insert(articleTitle)
               }
               p {
                   insert(articleText)
               }
               insert(ListTemplate(), list)
           }
       }
   }
   ```

   このテンプレートは `articleTitle`、`articleText`、`list` プロパティを公開しており、それらの値は `article` 内に挿入されます。

4. テンプレートとして値のリストを提供するには、次の新しいクラスを作成します。 
   ```kotlin
   class ListTemplate : Template<FlowContent> {
       val item = PlaceholderList<UL, FlowContent>()
       override fun FlowContent.apply() {
           if (!item.isEmpty()) {
               ul {
                   each(item) {
                       li {
                           if (it.first) {
                               b {
                                   insert(it)
                               }
                           } else {
                               insert(it)
                           }
                       }
                   }
               }
           }
       }
   }
   ```

   このテンプレートは、`PlaceholderList` クラスを使用して、提供されたアイテムから順序なしリスト (`UL`) を生成します。また、強調のために最初のアイテムを `<b>` 要素で囲みます。

5. これで、指定されたプロパティ値を使用して構築された HTML を送信する準備が整いました。
   ```kotlin
   get("/") {
       call.respondHtmlTemplate(LayoutTemplate()) {
           header {
               +"Ktor"
           }
           content {
               articleTitle {
                   +"Hello from Ktor!"
               }
               articleText {
                   +"Kotlin Framework for creating connected systems."
               }
               list {
                   item { +"One" }
                   item { +"Two" }
               }
           }
       }
   }
   ```

完全な例はこちらで見つけることができます: [html-templates](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/html-templates)。