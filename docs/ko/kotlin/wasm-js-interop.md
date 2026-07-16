[//]: # (title: JavaScript와의 상호운용성)

<primary-label ref="beta"/> 

Kotlin/Wasm을 사용하면 Kotlin에서 JavaScript 코드를 사용하거나 JavaScript에서 Kotlin 코드를 모두 사용할 수 있습니다.

[Kotlin/JS](js-overview.md)와 마찬가지로 Kotlin/Wasm 컴파일러도 JavaScript와의 상호운용성을 지원합니다. Kotlin/JS의 상호운용성에 익숙하다면 Kotlin/Wasm의 상호운용성도 유사하다는 것을 알 수 있습니다. 하지만 고려해야 할 몇 가지 중요한 차이점이 있습니다.

> Kotlin/Wasm은 [Beta](components-stability.md) 상태입니다. 언제든지 변경될 수 있습니다. 프로덕션 이전 단계의 시나리오에서만 사용하세요. 
> [YouTrack](https://youtrack.jetbrains.com/issue/KT-56492)을 통해 여러분의 피드백을 기다리고 있습니다.
>
{style="note"}

## Kotlin에서 JavaScript 코드 사용하기

`external` 선언, JavaScript 코드 스니펫이 포함된 함수, 그리고 `@JsModule` 어노테이션을 사용하여 Kotlin에서 JavaScript 코드를 사용하는 방법을 알아봅니다.

### 외부 선언 (External declarations)

기본적으로 외부 JavaScript 코드는 Kotlin에서 보이지 않습니다.
Kotlin에서 JavaScript 코드를 사용하려면 `external` 선언으로 해당 API를 설명해야 합니다.

#### JavaScript 함수

다음과 같은 JavaScript 함수가 있다고 가정해 보겠습니다. 

```javascript
function greet (name) {
    console.log("Hello, " + name + "!");
}
```

이를 Kotlin에서 `external` 함수로 선언할 수 있습니다.

```kotlin
external fun greet(name: String)
```

외부 함수는 본문(body)을 가지지 않으며, 일반적인 Kotlin 함수처럼 호출할 수 있습니다.

```kotlin
fun main() {
    greet("Alice")
}
```

#### JavaScript 프로퍼티

다음과 같은 전역 JavaScript 변수가 있다고 가정해 보겠습니다.

```javascript
let globalCounter = 0;
```

이를 Kotlin에서 외부 `var` 또는 `val` 프로퍼티를 사용하여 선언할 수 있습니다.

```kotlin
external var globalCounter: Int
```

이러한 프로퍼티는 외부에서 초기화됩니다. Kotlin 코드 내에서 `= value` 형태의 초기화 식을 가질 수 없습니다.

#### JavaScript 클래스

다음과 같은 JavaScript 클래스가 있다고 가정해 보겠습니다.

```javascript
class Rectangle {
    constructor (height, width) {
        this.height = height;
        this.width = width;
    }

    area () {
        return this.height * this.width;
    }
}
```

이를 Kotlin에서 외부 클래스로 사용할 수 있습니다.

```kotlin
external class Rectangle(height: Double, width: Double) : JsAny {
    val height: Double
    val width: Double
    fun area(): Double
}
```

`external` 클래스 내부의 모든 선언은 암시적으로 외부 선언으로 간주됩니다.

#### 외부 인터페이스 (External interfaces)

Kotlin에서 JavaScript 객체의 형태(shape)를 설명할 수 있습니다. 다음 JavaScript 함수와 그 반환값을 살펴보세요.

```javascript
function createUser (name, age) {
    return { name: name, age: age };
}
```

이 형태를 Kotlin에서 `external interface User` 타입으로 어떻게 설명할 수 있는지 확인해 보세요.

```kotlin
external interface User : JsAny {
    val name: String
    val age: Int
}

external fun createUser(name: String, age: Int): User
```

외부 인터페이스는 런타임 타입 정보가 없으며 컴파일 타임 전용 개념입니다.
따라서 외부 인터페이스는 일반 인터페이스에 비해 몇 가지 제한 사항이 있습니다.
* `is` 검사의 우측항으로 사용할 수 없습니다.
* 클래스 리터럴 식(예: `User::class`)에 사용할 수 없습니다.
* 실체화된 타입 인자(reified type arguments)로 전달할 수 없습니다.
* 외부 인터페이스로 `as` 캐스팅하는 것은 항상 성공합니다.

#### 외부 객체 (External objects)

객체를 담고 있는 다음과 같은 JavaScript 변수가 있다고 가정해 보겠습니다.

```javascript
let Counter = {
    value: 0,
    step: 1,
    increment () {
        this.value += this.step;
    }
};
```

이를 Kotlin에서 외부 객체로 사용할 수 있습니다.

```kotlin
external object Counter : JsAny {
    fun increment()
    val value: Int
    var step: Int
}
```

#### 외부 타입 계층 구조 (External type hierarchy)

일반 클래스 및 인터페이스와 마찬가지로, 다른 외부 클래스를 확장하거나 외부 인터페이스를 구현하도록 외부 선언을 할 수 있습니다.
그러나 동일한 타입 계층 구조 내에서 외부 선언과 비외부(non-external) 선언을 혼합하여 사용할 수는 없습니다.

#### @nativeInvoke를 사용한 호출 가능한 JavaScript 객체
<primary-label ref="experimental-opt-in"/>

`external` 선언(클래스 또는 인터페이스)의 Kotlin 멤버 함수에 `@nativeInvoke` 어노테이션을 사용하여 JavaScript 함수처럼 호출할 수 있도록 만들 수 있습니다.

이 어노테이션을 사용하면 Kotlin에서 해당 함수를 호출할 때마다 JavaScript 객체에 대한 직접 호출로 변환됩니다.

```kotlin
import kotlin.js.nativeInvoke

@OptIn(ExperimentalWasmJsInterop::class)
external class JsAction {
    @nativeInvoke
    operator fun invoke(data: String)
}

fun main() {
    val action = JsAction() 
    action("Run task")
}
```

> `@nativeInvoke` 어노테이션은 안정적인 상호운용성을 위한 설계가 나오기 전까지의 일시적인 해결책입니다.
> 현재 `@nativeInvoke`를 사용하면 컴파일러에서 경고를 보고합니다.
>
> {style="note"}

### JavaScript 코드가 포함된 Kotlin 함수

함수 본문을 `= js("code")`로 정의하여 Kotlin/Wasm 코드에 JavaScript 스니펫을 추가할 수 있습니다.

```kotlin
fun getCurrentURL(): String =
    js("window.location.href")
```

JavaScript 구문 블록을 실행하려는 경우, 문자열 내의 코드를 중괄호 `{}`로 감싸세요.

```kotlin
fun setLocalSettings(value: String): Unit = js(
    """{
        localStorage.setItem('settings', value);
}"""
)
```

객체를 반환하려는 경우, 중괄호 `{}`를 괄호 `()`로 감싸세요.

```kotlin
fun createJsUser(name: String, age: Int): JsAny =
    js("({ name: name, age: age })")
```

Kotlin/Wasm은 `js()` 함수 호출을 특별한 방식으로 처리하며, 구현에는 몇 가지 제한 사항이 있습니다.
* `js()` 함수 호출에는 반드시 문자열 리터럴 인자가 전달되어야 합니다.
* `js()` 함수 호출은 함수 본문의 유일한 표현식이어야 합니다.
* `js()` 함수는 패키지 수준 함수에서만 호출할 수 있습니다.
* 함수의 반환 타입을 명시적으로 제공해야 합니다.
* [타입](#type-correspondence)은 `external fun`과 유사하게 제한됩니다.

Kotlin 컴파일러는 생성된 JavaScript 파일 내의 함수에 코드 문자열을 넣고 이를 WebAssembly 포맷으로 임포트합니다.
Kotlin 컴파일러는 이러한 JavaScript 스니펫을 검증하지 않습니다.
JavaScript 구문 오류가 있는 경우, JavaScript 코드를 실행할 때 보고됩니다.

> `@JsFun` 어노테이션도 유사한 기능을 제공하며, 향후 지원 중단(deprecated)될 가능성이 높습니다.
>
{style="note"}

### JavaScript 모듈

기본적으로 외부 선언은 JavaScript 전역 스코프에 대응합니다. Kotlin 파일에 [`@JsModule` 어노테이션](js-modules.md#jsmodule-annotation)을 추가하면, 해당 파일 내의 모든 외부 선언은 지정된 모듈에서 임포트됩니다.

다음 JavaScript 코드 샘플을 살펴보세요.

```javascript
// users.mjs
export let maxUsers = 10;

export class User {
    constructor (username) {
        this.username = username;
    }
}
```

`@JsModule` 어노테이션을 사용하여 이 JavaScript 코드를 Kotlin에서 사용하세요.

```kotlin
// Kotlin
@file:JsModule("./users.mjs")

external val maxUsers: Int

external class User : JsAny {
    constructor(username: String)

    val username: String
}
```

### 배열 상호운용성

JavaScript의 `JsArray<T>`를 Kotlin의 기본 `Array` 또는 `List` 타입으로 복사할 수 있으며, 마찬가지로 이러한 Kotlin 타입을 `JsArray<T>`로 복사할 수 있습니다.

`JsArray<T>`를 `Array<T>`로 변환하거나 그 반대로 변환하려면 제공되는 [어댑터 함수](https://github.com/Kotlin/kotlinx-browser/blob/dfbdceed314567983c98f1d66e8c2e10d99c5a55/src/wasmJsMain/kotlin/arrayCopy.kt) 중 하나를 사용하세요.

다음은 제네릭 타입 간 변환의 예입니다.

```kotlin
val list: `List<JsString>` =
    listOf("Kotlin", "Wasm").map { it.toJsString() }

// .toJsArray()를 사용하여 List나 Array를 JsArray로 변환
val jsArray: JsArray<JsString> = list.toJsArray()

// .toArray() 및 .toList()를 사용하여 다시 Kotlin 타입으로 변환
val kotlinArray: `Array<JsString>` = jsArray.toArray()
val kotlinList: `List<JsString>` = jsArray.toList()
```

타입화된 배열(typed arrays)을 대응하는 Kotlin 배열(예: `IntArray` 및 `Int32Array`)로 변환하기 위한 유사한 어댑터 함수들도 제공됩니다. 자세한 정보와 구현 내용은 [`kotlinx-browser` 리포지토리](https://github.com/Kotlin/kotlinx-browser/blob/dfbdceed314567983c98f1d66e8c2e10d99c5a55/src/wasmJsMain/kotlin/arrayCopy.kt)를 참조하세요.

다음은 타입화된 배열 간 변환의 예입니다.

```kotlin
import org.khronos.webgl.*

    // ...

    val intArray: IntArray = intArrayOf(1, 2, 3)
    
    // .toInt32Array()를 사용하여 Kotlin IntArray를 JavaScript Int32Array로 변환
    val jsInt32Array: Int32Array = intArray.toInt32Array()
    
    // toIntArray()를 사용하여 JavaScript Int32Array를 다시 Kotlin IntArray로 변환
    val kotlinIntArray: IntArray = jsInt32Array.toIntArray()
```

## JavaScript에서 Kotlin 코드 사용하기

`@JsExport` 어노테이션을 사용하여 Kotlin 코드를 JavaScript에서 사용하는 방법을 알아봅니다.

### @JsExport 어노테이션이 있는 함수

Kotlin/Wasm 함수를 JavaScript 코드에서 사용할 수 있게 하려면 `@JsExport` 어노테이션을 사용하세요.

```kotlin
// Kotlin/Wasm

@JsExport
fun addOne(x: Int): Int = x + 1
```

`@JsExport` 어노테이션이 표시된 Kotlin/Wasm 함수는 생성된 `.mjs` 모듈의 `default` 익스포트 상의 프로퍼티로 표시됩니다. 그러면 JavaScript에서 이 함수를 사용할 수 있습니다.

```javascript
// JavaScript

import exports from "./module.mjs"

exports.addOne(10)
```

Kotlin/Wasm 컴파일러는 Kotlin 코드의 `@JsExport` 선언으로부터 TypeScript 정의를 생성할 수 있습니다. 이러한 정의는 IDE 및 JavaScript 도구에서 코드 자동 완성, 타입 검사 지원, 그리고 JavaScript 및 TypeScript에서 Kotlin 코드를 더 쉽게 사용하도록 돕는 데 사용될 수 있습니다.

Kotlin/Wasm 컴파일러는 `@JsExport` 어노테이션이 표시된 모든 최상위 함수를 수집하여 `.d.ts` 파일에 TypeScript 정의를 자동으로 생성합니다.

TypeScript 정의를 생성하려면 `build.gradle.kts` 파일의 `wasmJs{}` 블록에 `generateTypeScriptDefinitions()` 함수를 추가하세요.

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

> Kotlin/Wasm에서 TypeScript 선언 파일을 생성하는 기능은 [Experimental](components-stability.md#stability-levels-explained) 단계입니다.
> 언제든지 삭제되거나 변경될 수 있습니다.
>
{style="warning"}

## 타입 대응 (Type correspondence)

Kotlin/Wasm은 JavaScript 상호운용성 선언의 시그니처에서 특정 타입만 허용합니다.
이러한 제한은 `external`, `= js("code")` 또는 `@JsExport`를 사용한 선언에 공통적으로 적용됩니다.

Kotlin 타입이 JavaScript 타입에 어떻게 대응하는지 확인해 보세요.

| Kotlin                                                     | JavaScript                        |
|------------------------------------------------------------|-----------------------------------|
| `Byte`, `Short`, `Int`, `Char`, `UByte`, `UShort`, `UInt`, | `Number`                          |
| `Float`, `Double`,                                         | `Number`                          |
| `Long`, `ULong`,                                           | `BigInt`                          |
| `Boolean`,                                                 | `Boolean`                         |
| `String`,                                                  | `String`                          |
| 반환 위치의 `Unit`                                          | `undefined`                       |
| 함수 타입 (예: `(String) -> Int`)                            | Function                          |
| `JsAny` 및 그 하위 타입                                      | 모든 JavaScript 값                 |
| `JsReference`                                              | Kotlin 객체에 대한 불투명 참조 (Opaque reference) |
| 기타 타입                                                   | 지원되지 않음                       |

이러한 타입들의 널 허용(nullable) 버전도 사용할 수 있습니다.

### JsAny 타입

JavaScript 값은 Kotlin에서 `JsAny` 타입과 그 하위 타입을 사용하여 표현됩니다.

Kotlin/Wasm 표준 라이브러리는 이러한 타입 중 일부에 대한 표현을 제공합니다.
* `kotlin.js` 패키지:
    * `JsAny`
    * `JsBoolean`, `JsNumber`, `JsString`
    * `JsArray`
    * `Promise`

또한 `external` 인터페이스나 클래스를 선언하여 커스텀 `JsAny` 하위 타입을 만들 수도 있습니다.

### JsReference 타입

Kotlin 값은 `JsReference` 타입을 사용하여 JavaScript에 불투명 참조로 전달될 수 있습니다.

예를 들어, 다음과 같은 Kotlin 클래스 `User`를 JavaScript에 노출하고 싶다고 가정해 보겠습니다.

```kotlin
class User(var name: String)
```

`toJsReference()` 함수를 사용하여 `JsReference<User>`를 생성하고 이를 JavaScript로 반환할 수 있습니다.

```kotlin
@JsExport
fun createUser(name: String): JsReference<User> {
    return User(name).toJsReference()
}
```

이러한 참조는 JavaScript에서 직접 사용할 수 없으며 비어 있는 고정된(frozen) JavaScript 객체처럼 작동합니다.
이러한 객체를 조작하려면, 참조 값을 언래핑(unwrap)하는 `get()` 메서드를 사용하는 추가 함수들을 JavaScript로 익스포트해야 합니다.

```kotlin
@JsExport
fun setUserName(user: JsReference<User>, name: String) {
    user.get().name = name
}
```

이제 클래스를 생성하고 JavaScript에서 그 이름을 변경할 수 있습니다.

```javascript
import UserLib from "./userlib.mjs"

let user = UserLib.createUser("Bob");
UserLib.setUserName(user, "Alice");
```

### 타입 파라미터

JavaScript 상호운용성 선언은 `JsAny` 또는 그 하위 타입을 상한 경계(upper bound)로 갖는 경우 타입 파라미터를 가질 수 있습니다. 예를 들어:

```kotlin
external fun <T : JsAny> processData(data: JsArray<T>): T
```

## 예외 처리

Kotlin/Wasm 코드에서 JavaScript 예외를 잡기 위해 Kotlin의 `try-catch` 표현식을 사용할 수 있습니다.
예외 처리는 다음과 같이 작동합니다.

* JavaScript에서 발생한 예외: Kotlin 측에서 상세 정보를 확인할 수 있습니다.
  이러한 예외가 다시 JavaScript로 전파되면 더 이상 WebAssembly로 래핑되지 않습니다.

* Kotlin에서 발생한 예외: JavaScript 측에서 일반적인 JS 에러로 잡을 수 있습니다.

다음은 Kotlin 측에서 JavaScript 예외를 잡는 예제입니다.

```kotlin
external object JSON {
    fun <T: JsAny> parse(json: String): T
}

fun main() {
    try {
        JSON.parse("an invalid JSON")
    } catch (e: JsException) {
        println("Thrown value is: ${e.thrownValue}")
        // Thrown value is: SyntaxError: Unexpected token 'a', "an invalid JSON" is not valid JSON

        println("Message: ${e.message}")
        // Message: Unexpected token 'a', "an invalid JSON" is not valid JSON

        println("Stacktrace:")
        // Stacktrace:

        // 전체 JavaScript 스택 트레이스를 출력합니다.
        e.printStackTrace()
    }
}
```

이러한 예외 처리는 [`WebAssembly.JSTag`](https://webassembly.github.io/exception-handling/js-api/#dom-webassembly-jstag) 기능을 지원하는 최신 브라우저에서 자동으로 작동합니다.

* Chrome 115+
* Firefox 129+
* Safari 18.4+

## Kotlin/Wasm과 Kotlin/JS 상호운용성의 차이점

Kotlin/Wasm 상호운용성은 Kotlin/JS 상호운용성과 유사한 점이 많지만, 고려해야 할 몇 가지 중요한 차이점이 있습니다.

|                         | **Kotlin/Wasm**                                                                                                                                                                                                     | **Kotlin/JS**                                                                                                                                       |
|-------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| **외부 열거형 (External enums)** | 외부 열거형 클래스를 지원하지 않습니다.                                                                                                                                                                              | 외부 열거형 클래스를 지원합니다.                                                                                                                     |
| **타입 확장 (Type extensions)** | 비외부(non-external) 타입이 외부 타입을 확장하는 것을 지원하지 않습니다.                                                                                                                                                        | 비외부 타입을 지원합니다.                                                                                                                        |
| **`JsName` 어노테이션** | 외부 선언에 어노테이션을 달 때만 효과가 있습니다.                                                                                                                                                           | 일반 비외부 선언의 이름을 변경하는 데 사용할 수 있습니다.                                                                                   |
| **`js()` 함수**       | `js("code")` 함수 호출은 패키지 수준 함수의 단일 표현식 본문으로만 허용됩니다.                                                                                                                     | `js("code")` 함수는 어떤 문맥에서든 호출할 수 있으며 `dynamic` 값을 반환합니다.                                                               |
| **모듈 시스템**      | ES 모듈만 지원합니다. `@JsNonModule` 어노테이션과 유사한 기능이 없습니다. `default` 객체의 속성으로 익스포트를 제공합니다. 패키지 수준 함수만 익스포트할 수 있습니다.                           | ES 모듈 및 레거시 모듈 시스템을 지원합니다. 이름이 지정된 ESM 익스포트를 제공합니다. 클래스 및 객체를 익스포트할 수 있습니다.                                    |
| **타입**               | `external`, `= js("code")`, `@JsExport` 등 모든 상호운용성 선언에 더 엄격한 타입 제한을 일관되게 적용합니다. 선별된 수의 [내장 Kotlin 타입 및 `JsAny` 하위 타입](#type-correspondence)만 허용합니다. | `external` 선언에서 모든 타입을 허용합니다. [`@JsExport`에서 사용할 수 있는 타입](js-to-kotlin-interop.md#kotlin-types-in-javascript)을 제한합니다. |
| **Long**                | 타입이 JavaScript의 `BigInt`에 대응합니다.                                                                                                                                                                            | JavaScript에서 커스텀 클래스로 보입니다.                                                                                                            |
| **배열 (Arrays)**              | 아직 상호운용성에서 직접 지원되지 않습니다. 대신 새로운 `JsArray` 타입을 사용할 수 있습니다.                                                                                                                                  | JavaScript 배열로 구현됩니다.                                                                                                                   |
| **기타 타입**         | Kotlin 객체를 JavaScript로 전달하려면 `JsReference<>`가 필요합니다.                                                                                                                                                      | 외부 선언에서 비외부 Kotlin 클래스 타입을 사용할 수 있습니다.                                                                         |
| **예외 처리**  | `JsException` 및 `Throwable` 타입을 사용하여 모든 JavaScript 예외를 잡을 수 있습니다.                                                                                                                                | `Throwable` 타입을 사용하여 JavaScript `Error`를 잡을 수 있습니다. `dynamic` 타입을 사용하여 모든 JavaScript 예외를 잡을 수 있습니다.                            |
| **동적 타입 (Dynamic types)**       | `dynamic` 타입을 지원하지 않습니다. 대신 `JsAny`를 사용하세요(아래 샘플 코드 참조).                                                                                                                                   | `dynamic` 타입을 지원합니다.                                                                                                                        |

> 타입이 지정되지 않았거나 느슨하게 타입이 지정된 객체와의 상호운용성을 위한 Kotlin/JS의 [동적 타입(dynamic type)](dynamic-type.md)은 Kotlin/Wasm에서 지원되지 않습니다. `dynamic` 타입 대신 `JsAny` 타입을 사용할 수 있습니다.
>
> ```kotlin
> // Kotlin/JS
> fun processUser(user: dynamic, age: Int) {
>     // ...
>     user.profile.updateAge(age)
>     // ...
> }
>
> // Kotlin/Wasm
> private fun updateUserAge(user: JsAny, age: Int): Unit =
>     js("{ user.profile.updateAge(age); }")
>
> fun processUser(user: JsAny, age: Int) {
>     // ...
>     updateUserAge(user, age)
>     // ...
> }
> ```
>
{style="note"}

## 웹 관련 브라우저 API

[`kotlinx-browser` 라이브러리](https://github.com/kotlin/kotlinx-browser)는 다음과 같은 JavaScript 브라우저 API를 제공하는 독립 라이브러리입니다.
* `org.khronos.webgl` 패키지:
  * `Int8Array`와 같은 타입화된 배열.
  * WebGL 타입.
* `org.w3c.dom.*` 패키지:
  * DOM API 타입.
* `kotlinx.browser` 패키지:
  * `window` 및 `document`와 같은 DOM API 전역 객체.

`kotlinx-browser` 라이브러리의 선언을 사용하려면 프로젝트의 빌드 구성 파일에 종속성으로 추가하세요.

```kotlin
val wasmJsMain by getting {
    dependencies {
        implementation("org.jetbrains.kotlinx:kotlinx-browser:0.3")
    }
}