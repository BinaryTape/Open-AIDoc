[//]: # (title: Kotlin Gradle 플러그인의 바이너리 호환성 검증)

<primary-label ref="experimental-general"/>

바이너리 호환성(Binary compatibility) 검증은 라이브러리 작성자가 사용자가 최신 버전으로 업그레이드할 때 기존 코드가 깨지지 않도록 보장하는 데 도움이 됩니다. 이는 원활한 업그레이드 경험을 제공하는 것뿐만 아니라, 사용자와의 장기적인 신뢰를 구축하고 라이브러리의 지속적인 채택을 장려하는 데에도 중요합니다.

> 바이너리 호환성이란 라이브러리의 두 버전에서 컴파일된 바이트코드가 재컴파일 없이 서로 교체되어 실행될 수 있음을 의미합니다.
> 
{style="tip"}

Kotlin Gradle 플러그인은 바이너리 호환성 검증 기능을 포함하고 있습니다. 이 플러그인은 현재 코드에서 응용 프로그램 이진 인터페이스(ABI, Application Binary Interface) 덤프를 생성하고 이를 이전 덤프와 비교하여 차이점을 강조 표시합니다. 이러한 변경 사항을 검토하여 잠재적으로 바이너리 호환되지 않는 수정을 찾아내고 이를 해결하기 위한 조치를 취할 수 있습니다.

## 활성화 방법 {id="how-to-enable"}

바이너리 호환성 검증을 활성화하려면 `build.gradle.kts` 파일에 `abiValidation {}` 블록을 추가하세요. 별도의 사용자 정의 설정이 필요 없는 경우, 대신 `abiValidation()` 함수를 사용할 수 있습니다.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    @OptIn(org.jetbrains.kotlin.gradle.dsl.abi.ExperimentalAbiValidation::class)
    abiValidation()
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    abiValidation()
}
```

</tab>
</tabs>

KGP는 필요한 Gradle 태스크를 생성합니다. 프로젝트에 바이너리 호환성을 확인하려는 모듈이 여러 개인 경우, 각 모듈을 별도로 구성하세요.

## 바이너리 호환성 문제 확인 {id="check-for-binary-compatibility-issues"}

코드를 변경한 후 잠재적인 바이너리 비호환 문제를 확인하려면, IntelliJ IDEA에서 `checkKotlinAbi` Gradle 태스크를 실행하거나 프로젝트 디렉토리에서 다음 명령을 사용하세요.

```bash
./gradlew checkKotlinAbi
```

이 태스크는 ABI 덤프를 비교하고 감지된 차이점을 오류로 출력합니다. 바이너리 호환성을 유지하기 위해 코드를 수정해야 하는지 확인하기 위해 출력 내용을 주의 깊게 검토하세요.

기본적으로 프로젝트에서 [바이너리 호환성 검증이 활성화](#how-to-enable)된 상태에서 `check` 태스크를 실행하면 Gradle은 `checkKotlinAbi` 태스크도 함께 실행합니다. 

## 참조 ABI 덤프 업데이트 {id="update-reference-abi-dump"}

Gradle이 최신 변경 사항을 확인하는 데 사용하는 참조 ABI 덤프를 업데이트하려면, IntelliJ IDEA에서 `updateKotlinAbi` 태스크를 실행하거나 프로젝트 디렉토리에서 다음 명령을 사용하세요.

```bash
./gradlew updateKotlinAbi
```

변경 사항이 이전 버전과의 바이너리 호환성을 유지한다는 확신이 들 때만 참조 덤프를 업데이트하세요.

## 필터 구성 {id="configure-filters"}

ABI 덤프에 포함할 클래스, 프로퍼티 및 함수를 제어하기 위해 필터를 정의할 수 있습니다. `filters {}` 블록을 사용하여 각각 `excluded {}` 및 `included {}` 블록으로 제외 및 포함 규칙을 추가하세요.

Gradle은 어떤 제외 규칙에도 일치하지 않는 선언만 ABI 덤프에 포함합니다. 포함 규칙이 정의된 경우, 선언이 해당 규칙 중 하나와 일치하거나 규칙에 일치하는 멤버를 하나 이상 가지고 있어야 합니다.

규칙은 다음을 기반으로 할 수 있습니다:

* 클래스, 프로퍼티 또는 함수의 정규화된 이름(Fully qualified name) (`byNames`).
* BINARY 또는 RUNTIME [유지 정책(retention)](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.annotation/-retention/)을 가진 어노테이션 이름 (`annotatedWith`).

> 이름 규칙에는 와일드카드 `**`, `*`, `?`를 사용할 수 있습니다.
> * `**`는 마침표를 포함하여 0개 이상의 문자와 일치합니다.
> * `*`는 마침표를 제외하고 0개 이상의 문자와 일치합니다. 단일 클래스 이름을 지정할 때 사용합니다.
> * `?`는 정확히 한 문자와 일치합니다.
> 
{style = "tip"}

예제:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    @OptIn(org.jetbrains.kotlin.gradle.dsl.abi.ExperimentalAbiValidation::class)
    abiValidation {
        filters {
            excluded {
                byNames.add("**.InternalUtils")
                annotatedWith.add("com.example.annotations.InternalApi")
            }

            included {
                byNames.add("com.example.api.**")
                annotatedWith.add("com.example.annotations.PublicApi")
            }
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    abiValidation {
        filters {
            excluded {
                byNames.add("**.InternalUtils")
                annotatedWith.add("com.example.annotations.InternalApi")
            }

            included {
                byNames.add("com.example.api.**")
                annotatedWith.add("com.example.annotations.PublicApi")
            }
        }
    }
}
```

