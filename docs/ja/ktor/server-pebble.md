[//]: # (title: Pebble)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

[pebble_engine_builder]: https://pebbletemplates.io/com/mitchellbosecke/pebble/PebbleEngine/Builder/

<var name="plugin_name" value="Pebble"/>
<var name="package_name" value="io.ktor.server.pebble"/>
<var name="artifact_name" value="ktor-server-pebble"/>

<tldr>
<p>
<b>必須の依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="pebble"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor は Kotlin/Native をサポートしており、追加のランタイムや仮想マシンなしでサーバーを実行できます。">Native サーバー</Links>のサポート</b>: ✖️
</p>
</tldr>

Ktor では、[Pebble](https://api.ktor.io/ktor-server-pebble/io.ktor.server.pebble/-pebble) プラグインをインストールすることで、アプリケーション内のビューとして [Pebble テンプレート](https://pebbletemplates.io/)を使用できます。

## 依存関係の追加 {id="add_dependencies"}

<p>
    <code>%plugin_name%</code> を使用するには、ビルドスクリプトに <code>%artifact_name%</code> アーティファクトを含める必要があります。
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

## Pebble のインストール {id="install_plugin"}

<p>
    <code>%plugin_name%</code> プラグインをアプリケーションに<a href="#install">インストール</a>するには、指定された <Links href="/ktor/server-modules" summary="モジュールを使用すると、ルートをグループ化してアプリケーションを構造化できます。">モジュール</Links>内の <code>install</code> 関数に渡します。
    以下のコードスニペットは、<code>%plugin_name%</code> をインストールする方法を示しています。
</p>
<list>
    <li>
        ... <code>embeddedServer</code> 関数の呼び出し内。
    </li>
    <li>
        ... <code>Application</code> クラスの拡張関数である、明示的に定義された <code>module</code> 内。
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

`install` ブロック内では、Pebble テンプレートをロードするための [PebbleEngine.Builder][pebble_engine_builder] を[設定](#configure)できます。

## Pebble の設定 {id="configure"}
### テンプレートのロード設定 {id="template_loading"}
テンプレートをロードするには、[PebbleEngine.Builder][pebble_engine_builder] を使用してテンプレートのロード方法を設定する必要があります。例えば、以下のコードスニペットは、Ktor が現在のクラスパスからの相対パスである `templates` パッケージ内でテンプレートを検索できるようにします。

```kotlin
import io.ktor.server.application.*
import io.ktor.server.pebble.*
import io.ktor.server.response.*

fun Application.module() {
    install(Pebble) {
        loader(ClasspathLoader().apply {
            prefix = "templates"
        })
    }
}
```

### レスポンスでのテンプレート送信 {id="use_template"}
`resources/templates` に `index.html` テンプレートがあると仮定します。

```html
<html>
    <body>
        <h1>Hello, {{user.name}}</h1>
    </body>
</html>
```

ユーザーのデータモデルは以下の通りです。

```kotlin
data class User(val id: Int, val name: String)
```

指定された[ルート](server-routing.md)に対してテンプレートを使用するには、次のように `PebbleContent` を `call.respond` メソッドに渡します。

```kotlin
get("/index") {
    val sampleUser = User(1, "John")
    call.respond(PebbleContent("index.html", mapOf("user" to sampleUser)))
}