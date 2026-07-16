[//]: # (title: Thymeleaf)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="Thymeleaf"/>
<var name="package_name" value="io.ktor.server.thymeleaf"/>
<var name="artifact_name" value="ktor-server-thymeleaf"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="thymeleaf"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="KtorはKotlin/Nativeをサポートしており、追加のランタイムや仮想マシンなしでサーバーを実行できます。">ネイティブサーバー</Links>のサポート</b>: ✖️
</p>
</tldr>

Ktorでは、[Thymeleaf](https://api.ktor.io/ktor-server-thymeleaf/io.ktor.server.thymeleaf/-thymeleaf)プラグインをインストールすることで、[Thymeleafテンプレート](https://www.thymeleaf.org/)をアプリケーション内のビューとして使用できます。

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

## Thymeleafのインストール {id="install_plugin"}

<p>
    アプリケーションに<code>%plugin_name%</code>プラグインを<a href="#install">インストール</a>するには、指定された<Links href="/ktor/server-modules" summary="モジュールを使用すると、ルートをグループ化してアプリケーションを構造化できます。">モジュール</Links>内の<code>install</code>関数に渡します。
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

## Thymeleafの設定 {id="configure"}
### テンプレート読み込みの設定 {id="template_loading"}
`install`ブロック内で、`ClassLoaderTemplateResolver`を設定できます。例えば、以下のコードスニペットは、Ktorが現在のクラスパスに関連する`templates`パッケージ内で`*.html`テンプレートを検索できるようにします。
```kotlin
import io.ktor.server.application.*
import io.ktor.server.thymeleaf.*
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver

fun Application.module() {
    install(Thymeleaf) {
        setTemplateResolver(ClassLoaderTemplateResolver().apply {
            prefix = "templates/"
            suffix = ".html"
            characterEncoding = "utf-8"
        })
    }
}
```

### レスポンスとしてテンプレートを送信する {id="use_template"}
`resources/templates`に`index.html`テンプレートがあるとします。
```html
<html xmlns:th="http://www.thymeleaf.org">
    <body>
        <h1 th:text="'Hello, ' + ${user.name}"></h1>
    </body>
</html>
```

ユーザーのデータモデルは次のようになります。
```kotlin
data class User(val id: Int, val name: String)
```

指定された[ルート](server-routing.md)にテンプレートを使用するには、次のように`call.respond`メソッドに[ThymeleafContent](https://api.ktor.io/ktor-server-thymeleaf/io.ktor.server.thymeleaf/-thymeleaf-content/index.html)を渡します。
```kotlin
get("/index") {
    val sampleUser = User(1, "John")
    call.respond(ThymeleafContent("index", mapOf("user" to sampleUser)))
}
```

## 例: Thymeleafテンプレートの自動リロード {id="auto-reload"}

以下の例は、[開発モード](server-development-mode.topic)が使用されているときに、Thymeleafテンプレートを自動的にリロードする方法を示しています。

```kotlin
package com.example

import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.thymeleaf.*
import org.thymeleaf.templateresolver.*

fun main(args: Array<String>): Unit = io.ktor.server.netty.EngineMain.main(args)

fun Application.module() {
    install(Thymeleaf) {
        setTemplateResolver((if (developmentMode) {
            FileTemplateResolver().apply {
                cacheManager = null
                prefix = "src/main/resources/templates/"
            }
        } else {
            ClassLoaderTemplateResolver().apply {
                prefix = "templates/"
            }
        }).apply {
            suffix = ".html"
            characterEncoding = "utf-8"
        })
    }
    routing {
        get("/index") {
            val sampleUser = User(1, "John")
            call.respond(ThymeleafContent("index", mapOf("user" to sampleUser)))
        }
    }
}

data class User(val id: Int, val name: String)

```

完全な例はこちらにあります: [thymeleaf-auto-reload](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/thymeleaf-auto-reload)