[//]: # (title: リクエストのバリデーション)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="RequestValidation"/>
<var name="package_name" value="io.ktor.server.plugins.requestvalidation"/>
<var name="artifact_name" value="ktor-server-request-validation"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.requestValidation"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="request-validation"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">Native サーバー</Links>のサポート</b>: ✅
</p>
</tldr>

<link-summary>
%plugin_name% は、受信したリクエストのボディを検証する機能を提供します。
</link-summary>

[%plugin_name%](https://api.ktor.io/ktor-server-request-validation/io.ktor.server.plugins.requestvalidation/-request-validation.html) プラグインは、受信したリクエストのボディを検証（バリデーション）する機能を提供します。生のリクエストボディを検証することも、[シリアライザー](server-serialization.md#configure_serializer)を備えた `ContentNegotiation` プラグインがインストールされている場合は、特定のリクエストオブジェクトのプロパティを検証することもできます。リクエストボディの検証に失敗すると、プラグインは `RequestValidationException` を発生させます。これは [StatusPages](server-status-pages.md) プラグインを使用して処理できます。

## 依存関係の追加 {id="add_dependencies"}

<p>
    <code>%plugin_name%</code> を使用するには、ビルドスクリプトに <code>%artifact_name%</code> アーティファクトを追加します。
</p>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上記のコードスニペットでは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">
            Ktor バージョンカタログ</a> を使用しています。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上記のコードスニペットでは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">
            Ktor バージョンカタログ</a> を使用しています。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## %plugin_name% のインストール {id="install_plugin"}

<p>
    <code>%plugin_name%</code> プラグインをアプリケーションに<a href="server-plugins.md#install">インストール</a>するには、
    指定した<Links href="server-modules.md" summary="Modules allow you to structure your application by grouping routes.">モジュール</Links>内の <code>install</code> 関数に渡します。
    以下の例は、<code>%plugin_name%</code> をインストールする方法を示しています。
</p>
<list>
    <li>
        <code>embeddedServer()</code> 関数の呼び出し内。
    </li>
    <li>
        <code>Application</code> クラスに明示的に定義された <code>module()</code> 拡張関数内。
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

`%plugin_name%` の設定には、主に3つのステップが含まれます。

1. [ボディコンテンツの受信](#receive-body)。
2. [検証関数の設定](#validation-function)。
3. [バリデーション例外の処理](#validation-exception)。

### 1. ボディの受信 {id="receive-body"}

型パラメータを指定して **[receive](server-requests.md#body_contents)** 関数を呼び出すと、`%plugin_name%` プラグインはリクエストのボディを検証します。たとえば、以下のコードスニペットはボディを `String` 値として受信する方法を示しています。

```kotlin
routing {
    post("/text") {
        val body = call.receive<String>()
        call.respond(body)
    }
}
```

### 2. 検証関数の設定 {id="validation-function"}

リクエストボディを検証するには、`validate` 関数を使用します。
この関数は、検証の成功または失敗の結果を表す `ValidationResult` オブジェクトを返します。
検証に失敗した場合は、**[RequestValidationException](#validation-exception)** が発生します。

`validate` 関数には2つのオーバーロードがあり、2種類の方法でリクエストボディを検証できます。

- 最初の `validate` オーバーロードでは、指定した型のオブジェクトとしてリクエストボディにアクセスできます。
   以下の例は、`String` 値を表すリクエストボディを検証する方法を示しています。
   ```kotlin
   install(RequestValidation) {
       validate<String> { bodyText ->
           if (!bodyText.startsWith("Hello"))
               ValidationResult.Invalid("Body text should start with 'Hello'")
           else ValidationResult.Valid
       }
   }
   ```

   特定の[シリアライザー](server-serialization.md#configure_serializer)を設定した `ContentNegotiation` プラグインがインストールされている場合は、オブジェクトのプロパティを検証できます。詳細については、[例: オブジェクトプロパティの検証](#example-object)を参照してください。

- 2番目の `validate` オーバーロードは `ValidatorBuilder` を受け取り、カスタム検証ルールを提供できるようにします。
   詳細については、[例: バイト配列の検証](#example-byte-array)を参照してください。

### 3. バリデーション例外の処理 {id="validation-exception"}

リクエストの検証に失敗すると、`%plugin_name%` は `RequestValidationException` を発生させます。
この例外を使用すると、リクエストボディにアクセスし、そのリクエストに対するすべての検証失敗の理由を取得できます。

`RequestValidationException` は、[StatusPages](server-status-pages.md) プラグインを使用して次のように処理できます。

```kotlin
install(StatusPages) {
    exception<RequestValidationException> { call, cause ->
        call.respond(HttpStatusCode.BadRequest, cause.reasons.joinToString())
    }
}
```

完全なコード例はこちらで確認できます: [request-validation](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/request-validation)

## 例: オブジェクトプロパティの検証 {id="example-object"}

この例では、`%plugin_name%` プラグインを使用してオブジェクトのプロパティを検証する方法を見ていきます。
サーバーが次の JSON データを含む `POST` リクエストを受信するとします。

```HTTP
POST http://0.0.0.0:8080/json
Content-Type: application/json

{
  "id": -1,
  "firstName": "Jet",
  "lastName": "Brains"
}
```

`id` プロパティの検証を追加するには、次の手順を実行します。

1. 上記の JSON オブジェクトを記述する `Customer` データクラスを作成します。
   ```kotlin
   @Serializable
   data class Customer(val id: Int, val firstName: String, val lastName: String)
   ```

2. [JSON シリアライザー](server-serialization.md#register_json)を使用して `ContentNegotiation` プラグインをインストールします。
   ```kotlin
   install(ContentNegotiation) {
       json()
   }
   ```

3. サーバー側で次のように `Customer` オブジェクトを受信します。
   ```kotlin
   post("/json") {
       val customer = call.receive<Customer>()
       call.respond(customer)
   }
   ```
4. `%plugin_name%` プラグインの設定で、`id` プロパティが指定した範囲内に収まっていることを確認するバリデーションを追加します。
   ```kotlin
   install(RequestValidation) {
       validate<Customer> { customer ->
           if (customer.id <= 0)
               ValidationResult.Invalid("A customer ID should be greater than 0")
           else ValidationResult.Valid
       }
   }
   ```
   
   この場合、`id` の値が `0` 以下のとき、`%plugin_name%` は **[RequestValidationException](#validation-exception)** を発生させます。

## 例: バイト配列の検証 {id="example-byte-array"}

この例では、バイト配列として受信したリクエストボディを検証する方法を見ていきます。
サーバーが次のテキストデータを含む `POST` リクエストを受信するとします。

```HTTP
POST http://localhost:8080/array
Content-Type: text/plain

-1
```

データをバイト配列として受信して検証するには、次の手順を実行します。

1. サーバー側で次のようにデータを受信します。
   ```kotlin
   post("/array") {
       val body = call.receive<ByteArray>()
       call.respond(String(body))
   }
   ```
2. 受信したデータを検証するには、`ValidatorBuilder` を受け取りカスタム検証ルールを提供できる、2番目の `validate` [関数のオーバーロード](#validation-function)を使用します。
   ```kotlin
   install(RequestValidation) {
       validate {
           filter { body ->
               body is ByteArray
           }
           validation { body ->
               check(body is ByteArray)
               val intValue = String(body).toInt()
               if (intValue <= 0)
                   ValidationResult.Invalid("A value should be greater than 0")
               else ValidationResult.Valid
           }
       }
   }
   ```