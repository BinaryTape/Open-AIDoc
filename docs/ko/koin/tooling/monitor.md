---
title: "@Monitor"
---

# @Monitor

`@Monitor`는 클래스나 함수에 트레이싱(tracing) 대상임을 표시합니다. 빌드 시점에 Koin 컴파일러 플러그인이 모니터링 대상 함수의 본문을 Kotzilla SDK 트레이스 호출로 래핑하므로, 함수의 실행 시간과 에러가 Kotzilla 플랫폼에 표시됩니다. 이 페이지에서는 Kotzilla SDK의 유무에 따라 이 어노테이션이 어떻게 동작하는지 설명합니다. 여기서는 [Koin 컴파일러 플러그인](/docs/setup/compiler-plugin)이 이미 설정되어 있다고 가정합니다.

## Kotzilla 없는 기본 제공 모니터링 {id="built-in-monitoring-without-kotzilla"}

런타임에 어떤 일이 일어나는지 확인하는 Koin의 기본 제공 방식은 로거(logger)입니다. 로거는 모듈 로딩 및 인스턴스 생성을 콘솔이나 Logcat에 출력합니다. [로깅](/docs/reference/koin-core/starting-koin#logging)을 참고하세요.

`@Monitor` 자체만으로는 아무 작업도 수행하지 않습니다. 컴파일 클래스패스에 Kotzilla SDK가 없으면, 컴파일러 플러그인은 모니터링 대상 함수를 변경하지 않고 컴파일당 하나의 경고만 보고합니다:

```
KOIN-M001: @Monitor: Kotzilla SDK not found on classpath - monitoring disabled
```

코드는 어노테이션이 없는 것처럼 컴파일되고 실행됩니다. 공통 코드에 `@Monitor`를 유지하면서, 트레이스하고 싶은 빌드에만 SDK를 추가할 수 있습니다.

## 클래스 또는 함수에 어노테이션 지정하기 {id="annotating-a-class-or-a-function"}

`@Monitor`는 다른 Koin 어노테이션과 함께 `org.koin.core.annotation` 패키지에 있습니다. 클래스에 붙여 해당 클래스의 모든 public 함수를 트레이스하거나, 개별 함수에 지정할 수 있습니다:

```kotlin
import org.koin.core.annotation.Monitor

@Monitor
class UserService(private val userRepository: UserRepository) {

    fun findUser(id: String): User? = userRepository.findById(id)

    suspend fun createUser(userData: UserData): User = userRepository.save(userData)

    private fun audit(user: User) { ... } // private: not traced
}

class SyncService(private val api: ApiService) {

    @Monitor
    suspend fun sync() { ... }
}
```

이 어노테이션은 클래스가 어노테이션 방식이든 어떤 DSL 형태(컴파일러 플러그인, 생성자 또는 클래식 DSL)이든 관계없이 동일하게 동작합니다. ViewModel도 모니터링할 수 있습니다:

```kotlin
@Monitor
class DetailViewModel(private val repository: Repository) : ViewModel() {
    fun loadData(id: String): StateFlow<Data> = repository.getData(id)
}
```

## 컴파일러 플러그인이 생성하는 것 {id="what-the-compiler-plugin-generates"}

클래스패스에 Kotzilla SDK가 있으면, 컴파일러 플러그인이 모니터링 대상 함수의 본문을 다시 작성합니다. `UserService` 클래스의 `findUser`는 다음과 같이 작성한 것처럼 컴파일됩니다:

```kotlin
fun findUser(id: String): User? =
    KotzillaCore.getDefaultInstance().trace("UserService.findUser") {
        userRepository.findById(id)
    }
```

규칙:

- **라벨**: `ClassName.functionName`, 최상위(top-level) 함수의 경우 함수 이름.
- **Suspend 함수**: `trace` 대신 `suspendTrace`로 래핑됩니다.
- **클래스 레벨의 `@Monitor`**: public 함수만 트레이스됩니다. private, protected, internal 함수, 생성자 및 기본 프로퍼티 접근자(accessor)는 트레이스되지 않습니다.
- **프록시 없음, `allOpen` 불필요**: 본문이 제자리에서 다시 작성됩니다. 클래스는 final 상태를 유지하며 Koin은 평소대로 클래스를 생성합니다.

빌드 중에 플러그인은 모니터링 대상 클래스를 다음과 같이 보고합니다:

```
@Monitor: UserService - tracing enabled (2 functions)
```

이 메시지는 기본적으로 경고(warning)입니다. 빌드에서 `allWarningsAsErrors`를 사용하는 경우 `koinCompiler { }` 블록에서 `logSeverity = "info"`로 설정하세요. 자세한 내용은 [컴파일러 플러그인 옵션](/docs/reference/koin-annotations/options)을 참고하세요.

## Kotzilla SDK와 함께 사용하기 {id="with-the-kotzilla-sdk"}

`@Monitor`는 두 단계에서 Kotzilla SDK가 필요합니다:

- **빌드 시점**: `io.kotzilla.sdk.KotzillaCore` 클래스가 컴파일 클래스패스에 있어야 합니다. 이 클래스는 `io.kotzilla:kotzilla-core`를 거쳐 `io.kotzilla:kotzilla-sdk` 의존성을 통해 제공됩니다.
- **런타임**: 트레이스가 기록되고 전송될 수 있도록 Koin 구성에서 SDK가 시작되어야 합니다.

둘 다 [프로덕션 모니터링](/docs/tooling/production-monitoring)에 설명된 표준 Kotzilla 설정의 일부입니다. SDK가 실행되면 모니터링 대상 함수에 대한 각 호출이 실행 시간 및 예외 발생 시 에러와 함께 기록됩니다. 이 정보는 Kotzilla 콘솔에서 확인할 수 있습니다.

:::warning
생성된 코드는 `KotzillaCore.getDefaultInstance()`를 호출합니다. 모니터링 대상 함수가 실행되기 전에 앱 시작 시점에 Kotzilla SDK를 시작해야 합니다.
:::

## Koin Annotations(KSP)와 함께 사용하기 {id="with-koin-annotations-ksp"}

KSP 프로세서(`koin-ksp-compiler`, Koin Annotations 2.2.0 이상)를 사용할 때 `@Monitor`는 다르게 작동합니다. KSP는 함수 본문을 다시 작성할 수 없기 때문에, 각 public 함수를 트레이스 호출로 오버라이드하는 `<ClassName>Proxy`라는 서브클래스를 생성하고, Koin 정의(definition)는 이 프록시를 사용합니다. 이로 인해 두 가지 결과가 발생합니다:

- **Open 클래스**: 모니터링 대상 클래스는 open 클래스여야 합니다. `annotation("org.koin.core.annotation.Monitor")`를 사용하여 `allOpen` Gradle 플러그인을 구성해야 합니다.
- **정의만 대상**: Koin 정의인 클래스만 프록시 처리됩니다.

컴파일러 플러그인이 이 메커니즘을 대체합니다. [KSP에서 컴파일러 플러그인으로 마이그레이션하기](/docs/migration/from-ksp-to-compiler-plugin)를 참고하세요.

## 제약 사항 {id="limits"}

- **전이적 트레이싱 미지원**: 어노테이션이 지정된 클래스나 함수만 트레이스됩니다. 모니터링 대상 클래스에 주입된 의존성은 자체적으로 `@Monitor`를 가지고 있지 않는 한 트레이스되지 않습니다.
- **로컬 데이터 미제공**: Kotzilla SDK가 없으면 아무것도 기록되지 않습니다. 로컬 디버깅에는 [Koin 로거](/docs/reference/koin-core/starting-koin#logging)를 사용하세요.
- **오버헤드**: 모니터링되는 모든 호출은 트레이스 호출을 거치게 됩니다. 모든 클래스가 아닌 측정하고자 하는 함수에만 어노테이션을 지정하세요.

## 관련 문서 {id="related"}

- [프로덕션 모니터링](/docs/tooling/production-monitoring): 트레이스를 기록하는 Kotzilla SDK 설정.
- [프로덕션 & 도구](/docs/tooling): 목적에 맞는 도구 선택 가이드.
- [Koin 시작하기](/docs/reference/koin-core/starting-koin#logging): 로컬 디버깅을 위한 Koin 로거.
- [컴파일러 플러그인 옵션](/docs/reference/koin-annotations/options): `logSeverity` 및 기타 플러그인 설정.
- [어노테이션 레퍼런스](/docs/reference/koin-annotations/annotations-inventory): 모든 Koin 어노테이션 목록.