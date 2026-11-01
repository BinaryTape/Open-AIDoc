[//]: # (title: 데이터 클래스(Data classes))

Kotlin의 데이터 클래스는 주로 데이터를 보관하는 데 사용됩니다. 각 데이터 클래스에 대해 컴파일러는 인스턴스를 읽기 쉬운 형태로 출력하거나, 인스턴스끼리 비교하거나, 인스턴스를 복사하는 등의 작업을 가능하게 해주는 추가 멤버 함수들을 자동으로 생성합니다.
데이터 클래스는 `data`로 표시합니다:

```kotlin
data class User(val name: String, val age: Int)
```

컴파일러는 기본 생성자(primary constructor)에 선언된 모든 프로퍼티로부터 다음 멤버들을 자동으로 생성합니다:

* `equals()`/`hashCode()` 쌍.
* `"User(name=John, age=42)"` 형태의 `toString()`.
* 프로퍼티의 선언 순서에 따른 [`componentN()` 함수들](destructuring-declarations.md).
* [`copy()` 함수](#copying).

생성된 코드의 일관성과 유의미한 동작을 보장하기 위해 데이터 클래스는 다음 요구사항을 충족해야 합니다:

* 기본 생성자는 최소한 하나의 파라미터를 가져야 합니다.
* 모든 기본 생성자 파라미터는 `val` 또는 `var`로 표시되어야 합니다.
* 데이터 클래스는 `abstract`, `open`, `sealed`, 또는 `inner`일 수 없습니다.

추가로, 데이터 클래스 멤버의 생성은 멤버 상속과 관련하여 다음 규칙을 따릅니다:

* 데이터 클래스 본문에 `equals()`, `hashCode()`, 또는 `toString()`의 명시적 구현이 있거나 슈퍼클래스에 `final` 구현이 있는 경우, 이러한 함수는 생성되지 않으며 기존 구현이 사용됩니다.
* 상위 타입에 `open`이면서 호환 가능한 타입을 반환하는 `componentN()` 함수가 있는 경우, 데이터 클래스에 해당 함수가 생성되어 상위 타입의 함수를 오버라이드합니다. 시그니처가 호환되지 않거나 final이어서 상위 타입의 함수를 오버라이드할 수 없는 경우 오류가 발생합니다.
* `componentN()` 및 `copy()` 함수에 대한 명시적 구현을 제공하는 것은 허용되지 않습니다.

데이터 클래스는 다른 클래스를 상속할 수 있습니다(예제는 [봉인된 클래스(Sealed classes)](sealed-classes.md)를 참조하세요).

> JVM에서 생성된 클래스에 매개변수가 없는 생성자(parameterless constructor)가 필요한 경우, 프로퍼티의 기본값을 지정해야 합니다([생성자](classes.md#constructors-and-initializer-blocks) 참조):
> 
> ```kotlin
> data class User(val name: String = "", val age: Int = 0)
> ```
>
{style="note"}

## 클래스 본문에 선언된 프로퍼티 {id="properties-declared-in-the-class-body"}

컴파일러는 자동으로 생성되는 함수에 대해 기본 생성자 내부에 정의된 프로퍼티만 사용합니다. 생성되는 구현에서 프로퍼티를 제외하려면 클래스 본문 내에 선언하세요:

```kotlin
data class Person(val name: String) {
    var age: Int = 0
}
```

아래 예제에서는 기본적으로 `toString()`, `equals()`, `hashCode()`, `copy()` 구현 내에서 `name` 프로퍼티만 사용되며, 컴포넌트 함수도 `component1()` 하나만 존재합니다.
`age` 프로퍼티는 클래스 본문 내에 선언되어 제외됩니다.
따라서 `equals()`는 기본 생성자의 프로퍼티만 평가하므로, `name`은 같지만 `age` 값이 다른 두 `Person` 객체는 동등한 것으로 간주됩니다:

```kotlin
data class Person(val name: String) {
    var age: Int = 0
}
fun main() {
//sampleStart
    val person1 = Person("John")
    val person2 = Person("John")
    person1.age = 10
    person2.age = 20

    println("person1 == person2: ${person1 == person2}")
    // person1 == person2: true
  
    println("person1 with age ${person1.age}: ${person1}")
    // person1 with age 10: Person(name=John)
  
    println("person2 with age ${person2.age}: ${person2}")
    // person2 with age 20: Person(name=John)
//sampleEnd
}
```
{kotlin-runnable="true"}

## 복사(Copying) {id="copying"}

객체를 복사할 때 나머지 프로퍼티는 그대로 유지하면서 _일부_ 프로퍼티만 변경하려면 `copy()` 함수를 사용하세요.
위의 `User` 클래스에 대한 이 함수의 구현은 다음과 같습니다:

```kotlin
fun copy(name: String = this.name, age: Int = this.age) = User(name, age)
```

그런 다음 다음과 같이 작성할 수 있습니다:

```kotlin
val jack = User(name = "Jack", age = 1)
val olderJack = jack.copy(age = 2)
```

`copy()` 함수는 인스턴스의 _얕은 복사(shallow copy)_를 생성합니다. 즉, 구성 요소를 재귀적으로 복사하지 않습니다.
그 결과, 다른 객체에 대한 참조는 공유됩니다.

예를 들어 프로퍼티가 가변 리스트(mutable list)를 보관하고 있다면, "원본" 값을 통해 변경한 내용이 복사본에서도 확인되며, 복사본을 통해 변경한 내용도 원본에서 확인할 수 있습니다:

```kotlin
data class Employee(val name: String, val roles: MutableList<String>)

fun main() {
    val original = Employee("Jamie", mutableListOf("developer"))
    val duplicate = original.copy()

    duplicate.roles.add("team lead")

    println(original) 
    // Employee(name=Jamie, roles=[developer, team lead])
    println(duplicate) 
    // Employee(name=Jamie, roles=[developer, team lead])
}
```
{kotlin-runnable="true"}

보시다시피, 두 프로퍼티가 동일한 리스트 참조를 공유하므로 `duplicate.roles` 프로퍼티를 수정하면 `original.roles` 프로퍼티도 함께 변경됩니다.

## 데이터 클래스와 구조 분해 선언 {id="data-classes-and-destructuring-declarations"}

데이터 클래스를 위해 생성된 _컴포넌트 함수(Component functions)_를 통해 [구조 분해 선언(destructuring declarations)](destructuring-declarations.md)에서 데이터 클래스를 사용할 수 있습니다:

```kotlin
val jane = User("Jane", 35)
val (name, age) = jane
println("$name, $age years of age") 
// Jane, 35 years of age
```

## 표준 데이터 클래스 {id="standard-data-classes"}

표준 라이브러리는 `Pair`와 `Triple` 클래스를 제공합니다. 하지만 대부분의 경우 프로퍼티에 의미 있는 이름을 제공하여 코드를 더 읽기 쉽게 만들어 주므로 명명된 데이터 클래스(named data class)를 사용하는 것이 더 나은 설계 선택입니다.