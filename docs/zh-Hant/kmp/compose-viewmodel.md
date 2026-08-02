[//]: # (title: 多平台 ViewModel)

Android [ViewModel](https://developer.android.com/topic/libraries/architecture/viewmodel) 允許您將應用程式的商務邏輯與 UI 元件連接。
透過 Compose Multiplatform，您也可以在通用程式碼中使用 ViewModel。

此頁面將引導您在多平台專案中設定並使用 ViewModel：

* [設定相依性](#set-up-dependencies)。
* [在通用程式碼中使用 ViewModel](#using-viewmodel-in-common-code)。
* [將 ViewModel 限定在導覽目標的作用域內](#viewmodel-scoping-with-navigation-3)。
* [使用 Koin 或 Metro 注入相依性](#viewmodel-and-dependency-injection)。
* [選擇要共用多少 ViewModel 和 UI 程式碼](#levels-of-code-sharing)：
  從完全共用的方式到僅共用存儲庫或資料層。

## 設定相依性

若要跨平台共用 ViewModel 和 UI：

1. 在 Gradle 版本目錄檔案中定義相依性：

    ```toml
    [versions]
    androidx-viewmodel = "2.10.0"
    
    [libraries]
    androidx-lifecycle-viewmodel-compose = { module = "org.jetbrains.androidx.lifecycle:lifecycle-viewmodel-compose", version.ref = "androidx-viewmodel" }
    androidx-lifecycle-viewmodel-navigation3 = { module = "androidx.lifecycle:lifecycle-viewmodel-navigation3", version.ref = "androidx-viewmodel" }
    ``` 
   
    > 您可以在我們的[新功能](https://www.jetbrains.com/help/kotlin-multiplatform-dev/whats-new-compose.html)中追蹤多平台 ViewModel 實作的變更，
    > 或在 [Compose Multiplatform 變更記錄](https://github.com/JetBrains/compose-multiplatform/blob/master/CHANGELOG.md)中關注早期體驗計劃版本。
    >
    {style="tip"}
2. 在 KMP 模組的 `build.gradle.kts` 檔案中，將以下相依性新增至 `commonMain` 原始碼集：

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

> 相依性可能會根據您的程式碼共用方式而有所不同。詳情請參閱 [undefined](#levels-of-code-sharing)。
>
{style="note"}

如果您有桌面平台目標，請同時新增 `kotlinx-coroutines-swing` 相依性。
在 `ViewModel` 中執行協同程式時，`ViewModel.viewModelScope` 會與 `Dispatchers.Main.immediate` 繫結，
而後者在預設情況下可能無法在桌面平台上使用。Kotlinx Coroutines Swing 程式庫可讓 ViewModel 協同程式與 Compose Multiplatform 正常運作。
    
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

## 在通用程式碼中使用 ViewModel

Compose Multiplatform 提供了一個通用的 `ViewModelStoreOwner` 實作，因此在通用程式碼中使用 `ViewModel` 類別與 [Android 最佳實務](https://developer.android.com/topic/libraries/architecture/viewmodel#best-practices)並無太大差異。

然而，在非 JVM 平台上存在一個重要的差異，即無法使用型別反射來具現化物件。
您不能在通用程式碼中呼稱不含參數的 `viewModel()` 函式。
每次建立 `ViewModel` 執行個體時，您至少需要提供一個初始設定式作為引數。

如果僅提供初始設定式，Compose Multiplatform 會在底層建立預設工廠（類）。
但是，您可以實作自己的工廠（類）並呼叫更明確版本的通用 `viewModel()` 函式，就像[使用 Jetpack Compose](https://developer.android.com/topic/libraries/architecture/viewmodel#jetpack-compose) 一樣。

讓我們定義一個 ViewModel 並將其連接到可組合項：

1. 定義一個簡單的 `OrderViewModel` 類別來管理 UI 狀態，包括訂購項目的數量和價格：

   ```kotlin
   data class OrderUiState(val quantity: Int = 0, val price: String = "$0.00")

   class OrderViewModel : ViewModel() {
      val uiState: StateFlow<OrderUiState>
          field = MutableStateFlow(OrderUiState())

      fun setQuantity(n: Int) {
          uiState.update { it.copy(quantity = n, price = "${n * 2}.00") }
      }
   }
   ```

    > 此範例使用[明確支援欄位](https://kotlinlang.org/docs/properties.html#explicit-backing-fields)，
    > 該功能在 Kotlin 2.4.0 中已穩定。使用較早版本時，請新增
    > `-Xexplicit-backing-fields` 編譯器選項，或改用舊的支援欄位模式並配合 `.asStateFlow()`。
    >
    {style="note"}

2. 使用帶有初始設定式的通用 `viewModel()` 函式，將自訂 ViewModel 新增至您的可組合函式：

    ```kotlin
    import com.example.ui.OrderViewModel
    
    @Composable
    fun CupcakeApp(
       viewModel: OrderViewModel = viewModel { OrderViewModel() },
    ) {
       // ...
    }
    ```

## ViewModel 限定導覽 3 的作用域

在通用程式碼中將 ViewModel 與導覽 3 搭配使用時，
預設情況下 ViewModel 不會自動限定在導覽項目的作用域內。
如果沒有明確限定範圍，每個 ViewModel 都將繫結到 `Activity` 而非螢幕，
即使在使用者導覽離開後也是如此。

若要按導覽項目限定 ViewModel 作用域並儲存可儲存的 Compose 狀態，
請在定義導覽目標時將導覽 3 項目裝飾器傳遞給 `NavDisplay`：

```kotlin
import androidx.lifecycle.viewmodel.navigation3.rememberViewModelStoreNavEntryDecorator
import androidx.navigation3.runtime.rememberSaveableStateHolderNavEntryDecorator

//...

NavDisplay(
   entryDecorators = listOf(
       // 儲存每個項目的 Compose 狀態
       rememberSaveableStateHolderNavEntryDecorator(),
       // 限定每個項目的 ViewModel 作用域
       rememberViewModelStoreNavEntryDecorator()
   ),
   backStack = backStack,
   entryProvider = entryProvider { }
)
```

## ViewModel 與相依注入

相依注入 (DI) 架構允許您根據目前的環境或目標平台，將不同的相依性注入到組件中。
若要管理 ViewModel，您可以使用 Koin、Metro 或任何其他支援 Kotlin Multiplatform 的 DI 架構。

有關相依注入使用的進階範例，
請參閱[共用資料存取層](multiplatform-ktor-sqldelight.md)教學。

### Koin

Koin 是一個執行時 DI 架構，提供 DSL 或註解來配置您的相依性。
若要在 Compose ViewModel 中使用 Koin，請新增 `koin-compose-viewmodel` 相依性。

接著，您可以使用 `koinViewModel()` 將 ViewModel 注入可組合函式：

```kotlin
@Composable
fun CupcakeApp(
   viewModel: UserViewModel = koinViewModel()
) {
   // ...
}
```

詳情請參閱 Koin 關於 [ViewModel 支援](https://insert-koin.io/docs/reference/koin-core/viewmodel)
以及[在 Compose 中注入 ViewModel](https://insert-koin.io/docs/reference/koin-compose/compose-viewmodel) 的文件。

### Metro

Metro 是一個實作為 Kotlin 編譯器外掛程式的編譯期 DI 架構。
若要在 Compose ViewModel 中使用 Metro，請新增 `metrox-viewmodel-compose` 相依性。

接著，您可以使用 `metroViewModel()` 將 ViewModel 注入可組合函式：

```kotlin
@Composable
fun CupcakeApp(
   viewModel: UserViewModel = metroViewModel()
) {
   // ...
}
```

詳情請參閱 MetroX 關於 [ViewModel 整合](https://zacsweers.github.io/metro/latest/metrox-viewmodel/)
以及[在 Compose 中存取 ViewModel](https://zacsweers.github.io/metro/latest/metrox-viewmodel-compose/) 的文件。

## 程式碼共用層級

您可以選擇要共用程式碼的哪些部分，以及哪些部分保留為平台特定：

* 若要跨平台共用 UI 和商務邏輯，
  請參閱[共用邏輯與 UI 教學](compose-multiplatform-create-first-app.md)。
* 若要共用部分程式碼而不共用 UI 實作，
  請參閱[共用邏輯教學](multiplatform-create-first-app.md)。

以下範例展示了如何在不同程式碼共用層級下使用 ViewModel。
所有範例皆基於上述介紹的 `OrderViewModel` 類別。

### 共用 ViewModel 與 UI

在這種方式中，包括 `ViewModel` 和 UI 在內的所有內容都透過 Compose Multiplatform 共用。
您只需編寫一次應用程式的 UI 程式碼，它即可在所有平台上運作。

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

### 共用 ViewModel 與平台特定 UI

在這種方式中，`ViewModel`（商務邏輯）是共用的，但平台具有原生 UI 實作。
請在[為 Kotlin Multiplatform 設定 ViewModel](https://developer.android.com/kotlin/multiplatform/viewmodel) 中了解更多資訊。

由於在這種情況下 UI 不共用，您可以從 Compose Multiplatform 版本的 ViewModel 程式庫切換到 `androidx.lifecycle` 程式庫。

1. 在 Gradle 版本目錄中更新相依性：

    ```toml
    [versions]
    androidx-viewmodel = "2.10.0"
    
    [libraries]
    androidx-lifecycle-viewmodel = { module = "androidx.lifecycle:lifecycle-viewmodel", version.ref = "androidx-viewmodel" }
    ```

2. 在 `build.gradle.kts` 檔案中，將相依性宣告為 `api`，因為它需要匯出到二進位框架：

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

#### Android 實作

在 Android 上，Jetpack Compose 會自動尋找 `Activity` 提供的 `ViewModelStoreOwner` 並提供 `OrderViewModel`。

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

#### iOS 實作

在 iOS 上，沒有內建的 `ViewModelStoreOwner`，因此必須手動將 ViewModel 的生命週期與 SwiftUI 繫結。
我們建議使用 [KMP-ObservableViewModel](https://klibs.io/project/rickclephas/KMP-ObservableViewModel) 程式庫，
它可讓 SwiftUI 直接觀察 Kotlin Multiplatform ViewModel，並處理 iOS 所需的 ViewModel 生命週期／存儲庫擁有者（store-owner）樣板程式碼。

1. 匯出 ViewModel API 以供 Swift 存取：
    
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

2. 在 `commonMain` 中使用 KMP-ObservableViewModel 的 ViewModel 基底類別和 `@NativeCoroutinesState` 註解來定義您的 ViewModel：
    
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

### 共用存儲庫／資料層，平台特定 ViewModel 與 UI

另一個選項是僅共用資料與存儲庫層，同時使用平台特定的 ViewModel 實作。
這允許您在每個平台上使用原生模式，例如 Android 的 Hilt 相依注入，或 iOS 搭配 Combine 的 `ObservableObject`。

1. 建立一個包含資料邏輯的共用存儲庫類別：

    ```kotlin
    class OrderRepository {
       fun calculatePrice(quantity: Int) = "${quantity * 2}.00"
    }
    ```

2. 實作平台特定的 ViewModel。

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

3. 實作 platform-specific UI。

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

## 下一步

* 查看[完整範例](https://github.com/JetBrains/compose-multiplatform/tree/master/examples/nav_cupcake)。
* 請參閱[為 Kotlin Multiplatform 設定 ViewModel](https://developer.android.com/kotlin/multiplatform/viewmodel) 以獲取更多以 Android 為核心的指引。
* 了解在使用共用 ViewModel 與原生 UI 時，如何[將 Compose Multiplatform 與 SwiftUI 整合](compose-swiftui-integration.md)。