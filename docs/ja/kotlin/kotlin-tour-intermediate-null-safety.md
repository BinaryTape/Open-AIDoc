[//]: # (title: Null安全（Null safety）)

<no-index/>

入門ツアーでは、コード内で `null` 値を処理する方法を学びました。この章では、Null安全機能の一般的なユースケースと、それらを最大限に活用する方法について解説します。

## スマートキャストとセーフキャスト {id="smart-casts-and-safe-casts"}

Kotlin は、明示的な宣言がなくても型を推論できる場合があります。変数やオブジェクトを特定の型に属しているかのように扱うよう Kotlin に指示するプロセスを、**キャスト（casting）** と呼びます。型が推論された場合のように自動的にキャストされる場合、それを**スマートキャスト（smart casting）** と呼びます。

### is および !is 演算子 {id="is-and-is-operators"}

キャストがどのように機能するかを見る前に、オブジェクトが特定の型であるかどうかを確認する方法を見てみましょう。これには、`when` や `if` 条件式と一緒に `is` および `!is` 演算子を使用できます。

* `is` は、オブジェクトがその型であるかどうかをチェックし、Boolean 値を返します。
* `!is` は、オブジェクトがその型**ではない**かどうかをチェックし、Boolean 値を返します。

例:

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

    // 型は Double なので、else 分岐がトリガーされる
    printObjectType(myDouble)
    // Unknown type
}
```
{kotlin-runnable="true" id="kotlin-tour-null-safety-casts"}

> `when` 条件式と `is` および `!is` 演算子を組み合わせる例は、[オープンなクラスとその他の特別なクラス](kotlin-tour-intermediate-open-special-classes.md#sealed-classes)の章ですでに確認しました。
> 
{style="tip"}

### as および as? 演算子 {id="as-and-as-operators"}

オブジェクトを別の型に明示的に*キャスト*するには、`as` 演算子を使用します。これには、null許容型からその非null対応型へのキャストも含まれます。キャストが不可能な場合、プログラムは**実行時（at runtime）** にクラッシュします。そのため、これは**安全ではない（unsafe）** キャスト演算子と呼ばれます。

```kotlin
fun main() {
//sampleStart
    val a: String? = null
    val b = a as String

    // 実行時にエラーを発生させる
    print(b)
//sampleEnd
}
```
{kotlin-runnable="true" validate="false" id="kotlin-tour-null-safety-as-operator"}

オブジェクトを明示的に非null型にキャストしつつ、失敗時にエラーをスローする代わりに `null` を返すようにするには、`as?` 演算子を使用します。`as?` 演算子は失敗してもエラーをトリガーしないため、**安全な（safe）** 演算子と呼ばれます。

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

`as?` 演算子を Elvis 演算子 `?:` と組み合わせることで、複数行のコードを1行に短縮できます。たとえば、次の `calculateTotalStringLength()` 関数は、混在したリストに含まれるすべての文字列の長さの合計を計算します。

```kotlin
fun calculateTotalStringLength(items: List<Any>): Int {
    var totalLength = 0

    for (item in items) {
        totalLength += if (item is String) {
            item.length
        } else {
            0  // String でない要素には 0 を加算
        }
    }

    return totalLength
}
```

この例では:

* `totalLength` 変数をカウンターとして使用しています。
* `for` ループを使用してリスト内のすべての要素を反復処理しています。
* `if` と `is` 演算子を使用して、現在の要素が文字列かどうかをチェックしています:
  * 文字列である場合、文字列の長さがカウンターに加算されます。
  * 文字列でない場合、カウンターは増加しません。
* `totalLength` 変数の最終値を返します。

このコードは次のように短縮できます。

```kotlin
fun calculateTotalStringLength(items: List<Any>): Int {
    return items.sumOf { (it as? String)?.length ?: 0 }
}
```

この例では [`.sumOf()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/sum-of.html) 拡張関数を使用し、次のようなラムダ式を提供しています。

* リスト内の各要素に対して、`as?` を使用して `String` へのセーフキャストを実行します。
* 呼び出しが `null` 値を返さない場合に、安全な呼び出し `?.` を使用して `length` プロパティにアクセスします。
* 安全な呼び出しが `null` 値を返した場合に、Elvis 演算子 `?:` を使用して `0` を返します。

## Null 値とコレクション {id="null-values-and-collections"}

Kotlin では、コレクションを扱う際に `null` 値の処理や不要な要素のフィルタリングが頻繁に発生します。Kotlin には、リスト、セット、マップ、その他の種類のコレクションを操作する際に、クリーンで効率的、かつ null 安全なコードを書くために使用できる便利な関数が用意されています。

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

これらの例のどちらでも、すべての要素が `null` 値である場合は、空のリストが返されます。

Kotlin は、コレクション内の値を検索するために使用できる関数も提供しています。値が見つからない場合、これらはエラーを発生させる代わりに `null` 値を返します。

