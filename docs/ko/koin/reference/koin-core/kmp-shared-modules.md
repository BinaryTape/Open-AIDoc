---
title: KMP 공유 패턴
---

# KMP 공유 패턴

이 페이지에서는 Kotlin Multiplatform 프로젝트에서 플랫폼별로 달라지는 정의를 선언하는 방법을 다룹니다. 여기에는 `expect`/`actual`을 사용하는 플랫폼 모듈, `expect`/`actual` 클래스, 그리고 플랫폼당 하나의 구현을 갖는 인터페이스가 포함됩니다. 프로젝트가 [KMP 설정](/docs/reference/koin-core/kmp-setup)과 같이 구성되어 있다고 가정합니다. `expect`/`actual`에 대한 Kotlin 규칙은 [Kotlin 문서](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html)를 참고하세요.

## 공통 모듈 구성하기 {id="organizing-shared-modules"}

플랫폼에 의존하지 않는 모든 것은 계층별 또는 기능별로 나누어 `commonMain` 모듈에 배치하고, `includes()`를 사용하여 결합합니다.

```kotlin
// commonMain
val dataModule = module {
    single<ApiClient>()
    single<UserRepository>()
}

val domainModule = module {
    factory<GetUserUseCase>()
}

val appModule = module {
    includes(dataModule, domainModule, platformModule())
}
```

모듈 구성에 대한 내용은 [모듈](/docs/reference/koin-core/modules)에서 설명합니다. 이 페이지의 나머지 부분은 플랫폼별로 달라지는 부분인 `platformModule()`에 대해 다룹니다.

## 플랫폼 모듈 {id="platform-module"}

`commonMain`에 `expect`로 모듈을 선언하고, 플랫폼마다 하나의 `actual`을 작성합니다. 각 플랫폼 모듈은 자체 클래스를 선언합니다.

**Compiler Plugin DSL**
```kotlin
// commonMain
interface PlatformComponent {
    fun getInfo(): String
}

expect fun platformModule(): Module
```

```kotlin
// androidMain
class AndroidComponent(private val context: Context) : PlatformComponent {
    override fun getInfo() = "Android ${context.packageName}"
}

actual fun platformModule(): Module = module {
    single<AndroidComponent>() bind PlatformComponent::class
}
```

```kotlin
// iosMain
class IOSComponent : PlatformComponent {
    override fun getInfo() = "iOS"
}

actual fun platformModule(): Module = module {
    single<IOSComponent>() bind PlatformComponent::class
}
```

**Annotations**
```kotlin
// commonMain
interface PlatformComponent {
    fun getInfo(): String
}

@Module
expect class PlatformModule
```

```kotlin
// androidMain
@Module
@ComponentScan
actual class PlatformModule

@Singleton
class AndroidComponent(private val context: Context) : PlatformComponent {
    override fun getInfo() = "Android ${context.packageName}"
}
```

```kotlin
// iosMain
@Module
@ComponentScan
actual class PlatformModule

@Singleton
class IOSComponent : PlatformComponent {
    override fun getInfo() = "iOS"
}
```

각 `actual` 모듈은 자체 소스 세트(source set)를 스캔하므로 해당 플랫폼의 클래스만 찾습니다. `@Singleton`은 클래스를 상위 타입에 바인딩하므로, `PlatformComponent`는 해당 플랫폼 클래스로 확인(resolve)됩니다. 공통 모듈에서 `PlatformModule`을 포함하려면 `@Module(includes = [PlatformModule::class])`를 사용합니다.

**Constructor / Classic DSL**
```kotlin
// commonMain
interface PlatformComponent {
    fun getInfo(): String
}

expect fun platformModule(): Module
```

```kotlin
// androidMain
actual fun platformModule(): Module = module {
    singleOf(::AndroidComponent) bind PlatformComponent::class
}
```

```kotlin
// iosMain
actual fun platformModule(): Module = module {
    singleOf(::IOSComponent) bind PlatformComponent::class
}
```

플랫폼별 구현에 서로 다른 생성자 파라미터가 필요한 경우 이 패턴을 사용하세요. 공통 코드는 `PlatformComponent` 인터페이스에만 의존하며, 각 플랫폼은 필요한 것을 자유롭게 주입할 수 있습니다(여기서는 Android의 `Context`). Android의 경우, 시작 시 `androidContext()`가 설정되면 `Context`가 확인됩니다([KMP 설정](/docs/reference/koin-core/kmp-setup) 참고).

### 플랫폼 라이브러리 {id="platform-libraries"}

플랫폼 드라이버와 엔진(SQLDelight, Ktor 클라이언트 엔진, 설정 등)은 함수 호출을 통해 빌드됩니다. 람다를 사용하여 플랫폼 모듈에 선언합니다.

```kotlin
// androidMain
actual fun platformModule(): Module = module {
    single<SqlDriver> { AndroidSqliteDriver(AppDatabase.Schema, androidContext(), "app.db") }
    single<HttpClientEngine> { OkHttp.create() }
}

// iosMain
actual fun platformModule(): Module = module {
    single<SqlDriver> { NativeSqliteDriver(AppDatabase.Schema, "app.db") }
    single<HttpClientEngine> { Darwin.create() }
}
```

그러면 공통 모듈은 플랫폼을 알 필요 없이 이를 기반으로 빌드할 수 있습니다: `single { AppDatabase(get()) }`, `single { HttpClient(get<HttpClientEngine>()) }`. 직접 소유하지 않은 클래스를 선언하는 다른 방법은 [정의](/docs/reference/koin-core/definitions)를 참고하세요.

