[//]: # (title: テキストと文字セット)

<tip>
    このヘルプトピックは開発中であり、将来更新される予定です。
</tip>
<primary-label ref="client-plugin"/>

このプラグインを使用すると、リクエストおよびレスポンス内のプレーンテキストコンテンツを処理できます。具体的には、`Accept` ヘッダーを登録済みの文字セットで埋め、リクエストボディをエンコードし、`ContentType` の文字セットに従ってレスポンスボディをデコードします。

## 設定 {id="configuration"}

設定または HTTP コールのプロパティで設定が指定されていない場合、デフォルトで `Charsets.UTF_8` が使用されます。

```kotlin
val client = HttpClient(HttpClientEngine) {
    Charsets {
        // UTF_8 の使用を許可します。
        register(Charsets.UTF_8)

        // ISO_8859_1 を quality 0.1 で使用することを許可します。
        register(Charsets.ISO_8859_1, quality=0.1f)
        
        // リクエストを送信する際の文字セットを指定します（リクエストヘッダーに文字セットがない場合）。
        sendCharset = ...

        // レスポンスを受信する際の文字セットを指定します（レスポンスヘッダーに文字セットがない場合）。
        responseCharsetFallback = ...
    }
}
```
