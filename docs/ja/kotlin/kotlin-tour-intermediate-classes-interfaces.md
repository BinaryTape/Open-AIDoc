[//]: # (title: クラスとインターフェース)

<no-index/>

初級ツアーでは、データを格納し、コード内で共有できる特性のコレクションを保持するためにクラスとデータクラスを使用する方法を学びました。やがて、プロジェクト内で効率的にコードを共有するために階層構造（hierarchy）を作成したくなるでしょう。この章では、コードを共有するために Kotlin が提供する選択肢と、それらを使用してコードをより安全で保守しやすくする方法について説明します。

## クラスの継承 {id="class-inheritance"}

前の章では、元のソースコードを変更することなくクラスを拡張するために拡張関数を使用する方法を取り上げました。しかし、クラス**間**でコードを共有することが有用であるような、より複雑なものに取り組んでいる場合はどうでしょうか？ そのような場合は、クラスの継承を使用できます。

デフォルトでは、Kotlin のクラスは継承できません。Kotlin は、意図しない継承を防ぎ、クラスの保守性を高めるためにこのように設計されています。

Kotlin のクラスは**単一継承**のみをサポートしています。つまり、**一度に1つのクラスからのみ**継承できます。このクラスは**親クラス（parent）**と呼ばれます。

あるクラスの親クラスは、さらに別のクラス（祖父母クラス）から継承することができ、階層構造を形成します。Kotlin のクラス階層の頂点には、共通の親クラスである `Any` があります。すべてのクラスは最終的に `Any` クラスから継承されます。

![Any 型を持つクラス階層の例](any-type-class.png){width="200"}

`Any` クラスは、メンバー関数として `toString()` 関数を自動的に提供します。したがって、すべてのクラスでこの継承された関数を使用できます。例えば：

```kotlin
class Car(val make: String, val model: String, val numberOfDoors: Int)

fun main() {
    //sampleStart
    val car1 = Car("Toyota", "Corolla", 4)

    // 文字列テンプレートを介して .toString() 関数を使用し、クラスのプロパティを出力
    println("Car1: make=${car1.make}, model=${car1.model}, numberOfDoors=${car1.numberOfDoors}")
    // Car1: make=Toyota, model=Corolla, numberOfDoors=4
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-any-class"}

クラス間でコードを共有するために継承を使用したい場合は、まず抽象クラスの使用を検討してください。

### 抽象クラス {id="abstract-classes"}

抽象クラス（abstract class）は、デフォルトで継承可能です。抽象クラスの目的は、他のクラスが継承または実装するためのメンバーを提供することです。そのため、コンストラクタは持ちますが、抽象クラスから直接インスタンスを作成することはできません。子クラス内では、親クラスのプロパティや関数の動作を `override` キーワードで定義します。このように、子クラスが親クラスのメンバーを「オーバーライド（override）」すると言います。

> 継承された関数やプロパティの動作を定義することを、**実装（implementation）**と呼びます。
> 
{style="tip"}

抽象クラスには、実装を**持つ**関数やプロパティと、実装を**持たない**関数やプロパティ（抽象関数および抽象プロパティと呼ばれる）の両方を含めることができます。

抽象クラスを作成するには、`abstract` キーワードを使用します。

```kotlin
abstract class Animal
```

実装を**持たない**関数またはプロパティを宣言する場合も、`abstract` キーワードを使用します。

```kotlin
abstract fun makeSound()
abstract val sound: String
```

例えば、異なる製品カテゴリを定義するために子クラスを作成できる `Product` という抽象クラスを作成したいとします。

```kotlin
abstract class Product(val name: String, var price: Double) {
    // 製品カテゴリのための抽象プロパティ
    abstract val category: String

    // すべての製品で共有できる関数
    fun productInfo(): String {
        return "Product: $name, Category: $category, Price: $price"
    }
}
```

この抽象クラスでは：

* コンストラクタには、製品の `name` と `price` の2つのパラメータがあります。
* 製品カテゴリを文字列として保持する抽象プロパティがあります。
* 製品に関する情報を出力する関数があります。

電子機器用の子クラスを作成してみましょう。子クラスで `category` プロパティの実装を定義する前に、`override` キーワードを使用する必要があります。

```kotlin
class Electronic(name: String, price: Double, val warranty: Int) : Product(name, price) {
    override val category = "Electronic"
}
```

`Electronic` クラスは：

* `Product` 抽象クラスから継承しています。
* コンストラクタに追加のパラメータ `warranty`（電子機器固有のもの）を持っています。
* `category` プロパティをオーバーライドして、文字列 `"Electronic"` を設定しています。

これで、これらのクラスを以下のように使用できます。

```kotlin
abstract class Product(val name: String, var price: Double) {
    // 製品カテゴリのための抽象プロパティ
    abstract val category: String

    // すべての製品で共有できる関数
    fun productInfo(): String {
        return "Product: $name, Category: $category, Price: $price"
    }
}

class Electronic(name: String, price: Double, val warranty: Int) : Product(name, price) {
    override val category = "Electronic"
}

//sampleStart
fun main() {
    // Electronic クラスのインスタンスを作成
    val laptop = Electronic(name = "Laptop", price = 1000.0, warranty = 2)

    println(laptop.productInfo())
    // Product: Laptop, Category: Electronic, Price: 1000.0
}
//sampleEnd
```
{kotlin-runnable="true" id="kotlin-tour-abstract-class"}

抽象クラスはこのようにコードを共有するのに最適ですが、Kotlin のクラスは単一継承しかサポートしていないため制限があります。複数のソースから継承する必要がある場合は、インターフェースの使用を検討してください。

## インターフェース {id="interfaces"}

インターフェースはクラスと似ていますが、いくつかの違いがあります。

* インターフェースのインスタンスを作成することはできません。コンストラクタやヘッダーを持ちません。
* その関数やプロパティは、デフォルトで暗黙的に継承可能です。Kotlin では、これらを「open」であると言います。
* 実装を与えない場合でも、関数を `abstract` とマークする必要はありません。

抽象クラスと同様に、インターフェースを使用して、後でクラスが継承および実装できる関数とプロパティのセットを定義します。このアプローチにより、具体的な実装の詳細ではなく、インターフェースによって記述された抽象化に集中することができます。インターフェースを使用すると、コードは以下のようになります。

* よりモジュール化される：異なる部分が分離され、それぞれを個別に進化させることができます。
* 理解しやすくなる：関連する関数を凝集性のあるセットにグループ化できます。
* テストが容易になる：テスト用に実装をモックへ素早く置き換えることができます。

インターフェースを宣言するには、`interface` キーワードを使用します。

```kotlin
interface PaymentMethod
```

### インターフェースの実装 {id="interface-implementation"}

インターフェースは多重継承をサポートしているため、クラスは一度に複数のインターフェースを実装できます。まずは、クラスが**1つの**インターフェースを実装するシナリオを考えてみましょう。

インターフェースを実装するクラスを作成するには、クラスヘッダーの後にコロンを追加し、その後に実装したいインターフェース名を記述します。インターフェースにはコンストラクタがないため、インターフェース名の後に丸括弧 `()` は付けません。

```kotlin
class CreditCardPayment : PaymentMethod
```

例：

```kotlin
interface PaymentMethod {
    // 関数はデフォルトで継承可能
    fun initiatePayment(amount: Double): String
}

class CreditCardPayment(val cardNumber: String, val cardHolderName: String, val expiryDate: String) : PaymentMethod {
    override fun initiatePayment(amount: Double): String {
        // クレジットカードによる支払い処理をシミュレート
        return "Payment of $$amount initiated using Credit Card ending in ${cardNumber.takeLast(4)}."
    }
}

fun main() {
    val paymentMethod = CreditCardPayment("1234 5678 9012 3456", "John Doe", "12/25")
    println(paymentMethod.initiatePayment(100.0))
    // Payment of $100.0 initiated using Credit Card ending in 3456.
}
```
{kotlin-runnable="true" id="kotlin-tour-interface-inheritance"}

この例では：

* `PaymentMethod` は、実装を持たない `initiatePayment()` 関数を持つインターフェースです。
* `CreditCardPayment` は、`PaymentMethod` インターフェースを実装するクラスです。
* `CreditCardPayment` クラスは、継承された `initiatePayment()` 関数をオーバーライドします。
* `paymentMethod` は `CreditCardPayment` クラスのインスタンスです。
* オーバーライドされた `initiatePayment()` 関数が、パラメータ `100.0` を渡して `paymentMethod` インスタンス上で呼び出されます。

**複数の**インターフェースを実装するクラスを作成するには、クラスヘッダーの後にコロンを追加し、実装したいインターフェース名をカンマで区切って記述します。

```kotlin
class CreditCardPayment : PaymentMethod, PaymentType
```

例：

```kotlin
interface PaymentMethod {
    fun initiatePayment(amount: Double): String
}

interface PaymentType {
    val paymentType: String
}

class CreditCardPayment(val cardNumber: String, val cardHolderName: String, val expiryDate: String) : PaymentMethod,
    PaymentType {
    override fun initiatePayment(amount: Double): String {
        // クレジットカードによる支払い処理をシミュレート
        return "Payment of $$amount initiated using Credit Card ending in ${cardNumber.takeLast(4)}."
    }

    override val paymentType: String = "Credit Card"
}

fun main() {
    val paymentMethod = CreditCardPayment("1234 5678 9012 3456", "John Doe", "12/25")
    println(paymentMethod.initiatePayment(100.0))
    // Payment of $100.0 initiated using Credit Card ending in 3456.

    println("Payment is by ${paymentMethod.paymentType}")
    // Payment is by Credit Card
}
```
{kotlin-runnable="true" id="kotlin-tour-interface-multiple-inheritance"}

この例では：

* `PaymentMethod` は、実装を持たない `initiatePayment()` 関数を持つインターフェースです。
* `PaymentType` は、初期化されていない `paymentType` プロパティを持つインターフェースです。
* `CreditCardPayment` は、`PaymentMethod` および `PaymentType` インターフェースを実装するクラスです。
* `CreditCardPayment` クラスは、継承された `initiatePayment()` 関数と `paymentType` プロパティをオーバーライドします。
* `paymentMethod` は `CreditCardPayment` クラスのインスタンスです。
* オーバーライドされた `initiatePayment()` 関数が、パラメータ `100.0` を渡して `paymentMethod` インスタンス上で呼び出されます。
* オーバーライドされた `paymentType` プロパティが、`paymentMethod` インスタンスからアクセスされます。

インターフェースおよびインターフェースの継承に関する詳細については、[インターフェース](interfaces.md)を参照してください。

## 委譲（Delegation） {id="delegation"}

インターフェースは便利ですが、インターフェースに多くの関数が含まれている場合、その子クラスには大量のボイラープレートコード（定型コード）が発生する可能性があります。クラスの動作のほんの一部だけをオーバーライドしたい場合でも、多くの記述を繰り返す必要があります。

> ボイラープレートコードとは、ソフトウェアプロジェクトの複数の箇所でほとんど、あるいはまったく変更されずに再利用されるコードの塊のことです。
> 
{style="tip"}

例えば、いくつかの関数と `color` という1つのプロパティを含む `DrawingTool` というインターフェースがあるとします。

```kotlin
interface DrawingTool {
    val color: String
    fun draw(shape: String)
    fun erase(area: String)
    fun getToolInfo(): String
}
```

`DrawingTool` インターフェースを実装し、そのすべてのメンバーの実装を提供する `PenTool` というクラスを作成します。

```kotlin
class PenTool : DrawingTool {
    override val color: String = "black"

    override fun draw(shape: String) {
        println("Drawing $shape using a pen in $color")
    }

    override fun erase(area: String) {
        println("Erasing $area with pen tool")
    }

    override fun getToolInfo(): String {
        return "PenTool(color=$color)"
    }
}
```

`PenTool` と同様の動作を持ちつつ、異なる `color` 値を持つクラスを作成したいとします。ひとつのアプローチは、`PenTool` クラスのインスタンスのように、`DrawingTool` インターフェースを実装したオブジェクトをパラメータとして受け取る新しいクラスを作成することです。そしてクラスの内部で、`color` プロパティをオーバーライドできます。

しかしこのシナリオでは、`DrawingTool` インターフェースの各メンバーの実装を追加する必要があります。

```kotlin
interface DrawingTool {
    val color: String
    fun draw(shape: String)
    fun erase(area: String)
    fun getToolInfo(): String
}

class PenTool : DrawingTool {
    override val color: String = "black"

    override fun draw(shape: String) {
        println("Drawing $shape using a pen in $color")
    }

    override fun erase(area: String) {
        println("Erasing $area with pen tool")
    }

    override fun getToolInfo(): String {
        return "PenTool(color=$color)"
    }
}
//sampleStart
class CanvasSession(val tool: DrawingTool) : DrawingTool {
    override val color: String = "blue"

    override fun draw(shape: String) {
        tool.draw(shape)
    }

    override fun erase(area: String) {
        tool.erase(area)
    }

    override fun getToolInfo(): String {
        return tool.getToolInfo()
    }
}
//sampleEnd
fun main() {
    val pen = PenTool()
    val session = CanvasSession(pen)

    println("Pen color: ${pen.color}")
    // Pen color: black

    println("Session color: ${session.color}")
    // Session color: blue

    session.draw("circle")
    // Drawing circle with pen in black

    session.erase("top-left corner")
    // Erasing top-left corner with pen tool

    println(session.getToolInfo())
    // PenTool(color=black)
}
```
{kotlin-runnable="true" id="kotlin-tour-interface-non-delegation"}

`DrawingTool` インターフェースに多数のメンバー関数がある場合、`CanvasSession` クラス内のボイラープレートコードの量が膨大になることがわかります。しかし、これに代わる方法があります。

Kotlin では、`by` キーワードを使用してインターフェースの実装をクラスインスタンスに委譲（delegate）することができます。例えば：

```kotlin
class CanvasSession(val tool: DrawingTool) : DrawingTool by tool
```

ここで `tool` は、メンバー関数の実装が委譲される `PenTool` クラスのインスタンスの名前です。

これで、`CanvasSession` クラスにメンバー関数の実装を追加する必要がなくなりました。コンパイラが `PenTool` クラスからこれを自動的に行ってくれます。これにより、大量のボイラープレートコードを書く手間が省けます。代わりに、子クラスで変更したい動作のコードだけを追加します。

例えば、`color` プロパティの値を変更したい場合：

```kotlin
interface DrawingTool {
    val color: String
    fun draw(shape: String)
    fun erase(area: String)
    fun getToolInfo(): String
}

class PenTool : DrawingTool {
    override val color: String = "black"

    override fun draw(shape: String) {
        println("Drawing $shape using a pen in $color")
    }

    override fun erase(area: String) {
        println("Erasing $area with pen tool")
    }

    override fun getToolInfo(): String {
        return "PenTool(color=$color)"
    }
}

//sampleStart
class CanvasSession(val tool: DrawingTool) : DrawingTool by tool {
    // ボイラープレートコードなし！
    override val color: String = "blue"
}
//sampleEnd
fun main() {
    val pen = PenTool()
    val session = CanvasSession(pen)

    println("Pen color: ${pen.color}")
    // Pen color: black

    println("Session color: ${session.color}")
    // Session color: blue

    session.draw("circle")
    // Drawing circle with pen in black

    session.erase("top-left corner")
    // Erasing top-left corner with pen tool

    println(session.getToolInfo())
    // PenTool(color=black)
}
```
{kotlin-runnable="true" id="kotlin-tour-interface-delegation"}

必要であれば、`CanvasSession` クラスで継承されたメンバー関数の動作をオーバーライドすることもできますが、継承されたすべてのメンバー関数に対してコードを1行ずつ追加する必要はもうありません。

詳細については、[委譲（Delegation）](delegation.md)を参照してください。

## 演習 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="抽象クラスを使用してスマートデバイスを実装する" id="classes-interfaces-exercise-1">

スマートホームシステムを開発していると想像してください。スマートホームには通常、いくつかの基本機能を持ちながらも独自の動作を持つさまざまな種類のデバイスがあります。以下のコードサンプルで、子クラスの `SmartLight` が正常にコンパイルできるように、`SmartDevice` という名前の `abstract` クラスを完成させてください。

次に、`SmartDevice` クラスから継承し、どのサーモスタットが加熱中か、またはオフになっているかを説明する出力文を返す `turnOn()` および `turnOff()` 関数を実装する `SmartThermostat` という名前の別の子クラスを作成します。
最後に、温度の測定値を入力として受け取り、`$name thermostat set to $temperature°C.` と出力する `adjustTemperature()` という名前の別の関数を追加します。

<deflist collapsible="true">
    <def title="ヒント">
        <code>SmartDevice</code> クラスに <code>turnOn()</code> および <code>turnOff()</code> 関数を追加して、後で <code>SmartThermostat</code> クラスでその動作をオーバーライドできるようにします。
    </def>
</deflist>

```kotlin
abstract class // ここにコードを記述してください

class SmartLight(name: String) : SmartDevice(name) {
    override fun turnOn() {
        println("$name is now ON.")
    }

    override fun turnOff() {
        println("$name is now OFF.")
    }

   fun adjustBrightness(level: Int) {
        println("Adjusting $name brightness to $level%.")
    }
}

class SmartThermostat // ここにコードを記述してください

fun main() {
    val livingRoomLight = SmartLight("Living Room Light")
    val bedroomThermostat = SmartThermostat("Bedroom Thermostat")
    
    livingRoomLight.turnOn()
    // Living Room Light is now ON.
    livingRoomLight.adjustBrightness(10)
    // Adjusting Living Room Light brightness to 10%.
    livingRoomLight.turnOff()
    // Living Room Light is now OFF.

    bedroomThermostat.turnOn()
    // Bedroom Thermostat thermostat is now heating.
    bedroomThermostat.adjustTemperature(5)
    // Bedroom Thermostat thermostat set to 5°C.
    bedroomThermostat.turnOff()
    // Bedroom Thermostat thermostat is now off.
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-classes-interfaces-exercise-1"}

```kotlin
abstract class SmartDevice(val name: String) {
    abstract fun turnOn()
    abstract fun turnOff()
}

class SmartLight(name: String) : SmartDevice(name) {
    override fun turnOn() {
        println("$name is now ON.")
    }

    override fun turnOff() {
        println("$name is now OFF.")
    }

   fun adjustBrightness(level: Int) {
        println("Adjusting $name brightness to $level%.")
    }
}

class SmartThermostat(name: String) : SmartDevice(name) {
    override fun turnOn() {
        println("$name thermostat is now heating.")
    }

    override fun turnOff() {
        println("$name thermostat is now off.")
    }

   fun adjustTemperature(temperature: Int) {
        println("$name thermostat set to $temperature°C.")
    }
}

fun main() {
    val livingRoomLight = SmartLight("Living Room Light")
    val bedroomThermostat = SmartThermostat("Bedroom Thermostat")
    
    livingRoomLight.turnOn()
    // Living Room Light is now ON.
    livingRoomLight.adjustBrightness(10)
    // Adjusting Living Room Light brightness to 10%.
    livingRoomLight.turnOff()
    // Living Room Light is now OFF.

    bedroomThermostat.turnOn()
    // Bedroom Thermostat thermostat is now heating.
    bedroomThermostat.adjustTemperature(5)
    // Bedroom Thermostat thermostat set to 5°C.
    bedroomThermostat.turnOff()
    // Bedroom Thermostat thermostat is now off.
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-classes-interfaces-solution-1"}

</def>
<def title="メディアインターフェースを実装する" id="classes-interfaces-exercise-2">

`Audio`、`Video`、または `Podcast` のような特定のメディアクラスを実装するために使用できる `Media` という名前のインターフェースを作成してください。インターフェースには以下を含める必要があります。

* メディアのタイトルを表す `title` という名前のプロパティ。
* メディアを再生するための `play()` という名前の関数。

次に、`Media` インターフェースを実装する `Audio` という名前のクラスを作成します。`Audio` クラスはコンストラクタで `title` プロパティを使用し、さらに `String` 型の `composer` という名前の追加のプロパティを持つ必要があります。クラス内で `play()` 関数を実装し、`"Playing audio: $title, composed by $composer"` と出力するようにします。

<deflist collapsible="true">
    <def title="ヒント">
        クラスヘッダーで <code>override</code> キーワードを使用すると、コンストラクタ内でインターフェースのプロパティを実装できます。
    </def>
</deflist>

```kotlin
interface // ここにコードを記述してください

class // ここにコードを記述してください

fun main() {
    val audio = Audio("Symphony No. 5", "Beethoven")
    audio.play()
   // Playing audio: Symphony No. 5, composed by Beethoven
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-classes-interfaces-exercise-2"}

```kotlin
interface Media {
    val title: String
    fun play()
}

class Audio(override val title: String, val composer: String) : Media {
    override fun play() {
        println("Playing audio: $title, composed by $composer")
    }
}

fun main() {
    val audio = Audio("Symphony No. 5", "Beethoven")
    audio.play()
   // Playing audio: Symphony No. 5, composed by Beethoven
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-classes-interfaces-solution-2"}

</def>
<def title="インターフェースと抽象クラスを組み合わせる" id="classes-interfaces-exercise-3">

eコマースアプリケーション用の決済処理システムを構築しています。各決済方法は、支払いを承認（authorize）し、トランザクションを処理できる必要があります。一部の支払いでは、返金を処理できる必要もあります。

1. `Refundable` インターフェースに、返金を処理するための `refund()` という名前の関数を追加します。

2. `PaymentMethod` 抽象クラスで：
   * 金額を受け取り、その金額を含むメッセージを出力する `authorize()` という名前の関数を追加します。
   * 同じく金額を受け取る `processPayment()` という名前の抽象関数を追加します。

3. `Refundable` インターフェースと `PaymentMethod` 抽象クラスを実装する `CreditCard` という名前のクラスを作成します。
このクラスに `refund()` および `processPayment()` 関数の実装を追加し、以下のメッセージを出力するようにします。
   * `"Refunding $amount to the credit card."`
   * `"Processing credit card payment of $amount."`

```kotlin
interface Refundable {
    // ここにコードを記述してください
}

abstract class PaymentMethod(val name: String) {
    // ここにコードを記述してください
}

class CreditCard // ここにコードを記述してください

fun main() {
    val visa = CreditCard("Visa")
    
    visa.authorize(100.0)
    // Authorizing payment of $100.0.
    visa.processPayment(100.0)
    // Processing credit card payment of $100.0.
    visa.refund(50.0)
    // Refunding $50.0 to the credit card.
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-classes-interfaces-exercise-3"}

```kotlin
interface Refundable {
    fun refund(amount: Double)
}

abstract class PaymentMethod(val name: String) {
    fun authorize(amount: Double) {
        println("Authorizing payment of $$amount.")
    }

    abstract fun processPayment(amount: Double)
}

class CreditCard(name: String) : PaymentMethod(name), Refundable {
    override fun processPayment(amount: Double) {
        println("Processing credit card payment of $$amount.")
    }

    override fun refund(amount: Double) {
        println("Refunding $$amount to the credit card.")
    }
}

fun main() {
    val visa = CreditCard("Visa")
    
    visa.authorize(100.0)
    // Authorizing payment of $100.0.
    visa.processPayment(100.0)
    // Processing credit card payment of $100.0.
    visa.refund(50.0)
    // Refunding $50.0 to the credit card.
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-classes-interfaces-solution-3"}

</def>
<def title="インターフェース委譲で動作をカスタマイズする" id="classes-interfaces-exercise-4">

基本的な機能を持つシンプルなメッセージングアプリがありますが、コードを大幅に重複させることなく、_スマート（smart）_ メッセージ用の機能を追加したいと考えています。

以下のコードで、`Messenger` インターフェースを継承しつつ、実装を `BasicMessenger` クラスのインスタンスに委譲する `SmartMessenger` という名前のクラスを定義してください。

`SmartMessenger` クラスで、スマートメッセージを送信するために `sendMessage()` 関数をオーバーライドします。この関数は入力として `message` を受け取り、`"Sending a smart message: $message"` という出力文を返す必要があります。さらに、`BasicMessenger` クラスの `sendMessage()` 関数を呼び出し、メッセージの先頭に `[smart]` を付加してください。

> `SmartMessenger` クラスで `receiveMessage()` 関数を書き直す必要はありません。
> 
{style="note"}

```kotlin
interface Messenger {
    fun sendMessage(message: String)
    fun receiveMessage(): String
}

class BasicMessenger : Messenger {
    override fun sendMessage(message: String) {
        println("Sending message: $message")
    }

    override fun receiveMessage(): String {
        return "You've got a new message!"
    }
}

class SmartMessenger // ここにコードを記述してください

fun main() {
    val basicMessenger = BasicMessenger()
    val smartMessenger = SmartMessenger(basicMessenger)
    
    basicMessenger.sendMessage("Hello!")
    // Sending message: Hello!
    println(smartMessenger.receiveMessage())
    // You've got a new message!
    smartMessenger.sendMessage("Hello from SmartMessenger!")
    // Sending a smart message: Hello from SmartMessenger!
    // Sending message: [smart] Hello from SmartMessenger!
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-classes-interfaces-exercise-4"}

```kotlin
interface Messenger {
    fun sendMessage(message: String)
    fun receiveMessage(): String
}

class BasicMessenger : Messenger {
    override fun sendMessage(message: String) {
        println("Sending message: $message")
    }

    override fun receiveMessage(): String {
        return "You've got a new message!"
    }
}

class SmartMessenger(val basicMessenger: BasicMessenger) : Messenger by basicMessenger {
    override fun sendMessage(message: String) {
        println("Sending a smart message: $message")
        basicMessenger.sendMessage("[smart] $message")
    }
}

fun main() {
    val basicMessenger = BasicMessenger()
    val smartMessenger = SmartMessenger(basicMessenger)
    
    basicMessenger.sendMessage("Hello!")
    // Sending message: Hello!
    println(smartMessenger.receiveMessage())
    // You've got a new message!
    smartMessenger.sendMessage("Hello from SmartMessenger!")
    // Sending a smart message: Hello from SmartMessenger!
    // Sending message: [smart] Hello from SmartMessenger!
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-classes-interfaces-solution-4"}

</def>
</deflist>

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-intermediate-lambdas-receiver.md" mode="outline" icon="arrow-left" icon-position="left">前のステップ</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-intermediate-objects.md" mode="classic" icon="arrow-right" icon-position="right">次のステップ</a>
  </li>
</list>