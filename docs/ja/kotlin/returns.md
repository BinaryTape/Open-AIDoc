[//]: # (title: リターンとジャンプ)

Kotlinには、3つの構造化ジャンプ式があります。

* `return`: デフォルトでは、最も近い外側の関数または[無名関数](lambdas.md#anonymous-functions)からリターンします。
* `break`: 最も近い外側のループを終了します。
* `continue`: 最も近い外側のループの次のステップに進みます。

これらすべての式は、より大きな式の一部として使用できます。

```kotlin
val s = person.name ?: return
```

これらの式の型は [Nothing 型](exceptions.md#the-nothing-type) です。

## break と continue のラベル {id="break-and-continue-labels"}

Kotlinの任意の式には、*ラベル*を付けることができます。
ラベルは `abc@` や `fooBar@` のように、識別子の後に `@` 記号が付く形式をとります。
式にラベルを付けるには、その式の前にラベルを追加するだけです。

```kotlin
loop@ for (i in 1..100) {
    // ...
}
```

これで、ラベルで修飾した `break` や `continue` を使用できるようになります。

```kotlin
loop@ for (i in 1..100) {
    for (j in 1..100) {
        if (...) break@loop
    }
}
```

ラベルで修飾された `break` は、そのラベルが付いたループの直後の実行ポイントへジャンプします。
ラベルで修飾された `continue` は、そのループの次のイテレーションへ進みます。

> 場合によっては、明示的にラベルを定義することなく、*非ローカル*（non-locally）に `break` や `continue` を適用できます。
> このような非ローカルでの使用は、それを囲む[インライン関数](inline-functions.md#break-and-continue)内で使用されるラムダ式で有効です。
>
{style="note"}

## ラベルへのリターン {id="return-to-labels"}

Kotlinでは、関数リテラル、ローカル関数、オブジェクト式を使用して関数をネストできます。
修飾された `return` を使用すると、外側の関数からリターンすることができます。

最も重要なユースケースは、ラムダ式からのリターンです。ラムダ式からリターンするには、ラムダ式にラベルを付け、`return` を修飾します。

```kotlin
//sampleStart
fun foo() {
    listOf(1, 2, 3, 4, 5).forEach lit@{
        if (it == 3) return@lit // ラムダの呼び出し元（forEach ループ）へのローカルリターン
        print(it)
    }
    print(" done with explicit label")
}
//sampleEnd

fun main() {
    foo()
}
```
{kotlin-runnable="true"}

これで、ラムダ式からのみリターンするようになります。多くの場合、*暗黙のラベル*を使用する方が便利です。そのようなラベルは、ラムダが渡される関数と同じ名前を持つためです。

```kotlin
//sampleStart
fun foo() {
    listOf(1, 2, 3, 4, 5).forEach {
        if (it == 3) return@forEach // ラムダの呼び出し元（forEach ループ）へのローカルリターン
        print(it)
    }
    print(" done with implicit label")
}
//sampleEnd

fun main() {
    foo()
}
```
{kotlin-runnable="true"}

あるいは、ラムダ式を[無名関数](lambdas.md#anonymous-functions)に置き換えることもできます。
無名関数内の `return` 文は、その無名関数自体からリターンします。

```kotlin
//sampleStart
fun foo() {
    listOf(1, 2, 3, 4, 5).forEach(fun(value: Int) {
        if (value == 3) return  // 無名関数の呼び出し元（forEach ループ）へのローカルリターン
        print(value)
    })
    print(" done with anonymous function")
}
//sampleEnd

fun main() {
    foo()
}
```
{kotlin-runnable="true"}

前の3つの例におけるローカルリターンの使用法は、通常のループにおける `continue` の使用法と似ている点に注意してください。

`break` に直接相当するものはありませんが、外側に `run` ラムダを追加し、そこから非ローカルにリターンすることでシミュレートできます。

```kotlin
//sampleStart
fun foo() {
    run loop@{
        listOf(1, 2, 3, 4, 5).forEach {
            if (it == 3) return@loop // run に渡されたラムダからの非ローカルリターン
            print(it)
        }
    }
    print(" done with nested loop")
}
//sampleEnd

fun main() {
    foo()
}
```
{kotlin-runnable="true"}

ここで非ローカルリターンが可能なのは、ネストされた `forEach()` のラムダが[インライン関数](inline-functions.md)として機能するためです。

値を返す際、パーサーは修飾されたリターンを優先します。

```kotlin
return@a 1
```

これは「ラベル付けされた式 `(@a 1)` をリターンする」ではなく、「ラベル `@a` で `1` をリターンする」を意味します。

> 場合によっては、ラベルを使用せずにラムダ式からリターンすることができます。このような*非ローカル*リターンは、ラムダ内に配置されながら、それを囲む[インライン関数](inline-functions.md#returns)を終了します。
>
{style="note"}