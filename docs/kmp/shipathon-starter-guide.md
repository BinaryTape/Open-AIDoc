[//]: # (title: Kotlin Multiplatform 快速入门指南)

## 从哪里开始

1. 了解 Kotlin Multiplatform (KMP) 和 Compose Multiplatform (CMP)：
   它们是什么，以及它们的[优势与用例](kmp-overview.md)。
2. [在示例项目中尝试 KMP](quickstart.md)，查看它是如何组织的，以及它是如何在不同平台上运行的。

## 学习 KMP 基础

基础知识包括：

* [了解 KMP / CMP 项目是如何组织的](multiplatform-discover-project.md)。
  内容涵盖：
    * 共享模块中的公共代码和平台特定代码。
    * 目标平台声明。
* [向 KMP 项目添加依赖项](multiplatform-add-dependencies.md)。
    * 有关多平台和平台特定依赖项组织的实际示例，请参阅我们的[示例](https://github.com/kotlin-hands-on/get-started-with-kmp/tree/main)。
    * 引导至该示例最终状态的教程已[在文档中提供](multiplatform-upgrade-app.md)。
* 如果你已经熟悉 KMP，请确保你已了解针对普通项目的[推荐项目结构](multiplatform-project-recommended-structure.md)。
  该结构考虑了 Android Gradle plugin 9.0 的发布如何影响对 KMP 项目的要求，并涵盖了：
    * 模块结构（带有作为库使用的共享代码模块的独立应用模块）。
    * 创建新的应用模块以及从 AGP 8 使用的旧结构进行迁移。
* 由 JetBrains 技术布道师录制的[关于项目结构的建议视频](https://www.youtube.com/watch?v=Atvl0l7fm1Y)。

<!-- ## \[AI Agents scenario tools TODO\] -->

## 共享代码

在 KMP 项目中有不同的方式来共享代码，并带有一些平台特性：

* 入门教程涵盖了从应用模块调用公共代码的基础示例：
    * [针对原生 UI 和共享逻辑](multiplatform-create-first-app.md)
    * [针对共享 UI 和逻辑](compose-multiplatform-create-first-app.md)
* [如何访问平台特定 API](multiplatform-connect-to-apis.md)：
    * 尽可能使用多平台库。
    * 当没有合适的多平台库可用时，使用 `expect`/`actual` 机制。
* 虽然从 Android Kotlin 调用共享 Kotlin 相对简单，但 iOS 互操作性需要一些了解：
    * [了解如何将共享代码与 iOS 应用集成](multiplatform-ios-integration-overview.md#local-integration)（本文档中引用的所有示例都有设置好的 iOS 集成示例）。
      > CocoaPods 目前正被逐渐淘汰，转而使用 Swift Package Manager，我们不建议在高性能项目中使用它。
      >
      {style="note"}   
    * 查看包含使 Kotlin 协程在 iOS 上运行的[示例和教程](multiplatform-upgrade-app.md#add-more-dependencies)。
    * 参阅在 [KMP iOS 应用中使用现有 SPM 软件包](multiplatform-spm-import.md)的指南。
    * 阅读[关于从 Kotlin 调用 Swift / ObjC](https://kotlinlang.org/docs/native-objc-interop.html) 以及反之亦然的深入解释。
    * 了解更直接的 [Swift export](https://kotlinlang.org/docs/native-swift-export.html) 方法（目前处于 Alpha 阶段）。
    * 通常情况下，互操作越少越好，因此为了获得更流畅的体验，我们建议依靠 Compose Multiplatform 为所有平台构建大部分 UI。

## 探索生态系统

[klibs.io](https://klibs.io/) 提供了全面的多平台库目录：

* 大多数流行场景已经有了成熟的解决方案，通常还有备选方案：
  数据库使用 [SQLDelight](https://sqldelight.github.io/sqldelight/) 和 [Room](https://developer.android.com/kotlin/multiplatform/room)，网络使用 [Ktor](https://ktor.io/) 和 [OkHttp](https://square.github.io/okhttp/)，图片加载使用 [Coil](https://coil-kt.github.io/coil/)，等等。
* 提供了为最流行用例使用多平台库构建的应用示例：
    * [SQLDelight / Ktor / kotlinx-serialization / Koin](https://github.com/kotlin-hands-on/kmp-networking-and-data-storage/tree/final)
      以及对应的[教程](multiplatform-ktor-sqldelight.md)。
    * 从[原始 Android 示例](https://github.com/android/compose-samples/tree/main/Jetcaster)转换而来的[多平台 Jetcaster 应用](https://github.com/kotlin-hands-on/jetcaster-kmp-migration)。

## 创建 KMP 库

如果你决定通过使用多平台库来创建共享代码的应用，请查看以下文档页面：

* [基础库教程](create-kotlin-multiplatform-library.md)
* [KMP 库的发布配置](multiplatform-publish-lib-setup.md)
* 关于将构建工件发布到 [Maven Central](multiplatform-publish-libraries-to-maven.md) 和 [npm](multiplatform-publish-libraries-to-npm.md) 的教程

## 发布构建工件

* 阅读[关于发布 KMP 应用的通用文章](multiplatform-publish-apps.md)。
* 不要忘记 Apple App Store 要求的[隐私清单](multiplatform-privacy-manifest.md)。

## 学习资源目录

所有提到的资源，以及更深入的指南和第三方内容，都编目在[学习资源](kmp-learning-resources.md)页面中。