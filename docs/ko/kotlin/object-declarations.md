[//]: # (title: 객체 선언 및 표현식)

Kotlin에서 객체(object)를 사용하면 클래스를 정의하는 동시에 단일 단계로 해당 인스턴스를 생성할 수 있습니다.
이는 재사용 가능한 싱글톤(singleton) 인스턴스나 일회성 객체가 필요할 때 유용합니다.
이러한 시나리오를 처리하기 위해 Kotlin은 두 가지 핵심 접근 방식을 제공합니다. 바로 싱글톤을 생성하기 위한 _객체 선언(object declaration)_과 익명의 일회성 객체를 생성하기 위한 _객체 표현식(object expression)_입니다.

> 싱글톤은 클래스에 인스턴스가 오직 하나만 존재하도록 보장하며, 이에 대한 전역적인 접근점을 제공합니다.
> 
{style="tip"}

객체 선언과 객체 표현식은 다음과 같은 시나리오에 사용하는 것이 가장 적합합니다.

* **공유 리소스에 싱글톤 사용:** 애플리케이션 전체에서 클래스의 인스턴스가 단 하나만 존재하도록 보장해야 하는 경우입니다.
예를 들어 데이터베이스 커넥션 풀을 관리하는 경우가 이에 해당합니다.
* **팩토리 메서드 생성:** 효율적으로 인스턴스를 생성할 수 있는 편리한 방법이 필요한 경우입니다.
[동반 객체(Companion object)](#companion-objects)를 사용하면 클래스에 묶인 클래스 수준의 함수와 프로퍼티를 정의할 수 있어, 이러한 인스턴스의 생성 및 관리를 간소화할 수 있습니다.
* **기존 클래스의 동작을 일시적으로 수정:** 새로운 서브클래스를 생성할 필요 없이 기존 클래스의 동작을 수정하고자 하는 경우입니다.
예를 들어 특정 작업을 위해 객체에 임시 기능을 추가하는 경우가 이에 해당합니다.
* **타입 안전(type-safe)한 설계가 필요한 경우:** 객체 표현식을 사용하여 인터페이스나 [추상 클래스](classes.md#abstract-classes)의 일회성 구현이 필요한 경우입니다.
버튼 클릭 핸들러와 같은 시나리오에 유용할 수 있습니다.

## 객체 선언 {id="object-declarations"}
{id="object-declarations-overview"}

Kotlin에서는 `object` 키워드 뒤에 항상 이름이 붙는 객체 선언을 사용하여 단일 객체 인스턴스를 생성할 수 있습니다.
이를 통해 클래스 정의와 인스턴스 생성을 한 번에 수행할 수 있으며, 싱글톤을 구현할 때 유용합니다.

```kotlin
//sampleStart
// 데이터 제공자를 관리하는 싱글톤 객체 선언
object DataProviderManager {
    private val providers = mutableListOf<DataProvider>()

    // 새로운 데이터 제공자 등록
    fun registerDataProvider(provider: DataProvider) {
        providers.add(provider)
    }

    // 등록된 모든 데이터 제공자 조회
    val allDataProviders: Collection<DataProvider> 
        get() = providers
}
//sampleEnd

// 예제 데이터 제공자 인터페이스
interface DataProvider {
    fun provideData(): String
}

// 예제 데이터 제공자 구현체
class ExampleDataProvider : DataProvider {
    override fun provideData(): String {
        return "Example data"
    }
}

fun main() {
    // ExampleDataProvider 인스턴스 생성
    val exampleProvider = ExampleDataProvider()

    // 객체를 참조하려면 해당 이름을 직접 사용합니다.
    DataProviderManager.registerDataProvider(exampleProvider)

    // 모든 데이터 제공자를 가져와 출력합니다.
    println(DataProviderManager.allDataProviders.map { it.provideData() })
    // [Example data]
}
```
{kotlin-runnable="true" id="object-declaration-register-provider"}

> 객체 선언의 초기화는 스레드 안전(thread-safe)하며, 처음 접근할 때 이루어집니다(지연 초기화).
>
{style="tip"}

`object`를 참조하려면 그 이름을 직접 사용합니다.

```kotlin
DataProviderManager.registerDataProvider(exampleProvider)
```

[익명 객체가 기존 클래스를 상속하거나 인터페이스를 구현할 수 있는 것](#inherit-anonymous-objects-from-supertypes)과 마찬가지로, 객체 선언 역시 상위 타입을 가질 수 있습니다.

```kotlin
object DefaultListener : MouseAdapter() {
    override fun mouseClicked(e: MouseEvent) { ... }

    override fun mouseEntered(e: MouseEvent) { ... }
}
```

변수 선언과 마찬가지로 객체 선언은 표현식이 아니므로 대입문의 우변에 사용할 수 없습니다.

```kotlin
// 구문 오류: 객체 표현식에는 이름을 바인딩할 수 없습니다.
val myObject = object MySingleton {
    val name = "Singleton"
}
```

객체 선언은 다른 객체 선언이나 이너 클래스(inner class)가 아닌 클래스 내부에 중첩할 수 있지만, 함수 내부에 직접 선언할 수는 없습니다. 객체 선언은 로컬(지역)일 수 없기 때문입니다. 중첩된 객체 선언 역시 여전히 싱글톤이며, 이를 둘러싼 바깥쪽 객체나 클래스의 이름을 통해 접근할 수 있습니다.

객체 선언은 함수 내부에 직접 중첩할 수 없으므로, 대신 [객체 표현식](#object-expressions)을 사용해야 합니다.
이러한 객체는 익명입니다. 로컬 변수에 할당할 수는 있지만 `object` 키워드 뒤에 이름을 지정할 수는 없습니다.

```kotlin
// 다른 객체 선언 내부에 중첩된 객체 선언
object Outer {
    val name = "Outer"

    object Nested {
        val name = "Nested in Outer"
    }
}

// 클래스 내부에 중첩된 객체 선언
class Server {
    object Config {
        const val port = 8080
    }
}

fun main() {
    // 중첩된 객체에 접근하려면 이를 감싸는
    // 바깥쪽 객체의 이름을 사용합니다.
    println(Outer.Nested.name)
    // Nested in Outer

    println(Server.Config.port)
    // 8080

    // 객체 표현식은 함수 내부에 중첩될 수 있습니다.
    val local = object {
        val name = "Nested in main()"
    }
    println(local.name)
    // Nested in main()

    // 객체 선언은 함수 내부에 중첩될 수 없습니다.
    // object Local {
    //     val name = "Nested in main()"
    // }
}
```
{kotlin-runnable="true" id="object-declaration-nested"}

### 데이터 객체 (Data objects) {id="data-objects"}

Kotlin에서 일반 객체 선언을 출력하면 문자열 표현에 객체의 이름과 해시코드가 모두 포함됩니다.

```kotlin
object MyObject

fun main() {
    println(MyObject) 
    // MyObject@hashcode
}
```
{kotlin-runnable="true" id="object-declaration-plain"}

하지만 객체 선언에 `data` 변경자를 붙이면, [데이터 클래스(Data class)](data-classes.md)와 동일한 방식으로 `toString()` 호출 시 객체의 실제 이름을 반환하도록 컴파일러에 지시할 수 있습니다.

```kotlin
data object MyDataObject {
    val number: Int = 3
}

fun main() {
    println(MyDataObject) 
    // MyDataObject
}
```
{kotlin-runnable="true" id="object-declaration-dataobject"}

또한, 컴파일러는 `data object`를 위해 몇 가지 함수를 생성합니다.

* `toString()`: 데이터 객체의 이름을 반환합니다.
* `equals()`/`hashCode()`: 동등성 검사 및 해시 기반 컬렉션 사용을 가능하게 합니다.

  > `data object`에 대해서는 커스텀 `equals` 또는 `hashCode` 구현을 제공할 수 없습니다.
  >
  {style="note"}

`data object`의 `equals()` 함수는 해당 `data object`의 타입을 가진 모든 객체가 동등한 것으로 간주되도록 보장합니다.
`data object`는 싱글톤을 선언하므로 런타임에 인스턴스가 하나만 존재하는 경우가 대부분입니다.
하지만 동일한 타입의 다른 객체가 런타임에 생성되는 엣지 케이스(예: `java.lang.reflect`를 사용하는 플랫폼 리플렉션이나 내부적으로 이 API를 사용하는 JVM 직렬화 라이브러리 사용 시)에서도 객체들이 동등하게 처리되도록 보장합니다.

> `data object`는 구조적으로만 비교(`==` 연산자 사용)하고, 참조로 비교(`===` 연산자 사용)하지 않도록 주의하세요.
> 이렇게 하면 런타임에 둘 이상의 데이터 객체 인스턴스가 존재할 때 발생할 수 있는 문제를 방지할 수 있습니다.
>
{style="warning"}

```kotlin
import java.lang.reflect.Constructor

data object MySingleton

fun main() {
    val evilTwin = createInstanceViaReflection()

    println(MySingleton) 
    // MySingleton

    println(evilTwin) 
    // MySingleton

    // 라이브러리가 MySingleton의 두 번째 인스턴스를 강제로 생성하더라도,
    // equals() 함수는 true를 반환합니다.
    println(MySingleton == evilTwin) 
    // true

    // === 연산자로 data object를 비교하지 마세요.
    println(MySingleton === evilTwin) 
    // false
}

fun createInstanceViaReflection(): MySingleton {
    // Kotlin 리플렉션은 data object의 인스턴스화를 허용하지 않습니다.
    // 이는 (자바 플랫폼 리플렉션을 사용하여) 새로운 MySingleton 인스턴스를 "강제로" 생성합니다.
    // 직접 이러한 작업을 수행하지 마세요!
    return (MySingleton.javaClass.declaredConstructors[0].apply { isAccessible = true } as Constructor<MySingleton>).newInstance()
}
```

생성된 `hashCode()` 함수는 `equals()` 함수와 일관된 동작을 보이므로, `data object`의 모든 런타임 인스턴스는 동일한 해시코드를 갖습니다.

#### 데이터 객체와 데이터 클래스의 차이점 {id="differences-between-data-objects-and-data-classes"}

`data object`와 `data class` 선언은 함께 사용되는 경우가 많고 몇 가지 유사점이 있지만, `data object`에는 생성되지 않는 함수들이 있습니다.

* `copy()` 함수가 없습니다. `data object` 선언은 싱글톤으로 사용되도록 설계되었기 때문에 `copy()` 함수가 생성되지 않습니다. 싱글톤은 클래스의 인스턴스화를 단일 인스턴스로 제한하므로, 인스턴스의 복사본 생성을 허용하면 이 원칙이 위배됩니다.
* `componentN()` 함수가 없습니다. `data class`와 달리 `data object`에는 데이터 프로퍼티가 없습니다. 데이터 프로퍼티가 없는 객체를 구조 분해(destructure)하려는 것은 의미가 없으므로 `componentN()` 함수는 생성되지 않습니다.

#### 봉인된 계층 구조에서 데이터 객체 사용하기 {id="use-data-objects-with-sealed-hierarchies"}

데이터 객체 선언은 [봉인된 클래스 또는 봉인된 인터페이스(Sealed classes or sealed interfaces)](sealed-classes.md)와 같은 봉인된 계층 구조(sealed hierarchy)에서 특히 유용합니다.
객체와 함께 정의했을 수 있는 다른 데이터 클래스들과의 대칭성을 유지할 수 있기 때문입니다.

다음 예제에서 `EndOfFile`을 일반 `object` 대신 `data object`로 선언하면, `toString()`을 수동으로 재정의할 필요 없이 자동으로 생성됩니다.

```kotlin
sealed interface ReadResult
data class Number(val number: Int) : ReadResult
data class Text(val text: String) : ReadResult
data object EndOfFile : ReadResult

fun main() {
    println(Number(7)) 
    // Number(number=7)
    println(EndOfFile) 
    // EndOfFile
}
```
{kotlin-runnable="true" id="data-objects-sealed-hierarchies"}

### 동반 객체 (Companion objects) {id="companion-objects"}

_동반 객체(Companion object)_를 사용하면 클래스 수준의 함수와 프로퍼티를 정의할 수 있습니다.
이를 통해 팩토리 메서드를 손쉽게 만들고, 상수를 보관하며, 공유 유틸리티에 접근할 수 있습니다.

클래스 내부의 객체 선언에 `companion` 키워드를 붙일 수 있습니다.

```kotlin
class MyClass {
    companion object Factory {
        fun create(): MyClass = MyClass()
    }
}
```

`companion object`의 멤버는 클래스 이름을 한정자(qualifier)로 사용하여 간단히 호출할 수 있습니다.

```kotlin
class User(val name: String) {
    // User 인스턴스를 생성하는 팩토리 역할을 하는 동반 객체 정의
    companion object Factory {
        fun create(name: String): User = User(name)
    }
}

fun main(){
    // 클래스 이름을 한정자로 사용하여 동반 객체의 팩토리 메서드를 호출합니다.
    // 새로운 User 인스턴스를 생성합니다.
    val userInstance = User.create("John Doe")
    println(userInstance.name)
    // John Doe
}
```
{kotlin-runnable="true" id="object-expression-companion-object"}

`companion object`의 이름은 생략할 수 있으며, 이 경우 `Companion`이라는 기본 이름이 사용됩니다.

```kotlin
class User(val name: String) {
    // 이름 없는 동반 객체 정의
    companion object { }
}

// 동반 객체에 접근
val companionUser = User.Companion
```

클래스 멤버는 해당 클래스의 `companion object`에 있는 `private` 멤버에 접근할 수 있습니다.

```kotlin
class User(val name: String) {
    companion object {
        private val defaultGreeting = "Hello"
    }

    fun sayHi() {
        println(defaultGreeting)
    }
}
User("Nick").sayHi()
// Hello
```

클래스 이름만 단독으로 사용할 경우, 동반 객체의 이름 유무와 관계없이 해당 클래스의 동반 객체에 대한 참조 역할을 합니다.

```kotlin
//sampleStart
class User1 {
    // 이름이 있는 동반 객체 정의
    companion object Named {
        fun show(): String = "User1's Named Companion Object"
    }
}

// 클래스 이름을 사용하여 User1의 동반 객체를 참조
val reference1 = User1

class User2 {
    // 이름이 없는 동반 객체 정의
    companion object {
        fun show(): String = "User2's Companion Object"
    }
}

// 클래스 이름을 사용하여 User2의 동반 객체를 참조
val reference2 = User2
//sampleEnd

fun main() {
    // User1의 동반 객체에서 show() 함수 호출
    println(reference1.show()) 
    // User1's Named Companion Object

    // User2의 동반 객체에서 show() 함수 호출
    println(reference2.show()) 
    // User2's Companion Object
}
```
{kotlin-runnable="true" id="object-expression-companion-object-names"}

Kotlin에서 동반 객체의 멤버는 다른 언어의 정적(static) 멤버처럼 보이지만, 실제로는 동반 객체의 인스턴스 멤버입니다. 즉, 객체 자체에 속해 있습니다.
이 덕분에 동반 객체도 인터페이스를 구현할 수 있습니다.

```kotlin
interface Factory<T> {
    fun create(name: String): T
}

class User(val name: String) {
    // Factory 인터페이스를 구현하는 동반 객체 정의
    companion object : Factory<User> {
        override fun create(name: String): User = User(name)
    }
}

fun main() {
    // 동반 객체를 Factory로 사용
    val userFactory: Factory<User> = User
    val newUser = userFactory.create("Example User")
    println(newUser.name)
    // Example User
}
```
{kotlin-runnable="true" id="object-expression-factory"}

하지만 JVM 환경에서는 `@JvmStatic` 애너테이션을 사용하면 동반 객체의 멤버를 실제 정적 메서드와 필드로 생성할 수 있습니다. 자세한 내용은 [자바 상호 운용성(Java interoperability)](java-to-kotlin-interop.md#static-fields) 섹션을 참고하세요.

## 객체 표현식 {id="object-expressions"}

객체 표현식은 클래스를 선언하고 해당 클래스의 인스턴스를 생성하지만, 둘 중 어느 것에도 이름을 부여하지 않습니다.
이러한 클래스는 일회성 용도로 유용합니다. 완전히 새로 생성할 수도 있고, 기존 클래스를 상속하거나 인터페이스를 구현할 수도 있습니다. 이러한 클래스의 인스턴스는 이름이 아닌 표현식으로 정의되므로 _익명 객체(anonymous object)_라고도 부릅니다.

### 새로운 익명 객체 생성하기 {id="create-anonymous-objects-from-scratch"}

객체 표현식은 `object` 키워드로 시작합니다.

객체가 다른 클래스를 확장하거나 인터페이스를 구현하지 않는 경우, `object` 키워드 뒤의 중괄호 안에 객체의 멤버를 직접 정의할 수 있습니다.

```kotlin
fun main() {
//sampleStart
    val helloWorld = object {
        val hello = "Hello"
        val world = "World"
        // 객체 표현식은 이미 toString() 함수를 가지고 있는 Any 클래스를 확장하므로,
        // 반드시 재정의(override)해야 합니다.
        override fun toString() = "$hello $world"
    }

    print(helloWorld)
    // Hello World
//sampleEnd
}
```
{kotlin-runnable="true" id="object-expression-object"}

### 상위 타입으로부터 익명 객체 상속받기 {id="inherit-anonymous-objects-from-supertypes"}

어떤 타입(또는 타입들)을 상속받는 익명 객체를 생성하려면 `object` 뒤에 콜론 `:`을 붙이고 해당 타입을 지정합니다. 그런 다음 해당 클래스로부터 [상속](inheritance.md)받을 때와 마찬가지로 해당 클래스의 멤버를 구현하거나 재정의합니다.

```kotlin
window.addMouseListener(object : MouseAdapter() {
    override fun mouseClicked(e: MouseEvent) { /*...*/ }

    override fun mouseEntered(e: MouseEvent) { /*...*/ }
})
```

상위 타입에 생성자가 있는 경우, 적절한 생성자 인자를 전달해야 합니다.
콜론 뒤에 쉼표로 구분하여 여러 상위 타입을 지정할 수 있습니다.

```kotlin
//sampleStart
// balance 프로퍼티를 가진 open 클래스 BankAccount 생성
open class BankAccount(initialBalance: Int) {
    open val balance: Int = initialBalance
}

// execute() 함수를 가진 인터페이스 Transaction 정의
interface Transaction {
    fun execute()
}

// BankAccount에 대해 특수 거래를 수행하는 함수
fun specialTransaction(account: BankAccount) {
    // BankAccount 클래스를 상속하고 Transaction 인터페이스를 구현하는 익명 객체 생성
    // 제공된 계좌의 잔액이 BankAccount 상위 클래스 생성자로 전달됩니다.
    val temporaryAccount = object : BankAccount(account.balance), Transaction {

        override val balance = account.balance + 500  // 임시 보너스

        // Transaction 인터페이스의 execute() 함수 구현
        override fun execute() {
            println("Executing special transaction. New balance is $balance.")
        }
    }
    // 거래 실행
    temporaryAccount.execute()
}
//sampleEnd
fun main() {
    // 초기 잔액이 1000인 BankAccount 생성
    val myAccount = BankAccount(1000)
    // 생성된 계좌에 대해 특수 거래 수행
    specialTransaction(myAccount)
    // Executing special transaction. New balance is 1500.
}
```
{kotlin-runnable="true" id="object-expression-anonymous-object"}

### 익명 객체를 반환 및 값 타입으로 사용하기 {id="use-anonymous-objects-as-return-and-value-types"}

로컬 또는 [`private`](visibility-modifiers.md#packages) 함수나 프로퍼티에서 익명 객체를 반환할 때, 해당 익명 객체의 모든 멤버는 그 함수나 프로퍼티를 통해 접근할 수 있습니다.

```kotlin
//sampleStart
class UserPreferences {
    private fun getPreferences() = object {
        val theme: String = "Dark"
        val fontSize: Int = 14
    }

    fun printPreferences() {
        val preferences = getPreferences()
        println("Theme: ${preferences.theme}, Font Size: ${preferences.fontSize}")
    }
}
//sampleEnd

fun main() {
    val userPreferences = UserPreferences()
    userPreferences.printPreferences()
    // Theme: Dark, Font Size: 14
}
```
{kotlin-runnable="true" id="object-expression-object-return"}

이를 통해 특정 프로퍼티를 가진 익명 객체를 반환할 수 있으며, 별도의 클래스를 생성하지 않고도 데이터나 동작을 캡슐화할 수 있는 간단한 방법을 제공합니다.

익명 객체를 반환하는 함수 또는 프로퍼티가 `public`, `protected` 또는 `internal` 가시성을 갖는 경우, 해당 함수나 프로퍼티의 실제 타입은 다음과 같습니다.

* 익명 객체에 선언된 상위 타입이 없는 경우 `Any`가 됩니다.
* 익명 객체에 선언된 상위 타입이 정확히 하나만 있는 경우, 해당 상위 타입이 됩니다.
* 명시적으로 선언된 상위 타입이 둘 이상인 경우, 명시적으로 선언된 반환 타입이 됩니다.

이 모든 경우에서 익명 객체에 추가된 멤버에는 접근할 수 없습니다. 재정의된 멤버는 함수나 프로퍼티의 실제 타입에 선언되어 있는 경우에만 접근할 수 있습니다. 예를 들면 다음과 같습니다.

```kotlin
//sampleStart
interface Notification {
    // Notification 인터페이스에 notifyUser() 선언
    fun notifyUser()
}

interface DetailedNotification

class NotificationManager {
    // 반환 타입은 Any입니다. message 프로퍼티에 접근할 수 없습니다.
    // 반환 타입이 Any일 때는 Any 클래스의 멤버에만 접근할 수 있습니다.
    fun getNotification() = object {
        val message: String = "General notification"
    }

    // 익명 객체가 하나의 인터페이스만 구현하므로 반환 타입은 Notification입니다.
    // notifyUser() 함수는 Notification 인터페이스의 일부이므로 접근할 수 있습니다.
    // message 프로퍼티는 Notification 인터페이스에 선언되어 있지 않으므로 접근할 수 없습니다.
    fun getEmailNotification() = object : Notification {
        override fun notifyUser() {
            println("Sending email notification")
        }
        val message: String = "You've got mail!"
    }

    // 반환 타입은 DetailedNotification입니다. notifyUser() 함수와 message 프로퍼티에는 접근할 수 없습니다.
    // DetailedNotification 인터페이스에 선언된 멤버에만 접근할 수 있습니다.
    fun getDetailedNotification(): DetailedNotification = object : Notification, DetailedNotification {
        override fun notifyUser() {
            println("Sending detailed notification")
        }
        val message: String = "Detailed message content"
    }
}
//sampleEnd
fun main() {
    // 아무것도 출력하지 않습니다.
    val notificationManager = NotificationManager()

    // 반환 타입이 Any이므로 여기서 message 프로퍼티에 접근할 수 없습니다.
    // 아무것도 출력하지 않습니다.
    val notification = notificationManager.getNotification()

    // notifyUser() 함수에 접근할 수 있습니다.
    // 반환 타입이 Notification이므로 여기서 message 프로퍼티에는 접근할 수 없습니다.
    val emailNotification = notificationManager.getEmailNotification()
    emailNotification.notifyUser()
    // Sending email notification

    // 반환 타입이 DetailedNotification이므로 여기서 notifyUser() 함수와 message 프로퍼티에 접근할 수 없습니다.
    // 아무것도 출력하지 않습니다.
    val detailedNotification = notificationManager.getDetailedNotification()
}
```
{kotlin-runnable="true" id="object-expression-object-override"}

### 익명 객체에서 변수 접근하기 {id="access-variables-from-anonymous-objects"}

객체 표현식 본문 내부의 코드는 자신을 둘러싼 바깥쪽 스코프의 변수에 접근할 수 있습니다.

```kotlin
import java.awt.event.MouseAdapter
import java.awt.event.MouseEvent

fun countClicks(window: JComponent) {
    var clickCount = 0
    var enterCount = 0

    // MouseAdapter는 마우스 이벤트 함수에 대한 기본 구현을 제공합니다.
    // MouseAdapter가 마우스 이벤트를 처리하는 것을 시뮬레이션합니다.
    window.addMouseListener(object : MouseAdapter() {
        override fun mouseClicked(e: MouseEvent) {
            clickCount++
        }

        override fun mouseEntered(e: MouseEvent) {
            enterCount++
        }
    })
    // clickCount와 enterCount 변수는 객체 표현식 내에서 접근할 수 있습니다.
}
```

## 객체 선언과 표현식 간의 동작 차이점 {id="behavior-difference-between-object-declarations-and-expressions"}

객체 선언과 객체 표현식은 초기화 동작에 차이가 있습니다.

* 객체 표현식은 사용되는 위치에서 _즉시_ 실행(및 초기화)됩니다.
* 객체 선언은 처음 접근할 때 _지연(lazily)_ 초기화됩니다.
* 동반 객체는 해당 클래스가 로드(해석)될 때 초기화되며, 이는 자바의 정적 초기화 블록(static initializer)의 의미 체계와 일치합니다.