* [`maxOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/max-or-null.html) は最大値を見つけます。存在しない場合は、`null` 値を返します。
* [`minOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/min-or-null.html) は最小値を見つけます。存在しない場合は、`null` 値を返します。

例:

```kotlin
fun main() {
//sampleStart
    // 1週間に記録された気温
    val temperatures = listOf(15, 18, 21, 21, 19, 17, 16)
  
    // 1週間の最高気温を見つける
    val maxTemperature = temperatures.maxOrNull()
    println("Highest temperature recorded: ${maxTemperature ?: "No data"}")
    // Highest temperature recorded: 21

    // 1週間の最低気温を見つける
    val minTemperature = temperatures.minOrNull()
    println("Lowest temperature recorded: ${minTemperature ?: "No data"}")
    // Lowest temperature recorded: 15
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-null-safety-collections"}

この例では、関数が `null` 値を返した場合に出力する文字列を返すために Elvis 演算子 `?:` を使用しています。

> `maxOrNull()` および `minOrNull()` 関数は、`null` 値を含ま**ない**コレクションで使用するように設計されています。そうでない場合、関数が目的の値を見つけられなかったのか、それとも `null` 値を見つけたのかを判別できません。
>
{style="note"}

ラムダ式とともに [`singleOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/single-or-null.html) 関数を使用すると、条件に一致する単一の要素を検索できます。一致する要素が存在しないか、複数存在する場合、この関数は `null` 値を返します。

```kotlin
fun main() {
//sampleStart
    // 1週間に記録された気温
    val temperatures = listOf(15, 18, 21, 21, 19, 17, 16)

    // 30度のあった日がちょうど1日だけあったかどうかを確認
    val singleHotDay = temperatures.singleOrNull{ it == 30 }
    println("Single hot day with 30 degrees: ${singleHotDay ?: "None"}")
    // Single hot day with 30 degrees: None
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-null-safety-singleornull"}

> `singleOrNull()` 関数は、`null` 値を含ま**ない**コレクションで使用するように設計されています。
>
{style="note"}

一部の関数はラムダ式を使用してコレクションを変換し、その目的を果たせない場合に `null` 値を返します。

ラムダ式でコレクションを変換し、`null` ではない最初の値を返すには、[`firstNotNullOfOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/first-not-null-of-or-null.html) 関数を使用します。そのような値が存在しない場合、この関数は `null` 値を返します。

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

