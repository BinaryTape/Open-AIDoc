[//]: # (title: 코루틴)

애플리케이션은 사용자 입력에 응답하거나, 데이터를 로드하거나, 화면을 업데이트하는 등 여러 작업을 동시에 수행해야 할 때가 많습니다.
이를 지원하기 위해 애플리케이션은 동시성(concurrency)에 의존하며, 동시성은 작업들이 서로를 차단(blocking)하지 않고 독립적으로 실행될 수 있게 합니다.

작업을 동시에 실행하는 가장 일반적인 방법은 운영 체제에서 관리하는 독립적인 실행 경로인 스레드(thread)를 사용하는 것입니다.
하지만 스레드는 상대적으로 무거우며, 스레드를 많이 생성하면 성능 문제가 발생할 수 있습니다.

효율적인 동시성을 지원하기 위해 코틀린은 코루틴(coroutine)을 기반으로 구축된 비동기 프로그래밍을 사용합니다. 이를 통해 일시 중단 함수(suspending functions)를 사용하여 자연스럽고 순차적인 스타일로 비동기 코드를 작성할 수 있습니다.
코루틴은 스레드에 대한 가벼운 대안입니다.
시스템 리소스를 차단하지 않고 일시 중단할 수 있으며 리소스 친화적이므로, 미세한 단위의 동시성(fine-grained concurrency)에 더 적합합니다.

대부분의 코루틴 기능은 [`kotlinx.coroutines`](https://github.com/Kotlin/kotlinx.coroutines) 라이브러리에서 제공됩니다.
이 라이브러리에는 코루틴 시작, 동시성 처리, 비동기 스트림 작업 등을 위한 도구가 포함되어 있습니다.

코틀린의 코루틴이 처음이라면 더 복잡한 주제를 다루기 전에 [코루틴 기초](coroutines-basics.md) 가이드를 먼저 시작해 보세요.
이 가이드는 간단한 예제를 통해 일시 중단 함수, 코루틴 빌더, 구조화된 동시성(structured concurrency)의 핵심 개념을 소개합니다.

<a href="coroutines-basics.md"><img src="get-started-coroutines.svg" width="700" alt="Get started with coroutines" style="block"/></a>

> 코루틴이 실제 실무에서 어떻게 사용되는지 확인하려면 [KotlinConf 앱](https://github.com/JetBrains/kotlinconf-app) 샘플 프로젝트를 살펴보세요.
> 
{style="tip"}

## 코루틴 개념

`kotlinx.coroutines` 라이브러리는 작업을 동시에 실행하고, 코루틴 실행을 구조화하며, 공유 상태를 관리하기 위한 핵심 빌딩 블록을 제공합니다.

### 일시 중단 함수와 코루틴 빌더

코틀린의 코루틴은 스레드를 차단하지 않고 코드를 일시 중지하고 재개할 수 있게 해주는 일시 중단 함수를 기반으로 구축되었습니다.
`suspend` 키워드는 장시간 실행되는 작업을 비동기적으로 수행할 수 있는 함수임을 나타냅니다.

새 코루틴을 시작하려면 [`.launch()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/launch.html) 및 [`.async()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/async.html)와 같은 코루틴 빌더를 사용하세요.
이러한 빌더는 코루틴의 생명 주기를 정의하고 코루틴 컨텍스트를 제공하는 [`CoroutineScope`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-scope/)의 확장 함수입니다.

이러한 빌더에 대한 자세한 내용은 [코루틴 기초](coroutines-basics.md) 및 [일시 중단 함수 구성하기](coroutines-and-channels.md)에서 배울 수 있습니다.

### 코루틴 컨텍스트와 동작

`CoroutineScope`에서 코루틴을 시작하면 그 실행을 제어하는 컨텍스트가 생성됩니다.
`.launch()` 및 `.async()`와 같은 빌더 함수는 코루틴의 동작 방식을 정의하는 요소 집합을 자동으로 생성합니다.

* [`Job`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-job/) 인터페이스는 코루틴의 생명 주기를 추적하고 구조화된 동시성을 가능하게 합니다.
* [`CoroutineDispatcher`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-dispatcher/)는 백그라운드 스레드나 UI 애플리케이션의 메인 스레드와 같이 코루틴이 실행될 위치를 제어합니다.
* [`CoroutineExceptionHandler`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-exception-handler/)는 포착되지 않은 예외를 처리합니다.

이러한 요소들과 다른 가능한 요소들은 [_코루틴 컨텍스트(coroutine context)_](coroutine-context-and-dispatchers.md)를 구성하며, 이는 기본적으로 부모 코루틴으로부터 상속됩니다.
이 컨텍스트는 구조화된 동시성을 가능하게 하는 계층 구조를 형성하여, 관련 코루틴들을 함께 [취소](coroutines-cancellation.md)하거나 그룹으로 [예외를 처리](exception-handling.md)할 수 있게 합니다.

### 비동기 플로우와 공유되는 가변 상태

코틀린은 코루틴 간에 통신할 수 있는 여러 가지 방법을 제공합니다.
코루틴 간에 값을 공유하려는 방식에 따라 다음 옵션 중 하나를 사용하세요.

* [`Flow`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-flow/)는 코루틴이 이를 활발하게 수집(collect)할 때만 값을 생성합니다.
* [`Channel`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.channels/-channel/)은 여러 코루틴이 값을 보내고 받을 수 있게 하며, 각 값은 정확히 하나의 코루틴에 전달됩니다.
* [`SharedFlow`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-shared-flow/)는 모든 활성 수집 코루틴에 모든 값을 지속적으로 공유합니다.

여러 코루틴이 동일한 데이터에 액세스하거나 업데이트해야 하는 경우, 이들은 _공유되는 가변 상태(shared mutable state)_를 공유하게 됩니다.
조율이 없으면 작업이 예측 불가능한 방식으로 서로 간섭하는 경합 상태(race condition)가 발생할 수 있습니다.
공유 가변 상태를 안전하게 관리하려면 [`StateFlow`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-state-flow/#)를 사용하여 공유 데이터를 래핑하세요.
그러면 한 코루틴에서 데이터를 업데이트하고 다른 코루틴에서 최신 값을 수집할 수 있습니다.
<!-- 자세한 내용은 [공유 가변 상태와 동시성](shared-mutable-state-and-concurrency.md)에서 알아보세요. -->

더 자세한 내용은 [비동기 플로우](coroutines-flow.md), [채널](channels.md) 및 [코루틴과 채널 튜토리얼](coroutines-and-channels.md)을 참조하세요.

## 다음 단계

* [코루틴 기초 가이드](coroutines-basics.md)에서 코루틴, 일시 중단 함수 및 빌더의 기본 사항을 알아보세요.
* [일시 중단 함수 구성하기](coroutine-context-and-dispatchers.md)에서 일시 중단 함수를 결합하고 코루틴 파이프라인을 구축하는 방법을 살펴보세요.
* IntelliJ IDEA의 내장 도구를 사용하여 [코루틴 디버깅](debug-coroutines-with-idea.md) 방법을 배워보세요.
* Flow 전용 디버깅에 대해서는 [IntelliJ IDEA를 사용한 Kotlin Flow 디버깅](debug-flow-with-idea.md) 튜토리얼을 참조하세요.
* 코루틴 기반 UI 개발에 대해 알아보려면 [코루틴을 이용한 UI 프로그래밍 가이드](https://github.com/Kotlin/kotlinx.coroutines/blob/master/ui/coroutines-guide-ui.md)를 읽어보세요.
* [Android에서 코루틴을 사용하기 위한 권장 사항](https://developer.android.com/kotlin/coroutines/coroutines-best-practices)을 검토해 보세요.
* [`kotlinx.coroutines` API 레퍼런스](https://kotlinlang.org/api/kotlinx.coroutines/)를 확인하세요.