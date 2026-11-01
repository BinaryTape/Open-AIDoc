---
title: 지연 모듈 (Lazy Modules)
---

# 지연 모듈 (Lazy Modules)

지연 모듈(lazy module)은 Koin이 `startKoin` 실행 중에 등록하는 대신 백그라운드 코루틴에서 등록하는 모듈입니다. 이 문서에서는 지연 모듈 선언, 병렬 로딩, 로딩 대기, 그리고 이 기능의 제한 사항에 대해 다룹니다. 독자가 [모듈](/docs/reference/koin-core/modules) 및 [Koin 시작하기](/docs/reference/koin-core/starting-koin)에 대해 이미 알고 있다고 가정합니다.

## 의존성 {id="dependency"}

지연 모듈은 `koin-core-coroutines` 아티팩트에 포함되어 있습니다:

```kotlin
// build.gradle.kts
implementation("io.insert-koin:koin-core-coroutines")
```

## 지연 모듈 선언하기 {id="declaring-a-lazy-module"}

`lazyModule`은 `module`과 동일한 내용을 전달받습니다. Koin이 모듈을 로드하기 전까지는 아무것도 생성되거나 할당되지 않습니다.

**Compiler Plugin DSL**
```kotlin
import org.koin.dsl.lazyModule
import org.koin.plugin.module.dsl.*

val analyticsModule = lazyModule {
    single<AnalyticsService>()
    single<EventTracker>()
}
```

**Annotations**
어노테이션 모듈(`@Module`)은 시작 시점에 로드되며 지연 모듈로 선언할 수 없습니다. 일부 정의를 백그라운드에서 로드하려면 원하는 DSL 형태(Compiler Plugin, Constructor 또는 Classic DSL)로 `lazyModule` 안에 선언하세요.

**Constructor / Classic DSL**
```kotlin
import org.koin.dsl.lazyModule
import org.koin.core.module.dsl.*

val analyticsModule = lazyModule {
    singleOf(::AnalyticsService)
    singleOf(::EventTracker)
}
```

지연 모듈은 다른 지연 모듈을 포함할 수 있습니다:

```kotlin
val dataModule = lazyModule {
    single<UserRepository>()
}

val featureModule = lazyModule {
    includes(dataModule)
    single<FeatureService>()
}
```

## 지연 모듈 로드하기 {id="loading-lazy-modules"}

`startKoin`의 `lazyModules()`에 지연 모듈을 전달합니다. `modules()`에 전달된 모듈은 `startKoin`이 반환되기 전에 호출한 스레드에서 로드됩니다. 반면 지연 모듈은 백그라운드 코루틴에서 로드됩니다:

```kotlin
startKoin {
    modules(coreModule)
    lazyModules(analyticsModule, reportingModule)
}
```

Koin 4.2부터는 각 지연 모듈이 별도의 코루틴에서 로드되므로, 여러 지연 모듈이 병렬로 로드됩니다. 4.2 이전에는 순차적으로 로드되었습니다.

`lazyModules()`는 필요한 경우 Koin 코루틴 엔진을 설정합니다. 이는 플랫폼 기본 디스패처(JVM 및 Native의 경우 `Dispatchers.Default`)에서 실행됩니다. 다른 디스패처를 선택하려면 `dispatcher`를 전달하세요:

```kotlin
startKoin {
    lazyModules(databaseModule, networkModule, dispatcher = Dispatchers.IO)
}
```

디스패처는 첫 번째 `lazyModules()` 호출 시 코루틴 엔진이 생성될 때 설정됩니다. 이후 호출에서 전달된 `dispatcher`는 아무런 효과가 없습니다.

## 지연 모듈 대기하기 {id="waiting-for-lazy-modules"}

지연 모듈의 정의는 해당 모듈이 로드될 때까지 사용할 수 없습니다. 인스턴스를 조회(resolve)하기 전에 로딩이 완료될 때까지 대기하세요:

