[//]: # (title: 测试页面)

<web-summary>本页面仅用于测试目的。</web-summary>

<no-index/>

<tldr>
   <p>这是一个带有图片的块（取自<strong>Compose Multiplatform 快速入门</strong>教程）。</p>
   <p><img src="icon-1-done.svg" width="20" alt="First step"/> <a href="jvm-create-project-with-spring-boot.md">使用 Kotlin 创建 Spring Boot 项目</a><br/>
      <img src="icon-2-done.svg" width="20" alt="Second step"/> <a href="jvm-spring-boot-add-data-class.md">向 Spring Boot 项目添加数据类</a><br/>
      <img src="icon-3.svg" width="20" alt="Third step"/> <strong>为 Spring Boot 项目添加数据库支持</strong><br/>
      <img src="icon-4-todo.svg" width="20" alt="Fourth step"/> 使用 Spring Data CrudRepository 进行数据库访问<br/>
    </p>
</tldr>

## 同步选项卡 {id="synchronized-tabs"}

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

## 小节 {id="sections"}

### 已折叠小节 {initial-collapse-state="collapsed" collapsible="true" id="collapsed-section"}

此处有一些文本和一个代码块：

```kotlin
plugins {
    kotlin("plugin.noarg") version "1.9.23"
}
```

## 代码块 {id="codeblocks"}

仅为一个代码块：

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

### 可展开代码块 {id="expandable-codeblock"}

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

### 可运行代码块 {id="runnable-codeblock"}

```kotlin
data class User(val name: String, val id: Int)

fun main() {
    val user = User("Alex", 1)
    
    //sampleStart
    // 自动使用 toString() 函数，以便输出更易于阅读
    println(user)            
    // User(name=Alex, id=1)
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

## 表格 {id="tables"}

### Markdown 表格 {id="markdown-table"}

| 基本类型数组                                                                          | Java 中的等价类型 |
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
        <td><strong>上次修改时间</strong></td>
        <td><strong>2023 年 12 月</strong></td>
    </tr>
    <tr>
        <td><strong>下次更新时间</strong></td>
        <td><strong>2024 年 6 月</strong></td>
    </tr>
</table>

### 包含代码块的 XML 表格 {id="xml-table-with-codeblocks-inside"}

简单表格：

<table>
    <tr>
        <td>修改前</td>
        <td>修改后</td>
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

更复杂的表格：

<table>
    <tr>
        <td></td>
        <td>修改前</td>
        <td>修改后</td>
    </tr>
    <tr>
        <td rowspan="2"><code>jvmMain</code> 编译的依赖项</td>
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
        <td><code>jvmMain</code> 源集的依赖项</td>
<td colspan="2">

```kotlin
jvmMain<Scope>
```

</td>
    </tr>
    <tr>
        <td><code>jvmTest</code> 编译的依赖项</td>
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
        <td><code>jvmTest</code> 源集的依赖项</td>
<td colspan="2">

```kotlin
jvmTest<Scope>
```

</td>
    </tr>
</table>

## 列表 {id="lists"}

### 有序列表 {id="ordered-list"}

1. 一
2. 二
3. 三
    1. 三点 1
    2. 三点 2
    3. 三点 3
        1. 三点 1 和 1
4. 内部包含代码块：

   ```kotlin
   jvmTest<Scope>
   ```

### 无序列表 {id="non-ordered-list"}

* 第一个项目符号
* 第二个项目符号
* 第三个项目符号
    * 还有一个
    * 又一个
        * 哇，还有一个
* 内部包含代码块：

   ```kotlin
   jvmTest<Scope>
   ```

### 定义列表 {id="definition-list"}

<deflist collapsible="true">
   <def title="可折叠项 #1">
      <p><code>CrudRepository</code> 接口中 <code>findById()</code> 函数的返回值类型是 <code>Optional</code> 类的一个实例。但是，为了保持一致性，返回一个包含单条消息的 <code>List</code> 会更方便。为此，如果 <code>Optional</code> 值存在，你需要将其解包，并返回包含该值的列表。这可以实现为 <code>Optional</code> 类型的<a href="extensions.md#extension-functions">扩展函数</a>。</p>
      <p>在代码 <code>Optional&lt;out T&gt;.toList()</code> 中，<code>.toList()</code> 是 <code>Optional</code> 的扩展函数。扩展函数允许你向任何类编写额外的函数，这在你想扩展某些库类的功能时尤其有用。</p>
   </def>
   <def title="可折叠项 #2">
      <p><a href="https://docs.spring.io/spring-data/relational/reference/#jdbc.entity-persistence">该函数假定</a>新对象在数据库中没有 ID。因此，对于插入操作，ID <b>应该为 null</b>。</p>
      <p>如果 ID 不为 <i>null</i>，<code>CrudRepository</code> 会假定该对象已经存在于数据库中，并且这是一个<i>更新</i>操作，而不是<i>插入</i>操作。在插入操作之后，<code>id</code> 将由数据存储生成并赋值回 <code>Message</code> 实例。这就是为什么应该使用 <code>var</code> 关键字声明 <code>id</code> 属性的原因。</p>
      <p></p>
   </def>
</deflist>

### 简洁定义列表 {id="clear-definition-list"}

<deflist appearance="clear" collapsible="true">
<def title="可展开项 #1">

一个没有编号的可展开项。其正文为纯文本，仅用于测试组件外壳。

</def>
<def title="可展开项 #2">

第二个可展开项。展开它不得改变同级元素的状态。

</def>
<def title="可展开项 #3">

第三个可展开项，用于结束无编号列表。

</def>
</deflist>

### 带编号的简洁定义列表 {id="numbered-clear-definition-list"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="编号项 #1">

带有生成的数字 1 的编号项说明。

</def>
<def title="编号项 #2">

带有生成的数字 2 的编号项说明。

</def>
<def title="编号项 #3">

带有生成的数字 3 的编号项说明。

</def>
<def title="编号项 #4">

带有生成的数字 4 的编号项说明。

</def>
<def title="编号项 #5">

带有生成的数字 5 的编号项说明。

</def>
<def title="编号项 #6">

带有生成的数字 6 的编号项说明。

</def>
<def title="故意设置的很长的项标题，在窄视口上必须换行成多行，以确保生成的编号的悬挂缩进保持完好">

带有生成的数字 7 的编号项说明。

</def>
<def title="编号项 #8">

带有生成的数字 8 的编号项说明。

</def>
<def title="编号项 #9">

带有生成的数字 9 的编号项说明。

</def>
<def title="编号项 #10">

带有生成的数字 10 的编号项说明。

</def>
<def title="编号项 #11">

带有生成的数字 11 的编号项说明。

</def>
</deflist>

## 练习 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="使用字符串模板输出问候语" id="test-page-practice-1">

补全代码，使程序向标准输出打印 `"Mary is 20 years old"`：

```kotlin
fun main() {
    val name = "Mary"
    val age = 20
    // 在此处编写你的代码
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解决方案" id="test-page-solution-1"}

</def>
<def title="检查两个结果是否匹配" id="test-page-practice-2">

使用 `if`，在两个结果相等时打印 `You win :)`，否则打印 `You lose :(`。

> 该练习还包含一个嵌套提示，因此内部折叠列表必须能够打开，而不会折叠练习本身。
>
{style="tip"}

<deflist collapsible="true">
    <def title="提示">
        使用相等运算符 (<code>==</code>) 比较结果。
    </def>
</deflist>

```kotlin
fun main() {
    val firstResult = 3
    val secondResult = 3
    // 在此处编写你的代码
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解决方案" id="test-page-solution-2"}

</def>
<def title="过滤数字列表" id="test-page-practice-3">

使用 `filter()` 仅打印列表中的偶数：

```kotlin
fun main() {
    val numbers = listOf(1, 2, 3, 4, 5)
    println(numbers)
    // 在此处编写你的代码
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解决方案" id="test-page-solution-3"}

</def>
</deflist>

## 文本元素 {id="text-elements"}

* **粗体文本**
* _斜体文本_
* `内联代码`
* [内部锚点](#lists)
* [内部链接](roadmap.md)
* [外部链接](https://jetbrains.com)
* 表情符号 ❌✅🆕

## 变量 {id="variables"}
* 变量用法：最新的 Kotlin 版本是 %kotlinVersion%

## 嵌入元素 {id="embedded-elements"}

### YouTube 视频 {id="video-from-youtube"}

<video src="https://www.youtube.com/v/Ol_96CHKqg8" title="What's new in Kotlin 1.9.20"/>

### 图片 {id="pictures"}

常规 (Markdown)：

![创建测试](create-test.png){width="700"}

常规 (XML)：

<img src="multiplatform-web-wizard.png" alt="多平台 Web 向导" width="400"/>

内联：

![YouTrack](youtrack-logo.png){width=30}{type="joined"}

可缩放：

![类图](ksp-class-diagram.svg){thumbnail="true" width="700" thumbnail-same-file="true"}

按钮样式：

<a href="https://kmp.jetbrains.com">
   <img src="multiplatform-create-project-button.png" alt="创建项目" style="block"/>
</a>

## 提示与附注 {id="notes"}

警告：

> kapt 编译器插件对 K2 的支持目前处于[实验性阶段](components-stability.md)。
> 需要选择加入（请参阅下方详情），并且仅应将其用于评估目的。
>
{style="warning"}

说明：

> 对于随 Kotlin/Native 一起提供的原生平台库（例如 Foundation、UIKit 和 POSIX），只有其中的部分
> API 需要使用 `@ExperimentalForeignApi` 选择加入。在这些情况下，你将收到附带选择加入要求的警告。
>
{style="note"}

提示：

> 对于随 Kotlin/Native 一起提供的原生平台库（例如 Foundation、UIKit 和 POSIX），只有其中的部分
> API 需要使用 `@ExperimentalForeignApi` 选择加入。在这些情况下，你将收到附带选择加入要求的警告。
>
{style="tip"}