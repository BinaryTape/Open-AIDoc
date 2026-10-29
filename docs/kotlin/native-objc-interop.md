[//]: # (title: 与 Swift/Objective-C 的互操作性)

> Objective-C 库的导入处于 [Beta](native-lib-import-stability.md#stability-of-c-and-objective-c-library-import) 阶段。
> 由 cinterop 工具从 Objective-C 库生成的所有 Kotlin 声明都应带有 `@ExperimentalForeignApi` 注解。
>
> 随 Kotlin/Native 附带的原生平台库（如 Foundation、UIKit 和 POSIX）仅对某些 API 要求启用（opt-in）。
>
{style="note"}

Kotlin/Native 通过 Objective-C 提供与 Swift 的间接互操作性。本文档涵盖了如何在 Swift/Objective-C 代码中使用 Kotlin 声明，以及如何在 Kotlin 代码中使用 Objective-C 声明。

你可能还会发现以下资源很有用：

* [Kotlin-Swift interopedia](https://github.com/kotlin-hands-on/kotlin-swift-interopedia)：关于如何在 Swift 代码中使用 Kotlin 声明的示例集合。
* [与 Swift/Objective-C ARC 的集成](native-arc-integration.md)部分：涵盖了 Kotlin 的跟踪式垃圾回收（GC）与 Objective-C 的 ARC 之间集成的详细信息。

## 将 Swift/Objective-C 库导入 Kotlin {id="importing-swift-objective-c-libraries-to-kotlin"}

如果将 Objective-C 框架和库正确导入到构建中（默认导入系统框架），则可以在 Kotlin 代码中使用它们。更多详情请参阅：

* [创建并配置库定义文件](native-definition-file.md)
* [为原生库配置编译](https://kotlinlang.org/docs/multiplatform/multiplatform-configure-compilations.html#configure-interop-with-native-languages)

如果 Swift 库的 API 使用 `@objc` 导出到 Objective-C，则可以在 Kotlin 代码中使用该库。目前尚不支持纯 Swift 模块。

## 在 Swift/Objective-C 中使用 Kotlin {id="using-kotlin-in-swift-objective-c"}

如果将 Kotlin 模块编译为框架，则可以在 Swift/Objective-C 代码中使用它们：

* 请参阅[构建最终原生二进制文件](https://kotlinlang.org/docs/multiplatform/multiplatform-build-native-binaries.html#declare-binaries)了解如何声明二进制文件。
* 查看 [Kotlin Multiplatform 示例项目](https://github.com/Kotlin/kmm-basic-sample)以获取示例。

### 对 Objective-C 和 Swift 隐藏 Kotlin 声明 {id="hide-kotlin-declarations-from-objective-c-and-swift"}

<primary-label ref="experimental-opt-in"/>

为了使你的 Kotlin 代码对 Swift/Objective-C 更友好，请使用 `@HiddenFromObjC` 注解对 Objective-C 和 Swift 隐藏 Kotlin 声明。它会禁用将函数或属性导出到 Objective-C。

或者，你可以使用 `internal` 修饰符标记 Kotlin 声明，以限制其在编译模块中的可见性。如果你希望对 Objective-C 和 Swift 隐藏 Kotlin 声明，同时保持其对其他 Kotlin 模块可见，请使用 `@HiddenFromObjC`。

[在 Kotlin-Swift interopedia 中查看示例](https://github.com/kotlin-hands-on/kotlin-swift-interopedia/blob/main/docs/overview/HiddenFromObjC.md)。

### 在 Swift 中使用精炼（refining） {id="use-refining-in-swift"}

<primary-label ref="experimental-opt-in"/>

`@ShouldRefineInSwift` 有助于在 Swift 中用包装器替换 Kotlin 声明。该注解在生成的 Objective-C API 中将函数或属性标记为 `swift_private`。此类声明会获得 `__` 前缀，从而在 Swift 中不可见。

你仍然可以在 Swift 代码中使用这些声明来创建 Swift 友好的 API，但 Xcode 自动补全中不会建议它们。

* 有关在 Swift 中精炼 Objective-C 声明的更多信息，请参阅 [Apple 官方文档](https://developer.apple.com/documentation/swift/improving-objective-c-api-declarations-for-swift)。
* 有关如何使用 `@ShouldRefineInSwift` 注解的示例，请参阅 [Kotlin-Swift interopedia](https://github.com/kotlin-hands-on/kotlin-swift-interopedia/blob/main/docs/overview/ShouldRefineInSwift.md)。

### 更改声明名称 {id="change-declaration-names"}

<primary-label ref="experimental-opt-in"/>

要避免重命名 Kotlin 声明，请使用 `@ObjCName` 注解。它指示 Kotlin 编译器为带注解的类、接口或其他 Kotlin 实体使用自定义的 Objective-C 和 Swift 名称：

```kotlin
@ObjCName(swiftName = "MySwiftArray")
class MyKotlinArray {
    @ObjCName("index")
    fun indexOf(@ObjCName("of") element: String): Int = TODO()
}

// 使用 ObjCName 注解后的用法
let array = MySwiftArray()
let index = array.index(of: "element")
```

[在 Kotlin-Swift interopedia 中查看另一个示例](https://github.com/kotlin-hands-on/kotlin-swift-interopedia/blob/main/docs/overview/ObjCName.md)。

### 通过 KDoc 注释提供文档 {id="provide-documentation-with-kdoc-comments"}

文档对于理解任何 API 都至关重要。为共享的 Kotlin API 提供文档，可以让你就用法、注意事项等与用户进行交流。

生成 Objective-C 头文件时，Kotlin 代码中的 [KDoc](kotlin-doc.md) 注释会被翻译成相应的 Objective-C 注释。例如，以下带有 KDoc 的 Kotlin 代码：

```kotlin
/**
 * 打印参数之和。
 * 正确处理总和超出 32 位整数的情况。
 */
fun printSum(a: Int, b: Int) = println(a.toLong() + b)
```

将生成带有相应注释的 Objective-C 头文件：

```objc
/**
 * 打印参数之和。
 * 正确处理总和超出 32 位整数的情况。
 */
+ (void)printSumA:(int32_t)a b:(int32_t)b __attribute__((swift_name("printSum(a:b:)")));
```

KDoc 注释被嵌入到 klib 中，并从 klib 提取到产出的 Apple 框架中。因此，类和方法的注释会出现在自动补全中（例如在 Xcode 中）。如果你在 `.h` 文件中查看函数定义，会看到关于 `@param`、`@return` 和类似标签的注释。

已知限制：

* 依赖项文档不会被导出，除非使用 `-Xexport-kdoc` 选项进行编译。使用此编译器选项编译的库可能与其他编译器版本不兼容。
* KDoc 注释大多按原样导出，但许多 KDoc 块标签（如 `@property`）不受支持。

如有必要，你可以在 Gradle 构建文件的 `binaries {}` 块中禁用从 klib 到产出的 Apple 框架的 KDoc 注释导出：

```kotlin
// build.gradle.kts
import org.jetbrains.kotlin.gradle.ExperimentalKotlinGradlePluginApi

kotlin {
    iosArm64 {
        binaries {
            framework {
                baseName = "sdk"
                @OptIn(ExperimentalKotlinGradlePluginApi::class)
                exportKdoc.set(false)
            }
        }
    }
}
```

## 映射 {id="mappings"}

下表显示了 Kotlin 概念如何映射到 Swift/Objective-C，反之亦然。

“->”和“<-”表示映射仅为单向。

| Kotlin | Swift | Objective-C | 注意 |
|------------------------|----------------------------------|----------------------------------|------------------------------------------------------------------------------------|
| `class` | `class` | `@interface` | [注意](#classes) |
| `interface` | `protocol` | `@protocol` | |
| `constructor`/`create` | 初始值设定项 | 初始值设定项 | [注意](#initializers) |
| 属性 | 属性 | 属性 | [注意 1](#top-level-functions-and-properties), [注意 2](#setters) |
| 方法 | 方法 | 方法 | [注意 1](#top-level-functions-and-properties), [注意 2](#method-names-translation) |
| `enum class` | `class` | `@interface` | [注意](#enums) |
| `suspend` -> | `completionHandler:`/ `async` | `completionHandler:` | [注意 1](#errors-and-exceptions), [注意 2](#suspending-functions) |
| `@Throws fun` | `throws` | `error:(NSError**)error` | [注意](#errors-and-exceptions) |
| 扩展 | 扩展 | 分类成员 | [注意](#extensions-and-category-members) |
| `companion` 成员 <- | 类方法或属性 | 类方法或属性 | |
| `null` | `nil` | `nil` | |
| `Singleton` | `shared` 或 `companion` 属性 | `shared` 或 `companion` 属性 | [注意](#kotlin-singletons) |
| 基元类型 | 基元类型 / `NSNumber` | | [注意](#primitive-types) |
| `Unit` 返回值类型 | `Void` | `void` | |
| `String` | `String` | `NSString` | [注意](#strings) |
| `String` | `NSMutableString` | `NSMutableString` | [注意](#nsmutablestring) |
| `List` | `Array` | `NSArray` | |
| `MutableList` | `NSMutableArray` | `NSMutableArray` | |
| `Set` | `Set` | `NSSet` | |
| `MutableSet` | `NSMutableSet` | `NSMutableSet` | [注意](#collections) |
| `Map` | `Dictionary` | `NSDictionary` | |
| `MutableMap` | `NSMutableDictionary` | `NSMutableDictionary` | [注意](#collections) |
| 函数类型 | 函数类型 | 块指针类型 | [注意](#function-types) |
| 内联类 | 不支持 | 不支持 | [注意](#unsupported) |

### 类 {id="classes"}

#### 名称翻译 {id="name-translation"}

Objective-C 类以原始名称导入 Kotlin。协议作为带有 `Protocol` 名称后缀的接口导入，例如 `@protocol Foo` -> `interface FooProtocol`。这些类和接口被放置在[构建配置中指定](#importing-swift-objective-c-libraries-to-kotlin)的软件包中（预配置的系统框架位于 `platform.*` 软件包中）。

Kotlin 类和接口的名称在导入到 Objective-C 时会添加前缀。前缀源自框架名称。

Objective-C 不支持框架中的软件包。如果 Kotlin 编译器在同一个框架中发现名称相同但软件包不同的 Kotlin 类，它会对其进行重命名。该算法目前尚不稳定，在不同 Kotlin 版本之间可能会发生变化。要解决此问题，你可以重命名框架中冲突的 Kotlin 类。

#### 强链接 {id="strong-linking"}

每当你在 Kotlin 源代码中使用 Objective-C 类时，它都会被标记为强链接符号。生成的构建工件会将相关符号作为强外部引用提及。

这意味着应用在启动期间会尝试动态链接符号，如果符号不可用，应用就会崩溃。即使从未调用过这些符号，崩溃也会发生。符号在特定设备或 OS 版本上可能不可用。

To work around this issue and avoid “Symbol not found” 错误，请使用检查类是否实际可用的 Swift 或 Objective-C 包装器。[查看此解决办法在 Compose Multiplatform 框架中的实现方式](https://github.com/JetBrains/compose-multiplatform-core/pull/1278/files)。

### 初始值设定项 {id="initializers"}

Swift/Objective-C 初始值设定项作为构造函数或名为 `create` 的工厂方法导入 Kotlin。后者发生在 Objective-C 分类或 Swift 扩展中声明的初始值设定项上，因为 Kotlin 没有扩展构造函数的概念。

> 在将 Swift 初始值设定项导入 Kotlin 之前，别忘了用 `@objc` 注解它们。
>
{style="tip"}

Kotlin 构造函数作为初始值设定项导入 Swift/Objective-C。

### Setter {id="setters"}

重写基类只读属性的可写 Objective-C 属性表现为属性 `foo` 的 `setFoo()` 方法。对于实现为可变的协议只读属性也是如此。

### 顶级函数和属性 {id="top-level-functions-and-properties"}

顶级 Kotlin 函数和属性可以作为特殊类的成员进行访问。每个 Kotlin 文件都会被翻译成这样一个类，例如：

```kotlin
// MyLibraryUtils.kt
package my.library

fun foo() {}
```

然后你可以像这样从 Swift 调用 `foo()` 函数：

```swift
MyLibraryUtilsKt.foo()
```

在 Kotlin-Swift interopedia 中查看访问顶级 Kotlin 声明的示例集合：

* [顶级函数](https://github.com/kotlin-hands-on/kotlin-swift-interopedia/blob/main/docs/overview/Top-level%20functions.md)
* [顶级只读属性](https://github.com/kotlin-hands-on/kotlin-swift-interopedia/blob/main/docs/functionsandproperties/Top-level%20val%20properties.md)
* [顶级可变属性](https://github.com/kotlin-hands-on/kotlin-swift-interopedia/blob/main/docs/functionsandproperties/Top-level%20mutable%20var%20properties.md)

### 方法名称翻译 {id="method-names-translation"}

通常，Swift 实参标签和 Objective-C 选择器片段会映射到 Kotlin 形参名称。这两个概念具有不同的语义，因此有时 Swift/Objective-C 方法导入后可能会产生冲突的 Kotlin 签名。在这种情况下，可以使用具名实参从 Kotlin 调用冲突的方法，例如：

```swift
[player moveTo:LEFT byMeters:17]
[player moveTo:UP byInches:42]
```

在 Kotlin 中则是：

```kotlin
player.moveTo(LEFT, byMeters = 17)
player.moveTo(UP, byInches = 42)
```

以下是 `kotlin.Any` 函数如何映射到 Swift/Objective-C：

| Kotlin | Swift | Objective-C |
|--------------|----------------|---------------|
| `equals()` | `isEquals(_:)` | `isEquals:` |
| `hashCode()` | `hash` | `hash` |
| `toString()` | `description` | `description` |

[在 Kotlin-Swift interopedia 中查看数据类的示例](https://github.com/kotlin-hands-on/kotlin-swift-interopedia/blob/main/docs/classesandinterfaces/Data%20classes.md)。

你可以在 Swift 或 Objective-C 中指定一个更符合语言习惯的名称，而不是使用 [`@ObjCName` 注解](#change-declaration-names)来重命名 Kotlin 声明。

### 错误和异常 {id="errors-and-exceptions"}

所有 Kotlin 异常都是未受检的，这意味着错误在运行时捕获。然而，Swift 只有在编译时处理的受检错误。因此，如果 Swift 或 Objective-C 代码调用一个抛出异常的 Kotlin 方法，该 Kotlin 方法应标记为 `@Throws` 注解，并指定一个“预期”异常类的列表。

编译为 Swift/Objective-C 框架时，带有或继承了 `@Throws` 注解的非 `suspend` 函数在 Objective-C 中表现为产出 `NSError*` 的方法，在 Swift 中表现为 `throws` 方法。对于 `suspend` 函数，其表示形式在完成处理程序中始终有一个 `NSError*`/`Error` 形参。

当从 Swift/Objective-C 代码调用的 Kotlin 函数抛出异常，且该异常是 `@Throws` 指定类之一或其子类的实例时，该异常会作为 `NSError` 传播。其他到达 Swift/Objective-C 的 Kotlin 异常被视为未处理，会导致程序终止。

不带 `@Throws` 的 `suspend` 函数仅传播 `CancellationException`（作为 `NSError`）。不带 `@Throws` 的非 `suspend` 函数完全不传播 Kotlin 异常。

请注意，目前尚未实现相反的反向翻译：Swift/Objective-C 的错误抛出方法不会作为异常抛出方法导入 Kotlin。

[在 Kotlin-Swift interopedia 中查看示例](https://github.com/kotlin-hands-on/kotlin-swift-interopedia/blob/main/docs/overview/Exceptions.md)。

### 枚举 {id="enums"}

Kotlin 枚举在 Objective-C 中作为 `@interface` 导入，在 Swift 中作为 `class` 导入。这些数据结构具有对应于每个枚举值的属性。考虑以下 Kotlin 代码：

```kotlin
// Kotlin
enum class Colors {
    RED, GREEN, BLUE
}
```

你可以从 Swift 访问此枚举类的属性，如下所示：

```swift
// Swift
Colors.red
Colors.green
Colors.blue
```

要在 Swift `switch` 语句中使用 Kotlin 枚举变量，请提供一个 default 语句以防止编译错误：

```swift
switch color {
    case .red: print("It's red")
    case .green: print("It's green")
    case .blue: print("It's blue")
    default: fatalError("No such color")
}
```

[在 Kotlin-Swift interopedia 中查看另一个示例](https://github.com/kotlin-hands-on/kotlin-swift-interopedia/blob/main/docs/classesandinterfaces/Enum%20classes.md)。

### 挂起函数 {id="suspending-functions"}

<primary-label ref="experimental-opt-in"/>

Kotlin 的[挂起函数](coroutines-basics.md) (`suspend`) 在生成的 Objective-C 头文件中表现为带有回调的函数，或 Swift/Objective-C 术语中的[完成处理程序](https://developer.apple.com/documentation/swift/calling_objective-c_apis_asynchronously)。

从 Swift 5.5 开始，Kotlin 的 `suspend` 函数也可以从 Swift 作为 `async` 函数调用，而无需使用完成处理程序。目前，此功能处于高度实验阶段，且存在一定的局限性。详见 [此 YouTrack 问题](https://youtrack.jetbrains.com/issue/KT-47610)。

* 在 [Swift 文档中详细了解 `async`/`await` 机制](https://docs.swift.org/swift-book/LanguageGuide/Concurrency.html)。
* 在 [Kotlin-Swift interopedia](https://github.com/kotlin-hands-on/kotlin-swift-interopedia/blob/main/docs/coroutines/Suspend%20functions.md) 中查看示例以及关于实现相同功能的第三方库的建议。

### 扩展和分类成员 {id="extensions-and-category-members"}

Objective-C 分类和 Swift 扩展的成员通常作为扩展导入 Kotlin。这就是为什么这些声明无法在 Kotlin 中被重写，且扩展初始值设定项无法作为 Kotlin 构造函数使用的原因。

> 目前有两个例外。从 Kotlin 1.8.20 开始，与 NSView 类（来自 AppKit 框架）或 UIView 类（来自 UIKit 框架）在相同头文件中声明的分类成员，将作为这些类的成员导入。这意味着你可以重写 NSView 或 UIView 子类的方法。
>
{style="note"}

针对“常规” Kotlin 类的 Kotlin 扩展会分别作为扩展和分类成员导入 Swift 和 Objective-C。针对其他类型的 Kotlin 扩展被视为带有额外接收者实参的[顶级声明](#top-level-functions-and-properties)。这些类型包括：

* Kotlin `String` 类型
* Kotlin 集合类型及其子类型
* Kotlin `interface` 类型
* Kotlin 基元类型
* Kotlin 内联类
* Kotlin `Any` 类型
* Kotlin 函数类型及其子类型
* Objective-C 类和协议

[在 Kotlin-Swift interopedia 中查看示例集合](https://github.com/kotlin-hands-on/kotlin-swift-interopedia/tree/main/docs/extensions)。

### Kotlin 单例 {id="kotlin-singletons"}

Kotlin 单例（通过 `object` 声明创建，包括 `companion object`）作为具有单一实例的类导入 Swift/Objective-C。

该实例可通过 `shared` 和 `companion` 属性访问。

对于以下 Kotlin 代码：

```kotlin
object MyObject {
    val x = "Some value"
}

class MyClass {
    companion object {
        val x = "Some value"
    }
}
```

可以按如下方式访问这些对象：

```swift
MyObject.shared
MyObject.shared.x
MyClass.companion
MyClass.Companion.shared
```

> 在 Objective-C 中通过 `[MySingleton mySingleton]` 以及在 Swift 中通过 `MySingleton()` 访问对象的方式已被弃用。
>
{style="note"}

在 Kotlin-Swift interopedia 中查看更多示例：

* [如何使用 `shared` 访问 Kotlin 对象](https://github.com/kotlin-hands-on/kotlin-swift-interopedia/blob/main/docs/classesandinterfaces/Objects.md)
* [如何从 Swift 访问 Kotlin 伴生对象的成员](https://github.com/kotlin-hands-on/kotlin-swift-interopedia/blob/main/docs/classesandinterfaces/Companion%20objects.md)。

### 基元类型 {id="primitive-types"}

Kotlin 基元类型的装箱被映射到特殊的 Swift/Objective-C 类。例如，`kotlin.Int` 装箱在 Swift 中表现为 `KotlinInt` 类实例（在 Objective-C 中为 `${prefix}Int` 实例，其中 `prefix` 是框架的名称前缀）。这些类派生自 `NSNumber`，因此实例是合法的 `NSNumber`，支持所有相应的操作。

当 `NSNumber` 类型用作 Swift/Objective-C 的形参类型或返回值时，它不会自动转换为 Kotlin 基元类型。原因是 `NSNumber` 类型没有提供关于所包装的基元值类型的足够信息，例如，静态地无法得知 `NSNumber` 是 `Byte`、`Boolean` 还是 `Double`。因此，Kotlin 基元值应[手动与 `NSNumber` 进行相互转换](#casting-between-mapped-types)。

### 字符串 {id="strings"}

当 Kotlin `String` 传递给 Swift时，它首先被导出为 Objective-C 对象，然后 Swift 编译器会为了 Swift 转换再对其进行一次复制。这会导致额外的运行时开销。

为了避免这种情况，可以在 Swift 中直接将 Kotlin 字符串作为 Objective-C `NSString` 访问。[查看转换示例](#see-the-conversion-example)。

#### NSMutableString {id="nsmutablestring"}

Objective-C 类 `NSMutableString` 在 Kotlin 中不可用。所有 `NSMutableString` 实例在传递给 Kotlin 时都会被复制。

### 集合 {id="collections"}

#### Kotlin -> Objective-C -> Swift {id="kotlin-objective-c-swift"}

当 Kotlin 集合传递给 Swift 时，它首先被转换为等效的 Objective-C 集合，然后 Swift 编译器会复制整个集合，并将其转换为 [映射表](#mappings) 中所述的 Swift 原生集合。

最后一次转换会带来性能成本。为了防止这种情况，在 Swift 中使用 Kotlin 集合时，可以显式地将它们转换为对应的 Objective-C 集合：`NSDictionary`、`NSArray` 或 `NSSet`。

##### 查看转换示例 {initial-collapse-state="collapsed" collapsible="true" id="see-the-conversion-example"}

例如，对于以下 Kotlin 声明：

```kotlin
val map: Map<String, String>
```

在 Swift 中，可能看起来像这样：

```Swift
map[key]?.count ?? 0
```

在这里，`map` 被隐式转换为 Swift 的 `Dictionary`，其字符串值被映射为 Swift 的 `String`。这会导致性能开销。

为了避免转换，可以显式地将 `map` 转换为 Objective-C 的 `NSDictionary`，并改为作为 `NSString` 访问值：

```Swift
let nsMap: NSDictionary = map as NSDictionary
(nsMap[key] as? NSString)?.length ?? 0
```

这确保了 Swift 编译器不会执行额外的转换步骤。

#### Swift -> Objective-C -> Kotlin {id="swift-objective-c-kotlin"}

除了 `NSMutableSet` 和 `NSMutableDictionary` 外，Swift/Objective-C 集合会按照 [映射表](#mappings) 中的说明映射到 Kotlin。

`NSMutableSet` 不会被转换为 Kotlin 的 `MutableSet`。要将对象传递给 Kotlin `MutableSet`，请显式地创建此类 Kotlin 集合。为此，可以使用 Kotlin 中的 `mutableSetOf()` 函数，或者 Swift 中的 `KotlinMutableSet` 类以及 Objective-C 中的 `${prefix}MutableSet`（`prefix` 是框架名称前缀）。对于 `MutableMap` 也是如此。

[在 Kotlin-Swift interopedia 中查看示例](https://github.com/kotlin-hands-on/kotlin-swift-interopedia/blob/main/docs/overview/Collections.md)。

### 函数类型 {id="function-types"}

Kotlin 函数类型对象（例如 lambda）在 Swift 中被转换为闭包，在 Objective-C 中被转换为块。[在 Kotlin-Swift interopedia 中查看带有 lambda 的 Kotlin 函数示例](https://github.com/kotlin-hands-on/kotlin-swift-interopedia/blob/main/docs/functionsandproperties/Functions%20returning%20function%20type.md)。

但是，在翻译函数和函数类型时，形参和返回值类型的映射方式存在差异。在后一种情况下，基元类型被映射到它们的装箱表示。Kotlin `Unit` 返回值在 Swift/Objective-C 中表现为相应的 `Unit` 单例。可以像访问任何其他 Kotlin `object` 一样检索此单例的值。请参阅[上表](#mappings)中的单例。

考虑以下 Kotlin 函数：

```kotlin
fun foo(block: (Int) -> Unit) { ... }
```

它在 Swift 中表现如下：

```swift
func foo(block: (KotlinInt) -> KotlinUnit)
```

你可以像这样调用它：

```swift
foo {
    bar($0 as! Int32)
    return KotlinUnit()
}
```

#### Objective-C 块类型中的显式形参名称 {id="explicit-parameter-names-in-objective-c-block-types"}
<primary-label ref="experimental-opt-in"/>

你可以为导出的 Objective-C 头文件中的 Kotlin 函数类型添加显式形参名称。在 Objective-C 块中调用 Objective-C 函数时，Xcode 的自动补全会建议这些名称。这有助于避免生成的块中出现 Clang 警告。

要启用显式形参名称，请在 `gradle.properties` 文件中添加以下[二进制选项](native-binary-options.md)：

```none
kotlin.native.binary.objcExportBlockExplicitParameterNames=true
```

例如，对于以下 Kotlin 代码：

```kotlin
// Kotlin:
fun greetUser(block: (name: String) -> Unit) = block("John")
```

Kotlin 将形参名称从 Kotlin 函数类型转发到 Objective-C 块类型，从而允许 Xcode 在建议中使用它们：

```objc
// Objective-C:
greetUserBlock:^(NSString *name) {
    // ...
};
```

> 此选项仅影响 Objective-C 互操作。它适用于在 Xcode 中从 Objective-C 调用生成的 Objective-C 代码，通常不会影响从 Swift 发起的调用。
>
{style="note"}

### 泛型 {id="generics"}

Objective-C 支持在类中定义的“轻量级泛型”，其功能集相对有限。Swift 可以导入类上定义的泛型，以帮助向编译器提供额外的类型信息。

Objective-C 和 Swift 对泛型功能的支持与 Kotlin 不同，因此翻译不可避免地会丢失一些信息，但支持的功能保留了有意义的信息。

有关如何在 Swift 中使用 Kotlin 泛型的具体示例，请参阅 [Kotlin-Swift interopedia](https://github.com/kotlin-hands-on/kotlin-swift-interopedia/blob/main/docs/overview/ShouldRefineInSwift.md)。

#### 限制 {id="limitations"}

Objective-C 泛型不支持 Kotlin 或 Swift 的所有功能，因此在翻译中会丢失一些信息。

泛型只能在类上定义，不能在接口（Objective-C 和 Swift 中的协议）或函数上定义。

#### 为 null 性 {id="nullability"}

Kotlin 和 Swift 都将为 null 性定义为类型规范的一部分，而 Objective-C 在类型的属性和方法上定义为 null 性。因此，以下 Kotlin 代码：

```kotlin
class Sample<T>() {
    fun myVal(): T
}
```

在 Swift 中看起来像这样：

```swift
class Sample<T>() {
    fun myVal(): T?
}
```

为了支持潜在的可为 null 类型，Objective-C 头文件需要定义带有可为 null 返回值的 `myVal`。

为了缓解这种情况，在定义泛型类时，如果泛型类型应 *永远* 不为 null，请提供非 null 类型约束：

```kotlin
class Sample<T : Any>() {
    fun myVal(): T
}
```

这将强制 Objective-C 头文件将 `myVal` 标记为非 null。

#### 差异 (Variance) {id="variance"}

Objective-C 允许将泛型声明为协变或逆变。Swift 不支持差异。来自 Objective-C 的泛型类可以根据需要进行强制转换。

```kotlin
data class SomeData(val num: Int = 42) : BaseData()
class GenVarOut<out T : Any>(val arg: T)
```

```swift
let variOut = GenVarOut<SomeData>(arg: sd)
let variOutAny : GenVarOut<BaseData> = variOut as! GenVarOut<BaseData>
```

#### 约束 {id="constraints"}

在 Kotlin 中，你可以为泛型类型提供上界。Objective-C 也支持这一点，但在更复杂的情况下不可用，并且目前在 Kotlin - Objective-C 互操作中不受支持。例外情况是，非 null 的上界会使 Objective-C 方法/属性变为非 null。

#### 禁用 {id="to-disable"}

要使生成的框架头文件不带泛型，请在构建文件中添加以下编译器选项：

```kotlin
binaries.framework {
    freeCompilerArgs += "-Xno-objc-generics"
}
```

### 前向声明 {id="forward-declarations"}

要导入前向声明，请使用 `objcnames.classes` 和 `objcnames.protocols` 软件包。例如，要导入在带有 `library.package` 的 Objective-C 库中声明的 `objcprotocolName` 前向声明，请使用特殊的前向声明软件包：`import objcnames.protocols.objcprotocolName`。

考虑两个 objcinterop 库：一个使用 `objcnames.protocols.ForwardDeclaredProtocolProtocol`，另一个在另一个软件包中具有实际实现：

```ObjC
// 第一个 objcinterop 库
#import <Foundation/Foundation.h>

@protocol ForwardDeclaredProtocol;

NSString* consumeProtocol(id<ForwardDeclaredProtocol> s) {
    return [NSString stringWithUTF8String:"Protocol"];
}
```

```ObjC
// 第二个 objcinterop 库
// 头文件:
#import <Foundation/Foundation.h>
@protocol ForwardDeclaredProtocol
@end
// 实现:
@interface ForwardDeclaredProtocolImpl : NSObject <ForwardDeclaredProtocol>
@end

id<ForwardDeclaredProtocol> produceProtocol() {
    return [ForwardDeclaredProtocolImpl new];
}
```

要在两个库之间传输对象，请在 Kotlin 代码中使用显式的 `as` 转换：

```kotlin
// Kotlin 代码:
fun test() {
    consumeProtocol(produceProtocol() as objcnames.protocols.ForwardDeclaredProtocolProtocol)
}
```

> 你只能从相应的真实类转换为 `objcnames.protocols.ForwardDeclaredProtocolProtocol`。否则，你将收到一个错误。
>
{style="note"}

## 在映射类型之间转换 {id="casting-between-mapped-types"}

在编写 Kotlin 代码时，可能需要将对象从 Kotlin 类型转换为等效的 Swift/Objective-C 类型，反之亦然。在这种情况下，你可以使用 [`as` 转换](typecasts.md#unsafe-cast-operator)，例如：

```kotlin
@file:Suppress("CAST_NEVER_SUCCEEDS")
import platform.Foundation.*

val nsNumber = 42 as NSNumber
val nsArray = listOf(1, 2, 3) as NSArray
val nsString = "Hello" as NSString
val string = nsString as String
```

IDE 可能会错误地发出 “This cast can never succeed” 的警告。在这种情况下，请使用 `@Suppress("CAST_NEVER_SUCCEEDS")` 注解。

## 子类化 {id="subclassing"}

### 从 Swift/Objective-C 子类化 Kotlin 类和接口 {id="subclassing-kotlin-classes-and-interfaces-from-swift-objective-c"}

Kotlin 类和接口可以被 Swift/Objective-C 类和协议子类化。

### 从 Kotlin 子类化 Swift/Objective-C 类和协议 {id="subclassing-swift-objective-c-classes-and-protocols-from-kotlin"}

Swift/Objective-C 类和协议可以使用 Kotlin `final` 类进行子类化。目前还不支持继承 Swift/Objective-C 类型的非 `final` Kotlin 类，因此无法声明继承自 Swift/Objective-C 类型的复杂类层次结构。

可以使用 `override` Kotlin 关键字重写普通方法。在这种情况下，重写的方法必须具有与被重写方法相同的形参名称。

有时需要重写初始值设定项，例如在对 `UIViewController` 进行子类化时。作为 Kotlin 构造函数导入的初始值设定项，可以由标记有 `@OverrideInit` 注解的 Kotlin 构造函数进行重写：

```swift
class ViewController : UIViewController {
    @OverrideInit constructor(coder: NSCoder) : super(coder)

    ...
}
```

重写的构造函数必须具有与被重写构造函数相同的形参名称和类型。

要重写具有冲突 Kotlin 签名的不同方法，可以向类添加 `@ObjCSignatureOverride` 注解。该注解指示 Kotlin 编译器忽略冲突的重载，以防从 Objective-C 类继承了多个具有相同形参类型但实参名称不同的函数。

默认情况下，Kotlin/Native 编译器不允许调用非指定的 Objective-C 初始值设定项作为 `super()` 构造函数。如果 Objective-C 库中没有正确标记指定的初始值设定项，这种行为可能会带来不便。要禁用这些编译器检查，请将 `disableDesignatedInitializerChecks = true` 添加到库的 [`.def` 文件](native-definition-file.md)中。

## C 功能 {id="c-features"}

请参阅[与 C 的互操作性](native-c-interop.md)，了解库使用某些纯 C 功能（如不安全指针、结构体等）的示例情况。

## 不支持 {id="unsupported"}

Kotlin 编程语言的某些功能尚未映射到 Objective-C 或 Swift 的相应功能。目前，生成的框架头文件中未正确暴露以下功能：

* 内联类（实参被映射为底层基元类型或 `id`）
* 实现标准 Kotlin 集合接口（`List`、`Map`、`Set`）的自定义类以及其他特殊类
* Objective-C 类的 Kotlin 子类