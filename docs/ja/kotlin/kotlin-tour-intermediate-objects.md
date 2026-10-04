[//]: # (title: オブジェクト)

<no-index/>

この章では、オブジェクト宣言を学ぶことでクラスへの理解を深めます。この知識は、プロジェクト全体で振る舞いを効率的に管理するのに役立ちます。

## オブジェクト宣言 {id="object-declarations"}

Kotlinでは、**オブジェクト宣言（object declaration）**を使用して、単一のインスタンスを持つクラスを宣言できます。ある意味では、クラスの宣言と単一インスタンスの作成を_同時に_行います。オブジェクト宣言は、プログラム全体の単一の参照ポイントとして使用するクラスを作成したい場合や、システム全体の振る舞いを調整したい場合に便利です。

> 簡単にアクセスできる単一のインスタンスのみを持つクラスは、**シングルトン（singleton）**と呼ばれます。
>
{style="tip"}

Kotlinのオブジェクトは**遅延（lazy）**生成されます。つまり、アクセスされたときに初めて作成されます。また、Kotlinはすべてのオブジェクトがスレッドセーフな方法で作成されることを保証しているため、これを手動で確認する必要はありません。

オブジェクト宣言を作成するには、`object` キーワードを使用します。

```kotlin
object DoAuth {}
```

`object` の名前に続けて、波括弧 `{}` で定義されたオブジェクト本文（body）内にプロパティやメンバー関数を追加します。

> オブジェクトはコンストラクタを持つことができないため、クラスのようなヘッダーはありません。
>
{style="note"}

例えば、認証を担当する `DoAuth` というオブジェクトを作成したいとします。

```kotlin
object DoAuth {
    fun takeParams(username: String, password: String) {
        println("input Auth parameters = $username:$password")
    }
}

fun main(){
    // takeParams() 関数が呼び出されたときにオブジェクトが作成されます
    DoAuth.takeParams("coding_ninja", "N1njaC0ding!")
    // input Auth parameters = coding_ninja:N1njaC0ding!
}
```
{kotlin-runnable="true" id="kotlin-tour-object-declarations"}

このオブジェクトには、`username` と `password` 変数をパラメータとして受け取り、コンソールに文字列を出力する `takeParams` というメンバー関数があります。`DoAuth` オブジェクトは、この関数が初めて呼び出されたときにのみ作成されます。

> オブジェクトはクラスやインターフェースを継承できます。例えば：
> 
> ```kotlin
> interface Auth {
>     fun takeParams(username: String, password: String)
> }
>
> object DoAuth : Auth {
>     override fun takeParams(username: String, password: String) {
>         println("input Auth parameters = $username:$password")
>     }
> }
> ```
>
{style="note"}

#### データオブジェクト {id="data-objects"}

オブジェクト宣言の内容を簡単に出力できるようにするために、Kotlinには**データ**オブジェクト（data object）があります。初級ツアーで学んだデータクラスと同様に、データオブジェクトには追加のメンバー関数として `toString()` と `equals()` が自動的に提供されます。

> データクラスとは異なり、データオブジェクトにはコピーできない単一のインスタンスしか存在しないため、`copy()` メンバー関数は自動的には提供されません。
>
{type ="note"}

データオブジェクトを作成するには、オブジェクト宣言と同じ構文を使用しますが、先頭に `data` キーワードを付けます。

```kotlin
data object AppConfig {}
```

例えば：

```kotlin
data object AppConfig {
    var appName: String = "My Application"
    var version: String = "1.0.0"
}

fun main() {
    println(AppConfig)
    // AppConfig
    
    println(AppConfig.appName)
    // My Application
}
```
{kotlin-runnable="true" id="kotlin-tour-data-objects"}

データオブジェクトの詳細については、[](object-declarations.md#data-objects) を参照してください。

#### コンパニオンオブジェクト {id="companion-objects"}

Kotlinでは、クラスがオブジェクトを持つことができます。それが**コンパニオン**オブジェクト（companion object）です。1つのクラスにつきコンパニオンオブジェクトは**1つ**しか持てません。コンパニオンオブジェクトは、そのクラスが初めて参照されたときにのみ作成されます。

コンパニオンオブジェクト内で宣言されたプロパティや関数は、クラスのすべてのインスタンス間で共有されます。

クラス内にコンパニオンオブジェクトを作成するには、オブジェクト宣言と同じ構文を使用し、先頭に `companion` キーワードを付けます。

```kotlin
companion object Bonger {}
```

> コンパニオンオブジェクトには名前を付ける必要はありません。名前を定義しない場合、デフォルトで `Companion` になります。
> 
{style="note"}

コンパニオンオブジェクトのプロパティや関数にアクセスするには、クラス名を参照します。例えば：

```kotlin
class BigBen {
    companion object Bonger {
        fun getBongs(nTimes: Int) {
            repeat(nTimes) { print("BONG ") }
            }
        }
    }

fun main() {
    // クラスが初めて参照されたときにコンパニオンオブジェクトが作成されます。
    BigBen.getBongs(12)
    // BONG BONG BONG BONG BONG BONG BONG BONG BONG BONG BONG BONG 
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-classes-companion-object"}

この例では、`Bonger` というコンパニオンオブジェクトを含む `BigBen` というクラスを作成しています。コンパニオンオブジェクトには、整数を受け取り、その整数の回数だけ `"BONG"` をコンソールに出力する `getBongs()` というメンバー関数があります。

`main()` 関数では、クラス名を参照して `getBongs()` 関数を呼び出しています。この時点でコンパニオンオブジェクトが作成されます。`getBongs()` 関数は引数 `12` で呼び出されます。

詳細については、[](object-declarations.md#companion-objects) を参照してください。

## 練習問題 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="注文追跡用のデータオブジェクトの実装" id="objects-exercise-1">

あなたはコーヒーショップを経営しており、顧客の注文を追跡するシステムを持っています。以下のコードを確認し、`main()` 関数のコードが正常に動作するように2つ目のデータオブジェクトの宣言を完成させてください。

```kotlin
interface Order {
    val orderId: String
    val customerName: String
    val orderTotal: Double
}

data object OrderOne: Order {
    override val orderId = "001"
    override val customerName = "Alice"
    override val orderTotal = 15.50
}

data object // ここにコードを書いてください

fun main() {
    // 各データオブジェクトの名前を出力
    println("Order name: $OrderOne")
    // Order name: OrderOne
    println("Order name: $OrderTwo")
    // Order name: OrderTwo

    // 注文が同一かどうかをチェック
    println("Are the two orders identical? ${OrderOne == OrderTwo}")
    // Are the two orders identical? false

    if (OrderOne == OrderTwo) {
        println("The orders are identical.")
    } else {
        println("The orders are unique.")
        // The orders are unique.
    }

    println("Do the orders have the same customer name? ${OrderOne.customerName == OrderTwo.customerName}")
    // Do the orders have the same customer name? false
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-objects-exercise-1"}

```kotlin
interface Order {
    val orderId: String
    val customerName: String
    val orderTotal: Double
}

data object OrderOne: Order {
    override val orderId = "001"
    override val customerName = "Alice"
    override val orderTotal = 15.50
}

data object OrderTwo: Order {
    override val orderId = "002"
    override val customerName = "Bob"
    override val orderTotal = 12.75
}

fun main() {
    // 各データオブジェクトの名前を出力
    println("Order name: $OrderOne")
    // Order name: OrderOne
    println("Order name: $OrderTwo")
    // Order name: OrderTwo

    // 注文が同一かどうかをチェック
    println("Are the two orders identical? ${OrderOne == OrderTwo}")
    // Are the two orders identical? false

    if (OrderOne == OrderTwo) {
        println("The orders are identical.")
    } else {
        println("The orders are unique.")
        // The orders are unique.
    }

    println("Do the orders have the same customer name? ${OrderOne.customerName == OrderTwo.customerName}")
    // Do the orders have the same customer name? false
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-objects-solution-1"}

</def>
<def title="オブジェクト宣言の作成" id="objects-exercise-2">

`Vehicle` インターフェースを継承したオブジェクト宣言を作成し、独自の乗り物タイプ `FlyingSkateboard` を作成してください。`main()` 関数のコードが正常に動作するように、オブジェクト内で `name` プロパティと `move()` 関数を実装してください。

```kotlin
interface Vehicle {
    val name: String
    fun move(): String
}

object // ここにコードを書いてください

fun main() {
    println("${FlyingSkateboard.name}: ${FlyingSkateboard.move()}")
    // Flying Skateboard: Glides through the air with a hover engine
    println("${FlyingSkateboard.name}: ${FlyingSkateboard.fly()}")
    // Flying Skateboard: Woooooooo
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-objects-exercise-2"}

```kotlin
interface Vehicle {
    val name: String
    fun move(): String
}

object FlyingSkateboard : Vehicle {
    override val name = "Flying Skateboard"
    override fun move() = "Glides through the air with a hover engine"

   fun fly(): String = "Woooooooo"
}

fun main() {
    println("${FlyingSkateboard.name}: ${FlyingSkateboard.move()}")
    // Flying Skateboard: Glides through the air with a hover engine
    println("${FlyingSkateboard.name}: ${FlyingSkateboard.fly()}")
    // Flying Skateboard: Woooooooo
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-objects-solution-2"}

</def>
<def title="ユーザー作成前のメールアドレスのバリデーション" id="objects-exercise-3">

アプリのユーザー登録モジュールを構築しています。メールアドレスのバリデーションは `User` クラスに関連付けたいものの、メールアドレスが無効な場合に不要な `User` インスタンスを作成したくありません。

この練習問題では、メールアドレスに `@` と `.` の両方が含まれている場合に有効とみなします。`main()` 関数のコードが正常に動作するように、データクラスを完成させてください。

<deflist collapsible="true">
    <def title="ヒント">
        `User` クラスのコンパニオンオブジェクト内にメールのバリデーション関数を追加することで、`User` から直接その関数を呼び出せるようにします。
    </def>
</deflist>

```kotlin
data class User(val name: String, val email: String) {
    // ここにコードを書いてください
}

fun main() {
    val candidates = listOf(
        Pair("Alice", "alice@example.com"),
        Pair("Bob", "bob2example-com")
    )

    for ((name, email) in candidates) {
        if (User.isValidEmail(email)) {
            val user = User(name, email)
            println("Registered: ${user.name}, ${user.email}")
            // Registered: Alice, alice@example.com
        } else {
            println("Error: '${email}' is not valid. The email should contain '@' and '.'")
            // Error: 'bob2example-com' is not valid. The email should contain '@' and '.'
        }
    }
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-objects-exercise-3"}

```kotlin
data class User(val name: String, val email: String) {
    companion object {
        fun isValidEmail(email: String): Boolean =
            email.contains('@') && email.contains('.')
    }
}

fun main() {
    val candidates = listOf(
        Pair("Alice", "alice@example.com"),
        Pair("Bob", "bob2example-com")
    )

    for ((name, email) in candidates) {
        if (User.isValidEmail(email)) {
            val user = User(name, email)
            println("Registered: ${user.name}, ${user.email}")
            // Registered: Alice, alice@example.com
        } else {
            println("Error: '${email}' is not valid. The email should contain '@' and '.'")
            // Error: 'bob2example-com' is not valid. The email should contain '@' and '.'
        }
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-objects-solution-3"}

> この練習問題の発展として、コンパニオンオブジェクト内の関数をファクトリメソッドとして使用し、クラスのインスタンスを生成してみてください。このパターンの例や詳細については、[](object-declarations.md#companion-objects) を参照してください。
>
{style="tip"}

</def>
</deflist>

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-intermediate-classes-interfaces.md" mode="outline" icon="arrow-left" icon-position="left">前のステップ</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-intermediate-open-special-classes.md" mode="classic" icon="arrow-right" icon-position="right">次のステップ</a>
  </li>
</list>