[//]: # (title: FreeMarker)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

[freemarker_template_loading]: https://freemarker.apache.org/docs/pgui_config_templateloading.html

<var name="plugin_name" value="FreeMarker"/>
<var name="package_name" value="io.ktor.server.freemarker"/>
<var name="artifact_name" value="ktor-server-freemarker"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.freemarker"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="freemarker"/>
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

Ktorでは、[FreeMarker](https://api.ktor.io/ktor-server-freemarker/io.ktor.server.freemarker/-free-marker)プラグインをインストールすることで、アプリケーション内のビューとして[FreeMarkerテンプレート](https://freemarker.apache.org/)を使用できます。

## 依存関係の追加 {id="add_dependencies"}

<p>
    <code>%plugin_name%</code>を使用するには、ビルドスクリプトに<code>%artifact_name%</code>アーティファクトを追加します。
</p>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上記のコードスニペットでは、Ktorの依存関係を指定するために<a href="server-dependencies.topic#using-version-catalog">Ktorバージョンカタログ</a>を使用しています。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上記のコードスニペットでは、Ktorの依存関係を指定するために<a href="server-dependencies.topic#using-version-catalog">Ktorバージョンカタログ</a>を使用しています。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## FreeMarkerのインストール {id="install_plugin"}

<p>
    アプリケーションに<code>%plugin_name%</code>プラグインを<a href="server-plugins.md#install">インストール</a>するには、指定した<Links href="server-modules.md" summary="モジュールを使用すると、ルートをグループ化してアプリケーションを構造化できます。">モジュール</Links>内の<code>install</code>関数に渡します。
    以下の例は、<code>%plugin_name%</code>をインストールする方法を示しています。
</p>
<list>
    <li>
        <code>embeddedServer()</code>関数の呼び出し内。
    </li>
    <li>
        <code>Application</code>クラスで明示的に定義された<code>module()</code>拡張関数内。
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

`install`ブロック内では、FreeMarkerテンプレートを読み込むための目的の[TemplateLoader][freemarker_template_loading]を[設定](#configure)できます。

## FreeMarkerの設定 {id="configure"}
### テンプレート読み込みの設定 {id="template_loading"}
テンプレートを読み込むには、`templateLoader`プロパティに必要な[TemplateLoader][freemarker_template_loading]型を割り当てる必要があります。例えば、以下のコードスニペットにより、Ktorは現在のクラスパスを基準として`templates`パッケージ内のテンプレートを検索できるようになります。
```kotlin
import freemarker.cache.*
import io.ktor.server.application.*
import io.ktor.server.freemarker.*

fun Application.module() {
    install(FreeMarker) {
        templateLoader = ClassTemplateLoader(this::class.java.classLoader, "templates")
    }
}
```

### レスポンスとしてテンプレートを送信する {id="use_template"}
`resources/templates`に`index.ftl`テンプレートがあると仮定します。
```html
<html>
    <body>
        <h1>Hello, ${user.name}!</h1>
    </body>
</html>
```

ユーザーのデータモデルは以下のようになります。
```kotlin
data class User(val id: Int, val name: String)
```

指定した[ルート](server-routing.md)でこのテンプレートを使用するには、次のように`call.respond`メソッドに`FreeMarkerContent`を渡します。
```kotlin
get("/index") {
    val sampleUser = User(1, "John")
    call.respond(FreeMarkerContent("index.ftl", mapOf("user" to sampleUser)))
}
```