ラムダ式を使用して各コレクション要素を順次処理し、累積値を作成する（またはコレクションが空の場合は `null` 値を返す）には、[`reduceOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/reduce-or-null.html) 関数を使用します。

```kotlin
fun main() {
//sampleStart
    // ショッピングカート内の商品の価格
    val itemPrices = listOf(20, 35, 15, 40, 10)

    // reduceOrNull() 関数を使用して合計金額を計算
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

この例でも、関数が `null` 値を返した場合に出力する文字列を返すために Elvis 演算子 `?:` を使用しています。

> `reduceOrNull()` 関数は、`null` 値を含ま**ない**コレクションで使用するように設計されています。
>
{style="note"}

コードをより安全にするために使用できる他の関数については、Kotlin の[標準ライブラリ（standard library）](https://kotlinlang.org/api/core/kotlin-stdlib/)を参照してください。

## 早期リターンと Elvis 演算子 {id="early-returns-and-the-elvis-operator"}

入門ツアーでは、ある地点以降に関数の処理が進むのを停止するために[早期リターン（early return）](kotlin-tour-functions.md#early-returns-in-functions)を使用する方法を学びました。関数内の前提条件をチェックするために、早期リターンと Elvis 演算子 `?:` を組み合わせることができます。このアプローチはネストされたチェックを使用する必要がないため、コードを簡潔に保つための優れた方法です。コードの複雑さが軽減されるため、保守も容易になります。例:

```kotlin
data class User(
    val id: Int,
    val name: String,
    // 友達のユーザーIDのリスト
    val friends: List<Int>
)

// ユーザーの友達の数を取得する関数
fun getNumberOfFriends(users: Map<Int, User>, userId: Int): Int {
    // ユーザーを取得し、見つからない場合は -1 を返す
    val user = users[userId] ?: return -1
    // 友達の数を返す
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

この例では:

* ユーザーの `id`、`name`、および友達のリスト用のプロパティを持つ `User` データクラスがあります。
* `getNumberOfFriends()` 関数は:
  * `User` インスタンスのマップと、整数としてのユーザー ID を受け取ります。
  * 提供されたユーザー ID を使用して、`User` インスタンスのマップの値にアクセスします。
  * マップの値が `null` 値の場合、Elvis 演算子を使用して値 `-1` で関数から早期リターンします。
  * マップから見つかった値を `user` 変数に代入します。
  * `size` プロパティを使用して、ユーザーの友達リスト内の友達の数を返します。
* `main()` 関数は:
  * 3つの `User` インスタンスを作成します。
  * これらの `User` インスタンスのマップを作成し、`users` 変数に代入します。
  * `users` 変数に対して値 `1` および `2` で `getNumberOfFriends()` 関数を呼び出し、`"Alice"` には2人の友達、`"Bob"` には1人の友達を返します。
  * `users` 変数に対して値 `4` で `getNumberOfFriends()` 関数を呼び出します。これにより、値 `-1` で早期リターンがトリガーされます。

早期リターンを使わなければコードをさらに簡潔にできるのではないかと思うかもしれません。ただし、その方法では `users[userId]` が `null` 値を返す可能性があるため、複数の安全な呼び出しが必要になり、コードが少し読みにくくなります。

```kotlin
fun getNumberOfFriends(users: Map<Int, User>, userId: Int): Int {
    // ユーザーを取得し、見つからない場合は -1 を返す
    return users[userId]?.friends?.size ?: -1
}
```
{validate="false"}

この例では Elvis 演算子で1つの条件のみをチェックしていますが、重大なエラーパスをカバーするために複数のチェックを追加することもできます。Elvis 演算子を使用した早期リターンは、プログラムが無駄な処理を行うのを防ぎ、`null` 値や無効なケースが検出されたらすぐに停止することで、コードをより安全にします。

コード内で `return` を使用する方法の詳細については、[リターンとジャンプ](returns.md)を参照してください。

## 練習問題 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="セーフキャストと Elvis 演算子によるユーザーデータの検証" id="null-safety-exercise-1">

ユーザーがさまざまな種類の通知を有効または無効にできるアプリの通知システムを開発しています。
次の条件を満たすように `getNotificationPreferences()` 関数を完成させてください。

1. `validUser` 変数で `as?` 演算子を使用して、`user` が `User` クラスのインスタンスであるかどうかをチェックします。そうでない場合は、空のリストを返します。
2. `userName` 変数で Elvis `?:` 演算子を使用して、ユーザーの名前が `null` の場合にデフォルトで `"Guest"` になるようにします。
3. 最後の return 文で `.takeIf()` 関数を使用して、有効になっている場合にのみメールおよび SMS の通知設定を含めます。
4. `main()` 関数が正常に実行され、期待される出力を出力すること。

> [`takeIf()` 関数](scope-functions.md#takeif-and-takeunless)は、指定された条件が真の場合は元の値を返し、そうでない場合は `null` を返します。例:
>
> ```kotlin
> fun main() {
>     // ユーザーがログインしている
>     val userIsLoggedIn = true
>     // ユーザーにアクティブなセッションがある
>     val hasSession = true
> 
>     // ユーザーがログインしており、アクティブなセッションがある場合にダッシュボードへのアクセスを許可する
>     val canAccessDashboard = userIsLoggedIn.takeIf { hasSession }
> 
>     println(canAccessDashboard ?: "Access denied")
>     // true
> }
> ```
>
{style = "tip"}

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

</def>
<def title="singleOrNull() で単一のアクティブなサブスクリプションを検索する" id="null-safety-exercise-2">

ユーザーが複数のサブスクリプションを所有できるものの、**一度にアクティブにできるのは1つだけ**というサブスクリプションベースのストリーミングサービスで作業しています。述語（プレディケート）付きの `singleOrNull()` 関数を使用して、アクティブなサブスクリプションが複数ある場合に `null` 値を返すように `getActiveSubscription()` 関数を完成させてください。

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

</def>
<def title="mapNotNull() でアクティブなユーザー名をフィルタリングする" id="null-safety-exercise-3">

ユーザーがユーザー名とアカウントステータスを持っているソーシャルメディアプラットフォームで作業しています。現在アクティブなユーザー名のリストを確認したいと考えています。[`mapNotNull()` 関数](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/map-not-null.html)に述語を持たせ、アクティブな場合はユーザー名を返し、そうでない場合は `null` 値を返すように `getActiveUsernames()` 関数を完成させてください。

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

> 練習問題 1 と同様に、ユーザーがアクティブかどうかをチェックする際に [`takeIf()` 関数](scope-functions.md#takeif-and-takeunless)を使用できます。
>
{ style = "tip" }

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

</def>
<def title="早期リターンと Elvis 演算子による在庫の検証" id="null-safety-exercise-4">

Eコマースプラットフォームの在庫管理システムで作業しています。販売を処理する前に、利用可能な在庫に基づいて商品のリクエスト数量が有効であるかどうかを確認する必要があります。

早期リターンと Elvis 演算子（該当する場合）を使用して次の条件をチェックするように、`validateStock()` 関数を完成させてください。

* `requested` 変数が `null` である。
* `available` 変数が `null` である。
* `requested` 変数が負の値である。
* `requested` 変数の数量が `available` 変数の数量を超えている。

上記のいずれの場合も、関数は値 `-1` で早期リターンする必要があります。

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

</def>
</deflist>

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-intermediate-properties.md" mode="outline" icon="arrow-left" icon-position="left">前のステップ</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-intermediate-libraries-and-apis.md" mode="classic" icon="arrow-right" icon-position="right">次のステップ</a>
  </li>
</list>