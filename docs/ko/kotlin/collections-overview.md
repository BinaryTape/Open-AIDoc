[//]: # (title: 컬렉션 개요)

Kotlin 표준 라이브러리는 컬렉션을 다루기 위한 포괄적인 도구 세트를 제공합니다. 컬렉션은 해결하려는 문제와 관련되어 있으며 보통 함께 처리되는 항목들의 모음입니다. 컬렉션은 일반적으로 동일한 타입 또는 그 하위 타입의 요소를 포함합니다. 컬렉션 내부의 객체는 _요소(element)_ 또는 _아이템(item)_이라고 부릅니다.

컬렉션 API는 제네릭이므로 기본 내장(built-in) 타입과 사용자 정의 타입 모두에서 동일한 함수 및 인터페이스를 사용할 수 있습니다. `kotlin.collections` 패키지에는 컬렉션 인터페이스와 관련 함수들이 포함되어 있습니다.

Kotlin은 세 가지 주요 컬렉션 타입을 제공합니다:

* [_List_](collection-types.md#list)는 순서가 있는 컬렉션입니다. 인덱스를 통한 접근을 지원하며 중복된 요소를 포함할 수 있습니다. 예를 들어, 전화번호의 각 자릿수를 저장하는 데 리스트를 사용할 수 있습니다.
* [_Set_](collection-types.md#set)은 고유한(unique) 요소들의 컬렉션입니다. 순회 순서를 보장하지는 않지만, 특정 구현체는 삽입 순서를 유지하거나 요소들을 정렬된 상태로 유지할 수 있습니다. 예를 들어, 복권 번호를 저장하는 데 셋을 사용할 수 있습니다.
* [_Map_](collection-types.md#map)(또는 _딕셔너리_)은 키-값 쌍의 집합입니다. 각 키는 고유하며 하나의 값에 매핑됩니다. 예를 들어, 직원 ID와 직책을 연결하는 데 맵을 사용할 수 있습니다.

Kotlin은 [`ArrayDeque`](collection-types.md#arraydeque)도 제공합니다. 이는 큐(queue)나 스택(stack)으로 사용할 수 있는 양방향 큐(double-ended queue)입니다.

> 배열은 컬렉션 타입이 아닙니다. 배열과 컬렉션 중 무엇을 선택해야 할지는 [배열을 사용해야 하는 경우](arrays.md#when-to-use-arrays)에서 알아보세요.
>
{style="note"}

`List`, `Set`, `Map`에 대해 자세히 알아보려면 해당 섹션을 읽거나 Kotlin Developer Advocate인 Sebastian Aigner의 영상을 시청하세요:

<video src="https://www.youtube.com/v/F8jj7e-_jFA" title="Kotlin Collections Overview"/>

## 읽기 전용 컬렉션과 가변 컬렉션 {id="read-only-and-mutable-collections"}

각 주요 컬렉션 타입은 `List`와 같은 읽기 전용 인터페이스와 이에 대응하는 `MutableList`와 같은 가변(mutable) 인터페이스를 가집니다. 읽기 전용 인터페이스는 요소에 접근하기 위한 연산을 제공하며, 가변 인터페이스는 요소를 추가, 제거 및 업데이트하는 연산을 추가로 제공합니다.

호출자(caller)가 컬렉션을 수정할 필요가 없는 경우에는 읽기 전용 인터페이스를 사용하는 것이 좋습니다. 이는 API에서 의도를 명확히 드러내며, 해당 인터페이스를 통한 의도치 않은 수정을 방지합니다. 반면, 불변(immutable) 컬렉션은 생성 후 요소를 변경하는 것을 허용하지 않습니다. 불변 및 영속(persistent) 구현체가 필요한 경우 [`kotlinx-collections-immutable`](https://kotlinlang.org/api/kotlinx.collections.immutable/) 라이브러리를 사용하세요.

인터페이스는 다음과 같은 계층 구조를 이룹니다:

![Collection interfaces hierarchy](collections-diagram.png){width="500"}

[`Collection<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-collection/index.html)는 `List`와 `Set`의 공통 상위 인터페이스입니다. 컬렉션의 크기를 확인하는 등의 연산을 제공합니다. `Collection`은 요소의 반복 순회를 지원하는 `Iterable<T>` 인터페이스를 상속합니다. `Map`은 `Collection`을 상속하지 않습니다.

다양한 컬렉션 타입에 적용되는 함수의 파라미터로 `Collection`을 사용할 수 있습니다. 특정 타입에 특화된 연산이 필요한 경우에는 [`List`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/index.html) 또는 [`Set`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-set/index.html)과 같이 `Collection`을 상속하는 인터페이스를 사용하세요.