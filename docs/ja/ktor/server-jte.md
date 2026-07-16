[//]: # (title: JTE)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="Jte"/>
<var name="package_name" value="io.ktor.server.jte"/>
<var name="artifact_name" value="ktor-server-jte"/>

<tldr>
<p>
<b>必須の依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="jte"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">Nativeサーバー</Links>のサポート</b>: ✖️
</p>
</tldr>

Ktorでは、[%plugin_name%](https://api.ktor.io/ktor-server-jte/io.ktor.server.jte/-jte.html)プラグインをインストールすることで、アプリケーション内のビューとして[JTEテンプレート](https://github.com/casid/jte)を使用できます。

## 依存関係の追加 {id="add_dependencies"}

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

`.kte`ファイルを処理するには、プロジェクトに`gg.jte:jte-kotlin`アーティファクトを追加します。

<var name="group_id" value="gg.jte"/>
<var name="artifact_name" value="jte-kotlin"/>
<var name="version" value="jte_version" />
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;%group_id%:%artifact_name%:$%version%&quot;)"></code-block>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;%group_id%:%artifact_name%:$%version%&quot;"></code-block>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;%group_id%&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%&lt;/artifactId&gt;&#10;                &lt;version&gt;${%version%}&lt;/version&gt;&#10;            &lt;/dependency&gt;"></code-block>
    </TabItem>
</Tabs>

> 現在の`jte-kotlin`コンパイラプラグインはKotlin 2.3.xと互換性がありません。
> Ktor 3.4.0はKotlin 2.3ツールチェーンを使用しているため、`jte-kotlin`プラグインがKotlin 2.3のサポートを追加するまで、Ktor JTEプラグインは使用できません。
> 
> JTEに依存している場合は、`jte-kotlin`がKotlin 2.3用に更新されるまで、Kotlin 2.2.xと互換性のあるKtorバージョンを使用してください。
> 
{style="warning"}

## %plugin_name%のインストール {id="install_plugin"}

<p>
    <code>%plugin_name%</code>プラグインをアプリケーションに<a href="#install">インストール</a>するには、指定された<Links href="/ktor/server-modules" summary="Modules allow you to structure your application by grouping routes.">モジュール</Links>内の<code>install</code>関数に渡します。
    以下のコードスニペットは、<code>%plugin_name%</code>をインストールする方法を示しています...
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

`install`ブロック内では、JTEテンプレートをロードする方法を[設定](#configure)できます。

## %plugin_name%の設定 {id="configure"}
### テンプレート読み込みの設定 {id="template_loading"}
JTEテンプレートをロードするには、以下を行う必要があります：
1. テンプレートコードを解決するために使用される`CodeResolver`を作成します。例えば、特定のディレクトリからテンプレートをロードするように`DirectoryCodeResolver`を設定したり、アプリケーションリソースからテンプレートをロードするように`ResourceCodeResolver`を設定したりできます。
2. `templateEngine`プロパティを使用してテンプレートエンジンを指定します。これは、作成された`CodeResolver`を使用してテンプレートをネイティブのJava/Kotlinコードに変換します。

例えば、以下のコードスニペットにより、Ktorは`templates`ディレクトリ内でJTEテンプレートを探すようになります。

```kotlin
import gg.jte.TemplateEngine
import gg.jte.resolve.DirectoryCodeResolver
import io.ktor.server.application.*
import io.ktor.server.jte.*
import java.nio.file.Path

fun Application.module() {
    install(Jte) {
        val resolver = DirectoryCodeResolver(Path.of("templates"))
        templateEngine = TemplateEngine.create(resolver, gg.jte.ContentType.Html)
    }
}
```

### レスポンスでのテンプレート送信 {id="use_template"}
`templates`ディレクトリに`index.kte`テンプレートがあるとします。
```html
@param id: Int
@param name: String
<html>
    <body>
        <h1>Hello, ${name}!</h1>
    </body>
</html>
```

指定された[ルート](server-routing.md)に対してテンプレートを使用するには、次のように`JteContent`を`call.respond`メソッドに渡します。
```kotlin
get("/index") {
    val params = mapOf("id" to 1, "name" to "John")
    call.respond(JteContent("index.kte", params))
}