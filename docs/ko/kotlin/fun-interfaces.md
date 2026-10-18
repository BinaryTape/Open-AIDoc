[//]: # (title: 함수형 \(SAM\) 인터페이스)

추상 멤버 함수가 단 하나만 있는 인터페이스를 *함수형 인터페이스(functional interface)* 또는 *SAM(Single Abstract Method, 단일 추상 메서드) 인터페이스*라고 합니다. 함수형 인터페이스는 여러 개의 비추상 멤버 함수를 가질 수 있지만, 추상 멤버 함수는 오직 하나만 가질 수 있습니다.

Kotlin에서 함수형 인터페이스를 선언하려면 `fun` 수식어를 사용합니다.

```kotlin
fun interface KRunnable {
    fun invoke()
}
```

## SAM 변환 {id="sam-conversions"}

함수형 인터페이스에는 [람다 표현식](lambdas.md#lambda-expressions-and-anonymous-functions)을 사용하여 코드를 더 간결하고 가독성 있게 만들어 주는 SAM 변환을 적용할 수 있습니다.

함수형 인터페이스를 수동으로 구현하는 클래스를 작성하는 대신 람다 표현식을 사용할 수 있습니다.
SAM 변환을 사용하면 Kotlin은 해당 인터페이스의 단일 메서드 시그니처와 일치하는 시그니처를 가진 모든 람다 표현식을 인터페이스 구현을 동적으로 인스턴스화하는 코드로 변환할 수 있습니다.

예를 들어 다음과 같은 Kotlin 함수형 인터페이스가 있다고 가정해 보겠습니다.

```kotlin
fun interface IntPredicate {
    fun accept(i: Int): Boolean
}
```

SAM 변환을 사용하지 않는다면 다음과 같이 코드를 작성해야 합니다.

```kotlin
// 클래스 인스턴스 생성
val isEven = object : IntPredicate {
    override fun accept(i: Int): Boolean {
        return i % 2 == 0
    }
}
```

Kotlin의 SAM 변환을 활용하면 대신 다음과 같이 동등한 코드를 작성할 수 있습니다.

```kotlin
// 람다를 사용해 인스턴스 생성
val isEven = IntPredicate { it % 2 == 0 }
```

짧은 람다 표현식 하나로 불필요한 코드를 모두 대체합니다.

```kotlin
fun interface IntPredicate {
    fun accept(i: Int): Boolean
}

val isEven = IntPredicate { it % 2 == 0 }

fun main() {
    println("Is 7 even? - ${isEven.accept(7)}")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.4"}

[Java 인터페이스에 대한 SAM 변환](java-interop.md#sam-conversions)도 사용할 수 있습니다.

### SAM 파라미터에 호출 가능한 참조 전달 {id="pass-callable-references-to-sam-parameters"}

필요한 동작이 이미 이름이 지정된 함수로 존재하는 경우 [호출 가능한 참조(callable reference)](lambdas.md#callable-reference)를 전달할 수 있습니다.
Kotlin은 호환되는 호출 가능한 참조를 기대되는 함수형 인터페이스에 맞게 변환(적응)합니다.

```kotlin
fun interface Action {
    fun run()
}

fun execute(action: Action) {
    action.run()
}

fun start() {
    println("Run from a callable reference")
}

fun main() {
    // Kotlin이 람다를 Action 인스턴스로 변환합니다
    execute { start() }
    // Run from a callable reference

    // Kotlin이 참조를 Action 인스턴스에 맞게 변환합니다
    execute(::start)
    // Run from a callable reference
}
```
{kotlin-runnable="true"}

`execute { start() }`의 람다는 함수 리터럴이므로, Kotlin은 SAM 변환을 사용하여 `Action` 인스턴스를 생성합니다.
`execute(::start)`에서 `::start`는 기존 `start()` 함수에 대한 호출 가능한 참조입니다. `execute()`가 `Action`을 요구하므로 컴파일러는 `start()`를 `Action.run()`의 구현체로 사용하는 호환 가능한 `Action` 인스턴스를 생성합니다.
이 과정을 *SAM 적응(SAM adaptation)*이라고 합니다.

## 생성자 함수가 있는 인터페이스에서 함수형 인터페이스로 마이그레이션 {id="migration-from-an-interface-with-constructor-function-to-a-functional-interface"}

1.6.20부터 Kotlin은 함수형 인터페이스 생성자에 대한 호출 가능한 참조를 지원하여, 생성자 함수가 있는 인터페이스에서 함수형 인터페이스로 소스 호환성을 유지하며 마이그레이션할 수 있는 방법을 제공합니다.
다음 코드를 살펴보겠습니다.

```kotlin
interface Printer { 
    fun print() 
}

fun Printer(block: () -> Unit): Printer = object : Printer {
    override fun print() = block()
}
```

함수형 인터페이스 생성자에 대한 호출 가능한 참조 지원이 활성화되면 이 코드를 단순한 함수형 인터페이스 선언으로 대체할 수 있습니다.

```kotlin
fun interface Printer { 
    fun print()
}
```

생성자는 암시적으로 생성되며, `::Printer` 함수 참조를 사용하는 모든 코드가 정상적으로 컴파일됩니다. 예를 들면 다음과 같습니다.

```kotlin
documentsStorage.addPrinter(::Printer)
```

이전 `Printer` 함수에 [`@Deprecated`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-deprecated/) 애너테이션과 함께 `DeprecationLevel.HIDDEN`을 지정하여 바이너리 호환성을 유지하세요.

```kotlin
@Deprecated(message = "Your message about the deprecation", level = DeprecationLevel.HIDDEN)
fun Printer(...) {...}
```

## 함수형 인터페이스 vs. 타입 별칭 {id="functional-interfaces-vs-type-aliases"}

함수형 타입에 [타입 별칭(type alias)](type-aliases.md)을 사용하여 위의 코드를 간단히 다시 작성할 수도 있습니다.

```kotlin
typealias IntPredicate = (i: Int) -> Boolean

val isEven: IntPredicate = { it % 2 == 0 }

fun main() {
    println("Is 7 even? - ${isEven(7)}")
}
```

하지만 함수형 인터페이스와 [타입 별칭](type-aliases.md)은 서로 다른 용도로 사용됩니다.
타입 별칭은 기존 타입의 이름일 뿐 새 타입을 만들지 않지만, 함수형 인터페이스는 새로운 타입을 만듭니다.
일반 함수나 그 타입 별칭에는 적용할 수 없고 특정 함수형 인터페이스에만 적용되는 확장 기능을 제공할 수도 있습니다.

타입 별칭은 단 하나의 멤버만 가질 수 있는 반면, 함수형 인터페이스는 여러 개의 비추상 멤버 함수와 하나의 추상 멤버 함수를 가질 수 있습니다.
또한 함수형 인터페이스는 다른 인터페이스를 구현하고 확장할 수 있습니다.

함수형 인터페이스는 타입 별칭보다 더 유연하고 더 많은 기능을 제공하지만, 특정 인터페이스로의 변환이 필요할 수 있어 문법적으로나 런타임 시에 더 많은 비용이 들 수 있습니다.
코드에서 둘 중 어느 것을 사용할지 선택할 때는 다음과 같은 요구 사항을 고려하세요.
* API가 특정 매개변수 및 반환 타입을 가진 함수(임의의 함수)를 허용해야 하는 경우 — 단순한 함수형 타입을 사용하거나, 해당 함수형 타입에 더 짧은 이름을 부여하도록 타입 별칭을 정의하세요.
* API가 함수보다 더 복잡한 엔티티를 허용해야 하는 경우 — 예를 들어 단순한 함수형 타입의 시그니처로는 표현할 수 없는 복잡한 계약(contract) 및/또는 연산이 포함되어 있는 경우 — 별도의 함수형 인터페이스를 선언하세요.