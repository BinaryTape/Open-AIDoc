[//]: # (title: WebSocket Deflate 擴充套件)

Ktor 為用戶端與伺服器實作了 `Deflate` WebSocket 擴充套件 [RFC-7692](https://tools.ietf.org/html/rfc7692)。
該擴充套件可以在傳送前透明地壓縮框架，並在接收後進行解壓縮。
如果您要傳送大量的文字資料，啟用此擴充套件會非常有幫助。

## 安裝 {id="installation"}

要使用此擴充套件，必須先進行安裝。我們可以透過在 `extensions` 區塊中使用 `install` 方法來達成：

```kotlin
// 用於用戶端與伺服器
install(WebSockets) {
    extensions {
        install(WebSocketDeflateExtension) {
            /**
             * [java.util.zip.Deflater] 所使用的壓縮層級。
             */
            compressionLevel = Deflater.DEFAULT_COMPRESSION

            /**
             * 防止壓縮較小的外傳框架。
             */
            compressIfBiggerThan(bytes = 4 * 1024)
        }
    }
}
```

### 進階設定參數 {id="advanced-configuration-parameters"}

#### 上下文接管 (Context takeover) {id="context-takeover"}

指定用戶端（及伺服器）是否應使用壓縮視窗。
啟用這些參數可減少每個單一工作階段所分配的空間量。
請注意，由於 `java.util.zip.Deflater` API 的限制，無法設定視窗大小。
該值固定為 `15`。

```kotlin
clientNoContextTakeOver = false

serverNoContextTakeOver = false
```

這些參數在 [RFC-7692 第 7.1.1 節](https://tools.ietf.org/html/rfc7692#section-7.1.1) 中有詳細說明。

#### 指定壓縮條件 {id="specify-compress-condition"}

若要明確指定壓縮條件，您可以使用 `compressIf` 方法。例如，僅壓縮文字：

```kotlin
compressIf { frame -> 
    frame is Frame.Text
}
```
所有對 `compressIf` 的呼叫都會在執行壓縮之前進行評估。

#### 微調協定清單 {id="fine-tune-list-of-protocols"}

可以根據需要使用 `configureProtocols` 方法編輯要傳送的協定清單：

```kotlin
configureProtocols { protocols ->
    protocols.clear()
    protocols.add(...)
}
```