## expect/actual 클래스 {id="expect-actual-class"}

클래스가 모든 플랫폼에서 동일한 생성자를 갖는 경우, 공통 코드에 한 번 선언하고 각 플랫폼에서 구현하도록 합니다.

**Compiler Plugin DSL**
```kotlin
// commonMain
expect class NativeComponent() {
    fun getInfo(): String
}

val nativeComponentModule = module {
    single<NativeComponent>()
}
```

```kotlin
// androidMain
actual class NativeComponent actual constructor() {
    actual fun getInfo() = "Android NativeComponent"
}

// iosMain
actual class NativeComponent actual constructor() {
    actual fun getInfo() = "iOS NativeComponent"
}
```

**Annotations**
```kotlin
// commonMain
@Module
@ComponentScan
class NativeComponentModule

@Singleton
expect class NativeComponent() {
    fun getInfo(): String
}
```

```kotlin
// androidMain
@Singleton
actual class NativeComponent actual constructor() {
    actual fun getInfo() = "Android NativeComponent"
}

// iosMain
@Singleton
actual class NativeComponent actual constructor() {
    actual fun getInfo() = "iOS NativeComponent"
}
```

공통 `@Module` 클래스의 프로바이더 함수를 통해 `expect` 클래스를 선언할 수도 있습니다.

```kotlin
// commonMain
@Module
class NativeModule {
    @Factory
    fun nativeComponent(): NativeComponent = NativeComponent()
}
```

**Constructor / Classic DSL**
```kotlin
// commonMain
expect class NativeComponent() {
    fun getInfo(): String
}

val nativeComponentModule = module {
    singleOf(::NativeComponent)
}
```

`actual` 클래스는 다른 탭과 동일합니다.

`expect` 클래스는 모든 플랫폼에 대해 단 하나의 생성자 계약(contract)을 갖습니다. 특정 플랫폼에 다른 의존성(예: Android `Context`)이 필요한 경우, 해당 플랫폼에만 이를 추가할 수 없습니다. 대신 인터페이스를 사용하는 [플랫폼 모듈](#platform-module) 패턴이나 플랫폼 래퍼를 사용하세요([KMP 플랫폼 연동](/docs/reference/koin-mp/kmp) 참고).

## 단일 플랫폼에만 존재하는 컴포넌트 {id="components-on-one-platform-only"}

플랫폼 모듈은 다른 곳에는 없고 특정 플랫폼에만 존재하는 클래스를 선언할 수 있습니다. 다른 플랫폼에서는 빈 모듈을 유지합니다.

**Compiler Plugin DSL**
```kotlin
// androidMain
actual fun platformModule(): Module = module {
    single<NotificationHelper>()
}

// iosMain
actual fun platformModule(): Module = module { }
```

**Annotations**
```kotlin
// androidMain
@Module
@ComponentScan("com.example.app.android")
actual class PlatformModule

// iosMain: 선언할 항목 없음
@Module
actual class PlatformModule
```

**Constructor / Classic DSL**
```kotlin
// androidMain
actual fun platformModule(): Module = module {
    singleOf(::NotificationHelper)
}

// iosMain
actual fun platformModule(): Module = module { }
```

이렇게 하면 Android 코드만 `NotificationHelper`를 사용할 수 있습니다. 이 클래스는 `commonMain`에 존재하지 않으므로 공통 코드에서는 참조할 수 없습니다.

## 패턴 선택하기 {id="choosing-a-pattern"}

| 상황 | 패턴 |
|-----------|---------|
| 모든 플랫폼에서 동일한 생성자 | `expect`/`actual` 클래스 |
| 플랫폼마다 다른 생성자 파라미터 | 공통 코드의 인터페이스, 플랫폼 모듈의 구현체 |
| 함수로 빌드되는 플랫폼 라이브러리 (드라이버, 엔진) | 플랫폼 모듈의 람다 |
| 단일 플랫폼에만 존재하는 클래스 | 플랫폼 모듈 (다른 플랫폼에서는 빈 모듈) |
| 공유 코드에서 Android `Context`가 필요한 경우 | 플랫폼 래퍼, [KMP 플랫폼 연동](/docs/reference/koin-mp/kmp) 참고 |

## 제한 사항 {id="limits"}

- **수동 연결 (Manual wiring)**: 프로바이더 함수가 Koin `Scope`를 전달받아 직접 `scope.get()`을 호출하는 경우, 해당 호출은 동적이므로 [컴파일 타임 안전성](/docs/reference/koin-compiler/compile-safety)이 보장되지 않습니다. 생성자 파라미터를 사용하는 것을 권장합니다.
- **테스트**: 공유 모듈은 `commonTest`에서 테스트할 수 있습니다. 자세한 내용은 [테스팅](/docs/reference/koin-test/testing)을 참고하세요.

## 관련 문서 {id="related"}

- [KMP 설정](/docs/reference/koin-core/kmp-setup): 의존성 및 공유 `initKoin` 함수.
- [KMP 플랫폼 연동](/docs/reference/koin-mp/kmp): 공유 코드의 Android Context, Swift 상호 운용성(interop), 데스크톱 및 웹.
- [모듈](/docs/reference/koin-core/modules): `includes()`, `@Module`, `@ComponentScan`, `@Configuration`.
- [정의](/docs/reference/koin-core/definitions): 바인딩, 프로바이더 함수, 직접 소유하지 않은 클래스.
- [ViewModel](/docs/reference/koin-core/viewmodel): `commonMain`에 선언된 ViewModel.