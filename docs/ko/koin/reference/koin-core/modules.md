---
title: 모듈
---

# 모듈

모듈은 기능별 또는 계층(layer)별로 관련된 정의들을 그룹화합니다. 이 페이지에서는 모듈을 선언하고 결합하는 방법, 어노테이션이 지정된 클래스를 패키지에서 스캔하는 방법, 여러 Gradle 모듈에 걸쳐 모듈을 검색하는 방법, 그리고 모듈이 로드되는 순서를 다룹니다. 모듈 내부의 정의에 대해서는 [Definitions](/docs/reference/koin-core/definitions)를 참조하세요.

## 모듈 선언하기 {id="declare-a-module"}

**컴파일러 플러그인 DSL (Compiler Plugin DSL)**
```kotlin
import org.koin.dsl.module
import org.koin.plugin.module.dsl.*

val networkModule = module {
    single<ApiClient>()
    single<TokenManager>()
}

val dataModule = module {
    single<Database>()
    single<UserRepository>()
}
```

**어노테이션 (Annotations)**
```kotlin
@Module
@ComponentScan("com.myapp.network")
class NetworkModule

@Module
@ComponentScan("com.myapp.data")
class DataModule
```

`@Module` 클래스는 `@ComponentScan`으로 찾은 어노테이션 지정 클래스들과 내부에 선언된 프로바이더 함수들을 모읍니다([직접 소유하지 않은 클래스(Classes you don't own)](/docs/reference/koin-core/definitions#classes-you-dont-own) 참조).

**생성자 / 클래식 DSL (Constructor / Classic DSL)**
```kotlin
import org.koin.dsl.module
import org.koin.core.module.dsl.*

val networkModule = module {
    singleOf(::ApiClient)
    singleOf(::TokenManager)
}

val dataModule = module {
    singleOf(::Database)
    singleOf(::UserRepository)
}
```

하나의 정의는 다른 모듈의 정의에 의존할 수 있습니다. Koin은 로드된 모든 모듈을 통틀어 의존성을 해결(resolve)하므로, `dataModule`의 `UserRepository`는 모듈 간의 별도 import 없이도 `networkModule`의 `ApiClient`를 사용할 수 있습니다. 단, 두 모듈이 모두 로드되어 있어야 합니다([Koin 시작하기(Starting Koin)](/docs/reference/koin-core/starting-koin) 참조).

## `includes()`를 통한 모듈 결합 {id="module-composition-with-includes"}

하나의 모듈이 다른 모듈들을 포함할 수 있습니다. 부모 모듈을 로드하면 전체 트리가 함께 로드됩니다:

**컴파일러 플러그인 DSL (Compiler Plugin DSL)**
```kotlin
val networkModule = module {
    single<ApiClient>()
}

val storageModule = module {
    single<Database>()
}

val dataModule = module {
    includes(networkModule, storageModule)
    single<UserRepository>()
}

startKoin {
    modules(dataModule)
}
```

**어노테이션 (Annotations)**
```kotlin
@Module
class NetworkModule

@Module
class StorageModule

@Module(includes = [NetworkModule::class, StorageModule::class])
@ComponentScan("com.myapp.data")
class DataModule

@KoinApplication(modules = [DataModule::class])
class MyApp
```

**생성자 / 클래식 DSL (Constructor / Classic DSL)**
```kotlin
val networkModule = module {
    singleOf(::ApiClient)
}

val storageModule = module {
    singleOf(::Database)
}

val dataModule = module {
    includes(networkModule, storageModule)
    singleOf(::UserRepository)
}

startKoin {
    modules(dataModule)
}
```

`startKoin`에 긴 플랫(flat) 리스트를 나열하는 것보다 하나의 루트 모듈을 가진 `includes()` 트리를 구성하는 것을 권장합니다. 이렇게 하면 모듈의 구조가 코드 구조를 자연스럽게 따르게 되며, 시작 호출부도 간결하게 유지됩니다.

Koin은 트리를 평탄화(flatten)하여 여러 부모 모듈이 동일한 모듈을 포함하더라도 각 모듈을 한 번만 로드합니다:

```kotlin
val commonModule = module {
    single<Logger>()
}

val featureAModule = module {
    includes(commonModule)
    single<FeatureA>()
}

val featureBModule = module {
    includes(commonModule)
    single<FeatureB>()
}

val appModule = module {
    includes(featureAModule, featureBModule) // commonModule은 한 번만 로드됩니다
}
```

### 멀티 모듈 프로젝트에서의 가시성 (Visibility) {id="visibility-in-multi-module-projects"}

Gradle 멀티 모듈 프로젝트에서는 기능(feature)당 하나의 공개 모듈만 노출하고 나머지는 `private` 또는 `internal`로 유지하세요:

```kotlin
// Gradle 모듈 "feature-user"
private val userDataModule = module {
    single<UserDao>()
    single<UserCache>()
}

val userFeatureModule = module {
    includes(userDataModule)
    viewModel<UserViewModel>()
}
```

앱 모듈은 `userFeatureModule`만 로드하며 내부 모듈은 볼 수 없습니다. 여러 Gradle 모듈로 분할된 Android 앱의 전체적인 레이아웃은 [Multi-Module Apps](/docs/reference/koin-android/multi-module)를 참조하세요.

## @ComponentScan으로 패키지 스캔하기 {id="scan-packages-with-componentscan"}

`@ComponentScan`은 어노테이션 전용 기능입니다. 지정된 패키지 및 그 하위 패키지에 있는 어노테이션이 달린 모든 클래스와 최상위 함수를 수집합니다:

```kotlin
@Module
@ComponentScan
class AppModule // AppModule이 속한 패키지를 스캔합니다

@Module
@ComponentScan("com.myapp.features")
class FeatureModule

@Module
@ComponentScan("com.myapp.data", "com.myapp.network")
class InfraModule
```

값을 전달하지 않으면 어노테이션이 붙은 클래스가 위치한 패키지를 스캔합니다. 스캔은 Gradle 모듈 경계를 넘나들 수 있어서, 동일한 패키지에 속해 있다면 다른 Gradle 모듈의 클래스도 함께 찾아냅니다.

DSL 스타일에서는 모듈 내에 각 정의를 직접 나열해야 합니다. 두 가지 방식을 혼용하려면 시작 블록에서 어노테이션 기반 모듈과 함께 DSL 모듈을 포함시키면 됩니다([@KoinApplication을 사용한 타입 안전한 시작(Typed startup with @KoinApplication)](/docs/reference/koin-core/starting-koin#typed-startup-with-koinapplication) 참조).

## @Configuration을 통한 자동 검색 (Auto-discovery) {id="auto-discovery-with-configuration"}

`@Configuration`은 `@KoinApplication`이 모듈을 일일이 나열하지 않아도 찾을 수 있도록 `@Module`에 표시하는 어노테이션입니다. 이 모듈은 클래스패스에 있는 어떤 Gradle 모듈에든 위치할 수 있습니다:

```kotlin
// Gradle 모듈 "feature-user"
@Module
@Configuration
@ComponentScan("com.myapp.feature.user")
class UserFeatureModule

// Gradle 모듈 "app"
@KoinApplication
class MyApp

fun main() {
    startKoin<MyApp>() // UserFeatureModule을 로드합니다
}
```

따라서 기능을 추가할 때 Gradle 의존성만 추가하면 되며, 앱의 모듈 목록을 수정할 필요가 없습니다. 단점은 로드되는 모듈 목록이 한곳에 명시적으로 작성되지 않는다는 점입니다. 명시적인 관리를 원한다면 `@KoinApplication(modules = [...])`에 모듈을 직접 나열하세요.

`@Configuration`은 라벨(label)을 받을 수 있으므로, 환경이나 플레이버(flavor)마다 다른 모듈을 로드할 수 있습니다. 자세한 규칙은 [Configuration labels](/docs/reference/koin-core/starting-koin#configuration-labels)를 참조하세요.

`@Configuration`은 어노테이션 전용이며, 타입 기반 시작 방식(`startKoin<MyApp>()`)과 함께 `@KoinApplication`을 필요로 합니다.

## 로드 순서 및 오버라이드 (Load order and overrides) {id="load-order-and-overrides"}

로드된 두 모듈이 동일한 타입을 선언하는 경우, 마지막에 로드된 모듈이 우선합니다. DSL 시작 블록에서는 `modules(...)`에 나열된 순서가 이에 해당합니다:

```kotlin
startKoin {
    modules(productionModule, debugModule) // debugModule의 ApiService가 우선 적용됩니다
}
```

`@KoinApplication`을 사용할 때 컴파일러 플러그인은 다음 순서로 모듈 목록을 빌드합니다:

1. 코드 및 의존성에서 발견된 `@Configuration` 모듈.
2. `@KoinApplication(modules = [...])`에 선언된 순서대로 나열된 모듈.

따라서 앱의 모듈이 라이브러리의 기본값을 오버라이드할 수 있습니다:

```kotlin
// 라이브러리 내부
@Module
@Configuration
class CoreModule {
    @Singleton
    fun feature(): Feature = DefaultFeature()
}

// 앱 내부
@Module
class AppModule {
    @Singleton
    fun feature(): Feature = AppFeature()
}

@KoinApplication(modules = [AppModule::class])
class MyApp // get<Feature>()는 AppFeature를 반환합니다
```

명시적 목록 내부에서 `modules = [A::class, B::class, C::class]`는 A, B, C 순서로 로드되며, 각 모듈의 `includes`는 해당 모듈과 함께 그룹화된 상태를 유지합니다. 명시적으로 나열되면서 동시에 `@Configuration`에 의해 발견된 모듈은 명시적 목록에서의 위치에 따라 한 번만 로드됩니다. 여러 `@Configuration` 모듈 간의 순서를 제어하려면 명시적으로 나열하세요.

의도치 않은 오버라이드가 발생했을 때 시작 시점에 실패하도록 하려면 `allowOverride(false)`를 사용하세요. 단일 정의를 오버라이드하는 규칙은 [Overriding a definition](/docs/reference/koin-core/definitions#overriding-a-definition)을 참조하세요.

## 즉시 로딩 모듈 (Eager modules) {id="eager-modules"}

Koin이 시작될 때 전체 모듈의 모든 `single` 정의가 즉시 생성되도록 지정할 수 있습니다:

**컴파일러 플러그인 DSL (Compiler Plugin DSL)**
```kotlin
val coreModule = module(createdAtStart = true) {
    single<ConfigManager>()
    single<CrashReporter>()
}
```

**어노테이션 (Annotations)**
```kotlin
@Module(createdAtStart = true)
@ComponentScan("com.myapp.core")
class CoreModule
```

**생성자 / 클래식 DSL (Constructor / Classic DSL)**
```kotlin
val coreModule = module(createdAtStart = true) {
    singleOf(::ConfigManager)
    singleOf(::CrashReporter)
}
```

즉시 생성되는 정의가 많아질수록 시작 시간이 늘어납니다. 정의별 플래그 설정 및 비용에 대해서는 [Eager creation](/docs/reference/koin-core/definitions#eager-creation)을 참조하세요.

## 매개변수화된 모듈 (Parameterized modules) {id="parameterized-modules"}

DSL 모듈은 하나의 값(value)이므로 함수를 통해 인자로부터 모듈을 생성할 수 있습니다:

**컴파일러 플러그인 DSL (Compiler Plugin DSL)**
```kotlin
fun loggingModule(debug: Boolean) = module {
    if (debug) {
        single<DebugLogger>() bind Logger::class
    } else {
        single<ReleaseLogger>() bind Logger::class
    }
}

startKoin {
    modules(loggingModule(debug = BuildConfig.DEBUG))
}
```

**어노테이션 (Annotations)**
`@Module` 클래스는 인자를 받을 수 없습니다. 이 경우에는 DSL 모듈을 사용하거나, [configuration labels](/docs/reference/koin-core/starting-koin#configuration-labels)를 사용해 변형(variant)별로 하나의 `@Module`을 선택하도록 구성하세요.

**생성자 / 클래식 DSL (Constructor / Classic DSL)**
```kotlin
fun loggingModule(debug: Boolean) = module {
    single<Logger> {
        if (debug) DebugLogger() else ReleaseLogger()
    }
}

startKoin {
    modules(loggingModule(debug = BuildConfig.DEBUG))
}
```

동일한 개념으로 구현체를 교체할 수도 있습니다. `repositoryModule`은 그대로 두고, 각각 `Datasource`를 선언하는 `localDatasourceModule`이나 `remoteDatasourceModule` 중 하나를 함께 로드하는 방식입니다. 조건부 모듈 목록은 런타임에 결정되므로, 컴파일러 플러그인이 빌드 시점에 모든 조합을 검증할 수는 없습니다.

## 관련 문서 {id="related"}

- [Definitions](/docs/reference/koin-core/definitions): 모듈 내부에 들어가는 항목들.
- [Starting Koin](/docs/reference/koin-core/starting-koin): 모듈 로드, 타입 안전한 시작 및 구성 라벨.
- [Lazy Modules](/docs/reference/koin-core/lazy-modules): 백그라운드에서 모듈 로드하기.
- [KMP Shared Modules](/docs/reference/koin-core/kmp-shared-modules): 플랫폼 간 모듈 공유.
- [Multi-Module Apps](/docs/reference/koin-android/multi-module): Android에서 여러 Gradle 모듈에 걸쳐 모듈 구성하기.
- [Annotations Reference](/docs/reference/koin-annotations/annotations-inventory): `@Module`, `@ComponentScan`, `@Configuration`의 모든 매개변수 목록.