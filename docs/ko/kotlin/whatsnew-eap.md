[//]: # (title: Kotlin %kotlinEapVersion%의 새로운 기능)

<primary-label ref="eap"/>

<show-structure depth="1"/>

<web-summary>Kotlin Early Access Preview 릴리스 노트를 읽고 최신 실험적 Kotlin 기능이 공식 출시되기 전에 미리 사용해 보세요.</web-summary>

_[출시일: %kotlinEapReleaseDate%](eap.md#build-details)_

> 이 문서는 Early Access Preview(EAP) 릴리스의 모든 기능을 다루지는 않지만,
> 주요 개선 사항을 중심으로 소개합니다.
>
> 전체 변경 사항 목록은 [GitHub 변경 로그](https://github.com/JetBrains/kotlin/releases/tag/v%kotlinEapVersion%)에서 확인하세요.
>
{style="note"}

Kotlin %kotlinEapVersion% 릴리스가 출시되었습니다! 이번 EAP 릴리스의 주요 내용은 다음과 같습니다.

* **언어**: [`only-syntax` 모드에서의 안정적인 이름 기반 구조 분해, 미사용 반환값 검사기, 개선된 컴파일 타임 상수](#stable-language-features).
* **표준 라이브러리**: [`if` 표현식을 사용하는 일반적인 패턴을 단순화하는 새로운 실험적 함수](#new-functions-for-simplifying-common-patterns-with-if-expressions) 및 [유니코드 코드 포인트에 대한 실험적 지원](#support-for-unicode-code-points).
* **Kotlin/JVM**: [Java 28 지원](#kotlin-jvm).
* **Kotlin/Native**: [Apple 타깃에서 증분 컴파일 기본 활성화](#incremental-compilation-enabled-by-default-on-apple-targets) 및 [새로운 DSL과 함께 Swift export 베타 진입](#swift-export-goes-beta-with-a-new-gradle-dsl).
* **Kotlin Multiplatform**: [Kotlin Multiplatform을 위한 새로운 실험적 컴파일 체계](#new-experimental-compilation-scheme-for-kotlin-multiplatform) 및 [멀티플랫폼 라이브러리를 위한 새로운 배포 형식](#new-publication-format-for-kotlin-multiplatform-libraries).
* **Kotlin/JS**: [`es2020` 타깃 지원](#kotlin-js).
* **Kotlin 컴파일러**: [`klib` 컴파일 중 더욱 일관된 인라인 함수 동작](#consistent-cross-module-function-inlining-during-klib-compilation).

> Kotlin 릴리스 주기에 대한 자세한 내용은 [Kotlin 릴리스 프로세스](releases.md)를 참고하세요.
>
{style="tip"}

## Kotlin %kotlinEapVersion%으로 업데이트 {id="update-to-kotlin-kotlineapversion"}

최신 버전의 Kotlin은 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/) 및 [Android Studio](https://developer.android.com/studio)의 최신 버전에 포함되어 있습니다.

새 Kotlin 버전으로 업데이트하려면 IDE를 최신 버전으로 업데이트하고, 빌드 스크립트에서 [Kotlin 버전을 %kotlinEapVersion%으로 변경](releases.md#update-to-a-new-kotlin-version)하세요.

## 언어 {id="language"}

Kotlin %kotlinEapVersion%에서는 이전 릴리스에서 도입된 여러 언어 기능이 안정화되었습니다. 또한 실험적 기능인 컴패니언 확장(companion extensions)과 컴패니언 블록(companion blocks), 그리고 완전한 값 클래스(full value classes)가 도입되었습니다.

### 안정화된 언어 기능 {id="stable-language-features"}

<secondary-label ref="language"/>

Kotlin 2.3.0−2.4.0에서는 몇 가지 언어 기능이 [실험적(Experimental)](components-stability.md#stability-levels-explained) 상태로 도입되었습니다.
이번 릴리스에서 다음 언어 기능들이 [안정(Stable)](components-stability.md#stability-levels-explained) 상태가 되었음을 알려드립니다.

* [개선된 컴파일 타임 상수](whatsnew24.md#improved-compile-time-constants).

* 선택적 매개변수에 대해 버전 기반 오버로드를 생성하는 [`@IntroducedAt` 어노테이션](whatsnew24.md#new-introducedat-annotation-to-generate-version-based-overloads-for-optional-parameters).

* 기본으로 활성화되는 [미사용 반환값 검사기(Unused return value checker)](whatsnew23.md#unused-return-value-checker).

* `only-syntax` 모드에서 기본값이 된 [이름 기반 구조 분해(Name-based destructuring)](destructuring-declarations.md#name-based-destructuring).

  이 모드에서는 "기존" 구조 분해 구문인 `val (x, y)`가 위치 기반 동작을 유지하는 반면, "새로운" 구문인 `(val x, val y)`는 이름 기반 구조 분해를 수행합니다. 이 기능에 대한 개요는 다음 비디오에서 확인할 수 있습니다.

  <video src="https://www.youtube.com/v/He8J34KHEY4" title="Kotlin의 이름 기반 구조 분해"/>

### 컴패니언 확장 및 블록 {id="companion-extensions-and-blocks"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="language"/>

Kotlin %kotlinEapVersion%에는 컴패니언 확장(companion extensions)과 컴패니언 블록(companion blocks)이 도입되었습니다.

이전에는 타입 이름을 통해 접근할 수 있는 확장, 함수, 프로퍼티를 선언하려면 해당 타입에 컴패니언 객체(companion object)가 있어야 했습니다. 컴패니언 확장과 블록은 이러한 요구 사항을 없애고 다음과 같은 작업을 가능하게 합니다.

* 확장 대상 타입에 컴패니언 객체가 없더라도, 최상위 확장에 `companion` 제어자를 추가하여 컴패니언 확장을 선언할 수 있습니다.
* 클래스나 인터페이스 내에서 객체 인스턴스를 생성하지 않고 `companion {}` 블록 안에 함수와 프로퍼티를 선언할 수 있습니다. 정적 멤버를 지원하는 플랫폼에서 컴파일러는 이러한 선언을 정적 멤버로 생성합니다. 그 결과, JVM에서 `@JvmStatic`을 붙일 필요가 없습니다.

다음은 `UnitX`를 컴패니언 확장으로 선언하고 `Zero`를 컴패니언 블록에 선언하는 예제입니다.

```kotlin
// UnitX를 컴패니언 확장으로 선언
companion val Vector.UnitX get() = Vector(1.0, 0.0)

data class Vector(val x: Double, val y: Double) {
    companion {
        // companion 블록 내에 Zero 선언
        val Zero: Vector get() = Vector(0.0, 0.0)
    }
}

fun main() {
    println(Vector.UnitX)
    // Vector(x=1.0, y=0.0)

    println(Vector.Zero)
    // Vector(x=0.0, y=0.0)
}
```

디자인에 대한 자세한 내용은 해당 기능의 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0449-companions-block-extension.md)을 참고하세요. [블로그 게시물](https://blog.jetbrains.com/kotlin/2026/09/the-companions-to-come/)에서도 이 기능에 대해 읽어보실 수 있습니다.

컴패니언 확장과 블록은 [실험적(Experimental)](components-stability.md#stability-levels-explained) 기능입니다. 사용하려면 빌드 파일에 다음 컴파일러 옵션을 추가하세요.

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xcompanion-blocks-and-extensions")
    }
}
```

</tab>
<tab title="Maven" group-key="maven">

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <configuration>
                <args>
                    <arg>-Xcompanion-blocks-and-extensions</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

</tab>
</tabs>

[YouTrack](https://youtrack.jetbrains.com/issue/KT-11968)을 통해 의견을 남겨주시면 감사하겠습니다.

### 완전한 값 클래스 (Full value classes) {id="full-value-classes"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="language"/>

Kotlin %kotlinEapVersion% 이전에는 [인라인 값 클래스(Inline value classes)](inline-classes.md)를 사용하여 단일 값을 감싸는 커스텀 래퍼 타입을 만들 수 있었습니다. 타입에 여러 프로퍼티가 필요한 경우에는 일반 클래스나 데이터 클래스를 사용해야 했습니다. 그러나 이러한 클래스들은 동일한 데이터를 포함하는 두 인스턴스라도 참조에 의해 구분될 수 있으며, 이러한 구분이 타입에 의미가 없는 경우에도 마찬가지였습니다. 이는 런타임 최적화를 제한하고, 코드가 동일한 객체 참조가 유지되는지 여부에 불필요하게 의존하게 만들 수 있습니다.

Kotlin %kotlinEapVersion%에서는 프로퍼티들이 모여 하나의 값을 이루고 개별 인스턴스의 식별자(Identity)는 중요하지 않은 타입을 정의할 수 있는 실험적 기능인 완전한 값 클래스(Full value classes)를 도입합니다. 예를 들어, 실수(real)와 허수(imaginary) 프로퍼티를 가진 복소수를 나타내는 완전한 값 클래스 `Complex`를 선언할 수 있습니다.

```kotlin
value class Complex(val real: Double, val imaginary: Double)
```

컴파일러는 데이터 클래스와 유사하게 완전한 값 클래스에 대해 `equals()`, `hashCode()`, `toString()` 함수를 자동으로 생성합니다. 하지만 다음과 같은 차이점이 있습니다.

* `componentN()` 함수가 없습니다. 대신 [이름 기반 구조 분해](destructuring-declarations.md#name-based-destructuring)를 사용할 수 있습니다. 별도의 opt-in은 필요하지 않습니다.
* `copy()` 함수가 없습니다. 향후에는 대신 `copy vars`를 사용할 수 있게 될 예정입니다. 자세한 내용은 [KT-44653](https://youtrack.jetbrains.com/issue/KT-44653)을 참고하세요.

데이터 클래스와의 차이점에 대한 자세한 내용은 KEEP의 [상속(inheritance)](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0454-better-immutability-value-classes-MFVC.md#mfvc-and-inheritance) 섹션을 참고하세요.

#### 추상 값 클래스 {id="abstract-value-classes"}

완전한 값 클래스는 추상(abstract) 클래스일 수 있습니다. [인터페이스](interfaces.md)와 달리, 모든 하위 클래스가 생성 중에 실행할 초기화 로직을 정의할 수 있습니다.

예를 들어, `OrderedInterval` 값 클래스는 `start`와 `end`를 생성자 매개변수로 받습니다. `IntInterval` 값 클래스는 해당 값들을 `start`와 `end` 프로퍼티에 저장합니다.

```kotlin
sealed value class OrderedInterval<T : Comparable<T>> protected constructor(
    start: T,
    end: T,
) {
    init {
        require(start <= end)
    }
}

value class IntInterval(
    val start: Int,
    val end: Int
) : OrderedInterval<Int>(start, end)
```

자세한 내용은 KEEP의 [상속(inheritance)](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0454-better-immutability-value-classes-MFVC.md#mfvc-and-inheritance) 섹션을 참고하세요.

#### 값 객체 (Value objects) {id="value-objects"}

완전한 값 클래스는 프로퍼티를 갖지 않을 수도 있습니다. 이를 _값 객체(value objects)_라고 부르며, 상태나 토큰과 같이 식별자 없이 오직 하나의 가능한 값만 갖는 타입을 표현하는 데 유용합니다. 예:

```kotlin
sealed interface UserResponse

value class UserFound(val user: User) : UserResponse
value object UserUnknown : UserResponse
```

자세한 내용은 KEEP의 [값 객체(value objects)](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0454-better-immutability-value-classes-MFVC.md#value-objects) 섹션을 참고하세요.

#### 활성화 방법 {id="how-to-enable"}

이 기능은 [실험적(Experimental)](components-stability.md#stability-levels-explained)입니다. 사용하려면 빌드 파일에 다음 컴파일러 옵션을 추가하세요.

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xfull-value-classes")
    }
}
```

</tab>
<tab title="Maven" group-key="maven">

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <configuration>
                <args>
                    <arg>-Xfull-value-classes</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

</tab>
</tabs>

#### 인라인 값 클래스 선언의 변경 사항 {id="changes-to-inline-value-class-declarations"}

새로운 값 클래스가 도입됨에 따라, `value class`가 더 이상 반드시 '인라인'을 의미하지는 않습니다. 인라인 값 클래스는 외부에서 관찰 가능한 인라인 표현을 가지는 반면, 다른 값 클래스는 동일한 방식으로 런타임 표현을 노출하지 않습니다. 이러한 차이는 인라인 값 클래스를 다르게 처리하는 Spring 및 직렬화 라이브러리에서 중요합니다.

이 구분을 명확히 하기 위해, 향후 컴파일러는 인라인 값 클래스를 `inline` 제어자 및 `@JvmInline value class` 선언을 통해 명시적으로 선언하도록 요구할 예정입니다. 순수한 `value class` 선언은 더 이상 인라인으로 취급되지 않습니다.

이 동작을 변경하기 위한 단계적 마이그레이션이 계획되어 있습니다.

* Kotlin 2.5.20에서는 표시되지 않은 단일 필드 값 클래스에 대해 경고를 보고합니다.
* Kotlin 2.6.0 또는 2.7.0에서는 이 경고가 에러로 격상됩니다.

`-Xinline-value-class-migration=warning` 및 `-Xinline-value-class-migration=strict` 컴파일러 옵션을 사용하여 이러한 변경에 미리 대비할 수 있습니다.

자세한 내용은 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0468-inline-value-classes.md#migration)을 참고하세요.

##### 라이브러리 클래스의 값 클래스 마이그레이션 준비 {id="prepare-your-library-s-classes-for-migration-to-value-classes"}

라이브러리 작성자는 `@WillBecomeValue` 어노테이션을 사용하여 라이브러리의 일반 클래스가 향후 완전한 값 클래스로 마이그레이션될 수 있도록 준비할 수 있습니다. 참조 동등성(`===`), 동기화(synchronization) 또는 식별자 해시 코드 등을 통해 사용자의 코드가 객체 식별성에 의존하는 경우 컴파일러가 사용자에게 경고를 표시합니다. 이 경고를 통해 사용자는 클래스가 마이그레이션되기 전에 코드를 업데이트할 시간을 확보할 수 있습니다.

이 어노테이션은 [실험적(Experimental)](components-stability.md#stability-levels-explained)이며, `@OptIn(ExperimentalValueClassApi::class)`를 통한 opt-in이 필요합니다. 라이브러리 사용자는 어노테이션이 달린 클래스를 사용하기 위해 이 opt-in을 할 필요가 없습니다.

자세한 내용은 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0470-will-become-value.md)을 참고하세요.

### 구조적 클래스의 동등성 비교 검사 개선 {id="improved-checks-for-equality-comparisons-on-structural-classes"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="language"/>

Kotlin %kotlinEapVersion%에서는 통칭하여 _구조적 클래스(structural classes)_라고 하는 데이터 클래스, 데이터 객체, final 값 클래스 및 enum 클래스와 관련된 동등성 비교에 대한 추가 분석이 도입되었습니다.

컴파일러는 이러한 클래스에 엄격한 동등성 검사를 적용하여, 피연산자의 알려진 타입을 기반으로 `==` 사용 시 항상 `false`를 반환하거나 `!=` 사용 시 항상 `true`를 반환하는 비교를 보고합니다. 이러한 검사는 두 클래스가 동일한 프로퍼티를 가지고 있더라도 벡터와 포인트를 비교하는 것과 같은 실수를 방지하는 데 도움이 됩니다.

```kotlin
data class Point(val x: Double, val y: Double) {
    companion object {
        val ZERO: Point = Point(0.0, 0.0)
    }
}

data class Vector(val x: Double, val y: Double)

fun normalize(v: Vector) {
    if (v == Point.ZERO) {
        // 진단: 이 비교는 항상 false입니다.
        // Vector와 Point가 비교되고 있습니다.
    }
    // ...
}
```

또한 컴파일러는 동등성 검사를 사용하여 우측 피연산자를 스마트 캐스트할 수 있습니다.

이 기능을 활성화하려면 빌드 파일에 다음 컴파일러 옵션을 추가하세요.

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xstrict-equality-for-structural-classes")
    }
}
```

</tab>
<tab title="Maven" group-key="maven">

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <configuration>
                <args>
                    <arg>-Xstrict-equality-for-structural-classes</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

</tab>
</tabs>

자세한 내용은 해당 기능의 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0456-equals.md)을 참고하세요.

## 표준 라이브러리 {id="standard-library"}

이번 릴리스의 Kotlin 표준 라이브러리에는 `if` 표현식을 단순화하는 새로운 실험적 함수와 유니코드 코드 포인트에 대한 실험적 지원이 포함되어 있습니다.

### `if` 표현식의 일반적인 패턴을 단순화하는 새로운 함수 {id="new-functions-for-simplifying-common-patterns-with-if-expressions"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="standard-library"/>

Kotlin %kotlinEapVersion%에서는 `Boolean` 값을 반환하기 전에 검사하거나, 해당 값에 따라 nullable 결과를 반환할 수 있는 새로운 표준 라이브러리 함수가 도입되었습니다.

이전에는 이러한 패턴을 사용하려면 `else` 분기가 포함된 명시적인 `if` 표현식이 필요했습니다. 이제 다음 함수들을 사용하여 단순화할 수 있습니다.

* `onTrue()`: `Boolean` 값이 `true`일 때 지정된 코드 블록을 실행하고 원래의 Boolean 값을 반환합니다.
* `onFalse()`: `Boolean` 값이 `false`일 때 지정된 코드 블록을 실행하고 원래의 Boolean 값을 반환합니다.
* `ifOrNull()`: `Boolean` 값이 `true`인 경우 지정된 코드 블록을 실행하고 그 결과를 반환합니다. 값이 `false`이면 블록을 실행하지 않고 `null`을 반환합니다.

이 함수들은 [실험적(Experimental)](components-stability.md#stability-levels-explained)이며, `@OptIn(ExperimentalStdlibApi::class)` 어노테이션이나 `-opt-in=kotlin.ExperimentalStdlibApi` 컴파일러 옵션을 통한 opt-in이 필요합니다.

예제:

```kotlin
@OptIn(ExperimentalStdlibApi::class)
fun main() {
    val tags = mutableSetOf("kotlin", "jvm")

    // onTrue() 함수를 사용하여 add()가 true를 반환할 때 메시지를 출력합니다.
    val added = tags.add("wasm").onTrue {
        println("태그 추가됨")
    }
    println(added)
    // 태그 추가됨
    // true

    // onFalse() 함수를 사용하여 remove()가 false를 반환할 때 메시지를 출력합니다.
    val removed = tags.remove("native").onFalse {
        println("태그를 찾을 수 없음")
    }
    println(removed)
    // 태그를 찾을 수 없음
    // false

    // ifOrNull() 함수를 사용하여 "wasm"이 tags에 포함되어 있을 때 메시지를 반환합니다.
    val message = ifOrNull("wasm" in tags) {
        "Wasm 태그를 사용할 수 있습니다"
    }
    println(message)
    // Wasm 태그를 사용할 수 있습니다
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.5.0-Beta1" validate="false"}

[YouTrack](https://youtrack.jetbrains.com/issue/KT-6938)을 통해 의견을 남겨주시면 감사하겠습니다.

### 유니코드 코드 포인트 지원 {id="support-for-unicode-code-points"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="standard-library"/>

Kotlin %kotlinEapVersion%에서는 `CodePoint` 인라인 값 클래스와 `kotlin.text.unicode` 패키지의 관련 API를 도입했습니다. 이를 통해 여러 플랫폼에서 유니코드 코드 포인트를 다룰 수 있습니다.

`Char`는 하나의 UTF-16 코드 단위를 나타냅니다. 그러나 일부 유니코드 코드 포인트는 서로게이트 페어(서로게이트 쌍, surrogate pair)로 알려진 두 개의 `Char` 값이 필요합니다. 프로그램이 문자열을 `Char` 값으로 순회할 때, 서로게이트 페어의 각 절반을 별개의 요소로 처리합니다.

`CodePoint` 값 클래스는 유니코드 코드 포인트를 나타내며, 정수 값을 저장하기 위한 기본 타입으로 `Int`를 사용합니다. 이 클래스는 이를 표현하는 데 필요한 UTF-16 코드 단위 수, 유니코드 카테고리, 그리고 문자인지, 숫자인지, 공백인지 여부와 같은 프로퍼티에 대한 접근을 제공합니다.

새로운 API를 통해 코드 포인트의 개수를 세고 순회하며, 대소문자를 변환하고, 텍스트 내에서 추가, 삽입, 대체 또는 삭제할 수 있습니다. 또한 코드 포인트를 비교하고, 산술 연산을 수행하고, 범위를 생성하고, 텍스트를 양방향으로 탐색할 수 있습니다. 텍스트 API는 위치 표시에 계속해서 UTF-16 코드 단위 오프셋을 사용합니다.

이러한 API는 [실험적(Experimental)](components-stability.md#stability-levels-explained)이며, `@OptIn(ExperimentalUnicodeApi::class)` 어노테이션이나 `-opt-in=kotlin.text.unicode.ExperimentalUnicodeApi` 컴파일러 옵션을 통한 opt-in이 필요합니다.

자세한 내용은 해당 기능의 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/stdlib/KEEP-0400-unicode-codepoints.md)을 참고하세요.

## Kotlin/JVM {id="kotlin-jvm"}
<secondary-label ref="jvm"/>

Kotlin %kotlinEapVersion%부터 컴파일러가 Java 28 바이트코드를 포함하는 클래스를 생성할 수 있습니다.

## Kotlin/Native {id="kotlin-native"}

Kotlin %kotlinEapVersion%에서는 Apple 타깃에서 증분 컴파일이 기본으로 활성화되고, Swift export가 새로운 Gradle DSL과 함께 베타로 승격되었습니다.

### Apple 타깃에서 증분 컴파일 기본 활성화 {id="incremental-compilation-enabled-by-default-on-apple-targets"}

<secondary-label ref="native"/>

Kotlin %kotlinEapVersion%부터 Apple 타깃에서 `klib` 아티팩트의 증분 컴파일이 기본적으로 활성화됩니다.

증분 컴파일을 사용하면 프로젝트 모듈에서 생성된 `klib` 아티팩트의 일부만 변경된 경우, `klib`의 영향을 받는 부분만 바이너리로 재컴파일됩니다.

이 최적화는 [Kotlin 1.9.20](whatsnew1920.md#incremental-compilation-of-klib-artifacts)에서 처음 도입되었으며, 특정 상황에서 디버그 빌드의 컴파일 시간을 대폭 단축하는 것으로 입증되었습니다.

새로운 기본 설정은 Apple 타깃에만 적용됩니다. 증분 컴파일은 Windows([MinGW 도구 모음](https://www.mingw-w64.org/))에서는 지원되지 않습니다. Linux의 경우 여전히 다음 옵션을 통해 opt-in해야 합니다.

```properties
kotlin.incremental.native=true
```

경우에 따라 이 최적화로 인해 클린 빌드 시 성능 저하가 발생할 수 있습니다. 이를 해결하기 위해 클린 빌드에서 특수 컴파일 모드를 실행하도록 설계된 새로운 [바이너리 옵션](native-binary-options.md#how-to-enable)을 시도해 볼 수 있습니다. 이 옵션은 [실험적(Experimental)](components-stability.md#stability-levels-explained)이며, 다음과 같이 opt-in할 수 있습니다.

```properties
kotlin.native.binary.batchedCacheBuild=true
```

증분 컴파일과 관련하여 예기치 않은 문제가 발생하는 경우, `gradle.properties` 파일에 다음 옵션을 설정하여 수동으로 비활성화할 수 있습니다.

```properties
kotlin.incremental.native=false
```

문제가 발생하면 [YouTrack](https://kotl.in/issue)에 제보해 주세요.

컴파일 시간을 개선하는 방법에 대한 추가 팁은 [공식 문서](native-improving-compilation-time.md)를 참고하세요.

### Swift export, 새로운 Gradle DSL과 함께 베타 진입 {id="swift-export-goes-beta-with-a-new-gradle-dsl"}

<primary-label ref="beta"/>
<secondary-label ref="native"/>

Kotlin %kotlinEapVersion%에서 Swift export가 [베타(Beta)](components-stability.md#stability-levels-explained)로 승격되었으며, 더욱 사용하기 편리한 Gradle DSL을 제공합니다. 새로운 DSL은 중복을 줄이고 구성 재사용성을 높여 Kotlin 코드를 Swift에 더 쉽게 노출할 수 있도록 해줍니다.

주요 변경 사항은 다음과 같습니다.

| 기능 | 이전 | 이후 |
|---------------------------------|-----------------------------------------------------------------|-------------------------------------------------------|
| 진입점 | `swiftExport {}` | `export { swift {} }` |
| 축소 규칙(Collapse rule) 프로퍼티 | `flattenPackage = "com.example.sandbox"` | `rootPackage = "com.example.sandbox"` |
| 선언된 의존성 내보내기 | `export(project(":subproject")) {}` | 자동으로 내보내짐, 명시적인 `export()` 불필요 |
| 의존성 구성 재정의 | `export(libs.utils) {}` | `xcodeIntegration { configure(libs.utils) {} }` |
| 컴파일러 인수 | `configure { freeCompilerArgs.add("-Xexpect-actual-classes") }` | 제거됨 |

다음은 새로운 Swift export DSL을 사용하는 전체 빌드 구성 예제입니다.

```kotlin
// subproject/build.gradle.kts
kotlin {

    iosArm64()
    iosSimulatorArm64()

    // 이 구성은 ":subproject"가
    // ":shared"의 의존성으로 내보내질 때 사용됩니다.
    export {
        swift {
            // 루트 모듈 이름 설정
            moduleName = "Subproject"

            // 축소 규칙(collapse rule) 설정
            // 생성된 Swift 코드에서 패키지 접두사 제거
            rootPackage = "com.subproject.library"
        }
    }
}

// shared/build.gradle.kts
kotlin {

    iosArm64()
    iosSimulatorArm64()

    export {
        swift {
            // 루트 모듈 이름 설정
            moduleName = "Shared"

            // 축소 규칙(collapse rule) 설정
            // 생성된 Swift 코드에서 패키지 접두사 제거
            rootPackage = "com.example.sandbox"

            // 이 모듈에 대해 Xcode 연동 활성화
            xcodeIntegration {
                // 외부 모듈 export 구성
                configure(libs.utils) {
                    // 선택 사항: 내보낸 모듈 이름 재정의
                    moduleName = "Utils"
                    // 선택 사항: 내보낸 의존성의 축소 규칙 재정의
                    rootPackage = "com.example.utils"
                }
            }
        }
    }

    sourceSets {
        commonMain {
            dependencies {
                // 이 의존성들은 Swift export에
                // 자동으로 포함됩니다.
                api(project(":subproject"))
                api(libs.utils)
            }
        }
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="전체 DSL 예제"}

또한 이제 Swift export 구성을 배포(publish)할 수 있습니다. 라이브러리 작성자가 옵션 재정의를 제공하면, Gradle은 Swift export 중에 이를 자동으로 소비하고 적용합니다.

문제가 발생하면 [YouTrack](https://kotl.in/issue)에 제보하거나 [초대를 받아](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up?_gl=1*ju6cbn*_ga*MTA3MTk5NDkzMC4xNjQ2MDY3MDU4*_ga_9J976DJZ68*MTY1ODMzNzA3OS4xMDAuMS4xNjU4MzQwODEwLjYw) [#swift-export](https://kotlinlang.slack.com/archives/C073GUW6WN9) Slack 채널에 참여하세요.

## Kotlin Multiplatform {id="kotlin-multiplatform"}

Kotlin %kotlinEapVersion%에서는 Kotlin Multiplatform을 위한 새로운 실험적 컴파일 체계와 배포되는 멀티플랫폼 라이브러리의 크기를 대폭 줄이는 새로운 배포 형식을 도입합니다.

### Kotlin Multiplatform을 위한 새로운 실험적 컴파일 체계 {id="new-experimental-compilation-scheme-for-kotlin-multiplatform"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="multiplatform"/>

Kotlin %kotlinEapVersion%에서는 컴파일러가 공통 소스 세트(common source sets)를 IDE와 더 일관되게 처리하도록 하는 Kotlin Multiplatform(KMP)용 새로운 실험적 컴파일 체계를 도입합니다. 이 변경을 통해 공통 코드가 실수로 플랫폼 전용 선언으로 확인(resolve)되는 것을 방지하고, 오버로드 확인 및 타입 추론의 일관성을 개선하며, 공통 소스 세트에 대한 증분 컴파일을 구현할 수 있게 됩니다. KMP 분리 컴파일에 대해 자세히 알아보고 이를 시도해보는 방법은 [블로그 게시물](https://blog.jetbrains.com/kotlin/2026/09/a-more-reliable-compilation-scheme-for-kotlin-multiplatform-modules/)을 참고하세요.

### Kotlin Multiplatform 라이브러리를 위한 새로운 배포 형식 {id="new-publication-format-for-kotlin-multiplatform-libraries"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="multiplatform"/>

Kotlin %kotlinEapVersion%에서는 배포된 라이브러리의 크기를 대폭 줄여주는 Kotlin Multiplatform 라이브러리용 새 배포 형식을 도입합니다. 새 형식은 플랫폼 아티팩트(JVM 및 Android 제외)를 XZ로 추가 압축된 단일 ZIP 아카이브인 `.kar` 아카이브로 배포합니다.

이 변경 사항은 최근 Maven Central에 도입된 [배포 크기 제한](https://central.sonatype.org/publish/maven-central-publishing-limits/)을 해결합니다. 새 형식을 사용하면 새 타깃을 추가해도 새 파일이 생성되지 않으므로 배포 크기가 크게 증가하지 않습니다. 어떤 경우에는 전체 배포 크기가 이전의 단일 타깃 배포보다 작아지기도 합니다. 예를 들어 [cryptography-kotlin](https://github.com/whyoleg/cryptography-kotlin) 라이브러리의 경우, 전체 멀티 모듈 프로젝트에 대해 배포된 아티팩트 세트가 7539개 파일 91MB에서 1036개 파일 23MB로 줄어들었습니다.

특정 모듈에 새 형식을 활성화하려면 해당 모듈의 빌드 스크립트에서 다음과 같이 구성하세요.

```kotlin
kotlin {
    publishing {
        publicationFormat.set(KotlinPublicationFormat.KOTLIN_ARCHIVE)
    }
}
```

또는 프로젝트의 모든 모듈에 대해 활성화하려면 `gradle.properties` 파일에 다음 프로퍼티를 추가하세요.

```properties
kotlin.publicationFormat=KOTLIN_ARCHIVE
```

새 형식으로 배포하는 기능은 아직 [실험적(Experimental)](components-stability.md#stability-levels-explained)이지만, 이러한 아티팩트를 소비(사용)하는 것은 이미 모든 프로젝트에서 가능합니다. 이 변경 사항은 라이브러리 작성자에게만 해당되며, 최종 애플리케이션 개발자에게는 영향을 미치지 않습니다.

의견을 공유하고 문제가 발생하면 [YouTrack](https://kotl.in/issue)에 제보해 주세요.

## Kotlin/JS {id="kotlin-js"}
<secondary-label ref="js"/>

Kotlin %kotlinEapVersion%에서는 Kotlin/JS 컴파일러 및 Gradle 플러그인에 `es2020` 타깃이 추가되었습니다. 이전에는 `es5` 및 `es2015` 타깃만 사용할 수 있었으며, `BigInt`와 같은 최신 JavaScript 기능에 대한 지원은 ES2015를 타깃으로 할 때 별도로 활성화해야 했습니다. 이제 ES2020을 타깃으로 지정하면 추가 구성 없이 `BigInt`를 포함하여 ECMAScript 2020까지 지원되는 모든 JavaScript 기능을 사용할 수 있습니다.

새 타깃을 활성화하려면 `compilerOptions {}` 블록에서 `target`을 `es2020`으로 설정하세요.

```kotlin
kotlin {
    js {
        compilerOptions {
            target.set("es2020")
        }
    }
}
```

## Kotlin 컴파일러 {id="kotlin-compiler"}

Kotlin %kotlinEapVersion%에서는 `klib` 컴파일 중 함수 인라이닝 기능이 더욱 개선되었으며, 타입 추론 성능이 향상되었습니다.

### klib 컴파일 중 일관된 모듈 간 함수 인라이닝 {id="consistent-cross-module-function-inlining-during-klib-compilation"}

<secondary-label ref="compiler"/>

Kotlin 2.4.0에서는 `klib` 컴파일 중 [Kotlin/Native, Kotlin/JS 및 Kotlin/Wasm에서 일관된 모듈 내 함수 인라이닝](whatsnew24.md#consistent-intra-module-function-inlining-during-klib-compilation)이 활성화되었습니다. 서로 다른 Kotlin 플랫폼 전반에 걸친 함수 인라이닝의 일관성은 호환성 보장을 제공하는 데 도움이 됩니다.

Kotlin 2.4.0은 또한 `klib` 컴파일 중 **모듈 간(cross-module)** 인라이닝을 활성화하여 프로젝트의 모든 인라인 함수가 일관되게 인라이닝되도록 하는 기능을 도입했습니다. Kotlin %kotlinEapVersion%에서는 모듈 간 인라이닝이 기본적으로 활성화됩니다.

이 기능과 관련하여 예기치 않은 문제가 발생하는 경우, 다음 명령줄 컴파일러 옵션을 사용하여 비활성화할 수 있습니다.

```bash
-Xklib-ir-inliner=disabled
```

의견을 공유하고 문제가 발생하면 [YouTrack](https://kotl.in/issue)에 제보해 주세요.

### 타입 추론 성능 향상 {id="improved-type-inference-performance"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="compiler"/>

Kotlin %kotlinEapVersion%에서는 타입 추론 중 생성되는 제약 조건의 수를 줄여 컴파일러 성능을 향상시켰습니다. 이전에는 복잡한 제네릭 코드가 과도한 제약 조건을 생성하여 컴파일이나 IDE 분석이 멈추는 현상이 발생할 수 있었습니다. 이 변경 사항은 특정 엣지 케이스, 특히 빌더 추론이나 특이한 바운드를 가진 복잡한 플랫폼 타입과 관련된 경우의 타입 추론에 영향을 줄 수 있습니다. 결과적으로 컴파일러가 다른 타입을 추론하거나, 다른 오버로드를 선택하거나, 다른 진단 결과를 보고할 수 있습니다. 이러한 차이는 개선에 따른 예상된 결과일 수 있습니다.

이 기능은 기본적으로 활성화되어 있습니다. 이전 타입 추론 동작으로 되돌리려면 `-XXLanguage:-EliminateSecondKindIncorporation` 옵션을 사용하세요.

[YouTrack](https://youtrack.jetbrains.com/issue/KT-85879)을 통해 의견을 남겨주시면 감사하겠습니다.

## 호환성을 깨뜨리는 변경 사항(Breaking changes) 및 지원 중단 {id="breaking-changes-and-deprecations"}

Kotlin %kotlinEapVersion%에서는 Kotlin 컴파일러를 실행하는 데 필요한 최소 JDK 버전을 JDK 8에서 JDK 17로 상향 조정하기 위한 다음 단계로 오류(error)를 도입합니다. 개발 속도를 높이고 컴파일러가 최신 Java 버전을 필요로 하는 새 라이브러리에 접근할 수 있도록 하기 위해 최소 요구 JDK를 높이고 있습니다. JDK 17은 장기 지원(LTS)을 제공하며, 최신 버전의 Gradle 및 Maven과의 호환성을 유지하는 데 도움이 됩니다. `-Xallow-pre-17-runtime-jdk` 컴파일러 옵션을 사용하여 오류를 건너뛸 수 있습니다. 이 옵션은 JDK 17이 필수가 되는 Kotlin 2.5.20 또는 2.6.0에서 제거될 예정입니다.

프로젝트 업그레이드에 어려움이 있는 경우, [YouTrack](https://kotl.in/issue)에서 경험을 공유하거나 Kotlin Slack에서 개발자에게 직접 문의하세요. [초대를 받아](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up?_gl=1*ju6cbn*_ga*MTA3MTk5NDkzMC4xNjQ2MDY3MDU4*_ga_9J976DJZ68*MTY1ODMzNzA3OS4xMDAuMS4xNjU4MzQwODEwLjYw) [#compiler](https://kotlinlang.slack.com/archives/C7L3JB43G) 채널에 참여하실 수 있습니다.