[//]: # (title: 類別)

<no-index/>

Kotlin 透過類別與物件支援物件導向程式設計。物件在程式中對於儲存資料非常有用。
類別允許您為物件宣告一組特性。當您從類別建立物件時，可以節省時間和精力，因為您不必每次都宣告這些特性。

要宣告類別，請使用 `class` 關鍵字： 

```kotlin
class Customer
```

## 屬性

類別物件的特性可以在屬性中宣告。您可以為類別宣告屬性：

* 在類別名稱後的圓括號 `()` 內。
```kotlin
class Contact(val id: Int, var email: String)
```

* 在由花括號 `{}` 定義的類別主體內。
```kotlin
class Contact(val id: Int, var email: String) {
    val category: String = ""
}
```

我們建議您將屬性宣告為唯讀 (`val`)，除非在建立類別執行個體後需要變更它們。

您可以在圓括號內宣告不帶 `val` 或 `var` 的屬性，但這些屬性在執行個體建立後將無法存取。

> * 圓括號 `()` 內的內容稱為**類別標頭 (class header)**。
> * 宣告類別屬性時，您可以使用[尾隨逗號](coding-conventions.md#trailing-commas)。
>
{style="note"}

就像函式參數一樣，類別屬性可以有預設值：
```kotlin
class Contact(val id: Int, var email: String = "example@gmail.com") {
    val category: String = "work"
}
```

## 建立執行個體

要從類別建立物件，您可以使用**建構函式**宣告類別**執行個體**。

預設情況下，Kotlin 會使用類別標頭中宣告的參數自動建立建構函式。

例如：
```kotlin
class Contact(val id: Int, var email: String)

fun main() {
    val contact = Contact(1, "mary@gmail.com")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-class-create-instance"}

在範例中：

* `Contact` 是一個類別。
* `contact` 是 `Contact` 類別的一個執行個體。
* `id` 與 `email` 是屬性。
* `id` 與 `email` 與預設建構函式一起使用來建立 `contact`。

Kotlin 類別可以有多個建構函式，包括您自己定義的建構函式。若要進一步了解如何宣告多個建構函式，請參閱[建構函式](classes.md#constructors-and-initializer-blocks)。

## 存取屬性

要存取執行個體的屬性，請在執行個體名稱後加上句點 `.`，然後寫上屬性名稱：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-access-property"}

> 要將屬性的值作為字串的一部分進行連接，您可以使用字串範本 (`${}`).
> 例如：
> ```kotlin
> println("Their email address is: ${contact.email}")
> ```
>
{style="tip"}

## 成員函數

除了將屬性宣告為物件特性的一部分外，您還可以使用成員函數定義物件的行為。

在 Kotlin 中，成員函數必須在類別主體內宣告。要對執行個體呼叫成員函數，請在執行個體名稱後加上句點 `.`，然後寫上函數名稱。例如：

```kotlin
class Contact(val id: Int, var email: String) {
    fun printId() {
        println(id)
    }
}

fun main() {
    val contact = Contact(1, "mary@gmail.com")
    // 呼叫成員函數 printId()
    contact.printId()           
    // 1
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-member-function"}

## 資料類別

Kotlin 擁有**資料類別 (data class)**，這在儲存資料時特別有用。資料類別具有與類別相同的功能，但它們會自動配備額外的成員函數。這些成員函數可讓您輕鬆地將執行個體印出為可讀輸出、比較類別的執行個體、複製執行個體等。由於這些函數是自動可用的，您不必花時間為每個類別編寫相同的樣板程式碼。

要宣告資料類別，請使用 `data` 關鍵字：

```kotlin
data class User(val name: String, val id: Int)
```

Kotlin 編譯器在產生成員函數時，僅使用在[主建構函數](classes.md#primary-constructor)中定義的屬性。如果您在資料類別主體中宣告屬性，它們將不會包含在產生的函數輸出中。

資料類別最實用的預定義成員函數包括：

| **函數**           | **描述**                                                                          |
|--------------------|------------------------------------------------------------------------------------------|
| `toString()`       | 印出類別執行個體及其屬性的可讀字串。                                                       |
| `equals()` 或 `==` | 比較類別的執行個體。                                                                    |
| `copy()`           | 透過複製另一個執行個體來建立類別執行個體，並可選擇變更某些屬性。                           |

請參閱以下章節了解如何使用各個函數的範例：

* [印出為字串](#print-as-string)
* [比較執行個體](#compare-instances)
* [複製執行個體](#copy-instance)

### 印出為字串

要印出類別執行個體的可讀字串，您可以明確呼叫 `toString()` 函數，或使用印出函數 (`println()` 和 `print()`)，它們會自動為您呼叫 `toString()`：

```kotlin
data class User(val name: String, val id: Int)

fun main() {
    //sampleStart
    val user = User("Alex", 1)
    
    // 自動使用 toString() 函數，使輸出易於閱讀
    println(user)            
    // User(name=Alex, id=1)
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-data-classes-print-string"}

這在偵錯或建立記錄 (log) 時特別有用。

### 比較執行個體

要比較資料類別執行個體，請使用相等運算子 `==`：

```kotlin
data class User(val name: String, val id: Int)

fun main() {
    //sampleStart
    val user = User("Alex", 1)
    val secondUser = User("Alex", 1)
    val thirdUser = User("Max", 2)

    // 比較 user 與 second user
    println("user == secondUser: ${user == secondUser}") 
    // user == secondUser: true
    
    // 比較 user 與 third user
    println("user == thirdUser: ${user == thirdUser}")   
    // user == thirdUser: false
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-data-classes-compare-instances"}

### 複製執行個體

要建立資料類別執行個體的精確複本，請在執行個體上呼叫 `copy()` 函數。

要建立資料類別執行個體的複本**並**更改某些屬性，請在執行個體上呼叫 `copy()` 函數，**並**將屬性的替換值作為函數參數加入。

例如：

```kotlin
data class User(val name: String, val id: Int)

fun main() {
    //sampleStart
    val user = User("Alex", 1)

    // 建立 user 的精確複本
    println(user.copy())       
    // User(name=Alex, id=1)

    // 建立一個 name 為 "Max" 的 user 複本
    println(user.copy("Max"))  
    // User(name=Max, id=1)

    // 建立一個 id 為 3 的 user 複本
    println(user.copy(id = 3)) 
    // User(name=Alex, id=3)
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-data-classes-copy-instance"}

建立執行個體的複本比修改原始執行個體更安全，因為任何依賴原始執行個體的程式碼都不會受到複本及其後續操作的影響。

有關資料類別的更多資訊，請參閱[資料類別](data-classes.md)。

本導覽的最後一章是關於 Kotlin 的 [Null 安全](kotlin-tour-null-safety.md)。

## 練習 {completion-point="true"}

### 習題 1 {initial-collapse-state="collapsed" collapsible="true"}

定義一個資料類別 `Employee`，包含兩個屬性：一個用於名稱，另一個用於薪水。確保薪水屬性是可變的，否則您在年底就拿不到加薪了！`main` 函式示範了您如何使用此資料類別。

|---|---|
```kotlin
// 在此處編寫您的程式碼

fun main() {
    val emp = Employee("Mary", 20)
    println(emp)
    emp.salary += 10
    println(emp)
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-classes-exercise-1"}

|---|---|
```kotlin
data class Employee(val name: String, var salary: Int)

fun main() {
    val emp = Employee("Mary", 20)
    println(emp)
    emp.salary += 10
    println(emp)
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-classes-solution-1"}

### 習題 2 {initial-collapse-state="collapsed" collapsible="true"}

宣告使這段程式碼能成功編譯所需的額外資料類別。

|---|---|
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
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-classes-exercise-2"}

|---|---|
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-classes-solution-2"}

### 習題 3 {initial-collapse-state="collapsed" collapsible="true"}

為了測試您的程式碼，您需要一個可以建立隨機員工的產生器。定義一個 `RandomEmployeeGenerator` 類別，其內包含一個固定的潛在名稱清單（在類別主體內）。為該類別配置最低與最高薪水（在類別標頭內）。在類別主體內，定義 `generateEmployee()` 函式。同樣地，`main` 函式示範了您如何使用此類別。

> 在此練習中，您需要匯入一個套件，以便使用 [`Random.nextInt()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.random/-random/next-int.html) 函式。
> 有關匯入套件的更多資訊，請參閱[套件與匯入](packages.md)。
>
{style="tip"}

<deflist collapsible="true" id="kotlin-tour-classes-exercise-3-hint-1">
    <def title="提示 1">
        清單 (List) 有一個名為 <a href="https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/random.html"><code>.random()</code></a> 的擴充方法，會回傳清單中的一個隨機項目。
    </def>
</deflist>

<deflist collapsible="true" id="kotlin-tour-classes-exercise-3-hint-2">
    <def title="提示 2">
        <code>Random.nextInt(from = ..., until = ...)</code> 會在指定的限制範圍內給您一個隨機的 <code>Int</code> 數字。
    </def>
</deflist>

|---|---|
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
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-classes-exercise-3"}

|---|---|
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-classes-solution-3"}

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-functions.md" mode="outline" icon="arrow-left" icon-position="left">上一步</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-null-safety.md" mode="classic" icon="arrow-right" icon-position="right">下一步</a>
  </li>
</list>