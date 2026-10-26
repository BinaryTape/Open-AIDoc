[//]: # (title: 멀티플랫폼 ViewModel)

Android의 [ViewModel](https://developer.android.com/topic/libraries/architecture/viewmodel)을 사용하면 앱의 비즈니스 로직을 UI 컴포넌트와 연결할 수 있습니다.
Compose Multiplatform을 사용하면 공통 코드(common code)에서도 ViewModel을 사용할 수 있습니다.

이 페이지에서는 멀티플랫폼 프로젝트에서 ViewModel을 설정하고 활용하는 방법을 안내합니다.

* [의존성 설정](#set-up-dependencies)
* [공통 코드에서 ViewModel 사용](#using-viewmodel-in-common-code)
* [Navigation 대상(destination)에 ViewModel 범위 지정](#viewmodel-scoping-with-navigation-3)
* [Koin 또는 Metro를 사용한 의존성 주입](#viewmodel-and-dependency-injection)
* [공유할 ViewModel 및 UI 코드의 범위 선택](#levels-of-code-sharing):
  완전히 공유하는 방식부터 리포지토리나 데이터 레이어만 공유하는 방식까지 다양합니다.

## 의존성 설정 {id="set-up-dependencies"}

플랫폼 간에 ViewModel과 UI를 공유하려면 다음과 같이 설정합니다.

1. Gradle 버전 카탈로그(Version Catalog) 파일에 의존성을 정의합니다.

    ```toml
    [versions]
    androidx-viewmodel = "2.10.0"
    
    [libraries]
    androidx-lifecycle-viewmodel-compose = { module = "org.jetbrains.androidx.lifecycle:lifecycle-viewmodel-compose", version.ref = "androidx-viewmodel" }
    androidx-lifecycle-viewmodel-navigation3 = { module = "androidx.lifecycle:lifecycle-viewmodel-navigation3", version.ref = "androidx-viewmodel" }
    ``` 
   
    > 멀티플랫폼 ViewModel 구현의 변경 사항은 [What's new](https://www.jetbrains.com/help/kotlin-multiplatform-dev/whats-new-compose.html)에서 확인하거나, [Compose Multiplatform 변경 로그](https://github.com/JetBrains/compose-multiplatform/blob/master/CHANGELOG.md)에서 EAP 릴리스를 팔로우할 수 있습니다.
    >
    {style="tip"}
2. KMP 모듈의 `build.gradle.kts` 파일에서 `commonMain` 소스 세트에 다음 의존성을 추가합니다.

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

> 코드 공유 방식에 따라 의존성이 달라질 수 있습니다. 자세한 내용은 [코드 공유 수준](#levels-of-code-sharing)을 참고하세요.
>
{style="note"}

데스크톱 타깃이 있는 경우 `kotlinx-coroutines-swing` 의존성도 추가하세요.
`ViewModel`에서 코루틴을 실행할 때 `ViewModel.viewModelScope`는 `Dispatchers.Main.immediate`에 바인딩되는데, 이는 데스크톱에서 기본적으로 제공되지 않을 수 있습니다. Kotlinx Coroutines Swing 라이브러리를 사용하면 Compose Multiplatform에서 ViewModel 코루틴이 올바르게 동작하도록 해줍니다.
    
1. Gradle 버전 카탈로그:

    ```toml
    [versions]
    kotlinx-coroutines = "1.10.2"
    
    [libraries]
    kotlinx-coroutines-swing = { module = "org.jetbrains.kotlinx:kotlinx-coroutines-swing", version.ref = "kotlinx-coroutines" }
    ```

2. `build.gradle.kts` 파일:

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

## 공통 코드에서 ViewModel 사용 {id="using-viewmodel-in-common-code"}

Compose Multiplatform은 공통 `ViewModelStoreOwner` 구현을 제공하므로, 공통 코드에서 `ViewModel` 클래스를 사용하는 방식은 [Android 모범 사례](https://developer.android.com/topic/libraries/architecture/viewmodel#best-practices)와 크게 다르지 않습니다.

하지만 객체 인스턴스화를 위한 타입 리플렉션을 사용할 수 없는 비 JVM 플랫폼에서는 중요한 차이점이 있습니다.
공통 코드에서는 매개변수 없이 `viewModel()` 함수를 호출할 수 없습니다.
`ViewModel` 인스턴스를 생성할 때마다 최소한 initializer를 인수로 제공해야 합니다.

initializer만 제공되면 Compose Multiplatform이 내부적으로 기본 팩토리를 생성합니다.
하지만 [Jetpack Compose와 마찬가지로](https://developer.android.com/topic/libraries/architecture/viewmodel#jetpack-compose) 고유한 팩토리를 직접 구현하고 보다 명시적인 버전의 공통 `viewModel()` 함수를 호출할 수도 있습니다.

ViewModel을 정의하고 컴포저블에 연결해 보겠습니다.

1. 주문 항목의 수량과 가격을 포함한 UI 상태를 관리하는 간단한 `OrderViewModel` 클래스를 정의합니다.

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

    > 이 예제는 Kotlin 2.4.0에서 안정화된 [명시적 뒷받침 필드(explicit backing fields)](https://kotlinlang.org/docs/properties.html#explicit-backing-fields)를 사용합니다. 이전 버전을 사용하는 경우 `-Xexplicit-backing-fields` 컴파일러 옵션을 추가하거나, 대신 `.asStateFlow()`를 사용하는 기존 뒷받침 필드 패턴을 적용하세요.
    >
    {style="note"}

2. initializer가 포함된 공통 `viewModel()` 함수를 사용하여 커스텀 ViewModel을 컴포저블 함수에 추가합니다.

    ```kotlin
    import com.example.ui.OrderViewModel
    
    @Composable
    fun CupcakeApp(
       viewModel: OrderViewModel = viewModel { OrderViewModel() },
    ) {
       // ...
    }
    ```

## Navigation 3을 사용한 ViewModel 범위 지정 {id="viewmodel-scoping-with-navigation-3"}

공통 코드에서 Navigation 3과 함께 ViewModel을 사용할 때, 기본적으로 ViewModel이 내비게이션 엔트리(navigation entry)에 자동으로 스코프(범위)가 지정되지 않습니다.
명시적으로 범위를 지정하지 않으면 사용자가 화면을 벗어난 후에도 각 ViewModel이 화면이 아닌 `Activity`에 바인딩됩니다.

내비게이션 엔트리별로 ViewModel과 저장 가능한(saveable) Compose 상태의 범위를 지정하려면, 내비게이션 대상(destination)을 정의할 때 Navigation 3 엔트리 데코레이터를 `NavDisplay`에 전달하세요.

```kotlin
import androidx.lifecycle.viewmodel.navigation3.rememberViewModelStoreNavEntryDecorator
import androidx.navigation3.runtime.rememberSaveableStateHolderNavEntryDecorator

//...

NavDisplay(
   entryDecorators = listOf(
       // 엔트리별로 Compose 상태 저장
       rememberSaveableStateHolderNavEntryDecorator(),
       // 엔트리별로 ViewModel 범위 지정
       rememberViewModelStoreNavEntryDecorator()
   ),
   backStack = backStack,
   entryProvider = entryProvider { }
)
```

## ViewModel과 의존성 주입 {id="viewmodel-and-dependency-injection"}

의존성 주입(DI, Dependency Injection) 프레임워크를 사용하면 현재 환경이나 타깃 플랫폼에 따라 컴포넌트에 서로 다른 의존성을 주입할 수 있습니다.
ViewModel을 관리하기 위해 Koin, Metro 또는 Kotlin Multiplatform을 지원하는 다른 DI 프레임워크를 사용할 수 있습니다.

의존성 주입 활용에 관한 심화 예제는 [데이터 접근 레이어 공유](multiplatform-ktor-sqldelight.md) 튜토리얼을 참고하세요.

### Koin {id="koin"}

Koin은 의존성을 구성하기 위한 DSL이나 어노테이션을 제공하는 런타임 DI 프레임워크입니다.
Compose ViewModel과 함께 Koin을 사용하려면 `koin-compose-viewmodel` 의존성을 추가하세요.

그런 다음 `koinViewModel()`을 사용하여 Composable 함수에 ViewModel을 주입할 수 있습니다.

```kotlin
@Composable
fun CupcakeApp(
   viewModel: UserViewModel = koinViewModel()
) {
   // ...
}
```

자세한 내용은 [ViewModel 지원](https://insert-koin.io/docs/reference/koin-core/viewmodel) 및 [Compose에서 ViewModel 주입](https://insert-koin.io/docs/reference/koin-compose/compose-viewmodel)에 대한 Koin 문서를 참고하세요.

### Metro {id="metro"}

Metro는 Kotlin 컴파일러 플러그인으로 구현된 컴파일 타임 DI 프레임워크입니다.
Compose ViewModel과 함께 Metro를 사용하려면 `metrox-viewmodel-compose` 의존성을 추가하세요.

그런 다음 `metroViewModel()`을 사용하여 Composable 함수에 ViewModel을 주입할 수 있습니다.

```kotlin
@Composable
fun CupcakeApp(
   viewModel: UserViewModel = metroViewModel()
) {
   // ...
}
```

자세한 내용은 [ViewModel 통합](https://zacsweers.github.io/metro/latest/metrox-viewmodel/) 및 [Compose에서 ViewModel 접근](https://zacsweers.github.io/metro/latest/metrox-viewmodel-compose/)에 대한 MetroX 문서를 참고하세요.

## 코드 공유 수준 {id="levels-of-code-sharing"}

코드의 어느 부분을 공유하고 어느 부분을 플랫폼 고유하게 유지할지 선택할 수 있습니다.

* 플랫폼 간에 UI와 비즈니스 로직을 모두 공유하려면 [로직 및 UI 공유 튜토리얼](compose-multiplatform-new-project.md)을 참고하세요.
* UI 구현을 공유하지 않고 일부 코드만 공유하려면 [로직 공유 튜토리얼](multiplatform-upgrade-app.md)을 참고하세요.

다음 예제에서는 다양한 코드 공유 수준에서 ViewModel을 사용하는 방법을 보여줍니다.
모든 예제는 위에서 소개한 `OrderViewModel` 클래스를 기반으로 합니다.

### ViewModel과 UI 모두 공유 {id="shared-viewmodel-and-ui"}

이 접근 방식에서는 `ViewModel`과 UI를 포함한 모든 것이 Compose Multiplatform을 통해 공유됩니다.
앱의 UI 코드를 한 번만 작성하면 모든 플랫폼에서 동작합니다.

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

### ViewModel 공유 및 플랫폼별 UI 사용 {id="shared-viewmodel-and-platform-specific-ui"}

이 방식에서는 `ViewModel`(비즈니스 로직)은 공유되지만, 플랫폼별로 네이티브 UI 구현을 가집니다.
자세한 내용은 [Kotlin Multiplatform용 ViewModel 설정](https://developer.android.com/kotlin/multiplatform/viewmodel)을 참고하세요.

이 경우 UI가 공유되지 않으므로 ViewModel 라이브러리를 Compose Multiplatform 버전에서 `androidx.lifecycle` 라이브러리로 전환할 수 있습니다.

1. Gradle 버전 카탈로그에서 의존성을 업데이트합니다.

    ```toml
    [versions]
    androidx-viewmodel = "2.10.0"
    
    [libraries]
    androidx-lifecycle-viewmodel = { module = "androidx.lifecycle:lifecycle-viewmodel", version.ref = "androidx-viewmodel" }
    ```

2. 바이너리 프레임워크로 내보내야 하므로, `build.gradle.kts` 파일에서 의존성을 `api`로 선언합니다.

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

#### Android 구현 {id="android-implementation"}

Android에서는 Jetpack Compose가 `Activity`에서 제공하는 `ViewModelStoreOwner`를 자동으로 찾아 `OrderViewModel`을 제공합니다.

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

#### iOS 구현 {id="ios-implementation"}

iOS에는 내장된 `ViewModelStoreOwner`가 없으므로 ViewModel의 수명 주기를 SwiftUI에 수동으로 연결해야 합니다.
SwiftUI가 Kotlin Multiplatform ViewModel을 직접 관찰할 수 있도록 지원하고 iOS에 필요한 ViewModel 라이프사이클/Store-Owner 보일러플레이트를 처리해 주는 [KMP-ObservableViewModel](https://klibs.io/project/rickclephas/KMP-ObservableViewModel) 라이브러리를 사용하는 것을 권장합니다.

1. Swift에서 접근할 수 있도록 ViewModel API를 export합니다.
    
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

2. KMP-ObservableViewModel의 ViewModel 기본 클래스와 `@NativeCoroutinesState` 어노테이션을 사용하여 `commonMain`에 ViewModel을 정의합니다.
    
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
    
3. iOS UI 진입점에서 ViewModel을 사용합니다.
    
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

### 리포지토리/데이터 레이어 공유, 플랫폼별 ViewModel 및 UI 사용 {id="shared-repo-data-layer-platform-specific-viewmodels-and-ui"}

또 다른 옵션은 데이터 및 리포지토리 레이어만 공유하고 플랫폼별 ViewModel 구현을 사용하는 것입니다.
이를 통해 Android 의존성 주입을 위한 Hilt나 iOS의 Combine과 결합된 `ObservableObject`와 같이 각 플랫폼의 네이티브 패턴을 활용할 수 있습니다.

1. 데이터 로직이 포함된 공유 리포지토리 클래스를 생성합니다.

    ```kotlin
    class OrderRepository {
       fun calculatePrice(quantity: Int) = "$${quantity * 2}.00"
    }
    ```

2. 플랫폼별 ViewModel을 구현합니다.

   * Android에서는 표준 Android ViewModel을 사용하고 리포지토리를 주입합니다.

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

   * iOS에서는 `ObservableObject`를 사용하여 Swift로 ViewModel을 네이티브하게 구현합니다.

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

## 다음 단계 {id="what-s-next"}

* [전체 샘플 코드](https://github.com/JetBrains/compose-multiplatform/tree/master/examples/nav_cupcake)를 확인해 보세요.
* 추가적인 Android 중심 가이드는 [Kotlin Multiplatform용 ViewModel 설정](https://developer.android.com/kotlin/multiplatform/viewmodel)을 참고하세요.
* 공유 ViewModel을 네이티브 UI와 함께 사용할 때 [Compose Multiplatform을 SwiftUI와 통합하는 방법](compose-swiftui-integration.md)을 알아보세요.