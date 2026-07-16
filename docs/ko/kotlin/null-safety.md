[//]: # (title: 널 안정성)

널 안정성(Null safety)은 [10억 달러짜리 실수(The Billion-Dollar Mistake)](https://en.wikipedia.org/wiki/Null_pointer#History)라고도 알려진 널 참조의 위험을 획기적으로 줄이기 위해 설계된 Kotlin의 기능입니다.

Java를 포함한 많은 프로그래밍 언어에서 가장 흔한 함정 중 하나는 널 참조의 멤버에 접근할 때 널 참조 예외가 발생한다는 점입니다. Java에서는 `NullPointerException`, 줄여서 *NPE*가 이에 해당합니다.

Kotlin은 타입 시스템의 일부로 널 허용 여부(nullability)를 명시적으로 지원합니다. 즉, 어떤 변수나 프로퍼티가 `null`을 허용하는지 명시적으로 선언할 수 있습니다. 또한, 널 불가능(non-null) 변수를 선언하면 컴파일러가 해당 변수에 `null` 값을 담을 수 없도록 강제하여 NPE를 방지합니다.

Kotlin의 널 안정성은 런타임이 아닌 컴파일 타임에 잠재적인 널 관련 문제를 포착하여 더 안전한 코드를 보장합니다. 이 기능은 `null` 값을 명시적으로 표현함으로써 코드의 견고성, 가독성 및 유지보수성을 향상시키며, 코드를 더 이해하고 관리하기 쉽게 만들어 줍니다.

Kotlin에서 NPE가 발생할 수 있는 유일한 원인은 다음과 같습니다:

* [`throw NullPointerException()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-null-pointer-exception/)을 명시적으로 호출하는 경우.
* [null 아님 단언 연산자(not-null assertion operator) `!!`](#not-null-assertion-operator)를 사용하는 경우.
* 초기화 중 다음과 같은 데이터 불일치가 발생하는 경우:
  * 생성자에서 사용할 수 있는 초기화되지 않은 `this`가 다른 곳에서 사용될 때([초기화되지 않은 `this` 유출(leaking `this`)](https://youtrack.jetbrains.com/issue/KTIJ-9751)).
  * [상위 클래스 생성자가 오픈 멤버를 호출](inheritance.md#derived-class-initialization-order)하고, 하위 클래스에서 해당 멤버의 구현이 초기화되지 않은 상태를 사용할 때.
* Java 상호운용성:
  * [플랫폼 타입(platform type)](java-interop.md#null-safety-and-platform-types)인 널 참조의 멤버에 접근하려고 할 때.
  * 제네릭 타입과 관련된 널 허용 여부 문제. 예를 들어, Java 코드가 Kotlin의 `MutableList<String>`에 `null`을 추가하는 경우, 이를 제대로 처리하려면 `MutableList<String?>`이 필요합니다.
  * 외부 Java 코드로 인해 발생하는 기타 문제.

> NPE 외에도 널 안정성과 관련된 또 다른 예외는 [`UninitializedPropertyAccessException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-uninitialized-property-access-exception/)입니다. Kotlin은 초기화되지 않은 프로퍼티에 접근하려고 할 때 이 예외를 발생시켜, 널 불가능 프로퍼티가 준비되기 전에는 사용되지 않도록 보장합니다. 이는 주로 [`lateinit` 프로퍼티](properties.md#late-initialized-properties-and-variables)에서 발생합니다.
>
{style="tip"}

## 널 허용 타입과 널 불가능 타입

Kotlin의 타입 시스템은 `null`을 가질 수 있는 타입(널 허용 타입, nullable types)과 가질 수 없는 타입(널 불가능 타입, non-nullable types)을 구분합니다. 예를 들어, 일반적인 `String` 타입의 변수는 `null`을 가질 수 없습니다:

```kotlin
fun main() {
//sampleStart
    // 널 불가능 문자열을 변수에 할당합니다.
    var a: String = "abc"
    // 널 불가능 변수에 null을 다시 할당하려고 시도합니다.
    a = null
    print(a)
    // Null can not be a value of a non-null type String (에러 발생)
//sampleEnd
}
```
{kotlin-runnable="true" validate="false"}

변수 `a`에 대해서는 안전하게 메서드를 호출하거나 프로퍼티에 접근할 수 있습니다. `a`는 널 불가능 변수이므로 NPE가 발생하지 않음이 보장됩니다. 컴파일러는 `a`가 항상 유효한 `String` 값을 갖도록 보장하므로, `null`일 때 프로퍼티나 메서드에 접근할 위험이 없습니다.

```kotlin
fun main() {
//sampleStart
    // 널 불가능 문자열을 변수에 할당합니다.
    val a: String = "abc"
    // 널 불가능 변수의 길이를 반환합니다.
    val l = a.length
    print(l)
    // 3
//sampleEnd
}
```
{kotlin-runnable="true" validate="false"}

`null` 값을 허용하려면 변수 타입 뒤에 `?` 기호를 붙여 선언합니다. 예를 들어, `String?`라고 쓰면 널 허용 문자열을 선언할 수 있습니다. 이 표현은 `String`을 `null`을 받아들일 수 있는 타입으로 만듭니다.

```kotlin
fun main() {
//sampleStart
    // 널 허용 문자열을 변수에 할당합니다.
    var b: String? = "abc"
    // 널 허용 변수에 null을 성공적으로 다시 할당합니다.
    b = null
    print(b)
    // null
//sampleEnd
}
```
{kotlin-runnable="true"}

변수 `b`에서 `length`에 직접 접근하려고 하면 컴파일러가 에러를 보고합니다. 이는 `b`가 널 허용 변수로 선언되어 `null` 값을 가질 수 있기 때문입니다. 널 허용 타입의 프로퍼티에 직접 접근하려고 하면 NPE가 발생할 수 있습니다.

```kotlin
fun main() {
//sampleStart
    // 널 허용 문자열을 변수에 할당합니다.
    var b: String? = "abc"
    // 널 허용 변수에 null을 다시 할당합니다.
    b = null
    // 널 허용 변수의 길이를 직접 반환하려고 시도합니다.
    val l = b.length
    print(l)
    // String? 타입의 널 허용 수신 객체에는 안전한 호출(?.) 또는 null 아님 단언(!!.) 호출만 허용됩니다.
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" validate="false"}

위의 예시에서 컴파일러는 프로퍼티에 접근하거나 연산을 수행하기 전에 널 허용 여부를 확인하기 위해 안전한 호출을 사용할 것을 요구합니다. 널 허용 타입을 처리하는 방법에는 여러 가지가 있습니다:

* [`if` 조건문으로 `null` 확인](#check-for-null-with-the-if-conditional)
* [안전한 호출 연산자(Safe call operator) `?.`](#safe-call-operator)
* [엘비스 연산자(Elvis operator) `?:`](#elvis-operator)
* [null 아님 단언 연산자(Not-null assertion operator) `!!`](#not-null-assertion-operator)
* [널 허용 수신 객체(Nullable receiver)](#nullable-receiver)
* [`let` 함수](#let-function)
* [안전한 캐스트(Safe casts) `as?`](#safe-casts)
* [널 허용 타입의 컬렉션](#collections-of-a-nullable-type)

`null` 처리 도구와 기술에 대한 자세한 내용과 예제는 다음 섹션을 참조하세요.

## if 조건문으로 null 확인

널 허용 타입을 다룰 때는 NPE를 피하기 위해 널 허용 여부를 안전하게 처리해야 합니다. 한 가지 방법은 `if` 조건식을 사용하여 명시적으로 널 허용 여부를 확인하는 것입니다.

예를 들어, `b`가 `null`인지 확인한 후 `b.length`에 접근합니다:

```kotlin
fun main() {
//sampleStart
    // 널 허용 변수에 null을 할당합니다.
    val b: String? = null
    // 먼저 널 여부를 확인한 후 길이에 접근합니다.
    val l = if (b != null) b.length else -1
    print(l)
    // -1
//sampleEnd
}
```
{kotlin-runnable="true"}

위의 예시에서 컴파일러는 [스마트 캐스트(smart cast)](typecasts.md#smart-casts)를 수행하여 타입을 널 허용 `String?`에서 널 불가능 `String`으로 바꿉니다. 또한 수행된 확인 정보를 추적하여 `if` 조건문 내부에서 `length` 호출을 허용합니다.

더 복잡한 조건도 지원됩니다:

```kotlin
fun main() {
//sampleStart
    // 널 허용 문자열을 변수에 할당합니다.
    val b: String? = "Kotlin"

    // 먼저 널 여부를 확인한 후 길이에 접근합니다.
    if (b != null && b.length > 0) {
        print("String of length ${b.length}")
        // String of length 6
    } else {
        // 조건이 충족되지 않을 경우 대안을 제공합니다.
        print("Empty string")
    }
//sampleEnd
}
```
{kotlin-runnable="true"}

위의 예시는 [스마트 캐스트 전제 조건](typecasts.md#smart-cast-prerequisites)과 마찬가지로, 컴파일러가 확인 시점과 사용 시점 사이에 `b`가 변경되지 않음을 보장할 수 있는 경우에만 작동한다는 점에 유의하세요.

## 안전한 호출 연산자

안전한 호출 연산자 `?.`를 사용하면 널 허용 여부를 더 짧은 형태로 안전하게 처리할 수 있습니다. 객체가 `null`인 경우 NPE를 발생시키는 대신, `?.` 연산자는 단순히 `null`을 반환합니다.

```kotlin
fun main() {
//sampleStart
    // 널 허용 문자열을 변수에 할당합니다.
    val a: String? = "Kotlin"
    // 널 허용 변수에 null을 할당합니다.
    val b: String? = null
    
    // 널 여부를 확인하고 길이 또는 null을 반환합니다.
    println(a?.length)
    // 6
    println(b?.length)
    // null
//sampleEnd
}
```
{kotlin-runnable="true"}

`b?.length` 식은 널 여부를 확인하여 `b`가 널이 아니면 `b.length`를 반환하고, 그렇지 않으면 `null`을 반환합니다. 이 식의 타입은 `Int?`입니다.

Kotlin에서 `?.` 연산자는 [`var`와 `val` 변수](basic-syntax.md#variables) 모두에 사용할 수 있습니다:

* 널 허용 `var`는 `null`(예: `var nullableValue: String? = null`) 또는 널이 아닌 값(예: `var nullableValue: String? = "Kotlin"`)을 가질 수 있습니다. 널이 아닌 값인 경우 언제든지 `null`로 변경할 수 있습니다.
* 널 허용 `val`은 `null`(예: `val nullableValue: String? = null`) 또는 널이 아닌 값(예: `val nullableValue: String? = "Kotlin"`)을 가질 수 있습니다. 널이 아닌 값인 경우 나중에 `null`로 변경할 수 없습니다.

안전한 호출은 체인 형태에서 유용합니다. 예를 들어, Bob이라는 직원이 부서에 배정될 수도 있고 그렇지 않을 수도 있습니다. 그 부서에는 부서장인 다른 직원이 있을 수 있습니다. Bob의 부서장 이름(있는 경우)을 얻으려면 다음과 같이 작성합니다:

```kotlin
bob?.department?.head?.name
```

이 체인은 프로퍼티 중 하나라도 `null`이면 `null`을 반환합니다.

안전한 호출을 할당문의 왼쪽에 배치할 수도 있습니다:

```kotlin
person?.department?.head = managersPool.getManager()
```

위의 예시에서 안전한 호출 체인의 수신 객체 중 하나가 `null`이면 할당이 건너뛰어지고 오른쪽 식은 전혀 평가되지 않습니다. 예를 들어 `person` 또는 `person.department`가 `null`이면 함수가 호출되지 않습니다. 다음은 `if` 조건문을 사용한 동일한 안전한 호출의 등가 코드입니다:

```kotlin
if (person != null && person.department != null) {
    person.department.head = managersPool.getManager()
}
```

## 엘비스 연산자

널 허용 타입을 다룰 때, `null`인지 확인하고 대안 값을 제공할 수 있습니다. 예를 들어, `b`가 `null`이 아니면 `b.length`에 접근하고, 그렇지 않으면 대안 값을 반환합니다:

```kotlin
fun main() {
//sampleStart
    // 널 허용 변수에 null을 할당합니다.
    val b: String? = null
    // 널 여부를 확인합니다. 널이 아니면 길이를 반환하고, 널이면 0을 반환합니다.
    val l: Int = if (b != null) b.length else 0
    println(l)
    // 0
//sampleEnd
}
```
{kotlin-runnable="true"}

완전한 `if` 식을 쓰는 대신 엘비스 연산자(Elvis operator) `?:`를 사용하여 더 간결하게 처리할 수 있습니다:

```kotlin
fun main() {
//sampleStart
    // 널 허용 변수에 null을 할당합니다.
    val b: String? = null
    // 널 여부를 확인합니다. 널이 아니면 길이를 반환하고, 널이면 널이 아닌 값을 반환합니다.
    val l = b?.length ?: 0
    println(l)
    // 0
//sampleEnd
}
```
{kotlin-runnable="true"}

`?:` 왼쪽의 식이 `null`이 아니면 엘비스 연산자는 그 값을 반환합니다. 그렇지 않으면 오른쪽 식을 반환합니다. 오른쪽 식은 왼쪽 식이 `null`인 경우에만 평가됩니다.

Kotlin에서 `throw`와 `return`은 식(expression)이므로 엘비스 연산자의 오른쪽에 사용할 수도 있습니다. 이는 함수 인수를 확인할 때 매우 유용할 수 있습니다:

```kotlin
fun foo(node: Node): String? {
    // getParent()를 확인합니다. 널이 아니면 parent에 할당되고, 널이면 null을 반환합니다.
    val parent = node.getParent() ?: return null
    // getName()을 확인합니다. 널이 아니면 name에 할당되고, 널이면 예외를 던집니다.
    val name = node.getName() ?: throw IllegalArgumentException("name expected")
    // ...
}
```

## null 아님 단언 연산자

null 아님 단언 연산자(not-null assertion operator) `!!`는 모든 값을 널 불가능 타입으로 변환합니다.

값이 `null`이 아닌 변수에 `!!` 연산자를 적용하면 널 불가능 타입으로 안전하게 처리되어 코드가 정상적으로 실행됩니다. 그러나 값이 `null`인 경우, `!!` 연산자는 이를 널 불가능으로 간주하도록 강제하여 NPE를 발생시킵니다.

`b`가 `null`이 아닐 때 `!!` 연산자가 널이 아닌 값(이 예제에서는 `String`)을 반환하게 하면 `length`에 올바르게 접근합니다:

```kotlin
fun main() {
//sampleStart
    // 널 허용 문자열을 변수에 할당합니다.
    val b: String? = "Kotlin"
    // b를 널이 아닌 것으로 간주하고 길이에 접근합니다.
    val l = b!!.length
    println(l)
    // 6
//sampleEnd
}
```
{kotlin-runnable="true"}

`b`가 `null`일 때 `!!` 연산자가 널이 아닌 값을 반환하게 하려고 하면 NPE가 발생합니다:

```kotlin
fun main() {
//sampleStart
    // 널 허용 변수에 null을 할당합니다.
    val b: String? = null
    // b를 널이 아닌 것으로 간주하고 길이에 접근하려고 시도합니다.
    val l = b!!.length
    println(l) 
    // Exception in thread "main" java.lang.NullPointerException
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" validate="false"}

`!!` 연산자는 값이 `null`이 아님을 확신하고 NPE가 발생할 가능성이 없지만, 특정 규칙으로 인해 컴파일러가 이를 보장할 수 없는 경우에 특히 유용합니다. 이러한 경우 `!!` 연산자를 사용하여 컴파일러에게 값이 `null`이 아님을 명시적으로 알릴 수 있습니다.

## 널 허용 수신 객체

[널 허용 수신 객체 타입(nullable receiver type)](extensions.md#nullable-receivers)을 가진 확장 함수를 사용할 수 있으며, 이를 통해 `null`일 수 있는 변수에서도 해당 함수를 호출할 수 있습니다.

널 허용 수신 객체 타입에 확장 함수를 정의하면, 함수를 호출하는 모든 곳에서 `null` 확인을 하는 대신 함수 내부에서 직접 `null` 값을 처리할 수 있습니다.

예를 들어, [`.toString()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/to-string.html) 확장 함수는 널 허용 수신 객체에서 호출될 수 있습니다. `null` 값에서 호출되면 예외를 던지는 대신 안전하게 `"null"` 문자열을 반환합니다:

```kotlin
//sampleStart
fun main() {
    // person 변수에 저장된 널 허용 Person 객체에 null을 할당합니다.
    val person: Person? = null

    // 널 허용 person 변수에 .toString을 적용하고 문자열을 출력합니다.
    println(person.toString())
    // null
}

// 간단한 Person 클래스를 정의합니다.
data class Person(val name: String)
//sampleEnd
```
{kotlin-runnable="true"}

위의 예시에서 `person`이 `null`임에도 불구하고 `.toString()` 함수는 안전하게 `"null"` 문자열을 반환합니다. 이는 디버깅 및 로깅에 유용할 수 있습니다.

`.toString()` 함수가 널 허용 문자열(문자열 표현 또는 `null`)을 반환하기를 원한다면 [안전한 호출 연산자 `?.`](#safe-call-operator)를 사용하세요. `?.` 연산자는 객체가 `null`이 아닌 경우에만 `.toString()`을 호출하고, 그렇지 않으면 `null`을 반환합니다.

```kotlin
//sampleStart
fun main() {
    // 널 허용 Person 객체를 변수에 할당합니다.
    val person1: Person? = null
    val person2: Person? = Person("Alice")

    // person이 null이면 "null"을 출력하고, 그렇지 않으면 person.toString()의 결과를 출력합니다.
    println(person1?.toString())
    // null
    println(person2?.toString())
    // Person(name=Alice)
}

// Person 클래스를 정의합니다.
data class Person(val name: String)
//sampleEnd
```
{kotlin-runnable="true"}

`?.` 연산자를 사용하면 `null`일 수 있는 객체의 프로퍼티나 함수에 접근하면서도 잠재적인 `null` 값을 안전하게 처리할 수 있습니다.

## let 함수

`null` 값을 처리하고 널 불가능 타입에 대해서만 연산을 수행하려면 안전한 호출 연산자 `?.`를 [`let` 함수](scope-functions.md#let)와 함께 사용할 수 있습니다.

이 조합은 식을 평가하고 결과를 `null`인지 확인한 후, 널이 아닌 경우에만 코드를 실행하여 수동으로 널 확인을 하지 않아도 되게 할 때 유용합니다.

```kotlin
fun main() {
//sampleStart
    // 널 허용 문자열 리스트를 선언합니다.
    val listWithNulls: `List<String?>` = listOf("Kotlin", null)

    // 리스트의 각 아이템을 반복합니다.
    for (item in listWithNulls) {
        // 아이템이 null인지 확인하고 널이 아닌 값만 출력합니다.
        item?.let { println(it) }
        // Kotlin 
    }
//sampleEnd
}
```
{kotlin-runnable="true"}

## 안전한 캐스트

[타입 캐스트](typecasts.md#unsafe-cast-operator)를 위한 일반적인 Kotlin 연산자는 `as` 연산자입니다. 그러나 일반적인 캐스트는 객체가 대상 타입이 아닌 경우 예외를 발생시킬 수 있습니다.

안전한 캐스트를 위해 `as?` 연산자를 사용할 수 있습니다. 이 연산자는 값을 지정된 타입으로 캐스팅하려고 시도하며, 값이 해당 타입이 아닌 경우 `null`을 반환합니다.

```kotlin
fun main() {
//sampleStart
    // 어떤 타입의 값도 가질 수 있는 Any 타입의 변수를 선언합니다.
    val a: Any = "Hello, Kotlin!"

    // 'as?' 연산자를 사용하여 Int로 안전하게 캐스팅합니다.
    val aInt: Int? = a as? Int
    // 'as?' 연산자를 사용하여 String으로 안전하게 캐스팅합니다.
    val aString: String? = a as? String

    println(aInt)
    // null
    println(aString)
    // "Hello, Kotlin!"
//sampleEnd
}
```
{kotlin-runnable="true"}

위 코드는 `a`가 `Int`가 아니므로 안전하게 캐스팅에 실패하여 `null`을 출력합니다. 또한 `String?` 타입과는 일치하므로 안전한 캐스트에 성공하여 `"Hello, Kotlin!"`을 출력합니다.

## 널 허용 타입의 컬렉션

널 허용 요소가 포함된 컬렉션에서 널이 아닌 요소만 유지하고 싶다면 `filterNotNull()` 함수를 사용하세요:

```kotlin
fun main() {
//sampleStart
    // 일부 null 및 null이 아닌 정수 값을 포함하는 리스트를 선언합니다.
    val nullableList: `List<Int?>` = listOf(1, 2, null, 4)

    // null 값을 필터링하여 널이 아닌 정수 리스트를 생성합니다.
    val intList: `List<Int>` = nullableList.filterNotNull()
  
    println(intList)
    // [1, 2, 4]
//sampleEnd
}
```
{kotlin-runnable="true"}

## 다음 단계

* [Java와 Kotlin에서 널 허용 여부를 처리하는 방법](java-to-kotlin-nullability-guide.md)을 배워보세요.
* [확실히 널 불가능한 제네릭 타입](generics.md#definitely-non-nullable-types)에 대해 알아보세요.