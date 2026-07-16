---
title: 為什麼選擇 Koin？
---

Koin 為任何 Kotlin 應用程式（多平台、Android、後端等）提供了一種簡單且高效的方式來整合相依注入。

## Koin 的目標

Koin 的目標是：
- 使用高效智能 API **簡化**您的相依注入基礎結構
- 提供易於閱讀、易於使用的 **Kotlin DSL**，讓您可以編寫任何類型的應用程式
- **生態系統整合** - 提供從 Android 生態系統到 Ktor 等更多後端需求的各類整合
- **靈活性** - 允許配合或不配合註解使用

---

## Koin 簡介

### 讓您的 Kotlin 開發變得輕鬆且高效

Koin 是一款高效智能的 Kotlin 相依注入庫，讓您專注於應用程式本身，而非工具。

```kotlin
class MyRepository()
class MyPresenter(val repository : MyRepository)

// just declare it
val myModule = module {
  singleOf(::MyPresenter)
  singleOf(::MyRepository)
}
```

Koin 為您提供簡單的工具和 API，讓您可以在應用程式中建置、組裝 Kotlin 相關技術，並輕鬆擴展您的業務。

```kotlin
fun main() {

  // Just start Koin
  startKoin {
    modules(myModule)
  }
}
```

---

## 平台支援

### 準備好支援 Android

憑藉 Kotlin 語言，Koin 擴充了 Android 平台，並作為原始平台的一部分提供新功能。

```kotlin
class MyApplication : Application() {
  override fun onCreate() {
    super.onCreate()

    startKoin {
      androidLogger()
      androidContext(this@MyApplication)
      modules(myModule)
    }
  }
}
```

Koin 提供簡單且強大的 API，只需使用 `by inject()` 或 `by viewModel()`，即可在 Android 組件中的任何位置檢索您的相依項。

```kotlin
class MyActivity : AppCompatActivity() {

  val myPresenter : MyPresenter by inject()

}
```

:::info
**了解更多**：[在 Android 上啟動 Koin](/docs/reference/koin-android/start)
:::

### 助力 Kotlin 多平台

在行動平台之間共用程式碼是 Kotlin 多平台的主要使用案例之一。透過 Kotlin Multiplatform Mobile，您可以建置跨平台行動應用程式，並在 Android 和 iOS 之間共用通用程式碼。

Koin 提供多平台相依注入，協助您在原生行動應用程式以及 Web／後端應用程式中建置組件。

:::info
**了解更多**：[搭配 Koin 使用 Kotlin 多平台](/docs/reference/koin-mp/kmp)
:::

### 效能與生產力

Koin 是一個純 Kotlin 架構，旨在實現簡單直接的使用與執行。它易於使用，且不會影響您的編譯時間，也不需要任何額外的外掛程式配置。

---

## Koin：一個相依注入架構

Koin 是一個熱門的 Kotlin 相依注入 (DI) 架構，為管理應用程式的相依項提供現代化且輕量級的解決方案，且只需極少的樣板程式碼。

### 相依注入 vs. 服務定位器

雖然 Koin 看起來可能與服務定位器模式相似，但兩者之間存在關鍵差異：

| 方面 | 服務定位器 | 相依注入 (Koin) |
|--------|----------------|----------------------------|
| **註冊表** | 靜態、全域註冊表 | 模組化、具作用域的容器 |
| **存取** | 明確請求服務 | 自動傳遞相依項 |
| **可測試性** | 較難模擬／測試 | 易於替換相依項 |
| **耦合** | 與架構耦合較緊密 | 耦合較鬆散、明確的相依項 |
| **最佳實務** | 不建議在現代應用程式中使用 | 業界標準模式 |

:::note
**服務定位器**：服務定位器本質上是可用服務的註冊表，您可以根據需要向其請求服務執行個體。它負責建立和管理這些執行個體，通常使用靜態的全域註冊表。

**相依注入**：相比之下，Koin 是一個純粹的相依注入架構。使用 Koin 時，您在模組中宣告相依項，並由 Koin 處理物件的建立與串接。它允許建立具有各自作用域的多個獨立模組，使相依項管理更具模組化，並避免潛在的衝突。
:::

### Koin 的方法：靈活性與最佳實務的結合

Koin 同時支援 DI 和服務定位器模式，為開發人員提供靈活性。然而，它**強烈鼓勵使用 DI**，特別是**建構函式注入**，即相依項作為建構函式參數傳遞。這種方法能提升可測試性，並使您的程式碼更容易理解。

```kotlin
// ✅ 建議：建構函式注入
class UserViewModel(
    private val repository: UserRepository,
    private val analytics: Analytics
) : ViewModel() {
    // 相依項明確且可測試
}

// ⚠️ 允許但不建議：服務定位器模式
class UserViewModel : ViewModel(), KoinComponent {
    private val repository: UserRepository by inject()
    private val analytics: Analytics by inject()
    // 相依項被隱藏
}
```

