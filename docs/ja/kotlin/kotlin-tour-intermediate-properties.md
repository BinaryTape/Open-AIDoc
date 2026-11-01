[//]: # (title: プロパティ)

<no-index/>

初級ツアーでは、クラスインスタンスの特徴を宣言するためにプロパティがどのように使用され、どのようにアクセスするかを学びました。この章では、Kotlin におけるプロパティの仕組みをさらに深く掘り下げ、コード内でプロパティを活用する他の方法を探ります。

## バッキングフィールド (Backing fields) {id="backing-fields"}

Kotlin では、プロパティにはデフォルトの `get()` および `set()` 関数（プロパティアクセサと呼ばれます）があり、値の取得と変更を処理します。これらのデフォルト関数はコード上では明示的に見えませんが、コンパイラが自動的に生成して背後でプロパティアクセスを管理します。これらのアクセサは、プロパティの実際の値を保存するために**バッキングフィールド**（裏打ちフィールド）を使用します。

バッキングフィールドは、以下のいずれかに該当する場合に存在します:

* プロパティにデフォルトの `get()` または `set()` 関数を使用している。
* コード内で `field` キーワードを使用してプロパティ値にアクセスしようとしている。

> `get()` および `set()` 関数は、ゲッターおよびセッターとも呼ばれます。
>
{style="tip"}

例えば、以下のコードの `category` プロパティにはカスタムの `get()` や `set()` 関数がないため、デフォルトの実装が使用されます:

```kotlin
class Contact(val id: Int, var email: String) {
    var category: String = ""
}
```

内部的には、これは以下の疑似コードと同等です:

```kotlin
class Contact(val id: Int, var email: String) {
    var category: String = ""
        get() = field
        set(value) {
            field = value
        }
}
```
{validate="false"}

この例では:

* `get()` 関数はフィールドからプロパティ値を取得します: `""`。
* `set()` 関数はパラメータとして `value` を受け取り、それをフィールドに代入します（ここでの `value` は `""`）。 

バッキングフィールドへのアクセスは、無限ループを引き起こすことなく `get()` または `set()` 関数に追加のロジックを加えたい場合に役立ちます。例えば、`name` プロパティを持つ `Person` クラスがあるとします:

```kotlin
class Person {
    var name: String = ""
}
```

`name` プロパティの最初の文字が確実に大文字になるように、[`.replaceFirstChar()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/replace-first-char.html) および [`.uppercase()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/uppercase-char.html) 拡張関数を使用するカスタムの `set()` 関数を作成するとします。しかし、`set()` 関数内でプロパティを直接参照すると、無限ループが発生し、実行時に `StackOverflowError` が発生します:

```kotlin
class Person {
    var name: String = ""
        set(value) {
            // これにより実行時エラーが発生します
            name = value.replaceFirstChar { firstChar -> firstChar.uppercase() }
        }
}

fun main() {
    val person = Person()
    person.name = "kodee"
    println(person.name)
    // Exception in thread "main" java.lang.StackOverflowError
}
```
{validate="false" kotlin-runnable="true" id="kotlin-tour-properties-stackoverflow"}

これを修正するには、`set()` 関数内で `field` キーワードを使ってバッキングフィールドを参照します:

```kotlin
class Person {
    var name: String = ""
        set(value) {
            field = value.replaceFirstChar { firstChar -> firstChar.uppercase() }
        }
}

fun main() {
    val person = Person()
    person.name = "kodee"
    println(person.name)
    // Kodee
}
```
{kotlin-runnable="true" id="kotlin-tour-properties-backingfield"}

バッキングフィールドは、ロギングの追加、プロパティ値が変更された際の通知の送信、あるいは変更前後のプロパティ値を比較するロジックの実装などにも役立ちます。

詳細については、[バッキングフィールド](properties.md#backing-fields)を参照してください。

## 拡張プロパティ (Extension properties) {id="extension-properties"}

拡張関数と同様に、拡張プロパティも存在します。拡張プロパティを使用すると、ソースコードを変更することなく既存のクラスに新しいプロパティを追加できます。ただし、Kotlin の拡張プロパティにはバッキングフィールドが**ありません**。これは、`get()` 関数および `set()` 関数を自分で記述する必要があることを意味します。さらに、バッキングフィールドがないため、いかなる状態も保持できません。

拡張プロパティを宣言するには、拡張したいクラス名の後に `.` を付け、その後にプロパティ名を記述します。通常のクラスプロパティと同様に、プロパティの型を宣言する必要があります。
例:

```kotlin
val String.lastChar: Char
```
{validate="false"}

拡張プロパティは、継承を使用せずにプロパティに計算された値を持たせたい場合に最も役立ちます。拡張プロパティは、パラメータが 1 つだけ（レシーバ）の関数のように動作すると考えることができます。

例えば、`firstName` と `lastName` という 2 つのプロパティを持つ `Person` というデータクラスがあるとします。

```kotlin
data class Person(val firstName: String, val lastName: String)
```

`Person` データクラスを変更したり継承したりせずに、その人物のフルネームにアクセスできるようにしたいとします。これは、カスタム `get()` 関数を持つ拡張プロパティを作成することで実現できます:

```kotlin
data class Person(val firstName: String, val lastName: String)

// フルネームを取得するための拡張プロパティ
val Person.fullName: String
    get() = "$firstName $lastName"

fun main() {
    val person = Person(firstName = "John", lastName = "Doe")

    // 拡張プロパティを使用
    println(person.fullName)
    // John Doe
}
```
{kotlin-runnable="true" id="kotlin-tour-properties-extension"}

> 拡張プロパティは、クラスの既存のプロパティをオーバーライドすることはできません。
> 
{style="note"}

拡張関数と同様に、Kotlin 標準ライブラリでも拡張プロパティが広く使用されています。例えば、`CharSequence` の [`lastIndex` プロパティ](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/last-index.html)を参照してください。

## 委任プロパティ (Delegated properties) {id="delegated-properties"}

委任（Delegation）については、すでに[クラスとインターフェース](kotlin-tour-intermediate-classes-interfaces.md#delegation)の章で学びました。委任はプロパティでも使用でき、プロパティアクセサの処理を別のオブジェクトに委任することができます。これは、単純なバッキングフィールドでは処理できない、データベーステーブル、ブラウザセッション、マップへの値の保存など、より複雑なプロパティ保存要件がある場合に役立ちます。また、プロパティの取得および設定のロジックが委任先オブジェクトにのみ含まれるため、ボイラープレートコードを削減することもできます。

構文はクラスでの委任の使用に似ていますが、異なるレベルで機能します。プロパティを宣言し、その後に `by` キーワードと委任先のオブジェクトを指定します。例:

```kotlin
val displayName: String by Delegate
```

ここで、委任プロパティ `displayName` は、そのプロパティアクセサの処理を `Delegate` オブジェクトに委任します。

委任先のすべてのオブジェクトは、Kotlin が委任プロパティの値を取得するために使用する `getValue()` 演算子関数を**必ず**持っていなければなりません。プロパティがミュータブル（可変）な場合は、Kotlin が値を設定できるように `setValue()` 演算子関数も持っている必要があります。

デフォルトでは、`getValue()` 関数と `setValue()` 関数は次のような構造を持ちます:

```kotlin
operator fun getValue(thisRef: Any?, property: KProperty<*>): String {}

operator fun setValue(thisRef: Any?, property: KProperty<*>, value: String) {}
```
{validate="false"}

これらの関数において:

* `operator` キーワードは、これらの関数が演算子関数であることを示し、`get()` および `set()` 関数をオーバーロードできるようにします。
* `thisRef` パラメータは、委任プロパティを**含む**オブジェクトを参照します。デフォルトでは型が `Any?` に設定されていますが、より具体的な型を指定することもできます。
* `property` パラメータは、アクセスまたは変更されるプロパティを参照します。このパラメータを使用して、プロパティの名前や型などの情報にアクセスできます。デフォルトでは型が `KProperty<*>` に設定されていますが、`Any?` を使用することもできます。コード内でこれを変更することについて心配する必要はありません。

`getValue()` 関数の戻り値の型はデフォルトで `String` ですが、必要に応じて調整できます。

`setValue()` 関数には追加のパラメータ `value` があり、プロパティに新しく代入される値を保持するために使用されます。

では、実際にはどのように見えるでしょうか？例えば、ユーザーの表示名のように、計算コストが高く、アプリケーションのパフォーマンスが重視されるために 1 回だけ計算したいプロパティがあるとします。委任プロパティを使用して表示名をキャッシュすれば、計算は 1 回だけで済み、その後はパフォーマンスに影響を与えることなくいつでもアクセスできます。

まず、委任先となるオブジェクトを作成する必要があります。この場合、オブジェクトは `CachedStringDelegate` クラスのインスタンスになります:

```kotlin
class CachedStringDelegate {
    var cachedValue: String? = null
}
```

`cachedValue` プロパティにはキャッシュされた値が格納されます。`CachedStringDelegate` クラス内で、委任プロパティの `get()` 関数に期待する振る舞いを `getValue()` 演算子関数の本体に追加します:

```kotlin
class CachedStringDelegate {
    var cachedValue: String? = null

    operator fun getValue(thisRef: Any?, property: Any?): String {
        if (cachedValue == null) {
            cachedValue = "Default Value"
            println("Computed and cached: $cachedValue")
        } else {
            println("Accessed from cache: $cachedValue")
        }
        return cachedValue ?: "Unknown"
    }
}
```

`getValue()` 関数は、`cachedValue` プロパティが `null` かどうかを確認します。もし `null` であれば、`"Default Value"` を代入し、ロギング目的で文字列を出力します。すでに `cachedValue` プロパティが計算されていれば、プロパティは `null` ではありません。その場合は、ロギング目的で別の文字列を出力します。最後に、この関数は Elvis 演算子を使用して、キャッシュされた値、または値が `null` の場合は `"Unknown"` を返します。

これで、キャッシュしたいプロパティ（`val displayName`）を `CachedStringDelegate` クラスのインスタンスに委任できるようになりました:

```kotlin
class CachedStringDelegate {
    var cachedValue: String? = null

    operator fun getValue(thisRef: User, property: Any?): String {
        if (cachedValue == null) {
            cachedValue = "${thisRef.firstName} ${thisRef.lastName}"
            println("Computed and cached: $cachedValue")
        } else {
            println("Accessed from cache: $cachedValue")
        }
        return cachedValue ?: "Unknown"
    }
}

class User(val firstName: String, val lastName: String) {
    val displayName: String by CachedStringDelegate()
}

fun main() {
    val user = User("John", "Doe")

    // 初回アクセス時に値が計算されてキャッシュされる
    println(user.displayName)
    // Computed and cached: John Doe
    // John Doe

    // 2回目以降のアクセスではキャッシュから値を取得する
    println(user.displayName)
    // Accessed from cache: John Doe
    // John Doe
}
```
{kotlin-runnable="true" id="kotlin-tour-properties-delegated"}

この例では:

* ヘッダーに `firstName` と `lastName` の 2 つのプロパティを持ち、クラス本体に `displayName` プロパティを持つ `User` クラスを作成しています。
* `displayName` プロパティを `CachedStringDelegate` クラスのインスタンスに委任します。
* `user` という `User` クラスのインスタンスを作成します。
* `user` インスタンスの `displayName` プロパティにアクセスした結果を出力します。

`getValue()` 関数内で、`thisRef` パラメータの型が `Any?` 型からオブジェクト型の `User` に絞り込まれていることに注目してください。これにより、コンパイラが `User` クラスの `firstName` および `lastName` プロパティにアクセスできるようになります。

### 標準デリゲート (Standard delegates) {id="standard-delegates"}

Kotlin 標準ライブラリには便利なデリゲートがいくつか用意されているため、常に独自に作成する必要はありません。これらのデリゲートを使用する場合、標準ライブラリが自動的に提供してくれるため、`getValue()` や `setValue()` 関数を定義する必要はありません。

#### 遅延プロパティ (Lazy properties) {id="lazy-properties"}

プロパティに最初にアクセスしたときにのみ初期化するには、遅延プロパティを使用します。標準ライブラリは委任用に `Lazy` インターフェースを提供しています。

`Lazy` インターフェースのインスタンスを作成するには、`lazy()` 関数を使用し、`get()` 関数が初めて呼び出されたときに実行するラムダ式を渡します。以降の `get()` 関数の呼び出しでは、初回の呼び出しで返されたのと同じ結果が返されます。遅延プロパティでは、ラムダ式を渡すために[末尾のラムダ (trailing lambda)](kotlin-tour-functions.md#trailing-lambdas) の構文を使用します。

例:

```kotlin
class Database {
    fun connect() {
        println("Connecting to the database...")
    }

    fun query(sql: String): List<String> {
        return listOf("Data1", "Data2", "Data3")
    }
}

val databaseConnection: Database by lazy {
    val db = Database()
    db.connect()
    db
}

fun fetchData() {
    val data = databaseConnection.query("SELECT * FROM data")
    println("Data: $data")
}

fun main() {
    // databaseConnection への初回アクセス
    fetchData()
    // Connecting to the database...
    // Data: [Data1, Data2, Data3]

    // 2回目以降のアクセスでは既存の接続を使用する
    fetchData()
    // Data: [Data1, Data2, Data3]
}
```
{kotlin-runnable="true" id="kotlin-tour-properties-lazy"}

この例では:

* `connect()` および `query()` メンバ関数を持つ `Database` クラスがあります。
* `connect()` 関数はコンソールに文字列を出力し、`query()` 関数は SQL クエリを受け取ってリストを返します。
* 遅延プロパティである `databaseConnection` プロパティがあります。
* `lazy()` 関数に渡されたラムダ式は:
  * `Database` クラスのインスタンスを作成します。
  * このインスタンス（`db`）の `connect()` メンバ関数を呼び出します。
  * そのインスタンスを返します。
* 次のような `fetchData()` 関数があります:
  * `databaseConnection` プロパティの `query()` 関数を呼び出して SQL クエリを作成します。
  * SQL クエリの結果を `data` 変数に代入します。
  * `data` 変数をコンソールに出力します。
* `main()` 関数が `fetchData()` 関数を呼び出します。初めて呼び出されたときに遅延プロパティが初期化されます。2 回目以降は、初回と同じ結果が返されます。

遅延プロパティは、初期化にリソースが多く消費される場合だけでなく、プロパティがコード内で使用されない可能性がある場合にも便利です。さらに、遅延プロパティはデフォルトでスレッドセーフであるため、並行処理を行う環境で特に役立ちます。

詳細については、[遅延プロパティ](delegated-properties.md#lazy-properties)を参照してください。

#### 監視可能プロパティ (Observable properties) {id="observable-properties"}

プロパティの値が変更されたかどうかを監視するには、監視可能プロパティ（Observable properties）を使用します。監視可能プロパティは、プロパティ値の変更を検出し、それをきっかけに何らかの処理をトリガーしたい場合に役立ちます。標準ライブラリは委任用に `Delegates` オブジェクトを提供しています。

監視可能プロパティを作成するには、まず `kotlin.properties.Delegates.observable` をインポートする必要があります。次に、`observable()` 関数を使用し、プロパティが変更されるたびに実行されるラムダ式を渡します。遅延プロパティと同様に、監視可能プロパティでもラムダ式を渡すために[末尾のラムダ (trailing lambda)](kotlin-tour-functions.md#trailing-lambdas) の構文を使用します。

例:

```kotlin
import kotlin.properties.Delegates.observable

class Thermostat {
    var temperature: Double by observable(20.0) { _, old, new ->
        if (new > 25) {
            println("Warning: Temperature is too high! ($old°C -> $new°C)")
        } else {
            println("Temperature updated: $old°C -> $new°C")
        }
    }
}

fun main() {
    val thermostat = Thermostat()
    thermostat.temperature = 22.5
    // Temperature updated: 20.0°C -> 22.5°C

    thermostat.temperature = 27.0
    // Warning: Temperature is too high! (22.5°C -> 27.0°C)
}
```
{kotlin-runnable="true" id="kotlin-tour-properties-observable"}

この例では:

* 監視可能プロパティ `temperature` を持つ `Thermostat` クラスがあります。
* `observable()` 関数はパラメータとして `20.0` を受け取り、それを使用してプロパティを初期化します。
* `observable()` 関数に渡されたラムダ式には:
  * 3 つのパラメータがあります:
    * `_`: プロパティ自体を参照します。
    * `old`: プロパティの古い値です。
    * `new`: プロパティの新しい値です。
  * `new` パラメータが `25` より大きいかどうかをチェックし、結果に応じてコンソールに文字列を出力します。
* `main()` 関数は:
  * `thermostat` という名前の `Thermostat` クラスのインスタンスを作成します。
  * インスタンスの `temperature` プロパティの値を `22.5` に更新し、温度の更新を出力する処理をトリガーします。
  * インスタンスの `temperature` プロパティの値を `27.0` に更新し、警告を出力する処理をトリガーします。

監視可能プロパティは、ロギングやデバッグ目的だけでなく、UI の更新やデータの妥当性チェックなどの追加検証を実行するユースケースにも活用できます。

詳細については、[監視可能プロパティ](delegated-properties.md#observable-properties)を参照してください。

## 演習 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="在庫切れの本を見つける" id="properties-exercise-1">

書店の在庫管理システムを管理しています。在庫はリストに保存されており、各要素は特定の書籍の数量を表しています。例えば、`listOf(3, 0, 7, 12)` は、1 冊目の本が 3 冊、2 冊目が 0 冊、3 冊目が 7 冊、4 冊目が 12 冊あることを意味します。

在庫切れの本のすべてのインデックスのリストを返す `findOutOfStockBooks()` という関数を作成してください。

<deflist collapsible="true">
    <def title="ヒント 1">
        標準ライブラリの <a href="https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/indices.html"><code>indices</code></a> 拡張プロパティを使用します。
    </def>
</deflist>

<deflist collapsible="true">
    <def title="ヒント 2">
        ミュータブルリストを手動で作成して返す代わりに、<a href="https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/build-list.html"><code>buildList()</code></a> 関数を使用してリストを作成・管理できます。<code>buildList()</code> 関数は、以前の章で学んだレシーバ付きラムダを使用します。
    </def>
</deflist>

```kotlin
fun findOutOfStockBooks(inventory: List<Int>): List<Int> {
    // ここにコードを書いてください
}

fun main() {
    val inventory = listOf(3, 0, 7, 0, 5)
    println(findOutOfStockBooks(inventory))
    // [1, 3]
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/FindOutOfStockBooksTest.kt" validate="false" id="kotlin-tour-properties-exercise-1"}

```kotlin
fun findOutOfStockBooks(inventory: List<Int>): List<Int> {
    val outOfStockIndices = mutableListOf<Int>()
    for (index in inventory.indices) {
        if (inventory[index] == 0) {
            outOfStockIndices.add(index)
        }
    }
    return outOfStockIndices
}

fun main() {
    val inventory = listOf(3, 0, 7, 0, 5)
    println(findOutOfStockBooks(inventory))
    // [1, 3]
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/FindOutOfStockBooksTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例 1" id="kotlin-tour-properties-solution-1-1"}

```kotlin
fun findOutOfStockBooks(inventory: List<Int>): List<Int> = buildList {
    for (index in inventory.indices) {
        if (inventory[index] == 0) {
            add(index)
        }
    }
}

fun main() {
    val inventory = listOf(3, 0, 7, 0, 5)
    println(findOutOfStockBooks(inventory))
    // [1, 3]
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/FindOutOfStockBooksTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例 2" id="kotlin-tour-properties-solution-1-2"}

</def>
<def title="キロメートルをマイルに変換する" id="properties-exercise-2">

距離をキロメートルとマイルの両方で表示する必要がある旅行アプリがあります。キロメートル単位の距離をマイルに変換するための、`Double` 型に対する `asMiles` という拡張プロパティを作成してください:

> キロメートルをマイルに変換する計算式は `miles = kilometers * 0.621371` です。
>
{style="note"}

<deflist collapsible="true">
    <def title="ヒント">
        拡張プロパティにはカスタムの <code>get()</code> 関数が必要であることを思い出してください。
    </def>
</deflist>

```kotlin
val // ここにコードを書いてください

fun main() {
    val distanceKm = 5.0
    println("$distanceKm km is ${distanceKm.asMiles} miles")
    // 5.0 km is 3.106855 miles

    val marathonDistance = 42.195
    println("$marathonDistance km is ${marathonDistance.asMiles} miles")
    // 42.195 km is 26.218749345 miles
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/AsMilesTest.kt" validate="false" id="kotlin-tour-properties-exercise-2"}

```kotlin
val Double.asMiles: Double
    get() = this * 0.621371

fun main() {
    val distanceKm = 5.0
    println("$distanceKm km is ${distanceKm.asMiles} miles")
    // 5.0 km is 3.106855 miles

    val marathonDistance = 42.195
    println("$marathonDistance km is ${marathonDistance.asMiles} miles")
    // 42.195 km is 26.218749345 miles
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/AsMilesTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-properties-solution-2"}

</def>
<def title="ヘルスチェックを遅延初期化する" id="properties-exercise-3">

クラウドシステムの状態を判定できるシステムヘルスチェッカーがあります。ただし、ヘルスチェックを実行するために実行できる 2 つの関数は、パフォーマンスへの負荷が大きいです。負荷の高い関数が必要な場合にのみ実行されるように、遅延プロパティを使用してチェックを初期化してください:

```kotlin
fun checkAppServer(): Boolean {
    println("Performing application server health check...")
    return true
}

fun checkDatabase(): Boolean {
    println("Performing database health check...")
    return false
}

fun main() {
    // ここにコードを書いてください

    when {
        isAppServerHealthy -> println("Application server is online and healthy")
        isDatabaseHealthy -> println("Database is healthy")
        else -> println("System is offline")
    }
    // Performing application server health check...
    // Application server is online and healthy
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/LazyHealthCheckTest.kt" validate="false" id="kotlin-tour-properties-exercise-3"}

```kotlin
fun checkAppServer(): Boolean {
    println("Performing application server health check...")
    return true
}

fun checkDatabase(): Boolean {
    println("Performing database health check...")
    return false
}

fun main() {
    val isAppServerHealthy by lazy { checkAppServer() }
    val isDatabaseHealthy by lazy { checkDatabase() }

    when {
        isAppServerHealthy -> println("Application server is online and healthy")
        isDatabaseHealthy -> println("Database is healthy")
        else -> println("System is offline")
    }
   // Performing application server health check...
   // Application server is online and healthy
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/LazyHealthCheckTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-properties-solution-3"}

</def>
<def title="予算の変動を追跡する" id="properties-exercise-4">

シンプルな予算追跡アプリを作成しています。このアプリはユーザーの残りの予算の変化を監視し、特定のしきい値を下回ったときに通知する必要があります。初期予算額を含む `totalBudget` プロパティで初期化される `Budget` クラスがあります。クラス内に、以下を出力する `remainingBudget` という監視可能プロパティを作成してください:

* 値が初期予算の 20% 未満になったときの警告。
* 予算が前回の値から増加したときの励ましのメッセージ。

```kotlin
import kotlin.properties.Delegates.observable

class Budget(val totalBudget: Int) {
    var remainingBudget: Int // ここにコードを書いてください
}

fun main() {
    val myBudget = Budget(totalBudget = 1000)
    myBudget.remainingBudget = 800
    myBudget.remainingBudget = 150
    // Warning: Your remaining budget (150) is below 20% of your total budget.
    myBudget.remainingBudget = 50
    // Warning: Your remaining budget (50) is below 20% of your total budget.
    myBudget.remainingBudget = 300
    // Good news: Your remaining budget increased to 300.
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/BudgetTest.kt" validate="false" id="kotlin-tour-properties-exercise-4"}

```kotlin
import kotlin.properties.Delegates.observable

class Budget(val totalBudget: Int) {
    var remainingBudget: Int by observable(totalBudget) { _, oldValue, newValue ->
        if (newValue < totalBudget * 0.2) {
            println("Warning: Your remaining budget ($newValue) is below 20% of your total budget.")
        } else if (newValue > oldValue) {
            println("Good news: Your remaining budget increased to $newValue.")
        }
    }
}

fun main() {
    val myBudget = Budget(totalBudget = 1000)
    myBudget.remainingBudget = 800
    myBudget.remainingBudget = 150
    // Warning: Your remaining budget (150) is below 20% of your total budget.
    myBudget.remainingBudget = 50
    // Warning: Your remaining budget (50) is below 20% of your total budget.
    myBudget.remainingBudget = 300
    // Good news: Your remaining budget increased to 300.
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/BudgetTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-properties-solution-4"}

</def>
</deflist>

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-intermediate-open-special-classes.md" mode="outline" icon="arrow-left" icon-position="left">前のステップ</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-intermediate-null-safety.md" mode="classic" icon="arrow-right" icon-position="right">次のステップ</a>
  </li>
</list>