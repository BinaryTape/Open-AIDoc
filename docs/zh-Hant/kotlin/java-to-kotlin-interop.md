[//]: # (title: 在 Java 中呼叫 Kotlin)

Kotlin 程式碼可以輕易地在 Java 中呼叫。
例如，Kotlin 類別的執行個體可以在 Java 方法中流暢地建立與操作。
然而，在將 Kotlin 程式碼整合到 Java 時，Java 與 Kotlin 之間存在某些需要注意的差異。
在此頁面中，我們將說明調整 Kotlin 程式碼與其 Java 用戶端互通性的方式。

## 屬性

Kotlin 屬性會被編譯為以下 Java 元素：

 * 一個 getter 方法，名稱透過加上 `get` 前綴計算而得。
 * 一個 setter 方法，名稱透過加上 `set` 前綴計算而得（僅限 `var` 屬性）。
 * 一個 private 欄位，名稱與屬性名稱相同（僅限具有支援欄位的屬性）。

例如，`var firstName: String` 會編譯為以下 Java 宣告：

```java
private String firstName;

public String getFirstName() {
    return firstName;
}

public void setFirstName(String firstName) {
    this.firstName = firstName;
}
```

如果屬性名稱以 `is` 開頭，則會使用不同的名稱對應規則：getter 的名稱與屬性名稱相同，而 setter 的名稱則是將 `is` 替換為 `set`。
例如，對於屬性 `isOpen`，getter 稱為 `isOpen()`，而 setter 稱為 `setOpen()`。
此規則適用於任何型別的屬性，而不僅限於 `Boolean`。

## 套件層級函式

在套件 `org.example` 內的 `app.kt` 檔案中宣告的所有函式與屬性（包括擴充函式），都會被編譯為名為 `org.example.AppKt` 的 Java 類別之 static 方法。

```kotlin
// app.kt
package org.example

class Util

fun getTime() { /*...*/ }

```

```java
// Java
new org.example.Util();
org.example.AppKt.getTime();
```

若要為產生的 Java 類別設定自訂名稱，請使用 `@file:JvmName` 註解：

```kotlin
@file:JvmName("DemoUtils")

package org.example

class Util

fun getTime() { /*...*/ }

```

```java
// Java
new org.example.Util();
org.example.DemoUtils.getTime();
```

若有多個檔案產生相同的 Java 類別名稱（相同的套件與相同的名稱，或相同的 [`@JvmName`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.jvm/-jvm-name/index.html) 註解），通常會導致錯誤。
然而，編譯器可以產生一個單一的 Java Facade 類別，該類別具有指定的名稱，並包含所有具有該名稱檔案中的宣告。
若要啟用此類 Facade 的產生，請在所有此類檔案中使用 [`@JvmMultifileClass`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.jvm/-jvm-multifile-class/index.html) 註解。

```kotlin
// oldutils.kt
@file:JvmName("Utils")
@file:JvmMultifileClass

package org.example

fun getTime() { /*...*/ }
```

```kotlin
// newutils.kt
@file:JvmName("Utils")
@file:JvmMultifileClass

package org.example

fun getDate() { /*...*/ }
```

```java
// Java
org.example.Utils.getTime();
org.example.Utils.getDate();
```

## 執行個體欄位

如果您需要將 Kotlin 屬性作為 Java 中的欄位公開，請使用 [`@JvmField`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.jvm/-jvm-field/index.html) 註解。
該欄位具有與基礎屬性相同的可見性。如果屬性滿足以下條件，則可以使用 `@JvmField` 進行註解：
* 具有支援欄位
* 不是 private
* 沒有 `open`、`override` 或 `const` 修飾詞
* 不是委派屬性

```kotlin
class User(id: String) {
    @JvmField val ID = id
}
```

```java

// Java
class JavaClient {
    public String getID(User user) {
        return user.ID;
    }
}
```

[延遲載入](properties.md#late-initialized-properties-and-variables)屬性也會作為欄位公開。
該欄位的可見性與 `lateinit` 屬性 setter 的可見性相同。

## Static 欄位

在具名物件或 companion object 中宣告的 Kotlin 屬性，在該具名物件或包含 companion object 的類別中具有 static 支援欄位。

通常這些欄位是 private 的，但可以透過以下方式之一公開：

 - [`@JvmField`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.jvm/-jvm-field/index.html) 註解
 - `lateinit` 修飾詞
 - `const` 修飾詞
 
使用 `@JvmField` 註解此類屬性會使其成為一個 static 欄位，且其可見性與屬性本身相同。

```kotlin
class Key(val value: Int) {
    companion object {
        @JvmField
        val COMPARATOR: Comparator<Key> = compareBy<Key> { it.value }
    }
}
```

```java
// Java
Key.COMPARATOR.compare(key1, key2);
// Key 類別中的 public static final 欄位
```

物件或 companion object 中的[延遲載入](properties.md#late-initialized-properties-and-variables)屬性具有一個 static 支援欄位，其可見性與屬性 setter 相同。

```kotlin
object Singleton {
    lateinit var provider: Provider
}
```

```java

// Java
Singleton.provider = new Provider();
// Singleton 類別中的 public static non-final 欄位
```

宣告為 `const` 的屬性（無論是在類別中還是在頂層）都會轉換為 Java 中的 static 欄位：

```kotlin
// 檔案 example.kt

object Obj {
    const val CONST = 1
}

class C {
    companion object {
        const val VERSION = 9
    }
}

const val MAX = 239
```

在 Java 中：

```java

int constant = Obj.CONST;
int max = ExampleKt.MAX;
int version = C.VERSION;
```

## Static 方法

如前所述，Kotlin 將套件層級函式表示為 static 方法。
如果您將定義在具名物件或 companion object 中的函式註解為 [`@JvmStatic`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.jvm/-jvm-static/index.html)，Kotlin 也可以為其產生 static 方法。
如果您使用此註解，編譯器會在物件的封閉類別中產生一個 static 方法，並在物件本身產生一個執行個體方法。例如：

```kotlin
class C {
    companion object {
        @JvmStatic fun callStatic() {}
        fun callNonStatic() {}
    }
}
```

現在，`callStatic()` 在 Java 中是 static 的，而 `callNonStatic()` 則不是：

```java

C.callStatic(); // 正常運作
C.callNonStatic(); // 錯誤：不是 static 方法
C.Companion.callStatic(); // 執行個體方法仍然存在
C.Companion.callNonStatic(); // 唯一運作的方式
```

同樣地，對於具名物件：

```kotlin
object Obj {
    @JvmStatic fun callStatic() {}
    fun callNonStatic() {}
}
```

在 Java 中：

```java

Obj.callStatic(); // 正常運作
Obj.callNonStatic(); // 錯誤
Obj.INSTANCE.callNonStatic(); // 運作，透過單例執行個體呼叫
Obj.INSTANCE.callStatic(); // 也能運作
```

從 Kotlin 1.3 開始，`@JvmStatic` 也適用於介面的 companion object 中定義的函式。
此類函式會編譯為介面中的 static 方法。請注意，介面中的 static 方法是在 Java 1.8 中引入的，因此請務必使用對應的目標。

```kotlin
interface ChatBot {
    companion object {
        @JvmStatic fun greet(username: String) {
            println("Hello, $username")
        }
    }
}
```

您也可以將 `@JvmStatic` 註解應用於物件或 companion object 的屬性，使其 getter 與 setter 方法成為該物件或包含 companion object 類別中的 static 成員。

## 介面中的 Default 方法

當目標為 JVM 時，Kotlin 會將介面中宣告的函式編譯為 [default 方法](https://docs.oracle.com/javase/tutorial/java/IandI/defaultmethods.html)，除非[另有配置](#compatibility-modes-for-default-methods)。
這些是介面中具體的方法，Java 類別可以直接繼承而無需重新實作。

以下是一個具有 default 方法的 Kotlin 介面範例：

```kotlin
interface Robot {
    fun move() { println("~walking~") }  // 在 Java 介面中將成為 default 方法
    fun speak(): Unit
}
```

預設實作可用於實作該介面的 Java 類別。

```java
//Java 實作
public class C3PO implements Robot {
    // 來自 Robot 的 move() 實作會隱式可用
    @Override
    public void speak() {
        System.out.println("I beg your pardon, sir");
    }
}
```

```java
C3PO c3po = new C3PO();
c3po.move(); // 來自 Robot 介面的預設實作
c3po.speak();
```

介面的實作可以覆寫 default 方法。

```java
//Java
public class BB8 implements Robot {
    //default 方法的自有實作
    @Override
    public void move() {
        System.out.println("~rolling~");
    }

    @Override
    public void speak() {
        System.out.println("Beep-beep");
    }
}
```

### Default 方法的相容性模式

Kotlin 提供三種模式來控制介面中的函式如何編譯為 JVM default 方法。
這些模式決定編譯器是否產生相容性橋接以及 `DefaultImpls` 類別中的 static 方法。

您可以使用 `-jvm-default` 編譯器選項來控制此行為：

> `-jvm-default` 編譯器選項取代了已棄用的 `-Xjvm-default` 選項。
>
{style="note"}

進一步了解相容性模式：

#### enable {initial-collapse-state="collapsed" collapsible="true"}

預設行為。
在介面中產生預設實作，並包含相容性橋接與 `DefaultImpls` 類別。
此模式保持與舊版已編譯 Kotlin 程式碼的相容性。

#### no-compatibility {initial-collapse-state="collapsed" collapsible="true"}

僅在介面中產生預設實作。
跳過相容性橋接與 `DefaultImpls` 類別。
對於不與依賴 `DefaultImpls` 類別程式碼互動的新程式碼庫，請使用此模式。
這可能會破壞與舊版 Kotlin 程式碼的二進制相容性。

> 如果使用介面委派，則會委派所有介面方法。
>
{style="note"}

#### disable {initial-collapse-state="collapsed" collapsible="true"}

停用介面中的預設實作。
僅產生相容性橋接與 `DefaultImpls` 類別。

## 可見性

Kotlin 可見性修飾詞按以下方式對應至 Java：

* `private` 成員會編譯為 `private` 成員。
* `private` 頂層宣告會編譯為 Java 中的 `private` 頂層宣告。如果從類別內部存取，也會包含 Package-private 的存取器。
* `protected` 成員保持為 `protected`。

  請注意，Java 允許從同一套件中的其他類別存取 protected 成員，而 Kotlin 則不允許。
* `internal` 宣告在 Java 中變為 `public`。

  Kotlin 編譯器會對位元組碼中的 `internal` 成員進行名稱修飾 (name mangling)。這可以防止跨模組的意外覆寫（例如從 Java 擴充 Kotlin 類別時），並允許為具有相同簽章的成員進行多載。

  請注意，`internal` 類別的 public 成員名稱不會被修飾，因此仍可從 Java 呼叫。
* `public` 成員保持為 `public`。

## KClass

有時您需要使用 `KClass` 型別的參數來呼叫 Kotlin 方法。
目前沒有從 `Class` 到 `KClass` 的自動轉換，因此您必須透過呼叫與 `Class<T>.kotlin` 擴充屬性等效的方法來手動執行：

```kotlin
kotlin.jvm.JvmClassMappingKt.getKotlinClass(MainView.class)
```

## 使用 @JvmName 處理簽章衝突

有時我們在 Kotlin 中有一個具名函式，但在位元組碼中需要一個不同的 JVM 名稱。
最顯著的例子是由於 *型別抹除 (type erasure)* 造成的：

```kotlin
fun List<String>.filterValid(): List<String>
fun List<Int>.filterValid(): List<Int>
```

這兩個函式不能並列定義，因為它們的 JVM 簽章是相同的：`filterValid(Ljava/util/List;)Ljava/util/List;`。
如果我們真的希望它們在 Kotlin 中具有相同的名稱，我們可以用 [`@JvmName`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.jvm/-jvm-name/index.html) 註解其中一個（或兩個），並指定一個不同的名稱作為引數：

```kotlin
fun List<String>.filterValid(): List<String>

@JvmName("filterValidInt")
fun List<Int>.filterValid(): List<Int>
```

在 Kotlin 中，它們可以透過相同的名稱 `filterValid` 存取，但在 Java 中則是 `filterValid` 與 `filterValidInt`。

當我們需要一個屬性 `x` 同時擁有一個函式 `getX()` 時，同樣的技巧也適用：

```kotlin
val x: Int
    @JvmName("getX_prop")
    get() = 15

fun getX() = 10
```

若要變更未明確實作 getter 與 setter 的屬性所產生的存取器方法名稱，您可以使用 `@get:JvmName` 與 `@set:JvmName`：

```kotlin
@get:JvmName("x")
@set:JvmName("changeX")
var x: Int = 23
```

## 多載產生

通常，如果您編寫一個具有參數預設值的 Kotlin 函式，它在 Java 中僅以完整簽章的形式可見（包含所有參數）。

您可以使用 [`@IntroducedAt`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-introduced-at/) 註解或 [`@JvmOverloads`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.jvm/-jvm-overloads/index.html) 註解來為選擇性參數產生多載。

當您將新的選擇性參數新增至已發佈的 API，並希望產生的多載能反映每個參數引入的版本時，請使用 `@IntroducedAt`。
編譯器會利用此資訊自動產生對應的隱藏多載。

這為您提供了基於版本的多載產生，並有助於為針對舊版程式庫編譯的呼叫者保持二進制相容性。

> `@IntroducedAt` 註解是[實驗功能](components-stability.md#stability-levels-explained)。若要加入，請使用
> `@OptIn(ExperimentalVersionOverloading::class)` 註解。
> 
{style="warning"}

以下是一個 `Button()` 函式在多個 API 版本中接收多個選擇性參數的範例：

```kotlin
@OptIn(ExperimentalVersionOverloading::class)
fun Button(
    label: String = "",
    color: Color = DefaultColor,
    @IntroducedAt("1.1") borderColor: Color = DefaultBorderColor,
    @IntroducedAt("1.2") borderStyle: Style = DefaultBorderStyle,
    @IntroducedAt("1.2") borderWidth: Int = 1,
    onClick: () -> Unit
) {
    // 函式體
}
```

根據這些版本，編譯器會為原始 API 以及每個引入新選擇性參數的 API 版本產生隱藏多載：

```kotlin
// 原始 API
Button(
    label: String,
    color: Color,
    onClick: () -> Unit
)

// 版本 1.1
Button(
    label: String,
    color: Color,
    borderColor: Color,
    onClick: () -> Unit
)

// 版本 1.2
Button(
    label: String,
    color: Color,
    borderColor: Color,
    borderStyle: Style,
    borderWidth: Int,
    onClick: () -> Unit
)
```

如果您想向 Java 呼叫者公開多個多載，也可以使用 [`@JvmOverloads`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.jvm/-jvm-overloads/index.html) 註解。

該註解也適用於建構函式、static 方法等。它不能用於抽象方法，包括介面中定義的方法。例如，考慮一個具有參數預設值的 `Circle` 類別：

```kotlin
class Circle @JvmOverloads constructor(centerX: Int, centerY: Int, radius: Double = 1.0) {
    @JvmOverloads fun draw(label: String, lineWidth: Int = 1, color: String = "red") { /*...*/ }
}
```

對於每個具有預設值的參數，這都會產生一個額外的多載，該多載會移除此參數以及參數清單中位於其右側的所有參數。在此範例中，會產生以下內容：

```java
// 建構函式：
Circle(int centerX, int centerY, double radius)
Circle(int centerX, int centerY)

// 方法
void draw(String label, int lineWidth, String color) { }
void draw(String label, int lineWidth) { }
void draw(String label) { }
```

由於 `@IntroducedAt` 與 `@JvmOverloads` 註解都會產生多載，同時使用它們可能會建立衝突的多載。
如果您同時使用這兩個註解，編譯器會報告警告。如果您隱藏警告，編譯器會優先使用從 `@IntroducedAt` 註解產生的多載。

請注意，如[次要建構函式](classes.md#secondary-constructors)中所述，如果一個類別的所有建構函式參數都有預設值，則會為其產生一個無引數的 public 建構函式。即使未指定 `@JvmOverloads` 註解，這也會生效。

## 受檢例外

Kotlin 沒有受檢例外。
因此，通常 Kotlin 函式的 Java 簽章不會宣告拋出的例外。
因此，如果您在 Kotlin 中有一個如下所示的函式：

```kotlin
// example.kt
package demo

fun writeToFile() {
    /*...*/
    throw IOException()
}
```

而您想從 Java 呼叫它並捕獲例外：

```java

// Java
try {
    demo.Example.writeToFile();
} catch (IOException e) { 
    // 錯誤：writeToFile() 未在 throws 清單中宣告 IOException
    // ...
}
```

您會收到來自 Java 編譯器的錯誤訊息，因為 `writeToFile()` 未宣告 `IOException`。
若要解決此問題，請在 Kotlin 中使用 [`@Throws`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-throws/index.html) 註解：

```kotlin
@Throws(IOException::class)
fun writeToFile() {
    /*...*/
    throw IOException()
}
```

## Null 安全

從 Java 呼叫 Kotlin 函式時，沒有人阻止我們將 `null` 作為不可為 null 的參數傳遞。
這就是為什麼 Kotlin 為所有預期非 null 值的 public 函式產生執行階段檢查的原因。
這樣我們就能立即在 Java 程式碼中收到 `NullPointerException`。

## 型別差異泛型

當 Kotlin 類別使用[宣告點差異 (declaration-site variance)](generics.md#declaration-site-variance) 時，它們在 Java 程式碼中的用法有兩種選項。例如，假設您有以下類別以及兩個使用它的函式：

```kotlin
class Box<out T>(val value: T)

interface Base
class Derived : Base

fun boxDerived(value: Derived): Box<Derived> = Box(value)
fun unboxBase(box: Box<Base>): Base = box.value
```

將這些函式翻譯成 Java 的直觀方式如下：

```java
Box<Derived> boxDerived(Derived value) { ... }
Base unboxBase(Box<Base> box) { ... }
```

問題在於，在 Kotlin 中您可以寫 `unboxBase(boxDerived(Derived()))`，但在 Java 中這是不可能的，因為在 Java 中 `Box` 類別在其參數 `T` 上是 *不變 (invariant)* 的，因此 `Box<Derived>` 不是 `Box<Base>` 的子型別。 
為了讓這在 Java 中可行，您必須如下定義 `unboxBase`：

```java
Base unboxBase(Box<? extends Base> box) { ... }  
```

此宣告使用 Java 的 *萬用字元型別 (wildcards types)* (`? extends Base`)，透過使用點差異來模擬宣告點差異，因為這是 Java 僅有的方式。

為了讓 Kotlin API 在 Java 中運作，當共變定義的 `Box`（或反變定義的 `Foo<? super Bar>`）作為 *參數* 出現時，編譯器會將 `Box<Super>` 產生為 `Box<? extends Super>`。當它是傳回值時，不會產生萬用字元，否則 Java 用戶端將不得不處理它們（這違反了常見的 Java 編碼風格）。因此，我們範例中的函式實際上翻譯如下：

```java

// 傳回型別 - 無萬用字元
Box<Derived> boxDerived(Derived value) { ... }
 
// 參數 - 萬用字元 
Base unboxBase(Box<? extends Base> box) { ... }
```

> 當引數型別為 final 時，產生萬用字元通常沒有意義，因此 `Box<String>` 始終是 `Box<String>`，無論它處於什麼位置。
>
{style="note"}

如果您在預設未產生萬用字元的地方需要萬用字元，請使用 `@JvmWildcard` 註解：

```kotlin
fun boxDerived(value: Derived): Box<@JvmWildcard Derived> = Box(value)
// 被翻譯為 
// Box<? extends Derived> boxDerived(Derived value) { ... }
```

相反地，如果您在產生萬用字元的地方不需要萬用字元，請使用 `@JvmSuppressWildcards`：

```kotlin
fun unboxBase(box: Box<@JvmSuppressWildcards Base>): Base = box.value
// 被翻譯為 
// Base unboxBase(Box<Base> box) { ... }
```

>`@JvmSuppressWildcards` 不僅可以用於個別型別引數，還可以用於整個宣告（如函式或類別），從而隱藏其中的所有萬用字元。
>
{style="note"}

### Nothing 型別的翻譯
 
[`Nothing`](exceptions.md#the-nothing-type) 型別非常特殊，因為它在 Java 中沒有對應的內容。事實上，每個 Java 參考型別（包括 `java.lang.Void`）都接受 `null` 作為值，而 `Nothing` 甚至連 `null` 都不接受。因此，此型別無法在 Java 世界中準確表示。這就是為什麼 Kotlin 在使用 `Nothing` 型別引數的地方產生原始型別 (raw type) 的原因：

```kotlin
fun emptyList(): List<Nothing> = listOf()
// 被翻譯為
// List emptyList() { ... }
```

## Inline Value 類別

<primary-label ref="experimental-general"/>

如果您希望 Java 程式碼能與 Kotlin 的 [Inline Value 類別](inline-classes.md)順暢搭配使用，可以使用 [`@JvmExposeBoxed`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.jvm/-jvm-expose-boxed/) 註解或 `-Xjvm-expose-boxed` 編譯器選項。這些方法確保 Kotlin 為 Java 互通性產生必要的裝箱 (boxed) 表示。

預設情況下，Kotlin 將 Inline Value 類別編譯為使用 **未裝箱表示**，這在 Java 中通常無法存取。
例如，您無法從 Java 呼叫 `MyInt` 類別的建構函式：

```kotlin
@JvmInline
value class MyInt(val value: Int)
```

因此，以下 Java 程式碼會失敗：

```java
MyInt input = new MyInt(5);
```

您可以使用 `@JvmExposeBoxed` 註解，以便 Kotlin 產生您可以直接從 Java 呼叫的 public 建構函式。
您可以在以下層級套用註解，以確保對公開給 Java 的內容進行精細控制：

* 類別
* 建構函式
* 函式

在程式碼中使用 `@JvmExposeBoxed` 註解之前，您必須透過使用 `@OptIn(ExperimentalStdlibApi::class)` 進行加入。
例如：

```kotlin
@OptIn(ExperimentalStdlibApi::class)
@JvmExposeBoxed
@JvmInline
value class MyInt(val value: Int)

@OptIn(ExperimentalStdlibApi::class)
@JvmExposeBoxed
fun MyInt.timesTwoBoxed(): MyInt = MyInt(this.value * 2)
```

透過這些註解，Kotlin 為 `MyInt` 類別產生一個可供 Java 存取的建構函式 **以及** 一個為使用 Value 類別裝箱形式的擴充函式變體。因此，以下 Java 程式碼可以成功執行：

```java
MyInt input = new MyInt(5);
MyInt output = ExampleKt.timesTwoBoxed(input);
```

若要將此行為套用於模組內的所有 Inline Value 類別及其使用的函式，請使用 `-Xjvm-expose-boxed` 選項進行編譯。 
使用此選項進行編譯的效果等同於模組中的每個宣告都具有 `@JvmExposeBoxed` 註解。

### 繼承的函式

`@JvmExposeBoxed` 註解不會自動為繼承的函式產生裝箱表示。
 
若要為繼承的函式產生必要的表示，請在實作或擴充類別中覆寫它：
 
```kotlin
interface IdTransformer {
    fun transformId(rawId: UInt): UInt = rawId
}

// 不會為 transformId() 函式產生裝箱表示
@OptIn(ExperimentalStdlibApi::class)
@JvmExposeBoxed
class LightweightTransformer : IdTransformer

// 為 transformId() 函式產生裝箱表示
@OptIn(ExperimentalStdlibApi::class)
@JvmExposeBoxed
class DefaultTransformer : IdTransformer {
    override fun transformId(rawId: UInt): UInt = super.transformId(rawId)
}
```

若要了解 Kotlin 中的繼承如何運作，以及如何使用 `super` 關鍵字呼叫父類別實作，請參閱[繼承](inheritance.md#calling-the-superclass-implementation)。