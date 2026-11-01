---
title: 확장 관리자 (Extension Manager)
---

# Extension Manager

Koin은 라이브러리 및 프레임워크 작성자를 위해 두 가지 확장 포인트(extension point)를 제공합니다. `KoinExtension`은 등록 시점과 종료 시점에 훅(hook)을 제공하여 Koin 컨테이너에 기능을 연결합니다. `ResolutionExtension`은 일치하는 정의가 없을 때 Koin에 또 다른 인스턴스 공급원을 제공합니다. 대부분의 애플리케이션에서는 둘 다 필요하지 않으므로 먼저 [정의(definitions)](/docs/reference/koin-core/definitions)를 사용하세요.

## KoinExtension {id="koinextension"}

`KoinExtension`은 ID로 컨테이너에 등록되는 객체입니다.

```kotlin
interface KoinExtension {
    fun onRegister(koin: Koin)
    fun onClose()
}
```

Koin은 확장을 등록할 때 `onRegister`를 호출하고, 컨테이너가 닫힐 때(`stopKoin()` 또는 `koinApplication.close()`) `onClose`를 호출합니다.

Koin 자체도 이 메커니즘을 사용합니다. [지연 모듈(lazy modules)](/docs/reference/koin-core/lazy-modules)의 기반이 되는 코루틴 엔진이 바로 `KoinCoroutinesEngine` 확장입니다.

### 확장 작성하기 {id="writing-an-extension"}

```kotlin
class AuditExtension : KoinExtension {
    private lateinit var koin: Koin

    override fun onRegister(koin: Koin) {
        this.koin = koin
    }

    override fun onClose() {
        // 리소스 해제
    }

    fun record(event: String) { ... }
}
```

### 확장 등록 및 조회하기 {id="registering-and-reading-it"}

`KoinApplication`에 확장을 등록하는 함수를 노출하고, `Koin`에 이를 다시 조회하는 프로퍼티를 노출합니다.

```kotlin
private const val AUDIT_EXTENSION = "audit"

fun KoinApplication.audit() {
    with(koin.extensionManager) {
        if (getExtensionOrNull<AuditExtension>(AUDIT_EXTENSION) == null) {
            registerExtension(AUDIT_EXTENSION, AuditExtension())
        }
    }
}

val Koin.audit: AuditExtension
    get() = extensionManager.getExtension(AUDIT_EXTENSION)
```

```kotlin
startKoin {
    audit()
    modules(appModule)
}

getKoin().audit.record("app_started")
```

| 함수 | 동작 |
|------|------|
| `registerExtension(id, extension)` | 확장을 저장하고 `onRegister`를 호출합니다. 동일한 ID를 가진 확장은 대체됩니다. |
| `getExtension<T>(id)` | 확장을 반환합니다. 확장이 없으면 "Koin extension 'id' not found."와 함께 실패합니다. |
| `getExtensionOrNull<T>(id)` | 확장을 반환하거나, 없으면 `null`을 반환합니다. |

:::warning
`ExtensionManager`는 `@KoinInternalApi`로 표시되어 있습니다. 옵트인(opt-in)해야 하며, 지원 중단(deprecation) 주기 없이 버전 간에 API가 변경될 수 있습니다.
:::

## ResolutionExtension {id="resolutionextension"}

`ResolutionExtension`은 루트 스코프를 포함하여 현재 스코프의 정의, 스코프 소스 및 연결된 스코프 이후에도 일치하는 것이 없을 때 인스턴스를 요청받습니다.

```kotlin
interface ResolutionExtension {
    val name: String
    fun resolve(scope: Scope, instanceContext: ResolutionContext): Any?
}
```

`instanceContext.clazz`(한정자(qualifier)를 사용하는 경우 `instanceContext.qualifier` 포함)에 해당하는 인스턴스를 반환하거나, Koin이 계속 진행하여 `NoDefinitionFoundException`으로 실패하도록 `null`을 반환하세요.

Koin은 [Ktor DI 브리지](/docs/reference/koin-ktor/ktor-bridge)에서 Ktor의 의존성 주입으로부터 인스턴스를 읽어오기 위해 이 기능을 사용합니다.

### 예제: 다른 컨테이너의 인스턴스 {id="example-instances-from-another-container"}

```kotlin
class LegacyContainerResolution(
    private val legacy: Map<KClass<*>, Any>,
) : ResolutionExtension {

    override val name: String = "legacy-container"

    override fun resolve(scope: Scope, instanceContext: ResolutionContext): Any? =
        legacy[instanceContext.clazz]
}
```

애플리케이션의 `koin`에서 `addResolutionExtension`을 사용하여 등록합니다.

```kotlin
@OptIn(KoinExperimentalAPI::class)
fun startApp(legacy: Map<KClass<*>, Any>) {
    startKoin {
        koin.addResolutionExtension(LegacyContainerResolution(legacy))
        modules(appModule)
    }
}
```

이제 `appModule`에서 레거시 맵에만 존재하는 타입을 필요로 하는 정의는 확장으로부터 해당 타입을 가져옵니다.

컴파일러 플러그인을 사용하는 경우 확장에서만 제공하는 타입은 빌드 시점에 알 수 없으므로 컴파일 타임 안전성 검사에서 누락된 것으로 보고됩니다. 이를 제공된 것으로 표시하세요. 자세한 내용은 [컴파일 타임 안전성](/docs/reference/koin-compiler/compile-safety)을 참조하세요.

`addResolutionExtension`은 `@KoinExperimentalAPI`로 표시되어 있습니다.

## 제약 사항 {id="limits"}

- **내부 및 실험용 API**: 두 확장 포인트 모두 Koin 버전 간에 변경될 수 있습니다.
- **해결 확장의 라이프사이클 미지원**: Koin은 `ResolutionExtension`이 반환하는 인스턴스를 캐싱하지 않습니다. 필요한 경우 직접 캐싱해야 합니다.
- **가장 마지막 순위**: 일치하는 정의가 있는 경우 해결 확장에는 절대 요청되지 않습니다. 따라서 정의를 재정의(override)할 수 없습니다.
- **스레드 안전성**: `resolve`는 여러 스레드에서 동시에 호출될 수 있습니다.

## 관련 문서 {id="related"}

- [지연 모듈 (Lazy Modules)](/docs/reference/koin-core/lazy-modules): 코루틴 엔진 확장을 기반으로 구축된 기능입니다.
- [Ktor DI 브리지 (Ktor DI Bridge)](/docs/reference/koin-ktor/ktor-bridge): 실제 적용된 해결 확장 예시입니다.
- [컴파일 타임 안전성 (Compile-Time Safety)](/docs/reference/koin-compiler/compile-safety): Koin 외부에서 제공되는 의존성 선언.
- [Koin 시작하기 (Starting Koin)](/docs/reference/koin-core/starting-koin): 확장이 등록되는 애플리케이션 DSL.
- [스코프 (Scopes)](/docs/reference/koin-core/scopes): 스코프 내부의 해석 순서.