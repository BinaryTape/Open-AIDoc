---
title: 스타일 선택하기
---

# 스타일 선택하기

Koin은 정의(definition)를 선언하는 두 가지 스타일을 제공하며, 두 스타일 모두 동일한 컨테이너를 채웁니다. 바로 클래스에 작성하는 **애너테이션(annotations)** 방식과 `module { }` 블록 내에서 작성하는 **Koin DSL** 방식입니다. DSL은 컴파일러 플러그인 DSL(`single<T>()`), 생성자 DSL(`singleOf(::T)`), 클래식 DSL(`single { T(get()) }`)의 세 가지 형태로 제공됩니다. 어떤 방식을 선택하든 모듈을 작성하는 방식만 달라질 뿐, 런타임에서 Koin이 동작하는 방식은 동일합니다. 이 페이지에서는 각 스타일의 특징, 요구 사항 및 트레이드오프를 살펴보고 기본 권장 스타일을 제안합니다. 이 문서는 정의와 모듈의 개념을 이미 알고 있다고 가정합니다([핵심 개념](/docs/intro/core-concepts) 참조).

## 스타일별 비교 {id="the-styles-side-by-side"}

각 스타일로 작성한 동일한 모듈입니다.

**컴파일러 플러그인 DSL**
```kotlin
import org.koin.dsl.module
import org.koin.plugin.module.dsl.*

val appModule = module {
    single<ApiService>()
    single<UserRepositoryImpl>() bind UserRepository::class
    viewModel<UserViewModel>()
}
```

타입만 명시하면 됩니다. [Koin 컴파일러 플러그인](/docs/intro/koin-compiler-plugin)이 생성자를 읽고 의존성 연결(wiring)을 자동으로 생성합니다.

**애너테이션**
```kotlin
@Singleton
class ApiService

@Singleton
class UserRepositoryImpl(private val api: ApiService) : UserRepository

@KoinViewModel
class UserViewModel(private val repository: UserRepository) : ViewModel()

@Module
@ComponentScan("com.example.app")
class AppModule
```

각 클래스에 애너테이션을 추가합니다. `@ComponentScan`이 이들을 모듈로 수집하고, 컴파일러 플러그인이 의존성 연결 코드를 생성합니다. 인터페이스는 자동으로 바인딩됩니다.

**생성자 / 클래식 DSL**
생성자 참조를 사용하는 생성자 DSL:

```kotlin
import org.koin.dsl.module
import org.koin.core.module.dsl.*

val appModule = module {
    singleOf(::ApiService)
    singleOf(::UserRepositoryImpl) bind UserRepository::class
    viewModelOf(::UserViewModel)
}
```

생성자 호출을 직접 작성하는 클래식 DSL:

```kotlin
val appModule = module {
    single { ApiService() }
    single<UserRepository> { UserRepositoryImpl(get()) }
    viewModel { UserViewModel(get()) }
}
```

두 형태 모두 컴파일러 플러그인 없이도 동작합니다. 플러그인이 적용되면 빌드 시점에 유효성 검증도 함께 수행됩니다.

## 요구 사항 {id="requirements"}

| | 컴파일러 플러그인 DSL | 애너테이션 | 생성자 / 클래식 DSL |
|---|---|---|---|
| Koin 버전 | 4.2.0+ | 4.2.0+ | 무관 |
| Kotlin 버전 | 2.3.20+ (K2) | 2.3.20+ (K2) | 사용 중인 Koin 버전이 지원하는 모든 버전 |
| Gradle 플러그인 | `io.insert-koin.compiler.plugin` (필수) | `io.insert-koin.compiler.plugin` (필수) | 선택 사항: 컴파일 타임 검증 추가 |
| 추가 의존성 | 파라미터 애너테이션(`@Named`, `@InjectedParam`)에만 `koin-annotations` 필요 | `koin-annotations` | 없음 |
| Imports | `org.koin.plugin.module.dsl.*` | `org.koin.core.annotation.*` | `org.koin.core.module.dsl.*` (생성자), `org.koin.dsl.*` (클래식) |

컴파일러 플러그인의 각 릴리스는 지원되는 Kotlin 버전 목록에 대해 검증됩니다. 플러그인 1.2.1은 Kotlin 2.3.20, 2.4.0, 2.4.10, 2.4.20에서 검증되었습니다. 설치 단계는 [컴파일러 플러그인 설정](/docs/setup/compiler-plugin)을 참조하세요.

:::warning
컴파일러 플러그인 DSL 함수(`single<T>()`, `factory<T>()`, `create(::T)`)는 스텁(stub)입니다. Gradle 플러그인이 적용되지 않은 상태에서도 코드는 컴파일되지만, 런타임에 `NotImplementedError`가 발생합니다. 해당 함수를 사용하는 모든 Gradle 모듈에 플러그인을 적용해야 합니다.
:::

## 트레이드오프 {id="tradeoffs"}

