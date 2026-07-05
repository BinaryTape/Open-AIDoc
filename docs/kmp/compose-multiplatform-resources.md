[//]: # (title: 资源概览)

Compose Multiplatform 提供了一个专门的 `compose-multiplatform-resources` 库和 Gradle 插件支持，用于在所有受支持平台的公共代码中访问资源。资源是可在应用中使用的静态内容，例如图像、字体和字符串。

在 Compose Multiplatform 中处理资源时，请考虑当前的限制条件：

* 几乎所有资源都在调用者线程中同步读取。唯一的例外是异步读取的原始文件和 [Web 资源](compose-web-resources.md)。
* 尚不支持以流的形式读取大型原始文件（例如长视频）。请使用 [`getUri()`](compose-multiplatform-resources-usage.md#accessing-multiplatform-resources-from-external-libraries) 函数将单个文件传递给系统 API，例如 [kotlinx-io](https://github.com/Kotlin/kotlinx-io) 库。
* 从 1.6.10 版本开始，只要你使用的是 Kotlin 2.0.0 或更高版本，以及 Gradle 7.6 或更高版本，就可以将资源放置在任何模块或源集中。

要了解如何在 Compose Multiplatform 中使用资源，请参阅以下关键章节：

* [多平台资源的设置与配置](compose-multiplatform-resources-setup.md)

  添加 `resources` 库依赖项并设置应用应当能够访问的所有资源。

* [在应用中使用多平台资源](compose-multiplatform-resources-usage.md)

  了解如何使用自动生成的访问器直接在 UI 代码中访问资源。

* [本地资源环境](compose-resource-environment.md)
  
  管理应用的资源环境，如应用内主题和语言。