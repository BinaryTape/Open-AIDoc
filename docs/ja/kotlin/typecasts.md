[//]: # (title: 型チェックとキャスト)

Kotlinでは、実行時に型に関して2つの操作を行うことができます。オブジェクトが特定の型であるかをチェックすること、または別の型に変換することです。
型**チェック**（check）は扱っているオブジェクトの種類を確認するのに役立ち、型**キャスト**（cast）はオブジェクトを別の型に変換しようと試みます。

> 例えば `List<T>` や `Map<K,V>` などの**ジェネリクス**の型チェックとキャストについて具体的に学ぶには、[Generics type checks and casts](generics.md#generics-type-checks-and-casts) を参照してください。
>
{style="tip"}

## `is` および `!is` 演算子によるチェック {id="is-and-is-operators"}

実行時にオブジェクトがある型と一致するかどうかをチェックするには、`is` 演算子（またはその否定の `!is`）を使用します。

```kotlin
fun main() {
    val input: Any = "Hello, Kotlin"

    if (input is String) {
        println("Message length: ${input.length}")
        // Message length: 13
    }

    if (input !is String) { // !(input is String) と同等
        println("Input is not a valid message")
    } else {
        println("Processing message: ${input.length} characters")
        // Processing message: 13 characters
    }
}
```
{kotlin-runnable="true" id="kotlin-typecasts-is-operator"}

オブジェクトがサブタイプと一致するかどうかをチェックするために、`is` および `!is` 演算子を使用することもできます。

```kotlin
interface Animal {
    val name: String
    fun speak()
}

class Dog(override val name: String) : Animal {
    override fun speak() = println("$name says: Woof!")
}

class Cat(override val name: String) : Animal {
    override fun speak() = println("$name says: Meow!")
}
//sampleStart
fun handleAnimal(animal: Animal) {
    println("Handling animal: ${animal.name}")
    animal.speak()
    
    // サブタイプをチェックするために is 演算子を使用
    if (animal is Dog) {
        println("Special care instructions: This is a dog.")
    } else if (animal is Cat) {
        println("Special care instructions: This is a cat.")
    }
}
//sampleEnd
fun main() {
    val pets: List<Animal> = listOf(
        Dog("Buddy"),
        Cat("Whiskers"),
        Dog("Rex")
    )

    for (pet in pets) {
        handleAnimal(pet)
        println("---")
    }
    // Handling animal: Buddy
    // Buddy says: Woof!
    // Special care instructions: This is a dog.
    // ---
    // Handling animal: Whiskers
    // Whiskers says: Meow!
    // Special care instructions: This is a cat.
    // ---
    // Handling animal: Rex
    // Rex says: Woof!
    // Special care instructions: This is a dog.
    // ---
}
```
{kotlin-runnable="true" id="kotlin-typecasts-is-operator-subtype"}

この例では、`is` 演算子を使用して `Animal` クラスのインスタンスがサブタイプ `Dog` または `Cat` であるかをチェックし、該当する世話の指示を出力しています。

オブジェクトがその宣言された型のスーパータイプであるかをチェックすることもできますが、結果は常に true となるため意味がありません。すべてのクラスインスタンスは、すでにそのスーパータイプのインスタンスです。

> 実行時にオブジェクトの型を特定する方法については、[Reflection](reflection.md) を参照してください。
> 
{type="tip"}

## 型キャスト {id="type-casts"}

Kotlinでオブジェクトの型を別の型に変換することを**キャスト**（casting）と呼びます。

場合によっては、コンパイラが自動的にオブジェクトをキャストしてくれることがあります。これはスマートキャスト（smart-casting）と呼ばれます。

明示的に型をキャストする必要がある場合は、`as?` または `as` [キャスト演算子](#unsafe-cast-operator) を使用します。

## スマートキャスト {id="smart-casts"}

コンパイラは、不変な値に対する型チェックと[明示的なキャスト](#unsafe-cast-operator)を追跡し、暗黙的な（安全な）キャストを自動的に挿入します。

```kotlin
fun logMessage(data: Any) {
    // data は自動的に String にキャストされる
    if (data is String) {
        println("Received text: ${data.length} characters")
    }
}

fun main() {
    logMessage("Server started")
    // Received text: 14 characters
    logMessage(404)
}
```
{kotlin-runnable="true" id="kotlin-typecasts-smartcast"}

コンパイラは十分にスマートであるため、否定チェックによって return される場合でもキャストが安全であることを認識します。

```kotlin
fun logMessage(data: Any) {
    // data は自動的に String にキャストされる
    if (data !is String) return

    println("Received text: ${data.length} characters")
}

fun main() {
    logMessage("User signed in")
    // Received text: 14 characters
    logMessage(true)
}
```
{kotlin-runnable="true" id="kotlin-typecasts-smartcast-negative"}

### 制御フロー {id="control-flow"}

スマートキャストは、`if` 条件式だけでなく、[`when` 式](control-flow.md#when-expressions-and-statements)でも機能します。

```kotlin
fun processInput(data: Any) {
    when (data) {
        // data は自動的に Int にキャストされる
        is Int -> println("Log: Assigned new ID ${data + 1}")
        // data は自動的に String にキャストされる
        is String -> println("Log: Received message \"$data\"")
        // data は自動的に IntArray にキャストされる
        is IntArray -> println("Log: Processed scores, total = ${data.sum()}")
    }
}

fun main() {
    processInput(1001)
    // Log: Assigned new ID 1002
    processInput("System rebooted")
    // Log: Received message "System rebooted"
    processInput(intArrayOf(10, 20, 30))
    // Log: Processed scores, total = 60
}
```
{kotlin-runnable="true" id="kotlin-typecasts-smartcast-when"}

また、[`while` ループ](control-flow.md#while-loops)でも機能します。

```kotlin
sealed interface Status
data class Ok(val currentRoom: String) : Status
data object Error : Status

class RobotVacuum(val rooms: List<String>) {
    var index = 0

    fun status(): Status =
        if (index < rooms.size) Ok(rooms[index])
        else Error

    fun clean(): Status {
        println("Finished cleaning ${rooms[index]}")
        index++
        return status()
    }
}

fun main() {
    //sampleStart
    val robo = RobotVacuum(listOf("Living Room", "Kitchen", "Hallway"))

    var status: Status = robo.status()
    while (status is Ok) {
        // コンパイラは status を Ok 型にスマートキャストするため、
        // currentRoom プロパティにアクセスできる。
        println("Cleaning ${status.currentRoom}...")
        status = robo.clean()
    }
    // Cleaning Living Room...
    // Finished cleaning Living Room
    // Cleaning Kitchen...
    // Finished cleaning Kitchen
    // Cleaning Hallway...
    // Finished cleaning Hallway
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-typecasts-smartcast-while"}

この例では、sealed インターフェース `Status` に2つの実装があります。データクラス `Ok` とデータオブジェクト `Error` です。`currentRoom` プロパティを持っているのは `Ok` データクラスのみです。`while` ループの条件が true と評価されると、コンパイラは `status` 変数を `Ok` 型にスマートキャストし、ループ本体内で `currentRoom` プロパティへのアクセスを可能にします。

`if`、`when`、または `while` の条件で使用する前に `Boolean` 型の変数を宣言した場合、コンパイラがその変数について収集した情報は、スマートキャストのために対応するブロック内でアクセス可能です。

これは、boolean 条件を変数に抽出したい場合などに役立ちます。変数に意味のある名前を付けることで、コードの可読性が向上し、後でコード内でその変数を再利用できるようになります。例えば:

```kotlin
class Cat {
    fun purr() {
        println("Purr purr")
    }
}
//sampleStart
fun petAnimal(animal: Any) {
    val isCat = animal is Cat
    if (isCat) {
        // コンパイラは isCat に関する情報にアクセスできるため、
        // animal が Cat 型にスマートキャストされたことを認識する。
        // したがって、purr() 関数を呼び出すことができる。
        animal.purr()
    }
}

fun main(){
    val kitty = Cat()
    petAnimal(kitty)
    // Purr purr
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" id="kotlin-smart-casts-local-variables" validate="false"}

### 論理演算子 {id="logical-operators"}

左辺に型チェック（通常のチェックまたは否定チェック）がある場合、コンパイラは `&&` または `||` 演算子の右辺でスマートキャストを実行できます。

```kotlin
// `||` の右辺で x は自動的に String にキャストされる
if (x !is String || x.length == 0) return

// `&&` の右辺で x は自動的に String にキャストされる
if (x is String && x.length > 0) {
    print(x.length) // x は自動的に String にキャストされる
}
```

オブジェクトの型チェックを `and` 演算子（`&&`）で組み合わせると、コンパイラはそのオブジェクトをチェックされたすべての型に同時にスマートキャストします。詳細は [交差型（Intersection types）](#intersection-types) を参照してください。

オブジェクトの型チェックを `or` 演算子（`||`）で組み合わせると、それらの最も近い共通のスーパータイプにスマートキャストされます。

```kotlin
interface Status {
    fun signal() {}
}

interface Ok : Status
interface Postponed : Status
interface Declined : Status

fun signalCheck(signalStatus: Any) {
    if (signalStatus is Postponed || signalStatus is Declined) {
        // signalStatus は共通のスーパータイプ Status にスマートキャストされる
        signalStatus.signal()
    }
}
```

> 共通のスーパータイプは、[共用体型（union type）](https://en.wikipedia.org/wiki/Union_type)の**近似**です。共用体型は[現在のところKotlinではサポートされていません](https://youtrack.jetbrains.com/issue/KT-13108/Denotable-union-and-intersection-types)。
>
{style="note"}

### 交差型（Intersection types） {id="intersection-types"}

コンパイラが複数の `&&` チェックを通じてオブジェクトをスマートキャストするとき、[*交差型（intersection type）*](https://kotlinlang.org/spec/type-system.html#intersection-types) を推論します。これは、チェックされたすべての制約を同時に満たす内部的な型です。

```kotlin
interface Bird {
    fun fly()
}

interface Fish {
    fun swim()
}

fun describe(animal: Any) {
    // Bird 型かつ Fish 型と推論される
    if (animal is Bird && animal is Fish) {
        // 追加のチェックやキャストなしで fly() と swim() にアクセスできる
        animal.fly()
        animal.swim()
    }
}
```

交差型は表記不可能（non-denotable）です。型チェック中に型情報を保持するためにコンパイラの内部型システムにのみ存在します。Kotlinコード内で直接記述することはできません。コンパイラのエラーメッセージやIDEのツールチップで、通常 `A & B` のように表示される交差型を見かけることがあるかもしれません。
唯一の例外は、[明確に null 非許容な型（definitely non-nullable type）](generics.md#definitely-non-nullable-types) を宣言する `T & Any` です。この構文は、型パラメータと `Any` を結合するために特別に予約されています。

```kotlin
fun  <T> T.assertNotNull(): T & Any = this ?: throw IllegalStateException("null value")
```

### インライン関数 {id="inline-functions"}

コンパイラは、[インライン関数](inline-functions.md)に渡されたラムダ関数内でキャプチャされた変数をスマートキャストできます。

インライン関数は、暗黙的な [`callsInPlace`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.contracts/-contract-builder/calls-in-place.html) コントラクトを持つものとして扱われます。これは、インライン関数に渡されたラムダ関数がその場で（in place）呼び出されることを意味します。ラムダ関数がその場で呼び出されるため、コンパイラはラムダ関数がその関数本体内に含まれる変数への参照をリークできないことを認識します。

コンパイラはこの知識と他の静的解析を組み合わせて、キャプチャされた変数をスマートキャストしても安全かどうかを判断します。例えば:

```kotlin
interface Processor {
    fun process()
}

inline fun inlineAction(f: () -> Unit) = f()

fun nextProcessor(): Processor? = null

fun runProcessor(): Processor? {
    var processor: Processor? = null
    inlineAction {
        // コンパイラは processor がローカル変数であり、inlineAction() が
        // インライン関数であることを認識しているため、processor への参照がリークすることはない。
        // したがって、processor をスマートキャストしても安全である。
      
        // processor が null でない場合、processor はスマートキャストされる
        if (processor != null) {
            // コンパイラは processor が null でないことを認識しているため、
            // 安全呼び出し（safe call）は不要
            processor.process()
        }

        processor = nextProcessor()
    }

    return processor
}
```

### 例外処理 {id="exception-handling"}

スマートキャストの情報は `catch` および `finally` ブロックにも引き継がれます。これにより、コンパイラがオブジェクトが null 許容型であるかどうかを追跡するため、コードがより安全になります。例えば:

```kotlin
//sampleStart
fun testString() {
    var stringInput: String? = null
    // stringInput は String 型にスマートキャストされる
    stringInput = ""
    try {
        // コンパイラは stringInput が null でないことを認識している
        println(stringInput.length)
        // 0

        // コンパイラは stringInput の以前のスマートキャスト情報を破棄する。
        // ここで stringInput は String? 型になる。
        stringInput = null

        // 例外を発生させる
        if (2 > 1) throw Exception()
        stringInput = ""
    } catch (exception: Exception) {
        // コンパイラは stringInput が null になり得ることを認識しているため、
        // stringInput は null 許容型のままとなる。
        println(stringInput?.length)
        // null
    }
}
//sampleEnd
fun main() {
    testString()
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" id="kotlin-smart-casts-exception-handling"}

### スマートキャストの前提条件 {id="smart-cast-prerequisites"}

スマートキャストは、チェックから使用までの間に変数が変更されないことをコンパイラが保証できる場合にのみ機能します。以下の条件で使用できます。

<table style="none">
    <tr>
        <td>
            <code>val</code> ローカル変数
        </td>
        <td>
            常に可能（<a href="delegated-properties.md">ローカル委譲プロパティ</a>を除く）。
        </td>
    </tr>
    <tr>
        <td>
            <code>val</code> プロパティ
        </td>
        <td>
            プロパティが <code>private</code>、<code>internal</code> である場合、またはプロパティが宣言されているのと同じ<a href="visibility-modifiers.md#modules">モジュール</a>内でチェックが実行される場合。<code>open</code> プロパティやカスタムゲッターを持つプロパティにはスマートキャストを使用できません。
        </td>
    </tr>
    <tr>
        <td>
            <code>var</code> ローカル変数
        </td>
        <td>
            チェックから使用までの間に変数が変更されておらず、変数を変更するラムダ内でキャプチャされておらず、ローカル委譲プロパティではない場合。
        </td>
    </tr>
    <tr>
        <td>
            <code>var</code> プロパティ
        </td>
        <td>
            不可（他のコードによっていつでも変数が変更される可能性があるため）。
        </td>
    </tr>
</table>

## `as` および `as?` キャスト演算子 {id="unsafe-cast-operator"}

Kotlinには、`as` と `as?` という2つのキャスト演算子があります。どちらもキャストに使用できますが、振る舞いが異なります。

`as` 演算子によるキャストが失敗すると、実行時に `ClassCastException` がスローされます。そのため、**安全でない（unsafe）**演算子とも呼ばれます。`as` は、null 非許容型にキャストする場合に使用できます。

```kotlin
fun main() {
    val rawInput: Any = "user-1234"

    // String へのキャストに成功
    val userId = rawInput as String
    println("Logging in user with ID: $userId")
    // Logging in user with ID: user-1234

    // ClassCastException が発生
    val wrongCast = rawInput as Int
    println("wrongCast contains: $wrongCast")
    // Exception in thread "main" java.lang.ClassCastException
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" id="kotlin-unsafe-cast-operator" validate="false"}

代わりに `as?` 演算子を使用した場合、キャストが失敗すると演算子は `null` を返します。そのため、**安全な（safe）**演算子とも呼ばれます。

```kotlin
fun main() {
    val rawInput: Any = "user-1234"

    // String へのキャストに成功
    val userId = rawInput as? String
    println("Logging in user with ID: $userId")
    // Logging in user with ID: user-1234

    // wrongCast に null 値が代入される
    val wrongCast = rawInput as? Int
    println("wrongCast contains: $wrongCast")
    // wrongCast contains: null
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" id="kotlin-safe-cast-operator"}

null 許容型を安全にキャストするには、キャストが失敗したときに `ClassCastException` が発生するのを防ぐために `as?` 演算子を使用します。

null 許容型に対して `as` を使用することも*可能*です。これにより結果を `null` にすることはできますが、キャストが失敗した場合には依然として `ClassCastException` がスローされます。このため、`as?` の方がより安全な選択肢です。

```kotlin
fun main() {
    val config: Map<String, Any?> = mapOf(
        "username" to "kodee",
        "alias" to null,
        "loginAttempts" to 3
    )

    // null 許容 String に安全でなくキャスト
    val username: String? = config["username"] as String?
    println("Username: $username")
    // Username: kodee

    // null 値を null 許容 String に安全でなくキャスト
    val alias: String? = config["alias"] as String?
    println("Alias: $alias")
    // Alias: null

    // null 許容 String へのキャストに失敗し、ClassCastException をスロー
    // val unsafeAttempts: String? = config["loginAttempts"] as String?
    // println("Login attempts (unsafe): $unsafeAttempts")
    // Exception in thread "main" java.lang.ClassCastException

    // null 許容 String へのキャストに失敗し、null を返す
    val safeAttempts: String? = config["loginAttempts"] as? String
    println("Login attempts (safe): $safeAttempts")
    // Login attempts (safe): null
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" id="kotlin-cast-nullable-types"}

### アップキャストとダウンキャスト {id="up-and-downcasting"}

Kotlinでは、オブジェクトをスーパータイプやサブタイプにキャストできます。

オブジェクトをそのスーパークラスのインスタンスにキャストすることを**アップキャスト**（upcasting）と呼びます。アップキャストには特別な構文やキャスト演算子は必要ありません。例えば:

```kotlin
interface Animal {
    fun makeSound()
}

class Dog : Animal {
    // makeSound() の振る舞いを実装
    override fun makeSound() {
        println("Dog says woof!")
    }
}

fun printAnimalInfo(animal: Animal) {
    animal.makeSound()
}

fun main() {
    val dog = Dog()
    // Dog インスタンスを Animal にアップキャスト
    printAnimalInfo(dog)  
    // Dog says woof!
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" id="kotlin-upcast"}

この例では、`printAnimalInfo()` 関数が `Dog` インスタンスとともに呼び出されると、期待されるパラメータ型であるため、コンパイラはそれを `Animal` にアップキャストします。実際のオブジェクトは依然として `Dog` インスタンスであるため、コンパイラは `Dog` クラスの `makeSound()` 関数を動的に解決し、`"Dog says woof!"` を出力します。

振る舞いが抽象型に依存するKotlin APIでは、明示的なアップキャストをよく見かけます。また、すべてのUI要素をスーパータイプとして扱い、後で特定のサブクラスを操作するJetpack ComposeやUIツールキットでも一般的です。

```kotlin
    val textView = TextView(this)
    textView.text = "Hello, View!"

    // TextView から View へのアップキャスト
    val view: View = textView  

    // View の関数を使用
    view.setPadding(20, 20, 20, 20)
    // Activity は View 型を期待する
    setContentView(view)
```

オブジェクトをサブクラスのインスタンスにキャストすることを**ダウンキャスト**（downcasting）と呼びます。ダウンキャストは安全でない可能性があるため、明示的なキャスト演算子を使用する必要があります。キャスト失敗時の例外スローを回避するため、キャストが失敗したときに `null` を返す安全なキャスト演算子 `as?` を使用することをお勧めします。

```kotlin
interface Animal {
    fun makeSound()
}

class Dog : Animal {
    override fun makeSound() {
        println("Dog says woof!")
    }

    fun bark() {
        println("BARK!")
    }
}

fun main() {
    // Animal 型として Dog インスタンスを作成
    val animal: Animal = Dog()
    
    // animal を Dog 型に安全にダウンキャスト
    val dog: Dog? = animal as? Dog

    // dog が null でない場合に bark() を呼び出すために安全呼び出しを使用
    dog?.bark()
    // "BARK!"
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" id="kotlin-downcast"}

この例では、`animal` は `Animal` 型として宣言されていますが、`Dog` インスタンスを保持しています。コードは `animal` を `Dog` 型に安全にキャストし、[安全呼び出し](null-safety.md#safe-call-operator)（`?.`）を使用して `bark()` 関数にアクセスしています。

シリアライゼーションにおいて基底クラスを特定のサブタイプにデシリアライズする際などに、ダウンキャストを使用します。また、スーパータイプのオブジェクトを返すJavaライブラリを扱う際にも一般的であり、Kotlin側でダウンキャストが必要になる場合があります。