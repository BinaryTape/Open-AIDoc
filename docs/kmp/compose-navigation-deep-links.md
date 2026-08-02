[//]: # (title: 深层链接)

深层链接 (Deep linking) 是一种导航机制，允许操作系统通过将用户引导至相应应用中的特定目的地来处理自定义链接。

深层链接是应用链接 (app links，在 Android 上的称呼) 或通用链接 (universal links，iOS 术语) 的更一般情况：这些是应用与特定 Web 地址的经过验证的连接。
要专门了解这些内容，请参阅关于 [Android App Links](https://developer.android.com/training/app-links) 和 [iOS 通用链接 (universal links)](https://developer.apple.com/documentation/xcode/allowing-apps-and-websites-to-link-to-your-content/) 的文档。

深层链接对于将外部输入获取到应用中也很有用，例如在 OAuth 授权的情况下：你可以解析深层链接并获取 OAuth 令牌，而无需在视觉上导航用户。

> 由于外部输入可能是恶意的，请务必遵循[安全指南](https://developer.android.com/privacy-and-security/risks/unsafe-use-of-deeplinks)，以妥善降低与处理原始深层链接 URI 相关的风险。
> 
{style="warning"}

要在 Compose 跨平台中实现深层链接：

1. [在应用配置中注册你的深层链接协议 (schema)](#register-deep-links-schemas-in-the-operating-system)
2. [在导航图中为目的地分配特定的深层链接](#assign-deep-links-to-destinations)
3. [处理应用接收到的深层链接](#handle-received-deep-links)

## 设置

要在 Compose 跨平台中使用深层链接，请按如下方式设置依赖项。

在你的 Gradle 目录中列出这些版本、库和插件：

```toml
[versions]
compose-multiplatform = "%org.jetbrains.compose%"
agp = "8.9.0"

# 支持深层链接的多平台 Navigation 库版本 
androidx-navigation = "%org.jetbrains.androidx.navigation%"

# 与 Compose 跨平台 1.8.0 配合使用的最低 Kotlin 版本
kotlin = "2.1.0"

# 实现类型安全路由所需的序列化库
kotlinx-serialization = "1.7.3"

[libraries]
navigation-compose = { module = "org.jetbrains.androidx.navigation:navigation-compose", version.ref = "androidx-navigation" }
kotlinx-serialization-json = { module = "org.jetbrains.kotlinx:kotlinx-serialization-json", version.ref = "kotlinx-serialization" }

[plugins]
multiplatform = { id = "org.jetbrains.kotlin.multiplatform", version.ref = "kotlin" }
compose-compiler = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }
compose = { id = "org.jetbrains.compose", version.ref = "compose-multiplatform" }
kotlinx-serialization = { id = "org.jetbrains.kotlin.plugin.serialization", version.ref = "kotlin" }
android-application = { id = "com.android.application", version.ref = "agp" }
```

将额外的依赖项添加到共享模块的 `build.gradle.kts` 中：

```kotlin
plugins {
    // ...
    alias(libs.plugins.kotlinx.serialization)
}

// ...

kotlin {
    // ...
    sourceSets {
        commonMain.dependencies {
            // ...
            implementation(libs.androidx.navigation.compose)
            implementation(libs.kotlinx.serialization.json)
        }
    }
}
```

## 在操作系统中注册深层链接协议 (schema)

每个操作系统都有自己处理深层链接的方式。参考针对你特定目标的文档会更可靠：

* 对于 Android 应用，深层链接方案 (scheme) 在 `AndroidManifest.xml` 文件中声明为意图过滤器 (intent filters)。
  请参阅 [Android 文档](https://developer.android.com/training/app-links/deep-linking?hl=en#adding-filters)以了解如何正确设置意图过滤器。
* 对于 iOS 和 macOS 应用，深层链接方案在 `Info.plist` 文件的 [CFBundleURLTypes](https://developer.apple.com/documentation/bundleresources/information-property-list/cfbundleurltypes) 键中声明。

    > Compose 跨平台[提供了一个 Gradle DSL](compose-native-distribution.md#information-property-list-on-macos)，用于向 macOS 应用的 `Info.plist` 添加值。
    > 对于 iOS，你可以直接在 KMP 项目中编辑该文件，或[使用 Xcode GUI 注册方案](https://developer.apple.com/documentation/xcode/defining-a-custom-url-scheme-for-your-app#Register-your-URL-scheme)。
    >
    {style="note"}
* 对于 Windows 应用，可以通过[向 Windows 注册表添加包含必要信息的键](https://learn.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/platform-apis/aa767914(v=vs.85))（对于 Windows 8 及更早版本）或在[包清单中指定扩展名](https://learn.microsoft.com/en-us/windows/apps/develop/launch/handle-uri-activation)（对于 Windows 10 和 11）来声明深层链接方案。
    这可以通过安装脚本或第三方分发包生成器（如 [Hydraulic Conveyor](https://conveyor.hydraulic.dev/)）来完成。
    Compose 跨平台不支持在项目内部配置此项。
    
    > 确保你没有使用 [Windows 保留的方案](https://learn.microsoft.com/en-us/windows/apps/develop/launch/reserved-uri-scheme-names#reserved-uri-scheme-names)之一。
    >
    {style="tip"}
* 对于 Linux，深层链接方案可以在分发版中包含的 `.desktop` 文件中注册。

## 为目的地分配深层链接

作为导航图的一部分声明的目的地具有一个可选的 `deepLinks` 参数，该参数可以保存相应 `NavDeepLink` 对象的列表。
每个 `NavDeeplink` 描述了一个应与目的地匹配的 URI 模式——你可以定义多个应引导至同一屏幕的 URI 模式。

你可以为一条路由定义的深层链接数量没有限制。

### 深层链接的通用 URI 模式

通用 URI 模式应匹配整个 URI。
你可以使用参数的占位符，以便从目的地内接收到的 URI 中提取它们。

通用 URI 模式的规则：

* 不带方案的 URI 被假定为以 `http://` 或 `https://` 开头。
  因此 `uriPattern = "example.com"` 匹配 `http://example.com` 和 `https://example.com`。
* `{placeholder}` 匹配一个或多个字符 (`example.com/name={name}` 匹配 `https://example.com/name=Bob`)。
  要匹配零个或多个字符，请使用 `.*` 通配符 (`example.com/name={.*}` 既匹配 `https://example.com/name=` 也匹配 `name` 的任何值)。
* 路径占位符的参数是必需的，而查询占位符的匹配是可选的。
  例如，模式 `example.com/users/{id}?arg1={arg1}&arg2={arg2}`：
    * 不匹配 `http://www.example.com/users?arg1=one&arg2=two`，因为缺少路径的必需部分 (`id`)。
    * 同时匹配 `http://www.example.com/users/4?arg2=two` 和 `http://www.example.com/users/4?arg1=one`。
    * 也匹配 `http://www.example.com/users/4?other=random`，因为多余的查询参数不会影响匹配。
* 如果多个可组合项具有与接收到的 URI 匹配的 `navDeepLink`，则行为是不确定的。
  请确保你的深层链接模式不会交叉。
  如果你需要多个可组合项处理相同的深层链接模式，请考虑添加路径或查询参数，或者使用中间目的地来可预测地路由用户。

### 为路由类型生成的 URI 模式

你可以避免完整地写出 URI 模式：
Navigation 库可以根据路由的参数自动生成 URI 模式。

要使用此方法，请定义如下深层链接：

```kotlin
composable<PlantDetail>(
    deepLinks = listOf(
        navDeepLink<PlantDetail>(basePath = "demo://example.com/plant")
    )
) { ... }
```

这里 `PlantDetail` 是你为目的地使用的路由类型，而 `basePath` 中的 "plant" 是 `PlantDetail` 数据类的序列化名称。

URI 模式的其余部分将生成如下：

* 必需参数作为路径参数附加（例如：`/{id}`）
* 具有默认值的参数（可选参数）作为查询参数附加（例如：`?name={name}`）
* 集合作为查询参数附加（例如：`?items={value1}&items={value2}`）
* 参数的顺序与路由 definition 中字段的顺序一致。

例如，此路由类型：

```kotlin
@Serializable data class PlantDetail(
  val id: String,
  val name: String,
  val colors: List<String>,
  val latinName: String? = null,
)
```

具有由库生成的以下生成 URI 模式：

```none
<basePath>/{id}/{name}/?colors={color1}&colors={color2}&latinName={latinName}
```

### 为目的地添加深层链接的示例

在此示例中，我们为一个目的地分配了多个深层链接，然后从接收到的 URI 中提取参数值：

```kotlin
@Serializable @SerialName("dlscreen") data class DeepLinkScreen(val name: String)

// ...

val firstBasePath = "demo://example1.org"

NavHost(
    navController = navController,
    startDestination = FirstScreen
) {
    // ...
    
    composable<DeepLinkScreen>(
        deepLinks = listOf(
            // 此可组合项应同时处理 demo://example1.org 和 demo://example2.org 的链接
            navDeepLink { uriPattern = "$firstBasePath?name={name}" },
            navDeepLink { uriPattern = "demo://example2.org/name={name}" },
            // 生成的模式仅处理参数，
            // 因此我们为路由类型添加序列化名称
            navDeepLink<DeepLinkScreen>(basePath = "$firstBasePath/dlscreen"),
        )
    ) {
        // 如果应用接收到 URI `demo://example1.org/dlscreen/Jane/`，
        // 它与生成的 URI 模式匹配（name 是必需参数并在路径中给出），
        // 并且你可以自动将其映射到路由类型
        val deeplink: DeepLinkScreen = backStackEntry.toRoute()
        val nameGenerated = deeplink.name
        
        // 如果应用接收到仅匹配通用模式的 URI，
        // 例如 `demo://example1.com/?name=Jane`
        // 你需要直接解析 URI
        val nameGeneral = backStackEntry.arguments?.read { getStringOrNull("name") }
        
        // 可组合项内容
    }
}
```

对于 Web，深层链接的工作方式略有不同：由于 Compose 跨平台 Web 版制作的是单页面应用，
你需要将深层链接 URI 模式的所有参数放在 URL 片段中（在 `#` 字符之后），并确保所有参数都经过 URL 编码。

如果 URL 片段符合 URI 模式规则，你仍然可以使用 `backStackEntry.toRoute()` 方法来解析参数。
有关在 Web 应用中访问和解析 URL 的详细信息，以及在浏览器中导航的详细细节，请参阅 [undefined](compose-navigation-routing.md#support-for-browser-navigation-in-web-apps)。

```kotlin
composable<DeepLinkScreen>(
        deepLinks = listOf(
            // 对于默认的 Compose 跨平台设置，localhost:8080
            // 是通过 wasmJsBrowserDevelopmentRun Gradle 任务运行的本地开发端点
            navDeepLink { uriPattern = "localhost:8080/#dlscreen%2F{name}" },
        )
    ) { ... }
```

> 与任何其他单页面 Web 应用一样，你可以避免在 Web 上使用 URL 片段。
> 为此，你必须配置 Web 服务器以将相应的请求重定向到应用，并重写[导航路由到浏览器地址的默认映射](compose-navigation-routing.md#full-url-customization)。
>
{style="tip"}

## 处理接收到的深层链接

在 Android 上，发送到应用的深层链接 URI 可作为触发深层链接的 `Intent` 的一部分使用。
跨平台实现需要一种通用的方式来侦听深层链接。

让我们创建一个基础实现：

1. 在公共代码中声明一个单例，用于存储和缓存 URI，并带有一个外部 URI 侦听器。
2. 在必要处，实现发送从操作系统接收到的 URI 的平台特定调用。
3. 在主可组合项中为新深层链接设置侦听器。

### 声明一个带有 URI 侦听器的单例

在 `commonMain` 中，在顶层声明单例对象：

```kotlin
object ExternalUriHandler {
    // 用于存储在侦听器设置之前到达的 URI
    private var cached: String? = null
    
    var listener: ((uri: String) -> Unit)? = null
        set(value) {
            field = value
            if (value != null) {
                // 当设置了侦听器且 `cached` 不为空时，
                // 立即使用缓存的 URI 调用侦听器
                cached?.let { value.invoke(it) }
                cached = null
            }
        }

    // 当新 URI 到达时，将其缓存。
    // 如果已设置侦听器，则调用它并立即清除缓存。
    fun onNewUri(uri: String) {
        cached = uri
        listener?.let {
            it.invoke(uri)
            cached = null
        }
    }
}
```

### 实现对单例的平台特定调用

对于桌面 JVM 和 iOS，你都需要显式传递从系统接收到的 URI。

在 `jvmMain/.../main.kt` 中，解析每个必要操作系统的命令行参数，并将接收到的 URI 传递给单例：

```kotlin
// 导入单例
import org.company.app.ExternalUriHandler

fun main() {
    if(System.getProperty("os.name").indexOf("Mac") > -1) {
        Desktop.getDesktop().setOpenURIHandler { uri ->
            ExternalUriHandler.onNewUri(uri.uri.toString())
        }
    }
    else {
        ExternalUriHandler.onNewUri(args.getOrNull(0).toString())
    }

    application {
         // ...
    }
}
```

对于 iOS，在 Swift 代码中添加一个处理传入 URI 的 `application()` 变体：

```swift
// 导入 KMP 模块以访问单例
import SharedUI

func application(
    _ application: UIApplication,
    open uri: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
) -> Bool {
    // 将完整 URI 发送给单例
    ExternalUriHandler.shared.onNewUri(uri: uri.absoluteString)    
        return true
    }
```

> 有关从 Swift 访问单例的命名约定，请参阅 [Kotlin/Native 文档](https://kotlinlang.org/docs/native-objc-interop.html#kotlin-singletons)。
> 
{style="tip"}

### 设置侦听器

你可以使用 `DisposableEffect(Unit)` 来设置侦听器，并在可组合项不再处于活动状态后清理它。
例如：

```kotlin
internal fun App(navController: NavHostController = rememberNavController()) = AppTheme {

    // 该 effect 仅产生一次，因为 `Unit` 永远不会改变
    DisposableEffect(Unit) {
        // 设置侦听器以调用 `NavController.navigate()`
        // 针对列出了匹配 `navDeepLink` 的可组合项
        ExternalUriHandler.listener = { uri ->
            navController.navigate(NavUri(uri))
        }
        // 当可组合项不再处于活动状态时移除侦听器
        onDispose {
            ExternalUriHandler.listener = null
        }
    }

    // 重用本文早些时候的示例
    NavHost(
        navController = navController,
        startDestination = FirstScreen
    ) {
        // ...

        composable<DeepLinkScreen>(
            deepLinks = listOf(
                navDeepLink { uriPattern = "$firstBasePath?name={name}" },
                navDeepLink { uriPattern = "demo://example2.com/name={name}" },
            )
        ) {
            // 可组合项内容
        }
    }
}
```

## 结果

现在你可以看到完整的工作流程：
当用户打开一个 `demo://` URI 时，操作系统会将其与注册的方案匹配。
然后：
  * 如果处理深层链接的应用已关闭，单例接收 URI 并将其缓存。
    当主可组合函数启动时，它会调用单例并导航到与缓存 URI 匹配的深层链接。
  * 如果处理深层链接的应用已打开，侦听器已经设置好，因此当单例接收到 URI 时，应用会立即导航到该链接。

## 下一步

查看展示 Compose 跨平台导航库实际运用的项目：

* 基础示例：[nav_cupcake 项目](https://github.com/JetBrains/compose-multiplatform/tree/master/examples/nav_cupcake)，该项目由 Android 实验课 [在 Compose 屏幕间导航](https://developer.android.com/codelabs/basic-android-kotlin-compose-navigation#0) 转换而来。 
* 进阶示例：官方 [KotlinConf](https://github.com/JetBrains/kotlinconf-app) 应用程序。