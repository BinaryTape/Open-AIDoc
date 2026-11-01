[//]: # (title: テキストと文字セット)

<tip>
    このヘルプトピックは開発中であり、将来更新される予定です。
</tip>
<primary-label ref="client-plugin"/>

このプラグインを使用すると、リクエストおよびレスポンス内のプレーンテキストコンテンツを処理できます。登録された文字セットで `Accept` ヘッダーを設定し、`ContentType` の文字セットに従ってリクエストボディをエンコードし、レスポンスボディをデコードします。

## 設定 {id="configuration"}

設定または HTTP 呼び出しプロパティで何も指定されていない場合は、デフォルトで `Charsets.UTF_8` が使用されます。

```kotlin
val client = HttpClient(HttpClientEngine) {
    Charsets {
        // `UTF_8` の使用を許可
        register(Charsets.UTF_8)

        // 品質値 0.1 で `ISO_8859_1` の使用を許可
        register(Charsets.ISO_8859_1, quality=0.1f)
        
        // リクエスト送信用の文字セットを指定（リクエストヘッダーに文字セットがない場合）
        sendCharset = ...

        // レスポンス受信用のフォールバック文字セットを指定（レスポンスヘッダーに文字セットがない場合）
        responseCharsetFallback = ...
    }
}
```