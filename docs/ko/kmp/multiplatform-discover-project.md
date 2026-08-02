[//]: # (title: 코틀린 멀티플랫폼 프로젝트 구조의 기본)

코틀린 멀티플랫폼(Kotlin Multiplatform)을 사용하면 서로 다른 플랫폼 간에 코드를 공유할 수 있습니다. 이 글에서는 공유 코드의 제약 사항, 코드에서 공유 부분과 플랫폼별 부분을 구분하는 방법, 그리고 이 공유 코드가 작동하는 플랫폼을 지정하는 방법을 설명합니다.

또한 공통 코드(common code), 타겟(targets), 플랫폼별 및 중간 소스 세트(platform-specific and intermediate source sets), 테스트 통합과 같은 코틀린 멀티플랫폼 프로젝트 설정의 핵심 개념을 배우게 됩니다. 이는 향후 멀티플랫폼 프로젝트를 설정하는 데 도움이 될 것입니다.

여기에서 제시하는 모델은 코틀린에서 실제로 사용되는 모델보다 단순화된 것입니다. 하지만 이 기본 모델만으로도 대부분의 경우 충분할 것입니다.

## 공통 코드 (Common code)

_공통 코드(Common code)_는 서로 다른 플랫폼 간에 공유되는 코틀린 코드입니다.

간단한 "Hello, World" 예제를 살펴보겠습니다.

```kotlin
fun greeting() {
    println("Hello, Kotlin Multiplatform!")
}
```

플랫폼 간에 공유되는 코틀린 코드는 일반적으로 `commonMain` 디렉토리에 위치합니다. 코드 파일의 위치는 해당 코드가 컴파일되는 플랫폼 목록에 영향을 미치므로 중요합니다.

코틀린 컴파일러는 소스 코드를 입력받아 결과물로 플랫폼별 바이너리 세트를 생성합니다. 멀티플랫폼 프로젝트를 컴파일할 때, 컴파일러는 동일한 코드에서 여러 바이너리를 생성할 수 있습니다. 예를 들어, 컴파일러는 동일한 코틀린 파일에서 JVM `.class` 파일과 네이티브 실행 파일을 모두 생성할 수 있습니다.

![공통 코드](common-code-diagram.svg){width=700}

모든 코틀린 코드를 모든 플랫폼으로 컴파일할 수 있는 것은 아닙니다. 코틀린 컴파일러는 공통 코드가 다른 플랫폼으로 컴파일될 수 없는 경우, 해당 코드에서 플랫폼별 함수나 클래스를 사용하는 것을 방지합니다.

예를 들어, 공통 코드에서는 `java.io.File` 종속성을 사용할 수 없습니다. 이는 JDK의 일부이지만, 공통 코드는 JDK 클래스를 사용할 수 없는 네이티브 코드로도 컴파일되기 때문입니다.

![해결되지 않은 Java 참조](unresolved-java-reference.png){width=500}

공통 코드에서는 코틀린 멀티플랫폼 라이브러리를 사용할 수 있습니다. 이러한 라이브러리는 서로 다른 플랫폼에서 다르게 구현될 수 있는 공통 API를 제공합니다. 이 경우 플랫폼별 API는 추가적인 부분으로 간주되며, 공통 코드에서 이러한 API를 사용하려고 하면 오류가 발생합니다.

예를 들어, `kotlinx.coroutines`는 모든 타겟을 지원하는 코틀린 멀티플랫폼 라이브러리이지만, `kotlinx.coroutines`의 동시성 프리미티브를 `fun CoroutinesDispatcher.asExecutor(): Executor`와 같이 JDK 동시성 프리미티브로 변환하는 플랫폼별 부분도 가지고 있습니다. API의 이 추가 부분은 `commonMain`에서 사용할 수 없습니다.

사용 가능한 코틀린 멀티플랫폼 라이브러리를 탐색하려면 [klibs.io](https://klibs.io)를 확인하세요.

## 타겟 (Targets)

타겟(Targets)은 코틀린이 공통 코드를 컴파일할 플랫폼을 정의합니다. 예를 들어 JVM, JS, Android, iOS, Linux 등이 타겟이 될 수 있습니다. 이전 예제에서는 공통 코드를 JVM과 네이티브 타겟으로 컴파일했습니다.

_코틀린 타겟_은 컴파일 대상을 나타내는 식별자입니다. 타겟은 생성될 바이너리의 형식, 사용 가능한 언어 구조 및 허용되는 종속성을 정의합니다.

> 타겟은 플랫폼이라고도 불립니다. [지원되는 타겟의 전체 목록](multiplatform-dsl-reference.md#targets)을 확인하세요.
>
> {style="note"}

코틀린이 특정 타겟을 위해 코드를 컴파일하도록 하려면 먼저 타겟을 _선언_해야 합니다. Gradle에서는 `kotlin {}` 블록 내에서 미리 정의된 DSL 호출을 사용하여 타겟을 선언합니다.

```kotlin
kotlin {
    jvm() // JVM 타겟 선언
    iosArm64() // 64비트 iPhone에 해당하는 타겟 선언
}
```

이런 방식으로 각 멀티플랫폼 프로젝트는 지원되는 타겟 세트를 정의합니다. 빌드 스크립트에서 타겟을 선언하는 방법에 대한 자세한 내용은 [계층적 프로젝트 구조(Hierarchical project structure)](multiplatform-hierarchy.md) 섹션을 참조하세요.

`jvm` 및 `iosArm64` 타겟이 선언되면, `commonMain`의 공통 코드는 다음 타겟들로 컴파일됩니다.

![타겟](target-diagram.svg){width=700}

어떤 코드가 특정 타겟으로 컴파일될지 이해하려면, 타겟을 코틀린 소스 파일에 붙은 레이블로 생각하면 됩니다. 코틀린은 이 레이블을 사용하여 코드를 컴파일하는 방법, 생성할 바이너리, 해당 코드에서 허용되는 언어 구조 및 종속성을 결정합니다.

> 프로젝트에 단일 타겟(예: JVM)만 있는 경우, 공통 코드에서 적절한 가시성을 가진 타겟 전용 심볼에 접근할 수 있습니다.
> 하지만 두 번째 타겟을 추가하는 즉시 공통 코드에서 타겟 전용 심볼을 사용할 수 없게 됩니다.
> 마이그레이션이나 기타 중간 프로젝트 상태에서 이 제한 사항을 염두에 두시기 바랍니다.
> 
{style="note"}

`greeting.kt` 파일을 `.js`로도 컴파일하려면 JS 타겟만 선언하면 됩니다. 그러면 `commonMain`의 코드는 JS 타겟에 해당하는 추가 `js` 레이블을 받게 되며, 코틀린은 이에 따라 `.js` 파일을 생성합니다.

![타겟 레이블](target-labels-diagram.svg){width=700}

이것이 코틀린 컴파일러가 선언된 모든 타겟으로 컴파일되는 공통 코드를 처리하는 방식입니다. 플랫폼별 코드를 작성하는 방법은 [소스 세트](#source-sets)를 참조하세요.

## 소스 세트 (Source sets)

_코틀린 소스 세트(Kotlin source set)_는 자체 타겟, 종속성 및 컴파일러 옵션을 가진 소스 파일의 집합입니다. 이는 멀티플랫폼 프로젝트에서 코드를 공유하는 주요 방법입니다.

멀티플랫폼 프로젝트의 각 소스 세트는 다음과 같은 특징을 가집니다.

* 해당 프로젝트 내에서 고유한 이름을 가집니다.
* 소스 파일 및 리소스 세트를 포함하며, 일반적으로 소스 세트 이름과 동일한 디렉토리에 저장됩니다.
* 이 소스 세트의 코드가 컴파일되는 타겟 세트를 지정합니다. 이러한 타겟은 해당 소스 세트에서 사용 가능한 언어 구조와 종속성에 영향을 미칩니다.
* 자체 종속성과 컴파일러 옵션을 정의합니다.

코틀린은 여러 개의 미리 정의된 소스 세트를 제공합니다. 그중 하나인 `commonMain`은 모든 멀티플랫폼 프로젝트에 존재하며 선언된 모든 타겟으로 컴파일됩니다.

코틀린 멀티플랫폼 프로젝트에서는 `src` 내부의 디렉토리로 소스 세트와 상호작용합니다.
예를 들어, `commonMain`, `iosMain`, `jvmMain` 소스 세트가 있는 프로젝트는 다음과 같은 구조를 가집니다.

![공유 소스](src-directory-diagram.png){width=350}

Gradle 스크립트에서는 `kotlin.sourceSets {}` 블록 내에서 이름으로 소스 세트에 접근합니다.

```kotlin
kotlin {
    // 타겟 선언:
    // …

    // 소스 세트 선언:
    sourceSets {
        commonMain {
            // commonMain 소스 세트 구성
        }
    }
}
```

`commonMain` 외에 다른 소스 세트는 플랫폼별(platform-specific)이거나 중간(intermediate) 소스 세트일 수 있습니다.

### 플랫폼별 소스 세트 (Platform-specific source sets)

공통 코드만 갖는 것이 편리하긴 하지만 항상 가능한 것은 아닙니다. `commonMain`의 코드는 선언된 모든 타겟으로 컴파일되므로, 코틀린은 그곳에서 플랫폼별 API를 사용하는 것을 허용하지 않습니다.

네이티브 및 JS 타겟이 있는 멀티플랫폼 프로젝트에서 `commonMain`에 있는 다음 코드는 컴파일되지 않습니다.

```kotlin
// commonMain/kotlin/common.kt
// 공통 코드에서는 컴파일되지 않음
fun greeting() {
    java.io.File("greeting.txt").writeText("Hello, Multiplatform!")
}
```

해결책으로 코틀린은 플랫폼별 소스 세트(플랫폼 소스 세트라고도 함)를 생성합니다. 각 타겟에는 해당 타겟으로만 컴파일되는 대응하는 플랫폼 소스 세트가 있습니다. 예를 들어, `jvm` 타겟에는 JVM으로만 컴파일되는 대응하는 `jvmMain` 소스 세트가 있습니다. 코틀린은 이러한 소스 세트에서 플랫폼별 종속성을 사용하는 것을 허용합니다. 예를 들어 `jvmMain`에서 JDK를 사용할 수 있습니다.

```kotlin
// jvmMain/kotlin/jvm.kt
// `jvmMain` 소스 세트에서는 Java 종속성을 사용할 수 있음
fun jvmGreeting() {
    java.io.File("greeting.txt").writeText("Hello, Multiplatform!")
}
```

### 특정 타겟으로의 컴파일

특정 타겟으로의 컴파일은 여러 소스 세트와 함께 작동합니다. 코틀린이 멀티플랫폼 프로젝트를 특정 타겟으로 컴파일할 때, 해당 타겟으로 레이블이 지정된 모든 소스 세트를 수집하여 바이너리를 생성합니다.

`jvm`, `iosArm64`, `js` 타겟이 있는 예제를 생각해 봅시다. 코틀린은 공통 코드를 위한 `commonMain` 소스 세트와 각 타겟에 대응하는 `jvmMain`, `iosArm64Main`, `jsMain` 소스 세트를 생성합니다.

![특정 타겟으로의 컴파일](specific-target-diagram.svg){width=700}

JVM으로 컴파일하는 동안 코틀린은 "JVM" 레이블이 지정된 모든 소스 세트, 즉 `jvmMain`과 `commonMain`을 선택합니다. 그런 다음 이들을 함께 JVM 클래스 파일로 컴파일합니다.

![JVM으로 컴파일](compilation-jvm-diagram.svg){width=700}

코틀린이 `commonMain`과 `jvmMain`을 함께 컴파일하기 때문에, 결과 바이너에는 `commonMain`과 `jvmMain` 모두의 선언이 포함됩니다.

멀티플랫폼 프로젝트로 작업할 때 다음 사항을 기억하세요.

* 코틀린이 코드를 특정 플랫폼으로 컴파일하도록 하려면 해당 타겟을 선언하세요.
* 코드를 저장할 디렉토리나 소스 파일을 선택하려면, 먼저 어떤 타겟들 사이에서 코드를 공유하고 싶은지 결정하세요.
    * 코드가 모든 타겟에서 공유된다면 `commonMain`에 선언해야 합니다.
    * 코드가 하나의 타겟에서만 사용된다면 해당 타겟을 위한 플랫폼별 소스 세트(예: JVM의 경우 `jvmMain`)에 정의해야 합니다.
* 플랫폼별 소스 세트에 작성된 코드는 공통 소스 세트의 선언에 접근할 수 있습니다. 예를 들어, `jvmMain`의 코드는 `commonMain`의 코드를 사용할 수 있습니다. 하지만 그 반대는 불가능합니다. `commonMain`은 `jvmMain`의 코드를 사용할 수 없습니다.
* 플랫폼별 소스 세트에 작성된 코드는 해당 플랫폼의 종속성을 사용할 수 있습니다. 예를 들어, `jvmMain`의 코드는 [Guava](https://github.com/google/guava)나 [Spring](https://spring.io/)과 같은 Java 전용 라이브러리를 사용할 수 있습니다.

### 중간 소스 세트 (Intermediate source sets)

단순한 멀티플랫폼 프로젝트는 대개 공통 코드와 플랫폼별 코드만 가집니다.
`commonMain` 소스 세트는 선언된 모든 타겟 간에 공유되는 공통 코드를 나타냅니다. `jvmMain`과 같은 플랫폼별 소스 세트는 해당 타겟으로만 컴파일되는 플랫폼별 코드를 나타냅니다.

실제로는 더 세분화된 코드 공유가 필요한 경우가 많습니다.

모든 최신 Apple 기기와 Android 기기를 타겟팅해야 하는 예제를 생각해 봅시다.

```kotlin
kotlin {
    android()
    iosArm64()   // 64비트 iPhone 기기
    macosArm64() // Apple 실리콘 기반의 최신 Mac
    watchosArm64() // 최신 64비트 Apple Watch 기기
    tvosArm64()  // 최신 Apple TV 기기
}
```

그리고 모든 Apple 기기에 대해 UUID를 생성하는 함수를 추가할 소스 세트가 필요하다고 가정해 봅시다.

```kotlin
import platform.Foundation.NSUUID

fun randomUuidString(): String {
    // Apple 전용 API에 접근하려고 함
    return NSUUID().UUIDString()
}
```

이 함수를 `commonMain`에 추가할 수는 없습니다. `commonMain`은 Android를 포함하여 선언된 모든 타겟으로 컴파일되지만, `platform.Foundation.NSUUID`는 Android에서 사용할 수 없는 Apple 전용 API이기 때문입니다. `commonMain`에서 `NSUUID`를 참조하려고 하면 코틀린에서 오류를 표시합니다.

이 코드를 각 Apple 전용 소스 세트인 `iosArm64Main`, `macosArm64Main`, `watchosArm64Main`, `tvosArm64Main`에 복사하여 붙여넣을 수도 있습니다. 하지만 이러한 코드 중복은 오류가 발생하기 쉬우므로 권장되지 않습니다.

이 문제를 해결하기 위해 _중간 소스 세트(intermediate source sets)_를 사용할 수 있습니다. 중간 소스 세트는 프로젝트의 전체 타겟이 아닌 일부 타겟으로만 컴파일되는 코틀린 소스 세트입니다. 중간 소스 세트는 계층적 소스 세트(hierarchical source sets) 또는 단순히 계층 구조(hierarchies)라고 불리기도 합니다.

코틀린은 기본적으로 몇몇 중간 소스 세트를 생성합니다. 이 특정 사례에서 결과 프로젝트 구조는 다음과 같습니다.

![중간 소스 세트](intermediate-source-sets-diagram.svg){width=700}

여기서 하단의 다색 블록은 플랫폼별 소스 세트입니다. 명확성을 위해 타겟 레이블은 생략되었습니다.

`appleMain` 블록은 Apple 전용 타겟으로 컴파일되는 코드를 공유하기 위해 코틀린이 생성한 중간 소스 세트입니다. `appleMain` 소스 세트는 Apple 타겟으로만 컴파일됩니다. 따라서 코틀린은 `appleMain`에서 Apple 전용 API 사용을 허용하며, 여기에 `randomUUID()` 함수를 추가할 수 있습니다.

> 코틀린이 기본적으로 생성하고 설정하는 모든 중간 소스 세트를 확인하고, 필요한 중간 소스 세트를 코틀린이 기본으로 제공하지 않을 때 어떻게 해야 하는지 배우려면 [계층적 프로젝트 구조(Hierarchical project structure)](multiplatform-hierarchy.md)를 참조하세요.
>
{style="tip"}

특정 타겟으로 컴파일하는 동안 코틀린은 해당 타겟으로 레이블이 지정된 중간 소스 세트를 포함한 모든 소스 세트를 가져옵니다. 따라서 `commonMain`, `appleMain`, `iosArm64Main` 소스 세트에 작성된 모든 코드는 `iosArm64` 플랫폼 타겟으로 컴파일되는 동안 결합됩니다.

![네이티브 실행 파일](multiplatform-executables-diagram.svg){width=700}

> 일부 소스 세트에 소스가 없어도 괜찮습니다. 예를 들어, iOS 개발에서 iOS 기기에는 해당되지만 iOS 시뮬레이터에는 해당되지 않는 코드를 제공해야 하는 경우는 거의 없습니다. 따라서 `iosArm64Main`은 드물게 사용됩니다.
>
{style="tip"}

#### Apple 기기 및 시뮬레이터 타겟 {initial-collapse-state="collapsed" collapsible="true"}

코틀린 멀티플랫폼을 사용하여 iOS 모바일 애플리케이션을 개발할 때는 보통 `iosMain` 소스 세트를 사용합니다. 이것이 `ios` 타겟을 위한 플랫폼별 소스 세트라고 생각할 수 있지만, 단일 `ios` 타겟이라는 것은 존재하지 않습니다. 대부분의 모바일 프로젝트에는 최소 두 개의 타겟이 필요합니다.

* **기기 타겟(Device target)**은 iOS 기기에서 실행할 수 있는 바이너리를 생성하는 데 사용됩니다. 현재 iOS용 기기 타겟은 `iosArm64` 하나뿐입니다.
* **시뮬레이터 타겟(Simulator target)**은 사용자의 머신에서 실행되는 iOS 시뮬레이터용 바이너리를 생성하는 데 사용됩니다. Apple 실리콘 Mac 컴퓨터를 사용하는 경우 시뮬레이터 타겟으로 `iosSimulatorArm64`를 선택하세요.

`iosArm64` 기기 타겟만 선언하면 로컬 머신에서 애플리케이션과 테스트를 실행하고 디버깅할 수 없습니다.

`iosArm64Main` 및 `iosSimulatorArm64Main`과 같은 플랫폼별 소스 세트는 보통 비어 있습니다. iOS 기기와 시뮬레이터용 코틀린 코드는 대개 동일하기 때문입니다. 모든 타겟 간에 코드를 공유하려면 `iosMain` 중간 소스 세트만 사용하면 됩니다.

이는 Mac이 아닌 다른 Apple 타겟에도 동일하게 적용됩니다. 예를 들어, Apple TV용 `tvosArm64` 기기 타겟과 Apple 실리콘 기기의 Apple TV 시뮬레이터용 `tvosSimulatorArm64` 시뮬레이터 타겟이 있는 경우, 이들 모두에 대해 `tvosMain` 중간 소스 세트를 사용할 수 있습니다.

## 테스트 통합 (Integration with tests)

실제 프로젝트에서는 기본 프로덕션 코드와 함께 테스트도 필요합니다. 이것이 기본적으로 생성된 모든 소스 세트에 `Main` 및 `Test` 접미사가 붙는 이유입니다. `Main`은 프로덕션 코드를 포함하고, `Test`는 해당 코드에 대한 테스트를 포함합니다. 이들 사이의 연결은 자동으로 설정되며, 테스트는 추가 구성 없이 `Main` 코드에서 제공하는 API를 사용할 수 있습니다.

`Test` 대응 부분도 `Main`과 유사한 소스 세트입니다. 예를 들어, `commonTest`는 `commonMain`에 대응하며 선언된 모든 타겟으로 컴파일되므로 공통 테스트를 작성할 수 있습니다. `jvmTest`와 같은 플랫폼별 테스트 소스 세트는 JVM 전용 테스트나 JVM API가 필요한 테스트와 같이 플랫폼별 테스트를 작성하는 데 사용됩니다.

공통 테스트를 작성하기 위한 소스 세트 외에도 멀티플랫폼 테스트 프레임워크가 필요합니다. 코틀린은 `@kotlin.Test` 어노테이션과 `assertEquals`, `assertTrue`와 같은 다양한 어설션 메서드를 제공하는 기본 [`kotlin.test`](https://kotlinlang.org/api/latest/kotlin.test/) 라이브러리를 제공합니다.

각 플랫폼의 해당 소스 세트에서 일반 테스트처럼 플랫폼별 테스트를 작성할 수 있습니다. 메인 코드와 마찬가지로, JVM용 `JUnit`이나 iOS용 `XCTest`와 같이 각 소스 세트에 대해 플랫폼별 종속성을 가질 수 있습니다. 특정 타겟에 대한 테스트를 실행하려면 `<targetName>Test` 태스크를 사용하세요.

멀티플랫폼 테스트를 만들고 실행하는 방법은 [멀티플랫폼 앱 테스트 튜토리얼](multiplatform-run-tests.md)에서 배워보세요.

## 다음 단계

* [Gradle 스크립트에서 미리 정의된 소스 세트를 선언하고 사용하는 방법 자세히 알아보기](multiplatform-hierarchy.md)
* [멀티플랫폼 프로젝트 구조의 심화 개념 탐구하기](multiplatform-advanced-project-structure.md)
* [타겟 컴파일 및 커스텀 컴파일 생성에 대해 자세히 알아보기](multiplatform-configure-compilations.md)