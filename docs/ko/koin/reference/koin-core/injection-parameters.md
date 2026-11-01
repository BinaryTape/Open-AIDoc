---
title: 주입된 파라미터
---

# 주입된 파라미터

어떤 객체는 사용자 ID나 현재 화면처럼 호출자(caller)만이 알고 있는 값을 필요로 합니다. 주입된 파라미터(Injected parameters)를 사용하면 호출자가 Koin에 인스턴스를 요청할 때 이러한 값을 전달할 수 있습니다. 이 페이지에서는 정의(definition)에서 파라미터를 선언하는 방법, 파라미터를 전달하는 방법, 그리고 Koin이 값을 파라미터에 매칭하는 방법을 다룹니다. 이 문서는 정의를 선언하는 방법을 이미 알고 있다고 가정합니다([정의(Definitions)](/docs/reference/koin-core/definitions) 참조).

## 파라미터 선언 및 전달 {id="declare-and-pass-a-parameter"}

어떤 생성자 파라미터가 호출자로부터 오는지 표시합니다. 나머지 파라미터는 평소와 같이 컨테이너에서 확인(resolve)됩니다:

**컴파일러 플러그인 DSL**
```kotlin
import org.koin.core.annotation.InjectedParam

class UserPresenter(
    @InjectedParam val userId: String,
    val repository: UserRepository,
)

val appModule = module {
    single<UserRepository>()
    factory<UserPresenter>()
}
```

`@InjectedParam`은 `koin-annotations` 아티팩트에서 제공됩니다. 컴파일러 플러그인에 `userId`가 정의가 아님을 알려주므로, 빌드 시점 검사에서 누락된 것으로 보고되지 않습니다.

**어노테이션**
```kotlin
@Factory
class UserPresenter(
    @InjectedParam val userId: String,
    val repository: UserRepository,
)
```

`@InjectedParam`은 프로바이더(provider) 함수 파라미터에서도 동작합니다.

**생성자 / 클래식 DSL**
정의 람다는 파라미터를 `params`로 받습니다:

```kotlin
val appModule = module {
    singleOf(::UserRepository)
    factory { params -> UserPresenter(userId = params.get(), repository = get()) }
}
```

호출자는 파라미터 순서와 동일하게 `parametersOf()`를 사용하여 값을 전달합니다:

```kotlin
import org.koin.core.parameter.parametersOf

val presenter: UserPresenter = get { parametersOf("user-42") }

// 또는 지연(lazy) 방식으로
val presenter: UserPresenter by inject { parametersOf("user-42") }
```

파라미터 블록은 람다이므로 인스턴스가 생성될 때 값을 읽습니다. `by inject()`를 사용하는 경우, 이는 최초 접근 시점입니다.

주입된 파라미터는 `factory` 정의를 위한 것입니다. `single`은 한 번만 생성되므로, 처음에 전달된 값이 사용되고 이후의 값은 무시됩니다.

각 플랫폼 API도 동일한 블록을 사용합니다. Compose에서는 `koinInject { parametersOf(userId) }`([Koin for Compose](/docs/reference/koin-compose/compose) 참조), ViewModel의 경우 `by viewModel { parametersOf(userId) }` 또는 `koinViewModel { parametersOf(userId) }`를 사용합니다([ViewModel](/docs/reference/koin-core/viewmodel) 참조).

## 여러 개의 파라미터 {id="several-parameters"}

**컴파일러 플러그인 DSL**
```kotlin
class OrderPresenter(
    @InjectedParam val userId: String,
    @InjectedParam val orderId: Long,
    val repository: OrderRepository,
)

val appModule = module {
    factory<OrderPresenter>()
}
```

**어노테이션**
```kotlin
@Factory
class OrderPresenter(
    @InjectedParam val userId: String,
    @InjectedParam val orderId: Long,
    val repository: OrderRepository,
)
```

**생성자 / 클래식 DSL**
람다에서 파라미터를 구조 분해(destructure)합니다:

```kotlin
val appModule = module {
    factory { (userId: String, orderId: Long) ->
        OrderPresenter(userId, orderId, get())
    }
}
```

또는 `params[i]`나 `params.get<T>(i)`를 사용하여 인덱스로 읽을 수도 있습니다:

```kotlin
val appModule = module {
    factory { params -> OrderPresenter(params[0], params[1], get()) }
}
```

구조 분해는 최대 5개의 값으로 제한되며, 선언된 타입은 호출자가 전달한 값과 비교하여 검사되지 않습니다. 순서가 잘못되면 런타임에 캐스팅 오류가 발생합니다.

