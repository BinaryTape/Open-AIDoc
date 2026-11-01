[//]: # (title: ジェネリクス: in、out、where)

Kotlin のクラスには、Java と同様に型パラメータを持たせることができます。

```kotlin
class Box<T>(t: T) {
    var value = t
}
```

このようなクラスのインスタンスを生成するには、型引数を指定するだけです。

```kotlin
val box: Box<Int> = Box<Int>(1)
```

コンストラクタの引数などからコンパイラが型引数を推論できる場合は、明示的に指定する必要はありません。

```kotlin
val box = Box(1) // 1 は Int 型なので、コンパイラはこれが Box<Int> であると推論します
```

## 変異性 (Variance) {id="variance"}

Java の型システムにおいて最も厄介な側面の 1 つがワイルドカード型です（[Java Generics FAQ](http://www.angelikalanger.com/GenericsFAQ/JavaGenericsFAQ.html) を参照してください）。
Kotlin にはワイルドカード型はありません。代わりに、Kotlin には宣言側変異性（declaration-site variance）と型プロジェクション（type projections）が用意されています。

### Java における変異性とワイルドカード {id="variance-and-wildcards-in-java"}

なぜ Java にこのような謎めいたワイルドカードが必要なのか考えてみましょう。まず、Java のジェネリック型は*不変（invariant）*です。
つまり、`List<String>` は `List<Object>` のサブタイプでは*ありません*。もし `List` が*不変*でなければ、Java の配列と変わらないものになっていたでしょう。次のコードはコンパイルに通ってしまいますが、実行時に例外が発生してしまいます。

```java
// Java
List<String> strs = new ArrayList<String>();

// Java はコンパイル時にここで型の不一致（type mismatch）を報告します。
List<Object> objs = strs;

// もし報告されなかったらどうなるでしょうか？
// String のリストに Integer を入れることができてしまいます。
objs.add(1);

// そして実行時に、Java は ClassCastException をスローします。
// ClassCastException: Integer cannot be cast to String
String s = strs.get(0); 
```

Java では実行時の安全性を保証するためにこのような操作を禁止しています。しかし、これにはトレードオフがあります。例えば、
`Collection` インターフェースの `addAll()` メソッドを考えてみましょう。このメソッドのシグネチャはどうなるでしょうか？直感的には、
次のように書きたくなるはずです。

```java
// Java
interface Collection<E> ... {
    void addAll(Collection<E> items);
}
```

しかしこれでは、（完全に安全であるにもかかわらず）次のような操作ができなくなってしまいます。

```java
// Java

// 素朴な addAll の宣言では、以下はコンパイルできません:
// Collection<String> は Collection<Object> のサブタイプではないため
void copyAll(Collection<Object> to, Collection<String> from) {
    to.addAll(from);
}
```

そのため、実際の `addAll()` のシグネチャは次のようになっています。

```java
// Java
interface Collection<E> ... {
    void addAll(Collection<? extends E> items);
}
```

*ワイルドカード型引数* `? extends E` は、このメソッドが単に `E` そのものだけでなく、`E` のオブジェクトのコレクション*または `E` のサブタイプのオブジェクトのコレクション*を受け入れることを示しています。つまり、items から安全に `E` を*読み取る*（このコレクションの要素は E のサブクラスのインスタンスであるため）ことはできますが、未知の `E` のサブタイプに準拠するオブジェクトが何かわからないため、コレクションへ*書き込むことはできません*。
この制約と引き換えに、望んでいた振る舞い（`Collection<String>` *は* `Collection<? extends Object>` のサブタイプである）が得られます。
言い換えれば、*extends* 境界（*上限境界*）を持つワイルドカードによって、その型は*共変（covariant）*になります。

これが機能する理由を理解するための鍵は非常にシンプルです。コレクションからアイテムを*取り出す*ことしかしないのであれば、
`String` のコレクションを使ってそこから `Object` を読み取っても問題ありません。逆に、コレクションへアイテムを*追加する*ことしかしないのであれば、
`Object` のコレクションに `String` を追加しても問題ありません。Java には `List<? super String>` があり、これは `String` またはそのスーパータイプを受け入れます。

後者は*反変（contravariance）*と呼ばれ、`List<? super String>` では `String` を引数に取るメソッドのみを呼び出すことができます
（例えば、`add(String)` や `set(int, String)` を呼び出すことができます）。`List<T>` で `T` を返すようなメソッドを呼び出した場合、
返ってくるのは `String` ではなく `Object` になります。

Joshua Bloch は著書『[Effective Java 第3版](http://www.oracle.com/technetwork/java/effectivejava-136174.html)』でこの問題をうまく説明しています
（項目31：「API の柔軟性を高めるために境界ワイルドカードを使用する」）。彼は、*読み取りのみを行う*オブジェクトを *Producer*（生産者）、
*書き込みのみを行う*オブジェクトを *Consumer*（消費者）と名付けました。そして次のように推奨しています。

>「最大限の柔軟性を得るために、Producer または Consumer を表す入力パラメータにはワイルドカード型を使用してください。」

そして彼は、次の記憶法（ニーモニック）を提唱しています。*PECS* は *Producer-Extends, Consumer-Super* の略です。

> Producer オブジェクト（例えば `List<? extends Foo>`）を使用する場合、そのオブジェクトに対して `add()` や `set()` を呼び出すことは許可されません。
> ただし、これはそのオブジェクトが*イミュータブル（不変）*であることを意味するわけではありません。例えば、`clear()` は引数を一切取らないため、
> リストからすべてのアイテムを削除するために `clear()` を呼び出すことを妨げるものは何もありません。
>
> ワイルドカード（またはその他の種類の変異性）によって保証される唯一のものは*型安全性*です。イミュータビリティ（不変性）とはまったく別の話です。
>
{style="note"}

### 宣言側変異性 (Declaration-site variance) {id="declaration-site-variance"}

パラメータとして `T` を取るメソッドを持たず、`T` を返すメソッドのみを持つジェネリックインターフェース `Source<T>` があると仮定しましょう。

```java
// Java
interface Source<T> {
    T nextT();
}
```

この場合、Consumer メソッドは呼び出されないため、`Source<String>` のインスタンスへの参照を `Source<Object>` 型の変数に格納することは完全に安全です。
しかし、Java はそれを認識せず、依然としてこれを禁止します。

```java
// Java
void demo(Source<String> strs) {
    Source<Object> objects = strs; // !!! Java では許可されません
    // ...
}
```

これを修正するには、`Source<? extends Object>` 型のオブジェクトを宣言する必要があります。しかし、以前と同じメソッドをすべて呼び出せるため、
型を複雑にしたところで何の価値も付加されておらず、このような宣言を行うことは無意味に感じられます。
しかし、コンパイラにはそれが分かりません。

Kotlin では、このようなことをコンパイラに伝える方法があります。これは*宣言側変異性（declaration-site variance）*と呼ばれます。
`Source` の*型パラメータ* `T` にアノテーションを付加することで、`Source<T>` のメンバーから `T` が*返される*（生産される）だけで、
決して消費されないことを保証できます。
これを行うには、`out` 修飾子を使用します。

```kotlin
interface Source<out T> {
    fun nextT(): T
}

fun demo(strs: Source<String>) {
    val objects: Source<Any> = strs // T は out パラメータであるため、これは問題ありません
    // ...
}
```

一般的なルールは次のとおりです。クラス `C` の型パラメータ `T` が `out` として宣言されている場合、それは `C` のメンバーの *out* の位置にのみ出現できますが、その代わりに `C<Base>` は安全に `C<Derived>` のスーパータイプとなることができます。

言い換えると、クラス `C` はパラメータ `T` に対して*共変（covariant）*である、または `T` は*共変*な型パラメータであると言えます。
`C` は `T` の *Producer* であり、`T` の *Consumer* ではないと考えることができます。

`out` 修飾子は*変異性アノテーション（variance annotation）*と呼ばれ、型パラメータの宣言箇所で指定されるため、*宣言側変異性*を提供します。
これは、型が使用される箇所のワイルドカードによって型を共変にする Java の*使用側変異性（use-site variance）*とは対照的です。

`out` に加えて、Kotlin は補完的な変異性アノテーションとして `in` を提供しています。これは型パラメータを*反変（contravariant）*にします。つまり、消費されるだけで生産されることはありません。反変な型の代表的な例は `Comparable` です。

```kotlin
interface Comparable<in T> {
    operator fun compareTo(other: T): Int
}

fun demo(x: Comparable<Number>) {
    x.compareTo(1.0) // 1.0 は Double 型であり、これは Number のサブタイプです
    // したがって、x を Comparable<Double> 型の変数に代入できます
    val y: Comparable<Double> = x // OK!
}
```

*in* と *out* という言葉は（C# でもすでに長い間うまく使われてきたため）自明であるように思われ、上述のニーモニックは実際には不要です。より高い抽象度で次のように言い換えることができます。

**[実存主義的（Existential）](https://en.wikipedia.org/wiki/Existentialism) 変換: Consumer は in、Producer は out！** :-)

## 型プロジェクション (Type projections) {id="type-projections"}

### 使用側変異性: 型プロジェクション {id="use-site-variance-type-projections"}

型パラメータ `T` を `out` として宣言し、使用箇所でのサブタイピングに関する問題を回避するのは非常に簡単ですが、一部のクラスは実際に `T` を返すことだけに制限するわけには*いきません*。
その典型的な例が `Array` です。

```kotlin
class Array<T>(val size: Int) {
    operator fun get(index: Int): T { ... }
    operator fun set(index: Int, value: T) { ... }
}
```

このクラスは、`T` に対して共変にも反変にもできません。そしてこれは一定の不便さをもたらします。次の関数を考えてみましょう。

```kotlin
fun copy(from: Array<Any>, to: Array<Any>) {
    assert(from.size == to.size)
    for (i in from.indices)
        to[i] = from[i]
}
```

この関数はある配列から別の配列へ要素をコピーすることを意図しています。これを実際に適用してみましょう。

```kotlin
val ints: Array<Int> = arrayOf(1, 2, 3)
val any = Array<Any>(3) { "" } 
copy(ints, any)
//   ^ 型は Array<Int> ですが、期待されていたのは Array<Any> です
```

ここで、おなじみの同じ問題に直面します。`Array<T>` は `T` に対して*不変（invariant）*であるため、`Array<Int>` も `Array<Any>` も互いのサブタイプではありません。なぜでしょうか？これもまた、`copy` が予期しない動作をする可能性があるからです。例えば、`from` に `String` を書き込もうとするかもしれず、そこに実際に `Int` の配列を渡していた場合、後で `ClassCastException` がスローされてしまいます。

`copy` 関数が `from` へ*書き込む*ことを禁止するには、次のようにします。

```kotlin
fun copy(from: Array<out Any>, to: Array<Any>) { ... }
```

これが*型プロジェクション（type projection）*です。これは、`from` が単なる配列ではなく、制限された（*投影された / projected*）配列であることを意味します。
型パラメータ `T` を返すメソッドのみを呼び出すことができ、この場合は `get()` のみを呼び出すことができることを意味します。
これが*使用側変異性（use-site variance）*に対する Kotlin のアプローチであり、Java の `Array<? extends Object>` に対応しながらも、よりシンプルになっています。

同様に、`in` を使用して型をプロジェクションすることもできます。

```kotlin
fun fill(dest: Array<in String>, value: String) { ... }
```

`Array<in String>` は Java の `Array<? super String>` に対応します。これは、`fill()` 関数に `String`、`CharSequence`、または `Object` の配列を渡すことができることを意味します。

### スタープロジェクション (Star-projections) {id="star-projections"}

型引数について何も知らないものの、安全な方法で使用したいという場合があります。
ここでの安全な方法とは、そのジェネリック型のすべての具象インスタンスがそのプロジェクションのサブタイプとなるような、ジェネリック型のプロジェクションを定義することです。

Kotlin はこのために、いわゆる*スタープロジェクション（star-projection）*構文を提供しています。

- 上限境界 `TUpper` を持つ共変な型パラメータ `T` を持つ `Foo<out T : TUpper>` の場合、`Foo<*>` は `Foo<out TUpper>` と等価です。これは、`T` が不明な場合、`Foo<*>` から `TUpper` の値を安全に*読み取る*ことができることを意味します。
- 反変な型パラメータ `T` を持つ `Foo<in T>` の場合、`Foo<*>` は `Foo<in Nothing>` と等価です。これは、`T` が不明な場合、`Foo<*>` に安全に*書き込む*ことができるものはないことを意味します。
- 上限境界 `TUpper` を持つ不変な型パラメータ `T` を持つ `Foo<T : TUpper>` の場合、`Foo<*>` は値の読み取りに関しては `Foo<out TUpper>` と等価であり、値の書き込みに関しては `Foo<in Nothing>` と等価です。

ジェネリック型に複数の型パラメータがある場合、それぞれを独立してプロジェクションできます。
例えば、型が `interface Function<in T, out U>` として宣言されている場合、次のようなスタープロジェクションを使用できます。

* `Function<*, String>` は `Function<in Nothing, String>` を意味します。
* `Function<Int, *>` は `Function<Int, out Any?>` を意味します。
* `Function<*, *>` は `Function<in Nothing, out Any?>` を意味します。

> スタープロジェクションは Java の raw 型（原型）に非常によく似ていますが、安全です。
>
{style="note"}

### キャプチャされた型 (Captured types) {id="captured-types"}

`out T` や `in T` などの型プロジェクションを使用すると、コンパイラは内部的に未知の具体的な型を [*captured type（キャプチャされた型）*](https://kotlinlang.org/spec/type-system.html#type-capturing) として表現します。キャプチャされた型とは、上限境界と下限境界が判明している未知の型のことです。

キャプチャされた型は非表記型（non-denotable）であるため、Kotlin コード内で直接記述することはできません。代わりに、`CapturedType(out X)` などのコンパイラ診断情報で最も頻繁に目にすることになります。例えば、次の型不一致の診断にはキャプチャされた型が含まれています。

```kotlin
val array: Array<out CharSequence> = arrayOf("str")
val item: Int = array.get(0)
// Initializer type mismatch: expected 'Int', actual 'CapturedType(out CharSequence)'
```

コンパイラは、読み取り操作にはキャプチャされた型の上限境界を使用し、書き込み操作にどの値が型安全であるかを判断するためにはその下限境界を使用します。

```kotlin
// プロジェクションされた型は Array<out CharSequence>
val array: Array<out CharSequence> = arrayOf("Kotlin")

// get() の読み取り操作は、キャプチャされた型の上限境界である CharSequence を使用します
val item = array.get(0)

// set() の書き込み操作は、キャプチャされた型の下限境界である Nothing を使用するため、
// エラーになります
array.set(0, "New value")
// Receiver type 'Array<out CharSequence>' contains out projection
// which prohibits the use of 'fun set(index: Int, value: T): Unit'
```

この例では以下のようになります。

* 変数 `array` はプロジェクションされた型 `Array<out CharSequence>` を持ちます。コンパイラは、プロジェクションされた型引数 `out CharSequence` を、上限境界を `CharSequence`、下限境界を `Nothing` とするキャプチャされた型として表現します。
* `get()` 操作では、コンパイラはキャプチャされた型をその上限境界である `CharSequence` に近似させ、`item` の型を `CharSequence` と推論します。
* `set()` 操作では、キャプチャされた型の下限境界は `Nothing` です。`Nothing` にはインスタンスが存在しないため、プロジェクションされた型への値の書き込みは型安全ではなく、エラーになります。

## ジェネリック関数 {id="generic-functions"}

型パラメータを持つことができる宣言はクラスだけではありません。関数も持つことができます。型パラメータは関数名の*前*に配置します。

```kotlin
fun <T> singletonList(item: T): List<T> {
    // ...
}

fun <T> T.basicToString(): String { // 拡張関数
    // ...
}
```

ジェネリック関数を呼び出すには、呼び出し箇所で関数名の*後*に型引数を指定します。

```kotlin
val l = singletonList<Int>(1)
```

文脈から推論できる場合は型引数を省略できるため、次の例も同様に機能します。

```kotlin
val l = singletonList(1)
```

## ジェネリック制約 (Generic constraints) {id="generic-constraints"}

特定の型パラメータに置き換えることができるすべての可能な型のセットは、*ジェネリック制約（generic constraints）*によって制限される場合があります。

### 上限境界 (Upper bounds) {id="upper-bounds"}

最も一般的な制約の種類は*上限境界（upper bound）*であり、これは Java の `extends` キーワードに対応します。

```kotlin
fun <T : Comparable<T>> sort(list: List<T>) {  ... }
```

コロンの後に指定された型が*上限境界*であり、`Comparable<T>` のサブタイプのみが `T` に代入可能であることを示します。例えば：

```kotlin
sort(listOf(1, 2, 3)) // OK。Int は Comparable<Int> のサブタイプです
sort(listOf(HashMap<Int, String>())) // エラー: HashMap<Int, String> は Comparable<HashMap<Int, String>> のサブタイプではありません
```

デフォルトの上限境界（指定されていない場合）は `Any?` です。山括弧内には 1 つの上限境界のみを指定できます。
同じ型パラメータに複数の上限境界が必要な場合は、個別の *where* 節が必要になります。

```kotlin
fun <T> copyWhenGreater(list: List<T>, threshold: T): List<String>
    where T : CharSequence,
          T : Comparable<T> {
    return list.filter { it > threshold }.map { it.toString() }
}
```

渡される型は、`where` 節のすべての条件を同時に満たす必要があります。上記の例では、`T` 型は `CharSequence` と `Comparable` の*両方*を実装していなければなりません。

## 明示的非null型 (Definitely non-nullable types) {id="definitely-non-nullable-types"}

ジェネリックな Java クラスやインターフェースとの相互運用を容易にするため、Kotlin はジェネリック型パラメータを**明示的非null（definitely non-nullable）**として宣言することをサポートしています。

ジェネリック型 `T` を明示的非nullとして宣言するには、`& Any` を付けて宣言します。例えば `T & Any` です。

明示的非null型は、null許容の[上限境界](#upper-bounds)を持っていなければなりません。

明示的非null型を宣言する最も一般的なユースケースは、引数に `@NotNull` を含む Java メソッドをオーバーライドする場合です。例えば、次の `load()` メソッドを考えてみましょう。

```java
import org.jetbrains.annotations.*;

public interface Game<T> {
    public T save(T x) {}
    @NotNull
    public T load(@NotNull T x) {}
}
```

Kotlin で `load()` メソッドを正常にオーバーライドするには、`T1` を明示的非nullとして宣言する必要があります。

```kotlin
interface ArcadeGame<T1> : Game<T1> {
    override fun save(x: T1): T1
    // T1 は明示的非nullです
    override fun load(x: T1 & Any): T1 & Any
}
```

Kotlin のみを扱う場合、Kotlin の型推論がこれを処理してくれるため、明示的非null型を明示的に宣言する必要が生じる可能性は低いです。

## 型消去 (Type erasure) {id="type-erasure"}

Kotlin がジェネリック宣言の使用に対して実行する型安全性チェックは、コンパイル時に行われます。
実行時には、ジェネリック型のインスタンスは実際の型引数に関する情報を保持していません。
この型情報は*消去（erased）*されていると言われます。例えば、`Foo<Bar>` と `Foo<Baz?>` のインスタンスは、単なる `Foo<*>` に消去されます。

### ジェネリクスの型チェックとキャスト {id="generics-type-checks-and-casts"}

型消去のため、実行時にジェネリック型のインスタンスが特定の型引数で生成されたかどうかをチェックする一般的な方法はなく、コンパイラは `ints is List<Int>` や `list is T`（型パラメータ）のような `is` チェックを禁止します。ただし、スタープロジェクションされた型に対してインスタンスをチェックすることはできます。

```kotlin
if (something is List<*>) {
    something.forEach { println(it) } // 要素は `Any?` 型として扱われます
}
```

同様に、インスタンスの型引数がすでに静的に（コンパイル時に）チェックされている場合は、型の非ジェネリック部分を含む `is` チェックやキャストを行うことができます。この場合、山括弧は省略されることに注意してください。

```kotlin
fun handleStrings(list: MutableList<String>) {
    if (list is ArrayList) {
        // `list` は `ArrayList<String>` にスマートキャストされます
    }
}
```

型引数を考慮しないキャストにも、型引数を省略した同じ構文を使用できます: `list as ArrayList`。

ジェネリック関数の呼び出しの型引数も、コンパイル時にのみチェックされます。関数本体の内部では、型パラメータを型チェックに使用することはできず、型パラメータへの型キャスト（`foo as T`）はチェックされません（unchecked）。
唯一の例外は、[具現化された型パラメータ（reified type parameters）](inline-functions.md#reified-type-parameters)を持つインライン関数です。この場合、各呼び出し箇所で実際の型引数がインライン展開されます。これにより、型パラメータに対する型チェックやキャストが可能になります。
ただし、チェックやキャストの内部で使用されるジェネリック型のインスタンスに対しては、上記で説明した制限が依然として適用されます。
例えば、`arg is T` という型チェックにおいて、`arg` 自体がジェネリック型のインスタンスである場合、その型引数は依然として消去されています。

```kotlin
//sampleStart
inline fun <reified A, reified B> Pair<*, *>.asPairOf(): Pair<A, B>? {
    if (first !is A || second !is B) return null
    return first as A to second as B
}

val somePair: Pair<Any?, Any?> = "items" to listOf(1, 2, 3)

val stringToSomething = somePair.asPairOf<String, Any>()
val stringToInt = somePair.asPairOf<String, Int>()
val stringToList = somePair.asPairOf<String, List<*>>()
val stringToStringList = somePair.asPairOf<String, List<String>>() // コンパイルは通りますが型安全性を破壊します！
// 詳細についてはサンプルを展開してください

//sampleEnd

fun main() {
    println("stringToSomething = " + stringToSomething)
    println("stringToInt = " + stringToInt)
    println("stringToList = " + stringToList)
    println("stringToStringList = " + stringToStringList)
    //println(stringToStringList?.second?.forEach() {it.length}) // リストの要素が String ではないため ClassCastException がスローされます
}
```
{kotlin-runnable="true"}

### 未検査キャスト (Unchecked casts) {id="unchecked-casts"}

`foo as List<String>` のように具象型引数を持つジェネリック型への型キャストは、実行時にチェックできません。  
これらの未検査キャスト（unchecked casts）は、上位レベルのプログラムロジックによって型安全性が暗示されているものの、コンパイラによって直接推論できない場合に使用できます。以下の例を参照してください。

```kotlin
fun readDictionary(file: File): Map<String, *> = file.inputStream().use { 
    TODO("文字列から任意の要素へのマッピングを読み取ります。")
}

// `Int` を含むマップをこのファイルに保存しました
val intsFile = File("ints.dictionary")

// 警告: 未検査キャスト: `Map<String, *>` から `Map<String, Int>` へのキャスト
val intsDictionary: Map<String, Int> = readDictionary(intsFile) as Map<String, Int>
```
最後の行のキャストに対して警告が表示されます。コンパイラは実行時にこれを完全にチェックすることができず、マップ内の値が `Int` であることを保証しません。

未検査キャストを回避するために、プログラム構造を再設計することができます。上記の例では、異なる型に対して型安全な実装を持つ `DictionaryReader<T>` インターフェースと `DictionaryWriter<T>` インターフェースを使用できます。適切な抽象化を導入することで、未検査キャストを呼び出し元から実装の詳細へと移すことができます。[ジェネリクスの変異性](#variance)を適切に使用することも役立ちます。

ジェネリック関数の場合、[具現化された型パラメータ](inline-functions.md#reified-type-parameters)を使用することで、`arg` の型が消去される*独自の*型引数を持っていない限り、`arg as T` のようなキャストをチェックされるものにできます。

未検査キャストの警告は、それが発生する文または宣言に `@Suppress("UNCHECKED_CAST")` を[アノテーション](annotations.md)することで抑制できます。

```kotlin
inline fun <reified T> List<*>.asListOfType(): List<T>? =
    if (all { it is T })
        @Suppress("UNCHECKED_CAST")
        this as List<T> else
        null
```

>**JVM において**: [配列型](arrays.md)（`Array<Foo>`）は、その要素の消去された型に関する情報を保持しており、配列型への型キャストは部分的にチェックされます。要素型のnull許容性と実際の型引数は依然として消去されます。例えば、キャスト `foo as Array<List<String>?>` は、`foo` が null 許容であるかどうかにかかわらず、任意の `List<*>` を保持する配列である場合に成功します。
>
{style="note"}

## 型引数のアンダースコア演算子 {id="underscore-operator-for-type-arguments"}

アンダースコア演算子 `_` は型引数に対して使用できます。他の型が明示的に指定されている場合に、引数の型を自動的に推論させるためにこれを使用します。

```kotlin
abstract class SomeClass<T> {
    abstract fun execute() : T
}

class SomeImplementation : SomeClass<String>() {
    override fun execute(): String = "Test"
}

class OtherImplementation : SomeClass<Int>() {
    override fun execute(): Int = 42
}

object Runner {
    inline fun <reified S: SomeClass<T>, T> run() : T {
        return S::class.java.getDeclaredConstructor().newInstance().execute()
    }
}

fun main() {
    // SomeImplementation は SomeClass<String> を継承しているため、T は String と推論されます
    val s = Runner.run<SomeImplementation, _>()
    assert(s == "Test")

    // OtherImplementation は SomeClass<Int> を継承しているため、T は Int と推論されます
    val n = Runner.run<OtherImplementation, _>()
    assert(n == 42)
}
```