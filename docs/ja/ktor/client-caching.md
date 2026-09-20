[//]: # (title: キャッシュ)

<primary-label ref="client-plugin"/>

<tldr>
<var name="example_name" value="client-caching"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
HttpCacheプラグインを使用すると、以前に取得したリソースをメモリ内キャッシュまたは永続キャッシュに保存できます。
</link-summary>

Ktorクライアントは、以前に取得したリソースをメモリまたは永続ストレージにキャッシュするための[`HttpCache`](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.cache/-http-cache/index.html)プラグインを提供しています。

## 依存関係の追加 {id="add_dependencies"}

`HttpCache`プラグインは[`ktor-client-core`](client-dependencies.md)アーティファクトに含まれており、追加の依存関係は必要ありません。

## メモリ内キャッシュ {id="memory_cache"}

メモリ内キャッシュを有効にするには、[クライアント構成ブロック](client-create-and-configure.md#configure-client)で`HttpCache`をインストールします。
```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.cache.*
//...
val client = HttpClient(CIO) {
    install(HttpCache)
}
```

デフォルトでは、`HttpCache`プラグインはキャッシュされたレスポンスをメモリに保存します。

例えば、`Cache-Control`ヘッダーが設定されたリソースに対して2回連続で[リクエスト](client-requests.md)を送信した場合、クライアントはリソースを再度リクエストする代わりに、キャッシュから2回目のレスポンスを提供できます。

## 永続キャッシュ {id="persistent_cache"}

[`CacheStorage`](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.cache.storage/-cache-storage/index.html)の実装を設定することで、キャッシュされたレスポンスを永続的に保存できます。

Ktorは、キャッシュされたレスポンスをファイルシステムに保存する[`FileStorage()`](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.cache.storage/-file-storage.html)関数を提供しています。`FileStorage()`は`kotlinx-io`を使用しており、サポートされているすべてのプラットフォームで利用できます。

キャッシュディレクトリの`Path`を作成し、`FileStorage()`関数に渡します。
次に、`publicStorage()`または`privateStorage()`関数を使用してストレージを設定します。

```kotlin
val client = HttpClient(CIO) {
    install(HttpCache) {
        publicStorage(FileStorage(Path("build/cache")))
    }
}
```

* 共有キャッシュに保存できるレスポンスには、[`publicStorage()`](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.cache/-http-cache/-config/public-storage.html)関数を使用します。
* プライベートキャッシュを対象とするレスポンスには、[`privateStorage()`](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.cache/-http-cache/-config/private-storage.html)関数を使用します。

> 完全な例については、[client-caching](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-caching)を参照してください。
>
{style="tip"}