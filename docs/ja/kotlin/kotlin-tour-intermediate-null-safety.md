[//]: # (title: Null安全)

<no-index/>

初級編のツアーでは、コード内で `null` 値を扱う方法を学びました。この章では、Null安全機能の一般的なユースケースと、それらを最大限に活用する方法について説明します。

## スマートキャストと安全なキャスト

Kotlinでは、明示的な宣言がなくても型を推論できる場合があります。変数やオブジェクトを特定の型に属しているかのように扱うようKotlinに指示するプロセスは、**キャスト**（casting）と呼ばれます。型が自動的にキャストされる場合（推論される場合など）、それは**スマートキャスト**（smart casting）と呼ばれます。

### is および !is 演算子

キャストの仕組みを詳しく見る前に、オブジェクトが特定の型であるかどうかを確認する方法を見てみましょう。これには、`when` や `if` の条件式で `is` および `!is` 演算子を使用します。

* `is` はオブジェクトがその型であるかを確認し、ブール値を返します。
* `!is` はオブジェクトがその型で**ない**ことを確認し、ブール値を返します。

例：

```kotlin
fun printObjectType(obj: Any) {
    when (obj) {
        is Int -> println("It's an Integer with value $obj")
        !is Double -> println("It's NOT a Double")
        else -> println("Unknown type")
    }
}

fun main() {
    val myInt = 42
    val myDouble = 3.14
    val myList = listOf(1, 2, 3)
  
    // 型は Int
    printObjectType(myInt)
    // It's an Integer with value 42

    // 型は List なので、Double ではない
    printObjectType(myList)
    // It's NOT a Double

    // 型は Double なので、else ブランチが実行される
    printObjectType(myDouble)
    // Unknown type
}
```
{kotlin-runnable="true" id="kotlin-tour-null-safety-casts"}

> `when` 条件式で `is` および `!is` 演算子を使用する例は、[openクラスとその他の特殊なクラス](kotlin-tour-intermediate-open-special-classes.md#sealed-classes) の章ですでに確認しました。
> 
{style="tip"}

### as および as? 演算子

オブジェクトを他の型に明示的に*キャスト*するには、`as` 演算子を使用します。これには、Null許容型からそれに対応する非Null型へのキャストも含まれます。キャストが不可能な場合、プログラムは**実行時に**クラッシュします。そのため、これは**安全ではない（unsafe）**キャスト演算子と呼ばれます。

```kotlin
fun main() {
//sampleStart
    val a: String? = null
    val b = a as String

    // 実行時にエラーが発生する
    print(b)
//sampleEnd
}
```
{kotlin-runnable="true" validate="false" id="kotlin-tour-null-safety-as-operator"}

オブジェクトを非Null型に明示的にキャストしつつ、失敗した場合にエラーを投げるのではなく `null` を返したい場合は、`as?` 演算子を使用します。`as?` 演算子は失敗してもエラーを発生させないため、**安全な（safe）**演算子と呼ばれます。

```kotlin
fun main() {
//sampleStart
    val a: String? = null
    val b = a as? String

    // null 値を返す
    print(b)
    // null
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-null-safety-safe-operator"}

`as?` 演算子とエルビス演算子 `?:` を組み合わせることで、数行のコードを1行にまとめることができます。たとえば、以下の `calculateTotalStringLength()` 関数は、混在したリストに含まれるすべての文字列の合計の長さを計算します。

```kotlin
fun calculateTotalStringLength(items: List<Any>): Int {
    var totalLength = 0

    for (item in items) {
        totalLength += if (item is String) {
            item.length
        } else {
            0  // 文字列以外のアイテムには 0 を加算
        }
    }

    return totalLength
}
```

この例では：

* `totalLength` 変数をカウンターとして使用しています。
* `for` ループを使用してリスト内のすべてのアイテムをループしています。
* `if` と `is` 演算子を使用して、現在のアイテムが文字列かどうかを確認しています。
    * 文字列であれば、その長さがカウンターに加算されます。
    * 文字列でなければ、カウンターはインクリメントされません。
* `totalLength` 変数の最終的な値を返します。

このコードは以下のように短縮できます。

```kotlin
fun calculateTotalStringLength(items: List<Any>): Int {
    return items.sumOf { (it as? String)?.length ?: 0 }
}
```

この例では [`.sumOf()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/sum-of.html) 拡張関数を使用し、以下の処理を行うラムダ式を渡しています。

* リスト内の各アイテムに対して、`as?` を使用して `String` への安全なキャストを実行します。
* 安全な呼び出し `?.` を使用して、呼び出しが `null` を返さない場合に `length` プロパティにアクセスします。
* エルビス演算子 `?:` を使用して、安全な呼び出しが `null` を返した場合には `0` を返します。

## Null 値とコレクション

Kotlinにおいて、コレクションの操作には `null` 値の処理や不要な要素のフィルタリングが含まれることがよくあります。Kotlinには、リスト、セット、マップ、その他の種類のコレクションを扱う際に、クリーンで効率的、かつNull安全なコードを書くために役立つ関数が用意されています。

リストから `null` 値をフィルタリングするには、[`filterNotNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/filter-not-null.html) 関数を使用します。

```kotlin
fun main() {
//sampleStart
    val emails: List<String?> = listOf("alice@example.com", null, "bob@example.com", null, "carol@example.com")

    val validEmails = emails.filterNotNull()

    println(validEmails)
    // [alice@example.com, bob@example.com, carol@example.com]
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-null-safety-filternotnull"}

リストの作成時に直接 `null` 値のフィルタリングを行いたい場合は、[`listOfNotNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/list-of-not-null.html) 関数を使用します。

```kotlin
fun main() {
//sampleStart
    val serverConfig = mapOf(
        "appConfig.json" to "App Configuration",
        "dbConfig.json" to "Database Configuration"
    )

    val requestedFile = "appConfig.json"
    val configFiles = listOfNotNull(serverConfig[requestedFile])

    println(configFiles)
    // [App Configuration]
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-null-safety-listofnotnull"}

これらの例では、すべてのアイテムが `null` 値である場合、空のリストが返されます。

Kotlinには、コレクション内の値を検索するために使用できる関数も用意されています。値が見つからない場合、これらはエラーを発生させる代わりに `null` 値を返します。

* [`maxOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/max-or-null.html) は最大値を見つけます。存在しない場合は `null` を返します。
* [`minOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/min-or-null.html) は最小値を見つけます。存在しない場合は `null` を返します。

例：

```kotlin
fun main() {
//sampleStart
    // 1週間に記録された気温
    val temperatures = listOf(15, 18, 21, 21, 19, 17, 16)
  
    // 週の最高気温を見つける
    val maxTemperature = temperatures.maxOrNull()
    println("Highest temperature recorded: ${maxTemperature ?: "No data"}")
    // Highest temperature recorded: 21

    // 週の最低気温を見つける
    val minTemperature = temperatures.minOrNull()
    println("Lowest temperature recorded: ${minTemperature ?: "No data"}")
    // Lowest temperature recorded: 15
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-null-safety-collections"}

この例では、エルビス演算子 `?:` を使用して、関数が `null` 値を返した場合に出力する文字列を指定しています。

> `maxOrNull()` および `minOrNull()` 関数は、`null` 値を**含まない**コレクションで使用するように設計されています。そうでない場合、関数が目的の値を見つけられなかったのか、それとも `null` 値を見つけたのかを区別できません。
>
{style="note"}

[`singleOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/single-or-null.html) 関数をラムダ式と組み合わせて使用すると、条件に一致する単一のアイテムを検索できます。一致するものが存在しない、あるいは複数存在する場合、関数は `null` 値を返します。

```kotlin
fun main() {
//sampleStart
    // 1週間に記録された気温
    val temperatures = listOf(15, 18, 21, 21, 19, 17, 16)

    // 気温がちょうど30度の日が1日だけあったか確認する
    val singleHotDay = temperatures.singleOrNull{ it == 30 }
    println("Single hot day with 30 degrees: ${singleHotDay ?: "None"}")
    // Single hot day with 30 degrees: None
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-null-safety-singleornull"}

> `singleOrNull()` 関数は、`null` 値を**含まない**コレクションで使用するように設計されています。
>
{style="note"}

一部の関数は、ラムダ式を使用してコレクションを変換し、目的を果たせない場合には `null` 値を返します。

ラムダ式でコレクションを変換し、`null` ではない最初の値を返すには、[`firstNotNullOfOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/first-not-null-of-or-null.html) 関数を使用します。そのような値が存在しない場合、関数は `null` 値を返します。

```kotlin
fun main() {
//sampleStart
    data class User(val name: String?, val age: Int?)

    val users = listOf(
        User(null, 25),
        User("Alice", null),
        User("Bob", 30)
    )

    val firstNonNullName = users.firstNotNullOfOrNull { it.name }
    println(firstNonNullName)
    // Alice
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-null-safety-firstnotnullofornull"}

各コレクションアイテムを順次処理して累積値を作成する（またはコレクションが空の場合は `null` 値を返す）には、[`reduceOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/reduce-or-null.html) 関数を使用します。

```kotlin
fun main() {
//sampleStart
    // ショッピングカート内のアイテムの価格
    val itemPrices = listOf(20, 35, 15, 40, 10)

    // reduceOrNull() 関数を使用して合計金額を計算する
    val totalPrice = itemPrices.reduceOrNull { runningTotal, price -> runningTotal + price }
    println("Total price of items in the cart: ${totalPrice ?: "No items"}")
    // Total price of items in the cart: 120

    val emptyCart = listOf<Int>()
    val emptyTotalPrice = emptyCart.reduceOrNull { runningTotal, price -> runningTotal + price }
    println("Total price of items in the empty cart: ${emptyTotalPrice ?: "No items"}")
    // Total price of items in the empty cart: No items
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-null-safety-reduceornull"}

この例でも、関数が `null` 値を返した場合に出力する文字列を指定するためにエルビス演算子 `?:` を使用しています。

> `reduceOrNull()` 関数は、`null` 値を**含まない**コレクションで使用するように設計されています。
>
{style="note"}

コードをより安全にするために使用できるその他の関数については、Kotlinの [標準ライブラリ](https://kotlinlang.org/api/core/kotlin-stdlib/) を探索してください。

## 早期リターンとエルビス演算子

初級編のツアーでは、関数の処理を特定の地点で停止させるために [早期リターン](kotlin-tour-functions.md#early-returns-in-functions) を使用する方法を学びました。エルビス演算子 `?:` を早期リターンと組み合わせて使用することで、関数内の事前条件をチェックできます。このアプローチは、ネストされたチェックを使用する必要がないため、コードを簡潔に保つのに最適です。コードの複雑さが軽減されるため、メンテナンスも容易になります。例：

```kotlin
data class User(
    val id: Int,
    val name: String,
    // 友人のユーザーIDのリスト
    val friends: List<Int>
)

// ユーザーの友人の数を取得する関数
fun getNumberOfFriends(users: Map<Int, User>, userId: Int): Int {
    // ユーザーを取得し、見つからない場合は -1 を返す
    val user = users[userId] ?: return -1
    // 友人の数を返す
    return user.friends.size
}

fun main() {
    // サンプルユーザーを作成
    val user1 = User(1, "Alice", listOf(2, 3))
    val user2 = User(2, "Bob", listOf(1))
    val user3 = User(3, "Charlie", listOf(1))

    // ユーザーのマップを作成
    val users = mapOf(1 to user1, 2 to user2, 3 to user3)

    println(getNumberOfFriends(users, 1))
    // 2
    println(getNumberOfFriends(users, 2))
    // 1
    println(getNumberOfFriends(users, 4))
    // -1
}
```
{kotlin-runnable="true" id="kotlin-tour-null-safety-early-return"}

この例では：

* `id`、`name`、および友人のリストのプロパティを持つ `User` データクラスがあります。
* `getNumberOfFriends()` 関数は：
    * `User` インスタンスのマップと、整数としてのユーザーIDを受け取ります。
    * 提供されたユーザーIDを使用して `User` インスタンスのマップの値にアクセスします。
    * エルビス演算子を使用して、マップの値が `null` の場合に `-1` という値で関数を早期に終了させます。
    * マップから見つかった値を `user` 変数に代入します。
    * `size` プロパティを使用して、ユーザーの友人リストの友人数を返します。
* `main()` 関数は：
    * 3つの `User` インスタンスを作成します。
    * これらの `User` インスタンスのマップを作成し、`users` 変数に代入します。
    * `users` 変数に対して `1` と `2` の値で `getNumberOfFriends()` 関数を呼び出し、`"Alice"` には2人の友人が、`"Bob"` には1人の友人がいることを返します。
    * `users` 変数に対して `4` の値で `getNumberOfFriends()` 関数を呼び出し、値 `-1` で早期リターンを発生させます。

早期リターンを使わなくても、コードをもっと簡潔にできることに気づくかもしれません。しかし、そのアプローチでは `users[userId]` が `null` 値を返す可能性があるため、複数の安全な呼び出しが必要になり、コードが少し読みにくくなります。

```kotlin
fun getNumberOfFriends(users: Map<Int, User>, userId: Int): Int {
    // ユーザーを取得し、見つからない場合は -1 を返す
    return users[userId]?.friends?.size ?: -1
}
```
{validate="false"}

この例ではエルビス演算子で1つの条件のみをチェックしていますが、重要なエラーパスをカバーするために複数のチェックを追加することもできます。エルビス演算子を使用した早期リターンは、プログラムが不要な処理を行うのを防ぎ、`null` 値や無効なケースが検出されたらすぐに停止させることで、コードをより安全にします。

コードで `return` を使用する方法の詳細については、[リターンとジャンプ](returns.md) を参照してください。

## 練習問題 {completion-point="true"}

### 練習問題 1 {initial-collapse-state="collapsed" collapsible="true" id="null-safety-exercise-1"}

ユーザーがさまざまな種類の通知を有効または無効にできるアプリの通知システムを開発しています。以下の条件を満たすように `getNotificationPreferences()` 関数を完成させてください。

1. `validUser` 変数で `as?` 演算子を使用して、`user` が `User` クラスのインスタンスであるかを確認する。そうでなければ空のリストを返す。
2. `userName` 変数でエルビス演算子 `?:` を使用して、ユーザー名が `null` の場合にデフォルトで `"Guest"` になるようにする。
3. 最終的な return 文で `.takeIf()` 関数を使用し、メールとSMSの通知設定が有効な場合にのみ含めるようにする。
4. `main()` 関数が正常に実行され、期待通りの出力が表示されるようにする。

> [`takeIf()` 関数](scope-functions.md#takeif-and-takeunless) は、与えられた条件が真であれば元の値を返し、そうでなければ `null` を返します。例：
>
> ```kotlin
> fun main() {
>     // ユーザーがログインしている
>     val userIsLoggedIn = true
>     // ユーザーにアクティブなセッションがある
>     val hasSession = true
> 
>     // ユーザーがログインしており、かつアクティブなセッションがある場合に
>     // ダッシュボードへのアクセスを許可する
>     val canAccessDashboard = userIsLoggedIn.takeIf { hasSession }
> 
>     println(canAccessDashboard ?: "Access denied")
>     // true
> }
> ```
>
{style = "tip"}

|--|--|

```kotlin
data class User(val name: String?)

fun getNotificationPreferences(user: Any, emailEnabled: Boolean, smsEnabled: Boolean): List<String> {
    val validUser = // ここにコードを書いてください
    val userName = // ここにコードを書いてください

    return listOfNotNull( /* ここにコードを書いてください */)
}

fun main() {
    val user1 = User("Alice")
    val user2 = User(null)
    val invalidUser = "NotAUser"

    println(getNotificationPreferences(user1, emailEnabled = true, smsEnabled = false))
    // [Email Notifications enabled for Alice]
    println(getNotificationPreferences(user2, emailEnabled = false, smsEnabled = true))
    // [SMS Notifications enabled for Guest]
    println(getNotificationPreferences(invalidUser, emailEnabled = true, smsEnabled = true))
    // []
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-null-safety-exercise-1"}

|--|--|

```kotlin
data class User(val name: String?)

fun getNotificationPreferences(user: Any, emailEnabled: Boolean, smsEnabled: Boolean): List<String> {
    val validUser = user as? User ?: return emptyList()
    val userName = validUser.name ?: "Guest"

    return listOfNotNull(
        "Email Notifications enabled for $userName".takeIf { emailEnabled },
        "SMS Notifications enabled for $userName".takeIf { smsEnabled }
    )
}

fun main() {
    val user1 = User("Alice")
    val user2 = User(null)
    val invalidUser = "NotAUser"

    println(getNotificationPreferences(user1, emailEnabled = true, smsEnabled = false))
    // [Email Notifications enabled for Alice]
    println(getNotificationPreferences(user2, emailEnabled = false, smsEnabled = true))
    // [SMS Notifications enabled for Guest]
    println(getNotificationPreferences(invalidUser, emailEnabled = true, smsEnabled = true))
    // []
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-null-safety-solution-1"}

### 練習問題 2 {initial-collapse-state="collapsed" collapsible="true" id="null-safety-exercise-2"}

あなたはサブスクリプション制のストリーミングサービスに取り組んでおり、ユーザーは複数のサブスクリプションを持つことができますが、**一度にアクティブにできるのは1つだけ**です。`singleOrNull()` 関数を述語（predicate）とともに使用して、アクティブなサブスクリプションが複数ある場合に `null` 値を返すように、`getActiveSubscription()` 関数を完成させてください。

|--|--|

```kotlin
data class Subscription(val name: String, val isActive: Boolean)

fun getActiveSubscription(subscriptions: List<Subscription>): Subscription? // ここにコードを書いてください

fun main() {
    val userWithPremiumPlan = listOf(
        Subscription("Basic Plan", false),
        Subscription("Premium Plan", true)
    )

    val userWithConflictingPlans = listOf(
        Subscription("Basic Plan", true),
        Subscription("Premium Plan", true)
    )

    println(getActiveSubscription(userWithPremiumPlan))
    // Subscription(name=Premium Plan, isActive=true)

    println(getActiveSubscription(userWithConflictingPlans))
    // null
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-null-safety-exercise-2"}

|--|--|

```kotlin
data class Subscription(val name: String, val isActive: Boolean)

fun getActiveSubscription(subscriptions: List<Subscription>): Subscription? {
    return subscriptions.singleOrNull { subscription -> subscription.isActive }
}

fun main() {
    val userWithPremiumPlan = listOf(
        Subscription("Basic Plan", false),
        Subscription("Premium Plan", true)
    )

    val userWithConflictingPlans = listOf(
        Subscription("Basic Plan", true),
        Subscription("Premium Plan", true)
    )

    println(getActiveSubscription(userWithPremiumPlan))
    // Subscription(name=Premium Plan, isActive=true)

    println(getActiveSubscription(userWithConflictingPlans))
    // null
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例 1" id="kotlin-tour-null-safety-solution-2-1"}

|--|--|

```kotlin
data class Subscription(val name: String, val isActive: Boolean)

fun getActiveSubscription(subscriptions: List<Subscription>): Subscription? =
    subscriptions.singleOrNull { it.isActive }

fun main() {
    val userWithPremiumPlan = listOf(
        Subscription("Basic Plan", false),
        Subscription("Premium Plan", true)
    )

    val userWithConflictingPlans = listOf(
        Subscription("Basic Plan", true),
        Subscription("Premium Plan", true)
    )

    println(getActiveSubscription(userWithPremiumPlan))
    // Subscription(name=Premium Plan, isActive=true)

    println(getActiveSubscription(userWithConflictingPlans))
    // null
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例 2" id="kotlin-tour-null-safety-solution-2-2"}

### 練習問題 3 {initial-collapse-state="collapsed" collapsible="true" id="null-safety-exercise-3"}

あなたはソーシャルメディアプラットフォームに取り組んでおり、ユーザーにはユーザー名とアカウントステータスがあります。現在アクティブなユーザー名のリストを確認したいと考えています。[`mapNotNull()` 関数](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/map-not-null.html) に、ユーザーがアクティブであればそのユーザー名を返し、そうでなければ `null` 値を返す述語（predicate）を指定して、`getActiveUsernames()` 関数を完成させてください。

|--|--|

```kotlin
data class User(val username: String, val isActive: Boolean)

fun getActiveUsernames(users: List<User>): List<String> {
    return users.mapNotNull { /* ここにコードを書いてください */ }
}

fun main() {
    val allUsers = listOf(
        User("alice123", true),
        User("bob_the_builder", false),
        User("charlie99", true)
    )

    println(getActiveUsernames(allUsers))
    // [alice123, charlie99]
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-null-safety-exercise-3"}

|--|--|

> 練習問題 1 と同様に、ユーザーがアクティブかどうかをチェックする際に [`takeIf()` 関数](scope-functions.md#takeif-and-takeunless) を使用することもできます。
>
{ style = "tip" }

|--|--|

```kotlin
data class User(val username: String, val isActive: Boolean)

fun getActiveUsernames(users: List<User>): List<String> {
    return users.mapNotNull { user ->
        if (user.isActive) user.username else null
    }
}

fun main() {
    val allUsers = listOf(
        User("alice123", true),
        User("bob_the_builder", false),
        User("charlie99", true)
    )

    println(getActiveUsernames(allUsers))
    // [alice123, charlie99]
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例 1" id="kotlin-tour-null-safety-solution-3-1"}

|--|--|

```kotlin
data class User(val username: String, val isActive: Boolean)

fun getActiveUsernames(users: List<User>): List<String> =
    users.mapNotNull { user -> user.username.takeIf { user.isActive } }

fun main() {
    val allUsers = listOf(
        User("alice123", true),
        User("bob_the_builder", false),
        User("charlie99", true)
    )

    println(getActiveUsernames(allUsers))
    // [alice123, charlie99]
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例 2" id="kotlin-tour-null-safety-solution-3-2"}

### 練習問題 4 {initial-collapse-state="collapsed" collapsible="true" id="null-safety-exercise-4"}

あなたは Eコマースプラットフォームの在庫管理システムに取り組んでいます。販売を処理する前に、利用可能な在庫に基づいて、製品の要求数量が有効かどうかを確認する必要があります。

早期リターンとエルビス演算子（該当する場合）を使用して、以下をチェックするように `validateStock()` 関数を完成させてください。

* `requested` 変数が `null` である。
* `available` 変数が `null` である。
* `requested` 変数が負の値である。
* `requested` 変数の量が `available` 変数の量よりも多い。

上記のすべての場合において、関数は値 `-1` で早期リターンする必要があります。

|--|--|

```kotlin
fun validateStock(requested: Int?, available: Int?): Int {
    // ここにコードを書いてください
}

fun main() {
    println(validateStock(5,10))
    // 5
    println(validateStock(null,10))
    // -1
    println(validateStock(-2,10))
    // -1
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-null-safety-exercise-4"}

|--|--|

```kotlin
fun validateStock(requested: Int?, available: Int?): Int {
    val validRequested = requested ?: return -1
    val validAvailable = available ?: return -1

    if (validRequested < 0) return -1
    if (validRequested > validAvailable) return -1

    return validRequested
}

fun main() {
    println(validateStock(5,10))
    // 5
    println(validateStock(null,10))
    // -1
    println(validateStock(-2,10))
    // -1
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-null-safety-solution-4"}

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-intermediate-properties.md" mode="outline" icon="arrow-left" icon-position="left">前のステップ</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-intermediate-libraries-and-apis.md" mode="classic" icon="arrow-right" icon-position="right">次のステップ</a>
  </li>
</list>