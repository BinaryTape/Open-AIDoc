[//]: # (title: Kotlin/JS 리플렉션)

Kotlin/JS는 Kotlin [리플렉션 API](reflection.md)를 제한적으로 지원합니다. 지원되는 API 부분은 다음과 같습니다:

* [클래스 참조](reflection.md#class-references) (`::class`)
* [`KType` 및 `typeof()`](#ktype-and-typeof)
* [`KClass` 및 `createInstance()`](#kclass-and-createinstance)

## 클래스 참조 {id="class-references"}

`::class` 구문은 인스턴스의 클래스 또는 지정된 타입에 해당하는 클래스에 대한 참조를 반환합니다.
Kotlin/JS에서 `::class` 표현식의 값은 다음만을 지원하는 축소된(stripped-down) [KClass](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-class/) 구현체입니다:
* [simpleName](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-class/simple-name.html) 및 [isInstance()](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-class/is-instance.html) 멤버.
* [cast()](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/cast.html) 및 [safeCast()](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/safe-cast.html) 확장 함수.

그 외에도, [KClass.js](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.js/js.html)를 사용하여 클래스에 해당하는 [JsClass](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.js/-js-class/index.html) 인스턴스에 접근할 수 있습니다.
`JsClass` 인스턴스 자체는 생성자 함수(constructor function)에 대한 참조입니다.
이는 생성자 참조를 기대하는 JS 함수와 상호 운용할 때 사용할 수 있습니다.

## KType 및 typeOf() {id="ktype-and-typeof"}

[`typeof()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/type-of.html) 함수는 지정된 타입에 대한 [`KType`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-type/) 인스턴스를 생성합니다.
`KType` API는 Java 전용 부분을 제외하고 Kotlin/JS에서 완전히 지원됩니다.

## KClass 및 createInstance() {id="kclass-and-createinstance"}

[KClass](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-class/) 인터페이스의 [`createInstance()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect.full/create-instance.html) 함수는 지정된 클래스의 새로운 인스턴스를 생성하며, 이는 Kotlin 클래스에 대한 런타임 참조를 얻는 데 유용합니다.

## 예제 {id="example"}

다음은 Kotlin/JS에서의 리플렉션 사용 예제입니다.

```kotlin
open class Shape
class Rectangle : Shape()

inline fun <reified T> accessReifiedTypeArg() =
    println(typeOf<T>().toString())

fun main() {
    val s = Shape()
    val r = Rectangle()

    println(r::class.simpleName) // "Rectangle" 출력
    println(Shape::class.simpleName) // "Shape" 출력
    println(Shape::class.js.name) // "Shape" 출력

    println(Shape::class.isInstance(r)) // "true" 출력
    println(Rectangle::class.isInstance(s)) // "false" 출력
    val rShape = Shape::class.cast(r) // Rectangle "r"을 Shape으로 캐스팅

    accessReifiedTypeArg<Rectangle>() // typeOf()를 통해 타입에 접근. "Rectangle" 출력
}
```
