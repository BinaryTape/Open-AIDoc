[//]: # (title: 코딩 컨벤션)

어떤 프로그래밍 언어든 공통적으로 알려져 있고 따르기 쉬운 코딩 컨벤션(Coding conventions)은 필수적입니다.
이 문서에서는 코틀린(Kotlin)을 사용하는 프로젝트를 위한 코드 스타일 및 코드 구성 지침을 제공합니다.

## IDE에서 스타일 설정하기

코틀린에서 가장 인기 있는 두 가지 IDE인 [IntelliJ IDEA](https://www.jetbrains.com/idea/)와 [Android Studio](https://developer.android.com/studio/)는 코드 스타일링을 위한 강력한 지원을 제공합니다. 주어진 코드 스타일에 맞춰 코드가 자동으로 포맷팅되도록 설정할 수 있습니다.

### 스타일 가이드 적용하기

1. **Settings/Preferences | Editor | Code Style | Kotlin**으로 이동합니다.
2. **Set from...**을 클릭합니다.
3. **Kotlin style guide**를 선택합니다.

### 코드가 스타일 가이드를 따르는지 확인하기

1. **Settings/Preferences | Editor | Inspections | General**로 이동합니다.
2. **Incorrect formatting** 검사(Inspection)를 켭니다.
스타일 가이드에 설명된 다른 문제(명명 규칙 등)를 확인하는 추가 검사들은 기본적으로 활성화되어 있습니다.

<!-- 가이드가 이동되면 외부 링크로 교체 -->

자세한 정보는 [IntelliJ IDEA에서 코틀린 코드 스타일로 마이그레이션하기](code-style-migration-guide.md) 가이드를 참조하세요.

## 소스 코드 구성

### 디렉터리 구조

순수 코틀린 프로젝트에서 권장되는 디렉터리 구조는 공통 루트 패키지가 생략된 패키지 구조를 따릅니다. 예를 들어, 프로젝트의 모든 코드가 `org.example.kotlin` 패키지와 그 하위 패키지에 있다면, `org.example.kotlin` 패키지의 파일들은 소스 루트(source root) 바로 아래에 두어야 하며, `org.example.kotlin.network.socket`의 파일들은 소스 루트의 `network/socket` 하위 디렉터리에 있어야 합니다.

> **JVM 환경:** 코틀린을 자바와 함께 사용하는 프로젝트에서 코틀린 소스 파일은 자바 소스 파일과 동일한 소스 루트에 있어야 하며, 동일한 디렉터리 구조를 따라야 합니다. 즉, 각 파일은 각 패키지 선언에 해당하는 디렉터리에 저장되어야 합니다.
>
{style="note"}

### 소스 파일 이름

코틀린 파일에 단일 클래스나 인터페이스(관련된 최상위 선언이 포함될 수 있음)만 포함되어 있다면, 파일 이름은 클래스 이름과 동일하게 하고 `.kt` 확장자를 붙여야 합니다. 이는 모든 유형의 클래스와 인터페이스에 적용됩니다.
파일에 여러 클래스가 포함되어 있거나 최상위 선언만 있는 경우, 파일의 내용을 설명하는 이름을 선택하고 그에 따라 이름을 지정하세요.
각 단어의 첫 글자를 대문자로 하는 [파스칼 케이스(Upper camel case)](https://en.wikipedia.org/wiki/Camel_case)를 사용하세요.
예를 들어, `ProcessDeclarations.kt`와 같이 작성합니다.

파일 이름은 파일 안의 코드가 무엇을 하는지 설명해야 합니다. 따라서 파일 이름에 `Util`과 같이 의미 없는 단어를 사용하는 것은 피해야 합니다.

#### 멀티플랫폼 프로젝트

멀티플랫폼 프로젝트에서 플랫폼별 소스 세트(source set)에 있는 최상위 선언 파일은 소스 세트의 이름과 연관된 접미사를 가져야 합니다. 예:

* **jvm**Main/kotlin/Platform.**jvm**.kt
* **android**Main/kotlin/Platform.**android**.kt
* **ios**Main/kotlin/Platform.**ios**.kt

공통 소스 세트(common source set)의 경우, 최상위 선언이 있는 파일에 접미사를 붙이지 않습니다. 예: `commonMain/kotlin/Platform.kt`.

##### 기술적 세부 사항 {initial-collapse-state="collapsed" collapsible="true"}

JVM의 제한 사항 때문에 멀티플랫폼 프로젝트에서 이 파일 명명 체계를 따르는 것을 권장합니다. JVM은 최상위 멤버(함수, 프로퍼티)를 허용하지 않습니다.

이를 해결하기 위해 코틀린 JVM 컴파일러는 최상위 멤버 선언을 포함하는 래퍼 클래스(소위 "파일 파사드(file facades)")를 생성합니다. 파일 파사드는 파일 이름에서 유래된 내부 이름을 가집니다.

반면, JVM은 동일한 정규화된 이름(FQN, Fully Qualified Name)을 가진 여러 클래스를 허용하지 않습니다. 이로 인해 코틀린 프로젝트가 JVM으로 컴파일되지 않는 상황이 발생할 수 있습니다.

```none
root
|- commonMain/kotlin/myPackage/Platform.kt // 'fun count() { }' 포함
|- jvmMain/kotlin/myPackage/Platform.kt // 'fun multiply() { }' 포함
```

위의 경우 두 `Platform.kt` 파일이 동일한 패키지에 있으므로, 코틀린 JVM 컴파일러는 둘 다 FQN이 `myPackage.PlatformKt`인 두 개의 파일 파사드를 생성합니다. 이는 "Duplicate JVM classes" 오류를 발생시킵니다.

이를 피하는 가장 간단한 방법은 위의 지침에 따라 파일 중 하나의 이름을 바꾸는 것입니다. 이 명명 체계는 코드 가독성을 유지하면서 충돌을 피하는 데 도움이 됩니다.

> 다음 두 가지 시나리오에서는 이러한 권장 사항이 불필요해 보일 수 있지만, 여전히 따르는 것이 좋습니다.
> 
> * JVM이 아닌 플랫폼은 파일 파사드 중복 문제가 없습니다. 하지만 이 명명 체계는 파일 명명을 일관되게 유지하는 데 도움이 됩니다.
> * JVM에서 소스 파일에 최상위 선언이 없으면 파일 파사드가 생성되지 않으므로 명명 충돌이 발생하지 않습니다.
> 
> 그러나 이 명명 체계를 사용하면 간단한 리팩터링이나 추가 작업으로 최상위 함수가 포함될 때 발생할 수 있는 "Duplicate JVM classes" 오류 상황을 미연에 방지할 수 있습니다.
> 
{style="tip"}

### 소스 파일 구성

여러 선언(클래스, 최상위 함수 또는 프로퍼티)이 의미적으로 서로 밀접하게 관련되어 있고 파일 크기가 적절한 수준(수백 줄을 넘지 않음)이라면, 이를 동일한 코틀린 소스 파일에 배치하는 것이 권장됩니다.

특히, 해당 클래스의 모든 클라이언트와 관련된 확장 함수를 정의할 때는 클래스 자체와 같은 파일에 넣으세요. 특정 클라이언트에만 의미가 있는 확장 함수를 정의할 때는 해당 클라이언트의 코드 옆에 두세요. 단순히 특정 클래스의 모든 확장 함수를 담기 위해 파일을 만드는 것은 피하세요.

### 클래스 레이아웃

클래스의 내용은 다음 순서대로 배치해야 합니다.

1. 프로퍼티 선언 및 초기화 블록
2. 보조 생성자(Secondary constructors)
3. 메서드 선언
4. 컴패니언 객체(Companion object)

메서드 선언을 알파벳순이나 가시성(visibility) 순으로 정렬하지 마세요. 또한 일반 메서드와 확장 메서드를 분리하지 마세요. 대신 관련된 것끼리 모아서 클래스를 위에서 아래로 읽는 사람이 로직의 흐름을 따라갈 수 있도록 하세요. 순서(상위 수준의 내용을 먼저 둘지, 그 반대로 할지)를 정하고 이를 고수하세요.

중첩 클래스(Nested classes)는 해당 클래스를 사용하는 코드 옆에 두세요. 클래스가 외부에서 사용되도록 설계되었고 클래스 내부에서 참조되지 않는다면, 컴패니언 객체 뒤인 맨 마지막에 두세요.

### 인터페이스 구현 레이아웃

인터페이스를 구현할 때는 구현하는 멤버들을 인터페이스의 멤버 순서와 동일하게 유지하세요(필요한 경우 구현에 사용되는 추가적인 private 메서드를 사이에 넣을 수 있습니다).

### 오버로드 레이아웃

클래스 내에서 오버로드(Overload)된 메서드들은 항상 서로 옆에 두세요.

## 명명 규칙

코틀린의 패키지 및 클래스 명명 규칙은 매우 간단합니다.

* 패키지 이름은 항상 소문자이며 언더스코어(`_`)를 사용하지 않습니다(`org.example.project`). 여러 단어로 된 이름을 사용하는 것은 일반적으로 권장되지 않지만, 여러 단어를 사용해야 하는 경우 단순히 단어들을 이어 붙이거나 카멜 케이스(camel case)를 사용할 수 있습니다(`org.example.myProject`).

* 클래스와 객체의 이름은 파스칼 케이스(Upper camel case)를 사용합니다.

```kotlin
open class DeclarationProcessor { /*...*/ }

object EmptyDeclarationProcessor : DeclarationProcessor() { /*...*/ }
```

### 함수 이름
 
함수, 프로퍼티, 지역 변수의 이름은 소문자로 시작하고 언더스코어 없이 카멜 케이스(camel case)를 사용합니다.

```kotlin
fun processDeclarations() { /*...*/ }
var declarationCount = 1
```

예외: 클래스의 인스턴스를 생성하는 데 사용되는 팩토리 함수는 추상 반환 타입과 동일한 이름을 가질 수 있습니다.

```kotlin
interface Foo { /*...*/ }

class FooImpl : Foo { /*...*/ }

fun Foo(): Foo { return FooImpl() }
```

### 테스트 메서드 이름

테스트에서만(**오직** 테스트에서만), 백틱(backticks)으로 감싼 공백이 포함된 메서드 이름을 사용할 수 있습니다. 이러한 메서드 이름은 안드로이드 런타임 API 레벨 30부터 지원됩니다. 테스트 코드에서는 메서드 이름에 언더스코어를 사용하는 것도 허용됩니다.

```kotlin
class MyTestCase {
    @Test fun `ensure everything works`() { /*...*/ }

    @Test fun ensureEverythingWorks_onAndroid() { /*...*/ }
}
```

### 프로퍼티 이름

상수(`const`로 표시된 프로퍼티, 또는 커스텀 `get` 함수가 없고 불변 데이터를 보관하는 최상위 또는 객체의 `val` 프로퍼티)의 이름은 [스크리밍 스네이크 케이스(Screaming snake case)](https://en.wikipedia.org/wiki/Snake_case) 컨벤션에 따라 대문자와 언더스코어로 구분하여 작성해야 합니다.

```kotlin
const val MAX_COUNT = 8
val USER_NAME_FIELD = "UserName"
```

동작을 가진 객체나 가변 데이터를 보관하는 최상위 또는 객체 프로퍼티의 이름은 카멜 케이스를 사용해야 합니다.

```kotlin
val mutableCollection: MutableSet<String> = HashSet()
```

싱글톤 객체에 대한 참조를 보관하는 프로퍼티의 이름은 `object` 선언과 동일한 명명 스타일을 사용할 수 있습니다.

```kotlin
val PersonComparator: Comparator<Person> = /*...*/
```

열거형(Enum) 상수의 경우, 사용 사례에 따라 대문자와 언더스코어로 구분된 이름([스크리밍 스네이크 케이스](https://en.wikipedia.org/wiki/Snake_case))을 사용(`enum class Color { RED, GREEN }`)하거나 파스칼 케이스(Upper camel case) 이름을 사용하는 것 모두 괜찮습니다.
   
### 뒷받침하는 프로퍼티(Backing properties) 이름

클래스에 개념적으로는 동일하지만 하나는 공개 API의 일부이고 다른 하나는 구현 세부 사항인 두 개의 프로퍼티가 있는 경우, private 프로퍼티의 이름 접두사로 언더스코어를 사용하세요.

```kotlin
class C {
    private val _elementList = mutableListOf<Element>()

    val elementList: List<Element>
        get() = _elementList
}
```

### 좋은 이름 선택하기

클래스의 이름은 보통 클래스가 무엇인지를 설명하는 명사나 명사구여야 합니다: `List`, `PersonReader`.

메서드의 이름은 보통 메서드가 무엇을 하는지를 나타내는 동사나 동사구여야 합니다: `close`, `readPersons`.
또한 메서드 이름은 해당 메서드가 객체를 직접 수정(mutating)하는지 아니면 새로운 객체를 반환하는지를 암시해야 합니다. 예를 들어 `sort`는 컬렉션을 제자리에서 정렬하지만, `sorted`는 컬렉션의 정렬된 복사본을 반환합니다.

이름은 해당 엔티티의 목적을 명확히 해야 하므로, 이름에 `Manager`, `Wrapper`와 같이 의미 없는 단어를 사용하는 것은 피하는 것이 좋습니다.

약어(Acronym)를 선언 이름의 일부로 사용할 때 다음 규칙을 따르세요.

* 두 글자로 된 약어는 두 글자 모두 대문자를 사용합니다(예: `IOStream`).
* 두 글자보다 긴 약어는 첫 글자만 대문자로 합니다(예: `XmlFormatter`, `HttpInputStream`).

## 포맷팅

### 들여쓰기

들여쓰기에는 4개의 공백(spaces)을 사용하세요. 탭(tabs)은 사용하지 마세요.

중괄호의 경우, 여는 중괄호는 구문이 시작되는 줄의 끝에 두고, 닫는 중괄호는 여는 구문과 수평으로 맞춰 별도의 줄에 둡니다.

```kotlin
if (elements != null) {
    for (element in elements) {
        // ...
    }
}
```

> 코틀린에서 세미콜론은 선택 사항이므로 줄바꿈이 중요합니다. 언어 디자인은 자바 스타일의 중괄호를 가정하고 있으며, 다른 포맷팅 스타일을 사용하려고 하면 예기치 않은 동작이 발생할 수 있습니다.
>
{style="note"}

### 가로 공백

* 이항 연산자(`a + b`) 주위에 공백을 둡니다. 예외: 범위 연산자(`0..i`) 주위에는 공백을 두지 않습니다.
* 단항 연산자(`a++`) 주위에는 공백을 두지 않습니다.
* 제어 흐름 키워드(`if`, `when`, `for`, `while`)와 그 뒤에 오는 여는 괄호 사이에 공백을 둡니다.
* 주 생성자 선언, 메서드 선언 또는 메서드 호출에서 여는 괄호 앞에 공백을 두지 않습니다.

```kotlin
class A(val x: Int)

fun foo(x: Int) { ... }

fun bar() {
    foo(1)
}
```

* `(`, `[` 뒤나 `]`, `)` 앞에 절대로 공백을 두지 않습니다.
* `.` 또는 `?.` 주위에 절대로 공백을 두지 않습니다: `foo.bar().filter { it > 2 }.joinToString()`, `foo?.bar()`.
* `//` 뒤에 공백을 둡니다: `// 이것은 주석입니다`.
* 타입 파라미터를 지정하는 데 사용되는 꺽쇠 괄호 주위에 공백을 두지 않습니다: `class Map<K, V> { ... }`.
* `::` 주위에 공백을 두지 않습니다: `Foo::class`, `String::length`.
* 널 허용 타입(nullable type)을 표시하는 `?` 앞에 공백을 두지 않습니다: `String?`.

일반적인 규칙으로, 어떤 종류의 수평 정렬(horizontal alignment)도 피하세요. 식별자의 이름을 다른 길이의 이름으로 바꾸는 것이 선언이나 사용처의 포맷팅에 영향을 주어서는 안 됩니다.

### 콜론

다음 시나리오에서는 `:` 앞에 공백을 둡니다.

* 타입과 슈퍼타입을 구분할 때.
* 슈퍼클래스 생성자 또는 동일한 클래스의 다른 생성자로 위임할 때.
* `object` 키워드 뒤.
    
선언과 타입을 구분할 때는 `:` 앞에 공백을 두지 않습니다.
 
`:` 뒤에는 항상 공백을 둡니다.

```kotlin
abstract class Foo<out T : Any> : IFoo {
    abstract fun foo(a: Int): T
}

class FooImpl : Foo() {
    constructor(x: String) : this(x) { /*...*/ }

    val x = object : IFoo { /*...*/ } 
}
```

### 클래스 헤더

주 생성자 파라미터가 적은 클래스는 한 줄로 작성할 수 있습니다.

```kotlin
class Person(id: Int, name: String)
```

헤더가 긴 클래스는 각 주 생성자 파라미터가 들여쓰기와 함께 별도의 줄에 오도록 포맷팅해야 합니다. 또한 닫는 괄호는 새 줄에 두어야 합니다. 상속을 사용하는 경우, 슈퍼클래스 생성자 호출이나 구현된 인터페이스 목록은 닫는 괄호와 같은 줄에 두어야 합니다.

```kotlin
class Person(
    id: Int,
    name: String,
    surname: String
) : Human(id, name) { /*...*/ }
```

인터페이스가 여러 개인 경우, 슈퍼클래스 생성자 호출을 먼저 배치한 다음 각 인터페이스를 다른 줄에 배치해야 합니다.

```kotlin
class Person(
    id: Int,
    name: String,
    surname: String
) : Human(id, name),
    KotlinMaker { /*...*/ }
```

상위 타입 목록이 긴 클래스의 경우, 콜론 뒤에 줄바꿈을 하고 모든 상위 타입 이름을 수평으로 맞춥니다.

```kotlin
class MyFavouriteVeryLongClassHolder :
    MyLongHolder<MyFavouriteVeryLongClass>(),
    SomeOtherInterface,
    AndAnotherOne {

    fun foo() { /*...*/ }
}
```

클래스 헤더가 길 때 헤더와 본문을 명확하게 구분하려면 클래스 헤더 뒤에 빈 줄을 두거나(위의 예시처럼), 여는 중괄호를 별도의 줄에 둡니다.

```kotlin
class MyFavouriteVeryLongClassHolder :
    MyLongHolder<MyFavouriteVeryLongClass>(),
    SomeOtherInterface,
    AndAnotherOne 
{
    fun foo() { /*...*/ }
}
```

생성자 파라미터에는 일반 들여쓰기(공백 4칸)를 사용하세요. 이렇게 하면 주 생성자에서 선언된 프로퍼티가 클래스 본문에 선언된 프로퍼티와 동일한 들여쓰기를 갖게 됩니다.

### 수정자(Modifiers) 순서

선언에 여러 수정자가 있는 경우 항상 다음 순서대로 배치하세요.

```kotlin
public / protected / private / internal
expect / actual
final / open / abstract / sealed / const
external
override
lateinit
tailrec
vararg
suspend
inner
enum / annotation / fun // `fun interface`에서 수정자로 사용될 때 
companion
inline / value
infix
operator
data
```

모든 어노테이션은 수정자 앞에 둡니다.

```kotlin
@Named("Foo")
private val foo: Foo
```

라이브러리를 작업하는 것이 아니라면 불필요한 수정자(예: `public`)는 생략하세요.

### 어노테이션

어노테이션은 해당 어노테이션이 붙는 선언 앞의 별도 줄에 배치하며, 동일한 들여쓰기를 사용합니다.

```kotlin
@Target(AnnotationTarget.PROPERTY)
annotation class JsonExclude
```

인수가 없는 어노테이션은 같은 줄에 배치할 수 있습니다.

```kotlin
@JsonExclude @JvmField
var x: String
```

인수가 없는 단일 어노테이션은 해당 선언과 같은 줄에 배치할 수 있습니다.

```kotlin
@Test fun foo() { /*...*/ }
```

### 파일 어노테이션

파일 어노테이션은 파일 주석(있는 경우) 뒤, `package` 문 앞에 배치하며, 패키지가 아닌 파일을 대상으로 한다는 점을 강조하기 위해 `package`와 빈 줄로 구분합니다.

```kotlin
/** 라이선스, 저작권 등등 */
@file:JvmName("FooBar")

package foo.bar
```

### 함수

함수 시그니처가 한 줄에 맞지 않으면 다음 구문을 사용하세요.

```kotlin
fun longMethodName(
    argument: ArgumentType = defaultValue,
    argument2: AnotherArgumentType,
): ReturnType {
    // 본문
}
```

함수 파라미터에는 일반 들여쓰기(공백 4칸)를 사용하세요. 이는 생성자 파라미터와의 일관성을 유지하는 데 도움이 됩니다.

본문이 단일 표현식으로 구성된 함수의 경우 표현식 본문(expression body)을 사용하는 것이 좋습니다.

```kotlin
fun foo(): Int {     // 나쁨
    return 1 
}

fun foo() = 1        // 좋음
```

### 표현식 본문(Expression bodies)

함수가 표현식 본문을 가지고 있고, 그 첫 번째 줄이 선언과 같은 줄에 맞지 않는 경우, `=` 기호를 첫 줄에 두고 표현식 본문을 4칸 들여쓰기 하세요.

```kotlin
fun f(x: String, y: String, z: String) =
    veryLongFunctionCallWithManyWords(andLongParametersToo(), x, y, z)
```

### 프로퍼티

매우 간단한 읽기 전용 프로퍼티의 경우 한 줄 포맷팅을 고려하세요.

```kotlin
val isEmpty: Boolean get() = size == 0
```

더 복잡한 프로퍼티의 경우 항상 `get` 및 `set` 키워드를 별도의 줄에 둡니다.

```kotlin
val foo: String
    get() { /*...*/ }
```

초기화 식(initializer)이 있는 프로퍼티의 경우, 초기화 식이 길면 `=` 기호 뒤에 줄바꿈을 하고 초기화 식을 4칸 들여쓰기 하세요.

```kotlin
private val defaultCharset: Charset? =
    EncodingRegistry.getInstance().getDefaultCharsetForPropertiesFiles(file)
```

### 제어 흐름 문

`if` 또는 `when` 문의 조건이 여러 줄인 경우, 항상 문의 본문 주위에 중괄호를 사용하세요. 조건의 각 후속 줄은 문 시작 부분을 기준으로 4칸 들여쓰기 하세요. 조건의 닫는 괄호와 여는 중괄호를 별도의 줄에 함께 두세요.

```kotlin
if (!component.isSyncing &&
    !hasAnyKotlinRuntimeInScope(module)
) {
    return createKotlinNotConfiguredPanel(module)
}
```

이렇게 하면 조건과 문 본문을 정렬하는 데 도움이 됩니다. 

`else`, `catch`, `finally` 키워드와 `do-while` 루프의 `while` 키워드는 이전 중괄호와 같은 줄에 둡니다.

```kotlin
if (condition) {
    // 본문
} else {
    // else 부분
}

try {
    // 본문
} finally {
    // 정리 코드
}
```

`when` 문에서 분기(branch)가 한 줄보다 길면, 인접한 케이스 블록과 빈 줄로 구분하는 것을 고려하세요.

```kotlin
private fun parsePropertyValue(propName: String, token: Token) {
    when (token) {
        is Token.ValueToken ->
            callback.visitValue(propName, token.value)

        Token.LBRACE -> { // ...
        }
    }
}
```

짧은 분기는 중괄호 없이 조건과 같은 줄에 둡니다.

```kotlin
when (foo) {
    true -> bar() // 좋음
    false -> { baz() } // 나쁨
}
```

### 메서드 호출

인수 목록이 길면 여는 괄호 뒤에 줄바꿈을 합니다. 인수는 4칸 들여쓰기 합니다. 밀접하게 관련된 여러 인수는 같은 줄에 묶어서 배치합니다.

```kotlin
drawSquare(
    x = 10, y = 10,
    width = 100, height = 100,
    fill = true
)
```

인수 이름과 값 사이의 `=` 기호 주위에 공백을 둡니다.

### 체이닝 호출(Chained calls) 래핑

체이닝 호출을 래핑할 때, `.` 문자나 `?.` 연산자를 다음 줄에 두고 한 번의 들여쓰기를 적용합니다.

```kotlin
val anchor = owner
    ?.firstChild!!
    .siblings(forward = true)
    .dropWhile { it is PsiComment || it is PsiWhiteSpace }
```

체인의 첫 번째 호출 앞에는 보통 줄바꿈을 하지만, 코드가 그렇게 하는 것이 더 합리적이라면 생략해도 무방합니다.

### 람다(Lambdas)

람다 표현식에서 중괄호 주위와 파라미터와 본문을 구분하는 화살표 주위에 공백을 사용해야 합니다. 호출 시 단일 람다를 인수로 받는 경우 가능하면 괄호 밖으로 전달하세요.

```kotlin
list.filter { it > 10 }
```

람다에 레이블을 지정하는 경우 레이블과 여는 중괄호 사이에 공백을 두지 마세요.

```kotlin
fun foo() {
    ints.forEach lit@{
        // ...
    }
}
```

여러 줄 람다에서 파라미터 이름을 선언할 때, 이름을 첫 줄에 두고 그 뒤에 화살표와 줄바꿈을 둡니다.

```kotlin
appendCommaSeparated(properties) { prop ->
    val propertyValue = prop.get(obj)  // ...
}
```

파라미터 목록이 한 줄에 담기에 너무 길면 화살표를 별도의 줄에 둡니다.

```kotlin
foo {
    context: Context,
    environment: Env
    ->
    context.configureEnv(environment)
}
```

### 후행 쉼표(Trailing commas)

후행 쉼표란 일련의 요소 중 마지막 항목 뒤에 오는 쉼표 기호입니다.

```kotlin
class Person(
    val firstName: String,
    val lastName: String,
    val age: Int, // 후행 쉼표
)
```

후행 쉼표를 사용하면 몇 가지 장점이 있습니다.

* 버전 관리의 diff(차이점)를 더 깔끔하게 만듭니다 – 모든 초점이 변경된 값에만 맞춰집니다.
* 요소를 추가하거나 순서를 바꾸기 쉽습니다 – 요소를 조작할 때 쉼표를 추가하거나 삭제할 필요가 없습니다.
* 객체 초기화 식과 같은 코드 생성을 단순화합니다. 마지막 요소에도 쉼표가 올 수 있기 때문입니다.

후행 쉼표는 전적으로 선택 사항입니다 – 코드에 없어도 정상적으로 작동합니다. 코틀린 스타일 가이드는 선언부에서 후행 쉼표를 사용하는 것을 권장하며, 호출부에서는 사용자의 판단에 맡깁니다.

IntelliJ IDEA 포맷터에서 후행 쉼표를 활성화하려면 **Settings/Preferences | Editor | Code Style | Kotlin**으로 이동하여 **Other** 탭을 열고 **Use trailing comma** 옵션을 선택하세요.

#### 열거형(Enumerations) {initial-collapse-state="collapsed" collapsible="true"}

```kotlin
enum class Direction {
    NORTH,
    SOUTH,
    WEST,
    EAST, // 후행 쉼표
}
```

#### 값 인수(Value arguments) {initial-collapse-state="collapsed" collapsible="true"}

```kotlin
fun shift(x: Int, y: Int) { /*...*/ }
shift(
    25,
    20, // 후행 쉼표
)
val colors = listOf(
    "red",
    "green",
    "blue", // 후행 쉼표
)
```

#### 클래스 프로퍼티 및 파라미터 {initial-collapse-state="collapsed" collapsible="true"}

```kotlin
class Customer(
    val name: String,
    val lastName: String, // 후행 쉼표
)
class Customer(
    val name: String,
    lastName: String, // 후행 쉼표
)
```

#### 함수 값 파라미터 {initial-collapse-state="collapsed" collapsible="true"}

```kotlin
fun powerOf(
    number: Int, 
    exponent: Int, // 후행 쉼표
) { /*...*/ }
constructor(
    x: Comparable<Number>,
    y: Iterable<Number>, // 후행 쉼표
) {}
fun print(
    vararg quantity: Int,
    description: String, // 후행 쉼표
) {}
```

#### 타입이 선택적인 파라미터 (세터 포함) {initial-collapse-state="collapsed" collapsible="true"}

```kotlin
val sum: (Int, Int, Int) -> Int = fun(
    x,
    y,
    z, // 후행 쉼표
): Int {
    return x + y + x
}
println(sum(8, 8, 8))
```

#### 인덱싱 접미사(Indexing suffix) {initial-collapse-state="collapsed" collapsible="true"}

```kotlin
class Surface {
    operator fun get(x: Int, y: Int) = 2 * x + 4 * y - 10
}
fun getZValue(mySurface: Surface, xValue: Int, yValue: Int) =
    mySurface[
        xValue,
        yValue, // 후행 쉼표
    ]
```

#### 람다 내 파라미터 {initial-collapse-state="collapsed" collapsible="true"}

```kotlin
fun main() {
    val x = {
            x: Comparable<Number>,
            y: Iterable<Number>, // 후행 쉼표
        ->
        println("1")
    }
    println(x)
}
```

#### when 엔트리 {initial-collapse-state="collapsed" collapsible="true"}

```kotlin
fun isReferenceApplicable(myReference: `KClass<*>`) = when (myReference) {
    Comparable::class,
    Iterable::class,
    String::class, // 후행 쉼표
        -> true
    else -> false
}
```

#### 컬렉션 리터럴 (어노테이션 내) {initial-collapse-state="collapsed" collapsible="true"}

```kotlin
annotation class ApplicableFor(val services: Array<String>)
@ApplicableFor([
    "serializer",
    "balancer",
    "database",
    "inMemoryCache", // 후행 쉼표
])
fun run() {}
```

#### 타입 인수(Type arguments) {initial-collapse-state="collapsed" collapsible="true"}

```kotlin
fun <T1, T2> foo() {}
fun main() {
    foo<
            Comparable<Number>,
            Iterable<Number>, // 후행 쉼표
            >()
}
```

#### 타입 파라미터(Type parameters) {initial-collapse-state="collapsed" collapsible="true"}

```kotlin
class MyMap<
        MyKey,
        MyValue, // 후행 쉼표
        > {}
```

#### 구조 분해 선언(Destructuring declarations) {initial-collapse-state="collapsed" collapsible="true"}

```kotlin
data class Car(val manufacturer: String, val model: String, val year: Int)
val myCar = Car("Tesla", "Y", 2019)
val (
    manufacturer,
    model,
    year, // 후행 쉼표
) = myCar
val cars = listOf<Car>()
fun printMeanValue() {
    var meanValue: Int = 0
    for ((
        _,
        _,
        year, // 후행 쉼표
    ) in cars) {
        meanValue += year
    }
    println(meanValue/cars.size)
}
printMeanValue()
```

## 문서 주석(Documentation comments)

더 긴 문서 주석의 경우, 여는 `/**`를 별도의 줄에 두고 이후의 각 줄은 별표(*)로 시작하세요.

```kotlin
/**
 * 이것은 여러 줄로 구성된
 * 문서 주석입니다.
 */
```

짧은 주석은 한 줄에 배치할 수 있습니다.

```kotlin
/** 이것은 짧은 문서 주석입니다. */
```

일반적으로 `@param` 및 `@return` 태그의 사용은 피하세요. 대신 파라미터와 반환 값에 대한 설명을 문서 주석에 직접 통합하고, 언급되는 파라미터에는 링크를 추가하세요. 본문의 흐름에 맞지 않는 긴 설명이 필요한 경우에만 `@param` 및 `@return`을 사용하세요.

```kotlin
// 이렇게 하지 마세요:

/**
 * 주어진 숫자의 절대값을 반환합니다.
 * @param number 절대값을 반환할 숫자.
 * @return 절대값.
 */
fun abs(number: Int): Int { /*...*/ }

// 대신 이렇게 하세요:

/**
 * 주어진 [number]의 절대값을 반환합니다.
 */
fun abs(number: Int): Int { /*...*/ }
```

## 불필요한 구문 피하기

일반적으로 코틀린에서 특정 구문이 선택 사항이고 IDE가 불필요하다고 강조하는 경우 코드에서 생략해야 합니다. 단지 "명확성을 위해" 불필요한 구문을 코드에 남겨두지 마세요.

### Unit 반환 타입

함수가 Unit을 반환하는 경우 반환 타입을 생략해야 합니다.

```kotlin
fun foo() { // 여기서 ": Unit"은 생략됨

}
```

### 세미콜론

가능한 한 세미콜론을 생략하세요.

### 문자열 템플릿

문자열 템플릿에 단순 변수를 삽입할 때 중괄호를 사용하지 마세요. 더 긴 표현식에만 중괄호를 사용하세요.

```kotlin
println("$name has ${children.size} children")
```

달러 기호(`$`) 문자를 문자열 리터럴로 취급하려면 [멀티 달러 문자열 보간(Multi-dollar string interpolation)](strings.md#multi-dollar-string-interpolation)을 사용하세요:

```kotlin
val `KClass<*>`.jsonSchema : String
    get() = $"""
        {
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "$id": "https://example.com/product.schema.json",
            "$dynamicAnchor": "meta",
            "title": "${simpleName ?: qualifiedName ?: "unknown"}",
            "type": "object"
        }
        """
```

## 언어 기능의 관용적 사용

### 불변성(Immutability)

가변 데이터보다는 불변 데이터를 사용하는 것을 권장합니다. 지역 변수와 프로퍼티는 초기화 후 수정되지 않는다면 항상 `var` 대신 `val`로 선언하세요.

수정되지 않는 컬렉션을 선언할 때는 항상 불변 컬렉션 인터페이스(`Collection`, `List`, `Set`, `Map`)를 사용하세요. 팩토리 함수를 사용하여 컬렉션 인스턴스를 생성할 때는 가능하면 항상 불변 컬렉션 타입을 반환하는 함수를 사용하세요.

```kotlin
// 나쁨: 변경되지 않을 값에 가변 컬렉션 타입을 사용함
fun validateValue(actualValue: String, allowedValues: HashSet<String>) { ... }

// 좋음: 대신 불변 컬렉션 타입을 사용함
fun validateValue(actualValue: String, allowedValues: Set<String>) { ... }

// 나쁨: arrayListOf()는 가변 컬렉션 타입인 ArrayList<T>를 반환함
val allowedValues = arrayListOf("a", "b", "c")

// 좋음: listOf()는 List<T>를 반환함
val allowedValues = listOf("a", "b", "c")
```

### 파라미터 기본값

오버로드된 함수를 여러 개 선언하는 것보다 파라미터 기본값을 가진 함수 하나를 선언하는 것을 권장합니다.

```kotlin
// 나쁨
fun foo() = foo("a")
fun foo(a: String) { /*...*/ }

// 좋음
fun foo(a: String = "a") { /*...*/ }
```

### 타입 별칭(Type aliases)

코드베이스에서 여러 번 사용되는 함수형 타입이나 타입 파라미터가 있는 타입이 있다면, 이에 대한 타입 별칭을 정의하는 것을 권장합니다.

```kotlin
typealias MouseClickHandler = (Any, MouseEvent) -> Unit
typealias PersonIndex = Map<String, Person>
```
이름 충돌을 피하기 위해 전용(private) 또는 내부(internal) 타입 별칭을 사용하는 경우에는 [패키지 및 임포트](packages.md)에서 언급된 `import ... as ...`를 사용하는 것이 좋습니다.

### 람다 파라미터

짧고 중첩되지 않은 람다에서는 파라미터를 명시적으로 선언하는 대신 `it` 컨벤션을 사용하는 것이 좋습니다. 파라미터가 있는 중첩된 람다에서는 항상 파라미터를 명시적으로 선언하세요.

### 람다에서의 반환(Returns)

람다에서 레이블이 지정된 여러 개의 return을 사용하는 것은 피하세요. 람다가 하나의 탈출 지점만 갖도록 구조를 변경하는 것을 고려하세요. 그것이 불가능하거나 명확하지 않다면 람다를 익명 함수로 변환하는 것을 고려하세요.

람다의 마지막 문장에는 레이블이 지정된 return을 사용하지 마세요.

### 명명된 인수(Named arguments)

메서드가 동일한 기본 타입(primitive type)의 파라미터를 여러 개 받거나 `Boolean` 타입의 파라미터를 받는 경우, 문맥상 모든 파라미터의 의미가 명확하지 않다면 명명된 인수 구문을 사용하세요.

```kotlin
drawSquare(x = 10, y = 10, width = 100, height = 100, fill = true)
```

### 조건문

`try`, `if`, `when`의 표현식 형태를 사용하는 것을 권장합니다.

```kotlin
return if (x) foo() else bar()
```

```kotlin
return when(x) {
    0 -> "zero"
    else -> "nonzero"
}
```

위의 방식이 다음 방식보다 낫습니다.

```kotlin
if (x)
    return foo()
else
    return bar()
```

```kotlin
when(x) {
    0 -> return "zero"
    else -> return "nonzero"
}
```

### if 대 when

이진 조건에는 `when` 대신 `if`를 사용하는 것을 권장합니다. 
예를 들어, `if`를 사용하여 다음 구문을 사용하세요.

```kotlin
if (x == null) ... else ...
```

`when`을 사용한 다음 구문 대신 사용하세요.

```kotlin
when (x) {
    null -> // ...
    else -> // ...
}
```

옵션이 세 개 이상인 경우에는 `when`을 사용하는 것이 좋습니다.

### when 표현식의 가드 조건(Guard conditions)

`when` 표현식이나 문에서 [가드 조건](control-flow.md#guard-conditions-in-when-expressions)과 함께 여러 불리언 표현식을 결합할 때는 괄호를 사용하세요.

```kotlin
when (status) {
    is Status.Ok if (status.info.isEmpty() || status.info.id == null) -> "no information"
}
```

다음 방식 대신 권장됩니다:

```kotlin
when (status) {
    is Status.Ok if status.info.isEmpty() || status.info.id == null -> "no information"
}
```

### 조건문의 널 허용 불리언 값

조건문에서 널 허용(nullable) `Boolean`을 사용해야 하는 경우, `if (value == true)` 또는 `if (value == false)` 체크를 사용하세요.

### 루프(Loops)

루프보다는 고차 함수(`filter`, `map` 등)를 사용하는 것을 권장합니다. 예외: `forEach` (대신 일반 `for` 루프를 사용하는 것이 좋습니다. 다만 `forEach`의 수신 객체가 널 허용이거나 `forEach`가 긴 호출 체인의 일부로 사용되는 경우는 제외입니다).

여러 고차 함수를 사용하는 복잡한 표현식과 루프 사이에서 선택할 때는 각 경우에 수행되는 작업의 비용을 이해하고 성능 고려 사항을 염두에 두세요.

### 범위 루프(Loops on ranges)

끝이 열린 범위(open-ended range)를 루프할 때는 `..<` 연산자를 사용하세요.

```kotlin
for (i in 0..n - 1) { /*...*/ }  // 나쁨
for (i in 0..<n) { /*...*/ }  // 좋음
```

### 문자열(Strings)

문자열 연결(concatenation)보다는 문자열 템플릿을 권장합니다.

일반 문자열 리터럴에 `
` 이스케이프 시퀀스를 포함하는 것보다 여러 줄 문자열(multiline strings)을 사용하는 것이 좋습니다.

여러 줄 문자열에서 들여쓰기를 유지하려면, 결과 문자열에 내부 들여쓰기가 필요하지 않을 때는 `trimIndent`를 사용하고, 내부 들여쓰기가 필요할 때는 `trimMargin`을 사용하세요.

```kotlin
fun main() {
//sampleStart
    println("""
     Not
     trimmed
     text
     """
    )

    println("""
     Trimmed
     text
     """.trimIndent()
    )

    println()

    val a = """Trimmed to margin text:
            |if(a > 1) {
            |    return a
            |}""".trimMargin()

   println(a)
//sampleEnd
}
```
{kotlin-runnable="true"}

[자바와 코틀린의 여러 줄 문자열 차이점](java-to-kotlin-idioms-strings.md#use-multiline-strings)에 대해 알아보세요.

### 함수 대 프로퍼티

일부 시나리오에서는 인수가 없는 함수가 읽기 전용 프로퍼티와 상호 교체 가능할 수 있습니다. 의미론적으로는 비슷하지만, 어느 것을 선호할지에 대한 몇 가지 스타일적 관례가 있습니다.

알고리즘이 다음과 같은 경우 함수보다 프로퍼티를 권장합니다.

* 예외를 던지지 않음.
* 계산 비용이 낮음(또는 첫 실행 시 캐시됨).
* 객체 상태가 변경되지 않았다면 호출 시마다 동일한 결과를 반환함.

### 확장 함수(Extension functions)

확장 함수를 자유롭게 사용하세요. 주로 객체에 대해 작동하는 함수가 있을 때마다 해당 객체를 수신 객체로 받는 확장 함수로 만드는 것을 고려하세요. API 오염을 최소화하려면 확장 함수의 가시성을 필요한 만큼 제한하세요. 필요에 따라 지역 확장 함수, 멤버 확장 함수 또는 private 가시성을 가진 최상위 확장 함수를 사용하세요.

### 중위 함수(Infix functions)

유사한 역할을 수행하는 두 객체에 대해 작동할 때만 함수를 `infix`로 선언하세요. 좋은 예: `and`, `to`, `zip`. 나쁜 예: `add`.

수신 객체를 직접 수정(mutate)하는 메서드는 `infix`로 선언하지 마세요.

### 팩토리 함수(Factory functions)

클래스에 대한 팩토리 함수를 선언할 때 클래스 자체와 동일한 이름을 지정하는 것을 피하세요. 팩토리 함수의 동작이 특별한 이유를 명확히 알 수 있도록 고유한 이름을 사용하는 것이 좋습니다. 정말 특별한 의미가 없는 경우에만 클래스와 동일한 이름을 사용할 수 있습니다.

```kotlin
class Point(val x: Double, val y: Double) {
    companion object {
        fun fromPolar(angle: Double, radius: Double) = Point(...)
    }
}
```

서로 다른 슈퍼클래스 생성자를 호출하지 않고 파라미터 기본값을 포함하는 단일 생성자로 축소될 수 없는 여러 개의 오버로드된 생성자가 있는 경우, 오버로드된 생성자를 팩토리 함수로 교체하는 것을 권장합니다.

### 플랫폼 타입(Platform types)

플랫폼 타입의 표현식을 반환하는 공개(public) 함수/메서드는 코틀린 타입을 명시적으로 선언해야 합니다.

```kotlin
fun apiCall(): String = MyJavaApi.getProperty("name")
```

플랫폼 타입의 표현식으로 초기화되는 모든 프로퍼티(패키지 수준 또는 클래스 수준)는 코틀린 타입을 명시적으로 선언해야 합니다.

```kotlin
class Person {
    val name: String = MyJavaApi.getProperty("name")
}
```

플랫폼 타입의 표현식으로 초기화되는 지역 값은 타입 선언이 있을 수도 있고 없을 수도 있습니다.

```kotlin
fun main() {
    val name = MyJavaApi.getProperty("name")
    println(name)
}
```

### 스코프 함수(Scope functions) apply/with/run/also/let

코틀린은 주어진 객체의 컨텍스트에서 코드 블록을 실행하기 위한 일련의 함수를 제공합니다: `let`, `run`, `with`, `apply`, `also`. 상황에 맞는 적절한 스코프 함수를 선택하는 방법은 [스코프 함수](scope-functions.md)를 참조하세요.

## 라이브러리를 위한 코딩 컨벤션

라이브러리를 작성할 때는 API 안정성을 보장하기 위해 추가적인 규칙 세트를 따르는 것이 권장됩니다.

 * 멤버 가시성을 항상 명시적으로 지정하세요(실수로 선언이 공개 API로 노출되는 것을 방지하기 위함).
 * 함수의 반환 타입과 프로퍼티 타입을 항상 명시적으로 지정하세요(구현이 변경될 때 실수로 반환 타입이 변경되는 것을 방지하기 위함).
 * 새로운 문서가 필요 없는 오버라이드 메서드를 제외한 모든 공개 멤버에 [KDoc](kotlin-doc.md) 주석을 제공하세요(라이브러리 문서 생성을 지원하기 위함).

라이브러리용 API를 작성할 때 고려해야 할 모범 사례와 아이디어에 대해 [라이브러리 작성자 지침](api-guidelines-introduction.md)에서 자세히 알아보세요.