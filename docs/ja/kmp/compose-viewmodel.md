[//]: # (title: マルチプラットフォーム ViewModel)

Android の [ViewModel](https://developer.android.com/topic/libraries/architecture/viewmodel) を使用すると、アプリのビジネスロジックと UI コンポーネントを接続できます。
Compose Multiplatform を使用すると、共通コードでも ViewModel を使用できます。

このページでは、マルチプラットフォームプロジェクトでの ViewModel のセットアップと使用方法について説明します。

* [依存関係のセットアップ](#set-up-dependencies)
* [共通コードでの ViewModel の使用](#using-viewmodel-in-common-code)
* [Navigation 3 での ViewModel のスコープ設定](#viewmodel-scoping-with-navigation-3)
* [Koin または Metro を使用した依存関係の注入](#viewmodel-and-dependency-injection)
* [ViewModel と UI コードをどの程度共有するかを選択する](#levels-of-code-sharing):
  完全に共有するアプローチから、リポジトリやデータレイヤーのみを共有する方法まで。

## 依存関係のセットアップ

プラットフォーム間で ViewModel と UI を共有するには：

1. Gradle のバージョンカタログファイル（`libs.versions.toml`）で依存関係を定義します：

    ```toml
    [versions]
    androidx-viewmodel = "2.10.0"
    
    [libraries]
    androidx-lifecycle-viewmodel-compose = { module = "org.jetbrains.androidx.lifecycle:lifecycle-viewmodel-compose", version.ref = "androidx-viewmodel" }
    androidx-lifecycle-viewmodel-navigation3 = { module = "androidx.lifecycle:lifecycle-viewmodel-navigation3", version.ref = "androidx-viewmodel" }
    ``` 
   
    > マルチプラットフォーム ViewModel 実装の変更内容については、[What's new](https://www.jetbrains.com/help/kotlin-multiplatform-dev/whats-new-compose.html) を確認するか、[Compose Multiplatform の変更履歴](https://github.com/JetBrains/compose-multiplatform/blob/master/CHANGELOG.md)で EAP リリースをフォローしてください。
    >
    {style="tip"}
2. KMP モジュールの `build.gradle.kts` ファイルで、`commonMain` ソースセットに以下の依存関係を追加します：

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

> 依存関係は、コード共有のアプローチによって異なる場合があります。詳細は [コード共有のレベル](#levels-of-code-sharing) を参照してください。
>
{style="note"}

デスクトップ（desktop）ターゲットがある場合は、`kotlinx-coroutines-swing` 依存関係も追加してください。
`ViewModel` 内でコルーチンを実行する場合、`ViewModel.viewModelScope` は `Dispatchers.Main.immediate` に紐付けられていますが、デスクトップ環境ではデフォルトでこれが利用できない場合があります。Kotlinx Coroutines Swing ライブラリを使用することで、ViewModel のコルーチンを Compose Multiplatform で正しく動作させることができます。
    
1. Gradle バージョンカタログ：

    ```toml
    [versions]
    kotlinx-coroutines = "1.10.2"
    
    [libraries]
    kotlinx-coroutines-swing = { module = "org.jetbrains.kotlinx:kotlinx-coroutines-swing", version.ref = "kotlinx-coroutines" }
    ```

2. `build.gradle.kts` ファイル：

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
     
    詳細は [`Dispatchers.Main` のドキュメント](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/-main.html)を参照してください。

## 共通コードでの ViewModel の使用

Compose Multiplatform は共通の `ViewModelStoreOwner` 実装を提供しているため、共通コードでの `ViewModel` クラスの使用は、一般的に [Android のベストプラクティス](https://developer.android.com/topic/libraries/architecture/viewmodel#best-practices)と大きな違いはありません。

ただし、JVM 以外のプラットフォームでは、オブジェクトをインスタンス化するための型リフレクションが利用できないという重要な違いがあります。
共通コードでは、パラメータなしで `viewModel()` 関数を呼び出すことはできません。
`ViewModel` インスタンスを作成するたびに、引数として少なくとも初期化子（initializer）を指定する必要があります。

初期化子のみが提供された場合、Compose Multiplatform は内部でデフォルトのファクトリを作成します。
しかし、[Jetpack Compose の場合](https://developer.android.com/topic/libraries/architecture/viewmodel#jetpack-compose)と同様に、独自のファクトリを実装して、より明示的なバージョンの共通 `viewModel()` 関数を呼び出すことも可能です。

ViewModel を定義し、Composable に組み込んでみましょう：

1. 注文されたアイテムの数量と価格を含む UI 状態を管理する、シンプルな `OrderViewModel` クラスを定義します：

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

    > この例では、Kotlin 2.4.0 で安定化した [明示的なバッキングフィールド（explicit backing fields）](https://kotlinlang.org/docs/properties.html#explicit-backing-fields) を使用しています。以前のバージョンを使用する場合は、コンパイラオプション `-Xexplicit-backing-fields` を追加するか、代わりに `.asStateFlow()` を使用した従来のバッキングフィールドのパターンを使用してください。
    >
    {style="note"}

2. 初期化子を指定した共通の `viewModel()` 関数を使用して、カスタム ViewModel を Composable 関数に追加します：

    ```kotlin
    import com.example.ui.OrderViewModel
    
    @Composable
    fun CupcakeApp(
       viewModel: OrderViewModel = viewModel { OrderViewModel() },
    ) {
       // ...
    }
    ```

## Navigation 3 での ViewModel のスコープ設定

共通コードで Navigation 3 と共に ViewModel を使用する場合、デフォルトでは ViewModel がナビゲーションエントリに自動的にスコープ設定されることはありません。
明示的なスコープ設定を行わない場合、各 ViewModel は画面ではなく `Activity` に紐付けられ、ユーザーが画面を離れた後も維持されてしまいます。

ViewModel と保存可能な Compose 状態をナビゲーションエントリごとにスコープ設定するには、ナビゲーションの遷移先を定義する際に、Navigation 3 のエントリデコレータを `NavDisplay` に渡します：

```kotlin
import androidx.lifecycle.viewmodel.navigation3.rememberViewModelStoreNavEntryDecorator
import androidx.navigation3.runtime.rememberSaveableStateHolderNavEntryDecorator

//...

NavDisplay(
   entryDecorators = listOf(
       // エントリごとに Compose 状態を保存する
       rememberSaveableStateHolderNavEntryDecorator(),
       // エントリごとに ViewModel をスコープ設定する
       rememberViewModelStoreNavEntryDecorator()
   ),
   backStack = backStack,
   entryProvider = entryProvider { }
)
```

## ViewModel と依存関係の注入

依存関係の注入（DI）フレームワークを使用すると、現在の環境やターゲットプラットフォームに基づいて、コンポーネントに異なる依存関係を注入できます。
ViewModel を管理するには、Koin、Metro、または Kotlin Multiplatform をサポートするその他の DI フレームワークを使用できます。

依存関係の注入を使用した高度な例については、[データアクセスレイヤーの共有](multiplatform-ktor-sqldelight.md) チュートリアルを参照してください。

### Koin

Koin は、依存関係を設定するための DSL またはアノテーションを提供するランタイム DI フレームワークです。
Compose ViewModel で Koin を使用するには、`koin-compose-viewmodel` 依存関係を追加します。

その後、`koinViewModel()` を使用して Composable 関数に ViewModel を注入できます：

```kotlin
@Composable
fun CupcakeApp(
   viewModel: UserViewModel = koinViewModel()
) {
   // ...
}
```

詳細は、Koin ドキュメントの [ViewModel のサポート](https://insert-koin.io/docs/reference/koin-core/viewmodel) および [Compose での ViewModel 注入](https://insert-koin.io/docs/reference/koin-compose/compose-viewmodel) を参照してください。

### Metro

Metro は、Kotlin コンパイラプラグインとして実装されたコンパイルタイム DI フレームワークです。
Compose ViewModel で Metro を使用するには、`metrox-viewmodel-compose` 依存関係を追加します。

その後、`metroViewModel()` を使用して Composable 関数に ViewModel を注入できます：

```kotlin
@Composable
fun CupcakeApp(
   viewModel: UserViewModel = metroViewModel()
) {
   // ...
}
```

詳細は、MetroX ドキュメントの [ViewModel の統合](https://zacsweers.github.io/metro/latest/metrox-viewmodel/) および [Compose での ViewModel へのアクセス](https://zacsweers.github.io/metro/latest/metrox-viewmodel-compose/) を参照してください。

## コード共有のレベル

コードのどの部分を共有し、どの部分をプラットフォーム固有にするかを選択できます：

* プラットフォーム間で UI とビジネスロジックの両方を共有する場合は、[ロジックと UI の共有チュートリアル](compose-multiplatform-create-first-app.md)を参照してください。
* UI 実装を共有せずに一部のコードのみを共有する場合は、[ロジック共有チュートリアル](multiplatform-create-first-app.md)を参照してください。

以下の例は、異なるコード共有レベルで ViewModel を使用する方法を示しています。
すべての例は、上記で導入した `OrderViewModel` クラスに基づいています。

### 共有 ViewModel と共有 UI

このアプローチでは、`ViewModel` と UI を含むすべてが Compose Multiplatform を介して共有されます。
アプリの UI コードを一度書けば、すべてのプラットフォームで動作します。

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

### 共有 ViewModel とプラットフォーム固有の UI

このアプローチでは、`ViewModel`（ビジネスロジック）は共有されますが、各プラットフォームにはネイティブの UI 実装があります。
詳細は、[Kotlin Multiplatform 向けの ViewModel のセットアップ](https://developer.android.com/kotlin/multiplatform/viewmodel)（英語）を参照してください。

この場合 UI は共有されないため、ViewModel ライブラリを Compose Multiplatform 版から `androidx.lifecycle` ライブラリに切り替えることができます。

1. Gradle バージョンカタログの依存関係を更新します：

    ```toml
    [versions]
    androidx-viewmodel = "2.10.0"
    
    [libraries]
    androidx-lifecycle-viewmodel = { module = "androidx.lifecycle:lifecycle-viewmodel", version.ref = "androidx-viewmodel" }
    ```

2. `build.gradle.kts` ファイルで、バイナリフレームワークにエクスポートする必要があるため、依存関係を `api` として宣言します：

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

#### Android での実装

Android では、Jetpack Compose が自動的に `Activity` から提供される `ViewModelStoreOwner` を見つけ、`OrderViewModel` を提供します。

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

#### iOS での実装

iOS には組み込みの `ViewModelStoreOwner` がないため、ViewModel のライフサイクルを手動で SwiftUI に紐付ける必要があります。
[KMP-ObservableViewModel](https://klibs.io/project/rickclephas/KMP-ObservableViewModel) ライブラリの使用をお勧めします。これにより、SwiftUI で Kotlin Multiplatform の ViewModel を直接監視でき、iOS で必要な ViewModel ライフサイクルや Store-owner に関するボイラープレート（定型コード）を処理できます。

1. Swift からアクセスできるように ViewModel API をエクスポートします：
    
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

2. KMP-ObservableViewModel の ViewModel ベースクラスと `@NativeCoroutinesState` アノテーションを使用して、`commonMain` で ViewModel を定義します：
    
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
    
3. iOS UI のエントリポイントで ViewModel を使用します：
    
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

### 共有リポジトリ/データレイヤー、プラットフォーム固有の ViewModel と UI

もう一つの選択肢は、データとリポジトリレイヤーのみを共有し、プラットフォーム固有の ViewModel 実装を使用することです。
これにより、Android の依存関係注入のための Hilt や、iOS の Combine を使用した `ObservableObject` など、各プラットフォームのネイティブパターンを使用できます。

1. データロジックを持つ共有リポジトリクラスを作成します：

    ```kotlin
    class OrderRepository {
       fun calculatePrice(quantity: Int) = "${quantity * 2}.00"
    }
    ```

2. プラットフォーム固有の ViewModel を実装します。

   * Android では、標準の Android ViewModel を使用し、リポジトリを注入します：

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

   * iOS では、`ObservableObject` を使用して Swift でネイティブに ViewModel を実装します：

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

   * Android：

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

   * iOS：

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

## 次のステップ

* [完全なサンプル](https://github.com/JetBrains/compose-multiplatform/tree/master/examples/nav_cupcake)を確認してください。
* Android に焦点を当てた追加のガイダンスについては、[Kotlin Multiplatform 向けの ViewModel のセットアップ](https://developer.android.com/kotlin/multiplatform/viewmodel)（英語）を参照してください。
* 共有 ViewModel をネイティブ UI と共に使用する場合の [Compose Multiplatform と SwiftUI の統合](compose-swiftui-integration.md)について学習してください。