[//]: # (title: Webjars)

<primary-label ref="server-plugin"/>

<var name="plugin_name" value="Webjars"/>
<var name="package_name" value="io.ktor.server.webjars"/>
<var name="artifact_name" value="ktor-server-webjars"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.webjars"/>

<tldr>
<p>
<b>必要相依性</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="webjars"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor 支援 Kotlin/Native，並允許您在沒有額外執行時期或虛擬機的情況下執行伺服器。">Native 伺服器</Links>支援</b>：✖️
</p>
</tldr>

<link-summary>
%plugin_name% 外掛程式能夠提供 WebJars 所提供的用戶端程式庫。
</link-summary>

[%plugin_name%](https://api.ktor.io/ktor-server-webjars/io.ktor.server.webjars/-webjars.html) 外掛程式能夠提供 [WebJars](https://www.webjars.org/) 所提供的用戶端程式庫。它允許您將 JavaScript 與 CSS 程式庫等資源封裝為 [fat JAR](server-fatjar.md) 的一部分。

## 新增相依性 {id="add_dependencies"}
若要啟用 `%plugin_name%`，您需要在建置指令碼中包含以下構件：
* 新增 `%artifact_name%` 相依性：

  <Tabs group="languages">
      <TabItem title="Gradle (Kotlin)" group-key="kotlin">
          <code-block lang="Kotlin" code="              implementation(%ktor_version_catalog_name%)"/>
          <note>
              上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
              Ktor 版本目錄</a>來指定 Ktor 相依性。
          </note>
      </TabItem>
      <TabItem title="Gradle (Groovy)" group-key="groovy">
          <code-block lang="Groovy" code="              implementation %ktor_version_catalog_name%"/>
          <note>
              上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
              Ktor 版本目錄</a>來指定 Ktor 相依性。
          </note>
      </TabItem>
      <TabItem title="Maven" group-key="maven">
          <code-block lang="XML" code="              &lt;dependency&gt;&#10;                  &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                  &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                  &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;              &lt;/dependency&gt;"/>
      </TabItem>
  </Tabs>

* 新增所需用戶端程式庫的相依性。以下範例展示如何新增 Bootstrap 構件：

  <var name="group_id" value="org.webjars"/>
  <var name="artifact_name" value="bootstrap"/>
  <var name="version" value="bootstrap_version"/>
  <Tabs group="languages">
      <TabItem title="Gradle (Kotlin)" group-key="kotlin">
          <code-block lang="Kotlin" code="              implementation(&quot;%group_id%:%artifact_name%:$%version%&quot;)"/>
      </TabItem>
      <TabItem title="Gradle (Groovy)" group-key="groovy">
          <code-block lang="Groovy" code="              implementation &quot;%group_id%:%artifact_name%:$%version%&quot;"/>
      </TabItem>
      <TabItem title="Maven" group-key="maven">
          <code-block lang="XML" code="              &lt;dependency&gt;&#10;                  &lt;groupId&gt;%group_id%&lt;/groupId&gt;&#10;                  &lt;artifactId&gt;%artifact_name%&lt;/artifactId&gt;&#10;                  &lt;version&gt;${%version%}&lt;/version&gt;&#10;              &lt;/dependency&gt;"/>
      </TabItem>
  </Tabs>
  
  您可以將 `$bootstrap_version` 替換為所需的 `bootstrap` 構件版本，例如 `%bootstrap_version%`。

## 安裝 %plugin_name% {id="install_plugin"}

<p>
    若要將 <code>%plugin_name%</code> 外掛程式<a href="server-plugins.md#install">安裝</a>到您的應用程式中，請將其傳遞給指定<Links href="server-modules.md" summary="模組允許您透過分組路由來建構應用程式結構。">模組</Links>中的 <code>install</code> 函式。
    以下範例展示如何安裝 <code>%plugin_name%</code>：
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

## 設定 %plugin_name% {id="configure"}

預設情況下，`%plugin_name%` 會在 `/webjars` 路徑上提供 WebJars 資源。以下範例展示如何變更此設定，並在 `/assets` 路徑上提供任何 WebJars 資源：

```kotlin
import io.ktor.server.application.*
import io.ktor.server.webjars.*

fun Application.module() {
    install(Webjars) {
        path = "assets"
    }
}
```

例如，若您已安裝 `org.webjars:bootstrap` 相依性，可以按照以下方式新增 `bootstrap.css`：

```html
<head>
    <link rel="stylesheet" href="/assets/bootstrap/bootstrap.css">
</head>
```

請注意，`%plugin_name%` 允許您變更相依性的版本，而無需變更用於載入它們的路徑。

> 您可以在此處找到完整範例：[webjars](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/webjars)。