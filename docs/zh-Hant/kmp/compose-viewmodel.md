[//]: # (title: 多平台 ViewModel)

Android [ViewModel](https://developer.android.com/topic/libraries/architecture/viewmodel) 允許你將應用程式的商業邏輯與 UI 元件連接起來。
透過 Compose Multiplatform，你也可以在通用程式碼中使用 ViewModel。

本頁面將引導你在多平台專案中設定和使用 ViewModel：

* [設定相依性](#set-up-dependencies)。
* [在通用程式碼中使用 ViewModel](#using-viewmodel-in-common-code)。
* [將 ViewModel 作用域限定至導覽目的地](#viewmodel-scoping-with-navigation-3)。
* [使用 Koin 或 Metro 注入相依性](#viewmodel-and-dependency-injection)。
* [選擇要共用多少 ViewModel 與 UI 程式碼](#levels-of-code-sharing)：從完全共用方法到僅共用存儲庫或資料層。

## 設定相依性 {id="set-up-dependencies"}

若要跨平台共用 ViewModel 與 UI：

1. 在 Gradle 版本目錄（version catalog）檔案中定義相依性：

    ```toml
    [versions]
    androidx-viewmodel = "2.10.0"
    
    [libraries]
    androidx-lifecycle-viewmodel-compose = { module = "org.jetbrains.androidx.lifecycle:lifecycle-viewmodel-compose", version.ref = "androidx-viewmodel" }
    androidx-lifecycle-viewmodel-navigation3 = { module = "androidx.lifecycle:lifecycle-viewmodel-navigation3", version.ref = "androidx-viewmodel" }
    ``` 
   
    > 你可以在我們的新功能頁面中[追蹤多平台 ViewModel 實作的變更](https://www.jetbrains.com/help/kotlin-multiplatform-dev/whats-new-compose.html)，
    > 或是關注 [Compose Multiplatform 變更記錄](https://github.com/JetBrains/compose-multiplatform/blob/master/CHANGELOG.md)中的 EAP 發行版本。
    >
    {style="tip"}
2. 在 KMP 模組的 `build.gradle.kts` 檔案中，將下列相依性新增至 `commonMain` 原始碼集：

    ```kotlin
    kotlin {
       // ...
       sourceSets {
           // ...
           commonMain.dependencies {
               implementation(libs.androidx.lifecycle.viewmodel.compose)
               implementation(libs.androidx.lifecycle.viewmodel.navigation3)
           }
           // ...
       }
    }
    ```
    {initial-collapse-state="collapsed" collapsible="true" collapsed-title="implementation(libs.androidx.lifecycle.viewmodel.compose)"}

> 相依性可能會依你的程式碼共用方式而有所不同。詳情請參閱[程式碼共用層次](#levels-of-code-sharing)。
>
{style="note"}

如果你有桌面目標，也請新增 `kotlinx-coroutines-swing` 相依性。
在 `ViewModel` 中執行協同程式時，`ViewModel.viewModelScope` 會繫結至 `Dispatchers.Main.immediate`，
而這在桌面上預設可能無法使用。Kotlinx Coroutines Swing 程式庫能讓 ViewModel 協同程式在 Compose Multiplatform 中正常運作。
    
1. 在 Gradle 版本目錄中：

    ```toml
    [versions]
    kotlinx-coroutines = "1.10.2"
    
    [libraries]
    kotlinx-coroutines-swing = { module = "org.jetbrains.kotlinx:kotlinx-coroutines-swing", version.ref = "kotlinx-coroutines" }
    ```

2. 在 `build.gradle.kts` 檔案中：

    ```kotlin
    kotlin {
       // ...
       sourceSets {
           // ...
           jvmMain.dependencies {
               implementation(libs.kotlinx.coroutines.swing)
           }
           // ...
       }
    }
    ```
    {initial-collapse-state="collapsed" collapsible="true" collapsed-title="implementation(libs.kotlinx.coroutines.swing)"}
     
    詳情請參閱 [`Dispatchers.Main` 文件](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/-main.html)。

## 在通用程式碼中使用 ViewModel {id="using-viewmodel-in-common-code"}

Compose Multiplatform 提供了通用的 `ViewModelStoreOwner` 實作，因此在通用程式碼中使用 `ViewModel` 類別與 [Android 最佳實務](https://developer.android.com/topic/libraries/architecture/viewmodel#best-practices)沒有太大差異。

然而，在非 JVM 平台上存在一個重要差異：該環境下無法透過型別反射來具現化物件。
你無法在通用程式碼中呼叫無參數的 `viewModel()` 函式。
每次建立 `ViewModel` 執行個體時，你都需要提供至少一個初始設定式作為引數。

如果只提供初始設定式，Compose Multiplatform 會在底層建立一個預設工廠。
不過，你也可以實作自己的工廠並呼叫更明確版本的通用 `viewModel()` 函式，
就像[在 Jetpack Compose 中一樣](https://developer.android.com/topic/libraries/architecture/viewmodel#jetpack-compose)。

讓我們定義一個 ViewModel 並將其連接至可組合函式：

1. 定義一個簡單的 `OrderViewModel` 類別來管理 UI 狀態，包括訂購項目的數量和價格：

   ```kotlin
   data class OrderUiState(val quantity: Int = 0, val price: String = "$0.00")

   class OrderViewModel : ViewModel() {
      val uiState: StateFlow<OrderUiState>
          field = MutableStateFlow(OrderUiState())

      fun setQuantity(n: Int) {
          uiState.update { it.copy(quantity = n, price = "$${n * 2}.00") }
      }
   }
   ```

    > 此範例使用了在 Kotlin 2.4.0 中穩定化的[明確支援欄位](https://kotlinlang.org/docs/properties.html#explicit-backing-fields)。
    > 使用較早版本時，請新增 `-Xexplicit-backing-fields` 編譯器選項，或者改用帶有 `.asStateFlow()` 的舊式支援欄位模式。
    >
    {style="note"}

2. 使用帶有初始設定式的通用 `viewModel()` 函式，將自訂 ViewModel 新增至你的可組合函式：

    ```kotlin
    import com.example.ui.OrderViewModel
    
    @Composable
    fun CupcakeApp(
       viewModel: OrderViewModel = viewModel { OrderViewModel() },
    ) {
       // ...
    }
    ```

## 搭配 Navigation 3 進行 ViewModel 作用域設定 {id="viewmodel-scoping-with-navigation-3"}

在通用程式碼中搭配 Navigation 3 使用 ViewModel 時，
ViewModel 預設不會自動將作用域限定至導覽項目（navigation entries）。
若沒有明確的作用域設定，即使使用者離開該畫面，
每個 ViewModel 也會繫結至 `Activity` 而非該畫面。

若要針對每個導覽項目設定 ViewModel 及可儲存的 Compose 狀態的作用域，
請在定義導覽目的地時將 Navigation 3 項目裝飾器（entry decorators）傳遞給 `NavDisplay`：

```kotlin
import androidx.lifecycle.viewmodel.navigation3.rememberViewModelStoreNavEntryDecorator
import androidx.navigation3.runtime.rememberSaveableStateHolderNavEntryDecorator

//...

NavDisplay(
   entryDecorators = listOf(
       // 儲存每個項目的 Compose 狀態
       rememberSaveableStateHolderNavEntryDecorator(),
       // 將 ViewModel 作用域限定於每個項目
       rememberViewModelStoreNavEntryDecorator()
   ),
   backStack = backStack,
   entryProvider = entryProvider { }
)
```

## ViewModel 與相依注入 {id="viewmodel-and-dependency-injection"}

相依注入（DI）架構允許你根據目前的環境或目標平台，
向元件注入不同的相依性。
若要管理 ViewModel，你可以使用 Koin、Metro 或任何其他支援 Kotlin Multiplatform 的 DI 架構。

如需相依注入進階使用範例，
請參閱[共用資料存取層](multiplatform-ktor-sqldelight.md)教學。

### Koin {id="koin"}

Koin 是一個執行時 DI 架構，提供 DSL 或註解來設定你的相依性。
若要在 Compose ViewModel 中使用 Koin，請新增 `koin-compose-viewmodel` 相依性。

接著，你可以使用 `koinViewModel()` 將 ViewModel 注入至可組合函式中：

```kotlin
@Composable
fun CupcakeApp(
   viewModel: UserViewModel = koinViewModel()
) {
   // ...
}
```

詳情請參閱有關 [ViewModel 支援](https://insert-koin.io/docs/reference/koin-core/viewmodel)
與[在 Compose 中注入 ViewModel](https://insert-koin.io/docs/reference/koin-compose/compose-viewmodel) 的 Koin 文件。

### Metro {id="metro"}

Metro 是一個以 Kotlin 編譯器外掛程式實作的編譯期 DI 架構。
若要在 Compose ViewModel 中使用 Metro，請新增 `metrox-viewmodel-compose` 相依性。

接著，你可以使用 `metroViewModel()` 將 ViewModel 注入至可組合函式中：

```kotlin
@Composable
fun CupcakeApp(
   viewModel: UserViewModel = metroViewModel()
) {
   // ...
}
```

詳情請參閱有關 [ViewModel 整合](https://zacsweers.github.io/metro/latest/metrox-viewmodel/)
與[在 Compose 中存取 ViewModel](https://zacsweers.github.io/metro/latest/metrox-viewmodel-compose/) 的 MetroX 文件。

## 程式碼共用層次 {id="levels-of-code-sharing"}

你可以選擇共用程式碼的哪些部分，並將哪些部分保留為平台特定：

* 若要在平台之間共用 UI 和商業邏輯，
  請參閱[共用邏輯與 UI 教學](compose-multiplatform-new-project.md)。
* 若要在不共用 UI 實作的情況下共用部分程式碼，
  請參閱[共用邏輯教學](multiplatform-upgrade-app.md)。

以下範例展示如何在不同的程式碼共用層次中使用 ViewModel。
所有範例均基於上述介紹的 `OrderViewModel` 類別。

### 共用 ViewModel 與 UI {id="shared-viewmodel-and-ui"}

在這種做法中，包括 `ViewModel` 和 UI 在內的所有內容都會透過 Compose Multiplatform 進行共用。
你只需編寫一次應用程式的 UI 程式碼，它就能在所有平台上運作。

```kotlin
@Composable
fun CupcakeApp(
   viewModel: OrderViewModel = viewModel { OrderViewModel() }
) {
   val uiState by viewModel.uiState.collectAsState()
    
   Column(modifier = Modifier.padding(16.dp)) {
       Text("Quantity: ${uiState.quantity}")
       Text("Price: ${uiState.price}")

       Button(onClick = { viewModel.setQuantity(6) }) {
           Text("Set Quantity to '6'")
       }
   }
}
```

### 共用 ViewModel 與平台專屬 UI {id="shared-viewmodel-and-platform-specific-ui"}

在這種做法中，`ViewModel`（商業邏輯）是共用的，但各平台具備原生 UI 實作。
進一步了解請參閱[為 Kotlin Multiplatform 設定 ViewModel](https://developer.android.com/kotlin/multiplatform/viewmodel)。

由於在這種情況下不共用 UI，你可以從 ViewModel 程式庫的 Compose Multiplatform 版本切換至 `androidx.lifecycle` 程式庫。

1. 更新 Gradle 版本目錄中的相依性：

    ```toml
    [versions]
    androidx-viewmodel = "2.10.0"
    
    [libraries]
    androidx-lifecycle-viewmodel = { module = "androidx.lifecycle:lifecycle-viewmodel", version.ref = "androidx-viewmodel" }
    ```

2. 在 `build.gradle.kts` 檔案中，將相依性宣告為 `api`，因為它需要匯出至二進制架構：

    ```kotlin
    kotlin {
       // ...
       sourceSets {
           // ...
           commonMain.dependencies {
               api(libs.androidx.lifecycle.viewmodel)
           }
           // ...
       }
    }
    ```
    {initial-collapse-state="collapsed" collapsible="true" collapsed-title="api(libs.androidx.lifecycle.viewmodel)"}

#### Android 實作 {id="android-implementation"}

在 Android 上，Jetpack Compose 會自動尋找由 `Activity` 提供的 `ViewModelStoreOwner` 並提供 `OrderViewModel`。

```kotlin
@Composable
fun AndroidCupcakeApp(
   viewModel: OrderViewModel = viewModel { OrderViewModel() }
) {
   val uiState by viewModel.uiState.collectAsState()

   Column {
       Text("Quantity: ${uiState.quantity}")
       Text("Price: ${uiState.price}")
       Button(onClick = { viewModel.setQuantity(6) }) {
           Text("Set Quantity to '6'")
       }
   }
}
```

#### iOS 實作 {id="ios-implementation"}

在 iOS 上沒有內建的 `ViewModelStoreOwner`，因此必須手動將 ViewModel 的生命週期繫結至 SwiftUI。
我們建議使用 [KMP-ObservableViewModel](https://klibs.io/project/rickclephas/KMP-ObservableViewModel) 程式庫，
它允許 SwiftUI 直接觀察 Kotlin Multiplatform ViewModel，並處理 iOS 所需的 ViewModel 生命週期／存放區擁有者樣板程式碼。

1. 匯出 ViewModel API 以便從 Swift 存取：
    
   ```kotlin
   listOf(
      iosArm64(),
      iosSimulatorArm64(),
   ).forEach {
      it.binaries.framework {
         export(libs.androidx.lifecycle.viewmodel)
         baseName = "shared"
      }
   }
   ```

2. 使用 KMP-ObservableViewModel 的 ViewModel 基底類別以及 `@NativeCoroutinesState` 註解，在 `commonMain` 中定義你的 ViewModel：
    
   ```kotlin
    import com.rickclephas.kmp.observableviewmodel.ViewModel
    import com.rickclephas.kmp.nativecoroutines.NativeCoroutinesState
    import kotlinx.coroutines.flow.MutableStateFlow
    import kotlinx.coroutines.flow.StateFlow
    import kotlinx.coroutines.flow.asStateFlow
     
    class OrderViewModel : ViewModel() {
        private val _uiState = MutableStateFlow(OrderUiState())

        @NativeCoroutinesState
        val uiState: StateFlow<OrderUiState> = _uiState.asStateFlow()

        fun setQuantity(n: Int) {
            _uiState.value = _uiState.value.copy(quantity = n)
        }
    }
   ```
    
3. 在 iOS UI 入口點中使用 ViewModel：
    
   ```swift
    import SwiftUI
    import shared
    import KMPObservableViewModelSwiftUI

    @main
    struct iOSCupcakeApp: App {
        var body: some Scene {
            WindowGroup {
                CupcakeView()
            }
        }
    }

    struct CupcakeView: View {
        @StateViewModel private var viewModel = OrderViewModel()

        var body: some View {
            VStack {
                Text("Quantity: \(viewModel.uiState.quantity)")
                Text("Price: \(viewModel.uiState.price)")

                Button("Set Quantity to '6'") {
                    viewModel.setQuantity(n: 6)
                }
            }
        }
    }
   ```

### 共用存儲庫／資料層，平台專屬 ViewModel 與 UI {id="shared-repo-data-layer-platform-specific-viewmodels-and-ui"}

另一種選擇是僅共用資料與存儲庫層，同時使用平台專屬的 ViewModel 實作。
這可讓你使用各平台的原生模式，例如在 Android 相依注入中使用 Hilt，
或在 iOS 中使用結合 Combine 的 `ObservableObject`。

1. 建立包含資料邏輯的共用存儲庫類別：

    ```kotlin
    class OrderRepository {
       fun calculatePrice(quantity: Int) = "$${quantity * 2}.00"
    }
    ```

2. 實作平台專屬的 ViewModel。

   * 在 Android 上，使用標準 Android ViewModel 並注入存儲庫：

       ```kotlin
       class AndroidOrderViewModel(
        private val repo: OrderRepository
       ) : ViewModel() {
    
         val uiState: StateFlow<OrderUiState>
            field = MutableStateFlow(OrderUiState())
    
         fun setQuantity(n: Int) {
            uiState.update {
               it.copy(quantity = n, price = repo.calculatePrice(n))
            }
         }
       }
       ```

   * 在 iOS 上，使用 `ObservableObject` 在 Swift 中原生實作 ViewModel：

       ```swift
       import shared
    
       class IOSOrderViewModel: ObservableObject {
          private let repo: OrderRepository
          @Published var uiState: OrderUiState = OrderUiState()
    
          init(repo: OrderRepository) {
              self.repo = repo
          }
    
          func setQuantity(n: Int32) {
              uiState = OrderUiState(quantity: n, price: repo.calculatePrice(quantity: n))
          }
       }
       ```

3. 實作平台專屬 UI。

   * 在 Android 上：

       ```kotlin
       @Composable
       fun AndroidCupcakeApp(
          viewModel: AndroidOrderViewModel = viewModel { AndroidOrderViewModel(OrderRepository()) }
       ) {
          val uiState by viewModel.uiState.collectAsState()
    
          Column {
              Text("Quantity: ${uiState.quantity}")
              Text("Price: ${uiState.price}")
              Button(onClick = { viewModel.setQuantity(6) }) {
                  Text("Set Quantity to '6'")
              }
          }
       }
       ```

   * 在 iOS 上：

       ```swift
       struct IOSCupcakeApp: App {
          @StateObject var viewModel = IOSOrderViewModel(repo: OrderRepository())
    
          var body: some View {
              VStack {
                  Text("Quantity: \(viewModel.uiState.quantity)")
                  Text("Price: \(viewModel.uiState.price)")
                  Button("Set Quantity to '6'") {
                      viewModel.setQuantity(n: 6)
                  }
              }
          }
       }
       ```

## 後續步驟 {id="what-s-next"}

* 查看[完整範例](https://github.com/JetBrains/compose-multiplatform/tree/master/examples/nav_cupcake)。
* 參閱[為 Kotlin Multiplatform 設定 ViewModel](https://developer.android.com/kotlin/multiplatform/viewmodel) 獲取更多針對 Android 的指引。
* 了解在原生 UI 中使用共用 ViewModel 時，如何[將 Compose Multiplatform 與 SwiftUI 整合](compose-swiftui-integration.md)。