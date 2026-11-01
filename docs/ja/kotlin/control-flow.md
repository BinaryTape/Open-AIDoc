[//]: # (title: 条件分岐とループ)

Kotlin は、プログラムの制御フローを扱うための柔軟なツールを提供しています。`if`、`when`、そして各種ループを使用することで、条件に応じた明確で表現力豊かなロジックを定義できます。

## If 式 {id="if-expression"}

Kotlin で `if` を使用するには、チェックする条件を丸括弧 `()` 内に、結果が真（true）の場合に実行する処理を中括弧 `{}` 内に記述します。追加の分岐やチェックには `else` や `else if` を使用できます。

また、`if` は式（expression）としても記述でき、その戻り値を直接変数に代入できます。この形式では、`else` 分岐が必須となります。`if` 式は、他の言語にある三項演算子（`condition ? then : else`）と同じ役割を果たします。

例:

```kotlin
fun main() {
    val heightAlice = 160
    val heightBob = 175

    //sampleStart
    var taller = heightAlice
    if (heightAlice < heightBob) taller = heightBob

    // else 分岐を使用
    if (heightAlice > heightBob) {
        taller = heightAlice
    } else {
        taller = heightBob
    }

    // if を式として使用
    taller = if (heightAlice > heightBob) heightAlice else heightBob

    // else if を式として使用:
    val heightLimit = 150
    val heightOrLimit = if (heightLimit > heightAlice) heightLimit else if (heightAlice > heightBob) heightAlice else heightBob

    println("Taller height is $taller")
    // Taller height is 175
    println("Height or limit is $heightOrLimit")
    // Height or limit is 175
    //sampleEnd
}
```
{kotlin-runnable="true" id="if-else-if-kotlin"}

`if` 式の各分岐はブロックにすることができ、その場合ブロック内の最後の式（last expression）の値が結果になります:

```kotlin
fun main() {
    //sampleStart
    val heightAlice = 160
    val heightBob = 175

    val taller = if (heightAlice > heightBob) {
        print("Choose Alice\n")
        heightAlice
    } else {
        print("Choose Bob\n")
        heightBob
    }

    println("Taller height is $taller")
    //sampleEnd
}
```
{kotlin-runnable="true" id="if-else-blocks-kotlin"}

## When 式と文 {id="when-expressions-and-statements"}

`when` は、複数の取りうる値や条件に基づいてコードを実行する条件式です。Java や C などの言語における `switch` 文に似ています。`when` は引数を評価し、いずれかの分岐条件が満たされるまで、各分岐を上から順に結果と比較していきます。例:

```kotlin
fun main() {
    //sampleStart
    val userRole = "Editor"
    when (userRole) {
        "Viewer" -> print("User has read-only access")
        "Editor" -> print("User can edit content")
        else -> print("User role is not recognized")
    }
    // User can edit content
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-conditions-when-statement"}

`when` は**式**としても**文**としても使用できます。式として使用した場合、`when` は後続のコードで利用できる値を返します。文として使用した場合、`when` は結果を返さずに処理を実行します:

<table>
   <tr>
       <td>式 (Expression)</td>
       <td>文 (Statement)</td>
   </tr>
   <tr>
<td>

```kotlin
// text 変数に代入される
// 文字列を返す
val text = when (x) {
    1 -> "x == 1"
    2 -> "x == 2"
    else -> "x is neither 1 nor 2"
}
```

</td>
<td>

```kotlin
// 結果は返さず、
// 出力処理を実行する
when (x) {
    1 -> print("x == 1")
    2 -> print("x == 2")
    else -> print("x is neither 1 nor 2")
}
```

</td>
</tr>
</table>

また、`when` はサブジェクト（subject: 判定対象の引数）を指定して使うことも、指定せずに使うこともできます。どちらの方法でも動作は変わりません。通常、サブジェクトを指定した方が、何をチェックしているのかが明確になるため、コードの可読性と保守性が向上します。

<table>
   <tr>
       <td>サブジェクト <code>x</code> あり</td>
       <td>サブジェクトなし</td>
   </tr>
   <tr>
<td>

```kotlin
when(x) { ... }
```

</td>
<td>

```kotlin
when { ... }
```

</td>
</tr>
</table>

`when` をどのように使用するかによって、分岐ですべてのケースをカバーする必要があるかどうかが決まります。考えられるすべてのケースをカバーすることを、*網羅的（exhaustive）* であるといいます。

### 文（Statements） {id="statements"}

`when` を文として使用する場合は、すべてのケースをカバーする必要はありません。次の例では一部のケースがカバーされていないため、どの分岐も実行されません。しかし、エラーは発生しません:

```kotlin
fun main() {
    //sampleStart
    val deliveryStatus = "OutForDelivery"
    when (deliveryStatus) {
        // すべてのケースがカバーされているわけではない
        "Pending" -> print("Your order is being prepared")
        "Shipped" -> print("Your order is on the way")
    }
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-when-statement"}

`if` と同様に、各分岐はブロックにすることができ、その値はブロック内の最後の式の値になります。

### 式（Expressions） {id="expressions"}

`when` を式として使用する場合は、考えられるすべてのケースを**必ず**カバーしなければなりません。最初に一致した分岐の値が、式全体の値になります。すべてのケースをカバーしていない場合、コンパイラはエラーを発生させます。

`when` 式にサブジェクトがある場合、すべてのケースを確実にカバーするために `else` 分岐を使用できますが、必須ではありません。たとえば、サブジェクトが `Boolean`、[`enum` クラス](enum-classes.md)、[`sealed` クラス](sealed-classes.md)、またはそれらの null 許容型である場合、`else` 分岐なしですべてのケースをカバーできます:

```kotlin
import kotlin.random.Random
//sampleStart
enum class Bit {
    ZERO, ONE
}

fun getRandomBit(): Bit {
    return if (Random.nextBoolean()) Bit.ONE else Bit.ZERO
}

fun main() {
    val numericValue = when (getRandomBit()) {
        // すべてのケースがカバーされているため、else 分岐は不要
        Bit.ZERO -> 0
        Bit.ONE -> 1
    }

    println("Random bit as number: $numericValue")
    // Random bit as number: 0
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-when-expression-subject"}

> `when` 式を簡潔にし、重複を減らすために、コンテキスト依存の解決（Context-sensitive resolution、現在はプレビュー段階）を試してみてください。
> この機能を使用すると、期待される型が既知である場合に、`when` 式で enum エントリや sealed クラスのメンバーを使用する際に型名を省略できます。
> 
> 詳細については、[コンテキスト依存の解決のプレビュー](whatsnew22.md#preview-of-context-sensitive-resolution)または関連する [KEEP プロポーザル](https://github.com/Kotlin/KEEP/blob/improved-resolution-expected-type/proposals/context-sensitive-resolution.md)を参照してください。
> 
{style="tip"}

`when` 式にサブジェクトが**ない**場合、`else` 分岐が**必須**であり、指定しないとコンパイラがエラーを発生させます。他の分岐条件がいずれも満たされない場合に `else` 分岐が評価されます:

```kotlin
fun main() {
    //sampleStart
    val localFileSize = 1200
    val remoteFileSize = 1200

    val message = when {
        localFileSize > remoteFileSize -> "Local file is larger than remote file"
        localFileSize < remoteFileSize -> "Local file is smaller than remote file"
        else -> "Local and remote files are the same size"
    }

    println(message)
    // Local and remote files are the same size
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-when-no-subject"}

### when のその他の使い方 {id="other-ways-to-use-when"}

`when` の式や文は、コードを簡潔にし、複数の条件を処理し、型チェックを実行するためのさまざまな方法を提供します。

カンマを使用して、複数の条件を 1 つの分岐にまとめることができます:

```kotlin
fun main() {
    val ticketPriority = "High"
    //sampleStart
    when (ticketPriority) {
        "Low", "Medium" -> print("Standard response time")
        else -> print("High-priority handling")
    }
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-when-multiple-cases"}

`true` または `false` に評価される式を分岐条件として使用できます:

```kotlin
fun main() {
    val storedPin = "1234"
    val enteredPin = 1234
  
    //sampleStart
    when (enteredPin) {
        // 式
        storedPin.toInt() -> print("PIN is correct")
        else -> print("Incorrect PIN")
    }
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-when-branch-expression"}

`in` または `!in` キーワードを使用して、値が[範囲（range）](ranges.md)やコレクションに含まれているか（または含まれていないか）をチェックできます:

```kotlin
fun main() {
    val x = 7
    val validNumbers = setOf(15, 16, 17)

    //sampleStart
    when (x) {
        in 1..10 -> print("x is in the range")
        in validNumbers -> print("x is valid")
        !in 10..20 -> print("x is outside the range")
        else -> print("none of the above")
    }
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-when-ranges"}

`is` または `!is` キーワードを使用して値の型をチェックできます。[スマートキャスト](typecasts.md#smart-casts)のおかげで、その型のメンバー関数やプロパティに直接アクセスできます:

```kotlin
fun hasPrefix(input: Any): Boolean = when (input) {
    is String -> input.startsWith("ID-")
    else -> false
}

fun main() {
    val testInput = "ID-98345"
    println(hasPrefix(testInput))
    // true
}
```
{kotlin-runnable="true" id="kotlin-when-type-checks"}

従来の `if`-`else if` チェーンの代わりに `when` を使用できます。サブジェクトを指定しない場合、分岐条件は単純なブール式になります。最初に条件が `true` となった分岐が実行されます:

```kotlin
fun Int.isOdd() = this % 2 != 0
fun Int.isEven() = this % 2 == 0

fun main() {
    //sampleStart
    val x = 5
    val y = 8

    when {
        x.isOdd() -> print("x is odd")
        y.isEven() -> print("y is even")
        else -> print("x+y is odd")
    }
    // x is odd
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-when-replace-if"}

最後に、以下の構文を使用してサブジェクトを変数にキャプチャできます:

```kotlin
fun main() {
    val message = when (val input = "yes") {
        "yes" -> "You said yes"
        "no" -> "You said no"
        else -> "Unrecognized input: $input"
    }

    println(message)
    // You said yes
}
```
{kotlin-runnable="true" id="kotlin-when-capture-subject"}

サブジェクトとして導入された変数のスコープは、その `when` 式または文の本体内に制限されます。

### ガード条件 {id="guard-conditions-in-when-expressions"}

ガード条件（Guard conditions）を使用すると、`when` 式や文の分岐に複数の条件を含めることができ、複雑な制御フローをより明示的かつ簡潔に記述できます。ガード条件は、`when` にサブジェクトがある場合に使用できます。

同じ分岐内で、主要な条件（primary condition）の後に `if` で区切ってガード条件を配置します:

```kotlin
sealed interface Animal {
    data class Cat(val mouseHunter: Boolean) : Animal
    data class Dog(val breed: String) : Animal
}

fun feedDog() = println("Feeding a dog")
fun feedCat() = println("Feeding a cat")

//sampleStart
fun feedAnimal(animal: Animal) {
    when (animal) {
        // 主要な条件のみの分岐
        // animal が Dog の場合に feedDog() を呼び出す
        is Animal.Dog -> feedDog()
        // 主要な条件とガード条件の両方を持つ分岐
        // animal が Cat であり、かつ mouseHunter でない場合に feedCat() を呼び出す
        is Animal.Cat if !animal.mouseHunter -> feedCat()
        // 上記のどの条件にも一致しない場合は "Unknown animal" を出力
        else -> println("Unknown animal")
    }
}

fun main() {
    val animals = listOf(
        Animal.Dog("Beagle"),
        Animal.Cat(mouseHunter = false),
        Animal.Cat(mouseHunter = true)
    )

    animals.forEach { feedAnimal(it) }
    // Feeding a dog
    // Feeding a cat
    // Unknown animal
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.2" id="kotlin-when-guard-conditions"}

カンマで区切られた複数の条件がある場合は、ガード条件を使用できません。たとえば以下のような場合です:

```kotlin
0, 1 -> print("x == 0 or x == 1")
```

単一の `when` 式または文の中で、ガード条件を持つ分岐と持たない分岐を混在させることができます。ガード条件を持つ分岐のコードは、主要な条件とガード条件の両方が `true` と評価された場合にのみ実行されます。主要な条件が一致しない場合、ガード条件は評価されません。

`when` 文はすべてのケースをカバーする必要がないため、`else` 分岐のない `when` 文でガード条件を使用した場合、どの条件にも一致しなければコードは何も実行されません。

文とは異なり、`when` 式はすべてのケースをカバーしなければなりません。`else` 分岐のない `when` 式でガード条件を使用する場合、実行時エラーを防ぐために、コンパイラは考えられるすべてのケースを処理することを要求します。

論理演算子の `&&` (AND) または `||` (OR) を使用して、単一の分岐内で複数のガード条件を組み合わせることができます。[混乱を避けるため](coding-conventions.md#guard-conditions-in-when-expression)、論理式を丸括弧で囲んでください:

```kotlin
when (animal) {
    is Animal.Cat if (!animal.mouseHunter && animal.hungry) -> feedCat()
}
```

ガード条件は `else if` もサポートしています:

```kotlin
when (animal) {
    // `animal` が `Dog` であるかをチェック
    is Animal.Dog -> feedDog()
    // `animal` が `Cat` であり、かつ `mouseHunter` でないかをチェックするガード条件
    is Animal.Cat if !animal.mouseHunter -> feedCat()
    // 上記の条件がいずれも一致せず、かつ animal.eatsPlants が true の場合に giveLettuce() を呼び出す
    else if animal.eatsPlants -> giveLettuce()
    // 上記の条件がいずれも一致しない場合は "Unknown animal" を出力
    else -> println("Unknown animal")
}
```

### JVM 上でのバイトコード生成 {id="bytecode-generation-on-the-jvm"}

JVM 21 以降向けに Kotlin コードをコンパイルする場合、コンパイラは対象となる `when` 式に対して [`invokedynamic`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/invoke/package-summary.html) 命令を生成します。これにより、Java の `switch` 文によって生成されるバイトコードと同様の、より小さなバイトコードが生成されます。

コンパイラは、以下の条件がすべて満たされた場合に [`SwitchBootstraps.typeSwitch()`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/runtime/SwitchBootstraps.html) メソッドを伴う `invokedynamic` を使用します:

* `else` を除くすべての条件が `is` または `null` チェックである。
* `when` 式に[ガード条件（`if`）](#guard-conditions-in-when-expressions)が含まれていない。
* 条件に、直接型チェックできない型（可変 Kotlin コレクション（`MutableList`）や関数型（`kotlin.Function1`、`kotlin.Function2` など））が含まれていない。
* `when` 式に `else` 以外で少なくとも 2 つの条件がある。
* すべての分岐が `when` 式の同じサブジェクトをチェックしている。

例:

```kotlin
open class Shape

class Circle : Shape()
class Rectangle : Shape()
class Triangle : Shape()

fun countCorners(shape: Shape) = when (shape) {
    is Circle -> 0
    is Rectangle -> 4
    is Triangle -> 3
    else -> -1
}
```

ここでの `when (shape)` 式は、バイトコード内で複数の `instanceof` チェックを行う代わりに、単一の `invokedynamic` 型スイッチへとコンパイルされます。

## For ループ {id="for-loops"}

[コレクション](collections-overview.md)、[配列](arrays.md)、または[範囲（range）](ranges.md)を反復処理するには、`for` ループを使用します:

```kotlin
for (item in collection) print(item)
```

`for` ループの本体は、中括弧 `{}` を使用したブロックにすることができます。

```kotlin
fun main() {
    val shoppingList = listOf("Milk", "Bananas", "Bread")
    //sampleStart
    println("Things to buy:")
    for (item in shoppingList) {
        println("- $item")
    }
    // Things to buy:
    // - Milk
    // - Bananas
    // - Bread
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-for-loop"}

### 範囲（Ranges） {id="ranges"}

数値の範囲を反復処理するには、`..` および `..<` 演算子を使用した[範囲式（range expression）](ranges.md)を使用します:

```kotlin
fun main() {
//sampleStart
    println("Range with an inclusive upper bound:")
    for (i in 1..6) {
        print(i)
    }
    // Range with an inclusive upper bound:
    // 123456
  
    println("\nRange with an exclusive upper bound:")
    for (i in 1..<6) {
        print(i)
    }
    // Range with an exclusive upper bound:
    // 12345
  
    println("\nReverse order in steps of 2:")
    for (i in 6 downTo 0 step 2) {
        print(i)
    }
    // Reverse order in steps of 2:
    // 6420
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-for-loop-range"}

### 配列（Arrays） {id="arrays"}

インデックスを使って配列やリストを反復処理したい場合は、`indices` プロパティを使用できます:

```kotlin
fun main() {
    val routineSteps = arrayOf("Wake up", "Brush teeth", "Make coffee")
    //sampleStart
    for (i in routineSteps.indices) {
        println(routineSteps[i])
    }
    // Wake up
    // Brush teeth
    // Make coffee
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-for-loop-array"}

あるいは、標準ライブラリの [`.withIndex()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/with-index.html) 関数を使用することもできます:

```kotlin
fun main() {
    val routineSteps = arrayOf("Wake up", "Brush teeth", "Make coffee")
    //sampleStart
    for ((index, value) in routineSteps.withIndex()) {
        println("The step at $index is \"$value\"")
    }
    // The step at 0 is "Wake up"
    // The step at 1 is "Brush teeth"
    // The step at 2 is "Make coffee"
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-for-loop-array-index"}

### イテレータ（Iterators） {id="iterators"}

`for` ループは、[イテレータ（iterator）](iterators.md)を提供する任意のものに対して反復処理を行えます。コレクションはデフォルトでイテレータを提供しますが、範囲や配列はインデックスベースのループにコンパイルされます。

`Iterator<>` を返す `iterator()` という名前のメンバー関数または拡張関数を提供することで、独自のイテレータを作成できます。`iterator()` 関数は、`next()` 関数と、`Boolean` を返す `hasNext()` 関数を備えている必要があります。

クラスに独自のイテレータを作成する最も簡単な方法は、[`Iterable<T>`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-iterable/) インターフェースを継承し、すでに定義されている `iterator()`、`next()`、`hasNext()` 関数をオーバーライドすることです。例:

```kotlin
class Booklet(val totalPages: Int) : Iterable<Int> {
    override fun iterator(): Iterator<Int> {
        return object : Iterator<Int> {
            var current = 1
            override fun hasNext() = current <= totalPages
            override fun next() = current++
        }
    }
}

fun main() {
    val booklet = Booklet(3)
    for (page in booklet) {
        println("Reading page $page")
    }
    // Reading page 1
    // Reading page 2
    // Reading page 3
}
```
{kotlin-runnable="true" id="kotlin-for-loop-inherit-iterator"}

> [インターフェース](interfaces.md)と[継承](inheritance.md)の詳細についても参照してください。
> 
{style="tip"}

あるいは、ゼロから関数を作成することもできます。この場合は、各関数に `operator` キーワードを追加します:

```kotlin
//sampleStart
class Booklet(val totalPages: Int) {
    operator fun iterator(): Iterator<Int> {
        return object {
            var current = 1

            operator fun hasNext() = current <= totalPages
            operator fun next() = current++
        }.let {
            object : Iterator<Int> {
                override fun hasNext() = it.hasNext()
                override fun next() = it.next()
            }
        }
    }
}
//sampleEnd

fun main() {
    val booklet = Booklet(3)
    for (page in booklet) {
        println("Reading page $page")
    }
    // Reading page 1
    // Reading page 2
    // Reading page 3
}
```
{kotlin-runnable="true" id="kotlin-for-loop-iterator-from-scratch"}

## While ループ {id="while-loops"}

`while` ループおよび `do-while` ループは、条件が満たされている間、本体のコードを繰り返し実行します。両者の違いは、条件をチェックするタイミングです:

* `while` は条件をチェックし、それが満たされている場合に本体のコードを実行し、再び条件のチェックに戻ります。
* `do-while` は本体のコードを実行してから条件をチェックします。条件が満たされていればループが繰り返されます。そのため、`do-while` の本体は条件に関係なく少なくとも 1 回は実行されます。

`while` ループでは、チェックする条件を丸括弧 `()` 内に、本体を中括弧 `{}` 内に記述します:

```kotlin
fun main() {
    var carsInGarage = 0
    val maxCapacity = 3
//sampleStart
    while (carsInGarage < maxCapacity) {
        println("Car entered. Cars now in garage: ${++carsInGarage}")
    }
    // Car entered. Cars now in garage: 1
    // Car entered. Cars now in garage: 2
    // Car entered. Cars now in garage: 3

    println("Garage is full!")
    // Garage is full!
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-while-loop"}

`do-while` ループでは、チェックする条件を丸括弧 `()` 内に指定する前に、まず本体を中括弧 `{}` 内に記述します:

```kotlin
import kotlin.random.Random

fun main() {
    var roll: Int
//sampleStart
    do {
        roll = Random.nextInt(1, 7)
        println("Rolled a $roll")
    } while (roll != 6)
    // Rolled a 2
    // Rolled a 6
    
    println("Got a 6! Game over.")
    // Got a 6! Game over.
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-do-while-loop"}

## ループにおける break と continue {id="break-and-continue-in-loops"}

Kotlin は、ループ内での従来の `break` および `continue` 演算子をサポートしています。[リターンとジャンプ](returns.md)を参照してください。