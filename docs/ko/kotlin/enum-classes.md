[//]: # (title: Enum 클래스)

Enum 클래스는 사전에 정의된 고정된 값의 집합을 나타냅니다. 사용 가능한 상태나 모드처럼 값이 미리 정의된 몇 가지 옵션 중 하나만 가질 수 있을 때 enum 클래스를 사용합니다.

Enum 클래스의 각 값은 _enum 상수(enum constant)_라고 부릅니다. Enum 상수는 해당 enum 클래스 타입의 [싱글톤 객체(singleton objects)](object-declarations.md)처럼 동작하므로 프로퍼티, 함수, 커스텀 동작을 가질 수 있습니다.

Enum 클래스는 가능한 모든 값을 미리 알고 있고 각 값이 동일한 구조를 가질 때 가장 적합합니다. 케이스마다 서로 다른 데이터를 보관해야 하거나 구조가 달라야 한다면 [sealed 클래스 또는 인터페이스](sealed-classes.md)를 사용하세요.

## Enum 클래스 선언 {id="declare-enum-classes"}

Enum 클래스를 만들려면 `enum` 키워드를 사용하고 중괄호로 둘러싸인 본문이 있는 일반적인 클래스 문법을 따릅니다. 클래스 본문 내에 쉼표로 구분하여 enum 상수를 나열합니다.

```kotlin
enum class Direction {
    NORTH, SOUTH, WEST, EAST
}
```

이 예제에서 `Direction`은 enum 클래스이고, `NORTH`, `SOUTH`, `WEST`, `EAST`는 enum 상수입니다.

관례상 enum 상수는 고정된 상수 값을 나타내므로 대문자로 작성합니다.

enum 클래스 이름 뒤에 상수 이름을 붙여서 enum 상수에 접근할 수 있습니다.

```kotlin
enum class Direction {
    NORTH, SOUTH, WEST, EAST
}

fun main() {
    // `Direction.NORTH`는 `Direction` 타입의 enum 상수입니다.
    val direction: Direction = Direction.NORTH

    println(direction)
    // NORTH
}
```
{kotlin-runnable="true" id="create-enum-class-kotlin"}

Kotlin의 모든 enum 클래스는 [`Enum<T>`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-enum/) 기반 클래스를 상속하며, 여기서 `T`는 해당 enum 클래스 자신입니다. 예를 들어 `Direction` enum 클래스는 `Enum<Direction>`을 상속합니다. 그렇기 때문에 enum 상수는 [`name`과 `ordinal`](#access-enum-constants-and-their-properties)과 같은 내장 프로퍼티를 가집니다.

## Enum 상수 작업하기 {id="working-with-enum-constants"}

Enum 상수는 값이므로 변수에 할당하거나, 출력하거나, 함수에 전달하거나, 비교하거나, `when` 표현식에서 사용할 수 있습니다.

### Enum 상수 선언 {id="declare-enum-constants"}

Enum 상수를 선언하려면 먼저 enum 클래스 생성자에 프로퍼티를 정의한 다음, 각 enum 상수의 괄호 안에 값을 전달합니다. 다른 일부 언어와 달리 Kotlin은 `RED = "#FF0000"`과 같은 할당 문법을 사용하지 않습니다.

Enum 상수는 모든 타입의 연관 값을 가질 수 있습니다. 문자열과 숫자가 흔한 예이지만, `Boolean`, 다른 enum 클래스 또는 커스텀 클래스와 같은 다른 타입을 사용할 수도 있습니다.

각 색상에 대한 16진수 색상 코드를 저장하는 `Color` enum 클래스를 살펴보겠습니다.

```kotlin
enum class Color(val hex: String) {
    RED("#FF0000"),
    GREEN("#00FF00"),
    BLUE("#0000FF")
}
```

각 enum 상수에 전달되는 값은 생성자 파라미터 타입과 일치해야 합니다. 여기서 `hex`는 `Color` enum 클래스의 문자열 프로퍼티입니다. 각 enum 상수는 이 프로퍼티에 고유한 문자열 값을 전달합니다.

또한 숫자 값을 enum 상수에 연결할 수도 있습니다. 예를 들어 생성자에서 `Int` 타입을 선언하고 각 enum 상수에 `Int` 값을 제공할 수 있습니다.

```kotlin
enum class Priority(val level: Int) {
    LOW(0),
    MEDIUM(1),
    HIGH(2)
}
```

### Enum 상수 및 프로퍼티 접근 {id="access-enum-constants-and-their-properties"}

Enum 클래스 이름을 통해 enum 상수에 접근할 수 있습니다. Enum 상수에 연결된 프로퍼티에 접근하려면 점 표기법(예: `color.hex` 또는 `Color.GREEN.hex`)을 사용합니다.

```kotlin
enum class Color(val hex: String) {
    RED("#FF0000"),
    GREEN("#00FF00"),
    BLUE("#0000FF")
}

fun main() {
    val color: Color = Color.RED

    println(color)
    // RED
    println(color.hex)
    // #FF0000
    println(Color.GREEN.hex)
    // #00FF00
}
```
{kotlin-runnable="true" id="access-enum-properties-kotlin"}

여기서 `Color.RED`는 `Color` 타입의 enum 상수입니다. color 변수는 이 enum 상수를 저장합니다.

직접 정의한 프로퍼티 외에도 모든 enum 상수는 enum 클래스 선언에서 이름과 위치(`0`부터 시작)를 가져오기 위한 내장 `name` 및 `ordinal` 프로퍼티를 가집니다.

```kotlin
enum class RGB { RED, GREEN, BLUE }

fun main() {
    println(RGB.RED.name)
    // RED
    println(RGB.RED.ordinal)
    // 0
}
```
{kotlin-runnable="true" id="rgb-enums-properties-kotlin"}

### 함수에 enum 상수 전달 {id="pass-enum-constants-to-functions"}

Enum 상수는 값이므로 함수에 전달할 수 있습니다. 이 방식을 사용하면 함수가 enum 클래스에 정의된 고정된 옵션 집합만 허용하므로 타입 안전한 코드가 보장됩니다.

```kotlin
enum class Color(val hex: String) {
    RED("#FF0000"),
    GREEN("#00FF00"),
    BLUE("#0000FF")
}

//sampleStart
fun printColor(color: Color) {
    println("Color: $color")
    println("Hex code: ${color.hex}")
}

fun main() {
    printColor(Color.BLUE)
    // Color: BLUE
    // Hex code: #0000FF
}
//sampleEnd
```
{kotlin-runnable="true" id="pass-enum-to-function-kotlin"}

여기서 `printColor()` 함수는 `Color` 타입의 값을 받으므로 어떤 `Color` enum 상수든 전달할 수 있습니다.

Enum 상수가 싱글톤 객체처럼 동작하지만, 컴파일러는 이를 enum 클래스 타입의 값으로 취급합니다. Enum 클래스 이름 자체는 타입으로 사용할 수 있지만, enum 상수를 enum 타입으로 사용할 수는 없습니다.

```kotlin
enum class Color {
    RED, GREEN, BLUE
}

fun printColor(color: Color) {
    println(color)
}

fun printRed(color: Color.RED) {
    println(color)
    // Error: enum entry cannot be used as a type
}
```

### `when` 표현식에서 enum 상수 사용 {id="use-enum-constants-in-when-expressions"}

각 상수를 개별적으로 처리하고자 할 때 enum 클래스는 `when` 표현식과 가장 잘 어울립니다.

```kotlin
enum class Color(val hex: String) {
    RED("#FF0000"),
    GREEN("#00FF00"),
    BLUE("#0000FF")
}

//sampleStart
fun describeColor(color: Color): String {
    return when (color) {
        Color.RED -> "Red is a warm color"
        Color.GREEN -> "Green is a natural color"
        Color.BLUE -> "Blue is a cool color"
    }
}

fun main() {
    println(describeColor(Color.RED))
    // Red is a warm color
}
//sampleEnd
```
{kotlin-runnable="true" id="enum-when-expression-kotlin"}

when 표현식에서 모든 enum 상수를 사용하면 `else` 브랜치가 필요하지 않습니다.

> Enum 항목으로 작업할 때 반복을 줄이려면 문맥 인식 해석(context-sensitive resolution, 현재 프리뷰 상태)을 시도해 보세요.
> 이 기능을 사용하면 `when` 표현식이나 타입이 지정된 변수에 할당할 때와 같이 예상되는 타입을 알 수 있는 경우 enum 클래스 이름을 생략할 수 있습니다.
>
> 자세한 정보는 [문맥 인식 해석 프리뷰(Preview of context-sensitive resolution)](whatsnew22.md#preview-of-context-sensitive-resolution) 또는 관련 [KEEP 제안](https://github.com/Kotlin/KEEP/blob/improved-resolution-expected-type/proposals/context-sensitive-resolution.md)을 참조하세요.
>
{style="tip"}

### Enum 상수 찾기 {id="find-enum-constants"}

때로는 문자열, 인덱스 또는 연관된 값 중 하나로부터 enum 상수를 가져와야 할 때가 있습니다. Kotlin은 이름, 위치 또는 커스텀 값을 통해 상수를 조회할 수 있는 내장 API를 제공합니다.

예를 들어, 각 색상에 연관된 RGB 값이 있는 enum 클래스를 가정해 보겠습니다. 이름으로 enum 상수를 찾으려면 `valueOf()` 함수를 사용합니다.

```kotlin
enum class Color(val rgb: Int) {
    RED(0xFF0000),
    GREEN(0x00FF00),
    BLUE(0x0000FF)
}

fun main() {
    val color = Color.valueOf("RED")

    println(color)
    // RED
}
```
{kotlin-runnable="true" id="find-enum-valueof-kotlin"}

`valueOf()`에 전달되는 이름은 enum 상수 이름과 정확히 일치해야 합니다. 지정된 이름의 enum 상수가 없으면 `valueOf()`는 `IllegalArgumentException`을 던집니다.

Enum 선언에서의 위치로 enum 상수를 찾으려면 enum의 `entries` 프로퍼티에서 [`getOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/get-or-null.html) 함수를 사용합니다.

```kotlin
enum class Color(val rgb: Int) {
    RED(0xFF0000),
    GREEN(0x00FF00),
    BLUE(0x0000FF)
}

//sampleStart
fun main() {
    val color = Color.entries.getOrNull(0)

    println(color)
    // RED
}
//sampleEnd
```
{kotlin-runnable="true" id="find-enum-getornull-kotlin"}

Enum 위치는 `0`부터 시작합니다. 이 예제에서 `RED`의 위치는 `0`, `GREEN`은 `1`, `BLUE`는 `2`입니다.

이는 파일이나 사용자 입력 등에서 enum 상수 위치를 나타내는 정수가 있을 때 유용합니다. 다른 일부 언어와 달리 Kotlin에서는 `Int`를 enum 상수로 직접 캐스팅할 수 없습니다. 대신 정수를 인덱스로 사용하고 `entries.getOrNull(index)`를 통해 상수를 조회하세요.

만약 해당 정수가 enum 상수의 순서를 바꾸더라도 안정적으로 유지되어야 하는 값을 나타낸다면, `rgb`나 `code`와 같이 명시적인 숫자 프로퍼티를 정의하고 일치하는 값을 가진 상수를 검색하세요.

`entries`는 특수화된 `List`이므로 표준 컬렉션 API를 사용할 수 있습니다. 예를 들어, 연관된 값으로 enum 상수를 찾으려면 [`first()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/first.html)를 사용하여 entries를 검색합니다.

```kotlin
enum class Color(val rgb: Int) {
    RED(0xFF0000),
    GREEN(0x00FF00),
    BLUE(0x0000FF)
}

//sampleStart
fun main() {
    val color = Color.entries.first { it.rgb == 0xFF0000 }

    println(color)
    // RED
}
//sampleEnd
```
{kotlin-runnable="true" id="find-enum-first-kotlin"}

일치하는 상수가 없으면 `first()` 함수는 `NoSuchElementException`을 던집니다. 대신 `null`을 얻으려면 [`firstOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/first-or-null.html)을 사용하세요.

Enum 상수의 개수를 가져오려면 [`size`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-list/size.html) 프로퍼티를 사용합니다. 예시:

```kotlin
enum class RGB { RED, GREEN, BLUE }

fun main() {
    println(RGB.entries)
    // [RED, GREEN, BLUE]
    println(RGB.entries.size)
    // 3
    println("The first color is: ${RGB.valueOf("RED")}")
    // "The first color is: RED"
}
```
{kotlin-runnable="true" id="rgb-enums-entries-kotlin"}

이름, 위치 또는 연관된 값으로 enum 상수를 자주 조회해야 하는 경우 [컴패니언 객체(companion object)](object-declarations.md#companion-objects)에 도우미 함수를 추가하세요.

```kotlin
enum class Color(val rgb: Int) {
    RED(0xFF0000),
    GREEN(0x00FF00),
    BLUE(0x0000FF);

    companion object {
        fun fromName(name: String): Color? =
            entries.find { it.name == name }

        fun fromPosition(position: Int): Color? =
            entries.getOrNull(position)

        fun fromRgb(rgb: Int): Color? =
            entries.find { it.rgb == rgb }
    }
}

fun main() {
    println(Color.fromName("RED"))
    // RED
    println(Color.fromPosition(1))
    // GREEN
    println(Color.fromRgb(0x0000FF))
    // BLUE
    println(Color.fromRgb(0xABCDEF))
    // null
}
```
{kotlin-runnable="true" id="find-enum-companion-object-kotlin"}

컴패니언 객체 도우미 함수는 예외를 던지는 대신 `null`을 반환하는 안전한 조회를 원할 때 유용합니다.

위에서 사용된 `entries` 및 `valueOf()`와 같은 조회 API는 _합성(synthetic)_ 멤버의 예입니다. 여기서 합성이란 사용자가 직접 선언하지 않더라도 Kotlin이 이러한 멤버를 자동으로 제공한다는 것을 의미합니다. 그렇기 때문에 모든 enum 클래스는 추가 코드를 작성하지 않고도 `entries` 프로퍼티로 상수를 나열하고 `valueOf()` 함수로 이름에 해당하는 상수를 가져올 수 있습니다.

[`enumEntries<T>()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.enums/enum-entries.html) 및 [`enumValueOf<T>()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/enum-value-of.html)와 같은 제네릭 도우미 함수를 사용하여 enum 클래스의 상수에 접근할 수 있습니다. 이러한 함수는 [실체화된 타입 파라미터(reified type parameters)](inline-functions.md#reified-type-parameters)를 사용합니다. 이러한 파라미터는 제네릭 인라인 함수 내에서 실제 enum 타입을 사용할 수 있도록 유지하므로, 도우미 함수가 enum 타입 `T`와 직접 작업할 수 있게 해줍니다.

| 함수 | 설명 |
|---|---|
| [`enumEntries<T>()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.enums/enum-entries.html) | (권장) enum 타입 `T`의 모든 enum 항목을 반환합니다. 매 호출마다 동일한 리스트를 반환합니다. |
| [`enumValues<T>()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/enum-values.html) | enum 타입 `T`의 모든 enum 항목이 포함된 배열을 반환합니다. `enumValues<T>()`를 호출할 때마다 새로운 배열이 생성됩니다. |
| [`enumValueOf<T>()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/enum-value-of.html) | 이름으로 단일 enum 항목을 반환하며, 일치하는 enum 항목이 없으면 `IllegalArgumentException`을 던집니다. |

예를 들면 다음과 같습니다:

```kotlin
import kotlin.enums.enumEntries

enum class RGB { RED, GREEN, BLUE }

inline fun <reified T : Enum<T>> printAllValues() {
    println(enumEntries<T>().joinToString { it.name })
}

inline fun <reified T : Enum<T>> findByName(name: String): T = enumValueOf<T>(name)

fun main() {
    printAllValues<RGB>()
    // RED, GREEN, BLUE
    println(findByName<RGB>("GREEN"))
    // GREEN
}
```
{kotlin-runnable="true" id="enum-reified-type-parameters-kotlin"}

인라인 함수와 실체화된 타입 파라미터에 대한 자세한 내용은 [인라인 함수(Inline functions)](inline-functions.md)를 참조하세요.

### Enum 상수 비교 및 정렬 {id="compare-and-sort-enum-constants"}

Enum 상수를 비교하려면 `==` [구조적 동등성(structural equality)](equality.md#structural-equality) 연산자를 사용합니다.

```kotlin
enum class Color(val hex: String) {
    RED("#FF0000"),
    GREEN("#00FF00"),
    BLUE("#0000FF")
}

//sampleStart
fun main() {
    val color = Color.RED

    println(color == Color.RED)
    // true
    println(color == Color.BLUE)
    // false
}
//sampleEnd
```
{kotlin-runnable="true" id="compare-enum-constants-kotlin"}

각 enum 상수는 싱글톤 객체처럼 동작하므로, enum 상수를 비교하면 두 값이 동일한 상수를 참조하는지 확인하게 됩니다.

모든 enum 클래스는 기본적으로 [`Comparable`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-comparable/index.html) 인터페이스를 구현하므로 enum 상수를 비교하고 정렬할 수 있습니다. 상수는 enum 선언에서의 위치(`ordinal` 값)에 따라 정렬되며, 이는 먼저 선언된 상수가 가장 작은 것으로 간주됨을 의미합니다.

```kotlin
enum class Priority {
    LOW, MEDIUM, HIGH
}

fun main() {
    println(Priority.LOW < Priority.HIGH)
    // true
    println(Priority.HIGH > Priority.MEDIUM)
    // true
}
```
{kotlin-runnable="true" id="compare-enum-comparable-kotlin"}

정렬도 동일한 선언 순서를 따릅니다. 예를 들어 `entries.sorted()`는 이름과 상관없이 상수가 선언된 순서대로 반환합니다.

```kotlin
enum class Priority {
    HIGH, LOW, MEDIUM
}

fun main() {
    println(Priority.entries.sorted())
    // [HIGH, LOW, MEDIUM]
}
```
{kotlin-runnable="true" id="sort-enum-declaration-order-kotlin"}

`Enum<T>` 클래스는 `compareTo()`, `equals()`, `hashCode()` 함수를 제공하며, 일반 클래스처럼 동작을 커스터마이즈하기 위해 이를 오버라이드할 수 없습니다. 비교는 항상 선언 순서를 따릅니다.

다른 순서가 필요한 경우에는 선언 순서에 의존하지 마세요. 대신 명시적인 프로퍼티를 정의하고 그 프로퍼티를 기준으로 정렬하세요. 예를 들어, 색상을 밝기순으로 정렬할 수 있습니다.

```kotlin
enum class Color(val brightness: Int) {
    RED(1),
    GREEN(3),
    BLUE(2)
}

fun main() {
    println(Color.entries.sortedBy { it.brightness })
    // [RED, BLUE, GREEN]
}
```
{kotlin-runnable="true" id="sort-enum-brightness-kotlin"}

자세한 내용은 [정렬(Ordering)](collection-ordering.md)을 참조하세요.

## Enum 클래스에 함수 추가 {id="add-functions-to-enum-classes"}

프로퍼티와 마찬가지로 enum 클래스에도 함수를 둘 수 있습니다. 모든 enum 상수가 공유하는 함수를 추가하거나, 프로퍼티와 결합하거나, 연산자 함수를 정의할 수 있습니다.

### 모든 상수가 공유하는 함수 추가 {id="add-functions-shared-by-all-constants"}

모든 enum 상수가 공유하는 동작을 추가하려면 enum 클래스 본문에 함수를 정의합니다. Enum 클래스에 멤버를 정의하는 경우 세미콜론으로 상수 정의와 멤버 정의를 구분합니다.

```kotlin
enum class Direction {
    NORTH, SOUTH, WEST, EAST;

    fun isVertical(): Boolean = this == NORTH || this == SOUTH
}

fun main() {
    println(Direction.NORTH.isVertical())
    // true
    println(Direction.EAST.isVertical())
    // false
}
```
{kotlin-runnable="true" id="enum-shared-function-kotlin"}

모든 enum 상수는 공유 함수를 호출할 수 있습니다. 함수 내부에서 `this`는 해당 함수를 호출한 enum 상수를 참조합니다.

생성자 프로퍼티와 함수를 결합하여 각 상수에 데이터를 연결하고 그 데이터를 사용하는 동작을 추가할 수 있습니다.

```kotlin
enum class Color(val hex: String) {
    RED("#FF0000"),
    GREEN("#00FF00"),
    BLUE("#0000FF");

    fun describe(): String = "$name has hex code $hex"
}

fun main() {
    println(Color.RED.describe())
    // RED has hex code #FF0000
}
```
{kotlin-runnable="true" id="enum-properties-functions-kotlin"}

여기서 각 상수는 자체 `hex` 값을 저장하며, 공유된 `describe()` 함수는 내장된 `name` 프로퍼티와 `hex` 프로퍼티를 모두 사용합니다.

### 연산자 함수 추가 {id="add-operator-functions"}

Enum 클래스는 [연산자 함수(operator functions)](operator-overloading.md)를 정의할 수도 있으므로 enum 상수를 연산자와 함께 사용할 수 있습니다. 예를 들어, `!` 연산자로 반대 방향을 반환하도록 `not()` 연산자 함수를 정의할 수 있습니다.

```kotlin
enum class Direction {
    NORTH, SOUTH, WEST, EAST;

    operator fun not(): Direction = when (this) {
        NORTH -> SOUTH
        SOUTH -> NORTH
        WEST -> EAST
        EAST -> WEST
    }
}

fun main() {
    println(!Direction.NORTH)
    // SOUTH
}
```
{kotlin-runnable="true" id="enum-operator-function-kotlin"}

## 익명 클래스 사용 {id="use-anonymous-classes"}

Enum 상수는 해당 메서드 및 기본 메서드를 오버라이딩하는 자체 익명 클래스를 선언할 수 있습니다. 익명 클래스를 사용할 때는 enum 상수 이름 바로 뒤에 클래스 본문을 작성하며, Kotlin은 enum 클래스를 슈퍼타입으로 추론합니다.

이는 enum 클래스에 추상 함수를 선언하고 각 상수가 자체 구현을 제공하도록 요구할 때 유용합니다. 각 상수는 자체 익명 클래스 내에서 추상 함수를 오버라이드합니다.

```kotlin
enum class ProtocolState {
    WAITING {
        override fun signal() = TALKING
    },

    TALKING {
        override fun signal() = WAITING
    };

    abstract fun signal(): ProtocolState
}

fun main() {
    var state = ProtocolState.WAITING

    println(state)
    // WAITING
    state = state.signal()
    println(state)
    // TALKING
}
```
{kotlin-runnable="true" id="enum-abstract-function-kotlin"}

여기서 각 상수는 추상 `signal()` 함수를 다르게 구현하므로, `signal()`을 호출하면 상수에 따라 서로 다른 다음 상태를 반환합니다.

Enum 상수가 싱글톤 객체처럼 동작하지만, enum 상수의 타입은 자체 익명 클래스가 아니라 enum 클래스 자체입니다. 따라서 익명 클래스 본문 내에 선언된 멤버에는 접근할 수 없습니다.

```kotlin
enum class ProtocolState {
    WAITING {
        val waitingMessage = "Waiting for a signal"
        override fun signal() = TALKING
    },

    TALKING {
        override fun signal() = WAITING
    };

    abstract fun signal(): ProtocolState
}

fun main() {
    println(ProtocolState.WAITING.waitingMessage)
    // Error: unresolved reference 'waitingMessage'
}
```

모든 상수에 대한 데이터나 동작을 외부에 공개하려면 enum 클래스 본문에 선언하고, 각 상수가 자체 구현을 필요로 하는 경우에는 추상 멤버를 사용하세요.

## Enum 클래스에서 인터페이스 구현 {id="implement-interfaces-in-enum-classes"}

Enum 클래스는 인터페이스를 구현할 수 있지만, 다른 클래스를 상속받을 수는 없습니다. 모든 enum 상수에 대해 인터페이스 멤버의 공통 구현을 제공하거나, 각 상수가 익명 클래스에서 자체 구현을 제공하도록 할 수 있습니다.

인터페이스를 구현하려면 enum 클래스 선언에 추가하세요.

```kotlin
import java.util.function.BinaryOperator
import java.util.function.IntBinaryOperator

//sampleStart
enum class IntArithmetics : BinaryOperator<Int>, IntBinaryOperator {
    PLUS {
        override fun apply(t: Int, u: Int): Int = t + u
    },
    TIMES {
        override fun apply(t: Int, u: Int): Int = t * u
    };
    
    override fun applyAsInt(t: Int, u: Int) = apply(t, u)
}
//sampleEnd

fun main() {
    val a = 13
    val b = 31
    for (f in IntArithmetics.entries) {
        println("$f($a, $b) = ${f.apply(a, b)}")
    }
}
```
{kotlin-runnable="true" id="implement-interfaces-enum-kotlin"}

이 예제에서 `IntArithmetics` enum 클래스는 enum 클래스 선언부에서 `BinaryOperator<Int>`와 `IntBinaryOperator` 두 인터페이스를 구현합니다. 각 상수는 `PLUS`와 `TIMES`가 `apply()`에 대해 수행하는 것처럼 자체 익명 클래스 본문 내에서 인터페이스 멤버를 오버라이드할 수 있으며, `applyAsInt()`는 모든 상수에 대한 공유 구현을 제공합니다.