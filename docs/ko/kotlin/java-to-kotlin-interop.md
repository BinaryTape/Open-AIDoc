[//]: # (title: Java에서 Kotlin 호출하기)

Kotlin 코드는 Java에서 쉽게 호출할 수 있습니다.
예를 들어, Kotlin 클래스의 인스턴스를 Java 메서드에서 원활하게 생성하고 조작할 수 있습니다.
하지만 Kotlin 코드를 Java에 통합할 때 주의해야 할 Java와 Kotlin 간의 몇 가지 차이점이 있습니다.
이 페이지에서는 Kotlin 코드를 Java 클라이언트에 맞게 조정하는 방법을 설명합니다.

## 프로퍼티 (Properties)

Kotlin 프로퍼티는 다음과 같은 Java 요소로 컴파일됩니다:

 * `get` 접두사를 붙여 이름이 생성된 getter 메서드.
 * `set` 접두사를 붙여 이름이 생성된 setter 메서드 (`var` 프로퍼티의 경우에만 해당).
 * 프로퍼티 이름과 동일한 이름의 private 필드 (백킹 필드가 있는 프로퍼티의 경우에만 해당).

예를 들어, `var firstName: String`은 다음과 같은 Java 선언으로 컴파일됩니다:

```java
private String firstName;

public String getFirstName() {
    return firstName;
}

public void setFirstName(String firstName) {
    this.firstName = firstName;
}
```

프로퍼티 이름이 `is`로 시작하는 경우 다른 이름 매핑 규칙이 사용됩니다. getter의 이름은 프로퍼티 이름과 동일하며, setter의 이름은 `is`를 `set`으로 대체하여 얻습니다.
예를 들어, `isOpen` 프로퍼티의 경우 getter는 `isOpen()`이고 setter는 `setOpen()`이 됩니다.
이 규칙은 `Boolean`뿐만 아니라 모든 타입의 프로퍼티에 적용됩니다.

## 패키지 수준 함수 (Package-level functions)

패키지 `org.example` 내의 `app.kt` 파일에 선언된 확장 함수를 포함한 모든 함수와 프로퍼티는 `org.example.AppKt`라는 이름의 Java 클래스의 정적 메서드로 컴파일됩니다.

```kotlin
// app.kt
package org.example

class Util

fun getTime() { /*...*/ }

```

```java
// Java
new org.example.Util();
org.example.AppKt.getTime();
```

생성된 Java 클래스에 커스텀 이름을 설정하려면 `@JvmName` 어노테이션을 사용하세요:

```kotlin
@file:JvmName("DemoUtils")

package org.example

class Util

fun getTime() { /*...*/ }

```

```java
// Java
new org.example.Util();
org.example.DemoUtils.getTime();
```

생성된 Java 클래스 이름이 동일한(패키지가 같고 이름이 같거나 동일한 [`@JvmName`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.jvm/-jvm-name/index.html) 어노테이션을 가진) 파일이 여러 개 있는 경우 보통 오류가 발생합니다.
그러나 컴파일러는 지정된 이름을 가지며 해당 이름을 가진 모든 파일의 선언을 포함하는 단일 Java 퍼사드(facade) 클래스를 생성할 수 있습니다.
이러한 퍼사드 생성을 활성화하려면 해당 파일 모두에 [`@JvmMultifileClass`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.jvm/-jvm-multifile-class/index.html) 어노테이션을 사용하세요.

```kotlin
// oldutils.kt
@file:JvmName("Utils")
@file:JvmMultifileClass

package org.example

fun getTime() { /*...*/ }
```

```kotlin
// newutils.kt
@file:JvmName("Utils")
@file:JvmMultifileClass

package org.example

fun getDate() { /*...*/ }
```

```java
// Java
org.example.Utils.getTime();
org.example.Utils.getDate();
```

## 인스턴스 필드 (Instance fields)

Kotlin 프로퍼티를 Java의 필드로 노출해야 하는 경우, [`@JvmField`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.jvm/-jvm-field/index.html) 어노테이션을 붙이세요.
필드는 기본 프로퍼티와 동일한 가시성을 갖습니다. 다음 조건에 해당하면 프로퍼티에 `@JvmField`를 붙일 수 있습니다:
* 백킹 필드(backing field)가 있음
* private이 아님
* `open`, `override` 또는 `const` 제어자가 없음
* 위임된 프로퍼티(delegated property)가 아님

```kotlin
class User(id: String) {
    @JvmField val ID = id
}
```

```java

// Java
class JavaClient {
    public String getID(User user) {
        return user.ID;
    }
}
```

[지연 초기화(Late-Initialized)](properties.md#late-initialized-properties-and-variables) 프로퍼티 또한 필드로 노출됩니다.
필드의 가시성은 `lateinit` 프로퍼티 setter의 가시성과 동일합니다.

## 정적 필드 (Static fields)

이름이 있는 객체(named object) 또는 컴패니언 객체(companion object)에 선언된 Kotlin 프로퍼티는 해당 객체 또는 컴패니언 객체를 포함하는 클래스에 정적 백킹 필드를 갖습니다.

보통 이러한 필드는 private이지만, 다음 방법 중 하나로 노출될 수 있습니다:

 - [`@JvmField`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.jvm/-jvm-field/index.html) 어노테이션
 - `lateinit` 제어자
 - `const` 제어자
 
이러한 프로퍼티에 `@JvmField` 어노테이션을 붙이면 프로퍼티 자체와 동일한 가시성을 가진 정적 필드가 됩니다.

```kotlin
class Key(val value: Int) {
    companion object {
        @JvmField
        val COMPARATOR: Comparator<Key> = compareBy<Key> { it.value }
    }
}
```

```java
// Java
Key.COMPARATOR.compare(key1, key2);
// Key 클래스의 public static final 필드
```

객체 또는 컴패니언 객체의 [지연 초기화](properties.md#late-initialized-properties-and-variables) 프로퍼티는 프로퍼티 setter와 동일한 가시성을 가진 정적 백킹 필드를 갖습니다.

```kotlin
object Singleton {
    lateinit var provider: Provider
}
```

```java

// Java
Singleton.provider = new Provider();
// Singleton 클래스의 public static non-final 필드
```

`const`로 선언된 프로퍼티(최상위 수준 및 클래스 내 선언 모두)는 Java에서 정적 필드로 변환됩니다:

```kotlin
// file example.kt

object Obj {
    const val CONST = 1
}

class C {
    companion object {
        const val VERSION = 9
    }
}

const val MAX = 239
```

Java에서:

```java

int constant = Obj.CONST;
int max = ExampleKt.MAX;
int version = C.VERSION;
```

## 정적 메서드 (Static methods)

위에서 언급했듯이, Kotlin은 패키지 수준 함수를 정적 메서드로 표현합니다.
또한 Kotlin은 이름이 있는 객체 또는 컴패니언 객체에 정의된 함수에 [`@JvmStatic`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.jvm/-jvm-static/index.html) 어노테이션을 붙이면 정적 메서드를 생성할 수 있습니다.
이 어노테이션을 사용하면 컴파일러는 객체의 외부 클래스에 정적 메서드를 생성하고 객체 자체에도 인스턴스 메서드를 생성합니다. 예를 들어:

```kotlin
class C {
    companion object {
        @JvmStatic fun callStatic() {}
        fun callNonStatic() {}
    }
}
```

이제 Java에서 `callStatic()`은 정적 메서드이지만 `callNonStatic()`은 그렇지 않습니다:

```java

C.callStatic(); // 잘 작동함
C.callNonStatic(); // 오류: 정적 메서드가 아님
C.Companion.callStatic(); // 인스턴스 메서드가 남아 있음
C.Companion.callNonStatic(); // 유일하게 작동하는 방식
```

이름이 있는 객체의 경우도 비슷합니다:

```kotlin
object Obj {
    @JvmStatic fun callStatic() {}
    fun callNonStatic() {}
}
```

Java에서:

```java

Obj.callStatic(); // 잘 작동함
Obj.callNonStatic(); // 오류
Obj.INSTANCE.callNonStatic(); // 작동함, 싱글톤 인스턴스를 통한 호출
Obj.INSTANCE.callStatic(); // 이것도 작동함
```

Kotlin 1.3부터 `@JvmStatic`은 인터페이스의 컴패니언 객체에 정의된 함수에도 적용됩니다.
이러한 함수는 인터페이스의 정적 메서드로 컴파일됩니다. 인터페이스의 정적 메서드는 Java 1.8에서 도입되었으므로 해당 타겟을 사용해야 합니다.

```kotlin
interface ChatBot {
    companion object {
        @JvmStatic fun greet(username: String) {
            println("Hello, $username")
        }
    }
}
```

`@JvmStatic` 어노테이션을 객체나 컴패니언 객체의 프로퍼티에도 적용할 수 있으며, 이 경우 getter와 setter 메서드가 해당 객체 또는 컴패니언 객체를 포함하는 클래스의 정적 멤버가 됩니다.

## 인터페이스의 디폴트 메서드 (Default methods in interfaces)

JVM을 타겟으로 할 때, Kotlin은 [별도로 구성](#compatibility-modes-for-default-methods)하지 않는 한 인터페이스에 선언된 함수를 [디폴트 메서드(default methods)](https://docs.oracle.com/javase/tutorial/java/IandI/defaultmethods.html)로 컴파일합니다.
이것은 Java 클래스가 재구현 없이 직접 상속받을 수 있는 인터페이스 내의 구체적인 메서드입니다.

다음은 디폴트 메서드가 있는 Kotlin 인터페이스의 예입니다:

```kotlin
interface Robot {
    fun move() { println("~walking~") }  // Java 인터페이스에서 default 메서드가 됨
    fun speak(): Unit
}
```

인터페이스를 구현하는 Java 클래스에서 디폴트 구현을 사용할 수 있습니다.

```java
// Java 구현
public class C3PO implements Robot {
    // Robot의 move() 구현을 암시적으로 사용할 수 있음
    @Override
    public void speak() {
        System.out.println("I beg your pardon, sir");
    }
}
```

```java
C3PO c3po = new C3PO();
c3po.move(); // Robot 인터페이스의 디폴트 구현
c3po.speak();
```

인터페이스의 구현체는 디폴트 메서드를 오버라이드할 수 있습니다.

```java
// Java
public class BB8 implements Robot {
    // 디폴트 메서드의 자체 구현
    @Override
    public void move() {
        System.out.println("~rolling~");
    }

    @Override
    public void speak() {
        System.out.println("Beep-beep");
    }
}
```

### 디폴트 메서드 호환성 모드

Kotlin은 인터페이스의 함수가 JVM 디폴트 메서드로 컴파일되는 방식을 제어하기 위해 세 가지 모드를 제공합니다.
이러한 모드는 컴파일러가 호환성 브리지 및 `DefaultImpls` 클래스에 정적 메서드를 생성할지 여부를 결정합니다.

`-jvm-default` 컴파일러 옵션을 사용하여 이 동작을 제어할 수 있습니다:

> `-jvm-default` 컴파일러 옵션은 지원 중단된 `-Xjvm-default` 옵션을 대체합니다.
>
{style="note"}

호환성 모드에 대해 자세히 알아보기:

#### enable {initial-collapse-state="collapsed" collapsible="true"}

기본 동작입니다.
인터페이스에 디폴트 구현을 생성하고 호환성 브리지 및 `DefaultImpls` 클래스를 포함합니다.
이 모드는 이전에 컴파일된 Kotlin 코드와의 호환성을 유지합니다.

#### no-compatibility {initial-collapse-state="collapsed" collapsible="true"}

인터페이스에 디폴트 구현만 생성합니다.
호환성 브리지 및 `DefaultImpls` 클래스를 건너뜁니다.
`DefaultImpls` 클래스에 의존하는 코드와 상호 작용하지 않는 새로운 코드베이스에 이 모드를 사용하세요.
이 모드는 이전 Kotlin 코드와의 바이너리 호환성을 깨뜨릴 수 있습니다.

> 인터페이스 위임(interface delegation)이 사용되면 모든 인터페이스 메서드가 위임됩니다.
>
{style="note"}

#### disable {initial-collapse-state="collapsed" collapsible="true"}

인터페이스의 디폴트 구현을 비활성화합니다.
호환성 브리지 및 `DefaultImpls` 클래스만 생성됩니다.

## 가시성 (Visibility)

Kotlin 가시성 제어자는 다음과 같은 방식으로 Java에 매핑됩니다:

* `private` 멤버는 `private` 멤버로 컴파일됩니다.
* `private` 최상위 선언은 `private` 최상위 선언으로 컴파일됩니다. 클래스 내부에서 접근하는 경우 패키지-프라이빗 접근자(accessor)도 포함됩니다.
* `protected`는 `protected`로 유지됩니다. (Java는 동일한 패키지의 다른 클래스에서 protected 멤버에 접근하는 것을 허용하지만 Kotlin은 그렇지 않으므로, Java 클래스가 코드에 대해 더 넓은 접근 권한을 갖게 됩니다.)
* `internal` 선언은 Java에서 `public`이 됩니다. `internal` 클래스의 멤버는 Java에서 실수로 사용하는 것을 방지하고, Kotlin 규칙에 따라 서로를 볼 수 없는 동일한 시그니처를 가진 멤버들에 대해 오버로딩을 허용하기 위해 이름 맹글링(name mangling)을 거칩니다.
* `public`은 `public`으로 유지됩니다.

## KClass

가끔 `KClass` 타입의 파라미터를 가진 Kotlin 메서드를 호출해야 할 때가 있습니다.
`Class`에서 `KClass`로의 자동 변환은 없으므로, `Class<T>.kotlin` 확장 프로퍼티에 상응하는 다음 코드를 호출하여 수동으로 수행해야 합니다:

```kotlin
kotlin.jvm.JvmClassMappingKt.getKotlinClass(MainView.class)
```

## @JvmName으로 시그니처 충돌 처리하기

가끔 Kotlin에 이름이 있는 함수가 있는데, 바이트코드에서 다른 JVM 이름이 필요한 경우가 있습니다.
가장 대표적인 예는 *타입 소거(type erasure)* 때문에 발생합니다:

```kotlin
fun List<String>.filterValid(): List<String>
fun List<Int>.filterValid(): List<Int>
```

이 두 함수는 JVM 시그니처가 `filterValid(Ljava/util/List;)Ljava/util/List;`로 동일하기 때문에 나란히 정의될 수 없습니다.
Kotlin에서 정말로 동일한 이름을 갖기를 원한다면, 그중 하나(또는 둘 다)에 [`@JvmName`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.jvm/-jvm-name/index.html) 어노테이션을 붙이고 인자로 다른 이름을 지정할 수 있습니다:

```kotlin
fun List<String>.filterValid(): List<String>

@JvmName("filterValidInt")
fun List<Int>.filterValid(): List<Int>
```

Kotlin에서는 동일한 이름 `filterValid`로 접근할 수 있지만, Java에서는 `filterValid`와 `filterValidInt`가 됩니다.

동일한 트릭이 프로퍼티 `x`와 함수 `getX()`를 함께 가져야 할 때도 적용됩니다:

```kotlin
val x: Int
    @JvmName("getX_prop")
    get() = 15

fun getX() = 10
```

명시적으로 구현된 getter와 setter가 없는 프로퍼티에 대해 생성된 접근자 메서드의 이름을 변경하려면 `@get:JvmName` 및 `@set:JvmName`을 사용할 수 있습니다:

```kotlin
@get:JvmName("x")
@set:JvmName("changeX")
var x: Int = 23
```

## 오버로드 생성 (Overloads generation)

일반적으로 디폴트 파라미터 값을 가진 Kotlin 함수를 작성하면, Java에서는 모든 파라미터가 존재하는 전체 시그니처로만 보입니다. Java 호출자에게 여러 오버로드를 노출하고 싶다면 [`@JvmOverloads`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.jvm/-jvm-overloads/index.html) 어노테이션을 사용할 수 있습니다.

이 어노테이션은 생성자, 정적 메서드 등에도 작동합니다. 인터페이스에 정의된 메서드를 포함하여 추상 메서드에는 사용할 수 없습니다.

```kotlin
class Circle @JvmOverloads constructor(centerX: Int, centerY: Int, radius: Double = 1.0) {
    @JvmOverloads fun draw(label: String, lineWidth: Int = 1, color: String = "red") { /*...*/ }
}
```

디폴트 값이 있는 모든 파라미터에 대해, 해당 파라미터와 파라미터 리스트의 오른쪽에 있는 모든 파라미터가 제거된 추가 오버로드가 하나씩 생성됩니다. 이 예제에서는 다음과 같이 생성됩니다:

```java
// 생성자:
Circle(int centerX, int centerY, double radius)
Circle(int centerX, int centerY)

// 메서드
void draw(String label, int lineWidth, String color) { }
void draw(String label, int lineWidth) { }
void draw(String label) { }
```

[보조 생성자(Secondary constructors)](classes.md#secondary-constructors)에서 설명한 대로, 클래스가 모든 생성자 파라미터에 대해 디폴트 값을 가지면 인자가 없는 public 생성자가 생성됩니다. 이는 `@JvmOverloads` 어노테이션이 지정되지 않은 경우에도 작동합니다.

## 체크 예외 (Checked exceptions)

Kotlin에는 체크 예외(checked exceptions)가 없습니다.
따라서 일반적으로 Kotlin 함수의 Java 시그니처는 던져지는 예외를 선언하지 않습니다.
따라서 다음과 같은 Kotlin 함수가 있다고 가정해 보겠습니다:

```kotlin
// example.kt
package demo

fun writeToFile() {
    /*...*/
    throw IOException()
}
```

그리고 이를 Java에서 호출하고 예외를 캐치하려고 하면:

```java

// Java
try {
    demo.Example.writeToFile();
} catch (IOException e) { 
    // 오류: writeToFile()은 throws 리스트에 IOException을 선언하지 않음
    // ...
}
```

`writeToFile()`이 `IOException`을 선언하지 않았기 때문에 Java 컴파일러로부터 오류 메시지를 받게 됩니다.
이 문제를 해결하려면 Kotlin에서 [`@Throws`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-throws/index.html) 어노테이션을 사용하세요:

```kotlin
@Throws(IOException::class)
fun writeToFile() {
    /*...*/
    throw IOException()
}
```

## 널 안전성 (Null-safety)

Java에서 Kotlin 함수를 호출할 때, null이 될 수 없는(non-nullable) 파라미터에 `null`을 전달하는 것을 막을 수 있는 방법은 없습니다.
그렇기 때문에 Kotlin은 null이 아닌 값을 기대하는 모든 public 함수에 대해 런타임 검사를 생성합니다.
이렇게 하면 Java 코드에서 즉시 `NullPointerException`이 발생하게 됩니다.

## 변성 제네릭 (Variant generics)

Kotlin 클래스가 [선언 지점 변성(declaration-site variance)](generics.md#declaration-site-variance)을 사용할 때, Java 코드에서 해당 클래스의 사용이 어떻게 보이는지에 대해 두 가지 옵션이 있습니다. 예를 들어, 다음과 같은 클래스와 이를 사용하는 두 개의 함수가 있다고 가정해 보겠습니다:

```kotlin
class Box<out T>(val value: T)

interface Base
class Derived : Base

fun boxDerived(value: Derived): Box<Derived> = Box(value)
fun unboxBase(box: Box<Base>): Base = box.value
```

이 함수들을 Java로 번역하는 단순한 방법은 다음과 같을 것입니다:

```java
Box<Derived> boxDerived(Derived value) { ... }
Base unboxBase(Box<Base> box) { ... }
```

문제는 Kotlin에서는 `unboxBase(boxDerived(Derived()))`를 작성할 수 있지만, Java에서는 불가능하다는 것입니다. 왜냐하면 Java에서 `Box` 클래스는 파라미터 `T`에 대해 *무공변성(invariant)*이므로 `Box<Derived>`가 `Box<Base>`의 하위 타입이 아니기 때문입니다.
Java에서 이것이 작동하게 하려면 `unboxBase`를 다음과 같이 정의해야 합니다:

```java
Base unboxBase(Box<? extends Base> box) { ... }  
```

이 선언은 Java가 가진 유일한 수단인 사용 지점 변성(use-site variance)을 통해 선언 지점 변성을 모방하기 위해 Java의 *와일드카드 타입(wildcards types)*(`? extends Base`)을 사용합니다.

Kotlin API가 Java에서 작동하도록 하기 위해, 컴파일러는 `Box<Super>`가 *파라미터로* 나타날 때 공변적으로 정의된 `Box`에 대해 `Box<? extends Super>`로(또는 반공변적으로 정의된 `Foo`에 대해 `Foo<? super Bar>`로) 생성합니다. 반환 값일 때는 와일드카드가 생성되지 않는데, 그렇지 않으면 Java 클라이언트가 이를 처리해야 하기 때문입니다(이는 일반적인 Java 코딩 스타일에도 반합니다). 따라서 예제의 함수는 실제로 다음과 같이 번역됩니다:

```java

// 반환 타입 - 와일드카드 없음
Box<Derived> boxDerived(Derived value) { ... }
 
// 파라미터 - 와일드카드 있음
Base unboxBase(Box<? extends Base> box) { ... }
```

> 인자 타입이 final인 경우 대개 와일드카드를 생성할 의미가 없으므로, `Box<String>`은 위치에 상관없이 항상 `Box<String>`입니다.
>
{style="note"}

기본적으로 와일드카드가 생성되지 않는 곳에 와일드카드가 필요한 경우, `@JvmWildcard` 어노테이션을 사용하세요:

```kotlin
fun boxDerived(value: Derived): Box<@JvmWildcard Derived> = Box(value)
// 다음과 같이 번역됨
// Box<? extends Derived> boxDerived(Derived value) { ... }
```

반대의 경우로, 와일드카드가 생성되는 곳에 와일드카드가 필요하지 않다면 `@JvmSuppressWildcards`를 사용하세요:

```kotlin
fun unboxBase(box: Box<@JvmSuppressWildcards Base>): Base = box.value
// 다음과 같이 번역됨
// Base unboxBase(Box<Base> box) { ... }
```

>`@JvmSuppressWildcards`는 개별 타입 인자뿐만 아니라 함수나 클래스와 같은 전체 선언에도 사용될 수 있으며, 이 경우 선언 내부의 모든 와일드카드 생성이 억제됩니다.
>
{style="note"}

### Nothing 타입의 변환
 
[`Nothing`](exceptions.md#the-nothing-type) 타입은 Java에 자연스러운 대응물이 없기 때문에 특별합니다. 실제로 `java.lang.Void`를 포함한 모든 Java 참조 타입은 값으로 `null`을 허용하지만, `Nothing`은 그것조차 허용하지 않습니다. 따라서 이 타입은 Java 세계에서 정확하게 표현될 수 없습니다. 이것이 Kotlin이 `Nothing` 타입의 인자가 사용되는 곳에 로우 타입(raw type)을 생성하는 이유입니다:

```kotlin
fun emptyList(): `List<Nothing>` = listOf()
// 다음과 같이 번역됨
// List emptyList() { ... }
```

## 인라인 값 클래스 (Inline value classes)

<primary-label ref="experimental-general"/>

Java 코드가 Kotlin의 [인라인 값 클래스(inline value classes)](inline-classes.md)와 원활하게 작동하도록 하려면 [`@JvmExposeBoxed`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.jvm/-jvm-expose-boxed/) 어노테이션이나 `-Xjvm-expose-boxed` 컴파일러 옵션을 사용할 수 있습니다. 이러한 방식은 Kotlin이 Java 상호 운용성을 위해 필요한 박싱된(boxed) 표현을 생성하도록 보장합니다.

기본적으로 Kotlin은 인라인 값 클래스를 **언박싱된(unboxed) 표현**을 사용하도록 컴파일하며, 이는 Java에서 접근할 수 없는 경우가 많습니다. 예를 들어, Java에서 `MyInt` 클래스의 생성자를 호출할 수 없습니다:

```kotlin
@JvmInline
value class MyInt(val value: Int)
```

따라서 다음과 같은 Java 코드는 실패합니다:

```java
MyInt input = new MyInt(5);
```

`@JvmExposeBoxed` 어노테이션을 사용하면 Kotlin이 Java에서 직접 호출할 수 있는 public 생성자를 생성합니다. Java에 노출되는 대상을 세밀하게 제어하기 위해 다음 수준에서 어노테이션을 적용할 수 있습니다:

* 클래스 (Class)
* 생성자 (Constructor)
* 함수 (Function)

코드에서 `@JvmExposeBoxed` 어노테이션을 사용하기 전에, `@OptIn(ExperimentalStdlibApi::class)`를 사용하여 옵트인해야 합니다.
예를 들어:

```kotlin
@OptIn(ExperimentalStdlibApi::class)
@JvmExposeBoxed
@JvmInline
value class MyInt(val value: Int)

@OptIn(ExperimentalStdlibApi::class)
@JvmExposeBoxed
fun MyInt.timesTwoBoxed(): MyInt = MyInt(this.value * 2)
```

이러한 어노테이션을 사용하면 Kotlin은 `MyInt` 클래스에 대해 Java에서 접근 가능한 생성자**와** 값 클래스의 박싱된 형태를 사용하는 확장 함수 변체(variant)를 생성합니다. 따라서 다음과 같은 Java 코드가 성공적으로 실행됩니다:

```java
MyInt input = new MyInt(5);
MyInt output = ExampleKt.timesTwoBoxed(input);
```

모듈 내의 모든 인라인 값 클래스와 이를 사용하는 함수에 이 동작을 적용하려면 `-Xjvm-expose-boxed` 옵션으로 컴파일하세요.
이 옵션으로 컴파일하는 것은 모듈의 모든 선언에 `@JvmExposeBoxed` 어노테이션이 있는 것과 동일한 효과를 가집니다.

### 상속된 함수 (Inherited functions)

`@JvmExposeBoxed` 어노테이션은 상속된 함수에 대해 박싱된 표현을 자동으로 생성하지 않습니다.
 
상속된 함수에 필요한 표현을 생성하려면, 이를 구현하는 클래스나 확장하는 클래스에서 오버라이드하세요:
 
```kotlin
interface IdTransformer {
    fun transformId(rawId: UInt): UInt = rawId
}

// transformId() 함수에 대한 박싱된 표현을 생성하지 않음
@OptIn(ExperimentalStdlibApi::class)
@JvmExposeBoxed
class LightweightTransformer : IdTransformer

// transformId() 함수에 대한 박싱된 표현을 생성함
@OptIn(ExperimentalStdlibApi::class)
@JvmExposeBoxed
class DefaultTransformer : IdTransformer {
    override fun transformId(rawId: UInt): UInt = super.transformId(rawId)
}
```

Kotlin에서 상속이 작동하는 방식과 `super` 키워드를 사용하여 상위 클래스 구현을 호출하는 방법을 알아보려면 [상속(Inheritance)](inheritance.md#calling-the-superclass-implementation)을 참조하세요.