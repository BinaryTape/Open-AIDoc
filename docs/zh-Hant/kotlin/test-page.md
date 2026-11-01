[//]: # (title: 測試頁面)

<web-summary>本頁面僅供測試之用。</web-summary>

<no-index/>

<tldr>
   <p>這是一個包含圖片的區塊（取自 <strong>Compose Multiplatform 快速入門</strong>教學）。</p>
   <p><img src="icon-1-done.svg" width="20" alt="First step"/> <a href="jvm-create-project-with-spring-boot.md">使用 Kotlin 建立 Spring Boot 專案</a><br/>
      <img src="icon-2-done.svg" width="20" alt="Second step"/> <a href="jvm-spring-boot-add-data-class.md">向 Spring Boot 專案新增 data class</a><br/>
      <img src="icon-3.svg" width="20" alt="Third step"/> <strong>為 Spring Boot 專案新增資料庫支援</strong><br/>
      <img src="icon-4-todo.svg" width="20" alt="Fourth step"/> 使用 Spring Data CrudRepository 進行資料庫存取><br/>
    </p>
</tldr>

## 同步分頁 {id="synchronized-tabs"}

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("kapt") version "1.9.23"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id "org.jetbrains.kotlin.kapt" version "1.9.23"
}
```

</tab>
</tabs>

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("plugin.noarg") version "1.9.23"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id "org.jetbrains.kotlin.plugin.noarg" version "1.9.23"
}
```

</tab>
</tabs>

## 章節 {id="sections"}

### 收合章節 {initial-collapse-state="collapsed" collapsible="true" id="collapsed-section"}

這裡有一些文字和一個程式碼區塊：

```kotlin
plugins {
    kotlin("plugin.noarg") version "1.9.23"
}
```

## 程式碼區塊 {id="codeblocks"}

僅為一個程式碼區塊：

```kotlin
    import java.util.*

@Service
class MessageService(val db: MessageRepository) {
    fun findMessages(): List<Message> = db.findAll().toList()

    fun findMessageById(id: String): List<Message> = db.findById(id).toList()

    fun save(message: Message) {
        db.save(message)
    }

    fun <T : Any> Optional<out T>.toList(): List<T> =
        if (isPresent) listOf(get()) else emptyList()
}
```

### 可展開的程式碼區塊 {id="expandable-codeblock"}

```kotlin
package com.example.demo

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@SpringBootApplication
class DemoApplication

fun main(args: Array<String>) {
    runApplication<DemoApplication>(*args)
}

@RestController
class MessageController {
    @GetMapping("/")
    fun index(@RequestParam("name") name: String) = "Hello, $name!"
}
```
{initial-collapse-state="collapsed" collapsible="true"}

### 可執行的程式碼區塊 {id="runnable-codeblock"}

```kotlin
data class User(val name: String, val id: Int)

fun main() {
    val user = User("Alex", 1)
    
    //sampleStart
    // 自動使用 toString() 函式，使輸出易於閱讀
    println(user)            
    // User(name=Alex, id=1)
    //sampleEnd
}
```
{kotlin-runnable="true"}

## 表格 {id="tables"}

### Markdown 表格 {id="markdown-table"}

