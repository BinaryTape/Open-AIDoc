[//]: # (title: 缓存)

<primary-label ref="client-plugin"/>

<tldr>
<var name="example_name" value="client-caching"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
HttpCache 插件允许您将之前获取的资源保存在内存或持久化缓存中。
</link-summary>

Ktor 客户端提供了 [`HttpCache`](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.cache/-http-cache/index.html) 插件，用于将之前获取的资源缓存在内存或持久化存储中。

## 添加依赖项 {id="add_dependencies"}

`HttpCache` 插件已包含在 [`ktor-client-core`](client-dependencies.md) 构件中，不需要任何其他依赖项。

## 内存缓存 {id="memory_cache"}

要启用内存缓存，请在 [客户端配置块](client-create-and-configure.md#configure-client) 中安装 `HttpCache`：
```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.cache.*
//...
val client = HttpClient(CIO) {
    install(HttpCache)
}
```

默认情况下，`HttpCache` 插件会将缓存的响应存储在内存中。

例如，如果您对配置了 `Cache-Control` 标头的资源执行两次连续 [请求](client-requests.md)，客户端可以直接从缓存提供第二次响应，而无需再次请求该资源。

## 持久化缓存 {id="persistent_cache"}

您可以通过配置 [`CacheStorage`](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.cache.storage/-cache-storage/index.html) 实现来持久化存储缓存的响应。

Ktor 提供了 [`FileStorage()`](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.cache.storage/-file-storage.html) 函数，可将缓存的响应存储在文件系统中。`FileStorage()` 使用 `kotlinx-io`，并在所有受支持的平台上均可用。

为缓存目录创建一个 `Path` 并将其传递给 `FileStorage()` 函数。
然后，使用 `publicStorage()` 或 `privateStorage()` 函数配置该存储：

```kotlin
val client = HttpClient(CIO) {
    install(HttpCache) {
        publicStorage(FileStorage(Path("build/cache")))
    }
}
```

* 对于可以存储在共享缓存中的响应，请使用 [`publicStorage()`](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.cache/-http-cache/-config/public-storage.html) 函数。
* 对于专用于私有缓存的响应，请使用 [`privateStorage()`](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.cache/-http-cache/-config/private-storage.html) 函数。

> 有关完整示例，请参阅 [client-caching](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-caching)。
>
{style="tip"}