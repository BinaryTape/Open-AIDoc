[//]: # (title: 제네릭: in, out, where)

Kotlin의 클래스는 Java와 마찬가지로 타입 매개변수를 가질 수 있습니다:

```kotlin
class Box<T>(t: T) {
    var value = t
}
```

이러한 클래스의 인스턴스를 생성하려면 타입 인자를 제공하기만 하면 됩니다:

```kotlin
val box: Box<Int> = Box<Int>(1)
```

하지만 생성자 인자 등을 통해 매개변수를 추론할 수 있는 경우 타입 인자를 생략할 수 있습니다:

```kotlin
val box = Box(1) // 1은 Int 타입이므로, 컴파일러는 이것이 Box<Int>임을 추론합니다.
```

## 가변성 (Variance)

Java 타입 시스템에서 가장 까다로운 측면 중 하나는 와일드카드 타입([Java 제네릭 FAQ](http://www.angelikalanger.com/GenericsFAQ/JavaGenericsFAQ.html) 참조)입니다.
Kotlin에는 와일드카드가 없습니다. 대신 Kotlin에는 선언 지점 가변성(declaration-site variance)과 타입 프로젝션(type projections)이 있습니다.

### Java의 가변성과 와일드카드

Java에 왜 이 신비로운 와일드카드가 필요한지 생각해 봅시다. 먼저, Java의 제네릭 타입은 _불변(invariant)_입니다. 즉, `List<String>`은 `List<Object>`의 하위 타입이 _아닙니다_. 만약 `List`가 불변이 아니었다면, 다음 코드가 컴파일은 되지만 런타임에 예외를 발생시켰을 것이므로 Java의 배열보다 나을 것이 없었을 것입니다:

```java
// Java
List<String> strs = new ArrayList<String>();

// Java는 컴파일 시점에 여기서 타입 불일치 오류를 보고합니다.
List<Object> objs = strs;

// 만약 오류가 발생하지 않는다면?
// String 리스트에 Integer를 넣을 수 있게 됩니다.
objs.add(1);

// 그러면 런타임에 Java는 다음과 같은 예외를 던집니다.
// ClassCastException: Integer cannot be cast to String
String s = strs.get(0); 
```

Java는 런타임 안전성을 보장하기 위해 이러한 행위를 금지합니다. 하지만 여기에는 몇 가지 시사점이 있습니다. 예를 들어, `Collection` 인터페이스의 `addAll()` 메서드를 생각해 봅시다. 이 메서드의 시그니처는 무엇일까요? 직관적으로는 다음과 같이 작성할 것입니다:

```java
// Java
interface Collection<E> ... {
    void addAll(Collection<E> items);
}
```

하지만 그렇게 하면 다음과 같은 (완전히 안전한) 작업을 수행할 수 없게 됩니다:

```java
// Java

// addAll의 단순한 선언으로는 다음 코드가 컴파일되지 않습니다:
// Collection<String>은 Collection<Object>의 하위 타입이 아닙니다.
void copyAll(Collection<Object> to, Collection<String> from) {
    to.addAll(from);
}
```

이것이 실제 `addAll()`의 시그니처가 다음과 같은 이유입니다:

```java
// Java
interface Collection<E> ... {
    void addAll(Collection<? extends E> items);
}
```

_와일드카드 타입 인자_ `? extends E`는 이 메서드가 `E` 자체뿐만 아니라 `E`의 _하위 타입_ 객체 컬렉션도 허용함을 나타냅니다. 이는 `items`에서 `E`를 안전하게 _읽을_ 수 있음(이 컬렉션의 요소는 E의 서브클래스 인스턴스임)을 의미하지만, 해당 미지의 `E` 하위 타입에 어떤 객체가 부합하는지 알 수 없으므로 거기에 _쓸 수는 없음_을 의미합니다.
이러한 제한을 대가로 우리는 원하는 동작을 얻습니다: `Collection<String>`은 `Collection<? extends Object>`의 하위 타입이 _됩니다_.
즉, _extends_-바운드(_상위_ 바운드)가 있는 와일드카드는 타입을 _공변(covariant)_으로 만듭니다.

이것이 작동하는 이유를 이해하는 핵심은 매우 간단합니다. 컬렉션에서 아이템을 _꺼내기만_ 한다면, `String` 컬렉션을 사용하여 거기에서 `Object`를 읽는 것은 괜찮습니다. 반대로 컬렉션에 아이템을 _넣기만_ 한다면, `Object` 컬렉션을 가져와서 거기에 `String`을 넣는 것은 괜찮습니다. Java에는 `String` 또는 그 상위 타입을 허용하는 `List<? super String>`이 있습니다.

후자를 _반공변성(contravariance)_이라고 하며, `List<? super String>`에서는 `String`을 인자로 받는 메서드만 호출할 수 있습니다(예: `add(String)` 또는 `set(int, String)`을 호출할 수 있음). 만약 `List<T>`에서 `T`를 반환하는 메서드를 호출하면 `String`이 아니라 `Object`를 얻게 됩니다.

Joshua Bloch는 그의 저서 [Effective Java, 3rd Edition](http://www.oracle.com/technetwork/java/effectivejava-136174.html)에서 이 문제를 잘 설명합니다(아이템 31: "한정적 와일드카드를 사용해 API 유연성을 높이라"). 그는 데이터를 _읽기만 하는_ 객체를 _생성자(Producer)_라고 부르고, 데이터를 _쓰기만 하는_ 객체를 _소비자(Consumer)_라고 부릅니다. 그리고 다음과 같이 권장합니다:

>"유연성을 극대화하려면 원소의 생산자나 소비자 역할을 하는 입력 매개변수에 와일드카드 타입을 사용하라."

그는 다음과 같은 암기법을 제안합니다: _PECS_는 _Producer-Extends, Consumer-Super_의 약자입니다.

> 만약 `List<? extends Foo>`와 같은 생산자 객체를 사용한다면, 이 객체에서 `add()`나 `set()`을 호출할 수 없지만, 이것이 해당 객체가 _불변(immutable)_임을 의미하지는 않습니다. 예를 들어, `clear()`는 매개변수를 전혀 받지 않으므로 리스트에서 모든 아이템을 제거하기 위해 `clear()`를 호출하는 것을 막을 방법은 없습니다.
>
> 와일드카드(또는 다른 유형의 가변성)가 보장하는 유일한 것은 _타입 안전성_입니다. 불변성은 완전히 다른 이야기입니다.
>
{style="note"}

### 선언 지점 가변성 (Declaration-site variance)

`T`를 매개변수로 받는 메서드는 없고 `T`를 반환하는 메서드만 있는 제네릭 인터페이스 `Source<T>`가 있다고 가정해 봅시다:

```java
// Java
interface Source<T> {
    T nextT();
}
```

이 경우 `Source<String>` 인스턴스의 참조를 `Source<Object>` 타입의 변수에 저장하는 것은 매우 안전할 것입니다. 호출할 소비자 메서드가 없기 때문입니다. 하지만 Java는 이를 알지 못하며 여전히 금지합니다:

```java
// Java
void demo(Source<String> strs) {
    Source<Object> objects = strs; // !!! Java에서는 허용되지 않음
    // ...
}
```

이를 해결하려면 `Source<? extends Object>` 타입의 객체를 선언해야 합니다. 이렇게 하는 것은 의미가 없습니다. 왜냐하면 이전과 동일한 메서드들을 모두 호출할 수 있으므로 더 복잡한 타입에 의해 추가되는 가치가 없기 때문입니다. 하지만 컴파일러는 이를 알지 못합니다.

Kotlin에서는 컴파일러에게 이런 종류의 상황을 설명하는 방법이 있습니다. 이를 _선언 지점 가변성(declaration-site variance)_이라고 합니다. `Source`의 _타입 매개변수_ `T`에 어노테이션을 달아 `Source<T>`의 멤버에서 오직 _반환_(생성)만 되고 소비되지 않음을 보장할 수 있습니다.
이를 위해 `out` 변경자를 사용합니다:

```kotlin
interface Source<out T> {
    fun nextT(): T
}

fun demo(strs: Source<String>) {
    val objects: Source<Any> = strs // T가 out 매개변수이므로 OK
    // ...
}
```

일반적인 규칙은 다음과 같습니다: 클래스 `C`의 타입 매개변수 `T`가 `out`으로 선언되면, 이는 `C`의 멤버에서 오직 _out_-위치에만 올 수 있으며, 그 대가로 `C<Base>`는 안전하게 `C<Derived>`의 상위 타입이 될 수 있습니다.

즉, 클래스 `C`가 매개변수 `T`에 대해 _공변(covariant)_한다거나, `T`가 _공변_ 타입 매개변수라고 말할 수 있습니다. `C`를 `T`의 _소비자_가 아니라 `T`의 _생성자_라고 생각하면 됩니다.

`out` 변경자를 _가변성 어노테이션(variance annotation)_이라고 부르며, 타입 매개변수 선언 지점에 제공되므로 _선언 지점 가변성_을 제공합니다.
이는 타입 사용 시의 와일드카드가 타입을 공변으로 만드는 Java의 _사용 지점 가변성(use-site variance)_과 대조됩니다.

`out` 외에도 Kotlin은 보완적인 가변성 어노테이션인 `in`을 제공합니다. 이는 타입 매개변수를 _반공변(contravariant)_으로 만듭니다. 즉, 소비만 될 수 있고 절대 생성될 수 없음을 의미합니다. 반공변 타입의 좋은 예는 `Comparable`입니다:

```kotlin
interface Comparable<in T> {
    operator fun compareTo(other: T): Int
}

fun demo(x: Comparable<Number>) {
    x.compareTo(1.0) // 1.0은 Double 타입이며, 이는 Number의 하위 타입입니다.
    // 따라서 x를 Comparable<Double> 타입의 변수에 할당할 수 있습니다.
    val y: Comparable<Double> = x // OK!
}
```

_in_과 _out_이라는 단어는 자명해 보이며(이미 C#에서 오랫동안 성공적으로 사용되어 왔습니다), 따라서 위에서 언급한 암기법은 실제로는 필요하지 않습니다. 사실 이를 더 높은 추상화 수준에서 재구성할 수 있습니다:

**[존재론적(Existential)](https://en.wikipedia.org/wiki/Existentialism) 변환: Consumer는 in, Producer는 out!** :-)

## 타입 프로젝션 (Type projections)

### 사용 지점 가변성: 타입 프로젝션

타입 매개변수 `T`를 `out`으로 선언하고 사용 지점에서 하위 타입 지정과 관련된 문제를 피하는 것은 매우 쉽지만, 어떤 클래스들은 실제로 `T`를 반환하는 것으로만 제한될 수 _없습니다_!
대표적인 예가 `Array`입니다:

```kotlin
class Array<T>(val size: Int) {
    operator fun get(index: Int): T { ... }
    operator fun set(index: Int, value: T) { ... }
}
```

이 클래스는 `T`에 대해 공변일 수도, 반공변일 수도 없습니다. 그리고 이는 특정 유연성을 제한합니다. 다음 함수를 고려해 보세요:

```kotlin
fun copy(from: Array<Any>, to: Array<Any>) {
    assert(from.size == to.size)
    for (i in from.indices)
        to[i] = from[i]
}
```

이 함수는 한 배열에서 다른 배열로 아이템을 복사하기 위한 것입니다. 실제로 적용해 봅시다:

```kotlin
val ints: `Array<Int>` = arrayOf(1, 2, 3)
val any = Array<Any>(3) { "" } 
copy(ints, any)
//   ^ 타입은 Array<Int>이지만 Array<Any>를 기대했습니다.
```

여기서 동일하고 익숙한 문제에 부딪힙니다: `Array<T>`는 `T`에 대해 _불변_이므로, `Array<Int>`와 `Array<Any>` 중 어느 것도 상대의 하위 타입이 아닙니다. 왜 그럴까요? 다시 말하지만, `copy`가 예기치 않은 동작을 할 수 있기 때문입니다. 예를 들어, `from`에 `String`을 쓰려고 시도할 수 있고, 만약 실제로 `Int` 배열을 전달했다면 나중에 `ClassCastException`이 발생할 것입니다.

`copy` 함수가 `from`에 _쓰는_ 것을 방지하려면 다음과 같이 할 수 있습니다:

```kotlin
fun copy(from: Array<out Any>, to: Array<Any>) { ... }
```

이것이 _타입 프로젝션(type projection)_입니다. 이는 `from`이 단순한 배열이 아니라 제약이 있는(_프로젝션된_) 배열임을 의미합니다. 타입 매개변수 `T`를 반환하는 메서드만 호출할 수 있으며, 이 경우에는 `get()`만 호출할 수 있음을 의미합니다. 이것이 _사용 지점 가변성_에 대한 Kotlin의 접근 방식이며, Java의 `Array<? extends Object>`에 대응하면서도 약간 더 단순합니다.

`in`을 사용하여 타입을 프로젝션할 수도 있습니다:

```kotlin
fun fill(dest: Array<in String>, value: String) { ... }
```

`Array<in String>`은 Java의 `Array<? super String>`에 대응합니다. 즉, `fill()` 함수에 `String` 배열, `CharSequence` 배열 또는 `Object` 배열을 전달할 수 있음을 의미합니다.

### 스타 프로젝션 (Star-projections)

때로는 타입 인자에 대해 전혀 모르는 상태에서 안전한 방식으로 사용하고 싶을 때가 있습니다. 여기서 안전한 방식이란 제네릭 타입의 프로젝션을 정의하여, 해당 제네릭 타입의 모든 구체적인 인스턴스화가 해당 프로젝션의 하위 타입이 되도록 하는 것입니다.

Kotlin은 이를 위해 소위 _스타 프로젝션(star-projection)_ 구문을 제공합니다:

- `Foo<out T : TUpper>`에서 `T`가 상위 바운드 `TUpper`를 가진 공변 타입 매개변수인 경우, `Foo<*>`는 `Foo<out TUpper>`와 동일합니다. 이는 `T`를 모를 때 `Foo<*>`에서 `TUpper` 값을 안전하게 _읽을_ 수 있음을 의미합니다.
- `Foo<in T>`에서 `T`가 반공변 타입 매개변수인 경우, `Foo<*>`는 `Foo<in Nothing>`과 동일합니다. 이는 `T`를 모를 때 `Foo<*>`에 안전하게 _쓸_ 수 있는 것이 없음을 의미합니다.
- `Foo<T : TUpper>`에서 `T`가 상위 바운드 `TUpper`를 가진 불변 타입 매개변수인 경우, `Foo<*>`는 값을 읽을 때는 `Foo<out TUpper>`와 동일하고 값을 쓸 때는 `Foo<in Nothing>`과 동일합니다.

제네릭 타입에 여러 타입 매개변수가 있는 경우 각각을 독립적으로 프로젝션할 수 있습니다.
예를 들어, 타입이 `interface Function<in T, out U>`로 선언되었다면 다음과 같은 스타 프로젝션을 사용할 수 있습니다:

* `Function<*, String>`은 `Function<in Nothing, String>`을 의미합니다.
* `Function<Int, *>`은 `Function<Int, out Any?>`를 의미합니다.
* `Function<*, *>`은 `Function<in Nothing, out Any?>`를 의미합니다.

> 스타 프로젝션은 Java의 로우 타입(raw types)과 매우 유사하지만 안전합니다.
>
{style="note"}

## 제네릭 함수

클래스만이 타입 매개변수를 가질 수 있는 선언은 아닙니다. 함수도 가질 수 있습니다. 타입 매개변수는 함수 이름 _앞_에 위치합니다:

```kotlin
fun <T> singletonList(item: T): `List<T>` {
    // ...
}

fun <T> T.basicToString(): String { // 확장 함수
    // ...
}
```

제네릭 함수를 호출하려면 호출 지점에서 함수 이름 _뒤_에 타입 인자를 지정합니다:

```kotlin
val l = singletonList<Int>(1)
```

타입 인자가 문맥에서 추론될 수 있다면 생략할 수 있으므로, 다음 예제도 작동합니다:

```kotlin
val l = singletonList(1)
```

## 제네릭 제약 (Generic constraints)

주어진 타입 매개변수에 대입될 수 있는 모든 가능한 타입의 집합은 _제네릭 제약_에 의해 제한될 수 있습니다.

### 상위 바운드 (Upper bounds)

가장 일반적인 제약 유형은 Java의 `extends` 키워드에 해당하는 _상위 바운드(upper bound)_입니다:

```kotlin
fun <T : Comparable<T>> sort(list: List<T>) {  ... }
```

콜론 뒤에 지정된 타입이 _상위 바운드_이며, `Comparable<T>`의 하위 타입만 `T`에 대입될 수 있음을 나타냅니다. 예를 들어:

```kotlin
sort(listOf(1, 2, 3)) // OK. Int는 Comparable<Int>의 하위 타입입니다.
sort(listOf(HashMap<Int, String>())) // 오류: HashMap<Int, String>은 Comparable<HashMap<Int, String>>의 하위 타입이 아닙니다.
```

기본 상위 바운드(지정되지 않은 경우)는 `Any?`입니다. 꺾쇠괄호 안에는 하나의 상위 바운드만 지정할 수 있습니다.
동일한 타입 매개변수에 둘 이상의 상위 바운드가 필요한 경우 별도의 _where_ 절이 필요합니다:

```kotlin
fun <T> copyWhenGreater(list: List<T>, threshold: T): List<String>
    where T : CharSequence,
          T : Comparable<T> {
    return list.filter { it > threshold }.map { it.toString() }
}
```

전달된 타입은 `where` 절의 모든 조건을 동시에 만족해야 합니다. 위 예제에서 `T` 타입은 `CharSequence`와 `Comparable`을 _모두_ 구현해야 합니다.

## 확정적 비 null 타입 (Definitely non-nullable types)

제네릭 Java 클래스 및 인터페이스와의 상호운용성을 쉽게 하기 위해, Kotlin은 제네릭 타입 매개변수를 **확정적 비 null(definitely non-nullable)**로 선언하는 것을 지원합니다.

제네릭 타입 `T`를 확정적 비 null로 선언하려면 타입을 `& Any`와 함께 선언하십시오. 예: `T & Any`.

확정적 비 null 타입은 nullable한 [상위 바운드](#upper-bounds)를 가져야 합니다.

확정적 비 null 타입을 선언하는 가장 일반적인 사례는 인자에 `@NotNull`이 포함된 Java 메서드를 오버라이드하려는 경우입니다. 예를 들어, `load()` 메서드를 생각해 보세요:

```java
import org.jetbrains.annotations.*;

public interface Game<T> {
    public T save(T x) {}
    @NotNull
    public T load(@NotNull T x) {}
}
```

Kotlin에서 `load()` 메서드를 성공적으로 오버라이드하려면 `T1`을 확정적 비 null로 선언해야 합니다:

```kotlin
interface ArcadeGame<T1> : Game<T1> {
    override fun save(x: T1): T1
    // T1은 확정적 비 null입니다.
    override fun load(x: T1 & Any): T1 & Any
}
```

Kotlin만 사용하는 경우에는 Kotlin의 타입 추론이 이를 자동으로 처리해주므로 확정적 비 null 타입을 명시적으로 선언할 일이 거의 없습니다.

## 타입 소거 (Type erasure)

Kotlin이 제네릭 선언 사용에 대해 수행하는 타입 안전성 검사는 컴파일 시점에 이루어집니다.
런타임에 제네릭 타입의 인스턴스는 실제 타입 인자에 대한 정보를 보유하지 않습니다.
타입 정보가 _소거(erased)_되었다고 말합니다. 예를 들어, `Foo<Bar>`와 `Foo<Baz?>`의 인스턴스는 단순히 `Foo<*>`로 소거됩니다.

### 제네릭 타입 검사 및 캐스트

타입 소거로 인해 런타임에 제네릭 타입의 인스턴스가 특정 타입 인자로 생성되었는지 확인하는 일반적인 방법은 없으며, 컴파일러는 `ints is List<Int>` 또는 `list is T`(타입 매개변수)와 같은 `is` 검사를 금지합니다. 그러나 스타 프로젝션된 타입에 대해서는 인스턴스를 검사할 수 있습니다:

```kotlin
if (something is List<*>) {
    something.forEach { println(it) } // 아이템은 `Any?` 타입으로 취급됩니다.
}
```

마찬가지로, 인스턴스의 타입 인자가 이미 정적으로(컴파일 시점에) 확인된 경우, 타입의 제네릭이 아닌 부분을 포함하는 `is` 검사나 캐스트를 할 수 있습니다. 이 경우 꺾쇠괄호는 생략됩니다:

```kotlin
fun handleStrings(list: MutableList<String>) {
    if (list is ArrayList) {
        // `list`는 `ArrayList<String>`으로 스마트 캐스트됩니다.
    }
}
```

타입 인자를 고려하지 않는 캐스트의 경우 타입 인자가 생략된 동일한 구문을 사용할 수 있습니다: `list as ArrayList`.

제네릭 함수 호출의 타입 인자 또한 컴파일 시점에만 확인됩니다. 함수 본문 내부에서 타입 매개변수는 타입 검사에 사용할 수 없으며, 타입 매개변수로의 타입 캐스트(`foo as T`)는 검사되지 않습니다(unchecked).
유일한 예외는 [구체화된 타입 매개변수(reified type parameters)](inline-functions.md#reified-type-parameters)를 가진 인라인 함수로, 각 호출 지점에서 실제 타입 인자가 인라인됩니다. 이를 통해 타입 매개변수에 대한 타입 검사와 캐스트가 가능해집니다.
그러나 검사나 캐스트 내부에 사용된 제네릭 타입 인스턴스에 대해서는 위에서 설명한 제한 사항이 여전히 적용됩니다.
예를 들어, 타입 검사 `arg is T`에서 `arg` 자체가 제네릭 타입의 인스턴스라면, 해당 타입 인자는 여전히 소거된 상태입니다.

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
val stringToStringList = somePair.asPairOf<String, List<String>>() // 컴파일은 되지만 타입 안전성을 해칩니다!
// 자세한 내용은 샘플을 확장하여 확인하세요.

//sampleEnd

fun main() {
    println("stringToSomething = " + stringToSomething)
    println("stringToInt = " + stringToInt)
    println("stringToList = " + stringToList)
    println("stringToStringList = " + stringToStringList)
    //println(stringToStringList?.second?.forEach() {it.length}) // 리스트 아이템이 String이 아니므로 ClassCastException이 발생합니다.
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### 검사되지 않은 캐스트 (Unchecked casts)

`foo as List<String>`과 같이 구체적인 타입 인자가 있는 제네릭 타입으로의 타입 캐스트는 런타임에 검사할 수 없습니다.
이러한 검사되지 않은 캐스트는 상위 수준의 프로그램 로직에 의해 타입 안전성이 함축되어 있지만 컴파일러가 직접 추론할 수 없을 때 사용될 수 있습니다. 아래 예제를 참조하세요.

```kotlin
fun readDictionary(file: File): Map<String, *> = file.inputStream().use { 
    TODO("문자열을 임의의 요소로 매핑하는 정보를 읽습니다.")
}

// 이 파일에 `Int`가 담긴 맵을 저장했다고 가정합시다.
val intsFile = File("ints.dictionary")

// 경고: Unchecked cast: `Map<String, *>` to `Map<String, Int>`
val intsDictionary: Map<String, Int> = readDictionary(intsFile) as Map<String, Int>
```
마지막 줄의 캐스트에 대해 경고가 나타납니다. 컴파일러는 런타임에 이를 완전히 검사할 수 없으며 맵의 값이 `Int`임을 보장하지 않습니다.

검사되지 않은 캐스트를 피하려면 프로그램 구조를 재설계할 수 있습니다. 위의 예제에서는 다양한 타입에 대해 타입 안전한 구현을 제공하는 `DictionaryReader<T>`와 `DictionaryWriter<T>` 인터페이스를 사용할 수 있습니다. 호출 지점에서 구현 세부 사항으로 검사되지 않은 캐스트를 이동시키기 위해 적절한 추상화를 도입할 수 있습니다. [제네릭 가변성](#variance)을 적절히 사용하는 것도 도움이 될 수 있습니다.

제네릭 함수의 경우, [구체화된 타입 매개변수](inline-functions.md#reified-type-parameters)를 사용하면 `arg as T`와 같은 캐스트를 검사할 수 있게 됩니다. 단, `arg`의 타입 자체가 소거되는 *자신의* 타입 인자를 가지고 있는 경우는 제외됩니다.

검사되지 않은 캐스트 경고는 해당 문장이나 선언에 `@Suppress("UNCHECKED_CAST")` [어노테이션](annotations.md)을 달아 억제할 수 있습니다:

```kotlin
inline fun <reified T> List<*>.asListOfType(): List<T>? =
    if (all { it is T })
        @Suppress("UNCHECKED_CAST")
        this as `List<T>` else
        null
```

>**JVM 환경에서**: [배열 타입](arrays.md)(`Array<Foo>`)은 요소의 소거된 타입에 대한 정보를 유지하며, 배열 타입으로의 타입 캐스트는 부분적으로 검사됩니다. 즉, 요소 타입의 null 가능성 및 실제 타입 인자는 여전히 소거됩니다. 예를 들어, `foo as Array<List<String>?>` 캐스트는 `foo`가 null 가능 여부와 상관없이 임의의 `List<*>`를 담고 있는 배열인 경우 성공합니다.
>
{style="note"}

## 타입 인자를 위한 언더스코어 연산자

타입 인자에 언더스코어 연산자 `_`를 사용할 수 있습니다. 다른 타입들이 명시적으로 지정되었을 때 인자의 타입을 자동으로 추론하도록 하려면 이를 사용하세요:

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