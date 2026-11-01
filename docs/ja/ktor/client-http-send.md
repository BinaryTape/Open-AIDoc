[//]: # (title: HttpSend を使用したリクエストのインターセプト)

<primary-label ref="client-plugin"/>

<tldr>
<var name="example_name" value="client-http-send"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

[HttpSend](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins/-http-send/index.html) プラグインを使用すると、レスポンスに応じて HTTP 呼び出しの監視や再試行を行うことができます。たとえば、呼び出しのロギングを実装したり、サーバーがエラーレスポンス（4xx または 5xx のステータスコード）を返した場合にリクエストを再試行したりできます。

`HttpSend` プラグインはインストール（`install`）の必要がありません。使用するには、`HttpClient.plugin` 関数に `HttpSend` を渡し、`intercept` メソッドを呼び出します。以下の例は、レスポンスのステータスコードに応じてリクエストを再試行する方法を示しています。

```kotlin
val client = HttpClient(Apache5)
client.plugin(HttpSend).intercept { request ->
    val originalCall = execute(request)
    if (originalCall.response.status.value !in 100..399) {
        execute(request)
    } else {
        originalCall
    }
}
```

完全なサンプルはこちらで確認できます: [client-http-send](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-http-send)