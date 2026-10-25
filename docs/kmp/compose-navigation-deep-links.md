[//]: # (title: 深层链接)

深层链接（Deep linking）是一种导航机制，它允许操作系统通过将用户转至相应应用中的特定目标页面，来处理自定义链接。

深层链接是应用链接（Android 上的称谓，App links）或通用链接（iOS 术语，Universal links）更通用的形式：
后者是应用与特定 Web 地址之间经过验证的连接。
如需具体了解它们，请参阅关于 [Android 应用链接](https://developer.android.com/training/app-links)
和 [iOS 通用链接](https://developer.apple.com/documentation/xcode/allowing-apps-and-websites-to-link-to-your-content/) 的文档。

深层链接还可用于将外部输入传入应用，
例如在 OAuth 授权场景中：
你可以解析深层链接并获取 OAuth 令牌，而不必在界面上导航用户。

> 由于外部输入可能存在恶意内容，请务必遵循[安全准则](https://developer.android.com/privacy-and-security/risks/unsafe-use-of-deeplinks)，
> 妥善防范处理原始深层链接 URI 带来的风险。
> 
{style="warning"}

要在 Compose Multiplatform 中实现深层链接：

1. [在应用配置中注册你的深层链接架构 (Scheme)](#register-deep-links-schemas-in-the-operating-system)
2. [为导航图中的目标页面分配特定的深层链接](#assign-deep-links-to-destinations)
3. [处理应用接收到的深层链接](#handle-received-deep-links)

## 设置 {id="setup"}

要在 Compose Multiplatform 中使用深层链接，请按如下方式配置依赖项。

在 Gradle 版本目录 (catalog) 中列出这些版本、库和插件：

```toml
[versions]
compose-multiplatform = "%org.jetbrains.compose%"
agp = "8.9.0"

# 支持深层链接的多平台 Navigation 库版本 
androidx-navigation = "%org.jetbrains.androidx.navigation%"

# 与 Compose Multiplatform 1.8.0 配合使用的最低 Kotlin 版本
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

## 在操作系统中注册深层链接架构 {id="register-deep-links-schemas-in-the-operating-system"}

每个操作系统都有自己的深层链接处理方式。
查阅针对具体目标平台的官方文档会更加稳妥：

* 对于 Android 应用，深层链接 scheme 在 `AndroidManifest.xml` 文件中声明为 intent 过滤器 (intent filter)。
  请参阅 [Android 文档](https://developer.android.com/training/app-links/deep-linking?hl=en#adding-filters)
  了解如何正确设置 intent 过滤器。
* 对于 iOS 和 macOS 应用，深层链接 scheme 在 `Info.plist` 文件的
    [CFBundleURLTypes](https://developer.apple.com/documentation/bundleresources/information-property-list/cfbundleurltypes)
    键中声明。

    > Compose Multiplatform [提供了 Gradle DSL](compose-native-distribution.md#information-property-list-on-macos)
    > 用于向 macOS 应用的 `Info.plist` 添加值。
    > 对于 iOS，你可以直接在 KMP 项目中编辑该文件，也可以[使用 Xcode GUI 注册 scheme](https://developer.apple.com/documentation/xcode/defining-a-custom-url-scheme-for-your-app#Register-your-URL-scheme)。
    >
    {style="note"}
* 对于 Windows 应用，可以通过向 Windows 注册表添加[包含必要信息的键](https://learn.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/platform-apis/aa767914(v=vs.85))（适用于 Windows 8 及更早版本），
    或者在[程序包清单中指定扩展程序](https://learn.microsoft.com/en-us/windows/apps/develop/launch/handle-uri-activation)（适用于 Windows 10 和 11）来声明深层链接 scheme。
    这可以通过安装脚本或第三方分发包生成器（如 [Hydraulic Conveyor](https://conveyor.hydraulic.dev/)）完成。
    Compose Multiplatform 不支持在项目内部对其进行配置。
    
    > 请确保没有使用 [Windows 保留的 scheme](https://learn.microsoft.com/en-us/windows/apps/develop/launch/reserved-uri-scheme-names#reserved-uri-scheme-names)。
    >
    {style="tip"}
* 对于 Linux，深层链接 scheme 可以在发行版附带的 `.desktop` 文件中注册。

## 为目标页面分配深层链接 {id="assign-deep-links-to-destinations"}

作为导航图一部分声明的目标页面具有一个可选的 `deepLinks` 形参，
该形参可以包含对应 `NavDeepLink` 对象的列表。
每个 `NavDeeplink` 都描述了一个应与目标页面匹配的 URI 模式——你可以定义多个应导向同一屏幕的 URI 模式。

为一个路由定义的深层链接数量没有限制。

### 深层链接的通用 URI 模式 {id="general-uri-patterns-for-deep-links"}

通用 URI 模式应当匹配整个 URI。
你可以对形参使用占位符，以便在目标页面内从接收到的 URI 中提取它们。

通用 URI 模式的规则：

* 没有 scheme 的 URI 会被假定以 `http://` 或 `https://` 开头。
  因此 `uriPattern = "example.com"` 可以匹配 `http://example.com` 和 `https://example.com`。
* `{placeholder}` 匹配一个或多个字符（`example.com/name={name}` 匹配 `https://example.com/name=Bob`）。
  要匹配零个或多个字符，请使用 `.*` 通配符（`example.com/name={.*}` 既匹配 `https://example.com/name=`，
  也匹配 `name` 的任意值）。
* 路径占位符的形参是必填的，而查询占位符的匹配是可选的。
  例如，模式 `example.com/users/{id}?arg1={arg1}&arg2={arg2}`：
    * 不匹配 `http://www.example.com/users?arg1=one&arg2=two`，因为缺少了路径中必填的部分（`id`）。
    * 同时匹配 `http://www.example.com/users/4?arg2=two` 和 `http://www.example.com/users/4?arg1=one`。
    * 也匹配 `http://www.example.com/users/4?other=random`，因为多余的查询形参不会影响匹配。
* 如果多个可组合项都具有与接收到的 URI 匹配的 `navDeepLink`，其行为是不确定的。
  请确保你的深层链接模式互不重叠。
  如果需要多个可组合项处理相同的深层链接模式，请考虑添加路径或查询形参，
  或使用中间目标页面来对用户进行可预测的路由。

### 为路由类型生成的 URI 模式 {id="generated-uri-pattern-for-a-route-type"}

你可以避免完整书写 URI 模式：
Navigation 库可以根据路由的形参自动生成 URI 模式。

要使用此方法，请按如下方式定义深层链接：

```kotlin
composable<PlantDetail>(
    deepLinks = listOf(
        navDeepLink<PlantDetail>(basePath = "demo://example.com/plant")
    )
) { ... }
```

这里的 `PlantDetail` 是用于该目标页面的路由类型，而 `basePath` 中的 "plant"
是 `PlantDetail` 数据类的序列化名称（serial name）。

URI 模式的其余部分将按如下规则生成：

* 必填形参将作为路径形参追加（例如：`/{id}`）
* 带有默认值的形参（可选形参）将作为查询形参追加（例如：`?name={name}`）
* 集合将作为查询形参追加（例如：`?items={value1}&items={value2}`）
* 形参的顺序与路由定义中的字段顺序一致。

例如，对于以下路由类型：

```kotlin
@Serializable data class PlantDetail(
  val id: String,
  val name: String,
  val colors: List<String>,
  val latinName: String? = null,
)
```

库所生成的 URI 模式如下所示：

```none
<basePath>/{id}/{name}/?colors={color1}&colors={color2}&latinName={latinName}
```

### 向目标页面添加深层链接的示例 {id="example-of-adding-deep-links-to-a-destination"}

在此示例中，我们为一个目标页面分配了多个深层链接，然后
从接收到的 URI 中提取形参值：

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
            // 该可组合项应同时处理 demo://example1.org 和 demo://example2.org 的链接
            navDeepLink { uriPattern = "$firstBasePath?name={name}" },
            navDeepLink { uriPattern = "demo://example2.org/name={name}" },
            // 生成的模式仅处理形参，
            // 因此我们为路由类型添加序列化名称
            navDeepLink<DeepLinkScreen>(basePath = "$firstBasePath/dlscreen"),
        )
    ) {
        // 如果应用接收到 URI `demo://example1.org/dlscreen/Jane/`，
        // 它会匹配生成的 URI 模式（name 是必填形参且在路径中提供），
        // 并且你可以将其自动映射到路由类型
        val deeplink: DeepLinkScreen = backStackEntry.toRoute()
        val nameGenerated = deeplink.name
        
        // 如果应用接收到仅与通用模式匹配的 URI，
        // 例如 `demo://example1.com/?name=Jane`
        // 则需要直接解析该 URI
        val nameGeneral = backStackEntry.arguments?.read { getStringOrNull("name") }
        
        // 可组合项内容
    }
}
```

对于 Web 端，深层链接的工作方式略有不同：由于 Compose Multiplatform for Web 构建的是单页应用，
你需要将深层链接 URI 模式的所有形参放在 URL 片段（`#` 字符之后）中，
并确保所有形参都经过了 URL 编码。

如果 URL 片段符合 URI 模式规则，你仍然可以使用 `backStackEntry.toRoute()` 方法来解析形参。
有关在 Web 应用中访问和解析 URL 的详细信息，以及在浏览器中导航的细节，
请参阅[在 Web 应用中支持浏览器导航](compose-navigation-routing.md#support-for-browser-navigation-in-web-apps)。

```kotlin
composable<DeepLinkScreen>(
        deepLinks = listOf(
            // 在默认的 Compose Multiplatform 设置中，localhost:8080
            // 是通过 wasmJsBrowserDevelopmentRun Gradle 任务运行的本地开发端点
            navDeepLink { uriPattern = "localhost:8080/#dlscreen%2F{name}" },
        )
    ) { ... }
```

> 与任何其他单页 Web 应用一样，你也可以在 Web 上避免使用 URL 片段。
> 为此，你必须配置 Web 服务器将相应请求重定向到该应用，
> 并重写[导航路由到浏览器地址的默认映射](compose-navigation-routing.md#full-url-customization)。
>
{style="tip"}

## 处理接收到的深层链接 {id="handle-received-deep-links"}

在 Android 上，发送给应用的深层链接 URI 可作为触发该深层链接的 `Intent` 的一部分获取。
而跨平台实现则需要一种通用的深层链接监听方式。

我们来实现一个基础方案：

1. 在通用代码中声明一个单例，用于存储和缓存 URI，并带有一个外部 URI 监听器。
2. 在必要的位置实现平台特定调用，以发送从操作系统接收到的 URI。
3. 在主可组合项中设置针对新深层链接的监听器。

### 声明带有 URI 监听器的单例 {id="declare-a-singleton-with-a-uri-listener"}

在 `commonMain` 中，声明一个顶层单例对象：

```kotlin
object ExternalUriHandler {
    // 用于在监听器设置之前有 URI 到达时的暂存存储
    private var cached: String? = null
    
    var listener: ((uri: String) -> Unit)? = null
        set(value) {
            field = value
            if (value != null) {
                // 当设置了监听器且 `cached` 不为空时，
                // 立即使用缓存的 URI 调用监听器
                cached?.let { value.invoke(it) }
                cached = null
            }
        }

    // 当新的 URI 到达时，对其进行缓存。
    // 如果监听器已设置，则调用它并立即清除缓存。
    fun onNewUri(uri: String) {
        cached = uri
        listener?.let {
            it.invoke(uri)
            cached = null
        }
    }
}
```

### 实现针对单例的平台特定调用 {id="implement-platform-specific-calls-to-the-singleton"}

无论是桌面 JVM 还是 iOS，你都需要显式传递从系统接收到的 URI。

在 `jvmMain/.../main.kt` 中，解析每个所需操作系统的命令行实参，
并将接收到的 URI 传递给单例：

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

### 设置监听器 {id="set-up-the-listener"}

你可以使用 `DisposableEffect(Unit)` 来设置监听器，并在可组合项不再处于活跃状态后对其进行清理。
例如：

```kotlin
internal fun App(navController: NavHostController = rememberNavController()) = AppTheme {

    // 由于 `Unit` 从不改变，该 effect 仅生成一次
    DisposableEffect(Unit) {
        // 设置监听器，以便为列有匹配 `navDeepLink` 的可组合项
        // 调用 `NavController.navigate()`
        ExternalUriHandler.listener = { uri ->
            navController.navigate(NavUri(uri))
        }
        // 当可组合项不再活跃时移除监听器
        onDispose {
            ExternalUriHandler.listener = null
        }
    }

    // 复用本文前面的示例
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

## 结果 {id="result"}

现在你可以看到完整的工作流程：
当用户打开一个 `demo://` URI 时，操作系统会将其与已注册的 scheme 进行匹配。
接着：
  * 如果处理该深层链接的应用处于关闭状态，单例会接收 URI 并对其进行缓存。
    当主可组合函数启动时，
    它会调用该单例并导航到与缓存 URI 匹配的深层链接。
  * 如果处理该深层链接的应用处于打开状态，监听器此时已设置就绪，因此当单例接收到 URI 时，
    应用会立即导航至该链接。

## 后续步骤 {id="what-s-next"}

查看以下展示了 Compose Multiplatform 导航库实际运作的项目：

* 基础示例：[nav_cupcake 项目](https://github.com/JetBrains/compose-multiplatform/tree/master/examples/nav_cupcake)，
  由 [使用 Compose 在屏幕之间导航](https://developer.android.com/codelabs/basic-android-kotlin-compose-navigation#0) Android Codelab 转换而来。
* 高阶示例：官方 [KotlinConf](https://github.com/JetBrains/kotlinconf-app) 应用程序。