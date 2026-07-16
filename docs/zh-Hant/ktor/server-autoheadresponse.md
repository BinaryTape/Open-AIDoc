[//]: # (title: AutoHeadResponse)

<var name="plugin_name" value="AutoHeadResponse"/>
<var name="artifact_name" value="ktor-server-auto-head-response"/>
<primary-label ref="server-plugin"/>

<tldr>
<p>
<b>必要相依性</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="autohead"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor 支援 Kotlin/Native，允許您在沒有額外執行階段或虛擬機的情況下執行伺服器。">Native 伺服器</Links> 支援</b>：✅
</p>
</tldr>

<link-summary>
%plugin_name% 為每個已定義 GET 的路由提供自動回應 HEAD 請求的功能。
</link-summary>

[%plugin_name%](https://api.ktor.io/ktor-server-auto-head-response/io.ktor.server.plugins.autohead/-auto-head-response.html) 外掛程式讓我們能夠自動回應每個已定義 `GET` 的路由之 `HEAD` 請求。如果您需要在獲取實際內容之前在用戶端以某種方式處理回應，可以使用 `%plugin_name%` 來避免建立單獨的 [head](server-routing.md#define_route) 處理常式。例如，呼叫 [respondFile](server-responses.md#file) 函式會自動在回應中加入 `Content-Length` 和 `Content-Type` 標頭，您可以在下載檔案前在用戶端獲取這些資訊。

## 新增相依性 {id="add_dependencies"}

<p>
    若要使用 <code>%plugin_name%</code>，您需要在建置指令碼中包含 <code>%artifact_name%</code> 構件：
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

## 用法
為了利用此功能，我們需要在應用程式中安裝 `AutoHeadResponse` 外掛程式。

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

在我們的案例中，`/home` 路由現在會回應 `HEAD` 請求，即使沒有為此動詞進行明確定義。

請注意，如果使用了此外掛程式，針對相同 `GET` 路由的自訂 `HEAD` 定義將會被忽略。

## 選項
`%plugin_name%` 不提供任何額外的配置選項。