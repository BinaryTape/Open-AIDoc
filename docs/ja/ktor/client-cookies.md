[//]: # (title: Cookie)

<primary-label ref="client-plugin"/>

<tldr>
<var name="example_name" value="client-cookies"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
HttpCookies プラグインは Cookie を自動的に処理し、ストレージ内に呼び出し間で保持します。
</link-summary>

Ktor クライアントでは、以下の方法で Cookie を手動で処理できます。
* `cookie` 関数を使用すると、[特定のリクエスト](client-requests.md#cookies)に Cookie を追加できます。
* `setCookie` 関数を使用すると、[レスポンス](client-responses.md#headers)で受信した `Set-Cookie` ヘッダーの値をパースできます。

[HttpCookies](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.cookies/-http-cookies/index.html) プラグインは Cookie を自動的に処理し、ストレージ内で呼び出し間にわたって保持します。
デフォルトではインメモリストレージを使用しますが、[CookiesStorage](#custom_storage) を使用して永続ストレージを実装することもできます。

## 依存関係の追加 {id="add_dependencies"}
`HttpCookies` は [ktor-client-core](client-dependencies.md) アーティファクトのみを必要とし、特定の依存関係を追加する必要はありません。

## HttpCookies のインストールと設定 {id="install_plugin"}

`HttpCookies` をインストールするには、[クライアント設定ブロック](client-create-and-configure.md#configure-client)内で `install` 関数に渡します。
```kotlin
val client = HttpClient(CIO) {
    install(HttpCookies)
}
```

これだけで、Ktor クライアントがリクエスト間で Cookie を保持できるようになります。完全なサンプルはこちらで確認できます: [client-cookies](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-cookies)。

また、`HttpCookies` プラグインでは、`ConstantCookiesStorage` を使用して各リクエストに特定の Cookie セットを追加することもできます。これは、サーバーのレスポンスを検証するテストケースなどで役立ちます。以下の例は、特定のドメインに対するすべてのリクエストに指定した Cookie を追加する方法を示しています。

```kotlin
val client = HttpClient(CIO) {
    install(HttpCookies) {
        storage = ConstantCookiesStorage(Cookie(name = "user_name", value = "jetbrains", domain = "0.0.0.0"))
    }
}
```

## Cookie の取得 {id="get_cookies"}

クライアントには、指定された URL のすべての Cookie を取得するための `cookies` 関数が用意されています。

```kotlin
client.cookies("http://0.0.0.0:8080/")
```

## カスタム Cookie ストレージ {id="custom_storage"}

必要に応じて、[CookiesStorage](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.cookies/-cookies-storage/index.html) インターフェースを実装することでカスタムの Cookie ストレージを作成できます。

```kotlin
val client = HttpClient(CIO) {
    install(HttpCookies) {
        storage = CustomCookiesStorage()
    }
}

public class CustomCookiesStorage : CookiesStorage {
    // ...
}
```

実装の参考として [AcceptAllCookiesStorage](https://github.com/ktorio/ktor/blob/main/ktor-client/ktor-client-core/common/src/io/ktor/client/plugins/cookies/AcceptAllCookiesStorage.kt) を参照してください。