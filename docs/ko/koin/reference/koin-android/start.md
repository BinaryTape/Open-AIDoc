---
title: Android에서 Koin 시작하기
---

# Android에서 Koin 시작하기

이 페이지에서는 Android 앱에서 Koin을 시작하는 방법을 설명합니다: `Application` 클래스, Android `Context`, Logcat 로거, 에셋(assets)의 프로퍼티, 시작 후 모듈 로딩, AndroidX App Startup 등을 다룹니다. 빌드에 `io.insert-koin:koin-android` 의존성이 추가되어 있다고 가정합니다([Gradle 설정](/docs/setup/gradle) 참조). 모든 플랫폼에서 `startKoin`이 수행하는 작업에 대해서는 [Koin 시작하기](/docs/reference/koin-core/starting-koin)를 참조하세요.

## Application 클래스에서 Koin 시작하기 {id="start-koin-in-your-application-class"}

`Application.onCreate()`에서 Koin을 한 번 시작합니다:

**Compiler Plugin DSL**
```kotlin
import org.koin.android.ext.koin.androidContext
import org.koin.android.ext.koin.androidLogger
import org.koin.core.context.startKoin

class MainApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        startKoin {
            androidLogger()
            androidContext(this@MainApplication)
            modules(appModule)
        }
    }
}
```

`appModule`은 컴파일러 플러그인 DSL(`single<UserRepository>()`, `viewModel<UserViewModel>()`)로 선언된 `module { }`입니다.

**Annotations**
```kotlin
import org.koin.android.ext.koin.androidContext
import org.koin.android.ext.koin.androidLogger
import org.koin.core.annotation.KoinApplication
import org.koin.plugin.module.dsl.startKoin

@KoinApplication
class MainApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        startKoin<MainApplication> {
            androidLogger()
            androidContext(this@MainApplication)
        }
    }
}
```

`startKoin<MainApplication>()`은 `@Configuration`으로 태그 지정된 모든 `@Module` 클래스를 로드합니다. 모듈을 직접 나열할 필요가 없습니다. 모듈을 명시적으로 선택하려면 `@KoinApplication(modules = [AppModule::class])`을 사용하세요. 모듈 탐색에 대한 설명은 [모듈](/docs/reference/koin-core/modules)을 참조하세요.

**Constructor / Classic DSL**
```kotlin
import org.koin.android.ext.koin.androidContext
import org.koin.android.ext.koin.androidLogger
import org.koin.core.context.startKoin

class MainApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        startKoin {
            androidLogger()
            androidContext(this@MainApplication)
            modules(appModule)
        }
    }
}
```

`AndroidManifest.xml`의 `<application>` 태그에 `android:name=".MainApplication"`으로 클래스를 등록해야 합니다. 등록하지 않으면 Android에서 이 클래스를 실행하지 않습니다.

`androidContext()`는 `Application` 인스턴스를 Koin에 추가하여 `Application`과 `Context` 모두에 바인딩합니다. `androidFileProperties()`나 `workManagerFactory()`와 같이 `Context`가 필요한 옵션을 호출하기 전에 먼저 호출해야 합니다.

## 정의(Definitions)에서 Android Context 사용하기 {id="android-context-in-definitions"}

`Context`가 필요한 클래스는 생성자에 이를 선언합니다. 한정자(Qualifier)는 필요하지 않습니다. Koin은 `Context`를 `androidContext()`에 전달된 인스턴스로 해석(resolve)합니다.

**Compiler Plugin DSL**
```kotlin
class PreferencesStore(private val context: Context)
class NotificationHelper(private val application: Application)

val androidModule = module {
    single<PreferencesStore>()
    single<NotificationHelper>()
}
```

**Annotations**
```kotlin
@Singleton
class PreferencesStore(private val context: Context)

@Singleton
class NotificationHelper(private val application: Application)
```

**Constructor / Classic DSL**
```kotlin
val androidModule = module {
    singleOf(::PreferencesStore)
    singleOf(::NotificationHelper)
}
```

