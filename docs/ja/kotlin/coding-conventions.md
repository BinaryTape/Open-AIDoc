を文字列リテラルとして扱うには：

```kotlin
val KClass<*>.jsonSchema : String
    get() = $"""
        {
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "$id": "https://example.com/product.schema.json",
            "$dynamicAnchor": "meta",
            "title": "${simpleName ?: qualifiedName ?: "unknown"}",
            "type": "object"
        }
        """
```

## 言語機能の慣用的な使用

### 不変性（Immutability）

可変データよりも不変データを使用することを好みます。ローカル変数やプロパティが初期化後に変更されない場合は、常に `var` ではなく `val` として宣言してください。

変更されないコレクションを宣言する場合は、常に不変なコレクションインターフェース（`Collection`、`List`、`Set`、`Map`）を使用してください。ファクトリ関数を使用してコレクションインスタンスを作成する場合、可能な限り不変なコレクション型を返す関数を常に使用してください。

```kotlin
// 悪い例：変更されない値に対して可変コレクション型を使用している
fun validateValue(actualValue: String, allowedValues: HashSet<String>) { ... }

// 良い例：代わりに不変コレクション型が使用されている
fun validateValue(actualValue: String, allowedValues: Set<String>) { ... }

// 悪い例：arrayListOf() は可変コレクション型である ArrayList<T> を返す
val allowedValues = arrayListOf("a", "b", "c")

// 良い例：listOf() は List<T> を返す
val allowedValues = listOf("a", "b", "c")
```

### デフォルトパラメータ値

オーバーロードされた関数を宣言するよりも、デフォルトパラメータ値を持つ関数を宣言することを好みます。

```kotlin
// 悪い例
fun foo() = foo("a")
fun foo(a: String) { /*...*/ }

// 良い例
fun foo(a: String = "a") { /*...*/ }
```

### 型エイリアス（Type aliases）

コードベースで複数回使用される関数型や型パラメータを持つ型がある場合は、それに対して型エイリアスを定義することを好みます。

```kotlin
typealias MouseClickHandler = (Any, MouseEvent) -> Unit
typealias PersonIndex = Map<String, Person>
```
名前の衝突を避けるためにプライベートまたは内部の型エイリアスを使用する場合は、[パッケージとインポート](packages.md)で言及されている `import ... as ...` を好みます。

### ラムダパラメータ

短く、ネストされていないラムダでは、パラメータを明示的に宣言する代わりに `it` 慣習を使用することが推奨されます。パラメータを持つネストされたラムダでは、常にパラメータを明示的に宣言してください。

### ラムダ内でのリターン

ラムダ内で複数のラベル付きリターンを使用することは避けてください。単一の出口点を持つようにラムダを再構成することを検討してください。それが不可能な場合や十分に明確でない場合は、ラムダを匿名関数に変換することを検討してください。

ラムダの最後の文にラベル付きリターンを使用しないでください。

### 名前付き引数

メソッドが同じ基本データ型（プリミティブ型）の複数のパラメータを取る場合、または `Boolean` 型のパラメータの場合、すべてのパラメータの意味が文脈から完全に明確でない限り、名前付き引数構文を使用してください。

```kotlin
drawSquare(x = 10, y = 10, width = 100, height = 100, fill = true)
```

### 条件文

`try`、`if`、`when` の式形式（expression form）を使用することを好みます。

```kotlin
return if (x) foo() else bar()
```

```kotlin
return when(x) {
    0 -> "zero"
    else -> "nonzero"
}
```

上記は、以下よりも好ましいです：

```kotlin
if (x)
    return foo()
else
    return bar()
```

```kotlin
when(x) {
    0 -> return "zero"
    else -> return "nonzero"
}
```

### if と when の使い分け

二値の条件には `when` ではなく `if` を使用することを好みます。
例えば、 `if` を使用して次のように書きます：

```kotlin
if (x == null) ... else ...
```

次のように `when` を使用する代わりに：

```kotlin
when (x) {
    null -> // ...
    else -> // ...
}
```

選択肢が3つ以上ある場合は、 `when` を使用することを好みます。

### when式におけるガード条件

