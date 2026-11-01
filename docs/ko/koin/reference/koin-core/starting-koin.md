---
title: Koin 시작하기
---

# Koin 시작하기

이 페이지에서는 Koin 컨테이너를 시작하는 방법, 시작 시 전달할 수 있는 옵션, `@KoinApplication`을 사용한 타입 안전한 시작(typed startup), 로깅, 프로퍼티, 그리고 나중에 모듈을 로드하거나 언로드하는 방법을 다룹니다. 모듈이 무엇인지 이미 알고 있다고 가정합니다([모듈](/docs/reference/koin-core/modules) 참조).

코드 예제는 Compiler Plugin DSL, Annotations, Constructor / Classic DSL의 세 가지 탭으로 제공됩니다. 원하는 방식을 선택하세요. 이 선택은 모든 페이지에 적용됩니다.

## Koin 시작 {id="start-koin"}

**Compiler Plugin DSL**
```kotlin
import org.koin.core.context.startKoin

fun main() {
    startKoin {
        printLogger()
        modules(appModule)
    }
}
```

**Annotations**
```kotlin
import org.koin.plugin.module.dsl.startKoin

@KoinApplication(modules = [AppModule::class])
class MyApp

fun main() {
    startKoin<MyApp> {
        printLogger()
    }
}
```

