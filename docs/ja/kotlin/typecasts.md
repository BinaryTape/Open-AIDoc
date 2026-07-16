[//]: # (title: 型チェックとキャスト)

Kotlinでは、実行時に型に関して2つのことができます。オブジェクトが特定の型であるかどうかの確認、またはオブジェクトを別の型に変換することです。
型**チェック**は、扱っているオブジェクトの種類を確認するのに役立ち、型**キャスト**はオブジェクトを別の型に変換しようとします。

> ジェネリクスの型チェックとキャスト（例えば `List<T>`、`Map<K,V>` など）について具体的に学ぶには、[ジェネリクスの型チェックとキャスト](generics.md#generics-type-checks-and-casts)を参照してください。
>
{style="tip"}

## `is` および `!is` 演算子によるチェック {id="is-and-is-operators"}

実行時にオブジェクトが特定の型に一致するかどうかを確認するには、`is` 演算子（またはその否定である `!is`）を使用します。

```kotlin
fun main() {
    val input: Any = "Hello, Kotlin"

    if (input is String) {
        println("Message length: ${input.length}")
        // Message length: 13
    }

    if (input !is String) { // !(input is String) と同じ
        println("Input is not a valid message")
    } else {
        println("Processing message: ${input.length} characters")
        // Processing message: 13 characters
    }
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-typecasts-is-operator"}

また、`is` および `!is` 演算子を使用して、オブジェクトがサブタイプに一致するかどうかを確認することもできます。

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
    
    // is 演算子を使用してサブタイプを確認する
    if (animal is Dog) {
        println("Special care instructions: This is a dog.")
    } else if (animal is Cat) {
        println("Special care instructions: This is a cat.")
    }
}
//sampleEnd
fun main() {
    val pets: `List<Animal>` = listOf(
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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-typecasts-is-operator-subtype"}

この例では、`is` 演算子を使用して `Animal` クラスのインスタンスがサブタイプの `Dog` または `Cat` であるかを確認し、関連する世話の指示を出力しています。

オブジェクトがその宣言された型のスーパータイプであるかどうかを確認することもできますが、その結果は常に真（true）になるため、あまり意味はありません。すべてのクラスインスタンスは、すでにそのスーパータイプのインスタンスでもあります。

> 実行時にオブジェクトの型を特定する方法については、[リフレクション](reflection.md)を参照してください。
> 
{type="tip"}

## 型キャスト

Kotlinでオブジェクトの型を別の型に変換することを**キャスト（casting）**と呼びます。

場合によっては、コンパイラが自動的にオブジェクトをキャストしてくれることがあります。これをスマートキャスト（smart-casting）と呼びます。

明示的に型をキャストする必要がある場合は、`as?` または `as` [キャスト演算子](#unsafe-cast-operator)を使用します。

## スマートキャスト

コンパイラは、不変（immutable）な値に対する型チェックと[明示的なキャスト](#unsafe-cast-operator)を追跡し、必要に応じて暗黙的な（安全な）キャストを自動的に挿入します。

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-typecasts-smartcast"}

コンパイラは非常にスマートで、否定的なチェックの後に `return` が続く場合など、キャストが安全であることを認識できます。

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-typecasts-smartcast-negative"}

### 制御フロー

スマートキャストは `if` 条件式だけでなく、[`when` 式](control-flow.md#when-expressions-and-statements)でも機能します。

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-typecasts-smartcast-when"}

さらに、[`while` ループ](control-flow.md#while-loops)でも機能します。

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
        // コンパイラが status を OK 型にスマートキャストするため、
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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-typecasts-smartcast-while"}

この例では、シールドインターフェース `Status` には2つの実装があります。データクラス `Ok` とデータオブジェクト `Error` です。`Ok` データクラスのみが `currentRoom` プロパティを持っています。`while` ループの条件が真と評価されると、コンパイラは `status` 変数を `Ok` 型にスマートキャストし、ループ内で `currentRoom` プロパティにアクセスできるようにします。

`if`、`when`、または `while` の条件で使用する前に `Boolean` 型の変数を宣言した場合、その変数についてコンパイラが収集した情報は、対応するブロック内でのスマートキャストに利用可能です。

これは、ブール条件を変数に抽出したい場合などに便利です。変数に意味のある名前を付けることで、コードの可読性が向上し、後でその変数を再利用できるようになります。例えば：

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
        // そのため、purr() 関数を呼び出すことができる。
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

### 論理演算子

`&&` または `||` 演算子の左側で型チェック（通常または否定）が行われている場合、コンパイラはその演算子の右側でもスマートキャストを実行できます。

```kotlin
// x は `||` 演算子の右側で自動的に String にキャストされる
if (x !is String || x.length == 0) return

// x は `&&` 演算子の右側で自動的に String にキャストされる
if (x is String && x.length > 0) {
    print(x.length) // x は自動的に String にキャストされる
}
```

オブジェクトの型チェックを `or` 演算子 (`||`) で組み合わせる場合、それらの最も近い共通のスーパータイプにスマートキャストされます。

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

> 共通のスーパータイプは、[Union type（共用体型）](https://en.wikipedia.org/wiki/Union_type)の**近似**です。Union type は[現在 Kotlin ではサポートされていません](https://youtrack.jetbrains.com/issue/KT-13108/Denotable-union-and-intersection-types)。
>
{style="note"}

### インライン関数

コンパイラは、[インライン関数](inline-functions.md)に渡されるラムダ関数内でキャプチャされた変数をスマートキャストできます。

インライン関数は、暗黙的な [`callsInPlace`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.contracts/-contract-builder/calls-in-place.html) コントラクトを持つものとして扱われます。これは、インライン関数に渡されたラムダ関数がその場で呼び出されることを意味します。ラムダ関数がその場で呼び出されるため、コンパイラはラムダ関数がその関数本体に含まれる変数への参照を外部に漏洩させないことを認識しています。

コンパイラはこの知識と他の分析を組み合わせて、キャプチャされた変数のいずれかをスマートキャストしても安全かどうかを判断します。例えば：

```kotlin
interface Processor {
    fun process()
}

inline fun inlineAction(f: () -> Unit) = f()

fun nextProcessor(): Processor? = null

fun runProcessor(): Processor? {
    var processor: Processor? = null
    inlineAction {
        // コンパイラは processor がローカル変数であり、inlineAction() 
        // がインライン関数であることを認識しているため、processor への
        // 参照が漏洩することはない。
        // したがって、processor をスマートキャストしても安全である。
      
        // processor が null でない場合、processor はスマートキャストされる
        if (processor != null) {
            // コンパイラは processor が null でないことを認識しているため、
            // セーフコールは不要
            processor.process()
        }

        processor = nextProcessor()
    }

    return processor
}
```

### 例外処理

スマートキャストの情報は `catch` および `finally` ブロックに引き継がれます。これにより、コンパイラがオブジェクトが null 許容型であるかどうかを追跡するため、コードがより安全になります。例えば：

```kotlin
//sampleStart
fun testString() {
    var stringInput: String? = null
    // stringInput は String 型にスマートキャストされる
    stringInput = ""
    try {
        // コンパイラは stringInput が null ではないことを認識している
        println(stringInput.length)
        // 0

        // コンパイラは stringInput に関する以前のスマートキャスト情報を破棄する。
        // 現在、stringInput は String? 型を持つ。
        stringInput = null

        // 例外を発生させる
        if (2 > 1) throw Exception()
        stringInput = ""
    } catch (exception: Exception) {
        // コンパイラは stringInput が null になる可能性があることを認識しているため、
        // stringInput は null 許容のままとなる。
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

### スマートキャストの前提条件

スマートキャストは、チェックとその使用の間に変数が変化しないことをコンパイラが保証できる場合にのみ機能します。具体的には、以下の条件下で使用できます。

<table style="none">
    <tr>
        <td>
            <code>val</code> ローカル変数
        </td>
        <td>
            <a href="delegated-properties.md">ローカル委譲プロパティ</a>を除き、常に。
        </td>
    </tr>
    <tr>
        <td>
            <code>val</code> プロパティ
        </td>
        <td>
            プロパティが <code>private</code> または <code>internal</code> である場合、またはチェックがプロパティが宣言されているのと同じ<a href="visibility-modifiers.md#modules">モジュール</a>内で行われる場合。<code>open</code> プロパティやカスタムゲッターを持つプロパティではスマートキャストを使用できません。
        </td>
    </tr>
    <tr>
        <td>
            <code>var</code> ローカル変数
        </td>
        <td>
            変数がチェックから使用までの間に変更されず、変更を行うラムダにキャプチャされておらず、かつローカル委譲プロパティではない場合。
        </td>
    </tr>
    <tr>
        <td>
            <code>var</code> プロパティ
        </td>
        <td>
            変数は他のコードによっていつでも変更される可能性があるため、決して行われません。
        </td>
    </tr>
</table>

## `as` および `as?` キャスト演算子 {id="unsafe-cast-operator"}

Kotlinには `as` と `as?` の2つのキャスト演算子があります。どちらもキャストに使用できますが、動作が異なります。

`as` 演算子を使用してキャストに失敗した場合、実行時に `ClassCastException` がスローされます。そのため、これは**安全ではない（unsafe）**演算子とも呼ばれます。
null 非許容型にキャストする場合は `as` を使用できます。

```kotlin
fun main() {
    val rawInput: Any = "user-1234"

    // String へのキャストに成功
    val userId = rawInput as String
    println("Logging in user with ID: $userId")
    // Logging in user with ID: user-1234

    // ClassCastException を発生させる
    val wrongCast = rawInput as Int
    println("wrongCast contains: $wrongCast")
    // Exception in thread "main" java.lang.ClassCastException
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" id="kotlin-unsafe-cast-operator" validate="false"}

代わりに `as?` 演算子を使用し、キャストに失敗した場合は、演算子は `null` を返します。そのため、これは**安全な（safe）**演算子とも呼ばれます。

```kotlin
fun main() {
    val rawInput: Any = "user-1234"

    // String へのキャストに成功
    val userId = rawInput as? String
    println("Logging in user with ID: $userId")
    // Logging in user with ID: user-1234

    // wrongCast に null 値を代入する
    val wrongCast = rawInput as? Int
    println("wrongCast contains: $wrongCast")
    // wrongCast contains: null
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" id="kotlin-safe-cast-operator"}

null 許容型を安全にキャストするには、`as?` 演算子を使用して、キャストに失敗した場合に `ClassCastException` が発生するのを防ぎます。

null 許容型に対して `as` を使用することも*可能*です。これにより結果が `null` になることが許容されますが、キャストに失敗した場合はやはり `ClassCastException` がスローされます。このため、`as?` の方が安全な選択肢です。

```kotlin
fun main() {
    val config: Map<String, Any?> = mapOf(
        "username" to "kodee",
        "alias" to null,
        "loginAttempts" to 3
    )

    // null 許容の String に安全でないキャストを行う
    val username: String? = config["username"] as String?
    println("Username: $username")
    // Username: kodee

    // null 値を null 許容の String に安全でないキャストを行う
    val alias: String? = config["alias"] as String?
    println("Alias: $alias")
    // Alias: null

    // null 許容の String へのキャストに失敗し、ClassCastException をスローする
    // val unsafeAttempts: String? = config["loginAttempts"] as String?
    // println("Login attempts (unsafe): $unsafeAttempts")
    // Exception in thread "main" java.lang.ClassCastException

    // null 許容の String へのキャストに失敗し、null を返す
    val safeAttempts: String? = config["loginAttempts"] as? String
    println("Login attempts (safe): $safeAttempts")
    // Login attempts (safe): null
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" id="kotlin-cast-nullable-types"}

### アップキャストとダウンキャスト

Kotlinでは、オブジェクトをスーパータイプやサブタイプにキャストできます。

オブジェクトをそのスーパークラスのインスタンスにキャストすることを**アップキャスト（upcasting）**と呼びます。アップキャストには、特別な構文やキャスト演算子は必要ありません。例えば：

```kotlin
interface Animal {
    fun makeSound()
}

class Dog : Animal {
    // makeSound() の動作を実装
    override fun makeSound() {
        println("Dog says woof!")
    }
}

fun printAnimalInfo(animal: Animal) {
    animal.makeSound()
}

fun main() {
    val dog = Dog()
    // Dog インスタンスを Animal にアップキャストする
    printAnimalInfo(dog)  
    // Dog says woof!
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" id="kotlin-upcast"}

この例では、`Dog` インスタンスを使用して `printAnimalInfo()` 関数が呼び出されると、期待されるパラメータ型が `Animal` であるため、コンパイラはそれをアップキャストします。実際のオブジェクトは依然として `Dog` インスタンスであるため、コンパイラは動的に `Dog` クラスの `makeSound()` 関数を解決し、`"Dog says woof!"` と出力します。

動作が抽象型に依存するような Kotlin API では、明示的なアップキャストをよく目にします。また、Jetpack Compose や UI ツールキットでも一般的で、通常はすべての UI 要素をスーパータイプとして扱い、後で特定のサブクラスを操作します。

```kotlin
    val textView = TextView(this)
    textView.text = "Hello, View!"

    // TextView から View へアップキャスト
    val view: View = textView  

    // View の関数を使用する
    view.setPadding(20, 20, 20, 20)
    // Activity は View 型を期待している
    setContentView(view)
```

オブジェクトをサブクラスのインスタンスにキャストすることを**ダウンキャスト（downcasting）**と呼びます。ダウンキャストは安全ではない可能性があるため、明示的なキャスト演算子を使用する必要があります。キャストに失敗したときに例外がスローされるのを避けるため、キャストに失敗した場合に `null` を返す安全なキャスト演算子 `as?` を使用することをお勧めします。

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
    // animal を Animal 型で Dog インスタンスとして作成
    val animal: Animal = Dog()
    
    // animal を Dog 型に安全にダウンキャスト
    val dog: Dog? = animal as? Dog

    // dog が null でない場合に bark() を呼び出すためにセーフコールを使用
    dog?.bark()
    // "BARK!"
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" id="kotlin-downcast"}

この例では、`animal` は `Animal` 型として宣言されていますが、`Dog` インスタンスを保持しています。コードは安全に `animal` を `Dog` 型にキャストし、[セーフコール](null-safety.md#safe-call-operator) (`?.`) を使用して `bark()` 関数にアクセスします。

ダウンキャストは、シリアライズにおいて基本クラスを特定のサブタイプにデシリアライズする場合などに使用されます。また、スーパータイプのオブジェクトを返す Java ライブラリを扱う際にも一般的で、Kotlin 側でダウンキャストが必要になることがあります。