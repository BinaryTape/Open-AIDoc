[//]: # (title: Ktor Client 中的身份驗證與授權)

<show-structure for="chapter" depth="2"/>
<primary-label ref="client-plugin"/>

<tldr>
<p>
<b>必要相依性</b>: <code>io.ktor:ktor-client-auth</code>
</p>
</tldr>

<link-summary>
Auth 外掛程式可處理用戶端應用程式中的身份驗證與授權。
</link-summary>

Ktor 提供 [`Auth`](https://api.ktor.io/ktor-client-auth/io.ktor.client.plugins.auth/-auth) 外掛程式來處理用戶端應用程式中的身份驗證與授權。典型使用情境包括使用者登入以及取得特定資源的存取權限。

> 在伺服器端，Ktor 提供 [`Authentication`](server-auth.md) 外掛程式來處理身份驗證與授權。
> 
{style="tip"}

## 支援的身份驗證類型 {id="supported"}

HTTP 為存取控制與身份驗證提供了一個[通用架構](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication)。Ktor 用戶端允許你使用以下 HTTP 身份驗證機制：

* [Basic](client-basic-auth.md) - 使用 `Base64` 編碼提供使用者名稱與密碼。如果未搭配 HTTPS 使用，通常不建議採用。
* [Digest](client-digest-auth.md) - 一種身份驗證方法，透過對使用者名稱和密碼套用雜湊函式，以加密形式傳輸使用者憑據。
* [Bearer](client-bearer-auth.md) - 一種涉及稱為 Bearer 權杖的安全權杖的身份驗證機制。例如，你可以將此機制用作 OAuth 流程的一部分，透過 Google、Facebook 和 X 等外部提供者來為應用程式的使用者進行授權。

## 新增相依性 {id="add_dependencies"}

若要啟用身份驗證，請在建置指令碼中加入 `ktor-client-auth` 構件：

<var name="artifact_name" value="ktor-client-auth"/>
<var name="ktor_version_catalog_name" value="ktorLibs.client.auth"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目錄 (version catalog)</a> 來指定 Ktor 相依性。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目錄 (version catalog)</a> 來指定 Ktor 相依性。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>
<tip>
    若要進一步了解 Ktor 用戶端所需的構件，請參閱 <Links href="client-dependencies.md" summary="了解如何將用戶端相依性新增至現有專案。">新增用戶端相依性</Links>。
</tip>

## 安裝 Auth {id="install_plugin"}

若要安裝 `Auth` 外掛程式，請將其傳遞給 [用戶端配置區塊](client-create-and-configure.md#configure-client) 內的 `install()` 函式：

```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.auth.*
//...
val client = HttpClient(CIO) {
    install(Auth) {
        // 配置身份驗證
    }
}
```

## 設定身份驗證 {id="configure_authentication"}

### 選擇身份驗證提供者 {id="choose-provider"}

若要使用特定的身份驗證提供者（[`basic`](client-basic-auth.md)、[`digest`](client-digest-auth.md) 或 [`bearer`](client-bearer-auth.md)），請在 `install {}` 區塊內呼叫對應的函式。

例如，若要配置 basic 身份驗證，請使用 [`basic {}`](https://api.ktor.io/ktor-client-auth/io.ktor.client.plugins.auth.providers/basic.html) 函式：

```kotlin
install(Auth) {
    basic {
        // 配置 basic 身份驗證
    }
}
```

在此區塊內，你可以配置該提供者的專屬設定。

> 關於特定提供者的詳細設定，請參閱對應的主題：
> * [Basic 身份驗證](client-basic-auth.md)
> * [Digest 身份驗證](client-digest-auth.md)
> * [Bearer 身份驗證](client-bearer-auth.md)
> 
{style="tip"}

### 配置 realm {id="realm"}

你可以選擇使用 `realm` 屬性來配置 realm：

```kotlin
install(Auth) {
    basic {
        realm = "Access to the '/' path"
        // ...
    }
}
```

你可以建立多個具有不同 realm 的提供者來存取不同的資源：

```kotlin
install(Auth) {
    basic {
        realm = "Access to the '/' path"
        // ...
    }
    basic {
        realm = "Access to the '/admin' path"
        // ...
    }
}
```

在這種情況下，用戶端會根據包含 realm 的 `WWW-Authenticate` 回應標頭來選擇所需的提供者。

## 提供者選擇 {id="provider-selection"}

當伺服器回傳 `401 Unauthorized` 時，用戶端會根據 `WWW-Authenticate` 回應標頭選擇身份驗證提供者。此標頭指定了伺服器接受哪些身份驗證機制。

如果用戶端只安裝了一個身份驗證提供者，則當伺服器回傳 `401 Unauthorized` 時，`Auth` 外掛程式一律會嘗試該提供者，即使缺少 `WWW-Authenticate` 標頭或指定了不同的機制也是如此。

如果用戶端安裝了多個身份驗證提供者，用戶端將根據 `WWW-Authenticate` 標頭來選擇提供者。

## 權杖快取與快取控制 {id="token-caching"}

[basic](client-basic-auth.md) 和 [bearer](client-bearer-auth.md) 身份驗證提供者會維護內部憑據或權杖快取。此快取允許用戶端重複使用先前載入的身份驗證資料，而不是在每個請求中重新載入，從而在提高效能的同時，仍可在憑據變更時保有完整控制權。

### 存取身份驗證提供者 {id="accessing-authentication-providers"}

當用戶端工作階段期間需要動態更新身份驗證狀態時，你可以使用 `authProvider` 擴充功能存取特定的提供者：

```kotlin
val provider = client.authProvider<BearerAuthProvider>()
```

若要擷取所有已安裝的提供者，請使用 `authProviders` 屬性：

```kotlin
val providers = client.authProviders
```

這些實用工具可讓你以程式化方式檢查提供者或清除快取的權杖。

### 清除快取的權杖 {id="clearing-cached-tokens"}

若要清除單一提供者快取的憑據，請使用 `.clearToken()` 函式：

```kotlin
val provider = client.authProvider<BasicAuthProvider>()
provider?.clearToken()
``` 

若要清除所有支援快取清除的身份驗證提供者的快取權杖，請使用 `.clearAuthTokens()` 函式：

```kotlin
client.clearAuthTokens()
```

清除快取的權杖通常用於以下情境：

* 使用者登出時。
* 應用程式儲存的憑據或權杖發生變更時。
* 需要強制提供者在下一次請求時重新載入身份驗證狀態時。

以下是使用者登出時清除快取權杖的範例：

```kotlin
fun logout() {
    client.clearAuthTokens()
    storage.deleteCredentials()
}
```

### 控制快取行為 {id="controlling-caching-behavior"}

Basic 和 Bearer 身份驗證提供者都允許你使用 `cacheTokens` 選項來控制是否在請求之間快取權杖或憑據。

例如，當動態提供憑據時，你可以停用快取：

```kotlin
basic {
    cacheTokens = false   // 每次請求都會重新載入憑據
    credentials {
        loadCurrentCredentials()
    }
}
```

當身份驗證資料頻繁變更或必須反映最新狀態時，停用權杖快取特別有用。