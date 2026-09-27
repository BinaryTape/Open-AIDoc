[//]: # (title: Kotlin에서 JavaScript 코드 사용하기)

Kotlin은 처음에 Java 플랫폼과의 쉬운 상호 운용성을 위해 설계되었습니다. Kotlin은 Java 클래스를 Kotlin 클래스로 보고, Java는 Kotlin 클래스를 Java 클래스로 봅니다.

하지만 JavaScript는 동적 타입 언어이므로 컴파일 시점에 타입을 확인하지 않습니다. Kotlin에서는 [dynamic](dynamic-type.md) 타입을 통해 JavaScript와 자유롭게 통신할 수 있습니다. Kotlin 타입 시스템의 기능을 온전히 활용하려면, Kotlin 컴파일러와 주변 도구들이 이해할 수 있도록 JavaScript 라이브러리에 대한 외부 선언(external declarations)을 생성할 수 있습니다.

## 인라인 JavaScript {id="inline-javascript"}

[`js()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.js/js.html) 함수를 사용하여 JavaScript 코드를 Kotlin 코드에 인라인으로 삽입할 수 있습니다.

```kotlin
fun jsTypeOf(o: Any): String {
    return js("typeof o")
}
```

JavaScript 코드 인라인 삽입은 다음을 포함한 [ES2015 기능](js-project-setup.md#set-an-ecmascript-target)을 완벽하게 지원합니다.

* `const` 및 `let` 변수 선언
* ES 클래스
* 제네레이터(Generators)
* 람다 ([화살표 함수](whatsnew21.md#support-for-generating-es2015-arrow-functions))
* 스프레드(Spread) 및 나머지(Rest) 연산자
* 템플릿 문자열

`js`의 매개변수는 컴파일 시점에 파싱되어 JavaScript 코드로 "있는 그대로" 번역되기 때문에 반드시 문자열 상수여야 합니다. 따라서 다음 코드는 올바르지 않습니다.

```kotlin
fun jsTypeOf(o: Any): String {
    return js(getTypeof() + " o") // 에러: 인자는 반드시 문자열 상수여야 합니다.
    // 컴파일러는 문자열 결합(concatenation)을 평가할 수 없습니다.
}

fun getTypeof() = "typeof"
```

대신, 예를 들어 나머지 연산자를 인라인으로 삽입하려면 문자열 상수를 사용하세요.

```kotlin
fun runSumExample() {
    val sum = js("(...nums) => nums.reduce((a, b) => a + b, 0)")
    println(sum(1, 2, 3, 4))
}
```

> `js()`를 호출하면 [`dynamic`](dynamic-type.md) 타입의 결과가 반환되며, 이는 컴파일 시점에 타입 안전성을 제공하지 않는다는 점에 유의하세요.
>
{style="note"}

## `external` 한정자 (modifier) {id="external-modifier"}

특정 선언이 순수 JavaScript로 작성되었음을 Kotlin에 알리려면 `external` 한정자를 사용해야 합니다. 컴파일러가 이러한 선언을 보면 해당 클래스, 함수 또는 프로퍼티에 대한 구현이 외부(개발자 또는 [npm 의존성](js-project-setup.md#npm-dependencies)을 통해)에서 제공된다고 가정하므로, 해당 선언으로부터 JavaScript 코드를 생성하려고 시도하지 않습니다. 이것이 바로 `external` 선언이 몸체(body)를 가질 수 없는 이유입니다. 예를 들어:

```kotlin
external fun alert(message: Any?): Unit

external class Node {
    val firstChild: Node

    fun append(child: Node): Node

    fun removeChild(child: Node): Node

    // 등등
}

external val window: Window
```

`external` 한정자는 중첩된 선언에도 상속됩니다. 위의 예제 `Node` 클래스에서 멤버 함수와 프로퍼티 앞에 `external` 한정자가 없는 이유가 바로 이 때문입니다.

`external` 한정자는 패키지 레벨 선언에만 허용됩니다. `external`이 아닌 클래스 내부에서 `external` 멤버를 선언할 수는 없습니다.

### 클래스의 (정적) 멤버 선언 {id="declare-static-members-of-a-class"}

JavaScript에서는 프로토타입이나 클래스 자체에 멤버를 정의할 수 있습니다.

``` javascript
function MyClass() { ... }
MyClass.sharedMember = function() { /* 구현 */ };
MyClass.prototype.ownMember = function() { /* 구현 */ };
```

Kotlin에는 이와 동일한 구문이 없습니다. 하지만 Kotlin에는 [`companion`](object-declarations.md#companion-objects) 객체가 있습니다. Kotlin은 `external` 클래스의 동반 객체(companion objects)를 특별한 방식으로 처리합니다. 컴파일러는 동반 객체를 기대하는 대신, 동반 객체의 멤버를 클래스 자체의 멤버로 간주합니다. 위의 예제에 나온 `MyClass`는 다음과 같이 설명할 수 있습니다.

```kotlin
external class MyClass {
    companion object {
        fun sharedMember()
    }

    fun ownMember()
}
```

### 기본값이 있는 매개변수 선언 {id="declare-parameters-with-default-values"}

기본값이 있는 매개변수를 가진 JavaScript 함수에 대한 외부 선언을 작성하는 경우, `definedExternally`를 사용하세요. 이는 기본값 생성을 JavaScript 함수 자체에 위임합니다.

```kotlin
external fun myFunWithOptionalArgs(
    x: Int,
    y: String = definedExternally,
    z: String = definedExternally
)
```

이 외부 선언을 사용하면, 하나의 필수 인자와 두 개의 선택적 인자로 `myFunWithOptionalArgs`를 호출할 수 있으며, 이때 기본값은 `myFunWithOptionalArgs`의 JavaScript 구현에 의해 계산됩니다.

### JavaScript 클래스 확장 {id="extend-javascript-classes"}

JavaScript 클래스를 마치 Kotlin 클래스인 것처럼 쉽게 확장할 수 있습니다. `external open` 클래스를 정의하고 이를 `external`이 아닌 클래스에서 상속받으면 됩니다. 예를 들어:

```kotlin
open external class Foo {
    open fun run()
    fun stop()
}

class Bar : Foo() {
    override fun run() {
        window.alert("Running!")
    }

    fun restart() {
        window.alert("Restarting")
    }
}
```

여기에는 몇 가지 제한 사항이 있습니다.

- 외부 기본 클래스의 함수가 시그니처에 의해 오버로드된 경우, 파생 클래스에서 이를 오버라이드할 수 없습니다.
- 기본값이 있는 매개변수를 포함한 함수는 오버라이드할 수 없습니다.
- 외부 클래스가 `external`이 아닌 클래스를 확장할 수 없습니다.

### external 인터페이스 {id="external-interfaces"}

JavaScript에는 인터페이스라는 개념이 없습니다. 함수가 매개변수로 `foo`와 `bar`라는 두 개의 메서드를 지원하기를 기대할 때, 실제로 이 메서드들을 가진 객체를 전달하기만 하면 됩니다.

정적 타입 언어인 Kotlin에서는 인터페이스를 사용하여 이 개념을 표현할 수 있습니다.

```kotlin
external interface HasFooAndBar {
    fun foo()

    fun bar()
}

external fun myFunction(p: HasFooAndBar)
```

외부 인터페이스의 전형적인 사용 사례는 설정 객체를 설명하는 것입니다. 예를 들어:

```kotlin
external interface JQueryAjaxSettings {
    var async: Boolean

    var cache: Boolean

    var complete: (JQueryXHR, String) -> Unit

    // 등등
}

fun JQueryAjaxSettings(): JQueryAjaxSettings = js("{}")

external class JQuery {
    companion object {
        fun get(settings: JQueryAjaxSettings): JQueryXHR
    }
}

fun sendQuery() {
    JQuery.get(JQueryAjaxSettings().apply {
        complete = { (xhr, data) ->
            window.alert("Request complete")
        }
    })
}
```

외부 인터페이스에는 몇 가지 제한 사항이 있습니다.

- `is` 검사의 우측에 사용할 수 없습니다.
- 구체화된 타입 인자(reified type arguments)로 전달될 수 없습니다.
- 클래스 리터럴 식(예: `I::class`)에서 사용할 수 없습니다.
- 외부 인터페이스로의 `as` 캐스팅은 항상 성공합니다.
    외부 인터페이스로 캐스팅하면 "Unchecked cast to external interface" 컴파일 시점 경고가 발생합니다. 이 경고는 `@Suppress("UNCHECKED_CAST_TO_EXTERNAL_INTERFACE")` 어노테이션으로 억제할 수 있습니다.

    IntelliJ IDEA는 `@Suppress` 어노테이션을 자동으로 생성할 수도 있습니다. 전구 아이콘이나 Alt-Enter를 통해 인텐션 메뉴를 열고, "Unchecked cast to external interface" 검사 옆의 작은 화살표를 클릭하세요. 여기서 억제 범위를 선택하면 IDE가 해당 파일에 어노테이션을 적절히 추가해 줍니다.

### 캐스트 (Casts) {id="casts"}

캐스팅이 불가능할 경우 `ClassCastException`을 던지는 ["안전하지 않은" 캐스트 연산자](typecasts.md#unsafe-cast-operator) `as` 외에도, Kotlin/JS는 [`unsafeCast<T>()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.js/unsafe-cast.html)를 제공합니다. `unsafeCast`를 사용하면 런타임에 _타입 검사가 전혀 수행되지 않습니다_. 예를 들어, 다음 두 메서드를 살펴보세요.

```kotlin
fun usingUnsafeCast(s: Any) = s.unsafeCast<String>()
fun usingAsOperator(s: Any) = s as String
```

이들은 다음과 같이 컴파일됩니다.

```javascript
function usingUnsafeCast(s) {
    return s;
}

function usingAsOperator(s) {
    var tmp$;
    return typeof (tmp$ = s) === 'string' ? tmp$ : throwCCE();
}
```

## 동등성 (Equality) {id="equality"}

Kotlin/JS는 다른 플랫폼과 비교하여 동등성 검사에 대해 특정한 시맨틱(semantics)을 가집니다.

Kotlin/JS에서 Kotlin의 [참조 동등성](equality.md#referential-equality) 연산자(`===`)는 항상 JavaScript의 [엄격한 동등성(strict equality)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Strict_equality) 연산자(`===`)로 번역됩니다.

JavaScript의 `===` 연산자는 두 값의 내용이 같을 뿐만 아니라, 두 값의 타입도 같은지 확인합니다.

 ```kotlin
fun main() {
    val name = "kotlin"
    val value1 = name.substring(0, 1)
    val value2 = name.substring(0, 1)

    println(value1 === value2)
    // Kotlin/JS에서는 'true' 출력
    // 다른 플랫폼에서는 'false' 출력
}
 ```

또한 Kotlin/JS에서 [`Byte`, `Short`, `Int`, `Float`, `Double`](js-to-kotlin-interop.md#kotlin-types-in-javascript) 숫자 타입은 모두 런타임에 JavaScript의 `Number` 타입으로 표현됩니다. 따라서 이 다섯 가지 타입의 값은 서로 구별되지 않습니다.

 ```kotlin
fun main() {
    println(1.0 as Any === 1 as Any)
    // Kotlin/JS에서는 'true' 출력
    // 다른 플랫폼에서는 'false' 출력
}
 ```

> Kotlin의 동등성에 대한 자세한 내용은 [동등성(Equality)](equality.md) 문서를 참조하세요.
> 
{style="tip"}