[//]: # (title: Kotlin에서 Java 호출하기)

Kotlin은 Java와의 상호 운용성을 염두에 두고 설계되었습니다. 기존 Java 코드를 Kotlin에서 자연스럽게 호출할 수 있으며, Kotlin 코드 역시 Java에서 원활하게 사용할 수 있습니다.
이 섹션에서는 Kotlin에서 Java 코드를 호출하는 방법에 대한 세부 사항을 설명합니다.

거의 모든 Java 코드를 아무런 문제 없이 사용할 수 있습니다.

```kotlin
import java.util.*

fun demo(source: List<Int>) {
    val list = ArrayList<Int>()
    // 'for' 루프는 Java 컬렉션에서도 작동합니다:
    for (item in source) {
        list.add(item)
    }
    // 연산자 관례(Operator conventions)도 작동합니다:
    for (i in 0..source.size - 1) {
        list[i] = source[i] // get과 set이 호출됩니다
    }
}
```

## 게터(Getter)와 세터(Setter)

게터와 세터에 대한 Java 관례(이름이 `get`으로 시작하고 인자가 없는 메서드, 이름이 `set`으로 시작하고 단일 인자를 받는 메서드)를 따르는 메서드는 Kotlin에서 프로퍼티로 나타납니다. 이러한 프로퍼티를 _신세틱 프로퍼티(synthetic properties)_라고도 부릅니다.
`Boolean` 접근자 메서드(게터 이름이 `is`로 시작하고 세터 이름이 `set`으로 시작하는 경우)는 게터 메서드와 동일한 이름을 가진 프로퍼티로 나타납니다.

```kotlin
import java.util.Calendar

fun calendarDemo() {
    val calendar = Calendar.getInstance()
    if (calendar.firstDayOfWeek == Calendar.SUNDAY) { // getFirstDayOfWeek() 호출
        calendar.firstDayOfWeek = Calendar.MONDAY // setFirstDayOfWeek() 호출
    }
    if (!calendar.isLenient) { // isLenient() 호출
        calendar.isLenient = true // setLenient() 호출
    }
}
```

위의 `calendar.firstDayOfWeek`는 신세틱 프로퍼티의 한 예입니다.

Java 클래스에 세터만 있는 경우, Kotlin은 쓰기 전용(set-only) 프로퍼티를 지원하지 않으므로 Kotlin에서 프로퍼티로 보이지 않는다는 점에 유의하세요.

## Java 신세틱 프로퍼티 참조

> 이 기능은 [실험적(Experimental)](components-stability.md#stability-levels-explained) 단계입니다. 언제든지 삭제되거나 변경될 수 있습니다.
> 평가 목적으로만 사용하시기를 권장합니다.
>
{style="warning"}

Kotlin 1.8.20부터 Java 신세틱 프로퍼티에 대한 참조를 생성할 수 있습니다. 다음 Java 코드를 예로 들어보겠습니다.

```java
public class Person {
    private String name;
    private int age;

    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String getName() {
        return name;
    }

    public int getAge() {
        return age;
    }
}
```

Kotlin은 항상 `age`가 신세틱 프로퍼티인 `person.age` 작성을 허용해 왔습니다. 이제 `Person::age` 및 `person::age`와 같이 참조를 생성할 수도 있습니다. `name`에 대해서도 동일하게 적용됩니다.

```kotlin
val persons = listOf(Person("Jack", 11), Person("Sofie", 12), Person("Peter", 11))
    persons
         // Java 신세틱 프로퍼티에 대한 참조 호출:
        .sortedBy(Person::age)
         // Kotlin 프로퍼티 구문을 통해 Java 게터 호출:
        .forEach { person -> println(person.name) }
```

### Java 신세틱 프로퍼티 참조를 활성화하는 방법 {initial-collapse-state="collapsed" collapsible="true"}

이 기능을 활성화하려면 `-language-version 2.1` 컴파일러 옵션을 설정하세요. Gradle 프로젝트에서는 `build.gradle(.kts)`에 다음을 추가하여 설정할 수 있습니다.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
tasks
    .withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask<*>>()
    .configureEach {
        compilerOptions
            .languageVersion
            .set(
                org.jetbrains.kotlin.gradle.dsl.KotlinVersion.KOTLIN_2_1
            )
    }
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
tasks
    .withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask.class)
    .configureEach {
        compilerOptions.languageVersion
            = org.jetbrains.kotlin.gradle.dsl.KotlinVersion.KOTLIN_2_1
}
```

</tab>
</tabs>

> Kotlin 1.9.0 이전 버전에서는 이 기능을 활성화하려면 `-language-version 1.9` 컴파일러 옵션을 설정해야 했습니다.
> 
{style="note"}

## void를 반환하는 메서드

Java 메서드가 `void`를 반환하면 Kotlin에서 호출할 때 `Unit`을 반환합니다.
만약 누군가 그 반환 값을 사용한다면, 값 자체가 미리 알려져 있으므로(`Unit`이므로) Kotlin 컴파일러에 의해 호출 지점에서 할당됩니다.

## Kotlin의 키워드인 Java 식별자 이스케이프 처리

`in`, `object`, `is` 등 일부 Kotlin 키워드는 Java에서 유효한 식별자입니다.
Java 라이브러리가 메서드 이름으로 Kotlin 키워드를 사용하는 경우, 백틱(`) 문자로 감싸서 해당 메서드를 호출할 수 있습니다.

```kotlin
foo.`is`(bar)
```

## Null 안정성 및 플랫폼 타입

