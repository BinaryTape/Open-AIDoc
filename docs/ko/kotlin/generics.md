[//]: # (title: 제네릭: in, out, where)

Kotlin의 클래스는 Java와 마찬가지로 타입 파라미터를 가질 수 있습니다:

```kotlin
class Box<T>(t: T) {
    var value = t
}
```

이러한 클래스의 인스턴스를 생성하려면 타입 인자(type argument)를 제공하기만 하면 됩니다:

```kotlin
val box: Box<Int> = Box<Int>(1)
```

생성자 인자 등을 통해 컴파일러가 타입 인자를 추론할 수 있는 경우에는 명시적으로 지정할 필요가 없습니다:

```kotlin
val box = Box(1) // 1의 타입이 Int이므로 컴파일러는 이 인스턴스가 Box<Int>임을 추론합니다.
```

## 변성(Variance) {id="variance"}

Java 타입 시스템에서 가장 까다로운 부분 중 하나는 와일드카드 타입입니다([Java Generics FAQ](http://www.angelikalanger.com/GenericsFAQ/JavaGenericsFAQ.html) 참조).
Kotlin에는 이러한 와일드카드 타입이 없습니다. 대신 Kotlin은 선언처 변성(declaration-site variance)과 타입 프로젝션(type projections)을 제공합니다.

### Java의 변성과 와일드카드 {id="variance-and-wildcards-in-java"}

Java에 왜 이러한 복잡한 와일드카드가 필요한지 생각해 보겠습니다. 먼저, Java의 제네릭 타입은 _무공변(invariant)_입니다. 즉, `List<String>`은 `List<Object>`의 하위 타입이 _아닙니다_. 만약 `List`가 _무공변_이 아니었다면 Java의 배열보다 나을 것이 없었을 것입니다. 다음과 같은 코드가 컴파일은 되지만 런타임에 예외를 발생시켰을 것이기 때문입니다:

```java
// Java
List<String> strs = new ArrayList<String>();

// Java는 여기서 컴파일 시점에 타입 불일치 오류를 보고합니다.
List<Object> objs = strs;

// 만약 오류가 발생하지 않는다면 어떻게 될까요?
// String 리스트에 Integer를 넣을 수 있게 됩니다.
objs.add(1);

// 그리고 런타임에 Java는 다음과 같은 예외를 던집니다.
// ClassCastException: Integer cannot be cast to String
String s = strs.get(0); 
```

Java는 런타임 안전성을 보장하기 위해 이러한 동작을 금지합니다. 하지만 여기에는 부작용이 따릅니다. 예를 들어, `Collection` 인터페이스의 `addAll()` 메서드를 살펴보겠습니다. 이 메서드의 시그니처는 어떠할까요? 직관적으로는 다음과 같이 작성할 것입니다:

```java
// Java
interface Collection<E> ... {
    void addAll(Collection<E> items);
}
```

그러나 이렇게 하면 완벽하게 안전한 다음 작업을 수행할 수 없게 됩니다:

```java
// Java

// addAll의 단순한 선언으로는 다음 코드가 컴파일되지 않습니다.
// Collection<String>은 Collection<Object>의 하위 타입이 아니기 때문입니다.
void copyAll(Collection<Object> to, Collection<String> from) {
    to.addAll(from);
}
```

이것이 바로 `addAll()`의 실제 시그니처가 다음과 같은 이유입니다:

```java
// Java
interface Collection<E> ... {
    void addAll(Collection<? extends E> items);
}
```

_와일드카드 타입 인자_ `? extends E`는 이 메서드가 `E` 자체뿐만 아니라 `E` _또는 `E`의 하위 타입_ 객체의 컬렉션을 허용한다는 것을 나타냅니다. 즉, 컬렉션의 아이템으로부터 `E`를 안전하게 _읽을_ 수 있지만(컬렉션의 요소가 E의 서브클래스 인스턴스이므로), 알 수 없는 `E`의 하위 타입과 일치하는 객체가 무엇인지 알 수 없기 때문에 컬렉션에 _쓸 수는 없습니다_.
이러한 제약의 대가로 원하는 동작을 얻을 수 있습니다. 즉, `Collection<String>`은 `Collection<? extends Object>`의 하위 타입이 _됩니다_.
다시 말해, _extends_ 경계(_상한_ 경계)를 가진 와일드카드는 해당 타입을 _공변(covariant)_으로 만듭니다.

이것이 작동하는 원리를 이해하는 핵심은 매우 단순합니다. 컬렉션에서 아이템을 _꺼내기만_ 할 수 있다면, `String` 컬렉션을 사용하여 그로부터 `Object`를 읽는 것은 문제가 없습니다. 반대로 컬렉션에 아이템을 _넣기만_ 할 수 있다면, `Object` 컬렉션을 가져와서 그 안에 `String`을 넣어도 괜찮습니다. Java에는 `String` 또는 그 상위 타입을 허용하는 `List<? super String>`이 존재합니다.

후자를 _반공변(contravariance)_이라고 부르며, `List<? super String>`에서는 `String`을 인자로 받는 메서드만 호출할 수 있습니다(예를 들어 `add(String)`이나 `set(int, String)` 호출 가능). 만약 `List<T>`에서 `T`를 반환하는 메서드를 호출하면 `String`이 아닌 `Object`를 얻게 됩니다.

Joshua Bloch는 그의 저서 [Effective Java, 3rd Edition](http://www.oracle.com/technetwork/java/effectivejava-136174.html)에서 이 문제를 잘 설명하고 있습니다(Item 31: "한정적 와일드카드를 써서 API 유연성을 높이라"). 그는 _읽기만_ 하는 객체를 _생산자(Producers)_, _쓰기만_ 하는 객체를 _소비자(Consumers)_라고 명명했습니다. 그리고 다음과 같이 권장합니다:

>"유연성을 극대화하려면 원소의 생산자나 소비자 역할을 하는 입력 매개변수에 와일드카드 타입을 사용하라."

또한 그는 다음과 같은 암기법을 제시합니다. _PECS_는 _Producer-Extends, Consumer-Super_를 의미합니다.

> 예를 들어 `List<? extends Foo>`와 같은 생산자 객체를 사용할 경우 이 객체에 대해 `add()`나 `set()`을 호출할 수 없지만, 그렇다고 이것이 _불변(immutable)_임을 의미하지는 않습니다. 예를 들어 `clear()`는 매개변수를 전혀 받지 않으므로 리스트의 모든 아이템을 제거하기 위해 `clear()`를 호출하는 것은 아무런 제약이 없습니다.
>
> 와일드카드(또는 다른 형태의 변성)가 보장하는 유일한 것은 _타입 안전성(type safety)_입니다. 불변성은 완전히 다른 문제입니다.
>
{style="note"}

### 선언처 변성(Declaration-site variance) {id="declaration-site-variance"}

`T`를 매개변수로 받는 메서드는 없고, `T`를 반환하는 메서드만 있는 제네릭 인터페이스 `Source<T>`가 있다고 가정해 보겠습니다:

```java
// Java
interface Source<T> {
    T nextT();
}
```

이 경우 소비자 메서드가 전혀 없으므로 `Source<String>` 인스턴스에 대한 참조를 `Source<Object>` 타입의 변수에 저장하는 것은 완벽히 안전합니다. 하지만 Java는 이를 알지 못하며 여전히 금지합니다:

```java
// Java
void demo(Source<String> strs) {
    Source<Object> objects = strs; // !!! Java에서는 허용되지 않음
    // ...
}
```

이를 해결하려면 `Source<? extends Object>` 타입의 객체로 선언해야 합니다. 그러나 그런 변수에서도 이전과 완전히 동일한 메서드를 호출할 수 있기 때문에 복잡한 타입으로 선언하는 것은 의미가 없으며 어떠한 가치도 더해주지 못합니다. 하지만 컴파일러는 그것을 알지 못합니다.

Kotlin에서는 컴파일러에게 이러한 상황을 설명할 수 있는 방법이 있습니다. 이를 _선언처 변성(declaration-site variance)_이라고 합니다. `Source`의 _타입 파라미터_ `T`에 어노테이션(수식어)을 추가하여 `Source<T>`의 멤버에서 오직 _반환_(생산)만 되고 절대 소비되지 않도록 지정할 수 있습니다.
이를 위해 `out` 수식어를 사용합니다:

```kotlin
interface Source<out T> {
    fun nextT(): T
}

fun demo(strs: Source<String>) {
    val objects: Source<Any> = strs // T가 out 파라미터이므로 문제없음
    // ...
}
```

일반적인 규칙은 다음과 같습니다. 클래스 `C`의 타입 파라미터 `T`가 `out`으로 선언되면, `C`의 멤버 내에서 오직 _out_ 위치에만 나타날 수 있지만, 그 대가로 `C<Base>`는 안전하게 `C<Derived>`의 상위 타입이 될 수 있습니다.

다시 말해, 클래스 `C`는 파라미터 `T`에 대해 _공변(covariant)_한다거나, `T`는 _공변_ 타입 파라미터라고 표현할 수 있습니다. `C`를 `T`의 _생산자_로 생각할 수 있으며, `T`의 _소비자_가 아닌 것으로 볼 수 있습니다.

`out` 수식어는 _변성 어노테이션(variance annotation)_이라고 불리며, 타입 파라미터 선언 위치에 제공되므로 _선언처 변성(declaration-site variance)_을 제공합니다.
이는 타입 사용 위치의 와일드카드가 타입을 공변으로 만드는 Java의 _사용처 변성(use-site variance)_과 대조됩니다.

Kotlin은 `out` 외에도 상호보완적인 변성 어노테이션인 `in`을 제공합니다. 이는 타입 파라미터를 _반공변(contravariant)_으로 만들어 오직 소비만 되고 절대 생산되지 않도록 합니다. 반공변 타입의 대표적인 예로는 `Comparable`이 있습니다:

```kotlin
interface Comparable<in T> {
    operator fun compareTo(other: T): Int
}

fun demo(x: Comparable<Number>) {
    x.compareTo(1.0) // 1.0은 Number의 하위 타입인 Double 타입임
    // 따라서 x를 Comparable<Double> 타입의 변수에 할당할 수 있음
    val y: Comparable<Double> = x // 가능!
}
```

_in_과 _out_이라는 단어는 자명해 보이며(C#에서 꽤 오랫동안 성공적으로 사용되어 왔음), 앞서 언급한 암기법은 실제로 크게 필요하지 않습니다. 사실상 더 높은 수준의 추상화로 다음과 같이 바꿔 말할 수 있습니다:

**[실존주의적](https://en.wikipedia.org/wiki/Existentialism) 변환: 소비자는 in, 생산자는 out!** :-)

## 타입 프로젝션(Type projections) {id="type-projections"}

### 사용처 변성: 타입 프로젝션 {id="use-site-variance-type-projections"}

타입 파라미터 `T`를 `out`으로 선언하고 사용처에서 하위 타입 관계 문제를 피하는 것은 매우 쉽지만, 어떤 클래스들은 실제로 오직 `T`만을 반환하도록 제한할 수 _없습니다_!
대표적인 예가 바로 `Array`입니다:

```kotlin
class Array<T>(val size: Int) {
    operator fun get(index: Int): T { ... }
    operator fun set(index: Int, value: T) { ... }
}
```

이 클래스는 `T`에 대해 공변도 반공변도 될 수 없습니다. 그리고 이는 유연성을 떨어뜨립니다. 다음 함수를 살펴보겠습니다:

```kotlin
fun copy(from: Array<Any>, to: Array<Any>) {
    assert(from.size == to.size)
    for (i in from.indices)
        to[i] = from[i]
}
```

이 함수는 한 배열에서 다른 배열로 아이템을 복사하는 역할을 합니다. 실제로 적용해 보겠습니다:

```kotlin
val ints: Array<Int> = arrayOf(1, 2, 3)
val any = Array<Any>(3) { "" } 
copy(ints, any)
//   ^ Array<Any>를 기대했지만 실제 타입은 Array<Int>임
```

여기서 익숙한 문제에 다시 부딪히게 됩니다. `Array<T>`는 `T`에 대해 _무공변(invariant)_이므로 `Array<Int>`와 `Array<Any>`는 서로 하위 타입이 아닙니다. 왜 그럴까요? 역시 `copy` 함수가 예상치 못한 동작을 할 수 있기 때문입니다. 예를 들어 `from`에 `String`을 쓰려고 시도할 수 있고, 만약 실제로 `Int` 배열을 전달했다면 나중에 `ClassCastException`이 발생하게 됩니다.

`copy` 함수가 `from`에 _쓰는_ 것을 방지하려면 다음과 같이 할 수 있습니다:

```kotlin
fun copy(from: Array<out Any>, to: Array<Any>) { ... }
```

이것이 바로 _타입 프로젝션(type projection)_입니다. 즉, `from`은 단순한 배열이 아니라 제한된(_투영된_) 배열입니다. 타입 파라미터 `T`를 반환하는 메서드만 호출할 수 있으며, 이 경우에는 `get()`만 호출할 수 있음을 의미합니다.
이것이 Kotlin의 _사용처 변성(use-site variance)_ 접근 방식이며, Java의 `Array<? extends Object>`에 해당하면서도 약간 더 단순합니다.

`in`을 사용해서도 타입을 프로젝션할 수 있습니다:

```kotlin
fun fill(dest: Array<in String>, value: String) { ... }
```

`Array<in String>`은 Java의 `Array<? super String>`에 해당합니다. 이는 `fill()` 함수에 `String`, `CharSequence`, 또는 `Object`의 배열을 전달할 수 있음을 의미합니다.

### 스타 프로젝션(Star-projections) {id="star-projections"}

때로는 타입 인자에 대해 아무것도 알지 못하지만, 여전히 안전한 방식으로 사용하고 싶을 때가 있습니다.
여기서 안전한 방법이란, 제네릭 타입의 모든 구체적인 인스턴스가 해당 프로젝션의 하위 타입이 되도록 제네릭 타입을 프로젝션하여 정의하는 것입니다.

Kotlin은 이를 위해 소위 _스타 프로젝션(star-projection)_ 구문을 제공합니다:

- 상한 경계 `TUpper`를 갖는 공변 타입 파라미터 `T`에 대한 `Foo<out T : TUpper>`의 경우, `Foo<*>`는 `Foo<out TUpper>`와 동등합니다. 이는 `T`를 알 수 없을 때 `Foo<*>`에서 `TUpper` 타입의 값을 안전하게 _읽을_ 수 있음을 의미합니다.
- 반공변 타입 파라미터 `T`에 대한 `Foo<in T>`의 경우, `Foo<*>`는 `Foo<in Nothing>`과 동등합니다. 이는 `T`를 알 수 없을 때 `Foo<*>`에 안전하게 _쓸_ 수 있는 방법이 없음을 의미합니다.
- 상한 경계 `TUpper`를 갖는 무공변 타입 파라미터 `T`에 대한 `Foo<T : TUpper>`의 경우, 값을 읽을 때는 `Foo<*>`가 `Foo<out TUpper>`와 동등하고, 값을 쓸 때는 `Foo<in Nothing>`과 동등합니다.

제네릭 타입에 여러 타입 파라미터가 있는 경우, 각각을 독립적으로 프로젝션할 수 있습니다.
예를 들어 타입이 `interface Function<in T, out U>`로 선언된 경우 다음과 같은 스타 프로젝션을 사용할 수 있습니다:

* `Function<*, String>`은 `Function<in Nothing, String>`을 의미합니다.
* `Function<Int, *>`는 `Function<Int, out Any?>`를 의미합니다.
* `Function<*, *>`는 `Function<in Nothing, out Any?>`를 의미합니다.

> 스타 프로젝션은 Java의 로우 타입(raw types)과 매우 유사하지만 안전합니다.
>
{style="note"}

### 캡처된 타입(Captured types) {id="captured-types"}

`out T` 또는 `in T`와 같은 타입 프로젝션을 사용할 때 컴파일러는 내부적으로 알 수 없는 구체적인 타입을 [*캡처된 타입(captured type)*](https://kotlinlang.org/spec/type-system.html#type-capturing)으로 표현합니다. 캡처된 타입은 알려진 상한 및 하한 경계를 가진 알 수 없는 타입입니다.

캡처된 타입은 비표기적(non-denotable)이므로 Kotlin 코드에서 직접 작성할 수 없습니다. 대신 `CapturedType(out X)`와 같은 컴파일러 진단 메시지에서 캡처된 타입을 가장 자주 접할 수 있습니다. 예를 들어 다음의 타입 불일치 진단 메시지에는 캡처된 타입이 포함되어 있습니다:

```kotlin
val array: Array<out CharSequence> = arrayOf("str")
val item: Int = array.get(0)
// 초기화 타입 불일치: 'Int'를 기대했지만 실제 타입은 'CapturedType(out CharSequence)'임
```

컴파일러는 읽기 작업에는 캡처된 타입의 상한 경계를 사용하고, 쓰기 작업에는 어떤 값이 타입 안전한지 확인하기 위해 하한 경계를 사용합니다:

```kotlin
// 프로젝션된 타입은 Array<out CharSequence>입니다.
val array: Array<out CharSequence> = arrayOf("Kotlin")

// get() 읽기 작업은 캡처된 타입의 상한 경계인 CharSequence를 사용합니다.
val item = array.get(0)

// set() 쓰기 작업은 캡처된 타입의 하한 경계인 Nothing을 사용하므로
// 오류가 발생합니다.
array.set(0, "New value")
// 수신 객체 타입 'Array<out CharSequence>'에 out 프로젝션이 포함되어 있어
// 'fun set(index: Int, value: T): Unit'의 사용이 금지됩니다.
```

이 예제에서:

* 변수 `array`는 프로젝션된 타입 `Array<out CharSequence>`를 갖습니다. 컴파일러는 프로젝션된 타입 인자 `out CharSequence`를 상한 경계가 `CharSequence`이고 하한 경계가 `Nothing`인 캡처된 타입으로 표현합니다.
* `get()` 작업의 경우, 컴파일러는 캡처된 타입을 상한 경계인 `CharSequence`로 근사하여 `item`의 타입을 `CharSequence`로 추론합니다.
* `set()` 작업의 경우, 캡처된 타입의 하한 경계는 `Nothing`입니다. `Nothing`은 인스턴스를 가질 수 없으므로 프로젝션된 타입에 값을 쓰는 것은 타입 안전하지 않으며 오류가 발생합니다.

## 제네릭 함수 {id="generic-functions"}

타입 파라미터를 가질 수 있는 선언은 클래스뿐만이 아닙니다. 함수 또한 가질 수 있습니다. 타입 파라미터는 함수 이름 _앞_에 배치됩니다:

```kotlin
fun <T> singletonList(item: T): List<T> {
    // ...
}

fun <T> T.basicToString(): String { // 확장 함수
    // ...
}
```

제네릭 함수를 호출하려면 호출 위치에서 함수 이름 _뒤_에 타입 인자를 지정합니다:

```kotlin
val l = singletonList<Int>(1)
```

문맥에서 추론할 수 있는 경우 타입 인자를 생략할 수 있으므로 다음 예제 역시 올바르게 동작합니다:

```kotlin
val l = singletonList(1)
```

## 제네릭 제약 조건(Generic constraints) {id="generic-constraints"}

주어진 타입 파라미터를 대체할 수 있는 모든 가능한 타입의 집합은 _제네릭 제약 조건_에 의해 제한될 수 있습니다.

### 상한(Upper bounds) {id="upper-bounds"}

가장 흔한 제약 조건 유형은 Java의 `extends` 키워드에 해당하는 _상한(upper bound)_입니다:

```kotlin
fun <T : Comparable<T>> sort(list: List<T>) {  ... }
```

콜론 뒤에 지정된 타입이 _상한_이며, `Comparable<T>`의 하위 타입만 `T`를 대체할 수 있음을 나타냅니다. 예를 들면 다음과 같습니다:

```kotlin
sort(listOf(1, 2, 3)) // 정상. Int는 Comparable<Int>의 하위 타입임
sort(listOf(HashMap<Int, String>())) // 오류: HashMap<Int, String>은 Comparable<HashMap<Int, String>>의 하위 타입이 아님
```

지정되지 않은 경우 기본 상한은 `Any?`입니다. 꺾쇠괄호(`<>`) 안에는 하나의 상한만 지정할 수 있습니다.
동일한 타입 파라미터에 둘 이상의 상한이 필요한 경우에는 별도의 _where_ 절을 사용해야 합니다:

```kotlin
fun <T> copyWhenGreater(list: List<T>, threshold: T): List<String>
    where T : CharSequence,
          T : Comparable<T> {
    return list.filter { it > threshold }.map { it.toString() }
}
```

전달된 타입은 `where` 절의 모든 조건을 동시에 만족해야 합니다. 위의 예제에서 `T` 타입은 `CharSequence`와 `Comparable`을 _모두_ 구현해야 합니다.

## 확실한 non-nullable 타입(Definitely non-nullable types) {id="definitely-non-nullable-types"}

제네릭 Java 클래스 및 인터페이스와의 상호 운용성을 더 쉽게 만들기 위해, Kotlin은 제네릭 타입 파라미터를 **확실한 non-nullable(definitely non-nullable)** 타입으로 선언하는 것을 지원합니다.

제네릭 타입 `T`를 확실한 non-nullable로 선언하려면 `& Any`를 사용하여 선언합니다. 예: `T & Any`.

확실한 non-nullable 타입은 nullable한 [상한](#upper-bounds)을 가져야 합니다.

확실한 non-nullable 타입을 선언하는 가장 일반적인 사용 사례는 매개변수에 `@NotNull`이 포함된 Java 메서드를 오버라이드할 때입니다. 예를 들어 `load()` 메서드를 살펴보겠습니다:

```java
import org.jetbrains.annotations.*;

public interface Game<T> {
    public T save(T x) {}
    @NotNull
    public T load(@NotNull T x) {}
}
```

Kotlin에서 `load()` 메서드를 성공적으로 오버라이드하려면 `T1`을 확실한 non-nullable로 선언해야 합니다:

```kotlin
interface ArcadeGame<T1> : Game<T1> {
    override fun save(x: T1): T1
    // T1은 확실한 non-nullable임
    override fun load(x: T1 & Any): T1 & Any
}
```

Kotlin만으로 작업할 때는 Kotlin의 타입 추론이 이를 자동으로 처리해주므로 확실한 non-nullable 타입을 명시적으로 선언할 필요가 거의 없습니다.

## 타입 소거(Type erasure) {id="type-erasure"}

Kotlin이 제네릭 선언 사용에 대해 수행하는 타입 안전성 검사는 컴파일 시점에 이루어집니다.
런타임에는 제네릭 타입의 인스턴스가 실제 타입 인자에 대한 정보를 전혀 보유하지 않습니다.
이러한 타입 정보를 _소거(erased)_되었다고 합니다. 예를 들어 `Foo<Bar>`와 `Foo<Baz?>`의 인스턴스는 둘 다 단순히 `Foo<*>`로 소거됩니다.

### 제네릭 타입 검사 및 캐스트 {id="generics-type-checks-and-casts"}

타입 소거로 인해 런타임에 제네릭 타입의 인스턴스가 특정 타입 인자로 생성되었는지 확인할 수 있는 일반적인 방법은 없으며, 컴파일러는 `ints is List<Int>`나 `list is T`(타입 파라미터)와 같은 `is` 검사를 금지합니다. 그러나 스타 프로젝션된 타입에 대해서는 인스턴스를 검사할 수 있습니다:

```kotlin
if (something is List<*>) {
    something.forEach { println(it) } // 요소들의 타입은 `Any?`로 취급됨
}
```

마찬가지로 인스턴스의 타입 인자가 정적으로(컴파일 시점에) 이미 확인된 경우, 타입의 비제네릭 부분을 포함하는 `is` 검사나 캐스트를 수행할 수 있습니다. 이 경우 꺾쇠괄호는 생략됩니다:

```kotlin
fun handleStrings(list: MutableList<String>) {
    if (list is ArrayList) {
        // `list`는 `ArrayList<String>`으로 스마트 캐스트됨
    }
}
```

타입 인자를 고려하지 않는 캐스트에도 타입 인자가 생략된 동일한 구문을 사용할 수 있습니다: `list as ArrayList`.

제네릭 함수 호출의 타입 인자 역시 컴파일 시점에만 검사됩니다. 함수 본문 내부에서는 타입 파라미터를 타입 검사에 사용할 수 없으며, 타입 파라미터로의 타입 캐스트(`foo as T`)는 확인되지 않은(unchecked) 상태가 됩니다.
유일한 예외는 각 호출 위치에서 실제 타입 인자가 인라인되는 [실체화된 타입 파라미터(reified type parameters)](inline-functions.md#reified-type-parameters)를 가진 인라인 함수입니다. 이를 통해 타입 파라미터에 대한 타입 검사 및 캐스트가 가능해집니다.
그러나 검사나 캐스트 내부에서 사용되는 제네릭 타입의 인스턴스에 대해서는 앞서 설명한 제한 사항이 여전히 적용됩니다.
예를 들어 `arg is T`라는 타입 검사에서 `arg` 자체가 제네릭 타입의 인스턴스라면 해당 인스턴스의 타입 인자는 여전히 소거됩니다.

```kotlin
//sampleStart
inline fun <reified A, reified B> Pair<*, *>.asPairOf(): Pair<A, B>? {
    if (first !is A || second !is B) return null
    return first as A to second as B
}

val somePair: Pair<Any?, Any?> = "items" to listOf(1, 2, 3)

val stringToSomething = somePair.asPairOf<String, Any>()
val stringToInt = somePair.asPairOf<String, Int>()
val stringToList = somePair.asPairOf<String, List<*>>()
val stringToStringList = somePair.asPairOf<String, List<String>>() // 컴파일은 되지만 타입 안전성이 깨집니다!
// 자세한 내용은 샘플을 펼쳐 확인하세요.

//sampleEnd

fun main() {
    println("stringToSomething = " + stringToSomething)
    println("stringToInt = " + stringToInt)
    println("stringToList = " + stringToList)
    println("stringToStringList = " + stringToStringList)
    //println(stringToStringList?.second?.forEach() {it.length}) // 리스트 요소가 String이 아니므로 ClassCastException이 발생합니다.
}
```
{kotlin-runnable="true"}

### 확인되지 않은 캐스트(Unchecked casts) {id="unchecked-casts"}

`foo as List<String>`과 같이 구체적인 타입 인자를 가진 제네릭 타입으로의 타입 캐스트는 런타임에 검사할 수 없습니다.  
이러한 확인되지 않은 캐스트는 고수준의 프로그램 로직에 의해 타입 안전성이 보장되지만 컴파일러가 이를 직접 추론할 수 없을 때 사용할 수 있습니다. 아래 예제를 참조하세요.

```kotlin
fun readDictionary(file: File): Map<String, *> = file.inputStream().use { 
    TODO("문자열을 임의의 요소에 매핑한 정보를 읽어옵니다.")
}

// 이 파일에 `Int`가 포함된 맵을 저장했습니다.
val intsFile = File("ints.dictionary")

// 경고: Unchecked cast: `Map<String, *>` to `Map<String, Int>`
val intsDictionary: Map<String, Int> = readDictionary(intsFile) as Map<String, Int>
```
마지막 줄의 캐스트에 대해 경고가 나타납니다. 컴파일러는 런타임에 이를 완전히 검사할 수 없으며 맵의 값이 `Int`임을 보장하지 않습니다.

확인되지 않은 캐스트를 피하려면 프로그램 구조를 재설계할 수 있습니다. 위의 예제에서는 다양한 타입에 대해 타입 안전한 구현을 제공하는 `DictionaryReader<T>` 및 `DictionaryWriter<T>` 인터페이스를 사용할 수 있습니다. 적절한 추상화를 도입하여 확인되지 않은 캐스트를 호출 위치에서 구현 세부 사항으로 옮길 수 있습니다. [제네릭 변성](#variance)을 적절히 사용하는 것도 도움이 될 수 있습니다.

제네릭 함수의 경우 [실체화된 타입 파라미터](inline-functions.md#reified-type-parameters)를 사용하면, `arg`의 타입 자체에 소거되는 타입 인자가 *별도로* 있지 않는 한 `arg as T`와 같은 캐스트가 검사됩니다.

확인되지 않은 캐스트 경고는 해당 문장이나 선언에 `@Suppress("UNCHECKED_CAST")`를 [어노테이션](annotations.md)하여 억제할 수 있습니다:

```kotlin
inline fun <reified T> List<*>.asListOfType(): List<T>? =
    if (all { it is T })
        @Suppress("UNCHECKED_CAST")
        this as List<T> else
        null
```

>**JVM 환경에서**: [배열 타입](arrays.md)(`Array<Foo>`)은 요소의 소거된 타입에 대한 정보를 유지하므로 배열 타입으로의 타입 캐스트는 부분적으로 검사됩니다. 요소 타입의 널 가능성 및 실제 타입 인자는 여전히 소거됩니다. 예를 들어 `foo as Array<List<String>?>` 캐스트는 `foo`가 널 가능 여부와 상관없이 임의의 `List<*>`를 담고 있는 배열인 경우 성공합니다.
>
{style="note"}

## 타입 인자를 위한 밑줄 연산자(Underscore operator) {id="underscore-operator-for-type-arguments"}

밑줄 연산자 `_`는 타입 인자에 사용할 수 있습니다. 다른 타입들이 명시적으로 지정되었을 때 인자의 타입을 자동으로 추론하도록 하려면 이를 사용하세요:

```kotlin
abstract class SomeClass<T> {
    abstract fun execute() : T
}

class SomeImplementation : SomeClass<String>() {
    override fun execute(): String = "Test"
}

class OtherImplementation : SomeClass<Int>() {
    override fun execute(): Int = 42
}

object Runner {
    inline fun <reified S: SomeClass<T>, T> run() : T {
        return S::class.java.getDeclaredConstructor().newInstance().execute()
    }
}

fun main() {
    // SomeImplementation이 SomeClass<String>에서 파생되었으므로 T는 String으로 추론됩니다.
    val s = Runner.run<SomeImplementation, _>()
    assert(s == "Test")

    // OtherImplementation이 SomeClass<Int>에서 파생되었으므로 T는 Int로 추론됩니다.
    val n = Runner.run<OtherImplementation, _>()
    assert(n == 42)
}
```