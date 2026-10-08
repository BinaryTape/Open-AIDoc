---
title: Kotlin Multiplatform
---

## 设置 {id="setup"}

Koin 编译器插件简化了 KMP 设置 - 只需应用该插件即可。

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

就这么简单！不需要针对每个平台进行 KSP 配置。

## 在通用代码中定义定义与模块 {id="defining-definitions-and-modules-in-common-code"}

在您的 `commonMain` 源集中，声明您的模块、扫描定义或将函数定义为常规 Kotlin Koin 声明。请参阅 [定义](./definitions) 和 [模块](./modules)。

## 共享模式 {id="sharing-patterns"}

在本节中，我们将共同探讨通过定义与模块共享组件的几种方式。

在 Kotlin Multiplatform 应用程序中，某些组件必须针对每个平台专门实现。您可以在定义级别共享这些组件，并在给定的类（定义或模块）上使用 `expect`/`actual`。
您可以共享具有 `expect`/`actual` 实现的定义，或者具有 `expect`/`actual` 的模块。

:::info
有关常规 Kotlin 指导，请参阅 [多平台 Expect 与 Actual 规则](https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-expect-actual.html) 文档。
:::

:::warning
`expect`/`actual` 类在每个平台上不能拥有不同的构造函数。您需要遵守在通用空间中设计的当前构造函数约定。
:::

### 为原生实现共享定义 {id="sharing-definitions-for-native-implementations"}

:::info
我们的目标是使用“通用模块 + `expect`/`actual` 类定义”进行共享。
:::

对于这第一个经典模式，您既可以使用 `@ComponentScan` 进行定义扫描，也可以将定义声明为模块类函数。

请注意，要使用 `expect`/`actual` 定义，您将使用相同的构造函数（默认构造函数或自定义构造函数）。该构造函数在所有平台上必须保持一致。

#### 扫描 Expect/Actual 定义 {id="scanning-for-expect-actual-definitions"}

在 `commonMain` 中：
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

在原生源码中，实现我们的 `actual` 类：

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

#### 声明 Expect/Actual 函数定义 {id="declaring-expect-actual-function-definitions"}

在 `commonMain` 中：
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

在原生源码中，实现我们的 `actual` 类：

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

### 共享具有不同原生约定的定义 {id="sharing-definitions-with-different-native-contracts"}

:::info
我们的目标是使用“`expect`/`actual` 通用模块 + 通用接口 + 原生实现”。
:::

在某些情况下，您在每个原生实现上需要不同的构造函数参数。此时 `expect`/`actual` 类不再是您的解决方案。
您需要使用一个在每个平台上实现的接口，以及一个 `expect`/`actual` 类模块，以便允许模块定义正确的平台实现：

在 `commonMain` 中：
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

在原生源码中，实现我们的 `actual` 类：

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
每当您手动访问 Koin 作用域时，您都在进行动态装配。编译安全性不涵盖此类装配。
:::

### 通过平台包装器安全地跨平台共享 {id="safely-sharing-across-platforms-with-platform-wrapper"}

:::info
将特定平台组件封装为“平台包装器”。
:::

您可以将特定平台组件封装为“平台包装器”，以帮助您最大限度地减少动态注入。

例如，我们可以创建一个 `ContextWrapper`，它允许我们在需要时注入 Android 的 `Context`，但不会影响 iOS 端。

在 `commonMain` 中：
```kotlin
// commonMain

expect class ContextWrapper

@Module
expect class ContextModule() {

    @Single
    fun providesContextWrapper(scope : Scope) : ContextWrapper
}
```

在原生源码中，实现我们的 `actual` 类：

```kotlin
// androidMain
actual class ContextWrapper(val context: Context)

@Module
actual class ContextModule {
    
    // 需要在启动时设置 androidContext()
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
通过这种方式，您可以将动态平台装配减少到一个定义，并在整个系统中安全地注入。
:::

现在，您可以从通用代码中使用您的 `ContextWrapper`，并轻松地将其传递到您的 `expect`/`actual` 类中：

在 `commonMain` 中：
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

在原生源码中，实现我们的 `actual` 类：

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

### 共享 Expect/Actual 模块 - 依赖原生模块扫描 {id="sharing-expect-actual-module-rely-on-native-module-scanning"}

:::info
从通用模块依赖原生模块。
:::

在某些情况下，您不希望受到约束，并希望在每个原生端扫描组件。在通用源集中定义一个空的模块类，并在每个平台上定义您的实现。

:::info
如果您在通用端定义一个空模块，每个原生模块实现将从每个原生目标生成，从而允许例如仅扫描原生组件。
:::

在 `commonMain` 中：
```kotlin
// commonMain

@Module
expect class NativeModuleC()
```

在原生源集中：

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
// iOS 端无需操作
@Module
actual class NativeModuleC
```
