---
title: 왜 Koin인가요?
---

Koin은 모든 Kotlin 애플리케이션(멀티플랫폼, 안드로이드, 백엔드 등)에 의존성 주입(dependency injection)을 통합하는 쉽고 효율적인 방법을 제공합니다.

## Koin의 목표

Koin의 목표는 다음과 같습니다:
- 스마트한 API로 의존성 주입 인프라 **단순화(Simplify)**
- 읽기 쉽고 사용하기 쉬운 **Kotlin DSL**을 통해 어떤 종류의 애플리케이션이든 작성 가능
- **에코시스템 통합(Ecosystem Integration)** - 안드로이드 에코시스템부터 Ktor와 같은 백엔드 요구사항까지 다양한 종류의 통합 제공
- **유연성(Flexibility)** - 어노테이션(annotations) 사용 여부 선택 가능

---

## 간단히 살펴보는 Koin

### Kotlin 개발을 쉽고 생산적으로 만들기

Koin은 도구가 아닌 앱에 집중할 수 있게 해주는 스마트한 Kotlin 의존성 주입 라이브러리입니다.

```kotlin
class MyRepository()
class MyPresenter(val repository : MyRepository)

// 선언하기
val myModule = module {
  singleOf(::MyPresenter)
  singleOf(::MyRepository)
}
```

Koin은 Kotlin 관련 기술을 애플리케이션에 빌드 및 결합하고, 비즈니스를 쉽게 확장할 수 있도록 간단한 도구와 API를 제공합니다.

```kotlin
fun main() {

  // Koin 시작하기
  startKoin {
    modules(myModule)
  }
}
```

---

## 플랫폼 지원

### 안드로이드 지원

Kotlin 언어 덕분에 Koin은 안드로이드 플랫폼을 확장하며 기존 플랫폼의 일부로서 새로운 기능을 제공합니다.

```kotlin
class MyApplication : Application() {
  override fun onCreate() {
    super.onCreate()

    startKoin {
      androidLogger()
      androidContext(this@MyApplication)
      modules(myModule)
    }
  }
}
```

Koin은 `by inject()`나 `by viewModel()`을 사용하여 안드로이드 컴포넌트 어디에서나 의존성을 조회할 수 있는 쉽고 강력한 API를 제공합니다.

```kotlin
class MyActivity : AppCompatActivity() {

  val myPresenter : MyPresenter by inject()

}
```

:::info
**더 알아보기**: [안드로이드에서 Koin 시작하기](/docs/reference/koin-android/start)
:::

### Kotlin 멀티플랫폼 지원

모바일 플랫폼 간의 코드 공유는 Kotlin 멀티플랫폼(Kotlin Multiplatform)의 주요 유스케이스 중 하나입니다. Kotlin Multiplatform Mobile을 사용하면 크로스 플랫폼 모바일 애플리케이션을 빌드하고 안드로이드와 iOS 간에 공통 코드를 공유할 수 있습니다.

Koin은 멀티플랫폼 의존성 주입을 제공하며 네이티브 모바일 애플리케이션과 웹/백엔드 애플리케이션 전반에 걸쳐 컴포넌트를 빌드하도록 돕습니다.

:::info
**더 알아보기**: [Koin을 이용한 Kotlin 멀티플랫폼](/docs/reference/koin-mp/kmp)
:::

### 성능 및 생산성

Koin은 사용 및 실행 측면에서 직관적으로 설계된 순수(pure) Kotlin 프레임워크입니다. 사용이 간편하며 컴파일 시간에 영향을 주지 않고, 추가적인 플러그인 설정도 필요하지 않습니다.

---

## Koin: 의존성 주입 프레임워크

Koin은 Kotlin을 위한 인기 있는 의존성 주입(DI) 프레임워크로, 최소한의 보일러플레이트(boilerplate) 코드로 애플리케이션의 의존성을 관리할 수 있는 현대적이고 가벼운 솔루션을 제공합니다.

### 의존성 주입 vs 서비스 로케이터

Koin은 서비스 로케이터(service locator) 패턴과 유사해 보일 수 있지만, 이를 구분 짓는 주요 차이점이 있습니다:

