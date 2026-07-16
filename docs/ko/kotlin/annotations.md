[//]: # (title: 어노테이션)

어노테이션(Annotations)은 코드 요소에 메타데이터를 첨부하는 데 사용할 수 있는 태그입니다. 도구와 프레임워크는 컴파일 및 런타임 중에 이 메타데이터를 처리하여 이를 기반으로 다양한 동작을 수행합니다.

상용구 코드(boilerplate code) 생성, 코딩 표준 준수 강제 또는 문서 작성과 같은 일반적인 작업을 단순화하고 자동화하기 위해 코드에 어노테이션을 달 수 있습니다.

> 자신만의 어노테이션 프로세서를 개발하려는 경우, [Kotlin Symbol Processing (KSP)](ksp-overview.md) API를 사용할 수 있습니다.
>
{style="tip"}

## 선언

어노테이션은 클래스의 특별한 유형입니다. 어노테이션을 선언하려면 클래스 선언 앞에 `annotation` 키워드를 사용합니다.

```kotlin
annotation class Fancy
```

어노테이션 클래스에 메타 어노테이션(meta-annotations)을 추가하여 어노테이션의 추가 속성을 지정할 수 있습니다.

  * [`@Target`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.annotation/-target/index.html)은 어노테이션을 달 수 있는 요소의 가능한 종류(클래스, 함수, 프로퍼티, 표현식 등)를 지정합니다.
  * [`@Retention`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.annotation/-retention/index.html)은 어노테이션이 컴파일된 클래스 파일에 저장되는지 여부와 런타임에 리플렉션을 통해 볼 수 있는지 여부를 지정합니다(기본값은 둘 다 true입니다).
  * [`@Repeatable`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.annotation/-repeatable/index.html)은 단일 요소에 동일한 어노테이션을 여러 번 사용하는 것을 허용합니다.
  * [`@MustBeDocumented`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.annotation/-must-be-documented/index.html)는 어노테이션이 공개 API의 일부이며 생성된 API 문서에 표시되는 클래스 또는 메서드 시그니처에 포함되어야 함을 지정합니다.

```kotlin
@Target(AnnotationTarget.CLASS, AnnotationTarget.FUNCTION,
        AnnotationTarget.TYPE_PARAMETER, AnnotationTarget.VALUE_PARAMETER,
        AnnotationTarget.EXPRESSION)
@Retention(AnnotationRetention.SOURCE)
@MustBeDocumented
annotation class Fancy
```

## 사용법

```kotlin
@Fancy class Foo {
    @Fancy fun baz(@Fancy foo: Int): Int {
        return (@Fancy 1)
    }
}
```

클래스의 주 생성자(primary constructor)에 어노테이션을 달아야 하는 경우, 생성자 선언에 `constructor` 키워드를 추가하고 그 앞에 어노테이션을 추가해야 합니다.

```kotlin
class Foo @Inject constructor(dependency: MyDependency) { ... }
```

프로퍼티 접근자(property accessors)에도 어노테이션을 달 수 있습니다.

```kotlin
class Foo {
    var x: MyDependency? = null
        @Inject set
}
```

## 생성자

어노테이션은 파라미터를 받는 생성자를 가질 수 있습니다.

```kotlin
annotation class Special(val why: String)

@Special("example") class Foo {}
```

허용되는 파라미터 타입은 다음과 같습니다.

 * Java 프리미티브 타입에 대응하는 타입 (Int, Long 등)
 * 문자열 (Strings)
 * 클래스 (`Foo::class`)
 * 열거형 (Enums)
 * 다른 어노테이션
 * 위에 나열된 타입의 배열

JVM은 어노테이션 속성의 값으로 `null`을 저장하는 것을 지원하지 않기 때문에, 어노테이션 파라미터는 nullable 타입을 가질 수 없습니다.

어노테이션이 다른 어노테이션의 파라미터로 사용되는 경우, 그 이름 앞에 `@` 문자가 붙지 않습니다.

```kotlin
annotation class ReplaceWith(val expression: String)

annotation class Deprecated(
        val message: String,
        val replaceWith: ReplaceWith = ReplaceWith(""))

@Deprecated("This function is deprecated, use === instead", ReplaceWith("this === other"))
```

어노테이션의 인자로 클래스를 지정해야 하는 경우, Kotlin 클래스([KClass](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-class/index.html))를 사용하세요. Kotlin 컴파일러는 이를 Java 클래스로 자동으로 변환하여 Java 코드가 어노테이션과 인자에 정상적으로 접근할 수 있도록 합니다.

```kotlin

import kotlin.reflect.KClass

annotation class Ann(val arg1: `KClass<*>`, val arg2: KClass<out Any>)

@Ann(String::class, Int::class) class MyClass
```

## 인스턴스화

Java에서 어노테이션 타입은 인터페이스의 일종이므로 이를 구현하고 인스턴스를 사용할 수 있습니다. 이 메커니즘의 대안으로, Kotlin에서는 임의의 코드에서 어노테이션 클래스의 생성자를 호출하고 결과 인스턴스를 유사하게 사용할 수 있도록 합니다.

```kotlin
annotation class InfoMarker(val info: String)

fun processInfo(marker: InfoMarker): Unit = TODO()

fun main(args: Array<String>) {
    if (args.isNotEmpty())
        processInfo(getAnnotationReflective(args))
    else
        processInfo(InfoMarker("default"))
}
```

어노테이션 클래스의 인스턴스화에 대한 자세한 내용은 [이 KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/annotation-instantiation.md)에서 확인할 수 있습니다.

## 람다

어노테이션은 람다에도 사용할 수 있습니다. 어노테이션은 람다 본문이 생성되는 `invoke()` 메서드에 적용됩니다. 이는 동시성 제어를 위해 어노테이션을 사용하는 [Quasar](https://docs.paralleluniverse.co/quasar/)와 같은 프레임워크에 유용합니다.

```kotlin
annotation class Suspendable

val f = @Suspendable { Fiber.sleep(10) }
```

## 어노테이션 사용 지점 대상

프로퍼티나 주 생성자 파라미터에 어노테이션을 달 때, 해당 Kotlin 요소로부터 생성되는 여러 Java 요소가 존재하며, 따라서 생성된 Java 바이트코드 내에서 어노테이션이 위치할 수 있는 여러 지점이 존재합니다. 어노테이션이 정확히 어떻게 생성되어야 하는지 지정하려면 다음 구문을 사용하세요.

```kotlin
class Example(@field:Ann val foo,    // Java 필드에만 어노테이션 추가
              @get:Ann val bar,      // Java 게터에만 어노테이션 추가
              @param:Ann val quux)   // Java 생성자 파라미터에만 어노테이션 추가
```

동일한 구문을 사용하여 전체 파일에 어노테이션을 달 수 있습니다. 이를 위해 파일의 최상위 레벨, 즉 패키지 지시문 앞이나 파일이 기본 패키지에 있는 경우 모든 임포트 앞에 `file` 대상을 가진 어노테이션을 배치합니다.

```kotlin
@file:JvmName("Foo")

package org.jetbrains.demo
```

동일한 대상을 가진 여러 어노테이션이 있는 경우, 대상 뒤에 대괄호를 추가하고 대괄호 안에 모든 어노테이션을 넣어 대상 반복을 피할 수 있습니다(`all` 메타 대상 제외).

```kotlin
class Example {
     @set:[Inject VisibleForTesting]
     var collaborator: Collaborator
}
```

지원되는 사용 지점 대상(use-site targets)의 전체 목록은 다음과 같습니다.

  * `file`
  * `field`
  * `property` (이 대상을 가진 어노테이션은 Java에서 볼 수 없음)
  * `get` (프로퍼티 게터)
  * `set` (프로퍼티 세터)
  * `all` (프로퍼티를 위한 실험적인 메타 대상으로, 목적과 사용법은 [아래](#all-meta-target)를 참조)
  * `receiver` (확장 함수 또는 프로퍼티의 수신 객체 파라미터)

    확장 함수의 수신 객체 파라미터에 어노테이션을 달려면 다음 구문을 사용합니다.

    ```kotlin
    fun @receiver:Fancy String.myExtension() { ... }
    ```

  * `param` (생성자 파라미터)
  * `setparam` (프로퍼티 세터 파라미터)
  * `delegate` (위임된 프로퍼티의 위임 인스턴스를 저장하는 필드)

### 사용 지점 대상이 지정되지 않은 경우의 기본값

사용 지점 대상을 지정하지 않으면, 사용 중인 어노테이션의 `@Target` 어노테이션에 따라 대상이 선택됩니다.
적용 가능한 대상이 여러 개인 경우, 다음 목록에서 적용 가능한 첫 번째 대상이 사용됩니다.

* `param`
* `property`
* `field`

[Jakarta Bean Validation의 `@Email` 어노테이션](https://jakarta.ee/specifications/bean-validation/3.0/apidocs/jakarta/validation/constraints/email)을 예로 들어보겠습니다.

```java
@Target(value={METHOD,FIELD,ANNOTATION_TYPE,CONSTRUCTOR,PARAMETER,TYPE_USE})
public @interface Email { }
```

이 어노테이션을 사용하는 다음 예제를 살펴보세요.

```kotlin
data class User(val username: String,
                // @Email은 @param:Email과 동일함
                @Email val email: String) {
    // @Email은 @field:Email과 동일함
    @Email val secondaryEmail: String? = null
}
```

Kotlin 2.2.0에서는 파라미터, 필드 및 프로퍼티로의 어노테이션 전파를 더 예측 가능하게 만드는 실험적인 기본 규칙이 도입되었습니다.

새 규칙에 따르면, 적용 가능한 대상이 여러 개인 경우 다음과 같이 하나 이상이 선택됩니다.

* 생성자 파라미터 대상(`param`)이 적용 가능하면 사용됩니다.
* 프로퍼티 대상(`property`)이 적용 가능하면 사용됩니다.
* `property`가 적용 가능하지 않은 동안 필드 대상(`field`)이 적용 가능하면 `field`가 사용됩니다.

동일한 예제를 사용하면 다음과 같습니다.

```kotlin
data class User(val username: String,
                // @Email은 이제 @param:Email @field:Email과 동일함
                @Email val email: String) {
    // @Email은 여전히 @field:Email과 동일함
    @Email val secondaryEmail: String? = null
}
```

대상이 여러 개이고 `param`, `property`, `field` 중 어느 것도 적용 가능하지 않으면 어노테이션은 유효하지 않습니다.

새로운 기본 규칙을 활성화하려면 Gradle 설정에서 다음 라인을 사용하세요.

```kotlin
// build.gradle.kts
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xannotation-default-target=param-property")
    }
}
```

이전 동작을 사용하고 싶을 때는 언제든지 다음과 같이 할 수 있습니다.

* 특정 사례에서 `@Annotation` 대신 `@param:Annotation`을 사용하는 것과 같이 필요한 대상을 명시적으로 지정합니다.
* 프로젝트 전체에 대해 Gradle 빌드 파일에서 이 플래그를 사용합니다.

    ```kotlin
    // build.gradle.kts
    kotlin {
        compilerOptions {
            freeCompilerArgs.add("-Xannotation-default-target=first-only")
        }
    }
    ```

### `all` 메타 대상

<primary-label ref="experimental-opt-in"/>

`all` 대상은 파라미터와 프로퍼티 또는 필드뿐만 아니라 해당하는 게터와 세터에도 동일한 어노테이션을 더 쉽게 적용할 수 있게 해줍니다.

구체적으로, `all`로 표시된 어노테이션은 적용 가능한 경우 다음과 같이 전파됩니다.

* 프로퍼티가 주 생성자에 정의된 경우 생성자 파라미터(`param`)로 전파.
* 프로퍼티 자체(`property`)로 전파.
* 프로퍼티에 뒷받침하는 필드(backing field)가 있는 경우 해당 필드(`field`)로 전파.
* 게터(`get`)로 전파.
* 프로퍼티가 `var`로 정의된 경우 세터 파라미터(`setparam`)로 전파.
* 클래스에 `@JvmRecord` 어노테이션이 있는 경우 Java 전용 대상인 `RECORD_COMPONENT`로 전파.

다음과 같이 정의된 [Jakarta Bean Validation의 `@Email` 어노테이션](https://jakarta.ee/specifications/bean-validation/3.0/apidocs/jakarta/validation/constraints/email)을 예로 들어보겠습니다.

```java
@Target(value={METHOD,FIELD,ANNOTATION_TYPE,CONSTRUCTOR,PARAMETER,TYPE_USE})
public @interface Email { }
```

아래 예제에서 이 `@Email` 어노테이션은 모든 관련 대상에 적용됩니다.

```kotlin
data class User(
    val username: String,
    // @Email을 param, field, get에 적용
    @all:Email val email: String,
    // @Email을 param, field, get, setparam에 적용
    @all:Email var name: String,
) {
    // @Email을 field와 getter에 적용 (생성자에 없으므로 param은 제외)
    @all:Email val secondaryEmail: String? = null
}
```

주 생성자 내부와 외부 모두에서 모든 프로퍼티에 `all` 메타 대상을 사용할 수 있습니다.

#### 제한 사항

`all` 대상에는 몇 가지 제한 사항이 있습니다.

* 타입, 잠재적인 확장 수신 객체, 컨텍스트 수신 객체 또는 파라미터로는 어노테이션을 전파하지 않습니다.
* 여러 어노테이션과 함께 사용할 수 없습니다.
    ```kotlin
    @all:[A B] // 금지됨, @all:A @all:B를 사용하세요
    val x: Int = 5
    ```
* [위임된 프로퍼티](delegated-properties.md)와 함께 사용할 수 없습니다.

#### 활성화 방법

프로젝트에서 `all` 메타 대상을 활성화하려면 명령줄에서 다음 컴파일러 옵션을 사용하세요.

```Bash
-Xannotation-target-all
```

또는 Gradle 빌드 파일의 `compilerOptions {}` 블록에 추가하세요.

```kotlin
// build.gradle.kts
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xannotation-target-all")
    }
}
```

## Java 어노테이션

Java 어노테이션은 Kotlin과 100% 호환됩니다.

```kotlin
import org.junit.Test
import org.junit.Assert.*
import org.junit.Rule
import org.junit.rules.*

class Tests {
    // 프로퍼티 게터에 @Rule 어노테이션 적용
    @get:Rule val tempFolder = TemporaryFolder()

    @Test fun simple() {
        val f = tempFolder.newFile()
        assertEquals(42, getTheAnswer())
    }
}
```

Java로 작성된 어노테이션의 파라미터 순서는 정의되어 있지 않으므로, 인자를 전달할 때 일반적인 함수 호출 구문을 사용할 수 없습니다. 대신 이름 있는 인자(named argument) 구문을 사용해야 합니다.

``` java
// Java
public @interface Ann {
    int intValue();
    String stringValue();
}
```

```kotlin
// Kotlin
@Ann(intValue = 1, stringValue = "abc") class C
```

Java에서와 마찬가지로 `value` 파라미터는 특별한 경우이며, 명시적인 이름 없이 값을 지정할 수 있습니다.

``` java
// Java
public @interface AnnWithValue {
    String value();
}
```

```kotlin
// Kotlin
@AnnWithValue("abc") class C
```

### 어노테이션 파라미터로서의 배열

Java의 `value` 인자가 배열 타입인 경우, Kotlin에서는 `vararg` 파라미터가 됩니다.

``` java
// Java
public @interface AnnWithArrayValue {
    String[] value();
}
```

```kotlin
@AnnWithArrayValue("abc", "foo", "bar") class C
```

배열 타입을 가진 다른 인자의 경우, 배열 리터럴 구문이나 `arrayOf(...)`를 사용해야 합니다.

``` java
// Java
public @interface AnnWithArrayMethod {
    String[] names();
}
```

```kotlin
@AnnWithArrayMethod(names = ["abc", "foo", "bar"])
class C
```

### 어노테이션 인스턴스의 프로퍼티 접근

어노테이션 인스턴스의 값은 Kotlin 코드에 프로퍼티로 노출됩니다.

``` java
// Java
public @interface Ann {
    int value();
}
```

```kotlin
// Kotlin
fun foo(ann: Ann) {
    val i = ann.value
}
```

### JVM 1.8+ 어노테이션 대상을 생성하지 않는 기능

Kotlin 어노테이션의 Kotlin 대상 중에 `TYPE`이 있으면, 해당 어노테이션은 Java 어노테이션 대상 목록의 `java.lang.annotation.ElementType.TYPE_USE`에 매핑됩니다. 이는 `TYPE_PARAMETER` Kotlin 대상이 `java.lang.annotation.ElementType.TYPE_PARAMETER` Java 대상에 매핑되는 것과 같습니다. 이는 API 레벨이 26 미만인 Android 클라이언트에서 이러한 대상이 API에 없기 때문에 문제가 됩니다.

`TYPE_USE` 및 `TYPE_PARAMETER` 어노테이션 대상을 생성하지 않으려면 새로운 컴파일러 인자 `-Xno-new-java-annotation-targets`를 사용하세요.

## 반복 가능한 어노테이션

[Java에서와](https://docs.oracle.com/javase/tutorial/java/annotations/repeating.html) 마찬가지로 Kotlin에도 단일 코드 요소에 여러 번 적용할 수 있는 반복 가능한 어노테이션(repeatable annotations)이 있습니다. 어노테이션을 반복 가능하게 만들려면 선언부에 [`@kotlin.annotation.Repeatable`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.annotation/-repeatable/) 메타 어노테이션을 표시하세요. 이렇게 하면 Kotlin과 Java 모두에서 반복 가능해집니다. Java의 반복 가능한 어노테이션도 Kotlin 측에서 지원됩니다.

Java에서 사용되는 방식과의 주요 차이점은 Kotlin 컴파일러가 미리 정의된 이름으로 자동으로 생성하는 *컨테이너 어노테이션(containing annotation)*이 없다는 점입니다. 아래 예제의 어노테이션에 대해 컴파일러는 컨테이너 어노테이션 `@Tag.Container`를 생성합니다.

```kotlin
@Repeatable
annotation class Tag(val name: String)

// 컴파일러가 @Tag.Container 컨테이너 어노테이션을 생성함
```

[`@kotlin.jvm.JvmRepeatable`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.jvm/-jvm-repeatable/) 메타 어노테이션을 적용하고 명시적으로 선언된 컨테이너 어노테이션 클래스를 인자로 전달하여 컨테이너 어노테이션에 대한 사용자 정의 이름을 설정할 수 있습니다.

```kotlin
@JvmRepeatable(Tags::class)
annotation class Tag(val name: String)

annotation class Tags(val value: Array<Tag>)
```

리플렉션을 통해 Kotlin 또는 Java의 반복 가능한 어노테이션을 추출하려면 [`KAnnotatedElement.findAnnotations()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect.full/find-annotations.html) 함수를 사용하세요.

Kotlin의 반복 가능한 어노테이션에 대한 자세한 내용은 [이 KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/repeatable-annotations.md)에서 확인할 수 있습니다.