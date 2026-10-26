[//]: # (title: 处理 Web 资源)

在这里，你可以找到有关使用浏览器功能和 `preload` API 预加载资源、缓存 Web 资源以及自动字体回退的信息。
  
## 为 Web 目标预加载资源 {id="preloading-of-resources-for-web-targets"}

字体和图像等 Web 资源使用 [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) 异步加载。
在初始加载期间或网络连接较慢时，资源获取可能会导致视觉瑕疵，
例如 [FOUT](https://fonts.google.com/knowledge/glossary/fout) 或显示占位符而非图像。

此问题的一个典型示例是：当 `Text()` 组件包含使用自定义字体的文本，但包含所需字形的字体仍在加载中。在这种情况下，用户可能会暂时看到使用默认字体的文本，甚至看到空白框和问号而非字符。类似地，对于图像或可绘制对象，在资源完全加载之前，用户可能会看到空白或黑色色块等占位符。

为了防止出现视觉瑕疵，你可以使用内置的浏览器功能来预加载资源，也可以使用 Compose Multiplatform 的预加载 API，或者两者结合使用。

### 使用浏览器功能预加载资源 {id="preload-resources-using-browser-features"}

在现代浏览器中，你可以使用带有 [`rel="preload"` 特性](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/preload)的 `<link>` 标记预加载资源。
该特性指示浏览器在应用程序启动之前优先下载并缓存字体和图像等资源，
从而确保这些资源能够尽早可用。

例如，要启用字体的浏览器内预加载：

1. 构建应用程序的 Web 分发包：

    ```console
       ./gradlew :shared:wasmJsBrowserDistribution
    ```

2. 在生成的 `dist` 目录中找到所需资源并保存路径。
3. 打开 `wasmJsMain/resources/index.html` 文件并在 `<head>` 元素中添加 `<link>` 标记。
4. 将 `href` 特性设置为资源路径：

```html
<link rel="preload" href="./composeResources/username.shared.generated.resources/font/FiraMono-Regular.ttf" as="fetch" type="font/ttf" crossorigin/>
```

### 使用 Compose Multiplatform 预加载 API 预加载资源 {id="preload-resources-using-the-compose-multiplatform-preload-api"}

即使你在浏览器中预加载了资源，它们也是以原始字节形式缓存的，仍需要转换为适合渲染的格式，例如 `FontResource` 和 `DrawableResource`。当应用程序首次请求该资源时，转换是异步完成的，这可能会再次导致闪烁。为了进一步优化体验，Compose Multiplatform 资源拥有自己的内部缓存，用于存储资源的更高级表示形式，这些高级表示形式也可以进行预加载。

Compose Multiplatform 1.8.0 引入了用于在 Web 目标上预加载字体和图像资源的 API：`preloadFont()`、`preloadImageBitmap()` 和 `preloadImageVector()`。

当渲染过程中遇到未解析的字符时，包含缺失字符的回退字体将[自动下载](#automatic-font-fallback)，因此像 emoji 这样的特殊字符得以开箱即用支持。

如果你想要控制使用哪个回退字体而不是依赖自动回退字体，可以通过 `FontFamily.Resolver.preload()` 方法手动指定。
Web 目标支持 TTF、OTF、TTC、可变字体以及 WOFF/WOFF2 字体格式。

以下示例演示了如何使用矢量图像的预加载：

```kotlin
@Composable
fun App() {
    val icon by preloadImageVector(Res.drawable.heavy_vector_icon)

    if (icon != null) {
        MainScreen()
    } else {
        Box(modifier = Modifier.fillMaxSize()) {
            CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
        }
    }
}

@Composable
fun MainScreen() {
    // 该图标从缓存中加载
    Image(painter = painterResource(Res.drawable.heavy_vector_icon), contentDescription = null)
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="val icon by preloadImageVector(Res.drawable.heavy_vector_icon)"}

## 自动字体回退 {id="automatic-font-fallback"}
<primary-label ref="Experimental"/>

默认情况下，应用程序已加载字体未覆盖的字符将显示为替换字形（□，即著名的“[豆腐块 (tofu)](https://fonts.google.com/knowledge/glossary/tofu)”）。

从 1.12.0 版本开始，Compose Multiplatform 会在渲染期间监控未解析的字符，并按需下载所需的 Noto 字体子集。Noto 这一名称是“no tofu（没有豆腐块）”的简写，因为这些字体旨在消除“豆腐块”字形。

字体可用后，受影响的文本会触发重组。
请注意，在下载期间可能会短暂出现“豆腐块”。

对于 CJK（中文、日文和韩文）字符，系统会根据浏览器的语言设置自动选择正确的字体变体。

## 缓存 Web 资源 {id="caching-web-resources"}
<primary-label ref="Experimental"/>

Compose Multiplatform 使用 [Web Cache API](https://developer.mozilla.org/en-US/docs/Web/API/Cache) 来缓存成功的响应，并避免浏览器默认缓存机制通常执行的冗余 HTTP 重新验证。

在每次应用启动和页面刷新时，缓存都会被全局清除。
在此阶段重置缓存可确保资源的一致性，
因为跨多个会话重用缓存可能会导致资源过时或不兼容，
进而可能引发应用程序崩溃或逻辑不一致。

为了防止对同一资源进行冗余的并发获取，该实现采用了针对特定资源的锁机制。
每个请求都由针对该资源的互斥锁保护，
允许对不同资源进行并发请求，同时对相同路径的重复请求进行序列化处理。
这种设计最大限度地减少了不必要的网络流量，并消除了填充缓存期间的竞态条件。

## 后续步骤 {id="what-s-next"}

* 详细了解[设置资源](compose-multiplatform-resources-setup.md)和[在应用中使用它们](compose-multiplatform-resources-usage.md)。
* 了解如何管理应用程序的[资源环境](compose-resource-environment.md)（例如应用内主题和语言）。