| 基本型別陣列 | Java 中的對應型別 |
|---------------------------------------------------------------------------------------|--------------------|
| [`BooleanArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-boolean-array/) | `boolean[]`        |
| [`ByteArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-byte-array/)       | `byte[]`           |
| [`CharArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-char-array/)       | `char[]`           |
| [`DoubleArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-double-array/)   | `double[]`         |
| [`FloatArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-float-array/)     | `float[]`          |
| [`IntArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-int-array/)         | `int[]`            |
| [`LongArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-long-array/)       | `long[]`           |
| [`ShortArray`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-short-array/)     | `short[]`          |

### XML 表格 {id="xml-table"}

<table>
    <tr>
        <td><strong>上次修改於</strong></td>
        <td><strong>2023 年 12 月</strong></td>
    </tr>
    <tr>
        <td><strong>下次更新</strong></td>
        <td><strong>2024 年 6 月</strong></td>
    </tr>
</table>

### 內嵌程式碼區塊的 XML 表格 {id="xml-table-with-codeblocks-inside"}

簡單表格：

<table>
    <tr>
        <td>之前</td>
        <td>現在</td>
    </tr>
    <tr>
<td>

```kotlin
kotlin {
    targets {
        configure(['windows',
            'linux']) {
        }
    }
}
```

</td>
<td>

```kotlin
kotlin {
    targets {
        configure([findByName('windows'),
            findByName('linux')]) {
        }
    }
}
```

</td>
    </tr>
</table>

較複雜的表格：

<table>
    <tr>
        <td></td>
        <td>之前</td>
        <td>現在</td>
    </tr>
    <tr>
        <td rowspan="2"><code>jvmMain</code> 編譯的相依性</td>
<td>

```kotlin
jvm<Scope>
```

</td>
<td>

```kotlin
jvmCompilation<Scope>
```

</td>
    </tr>
    <tr>
<td>

```kotlin
dependencies {
    add("jvmImplementation",
        "foo.bar.baz:1.2.3")
}
```

</td>
<td>

```kotlin
dependencies {
    add("jvmCompilationImplementation",
        "foo.bar.baz:1.2.3")
}
```

</td>
    </tr>
    <tr>
        <td><code>jvmMain</code> 原始碼集的相依性</td>
<td colspan="2">

```kotlin
jvmMain<Scope>
```

</td>
    </tr>
    <tr>
        <td><code>jvmTest</code> 編譯的相依性</td>
<td>

```kotlin
jvmTest<Scope>
```

</td>
<td>

```kotlin
jvmTestCompilation<Scope>
```

</td>
    </tr>
    <tr>
        <td><code>jvmTest</code> 原始碼集的相依性</td>
<td colspan="2">

```kotlin
jvmTest<Scope>
```

</td>
    </tr>
</table>

## 清單 {id="lists"}

### 有序清單 {id="ordered-list"}

1. 一
2. 二
3. 三
    1. 三點 1
    2. 三點 2
    3. 三點 3
        1. 三點 1 與 1
4. 內部包含程式碼區塊：

   ```kotlin
   jvmTest<Scope>
   ```

### 無序清單 {id="non-ordered-list"}

* 第一個項目符號
* 第二個項目符號
* 第三個項目符號
    * 還有一個
    * 另外一個
        * 哇，又一個
* 內部包含程式碼區塊：

   ```kotlin
   jvmTest<Scope>
   ```

### 定義清單 {id="definition-list"}

<deflist collapsible="true">
   <def title="可收合項目 #1">
      <p><code>CrudRepository</code> 介面中 <code>findById()</code> 函式的傳回型別是 <code>Optional</code> 類別的執行個體。然而，為了保持一致性，傳回僅包含單一訊息的 <code>List</code> 會更方便。為此，若 <code>Optional</code> 值存在，你需要將其解包 (unwrap)，並傳回包含該值的清單。這可以實作為 <code>Optional</code> 型別的<a href="extensions.md#extension-functions">擴充函式</a>。</p>
      <p>在程式碼 <code>Optional&lt;out T&gt;.toList()</code> 中，<code>.toList()</code> 是 <code>Optional</code> 的擴充函式。擴充函式允許你為任何類別編寫額外的函式，這在你想擴充某些程式庫類別的功能性時特別有用。</p>
   </def>
   <def title="可收合項目 #2">
      <p><a href="https://docs.spring.io/spring-data/relational/reference/#jdbc.entity-persistence">此函式的運作</a>基於一個假設，即新物件在資料庫中尚無 ID。因此，進行插入操作時，ID <b>應該為 null</b>。</p>
      <p>若 ID 不是 <i>null</i>，<code>CrudRepository</code> 會假定該物件已存在於資料庫中，並將其視為<i>更新 (update)</i> 操作而非<i>插入 (insert)</i> 操作。在插入操作之後，<code>id</code> 將由資料存放區產生並重新指派回 <code>Message</code> 執行個體。這就是為什麼 <code>id</code> 屬性應該使用 <code>var</code> 關鍵字宣告的原因。</p>
      <p></p>
   </def>
</deflist>

### 純淨定義清單 {id="clear-definition-list"}

<deflist appearance="clear" collapsible="true">
<def title="可展開項目 #1">

未編號的可展開項目。其主體為純文字，因此僅測試小工具外框 (widget chrome)。

</def>
<def title="可展開項目 #2">

第二個可展開項目。展開它不得變更同層級項目的狀態。

</def>
<def title="可展開項目 #3">

第三個可展開項目，結束未編號清單。

</def>
</deflist>

### 編號純淨定義清單 {id="numbered-clear-definition-list"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="編號項目 #1">

以產生的編號 1 呈現的編號項目說明。

</def>
<def title="編號項目 #2">

以產生的編號 2 呈現的編號項目說明。

</def>
<def title="編號項目 #3">

以產生的編號 3 呈現的編號項目說明。

</def>
<def title="編號項目 #4">

以產生的編號 4 呈現的編號項目說明。

</def>
<def title="編號項目 #5">

以產生的編號 5 呈現的編號項目說明。

</def>
<def title="編號項目 #6">

以產生的編號 6 呈現的編號項目說明。

</def>
<def title="刻意拉長的項目標題，在較窄的視區上必須換行顯示，以確保產生的編號的突排縮排保持完整">

以產生的編號 7 呈現的編號項目說明。

</def>
<def title="編號項目 #8">

以產生的編號 8 呈現的編號項目說明。

</def>
<def title="編號項目 #9">

以產生的編號 9 呈現的編號項目說明。

</def>
<def title="編號項目 #10">

以產生的編號 10 呈現的編號項目說明。

</def>
<def title="編號項目 #11">

以產生的編號 11 呈現的編號項目說明。

</def>
</deflist>

## 練習 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="使用字串範本列印問候語" id="test-page-practice-1">

完成程式碼，使程式將 `"Mary is 20 years old"` 列印至標準輸出：

```kotlin
fun main() {
    val name = "Mary"
    val age = 20
    // 在此編寫你的程式碼
}
```
{validate="false" kotlin-runnable="true" id="test-page-exercise-1"}

```kotlin
fun main() {
    val name = "Mary"
    val age = 20
    println("$name is $age years old")
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="Example solution" id="test-page-solution-1"}

</def>
<def title="檢查兩個結果是否相符" id="test-page-practice-2">

使用 `if`，在兩個結果相等時列印 `You win :)`，否則列印 `You lose :(`。

> 本練習還包含一個巢狀提示，因此內部可收合清單展開時不得收合練習本身。
>
{style="tip"}

<deflist collapsible="true">
    <def title="提示">
        使用相等運算子 (<code>==</code>) 來比較結果。
    </def>
</deflist>

```kotlin
fun main() {
    val firstResult = 3
    val secondResult = 3
    // 在此編寫你的程式碼
}
```
{validate="false" kotlin-runnable="true" id="test-page-exercise-2"}

```kotlin
fun main() {
    val firstResult = 3
    val secondResult = 3
    if (firstResult == secondResult)
        println("You win :)")
    else
        println("You lose :(")
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="Example solution" id="test-page-solution-2"}

</def>
<def title="篩選數字清單" id="test-page-practice-3">

使用 `filter()` 僅列印清單中的偶數：

```kotlin
fun main() {
    val numbers = listOf(1, 2, 3, 4, 5)
    println(numbers)
    // 在此編寫你的程式碼
}
```
{validate="false" kotlin-runnable="true" id="test-page-exercise-3"}

```kotlin
fun main() {
    val numbers = listOf(1, 2, 3, 4, 5)
    println(numbers)
    println(numbers.filter { it % 2 == 0 })
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="Example solution" id="test-page-solution-3"}

</def>
</deflist>

## 文字元素 {id="text-elements"}

* **粗體文字**
* _斜體文字_
* `內嵌程式碼`
* [內部錨點](#lists)
* [內部連結](roadmap.md)
* [外部連結](https://jetbrains.com)
* 表情符號 ❌✅🆕

## 變數 {id="variables"}
* 變數使用：最新的 Kotlin 版本為 %kotlinVersion%

## 內嵌元素 {id="embedded-elements"}

### 來自 YouTube 的影片 {id="video-from-youtube"}

<video src="https://www.youtube.com/v/Ol_96CHKqg8" title="Kotlin 1.9.20 新功能"/>

### 圖片 {id="pictures"}

一般 (Markdown)：

![建立測試](create-test.png){width="700"}

一般 (XML)：

<img src="multiplatform-web-wizard.png" alt="Multiplatform web wizard" width="400"/>

行內：

![YouTrack](youtrack-logo.png){width=30}{type="joined"}

可縮放：

![class diagram](ksp-class-diagram.svg){thumbnail="true" width="700" thumbnail-same-file="true"}

按鈕樣式：

<a href="https://kmp.jetbrains.com">
   <img src="multiplatform-create-project-button.png" alt="Create a project" style="block"/>
</a>

## 注意事項 {id="notes"}

警告：

> kapt 編譯器外掛程式中對 K2 的支援屬於[實驗功能](components-stability.md)。
> 需要明確選擇加入 (Opt-in，請參閱下方詳細資訊)，且應僅將其用於評估目的。
>
{style="warning"}

附註：

> 至於 Kotlin/Native 隨附的原生平台程式庫（如 Foundation、UIKit 與 POSIX），
> 僅有部分 API 需要使用 `@ExperimentalForeignApi` 明確選擇加入。在此類情況下，你將收到帶有選擇加入需求的警告。
>
{style="note"}

提示：

> 至於 Kotlin/Native 隨附的原生平台程式庫（如 Foundation、UIKit 與 POSIX），
> 僅有部分 API 需要使用 `@ExperimentalForeignApi` 明確選擇加入。在此類情況下，你將收到帶有選擇加入需求的警告。
>
{style="tip"}