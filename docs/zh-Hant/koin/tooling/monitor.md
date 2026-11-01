---
title: "@Monitor"
---

# @Monitor

`@Monitor` 標記一個類別或函式以進行追蹤。在建置時，Koin 編譯器外掛程式會將每個被監控的函式包裝在 Kotzilla SDK 的追蹤呼叫中，因此其執行時間與錯誤會顯示在 Kotzilla 平台上。本頁面介紹該註解在有與沒有 Kotzilla SDK 時的作用。本文假設已設定 [Koin 編譯器外掛程式](/docs/setup/compiler-plugin)。

## 無 Kotzilla 的內建監控 {id="built-in-monitoring-without-kotzilla"}

Koin 在執行期查看發生什麼事的內建方式是記錄器。它會將模組載入與執行個體建立輸出至主控台或 Logcat。請參閱[記錄](/docs/reference/koin-core/starting-koin#logging)。

`@Monitor` 本身不會增加任何內容。如果編譯 classpath 上沒有 Kotzilla SDK，編譯器外掛程式會保持被監控的函式不變，並在每次編譯時回報一個警告：

```
KOIN-M001: @Monitor: Kotzilla SDK not found on classpath - monitoring disabled
```

程式碼會像沒有該註解一樣編譯並執行。你可以將 `@Monitor` 保留在共享程式碼中，僅在想要追蹤的組建中新增該 SDK。

## 為類別或函式加上註解 {id="annotating-a-class-or-a-function"}

`@Monitor` 位於 `org.koin.core.annotation` 中，與其他 Koin 註解並列。將其放置於類別上可追蹤其所有公用函式，或放置於單一函式上：

```kotlin
import org.koin.core.annotation.Monitor

@Monitor
class UserService(private val userRepository: UserRepository) {

    fun findUser(id: String): User? = userRepository.findById(id)

    suspend fun createUser(userData: UserData): User = userRepository.save(userData)

    private fun audit(user: User) { ... } // private: not traced
}

class SyncService(private val api: ApiService) {

    @Monitor
    suspend fun sync() { ... }
}
```

無論使用何種風格宣告類別，該註解的運作方式都相同：註解或任何 DSL 形式（編譯器外掛程式、Constructor DSL 或 Classic DSL）。ViewModel 也可以被監控：

```kotlin
@Monitor
class DetailViewModel(private val repository: Repository) : ViewModel() {
    fun loadData(id: String): StateFlow<Data> = repository.getData(id)
}
```

## 編譯器外掛程式產生的內容 {id="what-the-compiler-plugin-generates"}

當 classpath 上有 Kotzilla SDK 時，編譯器外掛程式會重寫每個被監控函式的本體。`UserService` 類別中的 `findUser` 編譯時就如同你這樣撰寫：

```kotlin
fun findUser(id: String): User? =
    KotzillaCore.getDefaultInstance().trace("UserService.findUser") {
        userRepository.findById(id)
    }
```

規則：

- **標籤**：`ClassName.functionName`，若是頂層函式則為函式名稱。
- **Suspend 函式**：使用 `suspendTrace` 而非 `trace` 進行包裝。
- **類別層級的 `@Monitor`**：僅追蹤公用函式。Private、protected 與 internal 函式、建構函式以及預設屬性存取子皆不會被追蹤。
- **無需代理、無需 `allOpen`**：函式本體會原地重寫。類別保持為 final，且 Koin 會照常建立它。

在建置期間，外掛程式會回報每個被監控的類別：

```
@Monitor: UserService - tracing enabled (2 functions)
```

此訊息預設為警告。如果你的建置使用了 `allWarningsAsErrors`，請在 `koinCompiler { }` 區塊中設定 `logSeverity = "info"`：請參閱[編譯器外掛程式選項](/docs/reference/koin-annotations/options)。

## 搭配 Kotzilla SDK {id="with-the-kotzilla-sdk"}

`@Monitor` 需要兩次 Kotzilla SDK：

- **在建置時**：`io.kotzilla.sdk.KotzillaCore` 類別必須位於編譯 classpath 上。`io.kotzilla:kotzilla-sdk` 相依性透過 `io.kotzilla:kotzilla-core` 引入此類別。
- **在執行期**：SDK 必須在你的 Koin 配置中啟動，以便記錄並傳送追蹤。

兩者皆為[正式環境監控](/docs/tooling/production-monitoring)中所述標準 Kotzilla 設定的一部分。一旦 SDK 執行，對被監控函式的每次呼叫都會記錄其執行時間，且若擲出例外，則會記錄其錯誤。你可以在 Kotzilla 主控台中檢視它們。

:::warning
產生的程式碼會呼叫 `KotzillaCore.getDefaultInstance()`。請在應用程式啟動時啟動 Kotzilla SDK，必須在任何被監控函式執行之前。
:::

## 搭配 Koin Annotations (KSP) {id="with-koin-annotations-ksp"}

使用 KSP 處理器（`koin-ksp-compiler`，Koin Annotations 2.2.0 及更高版本）時，`@Monitor` 的運作方式有所不同。KSP 無法重寫函式本體，因此它會產生一個名為 `<ClassName>Proxy` 的子類別，以追蹤呼叫覆寫每個公用函式，且 Koin 定義會使用此代理。這會帶來兩個影響：

- **Open 類別**：被監控的類別必須是 open。請使用 `annotation("org.koin.core.annotation.Monitor")` 設定 `allOpen` Gradle 外掛程式。
- **僅限定義**：只有作為 Koin 定義的類別才會被代理。

編譯器外掛程式取代了這個機制。請參閱[從 KSP 遷移至編譯器外掛程式](/docs/migration/from-ksp-to-compiler-plugin)。

## 限制 {id="limits"}

- **無傳遞性追蹤**：僅追蹤帶有註解的類別或函式。注入至被監控類別中的相依性不會被追蹤，除非它們也帶有 `@Monitor`。
- **無本機資料**：沒有 Kotzilla SDK 就不會記錄任何內容。若要進行本機偵錯，請使用 [Koin 記錄器](/docs/reference/koin-core/starting-koin#logging)。
- **開銷**：每個被監控的呼叫都會經過追蹤呼叫。請為想要度量的函式加上註解，而非每個類別。

## 相關內容 {id="related"}

- [正式環境監控](/docs/tooling/production-monitoring)：設定記錄追蹤的 Kotzilla SDK。
- [正式環境與工具](/docs/tooling)：針對不同需求選擇相應工具。
- [啟動 Koin](/docs/reference/koin-core/starting-koin#logging)：用於本機偵錯的 Koin 記錄器。
- [編譯器外掛程式選項](/docs/reference/koin-annotations/options)：`logSeverity` 與其他外掛程式設定。
- [註解參考](/docs/reference/koin-annotations/annotations-inventory)：完整的 Koin 註解清單。