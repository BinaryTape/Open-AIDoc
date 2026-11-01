[//]: # (title: 類別)

<no-index/>

Kotlin 透過類別與物件支援物件導向程式設計。物件非常適合用於在程式中儲存資料。
類別可讓您為物件宣告一組特徵。當您從類別建立物件時，可以節省時間與精力，因為您不必每次都宣告這些特徵。

若要宣告類別，請使用 `class` 關鍵字：

```kotlin
class Customer
```

## 屬性 {id="properties"}

類別物件的特徵可以在屬性中宣告。您可以為類別宣告屬性：

* 在類別名稱後面的圓括號 `()` 內。
```kotlin
class Contact(val id: Int, var email: String)
```

* 在由花括號 `{}` 定義的類別主體內。
```kotlin
class Contact(val id: Int, var email: String) {
    val category: String = ""
}
```

我們建議您將屬性宣告為唯讀 (`val`)，除非在建立該類別的執行個體之後需要變更它們。

您可以在圓括號內宣告沒有 `val` 或 `var` 的屬性，但在建立執行個體後將無法存取這些屬性。

> * 圓括號 `()` 中包含的內容稱為**類別標頭** (class header)。
> * 宣告類別屬性時，您可以使用[尾隨逗號](coding-conventions.md#trailing-commas)。
>
{style="note"}

就像函式參數一樣，類別屬性也可以有預設值：
```kotlin
class Contact(val id: Int, var email: String = "example@gmail.com") {
    val category: String = "work"
}
```

## 建立執行個體 {id="create-instance"}

若要從類別建立物件，請使用**建構函式**宣告類別**執行個體**。

預設情況下，Kotlin 會使用類別標頭中宣告的參數自動建立建構函式。

例如：
```kotlin
class Contact(val id: Int, var email: String)

fun main() {
    val contact = Contact(1, "mary@gmail.com")
}
```
{kotlin-runnable="true" id="kotlin-tour-class-create-instance"}

在此範例中：

* `Contact` 是一個類別。
* `contact` 是 `Contact` 類別的執行個體。
* `id` 與 `email` 是屬性。
* `id` 與 `email` 會搭配預設建構函式來建立 `contact`。

Kotlin 類別可以有多個建構函式，包含您自己定義的建構函式。若要深入了解如何宣告多個建構函式，請參閱[建構函式](classes.md#constructors-and-initializer-blocks)。

## 存取屬性 {id="access-properties"}

若要存取執行個體的屬性，請在執行個體名稱後面加上句點 `.`，接著寫入屬性名稱：

```kotlin
class Contact(val id: Int, var email: String)

fun main() {
    val contact = Contact(1, "mary@gmail.com")
    
    // 印出屬性的值：email
    println(contact.email)           
    // mary@gmail.com

    // 更新屬性的值：email
    contact.email = "jane@gmail.com"
    
    // 印出屬性的新值：email
    println(contact.email)           
    // jane@gmail.com
}
```
{kotlin-runnable="true" id="kotlin-tour-access-property"}

> 若要將屬性的值串接為字串的一部分，可以使用字串範本 (`$`)。
> 例如：
> ```kotlin
> println("Their email address is: ${contact.email}")
> ```
>
{style="tip"}

## 成員函式 {id="member-functions"}

除了宣告屬性作為物件特徵的一部分之外，您還可以透過成員函式定義物件的行為。

在 Kotlin 中，成員函式必須在類別主體內宣告。若要在執行個體上呼叫成員函式，請在執行個體名稱後面加上句點 `.`，接著寫入函式名稱。例如：

```kotlin
class Contact(val id: Int, var email: String) {
    fun printId() {
        println(id)
    }
}

fun main() {
    val contact = Contact(1, "mary@gmail.com")
    // 呼叫成員函式 printId()
    contact.printId()           
    // 1
}
```
{kotlin-runnable="true" id="kotlin-tour-member-function"}

## 資料類別 {id="data-classes"}

Kotlin 具有**資料類別** (data classes)，對於儲存資料特別實用。資料類別具有與一般類別相同的功能，但會自動附帶額外的成員函式。這些成員函式可讓您輕鬆地將執行個體印出為易讀的輸出、比較類別的執行個體、複製執行個體等等。由於這些函式是自動提供的，因此您不必為每個類別花費時間編寫相同的樣板程式碼。

若要宣告資料類別，請使用關鍵字 `data`：

```kotlin
data class User(val name: String, val id: Int)
```

Kotlin 編譯器在產生這些成員函式時，只會使用定義在[主建構函數](classes.md#primary-constructor)內部的屬性。如果您在資料類別主體中宣告屬性，它們將不會包含在產生的函式輸出中。

資料類別最實用的預先定義成員函式為：

| **函式** | **說明** |
|--------------------|------------------------------------------------------------------------------------------|
| `toString()` | 印出類別執行個體及其屬性的易讀字串。 |
| `equals()` 或 `==` | 比較類別的執行個體。 |
| `copy()` | 透過複製另一個執行個體來建立類別執行個體，可選擇性變更部分屬性。 |

請參閱以下章節以取得如何使用各函式的範例：

* [印出為字串](#print-as-string)
* [比較執行個體](#compare-instances)
* [複製執行個體](#copy-instance)

### 印出為字串 {id="print-as-string"}

若要印出類別執行個體的易讀字串，您可以明確呼叫 `toString()` 函式，或使用會為您自動呼叫 `toString()` 的列印函式（`println()` 與 `print()`）：

```kotlin
data class User(val name: String, val id: Int)

fun main() {
    //sampleStart
    val user = User("Alex", 1)
    
    // 自動使用 toString() 函式，讓輸出易於閱讀
    println(user)            
    // User(name=Alex, id=1)
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-data-classes-print-string"}

這在偵錯或建立記錄時特別有用。

### 比較執行個體 {id="compare-instances"}

若要比較資料類別的執行個體，請使用相等運算子 `==`：

```kotlin
data class User(val name: String, val id: Int)

fun main() {
    //sampleStart
    val user = User("Alex", 1)
    val secondUser = User("Alex", 1)
    val thirdUser = User("Max", 2)

    // 比較 user 與第二個 user
    println("user == secondUser: ${user == secondUser}") 
    // user == secondUser: true
    
    // 比較 user 與第三個 user
    println("user == thirdUser: ${user == thirdUser}")   
    // user == thirdUser: false
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-data-classes-compare-instances"}

### 複製執行個體 {id="copy-instance"}

若要建立資料類別執行個體的完全複本，請在該執行個體上呼叫 `copy()` 函式。

若要建立資料類別執行個體的複本**並**變更部分屬性，請在執行個體上呼叫 `copy()` 函式，**並**將屬性的替換值作為函式參數傳入。

例如：

```kotlin
data class User(val name: String, val id: Int)

fun main() {
    //sampleStart
    val user = User("Alex", 1)

    // 建立 user 的完全複本
    println(user.copy())       
    // User(name=Alex, id=1)

    // 建立 name 為 "Max" 的 user 複本
    println(user.copy("Max"))  
    // User(name=Max, id=1)

    // 建立 id 為 3 的 user 複本
    println(user.copy(id = 3)) 
    // User(name=Alex, id=3)
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-data-classes-copy-instance"}

建立執行個體的複本比直接修改原始執行個體更安全，因為任何依賴原始執行個體的程式碼都不會受到複本及其後續操作的影響。

有關資料類別的更多資訊，請參閱[資料類別](data-classes.md)。

本導覽的最後一章將介紹 Kotlin 的[空值安全](kotlin-tour-null-safety.md)。

## 練習 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="宣告資料類別" id="classes-exercise-1">

定義一個包含兩個屬性的資料類別 `Employee`：一個為姓名，另一個為薪水。請確保薪水屬性是可變的，否則在年底就無法獲得加薪！`main` 函式示範了如何使用此資料類別。

```kotlin
// 在此處編寫您的程式碼

fun main() {
    val emp = Employee("Mary", 20)
    println(emp)
    emp.salary += 10
    println(emp)
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/EmployeeTest.kt" validate="false" id="kotlin-tour-classes-exercise-1"}

```kotlin
data class Employee(val name: String, var salary: Int)

fun main() {
    val emp = Employee("Mary", 20)
    println(emp)
    emp.salary += 10
    println(emp)
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/EmployeeTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="Example solution" id="kotlin-tour-classes-solution-1"}

</def>
<def title="宣告巢狀資料類別" id="classes-exercise-2">

宣告使此程式碼能編譯通過所需的額外資料類別。

```kotlin
data class Person(val name: Name, val address: Address, val ownsAPet: Boolean = true)
// 在此處編寫您的程式碼
// data class Name(...)

fun main() {
    val person = Person(
        Name("John", "Smith"),
        Address("123 Fake Street", City("Springfield", "US")),
        ownsAPet = false
    )
    println(person)
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/PersonTest.kt" validate="false" id="kotlin-tour-classes-exercise-2"}

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
    println(person)
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/PersonTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="Example solution" id="kotlin-tour-classes-solution-2"}

</def>
<def title="使用類別產生隨機員工" id="classes-exercise-3">

為了測試您的程式碼，您需要一個可以產生隨機員工的產生器。定義一個 `RandomEmployeeGenerator` 類別，其中包含一組固定的潛在姓名清單（在類別主體內）。為該類別設定最低和最高薪水（在類別標頭內）。在類別主體內定義 `generateEmployee()` 函式。同樣地，`main` 函式示範了如何使用此類別。

> 在此練習中，您會匯入一個套件以便使用 [`Random.nextInt()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.random/-random/next-int.html) 函式。
> 有關匯入套件的更多資訊，請參閱[套件與匯入](packages.md)。
>
{style="tip"}

<deflist collapsible="true" id="kotlin-tour-classes-exercise-3-hint-1">
    <def title="提示 1">
        List 具有名為 <a href="https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/random.html"><code>.random()</code></a> 的擴充函式，可傳回清單中的隨機項目。
    </def>
</deflist>

<deflist collapsible="true" id="kotlin-tour-classes-exercise-3-hint-2">
    <def title="提示 2">
        <code>Random.nextInt(from = ..., until = ...)</code> 可為您提供指定範圍內的隨機 <code>Int</code> 數字。
    </def>
</deflist>

```kotlin
import kotlin.random.Random

data class Employee(val name: String, var salary: Int)

// 在此處編寫您的程式碼

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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/RandomEmployeeGeneratorTest.kt" validate="false" id="kotlin-tour-classes-exercise-3"}

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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/RandomEmployeeGeneratorTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="Example solution" id="kotlin-tour-classes-solution-3"}

</def>
</deflist>

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-functions.md" mode="outline" icon="arrow-left" icon-position="left">上一步</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-null-safety.md" mode="classic" icon="arrow-right" icon-position="right">下一步</a>
  </li>
</list>