`when` 式や文で [ガード条件](control-flow.md#guard-conditions-in-when-expressions) を使用し、複数の論理式を組み合わせる場合は、括弧を使用してください。

```kotlin
when (status) {
    is Status.Ok if (status.info.isEmpty() || status.info.id == null) -> "no information"
}
```

次のように書く代わりに：

```kotlin
when (status) {
    is Status.Ok if status.info.isEmpty() || status.info.id == null -> "no information"
}
```

### 条件文におけるヌル許容 Boolean 値

条件文でヌル許容な（nullable） `Boolean` を使用する必要がある場合は、 `if (value == true)` または `if (value == false)` によるチェックを使用してください。

### ループ

ループよりも高階関数（`filter`、`map` など）を使用することを好みます。例外： `forEach` （`forEach` のレシーバーがヌル許容である場合や、 `forEach` が長い呼び出しチェインの一部として使用されている場合を除き、通常の `for` ループを使用することを好みます）。

複数の高階関数を使用した複雑な式とループのどちらかを選択する場合、それぞれのケースで実行される操作のコストを理解し、パフォーマンスへの考慮を忘れないでください。

### レンジ（範囲）におけるループ

開いた範囲（open-ended range）でループするには、 `..<` 演算子を使用してください。

```kotlin
for (i in 0..n - 1) { /*...*/ }  // 悪い例
for (i in 0..<n) { /*...*/ }  // 良い例
```

### 文字列

文字列の連結よりも文字列テンプレートを好みます。

通常の文字列リテラルの中に `
` エスケープシーケンスを埋め込むよりも、複数行文字列を好みます。

複数行文字列でインデントを維持するには、結果の文字列に内部的なインデントが必要ない場合は `trimIndent` を使用し、内部的なインデントが必要な場合は `trimMargin` を使用してください。

```kotlin
fun main() {
//sampleStart
    println("""
     Not
     trimmed
     text
     """
    )

    println("""
     Trimmed
     text
     """.trimIndent()
    )

    println()

    val a = """Trimmed to margin text:
            |if(a > 1) {
            |    return a
            |}""".trimMargin()

   println(a)
//sampleEnd
}
```
{kotlin-runnable="true"}

[JavaとKotlinの複数行文字列の違い](java-to-kotlin-idioms-strings.md#use-multiline-strings)についても学んでください。

### 関数 vs プロパティ

いくつかのシナリオでは、引数のない関数と読み取り専用プロパティが交換可能である場合があります。意味は似ていますが、どちらを優先すべきかについてのスタイル上の慣習があります。

基礎となるアルゴリズムが以下の条件を満たす場合は、関数よりもプロパティを好みます。

* 例外をスローしない。
* 計算コストが低い（または初回実行時にキャッシュされる）。
* オブジェクトの状態が変わらなければ、呼び出しごとに同じ結果を返す。

### 拡張関数

拡張関数を積極的に使用してください。主にあるオブジェクトに対して動作する関数がある場合は、常にそのオブジェクトをレシーバーとして受け取る拡張関数にすることを検討してください。APIの汚染を最小限に抑えるために、拡張関数の可視性は妥当な範囲で制限してください。必要に応じて、ローカル拡張関数、メンバー拡張関数、またはプライベートな可視性を持つトップレベル拡張関数を使用してください。

### 中置関数（Infix functions）

同様の役割を果たす2つのオブジェクトに対して動作する場合にのみ、関数を `infix` として宣言してください。良い例： `and`、`to`、`zip`。悪い例： `add`。

レシーバーオブジェクトを変更するメソッドを `infix` として宣言しないでください。

### ファクトリ関数

クラスのためにファクトリ関数を宣言する場合、クラス自体と同じ名前を付けることは避けてください。ファクトリ関数の動作がなぜ特別なのかを明確にするために、別の名前を使用することを好みます。特別なセマンティクスが本当にない場合にのみ、クラスと同じ名前を使用できます。

```kotlin
class Point(val x: Double, val y: Double) {
    companion object {
        fun fromPolar(angle: Double, radius: Double) = Point(...)
    }
}
```

異なるスーパークラスのコンストラクタを呼び出さず、デフォルト値を持つパラメータを含む単一のコンストラクタに集約できない複数のオーバーロードされたコンストラクタを持つオブジェクトがある場合は、オーバーロードされたコンストラクタをファクトリ関数に置き換えることを好みます。

### プラットフォーム型

プラットフォーム型の式を返すパブリックな関数/メソッドは、Kotlinの型を明示的に宣言する必要があります。

```kotlin
fun apiCall(): String = MyJavaApi.getProperty("name")
```

プラットフォーム型の式で初期化されるプロパティ（パッケージレベルまたはクラスレベル）は、Kotlinの型を明示的に宣言する必要があります。

```kotlin
class Person {
    val name: String = MyJavaApi.getProperty("name")
}
```

プラットフォーム型の式で初期化されるローカル値は、型宣言を持っていても持っていなくても構いません。

```kotlin
fun main() {
    val name = MyJavaApi.getProperty("name")
    println(name)
}
```

### スコープ関数 apply/with/run/also/let

Kotlinは、特定のオブジェクトのコンテキストでコードブロックを実行するための関数セットを提供しています： `let`、`run`、`with`、`apply`、および `also`。
ケースに合わせた適切なスコープ関数の選択については、 [スコープ関数（Scope Functions）](scope-functions.md) を参照してください。

## ライブラリのコーディング規則

ライブラリを作成する際には、APIの安定性を確保するために、追加の一連の規則に従うことが推奨されます。

 * 常にメンバーの可視性を明示的に指定してください（誤って宣言をパブリックAPIとして公開することを避けるため）。
 * 常に関数の戻り値の型とプロパティの型を明示的に指定してください（実装が変更されたときに誤って戻り値の型が変更されるのを避けるため）。
 * 新しいドキュメントを必要としないオーバーライドを除き、すべてのパブリックメンバーに [KDoc](kotlin-doc.md) コメントを提供してください（ライブラリのドキュメント生成をサポートするため）。

ライブラリのAPIを設計する際に考慮すべきベストプラクティスやアイデアの詳細については、 [Library authors' guidelines](api-guidelines-introduction.md) を参照してください。