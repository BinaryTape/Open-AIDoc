[//]: # (title: 플랫폼 간 코드 공유)

Kotlin Multiplatform을 사용하면 Kotlin이 제공하는 메커니즘을 통해 코드를 공유할 수 있습니다: 
 
* [프로젝트에서 사용되는 모든 플랫폼 간에 코드 공유](#share-code-on-all-platforms): 모든 플랫폼에 적용되는 공통 비즈니스 로직을 공유할 때 사용합니다.     
* 프로젝트에 포함된 [일부 플랫폼 간에만 코드 공유](#share-code-on-similar-platforms): 계층 구조(hierarchical structure)를 활용하여 유사한 플랫폼 간에 코드를 재사용할 수 있습니다.

공유 코드에서 플랫폼별 API에 접근해야 하는 경우, Kotlin의 [expected 및 actual 선언](multiplatform-expect-actual.md) 메커니즘을 사용하세요.

## 모든 플랫폼에서 코드 공유 {id="share-code-on-all-platforms"}

모든 플랫폼에 공통적인 비즈니스 로직이 있다면 각 플랫폼마다 동일한 코드를 작성할 필요 없이, 공통 소스 세트(common source set)에서 공유하기만 하면 됩니다.

![모든 플랫폼에서 공유되는 코드](flat-structure.svg)

소스 세트의 일부 의존성은 기본적으로 설정되어 있습니다. 따라서 다음과 같은 경우 `dependsOn` 관계를 직접 수동으로 지정할 필요가 없습니다:
* `jvmMain`, `macosArm64Main` 등과 같이 공통 소스 세트에 의존하는 모든 플랫폼별 소스 세트. 
* `androidMain`과 `androidUnitTest`처럼 특정 타깃의 `main` 및 `test` 소스 세트 사이.

공유 코드에서 플랫폼별 API에 접근해야 하는 경우, Kotlin의 [expected 및 actual 선언](multiplatform-expect-actual.md) 메커니즘을 사용하세요.

## 유사한 플랫폼 간 코드 공유 {id="share-code-on-similar-platforms"}

공통 로직과 서드파티 API를 상당 부분 재사용할 수 있는 네이티브 타깃을 여러 개 생성해야 하는 경우가 자주 있습니다.

예를 들어 iOS를 타깃으로 하는 일반적인 멀티플랫폼 프로젝트에는 두 개의 iOS 관련 타깃이 있습니다. 하나는 iOS ARM64 디바이스용이고, 다른 하나는 x64 시뮬레이터용입니다. 이 둘은 플랫폼별 소스 세트가 분리되어 있지만, 실제로는 디바이스와 시뮬레이터 간에 서로 다른 코드를 작성해야 할 일이 거의 없으며 의존성도 거의 동일합니다. 따라서 iOS 관련 코드를 이들 간에 공유할 수 있습니다.

분명히 이러한 구성에서는 두 iOS 타깃을 위한 공유 소스 세트를 두고, iOS 디바이스와 시뮬레이터 모두에 공통인 API를 직접 호출할 수 있는 Kotlin/Native 코드를 작성하는 것이 바람직합니다.

이 경우, 다음 방법 중 하나를 사용하여 프로젝트의 네이티브 타깃 전반에서 [계층 구조](multiplatform-hierarchy.md)를 활용해 코드를 공유할 수 있습니다:

* [기본 계층 템플릿 사용](multiplatform-hierarchy.md#default-hierarchy-template)
* [수동으로 계층 구조 구성](multiplatform-hierarchy.md#manual-configuration)

[라이브러리에서 코드 공유](#share-code-in-libraries) 및 [플랫폼별 라이브러리 연결](#connect-platform-specific-libraries)에 대해 자세히 알아보세요.

## 라이브러리에서 코드 공유 {id="share-code-in-libraries"}

계층적 프로젝트 구조 덕분에 라이브러리 역시 특정 타깃 하위 집합을 위한 공통 API를 제공할 수 있습니다. [라이브러리가 배포(게시)](multiplatform-publish-lib-setup.md)될 때, 중간 소스 세트(intermediate source sets)의 API는 프로젝트 구조 정보와 함께 라이브러리 아티팩트에 포함됩니다. 이 라이브러리를 사용할 때, 프로젝트의 중간 소스 세트는 각 소스 세트의 타깃에서 사용할 수 있는 라이브러리 API에만 접근하게 됩니다.

예를 들어 `kotlinx.coroutines` 저장소의 다음 소스 세트 계층 구조를 살펴보세요:

![라이브러리 계층 구조](lib-hierarchical-structure.svg)

`concurrent` 소스 세트는 runBlocking 함수를 선언하며 JVM 및 네이티브 타깃용으로 컴파일됩니다. `kotlinx.coroutines` 라이브러리가 계층적 프로젝트 구조로 업데이트 및 배포되면, 라이브러리의 `concurrent` 소스 세트가 갖는 "타깃 시그니처"와 일치하므로 JVM과 네이티브 타깃 간에 공유되는 소스 세트에서 이 라이브러리를 의존성에 추가하고 `runBlocking`을 호출할 수 있습니다.

## 플랫폼별 라이브러리 연결 {id="connect-platform-specific-libraries"}

플랫폼별 의존성에 제약받지 않고 더 많은 네이티브 코드를 공유하려면 Foundation, UIKit, POSIX와 같은 [플랫폼 라이브러리](https://kotlinlang.org/docs/native-platform-libs.html)를 사용하세요. 이러한 라이브러리는 Kotlin/Native와 함께 제공되며, 공유 소스 세트에서 기본적으로 사용할 수 있습니다.

또한 프로젝트에서 [Kotlin CocoaPods Gradle](multiplatform-cocoapods-overview.md) 플러그인을 사용하는 경우, [`cinterop` 메커니즘](https://kotlinlang.org/docs/native-c-interop.html)을 통해 가져온 서드파티 네이티브 라이브러리를 활용할 수 있습니다.

## 다음 단계 {id="what-s-next"}

* [Kotlin의 expected 및 actual 선언 메커니즘 알아보기](multiplatform-expect-actual.md)
* [계층적 프로젝트 구조에 대해 자세히 알아보기](multiplatform-hierarchy.md)
* [멀티플랫폼 라이브러리 배포 설정하기](multiplatform-publish-lib-setup.md)
* [멀티플랫폼 프로젝트의 소스 파일 명명 규칙 권장 사항 확인하기](https://kotlinlang.org/docs/coding-conventions.html#source-file-names)