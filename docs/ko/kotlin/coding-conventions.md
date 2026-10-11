[//]: # (title: 코딩 컨벤션)

널리 알려져 있고 따르기 쉬운 코딩 컨벤션(Coding convention)은 모든 프로그래밍 언어에서 매우 중요합니다.
여기서는 Kotlin을 사용하는 프로젝트를 위한 코드 스타일과 코드 구성 가이드라인을 제공합니다.

## IDE에서 스타일 설정 {id="configure-style-in-ide"}

Kotlin에서 가장 널리 사용되는 두 IDE인 [IntelliJ IDEA](https://www.jetbrains.com/idea/)와 [Android Studio](https://developer.android.com/studio/)는 강력한 코드 스타일링 기능을 지원합니다. 주어진 코드 스타일에 맞추어 코드를 자동으로 포맷팅하도록 설정할 수 있습니다.
 
### 스타일 가이드 적용 {id="apply-the-style-guide"}

1. **Settings/Preferences | Editor | Code Style | Kotlin**으로 이동합니다.
2. **Set from...**을 클릭합니다.
3. **Kotlin style guide**를 선택합니다.

### 코드가 스타일 가이드를 따르는지 검사 {id="verify-that-your-code-follows-the-style-guide"}

1. **Settings/Preferences | Editor | Inspections | General**로 이동합니다.
2. **Incorrect formatting** 검사를 활성화합니다.
스타일 가이드에 설명된 다른 문제(예: 네이밍 규칙)를 확인하는 추가 검사는 기본적으로 활성화되어 있습니다.

<!-- Replace with an external link when the guide is moved -->

자세한 내용은 [IntelliJ IDEA를 사용하여 Kotlin 코드 스타일로 마이그레이션하기](code-style-migration-guide.md) 가이드를 참조하세요.

## 소스 코드 구성 {id="source-code-organization"}

### 디렉터리 구조 {id="directory-structure"}

순수 Kotlin 프로젝트에서는 공통 루트 패키지를 생략한 패키지 구조를 따르는 디렉터리 구조를 권장합니다. 예를 들어, 프로젝트의 모든 코드가 `org.example.kotlin` 패키지와 그 하위 패키지에 있는 경우, `org.example.kotlin` 패키지의 파일은 소스 루트 바로 아래에 위치해야 하며, `org.example.kotlin.network.socket`의 파일은 소스 루트의 `network/socket` 하위 디렉터리에 위치해야 합니다.

>JVM의 경우: Kotlin을 Java와 함께 사용하는 프로젝트에서는 Kotlin 소스 파일이 Java 소스 파일과 동일한 소스 루트에 있어야 하며, 동일한 디렉터리 구조를 따라야 합니다. 즉, 각 파일은 각 패키지 선언에 해당하는 디렉터리에 저장되어야 합니다.
>
{style="note"}

### 소스 파일 이름 {id="source-file-names"}

Kotlin 파일에 단일 클래스나 인터페이스만 포함되어 있는 경우(관련된 최상위 선언이 포함될 수도 있음), 파일 이름은 클래스 이름과 동일해야 하며 `.kt` 확장자가 붙어야 합니다. 이는 모든 유형의 클래스와 인터페이스에 적용됩니다.
파일에 여러 클래스가 포함되어 있거나 최상위 선언만 있는 경우, 파일의 내용을 설명하는 이름을 선택하여 그에 맞게 파일 이름을 지정하세요.
각 단어의 첫 글자를 대문자로 표기하는 [어퍼 캐멀 케이스(upper camel case)](https://en.wikipedia.org/wiki/Camel_case)를 사용합니다.
예: `ProcessDeclarations.kt`.

파일 이름은 파일 내의 코드가 수행하는 작업을 설명해야 합니다. 따라서 파일 이름에 `Util`과 같이 무의미한 단어를 사용하는 것은 피해야 합니다.

#### 멀티플랫폼 프로젝트 {id="multiplatform-projects"}

멀티플랫폼 프로젝트에서는 플랫폼별 소스 세트에 있는 최상위 선언 파일에 소스 세트의 이름과 연결된 접미사가 있어야 합니다. 예를 들면 다음과 같습니다.

* **jvm**Main/kotlin/Platform.**jvm**.kt
* **android**Main/kotlin/Platform.**android**.kt
* **ios**Main/kotlin/Platform.**ios**.kt

공통(common) 소스 세트의 경우, 최상위 선언이 있는 파일에 접미사를 붙이지 않아야 합니다. 예: `commonMain/kotlin/Platform.kt`.

##### 기술적 세부사항 {initial-collapse-state="collapsed" collapsible="true" id="technical-details"}

멀티플랫폼 프로젝트에서 이러한 파일 네이밍 방식을 권장하는 이유는 최상위 멤버(함수, 프로퍼티)를 허용하지 않는 JVM의 제약 때문입니다.

이를 해결하기 위해 Kotlin JVM 컴파일러는 최상위 멤버 선언을 포함하는 래퍼 클래스(소위 "파일 파사드(file facade)")를 생성합니다. 파일 파사드는 파일 이름에서 파생된 내부 이름을 가집니다.

반면, JVM은 완전 정규화된 이름(FQN, fully qualified name)이 동일한 여러 클래스를 허용하지 않습니다. 이로 인해 Kotlin 프로젝트가 JVM으로 컴파일되지 않는 상황이 발생할 수 있습니다.

```none
root
|- commonMain/kotlin/myPackage/Platform.kt // 'fun count() { }' 포함
|- jvmMain/kotlin/myPackage/Platform.kt // 'fun multiply() { }' 포함
```

여기서 두 `Platform.kt` 파일은 동일한 패키지에 있으므로, Kotlin JVM 컴파일러는 두 개의 파일 파사드를 생성하며 둘 다 `myPackage.PlatformKt`라는 FQN을 갖게 됩니다. 이로 인해 "Duplicate JVM classes" 에러가 발생합니다.

이를 방지하는 가장 간단한 방법은 위의 가이드라인에 따라 파일 중 하나의 이름을 바꾸는 것입니다. 이러한 네이밍 방식은 코드 가독성을 유지하면서 충돌을 방지하는 데 도움이 됩니다.

> 이러한 권장 사항이 불필요해 보이는 두 가지 시나리오가 있지만, 그래도 따르는 것을 권장합니다.
> 
> * JVM이 아닌 플랫폼에서는 파일 파사드 중복 문제가 발생하지 않습니다. 그러나 이 네이밍 규칙은 파일 네이밍의 일관성을 유지하는 데 도움이 됩니다.
> * JVM에서도 소스 파일에 최상위 선언이 없으면 파일 파사드가 생성되지 않으므로 이름 충돌이 발생하지 않습니다.
> 
>   하지만 이 네이밍 규칙을 따르면 간단한 리팩터링이나 기능 추가 시 최상위 함수가 포함되어 동일한 "Duplicate JVM classes" 에러가 발생하는 상황을 방지할 수 있습니다.
> 
{style="tip"}

### 소스 파일 구성 {id="source-file-organization"}

선언들이 의미상 서로 밀접하게 연관되어 있고 파일 크기가 적절한 수준(수백 줄을 넘지 않음)을 유지하는 한, 동일한 Kotlin 소스 파일에 여러 선언(클래스, 최상위 함수 또는 프로퍼티)을 배치하는 것이 권장됩니다.

특히 클래스의 모든 클라이언트와 관련된 확장 함수를 정의할 때는 클래스 자체와 같은 파일에 배치하세요. 특정 클라이언트에만 의미가 있는 확장 함수를 정의할 때는 해당 클라이언트의 코드 옆에 배치하세요. 특정 클래스의 모든 확장 함수만을 모아두기 위한 파일을 만드는 것은 피하세요.

### 클래스 레이아웃 {id="class-layout"}

클래스의 내용은 다음 순서로 배치해야 합니다.

1. 프로퍼티 선언 및 초기화 블록
2. 보조 생성자
3. 메서드 선언
4. 동반 객체(Companion object)

메서드 선언을 알파벳순이나 가시성 순서로 정렬하지 말고, 일반 메서드와 확장 메서드를 분리하지 마세요. 대신 관련된 요소들을 함께 모아서 위에서 아래로 클래스를 읽는 사람이 어떤 논리로 동작하는지 따라갈 수 있도록 하세요. 순서(고수준 요소를 먼저 배치할지, 그 반대로 할지)를 정하고 이를 일관되게 유지하세요.

중첩 클래스는 해당 클래스를 사용하는 코드 옆에 배치하세요. 클래스가 외부에서 사용될 목적으로 작성되었고 클래스 내부에서 참조되지 않는 경우에는 동반 객체 뒤, 가장 마지막에 배치하세요.

### 인터페이스 구현 레이아웃 {id="interface-implementation-layout"}

인터페이스를 구현할 때는 인터페이스 멤버와 동일한 순서로 구현 멤버를 유지하세요(필요한 경우 구현에 사용되는 추가 private 메서드를 사이에 배치할 수 있습니다).

### 오버로드 레이아웃 {id="overload-layout"}

클래스 내에서 오버로드된 메서드는 항상 서로 인접하게 배치하세요.

## 네이밍 규칙 {id="naming-rules"}

Kotlin의 패키지 및 클래스 네이밍 규칙은 매우 간단합니다.

* 패키지 이름은 항상 소문자이며 밑줄을 사용하지 않습니다(`org.example.project`). 여러 단어로 구성된 이름을 사용하는 것은 일반적으로 권장되지 않지만, 여러 단어를 사용해야 하는 경우 단순히 단어를 붙여 쓰거나 캐멀 케이스를 사용할 수 있습니다(`org.example.myProject`).

* 클래스와 객체의 이름은 어퍼 캐멀 케이스(upper camel case)를 사용합니다.

```kotlin
open class DeclarationProcessor { /*...*/ }

object EmptyDeclarationProcessor : DeclarationProcessor() { /*...*/ }
```

### 함수 이름 {id="function-names"}
 
함수, 프로퍼티, 지역 변수의 이름은 소문자로 시작하며 밑줄 없이 캐멀 케이스를 사용합니다.

```kotlin
fun processDeclarations() { /*...*/ }
var declarationCount = 1
```

### 클래스 형태의 함수 이름 {id="names-for-class-like-functions"}

함수 이름이 클래스 네이밍 규칙을 따라야 하는 두 가지 예외가 있습니다. 이러한 종류의 함수는 대개 최상위 수준에 정의됩니다.

* 클래스 인스턴스를 생성하는 팩토리 함수는 추상 반환 타입과 동일한 이름을 가질 수 있습니다.

   ```kotlin
   interface Foo { /*...*/ }

   class FooImpl : Foo { /*...*/ }

   fun Foo(): Foo { return FooImpl() }
   ```

* `Unit`을 반환하는 `@Composable` 함수:

   ```kotlin
   @Composable fun TabHeader { /*...*/ }
   ```

### 테스트 메서드 이름 {id="names-for-test-methods"}

테스트에서는(**오직** 테스트에서만) 백틱으로 감싼 공백이 포함된 메서드 이름을 사용할 수 있습니다.
이러한 메서드 이름은 API 레벨 30부터 Android 런타임에서만 지원된다는 점에 유의하세요. 테스트 코드에서는 메서드 이름에 밑줄을 사용하는 것도 허용됩니다.

```kotlin
class MyTestCase {
    @Test fun `ensure everything works`() { /*...*/ }

    @Test fun ensureEverythingWorks_onAndroid() { /*...*/ }
}
```

### 프로퍼티 이름 {id="property-names"}

상수( `const`로 표시된 프로퍼티, 또는 깊은 불변(deeply immutable) 데이터를 보유하며 커스텀 `get` 함수가 없는 최상위 또는 객체 `val` 프로퍼티)의 이름은 [스크리밍 스네이크 표기법(screaming snake case)](https://en.wikipedia.org/wiki/Snake_case) 규칙에 따라 대문자와 밑줄로 구분된 이름을 사용해야 합니다.

```kotlin
const val MAX_COUNT = 8
val USER_NAME_FIELD = "UserName"
```

동작을 가지는 객체나 가변 데이터를 보유하는 최상위 또는 객체 프로퍼티의 이름은 캐멀 케이스 이름을 사용해야 합니다.

```kotlin
val mutableCollection: MutableSet<String> = HashSet()
```

싱글톤 객체에 대한 참조를 보유하는 프로퍼티 이름은 `object` 선언과 동일한 네이밍 스타일을 사용할 수 있습니다.

```kotlin
val PersonComparator: Comparator<Person> = /*...*/
```

Enum 상수의 경우 용도에 따라 모두 대문자로 밑줄로 구분된 표기법([스크리밍 스네이크 표기법](https://en.wikipedia.org/wiki/Snake_case))(`enum class Color { RED, GREEN }`) 또는 어퍼 캐멀 케이스 이름을 사용할 수 있습니다.
   
### 뒷받침하는 프로퍼티(Backing property) 이름 {id="names-for-backing-properties"}

클래스에 개념상 동일하지만 하나는 공개 API의 일부이고 다른 하나는 구현 세부 정보인 두 개의 프로퍼티가 있는 경우, private 프로퍼티의 이름 접두사로 밑줄을 사용하세요.

```kotlin
class C {
    private val _elementList = mutableListOf<Element>()

    val elementList: List<Element>
        get() = _elementList
}
```

### 좋은 이름 선택하기 {id="choose-good-names"}

클래스의 이름은 대개 해당 클래스가 무엇_인지_를 설명하는 명사 또는 명사구입니다: `List`, `PersonReader`.

메서드의 이름은 대개 메서드가 수행하는 작업_을_ 나타내는 동사 또는 동사구입니다: `close`, `readPersons`.
또한 이름은 메서드가 객체를 변경하는지 아니면 새 객체를 반환하는지 암시해야 합니다. 예를 들어 `sort`는 컬렉션을 제자리에서 정렬(in-place)하는 반면, `sorted`는 컬렉션의 정렬된 복사본을 반환합니다.

이름은 엔티티의 목적을 명확히 전달해야 하므로, 이름에 무의미한 단어(`Manager`, `Wrapper`)를 사용하는 것은 피하는 것이 좋습니다.

선언 이름의 일부로 약어(acronym)를 사용하는 경우 다음 규칙을 따르세요.

* 두 글자 약어의 경우 두 글자 모두 대문자를 사용합니다. 예: `IOStream`.
* 세 글자 이상의 약어의 경우 첫 글자만 대문자로 표기합니다. 예: `XmlFormatter` 또는 `HttpInputStream`.

## 포맷팅 {id="formatting"}

### 들여쓰기 {id="indentation"}

들여쓰기에는 4개의 공백을 사용합니다. 탭(Tab)은 사용하지 마세요.

중괄호의 경우 여는 중괄호는 구문이 시작되는 줄의 끝에 두고, 닫는 중괄호는 여는 구문과 가로로 맞춰 별도의 줄에 배치합니다.

```kotlin
if (elements != null) {
    for (element in elements) {
        // ...
    }
}
```

>Kotlin에서는 세미콜론이 선택 사항이므로 줄 바꿈이 중요한 의미를 갖습니다. 언어 설계는 Java 스타일의 중괄호를 전제로 하므로, 다른 포맷팅 스타일을 사용하려고 하면 예기치 않은 동작이 발생할 수 있습니다.
>
{style="note"}

### 가로 공백 {id="horizontal-whitespace"}

* 이항 연산자 앞뒤로 공백을 둡니다(`a + b`). 예외: "range to" 연산자 앞뒤로는 공백을 두지 않습니다(`0..i`).
* 단항 연산자 앞뒤로는 공백을 두지 않습니다(`a++`).
* 제어 흐름 키워드(`if`, `when`, `for`, `while`)와 여는 괄호 사이에 공백을 둡니다.
* 기본 생성자 선언, 메서드 선언 또는 메서드 호출 시 여는 괄호 앞에 공백을 두지 않습니다.

```kotlin
class A(val x: Int)

fun foo(x: Int) { ... }

fun bar() {
    foo(1)
}
```

* `(`, `[` 뒤나 `]`, `)` 앞에는 절대 공백을 두지 않습니다.
* `.` 또는 `?.` 주변에는 절대 공백을 두지 않습니다: `foo.bar().filter { it > 2 }.joinToString()`, `foo?.bar()`.
* `//` 뒤에는 공백을 둡니다: `// This is a comment`.
* 타입 파라미터를 지정하는 데 사용되는 꺾쇠괄호 주변에는 공백을 두지 않습니다: `class Map<K, V> { ... }`.
* `::` 주변에는 공백을 두지 않습니다: `Foo::class`, `String::length`.
* 널 가능(nullable) 타입을 표시하는 데 사용되는 `?` 앞에는 공백을 두지 않습니다: `String?`.

일반적인 규칙으로, 어떤 종류의 가로 정렬(horizontal alignment)도 피하세요. 식별자 이름을 다른 길이의 이름으로 변경하더라도 선언이나 사용처의 포맷팅에 영향을 주지 않아야 합니다.

### 콜론 {id="colon"}

다음 시나리오에서는 `:` 앞에 공백을 둡니다.

* 타입과 슈퍼타입을 구분하는 데 사용될 때.
* 슈퍼클래스 생성자 또는 동일한 클래스의 다른 생성자로 위임할 때.
* `object` 키워드 뒤.
    
선언과 해당 타입을 구분할 때는 `:` 앞에 공백을 두지 마세요.
 
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

### 클래스 헤더 {id="class-headers"}

기본 생성자 파라미터가 몇 개 없는 클래스는 한 줄로 작성할 수 있습니다.

```kotlin
class Person(id: Int, name: String)
```

헤더가 긴 클래스는 들여쓰기와 함께 각 기본 생성자 파라미터가 별도의 줄에 위치하도록 포맷팅해야 합니다.
또한 닫는 괄호는 새 줄에 위치해야 합니다. 상속을 사용하는 경우 슈퍼클래스 생성자 호출이나 구현된 인터페이스 목록은 괄호와 같은 줄에 위치해야 합니다.

```kotlin
class Person(
    id: Int,
    name: String,
    surname: String
) : Human(id, name) { /*...*/ }
```

인터페이스가 여러 개인 경우 슈퍼클래스 생성자 호출을 먼저 배치한 다음 각 인터페이스를 서로 다른 줄에 배치해야 합니다.

```kotlin
class Person(
    id: Int,
    name: String,
    surname: String
) : Human(id, name),
    KotlinMaker { /*...*/ }
```

슈퍼타입 목록이 긴 클래스의 경우 콜론 뒤에 줄 바꿈을 넣고 모든 슈퍼타입 이름을 가로로 맞춥니다.

```kotlin
class MyFavouriteVeryLongClassHolder :
    MyLongHolder<MyFavouriteVeryLongClass>(),
    SomeOtherInterface,
    AndAnotherOne {

    fun foo() { /*...*/ }
}
```

클래스 헤더가 길 때 클래스 헤더와 본문을 명확히 구분하려면 클래스 헤더 뒤에 빈 줄을 넣거나(위 예시와 같이) 여는 중괄호를 별도의 줄에 배치하세요.

```kotlin
class MyFavouriteVeryLongClassHolder :
    MyLongHolder<MyFavouriteVeryLongClass>(),
    SomeOtherInterface,
    AndAnotherOne 
{
    fun foo() { /*...*/ }
}
```

생성자 파라미터에는 일반 들여쓰기(공백 4개)를 사용합니다. 이렇게 하면 기본 생성자에 선언된 프로퍼티가 클래스 본문에 선언된 프로퍼티와 동일한 들여쓰기를 갖게 됩니다.

### 한정자(Modifier) 순서 {id="modifiers-order"}

선언에 여러 한정자가 있는 경우 항상 다음 순서로 배치하세요.

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
enum / annotation / fun // `fun interface`의 한정자로서
companion
inline / value
infix
operator
data
```

모든 애너테이션은 한정자 앞에 배치합니다.

```kotlin
@Named("Foo")
private val foo: Foo
```

라이브러리를 작업하는 경우가 아니라면 중복된 한정자(예: `public`)는 생략하세요.

### 애너테이션 {id="annotations"}

애너테이션은 적용 대상 선언 앞의 별도 줄에 동일한 들여쓰기로 배치합니다.

```kotlin
@Target(AnnotationTarget.PROPERTY)
annotation class JsonExclude
```

인자가 없는 애너테이션은 같은 줄에 배치할 수 있습니다.

```kotlin
@JsonExclude @JvmField
var x: String
```

인자가 없는 단일 애너테이션은 해당 선언과 같은 줄에 배치할 수 있습니다.

```kotlin
@Test fun foo() { /*...*/ }
```

### 파일 애너테이션 {id="file-annotations"}

파일 애너테이션은 파일 주석(있는 경우) 뒤, `package` 문 앞에 배치되며, `package`와 빈 줄로 구분됩니다(패키지가 아닌 파일을 대상으로 한다는 점을 강조하기 위함).

```kotlin
/** License, copyright and whatever */
@file:JvmName("FooBar")

package foo.bar
```

### 함수 {id="functions"}

함수 시그니처가 한 줄에 들어가지 않는 경우 다음 구문을 사용합니다.

```kotlin
fun longMethodName(
    argument: ArgumentType = defaultValue,
    argument2: AnotherArgumentType,
): ReturnType {
    // body
}
```

함수 파라미터에는 일반 들여쓰기(공백 4개)를 사용합니다. 이는 생성자 파라미터와의 일관성을 유지하는 데 도움이 됩니다.

본문이 단일 표현식으로 구성된 함수의 경우 표현식 본문(expression body)을 사용하는 것을 선호합니다.

```kotlin
fun foo(): Int {     // 나쁨
    return 1 
}

fun foo() = 1        // 좋음
```

### 표현식 본문 {id="expression-bodies"}

함수의 표현식 본문 첫 번째 줄이 선언과 같은 줄에 들어가지 않는 경우, `=` 기호를 첫 번째 줄에 두고 표현식 본문을 공백 4개로 들여씁니다.

```kotlin
fun f(x: String, y: String, z: String) =
    veryLongFunctionCallWithManyWords(andLongParametersToo(), x, y, z)
```

### 프로퍼티 {id="properties"}

매우 단순한 읽기 전용 프로퍼티의 경우 한 줄 포맷팅을 고려하세요.

```kotlin
val isEmpty: Boolean get() = size == 0
```

더 복잡한 프로퍼티의 경우 항상 `get` 및 `set` 키워드를 별도의 줄에 배치합니다.

```kotlin
val foo: String
    get() { /*...*/ }
```

초기화 식이 있는 프로퍼티의 경우 초기화 식이 길면 `=` 기호 뒤에 줄 바꿈을 추가하고 초기화 식을 공백 4개로 들여씁니다.

```kotlin
private val defaultCharset: Charset? =
    EncodingRegistry.getInstance().getDefaultCharsetForPropertiesFiles(file)
```

### 제어 흐름 문 {id="control-flow-statements"}

`if` 또는 `when` 문의 조건이 여러 줄인 경우 항상 문장의 본문 주위에 중괄호를 사용하세요.
조건의 각 후속 줄은 문장 시작을 기준으로 공백 4개만큼 들여씁니다. 
조건의 닫는 괄호는 여는 중괄호와 함께 별도의 줄에 배치합니다.

```kotlin
if (!component.isSyncing &&
    !hasAnyKotlinRuntimeInScope(module)
) {
    return createKotlinNotConfiguredPanel(module)
}
```

이렇게 하면 조건과 문장 본문을 정렬하는 데 도움이 됩니다. 

`else`, `catch`, `finally` 키워드뿐만 아니라 `do-while` 루프의 `while` 키워드는 앞선 중괄호와 같은 줄에 배치합니다.

```kotlin
if (condition) {
    // body
} else {
    // else part
}

try {
    // body
} finally {
    // cleanup
}
```

`when` 문에서 브랜치가 두 줄 이상인 경우 빈 줄을 넣어 인접한 case 블록과 구분하는 것을 고려하세요.

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

짧은 브랜치는 중괄호 없이 조건과 같은 줄에 배치합니다.

```kotlin
when (foo) {
    true -> bar() // 좋음
    false -> { baz() } // 나쁨
}
```

### 메서드 호출 {id="method-calls"}

긴 인수 목록에서는 여는 괄호 뒤에 줄 바꿈을 넣습니다. 인수는 공백 4개로 들여씁니다. 
밀접하게 관련된 여러 인수는 같은 줄에 그룹화합니다.

```kotlin
drawSquare(
    x = 10, y = 10,
    width = 100, height = 100,
    fill = true
)
```

인수 이름과 값을 구분하는 `=` 기호 앞뒤로 공백을 둡니다.

### 메서드 체이닝 줄 바꿈 {id="wrap-chained-calls"}

메서드 체이닝 호출을 줄 바꿈할 때는 `.` 문자 또는 `?.` 연산자를 다음 줄에 단일 들여쓰기로 배치합니다.

```kotlin
val anchor = owner
    ?.firstChild!!
    .siblings(forward = true)
    .dropWhile { it is PsiComment || it is PsiWhiteSpace }
```

체인의 첫 번째 호출 앞에는 일반적으로 줄 바꿈이 있어야 하지만, 줄 바꿈을 생략하는 것이 코드상 더 자연스럽다면 생략해도 좋습니다.

### 람다 {id="lambdas"}

람다 식에서는 중괄호 주위와 파라미터와 본문을 구분하는 화살표 주위에 공백을 사용해야 합니다. 호출이 단일 람다를 받는 경우 가능한 한 괄호 밖에 전달하세요.

```kotlin
list.filter { it > 10 }
```

람다에 레이블을 할당하는 경우 레이블과 여는 중괄호 사이에 공백을 두지 마세요.

```kotlin
fun foo() {
    ints.forEach lit@{
        // ...
    }
}
```

여러 줄 람다에서 파라미터 이름을 선언할 때는 이름을 첫 번째 줄에 두고 화살표와 줄 바꿈을 이어 배치합니다.

```kotlin
appendCommaSeparated(properties) { prop ->
    val propertyValue = prop.get(obj)  // ...
}
```

파라미터 목록이 너무 길어 한 줄에 들어가지 않는 경우 화살표를 별도의 줄에 배치합니다.

```kotlin
foo {
    context: Context,
    environment: Env
    ->
    context.configureEnv(environment)
}
```

### 후행 쉼표(Trailing comma) {id="trailing-commas"}

후행 쉼표는 일련의 요소 중 마지막 항목 뒤에 오는 쉼표 기호입니다.

```kotlin
class Person(
    val firstName: String,
    val lastName: String,
    val age: Int, // 후행 쉼표
)
```

후행 쉼표를 사용하면 몇 가지 장점이 있습니다.

* 버전 관리 diff가 더 깔끔해집니다. 모든 초점이 변경된 값에 맞춰지기 때문입니다.
* 요소를 추가하고 순서를 변경하기가 쉬워집니다. 요소를 조작할 때 쉼표를 추가하거나 삭제할 필요가 없습니다.
* 객체 초기화 등 코드 생성이 단순해집니다. 마지막 요소 뒤에도 쉼표가 붙을 수 있기 때문입니다.

후행 쉼표는 완전히 선택 사항이며, 후행 쉼표가 없어도 코드는 정상 작동합니다. Kotlin 스타일 가이드는 선언부(declaration site)에서 후행 쉼표를 사용할 것을 권장하며, 호출부(call site)에서는 재량에 맡깁니다.

IntelliJ IDEA 포매터에서 후행 쉼표를 활성화하려면 **Settings/Preferences | Editor | Code Style | Kotlin**으로 이동하여 **Other** 탭을 열고 **Use trailing comma** 옵션을 선택합니다.

#### 열거형(Enum) {initial-collapse-state="collapsed" collapsible="true" id="enumerations"}

```kotlin
enum class Direction {
    NORTH,
    SOUTH,
    WEST,
    EAST, // 후행 쉼표
}
```

#### 값 인수 {initial-collapse-state="collapsed" collapsible="true" id="value-arguments"}

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

#### 클래스 프로퍼티 및 파라미터 {initial-collapse-state="collapsed" collapsible="true" id="class-properties-and-parameters"}

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

#### 함수 값 파라미터 {initial-collapse-state="collapsed" collapsible="true" id="function-value-parameters"}

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

#### 선택적 타입이 있는 파라미터(setter 포함) {initial-collapse-state="collapsed" collapsible="true" id="parameters-with-optional-type-including-setters"}

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

#### 인덱싱 접미사 {initial-collapse-state="collapsed" collapsible="true" id="indexing-suffix"}

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

#### 람다 내 파라미터 {initial-collapse-state="collapsed" collapsible="true" id="parameters-in-lambdas"}

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

#### when 엔트리 {initial-collapse-state="collapsed" collapsible="true" id="when-entry"}

```kotlin
fun isReferenceApplicable(myReference: KClass<*>) = when (myReference) {
    Comparable::class,
    Iterable::class,
    String::class, // 후행 쉼표
        -> true
    else -> false
}
```

#### 컬렉션 리터럴(애너테이션 내부) {initial-collapse-state="collapsed" collapsible="true" id="collection-literals-in-annotations"}

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

#### 타입 인수 {initial-collapse-state="collapsed" collapsible="true" id="type-arguments"}

```kotlin
fun <T1, T2> foo() {}
fun main() {
    foo<
            Comparable<Number>,
            Iterable<Number>, // 후행 쉼표
            >()
}
```

#### 타입 파라미터 {initial-collapse-state="collapsed" collapsible="true" id="type-parameters"}

```kotlin
class MyMap<
        MyKey,
        MyValue, // 후행 쉼표
        > {}
```

#### 구조 분해 선언 {initial-collapse-state="collapsed" collapsible="true" id="destructuring-declarations"}

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

## 문서화 주석 {id="documentation-comments"}

긴 문서화 주석의 경우 여는 `/**`를 별도의 줄에 두고 이어지는 각 줄을 별표(`*`)로 시작합니다.

```kotlin
/**
 * This is a documentation comment
 * on multiple lines.
 */
```

짧은 주석은 한 줄에 작성할 수 있습니다.

```kotlin
/** This is a short documentation comment. */
```

일반적으로 `@param` 및 `@return` 태그의 사용은 피하세요. 대신 파라미터와 반환 값에 대한 설명을 문서화 주석에 직접 포함하고, 파라미터가 언급될 때마다 링크를 추가하세요. `@param` 및 `@return`은 본문의 흐름에 어울리지 않는 긴 설명이 필요한 경우에만 사용하세요.

```kotlin
// 이렇게 하지 마세요:

/**
 * Returns the absolute value of the given number.
 * @param number The number to return the absolute value for.
 * @return The absolute value.
 */
fun abs(number: Int): Int { /*...*/ }

// 대신 이렇게 하세요:

/**
 * Returns the absolute value of the given [number].
 */
fun abs(number: Int): Int { /*...*/ }
```

## 불필요한 구문 피하기 {id="avoid-redundant-constructs"}

일반적으로 Kotlin의 특정 문법 구조가 선택 사항이고 IDE에서 중복된 것으로 강조 표시되는 경우 코드에서 생략해야 합니다. 단지 "명확성을 위해" 불필요한 문법 요소를 코드에 남겨두지 마세요.

### Unit 반환 타입 {id="unit-return-type"}

함수가 Unit을 반환하는 경우 반환 타입을 생략해야 합니다.

```kotlin
fun foo() { // 여기서 ": Unit"은 생략됨

}
```

### 세미콜론 {id="semicolons"}

가능한 한 세미콜론을 생략하세요.

### 문자열 템플릿 {id="string-templates"}

문자열 템플릿에 단순 변수를 삽입할 때는 중괄호를 사용하지 마세요. 중괄호는 더 긴 표현식에만 사용합니다.

```kotlin
println("$name has ${children.size} children")
```

달러 기호 문자 `$`를 문자열 리터럴로 취급하려면 [멀티 달러 문자열 보간(multi-dollar string interpolation)](strings.md#multi-dollar-string-interpolation)을 사용하세요.

```kotlin
val KClass<*>.jsonSchema : String
    get() = $$"""
        {
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "$id": "https://example.com/product.schema.json",
            "$dynamicAnchor": "meta",
            "title": "$${simpleName ?: qualifiedName ?: "unknown"}",
            "type": "object"
        }
        """
```

## 언어 기능의 관용적(Idiomatic) 사용 {id="idiomatic-use-of-language-features"}

### 불변성(Immutability) {id="immutability"}

가변 데이터보다는 불변 데이터를 사용하는 것을 선호합니다. 초기화 후 수정되지 않는 지역 변수와 프로퍼티는 항상 `var` 대신 `val`로 선언하세요.

수정되지 않는 컬렉션을 선언할 때는 항상 불변 컬렉션 인터페이스(`Collection`, `List`, `Set`, `Map`)를 사용하세요. 팩토리 함수를 사용하여 컬렉션 인스턴스를 생성할 때는 가능하면 항상 불변 컬렉션 타입을 반환하는 함수를 사용하세요.

```kotlin
// 나쁨: 변경되지 않을 값에 가변 컬렉션 타입 사용
fun validateValue(actualValue: String, allowedValues: HashSet<String>) { ... }

// 좋음: 대신 불변 컬렉션 타입 사용
fun validateValue(actualValue: String, allowedValues: Set<String>) { ... }

// 나쁨: arrayListOf()는 가변 컬렉션 타입인 ArrayList<T>를 반환함
val allowedValues = arrayListOf("a", "b", "c")

// 좋음: listOf()는 List<T>를 반환함
val allowedValues = listOf("a", "b", "c")
```

### 기본 파라미터 값 {id="default-parameter-values"}

오버로드된 함수를 선언하기보다는 기본 파라미터 값을 가진 함수를 선언하는 것을 선호합니다.

```kotlin
// 나쁨
fun foo() = foo("a")
fun foo(a: String) { /*...*/ }

// 좋음
fun foo(a: String = "a") { /*...*/ }
```

### 타입 별칭(Type alias) {id="type-aliases"}

코드베이스에서 여러 번 사용되는 함수형 타입이나 타입 파라미터가 있는 타입이 있는 경우, 이에 대한 타입 별칭을 정의하는 것을 선호합니다.

```kotlin
typealias MouseClickHandler = (Any, MouseEvent) -> Unit
typealias PersonIndex = Map<String, Person>
```
이름 충돌을 피하기 위해 private 또는 internal 타입 별칭을 사용하는 경우, [패키지 및 임포트](packages.md)에서 언급된 `import ... as ...`를 사용하는 것을 선호합니다.

### 람다 파라미터 {id="lambda-parameters"}

짧고 중첩되지 않은 람다에서는 파라미터를 명시적으로 선언하는 대신 `it` 규칙을 사용하는 것이 권장됩니다. 파라미터가 있는 중첩된 람다에서는 항상 파라미터를 명시적으로 선언하세요.

### 람다에서의 반환(Return) {id="returns-in-a-lambda"}

람다에서 여러 레이블이 지정된 반환(labeled return)을 사용하는 것은 피하세요. 람다의 종료 지점이 하나가 되도록 구조를 재구성하는 것을 고려하세요. 그것이 불가능하거나 충분히 명확하지 않다면 람다를 익명 함수로 변환하는 것을 고려하세요.

람다의 마지막 문에는 레이블이 지정된 반환을 사용하지 마세요.

### 명명된 인수(Named argument) {id="named-arguments"}

컨텍스트상 모든 파라미터의 의미가 완전히 명확하지 않다면, 메서드가 동일한 원시 타입의 여러 파라미터를 받거나 `Boolean` 타입의 파라미터를 받을 때 명명된 인수 구문을 사용하세요.

```kotlin
drawSquare(x = 10, y = 10, width = 100, height = 100, fill = true)
```

### 조건문 {id="conditional-statements"}

`try`, `if`, `when`의 표현식 형태를 사용하는 것을 선호합니다.

```kotlin
return if (x) foo() else bar()
```

```kotlin
return when(x) {
    0 -> "zero"
    else -> "nonzero"
}
```

위의 형태가 다음보다 권장됩니다.

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

### if vs when {id="if-versus-when"}

이항 조건에는 `when` 대신 `if`를 사용하는 것을 선호합니다. 
예를 들어 `when`을 사용한 다음 구문 대신:

```kotlin
when (x) {
    null -> // ...
    else -> // ...
}
```

`if`를 사용한 다음 구문을 사용하세요.

```kotlin
if (x == null) ... else ...
```

선택지가 3개 이상인 경우에는 `when`을 사용하는 것을 선호합니다.

### when 표현식의 가드 조건(Guard condition) {id="guard-conditions-in-when-expression"}

[가드 조건(guard conditions)](control-flow.md#guard-conditions-in-when-expressions)이 포함된 `when` 표현식 또는 문에서 여러 부울 표현식을 결합할 때는 괄호를 사용하세요.

```kotlin
when (status) {
    is Status.Ok if (status.info.isEmpty() || status.info.id == null) -> "no information"
}
```

다음과 같이 작성하지 마세요.

```kotlin
when (status) {
    is Status.Ok if status.info.isEmpty() || status.info.id == null -> "no information"
}
```

### 조건문에서의 널 가능 Boolean 값 {id="nullable-boolean-values-in-conditions"}

조건문에서 널 가능(nullable) `Boolean`을 사용해야 하는 경우, `if (value == true)` 또는 `if (value == false)` 검사를 사용하세요.

### 루프 {id="loops"}

루프보다는 고차 함수(`filter`, `map` 등)를 사용하는 것을 선호합니다. 예외: `forEach`(`forEach`의 수신 객체가 널 가능하거나 `forEach`가 더 긴 호출 체인의 일부로 사용되지 않는 한, 일반 `for` 루프를 대신 사용하는 것을 선호합니다).

여러 고차 함수를 사용하는 복잡한 표현식과 루프 중에서 선택할 때는 각 경우에 수행되는 작업의 비용을 이해하고 성능 고려 사항을 염두에 두세요. 

### 범위(Range) 기반 루프 {id="loops-on-ranges"}

끝이 열린 범위(open-ended range)를 반복할 때는 `..<` 연산자를 사용하세요.

```kotlin
for (i in 0..n - 1) { /*...*/ }  // 나쁨
for (i in 0..<n) { /*...*/ }  // 좋음
```

### 문자열 {id="strings"}

문자열 연결(concatenation)보다는 문자열 템플릿을 선호합니다.

일반 문자열 리터럴에 `\n` 이스케이프 시퀀스를 포함하는 것보다 여러 줄 문자열을 선호합니다.

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

[Java와 Kotlin의 여러 줄 문자열 차이점](java-to-kotlin-idioms-strings.md#use-multiline-strings)에 대해 알아보세요.

### 함수 vs 프로퍼티 {id="functions-vs-properties"}

일부 시나리오에서는 인수가 없는 함수가 읽기 전용 프로퍼티와 상호 교환될 수 있습니다. 
의미론적으로는 유사하지만, 어느 것을 선호해야 하는지에 대한 몇 가지 스타일 규칙이 있습니다.

기저 알고리즘이 다음과 같은 경우에는 함수보다 프로퍼티를 선호합니다.

* 예외를 던지지 않음.
* 계산 비용이 저렴함(또는 첫 실행 시 캐시됨).
* 객체 상태가 변경되지 않았다면 호출할 때마다 동일한 결과를 반환함.

### 확장 함수 {id="extension-functions"}

확장 함수를 아낌없이 활용하세요. 주로 특정 객체에 대해 작동하는 함수가 있다면, 그 객체를 수신 객체(receiver)로 받는 확장 함수로 만드는 것을 고려하세요. API 오염을 최소화하려면 확장 함수의 가시성을 합리적인 수준으로 최대한 제한하세요. 필요에 따라 지역 확장 함수, 멤버 확장 함수 또는 private 가시성을 가진 최상위 확장 함수를 사용하세요.

### 중위 함수(Infix function) {id="infix-functions"}

비슷한 역할을 하는 두 객체에 대해 작동할 때만 함수를 `infix`로 선언하세요. 좋은 예: `and`, `to`, `zip`.
나쁜 예: `add`.

수신 객체를 변경하는 메서드는 `infix`로 선언하지 마세요.

### 팩토리 함수 {id="factory-functions"}

클래스에 대한 팩토리 함수를 선언하는 경우 클래스 자체와 동일한 이름을 부여하는 것은 피하세요. 고유한 이름을 사용하여 팩토리 함수의 동작이 특별한 이유를 명확히 하는 것이 좋습니다. 특별한 의미가 정말로 없는 경우에만 클래스와 동일한 이름을 사용할 수 있습니다.

```kotlin
class Point(val x: Double, val y: Double) {
    companion object {
        fun fromPolar(angle: Double, radius: Double) = Point(...)
    }
}
```

서로 다른 슈퍼클래스 생성자를 호출하지 않고 기본값을 가진 파라미터를 포함한 단일 생성자로 축소할 수 없는 오버로드된 생성자가 여러 개 있는 객체의 경우, 오버로드된 생성자를 팩토리 함수로 대체하는 것을 선호합니다.

### 플랫폼 타입 {id="platform-types"}

플랫폼 타입 표현식을 반환하는 공개 함수/메서드는 Kotlin 타입을 명시적으로 선언해야 합니다.

```kotlin
fun apiCall(): String = MyJavaApi.getProperty("name")
```

플랫폼 타입 표현식으로 초기화되는 모든 프로퍼티(패키지 레벨 또는 클래스 레벨)는 Kotlin 타입을 명시적으로 선언해야 합니다.

```kotlin
class Person {
    val name: String = MyJavaApi.getProperty("name")
}
```

플랫폼 타입 표현식으로 초기화되는 지역 값은 타입 선언이 있을 수도 있고 없을 수도 있습니다.

```kotlin
fun main() {
    val name = MyJavaApi.getProperty("name")
    println(name)
}
```

### 범위 지정 함수(Scope functions) apply/with/run/also/let {id="scope-functions-apply-with-run-also-let"}

Kotlin은 주어진 객체의 컨텍스트에서 코드 블록을 실행할 수 있는 일련의 함수(`let`, `run`, `with`, `apply`, `also`)를 제공합니다.
상황에 맞는 적절한 범위 지정 함수를 선택하는 방법에 대한 가이드는 [범위 지정 함수(Scope Functions)](scope-functions.md)를 참조하세요.

## 라이브러리를 위한 코딩 컨벤션 {id="coding-conventions-for-libraries"}

라이브러리를 작성할 때는 API 안정성을 보장하기 위해 다음과 같은 추가 규칙을 따르는 것이 좋습니다.

 * 항상 멤버 가시성을 명시적으로 지정합니다(선언이 실수로 공개 API로 노출되는 것을 방지하기 위함).
 * 항상 함수의 반환 타입과 프로퍼티 타입을 명시적으로 지정합니다(구현이 변경될 때 실수로 반환 타입이 변경되는 것을 방지하기 위함).
 * 새로운 문서화가 필요 없는 오버라이드를 제외하고, 모든 공개 멤버에 대해 [KDoc](kotlin-doc.md) 주석을 제공합니다(라이브러리 문서 생성을 지원하기 위함).

라이브러리용 API를 작성할 때 고려해야 할 모범 사례와 아이디어에 대한 자세한 내용은 [라이브러리 작성자 가이드라인](api-guidelines-introduction.md)에서 확인하세요.