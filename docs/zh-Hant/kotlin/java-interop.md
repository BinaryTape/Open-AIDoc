[//]: # (title: 在 Kotlin 中呼叫 Java)

Kotlin 的設計充分考慮了 Java 的互通性。在 Kotlin 中可以以自然的方式呼叫既有的 Java 程式碼，而 Java 也可以相當流暢地使用 Kotlin 程式碼。在本節中，我們將詳細介紹在 Kotlin 中呼叫 Java 程式碼的一些細節。

幾乎所有的 Java 程式碼都可以毫無問題地使用：

```kotlin
import java.util.*

fun demo(source: List<Int>) {
    val list = ArrayList<Int>()
    // 'for' 迴圈適用於 Java 集合：
    for (item in source) {
        list.add(item)
    }
    // 運算子慣例也同樣適用：
    for (i in 0..source.size - 1) {
        list[i] = source[i] // 呼叫了 get 和 set
    }
}
```

## Getter 和 Setter

遵循 Java 的 Getter 和 Setter 慣例（名稱以 `get` 開頭的無參數方法和名稱以 `set` 開頭的單參數方法）的方法在 Kotlin 中會表示為屬性。這類屬性也被稱為 *合成屬性*（synthetic properties）。
`Boolean` 存取子方法（Getter 名稱以 `is` 開頭且 Setter 名稱以 `set` 開頭）會表示為與 Getter 方法名稱相同的屬性。

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

上面的 `calendar.firstDayOfWeek` 就是一個合成屬性的例子。

請注意，如果 Java 類別只有 Setter，它在 Kotlin 中不會顯示為屬性，因為 Kotlin 不支援僅限 Setter 的屬性。

## Java 合成屬性參照

> 此功能為 [實驗性](components-stability.md#stability-levels-explained) 功能。它可能隨時被刪除或更改。我們建議您僅出於評估目的使用它。
>
{style="warning"}

從 Kotlin 1.8.20 開始，您可以建立對 Java 合成屬性的參照。考慮以下 Java 程式碼：

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

Kotlin 一直允許您撰寫 `person.age`，其中 `age` 是一個合成屬性。現在，您也可以建立對 `Person::age` 和 `person::age` 的參照。這同樣適用於 `name`。

```kotlin
val persons = listOf(Person("Jack", 11), Person("Sofie", 12), Person("Peter", 11))
    persons
         // 呼叫 Java 合成屬性的參照：
        .sortedBy(Person::age)
         // 透過 Kotlin 屬性語法呼叫 Java Getter：
        .forEach { person -> println(person.name) }
```

### 如何啟用 Java 合成屬性參照 {initial-collapse-state="collapsed" collapsible="true"}

要啟用此功能，請設定 `-language-version 2.1` 編譯器選項。在 Gradle 專案中，您可以透過在 `build.gradle(.kts)` 中加入以下內容來實現：

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

> 在 Kotlin 1.9.0 之前，要啟用此功能，您必須設定 `-language-version 1.9` 編譯器選項。
> 
{style="note"}

## 傳回 void 的方法

如果一個 Java 方法傳回 `void`，那麼在 Kotlin 中呼叫時它將傳回 `Unit`。如果有人使用了該傳回值，Kotlin 編譯器會在呼叫點對其進行指派，因為該值本身是預先確定的（即為 `Unit`）。

## 對於 Kotlin 關鍵字的 Java 識別符進行轉義

某些 Kotlin 關鍵字在 Java 中是有效的識別符：`in`、`object`、`is` 等。如果 Java 程式庫將 Kotlin 關鍵字用作方法名稱，您仍然可以使用反引號 (`) 字元對其進行轉義後呼叫：

```kotlin
foo.`is`(bar)
```

## Null 安全性與平台型別

Java 中的任何參照都可能為 `null`，這使得 Kotlin 對嚴格 null 安全性的要求對於來自 Java 的物件來說變得不切實際。Java 宣告的型別在 Kotlin 中會以不可明確表示的型別處理，稱為 [*平台型別*](https://kotlinlang.org/spec/type-system.html#platform-types)（platform types）。您不能在程式碼中明確地寫下這些不可明確表示的型別。因此，當一個平台值被指派給 Kotlin 變數時，您可以：

* 依靠型別推論。在這種情況下，該變數將具有推論出的平台型別。
* 選擇您預期的型別。Kotlin 允許使用可 null 型別和非 null 型別。

對於此類型別，null 檢查會放寬，因此它們的安全性保證與 Java 中相同（詳見[下文](#mapped-types)）。考慮以下範例：

```kotlin
val list = ArrayList<String>() // 非 null（建構函式結果）
list.add("Item")
val size = list.size // 非 null（原始型別 int）
val item = list[0] // 推論為平台型別（普通 Java 物件）
```

當您在平台型別的變數上呼叫方法時，Kotlin 不會在編譯期發出可 null 性錯誤，但呼叫可能會在執行時失敗，原因可能是發生 null 指標例外，或是 Kotlin 為了防止 null 傳遞而產生的斷言失敗：

```kotlin
item.substring(1) // 允許，但如果 item == null 則會拋出例外
```

您可以將平台型別的值指派給可 null 或非 null 的 Kotlin 變數。然而，如果您將該值指派給非 null 型別的變數，而該值在執行時實際上為 `null`，Kotlin 會拋出 `NullPointerException`。為了避免這種情況，請在您的 Kotlin 程式碼中加入明確的可 null 性：

```kotlin
val nullable: String? = item // 允許，始終有效
val notNull: String = item // 允許，可能在執行時失敗
```

如果您選擇非 null 型別，編譯器會在指派時發出一個斷言。這可以防止 Kotlin 的非 null 變數持有 null。當您將平台值傳遞給預期非 null 值的 Kotlin 函式以及在其他情況下，也會發出斷言。總體而言，編譯器會盡最大努力防止 null 在程式中廣泛傳播，儘管由於泛型的原因，有時無法完全消除這種情況。

### 平台型別的標記法

如上所述，平台型別不能在程式中明確提及，因此語言中沒有對應的語法。儘管如此，編譯器和 IDE 有時需要顯示它們（例如在錯誤訊息或參數提示中），因此有一種助記標記法：

* `T!` 代表 "`T` 或 `T?`"，
* `(Mutable)Collection<T>!` 代表 "Java 的 `T` 集合可能是可變的，也可能不是，可能是可 null 的，也可能不是"，
* `Array<(out) T>!` 代表 "Java 的 `T`（或 `T` 的子型別）陣列，可能是可 null 的，也可能不是"

當您在錯誤訊息或 IDE 工具提示中看到此標記法時，請為您的 Kotlin 變數加上明確的型別註解以恢復 null 安全性檢查，或者使用可 null 性註解從原始程式碼消除平台型別。

### 可 null 性註解

具有可 null 性註解的 Java 型別不會表示為平台型別，而是表示為實際的可 null 或非 null Kotlin 型別。編譯器支援多種風格的可 null 性註解，包括：

  * [JetBrains](https://www.jetbrains.com/idea/help/nullable-and-notnull-annotations.html)（來自 `org.jetbrains.annotations` 套件的 `@Nullable` 和 `@NotNull`）
  * [JSpecify](#jspecify-support) (`org.jspecify.annotations`)
  * Android (`com.android.annotations` 和 `android.support.annotations`)
  * [JSR-305](#jsr-305-support) (`javax.annotation`)
  * FindBugs (`edu.umd.cs.findbugs.annotations`)
  * Eclipse (`org.eclipse.jdt.annotation`)
  * [Lombok](lombok.md) (`lombok.NonNull`)
  * RxJava 3 (`io.reactivex.rxjava3.annotations`)
  * [Vert.x](https://vertx.io/) (`io.vertx.codegen.annotations`)

您可以使用以下編譯器選項指示編譯器針對特定的可 null 性註解回報可 null 性不相符：

```bash
-Xnullability-annotations=@<package-name>:<report-level>
``` 

為完全限定的可 null 性註解指定套件名稱以及以下其中一個回報層級：

* `ignore`：忽略可 null 性不相符
* `warn`：回報警告
* `strict`：回報錯誤。

> [JSpecify](#jspecify-support) 是唯一預設使用 `strict` 回報層級的受支援風格。使用它可以回報可 null 性註解上的錯誤，而無需額外配置。
>
{style="note"}

請在 [Kotlin 編譯器原始碼](https://github.com/JetBrains/kotlin/blob/master/core/compiler.common.jvm/src/org/jetbrains/kotlin/load/java/JvmAnnotationNames.kt)中查看受支援的可 null 性註解完整列表。

### 可變性註解

您可以為 Java 宣告加上可變性註解，以指定傳回的集合在 Kotlin 中是唯讀的還是可變的。如果您將該值指派給具有不同可變性的集合型別，編譯器會回報型別不相符。診斷的嚴重程度取決於具體的可變性註解。

編譯器支援多種可變性註解，包括：

* `kotlin.annotations.jvm.ReadOnly`
* `kotlin.annotations.jvm.Mutable`
* `org.jetbrains.annotations.Unmodifiable`
* `org.jetbrains.annotations.UnmodifiableView`

請在 [Kotlin 編譯器原始碼](https://github.com/JetBrains/kotlin/blob/master/core/compiler.common.jvm/src/org/jetbrains/kotlin/load/java/JvmAnnotationNames.kt)中查看受支援的可變性註解完整列表。

### 為型別引數與型別參數加上註解

您也可以為泛型型別的型別引數和型別參數加上註解，以提供其可 null 性資訊。

> 本節中的所有範例均使用來自 `org.jetbrains.annotations` 套件的 JetBrains 可 null 性註解。
>
{style="note"}

#### 型別引數

考慮 Java 宣告中的這些註解：

```java
@NotNull
Set<@NotNull String> toSet(@NotNull Collection<@NotNull String> elements) { ... }
```

它們在 Kotlin 中會產生以下簽章：

```kotlin
fun toSet(elements: (Mutable)Collection<String>) : (Mutable)Set<String> { ... }
```

當型別引數缺少 `@NotNull` 註解時，您會得到一個平台型別：

```kotlin
fun toSet(elements: (Mutable)Collection<String!>) : (Mutable)Set<String!> { ... }
```

Kotlin 還會考慮基底類別和介面之型別引數上的可 null 性註解。例如，有兩個具備以下簽章的 Java 類別：

```java
public class Base<T> {}
```

```java
public class Derived extends Base<@Nullable String> {}
```

在 Kotlin 程式碼中，將 `Derived` 的執行個體傳遞給預期 `Base<String>` 的地方會產生警告。

```kotlin
fun takeBaseOfNotNullStrings(x: Base<String>) {}

fun main() {
    takeBaseOfNotNullStrings(Derived()) // 警告：可 null 性不相符
}
```

`Derived` 的上界被設定為 `Base<String?>`，這與 `Base<String>` 不同。

了解更多關於 [Kotlin 中的 Java 泛型](#java-generics-in-kotlin)。

#### 型別參數

預設情況下，Kotlin 和 Java 中普通型別參數的可 null 性都是未定義的。在 Java 中，您可以使用可 null 性註解來指定它。讓我們為 `Base` 類別的型別參數加上註解：

```java
public class Base<@NotNull T> {}
```

當繼承自 `Base` 時，Kotlin 預期一個非 null 的型別引數或型別參數。因此，以下 Kotlin 程式碼會產生警告：

```kotlin
class Derived<K> : Base<K> {} // 警告：K 具有未定義的可 null 性
```

您可以透過指定上界 `K : Any` 來修正此問題。

Kotlin 還支援在 Java 型別參數的界限上加上可 null 性註解。讓我們為 `Base` 加入界限：

```java
public class BaseWithBound<T extends @NotNull Number> {}
```

Kotlin 會將其翻譯如下：

```kotlin
class BaseWithBound<T : Number> {}
```

因此傳遞可 null 型別作為型別引數或型別參數會產生警告。

針對型別引數與型別參數標註註解的功能適用於 Java 8 目標或更高版本。該功能要求可 null 性註解支援 `TYPE_USE` 目標（`org.jetbrains.annotations` 在版本 15 及以上支援此目標）。

> 如果一個可 null 性註解除了 `TYPE_USE` 目標外，還支援其他適用於該型別的目標，則 `TYPE_USE` 優先。例如，如果 `@Nullable` 同時具有 `TYPE_USE` 和 `METHOD` 目標，則 Java 方法簽章 `@Nullable String[] f()` 在 Kotlin 中會變成 `fun f(): Array<String?>!`。
>
{style="note"}

### JSpecify 支援

Kotlin 支援 [JSpecify](https://jspecify.dev/) 可 null 性註解，它為 Java 可 null 性提供了一套統一的註解。JSpecify 允許您為 Java 宣告提供詳細的可 null 性資訊，幫助 Kotlin 在處理 Java 程式碼時保持 null 安全性。

Kotlin 支援 `org.jspecify.annotations` 套件中的以下註解：

* `@Nullable` 將型別標記為可 null。
* `@NonNull` 將型別標記為非 null。
* `@NullMarked` 預設將某個範圍內（例如類別或套件）的所有型別標記為非 null，除非另有註解。

  此註解不適用於區域變數和 [型別變數（泛型）](https://jspecify.dev/docs/user-guide/#using-type-variables-in-generic-types)。型別變數在提供特定的可 null 或非 null 型別之前，保持為「null 不可知」狀態。

* `@NullUnmarked` 反轉 `@NullMarked` 的效果，將該範圍內的所有型別標記為 [平台型別](#null-safety-and-platform-types)。

考慮以下帶有 JSpecify 註解的 Java 類別：
 
```java
// Java
import org.jspecify.annotations.*;

@NullMarked
public class InventoryService {
    public String notNull() { return ""; }
    public @Nullable String nullable() { return null; }
}
```
 
在 Kotlin 中，這些會被視為常規的可 null 和非 null 型別，而非 [平台型別](#null-safety-and-platform-types)：
 
```kotlin
// Kotlin
fun test(inventory: InventoryService) {
   inventory.notNull().length // OK
   inventory.nullable().length // 錯誤：僅允許安全呼叫 (?.) 或非 null 斷言 (!!) 呼叫
}
```

預設情況下，Kotlin 編譯器會將 JSpecify 註解的可 null 性不相符視為錯誤。您可以使用以下編譯器選項自訂 JSpecify 可 null 性診斷的嚴重程度：

```bash
-Xjspecify-annotations=<report-level>
```

可用的回報層級為：

| 層級     | 描述                                       |
|----------|------------------------------------------|
| `strict` | 回報可 null 性不相符的錯誤（預設）。           |
| `warn`   | 回報警告。                                 |
| `ignore` | 忽略可 null 性不相符。                     |

> 有關 JSpecify 註解的更多資訊，請參閱 [JSpecify 使用者指南](https://jspecify.dev/docs/user-guide)。
> 
{type="tip"}

### JSR-305 支援

支援使用 [JSR-305](https://jcp.org/en/jsr/detail?id=305) 中定義的 [`@Nonnull`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/Nonnull.html) 註解來表示 Java 型別的可 null 性。

如果 `@Nonnull(when = ...)` 的值是 `When.ALWAYS`，則被註解的型別會被視為非 null；`When.MAYBE` 和 `When.NEVER` 表示可 null 型別；而 `When.UNKNOWN` 則強制該型別為 [平台型別](#null-safety-and-platform-types)。

程式庫可以針對 JSR-305 註解進行編譯，但對於程式庫取用者來說，沒有必要將註解構件（例如 `jsr305.jar`）設定為編譯相依性。Kotlin 編譯器可以在 classpath 中沒有該註解的情況下，從程式庫中讀取 JSR-305 註解。

也支援 [自訂可 null 性限定符 (KEEP-79)](https://github.com/Kotlin/KEEP/blob/master/proposals/jsr-305-custom-nullability-qualifiers.md)（見下文）。

#### 型別限定符別名

如果一個註解型別同時被標註了 [`@TypeQualifierNickname`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/meta/TypeQualifierNickname.html) 和 JSR-305 的 `@Nonnull`（或其另一個別名，如 `@CheckForNull`），那麼該註解型別本身就會被用於檢索精確的可 null 性，並且其含義與該可 null 性註解相同：

```java
@TypeQualifierNickname
@Nonnull(when = When.ALWAYS)
@Retention(RetentionPolicy.RUNTIME)
public @interface MyNonnull {
}

@TypeQualifierNickname
@CheckForNull // 另一個型別限定符別名的別名
@Retention(RetentionPolicy.RUNTIME)
public @interface MyNullable {
}

interface A {
    @MyNullable String foo(@MyNonnull String x);
    // 在 Kotlin 中（嚴格模式）：`fun foo(x: String): String?`

    String bar(List<@MyNonnull String> x);
    // 在 Kotlin 中（嚴格模式）：`fun bar(x: List<String>!): String!`
}
```

#### 預設型別限定符

[`@TypeQualifierDefault`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/meta/TypeQualifierDefault.html) 允許引入註解，當應用這些註解時，可以在被標註元素的範圍內定義預設的可 null 性。

此類註解型別本身應標註 `@Nonnull`（或其別名）以及帶有一個或多個 `ElementType` 值的 `@TypeQualifierDefault(...)`：

* `ElementType.METHOD` 用於方法的傳回型別
* `ElementType.PARAMETER` 用於值參數
* `ElementType.FIELD` 用於欄位
* `ElementType.TYPE_USE` 用於任何型別，包括型別引數、型別參數的上界和萬用字元型別

當型別本身沒有標註可 null 性註解時，會使用預設的可 null 性，並且預設值由標註了預設型別限定符註解的最內層封閉元素確定，該註解的 `ElementType` 與型別的使用方式相符。

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

    @NotNullApi // 覆蓋介面的預設值
    String bar(String x, @Nullable String y); // fun bar(x: String, y: String?): String

    // 由於 `@NullableApi` 具有 `TYPE_USE` 元素型別，
    // List<String> 型別引數被視為可 null：
    String baz(List<String> x); // fun baz(List<String?>?): String?

    // x 參數的型別保持為平台型別，因為存在明確的
    // 標記為 UNKNOWN 的可 null 性註解：
    String qux(@Nonnull(when = When.UNKNOWN) String x); // fun baz(x: String!): String?
}
```

> 本範例中的型別僅在啟用嚴格模式時生效；否則，它們仍為平台型別。請參閱 [`@UnderMigration` 註解](#undermigration-annotation) 和 [編譯器配置](#compiler-configuration) 章節。
>
{style="note"}

也支援套件級別的預設可 null 性：

```java
// 檔案：test/package-info.java
@NonNullApi // 將 'test' 套件中的所有型別預設宣告為非 null
package test;
```

#### @UnderMigration 註解

程式庫維護者可以使用 `@UnderMigration` 註解（在單獨的構件 `kotlin-annotations-jvm` 中提供）來定義可 null 性型別限定符的遷移狀態。

`@UnderMigration(status = ...)` 中的狀態值指定了編譯器如何處理 Kotlin 中標註型別的不當用法（例如，將標註了 `@MyNullable` 的型別值用作非 null）：

* `MigrationStatus.STRICT` 使註解像任何普通的可 null 性註解一樣運作，即針對不當用法回報錯誤，並影響標註宣告在 Kotlin 中顯示的型別
* `MigrationStatus.WARN`：不當用法會回報為編譯警告而非錯誤，但標註宣告中的型別仍保持為平台型別
* `MigrationStatus.IGNORE` 使編譯器完全忽略該可 null 性註解

程式庫維護者可以將 `@UnderMigration` 狀態同時加入到型別限定符別名和預設型別限定符中：

```java
@Nonnull(when = When.ALWAYS)
@TypeQualifierDefault({ElementType.METHOD, ElementType.PARAMETER})
@UnderMigration(status = MigrationStatus.WARN)
public @interface NonNullApi {
}

// 類別中的型別是非 null 的，但僅回報警告
// 因為 `@NonNullApi` 標註了 `@UnderMigration(status = MigrationStatus.WARN)`
@NonNullApi
public class Test {}
```

> 可 null 性註解的遷移狀態不會被其型別限定符別名繼承，但會應用於其在預設型別限定符中的用法。
>
{style="note"}

如果一個預設型別限定符使用了型別限定符別名，且它們都被標註了 `@UnderMigration`，則使用預設型別限定符的狀態。

#### 編譯器配置

可以透過加入帶有以下選項（及其組合）的 `-Xjsr305` 編譯器旗標來配置 JSR-305 檢查：

* `-Xjsr305={strict|warn|ignore}` 用於設定非 `@UnderMigration` 註解的行為。自定義可 null 性限定符，尤其是 `@TypeQualifierDefault`，已經分佈在許多知名程式庫中，使用者在更新到包含 JSR-305 支援的 Kotlin 版本時，可能需要平滑遷移。自 Kotlin 1.1.60 起，此旗標僅影響非 `@UnderMigration` 註解。

* `-Xjsr305=under-migration:{strict|warn|ignore}` 用於覆蓋 `@UnderMigration` 註解的行為。使用者可能對程式庫的遷移狀態有不同的看法：他們可能希望在官方遷移狀態為 `WARN` 時就報錯，反之亦然，他們可能希望推遲某些錯誤的回報，直到完成遷移。

* `-Xjsr305=@<fq.name>:{strict|warn|ignore}` 用於覆蓋單個註解的行為，其中 `<fq.name>` 是註解的完全限定類名。可以針對不同的註解多次出現。這對於管理特定程式庫的遷移狀態非常有用。

`strict`、`warn` 和 `ignore` 值的含義與 `MigrationStatus` 相同，且只有 `strict` 模式會影響標註宣告在 Kotlin 中顯示的型別。

> 注意：內建的 JSR-305 註解 [`@Nonnull`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/Nonnull.html)、[`@Nullable`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/3.0.1/javax/annotation/Nullable.html) 和 [`@CheckForNull`](https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/latest/javax/annotation/CheckForNull.html) 始終處於啟用狀態，且會影響 Kotlin 中標註宣告的型別，無論 `-Xjsr305` 旗標的編譯器配置如何。
>
{style="note"}

例如，在編譯器引數中加入 `-Xjsr305=ignore -Xjsr305=under-migration:ignore -Xjsr305=@org.library.MyNullable:warn` 會使編譯器針對標註了 `@org.library.MyNullable` 的型別不當用法產生警告，並忽略所有其他 JSR-305 註解。

預設行為與 `-Xjsr305=warn` 相同。`strict` 值應被視為實驗性的（未來可能會對其加入更多檢查）。

## 對應型別

Kotlin 對某些 Java 型別進行了特殊處理。這些型別不會從 Java 中「照原樣」載入，而是被 *對應* 到對應的 Kotlin 型別。這種對應僅在編譯時期有意義，執行時的表示形式保持不變。Java 的原始型別會對應到對應的 Kotlin 型別（同時考慮 [平台型別](#null-safety-and-platform-types)）：

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

一些非原始的內建類別也會進行對應：

| **Java 型別** | **Kotlin 型別**  |
|---------------|------------------|
| `java.lang.Object`       | `kotlin.Any!`    |
| `java.lang.Cloneable`    | `kotlin.Cloneable!`    |
| `java.lang.Comparable`   | `kotlin.Comparable!`    |
| `java.lang.Enum`         | `kotlin.Enum!`    |
| `java.lang.annotation.Annotation`   | `kotlin.Annotation!`    |
| `java.lang.CharSequence` | `kotlin.CharSequence!`   |
| `java.lang.String`       | `kotlin.String!`   |
| `java.lang.Number`       | `kotlin.Number!`     |
| `java.lang.Throwable`    | `kotlin.Throwable!`    |

Java 的裝箱原始型別會對應到可 null 的 Kotlin 型別：

| **Java 型別**           | **Kotlin 型別**  |
|-------------------------|------------------|
| `java.lang.Byte`        | `kotlin.Byte?`   |
| `java.lang.Short`       | `kotlin.Short?`  |
| `java.lang.Integer`     | `kotlin.Int?`    |
| `java.lang.Long`        | `kotlin.Long?`   |
| `java.lang.Character`   | `kotlin.Char?`   |
| `java.lang.Float`       | `kotlin.Float?`  |
| `java.lang.Double`      | `kotlin.Double?`  |
| `java.lang.Boolean`     | `kotlin.Boolean?` |

請注意，用作型別參數的裝箱原始型別會對應到平台型別：例如，`List<java.lang.Integer>` 在 Kotlin 中會變成 `List<Int!>`。

集合型別在 Kotlin 中可能是唯讀的或可變的，因此 Java 的集合對應如下（此表格中的所有 Kotlin 型別均位於 `kotlin.collections` 套件中）：

| **Java 型別** | **Kotlin 唯讀型別**  | **Kotlin 可變型別** | **載入的平台型別** |
|---------------|----------------------------|-------------------------|--------------------------|
| `Iterator<T>`        | `Iterator<T>`        | `MutableIterator<T>`            | `(Mutable)Iterator<T>!`            |
| `Iterable<T>`        | `Iterable<T>`        | `MutableIterable<T>`            | `(Mutable)Iterable<T>!`            |
| `Collection<T>`      | `Collection<T>`      | `MutableCollection<T>`          | `(Mutable)Collection<T>!`          |
| `Set<T>`             | `Set<T>`             | `MutableSet<T>`                 | `(Mutable)Set<T>!`                 |
| `List<T>`            | `List<T>`            | `MutableList<T>`                | `(Mutable)List<T>!`                |
| `ListIterator<T>`    | `ListIterator<T>`    | `MutableListIterator<T>`        | `(Mutable)ListIterator<T>!`        |
| `Map<K, V>`          | `Map<K, V>`          | `MutableMap<K, V>`              | `(Mutable)Map<K, V>!`              |
| `Map.Entry<K, V>`    | `Map.Entry<K, V>`    | `MutableMap.MutableEntry<K,V>` | `(Mutable)Map.(Mutable)Entry<K, V>!` |

Java 的陣列對應如[下文](#java-arrays)所述：

| **Java 型別** | **Kotlin 型別**                |
|---------------|--------------------------------|
| `int[]`       | `kotlin.IntArray!`             |
| `String[]`    | `kotlin.Array<(out) String!>!` |

>這些 Java 型別的 static 成員無法直接透過 Kotlin 型別的 [伴生物件](object-declarations.md#companion-objects) 進行存取。要呼叫它們，請使用 Java 型別的完全限定名稱，例如 `java.lang.Integer.toHexString(foo)`。
>
{style="note"}

## Kotlin 中的 Java 泛型

Kotlin 的泛型與 Java 的略有不同（參見 [泛型](generics.md)）。將 Java 型別匯入 Kotlin 時，會進行以下轉換：

* Java 的萬用字元（wildcards）會轉換為型別投影：
  * `Foo<? extends Bar>` 變為 `Foo<out Bar!>!`
  * `Foo<? super Bar>` 變為 `Foo<in Bar!>!`

* Java 的原始型別（raw types）會轉換為星號投影（star projections）：
  * `List` 變為 `List<*>!`，即 `List<out Any?>!`

與 Java 一樣，Kotlin 的泛型在執行時不會被保留：物件不會攜帶有關傳遞給其建構函式的實際型別引數的資訊。例如，`ArrayList<Integer>()` 與 `ArrayList<Character>()` 是無法區分的。這使得進行考慮泛型的 `is` 檢查變得不可能。Kotlin 僅允許對星號投影的泛型型別進行 `is` 檢查：

```kotlin
if (a is List<Int>) // 錯誤：無法檢查它是否真的是 Int 列表
// 但是
if (a is List<*>) // OK：不對列表內容做任何保證
```

## Java 陣列

與 Java 不同，Kotlin 中的陣列是不變的（invariant）。這意味著 Kotlin 不會讓您將 `Array<String>` 指派給 `Array<Any>`，從而防止了可能的執行時失敗。將子類別的陣列作為超類別的陣列傳遞給 Kotlin 方法也是禁止的，但對於 Java 方法，這透過形式為 `Array<(out) String>!` 的 [平台型別](#null-safety-and-platform-types) 是被允許的。

在 Java 平台上，陣列與原始資料型別一起使用，以避免裝箱/拆箱操作的成本。由於 Kotlin 隱藏了這些實作細節，因此需要一種解決方法來與 Java 程式碼互動。針對每種原始陣列型別都有專門的類別（`IntArray`、`DoubleArray`、`CharArray` 等）來處理這種情況。它們與 `Array` 類別無關，並會編譯為 Java 的原始陣列以獲得最佳效能。

假設有一個 Java 方法接受一個 int 索引陣列：

``` java
public class JavaArrayExample {
    public void removeIndices(int[] indices) {
        // 程式碼...
    }
}
```

要傳遞原始值的陣列，您可以在 Kotlin 中執行以下操作：

```kotlin
val javaObj = JavaArrayExample()
val array = intArrayOf(0, 1, 2, 3)
javaObj.removeIndices(array)  // 將 int[] 傳遞給方法
```

在編譯為 JVM 位元組碼時，編譯器會優化對陣列的存取，因此不會引入任何開銷：

```kotlin
val array = arrayOf(1, 2, 3, 4)
array[1] = array[1] * 2 // 不會產生對 get() 和 set() 的實際呼叫
for (x in array) { // 不會建立反覆運算器
    print(x)
}
```

即使您使用索引進行遍歷，也不會引入任何開銷：

```kotlin
for (i in array.indices) { // 不會建立反覆運算器
    array[i] += 2
}
```

最後，`in` 檢查也沒有任何開銷：

```kotlin
if (i in array.indices) { // 等同於 (i >= 0 && i < array.size)
    print(array[i])
}
```

## Java 可變參數 (varargs)

Java 類別有時會對使用可變參數（varargs）的方法進行宣告：

``` java
public class JavaArrayExample {

    public void removeIndicesVarArg(int... indices) {
        // 程式碼...
    }
}
```

在這種情況下，您需要使用展開運算子 `*` 來傳遞 `IntArray`：

```kotlin
val javaObj = JavaArrayExample()
val array = intArrayOf(0, 1, 2, 3)
javaObj.removeIndicesVarArg(*array)
```

## 運算子

由於 Java 沒有辦法標記哪些方法適合使用運算子語法，因此 Kotlin 允許將任何具有正確名稱和簽章的 Java 方法用作運算子多載和其他慣例（`invoke()` 等）。不允許使用中綴呼叫（infix call）語法來呼叫 Java 方法。

## 受檢例外 (Checked exceptions)

在 Kotlin 中，所有 [例外都是非受檢的](exceptions.md)，這意味著編譯器不會強制您擷取其中任何一個。因此，當您呼叫宣告了受檢例外的 Java 方法時，Kotlin 不會強制您執行任何操作：

```kotlin
fun render(list: List<*>, to: Appendable) {
    for (item in list) {
        to.append(item.toString()) // Java 會要求我們在這裡擷取 IOException
    }
}
```

## 物件方法

當 Java 型別匯入 Kotlin 時，所有 `java.lang.Object` 型別的參照都會轉換為 `Any`。由於 `Any` 不是平台特定的，它僅宣告 `toString()`、`hashCode()` 和 `equals()` 作為其成員，因此為了使 `java.lang.Object` 的其他成員可用，Kotlin 使用了 [擴充函式](extensions.md)。

### `wait()` 和 `notify()`

在 `Any` 型別的參照上無法使用 `wait()` 和 `notify()` 方法。通常不建議使用它們，而是建議使用 `java.util.concurrent`。

如果您必須呼叫這些方法，請透過 Java 物件存取它們，並隱藏 `PLATFORM_CLASS_MAPPED_TO_KOTLIN` 警告：

```kotlin
import java.util.LinkedList

class SimpleBlockingQueue<T>(private val capacity: Int) {
    private val queue = LinkedList<T>()

    // 特別使用 java.lang.Object 來存取 wait() 和 notify()
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

或者明確轉型為 `java.lang.Object` 並隱藏 `PLATFORM_CLASS_MAPPED_TO_KOTLIN` 警告：

```kotlin
@Suppress("PLATFORM_CLASS_MAPPED_TO_KOTLIN")
(foo as java.lang.Object).wait()
```

### `getClass()`

要取得物件的 Java 類別，請在 [類別參照](reflection.md#class-references) 上使用 `java` 擴充屬性：

```kotlin
val fooClass = foo::class.java
```

上述程式碼使用了 [綁定的類別參照](reflection.md#bound-class-references)。您也可以使用 `javaClass` 擴充屬性：

```kotlin
val fooClass = foo.javaClass
```

### `clone()`

要覆寫 `clone()`，您的類別需要擴充 `kotlin.Cloneable`：

```kotlin
class Example : Cloneable {
    override fun clone(): Any { ... }
}
```

不要忘記 [Effective Java, 3rd Edition](https://www.oracle.com/technetwork/java/effectivejava-136174.html) 中的第 13 條：*謹慎覆寫 clone*。

### `finalize()`

要覆寫 `finalize()`，您只需宣告它即可，不需要使用 `override` 關鍵字：

```kotlin
class C {
    protected fun finalize() {
        // 完結邏輯
    }
}
```

根據 Java 的規則，`finalize()` 不得為 `private`。

## 繼承 Java 類別

Kotlin 中的類別最多只能將一個 Java 類別（以及任意數量的 Java 介面）作為超型別。

## 存取 static 成員

Java 類別的 static 成員會為這些類別形成「伴生物件」。您不能將此類「伴生物件」當作值來傳遞，但可以明確存取其成員，例如：

```kotlin
if (Character.isLetter(a)) { ... }
```

要存取[對應](#mapped-types)到 Kotlin 型別的 Java 型別的 static 成員，請使用 Java 型別的完全限定名稱：`java.lang.Integer.bitCount(foo)`。

## Java 反射

Java 反射適用於 Kotlin 類別，反之亦然。如上所述，您可以使用 `instance::class.java`、`ClassName::class.java` 或 `instance.javaClass` 透過 `java.lang.Class` 進入 Java 反射。不要為了這個目的而使用 `ClassName.javaClass`，因為它引用的是 `ClassName` 的伴生物件類別，這與 `ClassName.Companion::class.java` 相同，而非 `ClassName::class.java`。

對於每種原始型別，都有兩個不同的 Java 類別，Kotlin 提供了取得這兩者的方法。例如，`Int::class.java` 將傳回代表原始型別本身的類別執行個體，對應於 Java 中的 `Integer.TYPE`。要取得對應包裝型別的類別，請使用 `Int::class.javaObjectType`，這相當於 Java 的 `Integer.class`。

其他支援的情況包括為 Kotlin 屬性獲取 Java Getter/Setter 方法或支援欄位、為 Java 欄位獲取 `KProperty`、為 `KFunction` 獲取 Java 方法或建構函式，反之亦然。

## SAM 轉換

Kotlin 支援對 Java 和 [Kotlin 介面](fun-interfaces.md) 進行 SAM 轉換。對 Java 的這種支援意指 Kotlin 函式常值可以自動轉換為具有單個非預設方法的 Java 介面的實作，只要該介面方法的參數型別與 Kotlin 函式的參數型別相符即可。

您可以用它來建立 SAM 介面的執行個體：

```kotlin
val runnable = Runnable { println("This runs in a runnable") }
```

...以及在方法呼叫中：

```kotlin
val executor = ThreadPoolExecutor()
// Java 簽章：void execute(Runnable command)
executor.execute { println("This runs in a thread pool") }
```

如果 Java 類別有多個接受函數式介面的方法，您可以透過使用將 Lambda 轉換為特定 SAM 型別的配接器函式來選擇您需要呼叫的方法。編譯器在需要時也會產生這些配接器函式：

```kotlin
executor.execute(Runnable { println("This runs in a thread pool") })
```

> SAM 轉換僅適用於介面，不適用於抽象類別，即使這些類別也只有單個抽象方法。
>
{style="note"}

## 在 Kotlin 中使用 JNI

要宣告一個在原生（C 或 C++）程式碼中實作的函式，您需要用 `external` 修飾符標記它：

```kotlin
external fun foo(x: Int): Double
```

其餘過程的工作方式與 Java 完全相同。

您也可以將屬性的 Getter 和 Setter 標記為 `external`：

```kotlin
var myProperty: String
    external get
    external set
```

在幕後，這將建立兩個函式 `getMyProperty` 和 `setMyProperty`，兩者都被標記為 `external`。

## 在 Kotlin 中使用 Lombok 產生的宣告

您可以在 Kotlin 程式碼中使用 Java 中由 Lombok 產生的宣告。如果您需要在同一個 Java/Kotlin 混合模組中產生並使用這些宣告，您可以在 [Lombok 編譯器外掛程式頁面](lombok.md)了解如何執行此操作。如果您從另一個模組呼叫此類宣告，則不需要使用此外掛程式來編譯該模組。