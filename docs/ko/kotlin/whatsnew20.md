[//]: # (title: Kotlin 2.0.0의 새로운 기능)

<web-summary>새로운 언어 기능, Kotlin Multiplatform, JVM, Native, JS 및 Wasm의 업데이트, 그리고 Gradle과 Maven 빌드 도구 지원을 다루는 Kotlin 2.0.0 릴리스 노트를 확인하세요.</web-summary>

_[출시일: 2024년 5월 21일](releases.md#release-history)_

Kotlin 2.0.0 릴리스가 출시되었으며 새로운 [Kotlin K2 컴파일러](#kotlin-k2-compiler)가 안정화(Stable)되었습니다! 또한, 이번 릴리스의 주요 하이라이트는 다음과 같습니다:

* [새로운 Compose 컴파일러 Gradle 플러그인](#new-compose-compiler-gradle-plugin)
* [invokedynamic을 사용한 람다 함수 생성](#generation-of-lambda-functions-using-invokedynamic)
* [kotlinx-metadata-jvm 라이브러리 안정화](#the-kotlinx-metadata-jvm-library-is-stable)
* [Apple 플랫폼에서 사인포스트(signposts)를 통한 Kotlin/Native GC 성능 모니터링](#monitoring-gc-performance-with-signposts-on-apple-platforms)
* [Objective-C 메서드와의 충돌 해결](#resolving-conflicts-with-objective-c-methods)
* [Kotlin/Wasm의 네임드 엑스포트(named export) 지원](#support-for-named-export)
* [Kotlin/Wasm의 @JsExport 함수에서 부호 없는 기본형 타입 지원](#support-for-unsigned-primitive-types-in-functions-with-jsexport)
* [Binaryen을 사용하여 기본적으로 프로덕션 빌드 최적화](#optimized-production-builds-by-default-using-binaryen)
* [멀티플랫폼 프로젝트의 컴파일러 옵션을 위한 새로운 Gradle DSL](#new-gradle-dsl-for-compiler-options-in-multiplatform-projects)
* [enum 클래스 values 제네릭 함수의 안정적인 대체](#stable-replacement-of-the-enum-class-values-generic-function)
* [AutoCloseable 인터페이스 안정화](#stable-autocloseable-interface)

Kotlin 2.0은 JetBrains 팀에게 거대한 이정표입니다. 이번 릴리스는 KotlinConf 2024의 중심이었습니다. 흥미로운 업데이트를 발표하고 Kotlin 언어의 최근 작업들을 다룬 오프닝 키노트를 확인해 보세요:

<video src="https://www.youtube.com/v/Ar73Axsz2YA" title="KotlinConf'24 - Keynote"/>

> Kotlin 릴리스 주기에 대한 정보는 [Kotlin 릴리스 프로세스](releases.md)를 참조하세요.
>
{style="tip"}

## IDE 지원

Kotlin 2.0.0을 지원하는 Kotlin 플러그인은 최신 IntelliJ IDEA 및 Android Studio에 내장되어 있습니다. IDE에서 Kotlin 플러그인을 별도로 업데이트할 필요는 없습니다. 빌드 스크립트에서 [Kotlin 버전을 Kotlin 2.0.0으로 변경](releases.md#update-to-a-new-kotlin-version)하기만 하면 됩니다.

* IntelliJ IDEA의 Kotlin K2 컴파일러 지원에 대한 자세한 내용은 [IDE 지원](#support-in-ides)을 참조하세요.
* IntelliJ IDEA의 Kotlin 지원에 대한 자세한 내용은 [Kotlin 릴리스](releases.md#ide-support)를 참조하세요.

## Kotlin K2 컴파일러

K2 컴파일러로 향하는 길은 멀었지만, 이제 JetBrains 팀은 마침내 안정화 소식을 전하게 되었습니다. Kotlin 2.0.0에서는 새로운 Kotlin K2 컴파일러가 기본적으로 사용되며, JVM, Native, Wasm, JS 등 모든 타겟 플랫폼에서 [안정화(Stable)](components-stability.md)되었습니다. 새로운 컴파일러는 대대적인 성능 향상을 가져오고, 새로운 언어 기능 개발 속도를 높이며, Kotlin이 지원하는 모든 플랫폼을 통합하고, 멀티플랫폼 프로젝트를 위한 더 나은 아키텍처를 제공합니다.

JetBrains 팀은 엄선된 사용자 및 내부 프로젝트에서 1,000만 줄의 코드를 성공적으로 컴파일하여 새 컴파일러의 품질을 확인했습니다. 18,000명의 개발자가 안정화 프로세스에 참여하여 총 80,000개의 프로젝트에서 새로운 K2 컴파일러를 테스트하고 발견된 문제를 보고했습니다.

새로운 컴파일러로의 전환 과정을 최대한 원활하게 돕기 위해 [K2 컴파일러 마이그레이션 가이드](k2-compiler-migration-guide.md)를 작성했습니다. 이 가이드는 컴파일러의 다양한 이점을 설명하고, 발생할 수 있는 변경 사항을 강조하며, 필요한 경우 이전 버전으로 롤백하는 방법을 설명합니다.

[블로그 포스트](https://blog.jetbrains.com/kotlin/2024/04/k2-compiler-performance-benchmarks-and-how-to-measure-them-on-your-projects/)에서 다양한 프로젝트의 K2 컴파일러 성능을 살펴보았습니다. K2 컴파일러의 실제 성능 데이터와 고유 프로젝트의 성능 벤치마크를 수집하는 방법에 대한 지침을 확인해 보세요.

또한, 수석 언어 디자이너인 Michail Zarečenskij가 Kotlin의 기능 진화와 K2 컴파일러에 대해 논의하는 KotlinConf 2024 발표를 시청할 수 있습니다:

<video src="https://www.youtube.com/v/tAGJ5zJXJ7w" title="Kotlin Language Features in 2.0 and Beyond"/>

### 현재 K2 컴파일러의 제한 사항

Gradle 프로젝트에서 K2를 활성화할 때, Gradle 8.3 미만 버전을 사용하는 프로젝트는 다음과 같은 경우에 특정 제한 사항이 발생할 수 있습니다:

* `buildSrc`의 소스 코드 컴파일.
* 포함된 빌드(included builds)의 Gradle 플러그인 컴파일.
* Gradle 8.3 미만 버전 프로젝트에서 사용되는 다른 Gradle 플러그인의 컴파일.
* Gradle 플러그인 의존성 빌드.

위와 같은 문제가 발생하면 다음 단계를 통해 해결할 수 있습니다:

* `buildSrc`, 모든 Gradle 플러그인 및 그 의존성에 대해 언어 버전을 설정합니다:

  ```kotlin
  kotlin {
      compilerOptions {
          languageVersion.set(org.jetbrains.kotlin.gradle.dsl.KotlinVersion.KOTLIN_1_9)
          apiVersion.set(org.jetbrains.kotlin.gradle.dsl.KotlinVersion.KOTLIN_1_9)
      }
  }
  ```

  > 특정 작업(task)에 대해 언어 및 API 버전을 구성하면, 이 값들이 `compilerOptions` 확장에 설정된 값을 덮어씁니다. 이 경우 언어 및 API 버전은 1.9보다 높아서는 안 됩니다.
  >
  {style="note"}

* 프로젝트의 Gradle 버전을 8.3 이상으로 업데이트합니다.

### 스마트 캐스트 개선 사항

Kotlin 컴파일러는 특정 상황에서 객체를 특정 타입으로 자동으로 캐스팅하여 직접 명시적으로 캐스팅해야 하는 번거로움을 덜어줍니다. 이를 [스마트 캐스트(smart casting)](typecasts.md#smart-casts)라고 합니다. Kotlin K2 컴파일러는 이제 이전보다 더 많은 시나리오에서 스마트 캐스트를 수행합니다.

Kotlin 2.0.0에서는 다음 영역에서 스마트 캐스트 관련 개선이 이루어졌습니다:

* [지역 변수 및 이후 스코프](#local-variables-and-further-scopes)
* [논리 or 연산자를 사용한 타입 검사](#type-checks-with-logical-or-operator)
* [인라인 함수](#inline-functions)
* [함수 타입을 가진 프로퍼티](#properties-with-function-types)
* [예외 처리](#exception-handling)
* [증감 연산자](#increment-and-decrement-operators)

#### 지역 변수 및 이후 스코프

이전에는 변수가 `if` 조건 내에서 `null`이 아닌 것으로 평가되면 해당 변수가 스마트 캐스트 되었습니다. 이 변수에 대한 정보는 `if` 블록 스코프 내에서 더 공유되었습니다.

그러나 변수를 `if` 조건 **외부**에서 선언했다면, `if` 조건 내에서 변수에 대한 정보를 사용할 수 없어 스마트 캐스트가 불가능했습니다. 이러한 동작은 `when` 표현식과 `while` 루프에서도 동일하게 나타났습니다.

Kotlin 2.0.0부터는 `if`, `when`, 또는 `while` 조건에서 변수를 사용하기 전에 선언하면, 컴파일러가 수집한 변수에 대한 정보를 해당 블록에서 스마트 캐스트를 위해 사용할 수 있습니다.

이는 불리언 조건을 변수로 추출하고 싶을 때 유용합니다. 변수에 의미 있는 이름을 부여하면 코드 가독성이 향상되고 나중에 코드를 재사용할 수 있습니다. 예를 들어:

```kotlin
class Cat {
    fun purr() {
        println("Purr purr")
    }
}

fun petAnimal(animal: Any) {
    val isCat = animal is Cat
    if (isCat) {
        // Kotlin 2.0.0에서 컴파일러는 isCat에 대한 정보에 접근할 수 있어,
        // animal이 Cat 타입으로 스마트 캐스트 되었음을 알 수 있습니다.
        // 따라서 purr() 함수를 호출할 수 있습니다.
        // Kotlin 1.9.20에서 컴파일러는 스마트 캐스트를 인지하지 못하므로,
        // purr() 함수 호출 시 오류가 발생합니다.
        animal.purr()
    }
}

fun main() {
    val kitty = Cat()
    petAnimal(kitty)
    // Purr purr
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" id="kotlin-smart-casts-k2-local-variables" validate="false"}

#### 논리 or 연산자를 사용한 타입 검사

Kotlin 2.0.0에서는 객체에 대한 타입 검사를 `or` 연산자(`||`)로 결합하면, 그들의 가장 가까운 공통 상위 타입(common supertype)으로 스마트 캐스트가 이루어집니다. 이 변경 전에는 항상 `Any` 타입으로 스마트 캐스트 되었습니다.

이 경우, 프로퍼티에 접근하거나 함수를 호출하기 전에 여전히 수동으로 객체 타입을 다시 확인해야 했습니다. 예를 들어:

```kotlin
interface Status {
    fun signal() {}
}

interface Ok : Status
interface Postponed : Status
interface Declined : Status

fun signalCheck(signalStatus: Any) {
    if (signalStatus is Postponed || signalStatus is Declined) {
        // signalStatus는 공통 상위 타입 Status로 스마트 캐스트 됩니다.
        signalStatus.signal()
        // Kotlin 2.0.0 이전에는 signalStatus가 Any 타입으로 스마트 캐스트 되어,
        // signal() 함수 호출 시 Unresolved reference 오류가 발생했습니다.
        // signal() 함수는 다음과 같이 별도의 타입 확인 후에만 호출 가능했습니다:

        // check(signalStatus is Status)
        // signalStatus.signal()
    }
}
```

> 공통 상위 타입은 유니온 타입(union type)의 **근사치**입니다. Kotlin에서는 [유니온 타입](https://en.wikipedia.org/wiki/Union_type)을 지원하지 않습니다.
>
{style="note"}

#### 인라인 함수

Kotlin 2.0.0에서 K2 컴파일러는 인라인 함수를 다르게 처리하여, 다른 컴파일러 분석과 결합해 스마트 캐스트가 안전한지 결정할 수 있게 합니다.

구체적으로, 인라인 함수는 이제 암시적인 [`callsInPlace`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.contracts/-contract-builder/calls-in-place.html) 계약을 가진 것으로 취급됩니다. 이는 인라인 함수에 전달된 모든 람다 함수가 그 자리에서 호출됨을 의미합니다. 람다가 제자리에서 호출되므로, 컴파일러는 람다 함수가 함수 바디 내에 포함된 변수에 대한 참조를 유출할 수 없음을 알게 됩니다.

컴파일러는 이 지식을 다른 컴파일러 분석과 함께 사용하여 캡처된 변수를 스마트 캐스트 하는 것이 안전한지 결정합니다. 예를 들어:

```kotlin
interface Processor {
    fun process()
}

inline fun inlineAction(f: () -> Unit) = f()

fun nextProcessor(): Processor? = null

fun runProcessor(): Processor? {
    var processor: Processor? = null
    inlineAction {
        // Kotlin 2.0.0에서 컴파일러는 processor가 지역 변수이고,
        // inlineAction()이 인라인 함수이므로 processor에 대한 참조가
        // 유출될 수 없음을 압니다. 따라서 processor를 스마트 캐스트 하는 것이 안전합니다.

        // processor가 null이 아니면 스마트 캐스트 됩니다.
        if (processor != null) {
            // 컴파일러는 processor가 null이 아님을 알기 때문에
            // 안전한 호출(safe call)이 필요하지 않습니다.
            processor.process()

            // Kotlin 1.9.20에서는 안전한 호출을 수행해야 했습니다:
            // processor?.process()
        }

        processor = nextProcessor()
    }

    return processor
}
```

#### 함수 타입을 가진 프로퍼티

이전 버전의 Kotlin에서는 함수 타입을 가진 클래스 프로퍼티가 스마트 캐스트 되지 않는 버그가 있었습니다. Kotlin 2.0.0과 K2 컴파일러에서 이 동작을 수정했습니다. 예를 들어:

```kotlin
class Holder(val provider: (() -> Unit)?) {
    fun process() {
        // Kotlin 2.0.0에서 provider가 null이 아니면
        // provider는 스마트 캐스트 됩니다.
        if (provider != null) {
            // 컴파일러는 provider가 null이 아님을 압니다.
            provider()

            // 1.9.20에서 컴파일러는 provider가 null이 아니라는 것을 알지 못해
            // 오류를 발생시킵니다:
            // Reference has a nullable type '(() -> Unit)?', use explicit '?.invoke()' to make a function-like call instead
        }
    }
}
```

이 변경 사항은 `invoke` 연산자를 오버로드한 경우에도 적용됩니다. 예를 들어:

```kotlin
interface Provider {
    operator fun invoke()
}

interface Processor : () -> String

class Holder(val provider: Provider?, val processor: Processor?) {
    fun process() {
        if (provider != null) {
            provider()
            // 1.9.20에서 컴파일러는 오류를 발생시킵니다:
            // Reference has a nullable type 'Provider?' use explicit '?.invoke()' to make a function-like call instead
        }
    }
}
```

#### 예외 처리

Kotlin 2.0.0에서는 예외 처리를 개선하여 스마트 캐스트 정보가 `catch` 및 `finally` 블록으로 전달될 수 있도록 했습니다. 이 변경으로 컴파일러가 객체가 nullable 타입인지 추적하므로 코드가 더 안전해집니다. 예를 들어:

```kotlin
//sampleStart
fun testString() {
    var stringInput: String? = null
    // stringInput이 String 타입으로 스마트 캐스트 됨
    stringInput = ""
    try {
        // 컴파일러는 stringInput이 null이 아님을 압니다.
        println(stringInput.length)
        // 0

        // 컴파일러는 stringInput에 대한 이전 스마트 캐스트 정보를 거부합니다.
        // 이제 stringInput은 String? 타입입니다.
        stringInput = null

        // 예외 발생
        if (2 > 1) throw Exception()
        stringInput = ""
    } catch (exception: Exception) {
        // Kotlin 2.0.0에서 컴파일러는 stringInput이 null일 수 있음을 알며,
        // stringInput은 nullable 상태를 유지합니다.
        println(stringInput?.length)
        // null

        // Kotlin 1.9.20에서 컴파일러는 안전한 호출이 필요하지 않다고 하지만, 
        // 이는 잘못된 분석입니다.
    }
}

//sampleEnd
fun main() {
    testString()
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" id="kotlin-smart-casts-k2-exception-handling"}

#### 증감 연산자

Kotlin 2.0.0 이전에는 증감 연산자를 사용한 후 객체의 타입이 변경될 수 있음을 컴파일러가 이해하지 못했습니다. 컴파일러가 객체 타입을 정확하게 추적할 수 없었기 때문에 코드에서 unresolved reference 오류가 발생할 수 있었습니다. Kotlin 2.0.0에서 이 문제가 해결되었습니다:

```kotlin
interface Rho {
    operator fun inc(): Sigma = TODO()
}

interface Sigma : Rho {
    fun sigma() = Unit
}

interface Tau {
    fun tau() = Unit
}

fun main(input: Rho) {
    var unknownObject: Rho = input

    // unknownObject가 Tau 인터페이스를 상속하는지 확인합니다.
    // 참고: unknownObject는 Rho와 Tau 인터페이스를 모두 상속할 수 있습니다.
    if (unknownObject is Tau) {

        // Rho 인터페이스의 오버로드된 inc() 연산자를 사용합니다.
        // Kotlin 2.0.0에서 unknownObject의 타입은 Sigma로 스마트 캐스트 됩니다.
        ++unknownObject

        // Kotlin 2.0.0에서 컴파일러는 unknownObject가 Sigma 타입임을 알기에
        // sigma() 함수를 성공적으로 호출할 수 있습니다.
        unknownObject.sigma()

        // Kotlin 1.9.20에서 컴파일러는 inc() 호출 시 스마트 캐스트를 수행하지 않으므로
        // 여전히 unknownObject를 Tau 타입으로 생각합니다. 
        // sigma() 함수 호출 시 컴파일 타임 오류가 발생합니다.
        
        // Kotlin 2.0.0에서 컴파일러는 unknownObject가 Sigma 타입임을 알기에
        // tau() 함수 호출 시 컴파일 타임 오류가 발생합니다.
        unknownObject.tau()
        // Unresolved reference 'tau'

        // Kotlin 1.9.20에서는 컴파일러가 잘못하여 unknownObject를 Tau 타입으로 생각하므로
        // tau() 함수를 호출할 수 있지만, 런타임에 ClassCastException이 발생합니다.
    }
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" id="kotlin-smart-casts-k2-increment-decrement-operators" validate="false"}

### Kotlin Multiplatform 개선 사항

Kotlin 2.0.0의 K2 컴파일러에서는 Kotlin Multiplatform과 관련하여 다음 영역에서 개선이 이루어졌습니다:

* [컴파일 시 공통 소스와 플랫폼 소스의 분리](#separation-of-common-and-platform-sources-during-compilation)
* [기대 선언(expect)과 실제 선언(actual)의 다른 가시성 수준 허용](#different-visibility-levels-of-expected-and-actual-declarations)

#### 컴파일 시 공통 소스와 플랫폼 소스의 분리

이전에는 Kotlin 컴파일러 설계상 컴파일 시점에 공통(common) 소스 세트와 플랫폼(platform) 소스 세트를 분리해 두지 못했습니다. 그 결과, 공통 코드가 플랫폼 코드에 접근할 수 있게 되어 플랫폼 간에 동작이 달라지는 결과가 초래되었습니다. 또한 공통 코드의 일부 컴파일러 설정과 의존성이 플랫폼 코드로 유출되기도 했습니다.

Kotlin 2.0.0에서는 새로운 Kotlin K2 컴파일러 구현 시 컴파일 구조를 재설계하여 공통 소스 세트와 플랫폼 소스 세트 사이의 엄격한 분리를 보장했습니다. 이 변경은 [expected 및 actual 함수](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html#expected-and-actual-functions)를 사용할 때 가장 두드러집니다. 이전에는 공통 코드의 함수 호출이 플랫폼 코드의 함수로 해석(resolve)되는 것이 가능했습니다. 예를 들어:

<table>
   <tr>
       <td>공통 코드</td>
       <td>플랫폼 코드</td>
   </tr>
   <tr>
<td>

```kotlin
fun foo(x: Any) = println("common foo")

fun exampleFunction() {
    foo(42)
}
```

</td>
<td>

```kotlin
// JVM
fun foo(x: Int) = println("platform foo")

// JavaScript
// JavaScript 플랫폼에는 foo() 함수 
// 오버로드가 없습니다.
```

</td>
</tr>
</table>

이 예제에서 공통 코드는 실행되는 플랫폼에 따라 다르게 동작합니다:

* JVM 플랫폼에서는 공통 코드에서 `foo()`를 호출하면 플랫폼 코드의 `foo()`가 호출되어 `platform foo`가 출력됩니다.
* JavaScript 플랫폼에서는 플랫폼 코드에 해당 함수가 없으므로 공통 코드의 `foo()`가 호출되어 `common foo`가 출력됩니다.

Kotlin 2.0.0에서는 공통 코드가 플랫폼 코드에 접근할 수 없으므로, 두 플랫폼 모두 `foo()` 함수를 공통 코드의 `foo()`로 성공적으로 해석하여 `common foo`를 출력합니다.

플랫폼 간 동작 일관성을 개선한 것 외에도, IntelliJ IDEA 또는 Android Studio와 컴파일러 간의 동작이 상충하던 사례들을 수정하기 위해 노력했습니다. 예를 들어 [expected 및 actual 클래스](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html#expected-and-actual-classes)를 사용할 때 다음과 같은 현상이 있었습니다:

<table>
   <tr>
       <td>공통 코드</td>
       <td>플랫폼 코드</td>
   </tr>
   <tr>
<td>

```kotlin
expect class Identity {
    fun confirmIdentity(): String
}

fun common() {
    // 2.0.0 이전에는 IDE에서만 오류가 발생했습니다.
    Identity().confirmIdentity()
    // RESOLUTION_TO_CLASSIFIER : Expected class
    // Identity has no default constructor.
}
```

</td>
<td>

```kotlin
actual class Identity {
    actual fun confirmIdentity() = "expect class fun: jvm"
}
```

</td>
</tr>
</table>

이 예제에서 expected 클래스 `Identity`는 기본 생성자가 없으므로 공통 코드에서 성공적으로 호출할 수 없습니다. 이전에는 IDE에서만 오류가 보고되었고 JVM에서는 여전히 성공적으로 컴파일되었습니다. 그러나 이제 컴파일러는 올바르게 오류를 보고합니다:

```none
Expected class 'expect class Identity : Any' does not have default constructor
```

##### 해석(resolution) 동작이 변경되지 않는 경우

우리는 여전히 새로운 컴파일 구조로 마이그레이션하는 과정에 있으므로, 동일한 소스 세트 내에 있지 않은 함수를 호출할 때는 해석 동작이 이전과 동일합니다. 멀티플랫폼 라이브러리의 오버로드를 공통 코드에서 사용할 때 주로 이러한 차이를 느끼게 될 것입니다.

시그니처가 다른 두 개의 `whichFun()` 함수를 가진 라이브러리가 있다고 가정해 보겠습니다:

```kotlin
// 라이브러리 예시

// MODULE: common
fun whichFun(x: Any) = println("common function")

// MODULE: JVM
fun whichFun(x: Int) = println("platform function")
```

공통 코드에서 `whichFun()`을 호출하면 라이브러리에서 가장 관련성 높은 인자 타입을 가진 함수가 해석됩니다:

```kotlin
// JVM 타겟을 위해 예시 라이브러리를 사용하는 프로젝트

// MODULE: common
fun main() {
    whichFun(2)
    // platform function
}
```

반면, 동일한 소스 세트 내에서 `whichFun()` 오버로드를 선언하면, 코드가 플랫폼 전용 버전에 접근할 수 없으므로 공통 코드의 함수가 해석됩니다:

```kotlin
// 예시 라이브러리를 사용하지 않는 경우

// MODULE: common
fun whichFun(x: Any) = println("common function")

fun main() {
    whichFun(2)
    // common function
}

// MODULE: JVM
fun whichFun(x: Int) = println("platform function")
```

멀티플랫폼 라이브러리와 마찬가지로 `commonTest` 모듈은 별도의 소스 세트에 있으므로 여전히 플랫폼 전용 코드에 접근할 수 있습니다. 따라서 `commonTest` 모듈의 함수 호출 해석은 이전 컴파일 구조와 동일한 동작을 보입니다.

향후에는 이러한 나머지 사례들도 새로운 컴파일 구조와 더 일관되게 변경될 예정입니다.

#### 기대 선언(expect)과 실제 선언(actual)의 다른 가시성 수준

Kotlin 2.0.0 이전에는 Kotlin Multiplatform 프로젝트에서 [expected 및 actual 선언](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html)을 사용할 때 가시성 수준(visibility level)이 동일해야 했습니다. Kotlin 2.0.0은 이제 실제 선언(actual)이 기대 선언(expect)보다 **더** 허용적인 경우에 한해 서로 다른 가시성 수준을 지원합니다. 예를 들어:

```kotlin
expect internal class Attribute // 가시성이 internal
actual class Attribute          // 가시성이 기본값인 public으로,
                                // 더 허용적임
```

마찬가지로 실제 선언에서 [타입 별칭(type alias)](type-aliases.md)을 사용하는 경우, **기저 타입(underlying type)**의 가시성은 기대 선언과 같거나 더 허용적이어야 합니다. 예를 들어:

```kotlin
expect internal class Attribute                 // 가시성이 internal
internal actual typealias Attribute = Expanded

class Expanded                                  // 가시성이 기본값인 public으로,
                                                // 더 허용적임
```

### 컴파일러 플러그인 지원

현재 Kotlin K2 컴파일러는 다음 Kotlin 컴파일러 플러그인을 지원합니다:

* [`all-open`](all-open-plugin.md)
* [AtomicFU](https://github.com/Kotlin/kotlinx-atomicfu)
* [`jvm-abi-gen`](https://github.com/JetBrains/kotlin/tree/master/plugins/jvm-abi-gen)
* [`js-plain-objects`](https://github.com/JetBrains/kotlin/tree/master/plugins/js-plain-objects)
* [kapt](whatsnew1920.md#preview-kapt-compiler-plugin-with-k2)
* [Lombok](lombok.md)
* [`no-arg`](no-arg-plugin.md)
* [Parcelize](https://plugins.gradle.org/plugin/org.jetbrains.kotlin.plugin.parcelize)
* [SAM with receiver](sam-with-receiver-plugin.md)
* [serialization](serialization.md)
* [Power-assert](power-assert.md)

또한, Kotlin K2 컴파일러는 다음을 지원합니다:

* [Jetpack Compose](https://developer.android.com/jetpack/compose) 컴파일러 플러그인 2.0.0. 이 플러그인은 [Kotlin 저장소로 이동되었습니다](https://android-developers.googleblog.com/2024/04/jetpack-compose-compiler-moving-to-kotlin-repository.html).
* [KSP2](https://android-developers.googleblog.com/2023/12/ksp2-preview-kotlin-k2-standalone.html) 이후의 [Kotlin Symbol Processing (KSP) 플러그인](ksp-overview.md).

> 추가 컴파일러 플러그인을 사용하는 경우 해당 문서에서 K2와의 호환 여부를 확인하세요.
>
{style="tip"}

### 실험적 Kotlin Power-assert 컴파일러 플러그인

> Kotlin Power-assert 플러그인은 [실험적(Experimental)](components-stability.md#stability-levels-explained)입니다. 언제든지 변경될 수 있습니다.
>
{style="warning"}

Kotlin 2.0.0은 실험적인 Power-assert 컴파일러 플러그인을 도입합니다. 이 플러그인은 실패 메시지에 컨텍스트 정보를 포함하여 테스트 작성 경험을 개선하며, 디버깅을 더 쉽고 효율적으로 만듭니다.

개발자들은 종종 효과적인 테스트를 작성하기 위해 복잡한 어설션(assertion) 라이브러리를 사용해야 합니다. Power-assert 플러그인은 어설션 표현식의 중간 값을 포함하는 실패 메시지를 자동으로 생성하여 이 프로세스를 단순화합니다. 이를 통해 개발자는 테스트가 실패한 이유를 빠르게 이해할 수 있습니다.

테스트에서 어설션이 실패하면 개선된 오류 메시지에 어설션 내의 모든 변수와 하위 표현식의 값이 표시되어, 조건의 어느 부분이 실패를 유발했는지 명확하게 보여줍니다. 이는 여러 조건이 확인되는 복잡한 어설션에서 특히 유용합니다.

프로젝트에서 플러그인을 활성화하려면 `build.gradle(.kts)` 파일에서 구성하세요:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("multiplatform") version "2.0.0"
    kotlin("plugin.power-assert") version "2.0.0"
}

powerAssert {
    functions = listOf("kotlin.assert", "kotlin.test.assertTrue")
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id 'org.jetbrains.kotlin.multiplatform' version '2.0.0'
    id 'org.jetbrains.kotlin.plugin.power-assert' version '2.0.0'
}

powerAssert {
    functions = ["kotlin.assert", "kotlin.test.assertTrue"]
}
```

</tab>
</tabs>

[문서에서 Kotlin Power-assert 플러그인](power-assert.md)에 대해 더 자세히 알아보세요.

### Kotlin K2 컴파일러를 활성화하는 방법

Kotlin 2.0.0부터 Kotlin K2 컴파일러는 기본적으로 활성화됩니다. 추가 조치가 필요하지 않습니다.

### Kotlin Playground에서 Kotlin K2 컴파일러 사용해보기

Kotlin Playground는 2.0.0 릴리스를 지원합니다. [확인해 보세요!](https://pl.kotl.in/czuoQprce)

### IDE 지원

기본적으로 IntelliJ IDEA 및 Android Studio는 여전히 코드 분석, 코드 완성, 하이라이팅 및 기타 IDE 관련 기능을 위해 이전 컴파일러를 사용합니다. IDE에서 완전한 Kotlin 2.0 경험을 얻으려면 K2 모드를 활성화하세요.

IDE에서 **Settings** | **Languages & Frameworks** | **Kotlin**으로 이동하여 **Enable K2 mode** 옵션을 선택합니다. 그러면 IDE가 K2 모드를 사용하여 코드를 분석합니다.

![K2 모드 활성화](k2-mode.png){width=200}

K2 모드를 활성화한 후, 컴파일러 동작의 변화로 인해 IDE 분석에서 차이점을 발견할 수 있습니다. 새로운 K2 컴파일러가 이전 컴파일러와 어떻게 다른지는 [마이그레이션 가이드](k2-compiler-migration-guide.md)에서 확인하세요.

* K2 모드에 대한 자세한 내용은 [JetBrains 블로그](https://blog.jetbrains.com/idea/2024/11/k2-mode-becomes-stable/)를 참조하세요.
* K2 모드에 대한 피드백을 적극적으로 수집하고 있으니, [공식 Slack 채널](https://kotlinlang.slack.com/archives/C0B8H786P)에서 의견을 공유해 주세요.

### 새로운 K2 컴파일러에 대한 피드백을 남겨주세요

여러분의 피드백은 언제나 환영입니다!

* 새로운 K2 컴파일러를 사용하면서 겪은 문제는 [이슈 트래커](https://kotl.in/issue)에 보고해 주세요.
* ["사용 통계 보내기(Send usage statistics)" 옵션을 활성화](https://www.jetbrains.com/help/idea/settings-usage-statistics.html)하여 JetBrains가 K2 사용에 대한 익명 데이터를 수집할 수 있도록 도와주세요.

## Kotlin/JVM

2.0.0 버전부터 컴파일러는 Java 22 바이트코드를 포함하는 클래스를 생성할 수 있습니다. 또한 이번 버전에서는 다음과 같은 변경 사항이 있습니다:

* [invokedynamic을 사용한 람다 함수 생성](#generation-of-lambda-functions-using-invokedynamic)
* [kotlinx-metadata-jvm 라이브러리 안정화](#the-kotlinx-metadata-jvm-library-is-stable)

### invokedynamic을 사용한 람다 함수 생성

Kotlin 2.0.0은 `invokedynamic`을 사용하여 람다 함수를 생성하는 새로운 기본 방식을 도입합니다. 이 변경은 전통적인 익명 클래스 생성 방식에 비해 애플리케이션의 바이너리 크기를 줄여줍니다.

첫 번째 버전부터 Kotlin은 람다를 익명 클래스로 생성해 왔습니다. 그러나 [Kotlin 1.5.0](whatsnew15.md#lambdas-via-invokedynamic)부터 `-Xlambdas=indy` 컴파일러 옵션을 통해 `invokedynamic` 생성 옵션을 제공해 왔습니다. Kotlin 2.0.0에서는 `invokedynamic`이 람다 생성의 기본 방식이 되었습니다. 이 방식은 더 가벼운 바이너리를 생성하고 Kotlin을 JVM 최적화와 일치시켜, JVM 성능의 지속적이고 향후적인 개선 효과를 애플리케이션이 누릴 수 있게 합니다.

현재 일반 람다 컴파일과 비교할 때 세 가지 제한 사항이 있습니다:

* `invokedynamic`으로 컴파일된 람다는 직렬화(serializable)할 수 없습니다.
* 실험적인 [`reflect()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect.jvm/reflect.html) API는 `invokedynamic`으로 생성된 람다를 지원하지 않습니다.
* 이러한 람다에 대해 `.toString()`을 호출하면 가독성이 떨어지는 문자열 표현이 생성됩니다:

```kotlin
fun main() {
    println({})

    // Kotlin 1.9.24 및 리플렉션 사용 시:
    // () -> kotlin.Unit
    
    // Kotlin 2.0.0 사용 시:
    // FileKt$Lambda$13/0x00007f88a0004608@506e1b77
}
```

레거시 람다 함수 생성 동작을 유지하려면 다음 중 하나를 수행할 수 있습니다:

* 특정 람다에 `@JvmSerializableLambda` 어노테이션을 추가합니다.
* 컴파일러 옵션 `-Xlambdas=class`를 사용하여 모듈의 모든 람다를 레거시 방식으로 생성합니다.

### kotlinx-metadata-jvm 라이브러리 안정화

Kotlin 2.0.0에서 `kotlinx-metadata-jvm` 라이브러리가 [안정화(Stable)](components-stability.md#stability-levels-explained)되었습니다. 이제 라이브러리가 `kotlin` 패키지 및 좌표로 변경되었으므로 `kotlin-metadata-jvm`("x"가 빠짐)으로 찾을 수 있습니다.

이전에는 `kotlinx-metadata-jvm` 라이브러리가 자체적인 게시(publishing) 체계와 버전을 가지고 있었습니다. 이제는 Kotlin 출시 주기의 일부로 `kotlin-metadata-jvm` 업데이트를 빌드하고 게시하며, Kotlin 표준 라이브러리와 동일한 하위 호환성을 보장합니다.

`kotlin-metadata-jvm` 라이브러리는 Kotlin/JVM 컴파일러가 생성한 바이너리 파일의 메타데이터를 읽고 수정할 수 있는 API를 제공합니다.

<!-- `kotlinx-metadata-jvm` 라이브러리에 대한 자세한 내용은 [문서](kotlin-metadata-jvm.md)를 참조하세요. -->

## Kotlin/Native

이번 버전에서는 다음과 같은 변경 사항이 있습니다:

* [사인포스트(signposts)를 통한 GC 성능 모니터링](#monitoring-gc-performance-with-signposts-on-apple-platforms)
* [Objective-C 메서드와의 충돌 해결](#resolving-conflicts-with-objective-c-methods)
* [Kotlin/Native의 컴파일러 인자에 대한 로그 레벨 변경](#changed-log-level-for-compiler-arguments)
* [Kotlin/Native에 표준 라이브러리 및 플랫폼 의존성 명시적 추가](#explicitly-added-standard-library-and-platform-dependencies-to-kotlin-native)
* [Gradle 구성 캐시의 작업 오류 해결](#tasks-error-in-gradle-configuration-cache)

### Apple 플랫폼에서 사인포스트를 통한 GC 성능 모니터링

이전에는 로그를 통해서만 Kotlin/Native 가비지 컬렉터(GC)의 성능을 모니터링할 수 있었습니다. 그러나 이러한 로그는 iOS 앱의 성능을 조사하는 데 인기 있는 도구인 Xcode Instruments와 통합되지 않았습니다.

Kotlin 2.0.0부터 GC는 Instruments에서 사용할 수 있는 사인포스트(signposts)와 함께 일시 중지(pause)를 보고합니다. 사인포스트를 사용하면 앱 내에서 맞춤형 로깅이 가능하므로, 이제 iOS 앱 성능을 디버깅할 때 GC 일시 중지가 애플리케이션 프리징과 일치하는지 확인할 수 있습니다.

GC 성능 분석에 대한 자세한 내용은 [문서](native-memory-manager.md#monitor-gc-performance)를 참조하세요.

### Objective-C 메서드와의 충돌 해결

Objective-C 메서드는 이름은 다르지만 매개변수의 개수와 타입이 같을 수 있습니다. 예를 들어, [`locationManager:didEnterRegion:`](https://developer.apple.com/documentation/corelocation/cllocationmanagerdelegate/1423560-locationmanager?language=objc)와 [`locationManager:didExitRegion:`](https://developer.apple.com/documentation/corelocation/cllocationmanagerdelegate/1423630-locationmanager?language=objc)이 있습니다. Kotlin에서 이러한 메서드들은 동일한 시그니처를 가지게 되어 충돌하는 오버로드(conflicting overloads) 오류를 발생시킵니다.

이전에는 이러한 컴파일 오류를 피하기 위해 충돌하는 오버로드를 수동으로 억제(suppress)해야 했습니다. Objective-C와의 상호운용성을 개선하기 위해 Kotlin 2.0.0에서는 새로운 `@ObjCSignatureOverride` 어노테이션을 도입했습니다.

이 어노테이션은 Objective-C 클래스에서 인자 타입은 같지만 인자 이름이 다른 여러 함수를 상속받는 경우, 컴파일러가 충돌하는 오버로드를 무시하도록 지시합니다.

이 어노테이션을 적용하는 것은 일반적인 오류 억제보다 더 안전합니다. 이 어노테이션은 지원되고 테스트된 Objective-C 메서드 오버라이딩의 경우에만 사용될 수 있는 반면, 일반적인 억제는 중요한 오류를 숨기고 코드가 조용히 깨지는 결과를 초래할 수 있기 때문입니다.

### 컴파일러 인자에 대한 로그 레벨 변경

이번 릴리스에서 `compile`, `link`, `cinterop`과 같은 Kotlin/Native Gradle 작업의 컴파일러 인자에 대한 로그 레벨이 `info`에서 `debug`로 변경되었습니다.

`debug`를 기본값으로 사용함으로써 로그 레벨이 다른 Gradle 컴파일 작업과 일관성을 유지하게 되었으며, 모든 컴파일러 인자를 포함한 상세한 디버깅 정보를 제공합니다.

### Kotlin/Native에 표준 라이브러리 및 플랫폼 의존성 명시적 추가

이전에는 Kotlin/Native 컴파일러가 표준 라이브러리와 플랫폼 의존성을 암시적으로 해결(resolve)했기 때문에, Kotlin Gradle 플러그인이 Kotlin 타겟 전반에서 작동하는 방식에 불일치가 발생했습니다.

이제 각 Kotlin/Native Gradle 컴파일은 `compileDependencyFiles` [컴파일 파라미터](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#compilation-parameters)를 통해 컴파일 타임 라이브러리 경로에 표준 라이브러리 및 플랫폼 의존성을 명시적으로 포함합니다.

### Gradle 구성 캐시의 작업 오류

Kotlin 2.0.0부터 `invocation of Task.project at execution time is unsupported`와 같은 메시지와 함께 구성 캐시(configuration cache) 오류가 발생할 수 있습니다.

이 오류는 `NativeDistributionCommonizerTask` 및 `KotlinNativeCompile`과 같은 작업에서 나타납니다.

하지만 이는 오탐(false-positive) 오류입니다. 근본적인 문제는 `publish*` 작업과 같이 Gradle 구성 캐시와 호환되지 않는 작업이 존재하기 때문입니다.

오류 메시지가 다른 근본 원인을 제안하기 때문에 이러한 불일치가 즉시 명확하지 않을 수 있습니다.

오류 보고서에 정확한 원인이 명시되지 않았으므로, [Gradle 팀은 이미 보고서를 수정하기 위해 이 문제를 해결하고 있습니다](https://github.com/gradle/gradle/issues/21290).

## Kotlin/Wasm

Kotlin 2.0.0은 성능과 JavaScript와의 상호운용성을 개선했습니다:

* [Binaryen을 사용하여 기본적으로 프로덕션 빌드 최적화](#optimized-production-builds-by-default-using-binaryen)
* [네임드 엑스포트(named export) 지원](#support-for-named-export)
* [`@JsExport` 함수에서 부호 없는 기본형 타입 지원](#support-for-unsigned-primitive-types-in-functions-with-jsexport)
* [Kotlin/Wasm에서 TypeScript 선언 파일(.d.ts) 생성](#generation-of-typescript-declaration-files-in-kotlin-wasm)
* [JavaScript 예외 포착 지원](#support-for-catching-javascript-exceptions)
* [새로운 예외 처리 제안을 옵션으로 지원](#new-exception-handling-proposal-is-now-supported-as-an-option)
* [`withWasm()` 함수를 JS 및 WASI 변체로 분리](#the-withwasm-function-is-split-into-js-and-wasi-variants)

### Binaryen을 사용하여 기본적으로 프로덕션 빌드 최적화

Kotlin/Wasm 툴체인은 이제 이전의 수동 설정 방식 대신, 모든 프로젝트의 프로덕션 컴파일 중에 [Binaryen](https://github.com/WebAssembly/binaryen) 도구를 적용합니다. 저희의 추정에 따르면, 이는 런타임 성능을 향상시키고 프로젝트의 바이너리 크기를 줄여줄 것입니다.

> 이 변경 사항은 프로덕션 컴파일에만 영향을 미칩니다. 개발 컴파일 프로세스는 동일하게 유지됩니다.
>
{style="note"}

### 네임드 엑스포트 지원

이전에는 Kotlin/Wasm에서 내보낸 모든 선언은 기본 엑스포트(default export)를 사용하여 JavaScript로 가져왔습니다:

```javascript
// JavaScript:
import Module from "./index.mjs"

Module.add()
```

이제 `@JsExport`가 표시된 각 Kotlin 선언을 이름으로 가져올 수 있습니다:

```kotlin
// Kotlin:
@JsExport
fun add(a: Int, b: Int) = a + b
```

```javascript
// JavaScript:
import { add } from "./index.mjs"
```

네임드 엑스포트는 Kotlin과 JavaScript 모듈 간에 코드를 공유하기 쉽게 만듭니다. 가독성을 높이고 모듈 간의 의존성을 관리하는 데 도움을 줍니다.

### @JsExport 함수에서 부호 없는 기본형 타입 지원

Kotlin 2.0.0부터 Kotlin/Wasm 함수를 JavaScript 코드에서 사용할 수 있게 해주는 `@JsExport` 어노테이션이 있는 함수 및 외부 선언(external declarations) 내부에서 [부호 없는 기본형 타입(unsigned primitive types)](unsigned-integer-types.md)을 사용할 수 있습니다.

이는 [부호 없는 기본형](unsigned-integer-types.md)을 내보낸 선언이나 외부 선언 내부에서 직접 사용할 수 없었던 이전의 제한을 완화하는 데 도움이 됩니다. 이제 부호 없는 기본형을 반환 타입이나 매개변수 타입으로 가지는 함수를 내보내거나, 부호 없는 기본형을 반환하거나 소비하는 외부 선언을 사용할 수 있습니다.

Kotlin/Wasm과 JavaScript의 상호운용성에 대한 자세한 내용은 [문서](wasm-js-interop.md#use-javascript-code-in-kotlin)를 참조하세요.

### Kotlin/Wasm에서 TypeScript 선언 파일 생성

> Kotlin/Wasm에서 TypeScript 선언 파일을 생성하는 기능은 [실험적(Experimental)](components-stability.md#stability-levels-explained)입니다. 언제든지 중단되거나 변경될 수 있습니다.
>
{style="warning"}

Kotlin 2.0.0에서 Kotlin/Wasm 컴파일러는 이제 Kotlin 코드의 모든 `@JsExport` 선언에서 TypeScript 정의(.d.ts)를 생성할 수 있습니다. 이러한 정의는 IDE 및 JavaScript 도구에서 코드 자동 완성, 타입 검사 지원 및 JavaScript에 Kotlin 코드를 더 쉽게 포함하는 데 사용될 수 있습니다.

Kotlin/Wasm 컴파일러는 `@JsExport`로 표시된 모든 [최상위 함수](wasm-js-interop.md#functions-with-the-jsexport-annotation)를 수집하여 `.d.ts` 파일에 TypeScript 정의를 자동으로 생성합니다.

TypeScript 정의를 생성하려면 `build.gradle(.kts)` 파일의 `wasmJs {}` 블록에 `generateTypeScriptDefinitions()` 함수를 추가하세요:

```kotlin
kotlin {
    wasmJs {
        binaries.executable()
        browser {
        }
        generateTypeScriptDefinitions()
    }
}
```

### JavaScript 예외 포착 지원

이전에는 Kotlin/Wasm 코드에서 JavaScript 예외를 포착할 수 없었기 때문에 프로그램의 JavaScript 측에서 발생하는 오류를 처리하기 어려웠습니다.

Kotlin 2.0.0에서는 Kotlin/Wasm 내에서 JavaScript 예외를 포착하는 기능을 구현했습니다. 이 구현을 통해 `Throwable` 또는 `JsException`과 같은 특정 타입의 `try-catch` 블록을 사용하여 이러한 오류를 적절하게 처리할 수 있습니다.

또한 예외 발생 여부와 상관없이 코드를 실행하는 데 도움이 되는 `finally` 블록도 올바르게 작동합니다. JavaScript 예외 포착 지원을 도입하는 동안, 호출 스택(call stack)과 같은 추가 정보는 JavaScript 예외 발생 시 아직 제공되지 않습니다. 그러나 [이러한 구현 작업을 진행 중](https://youtrack.jetbrains.com/issue/KT-68185/WasmJs-Attach-js-exception-object-to-JsException)입니다.

### 새로운 예외 처리 제안을 옵션으로 지원

이번 릴리스에서는 Kotlin/Wasm 내에서 WebAssembly의 새로운 버전 [예외 처리 제안(exception handling proposal)](https://github.com/WebAssembly/exception-handling/blob/main/proposals/exception-handling/Exceptions.md)에 대한 지원을 도입합니다.

이 업데이트는 새로운 제안이 Kotlin 요구 사항과 일치하도록 보장하여, 해당 제안의 최신 버전만 지원하는 가상 머신에서도 Kotlin/Wasm을 사용할 수 있게 합니다.

기본적으로 꺼져 있는 `-Xwasm-use-new-exception-proposal` 컴파일러 옵션을 사용하여 새로운 예외 처리 제안을 활성화할 수 있습니다.

### withWasm() 함수를 JS 및 WASI 변체로 분리

계층 구조 템플릿에 Wasm 타겟을 제공하던 `withWasm()` 함수는 더 전문화된 `withWasmJs()` 및 `withWasmWasi()` 함수를 위해 사용 중단(deprecated)되었습니다.

이제 트리 정의에서 WASI 및 JS 타겟을 서로 다른 그룹으로 분리할 수 있습니다.

## Kotlin/JS

다른 변경 사항들 중에서 이번 버전은 ES2015 표준의 더 많은 기능을 지원하는 현대적인 JS 컴파일을 Kotlin에 도입합니다:

* [새로운 컴파일 타겟](#new-compilation-target)
* [ES2015 제너레이터로서의 suspend 함수](#suspend-functions-as-es2015-generators)
* [main 함수에 인자 전달](#passing-arguments-to-the-main-function)
* [Kotlin/JS 프로젝트의 파일별(Per-file) 컴파일](#per-file-compilation-for-kotlin-js-projects)
* [컬렉션 상호운용성 개선](#improved-collection-interoperability)
* [createInstance() 지원](#support-for-createinstance)
* [타입 안전한 일반 JavaScript 객체 지원](#support-for-type-safe-plain-javascript-objects)
* [npm 패키지 매니저 지원](#support-for-npm-package-manager)
* [컴파일 작업의 변경](#changes-to-compilation-tasks)
* [레거시 Kotlin/JS JAR 아티팩트 중단](#discontinuing-legacy-kotlin-js-jar-artifacts)

### 새로운 컴파일 타겟

Kotlin 2.0.0에서는 Kotlin/JS에 새로운 컴파일 타겟인 `es2015`를 추가합니다. 이는 Kotlin에서 지원되는 모든 ES2015 기능을 한 번에 활성화할 수 있는 새로운 방법입니다.

`build.gradle(.kts)` 파일에서 다음과 같이 설정할 수 있습니다:

```kotlin
kotlin {
    js {
        compilerOptions {
            target.set("es2015")
        }
    }
}
```

새로운 타겟은 [ES 클래스 및 모듈](whatsnew19.md#experimental-support-for-es2015-classes-and-modules)과 새로 지원되는 [ES 제너레이터](#suspend-functions-as-es2015-generators)를 자동으로 활성화합니다.

### ES2015 제너레이터로서의 suspend 함수

이번 릴리스에서는 [suspend 함수](composing-suspending-functions.md)를 컴파일하기 위한 ES2015 제너레이터에 대한 [실험적(Experimental)](components-stability.md#stability-levels-explained) 지원을 도입합니다.

상태 머신 대신 제너레이터를 사용하면 프로젝트의 최종 번들 크기가 개선될 것입니다. 예를 들어, JetBrains 팀은 ES2015 제너레이터를 사용하여 Space 프로젝트의 번들 크기를 20% 줄이는 데 성공했습니다.

[공식 문서에서 ES2015 (ECMAScript 2015, ES6)에 대해 더 자세히 알아보세요](https://262.ecma-international.org/6.0/).

### main 함수에 인자 전달

Kotlin 2.0.0부터 `main()` 함수를 위한 `args` 소스를 지정할 수 있습니다. 이 기능은 명령줄 작업을 더 쉽게 만들고 인자를 전달하는 과정을 단순화합니다.

이를 위해 문자열 배열을 반환하는 새로운 `passAsArgumentToMainFunction()` 함수를 `js {}` 블록에 정의하세요:

```kotlin
kotlin {
    js {
        binary.executable()
        passAsArgumentToMainFunction("Deno.args")
    }
}
```

이 함수는 런타임에 실행됩니다. JavaScript 표현식을 가져와 `main()` 함수 호출 대신 `args: Array<String>` 인자로 사용합니다.

또한 Node.js 런타임을 사용하는 경우 특수 별칭(alias)을 활용할 수 있습니다. 매번 수동으로 추가하는 대신 `process.argv`를 `args` 파라미터로 한 번에 전달할 수 있습니다:

```kotlin
kotlin {
    js {
        binary.executable()
        nodejs {
            passProcessArgvToMainFunction()
        }
    }
}
```

### Kotlin/JS 프로젝트의 파일별 컴파일

Kotlin 2.0.0은 Kotlin/JS 프로젝트 출력에 대한 새로운 세분성(granularity) 옵션을 도입합니다. 이제 각 Kotlin 파일에 대해 하나의 JavaScript 파일을 생성하는 파일별(per-file) 컴파일을 설정할 수 있습니다. 이는 최종 번들의 크기를 크게 최적화하고 프로그램의 로딩 시간을 개선하는 데 도움이 됩니다.

이전에는 두 가지 출력 옵션만 있었습니다. Kotlin/JS 컴파일러는 전체 프로젝트에 대해 단일 `.js` 파일을 생성할 수 있었습니다. 하지만 이 파일은 너무 크고 사용하기 불편할 수 있었습니다. 프로젝트의 함수 하나만 사용하고 싶을 때도 전체 JavaScript 파일을 의존성으로 포함해야 했습니다. 또는 각 프로젝트 모듈에 대해 별도의 `.js` 파일 컴파일을 구성할 수도 있었습니다. 이것이 여전히 기본 옵션입니다.

모듈 파일 역시 너무 클 수 있기 때문에, Kotlin 2.0.0에서는 각 Kotlin 파일마다 하나(파일에 내보낸 선언이 포함된 경우 두 개)의 JavaScript 파일을 생성하는 더 세밀한 출력을 추가합니다. 파일별 컴파일 모드를 활성화하려면 다음을 수행하세요:

1. ECMAScript 모듈을 지원하기 위해 빌드 파일에 [`useEsModules()`](whatsnew19.md#experimental-support-for-es2015-classes-and-modules) 함수를 추가합니다:

   ```kotlin
   // build.gradle.kts
   kotlin {
       js(IR) {
           useEsModules() // ES2015 모듈 활성화
           browser()
       }
   }
   ```

   이를 위해 새로운 `es2015` [컴파일 타겟](#new-compilation-target)을 사용할 수도 있습니다.

2. `-Xir-per-file` 컴파일러 옵션을 적용하거나 `gradle.properties` 파일을 다음과 같이 업데이트합니다:

   ```none
   # gradle.properties
   kotlin.js.ir.output.granularity=per-file // 기본값은 `per-module`
   ```

### 컬렉션 상호운용성 개선

Kotlin 2.0.0부터 시그니처 내부에 Kotlin 컬렉션 타입을 포함하는 선언을 JavaScript(및 TypeScript)로 내보낼 수 있습니다. 이는 `Set`, `Map`, `List` 컬렉션 타입과 그에 대응하는 가변(mutable) 컬렉션에 적용됩니다.

JavaScript에서 Kotlin 컬렉션을 사용하려면, 먼저 필요한 선언에 [`@JsExport`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.js/-js-export/) 어노테이션을 표시하세요:

```kotlin
// Kotlin
@JsExport
data class User(
    val name: String,
    val friends: `List<User>` = emptyList()
)

@JsExport
val me = User(
    name = "Me",
    friends = listOf(User(name = "Kodee"))
)
```

그런 다음 JavaScript에서 이를 일반 JavaScript 배열처럼 사용할 수 있습니다:

```javascript
// JavaScript
import { User, me, KtList } from "my-module"

const allMyFriendNames = me.friends
    .asJsReadonlyArrayView()
    .map(x => x.name) // ['Kodee']
```

> 아쉽게도 JavaScript에서 Kotlin 컬렉션을 생성하는 기능은 아직 사용할 수 없습니다. 이 기능은 Kotlin 2.0.20에 추가될 예정입니다.
>
{style="note"}

### createInstance() 지원

Kotlin 2.0.0부터 Kotlin/JS 타겟에서 [`createInstance()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect.full/create-instance.html) 함수를 사용할 수 있습니다. 이전에는 JVM에서만 사용할 수 있었습니다.

[KClass](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-class/) 인터페이스의 이 함수는 지정된 클래스의 새 인스턴스를 생성하며, Kotlin 클래스에 대한 런타임 참조를 얻는 데 유용합니다.

### 타입 안전한 일반 JavaScript 객체 지원

> `js-plain-objects` 플러그인은 [실험적(Experimental)](components-stability.md#stability-levels-explained)입니다. 언제든지 중단되거나 변경될 수 있습니다. `js-plain-objects` 플러그인은 K2 컴파일러**만** 지원합니다.
>
{style="warning"}

JavaScript API를 더 쉽게 다루기 위해 Kotlin 2.0.0에서는 타입 안전한 일반 JavaScript 객체를 생성하는 데 사용할 수 있는 새로운 플러그인 [`js-plain-objects`](https://github.com/JetBrains/kotlin/tree/master/plugins/js-plain-objects)를 제공합니다. 이 플러그인은 `@JsPlainObject` 어노테이션이 있는 [외부 인터페이스(external interfaces)](wasm-js-interop.md#external-interfaces)가 있는지 코드를 확인하고 다음을 추가합니다:

* 생성자처럼 사용할 수 있는 컴패니언 객체 내부의 인라인 `invoke` 연산자 함수.
* 일부 프로퍼티를 조정하면서 객체의 복사본을 생성하는 데 사용할 수 있는 `.copy()` 함수.

예를 들어:

```kotlin
import kotlinx.js.JsPlainObject

@JsPlainObject
external interface User {
    var name: String
    val age: Int
    val email: String?
}

fun main() {
    // JavaScript 객체 생성
    val user = User(name = "Name", age = 10)
    // 객체를 복사하고 이메일 추가
    val copy = user.copy(age = 11, email = "some@user.com")

    println(JSON.stringify(user))
    // { "name": "Name", "age": 10 }
    println(JSON.stringify(copy))
    // { "name": "Name", "age": 11, "email": "some@user.com" }
}
```

이 접근 방식으로 생성된 모든 JavaScript 객체는 런타임에만 오류를 발견하는 대신, 컴파일 타임에 오류를 확인하거나 IDE에서 하이라이팅을 받을 수 있기 때문에 더 안전합니다.

JavaScript 객체의 형태를 설명하기 위해 외부 인터페이스를 사용하는 JavaScript API와 상호 작용하는 `fetch()` 함수를 사용하는 예제를 살펴보세요:

```kotlin
import kotlinx.js.JsPlainObject

@JsPlainObject
external interface FetchOptions {
    val body: String?
    val method: String
}

// Window.fetch를 위한 래퍼
suspend fun fetch(url: String, options: FetchOptions? = null) = TODO("Add your custom behavior here")

// "metod"는 method로 인식되지 않으므로 컴파일 타임 오류 발생
fetch("https://google.com", options = FetchOptions(metod = "POST"))
// method가 필수값이므로 컴파일 타임 오류 발생
fetch("https://google.com", options = FetchOptions(body = "SOME STRING")) 
```

반면 `js()` 함수를 사용하여 JavaScript 객체를 생성하는 경우 오류는 런타임에만 발견되거나 아예 발생하지 않을 수도 있습니다:

```kotlin
suspend fun fetch(url: String, options: FetchOptions? = null) = TODO("Add your custom behavior here")

// 오류가 발생하지 않음. "metod"가 인식되지 않으므로 잘못된 메서드(GET)가 사용됨.
fetch("https://google.com", options = js("{ metod: 'POST' }"))

// 기본적으로 GET 메서드가 사용됨. body가 있어서는 안 되므로 런타임 오류가 발생함.
fetch("https://google.com", options = js("{ body: 'SOME STRING' }"))
// TypeError: Window.fetch: HEAD or GET Request cannot have a body
```

`js-plain-objects` 플러그인을 사용하려면 `build.gradle(.kts)` 파일에 다음을 추가하세요:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("plugin.js-plain-objects") version "2.0.0"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id "org.jetbrains.kotlin.plugin.js-plain-objects" version "2.0.0"
}
```

</tab>
</tabs>

### npm 패키지 매니저 지원

이전에는 Kotlin Multiplatform Gradle 플러그인이 npm 의존성을 다운로드하고 설치하기 위해 패키지 매니저로 [Yarn](https://yarnpkg.com/lang/en/)만 사용할 수 있었습니다. Kotlin 2.0.0부터는 대신 [npm](https://www.npmjs.com/)을 패키지 매니저로 사용할 수 있습니다. npm을 패키지 매니저로 사용하면 설정 과정에서 관리해야 할 도구가 하나 줄어듭니다.

하위 호환성을 위해 여전히 Yarn이 기본 패키지 매니저입니다. npm을 패키지 매니저로 사용하려면 `gradle.properties` 파일에 다음 프로퍼티를 설정하세요:

```kotlin
kotlin.js.yarn = false
```

### 컴파일 작업의 변경

이전에는 `webpack` 및 `distributeResources` 컴파일 작업이 모두 동일한 디렉토리를 타겟팅했습니다. 게다가 `distribution` 작업도 `dist`를 출력 디렉토리로 선언했습니다. 이로 인해 출력이 겹치고 컴파일 경고가 발생했습니다.

따라서 Kotlin 2.0.0부터 다음과 같은 변경 사항을 구현했습니다:

* `webpack` 작업은 이제 별도의 폴더를 타겟팅합니다.
* `distributeResources` 작업이 완전히 제거되었습니다.
* `distribution` 작업은 이제 `Copy` 타입을 가지며 `dist` 폴더를 타겟팅합니다.

### 레거시 Kotlin/JS JAR 아티팩트 중단

Kotlin 2.0.0부터 Kotlin 배포판에는 더 이상 확장자가 `.jar`인 레거시 Kotlin/JS 아티팩트가 포함되지 않습니다. 레거시 아티팩트는 지원되지 않는 이전 Kotlin/JS 컴파일러에서 사용되었으며, `klib` 형식을 사용하는 IR 컴파일러에는 필요하지 않습니다.

## Gradle 개선 사항

Kotlin 2.0.0은 Gradle 6.8.3부터 8.5까지 완벽하게 호환됩니다. 최신 Gradle 릴리스까지도 사용할 수 있지만, 이 경우 지원 중단(deprecation) 경고가 발생하거나 일부 새로운 Gradle 기능이 작동하지 않을 수 있음을 유의하세요.

이번 버전에서는 다음과 같은 변경 사항이 있습니다:

* [멀티플랫폼 프로젝트의 컴파일러 옵션을 위한 새로운 Gradle DSL](#new-gradle-dsl-for-compiler-options-in-multiplatform-projects)
* [새로운 Compose 컴파일러 Gradle 플러그인](#new-compose-compiler-gradle-plugin)
* [JVM 및 Android 게시 라이브러리를 구분하기 위한 새로운 속성](#new-attribute-to-distinguish-jvm-and-android-published-libraries)
* [Kotlin/Native의 CInteropProcess를 위한 개선된 Gradle 의존성 처리](#improved-gradle-dependency-handling-for-cinteropprocess-in-kotlin-native)
* [Gradle에서의 가시성 변경](#visibility-changes-in-gradle)
* [Gradle 프로젝트의 Kotlin 데이터를 위한 새로운 디렉토리](#new-directory-for-kotlin-data-in-gradle-projects)
* [필요할 때만 다운로드되는 Kotlin/Native 컴파일러](#kotlin-native-compiler-downloaded-when-needed)
* [컴파일러 옵션을 정의하는 이전 방식의 지원 중단](#deprecated-old-ways-of-defining-compiler-options)
* [지원되는 최소 AGP 버전 상향](#bumped-minimum-supported-agp-version)
* [최신 언어 버전을 시도해보기 위한 새로운 Gradle 프로퍼티](#new-gradle-property-for-trying-the-latest-language-version)
* [빌드 리포트를 위한 새로운 JSON 출력 형식](#new-json-output-format-for-build-reports)
* [kapt 구성이 상위 구성으로부터 어노테이션 프로세서를 상속함](#kapt-configurations-inherit-annotation-processors-from-superconfigurations)
* [Kotlin Gradle 플러그인이 더 이상 지원 중단된 Gradle 컨벤션을 사용하지 않음](#kotlin-gradle-plugin-no-longer-uses-deprecated-gradle-conventions)

### 멀티플랫폼 프로젝트의 컴파일러 옵션을 위한 새로운 Gradle DSL

> 이 기능은 [실험적(Experimental)](components-stability.md#stability-levels-explained)입니다. 언제든지 중단되거나 변경될 수 있습니다. 평가 목적으로만 사용하세요. [YouTrack](https://kotl.in/issue)에서 이에 대한 피드백을 환영합니다.
>
{style="warning"}

Kotlin 2.0.0 이전에는 Gradle 멀티플랫폼 프로젝트에서 컴파일러 옵션을 구성할 때 작업(task), 컴파일 또는 소스 세트별로만 낮은 수준에서 구성이 가능했습니다. 프로젝트에서 더 일반적인 방식으로 컴파일러 옵션을 쉽게 구성할 수 있도록 Kotlin 2.0.0에는 새로운 Gradle DSL이 포함되었습니다.

이 새로운 DSL을 사용하면 `commonMain`과 같은 모든 타겟 및 공유 소스 세트에 대해 확장(extension) 수준에서 컴파일러 옵션을 구성하거나, 특정 타겟에 대해 타겟 수준에서 구성할 수 있습니다:

```kotlin
kotlin {
    compilerOptions {
        // 모든 타겟 및 공유 소스 세트의 기본값으로 사용되는 
        // 확장 수준의 공통 컴파일러 옵션
        allWarningsAsErrors.set(true)
    }
    jvm {
        compilerOptions {
            // 이 타겟의 모든 컴파일에 대한 기본값으로 사용되는 
            // 타겟 수준의 JVM 컴파일러 옵션
            noJdk.set(true)
        }
    }
}
```

전체 프로젝트 구성은 이제 세 개의 계층을 가집니다. 가장 높은 계층은 확장 수준이고, 그 다음은 타겟 수준, 가장 낮은 계층은 컴파일 단위(보통 컴파일 작업)입니다:

![Kotlin 컴파일러 옵션 계층](compiler-options-levels.svg){width=700}

상위 계층의 설정은 하위 계층의 컨벤션(기본값)으로 사용됩니다:

* 확장 컴파일러 옵션의 값은 `commonMain`, `nativeMain`, `commonTest`와 같은 공유 소스 세트를 포함한 타겟 컴파일러 옵션의 기본값입니다.
* 타겟 컴파일러 옵션의 값은 `compileKotlinJvm` 및 `compileTestKotlinJvm` 작업과 같은 컴파일 단위(작업) 컴파일러 옵션의 기본값으로 사용됩니다.

결과적으로 하위 계층에서 수행된 구성은 상위 계층의 관련 설정을 덮어씁니다:

* 작업 수준의 컴파일러 옵션은 타겟 또는 확장 수준의 관련 구성을 덮어씁니다.
* 타겟 수준의 컴파일러 옵션은 확장 수준의 관련 구성을 덮어씁니다.

프로젝트를 구성할 때 컴파일러 옵션을 설정하는 일부 이전 방식이 [지원 중단](#deprecated-old-ways-of-defining-compiler-options)되었음을 유의하세요.

이 DSL을 멀티플랫폼 프로젝트에서 사용해보고 [YouTrack](https://kotl.in/issue)에 피드백을 남겨주시기 바랍니다. 이 DSL을 컴파일러 옵션 구성의 권장 방식으로 만들 계획입니다.

### 새로운 Compose 컴파일러 Gradle 플러그인

컴포저블(composable)을 Kotlin 코드로 변환하는 Jetpack Compose 컴파일러가 이제 Kotlin 저장소에 병합되었습니다. 이를 통해 Compose 컴파일러가 항상 Kotlin과 동시에 출시되므로 Compose 프로젝트를 Kotlin 2.0.0으로 쉽게 전환할 수 있습니다. 또한 Compose 컴파일러 버전도 2.0.0으로 상향됩니다.

프로젝트에서 새로운 Compose 컴파일러를 사용하려면 `build.gradle(.kts)` 파일에 `org.jetbrains.kotlin.plugin.compose` Gradle 플러그인을 적용하고 그 버전을 Kotlin 2.0.0과 동일하게 설정하세요.

이 변경 사항에 대해 자세히 알아보고 마이그레이션 지침을 보려면 [Compose 컴파일러](https://kotlinlang.org/docs/multiplatform/compose-compiler.html) 문서를 참조하세요.

### JVM 및 Android 게시 라이브러리를 구분하기 위한 새로운 속성

Kotlin 2.0.0부터 [`org.gradle.jvm.environment`](https://docs.gradle.org/current/userguide/variant_attributes.html#sub:jvm_default_attributes) Gradle 속성이 모든 Kotlin 변체와 함께 기본적으로 게시됩니다.

이 속성은 Kotlin Multiplatform 라이브러리의 JVM 및 Android 변체를 구분하는 데 도움이 됩니다. 특정 라이브러리 변체가 특정 JVM 환경에 더 적합함을 나타냅니다. 타겟 환경은 "android", "standard-jvm" 또는 "no-jvm"이 될 수 있습니다.

이 속성을 게시하면 Java 전용 프로젝트와 같이 멀티플랫폼이 아닌 클라이언트에서도 JVM 및 Android 타겟을 가진 Kotlin Multiplatform 라이브러리를 더 안정적으로 사용할 수 있게 됩니다.

필요한 경우 속성 게시를 비활성화할 수 있습니다. 이를 위해 `gradle.properties` 파일에 다음 Gradle 옵션을 추가하세요:

```none
kotlin.publishJvmEnvironmentAttribute=false
```

### Kotlin/Native의 CInteropProcess를 위한 개선된 Gradle 의존성 처리

이번 릴리스에서는 Kotlin/Native 프로젝트에서 더 나은 Gradle 작업 의존성 관리를 보장하기 위해 `defFile` 프로퍼티의 처리를 개선했습니다.

이 업데이트 전에는 아직 실행되지 않은 다른 작업의 출력으로 `defFile` 프로퍼티가 지정된 경우 Gradle 빌드가 실패할 수 있었습니다. 이 문제에 대한 해결책은 이 작업에 대한 의존성을 직접 추가하는 것이었습니다:

```kotlin
kotlin {
    macosArm64("native") {
        compilations.getByName("main") {
            cinterops {
                val cinterop by creating {
                    defFileProperty.set(createDefFileTask.flatMap { it.defFile.asFile })
                    project.tasks.named(interopProcessingTaskName).configure {
                        dependsOn(createDefFileTask)
                    }
                }
            }
        }
    }
}
```

이를 해결하기 위해 `definitionFile`이라는 새로운 `RegularFileProperty` 프로퍼티가 추가되었습니다. 이제 Gradle은 빌드 프로세스 나중에 연결된 작업이 실행된 후 `definitionFile` 프로퍼티의 존재 여부를 지연 확인(lazy verification)합니다. 이 새로운 접근 방식은 추가적인 의존성 설정의 필요성을 없애줍니다.

`CInteropProcess` 작업과 `CInteropSettings` 클래스는 `defFile` 및 `defFileProperty` 대신 `definitionFile` 프로퍼티를 사용합니다:

<tabs group ="build-script">
<tab id="kotlin" title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    macosArm64("native") {
        compilations.getByName("main") {
            cinterops {
                val cinterop by creating {
                    definitionFile.set(project.file("def-file.def"))
                }
            }
        }
    }
}
```

</tab>
<tab id="groovy" title="Groovy" group-key="groovy">

```groovy
kotlin {
    macosArm64("native") {
        compilations.main {
            cinterops {
                cinterop {
                    definitionFile.set(project.file("def-file.def"))
                }
            }
        }
    }
}
```

</tab>
</tabs>

> `defFile` 및 `defFileProperty` 파라미터는 사용 중단(deprecated)되었습니다.
>
{style="warning"}

### Gradle에서의 가시성 변경

> 이 변경 사항은 Kotlin DSL 사용자에게만 영향을 미칩니다.
>
{style="note"}

Kotlin 2.0.0에서는 빌드 스크립트에서 더 나은 제어와 안전을 위해 Kotlin Gradle 플러그인을 수정했습니다. 이전에는 특정 DSL 컨텍스트를 위해 의도된 일부 Kotlin DSL 함수와 프로퍼티가 의도치 않게 다른 DSL 컨텍스트로 유출되었습니다. 이러한 유출은 잘못된 컴파일러 옵션 사용, 설정의 중복 적용 및 기타 잘못된 구성을 초래할 수 있었습니다:

```kotlin
kotlin {
    // 타겟 DSL은 kotlin{} 확장 DSL에 정의된 
    // 메서드 및 프로퍼티에 접근할 수 없어야 함
    jvm {
        // 컴파일 DSL은 kotlin{} 확장 DSL 및 Kotlin jvm{} 
        // 타겟 DSL에 정의된 메서드 및 프로퍼티에 접근할 수 없어야 함
        compilations.configureEach {
            // 컴파일 작업 DSL은 kotlin{} 확장, Kotlin jvm{} 
            // 타겟 또는 Kotlin 컴파일 DSL에 정의된 메서드 및 
            // 프로퍼티에 접근할 수 없어야 함
            compileTaskProvider.configure {
                // 예를 들어:
                explicitApi()
                // ERROR: kotlin{} 확장 DSL에 정의되어 있음
                mavenPublication {}
                // ERROR: Kotlin jvm{} 타겟 DSL에 정의되어 있음
                defaultSourceSet {}
                // ERROR: Kotlin 컴파일 DSL에 정의되어 있음
            }
        }
    }
}
```

이 문제를 해결하기 위해 `@KotlinGradlePluginDsl` 어노테이션을 추가하여, Kotlin Gradle 플러그인 DSL 함수 및 프로퍼티가 의도되지 않은 수준에서 노출되는 것을 방지했습니다. 다음 수준들은 서로 격리됩니다:

* Kotlin 확장 (extension)
* Kotlin 타겟 (target)
* Kotlin 컴파일 (compilation)
* Kotlin 컴파일 작업 (compilation task)

가장 빈번한 사례에 대해, 빌드 스크립트가 잘못 구성된 경우 수정 제안과 함께 컴파일러 경고를 추가했습니다. 예를 들어:

```kotlin
kotlin {
    jvm {
        sourceSets.getByName("jvmMain").dependencies {
            implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core-jvm:1.7.3")
        }
    }
}
```

이 경우 `sourceSets`에 대한 경고 메시지는 다음과 같습니다:

```none
[DEPRECATION] 'sourceSets: NamedDomainObjectContainer<KotlinSourceSet>' is deprecated. Accessing 'sourceSets' container on the Kotlin target level DSL is deprecated. Consider configuring 'sourceSets' on the Kotlin extension level.
```

이 변경 사항에 대한 피드백을 환영합니다! [#gradle Slack 채널](https://kotlinlang.slack.com/archives/C19FD9681)에서 Kotlin 개발자들에게 직접 의견을 전달해 주세요. [Slack 초대 받기](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up).

### Gradle 프로젝트의 Kotlin 데이터를 위한 새로운 디렉토리

> `.kotlin` 디렉토리를 버전 관리 시스템에 커밋하지 마세요.
> 예를 들어 Git을 사용하는 경우 프로젝트의 `.gitignore` 파일에 `.kotlin`을 추가하세요.
>
{style="warning"}

Kotlin 1.8.20에서 Kotlin Gradle 플러그인은 데이터를 Gradle 프로젝트 캐시 디렉토리인 `<project-root-directory>/.gradle/kotlin`에 저장하도록 전환되었습니다. 그러나 `.gradle` 디렉토리는 Gradle 전용으로 예약되어 있으므로 미래에도 안전하다고 보장하기 어렵습니다.

이를 해결하기 위해 Kotlin 2.0.0부터 Kotlin 데이터를 기본적으로 `<project-root-directory>/.kotlin`에 저장합니다. 하위 호환성을 위해 일부 데이터는 계속해서 `.gradle/kotlin` 디렉토리에 저장됩니다.

구성할 수 있는 새로운 Gradle 프로퍼티는 다음과 같습니다:

| Gradle 프로퍼티                                     | 설명                                                                                                        |
|-----------------------------------------------------|------------------------------------------------------------------------------------------------------------|
| `kotlin.project.persistent.dir`                     | 프로젝트 수준의 데이터가 저장되는 위치를 구성합니다. 기본값: `<project-root-directory>/.kotlin`       |
| `kotlin.project.persistent.dir.gradle.disableWrite` | Kotlin 데이터를 `.gradle` 디렉토리에 쓰는 것을 비활성화할지 제어하는 불리언 값입니다. 기본값: `false` |

이러한 프로퍼티를 프로젝트의 `gradle.properties` 파일에 추가하여 적용할 수 있습니다.

### 필요할 때만 다운로드되는 Kotlin/Native 컴파일러

Kotlin 2.0.0 이전에는 멀티플랫폼 프로젝트의 Gradle 빌드 스크립트에 [Kotlin/Native 타겟](native-target-support.md)이 구성되어 있으면, Gradle은 항상 [구성 단계(configuration phase)](https://docs.gradle.org/current/userguide/build_lifecycle.html#sec:configuration)에서 Kotlin/Native 컴파일러를 다운로드했습니다.

이는 [실행 단계(execution phase)](https://docs.gradle.org/current/userguide/build_lifecycle.html#sec:execution)에서 실행될 Kotlin/Native 타겟 컴파일 작업이 없는 경우에도 발생했습니다. 이러한 방식의 다운로드는 프로젝트에서 JVM이나 JavaScript 코드만 확인하려는 사용자(예: CI 프로세스의 일부로 테스트나 체크를 수행하는 경우)에게 특히 비효율적이었습니다.

Kotlin 2.0.0에서는 Kotlin Gradle 플러그인의 이 동작을 변경하여, Kotlin/Native 컴파일러를 [실행 단계](https://docs.gradle.org/current/userguide/build_lifecycle.html#sec:execution)에서 **오직** Kotlin/Native 타겟에 대한 컴파일이 요청될 때만 다운로드하도록 했습니다.

더불어, Kotlin/Native 컴파일러의 의존성도 이제 컴파일러의 일부가 아니라 실행 단계에서 함께 다운로드됩니다.

새로운 동작에 문제가 발생하면 `gradle.properties` 파일에 다음 Gradle 프로퍼티를 추가하여 일시적으로 이전 동작으로 돌아갈 수 있습니다:

```none
kotlin.native.toolchain.enabled=false
```

Kotlin 1.9.20-Beta부터 Kotlin/Native 배포판은 CDN과 함께 [Maven Central](https://repo.maven.apache.org/maven2/org/jetbrains/kotlin/kotlin-native-prebuilt/)에도 게시됩니다.

이를 통해 Kotlin이 필요한 아티팩트를 찾고 다운로드하는 방식을 변경할 수 있게 되었습니다. 이제 CDN 대신 기본적으로 프로젝트의 `repositories {}` 블록에 지정한 Maven 저장소를 사용합니다.

`gradle.properties` 파일에서 다음 Gradle 프로퍼티를 설정하여 이 동작을 일시적으로 되돌릴 수 있습니다:

```none
kotlin.native.distribution.downloadFromMaven=false
```

문제가 있다면 [YouTrack](https://kotl.in/issue)에 보고해 주세요. 기본 동작을 변경하는 이 두 가지 Gradle 프로퍼티는 임시적이며 향후 릴리스에서 제거될 예정입니다.

### 컴파일러 옵션을 정의하는 이전 방식의 지원 중단

이번 릴리스에서는 컴파일러 옵션을 설정하는 방법을 계속해서 정비하고 있습니다. 이는 서로 다른 방식 사이의 모호함을 해결하고 프로젝트 구성을 더 명확하게 만들어줄 것입니다.

Kotlin 2.0.0부터 컴파일러 옵션을 지정하기 위한 다음 DSL들이 지원 중단되었습니다:

* 모든 Kotlin 컴파일 작업을 구현하는 `KotlinCompile` 인터페이스의 `kotlinOptions` DSL. 대신 `KotlinCompilationTask<CompilerOptions>`를 사용하세요.
* `KotlinCompilation` 인터페이스의 `HasCompilerOptions` 타입을 가진 `compilerOptions` 프로퍼티. 이 DSL은 다른 DSL들과 일치하지 않았고 `KotlinCompilation.compileTaskProvider` 컴파일 작업 내부의 동일한 `KotlinCommonCompilerOptions` 객체를 구성했기 때문에 혼란을 주었습니다.

  대신 Kotlin 컴파일 작업의 `compilerOptions` 프로퍼티를 사용하는 것을 권장합니다:

  ```kotlin
  kotlinCompilation.compileTaskProvider.configure {
      compilerOptions { ... }
  }
  ```

  예를 들어:

  ```kotlin
  kotlin {
      js(IR) {
          compilations.all {
              compileTaskProvider.configure {
                  compilerOptions.freeCompilerArgs.add("-Xir-minimized-member-names=false")
              }
          }
      }
  }
  ```

* `KotlinCompilation` 인터페이스의 `kotlinOptions` DSL.
* `KotlinNativeArtifactConfig` 인터페이스, `KotlinNativeLink` 클래스 및 `KotlinNativeLinkArtifactTask` 클래스의 `kotlinOptions` DSL. 대신 `toolOptions` DSL을 사용하세요.
* `KotlinJsDce` 인터페이스의 `dceOptions` DSL. 대신 `toolOptions` DSL을 사용하세요.

Kotlin Gradle 플러그인에서 컴파일러 옵션을 지정하는 방법에 대한 자세한 내용은 [옵션 정의 방법](gradle-compiler-options.md#how-to-define-options)을 참조하세요.

### 지원되는 최소 AGP 버전 상향

Kotlin 2.0.0부터 지원되는 최소 Android Gradle 플러그인 버전은 7.1.3입니다.

### 최신 언어 버전을 시도해보기 위한 새로운 Gradle 프로퍼티

Kotlin 2.0.0 이전에는 새로운 K2 컴파일러를 사용해보기 위한 `kotlin.experimental.tryK2`라는 Gradle 프로퍼티가 있었습니다. 이제 Kotlin 2.0.0에서 K2 컴파일러가 기본적으로 활성화되었으므로, 이 프로퍼티를 프로젝트에서 최신 언어 버전을 시도해볼 수 있는 새로운 형태인 `kotlin.experimental.tryNext`로 발전시키기로 결정했습니다. `gradle.properties` 파일에서 이 프로퍼티를 사용하면 Kotlin Gradle 플러그인이 언어 버전을 현재 Kotlin 버전의 기본값보다 하나 높은 값으로 상향 조정합니다. 예를 들어 Kotlin 2.0.0에서 기본 언어 버전은 2.0이므로, 이 프로퍼티는 언어 버전 2.1을 구성합니다.

이 새로운 Gradle 프로퍼티는 이전의 `kotlin.experimental.tryK2`와 마찬가지로 [빌드 리포트](gradle-compilation-and-caches.md#build-reports)에서 유사한 메트릭을 생성합니다. 구성된 언어 버전이 출력에 포함됩니다. 예를 들어:

```none
##### 'kotlin.experimental.tryNext' 결과 #####
:app:compileKotlin: 2.1 언어 버전
:lib:compileKotlin: 2.1 언어 버전
##### 100% (2/2) 작업이 Kotlin 2.1로 컴파일되었습니다 #####
```

빌드 리포트를 활성화하는 방법과 그 내용에 대해 자세히 알아보려면 [빌드 리포트](gradle-compilation-and-caches.md#build-reports)를 참조하세요.

### 빌드 리포트를 위한 새로운 JSON 출력 형식

Kotlin 1.7.0에서는 컴파일러 성능 추적을 돕기 위해 빌드 리포트를 도입했습니다. 시간이 지남에 따라 성능 문제 조사 시 더욱 상세하고 유용한 정보를 제공하기 위해 더 많은 메트릭을 추가해 왔습니다. 이전에는 로컬 파일의 유일한 출력 형식이 `*.txt`였습니다. Kotlin 2.0.0에서는 다른 도구를 사용한 분석을 더욱 쉽게 하기 위해 JSON 출력 형식을 지원합니다.

빌드 리포트를 위해 JSON 출력 형식을 구성하려면 `gradle.properties` 파일에 다음 프로퍼티를 선언하세요:

```none
kotlin.build.report.output=json

// 빌드 리포트를 저장할 디렉토리
kotlin.build.report.json.directory=my/directory/path
```

또는 다음 명령을 실행할 수 있습니다:

```shell
./gradlew assemble -Pkotlin.build.report.output=json -Pkotlin.build.report.json.directory="my/directory/path"
``` 

구성되면 Gradle은 지정한 디렉토리에 `${project_name}-date-time-<sequence_number>.json`이라는 이름으로 빌드 리포트를 생성합니다.

다음은 빌드 메트릭과 집계된(aggregated) 메트릭을 포함하는 JSON 출력 형식의 빌드 리포트 예시 조각입니다:

```json
"buildOperationRecord": [
    {
     "path": ":lib:compileKotlin",
      "classFqName": "org.jetbrains.kotlin.gradle.tasks.KotlinCompile_Decorated",
      "startTimeMs": 1714730820601,
      "totalTimeMs": 2724,
      "buildMetrics": {
        "buildTimes": {
          "buildTimesNs": {
            "CLEAR_OUTPUT": 713417,
            "SHRINK_AND_SAVE_CURRENT_CLASSPATH_SNAPSHOT_AFTER_COMPILATION": 19699333,
            "IR_TRANSLATION": 281000000,
            "NON_INCREMENTAL_LOAD_CURRENT_CLASSPATH_SNAPSHOT": 14088042,
            "CALCULATE_OUTPUT_SIZE": 1301500,
            "GRADLE_TASK": 2724000000,
            "COMPILER_INITIALIZATION": 263000000,
            "IR_GENERATION": 74000000,
...
          }
        }
...
 "aggregatedMetrics": {
    "buildTimes": {
      "buildTimesNs": {
        "CLEAR_OUTPUT": 782667,
        "SHRINK_AND_SAVE_CURRENT_CLASSPATH_SNAPSHOT_AFTER_COMPILATION": 22031833,
        "IR_TRANSLATION": 333000000,
        "NON_INCREMENTAL_LOAD_CURRENT_CLASSPATH_SNAPSHOT": 14890292,
        "CALCULATE_OUTPUT_SIZE": 2370750,
        "GRADLE_TASK": 3234000000,
        "COMPILER_INITIALIZATION": 292000000,
        "IR_GENERATION": 89000000,
...
      }
    }
```

### kapt 구성이 상위 구성으로부터 어노테이션 프로세서를 상속함

Kotlin 2.0.0 이전에는 별도의 Gradle 구성에 공통 어노테이션 프로세서 세트를 정의하고 하위 프로젝트의 kapt 전용 구성에서 이 구성을 확장하려는 경우, kapt가 어노테이션 프로세서를 찾지 못해 어노테이션 처리를 건너뛰었습니다. Kotlin 2.0.0에서 kapt는 어노테이션 프로세서에 대한 간접적인 의존성이 있음을 성공적으로 감지할 수 있습니다.

예를 들어 [Dagger](https://dagger.dev/)를 사용하는 하위 프로젝트의 경우, `build.gradle(.kts)` 파일에서 다음 구성을 사용하세요:

```kotlin
val commonAnnotationProcessors by configurations.creating
configurations.named("kapt") { extendsFrom(commonAnnotationProcessors) }

dependencies {
    implementation("com.google.dagger:dagger:2.48.1")
    commonAnnotationProcessors("com.google.dagger:dagger-compiler:2.48.1")
}
```

이 예제에서 `commonAnnotationProcessors` Gradle 구성은 모든 프로젝트에서 사용하려는 어노테이션 처리를 위한 공통 구성입니다. [`extendsFrom()`](https://docs.gradle.org/current/dsl/org.gradle.api.artifacts.Configuration.html#org.gradle.api.artifacts.Configuration:extendsFrom) 메서드를 사용하여 `commonAnnotationProcessors`를 상위 구성(superconfiguration)으로 추가합니다. kapt는 `commonAnnotationProcessors` Gradle 구성이 Dagger 어노테이션 프로세서에 의존하고 있음을 확인합니다. 따라서 kapt는 어노테이션 처리를 위한 구성에 Dagger 어노테이션 프로세서를 포함합니다.

[구현](https://github.com/JetBrains/kotlin/pull/5198)에 기여해 주신 Christoph Loy 님께 감사드립니다!

### Kotlin Gradle 플러그인이 더 이상 지원 중단된 Gradle 컨벤션을 사용하지 않음

Kotlin 2.0.0 이전에는 Gradle 8.2 이상을 사용하는 경우, Kotlin Gradle 플러그인이 Gradle 8.2에서 지원 중단된 Gradle 컨벤션을 잘못 사용했습니다. 이로 인해 Gradle은 빌드 지원 중단을 보고했습니다. Kotlin 2.0.0에서는 Gradle 8.2 이상을 사용할 때 이러한 지원 중단 경고가 더 이상 발생하지 않도록 Kotlin Gradle 플러그인이 업데이트되었습니다.

## 표준 라이브러리

이번 릴리스는 Kotlin 표준 라이브러리에 더 큰 안정성을 제공하고 기존의 더 많은 함수를 모든 플랫폼에서 공통으로 사용할 수 있게 합니다:

* [enum 클래스 values 제네릭 함수의 안정적인 대체](#stable-replacement-of-the-enum-class-values-generic-function)
* [AutoCloseable 인터페이스 안정화](#stable-autocloseable-interface)
* [공통 protected 프로퍼티 AbstractMutableList.modCount](#common-protected-property-abstractmutablelist-modcount)
* [공통 protected 함수 AbstractMutableList.removeRange](#common-protected-function-abstractmutablelist-removerange)
* [공통 String.toCharArray(destination)](#common-string-tochararray-destination-function)

### enum 클래스 values 제네릭 함수의 안정적인 대체

Kotlin 2.0.0에서 `enumEntries<T>()` 함수가 [안정화(Stable)](components-stability.md#stability-levels-explained)되었습니다. `enumEntries<T>()` 함수는 제네릭 `enumValues<T>()` 함수를 대체합니다. 새로운 함수는 주어진 enum 타입 `T`에 대한 모든 enum 항목의 리스트를 반환합니다. 이전에 도입된 enum 클래스의 `entries` 프로퍼티 역시 합성(synthetic) `values()` 함수를 대체하기 위해 안정화되었습니다. `entries` 프로퍼티에 대한 자세한 내용은 [Kotlin 1.8.20의 새로운 기능](whatsnew1820.md#a-modern-and-performant-replacement-of-the-enum-class-values-function)을 참조하세요.

> `enumValues<T>()` 함수는 여전히 지원되지만, 성능 영향이 적은 `enumEntries<T>()` 함수를 대신 사용하는 것이 좋습니다. `enumValues<T>()`를 호출할 때마다 새 배열이 생성되는 반면, `enumEntries<T>()`를 호출하면 매번 동일한 리스트가 반환되므로 훨씬 더 효율적입니다.
>
{style="tip"}

예를 들어:

```kotlin
enum class RGB { RED, GREEN, BLUE }

inline fun <reified T : Enum<T>> printAllValues() {
    print(enumEntries<T>().joinToString { it.name })
}

printAllValues<RGB>()
// RED, GREEN, BLUE
```

### AutoCloseable 인터페이스 안정화

Kotlin 2.0.0에서 공통 [`AutoCloseable`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-auto-closeable/) 인터페이스가 [안정화(Stable)](components-stability.md#stability-levels-explained)되었습니다. 이를 통해 자원을 쉽게 닫을 수 있으며 다음과 같은 유용한 함수들이 포함되어 있습니다:

* `use()` 확장 함수: 선택한 자원에서 주어진 블록 함수를 실행한 후, 예외 발생 여부와 상관없이 자원을 올바르게 닫습니다.
* `AutoCloseable()` 생성자 함수: `AutoCloseable` 인터페이스의 인스턴스를 생성합니다.

아래 예제에서는 `XMLWriter` 인터페이스를 정의하고 이를 구현하는 자원이 있다고 가정합니다. 예를 들어, 이 자원은 파일을 열고 XML 내용을 쓴 다음 파일을 닫는 클래스일 수 있습니다:

```kotlin
interface XMLWriter {
    fun document(encoding: String, version: String, content: XMLWriter.() -> Unit)
    fun element(name: String, content: XMLWriter.() -> Unit)
    fun attribute(name: String, value: String)
    fun text(value: String)

    fun flushAndClose()
}

fun writeBooksTo(writer: XMLWriter) {
    val autoCloseable = AutoCloseable { writer.flushAndClose() }
    autoCloseable.use {
        writer.document(encoding = "UTF-8", version = "1.0") {
            element("bookstore") {
                element("book") {
                    attribute("category", "fiction")
                    element("title") { text("Harry Potter and the Prisoner of Azkaban") }
                    element("author") { text("J. K. Rowling") }
                    element("year") { text("1999") }
                    element("price") { text("29.99") }
                }
                element("book") {
                    attribute("category", "programming")
                    element("title") { text("Kotlin in Action") }
                    element("author") { text("Dmitry Jemerov") }
                    element("author") { text("Svetlana Isakova") }
                    element("year") { text("2017") }
                    element("price") { text("25.19") }
                }
            }
        }
    }
}
```

### 공통 protected 프로퍼티 AbstractMutableList.modCount

이번 릴리스에서는 `AbstractMutableList` 인터페이스의 [`modCount`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-abstract-mutable-list/mod-count.html) `protected` 프로퍼티가 공통으로 제공됩니다. 이전에는 `modCount` 프로퍼티를 각 플랫폼에서 사용할 수 있었지만 공통 타겟에서는 사용할 수 없었습니다. 이제 `AbstractMutableList`를 커스텀으로 구현하고 공통 코드에서 이 프로퍼티에 접근할 수 있습니다.

이 프로퍼티는 컬렉션에 가해진 구조적 변경 횟수를 추적합니다. 여기에는 컬렉션 크기를 변경하거나 진행 중인 반복 작업(iteration)이 잘못된 결과를 반환하게 할 수 있는 방식으로 리스트를 수정하는 작업이 포함됩니다.

커스텀 리스트를 구현할 때 `modCount` 프로퍼티를 사용하여 동시 수정(concurrent modification)을 등록하고 감지할 수 있습니다.

### 공통 protected 함수 AbstractMutableList.removeRange

이번 릴리스에서는 `AbstractMutableList` 인터페이스의 [`removeRange()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-abstract-mutable-list/remove-range.html) `protected` 함수가 공통으로 제공됩니다. 이전에는 각 플랫폼에서 사용할 수 있었지만 공통 타겟에서는 사용할 수 없었습니다. 이제 `AbstractMutableList`를 커스텀으로 구현하고 공통 코드에서 이 함수를 오버라이드할 수 있습니다.

이 함수는 지정된 범위에 따라 리스트에서 요소를 제거합니다. 이 함수를 오버라이드하면 커스텀 구현을 활용하여 리스트 작업의 성능을 개선할 수 있습니다.

### 공통 String.toCharArray(destination) 함수

이번 릴리스는 공통 [`String.toCharArray(destination)`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/to-char-array.html) 함수를 도입합니다. 이전에는 JVM에서만 사용할 수 있었습니다.

기존의 [`String.toCharArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/to-char-array.html) 함수와 비교해 보겠습니다. 기존 함수는 지정된 문자열의 문자를 포함하는 새로운 `CharArray`를 생성합니다. 반면, 새로운 공통 `String.toCharArray(destination)` 함수는 `String` 문자를 기존의 대상 `CharArray`로 옮깁니다. 이는 이미 채우고자 하는 버퍼가 있는 경우에 유용합니다:

```kotlin
fun main() {
    val myString = "Kotlin is awesome!"
    val destinationArray = CharArray(myString.length)

    // 문자열을 변환하여 destinationArray에 저장:
    myString.toCharArray(destinationArray)

    for (char in destinationArray) {
        print("$char ")
        // K o t l i n   i s   a w e s o m e ! 
    }
}
```
{kotlin-runnable="true"}

## Kotlin 2.0.0 설치하기

IntelliJ IDEA 2023.3 및 Android Studio Iguana (2023.2.1) Canary 15부터 Kotlin 플러그인은 IDE에 포함된 번들 플러그인으로 배포됩니다. 즉, 더 이상 JetBrains Marketplace에서 플러그인을 설치할 수 없습니다.

새로운 Kotlin 버전으로 업데이트하려면 빌드 스크립트에서 [Kotlin 버전을 2.0.0으로 변경](releases.md#update-to-a-new-kotlin-version)하세요.