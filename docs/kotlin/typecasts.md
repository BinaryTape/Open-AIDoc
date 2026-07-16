[//]: # (title: 类型检查与转换)

在 Kotlin 中，你可以在运行时对类型执行两项操作：检查一个对象是否为特定类型，或者将其转换为另一种类型。
类型**检查**可帮助你确认正在处理的对象种类，而类型**转换**则尝试将对象转换为另一种类型。

> 要专门了解**泛型**（generics）的类型检查与转换，例如 `List<T>`、`Map<K,V>`，请参阅[泛型的类型检查与转换](generics.md#generics-type-checks-and-casts)。
>
{style="tip"}

## 使用 `is` 与 `!is` 操作符进行检查 {id="is-and-is-operators"}

使用 `is` 操作符（或其否定形式 `!is`）在运行时检查对象是否符合某种类型：

```kotlin
fun main() {
    val input: Any = "Hello, Kotlin"

    if (input is String) {
        println("Message length: ${input.length}")
        // Message length: 13
    }

    if (input !is String) { // 等同于 !(input is String)
        println("Input is not a valid message")
    } else {
        println("Processing message: ${input.length} characters")
        // Processing message: 13 characters
    }
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-typecasts-is-operator"}

你也可以使用 `is` 和 `!is` 操作符来检查对象是否符合某种子类型：

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
    
    // 使用 is 操作符检查子类型
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

本例使用 `is` 操作符检查 `Animal` 类实例是否具有子类型 `Dog` 或 `Cat`，以便打印相关的护理说明。

你可以检查一个对象是否为其声明类型的父类型，但这没有意义，因为结果始终为 true。每个类实例本身就是其父类型的实例。

> 要在运行时识别对象的类型，请参阅[反射](reflection.md)。
> 
{type="tip"}

## 类型转换

在 Kotlin 中将对象的类型转换为另一种类型被称为**转换**（casting）。

在某些情况下，编译器会自动为你转换对象。这被称为智能转换。

如果你需要显式转换类型，请使用 `as?` 或 `as` [转换操作符](#unsafe-cast-operator)。 

## 智能转换

编译器会跟踪不可变值的类型检查和[显式转换](#unsafe-cast-operator)，并自动插入隐式（安全）转换：

```kotlin
fun logMessage(data: Any) {
    // data 被自动转换为 String
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

编译器甚至足够聪明，知道如果负面检查导致了返回，那么转换也是安全的：

```kotlin
fun logMessage(data: Any) {
    // data 被自动转换为 String
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

### 控制流

智能转换不仅适用于 `if` 条件表达式，还适用于 [`when` 表达式](control-flow.md#when-expressions-and-statements)：

```kotlin
fun processInput(data: Any) {
    when (data) {
        // data 被自动转换为 Int
        is Int -> println("Log: Assigned new ID ${data + 1}")
        // data 被自动转换为 String
        is String -> println("Log: Received message \"$data\"")
        // data 被自动转换为 IntArray
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

以及 [`while` 循环](control-flow.md#while-loops)：

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
        // 编译器将 status 智能转换为 OK 类型，
        // 因此 currentRoom 属性是可访问的。
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

在本例中，密封接口 `Status` 有两个实现：数据类 `Ok` 和数据对象 `Error`。只有 `Ok` 数据类具有 `currentRoom` 属性。当 `while` 循环条件的计算结果为 true 时，编译器会将 `status` 变量智能转换为 `Ok` 类型，从而使 `currentRoom` 属性在循环体内可供访问。

如果你在 `if`、`when` 或 `while` 条件中使用 `Boolean` 类型的变量之前对其进行了声明，那么编译器收集到的关于该变量的任何信息都可以在相应的块中用于智能转换。

当你想要将布尔条件提取到变量中时，这会非常有用。这样你就可以给变量起一个有意义的名字，从而提高代码的可读性，并使得在代码后续部分重用该变量成为可能。例如：

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
        // 编译器可以访问有关 isCat 的信息，
        // 因此它知道 animal 已被智能转换为 Cat 类型。
        // 因此，可以调用 purr() 函数。
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

### 逻辑操作符

如果 `&&` 或 `||` 操作符左侧有类型检查（正常或否定），编译器可以在其右侧执行智能转换：

```kotlin
// x 在 `||` 的右侧被自动转换为 String
if (x !is String || x.length == 0) return

// x 在 `&&` 的右侧被自动转换为 String
if (x is String && x.length > 0) {
    print(x.length) // x 被自动转换为 String
}
```

如果你使用 `or` 操作符 (`||`) 组合对象的类型检查，则会智能转换为它们最近的公共父类型：

```kotlin
interface Status {
    fun signal() {}
}

interface Ok : Status
interface Postponed : Status
interface Declined : Status

fun signalCheck(signalStatus: Any) {
    if (signalStatus is Postponed || signalStatus is Declined) {
        // signalStatus 被智能转换为公共父类型 Status
        signalStatus.signal()
    }
}
```

> 公共父类型是 [联合类型](https://en.wikipedia.org/wiki/Union_type) 的一种**近似**。联合类型[目前在 Kotlin 中暂不受支持](https://youtrack.jetbrains.com/issue/KT-13108/Denotable-union-and-intersection-types)。
>
{style="note"}

### 内联函数

对于传递给[内联函数](inline-functions.md)的 lambda 函数中捕获的变量，编译器可以对其进行智能转换。

内联函数被视为具有隐式的 [`callsInPlace`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.contracts/-contract-builder/calls-in-place.html) 契约。这意味着传递给内联函数的任何 lambda 函数都会在原地调用。由于 lambda 函数是在原地调用的，编译器知道 lambda 函数不会泄露对其函数体内包含的任何变量的引用。

编译器利用这一知识结合其他分析，来决定对任何捕获的变量进行智能转换是否安全。例如：

```kotlin
interface Processor {
    fun process()
}

inline fun inlineAction(f: () -> Unit) = f()

fun nextProcessor(): Processor? = null

fun runProcessor(): Processor? {
    var processor: Processor? = null
    inlineAction {
        // 编译器知道 processor 是一个局部变量，且 inlineAction() 是一个内联函数，
        // 因此对 processor 的引用不会被泄露。
        // 因此，对 processor 进行智能转换是安全的。
      
        // 如果 processor 不为 null，则 processor 会被智能转换
        if (processor != null) {
            // 编译器知道 processor 不为 null，因此不需要安全调用
            processor.process()
        }

        processor = nextProcessor()
    }

    return processor
}
```

### 异常处理

智能转换信息会被传递到 `catch` 和 `finally` 块中。由于编译器会跟踪你的对象是否具有可空类型，这使你的代码更加安全。例如：

```kotlin
//sampleStart
fun testString() {
    var stringInput: String? = null
    // stringInput 被智能转换为 String 类型
    stringInput = ""
    try {
        // 编译器知道 stringInput 不为 null
        println(stringInput.length)
        // 0

        // 编译器拒绝 stringInput 之前的智能转换信息。
        // 现在 stringInput 的类型为 String?。
        stringInput = null

        // 触发一个异常
        if (2 > 1) throw Exception()
        stringInput = ""
    } catch (exception: Exception) {
        // 编译器知道 stringInput 可能为 null，
        // 因此 stringInput 保持可空状态。
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

### 智能转换的前提条件

只有当编译器能够保证变量在检查和使用之间不会发生变化时，智能转换才有效。它们可以在以下条件下使用：

<table style="none">
    <tr>
        <td>
            <code>val</code> 局部变量
        </td>
        <td>
            始终可以，但<a href="delegated-properties.md">本地委托属性</a>除外。
        </td>
    </tr>
    <tr>
        <td>
            <code>val</code> 属性
        </td>
        <td>
            如果属性是 <code>private</code>、<code>internal</code>，或者检查是在声明该属性的同一个<a href="visibility-modifiers.md#modules">模块</a>中执行的。智能转换不能用于 <code>open</code> 属性或具有自定义 getter 的属性。
        </td>
    </tr>
    <tr>
        <td>
            <code>var</code> 局部变量
        </td>
        <td>
            如果变量在检查和使用之间未被修改，未在修改它的 lambda 中被捕获，且不是本地委托属性。
        </td>
    </tr>
    <tr>
        <td>
            <code>var</code> 属性
        </td>
        <td>
            从不可以，因为该变量随时可能被其他代码修改。
        </td>
    </tr>
</table>

## `as` 与 `as?` 转换操作符 {id="unsafe-cast-operator"}

Kotlin 有两个转换操作符：`as` 和 `as?`。你可以使用两者进行转换，但它们的行为不同。

如果使用 `as` 操作符转换失败，则会在运行时抛出 `ClassCastException`。这就是为什么它也被称为**不安全**操作符。
在转换为非空类型时，可以使用 `as`：

```kotlin
fun main() {
    val rawInput: Any = "user-1234"

    // 成功转换为 String
    val userId = rawInput as String
    println("Logging in user with ID: $userId")
    // Logging in user with ID: user-1234

    // 触发 ClassCastException
    val wrongCast = rawInput as Int
    println("wrongCast contains: $wrongCast")
    // Exception in thread "main" java.lang.ClassCastException
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" id="kotlin-unsafe-cast-operator" validate="false"}

如果改用 `as?` 操作符，且转换失败，则该操作符会返回 `null`。这就是为什么它也被称为**安全**操作符：

```kotlin
fun main() {
    val rawInput: Any = "user-1234"

    // 成功转换为 String
    val userId = rawInput as? String
    println("Logging in user with ID: $userId")
    // Logging in user with ID: user-1234

    // 向 wrongCast 赋值 null
    val wrongCast = rawInput as? Int
    println("wrongCast contains: $wrongCast")
    // wrongCast contains: null
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" id="kotlin-safe-cast-operator"}

要安全地转换可空类型，请使用 `as?` 操作符，以防止在转换失败时触发 `ClassCastException`。

你*可以*对可空类型使用 `as`。这允许结果为 `null`，但如果转换不成功，它仍然会抛出 `ClassCastException`。出于这个原因，`as?` 是更安全的选择：

```kotlin
fun main() {
    val config: Map<String, Any?> = mapOf(
        "username" to "kodee",
        "alias" to null,
        "loginAttempts" to 3
    )

    // 不安全地转换为可空 String
    val username: String? = config["username"] as String?
    println("Username: $username")
    // Username: kodee

    // 不安全地将 null 值转换为可空 String
    val alias: String? = config["alias"] as String?
    println("Alias: $alias")
    // Alias: null

    // 转换为可空 String 失败并抛出 ClassCastException
    // val unsafeAttempts: String? = config["loginAttempts"] as String?
    // println("Login attempts (unsafe): $unsafeAttempts")
    // Exception in thread "main" java.lang.ClassCastException

    // 转换为可空 String 失败并返回 null
    val safeAttempts: String? = config["loginAttempts"] as? String
    println("Login attempts (safe): $safeAttempts")
    // Login attempts (safe): null
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" id="kotlin-cast-nullable-types"}

### 向上转型与向下转型

在 Kotlin 中，你可以将对象转换为父类型和子类型。 

将对象转换为其超类的实例称为**向上转型**（upcasting）。向上转型不需要任何特殊语法或转换操作符。例如：

```kotlin
interface Animal {
    fun makeSound()
}

class Dog : Animal {
    // 实现 makeSound() 的行为
    override fun makeSound() {
        println("Dog says woof!")
    }
}

fun printAnimalInfo(animal: Animal) {
    animal.makeSound()
}

fun main() {
    val dog = Dog()
    // 将 Dog 实例向上转型为 Animal
    printAnimalInfo(dog)  
    // Dog says woof!
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" id="kotlin-upcast"}

在本例中，当使用 `Dog` 实例调用 `printAnimalInfo()` 函数时，编译器会将其向上转型为 `Animal`，因为那是预期的参数类型。由于实际对象仍然是一个 `Dog` 实例，编译器会动态解析 `Dog` 类中的 `makeSound()` 函数，打印出 `"Dog says woof!"`。

在行为取决于抽象类型的 Kotlin API 中，你经常会看到显式向上转型。这在 Jetpack Compose 和 UI 工具包中也很常见，它们通常将所有 UI 元素视为父类型，随后再对具体的子类进行操作：

```kotlin
    val textView = TextView(this)
    textView.text = "Hello, View!"

    // 从 TextView 向上转型为 View
    val view: View = textView  

    // 使用 View 的函数
    view.setPadding(20, 20, 20, 20)
    // Activity 预期一个 View 类型
    setContentView(view)
```

将对象转换为子类的实例称为**向下转型**（downcasting）。由于向下转型可能是不安全的，你需要使用显式转换操作符。为了避免在转换失败时抛出异常，我们建议使用安全转换操作符 `as?`，以便在转换失败时返回 `null`：

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
    // 创建一个 animal 变量，它是具有 Animal 类型的 Dog 实例
    val animal: Animal = Dog()
    
    // 将 animal 安全向下转型为 Dog 类型
    val dog: Dog? = animal as? Dog

    // 使用安全调用，如果 dog 不为 null 则调用 bark()
    dog?.bark()
    // "BARK!"
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" id="kotlin-downcast"}

在本例中，`animal` 被声明为 `Animal` 类型，但它持有 `Dog` 实例。代码安全地将 `animal` 转换为 `Dog` 类型，并使用[安全调用](null-safety.md#safe-call-operator) (`?.`) 来访问 `bark()` 函数。

你会在序列化中将基类反序列化为特定子类型时使用向下转型。在处理返回父类型对象的 Java 库时，这也非常常见，你可能需要在 Kotlin 中对其进行向下转型。