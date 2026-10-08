[//]: # (title: インライン値クラス)

ドメイン固有の型を作成するために、値をクラスでラップすると便利な場合があります。しかし、これによって追加のヒープ割り当てが発生し、ランタイムのオーバーヘッドが生じます。さらに、ラップされた型がプリミティブである場合、パフォーマンスへの影響は顕著になります。プリミティブ型は通常、ランタイムによって高度に最適化されていますが、そのラッパーは特別な処理を受けられないためです。

これらの問題を解決するために、Kotlin は**インラインクラス**と呼ばれる特別な種類のクラスを導入しました。インラインクラスは、[値ベースクラス (value-based classes)](https://github.com/Kotlin/KEEP/blob/master/notes/value-classes.md) のサブセットです。これらは同一性（identity）を持たず、値のみを保持できます。

インラインクラスを宣言するには、クラス名の前に `value` 修飾子を使用します。

```kotlin
value class Password(private val s: String)
```

JVM バックエンド用にインラインクラスを宣言するには、クラス宣言の前に `value` 修飾子と `@JvmInline` アノテーションを使用します。

```kotlin
// JVM バックエンド用
@JvmInline
value class Password(private val s: String)
```

インラインクラスは、プライマリコンストラクタで初期化される単一のプロパティを持つ必要があります。ランタイムでは、インラインクラスのインスタンスはこの単一のプロパティを使用して表現されます（ランタイム表現の詳細については[以下](#representation)を参照してください）。

```kotlin
// 'Password' クラスの実際のインスタンス化は発生しない
// ランタイムでは 'securePassword' は単なる 'String' を保持する
val securePassword = Password("Don't try this in production") 
```

これがインラインクラスの主な機能であり、*インライン（inline）* という名前の由来でもあります。クラスのデータがその使用箇所に「インライン化」されます（[インライン関数](inline-functions.md)のコンテンツがコールサイトにインライン化されるのと同様です）。

## メンバ {id="members"}

インラインクラスは、通常のクラスの一部の機能をサポートしています。具体的には、プロパティや関数の宣言、`init` ブロック、[副コンストラクタ (secondary constructors)](classes.md#secondary-constructors) を持つことが許可されています。

```kotlin
@JvmInline
value class Person(private val fullName: String) {
    init {
        require(fullName.isNotEmpty()) {
            "Full name shouldn't be empty"
        }
    }

    constructor(firstName: String, lastName: String) : this("$firstName $lastName") {
        require(lastName.isNotBlank()) {
            "Last name shouldn't be empty"
        }
    }

    val length: Int
        get() = fullName.length

    fun greet() {
        println("Hello, $fullName")
    }
}

fun main() {
    val name1 = Person("Kotlin", "Mascot")
    val name2 = Person("Kodee")
    name1.greet() // `greet()` 関数は静的メソッドとして呼び出される
    println(name2.length) // プロパティのゲッターは静的メソッドとして呼び出される
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.9"}

インラインクラスのプロパティは [バッキングフィールド (backing fields)](properties.md#backing-fields) を持つことができません。シンプルな計算プロパティのみを持つことができます（`lateinit` や委譲プロパティは使用できません）。

## 継承 {id="inheritance"}

インラインクラスはインターフェースを継承することができます。

```kotlin
interface Printable {
    fun prettyPrint(): String
}

@JvmInline
value class Name(val s: String) : Printable {
    override fun prettyPrint(): String = "Let's $s!"
}

fun main() {
    val name = Name("Kotlin")
    println(name.prettyPrint()) // これも静的メソッドとして呼び出される
}
```

インラインクラスがクラス階層に参加することは禁止されています。つまり、インラインクラスが他のクラスを継承することはできず、常に `final` となります。

## 表現 (Representation) {id="representation"}

生成されたコードにおいて、Kotlin コンパイラは各インラインクラスの**ラッパー (wrapper)** を保持します。インラインクラスのインスタンスは、ランタイムにおいてラッパーまたは基礎となる型のいずれかとして表現されます。これは、`Int` がプリミティブの `int` またはラッパーの `Integer` のいずれかとして[表現](numbers.md#boxing-and-caching-numbers-on-the-jvm)されるのと似ています。

Kotlin コンパイラは、最もパフォーマンスが高く最適化されたコードを生成するために、ラッパーではなく基礎となる型を使用することを好みます。しかし、ラッパーを保持し続ける必要がある場合もあります。原則として、インラインクラスが別の型として使用される場合は常にボクシング（ラップ）されます。

```kotlin
interface I

@JvmInline
value class Foo(val i: Int) : I

fun asInline(f: Foo) {}
fun <T> asGeneric(x: T) {}
fun asInterface(i: I) {}
fun asNullable(i: Foo?) {}

fun <T> id(x: T): T = x

fun main() {
    val f = Foo(42) 
    
    asInline(f)    // アンボックス: Foo 自体として使用
    asGeneric(f)   // ボックス: ジェネリック型 T として使用
    asInterface(f) // ボックス: 型 I として使用
    asNullable(f)  // ボックス: Foo とは異なる Foo? として使用
    
    // 以下では、'f' はまず（'id' に渡される際に）ボックス化され、
    // 次に（'id' から返される際に）アンボックス化される。
    // 最終的に 'c' には 'f' と同様にアンボックス化された表現（単なる '42'）が含まれる。
    val c = id(f)  
}
```

インラインクラスは基礎となる値とラッパーの両方で表現される可能性があるため、[参照等価性 (referential equality)](equality.md#referential-equality) は意味をなさず、禁止されています。

インラインクラスは、基礎となる型としてジェネリック型パラメータを持つこともできます。この場合、コンパイラはそれを `Any?`、あるいは一般的には型パラメータの上限（upper bound）にマップします。

```kotlin
@JvmInline
value class UserId<T>(val value: T)

fun compute(s: UserId<String>) {} // コンパイラは fun compute-<hashcode>(s: Any?) を生成する
```

### マングリング (Mangling) {id="mangling"}

インラインクラスはその基礎となる型にコンパイルされるため、予期しないプラットフォームシグネチャの衝突など、さまざまな不明瞭なエラーが発生する可能性があります。

```kotlin
@JvmInline
value class UInt(val x: Int)

// JVM 上では 'public final void compute(int x)' として表現される
fun compute(x: Int) { }

// これも JVM 上では 'public final void compute(int x)' として表現される！
fun compute(x: UInt) { }
```

このような問題を軽減するために、インラインクラスを使用する関数は、関数名に安定したハッシュコードを追加することで**マングリング**されます。したがって、`fun compute(x: UInt)` は `public final void compute-<hashcode>(int x)` として表現され、衝突の問題が解決されます。

### Java コードからの呼び出し {id="calling-from-java-code"}

Java コードからインラインクラスを受け取る関数を呼び出すことができます。そのためには、マングリングを手動で無効にする必要があります。関数宣言の前に `@JvmName` アノテーションを追加します。

```kotlin
@JvmInline
value class UInt(val x: Int)

fun compute(x: Int) { }

@JvmName("computeUInt")
fun compute(x: UInt) { }
```

デフォルトでは、Kotlin はインラインクラスを**アンボックス化された表現**を使用してコンパイルするため、Java からアクセスするのが困難です。Java からアクセス可能な**ボックス化された表現**にインラインクラスをコンパイルする方法については、[Java から Kotlin を呼び出す](java-to-kotlin-interop.md#inline-value-classes) ガイドを参照してください。

## インラインクラスと型エイリアスの比較 {id="inline-classes-vs-type-aliases"}

一見すると、インラインクラスは[型エイリアス (type aliases)](type-aliases.md) に非常によく似ています。どちらも新しい型を導入するように見え、どちらもランタイムでは基礎となる型として表現されます。

しかし、決定的な違いは、型エイリアスは基礎となる型（および同じ基礎となる型を持つ他の型エイリアス）と**代入互換性 (assignment-compatible)** があるのに対し、インラインクラスはそうではないという点です。

言い換えれば、インラインクラスは真に「新しい」型を導入しますが、型エイリアスは既存の型の代替名（エイリアス）を導入するだけです。

```kotlin
typealias NameTypeAlias = String

@JvmInline
value class NameInlineClass(val s: String)

fun acceptString(s: String) {}
fun acceptNameTypeAlias(n: NameTypeAlias) {}
fun acceptNameInlineClass(p: NameInlineClass) {}

fun main() {
    val nameAlias: NameTypeAlias = ""
    val nameInlineClass: NameInlineClass = NameInlineClass("")
    val string: String = ""

    acceptString(nameAlias) // OK: 基礎となる型の代わりにエイリアスを渡せる
    acceptString(nameInlineClass) // エラー: 基礎となる型の代わりにインラインクラスは渡せない

    // 逆の場合:
    acceptNameTypeAlias(string) // OK: エイリアスの代わりに基礎となる型を渡せる
    acceptNameInlineClass(string) // エラー: インラインクラスの代わりに基礎となる型は渡せない
}
```

## インラインクラスと委譲 {id="inline-classes-and-delegation"}

インターフェースを使用する場合、インラインクラスのインライン化された値への委譲による実装が許可されています。

```kotlin
interface MyInterface {
    fun bar()
    fun foo() = "foo"
}

@JvmInline
value class MyInterfaceWrapper(val myInterface: MyInterface) : MyInterface by myInterface

fun main() {
    val my = MyInterfaceWrapper(object : MyInterface {
        override fun bar() {
            // body
        }
    })
    println(my.foo()) // "foo" を出力
}
```
