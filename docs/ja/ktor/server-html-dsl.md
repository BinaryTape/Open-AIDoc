[//]: # (title: HTML DSL)

<var name="artifact_name" value="ktor-server-html-builder"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.htmlBuilder"/>
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
    <b><Links href="server-native.md" summary="KtorはKotlin/Nativeをサポートしており、追加のランタイムや仮想マシンなしでサーバーを実行できます。">Nativeサーバー</Links>のサポート</b>: ✅
</p>
</tldr>

HTML DSLは、[kotlinx.html](https://github.com/Kotlin/kotlinx.html)ライブラリをKtorに統合し、HTMLブロックを使用してクライアントに応答できるようにします。HTML DSLを使用すると、Kotlinで純粋なHTMLを記述したり、変数をビューに埋め込んだり、テンプレートを使用して複雑なHTMLレイアウトを構築したりすることができます。

## 依存関係の追加 {id="add_dependencies"}
HTML DSLは[インストール](server-plugins.md#install)を必要としませんが、`%artifact_name%`アーティファクトが必要です。次のようにビルドスクリプトに含めることができます。

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上記のスニペットでは、Ktorの依存関係を指定するために<a href="server-dependencies.topic#using-version-catalog">
            Ktorバージョンカタログ</a>を使用しています。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上記のスニペットでは、Ktorの依存関係を指定するために<a href="server-dependencies.topic#using-version-catalog">
            Ktorバージョンカタログ</a>を使用しています。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>
  

## レスポンスでHTMLを送信する {id="html_response"}
HTMLレスポンスを送信するには、必要な[ルート（route）](server-routing.md)内で[respondHtml](https://api.ktor.io/ktor-server-html-builder/io.ktor.server.html/respond-html.html)メソッドを呼び出します。
以下の例は、HTML DSLのサンプルと、クライアントに送信される対応するHTMLを示しています。

<Tabs>
<TabItem title="Kotlin">

```kotlin
import io.ktor.server.application.*
import io.ktor.server.html.*
import io.ktor.http.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.utils.io.*
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

次の例は、ユーザーから[認証情報](server-form-based-auth.md)を収集するために使用されるHTMLフォームで応答する方法を示しています。

<Tabs>
<TabItem title="Kotlin">

```kotlin
get("/login") {
    call.respondHtml {
        body {
            val urlEncoded = FormEncType
                .applicationXWwwFormUrlEncoded
            form(
                action = "/login",
                encType = urlEncoded,
                method = FormMethod.post
            ) {
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

完全な例については、[auth-form-html-dsl](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-form-html-dsl)を参照してください。

> サーバー側でのフォームパラメーターの受け取りについての詳細は、[フォームパラメーター](server-requests.md#form_parameters)を参照してください。
> 
> kotlinx.htmlを使用したHTMLの生成についての詳細は、[kotlinx.html wiki](https://github.com/Kotlin/kotlinx.html/wiki)を参照してください。

## 部分的なHTMLの送信 {id="html_fragments"}

完全なHTMLドキュメントの生成に加えて、`.respondHtmlPartial()`関数を使用してHTMLフラグメント（断片）で応答することもできます。

HTMLフラグメントは、HTMXのようなライブラリで使用される動的更新など、完全な`<html>`ドキュメントを必要としない部分的なマークアップを返す場合に役立ちます。

<Tabs>
<TabItem title="Kotlin">

```kotlin
import io.ktor.server.application.*
import io.ktor.server.html.*
import io.ktor.http.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.utils.io.*
import kotlinx.html.*

fun Application.module() {
    routing {
        get("/fragment") {
            call.respondHtmlPartial(HttpStatusCode.Created) {
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

この関数は`.respondHtml()`と同様に機能しますが、ルートHTML要素を追加せず、ビルダー内で定義したコンテンツのみをレンダリングします。

## テンプレート {id="templates"}

プレーンなHTMLの生成に加えて、Ktorは複雑なレイアウトを構築するために使用できるテンプレートエンジンを提供しています。ページ全体用のルートテンプレート、ページヘッダーやフッター用の子テンプレートなど、HTMLページのさまざまな部分に対してテンプレートの階層を作成できます。Ktorは、テンプレートを操作するための次のAPIを公開しています。

1. 指定されたテンプレートに基づいて構築されたHTMLで応答するには、[respondHtmlTemplate](https://api.ktor.io/ktor-server-html-builder/io.ktor.server.html/respond-html-template.html)メソッドを呼び出します。
2. テンプレートを作成するには、[Template](https://api.ktor.io/ktor-server-html-builder/io.ktor.server.html/-template/index.html)インターフェースを実装し、HTMLを提供する`Template.apply`メソッドをオーバーライドする必要があります。
3. 作成したテンプレートクラス内では、さまざまなコンテンツタイプに対応するプレースホルダーを定義できます。
    * [Placeholder](https://api.ktor.io/ktor-server-html-builder/io.ktor.server.html/-placeholder/index.html)はコンテンツを挿入するために使用されます。[PlaceholderList](https://api.ktor.io/ktor-server-html-builder/io.ktor.server.html/-placeholder-list/index.html)は、複数回出現するコンテンツ（リスト項目など）を挿入するために使用できます。
    * [TemplatePlaceholder](https://api.ktor.io/ktor-server-html-builder/io.ktor.server.html/-template-placeholder/index.html)は、子テンプレートを挿入してネストされたレイアウトを作成するために使用できます。
    

### 例 {id="example"}
テンプレートを使用して階層的なレイアウトを作成する方法の[例](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/html-templates)を見てみましょう。次のようなHTMLがあるとします。
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
このページのレイアウトは2つの部分に分割できます。
* ページヘッダー用のルートレイアウトテンプレートと記事用の子テンプレート。
* 記事コンテンツ用の子テンプレート。

これらのレイアウトを段階的に実装してみましょう。
  
1. `respondHtmlTemplate`メソッドを呼び出し、パラメーターとしてテンプレートクラスを渡します。この場合、`Template`インターフェースを実装する必要がある`LayoutTemplate`クラスになります。
   ```kotlin
   get("/") {
       call.respondHtmlTemplate(LayoutTemplate()) {
           // ...
       }
   }
   ```
   ブロック内では、テンプレートにアクセスしてそのプロパティ値を指定できます。これらの値は、テンプレートクラスで指定されたプレースホルダーを置き換えます。次のステップで`LayoutTemplate`を作成し、そのプロパティを定義します。
  
2. ルートレイアウトテンプレートは次のようになります。
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

   このクラスは2つのプロパティを公開します。
   * `header`プロパティは、`h1`タグ内に挿入されるコンテンツを指定します。
   * `content`プロパティは、記事コンテンツ用の子テンプレートを指定します。

3. 子テンプレートは次のようになります。
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

   このテンプレートは`articleTitle`、`articleText`、`list`プロパティを公開し、それらの値は`article`の内部に挿入されます。

4. テンプレートとして値のリストを提供するには、次のように新しいクラスを作成します。
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

   このテンプレートは、`PlaceholderList`クラスを使用して、提供された項目から順不同リスト（`UL`）を生成します。
   また、強調のために最初の項目を`<b>`要素でラップします。

5. これで、指定したプロパティ値を使用して構築されたHTMLを送信する準備が整いました。
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

完全な例はこちらで確認できます: [html-templates](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/html-templates)。