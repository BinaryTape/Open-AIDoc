[//]: # (title: Swift export를 사용한 Swift와의 상호운용성)

<primary-label ref="alpha"/>

Swift export를 통한 Kotlin과 Swift의 상호운용성은 현재 알파(Alpha) 단계입니다. Swift export를 사용하면 Kotlin 소스를 직접 내보내고 Swift에서 관용적(idiomatically)으로 Kotlin 코드를 호출할 수 있으며, Objective-C 헤더가 필요하지 않습니다.

Swift export는 Apple 타겟을 위한 멀티플랫폼 개발을 더욱 효율적으로 만들어 줍니다. 예를 들어, 최상위 함수(top-level functions)가 포함된 Kotlin 모듈이 있는 경우, Swift export를 사용하면 혼란스러운 Objective-C의 언더스코어(_)나 맹글링된 이름(mangled names) 없이 깔끔하고 모듈에 특화된 임포트(import)가 가능합니다.

현재 Swift export의 기능은 다음과 같습니다:

* **다중 모듈 지원(Multi-module support)**. 각 Kotlin 모듈은 별도의 Swift 모듈로 내보내지므로 함수 호출이 간소화됩니다.
* **패키지 지원(Package support)**. Kotlin 패키지가 내보내기 중에 명시적으로 보존되어, 생성된 Swift 코드에서의 이름 충돌을 방지합니다.
* **타입 별칭(Type aliases)**. Kotlin의 타입 별칭(`typealias`)이 Swift로 내보내지고 유지되어 가독성이 향상됩니다.
* **기본 타입에 대한 향상된 null 가능성(nullability) 지원**. null 가능성을 유지하기 위해 `Int?`와 같은 타입을 `KotlinInt`와 같은 래퍼 클래스로 박싱해야 했던 Objective-C 상호운용성과 달리, Swift export는 null 가능성 정보를 직접 변환합니다.
* **오버로드(Overloads)**. Swift에서 모호함 없이 Kotlin의 오버로드된 함수를 호출할 수 있습니다.
* **패키지 구조 평탄화(Flattened package structure)**. Kotlin 패키지를 Swift 열거형(enum)으로 변환하여, 생성된 Swift 코드에서 패키지 접두사를 제거할 수 있습니다.
* **모듈 이름 커스텀**. Kotlin 프로젝트의 Gradle 설정에서 생성되는 Swift 모듈 이름을 커스텀할 수 있습니다.
* **동시성 지원(Concurrency support)**. Swift에서 중단되는(suspending) Kotlin 코드를 매끄럽게 호출할 수 있으며, `kotlinx.coroutines` 플로우를 별도의 설정 없이 Swift의 `AsyncSequence`로 내보낼 수 있습니다.

## Swift export 활성화하기 {id="enable-swift-export"}

Swift export는 현재 [알파(Alpha)](components-stability.md#stability-levels-explained) 단계이며 아직 미완성 상태이므로, 파괴적 변경(breaking changes)이 발생할 수 있습니다. 이 기능을 사용해 보려면 Kotlin 프로젝트에서 [빌드 파일을 구성](#configure-kotlin-project)하고, Swift export를 통합하도록 [Xcode를 설정](#configure-xcode-project)하세요.

### Kotlin 프로젝트 설정 {id="configure-kotlin-project"}

Swift export 설정을 시작하기 위해 프로젝트에서 다음 빌드 파일을 참고할 수 있습니다:

```kotlin
// build.gradle.kts
kotlin {

    iosArm64()
    iosSimulatorArm64()

    swiftExport {
        // 루트 모듈 이름 설정
        moduleName = "Shared"

        // 평탄화(collapse) 규칙 설정
        // 생성된 Swift 코드에서 패키지 접두사 제거
        flattenPackage = "com.example.sandbox"

        // 외부 모듈 내보내기 설정
        export(project(":subproject")) {
            // 내보낼 모듈의 이름 설정 
            moduleName = "Subproject"
            // 내보낼 종속성에 대한 평탄화 규칙 설정 
            flattenPackage = "com.subproject.library"
        }

        // 링크 태스크에 컴파일러 인자 제공
        configure {
            freeCompilerArgs.add("-Xexpect-actual-classes")
        }
    }
}
```

Kotlin 컴파일러는 필요한 모든 파일(`swiftmodule` 파일, 정적 `.a` 라이브러리, 헤더 파일, `modulemap` 파일 포함)을 자동으로 생성하고 이를 앱의 빌드 디렉토리에 복사하며, Xcode에서 이 디렉토리에 접근할 수 있습니다.

> Swift export가 이미 설정된 [공식 샘플](https://github.com/Kotlin/swift-export-sample)을 클론하여 확인할 수도 있습니다.
>
{style="tip"}

### Xcode 프로젝트 설정 {id="configure-xcode-project"}

프로젝트에 Swift export를 통합하도록 Xcode를 설정하는 방법은 다음과 같습니다:

1. Xcode에서 프로젝트 설정을 엽니다.
2. **Build Phases** 탭에서 `embedAndSignAppleFrameworkForXcode` 태스크가 포함된 **Run Script** 페이즈를 찾습니다.
3. 해당 실행 스크립트 페이즈의 스크립트를 `embedSwiftExportForXcode` 태스크로 교체합니다:

   ```bash
   ./gradlew :<Shared module name>:embedSwiftExportForXcode
   ```

   ![Swift export 스크립트 추가](xcode-swift-export-run-script-phase.png){width=700}

4. 프로젝트를 빌드합니다. 빌드가 완료되면 출력 디렉토리에 Swift 모듈이 생성됩니다.

## 현재 제한 사항 {id="current-limitations"}

현재 Swift export는 iOS 프레임워크를 Xcode 프로젝트에 연결하기 위해 [직접 통합(direct integration)](https://kotlinlang.org/docs/multiplatform/multiplatform-direct-integration.html) 방식을 사용하는 프로젝트에서만 작동합니다. 이는 IntelliJ IDEA의 Kotlin Multiplatform 플러그인이나 [웹 위저드](https://kmp.jetbrains.com/)를 통해 생성된 Kotlin Multiplatform 프로젝트의 표준 구성입니다.

기타 알려진 문제:

* `List`, `Set`, `Map`을 상속하는 타입은 내보내기 중에 무시됩니다 ([KT-80416](https://youtrack.jetbrains.com/issue/KT-80416)).
* `List`, `Set`, `Map`의 상속자는 Swift 측에서 인스턴스화할 수 없습니다 ([KT-80417](https://youtrack.jetbrains.com/issue/KT-80417)).
* Swift로 내보낼 때 Kotlin 제네릭 타입 파라미터는 상한(upper bounds) 타입으로 타입 제거(type-erased)됩니다.
* IDE 마이그레이션 팁이나 자동화 도구는 제공되지 않습니다.
* 옵트인(opt-in)이 필요한 선언을 사용할 때는 Gradle 빌드 파일의 _모듈 레벨_에서 명시적인 `optIn` 컴파일러 옵션을 추가해야 합니다. 예를 들어, `kotlinx.datetime` 라이브러리의 경우 다음과 같습니다:

  ```kotlin
  swiftExport {
      moduleName = "Shared"

      export("org.jetbrains.kotlinx:kotlinx-datetime:%dateTimeVersion%") {
          moduleName = "KotlinDateTime"
          flattenPackage = "kotlinx.datetime"
      }
  }

  // 모듈 레벨에 별도의 opt-in 블록 추가
  compilerOptions {
      optIn.add("kotlin.time.ExperimentalTime")
  }
  ```

## 매핑(Mappings) {id="mappings"}

아래 표는 Kotlin 개념이 Swift로 어떻게 매핑되는지 보여줍니다.

| Kotlin                                                            | Swift                          |
|-------------------------------------------------------------------|--------------------------------|
| [`class`](#classes)                                               | `class`                        |
| [`object`](#objects)                                              | `shared` 프로퍼티를 가진 `class` |
| [`enum class`](#enums)                                            | `enum`                         |
| [`sealed` 클래스 및 인터페이스](#sealed-classes-and-interfaces)     | `enum`                         |
| [`typealias`](#type-aliases)                                      | `typealias`                    |
| [함수(Function)](#functions)                                       | 함수(Function)                  |
| [`suspend fun`](#suspending-functions)                            | `async`                        |
| [`kotlinx.coroutines` flows](#flows)                              | `AsyncSequence`                |
| [프로퍼티(Property)](#properties)                                   | 프로퍼티(Property)               |
| [생성자(Constructor)](#constructors)                               | 이니셜라이저(Initializer)        |
| [패키지(Package)](#packages)                                       | 중첩된 열거형(Nested enum)        |
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
| `Any`                                                             | `KotlinBase` 클래스             |
| `Unit`                                                            | `Void`                         |
| [`Nothing`](#kotlin-nothing)                                      | `Never`                        |

### 선언(Declarations) {id="declarations"}

#### 클래스(Classes) {id="classes"}

Swift export는 `class Foo()`와 같이 `Any`를 직접 상속하는 final 클래스만 지원합니다. 이들은 특별한 `KotlinBase` 클래스를 상속하는 Swift 클래스로 변환됩니다.

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

#### 객체(Objects) {id="objects"}

객체(object)는 private `init`과 static `shared` 접근자를 가진 Swift 클래스로 변환됩니다.

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

#### 타입 별칭(Type aliases) {id="type-aliases"}

Kotlin의 타입 별칭은 있는 그대로 내보내집니다.

```kotlin
// Kotlin
typealias MyInt = Int
```

```swift
// Swift
public typealias MyInt = Swift.Int32
```

#### 열거형(Enums) {id="enums"}

Kotlin의 `enum class` 선언은 일반적인 네이티브 Swift `enum` 타입으로 내보내집니다.

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

#### 봉인된 클래스 및 인터페이스(Sealed classes and interfaces) {id="sealed-classes-and-interfaces"}

Kotlin에 정의된 봉인된(sealed) 계층 구조는 Swift 열거형(enum)으로 매핑되어 완전한(exhaustive) `switch` 문을 사용할 수 있게 해줍니다.

Swift export는 각 sealed 타입에 `.sealedType()` 메서드를 생성합니다. 이 메서드는 sealed 계층 구조의 직접적인 서브클래스들과 일치하는 케이스를 가진 Swift enum을 반환합니다. 더 깊은 계층 구조와 매칭하기 위해 이러한 호출을 중첩할 수도 있습니다.

예를 들어, Kotlin에서 다음과 같이 클래스 계층 구조를 가진 sealed interface를 선언합니다:

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

Swift 측에서는 `default` 케이스 없이 완전한(exhaustive) `switch`를 사용할 수 있습니다:

```swift
// Swift
let shape = createCircle()

let name = switch shape.sealedType() {
    case let .circle(type): "It's a \(type.value)"
    case let .rectangle(type): "It's a \(type.value)"
}
// name == "It's a Circle"
```

`switch` 문이 완전(exhaustive)하기 때문에, sealed 계층 구조에 새로운 서브클래스가 추가되면 컴파일러가 경고를 표시하므로, `switch`의 `default` 케이스에 의존하는 대신 이를 즉시 처리할 수 있습니다.

#### 함수(Functions) {id="functions"}

Swift export는 간단한 최상위 함수와 메서드를 지원합니다.

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

Kotlin의 확장 함수(extension functions)의 경우, 수신 객체(receiver) 파라미터가 첫 번째 위치의 일반 Swift 파라미터가 됩니다.

```kotlin
// Kotlin
fun Int.foo(): Unit = TODO()
```

```swift
// Swift
func foo(_ receiver: Int32) {}
```

Kotlin의 [`vararg`](functions.md#variable-number-of-arguments-varargs) 함수는 Swift의 가변 파라미터(variadic parameters)로 매핑됩니다.

```kotlin
// Kotlin
fun log(vararg messages: String)
```

```swift
// Swift
public func log(messages: Swift.String...)
```

> * [`operator` 수정자](operator-overloading.md)가 포함된 함수에 대한 지원은 현재 제한적입니다.
> * 제네릭 타입은 일반적으로 지원되지 않습니다.
>
{style="note"}

#### 프로퍼티(Properties) {id="properties"}

Kotlin 프로퍼티는 Swift 프로퍼티로 변환됩니다.

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

#### 생성자(Constructors) {id="constructors"}

생성자는 Swift 이니셜라이저로 변환됩니다.

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

### 타입(Types) {id="types"}

#### kotlin.Nothing {id="kotlin-nothing"}

Kotlin의 `Nothing` 타입은 Swift의 `Never` 타입으로 변환됩니다.

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

#### 분류자 타입(Classifier types) {id="classifier-types"}

Swift export는 현재 `Any`를 직접 상속하는 final 클래스만 지원합니다.

### 패키지(Packages) {id="packages"}

이름 충돌을 피하기 위해 Kotlin 패키지는 중첩된 Swift 열거형(enum)으로 변환됩니다.

```kotlin
// Kotlin
// foo.bar 패키지의 bar.kt 파일
fun callMeMaybe() {}
```

```kotlin
// Kotlin
// foo.baz 패키지의 baz.kt 파일
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

### 동시성(Concurrency) {id="concurrency"}

#### 중단 함수(Suspending functions) {id="suspending-functions"}

Swift에서 중단되는(suspending) Kotlin 코드를 호출할 수 있습니다. Kotlin [중단 함수(suspending functions)](coroutines-basics.md#suspending-functions) 및 중단 함수형 타입은 Swift의 대응되는 `async`로 내보내집니다.

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

#### 플로우(Flows) {id="flows"}

`kotlinx.coroutines` 플로우를 Swift의 [`AsyncSequence`](https://developer.apple.com/documentation/Swift/AsyncSequence)로 내보낼 수도 있습니다.

```kotlin
// Kotlin
// Flow를 내보낼 때 String 타입을 유지합니다.
fun flowOfStrings(): Flow<String> = flowOf("hello", "any", "world")
```

```swift
// Swift
var actual: [String] = []

// Kotlin으로부터 String 타입을 추론합니다.
for try await element in flowOfStrings().asAsyncSequence() {
    actual.append(element)
}
```

#### 코루틴 디스패처(Coroutine dispatchers) {id="coroutine-dispatchers"}

기본적으로 Swift에서 Kotlin 중단 함수를 호출하거나 `asAsyncSequence` 함수를 사용할 때, Kotlin은 [`Dispatchers.Default`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/-default.html) 디스패처를 사용하고 내보낸 코드를 실행하는 코루틴 컨텍스트를 생성합니다.

내보낸 코드를 [다른 디스패처](coroutines-basics.md#coroutine-dispatchers)에서 실행하려면, Kotlin에서 `withContext()` 함수를 사용하여 코루틴 컨텍스트를 전환하세요. 예를 들어:

```kotlin
suspend fun runOnMain(): Int = withContext(Dispatchers.Main) {
    delay(10L)
    42
}
```

## 언어 간 상속(Cross-language inheritance) {id="cross-language-inheritance"}

Swift export는 언어 간 상속을 지원합니다. 이 기능의 대표적인 사용 사례는 Kotlin에서 계약(contract)을 정의하고 Swift 측에서 플랫폼별 구현을 제공하는 [역방향 임포트(reverse import)](native-lib-import-stability.md#swift-library-import) 패턴입니다. 이는 Kotlin으로 직접 임포트할 수 없는 순수 Swift 라이브러리를 사용해야 할 때 특히 유용합니다.

이 패턴을 구현하려면, Swift 구현체가 상속할 수 있는 Kotlin 인터페이스와 Kotlin 슈퍼클래스를 선언해야 합니다. 그런 다음 Swift에서 인터페이스를 구현하고, 해당 인터페이스를 허용하는 Kotlin 함수로 Swift 객체를 전달합니다. 예를 들어 CryptoKit 라이브러리의 경우 다음과 같습니다:

1. Kotlin 측에서 인터페이스, 이를 파라미터로 받는 함수, 그리고 `open` 기본 클래스를 선언합니다:

    ```kotlin
    // Kotlin
    interface CryptoProvider {
        fun hashMD5(input: String): String
    }

    fun processHash(provider: CryptoProvider, input: String): String = provider.hashMD5(input)

    open class SwiftBase
    ```

2. Swift 측에서는 내보낸 `SwiftBase` 클래스를 상속하고, 순수 Swift 라이브러리를 사용하여 인터페이스를 구현한 다음, 해당 객체를 다시 Kotlin으로 전달합니다:

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
    
    // Kotlin 함수를 호출하고, 이 함수는 Swift의 hashMD5()를 다시 호출합니다
    print(processHash(provider: provider, input: "Hello, world!"))
    ```

Kotlin이 Swift 객체를 수신하면 일반 Kotlin 인터페이스의 구현체처럼 취급하여 Swift 코드를 직접 호출합니다.

## Swift export의 발전 방향 {id="evolution-of-swift-export"}

향후 Kotlin 릴리스에서 Swift export를 확장하고 점진적으로 안정화하여 Kotlin과 Swift 간의 상호운용성을 개선할 계획입니다. 다음 채널을 통해 의견을 남겨주세요:

* Kotlin Slack – [초대 받기](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up?_gl=1*ju6cbn*_ga*MTA3MTk5NDkzMC4xNjQ2MDY3MDU4*_ga_9J976DJZ68*MTY1ODMzNzA3OS4xMDAuMS4xNjU4MzQwODEwLjYw) 후 [#swift-export](https://kotlinlang.slack.com/archives/C073GUW6WN9) 채널에 참여하세요.
* [YouTrack](https://kotl.in/issue)에 이슈를 제보해 주세요.