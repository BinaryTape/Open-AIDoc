[//]: # (title: HSTS)

<primary-label ref="server-plugin"/>

<var name="plugin_name" value="HSTS"/>
<var name="package_name" value="io.ktor.server.plugins.hsts"/>
<var name="artifact_name" value="ktor-server-hsts"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.hsts"/>

<tldr>
<p>
<b>必要相依性</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="ssl-engine-main-hsts"/>
<p>
    <b>程式碼範例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor 支援 Kotlin/Native，並允許您在沒有額外執行階段或虛擬機的情況下執行伺服器。">Native 伺服器</Links>支援</b>: ✅
</p>
</tldr>

[%plugin_name%](https://api.ktor.io/ktor-server-hsts/io.ktor.server.plugins.hsts/-h-s-t-s.html) 外掛程式會根據 [RFC 6797](https://tools.ietf.org/html/rfc6797) 在請求中新增必要的 _HTTP Strict Transport Security_ 標頭。當瀏覽器收到 HSTS 策略標頭後，在指定期間內將不再嘗試使用不安全連線來連線至伺服器。

> 請注意，透過不安全的 HTTP 連線傳輸時，HSTS 策略標頭會被忽略。若要讓 HSTS 生效，應透過[安全](server-ssl.md)連線提供服務。

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

## 安裝 %plugin_name% {id="install_plugin"}

<p>
    若要將 <code>%plugin_name%</code> 外掛程式<a href="server-plugins.md#install">安裝</a>至您的應用程式，請將其傳遞給指定<Links href="server-modules.md" summary="模組允許您透過將路由分組來組織應用程式結構。">模組</Links>中的 <code>install</code> 函式。
    以下範例示範如何安裝 <code>%plugin_name%</code>：
</p>
<list>
    <li>
        在 <code>embeddedServer()</code> 函式呼叫中。
    </li>
    <li>
        在 <code>Application</code> 類別上明確定義的 <code>module()</code> 擴充函式中。
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
<p>
    <code>%plugin_name%</code> 外掛程式也可以<a href="server-plugins.md#install-route">安裝到特定路由</a>。
    如果您需要為不同的應用程式資源使用不同的 <code>%plugin_name%</code> 配置，這會很有幫助。
</p>

## 設定 %plugin_name% {id="configure"}

`%plugin_name%` 透過 [HSTSConfig](https://api.ktor.io/ktor-server-hsts/io.ktor.server.plugins.hsts/-h-s-t-s-config/index.html) 公開其設定。以下範例示範如何使用 `maxAgeInSeconds` 屬性來指定用戶端應將該主機保留在已知 HSTS 主機清單中的時間長度：

```kotlin
install(HSTS) {
    maxAgeInSeconds = 10
}
```

您也可以使用 `withHost` 為不同的主機提供不同的 HSTS 配置：

```kotlin
install(HSTS) {
    maxAgeInSeconds = 10
    withHost("sample-host") {
        maxAgeInSeconds = 60
        includeSubDomains = false
    }
}
```

您可以在此處找到完整的範例：[ssl-engine-main-hsts](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/ssl-engine-main-hsts)。