---
title: ViewModel
---

# ViewModel

本頁面介紹如何在每個支援 AndroidX ViewModel 的平台（Android、iOS、desktop、web）上，於 Koin 模組中宣告 ViewModel。本篇內容假設您已了解[定義 (definitions)](/docs/reference/koin-core/definitions)。若要檢索 ViewModel，請參閱各平台頁面：在 Activity 或 Fragment 中使用 `by viewModel()` 請參閱 [Android ViewModel](/docs/reference/koin-android/viewmodel)，使用 `koinViewModel()` 請參閱 [Compose 中的 ViewModel](/docs/reference/koin-compose/compose-viewmodel)。

## 相依性 {id="dependencies"}

宣告 DSL 位於多平台構件 `koin-core-viewmodel` 中：

```kotlin
// build.gradle.kts, commonMain
implementation("io.insert-koin:koin-core-viewmodel")
```

注入 API 則隨平台構件一起提供：`io.insert-koin:koin-android`（其中包含 `koin-core-viewmodel`）以及 `io.insert-koin:koin-compose-viewmodel`。版本來自 BOM：請參閱 [Gradle 設定](/docs/setup/gradle)。

## 宣告 ViewModel {id="declaring-a-viewmodel"}

**編譯器外掛程式 DSL**
```kotlin
import org.koin.dsl.module
import org.koin.plugin.module.dsl.viewModel

class UserViewModel(private val repository: UserRepository) : ViewModel()

val appModule = module {
    viewModel<UserViewModel>()
}
```

**註解**
```kotlin
import org.koin.core.annotation.KoinViewModel

@KoinViewModel
class UserViewModel(private val repository: UserRepository) : ViewModel()
```

搭配編譯器外掛程式使用時，`@KoinViewModel` 位於 `org.koin.core.annotation` 中，並可在共用程式碼中運作。KSP 處理器過去使用的是 `org.koin.android.annotation.KoinViewModel`。

**建構函式 / 傳統 DSL**
```kotlin
import org.koin.dsl.module
import org.koin.core.module.dsl.viewModelOf
import org.koin.core.module.dsl.viewModel

val appModule = module {
    viewModelOf(::UserViewModel)

    // 或者明確寫出建構函式呼叫
    viewModel { UserViewModel(get()) }
}
```

`viewModel` 定義在每次請求時都會建立一個新執行個體，類似於 `factory`。平台專屬的 `ViewModelStore`（Activity、Fragment、導覽項目）會保留該執行個體，因此同一個擁有者在 Android 進行組態變更時，仍會取回相同的 ViewModel。請勿將 ViewModel 宣告為 `single`：否則它會被每個畫面共用且永遠不會被清除。

## 傳遞參數 {id="passing-parameters"}

ViewModel 通常需要僅在執行時才知道的值，例如項目 ID。請將建構函式參數標記為注入參數：

**編譯器外掛程式 DSL**
```kotlin
class DetailViewModel(
    @InjectedParam val itemId: String,
    private val repository: DetailRepository,
) : ViewModel()

val appModule = module {
    viewModel<DetailViewModel>()
}
```

**註解**
```kotlin
@KoinViewModel
class DetailViewModel(
    @InjectedParam val itemId: String,
    private val repository: DetailRepository,
) : ViewModel()
```

**建構函式 / 傳統 DSL**
```kotlin
val appModule = module {
    viewModel { params ->
        DetailViewModel(itemId = params.get(), repository = get())
    }
}
```

`viewModelOf(::DetailViewModel)` 同樣適用：它會依型別從呼叫端傳遞的值中讀取參數。

無論使用哪種宣告樣式，呼叫端皆透過 `parametersOf` 傳遞值：

```kotlin
// Android
val viewModel: DetailViewModel by viewModel { parametersOf("item_123") }

// Compose
val viewModel = koinViewModel<DetailViewModel> { parametersOf("item_123") }
```

參數僅在建立 ViewModel 時讀取一次。若相同的擁有者使用不同的值再次請求，它仍會取得現有的執行個體。關於參數的更多資訊，請參閱[注入參數](/docs/reference/koin-core/injection-parameters)。

