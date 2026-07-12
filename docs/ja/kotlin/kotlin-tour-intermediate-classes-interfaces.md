[//]: # (title: クラスとインターフェース)

<no-index/>

初心者向けツアーでは、データを保存し、コード内で共有できる特性のコレクションを維持するために、クラスやデータクラスを使用する方法を学びました。最終的には、プロジェクト内でコードを効率的に共有するために、階層構造を作成したくなるでしょう。この章では、Kotlinが提供するコード共有のためのオプションと、それらがどのようにコードをより安全にし、メンテナンスを容易にするかについて説明します。

## クラスの継承

前の章では、元のソースコードを修正することなくクラスを拡張するために、拡張関数を使用する方法を学びました。
しかし、クラス**間**でコードを共有することが有用な、より複雑なものに取り組んでいる場合はどうでしょうか？そのような場合には、クラスの継承を使用できます。

デフォルトでは、Kotlinのクラスは継承できません。Kotlinはこのように設計されており、意図しない継承を防ぎ、クラスのメンテナンスを容易にしています。

Kotlinのクラスは**単一継承**のみをサポートしています。つまり、一度に**1つのクラス**からしか継承できません。このクラスは**親クラス (parent)**と呼ばれます。

あるクラスの親が別のクラス（祖父クラス）から継承することで、階層構造が形成されます。Kotlinのクラス階層の頂点には、共通の親クラスである `Any` があります。すべてのクラスは最終的に `Any` クラスを継承しています。

![Any型を含むクラス階層の例](any-type-class.png){width="200"}

`Any` クラスは、メンバ関数として `toString()` 関数を自動的に提供します。したがって、この継承された関数をどのクラスでも使用できます。例えば：

```kotlin
class Car(val make: String, val model: String, val numberOfDoors: Int)

fun main() {
    //sampleStart
    val car1 = Car("Toyota", "Corolla", 4)

    // 文字列テンプレートを介して .toString() 関数を使用し、クラスのプロパティをプリントする
    println("Car1: make=${car1.make}, model=${car1.model}, numberOfDoors=${car1.numberOfDoors}")
    // Car1: make=Toyota, model=Corolla, numberOfDoors=4
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-any-class"}

継承を使用してクラス間でコードを共有したい場合は、まず抽象クラスの使用を検討してください。

### 抽象クラス (Abstract classes)

抽象クラスは、デフォルトで継承可能です。抽象クラスの目的は、他のクラスが継承または実装するためのメンバを提供することです。その結果、抽象クラスはコンストラクタを持ちますが、そこからインスタンスを作成することはできません。子クラス内では、`override` キーワードを使用して、親クラスのプロパティや関数の動作を定義します。このようにして、子クラスが親クラスのメンバを「オーバーライド（上書き）」すると言えます。

> 継承された関数やプロパティの動作を定義することを、**実装 (implementation)**と呼びます。
> 
{style="tip"}

抽象クラスには、実装**を持つ**関数やプロパティと、抽象関数や抽象プロパティと呼ばれる実装**を持たない**関数やプロパティの両方を含めることができます。

抽象クラスを作成するには、`abstract` キーワードを使用します。

```kotlin
abstract class Animal
```

実装を**持たない**関数やプロパティを宣言する場合も、`abstract` キーワードを使用します。

```kotlin
abstract fun makeSound()
abstract val sound: String
```

例えば、`Product` という抽象クラスを作成し、そこから異なる製品カテゴリを定義する子クラスを作成したいとします。

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

* コンストラクタには、製品の `name`（名前）と `price`（価格）の2つのパラメータがあります。
* 製品カテゴリを文字列として保持する抽象プロパティがあります。
* 製品に関する情報を出力する関数があります。

電子機器（electronics）のための子クラスを作成しましょう。子クラスで `category` プロパティの実装を定義する前に、`override` キーワードを使用する必要があります。

```kotlin
class Electronic(name: String, price: Double, val warranty: Int) : Product(name, price) {
    override val category = "Electronic"
}
```

`Electronic` クラスは：

* `Product` 抽象クラスから継承しています。
* コンストラクタに、電子機器特有の `warranty`（保証）という追加のパラメータを持っています。
* `"Electronic"` という文字列を保持するように `category` プロパティをオーバーライドしています。

これで、これらのクラスを次のように使用できます。

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
    // Electronicクラスのインスタンスを作成
    val laptop = Electronic(name = "Laptop", price = 1000.0, warranty = 2)

    println(laptop.productInfo())
    // Product: Laptop, Category: Electronic, Price: 1000.0
}
//sampleEnd
```
{kotlin-runnable="true" id="kotlin-tour-abstract-class"}

抽象クラスはこのようにコードを共有するのに適していますが、Kotlinのクラスは単一継承しかサポートしていないため、制限があります。複数のソースから継承する必要がある場合は、インターフェースの使用を検討してください。

## インターフェース

インターフェースはクラスに似ていますが、いくつかの違いがあります：

* インターフェースのインスタンスを作成することはできません。コンストラクタやヘッダーを持ちません。
* 関数やプロパティはデフォルトで暗黙的に継承可能です。Kotlinでは、これらを "open" であると言います。
* 実装を与えない場合、関数に `abstract` とマークする必要はありません。

抽象クラスと同様に、インターフェースを使用して、クラスが後で継承して実装できる関数やプロパティのセットを定義します。このアプローチは、具体的な実装の詳細ではなく、インターフェースによって記述される抽象化に集中するのに役立ちます。インターフェースを使用すると、コードは以下のようになります：

* 異なる部分を分離し、それぞれを独立して進化させることができるため、よりモジュール化されます。
* 関連する関数をまとまったセットにグループ化することで、理解しやすくなります。
* テストのために実装をモック（模造品）に素早く交換できるため、テストが容易になります。

インターフェースを宣言するには、`interface` キーワードを使用します。

```kotlin
interface PaymentMethod
```

### インターフェースの実装

インターフェースは多重継承をサポートしているため、クラスは一度に複数のインターフェースを実装できます。まず、クラスが**1つの**インターフェースを実装するシナリオを考えてみましょう。

インターフェースを実装するクラスを作成するには、クラスヘッダーの後にコロンを付け、その後に実装したいインターフェース名を記述します。インターフェースにはコンストラクタがないため、インターフェース名の後に括弧 `()` は使用しません。

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
        // クレジットカードでの支払い処理をシミュレート
        return "Payment of $amount initiated using Credit Card ending in ${cardNumber.takeLast(4)}."
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

* `PaymentMethod` は、実装のない `initiatePayment()` 関数を持つインターフェースです。
* `CreditCardPayment` は、`PaymentMethod` インターフェースを実装するクラスです。
* `CreditCardPayment` クラスは、継承された `initiatePayment()` 関数をオーバーライドしています。
* `paymentMethod` は `CreditCardPayment` クラスのインスタンスです。
* オーバーライドされた `initiatePayment()` 関数が、`paymentMethod` インスタンスに対してパラメータ `100.0` で呼び出されます。

**複数の**インターフェースを実装するクラスを作成するには、クラスヘッダーの後にコロンを付け、実装したいインターフェースの名前をカンマで区切って記述します。

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
        // クレジットカードでの支払い処理をシミュレート
        return "Payment of $amount initiated using Credit Card ending in ${cardNumber.takeLast(4)}."
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

* `PaymentMethod` は、実装のない `initiatePayment()` 関数を持つインターフェースです。
* `PaymentType` は、初期化されていない `paymentType` プロパティを持つインターフェースです。
* `CreditCardPayment` は、`PaymentMethod` と `PaymentType` の両方のインターフェースを実装するクラスです。
* `CreditCardPayment` クラスは、継承された `initiatePayment()` 関数と `paymentType` プロパティの両方をオーバーライドしています。
* `paymentMethod` は `CreditCardPayment` クラスのインスタンスです。
* オーバーライドされた `initiatePayment()` 関数が `paymentMethod` インスタンスに対して呼び出されます。
* オーバーライドされた `paymentType` プロパティが `paymentMethod` インスタンスからアクセスされます。

インターフェースとインターフェースの継承に関する詳細については、[インターフェース](interfaces.md)を参照してください。

## 委譲 (Delegation)

インターフェースは便利ですが、インターフェースに多くの関数が含まれている場合、その子クラスは大量のボイラープレートコードで終わってしまう可能性があります。クラスの動作のほんの一部だけをオーバーライドしたい場合でも、多くの部分を繰り返して記述する必要があります。

> ボイラープレートコードとは、ソフトウェアプロジェクトの複数の箇所で、ほとんど、あるいは全く変更せずに再利用されるコードの断片のことです。
> 
{style="tip"}

例えば、多数の関数と `color` という1つのプロパティを持つ `DrawingTool` というインターフェースがあるとします。

```kotlin
interface DrawingTool {
    val color: String
    fun draw(shape: String)
    fun erase(area: String)
    fun getToolInfo(): String
}
```

`DrawingTool` インターフェースを実装し、そのすべてのメンバの実装を提供する `PenTool` クラスを作成します。

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

`PenTool` と同じ動作ですが、`color` 値だけが異なるクラスを作成したいとします。
1つの方法は、`DrawingTool` インターフェースを実装するオブジェクト（`PenTool` クラスのインスタンスなど）をパラメータとして受け取る新しいクラスを作成することです。そして、クラス内で `color` プロパティをオーバーライドします。

しかし、このシナリオでは `DrawingTool` インターフェースの各メンバに対して実装を追加する必要があります。

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

`DrawingTool` インターフェースに多数のメンバ関数がある場合、`CanvasSession` クラス内のボイラープレートコードの量が膨大になることがわかります。しかし、代替案があります。

Kotlinでは、`by` キーワードを使用して、インターフェースの実装をクラスインスタンスに委譲（delegate）できます。例えば：

```kotlin
class CanvasSession(val tool: DrawingTool) : DrawingTool by tool
```

ここで、`tool` はメンバ関数の実装が委譲される `DrawingTool` 型（例えば `PenTool` クラスのインスタンス）の名前です。

これで、`CanvasSession` クラスにメンバ関数の実装を追加する必要がなくなりました。コンパイラが `PenTool` クラスから自動的にこれを行ってくれます。これにより、大量のボイラープレートコードを書く手間が省けます。代わりに、子クラスで変更したい動作のコードだけを追加します。

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
    // ボイラープレートコードは不要！
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

必要であれば、`CanvasSession` クラスで継承されたメンバ関数の動作をオーバーライドすることもできますが、すべての継承されたメンバ関数に対して新しいコード行を追加する必要はもうありません。

詳細については、[委譲 (Delegation)](delegation.md)を参照してください。

## 練習問題 {completion-point="true"}

### 練習問題 1 {initial-collapse-state="collapsed" collapsible="true" id="classes-interfaces-exercise-1"}

スマートホームシステムを構築していると想像してください。スマートホームには通常、共通の基本機能を持ちながら独自の動作も持つさまざまな種類のデバイスがあります。以下のコードサンプルで、子クラス `SmartLight` が正常にコンパイルできるように、`SmartDevice` という `abstract` クラスを完成させてください。

次に、`SmartDevice` クラスを継承し、どのサーモスタット（thermostat）が加熱中か、またはオフになったかを説明する print 文を返す `turnOn()` および `turnOff()` 関数を実装する、`SmartThermostat` という別の子クラスを作成してください。最後に、温度の測定値を入力として受け取り、`$name thermostat set to $temperature°C.` と出力する `adjustTemperature()` という別の関数を追加してください。

<deflist collapsible="true">
    <def title="ヒント">
        <code>SmartDevice</code> クラスに <code>turnOn()</code> と <code>turnOff()</code> 関数を追加し、後で <code>SmartThermostat</code> クラスでそれらの動作をオーバーライドできるようにします。
    </def>
</deflist>

|--|--|

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
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-classes-interfaces-exercise-1"}

|---|---|
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

### 練習問題 2 {initial-collapse-state="collapsed" collapsible="true" id="classes-interfaces-exercise-2"}

`Audio`、`Video`、または `Podcast` などの特定のメディアクラスを実装するために使用できる、`Media` というインターフェースを作成してください。インターフェースには以下を含める必要があります：

* メディアのタイトルを表す `title` というプロパティ。
* メディアを再生するための `play()` という関数。

次に、`Media` インターフェースを実装する `Audio` というクラスを作成してください。`Audio` クラスは、コンストラクタで `title` プロパティを使用するとともに、`String` 型の `composer`（作曲家）という追加のプロパティを持つ必要があります。クラス内で、`play()` 関数を実装し、`"Playing audio: $title, composed by $composer"` と出力するようにしてください。

<deflist collapsible="true">
    <def title="ヒント">
        クラスヘッダーで <code>override</code> キーワードを使用して、コンストラクタでインターフェースのプロパティを実装できます。
    </def>
</deflist>

|---|---|
```kotlin
interface // ここにコードを書いてください

class // ここにコードを書いてください

fun main() {
    val audio = Audio("Symphony No. 5", "Beethoven")
    audio.play()
   // Playing audio: Symphony No. 5, composed by Beethoven
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-classes-interfaces-exercise-2"}

|---|---|
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

### 練習問題 3 {initial-collapse-state="collapsed" collapsible="true" id="classes-interfaces-exercise-3"}

Eコマースアプリケーション用の支払い処理システムを構築しています。各支払い方法（payment method）は、支払いを承認（authorize）し、取引（transaction）を処理できる必要があります。また、一部の支払いは返金（refund）を処理できる必要があります。

1. `Refundable` インターフェースに、返金を処理するための `refund()` という関数を追加してください。

2. `PaymentMethod` 抽象クラスにおいて：
   * 金額を受け取り、その金額を含むメッセージを出力する `authorize()` 関数を追加してください。
   * 同じく金額を受け取る `processPayment()` という抽象関数を追加してください。

3. `Refundable` インターフェースと `PaymentMethod` 抽象クラスを実装する `CreditCard` クラスを作成してください。このクラスで、`refund()` および `processPayment()` 関数の実装を追加し、以下のメッセージを出力するようにしてください：
   * `"Refunding $amount to the credit card."`
   * `"Processing credit card payment of $amount."`

|---|---|
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
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-classes-interfaces-exercise-3"}

|---|---|
```kotlin
interface Refundable {
    fun refund(amount: Double)
}

abstract class PaymentMethod(val name: String) {
    fun authorize(amount: Double) {
        println("Authorizing payment of $amount.")
    }

    abstract fun processPayment(amount: Double)
}

class CreditCard(name: String) : PaymentMethod(name), Refundable {
    override fun processPayment(amount: Double) {
        println("Processing credit card payment of $amount.")
    }

    override fun refund(amount: Double) {
        println("Refunding $amount to the credit card.")
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

### 練習問題 4 {initial-collapse-state="collapsed" collapsible="true" id="classes-interfaces-exercise-4"}

基本的な機能を持つシンプルなメッセージングアプリがありますが、コードを大幅に複製することなく、*スマート*メッセージ用の機能を追加したいと考えています。

以下のコードで、`Messenger` インターフェースを継承し、その実装を `BasicMessenger` クラスのインスタンスに委譲する `SmartMessenger` というクラスを定義してください。

`SmartMessenger` クラスで、`sendMessage()` 関数をオーバーライドしてスマートメッセージを送信するようにします。この関数は入力として `message` を受け取り、`"Sending a smart message: $message"` というプリント文を返す必要があります。さらに、`BasicMessenger` クラスの `sendMessage()` 関数を呼び出し、メッセージの前に `[smart]` を付けてください。

> `SmartMessenger` クラスで `receiveMessage()` 関数を書き直す必要はありません。
> 
{style="note"}

|--|--|

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
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-classes-interfaces-exercise-4"}

|---|---|
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

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-intermediate-lambdas-receiver.md" mode="outline" icon="arrow-left" icon-position="left">前のステップ</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-intermediate-objects.md" mode="classic" icon="arrow-right" icon-position="right">次のステップ</a>
  </li>
</list>