[//]: # (title: 위임 프로퍼티 (Delegated properties))

일반적으로 자주 사용되는 종류의 프로퍼티들은 필요할 때마다 직접 구현할 수도 있지만, 한 번만 구현하여 라이브러리에 추가하고 나중에 재사용하는 것이 더 유용합니다. 예를 들어 다음과 같은 경우가 있습니다:

* 지연(Lazy) 프로퍼티: 처음 접근할 때만 값이 계산됩니다.
* 관찰 가능한(Observable) 프로퍼티: 이 프로퍼티의 변경 사항을 리스너(listener)에게 알립니다.
* 각 프로퍼티마다 별도의 필드를 만드는 대신 맵(map)에 프로퍼티를 저장하는 경우.

이러한 경우(및 기타 사례)를 지원하기 위해 Kotlin은 위임 프로퍼티(delegated properties)를 지원합니다:

```kotlin
class Example {
    var p: String by Delegate()
}
```

구문은 `val/var <프로퍼티 이름>: <타입> by <표현식>`입니다. `by` 뒤에 오는 표현식이 대리자(delegate)입니다. 프로퍼티에 대응하는 `get()` (및 `set()`)이 대리자의 `getValue()` 및 `setValue()` 메서드로 위임되기 때문입니다. 프로퍼티 대리자는 특정 인터페이스를 구현할 필요는 없지만, `getValue()` 함수(`var`인 경우 `setValue()`도 포함)를 반드시 제공해야 합니다.

예를 들어:

```kotlin
import kotlin.reflect.KProperty

class Delegate {
    operator fun getValue(thisRef: Any?, property: KProperty<*>): String {
        return "$thisRef, thank you for delegating '${property.name}' to me!"
    }
 
    operator fun setValue(thisRef: Any?, property: KProperty<*>, value: String) {
        println("$value has been assigned to '${property.name}' in $thisRef.")
    }
}
```

`Delegate` 인스턴스로 위임된 `p`의 값을 읽을 때, `Delegate`의 `getValue()` 함수가 호출됩니다. 이 함수의 첫 번째 파라미터는 `p`를 읽는 객체이며, 두 번째 파라미터는 `p` 자체에 대한 설명(예: 프로퍼티의 이름을 가져올 수 있음)을 담고 있습니다.

```kotlin
val e = Example()
println(e.p)
```

출력 결과는 다음과 같습니다:

```
Example@33a17727, thank you for delegating 'p' to me!
```

마찬가지로 `p`에 값을 할당할 때 `setValue()` 함수가 호출됩니다. 처음 두 파라미터는 동일하며, 세 번째 파라미터는 할당되는 값을 담고 있습니다:

```kotlin
e.p = "NEW"
```

출력 결과는 다음과 같습니다:
 
```
NEW has been assigned to 'p' in Example@33a17727.
```

위임된 객체에 대한 요구 사항 명세는 [아래](#property-delegate-requirements)에서 확인할 수 있습니다.

위임 프로퍼티는 함수 내부나 코드 블록 안에서 선언할 수 있으며, 반드시 클래스의 멤버일 필요는 없습니다. [로컬 위임 프로퍼티 예시](#local-delegated-properties)는 아래에서 확인할 수 있습니다.

## 표준 대리자 (Standard delegates) {id="standard-delegates"}

Kotlin 표준 라이브러리는 몇 가지 유용한 종류의 대리자를 위한 팩토리 메서드를 제공합니다.

### 지연 프로퍼티 (Lazy properties) {id="lazy-properties"}

[`lazy()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/lazy.html)는 람다를 인자로 받아 `Lazy<T>` 인스턴스를 반환하는 함수로, 지연 프로퍼티를 구현하기 위한 대리자 역할을 할 수 있습니다. `get()`을 처음 호출하면 `lazy()`에 전달된 람다를 실행하고 그 결과를 기억합니다. 이후 `get()`을 호출하면 단순히 기억된 결과를 반환합니다.

```kotlin
val lazyValue: String by lazy {
    println("computed!")
    "Hello"
}

fun main() {
    println(lazyValue)
    println(lazyValue)
}
```
{kotlin-runnable="true"}

기본적으로 지연 프로퍼티의 평가는 동기화(synchronized)됩니다. 즉, 값은 하나의 스레드에서만 계산되지만 모든 스레드가 동일한 값을 보게 됩니다. 초기화 대리자의 동기화가 필요하지 않아 여러 스레드가 동시에 실행할 수 있도록 하려면 `lazy()`의 파라미터로 `LazyThreadSafetyMode.PUBLICATION`을 전달하세요.

만약 초기화가 항상 프로퍼티를 사용하는 스레드와 동일한 스레드에서 일어날 것이라고 확신한다면 `LazyThreadSafetyMode.NONE`을 사용할 수 있습니다. 이는 스레드 안전성 보장과 그에 따른 오버헤드를 발생시키지 않습니다.

### 관찰 가능한 프로퍼티 (Observable properties) {id="observable-properties"}

[`Delegates.observable()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.properties/-delegates/observable.html)은 초기값과 변경 시 호출될 핸들러라는 두 개의 인자를 받습니다.

핸들러는 프로퍼티에 값을 할당할 때마다(할당이 완료된 *후*) 호출됩니다. 핸들러는 할당될 프로퍼티, 이전 값, 새로운 값이라는 세 개의 파라미터를 가집니다:

```kotlin
import kotlin.properties.Delegates

class User {
    var name: String by Delegates.observable("<no name>") {
        prop, old, new ->
        println("$old -> $new")
    }
}

fun main() {
    val user = User()
    user.name = "first"
    user.name = "second"
}
```
{kotlin-runnable="true"}

만약 할당을 가로채서 거부(veto)하고 싶다면 `observable()` 대신 [`vetoable()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.properties/-delegates/vetoable.html)을 사용하세요. `vetoable`에 전달된 핸들러는 새로운 프로퍼티 값이 할당되기 *전*에 호출됩니다.

## 다른 프로퍼티로 위임하기 (Delegating to another property) {id="delegating-to-another-property"}

프로퍼티의 게터(getter)와 세터(setter)를 다른 프로퍼티로 위임할 수 있습니다. 이러한 위임은 최상위(top-level) 프로퍼티와 클래스 프로퍼티(멤버 및 확장) 모두에서 가능합니다. 대리자 프로퍼티는 다음과 같을 수 있습니다:
* 최상위 프로퍼티
* 동일한 클래스의 멤버 또는 확장 프로퍼티
* 다른 클래스의 멤버 또는 확장 프로퍼티

프로퍼티를 다른 프로퍼티로 위임하려면 대리자 이름에 `::` 한정자를 사용합니다. 예를 들어 `this::delegate` 또는 `MyClass::delegate`와 같이 사용합니다.

```kotlin
var topLevelInt: Int = 0
class ClassWithDelegate(val anotherClassInt: Int)

class MyClass(var memberInt: Int, val anotherClassInstance: ClassWithDelegate) {
    var delegatedToMember: Int by this::memberInt
    var delegatedToTopLevel: Int by ::topLevelInt
    
    val delegatedToAnotherClass: Int by anotherClassInstance::anotherClassInt
}
var MyClass.extDelegated: Int by ::topLevelInt
```

이 기능은 예를 들어 하위 호환성을 유지하면서 프로퍼티의 이름을 변경하고 싶을 때 유용합니다. 새로운 프로퍼티를 도입하고, 기존 프로퍼티에 `@Deprecated` 어노테이션을 추가한 뒤 그 구현을 새 프로퍼티로 위임하면 됩니다.

```kotlin
class MyClass {
   var newName: Int = 0
   @Deprecated("Use 'newName' instead", ReplaceWith("newName"))
   var oldName: Int by this::newName
}
fun main() {
   val myClass = MyClass()
   // 알림: 'oldName: Int'는 더 이상 권장되지 않습니다.
   // 대신 'newName'을 사용하세요.
   myClass.oldName = 42
   println(myClass.newName) // 42
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.4"}

## 맵에 프로퍼티 저장하기 (Storing properties in a map) {id="storing-properties-in-a-map"}

일반적인 사용 사례 중 하나는 프로퍼티의 값을 맵(map)에 저장하는 것입니다. 이는 JSON을 파싱하거나 다른 동적인 작업을 수행하는 애플리케이션에서 자주 발생합니다. 이 경우 맵 인스턴스 자체를 위임 프로퍼티의 대리자로 사용할 수 있습니다.

```kotlin
class User(val map: Map<String, Any?>) {
    val name: String by map
    val age: Int     by map
}
```

이 예제에서 생성자는 맵을 인자로 받습니다:

```kotlin
val user = User(mapOf(
    "name" to "John Doe",
    "age"  to 25
))
```

위임 프로퍼티는 프로퍼티의 이름과 연결된 문자열 키를 통해 이 맵에서 값을 가져옵니다:

```kotlin
class User(val map: Map<String, Any?>) {
    val name: String by map
    val age: Int     by map
}

fun main() {
    val user = User(mapOf(
        "name" to "John Doe",
        "age"  to 25
    ))
//sampleStart
    println(user.name) // "John Doe" 출력
    println(user.age)  // 25 출력
//sampleEnd
}
```
{kotlin-runnable="true"}

읽기 전용 `Map` 대신 `MutableMap`을 사용하면 `var` 프로퍼티에도 작동합니다:

```kotlin
class MutableUser(val map: MutableMap<String, Any?>) {
    var name: String by map
    var age: Int     by map
}
```

## 로컬 위임 프로퍼티 (Local delegated properties) {id="local-delegated-properties"}

로컬 변수를 위임 프로퍼티로 선언할 수 있습니다. 예를 들어, 로컬 변수를 지연 초기화할 수 있습니다:

```kotlin
fun example(computeFoo: () -> Foo) {
    val memoizedFoo by lazy(computeFoo)

    if (someCondition && memoizedFoo.isValid()) {
        memoizedFoo.doSomething()
    }
}
```

`memoizedFoo` 변수는 처음 접근할 때만 계산됩니다. 만약 `someCondition`이 실패하면 변수는 전혀 계산되지 않습니다.

## 프로퍼티 대리자 요구 사항 (Property delegate requirements) {id="property-delegate-requirements"}

*읽기 전용* 프로퍼티(`val`)의 경우, 대리자는 다음과 같은 파라미터를 가진 연산자 함수(operator function) `getValue()`를 제공해야 합니다:

* `thisRef`는 *프로퍼티 소유자*와 동일한 타입이거나 상위 타입이어야 합니다(확장 프로퍼티의 경우 확장되는 타입이어야 함).
* `property`는 `KProperty<*>` 타입이거나 그 상위 타입이어야 합니다.

`getValue()`는 프로퍼티와 동일한 타입(또는 그 하위 타입)을 반환해야 합니다.

```kotlin
class Resource

class Owner {
    val valResource: Resource by ResourceDelegate()
}

class ResourceDelegate {
    operator fun getValue(thisRef: Owner, property: KProperty<*>): Resource {
        return Resource()
    }
}
```

*가변* 프로퍼티(`var`)의 경우, 대리자는 추가로 다음과 같은 파라미터를 가진 연산자 함수 `setValue()`를 제공해야 합니다:

* `thisRef`는 *프로퍼티 소유자*와 동일한 타입이거나 상위 타입이어야 합니다(확장 프로퍼티의 경우 확장되는 타입이어야 함).
* `property`는 `KProperty<*>` 타입이거나 그 상위 타입이어야 합니다.
* `value`는 프로퍼티와 동일한 타입(또는 그 상위 타입)이어야 합니다.
 
```kotlin
class Resource

class Owner {
    var varResource: Resource by ResourceDelegate()
}

class ResourceDelegate(private var resource: Resource = Resource()) {
    operator fun getValue(thisRef: Owner, property: KProperty<*>): Resource {
        return resource
    }
    operator fun setValue(thisRef: Owner, property: KProperty<*>, value: Any?) {
        if (value is Resource) {
            resource = value
        }
    }
}
```

`getValue()` 및 `setValue()` 함수는 대리자 클래스의 멤버 함수나 확장 함수로 제공될 수 있습니다. 후자는 원래 이러한 함수를 제공하지 않는 객체에 프로퍼티를 위임해야 할 때 유용합니다. 두 함수 모두 `operator` 키워드로 표시되어야 합니다.

Kotlin 표준 라이브러리의 `ReadOnlyProperty` 및 `ReadWriteProperty` 인터페이스를 사용하여 새로운 클래스를 만들지 않고도 익명 객체로 대리자를 생성할 수 있습니다. 이 인터페이스들은 필요한 메서드들을 제공합니다: `ReadOnlyProperty`에는 `getValue()`가 선언되어 있고, `ReadWriteProperty`는 이를 확장하여 `setValue()`를 추가합니다. 즉, `ReadOnlyProperty`가 필요한 곳에 `ReadWriteProperty`를 전달할 수 있습니다.

```kotlin
fun resourceDelegate(resource: Resource = Resource()): ReadWriteProperty<Any?, Resource> =
    object : ReadWriteProperty<Any?, Resource> {
        var curValue = resource 
        override fun getValue(thisRef: Any?, property: KProperty<*>): Resource = curValue
        override fun setValue(thisRef: Any?, property: KProperty<*>, value: Resource) {
            curValue = value
        }
    }

val readOnlyResource: Resource by resourceDelegate()  // ReadWriteProperty를 val로 사용
var readWriteResource: Resource by resourceDelegate()
```

## 위임 프로퍼티의 변환 규칙 (Translation rules for delegated properties) {id="translation-rules-for-delegated-properties"}

내부적으로 Kotlin 컴파일러는 일부 종류의 위임 프로퍼티에 대해 보조 프로퍼티를 생성하고 이를 위임합니다.

> 최적화를 위해 컴파일러는 [몇 가지 경우에 보조 프로퍼티를 생성하지 않습니다](#optimized-cases-for-delegated-properties). [다른 프로퍼티로 위임하는 경우](#translation-rules-when-delegating-to-another-property)의 예시를 통해 최적화에 대해 알아보세요.
>
{style="note"}

예를 들어 프로퍼티 `prop`에 대해 `prop$delegate`라는 숨겨진 프로퍼티를 생성하며, 접근자(accessor) 코드는 단순히 이 추가 프로퍼티로 위임됩니다:

```kotlin
class C {
    var prop: Type by MyDelegate()
}

// 컴파일러에 의해 대신 생성되는 코드:
class C {
    private val prop$delegate = MyDelegate()
    var prop: Type
        get() = prop$delegate.getValue(this, this::prop)
        set(value: Type) = prop$delegate.setValue(this, this::prop, value)
}
```

Kotlin 컴파일러는 인자를 통해 `prop`에 대한 모든 필요한 정보를 제공합니다. 첫 번째 인자 `this`는 외부 클래스 `C`의 인스턴스를 참조하고, `this::prop`은 `prop` 자체를 설명하는 `KProperty` 타입의 리플렉션 객체입니다.

### 위임 프로퍼티의 최적화 사례 (Optimized cases for delegated properties) {id="optimized-cases-for-delegated-properties"}

다음과 같은 경우 `$delegate` 필드가 생략됩니다:
* 참조된 프로퍼티인 경우:

  ```kotlin
  class C<Type> {
      private var impl: Type = ...
      var prop: Type by ::impl
  }
  ```

* 명명된 객체(named object)인 경우:

  ```kotlin
  object NamedObject {
      operator fun getValue(thisRef: Any?, property: KProperty<*>): String = ...
  }

  val s: String by NamedObject
  ```

* 동일한 모듈 내에서 보조 필드(backing field)와 기본 게터를 가진 `final val` 프로퍼티인 경우:

  ```kotlin
  val impl: ReadOnlyProperty<Any?, String> = ...

  class A {
      val s: String by impl
  }
  ```

* 상수 표현식, 열거형 항목(enum entry), `this`, `null`인 경우. `this`의 예시:

  ```kotlin
  class A {
      operator fun getValue(thisRef: Any?, property: KProperty<*>) ...
 
      val s by this
  }
  ```

### 다른 프로퍼티로 위임할 때의 변환 규칙 (Translation rules when delegating to another property) {id="translation-rules-when-delegating-to-another-property"}

다른 프로퍼티로 위임할 때, Kotlin 컴파일러는 참조된 프로퍼티에 대한 즉각적인 접근을 생성합니다. 즉, 컴파일러는 `prop$delegate` 필드를 생성하지 않습니다. 이 최적화는 메모리를 절약하는 데 도움이 됩니다.

예를 들어 다음 코드를 살펴보겠습니다:

```kotlin
class C<Type> {
    private var impl: Type = ...
    var prop: Type by ::impl
}
```

`prop` 변수의 프로퍼티 접근자는 위임 프로퍼티의 `getValue` 및 `setValue` 연산자를 건너뛰고 `impl` 변수를 직접 호출하므로 `KProperty` 참조 객체가 필요하지 않습니다.

위 코드에 대해 컴파일러는 다음과 같은 코드를 생성합니다:

```kotlin
class C<Type> {
    private var impl: Type = ...

    var prop: Type
        get() = impl
        set(value) {
            impl = value
        }
    
    fun getProp$delegate(): Type = impl // 이 메서드는 리플렉션을 위해서만 필요합니다.
}
```

## 대리자 제공하기 (Providing a delegate) {id="providing-a-delegate"}

`provideDelegate` 연산자를 정의하면 프로퍼티 구현이 위임되는 객체를 생성하는 로직을 확장할 수 있습니다. `by`의 우변에 사용된 객체가 `provideDelegate`를 멤버 함수나 확장 함수로 정의하고 있다면, 해당 함수가 프로퍼티 대리자 인스턴스를 생성하기 위해 호출됩니다.

`provideDelegate`의 가능한 사용 사례 중 하나는 프로퍼티가 초기화될 때 프로퍼티의 일관성을 확인하는 것입니다.

예를 들어, 바인딩 전에 프로퍼티 이름을 확인하려면 다음과 같이 작성할 수 있습니다:

```kotlin
class ResourceDelegate<T> : ReadOnlyProperty<MyUI, T> {
    override fun getValue(thisRef: MyUI, property: KProperty<*>): T { ... }
}
    
class ResourceLoader<T>(id: ResourceID<T>) {
    operator fun provideDelegate(
            thisRef: MyUI,
            prop: KProperty<*>
    ): ReadOnlyProperty<MyUI, T> {
        checkProperty(thisRef, prop.name)
        // 대리자 생성
        return ResourceDelegate()
    }

    private fun checkProperty(thisRef: MyUI, name: String) { ... }
}

class MyUI {
    fun <T> bindResource(id: ResourceID<T>): ResourceLoader<T> { ... }

    val image by bindResource(ResourceID.image_id)
    val text by bindResource(ResourceID.text_id)
}
```

`provideDelegate`의 파라미터는 `getValue`와 동일합니다:

* `thisRef`는 *프로퍼티 소유자*와 동일한 타입이거나 상위 타입이어야 합니다(확장 프로퍼티의 경우 확장되는 타입이어야 함).
* `property`는 `KProperty<*>` 타입이거나 그 상위 타입이어야 합니다.

`provideDelegate` 메서드는 `MyUI` 인스턴스가 생성되는 동안 각 프로퍼티에 대해 호출되며, 즉시 필요한 유효성 검사를 수행합니다.

프로퍼티와 대리자 사이의 바인딩을 가로채는 기능이 없다면, 동일한 기능을 구현하기 위해 프로퍼티 이름을 명시적으로 전달해야 하므로 그다지 편리하지 않을 것입니다:

```kotlin
// "provideDelegate" 기능 없이 프로퍼티 이름을 확인하는 경우
class MyUI {
    val image by bindResource(ResourceID.image_id, "image")
    val text by bindResource(ResourceID.text_id, "text")
}

fun <T> MyUI.bindResource(
        id: ResourceID<T>,
        propertyName: String
): ReadOnlyProperty<MyUI, T> {
    checkProperty(this, propertyName)
    // 대리자 생성
}
```

생성된 코드에서 `provideDelegate` 메서드는 보조 프로퍼티인 `prop$delegate`를 초기화하기 위해 호출됩니다. 프로퍼티 선언 `val prop: Type by MyDelegate()`에 대해 생성된 코드를 (`provideDelegate` 메서드가 없을 때의) [위](#translation-rules-for-delegated-properties)의 코드와 비교해 보세요:

```kotlin
class C {
    var prop: Type by MyDelegate()
}

// 'provideDelegate' 함수를 사용할 수 있을 때
// 컴파일러가 생성하는 코드:
class C {
    // 추가 "delegate" 프로퍼티를 생성하기 위해 "provideDelegate" 호출
    private val prop$delegate = MyDelegate().provideDelegate(this, this::prop)
    var prop: Type
        get() = prop$delegate.getValue(this, this::prop)
        set(value: Type) = prop$delegate.setValue(this, this::prop, value)
}
```

`provideDelegate` 메서드는 보조 프로퍼티의 생성에만 영향을 미치며 게터나 세터를 위해 생성된 코드에는 영향을 주지 않는다는 점에 유의하세요.

표준 라이브러리의 `PropertyDelegateProvider` 인터페이스를 사용하면 새로운 클래스를 만들지 않고도 대리자 제공자(delegate provider)를 생성할 수 있습니다.

```kotlin
val provider = PropertyDelegateProvider { thisRef: Any?, property ->
    ReadOnlyProperty<Any?, Int> {_, property -> 42 }
}
val delegate: Int by provider
```
