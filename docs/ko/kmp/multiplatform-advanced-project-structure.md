[//]: # (title: 멀티플랫폼 프로젝트 구조의 고급 개념)

이 문서에서는 Kotlin Multiplatform 프로젝트 구조의 고급 개념과 이러한 개념이 Gradle 구현에 매핑되는 방식에 대해 설명합니다. 이 정보는 Gradle 빌드의 저수준 추상화(구성(configuration), 태스크, 발행(publication) 등)를 직접 다루어야 하거나 Kotlin Multiplatform 빌드를 위한 Gradle 플러그인을 개발하는 경우에 유용합니다.

이 페이지는 다음과 같은 경우에 도움이 될 수 있습니다:

* Kotlin이 소스 세트를 자동으로 생성하지 않는 타깃 세트 간에 코드를 공유해야 하는 경우.
* Kotlin Multiplatform 빌드를 위한 Gradle 플러그인을 제작하거나, 구성, 태스크, 발행 등 Gradle 빌드의 저수준 추상화를 사용해야 하는 경우.

> 고급 개념을 살펴보기 전에 먼저 [멀티플랫폼 프로젝트 구조의 기본](multiplatform-discover-project.md)을 학습하는 것을 권장합니다.
>
{style="tip"}

멀티플랫폼 프로젝트의 의존성 관리에서 가장 중요한 점 중 하나는 Gradle 스타일의 프로젝트/라이브러리 의존성과 Kotlin 고유의 소스 세트 간 `dependsOn` 관계 간의 차이를 이해하는 것입니다.

* `dependsOn`은 공통 소스 세트와 플랫폼별 소스 세트 간의 관계로, [소스 세트 계층 구조](#dependson-and-source-set-hierarchies)를 구성하고 멀티플랫폼 프로젝트 전반에서 코드를 공유할 수 있도록 해줍니다. 기본 소스 세트의 계층 구조는 자동으로 관리되지만, 특정한 상황에서는 이를 수정해야 할 수도 있습니다.
* 일반적인 라이브러리 및 프로젝트 의존성은 기존과 동일하게 동작하지만, 멀티플랫폼 프로젝트에서 이를 올바르게 관리하려면 [Gradle 의존성이 어떻게 컴파일에 사용되는 세분화된 **소스 세트 → 소스 세트** 의존성으로 해결(resolve)되는지](#dependencies-on-other-libraries-or-projects) 이해해야 합니다.

## dependsOn과 소스 세트 계층 구조 {id="dependson-and-source-set-hierarchies"}

일반적으로 작업할 때는 `dependsOn` 관계보다는 일반적인 *의존성(dependencies)*을 주로 다루게 됩니다. 하지만 `dependsOn`을 살펴보는 것은 Kotlin Multiplatform 프로젝트의 내부 동작 방식을 이해하는 데 매우 중요합니다.

`dependsOn`은 두 Kotlin 소스 세트 사이의 Kotlin 전용 관계입니다. 이는 예를 들어 `jvmMain` 소스 세트가 `commonMain`에 의존하거나, `iosArm64Main`이 `iosMain`에 의존하는 것처럼 공통 소스 세트와 플랫폼별 소스 세트 간의 연결이 될 수 있습니다.

Kotlin 소스 세트 `A`와 `B`의 일반적인 예시를 살펴보겠습니다. `A.dependsOn(B)`라는 표현식은 Kotlin에 다음과 같은 사항을 지시합니다:

1. `A`는 internal 선언을 포함하여 `B`의 API를 참조할 수 있습니다.
2. `A`는 `B`의 expected 선언에 대한 실제 구현(actual)을 제공할 수 있습니다. 이는 필요충분조건으로, `A`가 `B`에 대해 직접 또는 간접적으로 `A.dependsOn(B)` 관계를 가질 때만 `A`가 `B`에 대한 `actual`을 제공할 수 있습니다.
3. `B`는 자체 타깃 외에도 `A`가 컴파일되는 모든 타깃으로 컴파일되어야 합니다.
4. `A`는 `B`의 모든 일반 의존성을 상속받습니다.

`dependsOn` 관계는 소스 세트 계층 구조라고 알려진 트리 구조를 형성합니다. 다음은 `android`, `iosArm64`(iPhone 기기), `iosSimulatorArm64`(Apple Silicon Mac용 iPhone 시뮬레이터)를 타깃으로 하는 전형적인 모바일 개발 프로젝트의 예입니다.

![DependsOn 트리 구조](dependson-tree-diagram.svg){width=700}

화살표는 `dependsOn` 관계를 나타냅니다.
이러한 관계는 플랫폼 바이너리를 컴파일하는 동안에도 보존됩니다. 이를 통해 Kotlin은 `iosMain`이 `commonMain`의 API는 참조할 수 있지만 `iosArm64Main`의 API는 참조할 수 없다는 것을 이해합니다.

![컴파일 중 dependsOn 관계](dependson-relations-diagram.svg){width=700}

`dependsOn` 관계는 `KotlinSourceSet.dependsOn(KotlinSourceSet)` 호출을 통해 설정됩니다. 예를 들면 다음과 같습니다:

```kotlin
kotlin {
    // 타깃 선언
    sourceSets {
        // dependsOn 관계 설정 예시
        iosArm64Main.dependsOn(commonMain)
    }
}
```

* 이 예시는 빌드 스크립트에서 `dependsOn` 관계를 정의하는 방법을 보여줍니다. 하지만 Kotlin Gradle 플러그인이 기본적으로 소스 세트를 생성하고 이러한 관계를 설정하므로 직접 수동으로 설정할 필요는 없습니다.
* `dependsOn` 관계는 빌드 스크립트의 `dependencies {}` 블록과 별도로 선언됩니다. 이는 `dependsOn`이 일반적인 의존성이 아니라, 서로 다른 타깃 간에 코드를 공유하기 위해 필요한 Kotlin 소스 세트 간의 특별한 관계이기 때문입니다.

`dependsOn`을 사용하여 발행된 라이브러리나 다른 Gradle 프로젝트에 대한 일반 의존성을 선언할 수는 없습니다. 예를 들어, `commonMain`이 `kotlinx-coroutines-core` 라이브러리의 `commonMain`에 의존하도록 설정하거나 `commonTest.dependsOn(commonMain)`을 호출할 수는 없습니다.

### 커스텀 소스 세트 선언하기 {id="declaring-custom-source-sets"}

경우에 따라 프로젝트에 커스텀 중간(intermediate) 소스 세트가 필요할 수 있습니다.
JVM, JS, Linux로 컴파일되는 프로젝트에서 JVM과 JS 간에만 일부 소스를 공유하려는 경우를 가정해 보겠습니다.
이 경우 [멀티플랫폼 프로젝트 구조의 기본](multiplatform-discover-project.md)에 설명된 대로 이 두 타깃을 위한 특정 소스 세트를 찾아야 합니다.

Kotlin은 이러한 소스 세트를 자동으로 생성하지 않습니다. 따라서 `by creating` 구문을 사용하여 수동으로 생성해야 합니다:

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

하지만 Kotlin은 여전히 이 소스 세트를 어떻게 처리하거나 컴파일해야 하는지 알지 못합니다. 이를 다이어그램으로 나타내면 이 소스 세트는 고립되어 타깃 레이블이 전혀 없는 상태가 됩니다:

![누락된 dependsOn 관계](missing-dependson-diagram.svg){width=700}

이 문제를 해결하려면 여러 `dependsOn` 관계를 추가하여 `jvmAndJsMain`을 계층 구조에 포함해야 합니다:

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

여기서 `jvmMain.dependsOn(jvmAndJsMain)`은 `jvmAndJsMain`에 JVM 타깃을 추가하고, `jsMain.dependsOn(jvmAndJsMain)`은 `jvmAndJsMain`에 JS 타깃을 추가합니다.

최종 프로젝트 구조는 다음과 같습니다:

![최종 프로젝트 구조](final-structure-diagram.svg){width=700}

> `dependsOn` 관계를 수동으로 설정하면 기본 계층 템플릿의 자동 적용이 비활성화됩니다. 이러한 경우와 이를 처리하는 방법에 대한 자세한 내용은 [추가 구성](multiplatform-hierarchy.md#additional-configuration)을 참고하세요.
>
{style="note"}

## 다른 라이브러리 또는 프로젝트에 대한 의존성 {id="dependencies-on-other-libraries-or-projects"}

멀티플랫폼 프로젝트에서는 발행된 라이브러리나 다른 Gradle 프로젝트에 대해 일반 의존성을 설정할 수 있습니다.

Kotlin Multiplatform은 일반적으로 전형적인 Gradle 방식으로 의존성을 선언합니다. Gradle과 마찬가지로 다음을 수행합니다:

* 빌드 스크립트의 `dependencies {}` 블록을 사용합니다.
* `implementation`이나 `api`와 같이 의존성에 적합한 스코프를 선택합니다.
* 의존성이 저장소에 발행된 경우 `"com.google.guava:guava:32.1.2-jre"`와 같이 좌표를 지정하거나, 동일한 빌드 내의 Gradle 프로젝트인 경우 `project(":utils:concurrency")`와 같이 경로를 지정하여 참조합니다.

멀티플랫폼 프로젝트의 의존성 구성에는 몇 가지 특징이 있습니다. 각 Kotlin 소스 세트는 자체 `dependencies {}` 블록을 가지고 있습니다. 이를 통해 플랫폼별 소스 세트에 플랫폼 전용 의존성을 선언할 수 있습니다:

```kotlin
kotlin {
    // 타깃 선언
    sourceSets {
        jvmMain.dependencies {
            // jvmMain의 의존성이므로 JVM 전용 의존성을 추가해도 괜찮습니다
            implementation("com.google.guava:guava:32.1.2-jre")
        }
    }
}
```

공통 의존성은 조금 더 까다롭습니다. `kotlinx.coroutines`와 같은 멀티플랫폼 라이브러리에 대한 의존성을 선언하는 멀티플랫폼 프로젝트를 살펴보겠습니다:

```kotlin
kotlin {
    android()           // Android
    iosArm64()          // iPhone 기기
    iosSimulatorArm64() // Apple Silicon Mac용 iPhone 시뮬레이터

    sourceSets {
        commonMain.dependencies {
            implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")
        }
    }
}
```

의존성 해결(resolution)에는 세 가지 중요한 개념이 있습니다:

1. 멀티플랫폼 의존성은 `dependsOn` 구조를 따라 하위로 전파됩니다. `commonMain`에 의존성을 추가하면, `commonMain`과 직접 또는 간접적으로 `dependsOn` 관계를 선언하는 모든 소스 세트에 해당 의존성이 자동으로 추가됩니다.

   이 경우, 의존성은 실제로 모든 `*Main` 소스 세트(`iosMain`, `jvmMain`, `iosSimulatorArm64Main`, `iosArm64Main`)에 자동으로 추가되었습니다. 이러한 모든 소스 세트는 `commonMain` 소스 세트로부터 `kotlin-coroutines-core` 의존성을 상속받으므로 모든 소스 세트에 수동으로 복사하여 붙여넣을 필요가 없습니다:

   ![멀티플랫폼 의존성의 전파](dependency-propagation-diagram.svg){width=700}

   > 전파 메커니즘을 사용하면 특정 소스 세트를 선택하여 선언된 의존성을 전달받을 스코프를 결정할 수 있습니다. 예를 들어, Android가 아닌 iOS에서만 `kotlinx.coroutines`를 사용하려는 경우 `iosMain`에만 이 의존성을 추가할 수 있습니다.
   >
   {style="tip"}

2. 위의 `commonMain`에서 `org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3`으로의 의존성과 같은 *소스 세트 → 멀티플랫폼 라이브러리* 의존성은 의존성 해결의 중간 상태를 나타냅니다. 의존성 해결의 최종 상태는 항상 *소스 세트 → 소스 세트* 의존성으로 표현됩니다.

   > 최종적인 *소스 세트 → 소스 세트* 의존성은 `dependsOn` 관계가 아닙니다.
   >
   {style="note"}

   세분화된 *소스 세트 → 소스 세트* 의존성을 도출하기 위해, Kotlin은 각 멀티플랫폼 라이브러리와 함께 발행된 소스 세트 구조를 읽습니다. 이 단계가 끝나면 각 라이브러리는 내부적으로 전체 라이브러리 하나가 아니라 소스 세트들의 컬렉션으로 표현됩니다. `kotlinx-coroutines-core`의 다음 예시를 참고하세요:

   ![소스 세트 구조의 직렬화](structure-serialization-diagram.svg){width=700}

3. Kotlin은 각 의존성 관계를 가져와 의존 대상의 소스 세트 컬렉션으로 해결합니다. 해당 컬렉션의 각 의존 대상 소스 세트는 *호환 가능한 타깃*을 가지고 있어야 합니다. 의존 대상 소스 세트가 소비하는(consumer) 소스 세트와 *최소한 동일한 타깃*으로 컴파일되는 경우, 해당 소스 세트는 호환 가능한 타깃을 갖습니다.

   샘플 프로젝트의 `commonMain`이 `android`, `iosArm64`, `iosSimulatorArm64`로 컴파일되는 예시를 살펴보겠습니다:

    * 먼저, `kotlinx-coroutines-core.commonMain`에 대한 의존성을 해결합니다. 이는 `kotlinx-coroutines-core`가 가능한 모든 Kotlin 타깃으로 컴파일되기 때문에 발생합니다. 따라서 해당 라이브러리의 `commonMain`은 필요한 `android`, `iosArm64`, `iosSimulatorArm64`를 포함한 모든 타깃으로 컴파일됩니다.
    * 둘째로, `commonMain`은 `kotlinx-coroutines-core.concurrentMain`에 의존합니다. `kotlinx-coroutines-core`의 `concurrentMain`은 JS를 제외한 모든 타깃으로 컴파일되므로, 이를 소비하는 프로젝트의 `commonMain` 타깃과 일치합니다.

   하지만 coroutines의 `iosArm64Main`과 같은 소스 세트는 소비자의 `commonMain`과 호환되지 않습니다. `iosArm64Main`이 `commonMain`의 타깃 중 하나인 `iosArm64`로 컴파일되기는 하지만, `android`나 `iosSimulatorArm64`로는 컴파일되지 않기 때문입니다.

   의존성 해결 결과는 `kotlinx-coroutines-core`의 어떤 코드가 노출되는지에 직접적인 영향을 미칩니다:

   ![공통 코드에서 JVM 전용 API 오류](dependency-resolution-error.png){width=700}

### 소스 세트 간 공통 의존성 버전 일치시키기 {id="aligning-versions-of-common-dependencies-across-source-sets"}

Kotlin Multiplatform 프로젝트에서 공통 소스 세트는 klib을 생성하기 위해, 그리고 구성된 각 [컴파일(compilation)](multiplatform-configure-compilations.md)의 일환으로 여러 번 컴파일됩니다. 일관성 있는 바이너리를 생성하려면 공통 코드가 매번 동일한 버전의 멀티플랫폼 의존성을 바탕으로 컴파일되어야 합니다. Kotlin Gradle 플러그인은 이러한 의존성을 정렬(align)하여 각 소스 세트에 유효한 의존성 버전이 동일하게 유지되도록 지원합니다.

위의 예시에서 `androidMain` 소스 세트에 `androidx.navigation:navigation-compose:2.7.7` 의존성을 추가하려는 경우를 가정해 보겠습니다. 프로젝트의 `commonMain` 소스 세트에는 `kotlinx-coroutines-core:1.7.3` 의존성이 명시적으로 선언되어 있지만, 2.7.7 버전의 Compose Navigation 라이브러리는 Kotlin 코루틴 1.8.0 이상 버전을 필요로 합니다.

`commonMain`과 `androidMain`은 함께 컴파일되므로, Kotlin Gradle 플러그인은 두 코루틴 라이브러리 버전 중 하나를 선택하여 `commonMain` 소스 세트에 `kotlinx-coroutines-core:1.8.0`을 적용합니다. 하지만 구성된 모든 타깃에서 공통 코드가 일관되게 컴파일되도록 하려면 iOS 소스 세트도 동일한 의존성 버전으로 제한되어야 합니다. 따라서 Gradle은 `kotlinx.coroutines-*:1.8.0` 의존성을 `iosMain` 소스 세트에도 전파합니다.

![*Main 소스 세트 간의 의존성 정렬](multiplatform-source-set-dependency-alignment.svg){width=700}

의존성은 `*Main` 소스 세트와 [`*Test` 소스 세트](multiplatform-discover-project.md#integration-with-tests) 간에 각각 독립적으로 정렬됩니다. `*Test` 소스 세트의 Gradle 구성에는 `*Main` 소스 세트의 모든 의존성이 포함되지만, 그 반대는 성립하지 않습니다. 따라서 메인 코드에 영향을 주지 않고 더 최신 라이브러리 버전으로 프로젝트를 테스트할 수 있습니다.

예를 들어 프로젝트의 모든 소스 세트에 전파된 `*Main` 소스 세트의 Kotlin 코루틴 의존성 버전이 1.7.3이라고 가정해 보겠습니다.
그런데 `iosTest` 소스 세트에서 새 라이브러리 릴리스를 테스트하기 위해 버전을 1.8.0으로 업그레이드하기로 결정했습니다.
동일한 알고리즘에 따라 이 의존성은 `*Test` 소스 세트 트리 전체로 전파되므로, 모든 `*Test` 소스 세트는 `kotlinx.coroutines-*:1.8.0` 의존성으로 컴파일됩니다.

![메인 소스 세트와 별개로 의존성을 해결하는 테스트 소스 세트](test-main-source-set-dependency-alignment.svg)

## 컴파일(Compilations) {id="compilations"}

단일 플랫폼 프로젝트와 달리, Kotlin Multiplatform 프로젝트는 모든 아티팩트를 빌드하기 위해 컴파일러를 여러 번 실행해야 합니다. 각 컴파일러 실행을 _Kotlin 컴파일(Kotlin compilation)_이라고 부릅니다.

예를 들어, 앞서 언급한 Kotlin 컴파일 중에 iPhone 기기용 바이너리가 생성되는 방식은 다음과 같습니다:

![iOS용 Kotlin 컴파일](ios-compilation-diagram.svg){width=700}

Kotlin 컴파일은 타깃 하위에 그룹화됩니다. 기본적으로 Kotlin은 타깃마다 프로덕션 소스를 위한 `main` 컴파일과 테스트 소스를 위한 `test` 컴파일의 두 가지 컴파일을 생성합니다.

빌드 스크립트에서 컴파일에 접근하는 방식도 이와 유사합니다. 먼저 Kotlin 타깃을 선택하고, 내부의 `compilations` 컨테이너에 접근한 다음, 필요한 컴파일을 이름으로 선택합니다:

```kotlin
kotlin {
    // JVM 타깃 선언 및 구성
    jvm {
        val mainCompilation: KotlinJvmCompilation = compilations.getByName("main")
    }
}
```