```kotlin
val presenter: OrderPresenter = get { parametersOf("user-42", 1001L) }
```

## Koin이 값을 매칭하는 방법 {id="how-koin-matches-values"}

`params.get<T>()` 및 생성된 코드는 다음 규칙에 따라 각 값을 조회합니다:

- Koin은 먼저 현재 위치의 값을 확인합니다. 해당 값이 요청된 타입과 일치하면 이를 반환하고 다음 위치로 이동합니다.
- 그렇지 않으면 Koin은 위치에 관계없이 요청된 타입과 일치하는 첫 번째 값을 반환합니다.
- 해당 타입의 값이 전달되지 않은 경우 `params.getOrNull<T>()`는 `null`을 반환합니다. `get<T>()`는 `DefinitionParameterException`을 발생시킵니다.

실제로는 생성자 순서대로 값을 전달하세요. `parametersOf("user-42", 1001L)`은 `userId`, 그다음 `orderId` 순으로 채우며, 두 개의 `String` 파라미터는 순서대로 두 개의 `String` 값을 받습니다.

하나의 동작 방식만 필요한 경우, 다른 함수를 사용하여 파라미터를 생성하세요:

| 함수 | 매칭 방식 |
|----------|----------|
| `parametersOf(...)` | 위치 우선, 그다음 타입 (기본값, 위의 규칙 참고) |
| `parameterArrayOf(...)` | 위치만 고려. 현재 위치의 값이 요청된 타입과 일치해야 함 |
| `parameterSetOf(...)` | 타입만 고려. 모든 `get<T>()`가 해당 타입의 첫 번째 값을 반환 |

```kotlin
val byIndex = parameterArrayOf(1, 2, 3)
byIndex.get<Int>() // 1
byIndex.get<Int>() // 2

val byType = parameterSetOf("a_string", 42)
byType.get<Int>()    // 42
byType.get<Int>()    // 42
```

## 파라미터로부터 확인되는 값 {id="values-resolved-from-parameters"}

Koin이 파라미터를 사용하여 인스턴스를 생성할 때, 정의 내부의 일반 `get()`은 컨테이너보다 먼저 전달된 값을 확인합니다. 어노테이션 등이 표시되지 않은 파라미터라도 전달된 값을 받을 수 있습니다:

```kotlin
val appModule = module {
    factory { UserPresenter(userId = get(), repository = get()) }
}

get<UserPresenter> { parametersOf("user-42") } // userId = "user-42"
```

이는 더 하위의 의존성에도 적용됩니다. 예를 들어 `UserPresenter`가 화면 이름을 필요로 하는 `Tracker`를 필요로 하는 경우, presenter에 전달된 값이 `Tracker` 정의까지 도달할 수 있습니다.

하지만 `@InjectedParam`이나 `params.get()`을 사용하는 편이 좋습니다. 값이 어디서 오는지 명확히 알 수 있으며, 컴파일러 플러그인이 그래프의 나머지 부분을 검사할 수 있기 때문입니다.

:::warning
전달된 값이 요청된 정의와 동일한 타입을 갖는 경우, Koin은 해당 값을 직접 반환하며 정의를 실행하지 않습니다. `get<String> { parametersOf("x") }`는 `"x"`를 반환합니다. 파라미터가 정의의 타입과 충돌할 가능성이 있는 경우, 해당 파라미터를 자체 타입(예: value class)으로 감싸세요.
:::

`get(named("local"))`과 같이 한정자(qualifier)가 지정된 요청은 절대로 파라미터에서 값을 가져오지 않습니다. 파라미터에는 한정자가 포함되지 않습니다.

## 관련 문서 {id="related"}

- [주입(Injection)](/docs/reference/koin-core/injection): 파라미터를 전달하는 `get()` 및 `inject()`.
- [정의(Definitions)](/docs/reference/koin-core/definitions#constructor-parameters): 다른 생성자 파라미터가 확인(resolve)되는 방법.
- [ViewModel](/docs/reference/koin-core/viewmodel): ViewModel을 위한 파라미터 및 `SavedStateHandle`.
- [한정자(Qualifiers)](/docs/reference/koin-core/qualifiers): 값을 전달하는 대신 정의 간에 선택하는 방법.
- [어노테이션 레퍼런스(Annotations Reference)](/docs/reference/koin-annotations/annotations-inventory): `@InjectedParam` 및 기타 파라미터 어노테이션.