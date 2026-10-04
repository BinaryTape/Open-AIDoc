[//]: # (title: 在平台之间共享代码)

借助 Kotlin Multiplatform，你可以使用 Kotlin 提供的机制来共享代码： 
 
* [在项目中使用的所有平台之间共享代码](#share-code-on-all-platforms)。用于共享适用于所有平台的通用业务逻辑。     
* [在包含在项目中但并非全部的部分平台之间共享代码](#share-code-on-similar-platforms)。你可以借助层次结构在相似平台中复用代码。

如果你需要从共享代码访问特定于平台的 API，请使用 Kotlin 的[预期声明与实际声明 (expected and actual declarations)](multiplatform-expect-actual.md) 机制。

## 在所有平台上共享代码 {id="share-code-on-all-platforms"}

如果你有适用于所有平台的通用业务逻辑，则无需为每个平台编写相同的代码——只需在 common 源集中共享即可。

![在所有平台上共享代码](flat-structure.svg)

源集的某些依赖项是默认设置的。你无需手动指定任何 `dependsOn` 关系：
* 适用于依赖 common 源集的所有特定于平台的源集，例如 `jvmMain`、`macosArm64Main` 等。 
* 适用于特定目标的 `main` 和 `test` 源集之间，例如 `androidMain` 和 `androidUnitTest`。

如果你需要从共享代码访问特定于平台的 API，请使用 Kotlin 的[预期声明与实际声明](multiplatform-expect-actual.md)机制。

## 在相似平台上共享代码 {id="share-code-on-similar-platforms"}

你通常需要创建多个原生目标，这些目标可能会复用大量通用逻辑和第三方 API。

例如，在一个针对 iOS 的典型多平台项目中，有两个与 iOS 相关的目标：一个是 iOS ARM64 设备，另一个是 x64 模拟器。它们拥有独立的特定于平台的源集，但在实践中，极少需要为设备和模拟器编写不同的代码，并且它们的依赖项也基本相同。因此，特定于 iOS 的代码可以在它们之间共享。

显然，在这种配置下，为这两个 iOS 目标设立一个共享源集是理想的选择，其中的 Kotlin/Native 代码仍然可以直接调用 iOS 设备和模拟器通用的任何 API。

在这种情况下，你可以通过以下方式之一，利用[层次结构](multiplatform-hierarchy.md)在项目中的原生目标之间共享代码：

* [使用默认层次结构模板](multiplatform-hierarchy.md#default-hierarchy-template)
* [手动配置层次结构](multiplatform-hierarchy.md#manual-configuration)

详细了解[在库中共享代码](#share-code-in-libraries)和[连接特定于平台的库](#connect-platform-specific-libraries)。

## 在库中共享代码 {id="share-code-in-libraries"}

得益于层次化的项目结构，库也可以为目标的子集提供通用 API。当[发布库](multiplatform-publish-lib-setup.md)时，其中间源集的 API 会与项目结构信息一起嵌入到库工件中。当你使用该库时，项目的中间源集只能访问该库中对每个源集的目标可用的那些 API。

例如，查看来自 `kotlinx.coroutines` 仓库的以下源集层次结构：

![库层次结构](lib-hierarchical-structure.svg)

`concurrent` 源集声明了函数 `runBlocking`，并针对 JVM 和原生目标进行编译。一旦 `kotlinx.coroutines` 库更新并采用层次化项目结构发布，你就可以依赖它，并在 JVM 和原生目标之间共享的源集中调用 `runBlocking`，因为它与该库 `concurrent` 源集的“目标签名”相匹配。

## 连接特定于平台的库 {id="connect-platform-specific-libraries"}

为了共享更多原生代码而不受特定于平台的依赖项限制，请使用诸如 Foundation、UIKit 和 POSIX 等[平台库](https://kotlinlang.org/docs/native-platform-libs.html)。这些库随 Kotlin/Native 一起提供，并默认在共享源集中可用。

此外，如果你在项目中使用 [Kotlin CocoaPods Gradle](multiplatform-cocoapods-overview.md) 插件，还可以使用通过 [`cinterop` 机制](https://kotlinlang.org/docs/native-c-interop.html)引入的第三方原生库。

## 后续步骤 {id="what-s-next"}

* [阅读有关 Kotlin 预期声明与实际声明机制的内容](multiplatform-expect-actual.md)
* [详细了解层次化项目结构](multiplatform-hierarchy.md)
* [配置多平台库的发布](multiplatform-publish-lib-setup.md)
* [查看我们在多平台项目中命名源文件的建议](https://kotlinlang.org/docs/coding-conventions.html#source-file-names)