[//]: # (title: デフォルトヘッダー)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="artifact_name" value="ktor-server-default-headers"/>
<var name="package_name" value="io.ktor.server.plugins.defaultheaders"/>
<var name="plugin_name" value="DefaultHeaders"/>
<var name="plugin_api_link" value="https://api.ktor.io/ktor-server-default-headers/io.ktor.server.plugins.defaultheaders/-default-headers.html"/>

<tldr>
<p>
<b>必須の依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="KtorはKotlin/Nativeをサポートしており、追加のランタイムや仮想マシンなしでサーバーを実行できます。">Native サーバー</Links> のサポート</b>: ✅
</p>
</tldr>

[%plugin_name%](%plugin_api_link%) プラグインは、標準的な `Server` および `Date` ヘッダーを各レスポンスに追加します。さらに、追加のデフォルトヘッダーの提供や、 `Server` ヘッダーの上書きを行うこともできます。

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

## %plugin_name% のインストール {id="install_plugin"}

<p>
    <code>%plugin_name%</code> プラグインをアプリケーションに <a href="#install">インストール</a> するには、指定された <Links href="/ktor/server-modules" summary="モジュールを使用すると、ルートをグループ化してアプリケーションを構造化できます。">モジュール</Links> 内の <code>install</code> 関数に渡します。
    以下のコードスニペットは、<code>%plugin_name%</code> をインストールする方法を示しています...
</p>
<list>
    <li>
        ... <code>embeddedServer</code> 関数呼び出しの内部。
    </li>
    <li>
        ... 明示的に定義された <code>module</code> （<code>Application</code> クラスの拡張関数）の内部。
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
<p>
    <code>%plugin_name%</code> プラグインは、<a href="#install-route">特定のルートにインストール</a> することもできます。
    これは、アプリケーションのリソースごとに異なる <code>%plugin_name%</code> 設定が必要な場合に役立ちます。
</p>

## %plugin_name% の設定 {id="configure"}
### 追加のヘッダーを追加する {id="add"}
デフォルトヘッダーのリストをカスタマイズするには、`header(name, value)` 関数を使用して、目的のヘッダーを `install` に渡します。`name` パラメータは `HttpHeaders` の値を受け取ります。例：
```kotlin
    install(DefaultHeaders) {
        header(HttpHeaders.ETag, "7c876b7e")
    }
```
カスタムヘッダーを追加するには、その名前を文字列値として渡します：
```kotlin
    install(DefaultHeaders) {
        header("Custom-Header", "Some value")
    }
```

### ヘッダーを上書きする {id="override"}
`Server` ヘッダーを上書きするには、対応する `HttpHeaders` の値を使用します：
```kotlin
    install(DefaultHeaders) {
        header(HttpHeaders.Server, "Custom")
    }
```
なお、`Date` ヘッダーはパフォーマンス上の理由でキャッシュされているため、`%plugin_name%` を使用して上書きすることはできません。