[//]: # (title: 中級：プロパティ)

<no-index/>

<tldr>
    <p><img src="icon-1-done.svg" width="20" alt="First step" /> <a href="kotlin-tour-intermediate-extension-functions.md">拡張関数</a><br />
        <img src="icon-2-done.svg" width="20" alt="Second step" /> <a href="kotlin-tour-intermediate-scope-functions.md">スコープ関数</a><br />
        <img src="icon-3-done.svg" width="20" alt="Third step" /> <a href="kotlin-tour-intermediate-lambdas-receiver.md">レシーバ付きラムダ式</a><br />
        <img src="icon-4-done.svg" width="20" alt="Fourth step" /> <a href="kotlin-tour-intermediate-classes-interfaces.md">クラスとインターフェース</a><br />
        <img src="icon-5-done.svg" width="20" alt="Fifth step" /> <a href="kotlin-tour-intermediate-objects.md">オブジェクト</a><br />
        <img src="icon-6-done.svg" width="20" alt="Sixth step" /> <a href="kotlin-tour-intermediate-open-special-classes.md">Openクラスと特殊なクラス</a><br />
        <img src="icon-7.svg" width="20" alt="Seventh step" /> <strong>プロパティ</strong><br />
        <img src="icon-8-todo.svg" width="20" alt="Eighth step" /> <a href="kotlin-tour-intermediate-null-safety.md">Null安全</a><br />
        <img src="icon-9-todo.svg" width="20" alt="Ninth step" /> <a href="kotlin-tour-intermediate-libraries-and-apis.md">ライブラリとAPI</a></p>
</tldr>

初心者向けツアーでは、クラスのインスタンスの特性を宣言するためにプロパティがどのように使用されるか、またそれらにアクセスする方法を学びました。この章では、Kotlinにおけるプロパティの仕組みをさらに深く掘り下げ、コードでプロパティを活用する他の方法について探ります。

## バッキングフィールド（Backing fields）

Kotlinでは、プロパティにはデフォルトで `get()` および `set()` 関数があり、これらはプロパティアクセサ（property accessors）として知られています。これらは値の取得と変更を処理します。これらのデフォルト関数はコード上には明示的に現れませんが、コンパイラはバックグラウンドでプロパティへのアクセスを管理するためにそれらを自動生成します。これらのアクセサは、実際のプロパティの値を保存するために**バッキングフィールド（backing field）**を使用します。

以下のいずれかに当てはまる場合、バッキングフィールドが存在します。

* プロパティに対してデフォルトの `get()` または `set()` 関数を使用している場合。
* コード内で `field` キーワードを使用してプロパティ値にアクセスしようとしている場合。

> `get()` および `set()` 関数は、ゲッター（getters）およびセッター（setters）とも呼ばれます。
>
{style="tip"}

例えば、次のコードには `category` プロパティがありますが、カスタムの `get()` または `set()` 関数がないため、デフォルトの実装が使用されます。

```kotlin
class Contact(val id: Int, var email: String) {
    var category: String = ""
}
```

内部的には、これは次の擬似コードと同等です。

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

この例では以下のようになります。

* `get()` 関数は、フィールドからプロパティの値（`""`）を取得します。
* `set()` 関数は、`value` をパラメータとして受け取り、それをフィールドに代入します（この場合の `value` は `""` です）。

バッキングフィールドへのアクセスは、無限ループを引き起こすことなく `get()` または `set()` 関数に独自のロジックを追加したい場合に便利です。例えば、`name` プロパティを持つ `Person` クラスがあるとします。

```kotlin
class Person {
    var name: String = ""
}
```

`name` プロパティの最初の文字を確実に大文字にしたいと考え、[`.replaceFirstChar()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/replace-first-char.html) と [`.uppercase()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/uppercase-char.html) 拡張関数を使用するカスタム `set()` 関数を作成するとします。しかし、`set()` 関数内でプロパティを直接参照してしまうと、無限ループが発生し、実行時に `StackOverflowError` が表示されます。

```kotlin
class Person {
    var name: String = ""
        set(value) {
            // これはランタイムエラーの原因になります
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

これを修正するには、`field` キーワードを使用して `set()` 関数内でバッキングフィールドを参照します。

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

バッキングフィールドは、ログの追加、プロパティ値が変更されたときの通知送信、または新旧のプロパティ値を比較する追加ロジックを使用する場合にも役立ちます。

詳細については、[バッキングフィールド](properties.md#backing-fields)を参照してください。

## 拡張プロパティ（Extension properties）

拡張関数と同じように、拡張プロパティも存在します。拡張プロパティを使用すると、既存のクラスのソースコードを変更することなく、そのクラスに新しいプロパティを追加できます。ただし、Kotlinの拡張プロパティにはバッキングフィールドが**ありません**。つまり、`get()` 関数（および必要に応じて `set()` 関数）を自分で記述する必要があります。また、バッキングフィールドがないということは、状態を保持できないことを意味します。

拡張プロパティを宣言するには、拡張したいクラス名の後に `.` とプロパティ名を記述します。通常のクラスプロパティと同様に、プロパティの型を宣言する必要があります。
例：

```kotlin
val String.lastChar: Char
```
{validate="false"}

拡張プロパティは、継承を使用せずにプロパティに計算された値を持たせたい場合に最も役立ちます。拡張プロパティは、パラメータが1つ（レシーバ）だけの関数のように動作すると考えることができます。

例えば、`firstName` と `lastName` という2つのプロパティを持つ `Person` というデータクラスがあるとします。

```kotlin
data class Person(val firstName: String, val lastName: String)
```

`Person` データクラスを変更したり継承したりすることなく、その人のフルネームにアクセスできるようにしたいとします。これは、カスタム `get()` 関数を持つ拡張プロパティを作成することで実現できます。

```kotlin
data class Person(val firstName: String, val lastName: String)

// フルネームを取得するための拡張プロパティ
val Person.fullName: String
    get() = "$firstName $lastName"

fun main() {
    val person = Person(firstName = "John", lastName = "Doe")

    // 拡張プロパティを使用する
    println(person.fullName)
    // John Doe
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-properties-extension"}

> 拡張プロパティでクラスの既存のプロパティをオーバーライドすることはできません。
> 
{style="note"}

拡張関数と同様に、Kotlin標準ライブラリでは拡張プロパティが広く使用されています。例えば、`CharSequence` の [`lastIndex` プロパティ](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/last-index.html) などがあります。

## 委譲プロパティ（Delegated properties）

[クラスとインターフェース](kotlin-tour-intermediate-classes-interfaces.md#delegation)の章ですでに委譲について学びました。プロパティでも委譲を使用して、プロパティアクセサを別のオブジェクトに委譲することができます。これは、単純なバッキングフィールドでは処理できない、複雑なプロパティ保存要件（データベーステーブル、ブラウザセッション、マップへの値の保存など）がある場合に便利です。また、委譲プロパティを使用すると、プロパティの取得と設定のロジックが委譲先のオブジェクトにのみ集約されるため、ボイラープレートコードが削減されます。

構文はクラスの委譲と似ていますが、異なるレベルで動作します。プロパティを宣言し、その後に `by` キーワードと委譲先のオブジェクトを記述します。例：

```kotlin
val displayName: String by Delegate
```

ここで、委譲プロパティ `displayName` は、プロパティアクセサとして `Delegate` オブジェクトを参照します。

委譲先のすべてのオブジェクトは、Kotlinが委譲プロパティの値を取得するために使用する `getValue()` オペレータ関数を持っている**必要があります**。プロパティがミュータブル（変更可能）な場合は、Kotlinが値を設定するための `setValue()` オペレータ関数も持っている必要があります。

デフォルトでは、`getValue()` と `setValue()` 関数は次のような構造をしています。

```kotlin
operator fun getValue(thisRef: Any?, property: KProperty<*>): String {}

operator fun setValue(thisRef: Any?, property: KProperty<*>, value: String) {}
```
{validate="false"}

これらの関数において：

* `operator` キーワードは、これらの関数をオペレータ関数としてマークし、`get()` および `set()` 関数をオーバーロードできるようにします。
* `thisRef` パラメータは、委譲プロパティを**含む**オブジェクトを参照します。デフォルトでは型は `Any?` に設定されていますが、より具体的な型を宣言する必要がある場合もあります。
* `property` パラメータは、値がアクセスまたは変更されるプロパティを参照します。このパラメータを使用して、プロパティの名前や型などの情報にアクセスできます。デフォルトでは型は `KProperty<*>` に設定されていますが、`Any?` を使用することもできます。通常、コード内でこれを変更することを心配する必要はありません。

`getValue()` 関数の戻り値の型はデフォルトで `String` ですが、必要に応じて調整できます。

`setValue()` 関数には追加のパラメータ `value` があり、これはプロパティに割り当てられる新しい値を保持するために使用されます。

では、これが実際にどのように見えるか見てみましょう。例えば、ユーザーの表示名のように、計算コストが高く、アプリケーションのパフォーマンスが重要なため、一度だけ計算したい計算プロパティがあるとします。委譲プロパティを使用して表示名をキャッシュすることで、計算は一度だけで、パフォーマンスに影響を与えることなくいつでもアクセスできるようにすることができます。

まず、委譲先のオブジェクトを作成する必要があります。この場合、オブジェクトは `CachedStringDelegate` クラスのインスタンスになります。

```kotlin
class CachedStringDelegate {
    var cachedValue: String? = null
}
```

`cachedValue` プロパティはキャッシュされた値を保持します。`CachedStringDelegate` クラス内で、委譲プロパティの `get()` 関数に期待する動作を `getValue()` オペレータ関数のボディに追加します。

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

`getValue()` 関数は `cachedValue` プロパティが `null` かどうかをチェックします。`null` の場合、関数は `"Default value"` を代入し、ログ目的で文字列をプリントします。`cachedValue` プロパティがすでに計算されている場合、プロパティは `null` ではありません。この場合、ログ目的で別の文字列がプリントされます。最後に、関数はエルビス演算子を使用してキャッシュされた値を返すか、値が `null` の場合は `"Unknown"` を返します。

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

    // 初回のアクセスで値を計算し、キャッシュします
    println(user.displayName)
    // Computed and cached: John Doe
    // John Doe

    // 以降のアクセスではキャッシュから値を取得します
    println(user.displayName)
    // Accessed from cache: John Doe
    // John Doe
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-properties-delegated"}

この例では以下のようになります。

* ヘッダーに `firstName` と `lastName` の2つのプロパティを持ち、クラスボディに `displayName` プロパティを持つ `User` クラスを作成します。
* `displayName` プロパティを `CachedStringDelegate` クラスのインスタンスに委譲します。
* `user` という `User` クラスのインスタンスを作成します。
* `user` インスタンスの `displayName` プロパティにアクセスした結果をプリントします。

`getValue()` 関数において、`thisRef` パラメータの型が `Any?` からオブジェクト型である `User` に限定されていることに注目してください。これにより、コンパイラは `User` クラスの `firstName` および `lastName` プロパティにアクセスできるようになります。

### 標準の委譲（Standard delegates）

Kotlin標準ライブラリは便利な委譲をいくつか提供しているため、常にゼロから作成する必要はありません。これらの委譲のいずれかを使用する場合、標準ライブラリが自動的に提供するため、`getValue()` および `setValue()` 関数を定義する必要はありません。

#### 遅延プロパティ（Lazy properties）

プロパティを最初にアクセスしたときにのみ初期化するには、遅延プロパティを使用します。標準ライブラリは委譲のために `Lazy` インターフェースを提供しています。

`Lazy` インターフェースのインスタンスを作成するには、`lazy()` 関数を使用し、`get()` 関数が最初に呼び出されたときに実行するラムダ式を渡します。それ以降の `get()` 関数の呼び出しでは、最初の呼び出しで提供されたのと同じ結果が返されます。遅延プロパティは、ラムダ式を渡すために[末尾のラムダ（trailing lambda）](kotlin-tour-functions.md#trailing-lambdas)構文を使用します。

例：

```kotlin
class Database {
    fun connect() {
        println("Connecting to the database...")
    }

    fun query(sql: String): `List<String>` {
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

    // 以降のアクセスでは既存の接続を使用します
    fetchData()
    // Data: [Data1, Data2, Data3]
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-properties-lazy"}

この例では以下のようになります。

* `connect()` および `query()` メンバ関数を持つ `Database` クラスがあります。
* `connect()` 関数はコンソールに文字列をプリントし、`query()` 関数はSQLクエリを受け取ってリストを返します。
* 遅延プロパティである `databaseConnection` プロパティがあります。
* `lazy()` 関数に提供されるラムダ式は以下のことを行います。
  * `Database` クラスのインスタンスを作成します。
  * このインスタンス（`db`）に対して `connect()` メンバ関数を呼び出します。
  * インスタンスを返します。
* 以下のことを行う `fetchData()` 関数があります。
  * `databaseConnection` プロパティに対して `query()` 関数を呼び出し、SQLクエリを作成します。
  * SQLクエリの結果を `data` 変数に代入します。
  * `data` 変数をコンソールにプリントします。
* `main()` 関数は `fetchData()` 関数を呼び出します。最初に呼び出されたときに遅延プロパティが初期化されます。2回目は、最初の呼び出しと同じ結果が返されます。

遅延プロパティは、初期化にリソースを多く消費する場合だけでなく、プロパティがコード内で使用されない可能性がある場合にも役立ちます。さらに、遅延プロパティはデフォルトでスレッドセーフであり、並行環境で作業している場合に特に有益です。

詳細については、[遅延プロパティ](delegated-properties.md#lazy-properties)を参照してください。

#### Observable プロパティ（Observable properties）

プロパティの値が変更されたかどうかを監視するには、Observable プロパティを使用します。Observable プロパティは、プロパティ値の変化を検出し、その知識を利用して反応をトリガーしたい場合に役立ちます。標準ライブラリは委譲のために `Delegates` オブジェクトを提供しています。

Observable プロパティを作成するには、まず `kotlin.properties.Delegates.observable` をインポートする必要があります。次に、`observable()` 関数を使用し、プロパティが変更されるたびに実行されるラムダ式を提供します。遅延プロパティと同様に、Observable プロパティはラムダ式を渡すために[末尾のラムダ（trailing lambda）](kotlin-tour-functions.md#trailing-lambdas)構文を使用します。

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

この例では以下のようになります。

* Observable プロパティ `temperature` を含む `Thermostat` クラスがあります。
* `observable()` 関数はパラメータとして `20.0` を受け取り、それを使用してプロパティを初期化します。
* `observable()` 関数に提供されるラムダ式は以下の通りです。
  * 3つのパラメータを持ちます：
    * `_`：プロパティ自体を参照します。
    * `old`：プロパティの古い値です。
    * `new`：プロパティの新しい値です。
  * `new` パラメータが `25` より大きいかどうかをチェックし、結果に応じて文字列をコンソールにプリントします。
* `main()` 関数は以下の通りです。
  * `thermostat` という `Thermostat` クラスのインスタンスを作成します。
  * インスタンスの `temperature` プロパティの値を `22.5` に更新し、温度更新のプリント文をトリガーします。
  * インスタンスの `temperature` プロパティの値を `27.0` に更新し、警告のプリント文をトリガーします。

Observable プロパティはログ記録やデバッグ目的だけでなく、UIの更新や、データの妥当性の検証などの追加チェックの実行といったユースケースにも役立ちます。

詳細については、[Observable プロパティ](delegated-properties.md#observable-properties)を参照してください。

## 練習問題

### 練習問題 1 {initial-collapse-state="collapsed" collapsible="true" id="properties-exercise-1"}

あなたは書店の在庫管理システムを管理しています。在庫はリストに保存されており、各アイテムは特定の書籍の数量を表します。例えば、`listOf(3, 0, 7, 12)` は、最初の本が3冊、2番目が0冊、3番目が7冊、4番目が12冊あることを意味します。

在庫切れ（数量が0）のすべての書籍のインデックスのリストを返す `findOutOfStockBooks()` という関数を記述してください。

<deflist collapsible="true">
    <def title="ヒント 1">
        標準ライブラリの <a href="https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/indices.html"><code>indices</code></a> 拡張プロパティを使用してください。
    </def>
</deflist>

<deflist collapsible="true">
    <def title="ヒント 2">
        ミュータブルなリストを手動で作成して返す代わりに、<a href="https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/build-list.html"><code>buildList()</code></a> 関数を使用してリストを作成・管理できます。<code>buildList()</code> 関数は、前の章で学んだレシーバ付きラムダを使用します。
    </def>
</deflist>

|--|--|

```kotlin
fun findOutOfStockBooks(inventory: List<Int>): `List<Int>` {
    // ここにコードを書いてください
}

fun main() {
    val inventory = listOf(3, 0, 7, 0, 5)
    println(findOutOfStockBooks(inventory))
    // [1, 3]
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-properties-exercise-1"}

|---|---|
```kotlin
fun findOutOfStockBooks(inventory: List<Int>): `List<Int>` {
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

|---|---|
```kotlin
fun findOutOfStockBooks(inventory: List<Int>): `List<Int>` = buildList {
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

### 練習問題 2 {initial-collapse-state="collapsed" collapsible="true" id="properties-exercise-2"}

キロメートルとマイルの両方で距離を表示する必要がある旅行アプリがあります。`Double` 型に `asMiles` という拡張プロパティを作成して、キロメートル単位の距離をマイルに変換してください。

> キロメートルをマイルに変換する公式は `miles = kilometers * 0.621371` です。
>
{style="note"}

<deflist collapsible="true">
    <def title="ヒント">
        拡張プロパティにはカスタムの <code>get()</code> 関数が必要であることを思い出してください。
    </def>
</deflist>

|---|---|

```kotlin
val // ここにコードを書いてください

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

|---|---|
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

### 練習問題 3 {initial-collapse-state="collapsed" collapsible="true" id="properties-exercise-3"}

クラウドシステムの状態を判断できるシステムヘルスチェッカーがあります。ただし、ヘルスチェックを実行するために実行できる2つの関数はパフォーマンスを大量に消費します。遅延プロパティを使用してチェックを初期化し、コストの高い関数が必要なときにのみ実行されるようにしてください。

|---|---|

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
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-properties-exercise-3"}

|---|---|
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

### 練習問題 4 {initial-collapse-state="collapsed" collapsible="true" id="properties-exercise-4"}

シンプルな予算トラッカーアプリを構築しています。このアプリは、ユーザーの残り予算の変化を監視し、特定のしきい値を下回るたびに通知する必要があります。初期予算額を含む `totalBudget` プロパティで初期化される `Budget` クラスがあります。クラス内に、以下をプリントする `remainingBudget` という Observable プロパティを作成してください。

* 値が初期予算の 20% 未満になったときの警告。
* 予算が以前の値から増加したときの励ましのメッセージ。

|---|---|

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
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-properties-exercise-4"}

|---|---|
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

## 次のステップ

[中級：Null安全](kotlin-tour-intermediate-null-safety.md)