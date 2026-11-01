[//]: # (title: AutoHeadResponse)

<var name="plugin_name" value="AutoHeadResponse"/>
<var name="artifact_name" value="ktor-server-auto-head-response"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.autoHeadResponse"/>
<primary-label ref="server-plugin"/>

<tldr>
<p>
<b>必要相依性</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="autohead"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">Native 伺服器</Links> 支援</b>：✅
</p>
</tldr>

<link-summary>
%plugin_name% 提供了為每個已定義 GET 的路由自動回應 HEAD 請求的功能。
</link-summary>

[%plugin_name%](https://api.ktor.io/ktor-server-auto-head-response/io.ktor.server.plugins.autohead/-auto-head-response.html) 外掛程式為我們提供了為每個已定義 `GET` 的路由自動回應 `HEAD` 請求的能力。如果您需要在取得實際內容之前，先在用戶端以某種方式處理回應，可以使用 `%plugin_name%` 來避免建立單獨的 [head](server-routing.md#define_route) 處理常式。例如，呼叫 [respondFile](server-responses.md#file) 函式會自動將 `Content-Length` 和 `Content-Type` 標頭新增至回應中，這樣您就可以在下載檔案之前於用戶端取得此資訊。

## 新增相依性 {id="add_dependencies"}

<p>
    若要使用 <code>%plugin_name%</code>，請將 <code>%artifact_name%</code> 構件新增至您的組建指令碼中：
</p>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor version catalog</a> 來指定 Ktor 相依性。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor version catalog</a> 來指定 Ktor 相依性。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## 使用方式 {id="usage"}
為了利用這項功能，我們需要在應用程式中安裝 `AutoHeadResponse` 外掛程式。

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

在我們的範例中，即使沒有為此動詞進行明確定義，`/home` 路由現在也會回應 `HEAD` 請求。

需要特別注意的是，如果我們使用此外掛程式，針對同一個 `GET` 路由的自訂 `HEAD` 定義將會被忽略。

## 選項 {id="options"}
`%plugin_name%` 未提供任何額外的配置選項。