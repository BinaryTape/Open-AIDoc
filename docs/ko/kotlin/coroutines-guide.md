<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: 코루틴 가이드)

Kotlin은 다른 라이브러리들이 코루틴을 활용할 수 있도록 표준 라이브러리에 최소한의 저수준 API만을 제공합니다. 유사한 기능을 가진 다른 많은 언어와 달리, `async`와 `await`는 Kotlin의 키워드가 아니며 표준 라이브러리의 일부도 아닙니다. 또한, Kotlin의 *일시 중단 함수(suspending function)* 개념은 퓨처(futures)나 프로미스(promises)보다 비동기 작업에 대해 더 안전하고 에러 발생 가능성이 적은 추상화를 제공합니다.  

`kotlinx.coroutines`는 JetBrains에서 개발한 코루틴을 위한 풍부한 라이브러리입니다. 이 가이드에서는 `launch`, `async` 등을 포함하여 코루틴이 적용된 다양한 고수준 프리미티브(primitives)를 다룹니다. 

이 문서는 `kotlinx.coroutines`의 핵심 기능에 대한 가이드로, 여러 주제로 나뉘어 있으며 일련의 예제를 포함하고 있습니다.

코루틴을 사용하고 이 가이드의 예제를 따라 하려면, [프로젝트 README](https://github.com/Kotlin/kotlinx.coroutines/blob/master/README.md#using-in-your-projects)에 설명된 대로 `kotlinx-coroutines-core` 모듈에 대한 의존성을 추가해야 합니다.

## 목차

* [코루틴 기초(Coroutines basics)](coroutines-basics.md)
* [튜토리얼: 코루틴과 채널 소개](coroutines-and-channels.md)
* [취소와 타임아웃](coroutines-cancellation.md)
* [일시 중단 함수 구성하기](composing-suspending-functions.md)
* [코루틴 컨텍스트와 디스패처](coroutine-context-and-dispatchers.md)
* [비동기 플로우(Asynchronous Flow)](coroutines-flow.md)
* [채널(Channels)](channels.md)
* [코루틴 예외 처리](exception-handling.md)
* [공유 뮤터블 상태와 동시성](shared-mutable-state-and-concurrency.md)
* [Select 표현식 (실험적)](select-expression.md)
* [튜토리얼: IntelliJ IDEA를 사용하여 코루틴 디버깅하기](debug-coroutines-with-idea.md)
* [튜토리얼: IntelliJ IDEA를 사용하여 Kotlin Flow 디버깅하기](debug-flow-with-idea.md)

## 추가 참고 자료

* [코루틴을 활용한 UI 프로그래밍 가이드](https://github.com/Kotlin/kotlinx.coroutines/blob/master/ui/coroutines-guide-ui.md)
* [코루틴 디자인 문서 (KEEP)](https://github.com/Kotlin/KEEP/blob/master/proposals/coroutines.md)
* [전체 kotlinx.coroutines API 레퍼런스](https://kotlinlang.org/api/kotlinx.coroutines/)
* [Android 코루틴 모범 사례](https://developer.android.com/kotlin/coroutines/coroutines-best-practices)
* [Kotlin 코루틴 및 플로우에 관한 추가 Android 리소스](https://developer.android.com/kotlin/coroutines/additional-resources)