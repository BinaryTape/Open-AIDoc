---
title: KMP 平台集成
---

# KMP 平台集成

本页介绍了使用 Koin 的 Kotlin Multiplatform 应用的平台细节：从共享代码中使用 Android `Context`、从 Swift 调用 Koin，以及桌面端和 Web 目标。本文假设你的项目遵循 [KMP 设置](/docs/reference/koin-core/kmp-setup)和 [KMP 共享模式](/docs/reference/koin-core/kmp-shared-modules)。

完整项目：[Compose Multiplatform 示例](https://github.com/InsertKoinIO/koin-getting-started/tree/main/compose)（编译器插件 DSL）和[注解示例](https://github.com/InsertKoinIO/koin-getting-started/tree/main/compose-annotations)。

## 共享代码中的 Android Context {id="android-context-in-shared-code"}

共享代码无法使用 `android.content.Context`，但在 Android 上某些共享类又需要它（用于打开文件、读取偏好设置）。可以将其封装在一个公共代码可依赖的平台类型中：

**编译器插件 DSL**
```kotlin
// commonMain
interface ContextWrapper {
    fun getContextInfo(): String
}

class FileStore(private val ctx: ContextWrapper)

val storageModule = module {
    single<FileStore>()
}
```

```kotlin
// androidMain
class AndroidContextWrapper(val context: Context) : ContextWrapper {
    override fun getContextInfo() = "Android: ${context.packageName}"
}

actual fun platformModule(): Module = module {
    single<AndroidContextWrapper>() bind ContextWrapper::class
}
```

```kotlin
// iosMain
class IOSContextWrapper : ContextWrapper {
    override fun getContextInfo() = "iOS"
}

actual fun platformModule(): Module = module {
    single<IOSContextWrapper>() bind ContextWrapper::class
}
```

**注解**
```kotlin
// commonMain
interface ContextWrapper {
    fun getContextInfo(): String
}

@Singleton
class FileStore(private val ctx: ContextWrapper)
```

```kotlin
// androidMain
@Singleton
class AndroidContextWrapper(val context: Context) : ContextWrapper {
    override fun getContextInfo() = "Android: ${context.packageName}"
}
```

```kotlin
// iosMain
@Singleton
class IOSContextWrapper : ContextWrapper {
    override fun getContextInfo() = "iOS"
}
```

平台类由带有 `@ComponentScan` 的 `actual` 平台模块查找（参见 [KMP 共享模式](/docs/reference/koin-core/kmp-shared-modules)）。

**构造函数 / 经典 DSL**
```kotlin
// commonMain
interface ContextWrapper {
    fun getContextInfo(): String
}

class FileStore(private val ctx: ContextWrapper)

val storageModule = module {
    singleOf(::FileStore)
}
```

```kotlin
// androidMain
actual fun platformModule(): Module = module {
    singleOf(::AndroidContextWrapper) bind ContextWrapper::class
}

// iosMain
actual fun platformModule(): Module = module {
    singleOf(::IOSContextWrapper) bind ContextWrapper::class
}
```

`FileStore` 在 `commonMain` 中编译一次并接收平台包装器。仅有一个 Android 定义会涉及 `Context`，并且它在启动时设置了 `androidContext()` 后即可解析。请将特定于 Android 的操作置于 `ContextWrapper` 的方法之后，而不是在公共代码中检查平台类型。

## iOS 与 Swift {id="ios-and-swift"}

### 从 Swift 中获取依赖项 {id="retrieving-dependencies-from-swift"}

Swift 无法调用 Koin 的具体化函数（如 `get<T>()`）。在 Swift 边界处，可以在 `iosMain` 中编写一个实现 `KoinComponent` 的小型 Kotlin 帮助程序，并在 Swift 中使用它。这是一个互操作入口点：你的共享类仍通过其构造函数接收依赖项。

```kotlin
// iosMain
class GreetingHelper : KoinComponent {
    private val greeting: Greeting by inject()
    fun greet(): String = greeting.greeting()
}
```

```swift
struct ContentView: View {
    let greet = GreetingHelper().greet()

    var body: some View {
        Text(greet)
    }
}
```

在使用该帮助程序之前必须先启动 Koin：请参阅 [KMP 设置](/docs/reference/koin-core/kmp-setup)中的 iOS 入口点。关于 `KoinComponent` 的说明，请参阅 [KoinComponent](/docs/reference/koin-core/koin-component)。

### 在 Koin 中声明 Swift 实例 {id="declaring-a-swift-instance-in-koin"}

有时 Swift 类会实现 Kotlin 接口，而 Kotlin 代码需要从 Koin 中获取该接口。可以在运行时使用 `Koin.declare()` 注册该实例。Swift 将类型作为 Objective-C 类或协议传入，此 `iosMain` 帮助程序会将其转换为 Kotlin `KClass`：

```kotlin
// iosMain
@OptIn(BetaInteropApi::class)
fun Koin.declareFromSwift(
    instance: Any,
    bindTo: ObjCObject,
    qualifier: Qualifier? = null,
    allowOverride: Boolean = true
) {
    val kClass: KClass<*> = when (bindTo) {
        is ObjCClass -> getOriginalKotlinClass(bindTo)
        is ObjCProtocol -> getOriginalKotlinClass(bindTo)
        else -> null
    } ?: error("Can't resolve Kotlin KClass from $bindTo")

    declare(
        instance = instance,
        qualifier = qualifier,
        secondaryTypes = listOf(kClass),
        allowOverride = allowOverride
    )
}
```

```swift
koin.declareFromSwift(
    instance: SwiftAnalytics(),
    bindTo: Analytics.self,
    qualifier: nil,
    allowOverride: true
)
```

`getOriginalKotlinClass()` 来自 `kotlin.native`，可将类（类上的 `.self`）或协议（协议上的 `.self`）映射回其 Kotlin 类型。已声明的实例不会在编译时进行检查：如果 Swift 尚未声明该实例，Kotlin 消费者将在运行时失败。该帮助程序基于 [@SarahDelCastillo 的提议](https://github.com/InsertKoinIO/koin/issues/1108#issuecomment-3645990426)。

### 线程 {id="threading"}

Koin 运行在当前的 Kotlin/Native 内存模型上（自 Kotlin 1.7.20 起的默认模型）。你可以从任意线程解析依赖项并使用作用域，无需进行冻结或使用 `@SharedImmutable` 注解。

## 桌面端 (JVM) {id="desktop-jvm"}

在首个窗口出现之前的 `main()` 中启动 Koin：

```kotlin
// jvmMain
fun main() = application {
    initKoin {
        printLogger()
        modules(desktopModule)
    }

    Window(onCloseRequest = ::exitApplication) {
        App()
    }
}

val desktopModule = module {
    single<DesktopFileManager>()
}
```

共享 `initKoin` 的 `config` 形参添加了仅限桌面端的模块和记录器。桌面端是一个 JVM 目标，因此仅限 JVM 的功能（如 `fileProperties()`）均可用（参见[启动 Koin](/docs/reference/koin-core/starting-koin)）。

## Web (JS 与 Wasm) {id="web-js-and-wasm"}

在 `js` 或 `wasmJs` 源集的 `main()` 中启动 Koin：

```kotlin
// jsMain or wasmJsMain
fun main() {
    initKoin {
        modules(webModule)
    }
    // start your UI
}

val webModule = module {
    single<BrowserStorage>()
}
```

对于面向 Web 的 Compose Multiplatform，你也可以使用 `KoinApplication` 从根 Composable 中启动 Koin（参见 [Koin for Compose](/docs/reference/koin-compose/compose)）。

## 相关内容 {id="related"}

- [KMP 设置](/docs/reference/koin-core/kmp-setup)：依赖项、`initKoin`、入口点。
- [KMP 共享模式](/docs/reference/koin-core/kmp-shared-modules)：平台模块以及 `expect`/`actual` 定义。
- [KoinComponent](/docs/reference/koin-core/koin-component)：从非 Koin 创建的类中获取依赖项。
- [Koin for Compose](/docs/reference/koin-compose/compose)：Compose Multiplatform 集成。
- [测试](/docs/reference/koin-test/testing)：在 `commonTest` 中测试共享模块。