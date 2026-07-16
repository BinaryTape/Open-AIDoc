[//]: # (title: Velocity)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

[velocity_engine]: https://velocity.apache.org/engine/devel/apidocs/org/apache/velocity/app/VelocityEngine.html

<var name="plugin_name" value="Velocity"/>
<var name="package_name" value="io.ktor.server.velocity"/>
<var name="artifact_name" value="ktor-server-velocity"/>

<tldr>
<p>
<b>必須依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="velocity"/>
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

Ktor では、[Velocity](https://api.ktor.io/ktor-server-velocity/io.ktor.server.velocity/-velocity) プラグインをインストールすることで、[Velocity テンプレート](https://velocity.apache.org/engine/)をアプリケーション内のビューとして使用できます。

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

## Velocity のインストール {id="install_plugin"}

<p>
    アプリケーションに <code>%plugin_name%</code> プラグインを<a href="#install">インストール</a>するには、指定された<Links href="/ktor/server-modules" summary="モジュールを使用すると、ルートをグループ化してアプリケーションを構造化できます。">モジュール</Links>内の <code>install</code> 関数に渡します。
    以下のコードスニペットは、<code>%plugin_name%</code> のインストール方法を示しています...
</p>
<list>
    <li>
        ... <code>embeddedServer</code> 関数の呼び出し内。
    </li>
    <li>
        ... 明示的に定義された <code>module</code>（<code>Application</code> クラスの拡張関数）内。
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

オプションで、`VelocityTools` プラグインをインストールして、標準およびカスタムの [Velocity ツール](#velocity_tools)を追加する機能を利用することもできます。

## Velocity の設定 {id="configure"}
### テンプレート読み込みの設定 {id="template_loading"}
`install` ブロック内で、[VelocityEngine][velocity_engine] を設定できます。例えば、クラスパスからテンプレートを使用する場合は、`classpath` 用のリソースローダーを使用します。
```kotlin
import io.ktor.server.application.*
import io.ktor.server.velocity.*
import org.apache.velocity.runtime.resource.loader.ClasspathResourceLoader
import org.apache.velocity.runtime.RuntimeConstants

fun Application.module() {
    install(Velocity) {
        setProperty(RuntimeConstants.RESOURCE_LOADER, "classpath")
        setProperty("classpath.resource.loader.class", ClasspathResourceLoader::class.java.name)
    }
}
```

### レスポンスでのテンプレート送信 {id="use_template"}
`resources/templates` に `index.vl` テンプレートがあると仮定します。
```html
<html>
    <body>
        <h1>Hello, $user.name</h1>
    </body>
</html>
```

ユーザーのデータモデルは以下のようになります。
```kotlin
data class User(val id: Int, val name: String)
```

指定された[ルート](server-routing.md)に対してテンプレートを使用するには、以下のように `VelocityContent` を `call.respond` メソッドに渡します。
```kotlin
get("/index") {
    val sampleUser = User(1, "John")
    call.respond(VelocityContent("templates/index.vl", mapOf("user" to sampleUser)))
}
```

### Velocity ツールの追加 {id="velocity_tools"}

`VelocityTools` プラグインを[インストール](#install_plugin)している場合、`install` ブロック内で `EasyFactoryConfiguration` インスタンスにアクセスして、標準およびカスタムの Velocity ツールを追加できます。例えば以下のようになります。

```kotlin
install(VelocityTools) {
    engine {
        // エンジン設定
        setProperty("resource.loader", "string")
        addProperty("resource.loader.string.name", "myRepo")
        addProperty("resource.loader.string.class", StringResourceLoader::class.java.name)
        addProperty("resource.loader.string.repository.name", "myRepo")
    }
    addDefaultTools() // デフォルトツールの追加
    tool("foo", MyCustomTool::class.java) // カスタムツールの追加
}