[//]: # (title: CSS DSL)

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:ktor-server-html-builder</code>, <code>org.jetbrains.kotlin-wrappers:kotlin-css</code>
</p>
<var name="example_name" value="css-dsl"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

CSS DSL は [HTML DSL](server-html-dsl.md) を拡張し、[kotlin-css](https://github.com/JetBrains/kotlin-wrappers/blob/master/kotlin-css/README.md) ラッパーを使用して Kotlin でスタイルシートを作成できるようにします。

> 静的コンテンツとしてスタイルシートを配信する方法については、[静的コンテンツの配信](server-static-content.md) を参照してください。

## 依存関係の追加 {id="add_dependencies"}
CSS DSL は [インストール](server-plugins.md#install) の必要はありませんが、ビルドスクリプトに以下のアーティファクトを含める必要があります:

1. HTML DSL 用の `ktor-server-html-builder` アーティファクト:

   <var name="artifact_name" value="ktor-server-html-builder"/>
   <var name="ktor_version_catalog_name" value="ktorLibs.server.htmlBuilder"/>
   <Tabs group="languages">
       <TabItem title="Gradle (Kotlin)" group-key="kotlin">
           <code-block lang="Kotlin" code="               implementation(%ktor_version_catalog_name%)"/>
           <note>
               上記のスニペットは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">
               Ktor バージョンカタログ</a> を使用しています。
           </note>
       </TabItem>
       <TabItem title="Gradle (Groovy)" group-key="groovy">
           <code-block lang="Groovy" code="               implementation %ktor_version_catalog_name%"/>
           <note>
               上記のスニペットは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">
               Ktor バージョンカタログ</a> を使用しています。
           </note>
       </TabItem>
       <TabItem title="Maven" group-key="maven">
           <code-block lang="XML" code="               &lt;dependency&gt;&#10;                   &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                   &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                   &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;               &lt;/dependency&gt;"/>
       </TabItem>
   </Tabs>
   
2. CSS を構築するための `kotlin-css-jvm` アーティファクト:

   <var name="group_id" value="org.jetbrains.kotlin-wrappers"/>
   <var name="artifact_name" value="kotlin-css"/>
   <var name="version" value="kotlin_css_version"/>
   <Tabs group="languages">
       <TabItem title="Gradle (Kotlin)" group-key="kotlin">
           <code-block lang="Kotlin" code="               implementation(&quot;%group_id%:%artifact_name%:$%version%&quot;)"/>
       </TabItem>
       <TabItem title="Gradle (Groovy)" group-key="groovy">
           <code-block lang="Groovy" code="               implementation &quot;%group_id%:%artifact_name%:$%version%&quot;"/>
       </TabItem>
       <TabItem title="Maven" group-key="maven">
           <code-block lang="XML" code="               &lt;dependency&gt;&#10;                   &lt;groupId&gt;%group_id%&lt;/groupId&gt;&#10;                   &lt;artifactId&gt;%artifact_name%&lt;/artifactId&gt;&#10;                   &lt;version&gt;${%version%}&lt;/version&gt;&#10;               &lt;/dependency&gt;"/>
       </TabItem>
   </Tabs>
   
   `$kotlin_css_version` は、必要な `kotlin-css` アーティファクトのバージョン（例: `%kotlin_css_version%`）に置き換えることができます。

## CSS の配信 {id="serve_css"}

CSS レスポンスを送信するには、`ApplicationCall` を拡張して `respondCss` メソッドを追加し、スタイルシートを文字列にシリアライズして `CSS` コンテンツタイプでクライアントに送信できるようにします:

```kotlin
suspend inline fun ApplicationCall.respondCss(builder: CssBuilder.() -> Unit) {
    this.respondText(CssBuilder().apply(builder).toString(), ContentType.Text.CSS)
}
```

その後、必要な[ルート (route)](server-routing.md) 内で CSS を提供できます:

```kotlin
get("/styles.css") {
    call.respondCss {
        body {
            backgroundColor = Color.darkBlue
            margin = Margin(0.px)
        }
        rule("h1.page-title") {
            color = Color.white
        }
    }
}
```

最後に、[HTML DSL](server-html-dsl.md) で作成した HTML ドキュメントに対して、指定した CSS を使用できます:

```kotlin
get("/html-dsl") {
    call.respondHtml {
        head {
            link(rel = "stylesheet", href = "/styles.css", type = "text/css")
        }
        body {
            h1(classes = "page-title") {
                +"Hello from Ktor!"
            }
        }
    }
}
```

完全なサンプルはこちらで確認できます: [css-dsl](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/css-dsl)。