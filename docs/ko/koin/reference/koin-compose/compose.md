---
title: Compose용 Koin
---

# Compose용 Koin

이 페이지에서는 Compose 패키지, Compose 앱에서 Koin을 시작하는 두 가지 방법, 그리고 Composable에서 의존성을 가져오기 위한 `koinInject()`에 대해 설명합니다. Jetpack Compose(Android)와 Compose Multiplatform에서 동일하게 작동합니다. [정의(definitions)](/docs/reference/koin-core/definitions) 및 [모듈(modules)](/docs/reference/koin-core/modules)을 선언하는 방법을 미리 숙지하고 있어야 합니다.

## 패키지 {id="packages"}

| 패키지 | 포함 내용 | 플랫폼 |
|---------|----------|-----------|
| `io.insert-koin:koin-compose` | `KoinApplication`, `koinInject`, 스코프 및 모듈 API | Multiplatform |
| `io.insert-koin:koin-compose-viewmodel` | `koinViewModel`, `koinActivityViewModel` (Android) | Multiplatform |
| `io.insert-koin:koin-compose-viewmodel-navigation` | `sharedKoinViewModel`, `KoinNavigationScope`, `navigationScope` | Multiplatform |
| `io.insert-koin:koin-compose-navigation3` | Navigation 3 항목 | Multiplatform |
| `io.insert-koin:koin-androidx-compose` | `koin-compose` + `koin-compose-viewmodel`, 그리고 `KoinActivityScope` 및 `KoinFragmentScope` | Android |
| `io.insert-koin:koin-androidx-compose-navigation` | 지원 중단된(Deprecated) `koinNavViewModel` 전용 | Android |

모든 Compose API는 멀티플랫폼 패키지에 포함되어 있습니다. `koin-androidx-compose`는 Android 프로젝트를 위한 편의용 아티팩트입니다:

```kotlin
// Android 앱
dependencies {
    implementation("io.insert-koin:koin-androidx-compose:$koin_version")
}

// Compose Multiplatform, commonMain 내부
commonMain.dependencies {
    implementation("io.insert-koin:koin-compose:$koin_version")
    implementation("io.insert-koin:koin-compose-viewmodel:$koin_version")
}
```

BOM 및 버전 카탈로그에 대한 내용은 [Gradle 설정](/docs/setup/gradle)을 참조하세요.

## Koin 시작하기 {id="starting-koin"}

두 가지 옵션이 있습니다. 앱당 하나를 선택하세요.

### Compose 외부에서 시작하기 {id="start-outside-compose"}

Android의 `Application` 클래스, KMP 프로젝트의 공유 `initKoin()` 함수와 같이 사용하는 플랫폼이 시작되는 위치에서 Koin을 시작합니다([KMP 설정](/docs/reference/koin-core/kmp-setup) 참조). 그러면 Compose는 추가 설정 없이 실행 중인 Koin 인스턴스를 사용합니다:

```kotlin
class MainApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        startKoin {
            androidContext(this@MainApplication)
            modules(appModule)
        }
    }
}

@Composable
fun App() {
    val repository = koinInject<UserRepository>()
}
```

Compose 외부의 코드(`Service`, `WorkManager` 워커, iOS Swift 코드) 또한 Composable 없이 실행되므로 Koin이 필요한 경우 이 옵션을 사용하세요.

### KoinApplication을 사용하여 Composable에서 시작하기 {id="start-from-a-composable-with-koinapplication"}

`KoinApplication`은 루트 Composable에서 Koin을 시작하고 이를 모든 하위 컴포넌트에 제공합니다:

**컴파일러 플러그인 DSL**
```kotlin
import org.koin.compose.KoinApplication
import org.koin.dsl.koinConfiguration

@Composable
fun App() {
    KoinApplication(
        configuration = koinConfiguration { modules(appModule) }
    ) {
        MainScreen()
    }
}
```

**어노테이션**
```kotlin
// di/Koin.kt
import org.koin.core.annotation.KoinApplication

@KoinApplication
object KoinApp
```

