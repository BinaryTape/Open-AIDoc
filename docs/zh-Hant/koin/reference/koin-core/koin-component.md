---
title: KoinComponent
---

# KoinComponent

`KoinComponent` 是一個介面，可讓類別存取 Koin 容器，以便呼叫 `get()` 和 `by inject()`。本頁面介紹何時需要它、如何使用它，以及為何建構函式注入（constructor injection）更受青睞。關於擷取函式本身，請參閱 [Injection](/docs/reference/koin-core/injection)。

## 何時使用 KoinComponent {id="when-to-use-koincomponent"}

當某個類別非由 Koin 建立，且本身沒有專屬的 Koin 擴充函式時，請使用 `KoinComponent`：

- 入口點：`main()` 類別、CLI 指令、由架構或反射所建立的類別。
- 未提供 Koin 擴充函式的 Android 類別：`BroadcastReceiver`、`ContentProvider`、自訂 `View`。請參閱 [Android Entry Points](/docs/reference/koin-android/entry-points)。
- 您無法控制其建構函式的回呼 (callback) 與接聽程式 (listener)。
- 尚未能遷移至建構函式注入的舊版程式碼。

在以下情況中，您不需要使用它：

- 模組中宣告的類別：repository、service、use case、ViewModel。Koin 會透過建構函式傳遞它們的相依性。
- `Activity`、`Fragment` 與 `Service`：Koin Android 直接為它們提供了 `by inject()` 和 `by viewModel()`。
- Composable：請使用 `koinInject()`，參閱 [Koin for Compose](/docs/reference/koin-compose/compose)。

## 使用 KoinComponent {id="use-koincomponent"}

實作該介面，然後呼叫 `get()` 或 `by inject()`：

```kotlin
import org.koin.core.component.KoinComponent
import org.koin.core.component.get
import org.koin.core.component.inject

class SyncCommand : KoinComponent {

    // 延遲載入：在首次存取時解析
    private val syncService: SyncService by inject()

    // 立即載入：在建立 SyncCommand 時解析
    private val logger: Logger = get()

    fun run() {
        logger.info("Starting sync")
        syncService.sync()
    }
}

fun main() {
    startKoin {
        modules(appModule)
    }
    SyncCommand().run()
}
```

無論使用哪種風格，程式碼都相同：`KoinComponent` 僅用於擷取執行個體，定義可以用任何風格宣告。

