[//]: # (title: 패키지와 임포트)

Kotlin 프로젝트에서 코드는 패키지와 임포트를 사용하여 구성됩니다:

* **패키지(package)**는 하나 이상의 Kotlin 파일을 담는 컨테이너입니다. 파일은 `package` 헤더를 통해 패키지와 연결됩니다.
* **임포트(import)**는 다른 패키지의 엔티티를 현재 파일에서 사용할 수 있게 해주는 지시문입니다.

## 패키지 헤더

소스 파일은 패키지 헤더로 시작할 수 있습니다:

```kotlin
package org.example

fun printMessage() { /*...*/ }
class Message(val text: String) { /*...*/ }
```

클래스와 함수 등 소스 파일의 모든 콘텐츠는 이 패키지에 포함됩니다.
이들의 전체 이름(fully qualified name)은 패키지 이름과 엔티티의 이름을 결합한 것입니다.
위 예제에서:

* `printMessage()`의 전체 이름은 `org.example.printMessage`입니다.
* `Message`의 전체 이름은 `org.example.Message`입니다.

파일에 패키지 헤더가 없으면, 해당 콘텐츠는 루트 패키지에 속하게 됩니다.

## 임포트

다른 패키지의 파일에 있는 엔티티를 사용하려면 `import` 지시문을 사용하세요.
기본 임포트 외에도, 각 파일은 고유한 임포트를 선언할 수 있습니다.

### 단일 엔티티 임포트

특정 엔티티를 임포트하면 한정어(qualification) 없이 사용할 수 있습니다:

```kotlin
// 이제 Message를 한정어 없이 사용할 수 있습니다.
import org.example.Message 

fun main() {
    val message = Message("Hello")
    println(message.text)
}
```

### 범위 내 콘텐츠 임포트

별표(`*`)로 끝나는 스타 임포트(star import)는 해당 범위 내의 모든 이름이 있는 엔티티를 임포트합니다:

```kotlin
// org.example의 모든 항목에 접근할 수 있게 됩니다.
import org.example.* 

fun main() {
    printMessage()
    val message = Message("Hi")
}
```

스타 임포트와 명시적 임포트로 동일한 엔티티를 임포트하는 경우, 오버로드 해소(overload resolution) 시 명시적 임포트가 우선순위를 갖습니다.

### 별칭을 사용하여 이름 충돌 해결

임포트한 두 엔티티의 이름이 같은 경우, `as` 키워드를 사용하여 로컬에서 그 중 하나의 이름을 변경함으로써 모호함을 해소할 수 있습니다:

```kotlin
// Message는 org.example.Message를 나타냅니다.
import org.example.Message

// TestMessage는 org.test.Message를 나타냅니다.
import org.test.Message as TestMessage

fun main() {
    val a = Message("from example")
    val b = TestMessage("from test")
}
```

### 임포트할 수 있는 항목

`import` 키워드는 클래스 임포트에만 국한되지 않습니다. 패키지, 클래스, 객체, 열거형(enum) 중 어디에 있든 다음과 같은 엔티티를 임포트하는 데 사용할 수 있습니다:

* 패키지 내부에 직접 선언된 최상위 함수 및 프로퍼티:
    ```kotlin
    import org.example.printMessage // 최상위 함수
    import org.example.VERSION      // 최상위 프로퍼티
    ```
* [객체 선언(object declarations)](object-declarations.md#object-declarations-overview)의 함수 및 프로퍼티:
    ```kotlin
    import org.example.Config.DEFAULT_TIMEOUT // 객체의 프로퍼티
    import org.example.Config.loadSettings    // 객체의 함수
    ```
* 소속 클래스 이름을 통해 참조되는 [컴패니언 객체(companion object)](object-declarations.md#companion-objects)의 멤버:
    ```kotlin
    import org.example.MyClass.create // MyClass.Companion.create를 참조합니다.
    ```
* [열거형 상수(enum constants)](enum-classes.md):
    ```kotlin
    import org.example.Color.RED
    import org.example.Color.GREEN
    ```
* 중첩 클래스:
    ```kotlin
    import org.example.Outer.Nested
    ```

## 기본 임포트

많은 패키지가 기본적으로 모든 Kotlin 파일에 임포트됩니다:

* [kotlin.*](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/index.html)
* [kotlin.annotation.*](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.annotation/index.html)
* [kotlin.collections.*](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/index.html)
* [kotlin.comparisons.*](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.comparisons/index.html)
* [kotlin.io.*](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.io/index.html)
* [kotlin.ranges.*](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.ranges/index.html)
* [kotlin.sequences.*](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.sequences/index.html)
* [kotlin.text.*](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/index.html)
* [kotlin.math.*](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.math/index.html)

대상 플랫폼에 따라 추가 패키지가 임포트됩니다:

* JVM:
  * [java.lang.*](https://docs.oracle.com/javase/8/docs/api/java/lang/package-summary.html)
  * [kotlin.jvm.*](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.jvm/index.html)

* JS:
  * [kotlin.js.*](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.js/index.html)

## 가시성과 임포트

엔티티를 임포트할 수 있는지 여부는 해당 엔티티의 [가시성 수정자(visibility modifiers)](visibility-modifiers.md)에 따라 달라집니다:

* `public` 엔티티는 어디서나 임포트할 수 있습니다.
* `internal` 엔티티는 동일한 모듈 내에서만 임포트할 수 있습니다.
* `protected` 엔티티는 임포트할 수 없습니다.
* 최상위 `private` 엔티티는 선언된 파일 내에서만 접근할 수 있습니다.
* 그 외의 `private` 엔티티는 임포트할 수 없습니다.