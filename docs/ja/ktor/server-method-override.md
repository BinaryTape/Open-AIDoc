[//]: # (title: XHttpMethodOverride)

<primary-label ref="server-plugin"/>

<var name="plugin_name" value="XHttpMethodOverride"/>
<var name="package_name" value="io.ktor.server.plugins.methodoverride"/>
<var name="artifact_name" value="ktor-server-method-override"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.methodOverride"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="json-kotlinx-method-override"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor は Kotlin/Native をサポートしており、追加のランタイムや仮想マシンなしでサーバーを実行できます。">ネイティブサーバー</Links>のサポート</b>: ✅
</p>
</tldr>

<link-summary>
%plugin_name% は、X-HTTP-Method-Override ヘッダー内で HTTP 動詞をトンネリングする機能を有効にします。
</link-summary>

[%plugin_name%](https://api.ktor.io/ktor-server-method-override/io.ktor.server.plugins.methodoverride/-x-http-method-override.html) プラグインは、`X-HTTP-Method-Override` ヘッダー内で HTTP 動詞をトンネリングする機能を有効にします。
これは、サーバー API が複数の HTTP 動詞（`GET`、`PUT`、`POST`、`DELETE` など）を処理するものの、クライアント側の特定の制限により使用できる動詞が限られている場合（たとえば `GET` と `POST` のみ）に役立ちます。
たとえば、クライアントが `X-Http-Method-Override` ヘッダーを `DELETE` に設定してリクエストを送信した場合、Ktor は `delete` [ルートハンドラー](server-routing.md#define_route)を使用してこのリクエストを処理します。

## 依存関係の追加 {id="add_dependencies"}

<p>
    <code>%plugin_name%</code> を使用するには、ビルドスクリプトに <code>%artifact_name%</code> アーティファクトを追加します。
</p>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上記のコードスニペットでは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">
            Ktor バージョンカタログ</a>を使用しています。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上記のコードスニペットでは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">
            Ktor バージョンカタログ</a>を使用しています。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## %plugin_name% のインストール {id="install_plugin"}

<p>
    <code>%plugin_name%</code> プラグインをアプリケーションに<a href="server-plugins.md#install">インストール</a>するには、
    指定された<Links href="server-modules.md" summary="モジュールを使用すると、ルートをグループ化してアプリケーションを構造化できます。">モジュール</Links>内の <code>install</code> 関数に渡します。
    次の例は、<code>%plugin_name%</code> をインストールする方法を示しています。
</p>
<list>
    <li>
        <code>embeddedServer()</code> 関数呼び出し内。
    </li>
    <li>
        <code>Application</code> クラスで明示的に定義された <code>module()</code> 拡張関数内。
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

## %plugin_name% の設定 {id="configure"}

デフォルトでは、`%plugin_name%` は `X-Http-Method-Override` ヘッダーをチェックして、リクエストを処理すべきルートを決定します。
`headerName` プロパティを使用してヘッダー名をカスタマイズできます。

## 例 {id="example"}

以下の HTTP リクエストは、`X-Http-Method-Override` ヘッダーを `DELETE` に設定した `POST` 動詞を使用しています。

```http request
POST http://0.0.0.0:8080/customer/3
X-Http-Method-Override: DELETE

```

このようなリクエストを `delete` [ルートハンドラー](server-routing.md#define_route)を使用して処理するには、`%plugin_name%` をインストールする必要があります。

```kotlin
package com.example

import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.methodoverride.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import io.ktor.server.util.getValue

@Serializable
data class Customer(val id: Int, val firstName: String, val lastName: String)

fun Application.main() {
    val customerStorage = mutableListOf<Customer>()
    customerStorage.addAll(
        arrayOf(
            Customer(1, "Jane", "Smith"),
            Customer(2, "John", "Smith"),
            Customer(3, "Jet", "Brains")
        )
    )

    install(XHttpMethodOverride)
    install(ContentNegotiation) {
        json(Json)
    }
    routing {
        get("/customer/{id}") {
            val id: Int by call.parameters
            val customer: Customer = customerStorage.find { it.id == id }!!
            call.respond(customer)
        }

        delete("/customer/{id}") {
            val id: Int by call.parameters
            customerStorage.removeIf { it.id == id }
            call.respondText("Customer is removed", status = HttpStatusCode.NoContent)
        }
    }
}

```

完全なサンプルは、こちらにあります: [json-kotlinx-method-override](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/json-kotlinx-method-override)。