[//]: # (title: 라이브러리와 API)

<no-index/>

Kotlin을 최대한 활용하려면 기존 라이브러리와 API를 사용하여 바퀴를 다시 발명하는 시간을 줄이고 코딩에 더 많은 시간을 투자하세요.

라이브러리는 일반적인 작업을 단순화하는 재사용 가능한 코드를 배포합니다. 라이브러리 내에는 관련 클래스, 함수 및 유틸리티를 그룹화하는 패키지와 객체가 있습니다. 라이브러리는 개발자가 코드에서 사용할 수 있는 함수, 클래스 또는 프로퍼티의 집합으로 API(Application Programming Interfaces)를 노출합니다.

![Kotlin 라이브러리와 API](kotlin-library-diagram.svg){width=600}

Kotlin으로 무엇이 가능한지 살펴보겠습니다.

## 표준 라이브러리

Kotlin에는 코드를 간결하고 표현력 있게 만들어주는 필수 타입, 함수, 컬렉션 및 유틸리티를 제공하는 표준 라이브러리가 있습니다. 표준 라이브러리의 많은 부분([`kotlin` 패키지](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/)에 있는 모든 것)은 명시적으로 임포트할 필요 없이 모든 Kotlin 파일에서 즉시 사용할 수 있습니다.

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

하지만 표준 라이브러리의 일부 기능은 코드에서 사용하기 전에 임포트가 필요합니다. 
예를 들어, 표준 라이브러리의 시간 측정 기능을 사용하려면 [`kotlin.time` 패키지](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.time/)를 임포트해야 합니다.

파일의 맨 위에 `import` 키워드와 필요한 패키지명을 추가합니다.

```kotlin
import kotlin.time.*
```

별표 `*`는 Kotlin에 해당 패키지 내의 모든 것을 임포트하도록 지시하는 와일드카드 임포트입니다. 동반 객체(companion objects)에는 별표 `*`를 사용할 수 없습니다. 대신 사용하려는 동반 객체의 멤버를 명시적으로 선언해야 합니다.

예를 들어:

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

이 예제는 다음과 같습니다:

* `Duration` 클래스와 해당 동반 객체의 `hours` 및 `minutes` 확장 프로퍼티를 임포트합니다.
* `minutes` 프로퍼티를 사용하여 `30`을 30분이라는 `Duration`으로 변환합니다.
* `hours` 프로퍼티를 사용하여 `0.5`를 30분이라는 `Duration`으로 변환합니다.
* 두 기간이 동일한지 확인하고 결과를 출력합니다.

### 직접 만들기 전에 검색하세요

직접 코드를 작성하기로 결정하기 전에, 찾고 있는 기능이 표준 라이브러리에 이미 존재하는지 확인하세요. 다음은 표준 라이브러리가 이미 다양한 클래스, 함수 및 프로퍼티를 제공하고 있는 영역 목록입니다:

* [컬렉션(Collections)](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/)
* [시퀀스(Sequences)](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.sequences/)
* [문자열 조작(String manipulation)](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/)
* [시간 관리(Time management)](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.time/)

표준 라이브러리에 무엇이 더 있는지 알아보려면 [API 레퍼런스](https://kotlinlang.org/api/core/kotlin-stdlib/)를 살펴보세요.

## Kotlin 라이브러리

표준 라이브러리는 많은 일반적인 사용 사례를 다루지만, 그렇지 않은 경우도 있습니다. 다행히 Kotlin 팀과 커뮤니티는 표준 라이브러리를 보완하기 위해 광범위한 라이브러리를 개발했습니다. 예를 들어, [`kotlinx-datetime`](https://kotlinlang.org/api/kotlinx-datetime/)은 다양한 플랫폼에서 시간을 관리하는 데 도움을 줍니다.

유용한 라이브러리는 [검색 플랫폼](https://klibs.io/)에서 찾을 수 있습니다. 이를 사용하려면 의존성이나 플러그인 추가와 같은 추가 단계가 필요합니다. 각 라이브러리에는 Kotlin 프로젝트에 포함하는 방법에 대한 지침이 담긴 GitHub 저장소가 있습니다.

라이브러리를 추가하면 해당 라이브러리 내의 모든 패키지를 임포트할 수 있습니다. 다음은 뉴욕의 현재 시간을 찾기 위해 `kotlinx-datetime` 패키지를 임포트하는 예제입니다: 

```kotlin
import kotlinx.datetime.*

fun main() {
    val now = Clock.System.now() // 현재 순간(instant) 가져오기
    println("Current instant: $now")

    val zone = TimeZone.of("America/New_York")
    val localDateTime = now.toLocalDateTime(zone)
    println("Local date-time in NY: $localDateTime")
}
```
{kotlin-runnable="true" id="kotlin-tour-libraries-datetime"}

이 예제는 다음과 같습니다:

* `kotlinx.datetime` 패키지를 임포트합니다.
* `Clock.System.now()` 함수를 사용하여 현재 시간을 포함하는 `Instant` 클래스의 인스턴스를 생성하고 결과를 `now` 변수에 할당합니다.
* 현재 시간을 출력합니다.
* `TimeZone.of()` 함수를 사용하여 뉴욕의 시간대를 찾고 결과를 `zone` 변수에 할당합니다.
* 현재 시간을 포함하는 인스턴스에서 `.toLocalDateTime()` 함수를 호출하고 뉴욕 시간대를 인자로 전달합니다.
* 결과를 `localDateTime` 변수에 할당합니다.
* 뉴욕의 시간대에 맞춰 조정된 시간을 출력합니다.

> 이 예제에서 사용된 함수와 클래스를 더 자세히 살펴보려면 [API 레퍼런스](https://kotlinlang.org/api/kotlinx-datetime/kotlinx-datetime/kotlinx.datetime/)를 참조하세요.
>
{style="tip"}

## API 옵트인

라이브러리 작성자는 코드에서 사용하기 전에 옵트인(opt-in)이 필요한 것으로 특정 API를 표시할 수 있습니다. 일반적으로 API가 아직 개발 중이며 향후 변경될 수 있는 경우에 이렇게 합니다. 옵트인하지 않으면 다음과 같은 경고나 오류가 표시됩니다:

```text
This declaration needs opt-in. Its usage should be marked with '@...' or '@OptIn(...)'
```

옵트인하려면 `@OptIn`을 작성한 후 API를 분류하는 클래스 이름 뒤에 두 개의 콜론 `::`과 `class`를 붙여 괄호 안에 넣습니다.

예를 들어, 표준 라이브러리의 `uintArrayOf()` 함수는 [API 레퍼런스](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/to-u-int-array.html)에 표시된 대로 `@ExperimentalUnsignedTypes`에 해당합니다:

```kotlin
@ExperimentalUnsignedTypes
inline fun uintArrayOf(vararg elements: UInt): UIntArray
```

코드에서 옵트인은 다음과 같이 작성합니다:

```kotlin
@OptIn(ExperimentalUnsignedTypes::class)
```

다음은 부호 없는 정수(unsigned integers) 배열을 생성하고 그 요소 중 하나를 수정하기 위해 `uintArrayOf()` 함수 사용을 옵트인하는 예제입니다:

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

이것이 옵트인하는 가장 쉬운 방법이지만 다른 방법도 있습니다. 자세히 알아보려면 [옵트인 요구 사항](opt-in-requirements.md)을 참조하세요.

## 연습 문제 {completion-point="true"}

### 연습 문제 1 {initial-collapse-state="collapsed" collapsible="true" id="libraries-exercise-1"}

당신은 사용자가 투자의 미래 가치를 계산하는 데 도움이 되는 금융 애플리케이션을 개발하고 있습니다. 복리 이자를 계산하는 공식은 다음과 같습니다:

<math>A = P \times (1 + \displaystyle\frac{r}{n})^{nt}</math>

각 항목의 의미는 다음과 같습니다:

* `A`는 이자 적용 후 누적된 금액(원금 + 이자)입니다.
* `P`는 원금(초기 투자금)입니다.
* `r`은 연이율(소수점)입니다.
* `n`은 연간 복리 계산 횟수입니다.
* `t`는 돈이 투자된 기간(연 단위)입니다.

다음을 수행하도록 코드를 업데이트하세요:

1. [`kotlin.math` 패키지](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.math/)에서 필요한 함수를 임포트합니다.
2. 복리를 적용한 후의 최종 금액을 계산하도록 `calculateCompoundInterest()` 함수의 본문을 추가합니다.

|--|--|

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
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-libraries-exercise-1"}

|---|---|
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="예시 솔루션" id="kotlin-tour-libraries-solution-1"}

### 연습 문제 2 {initial-collapse-state="collapsed" collapsible="true" id="libraries-exercise-2"}

프로그램에서 여러 데이터 처리 작업을 수행하는 데 걸리는 시간을 측정하려고 합니다. 올바른 임포트 문과 [`kotlin.time`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.time/) 패키지의 함수를 추가하도록 코드를 업데이트하세요:

|---|---|

```kotlin
// 여기에 코드를 작성하세요

fun main() {
    val timeTaken = /* 여기에 코드를 작성하세요 */ {
        // 일부 데이터 처리 시뮬레이션
        val data = List(1000) { it * 2 }
        val filteredData = data.filter { it % 3 == 0 }

        // 필터링된 데이터 처리 시뮬레이션
        val processedData = filteredData.map { it / 2 }
        println("Processed data")
    }

    println("Time taken: $timeTaken") // 예: 16 ms
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-libraries-exercise-2"}

|---|---|
```kotlin
import kotlin.time.measureTime

fun main() {
    val timeTaken = measureTime {
        // 일부 데이터 처리 시뮬레이션
        val data = List(1000) { it * 2 }
        val filteredData = data.filter { it % 3 == 0 }

        // 필터링된 데이터 처리 시뮬레이션
        val processedData = filteredData.map { it / 2 }
        println("Processed data")
    }

    println("Time taken: $timeTaken") // 예: 16 ms
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="예시 솔루션" id="kotlin-tour-libraries-solution-2"}

### 연습 문제 3 {initial-collapse-state="collapsed" collapsible="true" id="properties-exercise-3"}

최신 Kotlin 릴리스의 표준 라이브러리에 새로운 기능이 추가되었습니다. 이 기능을 사용해 보고 싶지만 옵트인이 필요합니다. 이 기능은 [`@ExperimentalStdlibApi`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-experimental-stdlib-api/)에 해당합니다. 코드에서 옵트인은 어떤 모습이어야 할까요?

|---|---|
```kotlin
@OptIn(ExperimentalStdlibApi::class)
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="예시 솔루션" id="kotlin-tour-libraries-solution-3"}

## 다음 단계는 무엇인가요?

축하합니다! 중급 투어를 마쳤습니다! 여러분의 경험에 대한 [피드백을 공유](https://surveys.hotjar.com/bf4ce865-99ce-4fc1-b107-e9b16bc31592)해 주시겠어요? 

다음 단계로, 인기 있는 Kotlin 애플리케이션을 위한 튜토리얼을 확인해 보세요:

* [Spring Boot와 Kotlin으로 백엔드 애플리케이션 만들기](jvm-create-project-with-spring-boot.md)
* Android 및 iOS용 크로스 플랫폼 애플리케이션을 처음부터 만들기:
    * [UI는 네이티브로 유지하면서 비즈니스 로직 공유하기](https://kotlinlang.org/docs/multiplatform/multiplatform-create-first-app.html)
    * [비즈니스 로직과 UI 모두 공유하기](https://kotlinlang.org/docs/multiplatform/compose-multiplatform-create-first-app.html)

<seealso></seealso>

<list id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-intermediate-null-safety.md" mode="outline" icon="arrow-left" icon-position="left">이전 단계</a>
  </li>
</list>