</tab>
</tabs>

이 예제는 다음과 같이 동작합니다:

* 제외 대상:
  * `InternalUtils` 클래스.
  * `@InternalApi` 어노테이션이 달린 선언.
* 포함 대상:
  * `com.example.api` 패키지의 모든 항목.
  * `@PublicApi` 어노테이션이 달린 선언.

필터링에 대한 자세한 내용은 [Kotlin Gradle 플러그인 API 레퍼런스](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.dsl.abi/-abi-filters-spec/)를 참조하세요.

## 지원되지 않는 타겟에 대한 추론된 변경 방지 {id="prevent-inferred-changes-for-unsupported-targets"}

멀티플랫폼 프로젝트에서 호스트 시스템이 모든 타겟을 컴파일할 수 없는 경우, Kotlin Gradle 플러그인은 사용 가능한 타겟으로부터 ABI 변경 사항을 추론하려고 시도합니다. 이는 나중에 더 많은 타겟을 지원하는 호스트로 전환할 때 발생할 수 있는 잘못된 실패를 방지하는 데 도움이 됩니다.

이 동작을 비활성화하려면 `build.gradle.kts` 파일에 다음 내용을 추가하세요.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    @OptIn(org.jetbrains.kotlin.gradle.dsl.abi.ExperimentalAbiValidation::class)
    abiValidation {
        keepLocallyUnsupportedTargets.set(false)
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    abiValidation {
        keepLocallyUnsupportedTargets = false
    }
}
```

</tab>
</tabs>

타겟이 지원되지 않고 추론이 비활성화된 경우, 완전한 ABI 덤프를 생성할 수 없으므로 `checkKotlinAbi` 태스크가 실패합니다. 바이너리 비호환 변경 사항을 놓칠 위험을 감수하기보다 태스크가 실패하는 것을 선호하는 경우 이 동작이 유용할 수 있습니다.

## `maven-publish` 플러그인의 발행물(publications) 포함 {id="include-publications-from-the-maven-publish-plugin"}

기본적으로 바이너리 호환성 검증은 Kotlin 컴파일 출력을 사용하여 ABI 덤프를 생성합니다. 이 때문에 생성된 ABI 덤프가 최종 발행된 아티팩트(artifact)를 반영하지 못할 수 있습니다. 예를 들어, [`maven-publish` 플러그인](https://docs.gradle.org/current/userguide/publishing_maven.html)을 사용하는 경우 재배치(relocation)와 같은 후처리 단계가 컴파일 후에 아티팩트를 수정할 수 있습니다.

ABI 덤프가 `maven-publish` 플러그인에 의해 발행된 아티팩트를 정확하게 반영하도록 하려면, `build.gradle.kts` 파일에 다음 내용을 추가하세요.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    @OptIn(org.jetbrains.kotlin.gradle.dsl.abi.ExperimentalAbiValidation::class)
    abiValidation {
        binariesSource.set(MAVEN_PUBLICATIONS)
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    abiValidation {
        binariesSource = MAVEN_PUBLICATIONS
    }
}
```

</tab>
</tabs>

> Kotlin/Android 프로젝트 및 Android 타겟이 있는 멀티플랫폼 프로젝트는 JAR 파일을 발행하지 않으므로, 이 기능은 해당 프로젝트에 적용되지 않습니다.
> 
{style="warning"}