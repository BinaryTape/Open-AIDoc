[//]: # (title: 反射)

「反射」（Reflection）是一組語言與程式庫功能，允許你在執行階段反省（introspect）程式的結構。
在 Kotlin 中，函式與屬性是一等公民，而在使用功能性或響應式風格時，在執行階段反省它們的能力（例如：在執行階段得知屬性或函式的名稱或型別）至關重要。

> Kotlin/JS 對反射功能的支援有限。[進一步了解 Kotlin/JS 中的反射](js-reflection.md)。
>
{style="note"}

## JVM 相依性 {id="jvm-dependency"}

在 JVM 平台上，Kotlin 編譯器發行版將使用反射功能所需的執行階段元件作為獨立的建置產物 `kotlin-reflect.jar` 包含在內。這樣做是為了減少不使用反射功能的應用程式所需的執行階段程式庫大小。

要在 Gradle 或 Maven 專案中使用反射，請加入對 `kotlin-reflect` 的相依性：

* 在 Gradle 中：

    <tabs group="build-script">
    <tab title="Kotlin" group-key="kotlin">

    ```kotlin
    dependencies {
        implementation(kotlin("reflect"))
    }
    ```

    </tab>
    <tab title="Groovy" group-key="groovy">
    
    ```groovy
    dependencies {
        implementation "org.jetbrains.kotlin:kotlin-reflect:%kotlinVersion%"
    }
    ```

    </tab>
    </tabs>

* 在 Maven 中：
    
    ```xml
    <dependencies>
        <dependency>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-reflect</artifactId>
        </dependency>
    </dependencies>
    ```

如果你不使用 Gradle 或 Maven，請確保你的專案 Classpath 中有 `kotlin-reflect.jar`。
在其他受支援的情況下（使用命令列編譯器的 IntelliJ IDEA 專案），它是預設加入的。在命令列編譯器中，你可以使用 `-no-reflect` 編譯器選項來從 Classpath 中排除 `kotlin-reflect.jar`。

## 類別參照 {id="class-references"}

最基本的反射功能是獲取 Kotlin 類別的執行階段參照。要取得靜態已知的 Kotlin 類別參照，你可以使用「類別常值」（class literal）語法：

```kotlin
val c = MyClass::class
```

該參照是一個 [KClass](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-class/index.html) 型別的值。

>在 JVM 上：Kotlin 類別參照與 Java 類別參照不同。要取得 Java 類別參照，請在 `KClass` 執行個體上使用 `.java` 屬性。
>
{style="note"}

### 繫結類別參照 {id="bound-class-references"}

你可以使用相同的 `::class` 語法，透過將物件作為接收者（receiver）來獲取特定物件類別的參照：

```kotlin
val widget: Widget = ...
assert(widget is GoodWidget) { "Bad widget: ${widget::class.qualifiedName}" }
```

你將獲得該物件確切類別的參照，例如 `GoodWidget` 或 `BadWidget`，而不論接收者運算式（`Widget`）的型別為何。

## 可呼叫參照 {id="callable-references"}

對函式、屬性和建構函式的參照也可以被呼叫，或作為 [函式型別](lambdas.md#function-types) 的執行個體使用。

所有可呼叫參照的共同超型別（supertype）是 [`KCallable<out R>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-callable/index.html)，其中 `R` 是傳回值型別。對於屬性來說，它是屬性型別；對於建構函式來說，它是建構出的型別。

### 函式參照 {id="function-references"}

當你擁有如下宣告的具名函式時，可以直接呼叫它（`isOdd(5)`）：

```kotlin
fun isOdd(x: Int) = x % 2 != 0
```

或者，你可以將該函式用作函式型別的值，也就是將它傳遞給另一個函式。若要這樣做，請使用 `::` 運算子：

```kotlin
fun isOdd(x: Int) = x % 2 != 0

fun main() {
//sampleStart
    val numbers = listOf(1, 2, 3)
    println(numbers.filter(::isOdd))
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

這裡 `::isOdd` 是一個型別為 `(Int) -> Boolean` 的函式型別值。

函式參照屬於 [`KFunction<out R>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-function/index.html) 的其中一個子型別，具體取決於參數數量。例如 `KFunction3<T1, T2, T3, R>`。

當預期型別可以從上下文中獲知時，`::` 可以與多載函式一起使用。
例如：

```kotlin
fun main() {
//sampleStart
    fun isOdd(x: Int) = x % 2 != 0
    fun isOdd(s: String) = s == "brillig" || s == "slithy" || s == "tove"
    
    val numbers = listOf(1, 2, 3)
    println(numbers.filter(::isOdd)) // 指向 isOdd(x: Int)
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

或者，你可以透過將方法參照存儲在具有明確指定型別的變數中來提供必要的上下文：

```kotlin
val predicate: (String) -> Boolean = ::isOdd   // 指向 isOdd(x: String)
```

如果你需要使用類別的成員或擴充函式，則需要加上合格名稱：`String::toCharArray`。

即使你使用擴充函式的參照來初始化變數，推論出的函式型別也不會具有接收者，但它會多出一個接受接收者物件的參數。若要改為具有接收者的函式型別，請明確指定型別：

```kotlin
val isEmptyStringList: List<String>.() -> Boolean = List<String>::isEmpty
```

#### 範例：函式組合 {id="example-function-composition"}

考慮以下函式：

```kotlin
fun <A, B, C> compose(f: (B) -> C, g: (A) -> B): (A) -> C {
    return { x -> f(g(x)) }
}
```

它會傳回傳遞給它的兩個函式的組合：`compose(f, g) = f(g(*))`。
你可以將此函式應用於可呼叫參照：

```kotlin
fun <A, B, C> compose(f: (B) -> C, g: (A) -> B): (A) -> C {
    return { x -> f(g(x)) }
}

fun isOdd(x: Int) = x % 2 != 0

fun main() {
//sampleStart
    fun length(s: String) = s.length
    
    val oddLength = compose(::isOdd, ::length)
    val strings = listOf("a", "ab", "abc")
    
    println(strings.filter(oddLength))
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### 屬性參照 {id="property-references"}

要在 Kotlin 中將屬性作為一等物件存取，請使用 `::` 運算子：

```kotlin
val x = 1

fun main() {
    println(::x.get())
    println(::x.name) 
}
```

運算式 `::x` 會求值為 `KProperty0<Int>` 型別的屬性物件。你可以使用 `get()` 讀取其值，或使用 `name` 屬性擷取屬性名稱。如需更多資訊，請參閱 [關於 `KProperty` 類別的文件](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-property/index.html)。

對於可變屬性（如 `var y = 1`），`::y` 會傳回型別為 [`KMutableProperty0<Int>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-mutable-property/index.html) 的值，該型別具有 `set()` 方法：

```kotlin
var y = 1

fun main() {
    ::y.set(2)
    println(y)
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

屬性參照可以用在預期具有單一泛型參數的函式處：

```kotlin
fun main() {
//sampleStart
    val strs = listOf("a", "bc", "def")
    println(strs.map(String::length))
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

要存取作為類別成員的屬性，請依照下列方式加上限定：

```kotlin
fun main() {
//sampleStart
    class A(val p: Int)
    val prop = A::p
    println(prop.get(A(1)))
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

對於擴充屬性：

```kotlin
val String.lastChar: Char
    get() = this[length - 1]

fun main() {
    println(String::lastChar.get("abc"))
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### 與 Java 反射的互通性 {id="interoperability-with-java-reflection"}

在 JVM 平台上，標準函式庫包含反射類別的擴充，提供與 Java 反射物件之間的對應（參見套件 `kotlin.reflect.jvm`）。
例如，要尋找作為 Kotlin 屬性 getter 的支援欄位或 Java 方法，你可以編寫如下程式碼：

```kotlin
import kotlin.reflect.jvm.*
 
class A(val p: Int)
 
fun main() {
    println(A::p.javaGetter) // 印出 "public final int A.getP()"
    println(A::p.javaField)  // 印出 "private final int A.p"
}
```

要取得對應於 Java 類別的 Kotlin 類別，請使用 `.kotlin` 擴充屬性：

```kotlin
fun getKClass(o: Any): KClass<Any> = o.javaClass.kotlin
```

### 建構函式參照 {id="constructor-references"}

建構函式可以像方法和屬性一樣被參照。只要程式預期一個函式型別物件，且該物件接受與建構函式相同的參數並傳回適當型別的物件，你就可以使用它們。
建構函式透過使用 `::` 運算子並加上類別名稱來參照。考慮以下預期一個無參數且傳回型別為 `Foo` 的函式參數的函式：

```kotlin
class Foo

fun function(factory: () -> Foo) {
    val x: Foo = factory()
}
```

使用 `::Foo`（類別 `Foo` 的零引數建構函式），你可以像這樣呼叫它：

```kotlin
function(::Foo)
```

指向建構函式的可呼叫參照，其型別取決於參數數量，為 [`KFunction<out R>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-function/index.html) 的其中一個子型別。

### 繫結函式與屬性參照 {id="bound-function-and-property-references"}

你可以參照特定物件的執行個體方法：

```kotlin
fun main() {
//sampleStart
    val numberRegex = "\\d+".toRegex()
    println(numberRegex.matches("29"))
     
    val isNumber = numberRegex::matches
    println(isNumber("29"))
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

該範例不直接呼叫 `matches` 方法，而是使用指向它的參照。
這樣的參照會繫結到其接收者。
它可以被直接呼叫（如上例所示），或者在預期函式型別運算式時使用：

```kotlin
fun main() {
//sampleStart
    val numberRegex = "\\d+".toRegex()
    val strings = listOf("abc", "124", "a70")
    println(strings.filter(numberRegex::matches))
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

比較繫結參照與未繫結參照的型別。
繫結的可呼叫參照已將其接收者「附加」在上面，因此接收者的型別不再是參數：

```kotlin
val isNumber: (CharSequence) -> Boolean = numberRegex::matches

val matches: (Regex, CharSequence) -> Boolean = Regex::matches
```

屬性參照也可以被繫結：

```kotlin
fun main() {
//sampleStart
    val prop = "abc"::length
    println(prop.get())
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

你不需要指定 `this` 作為接收者：`this::foo` 與 `::foo` 是等價的。

### 繫結建構函式參照 {id="bound-constructor-references"}

可以透過提供外部類別的執行個體，來獲取 [內部類別](nested-classes.md#inner-classes) 建構函式的繫結可呼叫參照：

```kotlin
class Outer {
    inner class Inner
}

val o = Outer()
val boundInnerCtor = o::Inner
```
