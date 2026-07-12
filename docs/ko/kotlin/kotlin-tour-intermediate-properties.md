[//]: # (title: 프로퍼티)

<no-index/>

초급 투어에서는 클래스 인스턴스의 특성을 선언하기 위해 프로퍼티가 어떻게 사용되는지, 그리고 프로퍼티에 어떻게 접근하는지 배웠습니다. 이 장에서는 Kotlin에서 프로퍼티가 작동하는 방식을 더 깊이 살펴보고, 코드에서 프로퍼티를 활용할 수 있는 다른 방법들을 탐구합니다.

## 뒷받침하는 필드(Backing fields)

Kotlin에서 프로퍼티는 값을 검색하고 수정하는 것을 처리하는 기본 `get()` 및 `set()` 함수(프로퍼티 접근자라고 함)를 가집니다. 이러한 기본 함수는 코드에서 명시적으로 보이지는 않지만, 컴파일러가 배후에서 프로퍼티 접근을 관리하기 위해 자동으로 생성합니다. 이러한 접근자들은 실제 프로퍼티 값을 저장하기 위해 **뒷받침하는 필드(backing field)**를 사용합니다.

뒷받침하는 필드는 다음 중 하나라도 해당될 경우 존재합니다:

* 프로퍼티에 대해 기본 `get()` 또는 `set()` 함수를 사용하는 경우.
* 코드에서 `field` 키워드를 사용하여 프로퍼티 값에 접근하려고 시도하는 경우.

> `get()` 및 `set()` 함수는 게터(getter) 및 세터(setter)라고도 불립니다.
>
{style="tip"}

예를 들어, 다음 코드는 사용자 정의 `get()` 또는 `set()` 함수가 없는 `category` 프로퍼티를 가지고 있으므로 기본 구현을 사용합니다:

```kotlin
class Contact(val id: Int, var email: String) {
    var category: String = ""
}
```

내부적으로 이것은 다음과 같은 의사 코드(pseudocode)와 동일합니다:

```kotlin
class Contact(val id: Int, var email: String) {
    var category: String = ""
        get() = field
        set(value) {
            field = value
        }
}
```
{validate="false"}

이 예제에서:

* `get()` 함수는 필드에서 프로퍼티 값 `""`을 검색합니다.
* `set()` 함수는 `value`를 매개변수로 받아 이를 필드에 할당하며, 여기서 `value`는 `""`입니다. 

뒷받침하는 필드에 접근하는 것은 무한 루프를 발생시키지 않고 `get()` 또는 `set()` 함수에 추가 로직을 더하고 싶을 때 유용합니다. 예를 들어, `name` 프로퍼티가 있는 `Person` 클래스가 있다고 가정해 봅시다:

```kotlin
class Person {
    var name: String = ""
}
```

`name` 프로퍼티의 첫 글자가 항상 대문자가 되도록 보장하고 싶어서, [`.replaceFirstChar()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/replace-first-char.html)와 [`.uppercase()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/uppercase-char.html) 확장 함수를 사용하는 사용자 정의 `set()` 함수를 만들려고 합니다. 그러나 `set()` 함수 내에서 프로퍼티를 직접 참조하면 무한 루프가 발생하고 런타임에 `StackOverflowError`를 보게 됩니다:

```kotlin
class Person {
    var name: String = ""
        set(value) {
            // 이 코드는 런타임 에러를 발생시킵니다
            name = value.replaceFirstChar { firstChar -> firstChar.uppercase() }
        }
}

fun main() {
    val person = Person()
    person.name = "kodee"
    println(person.name)
    // Exception in thread "main" java.lang.StackOverflowError
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-properties-stackoverflow"}

이를 해결하기 위해, `set()` 함수 내에서 `field` 키워드로 뒷받침하는 필드를 참조하여 대신 사용할 수 있습니다:

```kotlin
class Person {
    var name: String = ""
        set(value) {
            field = value.replaceFirstChar { firstChar -> firstChar.uppercase() }
        }
}

fun main() {
    val person = Person()
    person.name = "kodee"
    println(person.name)
    // Kodee
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-properties-backingfield"}

뒷받침하는 필드는 로깅을 추가하거나, 프로퍼티 값이 변경될 때 알림을 보내거나, 이전 프로퍼티 값과 새 값을 비교하는 추가 로직을 사용할 때도 유용합니다.

자세한 내용은 [뒷받침하는 필드](properties.md#backing-fields)를 참조하세요.

## 확장 프로퍼티(Extension properties)

확장 함수와 마찬가지로 확장 프로퍼티도 존재합니다. 확장 프로퍼티를 사용하면 소스 코드를 수정하지 않고도 기존 클래스에 새로운 프로퍼티를 추가할 수 있습니다. 그러나 Kotlin의 확장 프로퍼티는 뒷받침하는 필드를 가질 수 **없습니다**. 즉, `get()` 및 `set()` 함수를 직접 작성해야 함을 의미합니다. 또한 뒷받침하는 필드가 없다는 것은 어떠한 상태도 보유할 수 없음을 의미합니다.

확장 프로퍼티를 선언하려면 확장하려는 클래스 이름 뒤에 `.`과 프로퍼티 이름을 작성합니다. 일반 클래스 프로퍼티와 마찬가지로 프로퍼티의 타입을 선언해야 합니다. 
예를 들어:

```kotlin
val String.lastChar: Char
```
{validate="false"}

확장 프로퍼티는 상속을 사용하지 않고 계산된 값을 포함하는 프로퍼티를 원할 때 가장 유용합니다. 확장 프로퍼티를 매개변수가 하나(수신 객체)뿐인 함수처럼 생각할 수 있습니다.

예를 들어, `firstName`과 `lastName`이라는 두 프로퍼티를 가진 `Person`이라는 데이터 클래스가 있다고 가정해 봅시다.

```kotlin
data class Person(val firstName: String, val lastName: String)
```

`Person` 데이터 클래스를 수정하거나 상속받지 않고도 사람의 전체 이름을 알고 싶을 때, 사용자 정의 `get()` 함수가 있는 확장 프로퍼티를 만들어 이를 수행할 수 있습니다:

```kotlin
data class Person(val firstName: String, val lastName: String)

// 전체 이름을 가져오기 위한 확장 프로퍼티
val Person.fullName: String
    get() = "$firstName $lastName"

fun main() {
    val person = Person(firstName = "John", lastName = "Doe")

    // 확장 프로퍼티 사용
    println(person.fullName)
    // John Doe
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-properties-extension"}

> 확장 프로퍼티는 클래스의 기존 프로퍼티를 오버라이드할 수 없습니다.
> 
{style="note"}

확장 함수와 마찬가지로 Kotlin 표준 라이브러리에서도 확장 프로퍼티를 널리 사용합니다. 예를 들어 `CharSequence`의 [`lastIndex` 프로퍼티](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/last-index.html)를 확인해 보세요.

## 위임된 프로퍼티(Delegated properties)

[클래스 및 인터페이스](kotlin-tour-intermediate-classes-interfaces.md#delegation) 장에서 위임에 대해 이미 배웠습니다. 프로퍼티에도 위임을 사용하여 프로퍼티 접근자를 다른 객체로 위임할 수 있습니다. 이는 단순한 뒷받침하는 필드로 처리할 수 없는 복잡한 요구사항(예: 데이터베이스 테이블, 브라우저 세션 또는 맵에 값을 저장하는 경우)이 있을 때 유용합니다. 위임된 프로퍼티를 사용하면 프로퍼티를 읽고 쓰는 로직이 위임된 객체에만 포함되므로 상용구 코드(boilerplate code)도 줄어듭니다.

구문은 클래스 위임과 비슷하지만 다른 레벨에서 작동합니다. 프로퍼티를 선언한 뒤 `by` 키워드와 위임할 객체를 작성합니다. 예를 들어:

```kotlin
val displayName: String by Delegate
```

여기서 위임된 프로퍼티 `displayName`은 프로퍼티 접근자를 위해 `Delegate` 객체를 참조합니다.

위임 대상 객체는 반드시 `getValue()` 연산자 함수를 가져야 하며, Kotlin은 이를 사용하여 위임된 프로퍼티의 값을 검색합니다. 프로퍼티가 가변(`var`)이라면 Kotlin이 값을 설정할 수 있도록 `setValue()` 연산자 함수도 가져야 합니다.

기본적으로 `getValue()` 및 `setValue()` 함수는 다음과 같은 구조를 가집니다:

```kotlin
operator fun getValue(thisRef: Any?, property: KProperty<*>): String {}

operator fun setValue(thisRef: Any?, property: KProperty<*>, value: String) {}
```
{validate="false"}

이 함수들에서:

* `operator` 키워드는 이 함수들을 연산자 함수로 표시하여 `get()` 및 `set()` 함수를 오버로드할 수 있게 합니다.
* `thisRef` 매개변수는 위임된 프로퍼티를 **포함하는** 객체를 참조합니다. 기본적으로 타입은 `Any?`로 설정되지만, 더 구체적인 타입을 선언해야 할 수도 있습니다.
* `property` 매개변수는 값에 접근하거나 변경하려는 프로퍼티를 참조합니다. 이 매개변수를 사용하여 프로퍼티의 이름이나 타입과 같은 정보에 접근할 수 있습니다. 기본 타입은 `KProperty<*>`이지만 `Any?`를 사용할 수도 있습니다. 코드에서 이를 변경하는 것에 대해 걱정할 필요는 없습니다.

`getValue()` 함수는 기본적으로 `String` 반환 타입을 가지지만, 원하는 대로 조정할 수 있습니다.

`setValue()` 함수는 프로퍼티에 할당되는 새 값을 보유하는 데 사용되는 추가 매개변수 `value`를 가집니다.

그렇다면 실제로는 어떻게 보일까요? 작업 비용이 많이 들고 애플리케이션이 성능에 민감하기 때문에 딱 한 번만 계산되는 사용자 표시 이름과 같은 계산된 프로퍼티를 원한다고 가정해 봅시다. 위임된 프로퍼티를 사용하여 표시 이름을 캐시하면 한 번만 계산되고 성능 저하 없이 언제든 접근할 수 있습니다.

먼저, 위임할 객체를 생성해야 합니다. 이 경우 객체는 `CachedStringDelegate` 클래스의 인스턴스가 됩니다:

```kotlin
class CachedStringDelegate {
    var cachedValue: String? = null
}
```

`cachedValue` 프로퍼티는 캐시된 값을 포함합니다. `CachedStringDelegate` 클래스 내에서 위임된 프로퍼티의 `get()` 함수에서 원하는 동작을 `getValue()` 연산자 함수 본문에 추가합니다:

```kotlin
class CachedStringDelegate {
    var cachedValue: String? = null

    operator fun getValue(thisRef: Any?, property: Any?): String {
        if (cachedValue == null) {
            cachedValue = "Default Value"
            println("Computed and cached: $cachedValue")
        } else {
            println("Accessed from cache: $cachedValue")
        }
        return cachedValue ?: "Unknown"
    }
}
```

`getValue()` 함수는 `cachedValue` 프로퍼티가 `null`인지 확인합니다. `null`이라면 `"Default value"`를 할당하고 로깅을 위해 문자열을 출력합니다. `cachedValue` 프로퍼티가 이미 계산되었다면 프로퍼티는 `null`이 아니며, 이 경우에는 로깅을 위해 다른 문자열을 출력합니다. 마지막으로 함수는 엘비스 연산자를 사용하여 캐시된 값을 반환하거나 값이 `null`인 경우 `"Unknown"`을 반환합니다.

이제 캐시하려는 프로퍼티(`val displayName`)를 `CachedStringDelegate` 클래스의 인스턴스로 위임할 수 있습니다:

```kotlin
class CachedStringDelegate {
    var cachedValue: String? = null

    operator fun getValue(thisRef: User, property: Any?): String {
        if (cachedValue == null) {
            cachedValue = "${thisRef.firstName} ${thisRef.lastName}"
            println("Computed and cached: $cachedValue")
        } else {
            println("Accessed from cache: $cachedValue")
        }
        return cachedValue ?: "Unknown"
    }
}

class User(val firstName: String, val lastName: String) {
    val displayName: String by CachedStringDelegate()
}

fun main() {
    val user = User("John", "Doe")

    // 첫 번째 접근 시 값을 계산하고 캐시합니다
    println(user.displayName)
    // Computed and cached: John Doe
    // John Doe

    // 이후 접근 시에는 캐시에서 값을 가져옵니다
    println(user.displayName)
    // Accessed from cache: John Doe
    // John Doe
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-properties-delegated"}

이 예제:

* 헤더에 `firstName`, `lastName` 두 프로퍼티가 있고 본문에 `displayName` 프로퍼티가 하나 있는 `User` 클래스를 생성합니다.
* `displayName` 프로퍼티를 `CachedStringDelegate` 클래스의 인스턴스에 위임합니다.
* `user`라는 `User` 클래스 인스턴스를 생성합니다.
* `user` 인스턴스에서 `displayName` 프로퍼티에 접근한 결과를 출력합니다.

`getValue()` 함수에서 `thisRef` 매개변수의 타입이 `Any?`에서 객체 타입인 `User`로 좁혀진 것을 확인하세요. 이는 컴파일러가 `User` 클래스의 `firstName` 및 `lastName` 프로퍼티에 접근할 수 있도록 하기 위함입니다.

### 표준 위임(Standard delegates)

Kotlin 표준 라이브러리는 항상 처음부터 직접 만들 필요가 없도록 몇 가지 유용한 위임 객체를 제공합니다. 이러한 표준 위임 중 하나를 사용하면 표준 라이브러리가 자동으로 제공하므로 `getValue()` 및 `setValue()` 함수를 정의할 필요가 없습니다.

#### 지연 프로퍼티(Lazy properties)

프로퍼티에 처음 접근할 때만 초기화하려면 지연 프로퍼티를 사용하세요. 표준 라이브러리는 위임을 위한 `Lazy` 인터페이스를 제공합니다. 

`Lazy` 인터페이스의 인스턴스를 생성하려면 `get()` 함수가 처음 호출될 때 실행할 람다 식을 `lazy()` 함수에 전달합니다. 이후 `get()` 함수를 호출하면 첫 번째 호출에서 제공된 것과 동일한 결과가 반환됩니다. 지연 프로퍼티는 람다 식을 전달하기 위해 [후행 람다(trailing lambda)](kotlin-tour-functions.md#trailing-lambdas) 구문을 사용합니다.

예를 들어:

```kotlin
class Database {
    fun connect() {
        println("Connecting to the database...")
    }

    fun query(sql: String): List<String> {
        return listOf("Data1", "Data2", "Data3")
    }
}

val databaseConnection: Database by lazy {
    val db = Database()
    db.connect()
    db
}

fun fetchData() {
    val data = databaseConnection.query("SELECT * FROM data")
    println("Data: $data")
}

fun main() {
    // databaseConnection에 처음 접근
    fetchData()
    // Connecting to the database...
    // Data: [Data1, Data2, Data3]

    // 이후 접근은 기존 연결을 사용함
    fetchData()
    // Data: [Data1, Data2, Data3]
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-properties-lazy"}

이 예제에서:

* `connect()`와 `query()` 멤버 함수를 가진 `Database` 클래스가 있습니다. 
* `connect()` 함수는 콘솔에 문자열을 출력하고, `query()` 함수는 SQL 쿼리를 받아 리스트를 반환합니다.
* `databaseConnection` 프로퍼티는 지연 프로퍼티입니다.
* `lazy()` 함수에 제공된 람다 식은:
  * `Database` 클래스의 인스턴스를 생성합니다.
  * 이 인스턴스(`db`)에서 `connect()` 멤버 함수를 호출합니다.
  * 인스턴스를 반환합니다.
* `fetchData()` 함수는:
  * `databaseConnection` 프로퍼티에서 `query()` 함수를 호출하여 SQL 쿼리를 실행합니다.
  * SQL 쿼리 결과를 `data` 변수에 할당합니다.
  * `data` 변수를 콘솔에 출력합니다.
* `main()` 함수는 `fetchData()` 함수를 호출합니다. 처음 호출될 때 지연 프로퍼티가 초기화됩니다. 두 번째 호출될 때는 첫 번째 호출과 동일한 결과가 반환됩니다.

지연 프로퍼티는 초기화에 리소스가 많이 소모될 때뿐만 아니라, 프로퍼티가 코드에서 사용되지 않을 수도 있을 때 유용합니다. 또한 지연 프로퍼티는 기본적으로 스레드 안전(thread-safe)하며, 이는 동시성 환경에서 작업할 때 특히 유익합니다.

자세한 내용은 [지연 프로퍼티](delegated-properties.md#lazy-properties)를 참조하세요.

#### 관찰 가능한 프로퍼티(Observable properties)

프로퍼티 값이 변경되는지 모니터링하려면 관찰 가능한 프로퍼티를 사용하세요. 관찰 가능한 프로퍼티는 프로퍼티 값의 변화를 감지하고 이를 트리거로 반응을 일으키고 싶을 때 유용합니다. 표준 라이브러리는 위임을 위한 `Delegates` 객체를 제공합니다.

관찰 가능한 프로퍼티를 만들려면 먼저 `kotlin.properties.Delegates.observable`을 임포트해야 합니다. 그런 다음 `observable()` 함수를 사용하고 프로퍼티가 변경될 때마다 실행할 람다 식을 제공합니다. 지연 프로퍼티와 마찬가지로 관찰 가능한 프로퍼티도 람다 식을 전달할 때 [후행 람다](kotlin-tour-functions.md#trailing-lambdas) 구문을 사용합니다.

예를 들어:

```kotlin
import kotlin.properties.Delegates.observable

class Thermostat {
    var temperature: Double by observable(20.0) { _, old, new ->
        if (new > 25) {
            println("Warning: Temperature is too high! ($old°C -> $new°C)")
        } else {
            println("Temperature updated: $old°C -> $new°C")
        }
    }
}

fun main() {
    val thermostat = Thermostat()
    thermostat.temperature = 22.5
    // Temperature updated: 20.0°C -> 22.5°C

    thermostat.temperature = 27.0
    // Warning: Temperature is too high! (22.5°C -> 27.0°C)
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-properties-observable"}

이 예제에서:

* 관찰 가능한 프로퍼티 `temperature`를 포함하는 `Thermostat` 클래스가 있습니다.
* `observable()` 함수는 `20.0`을 매개변수로 받아 프로퍼티를 초기화하는 데 사용합니다.
* `observable()` 함수에 제공된 람다 식은:
  * 세 개의 매개변수를 가집니다:
    * `_`: 프로퍼티 자체를 참조합니다.
    * `old`: 프로퍼티의 이전 값입니다.
    * `new`: 프로퍼티의 새로운 값입니다.
  * `new` 매개변수가 `25`보다 큰지 확인하고 결과에 따라 콘솔에 문자열을 출력합니다.
* `main()` 함수는:
  * `thermostat`이라는 `Thermostat` 클래스 인스턴스를 생성합니다.
  * 인스턴스의 `temperature` 프로퍼티 값을 `22.5`로 업데이트하며, 이는 온도 업데이트 메시지 출력을 트리거합니다.
  * 인스턴스의 `temperature` 프로퍼티 값을 `27.0`으로 업데이트하며, 이는 경고 메시지 출력을 트리거합니다.

관찰 가능한 프로퍼티는 로깅 및 디버깅 용도뿐만 아니라 UI를 업데이트하거나 데이터의 유효성을 검증하는 등의 추가 체크를 수행하는 용도로도 유용하게 사용할 수 있습니다.

자세한 내용은 [관찰 가능한 프로퍼티](delegated-properties.md#observable-properties)를 참조하세요.

## 연습 문제 {completion-point="true"}

### 연습 문제 1 {initial-collapse-state="collapsed" collapsible="true" id="properties-exercise-1"}

당신은 서점의 재고 시스템을 관리하고 있습니다. 재고는 리스트에 저장되며, 각 항목은 특정 도서의 수량을 나타냅니다. 예를 들어 `listOf(3, 0, 7, 12)`는 첫 번째 도서가 3권, 두 번째가 0권, 세 번째가 7권, 네 번째가 12권 있음을 의미합니다.

품절된 모든 도서의 인덱스 리스트를 반환하는 `findOutOfStockBooks()` 함수를 작성하세요.

<deflist collapsible="true">
    <def title="힌트 1">
        표준 라이브러리의 <a href="https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/indices.html"><code>indices</code></a> 확장 프로퍼티를 사용하세요.
    </def>
</deflist>

<deflist collapsible="true">
    <def title="힌트 2">
        가변 리스트를 직접 생성하고 반환하는 대신 <a href="https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/build-list.html"><code>buildList()</code></a> 함수를 사용하여 리스트를 생성하고 관리할 수 있습니다. <code>buildList()</code> 함수는 이전 장에서 배운 수신 객체가 있는 람다를 사용합니다.
    </def>
</deflist>

|--|--|

```kotlin
fun findOutOfStockBooks(inventory: List<Int>): List<Int> {
    // 여기에 코드를 작성하세요
}

fun main() {
    val inventory = listOf(3, 0, 7, 0, 5)
    println(findOutOfStockBooks(inventory))
    // [1, 3]
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-properties-exercise-1"}

|---|---|
```kotlin
fun findOutOfStockBooks(inventory: List<Int>): List<Int> {
    val outOfStockIndices = mutableListOf<Int>()
    for (index in inventory.indices) {
        if (inventory[index] == 0) {
            outOfStockIndices.add(index)
        }
    }
    return outOfStockIndices
}

fun main() {
    val inventory = listOf(3, 0, 7, 0, 5)
    println(findOutOfStockBooks(inventory))
    // [1, 3]
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="모범 답안 1" id="kotlin-tour-properties-solution-1-1"}

|---|---|
```kotlin
fun findOutOfStockBooks(inventory: List<Int>): List<Int> = buildList {
    for (index in inventory.indices) {
        if (inventory[index] == 0) {
            add(index)
        }
    }
}

fun main() {
    val inventory = listOf(3, 0, 7, 0, 5)
    println(findOutOfStockBooks(inventory))
    // [1, 3]
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="모범 답안 2" id="kotlin-tour-properties-solution-1-2"}

### 연습 문제 2 {initial-collapse-state="collapsed" collapsible="true" id="properties-exercise-2"}

킬로미터와 마일 단위를 모두 표시해야 하는 여행 앱이 있습니다. `Double` 타입에 대해 킬로미터 거리를 마일로 변환하는 `asMiles`라는 확장 프로퍼티를 만드세요:

> 킬로미터를 마일로 변환하는 공식은 `miles = kilometers * 0.621371`입니다.
>
{style="note"}

<deflist collapsible="true">
    <def title="힌트">
        확장 프로퍼티는 사용자 정의 <code>get()</code> 함수가 필요하다는 점을 기억하세요.
    </def>
</deflist>

|---|---|

```kotlin
val // 여기에 코드를 작성하세요

fun main() {
    val distanceKm = 5.0
    println("$distanceKm km is ${distanceKm.asMiles} miles")
    // 5.0 km is 3.106855 miles

    val marathonDistance = 42.195
    println("$marathonDistance km is ${marathonDistance.asMiles} miles")
    // 42.195 km is 26.218757 miles
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-properties-exercise-2"}

|---|---|
```kotlin
val Double.asMiles: Double
    get() = this * 0.621371

fun main() {
    val distanceKm = 5.0
    println("$distanceKm km is ${distanceKm.asMiles} miles")
    // 5.0 km is 3.106855 miles

    val marathonDistance = 42.195
    println("$marathonDistance km is ${marathonDistance.asMiles} miles")
    // 42.195 km is 26.218757 miles
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="모범 답안" id="kotlin-tour-properties-solution-2"}

### 연습 문제 3 {initial-collapse-state="collapsed" collapsible="true" id="properties-exercise-3"}

클라우드 시스템의 상태를 확인할 수 있는 시스템 헬스 체커가 있습니다. 그러나 헬스 체크를 수행하기 위해 실행할 수 있는 두 함수는 성능 부하가 큽니다. 지연 프로퍼티를 사용하여 비용이 많이 드는 함수가 필요할 때만 실행되도록 체크 로직을 초기화하세요:

|---|---|

```kotlin
fun checkAppServer(): Boolean {
    println("Performing application server health check...")
    return true
}

fun checkDatabase(): Boolean {
    println("Performing database health check...")
    return false
}

fun main() {
    // 여기에 코드를 작성하세요

    when {
        isAppServerHealthy -> println("Application server is online and healthy")
        isDatabaseHealthy -> println("Database is healthy")
        else -> println("System is offline")
    }
    // Performing application server health check...
    // Application server is online and healthy
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-properties-exercise-3"}

|---|---|
```kotlin
fun checkAppServer(): Boolean {
    println("Performing application server health check...")
    return true
}

fun checkDatabase(): Boolean {
    println("Performing database health check...")
    return false
}

fun main() {
    val isAppServerHealthy by lazy { checkAppServer() }
    val isDatabaseHealthy by lazy { checkDatabase() }

    when {
        isAppServerHealthy -> println("Application server is online and healthy")
        isDatabaseHealthy -> println("Database is healthy")
        else -> println("System is offline")
    }
   // Performing application server health check...
   // Application server is online and healthy
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="모범 답안" id="kotlin-tour-properties-solution-3"}

### 연습 문제 4 {initial-collapse-state="collapsed" collapsible="true" id="properties-exercise-4"}

간단한 가계부 앱을 만들고 있습니다. 이 앱은 사용자의 남은 예산 변화를 관찰하고, 예산이 특정 임계값 아래로 떨어질 때마다 알림을 보내야 합니다. 초기 예산 금액을 포함하는 `totalBudget` 프로퍼티로 초기화되는 `Budget` 클래스가 있습니다. 클래스 내에서 다음과 같이 출력하는 `remainingBudget`이라는 관찰 가능한 프로퍼티를 만드세요:

* 값이 초기 예산의 20%보다 낮을 때 경고 메시지 출력.
* 예산이 이전 값보다 증가했을 때 격려 메시지 출력.

|---|---|

```kotlin
import kotlin.properties.Delegates.observable

class Budget(val totalBudget: Int) {
    var remainingBudget: Int // 여기에 코드를 작성하세요
}

fun main() {
    val myBudget = Budget(totalBudget = 1000)
    myBudget.remainingBudget = 800
    myBudget.remainingBudget = 150
    // Warning: Your remaining budget (150) is below 20% of your total budget.
    myBudget.remainingBudget = 50
    // Warning: Your remaining budget (50) is below 20% of your total budget.
    myBudget.remainingBudget = 300
    // Good news: Your remaining budget increased to 300.
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-properties-exercise-4"}

|---|---|
```kotlin
import kotlin.properties.Delegates.observable

class Budget(val totalBudget: Int) {
    var remainingBudget: Int by observable(totalBudget) { _, oldValue, newValue ->
        if (newValue < totalBudget * 0.2) {
            println("Warning: Your remaining budget ($newValue) is below 20% of your total budget.")
        } else if (newValue > oldValue) {
            println("Good news: Your remaining budget increased to $newValue.")
        }
    }
}

fun main() {
    val myBudget = Budget(totalBudget = 1000)
    myBudget.remainingBudget = 800
    myBudget.remainingBudget = 150
    // Warning: Your remaining budget (150) is below 20% of your total budget.
    myBudget.remainingBudget = 50
    // Warning: Your remaining budget (50) is below 20% of your total budget.
    myBudget.remainingBudget = 300
    // Good news: Your remaining budget increased to 300.
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="모범 답안" id="kotlin-tour-properties-solution-4"}

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-intermediate-open-special-classes.md" mode="outline" icon="arrow-left" icon-position="left">이전 단계</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-intermediate-null-safety.md" mode="classic" icon="arrow-right" icon-position="right">다음 단계</a>
  </li>
</list>