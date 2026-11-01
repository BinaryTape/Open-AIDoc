---
title: 어노테이션 레퍼런스
---

# 어노테이션 레퍼런스

이 페이지에는 모든 Koin 어노테이션의 패키지 위치, 적용 대상, 매개변수 및 예제가 정리되어 있습니다. 각 항목은 해당 개념을 설명하는 페이지로 연결됩니다. 어노테이션 설정 방법은 [컴파일러 플러그인 설정](/docs/setup/compiler-plugin)을, 어노테이션과 DSL의 비교는 [스타일 선택하기](/docs/intro/choosing-your-style)를 참조하세요.

이 어노테이션들은 `io.insert-koin:koin-annotations` 아티팩트(Koin과 동일한 버전)에서 제공됩니다. Koin 컴파일러 플러그인이 빌드 시점에 이를 읽어 정의(definition)를 생성합니다. 대부분의 어노테이션은 `org.koin.core.annotation`에 속하며, Android 전용 어노테이션은 `org.koin.android.annotation`에 속합니다.

## 한눈에 보기 {id="at-a-glance"}

| 어노테이션 | 패키지 | 선언 내용 |
|------------|---------|----------|
| [`@Singleton` / `@Single`](#singleton--single) | `org.koin.core.annotation` | `single` 정의 |
| [`@Factory`](#factory) | `org.koin.core.annotation` | `factory` 정의 |
| [`@Scoped`](#scoped) | `org.koin.core.annotation` | `scoped` 정의 |
| [`@KoinViewModel`](#koinviewmodel) | `org.koin.core.annotation` | `viewModel` 정의 |
| [`@KoinWorker`](#koinworker) | `org.koin.android.annotation` | WorkManager `worker` 정의 |
| [`@Scope`](#scope) | `org.koin.core.annotation` | 정의가 속하는 스코프 |
| [`@ViewModelScope`](#viewmodelscope) | `org.koin.core.annotation` | ViewModel 스코프 내의 정의 |
| [`@ActivityScope`](#activityscope) | `org.koin.android.annotation` | Activity 스코프 내의 정의 |
| [`@ActivityRetainedScope`](#activityretainedscope) | `org.koin.android.annotation` | 유지되는(retained) Activity 스코프 내의 정의 |
| [`@FragmentScope`](#fragmentscope) | `org.koin.android.annotation` | Fragment 스코프 내의 정의 |
| [`@ScopeId`](#scopeid) | `org.koin.core.annotation` | 특정 스코프로부터 해결(resolve)되는 파라미터 |
| [`@Named`](#named) | `org.koin.core.annotation` | 문자열 한정자(qualifier) |
| [`@Qualifier`](#qualifier) | `org.koin.core.annotation` | 타입 또는 문자열 한정자 |
| [`@InjectedParam`](#injectedparam) | `org.koin.core.annotation` | 호출자가 전달하는 파라미터 |
| [`@Property`](#property) | `org.koin.core.annotation` | Koin 프로퍼티에서 읽어오는 파라미터 |
| [`@PropertyValue`](#propertyvalue) | `org.koin.core.annotation` | 프로퍼티의 기본값 |
| [`@Provided`](#provided) | `org.koin.core.annotation` | 검증 그래프 외부에서 제공되는 타입 |
| [`@Module`](#module) | `org.koin.core.annotation` | 모듈 클래스 |
| [`@ComponentScan`](#componentscan) | `org.koin.core.annotation` | 정의를 검색할 패키지 |
| [`@Configuration`](#configuration) | `org.koin.core.annotation` | 모듈의 구성 레이블 |
| [`@KoinApplication`](#koinapplication) | `org.koin.core.annotation` | 애플리케이션 진입점 |
| [`@Monitor`](#monitor) | `org.koin.core.annotation` | Kotzilla SDK로 추적되는 함수 |

## 정의 (Definitions) {id="definitions"}

정의 어노테이션은 클래스(Koin이 생성자를 호출) 또는 함수(Koin이 함수를 호출하며 최상위 함수이거나 `@Module` 클래스 내부 함수)에 지정합니다. 생성자 및 함수 파라미터는 컨테이너로부터 해결(resolve)됩니다. 각 파라미터 타입이 어떻게 해결되는지는 [정의](/docs/reference/koin-core/definitions#constructor-parameters)를 참조하세요.

`binds`가 비어 있으면 해당 정의는 클래스 자체 및 모든 상위 타입(supertype)에 바인딩됩니다. 특정 타입에만 바인딩하려면 `binds`에 해당 타입들을 나열하세요.

### @Singleton / @Single {id="singleton-single"}

타깃: `CLASS`, `FUNCTION`

| 파라미터 | 타입 | 기본값 | 설명 |
|-----------|------|---------|-------------|
| `binds` | `Array<KClass<*>>` | `[]` | 바인딩할 타입. 비어 있으면 모든 상위 타입을 바인딩함 |
| `createdAtStart` | `Boolean` | `false` | Koin 시작 시 인스턴스 생성 여부 |

```kotlin
@Singleton(binds = [UserRepository::class])
class UserRepositoryImpl(private val api: ApiService) : UserRepository
```

`@Singleton`과 `@Single`은 동일합니다. JSR-330 표준 이름인 `@Singleton`을 권장합니다. 컨테이너의 수명 주기 동안 하나의 인스턴스가 유지됩니다. 관련 개념: [정의](/docs/reference/koin-core/definitions).

### @Factory {id="factory"}

타깃: `CLASS`, `FUNCTION`

| 파라미터 | 타입 | 기본값 | 설명 |
|-----------|------|---------|-------------|
| `binds` | `Array<KClass<*>>` | `[]` | 바인딩할 타입. 비어 있으면 모든 상위 타입을 바인딩함 |

```kotlin
@Factory
class UserPresenter(private val repository: UserRepository)
```

요청할 때마다 새 인스턴스가 생성됩니다. 관련 개념: [정의](/docs/reference/koin-core/definitions).

### @Scoped {id="scoped"}

타깃: `CLASS`, `FUNCTION`

| 파라미터 | 타입 | 기본값 | 설명 |
|-----------|------|---------|-------------|
| `binds` | `Array<KClass<*>>` | `[]` | 바인딩할 타입. 비어 있으면 모든 상위 타입을 바인딩함 |

```kotlin
@Scope(UserSession::class)
@Scoped
class SessionCache(private val repository: UserRepository)
```

스코프당 하나의 인스턴스가 생성되며, 스코프가 닫힐 때 해제됩니다. `@Scope` 또는 스코프 아키타입(`@ViewModelScope`, `@ActivityScope` 등)과 함께 사용합니다. 관련 개념: [스코프](/docs/reference/koin-core/scopes).

### @KoinViewModel {id="koinviewmodel"}

타깃: `CLASS`, `FUNCTION`

| 파라미터 | 타입 | 기본값 | 설명 |
|-----------|------|---------|-------------|
| `binds` | `Array<KClass<*>>` | `[]` | 바인딩할 타입. 비어 있으면 모든 상위 타입을 바인딩함 |

```kotlin
@KoinViewModel
class UserViewModel(private val repository: UserRepository) : ViewModel()
```

Android 및 Compose Multiplatform 타깃에서 작동합니다. 클래스패스에 `io.insert-koin:koin-core-viewmodel`이 필요합니다(그렇지 않으면 `KOIN-A001` 오류와 함께 빌드가 실패합니다). 관련 개념: [ViewModel](/docs/reference/koin-core/viewmodel).

:::note
컴파일러 플러그인을 사용할 때 `@KoinViewModel`은 `org.koin.core.annotation`에 위치합니다. KSP 프로세서는 `org.koin.android.annotation.KoinViewModel`을 사용했으므로 마이그레이션 시 import 문을 업데이트하세요([KSP에서 마이그레이션하기](/docs/migration/from-ksp-to-compiler-plugin) 참조).
:::

### @KoinWorker {id="koinworker"}

패키지: `org.koin.android.annotation` (Android 전용). 타깃: `CLASS`, `FUNCTION`

| 파라미터 | 타입 | 기본값 | 설명 |
|-----------|------|---------|-------------|
| `binds` | `Array<KClass<*>>` | `[]` | 바인딩할 타입 |

```kotlin
@KoinWorker
class SyncWorker(
    context: Context,
    params: WorkerParameters,
    private val repository: UserRepository,
) : CoroutineWorker(context, params)
```

`io.insert-koin:koin-android-workmanager`가 필요합니다(그렇지 않으면 `KOIN-A002` 오류와 함께 빌드가 실패합니다). 관련 개념: [WorkManager](/docs/reference/koin-android/workmanager).

## 스코프 (Scopes) {id="scopes"}

### @Scope {id="scope"}

타깃: `CLASS`, `FUNCTION`

| 파라미터 | 타입 | 기본값 | 설명 |
|-----------|------|---------|-------------|
| `value` | `KClass<*>` | `Unit::class` | 스코프 타입 |
| `name` | `String` | `""` | 타입 대신 사용할 스코프 이름 |

```kotlin
@Scope(UserSession::class)
class SessionCache(private val repository: UserRepository)

@Scope(name = "checkout")
class CheckoutState
```

정의를 지정된 스코프에 할당합니다. `@Scope` 단독으로 사용하면 `scoped` 정의를 선언합니다. 다른 종류를 선택하거나 `binds`를 설정하려면 `@Scoped`, `@Factory` 또는 `@KoinViewModel`을 추가하세요. 관련 개념: [스코프](/docs/reference/koin-core/scopes).

### @ViewModelScope {id="viewmodelscope"}

타깃: `CLASS`, `FUNCTION`. 파라미터 없음.

```kotlin
@ViewModelScope
class UserSessionCache(private val repository: UserRepository)
```

ViewModel의 스코프 내에서 범위가 지정된(scoped) 정의를 선언합니다. ViewModel과 함께 생성되고 ViewModel이 지워질(cleared) 때 함께 닫힙니다. 관련 개념: [스코프](/docs/reference/koin-core/scopes).

### @ActivityScope {id="activityscope"}

패키지: `org.koin.android.annotation` (Android 전용). 타깃: `CLASS`, `FUNCTION`. 파라미터 없음.

```kotlin
@ActivityScope
class ScreenTracker(private val analytics: Analytics)
```

Activity 스코프 내에서 범위가 지정된(scoped) 정의를 선언합니다. Activity가 해당 스코프를 제공해야 합니다([Android 스코프](/docs/reference/koin-android/scope) 참조).

### @ActivityRetainedScope {id="activityretainedscope"}

패키지: `org.koin.android.annotation` (Android 전용). 타깃: `CLASS`, `FUNCTION`. 파라미터 없음.

```kotlin
@ActivityRetainedScope
class FormState
```

설정 변경(configuration changes) 시에도 유지되는 Activity 스코프 내에서 범위가 지정된(scoped) 정의를 선언합니다. [Android 스코프](/docs/reference/koin-android/scope)를 참조하세요.

### @FragmentScope {id="fragmentscope"}

패키지: `org.koin.android.annotation` (Android 전용). 타깃: `CLASS`, `FUNCTION`. 파라미터 없음.

```kotlin
@FragmentScope
class ListAdapterFactory
```

Fragment 스코프 내에서 범위가 지정된(scoped) 정의를 선언합니다. [Android 스코프](/docs/reference/koin-android/scope)를 참조하세요.

### @ScopeId {id="scopeid"}

타깃: `VALUE_PARAMETER`

| 파라미터 | 타입 | 기본값 | 설명 |
|-----------|------|---------|-------------|
| `value` | `KClass<*>` | `Unit::class` | 스코프 타입. 스코프 ID는 클래스의 전체 이름(full name)입니다 |
| `name` | `String` | `""` | 스코프 ID |

```kotlin
@Factory
class ProfileService(@ScopeId(name = "user_session") val session: UserSession)
```

현재 스코프 대신 해당 ID를 가진 스코프로부터 파라미터를 해결합니다(`getScope("user_session").get()`으로 생성됨). 스코프는 런타임에만 존재하므로 컴파일 타임 안전성 검사에서는 이를 확인하지 않습니다. 관련 개념: [스코프](/docs/reference/koin-core/scopes).

## 한정자 (Qualifiers) {id="qualifiers"}

### @Named {id="named"}

타깃: `CLASS`, `FUNCTION`, `VALUE_PARAMETER`

| 파라미터 | 타입 | 기본값 | 설명 |
|-----------|------|---------|-------------|
| `value` | `String` | `""` | 문자열 한정자 |
| `type` | `KClass<*>` | `Unit::class` | 타입 한정자. 컴파일러 플러그인에서는 대신 `@Qualifier(Type::class)`를 사용하세요 |

```kotlin
@Singleton
@Named("local")
class LocalDatabase : Database

@Singleton
class UserRepository(@Named("local") private val database: Database)
```

정의와 파라미터에 동일한 문자열을 지정하여 서로를 연결합니다. `jakarta.inject.Named` 및 `javax.inject.Named`도 동일한 방식으로 해석됩니다. 관련 개념: [한정자](/docs/reference/koin-core/qualifiers).

### @Qualifier {id="qualifier"}

타깃: `CLASS`, `FUNCTION`, `VALUE_PARAMETER`

| 파라미터 | 타입 | 기본값 | 설명 |
|-----------|------|---------|-------------|
| `value` | `KClass<*>` | `Unit::class` | 타입 한정자 |
| `name` | `String` | `""` | 문자열 한정자 |

```kotlin
@Singleton
@Qualifier(Remote::class)
class RemoteDataSource : DataSource

@Singleton
class UserRepository(@Qualifier(Remote::class) private val source: DataSource)
```

`@Qualifier`는 직접 커스텀 한정자 어노테이션을 지정할 때도 사용됩니다. `@Qualifier` 또는 `@Named`(또는 `jakarta.inject.Qualifier`, `javax.inject.Qualifier`)로 주석이 달린 모든 어노테이션 클래스는 한정자가 됩니다.

```kotlin
@Qualifier
annotation class IoDispatcher

@Singleton
@IoDispatcher
fun ioDispatcher(): CoroutineDispatcher = Dispatchers.IO
```

인자가 없는 커스텀 한정자는 어노테이션 클래스에 대한 타입 한정자가 됩니다. 문자열 또는 enum 인자가 있는 경우(`@Dispatcher(AppDispatchers.IO)`), 해당 인자 값이 한정자가 됩니다. 관련 개념: [한정자](/docs/reference/koin-core/qualifiers).

## 파라미터 (Parameters) {id="parameters"}

### @InjectedParam {id="injectedparam"}

타깃: `VALUE_PARAMETER`. 파라미터 없음.

```kotlin
@Factory
class UserPresenter(@InjectedParam val userId: String, private val repository: UserRepository)

// 호출 측
val presenter: UserPresenter = get { parametersOf("user-42") }
```

이 값은 컨테이너가 아니라 호출 위치의 `parametersOf(...)`에서 제공됩니다. 컴파일 타임 안전성 검사를 통해 호출 측에서 올바른 개수와 타입의 값을 전달하는지 확인합니다(`KOIN-D005`, `KOIN-D006`). 관련 개념: [주입 파라미터](/docs/reference/koin-core/injection-parameters).

### @Property {id="property"}

타깃: `VALUE_PARAMETER`

| 파라미터 | 타입 | 기본값 | 설명 |
|-----------|------|---------|-------------|
| `value` | `String` | 필수 | 프로퍼티 키 |

```kotlin
@Factory
class ApiClient(@Property("api_url") val url: String)
```

`getProperty("api_url")`을 통해 파라미터를 해결합니다. 동일한 키를 가진 `@PropertyValue`가 존재하면 폴백(fallback) 값으로 사용됩니다. 그렇지 않은 경우 빌드 시 경고 `KOIN-P001`이 표시되며 시작 시에 해당 프로퍼티를 반드시 설정해야 합니다. 관련 개념: [프로퍼티](/docs/reference/koin-core/starting-koin#properties).

### @PropertyValue {id="propertyvalue"}

타깃: `FIELD`

| 파라미터 | 타입 | 기본값 | 설명 |
|-----------|------|---------|-------------|
| `value` | `String` | 필수 | 프로퍼티 키 |

```kotlin
@PropertyValue("api_url")
val defaultApiUrl = "https://api.example.com"

@Factory
class ApiClient(@Property("api_url") val url: String)
```

프로퍼티가 설정되지 않았을 때 사용할 기본값을 선언합니다(`getProperty("api_url", defaultApiUrl)`로 생성됨).

### @Provided {id="provided"}

타깃: `CLASS`, `FUNCTION`, `VALUE_PARAMETER`. 파라미터 없음.

```kotlin
@Singleton
class AnalyticsService(@Provided val firebase: FirebaseAnalytics)
```

컴파일러 플러그인이 볼 수 있는 선언 없이도(플랫폼 객체, SDK, 나중에 로드되는 모듈 등) 런타임에 해당 타입을 사용할 수 있음을 컴파일 타임 안전성 검사에 알립니다. 클래스에 적용하면 해당 타입의 모든 사용에 대한 검사가 생략됩니다. 파라미터에 적용하면 해당 파라미터만 생략됩니다. 런타임 해결 방식에는 영향을 주지 않습니다. 일반적인 Android 타입(`Context`, `Activity`, `Fragment`, `SavedStateHandle`, `WorkerParameters` 등)에는 이 어노테이션을 사용할 필요가 없습니다. 관련 개념: [컴파일 타임 안전성](/docs/reference/koin-compiler/compile-safety#external-types-provided).

## 모듈 및 애플리케이션 (Modules and application) {id="modules-and-application"}

### @Module {id="module"}

타깃: `CLASS`

| 파라미터 | 타입 | 기본값 | 설명 |
|-----------|------|---------|-------------|
| `includes` | `Array<KClass<*>>` | `[]` | 포함할 다른 `@Module` 클래스들 |
| `createdAtStart` | `Boolean` | `false` | Koin 시작 시 모듈의 `single` 정의 생성 여부 |

```kotlin
@Module(includes = [NetworkModule::class])
class DataModule {

    @Singleton
    fun database(context: Context): AppDatabase =
        Room.databaseBuilder(context, AppDatabase::class.java, "app-db").build()
}
```

정의들을 그룹화합니다. 클래스 내부의 어노테이션된 함수들과 `@ComponentScan`에 의해 검색된 어노테이션 클래스들이 포함됩니다. 관련 개념: [모듈](/docs/reference/koin-core/modules).

### @ComponentScan {id="componentscan"}

타깃: `CLASS`, `FIELD`

| 파라미터 | 타입 | 기본값 | 설명 |
|-----------|------|---------|-------------|
| `value` | `vararg String` | 비어 있음 | 검색할 패키지. 비어 있으면 어노테이션이 적용된 클래스의 패키지를 검색함 |

```kotlin
@Module
@ComponentScan("com.myapp.data", "com.myapp.domain")
class AppModule
```

지정된 패키지 및 그 하위 패키지에 있는 모든 어노테이션 적용 클래스와 최상위 함수를 여러 Gradle 모듈에 걸쳐 모듈에 추가합니다. 관련 개념: [모듈](/docs/reference/koin-core/modules).

:::note
컴파일러 플러그인은 패키지 이름 및 그 하위 패키지와 매칭됩니다. KSP 프로세서의 glob 패턴(`com.example.**`, `com.*.service`)은 지원되지 않으므로 대신 패키지를 나열해야 합니다.
:::

### @Configuration {id="configuration"}

타깃: `CLASS`, `FIELD`

| 파라미터 | 타입 | 기본값 | 설명 |
|-----------|------|---------|-------------|
| `value` | `vararg String` | 비어 있음 | 구성 레이블. 비어 있으면 `"default"`를 의미함 |

```kotlin
@Module
@ComponentScan
@Configuration
class CoreModule            // 레이블 "default"

@Module
@Configuration("default", "test")
class FakeDataModule        // 레이블 "default" 및 "test"
```

`@KoinApplication`은 일일이 나열하지 않아도 자신의 구성 레이블 중 하나를 포함하는 모든 모듈(다른 Gradle 모듈의 모듈 포함)을 로드합니다. `@Configuration("default")`는 `@Configuration`과 동일합니다. 관련 개념: [모듈](/docs/reference/koin-core/modules).

### @KoinApplication {id="koinapplication"}

타깃: `CLASS`

| 파라미터 | 타입 | 기본값 | 설명 |
|-----------|------|---------|-------------|
| `configurations` | `Array<String>` | `[]` | 로드할 구성 레이블. 비어 있으면 `"default"` 로드 |
| `modules` | `Array<KClass<*>>` | `[Unit::class]` (없음) | 추가로 로드할 `@Module` 클래스들 |

```kotlin
@KoinApplication(modules = [AppModule::class])
object MyApp

fun main() {
    startKoin<MyApp> {
        printLogger()
    }
}
```

애플리케이션 진입점을 표시합니다. `startKoin<MyApp>()`, `koinApplication<MyApp>()` 또는 `koinConfiguration<MyApp>()`(`org.koin.plugin.module.dsl` 패키지)을 사용하여 시작합니다. 여기에서 컴파일 타임 안전성 검사가 전체 그래프를 검증합니다. `@Configuration`에서 가져온 모듈이 먼저 로드된 다음, `modules` 목록이 해당 순서대로 로드되므로 명시적 목록이 오버라이드 우선권을 갖습니다. 관련 개념: [Koin 시작하기](/docs/reference/koin-core/starting-koin).

## 모니터링 (Monitoring) {id="monitoring"}

### @Monitor {id="monitor"}

타깃: `CLASS`, `FUNCTION`. 파라미터 없음.

```kotlin
@Monitor
class UserService(private val repository: UserRepository) {
    fun findUser(id: String): User? = repository.findById(id)
}
```

컴파일러 플러그인이 함수 본문(또는 클래스의 모든 공개 함수)을 Kotzilla SDK 추적 코드로 래핑합니다. 클래스패스에 Kotzilla SDK(`io.kotzilla:kotzilla-core`)가 필요합니다. 없으면 빌드 시 경고 `KOIN-M001`이 표시되고 아무것도 추적되지 않습니다. 설정 및 수집되는 데이터: [모니터링](/docs/tooling/monitor).

## JSR-330 어노테이션 {id="jsr-330-annotations"}

컴파일러 플러그인은 `jakarta.inject` 및 `javax.inject` 어노테이션인 `@Singleton`, `@Named`, `@Inject`, `@Qualifier`도 함께 읽습니다. [JSR-330](/docs/reference/koin-android/jsr330)을 참조하세요.

## 제거된 어노테이션 {id="removed-annotations"}

`@ExternalDefinition`, `@MetaDefinition`, `@MetaModule`, `@MetaApplication`(`org.koin.meta.annotations` 패키지)은 KSP 프로세서가 내부 사용을 위해 자체 생성하던 어노테이션이었습니다. 컴파일러 플러그인은 이를 사용하지 않으며, 사용자가 직접 작성할 일도 없습니다.

## 관련 문서 {id="related"}

- [정의](/docs/reference/koin-core/definitions): 정의 타입, 바인딩, 생성자 파라미터.
- [모듈](/docs/reference/koin-core/modules): 실제 환경에서의 `@Module`, `@ComponentScan`, `@Configuration`.
- [컴파일 타임 안전성](/docs/reference/koin-compiler/compile-safety): 플러그인이 이 어노테이션들로부터 검사하는 내용.
- [컴파일러 플러그인 옵션](/docs/reference/koin-annotations/options): 플러그인의 Gradle 옵션.
- [DSL 레퍼런스](/docs/reference/koin-core/dsl): 각 어노테이션에 대응하는 DSL.