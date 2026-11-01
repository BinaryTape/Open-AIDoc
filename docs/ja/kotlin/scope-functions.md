[//]: # (title: スコープ関数)

Kotlin標準ライブラリには、オブジェクトのコンテキスト内でコードブロックを実行することのみを目的とした関数がいくつか用意されています。そのような関数を[ラムダ式](lambdas.md)とともにオブジェクト上で呼び出すと、一時的なスコープが形成されます。このスコープ内では、オブジェクトの名前を使わずにそのオブジェクトにアクセスできます。このような関数を「スコープ関数（_scope functions_）」と呼びます。
これには、[`let`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/let.html)、[`run`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/run.html)、[`with`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/with.html)、[`apply`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/apply.html)、[`also`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/also.html) の5つがあります。

基本的に、これらの関数はすべて同じ動作を実行します。つまり、オブジェクト上でコードブロックを実行します。異なる点は、そのオブジェクトがブロック内でどのように利用可能になるか、そして式全体の結果が何になるかです。

以下は、スコープ関数の典型的な使用例です。

```kotlin
data class Person(var name: String, var age: Int, var city: String) {
    fun moveTo(newCity: String) { city = newCity }
    fun incrementAge() { age++ }
}

fun main() {
//sampleStart
    Person("Alice", 20, "Amsterdam").let {
        println(it)
        it.moveTo("London")
        it.incrementAge()
        println(it)
    }
//sampleEnd
}
```
{kotlin-runnable="true"}

`let` を使わずに同じ処理を書く場合、新しい変数を導入し、それを使用するたびにその名前を繰り返す必要があります。

```kotlin
data class Person(var name: String, var age: Int, var city: String) {
    fun moveTo(newCity: String) { city = newCity }
    fun incrementAge() { age++ }
}

fun main() {
//sampleStart
    val alice = Person("Alice", 20, "Amsterdam")
    println(alice)
    alice.moveTo("London")
    alice.incrementAge()
    println(alice)
//sampleEnd
}
```
{kotlin-runnable="true"}

スコープ関数は新しい技術的機能を導入するわけではありませんが、コードをより簡潔で読みやすいものにすることができます。

スコープ関数同士には多くの類似点があるため、ユースケースに適した関数を選択するのは少し難しい場合があります。選択は主に開発者の意図と、プロジェクト内での使用の一貫性に依存します。以下では、スコープ関数間の違いとその規約について詳しく説明します。

## 関数の選択 {id="function-selection"}

目的に合ったスコープ関数を選択しやすいように、主な違いをまとめた以下の表を提供します。

| 関数                                                                      | オブジェクト参照 | 戻り値         | 拡張関数であるか                             |
|---------------------------------------------------------------------------|------------------|----------------|----------------------------------------------|
| [`let`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/let.html)     | `it`             | ラムダの結果   | はい                                         |
| [`run`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/run.html)     | `this`           | ラムダの結果   | はい                                         |
| [`run`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/run.html)     | -                | ラムダの結果   | いいえ: コンテキストオブジェクトなしで呼び出される |
| [`with`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/with.html)   | `this`           | ラムダの結果   | いいえ: コンテキストオブジェクトを引数として受け取る |
| [`apply`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/apply.html) | `this`           | コンテキストオブジェクト | はい                                         |
| [`also`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/also.html)   | `it`             | コンテキストオブジェクト | はい                                         |

これらの関数の詳細な情報は、以降の各セクションで説明します。

目的別にスコープ関数を選択するための簡単なガイドを以下に示します。

* null非許容（non-nullable）オブジェクトに対してラムダを実行する: `let`
* 式を変数としてローカルスコープに導入する: `let`
* オブジェクトの設定（構成）: `apply`
* オブジェクトの設定および計算結果の取得: `run`
* 式が要求される場所で複数の文を実行する: 非拡張関数の `run`
* 追加の効果（副作用）を実行する: `also`
* オブジェクトに対する一連の関数呼び出しをグループ化する: `with`

各スコープ関数のユースケースは重複しているため、プロジェクトやチームで採用されている特定の規約に基づいて使用する関数を選択できます。

スコープ関数はコードをより簡潔にできますが、使いすぎには注意してください。コードが読みにくくなり、エラーの原因となる可能性があります。また、スコープ関数をネストすることは避け、チェーンする際も注意することをお勧めします。現在のコンテキストオブジェクトや `this`、`it` の値が何であるか混乱しやすくなるためです。

## 相違点 {id="distinctions"}

スコープ関数は性質が似ているため、その違いを理解することが重要です。
各スコープ関数には、主に2つの違いがあります。
* コンテキストオブジェクトの参照方法
* 戻り値

### コンテキストオブジェクト: this または it {id="context-object-this-or-it"}

スコープ関数に渡されたラムダ内では、コンテキストオブジェクトにその実際の名前ではなく、短い参照を使ってアクセスできます。各スコープ関数は、コンテキストオブジェクトを参照するために、ラムダの[レシーバ](lambdas.md#function-literals-with-receiver)（`this`）として扱うか、ラムダの引数（`it`）として扱うかのいずれかの方法を使用します。どちらも同じ機能を提供するため、ここではユースケースに応じたそれぞれのメリット・デメリットを説明し、使用上の推奨事項を示します。

```kotlin
fun main() {
    val str = "Hello"
    // this
    str.run {
        println("The string's length: $length")
        //println("The string's length: ${this.length}") // 同じ動作
    }

    // it
    str.let {
        println("The string's length is ${it.length}")
    }
}
```
{kotlin-runnable="true"}

#### this {id="this"}

`run`、`with`、`apply` は、コンテキストオブジェクトをラムダの[レシーバ](lambdas.md#function-literals-with-receiver)として、キーワード `this` で参照します。したがって、これらのラムダ内では、通常のクラス関数内と同様にオブジェクトを利用できます。

ほとんどの場合、レシーバオブジェクトのメンバーにアクセスするときに `this` を省略できるため、コードをより短くできます。一方で、`this` を省略すると、レシーバのメンバーと外部のオブジェクトや関数との区別がつきにくくなることがあります。そのため、コンテキストオブジェクトをレシーバ（`this`）として扱う方法は、関数の呼び出しやプロパティへの値の代入など、オブジェクトのメンバーに対する操作が主となるラムダに推奨されます。

```kotlin
data class Person(var name: String, var age: Int = 0, var city: String = "")

fun main() {
//sampleStart
    val adam = Person("Adam").apply { 
        age = 20                       // this.age = 20 と同じ
        city = "London"
    }
    println(adam)
//sampleEnd
}
```
{kotlin-runnable="true"}

#### it {id="it"}

一方、`let` と `also` はコンテキストオブジェクトをラムダの[引数](lambdas.md#lambda-expression-syntax)として参照します。引数名が指定されていない場合、オブジェクトには暗黙のデフォルト名である `it` を使ってアクセスします。`it` は `this` よりも短く、`it` を使った式は通常読みやすくなります。

ただし、オブジェクトの関数やプロパティを呼び出す際には、`this` のようにオブジェクトが暗黙的に利用可能になるわけではありません。そのため、コンテキストオブジェクトが主に関数呼び出しの引数として使用される場合は、`it` を介してアクセスする方が適しています。また、コードブロック内で複数の変数を使用する場合にも `it` の方が適しています。

```kotlin
import kotlin.random.Random

fun writeToLog(message: String) {
    println("INFO: $message")
}

fun main() {
//sampleStart
    fun getRandomInt(): Int {
        return Random.nextInt(100).also {
            writeToLog("getRandomInt() generated value $it")
        }
    }
    
    val i = getRandomInt()
    println(i)
//sampleEnd
}
```
{kotlin-runnable="true"}

以下の例は、引数名 `value` を指定して、コンテキストオブジェクトをラムダの引数として参照する方法を示しています。

```kotlin
import kotlin.random.Random

fun writeToLog(message: String) {
    println("INFO: $message")
}

fun main() {
//sampleStart
    fun getRandomInt(): Int {
        return Random.nextInt(100).also { value ->
            writeToLog("getRandomInt() generated value $value")
        }
    }
    
    val i = getRandomInt()
    println(i)
//sampleEnd
}
```
{kotlin-runnable="true"}

### 戻り値 {id="return-value"}

スコープ関数は、返す結果によって異なります。
* `apply` と `also` はコンテキストオブジェクトを返します。
* `let`、`run`、`with` はラムダの結果を返します。

コードの次のステップで何をしたいかに基づいて、どのような戻り値が必要かを慎重に検討する必要があります。これにより、使用すべき最適なスコープ関数を選択できます。

#### コンテキストオブジェクト {id="context-object"}

`apply` と `also` の戻り値は、コンテキストオブジェクト自体です。そのため、これらは呼び出しチェーンに「サイドアクション（_side steps_）」として組み込むことができます。つまり、同じオブジェクトに対して次々と関数の呼び出しチェーンを続けることができます。

```kotlin
fun main() {
//sampleStart
    val numberList = mutableListOf<Double>()
    numberList.also { println("Populating the list") }
        .apply {
            add(2.71)
            add(3.14)
            add(1.0)
        }
        .also { println("Sorting the list") }
        .sort()
//sampleEnd
    println(numberList)
}
```
{kotlin-runnable="true"}

これらは、コンテキストオブジェクトを返す関数の return 文でも使用できます。

```kotlin
import kotlin.random.Random

fun writeToLog(message: String) {
    println("INFO: $message")
}

fun main() {
//sampleStart
    fun getRandomInt(): Int {
        return Random.nextInt(100).also {
            writeToLog("getRandomInt() generated value $it")
        }
    }
    
    val i = getRandomInt()
//sampleEnd
}
```
{kotlin-runnable="true"}

#### ラムダの結果 {id="lambda-result"}

`let`、`run`、`with` はラムダの結果を返します。そのため、結果を変数に代入したり、その結果に対してさらに操作をチェーンしたりする場合に使用できます。

```kotlin
fun main() {
//sampleStart
    val numbers = mutableListOf("one", "two", "three")
    val countEndsWithE = numbers.run { 
        add("four")
        add("five")
        count { it.endsWith("e") }
    }
    println("There are $countEndsWithE elements that end with e.")
//sampleEnd
}
```
{kotlin-runnable="true"}

さらに、戻り値を無視して、ローカル変数用の一時的なスコープを作成するためにスコープ関数を使用することもできます。

```kotlin
fun main() {
//sampleStart
    val numbers = mutableListOf("one", "two", "three")
    with(numbers) {
        val firstItem = first()
        val lastItem = last()        
        println("First item: $firstItem, last item: $lastItem")
    }
//sampleEnd
}
```
{kotlin-runnable="true"}

## 各関数 {id="functions"}

ユースケースに適したスコープ関数を選択できるよう、それぞれの詳細と推奨される使用方法を説明します。技術的には、スコープ関数は多くの場合において相互に置き換え可能です。そのため、以下の例では一般的な使用規則（イディオム）を示しています。

### let {id="let"}

- **コンテキストオブジェクト**は引数（`it`）として利用可能です。
- **戻り値**はラムダの結果です。

[`let`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/let.html) は、呼び出しチェーンの結果に対して1つ以上の関数を呼び出すために使用できます。例えば、次のコードはコレクションに対する2つの操作の結果を出力します。

```kotlin
fun main() {
//sampleStart
    val numbers = mutableListOf("one", "two", "three", "four", "five")
    val resultList = numbers.map { it.length }.filter { it > 3 }
    println(resultList)    
//sampleEnd
}
```
{kotlin-runnable="true"}

`let` を使用すると、リスト操作の結果を変数に代入しないように上記の例を書き直すことができます。

```kotlin
fun main() {
//sampleStart
    val numbers = mutableListOf("one", "two", "three", "four", "five")
    numbers.map { it.length }.filter { it > 3 }.let { 
        println(it)
        // 必要に応じてさらに別の関数を呼び出す
    } 
//sampleEnd
}
```
{kotlin-runnable="true"}

`let` に渡されたコードブロックに `it` を引数とする単一の関数が含まれている場合は、ラムダ引数の代わりにメソッド参照（`::`）を使用できます。

```kotlin
fun main() {
//sampleStart
    val numbers = mutableListOf("one", "two", "three", "four", "five")
    numbers.map { it.length }.filter { it > 3 }.let(::println)
//sampleEnd
}
```
{kotlin-runnable="true"}

`let` は、null以外の値を含むコードブロックを実行するためによく使用されます。null許容（nullable）オブジェクトに対してアクションを実行するには、そのオブジェクトで[安全呼び出し演算子 `?.`](null-safety.md#safe-call-operator) を使用し、ラムダ内にアクションを指定して `let` を呼び出します。

```kotlin
fun processNonNullString(str: String) {}

fun main() {
//sampleStart
    val str: String? = "Hello"   
    //processNonNullString(str)       // コンパイルエラー: str は null の可能性があります
    val length = str?.let { 
        println("let() called on $it")        
        processNonNullString(it)      // OK: '?.let { }' 内では 'it' は null ではありません
        it.length
    }
//sampleEnd
}
```
{kotlin-runnable="true"}

また、スコープを限定したローカル変数を導入してコードを読みやすくするために `let` を使用することもできます。
コンテキストオブジェクトに新しい変数を定義するには、デフォルトの `it` の代わりに使用できるように、ラムダの引数としてその名前を指定します。

```kotlin
fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    val modifiedFirstItem = numbers.first().let { firstItem ->
        println("The first item of the list is '$firstItem'")
        if (firstItem.length >= 5) firstItem else "!" + firstItem + "!"
    }.uppercase()
    println("First item after modifications: '$modifiedFirstItem'")
//sampleEnd
}
```
{kotlin-runnable="true"}

### with {id="with"}

- **コンテキストオブジェクト**はレシーバ（`this`）として利用可能です。
- **戻り値**はラムダの結果です。

[`with`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/with.html) は拡張関数ではありません。コンテキストオブジェクトは引数として渡されますが、ラムダ内ではレシーバ（`this`）として利用可能です。

返される結果を使用する必要がない場合に、コンテキストオブジェクトの関数を呼び出す用途として `with` の使用を推奨します。
コード上では、`with` は「*このオブジェクトを使って、以下の処理を行う（with this object, do the following）*」と読むことができます。

```kotlin
fun main() {
//sampleStart
    val numbers = mutableListOf("one", "two", "three")
    with(numbers) {
        println("'with' is called with argument $this")
        println("It contains $size elements")
    }
//sampleEnd
}
```
{kotlin-runnable="true"}

また、プロパティや関数が値の計算に使用されるヘルパーオブジェクトを導入するために `with` を使用することもできます。

```kotlin
fun main() {
//sampleStart
    val numbers = mutableListOf("one", "two", "three")
    val firstAndLast = with(numbers) {
        "The first element is ${first()}," +
        " the last element is ${last()}"
    }
    println(firstAndLast)
//sampleEnd
}
```
{kotlin-runnable="true"}

### run {id="run"}

- **コンテキストオブジェクト**はレシーバ（`this`）として利用可能です。
- **戻り値**はラムダの結果です。

[`run`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/run.html) は `with` と同じ動作をしますが、拡張関数として実装されています。そのため、`let` と同様に、ドット表記を使用してコンテキストオブジェクト上で呼び出すことができます。

`run` は、ラムダがオブジェクトの初期化と戻り値の計算の両方を行う場合に便利です。

```kotlin
class MultiportService(var url: String, var port: Int) {
    fun prepareRequest(): String = "Default request"
    fun query(request: String): String = "Result for query '$request'"
}

fun main() {
//sampleStart
    val service = MultiportService("https://example.kotlinlang.org", 80)

    val result = service.run {
        port = 8080
        query(prepareRequest() + " to port $port")
    }
    
    // let() 関数を使って書かれた同じコード:
    val letResult = service.let {
        it.port = 8080
        it.query(it.prepareRequest() + " to port ${it.port}")
    }
//sampleEnd
    println(result)
    println(letResult)
}
```
{kotlin-runnable="true"}

また、`run` を非拡張関数として呼び出すこともできます。非拡張版の `run` にはコンテキストオブジェクトはありませんが、それでもラムダの結果を返します。非拡張の `run` を使用すると、式が必要とされる場所で複数の文で構成されるブロックを実行できます。コード上では、非拡張の `run` は「*コードブロックを実行し、結果を計算する（run the code block and compute the result）*」と読むことができます。

```kotlin
fun main() {
//sampleStart
    val hexNumberRegex = run {
        val digits = "0-9"
        val hexDigits = "A-Fa-f"
        val sign = "+-"
        
        Regex("[$sign]?[$digits$hexDigits]+")
    }
    
    for (match in hexNumberRegex.findAll("+123 -FFFF !%*& 88 XYZ")) {
        println(match.value)
    }
//sampleEnd
}
```
{kotlin-runnable="true"}

### apply {id="apply"}

- **コンテキストオブジェクト**はレシーバ（`this`）として利用可能です。
- **戻り値**はオブジェクト自体です。

[`apply`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/apply.html) はコンテキストオブジェクト自体を返すため、値を返さず、主にレシーバオブジェクトのメンバーに対して操作を行うコードブロックに使用することをお勧めします。`apply` の最も一般的なユースケースは、オブジェクトの設定（構成）です。このような呼び出しは、「*オブジェクトに以下の割り当てを適用する（apply the following assignments to the object）*」と読むことができます。

```kotlin
data class Person(var name: String, var age: Int = 0, var city: String = "")

fun main() {
//sampleStart
    val adam = Person("Adam").apply {
        age = 32
        city = "London"        
    }
    println(adam)
//sampleEnd
}
```
{kotlin-runnable="true"}

`apply` のもう1つのユースケースは、より複雑な処理のために複数の呼び出しチェーンに `apply` を含めることです。

### also {id="also"}

- **コンテキストオブジェクト**は引数（`it`）として利用可能です。
- **戻り値**はオブジェクト自体です。

[`also`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/also.html) は、コンテキストオブジェクトを引数として受け取る何らかのアクションを実行するのに便利です。オブジェクトのプロパティや関数ではなく、オブジェクト自体への参照を必要とするアクションや、外側のスコープからの `this` 参照をシャドウ（隠蔽）したくない場合に `also` を使用します。

コード内で `also` を見かけたときは、「*そしてそのオブジェクトに対して次の処理も行う（and also do the following with the object）*」と読むことができます。

```kotlin
fun main() {
//sampleStart
    val numbers = mutableListOf("one", "two", "three")
    numbers
        .also { println("The list elements before adding new one: $it") }
        .add("four")
//sampleEnd
}
```
{kotlin-runnable="true"}

## takeIf と takeUnless {id="takeif-and-takeunless"}

スコープ関数に加えて、標準ライブラリには [`takeIf`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/take-if.html) と [`takeUnless`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/take-unless.html) という関数が含まれています。これらの関数を使用すると、呼び出しチェーンの中にオブジェクトの状態チェックを埋め込むことができます。

述語（述語関数 / predicate）とともにオブジェクト上で呼び出された場合、`takeIf` は指定された述語を満たしていればそのオブジェクトを返します。満たしていなければ `null` を返します。つまり、`takeIf` は単一のオブジェクトに対するフィルタリング関数です。

`takeUnless` は `takeIf` と逆のロジックを持ちます。述語とともにオブジェクト上で呼び出された場合、`takeUnless` は指定された述語を満たしていれば `null` を返します。満たしていなければそのオブジェクトを返します。

`takeIf` または `takeUnless` を使用する場合、オブジェクトはラムダの引数（`it`）として利用可能です。

```kotlin
import kotlin.random.*

fun main() {
//sampleStart
    val number = Random.nextInt(100)

    val evenOrNull = number.takeIf { it % 2 == 0 }
    val oddOrNull = number.takeUnless { it % 2 == 0 }
    println("even: $evenOrNull, odd: $oddOrNull")
//sampleEnd
}
```
{kotlin-runnable="true"}

> `takeIf` や `takeUnless` の後に他の関数をチェーンする場合は、戻り値が null 許容型になるため、null チェックを行うか安全呼び出し（`?.`）を使用することを忘れないでください。
>
{style="tip"}

```kotlin
fun main() {
//sampleStart
    val str = "Hello"
    val caps = str.takeIf { it.isNotEmpty() }?.uppercase()
   //val caps = str.takeIf { it.isNotEmpty() }.uppercase() //コンパイルエラー
    println(caps)
//sampleEnd
}
```
{kotlin-runnable="true"}

`takeIf` と `takeUnless` は、スコープ関数と組み合わせると特に役立ちます。例えば、`takeIf` や `takeUnless` を `let` とチェーンすることで、指定された述語に一致するオブジェクトに対してのみコードブロックを実行できます。これを行うには、オブジェクトで `takeIf` を呼び出し、次に安全呼び出し（`?.`）を使って `let` を呼び出します。述語に一致しないオブジェクトの場合、`takeIf` は `null` を返し、`let` は呼び出されません。

```kotlin
fun main() {
//sampleStart
    fun displaySubstringPosition(input: String, sub: String) {
        input.indexOf(sub).takeIf { it >= 0 }?.let {
            println("The substring $sub is found in $input.")
            println("Its start position is $it.")
        }
    }

    displaySubstringPosition("010000011", "11")
    displaySubstringPosition("010000011", "12")
//sampleEnd
}
```
{kotlin-runnable="true"}

比較のために、`takeIf` やスコープ関数を使用せずに同じ関数を書いた場合の例を以下に示します。

```kotlin
fun main() {
//sampleStart
    fun displaySubstringPosition(input: String, sub: String) {
        val index = input.indexOf(sub)
        if (index >= 0) {
            println("The substring $sub is found in $input.")
            println("Its start position is $index.")
        }
    }

    displaySubstringPosition("010000011", "11")
    displaySubstringPosition("010000011", "12")
//sampleEnd
}
```
{kotlin-runnable="true"}