[//]: # (title: 基本型)

<no-index/>

Kotlinのすべての変数とデータ構造には型があります。型は、その変数やデータ構造に対して何を実行できるか、つまりどのような関数やプロパティを持っているかをコンパイラに伝えるため、非常に重要です。

前の章の例では、Kotlinは `customers` が [`Int`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-int/) 型であることを判断できました。
このように型を**推論**するKotlinの機能を**型推論**（type inference）と呼びます。`customers` には整数値が代入されています。このことから、Kotlinは `customers` が数値型である `Int` を持っていると推論します。その結果、コンパイラは `customers` に対して算術演算を実行できると認識します。

```kotlin
fun main() {
//sampleStart
    var customers = 10

    // 何人かの顧客が列を離れる
    customers = 8

    customers = customers + 3 // 加算の例: 11
    customers += 7            // 加算の例: 18
    customers -= 3            // 減算の例: 15
    customers *= 2            // 乗算の例: 30
    customers /= 3            // 除算の例: 10

    println(customers) // 10
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-basic-types-arithmetic"}

> `+=`、`-=`、`*=`、`/=`、`%=` は複合代入演算子（augmented assignment operator）です。詳細については、[複合代入](operator-overloading.md#augmented-assignments)を参照してください。
> 
{style="tip"}

Kotlinには、全体として以下の基本型があります。

| **カテゴリ**                                              | **基本型**                    | **サンプルコード**                                                  |
|-----------------------------------------------------------|------------------------------------|-------------------------------------------------------------------|
| [整数型](numbers.md#integer-types)                      | `Byte`, `Short`, `Int`, `Long`     | `val year: Int = 2020`<br/> `val amount: Long = 350_000_000`      |
| [符号なし整数型](unsigned-integer-types.md)            | `UByte`, `UShort`, `UInt`, `ULong` | `val score: UInt = 100u`                                          |
| [浮動小数点数型](numbers.md#floating-point-types) | `Float`, `Double`                  | `val currentTemp: Float = 24.5f`<br/> `val price: Double = 19.99` |
| [真偽値型](booleans.md)                                   | `Boolean`                          | `val isEnabled: Boolean = true`                                   |
| [文字型](characters.md)                               | `Char`                             | `val separator: Char = ','`                                       |
| [文字列型](strings.md)                                     | `String`                           | `val message: String = "Hello, world!"`                           |

基本型とそのプロパティに関する詳細については、[型の概要](types-overview.md)を参照してください。

この知識があれば、変数を宣言しておき、後で初期化することができます。変数への最初の読み取りアクセスが発生する前に初期化されていれば、Kotlinはこれを適切に処理できます。

初期化せずに変数を宣言するには、`:` を使って型を指定します。例えば以下のようになります。

```kotlin
fun main() {
//sampleStart
    // 初期化なしで変数を宣言
    val d: Int
    // 変数を初期化
    d = 3

    // 明示的に型を指定して初期化された変数
    val e: String = "hello"

    // 初期化されているため変数を読み取ることができる
    println(d) // 3
    println(e) // hello
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-basic-types-initialization"}

変数が読み取られる前に初期化されていない場合、エラーが発生します。

```kotlin
fun main() {
//sampleStart
    // 初期化なしで変数を宣言
    val d: Int
    
    // エラーを引き起こす
    println(d)
    // Variable 'd' must be initialized
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-basic-types-no-initialization" validate="false"}

基本型の宣言方法がわかったところで、次は[コレクション](kotlin-tour-collections.md)について学びましょう。

## 練習問題 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true">
<def title="変数に明示的な型を宣言する">

各変数に対して正しい型を明示的に宣言してください：

```kotlin
fun main() {
    val a: Int = 1000 
    val b = "log message"
    val c = 3.14
    val d = 100_000_000_000_000
    val e = false
    val f = '\n'
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-basic-types-exercise"}

```kotlin
fun main() {
    val a: Int = 1000
    val b: String = "log message"
    val c: Double = 3.14
    val d: Long = 100_000_000_000_000
    val e: Boolean = false
    val f: Char = '\n'
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-basic-types-solution"}

</def>
</deflist>

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-hello-world.md" mode="outline" icon="arrow-left" icon-position="left">前のステップ</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-collections.md" mode="classic" icon="arrow-right" icon-position="right">次のステップ</a>
  </li>
</list>