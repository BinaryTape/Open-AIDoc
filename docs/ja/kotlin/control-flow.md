[//]: # (title: 条件とループ)

Kotlinは、プログラムのフローを制御するための柔軟なツールを提供します。`if`、`when`、およびループを使用して、条件に対する明確で表現力豊かなロジックを定義できます。

## If 式 {id="if-expression"}

Kotlinで `if` を使用するには、チェックする条件を括弧 `()` 内に追加し、結果が真（true）の場合に実行するアクションを中括弧 `{}` 内に追加します。追加の分岐やチェックには `else` や `else if` を使用できます。

また、`if` を式として記述することもでき、その戻り値を直接変数に代入できます。この形式では、`else` ブランチが必須となります。`if` 式は、他の言語にある三項演算子（`condition ? then : else`）と同じ目的を果たします。

例えば以下のようになります：

```kotlin
fun main() {
    val heightAlice = 160
    val heightBob = 175

    //sampleStart
    var taller = heightAlice
    if (heightAlice < heightBob) taller = heightBob

    // else ブランチを使用する場合
    if (heightAlice > heightBob) {
        taller = heightAlice
    } else {
        taller = heightBob
    }

    // if を式として使用する場合
    taller = if (heightAlice > heightBob) heightAlice else heightBob

    // else if を式として使用する場合：
    val heightLimit = 150
    val heightOrLimit = if (heightLimit > heightAlice) heightLimit else if (heightAlice > heightBob) heightAlice else heightBob

    println("Taller height is $taller")
    // Taller height is 175
    println("Height or limit is $heightOrLimit")
    // Height or limit is 175
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="if-else-if-kotlin"}

`if` 式の各ブランチはブロックにすることができ、その場合は最後の式の値が結果となります：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="if-else-blocks-kotlin"}

## When 式と文 {id="when-expressions-and-statements"}

`when` は、複数の可能性のある値や条件に基づいてコードを実行する条件式です。これは Java や C、その他の言語における `switch` 文に似ています。`when` はその引数を評価し、いずれかのブランチ条件が満たされるまで、各ブランチと順番に結果を比較します。例えば：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-conditions-when-statement"}

`when` は **式（expression）** としても **文（statement）** としても使用できます。式として使用する場合、`when` は後でコードで使用できる値を返します。文として使用する場合、`when` は結果を返さずにアクションを完了します。

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
// 結果は返さないが
// print 文を実行する
when (x) {
    1 -> print("x == 1")
    2 -> print("x == 2")
    else -> print("x is neither 1 nor 2")
}
```

</td>
</tr>
</table>

次に、`when` は対象（subject）の有無にかかわらず使用できます。どちらの場合も動作は同じです。対象を使用すると、何をチェックしているかが明確になるため、通常はコードの可読性と保守性が向上します。

<table>
   <tr>
       <td>対象 <code>x</code> がある場合</td>
       <td>対象がない場合</td>
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

`when` をどのように使用するかによって、ブランチですべての可能なケースをカバーする必要があるかどうかが決まります。すべての可能なケースをカバーすることを、*網羅的（exhaustive）* であると言います。

### 文としての利用 {id="statements"}

`when` を文として使用する場合、すべての可能なケースをカバーする必要はありません。この例では、一部のケースがカバーされていないため、どのブランチも実行されません。しかし、エラーは発生しません。

```kotlin
fun main() {
    //sampleStart
    val deliveryStatus = "OutForDelivery"
    when (deliveryStatus) {
        // すべてのケースがカバーされていない
        "Pending" -> print("Your order is being prepared")
        "Shipped" -> print("Your order is on the way")
    }
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-when-statement"}

`if` と同様に、各ブランチはブロックにすることができ、その値はブロック内の最後の式の値となります。

### 式としての利用 {id="expressions"}

`when` を式として使用する場合、すべての可能なケースを **必ず** カバーしなければなりません。最初に一致したブランチの値が、式全体の値になります。すべてのケースをカバーしていない場合、コンパイラはエラーをスローします。

`when` 式に対象がある場合、`else` ブランチを使用してすべての可能なケースがカバーされていることを確認できますが、必須ではありません。例えば、対象が `Boolean`、[`enum` クラス](enum-classes.md)、[`sealed` クラス](sealed-classes.md)、またはそれらの null 許容型のいずれかである場合、`else` ブランチなしですべてのケースをカバーできます。

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
        // すべてのケースがカバーされているため、else ブランチは不要
        Bit.ZERO -> 0
        Bit.ONE -> 1
    }

    println("Random bit as number: $numericValue")
    // Random bit as number: 0
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-when-expression-subject"}

> `when` 式を簡略化し、繰り返しを減らすために、コンテキスト依存解決（現在プレビュー中）を試してみてください。
> この機能を使用すると、期待される型が既知である場合に、`when` 式内で列挙型のエントリやシールクラスのメンバを使用する際に型名を省略できます。
> 
> 詳細については、[Preview of context-sensitive resolution](whatsnew22.md#preview-of-context-sensitive-resolution) または関連する [KEEP 提案](https://github.com/Kotlin/KEEP/blob/improved-resolution-expected-type/proposals/context-sensitive-resolution.md) を参照してください。
> 
{style="tip"}

`when` 式に対象が **ない** 場合、`else` ブランチが **必須** です。そうでないとコンパイラがエラーをスローします。`else` ブランチは、他のどのブランチ条件も満たされない場合に評価されます。

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-when-no-subject"}

### その他の when の活用方法 {id="other-ways-to-use-when"}

`when` 式と文は、コードを簡略化し、複数の条件を処理し、型チェックを実行するためのさまざまな方法を提供します。

カンマを使用して、複数の条件を単一のブランチにグループ化します：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-when-multiple-cases"}

ブランチ条件として `true` または `false` に評価される式を使用します：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-when-branch-expression"}

`in` または `!in` キーワードを使用して、値が [範囲（range）](ranges.md) またはコレクションに含まれているか、含まれていないかをチェックします：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-when-ranges"}

`is` または `!is` キーワードを使用して、値の型をチェックします。[スマートキャスト](typecasts.md#smart-casts) により、その型のメンバ関数やプロパティに直接アクセスできます：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-when-type-checks"}

伝統的な `if`-`else if` チェーンの代わりに `when` を使用します。
対象がない場合、ブランチ条件は単なるブール式になります。`true` 条件を持つ最初のブランチが実行されます：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-when-replace-if"}

最後に、以下の構文を使用して対象を変数にキャプチャできます：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-when-capture-subject"}

対象として導入された変数のスコープは、その `when` 式または文の本体に限定されます。

### ガード条件 {id="guard-conditions-in-when-expressions"}

ガード条件を使用すると、`when` 式または文のブランチに複数の条件を含めることができ、複雑な制御フローをより明示的かつ簡潔に記述できます。ガード条件は、対象を持つ `when` で使用できます。

同一ブランチ内のプライマリ条件の後に、`if` で区切ってガード条件を配置します：

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
        // プライマリ条件のみのブランチ
        // animal が Dog の場合に feedDog() を呼び出す
        is Animal.Dog -> feedDog()
        // プライマリ条件とガード条件の両方を持つブランチ
        // animal が Cat かつ mouseHunter でない場合に feedCat() を呼び出す
        is Animal.Cat if !animal.mouseHunter -> feedCat()
        // 上記の条件のいずれにも一致しない場合に "Unknown animal" を出力する
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

カンマで区切られた複数の条件がある場合は、ガード条件を使用できません。例えば：

```kotlin
0, 1 -> print("x == 0 or x == 1")
```

単一の `when` 式または文の中で、ガード条件のあるブランチとないブランチを混在させることができます。
ガード条件のあるブランチのコードは、プライマリ条件とガード条件の両方が `true` と評価された場合にのみ実行されます。
プライマリ条件が一致しない場合、ガード条件は評価されません。

`when` 文はすべてのケースをカバーする必要がないため、`else` ブランチのない `when` 文でガード条件を使用し、どの条件も一致しない場合は、コードは実行されません。

文とは異なり、`when` 式はすべてのケースをカバーする必要があります。`else` ブランチのない `when` 式でガード条件を使用する場合、実行時エラーを避けるために、コンパイラはすべての可能なケースを処理することを要求します。

論理演算子 `&&` (AND) または `||` (OR) を使用して、単一のブランチ内で複数のガード条件を組み合わせることができます。
[混乱を避けるために](coding-conventions.md#guard-conditions-in-when-expression)、論理式を括弧で囲んでください：

```kotlin
when (animal) {
    is Animal.Cat if (!animal.mouseHunter && animal.hungry) -> feedCat()
}
```

ガード条件は `else if` もサポートしています：

```kotlin
when (animal) {
    // `animal` が `Dog` であるかチェック
    is Animal.Dog -> feedDog()
    // `animal` が `Cat` かつ `mouseHunter` でないかチェックするガード条件
    is Animal.Cat if !animal.mouseHunter -> feedCat()
    // 上記の条件がどれも一致せず、かつ animal.eatsPlants が true の場合に giveLettuce() を呼び出す
    else if animal.eatsPlants -> giveLettuce()
    // 上記の条件のいずれにも一致しない場合に "Unknown animal" を出力する
    else -> println("Unknown animal")
}
```

### JVM 上でのバイトコード生成 {id="bytecode-generation-on-the-jvm"}

JVM 21 以降を対象として Kotlin コードをコンパイルする場合、コンパイラは対象となる `when` 式に対して [`invokedynamic`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/invoke/package-summary.html) 命令を生成します。これにより、Java の `switch` 文で生成されるバイトコードと同様に、よりサイズの小さいバイトコードが生成されます。

以下の条件がすべて満たされる場合、コンパイラは [`SwitchBootstraps.typeSwitch()`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/runtime/SwitchBootstraps.html) メソッドを伴う `invokedynamic` を使用します：

* `else` 以外のすべての条件が `is` または `null` チェックである。
* `when` 式に [ガード条件（`if`）](#guard-conditions-in-when-expressions) が含まれていない。
* 条件に、Kotlin のミュータブルコレクション（`MutableList`）や関数型（`kotlin.Function1`、`kotlin.Function2` など）のような、直接型チェックできない型が含まれていない。
* `when` 式に `else` 以外の条件が少なくとも2つある。
* すべてのブランチが `when` 式の同じ対象をチェックしている。

例えば：

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

ここでの `when (shape)` 式は、バイトコード内で複数の `instanceof` チェックを行う代わりに、単一の `invokedynamic` タイプスイッチにコンパイルされます。

## For ループ {id="for-loops"}

`for` ループを使用して、[コレクション](collections-overview.md)、[配列](arrays.md)、または [範囲（range）](ranges.md) を反復処理します：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-for-loop"}

### 範囲 (Ranges) {id="ranges"}

数値の範囲を反復処理するには、`..` および `..<` 演算子を使用した [範囲式](ranges.md) を使用します：

```kotlin
fun main() {
//sampleStart
    println("Closed-ended range:")
    for (i in 1..6) {
        print(i)
    }
    // Closed-ended range:
    // 123456
  
    println("\nOpen-ended range:")
    for (i in 1..<6) {
        print(i)
    }
    // Open-ended range:
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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-for-loop-range"}

### 配列 (Arrays) {id="arrays"}

配列またはリストをインデックス付きで反復処理したい場合は、`indices` プロパティを使用できます：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-for-loop-array"}

または、標準ライブラリの [`.withIndex()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/with-index.html) 関数を使用することもできます：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-for-loop-array-index"}

### イテレータ (Iterators) {id="iterators"}

`for` ループは、[イテレータ](iterators.md) を提供するあらゆるものを反復処理します。コレクションはデフォルトでイテレータを提供しますが、範囲と配列はインデックスベースのループにコンパイルされます。

`Iterator<>` を返す `iterator()` という名前のメンバ関数または拡張関数を提供することで、独自のイテレータを作成できます。`iterator()` 関数は、`next()` 関数と `Boolean` を返す `hasNext()` 関数を持つ必要があります。

クラスに対して独自のイテレータを作成する最も簡単な方法は、[`Iterable<T>`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-iterable/) インターフェースを継承し、既存の `iterator()`、`next()`、`hasNext()` 関数をオーバーライドすることです。例えば：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-for-loop-inherit-iterator"}

> [インターフェース](interfaces.md) と [継承](inheritance.md) について詳細を学ぶ。
> 
{style="tip"}

あるいは、ゼロから関数を作成することもできます。この場合、関数に `operator` キーワードを追加します：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-for-loop-iterator-from-scratch"}

## While ループ {id="while-loops"}

`while` および `do-while` ループは、条件が満たされている間、その本体内のコードを継続的に実行します。
両者の違いは、条件をチェックするタイミングです：

* `while` は条件をチェックし、満たされている場合は本体のコードを実行し、その後再び条件チェックに戻ります。
* `do-while` は本体のコードを実行してから条件をチェックします。条件が満たされていればループが繰り返されます。したがって、`do-while` の本体は、条件にかかわらず少なくとも1回は実行されます。

`while` ループの場合、チェックする条件を括弧 `()` 内に、本体を中括弧 `{}` 内に記述します：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-while-loop"}

`do-while` ループの場合、括弧 `()` 内の条件チェックの前に、まず中括弧 `{}` 内に本体を記述します：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-do-while-loop"}

## ループ内の break と continue {id="break-and-continue-in-loops"}

Kotlinは、ループ内での伝統的な `break` および `continue` 演算子をサポートしています。[リターンとジャンプ](returns.md) を参照してください。