어노테이션과 Composable의 이름이 모두 `KoinApplication`이므로 서로 다른 파일로 분리하여 유지하세요.

```kotlin
// App.kt
import org.koin.compose.KoinApplication
import org.koin.plugin.module.dsl.koinConfiguration

@Composable
fun App() {
    KoinApplication(configuration = koinConfiguration<KoinApp>()) {
        MainScreen()
    }
}
```

`koinConfiguration<KoinApp>()`은 `@KoinApplication` 클래스의 모듈을 로드합니다. 옵션을 추가하려면 람다를 전달하세요: `koinConfiguration<KoinApp> { printLogger() }`.

**생성자 / 클래식 DSL**
```kotlin
import org.koin.compose.KoinApplication
import org.koin.dsl.koinConfiguration

@Composable
fun App() {
    KoinApplication(
        configuration = koinConfiguration { modules(appModule) }
    ) {
        MainScreen()
    }
}
```

`KoinApplication`이 자동으로 처리해 주는 작업:

- **플랫폼 설정**: Android에서는 애플리케이션 컨텍스트를 사용하여 `androidContext()`를 호출하고 `androidLogger()`를 설정합니다. 다른 플랫폼에서는 `printLogger()`를 설정합니다. `logLevel` 파라미터(기본값 `Level.INFO`)를 사용하여 로그 레벨을 변경할 수 있습니다.
- **기존 인스턴스**: Koin이 이미 시작된 경우, `KoinApplication`은 실행 중인 인스턴스에 연결되며 자체 구성(configuration)은 무시합니다.
- **수명 주기(Lifecycle)**: `KoinApplication`이 컴포지션(composition)을 벗어나도 Koin은 중지되지 않으므로 Android의 구성 변경(configuration change)이나 Activity 재생성 시에도 유지됩니다. 컴포지션이 완전히 폐기(abandoned)될 때만 중지됩니다.

`koinConfiguration { }`은 재사용 가능한 [KoinConfiguration](/docs/reference/koin-core/starting-koin)을 빌드하므로, `KoinApplication`, `startKoin` 및 테스트 간에 동일한 구성을 공유할 수 있습니다.

### 지원 중단된(Deprecated) 진입점 {id="deprecated-entry-points"}

| API | 상태 | 대체 방안 |
|-----|--------|-------------|
| `KoinApplication(application = { ... })` | 지원 중단됨(Deprecated) | `KoinApplication(configuration = koinConfiguration { ... })` |
| `KoinMultiplatformApplication(config)` | 지원 중단됨(Deprecated) | `KoinApplication(configuration)` |
| `KoinContext { }` | 지원 중단됨(Deprecated), 불필요 | 없음. Compose가 `startKoin`으로 시작된 인스턴스를 자동으로 찾습니다 |
| `KoinAndroidContext { }` | 지원 중단됨(Deprecated), 불필요 | 없음 |

## koinInject로 주입하기 {id="injecting-with-koininject"}

`koinInject()`는 현재 Koin 스코프([Compose 스코프](/docs/reference/koin-compose/compose-scopes)가 활성화되어 있지 않은 한 루트 스코프)에서 의존성을 확인(resolve)합니다:

```kotlin
import org.koin.compose.koinInject

@Composable
fun UserScreen() {
    val repository = koinInject<UserRepository>()
}
```

이를 기본 파라미터로 선언할 수도 있습니다. 이렇게 하면 Composable이 Koin과 정상적으로 동작하면서도, 테스트나 프리뷰에서 자체 인스턴스를 직접 전달할 수 있습니다:

```kotlin
@Composable
fun UserScreen(repository: UserRepository = koinInject()) {
    // ...
}
```

`koinInject()`는 한정자(qualifier), 스코프, 파라미터를 키로 사용하여 의존성 확인 과정을 `remember`로 감쌉니다. 동일한 키를 가진 리컴포지션(recomposition)은 다시 확인하지 않고 동일한 객체를 반환합니다.

### 한정자(Qualifier) 및 스코프 {id="qualifier-and-scope"}

