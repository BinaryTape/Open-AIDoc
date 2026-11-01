[//]: # (title: イディオム)

Kotlin でよく使われるイディオム（慣用表現）のコレクションです。お気に入りのイディオムがあれば、プルリクエストを送ってぜひコントリビュートしてください。

## DTO（POJO/POCO）の作成 {id="create-dtos-pojos-pocos"}

```kotlin
data class Customer(val name: String, val email: String)
```

上記の記述により、`Customer` クラスに以下の機能が提供されます：

* すべてのプロパティに対するゲッター（`var` の場合はセッターも含む）
* `equals()`
* `hashCode()`
* `toString()`
* `copy()`
* すべてのプロパティに対する `component1()`, `component2()`, ... （[データクラス](data-classes.md)を参照）

## 関数の引数のデフォルト値 {id="default-values-for-function-parameters"}

```kotlin
fun foo(a: Int = 0, b: String = "") { ... }
```

## リストのフィルタリング {id="filter-a-list"}

```kotlin
val positives = list.filter { x -> x > 0 }
```

または、さらに短く書くこともできます：

```kotlin
val positives = list.filter { it > 0 }
```

[Java と Kotlin でのフィルタリングの違い](java-to-kotlin-collections-guide.md#filter-elements)を確認してください。

## コレクション内に対象の要素が存在するかチェックする {id="check-the-presence-of-an-element-in-a-collection"}

```kotlin
if ("john@example.com" in emailsList) { ... }

if ("jane@example.com" !in emailsList) { ... }
```

## 文字列補完（String interpolation） {id="string-interpolation"}

```kotlin
println("Name $name")
```

[Java と Kotlin での文字列連結の違い](java-to-kotlin-idioms-strings.md#concatenate-strings)を確認してください。

## 標準入力を安全に読み取る {id="read-standard-input-safely"}

```kotlin
// 文字列を読み取り、整数に変換できない場合は null を返します。例: Hi there!
val wrongInt = readln().toIntOrNull()
println(wrongInt)
// null

// 整数に変換可能な文字列を読み取り、整数を返します。例: 13
val correctInt = readln().toIntOrNull()
println(correctInt)
// 13
```

詳細については、[標準入力の読み取り](read-standard-input.md)を参照してください。

## インスタンスのチェック {id="instance-checks"}

```kotlin
when (x) {
    is Foo -> ...
    is Bar -> ...
    else   -> ...
}
```

## 読み取り専用リスト {id="read-only-list"}

```kotlin
val list = listOf("a", "b", "c")
```
## 読み取り専用マップ {id="read-only-map"}

```kotlin
val map = mapOf("a" to 1, "b" to 2, "c" to 3)
```

## マップのエントリへのアクセス {id="access-a-map-entry"}

```kotlin
println(map["key"])
map["key"] = value
```

## マップまたはペアのリストのトラバース（走査） {id="traverse-a-map-or-a-list-of-pairs"}

```kotlin
for ((k, v) in map) {
    println("$k -> $v")
}
```

`k` と `v` には、`name` や `age` など、扱いやすい任意の名前を使用できます。

## 範囲（レンジ）の反復処理 {id="iterate-over-a-range"}

```kotlin
for (i in 1..100) { ... }  // 100 を含む
for (i in 1..<100) { ... } // 100 を含まない
for (x in 2..10 step 2) { ... }
for (x in 10 downTo 1) { ... }
(1..10).forEach { ... }
```

## 遅延初期化プロパティ（Lazy property） {id="lazy-property"}

```kotlin
val p: String by lazy { // 値は初回アクセス時にのみ計算されます
    // 文字列を計算
}
```

## 拡張関数 {id="extension-functions"}

```kotlin
fun String.spaceToCamelCase() { ... }

"Convert this to camelcase".spaceToCamelCase()
```

## シングルトンの作成 {id="create-a-singleton"}

```kotlin
object Resource {
    val name = "Name"
}
```

## タイプセーフな値のためのインライン値クラスの使用 {id="use-inline-value-classes-for-type-safe-values"}

```kotlin
@JvmInline
value class EmployeeId(private val id: String)

@JvmInline
value class CustomerId(private val id: String)
```

誤って `EmployeeId` と `CustomerId` を取り違えた場合、コンパイルエラーが発生します。

> `@JvmInline` アノテーションは JVM バックエンドでのみ必要です。
>
{style="note"}

## 抽象クラスのインスタンス化 {id="instantiate-an-abstract-class"}

```kotlin
abstract class MyAbstractClass {
    abstract fun doSomething()
    abstract fun sleep()
}

fun main() {
    val myObject = object : MyAbstractClass() {
        override fun doSomething() {
            // ...
        }

        override fun sleep() { // ...
        }
    }
    myObject.doSomething()
}
```

## null 以外の場合の省略記法（If-not-null shorthand） {id="if-not-null-shorthand"}

```kotlin
val files = File("Test").listFiles()

println(files?.size) // files が null でない場合に size が出力されます
```

## null の場合のデフォルト値の省略記法（If-not-null-else shorthand） {id="if-not-null-else-shorthand"}

```kotlin
val files = File("Test").listFiles()

// 単純なフォールバック値の場合:
println(files?.size ?: "empty") // files が null の場合、"empty" を出力します

// コードブロックでより複雑なフォールバック値を計算するには `run` を使用します
val filesSize = files?.size ?: run { 
    val someSize = getSomeSize()
    someSize * 2
}
println(filesSize)
```

## null の場合に式を実行する {id="execute-an-expression-if-null"}

```kotlin
val values = ...
val email = values["email"] ?: throw IllegalStateException("Email is missing!")
```

## 空の可能性があるコレクションの最初の要素を取得する {id="get-first-item-of-a-possibly-empty-collection"}

```kotlin
val emails = ... // 空の可能性があります
val mainEmail = emails.firstOrNull() ?: ""
```

[Java と Kotlin での最初の要素の取得の違い](java-to-kotlin-collections-guide.md#get-the-first-and-the-last-items-of-a-possibly-empty-collection)を確認してください。

## null でない場合に実行する {id="execute-if-not-null"}

```kotlin
val value = ...

value?.let {
    ... // null でない場合にこのブロックを実行します
}
```

## null 許容の値を null でない場合に変換（マッピング）する {id="map-nullable-value-if-not-null"}

```kotlin
val value = ...

val mapped = value?.let { transformValue(it) } ?: defaultValue 
// value または変換結果が null の場合、defaultValue が返されます。
```

## when 文での return {id="return-on-when-statement"}

```kotlin
fun transform(color: String): Int {
    return when (color) {
        "Red" -> 0
        "Green" -> 1
        "Blue" -> 2
        else -> throw IllegalArgumentException("Invalid color param value")
    }
}
```

## try-catch 式 {id="try-catch-expression"}

```kotlin
fun test() {
    val result = try {
        count()
    } catch (e: ArithmeticException) {
        throw IllegalStateException(e)
    }

    // result を使った処理
}
```

## if 式 {id="if-expression"}

```kotlin
val y = if (x == 1) {
    "one"
} else if (x == 2) {
    "two"
} else {
    "other"
}
```

## Unit を返すメソッドのビライダースタイルの使用法 {id="builder-style-usage-of-methods-that-return-unit"}

```kotlin
fun arrayOfMinusOnes(size: Int): IntArray {
    return IntArray(size).apply { fill(-1) }
}
```

## 単一式関数（Single-expression functions） {id="single-expression-functions"}

```kotlin
fun theAnswer() = 42
```

これは以下と同等です：

```kotlin
fun theAnswer(): Int {
    return 42
}
```

これは他のイディオムと効果的に組み合わせることで、コードをより短く記述できます。例えば、`when` 式との組み合わせです：

```kotlin
fun transform(color: String): Int = when (color) {
    "Red" -> 0
    "Green" -> 1
    "Blue" -> 2
    else -> throw IllegalArgumentException("Invalid color param value")
}
```

## オブジェクトインスタンスに対して複数のメソッドを呼び出す（with） {id="call-multiple-methods-on-an-object-instance-with"}

```kotlin
class Turtle {
    fun penDown()
    fun penUp()
    fun turn(degrees: Double)
    fun forward(pixels: Double)
}

val myTurtle = Turtle()
with(myTurtle) { // 100 ピクセルの正方形を描く
    penDown()
    for (i in 1..4) {
        forward(100.0)
        turn(90.0)
    }
    penUp()
}
```

## オブジェクトのプロパティを設定する（apply） {id="configure-properties-of-an-object-apply"}

```kotlin
val myRectangle = Rectangle().apply {
    length = 4
    breadth = 5
    color = 0xFAFAFA
}
```

これは、オブジェクトのコンストラクタに含まれていないプロパティを設定するのに便利です。

## Java 7 の try-with-resources {id="java-7-s-try-with-resources"}

```kotlin
val stream = Files.newInputStream(Paths.get("/some/file.txt"))
stream.buffered().reader().use { reader ->
    println(reader.readText())
}
```

## ジェネリック型の情報を必要とするジェネリック関数 {id="generic-function-that-requires-the-generic-type-information"}

```kotlin
//  public final class Gson {
//     ...
//     public <T> T fromJson(JsonElement json, Class<T> classOfT) throws JsonSyntaxException {
//     ...

inline fun <reified T: Any> Gson.fromJson(json: JsonElement): T = this.fromJson(json, T::class.java)
```

## 2 つの変数の入れ替え（Swap） {id="swap-two-variables"}

```kotlin
var a = 1
var b = 2
a = b.also { b = a }
```

## コードを未実装としてマークする（TODO） {id="mark-code-as-incomplete-todo"}
 
Kotlin の標準ライブラリには、常に `NotImplementedError` をスローする `TODO()` 関数があります。
その戻り値の型は `Nothing` であるため、期待される型に関係なく使用できます。
また、理由を示すパラメータを受け取るオーバーロードもあります：

```kotlin
fun calcTaxes(): BigDecimal = TODO("Waiting for feedback from accounting")
```

IntelliJ IDEA の Kotlin プラグインは `TODO()` のセマンティクスを理解し、TODO ツールウィンドウにコードポインタを自動的に追加します。

## 次のステップ {id="what-s-next"}

* イディオマティックな Kotlin のスタイルを使用して [Advent of Code のパズル](advent-of-code.md)を解く。
* [Java と Kotlin における文字列の一般的なタスク](java-to-kotlin-idioms-strings.md)の実行方法を学ぶ。
* [Java と Kotlin におけるコレクションの一般的なタスク](java-to-kotlin-collections-guide.md)の実行方法を学ぶ。
* [Java と Kotlin における null 許容性の扱い方](java-to-kotlin-nullability-guide.md)を学ぶ。