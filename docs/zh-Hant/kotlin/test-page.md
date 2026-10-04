[//]: # (title: 測試頁面)

<web-summary>此頁面僅供測試之用。</web-summary>

<no-index/>

<tldr>
   <p>這是一個帶有圖片的區塊（取自 <strong>Getting started with Compose Multiplatform</strong> 教學）。</p>
   <p><img src="icon-1-done.svg" width="20" alt="第一步"/> <a href="jvm-create-project-with-spring-boot.md">使用 Kotlin 建立 Spring Boot 專案</a><br/>
      <img src="icon-2-done.svg" width="20" alt="第二步"/> <a href="jvm-spring-boot-add-data-class.md">新增資料類別至 Spring Boot 專案</a><br/>
      <img src="icon-3.svg" width="20" alt="第三步"/> <strong>為 Spring Boot 專案新增資料庫支援</strong><br/>
      <img src="icon-4-todo.svg" width="20" alt="第四步"/> 使用 Spring Data CrudRepository 進行資料庫存取><br/>
    </p>
</tldr>

## 同步的分頁 {id="synchronized-tabs"}

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

## 小節 {id="sections"}

### 收合的小節 {initial-collapse-state="collapsed" collapsible="true" id="collapsed-section"}

此處是一些文字和程式碼區塊：

```kotlin
plugins {
    kotlin("plugin.noarg") version "1.9.23"
}
```

## 程式碼區塊 {id="codeblocks"}

僅僅是一個程式碼區塊：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

## 表格 {id="tables"}

### Markdown 表格 {id="markdown-table"}

| 基本型別陣列                                                                          | Java 中的對應項   |
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
        <td><strong>上次修改時間</strong></td>
        <td><strong>2023 年 12 月</strong></td>
    </tr>
    <tr>
        <td><strong>下次更新</strong></td>
        <td><strong>2024 年 6 月</strong></td>
    </tr>
</table>

### 內嵌程式碼區塊的 XML 表格 {id="xml-table-with-codeblocks-inside"}

簡易表格：

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

更複雜的表格：

<table>
    <tr>
        <td></td>
        <td>之前</td>
        <td>現在</td>
    </tr>
    <tr>
        <td rowspan="2"><code>jvmMain</code> 編譯的相依項</td>
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
        <td><code>jvmMain</code> 原始碼集的相依項</td>
<td colspan="2">

```kotlin
jvmMain<Scope>
```

</td>
    </tr>
    <tr>
        <td><code>jvmTest</code> 編譯的相依項</td>
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
        <td><code>jvmTest</code> 原始碼集的相依項</td>
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
    1. 3.1
    2. 3.2
    3. 3.3
        1. 3.3.1
4. 內含程式碼區塊：

   ```kotlin
   jvmTest<Scope>
   ```

### 無序清單 {id="non-ordered-list"}

* 第一個項目
* 第二個項目
* 第三個項目
    * 再一個
    * 另一個
        * 哇，又一個
* 內含程式碼區塊：

   ```kotlin
   jvmTest<Scope>
   ```

### 定義清單 {id="definition-list"}

<deflist collapsible="true">
   <def title="可收合項目 #1">
      <p><code>CrudRepository</code> 介面中的 <code>findById()</code> 函式其傳回型別為 <code>Optional</code> 類別的執行個體。然而，為了保持一致性，傳回僅包含單一訊息的 <code>List</code> 會更方便。為此，如果存在值，您需要解包 <code>Optional</code> 值，並傳回包含該值的清單。這可以實作為 <code>Optional</code> 型別的<a href="extensions.md#extension-functions">擴充函式</a>。</p>
      <p>在程式碼中，<code>Optional&lt;out T&gt;.toList()</code>，<code>.toList()</code> 是 <code>Optional</code> 的擴充函式。擴充函式允許您為任何類別編寫額外的函式，當您想要擴充某些程式庫類別的功能時特別有用。</p>
   </def>
   <def title="可收合項目 #2">
      <p><a href="https://docs.spring.io/spring-data/relational/reference/#jdbc.entity-persistence">此函式的運作</a>基於一個假設，即新物件在資料庫中沒有 id。因此，插入時 id <b>應該為 null</b>。</p>
      <p> 如果 id 不是 <i>null</i>，<code>CrudRepository</code> 會假設該物件已經存在於資料庫中，且這是一次<i>更新</i>操作而非<i>插入</i>操作。在插入操作之後，<code>id</code> 將由資料存放區產生並指派回 <code>Message</code> 執行個體。這就是為什麼 <code>id</code> 屬性應該使用 <code>var</code> 關鍵字宣告的原因。</p>
      <p></p>
   </def>
</deflist>

### 簡潔定義清單 {id="clear-definition-list"}

<deflist appearance="clear" collapsible="true">
<def title="可展開項目 #1">

沒有編號的可展開項目。其主體為純文字，因此僅測試小工具的邊框元件。

</def>
<def title="可展開項目 #2">

第二個可展開項目。展開它不得變更其同層級項目的狀態。

</def>
<def title="可展開項目 #3">

第三個可展開項目，結束無編號清單。

</def>
</deflist>

### 帶編號的簡潔定義清單 {id="numbered-clear-definition-list"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="編號項目 #1">

以產生的編號 1 轉譯的編號項目說明。

</def>
<def title="編號項目 #2">

以產生的編號 2 轉譯的編號項目說明。

</def>
<def title="編號項目 #3">

以產生的編號 3 轉譯的編號項目說明。

</def>
<def title="編號項目 #4">

以產生的編號 4 轉譯的編號項目說明。

</def>
<def title="編號項目 #5">

以產生的編號 5 轉譯的編號項目說明。

</def>
<def title="編號項目 #6">

以產生的編號 6 轉譯的編號項目說明。

</def>
<def title="一個刻意設計為較長的項目標題，在較窄的視埠上必須換行，以使產生的編號懸垂縮排保持完整">

以產生的編號 7 轉譯的編號項目說明。

</def>
<def title="編號項目 #8">

以產生的編號 8 轉譯的編號項目說明。

</def>
<def title="編號項目 #9">

以產生的編號 9 轉譯的編號項目說明。

</def>
<def title="編號項目 #10">

以產生的編號 10 轉譯的編號項目說明。

</def>
<def title="編號項目 #11">

以產生的編號 11 轉譯的編號項目說明。

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
    // Write your code here
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="test-page-exercise-1"}