Koin 的設計理念以**簡單和易於設定**為中心，同時在需要時允許複雜的配置。透過使用 Koin，開發人員可以有效地管理相依項，而在大多數場景下，DI 是推薦且首選的方法。

:::info
**了解更多**：請參閱[相依注入基礎知識](/docs/setup/why)以獲取 DI 概念的完整指南。
:::

---

## 透明度與設計概覽

Koin 旨在成為一個多功能的控制反轉 (IoC) 容器，支援相依注入 (DI) 和服務定位器 (SL) 模式。為了讓您清楚了解 Koin 的運作方式並引導您有效地使用它，讓我們探討以下面向：

### Koin 如何平衡 DI 與 SL

Koin 結合了 DI 和 SL 的元素，這可能會影響您使用該架構的方式：

1. **全域上下文使用：** 預設情況下，Koin 提供一個可全域存取的組件，其行為類似於服務定位器。這讓您可以使用 `KoinComponent` 或 `inject` 函式從中央註冊表檢索相依項。

2. **隔離組件：** 雖然 Koin 鼓勵使用相依注入（特別是建構函式注入），但也允許使用隔離組件。這種靈活性意味著您可以在最合適的地方配置應用程式使用 DI，同時在特定情況下仍能利用 SL 的優勢。

3. **Android 組件中的 SL：** 在 Android 開發中，Koin 經常在 `Application` 和 `Activity` 等組件內部使用 SL 以簡化設定。從這一點出發，Koin 建議使用 DI（特別是建構函式注入）以更結構化的方式管理相依項。然而，這並非強制要求，開發人員可以根據需要靈活地使用 SL。

### 為什麼這對您很重要

了解 DI 與 SL 之間的區別有助於有效地管理應用程式的相依項：

**相依注入（建議）：**
- ✅ 更好的可測試性
- ✅ 明確的相依項
- ✅ 更清晰的程式碼結構
- ✅ 業界最佳實務

**服務定位器：**
- ⚠️ 便於設定
- ⚠️ 可能導致耦合過緊
- ⚠️ 隱藏的相依項
- ⚠️ 較難測試

:::warning
雖然 Koin 為了方便而支援 SL（特別是在 Android 組件中），但**過度依賴 SL 可能導致耦合過緊並降低可測試性**。Koin 的設計提供了一種平衡的方法，允許您在實用的地方使用 SL，但將 **DI 作為最佳實務進行推廣**。
:::

---

## 充分利用 Koin

若要有效率地使用 Koin：

### 1. 遵循最佳實務

盡可能使用**建構函式注入**，以符合相依項管理的最佳實務。這種方法可以提高可測試性和可維護性。

```kotlin
// ✅ 良好
class UserService(private val api: UserApi, private val db: UserDatabase)

module {
    singleOf(::UserService)
}

// ❌ 應避免
class UserService : KoinComponent {
    private val api: UserApi by inject()
    private val db: UserDatabase by inject()
}
```

### 2. 利用 Koin 的靈活性

在能簡化設定的場景中使用 Koin 對 SL 的支援，但目標應是依靠 DI 來管理核心應用程式相依項。

### 3. 參考文件與範例

查閱 Koin 的文件與範例，了解如何根據您的專案需求適當地配置和使用 DI 與 SL。

### 4. 明智地使用作用域

Koin 的作用域功能允許您為應用程式的特定部分隔離相依項：

```kotlin
module {
    scope<MyActivity> {
        scoped { MyActivityDependency() }
    }
}
```

:::info
**了解更多**：請參閱[作用域](/docs/reference/koin-core/scopes)以了解詳細的作用域模式。
:::

---

## 後續步驟

準備好開始了嗎？請選擇您的平台：

### 安裝指南
- [Koin 安裝](/docs/setup/koin) - 適用於所有平台的 Gradle 配置
- [Koin 註解安裝](/docs/setup/annotations) - 適用於基於註解之 DI 的 KSP 設定

### 快速入門教學
- [Android 與 ViewModel](/docs/quickstart/android-viewmodel) - 開始使用 Koin 建置 Android 應用程式
- [Jetpack Compose](/docs/quickstart/android-compose) - Koin 搭配 Compose UI
- [Kotlin 多平台](/docs/reference/koin-mp/kmp) - 跨平台共用程式碼
- [Ktor 後端](/docs/quickstart/ktor) - 建置伺服器端應用程式

### 核心概念
- [相依注入基礎知識](/docs/setup/why) - DI 的基本概念
- [核心功能](/docs/reference/koin-core/dsl) - Koin DSL 與模組系統
- [Android 整合](/docs/reference/koin-android/start) - Android 特有功能

---

> 透過提供這些指引，我們旨在幫助您有效地掌握 Koin 的功能和設計選擇，確保您在遵循相依項管理最佳實務的同時，能充分發揮其潛力。