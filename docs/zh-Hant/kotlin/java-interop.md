[//]: # (title: 在 Kotlin 中呼叫 Java)

Kotlin 在設計時就充分考慮了與 Java 的互通性。現有的 Java 程式碼可以自然地在 Kotlin 中呼叫，
而 Kotlin 程式碼也能相當順暢地在 Java 中使用。
在本節中，我們將介紹在 Kotlin 中呼叫 Java 程式碼的一些細節。

幾乎所有的 Java 程式碼都可以毫無問題地使用：

```kotlin
import java.util.*

fun demo(source: List<Int>) {
    val list = ArrayList<Int>()
    // 'for' 迴圈適用於 Java 集合：
    for (item in source) {
        list.add(item)
    }
    // 運算子慣例也能正常運作：
    for (i in 0..source.size - 1) {
        list[i] = source[i] // 呼叫了 get 與 set
    }
}
```

## Getter 與 Setter {id="getters-and-setters"}

遵循 Java 的 getter 與 setter 慣例的方法（名稱以 `get` 開頭的無參數方法，以及名稱以 `set` 開頭的單一參數方法）在 Kotlin 中會表示為屬性。這類屬性也被稱為「合成屬性」（synthetic properties）。
`Boolean` 存取子方法（getter 名稱以 `is` 開頭且 setter 名稱以 `set` 開頭）
則會表示為與 getter 方法同名的屬性。

```kotlin
import java.util.Calendar

fun calendarDemo() {
    val calendar = Calendar.getInstance()
    if (calendar.firstDayOfWeek == Calendar.SUNDAY) { // 呼叫 getFirstDayOfWeek()
        calendar.firstDayOfWeek = Calendar.MONDAY // 呼叫 setFirstDayOfWeek()
    }
    if (!calendar.isLenient) { // 呼叫 isLenient()
        calendar.isLenient = true // 呼叫 setLenient()
    }
}
```

上面的 `calendar.firstDayOfWeek` 就是合成屬性的一個範例。

請注意，如果 Java 類別只有 setter，它在 Kotlin 中將不會顯示為屬性，因為 Kotlin 不支援唯寫（set-only）屬性。

## Java 合成屬性參照 {id="java-synthetic-property-references"}

> 此功能為[實驗性功能](components-stability.md#stability-levels-explained)。它可能隨時被捨棄或修改。
> 建議僅將其用於評估目的。
>
{style="warning"}

從 Kotlin 1.8.20 開始，你可以建立對 Java 合成屬性的參照。試考慮以下 Java 程式碼：

```java
public class Person {
    private String name;
    private int age;

    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String getName() {
        return name;
    }

    public int getAge() {
        return age;
    }
}
```

Kotlin 一直以來都允許你編寫 `person.age`（其中 `age` 是一個合成屬性）。現在，你也可以
建立對 `Person::age` 與 `person::age` 的參照。這同樣適用於 `name`。

```kotlin
val persons = listOf(Person("Jack", 11), Person("Sofie", 12), Person("Peter", 11))
    persons
         // 呼叫對 Java 合成屬性的參照：
        .sortedBy(Person::age)
         // 透過 Kotlin 屬性語法呼叫 Java getter：
        .forEach { person -> println(person.name) }
```

### 如何啟用 Java 合成屬性參照 {initial-collapse-state="collapsed" collapsible="true" id="how-to-enable-java-synthetic-property-references"}

若要啟用此功能，請設定編譯器選項 `-language-version 2.1`。在 Gradle 專案中，你可以透過
在 `build.gradle(.kts)` 中新增以下內容來達成：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
tasks
    .withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask<*>>()
    .configureEach {
        compilerOptions
            .languageVersion
            .set(
                org.jetbrains.kotlin.gradle.dsl.KotlinVersion.KOTLIN_2_1
            )
    }
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
tasks
    .withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask.class)
    .configureEach {
        compilerOptions.languageVersion
            = org.jetbrains.kotlin.gradle.dsl.KotlinVersion.KOTLIN_2_1
}
```

</tab>
</tabs>

> 在 Kotlin 1.9.0 之前，若要啟用此功能，必須設定 `-language-version 1.9` 編譯器選項。
> 
{style="note"}

## 傳回 void 的方法 {id="methods-returning-void"}

如果一個 Java 方法傳回 `void`，在 Kotlin 中呼叫時它將傳回 `Unit`。
若碰巧有人使用了該傳回值，Kotlin 編譯器會在呼叫點指派該值，
因為該值本身已經預先確定（即 `Unit`）。

## 對 Kotlin 關鍵字的 Java 識別符進行跳脫 {id="escaping-for-java-identifiers-that-are-keywords-in-kotlin"}

某些 Kotlin 關鍵字在 Java 中是合法的識別符：例如 `in`、`object`、`is` 等等。
如果 Java 程式庫中的方法名稱使用了 Kotlin 關鍵字，你仍然可以透過
使用反引號（`）字元將其跳脫來呼叫該方法：

```kotlin
foo.`is`(bar)
```

## Null 安全性與平台型別 {id="null-safety-and-platform-types"}

Java 中的任何參照都可能是 `null`，這使得 Kotlin 嚴格的 null 安全性要求對於來自 Java 的物件顯得不切實際。
Java 宣告的型別在 Kotlin 中被視為不可直接表示的型別，並稱為[*平台型別*](https://kotlinlang.org/spec/type-system.html#platform-types)。
你無法在程式碼中明確寫出這些不可表示的型別。因此，當一個平台值指派給 Kotlin 變數時，你可以：

* 依賴型別推論。在此情況下，該變數具有推論出的平台型別。
* 自行選擇期望的型別。Kotlin 同時允許宣告為可空（nullable）與非空（non-nullable）型別。

這類型別放寬了 null 檢查，因此它們的安全保證與 Java 相同（詳見[下文](#mapped-types)）。
請參考以下範例：

```kotlin
val list = ArrayList<String>() // 非空（建構函式結果）
list.add("Item")
val size = list.size // 非空（基本型別 int）
val item = list[0] // 推論出的平台型別（一般 Java 物件）
```

當你呼叫平台型別變數上的方法時，Kotlin 不會在編譯期回報可 null 性錯誤，
但該呼叫可能會在執行階段失敗，原因是擲出 NullPointerException 或 Kotlin 為了防止 null 傳遞而產生的斷言失敗：

```kotlin
item.substring(1) // 允許，若 item == null 則會擲出例外
```

你可以將平台型別的值指派給 Kotlin 的可空或非空型別變數。然而，
如果你將此類值指派給非空型別的變數，而在執行階段該值實際上為 `null`，Kotlin 就會
擲出 `NullPointerException`。為了避免此情況，請在你的 Kotlin 程式碼中加入明確的可 null 性宣告：

```kotlin
val nullable: String? = item // 允許，永遠能正常運作
val notNull: String = item // 允許，但可能在執行階段失敗
```

如果你選擇了非空型別，編譯器會在指派時產生斷言。這可以防止 Kotlin 的非空變數持有
null。當你將平台值傳遞給需要非空值的 Kotlin 函式以及在其他情況下時，也會發出斷言。
總體而言，編譯器會盡最大努力防止 null 在程式中廣泛傳播，儘管由於泛型的緣故，有時
無法完全消除這種情況。

### 平台型別的標記法 {id="notation-for-platform-types"}

正如上一節所提到的，平台型別無法在程式中明確指定，因此該語言中沒有相應的語法。
儘管如此，編譯器與 IDE 有時需要顯示它們（例如在錯誤訊息或參數提示中），因此為它們提供了一種助記表示法：

* `T!` 表示「`T` 或 `T?`」
* `(Mutable)Collection<T>!` 表示「`T` 的 Java 集合可能是可變的也可能不是，可能是可空的也可能不是」
* `Array<(out) T>!` 表示「`T`（或 `T` 的子型別）的 Java 陣列，可能是可空的也可能不是」

當你在錯誤訊息或 IDE 工具提示中看到此標記法時，請在 Kotlin 變數中加入明確的型別註解
以恢復 null 安全性檢查，或使用可 null 性註解從來源端消除平台型別。

### 可 null 性註解 {id="nullability-annotations"}

帶有可 null 性註解的 Java 型別不會表示為平台型別，而是表示為實際的可空或非空
Kotlin 型別。編譯器支援多種風格的可 null 性註解，包括：

  * [JetBrains](https://www.jetbrains.com/idea/help/nullable-and-notnull-annotations.html)
（來自 `org.jetbrains.annotations` 套件的 `@Nullable` 與 `@NotNull`）
  * [JSpecify](#jspecify-support) (`org.jspecify.annotations`)
  * Android (`com.android.annotations` 與 `android.support.annotations`)
  * [JSR-305](#jsr-305-support) (`javax.annotation`)
  * FindBugs (`edu.umd.cs.findbugs.annotations`)
  * Eclipse (`org.eclipse.jdt.annotation`)
  * [Lombok](lombok.md) (`lombok.NonNull`)
  * RxJava 3 (`io.reactivex.rxjava3.annotations`)
  * [Vert.x](https://vertx.io/) (`io.vertx.codegen.annotations`)

你可以透過以下編譯器選項指示編譯器針對特定的可 null 性註解回報可 null 性不符合的問題：

```bash
-Xnullability-annotations=@<package-name>:<report-level>
``` 

指定完全限定的可 null 性註解的套件名稱，以及以下報告級別之一：

* `ignore`：忽略可 null 性不符合
* `warn`：回報警告
* `strict`：回報錯誤。

> [JSpecify](#jspecify-support) 是唯一預設使用 `strict` 報告級別的受支援註解風格。
> 使用它可以在無需額外配置的情況下回報可 null 性註解的錯誤。
>
{style="note"}

如需查看受支援的可 null 性註解的完整清單，請參閱
[Kotlin 編譯器原始碼](https://github.com/JetBrains/kotlin/blob/master/core/compiler.common.jvm/src/org/jetbrains/kotlin/load/java/JvmAnnotationNames.kt)。

### 可變性註解 {id="mutability-annotations"}

你可以使用可變性註解來標記 Java 宣告，以指定傳回的集合在 Kotlin 中是唯讀的還是可變的。
如果你將該值指派給具有不同可變性的集合型別，編譯器將回報型別不相符。
診斷的嚴重層級取決於具體的可變性註解。

編譯器支援多種可變性註解，包括：

* `kotlin.annotations.jvm.ReadOnly`
* `kotlin.annotations.jvm.Mutable`
* `org.jetbrains.annotations.Unmodifiable`
* `org.jetbrains.annotations.UnmodifiableView`

如需查看受支援的可變性註解的完整清單，請參閱 [Kotlin 編譯器原始碼](https://github.com/JetBrains/kotlin/blob/master/core/compiler.common.jvm/src/org/jetbrains/kotlin/load/java/JvmAnnotationNames.kt)。

### 註解型別引數與型別參數 {id="annotating-type-arguments-and-type-parameters"}

你也可以對泛型型別的型別引數與型別參數加上註解，為它們提供可 null 性資訊。

> 本節中的所有範例均使用來自 `org.jetbrains.annotations` 套件的 JetBrains 可 null 性註解。
>
{style="note"}

#### 型別引數 {id="type-arguments"}

請參考以下 Java 宣告中的註解：

```java
@NotNull
Set<@NotNull String> toSet(@NotNull Collection<@NotNull String> elements) { ... }
```

它們在 Kotlin 中會產生以下簽章：

```kotlin
fun toSet(elements: (Mutable)Collection<String>) : (Mutable)Set<String> { ... }
```

當型別引數缺少 `@NotNull` 註解時，你會得到一個平台型別：

```kotlin
fun toSet(elements: (Mutable)Collection<String!>) : (Mutable)Set<String!> { ... }
```

Kotlin 還會考慮基底類別與介面的型別引數上的可 null 性註解。例如，
有兩個 Java 類別的簽章如下所示：

```java
public class Base<T> {}
```

```java
public class Derived extends Base<@Nullable String> {}
```

在 Kotlin 程式碼中，若在預期為 `Base<String>` 的地方傳遞 `Derived` 執行個體，將會產生警告。

```kotlin
fun takeBaseOfNotNullStrings(x: Base<String>) {}

fun main() {
    takeBaseOfNotNullStrings(Derived()) // 警告：可 null 性不相符
}
```

`Derived` 的上界被設定為 `Base<String?>`，這與 `Base<String>` 不同。

進一步了解 [Kotlin 中的 Java 泛型](#java-generics-in-kotlin)。

#### 型別參數 {id="type-parameters"}

預設情況下，Kotlin 與 Java 中一般型別參數的可 null 性都是未定義的。在 Java 中，你可以
使用可 null 性註解來指定它。讓我們為 `Base` 類別的型別參數加上註解：

```java
public class Base<@NotNull T> {}
```

當繼承自 `Base` 時，Kotlin 期望一個非空的型別引數或型別參數。
因此，以下 Kotlin 程式碼會產生警告：

```kotlin
class Derived<K> : Base<K> {} // 警告：K 具有未定義的可 null 性
```

你可以透過指定上界 `K : Any` 來修正此問題。

Kotlin 也支援在 Java 型別參數的界限上加上可 null 性註解。讓我們為 `Base` 新增界限：

```java
public class BaseWithBound<T extends @NotNull Number> {}
```

Kotlin 會將其轉譯如下：

```kotlin
class BaseWithBound<T : Number> {}
```

因此傳遞可空型別作為型別引數或型別參數會產生警告。

對型別引數與型別參數加上註解的功能適用於 Java 8 或更高版本的目標。該功能要求
可 null 性註解支援 `TYPE_USE` 目標（`org.jetbrains.annotations` 在 15 及以上版本支援此功能）。

> 如果一個可 null 性註解除了 `TYPE_USE` 目標之外，還支援適用於型別的其他目標，
> 則以 `TYPE_USE` 為優先。例如，如果 `@Nullable` 同時具有 `TYPE_USE` 與 `METHOD` 目標，則 Java 方法
> 簽章 `@Nullable String[] f()` 在 Kotlin 中會變成 `fun f(): Array<String?>!`。
>
{style="note"}

### JSpecify 支援 {id="jspecify-support"}

Kotlin 支援 [JSpecify](https://jspecify.dev/) 可 null 性註解，該註解為 Java 可 null 性提供了一套統一的註解標準。
JSpecify 允許你為 Java 宣告提供詳細的可 null 性資訊，
幫助 Kotlin 在處理 Java 程式碼時保持 null 安全性。

Kotlin 支援 `org.jspecify.annotations` 套件中的以下註解：

* `@Nullable` 將型別標記為可空。
* `@NonNull` 將型別標記為非空。
* `@NullMarked` 預設將某個作用域（例如類別或套件）內的所有型別標記為非空，除非另有註解說明。

  此註解不適用於區域變數與[型別變數（泛型）](https://jspecify.dev/docs/user-guide/#using-type-variables-in-generic-types)。
  型別變數在提供具體的可空或非空型別之前保持「與 null 無關」（null-agnostic）。

* `@NullUnmarked` 可反轉 `@NullMarked` 的效果，使該作用域內的所有型別都成為[平台型別](#null-safety-and-platform-types)。

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
 
在 Kotlin 中，這些型別會被視為一般的可空與非空型別，而不是[平台型別](#null-safety-and-platform-types)：
 
```kotlin
// Kotlin
fun test(inventory: InventoryService) {
   inventory.notNull().length // OK
   inventory.nullable().length // 錯誤：僅允許安全呼叫（?.）或非空斷言呼叫（!!）
}
```

預設情況下，Kotlin 編譯器會將 JSpecify 註解的可 null 性不相符回報為錯誤。
你可以使用以下編譯器選項自訂 JSpecify 可 null 性診斷的嚴重性：

```bash
-Xjspecify-annotations=<report-level>
```

可用的報告層級有：

| 層級     | 說明                                              |
|----------|---------------------------------------------------|
| `strict` | 針對可 null 性不符合回報錯誤（預設）。            |
| `warn`   | 回報警告。                                        |
| `ignore` | 忽略可 null 性不符合。                            |

> 如需了解更多有關 JSpecify 註解的資訊，請參閱 [JSpecify 使用者指南](https://jspecify.dev/docs/user-guide)。
> 
{type="tip"}

### JSR-305 支援 {id="jsr-305-support"}

支援使用 [JSR-305](https://jcp.org/en/jsr/detail?id=305) 中定義的
[`@Nonnull`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/Nonnull.html) 註解來表示 Java 型別的可 null 性。

如果 `@Nonnull(when = ...)` 的值為 `When.ALWAYS`，則被註解的型別會被視為非空；`When.MAYBE` 與
`When.NEVER` 表示可空型別；而 `When.UNKNOWN` 則會強制該型別成為[平台型別](#null-safety-and-platform-types)。

程式庫可以針對 JSR-305 註解進行編譯，但不需要將註解構件（例如 `jsr305.jar`）
設定為程式庫使用者的編譯相依項。Kotlin 編譯器可以直接從程式庫讀取 JSR-305 註解，
而無需在類別路徑（classpath）中包含這些註解。

同時也支援[自訂可 null 性限定符（KEEP-79）](https://github.com/Kotlin/KEEP/blob/master/proposals/jsr-305-custom-nullability-qualifiers.md)
（見下文）。

#### 型別限定詞暱稱 {id="type-qualifier-nicknames"}

如果某個註解型別同時標記了
[`@TypeQualifierNickname`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/meta/TypeQualifierNickname.html)
與 JSR-305 的 `@Nonnull`（或其另一個暱稱，例如 `@CheckForNull`），那麼該註解型別本身就可用於
檢索精確的可 null 性，且含義與該可 null 性註解相同：

```java
@TypeQualifierNickname
@Nonnull(when = When.ALWAYS)
@Retention(RetentionPolicy.RUNTIME)
public @interface MyNonnull {
}

@TypeQualifierNickname
@CheckForNull // 另一個型別限定詞暱稱的暱稱
@Retention(RetentionPolicy.RUNTIME)
public @interface MyNullable {
}

interface A {
    @MyNullable String foo(@MyNonnull String x);
    // 在 Kotlin（嚴格模式）中：`fun foo(x: String): String?`

    String bar(List<@MyNonnull String> x);
    // 在 Kotlin（嚴格模式）中：`fun bar(x: List<String>!): String!`
}
```

#### 型別限定詞預設值 {id="type-qualifier-defaults"}

[`@TypeQualifierDefault`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/meta/TypeQualifierDefault.html)
允許引入在套用時可在被註解元素的範圍內定義預設可 null 性的註解。

此類註解型別本身應同時使用 `@Nonnull`（或其暱稱）以及帶有一個或多個 `ElementType` 值的 `@TypeQualifierDefault(...)` 進行註解：

* `ElementType.METHOD` 用於方法的傳回型別
* `ElementType.PARAMETER` 用於值參數
* `ElementType.FIELD` 用於欄位
* `ElementType.TYPE_USE` 用於任何型別，包括型別引數、型別參數的上界以及萬用字元型別

當型別本身沒有被可 null 性註解標記時，將使用預設的可 null 性，且該預設值由
帶有型別限定詞預設註解的最內層封閉元素確定，且該註解的 `ElementType` 需與該型別用法相符。

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
    String foo(String x); // fun foo(x: String?): String?

    @NotNullApi // 覆寫來自介面的預設值
    String bar(String x, @Nullable String y); // fun bar(x: String, y: String?): String

    // 由於 `@NullableApi` 具有 `TYPE_USE` 元素型別，
    // List<String> 的型別引數被視為可空：
    String baz(List<String> x); // fun baz(List<String?>?): String?

    // 參數 `x` 的型別仍然是平台型別，
    // 因為存在明確標記為 UNKNOWN 的可 null 性註解：
    String qux(@Nonnull(when = When.UNKNOWN) String x); // fun baz(x: String!): String?
}
```

> 本範例中的型別僅在啟用嚴格模式時生效；否則，仍保持為平台型別。
> 請參閱 [`@UnderMigration` 註解](#undermigration-annotation) 與[編譯器設定](#compiler-configuration)部分。
>
{style="note"}

也支援套件層級的預設可 null 性：

```java
// FILE: test/package-info.java
@NonNullApi // 預設將套件 'test' 中的所有型別宣告為非空
package test;
```

#### @UnderMigration 註解 {id="undermigration-annotation"}

程式庫維護人員可以使用 `@UnderMigration` 註解（由單獨的構件 `kotlin-annotations-jvm` 提供）
來定義可 null 性型別限定詞的遷移狀態。

`@UnderMigration(status = ...)` 中的狀態值指定了編譯器如何處理在 Kotlin 中對被註解型別的不當用法
（例如將帶有 `@MyNullable` 註解的型別值當作非空來使用）：

* `MigrationStatus.STRICT` 使註解的運作方式如同任何普通的可 null 性註解，即針對不當用法回報錯誤，
並影響被註解宣告在 Kotlin 中呈現的型別
* `MigrationStatus.WARN`：不當用法會被回報為編譯警告而非錯誤，
但被註解宣告中的型別仍保持為平台型別
* `MigrationStatus.IGNORE` 使編譯器完全忽略該可 null 性註解

程式庫維護人員可以為型別限定詞暱稱以及型別限定詞預設值兩者新增 `@UnderMigration` 狀態：

```java
@Nonnull(when = When.ALWAYS)
@TypeQualifierDefault({ElementType.METHOD, ElementType.PARAMETER})
@UnderMigration(status = MigrationStatus.WARN)
public @interface NonNullApi {
}

// 類別中的型別為非空，但只會回報警告，
// 因為 `@NonNullApi` 標記了 `@UnderMigration(status = MigrationStatus.WARN)`
@NonNullApi
public class Test {}
```

> 可 null 性註解的遷移狀態不會被其型別限定詞暱稱繼承，
> 但會套用到預設型別限定詞的使用中。
>
{style="note"}

如果預設型別限定詞使用了型別限定詞暱稱，且它們都標有 `@UnderMigration`，
則會使用來自預設型別限定詞的狀態。

#### 編譯器配置 {id="compiler-configuration"}

可以透過新增帶有以下選項（及其組合）的 `-Xjsr305` 編譯器旗標來配置 JSR-305 檢查：

* `-Xjsr305={strict|warn|ignore}`：設定非 `@UnderMigration` 註解的行為。
自訂可 null 性限定詞（特別是 `@TypeQualifierDefault`）已經廣泛應用於許多知名程式庫中，
使用者在更新到包含 JSR-305 支援的 Kotlin 版本時可能需要平滑遷移。自 Kotlin 1.1.60 起，此旗標僅影響非 `@UnderMigration` 註解。

* `-Xjsr305=under-migration:{strict|warn|ignore}`：覆寫 `@UnderMigration` 註解的行為。
使用者可能對程式庫的遷移狀態有不同的看法：
當官方遷移狀態為 `WARN` 時，他們可能希望直接視為錯誤；反之，
他們可能希望推遲某些錯誤的回報，直到完成遷移。

* `-Xjsr305=@<fq.name>:{strict|warn|ignore}`：覆寫單個註解的行為，其中 `<fq.name>`
是註解的完全限定類名。可以針對不同的註解多次出現。這對於管理特定程式庫的遷移狀態非常有用。

`strict`、`warn` 與 `ignore` 值與 `MigrationStatus` 的含義相同，
且只有 `strict` 模式會影響被註解宣告在 Kotlin 中呈現的型別。

> 注意：內建的 JSR-305 註解 [`@Nonnull`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/Nonnull.html)、
>[`@Nullable`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/3.0.1/javax/annotation/Nullable.html) 與
>[`@CheckForNull`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/CheckForNull.html) 始終處於啟用狀態，
>並且無論是否使用 `-Xjsr305` 旗標進行編譯器配置，都會影響被註解宣告在 Kotlin 中的型別。
>
{style="note"}

例如，在編譯器引數中新增 `-Xjsr305=ignore -Xjsr305=under-migration:ignore -Xjsr305=@org.library.MyNullable:warn`
會使編譯器針對使用 `@org.library.MyNullable` 註解的型別的不當用法產生警告，並忽略所有其他 JSR-305 註解。

預設行為等同於 `-Xjsr305=warn`。
`strict` 值應被視為實驗性的（未來可能會對其新增更多檢查）。

## 對應型別 {id="mapped-types"}

Kotlin 會對某些 Java 型別進行特殊處理。這些型別不會從 Java「按原樣」載入，而是會*對應*（mapped）到相應的 Kotlin 型別。
這種對應僅在編譯期有意義，執行階段的表示方式保持不變。
Java 的基本型別會對應到相應的 Kotlin 型別（同時牢記[平台型別](#null-safety-and-platform-types)）：

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

一些非基本型別的內建類別也會進行對應：

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

Java 的裝箱基本型別會對應到可空的 Kotlin 型別：

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

請注意，當裝箱基本型別用作型別參數時，會對應到平台型別：
例如，`List<java.lang.Integer>` 在 Kotlin 中會變成 `List<Int!>`。

集合型別在 Kotlin 中可以是唯讀的或可變的，因此 Java 的集合對應如下
（此表中的所有 Kotlin 型別均位於 `kotlin.collections` 套件中）：

| **Java 型別**     | **Kotlin 唯讀型別**       | **Kotlin 可變型別**             | **載入的平台型別**                   |
|-------------------|---------------------------|---------------------------------|--------------------------------------|
| `Iterator<T>`     | `Iterator<T>`             | `MutableIterator<T>`            | `(Mutable)Iterator<T>!`              |
| `Iterable<T>`     | `Iterable<T>`             | `MutableIterable<T>`            | `(Mutable)Iterable<T>!`              |
| `Collection<T>`   | `Collection<T>`           | `MutableCollection<T>`          | `(Mutable)Collection<T>!`            |
| `Set<T>`          | `Set<T>`                  | `MutableSet<T>`                 | `(Mutable)Set<T>!`                   |
| `List<T>`         | `List<T>`                 | `MutableList<T>`                | `(Mutable)List<T>!`                  |
| `ListIterator<T>` | `ListIterator<T>`         | `MutableListIterator<T>`        | `(Mutable)ListIterator<T>!`          |
| `Map<K, V>`       | `Map<K, V>`               | `MutableMap<K, V>`              | `(Mutable)Map<K, V>!`                |
| `Map.Entry<K, V>` | `Map.Entry<K, V>`         | `MutableMap.MutableEntry<K,V>`  | `(Mutable)Map.(Mutable)Entry<K, V>!` |

Java 的陣列會依照[下文](#java-arrays)所述進行對應：

| **Java 型別** | **Kotlin 型別**                |
|---------------|--------------------------------|
| `int[]`       | `kotlin.IntArray!`             |
| `String[]`    | `kotlin.Array<(out) String!>!` |

>這些 Java 型別的 static 成員無法直接在 Kotlin 型別的[伴隨物件](object-declarations.md#companion-objects)上存取。
>若要呼叫它們，請使用 Java 型別的完全限定名稱，例如 `java.lang.Integer.toHexString(foo)`。
>
{style="note"}

## Kotlin 中的 Java 泛型 {id="java-generics-in-kotlin"}

Kotlin 的泛型與 Java 的泛型略有不同（請參閱[泛型](generics.md)）。
將 Java 型別匯入 Kotlin 時，會執行以下轉換：

* Java 的萬用字元會轉換為型別投影：
  * `Foo<? extends Bar>` 轉換為 `Foo<out Bar!>!`
  * `Foo<? super Bar>` 轉換為 `Foo<in Bar!>!`

* Java 的原始型別（raw types）會轉換為星號投影：
  * `List` 轉換為 `List<*>!`，即 `List<out Any?>!`

與 Java 一樣，Kotlin 的泛型在執行階段不會保留：物件不會攜帶傳遞給其建構函式的實際型別引數資訊。
例如，`ArrayList<Integer>()` 與 `ArrayList<Character>()` 在執行期是無法區分的。
這使得進行考慮泛型的 `is` 檢查變得不可能。
Kotlin 僅允許對星號投影的泛型型別進行 `is` 檢查：

```kotlin
if (a is List<Int>) // 錯誤：無法檢查它是否真的是 Int 的 List
// 但是
if (a is List<*>) // OK：不對列表內容作任何保證
```

## Java 陣列 {id="java-arrays"}

與 Java 不同，Kotlin 中的陣列是不變的（invariant）。這意味著 Kotlin 不允許你將 `Array<String>` 指派給 `Array<Any>`，
從而防止了可能的執行期失敗。將子類別的陣列作為超類別的陣列傳遞給 Kotlin 方法也是被禁止的，
但對於 Java 方法，這可以透過 `Array<(out) String>!` 形式的[平台型別](#null-safety-and-platform-types)來允許。

在 Java 平台上，陣列會搭配基本資料型別使用，以避免裝箱/拆箱操作的開銷。
由於 Kotlin 隱藏了這些實作細節，因此需要一種因應措施來與 Java 程式碼互動。
每種基本型別陣列都有專門的類別（`IntArray`、`DoubleArray`、`CharArray` 等等）來處理這種情況。
它們與 `Array` 類別無關，並會編譯為 Java 的基本型別陣列，以實現最大效能。

假設有一個接受整數索引陣列的 Java 方法：

``` java
public class JavaArrayExample {
    public void removeIndices(int[] indices) {
        // 程式碼寫在這裡...
    }
}
```

若要傳遞基本型別值的陣列，可以在 Kotlin 中執行以下操作：

```kotlin
val javaObj = JavaArrayExample()
val array = intArrayOf(0, 1, 2, 3)
javaObj.removeIndices(array)  // 將 int[] 傳遞給方法
```

在編譯為 JVM 位元組碼時，編譯器會最佳化對陣列的存取，因此不會引入額外的開銷：

```kotlin
val array = arrayOf(1, 2, 3, 4)
array[1] = array[1] * 2 // 不會產生對 get() 與 set() 的實際呼叫
for (x in array) { // 不會建立疊代器
    print(x)
}
```

即使使用索引進行導覽，也不會引入任何開銷：

```kotlin
for (i in array.indices) { // 不會建立疊代器
    array[i] += 2
}
```

最後，`in` 檢查也不會有任何開銷：

```kotlin
if (i in array.indices) { // 等同於 (i >= 0 && i < array.size)
    print(array[i])
}
```

## Java 可變參數 {id="java-varargs"}

Java 類別有時會對具有可變參數數量（varargs）的索引使用方法宣告：

``` java
public class JavaArrayExample {

    public void removeIndicesVarArg(int... indices) {
        // 程式碼寫在這裡...
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

由於 Java 沒有辦法標記適合使用運算子語法的方法，因此 Kotlin 允許將任何具有正確名稱與簽章的
Java 方法用作運算子多載和其他慣例（`invoke()` 等）。
不允許使用中綴呼叫語法呼叫 Java 方法。

## 受檢例外 {id="checked-exceptions"}

在 Kotlin 中，所有[例外都是非受檢的](exceptions.md)，這意味著編譯器不會強迫你擷取其中的任何例外。
因此，當你呼叫宣告了受檢例外的 Java 方法時，Kotlin 不會強制你執行任何操作：

```kotlin
fun render(list: List<*>, to: Appendable) {
    for (item in list) {
        to.append(item.toString()) // Java 會要求我們在此處擷取 IOException
    }
}
```

## Object 方法 {id="object-methods"}

當 Java 型別匯入 Kotlin 時，所有 `java.lang.Object` 型別的參照都會轉變為 `Any`。
由於 `Any` 不是特定於平台的，它僅將 `toString()`、`hashCode()` 與 `equals()` 宣告為其成員，
因此為了使 `java.lang.Object` 的其他成員可用，Kotlin 使用了[擴充函式](extensions.md)。

### `wait()` 與 `notify()` {id="wait-and-notify"}

方法 `wait()` 與 `notify()` 在 `Any` 型別的參照上不可用。通常不建議使用它們，
而是建議改用 `java.util.concurrent`。

如果必須呼叫這些方法，請透過 Java 物件存取它們並抑制 `PLATFORM_CLASS_MAPPED_TO_KOTLIN` 警告：

```kotlin
import java.util.LinkedList

class SimpleBlockingQueue<T>(private val capacity: Int) {
    private val queue = LinkedList<T>()

    // 特別使用 java.lang.Object 來存取 wait() 與 notify()
    // 在 Kotlin 中，標準的 'Any' 型別不會公開這些方法。
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

或者明確轉換為 `java.lang.Object` 並抑制 `PLATFORM_CLASS_MAPPED_TO_KOTLIN` 警告：

```kotlin
@Suppress("PLATFORM_CLASS_MAPPED_TO_KOTLIN")
(foo as java.lang.Object).wait()
```

### `getClass()` {id="getclass"}

若要擷取物件的 Java 類別，請在[類別參照](reflection.md#obtain-a-runtime-class)上使用 `java` 擴充屬性：

```kotlin
val fooClass = foo::class.java
```

上述程式碼使用了[綁定類別參照](lambdas.md#bound-and-unbound-references)。你也可以使用 `javaClass` 擴充屬性：

```kotlin
val fooClass = foo.javaClass
```

### `clone()` {id="clone"}

若要覆寫 `clone()`，你的類別需要實作 `kotlin.Cloneable`：

```kotlin
class Example : Cloneable {
    override fun clone(): Any { ... }
}
```

別忘了參閱《Effective Java（第 3 版）》（[Effective Java, 3rd Edition](https://www.oracle.com/technetwork/java/effectivejava-136174.html)）
第 13 條：*謹慎地覆寫 clone*。

### `finalize()` {id="finalize"}

若要覆寫 `finalize()`，你只需要直接宣告它，而不需要使用 `override` 關鍵字：

```kotlin
class C {
    protected fun finalize() {
        // finalization 邏輯
    }
}
```

根據 Java 的規則，`finalize()` 不得宣告為 `private`。

## 繼承 Java 類別 {id="inheritance-from-java-classes"}

在 Kotlin 中，一個類別最多只能有一個 Java 類別（以及任意數量的 Java 介面）作為超型別。

## 存取 static 成員 {id="accessing-static-members"}

Java 類別的 static 成員為這些類別構成了「伴隨物件」。你無法將此類「伴隨物件」
作為值來傳遞，但可以明確存取這些成員，例如：

```kotlin
if (Character.isLetter(a)) { ... }
```

若要存取[對應](#mapped-types)到 Kotlin 型別的 Java 型別的 static 成員，請使用
Java 型別的完全限定名稱：`java.lang.Integer.bitCount(foo)`。

## Java 反射 {id="java-reflection"}

Java 反射適用於 Kotlin 類別，反之亦然。如上所述，你可以使用 `instance::class.java`、
`ClassName::class.java` 或 `instance.javaClass` 透過 `java.lang.Class` 進入 Java 反射。
請勿為此目的使用 `ClassName.javaClass`，因為它參照的是 `ClassName` 的伴隨物件類別，
這等同於 `ClassName.Companion::class.java`，而不是 `ClassName::class.java`。

對於每個基本型別，都有兩個不同的 Java 類別，而 Kotlin 提供了獲取這兩者的方法。
例如，`Int::class.java` 將傳回表示基本型別本身的類別執行個體，
對應於 Java 中的 `Integer.TYPE`。若要取得相應包裝函式型別的類別，請使用
`Int::class.javaObjectType`，這相當於 Java 的 `Integer.class`。

其他支援的情況包括為 Kotlin 屬性取得 Java getter/setter 方法或支援欄位、為 Java 欄位取得 `KProperty`、為 `KFunction` 取得 Java 方法或建構函式，反之亦然。

## SAM 轉換 {id="sam-conversions"}

Kotlin 同時支援 Java 與 [Kotlin 介面](fun-interfaces.md)的 SAM 轉換。
對 Java 的這項支援意味著，只要介面方法的參數型別與 Kotlin 函式的參數型別相符，
Kotlin 函式常值就可以自動轉換為
具有單一非預設方法的 Java 介面的實作。

你可以使用它來建立 SAM 介面的執行個體：

```kotlin
val runnable = Runnable { println("This runs in a runnable") }
```

...以及在方法呼叫中使用：

```kotlin
val executor = ThreadPoolExecutor()
// Java 簽章：void execute(Runnable command)
executor.execute { println("This runs in a thread pool") }
```

如果 Java 類別有多個接受函式語言介面的方法，你可以透過
使用將 Lambda 轉換為特定 SAM 型別的配接器函式，來選擇需要呼叫的方法。這些配接器函式在需要時
也會由編譯器產生：

```kotlin
executor.execute(Runnable { println("This runs in a thread pool") })
```

> SAM 轉換僅適用於介面，不適用於抽象類別，即使抽象類別也只有一個
抽象方法。
>
{style="note"}

## 在 Kotlin 中使用 JNI {id="using-jni-with-kotlin"}

若要宣告以原生（C 或 C++）程式碼實作的函式，你需要使用 `external` 修飾詞標記它：

```kotlin
external fun foo(x: Int): Double
```

其餘程序與 Java 中的完全相同。

你也可以將屬性的 getter 與 setter 標記為 `external`：

```kotlin
var myProperty: String
    external get
    external set
```

在底層，這將建立兩個標記為 `external` 的函式 `getMyProperty` 與 `setMyProperty`。

## 在 Kotlin 中使用 Lombok 產生的宣告 {id="using-lombok-generated-declarations-in-kotlin"}

你可以在 Kotlin 程式碼中使用 Java 的 Lombok 產生的宣告。
如果你需要在同一個 Java/Kotlin 混合模組中產生並使用這些宣告，
可以在 [Lombok 編譯器外掛程式頁面](lombok.md)了解如何進行此操作。
如果你是從另一個模組呼叫此類宣告，則在編譯該模組時不需要使用此外掛程式。