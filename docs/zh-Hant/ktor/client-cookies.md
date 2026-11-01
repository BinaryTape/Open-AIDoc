[//]: # (title: Cookie)

<primary-label ref="client-plugin"/>

<tldr>
<var name="example_name" value="client-cookies"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
HttpCookies 外掛程式可自動處理 Cookie，並將其保存在不同呼叫之間的儲存機制中。
</link-summary>

Ktor 用戶端允許你透過以下方式手動處理 Cookie：
* `cookie` 函式允許你將 Cookie 附加到[特定請求](client-requests.md#cookies)。
* `setCookie` 函式可讓你剖析在[回應](client-responses.md#headers)中接收到的 `Set-Cookie` 標頭值。

[HttpCookies](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.cookies/-http-cookies/index.html) 外掛程式會自動處理 Cookie，並將其保存在儲存區中以便在各次呼叫之間保留。
預設情況下，它使用記憶體內儲存，但你也可以使用 [CookiesStorage](#custom_storage) 實作持久化儲存。

## 新增相依性 {id="add_dependencies"}
`HttpCookies` 只需要 [ktor-client-core](client-dependencies.md) 構件，不需要任何特定的相依性。

## 安裝與設定 HttpCookies {id="install_plugin"}

若要安裝 `HttpCookies`，請在[用戶端設定區塊](client-create-and-configure.md#configure-client)中將其傳遞給 `install` 函式：
```kotlin
val client = HttpClient(CIO) {
    install(HttpCookies)
}
```

這樣就足以讓 Ktor 用戶端在各請求之間保留 Cookie。你可以在此處找到完整範例：[client-cookies](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-cookies)。

`HttpCookies` 外掛程式還允許你透過使用 `ConstantCookiesStorage` 為每個請求新增一組特定的 Cookie。這在驗證伺服器回應的測試案例中可能非常有用。以下範例展示如何為特定網域的所有請求新增指定的 Cookie：

```kotlin
val client = HttpClient(CIO) {
    install(HttpCookies) {
        storage = ConstantCookiesStorage(Cookie(name = "user_name", value = "jetbrains", domain = "0.0.0.0"))
    }
}
```

## 取得 Cookie {id="get_cookies"}

用戶端提供了 `cookies` 函式以取得指定 URL 的所有 Cookie：

```kotlin
client.cookies("http://0.0.0.0:8080/")
```

## 自訂 Cookie 儲存 {id="custom_storage"}

如有需要，你可以透過實作 [CookiesStorage](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.cookies/-cookies-storage/index.html) 介面來建立自訂的 Cookie 儲存：

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

你可以參考 [AcceptAllCookiesStorage](https://github.com/ktorio/ktor/blob/main/ktor-client/ktor-client-core/common/src/io/ktor/client/plugins/cookies/AcceptAllCookiesStorage.kt) 的實作方式。