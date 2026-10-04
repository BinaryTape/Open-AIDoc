[//]: # (title: プロパティ)

<no-index/>

初級ツアーでは、プロパティを使用してクラスインスタンスの特性を宣言する方法と、それらにアクセスする方法を学びました。この章では、Kotlin におけるプロパティの仕組みをさらに深く掘り下げ、コードでプロパティを活用するための他の方法を探ります。

## バッキングフィールド (Backing fields) {id="backing-fields"}

Kotlin では、プロパティにはデフォルトで `get()` および `set()` 関数（プロパティアクセサと呼ばれます）が備わっており、値の取得と変更を処理します。これらのデフォルト関数はコード上では明示的に見えませんが、コンパイラが自動的に生成して背後でプロパティアクセスを管理します。これらのアクセサは、実際のプロパティ値を格納するために**バッキングフィールド (backing field)** を使用します。

バッキングフィールドは、以下のいずれかに該当する場合に存在します。

* プロパティに対してデフォルトの `get()` または `set()` 関数を使用している場合。
* コード内で `field` キーワードを使用してプロパティ値にアクセスしようとしている場合。

> `get()` および `set()` 関数は、ゲッター (getter) およびセッター (setter) とも呼ばれます。
>
{style="tip"}

例えば、以下のコードにはカスタムの `get()` や `set()` 関数を持たない `category` プロパティがあり、そのためデフォルトの実装が使用されます。

```kotlin
class Contact(val id: Int, var email: String) {
    var category: String = ""
}
```

内部的には、これは以下の疑似コードと同等です。

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

この例では、以下のようになります。

* `get()` 関数は、フィールドからプロパティ値（`""`）を取得します。
* `set()` 関数はパラメータとして `value` を受け取り、それをフィールドに代入します（この場合の `value` は `""`）。

バッキングフィールドへのアクセスは、無限ループを引き起こすことなく `get()` または `set()` 関数内に追加のロジックを加えたい場合に役立ちます。例えば、`name` プロパティを持つ `Person` クラスがあるとします。

```kotlin
class Person {
    var name: String = ""
}
```

`name` プロパティの最初の文字が確実に大文字になるようにしたいと考え、[`.replaceFirstChar()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/replace-first-char.html) および [`.uppercase()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/uppercase-char.html) 拡張関数を使用するカスタムの `set()` 関数を作成します。しかし、`set()` 関数内でプロパティを直接参照すると無限ループが発生し、実行時に `StackOverflowError` が発生します。

```kotlin
class Person {
    var name: String = ""
        set(value) {
            // これは実行時エラーを引き起こします
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
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-properties-stackoverflow"}

これを修正するには、`set()` 関数内で `field` キーワードを参照して、代わりにバッキングフィールドを使用します。

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-properties-backingfield"}

バッキングフィールドは、ロギングの追加、プロパティ値が変更されたときの通知の送信、または新旧のプロパティ値を比較する追加ロジックを使用したい場合にも便利です。

詳細については、[バッキングフィールド](properties.md#backing-fields)を参照してください。

## 拡張プロパティ (Extension properties) {id="extension-properties"}

拡張関数と同様に、拡張プロパティも存在します。拡張プロパティを使用すると、ソースコードを変更することなく、既存のクラスに新しいプロパティを追加できます。ただし、Kotlin の拡張プロパティにはバッキングフィールドが**ありません**。これは、`get()` や `set()` 関数を自分で記述する必要があることを意味します。さらに、バッキングフィールドがないということは、いかなる状態も保持できないことを意味します。

拡張プロパティを宣言するには、拡張したいクラスの名前を書き、その後に `.` とプロパティの名前を続けます。通常のクラスプロパティと同様に、プロパティの型を宣言する必要があります。
例：

```kotlin
val String.lastChar: Char
```
{validate="false"}

拡張プロパティは、継承を使用せずにプロパティに計算された値を持たせたい場合に最も役立ちます。拡張プロパティは、レシーバという 1 つのパラメータのみを持つ関数のように動作すると考えることができます。

例えば、`firstName` と `lastName` という 2 つのプロパティを持つ `Person` というデータクラスがあるとします。

```kotlin
data class Person(val firstName: String, val lastName: String)
```

`Person` データクラスを変更したり、それを継承したりすることなく、その人物のフルネームにアクセスできるようにしたいとします。これは、カスタムの `get()` 関数を持つ拡張プロパティを作成することで実現できます。

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-properties-extension"}

> 拡張プロパティでクラスの既存のプロパティをオーバーライドすることはできません。
> 
{style="note"}

拡張関数と同様に、Kotlin 標準ライブラリでも拡張プロパティが広く使用されています。例えば、`CharSequence` の [`lastIndex` プロパティ](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/last-index.html)を参照してください。

## 委譲プロパティ (Delegated properties) {id="delegated-properties"}

委譲についてはすでに [クラスとインターフェース](kotlin-tour-intermediate-classes-interfaces.md#delegation) の章で学びました。プロパティでも委譲を使用でき、プロパティアクセサを別のオブジェクトに委譲することができます。これは、データベースのテーブル、ブラウザセッション、またはマップへの値の格納など、単純なバッキングフィールドでは対応できないより複雑なプロパティ保存の要件がある場合に役立ちます。また、プロパティの取得および設定のロジックが委譲先のオブジェクトにのみ含まれるため、委譲プロパティを使用するとボイラープレートコードも削減されます。

構文はクラスでの委譲の使用と似ていますが、動作するレベルが異なります。プロパティを宣言し、その後に `by` キーワードと委譲先のオブジェクトを続けます。例：

```kotlin
val displayName: String by Delegate
```

ここで、委譲プロパティ `displayName` は、そのプロパティアクセサを `Delegate` オブジェクトに委譲しています。

委譲先となるすべてのオブジェクトは、Kotlin が委譲プロパティの値を取得するために使用する `getValue()` 演算子関数を**持っていなければなりません**。プロパティが可変（mutable）の場合は、Kotlin がその値を設定できるように `setValue()` 演算子関数も持っている必要があります。

デフォルトでは、`getValue()` および `setValue()` 関数は以下のような構造を持ちます。

```kotlin
operator fun getValue(thisRef: Any?, property: KProperty<*>): String {}

operator fun setValue(thisRef: Any?, property: KProperty<*>, value: String) {}
```
{validate="false"}

これらの関数において：

* `operator` キーワードはこれらの関数を演算子関数としてマークし、`get()` および `set()` 関数をオーバーロードできるようにします。
* `thisRef` パラメータは、委譲プロパティを**含んでいる**オブジェクトを参照します。デフォルトでは型は `Any?` に設定されていますが、より具体的な型を宣言する必要がある場合もあります。
* `property` パラメータは、値がアクセスまたは変更されるプロパティを参照します。このパラメータを使用して、プロパティの名前や型などの情報にアクセスできます。デフォルトでは型は `KProperty<*>` に設定されていますが、`Any?` を使用することもできます。コード内でこれを変更することについて心配する必要はありません。

`getValue()` 関数はデフォルトで `String` の戻り値の型を持ちますが、必要に応じて調整できます。

`setValue()` 関数には追加のパラメータ `value` があり、プロパティに割り当てられる新しい値を保持するために使用されます。

では、これは実際にはどのように見えるでしょうか？例えば、ユーザーの表示名のように、操作が高コストでありアプリケーションがパフォーマンスに敏感であるため、一度だけ計算したい計算プロパティがあるとします。委譲プロパティを使用して表示名をキャッシュすることで、計算は一度だけで済み、パフォーマンスに影響を与えることなくいつでもアクセスできるようになります。

まず、委譲先となるオブジェクトを作成する必要があります。この場合、オブジェクトは `CachedStringDelegate` クラスのインスタンスになります。

```kotlin
class CachedStringDelegate {
    var cachedValue: String? = null
}
```

`cachedValue` プロパティにはキャッシュされた値が含まれます。`CachedStringDelegate` クラス内で、委譲プロパティの `get()` 関数に持たせたい動作を `getValue()` 演算子関数の本文に追加します。

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

`getValue()` 関数は、`cachedValue` プロパティが `null` かどうかを確認します。もし `null` であれば、関数は `"Default value"` を代入し、ロギング目的で文字列を出力します。`cachedValue` プロパティがすでに計算されている場合、プロパティは `null` ではありません。この場合、ロギング目的で別の文字列が出力されます。最後に、関数は Elvis 演算子を使用して、キャッシュされた値、または値が `null` の場合は `"Unknown"` を返します。

これで、キャッシュしたいプロパティ（`val displayName`）を `CachedStringDelegate` クラスのインスタンスに委譲できます。

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

    // 初回アクセスで値が計算され、キャッシュされます
    println(user.displayName)
    // Computed and cached: John Doe
    // John Doe

    // 以降のアクセスではキャッシュから値が取得されます
    println(user.displayName)
    // Accessed from cache: John Doe
    // John Doe
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-properties-delegated"}

この例では、以下の処理を行っています。

* ヘッダーに `firstName` と `lastName` の 2 つのプロパティ、クラス本文に `displayName` という 1 つのプロパティを持つ `User` クラスを作成します。
* `displayName` プロパティを `CachedStringDelegate` クラスのインスタンスに委譲します。
* `user` という `User` クラスのインスタンスを作成します。
* `user` インスタンスの `displayName` プロパティにアクセスした結果を出力します。

`getValue()` 関数において、`thisRef` パラメータの型が `Any?` 型からオブジェクト型の `User` に絞り込まれていることに注目してください。これは、コンパイラが `User` クラスの `firstName` および `lastName` プロパティにアクセスできるようにするためです。

### 標準デリゲート (Standard delegates) {id="standard-delegates"}

Kotlin 標準ライブラリにはいくつかの便利なデリゲートが用意されているため、常に独自にゼロから作成する必要はありません。これらのデリゲートのいずれかを使用する場合、標準ライブラリが自動的に提供してくれるため、`getValue()` や `setValue()` 関数を定義する必要はありません。

#### 遅延プロパティ (Lazy properties) {id="lazy-properties"}

プロパティに初めてアクセスしたときにのみ初期化するには、遅延プロパティを使用します。標準ライブラリは委譲用に `Lazy` インターフェースを提供しています。

`Lazy` インターフェースのインスタンスを作成するには、`lazy()` 関数を使用し、`get()` 関数が初めて呼び出されたときに実行するラムダ式を渡します。それ以降の `get()` 関数の呼び出しでは、最初の呼び出しで提供されたのと同じ結果が返されます。遅延プロパティでは、ラムダ式を渡すために[末尾のラムダ (trailing lambda)](kotlin-tour-functions.md#trailing-lambdas) 構文を使用します。

例：

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

    // 以降のアクセスでは既存の接続が使用されます
    fetchData()
    // Data: [Data1, Data2, Data3]
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-properties-lazy"}

この例では、以下のようになっています。

* `connect()` および `query()` メンバ関数を持つ `Database` クラスがあります。
* `connect()` 関数はコンソールに文字列を出力し、`query()` 関数は SQL クエリを受け取ってリストを返します。
* 遅延プロパティである `databaseConnection` プロパティがあります。
* `lazy()` 関数に渡されたラムダ式は以下を行います。
  * `Database` クラスのインスタンスを作成します。
  * このインスタンス（`db`）の `connect()` メンバ関数を呼び出します。
  * そのインスタンスを返します。
* 以下の処理を行う `fetchData()` 関数があります。
  * `databaseConnection` プロパティの `query()` 関数を呼び出して SQL クエリを作成します。
  * SQL クエリを `data` 変数に代入します。
  * `data` 変数をコンソールに出力します。
* `main()` 関数は `fetchData()` 関数を呼び出します。初回呼び出し時に遅延プロパティが初期化されます。2 回目には、最初の呼び出しと同じ結果が返されます。

遅延プロパティは、初期化にリソースを多く消費する場合だけでなく、コード内でプロパティが使用されない可能性がある場合にも便利です。さらに、遅延プロパティはデフォルトでスレッドセーフであるため、並行環境で作業している場合に特に有利です。

詳細については、[遅延プロパティ](delegated-properties.md#lazy-properties)を参照してください。

#### Observable プロパティ (Observable properties) {id="observable-properties"}

プロパティの値が変更されたかどうかを監視するには、observable プロパティを使用します。observable プロパティは、プロパティ値の変更を検出し、その情報を利用して何らかのリアクションをトリガーしたい場合に役立ちます。標準ライブラリは委譲用に `Delegates` オブジェクトを提供しています。

observable プロパティを作成するには、まず `kotlin.properties.Delegates.observable` をインポートする必要があります。次に、`observable()` 関数を使用し、プロパティが変更されるたびに実行するラムダ式を渡します。遅延プロパティと同様に、observable プロパティでもラムダ式を渡すために[末尾のラムダ](kotlin-tour-functions.md#trailing-lambdas)構文を使用します。

例：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-properties-observable"}

この例では、以下のようになっています。

* observable プロパティである `temperature` を含む `Thermostat` クラスがあります。
* `observable()` 関数はパラメータとして `20.0` を受け取り、それを使用してプロパティを初期化します。
* `observable()` 関数に渡されたラムダ式は以下を行います。
  * 次の 3 つのパラメータを持ちます。
    * `_`: プロパティ自体を参照します。
    * `old`: プロパティの古い値です。
    * `new`: プロパティの新しい値です。
  * `new` パラメータが `25` より大きいかどうかを確認し、結果に応じてコンソールに文字列を出力します。
* `main()` 関数は以下を行います。
  * `thermostat` という `Thermostat` クラスのインスタンスを作成します。
  * インスタンスの `temperature` プロパティの値を `22.5` に更新します。これにより、温度の更新を示す print 文がトリガーされます。
  * インスタンスの `temperature` プロパティの値を `27.0` に更新します。これにより、警告を示す print 文がトリガーされます。

observable プロパティは、ロギングやデバッグ目的だけでなく、UI の更新や、データの妥当性の検証などの追加チェックを実行するようなユースケースにも使用できます。

詳細については、[Observable プロパティ](delegated-properties.md#observable-properties)を参照してください。

## 練習問題 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="在庫切れの本を見つける" id="properties-exercise-1">

あなたは書店で在庫管理システムを管理しています。在庫はリストに格納されており、各項目は特定の本の数量を表しています。例えば、`listOf(3, 0, 7, 12)` は、1 冊目の本が 3 冊、2 冊目が 0 冊、3 冊目が 7 冊、4 冊目が 12 冊あることを意味します。

在庫切れとなっているすべての本のインデックスのリストを返す `findOutOfStockBooks()` という関数を作成してください。

<deflist collapsible="true">
    <def title="ヒント 1">
        標準ライブラリの <a href="https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/indices.html"><code>indices</code></a> 拡張プロパティを使用してください。
    </def>
</deflist>

<deflist collapsible="true">
    <def title="ヒント 2">
        ミュータブルリストを手動で作成して返す代わりに、<a href="https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/build-list.html"><code>buildList()</code></a> 関数を使用してリストを作成・管理できます。<code>buildList()</code> 関数は、前の章で学んだレシーバ付きラムダを使用します。
    </def>
</deflist>

```kotlin
fun findOutOfStockBooks(inventory: List<Int>): List<Int> {
    // ここにコードを記述してください
}

fun main() {
    val inventory = listOf(3, 0, 7, 0, 5)
    println(findOutOfStockBooks(inventory))
    // [1, 3]
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-properties-exercise-1"}

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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例 1" id="kotlin-tour-properties-solution-1-1"}

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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例 2" id="kotlin-tour-properties-solution-1-2"}

</def>
<def title="キロメートルをマイルに変換する" id="properties-exercise-2">

キロメートルとマイルの両方で距離を表示する必要がある旅行アプリがあります。キロメートル単位の距離をマイルに変換するために、`Double` 型に対する `asMiles` という拡張プロパティを作成してください。

> キロメートルをマイルに変換する計算式は `miles = kilometers * 0.621371` です。
>
{style="note"}

<deflist collapsible="true">
    <def title="ヒント">
        拡張プロパティにはカスタムの <code>get()</code> 関数が必要であることを思い出してください。
    </def>
</deflist>

```kotlin
val // ここにコードを記述してください

fun main() {
    val distanceKm = 5.0
    println("$distanceKm km is ${distanceKm.asMiles} miles")
    // 5.0 km is 3.106855 miles

    val marathonDistance = 42.195
    println("$marathonDistance km is ${marathonDistance.asMiles} miles")
    // 42.195 km is 26.218757 miles
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-properties-exercise-2"}

```kotlin
val Double.asMiles: Double
    get() = this * 0.621371

fun main() {
    val distanceKm = 5.0
    println("$distanceKm km is ${distanceKm.asMiles} miles")
    // 5.0 km is 3.106855 miles

    val marathonDistance = 42.195
    println("$marathonDistance km is ${marathonDistance.asMiles} miles")
    // 42.195 km is 26.218757 miles
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-properties-solution-2"}

</def>
<def title="ヘルスチェックを遅延初期化する" id="properties-exercise-3">

クラウドシステムの状態を判定できるシステムヘルスチェッカーがあります。ただし、ヘルスチェックを実行するために実行できる 2 つの関数は負荷が高い処理です。必要なときにのみ高コストな関数が実行されるように、遅延プロパティを使用してチェックを初期化してください。

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
    // ここにコードを記述してください

    when {
        isAppServerHealthy -> println("Application server is online and healthy")
        isDatabaseHealthy -> println("Database is healthy")
        else -> println("System is offline")
    }
    // Performing application server health check...
    // Application server is online and healthy
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-properties-exercise-3"}

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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-properties-solution-3"}

</def>
<def title="予算の変動を追跡する" id="properties-exercise-4">

シンプルな予算管理アプリを作成しています。このアプリは、ユーザーの残り予算の変動を監視し、特定のしきい値を下回ったときに通知する必要があります。初期予算額を含む `totalBudget` プロパティで初期化される `Budget` クラスがあります。クラス内に、以下を出力する `remainingBudget` という observable プロパティを作成してください。

* 値が初期予算の 20% 未満になったときの警告。
* 予算が前回の値から増加したときの励ましのメッセージ。

```kotlin
import kotlin.properties.Delegates.observable

class Budget(val totalBudget: Int) {
    var remainingBudget: Int // ここにコードを記述してください
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
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-properties-exercise-4"}

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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-properties-solution-4"}

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