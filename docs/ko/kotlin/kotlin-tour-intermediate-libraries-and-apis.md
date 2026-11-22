[//]: # (title: 라이브러리와 API)

<no-index/>

Kotlin을 최대한 활용하려면 기존 라이브러리와 API를 사용하여 바퀴를 다시 발명하는 데 드는 시간을 줄이고 코딩에 더 많은 시간을 집중하세요.

라이브러리는 일반적인 작업을 단순화하는 재사용 가능한 코드를 배포합니다. 라이브러리 내부에는 관련된 클래스, 함수, 유틸리티를 그룹화하는 패키지와 객체가 있습니다. 라이브러리는 개발자가 코드에서 사용할 수 있는 함수, 클래스 또는 프로퍼티의 모음으로 API(Application Programming Interface)를 노출합니다.

![Kotlin 라이브러리와 API](kotlin-library-diagram.svg){width=600}

Kotlin으로 무엇을 할 수 있는지 살펴보겠습니다.

## 표준 라이브러리 {id="the-standard-library"}

Kotlin에는 코드를 간결하고 표현력 있게 만들어 주는 필수 타입, 함수, 컬렉션 및 유틸리티를 제공하는 표준 라이브러리가 있습니다. 표준 라이브러리의 상당 부분([`kotlin` 패키지](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/)에 포함된 모든 것)은 명시적으로 임포트할 필요 없이 모든 Kotlin 파일에서 바로 사용할 수 있습니다.

```kotlin
fun main() {
    val text = "emosewa si niltoK"
    
   // 표준 라이브러리의 reversed() 함수 사용
    val reversedText = text.reversed()

    // 표준 라이브러리의 print() 함수 사용
    print(reversedText)
    // Kotlin is awesome
}
```
{kotlin-runnable="true" id="kotlin-tour-libraries-stdlib"}

하지만 표준 라이브러리의 일부 기능은 코드에서 사용하기 전에 임포트해야 합니다. 
예를 들어 표준 라이브러리의 시간 측정 기능을 사용하려면 [`kotlin.time` 패키지](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.time/)를 임포트해야 합니다.

파일 상단에 `import` 키워드를 추가하고 그 뒤에 필요한 패키지를 작성합니다.

```kotlin
import kotlin.time.*
```

별표 `*`는 패키지 내의 모든 것을 임포트하도록 Kotlin에 지시하는 와일드카드 임포트입니다. 동반 객체(companion object)에는 별표 `*`를 사용할 수 없습니다. 대신 사용하려는 동반 객체의 멤버를 명시적으로 선언해야 합니다.

예를 들면 다음과 같습니다.

```kotlin
import kotlin.time.Duration
import kotlin.time.Duration.Companion.hours
import kotlin.time.Duration.Companion.minutes

fun main() {
    val thirtyMinutes: Duration = 30.minutes
    val halfHour: Duration = 0.5.hours
    println(thirtyMinutes == halfHour)
    // true
}
```
{kotlin-runnable="true" id="kotlin-tour-libraries-time"}

이 예제는 다음과 같이 동작합니다.

* `Duration` 클래스와 해당 동반 객체의 `hours` 및 `minutes` 확장 프로퍼티를 임포트합니다.
* `minutes` 프로퍼티를 사용하여 `30`을 30분의 `Duration`으로 변환합니다.
* `hours` 프로퍼티를 사용하여 `0.5`를 30분의 `Duration`으로 변환합니다.
* 두 기간이 같은지 확인하고 결과를 출력합니다.

### 직접 만들기 전에 먼저 검색하기 {id="search-before-you-build"}

직접 코드를 작성하기로 결정하기 전에, 원하는 기능이 표준 라이브러리에 이미 존재하는지 확인해 보세요. 
표준 라이브러리에서 이미 수많은 클래스, 함수, 프로퍼티를 제공하는 대표적인 영역은 다음과 같습니다.

* [컬렉션(Collections)](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/)
* [시퀀스(Sequences)](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.sequences/)
* [문자열 조작(String manipulation)](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/)
* [시간 관리(Time management)](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.time/)

표준 라이브러리에 어떤 기능이 더 있는지 알아보려면 [API 레퍼런스](https://kotlinlang.org/api/core/kotlin-stdlib/)를 살펴보세요.

## Kotlin 라이브러리 {id="kotlin-libraries"}

표준 라이브러리는 일반적인 여러 사용 사례를 다루지만, 다루지 않는 영역도 있습니다. 다행히 Kotlin 팀과 커뮤니티는 표준 라이브러리를 보완하는 다양한 라이브러리를 개발해 왔습니다. 예를 들어, [`kotlinx-datetime`](https://kotlinlang.org/api/kotlinx-datetime/)은 여러 플랫폼 간에 시간을 편리하게 관리할 수 있도록 도와줍니다.

유용한 라이브러리는 [검색 플랫폼](https://klibs.io/)에서 찾을 수 있습니다. 라이브러리를 사용하려면 의존성(dependency)이나 플러그인을 추가하는 등의 추가 단계가 필요합니다. 각 라이브러리의 GitHub 저장소에는 Kotlin 프로젝트에 라이브러리를 포함하는 방법에 대한 안내가 나와 있습니다.

라이브러리를 추가하면 라이브러리 내의 어떤 패키지든 임포트할 수 있습니다. 다음은 `kotlinx-datetime` 패키지를 임포트하여 뉴욕의 현재 시각을 확인하는 예제입니다.

```kotlin
import kotlinx.datetime.*

fun main() {
    val now = Clock.System.now() // 현재 시점(Instant) 가져오기
    println("Current instant: $now")

    val zone = TimeZone.of("America/New_York")
    val localDateTime = now.toLocalDateTime(zone)
    println("Local date-time in NY: $localDateTime")
}
```
{kotlin-runnable="true" id="kotlin-tour-libraries-datetime"}

이 예제는 다음과 같이 동작합니다.

* `kotlinx.datetime` 패키지를 임포트합니다.
* `Clock.System.now()` 함수를 사용하여 현재 시간이 포함된 `Instant` 클래스의 인스턴스를 생성하고 결과를 `now` 변수에 할당합니다.
* 현재 시간을 출력합니다.
* `TimeZone.of()` 함수를 사용하여 뉴욕의 시간대를 찾고 결과를 `zone` 변수에 할당합니다.
* 현재 시간을 담고 있는 인스턴스에서 뉴욕 시간대를 인수로 전달하여 `.toLocalDateTime()` 함수를 호출합니다.
* 결과를 `localDateTime` 변수에 할당합니다.
* 뉴욕 시간대에 맞게 조정된 시간을 출력합니다.

> 이 예제에서 사용하는 함수와 클래스에 대해 자세히 알아보려면 [API 레퍼런스](https://kotlinlang.org/api/kotlinx-datetime/kotlinx-datetime/kotlinx.datetime/)를 참고하세요.
>
{style="tip"}

## API 옵트인(Opt-in) {id="opt-in-to-apis"}

라이브러리 작성자는 코드에서 특정 API를 사용하기 전에 명시적인 동의(옵트인)를 요구하도록 표시할 수 있습니다. 대개 해당 API가 아직 개발 중이며 향후 변경될 가능성이 있을 때 이렇게 설정합니다. 옵트인하지 않으면 다음과 같은 경고나 오류가 표시됩니다.

```text
This declaration needs opt-in. Its usage should be marked with '@...' or '@OptIn(...)'
```

옵트인하려면 `@OptIn`을 작성하고 괄호 안에 해당 API를 분류하는 클래스 이름을 적은 뒤 콜론 두 개(`::`)와 `class`를 붙입니다.

예를 들어 표준 라이브러리의 `uintArrayOf()` 함수는 [API 레퍼런스](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/to-u-int-array.html)에 명시된 대로 `@ExperimentalUnsignedTypes`에 속합니다.

```kotlin
@ExperimentalUnsignedTypes
inline fun uintArrayOf(vararg elements: UInt): UIntArray
```

코드에서는 다음과 같이 옵트인합니다.

```kotlin
@OptIn(ExperimentalUnsignedTypes::class)
```

다음은 `uintArrayOf()` 함수를 사용하여 부호 없는 정수 배열을 생성하고 그중 한 요소를 수정하기 위해 옵트인하는 예제입니다.

```kotlin
@OptIn(ExperimentalUnsignedTypes::class)
fun main() {
    // 부호 없는 정수 배열 생성
    val unsignedArray: UIntArray = uintArrayOf(1u, 2u, 3u, 4u, 5u)

    // 요소 수정
    unsignedArray[2] = 42u
    println("Updated array: ${unsignedArray.joinToString()}")
    // Updated array: 1, 2, 42, 4, 5
}
```
{kotlin-runnable="true" id="kotlin-tour-libraries-apis"}

이 방법이 가장 간단한 옵트인 방식이지만 다른 방법도 있습니다. 자세히 알아보려면 [옵트인 요구사항(Opt-in requirements)](opt-in-requirements.md)을 참고하세요.

## 연습 문제 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="복리 계산하기" id="libraries-exercise-1">

사용자가 투자금의 미래 가치를 계산할 수 있도록 돕는 금융 애플리케이션을 개발하고 있습니다. 복리를 계산하는 공식은 다음과 같습니다.

<math>A = P \times (1 + \displaystyle\frac{r}{n})^{nt}</math>

각 항목의 의미는 다음과 같습니다.

* `A`는 이자가 적용된 후 축적된 총금액(원금 + 이자)입니다.
* `P`는 원금(초기 투자금)입니다.
* `r`은 연간 이자율(소수점 표기)입니다.
* `n`은 연간 복리 계산 횟수입니다.
* `t`는 투자 기간(년 단위)입니다.

다음을 수행하도록 코드를 업데이트하세요.

1. [`kotlin.math` 패키지](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.math/)에서 필요한 함수를 임포트합니다.
2. 복리를 적용한 최종 금액을 계산하도록 `calculateCompoundInterest()` 함수의 본문을 구현합니다.

```kotlin
// 여기에 코드를 작성하세요

fun calculateCompoundInterest(P: Double, r: Double, n: Int, t: Int): Double {
    // 여기에 코드를 작성하세요
}

fun main() {
    val principal = 1000.0
    val rate = 0.05
    val timesCompounded = 4
    val years = 5
    val amount = calculateCompoundInterest(principal, rate, timesCompounded, years)
    println("The accumulated amount is: $amount")
    // The accumulated amount is: 1282.0372317085844
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/CalculateCompoundInterestTest.kt" validate="false" id="kotlin-tour-libraries-exercise-1"}

```kotlin
import kotlin.math.*

fun calculateCompoundInterest(P: Double, r: Double, n: Int, t: Int): Double {
    return P * (1 + r / n).pow(n * t)
}

fun main() {
    val principal = 1000.0
    val rate = 0.05
    val timesCompounded = 4
    val years = 5
    val amount = calculateCompoundInterest(principal, rate, timesCompounded, years)
    println("The accumulated amount is: $amount")
    // The accumulated amount is: 1282.0372317085844
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/CalculateCompoundInterestTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="해결 예시" id="kotlin-tour-libraries-solution-1"}

</def>
<def title="데이터 처리에 소요되는 시간 측정하기" id="libraries-exercise-2">

프로그램에서 여러 데이터 처리 작업을 수행하는 데 걸리는 시간을 측정하려고 합니다. [`kotlin.time`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.time/) 패키지에서 올바른 임포트 문과 함수를 추가하도록 코드를 업데이트하세요.

```kotlin
// 여기에 코드를 작성하세요

fun main() {
    val timeTaken = /* 여기에 코드를 작성하세요 */ {
        // 데이터 처리 시뮬레이션
        val data = List(1000) { it * 2 }
        val filteredData = data.filter { it % 3 == 0 }

        // 필터링된 데이터 처리 시뮬레이션
        val processedData = filteredData.map { it / 2 }
        println("Processed data")
    }

    println("Time taken: $timeTaken") // 예: 16 ms
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/MeasureTimeTest.kt" validate="false" id="kotlin-tour-libraries-exercise-2"}

```kotlin
import kotlin.time.measureTime

fun main() {
    val timeTaken = measureTime {
        // 데이터 처리 시뮬레이션
        val data = List(1000) { it * 2 }
        val filteredData = data.filter { it % 3 == 0 }

        // 필터링된 데이터 처리 시뮬레이션
        val processedData = filteredData.map { it / 2 }
        println("Processed data")
    }

    println("Time taken: $timeTaken") // 예: 16 ms
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/MeasureTimeTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="해결 예시" id="kotlin-tour-libraries-solution-2"}

</def>
<def title="실험적 API에 옵트인하기" id="libraries-exercise-3">

최신 Kotlin 릴리스의 표준 라이브러리에 새로운 기능이 추가되었습니다. 이 기능을 사용해 보고 싶지만 옵트인이 필요합니다. 이 기능은 [`@ExperimentalStdlibApi`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-experimental-stdlib-api/)에 속해 있습니다.
코드에서 옵트인은 어떤 형태여야 할까요?

```kotlin
@OptIn(ExperimentalStdlibApi::class)
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="해결 예시" id="kotlin-tour-libraries-solution-3"}

</def>
</deflist>

## 다음 단계는? {id="what-s-next"}

축하합니다! 중급 투어를 완료하셨습니다! 학습 경험에 대한 [피드백을 공유](https://surveys.hotjar.com/bf4ce865-99ce-4fc1-b107-e9b16bc31592)해 주시겠어요?

다음 단계로, 자주 활용되는 Kotlin 애플리케이션 튜토리얼을 확인해 보세요.

<p></p> <!-- workaround for MRK057: Paragraph can only contain inline elements -->
<panels columns="2" id="kotlin-tour-whats-next">
    <panel>
        <title>백엔드를 위한 Kotlin</title>
        <p>Spring Boot와 Kotlin을 사용하여 백엔드 애플리케이션을 생성합니다.</p>
        <a href="jvm-create-project-with-spring-boot.md" as="button" icon="arrow-right" icon-position="right" id="kotlin-tour-backend-tutorial">시작하기</a>
    </panel>
    <panel>
        <title>Kotlin Multiplatform</title>
        <p>처음부터 크로스 플랫폼 애플리케이션을 만들고 비즈니스 로직과 UI를 공유해 보세요.</p>
        <a href="https://kotlinlang.org/docs/multiplatform/compose-multiplatform-new-project.html" as="button" icon="arrow-right" icon-position="right" id="kotlin-tour-cmp-tutorial">시작하기</a>
    </panel>
</panels>

<seealso></seealso>

<list id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-intermediate-null-safety.md" mode="outline" icon="arrow-left" icon-position="left">이전 단계</a>
  </li>
</list>