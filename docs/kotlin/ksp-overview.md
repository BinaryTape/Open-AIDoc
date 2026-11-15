[//]: # (title: Kotlin Symbol Processing API)

Kotlin Symbol Processing (KSP) 是适用于 Kotlin 的源代码生成框架。借助 KSP API，你可以创建用于检查源代码静态信息并据此生成新代码的处理器。最常见的用例是基于[注解](annotations.md)生成代码。

KSP 旨在简化轻量级编译器插件的创建。使用 KSP 构建的编译器插件称为符号处理器，简称处理器。KSP 定义良好的 API 隐藏了编译器的变更，因此你无需花费太多精力来维护处理器。然而，这种做法也伴随着权衡。例如，基于 KSP 的处理器无法检查表达式或语句，也无法修改源代码。

基于 KSP 的插件的典型用例包括： 
* SQL 注入 ([Dagger](https://dagger.dev/dev-guide/ksp))
* 序列化 ([Moshi](https://github.com/square/moshi))
* 数据库管理 ([Room](https://developer.android.com/jetpack/androidx/releases/room#2.3.0-beta02))

要了解如何创建你的第一个基于 KSP 的处理器，请参阅 [KSP 入门指南](ksp-quickstart.md)。

## 要求 {id="requirements"}

最新版本的 KSP（%kspVersion%）支持以下依赖项版本：

| 依赖项 | 最低与最高版本 |
|-----------------------------|------------------------------------------------------|
| Kotlin Gradle plugin (KGP)  | 2.3.20–2.4.x                                         |
| Android Gradle Plugin (AGP) | 8.13.0 或更高版本 |
| Gradle                      | 8.13 或更高版本。对于 AGP 9.0 或更高版本，请使用 Gradle 9.x。 |
| JDK                         | 17 或更高版本 |

## KSP 在编译期间的工作原理 {id="how-ksp-works-during-compilation"}

KSP 基于 [Kotlin 语法](https://kotlinlang.org/grammar/)将 Kotlin 源代码表示为符号的层次结构。处理器使用这些符号来检查声明，例如类、函数、属性和类型。

> KSP 对声明和类型信息进行建模，但不允许处理器访问表达式或函数体。
{style="note"}

KSP 融入编译过程的方式如下：

1. KSP 处理器分析源代码和资源。

2. 处理器生成源文件或其他输出。

3. Kotlin 编译器将原始源代码与生成的代码一起编译。

要详细了解 KSP，请观看此视频：

<video src="https://www.youtube.com/v/bv-VyGM3HCY" title="Kotlin Symbol Processing (KSP)"/>

## KSP 如何运行处理器 {id="how-ksp-runs-a-processor"}

KSP 使用 `SymbolProcessorProvider` 的实现作为创建 `SymbolProcessor` 实例的入口点：

```kotlin
interface SymbolProcessorProvider {
    fun create(environment: SymbolProcessorEnvironment): SymbolProcessor
}
```

`SymbolProcessor` 接口包含处理逻辑。KSP 调用 `process()` 函数并提供一个 `Resolver`，处理器使用它来访问源代码中的符号：

```kotlin
interface SymbolProcessor {
    fun process(resolver: Resolver): List<KSAnnotated>
    fun finish() {}
    fun onError() {}
}
```

有关如何实现和注册处理器的分步指南，请参阅 [KSP 入门指南](ksp-quickstart.md)。

## 支持的库 {id="supported-libraries"}

此表格列出了 Android 上的常用库及其对 KSP 的各个支持阶段：

| 库 | 状态 |
|------------------|---------------------------------------------------------------------------------------------------|
| Room             | [官方支持](https://developer.android.com/jetpack/androidx/releases/room#2.3.0-beta02) |
| Moshi            | [官方支持](https://github.com/square/moshi/) |
| RxHttp           | [官方支持](https://github.com/liujingxing/rxhttp) |
| Kotshi           | [官方支持](https://github.com/ansman/kotshi) |
| Lyricist         | [官方支持](https://github.com/adrielcafe/lyricist) |
| Lich SavedState  | [官方支持](https://github.com/line/lich/tree/master/savedstate) |
| gRPC Dekorator   | [官方支持](https://github.com/mottljan/grpc-dekorator) |
| EasyAdapter      | [官方支持](https://github.com/AmrDeveloper/EasyAdapter) |
| Koin Annotations | [官方支持](https://github.com/InsertKoinIO/koin-annotations) |
| Glide            | [官方支持](https://github.com/bumptech/glide) | 
| Micronaut        | [官方支持](https://micronaut.io/2023/07/14/micronaut-framework-4-0-0-released/) |
| Epoxy            | [官方支持](https://github.com/airbnb/epoxy) |
| Paris            | [官方支持](https://github.com/airbnb/paris) |
| Auto Dagger      | [官方支持](https://github.com/ansman/auto-dagger) |
| SealedX          | [官方支持](https://github.com/skydoves/sealedx) |
| Ktorfit          | [官方支持](https://github.com/Foso/Ktorfit) |
| Mockative        | [官方支持](https://github.com/mockative/mockative) |
| Kotest           | [官方支持](https://github.com/kotest/kotest) |
| DeeplinkDispatch | [通过 airbnb/DeepLinkDispatch#323 支持](https://github.com/airbnb/DeepLinkDispatch/pull/323) |
| Dagger           | [Alpha](https://dagger.dev/dev-guide/ksp) |
| Motif            | [Alpha](https://github.com/uber/motif) |
| Hilt             | [进行中](https://dagger.dev/dev-guide/ksp) |
| Auto Factory     | [尚不支持](https://github.com/google/auto/issues/982) |

## 其他资源 {id="other-resources"}

* [KSP 入门指南](ksp-quickstart.md)
* [KSP 如何对 Kotlin 代码建模](ksp-kotlin-model.md)
* [Java 注解处理器作者参考指南](ksp-reference.md)
* [增量处理说明](ksp-incremental.md)
* [多轮处理说明](ksp-multi-round.md)
* [多平台项目中的 KSP](ksp-multiplatform.md)
* [从命令行运行 KSP](ksp-command-line.md)