[//]: # (title: デフォルトヘッダー)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="artifact_name" value="ktor-server-default-headers"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.defaultHeaders"/>
<var name="package_name" value="io.ktor.server.plugins.defaultheaders"/>
<var name="plugin_name" value="DefaultHeaders"/>
<var name="plugin_api_link" value="https://api.ktor.io/ktor-server-default-headers/io.ktor.server.plugins.defaultheaders/-default-headers.html"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<p>
    <b><Links href="server-native.md" summary="KtorはKotlin/Nativeをサポートしており、追加のランタイムや仮想マシンなしでサーバーを実行できます。">Nativeサーバー</Links>のサポート</b>: ✅
</p>
</tldr>

[%plugin_name%](%plugin_api_link%) プラグインは、各レスポンスに標準の `Server` および `Date` ヘッダーを追加します。さらに、追加のデフォルトヘッダーを指定したり、`Server` ヘッダーを上書きしたりすることもできます。

## 依存関係の追加 {id="add_dependencies"}

<p>
    <code>%plugin_name%</code> を使用するには、ビルドスクリプトに <code>%artifact_name%</code> アーティファクトを追加します。
</p>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上記のコードスニペットでは、Ktorの依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">Ktorバージョンカタログ</a> を使用しています。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上記のコードスニペットでは、Ktorの依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">Ktorバージョンカタログ</a> を使用しています。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## %plugin_name% のインストール {id="install_plugin"}

<p>
    アプリケーションに <code>%plugin_name%</code> プラグインを<a href="server-plugins.md#install">インストール</a>するには、指定した<Links href="server-modules.md" summary="モジュールを使用すると、ルートをグループ化してアプリケーションを構造化できます。">モジュール</Links>内の <code>install</code> 関数に渡します。
    次の例は、<code>%plugin_name%</code> をインストールする方法を示しています。
</p>
<list>
    <li>
        <code>embeddedServer()</code> 関数呼び出し内でのインストール。
    </li>
    <li>
        <code>Application</code> クラスで明示的に定義された <code>module()</code> 拡張関数内でのインストール。
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
    <code>%plugin_name%</code> プラグインは、<a href="server-plugins.md#install-route">特定のルートにインストール</a>することもできます。
    これは、アプリケーションの異なるリソースに対して異なる <code>%plugin_name%</code> 設定が必要な場合に便利です。
</p>

## %plugin_name% の設定 {id="configure"}
### 追加ヘッダーの追加 {id="add"}
デフォルトヘッダーのリストをカスタマイズするには、`header(name, value)` 関数を使用して、追加したいヘッダーを `install` に渡します。`name` パラメーターには `HttpHeaders` の値を受け取ります。例:
```kotlin
    install(DefaultHeaders) {
        header(HttpHeaders.ETag, "7c876b7e")
    }
```
カスタムヘッダーを追加するには、その名前を文字列値として渡します:
```kotlin
    install(DefaultHeaders) {
        header("Custom-Header", "Some value")
    }
```

### ヘッダーの上書き {id="override"}
`Server` ヘッダーを上書きするには、対応する `HttpHeaders` の値を使用します:
```kotlin
    install(DefaultHeaders) {
        header(HttpHeaders.Server, "Custom")
    }
```
パフォーマンス上の理由から `Date` ヘッダーはキャッシュされており、`%plugin_name%` を使用して上書きすることはできない点に注意してください。