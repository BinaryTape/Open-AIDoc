[//]: # (title: 가독성)

가독성 좋은 API를 만드는 것은 단순히 깨끗한 코드를 작성하는 것 그 이상을 의미합니다.
통합과 사용을 단순화하는 사려 깊은 설계가 필요합니다.
이 섹션에서는 조합성(composability)을 염두에 두고 라이브러리를 구조화하고, 간결하고 표현력 있는 설정을 위해 도메인 특화 언어(DSL)를 활용하며, 명확하고 유지보수 가능한 코드를 위해 확장 함수 및 프로퍼티를 사용하여 API 가독성을 높이는 방법을 살펴봅니다.

## 명시적인 조합성 선호

라이브러리는 종종 커스터마이징을 허용하는 고급 연산자를 제공합니다.
예를 들어, 어떤 연산은 사용자가 직접 데이터 구조, 네트워킹 채널, 타이머 또는 수명 주기 관찰자(lifecycle observer)를 제공할 수 있도록 허용할 수 있습니다.
그러나 이러한 커스터마이징 옵션을 추가적인 함수 매개변수를 통해 도입하면 API의 복잡성이 크게 증가할 수 있습니다.

커스터마이징을 위해 더 많은 매개변수를 추가하는 대신, 서로 다른 동작들을 함께 조합할 수 있도록 API를 설계하는 것이 더 효과적입니다.
예를 들어, 코루틴 Flow API에서는 [버퍼링과 합류(conflation)](coroutines-flow-operators.md#concurrent-processing-operators)가 모두 별도의 함수로 구현되어 있습니다.
이들은 각 기본 연산이 버퍼링과 합류를 제어하는 매개변수를 받는 대신, [`filter`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/filter.html) 및 [`map`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/map.html)과 같은 더 기본적인 연산과 함께 체인으로 연결될 수 있습니다.

또 다른 예로는 [Jetpack Compose의 Modifiers API](https://developer.android.com/develop/ui/compose/modifiers)가 있습니다.
이를 통해 Composable 컴포넌트는 패딩, 크기 조정, 배경색과 같은 공통 커스터마이징 옵션을 처리하는 단일 `Modifier` 매개변수를 받을 수 있습니다.
이러한 접근 방식은 각 Composable이 이러한 커스터마이징을 위해 별도의 매개변수를 받을 필요가 없도록 하여 API를 간소화하고 복잡성을 줄여줍니다.

```kotlin
Box(
    modifier = Modifier
        .padding(10.dp)
        .onClick { println("Box clicked!") }
        .fillMaxWidth()
        .fillMaxHeight()
        .verticalScroll(rememberScrollState())
        .horizontalScroll(rememberScrollState())
) {
    // Box content goes here
}
```

## DSL 사용

Kotlin 라이브러리는 빌더 DSL을 제공함으로써 가독성을 크게 향상시킬 수 있습니다.
DSL을 사용하면 도메인 특화 데이터 선언을 간결하게 반복할 수 있습니다.
예를 들어, Ktor 기반 서버 애플리케이션의 다음 샘플을 고려해 보세요.

```kotlin
fun Application.module() {
    install(ContentNegotiation) {
        json(Json {
            prettyPrint = true
            isLenient = true
        })
    }
    routing {
        post("/article") {
            call.respond<String>(HttpStatusCode.Created, ...)
        }
        get("/article/list") {
            call.respond<List<CreateArticle>>(...)
        }
        get("/article/{id}") {
            call.respond<Article>(...)
        }
    }
}
```

이 코드는 애플리케이션을 설정하고, Json 직렬화를 사용하도록 구성된 `ContentNegotiation` 플러그인을 설치하며, 애플리케이션이 다양한 `/article` 엔드포인트에 대한 요청에 응답하도록 라우팅을 설정합니다.

DSL 생성에 대한 자세한 설명은 [타입 안전한 빌더(Type-safe builders)](type-safe-builders.md)를 참조하세요.
라이브러리 제작 맥락에서는 다음 사항들을 유의할 가치가 있습니다.

* DSL에서 사용되는 함수들은 빌더 함수이며, 마지막 매개변수로 수신 객체 지정 람다(lambda with receiver)를 받습니다.
  이러한 설계를 통해 괄호 없이 함수를 호출할 수 있어 구문이 더 명확해집니다.
  전달되는 람다는 생성되는 엔티티를 구성하는 데 사용될 수 있습니다. 위의 예제에서 `routing` 함수에 전달된 람다는 라우팅의 세부 사항을 구성하는 데 사용됩니다.
* 클래스의 인스턴스를 생성하는 팩토리 함수는 반환 타입과 이름이 같아야 하며 대문자로 시작해야 합니다.
  위 샘플의 `Json` 인스턴스 생성에서 이를 확인할 수 있습니다.
  이러한 함수들은 여전히 구성을 위해 람다 매개변수를 가질 수 있습니다. 자세한 내용은 [코딩 컨벤션](coding-conventions.md#function-names)을 참조하세요.
* 빌더 함수에 제공된 람다 내에서 필수 프로퍼티가 설정되었는지 컴파일 타임에 보장하는 것은 불가능하므로, 필수 값은 함수 매개변수로 전달하는 것을 권장합니다.

객체를 빌드하기 위해 DSL을 사용하는 것은 가독성을 높일 뿐만 아니라 하위 호환성을 개선하고 문서화 프로세스를 단순화합니다. 예를 들어, 다음 함수를 살펴보겠습니다.

```kotlin
fun Json(prettyPrint: Boolean, isLenient: Boolean): Json
```

이 함수는 `Json{}` DSL 빌더를 대체할 수 있습니다. 그러나 DSL 방식에는 뚜렷한 이점이 있습니다.

* DSL 빌더를 사용하면 하위 호환성을 유지하기가 더 쉽습니다. 새로운 구성 옵션을 추가하는 것은 단순히 새로운 프로퍼티(또는 다른 예에서는 새로운 함수)를 추가하는 것을 의미하며, 이는 기존 함수의 매개변수 목록을 변경하는 것과 달리 하위 호환성을 유지하는 변경이기 때문입니다.
* 또한 문서 작성 및 유지 관리가 더 쉬워집니다. 함수의 많은 매개변수를 한 곳에서 모두 문서화하는 대신, 각 프로퍼티가 선언된 지점에서 개별적으로 문서화할 수 있습니다.

## 확장 함수 및 프로퍼티 사용

가독성을 높이기 위해 [확장 함수 및 프로퍼티](extensions.md)를 사용하는 것을 권장합니다.

클래스와 인터페이스는 타입의 핵심 개념을 정의해야 합니다.
추가적인 기능과 정보는 확장 함수와 프로퍼티로 작성해야 합니다.
이렇게 하면 독자에게 추가 기능이 핵심 개념 위에 구현될 수 있고, 추가 정보가 타입 내의 데이터로부터 계산될 수 있음을 명확히 알 수 있습니다.

예를 들어, (`String`도 구현하는) [`CharSequence`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-char-sequence/) 타입은 콘텐츠에 액세스하기 위한 가장 기본적인 정보와 연산자만 포함하고 있습니다.

```kotlin
interface CharSequence {
    val length: Int
    operator fun get(index: Int): Char
    fun subSequence(startIndex: Int, endIndex: Int): CharSequence
}
```

문자열과 일반적으로 연관된 기능들은 대부분 확장 함수로 정의되어 있으며, 이들은 모두 타입의 핵심 개념과 기본 API 위에서 구현될 수 있습니다.

```kotlin
inline fun CharSequence.isEmpty(): Boolean = length == 0
inline fun CharSequence.isNotEmpty(): Boolean = length > 0

inline fun CharSequence.trimStart(predicate: (Char) -> Boolean): CharSequence {
    for (index in this.indices)
        if (!predicate(this[index]))
           return subSequence(index, length)
    return ""
}
```

계산된 프로퍼티와 일반 메서드를 확장으로 선언하는 것을 고려해 보세요.
기본적으로 일반 프로퍼티, 오버라이드 및 오버로드된 연산자만 멤버로 선언되어야 합니다.

## 불리언 타입을 인자로 사용하지 않기

다음 함수를 고려해 보세요.

```kotlin
fun doWork(optimizeForSpeed: Boolean) { ... }
```

API에서 이 함수를 제공한다면 다음과 같이 호출될 수 있습니다.

```kotlin
doWork(true)
doWork(optimizeForSpeed=true)
```

첫 번째 호출에서는 매개변수 이름 힌트(Parameter Name Hints)가 활성화된 IDE에서 코드를 읽지 않는 한 불리언 인자가 무엇을 위한 것인지 유추하기가 불가능합니다.
이름이 지정된 인자(named arguments)를 사용하면 의도가 명확해지지만, 사용자에게 이 스타일을 채택하도록 강제할 방법은 없습니다.
따라서 가독성을 높이려면 코드에서 불리언 타입을 인자로 사용하지 않아야 합니다.

대안으로, API는 불리언 인자에 의해 제어되는 작업을 위해 별도의 함수를 특별히 만들 수 있습니다.
이 함수는 수행하는 작업을 나타내는 서술적인 이름을 가져야 합니다.

예를 들어, [`Iterable`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-iterable/) 인터페이스에는 다음과 같은 확장 기능이 제공됩니다.

```kotlin
fun <T, R> Iterable<T>.map(transform: (T) -> R): List<R>
fun <T, R : Any> Iterable<T>.mapNotNull(
    transform: (T) -> R?
): List<R>
```

단일 메서드를 사용하는 대신 다음과 같이 작성합니다.

```kotlin
fun <T, R> Iterable<T>.map(
    includeNullResults: Boolean = true, 
    transform: (T) -> R
): List<R>
```

또 다른 좋은 접근 방식은 `enum` 클래스를 사용하여 다양한 작동 모드를 정의하는 것입니다.
이 방식은 여러 작동 모드가 있거나 시간이 지남에 따라 이러한 모드가 변경될 것으로 예상되는 경우에 유용합니다.

## 숫자 타입을 적절하게 사용

Kotlin은 API의 일부로 사용할 수 있는 일련의 숫자 타입을 정의합니다. 이를 적절하게 사용하는 방법은 다음과 같습니다.

* `Int`, `Long`, `Double` 타입을 산술 타입으로 사용하세요. 이들은 계산이 수행되는 값을 나타냅니다.
* 비산술 엔티티에 산술 타입을 사용하지 마세요. 예를 들어, ID를 `Long`으로 표현하면 사용자는 ID가 순서대로 할당된다는 가정하에 ID를 비교하고 싶은 유혹을 느낄 수 있습니다.
  이는 신뢰할 수 없거나 의미 없는 결과를 초래할 수 있으며, 예고 없이 변경될 수 있는 구현에 대한 의존성을 만들 수 있습니다.
  더 나은 전략은 ID 추상화를 위한 전용 클래스를 정의하는 것입니다. 성능에 영향을 주지 않고 이러한 추상화를 구축하기 위해 [인라인 값 클래스(Inline value classes)](inline-classes.md)를 사용할 수 있습니다. 예제는 [`Duration`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/) 클래스를 참조하세요.
* `Byte`, `Float`, `Short` 타입은 메모리 레이아웃 타입입니다. 이들은 캐시나 네트워크를 통해 데이터를 전송할 때와 같이 값을 저장하는 데 사용할 수 있는 메모리 양을 제한하는 데 사용됩니다.
  이러한 타입은 기본 데이터가 해당 타입 내에 안정적으로 들어맞고 계산이 필요하지 않은 경우에만 사용해야 합니다.
* 부호 없는 정수 타입 `UByte`, `UShort`, `UInt`, `ULong`은 주어진 형식에서 사용 가능한 양수 값의 전체 범위를 활용하기 위해 사용해야 합니다. 이들은 부호 있는 타입의 범위를 벗어나는 값이 필요하거나 네이티브 라이브러리와의 상호 운용성이 필요한 시나리오에 적합합니다. 그러나 도메인이 [음수가 아닌 정수(non-negative integers)](unsigned-integer-types.md#non-goals)만 필요로 하는 상황에서는 사용하지 마세요.

## 다음 단계

가이드의 다음 파트에서는 일관성에 대해 배웁니다.

[다음 파트로 진행하기](api-guidelines-consistency.md)