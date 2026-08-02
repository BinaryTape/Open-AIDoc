[//]: # (title: 멀티플랫폼 프로젝트 구조의 심화 개념)

이 문서는 Kotlin 멀티플랫폼 프로젝트 구조의 심화 개념과 이것이 Gradle 구현에 어떻게 매핑되는지 설명합니다. 이 정보는 Gradle 빌드의 로우레벨 추상화(설정(configurations), 태스크(tasks), 발행(publications) 등)를 다뤄야 하거나 Kotlin 멀티플랫폼 빌드용 Gradle 플러그인을 개발하려는 경우에 유용합니다.

이 페이지는 다음과 같은 경우에 도움이 될 수 있습니다.

* Kotlin이 자동으로 소스 세트를 생성하지 않는 타겟 세트 간에 코드를 공유해야 하는 경우.
* Kotlin 멀티플랫폼 빌드용 Gradle 플러그인을 만들고 싶거나, 설정, 태스크, 발행 등 Gradle 빌드의 로우레벨 추상화를 작업해야 하는 경우.

멀티플랫폼 프로젝트의 종속성 관리에서 이해해야 할 중요한 점 중 하나는 Gradle 스타일의 프로젝트 또는 라이브러리 종속성과 Kotlin 고유의 소스 세트 간 `dependsOn` 관계의 차이점입니다.

* `dependsOn`은 공통 소스 세트와 플랫폼 전용 소스 세트 사이의 관계로, [소스 세트 계층 구조](#dependson-및-소스-세트-계층-구조)를 형성하고 멀티플랫폼 프로젝트 전반에서 코드를 공유할 수 있게 합니다. 기본 소스 세트의 경우 계층 구조가 자동으로 관리되지만, 특정 상황에서는 이를 변경해야 할 수도 있습니다.
* 라이브러리 및 프로젝트 종속성은 일반적으로 평소와 같이 작동하지만, 멀티플랫폼 프로젝트에서 이를 적절히 관리하려면 컴파일에 사용되는 세분화된 **소스 세트 → 소스 세트** 종속성으로 [Gradle 종속성이 해결(resolve)되는 방식](#다른-라이브러리-또는-프로젝트에-대한-종속성)을 이해해야 합니다.

> 심화 개념을 살펴보기 전에 [멀티플랫폼 프로젝트 구조의 기초](multiplatform-discover-project.md)를 먼저 익히는 것을 권장합니다.
>
{style="tip"}

## dependsOn 및 소스 세트 계층 구조

일반적으로는 _종속성(dependencies)_을 직접 다루게 되며 `dependsOn` 관계를 직접 다루는 일은 드뭅니다. 하지만 `dependsOn`을 살펴보는 것은 Kotlin 멀티플랫폼 프로젝트가 내부적으로 어떻게 작동하는지 이해하는 데 매우 중요합니다.

`dependsOn`은 두 Kotlin 소스 세트 사이의 Kotlin 전용 관계입니다. 이는 예를 들어 `jvmMain` 소스 세트가 `commonMain`에 의존하거나, `iosArm64Main`이 `iosMain`에 의존하는 등 공통 소스 세트와 플랫폼 전용 소스 세트 사이의 연결이 될 수 있습니다.

Kotlin 소스 세트 `A`와 `B`가 있는 일반적인 예시를 생각해 보겠습니다. `A.dependsOn(B)` 표현식은 Kotlin에 다음을 지시합니다.

1. `A`는 `internal` 선언을 포함하여 `B`의 API를 볼 수 있습니다.
2. `A`는 `B`의 예상 선언(expected declarations)에 대한 실제 구현(actual implementations)을 제공할 수 있습니다. 이는 필요충분조건으로, `A`가 직접 또는 간접적으로 `B`에 `dependsOn` 관계를 가질 때만 `A`는 `B`에 대한 `actual`을 제공할 수 있습니다.
3. `B`는 자신의 타겟뿐만 아니라 `A`가 컴파일되는 모든 타겟으로 컴파일되어야 합니다.
4. `A`는 `B`의 모든 일반 종속성을 상속합니다.

`dependsOn` 관계는 소스 세트 계층 구조라고 알려진 트리와 같은 구조를 생성합니다. 다음은 `android`, `iosArm64`(iPhone 기기), `iosSimulatorArm64`(Apple Silicon Mac용 iPhone 시뮬레이터)를 사용하는 일반적인 모바일 개발용 프로젝트의 예입니다.

![DependsOn 트리 구조](dependson-tree-diagram.svg){width=700}

화살표는 `dependsOn` 관계를 나타냅니다.
이러한 관계는 플랫폼 바이너리 컴파일 중에 유지됩니다. 이를 통해 Kotlin은 `iosMain`이 `commonMain`의 API는 볼 수 있어야 하지만 `iosArm64Main`의 API는 볼 수 없어야 함을 이해합니다.

![컴파일 중 dependsOn 관계](dependson-relations-diagram.svg){width=700}

`dependsOn` 관계는 `KotlinSourceSet.dependsOn(KotlinSourceSet)` 호출로 구성됩니다. 예시는 다음과 같습니다.

```kotlin
kotlin {
    // 타겟 선언
    sourceSets {
        // dependsOn 관계 구성 예시 
        iosArm64Main.dependsOn(commonMain)
    }
}
```

* 이 예시는 빌드 스크립트에서 `dependsOn` 관계를 정의하는 방법을 보여줍니다. 하지만 Kotlin Gradle 플러그인이 기본적으로 소스 세트를 생성하고 이러한 관계를 설정하므로, 수동으로 설정할 필요는 없습니다.
* `dependsOn` 관계는 빌드 스크립트의 `dependencies {}` 블록과 별도로 선언됩니다. 이는 `dependsOn`이 일반적인 종속성이 아니라 서로 다른 타겟 간에 코드를 공유하는 데 필요한 Kotlin 소스 세트 간의 특수한 관계이기 때문입니다.

발행된 라이브러리나 다른 Gradle 프로젝트에 대한 일반적인 종속성을 선언하는 데 `dependsOn`을 사용할 수 없습니다. 예를 들어, `commonMain`이 `kotlinx-coroutines-core` 라이브러리의 `commonMain`에 의존하도록 설정하거나 `commonTest.dependsOn(commonMain)`을 호출할 수 없습니다.

### 사용자 정의 소스 세트 선언

경우에 따라 프로젝트에 사용자 정의 중간 소스 세트가 필요할 수 있습니다.
JVM, JS, Linux로 컴파일되는 프로젝트에서 JVM과 JS 간에만 일부 소스를 공유하고 싶은 경우를 가정해 보겠습니다. 이 경우 [멀티플랫폼 프로젝트 구조의 기초](multiplatform-discover-project.md)에서 설명한 대로 이 타겟 쌍에 대한 특정 소스 세트를 찾아야 합니다.

Kotlin은 이러한 소스 세트를 자동으로 생성하지 않습니다. 즉, `by creating` 구문을 사용하여 수동으로 생성해야 합니다.

```kotlin
kotlin {
    jvm()
    js()
    linuxX64()

    sourceSets {
        // "jvmAndJs"라는 이름의 소스 세트 생성
        val jvmAndJsMain by creating {
            // …
        }
    }
}
```

하지만 Kotlin은 여전히 이 소스 세트를 어떻게 처리하거나 컴파일해야 할지 모릅니다. 다이어그램을 그려보면 이 소스 세트는 격리되어 있으며 타겟 레이블이 없을 것입니다.

![누락된 dependsOn 관계](missing-dependson-diagram.svg){width=700}

이를 해결하려면 여러 `dependsOn` 관계를 추가하여 `jvmAndJsMain`을 계층 구조에 포함시켜야 합니다.

```kotlin
kotlin {
    jvm()
    js()
    linuxX64()

    sourceSets {
        val jvmAndJsMain by creating {
            // commonMain에 대한 dependsOn 추가를 잊지 마세요
            dependsOn(commonMain.get())
        }

        jvmMain {
            dependsOn(jvmAndJsMain)
        }

        jsMain {
            dependsOn(jvmAndJsMain)
        }
    }
}
```

여기서 `jvmMain.dependsOn(jvmAndJsMain)`은 JVM 타겟을 `jvmAndJsMain`에 추가하고, `jsMain.dependsOn(jvmAndJsMain)`은 JS 타겟을 `jvmAndJsMain`에 추가합니다.

최종 프로젝트 구조는 다음과 같습니다.

![최종 프로젝트 구조](final-structure-diagram.svg){width=700}

> `dependsOn` 관계를 수동으로 구성하면 기본 계층 구조 템플릿의 자동 적용이 비활성화됩니다. 이러한 사례와 처리 방법은 [추가 구성](multiplatform-hierarchy.md#additional-configuration)을 참조하세요.
>
{style="note"}

## 다른 라이브러리 또는 프로젝트에 대한 종속성

멀티플랫폼 프로젝트에서는 발행된 라이브러리나 다른 Gradle 프로젝트에 대해 일반적인 종속성을 설정할 수 있습니다.

Kotlin 멀티플랫폼은 일반적으로 전형적인 Gradle 방식으로 종속성을 선언합니다. Gradle과 유사하게 다음을 수행합니다.

* 빌드 스크립트에서 `dependencies {}` 블록을 사용합니다.
* `implementation` 또는 `api`와 같이 종속성에 적절한 범위를 선택합니다.
* 레포지토리에 발행된 경우 `"com.google.guava:guava:32.1.2-jre"`와 같이 좌표를 지정하거나, 동일한 빌드 내의 Gradle 프로젝트인 경우 `project(":utils:concurrency")`와 같이 경로를 지정하여 종속성을 참조합니다.

멀티플랫폼 프로젝트의 종속성 구성에는 몇 가지 특별한 기능이 있습니다. 각 Kotlin 소스 세트에는 자체 `dependencies {}` 블록이 있습니다. 이를 통해 플랫폼 전용 소스 세트에 플랫폼 전용 종속성을 선언할 수 있습니다.

```kotlin
kotlin {
    // 타겟 선언
    sourceSets {
        jvmMain.dependencies {
            // jvmMain의 종속성이므로 JVM 전용 종속성을 추가해도 괜찮습니다
            implementation("com.google.guava:guava:32.1.2-jre")
        }
    }
}
```

공통 종속성은 좀 더 까다롭습니다. `kotlinx.coroutines`와 같은 멀티플랫폼 라이브러리에 대한 종속성을 선언하는 멀티플랫폼 프로젝트를 가정해 보겠습니다.

```kotlin
kotlin {
    android()     // Android
    iosArm64()          // iPhone 기기 
    iosSimulatorArm64() // Apple Silicon Mac용 iPhone 시뮬레이터

    sourceSets {
        commonMain.dependencies {
            implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")
        }
    }
}
```

종속성 해결(dependency resolution)에는 세 가지 중요한 개념이 있습니다.

1. 멀티플랫폼 종속성은 `dependsOn` 구조를 따라 아래로 전파됩니다. `commonMain`에 종속성을 추가하면 `commonMain`에 직접 또는 간접적으로 `dependsOn` 관계를 선언하는 모든 소스 세트에 자동으로 추가됩니다.

   이 경우 종속성은 실제로 모든 `*Main` 소스 세트(`iosMain`, `jvmMain`, `iosSimulatorArm64Main`, `iosArm64Main`)에 자동으로 추가되었습니다. 이러한 모든 소스 세트는 `commonMain` 소스 세트에서 `kotlin-coroutines-core` 종속성을 상속하므로 모든 소스 세트에 수동으로 복사하여 붙여넣을 필요가 없습니다.

   ![멀티플랫폼 종속성 전파](dependency-propagation-diagram.svg){width=700}

   > 전파 메커니즘을 사용하면 특정 소스 세트를 선택하여 선언된 종속성을 수신할 범위를 선택할 수 있습니다. 예를 들어 Android가 아닌 iOS에서만 `kotlinx.coroutines`를 사용하고 싶다면 `iosMain`에만 이 종속성을 추가할 수 있습니다.
   >
   {style="tip"}

2. 위 예시의 `commonMain`에서 `org.jetbrians.kotlinx:kotlinx-coroutines-core:1.7.3`으로의 종속성과 같은 _소스 세트 → 멀티플랫폼 라이브러리_ 종속성은 종속성 해결의 중간 상태를 나타냅니다. 해결의 최종 상태는 항상 _소스 세트 → 소스 세트_ 종속성으로 표시됩니다.

   > 최종 _소스 세트 → 소스 세트_ 종속성은 `dependsOn` 관계가 아닙니다.
   >
   {style="note"}

   세분화된 _소스 세트 → 소스 세트_ 종속성을 추론하기 위해 Kotlin은 각 멀티플랫폼 라이브러리와 함께 발행된 소스 세트 구조를 읽습니다. 이 단계가 끝나면 각 라이브러리는 내부적으로 전체가 아닌 소스 세트의 컬렉션으로 표시됩니다. `kotlinx-coroutines-core`에 대한 다음 예를 참조하세요.

   ![소스 세트 구조의 직렬화](structure-serialization-diagram.svg){width=700}

3. Kotlin은 각 종속성 관계를 가져와 종속성으로부터 소스 세트 컬렉션으로 해결합니다. 해당 컬렉션의 각 종속성 소스 세트는 _호환되는 타겟_을 가져야 합니다. 종속성 소스 세트가 소비 소스 세트와 _최소한 동일한 타겟_으로 컴파일되는 경우 호환되는 타겟을 가진 것으로 간주합니다.

   샘플 프로젝트의 `commonMain`이 `android`, `iosArm64`, `iosSimulatorArm64`로 컴파일되는 예를 들어보겠습니다.

    * 먼저, `kotlinx-coroutines-core.commonMain`에 대한 종속성을 해결합니다. 이는 `kotlinx-coroutines-core`가 가능한 모든 Kotlin 타겟으로 컴파일되기 때문에 발생합니다. 따라서 해당 `commonMain`은 필요한 `android`, `iosArm64`, `iosSimulatorArm64`를 포함하여 가능한 모든 타겟으로 컴파일됩니다.
    * 둘째, `commonMain`은 `kotlinx-coroutines-core.concurrentMain`에 의존합니다. `kotlinx-coroutines-core`의 `concurrentMain`은 JS를 제외한 모든 타겟으로 컴파일되므로 소비 프로젝트 `commonMain`의 타겟과 일치합니다.

   하지만 코루틴의 `iosArm64Main`과 같은 소스 세트는 소비자의 `commonMain`과 호환되지 않습니다. `iosArm64Main`이 `commonMain`의 타겟 중 하나인 `iosArm64`로 컴파일되더라도 `android`나 `iosSimulatorArm64`로는 컴파일되지 않기 때문입니다.

   종속성 해결 결과는 `kotlinx-coroutines-core`의 코드 중 어떤 것이 표시될지에 직접적인 영향을 미칩니다.

   ![공통 코드에서 JVM 전용 API 사용 시 오류](dependency-resolution-error.png){width=700}

### 소스 세트 간 공통 종속성 버전 정렬

Kotlin 멀티플랫폼 프로젝트에서 공통 소스 세트는 klib을 생성하기 위해, 그리고 구성된 각 [컴파일(compilation)](multiplatform-configure-compilations.md)의 일부로서 여러 번 컴파일됩니다. 일관된 바이너리를 생성하기 위해 공통 코드는 매번 동일한 버전의 멀티플랫폼 종속성을 대상으로 컴파일되어야 합니다. Kotlin Gradle 플러그인은 이러한 종속성을 정렬하여 각 소스 세트에 대해 유효한 종속성 버전이 동일하도록 보장합니다.

위의 예에서 `androidMain` 소스 세트에 `androidx.navigation:navigation-compose:2.7.7` 종속성을 추가하고 싶다고 가정해 보겠습니다. 프로젝트는 `commonMain` 소스 세트에 대해 `kotlinx-coroutines-core:1.7.3` 종속성을 명시적으로 선언하지만, 2.7.7 버전의 Compose Navigation 라이브러리는 Kotlin 코루틴 1.8.0 이상을 필요로 합니다.

`commonMain`과 `androidMain`이 함께 컴파일되므로 Kotlin Gradle 플러그인은 두 가지 버전의 코루틴 라이브러리 중에서 선택하여 `commonMain` 소스 세트에 `kotlinx-coroutines-core:1.8.0`을 적용합니다. 하지만 공통 코드가 구성된 모든 타겟에서 일관되게 컴파일되도록 하려면 iOS 소스 세트도 동일한 종속성 버전으로 제한되어야 합니다. 따라서 Gradle은 `kotlinx.coroutines-*:1.8.0` 종속성을 `iosMain` 소스 세트에도 전파합니다.

![*Main 소스 세트 간 종속성 정렬](multiplatform-source-set-dependency-alignment.svg){width=700}

종속성은 `*Main` 소스 세트와 [`*Test` 소스 세트](multiplatform-discover-project.md#테스트와의-통합) 전체에서 별도로 정렬됩니다. `*Test` 소스 세트에 대한 Gradle 구성에는 `*Main` 소스 세트의 모든 종속성이 포함되지만 그 반대는 아닙니다. 따라서 메인 코드에 영향을 주지 않고 더 최신 라이브러리 버전으로 프로젝트를 테스트할 수 있습니다.

예를 들어 `*Main` 소스 세트에 Kotlin 코루틴 1.7.3 종속성이 있고 프로젝트의 모든 소스 세트로 전파되었다고 가정해 보겠습니다. 하지만 `iosTest` 소스 세트에서는 새로운 라이브러리 릴리스를 테스트하기 위해 버전을 1.8.0으로 업그레이드하기로 결정합니다. 동일한 알고리즘에 따라 이 종속성은 `*Test` 소스 세트 트리를 통해 전파되므로 모든 `*Test` 소스 세트는 `kotlinx.coroutines-*:1.8.0` 종속성과 함께 컴파일됩니다.

![메인 소스 세트와 별도로 종속성을 해결하는 테스트 소스 세트](test-main-source-set-dependency-alignment.svg)

## 컴파일 (Compilations)

단일 플랫폼 프로젝트와 달리 Kotlin 멀티플랫폼 프로젝트는 모든 아티팩트를 빌드하기 위해 여러 번의 컴파일러 실행이 필요합니다. 각 컴파일러 실행은 하나의 _Kotlin 컴파일(Kotlin compilation)_입니다.

예를 들어, 앞서 언급한 Kotlin 컴파일 중에 iPhone 기기용 바이너리가 생성되는 방식은 다음과 같습니다.

![iOS용 Kotlin 컴파일](ios-compilation-diagram.svg){width=700}

Kotlin 컴파일은 타겟 아래에 그룹화됩니다. 기본적으로 Kotlin은 각 타겟에 대해 프로덕션 소스용 `main` 컴파일과 테스트 소스용 `test` 컴파일이라는 두 가지 컴파일을 생성합니다.

빌드 스크립트에서 컴파일에 액세스하는 방식도 비슷합니다. 먼저 Kotlin 타겟을 선택한 다음 내부의 `compilations` 컨테이너에 액세스하고 마지막으로 이름으로 필요한 컴파일을 선택합니다.

```kotlin
kotlin {
    // JVM 타겟 선언 및 구성
    jvm {
        val mainCompilation: KotlinJvmCompilation = compilations.getByName("main")
    }
}