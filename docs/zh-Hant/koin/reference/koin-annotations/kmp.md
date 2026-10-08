---
title: Kotlin Multiplatform
---

## 設定 {id="setup"}

Koin 編譯器外掛程式簡化了 KMP 的設定 —— 只需要套用該外掛程式即可。

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

就這樣！不需要針對每個平台進行 KSP 設定。

## 在共用程式碼中定義定義與模組 {id="defining-definitions-and-modules-in-common-code"}

在您的 `commonMain` 原始碼集中，宣告您的模組、掃描定義，或將函式定義為一般的 Kotlin Koin 宣告。請參閱 [定義](./definitions) 與 [模組](./modules)。

## 共享模式 {id="sharing-patterns"}

在本節中，我們將一起探討數種透過定義與模組來共享組件的方法。

在 Kotlin Multiplatform 應用程式中，某些組件必須針對每個平台進行特定實作。您可以在定義層級共享這些組件，並在指定的類別（定義或模組）上使用 expect/actual。
您可以共享具有 expect/actual 實作的定義，或是共享具有 expect/actual 的模組。

:::info
關於一般的 Kotlin 指導原則，請參閱 [Multiplatform Expect & Actual 規則](https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-expect-actual.html) 文件。
:::

:::warning
Expect/Actual 類別在每個平台上不能有不同的建構函式。您必須遵守在共用空間中設計的現有建構函式協約。
:::

### 針對原生實作共享定義 {id="sharing-definitions-for-native-implementations"}

:::info
我們的目標是透過「共用模組 + Expect/Actual 類別定義」進行共享。
:::

對於第一種經典模式，您可以同時使用 `@ComponentScan` 進行定義掃描，或將定義宣告為模組類別函式。

請注意，若要使用 `expect/actual` 定義，您將使用相同的建構函式（預設建構函式或自訂建構函式）。此建構函式在所有平台上都必須相同。

#### 掃描 Expect/Actual 定義 {id="scanning-for-expect-actual-definitions"}

在 commonMain 中：
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

在原生原始碼中，實作我們的實際類別：

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

#### 宣告 Expect/Actual 函式定義 {id="declaring-expect-actual-function-definitions"}

在 commonMain 中：
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

在原生原始碼中，實作我們的實際類別：

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

### 共享具有不同原生協約的定義 {id="sharing-definitions-with-different-native-contracts"}

:::info
我們的目標是透過「Expect/Actual 共用模組 + 共用介面 + 原生實作」進行共享。
:::

在某些情況下，您在每個原生實作上需要不同的建構函式引數。此時 Expect/Actual 類別並非您的解決方案。
您需要使用一個在每個平台上實作的 `interface`，以及一個 Expect/Actual 類別模組，以便讓模組能定義正確的平台實作：

在 commonMain 中：
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

在原生原始碼中，實作我們的實際類別：

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
每當您手動存取 Koin 作用域（scope）時，您就是在進行動態裝配。編譯安全不涵蓋此類裝配。
:::

### 使用平台包裝函式跨平台安全共享 {id="safely-sharing-across-platforms-with-platform-wrapper"}

:::info
將特定的平台組件封裝為「平台包裝函式」。
:::

您可以將特定的平台組件封裝為「平台包裝函式」，以協助您盡量減少動態注入。

例如，我們可以建立一個 `ContextWrapper`，讓我們在需要時注入 Android 的 `Context`，但不會影響 iOS 端。

在 commonMain 中：
```kotlin
// commonMain

expect class ContextWrapper

@Module
expect class ContextModule() {

    @Single
    fun providesContextWrapper(scope : Scope) : ContextWrapper
}
```

在原生原始碼中，實作我們的實際類別：

```kotlin
// androidMain
actual class ContextWrapper(val context: Context)

@Module
actual class ContextModule {
    
    // 需要 androidContext() 在啟動時設定
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
透過這種方式，您可以將動態平台裝配減至單一定義，並在整個系統中安全地進行注入。
:::

現在，您可以從共用程式碼中使用 `ContextWrapper`，並輕鬆地將其傳遞給 Expect/Actual 類別：

在 commonMain 中：
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

在原生原始碼中，實作我們的實際類別：

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

### 共享 Expect/Actual 模組 - 依賴原生模組掃描 {id="sharing-expect-actual-module-rely-on-native-module-scanning"}

:::info
從共用模組依賴原生模組。
:::

在某些情況下，您不希望受到約束，並在每個原生端掃描組件。請在共用原始碼集中定義一個空的模組類別，並在每個平台上定義您的實作。

:::info
如果您在共用端定義一個空模組，每個原生模組實作將從每個原生目標產生，例如這允許掃描僅限原生的組件。
:::

在 commonMain 中：
```kotlin
// commonMain

@Module
expect class NativeModuleC()
```

在原生原始碼集中：

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
// 在 iOS 上不執行任何操作
@Module
actual class NativeModuleC
```