```kotlin
@Composable
fun SyncScreen() {
    val localDb = koinInject<Database>(qualifier = named("local"))
    val cache = koinInject<SessionCache>(scope = sessionScope)
}
```

이름이 지정된 정의를 선언하는 방법은 [한정자(Qualifiers)](/docs/reference/koin-core/qualifiers)를 참조하세요.

### 파라미터 {id="parameters"}

람다 또는 `ParametersHolder`를 사용하여 [주입 파라미터(injected parameters)](/docs/reference/koin-core/injection-parameters)를 전달하세요:

```kotlin
@Composable
fun UserDetail(userId: String) {
    // 람다 형태
    val presenter = koinInject<UserPresenter> { parametersOf(userId) }

    // holder 형태
    val presenter2 = koinInject<UserPresenter>(parametersHolder = parametersOf(userId))
}
```

람다 형태를 사용할 경우, Koin은 값을 비교하기 위해 매 리컴포지션마다 람다를 호출합니다. holder 형태는 이 단계를 건너뛰므로 Koin 소스 코드에서는 성능상의 이유로 이 방식을 권장합니다. 파라미터는 값으로 비교되므로, `userId`가 변경되면 `koinInject()`는 새 인스턴스를 확인하여 반환합니다.

## Koin에 직접 접근하기 {id="accessing-koin-directly"}

| 함수 | 반환값 |
|----------|---------|
| `getKoin()` | 현재 컴포지션의 `Koin` 인스턴스 |
| `currentKoinScope()` | `koinInject()`가 기본적으로 사용하는 스코프 |

둘 다 `org.koin.compose`의 Composable 함수입니다. UI 코드에서는 가급적 `koinInject()`를 사용하세요.

## 프리뷰 {id="previews"}

Compose 프리뷰는 `Application` 클래스를 실행하지 않습니다. 프리뷰에 독립된 Koin 인스턴스를 제공하려면 `KoinApplicationPreview`를 사용하세요. 자세한 내용은 [Compose 테스트](/docs/reference/koin-compose/compose-testing)를 참조하세요.

## API 요약 {id="api-summary"}

| API | 목적 | 관련 페이지 |
|-----|---------|------|
| `KoinApplication(configuration) { }` | Compose에서 Koin 시작 | 현재 페이지 |
| `koinInject<T>()` | 모든 의존성 확인(resolve) | 현재 페이지 |
| `koinViewModel<T>()` | ViewModel 확인(resolve) | [Compose의 ViewModel](/docs/reference/koin-compose/compose-viewmodel) |
| `KoinScope`, `KoinNavigationScope` | Composable 또는 대상 화면(destination)에 바인딩된 스코프 | [Compose의 스코프](/docs/reference/koin-compose/compose-scopes) |
| `rememberKoinModules { }` | Composable과 함께 모듈 로드 | [동적 모듈](/docs/reference/koin-compose/compose-modules) |
| `KoinIsolatedContext` | 격리된 Koin 인스턴스 사용 | [격리된 컨텍스트(Isolated Context)](/docs/reference/koin-compose/isolated-context) |
| `navigation<T> { }`, `koinEntryProvider()` | Navigation 3 항목 | [Navigation 3](/docs/reference/koin-compose/navigation3) |

## 관련 문서 {id="related"}

- [Compose의 ViewModel](/docs/reference/koin-compose/compose-viewmodel): `koinViewModel()` 및 네비게이션 스코프가 지정된 ViewModel.
- [수명 주기 및 상태](/docs/reference/koin-compose/compose-lifecycle): 리컴포지션 전반에서 주입된 객체가 동작하는 방식.
- [KMP 설정](/docs/reference/koin-core/kmp-setup): Compose Multiplatform 프로젝트에서 Koin 시작하기.
- [Android에서 시작하기](/docs/reference/koin-android/start): `androidContext()` 및 Android `Application` 클래스.
- [Compose 테스트](/docs/reference/koin-compose/compose-testing): 프리뷰 및 UI 테스트.