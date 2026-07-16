---
title: 익스텐션 매니저 (Extension Manager)
---

# 익스텐션 매니저 (Extension Manager)

Koin은 프레임워크에 새로운 기능을 추가할 수 있는 익스텐션 시스템을 제공합니다. 이는 Koin을 외부 시스템과 통합하거나 커스텀 기능을 추가할 때 유용합니다.

## KoinExtension

Koin 익스텐션은 `KoinExtension` 인터페이스를 구현하는 클래스입니다:

```kotlin
interface KoinExtension {
    /**
     * 익스텐션이 등록될 때 호출됨
     */
    fun onRegister(koin: Koin)

    /**
     * Koin이 종료될 때 호출됨
     */
    fun onClose()
}
```

### 익스텐션 만들기

```kotlin
class MyCustomExtension : KoinExtension {
    private lateinit var koin: Koin

    override fun onRegister(koin: Koin) {
        this.koin = koin
        // 익스텐션 초기화
    }

    override fun onClose() {
        // 리소스 정리
    }

    fun doSomething() {
        // 익스텐션 로직
    }
}
```

### 익스텐션 등록하기

익스텐션을 등록하려면 `ExtensionManager`를 사용하세요:

```kotlin
fun KoinApplication.myExtension() {
    with(koin.extensionManager) {
        if (getExtensionOrNull<MyCustomExtension>(EXTENSION_ID) == null) {
            registerExtension(EXTENSION_ID, MyCustomExtension())
        }
    }
}

private const val EXTENSION_ID = "my-extension"
```

### 익스텐션에 접근하기

```kotlin
val Koin.myExtension: MyCustomExtension
    get() = extensionManager.getExtension(EXTENSION_ID)

// 사용법
val extension = getKoin().myExtension
extension.doSomething()
```

### Koin 설정에서 사용하기

```kotlin
startKoin {
    myExtension()  // 익스텐션 등록
    modules(appModule)
}
```

:::note
`ExtensionManager`는 `@KoinInternalApi`로 표시되어 있습니다. 이는 버전 간에 API가 변경될 수 있음을 의미합니다. 프로덕션 코드에서는 주의해서 사용하세요.
:::

## ResolutionExtension (리졸루션 익스텐션)

더 고급 사용 사례를 위해, Koin은 의존성 해결(dependency resolution) 프로세스에 관여할 수 있는 `ResolutionExtension`을 제공합니다. 이를 통해 외부 소스에서 인스턴스를 제공할 수 있습니다.

```kotlin
interface ResolutionExtension {
    /**
     * 식별을 위한 익스텐션 이름
     */
    val name: String

    /**
     * 의존성 해결 과정에서 호출됨
     * @param scope 현재 리졸루션 스코프
     * @param instanceContext 타입 정보가 포함된 리졸루션 컨텍스트
     * @return 인스턴스를 찾으면 해당 인스턴스, 그렇지 않으면 null 반환
     */
    fun resolve(scope: Scope, instanceContext: ResolutionContext): Any?
}
```

### 사용 사례

- 외부 DI 컨테이너와 통합
- 캐시 또는 풀(pool)에서 인스턴스 제공
- 런타임 조건에 따른 동적 인스턴스 해결
- 모의(mock) 제공자를 사용한 테스트

### 예시: 외부 인스턴스 제공자(External Instance Provider)

```kotlin
class ExternalInstanceProvider : ResolutionExtension {
    private val externalInstances = mutableMapOf<`KClass<*>`, Any>()

    override val name: String = "external-provider"

    override fun resolve(scope: Scope, instanceContext: ResolutionContext): Any? {
        return externalInstances[instanceContext.clazz]
    }

    fun <T : Any> registerInstance(clazz: KClass<T>, instance: T) {
        externalInstances[clazz] = instance
    }
}
```

### ResolutionExtension 등록하기

```kotlin
val externalProvider = ExternalInstanceProvider()
externalProvider.registerInstance(MyService::class, MyServiceImpl())

startKoin {
    // 리졸루션 익스텐션 등록
    koin.addResolutionExtension(externalProvider)

    modules(module {
        // 이제 외부 제공자로부터 MyService를 해결할 수 있습니다.
        single<MyComponent>()  // MyComponent는 MyService에 의존합니다.
    })
}
```

:::warning 실험적(Experimental) API
`ResolutionExtension` API는 `@KoinExperimentalAPI`로 표시되어 있습니다. 이 API는 향후 버전에서 변경될 수 있습니다.
:::

### 전체 예시

```kotlin
@OptIn(KoinExperimentalAPI::class)
fun resolutionExtensionExample() {
    val resolutionExtension = object : ResolutionExtension {
        val instanceMap = mapOf<`KClass<*>`, Any>(
            ComponentA::class to ComponentA()
        )

        override val name: String = "custom-resolver"

        override fun resolve(
            scope: Scope,
            instanceContext: ResolutionContext
        ): Any? {
            return instanceMap[instanceContext.clazz]
        }
    }

    val koin = koinApplication {
        printLogger(Level.DEBUG)
        koin.addResolutionExtension(resolutionExtension)
        modules(module {
            // ComponentB는 ComponentA에 의존합니다.
            // ComponentA는 익스텐션에서 해결됩니다.
            single { ComponentB(get()) }
        })
    }.koin

    val componentB = koin.get<ComponentB>()
    // componentB.a는 resolutionExtension에서 가져온 인스턴스입니다.
}
```

## 익스텐션 사용 시기

| 익스텐션 유형 | 사용 사례 |
|---------------|----------|
| `KoinExtension` | Koin에 기능 추가 (로깅, 모니터링, 커스텀 스코프 등) |
| `ResolutionExtension` | 리졸루션 과정에서 외부 소스의 인스턴스 제공 |

## 권장 사항

1. **제한적 사용** - 익스텐션은 복잡성을 증가시킵니다. 가능한 경우 표준 Koin 정의를 우선적으로 사용하세요.
2. **익스텐션 문서화** - 익스텐션이 무엇을 하는지, 어떻게 사용하는지 명확하게 작성하세요.
3. **정리 작업 처리** - 리소스 누수를 방지하기 위해 항상 `onClose()`를 구현하세요.
4. **스레드 안전성 고려** - 익스텐션은 여러 스레드에서 호출될 수 있습니다.

## 다음 단계

- **[스코프 (Scopes)](/docs/reference/koin-core/scopes)** - 커스텀 스코프 관리
- **[모듈 (Modules)](/docs/reference/koin-core/modules)** - 모듈 구성
- **[고급 패턴 (Advanced Patterns)](/docs/reference/koin-core/advanced-patterns)** - 더 고급 패턴들