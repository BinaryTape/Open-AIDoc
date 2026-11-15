[//]: # (title: 從 Kotlin 呼叫 Java)
[//]: # (description: 了解如何從 Kotlin 呼叫 Java 程式碼，包括 getter 和 setter、null 安全性與平台型別、可 null 性註解、對應型別以及 SAM 轉換。)

Kotlin 在設計時就充分考量了與 Java 的互通性。現有的 Java 程式碼可以自然地從 Kotlin 中呼叫，
而 Kotlin 程式碼也可以同樣方便地在 Java 中使用。

你無需額外設定即可使用大部分的 Java 程式碼：

```kotlin
import java.util.*

fun demo(source: List<Int>) {
    val list = ArrayList<Int>()
    // Java 集合支援 'for' 迴圈：
    for (item in source) {
        list.add(item)
    }
    // 運算子慣例也同樣適用：
    for (i in 0..<source.size) {
        list[i] = source[i] // 呼叫了 get 與 set
    }
}
```

## Getter 和 setter {id="getters-and-setters"}

遵循 Java getter 與 setter 慣例的方法（名稱以 `get` 開頭的無引數方法，以及名稱以 `set` 開頭的單一引數方法）在 Kotlin 中表示為屬性。此類屬性也被稱為「合成屬性 (synthetic properties)」。
`Boolean` 存取子方法（getter 名稱以 `is` 開頭，且 setter 名稱以 `set` 開頭）
則表示為與 getter 方法同名的屬性。

```kotlin
import java.util.Calendar

fun calendarDemo() {
    val calendar = Calendar.getInstance()
    if (calendar.firstDayOfWeek == Calendar.SUNDAY) { // 呼叫 getFirstDayOfWeek()
        calendar.firstDayOfWeek = Calendar.MONDAY     // 呼叫 setFirstDayOfWeek()
    }
    if (!calendar.isLenient) {    // 呼叫 isLenient()
        calendar.isLenient = true // 呼叫 setLenient()
    }
}
```

上述的 `calendar.firstDayOfWeek` 就是合成屬性的一個範例。

請注意，如果 Java 類別只有 setter，它在 Kotlin 中不會作為屬性可見，因為 Kotlin 不支援唯寫 (set-only) 屬性。

只有無引數的 getter 會被表示為合成屬性。如果 getter 具有接受引數的多載，該多載將不會公開為屬性，在多數情況下你需要使用其完整方法名稱來呼叫。請參考以下 Java 類別：

```java
// Java
public class Greeting {
    public String getMessage() {
        return "Hello!";
    }

    public String getMessage(String name) {
        return "Hello, " + name + "!";
    }
}
```

無引數的 `getMessage()` 方法可透過合成屬性 `message` 使用。若要使用多載的 `getMessage(String)` 方法，請將其作為函式呼叫：

```kotlin
// Kotlin
fun main() {
    val greeting = Greeting()
    println(greeting.message)              // 透過合成屬性存取 getMessage()
    println(greeting.getMessage("Kotlin")) // 呼叫多載的 getMessage(String) 方法
}
```

呼叫 `greeting.message("Kotlin")` 無法通過編譯並會傳回無法解析的參照錯誤 (接收者型別不符)，因為 `message` 屬性不接受引數。

然而，在某些情況下，當帶有參數的 Java 方法覆寫了 Kotlin 的[成員擴充屬性](extensions.md#declaring-extensions-as-members)的 getter 時，Kotlin 會將該方法視為屬性。因此你只能在接收者的作用域內將其作為屬性呼叫，而不能透過其方法名稱呼叫：

```java
// Java
public class Greeter implements Message {
    public String getText(String name) {
        return "Hello, " + name + "!";
    }
}
```

```kotlin
// Kotlin
interface Message {
    val String.text: String
}

fun demo(greeter: Greeter) {
    greeter.getText("Kotlin")       // 錯誤：無法解析的參照
    with(greeter) { "Kotlin".text } // 透過成員擴充屬性存取 getText(String)
}
```

## 回傳 `void` 的方法 {id="methods-returning-void"}

如果 Java 方法回傳 `void`，從 Kotlin 呼叫時其傳回型別會變成 `Unit`。如果你使用該傳回值，
Kotlin 編譯器會在呼叫點指派 `Unit`，因為該值已預先得知。

## 轉義作為 Kotlin 關鍵字的 Java 識別符號 {id="escaping-for-java-identifiers-that-are-keywords-in-kotlin"}

部分 Kotlin 關鍵字在 Java 中是合法的識別符號：如 `in`、`object`、`is` 等。如果 Java 程式庫在方法中使用了 Kotlin 關鍵字，你仍然可以透過反引號 (`) 字元將其轉義來呼叫該方法：

```kotlin
matcher.`is`(expected)
```

## Null 安全性與平台型別 {id="null-safety-and-platform-types"}

Java 中的任何參照都可能為 `null`，這使得 Kotlin 嚴格的 null 安全性要求對於來自 Java 的物件顯得不太切合實際。
Java 宣告的型別在 Kotlin 中會被視為無法明確表示的型別，稱為 [平台型別 (platform types)](https://kotlinlang.org/spec/type-system.html#platform-types)。
你無法在程式碼中明確寫出這些無法指稱的型別。因此，當平台值被指派給 Kotlin 變數時，你可以：

* 依賴型別推論。在這種情況下，變數將具有推論出的平台型別。
* 選擇你期望的型別。Kotlin 同時允許可 null 與不可 null 的型別。

平台型別放寬了 null 檢查，因此它們具備與[對應的 Java 型別](#mapped-types)相同的安全性保證。請參考以下範例：

```kotlin
val list = ArrayList<String>() // 非 null（建構函式結果）
list.add("Item")
val size = list.size // 非 null（原始型別 int）
val item = list[0] // 推論為平台型別（一般 Java 物件）
```

當你在平台型別的變數上呼叫方法時，Kotlin 不會在編譯期發出可 null 性錯誤，
但呼叫可能在執行期失敗，原因可能是 Null-pointer exception，或者是 Kotlin 為防止 null 向外傳播而產生的斷言：

```kotlin
item.substring(1) // 允許，但若 item == null 則拋出例外
```

你可以將平台型別的值指派給可 null 或不可 null 的 Kotlin 型別變數。但是，
如果你將該值指派給不可 null 型別的變數，且該值在執行期實際上為 `null`，Kotlin 就會拋出 `NullPointerException`。為了避免這種情況，請在 Kotlin 程式碼中加入明確的可 null 性宣告：

```kotlin
val nullable: String? = item // 允許，始終有效
val notNull: String = item // 允許，可能在執行期失敗
```

如果你選擇了非 null 型別，編譯器將在指派時發出斷言。這能防止 Kotlin 的非 null 變數持有 null。當你將平台值傳遞給需要非 null 值的 Kotlin 函式以及在其他情況下，也會發出斷言。
總體而言，編譯器會盡最大努力防止 null 在程式中廣泛傳播，儘管由於泛型的存在，有時無法完全消除這種情況。

### 平台型別的表示法 {id="notation-for-platform-types"}

如前一節所述，平台型別無法在程式中明確提及，因此語言中沒有專門針對它們的語法。儘管如此，編譯器和 IDE 有時仍需要顯示它們（例如在錯誤訊息或參數提示中），因此為它們提供了一種助記表示法：

* `T!` 表示「`T` 或 `T?`」
* `(Mutable)Collection<T>!` 表示「`T` 的 Java 集合可能是可變的也可能不是，可能是可 null 的也可能不是」
* `Array<(out) T>!` 表示「`T`（或 `T` 的子型別）的 Java 陣列，可能是可 null 的也可能不是」

當你在錯誤訊息或 IDE 工具提示中看到此標記法時，請在 Kotlin 變數中新增明確的型別註解以恢復 null 安全性檢查，或使用可 null 性註解從來源端消除平台型別。

### 可 null 性註解 {id="nullability-annotations"}

帶有可 null 性註解的 Java 型別不會表示為平台型別，而是表示為實際的可 null 或不可 null 的 Kotlin 型別。編譯器支援多種風格的可 null 性註解，包括：

* [JetBrains](https://www.jetbrains.com/idea/help/nullable-and-notnull-annotations.html)
  （來自 `org.jetbrains.annotations` 套件的 `@Nullable` 與 `@NotNull`）
* [JSpecify](#jspecify-support) (`org.jspecify.annotations`)
* Android (`com.android.annotations`、`android.support.annotation`、`androidx.annotation`、`android.annotation`)
* [JSR-305](#jsr-305-support) (`javax.annotation`)
* FindBugs (`edu.umd.cs.findbugs.annotations`)
* Eclipse (`org.eclipse.jdt.annotation`)
* [Lombok](lombok.md) (`lombok.NonNull`)
* RxJava 3 (`io.reactivex.rxjava3.annotations`)
* [Vert.x](https://vertx.io/) (`io.vertx.codegen.annotations`)

你可以使用以下編譯器選項，指示編譯器針對特定的可 null 性註解回報可 null 性不符合的問題：

```bash
-Xnullability-annotations=@<package-name>:<report-level>
``` 

指定完整套件名稱的可 null 性註解，以及下列其中一個回報層級：

* `ignore`：忽略可 null 性不符合
* `warn`：回報警告
* `strict`：回報錯誤。

> [JSpecify](#jspecify-support) 是唯一預設使用 `strict` 回報層級的受支援風格。
> 無需額外設定即可使用它針對可 null 性註解回報錯誤。
>
{style="note"}

如需受支援的可 null 性註解完整清單，請參閱
[Kotlin 編譯器原始碼](https://github.com/JetBrains/kotlin/blob/master/core/compiler.common.jvm/src/org/jetbrains/kotlin/load/java/JvmAnnotationNames.kt)。

### 可變性註解 {id="mutability-annotations"}

你可以使用可變性註解來標記 Java 宣告，以指定回傳的集合在 Kotlin 中是唯讀的還是可變的。
如果你將該值指派給具有不同可變性的集合型別，編譯器會回報型別不相符。
診斷嚴重程度取決於具體的可變性註解。

編譯器支援多種可變性註解，包括：

* `kotlin.annotations.jvm.ReadOnly`
* `kotlin.annotations.jvm.Mutable`
* `org.jetbrains.annotations.Unmodifiable`
* `org.jetbrains.annotations.UnmodifiableView`

請參閱 [Kotlin 編譯器原始碼](https://github.com/JetBrains/kotlin/blob/master/core/compiler.common.jvm/src/org/jetbrains/kotlin/load/java/JvmAnnotationNames.kt) 以查看受支援可變性註解的完整清單。

### 註解型別引數與型別參數 {id="annotating-type-arguments-and-type-parameters"}

你也可以為泛型型別的型別引數和型別參數加上註解，為它們提供可 null 性資訊。

> 本節中的所有範例皆使用來自 `org.jetbrains.annotations` 套件的 JetBrains 可 null 性註解。
>
{style="note"}

#### 型別引數 {id="type-arguments"}

請參考 Java 宣告上的這些註解：

```java
@NotNull
Set<@NotNull String> toSet(@NotNull Collection<@NotNull String> elements) { ... }
```

它們在 Kotlin 中會產生以下簽章：

```kotlin
fun toSet(elements: (Mutable)Collection<String>) : (Mutable)Set<String> { ... }
```

當型別引數缺少 `@NotNull` 註解時，你將會得到平台型別：

```kotlin
fun toSet(elements: (Mutable)Collection<String!>) : (Mutable)Set<String!> { ... }
```

Kotlin 還會考量基底類別與介面之型別引數上的可 null 性註解。例如，有兩個 Java 類別具有以下簽章：

```java
public class Base<T> {}
```

```java
public class Derived extends Base<@Nullable String> {}
```

在 Kotlin 程式碼中，若在需要 `Base<String>` 的地方傳遞 `Derived` 執行個體，將會產生警告：

```kotlin
fun takeBaseOfNotNullStrings(x: Base<String>) {}

fun main() {
    takeBaseOfNotNullStrings(Derived()) // 警告：可 null 性不相符
}
```

`Derived` 的上界設定為 `Base<String?>`，這與 `Base<String>` 不同。

進一步了解 [Kotlin 中的 Java 泛型](#java-generics-in-kotlin)。

#### 型別參數 {id="type-parameters"}

預設情況下，Kotlin 和 Java 中普通型別參數的可 null 性都是未定義的。在 Java 中，你可以使用可 null 性註解來指定它。讓我們為 `Base` 類別的型別參數加上註解：

```java
public class Base<@NotNull T> {}
```

當從 `Base` 繼承時，Kotlin 會預期一個非 null 的型別引數或型別參數。
因此，以下 Kotlin 程式碼會產生警告：

```kotlin
class Derived<K> : Base<K> {} // 警告：K 具有未定義的可 null 性
```

你可以透過指定上界 `K : Any` 來解決此問題。

Kotlin 也支援在 Java 型別參數的界限上使用可 null 性註解。讓我們為 `Base` 新增界限：

```java
public class BaseWithBound<T extends @NotNull Number> {}
```

Kotlin 會將其轉譯如下：

```kotlin
class BaseWithBound<T : Number> {}
```

因此，傳遞可 null 型別作為型別引數或型別參數將會產生警告。

為型別引數與型別參數加上註解適用於 Java 8 或更高版本的目標。此功能要求可 null 性註解支援 `TYPE_USE` 目標（`org.jetbrains.annotations` 在版本 15 及以上支援此目標）。

> 如果可 null 性註解除了 `TYPE_USE` 目標之外，還支援適用於型別的其他目標，則以 `TYPE_USE` 為優先。例如，如果 `@Nullable` 同時具有 `TYPE_USE` 和 `METHOD` 目標，則 Java 方法簽章 `@Nullable String[] f()` 在 Kotlin 中會變成 `fun f(): Array<String?>!`。
>
{style="note"}

### JSpecify 支援 {id="jspecify-support"}

Kotlin 支援 [JSpecify](https://jspecify.dev/) 可 null 性註解，它為 Java 可 null 性提供了一組統一的註解。JSpecify 允許你為 Java 宣告提供詳細的可 null 性資訊，幫助 Kotlin 在處理 Java 程式碼時維持 null 安全性。

Kotlin 支援 `org.jspecify.annotations` 套件中的以下註解：

* `@Nullable` 將型別標記為可 null。
* `@NonNull` 將型別標記為不可 null。
* `@NullMarked` 將特定作用域內（例如類別或套件）的所有型別預設標記為非 null，除非另有註解。

  此註解不適用於區域變數和[型別變數（泛型）](https://jspecify.dev/docs/user-guide/#using-type-variables-in-generic-types)。
  型別變數會維持「與 null 無關 (null-agnostic)」的狀態，直到提供具體的可 null 或非 null 型別為止。

* `@NullUnmarked` 可反轉 `@NullMarked` 的效果，將作用域內的所有型別視為[平台型別](#null-safety-and-platform-types)。

請考慮以下帶有 JSpecify 註解的 Java 類別：
 
```java
// Java
import org.jspecify.annotations.*;

@NullMarked
public class InventoryService {
    public String notNull() { return ""; }
    public @Nullable String nullable() { return null; }
}
```
 
在 Kotlin 中，這些型別會被視為一般的可 null 和不可 null 型別，而非[平台型別](#null-safety-and-platform-types)：
 
```kotlin
// Kotlin
fun test(inventory: InventoryService) {
    inventory.notNull().length  // 正確
    inventory.nullable().length // 錯誤：只允許安全呼叫 (?.) 或非 null 斷言呼叫 (!!)
}
```

預設情況下，Kotlin 編譯器會將 JSpecify 註解的可 null 性不相符回報為錯誤。
你可以使用以下編譯器選項來自訂 JSpecify 可 null 性診斷的嚴重層級：

```bash
-Xjspecify-annotations=<report-level>
```

可用的回報層級為：

| 層級     | 說明                                       |
|----------|--------------------------------------------|
| `strict` | 針對可 null 性不相符回報錯誤（預設）。     |
| `warn`   | 回報警告。                                 |
| `ignore` | 忽略可 null 性不相符。                     |

> 有關 JSpecify 註解的更多資訊，請參閱 [JSpecify 使用者指南](https://jspecify.dev/docs/user-guide)。
> 
{type="tip"}

### JSR-305 支援 {id="jsr-305-support"}

在 [JSR-305](https://jcp.org/en/jsr/detail?id=305) 中定義的 [`@Nonnull`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/Nonnull.html) 註解可用於表示 Java 型別的可 null 性。

如果 `@Nonnull(when = ...)` 的值為 `When.ALWAYS`，則被註解的型別會被視為非 null；`When.MAYBE` 與 `When.NEVER` 表示可 null 型別；而 `When.UNKNOWN` 則強制該型別為[平台型別](#null-safety-and-platform-types)。

程式庫可以針對 JSR-305 註解進行編譯，但不需要將帶有註解的產物（例如 `jsr305.jar`）作為程式庫使用者的編譯相依項。Kotlin 編譯器可以從程式庫中讀取 JSR-305 註解，即使類別路徑中沒有該註解。

同時也支援[自訂可 null 性限定詞 (KEEP-79)](https://github.com/Kotlin/KEEP/blob/master/proposals/jsr-305-custom-nullability-qualifiers.md)（見下文）。

#### 型別限定詞別名 {id="type-qualifier-nicknames"}

如果某個註解型別同時標記了
[`@TypeQualifierNickname`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/meta/TypeQualifierNickname.html)
和 JSR-305 `@Nonnull`（或其其他別名，如 `@CheckForNull`），則該註解型別本身將用於擷取精確的可 null 性，並且與該可 null 性註解具有相同的含義：

```java
@TypeQualifierNickname
@Nonnull(when = When.ALWAYS)
@Retention(RetentionPolicy.RUNTIME)
public @interface MyNonnull {
}

@TypeQualifierNickname
@CheckForNull // 另一個型別限定詞別名的別名
@Retention(RetentionPolicy.RUNTIME)
public @interface MyNullable {
}

interface A {
    @MyNullable String foo(@MyNonnull String x);
    // 在 Kotlin 中（strict 模式）：`fun foo(x: String): String?`

    String bar(List<@MyNonnull String> x);
    // 在 Kotlin 中（strict 模式）：`fun bar(x: List<String>!): String!`
}
```

#### 型別限定詞預設值 {id="type-qualifier-defaults"}

[`@TypeQualifierDefault`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/meta/TypeQualifierDefault.html)
允許引入在套用時定義受註解元素作用域內預設可 null 性的註解。

該註解型別本身應同時帶有 `@Nonnull`（或其別名）以及帶有一個或多個 `ElementType` 值的 `@TypeQualifierDefault(...)`：

* `ElementType.METHOD` 用於方法的回傳型別
* `ElementType.PARAMETER` 用於值參數
* `ElementType.FIELD` 用於欄位
* `ElementType.TYPE_USE` 用於任何型別，包括型別引數、型別參數的上界和萬用字元型別

當型別本身未加上可 null 性註解時，將使用預設可 null 性，該預設值由最內層且包含該型別、同時帶有與該型別用法相符之 `ElementType` 的型別限定詞預設註解元素所決定。

```java
@Nonnull
@TypeQualifierDefault({ElementType.METHOD, ElementType.PARAMETER})
public @interface NonNullApi {
}

@Nonnull(when = When.MAYBE)
@TypeQualifierDefault({ElementType.METHOD, ElementType.PARAMETER, ElementType.TYPE_USE})
public @interface NullableApi {
}

@NullableApi
interface A {
    String foo(String x); // 在 Kotlin 中：fun foo(x: String?): String?

    @NonNullApi // 覆寫來自介面的預設值
    String bar(String x, @Nullable String y); // 在 Kotlin 中：fun bar(x: String, y: String?): String

    // 由於 `@NullableApi` 具有 `TYPE_USE` 元素型別，
    // 因此 List<String> 型別引數被視為可 null：
    String baz(List<String> x); // 在 Kotlin 中：fun baz(List<String?>?): String?

    // 由於具有明確標記為 UNKNOWN 的可 null 性註解，
    // 因此 `x` 參數的型別仍為平台型別：
    String qux(@Nonnull(when = When.UNKNOWN) String x); // 在 Kotlin 中：fun qux(x: String!): String?
}
```

> 此範例中的型別僅在啟用 strict 模式時才會生效；否則仍保留平台型別。
> 請參閱 [`@UnderMigration` 註解](#undermigration-annotation) 與 [編譯器設定](#compiler-configuration) 小節。
>
{style="note"}

同時也支援套件層級的預設可 null 性：

```java
// 檔案：test/package-info.java
@NonNullApi // 預設將套件 'test' 中的所有型別宣告為非 null
package test;
```

#### @UnderMigration 註解 {id="undermigration-annotation"}

程式庫維護人員可以使用 `@UnderMigration` 註解（在獨立的構件 `kotlin-annotations-jvm` 中提供）來定義可 null 性型別限定詞的遷移狀態。

`@UnderMigration(status = ...)` 中的狀態值指定了編譯器在 Kotlin 中如何處理被註解型別的不當用法（例如，將標有 `@MyNullable` 註解的型別值當作非 null 使用）：

* `MigrationStatus.STRICT` 使註解像任何普通的可 null 性註解一樣運作，即針對不當用法回報錯誤，並影響在 Kotlin 中所看到的被註解宣告中的型別
* `MigrationStatus.WARN`：不當用法會被回報為編譯警告而非錯誤，但被註解宣告中的型別仍保留為平台型別
* `MigrationStatus.IGNORE` 使編譯器完全忽略該可 null 性註解

程式庫維護人員可以為型別限定詞別名和型別限定詞預設值新增 `@UnderMigration` 狀態：

```java
@Nonnull(when = When.ALWAYS)
@TypeQualifierDefault({ElementType.METHOD, ElementType.PARAMETER})
@UnderMigration(status = MigrationStatus.WARN)
public @interface NonNullApi {
}

// 類別中的型別為非 null，但僅回報警告，
// 因為 `@NonNullApi` 被標註了 `@UnderMigration(status = MigrationStatus.WARN)`
@NonNullApi
public class Test {}
```

> 可 null 性註解的遷移狀態不會被其型別限定詞別名繼承，但會套用於其在預設型別限定詞中的用法。
>
{style="note"}

如果預設型別限定詞使用了型別限定詞別名，且兩者皆帶有 `@UnderMigration`，則使用預設型別限定詞中的狀態。

#### 編譯器設定 {id="compiler-configuration"}

JSR-305 檢查可以透過新增帶有以下值（及其組合）的 `-Xjsr305` 編譯器選項來進行設定：

* `-Xjsr305={strict|warn|ignore}` 用於設定非 `@UnderMigration` 註解的行為。
  自訂可 null 性限定詞（特別是 `@TypeQualifierDefault`）已經廣泛分佈在許多知名程式庫中，
  使用者在升級到包含 JSR-305 支援的 Kotlin 版本時可能需要平滑遷移。
  此選項僅影響非 `@UnderMigration` 註解。
* `-Xjsr305=under-migration:{strict|warn|ignore}` 用於覆寫 `@UnderMigration` 註解的行為。
  使用者對程式庫的遷移狀態可能有不同的看法：
  他們可能希望在官方遷移狀態為 `WARN` 時回報錯誤，反之亦然，
  他們可能希望推遲某些項目的錯誤回報，直到完成遷移為止。
* `-Xjsr305=@<fq.name>:{strict|warn|ignore}` 用於覆寫單一註解的行為，其中 `<fq.name>`
  是該註解的完全限定類名。可以針對不同的註解多次出現。
  這對於管理特定程式庫的遷移狀態非常有用。

`strict`、`warn` 和 `ignore` 值與 `MigrationStatus` 的含義相同，
且只有 `strict` 模式會影響被註解宣告在 Kotlin 中所呈現的型別。

> 內建的 JSR-305 註解 [`@Nonnull`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/Nonnull.html)、
> [`@Nullable`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/3.0.1/javax/annotation/Nullable.html) 以及
> [`@CheckForNull`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/CheckForNull.html) 始終處於啟用狀態，
> 無論是否使用 `-Xjsr305` 選項進行編譯器設定，都會影響 Kotlin 中被註解宣告的型別。
>
{style="note"}

例如，在編譯器引數中新增 `-Xjsr305=ignore -Xjsr305=under-migration:ignore -Xjsr305=@org.library.MyNullable:warn`，將使編譯器針對標註有 `@org.library.MyNullable` 的型別不當用法產生警告，並忽略所有其他 JSR-305 註解。

預設行為與 `-Xjsr305=warn` 相同。
`strict` 值應被視為實驗性的（未來可能會新增更多檢查）。

## 對應型別 {id="mapped-types"}

Kotlin 會對某些 Java 型別進行特殊處理。這些型別不會從 Java「原樣」載入，而是被「對應」到相應的 Kotlin 型別。
此對應僅在編譯期有意義，執行期的表示形式保持不變。
Java 的原始型別會對應到相應的 Kotlin 型別（請將[平台型別](#null-safety-and-platform-types)納入考量）：

| **Java 型別** | **Kotlin 型別**  |
|---------------|------------------|
| `byte`        | `kotlin.Byte`    |
| `short`       | `kotlin.Short`   |
| `int`         | `kotlin.Int`     |
| `long`        | `kotlin.Long`    |
| `char`        | `kotlin.Char`    |
| `float`       | `kotlin.Float`   |
| `double`      | `kotlin.Double`  |
| `boolean`     | `kotlin.Boolean` |

某些非原始的內建類別也會進行對應：

| **Java 型別**                     | **Kotlin 型別**        |
|-----------------------------------|------------------------|
| `java.lang.Object`                | `kotlin.Any!`          |
| `java.lang.Cloneable`             | `kotlin.Cloneable!`    |
| `java.lang.Comparable`            | `kotlin.Comparable!`   |
| `java.lang.Enum`                  | `kotlin.Enum!`         |
| `java.lang.annotation.Annotation` | `kotlin.Annotation!`   |
| `java.lang.CharSequence`          | `kotlin.CharSequence!` |
| `java.lang.String`                | `kotlin.String!`       |
| `java.lang.Number`                | `kotlin.Number!`       |
| `java.lang.Throwable`             | `kotlin.Throwable!`    |

Java 的裝箱原始型別會對應到可 null 的 Kotlin 型別：

| **Java 型別**         | **Kotlin 型別**   |
|-----------------------|-------------------|
| `java.lang.Byte`      | `kotlin.Byte?`    |
| `java.lang.Short`     | `kotlin.Short?`   |
| `java.lang.Integer`   | `kotlin.Int?`     |
| `java.lang.Long`      | `kotlin.Long?`    |
| `java.lang.Character` | `kotlin.Char?`    |
| `java.lang.Float`     | `kotlin.Float?`   |
| `java.lang.Double`    | `kotlin.Double?`  |
| `java.lang.Boolean`   | `kotlin.Boolean?` |

請注意，用作型別參數的裝箱原始型別會對應到平台型別：
例如，`List<java.lang.Integer>` 在 Kotlin 中會變成 `List<Int!>`。

集合型別在 Kotlin 中可以是唯讀或可變的，因此 Java 的集合對應如下
（此表格中的所有 Kotlin 型別均位於 `kotlin.collections` 套件中）：

| **Java 型別**     | **Kotlin 唯讀型別**       | **Kotlin 可變型別**            | **載入的平台型別**                   |
|-------------------|---------------------------|--------------------------------|--------------------------------------|
| `Iterator<T>`     | `Iterator<T>`             | `MutableIterator<T>`           | `(Mutable)Iterator<T>!`              |
| `Iterable<T>`     | `Iterable<T>`             | `MutableIterable<T>`           | `(Mutable)Iterable<T>!`              |
| `Collection<T>`   | `Collection<T>`           | `MutableCollection<T>`         | `(Mutable)Collection<T>!`            |
| `Set<T>`          | `Set<T>`                  | `MutableSet<T>`                | `(Mutable)Set<T>!`                   |
| `List<T>`         | `List<T>`                 | `MutableList<T>`               | `(Mutable)List<T>!`                  |
| `ListIterator<T>` | `ListIterator<T>`         | `MutableListIterator<T>`       | `(Mutable)ListIterator<T>!`          |
| `Map<K, V>`       | `Map<K, V>`               | `MutableMap<K, V>`             | `(Mutable)Map<K, V>!`                |
| `Map.Entry<K, V>` | `Map.Entry<K, V>`         | `MutableMap.MutableEntry<K,V>` | `(Mutable)Map.(Mutable)Entry<K, V>!` |

Java 的陣列對應如[後文](#java-arrays)所述：

| **Java 型別** | **Kotlin 型別**                |
|---------------|--------------------------------|
| `int[]`       | `kotlin.IntArray!`             |
| `String[]`    | `kotlin.Array<(out) String!>!` |

> 這些 Java 型別的 static 成員無法在 Kotlin 型別的[伴生物件](object-declarations.md#companion-objects)上直接存取。若要呼叫它們，請[使用 Java 型別的完整限定名稱](#accessing-static-members)，例如 `java.lang.Integer.toHexString(255)`。
>
{style="note"}

## Kotlin 中的 Java 泛型 {id="java-generics-in-kotlin"}

Kotlin 的泛型與 Java 有些微差異（請參閱[泛型](generics.md)）。
將 Java 型別匯入 Kotlin 時，會執行以下轉換：

* Java 的萬用字元會轉換為型別投影：
  * `Foo<? extends Bar>` 變成 `Foo<out Bar!>!`
  * `Foo<? super Bar>` 變成 `Foo<in Bar!>!`

* Java 的原始型別 (raw types) 會轉換為星號投影：
  * `List` 變成 `List<*>!`，即 `List<out Any?>!`

與 Java 一樣，Kotlin 的泛型在執行期不會保留：物件不會攜帶傳遞給其建構函式的實際型別引數資訊。例如，`ArrayList<Integer>()` 與 `ArrayList<Character>()` 在執行期是無法區分的。
這使得無法執行考量泛型的 `is` 檢查。
Kotlin 僅允許對星號投影的泛型型別進行 `is` 檢查：

```kotlin
if (a is List<Int>) // 錯誤：無法檢查它是否真的是 List of Ints
// 但
if (a is List<*>)   // 正確：不對清單的內容做保證
```

## Java 陣列 {id="java-arrays"}

與 Java 不同，Kotlin 中的陣列是不變的 (invariant)。這表示 Kotlin 不允許你將 `Array<String>` 指派給 `Array<Any>`，
從而防止了可能的執行期失敗。將子類別的陣列作為超類別的陣列傳遞給 Kotlin 方法也是被禁止的，
但對於 Java 方法，這可以透過 `Array<(out) String>!` 形式的[平台型別](#null-safety-and-platform-types)來允許。

在 Java 平台上，陣列與原始資料型別搭配使用，以避免裝箱/拆箱操作的開銷。
由於 Kotlin 隱藏了這些實作細節，因此需要一個融通方案來與 Java 程式碼進行介接。
針對每種原始陣列型別都有專門的類別（`IntArray`、`DoubleArray`、`CharArray` 等）來處理此情況。
它們與 `Array` 類別無關，並且會編譯為 Java 的原始陣列以獲得最大效能。

假設有一個接受整數索引陣列的 Java 方法：

``` java
public class JavaArrayExample {
    public void removeIndices(int[] indices) {
        // 你的程式碼
    }
}
```

若要傳遞原始值陣列，可以在 Kotlin 中執行以下操作：

```kotlin
val javaObj = JavaArrayExample()
val array = intArrayOf(0, 1, 2, 3)
javaObj.removeIndices(array) // 將 int[] 傳遞給方法
```

在編譯為 JVM 位元組碼時，編譯器會最佳化對陣列的存取，因此不會引入額外的開銷：

```kotlin
val array = arrayOf(1, 2, 3, 4)
array[1] = array[1] * 2 // 不會產生對 get() 與 set() 的實際呼叫
for (x in array) {      // 不會建立疊代器
    print(x)
}
```

即使你使用索引進行遍歷，也不會引入任何開銷：

```kotlin
for (i in array.indices) { // 不會建立疊代器
    array[i] += 2
}
```

最後，`in` 檢查同樣沒有開銷：

```kotlin
if (i in array.indices) { // 等同於 (i >= 0 && i < array.size)
    print(array[i])
}
```

## Java 可變參數 (varargs) {id="java-varargs"}

Java 類別有時會為帶有可變參數 (varargs) 的索引宣告方法：

``` java
public class JavaArrayExample {

    public void removeIndicesVarArg(int... indices) {
        // 你的程式碼
    }
}
```

在這種情況下，你需要使用展開運算子 `*` 來傳遞 `IntArray`：

```kotlin
val javaObj = JavaArrayExample()
val array = intArrayOf(0, 1, 2, 3)
javaObj.removeIndicesVarArg(*array)
```

## 運算子 {id="operators"}

由於 Java 無法將適合使用運算子語法的方法進行標記，因此 Kotlin 允許將任何具有正確名稱與簽章的 Java 方法用作運算子多載和其他慣例（`invoke()` 等）。
不允許使用中綴呼叫語法呼叫 Java 方法。

例如，你可以將宣告了 `get(int)` 和 `set(int, T)` 方法的 Java 類別與 Kotlin 中的索引存取運算子搭配使用：

```java
public class IntContainer {
    private final int[] values = new int[10];

    public int get(int index) {
        return values[index];
    }

    public void set(int index, int value) {
        values[index] = value;
    }
}
```

```kotlin
fun main() {
    val container = IntContainer()
    container[0] = 42     // 呼叫 set(0, 42)
    println(container[0]) // 呼叫 get(0)
}
```

## 受檢例外 {id="checked-exceptions"}

在 Kotlin 中，所有[例外都是非受檢的](exceptions.md)，這意味著編譯器不會強迫你擷取其中的任何例外。
因此，當你呼叫宣告了受檢例外的 Java 方法時，Kotlin 不會強迫你執行任何動作：

```kotlin
fun render(list: List<*>, to: Appendable) {
    for (item in list) {
        to.append(item.toString()) // 在 Java 中，你必須擷取 Appendable.append() 拋出的 IOException
    }
}
```

## Object 方法 {id="object-methods"}

當 Java 型別匯入 Kotlin 時，所有 `java.lang.Object` 型別的參照都會轉變為 `Any`。
由於 `Any` 不是平台特有的，它只宣告了 `toString()`、`hashCode()` 與 `equals()` 作為其成員，
因此為了讓 `java.lang.Object` 的其他成員可用，Kotlin 使用了[擴充函式](extensions.md)。

### `wait()` 與 `notify()` {id="wait-and-notify"}

`Any` 型別的參照無法使用 `wait()` 與 `notify()` 方法。通常不鼓勵使用它們，
建議改用 `java.util.concurrent`。

如果你必須呼叫這些方法，請透過 Java 物件存取它們並隱藏 `PLATFORM_CLASS_MAPPED_TO_KOTLIN` 警告：

```kotlin
import java.util.LinkedList

class SimpleBlockingQueue<T>(private val capacity: Int) {
    private val queue = LinkedList<T>()

    // 使用 java.lang.Object 執行個體來存取 wait() 和 notify()
    // 在 Kotlin 中，標準的 'Any' 型別未公開這些方法
    @Suppress("PLATFORM_CLASS_MAPPED_TO_KOTLIN")
    private val lock = Object()

    fun put(item: T) {
        synchronized(lock) {
            while (queue.size >= capacity) {
                lock.wait()
            }
            queue.add(item)
            println("Produced: $item")

            lock.notifyAll()
        }
    }

    fun take(): T {
        synchronized(lock) {
            while (queue.isEmpty()) {
                lock.wait()
            }
            val item = queue.removeFirst()
            println("Consumed: $item")

            lock.notifyAll()
            return item
        }
    }
}
```

或者明確轉換為 `java.lang.Object` 並隱藏 `PLATFORM_CLASS_MAPPED_TO_KOTLIN` 警告：

```kotlin
@Suppress("PLATFORM_CLASS_MAPPED_TO_KOTLIN")
(instance as java.lang.Object).wait()
```

### `getClass()` {id="getclass"}

若要擷取物件的 Java 類別，請在[類別參照](reflection.md#obtain-a-runtime-class)上使用 `java` 擴充屬性：

```kotlin
val instanceClass = instance::class.java
```

上述程式碼使用了[綁定類別參照](lambdas.md#bound-and-unbound-references)。你也可以使用 `javaClass` 擴充屬性：

```kotlin
val instanceClass = instance.javaClass
```

### `clone()` {id="clone"}

若要覆寫 `clone()`，你的類別需要繼承 `kotlin.Cloneable`：

```kotlin
class Example : Cloneable {
    override fun clone(): Any { ... }
}
```

別忘了參考 [Effective Java, 3rd Edition](https://www.oracle.com/technetwork/java/effectivejava-136174.html)
第 13 條：*審慎地覆寫 clone*。

### `finalize()` {id="finalize"}

若要覆寫 `finalize()`，請在宣告時不使用 `override` 關鍵字：

```kotlin
class C {
    protected fun finalize() {
        // 最終化邏輯
    }
}
```

根據 Java 的規則，`finalize()` 不得為 `private`。

> `finalize()` 方法在現代 Java 版本中已被棄用。請改用替代方案，例如 [`java.lang.ref.Cleaner`](https://docs.oracle.com/javase/9/docs/api/java/lang/ref/Cleaner.html)
> 或 [try-with-resources](https://docs.oracle.com/javase/tutorial/essential/exceptions/tryResourceClose.html)。
>
{style="note"}

## 繼承 Java 類別 {id="inheritance-from-java-classes"}

Kotlin 中的類別最多只能將一個 Java 類別（以及任意數量的 Java 介面）作為超型別。

## 存取 static 成員 {id="accessing-static-members"}

Java 類別的 static 成員構成了這些類別的「伴生物件」。你不能將這種「伴生物件」
作為值到處傳遞，但可以明確存取其成員，例如：

```kotlin
if (Character.isLetter(a)) { ... }
```

若要呼叫已匯入 Java 類別的 static 方法，請像在 Java 中一樣直接使用類別名稱。請參考以下 Java 類別：

```java
package org.example;

public class MathUtils {
    public static int triple(int value) {
        return value * 3;
    }
}
```

匯入該類別並透過類別名稱呼叫其 static 方法：

```kotlin
import org.example.MathUtils

fun main() {
    println(MathUtils.triple(5)) // 呼叫 static 的 triple() 方法
}
```

若要存取[對應](#mapped-types)至 Kotlin 型別的 Java 型別 static 成員，請使用 Java 型別的完整限定名稱：`java.lang.Integer.bitCount(5)`。

## Java 反射 {id="java-reflection"}

Java 反射適用於 Kotlin 類別，反之亦然。如上所述，你可以使用 `instance::class.java`、
`ClassName::class.java` 或 `instance.javaClass` 透過 `java.lang.Class` 進入 Java 反射。
不要為了這個目的使用 `ClassName.javaClass`，因為它參照的是 `ClassName` 的[伴生物件](object-declarations.md#companion-objects)類別，
這等同於 `ClassName.Companion::class.java`，而不是 `ClassName::class.java`。

對於每個原始型別，都有兩個不同的 Java 類別，而 Kotlin 提供了取得這兩者的方法。
例如，`Int::class.java` 將傳回代表原始型別本身的類別執行個體，
對應於 Java 中的 `Integer.TYPE`。若要取得相應包裝型別的類別，請使用
`Int::class.javaObjectType`，這等同於 Java 的 `Integer.class`。

其他受支援的情況包括為 Kotlin 屬性取得 Java getter/setter 方法或支援欄位、
為 Java 欄位取得 `KProperty`、為 `KFunction` 取得 Java 方法或建構函式，反之亦然。

## SAM 轉換 {id="sam-conversions"}

Kotlin 同時支援 Java 和 [Kotlin 介面](fun-interfaces.md)的 SAM 轉換。
對 Java 的支援意味著，只要介面方法的參數型別與 Kotlin 函式的參數型別相符，Kotlin 函式常值就可以自動轉換為
具有單一非預設方法之 Java 介面的實作。

你可以使用它來建立 SAM 介面的執行個體：

```kotlin
val runnable = Runnable { println("This runs in a runnable") }
```

以及在方法呼叫中使用：

```kotlin
val executor = Executors.newSingleThreadExecutor()
// Java 簽章：void execute(Runnable command)
executor.execute { println("This runs in a thread pool") }
```

如果 Java 類別有多個接受函式語言介面的方法，你可以使用將 Lambda 轉換為特定 SAM 型別的配接器函式，來選擇需要呼叫的方法。編譯器在需要時也會產生這些配接器函式：

```kotlin
executor.execute(Runnable { println("This runs in a thread pool") })
```

> SAM 轉換僅適用於介面。它們不適用於抽象類別，即使這些類別只有一個抽象方法。
>
{style="note"}

## 在 Kotlin 中使用 JNI {id="using-jni-with-kotlin"}

若要宣告在原生程式碼（C 或 C++）中實作的函式，你需要使用 `external` 修飾詞對其進行標記：

```kotlin
external fun calculateSum(x: Int): Double
```

其餘程序與 Java 中的完全相同。

你也可以將屬性的 getter 和 setter 標記為 `external`：

```kotlin
var myProperty: String
    external get
    external set
```

在幕後，這將建立兩個函式 `getMyProperty` 和 `setMyProperty`，兩者皆標記為 `external`。

## 在 Kotlin 中使用 Lombok 產生的宣告 {id="using-lombok-generated-declarations-in-kotlin"}

你可以在 Kotlin 程式碼中使用 Java 由 Lombok 產生的宣告。
如果你需要在同一個 Java/Kotlin 混合模組中產生並使用這些宣告，
可以在 [Lombok 編譯器外掛程式頁面](lombok.md)了解如何操作。
如果你是從另一個模組呼叫此類宣告，則無需使用此外掛程式來編譯該模組。