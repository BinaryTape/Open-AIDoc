[//]: # (title: 套件與匯入)

在 Kotlin 專案中，程式碼是使用套件與匯入來組織的：

*   **套件 (package)** 是包含一個或多個 Kotlin 檔案的容器。檔案使用 `package` 標頭連結到套件。
*   **匯入 (import)** 是一條指示詞，可讓其他套件中的實體在目前檔案中可用。

## 套件標頭

原始碼檔案可以從套件標頭開始：

```kotlin
package org.example

fun printMessage() { /*...*/ }
class Message(val text: String) { /*...*/ }
```

原始碼檔案的所有內容（例如類別與函式）都屬於該套件。
它們的全名（完全限定名稱）結合了套件名稱與實體名稱。
在此範例中：

*   `printMessage()` 的完全限定名稱為 `org.example.printMessage`。
*   `Message` 的完全限定名稱為 `org.example.Message`。

如果檔案沒有套件標頭，則其內容屬於根套件。

## 匯入

若要使用來自不同套件檔案中的實體，請使用 `import` 指示詞。
除了預設匯入外，每個檔案也可以宣告自己的匯入。

### 匯入單一實體

匯入特定的實體，以便您可以在不使用限定符的情況下使用它：

```kotlin
// 現在可以不使用限定符直接存取 Message
import org.example.Message 

fun main() {
    val message = Message("Hello")
    println(message.text)
}
```

### 匯入作用域中的內容

星號匯入（以星號 `*` 結尾）會匯入對應作用域中的所有具名實體：

```kotlin
// 'org.example' 中的所有內容皆可存取
import org.example.* 

fun main() {
    printMessage()
    val message = Message("Hi")
}
```

如果您同時使用星號匯入與明確匯入來匯入同一個實體，則在進行多載解析時，明確匯入具有較高的優先權。

### 使用別名消除名稱衝突

如果兩個匯入的實體具有相同的名稱，請使用 `as` 關鍵字在本地重新命名其中一個來消除歧義：

```kotlin
// Message 指向 org.example.Message
import org.example.Message

// TestMessage 指向 org.test.Message
import org.test.Message as TestMessage

fun main() {
    val a = Message("from example")
    val b = TestMessage("from test")
}
```

### 您可以匯入的內容

`import` 關鍵字不僅限於類別。您可以匯入以下任何實體，無論它們來自套件、類別、物件還是列舉：

*   直接在套件中宣告的頂層函式與屬性：
    ```kotlin
    import org.example.printMessage // 頂層函式
    import org.example.VERSION      // 頂層屬性
    ```
*   來自 [物件宣告](object-declarations.md#object-declarations-overview) 的函式與屬性：
    ```kotlin
    import org.example.Config.DEFAULT_TIMEOUT // 來自物件的屬性
    import org.example.Config.loadSettings    // 來自物件的函式
    ```
*   [伴生物件](object-declarations.md#companion-objects) 的成員，透過包含它的類別名稱來引用：
    ```kotlin
    import org.example.MyClass.create // 指向 MyClass.Companion.create
    ```
*   [列舉常數](enum-classes.md)：
    ```kotlin
    import org.example.Color.RED
    import org.example.Color.GREEN
    ```
*   巢狀類別：
    ```kotlin
    import org.example.Outer.Nested
    ```

## 預設匯入

許多套件預設會匯入到每個 Kotlin 檔案中：

*   [kotlin.*](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/index.html)
*   [kotlin.annotation.*](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.annotation/index.html)
*   [kotlin.collections.*](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/index.html)
*   [kotlin.comparisons.*](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.comparisons/index.html)
*   [kotlin.io.*](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.io/index.html)
*   [kotlin.ranges.*](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.ranges/index.html)
*   [kotlin.sequences.*](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.sequences/index.html)
*   [kotlin.text.*](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/index.html)
*   [kotlin.math.*](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.math/index.html)

視目標平台而定，Kotlin 會匯入額外的套件：

*   JVM：
    *   [java.lang.*](https://docs.oracle.com/javase/8/docs/api/java/lang/package-summary.html)
    *   [kotlin.jvm.*](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.jvm/index.html)

*   JS：
    *   [kotlin.js.*](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.js/index.html)

## 可見性與匯入

匯入實體的能力取決於其 [可見性修飾詞](visibility-modifiers.md)：

*   `public` 實體可以在任何地方匯入。
*   `internal` 實體僅限在同一個模組內匯入。
*   `protected` 實體無法匯入。
*   頂層 `private` 實體僅在其宣告檔案中可存取。
*   其他 `private` 實體無法匯入。