```kotlin
fun main() {
    val name = "Mary"
    val age = 20
    println("$name is $age years old")
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="參考解答" id="test-page-solution-1"}

</def>
<def title="檢查兩個結果是否相符" id="test-page-practice-2">

使用 `if`，在兩個結果相等時列印 `You win :)`，否則列印 `You lose :(`。

> 此練習還帶有巢狀提示，因此內層可收合清單在開啟時不得收合練習本身。
>
{style="tip"}

<deflist collapsible="true">
    <def title="提示">
        使用相等運算子（<code>==</code>）來比較結果。
    </def>
</deflist>

```kotlin
fun main() {
    val firstResult = 3
    val secondResult = 3
    // Write your code here
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="test-page-exercise-2"}

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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="參考解答" id="test-page-solution-2"}

</def>
<def title="篩選數字清單" id="test-page-practice-3">

使用 `filter()` 僅列印清單中的偶數：

```kotlin
fun main() {
    val numbers = listOf(1, 2, 3, 4, 5)
    println(numbers)
    // Write your code here
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="test-page-exercise-3"}

```kotlin
fun main() {
    val numbers = listOf(1, 2, 3, 4, 5)
    println(numbers)
    println(numbers.filter { it % 2 == 0 })
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="參考解答" id="test-page-solution-3"}

</def>
</deflist>

## 文字元素 {id="text-elements"}

* **粗體文字**
* _斜體文字_
* `行內程式碼`
* [內部錨點](#lists)
* [內部連結](roadmap.md)
* [外部連結](https://jetbrains.com)
* 表情符號 ❌✅🆕

## 變數 {id="variables"}
* 變數使用：最新的 Kotlin 版本為 %kotlinVersion%

## 內嵌元素 {id="embedded-elements"}

### YouTube 影片 {id="video-from-youtube"}

<video src="https://www.youtube.com/v/Ol_96CHKqg8" title="What's new in Kotlin 1.9.20"/>

### 圖片 {id="pictures"}

一般（Markdown）：

![Create a test](create-test.png){width="700"}

一般（XML）：

<img src="multiplatform-web-wizard.png" alt="Multiplatform web wizard" width="400"/>

行內：

![YouTrack](youtrack-logo.png){width=30}{type="joined"}

可縮放：

![class diagram](ksp-class-diagram.svg){thumbnail="true" width="700" thumbnail-same-file="true"}

按鈕樣式：

<a href="https://kmp.jetbrains.com">
   <img src="multiplatform-create-project-button.png" alt="Create a project" style="block"/>
</a>

## 附註 {id="notes"}

警告：

> kapt 編譯器外掛程式中對 K2 的支援屬於[實驗功能](components-stability.md)。
> 需要明確選擇加入（opt-in，詳見下文），且您應僅將其用於評估目的。
>
{style="warning"}

附註：

> 至於隨 Kotlin/Native 提供的原生平台程式庫（如 Foundation、UIKit 和 POSIX），只有部分 API 需要透過 `@ExperimentalForeignApi` 明確選擇加入。在這種情況下，您會收到帶有需要選擇加入要求的警告。
>
{style="note"}

提示：

> 至於隨 Kotlin/Native 提供的原生平台程式庫（如 Foundation、UIKit 和 POSIX），只有部分 API 需要透過 `@ExperimentalForeignApi` 明確選擇加入。在這種情況下，您會收到帶有需要選擇加入要求的警告。
>
{style="tip"}