### 컴파일러 플러그인 DSL {id="compiler-plugin-dsl"}

- **컴파일 타임 검증**: 전체 의존성 그래프와 모든 `get()` 호출 위치가 빌드 시점에 검증됩니다.
- **바인딩 코드 불필요**: `get()`이나 생성자 참조가 필요 없습니다. 생성자 파라미터가 추가되어도 모듈 코드를 수정할 필요가 없습니다.
- **명시적인 모듈**: 모듈의 모든 정의를 한곳에서 확인할 수 있으며, 주위에 Kotlin 코드(조건문, 반복문 등)를 활용할 수 있습니다.
- **파라미터 애너테이션**: 한정자(qualifier)와 주입 파라미터가 클래스에 선언되므로(`@Named`, `@InjectedParam`), 클래스가 `koin-annotations`에 의존하게 됩니다.
- **Kotlin 결합도**: 최신 K2 컴파일러가 필요하며, 새로운 Kotlin 버전이 출시되면 플러그인 새 버전이 필요할 수 있습니다.

### 애너테이션 {id="annotations"}

- **컴파일 타임 검증**: 컴파일러 플러그인 DSL과 동일합니다.
- **클래스 옆에 위치하는 정의**: 클래스가 작성된 코드 위치에서 수명 주기(lifecycle)와 바인딩을 바로 확인할 수 있습니다. Hilt, Dagger 또는 Spring을 사용해 본 팀에게 친숙한 모델입니다.
- **자동 바인딩**: `binds`를 별도로 지정하지 않는 한 클래스는 모든 상위 타입에 자동으로 바인딩됩니다.
- **스캔 설정**: 정의는 패키지 기준으로 탐색됩니다. 올바른 패키지가 지정된 `@Module` 및 `@ComponentScan`이 필요하며, 여러 Gradle 모듈에 걸쳐 모듈을 조합하려면 `@Configuration` 또는 `@KoinApplication`이 필요합니다. 스캔 대상 패키지 외부에 있는 클래스는 모듈에 포함되지 않습니다. 컴파일 타임 검증은 다른 정의가 해당 클래스를 필요로 할 때만 누락 여부를 보고합니다.
- **지원되지 않는 기능**: `onClose` 콜백과 같은 일부 옵션은 DSL에서만 지원됩니다. 이러한 정의는 DSL 모듈로 작성해야 합니다.
- **Kotlin 결합도**: 컴파일러 플러그인 DSL과 동일합니다.

### 생성자 DSL 및 클래식 DSL {id="constructor-dsl-and-classic-dsl"}

- **폭넓은 호환성**: 컴파일러 플러그인이 선택 사항이며, Koin 자체의 요구 사항 외에 별도의 Kotlin 버전 제약이 없습니다.
- **플러그인을 통한 컴파일 타임 검증**: 컴파일러 플러그인 1.2.0부터 플러그인을 적용하면 `singleOf(::T)`, `factoryOf(::T)`, `scopedOf(::T)`, `viewModelOf(::T)`가 `single<T>()`처럼 검증되며, 직접 작성한 람다의 `get()` 호출도 검증됩니다. 기존 모듈을 재작성하지 않고도 컴파일 타임 검증을 적용할 수 있습니다.
- **완전한 제어 가능 (클래식 DSL)**: 람다는 순수 Kotlin 코드이므로 빌더 호출, 설정값 읽기, 런타임 구현체 선택 등을 자유롭게 처리할 수 있습니다.
- **플러그인 미사용 시 런타임 오류**: 누락된 정의는 코드가 실행될 때 발견됩니다. 단위 테스트에서 [`verify()`](/docs/reference/koin-test/verify)를 사용하면 이를 사전에 감지할 수 있습니다.
- **수동 바인딩 코드 유지보수**: `single { UserRepository(get(), get()) }`은 생성자가 변경되면 수동으로 코드를 맞춰 주어야 합니다. `singleOf(::UserRepository)`는 생성자 변경을 자동으로 반영하지만, nullable, lazy 또는 한정자(qualifier)가 지정된 파라미터는 명시적으로 호출해 주어야 합니다.

## 어떤 방식을 선택해야 할까요? {id="which-one-to-pick"}

프로젝트에 적합한 스타일(애너테이션 또는 DSL)을 하나 결정하여 일관되게 사용하는 것이 좋습니다.

Kotlin 2.3.20 이상을 사용하는 신규 프로젝트라면 **컴파일러 플러그인 DSL**을 권장합니다. 컴파일 타임 검증을 제공하면서도 클래스에 DI 관련 코드를 남기지 않고 모듈을 명시적인 Kotlin 코드로 관리할 수 있습니다. 팀이 Hilt나 Dagger처럼 클래스에 직접 정의를 선언하는 방식을 선호한다면 **애너테이션**을 사용하세요. 동일한 컴파일 타임 검증을 제공하며 JSR-330과 호환됩니다(`@Inject`, `@Singleton`, `@Named`).

