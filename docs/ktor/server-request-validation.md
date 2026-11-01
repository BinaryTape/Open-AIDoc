[//]: # (title: 请求验证)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="RequestValidation"/>
<var name="package_name" value="io.ktor.server.plugins.requestvalidation"/>
<var name="artifact_name" value="ktor-server-request-validation"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.requestValidation"/>

<tldr>
<p>
<b>所需依赖项</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="request-validation"/>
<p>
    <b>代码示例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor 支持 Kotlin/Native，允许您在没有额外运行时或虚拟机的情况下运行服务器。">原生服务器</Links>支持</b>: ✅
</p>
</tldr>

<link-summary>
%plugin_name% 提供了验证传入请求正文的功能。
</link-summary>

[%plugin_name%](https://api.ktor.io/ktor-server-request-validation/io.ktor.server.plugins.requestvalidation/-request-validation.html) 插件提供了验证传入请求正文的功能。您可以验证原始请求正文，或者在安装了带有[序列化程序](server-serialization.md#configure_serializer)的 `ContentNegotiation` 插件时验证指定的请求对象属性。如果请求正文验证失败，该插件会引发 `RequestValidationException`，可以使用 [StatusPages](server-status-pages.md) 插件对其进行处理。

## 添加依赖项 {id="add_dependencies"}

<p>
    要使用 <code>%plugin_name%</code>，请将 <code>%artifact_name%</code> 构件添加到您的构建脚本中：
</p>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目录</a>来指定 Ktor 依赖项。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目录</a>来指定 Ktor 依赖项。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## 安装 %plugin_name% {id="install_plugin"}

<p>
    要在应用程序中<a href="server-plugins.md#install">安装</a> <code>%plugin_name%</code> 插件，请将其传递给指定<Links href="server-modules.md" summary="模块允许您通过对路由进行分组来构建应用程序。">模块</Links>中的 <code>install</code> 函数。以下示例展示了如何安装 <code>%plugin_name%</code>：
</p>
<list>
    <li>
        在 <code>embeddedServer()</code> 函数调用中。
    </li>
    <li>
        在 <code>Application</code> 类上显式定义的 <code>module()</code> 扩展函数中。
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
    <code>%plugin_name%</code> 插件也可以<a href="server-plugins.md#install-route">安装到特定路由</a>。如果您需要为不同的应用程序资源使用不同的 <code>%plugin_name%</code> 配置，这会非常有用。
</p>

## 配置 %plugin_name% {id="configure"}

配置 `%plugin_name%` 主要包含三个步骤：

1. [接收正文内容](#receive-body)。
2. [配置验证函数](#validation-function)。
3. [处理验证异常](#validation-exception)。

### 1. 接收正文 {id="receive-body"}

如果您调用带有类型实参的 **[receive](server-requests.md#body_contents)** 函数，`%plugin_name%` 插件将验证请求的正文。例如，以下代码段展示了如何将正文作为 `String` 值接收：

```kotlin
routing {
    post("/text") {
        val body = call.receive<String>()
        call.respond(body)
    }
}
```

### 2. 配置验证函数 {id="validation-function"}

要验证请求正文，请使用 `validate` 函数。 
该函数返回一个表示验证成功或失败结果的 `ValidationResult` 对象。
对于失败的结果，会引发 **[RequestValidationException](#validation-exception)**。

`validate` 函数具有两个重载，允许您通过两种方式验证请求正文：

- 第一个 `validate` 重载允许您将请求正文作为指定类型的对象进行访问。
   以下示例展示了如何验证表示 `String` 值的请求正文：
   ```kotlin
   install(RequestValidation) {
       validate<String> { bodyText ->
           if (!bodyText.startsWith("Hello"))
               ValidationResult.Invalid("Body text should start with 'Hello'")
           else ValidationResult.Valid
       }
   }
   ```

   如果您安装了配置有特定[序列化程序](server-serialization.md#configure_serializer)的 `ContentNegotiation` 插件，则可以验证对象属性。详细了解请参阅[示例：验证对象属性](#example-object)。

- 第二个 `validate` 重载接受 `ValidatorBuilder`，允许您提供自定义验证规则。 
   您可以从[示例：验证字节数组](#example-byte-array)中了解更多信息。

### 3. 处理验证异常 {id="validation-exception"}

如果请求验证失败，`%plugin_name%` 会引发 `RequestValidationException`。
此异常允许您访问请求正文并获取此请求所有验证失败的原因。

您可以按如下方式使用 [StatusPages](server-status-pages.md) 插件处理 `RequestValidationException`：

```kotlin
install(StatusPages) {
    exception<RequestValidationException> { call, cause ->
        call.respond(HttpStatusCode.BadRequest, cause.reasons.joinToString())
    }
}
```

您可以在此处找到完整示例：[request-validation](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/request-validation)。

## 示例：验证对象属性 {id="example-object"}

在本示例中，我们将探讨如何使用 `%plugin_name%` 插件验证对象属性。
假设服务器收到包含以下 JSON 数据的 `POST` 请求：

```HTTP
POST http://0.0.0.0:8080/json
Content-Type: application/json

{
  "id": -1,
  "firstName": "Jet",
  "lastName": "Brains"
}
```

要添加对 `id` 属性的验证，请按以下步骤操作：

1. 创建描述上述 JSON 对象的 `Customer` 数据类：
   ```kotlin
   @Serializable
   data class Customer(val id: Int, val firstName: String, val lastName: String)
   ```

2. 安装带有 [JSON 序列化程序](server-serialization.md#register_json)的 `ContentNegotiation` 插件：
   ```kotlin
   install(ContentNegotiation) {
       json()
   }
   ```

3. 在服务器端接收 `Customer` 对象，如下所示：
   ```kotlin
   post("/json") {
       val customer = call.receive<Customer>()
       call.respond(customer)
   }
   ```
4. 在 `%plugin_name%` 插件配置中，添加对 `id` 属性的验证，以确保其位于指定范围内：
   ```kotlin
   install(RequestValidation) {
       validate<Customer> { customer ->
           if (customer.id <= 0)
               ValidationResult.Invalid("A customer ID should be greater than 0")
           else ValidationResult.Valid
       }
   }
   ```
   
   在这种情况下，如果 `id` 值小于或等于 `0`，`%plugin_name%` 将引发 **[RequestValidationException](#validation-exception)**。

## 示例：验证字节数组 {id="example-byte-array"}

在本示例中，我们将探讨如何验证作为字节数组接收的请求正文。
假设服务器收到包含以下文本数据的 `POST` 请求：

```HTTP
POST http://localhost:8080/array
Content-Type: text/plain

-1
```

要将数据作为字节数组接收并对其进行验证，请执行以下步骤：

1. 在服务器端接收数据，如下所示：
   ```kotlin
   post("/array") {
       val body = call.receive<ByteArray>()
       call.respond(String(body))
   }
   ```
2. 为了验证接收到的数据，我们将使用第二个 `validate` [函数重载](#validation-function)，该重载接受 `ValidatorBuilder` 并允许您提供自定义验证规则：
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