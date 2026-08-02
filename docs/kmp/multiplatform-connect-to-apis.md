[//]: # (title: 使用平台特定 API)

在本文中，您将学习在开发多平台应用程序和库时如何使用平台特定 API。

<video src="https://www.youtube.com/v/bSNumV04y_w" title="在 KMP 应用中使用平台特定 API"/>

## Kotlin 多平台库

在编写使用平台特定 API 的代码之前，请检查是否可以使用多平台库代替。
此类库提供通用的 Kotlin API，并针对不同平台有不同的实现。

目前已有许多库可用于实现网络、日志记录和分析，以及访问设备功能等。您可以在 [klibs.io](https://klibs.io)（Kotlin 多平台库搜索平台）上浏览库。

## expect 和 actual 函数与属性

Kotlin 提供了一种语言机制，用于在开发公共逻辑时访问平台特定 API：
[expect 和 actual 声明](multiplatform-expect-actual.md)。

通过该机制，多平台模块的公共源集定义一个 expect 声明，而每个平台源集必须提供与该 expect 声明相对应的 actual 声明。编译器会确保公共源集中每个使用 `expect` 关键字标记的声明，在所有目标平台源集中都有对应的使用 `actual` 关键字标记的声明。

这适用于大多数 Kotlin 声明，例如函数、类、接口、枚举、属性和注解。本节重点介绍如何使用 expect 和 actual 函数与属性。

![使用 expect 和 actual 函数与属性](expect-functions-properties.svg){width=700}

在此示例中，您将在公共源集中定义一个预期的 `platform()` 函数，并在平台源集中提供其实际实现。在为特定平台生成代码时，Kotlin 编译器会合并 expect 和 actual 声明。它会生成一个带有实际实现的 `platform()` 函数。expect 和 actual 声明应定义在同一个包中，并合并为生成的平台代码中的“一个声明”。在生成的平台代码中，任何对预期 `platform()` 函数的调用都将调用正确的实际实现。

### 示例：生成 UUID

假设您正在使用 Kotlin Multiplatform 开发 iOS 和 Android 应用程序，并且想要生成一个通用唯一标识符 (UUID)。

为此，请在 Kotlin Multiplatform 模块的公共源集中使用 `expect` 关键字声明预期函数 `randomUUID()`。不要包含任何实现代码。

```kotlin
// 在公共源集中：
expect fun randomUUID(): String
```

在每个平台特定的源集（iOS 和 Android）中，提供公共模块中预期的 `randomUUID()` 函数的实际实现。使用 `actual` 关键字标记这些实际实现。

![通过 expect 和 actual 声明生成 UUID](expect-generate-uuid.svg){width=700}

以下代码片段展示了 Android 和 iOS 的实现。平台特定代码使用 `actual` 关键字以及相同的函数名称：

```kotlin
// 在 android 源集中：
import java.util.*

actual fun randomUUID() = UUID.randomUUID().toString()
```

```kotlin
// 在 iOS 源集中：
import platform.Foundation.NSUUID

actual fun randomUUID(): String = NSUUID().UUIDString()
```

Android 实现使用 Android 上的可用 API，而 iOS 实现使用 iOS 上的可用 API。您可以从 Kotlin/Native 代码中访问 iOS API。

在生成 Android 的最终平台代码时，Kotlin 编译器会自动合并 expect 和 actual 声明，并生成一个具有 Android 特定实际实现的单一 `randomUUID()` 函数。iOS 的过程以此类推。

为简单起见，本示例及后续示例使用了简化的源集名称“common”、“ios”和“android”。通常，这隐含指代 `commonMain`、`iosMain` 和 `androidMain`，类似的逻辑也可以在测试源集 `commonTest`、`iosTest` 和 `androidTest` 中定义。

与 expect 和 actual 函数类似，expect 和 actual 属性允许您在不同平台上使用不同的值。expect 和 actual 函数与属性对于简单的用例非常有用。

## 公共代码中的接口

如果平台特定逻辑过于庞大且复杂，您可以通过在公共代码中定义一个接口来表示该逻辑，然后在平台源集中提供不同的实现，从而简化代码。

![使用接口](expect-interfaces.svg){width=700}

平台源集中的实现使用其对应的依赖项：

```kotlin
// 在 commonMain 源集中：
interface Platform {
    val name: String
}
```

```kotlin
// 在 androidMain 源集中：
import android.os.Build

class AndroidPlatform : Platform {
    override val name: String = "Android ${Build.VERSION.SDK_INT}"
}
```

```kotlin
// 在 iosMain 源集中：
import platform.UIKit.UIDevice

class IOSPlatform : Platform {
    override val name: String = UIDevice.currentDevice.systemName() + " " + UIDevice.currentDevice.systemVersion
}
```

当您需要通用接口来注入适当的平台实现时，可以选择以下选项之一，下文将详细说明每个选项：

* [使用 expect 和 actual 函数](#expect-and-actual-functions)
* [通过不同的入口点提供实现](#different-entry-points)
* [使用依赖注入框架](#dependency-injection-framework)

### expect 和 actual 函数

定义一个返回此接口值的 expect 函数，然后定义返回其子类的 actual 函数：

```kotlin
// 在 commonMain 源集中：
interface Platform

expect fun platform(): Platform
```

```kotlin
// 在 androidMain 源集中：
class AndroidPlatform : Platform

actual fun platform() = AndroidPlatform()
```

```kotlin
// 在 iosMain 源集中：
class IOSPlatform : Platform

actual fun platform() = IOSPlatform()
```

当您在公共代码中调用 `platform()` 函数时，它可以处理 `Platform` 类型对象。当您在 Android 上运行此公共代码时，`platform()` 调用将返回 `AndroidPlatform` 类的实例。当您在 iOS 上运行时，`platform()` 将返回 `IOSPlatform` 类的实例。

### 不同的入口点

如果您控制入口点，则可以在不使用 expect 和 actual 声明的情况下构建每个平台工件的实现。为此，请在共享的 Kotlin Multiplatform 模块中定义平台实现，但在平台模块中对其实例化：

```kotlin
// 共享 Kotlin Multiplatform 模块
// 在 commonMain 源集中：
interface Platform

fun application(p: Platform) {
    // 应用程序逻辑
}
```

```kotlin
// 在 androidMain 源集中：
class AndroidPlatform : Platform
```

```kotlin
// 在 iosMain 源集中：
class IOSPlatform : Platform
```

```kotlin
// 在 androidApp 平台模块中：
import android.app.Application
import mysharedpackage.*

class MyApp : Application() {
    override fun onCreate() {
        super.onCreate()
        application(AndroidPlatform())
    }
}
```

```Swift
// 在 iosApp 平台模块中（使用 Swift）：
import shared

@main
struct iOSApp : App {
    init() {
        application(IOSPlatform())
    }
}
```

在 Android 上，您应该创建一个 `AndroidPlatform` 实例并将其传递给 `application()` 函数；而在 iOS 上，您应该类似地创建并传递一个 `IOSPlatform` 实例。这些入口点不需要是应用程序的入口点，但您可以在此处调用共享模块的特定功能。

通过 expect 和 actual 函数或直接通过入口点提供正确的实现对于简单场景非常有效。但是，如果您在项目中使用依赖注入框架，我们建议在简单情况下也使用它以确保一致性。

### 依赖注入框架

现代应用程序通常使用依赖注入 (DI) 框架来构建松耦合架构。DI 框架允许根据当前环境将依赖项注入组件。

任何支持 Kotlin Multiplatform 的 DI 框架都可以帮助您针对不同平台注入不同的依赖项。

例如，[Koin](https://insert-koin.io/) 是一个支持 Kotlin Multiplatform 的依赖注入框架：

```kotlin
// 在公共源集中：
import org.koin.dsl.module

interface Platform

expect val platformModule: Module
```

```kotlin
// 在 androidMain 源集中：
class AndroidPlatform : Platform

actual val platformModule: Module = module {
    single<Platform> {
        AndroidPlatform()
    }
}
```

```kotlin
// 在 iosMain 源集中：
class IOSPlatform : Platform

actual val platformModule = module {
    single<Platform> { IOSPlatform() }
}
```

在这里，Koin DSL 创建了定义待注入组件的模块。您在公共代码中使用 `expect` 关键字声明一个模块，然后使用 `actual` 关键字为每个平台提供特定于平台的实现。框架负责在运行时选择正确的实现。

当您使用 DI 框架时，您会通过该框架注入所有依赖项。处理平台依赖项的逻辑也同样适用。如果您项目中已经使用了 DI，我们建议继续使用 DI，而不是手动使用 expect 和 actual 函数。这样可以避免混用两种不同的依赖注入方式。

您也不必总是在 Kotlin 中实现公共接口。您可以在不同的“平台模块”中，使用 Swift 等其他语言来实现。如果您选择这种方法，则应使用 DI 框架从 iOS 平台模块提供实现：

![使用依赖注入框架](expect-di-framework.svg){width=700}

这种方法仅在您将实现放在平台模块中时才有效。它的扩展性不是很好，因为您的 Kotlin Multiplatform 模块无法自给足，您需要在不同的模块中实现公共接口。

<!-- If you're interested in having this functionality expanded to a shared module, please vote for this issue in Youtrack and describe your use case. -->

## 下一步

有关 expect/actual 机制的更多示例和信息，请参阅 [expect 和 actual 声明](multiplatform-expect-actual.md)。