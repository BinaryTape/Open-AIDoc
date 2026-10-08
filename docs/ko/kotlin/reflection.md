[//]: # (title: 리플렉션(Reflection))

리플렉션(_Reflection_)은 실행 시점(runtime)에 프로그램의 구조를 조사할 수 있게 해주는 언어 및 라이브러리 기능의 집합입니다.
Kotlin에서 함수와 프로퍼티는 일급 객체(first-class citizens)이며, 실행 시점에 프로퍼티나 함수의 이름 또는 타입을 알아내는 등의 조사 능력은 함수형 또는 반응형 스타일을 사용할 때 필수적입니다.

> Kotlin/JS는 리플렉션 기능을 제한적으로 지원합니다. [Kotlin/JS의 리플렉션에 대해 더 알아보기](js-reflection.md).
>
{style="note"}

## JVM 의존성 {id="jvm-dependency"}

JVM 플랫폼에서 Kotlin 컴파일러 배포판에는 리플렉션 기능을 사용하는 데 필요한 런타임 컴포넌트가 `kotlin-reflect.jar`라는 별도의 아티팩트로 포함되어 있습니다. 이는 리플렉션 기능을 사용하지 않는 애플리케이션의 런타임 라이브러리 크기를 줄이기 위함입니다.

Gradle이나 Maven 프로젝트에서 리플렉션을 사용하려면 `kotlin-reflect` 의존성을 추가하세요.

* Gradle의 경우:

    <tabs group="build-script">
    <tab title="Kotlin" group-key="kotlin">

    ```kotlin
    dependencies {
        implementation(kotlin("reflect"))
    }
    ```

    </tab>
    <tab title="Groovy" group-key="groovy">
    
    ```groovy
    dependencies {
        implementation "org.jetbrains.kotlin:kotlin-reflect:%kotlinVersion%"
    }
    ```

    </tab>
    </tabs>

* Maven의 경우:
    
    ```xml
    <dependencies>
        <dependency>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-reflect</artifactId>
        </dependency>
    </dependencies>
    ```

Gradle이나 Maven을 사용하지 않는 경우, 프로젝트의 클래스패스(classpath)에 `kotlin-reflect.jar`가 포함되어 있는지 확인하세요.
그 외 지원되는 경우(커맨드 라인 컴파일러를 사용하는 IntelliJ IDEA 프로젝트)에는 기본적으로 추가됩니다. 커맨드 라인 컴파일러에서는 `-no-reflect` 컴파일러 옵션을 사용하여 클래스패스에서 `kotlin-reflect.jar`를 제외할 수 있습니다.

## 클래스 참조(Class references) {id="class-references"}

가장 기본적인 리플렉션 기능은 Kotlin 클래스에 대한 런타임 참조를 얻는 것입니다. 정적으로 알고 있는 Kotlin 클래스의 참조를 얻으려면 _클래스 리터럴(class literal)_ 구문을 사용합니다.

```kotlin
val c = MyClass::class
```

이 참조는 [KClass](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-class/index.html) 타입의 값입니다.

>JVM에서: Kotlin 클래스 참조는 Java 클래스 참조와 다릅니다. Java 클래스 참조를 얻으려면 `KClass` 인스턴스의 `.java` 프로퍼티를 사용하세요.
>
{style="note"}

### 바인딩된 클래스 참조(Bound class references) {id="bound-class-references"}

객체를 수신 객체로 사용하여 동일한 `::class` 구문으로 특정 객체의 클래스 참조를 얻을 수 있습니다.

```kotlin
val widget: Widget = ...
assert(widget is GoodWidget) { "Bad widget: ${widget::class.qualifiedName}" }
```

수신 객체 표현식의 타입(`Widget`)에 관계없이 `GoodWidget` 또는 `BadWidget`과 같이 해당 객체의 실제 클래스에 대한 참조를 얻게 됩니다.

## 호출 가능 참조(Callable references) {id="callable-references"}

함수, 프로퍼티, 생성자에 대한 참조는 호출하거나 [함수 타입](lambdas.md#function-types)의 인스턴스로 사용할 수 있습니다.

모든 호출 가능 참조의 공통 상위 타입은 [`KCallable<out R>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-callable/index.html)이며, 여기서 `R`은 반환 값의 타입입니다. 프로퍼티의 경우 프로퍼티 타입이고, 생성자의 경우 생성된 타입입니다.

### 함수 참조(Function references) {id="function-references"}

아래와 같이 선언된 명명된 함수가 있을 때, 이를 직접 호출할 수 있습니다(`isOdd(5)`).

```kotlin
fun isOdd(x: Int) = x % 2 != 0
```

대신 함수를 함수 타입 값으로 사용하거나, 즉 다른 함수에 전달할 수 있습니다. 이를 위해 `::` 연산자를 사용합니다.

```kotlin
fun isOdd(x: Int) = x % 2 != 0

fun main() {
//sampleStart
    val numbers = listOf(1, 2, 3)
    println(numbers.filter(::isOdd))
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

여기서 `::isOdd`는 함수 타입 `(Int) -> Boolean`의 값입니다.

함수 참조는 파라미터 개수에 따라 [`KFunction<out R>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-function/index.html)의 하위 타입 중 하나에 속합니다. 예를 들어, `KFunction3<T1, T2, T3, R>`과 같습니다.

문맥에서 예상되는 타입을 알 수 있는 경우 오버로딩된 함수에 `::`를 사용할 수 있습니다.
예를 들어:

```kotlin
fun main() {
//sampleStart
    fun isOdd(x: Int) = x % 2 != 0
    fun isOdd(s: String) = s == "brillig" || s == "slithy" || s == "tove"
    
    val numbers = listOf(1, 2, 3)
    println(numbers.filter(::isOdd)) // isOdd(x: Int)를 참조함
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

또는 명시적으로 지정된 타입을 가진 변수에 메서드 참조를 저장하여 필요한 문맥을 제공할 수 있습니다.

```kotlin
val predicate: (String) -> Boolean = ::isOdd   // isOdd(x: String)을 참조함
```

클래스의 멤버나 확장 함수를 사용해야 하는 경우, `String::toCharArray`와 같이 한정(qualify)되어야 합니다.

변수를 확장 함수에 대한 참조로 초기화하더라도, 추론된 함수 타입은 수신 객체를 가지지 않지만 수신 객체를 인자로 받는 추가적인 파라미터를 갖게 됩니다. 대신 수신 객체가 있는 함수 타입을 가지려면 타입을 명시적으로 지정하세요.

```kotlin
val isEmptyStringList: List<String>.() -> Boolean = List<String>::isEmpty
```

#### 예시: 함수 합성(function composition) {id="example-function-composition"}

다음 함수를 살펴보세요.

```kotlin
fun <A, B, C> compose(f: (B) -> C, g: (A) -> B): (A) -> C {
    return { x -> f(g(x)) }
}
```

이 함수는 전달된 두 함수의 합성인 `compose(f, g) = f(g(*))`를 반환합니다.
이 함수를 호출 가능 참조에 적용할 수 있습니다.

```kotlin
fun <A, B, C> compose(f: (B) -> C, g: (A) -> B): (A) -> C {
    return { x -> f(g(x)) }
}

fun isOdd(x: Int) = x % 2 != 0

fun main() {
//sampleStart
    fun length(s: String) = s.length
    
    val oddLength = compose(::isOdd, ::length)
    val strings = listOf("a", "ab", "abc")
    
    println(strings.filter(oddLength))
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### 프로퍼티 참조(Property references) {id="property-references"}

Kotlin에서 프로퍼티를 일급 객체로 다루려면 `::` 연산자를 사용합니다.

```kotlin
val x = 1

fun main() {
    println(::x.get())
    println(::x.name) 
}
```

표현식 `::x`는 `KProperty0<Int>` 타입의 프로퍼티 객체로 평가됩니다. `get()`을 사용하여 값을 읽거나 `name` 프로퍼티를 사용하여 프로퍼티 이름을 가져올 수 있습니다. 자세한 내용은 [`KProperty` 클래스 문서](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-property/index.html)를 참조하세요.

`var y = 1`과 같은 가변 프로퍼티의 경우, `::y`는 `set()` 메서드를 가진 [`KMutableProperty0<Int>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-mutable-property/index.html) 타입의 값을 반환합니다.

```kotlin
var y = 1

fun main() {
    ::y.set(2)
    println(y)
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

프로퍼티 참조는 단일 제네릭 파라미터를 기대하는 함수가 필요한 곳에서 사용될 수 있습니다.

```kotlin
fun main() {
//sampleStart
    val strs = listOf("a", "bc", "def")
    println(strs.map(String::length))
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

클래스의 멤버인 프로퍼티에 접근하려면 다음과 같이 한정합니다.

```kotlin
fun main() {
//sampleStart
    class A(val p: Int)
    val prop = A::p
    println(prop.get(A(1)))
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

확장 프로퍼티의 경우:

```kotlin
val String.lastChar: Char
    get() = this[length - 1]

fun main() {
    println(String::lastChar.get("abc"))
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### Java 리플렉션과의 상호운용성 {id="interoperability-with-java-reflection"}

JVM 플랫폼에서 표준 라이브러리에는 Java 리플렉션 객체와의 매핑을 제공하는 리플렉션 클래스용 확장 기능이 포함되어 있습니다(`kotlin.reflect.jvm` 패키지 참조).
예를 들어, Kotlin 프로퍼티의 게터 역할을 하는 Java 메서드나 지원 필드(backing field)를 찾으려면 다음과 같이 작성할 수 있습니다.

```kotlin
import kotlin.reflect.jvm.*
 
class A(val p: Int)
 
fun main() {
    println(A::p.javaGetter) // "public final int A.getP()" 출력
    println(A::p.javaField)  // "private final int A.p" 출력
}
```

Java 클래스에 대응하는 Kotlin 클래스를 얻으려면 `.kotlin` 확장 프로퍼티를 사용하세요.

```kotlin
fun getKClass(o: Any): KClass<Any> = o.javaClass.kotlin
```

### 생성자 참조(Constructor references) {id="constructor-references"}

생성자는 메서드나 프로퍼티처럼 참조될 수 있습니다. 생성자와 동일한 파라미터를 받고 해당 타입의 객체를 반환하는 함수 타입 객체가 필요한 곳이면 어디에서나 생성자 참조를 사용할 수 있습니다.
생성자는 `::` 연산자를 사용하고 클래스 이름을 추가하여 참조합니다. 파라미터가 없고 반환 타입이 `Foo`인 함수 파라미터를 기대하는 다음 함수를 고려해 보세요.

```kotlin
class Foo

fun function(factory: () -> Foo) {
    val x: Foo = factory()
}
```

클래스 `Foo`의 인자가 없는 생성자인 `::Foo`를 사용하여 다음과 같이 호출할 수 있습니다.

```kotlin
function(::Foo)
```

생성자에 대한 호출 가능 참조는 파라미터 개수에 따라 [`KFunction<out R>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-function/index.html) 하위 타입 중 하나로 타입이 지정됩니다.

### 바인딩된 함수 및 프로퍼티 참조(Bound function and property references) {id="bound-function-and-property-references"}

특정 객체의 인스턴스 메서드를 참조할 수 있습니다.

```kotlin
fun main() {
//sampleStart
    val numberRegex = "\\d+".toRegex()
    println(numberRegex.matches("29"))
     
    val isNumber = numberRegex::matches
    println(isNumber("29"))
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

위의 예제에서는 `matches` 메서드를 직접 호출하는 대신 해당 메서드에 대한 참조를 사용합니다.
이러한 참조는 수신 객체에 바인딩(bound)됩니다.
위의 예제처럼 직접 호출하거나 함수 타입 표현식이 필요한 곳에서 사용할 수 있습니다.

```kotlin
fun main() {
//sampleStart
    val numberRegex = "\\d+".toRegex()
    val strings = listOf("abc", "124", "a70")
    println(strings.filter(numberRegex::matches))
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

바인딩된 참조와 바인딩되지 않은(unbound) 참조의 타입을 비교해 보세요.
바인딩된 호출 가능 참조는 수신 객체가 참조에 "연결(attached)"되어 있으므로 수신 객체의 타입이 더 이상 파라미터가 아닙니다.

```kotlin
val isNumber: (CharSequence) -> Boolean = numberRegex::matches

val matches: (Regex, CharSequence) -> Boolean = Regex::matches
```

프로퍼티 참조도 바인딩될 수 있습니다.

```kotlin
fun main() {
//sampleStart
    val prop = "abc"::length
    println(prop.get())
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

수신 객체로 `this`를 지정할 필요는 없습니다. `this::foo`와 `::foo`는 동일합니다.

### 바인딩된 생성자 참조(Bound constructor references) {id="bound-constructor-references"}

[내부 클래스(inner class)](nested-classes.md#inner-classes)의 생성자에 대한 바인딩된 호출 가능 참조는 외부 클래스의 인스턴스를 제공하여 얻을 수 있습니다.

```kotlin
class Outer {
    inner class Inner
}

val o = Outer()
val boundInnerCtor = o::Inner
```
