[//]: # (title: 测试页面)

<web-summary>此页面仅用于测试目的。</web-summary>

<no-index/>

<tldr>
   <p>这是一个带有图片的块（取自 <strong>Compose Multiplatform 入门</strong>教程）。</p>
   <p><img src="icon-1-done.svg" width="20" alt="第一步"/> <a href="jvm-create-project-with-spring-boot.md">使用 Kotlin 创建 Spring Boot 项目</a><br/>
      <img src="icon-2-done.svg" width="20" alt="第二步"/> <a href="jvm-spring-boot-add-data-class.md">向 Spring Boot 项目添加数据类</a><br/>
      <img src="icon-3.svg" width="20" alt="第三步"/> <strong>为 Spring Boot 项目添加数据库支持</strong><br/>
      <img src="icon-4-todo.svg" width="20" alt="第四步"/> 使用 Spring Data CrudRepository 进行数据库访问><br/>
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

## 章节 {id="sections"}

### 折叠章节 {initial-collapse-state="collapsed" collapsible="true" id="collapsed-section"}

这里有一些文本和一个代码块：

```kotlin
plugins {
    kotlin("plugin.noarg") version "1.9.23"
}
```

## 代码块 {id="codeblocks"}

仅一个代码块：

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

### 可展开的代码块 {id="expandable-codeblock"}

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

### 可运行的代码块 {id="runnable-codeblock"}

```kotlin
data class User(val name: String, val id: Int)

fun main() {
    val user = User("Alex", 1)
    
    //sampleStart
    // 自动使用 toString() 函数以便于阅读输出
    println(user)            
    // User(name=Alex, id=1)
    //sampleEnd
}
```
{kotlin-runnable="true"}

## 表格 {id="tables"}

### Markdown 表格 {id="markdown-table"}

| 基本类型数组                                                                          | 在 Java 中的对应类型 |
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
        <td><strong>最后修改于</strong></td>
        <td><strong>2023 年 12 月</strong></td>
    </tr>
    <tr>
        <td><strong>下次更新</strong></td>
        <td><strong>2024 年 6 月</strong></td>
    </tr>
</table>

### 内部包含代码块的 XML 表格 {id="xml-table-with-codeblocks-inside"}

简单表格：

<table>
    <tr>
        <td>之前</td>
        <td>现在</td>
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
        <td>之前</td>
        <td>现在</td>
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
4. 包含内部代码块：

   ```kotlin
   jvmTest<Scope>
   ```

### 无序列表 {id="non-ordered-list"}

* 第一个圆点
* 第二个圆点
* 第三个圆点
    * 还有一个
    * 另一个
        * 哇，又一个
* 包含内部代码块：

   ```kotlin
   jvmTest<Scope>
   ```

### 定义列表 {id="definition-list"}

<deflist collapsible="true">
   <def title="可折叠项 #1">
      <p><code>CrudRepository</code> 接口中 <code>findById()</code> 函数的返回值类型是 <code>Optional</code> 类的实例。然而，为了保持一致性，返回包含单个消息的 <code>List</code> 会更方便。为此，如果 <code>Optional</code> 的值存在，你需要将其解包并返回包含该值的列表。这可以实现为 <code>Optional</code> 类型的<a href="extensions.md#extension-functions">扩展函数</a>。</p>
      <p>在代码 <code>Optional&lt;out T&gt;.toList()</code> 中，<code>.toList()</code> 是 <code>Optional</code> 的扩展函数。扩展函数允许你向任何类编写额外的函数，当你想要扩展某些库类的功能时，这尤其有用。</p>
   </def>
   <def title="可折叠项 #2">
      <p><a href="https://docs.spring.io/spring-data/relational/reference/#jdbc.entity-persistence">此函数的运行</a>基于新对象在数据库中没有 ID 的假设。因此，在执行插入操作时，ID <b>应该为 null</b>。</p>
      <p>如果 ID 不为 <i>null</i>，<code>CrudRepository</code> 会假定该对象已存在于数据库中，并将其视为<i>更新</i>操作而非<i>插入</i>操作。在插入操作之后，<code>id</code> 将由数据存储生成并赋值回 <code>Message</code> 实例。这就是为什么应该使用 <code>var</code> 关键字声明 <code>id</code> 属性的原因。</p>
      <p></p>
   </def>
</deflist>

### 简洁定义列表 {id="clear-definition-list"}

<deflist appearance="clear" collapsible="true">
<def title="可展开项 #1">

一个不带编号的可展开项。其正文为纯文本，因此仅测试微件外框。

</def>
<def title="可展开项 #2">

第二个可展开项。展开它不得改变其同级项的状态。

</def>
<def title="可展开项 #3">

第三个可展开项，用于结束无编号列表。

</def>
</deflist>

### 编号简洁定义列表 {id="numbered-clear-definition-list"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="编号项 #1">

渲染为带有生成编号 1 的编号项描述。

</def>
<def title="编号项 #2">

渲染为带有生成编号 2 的编号项描述。

</def>
<def title="编号项 #3">

渲染为带有生成编号 3 的编号项描述。

</def>
<def title="编号项 #4">

渲染为带有生成编号 4 的编号项描述。

</def>
<def title="编号项 #5">

渲染为带有生成编号 5 的编号项描述。

</def>
<def title="编号项 #6">

渲染为带有生成编号 6 的编号项描述。

</def>
<def title="一个故意设置的长项标题，必须在狭窄视口上换行成多行，以使生成编号的悬挂缩进保持完好">

渲染为带有生成编号 7 的编号项描述。

</def>
<def title="编号项 #8">

渲染为带有生成编号 8 的编号项描述。

</def>
<def title="编号项 #9">

渲染为带有生成编号 9 的编号项描述。

</def>
<def title="编号项 #10">

渲染为带有生成编号 10 的编号项描述。

</def>
<def title="编号项 #11">

渲染为带有生成编号 11 的编号项描述。

</def>
</deflist>

## 练习 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="使用字符串模板打印问候语" id="test-page-practice-1">

补全代码，使程序向标准输出打印 `"Mary is 20 years old"`：

```kotlin
fun main() {
    val name = "Mary"
    val age = 20
    // Write your code here
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解决方案" id="test-page-solution-1"}

</def>
<def title="检查两个结果是否匹配" id="test-page-practice-2">

使用 `if`，在两个结果相等时打印 `You win :)`，否则打印 `You lose :(`。

> 该练习还包含一个嵌套提示，因此内部可折叠列表必须在不折叠练习本身的情况下展开。
>
{style="tip"}

<deflist collapsible="true">
    <def title="提示">
        使用相等运算符（<code>==</code>）比较结果。
    </def>
</deflist>

```kotlin
fun main() {
    val firstResult = 3
    val secondResult = 3
    // Write your code here
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解决方案" id="test-page-solution-2"}

</def>
<def title="过滤数字列表" id="test-page-practice-3">

使用 `filter()` 仅打印列表中的偶数：

```kotlin
fun main() {
    val numbers = listOf(1, 2, 3, 4, 5)
    println(numbers)
    // Write your code here
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解决方案" id="test-page-solution-3"}

</def>
</deflist>

## 文本元素 {id="text-elements"}

* **粗体文本**
* _斜体文本_
* `inline code`
* [内部锚点](#lists)
* [内部链接](roadmap.md)
* [外部链接](https://jetbrains.com)
* 表情符号 ❌✅🆕

## 变量 {id="variables"}
* 变量用法：最新的 Kotlin 版本是 %kotlinVersion%

## 嵌入元素 {id="embedded-elements"}

### 来自 YouTube 的视频 {id="video-from-youtube"}

<video src="https://www.youtube.com/v/Ol_96CHKqg8" title="Kotlin 1.9.20 的最新变化"/>

### 图片 {id="pictures"}

常规（Markdown）：

![创建测试](create-test.png){width="700"}

常规（XML）：

<img src="multiplatform-web-wizard.png" alt="Multiplatform web 向导" width="400"/>

内联：

![YouTrack](youtrack-logo.png){width=30}{type="joined"}

可缩放：

![类图](ksp-class-diagram.svg){thumbnail="true" width="700" thumbnail-same-file="true"}

按钮样式：

<a href="https://kmp.jetbrains.com">
   <img src="multiplatform-create-project-button.png" alt="创建项目" style="block"/>
</a>

## 提示与注意 {id="notes"}

警告：

> kapt 编译器插件中对 K2 的支持是[实验性功能](components-stability.md)。
> 需要显式选择加入（详见下文），并且您应该仅将其用于评估目的。
>
{style="warning"}

说明：

> 至于随 Kotlin/Native 提供的原生平台库（如 Foundation、UIKit 和 POSIX），只有它们的部分
> API 需要使用 `@ExperimentalForeignApi` 进行选择加入。在此类情况下，您会收到带有选择加入要求的警告。
>
{style="note"}

提示：

> 至于随 Kotlin/Native 提供的原生平台库（如 Foundation、UIKit 和 POSIX），只有它们的部分
> API 需要使用 `@ExperimentalForeignApi` 进行选择加入。在此类情况下，您会收到带有选择加入要求的警告。
>
{style="tip"}