[//]: # (title: 클래스)

<no-index/>

Kotlin은 클래스와 객체를 통한 객체 지향 프로그래밍을 지원합니다. 객체는 프로그램에서 데이터를 저장하는 데 유용합니다.
클래스를 사용하면 객체의 특성 집합을 선언할 수 있습니다. 클래스로부터 객체를 생성하면 이러한 특성을 매번 선언할 필요가 없으므로
시간과 노력을 절약할 수 있습니다.

클래스를 선언하려면 `class` 키워드를 사용합니다.

```kotlin
class Customer
```

## 프로퍼티 {id="properties"}

클래스 객체의 특성은 프로퍼티로 선언할 수 있습니다. 클래스의 프로퍼티는 다음과 같이 선언할 수 있습니다.

* 클래스 이름 뒤의 괄호 `()` 안에 선언:
```kotlin
class Contact(val id: Int, var email: String)
```

* 중괄호 `{}`로 정의된 클래스 본문(body) 안에 선언:
```kotlin
class Contact(val id: Int, var email: String) {
    val category: String = ""
}
```

클래스 인스턴스가 생성된 후 프로퍼티 값을 변경해야 하는 경우가 아니라면, 프로퍼티를 읽기 전용(`val`)으로 선언하는 것을 권장합니다.

괄호 안에 `val`이나 `var` 없이 프로퍼티를 선언할 수도 있지만, 이러한 프로퍼티는 인스턴스가 생성된 후에는 접근할 수 없습니다.

> * 괄호 `()` 안에 포함된 내용을 **클래스 헤더(class header)**라고 합니다.
> * 클래스 프로퍼티를 선언할 때 [후행 쉼표(trailing comma)](coding-conventions.md#trailing-commas)를 사용할 수 있습니다.
>
{style="note"}

함수 매개변수와 마찬가지로, 클래스 프로퍼티에도 기본값을 지정할 수 있습니다.
```kotlin
class Contact(val id: Int, var email: String = "example@gmail.com") {
    val category: String = "work"
}
```

## 인스턴스 생성 {id="create-instance"}

클래스로부터 객체를 생성하려면 **생성자(constructor)**를 사용하여 클래스 **인스턴스(instance)**를 선언합니다.

기본적으로 Kotlin은 클래스 헤더에 선언된 매개변수를 사용하여 생성자를 자동으로 만듭니다.

예를 들면 다음과 같습니다.
```kotlin
class Contact(val id: Int, var email: String)

fun main() {
    val contact = Contact(1, "mary@gmail.com")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-class-create-instance"}

이 예제에서:

* `Contact`는 클래스입니다.
* `contact`는 `Contact` 클래스의 인스턴스입니다.
* `id`와 `email`은 프로퍼티입니다.
* `id`와 `email`은 기본 생성자와 함께 사용되어 `contact`를 생성합니다.

Kotlin 클래스는 직접 정의한 생성자를 포함하여 여러 생성자를 가질 수 있습니다. 여러 생성자를 선언하는 방법에 대해 자세히 알아보려면 [생성자](classes.md#constructors-and-initializer-blocks)를 참조하세요.

## 프로퍼티 접근 {id="access-properties"}

인스턴스의 프로퍼티에 접근하려면 인스턴스 이름 뒤에 마침표 `.`를 붙이고 프로퍼티 이름을 작성합니다.

```kotlin
class Contact(val id: Int, var email: String)

fun main() {
    val contact = Contact(1, "mary@gmail.com")
    
    // 프로퍼티의 값을 출력합니다: email
    println(contact.email)           
    // mary@gmail.com

    // 프로퍼티의 값을 업데이트합니다: email
    contact.email = "jane@gmail.com"
    
    // 프로퍼티의 새로운 값을 출력합니다: email
    println(contact.email)           
    // jane@gmail.com
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-access-property"}

> 프로퍼티 값을 문자열의 일부로 결합하려면 문자열 템플릿(`$`)을 사용할 수 있습니다.
> 예시:
> ```kotlin
> println("Their email address is: ${contact.email}")
> ```
>
{style="tip"}

## 멤버 함수 {id="member-functions"}

객체 특성의 일부로 프로퍼티를 선언하는 것 외에도, 멤버 함수를 사용하여 객체의 동작을 정의할 수 있습니다.

Kotlin에서 멤버 함수는 클래스 본문 내에 선언해야 합니다. 인스턴스에서 멤버 함수를 호출하려면 인스턴스 이름 뒤에 마침표 `.`를 붙이고 함수 이름을 작성합니다. 예를 들면 다음과 같습니다.

```kotlin
class Contact(val id: Int, var email: String) {
    fun printId() {
        println(id)
    }
}

fun main() {
    val contact = Contact(1, "mary@gmail.com")
    // 멤버 함수 printId()를 호출합니다
    contact.printId()           
    // 1
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-member-function"}

## 데이터 클래스 {id="data-classes"}

Kotlin에는 데이터를 저장하는 데 특히 유용한 **데이터 클래스(data class)**가 있습니다. 데이터 클래스는 일반 클래스와 동일한 기능을 가지지만, 추가 멤버 함수가 자동으로 제공됩니다. 이러한 멤버 함수를 통해 인스턴스를 읽기 쉬운 형식으로 간편하게 출력하거나, 클래스 인스턴스끼리 비교하거나, 인스턴스를 복사하는 등의 작업을 쉽게 수행할 수 있습니다. 이러한 함수가 자동으로 제공되므로 각 클래스마다 동일한 보일러플레이트 코드를 작성하는 데 시간을 낭비할 필요가 없습니다.

데이터 클래스를 선언하려면 `data` 키워드를 사용합니다.

```kotlin
data class User(val name: String, val id: Int)
```

Kotlin 컴파일러는 멤버 함수를 생성할 때 [주 생성자(primary constructor)](classes.md#primary-constructor) 내부에 정의된 프로퍼티만 사용합니다. 데이터 클래스 본문에 선언된 프로퍼티는 생성된 함수의 출력에 포함되지 않습니다.

데이터 클래스에서 가장 유용한 사전 정의 멤버 함수는 다음과 같습니다.

| **함수**             | **설명**                                                                |
|--------------------|-----------------------------------------------------------------------|
| `toString()`       | 클래스 인스턴스와 해당 프로퍼티를 읽기 쉬운 문자열로 출력합니다.                                  |
| `equals()` 또는 `==` | 클래스의 인스턴스를 비교합니다.                                                     |
| `copy()`           | 다른 인스턴스를 복사하여 클래스 인스턴스를 생성하며, 일부 프로퍼티 값을 다르게 지정할 수도 있습니다.            |

각 함수의 사용법에 대한 예제는 다음 섹션을 참조하세요.

* [문자열로 출력](#print-as-string)
* [인스턴스 비교](#compare-instances)
* [인스턴스 복사](#copy-instance)

### 문자열로 출력 {id="print-as-string"}

클래스 인스턴스를 읽기 쉬운 문자열로 출력하려면 `toString()` 함수를 명시적으로 호출하거나, 내부적으로 `toString()`을 자동으로 호출하는 출력 함수(`println()` 및 `print()`)를 사용할 수 있습니다.

```kotlin
data class User(val name: String, val id: Int)

fun main() {
    //sampleStart
    val user = User("Alex", 1)
    
    // 출력을 쉽게 읽을 수 있도록 toString() 함수를 자동으로 사용합니다
    println(user)            
    // User(name=Alex, id=1)
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-data-classes-print-string"}

이는 디버깅하거나 로그를 작성할 때 특히 유용합니다.

### 인스턴스 비교 {id="compare-instances"}

데이터 클래스 인스턴스를 비교하려면 동등성 연산자 `==`를 사용합니다.

```kotlin
data class User(val name: String, val id: Int)

fun main() {
    //sampleStart
    val user = User("Alex", 1)
    val secondUser = User("Alex", 1)
    val thirdUser = User("Max", 2)

    // user와 secondUser를 비교합니다
    println("user == secondUser: ${user == secondUser}") 
    // user == secondUser: true
    
    // user와 thirdUser를 비교합니다
    println("user == thirdUser: ${user == thirdUser}")   
    // user == thirdUser: false
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-data-classes-compare-instances"}

### 인스턴스 복사 {id="copy-instance"}

데이터 클래스 인스턴스의 정확한 복사본을 만들려면 인스턴스에서 `copy()` 함수를 호출합니다.

데이터 클래스 인스턴스의 복사본을 만들면서 **동시에** 일부 프로퍼티를 변경하려면, 인스턴스에서 `copy()` 함수를 호출하고 대체할 프로퍼티 값을 함수 매개변수로 전달합니다.

예를 들면 다음과 같습니다.

```kotlin
data class User(val name: String, val id: Int)

fun main() {
    //sampleStart
    val user = User("Alex", 1)

    // user의 정확한 복사본을 생성합니다
    println(user.copy())       
    // User(name=Alex, id=1)

    // name이 "Max"로 변경된 user의 복사본을 생성합니다
    println(user.copy("Max"))  
    // User(name=Max, id=1)

    // id가 3으로 변경된 user의 복사본을 생성합니다
    println(user.copy(id = 3)) 
    // User(name=Alex, id=3)
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-data-classes-copy-instance"}

인스턴스의 복사본을 만드는 것은 원본 인스턴스를 수정하는 것보다 안전합니다. 원본 인스턴스에 의존하는 모든 코드가 복사본 및 복사본으로 수행하는 작업의 영향을 받지 않기 때문입니다.

데이터 클래스에 대한 자세한 내용은 [데이터 클래스](data-classes.md)를 참조하세요.

이 둘러보기의 마지막 장에서는 Kotlin의 [널 안전성(null safety)](kotlin-tour-null-safety.md)을 다룹니다.

## 실습 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="데이터 클래스 선언하기">

이름을 위한 프로퍼티와 급여를 위한 프로퍼티 두 개를 가진 `Employee` 데이터 클래스를 정의하세요. 연말에 급여 인상을 받으려면 급여 프로퍼티가 변경 가능(mutable)해야 합니다! main 함수는 이 데이터 클래스를 사용하는 방법을 보여줍니다.

```kotlin
// 여기에 코드를 작성하세요

fun main() {
    val emp = Employee("Mary", 20)
    println(emp)
    emp.salary += 10
    println(emp)
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-classes-exercise-1"}

```kotlin
data class Employee(val name: String, var salary: Int)

fun main() {
    val emp = Employee("Mary", 20)
    println(emp)
    emp.salary += 10
    println(emp)
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="예제 솔루션" id="kotlin-tour-classes-solution-1"}

</def>
<def title="중첩된 데이터 클래스 선언하기">

이 코드가 컴파일되는 데 필요한 추가 데이터 클래스를 선언하세요.

```kotlin
data class Person(val name: Name, val address: Address, val ownsAPet: Boolean = true)
// 여기에 코드를 작성하세요
// data class Name(...)

fun main() {
    val person = Person(
        Name("John", "Smith"),
        Address("123 Fake Street", City("Springfield", "US")),
        ownsAPet = false
    )
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-classes-exercise-2"}

```kotlin
data class Person(val name: Name, val address: Address, val ownsAPet: Boolean = true)
data class Name(val first: String, val last: String)
data class Address(val street: String, val city: City)
data class City(val name: String, val countryCode: String)

fun main() {
    val person = Person(
        Name("John", "Smith"),
        Address("123 Fake Street", City("Springfield", "US")),
        ownsAPet = false
    )
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="예제 솔루션" id="kotlin-tour-classes-solution-2"}

</def>
<def title="클래스를 사용해 무작위 직원 생성하기">

코드를 테스트하려면 무작위 직원을 생성할 수 있는 생성기가 필요합니다. 후보 이름의 고정 목록(클래스 본문 내부)을 가진 `RandomEmployeeGenerator` 클래스를 정의하세요. 최소 및 최대 급여(클래스 헤더 내부)를 사용해 클래스를 구성하세요. 클래스 본문에서 `generateEmployee()` 함수를 정의하세요. 마찬가지로 main 함수에서 이 클래스를 사용하는 방법을 보여줍니다.

> 이 연습 문제에서는 [`Random.nextInt()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.random/-random/next-int.html) 함수를 사용할 수 있도록 패키지를 가져옵니다.
> 패키지 가져오기에 대한 자세한 내용은 [패키지 및 임포트](packages.md)를 참조하세요.
>
{style="tip"}

<deflist collapsible="true" id="kotlin-tour-classes-exercise-3-hint-1">
    <def title="힌트 1">
        List에는 리스트 내에서 무작위 항목을 반환하는 <a href="https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/random.html"><code>.random()</code></a>이라는 확장 함수가 있습니다.
    </def>
</deflist>

<deflist collapsible="true" id="kotlin-tour-classes-exercise-3-hint-2">
    <def title="힌트 2">
        <code>Random.nextInt(from = ..., until = ...)</code>는 지정된 범위 내에서 무작위 <code>Int</code> 숫자를 제공합니다.
    </def>
</deflist>

```kotlin
import kotlin.random.Random

data class Employee(val name: String, var salary: Int)

// 여기에 코드를 작성하세요

fun main() {
    val empGen = RandomEmployeeGenerator(10, 30)
    println(empGen.generateEmployee())
    println(empGen.generateEmployee())
    println(empGen.generateEmployee())
    empGen.minSalary = 50
    empGen.maxSalary = 100
    println(empGen.generateEmployee())
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-classes-exercise-3"}

```kotlin
import kotlin.random.Random

data class Employee(val name: String, var salary: Int)

class RandomEmployeeGenerator(var minSalary: Int, var maxSalary: Int) {
    val names = listOf("John", "Mary", "Ann", "Paul", "Jack", "Elizabeth")
    fun generateEmployee() =
        Employee(names.random(),
            Random.nextInt(from = minSalary, until = maxSalary))
}

fun main() {
    val empGen = RandomEmployeeGenerator(10, 30)
    println(empGen.generateEmployee())
    println(empGen.generateEmployee())
    println(empGen.generateEmployee())
    empGen.minSalary = 50
    empGen.maxSalary = 100
    println(empGen.generateEmployee())
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="예제 솔루션" id="kotlin-tour-classes-solution-3"}

</def>
</deflist>

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-functions.md" mode="outline" icon="arrow-left" icon-position="left">이전 단계</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-null-safety.md" mode="classic" icon="arrow-right" icon-position="right">다음 단계</a>
  </li>
</list>