| 측면 | 서비스 로케이터 | 의존성 주입 (Koin) |
|--------|----------------|----------------------------|
| **레지스트리** | 정적, 전역 레지스트리 | 모듈형, 스코프 기반 컨테이너 |
| **접근 방식** | 서비스에 대한 명시적 요청 | 의존성이 자동으로 전달됨 |
| **테스트 가능성** | 모킹/테스트가 더 어려움 | 의존성 교체가 용이함 |
| **결합도** | 프레임워크에 대한 강한 결합 | 낮은 결합도, 명시적 의존성 |
| **모범 사례** | 현대적인 앱에서는 권장되지 않음 | 업계 표준 패턴 |

:::note
**서비스 로케이터(Service Locator)**: 서비스 로케이터는 기본적으로 필요에 따라 서비스 인스턴스를 요청할 수 있는 가용 서비스 레지스트리입니다. 종종 정적인 전역 레지스트리를 사용하여 이러한 인스턴스를 생성하고 관리하는 역할을 합니다.

**의존성 주입(Dependency Injection)**: 이와 대조적으로, Koin은 순수 의존성 주입 프레임워크입니다. Koin을 사용하면 모듈에 의존성을 선언하고, Koin이 객체의 생성과 연결을 처리합니다. 각자의 스코프(scope)를 가진 독립적인 모듈을 여러 개 생성할 수 있어 의존성 관리가 더 모듈화되고 잠재적인 충돌을 피할 수 있습니다.
:::

### Koin의 접근 방식: 유연성과 모범 사례의 조화

Koin은 DI와 서비스 로케이터 패턴을 모두 지원하여 개발자에게 유연성을 제공합니다. 하지만 의존성을 생성자 파라미터로 전달하는 DI, 특히 **생성자 주입(constructor injection)**의 사용을 **강력히 권장**합니다. 이 방식은 테스트 가능성을 높이고 코드 파악을 더 쉽게 만듭니다.

```kotlin
// ✅ 권장됨: 생성자 주입
class UserViewModel(
    private val repository: UserRepository,
    private val analytics: Analytics
) : ViewModel() {
    // 의존성이 명확하고 테스트 가능함
}

// ⚠️ 허용되지만 권장되지 않음: 서비스 로케이터 패턴
class UserViewModel : ViewModel(), KoinComponent {
    private val repository: UserRepository by inject()
    private val analytics: Analytics by inject()
    // 의존성이 숨겨져 있음
}
```

Koin의 디자인 철학은 단순함과 설정의 용이성에 중점을 두면서도, 필요할 때 복잡한 구성이 가능하도록 하는 것입니다. Koin을 사용하면 개발자는 의존성을 효과적으로 관리할 수 있으며, 대부분의 시나리오에서 DI가 권장되는 선호 방식입니다.

:::info
**더 알아보기**: DI 개념에 대한 전체 가이드는 [의존성 주입 기초](/docs/setup/why)를 참조하세요.
:::

---

## 투명성 및 디자인 개요

Koin은 의존성 주입(DI)과 서비스 로케이터(SL) 패턴을 모두 지원하는 다재다능한 제어 역전(Inversion of Control, IoC) 컨테이너로 설계되었습니다. Koin이 어떻게 작동하는지 명확히 이해하고 이를 효과적으로 사용할 수 있도록 다음 측면들을 살펴보겠습니다:

### Koin이 DI와 SL의 균형을 맞추는 방법

Koin은 DI와 SL의 요소를 결합하고 있으며, 이는 프레임워크 사용 방식에 영향을 줄 수 있습니다:

1. **전역 컨텍스트 사용:** 기본적으로 Koin은 서비스 로케이터처럼 작동하는 전역적으로 접근 가능한 컴포넌트를 제공합니다. 이를 통해 `KoinComponent` 또는 `inject` 함수를 사용하여 중앙 레지스트리에서 의존성을 조회할 수 있습니다.

2. **격리된 컴포넌트:** Koin은 의존성 주입, 특히 생성자 주입의 사용을 권장하지만 격리된 컴포넌트도 허용합니다. 이러한 유연성은 특정 사례에서 SL의 이점을 누리면서도 가장 적합한 곳에 DI를 사용하도록 애플리케이션을 구성할 수 있음을 의미합니다.

