---
title: Android 모범 사례
---

# Android 모범 사례

이 페이지에서는 Koin 사용 시 누수, 크래시 또는 시크릿(secret) 노출을 유발하는 Android 관련 실수와 이를 방지하는 방법을 설명합니다. 이 문서는 [Android Scopes](/docs/reference/koin-android/scope) 및 [Starting Koin on Android](/docs/reference/koin-android/start)를 이미 숙지하고 있다고 가정합니다. 일반적인 모듈 구성 방법은 [Modules](/docs/reference/koin-core/modules)에서, 오류 메시지에 대한 설명은 [Troubleshooting](/docs/reference/koin-core/troubleshooting)에서 확인할 수 있습니다.

## 메모리 및 Context 누수 {id="memory-and-context-leaks"}

더 긴 수명주기를 가진 대상이 어떤 인스턴스에 대한 참조를 유지할 때 해당 인스턴스의 누수가 발생합니다. Android에서 흔히 발생하는 대상은 Activity입니다. `single`은 프로세스가 유지되는 동안 계속 살아있지만, Activity는 다음 화면 회전까지만 유지됩니다.

### single에 전달된 Activity {id="activity-passed-into-a-single"}

```kotlin
// 누수 발생: single이 첫 번째 Activity를 영구적으로 유지함
class UserActivity : AppCompatActivity() {
    private val tracker: ScreenTracker by inject { parametersOf(this) }
}

val appModule = module {
    single { params -> ScreenTracker(params.get<Activity>()) }
}
```

`single`은 첫 번째 호출 시의 파라미터를 사용하여 단 한 번만 생성됩니다. 이후의 호출에서는 여전히 첫 번째 Activity를 참조하고 있는 동일한 인스턴스를 반환받게 됩니다. 대신 다음 방법 중 하나를 사용하세요:

- Application context: 클래스에 리소스나 시스템 서비스만 필요한 경우, `Context`를 사용하는 `single`로 선언합니다. `single` 내부에서 `Context`는 `Application`입니다.
- Activity scope: 클래스에 Activity가 필요한 경우, `activityScope { }` 또는 `@ActivityScope`로 선언합니다. 이는 Activity별로 생성되며 Activity와 함께 해제됩니다.
- Factory with parameters: 호출자가 Activity를 전달하는 경우 `factory`를 사용하고, Activity 수명주기를 넘어서 결과를 유지하지 않도록 합니다.

Compiler Plugin은 `Context`, `Activity`, `Application`, `Fragment`, `SavedStateHandle`을 플랫폼에서 제공하는 타입으로 처리하므로 누락된 것으로 보고하지 않습니다. 또한 주어진 정의에서 `Activity` 파라미터가 안전한지 여부를 판단할 수 없으므로, 코드 리뷰에서 이를 직접 확인해야 합니다.

### 싱글톤이 보유한 리스너 {id="listeners-held-by-singletons"}

```kotlin
class UserRepository {
    private val listeners = mutableListOf<UserListener>()

    fun addListener(listener: UserListener) { listeners += listener }
    fun removeListener(listener: UserListener) { listeners -= listener }
}
```

Repository는 `single`입니다. Activity나 Fragment가 자신을 리스너로 등록하고 이를 제거하지 않으면, Repository가 화면 인스턴스를 계속 메모리에 유지하게 됩니다. 대응하는 수명주기 콜백(`onStart()`에 대해 `onStop()`, `onViewCreated()`에 대해 `onDestroyView()`)에서 리스너를 제거하거나, `Flow`를 노출하고 수집(collection)을 자동으로 취소해 주는 `repeatOnLifecycle`로 수집하세요.

### 소유자보다 오래 유지되는 스코프 인스턴스 {id="scoped-instances-that-outlive-their-owner"}

- Retained scope: `activityRetainedScope`는 화면 회전 시에도 유지됩니다. 이 스코프의 인스턴스는 Activity, View 또는 Fragment를 참조해서는 안 됩니다.
- Fragment scope: 이는 `onDestroyView()` 이후인 `onDestroy()` 시점에 닫힙니다. Fragment 스코프의 인스턴스에 View나 바인딩을 유지하지 마세요.
- ViewModel: Activity 스코프나 Fragment 스코프의 인스턴스를 ViewModel에 절대 주입하지 마세요. ViewModel은 화면 회전 시에도 유지되지만, Activity 스코프는 유지되지 않습니다.

이러한 규칙은 [Android Scopes](/docs/reference/koin-android/scope)에서 자세히 설명합니다.

### 직접 생성하는 스코프 {id="scopes-you-create-yourself"}

`activityScope()`, `fragmentScope()`, `ScopeActivity`, `ScopeFragment`, `ScopeService`는 수명주기에 맞춰 스코프를 닫습니다. `getKoin().createScope()`로 생성한 스코프에는 수명주기가 없으므로, 직접 닫아주지 않으면 스코프 내부의 모든 인스턴스가 메모리에 계속 남게 됩니다.