람다 정의에서는 `androidContext()` 및 `androidApplication()`으로 이를 읽어옵니다: `single { PreferencesStore(androidContext()) }`.

| 함수 | 반환값 | 실패하는 경우 |
|----------|---------|------------|
| `androidContext()` | 가장 가까운 `Context`: `Application`, 또는 Activity 스코프 내의 Activity | 시작 시 `androidContext()`가 제공되지 않았을 때 (`MissingAndroidContextException`) |
| `androidApplication()` | 항상 `Application` 인스턴스 반환 | `androidContext()`에 `Application`이 제공되지 않았을 때 |

두 함수 모두 `org.koin.android.ext.koin`의 `get<Context>()` 및 `get<Application>()`에 대한 단축 함수입니다.

### 어떤 Context를 가져오게 되는가 {id="which-context-you-get"}

`single` 또는 루트 스코프에서 해석되는 모든 정의에서 `Context`는 `Application`입니다. 이는 앱의 수명 주기 동안 유지되는 객체에 안전합니다.

Activity 스코프에서 해석되는 정의에서는 `Context`가 먼저 Activity로 해석됩니다. Activity가 해당 스코프의 소스이기 때문입니다. 이를 통해 스코프가 지정된 프레젠터가 Activity를 가져올 수 있습니다. [Android 스코프](/docs/reference/koin-android/scope)를 참조하세요.

### Activity context {id="activity-context"}

`single`의 의존성으로 `Activity`를 선언하지 마세요. 싱글톤은 Activity가 파괴된 후에도 계속 유지되므로 Activity 누수(leak)가 발생합니다. 클래스에 Activity가 필요한 경우(화면 메트릭, 대화상자 등), Activity 내에서 클래스를 생성하거나, Activity를 [주입 매개변수(injected parameter)](/docs/reference/koin-core/injection-parameters)로 전달하거나, Activity 스코프에 선언하세요:

```kotlin
class ScreenMetrics(private val activity: Activity) {
    fun screenWidth(): Int = activity.resources.displayMetrics.widthPixels
}

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val metrics = ScreenMetrics(this)
    }
}
```

### 동일한 Android 타입의 여러 인스턴스 {id="several-instances-of-the-same-android-type"}

두 개의 `SharedPreferences` 파일처럼 두 정의가 동일한 타입을 공유하는 경우, [한정자(qualifier)](/docs/reference/koin-core/qualifiers)를 사용하여 구분합니다:

**Compiler Plugin DSL**
```kotlin
val preferencesModule = module {
    single(named("settings")) {
        androidContext().getSharedPreferences("settings", Context.MODE_PRIVATE)
    }
    single(named("session")) {
        androidContext().getSharedPreferences("session", Context.MODE_PRIVATE)
    }
}
```

**Annotations**
```kotlin
@Module
class PreferencesModule {

    @Singleton
    @Named("settings")
    fun settings(context: Context): SharedPreferences =
        context.getSharedPreferences("settings", Context.MODE_PRIVATE)

    @Singleton
    @Named("session")
    fun session(context: Context): SharedPreferences =
        context.getSharedPreferences("session", Context.MODE_PRIVATE)
}
```

**Constructor / Classic DSL**
```kotlin
val preferencesModule = module {
    single(named("settings")) {
        androidContext().getSharedPreferences("settings", Context.MODE_PRIVATE)
    }
    single(named("session")) {
        androidContext().getSharedPreferences("session", Context.MODE_PRIVATE)
    }
}
```

## 로깅 {id="logging"}

`androidLogger()`는 Koin 로그를 Logcat으로 전송합니다. 기본 레벨은 `Level.INFO`입니다:

```kotlin
startKoin {
    androidLogger(Level.DEBUG)
    androidContext(this@MainApplication)
    modules(appModule)
}
```

