---
title: 컨텍스트 격리
---

# 컨텍스트 격리 (Context Isolation)

격리된 컨텍스트(Isolated context)는 글로벌 컨텍스트(global context)에 등록되지 않는 Koin 컨테이너입니다. 이 페이지에서는 SDK나 라이브러리를 위해 격리된 컨텍스트를 생성하는 방법, 클래스가 이 컨텍스트로부터 의존성을 해결(resolve)하도록 만드는 방법, 그리고 이를 테스트하는 방법을 설명합니다. 이 문서는 독자가 [Koin 시작하기](/docs/reference/koin-core/starting-koin)를 알고 있다고 가정합니다.

## 격리해야 하는 이유 {id="why-isolate"}

`startKoin`은 글로벌 컨텍스트(`GlobalContext`)에 하나의 컨테이너를 등록합니다. 모든 `KoinComponent`와 모든 `by inject()`는 이 글로벌 컨텍스트에서 읽어오며, 두 번째로 `startKoin`을 호출하면 `KoinApplicationAlreadyStartedException`이 발생하며 실패합니다.

라이브러리가 `startKoin`을 호출하면 단 하나의 슬롯을 두고 호스트 애플리케이션과 충돌하게 되며, 라이브러리의 정의(definition)가 앱의 정의를 덮어쓸 수 있습니다. 따라서 라이브러리는 `startKoin` 대신 `koinApplication`을 사용해 자체 컨테이너를 생성하고 private으로 유지해야 합니다.

## 격리된 컨텍스트 생성하기 {id="creating-an-isolated-context"}

`koinApplication`은 컨테이너를 전역적으로 등록하지 않고 `startKoin`과 동일한 DSL을 사용하여 컨테이너를 빌드합니다. 이를 SDK의 `object` 내에 보관하세요:

**Compiler Plugin DSL**
```kotlin
import org.koin.dsl.koinApplication
import org.koin.dsl.module
import org.koin.plugin.module.dsl.*

internal val sdkModule = module {
    single<SdkRepository>()
    single<SdkService>()
}

internal object SdkKoinContext {
    val koinApp = koinApplication {
        modules(sdkModule)
    }
    val koin = koinApp.koin
}
```

**Annotations**
```kotlin
import org.koin.plugin.module.dsl.koinApplication

@Module
@ComponentScan("com.example.sdk")
internal class SdkModule

@KoinApplication(modules = [SdkModule::class])
internal object SdkApplication

internal object SdkKoinContext {
    val koinApp = koinApplication<SdkApplication>()
    val koin = koinApp.koin
}
```

`koinApplication<T>()`는 `startKoin<T>()`와 마찬가지로 `@KoinApplication` 클래스의 모듈을 로드하지만, 컨테이너를 전역적으로 등록하지는 않습니다. SDK 컨테이너가 호스트 앱의 `@Configuration` 모듈을 가져오지 않도록 SDK 모듈을 명시적으로 나열하세요.

**Constructor / Classic DSL**
```kotlin
import org.koin.dsl.koinApplication
import org.koin.dsl.module
import org.koin.core.module.dsl.*

internal val sdkModule = module {
    singleOf(::SdkRepository)
    singleOf(::SdkService)
}

internal object SdkKoinContext {
    val koinApp = koinApplication {
        modules(sdkModule)
    }
    val koin = koinApp.koin
}
```

이 `object`는 처음 접근할 때 컨테이너를 생성합니다. 컨테이너의 시작과 중지 시점을 제어하려면(SDK API의 `init()` 및 `shutdown()`), 함수 내에서 컨테이너를 생성하고 종료 시 `koinApp.close()`를 호출하세요.

## 격리된 컨텍스트에서 의존성 해결하기 {id="resolving-from-the-isolated-context"}

`KoinComponent`는 기본적으로 글로벌 컨텍스트에서 읽어옵니다. internal 인터페이스에서 `getKoin()`을 오버라이드하고, SDK 클래스에서 해당 인터페이스를 사용하세요:

```kotlin
internal interface SdkKoinComponent : KoinComponent {
    override fun getKoin(): Koin = SdkKoinContext.koin
}

class SdkClient : SdkKoinComponent {
    // 호스트 앱이 아닌 SdkKoinContext에서 의존성을 해결함
    private val service: SdkService by inject()
}
```

Koin에 의해 생성된 클래스는 자신을 생성한 컨테이너로부터 생성자를 통해 의존성을 주입받습니다. 따라서 SDK의 진입점(호스트 앱이 직접 인스턴스화하는 클래스)에만 `SdkKoinComponent`가 필요합니다.

## 테스트 {id="testing"}

테스트에서는 `getKoin()`이 격리된 컨텍스트를 가리키도록 설정하고 여기에 테스트 모듈을 로드합니다:

```kotlin
class SdkClientTest : KoinTest {

    private val testModule = module {
        single<SdkService> { FakeSdkService() }
    }

    override fun getKoin(): Koin = SdkKoinContext.koin

    @Before
    fun setUp() {
        getKoin().loadModules(listOf(testModule))
    }

    @After
    fun tearDown() {
        getKoin().unloadModules(listOf(testModule))
    }
}
```

`testModule`은 `sdkModule` 이후에 로드되므로, 해당 모듈의 `SdkService`가 실제 구현을 덮어씁니다. 테스트에 대한 자세한 내용은 [테스트](/docs/reference/koin-test/testing)를 참조하세요.

## 플랫폼 지원 {id="platform-support"}

Compose와 Ktor는 격리된 컨텍스트를 사용할 수 있는 자체 API를 제공합니다:

- **Compose**: `KoinIsolatedContext`는 컴포저블 트리에 격리된 컨테이너를 제공합니다. [Compose에서의 격리된 컨텍스트](/docs/reference/koin-compose/isolated-context)를 참조하세요.
- **Ktor**: `KoinIsolated` 플러그인은 자체 컨테이너로 서버를 실행합니다. [Ktor에서의 격리된 컨텍스트](/docs/reference/koin-ktor/ktor-isolated)를 참조하세요.

## 제한 사항 {id="limits"}

- **글로벌 헬퍼 사용 불가**: `GlobalContext.get()`, `KoinPlatform.getKoin()` 또는 Activity에서의 기본 Android `by inject()`와 같이 글로벌 컨텍스트를 사용하는 최상위 함수는 격리된 컨테이너를 인식하지 못합니다. 대신 구현한 `SdkKoinComponent`를 사용하세요.
- **직접 관리해야 하는 생명주기**: Koin은 격리된 컨텍스트를 자동으로 닫지 않습니다. SDK가 종료될 때 `koinApp.close()`를 직접 호출하세요.
- **기본적으로 공유되지 않음**: 격리된 컨테이너는 호스트 앱의 정의(definition)를 인식할 수 없습니다. 호스트에서 필요한 항목은 `init(context)`와 같이 SDK API를 통해 직접 전달해야 합니다.

## 관련 문서 {id="related"}

- [Koin 시작하기](/docs/reference/koin-core/starting-koin): `startKoin`, `koinApplication` 및 애플리케이션 DSL.
- [Koin 컴포넌트](/docs/reference/koin-core/koin-component): `KoinComponent` 및 `getKoin()`.
- [Compose에서의 격리된 컨텍스트](/docs/reference/koin-compose/isolated-context): `KoinIsolatedContext`.
- [Ktor에서의 격리된 컨텍스트](/docs/reference/koin-ktor/ktor-isolated): `KoinIsolated` 플러그인.
- [테스트](/docs/reference/koin-test/testing): `KoinTest` 및 테스트 모듈.