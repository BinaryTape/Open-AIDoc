[//]: # (title: AutoHeadResponse)

<var name="plugin_name" value="AutoHeadResponse"/>
<var name="artifact_name" value="ktor-server-auto-head-response"/>
<primary-label ref="server-plugin"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="autohead"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">Nativeサーバー</Links>のサポート</b>: ✅
</p>
</tldr>

<link-summary>
%plugin_name%は、GETが定義されているすべてのルートに対して、HEADリクエストに自動的に応答する機能を提供します。
</link-summary>

[%plugin_name%](https://api.ktor.io/ktor-server-auto-head-response/io.ktor.server.plugins.autohead/-auto-head-response.html)プラグインは、`GET`が定義されているすべてのルートに対して、`HEAD`リクエストに自動的に応答する機能を提供します。実際のコンテンツを取得する前に、クライアント側でレスポンスを何らかの形で処理する必要がある場合、`%plugin_name%`を使用することで、別途[head](server-routing.md#define_route)ハンドラーを作成する手間を省くことができます。例えば、[respondFile](server-responses.md#file)関数を呼び出すと、`Content-Length`および`Content-Type`ヘッダーが自動的にレスポンスに追加されます。クライアントはファイルをダウンロードする前に、これらの情報を取得できます。

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

## 使用方法
この機能を利用するには、アプリケーションに`AutoHeadResponse`プラグインをインストールする必要があります。

```kotlin
import io.ktor.server.application.*
import io.ktor.server.plugins.autohead.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Application.main() {
    install(AutoHeadResponse)
    routing {
        get("/home") {
            call.respondText("This is a response to a GET, but HEAD also works")
        }
    }
}
```

この例では、`/home`ルートに対して明示的な定義がなくても、`HEAD`リクエストに応答するようになります。

このプラグインを使用している場合、同じ`GET`ルートに対するカスタムの`HEAD`定義は無視されることに注意してください。

## オプション
`%plugin_name%`には、追加の構成オプションはありません。