| 함수 | 플랫폼 | 동작 |
|----------|----------|----------|
| `Koin.awaitAllStartJobs()` | 전체 | 모든 지연 모듈이 로드될 때까지 일시 중단(suspend) |
| `Koin.onKoinStarted { koin -> }` | 전체 | 로드될 때까지 일시 중단한 후, 블록을 실행 |
| `Koin.waitAllStartJobs()` | 전체 | 로드될 때까지 스레드를 차단(block). JS에서는 차단하지 않고 경고를 기록 |
| `Koin.runOnKoinStarted { koin -> }` | JVM | 로드될 때까지 차단한 후, 블록을 실행 |
| `Koin.isAllStartedJobsDone()` | 전체 | 모든 지연 모듈이 로드되었으면 `true` 반환 |

코루틴에서 대기하는 경우:

```kotlin
suspend fun trackAppStart() {
    val koin = KoinPlatform.getKoin()
    koin.awaitAllStartJobs()
    koin.get<AnalyticsService>().trackAppStart()
}
```

블로킹 코드에서 대기하는 경우:

```kotlin
startKoin {
    lazyModules(analyticsModule)
}

KoinPlatform.getKoin().waitAllStartJobs()
val analytics = KoinPlatform.getKoin().get<AnalyticsService>()
```

:::warning
앱 시작 중 Android 메인 스레드에서 `waitAllStartJobs()`를 호출하지 마세요. 모든 지연 모듈이 로드될 때까지 UI를 차단(block)하므로 지연 로딩의 이점이 사라집니다. 대신 코루틴에서 대기하세요.
:::

## Android 예제 {id="android-example"}

첫 화면에 필요한 항목은 `modules()`로 로드하고, 나머지는 백그라운드에서 로드합니다:

```kotlin
class MainApplication : Application() {
    override fun onCreate() {
        super.onCreate()

        startKoin {
            androidContext(this@MainApplication)
            modules(coreModule)
            lazyModules(analyticsModule, databaseModule, dispatcher = Dispatchers.IO)
        }
    }
}
```

지연 모듈로 적합한 항목: 분석(analytics), 크래시 리포팅(crash reporting), 특정 내비게이션 단계 이후에 표시되는 기능, 모듈 본문 실행 비용이 큰 정의 등. 첫 화면에서 주입받아 사용하는(resolve) 항목은 모두 `modules()`에 유지하세요.

## 제한 사항 {id="limits"}

- **일반 모듈에서 지연 모듈로의 의존성 금지**: 일반 모듈의 정의가 지연 모듈의 정의에 의존하는 경우, 지연 모듈이 로드되기 전에 이를 조회(resolve)하면 `NoDefinitionFoundException`이 발생하며 실패합니다. Koin은 이를 자동으로 확인해주지 않습니다.
- **지연 모듈은 시작 시점에 로드됨**: `lazyModules()`는 백그라운드에서 즉시 로딩을 시작합니다. 최초 사용 시점에 모듈을 로드하는 방식이 아닙니다.
- **모듈 등록만 지연됨**: 지연 로딩은 모듈 등록 작업을 메인 스레드 밖으로 옮기는 것뿐입니다. `single`은 여전히 해당 인스턴스를 요청하는 스레드에서 최초 요청 시 생성됩니다. 지연 모듈에서는 `createdAtStart` 사용을 피하세요. Koin은 `startKoin`의 끝에서 즉시 생성(eager) 인스턴스를 생성하므로, 아직 로드되지 않은 지연 모듈은 이 단계를 놓치게 됩니다.
- **어노테이션 미지원**: `@Module` 클래스는 지연 모듈로 선언할 수 없습니다.

:::tip
실제 기기에서 앱 시작 및 모듈 로딩에 걸리는 시간을 측정하려면 [운영 환경 모니터링 (Production Monitoring)](/docs/tooling/production-monitoring)을 참고하세요.
:::

## 관련 문서 {id="related"}

- [Modules](/docs/reference/koin-core/modules): 모듈 선언 및 `includes()`.
- [Starting Koin](/docs/reference/koin-core/starting-koin): `startKoin` 및 애플리케이션 DSL.
- [Definitions](/docs/reference/koin-core/definitions#eager-creation): `createdAtStart` 및 즉시 생성(eager creation).
- [Android Setup](/docs/reference/koin-android/start): Android `Application`에서 Koin 시작하기.
- [DSL Reference](/docs/reference/koin-core/dsl): 모든 DSL 키워드.