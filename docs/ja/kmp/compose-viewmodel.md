[//]: # (title: マルチプラットフォーム ViewModel)

Android の [ViewModel](https://developer.android.com/topic/libraries/architecture/viewmodel) を使用すると、アプリのビジネスロジックを UI コンポーネントに接続できます。
Compose Multiplatform を使用すれば、共通コードでも ViewModel を利用できます。

このページでは、マルチプラットフォームプロジェクトで ViewModel をセットアップして利用する方法について説明します。

* [依存関係のセットアップ](#set-up-dependencies)
* [共通コードでの ViewModel の使用](#using-viewmodel-in-common-code)
* [Navigation 3 による ViewModel のスコープ設定](#viewmodel-scoping-with-navigation-3)
* [Koin または Metro による依存性注入](#viewmodel-and-dependency-injection)
* [ViewModel と UI コードをどの程度共有するかの選択](#levels-of-code-sharing):
  完全に共有するアプローチから、リポジトリまたはデータレイヤーのみを共有するアプローチまで。

## 依存関係のセットアップ {id="set-up-dependencies"}

プラットフォーム間で ViewModel と UI を共有するには：

1. Gradle バージョンカタログファイルで依存関係を定義します。

    ```toml
    [versions]
    androidx-viewmodel = "2.10.0"
    
    [libraries]
    androidx-lifecycle-viewmodel-compose = { module = "org.jetbrains.androidx.lifecycle:lifecycle-viewmodel-compose", version.ref = "androidx-viewmodel" }
    androidx-lifecycle-viewmodel-navigation3 = { module = "androidx.lifecycle:lifecycle-viewmodel-navigation3", version.ref = "androidx-viewmodel" }
    ``` 
   
    > マルチプラットフォーム ViewModel 実装の変更点は、[新機能](https://www.jetbrains.com/help/kotlin-multiplatform-dev/whats-new-compose.html) で確認するか、[Compose Multiplatform の変更ログ](https://github.com/JetBrains/compose-multiplatform/blob/master/CHANGELOG.md) で EAP リリースをフォローしてください。
    >
    {style="tip"}
2. KMP モジュールの `build.gradle.kts` ファイルで、`commonMain` ソースセットに以下の依存関係を追加します。

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

> 依存関係は、採用するコード共有のアプローチによって異なる場合があります。詳細は [コード共有のレベル](#levels-of-code-sharing) を参照してください。
>
{style="note"}

デスクトップターゲットがある場合は、`kotlinx-coroutines-swing` 依存関係も追加してください。
`ViewModel` 内でコルーチンを実行する場合、`ViewModel.viewModelScope` は `Dispatchers.Main.immediate` に紐づけられますが、これはデスクトップではデフォルトで使用できない場合があります。Kotlinx Coroutines Swing ライブラリを使用することで、ViewModel のコルーチンが Compose Multiplatform で正しく動作するようになります。
    
1. Gradle バージョンカタログに追加します。

    ```toml
    [versions]
    kotlinx-coroutines = "1.10.2"
    
    [libraries]
    kotlinx-coroutines-swing = { module = "org.jetbrains.kotlinx:kotlinx-coroutines-swing", version.ref = "kotlinx-coroutines" }
    ```

2. `build.gradle.kts` ファイルに追加します。

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
     
    詳細については [`Dispatchers.Main` のドキュメント](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/-main.html) を参照してください。

## 共通コードでの ViewModel の使用 {id="using-viewmodel-in-common-code"}

Compose Multiplatform は共通の `ViewModelStoreOwner` 実装を提供しているため、共通コードで `ViewModel` クラスを使用する方法は [Android のベストプラクティス](https://developer.android.com/topic/libraries/architecture/viewmodel#best-practices) と大きく変わりません。

ただし、オブジェクトをインスタンス化するための型リフレクションが利用できない非 JVM プラットフォームでは、重要な違いがあります。共通コードでは、引数なしで `viewModel()` 関数を呼び出すことはできません。`ViewModel` インスタンスを作成するたびに、引数として少なくともイニシャライザを指定する必要があります。

イニシャライザのみが提供されている場合、Compose Multiplatform は内部でデフォルトのファクトリを作成します。ただし、独自のファクトリを実装して、[Jetpack Compose の場合](https://developer.android.com/topic/libraries/architecture/viewmodel#jetpack-compose) と同様に、共通の `viewModel()` 関数のより明示的なバージョンを呼び出すこともできます。

ViewModel を定義して Composable に接続してみましょう。

1. 注文されたアイテムの数量と価格を含む UI 状態を管理する、シンプルな `OrderViewModel` クラスを定義します。

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

    > この例では、Kotlin 2.4.0 で安定化された [明示的なバッキングフィールド (explicit backing fields)](https://kotlinlang.org/docs/properties.html#explicit-backing-fields) を使用しています。以前のバージョンを使用している場合は、`-Xexplicit-backing-fields` コンパイラオプションを追加するか、代わりに `.asStateFlow()` を使用する従来のバッキングフィールドパターンを使用してください。
    >
    {style="note"}

2. イニシャライザを指定した共通の `viewModel()` 関数を使用して、カスタム ViewModel を Composable 関数に追加します。

    ```kotlin
    import com.example.ui.OrderViewModel
    
    @Composable
    fun CupcakeApp(
       viewModel: OrderViewModel = viewModel { OrderViewModel() },
    ) {
       // ...
    }
    ```

## Navigation 3 による ViewModel のスコープ設定 {id="viewmodel-scoping-with-navigation-3"}

共通コードで Navigation 3 とともに ViewModel を使用する場合、デフォルトでは ViewModel はナビゲーションエントリに自動的にスコープ設定されません。明示的なスコープ設定がないと、ユーザーが画面から離れた後でも、各 ViewModel は画面ではなく `Activity` に紐づけられます。

ナビゲーションエントリごとに ViewModel と保存可能な Compose 状態をスコープ設定するには、ナビゲーション遷移先を定義する際に Navigation 3 のエントリデコレータを `NavDisplay` に渡します。

```kotlin
import androidx.lifecycle.viewmodel.navigation3.rememberViewModelStoreNavEntryDecorator
import androidx.navigation3.runtime.rememberSaveableStateHolderNavEntryDecorator

//...

NavDisplay(
   entryDecorators = listOf(
       // エントリごとに Compose の状態を保存
       rememberSaveableStateHolderNavEntryDecorator(),
       // エントリごとに ViewModel をスコープ設定
       rememberViewModelStoreNavEntryDecorator()
   ),
   backStack = backStack,
   entryProvider = entryProvider { }
)
```

## ViewModel と依存性注入 {id="viewmodel-and-dependency-injection"}

依存性注入（DI: Dependency Injection）フレームワークを使用すると、現在の環境やターゲットプラットフォームに基づいて、コンポーネントに異なる依存関係を注入できます。ViewModel を管理するには、Koin、Metro、または Kotlin Multiplatform をサポートするその他の DI フレームワークを使用できます。

依存性注入の高度な使用例については、[データアクセスレイヤーの共有](multiplatform-ktor-sqldelight.md) チュートリアルを参照してください。

### Koin {id="koin"}

Koin は、依存関係を設定するための DSL またはアノテーションを提供するランタイム DI フレームワークです。Compose ViewModel で Koin を使用するには、`koin-compose-viewmodel` 依存関係を追加します。

その後、`koinViewModel()` を使用して ViewModel を Composable 関数に注入できます。

```kotlin
@Composable
fun CupcakeApp(
   viewModel: UserViewModel = koinViewModel()
) {
   // ...
}
```

詳細については、[ViewModel のサポート](https://insert-koin.io/docs/reference/koin-core/viewmodel) および [Compose での ViewModel の注入](https://insert-koin.io/docs/reference/koin-compose/compose-viewmodel) に関する Koin のドキュメントを参照してください。

### Metro {id="metro"}

Metro は、Kotlin コンパイラプラグインとして実装されたコンパイル時 DI フレームワークです。Compose ViewModel で Metro を使用するには、`metrox-viewmodel-compose` 依存関係を追加します。

その後、`metroViewModel()` を使用して ViewModel を Composable 関数に注入できます。

```kotlin
@Composable
fun CupcakeApp(
   viewModel: UserViewModel = metroViewModel()
) {
   // ...
}
```

詳細については、[ViewModel の統合](https://zacsweers.github.io/metro/latest/metrox-viewmodel/) および [Compose での ViewModel へのアクセス](https://zacsweers.github.io/metro/latest/metrox-viewmodel-compose/) に関する MetroX のドキュメントを参照してください。

## コード共有のレベル {id="levels-of-code-sharing"}

コードのどの部分を共有し、どの部分をプラットフォーム固有にしておくかを選択できます。

* プラットフォーム間で UI とビジネスロジックの両方を共有するには、[ロジックと UI の共有チュートリアル](compose-multiplatform-new-project.md) を参照してください。
* UI 実装を共有せずに一部のコードを共有するには、[ロジック共有のチュートリアル](multiplatform-upgrade-app.md) を参照してください。

以下の例では、コード共有のさまざまなレベルで ViewModel を使用する方法を示します。すべての例は、上記で紹介した `OrderViewModel` クラスに基づいています。

### ViewModel と UI の共有 {id="shared-viewmodel-and-ui"}

このアプローチでは、`ViewModel` と UI を含むすべてが Compose Multiplatform を介して共有されます。アプリの UI コードを一度記述すれば、すべてのプラットフォームで動作します。

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

### ViewModel の共有とプラットフォーム固有の UI {id="shared-viewmodel-and-platform-specific-ui"}

このアプローチでは、`ViewModel`（ビジネスロジック）は共有されますが、プラットフォームごとにネイティブの UI 実装を持ちます。詳細については、[Kotlin Multiplatform 向け ViewModel のセットアップ](https://developer.android.com/kotlin/multiplatform/viewmodel) を参照してください。

このケースでは UI が共有されないため、Compose Multiplatform バージョンの ViewModel ライブラリから `androidx.lifecycle` ライブラリに切り替えることができます。

1. Gradle バージョンカタログの依存関係を更新します。

    ```toml
    [versions]
    androidx-viewmodel = "2.10.0"
    
    [libraries]
    androidx-lifecycle-viewmodel = { module = "androidx.lifecycle:lifecycle-viewmodel", version.ref = "androidx-viewmodel" }
    ```

2. `build.gradle.kts` ファイルで、バイナリフレームワークにエクスポートする必要があるため、依存関係を `api` として宣言します。

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

#### Android での実装 {id="android-implementation"}

Android では、Jetpack Compose が `Activity` によって提供される `ViewModelStoreOwner` を自動的に検出し、`OrderViewModel` を提供します。

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

#### iOS での実装 {id="ios-implementation"}

iOS には組み込みの `ViewModelStoreOwner` がないため、ViewModel のライフサイクルを手動で SwiftUI に紐づける必要があります。[KMP-ObservableViewModel](https://klibs.io/project/rickclephas/KMP-ObservableViewModel) ライブラリの使用をおすすめします。これにより、SwiftUI は Kotlin Multiplatform の ViewModel を直接監視できるようになり、iOS で必要な ViewModel のライフサイクルや store-owner のボイラープレートが処理されます。

1. Swift からアクセスできるように ViewModel API をエクスポートします。
    
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

2. KMP-ObservableViewModel の ViewModel 基本クラスと `@NativeCoroutinesState` アノテーションを使用して、`commonMain` で ViewModel を定義します。
    
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
    
3. iOS UI のエントリポイントで ViewModel を使用します。
    
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

### リポジトリ/データレイヤーの共有、プラットフォーム固有の ViewModel と UI {id="shared-repo-data-layer-platform-specific-viewmodels-and-ui"}

もう 1 つの選択肢は、データレイヤーとリポジトリレイヤーのみを共有し、プラットフォーム固有の ViewModel 実装を使用することです。これにより、Android の依存性注入に Hilt を使用したり、iOS で Combine とともに `ObservableObject` を使用したりするなど、各プラットフォームのネイティブパターンを利用できます。

1. データロジックを含む共有リポジトリクラスを作成します。

    ```kotlin
    class OrderRepository {
       fun calculatePrice(quantity: Int) = "$${quantity * 2}.00"
    }
    ```

2. プラットフォーム固有の ViewModel を実装します。

   * Android では、標準の Android ViewModel を使用してリポジトリを注入します。

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

   * iOS では、`ObservableObject` を使用して Swift でネイティブに ViewModel を実装します。

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

3. プラットフォーム固有の UI を実装します。

   * Android の場合：

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

   * iOS の場合：

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

## 次のステップ {id="what-s-next"}

* [完全なサンプル](https://github.com/JetBrains/compose-multiplatform/tree/master/examples/nav_cupcake) を確認してください。
* Android を重視した追加のガイダンスについては、[Kotlin Multiplatform 向け ViewModel のセットアップ](https://developer.android.com/kotlin/multiplatform/viewmodel) を参照してください。
* 共有 ViewModel をネイティブ UI と併用する場合の、[Compose Multiplatform と SwiftUI の統合](compose-swiftui-integration.md) について学んでください。