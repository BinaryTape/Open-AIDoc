[//]: # (title: 関数型（SAM）インターフェース)

抽象メンバー関数を1つだけ持つインターフェースは、*関数型インターフェース*（functional interface）または*SAM（Single Abstract Method）インターフェース*と呼ばれます。関数型インターフェースは複数の非抽象メンバー関数を持つことができますが、抽象メンバー関数は1つだけでなければなりません。

Kotlinで関数型インターフェースを宣言するには、`fun` 修飾子を使用します。

```kotlin
fun interface KRunnable {
    fun invoke()
}
```

## SAM変換 {id="sam-conversions"}

関数型インターフェースでは、[ラムダ式](lambdas.md#lambda-expressions-and-anonymous-functions)を使用することでコードをより簡潔で読みやすくできるSAM変換が利用できます。

関数型インターフェースを手動で実装するクラスを作成する代わりに、ラムダ式を使用できます。SAM変換により、Kotlinはシグネチャがインターフェースの単一メソッドのシグネチャと一致する任意のラムダ式を、インターフェースの実装を動的にインスタンス化するコードへと変換できます。

例えば、次のKotlinの関数型インターフェースを考えてみましょう。

```kotlin
fun interface IntPredicate {
    fun accept(i: Int): Boolean
}
```

SAM変換を使用しない場合、次のようなコードを書く必要があります。

```kotlin
// クラスのインスタンスを作成
val isEven = object : IntPredicate {
    override fun accept(i: Int): Boolean {
        return i % 2 == 0
    }
}
```

KotlinのSAM変換を活用することで、代わりに次のような同等のコードを書くことができます。

```kotlin
// ラムダを使用してインスタンスを作成
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

[Javaインターフェースに対するSAM変換](java-interop.md#sam-conversions)を使用することもできます。

### SAMパラメータへの呼び出し可能参照の受け渡し {id="pass-callable-references-to-sam-parameters"}

必要な振る舞いがすでに名前付き関数として存在する場合、[呼び出し可能参照（callable reference）](lambdas.md#callable-reference)を渡すことができます。Kotlinは互換性のある呼び出し可能参照を、期待される関数型インターフェースへと適応させます。

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
    // KotlinがラムダをActionインスタンスに変換
    execute { start() }
    // Run from a callable reference

    // Kotlinが参照をActionインスタンスに適応
    execute(::start)
    // Run from a callable reference
}
```
{kotlin-runnable="true"}

`execute { start() }` のラムダは関数リテラルであるため、KotlinはSAM変換を使用して `Action` インスタンスを作成します。`execute(::start)` では、`::start` は既存の `start()` 関数への呼び出し可能参照です。`execute()` は `Action` を期待しているため、コンパイラは `Action.run()` の実装として `start()` を使用する互換性のある `Action` インスタンスを作成します。このプロセスは *SAM適応（SAM adaptation）* と呼ばれます。

## コンストラクタ関数を持つインターフェースから関数型インターフェースへの移行 {id="migration-from-an-interface-with-constructor-function-to-a-functional-interface"}

1.6.20以降、Kotlinは関数型インターフェースのコンストラクタへの呼び出し可能参照をサポートしており、コンストラクタ関数を持つインターフェースから関数型インターフェースへのソース互換性のある移行方法が追加されました。次のコードを考えてみましょう。

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

そのコンストラクタは暗黙的に作成され、`::Printer` 関数参照を使用するコードはすべてコンパイルされます。例えば：

```kotlin
documentsStorage.addPrinter(::Printer)
```

レガシーな `Printer` 関数を `DeprecationLevel.HIDDEN` を指定した [`@Deprecated`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-deprecated/) アノテーションでマークすることにより、バイナリ互換性を維持します。

```kotlin
@Deprecated(message = "Your message about the deprecation", level = DeprecationLevel.HIDDEN)
fun Printer(...) {...}
```

## 関数型インターフェース vs 型エイリアス {id="functional-interfaces-vs-type-aliases"}

上記のコードは、関数型に対する[型エイリアス](type-aliases.md)を使って単純に書き直すこともできます。

```kotlin
typealias IntPredicate = (i: Int) -> Boolean

val isEven: IntPredicate = { it % 2 == 0 }

fun main() {
    println("Is 7 even? - ${isEven(7)}")
}
```

しかし、関数型インターフェースと[型エイリアス](type-aliases.md)は異なる目的で使用されます。型エイリアスは既存の型に対する単なる名前にすぎず、新しい型を作成しませんが、関数型インターフェースは新しい型を作成します。通常の関数やその型エイリアスには適用されない、特定の関数型インターフェース専用の拡張を提供できます。

型エイリアスはメンバーを1つしか持てませんが、関数型インターフェースは複数の非抽象メンバー関数と1つの抽象メンバー関数を持つことができます。また、関数型インターフェースは他のインターフェースを実装・拡張することもできます。

関数型インターフェースは型エイリアスよりも柔軟で多くの機能を提供しますが、特定のインターフェースへの変換が必要になる場合があるため、構文的にも実行時にもコストが高くなる可能性があります。コードでどちらを使用するかを選択する際は、要件を考慮してください。
* APIが特定のパラメータと戻り値の型を持つ関数（任意の関数）を受け取る必要がある場合：単純な関数型を使用するか、対応する関数型により短い名前を付けるために型エイリアスを定義します。
* APIが関数よりも複雑なエンティティを受け取る場合（例えば、関数型のシグネチャでは表現できない自明でないコントラクトや操作が定義されている場合など）：それ用の個別の関数型インターフェースを宣言します。