[//]: # (title: 위임)

[위임 패턴(Delegation pattern)](https://en.wikipedia.org/wiki/Delegation_pattern)은 구현 상속의 좋은 대안임이 입증되었으며, 코틀린은 보일러플레이트 코드 없이도 이를 기본적으로 지원합니다.

`Derived` 클래스는 모든 public 멤버를 지정된 객체에 위임함으로써 `Base` 인터페이스를 구현할 수 있습니다:

```kotlin
interface Base {
    fun print()
}

class BaseImpl(val x: Int) : Base {
    override fun print() { print(x) }
}

class Derived(b: Base) : Base by b

fun main() {
    val base = BaseImpl(10)
    val derived = Derived(base) 
    
    derived.print()
    // 10
}
```
{kotlin-runnable="true"}

`Derived`의 상위 타입 목록에 있는 `by` 절은 `b`가 `Derived` 객체 내부에 저장되며, 컴파일러가 `Base`의 모든 메서드를 `b`로 전달(forward)하도록 생성할 것임을 나타냅니다.

## 위임으로 구현된 인터페이스 멤버 오버라이딩하기 {id="overriding-a-member-of-an-interface-implemented-by-delegation"}

[오버라이딩(Overrides)](inheritance.md#overriding-methods)은 예상한 대로 작동합니다. 컴파일러는 위임 객체에 있는 구현 대신 사용자가 작성한 `override` 구현을 사용합니다. 만약 `Derived`에 `override fun printMessage() { print("abc") }`를 추가하면, `printMessage`가 호출될 때 프로그램은 *10* 대신 *abc*를 출력합니다:

```kotlin
interface Base {
    fun printMessage()
    fun printMessageLine()
}

class BaseImpl(val x: Int) : Base {
    override fun printMessage() { print(x) }
    override fun printMessageLine() { println(x) }
}

class Derived(b: Base) : Base by b {
    override fun printMessage() { println("abc") }
}

fun main() {
    val base = BaseImpl(10)
    val derived = Derived(base)

    derived.printMessage()
    // abc
    derived.printMessageLine()
    // 10
}
```
{kotlin-runnable="true"}

하지만 이렇게 오버라이드된 멤버는 위임 객체의 멤버에서 호출되지 않는다는 점에 주의하세요. 위임 객체는 해당 인터페이스 멤버의 자체 구현에만 접근할 수 있습니다:

```kotlin
interface Base {
    val message: String
    fun print()
}

class BaseImpl(x: Int) : Base {
    override val message = "BaseImpl: x = $x"
    override fun print() { println(message) }
}

class Derived(b: Base) : Base by b {
    // 이 프로퍼티는 b의 `print()` 구현에서
    // 접근할 수 없습니다.
    override val message = "Message of Derived"
}

fun main() {
    val base = BaseImpl(10)
    val derived = Derived(base)
    
    derived.print()
    // BaseImpl: x = 10
    println(derived.message)
    // Message of Derived
}
```
{kotlin-runnable="true"}

[위임된 프로퍼티(delegated properties)](delegated-properties.md)에 대해 더 자세히 알아보세요.