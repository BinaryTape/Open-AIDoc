[//]: # (title: WebSocket Deflate拡張機能)

Ktorは、クライアントとサーバーの両方に対して`Deflate` WebSocket拡張機能 [RFC-7692](https://tools.ietf.org/html/rfc7692) を実装しています。この拡張機能は、送信前にフレームを透過的に圧縮し、受信後に展開（デコンプレス）できます。大量のテキストデータを送信する場合、この拡張機能を有効にすると便利です。

## インストール {id="installation"}

この拡張機能を使用するには、まずインストールする必要があります。そのためには、`extensions`ブロック内で`install`メソッドを使用します。

```kotlin
// クライアントおよびサーバー用
install(WebSockets) {
    extensions {
        install(WebSocketDeflateExtension) {
            /**
             * [java.util.zip.Deflater] で使用する圧縮レベル。
             */
            compressionLevel = Deflater.DEFAULT_COMPRESSION

            /**
             * 小さな送信フレームの圧縮を防ぎます。
             */
            compressIfBiggerThan(bytes = 4 * 1024)
        }
    }
}
```

### 高度な設定パラメータ {id="advanced-configuration-parameters"}

#### コンテキストのテイクオーバー（Context takeover） {id="context-takeover"}

クライアント（およびサーバー）が圧縮ウィンドウを使用するかどうかを指定します。これらのパラメータを有効にすると、1つのセッションあたりに割り当てられるスペースの量が削減されます。`java.util.zip.Deflater` APIの制限により、ウィンドウサイズは設定できないことに注意してください。値は`15`に固定されています。

```kotlin
clientNoContextTakeOver = false

serverNoContextTakeOver = false
```

これらのパラメータについては、[RFC-7692 Section 7.1.1](https://tools.ietf.org/html/rfc7692#section-7.1.1) で説明されています。

#### 圧縮条件の指定 {id="specify-compress-condition"}

圧縮条件を明示的に指定するには、`compressIf`メソッドを使用できます。例えば、テキストのみを圧縮する場合：

```kotlin
compressIf { frame -> 
    frame is Frame.Text
}
```
`compressIf`へのすべての呼び出しは、圧縮が行われる前に評価されます。

#### プロトコルリストの微調整 {id="fine-tune-list-of-protocols"}

送信するプロトコルのリストは、`configureProtocols`メソッドを使用して必要に応じて編集できます：

```kotlin
configureProtocols { protocols ->
    protocols.clear()
    protocols.add(...)
}
```
