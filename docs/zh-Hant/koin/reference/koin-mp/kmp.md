---
title: KMP 平台整合
---

# KMP 平台整合

本頁涵蓋使用 Koin 的 Kotlin Multiplatform 應用程式的平台詳細資訊：從共用程式碼使用 Android `Context`、從 Swift 呼叫 Koin，以及桌面與 Web 目標。本文假設您的專案遵循 [KMP 設定](/docs/reference/koin-core/kmp-setup) 與 [KMP 共用模式](/docs/reference/koin-core/kmp-shared-modules)。

完整專案範例：[Compose Multiplatform 範例](https://github.com/InsertKoinIO/koin-getting-started/tree/main/compose)（編譯器外掛程式 DSL）以及[註解範例](https://github.com/InsertKoinIO/koin-getting-started/tree/main/compose-annotations)。

## 共用程式碼中的 Android Context {id="android-context-in-shared-code"}

共用程式碼無法直接使用 `android.content.Context`，但某些共用類別在 Android 上需要它（用於開啟檔案、讀取偏好設定）。請將其包裝在通用程式碼可以依賴的平台型別中：

**Compiler Plugin DSL**
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

**Annotations**
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

平台類別會由帶有 `@ComponentScan` 的 `actual` 平台模組找到（請參閱 [KMP 共用模式](/docs/reference/koin-core/kmp-shared-modules)）。

**Constructor / Classic DSL**
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

`FileStore` 在 `commonMain` 中編譯一次並接收平台包裝物件。只有一個 Android 定義會接觸到 `Context`，並且在啟動時設定 `androidContext()` 後即可解析。請將 Android 特定的操作置於 `ContextWrapper` 的方法背後，而不是在通用程式碼中檢查平台型別。

## iOS 與 Swift {id="ios-and-swift"}

### 從 Swift 擷取相依性 {id="retrieving-dependencies-from-swift"}

Swift 無法呼叫 Koin 的具體化函式，例如 `get<T>()`。在 Swift 邊界處，於 `iosMain` 中撰寫一個實作 `KoinComponent` 的小型 Kotlin 幫助程式，並從 Swift 中使用它。這是一個互通入口點：您的共用類別仍可繼續透過其建構函式接收相依性。

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

使用該幫助程式前必須先啟動 Koin：請參閱 [KMP 設定](/docs/reference/koin-core/kmp-setup) 中的 iOS 入口點。`KoinComponent` 的說明請參閱 [KoinComponent](/docs/reference/koin-core/koin-component)。

### 在 Koin 中宣告 Swift 執行個體 {id="declaring-a-swift-instance-in-koin"}

有時 Swift 類別會實作 Kotlin 介面，而 Kotlin 程式碼需要從 Koin 取得它。可以在執行時期使用 `Koin.declare()` 註冊該執行個體。Swift 會將該型別以 Objective-C 類別或協定的形式傳遞，而此 `iosMain` 幫助程式會將其轉換為 Kotlin `KClass`：

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

`getOriginalKotlinClass()` 來自 `kotlin.native`，並將類別（類別上的 `.self`）或協定（協定上的 `.self`）對應回其 Kotlin 型別。宣告的執行個體不會在編譯期進行檢查：若 Swift 尚未宣告該執行個體，Kotlin 取用端將在執行時期失敗。此幫助程式是基於 [@SarahDelCastillo 提出的建議](https://github.com/InsertKoinIO/koin/issues/1108#issuecomment-3645990426)。

### 執行緒 {id="threading"}

Koin 運作於目前的 Kotlin/Native 記憶體模型（自 Kotlin 1.7.20 起的預設模型）。您可以從任何執行緒解析相依性並使用作用域，無需凍結（freezing）或 `@SharedImmutable` 註解。

## 桌面端 (JVM) {id="desktop-jvm"}

在開啟第一個視窗之前，於 `main()` 中啟動 Koin：

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

共用 `initKoin` 的 `config` 參數可加入僅限桌面端的模組和記錄器。桌面端是 JVM 目標，因此可使用僅限 JVM 的功能，例如 `fileProperties()`（請參閱[啟動 Koin](/docs/reference/koin-core/starting-koin)）。

## Web (JS 與 Wasm) {id="web-js-and-wasm"}

在 `js` 或 `wasmJs` 原始碼集的 `main()` 中啟動 Koin：

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

搭配使用適用於 Web 的 Compose Multiplatform 時，您也可以改為在根 Composable 中使用 `KoinApplication` 啟動 Koin（請參閱 [Koin for Compose](/docs/reference/koin-compose/compose)）。

## 相關內容 {id="related"}

- [KMP 設定](/docs/reference/koin-core/kmp-setup)：相依性、`initKoin`、入口點。
- [KMP 共用模式](/docs/reference/koin-core/kmp-shared-modules)：平台模組與 `expect`/`actual` 定義。
- [KoinComponent](/docs/reference/koin-core/koin-component)：從非 Koin 建立的類別中擷取相依性。
- [Koin for Compose](/docs/reference/koin-compose/compose)：Compose Multiplatform 整合。
- [測試](/docs/reference/koin-test/testing)：在 `commonTest` 中測試共用模組。