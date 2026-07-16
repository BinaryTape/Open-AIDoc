[//]: # (title: リクエストバリデーション)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="RequestValidation"/>
<var name="package_name" value="io.ktor.server.plugins.requestvalidation"/>
<var name="artifact_name" value="ktor-server-request-validation"/>

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
    <b><Links href="/ktor/server-native" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">Nativeサーバー</Links>のサポート</b>: ✅
</p>
</tldr>

<link-summary>
%plugin_name%は、受信リクエストのボディをバリデーションする機能を提供します。
</link-summary>

[%plugin_name%](https://api.ktor.io/ktor-server-request-validation/io.ktor.server.plugins.requestvalidation/-request-validation.html)プラグインは、受信リクエストのボディをバリデーション（検証）する機能を提供します。生のリクエストボディや、[シリアライザー](server-serialization.md#configure_serializer)を備えた`ContentNegotiation`プラグインがインストールされている場合は、特定のリクエストオブジェクトのプロパティをバリデーションできます。リクエストボディのバリデーションに失敗すると、プラグインは`RequestValidationException`をスローします。これは[StatusPages](server-status-pages.md)プラグインを使用して処理できます。

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

## %plugin_name%のインストール {id="install_plugin"}

<p>
    <code>%plugin_name%</code>プラグインをアプリケーションに<a href="#install">インストール</a>するには、指定された<Links href="/ktor/server-modules" summary="Modules allow you to structure your application by grouping routes.">モジュール</Links>内の<code>install</code>関数に渡します。
    以下のコードスニペットは、<code>%plugin_name%</code>をインストールする方法を示しています。
</p>
<list>
    <li>
        ... <code>embeddedServer</code>関数の呼び出し内。
    </li>
    <li>
        ... <code>Application</code>クラスの拡張関数である、明示的に定義された<code>module</code>内。
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
    <code>%plugin_name%</code>プラグインは、<a href="#install-route">特定のルートにインストール</a>することもできます。
    これは、アプリケーションの異なるリソースに対して異なる<code>%plugin_name%</code>設定が必要な場合に便利です。
</p>

## %plugin_name%の設定 {id="configure"}

`%plugin_name%`の設定には、主に3つのステップが含まれます。

1. [ボディ・コンテンツの受信](#receive-body)
2. [バリデーション関数の設定](#validation-function)
3. [バリデーション例外の処理](#validation-exception)

### 1. ボディの受信 {id="receive-body"}

`%plugin_name%`プラグインは、型パラメータを指定して**[receive](server-requests.md#body_contents)**関数を呼び出した場合に、リクエストのボディをバリデーションします。例えば、以下のコードスニペットはボディを`String`値として受信する方法を示しています。

```kotlin
routing {
    post("/text") {
        val body = call.receive<String>()
        call.respond(body)
    }
}
```

### 2. バリデーション関数の設定 {id="validation-function"}

リクエストボディをバリデーションするには、`validate`関数を使用します。
この関数は、バリデーションの成功または失敗を表す`ValidationResult`オブジェクトを返します。
失敗の結果の場合、**[RequestValidationException](#validation-exception)**がスローされます。

`validate`関数には2つのオーバーロードがあり、2つの方法でリクエストボディをバリデーションできます。

- 1つ目の`validate`オーバーロードでは、リクエストボディを指定された型のオブジェクトとしてアクセスできます。
   以下の例は、`String`値を表すリクエストボディをバリデーションする方法を示しています。
   ```kotlin
   install(RequestValidation) {
       validate<String> { bodyText ->
           if (!bodyText.startsWith("Hello"))
               ValidationResult.Invalid("Body text should start with 'Hello'")
           else ValidationResult.Valid
       }
   }
   ```

   特定の[シリアライザー](server-serialization.md#configure_serializer)で設定された`ContentNegotiation`プラグインがインストールされている場合は、オブジェクトのプロパティをバリデーションできます。詳細は[例：オブジェクトプロパティのバリデーション](#example-object)を参照してください。

- 2つ目の`validate`オーバーロードは`ValidatorBuilder`を受け取り、カスタムバリデーションルールを提供できます。
   詳細は[例：バイト配列のバリデーション](#example-byte-array)を参照してください。

### 3. バリデーション例外の処理 {id="validation-exception"}

リクエストのバリデーションに失敗すると、`%plugin_name%`は`RequestValidationException`をスローします。
この例外を使用すると、リクエストボディにアクセスし、そのリクエストに対するすべてのバリデーション失敗の理由を取得できます。

`RequestValidationException`は、次のように[StatusPages](server-status-pages.md)プラグインを使用して処理できます。

```kotlin
install(StatusPages) {
    exception<RequestValidationException> { call, cause ->
        call.respond(HttpStatusCode.BadRequest, cause.reasons.joinToString())
    }
}
```

完全な例はこちらにあります: [request-validation](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/request-validation)

## 例：オブジェクトプロパティのバリデーション {id="example-object"}

この例では、`%plugin_name%`プラグインを使用してオブジェクトプロパティをバリデーションする方法を見ていきます。
サーバーが以下のJSONデータを含む`POST`リクエストを受信すると仮定します。

```HTTP
POST http://0.0.0.0:8080/json
Content-Type: application/json

{
  "id": -1,
  "firstName": "Jet",
  "lastName": "Brains"
}
```

`id`プロパティのバリデーションを追加するには、以下の手順に従います。

1. 上記のJSONオブジェクトを記述する`Customer`データクラスを作成します。
   ```kotlin
   @Serializable
   data class Customer(val id: Int, val firstName: String, val lastName: String)
   ```

2. [JSONシリアライザー](server-serialization.md#register_json)を使用して`ContentNegotiation`プラグインをインストールします。
   ```kotlin
   install(ContentNegotiation) {
       json()
   }
   ```

3. 次のようにサーバー側で`Customer`オブジェクトを受信します。
   ```kotlin
   post("/json") {
       val customer = call.receive<Customer>()
       call.respond(customer)
   }
   ```
4. `%plugin_name%`プラグインの設定で、`id`プロパティが指定された範囲に収まることを確認するバリデーションを追加します。
   ```kotlin
   install(RequestValidation) {
       validate<Customer> { customer ->
           if (customer.id <= 0)
               ValidationResult.Invalid("A customer ID should be greater than 0")
           else ValidationResult.Valid
       }
   }
   ```
   
   この場合、`id`の値が`0`以下であれば、`%plugin_name%`は**[RequestValidationException](#validation-exception)**をスローします。

## 例：バイト配列のバリデーション {id="example-byte-array"}

この例では、バイト配列として受信したリクエストボディをバリデーションする方法を見ていきます。
サーバーが以下のテキストデータを含む`POST`リクエストを受信すると仮定します。

```HTTP
POST http://localhost:8080/array
Content-Type: text/plain

-1
```

データをバイト配列として受信してバリデーションするには、以下の手順を実行します。

1. 次のようにサーバー側でデータを受信します。
   ```kotlin
   post("/array") {
       val body = call.receive<ByteArray>()
       call.respond(String(body))
   }
   ```
2. 受信したデータをバリデーションするために、`ValidatorBuilder`を受け取りカスタムバリデーションルールを提供できる2つ目の`validate` [関数オーバーロード](#validation-function)を使用します。
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