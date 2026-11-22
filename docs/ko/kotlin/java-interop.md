[//]: # (title: Kotlin에서 Java 호출하기)
<web-summary>게터와 세터, 널 안전성 및 플랫폼 타입, 널 가능성 어노테이션, 매핑된 타입, SAM 변환을 포함하여 Kotlin에서 Java 코드를 호출하는 방법을 알아봅니다.</web-summary>

Kotlin은 Java 상호 운용성을 염두에 두고 설계되었습니다. 기존 Java 코드를 Kotlin에서 자연스러운 방식으로 호출할 수 있으며, Kotlin 코드 역시 Java에서 사용할 수 있습니다.

대부분의 Java 코드는 추가 설정 없이 바로 사용할 수 있습니다.

```kotlin
import java.util.*

fun demo(source: List<Int>) {
    val list = ArrayList<Int>()
    // Java 컬렉션에서도 'for' 루프가 동작합니다:
    for (item in source) {
        list.add(item)
    }
    // 연산자 규칙도 동일하게 적용됩니다:
    for (i in 0..<source.size) {
        list[i] = source[i] // get과 set이 호출됩니다
    }
}
```

## 게터와 세터 {id="getters-and-setters"}

게터(getter)와 세터(setter)에 대한 Java 규칙(이름이 `get`으로 시작하는 인자 없는 메서드 및 이름이 `set`으로 시작하는 단일 인자 메서드)을 따르는 메서드는 Kotlin에서 프로퍼티로 표현됩니다. 이러한 프로퍼티를 _합성 프로퍼티(synthetic properties)_라고도 부릅니다. 
`Boolean` 접근자 메서드(게터의 이름이 `is`로 시작하고 세터의 이름이 `set`으로 시작하는 경우)는 게터 메서드와 동일한 이름을 가진 프로퍼티로 표현됩니다.

```kotlin
import java.util.Calendar

fun calendarDemo() {
    val calendar = Calendar.getInstance()
    if (calendar.firstDayOfWeek == Calendar.SUNDAY) { // getFirstDayOfWeek() 호출
        calendar.firstDayOfWeek = Calendar.MONDAY     // setFirstDayOfWeek() 호출
    }
    if (!calendar.isLenient) {    // isLenient() 호출
        calendar.isLenient = true // setLenient() 호출
    }
}
```

위 코드의 `calendar.firstDayOfWeek`가 합성 프로퍼티의 예입니다.

Java 클래스에 세터만 있는 경우, Kotlin은 세터 전용(set-only) 프로퍼티를 지원하지 않으므로 Kotlin에서 프로퍼티로 표시되지 않습니다.

인자가 없는 게터만 합성 프로퍼티로 표현됩니다. 게터에 인자를 받는 오버로드가 있는 경우, 해당 오버로드는 프로퍼티로 노출되지 않으며 대부분의 경우 전체 메서드 이름을 사용하여 호출해야 합니다. 다음 Java 클래스를 살펴보겠습니다.

```java
// Java
public class Greeting {
    public String getMessage() {
        return "Hello!";
    }

    public String getMessage(String name) {
        return "Hello, " + name + "!";
    }
}
```

인자가 없는 `getMessage()` 메서드는 합성 `message` 프로퍼티를 통해 접근할 수 있습니다. 오버로드된 `getMessage(String)` 메서드를 사용하려면 함수로 호출해야 합니다.

```kotlin
// Kotlin
fun main() {
    val greeting = Greeting()
    println(greeting.message)              // 합성 프로퍼티를 통해 getMessage()에 접근
    println(greeting.getMessage("Kotlin")) // 오버로드된 getMessage(String) 메서드 호출
}
```

`greeting.message("Kotlin")`을 호출하면 `message` 프로퍼티가 인자를 받지 않기 때문에 컴파일되지 않고 미확인 참조 오류(unresolved reference error, 수신 객체 타입 불일치)가 발생합니다.

하지만 매개변수가 있는 Java 메서드가 Kotlin의 [멤버 확장 프로퍼티](extensions.md#declaring-extensions-as-members)의 게터를 오버라이드하는 특수한 경우에는 Kotlin이 해당 메서드를 프로퍼티로 취급합니다. 따라서 수신 객체의 스코프 내에서 프로퍼티로만 호출할 수 있으며 메서드 이름으로는 호출할 수 없습니다.

```java
// Java
public class Greeter implements Message {
    public String getText(String name) {
        return "Hello, " + name + "!";
    }
}
```

```kotlin
// Kotlin
interface Message {
    val String.text: String
}

fun demo(greeter: Greeter) {
    greeter.getText("Kotlin")       // 오류: unresolved reference
    with(greeter) { "Kotlin".text } // 멤버 확장 프로퍼티를 통해 getText(String)에 접근
}
```

## `void`를 반환하는 메서드 {id="methods-returning-void"}

Java 메서드가 `void`를 반환하는 경우, Kotlin에서 호출할 때 반환 타입은 `Unit`이 됩니다. 해당 반환값을 사용하면, 반환될 값을 미리 알 수 있으므로 Kotlin 컴파일러가 호출 위치에서 `Unit`을 할당합니다.

## Kotlin의 키워드인 Java 식별자 이스케이프 {id="escaping-for-java-identifiers-that-are-keywords-in-kotlin"}

Kotlin의 키워드 중 일부(`in`, `object`, `is` 등)는 Java에서 유효한 식별자입니다. Java 라이브러리가 메서드 이름으로 Kotlin 키워드를 사용하는 경우, 백틱(`) 문자로 이스케이프하여 메서드를 호출할 수 있습니다.

```kotlin
matcher.`is`(expected)
```

## 널 안전성과 플랫폼 타입 {id="null-safety-and-platform-types"}

Java의 모든 참조는 `null`이 될 수 있으므로, Kotlin의 엄격한 널 안전성 요구사항을 Java에서 전달된 객체에 적용하는 것은 실용적이지 않습니다.
Java 선언의 타입은 Kotlin에서 직접 표기할 수 없는 타입(non-denotable)으로 취급되며 이를 [_플랫폼 타입(platform types)_](https://kotlinlang.org/spec/type-system.html#platform-types)이라고 부릅니다.
코드에 플랫폼 타입을 명시적으로 작성할 수는 없습니다. 따라서 플랫폼 값이 Kotlin 변수에 할당될 때는 다음과 같이 처리할 수 있습니다:

* 타입 추론에 의존합니다. 이 경우 변수는 추론된 플랫폼 타입을 갖게 됩니다.
* 예상되는 타입을 직접 지정합니다. Kotlin에서는 널 가능(nullable) 및 널 불가능(non-nullable) 타입을 모두 허용합니다.

플랫폼 타입에 대해서는 널 검사가 완화되므로, [매핑된 Java 타입](#mapped-types)과 동일한 안전성을 보장받습니다. 다음 예제를 살펴보겠습니다:

```kotlin
val list = ArrayList<String>() // Non-null (생성자 호출 결과)
list.add("Item")
val size = list.size // Non-null (기본형 int)
val item = list[0] // 플랫폼 타입으로 추론됨 (일반 Java 객체)
```

플랫폼 타입 변수의 메서드를 호출할 때 Kotlin은 컴파일 시점에 널 가능성 오류를 발생시키지 않지만, 널 포인터 예외(null-pointer exception)가 발생하거나 Kotlin이 널 전파를 막기 위해 생성한 단언(assertion) 때문에 런타임에 호출이 실패할 수 있습니다:

```kotlin
item.substring(1) // 허용됨, item == null인 경우 예외 발생
```

플랫폼 타입의 값은 널 가능 및 널 불가능 Kotlin 변수 모두에 할당할 수 있습니다. 하지만 non-nullable 타입의 변수에 할당했을 때 런타임에 실제 값이 `null`이라면 Kotlin은 `NullPointerException`을 발생시킵니다. 이를 방지하려면 Kotlin 코드에 명시적으로 널 가능성을 지정하세요:

```kotlin
val nullable: String? = item // 허용됨, 항상 정상 동작함
val notNull: String = item // 허용됨, 런타임에 실패할 수 있음
```

non-nullable 타입을 선택하면 컴파일러가 할당 시점에 단언(assertion) 코드를 생성합니다. 이를 통해 Kotlin의 non-nullable 변수가 널 값을 보유하는 것을 방지합니다. non-null 값을 기대하는 Kotlin 함수에 플랫폼 값을 전달할 때나 기타 여러 경우에도 단언이 생성됩니다.
전반적으로 컴파일러는 프로그램 전체에 널이 퍼져나가는 것을 방지하기 위해 최선을 다하지만, 제네릭으로 인해 이를 완전히 제거하는 것이 불가능한 경우도 있습니다.

### 플랫폼 타입 표기법 {id="notation-for-platform-types"}

앞서 언급했듯이 플랫폼 타입은 프로그램 내에서 명시적으로 표기할 수 없으므로 언어 내에 별도의 문법이 존재하지 않습니다. 하지만 컴파일러와 IDE는 때때로 이를 표시해야 하므로(예: 오류 메시지나 매개변수 정보), 다음과 같은 기억용 표기법(mnemonic notation)을 사용합니다:

* `T!`는 "`T` 또는 `T?`"를 의미합니다.
* `(Mutable)Collection<T>!`는 "가변일 수도 있고 아닐 수도 있으며, 널 가능일 수도 있고 아닐 수도 있는 Java의 `T` 컬렉션"을 의미합니다.
* `Array<(out) T>!`는 "널 가능일 수도 있고 아닐 수도 있는, `T`(또는 `T`의 하위 타입)의 Java 배열"을 의미합니다.

오류 메시지나 IDE 툴팁에서 이러한 표기법을 보게 된다면, Kotlin 변수에 명시적 타입 어노테이션을 추가하여 널 안전성 검사를 복원하거나 널 가능성 어노테이션을 사용하여 소스 차원에서 플랫폼 타입을 제거할 수 있습니다.

### 널 가능성 어노테이션 {id="nullability-annotations"}

널 가능성 어노테이션(nullability annotation)이 있는 Java 타입은 플랫폼 타입이 아니라 실제 널 가능(nullable) 또는 널 불가능(non-nullable) Kotlin 타입으로 표현됩니다. 컴파일러는 다음을 포함하여 여러 종류의 널 가능성 어노테이션을 지원합니다:

* [JetBrains](https://www.jetbrains.com/idea/help/nullable-and-notnull-annotations.html)
  (`org.jetbrains.annotations` 패키지의 `@Nullable` 및 `@NotNull`)
* [JSpecify](#jspecify-support) (`org.jspecify.annotations`)
* Android (`com.android.annotations`, `android.support.annotation`, `androidx.annotation`, `android.annotation`)
* [JSR-305](#jsr-305-support) (`javax.annotation`)
* FindBugs (`edu.umd.cs.findbugs.annotations`)
* Eclipse (`org.eclipse.jdt.annotation`)
* [Lombok](lombok.md) (`lombok.NonNull`)
* RxJava 3 (`io.reactivex.rxjava3.annotations`)
* [Vert.x](https://vertx.io/) (`io.vertx.codegen.annotations`)

다음 컴파일러 옵션을 사용하여 특정 널 가능성 어노테이션에 대해 널 가능성 불일치를 보고하도록 컴파일러에 지시할 수 있습니다:

```bash
-Xnullability-annotations=@<package-name>:<report-level>
``` 

정규화된 널 가능성 어노테이션의 패키지 이름과 다음 보고 수준(report level) 중 하나를 지정합니다:

* `ignore`: 널 가능성 불일치 무시
* `warn`: 경고 보고
* `strict`: 오류 보고

> [JSpecify](#jspecify-support)는 기본적으로 `strict` 보고 수준을 사용하는 유일하게 지원되는 어노테이션 종류입니다.
> 추가 구성 없이 널 가능성 어노테이션에 대해 오류를 보고하려면 JSpecify를 사용하세요.
>
{style="note"}

지원되는 널 가능성 어노테이션의 전체 목록은 [Kotlin 컴파일러 소스 코드](https://github.com/JetBrains/kotlin/blob/master/core/compiler.common.jvm/src/org/jetbrains/kotlin/load/java/JvmAnnotationNames.kt)에서 확인할 수 있습니다.

### 가변성 어노테이션 {id="mutability-annotations"}

Java 선언에 가변성 어노테이션(mutability annotation)을 지정하여 반환된 컬렉션이 Kotlin에서 읽기 전용인지 가변(mutable)인지를 지정할 수 있습니다.
가변성이 다른 컬렉션 타입에 값을 할당하면 컴파일러가 타입 불일치를 보고합니다.
진단 심각도는 특정 가변성 어노테이션에 따라 다릅니다.

컴파일러는 다음을 포함한 여러 가변성 어노테이션을 지원합니다:

* `kotlin.annotations.jvm.ReadOnly`
* `kotlin.annotations.jvm.Mutable`
* `org.jetbrains.annotations.Unmodifiable`
* `org.jetbrains.annotations.UnmodifiableView`

지원되는 가변성 어노테이션의 전체 목록은 [Kotlin 컴파일러 소스 코드](https://github.com/JetBrains/kotlin/blob/master/core/compiler.common.jvm/src/org/jetbrains/kotlin/load/java/JvmAnnotationNames.kt)에서 확인할 수 있습니다.

### 타입 인자 및 타입 매개변수 어노테이션 지정 {id="annotating-type-arguments-and-type-parameters"}

제네릭 타입의 타입 인자(type argument)와 타입 매개변수(type parameter)에도 어노테이션을 추가하여 널 가능성 정보를 제공할 수 있습니다.

> 이 섹션의 모든 예제는 `org.jetbrains.annotations` 패키지의 JetBrains 널 가능성 어노테이션을 사용합니다.
>
{style="note"}

#### 타입 인자 {id="type-arguments"}

Java 선언에 다음과 같은 어노테이션이 있다고 가정해 보겠습니다:

```java
@NotNull
Set<@NotNull String> toSet(@NotNull Collection<@NotNull String> elements) { ... }
```

이 코드는 Kotlin에서 다음과 같은 시그니처가 됩니다:

```kotlin
fun toSet(elements: (Mutable)Collection<String>) : (Mutable)Set<String> { ... }
```

타입 인자에서 `@NotNull` 어노테이션이 누락되면 대신 플랫폼 타입이 됩니다:

```kotlin
fun toSet(elements: (Mutable)Collection<String!>) : (Mutable)Set<String!> { ... }
```

Kotlin은 기본 클래스 및 인터페이스의 타입 인자에 지정된 널 가능성 어노테이션도 고려합니다. 예를 들어 아래와 같은 시그니처를 가진 두 개의 Java 클래스가 있습니다:

```java
public class Base<T> {}
```

```java
public class Derived extends Base<@Nullable String> {}
```

Kotlin 코드에서 `Base<String>`이 필요한 곳에 `Derived` 인스턴스를 전달하면 경고가 발생합니다.

```kotlin
fun takeBaseOfNotNullStrings(x: Base<String>) {}

fun main() {
    takeBaseOfNotNullStrings(Derived()) // 경고: nullability mismatch
}
```

`Derived`의 상위 바운드가 `Base<String?>`으로 설정되어 있으며, 이는 `Base<String>`과 다르기 때문입니다.

[Kotlin에서의 Java 제네릭](#java-generics-in-kotlin)에 대해 자세히 알아보세요.

#### 타입 매개변수 {id="type-parameters"}

기본적으로 Kotlin과 Java 모두에서 일반 타입 매개변수의 널 가능성은 정의되지 않은 상태(undefined)입니다. Java에서는 널 가능성 어노테이션을 사용하여 이를 명시할 수 있습니다. `Base` 클래스의 타입 매개변수에 어노테이션을 지정해 보겠습니다:

```java
public class Base<@NotNull T> {}
```

`Base`를 상속할 때 Kotlin은 non-nullable 타입 인자 또는 타입 매개변수를 기대합니다.
따라서 다음 Kotlin 코드는 경고를 생성합니다:

```kotlin
class Derived<K> : Base<K> {} // 경고: K has undefined nullability
```

상위 바운드 `K : Any`를 지정하여 이를 해결할 수 있습니다.

Kotlin은 Java 타입 매개변수의 바운드에 붙은 널 가능성 어노테이션도 지원합니다. `Base`에 바운드를 추가해 보겠습니다:

```java
public class BaseWithBound<T extends @NotNull Number> {}
```

Kotlin은 이를 다음과 같이 변환합니다:

```kotlin
class BaseWithBound<T : Number> {}
```

따라서 널 가능 타입을 타입 인자 또는 타입 매개변수로 전달하면 경고가 발생합니다.

타입 인자 및 타입 매개변수에 대한 어노테이션 지정은 Java 8 타깃 이상에서 작동합니다. 이 기능을 사용하려면 널 가능성 어노테이션이 `TYPE_USE` 타깃을 지원해야 합니다(`org.jetbrains.annotations`는 버전 15 이상에서 이를 지원합니다).

> 널 가능성 어노테이션이 `TYPE_USE` 타깃 외에도 타입에 적용 가능한 다른 타깃을 함께 지원하는 경우, `TYPE_USE`가 우선합니다. 예를 들어 `@Nullable`에 `TYPE_USE`와 `METHOD` 타깃이 모두 있는 경우, Java 메서드 시그니처 `@Nullable String[] f()`는 Kotlin에서 `fun f(): Array<String?>!`가 됩니다.
>
{style="note"}

### JSpecify 지원 {id="jspecify-support"}

Kotlin은 Java 널 가능성을 위한 통합 어노테이션 세트를 제공하는 [JSpecify](https://jspecify.dev/) 널 가능성 어노테이션을 지원합니다. JSpecify를 사용하면 Java 선언에 대해 상세한 널 가능성 정보를 제공할 수 있으므로, Kotlin이 Java 코드와 함께 동작할 때 널 안전성을 유지하는 데 도움이 됩니다.

Kotlin은 `org.jspecify.annotations` 패키지의 다음 어노테이션들을 지원합니다:

* `@Nullable`: 타입을 널 가능(nullable)으로 표시합니다.
* `@NonNull`: 타입을 널 불가능(non-nullable)으로 표시합니다.
* `@NullMarked`: 클래스나 패키지와 같은 스코프 내의 모든 타입을 달리 어노테이션이 지정되지 않는 한 기본적으로 non-nullable로 표시합니다.

  이 어노테이션은 지역 변수 및 [타입 변수(제네릭)](https://jspecify.dev/docs/user-guide/#using-type-variables-in-generic-types)에는 적용되지 않습니다.
  타입 변수는 특정한 널 가능 또는 널 불가능 타입이 제공될 때까지 "널 무관(null-agnostic)" 상태로 유지됩니다.

* `@NullUnmarked`: `@NullMarked`의 효과를 반전시켜 스코프 내의 모든 타입을 [플랫폼 타입](#null-safety-and-platform-types)으로 만듭니다.

JSpecify 어노테이션이 적용된 다음 Java 클래스를 살펴보겠습니다:
 
```java
// Java
import org.jspecify.annotations.*;

@NullMarked
public class InventoryService {
    public String notNull() { return ""; }
    public @Nullable String nullable() { return null; }
}
```
 
Kotlin에서는 이들이 [플랫폼 타입](#null-safety-and-platform-types)이 아닌 일반적인 널 가능 및 널 불가능 타입으로 취급됩니다:
 
```kotlin
// Kotlin
fun test(inventory: InventoryService) {
    inventory.notNull().length  // 정상 동작
    inventory.nullable().length // 오류: 안전 호출(?.) 또는 non-null 단언(!!) 호출만 허용됨
}
```

기본적으로 Kotlin 컴파일러는 JSpecify 어노테이션에 대한 널 가능성 불일치를 오류로 보고합니다.
다음 컴파일러 옵션을 사용하여 JSpecify 널 가능성 진단의 심각도를 사용자 정의할 수 있습니다:

```bash
-Xjspecify-annotations=<report-level>
```

사용 가능한 보고 수준은 다음과 같습니다:

| 수준       | 설명                                     |
|----------|----------------------------------------|
| `strict` | 널 가능성 불일치에 대해 오류를 보고합니다(기본값).          |
| `warn`   | 경고를 보고합니다.                             |
| `ignore` | 널 가능성 불일치를 무시합니다.                       |

> JSpecify 어노테이션에 대한 자세한 내용은 [JSpecify 사용자 가이드](https://jspecify.dev/docs/user-guide)를 참조하세요.
> 
{type="tip"}

### JSR-305 지원 {id="jsr-305-support"}

Java 타입의 널 가능성을 나타내기 위해 [JSR-305](https://jcp.org/en/jsr/detail?id=305)에 정의된 [`@Nonnull`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/Nonnull.html) 어노테이션이 지원됩니다.

`@Nonnull(when = ...)` 값이 `When.ALWAYS`인 경우 어노테이션이 달린 타입은 non-nullable로 취급되고, `When.MAYBE`와 `When.NEVER`는 nullable 타입을 나타내며, `When.UNKNOWN`은 해당 타입을 [플랫폼 타입](#null-safety-and-platform-types)으로 강제합니다.

라이브러리는 JSR-305 어노테이션을 대상으로 컴파일될 수 있지만, 라이브러리 사용자를 위해 어노테이션이 포함된 아티팩트(예: `jsr305.jar`)를 컴파일 종속성으로 포함할 필요는 없습니다. Kotlin 컴파일러는 클래스패스에 해당 어노테이션이 없어도 라이브러리에서 JSR-305 어노테이션을 읽을 수 있습니다.

[커스텀 널 가능성 한정자 (KEEP-79)](https://github.com/Kotlin/KEEP/blob/master/proposals/jsr-305-custom-nullability-qualifiers.md)도 지원됩니다(아래 참조).

#### 타입 한정자 닉네임 {id="type-qualifier-nicknames"}

어노테이션 타입에 [`@TypeQualifierNickname`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/meta/TypeQualifierNickname.html)과 JSR-305의 `@Nonnull`(또는 `@CheckForNull`과 같은 다른 닉네임)이 모두 지정된 경우, 해당 어노테이션 타입 자체가 정확한 널 가능성을 확인하는 데 사용되며 원본 널 가능성 어노테이션과 동일한 의미를 갖습니다:

```java
@TypeQualifierNickname
@Nonnull(when = When.ALWAYS)
@Retention(RetentionPolicy.RUNTIME)
public @interface MyNonnull {
}

@TypeQualifierNickname
@CheckForNull // 다른 타입 한정자 닉네임의 닉네임
@Retention(RetentionPolicy.RUNTIME)
public @interface MyNullable {
}

interface A {
    @MyNullable String foo(@MyNonnull String x);
    // Kotlin에서 (strict 모드): `fun foo(x: String): String?`

    String bar(List<@MyNonnull String> x);
    // Kotlin에서 (strict 모드): `fun bar(x: List<String>!): String!`
}
```

#### 기본 타입 한정자 {id="type-qualifier-defaults"}

[`@TypeQualifierDefault`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/meta/TypeQualifierDefault.html)를 사용하면 적용 시 어노테이션이 지정된 요소의 스코프 내에서 기본 널 가능성을 정의하는 어노테이션을 도입할 수 있습니다.

이러한 어노테이션 타입은 `@Nonnull`(또는 그 닉네임)과 하나 이상의 `ElementType` 값을 가진 `@TypeQualifierDefault(...)`를 모두 지정해야 합니다:

* `ElementType.METHOD`: 메서드의 반환 타입
* `ElementType.PARAMETER`: 값 매개변수
* `ElementType.FIELD`: 필드
* `ElementType.TYPE_USE`: 타입 인자, 타입 매개변수의 상위 바운드 및 와일드카드 타입을 포함한 모든 타입

타입 자체에 널 가능성 어노테이션이 지정되지 않은 경우 기본 널 가능성이 적용되며, 해당 기본값은 타입 사용처와 일치하는 `ElementType`을 가진 기본 타입 한정자 어노테이션으로 감싸진 가장 안쪽의 요소에 의해 결정됩니다.

```java
@Nonnull
@TypeQualifierDefault({ElementType.METHOD, ElementType.PARAMETER})
public @interface NonNullApi {
}

@Nonnull(when = When.MAYBE)
@TypeQualifierDefault({ElementType.METHOD, ElementType.PARAMETER, ElementType.TYPE_USE})
public @interface NullableApi {
}

@NullableApi
interface A {
    String foo(String x); // Kotlin: fun foo(x: String?): String?

    @NonNullApi // 인터페이스의 기본값을 오버라이드
    String bar(String x, @Nullable String y); // Kotlin: fun bar(x: String, y: String?): String

    // `@NullableApi`가 `TYPE_USE` 엘리먼트 타입을 가지므로
    // List<String>의 타입 인자는 nullable로 취급됩니다:
    String baz(List<String> x); // Kotlin: fun baz(List<String?>?): String?

    // 명시적으로 UNKNOWN으로 표시된 널 가능성 어노테이션이 있으므로
    // `x` 매개변수의 타입은 플랫폼 타입으로 유지됩니다:
    String qux(@Nonnull(when = When.UNKNOWN) String x); // Kotlin: fun qux(x: String!): String?
}
```

> 이 예제의 타입들은 strict 모드가 활성화된 경우에만 적용되며, 그렇지 않으면 플랫폼 타입으로 유지됩니다.
> [`@UnderMigration` 어노테이션](#undermigration-annotation) 및 [컴파일러 구성](#compiler-configuration) 섹션을 참조하세요.
>
{style="note"}

패키지 수준의 기본 널 가능성도 지원됩니다:

```java
// FILE: test/package-info.java
@NonNullApi // 'test' 패키지의 모든 타입을 기본적으로 non-nullable로 선언
package test;
```

#### @UnderMigration 어노테이션 {id="undermigration-annotation"}

라이브러리 유지보수자는 별도의 아티팩트 `kotlin-annotations-jvm`에서 제공되는 `@UnderMigration` 어노테이션을 사용하여 널 가능성 타입 한정자의 마이그레이션 상태를 정의할 수 있습니다.

`@UnderMigration(status = ...)`의 상태 값은 컴파일러가 Kotlin에서 어노테이션이 지정된 타입을 부적절하게 사용하는 경우(예: `@MyNullable`이 지정된 타입 값을 non-null로 사용) 이를 어떻게 처리할지 지정합니다:

* `MigrationStatus.STRICT`: 어노테이션이 일반적인 널 가능성 어노테이션과 동일하게 작동하도록 합니다. 즉, 부적절한 사용에 대해 오류를 보고하고 어노테이션이 지정된 선언의 타입이 Kotlin에 표시되는 방식에 영향을 줍니다.
* `MigrationStatus.WARN`: 부적절한 사용이 오류 대신 컴파일 경고로 보고되지만, 어노테이션이 지정된 선언의 타입은 플랫폼 타입으로 유지됩니다.
* `MigrationStatus.IGNORE`: 컴파일러가 널 가능성 어노테이션을 완전히 무시하도록 합니다.

라이브러리 유지보수자는 타입 한정자 닉네임과 기본 타입 한정자 모두에 `@UnderMigration` 상태를 추가할 수 있습니다:

```java
@Nonnull(when = When.ALWAYS)
@TypeQualifierDefault({ElementType.METHOD, ElementType.PARAMETER})
@UnderMigration(status = MigrationStatus.WARN)
public @interface NonNullApi {
}

// 클래스 내의 타입은 non-nullable이지만, `@NonNullApi`에
// `@UnderMigration(status = MigrationStatus.WARN)`이 지정되어 있으므로 경고만 보고됩니다
@NonNullApi
public class Test {}
```

> 널 가능성 어노테이션의 마이그레이션 상태는 타입 한정자 닉네임으로 상속되지 않지만, 기본 타입 한정자에서의 사용에는 적용됩니다.
>
{style="note"}

기본 타입 한정자가 타입 한정자 닉네임을 사용하고 둘 다 `@UnderMigration`이 적용되어 있는 경우, 기본 타입 한정자의 상태가 사용됩니다.

#### 컴파일러 구성 {id="compiler-configuration"}

JSR-305 검사는 다음과 같은 값(및 이들의 조합)으로 `-Xjsr305` 컴파일러 옵션을 추가하여 구성할 수 있습니다:

* `-Xjsr305={strict|warn|ignore}`: `@UnderMigration`이 아닌 어노테이션의 동작을 설정합니다. 커스텀 널 가능성 한정자, 특히 `@TypeQualifierDefault`는 이미 널리 알려진 많은 라이브러리에 퍼져 있으며 사용자는 JSR-305 지원이 포함된 Kotlin 버전으로 업데이트할 때 원활하게 마이그레이션해야 할 수 있습니다. 이 옵션은 `@UnderMigration`이 아닌 어노테이션에만 영향을 줍니다.
* `-Xjsr305=under-migration:{strict|warn|ignore}`: `@UnderMigration` 어노테이션의 동작을 재정의합니다. 사용자는 라이브러리의 마이그레이션 상태에 대해 서로 다른 관점을 가질 수 있습니다. 즉, 공식 마이그레이션 상태가 `WARN`인 동안 오류가 발생하기를 원할 수도 있고 반대로 마이그레이션을 완료할 때까지 오류 보고를 연기하기를 원할 수도 있습니다.
* `-Xjsr305=@<fq.name>:{strict|warn|ignore}`: 단일 어노테이션에 대한 동작을 재정의합니다. 여기서 `<fq.name>`은 어노테이션의 정규화된 클래스 이름입니다. 서로 다른 어노테이션에 대해 여러 번 나타날 수 있습니다. 이는 특정 라이브러리의 마이그레이션 상태를 관리하는 데 유용합니다.

`strict`, `warn`, `ignore` 값은 `MigrationStatus`의 값과 동일한 의미를 가지며, `strict` 모드만 Kotlin에서 어노테이션이 지정된 선언의 타입에 영향을 줍니다.

> 기본 제공 JSR-305 어노테이션인 [`@Nonnull`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/Nonnull.html), [`@Nullable`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/3.0.1/javax/annotation/Nullable.html), [`@CheckForNull`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/CheckForNull.html)은 항상 활성화되어 있으며, `-Xjsr305` 옵션을 통한 컴파일러 구성과 무관하게 Kotlin에서 어노테이션이 지정된 선언의 타입에 영향을 미칩니다.
>
{style="note"}

예를 들어, 컴파일러 인수에 `-Xjsr305=ignore -Xjsr305=under-migration:ignore -Xjsr305=@org.library.MyNullable:warn`을 추가하면 컴파일러는 `@org.library.MyNullable`로 어노테이션이 지정된 타입을 부적절하게 사용할 때 경고를 생성하고 다른 모든 JSR-305 어노테이션은 무시합니다.

기본 동작은 `-Xjsr305=warn`과 동일합니다. `strict` 값은 실험적인 것으로 간주해야 합니다(향후 더 많은 검사가 추가될 수 있음).

## 매핑된 타입 {id="mapped-types"}

Kotlin은 일부 Java 타입을 특별하게 처리합니다. 이러한 타입은 Java에서 "있는 그대로" 로드되지 않고 해당 Kotlin 타입으로 _매핑_됩니다.
이 매핑은 컴파일 시점에만 중요하며 런타임 표현은 변경되지 않은 상태로 유지됩니다.
Java의 기본형(primitive) 타입은 해당 Kotlin 타입으로 매핑됩니다([플랫폼 타입](#null-safety-and-platform-types) 고려):

| **Java 타입** | **Kotlin 타입**  |
|-------------|----------------|
| `byte`      | `kotlin.Byte`  |
| `short`     | `kotlin.Short` |
| `int`       | `kotlin.Int`   |
| `long`      | `kotlin.Long`  |
| `char`      | `kotlin.Char`  |
| `float`     | `kotlin.Float` |
| `double`    | `kotlin.Double`|
| `boolean`   | `kotlin.Boolean`|

기본형이 아닌 일부 내장 클래스도 매핑됩니다:

| **Java 타입**                     | **Kotlin 타입**        |
|-----------------------------------|------------------------|
| `java.lang.Object`                | `kotlin.Any!`          |
| `java.lang.Cloneable`             | `kotlin.Cloneable!`    |
| `java.lang.Comparable`            | `kotlin.Comparable!`   |
| `java.lang.Enum`                  | `kotlin.Enum!`         |
| `java.lang.annotation.Annotation` | `kotlin.Annotation!`   |
| `java.lang.CharSequence`          | `kotlin.CharSequence!` |
| `java.lang.String`                | `kotlin.String!`       |
| `java.lang.Number`                | `kotlin.Number!`       |
| `java.lang.Throwable`             | `kotlin.Throwable!`    |

Java의 박싱된 기본형 타입은 널 가능 Kotlin 타입으로 매핑됩니다:

| **Java 타입**         | **Kotlin 타입**   |
|-----------------------|-------------------|
| `java.lang.Byte`      | `kotlin.Byte?`    |
| `java.lang.Short`     | `kotlin.Short?`   |
| `java.lang.Integer`   | `kotlin.Int?`     |
| `java.lang.Long`      | `kotlin.Long?`    |
| `java.lang.Character` | `kotlin.Char?`    |
| `java.lang.Float`     | `kotlin.Float?`   |
| `java.lang.Double`    | `kotlin.Double?`  |
| `java.lang.Boolean`   | `kotlin.Boolean?` |

타입 매개변수로 사용되는 박싱된 기본형 타입은 플랫폼 타입으로 매핑됩니다. 예를 들어 `List<java.lang.Integer>`는 Kotlin에서 `List<Int!>`가 됩니다.

컬렉션 타입은 Kotlin에서 읽기 전용 또는 가변일 수 있으므로 Java의 컬렉션은 다음과 같이 매핑됩니다(이 표의 모든 Kotlin 타입은 `kotlin.collections` 패키지에 있습니다):

| **Java 타입**     | **Kotlin 읽기 전용 타입** | **Kotlin 가변 타입**            | **로드된 플랫폼 타입**                  |
|-------------------|---------------------------|--------------------------------|--------------------------------------|
| `Iterator<T>`     | `Iterator<T>`             | `MutableIterator<T>`           | `(Mutable)Iterator<T>!`              |
| `Iterable<T>`     | `Iterable<T>`             | `MutableIterable<T>`           | `(Mutable)Iterable<T>!`              |
| `Collection<T>`   | `Collection<T>`           | `MutableCollection<T>`         | `(Mutable)Collection<T>!`            |
| `Set<T>`          | `Set<T>`                  | `MutableSet<T>`                | `(Mutable)Set<T>!`                   |
| `List<T>`         | `List<T>`                 | `MutableList<T>`               | `(Mutable)List<T>!`                  |
| `ListIterator<T>` | `ListIterator<T>`         | `MutableListIterator<T>`       | `(Mutable)ListIterator<T>!`          |
| `Map<K, V>`       | `Map<K, V>`               | `MutableMap<K, V>`             | `(Mutable)Map<K, V>!`                |
| `Map.Entry<K, V>` | `Map.Entry<K, V>`         | `MutableMap.MutableEntry<K,V>` | `(Mutable)Map.(Mutable)Entry<K, V>!` |

Java의 배열은 [아래](#java-arrays)에 설명된 대로 매핑됩니다:

| **Java 타입** | **Kotlin 타입**                |
|---------------|--------------------------------|
| `int[]`       | `kotlin.IntArray!`             |
| `String[]`    | `kotlin.Array<(out) String!>!` |

> 이러한 Java 타입의 정적 멤버는 Kotlin 타입의 [동반 객체(companion objects)](object-declarations.md#companion-objects)에서 직접 접근할 수 없습니다. 이를 호출하려면 `java.lang.Integer.toHexString(255)`와 같이 [Java 타입의 정규화된 이름을 사용](#accessing-static-members)하세요.
>
{style="note"}

## Kotlin에서의 Java 제네릭 {id="java-generics-in-kotlin"}

Kotlin의 제네릭은 Java의 제네릭과 약간 다릅니다([제네릭](generics.md) 참조).
Java 타입을 Kotlin으로 가져올 때 다음과 같은 변환이 수행됩니다:

* Java의 와일드카드는 타입 프로젝션(type projections)으로 변환됩니다:
  * `Foo<? extends Bar>`는 `Foo<out Bar!>!`가 됩니다.
  * `Foo<? super Bar>`는 `Foo<in Bar!>!`가 됩니다.

* Java의 로우 타입(raw types)은 스타 프로젝션(star projections)으로 변환됩니다:
  * `List`는 `List<*>!`(즉, `List<out Any?>!`)가 됩니다.

Java와 마찬가지로 Kotlin의 제네릭은 런타임에 유지되지 않습니다. 객체는 생성자에 전달된 실제 타입 인자에 대한 정보를 보유하지 않습니다. 예를 들어 `ArrayList<Integer>()`는 `ArrayList<Character>()`와 구별할 수 없습니다.
이로 인해 제네릭을 고려한 `is` 검사를 수행할 수 없습니다.
Kotlin은 스타 프로젝션된 제네릭 타입에 대한 `is` 검사만 허용합니다:

```kotlin
if (a is List<Int>) // 오류: 실제로 Int의 List인지 검사할 수 없음
// 하지만
if (a is List<*>)   // 정상 동작: 리스트 내용에 대한 보장은 없음
```

## Java 배열 {id="java-arrays"}

Java와 달리 Kotlin의 배열은 불변(invariant)입니다. 즉, Kotlin에서는 `Array<String>`을 `Array<Any>`에 할당할 수 없으므로 발생 가능한 런타임 실패를 방지합니다. 하위 클래스의 배열을 상위 클래스의 배열로 Kotlin 메서드에 전달하는 것도 금지되지만, Java 메서드의 경우에는 `Array<(out) String>!` 형태의 [플랫폼 타입](#null-safety-and-platform-types)을 통해 허용됩니다.

배열은 박싱/언박싱 연산 비용을 피하기 위해 Java 플랫폼의 기본 데이터 타입과 함께 사용됩니다.
Kotlin은 이러한 구현 세부 사항을 숨기므로 Java 코드와 연동하기 위한 해결책이 필요합니다.
이러한 경우를 처리하기 위해 각 기본형 배열 타입에 특화된 클래스(`IntArray`, `DoubleArray`, `CharArray` 등)가 제공됩니다.
이들은 `Array` 클래스와 관련이 없으며 최대 성능을 위해 Java의 기본형 배열로 컴파일됩니다.

인덱스들의 int 배열을 받는 Java 메서드가 있다고 가정해 보겠습니다:

``` java
public class JavaArrayExample {
    public void removeIndices(int[] indices) {
        // 여기에 코드 작성
    }
}
```

기본형 값의 배열을 전달하려면 Kotlin에서 다음과 같이 할 수 있습니다:

```kotlin
val javaObj = JavaArrayExample()
val array = intArrayOf(0, 1, 2, 3)
javaObj.removeIndices(array) // int[]를 메서드로 전달
```

JVM 바이트코드로 컴파일할 때 컴파일러는 오버헤드가 발생하지 않도록 배열 접근을 최적화합니다:

```kotlin
val array = arrayOf(1, 2, 3, 4)
array[1] = array[1] * 2 // 실제로 get() 및 set() 호출이 생성되지 않음
for (x in array) {      // 이터레이터가 생성되지 않음
    print(x)
}
```

인덱스를 사용하여 순회할 때도 오버헤드가 발생하지 않습니다:

```kotlin
for (i in array.indices) { // 이터레이터가 생성되지 않음
    array[i] += 2
}
```

마지막으로 `in` 검사에도 오버헤드가 없습니다:

```kotlin
if (i in array.indices) { // (i >= 0 && i < array.size)와 동일
    print(array[i])
}
```

## Java 가변 인자(varargs) {id="java-varargs"}

Java 클래스는 때때로 가변적인 수의 인자(varargs)를 받는 인덱스 메서드 선언을 사용합니다:

``` java
public class JavaArrayExample {

    public void removeIndicesVarArg(int... indices) {
        // 여기에 코드 작성
    }
}
```

이 경우 `IntArray`를 전달하려면 스프레드 연산자 `*`를 사용해야 합니다:

```kotlin
val javaObj = JavaArrayExample()
val array = intArrayOf(0, 1, 2, 3)
javaObj.removeIndicesVarArg(*array)
```

## 연산자 {id="operators"}

Java에는 연산자 구문을 사용하는 것이 적절한 메서드를 표시하는 방법이 없기 때문에, Kotlin은 올바른 이름과 시그니처를 가진 모든 Java 메서드를 연산자 오버로딩 및 기타 규칙(`invoke()` 등)으로 사용할 수 있도록 허용합니다.
중위 호출(infix call) 구문을 사용하여 Java 메서드를 호출하는 것은 허용되지 않습니다.

예를 들어, `get(int)` 및 `set(int, T)` 메서드를 선언하는 Java 클래스를 Kotlin에서 색인된 접근 연산자(indexed access operator)와 함께 사용할 수 있습니다:

```java
public class IntContainer {
    private final int[] values = new int[10];

    public int get(int index) {
        return values[index];
    }

    public void set(int index, int value) {
        values[index] = value;
    }
}
```

```kotlin
fun main() {
    val container = IntContainer()
    container[0] = 42     // set(0, 42) 호출
    println(container[0]) // get(0) 호출
}
```

## 검사 예외(Checked exceptions) {id="checked-exceptions"}

Kotlin에서는 모든 [예외가 비검사 예외(unchecked)](exceptions.md)이므로 컴파일러가 예외를 강제로 잡도록(catch) 요구하지 않습니다.
따라서 검사 예외(checked exception)를 선언하는 Java 메서드를 호출할 때 Kotlin에서는 아무런 작업도 강제하지 않습니다:

```kotlin
fun render(list: List<*>, to: Appendable) {
    for (item in list) {
        to.append(item.toString()) // Java에서는 Appendable.append()에서 던져지는 IOException을 잡아야 함
    }
}
```

## Object 메서드 {id="object-methods"}

Java 타입이 Kotlin으로 임포트될 때 `java.lang.Object` 타입의 모든 참조는 `Any`로 바뀝니다.
`Any`는 플랫폼 전용이 아니므로 `toString()`, `hashCode()`, `equals()`만 멤버로 선언하고 있기 때문에, `java.lang.Object`의 다른 멤버들을 사용할 수 있도록 하기 위해 Kotlin은 [확장 함수](extensions.md)를 사용합니다.

### `wait()` 및 `notify()` {id="wait-and-notify"}

`wait()` 및 `notify()` 메서드는 `Any` 타입의 참조에서 사용할 수 없습니다. 이들의 사용은 일반적으로 권장되지 않으며 대신 `java.util.concurrent`를 사용하는 것이 좋습니다.

이러한 메서드를 호출해야 하는 경우, Java 객체를 통해 접근하고 `PLATFORM_CLASS_MAPPED_TO_KOTLIN` 경고를 억제하세요:

```kotlin
import java.util.LinkedList

class SimpleBlockingQueue<T>(private val capacity: Int) {
    private val queue = LinkedList<T>()

    // wait() 및 notify()에 접근하기 위해 java.lang.Object 인스턴스를 사용
    // Kotlin에서 표준 'Any' 타입은 이러한 메서드를 노출하지 않음
    @Suppress("PLATFORM_CLASS_MAPPED_TO_KOTLIN")
    private val lock = Object()

    fun put(item: T) {
        synchronized(lock) {
            while (queue.size >= capacity) {
                lock.wait()
            }
            queue.add(item)
            println("Produced: $item")

            lock.notifyAll()
        }
    }

    fun take(): T {
        synchronized(lock) {
            while (queue.isEmpty()) {
                lock.wait()
            }
            val item = queue.removeFirst()
            println("Consumed: $item")

            lock.notifyAll()
            return item
        }
    }
}
```

또는 `java.lang.Object`로 명시적으로 캐스팅하고 `PLATFORM_CLASS_MAPPED_TO_KOTLIN` 경고를 억제합니다:

```kotlin
@Suppress("PLATFORM_CLASS_MAPPED_TO_KOTLIN")
(instance as java.lang.Object).wait()
```

### `getClass()` {id="getclass"}

객체의 Java 클래스를 가져오려면 [클래스 참조](reflection.md#obtain-a-runtime-class)에서 `java` 확장 프로퍼티를 사용하세요:

```kotlin
val instanceClass = instance::class.java
```

위 코드는 [바인딩된 클래스 참조](lambdas.md#bound-and-unbound-references)를 사용합니다. `javaClass` 확장 프로퍼티를 사용할 수도 있습니다:

```kotlin
val instanceClass = instance.javaClass
```

### `clone()` {id="clone"}

`clone()`을 재정의하려면 클래스가 `kotlin.Cloneable`을 구현해야 합니다:

```kotlin
class Example : Cloneable {
    override fun clone(): Any { ... }
}
```

[Effective Java 제3판](https://www.oracle.com/technetwork/java/effectivejava-136174.html)의 아이템 13: *clone 재정의는 신중히 하라*를 잊지 마세요.

### `finalize()` {id="finalize"}

`finalize()`를 재정의하려면 `override` 키워드 없이 선언합니다:

```kotlin
class C {
    protected fun finalize() {
        // 종료 정리 로직
    }
}
```

Java의 규칙에 따라 `finalize()`는 `private`이어서는 안 됩니다.

> `finalize()` 메서드는 최신 Java 버전에서 deprecated(사용 중단)되었습니다. 대신 [`java.lang.ref.Cleaner`](https://docs.oracle.com/javase/9/docs/api/java/lang/ref/Cleaner.html)나 [try-with-resources](https://docs.oracle.com/javase/tutorial/essential/exceptions/tryResourceClose.html)와 같은 대안을 고려하세요.
>
{style="note"}

## Java 클래스 상속 {id="inheritance-from-java-classes"}

Kotlin의 클래스는 최대 하나의 Java 클래스(및 원하는 수만큼의 Java 인터페이스)를 상위 타입으로 가질 수 있습니다.

## 정적 멤버 접근 {id="accessing-static-members"}

Java 클래스의 정적(static) 멤버는 해당 클래스의 "동반 객체(companion objects)"를 형성합니다. 이러한 "동반 객체"를 값처럼 전달할 수는 없지만, 다음과 같이 멤버에 명시적으로 접근할 수 있습니다:

```kotlin
if (Character.isLetter(a)) { ... }
```

임포트된 Java 클래스의 정적 메서드를 호출하려면 Java에서와 마찬가지로 클래스 이름을 직접 사용합니다. 다음 Java 클래스를 살펴보겠습니다:

```java
package org.example;

public class MathUtils {
    public static int triple(int value) {
        return value * 3;
    }
}
```

클래스를 임포트하고 클래스 이름을 통해 정적 메서드를 호출합니다:

```kotlin
import org.example.MathUtils

fun main() {
    println(MathUtils.triple(5)) // 정적 triple() 메서드 호출
}
```

Kotlin 타입으로 [매핑](#mapped-types)된 Java 타입의 정적 멤버에 접근하려면 `java.lang.Integer.bitCount(5)`와 같이 Java 타입의 정규화된 이름을 사용합니다.

## Java 리플렉션 {id="java-reflection"}

Java 리플렉션은 Kotlin 클래스에서 작동하며 그 반대도 마찬가지입니다. 위에서 언급했듯이 `instance::class.java`, `ClassName::class.java` 또는 `instance.javaClass`를 사용하여 `java.lang.Class`를 통해 Java 리플렉션에 진입할 수 있습니다.
이 용도로 `ClassName.javaClass`를 사용하지 마세요. 이는 `ClassName`의 [동반 객체](object-declarations.md#companion-objects) 클래스를 참조하므로 `ClassName::class.java`가 아니라 `ClassName.Companion::class.java`와 동일하기 때문입니다.

각 기본형 타입마다 서로 다른 두 개의 Java 클래스가 있으며, Kotlin은 두 클래스를 모두 가져오는 방법을 제공합니다. 예를 들어 `Int::class.java`는 Java의 `Integer.TYPE`에 해당하는 기본형 타입 자체를 나타내는 클래스 인스턴스를 반환합니다. 해당하는 래퍼 타입의 클래스를 가져오려면 Java의 `Integer.class`와 동등한 `Int::class.javaObjectType`을 사용합니다.

기타 지원되는 사례로는 Kotlin 프로퍼티에 대한 Java 게터/세터 메서드나 뒷받침하는 필드(backing field) 가져오기, Java 필드에 대한 `KProperty`, `KFunction`에 대한 Java 메서드 또는 생성자 가져오기 및 그 반대가 있습니다.

## SAM 변환 {id="sam-conversions"}

Kotlin은 Java와 [Kotlin 인터페이스](fun-interfaces.md) 모두에 대해 SAM 변환을 지원합니다.
Java에 대한 이러한 지원은 인터페이스 메서드의 매개변수 타입이 Kotlin 함수의 매개변수 타입과 일치하는 한, 디폴트 메서드가 아닌 단일 메서드를 가진 Java 인터페이스의 구현체로 Kotlin 함수 리터럴이 자동으로 변환될 수 있음을 의미합니다.

이를 사용하여 SAM 인터페이스의 인스턴스를 생성할 수 있습니다:

```kotlin
val runnable = Runnable { println("This runs in a runnable") }
```

그리고 메서드 호출에서도 사용할 수 있습니다:

```kotlin
val executor = Executors.newSingleThreadExecutor()
// Java 시그니처: void execute(Runnable command)
executor.execute { println("This runs in a thread pool") }
```

Java 클래스에 함수형 인터페이스를 받는 메서드가 여러 개 있는 경우, 람다를 특정 SAM 타입으로 변환하는 어댑터 함수를 사용하여 호출해야 하는 메서드를 선택할 수 있습니다. 이러한 어댑터 함수도 필요한 경우 컴파일러에 의해 생성됩니다:

```kotlin
executor.execute(Runnable { println("This runs in a thread pool") })
```

> SAM 변환은 인터페이스에 대해서만 작동합니다. 추상 메서드가 하나뿐인 경우라도 추상 클래스에는 적용되지 않습니다.
>
{style="note"}

## Kotlin에서 JNI 사용하기 {id="using-jni-with-kotlin"}

네이티브(C 또는 C++) 코드로 구현된 함수를 선언하려면 `external` 수식어로 표시해야 합니다:

```kotlin
external fun calculateSum(x: Int): Double
```

나머지 절차는 Java와 완전히 동일한 방식으로 작동합니다.

프로퍼티 게터와 세터를 `external`로 표시할 수도 있습니다:

```kotlin
var myProperty: String
    external get
    external set
```

내부적으로 이는 둘 다 `external`로 표시된 두 개의 함수 `getMyProperty`와 `setMyProperty`를 생성합니다.

## Kotlin에서 Lombok으로 생성된 선언 사용하기 {id="using-lombok-generated-declarations-in-kotlin"}

Kotlin 코드에서 Java의 Lombok으로 생성된 선언을 사용할 수 있습니다.
동일한 혼합 Java/Kotlin 모듈에서 이러한 선언을 생성하고 사용해야 하는 경우, [Lombok 컴파일러 플러그인 페이지](lombok.md)에서 그 방법을 확인할 수 있습니다.
다른 모듈에서 이러한 선언을 호출하는 경우에는 해당 모듈을 컴파일하기 위해 이 플러그인을 사용할 필요가 없습니다.