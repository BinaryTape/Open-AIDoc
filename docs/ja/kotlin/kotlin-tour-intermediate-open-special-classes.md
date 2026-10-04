[//]: # (title: open クラスと特殊なクラス)

<no-index/>

この章では、open クラス、それらとインターフェースとの連携方法、および Kotlin で利用可能なその他の特殊な種類のクラスについて学びます。

## open クラス {id="open-classes"}

インターフェースや抽象クラスを使用できない場合、クラスを **open** として宣言することで明示的に継承可能にすることができます。
これを行うには、クラス宣言の前に `open` キーワードを使用します。

```kotlin
open class Vehicle(val make: String, val model: String)
```

別のクラスを継承するクラスを作成するには、クラスヘッダーの後にコロンを追加し、続いて継承したい親クラスのコンストラクタ呼び出しを記述します。この例では、`Car` クラスが `Vehicle` クラスを継承しています。

```kotlin
open class Vehicle(val make: String, val model: String)

class Car(make: String, model: String, val numberOfDoors: Int) : Vehicle(make, model)

fun main() {
    // Car クラスのインスタンスを作成
    val car = Car("Toyota", "Corolla", 4)

    // 車の詳細を出力
    println("Car Info: Make - ${car.make}, Model - ${car.model}, Number of doors - ${car.numberOfDoors}")
    // Car Info: Make - Toyota, Model - Corolla, Number of doors - 4
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-classes-open-class"}

通常のクラスインスタンスを作成するときと同様に、クラスが親クラスを継承している場合、親クラスのヘッダーで宣言されているすべてのパラメータを初期化する必要があります。そのため、この例の `Car` クラスのインスタンスである `car` は、親クラスのパラメータ `make` と `model` を初期化しています。

### 継承した振る舞いのオーバーライド {id="overriding-inherited-behavior"}

クラスを継承しつつ一部の振る舞いを変更したい場合は、継承した振る舞いをオーバーライドできます。

デフォルトでは、親クラスのメンバ関数やプロパティをオーバーライドすることはできません。抽象クラスと同様に、特別なキーワードを追加する必要があります。

#### メンバ関数 {id="member-functions"}

親クラスの関数をオーバーライドできるようにするには、親クラス内でのその関数の宣言の前に `open` キーワードを使用します。

```kotlin
open fun displayInfo() {}
```
{validate="false"}

継承したメンバ関数をオーバーライドするには、子クラス内での関数宣言の前に `override` キーワードを使用します。

```kotlin
override fun displayInfo() {}
```
{validate="false"}

例：

```kotlin
open class Vehicle(val make: String, val model: String) {
    open fun displayInfo() {
        println("Vehicle Info: Make - $make, Model - $model")
    }
}

class Car(make: String, model: String, val numberOfDoors: Int) : Vehicle(make, model) {
    override fun displayInfo() {
        println("Car Info: Make - $make, Model - $model, Number of Doors - $numberOfDoors")
    }
}

fun main() {
    val car1 = Car("Toyota", "Corolla", 4)
    val car2 = Car("Honda", "Civic", 2)

    // オーバーライドされた displayInfo() 関数を使用
    car1.displayInfo()
    // Car Info: Make - Toyota, Model - Corolla, Number of Doors - 4
    car2.displayInfo()
    // Car Info: Make - Honda, Model - Civic, Number of Doors - 2
}
```
{kotlin-runnable="true" id="kotlin-tour-class-override-function"}

この例では以下を行っています：

* `Vehicle` クラスを継承した `Car` クラスの2つのインスタンス `car1` と `car2` を作成。
* ドアの数も出力するように、`Car` クラスで `displayInfo()` 関数をオーバーライド。
* `car1` および `car2` インスタンスでオーバーライドされた `displayInfo()` 関数を呼び出し。

#### プロパティ {id="properties"}

Kotlin では、プロパティに `open` キーワードを付けて後からオーバーライド可能にすることは一般的なプラクティスではありません。多くの場合、プロパティがデフォルトで継承可能である抽象クラスやインターフェースを使用します。

open クラス内のプロパティには、その子クラスからアクセスできます。一般的には、新しいプロパティでオーバーライドするよりも、直接アクセスする方が適切です。

例えば、後からオーバーライドしたい `transmissionType` というプロパティがあるとします。プロパティをオーバーライドするための構文は、メンバ関数をオーバーライドする場合とまったく同じです。次のように書くことができます：

```kotlin
open class Vehicle(val make: String, val model: String) {
    open val transmissionType: String = "Manual"
}

class Car(make: String, model: String, val numberOfDoors: Int) : Vehicle(make, model) {
    override val transmissionType: String = "Automatic"
}
```

しかし、これは良いプラクティスではありません。代わりに、継承可能なクラスのコンストラクタにプロパティを追加し、子クラス `Car` を作成するときにその値を宣言することができます：

```kotlin
open class Vehicle(val make: String, val model: String, val transmissionType: String = "Manual")

class Car(make: String, model: String, val numberOfDoors: Int) : Vehicle(make, model, "Automatic")
```

プロパティをオーバーライドするのではなく直接アクセスすることで、よりシンプルで読みやすいコードになります。親クラスで一度プロパティを宣言し、コンストラクタ経由でその値を渡すことで、子クラスでの不要なオーバーライドを排除できます。

クラスの継承とクラスの振る舞いのオーバーライドに関する詳細については、[継承 (Inheritance)](inheritance.md) を参照してください。

### open クラスとインターフェース {id="open-classes-and-interfaces"}

クラスを継承**し**、かつ複数のインターフェースを実装するクラスを作成できます。この場合、コロンの後にまず親クラスを宣言し、その後にインターフェースをリストする必要があります。

```kotlin
// インターフェースの定義
interface EcoFriendly {
    val emissionLevel: String
}

interface ElectricVehicle {
    val batteryCapacity: Double
}

// 親クラス
open class Vehicle(val make: String, val model: String)

// 子クラス
open class Car(make: String, model: String, val numberOfDoors: Int) : Vehicle(make, model)

// Car を継承し、2つのインターフェースを実装する新しいクラス
class ElectricCar(
    make: String,
    model: String,
    numberOfDoors: Int,
    val capacity: Double,
    val emission: String
) : Car(make, model, numberOfDoors), EcoFriendly, ElectricVehicle {
    override val batteryCapacity: Double = capacity
    override val emissionLevel: String = emission
}
```

## 特殊なクラス {id="special-classes"}

抽象クラス、open クラス、データクラスに加えて、Kotlin には特定の振る舞いを制限したり、小さなオブジェクトを作成する際のパフォーマンスへの影響を軽減したりするなど、さまざまな目的のために設計された特殊な種類のクラスがあります。

### シールドクラス {id="sealed-classes"}

継承を制限したい場合があります。これはシールドクラス（sealed class）で行うことができます。シールドクラスは特殊な種類の[抽象クラス](kotlin-tour-intermediate-classes-interfaces.md#abstract-classes)です。クラスが sealed であると宣言すると、その子クラスは同じパッケージ内からしか作成できなくなります。このスコープ外からシールドクラスを継承することはできません。

> パッケージとは、通常は同一ディレクトリ内にある、関連するクラスや関数のコードの集まりです。Kotlin のパッケージについての詳細は、[パッケージとインポート (Packages and imports)](packages.md) を参照してください。
> 
{style="tip"}

シールドクラスを作成するには、`sealed` キーワードを使用します。

```kotlin
sealed class Mammal
```

シールドクラスは、`when` 式と組み合わせると特に便利です。`when` 式を使用することで、すべての可能な子クラスに対する振る舞いを定義できます。例えば：

```kotlin
sealed class Mammal(val name: String)

class Cat(val catName: String) : Mammal(catName)
class Human(val humanName: String, val job: String) : Mammal(humanName)

fun greetMammal(mammal: Mammal): String {
    when (mammal) {
        is Human -> return "Hello ${mammal.name}; You're working as a ${mammal.job}"
        is Cat -> return "Hello ${mammal.name}"   
    }
}

fun main() {
    println(greetMammal(Cat("Snowy")))
    // Hello Snowy
}
```
{kotlin-runnable="true" id="kotlin-tour-sealed-classes"}

この例では：

* コンストラクタに `name` パラメータを持つ `Mammal` という名前のシールドクラスがあります。
* `Cat` クラスは `Mammal` シールドクラスを継承し、自身のコンストラクタの `catName` パラメータを `Mammal` クラスの `name` パラメータとして使用します。
* `Human` クラスは `Mammal` シールドクラスを継承し、自身のコンストラクタの `humanName` パラメータを `Mammal` クラスの `name` パラメータとして使用します。また、コンストラクタに `job` パラメータも持っています。
* `greetMammal()` 関数は `Mammal` 型の引数を受け取り、文字列を返します。
* `greetMammal()` 関数の本体内には、[`is` 演算子](typecasts.md#is-and-is-operators) を使用して `mammal` の型をチェックし、実行するアクションを決定する `when` 式があります。
* `main()` 関数は、名前パラメータが `Snowy` である `Cat` クラスのインスタンスを指定して `greetMammal()` 関数を呼び出します。

> このツアーでは、`is` 演算子について[Null 安全 (Null safety)](kotlin-tour-intermediate-null-safety.md) の章で詳しく説明します。
> 
{style ="tip"}

シールドクラスとその推奨されるユースケースの詳細については、[シールドクラスとインターフェース (Sealed classes and interfaces)](sealed-classes.md) を参照してください。

### enum クラス {id="enum-classes"}

enum クラスは、クラス内で有限の一連の固有の値を表したい場合に便利です。enum クラスには enum 定数が含まれ、これら自体が enum クラスのインスタンスです。

enum クラスを作成するには、`enum` キーワードを使用します。

```kotlin
enum class State
```

プロセスのさまざまな状態を含む enum クラスを作成したいとします。各 enum 定数はカンマ `,` で区切る必要があります。

```kotlin
enum class State {
    IDLE, RUNNING, FINISHED
}
```

`State` enum クラスには、`IDLE`、`RUNNING`、`FINISHED` という enum 定数があります。enum 定数にアクセスするには、クラス名に続けて `.` と enum 定数の名前を使用します。

```kotlin
val state = State.RUNNING
```

この enum クラスを `when` 式とともに使用して、enum 定数の値に応じて実行するアクションを定義できます。

```kotlin
enum class State {
    IDLE, RUNNING, FINISHED
}

fun main() {
    val state = State.RUNNING
    val message = when (state) {
        State.IDLE -> "It's idle"
        State.RUNNING -> "It's running"
        State.FINISHED -> "It's finished"
    }
    println(message)
    // It's running
}
```
{kotlin-runnable="true" id="kotlin-tour-enum-classes"}

enum クラスは、通常のクラスと同様にプロパティやメンバ関数を持つことができます。

例えば、HTML を扱っていて、いくつかの色を含む enum クラスを作成したいとします。各色に、RGB 値を16進数として保持する `rgb` というプロパティを持たせたいとします。enum 定数を作成する際には、このプロパティで初期化する必要があります。

```kotlin
enum class Color(val rgb: Int) {
    RED(0xFF0000),
    GREEN(0x00FF00),
    BLUE(0x0000FF),
    YELLOW(0xFFFF00)
}
```

> Kotlin は16進数を整数として格納するため、`rgb` プロパティは `String` 型ではなく `Int` 型になります。
>
{style="note"}

このクラスにメンバ関数を追加するには、セミコロン `;` を使って enum 定数と区切ります。

```kotlin
enum class Color(val rgb: Int) {
    RED(0xFF0000),
    GREEN(0x00FF00),
    BLUE(0x0000FF),
    YELLOW(0xFFFF00);

    fun containsRed() = (this.rgb and 0xFF0000 != 0)
}

fun main() {
    val red = Color.RED
    
    // enum 定数で containsRed() 関数を呼び出し
    println(red.containsRed())
    // true

    // クラス名経由で enum 定数の containsRed() 関数を呼び出し
    println(Color.BLUE.containsRed())
    // false
  
    println(Color.YELLOW.containsRed())
    // true
}
```
{kotlin-runnable="true" id="kotlin-tour-interface-enum-classes-members"}

この例では、`containsRed()` メンバ関数が `this` キーワードを使用して enum 定数の `rgb` プロパティの値にアクセスし、16進数の値の先頭ビットに `FF` が含まれているかどうかをチェックして真偽値を返します。

詳細については、[enum クラス (Enum classes)](enum-classes.md) を参照してください。

### インライン値クラス {id="inline-value-classes"}

コード内で、クラスから小さなオブジェクトを作成し、それを一時的にしか使用しない場合があります。このようなアプローチはパフォーマンスに影響を与える可能性があります。インライン値クラス（Inline value class）は、このパフォーマンスへの影響を回避する特殊な種類のクラスです。ただし、値のみを保持できます。

インライン値クラスを作成するには、`value` キーワードと `@JvmInline` アノテーションを使用します。

```kotlin
@JvmInline
value class Email
```

> `@JvmInline` アノテーションは、コンパイル時にコードを最適化するよう Kotlin に指示します。詳細については、[アノテーション (Annotations)](annotations.md) を参照してください。
> 
{style="tip"}

インライン値クラスには、クラスヘッダーで初期化される単一のプロパティが**必ず**存在しなければなりません。

メールアドレスを保持するクラスを作成したいとします。

```kotlin
// address プロパティはクラスヘッダーで初期化されます。
@JvmInline
value class Email(val address: String)

fun sendEmail(email: Email) {
    println("Sending email to ${email.address}")
}

fun main() {
    val myEmail = Email("example@example.com")
    sendEmail(myEmail)
    // Sending email to example@example.com
}
```
{kotlin-runnable="true" id="kotlin-tour-inline-value-class"}

この例では：

* `Email` はクラスヘッダーに1つのプロパティ `address` を持つインライン値クラスです。
* `sendEmail()` 関数は `Email` 型のオブジェクトを受け取り、標準出力に文字列を出力します。
* `main()` 関数は：
    * `myEmail` という `Email` クラスのインスタンスを作成します。
    * `myEmail` オブジェクトを引数にして `sendEmail()` 関数を呼び出します。

インライン値クラスを使用することで、クラスがインライン化され、オブジェクトを作成することなくコード内で直接使用できるようになります。これにより、メモリフットプリントを大幅に削減し、コードのランタイムパフォーマンスを向上させることができます。

インライン値クラスの詳細については、[インライン値クラス (Inline value classes)](inline-classes.md) を参照してください。

## 演習 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="シールドクラスを使用した配送ステータスのモデル化" id="special-classes-exercise-1">

あなたは配送サービスを管理しており、荷物のステータスを追跡する方法を必要としています。次のステータスを表すデータクラスを含む `DeliveryStatus` というシールドクラスを作成してください：`Pending`、`InTransit`、`Delivered`、`Canceled`。`main()` 関数のコードが正常に実行されるように、`DeliveryStatus` クラスの宣言を完成させてください。

```kotlin
sealed class // ここにコードを記述してください

fun printDeliveryStatus(status: DeliveryStatus) {
    when (status) {
        is DeliveryStatus.Pending -> {
            println("The package is pending pickup from ${status.sender}.")
        }
        is DeliveryStatus.InTransit -> {
            println("The package is in transit and expected to arrive by ${status.estimatedDeliveryDate}.")
        }
        is DeliveryStatus.Delivered -> {
            println("The package was delivered to ${status.recipient} on ${status.deliveryDate}.")
        }
        is DeliveryStatus.Canceled -> {
            println("The delivery was canceled due to: ${status.reason}.")
        }
    }
}

fun main() {
    val status1: DeliveryStatus = DeliveryStatus.Pending("Alice")
    val status2: DeliveryStatus = DeliveryStatus.InTransit("2024-11-20")
    val status3: DeliveryStatus = DeliveryStatus.Delivered("2024-11-18", "Bob")
    val status4: DeliveryStatus = DeliveryStatus.Canceled("Address not found")

    printDeliveryStatus(status1)
    // The package is pending pickup from Alice.
    printDeliveryStatus(status2)
    // The package is in transit and expected to arrive by 2024-11-20.
    printDeliveryStatus(status3)
    // The package was delivered to Bob on 2024-11-18.
    printDeliveryStatus(status4)
    // The delivery was canceled due to: Address not found.
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-special-classes-exercise-1"}

```kotlin
sealed class DeliveryStatus {
    data class Pending(val sender: String) : DeliveryStatus()
    data class InTransit(val estimatedDeliveryDate: String) : DeliveryStatus()
    data class Delivered(val deliveryDate: String, val recipient: String) : DeliveryStatus()
    data class Canceled(val reason: String) : DeliveryStatus()
}

fun printDeliveryStatus(status: DeliveryStatus) {
    when (status) {
        is DeliveryStatus.Pending -> {
            println("The package is pending pickup from ${status.sender}.")
        }
        is DeliveryStatus.InTransit -> {
            println("The package is in transit and expected to arrive by ${status.estimatedDeliveryDate}.")
        }
        is DeliveryStatus.Delivered -> {
            println("The package was delivered to ${status.recipient} on ${status.deliveryDate}.")
        }
        is DeliveryStatus.Canceled -> {
            println("The delivery was canceled due to: ${status.reason}.")
        }
    }
}

fun main() {
    val status1: DeliveryStatus = DeliveryStatus.Pending("Alice")
    val status2: DeliveryStatus = DeliveryStatus.InTransit("2024-11-20")
    val status3: DeliveryStatus = DeliveryStatus.Delivered("2024-11-18", "Bob")
    val status4: DeliveryStatus = DeliveryStatus.Canceled("Address not found")

    printDeliveryStatus(status1)
    // The package is pending pickup from Alice.
    printDeliveryStatus(status2)
    // The package is in transit and expected to arrive by 2024-11-20.
    printDeliveryStatus(status3)
    // The package was delivered to Bob on 2024-11-18.
    printDeliveryStatus(status4)
    // The delivery was canceled due to: Address not found.
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-special-classes-solution-1"}

</def>
<def title="enum クラスによる問題タイプの定義" id="special-classes-exercise-2">

プログラム内で、さまざまなステータスとエラーの種類を処理できるようにしたいとします。データクラスまたはオブジェクトで宣言されたさまざまなステータスをキャプチャするシールドクラスがあります。`NETWORK`、`TIMEOUT`、`UNKNOWN` という異なる問題タイプを表す `Problem` という enum クラスを作成し、以下のコードを完成させてください。

```kotlin
sealed class Status {
    data object Loading : Status()
    data class Error(val problem: Problem) : Status() {
        // ここにコードを記述してください
    }

    data class OK(val data: List<String>) : Status()
}

fun handleStatus(status: Status) {
    when (status) {
        is Status.Loading -> println("Loading...")
        is Status.OK -> println("Data received: ${status.data}")
        is Status.Error -> when (status.problem) {
            Status.Error.Problem.NETWORK -> println("Network issue")
            Status.Error.Problem.TIMEOUT -> println("Request timed out")
            Status.Error.Problem.UNKNOWN -> println("Unknown error occurred")
        }
    }
}

fun main() {
    val status1: Status = Status.Error(Status.Error.Problem.NETWORK)
    val status2: Status = Status.OK(listOf("Data1", "Data2"))

    handleStatus(status1)
    // Network issue
    handleStatus(status2)
    // Data received: [Data1, Data2]
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-special-classes-exercise-2"}

```kotlin
sealed class Status {
    data object Loading : Status()
    data class Error(val problem: Problem) : Status() {
        enum class Problem {
            NETWORK,
            TIMEOUT,
            UNKNOWN
        }
    }

    data class OK(val data: List<String>) : Status()
}

fun handleStatus(status: Status) {
    when (status) {
        is Status.Loading -> println("Loading...")
        is Status.OK -> println("Data received: ${status.data}")
        is Status.Error -> when (status.problem) {
            Status.Error.Problem.NETWORK -> println("Network issue")
            Status.Error.Problem.TIMEOUT -> println("Request timed out")
            Status.Error.Problem.UNKNOWN -> println("Unknown error occurred")
        }
    }
}

fun main() {
    val status1: Status = Status.Error(Status.Error.Problem.NETWORK)
    val status2: Status = Status.OK(listOf("Data1", "Data2"))

    handleStatus(status1)
    // Network issue
    handleStatus(status2)
    // Data received: [Data1, Data2]
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-special-classes-solution-2"}

</def>
</deflist>

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-intermediate-objects.md" mode="outline" icon="arrow-left" icon-position="left">前のステップ</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-intermediate-properties.md" mode="classic" icon="arrow-right" icon-position="right">次のステップ</a>
  </li>
</list>