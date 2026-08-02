[//]: # (title: 多平台 ViewModel)

Android [ViewModel](https://developer.android.com/topic/libraries/architecture/viewmodel) 允许您将应用的业务逻辑与 UI 组件连接起来。
借助 Compose Multiplatform，您也可以在公共代码中使用 ViewModel。

本页将引导您在多平台项目中设置和使用 ViewModel：

* [设置依赖项](#set-up-dependencies)。
* [在公共代码中使用 ViewModel](#using-viewmodel-in-common-code)。
* [将 ViewModel 作用域限定为导航目的地](#viewmodel-scoping-with-navigation-3)。
* [使用 Koin 或 Metro 注入依赖项](#viewmodel-and-dependency-injection)。
* [选择要共享多少 ViewModel 和 UI 代码](#levels-of-code-sharing)：
  从全共享方式到仅共享存储库或数据层。

## 设置依赖项

要跨平台共享 ViewModel 和 UI：

1. 在 Gradle 版本编目文件中定义依赖项：

    ```toml
    [versions]
    androidx-viewmodel = "2.10.0"
    
    [libraries]
    androidx-lifecycle-viewmodel-compose = { module = "org.jetbrains.androidx.lifecycle:lifecycle-viewmodel-compose", version.ref = "androidx-viewmodel" }
    androidx-lifecycle-viewmodel-navigation3 = { module = "androidx.lifecycle:lifecycle-viewmodel-navigation3", version.ref = "androidx-viewmodel" }
    ``` 
   
    > 您可以在我们的[最新变化](https://www.jetbrains.com/help/kotlin-multiplatform-dev/whats-new-compose.html)中跟踪多平台 ViewModel 实现的更改，
    > 或在 [Compose Multiplatform 变更日志](https://github.com/JetBrains/compose-multiplatform/blob/master/CHANGELOG.md)中关注 EAP 版本。
    >
    {style="tip"}
2. 在 KMP 模块的 `build.gradle.kts` 文件中，将以下依赖项添加到 `commonMain` 源集中：

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

> 依赖项可能因您的代码共享方式而异。详情请参阅[代码共享级别](#levels-of-code-sharing)。
>
{style="note"}

如果您有桌面端目标，还请添加 `kotlinx-coroutines-swing` 依赖项。
在 `ViewModel` 中运行协程时，`ViewModel.viewModelScope` 绑定到 `Dispatchers.Main.immediate`，这在桌面端默认可能不可用。Kotlinx Coroutines Swing 库可让 ViewModel 协程在 Compose Multiplatform 中正常工作。
    
1. 在 Gradle 版本编目中：

    ```toml
    [versions]
    kotlinx-coroutines = "1.10.2"
    
    [libraries]
    kotlinx-coroutines-swing = { module = "org.jetbrains.kotlinx:kotlinx-coroutines-swing", version.ref = "kotlinx-coroutines" }
    ```

2. 在 `build.gradle.kts` 文件中：

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
     
    详情请参阅 [`Dispatchers.Main` 文档](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/-main.html)。

## 在公共代码中使用 ViewModel

Compose Multiplatform 提供了一个公共 `ViewModelStoreOwner` 实现，因此在公共代码中使用 `ViewModel` 类与 [Android 最佳做法](https://developer.android.com/topic/libraries/architecture/viewmodel#best-practices)并无太大差异。

然而，在非 JVM 平台上有一个重要区别，即这些平台不支持用于实例化对象的类型反射。在公共代码中，您不能调用不带形参的 `viewModel()` 函数。
每次创建 `ViewModel` 实例时，您至少需要提供一个初始值设定项作为实参。

如果只提供了初始值设定项，Compose Multiplatform 会在底层创建一个默认工厂。
但是，您可以实现自己的工厂并调用更显式的公共 `viewModel()` 函数版本，就像[使用 Jetpack Compose](https://developer.android.com/topic/libraries/architecture/viewmodel#jetpack-compose) 一样。

让我们定义一个 ViewModel 并将其连接到可组合项中：

1. 定义一个简单的 `OrderViewModel` 类来管理 UI 状态，包括所订购项目的数量和价格：

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

    > 此示例使用了在 Kotlin 2.4.0 中稳定化的[显式支持字段](https://kotlinlang.org/docs/properties.html#explicit-backing-fields)。使用早期版本时，请添加
    > `-Xexplicit-backing-fields` 编译器选项，或改用带有 `.asStateFlow()` 的旧版支持字段模式。
    >
    {style="note"}

2. 使用带有初始值设定项的公共 `viewModel()` 函数将自定义 ViewModel 添加到您的可组合函数：

    ```kotlin
    import com.example.ui.OrderViewModel
    
    @Composable
    fun CupcakeApp(
       viewModel: OrderViewModel = viewModel { OrderViewModel() },
    ) {
       // ...
    }
    ```

## 使用 Navigation 3 进行 ViewModel 作用域限定

在公共代码中将 ViewModel 与 Navigation 3 结合使用时，默认情况下 ViewModel 不会自动作用域限定到导航条目。
如果没有显式的作用域限定，每个 ViewModel 即使在用户导航离开后也将绑定到 `Activity` 而非屏幕。

要为每个导航条目限定 ViewModel 和可保存的 Compose 状态的作用域，请在定义导航目的地时将 Navigation 3 条目装饰器传递给 `NavDisplay`：

```kotlin
import androidx.lifecycle.viewmodel.navigation3.rememberViewModelStoreNavEntryDecorator
import androidx.navigation3.runtime.rememberSaveableStateHolderNavEntryDecorator

//...

NavDisplay(
   entryDecorators = listOf(
       // 为每个条目保存 Compose 状态
       rememberSaveableStateHolderNavEntryDecorator(),
       // 为每个条目限定 ViewModel 作用域
       rememberViewModelStoreNavEntryDecorator()
   ),
   backStack = backStack,
   entryProvider = entryProvider { }
)
```

## ViewModel 与依赖注入

依赖注入 (DI) 框架允许您根据当前环境或目标平台向组件中注入不同的依赖项。
要管理 ViewModel，您可以使用 Koin、Metro 或任何其他支持 Kotlin Multiplatform 的依赖注入框架。

有关依赖注入高级用法的示例，请参阅[共享数据访问层](multiplatform-ktor-sqldelight.md)教程。

### Koin

Koin 是一个运行时依赖注入框架，提供用于配置依赖项的 DSL 或注解。要在 Compose ViewModel 中使用 Koin，请添加 `koin-compose-viewmodel` 依赖项。

然后，您可以使用 `koinViewModel()` 将 ViewModel 注入到可组合函数中：

```kotlin
@Composable
fun CupcakeApp(
   viewModel: UserViewModel = koinViewModel()
) {
   // ...
}
```

详情请参阅 Koin 关于 [ViewModel 支持](https://insert-koin.io/docs/reference/koin-core/viewmodel)和[在 Compose 中注入 ViewModel](https://insert-koin.io/docs/reference/koin-compose/compose-viewmodel) 的文档。

### Metro

Metro 是一个作为 Kotlin 编译器插件实现的编译时依赖注入框架。要在 Compose ViewModel 中使用 Metro，请添加 `metrox-viewmodel-compose` 依赖项。

然后，您可以使用 `metroViewModel()` 将 ViewModel 注入到可组合函数中：

```kotlin
@Composable
fun CupcakeApp(
   viewModel: UserViewModel = metroViewModel()
) {
   // ...
}
```

详情请参阅 MetroX 关于 [ViewModel 集成](https://zacsweers.github.io/metro/latest/metrox-viewmodel/)和[在 Compose 中访问 ViewModel](https://zacsweers.github.io/metro/latest/metrox-viewmodel-compose/) 的文档。

## 代码共享级别

您可以选择要共享代码的哪些部分以及哪些部分保持平台特定：

* 要跨平台共享 UI 和业务逻辑，请参阅[共享逻辑和 UI 教程](compose-multiplatform-create-first-app.md)。
* 要共享部分代码而不共享 UI 实现，请参阅[共享逻辑教程](multiplatform-create-first-app.md)。

以下示例展示了如何在不同的代码共享级别使用 ViewModel。所有示例都基于上面介绍的 `OrderViewModel` 类。

### 共享 ViewModel 和 UI

在这种方法中，包括 `ViewModel` 和 UI 在内的所有内容都通过 Compose Multiplatform 进行共享。您只需编写一次应用的 UI 代码，它就可以在所有平台上运行。

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

### 共享 ViewModel 和平台特定 UI

在这种方法中，`ViewModel`（业务逻辑）是共享的，但各平台拥有原生的 UI 实现。在[为 Kotlin Multiplatform 设置 ViewModel](https://developer.android.com/kotlin/multiplatform/viewmodel) 中了解更多信息。

由于在这种情况下 UI 不被共享，您可以从 Compose Multiplatform 版本的 ViewModel 库切换到 `androidx.lifecycle` 库。

1. 更新 Gradle 版本编目中的依赖项：

    ```toml
    [versions]
    androidx-viewmodel = "2.10.0"
    
    [libraries]
    androidx-lifecycle-viewmodel = { module = "androidx.lifecycle:lifecycle-viewmodel", version.ref = "androidx-viewmodel" }
    ```

2. 在 `build.gradle.kts` 文件中，将依赖项声明为 `api`，因为需要将其导出到二进制框架：

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

#### Android 实现

在 Android 上，Jetpack Compose 会自动找到 `Activity` 提供的 `ViewModelStoreOwner` 并供应 `OrderViewModel`。

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

#### iOS 实现

在 iOS 上，没有内置的 `ViewModelStoreOwner`，因此必须手动将 ViewModel 的生命周期绑定到 SwiftUI。我们建议使用 [KMP-ObservableViewModel](https://klibs.io/project/rickclephas/KMP-ObservableViewModel) 库，它能让 SwiftUI 直接观察 Kotlin Multiplatform ViewModel，并处理 iOS 所需的 ViewModel 生命周期/store-owner 模板代码。

1. 导出 ViewModel API 以供从 Swift 访问：
    
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

2. 在 `commonMain` 中使用 KMP-ObservableViewModel 的 ViewModel 基类和 `@NativeCoroutinesState` 注解定义您的 ViewModel：
    
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
    
3. 在 iOS UI 入口点中使用 ViewModel：
    
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

### 共享存储库/数据层，平台特定的 ViewModel 和 UI

另一个选项是仅共享数据和存储库层，同时使用平台特定的 ViewModel 实现。这允许您在每个平台上使用原生模式，例如用于 Android 依赖注入的 Hilt，或用于 iOS 结合 Combine 的 `ObservableObject`。

1. 创建一个包含数据逻辑的共享存储库类：

    ```kotlin
    class OrderRepository {
       fun calculatePrice(quantity: Int) = "${quantity * 2}.00"
    }
    ```

2. 实现平台特定的 ViewModel。

   * 在 Android 上，使用标准的 Android ViewModel 并注入存储库：

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

   * 在 iOS 上，使用 `ObservableObject` 在 Swift 中原生实现 ViewModel：

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

3. 实现平台特定的 UI。

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

## 后续步骤

* 查看[完整示例](https://github.com/JetBrains/compose-multiplatform/tree/master/examples/nav_cupcake)。
* 参阅[为 Kotlin Multiplatform 设置 ViewModel](https://developer.android.com/kotlin/multiplatform/viewmodel) 获取更多以 Android 为中心的指导。
* 了解在原生 UI 中使用共享 ViewModel 时，如何[将 Compose Multiplatform 与 SwiftUI 集成](compose-swiftui-integration.md)。