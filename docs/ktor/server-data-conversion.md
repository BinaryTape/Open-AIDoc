[//]: # (title: 数据转换)

<primary-label ref="server-plugin"/>

<var name="artifact_name" value="ktor-server-data-conversion"/>
<var name="package_name" value="io.ktor.server.plugins.dataconversion"/>
<var name="plugin_name" value="DataConversion"/>
<var name="example_name" value="data-conversion"/>

<tldr>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
<b>所需依赖项</b>：<code>io.ktor:%artifact_name%</code>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor 支持 Kotlin/Native，允许您在没有额外运行时或虚拟机的情况下运行服务器。">Native 服务器</Links>支持</b>：✅
</p>
</tldr>

<link-summary>
用于 Ktor 服务器的 %plugin_name% 插件允许您为序列化和反序列化值列表添加自定义转换器。
</link-summary>

[%plugin_name%](https://api.ktor.io/ktor-utils/io.ktor.util.converters/-data-conversion/index.html) 插件允许您序列化和反序列化值列表。默认情况下，Ktor 通过 [DefaultConversionService](https://api.ktor.io/ktor-utils/io.ktor.util.converters/-default-conversion-service/index.html) 处理基本类型和枚举。您可以通过安装和配置 `%plugin_name%` 插件来扩展此服务以处理其他类型。

## 添加依赖项 {id="add_dependencies"}

<p>
    要使用 <code>%plugin_name%</code>，您需要在构建脚本中包含 <code>%artifact_name%</code> 构件：
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

## 安装 %plugin_name% {id="install_plugin"}

<p>
    要在应用程序中<a href="#install">安装</a> <code>%plugin_name%</code> 插件，请将其传递给指定<Links href="/ktor/server-modules" summary="模块允许您通过对路由进行分组来构建应用程序。">模块</Links>中的 <code>install</code> 函数。
    以下代码片段展示了如何安装 <code>%plugin_name%</code> ...
</p>
<list>
    <li>
        ... 在 <code>embeddedServer</code> 函数调用中。
    </li>
    <li>
        ... 在显式定义的 <code>module</code>（它是 <code>Application</code> 类的扩展函数）中。
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

## 添加转换器 {id="add-converters"}

您可以在 `%plugin_name%` 配置中定义类型转换。为指定类型提供 `convert<T>` 方法，并使用可用函数来序列化和反序列化值列表：

* 使用 `decode()` 函数来反序列化值列表。它接受一个字符串列表（代表 URL 中的重复值），并返回解码后的值。

  ```kotlin
  decode { values -> // 转换器: (values: List<String>) -> Any?
    // 反序列化值
  }
  ```

* 使用 `encode()` 函数来序列化一个值。该函数接受一个任意值并返回一个代表该值的字符串列表。

  ```kotlin
     encode { value -> // 转换器: (value: Any?) -> List<String>
       // 序列化值
      }
  ```

## 访问服务

{id="service"}

您可以从当前上下文中访问 `%plugin_name%` 服务：

```kotlin
val dataConversion = application.conversionService
```

然后，您可以使用转换器服务来调用回调函数：

* `fromValues(values: List<String>, type: TypeInfo)` 回调函数接受 `values` 字符串列表，以及要转换到的 `TypeInfo` 目标类型，并返回解码后的值。
* `toValues(value: Any?)` 回调函数接受一个任意值，并返回代表该值的字符串列表。

## 示例

在以下示例中，定义并配置了 `LocalDate` 类型的转换器，用于序列化和反序列化值。当调用 `encode` 函数时，该服务将使用 `SimpleDateFormat` 转换该值，并返回包含格式化值的列表。当调用 `decode` 函数时，该服务将日期格式化为 `LocalDate` 并将其返回。

```kotlin
    install(DataConversion) {
        convert<LocalDate> { // this: DelegatingConversionService
            val formatter = DateTimeFormatterBuilder()
                .appendValue(ChronoField.YEAR, 4, 4, SignStyle.NEVER)
                .appendValue(ChronoField.MONTH_OF_YEAR, 2)
                .appendValue(ChronoField.DAY_OF_MONTH, 2)
                .toFormatter(Locale.ROOT)

            decode { values -> // 转换器: (values: List<String>) -> Any?
                LocalDate.from(formatter.parse(values.single()))
            }

            encode { value -> // 转换器: (value: Any?) -> List<String>
                listOf(SimpleDateFormat.getInstance().format(value))
            }
        }
    }
```

随后可以手动调用转换服务来获取编码和解码后的值：

```kotlin
val encodedDate = application.conversionService.toValues(call.parameters["date"])
val decodedDate = application.conversionService.fromValues(encodedDate, typeInfo<LocalDate>())
```

有关完整示例，请参阅 [%example_name%](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%)