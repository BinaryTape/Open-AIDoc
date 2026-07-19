문자를 문자열 리터럴로 취급하려면 [멀티 달러 문자열 보간(Multi-dollar string interpolation)](strings.md#multi-dollar-string-interpolation)을 사용하세요:

```kotlin
val KClass<*>.jsonSchema : String
    get() = $"""
        {
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "$id": "https://example.com/product.schema.json",
            "$dynamicAnchor": "meta",
            "title": "${simpleName ?: qualifiedName ?: "unknown"}",
            "type": "object"
        }
        """
```

## 언어 기능의 관용적 사용

### 불변성(Immutability)

가변 데이터보다는 불변 데이터를 사용하는 것을 권장합니다. 지역 변수와 프로퍼티는 초기화 후 수정되지 않는다면 항상 `var` 대신 `val`로 선언하세요.

수정되지 않는 컬렉션을 선언할 때는 항상 불변 컬렉션 인터페이스(`Collection`, `List`, `Set`, `Map`)를 사용하세요. 팩토리 함수를 사용하여 컬렉션 인스턴스를 생성할 때는 가능하면 항상 불변 컬렉션 타입을 반환하는 함수를 사용하세요.

```kotlin
// 나쁨: 변경되지 않을 값에 가변 컬렉션 타입을 사용함
fun validateValue(actualValue: String, allowedValues: HashSet<String>) { ... }

// 좋음: 대신 불변 컬렉션 타입을 사용함
fun validateValue(actualValue: String, allowedValues: Set<String>) { ... }

// 나쁨: arrayListOf()는 가변 컬렉션 타입인 ArrayList<T>를 반환함
val allowedValues = arrayListOf("a", "b", "c")

// 좋음: listOf()는 List<T>를 반환함
val allowedValues = listOf("a", "b", "c")
```

### 파라미터 기본값

오버로드된 함수를 여러 개 선언하는 것보다 파라미터 기본값을 가진 함수 하나를 선언하는 것을 권장합니다.

```kotlin
// 나쁨
fun foo() = foo("a")
fun foo(a: String) { /*...*/ }

// 좋음
fun foo(a: String = "a") { /*...*/ }
```

### 타입 별칭(Type aliases)

코드베이스에서 여러 번 사용되는 함수형 타입이나 타입 파라미터가 있는 타입이 있다면, 이에 대한 타입 별칭을 정의하는 것을 권장합니다.

```kotlin
typealias MouseClickHandler = (Any, MouseEvent) -> Unit
typealias PersonIndex = Map<String, Person>
```
이름 충돌을 피하기 위해 전용(private) 또는 내부(internal) 타입 별칭을 사용하는 경우에는 [패키지 및 임포트](packages.md)에서 언급된 `import ... as ...`를 사용하는 것이 좋습니다.

### 람다 파라미터

짧고 중첩되지 않은 람다에서는 파라미터를 명시적으로 선언하는 대신 `it` 컨벤션을 사용하는 것이 좋습니다. 파라미터가 있는 중첩된 람다에서는 항상 파라미터를 명시적으로 선언하세요.

### 람다에서의 반환(Returns)

람다에서 레이블이 지정된 여러 개의 return을 사용하는 것은 피하세요. 람다가 하나의 탈출 지점만 갖도록 구조를 변경하는 것을 고려하세요. 그것이 불가능하거나 명확하지 않다면 람다를 익명 함수로 변환하는 것을 고려하세요.

람다의 마지막 문장에는 레이블이 지정된 return을 사용하지 마세요.

### 명명된 인수(Named arguments)

메서드가 동일한 기본 타입(primitive type)의 파라미터를 여러 개 받거나 `Boolean` 타입의 파라미터를 받는 경우, 문맥상 모든 파라미터의 의미가 명확하지 않다면 명명된 인수 구문을 사용하세요.

```kotlin
drawSquare(x = 10, y = 10, width = 100, height = 100, fill = true)
```

### 조건문

`try`, `if`, `when`의 표현식 형태를 사용하는 것을 권장합니다.

```kotlin
return if (x) foo() else bar()
```

```kotlin
return when(x) {
    0 -> "zero"
    else -> "nonzero"
}
```

위의 방식이 다음 방식보다 낫습니다.

```kotlin
if (x)
    return foo()
else
    return bar()
```

```kotlin
when(x) {
    0 -> return "zero"
    else -> return "nonzero"
}
```

### if 대 when

이진 조건에는 `when` 대신 `if`를 사용하는 것을 권장합니다. 
예를 들어, `if`를 사용하여 다음 구문을 사용하세요.

```kotlin
if (x == null) ... else ...
```

`when`을 사용한 다음 구문 대신 사용하세요.

```kotlin
when (x) {
    null -> // ...
    else -> // ...
}
```

옵션이 세 개 이상인 경우에는 `when`을 사용하는 것이 좋습니다.

### when 표현식의 가드 조건(Guard conditions)

`when` 표현식이나 문에서 [가드 조건](control-flow.md#guard-conditions-in-when-expressions)과 함께 여러 불리언 표현식을 결합할 때는 괄호를 사용하세요.

```kotlin
when (status) {
    is Status.Ok if (status.info.isEmpty() || status.info.id == null) -> "no information"
}
```

다음 방식 대신 권장됩니다:

```kotlin
when (status) {
    is Status.Ok if status.info.isEmpty() || status.info.id == null -> "no information"
}
```

### 조건문의 널 허용 불리언 값

조건문에서 널 허용(nullable) `Boolean`을 사용해야 하는 경우, `if (value == true)` 또는 `if (value == false)` 체크를 사용하세요.

### 루프(Loops)

루프보다는 고차 함수(`filter`, `map` 등)를 사용하는 것을 권장합니다. 예외: `forEach` (대신 일반 `for` 루프를 사용하는 것이 좋습니다. 다만 `forEach`의 수신 객체가 널 허용이거나 `forEach`가 긴 호출 체인의 일부로 사용되는 경우는 제외입니다).

여러 고차 함수를 사용하는 복잡한 표현식과 루프 사이에서 선택할 때는 각 경우에 수행되는 작업의 비용을 이해하고 성능 고려 사항을 염두에 두세요.

### 범위 루프(Loops on ranges)

끝이 열린 범위(open-ended range)를 루프할 때는 `..<` 연산자를 사용하세요.

```kotlin
for (i in 0..n - 1) { /*...*/ }  // 나쁨
for (i in 0..<n) { /*...*/ }  // 좋음
```

### 문자열(Strings)

문자열 연결(concatenation)보다는 문자열 템플릿을 권장합니다.

일반 문자열 리터럴에 `
` 이스케이프 시퀀스를 포함하는 것보다 여러 줄 문자열(multiline strings)을 사용하는 것이 좋습니다.

여러 줄 문자열에서 들여쓰기를 유지하려면, 결과 문자열에 내부 들여쓰기가 필요하지 않을 때는 `trimIndent`를 사용하고, 내부 들여쓰기가 필요할 때는 `trimMargin`을 사용하세요.

```kotlin
fun main() {
//sampleStart
    println("""
     Not
     trimmed
     text
     """
    )

    println("""
     Trimmed
     text
     """.trimIndent()
    )

    println()

    val a = """Trimmed to margin text:
            |if(a > 1) {
            |    return a
            |}""".trimMargin()

   println(a)
//sampleEnd
}
```
{kotlin-runnable="true"}

[자바와 코틀린의 여러 줄 문자열 차이점](java-to-kotlin-idioms-strings.md#use-multiline-strings)에 대해 알아보세요.

### 함수 대 프로퍼티

일부 시나리오에서는 인수가 없는 함수가 읽기 전용 프로퍼티와 상호 교체 가능할 수 있습니다. 의미론적으로는 비슷하지만, 어느 것을 선호할지에 대한 몇 가지 스타일적 관례가 있습니다.

알고리즘이 다음과 같은 경우 함수보다 프로퍼티를 권장합니다.

* 예외를 던지지 않음.
* 계산 비용이 낮음(또는 첫 실행 시 캐시됨).
* 객체 상태가 변경되지 않았다면 호출 시마다 동일한 결과를 반환함.

### 확장 함수(Extension functions)

확장 함수를 자유롭게 사용하세요. 주로 객체에 대해 작동하는 함수가 있을 때마다 해당 객체를 수신 객체로 받는 확장 함수로 만드는 것을 고려하세요. API 오염을 최소화하려면 확장 함수의 가시성을 필요한 만큼 제한하세요. 필요에 따라 지역 확장 함수, 멤버 확장 함수 또는 private 가시성을 가진 최상위 확장 함수를 사용하세요.

### 중위 함수(Infix functions)

유사한 역할을 수행하는 두 객체에 대해 작동할 때만 함수를 `infix`로 선언하세요. 좋은 예: `and`, `to`, `zip`. 나쁜 예: `add`.

수신 객체를 직접 수정(mutate)하는 메서드는 `infix`로 선언하지 마세요.

### 팩토리 함수(Factory functions)

클래스에 대한 팩토리 함수를 선언할 때 클래스 자체와 동일한 이름을 지정하는 것을 피하세요. 팩토리 함수의 동작이 특별한 이유를 명확히 알 수 있도록 고유한 이름을 사용하는 것이 좋습니다. 정말 특별한 의미가 없는 경우에만 클래스와 동일한 이름을 사용할 수 있습니다.

```kotlin
class Point(val x: Double, val y: Double) {
    companion object {
        fun fromPolar(angle: Double, radius: Double) = Point(...)
    }
}
```

서로 다른 슈퍼클래스 생성자를 호출하지 않고 파라미터 기본값을 포함하는 단일 생성자로 축소될 수 없는 여러 개의 오버로드된 생성자가 있는 경우, 오버로드된 생성자를 팩토리 함수로 교체하는 것을 권장합니다.

### 플랫폼 타입(Platform types)

플랫폼 타입의 표현식을 반환하는 공개(public) 함수/메서드는 코틀린 타입을 명시적으로 선언해야 합니다.

```kotlin
fun apiCall(): String = MyJavaApi.getProperty("name")
```

플랫폼 타입의 표현식으로 초기화되는 모든 프로퍼티(패키지 수준 또는 클래스 수준)는 코틀린 타입을 명시적으로 선언해야 합니다.

```kotlin
class Person {
    val name: String = MyJavaApi.getProperty("name")
}
```

플랫폼 타입의 표현식으로 초기화되는 지역 값은 타입 선언이 있을 수도 있고 없을 수도 있습니다.

```kotlin
fun main() {
    val name = MyJavaApi.getProperty("name")
    println(name)
}
```

### 스코프 함수(Scope functions) apply/with/run/also/let

코틀린은 주어진 객체의 컨텍스트에서 코드 블록을 실행하기 위한 일련의 함수를 제공합니다: `let`, `run`, `with`, `apply`, 및 `also`. 상황에 맞는 적절한 스코프 함수를 선택하는 방법은 [스코프 함수](scope-functions.md)를 참조하세요.

## 라이브러리를 위한 코딩 컨벤션

라이브러리를 작성할 때는 API 안정성을 보장하기 위해 추가적인 규칙 세트를 따르는 것이 권장됩니다.

 * 멤버 가시성을 항상 명시적으로 지정하세요(실수로 선언이 공개 API로 노출되는 것을 방지하기 위함).
 * 함수의 반환 타입과 프로퍼티 타입을 항상 명시적으로 지정하세요(구현이 변경될 때 실수로 반환 타입이 변경되는 것을 방지하기 위함).
 * 새로운 문서가 필요 없는 오버라이드 메서드를 제외한 모든 공개 멤버에 [KDoc](kotlin-doc.md) 주석을 제공하세요(라이브러리 문서 생성을 지원하기 위함).

라이브러리용 API를 작성할 때 고려해야 할 모범 사례와 아이디어에 대해 [라이브러리 작성자 지침](api-guidelines-introduction.md)에서 자세히 알아보세요.