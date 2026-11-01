[//]: # (title: データクラス)

Kotlin のデータクラス（Data class）は、主にデータを保持するために使用されます。データクラスごとに、コンパイラはインスタンスを読みやすい形式で出力したり、インスタンス同士を比較したり、インスタンスをコピーしたりできるようにする追加のメンバ関数を自動的に生成します。
データクラスは `data` でマークします。

```kotlin
data class User(val name: String, val age: Int)
```

コンパイラは、プライマリコンストラクタで宣言されたすべてのプロパティから、以下のメンバを自動的に導出します。

* `equals()`/`hashCode()` のペア。
* `"User(name=John, age=42)"` という形式の `toString()`。
* プロパティの宣言順に対応する [`componentN()` 関数](destructuring-declarations.md)。
* [`copy()` 関数](#copying)。

生成されたコードの一貫性と意味のある動作を保証するために、データクラスは以下の要件を満たす必要があります。

* プライマリコンストラクタには少なくとも1つのパラメータが必要です。
* すべてのプライマリコンストラクタのパラメータは、`val` または `var` としてマークされている必要があります。
* データクラスを `abstract`、`open`、`sealed`、または `inner` にすることはできません。

さらに、データクラスのメンバの生成は、メンバの継承に関して以下のルールに従います。

* データクラスの本体に `equals()`、`hashCode()`、または `toString()` の明示的な実装がある場合、あるいはスーパークラスに `final` な実装がある場合、それらの関数は生成されず、既存の実装が使用されます。
* スーパータイプに `open` であり、互換性のある型を返す `componentN()` 関数がある場合、対応する関数がデータクラス用に生成され、スーパータイプの関数をオーバーライドします。互換性のないシグネチャまたは `final` であるためにスーパータイプの関数をオーバーライドできない場合、エラーが報告されます。
* `componentN()` 関数および `copy()` 関数に明示的な実装を提供することは許可されていません。

データクラスは他のクラスを継承できます（例については [Sealed クラス](sealed-classes.md) を参照してください）。

> JVM 上で、生成されたクラスに引数なしのコンストラクタを持たせる必要がある場合は、プロパティのデフォルト値を指定する必要があります（[コンストラクタ](classes.md#constructors-and-initializer-blocks) を参照）。
> 
> ```kotlin
> data class User(val name: String = "", val age: Int = 0)
> ```
>
{style="note"}

## クラス本体で宣言されたプロパティ {id="properties-declared-in-the-class-body"}

コンパイラは、自動生成される関数に対して、プライマリコンストラクタ内で定義されたプロパティのみを使用します。生成される実装からプロパティを除外するには、クラス本体内で宣言します。

```kotlin
data class Person(val name: String) {
    var age: Int = 0
}
```

以下の例では、デフォルトで `toString()`、`equals()`、`hashCode()`、および `copy()` の実装内で使用されるのは `name` プロパティのみであり、コンポーネント関数も `component1()` の1つだけになります。
`age` プロパティはクラス本体内で宣言されているため除外されます。
したがって、`equals()` はプライマリコンストラクタのプロパティのみを評価するため、同じ `name` を持ち異なる `age` の値を持つ2つの `Person` オブジェクトは等価とみなされます。

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

## コピー {id="copying"}

`copy()` 関数を使用すると、オブジェクトをコピーしながら、残りのプロパティを変更せずに一部のプロパティ_だけ_を変更できます。
上記の `User` クラスに対するこの関数の実装は、以下のようになります。

```kotlin
fun copy(name: String = this.name, age: Int = this.age) = User(name, age)
```

これにより、次のように記述できます。

```kotlin
val jack = User(name = "Jack", age = 1)
val olderJack = jack.copy(age = 2)
```

`copy()` 関数は、インスタンスの_浅いコピー_（シャローコピー）を作成します。言い換えれば、コンポーネントを再帰的にコピーすることはありません。
そのため、他のオブジェクトへの参照は共有されます。

たとえば、プロパティがミュータブルなリストを保持している場合、「オリジナル」の値を通じて行われた変更はコピーを通じても確認でき、コピーを通じて行われた変更もオリジナルを通じて確認できます。

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

ご覧のとおり、両方のプロパティが同じリスト参照を共有しているため、`duplicate.roles` プロパティを変更すると `original.roles` プロパティも変更されます。

## データクラスと分解宣言 {id="data-classes-and-destructuring-declarations"}

データクラス用に生成される_コンポーネント関数_により、[分解宣言](destructuring-declarations.md)（destructuring declarations）で使用できるようになります。

```kotlin
val jane = User("Jane", 35)
val (name, age) = jane
println("$name, $age years of age") 
// Jane, 35 years of age
```

## 標準のデータクラス {id="standard-data-classes"}

標準ライブラリには `Pair` クラスと `Triple` クラスが用意されています。しかし、ほとんどの場合、プロパティに意味のある名前を提供してコードを読みやすくできるため、名前付きのデータクラスを使用する方が優れた設計上の選択肢となります。