---
title: Koin vs Hilt
---

# Koin vs Hilt

이 문서는 둘 중 하나를 알고 있으면서 다른 하나를 이해하고자 하는 Android 개발자를 위해 Koin과 Hilt(및 Hilt의 기반인 Dagger)를 비교합니다. 각 프레임워크가 의존성 그래프를 빌드하는 방식, 코드의 형태, 각 프레임워크가 가진 장점을 다룹니다. 프로젝트를 Hilt에서 Koin으로 이전하려면 [Hilt에서 마이그레이션하기](/docs/reference/koin-android/hilt-migration)를 참고하세요.

아래의 Koin 예제는 Hilt와 가장 유사한 어노테이션 방식을 사용합니다. 동일한 정의를 Koin DSL로도 작성할 수 있습니다([스타일 선택하기](/docs/intro/choosing-your-style) 참고).

## 의존성 그래프를 빌드하는 방식 {id="how-each-one-builds-the-graph"}

**Hilt**는 어노테이션 프로세싱(KSP 또는 kapt)을 통해 빌드 타임에 의존성 그래프를 Java 소스 코드로 생성합니다. 앱을 컴파일할 때 모든 바인딩, 컴포넌트, 스코프가 확정됩니다. 런타임에는 앱이 조회(lookup) 과정 없이 생성된 팩토리를 직접 호출합니다.

**Koin**은 런타임 컨테이너에 그래프를 유지합니다. Koin이 시작될 때 정의가 등록되며, 인스턴스는 요청 시 타입에 따라 확인(resolve)됩니다. [Koin Compiler Plugin](/docs/intro/koin-compiler-plugin)을 사용하면 `startKoin`에서 조립되는 그래프를 빌드 타임에도 검사할 수 있으며, 플러그인이 생성자 연결 코드를 생성합니다. 플러그인이 없으면 누락된 정의는 런타임이나 [검증 테스트](/docs/reference/koin-test/verify)를 통해 발견됩니다.

이러한 차이점이 아래에 설명된 대부분의 트레이드오프를 결정짓습니다.

## 한눈에 보기 {id="at-a-glance"}

| 항목 | Koin | Hilt |
|------|------|------|
| 그래프 빌드 시점 | 런타임, Compiler Plugin 사용 시 빌드 타임 검사 | 빌드 타임, 코드 생성 방식 |
| 누락된 바인딩 감지 | Compiler Plugin 사용 시 빌드 타임, 미사용 시 런타임 또는 테스트 | 항상 빌드 타임 |
| 빌드 툴링 | Kotlin 컴파일러 플러그인, Constructor 또는 Classic DSL 사용 시 선택 사항 | KSP 또는 kapt, Hilt Gradle 플러그인 |
| 지원 플랫폼 | Kotlin Multiplatform: Android, iOS, 데스크톱, 웹, JVM 서버 | Android (Dagger 단독으로는 JVM에서 실행 가능) |
| 언어 | Kotlin | Java 및 Kotlin |
| 런타임 모듈 로드/언로드 | 지원 (`loadKoinModules`, `unloadKoinModules`, 지연 로딩 모듈) | 미지원 |
| 컴포넌트 계층 구조 | 루트 컨테이너 및 직접 선언한 스코프 (Android 스코프 원형 포함) | 표준 컴포넌트의 고정된 계층 구조 (`SingletonComponent`, `ActivityComponent` 등) |
| Android 진입점 | 모든 Activity나 Fragment에서 `by inject()`, `by viewModel()` 사용 | 각 클래스에 `@AndroidEntryPoint` 지정 |
| Jetpack 연동 | Koin 라이브러리를 통한 ViewModel, WorkManager, Navigation, Compose 지원 | AndroidX Hilt 라이브러리를 통한 ViewModel, WorkManager, Navigation, Compose 지원 |

## Hilt의 강점 {id="where-hilt-is-stronger"}

- **빌드 타임의 완전한 그래프 검증**: Hilt는 전체 그래프를 생성하므로 모든 빌드마다 모든 모듈과 스코프의 각 바인딩이 검증됩니다. Koin Compiler Plugin도 진입점에서 그래프를 검증하지만, 런타임에 로드되는 모듈이나 라이브러리 모듈 단독으로는 검사 범위에서 벗어납니다.
- **런타임 룩업 없음**: 생성된 팩토리를 직접 호출합니다. 반면 Koin은 컨테이너를 통해 각 요청을 확인하므로, 해결(resolution) 시점의 룩업 비용과 시작(startup) 시점의 등록 작업이 발생합니다.
- **Java 지원**: Dagger와 Hilt는 Java 코드베이스에서도 동작합니다. Koin의 API는 Kotlin 전용으로 설계되었습니다.
- **생태계 및 가이드라인**: Hilt는 공식 Android 가이드에 수록된 DI 라이브러리이며, 수많은 AndroidX 라이브러리와 샘플에서 Hilt 연동을 우선적으로 제공합니다.
- **상세한 에러 메시지**: Dagger 에러는 진입점부터 누락된 바인딩까지의 전체 경로를 명확하게 보여줍니다.

## Koin의 강점 {id="where-koin-is-stronger"}

- **Kotlin Multiplatform**: 동일한 모듈을 Android, iOS, 데스크톱, 웹, Ktor 서버에서 그대로 실행할 수 있습니다. Hilt는 Android만 지원합니다.
- **런타임 유연성**: 시작 후에도 모듈을 로드하거나 언로드하고, 백그라운드에서 로드할 수 있어 기능 플래그(feature flags), 동적 기능(dynamic features), 플러그인 아키텍처에 적합합니다.
- **간소한 설정**: 어노테이션 프로세서, 생성된 소스 코드, `@AndroidEntryPoint`가 필요하지 않습니다. Constructor 또는 Classic DSL을 사용할 경우 빌드 플러그인조차 선택 사항입니다.
- **적은 선언 코드**: 생성자에 `@Inject`를 붙일 필요가 없으며, 별도의 `@Binds` 모듈 없이도 인터페이스가 구현체에 자동으로 바인딩됩니다.
- **스타일 선택의 자유**: DSL 또는 어노테이션을 자유롭게 선택할 수 있으며, 두 방식을 혼용할 수도 있습니다.

