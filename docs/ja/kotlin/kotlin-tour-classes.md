[//]: # (title: クラス)

<no-index/>

<tldr>
    <p><img src="icon-1-done.svg" width="20" alt="ステップ1" /> <a href="kotlin-tour-hello-world.md">Hello world</a><br />
        <img src="icon-2-done.svg" width="20" alt="ステップ2" /> <a href="kotlin-tour-basic-types.md">基本の型</a><br />
        <img src="icon-3-done.svg" width="20" alt="ステップ3" /> <a href="kotlin-tour-collections.md">コレクション</a><br />
        <img src="icon-4-done.svg" width="20" alt="ステップ4" /> <a href="kotlin-tour-control-flow.md">制御フロー</a><br />
        <img src="icon-5-done.svg" width="20" alt="ステップ5" /> <a href="kotlin-tour-functions.md">関数</a><br />
        <img src="icon-6.svg" width="20" alt="ステップ6" /> <strong>クラス</strong><br />
        <img src="icon-7-todo.svg" width="20" alt="最終ステップ" /> <a href="kotlin-tour-null-safety.md">Null安全</a></p>
</tldr>

Kotlinは、クラスとオブジェクトによるオブジェクト指向プログラミングをサポートしています。オブジェクトは、プログラム内でデータを保存するのに便利です。
クラスを使用すると、オブジェクトの一連の特性を宣言できます。クラスからオブジェクトを作成することで、これらの特性を毎回宣言する必要がなくなるため、時間と手間を節約できます。

クラスを宣言するには、`class` キーワードを使用します： 

```kotlin
class Customer
```

## プロパティ

クラスのオブジェクトの特性は、プロパティとして宣言できます。クラスのプロパティは以下の場所で宣言できます：

* クラス名の後の丸括弧 `()` 内。
```kotlin
class Contact(val id: Int, var email: String)
```

* 波括弧 `{}` で囲まれたクラスボディ内。
```kotlin
class Contact(val id: Int, var email: String) {
    val category: String = ""
}
```

クラスのインスタンスが作成された後に変更する必要がない限り、プロパティは読み取り専用 (`val`) として宣言することをお勧めします。

丸括弧内で `val` や `var` を付けずにプロパティを宣言することもできますが、その場合、インスタンス作成後にそれらのプロパティにアクセスすることはできません。

> * 丸括弧 `()` 内に含まれる内容は、**クラスヘッダー**と呼ばれます。
> * クラスプロパティを宣言する際、[末尾のカンマ](coding-conventions.md#trailing-commas)（trailing comma）を使用できます。
>
{style="note"}

関数のパラメータと同様に、クラスのプロパティにもデフォルト値を設定できます：
```kotlin
class Contact(val id: Int, var email: String = "example@gmail.com") {
    val category: String = "work"
}
```

## インスタンスの作成

クラスからオブジェクトを作成するには、コンストラクタを使用してクラスの**インスタンス**を宣言します。

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
* デフォルトのコンストラクタで `id` と `email` を使用して `contact` を作成しています。

Kotlinのクラスは、自分で定義したものを含め、複数のコンストラクタを持つことができます。複数のコンストラクタを宣言する方法の詳細については、[コンストラクタ](classes.md#constructors-and-initializer-blocks)を参照してください。

## プロパティへのアクセス

インスタンスのプロパティにアクセスするには、インスタンス名の後にピリオド `.` を付け、その後にプロパティ名を書きます：

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

> 文字列の一部としてプロパティの値を連結するには、文字列テンプレート（`${}`）を使用できます。
> 例：
> ```kotlin
> println("Their email address is: ${contact.email}")
> ```
>
{style="tip"}

## メンバ関数

オブジェクトの特性としてプロパティを宣言するだけでなく、**メンバ関数**でオブジェクトの振る舞いを定義することもできます。

Kotlinでは、メンバ関数はクラスボディ内で宣言する必要があります。インスタンスでメンバ関数を呼び出すには、インスタンス名の後にピリオド `.` を付け、その後に関数名を書きます。例：

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

## データクラス

Kotlinには、データの保存に特に便利な**データクラス**（data classes）があります。データクラスは通常のクラスと同じ機能を持ちますが、追加のメンバ関数が自動的に備わっています。これらのメンバ関数を使用すると、インスタンスを読みやすい形式で出力したり、クラスのインスタンス同士を比較したり、インスタンスをコピーしたりといったことが簡単にできます。これらの関数は自動的に利用可能になるため、各クラスごとに同じようなボイラープレートコード（定型的なコード）を書く手間が省けます。

データクラスを宣言するには、`data` キーワードを使用します：

```kotlin
data class User(val name: String, val id: Int)
```

Kotlinコンパイラは、メンバ関数を生成する際、[プライマリコンストラクタ](classes.md#primary-constructor)内で定義されたプロパティのみを使用します。データクラスのボディ内でプロパティを宣言した場合、それらは生成される関数の出力には含まれません。

データクラスの最も便利な定義済みメンバ関数は以下の通りです：

| **関数** | **説明** |
|--------------------|------------------------------------------------------------------------------------------|
| `toString()` | クラスインスタンスとそのプロパティを読みやすい文字列で出力します。 |
| `equals()` または `==` | クラスのインスタンス同士を比較します。 |
| `copy()` | 別のインスタンスをコピーして新しいインスタンスを作成します。一部のプロパティのみを変更することも可能です。 |

各関数の使用例については、以下のセクションを参照してください：

* [文字列として出力](#print-as-string)
* [インスタンスの比較](#compare-instances)
* [インスタンスのコピー](#copy-instance)

### 文字列として出力

クラスインスタンスを読みやすい文字列で出力するには、`toString()` 関数を明示的に呼び出すか、`println()` や `print()` 関数を使用します。これらの関数は内部で自動的に `toString()` を呼び出します。

```kotlin
data class User(val name: String, val id: Int)

fun main() {
    //sampleStart
    val user = User("Alex", 1)
    
    // 出力が読みやすくなるよう、自動的に toString() 関数が使用されます
    println(user)            
    // User(name=Alex, id=1)
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-data-classes-print-string"}

これは、デバッグやログの作成時に特に便利です。

### インスタンスの比較

データクラスのインスタンスを比較するには、等価演算子 `==` を使用します：

```kotlin
data class User(val name: String, val id: Int)

fun main() {
    //sampleStart
    val user = User("Alex", 1)
    val secondUser = User("Alex", 1)
    val thirdUser = User("Max", 2)

    // user と second user を比較
    println("user == secondUser: ${user == secondUser}") 
    // user == secondUser: true
    
    // user と third user を比較
    println("user == thirdUser: ${user == thirdUser}")   
    // user == thirdUser: false
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-data-classes-compare-instances"}

### インスタンスのコピー

データクラスのインスタンスの正確なコピーを作成するには、そのインスタンスで `copy()` 関数を呼び出します。

インスタンスのコピーを作成しつつ、一部のプロパティ**のみ**を変更したい場合は、`copy()` 関数を呼び出す際に関数パラメータとして変更したいプロパティの値を指定します。

例：

```kotlin
data class User(val name: String, val id: Int)

fun main() {
    //sampleStart
    val user = User("Alex", 1)

    // user の正確なコピーを作成
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

インスタンスのコピーを作成することは、元のインスタンスを直接変更するよりも安全です。なぜなら、元のインスタンスに依存している他のコードが、コピーやその後の操作による影響を受けないためです。

データクラスの詳細については、[データクラス](data-classes.md)を参照してください。

このツアーの最後の章は、Kotlinの [Null安全](kotlin-tour-null-safety.md)についてです。

## 練習問題

### 演習 1 {initial-collapse-state="collapsed" collapsible="true"}

2つのプロパティ（名前用のプロパティと給与用のプロパティ）を持つデータクラス `Employee` を定義してください。給与のプロパティは、年末に昇給できるように可変（mutable）にしてください。`main` 関数はこのデータクラスの使用例を示しています。

|---|---|
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-classes-solution-1"}

### 演習 2 {initial-collapse-state="collapsed" collapsible="true"}

このコードをコンパイルするために必要な、追加のデータクラスを宣言してください。

|---|---|
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-classes-solution-2"}

### 演習 3 {initial-collapse-state="collapsed" collapsible="true"}

コードをテストするために、ランダムな従業員を作成できるジェネレーターが必要です。候補となる名前の固定リスト（クラスボディ内）を持つ `RandomEmployeeGenerator` クラスを定義してください。最小給与と最大給与（クラスヘッダー内）でクラスを設定できるようにします。クラスボディ内に `generateEmployee()` 関数を定義してください。ここでも、`main` 関数はこのクラスの使用例を示しています。

> この演習では、[`Random.nextInt()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.random/-random/next-int.html) 関数を使用するためにパッケージをインポートしています。
> パッケージのインポートの詳細については、[パッケージとインポート](packages.md)を参照してください。
>
{style="tip"}

<deflist collapsible="true" id="kotlin-tour-classes-exercise-3-hint-1">
    <def title="ヒント 1">
        リストには、リスト内のランダムなアイテムを返す <a href="https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/random.html"><code>.random()</code></a> という拡張関数があります。
    </def>
</deflist>

<deflist collapsible="true" id="kotlin-tour-classes-exercise-3-hint-2">
    <def title="ヒント 2">
        <code>Random.nextInt(from = ..., until = ...)</code> は、指定された範囲内のランダムな <code>Int</code> 数値を返します。
    </def>
</deflist>

|---|---|
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-classes-solution-3"}

## 次のステップ

[Null安全](kotlin-tour-null-safety.md)