[//]: # (title: 타입 별칭(Type aliases))

타입 별칭(Type aliases)은 기존 타입에 대한 대체 이름을 제공합니다. 길거나 자주 사용되는 타입 표현을 더 짧고 이해하기 쉽게 만들 수 있습니다.

예를 들어, 제네릭 타입, 함수 타입, 그리고 중첩 클래스나 내부 클래스에 대한 별칭을 만들 수 있습니다:

```kotlin
// 제네릭 타입
typealias UserIndex = Map<Long, User>
typealias FileTable<K> = MutableMap<K, MutableList<File>>

// 함수 타입
typealias RequestHandler = (Request) -> Response
typealias Predicate<T> = (T) -> Boolean

// 내부 클래스와 중첩 클래스
class Database {
    inner class Transaction
}
typealias DatabaseTransaction = Database.Transaction
```

타입 별칭은 새로운 타입을 생성하지 않습니다. 기존 타입에 대한 대체 이름을 도입할 뿐입니다. 별칭과 그 기본 타입(underlying type)은 상호 교환이 가능합니다. 예를 들어, `typealias Predicate<T>`를 추가하고 `Predicate<Int>`를 사용하면, 컴파일러는 이를 `(Int) -> Boolean`으로 확장합니다. 따라서 기본 타입이 필요한 곳에 별칭으로 선언된 값을 사용할 수 있으며, 그 반대도 가능합니다:

```kotlin
typealias Predicate<T> = (T) -> Boolean

fun evaluate(predicate: Predicate<Int>) = predicate(42)

fun main() {
    val isPositive: (Int) -> Boolean = { it > 0 }
    println(evaluate(isPositive))
    // true

    val isValid: Predicate<Int> = { it > 0 }
    println(listOf(1, -2).filter(isValid))
    // [1]
}
```
{kotlin-runnable="true"}

## 타입 별칭 선언하기

타입 별칭은 다음과 같이 선언할 수 있습니다:

* Kotlin 파일의 최상위 레벨에서 [최상위 타입 별칭](#top-level-type-aliases)으로 선언.
* 클래스, 인터페이스 또는 객체 내부에서 [중첩 타입 별칭](#nested-type-aliases)으로 선언.

함수 내부나 [람다 표현식](lambdas.md#lambda-expressions-and-anonymous-functions)과 같은 로컬 스코프에서는 타입 별칭을 선언할 수 없습니다.

선언 위치는 타입 별칭의 스코프를 결정하며, 가시성(visibility)은 어떤 코드에서 해당 별칭에 접근할 수 있는지를 결정합니다. 기본적으로 타입 별칭은 `public`입니다. [중첩 타입 별칭](#nested-type-aliases)은 이를 포함하는 클래스, 인터페이스 또는 객체에 접근할 수 있는 곳에서만 접근할 수 있습니다. 예를 들어, `internal` 클래스 내부의 `public` 별칭은 모듈 외부에서 접근할 수 없습니다.

타입 별칭은 자신보다 더 제한적인 [가시성](visibility-modifiers.md)을 가진 기본 타입을 노출할 수 없습니다. 예를 들어, `public` 타입 별칭은 `private` 클래스를 참조할 수 없습니다.

### 최상위 타입 별칭

최상위 타입 별칭은 패키지 수준의 선언입니다. 동일한 패키지 내에서는 정규화되지 않은 이름(unqualified name)으로 별칭을 참조할 수 있습니다. 다른 패키지에서 별칭을 사용하려면 별칭을 임포트하거나 정규화된 이름(qualified name)으로 참조해야 합니다:

```kotlin
// UserId.kt
package org.example.users

typealias UserId = Long

// 동일한 패키지 내에서 정규화되지 않은 이름으로 별칭을 참조합니다
fun createUser(id: UserId) {
    // ...
}

// UserService.kt
package org.example.services

import org.example.users.UserId

// 임포트된 별칭을 정규화되지 않은 이름으로 사용합니다
fun findUser(id: UserId) {
    // ...
}

// 전체 정규화된 이름(fully qualified name)을 사용합니다
fun deleteUser(id: org.example.users.UserId) {
    // ...
}
```

### 중첩 타입 별칭

중첩 타입 별칭은 캡슐화를 개선하고, 패키지 수준의 혼란을 줄이며, 내부 구현을 단순화하여 더 깔끔하고 유지보수가 쉬운 코드를 가능하게 합니다. 중첩 타입 별칭은 [중첩 클래스](nested-classes.md)와 동일한 스코프 및 이름 확인(name-resolution) 규칙을 따릅니다.

대체 이름이 특정 선언의 컨텍스트 내에서만 유의미한 경우, 클래스, 인터페이스 또는 객체 내부에 타입 별칭을 선언하세요. 이렇게 하면 별칭을 사용하는 코드와 가깝게 유지할 수 있으며 패키지 스코프에 불필요한 이름을 추가하는 것을 피할 수 있습니다.

별칭을 포함하는 선언 내부에서는 정규화되지 않은 이름으로 별칭을 참조할 수 있습니다. 선언 외부에서는 별칭을 포함하는 선언의 이름으로 별칭을 정규화해야 합니다:

```kotlin
class UserRepository {
    typealias UserIndex = Map<UserId, User>

    // UserRepository 내부에서 정규화되지 않은 이름으로 별칭을 참조합니다
    fun saveAll(users: UserIndex) {
        // ...
    }
}

// UserRepository 외부에서 정규화된 이름으로 별칭을 참조합니다
fun synchronizeUsers(users: UserRepository.UserIndex) {
    // ...
}
```

> 중첩 타입 별칭은 Kotlin 멀티플랫폼의 [`expect/actual` 선언](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html)에서 지원되지 않습니다.
>
{style="note"}

#### 타입 파라미터

중첩 타입 별칭에서 타입 파라미터를 사용하려면 별칭 선언에 이를 추가하세요:

```kotlin
class Graph<Node> {
    typealias Path<T> = List<T>
}

val cityPath: Graph.Path<String> = listOf("London", "Berlin")
```

이 예제에서 `Path`는 자체 타입 파라미터 `T`를 선언합니다. `Graph.Path<String>`에서 `String`은 `T`에 대한 타입 인자이며, `Graph`에 의해 선언된 `Node` 타입 파라미터와는 독립적입니다.

만약 포함하는 클래스나 인터페이스에서 선언된 타입 파라미터를 참조하면 컴파일러가 에러를 발생시킵니다:

```kotlin
class Graph<Node> {
    typealias Path = List<Node>
    // Unresolved reference 'Node'.
}
```

여기서 `Path`는 자체 타입 파라미터를 선언하는 대신 `Graph`의 `Node`를 참조하려고 했기 때문에 오류가 발생합니다.