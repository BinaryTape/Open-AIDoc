[//]: # (title: 列挙型クラス (Enum classes))

列挙型クラス（enum class）は、取りうる値の固定されたセットを表します。利用可能な状態やモードなど、値が事前定義されたいくつかの選択肢のうちのいずれか1つにしかなり得ない場合は、列挙型クラスを使用します。

列挙型クラスの各値は_列挙定数（enum constant）_と呼ばれます。列挙定数はその列挙型クラス型の[シングルトンオブジェクト](object-declarations.md)のように振る舞うため、プロパティや関数、カスタム動作を持つことができます。

列挙型クラスは、取りうるすべての値が事前に判明しており、同じ構造を持っている場合に最も適しています。ケースごとに異なるデータを保持したり、異なる構造を持たせたりする必要がある場合は、[sealed クラスまたはインターフェース](sealed-classes.md)を使用してください。

## 列挙型クラスの宣言 {id="declare-enum-classes"}

列挙型クラスを作成するには、`enum` キーワードを使用し、中括弧で囲まれたボディを持つ通常のクラス構文に従います。クラスボディ内には、カンマで区切って列挙定数を並べます：

```kotlin
enum class Direction {
    NORTH, SOUTH, WEST, EAST
}
```

この例では、`Direction` が列挙型クラスであり、`NORTH`、`SOUTH`、`WEST`、`EAST` が列挙定数です。

慣例として、定数値を表すため列挙定数は通常大文字で記述されます。

列挙定数には、列挙型クラス名の後に定数名を続けることでアクセスできます：

```kotlin
enum class Direction {
    NORTH, SOUTH, WEST, EAST
}

fun main() {
    // `Direction.NORTH` は `Direction` 型の列挙定数
    val direction: Direction = Direction.NORTH

    println(direction)
    // NORTH
}
```
{kotlin-runnable="true" id="create-enum-class-kotlin"}

Kotlin のすべての列挙型クラスは [`Enum<T>`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-enum/) ベースクラスを継承しており、ここで `T` は列挙型クラス自身です。例えば、`Direction` 列挙型クラスは `Enum<Direction>` を継承します。
これにより、列挙定数は [`name` や `ordinal`](#access-enum-constants-and-their-properties) などの組み込みプロパティを持っています。

## 列挙定数の操作 {id="working-with-enum-constants"}

列挙定数は値であるため、変数に代入したり、出力したり、関数に渡したり、比較したり、`when` 式で使用したりできます。

### 列挙定数の宣言 {id="declare-enum-constants"}

列挙定数を宣言するには、まず列挙型クラスのコンストラクタでプロパティを定義し、各列挙定数の括弧内に値を渡します。一部の他の言語とは異なり、Kotlin では `RED = "#FF0000"` のような代入構文は使用しません。

列挙定数には、任意の型の関連付けられた値を持たせることができます。文字列や数値が一般的な例ですが、`Boolean` や別の列挙型クラス、カスタムクラスなど、他の型を使用することもできます。

各色の16進カラーコードを保持する `Color` 列挙型クラスを考えてみましょう：

```kotlin
enum class Color(val hex: String) {
    RED("#FF0000"),
    GREEN("#00FF00"),
    BLUE("#0000FF")
}
```

各列挙定数に渡す値は、コンストラクタのパラメータ型と一致している必要があります。ここでは、`hex` は `Color` 列挙型クラスの文字列プロパティです。各列挙定数は、このプロパティに対して独自の文字列値を渡します。

列挙定数に数値を関連付けることもできます。例えば、コンストラクタで `Int` 型を宣言し、各列挙定数に `Int` 値を提供します：

```kotlin
enum class Priority(val level: Int) {
    LOW(0),
    MEDIUM(1),
    HIGH(2)
}
```

### 列挙定数とそのプロパティへのアクセス {id="access-enum-constants-and-their-properties"}

列挙定数には、列挙型クラス名を通じてアクセスできます。列挙定数に関連付けられたプロパティにアクセスするには、`color.hex` や `Color.GREEN.hex` のようにドット記法を使用します：

```kotlin
enum class Color(val hex: String) {
    RED("#FF0000"),
    GREEN("#00FF00"),
    BLUE("#0000FF")
}

fun main() {
    val color: Color = Color.RED

    println(color)
    // RED
    println(color.hex)
    // #FF0000
    println(Color.GREEN.hex)
    // #00FF00
}
```
{kotlin-runnable="true" id="access-enum-properties-kotlin"}

ここでは、`Color.RED` は `Color` 型の列挙定数です。`color` 変数はこの列挙定数を保持しています。

独自に定義したプロパティのほかに、すべての列挙定数は名前と列挙型クラス宣言内での位置（`0` から開始）を取得するための組み込みの `name` プロパティおよび `ordinal` プロパティも持っています：

```kotlin
enum class RGB { RED, GREEN, BLUE }

fun main() {
    println(RGB.RED.name)
    // RED
    println(RGB.RED.ordinal)
    // 0
}
```
{kotlin-runnable="true" id="rgb-enums-properties-kotlin"}

### 関数への列挙定数の受け渡し {id="pass-enum-constants-to-functions"}

列挙定数は値であるため、関数に渡すことができます。これにより、関数は列挙型クラスで定義された固定の選択肢セットのみを受け入れるようになり、型安全なコードが保証されます：

```kotlin
enum class Color(val hex: String) {
    RED("#FF0000"),
    GREEN("#00FF00"),
    BLUE("#0000FF")
}

//sampleStart
fun printColor(color: Color) {
    println("Color: $color")
    println("Hex code: ${color.hex}")
}

fun main() {
    printColor(Color.BLUE)
    // Color: BLUE
    // Hex code: #0000FF
}
//sampleEnd
```
{kotlin-runnable="true" id="pass-enum-to-function-kotlin"}

ここでは、`printColor()` 関数は `Color` 型の値を受け取るため、任意の `Color` 列挙定数を渡すことができます。

列挙定数はシングルトンオブジェクトのように振る舞いますが、コンパイラはそれらを列挙型クラス型の値として扱います。列挙型クラス名自体は型として使用できますが、列挙定数を列挙型として使用することはできません：

```kotlin
enum class Color {
    RED, GREEN, BLUE
}

fun printColor(color: Color) {
    println(color)
}

fun printRed(color: Color.RED) {
    println(color)
    // Error: enum entry cannot be used as a type
}
```

### `when` 式での列挙定数の使用 {id="use-enum-constants-in-when-expressions"}

各定数を個別に処理したい場合、列挙型クラスは `when` 式と組み合わせるのが最適です：

```kotlin
enum class Color(val hex: String) {
    RED("#FF0000"),
    GREEN("#00FF00"),
    BLUE("#0000FF")
}

//sampleStart
fun describeColor(color: Color): String {
    return when (color) {
        Color.RED -> "Red is a warm color"
        Color.GREEN -> "Green is a natural color"
        Color.BLUE -> "Blue is a cool color"
    }
}

fun main() {
    println(describeColor(Color.RED))
    // Red is a warm color
}
//sampleEnd
```
{kotlin-runnable="true" id="enum-when-expression-kotlin"}

`when` 式ですべての列挙定数を網羅している場合、`else` 分岐は不要です。

> 列挙型のエントリを扱う際の繰り返しを減らすために、コンテキスト依存の解決（context-sensitive resolution、現在はプレビュー版）を試してみてください。
> この機能を使用すると、`when` 式や型指定された変数への代入時など、期待される型がわかっている場合に列挙型クラス名を省略できます。
>
> 詳細については、[Preview of context-sensitive resolution](whatsnew22.md#preview-of-context-sensitive-resolution) または関連する [KEEP 提案](https://github.com/Kotlin/KEEP/blob/improved-resolution-expected-type/proposals/context-sensitive-resolution.md) を参照してください。
>
{style="tip"}

### 列挙定数の検索 {id="find-enum-constants"}

文字列、インデックス、または関連付けられた値のいずれかから列挙定数を取得したい場合があります。Kotlin は名前、位置、またはカスタム値によって定数を検索するための組み込み API を提供しています。

例えば、各色に関連付けられた RGB 値を持つ列挙型クラスを考えてみましょう。名前で列挙定数を検索するには、`valueOf()` 関数を使用します：

```kotlin
enum class Color(val rgb: Int) {
    RED(0xFF0000),
    GREEN(0x00FF00),
    BLUE(0x0000FF)
}

fun main() {
    val color = Color.valueOf("RED")

    println(color)
    // RED
}
```
{kotlin-runnable="true" id="find-enum-valueof-kotlin"}

`valueOf()` に渡す名前は、列挙定数名と完全に一致している必要があります。指定された名前の列挙定数が存在しない場合、`valueOf()` は `IllegalArgumentException` をスローします。

列挙型宣言内での位置によって列挙定数を検索するには、列挙型の `entries` プロパティで [`getOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/get-or-null.html) 関数を使用します：

```kotlin
enum class Color(val rgb: Int) {
    RED(0xFF0000),
    GREEN(0x00FF00),
    BLUE(0x0000FF)
}

//sampleStart
fun main() {
    val color = Color.entries.getOrNull(0)

    println(color)
    // RED
}
//sampleEnd
```
{kotlin-runnable="true" id="find-enum-getornull-kotlin"}

列挙型の位置は `0` から始まります。この例では、`RED` の位置は `0`、`GREEN` は `1`、`BLUE` は `2` です。

これは、ファイルやユーザー入力などから取得した整数が列挙定数の位置を表している場合に役立ちます。一部の他の言語とは異なり、Kotlin では `Int` を列挙定数に直接キャストすることはできません。代わりに、その整数をインデックスとして使用し、`entries.getOrNull(index)` で定数を検索します。

その整数が、列挙定数の順序を並べ替えても維持されるべき値を表している場合は、`rgb` や `code` などの明示的な数値プロパティを定義し、一致する値を持つ定数を検索してください。

`entries` は特殊な `List` であるため、標準のコレクション API を使用できます。例えば、関連付けられた値によって列挙定数を検索するには、[`first()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/first.html) を使用して entries 内を検索します：

```kotlin
enum class Color(val rgb: Int) {
    RED(0xFF0000),
    GREEN(0x00FF00),
    BLUE(0x0000FF)
}

//sampleStart
fun main() {
    val color = Color.entries.first { it.rgb == 0xFF0000 }

    println(color)
    // RED
}
//sampleEnd
```
{kotlin-runnable="true" id="find-enum-first-kotlin"}

`first()` 関数は、一致する定数が見つからない場合に `NoSuchElementException` をスローします。代わりに `null` を取得したい場合は、[`firstOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/first-or-null.html) を使用します。

列挙定数の個数を取得するには、[`size`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-list/size.html) プロパティを使用します。例：

```kotlin
enum class RGB { RED, GREEN, BLUE }

fun main() {
    println(RGB.entries)
    // [RED, GREEN, BLUE]
    println(RGB.entries.size)
    // 3
    println("The first color is: ${RGB.valueOf("RED")}")
    // "The first color is: RED"
}
```
{kotlin-runnable="true" id="rgb-enums-entries-kotlin"}

名前、位置、または関連付けられた値によって列挙定数を頻繁に検索する必要がある場合は、[コンパニオンオブジェクト (companion object)](object-declarations.md#companion-objects) にヘルパー関数を追加します：

```kotlin
enum class Color(val rgb: Int) {
    RED(0xFF0000),
    GREEN(0x00FF00),
    BLUE(0x0000FF);

    companion object {
        fun fromName(name: String): Color? =
            entries.find { it.name == name }

        fun fromPosition(position: Int): Color? =
            entries.getOrNull(position)

        fun fromRgb(rgb: Int): Color? =
            entries.find { it.rgb == rgb }
    }
}

fun main() {
    println(Color.fromName("RED"))
    // RED
    println(Color.fromPosition(1))
    // GREEN
    println(Color.fromRgb(0x0000FF))
    // BLUE
    println(Color.fromRgb(0xABCDEF))
    // null
}
```
{kotlin-runnable="true" id="find-enum-companion-object-kotlin"}

コンパニオンオブジェクトのヘルパー関数は、例外をスローする代わりに `null` を返す安全な検索を行いたい場合に便利です。

上記で使用された `entries` や `valueOf()` などの検索 API は、_合成（synthetic）_メンバーの一例です。
この文脈での合成とは、自身で宣言していなくても Kotlin がこれらのメンバーを自動的に提供することを意味します。このため、追加のコードを書くことなく、すべての列挙型クラスで `entries` プロパティによる定数の一覧表示や、`valueOf()` 関数による名前での定数の取得が可能になっています。

[`enumEntries<T>()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.enums/enum-entries.html) や [`enumValueOf<T>()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/enum-value-of.html) などの汎用ヘルパー関数を使用して、列挙型クラスの定数にアクセスできます。
これらの関数は[具現化された型パラメータ (reified type parameters)](inline-functions.md#reified-type-parameters) を使用します。これにより、ジェネリックなインライン関数内で実際の列挙型を利用可能に保つことができるため、ヘルパー関数は列挙型 `T` を直接操作できます：

| 関数 | 説明 |
|---|---|
| [`enumEntries<T>()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.enums/enum-entries.html) | （推奨）列挙型 `T` のすべての列挙エントリを返します。呼び出しごとに毎回同じリストが返されます。 |
| [`enumValues<T>()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/enum-values.html) | 列挙型 `T` のすべての列挙エントリを含む配列を返します。`enumValues<T>()` を呼び出すたびに新しい配列が作成されます。 |
| [`enumValueOf<T>()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/enum-value-of.html) | 名前によって単一の列挙エントリを返します。一致する列挙エントリがない場合は `IllegalArgumentException` をスローします。 |

例：

```kotlin
import kotlin.enums.enumEntries

enum class RGB { RED, GREEN, BLUE }

inline fun <reified T : Enum<T>> printAllValues() {
    println(enumEntries<T>().joinToString { it.name })
}

inline fun <reified T : Enum<T>> findByName(name: String): T = enumValueOf<T>(name)

fun main() {
    printAllValues<RGB>()
    // RED, GREEN, BLUE
    println(findByName<RGB>("GREEN"))
    // GREEN
}
```
{kotlin-runnable="true" id="enum-reified-type-parameters-kotlin"}

インライン関数と具現化された型パラメータの詳細については、[インライン関数](inline-functions.md)を参照してください。

### 列挙定数の比較とソート {id="compare-and-sort-enum-constants"}

列挙定数を比較するには、`==` [構造的な等価性 (structural equality)](equality.md#structural-equality) 演算子を使用します：

```kotlin
enum class Color(val hex: String) {
    RED("#FF0000"),
    GREEN("#00FF00"),
    BLUE("#0000FF")
}

//sampleStart
fun main() {
    val color = Color.RED

    println(color == Color.RED)
    // true
    println(color == Color.BLUE)
    // false
}
//sampleEnd
```
{kotlin-runnable="true" id="compare-enum-constants-kotlin"}

各列挙定数はシングルトンオブジェクトのように振る舞うため、列挙定数の比較は両方の値が同じ定数を参照しているかどうかをチェックします。

すべての列挙型クラスはデフォルトで [`Comparable`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-comparable/index.html) インターフェースを実装しているため、列挙定数を比較およびソートできます。定数は列挙型宣言での位置（`ordinal` 値）によって順序付けられ、最初に宣言された定数が最も小さいとみなされます：

```kotlin
enum class Priority {
    LOW, MEDIUM, HIGH
}

fun main() {
    println(Priority.LOW < Priority.HIGH)
    // true
    println(Priority.HIGH > Priority.MEDIUM)
    // true
}
```
{kotlin-runnable="true" id="compare-enum-comparable-kotlin"}

ソートも同じ宣言順序に従います。例えば、`entries.sorted()` は名前にかかわらず、宣言された順序で定数を返します：

```kotlin
enum class Priority {
    HIGH, LOW, MEDIUM
}

fun main() {
    println(Priority.entries.sorted())
    // [HIGH, LOW, MEDIUM]
}
```
{kotlin-runnable="true" id="sort-enum-declaration-order-kotlin"}

`Enum<T>` クラスは `compareTo()`、`equals()`、`hashCode()` 関数を提供しますが、通常のクラスのようにそれらの動作をカスタマイズするためにオーバーライドすることはできません。比較は常に宣言順序に従います。

異なる順序が必要な場合は、宣言順序に依存しないでください。代わりに明示的なプロパティを定義し、それによってソートします。例えば、明るさで色をソートします：

```kotlin
enum class Color(val brightness: Int) {
    RED(1),
    GREEN(3),
    BLUE(2)
}

fun main() {
    println(Color.entries.sortedBy { it.brightness })
    // [RED, BLUE, GREEN]
}
```
{kotlin-runnable="true" id="sort-enum-brightness-kotlin"}

詳細については、[Ordering](collection-ordering.md) を参照してください。

## 列挙型クラスへの関数の追加 {id="add-functions-to-enum-classes"}

プロパティと同様に、列挙型クラスには関数を持たせることができます。すべての列挙定数で共有される関数を追加したり、プロパティと組み合わせたり、演算子関数を定義したりできます。

### すべての定数で共有される関数の追加 {id="add-functions-shared-by-all-constants"}

すべての列挙定数が共有する動作を追加するには、列挙型クラスのボディで関数を定義します。列挙型クラスでメンバーを定義する場合は、定数の定義とメンバーの定義をセミコロンで区切ってください：

```kotlin
enum class Direction {
    NORTH, SOUTH, WEST, EAST;

    fun isVertical(): Boolean = this == NORTH || this == SOUTH
}

fun main() {
    println(Direction.NORTH.isVertical())
    // true
    println(Direction.EAST.isVertical())
    // false
}
```
{kotlin-runnable="true" id="enum-shared-function-kotlin"}

すべての列挙定数はその共有関数を呼び出すことができます。関数内では、`this` は呼び出し元の列挙定数を参照します。

コンストラクタのプロパティと関数を組み合わせて、各定数にデータを関連付け、そのデータを使用する動作を追加できます：

```kotlin
enum class Color(val hex: String) {
    RED("#FF0000"),
    GREEN("#00FF00"),
    BLUE("#0000FF");

    fun describe(): String = "$name has hex code $hex"
}

fun main() {
    println(Color.RED.describe())
    // RED has hex code #FF0000
}
```
{kotlin-runnable="true" id="enum-properties-functions-kotlin"}

ここでは、各定数が独自の `hex` 値を保持しており、共有の `describe()` 関数は組み込みの `name` プロパティと `hex` プロパティの両方を使用しています。

### 演算子関数の追加 {id="add-operator-functions"}

列挙型クラスでは[演算子関数 (operator functions)](operator-overloading.md) を定義することもできるため、列挙定数を演算子とともに使用できます。例えば、`!` 演算子で反対の方向を返すように `not()` 演算子関数を定義します：

```kotlin
enum class Direction {
    NORTH, SOUTH, WEST, EAST;

    operator fun not(): Direction = when (this) {
        NORTH -> SOUTH
        SOUTH -> NORTH
        WEST -> EAST
        EAST -> WEST
    }
}

fun main() {
    println(!Direction.NORTH)
    // SOUTH
}
```
{kotlin-runnable="true" id="enum-operator-function-kotlin"}

## 無名クラスの使用 {id="use-anonymous-classes"}

列挙定数は、対応する関数を持つ独自の無名クラスを宣言したり、ベース関数をオーバーライドしたりできます。無名クラスを使用する場合、列挙定数名の直後にクラスボディを記述し、Kotlin は列挙型クラスをそのスーパータイプとして推論します。

これは、列挙型クラスで抽象関数を宣言し、各定数に固有の実装を提供させる必要がある場合に役立ちます。各定数は独自の無名クラス内でその抽象関数をオーバーライドします：

```kotlin
enum class ProtocolState {
    WAITING {
        override fun signal() = TALKING
    },

    TALKING {
        override fun signal() = WAITING
    };

    abstract fun signal(): ProtocolState
}

fun main() {
    var state = ProtocolState.WAITING

    println(state)
    // WAITING
    state = state.signal()
    println(state)
    // TALKING
}
```
{kotlin-runnable="true" id="enum-abstract-function-kotlin"}

ここでは、各定数が抽象関数 `signal()` を異なって実装しているため、`signal()` を呼び出すと定数に応じて異なる次の状態が返されます。

列挙定数はシングルトンオブジェクトのように振る舞いますが、列挙定数の型は列挙型クラス自身であり、独自の無名クラス型ではありません。そのため、無名クラスのボディ内で宣言されたメンバーにアクセスすることはできません：

```kotlin
enum class ProtocolState {
    WAITING {
        val waitingMessage = "Waiting for a signal"
        override fun signal() = TALKING
    },

    TALKING {
        override fun signal() = WAITING
    };

    abstract fun signal(): ProtocolState
}

fun main() {
    println(ProtocolState.WAITING.waitingMessage)
    // Error: unresolved reference 'waitingMessage'
}
```

すべての定数に対してデータや動作を公開するには、列挙型クラスのボディで宣言し、各定数で独自の実装が必要な場合は抽象メンバーを使用してください。

## 列挙型クラスでのインターフェースの実装 {id="implement-interfaces-in-enum-classes"}

列挙型クラスはインターフェースを実装できますが、クラスから継承することはできません。すべての列挙定数に対してインターフェースメンバーの共通の実装を提供するか、無名クラス内で各定数ごとに個別の実装を提供できます。

インターフェースを実装するには、次のように列挙型クラスの宣言に追加します：

```kotlin
import java.util.function.BinaryOperator
import java.util.function.IntBinaryOperator

//sampleStart
enum class IntArithmetics : BinaryOperator<Int>, IntBinaryOperator {
    PLUS {
        override fun apply(t: Int, u: Int): Int = t + u
    },
    TIMES {
        override fun apply(t: Int, u: Int): Int = t * u
    };
    
    override fun applyAsInt(t: Int, u: Int) = apply(t, u)
}
//sampleEnd

fun main() {
    val a = 13
    val b = 31
    for (f in IntArithmetics.entries) {
        println("$f($a, $b) = ${f.apply(a, b)}")
    }
}
```
{kotlin-runnable="true" id="implement-interfaces-enum-kotlin"}

この例では、`IntArithmetics` 列挙型クラスがクラス宣言内で `BinaryOperator<Int>` と `IntBinaryOperator` の2つのインターフェースを実装しています。`PLUS` と `TIMES` が `apply()` で行っているように、各定数は独自の無名クラスのボディ内でインターフェースメンバーをオーバーライドでき、一方で `applyAsInt()` はすべての定数に対する共有の実装を提供します。