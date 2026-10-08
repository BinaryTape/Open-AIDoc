[//]: # (title: 인라인 값 클래스)

때로는 값을 클래스로 감싸서 더 도메인 특화된(domain-specific) 타입을 만드는 것이 유용합니다. 하지만 이는 추가적인 힙 할당으로 인해 런타임 오버헤드를 발생시킵니다. 더욱이 감싸려는 타입이 원시 타입(primitive type)인 경우 성능 저하가 심각한데, 원시 타입은 일반적으로 런타임에 의해 고도로 최적화되는 반면 그 래퍼(wrapper)는 특별한 대우를 받지 못하기 때문입니다. 

이러한 문제를 해결하기 위해 코틀린은 **인라인 클래스(inline class)**라는 특별한 종류의 클래스를 도입했습니다. 
인라인 클래스는 [값 기반 클래스(value-based classes)](https://github.com/Kotlin/KEEP/blob/master/notes/value-classes.md)의 하위 집합입니다. 인라인 클래스는 식별자(identity)를 가지지 않으며 값만을 보유할 수 있습니다.

인라인 클래스를 선언하려면 클래스 이름 앞에 `value` 수식어를 사용하세요:

```kotlin
value class Password(private val s: String)
```

JVM 백엔드용 인라인 클래스를 선언하려면 클래스 선언 앞에 `@JvmInline` 어노테이션과 함께 `value` 수식어를 사용하세요: 

```kotlin
// JVM 백엔드용
@JvmInline
value class Password(private val s: String)
```

인라인 클래스는 주 생성자에서 초기화되는 단일 프로퍼티가 있어야 합니다. 런타임에 인라인 클래스의 인스턴스는 이 단일 프로퍼티를 사용하여 표현됩니다(런타임 표현 방식에 대한 자세한 내용은 [아래](#representation)를 참조하세요):

```kotlin
// 'Password' 클래스의 실제 인스턴스화는 일어나지 않음
// 런타임에 'securePassword'는 단지 'String'만을 포함함
val securePassword = Password("Don't try this in production") 
```

이것이 인라인 클래스의 주요 특징이며, 클래스의 데이터가 사용되는 곳에 **인라인(inline)**된다는 점에서 그 이름이 유래되었습니다([인라인 함수](inline-functions.md)의 내용이 호출 지점에 인라인되는 방식과 유사함).

## 멤버 {id="members"}

인라인 클래스는 일반 클래스의 일부 기능을 지원합니다. 특히 프로퍼티와 함수를 선언할 수 있으며, `init` 블록과 [보조 생성자(secondary constructors)](classes.md#secondary-constructors)를 가질 수 있습니다:

```kotlin
@JvmInline
value class Person(private val fullName: String) {
    init {
        require(fullName.isNotEmpty()) {
            "Full name shouldn't be empty"
        }
    }

    constructor(firstName: String, lastName: String) : this("$firstName $lastName") {
        require(lastName.isNotBlank()) {
            "Last name shouldn't be empty"
        }
    }

    val length: Int
        get() = fullName.length

    fun greet() {
        println("Hello, $fullName")
    }
}

fun main() {
    val name1 = Person("Kotlin", "Mascot")
    val name2 = Person("Kodee")
    name1.greet() // `greet()` 함수는 정적 메서드로 호출됨
    println(name2.length) // 프로퍼티 게터(getter)는 정적 메서드로 호출됨
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.9"}

인라인 클래스의 프로퍼티는 [뒷받침하는 필드(backing fields)](properties.md#backing-fields)를 가질 수 없습니다. 단순한 계산된 프로퍼티만 가질 수 있으며 `lateinit`이나 위임된 프로퍼티(delegated properties)는 사용할 수 없습니다.

## 상속 {id="inheritance"}

인라인 클래스는 인터페이스를 상속할 수 있습니다:

```kotlin
interface Printable {
    fun prettyPrint(): String
}

@JvmInline
value class Name(val s: String) : Printable {
    override fun prettyPrint(): String = "Let's $s!"
}

fun main() {
    val name = Name("Kotlin")
    println(name.prettyPrint()) // 여전히 정적 메서드로 호출됨
}
```

인라인 클래스가 클래스 계층 구조에 참여하는 것은 금지되어 있습니다. 즉, 인라인 클래스는 다른 클래스를 확장(extend)할 수 없으며 항상 `final`입니다.

## 표현 방식 (Representation) {id="representation"}

생성된 코드에서 코틀린 컴파일러는 각 인라인 클래스에 대한 **래퍼(wrapper)**를 유지합니다. 인라인 클래스 인스턴스는 런타임에 래퍼 또는 기저 타입(underlying type)으로 표현될 수 있습니다. 이는 `Int`가 원시 타입 `int` 또는 래퍼 `Integer`로 [표현](numbers.md#boxing-and-caching-numbers-on-the-jvm)될 수 있는 방식과 유사합니다.

코틀린 컴파일러는 가장 성능이 좋고 최적화된 코드를 생성하기 위해 래퍼 대신 기저 타입을 사용하는 것을 선호합니다. 하지만 때로는 래퍼를 유지해야 할 때가 있습니다. 원칙적으로 인라인 클래스가 다른 타입으로 사용될 때마다 박싱(boxed)됩니다.

```kotlin
interface I

@JvmInline
value class Foo(val i: Int) : I

fun asInline(f: Foo) {}
fun <T> asGeneric(x: T) {}
fun asInterface(i: I) {}
fun asNullable(i: Foo?) {}

fun <T> id(x: T): T = x

fun main() {
    val f = Foo(42) 
    
    asInline(f)    // 언박싱됨: Foo 자체로 사용됨
    asGeneric(f)   // 박싱됨: 제네릭 타입 T로 사용됨
    asInterface(f) // 박싱됨: 타입 I로 사용됨
    asNullable(f)  // 박싱됨: Foo와는 다른 Foo?로 사용됨
    
    // 아래에서 'f'는 먼저 박싱되고 ('id'로 전달되는 동안), 그 다음 언박싱됨 ('id'에서 반환될 때)
    // 결국 'c'는 'f'와 마찬가지로 언박싱된 표현(단순히 '42')을 포함함
    val c = id(f)  
}
```

인라인 클래스는 기저 값과 래퍼로 모두 표현될 수 있으므로, [참조 동등성(referential equality)](equality.md#referential-equality)은 의미가 없으며 따라서 금지됩니다.

인라인 클래스는 기저 타입으로 제네릭 타입 파라미터를 가질 수도 있습니다. 이 경우 컴파일러는 이를 `Any?` 또는 더 일반적으로는 타입 파라미터의 상한(upper bound)으로 매핑합니다.

```kotlin
@JvmInline
value class UserId<T>(val value: T)

fun compute(s: UserId<String>) {} // 컴파일러는 fun compute-<hashcode>(s: Any?)를 생성함
```

### 맹글링 (Mangling) {id="mangling"}

인라인 클래스는 기저 타입으로 컴파일되기 때문에, 예기치 않은 플랫폼 시그니처 충돌과 같은 다양한 모호한 오류가 발생할 수 있습니다:

```kotlin
@JvmInline
value class UInt(val x: Int)

// JVM에서 'public final void compute(int x)'로 표현됨
fun compute(x: Int) { }

// 이 또한 JVM에서 'public final void compute(int x)'로 표현됨!
fun compute(x: UInt) { }
```

이러한 문제를 완화하기 위해 인라인 클래스를 사용하는 함수는 함수 이름에 안정적인 해시코드를 추가하여 **맹글링(mangled)**됩니다. 따라서 `fun compute(x: UInt)`는 `public final void compute-<hashcode>(int x)`로 표현되어 충돌 문제를 해결합니다.

### Java 코드에서 호출하기 {id="calling-from-java-code"}

Java 코드에서 인라인 클래스를 인자로 받는 함수를 호출할 수 있습니다. 이를 위해 함수 선언 앞에 `@JvmName` 어노테이션을 추가하여 수동으로 맹글링을 비활성화해야 합니다:

```kotlin
@JvmInline
value class UInt(val x: Int)

fun compute(x: Int) { }

@JvmName("computeUInt")
fun compute(x: UInt) { }
```

기본적으로 코틀린은 인라인 클래스를 **언박싱된 표현(unboxed representations)**을 사용하여 컴파일하므로 Java에서 접근하기 어렵습니다. 인라인 클래스를 Java에서 접근 가능한 **박싱된 표현(boxed representations)**으로 컴파일하는 방법은 [Java에서 코틀린 호출하기](java-to-kotlin-interop.md#inline-value-classes) 가이드를 참조하세요.

## 인라인 클래스 vs 타입 별칭 (Type aliases) {id="inline-classes-vs-type-aliases"}

첫눈에 인라인 클래스는 [타입 별칭(type aliases)](type-aliases.md)과 매우 유사해 보입니다. 실제로 두 가지 모두 새로운 타입을 도입하는 것처럼 보이며 런타임에는 기저 타입으로 표현됩니다.

하지만 결정적인 차이점은 타입 별칭은 기저 타입(및 동일한 기저 타입을 가진 다른 타입 별칭)과 **할당 호환(assignment-compatible)**되지만, 인라인 클래스는 그렇지 않다는 점입니다.

즉, 인라인 클래스는 기존 타입에 대한 대체 이름(별칭)만 도입하는 타입 별칭과 달리 진정으로 **새로운** 타입을 도입합니다:

```kotlin
typealias NameTypeAlias = String

@JvmInline
value class NameInlineClass(val s: String)

fun acceptString(s: String) {}
fun acceptNameTypeAlias(n: NameTypeAlias) {}
fun acceptNameInlineClass(p: NameInlineClass) {}

fun main() {
    val nameAlias: NameTypeAlias = ""
    val nameInlineClass: NameInlineClass = NameInlineClass("")
    val string: String = ""

    acceptString(nameAlias) // OK: 기저 타입 대신 별칭을 전달
    acceptString(nameInlineClass) // 오류: 기저 타입 대신 인라인 클래스를 전달할 수 없음

    // 반대의 경우도 마찬가지:
    acceptNameTypeAlias(string) // OK: 별칭 대신 기저 타입을 전달
    acceptNameInlineClass(string) // 오류: 인라인 클래스 대신 기저 타입을 전달할 수 없음
}
```

## 인라인 클래스와 위임 (Delegation) {id="inline-classes-and-delegation"}

인터페이스를 사용하여 인라인 클래스의 인라인된 값으로의 위임 구현이 허용됩니다:

```kotlin
interface MyInterface {
    fun bar()
    fun foo() = "foo"
}

@JvmInline
value class MyInterfaceWrapper(val myInterface: MyInterface) : MyInterface by myInterface

fun main() {
    val my = MyInterfaceWrapper(object : MyInterface {
        override fun bar() {
            // 본문
        }
    })
    println(my.foo()) // "foo" 출력
}
```
