[//]: # (title: 使用 Swift export 與 Swift 互通)

<primary-label ref="alpha"/>

Kotlin 透過 Swift export 與 Swift 互通的功能目前處於 Alpha 階段。Swift export 允許您直接匯出 Kotlin 原始碼，並以慣用的方式從 Swift 呼叫 Kotlin 程式碼，不需要 Objective-C 標頭檔。

Swift export 讓針對 Apple 目標的多平台開發更加精簡。例如，如果您有一個包含頂層函式的 Kotlin 模組，Swift export 可以實現乾淨且模組特定的匯入，移除了令人困惑的 Objective-C 底線和修飾名 (mangled names)。

目前的 Swift export 特性包括：

* **多模組支援**。每個 Kotlin 模組都會被匯出為一個獨立的 Swift 模組，簡化了函式呼叫。
* **套件支援**。Kotlin 套件在匯出期間會被明確保留，避免在產生的 Swift 程式碼中發生命名衝突。
* **型別別名**。Kotlin 型別別名會被匯出並保留在 Swift 中，提高可讀性。
* **增強型基本型別的可 null 性**。與 Objective-C 互通性不同（後者需要將 `Int?` 等型別裝箱到 `KotlinInt` 等包裝類別中以保留可 null 性），Swift export 會直接轉換可 null 性資訊。
* **多載**。您可以在 Swift 中呼叫 Kotlin 的多載函式而不會產生歧義。
* **扁平化套件結構**。您可以將 Kotlin 套件轉換為 Swift 列舉，從產生的 Swift 程式碼中移除套件前綴。
* **模組名稱自訂**。您可以在 Kotlin 專案的 Gradle 配置中自訂產生的 Swift 模組名稱。
* **並行支援**。您可以從 Swift 無縫呼叫 Kotlin 的暫停函式，並能開箱即用地將 `kotlinx.coroutines` flows 匯出為 Swift 的 `AsyncSequence`。

## 啟用 Swift export {id="enable-swift-export"}

Swift export 目前處於 [Alpha](components-stability.md#stability-levels-explained) 階段且尚不完整，因此預期會有重大變更。若要嘗試，請在您的 Kotlin 專案中 [設定建置檔案](#configure-kotlin-project)，並 [設定 Xcode](#configure-xcode-project) 以整合 Swift export。

### 設定 Kotlin 專案 {id="configure-kotlin-project"}

您可以使用專案中的以下建置檔案作為設定 Swift export 的起點：

```kotlin
// build.gradle.kts
kotlin {

    iosArm64()
    iosSimulatorArm64()

    swiftExport {
        // 設定根模組名稱
        moduleName = "Shared"

        // 設定收合規則
        // 從產生的 Swift 程式碼中移除套件前綴
        flattenPackage = "com.example.sandbox"

        // 配置外部模組匯出
        export(project(":subproject")) {
            // 設定匯出模組的名稱 
            moduleName = "Subproject"
            // 設定匯出相依項的收合規則 
            flattenPackage = "com.subproject.library"
        }

        // 為連結任務提供編譯器引數
        configure {
            freeCompilerArgs.add("-Xexpect-actual-classes")
        }
    }
}
```

Kotlin 編譯器會自動產生所有必要的檔案（包括 `swiftmodule` 檔案、靜態 `.a` 程式庫、標頭檔和 `modulemap` 檔案），並將它們複製到應用程式的組建目錄中，您可以從 Xcode 存取該目錄。

> 您也可以複製我們已經設定好 Swift export 的 [公開範例](https://github.com/Kotlin/swift-export-sample)。
>
{style="tip"}

### 設定 Xcode 專案 {id="configure-xcode-project"}

若要配置 Xcode 以將 Swift export 整合到您的專案中：

1. 在 Xcode 中，開啟專案設定。
2. 在 **Build Phases** 索引標籤上，找到包含 `embedAndSignAppleFrameworkForXcode` 任務的 **Run Script** 階段。
3. 將該階段的指令碼取代為 `embedSwiftExportForXcode` 任務：

   ```bash
   ./gradlew :<Shared module name>:embedSwiftExportForXcode
   ```

   ![新增 Swift export 指令碼](xcode-swift-export-run-script-phase.png){width=700}

4. 組建專案。建置過程會在輸出目錄中產生 Swift 模組。

## 目前限制 {id="current-limitations"}

Swift export 目前僅適用於使用 [直接整合](https://kotlinlang.org/docs/multiplatform/multiplatform-direct-integration.html) 將 iOS 框架連接到 Xcode 專案的專案。這是使用 IntelliJ IDEA 中的 Kotlin Multiplatform 外掛程式或透過 [Web 精靈](https://kmp.jetbrains.com/) 建立的 Kotlin Multiplatform 專案的標準配置。

其他已知問題：

* 繼承自 `List`、`Set` 或 `Map` 的型別在匯出期間會被忽略 ([KT-80416](https://youtrack.jetbrains.com/issue/KT-80416))。
* `List`、`Set` 或 `Map` 的繼承者無法在 Swift 側具現化 ([KT-80417](https://youtrack.jetbrains.com/issue/KT-80417))。
* 匯出到 Swift 時，Kotlin 泛型型別參數會被型別擦除為其上界 (upper bounds)。
* 目前沒有 IDE 遷移提示或自動化功能。
* 當使用需要選擇性加入 (opt-in) 的宣告時，您必須在 Gradle 建置檔案的「模組層級」新增明確的 `optIn` 編譯器選項。例如，對於 `kotlinx.datetime` 程式庫：

  ```kotlin
  swiftExport {
      moduleName = "Shared"

      export("org.jetbrains.kotlinx:kotlinx-datetime:%dateTimeVersion%") {
          moduleName = "KotlinDateTime"
          flattenPackage = "kotlinx.datetime"
      }
  }

  // 在模組層級新增一個獨立的 opt-in 區塊
  compilerOptions {
      optIn.add("kotlin.time.ExperimentalTime")
  }
  ```

## 對應 {id="mappings"}

下表顯示了 Kotlin 概念如何對應到 Swift。

| Kotlin                                                            | Swift                          |
|-------------------------------------------------------------------|--------------------------------|
| [`class`](#classes)                                               | `class`                        |
| [`object`](#objects)                                              | 具有 `shared` 屬性的 `class`      |
| [`enum class`](#enums)                                            | `enum`                         |
| [`sealed` 類別與介面](#sealed-classes-and-interfaces)             | `enum`                         |
| [`typealias`](#type-aliases)                                      | `typealias`                    |
| [函式](#functions)                                                | 函式                           |
| [`suspend fun`](#suspending-functions)                            | `async`                        |
| [`kotlinx.coroutines` flows](#flows)                              | `AsyncSequence`                |
| [屬性](#properties)                                               | 屬性                           |
| [建構函式](#constructors)                                         | 初始設定式                     |
| [套件](#packages)                                                 | 巢狀列舉                       |
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
| `Any`                                                             | `KotlinBase` 類別              |
| `Unit`                                                            | `Void`                         |
| [`Nothing`](#kotlin-nothing)                                      | `Never`                        |

### 宣告 {id="declarations"}

#### 類別 (Classes) {id="classes"}

Swift export 僅支援直接繼承自 `Any` 的 final 類別，例如 `class Foo()`。它們會被轉換為繼承自特殊 `KotlinBase` 類別的 Swift 類別：

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

#### 物件 (Objects) {id="objects"}

物件會被轉換為具有私有 `init` 和靜態 `shared` 存取子的 Swift 類別：

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

#### 型別別名 (Type aliases) {id="type-aliases"}

Kotlin 型別別名會原樣匯出：

```kotlin
// Kotlin
typealias MyInt = Int
```

```swift
// Swift
public typealias MyInt = Swift.Int32
```

#### 列舉 (Enums) {id="enums"}

Kotlin `enum class` 宣告會被匯出為一般的原生 Swift `enum` 型別：

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

#### 密封類別與介面 (Sealed classes and interfaces) {id="sealed-classes-and-interfaces"}

在 Kotlin 中定義的密封階層結構會對應到 Swift 列舉，從而支援詳盡的 `switch` 陳述式。

Swift export 會在每個密封型別上產生 `.sealedType()` 方法。該方法會傳回一個 Swift 列舉，其 case 與密封階層結構的直接子類別相符。您可以巢狀呼叫這些方法來比對階層結構中更深層的層級。

例如，在 Kotlin 中宣告具有類別階層結構的密封介面：

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

在 Swift 側，您可以使用沒有 `default` case 的詳盡 `switch`：

```swift
// Swift
let shape = createCircle()

let name = switch shape.sealedType() {
    case let .circle(type): "It's a \(type.value)"
    case let .rectangle(type): "It's a \(type.value)"
}
// name == "It's a Circle"
```

由於 `switch` 是詳盡無遺的，如果將新的子類別新增至密封階層結構中，編譯器就會發出警告，讓您可以立即處理，而無需依賴 `switch` 的 `default` case。

#### 函式 (Functions) {id="functions"}

Swift export 支援簡單的頂層函式與方法：

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

對於 Kotlin 的擴充函式，接收者參數會變成第一個位置的普通 Swift 參數：

```kotlin
// Kotlin
fun Int.foo(): Unit = TODO()
```

```swift
// Swift
func foo(_ receiver: Int32) {}
```

Kotlin 帶有 [`vararg`](functions.md#variable-number-of-arguments-varargs) 的函式會對應到 Swift 的可變參數函式參數：

```kotlin
// Kotlin
fun log(vararg messages: String)
```

```swift
// Swift
public func log(messages: Swift.String...)
```

> * 目前對帶有 [`operator` 修飾元](operator-overloading.md) 的函式支援有限。
> * 通常不支援泛型型別。
>
{style="note"}

#### 屬性 (Properties) {id="properties"}

Kotlin 屬性會被轉換為 Swift 屬性：

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

#### 建構函式 (Constructors) {id="constructors"}

建構函式會被轉換為 Swift 初始設定式：

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

### 型別 {id="types"}

#### kotlin.Nothing {id="kotlin-nothing"}

Kotlin `Nothing` 型別會被轉換為 `Never` 型別：

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

#### 分類器型別 (Classifier types) {id="classifier-types"}

Swift export 目前僅支援直接繼承自 `Any` 的 final 類別。

### 套件 (Packages) {id="packages"}

Kotlin 套件會被轉換為巢狀 Swift 列舉以避免名稱衝突：

```kotlin
// Kotlin
// foo.bar 套件中的 bar.kt 檔案
fun callMeMaybe() {}
```

```kotlin
// Kotlin
// foo.baz 套件中的 baz.kt 檔案
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

### 並行 (Concurrency) {id="concurrency"}

#### 暫停函式 (Suspending functions) {id="suspending-functions"}

您可以從 Swift 呼叫 Kotlin 的暫停函式。Kotlin [暫停函式](coroutines-basics.md#suspending-functions) 和暫停功能型別會被匯出為 Swift 相對應的 `async` 版本：

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

#### Flows {id="flows"}

您也可以將 `kotlinx.coroutines` flows 匯出為 Swift 的 [`AsyncSequence`](https://developer.apple.com/documentation/Swift/AsyncSequence)：

```kotlin
// Kotlin
// 匯出 Flow 時保留 String 型別
fun flowOfStrings(): Flow<String> = flowOf("hello", "any", "world")
```

```swift
// Swift
var actual: [String] = []

// 從 Kotlin 推論 String 型別
for try await element in flowOfStrings().asAsyncSequence() {
    actual.append(element)
}
```

#### 協程分派器 (Coroutine dispatchers) {id="coroutine-dispatchers"}

預設情況下，當您從 Swift 呼叫 Kotlin 暫停函式或使用 `asAsyncSequence` 函式時，Kotlin 會建立一個使用 [`Dispatchers.Default`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/-default.html) 分派器的協程上下文，並在該處執行匯出的程式碼。

若要在 [不同的分派器](coroutines-basics.md#coroutine-dispatchers) 上執行匯出的程式碼，請使用 `withContext()` 函式在 Kotlin 中切換協程上下文。例如：

```kotlin
suspend fun runOnMain(): Int = withContext(Dispatchers.Main) {
    delay(10L)
    42
}
```

## 跨語言繼承 {id="cross-language-inheritance"}

Swift export 支援跨語言繼承。此功能的一個常見使用案例是[反向匯入](native-lib-import-stability.md#swift-library-import)模式，即在 Kotlin 中定義協定，並在 Swift 側提供平台特有的實作。當您需要使用無法直接匯入到 Kotlin 中的純 Swift 程式庫時，這特別有用。

若要實作此模式，您需要宣告一個 Kotlin 介面以及一個可供 Swift 實作繼承的 Kotlin 超類別。接著在 Swift 中實作該介面，並將 Swift 物件傳遞給接受該介面的 Kotlin 函式。例如，對於 CryptoKit 程式庫：

1. 在 Kotlin 側，宣告一個介面、一個接受該介面的函式，以及一個 `open` 基底類別：

    ```kotlin
    // Kotlin
    interface CryptoProvider {
        fun hashMD5(input: String): String
    }

    fun processHash(provider: CryptoProvider, input: String): String = provider.hashMD5(input)

    open class SwiftBase
    ```

2. 在 Swift 側，繼承匯出的 `SwiftBase` 類別，使用純 Swift 程式庫實作該介面，並將該物件傳回給 Kotlin：

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
    
    // 呼叫 Kotlin 函式，該函式會回呼 Swift 中的 hashMD5()
    print(processHash(provider: provider, input: "Hello, world!"))
    ```

當 Kotlin 接收到該 Swift 物件時，會將其視為一般 Kotlin 介面的實作，直接呼叫 Swift 程式碼。

## Swift export 的演進 {id="evolution-of-swift-export"}

我們計劃在未來的 Kotlin 版本中擴展並逐步穩定 Swift export，改善 Kotlin 與 Swift 之間的互通性。您可以留下您的回饋：

* 在 Kotlin Slack 中 – [獲取邀請](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up?_gl=1*ju6cbn*_ga*MTA3MTk5NDkzMC4xNjQ2MDY3MDU4*_ga_9J976DJZ68*MTY1ODMzNzA3OS4xMDAuMS4xNjU4MzQwODEwLjYw) 並加入 [#swift-export](https://kotlinlang.slack.com/archives/C073GUW6WN9) 頻道。
* 在 [YouTrack](https://kotl.in/issue) 中回報問題。