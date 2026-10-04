[//]: # (title: Kotlin Multiplatform 프로젝트 구조의 기초)

Kotlin Multiplatform을 사용하면 서로 다른 플랫폼 간에 코드를 공유할 수 있습니다. 이 글에서는 공유 코드의 제약 사항, 코드의 공유 부분과 플랫폼별 부분을 구분하는 방법, 그리고 이 공유 코드가 작동할 플랫폼을 지정하는 방법을 설명합니다.

또한 공통 코드(common code), 타깃(targets), 플랫폼별 및 중간 소스 세트(intermediate source sets), 테스트 통합과 같은 Kotlin Multiplatform 프로젝트 설정의 핵심 개념도 배우게 됩니다. 이는 향후 멀티플랫폼 프로젝트를 설정하는 데 도움이 될 것입니다.

여기에 제시된 모델은 Kotlin에서 실제로 사용하는 모델에 비해 단순화된 형태입니다. 그러나 이 기본 모델만으로도 대부분의 경우에 충분합니다.

## 공통 코드 (Common code) {id="common-code"}

_공통 코드(Common code)_는 서로 다른 플랫폼 간에 공유되는 Kotlin 코드입니다.

간단한 "Hello, World" 예제를 살펴보겠습니다.

```kotlin
fun greeting() {
    println("Hello, Kotlin Multiplatform!")
}
```

플랫폼 간에 공유되는 Kotlin 코드는 일반적으로 `commonMain` 디렉터리에 위치합니다. 코드 파일의 위치는 이 코드가 컴파일되는 플랫폼 목록에 영향을 미치므로 매우 중요합니다.

Kotlin 컴파일러는 소스 코드를 입력받아 결과물로 플랫폼별 바이너리 세트를 생성합니다. 멀티플랫폼 프로젝트를 컴파일할 때, 컴파일러는 동일한 코드로부터 여러 바이너리를 생성할 수 있습니다. 예를 들어, 컴파일러는 동일한 Kotlin 파일로부터 JVM `.class` 파일과 네이티브 실행 파일을 생성할 수 있습니다.

![공통 코드](common-code-diagram.svg){width=700}

모든 Kotlin 코드가 모든 플랫폼으로 컴파일될 수 있는 것은 아닙니다. Kotlin 컴파일러는 공통 코드에 포함된 코드가 다른 플랫폼으로 컴파일될 수 없는 경우, 공통 코드에서 플랫폼별 함수나 클래스를 사용하지 못하도록 방지합니다.

예를 들어, 공통 코드에서는 `java.io.File` 종속성을 사용할 수 없습니다. 이는 JDK의 일부이지만, 공통 코드는 JDK 클래스를 사용할 수 없는 네이티브 코드로도 컴파일되기 때문입니다.

![확인되지 않은 Java 참조](unresolved-java-reference.png){width=500}

공통 코드에서는 Kotlin Multiplatform 라이브러리를 사용할 수 있습니다. 이러한 라이브러리는 서로 다른 플랫폼에서 다르게 구현될 수 있는 공통 API를 제공합니다. 이 경우 플랫폼별 API는 추가적인 부분으로 동작하며, 공통 코드에서 이러한 API를 사용하려고 하면 오류가 발생합니다.

예를 들어 `kotlinx.coroutines`는 모든 타깃을 지원하는 Kotlin Multiplatform 라이브러리이지만, `fun CoroutinesDispatcher.asExecutor(): Executor`와 같이 `kotlinx.coroutines`의 동시성 프리미티브를 JDK 동시성 프리미티브로 변환하는 플랫폼별 파트도 포함되어 있습니다. 이러한 추가 API 부분은 `commonMain`에서 사용할 수 없습니다.

사용 가능한 Kotlin Multiplatform 라이브러리를 살펴보려면 [klibs.io](https://klibs.io)를 참조하세요.

## 타깃 (Targets) {id="targets"}

타깃은 Kotlin이 공통 코드를 컴파일할 플랫폼을 정의합니다. 예를 들어 JVM, JS, Android, iOS 또는 Linux가 될 수 있습니다. 이전 예제에서는 공통 코드를 JVM 및 네이티브 타깃으로 컴파일했습니다.

_Kotlin 타깃_은 컴파일 대상을 설명하는 식별자입니다. 타깃은 생성되는 바이너리의 형식, 사용 가능한 언어 구조, 허용되는 종속성을 정의합니다.

> 타깃은 플랫폼이라고 부르기도 합니다.
> 전체 [지원 타깃 목록](multiplatform-dsl-reference.md#targets)을 참조하세요.
>
{style="note"}

Kotlin이 특정 타깃용 코드를 컴파일하도록 지시하려면 먼저 타깃을 _선언_해야 합니다. Gradle에서는 `kotlin {}` 블록 내부에서 사전 정의된 DSL 호출을 사용하여 타깃을 선언합니다.

```kotlin
kotlin {
    jvm() // JVM 타깃을 선언합니다
    iosArm64() // 64비트 iPhone에 해당하는 타깃을 선언합니다
}
```

이러한 방식으로 각 멀티플랫폼 프로젝트는 지원되는 타깃 세트를 정의합니다. 빌드 스크립트에서 타깃을 선언하는 방법에 대한 자세한 내용은 [계층적 프로젝트 구조](multiplatform-hierarchy.md) 섹션을 참조하세요.

`jvm` 및 `iosArm64` 타깃이 선언되면 `commonMain`의 공통 코드가 이 타깃들로 컴파일됩니다.

![타깃](target-diagram.svg){width=700}

어떤 코드가 특정 타깃으로 컴파일되는지 이해하려면, 타깃을 Kotlin 소스 파일에 부착된 라벨로 생각할 수 있습니다. Kotlin은 이러한 라벨을 사용하여 코드를 컴파일하는 방법, 생성할 바이너리, 그리고 해당 코드에서 허용되는 언어 구조 및 종속성을 결정합니다.

> 프로젝트에 단일 타깃(예: JVM)만 있는 경우,
> 공통 코드에서 적절한 가시성을 가진 타깃 전용 심볼에 접근할 수 있습니다.
> 하지만 두 번째 타깃을 추가하는 즉시
> 공통 코드에서는 타깃 전용 심볼을 사용할 수 없게 됩니다.
> 마이그레이션이나 기타 중간 프로젝트 상태에서는 이 제한 사항을 염두에 두세요.
> 
{style="note"}

`greeting.kt` 파일을 `.js`로도 컴파일하려면 JS 타깃만 선언하면 됩니다. 그러면 `commonMain`의 코드는 JS 타깃에 해당하는 추가 `js` 라벨을 받게 되며, 이는 Kotlin에 `.js` 파일을 생성하도록 지시합니다.

![타깃 라벨](target-labels-diagram.svg){width=700}

이것이 Kotlin 컴파일러가 선언된 모든 타깃으로 컴파일되는 공통 코드를 처리하는 방식입니다. 플랫폼별 코드를 작성하는 방법을 알아보려면 [소스 세트](#source-sets)를 참조하세요.

## 소스 세트 (Source sets) {id="source-sets"}

_Gradle 소스 세트_는 고유한 타깃, 종속성 및 컴파일러 옵션을 갖는 소스 파일 세트입니다. 이는 멀티플랫폼 프로젝트에서 코드를 공유하는 주된 방식입니다.

멀티플랫폼 프로젝트의 각 소스 세트는 다음 특징을 갖습니다.

* 지정된 프로젝트 내에서 고유한 이름을 가집니다.
* 일반적으로 소스 세트 이름의 디렉터리에 저장되는 소스 파일 및 리소스 세트를 포함합니다.
* 이 소스 세트의 코드가 컴파일되는 타깃 세트를 지정합니다. 이러한 타깃은 이 소스 세트에서 사용 가능한 언어 구조와 종속성에 영향을 미칩니다.
* 자체 종속성과 컴파일러 옵션을 정의합니다.

Kotlin Multiplatform은 사전 정의된 여러 소스 세트를 제공합니다. 그중 하나가 `commonMain`이며, 이는 모든 멀티플랫폼 프로젝트에 존재하고 선언된 모든 타깃으로 컴파일됩니다.

Kotlin Multiplatform 프로젝트에서는 `src` 내부의 디렉터리로 소스 세트를 다루게 됩니다.
예를 들어 `commonMain`, `iosMain`, `androidMain` 소스 세트를 포함하는 `shared` 모듈은 다음과 같은 구조를 갖습니다.

![공유 소스](src-directory-diagram.png){width=350}

공유 모듈이 Android 라이브러리로 빌드될 때 공통 Kotlin 코드는 Kotlin/JVM으로 처리됩니다.
iOS 프레임워크로 빌드될 때 공통 Kotlin 코드는 Kotlin/Native로 처리됩니다.

![공통 Kotlin, Kotlin/JVM, 그리고 Kotlin/Native](modules-structure.png)

Gradle 스크립트에서는 `kotlin.sourceSets {}` 블록 내부에서 이름으로 소스 세트에 접근합니다.

```kotlin
kotlin {
    // 타깃 선언:
    // …

    // 소스 세트 선언:
    sourceSets {
        commonMain {
            // commonMain 소스 세트 구성
        }
    }
}
```

`commonMain` 외에 다른 소스 세트는 플랫폼별(platform-specific) 소스 세트이거나 중간(intermediate) 소스 세트일 수 있습니다.

### 플랫폼별 소스 세트 (Platform-specific source sets) {id="platform-specific-source-sets"}

공통 코드만 사용하는 것이 편리하긴 하지만, 항상 가능한 것은 아닙니다. `commonMain`의 코드는 선언된 모든 타깃으로 컴파일되므로, Kotlin은 그곳에서 플랫폼별 API를 사용하는 것을 허용하지 않습니다.

네이티브 및 JS 타깃이 있는 멀티플랫폼 프로젝트에서는 `commonMain`의 다음 코드가 컴파일되지 않습니다.

```kotlin
// commonMain/kotlin/common.kt
// 공통 코드에서는 컴파일되지 않음
fun greeting() {
    java.io.File("greeting.txt").writeText("Hello, Multiplatform!")
}
```

해결책으로 Kotlin은 플랫폼별 소스 세트(플랫폼 소스 세트라고도 함)를 생성합니다. 각 타깃에는 해당 타깃 전용으로만 컴파일되는 플랫폼 소스 세트가 있습니다. 예를 들어 `jvm` 타깃에는 JVM 전용으로만 컴파일되는 해당 `jvmMain` 소스 세트가 있습니다. Kotlin은 이러한 소스 세트에서 플랫폼별 종속성을 사용하는 것을 허용합니다(예: `jvmMain`에서의 JDK).

```kotlin
// jvmMain/kotlin/jvm.kt
// `jvmMain` 소스 세트에서는 Java 종속성을 사용할 수 있습니다
fun jvmGreeting() {
    java.io.File("greeting.txt").writeText("Hello, Multiplatform!")
}
```

### 특정 타깃으로의 컴파일 {id="compilation-to-a-specific-target"}

특정 타깃으로의 컴파일은 여러 소스 세트와 함께 작동합니다. Kotlin이 멀티플랫폼 프로젝트를 특정 타깃으로 컴파일할 때, 이 타깃으로 라벨이 지정된 모든 소스 세트를 수집하여 이들로부터 바이너리를 생성합니다.

`jvm`, `iosArm64`, `js` 타깃이 있는 예제를 살펴보겠습니다. Kotlin은 공통 코드를 위한 `commonMain` 소스 세트와 특정 타깃을 위한 해당 `jvmMain`, `iosArm64Main`, `jsMain` 소스 세트를 생성합니다.

![특정 타깃으로의 컴파일](specific-target-diagram.svg){width=700}

JVM으로 컴파일하는 동안 Kotlin은 "JVM" 라벨이 붙은 모든 소스 세트, 즉 `jvmMain`과 `commonMain`을 선택합니다. 그런 다음 이들을 함께 JVM 클래스 파일로 컴파일합니다.

![JVM으로 컴파일](compilation-jvm-diagram.svg){width=700}

Kotlin은 `commonMain`과 `jvmMain`을 함께 컴파일하므로 결과 바이너리에는 `commonMain`과 `jvmMain` 모두의 선언이 포함됩니다.

멀티플랫폼 프로젝트로 작업할 때 다음 사항을 기억하세요.

* Kotlin이 특정 플랫폼용으로 코드를 컴파일하도록 하려면 해당 타깃을 선언하세요.
* 코드를 저장할 디렉터리나 소스 파일을 선택하려면, 먼저 코드를 어떤 타깃 간에 공유할지 결정하세요.

    * 코드가 모든 타깃 간에 공유되는 경우 `commonMain`에 선언해야 합니다.
    * 코드가 단 하나의 타깃에만 사용되는 경우 해당 타깃의 플랫폼별 소스 세트(예: JVM의 경우 `jvmMain`)에 정의해야 합니다.
* 플랫폼별 소스 세트에 작성된 코드는 공통 소스 세트의 선언에 접근할 수 있습니다. 예를 들어 `jvmMain`의 코드는 `commonMain`의 코드를 사용할 수 있습니다. 그러나 그 반대는 불가능합니다. 즉, `commonMain`은 `jvmMain`의 코드를 사용할 수 없습니다.
* 플랫폼별 소스 세트에 작성된 코드는 해당 플랫폼 종속성을 사용할 수 있습니다. 예를 들어 `jvmMain`의 코드는 [Guava](https://github.com/google/guava) 또는 [Spring](https://spring.io/)과 같은 Java 전용 라이브러리를 사용할 수 있습니다.

### 중간 소스 세트 (Intermediate source sets) {id="intermediate-source-sets"}

단순한 멀티플랫폼 프로젝트에는 보통 공통 코드와 플랫폼별 코드만 있습니다.
`commonMain` 소스 세트는 선언된 모든 타깃 간에 공유되는 공통 코드를 나타냅니다. `jvmMain`과 같은 플랫폼별 소스 세트는 각 타깃으로만 컴파일되는 플랫폼별 코드를 나타냅니다.

실무에서는 더 세분화된 코드 공유가 필요한 경우가 많습니다.

모든 최신 Apple 기기와 Android 기기를 타깃으로 해야 하는 예제를 살펴보겠습니다.

```kotlin
kotlin {
    android()
    iosArm64()   // 64비트 iPhone 기기
    macosArm64() // 최신 Apple Silicon 기반 Mac
    watchosArm64() // 최신 64비트 Apple Watch 기기
    tvosArm64()  // 최신 Apple TV 기기  
}
```

그리고 모든 Apple 기기용 UUID를 생성하는 함수를 추가할 소스 세트가 필요합니다.

```kotlin
import platform.Foundation.NSUUID

fun randomUuidString(): String {
    // Apple 전용 API에 접근하고자 함
    return NSUUID().UUIDString()
}
```

이 함수는 `commonMain`에 추가할 수 없습니다. `commonMain`은 Android를 포함하여 선언된 모든 타깃으로 컴파일되지만, `platform.Foundation.NSUUID`는 Android에서 사용할 수 없는 Apple 전용 API이기 때문입니다. `commonMain`에서 `NSUUID`를 참조하려고 하면 Kotlin에서 오류가 발생합니다.

이 코드를 `iosArm64Main`, `macosArm64Main`, `watchosArm64Main`, `tvosArm64Main`과 같은 각 Apple 전용 소스 세트에 복사하여 붙여넣을 수도 있습니다. 하지만 이러한 코드 중복은 오류가 발생하기 쉬우므로 권장되지 않는 접근 방식입니다.

이 문제를 해결하기 위해 _중간 소스 세트(intermediate source sets)_를 사용할 수 있습니다. 중간 소스 세트는 프로젝트의 전체 타깃이 아닌 일부 타깃으로만 컴파일되는 Kotlin 소스 세트입니다. 중간 소스 세트는 계층적 소스 세트(hierarchical source sets) 또는 단순히 계층 구조(hierarchies)라고 불리기도 합니다.

Kotlin은 기본적으로 몇 가지 중간 소스 세트를 생성합니다. 이 구체적인 사례에서 결과 프로젝트 구조는 다음과 같습니다.

![중간 소스 세트](intermediate-source-sets-diagram.svg){width=700}

여기서 하단의 알록달록한 블록들은 플랫폼별 소스 세트입니다. 명확성을 위해 타깃 라벨은 생략되었습니다.

`appleMain` 블록은 Apple 전용 타깃으로 컴파일되는 코드를 공유하기 위해 Kotlin이 생성한 중간 소스 세트입니다. `appleMain` 소스 세트는 Apple 타깃으로만 컴파일됩니다. 따라서 Kotlin은 `appleMain`에서 Apple 전용 API의 사용을 허용하며, 여기에 `randomUUID()` 함수를 추가할 수 있습니다.

> Kotlin이 기본적으로 생성하고 설정하는 모든 중간 소스 세트를 확인하고,
> 필요한 중간 소스 세트를 기본적으로 제공하지 않을 때 어떻게 해야 하는지 알아보려면
> [계층적 프로젝트 구조](multiplatform-hierarchy.md)를 참조하세요.
>
{style="tip"}

특정 타깃으로 컴파일하는 동안 Kotlin은 이 타깃으로 라벨이 지정된 중간 소스 세트를 포함한 모든 소스 세트를 가져옵니다. 따라서 `commonMain`, `appleMain`, `iosArm64Main` 소스 세트에 작성된 모든 코드는 `iosArm64` 플랫폼 타깃으로 컴파일되는 동안 결합됩니다.

![네이티브 실행 파일](multiplatform-executables-diagram.svg){width=700}

> 일부 소스 세트에 소스가 없어도 괜찮습니다. 예를 들어 iOS 개발에서는 일반적으로 iOS 시뮬레이터가 아닌 iOS 기기 전용 코드를 제공해야 할 필요가 거의 없습니다. 따라서 `iosArm64Main`은 거의 사용되지 않습니다.
>
{style="tip"}

#### Apple 기기 및 시뮬레이터 타깃 {initial-collapse-state="collapsed" collapsible="true" id="apple-device-and-simulator-targets"}

Kotlin Multiplatform을 사용하여 iOS 모바일 애플리케이션을 개발할 때는 보통 `iosMain` 소스 세트로 작업합니다. 단일 `ios` 타깃을 위한 플랫폼별 소스 세트라고 생각할 수도 있지만, 단일 `ios` 타깃이라는 것은 존재하지 않습니다. 대부분의 모바일 프로젝트에는 최소 두 개의 타깃이 필요합니다.

* **디바이스 타깃(Device target)**은 iOS 기기에서 실행할 수 있는 바이너리를 생성하는 데 사용됩니다. 현재 iOS용 디바이스 타깃은 `iosArm64` 하나뿐입니다.
* **시뮬레이터 타깃(Simulator target)**은 사용자의 머신에서 실행되는 iOS 시뮬레이터용 바이너리를 생성하는 데 사용됩니다. Apple Silicon Mac 컴퓨터를 사용하는 경우 시뮬레이터 타깃으로 `iosSimulatorArm64`를 선택하세요.

`iosArm64` 디바이스 타깃만 선언하면 로컬 머신에서 애플리케이션과 테스트를 실행하고 디버깅할 수 없습니다.

iOS 기기와 시뮬레이터용 Kotlin 코드는 보통 동일하므로 `iosArm64Main` 및 `iosSimulatorArm64Main`과 같은 플랫폼별 소스 세트는 일반적으로 비어 있습니다. 이들 모두 간에 코드를 공유하기 위해 `iosMain` 중간 소스 세트만 사용할 수 있습니다.

Mac이 아닌 다른 Apple 타깃에도 동일하게 적용됩니다. 예를 들어 Apple TV용 `tvosArm64` 디바이스 타깃과 Apple Silicon 기기의 Apple TV 시뮬레이터용 `tvosSimulatorArm64` 시뮬레이터 타깃이 있는 경우, 이들 모두에 대해 `tvosMain` 중간 소스 세트를 사용할 수 있습니다.

## 테스트와의 통합 {id="integration-with-tests"}

실제 프로젝트에서는 메인 프로덕션 코드와 함께 테스트도 필요합니다. 이것이 기본적으로 생성되는 모든 소스 세트에 `Main` 및 `Test` 접미사가 붙는 이유입니다. `Main`에는 프로덕션 코드가 포함되고, `Test`에는 이 코드에 대한 테스트가 포함됩니다. 둘 사이의 연결은 자동으로 설정되며, 테스트는 추가 설정 없이 `Main` 코드에서 제공하는 API를 사용할 수 있습니다.

`Test` 소스 세트는 `Main`과 유사한 대응 소스 세트입니다. 예를 들어 `commonTest`는 `commonMain`의 대응 소스 세트이며 선언된 모든 타깃으로 컴파일되므로 공통 테스트를 작성할 수 있습니다. `jvmTest`와 같은 플랫폼별 테스트 소스 세트는 플랫폼별 테스트(예: JVM 전용 테스트 또는 JVM API가 필요한 테스트)를 작성하는 데 사용됩니다.

공통 테스트를 작성하기 위한 소스 세트 외에도 멀티플랫폼 테스트 프레임워크가 필요합니다. Kotlin은 `@kotlin.Test` 어노테이션과 `assertEquals`, `assertTrue`와 같은 다양한 단언(assertion) 메서드가 포함된 기본 [`kotlin.test`](https://kotlinlang.org/api/latest/kotlin.test/) 라이브러리를 제공합니다.

각 플랫폼의 소스 세트에서 일반적인 테스트를 작성하듯 플랫폼별 테스트를 작성할 수 있습니다. 메인 코드와 마찬가지로 각 소스 세트에 대해 JVM의 경우 `JUnit`, iOS의 경우 `XCTest`와 같은 플랫폼별 종속성을 가질 수 있습니다. 특정 타깃에 대한 테스트를 실행하려면 `<targetName>Test` 태스크를 사용하세요.

멀티플랫폼 테스트를 생성하고 실행하는 방법은 [멀티플랫폼 앱 테스트 튜토리얼](multiplatform-run-tests.md)에서 확인하세요.

## 다음 단계 {id="what-s-next"}

* [Gradle 스크립트에서 사전 정의된 소스 세트를 선언하고 사용하는 방법 알아보기](multiplatform-hierarchy.md)
* [멀티플랫폼 프로젝트 구조의 고급 개념 살펴보기](multiplatform-advanced-project-structure.md)
* [타깃 컴파일 및 커스텀 컴파일 생성에 대해 자세히 알아보기](multiplatform-configure-compilations.md)