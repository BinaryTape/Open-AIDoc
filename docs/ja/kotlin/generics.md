[//]: # (title: ジェネリクス: in, out, where)

Kotlinのクラスは、Javaと同じように型パラメータを持つことができます。

```kotlin
class Box<T>(t: T) {
    var value = t
}
```

このようなクラスのインスタンスを作成するには、単に型引数を指定します。

```kotlin
val box: Box<Int> = Box<Int>(1)
```

しかし、例えばコンストラクタの引数などからパラメータが推論できる場合は、型引数を省略することができます。

```kotlin
val box = Box(1) // 1はInt型なので、コンパイラはこれがBox<Int>であると判断します
```

## 変位 (Variance)

Javaの型システムにおいて最も厄介な側面の1つが、ワイルドカード型です（[Java Generics FAQ](http://www.angelikalanger.com/GenericsFAQ/JavaGenericsFAQ.html)を参照）。
Kotlinにはこれらがありません。代わりに、Kotlinには宣言区での変位（declaration-site variance）と型投影（type projections）があります。

### Javaにおける変位とワイルドカード

なぜJavaにこれらの謎めいたワイルドカードが必要なのか考えてみましょう。まず、Javaのジェネリック型は*不変（invariant）*です。
つまり、`List<String>` は `List<Object>` のサブタイプでは*ありません*。もし `List` が*不変*でなかったら、Javaの配列と大差ないものになっていたでしょう。というのも、以下のコードはコンパイルは通りますが、実行時に例外が発生してしまうからです。

```java
// Java
List<String> strs = new ArrayList<String>();

// Javaはここでコンパイル時に型不一致を報告します。
List<Object> objs = strs;

// もし報告されなかったら？
// StringのリストにIntegerを入れることができてしまいます。
objs.add(1);

// そして実行時に、Javaは例外をスローします。
// ClassCastException: Integer cannot be cast to String
String s = strs.get(0); 
```

Javaは実行時の安全性を保証するために、このような行為を禁止しています。しかし、これには影響があります。例えば、`Collection` インターフェースの `addAll()` メソッドを考えてみましょう。このメソッドのシグネチャはどうあるべきでしょうか？直感的には、次のように書くでしょう。

```java
// Java
interface Collection<E> ... {
    void addAll(Collection<E> items);
}
```

しかしこれでは、次のような操作（これは完全に安全です）ができなくなってしまいます。

```java
// Java

// addAllの素朴な宣言では、以下はコンパイルされません。
// Collection<String> は Collection<Object> のサブタイプではないためです。
void copyAll(Collection<Object> to, Collection<String> from) {
    to.addAll(from);
}
```

そのため、実際の `addAll()` のシグネチャは以下のようになっています。

```java
// Java
interface Collection<E> ... {
    void addAll(Collection<? extends E> items);
}
```

*ワイルドカード型引数* `? extends E` は、このメソッドが `E` 自体だけでなく、`E` *またはそのサブタイプ*のオブジェクトのコレクションを受け入れることを示しています。これは、itemsから安全に `E` を*読み取る*ことができる（このコレクションの要素はEのサブクラスのインスタンスであるため）一方で、その `E` の未知のサブタイプにどのオブジェクトが適合するか分からないため、そこへ*書き込むことはできない*ことを意味します。
この制限と引き換えに、望ましい動作が得られます。すなわち、`Collection<String>` は `Collection<? extends Object>` のサブタイプに*なる*のです。
言い換えれば、*extends*境界（上界）を持つワイルドカードは、型を*共変（covariant）*にします。

これがなぜ機能するのかを理解する鍵は極めてシンプルです。もしコレクションからアイテムを*取り出す*ことしかしないのであれば、`String` のコレクションを使ってそこから `Object` を読み取っても問題ありません。逆に、コレクションにアイテムを*入れる*ことしかしないのであれば、`Object` のコレクションを受け取ってそこに `String` を入れるのは問題ありません。Javaには `List<? super String>` があり、これは `String` またはその任意のスーパータイプを受け入れます。

後者は*反変（contravariant）*と呼ばれ、`List<? super String>` に対しては `String` を引数に取るメソッドのみを呼び出すことができます（例えば、`add(String)` や `set(int, String)` を呼び出すことができます）。`List<T>` において `T` を返すものを呼び出した場合、得られるのは `String` ではなく `Object` になります。

Joshua Blochは、著書『[Effective Java 第3版](http://www.oracle.com/technetwork/java/effectivejava-136174.html)』の中で、この問題をうまく説明しています（項目31：「APIの柔軟性を高めるために境界ワイルドカードを使用する」）。彼は、*読み取り*専用のオブジェクトを「プロデューサー（Producer）」、*書き込み*専用のオブジェクトを「コンシューマー（Consumer）」と名付け、次のように推奨しています。

> 「柔軟性を最大化するには、プロデューサーまたはコンシューマーを表す入力パラメータにワイルドカード型を使用しなさい。」

そして、彼は次のような記憶術（覚え方）を提案しています。*PECS* は *Producer-Extends, Consumer-Super* の略です。

> プロデューサー・オブジェクト、例えば `List<? extends Foo>` を使用する場合、このオブジェクトに対して `add()` や `set()` を呼び出すことは許可されませんが、これはそのオブジェクトが*不変（immutable）*であることを意味するわけではありません。例えば、`clear()` は引数を一切取らないため、リストからすべてのアイテムを削除するために `clear()` を呼び出すことを妨げるものは何もありません。
>
> ワイルドカード（または他の種類の変位）によって保証される唯一のことは、*型安全性*です。不変性は全く別の話です。
>
{style="note"}

### 宣言区での変位 (Declaration-site variance)

`T` をパラメータとして受け取るメソッドを持たず、`T` を返すメソッドのみを持つジェネリックインターフェース `Source<T>` があると仮定しましょう。

```java
// Java
interface Source<T> {
    T nextT();
}
```

この場合、`Source<String>` のインスタンスへの参照を `Source<Object>` 型の変数に格納することは完全に安全です。呼び出すべきコンシューマー・メソッドが存在しないからです。しかし、Javaはこれを知らず、依然としてそれを禁止します。

```java
// Java
void demo(Source<String> strs) {
    Source<Object> objects = strs; // !!! Javaでは許可されません
    // ...
}
```

これを修正するには、`Source<? extends Object>` 型のオブジェクトを宣言する必要があります。しかし、これを行うことはあまり意味がありません。なぜなら、そのような変数に対しても以前と同じメソッドをすべて呼び出すことができるため、複雑な型にすることによる付加価値がないからです。しかし、コンパイラはそれを知りません。

Kotlinでは、このようなことをコンパイラに伝える方法があります。これは*宣言区での変位（declaration-site variance）*と呼ばれます。`Source` の*型パラメータ* `T` にアノテーションを付けて、それが `Source<T>` のメンバから*返される*（生産される）だけで、決して消費されないことを保証できます。
これを行うには、`out` 修飾子を使用します。

```kotlin
interface Source<out T> {
    fun nextT(): T
}

fun demo(strs: Source<String>) {
    val objects: Source<Any> = strs // Tがoutパラメータなので、これはOKです
    // ...
}
```

一般的なルールは次のとおりです。クラス `C` の型パラメータ `T` が `out` と宣言されている場合、それは `C` のメンバの中で *out* ポジションにのみ現れることができますが、その代わりに `C<Base>` は安全に `C<Derived>` のスーパータイプになることができます。

言い換えれば、クラス `C` はパラメータ `T` に対して*共変*である、あるいは `T` は*共変*な型パラメータである、と言うことができます。`C` は `T` の*プロデューサー*であり、`T` の*コンシューマー*では「ない」と考えることができます。

`out` 修飾子は*変位アノテーション（variance annotation）*と呼ばれ、型パラメータの宣言箇所で提供されるため、*宣言区での変位*を提供します。
これは、型を使用する際のワイルドカードによって型を共変にするJavaの*使用区での変位（use-site variance）*とは対照的です。

`out` に加えて、Kotlinは補完的な変位アノテーションとして `in` を提供しています。これは型パラメータを*反変（contravariant）*にします。つまり、その型は消費されることしかできず、生産されることはありません。反変な型の良い例は `Comparable` です。

```kotlin
interface Comparable<in T> {
    operator fun compareTo(other: T): Int
}

fun demo(x: Comparable<Number>) {
    x.compareTo(1.0) // 1.0はDouble型であり、これはNumberのサブタイプです
    // したがって、xをComparable<Double>型の変数に代入できます
    val y: Comparable<Double> = x // OK!
}
```

*in* と *out* という言葉は（C#ですでに長い間成功裏に使用されているように）それ自体で説明がつくように思われるため、前述の記憶術は実際には必要ありません。実際、それはより高い抽象化レベルで言い換えることができます。

**[実存的](https://ja.wikipedia.org/wiki/%E5%AE%9F%E5%AD%98%E4%B8%BB%E7%BE%A9)な転換: Consumerはin、Producerはout!** :-)

## 型投影 (Type projections)

### 使用区での変位: 型投影

型パラメータ `T` を `out` と宣言し、使用区でのサブタイピングに関するトラブルを避けるのは非常に簡単ですが、一部のクラスは実際には `T` を返すことだけに制限することが*できません*！
その良い例が `Array` です。

```kotlin
class Array<T>(val size: Int) {
    operator fun get(index: Int): T { ... }
    operator fun set(index: Int, value: T) { ... }
}
```

このクラスは `T` に対して共変でも反変でもありません。そして、これが特定の不便さを強いることになります。次の関数を考えてみましょう。

```kotlin
fun copy(from: Array<Any>, to: Array<Any>) {
    assert(from.size == to.size)
    for (i in from.indices)
        to[i] = from[i]
}
```

この関数は、ある配列から別の配列へアイテムをコピーすることを目的としています。これを実際に適用してみましょう。

```kotlin
val ints: `Array<Int>` = arrayOf(1, 2, 3)
val any = Array<Any>(3) { "" } 
copy(ints, any)
//   ^ 型は `Array<Int>` ですが、Array<Any> が期待されています
```

ここで、おなじみの問題に直面します。`Array<T>` は `T` に対して*不変*であるため、`Array<Int>` と `Array<Any>` のどちらも他方のサブタイプではありません。なぜでしょうか？繰り返しになりますが、それは `copy` が予期しない動作をする可能性があるからです。例えば、`from` に `String` を書き込もうとするかもしれません。もしそこに実際に `Int` の配列を渡していたら、後で `ClassCastException` がスローされることになります。

`copy` 関数が `from` に*書き込む*ことを禁止するには、次のようにします。

```kotlin
fun copy(from: Array<out Any>, to: Array<Any>) { ... }
```

これは*型投影（type projection）*であり、`from` が単なる配列ではなく、制限された（*投影された*）ものであることを意味します。型パラメータ `T` を返すメソッドのみを呼び出すことができます。この場合、`get()` のみを呼び出すことができます。これがKotlinにおける*使用区での変位*へのアプローチであり、Javaの `Array<? extends Object>` に対応しますが、よりシンプルになっています。

`in` を使って型を投影することもできます。

```kotlin
fun fill(dest: Array<in String>, value: String) { ... }
```

`Array<in String>` は Java の `Array<? super String>` に対応します。これは、`fill()` 関数に `String` の配列、`CharSequence` の配列、または `Object` の配列を渡せることを意味します。

### スター投影 (Star-projections)

型引数について何も知らないが、それでも安全な方法でそれを使用したい場合があります。
ここでの安全な方法とは、そのジェネリック型のすべての具体的なインスタンス化が、その投影のサブタイプになるような、ジェネリック型の投影を定義することです。

Kotlinは、このためにいわゆる*スター投影*構文を提供しています。

- `Foo<out T : TUpper>`（`T` は上界 `TUpper` を持つ共変な型パラメータ）において、`Foo<*>` は `Foo<out TUpper>` と同等です。これは、`T` が不明な場合でも、`Foo<*>` から `TUpper` の値を安全に*読み取る*ことができることを意味します。
- `Foo<in T>`（`T` は反変な型パラメータ）において、`Foo<*>` は `Foo<in Nothing>` と同等です。これは、`T` が不明な場合、`Foo<*>` に安全に*書き込める*ものは何もないことを意味します。
- `Foo<T : TUpper>`（`T` は上界 `TUpper` を持つ不変な型パラメータ）において、`Foo<*>` は、値を読み取る場合は `Foo<out TUpper>` と同等であり、値を書き込む場合は `Foo<in Nothing>` と同等です。

ジェネリック型が複数の型パラメータを持つ場合、それぞれを独立して投影できます。
例えば、型が `interface Function<in T, out U>` と宣言されている場合、次のようなスター投影を使用できます。

* `Function<*, String>` は `Function<in Nothing, String>` を意味します。
* `Function<Int, *>` は `Function<Int, out Any?>` を意味します。
* `Function<*, *>` は `Function<in Nothing, out Any?>` を意味します。

> スター投影はJavaの生型（raw types）に非常によく似ていますが、安全です。
>
{style="note"}

## ジェネリック関数

クラスだけでなく、関数も型パラメータを持つことができます。型パラメータは関数の名前の*前*に置かれます。

```kotlin
fun <T> singletonList(item: T): `List<T>` {
    // ...
}

fun <T> T.basicToString(): String { // 拡張関数
    // ...
}
```

ジェネリック関数を呼び出すには、呼び出し側で関数の名前の*後*に型引数を指定します。

```kotlin
val l = singletonList<Int>(1)
```

型引数がコンテキストから推論できる場合は省略可能です。したがって、次の例も動作します。

```kotlin
val l = singletonList(1)
```

## ジェネリック制約 (Generic constraints)

特定の型パラメータに代入できるすべての可能な型のセットは、*ジェネリック制約*によって制限される場合があります。

### 上界 (Upper bounds)

最も一般的な制約の種類は*上界*であり、これは Java の `extends` キーワードに対応します。

```kotlin
fun <T : Comparable<T>> sort(list: List<T>) {  ... }
```

コロンの後に指定された型が*上界*であり、`Comparable<T>` のサブタイプのみを `T` に代入できることを示しています。例えば：

```kotlin
sort(listOf(1, 2, 3)) // OK. IntはComparable<Int>のサブタイプです
sort(listOf(HashMap<Int, String>())) // エラー: HashMap<Int, String>はComparable<HashMap<Int, String>>のサブタイプではありません
```

デフォルトの上界（指定されていない場合）は `Any?` です。山括弧内には1つの上界のみを指定できます。
同じ型パラメータに複数の上界が必要な場合は、別の *where* 句が必要です。

```kotlin
fun <T> copyWhenGreater(list: List<T>, threshold: T): List<String>
    where T : CharSequence,
          T : Comparable<T> {
    return list.filter { it > threshold }.map { it.toString() }
}
```

渡される型は、`where` 句のすべての条件を同時に満たす必要があります。上記の例では、`T` 型は `CharSequence` と `Comparable` の*両方*を実装している必要があります。

## 明示的な非 null 型 (Definitely non-nullable types)

ジェネリックなJavaクラスやインターフェースとの相互運用を容易にするために、Kotlinはジェネリック型パラメータを**明示的な非 null 型**として宣言することをサポートしています。

ジェネリック型 `T` を明示的な非 null 型として宣言するには、型を `& Any` で宣言します。例: `T & Any`。

明示的な非 null 型は、null 許容な[上界](#上界-upper-bounds)を持っている必要があります。

明示的な非 null 型を宣言する最も一般的なユースケースは、引数に `@NotNull` を含む Java メソッドをオーバーライドする場合です。例えば、次の `load()` メソッドを考えてみましょう。

```java
import org.jetbrains.annotations.*;

public interface Game<T> {
    public T save(T x) {}
    @NotNull
    public T load(@NotNull T x) {}
}
```

Kotlinで `load()` メソッドを正常にオーバーライドするには、`T1` を明示的な非 null 型として宣言する必要があります。

```kotlin
interface ArcadeGame<T1> : Game<T1> {
    override fun save(x: T1): T1
    // T1は明示的な非 null 型
    override fun load(x: T1 & Any): T1 & Any
}
```

Kotlinのみで作業している場合、Kotlinの型推論がこれを行ってくれるため、明示的な非 null 型を明示的に宣言する必要があることはほとんどありません。

## 型消去 (Type erasure)

Kotlinがジェネリック宣言の使用に対して行う型安全性チェックは、コンパイル時に行われます。
実行時には、ジェネリック型のインスタンスは実際の型引数に関する情報を保持していません。
型情報は*消去（erased）*されると言われます。例えば、`Foo<Bar>` と `Foo<Baz?>` のインスタンスは、どちらも単に `Foo<*>` として消去されます。

### ジェネリクスの型チェックとキャスト

型消去のため、実行時にジェネリック型のインスタンスが特定の型引数で作成されたかどうかを確認する一般的な方法はありません。そのため、コンパイラは `ints is List<Int>` や `list is T`（型パラメータ）のような `is` チェックを禁止しています。ただし、スター投影された型に対してインスタンスをチェックすることはできます。

```kotlin
if (something is List<*>) {
    something.forEach { println(it) } // アイテムは `Any?` 型として扱われます
}
```

同様に、インスタンスの型引数がすでに（コンパイル時に）静的にチェックされている場合は、型の非ジェネリック部分を含む `is` チェックやキャストを行うことができます。この場合、山括弧は省略されることに注意してください。

```kotlin
fun handleStrings(list: MutableList<String>) {
    if (list is ArrayList) {
        // `list` は `ArrayList<String>` にスマートキャストされます
    }
}
```

型引数を考慮しないキャストにも、型引数を省略した同じ構文を使用できます： `list as ArrayList`。

ジェネリック関数の呼び出しの型引数も、コンパイル時にのみチェックされます。関数本体の内部では、型パラメータを型チェックに使用することはできず、型パラメータへの型キャスト（`foo as T`）はチェックされません。
唯一の例外は、[実体化された型パラメータ](inline-functions.md#reified-type-parameters)（reified type parameters）を持つインライン関数です。これらは各呼び出し箇所で実際の型引数がインライン化されます。これにより、型パラメータに対する型チェックとキャストが可能になります。
ただし、チェックやキャストの内部で使用されるジェネリック型のインスタンスには、前述の制限が依然として適用されます。
例えば、型チェック `arg is T` において、`arg` 自体がジェネリック型のインスタンスである場合、その型引数は依然として消去されています。

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
val stringToStringList = somePair.asPairOf<String, List<String>>() // コンパイルは通りますが、型安全性が壊れます！
// 詳細についてはサンプルを展開してください

//sampleEnd

fun main() {
    println("stringToSomething = " + stringToSomething)
    println("stringToInt = " + stringToInt)
    println("stringToList = " + stringToList)
    println("stringToStringList = " + stringToStringList)
    //println(stringToStringList?.second?.forEach() {it.length}) // リストの要素がStringではないため、ClassCastExceptionをスローします
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### チェックされないキャスト (Unchecked casts)

`foo as List<String>` のような具体的な型引数を持つジェネリック型への型キャストは、実行時にチェックできません。
これらのチェックされないキャストは、高レベルのプログラムロジックによって型安全性が暗示されているものの、コンパイラによって直接推論できない場合に使用できます。以下の例を参照してください。

```kotlin
fun readDictionary(file: File): Map<String, *> = file.inputStream().use { 
    TODO("文字列から任意の要素へのマッピングを読み込む。")
}

// このファイルに `Int` を含むマップを保存したとします
val intsFile = File("ints.dictionary")

// 警告: Unchecked cast: `Map<String, *>` to `Map<String, Int>`
val intsDictionary: Map<String, Int> = readDictionary(intsFile) as Map<String, Int>
```
最後の行のキャストに対して警告が表示されます。コンパイラは実行時にこれを完全にチェックすることはできず、マップ内の値が `Int` であることを保証しません。

チェックされないキャストを避けるために、プログラム構造を再設計することができます。上記の例では、異なる型に対して型安全な実装を持つ `DictionaryReader<T>` および `DictionaryWriter<T>` インターフェースを使用できます。妥当な抽象化を導入することで、呼び出し側から実装の詳細へとチェックされないキャストを移動させることができます。[ジェネリックの変位](#変位-variance)を適切に使用することも役立ちます。

ジェネリック関数の場合、[実体化された型パラメータ](inline-functions.md#reified-type-parameters)を使用すると、`arg` の型が*それ自体*消去された型引数を持っていない限り、`arg as T` のようなキャストをチェックできるようになります。

チェックされないキャストの警告は、それが発生する文または宣言に `@Suppress("UNCHECKED_CAST")` を[アノテーション](annotations.md)することで抑制できます。

```kotlin
inline fun <reified T> List<*>.asListOfType(): List<T>? =
    if (all { it is T })
        @Suppress("UNCHECKED_CAST")
        this as `List<T>` else
        null
```

>**JVMにおいて**: [配列型](arrays.md)（`Array<Foo>`）は要素の消去された型に関する情報を保持しており、配列型への型キャストは部分的にチェックされます。要素型の null 許容性と実際の型引数は依然として消去されています。例えば、`foo as Array<List<String>?>` というキャストは、`foo` が null 許容かどうかに関わらず、任意の `List<*>` を保持する配列であれば成功します。
>
{style="note"}

## 型引数のアンダースコア演算子

型引数にアンダースコア演算子 `_` を使用できます。他の型が明示的に指定されている場合に、引数の型を自動的に推論させるために使用します。

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
    // SomeImplementationがSomeClass<String>を継承しているため、TはStringと推論されます
    val s = Runner.run<SomeImplementation, _>()
    assert(s == "Test")

    // OtherImplementationがSomeClass<Int>を継承しているため、TはIntと推論されます
    val n = Runner.run<OtherImplementation, _>()
    assert(n == 42)
}