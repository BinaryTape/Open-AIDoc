[//]: # (title: 作用域函式)

Kotlin 標準函式庫包含數個函式，其唯一目的就是在物件的上下文中執行一個程式碼區塊。當你在物件上呼叫此類函式並提供一個 [Lambda 運算式](lambdas.md)時，它會形成一個暫時的作用域。在這個作用域中，你可以不透過名稱來存取該物件。這類函式稱為「_作用域函式 (Scope functions)_」。共有五個：[`let`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/let.html)、[`run`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/run.html)、[`with`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/with.html)、[`apply`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/apply.html) 以及 [`also`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/also.html)。

基本上，這些函式都執行相同的操作：在物件上執行一段程式碼區塊。不同之處在於此物件在區塊內如何被存取，以及整個運算式的結果是什麼。

以下是使用作用域函式的典型範例：

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

如果不使用 `let` 來撰寫相同邏輯，你必須引入一個新變數，並在每次使用時重複其名稱。

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

作用域函式並沒有引入任何新的技術功能，但它們可以讓你的程式碼更加簡潔且易讀。

由於作用域函式之間有許多相似之處，為你的使用案例選擇合適的函式可能會有些棘手。該選擇主要取決於你的意圖以及在專案中用法的一致性。下方我們詳細說明了各作用域函式之間的差異及其慣例。

## 函式選擇 {id="function-selection"}

為了協助你根據自身目的選擇合適的作用域函式，我們提供了下表以彙整它們之間的主要差異。

| 函式 | 物件參照 | 傳回值 | 是否為擴充函式 |
|---|---|---|---|
| [`let`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/let.html) | `it` | Lambda 結果 | 是 |
| [`run`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/run.html) | `this` | Lambda 結果 | 是 |
| [`run`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/run.html) | - | Lambda 結果 | 否：不帶上下文物件呼叫 |
| [`with`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/with.html) | `this` | Lambda 結果 | 否：將上下文物件作為引數傳入。 |
| [`apply`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/apply.html) | `this` | 上下文物件 | 是 |
| [`also`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/also.html) | `it` | 上下文物件 | 是 |

有關這些函式的詳細資訊在下方的專屬小節中提供。

以下是根據預期目的選擇作用域函式的簡要指南：

* 在非 null 物件上執行 Lambda：`let`
* 在區域作用域中將運算式作為變數引入：`let`
* 物件設定：`apply`
* 物件設定並計算結果：`run`
* 在需要運算式的地方執行陳述式：非擴充的 `run`
* 附加效果：`also`
* 對單一物件的一組函式呼叫進行分組：`with`

不同作用域函式的使用案例互有重疊，因此你可以根據專案或團隊中採用的特定慣例來選擇要使用的函式。

雖然作用域函式可以讓你的程式碼更簡潔，但請避免過度使用：這可能使程式碼難以閱讀並導致錯誤。我們也建議避免巢狀使用作用域函式，並在鏈式呼叫它們時保持謹慎，因為這很容易對當前的上下文物件以及 `this` 或 `it` 的值感到混淆。

## 區別 {id="distinctions"}

由於作用域函式本質上很相似，因此了解它們之間的差異非常重要。
每個作用域函式之間主要有兩個差異：
* 它們參照上下文物件的方式。
* 它們的傳回值。

### 上下文物件：this 或 it {id="context-object-this-or-it"}

在傳遞給作用域函式的 Lambda 內部，可以透過簡短的參照而非其實際名稱來存取上下文物件。每個作用域函式使用以下兩種方式之一來參照上下文物件：作為 Lambda [接收者 (receiver)](lambdas.md#function-literals-with-receiver)（`this`）或作為 Lambda 引數（`it`）。兩者都提供相同的功能，因此我們針對不同使用案例說明各自的優缺點並提供使用建議。

```kotlin
fun main() {
    val str = "Hello"
    // this
    str.run {
        println("The string's length: $length")
        //println("The string's length: ${this.length}") // does the same
    }

    // it
    str.let {
        println("The string's length is ${it.length}")
    }
}
```
{kotlin-runnable="true"}

#### this {id="this"}

`run`、`with` 和 `apply` 將上下文物件作為 Lambda [接收者](lambdas.md#function-literals-with-receiver)（透過關鍵字 `this`）來參照。因此，在它們的 Lambda 中，存取該物件就像在一般的類別函式中一樣。

在大多數情況下，存取接收者物件的成員時可以省略 `this`，使程式碼更簡短。另一方面，如果省略 `this`，可能難以區分接收者成員與外部物件或函式。因此，對於主要透過呼叫物件函式或指派屬性值來操作該物件成員的 Lambda，建議將上下文物件作為接收者（`this`）。

```kotlin
data class Person(var name: String, var age: Int = 0, var city: String = "")

fun main() {
//sampleStart
    val adam = Person("Adam").apply { 
        age = 20                       // same as this.age = 20
        city = "London"
    }
    println(adam)
//sampleEnd
}
```
{kotlin-runnable="true"}

#### it {id="it"}

反之，`let` 和 `also` 將上下文物件作為 Lambda [引數](lambdas.md#lambda-expression-syntax)來參照。如果未指定引數名稱，則透過隱式的預設名稱 `it` 來存取該物件。`it` 比 `this` 更簡短，而且使用 `it` 的運算式通常更容易閱讀。

然而，呼叫物件的函式或屬性時，無法像 `this` 那樣隱式存取該物件。因此，當物件主要作為函式呼叫中的引數時，透過 `it` 存取上下文物件會更好。如果在程式碼區塊中使用了多個變數，`it` 也更加合適。

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

以下範例示範了將上下文物件作為 Lambda 引數進行參照，並指定引數名稱為：`value`。

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

### 傳回值 {id="return-value"}

作用域函式在傳回的結果上有所不同：
* `apply` 和 `also` 傳回上下文物件。
* `let`、`run` 和 `with` 傳回 Lambda 結果。

你應根據程式碼後續要執行的操作，仔細考慮所需的傳回值。這有助於你選擇最合適的作用域函式。

#### 上下文物件 {id="context-object"}

`apply` 和 `also` 的傳回值是上下文物件本身。因此，它們可以作為_附加步驟_包含在呼叫鏈中：你可以繼續在同一個物件上鏈式呼叫函式，一個接一個。

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

它們也可以用於傳回上下文物件的函式的 return 陳述式中。

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

#### Lambda 結果 {id="lambda-result"}

`let`、`run` 和 `with` 傳回 Lambda 結果。因此，當你需要將結果指派給變數、對結果鏈式執行操作等情況時，可以使用它們。

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

此外，你也可以忽略傳回值，並使用作用域函式為區域變數建立暫時的作用域。

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

## 函式 {id="functions"}

為了協助你為自己的使用案例選擇合適的作用域函式，我們將詳細介紹它們並提供使用建議。技術上，作用域函式在許多情況下是可以互換的，因此這些範例展示了使用它們的慣例。

### let {id="let"}

- **上下文物件**作為引數（`it`）可供存取。
- **傳回值**為 Lambda 結果。

[`let`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/let.html) 可用於對呼叫鏈的結果叫用一個或多個函式。例如，以下程式碼印出對集合執行兩項操作的結果：

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

使用 `let`，你可以重寫上述範例，而不需要將清單操作的結果指派給變數：

```kotlin
fun main() {
//sampleStart
    val numbers = mutableListOf("one", "two", "three", "four", "five")
    numbers.map { it.length }.filter { it > 3 }.let { 
        println(it)
        // and more function calls if needed
    } 
//sampleEnd
}
```
{kotlin-runnable="true"}

如果傳遞給 `let` 的程式碼區塊包含以 `it` 作為引數的單一函式，你可以使用方法參照（`::`）來代替 Lambda 引數：

```kotlin
fun main() {
//sampleStart
    val numbers = mutableListOf("one", "two", "three", "four", "five")
    numbers.map { it.length }.filter { it > 3 }.let(::println)
//sampleEnd
}
```
{kotlin-runnable="true"}

`let` 經常被用於執行包含非 null 值的程式碼區塊。若要對可為 null 的物件執行操作，請對其使用[安全呼叫運算子 `?.`](null-safety.md#safe-call-operator)，並在其 Lambda 中呼叫包含操作的 `let`。

```kotlin
fun processNonNullString(str: String) {}

fun main() {
//sampleStart
    val str: String? = "Hello"   
    //processNonNullString(str)       // compilation error: str can be null
    val length = str?.let { 
        println("let() called on $it")        
        processNonNullString(it)      // OK: 'it' is not null inside '?.let { }'
        it.length
    }
//sampleEnd
}
```
{kotlin-runnable="true"}

你也可以使用 `let` 引入具有受限作用域的區域變數，讓你的程式碼更容易閱讀。若要為上下文物件定義新變數，請提供其名稱作為 Lambda 引數，以取代預設的 `it`。

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

- **上下文物件**作為接收者（`this`）可供存取。
- **傳回值**為 Lambda 結果。

由於 [`with`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/with.html) 不是擴充函式：上下文物件是作為引數傳遞，但在 Lambda 內部，它是作為接收者（`this`）提供存取。

當你不需要使用傳回的結果時，我們建議使用 `with` 來呼叫上下文物件上的函式。在程式碼中，`with` 可以理解為「_對於這個物件，執行以下操作。_」

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

你也可以使用 `with` 引入一個輔助物件，其屬性或函式用於計算值。

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

- **上下文物件**作為接收者（`this`）可供存取。
- **傳回值**為 Lambda 結果。

[`run`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/run.html) 的作用與 `with` 相同，但它是實作為擴充函式。因此就像 `let` 一樣，你可以使用點標記法在上下文物件上呼叫它。

當你的 Lambda 同時初始化物件並計算傳回值時，`run` 非常有用。

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
    
    // the same code written with let() function:
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

你也可以將 `run` 作為非擴充函式叫用。非擴充變體的 `run` 沒有上下文物件，但它仍然會傳回 Lambda 結果。非擴充的 `run` 允許你在需要運算式的地方執行包含數個陳述式的程式碼區塊。在程式碼中，非擴充的 `run` 可以理解為「_執行程式碼區塊並計算結果。_」

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

- **上下文物件**作為接收者（`this`）可供存取。
- **傳回值**為物件本身。

由於 [`apply`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/apply.html) 會傳回上下文物件本身，我們建議將其用於不傳回值且主要操作接收者物件成員的程式碼區塊。`apply` 最常見的使用案例是進行物件設定。此類呼叫可以理解為「_對該物件套用以下指派。_」

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

`apply` 的另一個使用案例是在多個呼叫鏈中包含 `apply` 以進行更複雜的處理。

### also {id="also"}

- **上下文物件**作為引數（`it`）可供存取。
- **傳回值**為物件本身。

[`also`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/also.html) 適用於執行將上下文物件作為引數的操作。當需要對物件本身的參照而不是其屬性和函式，或者不想遮蔽外層作用域的 `this` 參照時，請使用 `also`。

當你在程式碼中看到 `also` 時，可以將其理解為「_並且對該物件一併執行以下操作。_」

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

## takeIf 與 takeUnless {id="takeif-and-takeunless"}

除了作用域函式之外，標準函式庫還包含了 [`takeIf`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/take-if.html) 和 [`takeUnless`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/take-unless.html) 函式。這些函式讓你可以將物件狀態的檢查嵌入到呼叫鏈中。

當與斷言 (predicate) 一起在物件上呼叫時，如果符合指定的斷言，`takeIf` 會傳回該物件；否則傳回 `null`。因此，`takeIf` 是針對單一物件的篩選函式。

`takeUnless` 與 `takeIf` 的邏輯相反。當與斷言一起在物件上呼叫時，如果符合指定的斷言，`takeUnless` 會傳回 `null`；否則傳回該物件。

使用 `takeIf` 或 `takeUnless` 時，該物件作為 Lambda 引數（`it`）提供存取。

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

> 在 `takeIf` 和 `takeUnless` 後面鏈式呼叫其他函式時，別忘了執行 null 檢查或使用安全呼叫（`?.`），因為它們的傳回值是可為 null 的。
>
{style="tip"}

```kotlin
fun main() {
//sampleStart
    val str = "Hello"
    val caps = str.takeIf { it.isNotEmpty() }?.uppercase()
   //val caps = str.takeIf { it.isNotEmpty() }.uppercase() //compilation error
    println(caps)
//sampleEnd
}
```
{kotlin-runnable="true"}

`takeIf` 和 `takeUnless` 與作用域函式結合使用時特別有用。例如，你可以將 `takeIf` 和 `takeUnless` 與 `let` 鏈式連接，以在符合指定斷言的物件上執行程式碼區塊。為此，請在物件上呼叫 `takeIf`，然後使用安全呼叫（`?`）呼叫 `let`。對於不符合斷言的物件，`takeIf` 會傳回 `null` 且不會叫用 `let`。

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

作為比較，以下範例展示了在不使用 `takeIf` 或作用域函式的情況下，如何撰寫相同的函式：

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