[//]: # (title: 請求驗證)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="RequestValidation"/>
<var name="package_name" value="io.ktor.server.plugins.requestvalidation"/>
<var name="artifact_name" value="ktor-server-request-validation"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.requestValidation"/>

<tldr>
<p>
<b>必要的相依性</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="request-validation"/>
<p>
    <b>程式碼範例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor 支援 Kotlin/Native，並允許您在無需額外執行階段或虛擬機的情況下執行伺服器。">原生伺服器</Links> 支援</b>: ✅
</p>
</tldr>

<link-summary>
%plugin_name% 提供了驗證傳入請求本文的功能。
</link-summary>

[%plugin_name%](https://api.ktor.io/ktor-server-request-validation/io.ktor.server.plugins.requestvalidation/-request-validation.html) 外掛程式提供了驗證傳入請求本文的功能。如果安裝了包含[序列化程式](server-serialization.md#configure_serializer)的 `ContentNegotiation` 外掛程式，您可以驗證原始請求本文或指定的請求物件屬性。如果請求本文驗證失敗，該外掛程式會引發 `RequestValidationException`，此例外狀況可使用 [StatusPages](server-status-pages.md) 外掛程式進行處理。

## 新增相依性 {id="add_dependencies"}

<p>
    若要使用 <code>%plugin_name%</code>，請將 <code>%artifact_name%</code> 構件新增至您的建置指令碼中：
</p>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目錄</a>來指定 Ktor 相依性。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目錄</a>來指定 Ktor 相依性。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## 安裝 %plugin_name% {id="install_plugin"}

<p>
    若要將 <code>%plugin_name%</code> 外掛程式<a href="server-plugins.md#install">安裝</a>至您的應用程式，請將其傳遞至指定<Links href="server-modules.md" summary="模組可讓您透過分組路由來組織應用程式結構。">模組</Links>中的 <code>install</code> 函式。以下範例展示如何安裝 <code>%plugin_name%</code>：
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
    <code>%plugin_name%</code> 外掛程式也可以<a href="server-plugins.md#install-route">安裝到特定路由</a>。如果您需要針對不同的應用程式資源使用不同的 <code>%plugin_name%</code> 設定，這會很有用。
</p>

## 設定 %plugin_name% {id="configure"}

設定 `%plugin_name%` 包含三個主要步驟：

1. [接收本文內容](#receive-body)。
2. [設定驗證函式](#validation-function)。
3. [處理驗證例外狀況](#validation-exception)。

### 1. 接收本文 {id="receive-body"}

如果您呼叫帶有型別參數的 **[receive](server-requests.md#body_contents)** 函式，`%plugin_name%` 外掛程式會驗證請求本文。例如，以下程式碼片段展示如何將本文接收為 `String` 值：

```kotlin
routing {
    post("/text") {
        val body = call.receive<String>()
        call.respond(body)
    }
}
```

### 2. 設定驗證函式 {id="validation-function"}

若要驗證請求本文，請使用 `validate` 函式。
此函式會傳回代表驗證成功或失敗結果的 `ValidationResult` 物件。
對於失敗的結果，將會引發 **[RequestValidationException](#validation-exception)**。

`validate` 函式具有兩個多載，可讓您透過兩種方式驗證請求本文：

- 第一個 `validate` 多載可讓您將請求本文作為指定型別的物件進行存取。
   以下範例展示如何驗證代表 `String` 值的請求本文：
   ```kotlin
   install(RequestValidation) {
       validate<String> { bodyText ->
           if (!bodyText.startsWith("Hello"))
               ValidationResult.Invalid("Body text should start with 'Hello'")
           else ValidationResult.Valid
       }
   }
   ```

   如果您已安裝並設定了包含特定[序列化程式](server-serialization.md#configure_serializer)的 `ContentNegotiation` 外掛程式，則可以驗證物件屬性。若要了解更多，請參閱[範例：驗證物件屬性](#example-object)。

- 第二個 `validate` 多載接受 `ValidatorBuilder`，並允許您提供自訂驗證規則。
   您可以從[範例：驗證位元組陣列](#example-byte-array)了解更多。

### 3. 處理驗證例外狀況 {id="validation-exception"}

如果請求驗證失敗，`%plugin_name%` 會引發 `RequestValidationException`。
此例外狀況可讓您存取請求本文，並取得該請求所有驗證失敗的原因。

您可以依照下列方式使用 [StatusPages](server-status-pages.md) 外掛程式來處理 `RequestValidationException`：

```kotlin
install(StatusPages) {
    exception<RequestValidationException> { call, cause ->
        call.respond(HttpStatusCode.BadRequest, cause.reasons.joinToString())
    }
}
```

您可以在此處找到完整範例：[request-validation](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/request-validation)。

## 範例：驗證物件屬性 {id="example-object"}

在此範例中，我們將探討如何使用 `%plugin_name%` 外掛程式來驗證物件屬性。
假設伺服器收到包含以下 JSON 資料的 `POST` 請求：

```HTTP
POST http://0.0.0.0:8080/json
Content-Type: application/json

{
  "id": -1,
  "firstName": "Jet",
  "lastName": "Brains"
}
```

若要新增對 `id` 屬性的驗證，請按照以下步驟操作：

1. 建立描述上述 JSON 物件的 `Customer` 資料類別：
   ```kotlin
   @Serializable
   data class Customer(val id: Int, val firstName: String, val lastName: String)
   ```

2. 安裝帶有 [JSON 序列化程式](server-serialization.md#register_json)的 `ContentNegotiation` 外掛程式：
   ```kotlin
   install(ContentNegotiation) {
       json()
   }
   ```

3. 在伺服器端依下列方式接收 `Customer` 物件：
   ```kotlin
   post("/json") {
       val customer = call.receive<Customer>()
       call.respond(customer)
   }
   ```
4. 在 `%plugin_name%` 外掛程式設定中，加入對 `id` 屬性的驗證以確保其落在指定範圍內：
   ```kotlin
   install(RequestValidation) {
       validate<Customer> { customer ->
           if (customer.id <= 0)
               ValidationResult.Invalid("A customer ID should be greater than 0")
           else ValidationResult.Valid
       }
   }
   ```
   
   在此情況下，如果 `id` 值小於或等於 `0`，`%plugin_name%` 將會引發 **[RequestValidationException](#validation-exception)**。

## 範例：驗證位元組陣列 {id="example-byte-array"}

在此範例中，我們將探討如何驗證接收為位元組陣列的請求本文。
假設伺服器收到包含以下文字資料的 `POST` 請求：

```HTTP
POST http://localhost:8080/array
Content-Type: text/plain

-1
```

若要將資料作為位元組陣列接收並進行驗證，請執行下列步驟：

1. 在伺服器端接收資料如下：
   ```kotlin
   post("/array") {
       val body = call.receive<ByteArray>()
       call.respond(String(body))
   }
   ```
2. 若要驗證接收到的資料，我們將使用第二個 `validate` [函式多載](#validation-function)，該多載接受 `ValidatorBuilder` 並允許您提供自訂驗證規則：
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