```kotlin
// 로그인 시
val sessionScope = getKoin().createScope<UserSession>(userId)

// 로그아웃 시
sessionScope.close()
```

## Android에서 디버깅하기 {id="debugging-on-android"}

문제를 조사하는 동안에는 디버그 레벨로 Logcat 로거를 활성화하세요:

```kotlin
startKoin {
    androidLogger(Level.DEBUG)
    androidContext(this@MainApplication)
    modules(appModule)
}
```

Logcat에서 `[Koin]` 태그로 필터링합니다. 디버그 레벨에서 Koin은 각 모듈 로드, 각 의존성 해결(resolution) 및 소요 시간, 열리거나 닫히는 각 스코프를 기록합니다. 릴리스 빌드에서는 `Level.ERROR` 또는 `Level.NONE`을 사용하세요.

Android에서만 발생하는 오류:

| 오류 | 일반적인 원인 |
|-------|-------------|
| `MissingAndroidContextException` | `startKoin`에 `androidContext()`가 누락됨 |
| `KoinApplication has not been started` | 매니페스트에 `Application` 클래스가 선언되지 않았거나, ContentProvider의 `onCreate()`에서 주입을 수행함 ([Android Entry Points](/docs/reference/koin-android/entry-points#contentprovider) 참조) |
| 스코프 타입에 대한 `NoDefinitionFoundException` | Activity 또는 Fragment에 스코프가 없음 (`ScopeActivity`, `AndroidScopeComponent`) |
| `ClosedScopeException` | 스코프가 이미 닫힌 `onDestroy()` 도중 또는 이후에 코드에서 스코프 인스턴스를 해결하려고 시도함. 해당 정리는 `onCloseScope()`에서 수행해야 함 |
| Worker가 "Could not instantiate" 오류로 실패함 | 기본 WorkManager 초기화 도구(initializer)가 매니페스트에 여전히 남아 있음 ([WorkManager](/docs/reference/koin-android/workmanager) 참조) |

Compiler Plugin을 사용하면 누락된 정의가 빌드 시점에 대신 보고됩니다 ([Compile-Time Safety](/docs/reference/koin-compiler/compile-safety) 참조).

:::tip
실제 사용자 세션에서의 해결 시간, 스코프 수명 및 Koin 오류를 확인하려면 [Production Monitoring](/docs/tooling/production-monitoring)을 참조하세요.
:::

## 시크릿 (Secrets) {id="secrets"}

APK는 압축을 풀 수 있습니다. 컴파일되어 포함된 내용이나 `assets/`에 저장된 모든 내용은 읽힐 수 있습니다:

- 하드코딩된 키: 모듈에 API 키를 문자열 리터럴로 직접 작성하지 마세요.
- Koin 프로퍼티: `androidFileProperties()`는 APK 내부에 포함되어 배포되는 `assets/koin.properties`를 읽습니다. 이는 설정 용도로만 사용해야 하며, 절대 시크릿 용도로 사용해서는 안 됩니다.
- `BuildConfig` 필드: 이 또한 APK 내부로 컴파일됩니다. 버전 관리 시스템(Git 등)으로부터 값을 숨길 수는 있지만, APK로부터 숨길 수는 없습니다.

런타임에 백엔드로부터 시크릿을 가져오거나 암호화된 스토리지에 토큰을 보관하고, 값 자체 대신 스토리지를 주입하세요:

```kotlin
class AuthInterceptor(private val tokens: TokenStore) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response =
        chain.proceed(
            chain.request().newBuilder()
                .header("Authorization", "Bearer ${tokens.currentToken()}")
                .build()
        )
}
```

`TokenStore`는 암호화된 스토리지를 기반으로 하는 `single`이며, `AuthInterceptor`는 `OkHttpClient` 정의에 추가됩니다 ([Android Library Integration](/docs/reference/koin-android/binding-patterns) 참조).

## Hilt 또는 Dagger에서 마이그레이션하기 {id="migrating-from-hilt-or-dagger"}

애노테이션 매핑, 모듈 마이그레이션 및 점진적 마이그레이션은 [Migrating from Hilt](/docs/reference/koin-android/hilt-migration)에서 다룹니다. `@Inject` 및 `jakarta.inject` 애노테이션을 유지하려면 [JSR-330 Annotations](/docs/reference/koin-android/jsr330)를 참조하세요.

## 관련 문서 {id="related"}

- [Android Scopes](/docs/reference/koin-android/scope): Activity, Fragment, retained 및 ViewModel 스코프의 수명주기.
- [Starting Koin on Android](/docs/reference/koin-android/start): `androidContext()`, 로깅 및 프로퍼티.
- [Troubleshooting](/docs/reference/koin-core/troubleshooting): 의존성 해결 오류 및 순환 참조(circular dependencies).
- [Lazy Modules](/docs/reference/koin-core/lazy-modules): 앱 시작 시 Koin 작업 줄이기.
- [Migrating from Hilt](/docs/reference/koin-android/hilt-migration): 기존 Hilt 앱을 Koin으로 전환하기.