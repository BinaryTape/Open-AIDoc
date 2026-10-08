---
title: Kotlin 멀티플랫폼
---

## 설정 {id="setup"}

Koin 컴파일러 플러그인은 KMP 설정을 간소화합니다. 플러그인을 적용하기만 하면 됩니다.

```kotlin
// shared/build.gradle.kts
plugins {
    kotlin("multiplatform")
    alias(libs.plugins.koin.compiler)
}

kotlin {
    sourceSets {
        commonMain.dependencies {
            implementation(libs.koin.core)
            implementation(libs.koin.annotations)
        }
    }
}
```

이게 전부입니다! 플랫폼별 KSP 구성이 필요하지 않습니다.

## 공통 코드에서 정의 및 모듈 정의하기 {id="defining-definitions-and-modules-in-common-code"}

`commonMain` 소스 세트에서 모듈을 선언하거나, 정의(definition)를 스캔하거나, 일반적인 Kotlin Koin 선언과 같이 함수를 정의하세요. [정의(Definitions)](./definitions) 및 [모듈(Modules)](./modules) 섹션을 참조하세요.

## 공유 패턴 {id="sharing-patterns"}

이 섹션에서는 정의와 모듈을 사용하여 컴포넌트를 공유하는 몇 가지 방법을 함께 살펴보겠습니다.

Kotlin 멀티플랫폼 애플리케이션에서는 일부 컴포넌트가 플랫폼별로 구체적으로 구현되어야 합니다. 이러한 컴포넌트들은 특정 클래스(정의 또는 모듈)에 대해 expect/actual을 사용하여 정의 수준에서 공유할 수 있습니다.
expect/actual 구현을 통해 정의를 공유하거나, expect/actual을 통해 모듈 자체를 공유할 수 있습니다.

:::info
일반적인 Kotlin 가이드는 [Multiplatform Expect & Actual Rules](https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-expect-actual.html) 문서를 참조하세요.
:::

:::warning
Expect/Actual 클래스는 플랫폼별로 서로 다른 생성자를 가질 수 없습니다. 공통 공간(common space)에서 설계된 현재 생성자 규약을 준수해야 합니다.
:::

### 네이티브 구현을 위한 정의 공유 {id="sharing-definitions-for-native-implementations"}

:::info
이 방식은 공통 모듈(Common Module) + Expect/Actual 클래스 정의를 통한 공유를 목표로 합니다.
:::

이 첫 번째 전형적인 패턴의 경우, `@ComponentScan`을 사용한 정의 스캐닝을 사용하거나 모듈 클래스 함수로 정의를 선언할 수 있습니다.

`expect/actual` 정의를 사용하려면 동일한 생성자를 사용해야 한다는 점에 유의하세요 (기본 생성자든 커스텀 생성자든 상관없음). 이 생성자는 모든 플랫폼에서 동일해야 합니다.

#### Expect/Actual 정의 스캐닝 {id="scanning-for-expect-actual-definitions"}

commonMain에서:
```kotlin
// commonMain

@Module
@ComponentScan("com.jetbrains.kmpapp.native")
class NativeModuleA()

// package com.jetbrains.kmpapp.native
@Factory
expect class PlatformComponentA() {
    fun sayHello() : String
}
```

네이티브 소스에서 actual 클래스를 구현합니다:

```kotlin
// androidMain

// package com.jetbrains.kmpapp.native
actual class PlatformComponentA {
    actual fun sayHello() : String = "I'm Android - A"
}

// iOSMain

// package com.jetbrains.kmpapp.native
actual class PlatformComponentA {
    actual fun sayHello() : String = "I'm iOS - A"
}
```

#### Expect/Actual 함수 정의 선언 {id="declaring-expect-actual-function-definitions"}

commonMain에서:
```kotlin
// commonMain

@Module
class NativeModuleB() {

    @Factory
    fun providesPlatformComponentB() : PlatformComponentB = PlatformComponentB()
}

expect class PlatformComponentB() {
    fun sayHello() : String
}
```

네이티브 소스에서 actual 클래스를 구현합니다:

```kotlin
// androidMain

// package com.jetbrains.kmpapp.native
actual class PlatformComponentB {
    actual fun sayHello() : String = "I'm Android - B"
}

// iOSMain

// package com.jetbrains.kmpapp.native
actual class PlatformComponentB {
    actual fun sayHello() : String = "I'm iOS - B"
}
```

### 서로 다른 네이티브 규약을 가진 정의 공유 {id="sharing-definitions-with-different-native-contracts"}

:::info
이 방식은 Expect/Actual 공통 모듈 + 공통 인터페이스 + 네이티브 구현체를 목표로 합니다.
:::

경우에 따라 각 네이티브 구현체에 서로 다른 생성자 인자가 필요할 수 있습니다. 이럴 때는 Expect/Actual 클래스만으로는 해결되지 않습니다.
각 플랫폼에서 구현할 `interface`를 사용하고, 모듈이 올바른 플랫폼 구현을 정의할 수 있도록 Expect/Actual 클래스 모듈을 사용해야 합니다.

