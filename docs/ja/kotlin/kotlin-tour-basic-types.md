[//]: # (title: 基本型)

<no-index/>

Kotlin のすべての変数とデータ構造には型があります。型は、コンパイラに対してその変数やデータ構造で何を行うことが許可されているか、言い換えればどのような関数やプロパティを持っているかを伝えるため重要です。

前章の例では、Kotlin は `customers` の型が [`Int`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-int/) であると判断できました。型を**推論**する Kotlin の能力は**型推論**（type inference）と呼ばれます。`customers` には整数値が代入されています。これに基づいて、Kotlin は `customers` が数値型 `Int` を持っていると推論します。その結果、コンパイラは `customers` に対して算術演算を実行できることを認識します。

```kotlin
fun main() {
//sampleStart
    var customers = 10

    // 何人かの客が列を離れる
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

> `+=`、`-=`、`*=`、`/=`、および `%=` は累加代入演算子（augmented assignment operators）です。詳細については、[累加代入](operator-overloading.md#augmented-assignments)を参照してください。
> 
{style="tip"}

Kotlin には全体で以下の基本型があります。

| **カテゴリ**                                              | **基本型**                         | **コード例**                                                      |
|-----------------------------------------------------------|------------------------------------|-------------------------------------------------------------------|
| [整数](numbers.md#integer-types)                          | `Byte`, `Short`, `Int`, `Long`     | `val year: Int = 2020`<br/> `val amount: Long = 350_000_000`      |
| [符号なし整数](unsigned-integer-types.md)                 | `UByte`, `UShort`, `UInt`, `ULong` | `val score: UInt = 100u`                                          |
| [浮動小数点数](numbers.md#floating-point-types)           | `Float`, `Double`                  | `val currentTemp: Float = 24.5f`<br/> `val price: Double = 19.99` |
| [真偽値](booleans.md)                                     | `Boolean`                          | `val isEnabled: Boolean = true`                                   |
| [文字](characters.md)                                     | `Char`                             | `val separator: Char = ','`                                       |
| [文字列](strings.md)                                       | `String`                           | `val message: String = "Hello, world!"`                           |

基本型とそのプロパティの詳細については、[型の概要](types-overview.md)を参照してください。

この知識があれば、変数を宣言して後から初期化することができます。変数が最初に出現する（読み取られる）前に初期化されていれば、Kotlin はこれを処理できます。

変数を初期化せずに宣言するには、`:` を使用してその型を指定します。例えば：

```kotlin
fun main() {
//sampleStart
    // 初期化なしで変数を宣言
    val d: Int
    // 変数を初期化
    d = 3

    // 型を明示して変数を初期化
    val e: String = "hello"

    // 変数は初期化されているため読み取り可能
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
    
    // エラーが発生する
    println(d)
    // Variable 'd' must be initialized
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-basic-types-no-initialization" validate="false"}

基本型の宣言方法を理解できたので、次は[コレクション](kotlin-tour-collections.md)について学びましょう。

## 練習問題 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true">
<def title="変数の型を明示的に宣言する" id="basic-types-exercise-1">

各変数に対して適切な型を明示的に宣言してください：

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