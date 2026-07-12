[//]: # (title: オープンクラスと特殊なクラス)

<no-index/>

この章では、オープンクラス（open classes）、それらがインターフェースとどのように連携するか、そしてKotlinで利用可能なその他の特殊な型のクラスについて学びます。

## オープンクラス (Open classes)

インターフェースや抽象クラスを使用できない場合は、クラスを **open** と宣言することで、明示的に継承可能にすることができます。
これを行うには、クラス宣言の前に `open` キーワードを使用します。

```kotlin
open class Vehicle(val make: String, val model: String)
```

別のクラスから継承するクラスを作成するには、クラスヘッダーの後にコロン（`:`）を追加し、続けて継承したい親クラスのコンストラクタ呼び出しを記述します。この例では、`Car` クラスは `Vehicle` クラスを継承しています。

```kotlin
open class Vehicle(val make: String, val model: String)

class Car(make: String, model: String, val numberOfDoors: Int) : Vehicle(make, model)

fun main() {
    // Carクラスのインスタンスを作成
    val car = Car("Toyota", "Corolla", 4)

    // 車の詳細を出力
    println("Car Info: Make - ${car.make}, Model - ${car.model}, Number of doors - ${car.numberOfDoors}")
    // Car Info: Make - Toyota, Model - Corolla, Number of doors - 4
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-classes-open-class"}

通常のクラスインスタンスを作成する場合と同様に、クラスが親クラスを継承する場合、親クラスのヘッダーで宣言されているすべてのパラメータを初期化する必要があります。この例では、`Car` クラスのインスタンスである `car` は、親クラスのパラメータである `make` と `model` を初期化しています。

### 継承された振る舞いの上書き（オーバーライド）

クラスを継承しつつ、一部の振る舞いを変更したい場合は、継承された振る舞いをオーバーライド（上書き）できます。

デフォルトでは、親クラスのメンバ関数やプロパティをオーバーライドすることはできません。抽象クラスと同様に、特別なキーワードを追加する必要があります。

#### メンバ関数

親クラスの関数をオーバーライド可能にするには、親クラス内での宣言の前に `open` キーワードを使用します。

```kotlin
open fun displayInfo() {}
```
{validate="false"}

継承されたメンバ関数をオーバーライドするには、子クラス内での関数宣言の前に `override` キーワードを使用します。

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

この例では：

* `Vehicle` クラスを継承する `Car` クラスのインスタンスを2つ作成します（`car1` と `car2`）。
* `Car` クラスで `displayInfo()` 関数をオーバーライドし、ドアの数も出力するように変更します。
* `car1` と `car2` インスタンスでオーバーライドされた `displayInfo()` 関数を呼び出します。

#### プロパティ

Kotlinでは、`open` キーワードを使用してプロパティを継承可能にし、後でオーバーライドすることは一般的な手法ではありません。多くの場合、デフォルトでプロパティが継承可能である抽象クラスやインターフェースを使用します。

オープンクラス内のプロパティは、その子クラスからアクセス可能です。一般的に、新しいプロパティでオーバーライドするよりも、それらに直接アクセスする方が適切です。

例えば、後でオーバーライドしたい `transmissionType` というプロパティがあるとします。プロパティをオーバーライドする構文は、メンバ関数をオーバーライドする場合と全く同じです。以下のように記述できます。

```kotlin
open class Vehicle(val make: String, val model: String) {
    open val transmissionType: String = "Manual"
}

class Car(make: String, model: String, val numberOfDoors: Int) : Vehicle(make, model) {
    override val transmissionType: String = "Automatic"
}
```

しかし、これは良い習慣ではありません。代わりに、継承可能なクラスのコンストラクタにプロパティを追加し、`Car` 子クラスを作成する際にその値を宣言することができます。

```kotlin
open class Vehicle(val make: String, val model: String, val transmissionType: String = "Manual")

class Car(make: String, model: String, val numberOfDoors: Int) : Vehicle(make, model, "Automatic")
```

プロパティをオーバーライドする代わりに直接アクセスすることで、よりシンプルで読みやすいコードになります。親クラスで一度プロパティを宣言し、コンストラクタを通じてその値を渡すことで、子クラスでの不必要なオーバーライドを省くことができます。

クラスの継承と振る舞いのオーバーライドについての詳細は、[継承](inheritance.md)を参照してください。

### オープンクラスとインターフェース

あるクラスを継承し、**かつ** 複数のインターフェースを実装するクラスを作成できます。この場合、コロンの後にまず親クラスを宣言し、その後にインターフェースを並べる必要があります。

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

// Carを継承し、2つのインターフェースを実装する新しいクラス
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

## 特殊なクラス

抽象クラス、オープンクラス、データクラスに加えて、Kotlinには特定の振る舞いを制限したり、小さなオブジェクトを作成する際のパフォーマンスへの影響を抑えたりするなど、さまざまな目的に合わせた特殊な型のクラスがあります。

### シールドクラス (Sealed classes)

継承を制限したい場合があります。これはシールドクラスで行うことができます。シールドクラスは[抽象クラス](kotlin-tour-intermediate-classes-interfaces.md#abstract-classes)の特殊な型です。クラスをシールド（sealed）として宣言すると、同じパッケージ内でのみその子クラスを作成できるようになります。このスコープの外でシールドクラスを継承することはできません。

> パッケージとは、関連するクラスや関数のコードの集まりで、通常はディレクトリ内に配置されます。Kotlinのパッケージの詳細については、[パッケージとインポート](packages.md)を参照してください。
> 
{style="tip"}

シールドクラスを作成するには、 `sealed` キーワードを使用します。

```kotlin
sealed class Mammal
```

シールドクラスは、 `when` 式と組み合わせると特に便利です。 `when` 式を使用することで、考えられるすべての子クラスの振る舞いを定義できます。例えば：

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
* `greetMammal()` 関数の本体内には、[`is` 演算子](typecasts.md#is-and-is-operators)を使用して `mammal` の型をチェックし、実行するアクションを決定する `when` 式があります。
* `main()` 関数は、 `name` パラメータを `Snowy` とした `Cat` クラスのインスタンスを使用して `greetMammal()` 関数を呼び出します。

> このツアーの [Null安全](kotlin-tour-intermediate-null-safety.md) の章で、 `is` 演算子についてさらに詳しく説明します。
> 
{style ="tip"}

シールドクラスの詳細と推奨されるユースケースについては、[シールドクラスとインターフェース](sealed-classes.md)を参照してください。

### 列挙型クラス (Enum classes)

列挙型クラス（Enum classes）は、クラス内で有限の異なる値の集合を表したい場合に便利です。列挙型クラスには、それ自体が列挙型クラスのインスタンスである列挙定数が含まれます。

列挙型クラスを作成するには、 `enum` キーワードを使用します。

```kotlin
enum class State
```

例えば、プロセスのさまざまな状態（ステータス）を含む列挙型クラスを作成したいとします。各列挙定数はカンマ `,` で区切る必要があります。

```kotlin
enum class State {
    IDLE, RUNNING, FINISHED
}
```

`State` 列挙型クラスには、 `IDLE`、 `RUNNING`、 `FINISHED` という列挙定数があります。列挙定数にアクセスするには、クラス名に続けて `.` と列挙定数の名前を記述します。

```kotlin
val state = State.RUNNING
```

この列挙型クラスを `when` 式で使用して、列挙定数の値に応じて実行するアクションを定義できます。

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

列挙型クラスは、通常のクラスと同様にプロパティやメンバ関数を持つことができます。

例えば、HTMLを扱っていて、いくつかの色を含む列挙型クラスを作成したいとします。各色に、16進数のRGB値を保持する `rgb` というプロパティを持たせたいとしましょう。列挙定数を作成する際に、このプロパティで初期化する必要があります。

```kotlin
enum class Color(val rgb: Int) {
    RED(0xFF0000),
    GREEN(0x00FF00),
    BLUE(0x0000FF),
    YELLOW(0xFFFF00)
}
```

> Kotlinは16進数を整数として格納するため、 `rgb` プロパティの型は `String` ではなく `Int` になります。
>
{style="note"}

このクラスにメンバ関数を追加するには、列挙定数とセミコロン `;` で区切ります。

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
    
    // 列挙定数に対して containsRed() 関数を呼び出す
    println(red.containsRed())
    // true

    // クラス名を介して列挙定数に対して containsRed() 関数を呼び出す
    println(Color.BLUE.containsRed())
    // false
  
    println(Color.YELLOW.containsRed())
    // true
}
```
{kotlin-runnable="true" id="kotlin-tour-interface-enum-classes-members"}

この例では、 `containsRed()` メンバ関数が `this` キーワードを使用して列挙定数の `rgb` プロパティの値にアクセスし、16進数値の最初のビットに `FF` が含まれているかどうかをチェックして、論理値（Boolean）を返します。

詳細は、[列挙型クラス](enum-classes.md)を参照してください。

### インライン値クラス (Inline value classes)

コード内で、クラスから小さなオブジェクトを作成し、それを短時間だけ使用したい場合があります。このアプローチはパフォーマンスに影響を与える可能性があります。インライン値クラスは、このパフォーマンスへの影響を回避する特殊な型のクラスです。ただし、これらは値のみを含むことができます。

インライン値クラスを作成するには、 `value` キーワードと `@JvmInline` アノテーションを使用します。

```kotlin
@JvmInline
value class Email
```

> `@JvmInline` アノテーションは、コンパイル時にコードを最適化するようKotlinに指示します。詳細は [アノテーション](annotations.md) を参照してください。
> 
{style="tip"}

インライン値クラスは、クラスヘッダーで初期化される **単一の** プロパティを持たなければなりません。

メールアドレスを収集するクラスを作成したいとします。

```kotlin
// addressプロパティはクラスヘッダーで初期化されます。
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

In the example:

* `Email` は、クラスヘッダーに `address` という1つのプロパティを持つインライン値クラスです。
* `sendEmail()` 関数は `Email` 型のオブジェクトを受け取り、標準出力に文字列を出力します。
* `main()` 関数では：
    * `Email` クラスのインスタンス `myEmail` を作成します。
    * `myEmail` オブジェクトを引数に `sendEmail()` 関数を呼び出します。

インライン値クラスを使用すると、クラスがインライン化され、オブジェクトを作成することなくコード内で直接使用できます。これにより、メモリフットプリントを大幅に削減し、コードのランタイムパフォーマンスを向上させることができます。

インライン値クラスの詳細については、[インライン値クラス](inline-classes.md)を参照してください。

## 演習 {completion-point="true"}

### 演習 1 {initial-collapse-state="collapsed" collapsible="true" id="special-classes-exercise-1"}

あなたは配送サービスを管理しており、荷物のステータスを追跡する方法が必要です。`DeliveryStatus` という名前のシールドクラスを作成し、以下のステータスを表すデータクラスを含めてください：`Pending`、`InTransit`、`Delivered`、`Canceled`。`main()` 関数のコードが正常に実行されるように、`DeliveryStatus` クラスの宣言を完成させてください。

|---|---|

```kotlin
sealed class // ここにコードを書いてください

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

|---|---|
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

### 演習 2 {initial-collapse-state="collapsed" collapsible="true" id="special-classes-exercise-2"}

プログラムの中で、さまざまなステータスやエラーの型を扱いたいと考えています。データクラスやオブジェクトで宣言されたさまざまなステータスをキャプチャするためのシールドクラスがあります。`Problem` という名前の列挙型クラスを作成し、異なる問題の型（`NETWORK`、`TIMEOUT`、`UNKNOWN`）を表すように以下のコードを完成させてください。

|---|---|

```kotlin
sealed class Status {
    data object Loading : Status()
    data class Error(val problem: Problem) : Status() {
        // ここにコードを書いてください
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

|---|---|
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

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-intermediate-objects.md" mode="outline" icon="arrow-left" icon-position="left">前のステップ</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-intermediate-properties.md" mode="classic" icon="arrow-right" icon-position="right">次のステップ</a>
  </li>
</list>