## SavedStateHandle {id="savedstatehandle"}

在建構函式中新增 `SavedStateHandle` 參數。Koin 會自動從 ViewModel 的 `CreationExtras` 建立它，無需額外宣告：

**編譯器外掛程式 DSL**
```kotlin
class ProfileViewModel(
    private val handle: SavedStateHandle,
    private val repository: UserRepository,
) : ViewModel() {
    val userId: String? = handle["userId"]
}

val appModule = module {
    viewModel<ProfileViewModel>()
}
```

**註解**
```kotlin
@KoinViewModel
class ProfileViewModel(
    private val handle: SavedStateHandle,
    private val repository: UserRepository,
) : ViewModel() {
    val userId: String? = handle["userId"]
}
```

**建構函式 / 傳統 DSL**
```kotlin
val appModule = module {
    viewModelOf(::ProfileViewModel)

    // 或者：由 get() 解析 SavedStateHandle
    viewModel { ProfileViewModel(get(), get()) }
}
```

在 Android 上，導覽引數與 Activity extras 都包含在 `SavedStateHandle` 中。請僅在建構函式中注入它。若 ViewModel 的擁有者沒有 `SavedStateRegistryOwner`，Koin 會失敗並顯示錯誤訊息："Koin could not create a SavedStateHandle: the ViewModel's CreationExtras has no SavedStateRegistryOwner."

## ViewModel 作用域 {id="viewmodel-scope"}

ViewModel 可以擁有一個[作用域](/docs/reference/koin-core/scopes)：相依性會與它一同建立，並在它被清除時釋放。請使用 `viewModelScope` 原型來宣告它們：

**編譯器外掛程式 DSL**
```kotlin
val appModule = module {
    viewModelScope {
        scoped<UserCache>()
        viewModel<UserViewModel>()
    }
}
```

**註解**
```kotlin
@ViewModelScope
class UserCache

@KoinViewModel
@ViewModelScope
class UserViewModel(private val cache: UserCache) : ViewModel()
```

**建構函式 / 傳統 DSL**
```kotlin
val appModule = module {
    viewModelScope {
        scopedOf(::UserCache)
        viewModelOf(::UserViewModel)
    }
}
```

請在啟動時啟用此選項，否則 ViewModel 將無法取得作用域：

```kotlin
startKoin {
    options(viewModelScopeFactory())
    modules(appModule)
}
```

`viewModelScope` 與 `viewModelScopeFactory()` 需要選擇加入（opt-in）`@KoinViewModelScopeApi` 與 `@KoinExperimentalAPI`。在其建構函式中接收作用域相依性的 ViewModel，必須在 `viewModelScope { }` 內部宣告。每個 ViewModel 執行個體都會獲得專屬的 `UserCache`，並在 ViewModel 清除時一併關閉。

## 限制 {id="limits"}

- **每個擁有者僅限一個執行個體**：一旦該擁有者已存在該 ViewModel，後續注入的參數將被忽略。請使用不同的金鑰或擁有者來取得第二個執行個體。
- **不可使用 `single` ViewModel**：單例 ViewModel 永遠不會被清除，並且會導致其相依性發生記憶體洩漏。
- **實驗性 ViewModel 作用域**：`viewModelScope` 被標記為實驗功能，未來可能會有所變更。

## 相關內容 {id="related"}

- [Android ViewModel](/docs/reference/koin-android/viewmodel)：`by viewModel()`、`activityViewModel()`、導覽圖 ViewModel。
- [Compose 中的 ViewModel](/docs/reference/koin-compose/compose-viewmodel)：`koinViewModel()` 與導覽 ViewModel。
- [注入參數](/docs/reference/koin-core/injection-parameters)：`parametersOf` 與 `@InjectedParam`。
- [作用域](/docs/reference/koin-core/scopes)：作用域原型與作用域生命週期。
- [定義](/docs/reference/koin-core/definitions)：其他定義類型。