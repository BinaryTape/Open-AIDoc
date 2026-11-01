[//]: # (title: 类型检查与转换)

在 Kotlin 中，可以在运行时对类型进行两项操作：检查对象是否为特定类型，或者将其转换为另一种类型。
类型**检查**有助于确认正在处理的对象种类，而类型**转换**则尝试将对象转换为另一种类型。

> 要具体了解**泛型**类型检查与转换（例如 `List<T>`、`Map<K,V>`），请参阅[泛型类型检查与转换](generics.md#generics-type-checks-and-casts)。
>
{style="tip"}

## 使用 `is` 与 `!is` 运算符进行检查 {id="is-and-is-operators"}

使用 `is` 运算符（或其否定形式 `!is`）在运行时检查对象是否符合某种类型：

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
{kotlin-runnable="true" id="kotlin-typecasts-is-operator"}

还可以使用 `is` 与 `!is` 运算符来检查对象是否符合某个子类型：

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
    
    // 使用 is 运算符检查子类型
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

该示例使用 `is` 运算符检查 `Animal` 类实例是否属于子类型 `Dog` 或 `Cat`，以输出相应的照料说明。

你可以检查对象是否是其声明类型的超类型，但这没有必要，因为结果始终为 true。每个类实例本身就已经属于其超类型的实例。

> 要在运行时识别对象的类型，请参阅[反射](reflection.md)。
> 
{type="tip"}

## 类型转换 {id="type-casts"}

在 Kotlin 中，将对象的类型转换为另一种类型称为**转换**（casting）。

在某些情况下，编译器会自动为你转换对象。这称为智能转换（smart-casting）。

如果需要显式转换类型，请使用 `as?` 或 `as` [转换运算符](#unsafe-cast-operator)。

## 智能转换 {id="smart-casts"}

编译器会跟踪不可变值的类型检查和[显式转换](#unsafe-cast-operator)，并自动插入隐式（安全）转换：

```kotlin
fun logMessage(data: Any) {
    // data 会自动转换为 String
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

编译器甚至足够智能，如果否定检查会导致返回，它能识别出此时进行转换是安全的：

```kotlin
fun logMessage(data: Any) {
    // data 会自动转换为 String
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

### 控制流 {id="control-flow"}

智能转换不仅适用于 `if` 条件表达式，还适用于 [`when` 表达式](control-flow.md#when-expressions-and-statements)：

```kotlin
fun processInput(data: Any) {
    when (data) {
        // data 会自动转换为 Int
        is Int -> println("Log: Assigned new ID ${data + 1}")
        // data 会自动转换为 String
        is String -> println("Log: Received message \"$data\"")
        // data 会自动转换为 IntArray
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
        // 编译器将 status 智能转换为 Ok 类型，因此 currentRoom
        // 属性可供访问。
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

在此示例中，密封接口 `Status` 有两个实现：数据类 `Ok` 和数据对象 `Error`。只有 `Ok` 数据类具有 `currentRoom` 属性。当 `while` 循环条件求值为 true 时，编译器会将 `status` 变量智能转换为 `Ok` 类型，从而使 `currentRoom` 属性在循环体内可供访问。

如果在将 `Boolean` 类型的变量用于 `if`、`when` 或 `while` 条件之前声明它，编译器收集到的关于该变量的任何信息都可以在相应代码块中用于智能转换。

这在需要将布尔条件提取到变量中等场景下非常有用。随后，你可以为变量指定有意义的名称，从而提高代码的可读性，并使其能在后续代码中复用。例如：

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
        // 因此它知道 animal 已被智能转换
        // 为 Cat 类型。
        // 因此可以调用 purr() 函数。
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

### 逻辑运算符 {id="logical-operators"}

如果 `&&` 或 `||` 运算符的左侧存在类型检查（常规检查或否定检查），编译器可以在其右侧执行智能转换：

```kotlin
// 在 `||` 右侧，x 会自动转换为 String
if (x !is String || x.length == 0) return

// 在 `&&` 右侧，x 会自动转换为 String
if (x is String && x.length > 0) {
    print(x.length) // x 会自动转换为 String
}
```

如果使用“与”运算符（`&&`）组合对对象的类型检查，编译器会将该对象同时智能转换为所有经过检查的类型。在[交叉类型](#intersection-types)中了解详情。

如果使用“或”运算符（`||`）组合对对象的类型检查，则会智能转换为它们最近的公共超类型：

```kotlin
interface Status {
    fun signal() {}
}

interface Ok : Status
interface Postponed : Status
interface Declined : Status

fun signalCheck(signalStatus: Any) {
    if (signalStatus is Postponed || signalStatus is Declined) {
        // signalStatus 智能转换为公共超类型 Status
        signalStatus.signal()
    }
}
```

> 公共超类型是[联合类型](https://en.wikipedia.org/wiki/Union_type)的**近似**表示。Kotlin 当前[不支持联合类型](https://youtrack.jetbrains.com/issue/KT-13108/Denotable-union-and-intersection-types)。
>
{style="note"}

### 交叉类型 {id="intersection-types"}

当编译器通过多个 `&&` 检查对对象进行智能转换时，它会推断出一个[*交叉类型*](https://kotlinlang.org/spec/type-system.html#intersection-types)。这是一种同时满足所有已检查约束的内部类型：

```kotlin
interface Bird {
    fun fly()
}

interface Fish {
    fun swim()
}

fun describe(animal: Any) {
    // 推断出 Bird 和 Fish 类型
    if (animal is Bird && animal is Fish) {
        // 无需额外检查或转换即可访问 fly() 和 swim()
        animal.fly()
        animal.swim()
    }
}
```

交叉类型是不可表示的（non-denotable）。它们仅存在于编译器的内部类型系统中，用于在类型检查期间保留类型信息。你不能在 Kotlin 代码中直接编写它们。你可能会在编译器错误消息和 IDE 工具提示中遇到交叉类型，通常显示为 `A & B`。唯一的例外是用于声明[明确不可为空类型](generics.md#definitely-non-nullable-types)的 `T & Any`。此语法专用于将类型形参与 `Any` 结合。

```kotlin
fun  <T> T.assertNotNull(): T & Any = this ?: throw IllegalStateException("null value")
```

### 内联函数 {id="inline-functions"}

编译器可以对传递给[内联函数](inline-functions.md)的 lambda 函数中捕获的变量进行智能转换。

内联函数被视为具有隐式的 [`callsInPlace`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.contracts/-contract-builder/calls-in-place.html) 契约。这意味着传递给内联函数的任何 lambda 函数都会被就地调用。由于 lambda 函数是就地调用的，编译器知道该 lambda 函数不会泄露其函数体内包含的任何变量的引用。

编译器利用这一特性并结合其他分析，来判定对被捕获的变量进行智能转换是否安全。例如：

```kotlin
interface Processor {
    fun process()
}

inline fun inlineAction(f: () -> Unit) = f()

fun nextProcessor(): Processor? = null

fun runProcessor(): Processor? {
    var processor: Processor? = null
    inlineAction {
        // 编译器知道 processor 是一个局部变量，且 inlineAction() 
        // 是一个内联函数，因此不会泄露对 processor 的引用。
        // 因此，可以安全地对 processor 进行智能转换。
      
        // 如果 processor 不为 null，则对 processor 进行智能转换
        if (processor != null) {
            // 编译器知道 processor 不为 null，因此无需安全调用
            processor.process()
        }

        processor = nextProcessor()
    }

    return processor
}
```

### 异常处理 {id="exception-handling"}

智能转换信息会传递到 `catch` 和 `finally` 块中。这使代码更加安全，因为编译器会跟踪对象是否具有可空类型。例如：

```kotlin
//sampleStart
fun testString() {
    var stringInput: String? = null
    // stringInput 智能转换为 String 类型
    stringInput = ""
    try {
        // 编译器知道 stringInput 不为 null
        println(stringInput.length)
        // 0

        // 编译器废弃了之前针对 stringInput 的智能转换信息。
        // 现在 stringInput 具有 String? 类型。
        stringInput = null

        // 触发异常
        if (2 > 1) throw Exception()
        stringInput = ""
    } catch (exception: Exception) {
        // 编译器知道 stringInput 可能为 null，
        // 因此 stringInput 保持为可空类型。
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

### 智能转换的前提条件 {id="smart-cast-prerequisites"}

只有当编译器能够保证变量在检查和使用之间不会发生改变时，智能转换才会生效。它们可在以下条件下使用：

<table style="none">
    <tr>
        <td>
            <code>val</code> 局部变量
        </td>
        <td>
            始终可用，<a href="delegated-properties.md">局部委托属性</a>除外。
        </td>
    </tr>
    <tr>
        <td>
            <code>val</code> 属性
        </td>
        <td>
            如果属性为 <code>private</code>、<code>internal</code>，或者检查是在声明该属性的同一<a href="visibility-modifiers.md#modules">模块</a>中执行的。智能转换不能用于 <code>open</code> 属性或具有自定义 getter 的属性。
        </td>
    </tr>
    <tr>
        <td>
            <code>var</code> 局部变量
        </td>
        <td>
            如果变量在检查与使用之间未被修改，未在修改它的 lambda 中被捕获，并且不是局部委托属性。
        </td>
    </tr>
    <tr>
        <td>
            <code>var</code> 属性
        </td>
        <td>
            绝不可用，因为该变量随时可能被其他代码修改。
        </td>
    </tr>
</table>

## `as` 与 `as?` 转换运算符 {id="unsafe-cast-operator"}

Kotlin 有两个转换运算符：`as` 和 `as?`。二者均可用于类型转换，但行为不同。

如果使用 `as` 运算符转换失败，则会在运行时抛出 `ClassCastException`。这也是它被称为**不安全**运算符的原因。当转换为非空类型时，可以使用 `as`：

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

如果改用 `as?` 运算符且转换失败，该运算符会返回 `null`。这也是它被称为**安全**运算符的原因：

```kotlin
fun main() {
    val rawInput: Any = "user-1234"

    // 成功转换为 String
    val userId = rawInput as? String
    println("Logging in user with ID: $userId")
    // Logging in user with ID: user-1234

    // 将 null 值赋给 wrongCast
    val wrongCast = rawInput as? Int
    println("wrongCast contains: $wrongCast")
    // wrongCast contains: null
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" id="kotlin-safe-cast-operator"}

要安全地转换可空类型，请使用 `as?` 运算符，以防止转换失败时触发 `ClassCastException`。

你*可以*对可空类型使用 `as`。这允许结果为 `null`，但如果转换失败，它仍然会抛出 `ClassCastException`。因此，`as?` 是更安全的选择：

```kotlin
fun main() {
    val config: Map<String, Any?> = mapOf(
        "username" to "kodee",
        "alias" to null,
        "loginAttempts" to 3
    )

    // 不安全地转换为可空的 String
    val username: String? = config["username"] as String?
    println("Username: $username")
    // Username: kodee

    // 不安全地将 null 值转换为可空的 String
    val alias: String? = config["alias"] as String?
    println("Alias: $alias")
    // Alias: null

    // 转换为可空的 String 失败并抛出 ClassCastException
    // val unsafeAttempts: String? = config["loginAttempts"] as String?
    // println("Login attempts (unsafe): $unsafeAttempts")
    // Exception in thread "main" java.lang.ClassCastException

    // 转换为可空的 String 失败并返回 null
    val safeAttempts: String? = config["loginAttempts"] as? String
    println("Login attempts (safe): $safeAttempts")
    // Login attempts (safe): null
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" id="kotlin-cast-nullable-types"}

### 向上转换与向下转换 {id="up-and-downcasting"}

在 Kotlin 中，可以将对象转换为超类型和子类型。

将对象转换为其超类的实例称为**向上转换**（upcasting）。向上转换不需要任何特殊语法或转换运算符。例如：

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
    // 将 Dog 实例向上转换为 Animal
    printAnimalInfo(dog)  
    // Dog says woof!
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" id="kotlin-upcast"}

在此示例中，当使用 `Dog` 实例调用 `printAnimalInfo()` 函数时，编译器会将其向上转换为 `Animal`，因为这是预期的形参类型。由于实际对象仍然是 `Dog` 实例，编译器会动态解析 `Dog` 类中的 `makeSound()` 函数，并输出 `"Dog says woof!"`。

在行为取决于抽象类型的 Kotlin API 中，经常会看到显式的向上转换。这在 Jetpack Compose 和 UI 工具包中也很常见，它们通常将所有 UI 元素视为超类型，随后再针对特定子类进行操作：

```kotlin
    val textView = TextView(this)
    textView.text = "Hello, View!"

    // 从 TextView 向上转换为 View
    val view: View = textView  

    // 使用 View 的函数
    view.setPadding(20, 20, 20, 20)
    // Activity 需要一个 View 类型
    setContentView(view)
```

将对象转换为子类的实例称为**向下转换**（downcasting）。由于向下转换可能是不安全的，因此需要使用显式转换运算符。为避免在转换失败时抛出异常，建议使用安全转换运算符 `as?`，以便在转换失败时返回 `null`：

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
    // 创建 animal 作为带有 Animal 类型的 Dog 实例
    val animal: Animal = Dog()
    
    // 将 animal 安全向下转换为 Dog 类型
    val dog: Dog? = animal as? Dog

    // 如果 dog 不为 null，则使用安全调用调用 bark()
    dog?.bark()
    // "BARK!"
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" id="kotlin-downcast"}

在此示例中，`animal` 被声明为 `Animal` 类型，但它持有一个 `Dog` 实例。代码安全地将 `animal` 转换为 `Dog` 类型，并使用[安全调用](null-safety.md#safe-call-operator)（`?.`）来访问 `bark()` 函数。

在序列化中将基类反序列化为特定子类型时，会用到向下转换。在处理返回超类型对象的 Java 库时也很常见，在 Kotlin 中可能需要对其进行向下转换。