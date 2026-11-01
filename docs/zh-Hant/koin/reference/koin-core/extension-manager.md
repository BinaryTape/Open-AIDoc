---
title: 擴充管理器
---

# 擴充管理器

Koin 為程式庫與架構作者提供了兩個擴充點。`KoinExtension` 會將功能附加至 Koin 容器，並在註冊與關閉時提供掛鉤 (hook)。當沒有相符的定義時，`ResolutionExtension` 則為 Koin 提供另一個執行個體來源。大多數應用程式永遠不需要這兩者：請優先使用[定義](/docs/reference/koin-core/definitions)。

## KoinExtension {id="koinextension"}

`KoinExtension` 是一個以 ID 註冊於容器中的物件：

```kotlin
interface KoinExtension {
    fun onRegister(koin: Koin)
    fun onClose()
}
```

當您註冊擴充套件時，Koin 會呼叫 `onRegister`；當容器關閉時（`stopKoin()` 或 `koinApplication.close()`），則會呼叫 `onClose`。

Koin 本身也使用了此機制：[延遲模組](/docs/reference/koin-core/lazy-modules)背後的協同程式引擎即是 `KoinCoroutinesEngine` 擴充套件。

### 撰寫擴充套件 {id="writing-an-extension"}

```kotlin
class AuditExtension : KoinExtension {
    private lateinit var koin: Koin

    override fun onRegister(koin: Koin) {
        this.koin = koin
    }

    override fun onClose() {
        // release resources
    }

    fun record(event: String) { ... }
}
```

### 註冊與讀取擴充套件 {id="registering-and-reading-it"}

在 `KoinApplication` 上公開一個函式以註冊擴充套件，並在 `Koin` 上公開一個屬性以重新讀取它：

```kotlin
private const val AUDIT_EXTENSION = "audit"

fun KoinApplication.audit() {
    with(koin.extensionManager) {
        if (getExtensionOrNull<AuditExtension>(AUDIT_EXTENSION) == null) {
            registerExtension(AUDIT_EXTENSION, AuditExtension())
        }
    }
}

val Koin.audit: AuditExtension
    get() = extensionManager.getExtension(AUDIT_EXTENSION)
```

```kotlin
startKoin {
    audit()
    modules(appModule)
}

getKoin().audit.record("app_started")
```

| 函式 | 行為 |
|----------|----------|
| `registerExtension(id, extension)` | 儲存擴充套件並呼叫 `onRegister`。具有相同 ID 的擴充套件會被取代 |
| `getExtension<T>(id)` | 傳回該擴充套件。若不存在，則失敗並顯示「Koin extension 'id' not found.」 |
| `getExtensionOrNull<T>(id)` | 傳回該擴充套件，或 `null` |

:::warning
`ExtensionManager` 已標記為 `@KoinInternalApi`：您需要明確宣告選擇加入 (opt in)，且此 API 可能在版本之間變更而不會經歷棄用週期。
:::

## ResolutionExtension {id="resolutionextension"}

當沒有其他相符項目時，系統會向 `ResolutionExtension` 請求執行個體：順序排在目前作用域、作用域來源以及連結的作用域（包含根作用域）的定義之後。

```kotlin
interface ResolutionExtension {
    val name: String
    fun resolve(scope: Scope, instanceContext: ResolutionContext): Any?
}
```

傳回 `instanceContext.clazz`（若您使用限定詞，則包含 `instanceContext.qualifier`）所對應的執行個體，或傳回 `null` 讓 Koin 繼續執行並以 `NoDefinitionFoundException` 失敗。

Koin 在 [Ktor DI 橋接](/docs/reference/koin-ktor/ktor-bridge)中使用此機制從 Ktor 的相依注入中讀取執行個體。

### 範例：來自另一個容器的執行個體 {id="example-instances-from-another-container"}

```kotlin
class LegacyContainerResolution(
    private val legacy: Map<KClass<*>, Any>,
) : ResolutionExtension {

    override val name: String = "legacy-container"

    override fun resolve(scope: Scope, instanceContext: ResolutionContext): Any? =
        legacy[instanceContext.clazz]
}
```

使用 `addResolutionExtension` 在應用程式的 `koin` 上註冊它：

```kotlin
@OptIn(KoinExperimentalAPI::class)
fun startApp(legacy: Map<KClass<*>, Any>) {
    startKoin {
        koin.addResolutionExtension(LegacyContainerResolution(legacy))
        modules(appModule)
    }
}
```

現在，`appModule` 中若有定義需要僅存在於舊版 Map 中的型別，就可以從擴充套件中取得該型別。

搭配編譯器外掛程式時，僅由擴充套件提供的型別在建置時期是未知的，因此編譯期安全性會將其回報為缺失。請將其標記為已提供：請參閱[編譯期安全性](/docs/reference/koin-compiler/compile-safety)。

`addResolutionExtension` 已標記為 `@KoinExperimentalAPI`。

## 限制 {id="limits"}

- **內部與實驗性 API**：這兩個擴充點都可能在 Koin 版本之間變更。
- **解析擴充套件無生命週期**：Koin 不會快取 `ResolutionExtension` 傳回的執行個體。如有需要，請自行快取。
- **最後順位**：當有定義相符時，絕不會向解析擴充套件發出請求。它無法覆寫定義。
- **執行緒安全**：`resolve` 可能會同時從多個執行緒被呼叫。

## 相關內容 {id="related"}

- [延遲模組](/docs/reference/koin-core/lazy-modules)：建置在協同程式引擎擴充套件之上的功能。
- [Ktor DI 橋接](/docs/reference/koin-ktor/ktor-bridge)：解析擴充套件的實際應用。
- [編譯期安全性](/docs/reference/koin-compiler/compile-safety)：宣告在 Koin 外部提供的相依性。
- [啟動 Koin](/docs/reference/koin-core/starting-koin)：註冊擴充套件所在的應用程式 DSL。
- [作用域](/docs/reference/koin-core/scopes)：作用域內部的解析順序。