Java의 모든 참조는 `null`이 될 수 있으므로, Java에서 오는 객체에 대해 Kotlin의 엄격한 null 안정성(null-safety) 요구 사항을 적용하는 것은 실용적이지 않습니다.
Java 선언의 타입은 Kotlin에서 [플랫폼 타입(platform types)](https://kotlinlang.org/spec/type-system.html#platform-types)이라고 불리며, 이는 명시적으로 표기할 수 없는(non-denotable) 타입으로 처리됩니다.
코드에서 이러한 타입을 명시적으로 적을 수 없습니다. 따라서 플랫폼 값이 Kotlin 변수에 할당될 때 다음과 같은 작업을 할 수 있습니다.

* 타입 추론에 의존합니다. 이 경우 변수는 추론된 플랫폼 타입을 갖게 됩니다.
* 기대하는 타입을 선택합니다. Kotlin은 nullable과 non-nullable 타입 모두를 허용합니다.

이러한 타입에 대해서는 null 체크가 완화되므로, 안전성 보장은 Java와 동일합니다([아래](#매핑된-타입)를 참조하세요).
다음 예시를 살펴보세요.

```kotlin
val list = ArrayList<String>() // non-null (생성자 결과)
list.add("Item")
val size = list.size // non-null (기본형 int)
val item = list[0] // 플랫폼 타입으로 추론됨 (일반 Java 객체)
```

플랫폼 타입 변수의 메서드를 호출할 때 Kotlin은 컴파일 타임에 null 허용 여부 오류를 발생시키지 않지만, 호출 시점에 null 포인터 예외가 발생하거나 Kotlin이 null 전파를 방지하기 위해 생성한 어설션(assertion)으로 인해 실행 중에 실패할 수 있습니다.

```kotlin
item.substring(1) // 허용되지만, item == null인 경우 예외 발생
```

플랫폼 타입 값을 nullable 및 non-nullable Kotlin 타입 변수 모두에 할당할 수 있습니다. 그러나 이러한 값을 non-nullable 타입 변수에 할당했는데 실제 값이 실행 시점에 `null`인 경우, Kotlin은 `NullPointerException`을 발생시킵니다. 이를 방지하려면 Kotlin 코드에 명시적인 null 허용 여부를 추가하세요.

```kotlin
val nullable: String? = item // 허용되며 항상 작동함
val notNull: String = item // 허용되지만 실행 시점에 실패할 수 있음
```

만약 non-nullable 타입을 선택하면 컴파일러는 할당 시점에 어설션을 생성합니다. 이는 Kotlin의 non-nullable 변수가 null을 보유하는 것을 방지합니다. 어설션은 플랫폼 값을 non-null 값을 기대하는 Kotlin 함수에 전달할 때나 다른 경우에도 생성됩니다.
전반적으로 컴파일러는 null이 프로그램 전체로 널리 퍼지는 것을 방지하기 위해 최선을 다하지만, 제네릭(generics)으로 인해 이를 완전히 제거하는 것이 불가능할 때도 있습니다.

### 플랫폼 타입 표기법

이전 섹션에서 언급했듯이 플랫폼 타입은 프로그램에서 명시적으로 언급할 수 없으므로 언어상에 구문이 존재하지 않습니다.
그럼에도 불구하고 컴파일러와 IDE는 때때로 이를 표시해야 할 필요가 있으므로(예: 에러 메시지나 파라미터 정보), 이를 위한 기억하기 쉬운 표기법이 있습니다.

* `T!`는 "`T` 또는 `T?`"를 의미합니다.
* `(Mutable)Collection<T>!`는 "Java 컬렉션 `T`는 가변일 수도 있고 아닐 수도 있으며, null일 수도 있고 아닐 수도 있음"을 의미합니다.
* `Array<(out) T>!`는 "Java 배열 `T`(또는 `T`의 하위 타입)는 null일 수도 있고 아닐 수도 있음"을 의미합니다.

에러 메시지나 IDE 툴팁에서 이 표기법을 본다면, Kotlin 변수에 명시적인 타입 어노테이션을 추가하여 null 안정성 체크를 복구하거나, 소스에서 null 허용 여부 어노테이션을 사용하여 플랫폼 타입을 제거하세요.

### Null 허용 여부 어노테이션(Nullability annotations)

null 허용 여부 어노테이션이 있는 Java 타입은 플랫폼 타입이 아니라 실제 nullable 또는 non-nullable Kotlin 타입으로 표현됩니다. 컴파일러는 다음과 같은 여러 종류의 null 허용 여부 어노테이션을 지원합니다.

  * [JetBrains](https://www.jetbrains.com/idea/help/nullable-and-notnull-annotations.html)
(`org.jetbrains.annotations` 패키지의 `@Nullable` 및 `@NotNull`)
  * [JSpecify](#jspecify-지원) (`org.jspecify.annotations`)
  * Android (`com.android.annotations` 및 `android.support.annotations`)
  * [JSR-305](#jsr-305-지원) (`javax.annotation`)
  * FindBugs (`edu.umd.cs.findbugs.annotations`)
  * Eclipse (`org.eclipse.jdt.annotation`)
  * [Lombok](lombok.md) (`lombok.NonNull`)
  * RxJava 3 (`io.reactivex.rxjava3.annotations`)
  * [Vert.x](https://vertx.io/) (`io.vertx.codegen.annotations`)

다음 컴파일러 옵션을 사용하여 특정 null 허용 여부 어노테이션에 대해 null 허용 여부 불일치를 보고하도록 컴파일러에 지시할 수 있습니다.

```bash
-Xnullability-annotations=@<package-name>:<report-level>
``` 

정규화된 null 허용 여부 어노테이션의 패키지 이름과 다음 보고 수준 중 하나를 지정하세요.

* `ignore`: null 허용 여부 불일치를 무시합니다.
* `warn`: 경고를 보고합니다.
* `strict`: 에러를 보고합니다.

> [JSpecify](#jspecify-지원)는 기본적으로 `strict` 보고 수준을 사용하는 유일하게 지원되는 종류입니다.
> 추가 설정 없이 null 허용 여부 어노테이션에 대한 에러를 보고하려면 이를 사용하세요.
>
{style="note"}

지원되는 null 허용 여부 어노테이션의 전체 목록은 [Kotlin 컴파일러 소스 코드](https://github.com/JetBrains/kotlin/blob/master/core/compiler.common.jvm/src/org/jetbrains/kotlin/load/java/JvmAnnotationNames.kt)에서 확인할 수 있습니다.

### 가변성 어노테이션(Mutability annotations)

Java 선언에 가변성 어노테이션을 달아 반환된 컬렉션이 Kotlin에서 읽기 전용인지 가변인지 지정할 수 있습니다.
가변성이 다른 컬렉션 타입에 값을 할당하면 컴파일러가 타입 불일치를 보고합니다.
진단 수준은 특정 가변성 어노테이션에 따라 달라집니다.

컴파일러는 다음과 같은 여러 가변성 어노테이션을 지원합니다.

* `kotlin.annotations.jvm.ReadOnly`
* `kotlin.annotations.jvm.Mutable`
* `org.jetbrains.annotations.Unmodifiable`
* `org.jetbrains.annotations.UnmodifiableView`

지원되는 가변성 어노테이션의 전체 목록은 [Kotlin 컴파일러 소스 코드](https://github.com/JetBrains/kotlin/blob/master/core/compiler.common.jvm/src/org/jetbrains/kotlin/load/java/JvmAnnotationNames.kt)에서 확인할 수 있습니다.

### 타입 인자와 타입 파라미터에 어노테이션 달기

제네릭 타입의 타입 인자와 타입 파라미터에도 어노테이션을 달아 null 허용 여부 정보를 제공할 수 있습니다.

> 이 섹션의 모든 예제는 `org.jetbrains.annotations` 패키지의 JetBrains null 허용 여부 어노테이션을 사용합니다.
>
{style="note"}

#### 타입 인자

Java 선언에서 다음과 같은 어노테이션을 고려해 보세요.

```java
@NotNull
Set<@NotNull String> toSet(@NotNull Collection<@NotNull String> elements) { ... }
```

이는 Kotlin에서 다음과 같은 시그니처가 됩니다.

```kotlin
fun toSet(elements: (Mutable)Collection<String>) : (Mutable)Set<String> { ... }
```

타입 인자에서 `@NotNull` 어노테이션이 누락되면 대신 플랫폼 타입을 얻게 됩니다.

```kotlin
fun toSet(elements: (Mutable)Collection<String!>) : (Mutable)Set<String!> { ... }
```

Kotlin은 기본 클래스 및 인터페이스의 타입 인자에 있는 null 허용 여부 어노테이션도 고려합니다. 예를 들어, 아래와 같은 시그니처를 가진 두 개의 Java 클래스가 있습니다.

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

`Derived`의 상한(upper bound)이 `Base<String>`과 다른 `Base<String?>`으로 설정되었기 때문입니다.

[Kotlin에서의 Java 제네릭](#kotlin에서의-java-제네릭)에 대해 자세히 알아보세요.

#### 타입 파라미터

기본적으로 Kotlin과 Java 모두에서 일반 타입 파라미터의 null 허용 여부는 정의되지 않습니다. Java에서는 null 허용 여부 어노테이션을 사용하여 이를 지정할 수 있습니다. `Base` 클래스의 타입 파라미터에 어노테이션을 달아보겠습니다.

```java
public class Base<@NotNull T> {}
```

`Base`를 상속할 때 Kotlin은 non-nullable 타입 인자 또는 타입 파라미터를 기대합니다. 따라서 다음 Kotlin 코드는 경고를 생성합니다.

```kotlin
class Derived<K> : Base<K> {} // 경고: K has undefined nullability
```

상한인 `K : Any`를 지정하여 이를 해결할 수 있습니다.

Kotlin은 Java 타입 파라미터의 바운드(bound)에 있는 null 허용 여부 어노테이션도 지원합니다. `Base`에 바운드를 추가해 보겠습니다.

```java
public class BaseWithBound<T extends @NotNull Number> {}
```

Kotlin은 이를 다음과 같이 번역합니다.

```kotlin
class BaseWithBound<T : Number> {}
```

따라서 타입 인자나 타입 파라미터로 nullable 타입을 전달하면 경고가 발생합니다.

타입 인자와 타입 파라미터에 어노테이션을 다는 기능은 Java 8 타겟 이상에서 작동합니다. 이 기능을 사용하려면 null 허용 여부 어노테이션이 `TYPE_USE` 타겟을 지원해야 합니다(`org.jetbrains.annotations`는 버전 15 이상에서 이를 지원합니다).

> null 허용 여부 어노테이션이 `TYPE_USE` 타겟 외에 타입에 적용 가능한 다른 타겟을 지원하는 경우, `TYPE_USE`가 우선순위를 갖습니다. 예를 들어 `@Nullable`에 `TYPE_USE`와 `METHOD` 타겟이 모두 있는 경우, Java 메서드 시그니처 `@Nullable String[] f()`는 Kotlin에서 `fun f(): Array<String?>!`가 됩니다.
>
{style="note"}

### JSpecify 지원

Kotlin은 Java null 허용 여부를 위한 통합된 어노테이션 세트를 제공하는 [JSpecify](https://jspecify.dev/) 어노테이션을 지원합니다. JSpecify를 사용하면 Java 선언에 대해 상세한 null 허용 여부 정보를 제공할 수 있어, Kotlin이 Java 코드와 작업할 때 null 안정성을 유지하는 데 도움이 됩니다.

Kotlin은 `org.jspecify.annotations` 패키지의 다음 어노테이션을 지원합니다.

* `@Nullable`: 타입을 nullable로 표시합니다.
* `@NonNull`: 타입을 non-nullable로 표시합니다.
* `@NullMarked`: 별도의 어노테이션이 없는 한 클래스나 패키지와 같은 스코프 내의 모든 타입을 기본적으로 non-nullable로 표시합니다.

  이 어노테이션은 지역 변수 및 [타입 변수(제네릭)](https://jspecify.dev/docs/user-guide/#using-type-variables-in-generic-types)에는 적용되지 않습니다. 타입 변수는 구체적인 nullable 또는 non-nullable 타입이 제공될 때까지 "null-agnostic" 상태를 유지합니다.

* `@NullUnmarked`: `@NullMarked`의 효과를 반전시켜 스코프 내의 모든 타입을 [플랫폼 타입](#null-안정성-및-플랫폼-타입)으로 만듭니다.

JSpecify 어노테이션이 있는 다음 Java 클래스를 살펴보세요.
 
```java
// Java
import org.jspecify.annotations.*;

@NullMarked
public class InventoryService {
    public String notNull() { return ""; }
    public @Nullable String nullable() { return null; }
}
```
 
Kotlin에서 이들은 [플랫폼 타입](#null-안정성-및-플랫폼-타입)이 아닌 일반적인 nullable 및 non-nullable 타입으로 처리됩니다.
 
```kotlin
// Kotlin
fun test(inventory: InventoryService) {
   inventory.notNull().length // OK
   inventory.nullable().length // Error: 안전한 호출(?.) 또는 non-null 단언(!!) 호출만 허용됨
}
```

기본적으로 Kotlin 컴파일러는 JSpecify 어노테이션에 대한 null 허용 여부 불일치를 에러로 보고합니다. 다음 컴파일러 옵션을 사용하여 JSpecify null 허용 여부 진단의 심각도를 사용자 정의할 수 있습니다.

```bash
-Xjspecify-annotations=<report-level>
```

사용 가능한 보고 수준은 다음과 같습니다.

| 수준      | 설명                                              |
|----------|---------------------------------------------------|
| `strict` | null 허용 여부 불일치에 대해 에러를 보고합니다(기본값). |
| `warn`   | 경고를 보고합니다.                                   |
| `ignore` | null 허용 여부 불일치를 무시합니다.                   |

> JSpecify 어노테이션에 대한 자세한 내용은 [JSpecify 사용자 가이드](https://jspecify.dev/docs/user-guide)를 참조하세요.
> 
{type="tip"}

### JSR-305 지원

[JSR-305](https://jcp.org/en/jsr/detail?id=305)에 정의된 [`@Nonnull`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/Nonnull.html) 어노테이션은 Java 타입의 null 허용 여부를 나타내는 데 지원됩니다.

`@Nonnull(when = ...)` 값이 `When.ALWAYS`이면 어노테이션이 달린 타입은 non-nullable로 처리됩니다. `When.MAYBE`와 `When.NEVER`는 nullable 타입을 나타내며, `When.UNKNOWN`은 타입을 [플랫폼 타입](#null-안정성-및-플랫폼-타입)으로 강제합니다.

라이브러리는 JSR-305 어노테이션을 사용하여 컴파일될 수 있지만, 라이브러리 사용자를 위해 어노테이션 아티팩트(예: `jsr305.jar`)를 컴파일 종속성으로 만들 필요는 없습니다. Kotlin 컴파일러는 클래스패스에 어노테이션이 없어도 라이브러리에서 JSR-305 어노테이션을 읽을 수 있습니다.

[사용자 정의 null 허용 여부 한정자 (KEEP-79)](https://github.com/Kotlin/KEEP/blob/master/proposals/jsr-305-custom-nullability-qualifiers.md)도 지원됩니다(아래 참조).

#### 타입 한정자 별칭(Type qualifier nicknames)

어노테이션 타입에 [`@TypeQualifierNickname`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/meta/TypeQualifierNickname.html)과 JSR-305 `@Nonnull`(또는 `@CheckForNull`과 같은 다른 별칭)이 모두 있는 경우, 해당 어노테이션 타입 자체는 정밀한 null 허용 여부를 검색하는 데 사용되며 해당 null 허용 여부 어노테이션과 동일한 의미를 갖습니다.

```java
@TypeQualifierNickname
@Nonnull(when = When.ALWAYS)
@Retention(RetentionPolicy.RUNTIME)
public @interface MyNonnull {
}

@TypeQualifierNickname
@CheckForNull // 다른 타입 한정자 별칭의 별칭
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

#### 타입 한정자 기본값(Type qualifier defaults)

[`@TypeQualifierDefault`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/meta/TypeQualifierDefault.html)를 사용하면 적용 시 어노테이션이 달린 요소의 스코프 내에서 기본 null 허용 여부를 정의하는 어노테이션을 도입할 수 있습니다.

이러한 어노테이션 타입 자체에는 `@Nonnull`(또는 그 별칭)과 하나 이상의 `ElementType` 값을 가진 `@TypeQualifierDefault(...)`가 함께 달려 있어야 합니다.

* `ElementType.METHOD`: 메서드의 반환 타입
* `ElementType.PARAMETER`: 값 파라미터
* `ElementType.FIELD`: 필드
* `ElementType.TYPE_USE`: 타입 인자, 타입 파라미터의 상한 및 와일드카드 타입을 포함한 모든 타입

기본 null 허용 여부는 타입 자체가 null 허용 여부 어노테이션이 없고, 타입 사용법과 일치하는 `ElementType`을 가진 타입 한정자 기본 어노테이션이 달린 가장 안쪽의 감싸는 요소에 의해 기본값이 결정될 때 사용됩니다.

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
    String foo(String x); // fun foo(x: String?): String?

    @NotNullApi // 인터페이스의 기본값을 재정의함
    String bar(String x, @Nullable String y); // fun bar(x: String, y: String?): String

    // List<String> 타입 인자는 `TYPE_USE` 엘리먼트 타입을 가진 
    // `@NullableApi` 때문에 nullable로 간주됨:
    String baz(List<String> x); // fun baz(List<String?>?): String?

    // 명시적인 UNKNOWN 표시 null 허용 여부 어노테이션이 있으므로 
    // `x` 파라미터의 타입은 플랫폼 타입으로 유지됨:
    String qux(@Nonnull(when = When.UNKNOWN) String x); // fun baz(x: String!): String?
}
```

> 이 예제의 타입들은 strict 모드가 활성화된 경우에만 적용됩니다. 그렇지 않으면 플랫폼 타입으로 유지됩니다.
> [`@UnderMigration` 어노테이션](#undermigration-어노테이션) 및 [컴파일러 설정](#컴파일러-설정) 섹션을 참조하세요.
>
{style="note"}

패키지 레벨의 기본 null 허용 여부도 지원됩니다.

```java
// FILE: test/package-info.java
@NonNullApi // 'test' 패키지의 모든 타입을 기본적으로 non-nullable로 선언
package test;
```

#### @UnderMigration 어노테이션

라이브러리 유지 관리자는 `@UnderMigration` 어노테이션(`kotlin-annotations-jvm` 아티팩트로 별도 제공)을 사용하여 null 허용 여부 타입 한정자의 마이그레이션 상태를 정의할 수 있습니다.

`@UnderMigration(status = ...)`의 상태 값은 컴파일러가 Kotlin에서 어노테이션이 달린 타입의 부적절한 사용(예: `@MyNullable`로 어노테이션된 타입 값을 non-null로 사용)을 어떻게 처리할지 지정합니다.

* `MigrationStatus.STRICT`: 어노테이션이 일반적인 null 허용 여부 어노테이션처럼 작동하게 합니다. 즉, 부적절한 사용에 대해 에러를 보고하고 Kotlin에서 보이는 어노테이션된 선언의 타입에 영향을 줍니다.
* `MigrationStatus.WARN`: 부적절한 사용이 에러 대신 컴파일 경고로 보고되지만, 어노테이션된 선언의 타입은 플랫폼 타입으로 유지됩니다.
* `MigrationStatus.IGNORE`: 컴파일러가 null 허용 여부 어노테이션을 완전히 무시하게 합니다.

라이브러리 유지 관리자는 타입 한정자 별칭과 타입 한정자 기본값 모두에 `@UnderMigration` 상태를 추가할 수 있습니다.

```java
@Nonnull(when = When.ALWAYS)
@TypeQualifierDefault({ElementType.METHOD, ElementType.PARAMETER})
@UnderMigration(status = MigrationStatus.WARN)
public @interface NonNullApi {
}

// 클래스 내의 타입은 non-nullable이지만, `@NonNullApi`에 
// `@UnderMigration(status = MigrationStatus.WARN)`이 달려 있으므로 경고만 보고됨
@NonNullApi
public class Test {}
```

> null 허용 여부 어노테이션의 마이그레이션 상태는 해당 타입 한정자 별칭에 상속되지 않지만, 기본 타입 한정자의 사용에는 적용됩니다.
>
{style="note"}

기본 타입 한정자가 타입 한정자 별칭을 사용하고 둘 다 `@UnderMigration`인 경우, 기본 타입 한정자의 상태가 사용됩니다.

#### 컴파일러 설정

JSR-305 체크는 다음 옵션(및 그 조합)과 함께 `-Xjsr305` 컴파일러 플래그를 추가하여 구성할 수 있습니다.

* `-Xjsr305={strict|warn|ignore}`: `@UnderMigration`이 아닌 어노테이션에 대한 동작을 설정합니다. 사용자 정의 null 허용 여부 한정자, 특히 `@TypeQualifierDefault`는 이미 많은 유명 라이브러리에 퍼져 있으며, 사용자는 JSR-305 지원이 포함된 Kotlin 버전으로 업데이트할 때 원활하게 마이그레이션해야 할 수 있습니다. Kotlin 1.1.60부터 이 플래그는 `@UnderMigration`이 아닌 어노테이션에만 영향을 줍니다.

* `-Xjsr305=under-migration:{strict|warn|ignore}`: `@UnderMigration` 어노테이션에 대한 동작을 재정의합니다. 사용자는 라이브러리에 대한 마이그레이션 상태에 대해 다른 견해를 가질 수 있습니다. 공식 마이그레이션 상태가 `WARN`인 동안 에러를 발생시키고 싶을 수도 있고, 반대로 마이그레이션을 완료할 때까지 일부에 대해 에러 보고를 연기하고 싶을 수도 있습니다.

* `-Xjsr305=@<fq.name>:{strict|warn|ignore}`: 단일 어노테이션에 대한 동작을 재정의합니다. 여기서 `<fq.name>`은 어노테이션의 정규화된 클래스 이름입니다. 서로 다른 어노테이션에 대해 여러 번 나타날 수 있습니다. 이는 특정 라이브러리의 마이그레이션 상태를 관리하는 데 유용합니다.

`strict`, `warn`, `ignore` 값은 `MigrationStatus`의 값과 동일한 의미를 갖으며, `strict` 모드만이 Kotlin에서 보이는 어노테이션된 선언의 타입에 영향을 줍니다.

> 참고: 내장된 JSR-305 어노테이션인 [`@Nonnull`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/Nonnull.html), [`@Nullable`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/3.0.1/javax/annotation/Nullable.html), [`@CheckForNull`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/CheckForNull.html)은 항상 활성화되어 있으며, `-Xjsr305` 플래그를 통한 컴파일러 설정과 관계없이 Kotlin에서 어노테이션된 선언의 타입에 영향을 줍니다.
>
{style="note"}

예를 들어 컴파일러 인수에 `-Xjsr305=ignore -Xjsr305=under-migration:ignore -Xjsr305=@org.library.MyNullable:warn`을 추가하면, 컴파일러는 `@org.library.MyNullable`로 어노테이션된 타입의 부적절한 사용에 대해 경고를 생성하고 다른 모든 JSR-305 어노테이션은 무시합니다.

기본 동작은 `-Xjsr305=warn`과 동일합니다. `strict` 값은 실험적인 것으로 간주해야 합니다(향후 더 많은 체크가 추가될 수 있음).

## 매핑된 타입(Mapped types)

Kotlin은 일부 Java 타입을 특별하게 취급합니다. 이러한 타입들은 Java에서 있는 그대로 로드되지 않고, 대응하는 Kotlin 타입으로 _매핑_됩니다. 매핑은 컴파일 타임에만 중요하며, 런타임 표현은 변경되지 않은 상태로 유지됩니다.
Java의 기본형(primitive types)은 대응하는 Kotlin 타입으로 매핑됩니다([플랫폼 타입](#null-안정성-및-플랫폼-타입)을 염두에 두세요).

| **Java 타입** | **Kotlin 타입**  |
|---------------|------------------|
| `byte`        | `kotlin.Byte`    |
| `short`       | `kotlin.Short`   |
| `int`         | `kotlin.Int`     |
| `long`        | `kotlin.Long`    |
| `char`        | `kotlin.Char`    |
| `float`       | `kotlin.Float`   |
| `double`      | `kotlin.Double`  |
| `boolean`     | `kotlin.Boolean` |

기본형이 아닌 일부 내장 클래스도 매핑됩니다.

| **Java 타입** | **Kotlin 타입**  |
|---------------|------------------|
| `java.lang.Object`       | `kotlin.Any!`    |
| `java.lang.Cloneable`    | `kotlin.Cloneable!`    |
| `java.lang.Comparable`   | `kotlin.Comparable!`    |
| `java.lang.Enum`         | `kotlin.Enum!`    |
| `java.lang.annotation.Annotation`   | `kotlin.Annotation!`    |
| `java.lang.CharSequence` | `kotlin.CharSequence!`   |
| `java.lang.String`       | `kotlin.String!`   |
| `java.lang.Number`       | `kotlin.Number!`     |
| `java.lang.Throwable`    | `kotlin.Throwable!`    |

Java의 박싱된 기본형(boxed primitive types)은 nullable Kotlin 타입으로 매핑됩니다.

| **Java 타입**           | **Kotlin 타입**  |
|-------------------------|------------------|
| `java.lang.Byte`        | `kotlin.Byte?`   |
| `java.lang.Short`       | `kotlin.Short?`  |
| `java.lang.Integer`     | `kotlin.Int?`    |
| `java.lang.Long`        | `kotlin.Long?`   |
| `java.lang.Character`   | `kotlin.Char?`   |
| `java.lang.Float`       | `kotlin.Float?`  |
| `java.lang.Double`      | `kotlin.Double?`  |
| `java.lang.Boolean`     | `kotlin.Boolean?` |

타입 파라미터로 사용된 박싱된 기본형은 플랫폼 타입으로 매핑된다는 점에 유의하세요. 예를 들어 `List<java.lang.Integer>`는 Kotlin에서 `List<Int!>`가 됩니다.

컬렉션 타입은 Kotlin에서 읽기 전용 또는 가변일 수 있으므로 Java의 컬렉션은 다음과 같이 매핑됩니다(이 표의 모든 Kotlin 타입은 `kotlin.collections` 패키지에 위치합니다).

| **Java 타입** | **Kotlin 읽기 전용 타입**  | **Kotlin 가변 타입** | **로드된 플랫폼 타입** |
|---------------|----------------------------|-------------------------|--------------------------|
| `Iterator<T>`        | `Iterator<T>`        | `MutableIterator<T>`            | `(Mutable)Iterator<T>!`            |
| `Iterable<T>`        | `Iterable<T>`        | `MutableIterable<T>`            | `(Mutable)Iterable<T>!`            |
| `Collection<T>`      | `Collection<T>`      | `MutableCollection<T>`          | `(Mutable)Collection<T>!`          |
| `Set<T>`             | `Set<T>`             | `MutableSet<T>`                 | `(Mutable)Set<T>!`                 |
| `List<T>`            | `List<T>`            | `MutableList<T>`                | `(Mutable)List<T>!`                |
| `ListIterator<T>`    | `ListIterator<T>`    | `MutableListIterator<T>`        | `(Mutable)ListIterator<T>!`        |
| `Map<K, V>`          | `Map<K, V>`          | `MutableMap<K, V>`              | `(Mutable)Map<K, V>!`              |
| `Map.Entry<K, V>`    | `Map.Entry<K, V>`    | `MutableMap.MutableEntry<K,V>` | `(Mutable)Map.(Mutable)Entry<K, V>!` |

Java의 배열은 [아래](#java-배열)에서 언급한 대로 매핑됩니다.

| **Java 타입** | **Kotlin 타입**                |
|---------------|--------------------------------|
| `int[]`       | `kotlin.IntArray!`             |
| `String[]`    | `kotlin.Array<(out) String!>!` |

> 이러한 Java 타입의 정적 멤버(static members)는 Kotlin 타입의 [동반 객체(companion objects)](object-declarations.md#companion-objects)에서 직접 접근할 수 없습니다. 이를 호출하려면 Java 타입의 정규화된 이름을 사용하세요(예: `java.lang.Integer.toHexString(foo)`).
>
{style="note"}

## Kotlin에서의 Java 제네릭

Kotlin의 제네릭은 Java의 것과 약간 다릅니다([제네릭](generics.md) 참조).
Java 타입을 Kotlin으로 가져올 때 다음과 같은 변환이 이루어집니다.

* Java의 와일드카드는 타입 프로젝션(type projections)으로 변환됩니다.
  * `Foo<? extends Bar>`는 `Foo<out Bar!>!`가 됩니다.
  * `Foo<? super Bar>`는 `Foo<in Bar!>!`가 됩니다.

* Java의 로우 타입(raw types)은 스타 프로젝션(star projections)으로 변환됩니다.
  * `List`는 `List<*>!`, 즉 `List<out Any?>!`가 됩니다.

Java와 마찬가지로 Kotlin의 제네릭은 런타임에 유지되지 않습니다. 객체는 생성자에 전달된 실제 타입 인자에 대한 정보를 전달하지 않습니다. 예를 들어 `ArrayList<Integer>()`는 `ArrayList<Character>()`와 구별할 수 없습니다.
이로 인해 제네릭을 고려한 `is` 체크를 수행하는 것이 불가능합니다.
Kotlin은 스타 프로젝션된 제네릭 타입에 대해서만 `is` 체크를 허용합니다.

```kotlin
if (a is List<Int>) // 에러: 실제로 Int의 List인지 확인할 수 없음
// 하지만
if (a is List<*>) // OK: 리스트 내용에 대한 보장은 없음
```

## Java 배열

Kotlin의 배열은 Java와 달리 불변(invariant)입니다. 즉, Kotlin은 `Array<String>`을 `Array<Any>`에 할당하는 것을 허용하지 않으며, 이는 발생 가능한 런타임 실패를 방지합니다. 하위 클래스의 배열을 상위 클래스의 배열로서 Kotlin 메서드에 전달하는 것도 금지되지만, Java 메서드의 경우 `Array<(out) String>!` 형식의 [플랫폼 타입](#null-안정성-및-플랫폼-타입)을 통해 허용됩니다.

Java 플랫폼에서는 박싱/언박싱 작업 비용을 피하기 위해 기본 데이터 타입과 함께 배열이 사용됩니다. Kotlin은 이러한 구현 세부 사항을 숨기므로, Java 코드와 인터페이스하기 위한 해결책이 필요합니다. 이를 위해 모든 기본형 배열 타입에 대한 전용 클래스(`IntArray`, `DoubleArray`, `CharArray` 등)가 있습니다. 이들은 `Array` 클래스와 관련이 없으며 성능 극대화를 위해 Java의 기본형 배열로 컴파일됩니다.

정수 배열 인덱스를 받는 Java 메서드가 있다고 가정해 보겠습니다.

``` java
public class JavaArrayExample {
    public void removeIndices(int[] indices) {
        // 코드 작성...
    }
}
```

기본형 값의 배열을 전달하려면 Kotlin에서 다음과 같이 할 수 있습니다.

```kotlin
val javaObj = JavaArrayExample()
val array = intArrayOf(0, 1, 2, 3)
javaObj.removeIndices(array)  // 메서드에 int[]를 전달함
```

JVM 바이트코드로 컴파일할 때, 컴파일러는 오버헤드가 발생하지 않도록 배열 접근을 최적화합니다.

```kotlin
val array = arrayOf(1, 2, 3, 4)
array[1] = array[1] * 2 // get() 및 set()에 대한 실제 호출이 생성되지 않음
for (x in array) { // 이터레이터가 생성되지 않음
    print(x)
}
```

인덱스로 탐색할 때도 오버헤드가 발생하지 않습니다.

```kotlin
for (i in array.indices) { // 이터레이터가 생성되지 않음
    array[i] += 2
}
```

마지막으로 `in` 체크도 오버헤드가 없습니다.

```kotlin
if (i in array.indices) { // (i >= 0 && i < array.size)와 동일함
    print(array[i])
}
```

## Java 가변 인자(varargs)

Java 클래스는 때때로 가변 인자(varargs)를 사용하는 메서드 선언을 사용합니다.

``` java
public class JavaArrayExample {

    public void removeIndicesVarArg(int... indices) {
        // 코드 작성...
    }
}
```

이 경우 `IntArray`를 전달하려면 스프레드(spread) 연산자 `*`를 사용해야 합니다.

```kotlin
val javaObj = JavaArrayExample()
val array = intArrayOf(0, 1, 2, 3)
javaObj.removeIndicesVarArg(*array)
```

## 연산자

Java에는 연산자 구문을 사용하기에 적합한 메서드를 표시하는 방법이 없으므로, Kotlin은 올바른 이름과 시그니처를 가진 모든 Java 메서드를 연산자 오버로딩 및 기타 관례(`invoke()` 등)로 사용할 수 있도록 허용합니다.
중위 호출(infix call) 구문을 사용하여 Java 메서드를 호출하는 것은 허용되지 않습니다.

## 체크 예외(Checked exceptions)

Kotlin에서 모든 [예외는 언체크 예외(unchecked)](exceptions.md)입니다. 즉, 컴파일러가 어떤 예외도 잡도록 강제하지 않습니다.
따라서 체크 예외를 선언하는 Java 메서드를 호출할 때 Kotlin은 사용자에게 아무것도 강제하지 않습니다.

```kotlin
fun render(list: List<*>, to: Appendable) {
    for (item in list) {
        to.append(item.toString()) // Java라면 여기서 IOException을 잡아야 함
    }
}
```

## Object 메서드

Java 타입이 Kotlin으로 임포트될 때 `java.lang.Object` 타입의 모든 참조는 `Any`로 바뀝니다.
`Any`는 플랫폼에 구속되지 않으므로 멤버로 `toString()`, `hashCode()`, `equals()`만 선언하고 있습니다. 따라서 `java.lang.Object`의 다른 멤버를 사용할 수 있도록 Kotlin은 [확장 함수(extension functions)](extensions.md)를 사용합니다.

### `wait()` 및 `notify()`

`wait()` 및 `notify()` 메서드는 `Any` 타입의 참조에서 사용할 수 없습니다. 일반적으로 `java.util.concurrent`를 대신 사용하는 것이 권장됩니다.

이러한 메서드를 반드시 호출해야 하는 경우, Java 객체로 캐스팅하여 사용하고 `PLATFORM_CLASS_MAPPED_TO_KOTLIN` 경고를 억제하세요.

```kotlin
import java.util.LinkedList

class SimpleBlockingQueue<T>(private val capacity: Int) {
    private val queue = LinkedList<T>()

    // wait() 및 notify()에 접근하기 위해 구체적으로 java.lang.Object를 사용함
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

또는 명시적으로 `java.lang.Object`로 캐스팅하고 `PLATFORM_CLASS_MAPPED_TO_KOTLIN` 경고를 억제하세요.

```kotlin
@Suppress("PLATFORM_CLASS_MAPPED_TO_KOTLIN")
(foo as java.lang.Object).wait()
```

### `getClass()`

객체의 Java 클래스를 검색하려면 [클래스 참조(class reference)](reflection.md#class-references)에서 `java` 확장 프로퍼티를 사용하세요.

```kotlin
val fooClass = foo::class.java
```

위의 코드는 [바운드 클래스 참조(bound class reference)](reflection.md#bound-class-references)를 사용합니다. `javaClass` 확장 프로퍼티를 사용할 수도 있습니다.

```kotlin
val fooClass = foo.javaClass
```

### `clone()`

`clone()`을 오버라이드하려면 클래스가 `kotlin.Cloneable`을 상속받아야 합니다.

```kotlin
class Example : Cloneable {
    override fun clone(): Any { ... }
}
```

[Effective Java, 3rd Edition](https://www.oracle.com/technetwork/java/effectivejava-136174.html)의 Item 13: *clone 재정의는 신중히 하라*를 잊지 마세요.

### `finalize()`

`finalize()`를 오버라이드하려면 `override` 키워드를 사용하지 않고 단순히 선언하기만 하면 됩니다.

```kotlin
class C {
    protected fun finalize() {
        // 파이널라이제이션 로직
    }
}
```

Java의 규칙에 따라 `finalize()`는 `private`이어서는 안 됩니다.

## Java 클래스 상속

Kotlin의 클래스는 최대 하나의 Java 클래스(및 원하는 만큼의 Java 인터페이스)를 상위 타입으로 가질 수 있습니다.

## 정적 멤버 접근

Java 클래스의 정적 멤버는 해당 클래스의 "동반 객체(companion objects)"를 형성합니다. 이러한 "동반 객체"를 값처럼 전달할 수는 없지만 멤버에 명시적으로 접근할 수는 있습니다. 예를 들면 다음과 같습니다.

```kotlin
if (Character.isLetter(a)) { ... }
```

Kotlin 타입으로 [매핑된](#매핑된-타입) Java 타입의 정적 멤버에 접근하려면 Java 타입의 정규화된 이름을 사용하세요: `java.lang.Integer.bitCount(foo)`.

## Java 리플렉션

Java 리플렉션은 Kotlin 클래스에서 작동하며 그 반대도 마찬가지입니다. 위에서 언급했듯이 `instance::class.java`, `ClassName::class.java` 또는 `instance.javaClass`를 사용하여 `java.lang.Class`를 통해 Java 리플렉션으로 들어갈 수 있습니다.
이 목적으로 `ClassName.javaClass`를 사용하지 마세요. 이는 `ClassName::class.java`가 아니라 `ClassName.Companion::class.java`와 동일한 `ClassName`의 동반 객체 클래스를 참조하기 때문입니다.

각 기본형에 대해 두 개의 서로 다른 Java 클래스가 있으며, Kotlin은 두 가지 모두를 얻을 수 있는 방법을 제공합니다. 예를 들어 `Int::class.java`는 Java의 `Integer.TYPE`에 해당하는 기본형 자체를 나타내는 클래스 인스턴스를 반환합니다. 대응하는 래퍼(wrapper) 타입의 클래스를 얻으려면 Java의 `Integer.class`와 동일한 `Int::class.javaObjectType`을 사용하세요.

다른 지원 사례로는 Kotlin 프로퍼티에 대한 Java 게터/세터 메서드 또는 배킹 필드(backing field) 획득, Java 필드에 대한 `KProperty` 획득, `KFunction`에 대한 Java 메서드 또는 생성자 획득 및 그 반대의 경우가 포함됩니다.

## SAM 변환

Kotlin은 Java와 [Kotlin 인터페이스](fun-interfaces.md) 모두에 대해 SAM 변환을 지원합니다. 
Java에 대한 이 지원은 인터페이스 메서드의 파라미터 타입이 Kotlin 함수의 파라미터 타입과 일치하는 한, 단일 비디폴트 메서드(single non-default method)가 있는 Java 인터페이스의 구현으로 Kotlin 함수 리터럴이 자동으로 변환될 수 있음을 의미합니다.

SAM 인터페이스의 인스턴스를 생성하는 데 이를 사용할 수 있습니다.

```kotlin
val runnable = Runnable { println("This runs in a runnable") }
```

...그리고 메서드 호출 시에도 사용할 수 있습니다.

```kotlin
val executor = ThreadPoolExecutor()
// Java 시그니처: void execute(Runnable command)
executor.execute { println("This runs in a thread pool") }
```

Java 클래스에 함수형 인터페이스를 받는 여러 메서드가 있는 경우, 람다를 특정 SAM 타입으로 변환하는 어댑터 함수를 사용하여 호출해야 하는 메서드를 선택할 수 있습니다. 이러한 어댑터 함수는 필요할 때 컴파일러에 의해 생성되기도 합니다.

```kotlin
executor.execute(Runnable { println("This runs in a thread pool") })
```

> SAM 변환은 인터페이스에서만 작동하며, 추상 메서드가 하나만 있더라도 추상 클래스에서는 작동하지 않습니다.
>
{style="note"}

## Kotlin에서 JNI 사용하기

네이티브(C 또는 C++) 코드로 구현된 함수를 선언하려면 `external` 한정자를 붙여야 합니다.

```kotlin
external fun foo(x: Int): Double
```

나머지 절차는 Java와 완전히 동일한 방식으로 작동합니다.

프로퍼티 게터와 세터에도 `external`을 표시할 수 있습니다.

```kotlin
var myProperty: String
    external get
    external set
```

내부적으로 이는 각각 `external`로 표시된 `getMyProperty`와 `setMyProperty`라는 두 개의 함수를 생성합니다.

## Kotlin에서 Lombok 생성 선언 사용하기

Kotlin 코드에서 Java의 Lombok 생성 선언을 사용할 수 있습니다.
동일한 혼합 Java/Kotlin 모듈에서 이러한 선언을 생성하고 사용해야 하는 경우, [Lombok 컴파일러 플러그인 페이지](lombok.md)에서 그 방법을 알아볼 수 있습니다.
다른 모듈에서 이러한 선언을 호출하는 경우, 해당 모듈을 컴파일하기 위해 이 플러그인을 사용할 필요는 없습니다.