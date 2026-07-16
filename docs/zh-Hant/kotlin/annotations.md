[//]: # (title: 註解)

註解是用來將元資料附加至程式碼元素的標籤。工具與架構會在編譯期間與執行階段處理這些元資料，並以此為基礎執行不同的操作。

您可以為程式碼加上註解，以簡化並自動化常見任務，例如產生樣板程式碼、強制執行編碼標準或撰寫文件。

> 如果您想開發自己的註解處理器，可以使用 [Kotlin Symbol Processing (KSP)](ksp-overview.md) API。
>
{style="tip"}

## 宣告 (Declaration)

註解是一種特殊的類別。要宣告註解，請在類別宣告前使用 `annotation` 關鍵字：

```kotlin
annotation class Fancy
```

註解的其他屬性可以透過使用元註解來標註註解類別：

  * [`@Target`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.annotation/-target/index.html) 指定可以使用該註解標註的元素類型（例如類別、函式、屬性與運算式）；
  * [`@Retention`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.annotation/-retention/index.html) 指定註解是否儲存在編譯後的類別檔案中，以及在執行階段是否能透過反射進行檢視（預設兩者皆為 true）；
  * [`@Repeatable`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.annotation/-repeatable/index.html) 允許在單個元素上多次使用相同的註解；
  * [`@MustBeDocumented`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.annotation/-must-be-documented/index.html) 指定註解是公有 API 的一部分，且應包含在產生的 API 文件中顯示的類別或方法簽章中。

```kotlin
@Target(AnnotationTarget.CLASS, AnnotationTarget.FUNCTION,
        AnnotationTarget.TYPE_PARAMETER, AnnotationTarget.VALUE_PARAMETER,
        AnnotationTarget.EXPRESSION)
@Retention(AnnotationRetention.SOURCE)
@MustBeDocumented
annotation class Fancy
```

## 用法 (Usage)

```kotlin
@Fancy class Foo {
    @Fancy fun baz(@Fancy foo: Int): Int {
        return (@Fancy 1)
    }
}
```

如果您需要為類別的主建構函數加上註解，則需要在建構函式宣告中加入 `constructor` 關鍵字，並在該關鍵字前加上註解：

```kotlin
class Foo @Inject constructor(dependency: MyDependency) { ... }
```

您也可以為屬性存取子加上註解：

```kotlin
class Foo {
    var x: MyDependency? = null
        @Inject set
}
```

## 建構函式 (Constructors)

註解可以擁有帶有參數的建構函式。

```kotlin
annotation class Special(val why: String)

@Special("example") class Foo {}
```

允許的參數型別為：

 * 對應於 Java 基本型別的型別（Int、Long 等）
 * 字串
 * 類別（`Foo::class`）
 * 列舉
 * 其他註解
 * 以上型別的陣列

註解參數不能具有可為 null 的型別，因為 JVM 不支援將 `null` 儲存為註解屬性的值。

如果將註解用作另一個註解的參數，其名稱前不加 `@` 字元：

```kotlin
annotation class ReplaceWith(val expression: String)

annotation class Deprecated(
        val message: String,
        val replaceWith: ReplaceWith = ReplaceWith(""))

@Deprecated("This function is deprecated, use === instead", ReplaceWith("this === other"))
```

如果您需要指定一個類別作為註解的引數，請使用 Kotlin 類別 ([KClass](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-class/index.html))。Kotlin 編譯器會自動將其轉換為 Java 類別，以便 Java 程式碼可以正常存取註解與引數。

```kotlin

import kotlin.reflect.KClass

annotation class Ann(val arg1: `KClass<*>`, val arg2: KClass<out Any>)

@Ann(String::class, Int::class) class MyClass
```

## 具現化 (Instantiation)

在 Java 中，註解型別是介面的一種形式，因此您可以實作它並使用執行個體。作為此機制的替代方案，Kotlin 允許您在任意程式碼中呼叫註解類別的建構函式，並以類似方式使用產生的執行個體。

```kotlin
annotation class InfoMarker(val info: String)

fun processInfo(marker: InfoMarker): Unit = TODO()

fun main(args: Array<String>) {
    if (args.isNotEmpty())
        processInfo(getAnnotationReflective(args))
    else
        processInfo(InfoMarker("default"))
}
```

在 [此 KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/annotation-instantiation.md) 中進一步了解註解類別的具現化。

## Lambda

註解也可以用於 Lambda。它們將套用至產生 Lambda 主體的 `invoke()` 方法。這對於像 [Quasar](https://docs.paralleluniverse.co/quasar/) 這樣的架構非常有用，該架構使用註解進行並行控制。

```kotlin
annotation class Suspendable

val f = @Suspendable { Fiber.sleep(10) }
```

## 註解使用點目標 (Annotation use-site targets)

當您為屬性或主建構函數參數加上註解時，會從對應的 Kotlin 元素產生多個 Java 元素，因此在產生的 Java 位元組碼中註解有多個可能的位置。若要指定註解應如何產生，請使用以下語法：

```kotlin
class Example(@field:Ann val foo,    // 僅標註 Java 欄位
              @get:Ann val bar,      // 僅標註 Java getter
              @param:Ann val quux)   // 僅標註 Java 建構函式參數
```

相同的語法也可用於標註整個檔案。若要執行此操作，請在檔案的最頂層，在套件指示詞之前或在所有匯入之前（如果檔案在預設套件中），放置一個目標為 `file` 的註解：

```kotlin
@file:JvmName("Foo")

package org.jetbrains.demo
```

如果您有多個具有相同目標的註解，可以透過在目標後添加方括號並將所有註解放入方括號內來避免重複目標（`all` 元目標除外）：

```kotlin
class Example {
     @set:[Inject VisibleForTesting]
     var collaborator: Collaborator
}
```

支援的使用點目標完整清單如下：

  * `file`
  * `field`
  * `property`（具有此目標的註解對 Java 不可見）
  * `get`（屬性 getter）
  * `set`（屬性 setter）
  * `all`（屬性的實驗性元目標，其目的與用法請參閱 [下方](#all-meta-target)）
  * `receiver`（擴充方法或屬性的接收者參數）

    要標註擴充方法的接收者參數，請使用以下語法：

    ```kotlin
    fun @receiver:Fancy String.myExtension() { ... }
    ```

  * `param`（建構函式參數）
  * `setparam`（屬性 setter 參數）
  * `delegate`（儲存委派屬性之委派執行個體的欄位）

### 未指定使用點目標時的預設值 (Defaults when no use-site targets are specified)

如果您未指定使用點目標，則會根據所使用註解的 `@Target` 註解來選擇目標。如果有多個適用的目標，則會使用以下清單中第一個適用的目標：

* `param`
* `property`
* `field`

讓我們使用 [來自 Jakarta Bean Validation 的 `@Email` 註解](https://jakarta.ee/specifications/bean-validation/3.0/apidocs/jakarta/validation/constraints/email)：

```java
@Target(value={METHOD,FIELD,ANNOTATION_TYPE,CONSTRUCTOR,PARAMETER,TYPE_USE})
public @interface Email { }
```

使用此註解，請考慮以下範例：

```kotlin
data class User(val username: String,
                // @Email 相當於 @param:Email
                @Email val email: String) {
    // @Email 相當於 @field:Email
    @Email val secondaryEmail: String? = null
}
```

Kotlin 2.2.0 引入了一項實驗性的預設規則，這應該會使註解傳播到參數、欄位與屬性的行為更可預測。

根據新規則，如果有多個適用目標，將按如下方式選擇一個或多個：

* 如果建構函式參數目標 (`param`) 適用，則使用它。
* 如果屬性目標 (`property`) 適用，則使用它。
* 如果在 `property` 不適用時欄位目標 (`field`) 適用，則使用 `field`。

使用相同的範例：

```kotlin
data class User(val username: String,
                // @Email 現在相當於 @param:Email @field:Email
                @Email val email: String) {
    // @Email 仍然相當於 @field:Email
    @Email val secondaryEmail: String? = null
}
```

如果有多個目標，且 `param`、`property` 或 `field` 皆不適用，則該註解無效。

若要啟用新的預設規則，請在您的 Gradle 配置中使用以下行：

```kotlin
// build.gradle.kts
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xannotation-default-target=param-property")
    }
}
```

每當您想使用舊行為時，您可以：

* 在特定情況下，明確指定所需的目標，例如使用 `@param:Annotation` 而非 `@Annotation`。
* 對於整個專案，在您的 Gradle 建置檔案中使用此旗標：

    ```kotlin
    // build.gradle.kts
    kotlin {
        compilerOptions {
            freeCompilerArgs.add("-Xannotation-default-target=first-only")
        }
    }
    ```

### `all` 元目標 (`all` meta-target)

<primary-label ref="experimental-opt-in"/>

`all` 目標可以更輕鬆地將相同的註解不僅套用至參數、屬性或欄位，還套用至對應的 getter 與 setter。

具體來說，標記為 `all` 的註解會傳播（如果適用）：

* 如果屬性是在主建構函數中定義的，則傳播到建構函式參數 (`param`)。
* 傳播到屬性本身 (`property`)。
* 如果屬性具有支援欄位，則傳播到該支援欄位 (`field`)。
* 傳播到 getter (`get`)。
* 如果屬性定義為 `var`，則傳播到 setter 參數 (`setparam`)。
* 如果類別具有 `@JvmRecord` 註解，則傳播到僅限 Java 的目標 `RECORD_COMPONENT`。

讓我們使用 [來自 Jakarta Bean Validation 的 `@Email` 註解](https://jakarta.ee/specifications/bean-validation/3.0/apidocs/jakarta/validation/constraints/email)，其定義如下：

```java
@Target(value={METHOD,FIELD,ANNOTATION_TYPE,CONSTRUCTOR,PARAMETER,TYPE_USE})
public @interface Email { }
```

在下面的範例中，此 `@Email` 註解套用至所有相關目標：

```kotlin
data class User(
    val username: String,
    // 將 @Email 套用至 param、field 與 get
    @all:Email val email: String,
    // 將 @Email 套用至 param、field、get 與 setparam
    @all:Email var name: String,
) {
    // 將 @Email 套用至 field 與 getter（不包含 param，因為它不在建構函式中）
    @all:Email val secondaryEmail: String? = null
}
```

您可以將 `all` 元目標與任何屬性一起使用，無論是在主建構函數之內或之外。

#### 限制 (Limitations)

`all` 目標具有一些限制：

* 它不會將註解傳播到型別、潛在的擴充接收者、上下文接收者或參數。
* 它不能與多個註解一起使用：
    ```kotlin
    @all:[A B] // 禁止，請使用 @all:A @all:B
    val x: Int = 5
    ```
* 它不能與 [委派屬性](delegated-properties.md) 一起使用。

#### 如何啟用 (How to enable)

要在您的專案中啟用 `all` 元目標，請在命令列中使用以下編譯器選項：

```Bash
-Xannotation-target-all
```

或將其加入 Gradle 建置檔案的 `compilerOptions {}` 區塊中：

```kotlin
// build.gradle.kts
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xannotation-target-all")
    }
}
```

## Java 註解 (Java annotations)

Java 註解與 Kotlin 100% 相容：

```kotlin
import org.junit.Test
import org.junit.Assert.*
import org.junit.Rule
import org.junit.rules.*

class Tests {
    // 將 @Rule 註解套用至屬性 getter
    @get:Rule val tempFolder = TemporaryFolder()

    @Test fun simple() {
        val f = tempFolder.newFile()
        assertEquals(42, getTheAnswer())
    }
}
```

由於以 Java 撰寫的註解參數順序未定義，因此您無法使用一般的函式呼叫語法來傳遞引數。相反地，您需要使用具名引數語法：

``` java
// Java
public @interface Ann {
    int intValue();
    String stringValue();
}
```

```kotlin
// Kotlin
@Ann(intValue = 1, stringValue = "abc") class C
```

就像在 Java 中一樣，`value` 參數是一個特殊情況；它的值可以在不使用明確名稱的情況下指定：

``` java
// Java
public @interface AnnWithValue {
    String value();
}
```

```kotlin
// Kotlin
@AnnWithValue("abc") class C
```

### 陣列作為註解參數 (Arrays as annotation parameters)

如果 Java 中的 `value` 引數具有陣列型別，它在 Kotlin 中會變成 `vararg` 參數：

``` java
// Java
public @interface AnnWithArrayValue {
    String[] value();
}
```

```kotlin
// Kotlin
@AnnWithArrayValue("abc", "foo", "bar") class C
```

對於其他具有陣列型別的引數，您需要使用陣列常值語法或 `arrayOf(...)`：

``` java
// Java
public @interface AnnWithArrayMethod {
    String[] names();
}
```

```kotlin
@AnnWithArrayMethod(names = ["abc", "foo", "bar"])
class C
```

### 存取註解執行個體的屬性 (Accessing properties of an annotation instance)

註解執行個體的值會作為屬性揭露給 Kotlin 程式碼：

``` java
// Java
public @interface Ann {
    int value();
}
```

```kotlin
// Kotlin
fun foo(ann: Ann) {
    val i = ann.value
}
```

### 不產生 JVM 1.8+ 註解目標的能力 (Ability to not generate JVM 1.8+ annotation targets)

如果一個 Kotlin 註解的 Kotlin 目標中包含 `TYPE`，則該註解在其 Java 註解目標清單中會映射到 `java.lang.annotation.ElementType.TYPE_USE`。這就像 `TYPE_PARAMETER` Kotlin 目標如何映射到 `java.lang.annotation.ElementType.TYPE_PARAMETER` Java 目標一樣。對於 API 層級低於 26 的 Android 用戶端來說，這是一個問題，因為它們在 API 中沒有這些目標。

要避免產生 `TYPE_USE` 與 `TYPE_PARAMETER` 註解目標，請使用新的編譯器引數 `-Xno-new-java-annotation-targets`。

## 可重複註解 (Repeatable annotations)

就像 [在 Java 中](https://docs.oracle.com/javase/tutorial/java/annotations/repeating.html) 一樣，Kotlin 擁有可重複註解，可以對單個程式碼元素多次套用。要使您的註解成為可重複註解，請使用 [`@kotlin.annotation.Repeatable`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.annotation/-repeatable/) 元註解來標記其宣告。這將使其在 Kotlin 與 Java 中皆為可重複。Kotlin 端也支援 Java 可重複註解。

與 Java 中使用的方案的主要區別在於不存在 *包含註解 (containing annotation)*，Kotlin 編譯器會以預定義名稱自動產生它。對於下例中的註解，它將產生包含註解 `@Tag.Container`：

```kotlin
@Repeatable
annotation class Tag(val name: String)

// 編譯器產生 @Tag.Container 包含註解
```

您可以透過套用 [`@kotlin.jvm.JvmRepeatable`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.jvm/-jvm-repeatable/) 元註解並傳遞明確宣告的包含註解類別作為引數，來為包含註解設定自訂名稱：

```kotlin
@JvmRepeatable(Tags::class)
annotation class Tag(val name: String)

annotation class Tags(val value: Array<Tag>)
```

要透過反射提取 Kotlin 或 Java 可重複註解，請使用 [`KAnnotatedElement.findAnnotations()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect.full/find-annotations.html) 函式。

在 [此 KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/repeatable-annotations.md) 中進一步了解 Kotlin 可重複註解。