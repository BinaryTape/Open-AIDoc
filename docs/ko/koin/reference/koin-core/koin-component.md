---
title: KoinComponent
---

# KoinComponent

`KoinComponent`는 클래스가 Koin 컨테이너에 접근하여 `get()` 및 `by inject()`를 호출할 수 있도록 해주는 인터페이스입니다. 이 문서에서는 언제 이것이 필요한지, 어떻게 사용하는지, 그리고 왜 생성자 주입(constructor injection)이 권장되는지 설명합니다. 의존성 조회 함수 자체에 대한 내용은 [Injection](/docs/reference/koin-core/injection)을 참고하세요.

## KoinComponent는 언제 사용하나요 {id="when-to-use-koincomponent"}

Koin에 의해 생성되지 않으며 자체적인 Koin 확장 함수가 없는 클래스에 `KoinComponent`를 사용합니다:

- 진입점(Entry point): `main()` 클래스, CLI 명령어, 프레임워크나 리플렉션에 의해 생성되는 클래스.
- Koin 확장이 없는 Android 클래스: `BroadcastReceiver`, `ContentProvider`, 커스텀 `View`. [Android Entry Points](/docs/reference/koin-android/entry-points)를 참고하세요.
- 생성자를 직접 제어할 수 없는 콜백 및 리스너.
- 아직 생성자 주입으로 전환할 수 없는 레거시 코드.

다음과 같은 경우에는 필요하지 않습니다:

- 모듈에 선언된 클래스: 리포지토리(repository), 서비스, 유스케이스, ViewModel. Koin이 생성자를 통해 의존성을 전달합니다.
- `Activity`, `Fragment`, `Service`: Koin Android가 이들 클래스에 직접 `by inject()` 및 `by viewModel()`을 제공합니다.
- Composable 함수: `koinInject()`를 사용하세요. [Koin for Compose](/docs/reference/koin-compose/compose)를 참고하세요.

## KoinComponent 사용법 {id="use-koincomponent"}

인터페이스를 구현한 다음 `get()` 또는 `by inject()`를 호출합니다:

```kotlin
import org.koin.core.component.KoinComponent
import org.koin.core.component.get
import org.koin.core.component.inject

class SyncCommand : KoinComponent {

    // lazy: 최초 접근 시점에 주입됨
    private val syncService: SyncService by inject()

    // eager: SyncCommand가 생성될 때 주입됨
    private val logger: Logger = get()

    fun run() {
        logger.info("Starting sync")
        syncService.sync()
    }
}

fun main() {
    startKoin {
        modules(appModule)
    }
    SyncCommand().run()
}
```

어떤 방식을 사용하든 코드는 동일합니다. `KoinComponent`는 인스턴스를 조회하기만 할 뿐이며, 정의(definition)는 어떤 방식으로든 선언할 수 있습니다.