`Level.DEBUG`는 모든 의존성 해결 과정과 소요 시간을 기록하므로 누락된 정의를 디버깅할 때 유용합니다. 다만 해결 속도가 느려지므로 디버그 빌드용으로만 유지하는 것이 좋습니다: `androidLogger(if (BuildConfig.DEBUG) Level.DEBUG else Level.ERROR)`. 다른 로거에 대해서는 [Koin 시작하기](/docs/reference/koin-core/starting-koin)를 참조하세요.

## 에셋(Assets)에서 프로퍼티 읽기 {id="properties-from-assets"}

`androidFileProperties()`는 `src/main/assets`에 있는 파일에서 Koin 프로퍼티를 로드합니다. 기본 파일 이름은 `koin.properties`입니다:

```kotlin
startKoin {
    androidContext(this@MainApplication)
    androidFileProperties()                  // assets/koin.properties
    // androidFileProperties("app.properties")
    modules(appModule)
}
```

`Context`를 통해 파일을 읽으므로 `androidContext()` 뒤에 호출해야 합니다. 파일이 없으면 Koin은 이를 로깅하고 계속 진행합니다. 정의 내에서 프로퍼티를 읽는 방법은 [Koin 시작하기](/docs/reference/koin-core/starting-koin)를 참조하세요.

## 시작 후 모듈 로드하기 {id="loading-modules-after-start"}

`loadKoinModules()` 및 `unloadKoinModules()`를 사용하면 앱 실행 중에 모듈을 추가하거나 제거할 수 있습니다. Android에서는 몇 개의 화면에서만 사용되는 기능에 적합합니다:

```kotlin
private val premiumModules = lazy { loadKoinModules(premiumModule) }

class PremiumActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        premiumModules.value
        super.onCreate(savedInstanceState)
    }
}
```

- `super.onCreate()` 이전에 로드하세요: 그래야 시스템에 의해 복원된 프래그먼트가 의존성을 찾을 수 있습니다.
- 프로세스당 한 번만 로드하세요: 동일한 모듈을 다시 로드하면 정의가 재등록되어 오버라이드 경고가 기록되며, Koin이 `allowOverride(false)`로 실행 중인 경우 실패합니다.
- 언로드할 때는 주의하세요: `unloadKoinModules(premiumModule)`은 모듈 정의와 해당 인스턴스를 삭제합니다. 해당 기능이 더 이상 필요하지 않을 때만 언로드해야 하며, 구성 변경(configuration change) 시점에는 절대 언로드하지 마세요. 나중에 다시 로드할 계획이라면 로드된 상태를 직접 추적해야 합니다.

## 지연 모듈 (Lazy modules) {id="lazy-modules"}

대규모 앱에서는 `Application.onCreate()`에서 모든 모듈을 로드하면 메인 스레드의 시작 시간이 늘어납니다. `lazyModules()`를 사용하면 첫 화면에 필요한 모듈은 `modules()`로 로드하고, `lazyModule { }`로 표시한 모듈은 백그라운드 스레드에서 로드할 수 있습니다. 설정, 완료 대기 및 제한 사항은 [지연 모듈(Lazy Modules)](/docs/reference/koin-core/lazy-modules)을 참조하세요.

## AndroidX App Startup으로 시작하기 {id="start-with-androidx-app-startup"}

