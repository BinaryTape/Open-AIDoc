[//]: # (title: クラス)

<no-index/>

Kotlinは、クラスとオブジェクトを使用したオブジェクト指向プログラミングをサポートしています。オブジェクトは、プログラム内でデータを保存するのに便利です。
クラスを使用すると、オブジェクトの一連の特性（特徴）を宣言できます。クラスからオブジェクトを作成すると、それらの特性を毎回宣言する必要がなくなるため、時間と手間を節約できます。

クラスを宣言するには、`class` キーワードを使用します。

```kotlin
class Customer
```

## プロパティ {id="properties"}

クラスのオブジェクトが持つ特性は、プロパティで宣言できます。クラスのプロパティは次のように宣言できます。

* クラス名の後の括弧 `()` 内。
```kotlin
class Contact(val id: Int, var email: String)
```

* 中括弧 `{}` で定義されるクラス本体（クラスボディ）内。
```kotlin
class Contact(val id: Int, var email: String) {
    val category: String = ""
}
```

クラスのインスタンスが作成された後に変更する必要がない限り、プロパティは読み取り専用（`val`）として宣言することをお勧めします。

括弧内では `val` や `var` を付けずにプロパティ（パラメータ）を宣言することもできますが、それらはインスタンスが作成された後にアクセスすることはできません。

> * 括弧 `()` 内に含まれる内容は、**クラスヘッダー**と呼ばれます。
> * クラスのプロパティを宣言する際には、[末尾のカンマ（trailing comma）](coding-conventions.md#trailing-commas) を使用できます。
>
{style="note"}

関数のパラメータと同様に、クラスのプロパティにもデフォルト値を持たせることができます。
```kotlin
class Contact(val id: Int, var email: String = "example@gmail.com") {
    val category: String = "work"
}
```

## インスタンスの作成 {id="create-instance"}

クラスからオブジェクトを作成するには、**コンストラクタ**を使用してクラスの**インスタンス**を宣言します。

デフォルトでは、Kotlinはクラスヘッダーで宣言されたパラメータを持つコンストラクタを自動的に作成します。

例：
```kotlin
class Contact(val id: Int, var email: String)

fun main() {
    val contact = Contact(1, "mary@gmail.com")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-class-create-instance"}

この例では：

* `Contact` はクラスです。
* `contact` は `Contact` クラスのインスタンスです。
* `id` と `email` はプロパティです。
* `id` と `email` は、`contact` を作成するためにデフォルトコンストラクタとともに使用されます。

Kotlinのクラスには、自分で定義したコンストラクタを含め、複数のコンストラクタを持たせることができます。複数のコンストラクタを宣言する方法の詳細については、[コンストラクタ](classes.md#constructors-and-initializer-blocks) を参照してください。

## プロパティへのアクセス {id="access-properties"}

インスタンスのプロパティにアクセスするには、インスタンス名の後にピリオド `.` を付け、その後にプロパティ名を記述します。

```kotlin
class Contact(val id: Int, var email: String)

fun main() {
    val contact = Contact(1, "mary@gmail.com")
    
    // プロパティ email の値を出力
    println(contact.email)           
    // mary@gmail.com

    // プロパティ email の値を更新
    contact.email = "jane@gmail.com"
    
    // プロパティ email の新しい値を出力
    println(contact.email)           
    // jane@gmail.com
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-access-property"}

> 文字列の一部としてプロパティの値を結合するには、文字列テンプレート（`$`）を使用できます。
> 例：
> ```kotlin
> println("Their email address is: ${contact.email}")
> ```
>
{style="tip"}

## メンバ関数 {id="member-functions"}

オブジェクトの特性の一部としてプロパティを宣言することに加え、メンバ関数を使用してオブジェクトの振る舞いを定義することもできます。

Kotlinでは、メンバ関数はクラス本体内で宣言する必要があります。インスタンスでメンバ関数を呼び出すには、インスタンス名の後にピリオド `.` を付け、その後に関数名を記述します。例：

```kotlin
class Contact(val id: Int, var email: String) {
    fun printId() {
        println(id)
    }
}

fun main() {
    val contact = Contact(1, "mary@gmail.com")
    // メンバ関数 printId() を呼び出す
    contact.printId()           
    // 1
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-member-function"}

## データクラス {id="data-classes"}

Kotlinには、データの保存に特に役立つ**データクラス（data class）**があります。データクラスは通常のクラスと同じ機能を持ちますが、追加のメンバ関数が自動的に備わっています。これらのメンバ関数を使用すると、インスタンスを読みやすい形式で簡単に出力したり、クラスのインスタンス同士を比較したり、インスタンスをコピーしたりできます。これらの関数は自動的に利用可能になるため、各クラスに同じボイラープレートコードを書く時間を省くことができます。

データクラスを宣言するには、`data` キーワードを使用します。

```kotlin
data class User(val name: String, val id: Int)
```

Kotlinコンパイラは、メンバ関数を生成する際に[プライマリコンストラクタ](classes.md#primary-constructor)内で定義されたプロパティのみを使用します。データクラスの本体でプロパティを宣言した場合、それらは生成される関数の出力には含まれません。

データクラスの最も便利な事前定義メンバ関数は以下のとおりです。

| **関数**            | **説明**                                                                                 |
|--------------------|------------------------------------------------------------------------------------------|
| `toString()`       | クラスインスタンスとそのプロパティを読みやすい文字列として出力します。                     |
| `equals()` または `==` | クラスのインスタンス同士を比較します。                                                   |
| `copy()`           | 別のインスタンスをコピーしてクラスインスタンスを作成します。一部のプロパティを変更することも可能です。 |

各関数の使用例については、以下のセクションを参照してください。

* [文字列として出力](#print-as-string)
* [インスタンスの比較](#compare-instances)
* [インスタンスのコピー](#copy-instance)

### 文字列として出力 {id="print-as-string"}

クラスインスタンスの読みやすい文字列を出力するには、明示的に `toString()` 関数を呼び出すか、自動的に `toString()` を呼び出してくれる出力関数（`println()` や `print()`）を使用します。

```kotlin
data class User(val name: String, val id: Int)

fun main() {
    //sampleStart
    val user = User("Alex", 1)
    
    // 出力が読みやすくなるよう、自動的に toString() 関数を使用する
    println(user)            
    // User(name=Alex, id=1)
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-data-classes-print-string"}

これは、デバッグやログ作成時に特に役立ちます。

### インスタンスの比較 {id="compare-instances"}

データクラスのインスタンスを比較するには、等価演算子 `==` を使用します。

```kotlin
data class User(val name: String, val id: Int)

fun main() {
    //sampleStart
    val user = User("Alex", 1)
    val secondUser = User("Alex", 1)
    val thirdUser = User("Max", 2)

    // user と secondUser を比較
    println("user == secondUser: ${user == secondUser}") 
    // user == secondUser: true
    
    // user と thirdUser を比較
    println("user == thirdUser: ${user == thirdUser}")   
    // user == thirdUser: false
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-data-classes-compare-instances"}

### インスタンスのコピー {id="copy-instance"}

データクラスインスタンスの完全なコピーを作成するには、インスタンスの `copy()` 関数を呼び出します。

データクラスインスタンスのコピーを作成**し、かつ**一部のプロパティを変更したい場合は、インスタンスの `copy()` 関数を呼び出し、関数のパラメータとしてプロパティの置換値を渡します。

例：

```kotlin
data class User(val name: String, val id: Int)

fun main() {
    //sampleStart
    val user = User("Alex", 1)

    // user の完全なコピーを作成
    println(user.copy())       
    // User(name=Alex, id=1)

    // name を "Max" に変更した user のコピーを作成
    println(user.copy("Max"))  
    // User(name=Max, id=1)

    // id を 3 に変更した user のコピーを作成
    println(user.copy(id = 3)) 
    // User(name=Alex, id=3)
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-data-classes-copy-instance"}

インスタンスのコピーを作成する方が、元のインスタンスを変更するよりも安全です。元のインスタンスに依存しているコードが、コピーやその変更による影響を受けないためです。

データクラスの詳細については、[データクラス](data-classes.md) を参照してください。

このツアーの最後の章では、Kotlinの [null安全性（null safety）](kotlin-tour-null-safety.md) について扱います。

## 演習問題 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="データクラスの宣言" id="classes-exercise-1">

名前に対応するプロパティと、給与（salary）に対応するプロパティの2つを持つデータクラス `Employee` を定義してください。年末の昇給を受け取れるように、給与のプロパティは変更可能（ミュータブル）にしておきましょう！main関数は、このデータクラスをどのように使用できるかを示しています。

```kotlin
// ここにコードを書いてください

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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-classes-solution-1"}

</def>
<def title="ネストされたデータクラスの宣言" id="classes-exercise-2">

このコードをコンパイルするために必要な追加のデータクラスを宣言してください。

```kotlin
data class Person(val name: Name, val address: Address, val ownsAPet: Boolean = true)
// ここにコードを書いてください
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-classes-solution-2"}

</def>
<def title="クラスを使用したランダムな従業員の生成" id="classes-exercise-3">

コードをテストするために、ランダムに従業員を生成できるジェネレータが必要です。クラス本体内に名前候補の固定リストを持つ `RandomEmployeeGenerator` クラスを定義してください。クラスヘッダー内で最小給与と最大給与を設定できるようにします。クラス本体内に `generateEmployee()` 関数を定義してください。ここでも、main関数はこのクラスをどのように使用できるかを示しています。

> この演習では、[`Random.nextInt()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.random/-random/next-int.html) 関数を使用できるようにパッケージをインポートします。
> パッケージのインポートの詳細については、[パッケージとインポート](packages.md) を参照してください。
>
{style="tip"}

<deflist collapsible="true" id="kotlin-tour-classes-exercise-3-hint-1">
    <def title="ヒント 1">
        Listには、リスト内のランダムなアイテムを返す <a href="https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/random.html"><code>.random()</code></a> という拡張関数があります。
    </def>
</deflist>

<deflist collapsible="true" id="kotlin-tour-classes-exercise-3-hint-2">
    <def title="ヒント 2">
        <code>Random.nextInt(from = ..., until = ...)</code> は、指定された範囲内のランダムな <code>Int</code> 値を返します。
    </def>
</deflist>

```kotlin
import kotlin.random.Random

data class Employee(val name: String, var salary: Int)

// ここにコードを書いてください

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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-classes-solution-3"}

</def>
</deflist>

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-functions.md" mode="outline" icon="arrow-left" icon-position="left">前のステップ</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-null-safety.md" mode="classic" icon="arrow-right" icon-position="right">次のステップ</a>
  </li>
</list>