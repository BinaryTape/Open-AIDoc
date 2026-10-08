---
title: 애플리케이션, 설정 및 모듈 
---

## @KoinApplication을 이용한 애플리케이션 부트스트랩 {id="application-bootstrap-with-koinapplication"}

애플리케이션 엔트리 포인트(entry point)를 정의하려면 `@KoinApplication`을 사용하세요:

```kotlin
@KoinApplication(modules = [MyModule::class])
class MyApp
```

타입 안전한(typed) API를 사용하여 Koin을 시작하세요:

```kotlin
fun main() {
    startKoin<MyApp>()

    // 또는 설정을 포함하여 시작
    startKoin<MyApp> {
        printLogger()
    }
}
```

### 사용 가능한 타입 안전 API {id="available-typed-apis"}

| API | 설명 |
|-----|-------------|
| `startKoin<T>()` | Koin을 전역적으로 시작 |
| `startKoin<T> { }` | 설정 블록과 함께 시작 |
| `koinApplication<T>()` | 격리된 KoinApplication 생성 |
| `koinConfiguration<T>()` | 설정 생성 (Compose, Ktor용) |
| `module<T>()` | 단일 `@Module` 클래스 로드 |
| `modules(A::class, B::class)` | 여러 `@Module` 클래스 로드 |

### 개별 모듈 로드하기 {id="loading-individual-modules"}

`@KoinApplication` 없이 `@Module` 클래스를 직접 로드하려면 `module<T>()` 또는 `modules(vararg KClass)`를 사용하세요:

```kotlin
startKoin {
    module<NetworkModule>()
    modules(DataModule::class, CacheModule::class)
}
```

이 방식은 테스트 환경이나 어노테이션 모듈을 DSL 설정과 혼합하여 사용할 때 유용합니다:

```kotlin
// 테스트에서 — 필요한 모듈만 로드
@get:Rule
val koinTestRule = KoinTestRule.create {
    module<NetworkModule>()
}
```

:::info
`module<T>()`와 `modules(vararg KClass)`는 컴파일러 플러그인이 컴파일 시점에 가로채서 변환하는 스텁(stub) 함수입니다. 이를 사용하려면 Koin 컴파일러 플러그인이 적용되어 있어야 합니다.
:::

### @KoinApplication 파라미터 {id="koinapplication-parameters"}

- `modules`: 포함할 모듈 클래스 배열
- `configurations`: 로드할 설정 레이블(label) 배열

```kotlin
@KoinApplication(
    modules = [CoreModule::class],
    configurations = ["production"]
)
class ProdApp
```

:::info
설정이 지정되지 않은 경우, `@Configuration`(기본 레이블)으로 표시된 모듈이 자동으로 로드됩니다.
:::

### 모듈 로드 순서 및 오버라이드(Overrides) {id="module-load-order-and-overrides"}

Koin은 런타임에 **마지막에 로드된 것이 우선(last-wins)** 적용됩니다. 즉, 두 모듈이 동일한 타입을 정의할 경우 마지막에 로드된 모듈이 우선권을 가집니다. 컴파일러 플러그인은 `@KoinApplication`에서 다음과 같은 순서로 모듈 목록을 구성합니다:

1. **자동 탐색된(Auto-discovered) `@Configuration` 모듈** (로컬 + 종속성 JAR) — 먼저 로드됨
2. **명시적인 `@KoinApplication(modules = [A, B, C])`** — **선언된 순서대로** 마지막에 로드됨

따라서 애플리케이션 레벨의 오버라이드는 항상 종속성 라이브러리의 기본값보다 우선합니다:

```kotlin
// 종속성 라이브러리 모듈 내
@Module @Configuration
class CoreModule {
    @Singleton fun feature(): Feature = DefaultFeature()
}

// 애플리케이션 모듈 내
@Module
class AppModule {
    @Singleton fun feature(): Feature = AppFeature()  // 커스텀 오버라이드
}

@KoinApplication(modules = [AppModule::class])
class MyApp
// 로드 순서: CoreModule (DefaultFeature) → AppModule (AppFeature가 우선함)
// 런타임에 get<Feature>()는 AppFeature를 반환합니다.
```

명시적 목록 내에서는 선언된 순서가 유지됩니다. 따라서 `@KoinApplication(modules = [A, B, C])`는 A, B, C 순서로 로드되며, 이 셋 중에서는 C가 우선권을 가집니다. 각 항목의 `@Module(includes = [...])` 체인은 해당 항목과 함께 그룹화되어 유지됩니다.

만약 어떤 모듈이 명시적 목록에 포함되어 있으면서 `@Configuration`으로도 탐색되었다면, 해당 모듈은 **명시적 위치**에서 한 번만 로드됩니다. 따라서 `modules = [...]`의 선언 순서가 항상 오버라이드 우선순위를 결정합니다.

:::tip
여러 `@Configuration` 모듈 간에 (클래스패스 스캔 순서가 아닌) 특정 로드 순서가 필요한 경우, `@KoinApplication(modules = [Core::class, Feature::class, App::class])`와 같이 명시적으로 나열하세요. 명시적 목록은 선언 순서를 존중합니다.
:::

## @Configuration을 이용한 설정 관리 {id="configuration-management-with-configuration"}

`@Configuration` 어노테이션을 사용하면 모듈을 다양한 설정(환경, flavor 등)으로 구성할 수 있습니다. 이는 배포 환경이나 기능 세트별로 모듈을 정리하는 데 유용합니다.

