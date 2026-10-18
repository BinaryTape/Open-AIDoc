[//]: # (title: Kotlin Multiplatform IDE 插件发布版本)

[Kotlin Multiplatform IDE 插件](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)可帮助您开发面向 Android、iOS、桌面和 Web 的跨平台应用程序。
请确保您使用的是该插件的最新版本，以便顺利开发 Kotlin Multiplatform 项目。

该插件与 IntelliJ IDEA 和 Android Studio 兼容：
* IntelliJ IDEA 从 2025.1.1.1 版本开始在 macOS 上支持该插件，从 2025.2.2 版本开始在 Windows 和 Linux 上提供支持。
* Android Studio 从 Narwhal 2025.1.1 版本开始在 macOS 上支持该插件，从 Otter 2025.2.1 版本开始在 Windows 和 Linux 上提供支持。

有关 Kotlin Multiplatform Gradle 插件的信息，请参阅其 [DSL 参考](multiplatform-dsl-reference.md)与[兼容性指南](multiplatform-compatibility-guide.md)。

## 更新到最新版本 {id="update-to-the-latest-release"}

当有可用的新 Kotlin Multiplatform 插件发布版本时，您的 IDE 会提示进行更新。
如果您接受建议，该插件将更新到最新版本。
您可以在 **Settings | Plugins** 中检查插件版本并手动进行更新。

Kotlin Multiplatform IDE 插件会随每个 IntelliJ IDEA 和 Android Studio 版本一同更新，并且其主版本号与对应的 IDE 版本保持一致。

以下是在相关工具链稳定之前发布的各主要版本的详细信息。

## 历史版本详情 {collapsible="true" id="previous-release-details"}

下表列出了 Kotlin Multiplatform IDE 插件的历史发布版本：

<table> 

<tr>
<th>
版本信息
</th>
<th>
版本亮点
</th>
<th>
兼容的 Kotlin 版本
</th>
</tr>

<tr id="0.9">
<td>

**0.9**

发布日期：2025 年 5 月 19 日

</td>
<td>

Kotlin Multiplatform 插件经过了彻底重构：

* 针对受支持的 IDE 集成了 **New Project** 向导。
* 提供预检环境检查，帮助查找并解决配置问题，包括 Java、Android、Xcode 和 Gradle。
* 为所有受支持的平台自动生成运行配置，并提供 iOS 和 Android 设备选择器。
* 跨语言支持：支持 Swift 与 Kotlin 之间的跨语言导航与调试，以及 Swift 语法高亮显示和快速文档。
* Compose Multiplatform 支持：Kotlin Multiplatform IDE 插件现已支持 Compose Multiplatform 资源、自动补全以及针对通用代码的 UI 预览（[之前的 Compose Multiplatform 插件](https://plugins.jetbrains.com/plugin/16541-compose-multiplatform-ide-support)可以安全卸载）。
* Compose 热重载（Hot Reload）：无需重启应用程序即可即时查看 UI 更改（适用于桌面 JVM 目标）。有关更多信息，请参阅 [Hot Reload 文档](compose-hot-reload.md)。

已知问题：

* 在 Android Studio 中，Compose 调试器目前无法与 Kotlin 2.1.20 和 2.1.21 配合使用。
    该问题将在 Kotlin 2.2.0-RC2 中修复。

</td>
<td>

该插件可与[任意 Kotlin 版本](https://kotlinlang.org/docs/releases.html#release-details)配合使用，但其大部分功能依赖于 Kotlin 2.1.21。
更新到最新的稳定 Kotlin 版本可确保获得最佳体验。

此版本还需要启用 K2 模式，因此请确保已将其启用：
在 **Settings** | **Languages & Frameworks** | **Kotlin** 中，勾选 **Enable K2 mode**。

</td>
</tr>

<tr>
<td>

**0.8.4**

发布日期：2024 年 12 月 6 日

</td>
<td>

* 支持 Kotlin 的 [K2 模式](https://kotlinlang.org/docs/k2-compiler-migration-guide.html#support-in-ides)，以提升稳定性和代码分析能力。

</td>
<td>

[任意 Kotlin 插件版本](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.8.3**

发布日期：2024 年 7 月 23 日

</td>
<td>

* 修复了 Xcode 兼容性问题。

</td>
<td>

[任意 Kotlin 插件版本](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.8.2**

发布日期：2024 年 5 月 16 日

</td>
<td>

* 支持 Android Studio Jellyfish 以及新的 Canary 版本 Koala。
* 在 shared 模块中添加了 `sourceCompatibility` 和 `targetCompatibility` 声明。

</td>
<td>

[任意 Kotlin 插件版本](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.8.1**

发布日期：2023 年 11 月 9 日

</td>
<td>

* 将 Kotlin 更新至 1.9.20。
* 将 Jetpack Compose 更新至 1.5.4。
* 默认启用 Gradle 构建缓存和配置缓存。
* 针对新的 Kotlin 版本重构了构建配置。
* iOS framework 现在默认采用静态框架。
* 修复了在使用 Xcode 15 的 iOS 设备上运行的问题。

</td>
<td>

[任意 Kotlin 插件版本](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.8.0**

发布日期：2023 年 10 月 5 日

</td>
<td>

* [KT-60169](https://youtrack.jetbrains.com/issue/KT-60169) 迁移至 Gradle 版本目录（version catalog）。
* [KT-59269](https://youtrack.jetbrains.com/issue/KT-59269) 将 `android` 重命名为 `androidTarget`。
* [KT-59269](https://youtrack.jetbrains.com/issue/KT-59269) 更新了 Kotlin 和依赖项版本。
* [KTIJ-26773](https://youtrack.jetbrains.com/issue/KTIJ-26773) 重构为使用 `-destination` 实参代替 `-sdk` 和 `-arch`。
* [KTIJ-25839](https://youtrack.jetbrains.com/issue/KTIJ-25839) 重构了生成的文件名。
* [KTIJ-27058](https://youtrack.jetbrains.com/issue/KTIJ-27058) 添加了 JVM 目标配置。
* [KTIJ-27160](https://youtrack.jetbrains.com/issue/KTIJ-27160) 支持 Xcode 15.0。
* [KTIJ-27158](https://youtrack.jetbrains.com/issue/KTIJ-27158) 将新建模块向导移至实验性状态。

</td>
<td>

[任意 Kotlin 插件版本](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.6.0**

发布日期：2023 年 5 月 24 日

</td>
<td>

* 支持新的 Canary 版 Android Studio Hedgehog。
* 更新了 Multiplatform 项目中的 Kotlin、Gradle 及各库的版本。
* 在 Multiplatform 项目中应用了全新的 [`targetHierarchy.default()`](https://kotlinlang.org/docs/whatsnew1820.html#new-approach-to-source-set-hierarchy)。
* 在 Multiplatform 项目中为平台特定文件应用了源集名称后缀。

</td>
<td>

[任意 Kotlin 插件版本](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.5.3**

发布日期：2023 年 4 月 12 日

</td>
<td>

* 更新了 Kotlin 和 Compose 版本。
* 修复了 Xcode 项目 scheme 解析问题。
* 添加了 scheme 产品类型检查。
* 如果存在 `iosApp` scheme，现在默认将其选中。

</td>
<td>

[任意 Kotlin 插件版本](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.5.2**

发布日期：2023 年 1 月 30 日

</td>
<td>

* [修复了 Kotlin/Native 调试器的问题（Spotlight 索引缓慢）](https://youtrack.jetbrains.com/issue/KT-55988)。
* [修复了多模块项目中的 Kotlin/Native 调试器问题](https://youtrack.jetbrains.com/issue/KT-24450)。
* [针对 Android Studio Giraffe 2022.3.1 Canary 的新构建](https://youtrack.jetbrains.com/issue/KT-55274)。
* [为 iOS 应用程序构建添加了签名配置（provisioning）标志](https://youtrack.jetbrains.com/issue/KT-55204)。
* [在生成的 iOS 项目中的 **Framework Search Paths** 选项中添加了继承路径](https://youtrack.jetbrains.com/issue/KT-55402)。

</td>
<td>

[任意 Kotlin 插件版本](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.5.1**

发布日期：2022 年 11 月 30 日

</td>
<td>

* [修复了新项目生成问题：删除了多余的 "app" 目录](https://youtrack.jetbrains.com/issue/KTIJ-23790)。

</td>
<td>

[Kotlin 1.7.0—*](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.5.0**

发布日期：2022 年 11 月 22 日

</td>
<td>

* [更改了 iOS 框架分发的默认选项：现为 **Regular framework**](https://youtrack.jetbrains.com/issue/KT-54086)。
* [在生成的 Android 项目中将 `MyApplicationTheme` 移至单独的文件](https://youtrack.jetbrains.com/issue/KT-53991)。
* [更新了生成的 Android 项目](https://youtrack.jetbrains.com/issue/KT-54658)。
* [修复了新项目目录意外被清空的问题](https://youtrack.jetbrains.com/issue/KTIJ-23707)。

</td>
<td>

[Kotlin 1.7.0—*](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.3.4**

发布日期：2022 年 9 月 12 日

</td>
<td>

* [将 Android 应用程序迁移到 Jetpack Compose](https://youtrack.jetbrains.com/issue/KT-53162)。
* [移除了过时的 HMPP 标志](https://youtrack.jetbrains.com/issue/KT-52248)。
* [从 Android 清单文件中移除了软件包名称](https://youtrack.jetbrains.com/issue/KTIJ-22633)。
* [更新了 Xcode 项目的 `.gitignore`](https://youtrack.jetbrains.com/issue/KT-53703)。
* [更新了向导项目以更好地展示 expect/actual](https://youtrack.jetbrains.com/issue/KT-53928)。
* [更新了与 Android Studio Canary 版本的兼容性](https://youtrack.jetbrains.com/issue/KTIJ-22063)。
* [将 Android 应用程序的最低 Android SDK 版本更新为 21](https://youtrack.jetbrains.com/issue/KTIJ-22505)。
* [修复了安装 Xcode 后首次启动时出现的问题](https://youtrack.jetbrains.com/issue/KTIJ-22645)。
* [修复了 M1 上 Apple 运行配置的问题](https://youtrack.jetbrains.com/issue/KTIJ-21781)。
* [修复了 Windows 操作系统上 `local.properties` 的问题](https://youtrack.jetbrains.com/issue/KTIJ-22037)。
* [修复了 Android Studio Canary 版本上 Kotlin/Native 调试器的问题](https://youtrack.jetbrains.com/issue/KT-53976)。

</td>
<td>

[Kotlin 1.7.0—1.7.*](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.3.3**

发布日期：2022 年 6 月 9 日

</td>
<td>

* 更新了对 Kotlin IDE 插件 1.7.0 的依赖项。

</td>
<td>

[Kotlin 1.7.0—1.7.*](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.3.2**

发布日期：2022 年 4 月 4 日

</td>
<td>

* 修复了在 Android Studio 2021.2 和 2021.3 上调试 iOS 应用程序时的性能问题。

</td>
<td>

[Kotlin 1.5.0—1.6.*](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.3.1**

发布日期：2022 年 2 月 15 日

</td>
<td>

* [在 Kotlin Multiplatform Mobile 向导中启用了 M1 iOS 模拟器](https://youtrack.jetbrains.com/issue/KT-51105)。
* 提升了索引 XcProjects 时的性能：[KT-49777](https://youtrack.jetbrains.com/issue/KT-49777)、[KT-50779](https://youtrack.jetbrains.com/issue/KT-50779)。
* 构建脚本清理：使用 `kotlin("test")` 代替 `kotlin("test-common")` 和 `kotlin("test-annotations-common")`。
* 扩大了与 [Kotlin 插件版本](https://youtrack.jetbrains.com/issue/KTIJ-20167)的兼容范围。
* [修复了 Windows 主机上的 JVM 调试问题](https://youtrack.jetbrains.com/issue/KT-50699)。
* [修复了禁用插件后版本无效的问题](https://youtrack.jetbrains.com/issue/KT-50966)。

</td>
<td>

[Kotlin 1.5.0—1.6.*](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.3.0**

发布日期：2021 年 11 月 16 日

</td>
<td>

* [新增 Kotlin Multiplatform Library 向导](https://youtrack.jetbrains.com/issue/KTIJ-19367)。
* 支持新型 Kotlin Multiplatform 库分发方式：[XCFramework](multiplatform-build-native-binaries.md#build-xcframeworks)。
* 为新的跨平台移动项目启用了[分层项目结构](multiplatform-hierarchy.md#manual-configuration)。
* 支持[显式声明 iOS 目标](https://youtrack.jetbrains.com/issue/KT-46861)。
* [在非 Mac 计算机上启用了 Kotlin Multiplatform Mobile 插件向导](https://youtrack.jetbrains.com/issue/KT-48614)。
* [在 Kotlin Multiplatform 模块向导中支持子文件夹](https://youtrack.jetbrains.com/issue/KT-47923)。
* [支持 Xcode `Assets.xcassets` 文件](https://youtrack.jetbrains.com/issue/KT-49571)。
* [修复了插件类加载器异常](https://youtrack.jetbrains.com/issue/KT-48103)。
* 更新了 CocoaPods Gradle 插件模板。
* 改进了 Kotlin/Native 调试器的类型求值。
* 修复了使用 Xcode 13 启动 iOS 设备的问题。

</td>
<td>

[Kotlin 1.6.0](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.2.7**

发布日期：2021 年 8 月 2 日

</td>
<td>

* [为 AppleRunConfiguration 添加了 Xcode 配置选项](https://youtrack.jetbrains.com/issue/KTIJ-19054)。
* [添加了对 Apple M1 模拟器的支持](https://youtrack.jetbrains.com/issue/KT-47618)。
* [在项目向导中添加了有关 Xcode 集成选项的信息](https://youtrack.jetbrains.com/issue/KT-47466)。
* [添加了在生成包含 CocoaPods 的项目但未安装 CocoaPods gem 时的错误通知](https://youtrack.jetbrains.com/issue/KT-47329)。
* [在使用 Kotlin 1.5.30 生成的 shared 模块中添加了对 Apple M1 模拟器目标的支持](https://youtrack.jetbrains.com/issue/KT-47631)。
* [清理了使用 Kotlin 1.5.20 生成的 Xcode 项目](https://youtrack.jetbrains.com/issue/KT-47465)。
* 修复了在真实 iOS 设备上启动 Xcode Release 配置的问题。
* 修复了使用 Xcode 12.5 启动模拟器的问题。

</td>
<td>

[Kotlin 1.5.10](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.2.6**

发布日期：2021 年 6 月 10 日

</td>
<td>

* 兼容 Android Studio Bumblebee Canary 1。
* 支持 [Kotlin 1.5.20](https://kotlinlang.org/docs/whatsnew1520.html)：在项目向导中为 Kotlin/Native 使用新的 framework 打包任务。

</td>
<td>

[Kotlin 1.5.10](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.2.5**

发布日期：2021 年 5 月 25 日

</td>
<td>

* [修复了与 Android Studio Arctic Fox 2020.3.1 Beta 1 及更高版本的兼容性](https://youtrack.jetbrains.com/issue/KT-46834)。

</td>
<td>

[Kotlin 1.5.10](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.2.4**

发布日期：2021 年 5 月 5 日

</td>
<td>

请在 Android Studio 4.2 或 Android Studio 2020.3.1 Canary 8 及更高版本中使用此版本的插件。
* 兼容 [Kotlin 1.5.0](https://kotlinlang.org/docs/whatsnew15.html)。
* [能够在 Kotlin Multiplatform 模块中使用 CocoaPods 依赖管理器进行 iOS 集成](https://youtrack.jetbrains.com/issue/KT-45946)。

</td>
<td>

[Kotlin 1.5.0](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.2.3**

发布日期：2021 年 4 月 5 日

</td>
<td>

* [项目向导：改进模块命名](https://youtrack.jetbrains.com/issues?q=issue%20id:%20KT-43449,%20KT-44060,%20KT-41520,%20KT-45282)。
* [能够在项目向导中使用 CocoaPods 依赖管理器进行 iOS 集成](https://youtrack.jetbrains.com/issue/KT-45478)。
* [提升了新项目中 gradle.properties 的可读性](https://youtrack.jetbrains.com/issue/KT-42908)。
* [若取消勾选 "Add sample tests for Shared Module"，将不再生成示例测试](https://youtrack.jetbrains.com/issue/KT-43441)。
* [错误修复及其他改进](https://youtrack.jetbrains.com/issues?q=Subsystems:%20%7BKMM%20Plugin%7D%20Type:%20Feature,%20Bug%20State:%20-Obsolete,%20-%7BAs%20designed%7D,%20-Answered,%20-Incomplete%20resolved%20date:%202021-03-10%20..%202021-03-25)。

</td>
<td>

[Kotlin 1.4.30](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.2.2**

发布日期：2021 年 3 月 3 日

</td>
<td>

* [能够在 Xcode 中打开与 Xcode 相关的文件](https://youtrack.jetbrains.com/issue/KT-44970)。
* [能够在 iOS 运行配置中设置 Xcode 项目文件的位置](https://youtrack.jetbrains.com/issue/KT-44968)。
* [支持 Android Studio 2020.3.1 Canary 8](https://youtrack.jetbrains.com/issue/KT-45162)。
* [错误修复及其他改进](https://youtrack.jetbrains.com/issues?q=tag:%20KMM-0.2.2%20)。

</td>
<td>

[Kotlin 1.4.30](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.2.1**

发布日期：2021 年 2 月 15 日

</td>
<td>

请在 Android Studio 4.2 中使用此版本的插件。
* 基础架构改进。
* [错误修复及其他改进](https://youtrack.jetbrains.com/issues?q=tag:%20KMM-0.2.1%20)。

</td>
<td>

[Kotlin 1.4.30](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.2.0**

发布日期：2020 年 11 月 23 日

</td>
<td>

* [支持 iPad 设备](https://youtrack.jetbrains.com/issue/KT-41932)。
* [支持在 Xcode 中配置的自定义 scheme 名称](https://youtrack.jetbrains.com/issue/KT-41677)。
* [能够为 iOS 运行配置添加自定义构建步骤](https://youtrack.jetbrains.com/issue/KT-41678)。
* [能够调试自定义的 Kotlin/Native 二进制文件](https://youtrack.jetbrains.com/issue/KT-40954)。
* [简化了 Kotlin Multiplatform Mobile 向导生成的代码](https://youtrack.jetbrains.com/issue/KT-41712)。
* [移除了对 Kotlin Android Extensions 插件的支持](https://youtrack.jetbrains.com/issue/KT-42121)（该插件在 Kotlin 1.4.20 中已弃用）。
* [修复了断开与主机的连接后保存物理设备配置的问题](https://youtrack.jetbrains.com/issue/KT-42390)。
* 其他修复与改进。

</td>
<td>

[Kotlin 1.4.20](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.1.3**

发布日期：2020 年 10 月 2 日

</td>
<td>

* 添加了对 iOS 14 和 Xcode 12 的兼容性。
* 修复了 Kotlin Multiplatform Mobile 向导创建的平台测试中的命名问题。

</td>
<td>

* [Kotlin 1.4.10](https://kotlinlang.org/docs/releases.html#release-details)
* [Kotlin 1.4.20](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.1.2**

发布日期：2020 年 9 月 29 日

</td>
<td>

 * 修复了与 [Kotlin 1.4.20-M1](https://kotlinlang.org/docs/eap.html#build-details) 的兼容性。
 * 默认启用向 JetBrains 发送错误报告。

</td>
<td>

* [Kotlin 1.4.10](https://kotlinlang.org/docs/releases.html#release-details)
* [Kotlin 1.4.20](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.1.1**

发布日期：2020 年 9 月 10 日

</td>
<td>

* 修复了与 Android Studio Canary 8 及更高版本的兼容性。

</td>
<td>

* [Kotlin 1.4.10](https://kotlinlang.org/docs/releases.html#release-details)
* [Kotlin 1.4.20](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

<tr>
<td>

**0.1.0**

发布日期：2020 年 8 月 31 日

</td>
<td>

* Kotlin Multiplatform Mobile 插件的首个版本。详情请参阅[博客文章](https://blog.jetbrains.com/kotlin/2020/08/kotlin-multiplatform-mobile-goes-alpha/)。

</td>
<td>

* [Kotlin 1.4.0](https://kotlinlang.org/docs/releases.html#release-details)
* [Kotlin 1.4.10](https://kotlinlang.org/docs/releases.html#release-details)

</td>
</tr>

</table>