최신 Kotlin 버전을 사용할 수 없거나, 라이브러리 사용자에게 컴파일러 플러그인을 요구할 수 없는 라이브러리를 개발 중이거나, 기존 모듈이 정상 동작하여 굳이 변경할 필요가 없다면 **생성자 또는 클래식 DSL**을 유지하세요. 기존 모듈을 재작성하지 않고 컴파일 타임 검증만 추가하려면 컴파일러 플러그인을 적용하기만 하면 됩니다. 정의에 커스텀 로직이 필요한 부분에는 클래식 DSL 람다를 사용하세요.

## 스타일 혼용하기 {id="mixing-styles"}

모든 스타일은 결국 동일한 정의를 생성하므로 하나의 프로젝트에서 여러 스타일을 함께 사용할 수 있습니다. 다만 프로젝트 단위에서는 단일 스타일을 사용하는 것을 권장합니다. 애너테이션과 DSL을 함께 사용해야 한다면 모듈 단위로 스타일을 분리하세요. 흔히 사용되는 혼용 사례는 다음과 같습니다.

- **하나의 모듈에서 컴파일러 플러그인 DSL과 클래식 DSL 혼용**: 대부분의 정의에는 `single<T>()`를 작성하고, 커스텀 로직이 필요한 곳에만 람다를 사용합니다. 둘 다 DSL 형식이므로 이는 스타일 혼용에 해당하지 않습니다.
- **애너테이션 기반에 소수의 DSL 모듈 추가**: `@KoinApplication` 클래스에서 시작하여 설정 블록 내에 DSL 모듈을 추가합니다.
- **DSL 기반 시작 코드에 애너테이션 모듈 로드**: 일반적인 `startKoin` 블록 내에 `@Module` 클래스를 로드합니다.

```kotlin
import org.koin.plugin.module.dsl.module
import org.koin.plugin.module.dsl.startKoin

// 애너테이션 기반 애플리케이션에 DSL 모듈 추가
startKoin<MyApp> {
    modules(legacyModule)
}

// DSL 기반 애플리케이션에 애너테이션 모듈 추가
startKoin {
    modules(appModule)
    module<NetworkModule>()
}
```

`@Module(includes = [...])` 및 `@KoinApplication(modules = [...])`에는 DSL의 `module { }` 값이 아닌 `@Module` 클래스만 전달할 수 있습니다. 전체 규칙은 [모듈](/docs/reference/koin-core/modules) 및 [Koin 시작하기](/docs/reference/koin-core/starting-koin)를 참조하세요.

## KSP 프로세서 지원 중단 안내 {id="the-ksp-processor-is-deprecated"}

컴파일러 플러그인이 도입되기 전에는 애너테이션 처리에 KSP 프로세서인 `koin-ksp-compiler`가 사용되었습니다. 해당 프로세서는 지원 중단(deprecated)되었으며 향후 Koin 버전에서 제거될 예정입니다. 단, 애너테이션 자체가 지원 중단된 것은 아닙니다. `koin-annotations`는 Koin 메인 프로젝트의 일부로 매 Koin 버전마다 함께 배포됩니다. 현재 KSP를 사용 중이라면 애너테이션이 적용된 클래스는 그대로 유지되며 빌드 설정과 시작 코드만 변경하면 됩니다. 자세한 내용은 [KSP에서 컴파일러 플러그인으로 마이그레이션하기](/docs/migration/from-ksp-to-compiler-plugin)를 참조하세요.

## 모든 페이지의 탭 구성 {id="tabs-on-every-page"}

이 문서의 코드 예제는 '컴파일러 플러그인 DSL', '애너테이션', '생성자 / 클래식 DSL'이라는 동일한 세 개의 탭을 사용합니다. 특정 탭을 선택하면 브라우저에 해당 선택이 저장되어 모든 페이지에 동일하게 적용됩니다. Activity 내에서의 `by inject()`와 같이 모든 스타일에서 동일한 예제는 탭 구분 없이 한 번만 표시됩니다.

## 관련 문서 {id="related"}

- [Koin 컴파일러 플러그인](/docs/intro/koin-compiler-plugin): 플러그인의 동작 방식과 검증 대상.
- [컴파일러 플러그인 설정](/docs/setup/compiler-plugin): Gradle 플러그인 설치 방법.
- [정의](/docs/reference/koin-core/definitions): 모든 스타일에서의 정의 유형.
- [DSL 레퍼런스](/docs/reference/koin-core/dsl) 및 [애너테이션 레퍼런스](/docs/reference/koin-annotations/annotations-inventory): 지원하는 모든 키워드와 애너테이션.
- [KSP에서 마이그레이션하기](/docs/migration/from-ksp-to-compiler-plugin): `koin-ksp-compiler`에서의 전환 가이드.