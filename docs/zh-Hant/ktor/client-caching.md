[//]: # (title: 快取)

<primary-label ref="client-plugin"/>

<tldr>
<var name="example_name" value="client-caching"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
HttpCache 外掛程式可讓您將先前擷取的資源儲存在記憶體內部或持久化快取中。
</link-summary>

Ktor 用戶端提供 [`HttpCache`](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.cache/-http-cache/index.html) 外掛程式，用於在記憶體或持久化儲存空間中快取先前擷取的資源。

## 新增相依性 {id="add_dependencies"}

`HttpCache` 外掛程式包含在 [`ktor-client-core`](client-dependencies.md) 構件中，不需要任何額外的相依性。

## 記憶體快取 {id="memory_cache"}

若要啟用記憶體快取，請在[用戶端配置區塊](client-create-and-configure.md#configure-client)中安裝 `HttpCache`：
```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.cache.*
//...
val client = HttpClient(CIO) {
    install(HttpCache)
}
```

預設情況下，`HttpCache` 外掛程式會在記憶體中儲存快取的回應。

例如，如果您對配置了 `Cache-Control` 標頭的資源發出兩次連續的[請求](client-requests.md)，用戶端可以直接從快取提供第二次回應，而無須再次請求該資源。

## 持久化快取 {id="persistent_cache"}

您可以透過配置 [`CacheStorage`](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.cache.storage/-cache-storage/index.html) 實作來持久化儲存快取的回應。

Ktor 提供了 [`FileStorage()`](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.cache.storage/-file-storage.html) 函式，用於將快取的回應儲存在檔案系統中。`FileStorage()` 使用 `kotlinx-io`，並適用於所有支援的平台。

為快取目錄建立一個 `Path`，並將其傳遞給 `FileStorage()` 函式。
接著，使用 `publicStorage()` 或 `privateStorage()` 函式來配置儲存空間：

```kotlin
val client = HttpClient(CIO) {
    install(HttpCache) {
        publicStorage(FileStorage(Path("build/cache")))
    }
}
```

* 針對可儲存在共用快取中的回應，請使用 [`publicStorage()`](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.cache/-http-cache/-config/public-storage.html) 函式。
* 針對專用於私有快取的回應，請使用 [`privateStorage()`](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.cache/-http-cache/-config/private-storage.html) 函式。

> 若要取得完整範例，請參閱 [client-caching](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-caching)。
>
{style="tip"}