commonMain에서:
```kotlin
// commonMain

expect class NativeModuleD() {
    @Factory
    fun providesPlatformComponentD(scope : org.koin.core.scope.Scope) : PlatformComponentD
}

interface PlatformComponentD {
    fun sayHello() : String
}
```

네이티브 소스에서 actual 클래스를 구현합니다:

```kotlin
// androidMain

@Module
actual class NativeModuleD {
    @Factory
    actual fun providesPlatformComponentD(scope : org.koin.core.scope.Scope) : PlatformComponentD = PlatformComponentDAndroid(scope)
}

class PlatformComponentDAndroid(scope : org.koin.core.scope.Scope) : PlatformComponentD{
    val context : Context = scope.get()
    override fun sayHello() : String = "I'm Android - D - with ${context}"
}

// iOSMain
@Module
actual class NativeModuleD {
    @Factory
    actual fun providesPlatformComponentD(scope : org.koin.core.scope.Scope) : PlatformComponentD = PlatformComponentDiOS()
}

class PlatformComponentDiOS : PlatformComponentD{
    override fun sayHello() : String = "I'm iOS - D"
}
```

:::note
Koin 스코프에 수동으로 액세스할 때마다 동적 와이어링(dynamic wiring)을 수행하게 됩니다. 컴파일 안정성(Compile safety)은 이러한 와이어링을 보장하지 않습니다.
:::

### 플랫폼 래퍼를 통한 안전한 플랫폼 간 공유 {id="safely-sharing-across-platforms-with-platform-wrapper"}

:::info
특정 플랫폼 컴포넌트를 "플랫폼 래퍼(platform wrapper)"로 감쌉니다.
:::

특정 플랫폼 컴포넌트를 "플랫폼 래퍼"로 감싸면 동적 주입을 최소화하는 데 도움이 됩니다.

예를 들어, 필요할 때 Android `Context`를 주입할 수 있게 해주면서도 iOS 측에는 영향을 주지 않는 `ContextWrapper`를 만들 수 있습니다.

commonMain에서:
```kotlin
// commonMain

expect class ContextWrapper

@Module
expect class ContextModule() {

    @Single
    fun providesContextWrapper(scope : Scope) : ContextWrapper
}
```

네이티브 소스에서 actual 클래스를 구현합니다:

```kotlin
// androidMain
actual class ContextWrapper(val context: Context)

@Module
actual class ContextModule {
    
    // 시작 시 androidContext() 설정이 필요함
    @Single
    actual fun providesContextWrapper(scope : Scope) : ContextWrapper = ContextWrapper(scope.get())
}

// iOSMain
actual class ContextWrapper

@Module
actual class ContextModule {

    @Single
    actual fun providesContextWrapper(scope : Scope) : ContextWrapper = ContextWrapper()
}
```

:::info
이러한 방식으로 동적 플랫폼 와이어링을 하나의 정의로 최소화하고, 전체 시스템에 안전하게 주입할 수 있습니다.
:::

이제 공통 코드에서 `ContextWrapper`를 사용할 수 있으며, 이를 Expect/Actual 클래스에 쉽게 전달할 수 있습니다.

commonMain에서:
```kotlin
// commonMain

@Module
@ComponentScan("com.jetbrains.kmpapp.native")
class NativeModuleA()

// package com.jetbrains.kmpapp.native
@Factory
expect class PlatformComponentA(ctx : ContextWrapper) {
    fun sayHello() : String
}
```

네이티브 소스에서 actual 클래스를 구현합니다:

```kotlin
// androidMain

// package com.jetbrains.kmpapp.native
actual class PlatformComponentA actual constructor(val ctx : ContextWrapper) {
    actual fun sayHello() : String = "I'm Android - A - with context: ${ctx.context}"
}

// iOSMain

// package com.jetbrains.kmpapp.native
actual class PlatformComponentA actual constructor(val ctx : ContextWrapper) {
    actual fun sayHello() : String = "I'm iOS - A"
}
```

### Expect/Actual 모듈 공유 - 네이티브 모듈 스캐닝 활용 {id="sharing-expect-actual-module-rely-on-native-module-scanning"}

:::info
공통 모듈에서 네이티브 모듈에 의존합니다.
:::

어떤 경우에는 제약 조건을 두지 않고 각 네이티브 측에서 컴포넌트를 스캔하고 싶을 수 있습니다. 공통 소스 세트에 빈 모듈 클래스를 정의하고, 각 플랫폼에서 구현을 정의하세요.

:::info
공통 측에 빈 모듈을 정의하면, 각 네이티브 타겟에서 각 네이티브 모듈 구현체가 생성되므로 네이티브 전용 컴포넌트 등을 스캔할 수 있습니다.
:::

commonMain에서:
```kotlin
// commonMain

@Module
expect class NativeModuleC()
```

네이티브 소스 세트에서:

```kotlin
// androidMain
@Module
@ComponentScan("com.jetbrains.kmpapp.other.android")
actual class NativeModuleC

//com.jetbrains.kmpapp.other.android
@Factory
class PlatformComponentC(val context: Context) {
    fun sayHello() : String = "I'm Android - C - $context"
}

// iOSMain
// iOS에서는 아무 작업도 하지 않음
@Module
actual class NativeModuleC
```
