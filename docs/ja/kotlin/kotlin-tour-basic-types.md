[//]: # (title: 基本型)

<no-index/>

Kotlinのすべての変数とデータ構造には型があります。型は重要です。なぜなら、その変数やデータ構造に対して何ができるかをコンパイラに伝えるからです。言い換えれば、どのような関数やプロパティを持っているかを示します。

前章の例では、Kotlinは `customers` が [`Int`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-int/) 型であることを判断できました。Kotlinが型を**推論（infer）**するこの機能は、**型推論（type inference）**と呼ばれます。`customers` には整数値が代入されています。これにより、Kotlinは `customers` が数値型である `Int` であると推論します。その結果、コンパイラは `customers` に対して算術演算を実行できることを認識します。

```kotlin
fun main() {
//sampleStart
    var customers = 10

    // 一部の顧客が列を離れる
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

> `+=`、`-=`、`*=`、`/=`、`%=` は複合代入演算子（augmented assignment operators）です。詳細については、[複合代入（Augmented assignments）](operator-overloading.md#augmented-assignments)を参照してください。
> 
{style="tip"}

Kotlinには、主に以下の基本型があります。

| **カテゴリ**                                              | **基本型**                         | **サンプルコード**                                              |
|-----------------------------------------------------------|------------------------------------|---------------------------------------------------------------|
| [整数](numbers.md#integer-types)                      | `Byte`, `Short`, `Int`, `Long`     | `val year: Int = 2020`<br/> `val amount: Long = 350_000_000`      |
| [符号なし整数](unsigned-integer-types.md)            | `UByte`, `UShort`, `UInt`, `ULong` | `val score: UInt = 100u`                                      |
| [浮動小数点数](numbers.md#floating-point-types) | `Float`, `Double`                  | `val currentTemp: Float = 24.5f`<br/> `val price: Double = 19.99` |
| [論理値](booleans.md)                                   | `Boolean`                          | `val isEnabled: Boolean = true`                               |
| [文字](characters.md)                               | `Char`                             | `val separator: Char = ','`                                   |
| [文字列](strings.md)                                     | `String`                           | `val message: String = "Hello, world!"`                       |

基本型とそのプロパティの詳細については、[型の概要（Types overview）](types-overview.md)を参照してください。

この知識があれば、変数を宣言して後で初期化することができます。Kotlinでは、最初の読み取りが行われる前に変数が初期化されていれば、このような処理が可能です。

初期化せず変数を宣言するには、`:` を使ってその型を指定します。例えば以下のようになります。

```kotlin
fun main() {
//sampleStart
    // 初期化せずに宣言された変数
    val d: Int
    // 変数を初期化
    d = 3

    // 明示的に型指定され、初期化された変数
    val e: String = "hello"

    // 初期化されているため、変数を読み取ることができる
    println(d) // 3
    println(e) // hello
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-basic-types-initialization"}

読み取られる前に変数を初期化しないと、エラーが表示されます。

```kotlin
fun main() {
//sampleStart
    // 初期化せずに宣言された変数
    val d: Int
    
    // エラーを発生させる
    println(d)
    // Variable 'd' must be initialized （変数 'd' は初期化されている必要があります）
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-basic-types-no-initialization" validate="false"}

基本型の宣言方法がわかったところで、次は[コレクション](kotlin-tour-collections.md)について学びましょう。

## 練習問題 {completion-point="true"}

### エクササイズ {initial-collapse-state="collapsed" collapsible="true"}

各変数の正しい型を明示的に宣言してください。

|---|---|
```kotlin
fun main() {
    val a: Int = 1000 
    val b = "log message"
    val c = 3.14
    val d = 100_000_000_000_000
    val e = false
    val f = '
'
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-basic-types-exercise"}

|---|---|
```kotlin
fun main() {
    val a: Int = 1000
    val b: String = "log message"
    val c: Double = 3.14
    val d: Long = 100_000_000_000_000
    val e: Boolean = false
    val f: Char = '
'
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-basic-types-solution"}

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-hello-world.md" mode="outline" icon="arrow-left" icon-position="left">前のステップ</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-collections.md" mode="classic" icon="arrow-right" icon-position="right">次のステップ</a>
  </li>
</list>