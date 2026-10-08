[//]: # (title: 文本與字元集)

<tip>
    此說明主題正在開發中，將於未來更新。
</tip>
<primary-label ref="client-plugin"/>

此外掛程式允許您處理請求與回應中的純文字內容：使用已註冊的字元集填寫 `Accept` 標頭，並根據 `ContentType` 字元集對請求主體進行編碼以及對回應主體進行解碼。

## 配置 {id="configuration"}

若未在配置或 HTTP 呼叫屬性中指定配置，則預設使用 `Charsets.UTF_8`。

```kotlin
val client = HttpClient(HttpClientEngine) {
    Charsets {
        // 允許使用 `UTF_8`。
        register(Charsets.UTF_8)

        // 允許使用權重（quality）為 0.1 的 `ISO_8859_1`。
        register(Charsets.ISO_8859_1, quality=0.1f)
        
        // 指定傳送請求使用的字元集（若請求標頭中未指定字元集）。
        sendCharset = ...

        // 指定接收回應使用的字元集（若回應標頭中未指定字元集）。
        responseCharsetFallback = ...
    }
}
```
