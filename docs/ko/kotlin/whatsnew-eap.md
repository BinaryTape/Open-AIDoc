[//]: # (title: Kotlin %kotlinEapVersion%의 새로운 기능)

<primary-label ref="eap"/>

<show-structure depth="1"/>

<web-summary>Kotlin EAP(Early Access Preview) 릴리스 노트를 읽고 최신 실험적 Kotlin 기능을 공식 출시 전에 미리 사용해 보세요.</web-summary>

_[출시일: %kotlinEapReleaseDate%](eap.md#build-details)_

> 이 문서는 EAP(Early Access Preview) 릴리스의 모든 기능을 다루지는 않지만, 주요 개선 사항을 중점적으로 설명합니다.
>
> 전체 변경 사항 목록은 [GitHub 변경 로그](https://github.com/JetBrains/kotlin/releases/tag/v%kotlinEapVersion%)에서 확인하세요.
>
{style="note"}

Kotlin %kotlinEapVersion% 버전이 출시되었습니다! 이번 EAP 릴리스의 주요 내용은 다음과 같습니다:

* **언어**: [`only-syntax` 모드에서의 안정화된 이름 기반 구조 분해(name-based destructuring)](#stable-language-features) 및 [새로운 실험적 컴패니언 확장(companion extensions)과 컴패니언 블록](#companion-extensions-and-blocks)
* **표준 라이브러리**: [`if` 표현식을 사용하는 일반적인 패턴을 단순화하기 위한 새로운 실험적 함수](#standard-library-new-functions-for-simplifying-common-patterns-with-if-expressions)
* **Kotlin/JS**: [`es2020` 타겟 지원](#kotlin-js-support-for-the-es2020-target)
* **Kotlin 컴파일러**: [`.klib` 컴파일 중 더욱 일관된 인라인 함수 동작](#consistent-cross-module-function-inlining-during-klib-compilation)<!--and a [new experimental compilation scheme for Kotlin Multiplatform]().-->

> Kotlin 릴리스 주기에 대한 정보는 [Kotlin 릴리스 프로세스](releases.md)를 참조하세요.
>
{style="tip"}

## Kotlin %kotlinEapVersion%으로 업데이트 {id="update-to-kotlin-kotlineapversion"}

최신 버전의 Kotlin은 최신 버전의 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/) 및 [Android Studio](https://developer.android.com/studio)에 포함되어 있습니다.

새로운 Kotlin 버전으로 업데이트하려면 IDE가 최신 버전인지 확인하고, 빌드 스크립트에서 [Kotlin 버전을 %kotlinEapVersion%으로 변경](releases.md#update-to-a-new-kotlin-version)하세요.

## 언어 {id="language"}

Kotlin %kotlinEapVersion%은 이전 릴리스에서 도입된 두 가지 언어 기능을 안정화(stabilize)했습니다. 또한 실험적 기능인 컴패니언 확장과 컴패니언 블록을 도입합니다.

### 안정화된 언어 기능 {id="stable-language-features"}

<secondary-label ref="language"/>

Kotlin 2.3.20 및 2.4.0에서는 몇 가지 언어 기능을 [실험적(Experimental)](components-stability.md#stability-levels-explained) 상태로 도입했습니다. 이번 릴리스에서 다음과 같은 언어 기능이 [안정적(Stable)](components-stability.md#stability-levels-explained) 상태로 전환되었음을 기쁜 마음으로 알립니다:

* `only-syntax` 모드의 [이름 기반 구조 분해(Name-based destructuring)](destructuring-declarations.md#name-based-destructuring).

  이 모드에서는 "이전" 구조 분해 구문인 `val (x, y)`가 위치 기반 동작을 유지하는 반면, "새로운" 구문인 `(val x, val y)`는 이름 기반 구조 분해를 수행합니다.

* [개선된 컴파일 타임 상수](whatsnew24.md#improved-compile-time-constants).

### 컴패니언 확장 및 블록 {id="companion-extensions-and-blocks"}

<primary-label ref="experimental-opt-in"/>

<secondary-label ref="language"/>

Kotlin %kotlinEapVersion%은 컴패니언 확장(companion extensions)과 컴패니언 블록을 도입합니다.

이전에는 타입 이름을 통해 접근할 수 있는 확장, 함수 및 프로퍼티를 선언하려면 해당 타입에 컴패니언 객체(companion object)가 있어야 했습니다. 컴패니언 확장과 블록은 이러한 요구 사항을 없애 다음과 같은 작업을 가능하게 합니다:

* 확장 대상 타입에 컴패니언 객체가 없더라도, 최상위 확장에 `companion` 제어자를 추가하여 컴패니언 확장을 선언할 수 있습니다.
* 클래스나 인터페이스 내의 `companion {}` 블록에서 객체 인스턴스를 생성하지 않고 함수와 프로퍼티를 선언할 수 있습니다. 정적 멤버를 지원하는 플랫폼에서 컴파일러는 이러한 선언을 정적 멤버로 생성합니다. 결과적으로 JVM에서 `@JvmStatic`을 주석으로 달 필요가 없습니다.

다음은 `UnitX`를 컴패니언 확장으로 선언하고 `Zero`를 컴패니언 블록에 선언하는 예제입니다:

```kotlin
// UnitX를 컴패니언 확장으로 선언합니다
companion val Vector.UnitX get() = Vector(1.0, 0.0)

data class Vector(val x: Double, val y: Double) {
    companion {
        // Zero를 컴패니언 블록에 선언합니다
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

디자인에 대한 자세한 내용은 해당 기능의 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0449-companions-block-extension.md)을 참조하세요.

컴패니언 확장과 블록은 [실험적(Experimental)](components-stability.md#stability-levels-explained) 기능입니다. 옵트인하려면 빌드 파일에 다음 컴파일러 옵션을 추가하세요:

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

의견이 있으시면 [YouTrack](https://youtrack.jetbrains.com/issue/KT-11968)을 통해 공유해 주시면 감사하겠습니다.

## 표준 라이브러리: `if` 표현식을 사용하는 일반적인 패턴을 단순화하기 위한 새로운 함수 {id="standard-library-new-functions-for-simplifying-common-patterns-with-if-expressions"}

<primary-label ref="experimental-opt-in"/>
<secondary-label ref="standard-library"/>

Kotlin %kotlinEapVersion%은 `Boolean` 값을 반환하기 전에 확인하거나 해당 값에 따라 널 허용(nullable) 결과를 반환할 수 있는 새로운 표준 라이브러리 함수를 도입합니다.

이전에는 이러한 패턴을 사용하려면 `else` 분기가 포함된 명시적인 `if` 표현식이 필요했습니다. 이제 다음 함수를 사용하여 이를 단순화할 수 있습니다:

* `onTrue()`는 `Boolean` 값이 `true`일 때 지정된 코드 블록을 실행하고 원래의 Boolean 값을 반환합니다.
* `onFalse()`는 `Boolean` 값이 `false`일 때 지정된 코드 블록을 실행하고 원래의 Boolean 값을 반환합니다.
* `ifOrNull()`은 `Boolean` 값이 `true`인 경우 지정된 코드 블록을 실행하고 그 결과를 반환합니다. 값이 `false`인 경우 함수는 블록을 실행하지 않고 `null`을 반환합니다.

이 함수들은 [실험적(Experimental)](components-stability.md#stability-levels-explained) 단계이며 `@OptIn(ExperimentalStdlibApi::class)` 어노테이션 또는 `-opt-in=kotlin.ExperimentalStdlibApi` 컴파일러 옵션을 통한 옵트인이 필요합니다.

다음은 사용 예시입니다:

```kotlin
@OptIn(ExperimentalStdlibApi::class)
fun main() {
    val tags = mutableSetOf("kotlin", "jvm")

    // onTrue() 함수를 사용하여 add()가 true를 반환할 때 메시지를 출력합니다
    val added = tags.add("wasm").onTrue {
        println("Tag added")
    }
    println(added)
    // Tag added
    // true

    // onFalse() 함수를 사용하여 remove()가 false를 반환할 때 메시지를 출력합니다
    val removed = tags.remove("native").onFalse {
        println("Tag not found")
    }
    println(removed)
    // Tag not found
    // false

    // ifOrNull() 함수를 사용하여 tags에 "wasm"이 포함되어 있을 때 메시지를 반환합니다
    val message = ifOrNull("wasm" in tags) {
        "Wasm tag is available"
    }
    println(message)
    // Wasm tag is available
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.5.0-Beta1" validate="false"}

의견이 있으시면 [YouTrack](https://youtrack.jetbrains.com/issue/KT-6938)을 통해 공유해 주시면 감사하겠습니다.

## Kotlin/JS: `es2020` 타겟 지원 {id="kotlin-js-support-for-the-es2020-target"}
<secondary-label ref="js"/>

Kotlin %kotlinEapVersion%은 Kotlin/JS 컴파일러 및 Gradle 플러그인에 `es2020` 타겟을 추가합니다. 이전에는 `es5` 및 `es2015` 타겟만 사용할 수 있었으며, `BigInt`와 같은 최신 JavaScript 기능에 대한 지원은 ES2015를 타겟팅하면서 별도로 활성화해야 했습니다. 이제 ES2020을 타겟팅하면 추가 구성 없이 `BigInt`를 포함하여 ECMAScript 2020까지 지원되는 모든 JavaScript 기능을 사용할 수 있습니다.

새로운 타겟을 활성화하려면 `compilerOptions` 블록에서 `target`을 `es2020`으로 설정하세요:

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

Kotlin %kotlinEapVersion%은 `.klib` 컴파일 중 함수 인라이닝에 대한 추가적인 개선 사항과 함께 향상된 타입 추론 성능 등의 실험적 기능을 제공합니다<!-- and a new compilation scheme for Kotlin Multiplatform -->.

### klib 컴파일 중 일관된 크로스 모듈 함수 인라이닝 {id="consistent-cross-module-function-inlining-during-klib-compilation"}

<secondary-label ref="compiler"/>

Kotlin 2.4.0에서는 `.klib` 컴파일 중 [Kotlin/Native, Kotlin/JS 및 Kotlin/Wasm에서 일관된 모듈 내 함수 인라이닝](whatsnew24.md#consistent-intra-module-function-inlining-during-klib-compilation)을 활성화했습니다. 서로 다른 Kotlin 플랫폼 간의 함수 인라이닝 일관성은 호환성 보장을 제공하기 쉽게 만듭니다.

또한 Kotlin 2.4.0은 `.klib` 컴파일 중 **크로스 모듈(cross-module)** 인라이닝을 활성화할 수 있는 가능성을 도입하여 프로젝트의 모든 인라인 함수가 일관되게 인라인되도록 보장했습니다. Kotlin %kotlinEapVersion%은 크로스 모듈 인라이닝을 기본적으로 활성화합니다.

이 기능과 관련하여 예상치 못한 문제가 발생하는 경우 다음 명령줄 컴파일러 옵션을 사용하여 비활성화할 수 있습니다:

```bash
-Xklib-ir-inliner=disabled
```

피드백이 있거나 문제가 발생하면 [YouTrack](https://kotl.in/issue)에 보고해 주세요.

### 향상된 타입 추론 성능 {id="improved-type-inference-performance"}

<primary-label ref="experimental-opt-in"/>

<secondary-label ref="compiler"/>

Kotlin %kotlinEapVersion%은 타입 추론 중에 생성되는 제약 조건(constraints)의 수를 줄여 컴파일러 성능을 향상시킵니다. 이전에는 복잡한 제네릭 코드가 과도한 제약 조건을 생성하여 컴파일이나 IDE 분석이 멈출 수 있었습니다. 이 변경 사항은 특정 엣지 케이스, 특히 빌더 추론(builder inference)이나 특이한 경계를 가진 복잡한 플랫폼 타입과 관련된 경우 타입 추론에 영향을 미칠 수 있습니다. 결과적으로 컴파일러가 다른 타입을 추론하거나 다른 오버로드를 선택하거나 다른 진단 정보를 보고할 수 있습니다. 이러한 차이는 개선 과정에서 예상되는 결과일 수 있습니다.

이 기능은 기본적으로 활성화되어 있습니다. 이전 타입 추론 동작을 복원하려면 `-XXLanguage:-EliminateSecondKindIncorporation` 옵션을 사용하세요.

의견이 있으시면 [YouTrack](https://youtrack.jetbrains.com/issue/KT-85879)을 통해 공유해 주시면 감사하겠습니다.

<!--
### New experimental compilation scheme for Kotlin Multiplatform {id="new-experimental-compilation-scheme-for-kotlin-multiplatform"}

<primary-label ref="experimental-opt-in"/>

<secondary-label ref="compiler"/>

Kotlin %kotlinEapVersion% introduces a new experimental compilation scheme for Kotlin Multiplatform (KMP) that makes the
compiler handle common source sets more consistently with the IDE. This change prevents common code from accidentally
resolving to platform-specific declarations, improves consistency in overload resolution and type inference, and enables
incremental compilation for common source sets. Learn more about KMP separate compilation and how to try it in our [blog post](TBD).
-->

## 호환성을 깨뜨리는 변경 사항 및 지원 중단 {id="breaking-changes-and-deprecations"}

Kotlin %kotlinEapVersion%은 Kotlin 컴파일러를 실행하는 데 필요한 최소 JDK 버전을 JDK 8에서 JDK 17로 올리기 위한 첫 단계로 경고를 도입합니다. 개발 속도를 높이고 컴파일러가 최신 Java 버전을 필요로 하는 새로운 라이브러리에 접근할 수 있도록 최소 필수 JDK를 상향 조정합니다. JDK 17은 긴 지원 기간(LTS)을 제공하며 Gradle 및 Maven의 최신 버전과의 호환성을 유지하는 데 도움이 됩니다. 경고를 비활성화하려면 `-Xallow-pre-17-runtime-jdk` 컴파일러 옵션을 사용하세요. 이 옵션은 JDK 17이 필수가 되는 Kotlin 2.5.20 또는 2.6.0에서 제거될 예정입니다.

프로젝트를 업그레이드하는 데 어려움이 있는 경우 [YouTrack](https://kotl.in/issue)에 경험을 공유하거나 Kotlin Slack의 개발자에게 직접 문의하세요. [초대를 받아](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up?_gl=1*ju6cbn*_ga*MTA3MTk5NDkzMC4xNjQ2MDY3MDU4*_ga_9J976DJZ68*MTY1ODMzNzA3OS4xMDAuMS4xNjU4MzQwODEwLjYw) [#compiler](https://kotlinlang.slack.com/archives/C7L3JB43G) 채널에 참여하세요.