[//]: # (title: 関数型 \(SAM\) インターフェース)

1つだけ抽象メンバー関数を持つインターフェースは、*関数型インターフェース*（functional interface）または *Single Abstract Method (SAM) インターフェース* と呼ばれます。関数型インターフェースは複数の非抽象メンバー関数を持つことができますが、抽象メンバー関数は1つだけしか持てません。

Kotlinで関数型インターフェースを宣言するには、`fun` 修飾子を使用します。

```kotlin
fun interface KRunnable {
    fun invoke()
}
```

## SAM変換 {id="sam-conversions"}

関数型インターフェースに対しては、[ラムダ式](lambdas.md#lambda-expressions-and-anonymous-functions)を使用してコードをより簡潔で読みやすくするSAM変換を利用できます。

関数型インターフェースを実装するクラスを手動で作成する代わりに、ラムダ式を使用できます。SAM変換により、Kotlinはシグネチャがインターフェースの単一メソッドのシグネチャと一致する任意のラムダ式を、インターフェースの実装を動的にインスタンス化するコードへと変換できます。

例えば、以下のKotlinの関数型インターフェースを考えてみましょう。

```kotlin
fun interface IntPredicate {
    fun accept(i: Int): Boolean
}
```

SAM変換を使用しない場合、次のようなコードを書く必要があります。

```kotlin
// クラスのインスタンスを生成
val isEven = object : IntPredicate {
    override fun accept(i: Int): Boolean {
        return i % 2 == 0
    }
}
```

KotlinのSAM変換を活用することで、代わりに次のようなコードを書くことができます。

```kotlin
// ラムダを使用してインスタンスを生成
val isEven = IntPredicate { it % 2 == 0 }
```

短いラムダ式が、不要なコードをすべて置き換えます。

```kotlin
fun interface IntPredicate {
    fun accept(i: Int): Boolean
}

val isEven = IntPredicate { it % 2 == 0 }

fun main() {
    println("Is 7 even? - ${isEven.accept(7)}")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.4"}

[オブジェクト式](object-declarations.md#object-expressions)をSAM変換に置き換えると、オブジェクトの同一性（identity）が変わる可能性があります。オブジェクト式は評価されるたびに新しいインスタンスを作成しますが、SAM変換は新しいインスタンスを作成する場合もあれば、既存のインスタンスを再利用する場合もあります。したがって：

* 登録処理のたびになど、毎回別個のインスタンスが必要な場合は、オブジェクト式を使用するか、クラスのインスタンスを明示的に作成してください。
* リスナーの削除など、後で同じインスタンスを参照する必要がある場合は、それを変数に格納してください。

[Javaインターフェースに対するSAM変換](java-interop.md#sam-conversions)も使用できます。

### SAMパラメータへの呼び出し可能参照の受け渡し {id="pass-callable-references-to-sam-parameters"}

必要な振る舞いが既に名前付き関数として存在する場合、[呼び出し可能参照](lambdas.md#callable-reference)を渡すことができます。Kotlinは互換性のある呼び出し可能参照を、期待される関数型インターフェースに適応（adapt）させます。

```kotlin
fun interface Action {
    fun run()
}

fun execute(action: Action) {
    action.run()
}

fun start() {
    println("Run from a callable reference")
}

fun main() {
    // KotlinはラムダをActionインスタンスに変換する
    execute { start() }
    // Run from a callable reference

    // Kotlinは参照をActionインスタンスに適応させる
    execute(::start)
    // Run from a callable reference
}
```
{kotlin-runnable="true"}

`execute { start() }` 内のラムダは関数リテラルであるため、KotlinはSAM変換を使用して `Action` インスタンスを作成します。
`execute(::start)` において、`::start` は既存の `start()` 関数への呼び出し可能参照です。`execute()` は `Action` を期待しているため、コンパイラは `start()` を `Action.run()` の実装として使用する互換性のある `Action` インスタンスを作成します。このプロセスは *SAM適応（SAM adaptation）* と呼ばれます。

## コンストラクタ関数を持つインターフェースから関数型インターフェースへの移行 {id="migration-from-an-interface-with-constructor-function-to-a-functional-interface"}

1.6.20以降、Kotlinは関数型インターフェースのコンストラクタへの呼び出し可能参照をサポートしており、これにより、コンストラクタ関数を持つインターフェースから関数型インターフェースへソース互換性を保ちながら移行できるようになりました。
以下のコードを考えてみましょう。

```kotlin
interface Printer { 
    fun print() 
}

fun Printer(block: () -> Unit): Printer = object : Printer {
    override fun print() = block()
}
```

関数型インターフェースのコンストラクタへの呼び出し可能参照が有効になったことで、このコードは単に関数型インターフェースの宣言に置き換えることができます。

```kotlin
fun interface Printer { 
    fun print()
}
```

そのコンストラクタは暗黙的に作成され、`::Printer` 関数参照を使用しているすべてのコードがコンパイルされます。例えば：

```kotlin
documentsStorage.addPrinter(::Printer)
```

レガシーな `Printer` 関数に、`DeprecationLevel.HIDDEN` を指定した [`@Deprecated`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-deprecated/) アノテーションを付与することで、バイナリ互換性を維持します。

```kotlin
@Deprecated(message = "Your message about the deprecation", level = DeprecationLevel.HIDDEN)
fun Printer(...) {...}
```

## 関数型インターフェース vs. 型エイリアス {id="functional-interfaces-vs-type-aliases"}

関数型の[型エイリアス](type-aliases.md)を使用して、上記を単純に書き直すこともできます。

```kotlin
typealias IntPredicate = (i: Int) -> Boolean

val isEven: IntPredicate = { it % 2 == 0 }

fun main() {
    println("Is 7 even? - ${isEven(7)}")
}
```

しかし、関数型インターフェースと[型エイリアス](type-aliases.md)は異なる目的を持っています。
型エイリアスは既存の型に対する単なる名前にすぎず、新しい型を作成しませんが、関数型インターフェースは新しい型を作成します。特定の関数型インターフェースに特化した拡張関数を提供することで、通常の関数やその型エイリアスには適用できないようにすることが可能です。

型エイリアスは1つのメンバーしか持てませんが、関数型インターフェースは複数の非抽象メンバー関数と1つの抽象メンバー関数を持つことができます。また、関数型インターフェースは他のインターフェースを実装したり継承したりすることもできます。

関数型インターフェースは型エイリアスよりも柔軟で多くの機能を提供しますが、特定のインターフェースへの変換が必要になる場合があるため、構文的にも実行時にもコストが高くなる可能性があります。コード内でどちらを使用するかを選択する際は、要件を考慮してください。
* APIが特定のパラメータと戻り値の型を持つ関数（任意の関数）を受け取る必要がある場合：単純な関数型を使用するか、対応する関数型により短い名前を付けるために型エイリアスを定義します。
* APIが単なる関数よりも複雑なエンティティを受け取る場合（例えば、関数型のシグネチャでは表現できない自明でない規約や操作がある場合など）：そのための個別の関数型インターフェースを宣言します。