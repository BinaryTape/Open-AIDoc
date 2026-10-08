[//]: # (title: 委托属性)

对于一些常见的属性，虽然你可以每次在需要时都手动实现它们，但更好的做法是只实现一次，将其放入库中并在以后重用。例如：

* **Lazy** 属性：仅在首次访问时计算其值。
* **Observable** 属性：监听器会收到有关此属性更改的通知。
* 将属性存储在 **map** 中，而不是为每个属性使用单独的字段。

为了涵盖这些（以及其他）情况，Kotlin 支持**委托属性**：

```kotlin
class Example {
    var p: String by Delegate()
}
```

语法为：`val/var <属性名称>: <类型> by <表达式>`。`by` 后面的表达式是**委托**，因为属性对应的 `get()`（以及 `set()`）将被委托给它的 `getValue()` 和 `setValue()` 方法。属性委托不必实现接口，但必须提供 `getValue()` 函数（对于 `var` 还需要 `setValue()`）。

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

当你读取委托给 `Delegate` 实例的 `p` 时，会调用 `Delegate` 的 `getValue()` 函数。它的第一个形参是你读取 `p` 所在的对象，第二个形参保存了对 `p` 本身的描述（例如，你可以获取它的名称）。

```kotlin
val e = Example()
println(e.p)
```

这会打印：

```
Example@33a17727, thank you for delegating 'p' to me!
```

类似地，当你为 `p` 赋值时，会调用 `setValue()` 函数。前两个形参相同，第三个形参保存要分配的值：

```kotlin
e.p = "NEW"
```

这会打印：
 
```
NEW has been assigned to 'p' in Example@33a17727.
```

有关委托对象要求的规范可以在[下文](#property-delegate-requirements)中找到。

你可以在函数或代码块内声明委托属性；它不一定是类的成员。你可以在下文找到[示例](#local-delegated-properties)。

## 标准委托 {id="standard-delegates"}

Kotlin 标准库为几种有用的委托提供了工厂方法。

### Lazy 属性 {id="lazy-properties"}

[`lazy()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/lazy.html) 是一个接收 lambda表达式 并返回 `Lazy<T>` 实例的函数，该实例可以作为实现 Lazy 属性的委托。第一次调用 `get()` 会执行传递给 `lazy()` 的 lambda表达式 并记录结果。后续对 `get()` 的调用只会返回记录的结果。

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

默认情况下，Lazy 属性的求值是**同步**的：值仅在一个线程中计算，但所有线程都将看到相同的值。如果初始化委托不需要同步以允许多个线程同时执行它，请将 `LazyThreadSafetyMode.PUBLICATION` 作为参数传递给 `lazy()`。

如果你确信初始化将始终在与使用属性的线程相同的线程中发生，则可以使用 `LazyThreadSafetyMode.NONE`。它不会产生任何线程安全性保证和相关的开销。

### Observable 属性 {id="observable-properties"}

[`Delegates.observable()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.properties/-delegates/observable.html) 接收两个实参：初始值和修改处理程序。

每当你为属性赋值时（在执行赋值**之后**），都会调用该处理程序。它有三个形参：被赋值的属性、旧值和新值：

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

如果你想拦截赋值并**否决**它们，请使用 [`vetoable()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.properties/-delegates/vetoable.html) 代替 `observable()`。传递给 `vetoable` 的处理程序将在新属性值赋值**之前**被调用。

## 委托给另一个属性 {id="delegating-to-another-property"}

一个属性可以将其 getter 和 setter 委托给另一个属性。这种委托可用于顶层属性和类属性（成员属性和扩展属性）。委托属性可以是：
* 一个顶层属性
* 同一个类的成员属性或扩展属性
* 另一个类的成员属性或扩展属性

要将一个属性委托给另一个属性，请在委托名称中使用 `::` 限定符，例如 `this::delegate` 或 `MyClass::delegate`。

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

这在某些情况下很有用，例如，当你想要以向后兼容的方式重命名属性时：引入一个新属性，使用 `@Deprecated` 注解标记旧属性，并委托其实现。

```kotlin
class MyClass {
   var newName: Int = 0
   @Deprecated("Use 'newName' instead", ReplaceWith("newName"))
   var oldName: Int by this::newName
}
fun main() {
   val myClass = MyClass()
   // 通知：'oldName: Int' 已弃用。
   // 请改用 'newName'
   myClass.oldName = 42
   println(myClass.newName) // 42
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.4"}

## 将属性存储在 map 中 {id="storing-properties-in-a-map"}

一个常见的用例是在 map 中存储属性的值。这在解析 JSON 或执行其他动态任务的应用中经常出现。在这种情况下，你可以使用 map 实例本身作为委托属性的委托。

```kotlin
class User(val map: Map<String, Any?>) {
    val name: String by map
    val age: Int     by map
}
```

在此示例中，构造函数接收一个 map：

```kotlin
val user = User(mapOf(
    "name" to "John Doe",
    "age"  to 25
))
```

委托属性通过字符串键从该 map 中获取值，这些键与属性的名称相关联：

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
    println(user.name) // 打印 "John Doe"
    println(user.age)  // 打印 25
//sampleEnd
}
```
{kotlin-runnable="true"}

如果你使用 `MutableMap` 代替只读 `Map`，这也适用于 `var` 属性：

```kotlin
class MutableUser(val map: MutableMap<String, Any?>) {
    var name: String by map
    var age: Int     by map
}
```

## 局部委托属性 {id="local-delegated-properties"}

你可以将局部变量声明为委托属性。例如，你可以使局部变量成为 Lazy 的：

```kotlin
fun example(computeFoo: () -> Foo) {
    val memoizedFoo by lazy(computeFoo)

    if (someCondition && memoizedFoo.isValid()) {
        memoizedFoo.doSomething()
    }
}
```

`memoizedFoo` 变量将仅在首次访问时计算。如果 `someCondition` 失败，则根本不会计算该变量。

## 属性委托要求 {id="property-delegate-requirements"}

对于**只读**属性 (`val`)，委托应提供一个具有以下形参的运算符函数 `getValue()`：

* `thisRef` 必须与**属性所有者**的类型相同或者是其超类型（对于扩展属性，它应该是被扩展的类型）。
* `property` 必须是 `KProperty<*>` 类型或其超类型。

`getValue()` 必须返回与属性相同的类型（或其子类型）。

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

对于**可变**属性 (`var`)，委托必须额外提供一个具有以下形参的运算符函数 `setValue()`：

* `thisRef` 必须与**属性所有者**的类型相同或者是其超类型（对于扩展属性，它应该是被扩展的类型）。
* `property` 必须是 `KProperty<*>` 类型或其超类型。
* `value` 必须与属性相同的类型（或其超类型）。
 
```class Resource

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

`getValue()` 和/或 `setValue()` 函数可以作为委托类的成员函数或扩展函数提供。当你需要将属性委托给原本不提供这些函数的对象时，后者非常方便。这两个函数都需要用 `operator` 关键字标记。

你可以通过使用 Kotlin 标准库中的 `ReadOnlyProperty` 和 `ReadWriteProperty` 接口来创建委托作为匿名对象，而无需创建新类。它们提供了所需的方法：`getValue()` 在 `ReadOnlyProperty` 中声明；`ReadWriteProperty` 继承了它并添加了 `setValue()`。这意味着你可以在需要 `ReadOnlyProperty` 的地方传递 `ReadWriteProperty`。

```kotlin
fun resourceDelegate(resource: Resource = Resource()): ReadWriteProperty<Any?, Resource> =
    object : ReadWriteProperty<Any?, Resource> {
        var curValue = resource 
        override fun getValue(thisRef: Any?, property: KProperty<*>): Resource = curValue
        override fun setValue(thisRef: Any?, property: KProperty<*>, value: Resource) {
            curValue = value
        }
    }

val readOnlyResource: Resource by resourceDelegate()  // 作为 val 使用 ReadWriteProperty
var readWriteResource: Resource by resourceDelegate()
```

## 委托属性的转换规则 {id="translation-rules-for-delegated-properties"}

在底层，Kotlin 编译器会为某些类型的委托属性生成辅助属性，然后委托给它们。

> 出于优化目的，编译器在[几种情况下不会生成辅助属性](#optimized-cases-for-delegated-properties)。
> 详细了解[委托给另一个属性](#translation-rules-when-delegating-to-another-property)示例中的优化。
>
{style="note"}

例如，对于属性 `prop`，它会生成隐藏属性 `prop$delegate`，而访问器的代码只是简单地委托给这个附加属性：

```kotlin
class C {
    var prop: Type by MyDelegate()
}

// 编译器实际生成的代码如下：
class C {
    private val prop$delegate = MyDelegate()
    var prop: Type
        get() = prop$delegate.getValue(this, this::prop)
        set(value: Type) = prop$delegate.setValue(this, this::prop, value)
}
```

Kotlin 编译器在实参中提供了有关 `prop` 的所有必要信息：第一个实参 `this` 引用外部类 `C` 的实例，而 `this::prop` 是描述 `prop` 本身的 `KProperty` 类型的反射对象。

### 委托属性的优化情况 {id="optimized-cases-for-delegated-properties"}

如果委托是以下情况，则将省略 `$delegate` 字段：
* 引用属性：

  ```kotlin
  class C<Type> {
      private var impl: Type = ...
      var prop: Type by ::impl
  }
  ```

* 具名对象：

  ```kotlin
  object NamedObject {
      operator fun getValue(thisRef: Any?, property: KProperty<*>): String = ...
  }

  val s: String by NamedObject
  ```

* 在同一个模块中具有支持字段和默认 getter 的 final `val` 属性：

  ```kotlin
  val impl: ReadOnlyProperty<Any?, String> = ...

  class A {
      val s: String by impl
  }
  ```

* 常量表达式、枚举项、`this`、`null`。`this` 的例子：

  ```kotlin
  class A {
      operator fun getValue(thisRef: Any?, property: KProperty<*>) ...
 
      val s by this
  }
  ```

### 委托给另一个属性时的转换规则 {id="translation-rules-when-delegating-to-another-property"}

当委托给另一个属性时，Kotlin 编译器会生成对引用属性的直接访问。这意味着编译器不会生成 `prop$delegate` 字段。这种优化有助于节省内存。

以下面的代码为例：

```kotlin
class C<Type> {
    private var impl: Type = ...
    var prop: Type by ::impl
}
```

`prop` 变量的属性访问器直接调用 `impl` 变量，跳过委托属性的 `getValue` 和 `setValue` 运算符，因此不需要 `KProperty` 引用对象。

对于上面的代码，编译器会生成以下代码：

```kotlin
class C<Type> {
    private var impl: Type = ...

    var prop: Type
        get() = impl
        set(value) {
            impl = value
        }
    
    fun getProp$delegate(): Type = impl // 此方法仅用于反射
}
```

## 提供委托 {id="providing-a-delegate"}

通过定义 `provideDelegate` 运算符，你可以扩展创建属性实现所委托到的对象的逻辑。如果在 `by` 右侧使用的对象将 `provideDelegate` 定义为成员函数或扩展函数，则将调用该函数来创建属性委托实例。

`provideDelegate` 的一个可能用例是在属性初始化时检查其一致性。

例如，要在绑定之前检查属性名称，你可以编写如下代码：

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
        // 创建委托
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

`provideDelegate` 的形参与 `getValue` 相同：

* `thisRef` 必须与**属性所有者**的类型相同或者是其超类型（对于扩展属性，它应该是被扩展的类型）；
* `property` 必须是 `KProperty<*>` 类型或其超类型。

在创建 `MyUI` 实例期间，会为每个属性调用 `provideDelegate` 方法，并立即执行必要的验证。

如果没有这种拦截属性与其委托之间绑定的能力，要实现相同的功能，你必须显式传递属性名称，这不太方便：

```kotlin
// 不使用 "provideDelegate" 功能检查属性名称
class MyUI {
    val image by bindResource(ResourceID.image_id, "image")
    val text by bindResource(ResourceID.text_id, "text")
}

fun <T> MyUI.bindResource(
        id: ResourceID<T>,
        propertyName: String
): ReadOnlyProperty<MyUI, T> {
    checkProperty(this, propertyName)
    // 创建委托
}
```

在生成的代码中，会调用 `provideDelegate` 方法来初始化辅助属性 `prop$delegate`。比较为属性声明 `val prop: Type by MyDelegate()` 生成的代码与[上文](#translation-rules-for-delegated-properties)（当 `provideDelegate` 方法不存在时）生成的代码：

```kotlin
class C {
    var prop: Type by MyDelegate()
}

// 当 'provideDelegate' 函数可用时，
// 编译器会生成此代码：
class C {
    // 调用 "provideDelegate" 来创建附加的 "delegate" 属性
    private val prop$delegate = MyDelegate().provideDelegate(this, this::prop)
    var prop: Type
        get() = prop$delegate.getValue(this, this::prop)
        set(value: Type) = prop$delegate.setValue(this, this::prop, value)
}
```

请注意，`provideDelegate` 方法仅影响辅助属性的创建，不会影响为 getter 或 setter 生成的代码。

使用标准库中的 `PropertyDelegateProvider` 接口，你可以在不创建新类的情况下创建委托提供程序。

```kotlin
val provider = PropertyDelegateProvider { thisRef: Any?, property ->
    ReadOnlyProperty<Any?, Int> {_, property -> 42 }
}
val delegate: Int by provider
```
