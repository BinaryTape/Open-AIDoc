[//]: # (title: 文本与字符集)

<tip>
    此帮助主题正在开发中，未来将会更新。
</tip>
<primary-label ref="client-plugin"/>

该插件允许您处理请求和响应中的纯文本内容：使用已注册的字符集填充 `Accept` 标头，根据 `ContentType` 字符集对请求体进行编码以及对响应体进行解码。

## 配置 {id="configuration"}

如果在配置或 HTTP 调用属性中未指定任何配置，则默认使用 `Charsets.UTF_8`。

```kotlin
val client = HttpClient(HttpClientEngine) {
    Charsets {
        // 允许使用 `UTF_8`。
        register(Charsets.UTF_8)

        // 允许使用品质（quality）为 0.1 的 `ISO_8859_1`。
        register(Charsets.ISO_8859_1, quality=0.1f)
        
        // 指定发送请求所使用的 Charset（如果请求头中未指定字符集）。
        sendCharset = ...

        // 指定接收响应所使用的 Charset（如果响应头中未指定字符集）。
        responseCharsetFallback = ...
    }
}
```