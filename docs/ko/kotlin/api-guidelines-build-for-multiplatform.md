[//]: # (title: 멀티플랫폼용 Kotlin 라이브러리 구축하기)

Kotlin 라이브러리를 만들 때는 [Kotlin 멀티플랫폼 지원을 포함하여 구축 및 배포](https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-publish-lib-setup.html)하는 것을 고려해 보세요.
이는 라이브러리의 타겟 사용자를 넓혀주며, 여러 플랫폼을 타겟으로 하는 프로젝트와 호환되도록 만들어 줍니다.

> [klibs.io](https://klibs.io/)에서 다양한 사용 사례와 타겟 플랫폼을 위해 이미 사용 가능한 Kotlin 멀티플랫폼 라이브러리를 찾을 수 있습니다.
> 
{style="tip"}

다음 섹션에서는 Kotlin 멀티플랫폼 라이브러리를 효과적으로 구축하는 데 도움이 되는 가이드라인을 제공합니다.

## 도달 범위 극대화하기

라이브러리를 최대한 많은 프로젝트에서 의존성으로 사용할 수 있도록 하려면, 가능한 한 많은 Kotlin 멀티플랫폼 [타겟 플랫폼](https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-dsl-reference.html#targets)을 지원하는 것을 목표로 하세요.

라이브러리가 멀티플랫폼 프로젝트(라이브러리든 애플리케이션이든)에서 사용하는 플랫폼을 지원하지 않으면, 해당 프로젝트에서 여러분의 라이브러리에 의존하기가 어려워집니다. 이 경우 프로젝트에서는 일부 플랫폼에 대해서만 라이브러리를 사용하고 다른 플랫폼을 위해서는 별도의 솔루션을 구현해야 하거나, 아예 모든 플랫폼을 지원하는 대체 라이브러리를 선택하게 될 것입니다.

아티팩트 생성을 간소화하려면 [교차 컴파일(cross-compilation)](https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-publish-lib-setup.html#host-requirements)을 사용하여 어떤 호스트에서든 Kotlin 멀티플랫폼 라이브러리를 배포하세요. 이를 통해 Apple 기기 없이도 Apple 타겟용 `.klib` 아티팩트를 생성할 수 있습니다.

> Kotlin/Native 타겟의 경우, 가능한 모든 타겟을 지원하기 위해 [계층형 접근 방식(tiered approach)](native-target-support.md#for-library-authors)을 사용하는 것을 고려해 보세요.
>
{style="note"}

## 공통 코드에서 사용할 수 있도록 API 설계하기

라이브러리를 만들 때는 플랫폼별 구현을 작성하는 대신, 공통(common) Kotlin 코드에서 사용할 수 있도록 API를 설계하세요.

가능하다면 합리적인 기본 설정을 제공하고 플랫폼별 구성 옵션을 포함하세요. 좋은 기본값은 사용자가 라이브러리를 설정하기 위해 플랫폼별 구현을 작성할 필요 없이, 공통 Kotlin 코드에서 라이브러리의 API를 사용할 수 있게 해줍니다.

다음 우선순위에 따라 가장 광범위하고 적절한 소스 세트에 API를 배치하세요.

* **`commonMain` 소스 세트:** `commonMain` 소스 세트의 API는 라이브러리가 지원하는 모든 플랫폼에서 사용할 수 있습니다. 라이브러리 API의 대부분을 여기에 배치하는 것을 목표로 하세요.
* **중간 소스 세트(Intermediate source sets):** 일부 플랫폼이 특정 API를 지원하지 않는 경우, [중간 소스 세트](https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-discover-project.html#intermediate-source-sets)를 사용하여 특정 플랫폼들을 타겟팅하세요. 예를 들어, 멀티스레딩을 지원하는 타겟을 위해 `concurrent` 소스 세트를 만들거나, JVM이 아닌 모든 타겟을 위해 `nonJvm` 소스 세트를 만들 수 있습니다.
* **플랫폼별 소스 세트:** `androidMain`과 같이 플랫폼별로 특화된 API를 위해서는 플랫폼별 소스 세트를 사용하세요.

> Kotlin 멀티플랫폼 프로젝트의 소스 세트에 대해 자세히 알아보려면 [계층 구조 프로젝트 구조(Hierarchical project structure)](https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-hierarchy.html)를 참조하세요.
>
{style="tip"}

## 플랫폼 간 일관된 동작 보장하기

라이브러리가 지원되는 모든 플랫폼에서 일관되게 동작하도록 하려면, 멀티플랫폼 라이브러리의 API는 모든 플랫폼에서 동일한 범위의 유효한 입력을 허용하고, 동일한 작업을 수행하며, 동일한 결과를 반환해야 합니다. 마찬가지로 라이브러리는 모든 플랫폼에서 유효하지 않은 입력을 일관되게 처리하고 에러를 보고하거나 예외를 던져야 합니다.

일관되지 않은 동작은 라이브러리 사용을 어렵게 만들고, 사용자가 플랫폼별 차이점을 관리하기 위해 공통 코드에 조건부 로직을 추가하도록 강제합니다.

[`expect` 및 `actual` 선언](https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-expect-actual.html)을 사용하면 공통 코드에서 함수를 선언하고, 각 플랫폼의 네이티브 API에 완전히 접근할 수 있는 플랫폼별 구현을 작성할 수 있습니다. 이러한 구현체들도 공통 코드에서 안정적으로 사용될 수 있도록 동일한 동작을 가져야 합니다.

API가 플랫폼 간에 일관되게 동작하면 `commonMain` 소스 세트에서 한 번만 문서화하면 됩니다.

> 한 플랫폼이 더 넓은 범위의 입력을 지원하는 경우와 같이 플랫폼 간 차이가 불가피하다면, 가능한 한 그 차이를 최소화하세요. 예를 들어, 다른 플랫폼과 맞추기 위해 특정 플랫폼의 기능을 제한하고 싶지 않을 수 있습니다. 이러한 경우에는 구체적인 차이점을 명확하게 문서화하세요.
>
> {style=”note”}

## 모든 플랫폼에서 테스트하기

멀티플랫폼 라이브러리는 모든 플랫폼에서 실행되는 공통 코드로 작성된 [멀티플랫폼 테스트](https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-run-tests.html)를 가질 수 있습니다. 지원하는 플랫폼에서 이 공통 테스트 스위트를 정기적으로 실행하면 라이브러리가 정확하고 일관되게 동작하는지 확인할 수 있습니다.

배포된 모든 플랫폼에서 Kotlin/Native 타겟을 정기적으로 테스트하는 것은 어려울 수 있습니다. 그러나 더 넓은 호환성을 보장하기 위해 호환성을 테스트할 때 [계층형 방법(tiered method)](native-target-support.md#for-library-authors)을 사용하여 지원 가능한 모든 타겟에 대해 라이브러리를 배포하는 것을 고려해 보세요.

[`kotlin-test`](https://kotlinlang.org/api/latest/kotlin.test/) 라이브러리를 사용하여 공통 코드에서 테스트를 작성하고 플랫폼별 테스트 러너로 실행하세요.

## Kotlin 이외의 사용자 고려하기

Kotlin 멀티플랫폼은 지원하는 타겟 플랫폼 전반에서 네이티브 API 및 언어와의 상호 운용성을 제공합니다. Kotlin 멀티플랫폼 라이브러리를 만들 때, 사용자가 Kotlin 이외의 언어에서 라이브러리의 타입과 선언을 사용해야 할 필요가 있는지 고려하세요.

예를 들어, 라이브러리의 일부 타입이 상호 운용성을 통해 Swift 코드에 노출된다면, 해당 타입들을 Swift에서 쉽게 접근할 수 있도록 설계하세요. [Kotlin-Swift interopedia](https://github.com/kotlin-hands-on/kotlin-swift-interopedia)는 Swift에서 호출될 때 Kotlin API가 어떻게 보이는지에 대한 유용한 통찰을 제공합니다.

## 라이브러리 홍보하기

개발자들이 Kotlin 멀티플랫폼 라이브러리를 발견하고 평가하는 검색 플랫폼인 [klibs.io](https://klibs.io/)에 여러분의 라이브러리를 소개할 수 있습니다.

[klibs.io](https://klibs.io/)는 등재 기준을 충족하는 라이브러리를 자동으로 목록에 추가합니다. 라이브러리가 자격이 되는지 확인하려면 [FAQ](https://klibs.io/faq)를 참조하세요.