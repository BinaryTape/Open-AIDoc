[//]: # (title: 使用平台特定 API)

在本文中，你将学习在开发多平台应用程序和库时如何使用平台特定 API。

<video src="https://www.youtube.com/v/bSNumV04y_w" title="Using Platform-Specific APIs in KMP Apps"/>

## Kotlin Multiplatform 库 {id="kotlin-multiplatform-libraries"}

在编写使用平台特定 API 的代码之前，请先检查是否可以使用多平台库来代替。这类库提供了通用的 Kotlin API，并在不同平台上具有不同的实现。

目前已有许多可用的库，你可以用它们来实现网络、日志记录和分析，以及访问设备功能等。欢迎在 Kotlin Multiplatform 库搜索平台 [klibs.io](https://klibs.io) 上浏览各类库。

## 预期和实际函数与属性 {id="expected-and-actual-functions-and-properties"}

Kotlin 提供了一种在开发通用逻辑时访问平台特定 API 的语言机制：[预期声明和实际声明](multiplatform-expect-actual.md)。

通过这种机制，多平台模块的通用源集 (common source set) 定义一个预期声明，而每个平台源集都必须提供与该预期声明相对应的实际声明。编译器会确保通用源集中每个标有 `expect` 关键字的声明，在所有目标平台源集中都具有标有 `actual` 关键字的对应声明。

这适用于大多数 Kotlin 声明，例如函数、类、接口、枚举、属性和注解。本节重点介绍预期和实际函数与属性的使用。

![使用预期和实际函数与属性](expect-functions-properties.svg){width=700}

在此示例中，通用源集中定义了一个预期的 `platform()` 函数，并在各平台源集中具有实际实现。在为特定平台生成代码时，Kotlin 编译器会合并预期声明和实际声明。最终结果是一个包含目标平台实现的 `platform()` 函数。

预期声明和实际声明必须定义在同一个包中，以便在生成的平台代码中合并为*单个声明*。这样，在通用代码中对预期 `platform()` 函数的任何调用都将对应正确的实际实现。

与预期和实际函数类似，预期和实际属性允许你在不同平台上使用不同的值。预期和实际函数与属性最适合用于简单场景。

### 示例：生成 UUID {id="example-generate-a-uuid"}

假设你正在使用 Kotlin Multiplatform 开发 iOS 和 Android 应用程序，并且需要一种生成通用唯一识别码 (UUID) 的机制。

为此，请在 Kotlin Multiplatform 模块的通用源集中使用 `expect` 关键字声明预期函数 `randomUUID()`。请**勿**在 `expect` 声明中包含任何实现代码。

```kotlin
// 在通用源集中：
expect fun randomUUID(): String
```

在各个平台特定源集（iOS 和 Android）中，为通用模块中预期的 `randomUUID()` 函数提供实际实现。使用 `actual` 关键字标记这些实际实现。

![使用预期和实际声明生成 UUID](expect-generate-uuid.svg){width=700}

以下代码片段展示了 Android 和 iOS 的实现。平台特定代码使用 `actual` 关键字和相同的函数名称：

```kotlin
// 在 Android 源集中：
import java.util.*

actual fun randomUUID() = UUID.randomUUID().toString()
```

```kotlin
// 在 iOS 源集中：
import platform.Foundation.NSUUID

actual fun randomUUID(): String = NSUUID().UUIDString()
```

Android 实现使用 Android 上可用的 API，而 iOS 实现使用 iOS 上可用的 API。你可以从 Kotlin/Native 代码中访问 iOS API。

在为 Android 生成最终的平台代码时，Kotlin 编译器会自动合并预期声明和实际声明，并生成一个带有实际 Android 特定实现的单一 `randomUUID()` 函数。iOS 端也是相同的处理流程。

### 深入阅读 `expect`/`actual` 声明 {id="further-reading-on-expect-actual-declarations"}

* 要查看 `expect`/`actual` 声明的实际应用，请查看[基础 KMP 应用示例](quickstart.md#create-a-project)，其中包含一个返回每个目标平台名称的函数。
* 有关 `expect`/`actual` 机制的深入探讨，请参阅[预期声明和实际声明](multiplatform-expect-actual.md)。

## 通用代码中的接口 {id="interfaces-in-common-code"}

[Kotlin 的继承机制](https://kotlinlang.org/docs/inheritance.html)支持更加灵活的代码共享。例如，你可以在通用代码中定义一个包含平台无关抽象声明的接口，然后在各平台源集中提供该接口的实现。

![使用接口](expect-interfaces.svg){width=700}

无论在哪个平台上，平台名称都存储为 `String`：

```kotlin
// 在 commonMain 源集中：
interface Platform {
    val name: String
}
```

然后，你可以通过重写该声明并调用 Android API 来为该 `String` 赋值：

```kotlin
// 在 androidMain 源集中：
import android.os.Build

class AndroidPlatform : Platform {
    override val name: String = "Android ${Build.VERSION.SDK_INT}"
}
```

或调用 iOS 系统 API：

```kotlin
// 在 iosMain 源集中：
import platform.UIKit.UIDevice

class IOSPlatform : Platform {
    override val name: UIDevice.currentDevice.systemName() + " " + UIDevice.currentDevice.systemVersion
}
```

在使用通用接口时，为了注入相应的平台实现，你可以选择以下方案之一：

* [使用预期和实际函数](#expected-and-actual-functions)
* [通过不同的入口点提供实现](#different-entry-points)
* [使用依赖注入框架](#dependency-injection-framework)

### 预期和实际函数 {id="expected-and-actual-functions"}

你可以将通用接口与 [expect/actual 声明](#expected-and-actual-functions-and-properties)结合使用。  
定义一个返回该接口类型的 `expect` 函数，然后定义返回实现了该接口的平台特定类的 `actual` 函数：

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

通用代码中对 `platform()` 函数的调用将处理 `Platform` 类型的对象。当编译器合并预期声明和实际声明后，在 Android 上调用 `platform()` 会返回 `AndroidPlatform` 类的实例，而在 iOS 上则返回 `IOSPlatform` 类的实例。

> 这是 Kotlin Multiplatform IDE 向导（也可[在线访问](https://kmp.jetbrains.com/)）生成的项目所采用的方法。
> 运行 [KMP 快速入门](quickstart.md#create-a-project)即可创建一个简单项目并查看其实际运行效果。
> 
{style="tip"}

### 不同的入口点 {id="different-entry-points"}

如果你能够控制入口点，则无需使用预期和实际声明即可构造各平台工件的实现。为此，可以在共享的 Kotlin Multiplatform 模块中定义平台实现，但将其在各平台模块中进行实例化：

```kotlin
// 共享的 Kotlin Multiplatform 模块
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
// 在 iOS 应用的 Swift 代码中：
import shared

@main
struct iOSApp : App {
    init() {
        application(IOSPlatform())
    }
}
```

在 Android 上，你应该创建 `AndroidPlatform` 的实例并将其传递给 `application()` 函数；而在 iOS 上，同样应创建并传递 `IOSPlatform` 的实例。这些入口点不必是你整个应用程序的入口点，但它们是你调用共享模块特定功能的地方。

通过预期和实际函数，或者直接通过入口点来提供适当的实现，在简单场景下表现良好。但是，如果你的项目中使用了依赖注入框架，我们建议在简单场景下也使用它，以确保一致性。

### 依赖注入框架 {id="dependency-injection-framework"}

现代应用程序可以使用依赖注入 (DI) 框架实时决定使用哪种实现，并以此创建松散耦合的架构。任何支持 Kotlin Multiplatform 的 DI 框架都可以帮助你在运行时根据具体平台将不同的依赖项注入到组件中。

例如，[Koin](https://insert-koin.io/) 是一个支持 Kotlin Multiplatform 的依赖注入框架。你可以使用 Koin 实现如下 `Platform` 示例：

```kotlin
// 在通用源集中：
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

在此，Koin DSL 创建了用于定义待注入组件的模块。你在通用代码中使用 `expect` 关键字声明一个模块，然后使用 `actual` 关键字为每个平台提供特定于平台的实现。该框架会在运行时负责选择正确的实现。

当你使用 DI 框架时，所有依赖项都会通过该框架注入。处理平台依赖项也是同样的逻辑。如果你的项目中已经引入了 DI，我们建议继续使用 DI，而不是手动使用预期和实际函数。这样可以避免混用两种不同的依赖注入方式。

你也不一定非要用 Kotlin 来实现通用接口。你可以在另一个*平台模块*中使用其他语言（例如 Swift）来实现它。如果你选择这种方法，则应通过 DI 框架从 iOS 平台模块中提供该实现：

![使用依赖注入框架](expect-di-framework.svg){width=700}

这种方法仅在将实现放在平台模块中时才有效。它的扩展性不是很好，因为你的 Kotlin Multiplatform 模块无法做到自给自足，而且你还需要在另一个模块中实现通用接口。

<!-- 如果你有兴趣将此功能扩展到共享模块，请在 YouTrack 中为此问题投票并描述你的用例。 -->