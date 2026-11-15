[//]: # (title: Kotlin %kotlinEapVersion%의 새로운 기능)

<primary-label ref="eap"/>

<show-structure depth="1"/>

<web-summary>Kotlin Early Access Preview 릴리스 노트를 읽고, 공식 릴리스 전에 최신 실험적 Kotlin 기능을 사용해 보세요.</web-summary>

_[출시일: %kotlinEapReleaseDate%](eap.md#build-details)_

> 이 문서는 Early Access Preview(EAP) 릴리스의 모든 기능을 다루지는 않으며,
> 주요 개선 사항을 중심으로 소개합니다.
>
> 전체 변경 사항 목록은 [GitHub 변경 로그](https://github.com/JetBrains/kotlin/releases/tag/v%kotlinEapVersion%)에서 확인하세요.
>
{style="note"}

Kotlin %kotlinEapVersion% 버전이 출시되었습니다! 이번 EAP 릴리스의 주요 내용은 다음과 같습니다.

* **언어**: [`only-syntax` 모드의 안정적인 이름 기반 구조 분해, 미사용 반환값 검사기, 개선된 컴파일 타임 상수](#stable-language-features).
* **표준 라이브러리**: [`if` 표현식을 사용하는 일반적인 패턴을 단순화하는 새로운 실험적 함수](#new-functions-for-simplifying-common-patterns-with-if-expressions) 및 [Unicode 코드 포인트에 대한 실험적 지원](#support-for-unicode-code-points).
* **Kotlin/JVM**: [Java 28 지원](#kotlin-jvm).
* **Kotlin/Native**: [새로운 DSL이 적용된 Swift export 베타 버전](#swift-export-goes-beta-with-a-new-gradle-dsl).
* **Kotlin Multiplatform**: [Kotlin Multiplatform을 위한 새로운 실험적 컴파일 스킴](#new-experimental-compilation-scheme-for-kotlin-multiplatform) 및 [멀티플랫폼 라이브러리를 위한 새로운 배포 형식](#new-publication-format-for-kotlin-multiplatform-libraries).
* **Kotlin/JS**: [`es2020` 타깃 지원](#kotlin-js).
* **Kotlin 컴파일러**: [`klib` 컴파일 중 더욱 일관된 인라인 함수 동작](#consistent-cross-module-function-inlining-during-klib-compilation).

> Kotlin 릴리스 주기에 대한 자세한 내용은 [Kotlin 릴리스 프로세스](releases.md)를 참조하세요.
>
{style="tip"}

## Kotlin %kotlinEapVersion%으로 업데이트 {id="update-to-kotlin-kotlineapversion"}

최신 버전의 Kotlin은 최신 버전의 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/)
및 [Android Studio](https://developer.android.com/studio)에 포함되어 있습니다.

새 Kotlin 버전으로 업데이트하려면 IDE가 최신 버전으로 업데이트되었는지 확인하고, 빌드 스크립트에서 [Kotlin 버전을 %kotlinEapVersion%으로 변경](releases.md#update-to-a-new-kotlin-version)하세요.

## 언어 {id="language"}

Kotlin %kotlinEapVersion%은 이전 릴리스에서 도입된 여러 언어 기능을 안정화했습니다. 또한 실험적 기능인 컴패니언 확장(companion extensions) 및 블록, 풀 밸류 클래스(full value classes)를 도입합니다.

### 안정화된 언어 기능 {id="stable-language-features"}

<secondary-label ref="language"/>

Kotlin 2.3.0−2.4.0에서는 몇 가지 언어 기능이 [실험적(Experimental)](components-stability.md#stability-levels-explained) 기능으로 도입되었습니다.
이번 릴리스에서 다음 언어 기능들이 [안정화(Stable)](components-stability.md#stability-levels-explained)되었음을 알려드립니다.

* [개선된 컴파일 타임 상수](whatsnew24.md#improved-compile-time-constants).

* 선택적 매개변수에 대해 버전 기반 오버로드를 생성하는 [`@IntroducedAt` 어노테이션](whatsnew24.md#new-introducedat-annotation-to-generate-version-based-overloads-for-optional-parameters).

* 기본적으로 활성화되는 [미사용 반환값 검사기(unused return value checker)](whatsnew23.md#unused-return-value-checker).

* 이제 기본값이 된 `only-syntax` 모드의 [이름 기반 구조 분해(Name-based destructuring)](destructuring-declarations.md#name-based-destructuring).

  이 모드에서는 "기존" 구조 분해 구문인 `val (x, y)`는 위치 기반 동작을 유지하고, "새로운" 구문인 `(val x, val y)`는 이름 기반 구조 분해를 수행합니다. 이 기능에 대한 개요는 다음 비디오에서 확인할 수 있습니다.

  <video src="https://www.youtube.com/v/He8J34KHEY4" title="Kotlin's Name-Based Destructuring"/>

### 컴패니언 확장 및 블록 {id="companion-extensions-and-blocks"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="language"/>

Kotlin %kotlinEapVersion%에는 컴패니언 확장(companion extensions)과 컴패니언 블록(companion blocks)이 도입되었습니다.

이전에는 타입의 이름을 통해 접근할 수 있는 확장, 함수 및 프로퍼티를 선언하려면 해당 타입에 컴패니언 객체(companion object)가 있어야 했습니다. 컴패니언 확장과 블록은 이러한 요구 사항을 제거하여 다음과 같은 작업을 가능하게 합니다.

* 확장 대상 타입에 컴패니언 객체가 없더라도, 최상위 확장에 `companion` 수정자를 추가하여 컴패니언 확장을 선언할 수 있습니다.
* 객체 인스턴스를 생성하지 않고도 클래스나 인터페이스 내부의 `companion {}` 블록에 함수와 프로퍼티를 선언할 수 있습니다. 정적 멤버를 지원하는 플랫폼에서 컴파일러는 이러한 선언을 정적 멤버로 생성합니다. 따라서 JVM에서 `@JvmStatic`을 주석으로 달 필요가 없습니다.

다음은 `UnitX`를 컴패니언 확장으로 선언하고 `Zero`를 컴패니언 블록에 선언하는 예제입니다.

```kotlin
// UnitX를 컴패니언 확장으로 선언
companion val Vector.UnitX get() = Vector(1.0, 0.0)

data class Vector(val x: Double, val y: Double) {
    companion {
        // Zero를 컴패니언 블록에 선언
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

디자인에 대한 자세한 내용은 해당 기능의 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0449-companions-block-extension.md)을 참조하세요. [블로그 게시물](https://blog.jetbrains.com/kotlin/2026/09/the-companions-to-come/)에서도 이 기능에 대해 읽어보실 수 있습니다.

컴패니언 확장과 블록은 [실험적(Experimental)](components-stability.md#stability-levels-explained) 기능입니다. 사용을 설정하려면 빌드 파일에 다음 컴파일러 옵션을 추가하세요.

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

피드백은 [YouTrack](https://youtrack.jetbrains.com/issue/KT-11968)을 통해 전달해 주시기 바랍니다.

### 풀 밸류 클래스 (Full value classes) {id="full-value-classes"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="language"/>

Kotlin %kotlinEapVersion% 이전에는 [인라인 값 클래스(inline value classes)](inline-classes.md)를 사용하여 단일 값을 감싸는 커스텀 래퍼 타입을 만들 수 있었습니다. 타입에 여러 프로퍼티가 필요한 경우에는 일반 클래스나 데이터 클래스를 사용해야 했습니다. 그러나 이러한 클래스에서는 동일한 데이터를 포함하는 두 인스턴스가 참조에 의해 여전히 구분될 수 있으며, 이러한 구분이 타입에 아무런 의미가 없는 경우에도 마찬가지입니다. 이는 런타임 최적화를 제한하고, 코드가 불필요하게 동일한 객체 참조가 유지되는지 여부에 의존하게 만들 수 있습니다.

Kotlin %kotlinEapVersion%은 프로퍼티들이 함께 모여 값을 구성하고 개별 인스턴스의 식별성(identity)이 중요하지 않은 타입을 정의할 수 있는 실험적 풀 밸류 클래스(full value classes)를 도입합니다. 예를 들어 실수와 허수 프로퍼티를 가진 복소수를 나타내기 위해 풀 밸류 클래스 `Complex`를 선언할 수 있습니다.

```kotlin
value class Complex(val real: Double, val imaginary: Double)
```

컴파일러는 데이터 클래스와 유사하게 풀 밸류 클래스에 대해 `equals()`, `hashCode()`, `toString()` 함수를 자동으로 생성합니다. 그러나 다음과 같은 차이점이 있습니다.

* `componentN()` 함수가 없습니다. 대신 [이름 기반 구조 분해](destructuring-declarations.md#name-based-destructuring)를 사용할 수 있습니다. 별도의 opt-in은 필요하지 않습니다.
* `copy()` 함수가 없습니다. 향후에는 `copy vars`를 대신 사용할 수 있습니다. 자세한 내용은 [KT-44653](https://youtrack.jetbrains.com/issue/KT-44653)을 참조하세요.

데이터 클래스와의 차이점에 대한 자세한 내용은 KEEP의 [상속(inheritance)](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0454-better-immutability-value-classes-MFVC.md#mfvc-and-inheritance) 섹션을 참조하세요.

#### 추상 값 클래스 (Abstract value classes) {id="abstract-value-classes"}

풀 밸류 클래스는 추상(abstract) 클래스일 수 있습니다. [인터페이스](interfaces.md)와 달리, 모든 서브클래스가 생성 중에 실행하는 초기화 로직을 정의할 수 있습니다.

예를 들어 `OrderedInterval` 값 클래스는 `start`와 `end`를 생성자 매개변수로 받습니다. `IntInterval` 값 클래스는 해당 값들을 `start` 및 `end` 프로퍼티에 저장합니다.

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

자세한 내용은 KEEP의 [상속(inheritance)](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0454-better-immutability-value-classes-MFVC.md#mfvc-and-inheritance) 섹션을 참조하세요.

#### 값 객체 (Value objects) {id="value-objects"}

풀 밸류 클래스는 프로퍼티를 갖지 않을 수도 있습니다. 이를 _값 객체(value objects)_라고 부르며, 상태(state)나 토큰(token)처럼 식별성 없이 가능한 값이 하나뿐인 타입을 나타낼 때 유용합니다. 예:

```kotlin
sealed interface UserResponse

value class UserFound(val user: User) : UserResponse
value object UserUnknown : UserResponse
```

자세한 내용은 KEEP의 [값 객체(value objects)](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0454-better-immutability-value-classes-MFVC.md#value-objects) 섹션을 참조하세요.

#### 활성화 방법 {id="how-to-enable"}

이 기능은 [실험적(Experimental)](components-stability.md#stability-levels-explained) 기능입니다. 사용을 설정하려면 빌드 파일에 다음 컴파일러 옵션을 추가하세요.

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

### 구조적 클래스에 대한 동등성 비교 검사 개선 {id="improved-checks-for-equality-comparisons-on-structural-classes"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="language"/>

Kotlin %kotlinEapVersion%은 데이터 클래스, 데이터 객체, final 값 클래스, enum 클래스(통칭 _구조적 클래스(structural classes)_)와 관련된 동등성 비교에 대한 추가 분석을 도입합니다.

컴파일러는 피연산자의 알려진 타입을 기반으로 `==` 사용 시 항상 `false`를 반환하거나 `!=` 사용 시 항상 `true`를 반환하는 비교를 보고하기 위해 이러한 클래스에 엄격한 동등성 검사를 적용합니다. 이러한 검사는 두 클래스가 동일한 프로퍼티를 가지고 있더라도 벡터와 점(point)을 비교하는 것과 같은 실수를 잡는 데 도움이 됩니다.

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
        // Vector가 Point와 비교되고 있습니다.
    }
    // ...
}
```

컴파일러는 동등성 검사를 사용하여 우항 피연산자를 스마트 캐스트할 수도 있습니다.

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

자세한 내용은 해당 기능의 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0456-equals.md)을 참조하세요.

## 표준 라이브러리 {id="standard-library"}

이번 릴리스에서 Kotlin 표준 라이브러리에는 `if` 표현식을 단순화하는 새로운 실험적 함수와 Unicode 코드 포인트에 대한 실험적 지원이 추가되었습니다.

### `if` 표현식을 사용하는 일반적인 패턴을 단순화하는 새로운 함수 {id="new-functions-for-simplifying-common-patterns-with-if-expressions"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="standard-library"/>

Kotlin %kotlinEapVersion%은 `Boolean` 값을 반환하기 전에 검사하거나, 해당 값에 따라 널 허용(nullable) 결과를 반환할 수 있는 새로운 표준 라이브러리 함수를 도입합니다.

이전에는 이러한 패턴에 `else` 분기가 포함된 명시적인 `if` 표현식이 필요했습니다. 이제 다음 함수들을 사용하여 단순화할 수 있습니다.

* `onTrue()`: `Boolean` 값이 `true`일 때 지정된 코드 블록을 실행하고 원래의 Boolean 값을 반환합니다.
* `onFalse()`: `Boolean` 값이 `false`일 때 지정된 코드 블록을 실행하고 원래의 Boolean 값을 반환합니다.
* `ifOrNull()`: `Boolean` 값이 `true`인 경우 지정된 코드 블록을 실행하고 그 결과를 반환합니다. 값이 `false`인 경우 블록을 실행하지 않고 `null`을 반환합니다.

이 함수들은 [실험적(Experimental)](components-stability.md#stability-levels-explained)이며, `@OptIn(ExperimentalStdlibApi::class)` 어노테이션이나 `-opt-in=kotlin.ExperimentalStdlibApi` 컴파일러 옵션을 통한 opt-in이 필요합니다.

다음은 예제입니다.

```kotlin
@OptIn(ExperimentalStdlibApi::class)
fun main() {
    val tags = mutableSetOf("kotlin", "jvm")

    // add()가 true를 반환할 때 메시지를 출력하기 위해 onTrue() 함수 사용
    val added = tags.add("wasm").onTrue {
        println("Tag added")
    }
    println(added)
    // Tag added
    // true

    // remove()가 false를 반환할 때 메시지를 출력하기 위해 onFalse() 함수 사용
    val removed = tags.remove("native").onFalse {
        println("Tag not found")
    }
    println(removed)
    // Tag not found
    // false

    // tags에 "wasm"이 있을 때 메시지를 반환하기 위해 ifOrNull() 함수 사용
    val message = ifOrNull("wasm" in tags) {
        "Wasm tag is available"
    }
    println(message)
    // Wasm tag is available
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.5.0-Beta1" validate="false"}

피드백은 [YouTrack](https://youtrack.jetbrains.com/issue/KT-6938)을 통해 전달해 주시기 바랍니다.

### Unicode 코드 포인트 지원 {id="support-for-unicode-code-points"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="standard-library"/>

Kotlin %kotlinEapVersion%은 `CodePoint` 인라인 값 클래스와 `kotlin.text.unicode` 패키지의 관련 API를 도입합니다. 이를 통해 여러 플랫폼 전반에서 Unicode 코드 포인트를 다룰 수 있습니다.

`Char`는 하나의 UTF-16 코드 단위를 나타냅니다. 그러나 일부 Unicode 코드 포인트는 서로게이트 쌍(surrogate pair)으로 알려진 두 개의 `Char` 값이 필요합니다. 프로그램이 문자열을 `Char` 값으로 순회할 때, 서로게이트 쌍의 각 절반을 별개의 요소로 처리하게 됩니다.

`CodePoint` 값 클래스는 Unicode 코드 포인트를 나타내며, 정수 값을 저장하기 위한 기본 타입으로 `Int`를 사용합니다. 이를 표현하는 데 필요한 UTF-16 코드 단위 수, Unicode 카테고리, 문자(letter)·숫자(digit)·공백(whitespace) 여부와 같은 프로퍼티에 접근할 수 있습니다.

새로운 API를 통해 코드 포인트를 세고 순회하며, 대소문자를 변환하고, 텍스트에 추가(append)·삽입(insert)·대체(replace)·삭제(delete)할 수 있습니다. 또한 코드 포인트를 비교하고, 산술 연산을 수행하고, 범위를 생성하며, 텍스트를 양방향으로 탐색할 수 있습니다. 텍스트 API는 위치 표시에 계속해서 UTF-16 코드 단위 오프셋을 사용합니다.

이러한 API는 [실험적(Experimental)](components-stability.md#stability-levels-explained)이며, `@OptIn(ExperimentalUnicodeApi::class)` 어노테이션이나 `-opt-in=kotlin.text.unicode.ExperimentalUnicodeApi` 컴파일러 옵션을 통한 opt-in이 필요합니다.

자세한 내용은 해당 기능의 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/stdlib/KEEP-0400-unicode-codepoints.md)을 참조하세요.

## Kotlin/JVM {id="kotlin-jvm"}
<secondary-label ref="jvm"/>

Kotlin %kotlinEapVersion%부터 컴파일러가 Java 28 바이트코드를 포함하는 클래스를 생성할 수 있습니다.

## Kotlin/Native {id="kotlin-native"}

Kotlin %kotlinEapVersion%에서는 새로운 Gradle DSL과 함께 Swift export가 베타 버전으로 격상되었습니다.

### 새로운 Gradle DSL과 함께 Swift export 베타 출시 {id="swift-export-goes-beta-with-a-new-gradle-dsl"}

<primary-label ref="beta"/>
<secondary-label ref="native"/>

Kotlin %kotlinEapVersion%에서 Swift export는 [베타(Beta)](components-stability.md#stability-levels-explained)로 전환되었으며 더욱 인체공학적인(ergonomic) Gradle DSL을 갖추게 되었습니다. 새로운 DSL은 중복을 줄이고 구성 재사용성을 높여 Kotlin 코드를 Swift에 더 쉽게 노출할 수 있도록 해줍니다.

주요 변경 사항은 다음과 같습니다.

| 기능 | 변경 전 | 변경 후 |
|---|---|---|
| 진입점 | `swiftExport {}` | `export { swift {} }` |
| 축약 규칙 프로퍼티 | `flattenPackage = "com.example.sandbox"` | `rootPackage = "com.example.sandbox"` |
| 선언된 의존성 내보내기 | `export(project(":subproject")) {}` | 자동으로 내보내짐; 명시적 `export()` 불필요 |
| 의존성 구성 오버라이드 | `export(libs.utils) {}` | `xcodeIntegration { configure(libs.utils) {} }` |
| 컴파일러 인수 | `configure { freeCompilerArgs.add("-Xexpect-actual-classes") }` | 제거됨 |

다음은 새로운 Swift export DSL을 사용하는 전체 빌드 구성 예시입니다.

```kotlin
// subproject/build.gradle.kts
kotlin {

    iosArm64()
    iosSimulatorArm64()

    // 이 구성은 ":subproject"를 ":shared"의 의존성으로
    // 내보낼 때 사용됩니다.
    export {
        swift {
            // 루트 모듈 이름 설정
            moduleName = "Subproject"

            // 축약 규칙 설정
            // 생성된 Swift 코드에서 패키지 접두사를 제거합니다.
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

            // 축약 규칙 설정
            // 생성된 Swift 코드에서 패키지 접두사를 제거합니다.
            rootPackage = "com.example.sandbox"

            // 이 모듈에 대해 Xcode 연동 활성화
            xcodeIntegration {
                // 외부 모듈 내보내기 구성
                configure(libs.utils) {
                    // 선택 사항: 내보낸 모듈 이름 오버라이드
                    moduleName = "Utils"
                    // 선택 사항: 내보낸 의존성의 축약 규칙 오버라이드
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

또한, Swift export 구성을 이제 배포할 수 있습니다. 라이브러리 작성자가 옵션 재정의를 제공하면, Gradle이 Swift export 중에 이를 자동으로 가져와 적용합니다.

문제가 발생하면 [YouTrack](https://kotl.in/issue)에 보고하거나, [초대를 받아](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up?_gl=1*ju6cbn*_ga*MTA3MTk5NDkzMC4xNjQ2MDY3MDU4*_ga_9J976DJZ68*MTY1ODMzNzA3OS4xMDAuMS4xNjU4MzQwODEwLjYw) [#swift-export](https://kotlinlang.slack.com/archives/C073GUW6WN9) Slack 채널에 참여하세요.

## Kotlin Multiplatform {id="kotlin-multiplatform"}

Kotlin %kotlinEapVersion%은 Kotlin Multiplatform을 위한 새로운 실험적 컴파일 스킴과 배포되는 멀티플랫폼 라이브러리의 크기를 대폭 줄여주는 새로운 배포 형식을 도입합니다.

### Kotlin Multiplatform을 위한 새로운 실험적 컴파일 스킴 {id="new-experimental-compilation-scheme-for-kotlin-multiplatform"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="multiplatform"/>

Kotlin %kotlinEapVersion%은 컴파일러가 공통 소스 세트(common source sets)를 IDE와 더욱 일관되게 처리하도록 하는 Kotlin Multiplatform(KMP)용 새로운 실험적 컴파일 스킴을 도입합니다. 이 변경을 통해 공통 코드가 플랫폼별 선언으로 잘못 확인(resolve)되는 것을 방지하고, 오버로드 확인(overload resolution) 및 타입 추론의 일관성을 개선하며, 공통 소스 세트에 대한 증분 컴파일을 구현할 수 있게 됩니다. KMP 개별 컴파일(separate compilation)에 대한 자세한 내용과 사용 방법은 [블로그 게시물](https://blog.jetbrains.com/kotlin/2026/09/a-more-reliable-compilation-scheme-for-kotlin-multiplatform-modules/)에서 확인하세요.

### Kotlin 멀티플랫폼 라이브러리를 위한 새로운 배포 형식 {id="new-publication-format-for-kotlin-multiplatform-libraries"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="multiplatform"/>

Kotlin %kotlinEapVersion%은 배포되는 라이브러리의 크기를 획기적으로 줄여주는 Kotlin Multiplatform 라이브러리용 새로운 배포 형식을 도입합니다. 이 새로운 형식은 플랫폼 아티팩트(JVM 및 Android 제외)를 단일 `.kar` 아카이브(XZ로 추가 압축된 ZIP 아카이브)로 배포합니다.

이 변경은 최근 Maven Central에 도입된 [배포 크기 제한](https://central.sonatype.org/publish/maven-central-publishing-limits/) 문제를 해결합니다. 새로운 형식을 사용하면 새 타깃을 추가해도 새 파일이 생성되지 않으므로 배포 크기가 크게 증가하지 않습니다. 경우에 따라 이전의 단일 타깃 배포보다 전체 배포 크기가 더 작아지기도 합니다. 예를 들어 [cryptography-kotlin](https://github.com/whyoleg/cryptography-kotlin) 라이브러리의 경우, 전체 멀티 모듈 프로젝트에 대해 배포된 아티팩트 세트가 7,539개 파일 및 91MB에서 1,036개 파일 및 23MB로 줄어들었습니다.

특정 모듈에 새 형식을 사용하도록 설정하려면 해당 모듈의 빌드 스크립트에서 구성하세요.

```kotlin
kotlin {
    publishing {
        publicationFormat.set(KotlinPublicationFormat.KOTLIN_ARCHIVE)
    }
}
```

또는 프로젝트의 모든 모듈에 이를 활성화하려면 `gradle.properties` 파일에 다음 프로퍼티를 추가하세요.

```properties
kotlin.publicationFormat=KOTLIN_ARCHIVE
```

새 형식의 배포는 아직 [실험적(Experimental)](components-stability.md#stability-levels-explained) 단계이지만, 이러한 아티팩트의 사용(consumption)은 이미 모든 프로젝트에서 가능합니다. 이 변경 사항은 라이브러리 작성자에게만 해당되며 최종 애플리케이션 개발자에게는 영향을 주지 않습니다.

피드백을 공유하고 문제가 있으면 [YouTrack](https://kotl.in/issue)에 보고해 주세요.

## Kotlin/JS {id="kotlin-js"}
<secondary-label ref="js"/>

Kotlin %kotlinEapVersion%은 Kotlin/JS 컴파일러 및 Gradle 플러그인에 `es2020` 타깃을 추가합니다. 이전에는 `es5` 및 `es2015` 타깃만 사용할 수 있었으며, `BigInt`와 같은 최신 JavaScript 기능에 대한 지원은 ES2015를 대상으로 별도로 활성화해야 했습니다. ES2020을 타깃으로 지정하면 추가 구성 없이 `BigInt`를 포함하여 ECMAScript 2020까지 지원되는 모든 JavaScript 기능을 사용할 수 있습니다.

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

Kotlin %kotlinEapVersion%은 `klib` 컴파일 중 함수 인라인화에 대한 추가적인 개선 사항을 제공하고 타입 추론 성능을 향상합니다.

### klib 컴파일 중 일관된 모듈 간 함수 인라인화 {id="consistent-cross-module-function-inlining-during-klib-compilation"}

<secondary-label ref="compiler"/>

Kotlin 2.4.0에서는 `klib` 컴파일 중 [Kotlin/Native, Kotlin/JS 및 Kotlin/Wasm에서 일관된 모듈 내 함수 인라인화](whatsnew24.md#consistent-intra-module-function-inlining-during-klib-compilation)를 활성화했습니다. 서로 다른 Kotlin 플랫폼 간에 함수 인라인화의 일관성을 유지하면 호환성을 더 쉽게 보장할 수 있습니다.

Kotlin 2.4.0은 또한 `klib` 컴파일 중 **모듈 간(cross-module)** 인라인화를 활성화할 수 있는 기능을 도입하여 프로젝트의 모든 인라인 함수가 일관되게 인라인화되도록 했습니다. Kotlin %kotlinEapVersion%에서는 모듈 간 인라인화가 기본적으로 활성화됩니다.

이 기능과 관련하여 예상치 못한 문제가 발생하는 경우 다음 명령줄 컴파일러 옵션을 사용하여 비활성화할 수 있습니다.

```bash
-Xklib-ir-inliner=disabled
```

피드백을 공유하고 문제가 있으면 [YouTrack](https://kotl.in/issue)에 보고해 주세요.

### 타입 추론 성능 향상 {id="improved-type-inference-performance"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="compiler"/>

Kotlin %kotlinEapVersion%은 타입 추론 중에 생성되는 제약 조건(constraints)의 수를 줄여 컴파일러 성능을 향상합니다. 이전에는 복잡한 제네릭 코드가 과도한 제약 조건을 생성하여 컴파일이나 IDE 분석이 멈추는(hang) 현상이 발생할 수 있었습니다. 이 변경 사항은 특정 엣지 케이스, 특히 빌더 추론이나 특이한 경계를 가진 복잡한 플랫폼 타입이 포함된 경우의 타입 추론에 영향을 줄 수 있습니다. 그 결과, 컴파일러가 다른 타입을 추론하거나 다른 오버로드를 선택하거나 다른 진단 결과를 보고할 수 있습니다. 이러한 차이는 개선에 따른 정상적인 결과일 수 있습니다.

이 기능은 기본적으로 활성화되어 있습니다. 이전의 타입 추론 동작으로 되돌리려면 `-XXLanguage:-EliminateSecondKindIncorporation` 옵션을 사용하세요.

피드백은 [YouTrack](https://youtrack.jetbrains.com/issue/KT-85879)을 통해 전달해 주시기 바랍니다.

## 호환성을 깨뜨리는 변경 사항 및 지원 중단(Breaking changes and deprecations) {id="breaking-changes-and-deprecations"}

Kotlin %kotlinEapVersion%은 Kotlin 컴파일러를 실행하는 데 필요한 최소 JDK 버전을 JDK 8에서 JDK 17로 상향 조정하기 위한 다음 단계로 오류(error)를 도입합니다. 개발 속도를 높이고 컴파일러가 최신 Java 버전을 필요로 하는 새 라이브러리에 접근할 수 있도록 최소 요구 JDK를 상향하고 있습니다. JDK 17은 긴 지원 기간을 가지며 최신 버전의 Gradle 및 Maven과의 호환성을 유지하는 데 도움이 됩니다. 이 오류를 비활성화하려면 `-Xallow-pre-17-runtime-jdk` 컴파일러 옵션을 사용하세요. 이 옵션은 JDK 17이 필수가 되는 Kotlin 2.5.20 또는 2.6.0에서 제거될 예정입니다.

프로젝트를 업그레이드하는 데 어려움이 있는 경우 [YouTrack](https://kotl.in/issue)에서 경험을 공유하거나 Kotlin Slack에서 개발자에게 직접 문의하세요. [초대를 받아](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up?_gl=1*ju6cbn*_ga*MTA3MTk5NDkzMC4xNjQ2MDY3MDU4*_ga_9J976DJZ68*MTY1ODMzNzA3OS4xMDAuMS4xNjU4MzQwODEwLjYw) [#compiler](https://kotlinlang.slack.com/archives/C7L3JB43G) 채널에 참여하세요.