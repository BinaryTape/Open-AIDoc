[//]: # (title: Kotlin 符号处理 API)

Kotlin 符号处理（KSP）是一个适用于 Kotlin 的源代码生成框架。借助 KSP API，你可以创建根据源代码中的[注解](annotations.md)生成代码的处理器。

KSP 旨在简化轻量级编译器插件的创建。其定义良好的 API 隐藏了编译器变更，因此你无需花费太多精力来维护处理器。然而，这种方法也有折衷。例如，基于 KSP 的处理器无法检查表达式或语句，也无法修改源代码。

基于 KSP 插件的典型用例包括： 
* 依赖注入 ([Dagger](https://dagger.dev/dev-guide/ksp))
* 序列化 ([Moshi](https://github.com/square/moshi))
* 数据库管理 ([Room](https://developer.android.com/jetpack/androidx/releases/room#2.3.0-beta02))

要了解如何创建你的第一个基于 KSP 的处理器，请参阅 [KSP 快速入门](ksp-quickstart.md)。

## 概述

KSP API 以符合 Kotlin 习惯的方式处理 Kotlin 程序。KSP 能够理解 Kotlin 特有的功能，例如扩展函数、声明处型变（variance）和局部函数。它还对类型进行了显式建模，并提供基本的类型检查，例如等价性和赋值兼容性。

该 API 根据 [Kotlin 语法](https://kotlinlang.org/grammar/)在符号级别对 Kotlin 程序结构进行建模。当基于 KSP 的插件处理源程序时，处理器可以访问类、类成员、函数和相关形参等构造，而 `if` 块和 `for` 循环等内容则无法访问。

从概念上讲，KSP 与 Kotlin 反射中的 [KType](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-type/) 类似。该 API 允许处理器从类声明导航到具有特定类型实参的相应类型，反之亦然。你还可以替换类型实参、指定型变、应用星投影以及标记类型的为 null 性。

另一种理解 KSP 的方式是将其视为 Kotlin 程序的预处理器框架。通过将基于 KSP 的插件视为“符号处理器”（_symbol processors_），或简称为“处理器”，编译中的数据流可以描述为以下步骤：

1. 处理器读取并分析源程序和资源。
2. 处理器生成代码或其他形式的输出。
3. Kotlin 编译器将源程序与生成的代码一起进行编译。

与成熟的编译器插件不同，处理器不能修改代码。改变语言语义的编译器插件有时会让人非常困惑。KSP 通过将源程序视为只读来避免这种情况。

你也可以通过这个视频了解 KSP 的概览：

<video src="https://www.youtube.com/v/bv-VyGM3HCY" title="Kotlin Symbol Processing (KSP)"/>

## KSP 如何看待源文件

大多数处理器会遍历输入源代码的各种程序结构。在深入了解 API 的用法之前，让我们看看从 KSP 的角度来看，一个文件可能是怎样的：

```text
KSFile
  packageName: KSName
  fileName: String
  annotations: List<KSAnnotation>  (文件注解)
  declarations: List<KSDeclaration>
    KSClassDeclaration // 类、接口、对象
      simpleName: KSName
      qualifiedName: KSName
      containingFile: String
      typeParameters: KSTypeParameter
      parentDeclaration: KSDeclaration
      classKind: ClassKind
      primaryConstructor: KSFunctionDeclaration
      superTypes: List<KSTypeReference>
      // 包含内部类、成员函数、属性等。
      declarations: List<KSDeclaration>
    KSFunctionDeclaration // 顶级函数
      simpleName: KSName
      qualifiedName: KSName
      containingFile: String
      typeParameters: KSTypeParameter
      parentDeclaration: KSDeclaration
      functionKind: FunctionKind
      extensionReceiver: KSTypeReference?
      returnType: KSTypeReference
      parameters: List<KSValueParameter>
      // 包含局部类、局部函数、局部变量等。
      declarations: List<KSDeclaration>
    KSPropertyDeclaration // 全局变量
      simpleName: KSName
      qualifiedName: KSName
      containingFile: String
      typeParameters: KSTypeParameter
      parentDeclaration: KSDeclaration
      extensionReceiver: KSTypeReference?
      type: KSTypeReference
      getter: KSPropertyGetter
        returnType: KSTypeReference
      setter: KSPropertySetter
        parameter: KSValueParameter
```

此视图列出了文件中声明的常见内容：类、函数、属性等等。

## SymbolProcessorProvider：入口点

KSP 需要 `SymbolProcessorProvider` 接口的一个实现来实例化 `SymbolProcessor`：

```kotlin
interface SymbolProcessorProvider {
    fun create(environment: SymbolProcessorEnvironment): SymbolProcessor
}
```

而 `SymbolProcessor` 的定义如下：

```kotlin
interface SymbolProcessor {
    fun process(resolver: Resolver): List<KSAnnotated> // 让我们关注这里
    fun finish() {}
    fun onError() {}
}
```

`Resolver` 为 `SymbolProcessor` 提供了访问符号等编译器详情的能力。一个查找所有顶级函数和顶级类中非局部函数的处理器可能如下所示：

```kotlin
class HelloFunctionFinderProcessor : SymbolProcessor() {
    // ...
    val functions = mutableListOf<KSFunctionDeclaration>()
    val visitor = FindFunctionsVisitor()

    override fun process(resolver: Resolver) {
        resolver.getAllFiles().forEach { it.accept(visitor, Unit) }
    }

    inner class FindFunctionsVisitor : KSVisitorVoid() {
        override fun visitClassDeclaration(classDeclaration: KSClassDeclaration, data: Unit) {
            classDeclaration.getDeclaredFunctions().forEach { it.accept(this, Unit) }
        }

        override fun visitFunctionDeclaration(function: KSFunctionDeclaration, data: Unit) {
            functions.add(function)
        }

        override fun visitFile(file: KSFile, data: Unit) {
            file.declarations.forEach { it.accept(this, Unit) }
        }
    }
    // ...
    
    class Provider : SymbolProcessorProvider {
        override fun create(environment: SymbolProcessorEnvironment): SymbolProcessor = TODO()
    }
}
```

## 资源

* [快速入门](ksp-quickstart.md)
* [为什么使用 KSP？](ksp-why-ksp.md)
* [示例](ksp-examples.md)
* [KSP 如何对 Kotlin 代码建模](ksp-additional-details.md)
* [Java 注解处理器作者参考](ksp-reference.md)
* [增量处理说明](ksp-incremental.md)
* [多轮处理说明](ksp-multi-round.md)
* [多平台项目中的 KSP](ksp-multiplatform.md)
* [从命令行运行 KSP](ksp-command-line.md)
* [常见问题解答](ksp-faq.md)

## 支持的库

下表列出了 Android 上的流行库及其对 KSP 的各种支持阶段：

| 库 | 状态 |
|------------------|---------------------------------------------------------------------------------------------------|
| Room             | [官方支持](https://developer.android.com/jetpack/androidx/releases/room#2.3.0-beta02) |
| Moshi            | [官方支持](https://github.com/square/moshi/)                                          |
| RxHttp           | [官方支持](https://github.com/liujingxing/rxhttp)                                     |
| Kotshi           | [官方支持](https://github.com/ansman/kotshi)                                          |
| Lyricist         | [官方支持](https://github.com/adrielcafe/lyricist)                                    |
| Lich SavedState  | [官方支持](https://github.com/line/lich/tree/master/savedstate)                       |
| gRPC Dekorator   | [官方支持](https://github.com/mottljan/grpc-dekorator)                                |
| EasyAdapter      | [官方支持](https://github.com/AmrDeveloper/EasyAdapter)                               |
| Koin Annotations | [官方支持](https://github.com/InsertKoinIO/koin-annotations)                          |
| Glide            | [官方支持](https://github.com/bumptech/glide)                                         | 
| Micronaut        | [官方支持](https://micronaut.io/2023/07/14/micronaut-framework-4-0-0-released/)       |
| Epoxy            | [官方支持](https://github.com/airbnb/epoxy)                                           |
| Paris            | [官方支持](https://github.com/airbnb/paris)                                           |
| Auto Dagger      | [官方支持](https://github.com/ansman/auto-dagger)                                     |
| SealedX          | [官方支持](https://github.com/skydoves/sealedx)                                       |
| Ktorfit          | [官方支持](https://github.com/Foso/Ktorfit)                                           |
| Mockative        | [官方支持](https://github.com/mockative/mockative)                                    |
| Kotest           | [官方支持](https://github.com/kotest/kotest)                                          |
| DeeplinkDispatch | [通过 airbnb/DeepLinkDispatch#323 支持](https://github.com/airbnb/DeepLinkDispatch/pull/323)  |
| Dagger           | [Alpha](https://dagger.dev/dev-guide/ksp)                                                         |
| Motif            | [Alpha](https://github.com/uber/motif)                                                            |
| Hilt             | [进行中](https://dagger.dev/dev-guide/ksp)                                                   |
| Auto Factory     | [尚未支持](https://github.com/google/auto/issues/982)                                    |