### 기본적인 설정 사용법 {id="basic-configuration-usage"}

```kotlin
// 모듈을 기본(default) 설정에 배치합니다
@Module
@Configuration
class CoreModule
```

:::info
기본 설정의 이름은 "default"이며, `@Configuration` 또는 `@Configuration("default")`로 사용할 수 있습니다.
:::

설정에서 모듈을 스캔하려면 `@KoinApplication`을 사용해야 합니다:

```kotlin
// 모듈 A
@Module
@Configuration
class ModuleA

// 모듈 B
@Module
@Configuration
class ModuleB

// 모듈 App, 모든 @Configuration 모듈을 스캔합니다
@KoinApplication
object MyApp
```

### 다중 설정 지원 {id="multiple-configuration-support"}

하나의 모듈을 여러 설정과 연결할 수 있습니다:

```kotlin
// 이 모듈은 "prod" 및 "test" 설정 모두에서 사용할 수 있습니다
@Module
@Configuration("prod", "test")
class DatabaseModule {
    @Single
    fun database() = PostgreSQLDatabase()
}

// 이 모듈은 default, test, development에서 사용할 수 있습니다
@Module
@Configuration("default", "test", "development") 
class LoggingModule {
    @Single
    fun logger() = Logger()
}
```

### 환경별 설정 {id="environment-specific-configurations"}

```kotlin
// 개발 전용 설정
@Module
@Configuration("development")
class DevDatabaseModule {
    @Single
    fun database() = InMemoryDatabase()
}

// 운영 전용 설정  
@Module
@Configuration("production")
class ProdDatabaseModule {
    @Single
    fun database() = PostgreSQLDatabase()
}

// 여러 환경에서 사용 가능
@Module
@Configuration("default", "production", "development")
class CoreModule {
    @Single
    fun logger() = Logger()
}
```

### @KoinApplication과 함께 설정 사용하기 {id="using-configurations-with-koinapplication"}

기본적으로 `@KoinApplication`은 모든 기본 설정(`@Configuration`이 태그된 모듈)을 로드합니다.

애플리케이션 부트스트랩에서 이러한 설정을 다음과 같이 참조할 수도 있습니다:

```kotlin
@KoinApplication(configurations = ["default", "production"])
class ProductionApp

@KoinApplication(configurations = ["default", "development"])  
class DevelopmentApp

// 기본 설정만 로드 (파라미터가 없는 @KoinApplication과 동일)
@KoinApplication
class SimpleApp
```

:::info
- 빈 `@Configuration`은 `@Configuration("default")`와 동일합니다.
- 특정 설정이 지정되지 않은 경우 "default" 설정이 자동으로 로드됩니다.
- 어노테이션에 목록을 나열하여 모듈을 여러 설정에 속하게 할 수 있습니다.
:::

## 모듈을 이용한 구성 {id="organizing-with-modules"}

정의(definitions)는 항상 `@Module`을 사용하여 명시적인 모듈로 구성하십시오:

## @Module을 이용한 클래스 모듈 {id="class-module-with-module"}

모듈을 선언하려면 클래스에 `@Module` 어노테이션을 태그하기만 하면 됩니다:

```kotlin
@Module
class MyModule
```

`@KoinApplication`에서 모듈을 참조하세요:

```kotlin
@KoinApplication(modules = [MyModule::class])
class MyApp

fun main() {
    startKoin<MyApp>()
}
```

## @ComponentScan을 이용한 컴포넌트 스캔 {id="components-scan-with-componentscan"}

어노테이션이 달린 컴포넌트들을 자동으로 탐색하려면 `@ComponentScan`을 사용하세요:

```kotlin
@Module
@ComponentScan
class MyModule
```

이렇게 하면 현재 패키지와 하위 패키지에서 어노테이션이 달린 컴포넌트들을 스캔합니다. 다음과 같이 패키지를 명시적으로 지정할 수도 있습니다:

```kotlin
@Module
@ComponentScan("com.myapp.features")
class FeatureModule
```

:::info
`@ComponentScan`은 동일한 패키지에 대해 모든 Gradle 모듈을 가로질러 탐색합니다.
:::

## 클래스 모듈 내의 정의 {id="definitions-in-class-modules"}

코드 내에서 직접 정의(definition)를 선언하려면, 함수에 정의 어노테이션을 달아주면 됩니다:

```kotlin
// 예시 
// class MyComponent(val myDependency : MyDependency)

@Module
class MyModule {

  @Single
  fun myComponent(myDependency : MyDependency) = MyComponent(myDependency)
}
```

> **참고**: `@InjectedParam` (startKoin에서 주입된 파라미터용) 및 `@Property` (프로퍼티 주입용)도 함수 멤버에 사용할 수 있습니다. 이러한 어노테이션에 대한 자세한 내용은 정의(definitions) 문서를 참조하세요.

## 모듈 포함하기 {id="including-modules"}

`includes` 속성을 사용하여 모듈을 구성(compose)하세요:

```kotlin
@Module
class ModuleA

@Module(includes = [ModuleA::class])
class ModuleB
```

애플리케이션에서 루트(root) 모듈을 참조하세요:

```kotlin
@KoinApplication(modules = [ModuleB::class])  // ModuleA를 자동으로 포함합니다
class MyApp

fun main() {
    startKoin<MyApp>()
}
```
