[//]: # (title: 資料轉換)

<primary-label ref="server-plugin"/>

<var name="artifact_name" value="ktor-server-data-conversion"/>
<var name="package_name" value="io.ktor.server.plugins.dataconversion"/>
<var name="plugin_name" value="DataConversion"/>
<var name="example_name" value="data-conversion"/>

<tldr>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
<b>必要的相依性</b>：<code>io.ktor:%artifact_name%</code>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor 支援 Kotlin/Native，並允許您在沒有額外執行階段或虛擬機的情況下執行伺服器。">Native 伺服器</Links> 支援</b>：✅
</p>
</tldr>

<link-summary>
Ktor 伺服器的 %plugin_name% 外掛程式可讓您針對值的清單序列化與反序列化，新增自訂的轉換器。
</link-summary>

[%plugin_name%](https://api.ktor.io/ktor-utils/io.ktor.util.converters/-data-conversion/index.html) 外掛程式可讓您序列化與反序列化值的清單。預設情況下，Ktor 透過 [DefaultConversionService](https://api.ktor.io/ktor-utils/io.ktor.util.converters/-default-conversion-service/index.html) 處理基本型別與列舉。您可以透過安裝與配置 `%plugin_name%` 外掛程式來擴充此服務，以處理額外的型別。

## 新增相依性 {id="add_dependencies"}

<p>
    若要使用 <code>%plugin_name%</code>，您需要在組建指令碼中包含 <code>%artifact_name%</code> 構件：
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

## 安裝 %plugin_name% {id="install_plugin"}

<p>
    若要將 <code>%plugin_name%</code> 外掛程式<a href="#install">安裝</a>到應用程式，請將其傳遞給指定 <Links href="/ktor/server-modules" summary="模組允許您透過分組路由來建構您的應用程式。">模組</Links> 中的 <code>install</code> 函式。
    下方的程式碼片段展示了如何安裝 <code>%plugin_name%</code> ...
</p>
<list>
    <li>
        ... 在 <code>embeddedServer</code> 函式呼叫內。
    </li>
    <li>
        ... 在明確定義的 <code>module</code> 內，該模組是 <code>Application</code> 類別的擴充函式。
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

## 新增轉換器 {id="add-converters"}

您可以在 `%plugin_name%` 配置中定義型別轉換。為指定的型別提供 `convert<T>` 方法，並使用可用的函式來序列化與反序列化值的清單：

* 使用 `decode()` 函式來反序列化值的清單。它接收一個字串清單（代表 URL 中重複的值），並回傳解碼後的值。

  ```kotlin
  decode { values -> // converter: (values: List<String>) -> Any?
    // 反序列化值
  }
  ```

* 使用 `encode()` 函式來序列化一個值。該函式接收一個任意的值，並回傳代表它的字串清單。

  ```kotlin
     encode { value -> // converter: (value: Any?) -> List<String>
       // 序列化值
      }
  ```

## 存取服務

{id="service"}

您可以從當前上下文中存取 `%plugin_name%` 服務：

```kotlin
val dataConversion = application.conversionService
```

接著，您可以使用轉換器服務來呼叫回呼函式：

* `fromValues(values: List<String>, type: TypeInfo)` 回呼函式接受 `values` 作為字串清單，以及要將值轉換成的 `TypeInfo`，並回傳解碼後的值。
* `toValues(value: Any?)` 回呼函式接受一個任意的值，並回傳代表它的字串清單。

## 範例

在以下範例中，定義了 `LocalDate` 型別的轉換器，並配置為序列化與反序列化值。當呼叫 `encode` 函式時，服務將使用 `SimpleDateFormat` 轉換該值，並回傳包含格式化後值的清單。當呼叫 `decode` 函式時，服務將日期格式化為 `LocalDate` 並將其回傳。

```kotlin
    install(DataConversion) {
        convert<LocalDate> { // this: DelegatingConversionService
            val formatter = DateTimeFormatterBuilder()
                .appendValue(ChronoField.YEAR, 4, 4, SignStyle.NEVER)
                .appendValue(ChronoField.MONTH_OF_YEAR, 2)
                .appendValue(ChronoField.DAY_OF_MONTH, 2)
                .toFormatter(Locale.ROOT)

            decode { values -> // converter: (values: List<String>) -> Any?
                LocalDate.from(formatter.parse(values.single()))
            }

            encode { value -> // converter: (value: Any?) -> List<String>
                listOf(SimpleDateFormat.getInstance().format(value))
            }
        }
    }
```

接著可以手動呼叫轉換服務來取得編碼與解碼後的值：

```kotlin
val encodedDate = application.conversionService.toValues(call.parameters["date"])
val decodedDate = application.conversionService.fromValues(encodedDate, typeInfo<LocalDate>())
```

如需完整範例，請參閱 [%example_name%](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%)