.

テンプレート式の中でコードの一部を評価するには、ドル記号 $ の後のコードを波括弧 `{}` で囲みます。

例：

```kotlin
fun main() { 
//sampleStart
    val customers = 10
    println("There are $customers customers")
    // There are 10 customers
    
    println("There are ${customers + 1} customers")
    // There are 11 customers
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-string-templates"}

詳細については、[String templates](strings.md#string-templates) を参照してください。

変数に対して型が宣言されていないことに気づくでしょう。Kotlin は型自体を推論しました：`Int`。このツアーの[次の章](kotlin-tour-basic-types.md)では、Kotlin のさまざまな基本型と、それらの宣言方法について説明します。

## 練習 (Practice) {completion-point="true"}

### 演習 {initial-collapse-state="collapsed" collapsible="true"}

プログラムが標準出力に `"Mary is 20 years old"` と出力するようにコードを完成させてください：

|---|---|
```kotlin
fun main() {
    val name = "Mary"
    val age = 20
    // ここにコードを書いてください
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-hello-world-exercise"}

|---|---|
```kotlin
fun main() {
    val name = "Mary"
    val age = 20
    println("$name is $age years old")
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-hello-world-solution"}

<seealso></seealso>

<list id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-basic-types.md" mode="classic" icon="arrow-right" icon-position="right">次のステップ</a>
  </li>
</list>