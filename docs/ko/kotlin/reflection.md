[//]: # (title: 리플렉션(Reflection))
[//]: # (description: Kotlin의 내장 리플렉션 지원과 전체 런타임 인트로스펙션을 위해 별도의 kotlin-reflect 라이브러리를 사용하는 방법에 대해 알아봅니다.)

_리플렉션(Reflection)_은 런타임에 프로그램의 구조를 검사(introspect)할 수 있게 해주는 언어 및 라이브러리 기능 모음입니다.
예를 들어 프로퍼티를 읽거나 업데이트하고, 함수를 호출하거나, 클래스 생성자를 호출하여 인스턴스를 생성할 수 있습니다. 이는
컴파일 시점에 선언을 알 수 없을 때 유용합니다.

리플렉션은 컴파일된 선언을 설명하는 런타임 객체를 제공합니다. 예를 들어 클래스는 [`KClass`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-class/)로,
타입은 [`KType`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-type/)으로, 프로퍼티나 함수는 [`KCallable`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-callable/)의 서브타입으로 표현됩니다.
이러한 객체를 검사하고 이를 사용하여 값에 접근하거나 함수를 호출할 수 있습니다.

## 리플렉션의 동작 방식 {id="how-reflection-works"}

[리플렉션 API](https://kotlinlang.org/api/core/kotlin-reflect/)는 `KClass` 또는 `KFunction`과 같은 Kotlin 타입을 통해 컴파일된 선언을 표현합니다.
리플렉션 객체는 선언된 객체의 값이 아니라 선언 자체를 나타냅니다. 예를 들어 `KProperty`를 사용하면
객체에서 해당 프로퍼티의 값을 읽지 않고도 프로퍼티의 이름을 가져오고 반환 타입을 얻을 수 있습니다.

Kotlin은 클래스 리터럴이나 [호출 가능한 참조(callable reference)](lambdas.md#callable-reference)와 같은 몇 가지 기본 기능을 언어 및 표준
라이브러리의 일부로 제공합니다. 더 광범위한 런타임 인트로스펙션 기능을 사용하려면 [`kotlin-reflect`](https://kotlinlang.org/api/core/kotlin-reflect/) 라이브러리를 임포트하세요.

리플렉션 API는 다음 패키지들로 구성됩니다.

* [`kotlin.reflect`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/): 표준 라이브러리의 일부이며 핵심 리플렉션 타입과 함수를 포함합니다.
* [`kotlin.reflect.full`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/): Kotlin 선언을 검사하기 위한 확장 기능을 포함합니다.
* [`kotlin.reflect.jvm`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.jvm/): Kotlin과 Java 리플렉션을 연결하는 JVM 전용 확장 기능을 포함합니다.

> 플랫폼마다 리플렉션 지원이 다를 수 있습니다. 이 페이지는 Kotlin/JVM 리플렉션 API를 기준으로 설명합니다. [Kotlin/JS에서의
> 리플렉션](js-reflection.md)에 대해 자세히 알아보세요.
> 
{style="note"}

### Java 리플렉션과의 상호 운용성 {id="interoperability-with-java-reflection"}

JVM에서 `kotlin-reflect` 라이브러리는 Kotlin과 Java 리플렉션 객체 간의 변환을 위해 [`kotlin.reflect.jvm`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.jvm/) 패키지에서 확장 기능을 제공합니다. 예를 들어 Kotlin 프로퍼티 게터를 구현하는 Java 메서드와
프로퍼티의 뒷받침하는 필드(backing field)를 찾을 수 있습니다.

```kotlin
import kotlin.reflect.jvm.*

class User(val name: String)

fun main() {
    println(User::name.javaGetter)
    // public final java.lang.String User.getName()

    println(User::name.javaField)
    // private final java.lang.String User.name
}
```

Kotlin 프로퍼티가 항상 그에 대응하는 Java 필드나 게터를 가지는 것은 아니므로, 일치하는
Java 리플렉션 객체가 없으면 두 프로퍼티 모두 `null`을 반환합니다.

Kotlin `KClass`와 Java `Class` 객체 간의 변환도 가능합니다. Java 클래스에 해당하는
Kotlin 클래스를 가져오려면 `.kotlin` 확장 프로퍼티를 사용하세요.

```kotlin
fun getKClass(o: Any): KClass<Any> = value.javaClass.kotlin
```

## 런타임 클래스 얻기 {id="obtain-a-runtime-class"}

대부분의 리플렉션 작업은 [`KClass`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-class/)에서 시작됩니다. 이를 얻는 방법은 컴파일 시점에 클래스를 알고 있는지 여부에 따라 달라집니다.

* 컴파일 시점에 알려진 클래스를 참조하려면 `ClassName::class`를 사용합니다.
* 선언된 타입보다 더 구체적일 수 있는 런타임 값의 실제 클래스를 얻으려면 `value::class`를 사용합니다.

```kotlin
import kotlin.reflect.KClass

class User(val name: String)

open class Language
class Kotlin : Language()

fun main() {
    // User를 나타내는 KClass를 반환합니다.
    val userClass: KClass<User> = User::class
    println(userClass.simpleName)
    // User
    
    val language: Language = Kotlin()

    // 런타임 값의 구체적인 클래스를
    // 나타내는 KClass를 반환합니다.
    val runtimeClass: KClass<out Language> = language::class
    println(runtimeClass.simpleName)
    // Kotlin
}
```
{kotlin-runnable="true"}

Kotlin 표준 라이브러리는 클래스를 검사하기 위한 기본적인 도구를 제공합니다. 더 광범위한 런타임 인트로스펙션이 필요하다면 
`kotlin-reflect` 의존성을 추가하고 해당 API를 사용하세요.

## JVM 의존성 추가 {id="add-the-jvm-dependency"}

JVM 플랫폼에서 Kotlin 컴파일러 배포판은 리플렉션 기능을 사용하는 데 필요한 런타임 컴포넌트를 별도의 아티팩트인 `kotlin-reflect.jar`로 포함합니다. 이를 통해 리플렉션 기능을 사용하지 않는 애플리케이션은 이
아티팩트를 제외하여 런타임 클래스패스(classpath)의 크기를 줄일 수 있습니다.

Gradle 또는 Maven 프로젝트에서 리플렉션을 사용하려면 `kotlin-reflect`에 대한 의존성을 추가하세요.

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
dependencies {
    implementation(kotlin("reflect"))
}
```

</tab>
<tab title="Maven" group-key="maven">

```xml
<dependencies>
    <dependency>
        <groupId>org.jetbrains.kotlin</groupId>
        <artifactId>kotlin-reflect</artifactId>
        <version>${kotlin.version}</version>
    </dependency>
</dependencies>
```

</tab>
</tabs>

Gradle이나 Maven을 사용하지 않는 경우 프로젝트의 클래스패스에 `kotlin-reflect.jar`가 포함되어 있는지 확인하세요. 커맨드라인
컴파일러는 기본적으로 이 라이브러리를 추가합니다. 클래스패스에서 제외하려면 `-no-reflect` [컴파일러 옵션](compiler-reference.md#compiler-options)을 사용하세요.

## 타입 검사 {id="inspect-types"}

`KClass`와 `KType`은 서로 다른 정보를 나타냅니다. `KClass`는 타입 인자(type argument)나
null 가능성(nullability)을 보존하지 않고 클래스 자체를 나타냅니다. 예를 들어 `List<String>`과 `List<Int>`는 동일한 `List::class` 표현을 공유하며, `String`과
`String?`은 `String::class`를 공유합니다. 따라서 타입 인자와 null 가능성을 포함하여 정적으로
알려진 타입 `T`에 대한 `KType`을 얻으려면 [`typeOf<T>()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/type-of.html) 함수를 사용하세요.

다음 예제에서 `classifier` 프로퍼티는 타입을 해당 클래스나 타입 파라미터에 연결합니다. `arguments`
컬렉션은 해당 타입의 타입 인자를 포함합니다. 따라서 코드를 통해 `List`와 별개로 `String?`을 검사할 수 있습니다.

```kotlin
import kotlin.reflect.typeOf

fun main() {
    val type = typeOf<List<String?>>()

    println(type.classifier)
    // class kotlin.collections.List
    println(type.arguments.single().type)
    // kotlin.String?
}
```

> JVM에서는 소스 코드에서 타입에 애너테이션을 달았더라도 생성된 타입에 애너테이션이 포함되지 않습니다. 타입
> 애너테이션에 대한 지원은 향후 `kotlin-reflect` 라이브러리 버전에 추가될 수 있습니다.
>
{style="note"}

## 값 확인 {id="check-values"}

대상 타입을 코드에 직접 작성할 때는 [`is`, `as`, `as?` 연산자](typecasts.md)가 작동합니다. 하지만 대상 클래스를 `KClass`에 저장한 경우에는 다음을 사용합니다.

* [`isInstance()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-class/is-instance.html) 함수: 값이 해당 클래스의 인스턴스인지 확인합니다. `true` 또는 `false`를 반환합니다.
* [`cast()`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/cast.html) 함수: 값을 대상 타입으로 캐스팅하여 반환합니다. 값이 `null`이거나 호환되지 않는 타입인 경우 예외를 던집니다.
* [`safeCast()`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/safe-cast.html) 함수: 값을 대상 타입으로 캐스팅하여 반환하거나, 값이 `null`이거나 호환되지 않는 타입인 경우 `null`을 반환합니다.

```kotlin
import kotlin.reflect.cast
import kotlin.reflect.safeCast

fun main() {
    val expectedClass = String::class
    val value: Any = "Kotlin"

    // 캐스팅하지 않고 값을 확인합니다.
    println(expectedClass.isInstance(value))
    // true

    // 값을 String으로 반환합니다.
    val text = expectedClass.cast(value)
    println(text.length)
    // 6

    // 호환되지 않는 캐스트는 예외를 던집니다.
    val failedCast = runCatching {
        Int::class.cast(value)
    }
    println(failedCast.isFailure)
    // true

    // 안전한 캐스트(safe cast)는 동일한 불일치에 대해 null을 나타냅니다.
    val number = Int::class.safeCast(value)
    println(number)
    // null
}
```
{kotlin-runnable="true"}

## 클래스 검사 {id="inspect-a-class"}

`KClass`를 얻은 후에는 해당 클래스의 멤버를 검사할 수 있습니다. 이를 통해 사용하기 전에 어떤 선언이 존재하는지 확인할 수 있습니다.
클래스의 함수와 프로퍼티를 검사하려면 [`members`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-class/members.html) 프로퍼티를 사용하세요. 여기에는 상속된 선언을 포함하여 클래스에서 접근 가능한 모든 선언이 담긴 `KCallable` 객체 컬렉션이 포함되어 있습니다.

예를 들어 다음 코드는 데이터 클래스에서 접근 가능한 함수와 프로퍼티를 나열합니다.

```kotlin
data class User(val name: String, val age: Int)

fun main() {
    println(User::class.members.map { it.name }.sorted())
    // [age, component1, component2, copy, equals, hashCode, name, toString]
}
```

`kotlin.reflect.full` 패키지는 종류, 스코프, 수신 객체별로 선언을 선택할 수 있는 보다 구체적인 프로퍼티들을 제공합니다.

| 프로퍼티 | 반환값 |
|---|---|
| [`declaredMembers`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/declared-members.html) | 상속된 선언을 제외하고 클래스에 직접 선언된 함수 및 프로퍼티 |
| [`functions`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/functions.html) | 클래스에서 사용 가능한 모든 함수: 클래스 및 상위 클래스의 비정적 함수, 클래스에 선언된 정적 함수 |
| [`declaredFunctions`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/declared-functions.html) | 클래스에 선언된 모든 함수 |
| [`memberFunctions`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/member-functions.html) | 클래스 및 상위 클래스에 선언된 확장이 아닌 비정적 함수 |
| [`declaredMemberFunctions`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/declared-member-functions.html) | 클래스에 선언된 확장이 아닌 비정적 함수 |
| [`memberExtensionFunctions`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/member-extension-functions.html) | 클래스 또는 상위 클래스의 멤버로 선언된 확장 함수 |
| [`declaredMemberExtensionFunctions`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/declared-member-extension-functions.html) | 클래스에 선언된 확장 함수 |
| [`staticFunctions`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/static-functions.html) | 클래스에 선언된 정적 함수 |
| [`memberProperties`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/member-properties.html) | 클래스 및 상위 클래스에 선언된 확장이 아닌 프로퍼티 |
| [`declaredMemberProperties`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/declared-member-properties.html) | 클래스에 선언된 확장이 아닌 프로퍼티 |
| [`memberExtensionProperties`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/member-extension-properties.html) | 클래스 또는 상위 클래스의 멤버로 선언된 확장 프로퍼티 |
| [`declaredMemberExtensionProperties`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/declared-member-extension-properties.html) | 클래스에 멤버로 선언된 확장 프로퍼티 |
| [`staticProperties`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/static-properties.html) | Java 클래스에 선언된 정적 필드를 나타내는 프로퍼티 |

코드에 필요한 선언과 일치하는 가장 좁은 범위의 프로퍼티를 선택하세요. 예를 들어 직렬화 도구(serializer)는 특정 클래스에서 도입된 프로퍼티만 처리하기 위해
`declaredMemberProperties`를 사용할 수 있지만, 호출 가능한 API를 검색하는 프레임워크는 상속된 `memberFunctions`도
필요할 수 있습니다.

리플렉션을 사용하여 [sealed 서브클래스를 검사](sealed-classes.md#inspect-sealed-subclasses-with-reflection)할 수도 있습니다.

## 프로퍼티 읽기 {id="read-a-property"}

리플렉션을 사용하면 런타임에 선택된 프로퍼티를 읽을 수 있습니다.
예를 들어 `User` 객체에서 표시할 프로퍼티로 `name`을 지정하는 UI 설정이 있다고 가정해 보겠습니다.
이를 위해 애플리케이션은 일치하는 프로퍼티 선언을 찾은 다음 해당 게터를 호출해야 합니다.

```kotlin
import kotlin.reflect.full.memberProperties

data class User(val name: String, val age: Int)

fun readProperty(instance: Any, propertyName: String): Any? {
    // 런타임 클래스 검사
    val runtimeClass = instance::class

    // 프로퍼티 선언 찾기
    val property = runtimeClass.memberProperties
        .firstOrNull { it.name == propertyName }
        ?: error("Unknown property: $propertyName")

    // 객체를 수신 객체로 전달하여 게터 호출
    return property.getter.call(instance)
}

fun main() {
    val user = User("Jane Doe", 22)

    println(readProperty(user, "name"))
    // Jane Doe
    println(readProperty(user, "age"))
    // 22
}
```

이 예제에서는 [`memberProperties`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/member-properties.html)를 사용하여 언바운드(unbound) 프로퍼티 객체를 반환합니다. 이 객체들은 클래스에
속하지만 특정 인스턴스에 연결되어 있지 않은 프로퍼티를 설명합니다. 따라서 `getter.call()`의 수신 객체로 `instance`를
전달해야 합니다. 런타임에 선택된 프로퍼티는 어떤 타입이든 반환할 수 있으므로 결과는 `Any?` 타입을 가집니다.

> 컴파일 시점에 프로퍼티를 알고 있다면 리플렉션 대신 직접 프로퍼티에 접근하거나 [호출 가능한 참조](lambdas.md#callable-reference)를 사용하세요.
> 
{style="tip"}

## 함수 호출 {id="call-a-function"}

동적 함수 호출도 [프로퍼티](#프로퍼티-읽기)와 동일한 패턴을 따릅니다. 모든 인자를 선언된 순서대로 사용할 수 있다면
[`call()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-callable/call.html)을 사용할 수 있습니다. 언바운드 멤버 함수를 선언할 때는 객체 인스턴스를 먼저 전달한 다음, 일반 인자들을 차례로 추가합니다.

```kotlin
import kotlin.reflect.full.memberFunctions

class Formatter {
    fun format(text: String, uppercase: Boolean): String =
        if (uppercase) text.uppercase() else text
}

fun main() {
    val formatter = Formatter()

    // 런타임에 이름으로 함수 찾기
    val function = Formatter::class.memberFunctions
        .single { it.name == "format" }

    // 수신 객체를 먼저 제공한 다음, 선언된 인자들을 순서대로 제공
    val result = function.call(formatter, "Kotlin", true)

    println(result)
    // KOTLIN
}
```

이 예제에서 호출에는 세 가지 값(`Formatter` 수신 객체, `text`, `uppercase`)이 포함됩니다. 이 함수 또한 `Any?` 타입을 반환하며,
호환되지 않는 수신 객체나 인자가 전달될 경우 런타임에 오류를 보고합니다.

위치별로 인자를 제공하는 대신 값을 `KParameter` 객체와 연결할 수도 있습니다. 이를 위해서는 [`callBy()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-callable/call-by.html)
함수를 사용하세요.

```kotlin
import kotlin.reflect.full.instanceParameter
import kotlin.reflect.full.memberFunctions
import kotlin.reflect.full.valueParameters

class Greeter {
    fun greet(name: String, punctuation: String = "!") =
        "Hello, $name$punctuation"
}

fun main() {
    val greeter = Greeter()
    val function = Greeter::class.memberFunctions
        .single { it.name == "greet" }

    // valueParameters는 greet()에 선언된 파라미터를 포함하지만
    // Greeter 수신 객체는 포함하지 않습니다.
    val nameParameter = function.valueParameters
        .single { it.name == "name" }

    val result = function.callBy(
        mapOf(
            // 멤버 함수는 인스턴스 수신 객체가 필요합니다.
            function.instanceParameter!! to greeter,
            nameParameter to "Kotlin"
        )
    )

    println(result)
    // Hello, Kotlin!
}
```

이 예제에서 `instanceParameter`는 멤버 함수의 수신 객체를 식별하며, `valueParameters`는 함수 시그니처에 선언된 파라미터만 포함합니다.

> 순서가 지정된 완전한 인자 목록을 이미 가지고 있는 경우에는 `call()`을 사용하세요.
> 
> 인자를 파라미터 객체에 매핑하거나 선택적(optional) 파라미터가 기본값을 사용하도록 하려면 `callBy()`를 사용하세요.
> 
{style="tip"}