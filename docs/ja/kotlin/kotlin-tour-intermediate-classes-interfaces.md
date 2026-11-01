[//]: # (title: クラスとインターフェース)

<no-index/>

初級編のツアーでは、データを保持し、コード内で共有できる特性の集まりを管理するために、クラスやデータクラスを使用する方法を学びました。やがて、プロジェクト内でコードを効率的に共有するために階層構造を作成したくなるでしょう。この章では、コードを共有するためにKotlinが提供しているオプションと、それらがどのようにコードをより安全で保守しやすくするかについて説明します。

## クラスの継承 {id="class-inheritance"}

前の章では、元のソースコードを変更することなく拡張関数を使用してクラスを拡張する方法を説明しました。しかし、クラス**間**でコードを共有することが有用な、より複雑なものに取り組んでいる場合はどうでしょうか？そのような場合は、クラスの継承を使用できます。

デフォルトでは、Kotlinのクラスは継承できません。Kotlinは意図しない継承を防ぎ、クラスの保守性を高めるためにこのように設計されています。

Kotlinのクラスは**単一継承**のみをサポートしています。つまり、**一度に1つのクラス**からしか継承できません。このクラスは**親（parent）**と呼ばれます。

クラスの親がさらに別のクラス（祖父母）から継承することで、階層が形成されます。Kotlinのクラス階層の最上位にある共通の親クラスは `Any` です。すべてのクラスは最終的に `Any` クラスを継承しています：

![Any型を持つクラス階層の例](any-type-class.png){width="200"}

`Any` クラスはメンバ関数として `toString()` 関数を自動的に提供します。そのため、この継承された関数を任意のクラスで使用できます。例えば：

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

抽象クラスはデフォルトで継承可能です。抽象クラスの目的は、他のクラスが継承または実装するためのメンバを提供することです。そのため、コンストラクタは持っていますが、そこからインスタンスを生成することはできません。子クラス内では、`override` キーワードを使用して親のプロパティや関数の振る舞いを定義します。このように、子クラスが親クラスのメンバを「オーバーライド（override）」すると言います。

> 継承された関数やプロパティの振る舞いを定義することを、**実装（implementation）**と呼びます。
> 
{style="tip"}

抽象クラスには、実装**を持つ**関数やプロパティと、抽象関数や抽象プロパティとして知られる実装**を持たない**関数やプロパティの両方を含めることができます。

抽象クラスを作成するには、`abstract` キーワードを使用します：

```kotlin
abstract class Animal
```

実装**を持たない**関数やプロパティを宣言する場合も、`abstract` キーワードを使用します：

```kotlin
abstract fun makeSound()
abstract val sound: String
```

例えば、さまざまな製品カテゴリを定義するために子クラスを作成できる、`Product` という抽象クラスを作成したいとします：

```kotlin
abstract class Product(val name: String, var price: Double) {
    // 製品カテゴリ用の抽象プロパティ
    abstract val category: String

    // すべての製品で共有できる関数
    fun productInfo(): String {
        return "Product: $name, Category: $category, Price: $price"
    }
}
```

この抽象クラスでは：

* コンストラクタには、製品の `name` と `price` のための2つのパラメータがあります。
* 製品カテゴリを文字列として保持する抽象プロパティがあります。
* 製品に関する情報を出力する関数があります。

電子機器用の子クラスを作成してみましょう。子クラスで `category` プロパティの実装を定義する前に、`override` キーワードを使用する必要があります：

```kotlin
class Electronic(name: String, price: Double, val warranty: Int) : Product(name, price) {
    override val category = "Electronic"
}
```

`Electronic` クラスは：

* 抽象クラス `Product` を継承しています。
* コンストラクタに、電子機器固有の追加パラメータ `warranty` を持っています。
* `category` プロパティをオーバーライドして、文字列 `"Electronic"` を設定しています。

これで、これらのクラスを次のように使用できます：

```kotlin
abstract class Product(val name: String, var price: Double) {
    // 製品カテゴリ用の抽象プロパティ
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
    // Electronicクラスのインスタンスを生成
    val laptop = Electronic(name = "Laptop", price = 1000.0, warranty = 2)

    println(laptop.productInfo())
    // Product: Laptop, Category: Electronic, Price: 1000.0
}
//sampleEnd
```
{kotlin-runnable="true" id="kotlin-tour-abstract-class"}

抽象クラスはこのようにコードを共有するのに優れていますが、Kotlinのクラスは単一継承しかサポートしていないため制限があります。複数のソースから継承する必要がある場合は、インターフェースの使用を検討してください。

## インターフェース {id="interfaces"}

インターフェースはクラスと似ていますが、いくつかの違いがあります：

* インターフェースのインスタンスを作成することはできません。コンストラクタやヘッダーも持ちません。
* その関数とプロパティは、デフォルトで暗黙的に継承可能です。Kotlinでは、それらを「オープン（open）」であると言います。
* 実装を与えない場合でも、関数に `abstract` とマークする必要はありません。

抽象クラスと同様に、クラスが後で継承して実装できる関数とプロパティのセットを定義するためにインターフェースを使用します。このアプローチにより、具体的な実装の詳細ではなく、インターフェースによって記述された抽象化に集中できるようになります。インターフェースを使用すると、コードは次のようになります：

* さまざまな部分を分離し、独立して進化させることができるため、よりモジュール化されます。
* 関連する関数をまとまりのあるセットにグループ化することで、理解しやすくなります。
* テスト用に実装をモックと迅速に差し替えることができるため、テストが容易になります。

インターフェースを宣言するには、`interface` キーワードを使用します：

```kotlin
interface PaymentMethod
```

### インターフェースの実装 {id="interface-implementation"}

インターフェースは多重継承をサポートしているため、1つのクラスが複数のインターフェースを同時に実装できます。まず、クラスが**1つ**のインターフェースを実装するシナリオを考えてみましょう。

インターフェースを実装するクラスを作成するには、クラスヘッダーの後にコロンを追加し、その後に実装するインターフェース名を続けます。インターフェースにはコンストラクタがないため、インターフェース名の後に丸括弧 `()` は使用しません：

```kotlin
class CreditCardPayment : PaymentMethod
```

例えば：

```kotlin
interface PaymentMethod {
    // 関数はデフォルトで継承可能
    fun initiatePayment(amount: Double): String
}

class CreditCardPayment(val cardNumber: String, val cardHolderName: String, val expiryDate: String) : PaymentMethod {
    override fun initiatePayment(amount: Double): String {
        // クレジットカードによる決済処理をシミュレート
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
* `CreditCardPayment` は `PaymentMethod` インターフェースを実装するクラスです。
* `CreditCardPayment` クラスは、継承された `initiatePayment()` 関数をオーバーライドしています。
* `paymentMethod` は `CreditCardPayment` クラスのインスタンスです。
* オーバーライドされた `initiatePayment()` 関数が、引数 `100.0` で `paymentMethod` インスタンスに対して呼び出されます。

**複数**のインターフェースを実装するクラスを作成するには、クラスヘッダーの後にコロンを追加し、実装するインターフェース名をカンマ区切りで続けます：

```kotlin
class CreditCardPayment : PaymentMethod, PaymentType
```

例えば：

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
        // クレジットカードによる決済処理をシミュレート
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

* `PaymentMethod` は実装を持たない `initiatePayment()` 関数を持つインターフェースです。
* `PaymentType` は初期化されていない `paymentType` プロパティを持つインターフェースです。
* `CreditCardPayment` は `PaymentMethod` と `PaymentType` の両インターフェースを実装するクラスです。
* `CreditCardPayment` クラスは、継承された `initiatePayment()` 関数と `paymentType` プロパティをオーバーライドしています。
* `paymentMethod` は `CreditCardPayment` クラスのインスタンスです。
* オーバーライドされた `initiatePayment()` 関数が、引数 `100.0` で `paymentMethod` インスタンスに対して呼び出されます。
* `paymentMethod` インスタンス上で、オーバーライドされた `paymentType` プロパティにアクセスしています。

インターフェースとインターフェースの継承に関する詳細については、[インターフェース](interfaces.md)を参照してください。

## 委譲（Delegation） {id="delegation"}

インターフェースは便利ですが、インターフェースに多くの関数が含まれていると、その子クラスに大量のボイラープレートコードが発生してしまう可能性があります。クラスの振る舞いの一部だけをオーバーライドしたい場合でも、多くのコードを繰り返し記述しなければなりません。

> ボイラープレートコードとは、ソフトウェアプロジェクトの複数の箇所で、ほとんどまたは全く変更されずに再利用されるコードの塊のことです。
> 
{style="tip"}

例えば、いくつかの関数と `color` という1つのプロパティを含む `DrawingTool` というインターフェースがあるとします：

```kotlin
interface DrawingTool {
    val color: String
    fun draw(shape: String)
    fun erase(area: String)
    fun getToolInfo(): String
}
```

`DrawingTool` インターフェースを実装し、そのすべてのメンバの実装を提供する `PenTool` というクラスを作成します：

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

`PenTool` と同様の振る舞いを持ちながら、`color` の値だけが異なるクラスを作成したいとします。1つのアプローチは、`PenTool` クラスのインスタンスのように、`DrawingTool` インターフェースを実装するオブジェクトをパラメータとして受け取る新しいクラスを作成することです。その後、クラスの内部で `color` プロパティをオーバーライドします。

しかしこのシナリオでは、`DrawingTool` インターフェースの各メンバに対する実装を追加する必要があります：

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

`DrawingTool` インターフェースに大量のメンバ関数がある場合、`CanvasSession` クラス内のボイラープレートコードの量が膨大になる可能性があることがわかります。しかし、代替案があります。

Kotlinでは、`by` キーワードを使用して、インターフェースの実装をクラスインスタンスに委譲できます。例えば：

```kotlin
class CanvasSession(val tool: DrawingTool) : DrawingTool by tool
```

ここで、`tool` はメンバ関数の実装の委譲先となる `PenTool` クラスインスタンスの名前です。

これにより、`CanvasSession` クラスでメンバ関数の実装を追加する必要がなくなります。コンパイラが `PenTool` クラスからこれを自動的に行ってくれます。これにより、大量のボイラープレートコードを書く手間が省けます。代わりに、子クラスで変更したい振る舞いについてのみコードを追加します。

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
    // ボイラープレートコードは不要です！
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

必要に応じて、`CanvasSession` クラスで継承されたメンバ関数の振る舞いをオーバーライドすることもできますが、継承されたすべてのメンバ関数に対して新しいコード行を追加する必要はもうありません。

詳細については、[委譲（Delegation）](delegation.md)を参照してください。

## 演習 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="抽象クラスを使用したスマートデバイスの実装" id="classes-interfaces-exercise-1">

スマートホームシステムを開発していると想像してください。スマートホームには通常、いくつかの基本機能を備えつつ、それぞれ独自の動作をするさまざまな種類のデバイスがあります。以下のコードサンプルで、子クラスの `SmartLight` が正常にコンパイルできるように、`SmartDevice` という `abstract` クラスを完成させてください。

次に、`SmartDevice` クラスを継承し、どのサーモスタットが加熱中かまたはオフになっているかを説明する出力文を返す `turnOn()` および `turnOff()` 関数を実装する、`SmartThermostat` という別の子クラスを作成してください。最後に、温度の測定値を入力として受け取り、`$name thermostat set to $temperature°C.` と出力する `adjustTemperature()` という別の関数を追加してください。

<deflist collapsible="true">
    <def title="ヒント">
        <code>SmartDevice</code> クラスに <code>turnOn()</code> および <code>turnOff()</code> 関数を追加して、後で <code>SmartThermostat</code> クラスでそれらの振る舞いをオーバーライドできるようにします。
    </def>
</deflist>

```kotlin
abstract class // ここにコードを書いてください

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

class SmartThermostat // ここにコードを書いてください

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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/SmartDeviceTest.kt" validate="false" id="kotlin-tour-classes-interfaces-exercise-1"}

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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/SmartDeviceTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-classes-interfaces-solution-1"}

</def>
<def title="メディアインターフェースの実装" id="classes-interfaces-exercise-2">

`Audio`、`Video`、`Podcast` のような特定のメディアクラスを実装するために使用できる `Media` というインターフェースを作成してください。インターフェースには以下を含める必要があります：

* メディアのタイトルを表す `title` というプロパティ。
* メディアを再生するための `play()` という関数。

次に、`Media` インターフェースを実装する `Audio` というクラスを作成してください。`Audio` クラスはコンストラクタで `title` プロパティを使用し、さらに `String` 型の `composer` という追加のプロパティを持つ必要があります。クラス内で `play()` 関数を実装し、`"Playing audio: $title, composed by $composer"` と出力するようにしてください。

<deflist collapsible="true">
    <def title="ヒント">
        クラスヘッダーで <code>override</code> キーワードを使用することで、インターフェースのプロパティをコンストラクタ内で実装できます。
    </def>
</deflist>

```kotlin
interface // ここにコードを書いてください

class // ここにコードを書いてください

fun main() {
    val audio = Audio("Symphony No. 5", "Beethoven")
    audio.play()
   // Playing audio: Symphony No. 5, composed by Beethoven
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/AudioTest.kt" validate="false" id="kotlin-tour-classes-interfaces-exercise-2"}

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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/AudioTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-classes-interfaces-solution-2"}

</def>
<def title="インターフェースと抽象クラスの組み合わせ" id="classes-interfaces-exercise-3">

Eコマースアプリケーション向けの決済処理システムを構築しています。各支払い方法は、支払いの承認とトランザクションの処理ができる必要があります。一部の支払いでは、返金処理もできる必要があります。

1. `Refundable` インターフェースに、返金を処理する `refund()` という関数を追加します。

2. `PaymentMethod` 抽象クラスで：
   * 金額を受け取り、その金額を含むメッセージを出力する `authorize()` という関数を追加します。
   * 同様に金額を受け取る `processPayment()` という抽象関数を追加します。

3. `Refundable` インターフェースと `PaymentMethod` 抽象クラスを実装する `CreditCard` というクラスを作成します。このクラスで、以下の文を出力するように `refund()` と `processPayment()` 関数の実装を追加します：
   * `"Refunding $amount to the credit card."`
   * `"Processing credit card payment of $amount."`

```kotlin
interface Refundable {
    // ここにコードを書いてください
}

abstract class PaymentMethod(val name: String) {
    // ここにコードを書いてください
}

class CreditCard // ここにコードを書いてください

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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/CreditCardTest.kt" validate="false" id="kotlin-tour-classes-interfaces-exercise-3"}

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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/CreditCardTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-classes-interfaces-solution-3"}

</def>
<def title="インターフェースの委譲による振る舞いのカスタマイズ" id="classes-interfaces-exercise-4">

基本的な機能を備えたシンプルなメッセージングアプリがありますが、コードを大幅に重複させることなく、_スマート（smart）_ メッセージ向けの機能を追加したいと考えています。

以下のコードで、`Messenger` インターフェースを継承しつつ、その実装を `BasicMessenger` クラスのインスタンスに委譲する `SmartMessenger` というクラスを定義してください。

`SmartMessenger` クラスで、スマートメッセージを送信するように `sendMessage()` 関数をオーバーライドしてください。この関数は入力として `message` を受け取り、`"Sending a smart message: $message"` と出力文を返す必要があります。さらに、`BasicMessenger` クラスの `sendMessage()` 関数を呼び出し、メッセージの先頭に `[smart]` を付加してください。

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

class SmartMessenger // ここにコードを書いてください

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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/SmartMessengerTest.kt" validate="false" id="kotlin-tour-classes-interfaces-exercise-4"}

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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/SmartMessengerTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-classes-interfaces-solution-4"}

</def>
</deflist>

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-intermediate-lambdas-receiver.md" mode="outline" icon="arrow-left" icon-position="left">Previous step</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-intermediate-objects.md" mode="classic" icon="arrow-right" icon-position="right">Next step</a>
  </li>
</list>