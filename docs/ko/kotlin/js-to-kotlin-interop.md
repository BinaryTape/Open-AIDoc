[//]: # (title: JavaScript에서 Kotlin 코드 사용하기)

선택한 [JavaScript 모듈](js-modules.md) 시스템에 따라 Kotlin/JS 컴파일러는 서로 다른 출력을 생성합니다.
하지만 일반적으로 Kotlin 컴파일러는 JavaScript 코드에서 자유롭게 사용할 수 있는 일반적인 JavaScript 클래스, 함수 및 프로퍼티를 생성합니다. 다만 몇 가지 유의해야 할 미묘한 사항들이 있습니다.

## plain 모드에서 별도의 JavaScript 객체로 선언 분리하기 {id="isolating-declarations-in-a-separate-javascript-object-in-plain-mode"}

모듈 종류를 명시적으로 `plain`으로 설정한 경우, Kotlin은 전역 객체를 오염시키는 것을 방지하기 위해 현재 모듈의 모든 Kotlin 선언을 포함하는 객체를 생성합니다. 즉, `myModule`이라는 모듈의 모든 선언은 JavaScript에서 `myModule` 객체를 통해 사용할 수 있습니다. 예를 들어:

```kotlin
fun foo() = "Hello"
```

이 함수는 JavaScript에서 다음과 같이 호출할 수 있습니다:

```javascript
alert(myModule.foo());
```

이와 같이 함수를 직접 호출하는 방식은 Kotlin 모듈을 [UMD](https://github.com/umdjs/umd)(`browser` 및 `nodejs` 타겟의 기본 설정), [ESM](https://tc39.es/ecma262/#sec-modules), [CommonJS](https://nodejs.org/api/modules.html#modules-commonjs-modules), 또는 [AMD](https://github.com/amdjs/amdjs-api/wiki/AMD)와 같은 JavaScript 모듈로 컴파일할 때는 적용되지 않습니다.
이러한 경우에는 선택한 JavaScript 모듈 시스템에 따라 선언이 노출됩니다.
예를 들어 UMD, ESM 또는 CommonJS를 사용하는 경우, 호출 측은 다음과 같은 모습이 됩니다:

```javascript
alert(require('myModule').foo());
```

JavaScript 모듈 시스템에 대한 자세한 내용은 [JavaScript 모듈](js-modules.md)을 참고하세요.

## 패키지 구조 {id="package-structure"}

대부분의 모듈 시스템(CommonJS, Plain, UMD)에서 Kotlin은 패키지 구조를 JavaScript에 노출합니다.
루트 패키지에 선언을 정의하지 않는 한, JavaScript에서 전체 경로 이름(fully qualified names)을 사용해야 합니다.
예를 들어:

```kotlin
package my.qualified.packagename

fun foo() = "Hello"
```

예를 들어 UMD 또는 CommonJS를 사용하는 경우, 호출 측은 다음과 같은 모습이 될 수 있습니다:

```javascript
alert(require('myModule').my.qualified.packagename.foo())
```

`plain`을 모듈 시스템 설정으로 사용하는 경우, 호출 측은 다음과 같습니다:

```javascript
alert(myModule.my.qualified.packagename.foo());
```

ECMAScript 모듈(ESM)을 타겟으로 할 때는 애플리케이션 번들 크기를 개선하고 ESM 패키지의 일반적인 레이아웃에 맞추기 위해 패키지 정보가 보존되지 않습니다.
이 경우 ES 모듈을 사용하는 Kotlin 선언의 소비 방식은 다음과 같습니다:

```javascript
import { foo } from 'myModule';

alert(foo());
```

### `@JsName` 어노테이션 {id="jsname-annotation"}

어떤 경우(예를 들어 오버로드 지원 등)에는 Kotlin 컴파일러가 생성된 JavaScript 코드의 함수 및 속성 이름을 맹글링(mangling)합니다. 생성되는 이름을 제어하려면 `@JsName` 어노테이션을 사용할 수 있습니다:

```kotlin
// 모듈 'kjs'
class Person(val name: String) {
    fun hello() {
        println("Hello $name!")
    }

    @JsName("helloWithGreeting")
    fun hello(greeting: String) {
        println("$greeting $name!")
    }
}
```

이제 JavaScript에서 다음과 같은 방식으로 이 클래스를 사용할 수 있습니다:

```javascript
// 필요하다면 선택한 모듈 시스템에 따라 'kjs'를 임포트합니다.
var person = new kjs.Person("Dmitry");   // 'kjs' 모듈을 참조함
person.hello();                          // "Hello Dmitry!" 출력
person.helloWithGreeting("Servus");      // "Servus Dmitry!" 출력
```

만약 `@JsName` 어노테이션을 지정하지 않았다면, 해당 함수의 이름에는 함수 시그니처로부터 계산된 접미사(예: `hello_61zpoe$`)가 포함되었을 것입니다.

Kotlin 컴파일러가 맹글링을 적용하지 않는 몇 가지 경우가 있습니다:
- `external` 선언은 맹글링되지 않습니다.
- `external` 클래스를 상속받는 비-`external` 클래스 내의 모든 오버라이드된 함수는 맹글링되지 않습니다.

`@JsName`의 매개변수는 유효한 식별자인 상수 문자열 리터럴이어야 합니다.
컴파일러는 식별자가 아닌 문자열을 `@JsName`에 전달하려고 시도할 때 오류를 보고합니다.
다음 예제는 컴파일 타임 오류를 발생시킵니다:

```kotlin
@JsName("new C()")   // 여기서 오류 발생
external fun newC()
```

### `@JsExport` 어노테이션 {id="jsexport-annotation"}
<primary-label ref="experimental-general"/>

최상위 선언(클래스, 인터페이스, 함수 등)에 `@JsExport` 어노테이션을 적용하면 Kotlin 선언을 JavaScript 또는 TypeScript에서 사용할 수 있게 됩니다. 이 어노테이션은 Kotlin에 정의된 이름으로 모든 중첩된 선언을 내보냅니다.

예를 들어, 중첩된 클래스와 이름이 지정된 동반 객체를 포함하는 Kotlin 인터페이스를 내보내는 방법은 다음과 같습니다:

```kotlin
@JsExport
interface Identity {
     class Metadata(val tag: String)

    companion object Registry {
        val defaultTag = "GUEST"
    }
}
```

현재로서는 `@JsExport` 어노테이션이 Kotlin에서 함수를 보이게 만드는 유일한 방법입니다.

`@JsExport` 어노테이션은 다음과 같은 경우에도 사용할 수 있습니다:

* 멀티플랫폼 프로젝트의 공통(common) 코드. 이는 JavaScript 타겟으로 컴파일할 때만 효과가 있으며, 플랫폼에 국한되지 않는 Kotlin 선언도 내보낼 수 있게 해줍니다.
* 생성 및 내보낼 함수의 이름을 지정하기 위해 [`@JsName` 어노테이션](#jsname-어노테이션)과 함께 사용. 이는 동일한 이름을 가진 함수의 오버로드와 같은 내보내기 시의 모호함을 해결하는 데 도움이 됩니다.
* `@file:JsExport`를 사용하여 파일 수준에서 적용.

#### 값 클래스 내보내기 {id="export-value-classes"}

Kotlin의 [인라인 값 클래스(inline value classes)](inline-classes.md)를 일반 TypeScript 클래스로 내보낼 수 있습니다.

값 클래스를 내보내려면 Kotlin 측에서 해당 클래스에 `@JsExport` 어노테이션을 표시하세요:

```kotlin
// Kotlin
@JsExport
@JvmInline
value class Email(val address: String) {
    init { require(address.contains("@")) { "Invalid email" } }
}

@JsExport
class AuthService {
    suspend fun login(email: Email): String = ...
}
```

TypeScript 측에서는 일반 클래스처럼 보입니다:

```typescript
// TypeScript
import { AuthService, Email } from "..."
const auth = new AuthService();

console.log(await auth.login(new Email("jane@example.com"))); 
// "Welcome, jane@example.com!"
console.log(await auth.login(new Email("not-an-email"))); 
// "Invalid email"
```

#### 일시 중단 람다 내보내기 {id="export-suspending-lambdas"}

Kotlin의 [일시 중단 람다 식(suspending lambda expressions)](lambdas.md#lambda-expressions-and-anonymous-functions)을 JavaScript [async 함수](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)로 내보낼 수 있습니다:

1. 이 기능을 활성화하려면 `build.gradle.kts` 파일에 다음 컴파일러 옵션을 추가하세요:

    ```kotlin
    kotlin {
        js {
            compilations.all {
                compileTaskProvider.configure {
                    compilerOptions {
                        freeCompilerArgs.add("-Xsuspend-lambda-exporting")
                    }
                }
            }
        }
    }
    ```

2. 관련 Kotlin 선언에 `@JsExport` 어노테이션을 표시합니다:

    ```kotlin
    // Kotlin
    @JsExport
    class TaskRunner {
        suspend fun runTask(task: suspend () -> String): String {
            return task()
        }
    }
    ```

3. TypeScript 측에서 `suspend` 람다는 일반 `async` 함수로 매핑됩니다:

    ```typescript
    // TypeScript
    import { TaskRunner } from "..."
    
    const runner = new TaskRunner();
    const result = await runner.runTask(async () => "done");
    console.log(result); // "done"
    ```

### `@JsNoRuntime` 어노테이션 {id="jsnoruntime-annotation"}

`@JsNoRuntime` 어노테이션을 사용하여 Kotlin 인터페이스를 JavaScript/TypeScript로 내보낼 수 있습니다. 이를 통해 일반 TypeScript 인터페이스로 직접 매핑할 수 있습니다.

예를 들어 Kotlin 멀티플랫폼 프로젝트에서 Kotlin 인터페이스를 내보내는 방법은 다음과 같습니다:

1. 공통 코드의 Kotlin 인터페이스에 `@JsNoRuntime` 어노테이션을 추가합니다:

    ```kotlin
    // commonMain
    import kotlin.js.JsNoRuntime
    
    @JsNoRuntime
    expect interface DataProcessor {
        fun process(data: String): Int 
    }
    ```

2. JavaScript 전용 소스 코드에서 `@JsNoRuntime`과 함께 실제 구현(actual implementation)을 제공합니다:

    ```kotlin
    // jsMain
    import kotlin.js.JsNoRuntime
    
    @JsNoRuntime
    actual interface DataProcessor {
        actual fun process(data: String): Int
    } 
    ```
    
3. TypeScript 측에서 해당 인터페이스는 일반 TypeScript 인터페이스로 매핑됩니다:
    
    ```typescript
    // 생성된 .d.ts
    export interface DataProcessor {
        process(data: string): number;
    }
    ```

Kotlin 멀티플랫폼 프로젝트의 경우 일반적인 규칙은 다음과 같습니다:

* `expect` 및 `actual` 인터페이스 선언 모두에 `@JsNoRuntime` 어노테이션을 추가해야 합니다. 유일한 예외는 어노테이션이 필요하지 않은 `actual` 측의 플랫폼 전용 코드에 있는 `external` 구현입니다.
* `expect` 측의 공통 코드에서 `external` 인터페이스 선언을 사용하는 것은 금지됩니다. 대신 `@JsNoRuntime` 어노테이션이 추가된 일반 인터페이스를 사용하세요.

`@JsNoRuntime`으로 Kotlin 인터페이스를 내보내는 데는 몇 가지 제한 사항이 있습니다. 다음의 경우 해당 어노테이션이 허용되지 않습니다:

* `external` 인터페이스. 이들은 이미 기본적으로 `@JsNoRuntime`이 적용된 것처럼 동작하기 때문입니다. 이를 추가하면 컴파일러 경고가 발생합니다.
* `is` 및 `as` 타입 검사.
* [`::class` 구문](js-reflection.md)을 사용하는 클래스 참조.
* [구체화된 타입 인자(reified type argument)](inline-functions.md#reified-type-parameters)로 전달되는 인터페이스.

### `@JsStatic` {id="jsstatic"}
<primary-label ref="experimental-general"/>

`@JsStatic` 어노테이션은 컴파일러가 대상 선언에 대해 추가적인 정적 메서드를 생성하도록 지시합니다. 이를 통해 Kotlin 코드의 정적 멤버를 JavaScript에서 직접 사용할 수 있습니다.

이름이 지정된 객체(named objects)에 정의된 함수뿐만 아니라 클래스 및 인터페이스 내부에 선언된 동반 객체(companion objects)에도 `@JsStatic` 어노테이션을 적용할 수 있습니다. 이 어노테이션을 사용하면 컴파일러는 객체의 정적 메서드와 객체 자체의 인스턴스 메서드를 모두 생성합니다. 예를 들어:

```kotlin
// Kotlin
class C {
    companion object {
        @JsStatic
        fun callStatic() {}
        fun callNonStatic() {}
    }
}
```

이제 JavaScript에서 `callStatic()` 함수는 정적이지만, `callNonStatic()` 함수는 그렇지 않습니다:

```javascript
// JavaScript
C.callStatic();              // 작동함, 정적 함수에 접근
C.callNonStatic();           // 오류, 생성된 JavaScript에서 정적 함수가 아님
C.Companion.callStatic();    // 인스턴스 메서드는 유지됨
C.Companion.callNonStatic(); // 이 방식만 작동함
```

객체 또는 동반 객체의 프로퍼티에도 `@JsStatic` 어노테이션을 적용할 수 있으며, 이 경우 해당 프로퍼티의 게터(getter)와 세터(setter) 메서드는 해당 객체 또는 동반 객체를 포함하는 클래스의 정적 멤버가 됩니다.

이 기능은 [실험적(Experimental)](components-stability.md#stability-levels-explained)입니다. 이슈 트래커인 [YouTrack](https://youtrack.jetbrains.com/issue/KT-18891/JS-provide-a-way-to-declare-static-members-JsStatic)에서 피드백을 공유해 주세요.

### Kotlin의 `Long` 타입을 표현하기 위해 `BigInt` 타입 사용하기 {id="use-bigint-type-to-represent-kotlin-s-long-type"}
<primary-label ref="experimental-general"/>

Kotlin/JS는 현대적인 JavaScript(ES2020)로 컴파일할 때 Kotlin `Long` 값을 표현하기 위해 JavaScript의 기본 `BigInt` 타입을 사용합니다.

`BigInt` 타입 지원을 활성화하려면 `build.gradle(.kts)` 파일에 다음 컴파일러 옵션을 추가해야 합니다:

```kotlin
// build.gradle.kts
kotlin {
    js {
        ...
        compilerOptions {
            freeCompilerArgs.add("-Xes-long-as-bigint")
        }
    }
}
```

이 기능은 [실험적(Experimental)](components-stability.md#stability-levels-explained)입니다. 이슈 트래커인 [YouTrack](https://youtrack.jetbrains.com/issue/KT-57128/KJS-Use-BigInt-to-represent-Long-values-in-ES6-mode)에서 피드백을 공유해 주세요.

#### 내보낸 선언에서 `Long` 사용하기 {id="use-long-in-exported-declarations"}

Kotlin의 `Long` 타입은 JavaScript의 `BigInt` 타입으로 컴파일될 수 있으므로, Kotlin/JS는 JavaScript로 `Long` 값을 내보내는 것을 지원합니다.

이 기능을 활성화하려면:

1. Kotlin/JS에서 `Long` 내보내기를 허용합니다. `build.gradle(.kts)` 파일의 `freeCompilerArgs` 속성에 다음 컴파일러 옵션을 추가합니다:

     ```kotlin
    // build.gradle.kts
    kotlin {
        js {
            ...
            compilerOptions { 
                freeCompilerArgs.add("-XXLanguage:+JsAllowLongInExportedDeclarations")
            }
        }
    }
    ```

2. `BigInt` 타입을 활성화합니다. 활성화 방법은 [Kotlin의 `Long` 타입을 표현하기 위해 `BigInt` 타입 사용하기](#use-bigint-type-to-represent-kotlin-s-long-type)를 참고하세요.

### Kotlin의 `LongArray` 타입을 표현하기 위해 `BigInt64Array` 타입 사용하기 {id="use-bigint64array-type-to-represent-kotlin-s-longarray-type"}
<primary-label ref="experimental-general"/>

Kotlin/JS는 JavaScript로 컴파일할 때 Kotlin의 `LongArray` 값을 표현하기 위해 JavaScript의 기본 `BigInt64Array` 타입을 사용할 수 있습니다.

`BigInt64Array` 타입 지원을 활성화하려면 `build.gradle(.kts)` 파일에 다음 컴파일러 옵션을 추가하세요:

```kotlin
// build.gradle.kts
kotlin {
    js {
        ...
        compilerOptions {
            freeCompilerArgs.add("-Xes-long-as-bigint")
        }
    }
}
```

이 기능은 [실험적(Experimental)](components-stability.md#stability-levels-explained)입니다. 이슈 트래커인 [YouTrack](https://youtrack.jetbrains.com/issue/KT-79284/Use-BigInt64Array-for-LongArray)에서 피드백을 공유해 주세요.

## JavaScript에서의 Kotlin 타입 {id="kotlin-types-in-javascript"}

Kotlin 타입이 JavaScript 타입으로 어떻게 매핑되는지 확인하세요:

| Kotlin                                                           | JavaScript                | 설명                                                                                                |
|------------------------------------------------------------------|---------------------------|---------------------------------------------------------------------------------------------------------|
| `Byte`, `Short`, `Int`, `Float`, `Double`                        | `Number`                  |                                                                                                         |
| `Char`                                                           | `Number`                  | 숫자는 문자의 코드를 나타냅니다.                                                             |
| `Long`                                                           | `BigInt`                  | [`-Xes-long-as-bigint` 컴파일러 옵션](compiler-reference.md#xes-long-as-bigint) 설정이 필요합니다. |
| `Boolean`                                                        | `Boolean`                 |                                                                                                         |
| `String`                                                         | `String`                  |                                                                                                         |
| `Array`                                                          | `Array`                   |                                                                                                         |
| `ByteArray`                                                      | `Int8Array`               |                                                                                                         |
| `ShortArray`                                                     | `Int16Array`              |                                                                                                         |
| `IntArray`                                                       | `Int32Array`              |                                                                                                         |
| `CharArray`                                                      | `UInt16Array`             | `$type$ == "CharArray"` 프로퍼티를 가집니다.                                                           |
| `FloatArray`                                                     | `Float32Array`            |                                                                                                         |
| `DoubleArray`                                                    | `Float64Array`            |                                                                                                         |
| `LongArray`                                                      | `BigInt64Array`           |                                                                                                         |
| `BooleanArray`                                                   | `Int8Array`               | `$type$ == "BooleanArray"` 프로퍼티를 가집니다.                                                        |
| `List`, `MutableList`                                            | `KtList`, `KtMutableList` | `KtList.asJsReadonlyArrayView` 또는 `KtMutableList.asJsArrayView`를 통해 `Array`를 노출합니다.                 |
| `Map`, `MutableMap`                                              | `KtMap`, `KtMutableMap`   | `KtMap.asJsReadonlyMapView` 또는 `KtMutableMap.asJsMapView`를 통해 ES2015 `Map`을 노출합니다.                  |
| `Set`, `MutableSet`                                              | `KtSet`, `KtMutableSet`   | `KtSet.asJsReadonlySetView` 또는 `KtMutableSet.asJsSetView`를 통해 ES2015 `Set`을 노출합니다.                  |
| `Unit`                                                           | Undefined                 | 반환 타입으로 사용될 때는 내보낼 수 있지만, 매개변수 타입으로 사용될 때는 내보낼 수 없습니다.                               |
| `Any`                                                            | `Object`                  |                                                                                                         |
| `Throwable`                                                      | `Error`                   |                                                                                                         |
| `enum class Type`                                                | `Type`                    | 열거형 항목(Enum entries)은 정적 클래스 프로퍼티(`Type.ENTRY`)로 노출됩니다.                                     |
| Nullable `Type?`                                                 | `Type                     | null                                                                                                    | undefined` |                                                                                            |
| `@JsExport`가 표시된 타입을 제외한 모든 기타 Kotlin 타입 | 지원되지 않음             | Kotlin의 [부호 없는 정수 타입(unsigned integer types)](unsigned-integer-types.md)을 포함합니다.                                  |

추가로 다음 사항을 아는 것이 중요합니다:

* Kotlin은 `kotlin.Int`, `kotlin.Byte`, `kotlin.Short`, `kotlin.Char` 및 `kotlin.Long`에 대해 오버플로 세맨틱을 유지합니다.
* Kotlin은 런타임에 숫자 타입 간의 구분을 할 수 없으므로(`kotlin.Long` 제외), 다음 코드가 작동합니다:
  
  ```kotlin
  fun f() {
      val x: Int = 23
      val y: Any = x
      println(y as Float)
  }
  ```

* Kotlin은 JavaScript에서 객체 지연 초기화(lazy object initialization)를 유지합니다.