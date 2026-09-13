[//]: # (title: 使用 Swift 导出与 Swift 的互操作性)

<primary-label ref="alpha"/>

Kotlin 通过 Swift 导出提供与 Swift 互操作性的 Alpha 级别支持。Swift 导出允许您直接导出 Kotlin 源代码，并以符合 Swift 习惯的方式从 Swift 调用 Kotlin 代码，从而无需 Objective-C 头文件。

Swift 导出让 Apple 目标平台的多平台开发更加顺畅。例如，如果您有一个包含顶层函数的 Kotlin 模块，Swift 导出可以实现简洁的模块特定导入，从而移除令人困惑的 Objective-C 下划线和重整名称。

当前的 Swift 导出功能包括：

* **多模块支持**。每个 Kotlin 模块都会被导出为独立的 Swift 模块，简化了函数调用。
* **软件包支持**。在导出过程中会显式保留 Kotlin 软件包，避免在生成的 Swift 代码中出现命名冲突。
* **类型别名**。Kotlin 类型别名会被导出并在 Swift 中保留，从而提高可读性。
* **增强的基元为 null 性支持**。与 Objective-C 互操作不同（后者需要将 `Int?` 等类型装箱到 `KotlinInt` 等包装类中以保留为 null 性），Swift 导出会直接转换具有为 null 性的信息。
* **重载**。您可以在 Swift 中无歧义地调用 Kotlin 的重载函数。
* **扁平化的软件包结构**。您可以将 Kotlin 软件包转换为 Swift 枚举，从而从生成的 Swift 代码中移除软件包前缀。
* **模块名称自定义**。您可以在 Kotlin 项目的 Gradle 构建配置中自定义生成的 Swift 模块名称。
* **并发支持**。您可以从 Swift 无缝调用 Kotlin 的挂起代码，并能开箱即用地将 `kotlinx.coroutines` flow 导出为 Swift 的 `AsyncSequence`。

## 启用 Swift 导出 {id="enable-swift-export"}

Swift 导出目前处于 [Alpha](components-stability.md#stability-levels-explained) 阶段且尚不完整，因此可能会出现破坏性变更。如需试用，请在您的 Kotlin 项目中[配置构建文件](#configure-kotlin-project)，并[设置 Xcode](#configure-xcode-project) 以集成 Swift 导出。

### 配置 Kotlin 项目 {id="configure-kotlin-project"}

您可以在项目中使用以下构建文件作为设置 Swift 导出的起点：

```kotlin
// build.gradle.kts
kotlin {

    iosArm64()
    iosSimulatorArm64()

    swiftExport {
        // 设置根模块名称
        moduleName = "Shared"

        // 设置折叠规则
        // 从生成的 Swift 代码中移除软件包前缀
        flattenPackage = "com.example.sandbox"

        // 配置外部模块导出
        export(project(":subproject")) {
            // 设置导出模块的名称
            moduleName = "Subproject"
            // 设置导出依赖项的折叠规则
            flattenPackage = "com.subproject.library"
        }

        // 为链接任务提供编译器参数
        configure {
            freeCompilerArgs.add("-Xexpect-actual-classes")
        }
    }
}
```

Kotlin 编译器会自动生成所有必要的文件（包括 `swiftmodule` 文件、静态 `.a` 库、一个头文件和一个 `modulemap` 文件），并将它们复制到应用的构建目录中，您可以从 Xcode 访问该目录。

> 您也可以克隆我们已设置好 Swift 导出的[公共示例](https://github.com/Kotlin/swift-export-sample)。
>
{style="tip"}

### 配置 Xcode 项目 {id="configure-xcode-project"}

要配置 Xcode 以在项目中集成 Swift 导出，请执行以下操作：

1. 在 Xcode 中，打开项目设置。
2. 在 **Build Phases** 选项卡上，找到包含 `embedAndSignAppleFrameworkForXcode` 任务的 **Run Script** 阶段。
3. 在运行脚本阶段将该脚本替换为 `embedSwiftExportForXcode` 任务：

   ```bash
   ./gradlew :<Shared module name>:embedSwiftExportForXcode
   ```

   ![添加 Swift 导出脚本](xcode-swift-export-run-script-phase.png){width=700}

4. 构建项目。构建将在输出目录中生成 Swift 模块。

## 当前限制 {id="current-limitations"}

Swift 导出目前仅适用于使用[直接集成](https://kotlinlang.org/docs/multiplatform/multiplatform-direct-integration.html)将 iOS 框架连接到 Xcode 项目的项目。这是使用 IntelliJ IDEA 中的 Kotlin Multiplatform 插件或通过 [Web 向导](https://kmp.jetbrains.com/)创建的 Kotlin Multiplatform 项目的标准配置。

其它已知问题：

* 继承自 `List`、`Set` 或 `Map` 的类型在导出期间会被忽略 ([KT-80416](https://youtrack.jetbrains.com/issue/KT-80416))。
* `List`、`Set` 或 `Map` 的继承者无法在 Swift 侧实例化 ([KT-80417](https://youtrack.jetbrains.com/issue/KT-80417))。
* 导出到 Swift 时，Kotlin 泛型类型形参会被类型擦除为其上界。
* 目前没有 IDE 迁移提示或自动化工具可用。
* 使用需要选择性加入 (opt-in) 的声明时，必须在 Gradle 构建文件的*模块级别*添加显式的 `optIn` 编译器选项。例如，对于 `kotlinx.datetime` 库：

  ```kotlin
  swiftExport {
      moduleName = "Shared"

      export("org.jetbrains.kotlinx:kotlinx-datetime:%dateTimeVersion%") {
          moduleName = "KotlinDateTime"
          flattenPackage = "kotlinx.datetime"
      }
  }

  // 在模块级别添加单独的 opt-in 块
  compilerOptions {
      optIn.add("kotlin.time.ExperimentalTime")
  }
  ```

## 映射 {id="mappings"}

下表展示了 Kotlin 概念如何映射到 Swift。

| Kotlin                                                            | Swift                          |
|-------------------------------------------------------------------|--------------------------------|
| [`class`](#classes)                                               | `class`                        |
| [`object`](#objects)                                              | 带有 `shared` 属性的 `class`   |
| [`enum class`](#enums)                                            | `enum`                         |
| [`sealed` 类与接口](#sealed-classes-and-interfaces)                | `enum`                         |
| [`typealias`](#type-aliases)                                      | `typealias`                    |
| [函数](#functions)                                                | 函数                           |
| [`suspend fun`](#suspending-functions)                            | `async`                        |
| [`kotlinx.coroutines` flow](#flows)                              | `AsyncSequence`                |
| [属性](#properties)                                               | 属性                           |
| [构造函数](#constructors)                                         | 初始值设定项                   |
| [软件包](#packages)                                               | 嵌套枚举                       |
| `Boolean`                                                         | `Bool`                         |
| `Char`                                                            | `Unicode.UTF16.CodeUnit`       |
| `Byte`                                                            | `Int8`                         |
| `Short`                                                           | `Int16`                        |
| `Int`                                                             | `Int32`                        |
| `Long`                                                            | `Int64`                        |
| `UByte`                                                           | `UInt8`                        |
| `UShort`                                                          | `UInt16`                       |
| `UInt`                                                            | `UInt32`                       |
| `ULong`                                                           | `UInt64`                       |
| `Float`                                                           | `Float`                        |
| `Double`                                                          | `Double`                       |
| `Any`                                                             | `KotlinBase` 类                |
| `Unit`                                                            | `Void`                         |
| [`Nothing`](#kotlin-nothing)                                      | `Never`                        |

### 声明 {id="declarations"}

#### 类 (Classes) {id="classes"}

Swift 导出仅支持直接继承自 `Any` 的最终类，例如 `class Foo()`。它们会被翻译为继承自特殊 `KotlinBase` 类的 Swift 类：

```kotlin
// Kotlin
class MyClass {
    val property: Int = 0

    fun method() {}
}
```

```swift
// Swift
public class MyClass : KotlinRuntime.KotlinBase {
    public var property: Swift.Int32 {
        get {
            // ...
        }
    }
    public override init() {
        // ...
    }
    public func method() -> Swift.Void {
        // ...
    }
}
```

#### 对象 (Objects) {id="objects"}

对象会被翻译为具有私有 `init` 和静态 `shared` 访问器的 Swift 类：

```kotlin
// Kotlin
object O
```

```swift
// Swift
public class O : KotlinRuntime.KotlinBase {
    public static var shared: O {
        get {
            // ...
        }
    }
    private override init() {
        // ...
    }
}
```

#### 类型别名 (Type aliases) {id="type-aliases"}

Kotlin 类型别名会原样导出：

```kotlin
// Kotlin
typealias MyInt = Int
```

```swift
// Swift
public typealias MyInt = Swift.Int32
```

#### 枚举 (Enums) {id="enums"}

Kotlin `enum class` 声明会被导出为常规的原生 Swift `enum` 类型：

```kotlin
// Kotlin
enum class Color(val rgb: Int) {
    RED(0xFF0000),
    GREEN(0x00FF00),
    BLUE(0x0000FF)
}

val color = Color.RED
```

```swift
// Swift
public enum Color: Swift.CaseIterable, Swift.LosslessStringConvertible, Swift.RawRepresentable {
    case RED, GREEN, BLUE

    public var rgb: Swift.Int32 { get }
}
```

#### 密封类与接口 (Sealed classes and interfaces) {id="sealed-classes-and-interfaces"}

在 Kotlin 中定义的密封层次结构会被映射到 Swift 枚举，从而支持详尽的 `switch` 语句。

Swift 导出会为每个密封类型生成一个 `.sealedType()` 方法。该方法返回一个 Swift 枚举，其成员（case）与密封层次结构的直接子类相对应。您可以嵌套这些调用来匹配更深层级的层次结构。

例如，在 Kotlin 中声明一个包含类层次结构的密封接口：

```kotlin
// Kotlin
sealed interface Shape

class Circle : Shape {
    override fun toString(): String = "Circle"
}

class Rectangle : Shape {
    override fun toString(): String = "Rectangle"
}

fun createCircle(): Shape = Circle()
```

在 Swift 侧，您可以使用无需 `default` 分支的详尽 `switch`：

```swift
// Swift
let shape = createCircle()

let name = switch shape.sealedType() {
    case let .circle(type): "It's a \(type.value)"
    case let .rectangle(type): "It's a \(type.value)"
}
// name == "It's a Circle"
```

由于 `switch` 是详尽穷举的，因此如果在密封层次结构中添加了新的子类，编译器会发出警告，以便您可以立即对其进行处理，而无需依赖 `switch` 的 `default` 分支。

#### 函数 (Functions) {id="functions"}

Swift 导出支持简单的顶层函数和方法：

```kotlin
// Kotlin
fun foo(a: Short, b: Bar) {}

fun baz(): Long = 0
```

```swift
// Swift
public func foo(a: Swift.Int16, b: Bar) -> Swift.Void {
    // ...
}

public func baz() -> Swift.Int64 {
    // ...
}
```

对于 Kotlin 的扩展函数，接收者参数会变成位于第一个位置的普通 Swift 参数：

```kotlin
// Kotlin
fun Int.foo(): Unit = TODO()
```

```swift
// Swift
func foo(_ receiver: Int32) {}
```

带有 [`vararg`](functions.md#variable-number-of-arguments-varargs) 的 Kotlin 函数会被映射到 Swift 的变参函数参数：

```kotlin
// Kotlin
fun log(vararg messages: String)
```

```swift
// Swift
public func log(messages: Swift.String...)
```

> * 目前对带有 [`operator` 修饰符](operator-overloading.md)的函数支持有限。
> * 通常不支持泛型类型。
>
{style="note"}

#### 属性 (Properties) {id="properties"}

Kotlin 属性会被翻译为 Swift 属性：

```kotlin
// Kotlin
val a: Int = 0

var b: Short = 15

const val c: Int = 0
```

```swift
// Swift
public var a: Swift.Int32 {
    get {
        // ...
    }
}
public var b: Swift.Int16 {
    get {
        // ...
    }
    set {
        // ...
    }
}
public var c: Swift.Int32 {
    get {
        // ...
    }
}
```

#### 构造函数 (Constructors) {id="constructors"}

构造函数会被翻译为 Swift 初始值设定项：

```kotlin
// Kotlin
class Foo(val prop: Int)
```

```swift
// Swift
public class Foo : KotlinRuntime.KotlinBase {
    public init(
        prop: Swift.Int32
    ) {
        // ...
    }
}
```

### 类型 {id="types"}

#### kotlin.Nothing {id="kotlin-nothing"}

Kotlin 的 `Nothing` 类型会被翻译为 `Never` 类型：

```kotlin
// Kotlin
fun foo(): Nothing = TODO()

fun baz(input: Nothing) {}
```

```swift
// Swift
public func foo() -> Swift.Never {
    // ...
}

public func baz(input: Swift.Never) -> Void {
    // ...
}
```

#### 分类器类型 (Classifier types) {id="classifier-types"}

Swift 导出目前仅支持直接继承自 `Any` 的最终类。

### 软件包 (Packages) {id="packages"}

Kotlin 软件包会被翻译为嵌套的 Swift 枚举，以避免名称冲突：

```kotlin
// Kotlin
// foo.bar 软件包中的 bar.kt 文件
fun callMeMaybe() {}
```

```kotlin
// Kotlin
// foo.baz 软件包中的 baz.kt 文件
fun callMeMaybe() {}
```

```swift
// Swift
public extension foo.bar {
    public func callMeMaybe() {}
}

public extension foo.baz {
    public func callMeMaybe() {}
}

public enum foo {
    public enum bar {}

    public enum baz {}
}
```

### 并发 {id="concurrency"}

#### 挂起函数 {id="suspending-functions"}

您可以从 Swift 调用 Kotlin 的挂起代码。Kotlin [挂起函数](coroutines-basics.md#suspending-functions)和挂起函数类型会被导出为 Swift 的 `async` 对应项：

```kotlin
// Kotlin
suspend fun hello(): String {
    delay(1000)
    return "Hello Swift! This is Kotlin."
}
```

```swift
// Swift
let msg = try await hello()
```

#### Flow {id="flows"}

您还可以将 `kotlinx.coroutines` flow 导出为 Swift 的 [`AsyncSequence`](https://developer.apple.com/documentation/Swift/AsyncSequence)：

```kotlin
// Kotlin
// 导出 Flow 时保留 String 类型
fun flowOfStrings(): Flow<String> = flowOf("hello", "any", "world")
```

```swift
// Swift
var actual: [String] = []

// 从 Kotlin 推断 String 类型
for try await element in flowOfStrings().asAsyncSequence() {
    actual.append(element)
}
```

#### 协程调度器 {id="coroutine-dispatchers"}

默认情况下，当您从 Swift 调用 Kotlin 挂起函数或使用 `asAsyncSequence` 函数时，Kotlin 会创建一个协程上下文，该上下文使用 [`Dispatchers.Default`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/-default.html) 调度器并在其中执行导出的代码。

要在[不同的调度器](coroutines-basics.md#coroutine-dispatchers)上运行导出的代码，请使用 `withContext()` 函数在 Kotlin 中切换协程上下文。例如：

```kotlin
suspend fun runOnMain(): Int = withContext(Dispatchers.Main) {
    delay(10L)
    42
}
```

## 跨语言继承 {id="cross-language-inheritance"}

Swift 导出支持跨语言继承。此功能的一个常见用例是[反向导入](native-lib-import-stability.md#swift-library-import)模式，即在 Kotlin 中定义协定，并在 Swift 侧提供平台特定的实现。当您需要使用无法直接导入到 Kotlin 中的纯 Swift 库时，这种方式尤其有用。

要实现此模式，您需要声明一个 Kotlin 接口和一个供 Swift 实现继承的 Kotlin 超类。然后，您在 Swift 中实现该接口，并将 Swift 对象传递给接受该接口的 Kotlin 函数。例如，针对 CryptoKit 库：

1. 在 Kotlin 侧，声明一个接口、一个接受该接口的函数以及一个 `open` 基类：

    ```kotlin
    // Kotlin
    interface CryptoProvider {
        fun hashMD5(input: String): String
    }

    fun processHash(provider: CryptoProvider, input: String): String = provider.hashMD5(input)

    open class SwiftBase
    ```

2. 在 Swift 侧，继承导出的 `SwiftBase` 类，使用纯 Swift 库实现该接口，并将对象传回 Kotlin：

    ```swift
    // Swift
    import CryptoKit

    final class IosCryptoProvider: SwiftBase, CryptoProvider {
        func hashMD5(input: String) -> String {
            guard let data = input.data(using: .utf8) else { return "failed" }
            return Insecure.MD5.hash(data: data).description
        }
    }

    let provider = IosCryptoProvider()
    
    // 调用 Kotlin 函数，该函数会反过来在 Swift 中调用 hashMD5()
    print(processHash(provider: provider, input: "Hello, world!"))
    ```

当 Kotlin 接收到该 Swift 对象时，会将其视为常规 Kotlin 接口的实现，直接调用 Swift 代码。

## Swift 导出的演进 {id="evolution-of-swift-export"}

我们计划在未来的 Kotlin 版本中扩展并逐步稳定 Swift 导出，改善 Kotlin 与 Swift 之间的互操作性。您可以留下您的反馈：

* 在 Kotlin Slack 中 – [获取邀请](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up?_gl=1*ju6cbn*_ga*MTA3MTk5NDkzMC4xNjQ2MDY3MDU4*_ga_9J976DJZ68*MTY1ODMzNzA3OS4xMDAuMS4xNjU4MzQwODEwLjYw)并加入 [#swift-export](https://kotlinlang.slack.com/archives/C073GUW6WN9) 频道。
* 在 [YouTrack](https://kotl.in/issue) 中报告问题。