[//]: # (title: 멀티플랫폼 ViewModel)

Android [ViewModel](https://developer.android.com/topic/libraries/architecture/viewmodel)을 사용하면 앱의 비즈니스 로직과 UI 컴포넌트를 연결할 수 있습니다.
Compose Multiplatform을 사용하면 공통 코드(common code)에서도 ViewModel을 사용할 수 있습니다.

이 페이지에서는 멀티플랫폼 프로젝트에서 ViewModel을 설정하고 사용하는 방법을 안내합니다:

* [종속성 설정하기](#set-up-dependencies).
* [공통 코드에서 ViewModel 사용하기](#using-viewmodel-in-common-code).
* [내비게이션 목적지에 따른 ViewModel 스코핑(범위 지정)](#viewmodel-scoping-with-navigation-3).
* [Koin 또는 Metro를 사용한 의존성 주입](#viewmodel-and-dependency-injection).
* [ViewModel 및 UI 코드의 공유 수준 선택하기](#levels-of-code-sharing): 
  완전한 공유 방식부터 리포지토리나 데이터 계층만 공유하는 방식까지.

## 종속성 설정하기

플랫폼 간에 ViewModel과 UI를 공유하려면 다음 단계를 따르세요:

1. Gradle 버전 카탈로그 파일에 종속성을 정의합니다:

    ```toml
    [versions]
    androidx-viewmodel = "2.10.0"
    
    [libraries]
    androidx-lifecycle-viewmodel-compose = { module = "org.jetbrains.androidx.lifecycle:lifecycle-viewmodel-compose", version.ref = "androidx-viewmodel" }
    androidx-lifecycle-viewmodel-navigation3 = { module = "androidx.lifecycle:lifecycle-viewmodel-navigation3", version.ref = "androidx-viewmodel" }
    ``` 
   
    > 멀티플랫폼 ViewModel 구현의 변경 사항은 [새로운 기능](https://www.jetbrains.com/help/kotlin-multiplatform-dev/whats-new-compose.html)에서 확인하거나, [Compose Multiplatform 변경 로그](https://github.com/JetBrains/compose-multiplatform/blob/master/CHANGELOG.md)에서 EAP 릴리스 소식을 팔로우할 수 있습니다.
    >
    {style="tip"}
2. KMP 모듈의 `build.gradle.kts` 파일에서 `commonMain` 소스 세트에 다음 종속성을 추가합니다:

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

> 코드 공유 방식에 따라 종속성이 달라질 수 있습니다. 자세한 내용은 [코드 공유 수준](#levels-of-code-sharing)을 참고하세요.
>
{style="note"}

데스크톱 타겟이 있는 경우 `kotlinx-coroutines-swing` 종속성도 추가하세요.
`ViewModel`에서 코루틴을 실행할 때, `ViewModel.viewModelScope`는 `Dispatchers.Main.immediate`에 연결되는데, 이는 기본적으로 데스크톱 환경에서 사용할 수 없을 수도 있습니다. Kotlinx Coroutines Swing 라이브러리는 ViewModel 코루틴이 Compose Multiplatform에서 올바르게 작동하도록 도와줍니다.
    
1. Gradle 버전 카탈로그에서:

    ```toml
    [versions]
    kotlinx-coroutines = "1.10.2"
    
    [libraries]
    kotlinx-coroutines-swing = { module = "org.jetbrains.kotlinx:kotlinx-coroutines-swing", version.ref = "kotlinx-coroutines" }
    ```

2. `build.gradle.kts` 파일에서:

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
     
    자세한 내용은 [`Dispatchers.Main` 문서](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/-main.html)를 참고하세요.

## 공통 코드에서 ViewModel 사용하기

Compose Multiplatform은 공통 `ViewModelStoreOwner` 구현을 제공하므로, 공통 코드에서 `ViewModel` 클래스를 사용하는 방식은 [Android 권장 사례](https://developer.android.com/topic/libraries/architecture/viewmodel#best-practices)와 크게 다르지 않습니다.

하지만 JVM 이외의 플랫폼에서는 객체 인스턴스화를 위한 타입 리플렉션(type reflection)을 사용할 수 없다는 중요한 차이점이 있습니다.
따라서 공통 코드에서는 매개변수 없이 `viewModel()` 함수를 호출할 수 없습니다.
`ViewModel` 인스턴스를 생성할 때마다 최소한 초기화 함수(initializer)를 인자로 제공해야 합니다.

초기화 함수만 제공되는 경우, Compose Multiplatform은 내부적으로 기본 팩토리를 생성합니다.
하지만 [Jetpack Compose와 마찬가지로](https://developer.android.com/topic/libraries/architecture/viewmodel#jetpack-compose) 직접 팩토리를 구현하고 더 명시적인 버전의 공통 `viewModel()` 함수를 호출할 수도 있습니다.

이제 ViewModel을 정의하고 컴포저블에 연결해 보겠습니다:

1. 주문 수량과 가격을 포함한 UI 상태를 관리하는 간단한 `OrderViewModel` 클래스를 정의합니다:

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

    > 이 예제는 Kotlin 2.4.0에서 안정화된 [명시적 백킹 필드(explicit backing fields)](https://kotlinlang.org/docs/properties.html#explicit-backing-fields)를 사용합니다. 이전 버전을 사용하는 경우, `-Xexplicit-backing-fields` 컴파일러 옵션을 추가하거나 대신 `.asStateFlow()`를 사용하는 이전의 백킹 필드 패턴을 사용하세요.
    >
    {style="note"}

2. 초기화 함수와 함께 공통 `viewModel()` 함수를 사용하여 커스텀 ViewModel을 컴포저블 함수에 추가합니다:

    ```kotlin
    import com.example.ui.OrderViewModel
    
    @Composable
    fun CupcakeApp(
       viewModel: OrderViewModel = viewModel { OrderViewModel() },
    ) {
       // ...
    }
    ```

## Navigation 3를 사용한 ViewModel 스코핑

공통 코드에서 Navigation 3와 함께 ViewModel을 사용할 때, 
기본적으로 ViewModel은 내비게이션 엔트리에 자동으로 스코핑되지 않습니다. 
명시적인 스코핑이 없으면, 사용자가 화면을 벗어난 후에도 각 ViewModel은 화면이 아닌 `Activity`에 연결된 상태로 유지됩니다.

각 내비게이션 엔트리별로 ViewModel을 스코핑하고 Compose 상태(saveable state)를 저장하려면, 
내비게이션 목적지를 정의할 때 Navigation 3 엔트리 데코레이터(decorator)를 `NavDisplay`에 전달하세요:

```kotlin
import androidx.lifecycle.viewmodel.navigation3.rememberViewModelStoreNavEntryDecorator
import androidx.navigation3.runtime.rememberSaveableStateHolderNavEntryDecorator

//...

NavDisplay(
   entryDecorators = listOf(
       // 엔트리별 Compose 상태 저장
       rememberSaveableStateHolderNavEntryDecorator(),
       // 엔트리별 ViewModel 스코핑
       rememberViewModelStoreNavEntryDecorator()
   ),
   backStack = backStack,
   entryProvider = entryProvider { }
)
```

## ViewModel과 의존성 주입

의존성 주입(DI) 프레임워크를 사용하면 현재 환경이나 타겟 플랫폼에 따라 구성 요소에 서로 다른 종속성을 주입할 수 있습니다. 
ViewModel을 관리하기 위해 Koin, Metro 또는 Kotlin 멀티플랫폼을 지원하는 다른 DI 프레임워크를 사용할 수 있습니다.

의존성 주입 사용에 대한 고급 예제는 [데이터 접근 계층 공유](multiplatform-ktor-sqldelight.md) 튜토리얼을 참고하세요.

### Koin

Koin은 종속성 구성을 위해 DSL 또는 어노테이션을 제공하는 런타임 DI 프레임워크입니다. 
Compose ViewModel과 함께 Koin을 사용하려면 `koin-compose-viewmodel` 종속성을 추가하세요.

그런 다음 `koinViewModel()`을 사용하여 컴포저블 함수에 ViewModel을 주입할 수 있습니다:

```kotlin
@Composable
fun CupcakeApp(
   viewModel: UserViewModel = koinViewModel()
) {
   // ...
}
```

자세한 내용은 Koin 문서의 [ViewModel 지원](https://insert-koin.io/docs/reference/koin-core/viewmodel) 및 [Compose에서 ViewModel 주입](https://insert-koin.io/docs/reference/koin-compose/compose-viewmodel)을 참고하세요.

### Metro

Metro는 Kotlin 컴파일러 플러그인으로 구현된 컴파일 타임 DI 프레임워크입니다. 
Compose ViewModel과 함께 Metro를 사용하려면 `metrox-viewmodel-compose` 종속성을 추가하세요.

그런 다음 `metroViewModel()`을 사용하여 컴포저블 함수에 ViewModel을 주입할 수 있습니다:

```kotlin
@Composable
fun CupcakeApp(
   viewModel: UserViewModel = metroViewModel()
) {
   // ...
}
```

자세한 내용은 MetroX 문서의 [ViewModel 통합](https://zacsweers.github.io/metro/latest/metrox-viewmodel/) 및 [Compose에서 ViewModel 접근](https://zacsweers.github.io/metro/latest/metrox-viewmodel-compose/)을 참고하세요.

## 코드 공유 수준

코드의 어느 부분을 공유하고 어느 부분을 플랫폼별로 유지할지 선택할 수 있습니다:

* 플랫폼 간에 UI와 비즈니스 로직을 모두 공유하려면 [공유 로직 및 UI 튜토리얼](compose-multiplatform-create-first-app.md)을 참고하세요.
* UI 구현을 공유하지 않고 일부 코드만 공유하려면 [공유 로직 튜토리얼](multiplatform-create-first-app.md)을 참고하세요.

다음 예제들은 다양한 코드 공유 수준에서 ViewModel을 사용하는 방법을 보여줍니다. 모든 예제는 위에서 소개한 `OrderViewModel` 클래스를 기반으로 합니다.

### ViewModel 및 UI 공유

이 방식에서는 `ViewModel`과 UI를 포함한 모든 것이 Compose Multiplatform을 통해 공유됩니다. 앱의 UI 코드를 한 번만 작성하면 모든 플랫폼에서 작동합니다.

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

### ViewModel 공유 및 플랫폼별 UI

이 방식에서는 `ViewModel`(비즈니스 로직)은 공유되지만, 각 플랫폼은 네이티브 UI 구현을 갖습니다. 자세한 내용은 [Kotlin Multiplatform을 위한 ViewModel 설정](https://developer.android.com/kotlin/multiplatform/viewmodel)을 참고하세요.

이 경우 UI가 공유되지 않으므로, ViewModel 라이브러리를 Compose Multiplatform 버전에서 `androidx.lifecycle` 라이브러리로 전환할 수 있습니다.

1. Gradle 버전 카탈로그에서 종속성을 업데이트합니다:

    ```toml
    [versions]
    androidx-viewmodel = "2.10.0"
    
    [libraries]
    androidx-lifecycle-viewmodel = { module = "androidx.lifecycle:lifecycle-viewmodel", version.ref = "androidx-viewmodel" }
    ```

2. `build.gradle.kts` 파일에서 종속성을 `api`로 선언합니다. 바이너리 프레임워크로 노출되어야 하기 때문입니다:

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

#### Android 구현

Android에서 Jetpack Compose는 `Activity`가 제공하는 `ViewModelStoreOwner`를 자동으로 찾아 `OrderViewModel`을 공급합니다.

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

#### iOS 구현

iOS에는 내장된 `ViewModelStoreOwner`가 없으므로 ViewModel의 생명주기를 SwiftUI에 수동으로 연결해야 합니다. 
[KMP-ObservableViewModel](https://klibs.io/project/rickclephas/KMP-ObservableViewModel) 라이브러리를 사용하는 것을 권장합니다. 이 라이브러리는 SwiftUI가 Kotlin Multiplatform ViewModel을 직접 관찰할 수 있게 해주며, iOS에 필요한 ViewModel 생명주기 및 store-owner 관련 상용구 코드를 처리해 줍니다.

1. Swift에서 접근할 수 있도록 ViewModel API를 내보냅니다:
    
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

2. KMP-ObservableViewModel의 ViewModel 기본 클래스와 `@NativeCoroutinesState` 어노테이션을 사용하여 `commonMain`에 ViewModel을 정의합니다:
    
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
    
3. iOS UI 진입점에서 ViewModel을 사용합니다:
    
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

### 공유 리포지토리/데이터 계층, 플랫폼별 ViewModel 및 UI

또 다른 옵션은 데이터와 리포지토리 계층만 공유하고 플랫폼별 ViewModel 구현을 사용하는 것입니다. 
이를 통해 Android의 Hilt 의존성 주입이나 iOS의 Combine을 사용하는 `ObservableObject`와 같이 각 플랫폼의 네이티브 패턴을 사용할 수 있습니다.

1. 데이터 로직을 포함하는 공유 리포지토리 클래스를 생성합니다:

    ```kotlin
    class OrderRepository {
       fun calculatePrice(quantity: Int) = "${quantity * 2}.00"
    }
    ```

2. 플랫폼별 ViewModel을 구현합니다.

   * Android에서는 표준 Android ViewModel을 사용하고 리포지토리를 주입합니다:

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

   * iOS에서는 `ObservableObject`를 사용하여 Swift에서 네이티브로 ViewModel을 구현합니다:

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

3. 플랫폼별 UI를 구현합니다.

   * Android:

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

   * iOS:

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

## 다음 단계

* [전체 샘플](https://github.com/JetBrains/compose-multiplatform/tree/master/examples/nav_cupcake)을 확인해 보세요.
* Android 중심의 추가 가이드는 [Kotlin Multiplatform을 위한 ViewModel 설정](https://developer.android.com/kotlin/multiplatform/viewmodel)을 참고하세요.
* 공유 ViewModel을 네이티브 UI와 함께 사용할 때 [Compose Multiplatform과 SwiftUI를 통합](compose-swiftui-integration.md)하는 방법을 알아보세요.