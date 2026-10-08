[//]: # (title: 委派屬性)

對於一些常見類型的屬性，雖然你可以在每次需要時手動實作它們，但更好的做法是只實作一次、將其加入程式庫，並在以後重複使用。例如：

*   **延遲**（Lazy）屬性：僅在首次存取時計算值。
*   **可觀察**（Observable）屬性：接聽程式會收到該屬性變更的通知。
*   將屬性儲存於 **Map** 中，而不是為每個屬性建立個別的欄位。

為了涵蓋這些（以及其他）情況，Kotlin 支援**委派屬性**（delegated properties）：

```kotlin
class Example {
    var p: String by Delegate()
}
```

語法為：`val/var <property name>: <Type> by <expression>`。`by` 之後的運算式即為**委派**（delegate），因為屬性對應的 `get()`（與 `set()`）將委派給委派物件的 `getValue()` 與 `setValue()` 方法。屬性委派不必實作介面，但必須提供 `getValue()` 函式（如果是 `var`，則還需提供 `setValue()`）。

例如：

```kotlin
import kotlin.reflect.KProperty

class Delegate {
    operator fun getValue(thisRef: Any?, property: KProperty<*>): String {
        return "$thisRef, thank you for delegating '${property.name}' to me!"
    }
 
    operator fun setValue(thisRef: Any?, property: KProperty<*>, value: String) {
        println("$value has been assigned to '${property.name}' in $thisRef.")
    }
}
```

當你讀取委派給 `Delegate` 執行個體的 `p` 時，會呼叫 `Delegate` 中的 `getValue()` 函式。它的第一個參數是讀取 `p` 的物件，第二個參數則包含對 `p` 本身的描述（例如，你可以取得它的名稱）。

```kotlin
val e = Example()
println(e.p)
```

這會印出：

```
Example@33a17727, thank you for delegating 'p' to me!
```

同樣地，當你對 `p` 指派值時，會呼叫 `setValue()` 函式。前兩個參數相同，第三個參數則持有被指派的值：

```kotlin
e.p = "NEW"
```

這會印出：
 
```
NEW has been assigned to 'p' in Example@33a17727.
```

委派物件的需求規範可以在[下方](#property-delegate-requirements)找到。

你可以在函式或程式碼區塊內宣告委派屬性；它不一定要是類別的成員。
下方可以找到[一個範例](#local-delegated-properties)。

## 標準委派 {id="standard-delegates"}

Kotlin 標準函式庫為幾種有用的委派提供了工廠方法。

### 延遲屬性 {id="lazy-properties"}

[`lazy()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/lazy.html) 是一個接收 Lambda 並傳回 `Lazy<T>` 執行個體的函式，該執行個體可作為實作延遲屬性的委派。
第一次呼叫 `get()` 時會執行傳遞給 `lazy()` 的 Lambda 並記錄結果。
後續對 `get()` 的呼叫只會傳回已記錄的結果。

```kotlin
val lazyValue: String by lazy {
    println("computed!")
    "Hello"
}

fun main() {
    println(lazyValue)
    println(lazyValue)
}
```
{kotlin-runnable="true"}

預設情況下，延遲屬性的求值是**同步的**（synchronized）：該值僅在一個執行緒中計算，但所有執行緒都會看到相同的值。如果初始化委派不需要同步以允許跨執行緒同時執行，請將 `LazyThreadSafetyMode.PUBLICATION` 作為參數傳遞給 `lazy()`。

如果你確定初始化一律發生在與使用屬性相同的執行緒中，則可以使用 `LazyThreadSafetyMode.NONE`。它不會提供任何執行緒安全性保證及相關開銷。

### 可觀察屬性 {id="observable-properties"}

[`Delegates.observable()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.properties/-delegates/observable.html)
接收兩個引數：初始值與修改時的處理常式。

每當你為屬性指派值時（在指派執行**之後**），都會呼叫該處理常式。它有三個參數：被指派的屬性、舊值與新值：

```kotlin
import kotlin.properties.Delegates

class User {
    var name: String by Delegates.observable("<no name>") {
        prop, old, new ->
        println("$old -> $new")
    }
}

fun main() {
    val user = User()
    user.name = "first"
    user.name = "second"
}
```
{kotlin-runnable="true"}

如果你想攔截指派動作並**否決**（veto）它們，請使用 [`vetoable()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.properties/-delegates/vetoable.html) 取代 `observable()`。傳遞給 `vetoable` 的處理常式會在指派新屬性值**之前**被呼叫。

## 委派給另一個屬性 {id="delegating-to-another-property"}

一個屬性可以將其 getter 與 setter 委派給另一個屬性。這種委派可用於頂層屬性與類別屬性（成員與擴充）。委派屬性可以是：
* 頂層屬性
* 同一類別的成員或擴充屬性
* 另一個類別的成員或擴充屬性

若要將一個屬性委派給另一個屬性，請在委派名稱中使用 `::` 限定符，例如 `this::delegate` 或 `MyClass::delegate`。

```kotlin
var topLevelInt: Int = 0
class ClassWithDelegate(val anotherClassInt: Int)

class MyClass(var memberInt: Int, val anotherClassInstance: ClassWithDelegate) {
    var delegatedToMember: Int by this::memberInt
    var delegatedToTopLevel: Int by ::topLevelInt
    
    val delegatedToAnotherClass: Int by anotherClassInstance::anotherClassInt
}
var MyClass.extDelegated: Int by ::topLevelInt
```

這在某些情況下很有用，例如當你想以回溯相容的方式重新命名屬性時：引入一個新屬性，將舊屬性加上 `@Deprecated` 註解，並委派其實作。

```kotlin
class MyClass {
   var newName: Int = 0
   @Deprecated("Use 'newName' instead", ReplaceWith("newName"))
   var oldName: Int by this::newName
}
fun main() {
   val myClass = MyClass()
   // 通知：'oldName: Int' 已棄用。
   // 請改用 'newName'
   myClass.oldName = 42
   println(myClass.newName) // 42
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.4"}

## 將屬性儲存於 Map 中 {id="storing-properties-in-a-map"}

一個常見的使用案例是將屬性的值儲存於 Map 中。這在解析 JSON 或執行其他動態任務的應用程式中經常出現。在這種情況下，你可以使用 Map 執行個體本身作為委派屬性的委派。

```kotlin
class User(val map: Map<String, Any?>) {
    val name: String by map
    val age: Int     by map
}
```

在此範例中，建構函式接收一個 Map：

```kotlin
val user = User(mapOf(
    "name" to "John Doe",
    "age"  to 25
))
```

委派屬性透過字串鍵從此 Map 中取得值，這些鍵與屬性的名稱相關聯：

```kotlin
class User(val map: Map<String, Any?>) {
    val name: String by map
    val age: Int     by map
}

fun main() {
    val user = User(mapOf(
        "name" to "John Doe",
        "age"  to 25
    ))
//sampleStart
    println(user.name) // 印出 "John Doe"
    println(user.age)  // 印出 25
//sampleEnd
}
```
{kotlin-runnable="true"}

如果你使用 `MutableMap` 取代唯讀的 `Map`，這對於 `var` 屬性也同樣有效：

```kotlin
class MutableUser(val map: MutableMap<String, Any?>) {
    var name: String by map
    var age: Int     by map
}
```

## 區域委派屬性 {id="local-delegated-properties"}

你可以將區域變數宣告為委派屬性。
例如，你可以讓一個區域變數變為延遲加載：

```kotlin
fun example(computeFoo: () -> Foo) {
    val memoizedFoo by lazy(computeFoo)

    if (someCondition && memoizedFoo.isValid()) {
        memoizedFoo.doSomething()
    }
}
```

`memoizedFoo` 變數將僅在首次存取時計算。
如果 `someCondition` 為 false，則該變數完全不會被計算。

## 屬性委派的需求 {id="property-delegate-requirements"}

對於**唯讀**屬性（`val`），委派應提供一個具有以下參數的運算子函式 `getValue()`：

* `thisRef` 必須與**屬性所有者**（property owner）的型別相同，或是其父型別（對於擴充屬性，它應該是被擴充的型別）。
* `property` 必須是 `KProperty<*>` 型別或其父型別。

`getValue()` 必須傳回與屬性相同的型別（或其子型別）。

```kotlin
class Resource

class Owner {
    val valResource: Resource by ResourceDelegate()
}

class ResourceDelegate {
    operator fun getValue(thisRef: Owner, property: KProperty<*>): Resource {
        return Resource()
    }
}
```

對於**可變**屬性（`var`），委派必須額外提供一個具有以下參數的運算子函式 `setValue()`：

* `thisRef` 必須與**屬性所有者**的型別相同，或是其父型別（對於擴充屬性，它應該是被擴充的型別）。
* `property` 必須是 `KProperty<*>` 型別或其父型別。
* `value` 必須與屬性的型別相同（或其父型別）。
 
```kotlin
class Resource

class Owner {
    var varResource: Resource by ResourceDelegate()
}

class ResourceDelegate(private var resource: Resource = Resource()) {
    operator fun getValue(thisRef: Owner, property: KProperty<*>): Resource {
        return resource
    }
    operator fun setValue(thisRef: Owner, property: KProperty<*>, value: Any?) {
        if (value is Resource) {
            resource = value
        }
    }
}
```

`getValue()` 與/或 `setValue()` 函式可以作為委派類別的成員函式或擴充函式提供。當你需要將屬性委派給一個原本不提供這些函式的物件時，擴充函式會非常方便。這兩個函式都需要標記 `operator` 關鍵字。

你可以使用 Kotlin 標準函式庫中的 `ReadOnlyProperty` 與 `ReadWriteProperty` 介面，以匿名物件的方式建立委派，而無需建立新的類別。它們提供了所需的方法：`getValue()` 在 `ReadOnlyProperty` 中宣告；`ReadWriteProperty` 繼承了它並增加了 `setValue()`。這意味著在需要 `ReadOnlyProperty` 的地方，你都可以傳遞 `ReadWriteProperty`。

```kotlin
fun resourceDelegate(resource: Resource = Resource()): ReadWriteProperty<Any?, Resource> =
    object : ReadWriteProperty<Any?, Resource> {
        var curValue = resource 
        override fun getValue(thisRef: Any?, property: KProperty<*>): Resource = curValue
        override fun setValue(thisRef: Any?, property: KProperty<*>, value: Resource) {
            curValue = value
        }
    }

val readOnlyResource: Resource by resourceDelegate()  // ReadWriteProperty 作為 val
var readWriteResource: Resource by resourceDelegate()
```

## 委派屬性的轉換規則 {id="translation-rules-for-delegated-properties"}

在底層，Kotlin 編譯器會為某些類型的委派屬性產生輔助屬性，然後將操作委派給它們。

> 為了最佳化目的，編譯器在[幾種情況下](#optimized-cases-for-delegated-properties) **不會** 產生輔助屬性。
> 請參考[委派給另一個屬性](#translation-rules-when-delegating-to-another-property)的範例來了解最佳化。
>
{style="note"}

例如，對於屬性 `prop`，它會產生隱藏屬性 `prop$delegate`，存取子的程式碼只是簡單地委派給這個額外屬性：

```kotlin
class C {
    var prop: Type by MyDelegate()
}

// 編譯器產生的程式碼如下：
class C {
    private val prop$delegate = MyDelegate()
    var prop: Type
        get() = prop$delegate.getValue(this, this::prop)
        set(value: Type) = prop$delegate.setValue(this, this::prop, value)
}
```

Kotlin 編譯器在引數中提供了關於 `prop` 的所有必要資訊：第一個引數 `this` 指向外部類別 `C` 的執行個體，而 `this::prop` 是一個 `KProperty` 型別的反射物件，描述了 `prop` 本身。

### 委派屬性的最佳化情況 {id="optimized-cases-for-delegated-properties"}

如果委派符合以下情況，則會省略 `$delegate` 欄位：
* 被參考的屬性：

  ```kotlin
  class C<Type> {
      private var impl: Type = ...
      var prop: Type by ::impl
  }
  ```

* 具名物件（named object）：

  ```kotlin
  object NamedObject {
      operator fun getValue(thisRef: Any?, property: KProperty<*>): String = ...
  }

  val s: String by NamedObject
  ```

* 同一模組內，具有支援欄位（backing field）與預設 getter 的 final `val` 屬性：

  ```kotlin
  val impl: ReadOnlyProperty<Any?, String> = ...

  class A {
      val s: String by impl
  }
  ```

* 常數運算式、列舉成員、`this`、`null`。以 `this` 為例：

  ```kotlin
  class A {
      operator fun getValue(thisRef: Any?, property: KProperty<*>) ...
 
      val s by this
  }
  ```

### 委派給另一個屬性時的轉換規則 {id="translation-rules-when-delegating-to-another-property"}

當委派給另一個屬性時，Kotlin 編譯器會產生對該參考屬性的直接存取。這意味著編譯器不會產生 `prop$delegate` 欄位。此最佳化有助於節省記憶體。

以以下程式碼為例：

```kotlin
class C<Type> {
    private var impl: Type = ...
    var prop: Type by ::impl
}
```

`prop` 變數的屬性存取子會直接呼叫 `impl` 變數，跳過委派屬性的 `getValue` 與 `setValue` 運算子，因此不需要 `KProperty` 參考物件。

對於上述程式碼，編譯器會產生以下程式碼：

```kotlin
class C<Type> {
    private var impl: Type = ...

    var prop: Type
        get() = impl
        set(value) {
            impl = value
        }
    
    fun getProp$delegate(): Type = impl // 此方法僅用於反射
}
```

## 提供委派 {id="providing-a-delegate"}

透過定義 `provideDelegate` 運算子，你可以擴充建立屬性實作所委派之物件的邏輯。如果 `by` 右側使用的物件將 `provideDelegate` 定義為成員或擴充函式，則會呼叫該函式來建立屬性委派執行個體。

`provideDelegate` 的其中一個可能使用案例是在初始化屬性時檢查其一致性。

例如，要在繫結前檢查屬性名稱，你可以寫成這樣：

```kotlin
class ResourceDelegate<T> : ReadOnlyProperty<MyUI, T> {
    override fun getValue(thisRef: MyUI, property: KProperty<*>): T { ... }
}
    
class ResourceLoader<T>(id: ResourceID<T>) {
    operator fun provideDelegate(
            thisRef: MyUI,
            prop: KProperty<*>
    ): ReadOnlyProperty<MyUI, T> {
        checkProperty(thisRef, prop.name)
        // 建立委派
        return ResourceDelegate()
    }

    private fun checkProperty(thisRef: MyUI, name: String) { ... }
}

class MyUI {
    fun <T> bindResource(id: ResourceID<T>): ResourceLoader<T> { ... }

    val image by bindResource(ResourceID.image_id)
    val text by bindResource(ResourceID.text_id)
}
```

`provideDelegate` 的參數與 `getValue` 相同：

* `thisRef` 必須與**屬性所有者**的型別相同，或是其父型別（對於擴充屬性，它應該是被擴充的型別）；
* `property` 必須是 `KProperty<*>` 型別或其父型別。

在建立 `MyUI` 執行個體期間，會為每個屬性呼叫 `provideDelegate` 方法，並立即執行必要的驗證。

如果沒有這種攔截屬性與其委派之間繫結的能力，要實現相同的功能，你必須明確傳遞屬性名稱，這並不方便：

```kotlin
// 在沒有 "provideDelegate" 功能的情況下檢查屬性名稱
class MyUI {
    val image by bindResource(ResourceID.image_id, "image")
    val text by bindResource(ResourceID.text_id, "text")
}

fun <T> MyUI.bindResource(
        id: ResourceID<T>,
        propertyName: String
): ReadOnlyProperty<MyUI, T> {
    checkProperty(this, propertyName)
    // 建立委派
}
```

在產生的程式碼中，會呼叫 `provideDelegate` 方法來初始化輔助屬性 `prop$delegate`。將屬性宣告 `val prop: Type by MyDelegate()` 所產生的程式碼與[上方](#translation-rules-for-delegated-properties)（當 `provideDelegate` 方法不存在時）產生的程式碼進行比較：

```kotlin
class C {
    var prop: Type by MyDelegate()
}

// 當 'provideDelegate' 函式可用時，
// 編譯器會產生此程式碼：
class C {
    // 呼叫 "provideDelegate" 來建立額外的 "delegate" 屬性
    private val prop$delegate = MyDelegate().provideDelegate(this, this::prop)
    var prop: Type
        get() = prop$delegate.getValue(this, this::prop)
        set(value: Type) = prop$delegate.setValue(this, this::prop, value)
}
```

請注意，`provideDelegate` 方法僅影響輔助屬性的建立，不會影響為 getter 或 setter 產生的程式碼。

藉助標準函式庫中的 `PropertyDelegateProvider` 介面，你可以建立委派提供者而無需建立新類別。

```kotlin
val provider = PropertyDelegateProvider { thisRef: Any?, property ->
    ReadOnlyProperty<Any?, Int> {_, property -> 42 }
}
val delegate: Int by provider
```
