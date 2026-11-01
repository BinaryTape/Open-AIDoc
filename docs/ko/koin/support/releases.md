---
title: 릴리스 및 업그레이드 가이드
---

# 릴리스 및 업그레이드 가이드

이 페이지에는 Koin의 주요 릴리스가 모두 나열되어 있어 업그레이드를 계획하고 호환성을 확인할 수 있습니다. 각 버전은 동일한 구조를 따릅니다.

- **Kotlin**: Koin이 빌드된 Kotlin 버전입니다.
- **New**: 새로운 기능 및 개선 사항입니다.
- **Experimental**: 향후 변경될 수 있는 `@KoinExperimentalAPI`로 표시된 API입니다.
- **Deprecated**: 제거 예정으로 표시된 API 및 대체 API입니다.
- **Breaking**: 업그레이드 시 코드 수정이 필요한 변경 사항입니다.
- **Bug fixes**, **Improvements**, **Library updates**: 해당 릴리스에 존재하는 경우 표시됩니다.

Experimental(실험적) 및 Deprecated(지원 중단 예정)의 의미는 [API 안정성](/docs/support/api-stability)에 정의되어 있습니다.

## 버전 목록 {id="versions"}

| 버전 | Kotlin | 상태 | 주요 변경 사항 |
|---------|--------|--------|--------------|
| [4.2.2](#422) | 2.3.20 | Stable | Resolver 회귀 버그 수정, ViewModel 및 scope 수정, tvOS 지원, R8/ProGuard 규칙 |
| [4.2.1](#421) | 2.3.20 | 이전 Stable | Scope resolution 수정, ABI 복구, 성능 개선 |
| [4.2.0](#420) | 2.3.20 | 이전 Stable | `@KoinApplication` 및 `@Configuration`, Ktor 3.4 DI 브리지, Navigation 3, Dagger 브리지 |
| [4.1.1](#411) | 2.1.21 | 이전 Stable | Navigation 개선 사항, resolver 성능 |
| [4.1.0](#410) | 2.1.20 | 이전 Stable | Scope archetype, 기능 옵션, Ktor KMP |
| [4.0.4](#404) | 2.0.21 | 이전 Stable | Stable ViewModel API, UUID 생성 |
| [3.5.6](#356) | 1.9.22 | LTS | Kotlin 1.x를 위한 장기 지원(LTS) 라인, 격리된 컨텍스트 |
| [3.4.3](#343) | 1.8.21 | Legacy | Verification API, ExtensionManager |

현재 버전: Koin 4.2.2, Koin Compiler Plugin 1.2.1 ([Koin Compiler Plugin](#koin-compiler-plugin) 참조).

:::note
두 개의 LTS 라인이 병행 유지 관리됩니다. Kotlin 1.x 프로젝트를 위한 Koin 3.5.6과 Kotlin 2.x 프로젝트를 위한 Koin 4.2.x입니다. 사용하는 Kotlin 기준 버전에 맞는 것을 선택하세요. 지원 정책은 [장기 지원(LTS)](/docs/support/#long-term-support-lts)을 참조하세요.
:::

## 4.2.2 {id="4-2-2"}

Kotlin `2.3.20`.

4.2.x 라인의 유지보수 릴리스: 4.2.0의 `CoreResolverV2` 재작성으로 인해 발생한 resolver 회귀 버그 수정, ViewModel 및 scope 수정, Ktor request scope 수정, tvOS 지원 및 R8/ProGuard 규칙 추가.

:::warning
4.2.0 또는 4.2.1에서 resolver 문제가 발생하는 경우 4.2.2로 업그레이드하세요.
:::

### New {id="new"}

`koin-core-viewmodel`
- tvOS 타깃(`tvosArm64`, `tvosX64`, `tvosSimulatorArm64`) 지원으로 tvOS에서 ViewModel을 사용할 수 있습니다.

`koin-android` / `koin-core-viewmodel`
- AAR에 소비자 R8/ProGuard 규칙이 포함되며, 새로운 R8/ProGuard 가이드가 제공됩니다.

### Bug fixes {id="bug-fixes"}

`koin-core`
- #2370, #2408 수정: 스택에 쌓인 파라미터(`parametersOf`)가 한정자를 사용한 `get(named(...))` 요청을 가리던(shadowing) 문제를 수정했습니다. 이제 한정자 조회의 경우 파라미터 스택을 참조하지 않고 레지스트리만 읽습니다.
- #2379 수정: 자식 scope에서 조회할 때 루트 scope에 정의된 non-`single` 팩토리의 scoped 의존성이 요청한 scope가 아닌 `_root_`를 기준으로 해결되던 문제를 수정했습니다. 이제 연결된 scope(linked-scope) resolution은 요청한 scope를 기준으로 팩토리를 실행합니다.
- #2299 수정: `viewModelScopeFactory()`로 생성된 scope가 원래 scope에 연결되지 않아 부모에 선언된 의존성을 해결할 수 없던 문제를 수정했습니다. 이제 생성된 scope가 부모 scope에 연결됩니다(부모가 루트인 경우 제외).
- #2348 수정: 검사되지 않은 map 캐스팅으로 인해 `String`이 아닌 값을 가진 환경 변수나 시스템 프로퍼티를 로드할 때 `ClassCastException`이 발생하던 문제를 수정했습니다. 이제 `String`이 아닌 값은 `Any`로 유지됩니다.
- #2044, #2417 수정: 적절한 extras 없이 `SavedStateHandle`을 해결하거나 `viewModelScopeFactory()` 옵션 없이 `viewModelScope { }`를 사용할 때 조치 가능한 명확한 오류 메시지를 제공합니다.

`koin-ktor`
- #2410 수정: 동시 요청 시 request scope ID가 충돌할 수 있던 문제를 수정했습니다. 이제 시작 시 한 번 시드된 단조 증가 카운터에서 ID가 생성됩니다(@lfavreli-betclic 기여).

### Improvements {id="improvements"}

`koin-core`
- `bind()` 및 `binds()`가 각 바인딩마다 타입 목록을 재할당하는 대신 O(1)로 보조 타입을 추가합니다. 이를 통해 정의에 여러 바인딩이 선언되어 있을 때 발생하는 2차(quadratic) 비용을 제거합니다.

### Documentation {id="documentation"}

- [Navigation 3 레퍼런스](/docs/reference/koin-compose/navigation3)에서 타입이 지정된 `entryProvider`와 함께 Koin을 사용하는 방법에 대한 안내(#2336).

## 4.2.1 {id="4-2-1"}

Kotlin `2.3.20`.

4.2.0 기반의 패치 릴리스: scope resolution 수정, ABI 복구 및 진단 개선.

### New

`koin-core`
- 더욱 명확해진 scope resolution 오류 메시지.

### Bug fixes

`koin-core`
- #2387 수정: `CoreResolverV2`가 연결된 scope에서 스택 파라미터 조회를 유실하던 문제를 수정했습니다.
- `runOnKoinStarted`의 ABI 호환성을 복구했습니다. 회귀를 방지하기 위해 CI에서 API 검사가 실행됩니다.
- 닫힌 scope에 대한 동시성 문제 수정(volatile 플래그, @inemtsev 기여).
- scoped `ViewModel` 및 `SavedStateHandle` ViewModel에 대한 테스트가 추가되었습니다.

## 4.2.0 {id="4-2-0"}

Kotlin `2.3.20`. 모든 라이브러리 버전은 [libs.versions.toml](https://github.com/InsertKoinIO/koin/blob/4.2.0/projects/gradle/libs.versions.toml)에 있습니다.

### New

`koin-core`
- 새로운 `CoreResolverV2`: 스택 파라미터에 대한 빠른 접근, 자식 scope 및 ViewModel scope resolution, scope당 최적화된 `ThreadLocal` 로딩.
- `KoinApplication.withConfiguration<T>()` 확장: `KoinApplication`을 [Koin Compiler Plugin](#koin-compiler-plugin)에 의해 `@KoinApplication` 클래스에서 검색된 모듈과 연결합니다.
- `koinConfiguration<T>()` DSL: 어노테이션이 달린 클래스로부터 `KoinConfiguration`을 빌드하기 위한 Compiler Plugin 진입점.
- scope resolution 및 스레드 안정성에 대한 성능 최적화.

`koin-android`
- `koinActivityInject`: 현재 `Activity` scope에서 의존성을 가져옵니다.

`koin-androidx-startup`
- `onKoinStartup { }`: AndroidX Startup `Initializer` API를 통해 Koin을 시작합니다.
- `KoinConfiguration` 타입 및 `KoinStartup` 업데이트(`KoinInitializer`는 실험적 기능으로 유지).

`koin-ktor`: Ktor 3.4 통합
- 공식 Ktor 3.4 DI API를 기반으로 구축된 새로운 Koin 및 Ktor DI 브리지.
- `KoinDependencyMap`: Koin이 Ktor DI를 통해 직접 인스턴스를 해결합니다.
- `KoinKtorApplication`: Ktor에서 Koin으로, Koin에서 Ktor로의 연결을 위한 명시적 옵션을 제공하는 DSL 브리지.
- 이제 `Application.koinModule` 및 `Application.koinModules` 확장이 모듈을 선언하는 권장 방식입니다.

`koin-compose-navigation3` (신규 모듈)
- Jetpack Navigation 3(안정 버전 1.0.0) 지원.
- 제네릭 `EntryProvider`: 네비게이션 항목에 메타데이터 파라미터(애니메이션 등) 전달 가능.
- Compose Navigation 2를 위한 네비게이션 scope 헬퍼.

`koin-dagger-bridge` (신규 모듈)
- Dagger에서 Koin으로 점진적으로 마이그레이션할 수 있도록 Dagger 측에서 Koin 컴포넌트를 주입.

`koin-core-annotations` (Compiler Plugin에서 사용)
- `@KoinApplication`: 클래스를 Koin 애플리케이션 진입점으로 표시합니다. 이후 `startKoin<MyApp>()`이 검색된 모든 `@Configuration` 모듈을 조합합니다.
- `@Configuration("name")`: `@Module` 클래스들을 configuration으로 그룹화합니다(예: `prod`, `test`, `default`). 동일한 configuration 레이블을 가진 모듈들은 서로의 정의를 참조할 수 있습니다.
- `@PropertyValue("key")`: `@Property` 주입을 위한 기본값.
- `@ScopeId(name = "...")` 및 `@ScopeId(MyScope::class)`: 이름이 지정된 Koin scope에서 값을 주입합니다.
- `@Monitor`: 어노테이션이 달린 함수를 Kotzilla SDK 트레이싱(실행 시간)으로 래핑합니다. [@Monitor](/docs/tooling/monitor)를 참조하세요.
- `@Provided`가 전체 안전성 그래프에서 인식됨: 외부에서 제공되는 타입에 대해 컴파일 타임 검증을 건너뜁니다.

### Experimental {id="experimental"}

`koin-core`
- `@KoinApplication(modules = [...])`: 명시적인 `modules` 배열을 통해 진입점이 자동 검색을 건너뛰고 고정된 모듈 목록을 사용할 수 있습니다.

`koin-androidx-startup`
- `koin-androidx-startup` API 전체가 실험적 상태로 유지됩니다. `KoinInitializer`는 `@KoinExperimentalAPI`로 표시됩니다.

### Deprecated {id="deprecated"}

`koin-android` / `koin-android-annotation`
- `org.koin.android.annotation.KoinViewModel`이 지원 중단되었습니다. `org.koin.core.annotation.KoinViewModel`을 사용하세요.

`koin-ktor`
- `koin-ktor3` 아티팩트가 `koin-ktor`로 통합되었습니다(4.1.0에서 deprecated, 4.2.0에서 완전히 통합됨).

### Breaking {id="breaking"}

`koin-android`
- Koin이 사용하는 AndroidX 라이브러리에 맞추기 위해 최소 SDK가 21에서 23으로 상향 조정되었습니다.

`koin-compose-navigation3`
- 최소 API 레벨 23.

`koin-core`
- `Module.getAll(...)`이 더 이상 결과를 정렬하지 않습니다. 인스턴스는 선언 순서대로 반환됩니다. 특정 순서에 의존하는 경우 명시적으로 정렬해야 합니다.

## Koin Compiler Plugin {id="koin-compiler-plugin"}

현재 버전: `1.2.1`. Koin `4.2.0` 이상 및 Kotlin K2 컴파일러가 필요합니다(`2.3.20`, `2.4.0`, `2.4.10`, `2.4.20`에서 검증됨).

Koin Compiler Plugin은 네이티브 Kotlin 컴파일러 플러그인입니다. KSP 기반의 Koin Annotations 프로세서를 대체하며, KSP 단계 없이 Kotlin 컴파일의 일부로 실행됩니다. 설치 및 Gradle 옵션은 [Compiler Plugin Setup](/docs/setup/compiler-plugin) 및 [Compiler Plugin Options](/docs/reference/koin-annotations/options)를 참조하세요. 검증 대상 항목은 [Compile-Time Safety](/docs/reference/koin-compiler/compile-safety)에서 확인할 수 있습니다. JVM, JS, Wasm, iOS, macOS, watchOS, tvOS, Linux, Windows 등 모든 Kotlin Multiplatform 타깃을 지원합니다.

`koin-ksp-compiler`에서 마이그레이션하려면 [KSP에서 컴파일러 플러그인으로 마이그레이션하기](/docs/migration/from-ksp-to-compiler-plugin)를 참조하세요.

### 1.2.1 {id="1-2-1"}

Kotlin 2.4.20 지원 및 실제 KMP 앱에서 발견된 두 가지 버그 수정.

- **Kotlin 2.4.20**: 1.2.0에서는 Kotlin 2.4.20 기반의 모든 프로젝트가 IR 생성 중 `NoSuchMethodError`와 함께 실패했습니다(#89, #99). Kotlin 2.4.20에서 플러그인이 사용하던 네 가지 컴파일러 API가 제거되거나 시그니처가 변경되었습니다. 네 가지 모두 수정되었습니다.
- **KLIB 수정**: `@Configuration` 모듈이 의존성을 통해 전달될 때 `componentscan_*` 힌트에서 wasmJs, JS 및 Kotlin/Native 빌드가 `Different declarations with the same signatures were detected` 오류로 실패하던 문제를 수정했습니다. JVM 및 Android는 영향을 받지 않았습니다.
- **한정자(Qualifier) 수정**: 모듈 전반에 걸쳐 읽을 때 하나의 타입에 대한 두 개의 `@Named` 프로바이더가 하나로 병합되어 잘못된 `KOIN-D001` 오류가 발생하던 문제를 수정했습니다. 거짓 D001 오류로 인해 `compileSafety`를 비활성화했다면 다시 켜고 확인해 보세요.
- **엄격한 Kotlin 버전 검사**: 이제 해당 버전이 정확히 확인된 경우에만 검증된 Kotlin 버전으로 간주됩니다. 검증되지 않은 버전은 경고를 표시하고 빌드를 계속 진행하며 차단하지는 않습니다.

자세한 내용은 [1.2.1 릴리스 노트](https://github.com/InsertKoinIO/koin-compiler-plugin/releases/tag/1.2.1)를 참조하세요.

### 1.2.0 {id="1-2-0"}

컴파일 타임 안전성이 이제 전체 Koin DSL에 적용되며, 모듈 간 `includes`가 더 이상 정의를 숨기지 않습니다.

- **생성자 DSL 검증**: `singleOf(::T)`, `factoryOf(::T)`, `scopedOf(::T)`, `viewModelOf(::T)` 및 `Scope.new(::T)`가 `single<T>()`와 동일하게 누락된 의존성 및 한정자 검사를 받습니다. 여기서 검사되지 않던 누락된 의존성에 의존하던 코드는 이제 컴파일에 실패합니다. 이는 버그 회귀가 아니라 기존의 빈틈을 메운 것입니다.
- **새로운 진입점**: `KoinApplication.withConfiguration<T>()` 및 Ktor의 `install(Koin) { modules(...) }`.
- **모듈 목록**: `startKoin { modules(myList) }`가 `listOf`, `+`, `.toList()` 및 `List<Module>`을 반환하는 함수를 해석합니다. 런타임에 분기되는 목록은 해석되지 않은 상태로 유지되며, `KOIN-W003`이 해당 호출 위치를 가리킵니다.
- **모듈 함수**: `fun myModule(): Module = module { ... }`가 최상위 `val`처럼 추적됩니다.
- **모듈 간 문제 수정**: `@Module(includes)`(#82), `@Configuration` 자동 검색 및 DSL `includes(...)`를 통해 두 번 이상의 `implementation` 홉을 거친 정의를 인식하지 못하던 문제를 수정했습니다. 이제 복수형 `binds(...)`가 인식되며, `@Module(includes)`가 한정자만 다른 프로바이더를 병합하지 않습니다(#94).
- **직접 작성한 람다**: `single { X(get()) }`을 생성자에서 추측하는 대신 자체 `get()` 호출을 통해 검증합니다. 이를 통해 잘못된 `KOIN-D004` 순환 참조 오류가 제거됩니다.

자세한 내용은 [1.2.0 릴리스 노트](https://github.com/InsertKoinIO/koin-compiler-plugin/releases/tag/1.2.0)를 참조하세요.

### 1.1.0 {id="1-1-0"}

전체 그래프 검증만 지원합니다. 각 Koin 진입점(`startKoin`, `koinApplication`, `@KoinApplication`)에서 한 번의 전체 그래프 검사를 수행하도록 변경하여 모듈별 검증을 제거했습니다. 이를 통해 모듈 간에 발생하던 실제 오탐(false positive)을 제거했습니다. 이에 따른 트레이드오프: 자체 컴파일 내에 고유한 진입점이 없는 리프(leaf) 모듈이나 라이브러리 모듈은 주변에 실제 그래프가 조합될 때까지 컴파일 타임 안전성 진단 결과를 받을 수 없습니다.

자세한 내용은 [1.1.0 릴리스 노트](https://github.com/InsertKoinIO/koin-compiler-plugin/releases/tag/1.1.0)를 참조하세요.

## 4.1.1 {id="4-1-1"}

Kotlin `2.1.21`.

### New

`koin-compose-viewmodel-navigation`
- Compose Navigation을 위해 `sharedKoinViewModel`에 선택적 `navGraphRoute` 파라미터가 추가되었습니다.

`koin-core`
- 코어 resolver 최적화: 단일 scope에서 해결할 때 불필요한 평탄화(flattening)를 수행하지 않습니다.
- Scope 디버깅 시 연결된 scope ID를 표시합니다.

### Library updates {id="library-updates"}

- Kotlin: 2.1.21 (2.1.20에서 업데이트)
- Ktor: 3.2.3 (3.1.3에서 업데이트)
- JetBrains Compose: 1.8.2 (1.8.0에서 업데이트)
- AndroidX: Fragment 1.8.9, WorkManager 2.10.3, Lifecycle 2.9.3, Navigation 2.9.3
- Testing: Robolectric 4.15.1, Benchmark 0.4.14
- Build: Binary Validator 0.18.1, NMCP 1.1.0

### Bug fixes

`koin-core`
- 호환성 오류를 유발하던 로거 제약 조건을 되돌렸습니다.
- 더 나은 `LocalKoinApplication` 및 `LocalKoinScope` 컨텍스트 처리를 통해 Compose scope resolution을 수정했습니다.

`koin-build`
- Maven Central 배포 문제를 수정했습니다.

## 4.1.0 {id="4-1-0"}

Kotlin `2.1.20`.

### New

`koin-core`
- Koin 구성을 래핑하는 `KoinConfiguration` API.
- Scope archetype: scope 카테고리를 위한 전용 scope 타입 한정자. 이제 scope 카테고리(archetype)를 기준으로 인스턴스를 해결할 수 있습니다.
- 기능 옵션: Koin 내부의 새로운 동작을 위한 기능 플래그. Koin 구성의 `options` 블록에서 옵션을 활성화할 수 있습니다.
```kotlin
startKoin {
    options(
        // 새로운 기능 활성화
        viewModelScopeFactory()
    )
}
```
- 외부 시스템이나 리소스에서 Koin이 의존성을 해결할 수 있도록 지원하는 `ResolutionExtension`을 갖춘 새로운 `CoreResolver` (Ktor DI 연동에 사용됨).

`koin-android`
- 라이브러리 업그레이드(`androidx.appcompat:appcompat:1.7.0`, `androidx.activity:activity-ktx:1.10.1`)로 최소 SDK가 14에서 21로 상향되었습니다.
- Activity 또는 Fragment를 위한 scope를 선언하는 모듈 DSL 확장 `activityScope`, `activityRetainedScope`, `fragmentScope`.
- `activityScope()`, `activityRetainedScope()`, `fragmentScope()` 함수가 이제 scope archetype을 사용합니다.

`koin-androidx-compose`
- Koin Compose Multiplatform, Compose 1.8 및 Lifecycle 2.9와 정렬되었습니다.

`koin-compose`
- Compose 1.8 및 Lifecycle 2.9와 정렬되었습니다.
- Android Studio 및 IntelliJ IDEA에서 병렬로 미리보기를 렌더링하기 위한 `KoinApplicationPreview`.

`koin-compose-viewmodel`
- 부모 Activity를 ViewModel 호스트로 사용하기 위한 `koinActivityViewModel`.

`koin-ktor`
- Multiplatform: 이제 모듈이 Kotlin Multiplatform용으로 빌드됩니다. 멀티플랫폼 프로젝트에서 `koin-ktor`를 사용할 수 있습니다.
- 이전 `koin-ktor3` 모듈이 `koin-ktor`에 통합되었습니다.
- Ktor 모듈 내에서 직접 Koin 모듈을 선언하기 위한 `Application.koinModule { }` 및 `Application.koinModules()`:
```kotlin
fun Application.customerDataModule() {
    koinModule {
        singleOf(::CustomerRepositoryImpl) bind CustomerRepository::class
    }
}
```
- `Module.requestScope`: `scope<RequestScope>`를 수동으로 선언하지 않고 Ktor request scope 내에 정의를 선언할 수 있습니다. request scope는 생성자에서 `ApplicationCall`을 주입받을 수도 있습니다.

`koin-core-coroutines`
- `ModuleConfiguration`: 나중에 검증할 수 있도록 모듈 구성을 하나의 구조로 모읍니다.
```kotlin
val m1 = module {
    single { Simple.ComponentA() }
}
val lm1 = lazyModule {
    single { Simple.ComponentB(get()) }
}
val conf = moduleConfiguration {
    modules(m1)
    lazyModules(lm1)
}
```
- Koin 구성은 `ModuleConfiguration`에서 모듈을 로드할 수 있습니다:
```kotlin
startKoin {
    moduleConfiguration {
        modules(m1)
        lazyModules(lm1)
    }
}

// 또는 다음과 같이 사용 가능
val conf = moduleConfiguration {
    modules(m1)
    lazyModules(lm1)
}

startKoin {
    moduleConfiguration(conf)
}
```

`koin-test-coroutines`
- 코루틴 관련 테스트 API를 위한 새로운 `koin-test-coroutines` 모듈.
- Verify API는 모듈과 지연 로딩 모듈(lazy modules)을 함께 엮어 `moduleConfiguration`을 검사할 수 있습니다:
```kotlin
val conf = moduleConfiguration {
    modules(m1)
    lazyModules(lm1)
}

conf.verify()

// Android 타입을 사용하려는 경우 (koin-android-test)
conf.verify(extraTypes = androidTypes)
```

`koin-core-annotations`
- `@InjectedParam` 및 `@Provided`는 프로퍼티를 주입된 파라미터나 동적으로 제공되는 파라미터로 표시합니다. 현재는 `Verify` API에서 사용됩니다.

### Experimental

`koin-core`
- Wasm: Kotlin 2.1.20 UUID 생성을 사용합니다.

`koin-core-viewmodel`
- ViewModel scope archetype으로 범위가 지정된 컴포넌트를 선언하기 위한 모듈 DSL 확장 `viewModelScope`.
- ViewModel 클래스에 연결된 scope를 생성하는 `viewModelScope()` 함수. scope를 닫기 위해 `ViewModelScopeAutoCloseable`(`AutoCloseable` API)을 사용하므로, 더 이상 ViewModel scope를 수동으로 닫지 않아도 됩니다.
- 업데이트된 `ScopeViewModel` 클래스: scope 생성과 종료를 처리하는 바로 사용 가능한 ViewModel 범위 클래스입니다.
- `viewModelScopeFactory` 옵션을 사용한 ViewModel의 scope로부터의 생성자 주입:
```kotlin
startKoin {
    options(
        // 새로운 ViewModel scope 생성 활성화
        viewModelScopeFactory()
    )
}

// MyScopeViewModel의 scope에서 Session을 주입받음
class MyScopeViewModel(val session: Session) : ViewModel()

module {
    viewModelOf(::MyScopeViewModel)
    viewModelScope {
        scopedOf(::Session)
    }
}
```

`koin-compose`
- `KoinMultiplatformApplication` 함수: Compose Multiplatform 진입점.

`koin-core-viewmodel-navigation`
- 네비게이션 `NavBackStackEntry`에서 ViewModel 인스턴스를 재사용하기 위한 `sharedViewModel` 확장.

`koin-test`
- 이제 `Verify` API가 nullable, 지연 로딩(lazy), 목록(list) 파라미터를 검사합니다. Verify 호출 시 선언하는 대신, 프로퍼티에 `@InjectedParam` 또는 `@Provided`를 붙여 주입된 파라미터나 동적으로 제공되는 값으로 선언하세요.
```kotlin
// 이제 Verify에서 감지됨
class ComponentB(val a: ComponentA? = null)
class ComponentBParam(@InjectedParam val a: ComponentA)
class ComponentBProvided(@Provided val a: ComponentA)
```

### Deprecated

`koin-android`
- `ScopeViewModel`이 지원 중단되었습니다. `koin-core-viewmodel`의 `ScopeViewModel` 클래스를 사용하세요.

`koin-compose`
- `KoinContext`가 지원 중단되었으며 제거해도 무방합니다. Koin 컨텍스트는 이제 현재 기본 컨텍스트에서 준비됩니다.

`koin-androidx-compose`
- `KoinAndroidContext`가 지원 중단되었으며 제거해도 무방합니다. Koin 컨텍스트는 이제 현재 기본 컨텍스트에서 준비됩니다.

`koin-androidx-compose-navigation`
- Lifecycle 라이브러리 업데이트 이후 `koinNavViewModel`은 더 이상 필요하지 않습니다. `koinViewModel`로 교체하세요.

`koin-core-viewmodel-navigation`
- Lifecycle 라이브러리 업데이트 이후 `koinNavViewModel`은 더 이상 필요하지 않습니다. `koinViewModel`로 교체하세요.

`koin-ktor`
- `Application.koin`은 `Application.koinModules` 및 `Application.koinModule` 사용을 권장하며 지원 중단되었습니다.

### Breaking

`koin-android`
- 이전 상태(state) 관련 ViewModel API가 제거되었습니다.
  - `stateViewModel()`, `getStateViewModel()`: `viewModel()`을 사용하세요.
  - `getSharedStateViewModel()`, `sharedStateViewModel()`: `viewModel()`을 사용하거나, 공유 인스턴스에는 `activityViewModel()`을 사용하세요.

`koin-compose`
- 이전 Compose API 함수가 제거되었습니다.
  - `inject()`: `koinInject()`를 사용하세요.
  - `getViewModel()`: `koinViewModel()`을 사용하세요.
  - `rememberKoinInject()`: `koinInject()`로 통합되었습니다.
- `rememberKoinApplication`이 `@KoinInternalApi`로 표시되었습니다.

## 4.0.4 {id="4-0-4"}

Kotlin `2.0.21`.

모든 라이브러리 버전은 [libs.versions.toml](https://github.com/InsertKoinIO/koin/blob/4.0.4/projects/gradle/libs.versions.toml)에 있습니다.

### New

`koin-core`
- 이제 `KoinPlatformTools.generateId()`가 Kotlin `kotlin.uuid` API를 사용하며, 모든 플랫폼에서 실제 UUID를 생성합니다.

`koin-viewmodel`
- Koin 4.0은 Google 및 JetBrains KMP API 전반에 걸쳐 공유되는 ViewModel DSL 및 API를 도입했습니다. 중복을 방지하기 위해 이제 ViewModel API는 `koin-core-viewmodel` 및 `koin-core-viewmodel-navigation`에 위치합니다.
- ViewModel DSL 임포트 경로는 `org.koin.core.module.dsl.*`입니다.

`koin-core-coroutines`: 전체 API가 이제 stable 상태임
- 모든 `lazyModules`
- `awaitAllStartJobs`, `onKoinStarted`, `isAllStartedJobsDone`
- `waitAllStartJobs`, `runOnKoinStarted`
- `KoinApplication.coroutinesEngine`
- `Module.includes(lazy)`
- `lazyModule()`
- `KoinPlatformCoroutinesTools`

### Experimental

`koin-test`
- `ParameterTypeInjection`: `Verify` API에 대한 동적 파라미터 주입을 선언합니다.

`koin-androidx-startup`
- `androidx.startup.Initializer` API를 통해 AndroidX Startup으로 Koin을 시작합니다. `koin-androidx-startup` API 전체가 실험적 상태입니다.

`koin-compose`
- `rememberKoinModules`: `@Composable`에서 Koin 모듈을 로드 및 언로드합니다.
- `rememberKoinScope`: `@Composable`에서 Koin scope를 로드 및 언로드합니다.
- `KoinScope`: 모든 자식 composable을 위한 Koin scope를 로드합니다.

### Deprecated

`koin-test`
- `checkModules` API 전체. `Verify` API로 마이그레이션하세요.

`koin-android`
- Android ViewModel DSL은 `koin-core`의 공유 DSL 사용을 권장하며 지원 중단되었습니다.
- 상태 ViewModel API(에러 레벨로 격상됨):
  - `stateViewModel()`, `getStateViewModel()`: `viewModel()`을 사용하세요.
  - `getSharedStateViewModel()`, `sharedStateViewModel()`: `viewModel()`을 사용하거나, 공유 인스턴스에는 `activityViewModel()`을 사용하세요.

`koin-compose`
- 이전 Compose API 함수(에러 레벨로 격상됨):
  - `inject()`: `koinInject()`를 사용하세요.
  - `getViewModel()`: `koinViewModel()`을 사용하세요.
  - `rememberKoinInject()`: `koinInject()`를 사용하세요.

`koin-compose-viewmodel`
- ViewModel DSL은 `koin-core`의 공유 DSL 사용을 권장하며 지원 중단되었습니다.
- `koinNavViewModel`은 `koinViewModel` 사용을 권장하며 지원 중단되었습니다.

### Breaking

이전 마일스톤에서 지원 중단된 후 다음 API들이 제거되었습니다. `@KoinReflectAPI`로 어노테이션된 모든 API도 함께 제거되었습니다.

`koin-core`
- `ApplicationAlreadyStartedException`이 `KoinApplicationAlreadyStartedException`으로 이름이 변경되었습니다.
- `KoinScopeComponent.closeScope()`가 제거되었습니다(더 이상 내부적으로 사용되지 않음).
- 내부 `ResolutionContext`가 `InstanceContext`를 대체합니다.
- `KoinPlatformTimeTools`, `Timer`, `measureDuration`이 제거되었습니다. Kotlin Time API를 사용하세요.
- `KoinContextHandler`가 `GlobalContext` 사용을 위해 제거되었습니다.

`koin-android`
- `Fragment.createScope()`가 제거되었습니다.
- 새 내부 구조에 맞게 ViewModel 팩토리 API(주로 내부용)가 재작업되었습니다.

`koin-compose`
- `StableParametersDefinition`이 제거되었습니다(더 이상 내부적으로 사용되지 않음).
- 지연 ViewModel API(기존 `viewModel()`)가 제거되었습니다.
- `rememberStableParametersDefinition()`이 제거되었습니다(더 이상 내부적으로 사용되지 않음).

## 3.5.6 {id="3-5-6"}

Kotlin `1.9.22`.

모든 라이브러리 버전은 [libs.versions.toml](https://github.com/InsertKoinIO/koin/blob/3.5.6/projects/gradle/libs.versions.toml)에 있습니다.

### New

`koin-core`
- `KoinContext`에 새로운 함수 추가:
  - `fun loadKoinModules(module: Module, createEagerInstances: Boolean = false)`
  - `fun loadKoinModules(modules: List<Module>, createEagerInstances: Boolean = false)`
- `koinApplication()`에 여러 시그니처 추가:
  - `koinApplication(createEagerInstances: Boolean = true, appDeclaration: KoinAppDeclaration? = null)`
  - `koinApplication(appDeclaration: KoinAppDeclaration?)`
  - `koinApplication(createEagerInstances: Boolean)`
- 선언 방식을 개방하기 위한 `KoinAppDeclaration`.
- JS에서 Time API를 사용하기 위한 `KoinPlatformTimeTools`.
- iOS: `synchronized` API가 Touchlab Lockable API를 사용합니다.

`koin-androidx-compose`
- Android 환경에서 현재 Koin 컨텍스트에 바인딩하기 위한 `KoinAndroidContext`.

`koin-compose`
- 현재 기본 컨텍스트로 시작하기 위한 `KoinContext`.

`koin-ktor`
- Ktor 인스턴스에 격리된 컨텍스트를 사용합니다(기본 컨텍스트 대신 `Application.getKoin()`).
- Koin Ktor 플러그인의 새로운 모니터링 기능.
- 인스턴스의 범위를 Ktor 요청으로 한정하는 `RequestScope`.

### Experimental

`koin-android`
- `ViewModelScope`: ViewModel scope를 위한 실험적 API.

`koin-core-coroutines`
- 백그라운드에서 모듈을 로드하기 위한 새로운 API.

### Deprecated

`koin-android`
- `getLazyViewModelForClass()`: 복잡하고 기본 글로벌 컨텍스트를 호출합니다. Activity 및 Fragment API를 사용하세요.
- `resolveViewModelCompat()`은 `resolveViewModel()` 사용을 권장하며 지원 중단되었습니다.

`koin-compose`
- `get()` 및 `inject()`는 `koinInject()` 사용을 권장하며 지원 중단되었습니다.
- `getViewModel()`은 `koinViewModel()` 사용을 권장하며 지원 중단되었습니다.
- `rememberKoinInject()`는 `koinInject()` 사용을 권장하며 지원 중단되었습니다.

### Breaking

`koin-core`
- `Koin.loadModules(modules: List<Module>, allowOverride: Boolean = true)`가 `Koin.loadModules(modules: List<Module>, allowOverride: Boolean = true, createEagerInstances: Boolean = false)`로 대체되었습니다.
- `KoinExtension.koin` 프로퍼티가 `KoinExtension.onRegister()` 함수로 대체되었습니다.
- iOS: `internal fun globalContextByMemoryModel(): KoinContext`가 `MutableGlobalContext`를 사용합니다.

`koin-compose`
- `KoinApplication(moduleList: () -> List<Module>, content: @Composable () -> Unit)`이 `KoinContext` 및 `KoinAndroidContext` 사용을 위해 제거되었습니다.

## 3.4.3 {id="3-4-3"}

Kotlin `1.8.21`.

### New

`koin-core`
- Koin용 확장 엔진을 작성하기 위한 `ExtensionManager` API(`ExtensionManager` 및 `KoinExtension`).
- 파라미터 API: `parameterArrayOf` 및 `parameterSetOf`.

`koin-test`
- 모듈에서 `verify()`를 실행하기 위한 `Verification` API.

`koin-android`
- ViewModel 주입을 위한 내부 구조 재작업.
- `AndroidScopeComponent.onCloseScope()` 콜백.

`koin-android-test`
- 모듈에서 `androidVerify()`를 실행하기 위한 `Verification` API.

`koin-androidx-compose`
- `get()`.
- `getViewModel()`.
- Scope `KoinActivityScope` 및 `KoinFragmentScope`.

`koin-androidx-compose-navigation` (신규 모듈)
- `koinNavViewModel()`.

`koin-compose` (Compose용 새로운 멀티플랫폼 API)
- `koinInject` 및 `rememberKoinInject`.
- `KoinApplication`.

### Experimental

`koin-compose`
- `rememberKoinModules`.
- `KoinScope` 및 `rememberKoinScope`.

### Deprecated

`koin-compose`
- `inject()`는 지연(lazy) 함수를 피하기 위해 `get()` 사용을 권장하며 지원 중단되었습니다.
- `viewModel()`은 지연(lazy) 함수를 피하기 위해 `getViewModel()` 사용을 권장하며 지원 중단되었습니다.

### Breaking

`koin-android`
- `LifecycleScopeDelegate`가 제거되었습니다.

`koin-androidx-compose`
- `getStateViewModel`이 `koinViewModel` 사용을 위해 제거되었습니다.

## 관련 문서 {id="related"}

- [API 안정성](/docs/support/api-stability): experimental, deprecated 및 internal의 의미.
- [버전, 로드맵 및 지원 정책](/docs/support/): 릴리스 주기 및 LTS 라인.
- [컴파일러 플러그인 설정](/docs/setup/compiler-plugin): Koin Compiler Plugin 설치 또는 업그레이드.
- [KSP에서 컴파일러 플러그인으로 마이그레이션하기](/docs/migration/from-ksp-to-compiler-plugin): KSP 프로세서에서 이전하기.
- [Gradle 설정](/docs/setup/gradle): Koin 아티팩트 및 BOM.