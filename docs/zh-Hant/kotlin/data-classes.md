[//]: # (title: 資料類別)

Kotlin 中的資料類別主要用於保存資料。對於每個資料類別，編譯器會自動產生額外的成員函數，讓您可以將執行個體輸出為易讀的格式、比較執行個體、複製執行個體等等。
資料類別使用 `data` 進行標記：

```kotlin
data class User(val name: String, val age: Int)
```

編譯器會自動從主建構函數中宣告的所有屬性衍生出下列成員：

* `equals()`/`hashCode()` 配對。
* 形式為 `"User(name=John, age=42)"` 的 `toString()`。
* 與屬性宣告順序對應的 [`componentN()` 函式](destructuring-declarations.md)。
* [`copy()` 函式](#copying)。

為了確保產生程式碼的一致性與有意義的行為，資料類別必須滿足以下需求：

* 主建構函數必須至少具有一個參數。
* 所有主建構函數參數都必須標記為 `val` 或 `var`。
* 資料類別不能是 abstract、open、sealed 或 inner。

此外，資料類別成員的產生在成員繼承方面遵循以下規則：

* 如果資料類別本體中存在 `equals()`、`hashCode()` 或 `toString()` 的明確實作，或者在基底類別中存在 `final` 實作，則不會產生這些函式，並會使用現有的實作。
* 如果超型別具有 `open` 且傳回相容型別的 `componentN()` 函式，則會為該資料類別產生對應的函式並覆寫超型別的函式。如果由於簽章不相容或由於其為 final 而無法覆寫超型別的函式，則會回報錯誤。
* 不允許為 `componentN()` 和 `copy()` 函式提供明確實作。

資料類別可以繼承其他類別（範例請參閱[密封類別](sealed-classes.md)）。

> 在 JVM 上，如果產生的類別需要具有無參數建構函式，則必須為屬性指定預設值（請參閱[建構函式](classes.md#constructors-and-initializer-blocks)）：
> 
> ```kotlin
> data class User(val name: String = "", val age: Int = 0)
> ```
>
{style="note"}

## 在類別本體中宣告的屬性 {id="properties-declared-in-the-class-body"}

編譯器僅使用主建構函數內部定義的屬性來自動產生函式。若要從產生的實作中排除某個屬性，請將其宣告在類別本體內：

```kotlin
data class Person(val name: String) {
    var age: Int = 0
}
```

在以下範例中，`toString()`、`equals()`、`hashCode()` 和 `copy()` 實作預設僅使用 `name` 屬性，且只有一個元件函式 `component1()`。
`age` 屬性宣告在類別本體內，因此被排除在外。
因此，兩個具有相同 `name` 但不同 `age` 值的 `Person` 物件會被視為相等，因為 `equals()` 僅評估來自主建構函數的屬性：

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

## 複製 {id="copying"}

使用 `copy()` 函式可以複製物件，讓您能夠修改其*部分*屬性，同時保持其餘屬性不變。
上述 `User` 類別對此函式的實作如下：

```kotlin
fun copy(name: String = this.name, age: Int = this.age) = User(name, age)
```

接著您可以撰寫如下程式碼：

```kotlin
val jack = User(name = "Jack", age = 1)
val olderJack = jack.copy(age = 2)
```

`copy()` 函式會對執行個體建立*淺層*複製（shallow copy）。換句話說，它不會遞迴複製元件。
因此，對其他物件的參照是共享的。

例如，如果某個屬性包含可變清單，透過「原始」值所做的變更也可以透過複本看到，而透過複本所做的變更也可以透過原始值看到：

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

如您所見，修改 `duplicate.roles` 屬性也會變更 `original.roles` 屬性，因為這兩個屬性共享相同的清單參照。

## 資料類別與解構宣告 {id="data-classes-and-destructuring-declarations"}

為資料類別產生的*元件函式*使其可以在[解構宣告](destructuring-declarations.md)中使用：

```kotlin
val jane = User("Jane", 35)
val (name, age) = jane
println("$name, $age years of age") 
// Jane, 35 years of age
```

## 標準資料類別 {id="standard-data-classes"}

標準程式庫提供了 `Pair` 和 `Triple` 類別。但在大多數情況下，具名的資料類別是更好的設計選擇，因為它們透過為屬性提供有意義的名稱，使程式碼更易於閱讀。