`get()` 和 `inject()` 是擴充函式：請從 `org.koin.core.component` 匯入它們。如同所有擷取函式一樣，它們接受限定詞與參數區塊（請參閱 [Injection](/docs/reference/koin-core/injection#qualifiers-and-parameters-at-the-call-site)）。

`KoinComponent` 本身只有一個函式 `getKoin()`，它會傳回 `Koin` 執行個體。其他所有操作都可以使用它：

```kotlin
class FeatureLoader : KoinComponent {

    fun optionalTracker(): Tracker? = getKoin().getOrNull()

    fun apiUrl(): String = getKoin().getProperty("server_url", "https://api.example.com")

    fun allPlugins(): List<Plugin> = getKoin().getAll()
}
```

可 null 擷取與 `getAll()` 在 [Injection](/docs/reference/koin-core/injection) 中有詳細介紹。屬性則在 [Starting Koin](/docs/reference/koin-core/starting-koin#properties) 中說明。

### 自訂 Android View {id="custom-android-view"}

自訂 `View` 是由 layout inflater 所建立，因此 Koin 無法傳遞建構函式參數。這正是 `KoinComponent` 的適用場景：

```kotlin
class ChartView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
) : View(context, attrs), KoinComponent {

    private val formatter: ChartFormatter by inject()

    fun setData(points: List<DataPoint>) {
        val formatted = formatter.format(points)
        // 繪製
    }
}
```

在 `View` 中請使用 `by inject()`：版面配置編輯器在建立 View 時並沒有正在執行的 Koin 容器，立即載入的 `get()` 在該處將會失敗。

## KoinComponent 使用哪一個容器 {id="which-container-koincomponent-uses"}

預設情況下，`getKoin()` 會傳回透過 `startKoin` 啟動的全域容器。如果尚未呼叫 `startKoin`，`get()` 將會擲出 `IllegalStateException` ("KoinApplication has not been started")。

執行自身獨立容器的程式庫或 SDK 可以覆寫 `getKoin()` 來傳回該容器：

```kotlin
object SdkKoinContext {
    val koinApp = koinApplication { modules(sdkModule) }
}

abstract class SdkComponent : KoinComponent {
    override fun getKoin(): Koin = SdkKoinContext.koinApp.koin
}

class SdkClient : SdkComponent() {
    private val api: SdkApi by inject() // 從 SDK 容器解析
}
```

完整的模式請參閱 [Context Isolation](/docs/reference/koin-core/context-isolation)。

對於擁有作用域的類別，請改為實作 `KoinScopeComponent`：如此一來 `get()` 和 `inject()` 便會從該作用域中解析。請參閱 [Scopes](/docs/reference/koin-core/scopes)。

## 為何建構函式注入更受青睞 {id="why-constructor-injection-is-preferred"}

比較同一個類別的兩種版本：

**Compiler Plugin DSL**
```kotlin
// 相依於 Koin，相依性隱藏在主體中
class UserService : KoinComponent {
    private val repository: UserRepository by inject()
}

// 純 Kotlin 類別，相依性在建構函式中一目了然
class UserService(private val repository: UserRepository)

val appModule = module {
    single<UserRepository>()
    single<UserService>()
}
```

**Annotations**
```kotlin
// 相依於 Koin，相依性隱藏在主體中
class UserService : KoinComponent {
    private val repository: UserRepository by inject()
}

// 純 Kotlin 類別，相依性在建構函式中一目了然
@Singleton
class UserService(private val repository: UserRepository)
```

**Constructor / Classic DSL**
```kotlin
// 相依於 Koin，相依性隱藏在主體中
class UserService : KoinComponent {
    private val repository: UserRepository by inject()
}

// 純 Kotlin 類別，相依性在建構函式中一目了然
class UserService(private val repository: UserRepository)

val appModule = module {
    singleOf(::UserRepository)
    singleOf(::UserService)
}
```

建構函式版本在以下四個方面更具優勢：

- 相依性清晰可見：建構函式列出了該類別所需的相依項目。而使用 `KoinComponent` 則必須閱讀類別主體。
- 無需 Koin 即可測試：您可以直接建立 `UserService(FakeUserRepository())`。而 `KoinComponent` 版本則需要一個執行中且包含虛擬定義的容器。
- 建置期檢查：編譯器外掛程式會根據相依圖驗證宣告類別的建構函式相依性。
- 無架構耦合：該類別在沒有 Koin 的情況下也能編譯並執行，這對共用程式碼和程式庫來說至關重要。

盡量將 `KoinComponent` 限制在邊界層。由單一入口點擷取頂層物件，其餘所有底層物件均使用建構函式注入：

```kotlin
class SyncCommand : KoinComponent {
    private val syncService: SyncService by inject()
}

class SyncService(private val repository: UserRepository, private val api: ApiClient)
class UserRepository(private val database: Database)
```

## 測試 KoinComponent {id="testing-a-koincomponent"}

實作 `KoinComponent` 的類別會從全域容器中讀取，因此測試必須在開始前啟動含有必要定義的 Koin，並在結束後停止它：

```kotlin
class SyncCommandTest : KoinTest {

    @get:Rule
    val koinTestRule = KoinTestRule.create {
        modules(module {
            single<SyncService> { FakeSyncService() }
            single<Logger> { TestLogger() }
        })
    }

    @Test
    fun `run calls sync`() {
        SyncCommand().run()
        // 對 FakeSyncService 進行斷言驗證
    }
}
```

`KoinTestRule` 會在每次測試前啟動 Koin，並在測試後停止它。規則、模擬 (mocking) 與模組驗證請參閱 [Testing](/docs/reference/koin-test/testing)。

## 相關主題 {id="related"}

- [Injection](/docs/reference/koin-core/injection)：`get()`、`inject()`、可 null 擷取以及 `getAll()`。
- [Android Entry Points](/docs/reference/koin-android/entry-points)：哪些 Android 類別需要 `KoinComponent`，哪些不需要。
- [Context Isolation](/docs/reference/koin-core/context-isolation)：將 `KoinComponent` 指向獨立容器。
- [Scopes](/docs/reference/koin-core/scopes)：適用於擁有作用域之類別的 `KoinScopeComponent`。
- [Testing](/docs/reference/koin-test/testing)：測試使用 Koin 的類別。