Koin 컴파일러 플러그인은 `startKoin<MyApp>()`을 `@KoinApplication`에 나열된 모듈과 자동으로 발견된 `@Configuration` 모듈들을 로드하는 `startKoin { }` 호출로 대체합니다. 자세한 내용은 [@KoinApplication을 사용한 타입 안전한 시작](#typed-startup-with-koinapplication)을 참조하세요.

**Constructor / Classic DSL**
```kotlin
import org.koin.core.context.startKoin

fun main() {
    startKoin {
        printLogger()
        modules(appModule)
    }
}
```

`startKoin`은 컨테이너를 생성하고 프로세스의 기본 컨텍스트인 `GlobalContext`에 등록합니다. 호출이 완료되면 모든 `get()`, `by inject()` 또는 플랫폼 API(`by viewModel()`, `koinInject()`)가 이 컨테이너로부터 의존성을 해결(resolve)합니다.

`startKoin`은 프로세스당 한 번만 호출할 수 있습니다. 두 번 호출하면 `KoinApplicationAlreadyStartedException`이 발생합니다. 시작한 후에 모듈을 추가하려면 [`loadKoinModules`](#load-and-unload-modules-at-runtime)를 사용하세요.

## 시작 옵션 {id="start-options"}

`startKoin { }` 블록 내부의 모든 설정은 컨테이너를 구성하는 데 사용됩니다:

```kotlin
startKoin {
    printLogger(Level.DEBUG)
    properties(mapOf("server_url" to "https://api.example.com"))
    allowOverride(false)
    modules(coreModule, networkModule)
    lazyModules(analyticsModule)
}
```

| 옵션 | 동작 설명 |
|--------|--------------|
| `modules(...)` | 모듈을 즉시 로드합니다. 단일 모듈, 여러 모듈 또는 `List<Module>`을 전달받습니다. |
| `lazyModules(...)` | 백그라운드에서 모듈을 로드합니다. `koin-core-coroutines`가 필요하며, [지연 모듈(Lazy Modules)](/docs/reference/koin-core/lazy-modules)을 참조하세요. |
| `printLogger(level)` | 콘솔에 로그를 출력합니다. [로깅](#logging)을 참조하세요. |
| `logger(logger)` | 직접 구현한 `Logger`를 사용합니다. |
| `properties(map)` | 맵으로부터 프로퍼티를 추가합니다. [프로퍼티](#properties)를 참조하세요. |
| `fileProperties(file)` | 클래스패스 파일(기본값은 `/koin.properties`)에서 프로퍼티를 로드합니다(JVM 전용). |
| `environmentProperties()` | 시스템 프로퍼티와 환경 변수를 로드합니다(JVM 전용). |
| `allowOverride(false)` | `.override()` 없이 두 정의가 동일한 타입을 선언할 경우 실패하도록 합니다. [정의 오버라이드](/docs/reference/koin-core/definitions#overriding-a-definition)를 참조하세요. |
| `strictOverride()` | `allowOverride(false)`와 동일합니다. |
| `createEagerInstances()` | `createdAtStart` 정의들을 지금 생성합니다. `startKoin`과 `koinApplication`은 블록 끝에서 이를 이미 수행하므로, `koinApplication(createEagerInstances = false)`를 사용할 때만 필요합니다. |

`startKoin` 블록은 호출 스레드에서 실행됩니다. 여기서 로드하는 모든 모듈과 모든 `createdAtStart` 정의는 시작 시간에 영향을 줍니다.

## @KoinApplication을 사용한 타입 안전한 시작 {id="typed-startup-with-koinapplication"}

[Koin 컴파일러 플러그인](/docs/setup/compiler-plugin)을 사용하면, `@KoinApplication` 애너테이션이 추가된 애플리케이션 클래스가 로드할 모듈을 선언합니다. 해당 클래스로부터 타입 안전한 호출을 통해 Koin을 시작할 수 있습니다:

```kotlin
@Module
@ComponentScan("com.myapp.data")
class DataModule

@Module(includes = [DataModule::class])
class AppModule

@KoinApplication(modules = [AppModule::class])
class MyApp
```

| 호출 | 결과 |
|------|--------|
| `startKoin<MyApp>()` | `GlobalContext`에서 `MyApp`의 모듈과 함께 Koin을 시작합니다. |
| `startKoin<MyApp> { ... }` | 위와 동일하며, 구성 블록(로거, 프로퍼티, 추가 DSL 모듈)을 함께 전달합니다. |
| `koinApplication<MyApp>()` | 전역에 등록되지 않는 격리된 `KoinApplication`을 생성합니다. |
| `koinConfiguration<MyApp>()` | Koin을 대신 시작해 주는 API(Compose `KoinApplication`, Ktor)를 위한 `KoinConfiguration`을 생성합니다. |
| `withConfiguration<MyApp>()` | 기존 `KoinApplication`에 `MyApp`의 모듈을 추가합니다(예: Ktor의 `install(Koin) { }` 내부). |

이 함수들은 `org.koin.plugin.module.dsl`에서 임포트됩니다. 이들은 컴파일러 스텁(compiler stub)입니다. 즉, 컴파일러 플러그인이 적용되지 않은 상태에서 실행하면 플러그인이 누락되었다는 메시지와 함께 런타임 에러가 발생합니다.

`@KoinApplication`은 두 개의 파라미터를 받습니다:

- `modules`: 명시적으로 로드할 `@Module` 클래스들.
- `configurations`: 탐색할 구성 라벨들. [구성 라벨](#configuration-labels)을 참조하세요.

각 `@Module` 클래스는 자신의 `includes`와 `@ComponentScan` 정의들을 가져옵니다. `startKoin<MyApp> { }`의 구성 블록은 일반적인 `startKoin` 블록이므로, 애너테이션 모듈과 DSL 모듈을 함께 혼합하여 사용할 수 있습니다:

```kotlin
startKoin<MyApp> {
    printLogger()
    modules(legacyDslModule)
}
```

### @KoinApplication 없이 @Module 클래스 로드하기 {id="loading-module-classes-without-koinapplication"}

일반적인 `startKoin { }` 또는 `koinApplication { }` 블록 내에서 `@Module` 클래스를 직접 로드할 수 있습니다:

```kotlin
import org.koin.plugin.module.dsl.module
import org.koin.plugin.module.dsl.modules

startKoin {
    module<NetworkModule>()
    modules(DataModule::class, CacheModule::class)
}
```

이 방식은 일부 모듈만 로드하려는 테스트 환경에서 유용합니다. `module<T>()`와 `modules(vararg KClass)` 역시 컴파일러 스텁이며, 플러그인이 이미 코드를 재작성하는 `startKoin<T> { }` 내부에서는 작동하지 않습니다.

:::note
컴파일러 플러그인을 사용할 때는 호출할 `AppModule().module` 확장 프로퍼티가 존재하지 않습니다. 애너테이션 기반 모듈은 위에서 살펴본 것처럼 `@KoinApplication`과 `startKoin<T>()`를 사용하거나 `module<T>()`를 통해 로드하세요.
:::

### 구성 라벨 {id="configuration-labels"}

`@Configuration` 태그가 지정된 `@Module`은 클래스패스 상의 다른 Gradle 모듈에 속한 것을 포함하여 `@KoinApplication`에 의해 자동으로 검색됩니다([@Configuration을 통한 자동 탐색](/docs/reference/koin-core/modules#auto-discovery-with-configuration) 참조). 라벨을 사용하면 이러한 모듈 중 로드할 대상을 선택할 수 있습니다:

```kotlin
@Module
@Configuration
class CoreModule

@Module
@Configuration("prod")
class ProdDatabaseModule

@Module
@Configuration("test")
class TestDatabaseModule

@Module
@Configuration("default", "test")
class LoggingModule
```

```kotlin
@KoinApplication
class MyApp // CoreModule 및 LoggingModule 로드

@KoinApplication(configurations = ["default", "prod"])
class ProdApp // CoreModule, LoggingModule, ProdDatabaseModule 로드

@KoinApplication(configurations = ["test"])
class TestApp // TestDatabaseModule 및 LoggingModule 로드
```

규칙은 다음과 같습니다:

- 값이 지정되지 않은 `@Configuration`은 `"default"` 라벨을 의미합니다. `@Configuration("default")`와 동일합니다.
- `configurations`가 지정되지 않은 `@KoinApplication`은 `"default"` 라벨만 로드합니다.
- 라벨 목록을 지정하면 해당 라벨들만 로드됩니다. 기본 모듈도 계속 로드하려면 목록에 `"default"`를 추가하세요.
- 하나의 모듈에 여러 라벨을 지정할 수 있습니다.

## koinApplication을 사용한 격리된 인스턴스 {id="isolated-instance-with-koinapplication"}

`koinApplication { }`은 `GlobalContext`에 등록되지 않는 컨테이너를 생성합니다:

```kotlin
val koinApp = koinApplication {
    modules(sdkModule)
}

val service = koinApp.koin.get<SdkService>()
```

전역 API(`KoinComponent`, Activity 내의 `by inject()`)는 이 컨테이너를 인식하지 못합니다. 호스트 앱의 컨테이너를 공유하지 않아야 하는 라이브러리 및 SDK나 독립된 인스턴스가 필요한 테스트에 사용하세요. 전체 패턴은 [컨텍스트 격리(Context Isolation)](/docs/reference/koin-core/context-isolation)에 설명되어 있습니다.

`koinConfiguration { }`은 아무것도 시작하지 않고 설정만을 구성합니다. Compose의 `KoinApplication`이나 Ktor 플러그인과 같이 Koin을 직접 시작하는 API에 전달할 때 사용합니다.

## 플랫폼별 시작 방법 {id="starting-on-each-platform"}

- Android: `androidContext()` 및 `androidLogger()`와 함께 `Application.onCreate()`에서 Koin을 시작합니다. [Android에서 Koin 시작하기](/docs/reference/koin-android/start)를 참조하세요.
- Compose: `KoinApplication` 또는 `KoinMultiplatformApplication`을 사용하여 컴포저블 내에서 Koin을 시작합니다. [Compose용 Koin](/docs/reference/koin-compose/compose)을 참조하세요.
- Ktor: `Application` 모듈에 `Koin` 플러그인을 설치합니다. [Ktor용 Koin](/docs/reference/koin-ktor/ktor)을 참조하세요.
- Kotlin Multiplatform: `commonMain`에서 `initKoin()` 함수를 공유하고 각 플랫폼에서 호출합니다. [KMP 설정](/docs/reference/koin-core/kmp-setup)을 참조하세요.

## 런타임에 모듈 로드 및 언로드 {id="load-and-unload-modules-at-runtime"}

시작 후에도 전역 컨테이너에 모듈을 추가하거나 제거할 수 있습니다:

```kotlin
import org.koin.core.context.loadKoinModules
import org.koin.core.context.unloadKoinModules

if (premiumEnabled) {
    loadKoinModules(premiumModule)
}

// 이후 시점
unloadKoinModules(premiumModule)
```

두 함수 모두 단일 모듈 또는 `List<Module>`을 받습니다. `unloadKoinModules`는 모듈의 정의들을 제거하고 해당 인스턴스들을 폐기하므로, 이후 이 타입들에 대한 `get()` 호출은 실패합니다.

컴파일러 플러그인은 런타임에 조립되는 그래프를 검증할 수 없습니다. 모듈이 언제 로드되는지, 혹은 실제로 로드되는지 알 수 없기 때문입니다. 런타임에 로드되는 모듈에서 다른 정의가 필요로 하는 타입은 반드시 `@Provided`로 표시해야 하며, 플러그인은 해당 모듈 자체가 시작 시점에 로드되지 않은 것으로 보고합니다. [컴파일 타임 안전성(Compile-Time Safety)](/docs/reference/koin-compiler/compile-safety)을 참조하세요. 시작 속도를 높이기 위한 목적으로만 나중에 모듈을 로드하는 것이라면 대개 [지연 모듈(Lazy Modules)](/docs/reference/koin-core/lazy-modules)이 더 적합합니다.

## Koin 중지 {id="stop-koin"}

```kotlin
import org.koin.core.context.stopKoin

stopKoin()
```

`stopKoin()`은 전역 컨테이너를 종료합니다. 모든 인스턴스를 해제하고, 정의들의 `onClose` 콜백을 호출하며, `GlobalContext`를 정리합니다. 이후 `startKoin`을 다시 호출할 수 있습니다. 격리된 컨테이너의 경우 `KoinApplication`에서 `close()`를 호출하세요:

```kotlin
koinApp.close()
```

테스트에서는 다음 테스트가 깨끗한 상태에서 시작될 수 있도록 매 테스트가 끝난 후 Koin을 중지하세요. [테스트](/docs/reference/koin-test/testing)에서 이를 자동으로 처리해 주는 JUnit 룰을 확인할 수 있습니다.

## 로깅 {id="logging"}

Koin은 기본적으로 아무것도 로깅하지 않습니다(`EmptyLogger`). 시작 블록에서 로깅을 활성화하세요:

```kotlin
startKoin {
    printLogger(Level.DEBUG)
    modules(appModule)
}
```

`Level`에는 `DEBUG`, `INFO`, `WARNING`, `ERROR`, `NONE`이 있습니다. 각 로거의 기본 레벨은 `INFO`입니다.

| 로거 | 시작 옵션 | 플랫폼 | 아티팩트 |
|--------|--------------|----------|----------|
| `EmptyLogger` | (기본값) | 전체 | `koin-core` |
| `PrintLogger` | `printLogger()` | 전체 | `koin-core` |
| `AndroidLogger` | `androidLogger()` | Android (Logcat) | `koin-android` |
| `SLF4JLogger` | `slf4jLogger()` | JVM | `koin-logger-slf4j` |

`DEBUG` 레벨에서 Koin은 각 모듈 로드와 각 의존성 해결(resolution) 과정을 소요 시간과 함께 로깅합니다. 이는 느린 정의를 찾는 데 유용하지만, 프로덕션 환경에는 너무 상세(verbose)합니다.

다른 곳으로 로그를 전송하려면 `Logger`를 상속받아 `logger()`로 전달하세요:

```kotlin
import org.koin.core.logger.Level
import org.koin.core.logger.Logger
import org.koin.core.logger.MESSAGE

class AppLogger : Logger(Level.INFO) {
    override fun display(level: Level, msg: MESSAGE) {
        MyLogSystem.log(level.name, msg)
    }
}

startKoin {
    logger(AppLogger())
}
```

## 프로퍼티 {id="properties"}

프로퍼티(Properties)는 컨테이너에 저장되는 키-값 쌍입니다. URL이나 키와 같은 설정 값에 사용하세요.

### 프로퍼티 로드 {id="loading-properties"}

```kotlin
startKoin {
    properties(mapOf("server_url" to "https://api.example.com"))
    fileProperties()          // JVM: 클래스패스에서 /koin.properties를 읽음
    environmentProperties()   // JVM: 시스템 프로퍼티 및 환경 변수를 읽음
}
```

Android에서는 `androidFileProperties()`가 `assets` 폴더에서 `koin.properties`를 읽습니다. 런타임에 `Koin` 인스턴스에서 프로퍼티를 설정하고 읽을 수도 있습니다:

```kotlin
val koin = KoinPlatform.getKoin()
koin.setProperty("session_token", token)
val token: String? = koin.getProperty("session_token")
```

파일이나 환경 변수에서 로드된 값은 `String`입니다. 필요에 따라 직접 변환하세요(`getProperty<String>("timeout").toInt()`).

### 프로퍼티 주입 {id="injecting-properties"}

**Compiler Plugin DSL**
생성자 파라미터에 (`koin-annotations`의) `@Property` 애너테이션을 추가합니다:

```kotlin
class ApiClient(@Property("server_url") val url: String)

val networkModule = module {
    single<ApiClient>()
}
```

**Annotations**
```kotlin
@Singleton
class ApiClient(@Property("server_url") val url: String)
```

프로퍼티에 기본값을 지정하려면 동일한 키를 가진 최상위 값(top-level value)에 `@PropertyValue` 애너테이션을 추가합니다:

```kotlin
@PropertyValue("server_url")
val defaultServerUrl = "https://api.example.com"
```

생성된 코드는 `getProperty("server_url", defaultServerUrl)`을 읽으므로, 아무도 프로퍼티를 설정하지 않았을 때 `ApiClient`가 기본값을 받게 됩니다.

**Constructor / Classic DSL**
```kotlin
val networkModule = module {
    single { ApiClient(url = getProperty("server_url")) }

    // 기본값이 있는 경우
    single { ApiClient(url = getProperty("server_url", "https://api.example.com")) }
}
```

`getProperty(key)`는 프로퍼티가 없으면 예외를 발생시킵니다. `getPropertyOrNull(key)`는 대신 `null`을 반환합니다.

여러 곳에서 `getProperty`를 호출하는 대신, 하나의 설정 클래스에서 프로퍼티를 읽고 해당 클래스를 주입하는 방식을 권장합니다. 이렇게 하면 키들을 하나의 파일에서 관리할 수 있습니다.

## 제한 사항 {id="limits"}

- `startKoin`은 프로세스당 한 번만 실행됩니다. 다시 시작하기 전에 `stopKoin()`을 호출하세요.
- `fileProperties()`와 `environmentProperties()`는 JVM에서만 지원됩니다. 다른 플랫폼에서는 `properties()`로 맵을 전달하세요.
- 타입 안전한 시작(`startKoin<T>()`, `module<T>()`)에는 컴파일러 플러그인이 필요합니다. KSP 프로세서는 지원 중단(deprecated)되었으므로 [KSP에서 마이그레이션하기](/docs/migration/from-ksp-to-compiler-plugin)를 참조하세요.
- 시작 이후 `loadKoinModules`로 로드된 모듈은 컴파일 타임 그래프 검사에 포함되지 않습니다.

## 관련 문서 {id="related"}

- [모듈](/docs/reference/koin-core/modules): 정의 구조화, `includes()`, `@Module` 및 `@Configuration`.
- [정의](/docs/reference/koin-core/definitions): Koin이 생성하는 대상 선언, 즉시 생성(eager creation) 및 오버라이드.
- [지연 모듈](/docs/reference/koin-core/lazy-modules): 시작 시간을 단축하기 위해 백그라운드에서 모듈 로드.
- [컨텍스트 격리](/docs/reference/koin-core/context-isolation): SDK를 위해 격리된 컨테이너에서 Koin 실행.
- [컴파일러 플러그인 설정](/docs/setup/compiler-plugin): `startKoin<T>()`에 필요한 플러그인 설치.
- [Android에서 Koin 시작하기](/docs/reference/koin-android/start): `androidContext()`, `androidLogger()` 및 AndroidX Startup.