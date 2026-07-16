[//]: # (title: Webjars)

<primary-label ref="server-plugin"/>

<var name="plugin_name" value="Webjars"/>
<var name="package_name" value="io.ktor.server.webjars"/>
<var name="artifact_name" value="ktor-server-webjars"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="webjars"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor は Kotlin/Native をサポートしており、追加のランタイムや仮想マシンなしでサーバーを実行できます。">Native サーバー</Links>のサポート</b>: ✖️
</p>
</tldr>

<link-summary>
%plugin_name% プラグインは、WebJars によって提供されるクライアントサイドライブラリの配信を可能にします。
</link-summary>

[%plugin_name%](https://api.ktor.io/ktor-server-webjars/io.ktor.server.webjars/-webjars.html) プラグインは、[WebJars](https://www.webjars.org/) によって提供されるクライアントサイドライブラリの配信を可能にします。これにより、JavaScript や CSS ライブラリなどのアセットを [fat JAR](server-fatjar.md) の一部としてパッケージ化できます。

## 依存関係の追加 {id="add_dependencies"}
`%plugin_name%` を有効にするには、ビルドスクリプトに以下のアーティファクトを含める必要があります。
* `%artifact_name%` の依存関係を追加します。

  <Tabs group="languages">
      <TabItem title="Gradle (Kotlin)" group-key="kotlin">
          <code-block lang="Kotlin" code="              implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
      </TabItem>
      <TabItem title="Gradle (Groovy)" group-key="groovy">
          <code-block lang="Groovy" code="              implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
      </TabItem>
      <TabItem title="Maven" group-key="maven">
          <code-block lang="XML" code="              &lt;dependency&gt;&#10;                  &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                  &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                  &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;              &lt;/dependency&gt;"></code-block>
      </TabItem>
  </Tabs>

* 必要なクライアントサイドライブラリの依存関係を追加します。以下の例は、Bootstrap アーティファクトを追加する方法を示しています。

  <var name="group_id" value="org.webjars"/>
  <var name="artifact_name" value="bootstrap"/>
  <var name="version" value="bootstrap_version"/>
  <Tabs group="languages">
      <TabItem title="Gradle (Kotlin)" group-key="kotlin">
          <code-block lang="Kotlin" code="              implementation(&quot;%group_id%:%artifact_name%:$%version%&quot;)"></code-block>
      </TabItem>
      <TabItem title="Gradle (Groovy)" group-key="groovy">
          <code-block lang="Groovy" code="              implementation &quot;%group_id%:%artifact_name%:$%version%&quot;"></code-block>
      </TabItem>
      <TabItem title="Maven" group-key="maven">
          <code-block lang="XML" code="              &lt;dependency&gt;&#10;                  &lt;groupId&gt;%group_id%&lt;/groupId&gt;&#10;                  &lt;artifactId&gt;%artifact_name%&lt;/artifactId&gt;&#10;                  &lt;version&gt;${%version%}&lt;/version&gt;&#10;              &lt;/dependency&gt;"></code-block>
      </TabItem>
  </Tabs>
  
  `$bootstrap_version` は、`bootstrap` アーティファクトの必要なバージョン（例: `%bootstrap_version%`）に置き換えることができます。

## %plugin_name% のインストール {id="install_plugin"}

<p>
    <code>%plugin_name%</code> プラグインをアプリケーションに<a href="#install">インストール</a>するには、
    指定された <Links href="/ktor/server-modules" summary="モジュールを使用すると、ルートをグループ化してアプリケーションを構造化できます。">モジュール</Links> 内の <code>install</code> 関数に渡します。
    以下のコードスニペットは、<code>%plugin_name%</code> をインストールする方法を示しています...
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

## %plugin_name% の設定 {id="configure"}

デフォルトでは、`%plugin_name%` は WebJars のアセットを `/webjars` パスで配信します。以下の例は、これを変更して WebJars のアセットを `/assets` パスで配信する方法を示しています。

```kotlin
import io.ktor.server.application.*
import io.ktor.server.webjars.*

fun Application.module() {
    install(Webjars) {
        path = "assets"
    }
}
```

例えば、`org.webjars:bootstrap` の依存関係をインストールしている場合、以下のように `bootstrap.css` を追加できます。

```html
<head>
    <link rel="stylesheet" href="/assets/bootstrap/bootstrap.css">
</head>
```

`%plugin_name%` を使用すると、アセットの読み込みに使用するパスを変更することなく、依存関係のバージョンを変更できることに注目してください。

> 完全な例はこちらで見つけることができます: [webjars](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/webjars)。