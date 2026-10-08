[//]: # (title: 委譲プロパティ)

いくつかの一般的な種類のプロパティでは、必要になるたびに手動で実装することもできますが、一度だけ実装してライブラリに追加し、後で再利用できるようにする方が便利です。例えば：

* **遅延（Lazy）プロパティ**: 最初のアクセス時にのみ値が計算されます。
* **観察可能（Observable）プロパティ**: このプロパティの変更がリスナーに通知されます。
* プロパティごとに個別のフィールドを用意するのではなく、**マップ（map）**にプロパティを保存する場合。

これら（およびその他の）ケースをカバーするために、Kotlin は **委譲プロパティ（delegated properties）** をサポートしています。

```kotlin
class Example {
    var p: String by Delegate()
}
```

構文は `val/var <プロパティ名>: <型> by <式>` です。`by` の後の式は**委譲（delegate）**です。なぜなら、プロパティに対応する `get()`（および `set()`）が、その `getValue()` および `setValue()` メソッドに委譲されるからです。プロパティの委譲はインターフェースを実装する必要はありませんが、`getValue()` 関数（および `var` の場合は `setValue()`）を提供する必要があります。

例えば：

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

`Delegate` のインスタンスに委譲されている `p` から値を読み取ると、`Delegate` の `getValue()` 関数が呼び出されます。その第1パラメータは `p` を読み取ったオブジェクトであり、第2パラメータは `p` 自体の説明を保持します（例えば、その名前を取得できます）。

```kotlin
val e = Example()
println(e.p)
```

これは次のように出力されます：

```
Example@33a17727, thank you for delegating 'p' to me!
```

同様に、`p` に値を代入すると、`setValue()` 関数が呼び出されます。最初の2つのパラメータは同じで、3つ目は代入される値を保持します：

```kotlin
e.p = "NEW"
```

これは次のように出力されます：
 
```
NEW has been assigned to 'p' in Example@33a17727.
```

委譲されるオブジェクトの要件に関する仕様は、[以下](#property-delegate-requirements)にあります。

委譲プロパティは関数内やコードブロック内で宣言することもできます。必ずしもクラスのメンバである必要はありません。
[例](#local-delegated-properties)は以下にあります。

## 標準の委譲 {id="standard-delegates"}

Kotlin 標準ライブラリは、いくつかの便利な種類の委譲のためのファクトリメソッドを提供しています。

### 遅延プロパティ {id="lazy-properties"}

[`lazy()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/lazy.html) はラムダを受け取り、遅延プロパティを実装するための委譲として機能する `Lazy<T>` のインスタンスを返す関数です。
`get()` の最初の呼び出しで `lazy()` に渡されたラムダが実行され、その結果が記憶されます。
その後の `get()` の呼び出しでは、単に記憶された結果を返します。

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

デフォルトでは、遅延プロパティの評価は**同期（synchronized）**されます。値は1つのスレッドでのみ計算されますが、すべてのスレッドが同じ値を参照することになります。初期化の委譲の同期が不要で、複数のスレッドが同時に実行できるようにしたい場合は、`lazy()` のパラメータとして `LazyThreadSafetyMode.PUBLICATION` を渡してください。

初期化が常にプロパティを使用するのと同じスレッドで行われることが確実な場合は、`LazyThreadSafetyMode.NONE` を使用できます。これは、スレッドセーフの保証やそれに関連するオーバーヘッドを一切伴いません。

### 観察可能プロパティ {id="observable-properties"}

[`Delegates.observable()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.properties/-delegates/observable.html)
は、初期値と変更時のハンドラの2つの引数を取ります。

ハンドラは、プロパティに代入が行われるたびに（代入が実行された**後**に）呼び出されます。これには、代入先のプロパティ、古い値、新しい値の3つのパラメータがあります。

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

代入をインターセプトして**拒否（veto）**したい場合は、`observable()` の代わりに [`vetoable()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.properties/-delegates/vetoable.html) を使用してください。
`vetoable` に渡されたハンドラは、新しいプロパティ値の代入が実行される**前**に呼び出されます。

## 別のプロパティへの委譲 {id="delegating-to-another-property"}

プロパティは、そのゲッターとセッターを別のプロパティに委譲できます。このような委譲は、トップレベルおよびクラスのプロパティ（メンバおよび拡張）の両方で利用可能です。委譲先のプロパティは以下のいずれかになります：
* トップレベルプロパティ
* 同じクラスのメンバまたは拡張プロパティ
* 別のクラスのメンバまたは拡張プロパティ

プロパティを別のプロパティに委譲するには、委譲先の名称に `::` 修飾子を使用します。例えば、`this::delegate` や `MyClass::delegate` です。

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

これは、例えば、後方互換性を保ちながらプロパティ名を変更したい場合に便利です。新しいプロパティを導入し、古いプロパティに `@Deprecated` アノテーションを付けて、その実装を委譲します。

```kotlin
class MyClass {
   var newName: Int = 0
   @Deprecated("Use 'newName' instead", ReplaceWith("newName"))
   var oldName: Int by this::newName
}
fun main() {
   val myClass = MyClass()
   // 通知: 'oldName: Int' は非推奨です。
   // 代わりに 'newName' を使用してください。
   myClass.oldName = 42
   println(myClass.newName) // 42
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.4"}

## マップへのプロパティ保存 {id="storing-properties-in-a-map"}

一般的なユースケースの一つは、プロパティの値をマップに保存することです。
これは、JSON のパースやその他の動的なタスクを行うアプリケーションでよく発生します。
この場合、マップインスタンス自体を委譲プロパティの委譲先として使用できます。

```kotlin
class User(val map: Map<String, Any?>) {
    val name: String by map
    val age: Int     by map
}
```

この例では、コンストラクタでマップを受け取ります：

```kotlin
val user = User(mapOf(
    "name" to "John Doe",
    "age"  to 25
))
```

委譲プロパティは、プロパティ名に関連付けられた文字列キーを介して、このマップから値を取得します。

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
    println(user.name) // "John Doe" を出力
    println(user.age)  // 25 を出力
//sampleEnd
}
```
{kotlin-runnable="true"}

読み取り専用の `Map` の代わりに `MutableMap` を使用すれば、`var` プロパティでも機能します：

```kotlin
class MutableUser(val map: MutableMap<String, Any?>) {
    var name: String by map
    var age: Int     by map
}
```

## ローカル委譲プロパティ {id="local-delegated-properties"}

ローカル変数を委譲プロパティとして宣言できます。
例えば、ローカル変数を遅延初期化（lazy）にすることができます：

```kotlin
fun example(computeFoo: () -> Foo) {
    val memoizedFoo by lazy(computeFoo)

    if (someCondition && memoizedFoo.isValid()) {
        memoizedFoo.doSomething()
    }
}
```

`memoizedFoo` 変数は、最初のアクセス時にのみ計算されます。
`someCondition` が false の場合、この変数は一切計算されません。

## プロパティ委譲の要件 {id="property-delegate-requirements"}

**読み取り専用**プロパティ（`val`）の場合、委譲は以下のパラメータを持つ演算子関数 `getValue()` を提供する必要があります：

* `thisRef` は、**プロパティの所有者**と同じ型、またはそのスーパータイプである必要があります（拡張プロパティの場合、拡張される型である必要があります）。
* `property` は `KProperty<*>` 型またはそのスーパータイプである必要があります。

`getValue()` は、プロパティと同じ型（またはそのサブタイプ）を返す必要があります。

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

**ミュータブル**なプロパティ（`var`）の場合、委譲はさらに以下のパラメータを持つ演算子関数 `setValue()` を提供する必要があります：

* `thisRef` は、**プロパティの所有者**と同じ型、またはそのスーパータイプである必要があります（拡張プロパティの場合、拡張される型である必要があります）。
* `property` は `KProperty<*>` 型またはそのスーパータイプである必要があります。
* `value` は、プロパティと同じ型（またはそのスーパータイプ）である必要があります。
 
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

`getValue()` および/または `setValue()` 関数は、委譲クラスのメンバ関数として提供することも、拡張関数として提供することもできます。
後者は、もともとこれらの関数を提供していないオブジェクトにプロパティを委譲したい場合に便利です。
どちらの関数も `operator` キーワードでマークする必要があります。

Kotlin 標準ライブラリの `ReadOnlyProperty` および `ReadWriteProperty` インターフェースを使用することで、新しいクラスを作成せずに匿名オブジェクトとして委譲を作成できます。
これらは必要なメソッドを提供します：`getValue()` は `ReadOnlyProperty` で宣言されており、`ReadWriteProperty` はそれを継承して `setValue()` を追加しています。つまり、`ReadOnlyProperty` が期待される場所であればどこでも `ReadWriteProperty` を渡すことができます。

```kotlin
fun resourceDelegate(resource: Resource = Resource()): ReadWriteProperty<Any?, Resource> =
    object : ReadWriteProperty<Any?, Resource> {
        var curValue = resource 
        override fun getValue(thisRef: Any?, property: KProperty<*>): Resource = curValue
        override fun setValue(thisRef: Any?, property: KProperty<*>, value: Resource) {
            curValue = value
        }
    }

val readOnlyResource: Resource by resourceDelegate()  // ReadWriteProperty を val として使用
var readWriteResource: Resource by resourceDelegate()
```

## 委譲プロパティの変換ルール {id="translation-rules-for-delegated-properties"}

内部的には、Kotlin コンパイラは特定の種類の委譲プロパティに対して補助プロパティを生成し、そこに委譲します。

> 最適化のため、コンパイラは[いくつかのケースでは補助プロパティを生成しません](#optimized-cases-for-delegated-properties)。
> [別のプロパティに委譲する場合](#translation-rules-when-delegating-to-another-property)の例で、この最適化について学んでください。
>
{style="note"}

例えば、プロパティ `prop` に対して、コンパイラは隠しプロパティ `prop$delegate` を生成し、アクセサのコードは単にこの追加プロパティに委譲します：

```kotlin
class C {
    var prop: Type by MyDelegate()
}

// このコードは代わりにコンパイラによって生成されます：
class C {
    private val prop$delegate = MyDelegate()
    var prop: Type
        get() = prop$delegate.getValue(this, this::prop)
        set(value: Type) = prop$delegate.setValue(this, this::prop, value)
}
```

Kotlin コンパイラは、引数に `prop` に関する必要なすべての情報を提供します。第1引数の `this` は外側のクラス `C` のインスタンスを指し、`this::prop` は `prop` 自体を記述する `KProperty` 型のリフレクションオブジェクトです。

### 委譲プロパティの最適化されたケース {id="optimized-cases-for-delegated-properties"}

委譲先が以下の場合、`$delegate` フィールドは省略されます：
* 参照されたプロパティ：

  ```kotlin
  class C<Type> {
      private var impl: Type = ...
      var prop: Type by ::impl
  }
  ```

* 名前付きオブジェクト（Named object）：

  ```kotlin
  object NamedObject {
      operator fun getValue(thisRef: Any?, property: KProperty<*>): String = ...
  }

  val s: String by NamedObject
  ```

* 同じモジュール内にある、バッキングフィールドとデフォルトのゲッターを持つ final な `val` プロパティ：

  ```kotlin
  val impl: ReadOnlyProperty<Any?, String> = ...

  class A {
      val s: String by impl
  }
  ```

* 定数式、列挙型のエントリ、`this`、`null`。`this` の例：

  ```kotlin
  class A {
      operator fun getValue(thisRef: Any?, property: KProperty<*>) ...
 
      val s by this
  }
  ```

### 別のプロパティに委譲する場合の変換ルール {id="translation-rules-when-delegating-to-another-property"}

別のプロパティに委譲する場合、Kotlin コンパイラは参照されたプロパティへの直接アクセスを生成します。
これは、コンパイラが `prop$delegate` フィールドを生成しないことを意味します。この最適化により、メモリを節約できます。

例えば、次のコードを考えてみましょう：

```kotlin
class C<Type> {
    private var impl: Type = ...
    var prop: Type by ::impl
}
```

`prop` 変数のプロパティアクセサは、委譲プロパティの `getValue` および `setValue` 演算子をスキップして `impl` 変数を直接呼び出すため、`KProperty` 参照オブジェクトは不要になります。

上記のコードに対して、コンパイラは以下のコードを生成します：

```kotlin
class C<Type> {
    private var impl: Type = ...

    var prop: Type
        get() = impl
        set(value) {
            impl = value
        }
    
    fun getProp$delegate(): Type = impl // このメソッドはリフレクションのためにのみ必要です
}
```

## 委譲の提供 {id="providing-a-delegate"}

`provideDelegate` 演算子を定義することで、プロパティの実装が委譲されるオブジェクトを作成するためのロジックを拡張できます。`by` の右側で使用されるオブジェクトがメンバ関数または拡張関数として `provideDelegate` を定義している場合、その関数が呼び出されてプロパティ委譲インスタンスが作成されます。

`provideDelegate` の考えられるユースケースの一つは、プロパティの初期化時にその整合性をチェックすることです。

例えば、バインド前にプロパティ名をチェックするには、次のように記述できます：

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
        // 委譲を作成
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

`provideDelegate` のパラメータは `getValue` と同じです：

* `thisRef` は、**プロパティの所有者**と同じ型、またはそのスーパータイプである必要があります（拡張プロパティの場合、拡張される型である必要があります）。
* `property` は `KProperty<*>` 型またはそのスーパータイプである必要があります。

`provideDelegate` メソッドは `MyUI` インスタンスの作成中に各プロパティに対して呼び出され、即座に必要なバリデーションを実行します。

プロパティとその委譲の間のバインドをインターセプトするこの機能がない場合、同じ機能を実現するにはプロパティ名を明示的に渡す必要があり、あまり便利ではありません：

```kotlin
// "provideDelegate" 機能なしでプロパティ名をチェックする場合
class MyUI {
    val image by bindResource(ResourceID.image_id, "image")
    val text by bindResource(ResourceID.text_id, "text")
}

fun <T> MyUI.bindResource(
        id: ResourceID<T>,
        propertyName: String
): ReadOnlyProperty<MyUI, T> {
    checkProperty(this, propertyName)
    // 委譲を作成
}
```

生成されたコードでは、補助的な `prop$delegate` プロパティを初期化するために `provideDelegate` メソッドが呼び出されます。プロパティ宣言 `val prop: Type by MyDelegate()` に対して生成されたコードを、[上記](#translation-rules-for-delegated-properties)（`provideDelegate` メソッドが存在しない場合）の生成コードと比較してください：

```kotlin
class C {
    var prop: Type by MyDelegate()
}

// 'provideDelegate' 関数が利用可能な場合に
// コンパイラによって生成されるコード：
class C {
    // 追加の "delegate" プロパティを作成するために "provideDelegate" を呼び出す
    private val prop$delegate = MyDelegate().provideDelegate(this, this::prop)
    var prop: Type
        get() = prop$delegate.getValue(this, this::prop)
        set(value: Type) = prop$delegate.setValue(this, this::prop, value)
}
```

`provideDelegate` メソッドは補助プロパティの作成にのみ影響し、ゲッターやセッターのために生成されるコードには影響しないことに注意してください。

標準ライブラリの `PropertyDelegateProvider` インターフェースを使用すると、新しいクラスを作成せずに委譲プロバイダを作成できます。

```kotlin
val provider = PropertyDelegateProvider { thisRef: Any?, property ->
    ReadOnlyProperty<Any?, Int> {_, property -> 42 }
}
val delegate: Int by provider
```