`get()`과 `inject()`는 확장 함수이므로 `org.koin.core.component`에서 import해야 합니다. 모든 조회 함수와 마찬가지로 한정자(qualifier)와 파라미터 블록을 전달받을 수 있습니다([Injection](/docs/reference/koin-core/injection#qualifiers-and-parameters-at-the-call-site) 참고).

`KoinComponent` 자체에는 `Koin` 인스턴스를 반환하는 단 하나의 함수 `getKoin()`이 있습니다. 그 외의 모든 작업에는 이를 사용합니다:

```kotlin
class FeatureLoader : KoinComponent {

    fun optionalTracker(): Tracker? = getKoin().getOrNull()

    fun apiUrl(): String = getKoin().getProperty("server_url", "https://api.example.com")

    fun allPlugins(): List<Plugin> = getKoin().getAll()
}
```

Nullable 조회 및 `getAll()`에 대한 내용은 [Injection](/docs/reference/koin-core/injection)에서 다룹니다. 프로퍼티(Property)에 대한 내용은 [Starting Koin](/docs/reference/koin-core/starting-koin#properties)에서 다룹니다.

### 커스텀 Android View {id="custom-android-view"}

커스텀 `View`는 레이아웃 인플레이터(layout inflater)에 의해 생성되므로 Koin이 생성자 파라미터를 전달할 수 없습니다. 이럴 때 `KoinComponent`가 적합합니다:

```kotlin
class ChartView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
) : View(context, attrs), KoinComponent {

    private val formatter: ChartFormatter by inject()

    fun setData(points: List<DataPoint>) {
        val formatted = formatter.format(points)
        // draw
    }
}
```

`View`에서는 `by inject()`를 사용하세요. 레이아웃 에디터는 실행 중인 Koin 컨테이너 없이 뷰를 생성하므로, 즉시 초기화되는 `get()`을 사용하면 오류가 발생합니다.

## KoinComponent가 사용하는 컨테이너 {id="which-container-koincomponent-uses"}

기본적으로 `getKoin()`은 `startKoin`으로 시작된 글로벌 컨테이너를 반환합니다. 아직 `startKoin`이 호출되지 않았다면 `get()`은 `IllegalStateException`("KoinApplication has not been started")을 던집니다.

자체적인 격리 컨테이너를 실행하는 라이브러리나 SDK는 `getKoin()`을 오버라이드하여 해당 컨테이너를 반환하도록 합니다:

```kotlin
object SdkKoinContext {
    val koinApp = koinApplication { modules(sdkModule) }
}

abstract class SdkComponent : KoinComponent {
    override fun getKoin(): Koin = SdkKoinContext.koinApp.koin
}

class SdkClient : SdkComponent() {
    private val api: SdkApi by inject() // SDK 컨테이너로부터 주입됨
}
```

전체 패턴은 [Context Isolation](/docs/reference/koin-core/context-isolation)에서 확인할 수 있습니다.

스코프(scope)를 소유하는 클래스의 경우 대신 `KoinScopeComponent`를 구현하세요. 그러면 `get()`과 `inject()`가 해당 스코프에서 의존성을 주입받습니다. [Scopes](/docs/reference/koin-core/scopes)를 참고하세요.

## 생성자 주입이 권장되는 이유 {id="why-constructor-injection-is-preferred"}

동일한 클래스의 두 가지 버전을 비교해 보세요:

**Compiler Plugin DSL**
```kotlin
// Koin에 의존하며, 의존성이 클래스 본문에 숨겨져 있음
class UserService : KoinComponent {
    private val repository: UserRepository by inject()
}

// 순수 Kotlin 클래스이며, 의존성이 생성자에 명시적으로 드러남
class UserService(private val repository: UserRepository)

val appModule = module {
    single<UserRepository>()
    single<UserService>()
}
```

**Annotations**
```kotlin
// Koin에 의존하며, 의존성이 클래스 본문에 숨겨져 있음
class UserService : KoinComponent {
    private val repository: UserRepository by inject()
}

// 순수 Kotlin 클래스이며, 의존성이 생성자에 명시적으로 드러남
@Singleton
class UserService(private val repository: UserRepository)
```

**Constructor / Classic DSL**
```kotlin
// Koin에 의존하며, 의존성이 클래스 본문에 숨겨져 있음
class UserService : KoinComponent {
    private val repository: UserRepository by inject()
}

// 순수 Kotlin 클래스이며, 의존성이 생성자에 명시적으로 드러남
class UserService(private val repository: UserRepository)

val appModule = module {
    singleOf(::UserRepository)
    singleOf(::UserService)
}
```

생성자 주입 버전이 다음 네 가지 측면에서 더 우수합니다:

- 명시적인 의존성: 클래스가 필요로 하는 의존성이 생성자에 나열됩니다. `KoinComponent`를 사용하면 본문을 직접 읽어보아야 합니다.
- Koin 없는 테스트: `UserService(FakeUserRepository())`처럼 직접 생성할 수 있습니다. `KoinComponent` 버전은 가짜 정의(fake definition)가 포함된 실행 중인 컨테이너가 필요합니다.
- 빌드 타임 검증: 컴파일러 플러그인이 선언된 클래스의 생성자 의존성을 그래프와 대조하여 검증합니다.
- 프레임워크 결합도 없음: Koin 없이도 클래스가 컴파일되고 실행되므로, 공용 코드와 라이브러리에 매우 중요합니다.

`KoinComponent`는 아키텍처의 최외곽 경계에만 유지하세요. 단 하나의 진입점이 최상위 객체를 조회하고, 그 아래의 모든 객체는 생성자 주입을 사용하는 방식이 좋습니다:

```kotlin
class SyncCommand : KoinComponent {
    private val syncService: SyncService by inject()
}

class SyncService(private val repository: UserRepository, private val api: ApiClient)
class UserRepository(private val database: Database)
```

## KoinComponent 테스트하기 {id="testing-a-koincomponent"}

`KoinComponent`를 구현하는 클래스는 글로벌 컨테이너에서 값을 읽어오므로, 테스트 실행 시 필요한 정의와 함께 Koin을 시작하고 완료 후 중지해야 합니다:

```kotlin
class SyncCommandTest : KoinTest {

    @get:Rule
    val koinTestRule = KoinTestRule.create {
        modules(module {
            single<SyncService> { FakeSyncService() }
            single<Logger> { TestLogger() }
        })
    }

    @Test
    fun `run calls sync`() {
        SyncCommand().run()
        // FakeSyncService에 대한 단언문(assert) 수행
    }
}
```

`KoinTestRule`은 각 테스트 전에 Koin을 시작하고 테스트 후에 중지합니다. 룰, 모킹(mocking), 모듈 검증은 [Testing](/docs/reference/koin-test/testing)에서 다룹니다.

## 관련 문서 {id="related"}

- [Injection](/docs/reference/koin-core/injection): `get()`, `inject()`, nullable 조회 및 `getAll()`.
- [Android Entry Points](/docs/reference/koin-android/entry-points): `KoinComponent`가 필요한 Android 클래스와 그렇지 않은 클래스.
- [Context Isolation](/docs/reference/koin-core/context-isolation): `KoinComponent`가 격리된 컨테이너를 가리키도록 설정하기.
- [Scopes](/docs/reference/koin-core/scopes): 스코프를 소유하는 클래스를 위한 `KoinScopeComponent`.
- [Testing](/docs/reference/koin-test/testing): Koin을 사용하는 클래스 테스트하기.