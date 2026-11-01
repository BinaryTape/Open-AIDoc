---
title: 上下文隔離
---

# 上下文隔離

隔離的上下文（isolated context）是一個未註冊在全域上下文中的 Koin 容器。本頁面展示如何為 SDK 或程式庫建立隔離上下文、如何讓你的類別從中解析相依性，以及如何進行測試。本文假設你已知悉[如何啟動 Koin](/docs/reference/koin-core/starting-koin)。

## 為什麼需要隔離 {id="why-isolate"}

`startKoin` 會在全域上下文（`GlobalContext`）中註冊一個容器。所有的 `KoinComponent` 與 `by inject()` 都會從中讀取，而第二次呼叫 `startKoin` 則會失敗並擲出 `KoinApplicationAlreadyStartedException`。

如果你的程式庫呼叫了 `startKoin`，它就會與宿主應用程式競爭該單一插槽，且其定義可能會覆寫應用程式的定義。程式庫應改用 `koinApplication` 建立自己的容器並將其保持為私有。

## 建立隔離的上下文 {id="creating-an-isolated-context"}

`koinApplication` 使用與 `startKoin` 相同的 DSL 建構容器，但不會將其註冊至全域。請將它保存在 SDK 的一個物件中：

**Compiler Plugin DSL**
```kotlin
import org.koin.dsl.koinApplication
import org.koin.dsl.module
import org.koin.plugin.module.dsl.*

internal val sdkModule = module {
    single<SdkRepository>()
    single<SdkService>()
}

internal object SdkKoinContext {
    val koinApp = koinApplication {
        modules(sdkModule)
    }
    val koin = koinApp.koin
}
```

**Annotations**
```kotlin
import org.koin.plugin.module.dsl.koinApplication

@Module
@ComponentScan("com.example.sdk")
internal class SdkModule

@KoinApplication(modules = [SdkModule::class])
internal object SdkApplication

internal object SdkKoinContext {
    val koinApp = koinApplication<SdkApplication>()
    val koin = koinApp.koin
}
```

`koinApplication<T>()` 會載入 `@KoinApplication` 類別的模組，類似於 `startKoin<T>()`，但不會將容器註冊至全域。請明確列出 SDK 模組，這樣 SDK 容器就不會拾取到來自宿主應用程式的 `@Configuration` 模組。

**Constructor / Classic DSL**
```kotlin
import org.koin.dsl.koinApplication
import org.koin.dsl.module
import org.koin.core.module.dsl.*

internal val sdkModule = module {
    singleOf(::SdkRepository)
    singleOf(::SdkService)
}

internal object SdkKoinContext {
    val koinApp = koinApplication {
        modules(sdkModule)
    }
    val koin = koinApp.koin
}
```

該 `object` 會在首次存取時建立容器。若要控制其啟動與停止的時機（在 SDK API 中的 `init()` 與 `shutdown()`），請在函式中建立它，並在關閉時呼叫 `koinApp.close()`。

## 從隔離的上下文中解析 {id="resolving-from-the-isolated-context"}

`KoinComponent` 預設從全域上下文中讀取。在 internal 介面中覆寫 `getKoin()`，並在你的 SDK 類別中使用該介面：

```kotlin
internal interface SdkKoinComponent : KoinComponent {
    override fun getKoin(): Koin = SdkKoinContext.koin
}

class SdkClient : SdkKoinComponent {
    // 從 SdkKoinContext 解析，絕不從宿主應用程式解析
    private val service: SdkService by inject()
}
```

由 Koin 建立的類別會透過建構函式從建立它們的容器中取得其相依性。只有 SDK 的入口點（宿主應用程式具現化的類別）才需要實作 `SdkKoinComponent`。

## 測試 {id="testing"}

在測試中，將 `getKoin()` 指向隔離的上下文，並將測試模組載入其中：

```kotlin
class SdkClientTest : KoinTest {

    private val testModule = module {
        single<SdkService> { FakeSdkService() }
    }

    override fun getKoin(): Koin = SdkKoinContext.koin

    @Before
    fun setUp() {
        getKoin().loadModules(listOf(testModule))
    }

    @After
    fun tearDown() {
        getKoin().unloadModules(listOf(testModule))
    }
}
```

`testModule` 會在 `sdkModule` 之後載入，因此其 `SdkService` 會覆寫實際的服務。更多關於測試的資訊請參閱[測試](/docs/reference/koin-test/testing)。

## 平台支援 {id="platform-support"}

Compose 與 Ktor 擁有各自的 API 來使用隔離的上下文：

- **Compose**：`KoinIsolatedContext` 為 composable 樹提供隔離的容器。請參閱 [Compose 中的隔離上下文](/docs/reference/koin-compose/isolated-context)。
- **Ktor**：`KoinIsolated` 外掛程式使用自己的容器執行伺服器。請參閱 [Ktor 中的隔離上下文](/docs/reference/koin-ktor/ktor-isolated)。

## 限制 {id="limits"}

- **無全域輔助函式**：使用全域上下文的頂層函式，例如 `GlobalContext.get()`、`KoinPlatform.getKoin()` 或 Activity 中預設的 Android `by inject()`，無法看到隔離的容器。請改用你的 `SdkKoinComponent`。
- **生命週期由你掌控**：Koin 不會關閉隔離的上下文。請在 SDK 關閉時呼叫 `koinApp.close()`。
- **預設不共享**：隔離的容器看不到宿主應用程式的定義。請透過你的 SDK API（例如在 `init(context)` 中）傳遞宿主所需的內容。

## 相關內容 {id="related"}

- [啟動 Koin](/docs/reference/koin-core/starting-koin)：`startKoin`、`koinApplication` 與應用程式 DSL。
- [Koin 組件](/docs/reference/koin-core/koin-component)：`KoinComponent` 與 `getKoin()`。
- [Compose 中的隔離上下文](/docs/reference/koin-compose/isolated-context)：`KoinIsolatedContext`。
- [Ktor 中的隔離上下文](/docs/reference/koin-ktor/ktor-isolated)：`KoinIsolated` 外掛程式。
- [測試](/docs/reference/koin-test/testing)：`KoinTest` 與測試模組。