[AndroidX App Startup](https://developer.android.com/topic/libraries/app-startup)은 `Application.onCreate()` 이전에 단일 ContentProvider에서 초기화 프로그램을 실행합니다. `io.insert-koin:koin-androidx-startup` 아티팩트는 이러한 초기화 프로그램 중 하나로 Koin을 시작합니다. `Application`에서 `KoinStartup`을 구현하고 `onKoinStartup()`에서 설정을 반환하세요:

**Compiler Plugin DSL**
```kotlin
import org.koin.androix.startup.KoinStartup
import org.koin.dsl.koinConfiguration

@OptIn(KoinExperimentalAPI::class)
class MainApplication : Application(), KoinStartup {

    override fun onKoinStartup() = koinConfiguration {
        androidContext(this@MainApplication)
        modules(appModule)
    }
}
```

**Annotations**
```kotlin
import org.koin.androix.startup.KoinStartup
import org.koin.plugin.module.dsl.koinConfiguration

@KoinApplication
@OptIn(KoinExperimentalAPI::class)
class MainApplication : Application(), KoinStartup {

    override fun onKoinStartup() = koinConfiguration<MainApplication> {
        androidContext(this@MainApplication)
    }
}
```

**Constructor / Classic DSL**
```kotlin
import org.koin.androix.startup.KoinStartup
import org.koin.dsl.koinConfiguration

@OptIn(KoinExperimentalAPI::class)
class MainApplication : Application(), KoinStartup {

    override fun onKoinStartup() = koinConfiguration {
        androidContext(this@MainApplication)
        modules(appModule)
    }
}
```

`KoinStartup`은 `onCreate()`의 `startKoin` 호출을 대체하므로 둘 다 호출하지 마세요. 패키지명은 `org.koin.androix.startup`(철자 주의)이며, 해당 API에는 `@KoinExperimentalAPI`가 지정되어 있습니다.

다른 초기화 프로그램에 Koin이 필요한 경우, `KoinInitializer`에 종속되도록 설정하세요. App Startup은 초기화 프로그램을 직접 생성하므로, 초기화 프로그램 자체가 하나의 진입점(entry point)이 됩니다. 따라서 의존성을 가져오려면 `KoinComponent`를 구현해야 합니다.

```kotlin
class CrashTrackerInitializer : Initializer<Unit>, KoinComponent {

    private val crashTracker: CrashTracker by inject()

    override fun create(context: Context) {
        crashTracker.configure(context)
    }

    override fun dependencies(): List<Class<out Initializer<*>>> =
        listOf(KoinInitializer::class.java)
}
```

:::warning
`KoinStartup`은 여전히 앱 시작 중에 메인 스레드에서 실행됩니다. Koin의 시작 속도를 더 빠르게 만들어 주지는 않습니다. 다른 App Startup 초기화 프로그램들과 Koin의 실행 순서를 맞추는 용도로만 사용하세요. 모듈 로딩을 메인 스레드 외부로 옮기려면 [지연 모듈(Lazy Modules)](/docs/reference/koin-core/lazy-modules)을 사용하세요.
:::

## Application 클래스 외부에서 Koin 시작하기 {id="starting-koin-outside-the-application-class"}

프로세스당 한 번만 실행되고 첫 번째 주입 이전에 실행된다면 다른 클래스에서도 `startKoin`을 호출할 수 있습니다. Activity가 아닌 애플리케이션 컨텍스트를 전달하세요:

```kotlin
startKoin {
    androidContext(context.applicationContext)
    modules(appModule)
}
```

`startKoin`은 전역 인스턴스를 등록합니다. 자체 Koin 설정을 포함하는 라이브러리나 SDK는 호스트 앱과 충돌할 수 있으므로 이를 사용해서는 안 됩니다. 대신 격리된 컨텍스트(isolated context)를 사용하세요([컨텍스트 격리](/docs/reference/koin-core/context-isolation) 참조).

## 관련 문서 {id="related"}

- [Koin 시작하기](/docs/reference/koin-core/starting-koin): 모든 플랫폼에서의 `startKoin` 옵션, 로거 및 프로퍼티.
- [Android 진입점](/docs/reference/koin-android/entry-points): Activity, Fragment, Service 및 기타 컴포넌트에서의 주입.
- [Android 스코프](/docs/reference/koin-android/scope): 인스턴스를 Activity 또는 Fragment 수명 주기에 바인딩하기.
- [모듈](/docs/reference/koin-core/modules): 정의 구성 및 `@Configuration` 탐색 활용하기.
- [지연 모듈](/docs/reference/koin-core/lazy-modules): 백그라운드에서 모듈 로드하기.
- [멀티 모듈 앱](/docs/reference/koin-android/multi-module): Gradle 모듈 간 Koin 모듈 구성하기.