## 코드 비교 {id="code-side-by-side"}

### 의존성을 가진 클래스 {id="a-class-with-dependencies"}

Koin:

```kotlin
@Singleton
class UserRepositoryImpl(private val api: ApiService) : UserRepository
```

Koin은 `UserRepositoryImpl`이 `UserRepository`를 구현하고 있으므로 자동으로 바인딩합니다.

Hilt:

```kotlin
@Singleton
class UserRepositoryImpl @Inject constructor(private val api: ApiService) : UserRepository

@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {
    @Binds
    abstract fun bindUserRepository(impl: UserRepositoryImpl): UserRepository
}
```

### 서드파티 클래스 {id="third-party-classes"}

Koin:

```kotlin
@Module
class NetworkModule {
    @Singleton
    fun retrofit(): Retrofit = Retrofit.Builder()
        .baseUrl("https://api.example.com")
        .build()

    @Singleton
    fun apiService(retrofit: Retrofit): ApiService =
        retrofit.create(ApiService::class.java)
}
```

Hilt:

```kotlin
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    @Provides
    @Singleton
    fun retrofit(): Retrofit = Retrofit.Builder()
        .baseUrl("https://api.example.com")
        .build()

    @Provides
    @Singleton
    fun apiService(retrofit: Retrofit): ApiService =
        retrofit.create(ApiService::class.java)
}
```

두 방식은 매우 유사합니다. Koin은 모듈이 특정 컴포넌트에 종속되지 않으므로 `@InstallIn`이 필요 없으며, 함수에 붙은 `@Singleton` 자체가 이미 정의를 선언하므로 `@Provides`도 필요하지 않습니다.

### ViewModel {id="viewmodel"}

Koin:

```kotlin
@KoinViewModel
class UserViewModel(
    private val repository: UserRepository,
    private val savedStateHandle: SavedStateHandle,
) : ViewModel()

// Activity 또는 Fragment
val viewModel: UserViewModel by viewModel()

// Compose
val viewModel: UserViewModel = koinViewModel()
```

Hilt:

```kotlin
@HiltViewModel
class UserViewModel @Inject constructor(
    private val repository: UserRepository,
    private val savedStateHandle: SavedStateHandle,
) : ViewModel()

// @AndroidEntryPoint가 적용된 Activity 또는 Fragment
val viewModel: UserViewModel by viewModels()

// Compose
val viewModel: UserViewModel = hiltViewModel()
```

### 여러 Gradle 모듈 {id="several-gradle-modules"}

Koin:

```kotlin
// feature-auth
@Module
@ComponentScan
@Configuration
class AuthModule

// app
@KoinApplication
class MyApp
```

Hilt:

```kotlin
// feature-auth
@Module
@InstallIn(SingletonComponent::class)
class AuthModule { ... }

// app
@HiltAndroidApp
class MyApp : Application()
```

두 프레임워크 모두 클래스패스에서 기능 모듈을 탐색합니다. Koin은 `@Configuration`을 통해, Hilt는 `@InstallIn`을 통해 탐색합니다. Koin에서는 `@ComponentScan`이 해당 패키지의 어노테이션이 지정된 모든 클래스를 수집하므로, 기능 모듈에 프로바이더 함수가 전혀 필요 없는 경우가 많습니다.

## 개념 매핑 {id="concept-mapping"}

| Hilt | Koin |
|------|------|
| `@HiltAndroidApp` | `startKoin<MyApp>()`와 함께 사용하는 `@KoinApplication`, 또는 `startKoin { }` |
| `@AndroidEntryPoint` | 불필요: 모든 Activity나 Fragment에서 `by inject()` 및 `by viewModel()` 사용 가능 |
| `@Inject constructor` | 불필요: Compiler Plugin이 생성자를 분석함 |
| `@Binds` | 어노테이션 사용 시 자동 처리, DSL에서는 `bind` 사용 |
| `@Provides` | 함수의 `@Singleton` 또는 `@Factory`, 혹은 DSL 정의 |
| `@InstallIn(SingletonComponent::class)` | `@Configuration` |
| `@HiltViewModel` | `@KoinViewModel` |
| `@Named` | `@Named` |
| `@ActivityScoped`, `@ViewModelScoped` | `@ActivityScope`, `@ViewModelScope` |
| `@AssistedInject` | `@InjectedParam` |

마이그레이션 가이드에서는 전체 매핑, 단계별 절차, 마이그레이션 도중 두 프레임워크를 병행 실행하는 방법을 다룹니다. 자세한 내용은 [Hilt에서 마이그레이션하기](/docs/reference/koin-android/hilt-migration)를 참고하세요.

## 관련 문서 {id="related"}

- [Hilt에서 마이그레이션하기](/docs/reference/koin-android/hilt-migration): 프로젝트를 단계별로 마이그레이션하기.
- [JSR-330 호환성](/docs/reference/koin-android/jsr330): `javax.inject` 어노테이션 유지하기.
- [Koin이란?](/docs/intro/what-is-koin): Koin의 런타임 및 컴파일 타임 모델.
- [컴파일 타임 안전성](/docs/reference/koin-compiler/compile-safety): Koin이 빌드 타임에 검사하는 항목.
- [스타일 선택하기](/docs/intro/choosing-your-style): DSL 또는 어노테이션.