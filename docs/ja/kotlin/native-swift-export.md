[//]: # (title: Swift exportを使用したSwiftとの相互運用性)

<primary-label ref="alpha"/>

Swift exportを使用したKotlinとSwiftとの相互運用性は、現在Alpha版です。Swift exportにより、Kotlinソースを直接エクスポートし、Objective-Cヘッダーを必要とせずに、SwiftからKotlinコードをSwiftらしい方法（idiomatically）で呼び出すことができます。

Swift exportにより、Appleターゲット向けのマルチプラットフォーム開発がより効率的になります。例えば、トップレベル関数を持つKotlinモジュールがある場合、Swift exportを使用することで、Objective-C由来の紛らわしいアンダースコアやマングルされた名前を排除し、クリーンでモジュール固有のインポートが可能になります。

現在のSwift exportの機能は以下の通りです：

* **マルチモジュール対応**。各Kotlinモジュールは個別のSwiftモジュールとしてエクスポートされるため、関数呼び出しが簡素化されます。
* **パッケージのサポート**。Kotlinのパッケージはエクスポート中も明示的に保持され、生成されたSwiftコード内での名前の衝突を回避します。
* **型エイリアス**。Kotlinの型エイリアスはエクスポートされSwiftでも保持されるため、可読性が向上します。
* **プリミティブに対する強化されたNull許容性**。Null許容性を保持するために`Int?`のような型を`KotlinInt`のようなラッパークラスにボクシングする必要があったObjective-C相互運用とは異なり、Swift exportはNull許容性の情報を直接変換します。
* **オーバーロード**。Kotlinのオーバーロードされた関数を、曖昧さなくSwiftで呼び出すことができます。
* **パッケージ構造のフラット化**。KotlinのパッケージをSwiftのenumに変換し、生成されたSwiftコードからパッケージプレフィックスを削除できます。
* **モジュール名のカスタマイズ**。KotlinプロジェクトのGradle設定で、生成されるSwiftモジュール名をカスタマイズできます。
* **並行処理のサポート**。SwiftからKotlinの中断コード（suspending code）をシームレスに呼び出すことができ、`kotlinx.coroutines`のFlowをSwiftの`AsyncSequence`としてそのままエクスポートできます。

## Swift exportを有効にする {id="enable-swift-export"}

Swift exportは現在[Alpha](components-stability.md#stability-levels-explained)版であり、まだ不完全なため、破壊的変更が予想されます。
試してみるには、Kotlinプロジェクトの[ビルドファイルを設定](#configure-kotlin-project)し、Swift exportを統合するための[Xcodeのセットアップ](#configure-xcode-project)を行ってください。

### Kotlinプロジェクトの設定 {id="configure-kotlin-project"}

Swift exportをセットアップするための開始点として、プロジェクトで以下のビルドファイルを使用できます。

```kotlin
// build.gradle.kts
kotlin {

    iosArm64()
    iosSimulatorArm64()

    swiftExport {
        // ルートモジュール名を設定
        moduleName = "Shared"

        // 折り畳みルール（collapse rule）を設定
        // 生成されたSwiftコードからパッケージプレフィックスを削除
        flattenPackage = "com.example.sandbox"

        // 外部モジュールのエクスポートを設定
        export(project(":subproject")) {
            // エクスポートされるモジュールの名前を設定 
            moduleName = "Subproject"
            // エクスポートされる依存関係の折り畳みルールを設定 
            flattenPackage = "com.subproject.library"
        }

        // リンクタスクにコンパイラ引数を提供
        configure {
            freeCompilerArgs.add("-Xexpect-actual-classes")
        }
    }
}
```

Kotlinコンパイラは、必要なすべてのファイル（`swiftmodule`ファイル、静的ライブラリ`.a`、ヘッダーファイル、`modulemap`ファイルを含む）を自動的に生成し、アプリのビルドディレクトリにコピーします。これらにはXcodeからアクセスできます。

> すでにSwift exportがセットアップされている[公開サンプル](https://github.com/Kotlin/swift-export-sample)をクローンすることもできます。
>
{style="tip"}

### Xcodeプロジェクトの設定 {id="configure-xcode-project"}

XcodeでプロジェクトにSwift exportを統合するように設定するには：

1. Xcodeでプロジェクト設定を開きます。
2. **Build Phases**タブで、`embedAndSignAppleFrameworkForXcode`タスクを含む**Run Script**フェーズを探します。
3. 実行スクリプトフェーズのスクリプトを、`embedSwiftExportForXcode`タスクに置き換えます。

   ```bash
   ./gradlew :<Shared module name>:embedSwiftExportForXcode
   ```

   ![Swift exportスクリプトの追加](xcode-swift-export-run-script-phase.png){width=700}

4. プロジェクトをビルドします。ビルドにより、出力ディレクトリにSwiftモジュールが生成されます。

## 現在の制限事項 {id="current-limitations"}

Swift exportは現在、iOSフレームワークをXcodeプロジェクトに接続するために[直接統合（direct integration）](https://kotlinlang.org/docs/multiplatform/multiplatform-direct-integration.html)を使用しているプロジェクトでのみ動作します。
これは、IntelliJ IDEAのKotlin Multiplatformプラグインや[Webウィザード](https://kmp.jetbrains.com/)で作成されたKotlin Multiplatformプロジェクトの標準的な構成です。

その他の既知の問題：

* `List`、`Set`、または`Map`を継承する型は、エクスポート時に無視されます（[KT-80416](https://youtrack.jetbrains.com/issue/KT-80416)）。
* `List`、`Set`、または`Map`の継承クラスは、Swift側でインスタンス化できません（[KT-80417](https://youtrack.jetbrains.com/issue/KT-80417)）。
* Swiftにエクスポートされる際、Kotlinのジェネリック型パラメータは、その上限境界（upper bounds）へと型消去（type-erase）されます。
* IDEの移行ヒントや自動化は利用できません。
* オプトイン（opt-in）を必要とする宣言を使用する場合、Gradleビルドファイルで_モジュールレベル_の明示的な`optIn`コンパイラオプションを追加する必要があります。例えば、`kotlinx.datetime`ライブラリの場合は以下のようになります。

  ```kotlin
  swiftExport {
      moduleName = "Shared"

      export("org.jetbrains.kotlinx:kotlinx-datetime:%dateTimeVersion%") {
          moduleName = "KotlinDateTime"
          flattenPackage = "kotlinx.datetime"
      }
  }

  // モジュールレベルで個別のopt-inブロックを追加
  compilerOptions {
      optIn.add("kotlin.time.ExperimentalTime")
  }
  ```

## マッピング {id="mappings"}

以下の表は、Kotlinの概念がSwiftにどのようにマッピングされるかを示しています。

| Kotlin                                                            | Swift                          |
|-------------------------------------------------------------------|--------------------------------|
| [`class`](#classes)                                               | `class`                        |
| [`object`](#objects)                                              | `shared`プロパティを持つ`class` |
| [`enum class`](#enums)                                            | `enum`                         |
| [`sealed` classes and interfaces](#sealed-classes-and-interfaces) | `enum`                         |
| [`typealias`](#type-aliases)                                      | `typealias`                    |
| [関数](#functions)                                                | 関数                           |
| [`suspend fun`](#suspending-functions)                            | `async`                        |
| [`kotlinx.coroutines` flows](#flows)                              | `AsyncSequence`                |
| [プロパティ](#properties)                                         | プロパティ                     |
| [コンストラクタ](#constructors)                                   | イニシャライザ                 |
| [パッケージ](#packages)                                           | ネストされたenum               |
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
| `Any`                                                             | `KotlinBase` クラス            |
| `Unit`                                                            | `Void`                         |
| [`Nothing`](#kotlin-nothing)                                      | `Never`                        |

### 宣言 {id="declarations"}

#### クラス {id="classes"}

Swift exportは、`class Foo()`のように、`Any`を直接継承するfinalクラスのみをサポートしています。
これらは、特別な`KotlinBase`クラスを継承するSwiftクラスに変換されます。

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

#### オブジェクト {id="objects"}

オブジェクトは、プライベートな`init`とstaticな`shared`アクセサを持つSwiftクラスに変換されます。

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

#### 型エイリアス {id="type-aliases"}

Kotlinの型エイリアスは、そのままエクスポートされます。

```kotlin
// Kotlin
typealias MyInt = Int
```

```swift
// Swift
public typealias MyInt = Swift.Int32
```

#### Enum {id="enums"}

Kotlinの`enum class`宣言は、通常のネイティブなSwiftの`enum`型としてエクスポートされます。

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

#### sealedクラスとインターフェース {id="sealed-classes-and-interfaces"}

Kotlinで定義されたsealed階層はSwiftのenumにマッピングされ、網羅的な（exhaustive）`switch`文が可能になります。

Swift exportは、各sealed型に対して`.sealedType()`メソッドを生成します。このメソッドは、sealed階層の直接のサブクラスに対応するケース（case）を持つSwiftのenumを返します。これらの呼び出しをネストして、階層のより深いレベルに一致させることもできます。

例えば、Kotlinでクラス階層を持つsealedインターフェースを宣言します。

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

Swift側では、`default`ケースなしで網羅的な`switch`を使用できます。

```swift
// Swift
let shape = createCircle()

let name = switch shape.sealedType() {
    case let .circle(type): "It's a \(type.value)"
    case let .rectangle(type): "It's a \(type.value)"
}
// name == "It's a Circle"
```

`switch`が網羅的であるため、sealed階層に新しいサブクラスが追加されるとコンパイラが警告を出します。これにより、`switch`の`default`ケースに頼る代わりに、即座に対応することができます。

#### 関数 {id="functions"}

Swift exportは、単純なトップレベル関数とメソッドをサポートしています。

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

Kotlinの拡張関数の場合、レシーバーパラメータは最初の位置にある通常のSwiftパラメータになります。

```kotlin
// Kotlin
fun Int.foo(): Unit = TODO()
```

```swift
// Swift
func foo(_ receiver: Int32) {}
```

Kotlinの[`vararg`](functions.md#variable-number-of-arguments-varargs)付きの関数は、Swiftの可変長引数関数パラメータにマッピングされます。

```kotlin
// Kotlin
fun log(vararg messages: String)
```

```swift
// Swift
public func log(messages: Swift.String...)
```

> * [`operator` 修飾子](operator-overloading.md)を持つ関数のサポートは、現在制限されています。
> * ジェネリック型は一般的にサポートされていません。
>
{style="note"}

#### プロパティ {id="properties"}

Kotlinのプロパティは、Swiftのプロパティに変換されます。

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

#### コンストラクタ {id="constructors"}

コンストラクタは、Swiftのイニシャライザに変換されます。

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

### 型 {id="types"}

#### kotlin.Nothing {id="kotlin-nothing"}

Kotlinの`Nothing`型は、`Never`型に変換されます。

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

#### クラシファイア型 {id="classifier-types"}

Swift exportは現在、`Any`を直接継承するfinalクラスのみをサポートしています。

### パッケージ {id="packages"}

Kotlinのパッケージは、名前の衝突を避けるためにネストされたSwiftのenumに変換されます。

```kotlin
// Kotlin
// foo.barパッケージ内のbar.ktファイル
fun callMeMaybe() {}
```

```kotlin
// Kotlin
// foo.bazパッケージ内のbaz.ktファイル
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

### 並行処理 {id="concurrency"}

#### 中断関数 {id="suspending-functions"}

SwiftからKotlinの中断コードを呼び出すことができます。Kotlinの[中断関数（suspending functions）](coroutines-basics.md#suspending-functions)および中断関数型は、Swiftの`async`対応としてエクスポートされます。

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

`kotlinx.coroutines`のFlowをSwiftの[`AsyncSequence`](https://developer.apple.com/documentation/Swift/AsyncSequence)としてエクスポートすることもできます。

```kotlin
// Kotlin
// Flowのエクスポート時にString型を保持
fun flowOfStrings(): Flow<String> = flowOf("hello", "any", "world")
```

```swift
// Swift
var actual: [String] = []

// KotlinからString型を推論
for try await element in flowOfStrings().asAsyncSequence() {
    actual.append(element)
}
```

#### コルーチンディスパッチャ {id="coroutine-dispatchers"}

デフォルトでは、SwiftからKotlinの中断関数を呼び出すか、`asAsyncSequence`関数を使用すると、Kotlinは[`Dispatchers.Default`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/-default.html)ディスパッチャを使用するコルーチンコンテキストを作成し、そこでエクスポートされたコードを実行します。

エクスポートされたコードを[別のディスパッチャ](coroutines-basics.md#coroutine-dispatchers)で実行するには、Kotlin側で`withContext()`関数を使用してコルーチンコンテキストを切り替えます。例えば：

```kotlin
suspend fun runOnMain(): Int = withContext(Dispatchers.Main) {
    delay(10L)
    42
}
```

## 言語を跨いだ継承 {id="cross-language-inheritance"}

Swift exportは言語を跨いだ継承（Cross-language inheritance）をサポートしています。この機能の一般的なユースケースは[リバースインポート（reverse import）](native-lib-import-stability.md#swift-library-import)パターンであり、Kotlinでコントラクトを定義し、Swift側でプラットフォーム固有の実装を提供します。これは、Kotlinに直接インポートできない純粋なSwiftライブラリを使用する必要がある場合に特に役立ちます。

このパターンを実装するには、Swift実装が継承できるKotlinインターフェースとKotlinスーパークラスを宣言する必要があります。その後、Swiftでインターフェースを実装し、そのインターフェースを受け取るKotlin関数にSwiftオブジェクトを渡します。例えば、CryptoKitライブラリの場合は以下のようになります。

1. Kotlin側で、インターフェース、それを受け取る関数、および`open`なベースクラスを宣言します。

    ```kotlin
    // Kotlin
    interface CryptoProvider {
        fun hashMD5(input: String): String
    }

    fun processHash(provider: CryptoProvider, input: String): String = provider.hashMD5(input)

    open class SwiftBase
    ```

2. Swift側で、エクスポートされた`SwiftBase`クラスを継承し、純粋なSwiftライブラリを使用してインターフェースを実装し、そのオブジェクトをKotlinに渡します。

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
    
    // Kotlin関数を呼び出し、それがSwift側のhashMD5()を呼び戻す
    print(processHash(provider: provider, input: "Hello, world!"))
    ```

KotlinがSwiftオブジェクトを受け取ると、通常のKotlinインターフェースの実装として扱い、Swiftコードを直接呼び出します。

## Swift exportの進化 {id="evolution-of-swift-export"}

今後のKotlinリリースにおいて、Swift exportを拡大し、徐々に安定化させていく予定です。これによりKotlinとSwift間の相互運用性を向上させます。フィードバックをお寄せください：

* Kotlin Slackで – [招待を受け取り](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up?_gl=1*ju6cbn*_ga*MTA3MTk5NDkzMC4xNjQ2MDY3MDU4*_ga_9J976DJZ68*MTY1ODMzNzA3OS4xMDAuMS4xNjU4MzQwODEwLjYw)、[#swift-export](https://kotlinlang.slack.com/archives/C073GUW6WN9)チャンネルに参加してください。
* [YouTrack](https://kotl.in/issue)で問題を報告してください。