3. **안드로이드 컴포넌트에서의 SL:** 안드로이드 개발에서 Koin은 설정의 편의를 위해 `Application` 및 `Activity`와 같은 컴포넌트 내부에서 SL을 내부적으로 자주 사용합니다. 이 시점부터 Koin은 더 구조화된 방식으로 의존성을 관리하기 위해 DI, 특히 생성자 주입을 권장합니다. 하지만 이는 강제 사항이 아니며, 개발자는 필요한 경우 SL을 사용할 수 있는 유연성을 갖습니다.

### 이것이 중요한 이유

DI와 SL의 차이를 이해하면 애플리케이션의 의존성을 효과적으로 관리하는 데 도움이 됩니다:

**의존성 주입 (권장):**
- ✅ 더 나은 테스트 가능성
- ✅ 명시적인 의존성
- ✅ 더 명확한 코드 구조
- ✅ 업계 모범 사례

**서비스 로케이터:**
- ⚠️ 설정의 편의성
- ⚠️ 결합도가 높아질 수 있음
- ⚠️ 숨겨진 의존성
- ⚠️ 테스트가 더 어려움

:::warning
Koin은 편의를 위해(특히 안드로이드 컴포넌트에서) SL을 지원하지만, **SL에만 전적으로 의존하면 결합도가 높아지고 테스트 가능성이 떨어질 수 있습니다.** Koin의 디자인은 균형 잡힌 접근 방식을 제공하여, 실용적인 곳에서는 SL을 사용하되 **모범 사례로서 DI를 권장**합니다.
:::

---

## Koin 최대한 활용하기

Koin을 효과적으로 사용하려면 다음을 따르세요:

### 1. 모범 사례 따르기

의존성 관리의 모범 사례에 맞춰 가능한 한 **생성자 주입**을 사용하세요. 이 방식은 테스트 가능성과 유지보수성을 향상시킵니다.

```kotlin
// ✅ 좋음
class UserService(private val api: UserApi, private val db: UserDatabase)

module {
    singleOf(::UserService)
}

// ❌ 피해야 함
class UserService : KoinComponent {
    private val api: UserApi by inject()
    private val db: UserDatabase by inject()
}
```

### 2. Koin의 유연성 활용

설정을 단순화하는 시나리오에서는 Koin의 SL 지원을 활용하되, 핵심 애플리케이션 의존성 관리에는 DI를 사용하는 것을 목표로 하세요.

### 3. 문서 및 예제 참조

프로젝트의 요구사항에 따라 DI와 SL을 적절하게 구성하고 사용하는 방법을 이해하기 위해 Koin의 문서와 예제를 검토하세요.

### 4. 스코프를 현명하게 사용하기

Koin의 스코프(scope) 기능을 사용하면 애플리케이션의 특정 부분에 대한 의존성을 격리할 수 있습니다:

```kotlin
module {
    scope<MyActivity> {
        scoped { MyActivityDependency() }
    }
}
```

:::info
**더 알아보기**: 상세한 스코프 패턴은 [스코프(Scopes)](/docs/reference/koin-core/scopes)를 참조하세요.
:::

---

## 다음 단계

시작할 준비가 되셨나요? 플랫폼을 선택하세요:

### 설정 가이드
- [Koin 설정](/docs/setup/koin) - 모든 플랫폼을 위한 Gradle 설정
- [Koin 어노테이션 설정](/docs/setup/annotations) - 어노테이션 기반 DI를 위한 KSP 설정

### 시작하기 튜토리얼
- [Android와 ViewModel](/docs/quickstart/android-viewmodel) - Koin으로 안드로이드 앱 빌드 시작하기
- [Jetpack Compose](/docs/quickstart/android-compose) - Compose UI와 Koin 함께 사용하기
- [Kotlin 멀티플랫폼](/docs/reference/koin-mp/kmp) - 플랫폼 간 코드 공유
- [Ktor 백엔드](/docs/quickstart/ktor) - 서버 애플리케이션 빌드

### 핵심 개념
- [의존성 주입 기초](/docs/setup/why) - 기본적인 DI 개념
- [핵심 기능](/docs/reference/koin-core/dsl) - Koin DSL 및 모듈 시스템
- [안드로이드 통합](/docs/reference/koin-android/start) - 안드로이드 전용 기능

---

> 이 가이드를 통해 Koin의 기능과 디자인 선택을 효과적으로 파악하고, 의존성 관리의 모범 사례를 준수하면서 Koin의 모든 잠재력을 활용할 수 있도록 돕고자 합니다.