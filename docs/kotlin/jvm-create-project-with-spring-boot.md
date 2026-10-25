[//]: # (title: 使用 Kotlin 创建 Spring Boot 项目)

<web-summary>在 IntelliJ IDEA 中使用 Kotlin 创建 Spring Boot 应用程序。</web-summary>

本教程的第一部分将演示如何在 IntelliJ IDEA 中使用项目向导（Project Wizard）通过 Gradle 创建 Spring Boot 项目。

> 本教程并不强制要求使用 Gradle 作为构建系统。如果你使用 Maven，也可以按照相同的步骤操作。
> 
{style="note"}

## 开始之前 {id="before-you-start"}

下载并安装最新版的 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/)，并使用 Ultimate 订阅。

> 如果你使用的 IntelliJ IDEA 没有 Ultimate 订阅，或者使用的是其他 IDE，可以使用[基于 Web 的项目生成器](https://start.spring.io/#!language=kotlin&type=gradle-project-kotlin)来生成 Spring Boot 项目。
> 
{style="tip"}

## 创建 Spring Boot 项目 {id="create-a-spring-boot-project"}

在 IntelliJ IDEA 中使用项目向导创建基于 Kotlin 的全新 Spring Boot 项目：

1. 在 IntelliJ IDEA 中，选择 **File** | **New** | **Project**。 
2. 在左侧面板的 **Generators** 部分选择 **Spring Boot**。
3. 在 **New Project** 窗口中指定以下字段和选项：
   
   * **Name**：demo
   * **Language**：Kotlin
   * **Type**：Gradle - Kotlin

     > 此选项用于指定构建系统和 DSL。
     >
     {style="tip"}

   * **Package name**：com.example.demo
   * **JDK**：Java JDK
     
     > 本教程使用 **Amazon Corretto 版本 23**。
     > 如果你尚未安装 JDK，可以从下拉菜单中下载。
     >
     {style="note"}
   
   * **Java**：17
   
     > 如果你尚未安装 Java 17，可以从 JDK 下拉菜单中下载。
     >
     {style="tip"}

   ![创建 Spring Boot 项目](create-spring-boot-project.png){width=700}

4. 确保已指定所有字段，然后点击 **Next**。

5. 选择本教程所需的以下依赖项：

   * **Web | Spring Web**
   * **SQL | Spring Data JDBC**
   * **SQL | H2 Database**

   ![设置 Spring Boot 项目](set-up-spring-boot-project.png){width=700}

6. 点击 **Create** 生成并设置项目。

   > IDE 将生成并打开新项目。下载并导入项目依赖项可能需要一些时间。
   >
   {style="tip"} 

7. 完成后，你可以在 **Project 视图**中查看以下结构：

   ![设置 Spring Boot 项目](spring-boot-project-view.png){width=400}

   生成的 Gradle 项目符合 Maven 的标准目录布局：
   * `main/kotlin` 文件夹下包含属于该应用程序的包和类。
   * 应用程序的入口点是 `DemoApplication.kt` 文件的 `main()` 方法。

## 探索项目的 Gradle 构建文件 {initial-collapse-state="collapsed" collapsible="true" id="explore-the-project-gradle-build-file"}

打开 `build.gradle.kts` 文件：它是 Gradle Kotlin 构建脚本，其中包含应用程序所需的依赖项列表。

该 Gradle 文件对于 Spring Boot 来说是标准配置，但它还包含了必需的 Kotlin 依赖项，包括 [`kotlin-spring` Gradle 插件](kotlin-spring-plugin.md) – `kotlin("plugin.spring")`。

以下是完整的脚本以及对各部分和依赖项的说明：

```kotlin
// build.gradle.kts
plugins {
    kotlin("jvm") version "%springBootSupportedKotlinVersion%" // 要使用的 Kotlin 版本
    kotlin("plugin.spring") version "%springBootSupportedKotlinVersion%" // Kotlin Spring 插件
    id("org.springframework.boot") version "%springBootVersion%"
    id("io.spring.dependency-management") version "1.1.7"
}

group = "com.example"
version = "0.0.1-SNAPSHOT"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(17)
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.springframework.boot:spring-boot-h2console")
    implementation("org.springframework.boot:spring-boot-starter-data-jdbc")
    implementation("org.springframework.boot:spring-boot-starter-webmvc")
    implementation("org.jetbrains.kotlin:kotlin-reflect") // Kotlin 反射库，使用 Spring 时必需
    implementation("tools.jackson.module:jackson-module-kotlin") // 适用于 Kotlin 的 Jackson 扩展程序，用于处理 JSON
    runtimeOnly("com.h2database:h2")
    testImplementation("org.springframework.boot:spring-boot-starter-data-jdbc-test")
    testImplementation("org.springframework.boot:spring-boot-starter-webmvc-test")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

kotlin {
    compilerOptions {
        freeCompilerArgs.addAll("-Xjsr305=strict", "-Xannotation-default-target=param-property") // `-Xjsr305=strict` 启用 JSR-305 注解的严格模式
    }
}

tasks.withType<Test> {
    useJUnitPlatform()
}
```

如你所见，Gradle 构建文件中添加了一些与 Kotlin 相关的构件：

1. 在 `plugins` 块中有两个 Kotlin 构件：

   * `kotlin("jvm")` 插件定义了项目中要使用的 Kotlin 版本。
   * Kotlin Spring 编译器插件 `kotlin("plugin.spring")` 为 Kotlin 类添加 `open` 修饰符，使其与 Spring Framework 功能兼容。

2. 在 `dependencies` 块中列出了几个与 Kotlin 相关的模块：

   * `tools.jackson.module:jackson-module-kotlin` 模块增加了对 Kotlin 类和数据类序列化与反序列化的支持。
   * `org.jetbrains.kotlin:kotlin-reflect` 是 Kotlin 反射库，提供了对[反射功能](reflection.md)的完整支持。

3. 在依赖项部分之后，你可以看到 `kotlin` 插件配置块。
   在此处你可以向编译器添加额外的实参，以启用或禁用各种语言功能。

在 [](gradle-compiler-options.md) 中详细了解 Kotlin 编译器选项。

## 探索生成的 Spring Boot 应用程序 {id="explore-the-generated-spring-boot-application"}

打开 `DemoApplication.kt` 文件：

```kotlin
// DemoApplication.kt
package com.example.demo

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class DemoApplication

fun main(args: Array<String>) {
    runApplication<DemoApplication>(*args)
}
```

<deflist collapsible="true">
   <def title="声明类 – class DemoApplication">
      <p>在包声明和导入语句之后，你可以看到第一个类声明 <code>class DemoApplication</code>。</p>
      <p>在 Kotlin 中，如果一个类不包含任何成员（属性或函数），你可以完全省略类主体（<code>{}</code>）。</p>
   </def>
   <def title="@SpringBootApplication 注解">
      <p><a href="https://docs.spring.io/spring-boot/reference/using/using-the-springbootapplication-annotation.html#using.using-the-springbootapplication-annotation"><code>@SpringBootApplication 注解</code></a>是 Spring Boot 应用程序中的便捷注解。
      它启用了 Spring Boot 的<a href="https://docs.spring.io/spring-boot/reference/using/auto-configuration.html#using.auto-configuration">自动配置 (auto-configuration)</a>、<a href="https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/context/annotation/ComponentScan.html">组件扫描 (component scan)</a>，并允许在其“应用程序类”上定义额外的配置。
      </p>
   </def>
   <def title="程序入口点 – main()">
      <p><a href="basic-syntax.md#program-entry-point"><code>main()</code></a> 函数是应用程序的入口点。</p>
      <p>它在 <code>DemoApplication</code> 类外部声明为<a href="functions.md#function-scope">顶层函数</a>。<code>main()</code> 函数调用 Spring 的 <code>runApplication(&#42;args)</code> 函数以结合 Spring Framework 启动应用程序。</p>
   </def>
   <def title="可变实参 – args: Array&lt;String&gt;">
      <p>查看 <code>runApplication()</code> 函数的声明，你会发现该函数的形参标记有 <a href="functions.md#variable-number-of-arguments-varargs"><code>vararg</code> 修饰符</a>：<code>vararg args: String</code>。
        这意味着你可以向该函数传递可变数量的 String 实参。
      </p>
   </def>
   <def title="扩展运算符 – (*args)">
      <p><code>args</code> 是 <code>main()</code> 函数的形参，声明为 String 数组。
        由于存在一个字符串数组，而你希望将其内容传递给函数，因此请使用扩展运算符（在数组前加上星号 <code>&#42;</code>）。
      </p>
   </def>
</deflist>

## 创建控制器 {id="create-a-controller"}

应用程序现已准备就绪可以运行，但我们先来更新其逻辑。

在 Spring 应用程序中，控制器用于处理 Web 请求。
在同一个包中，在 `DemoApplication.kt` 文件同级目录下创建 `MessageController.kt` 文件，并编写 `MessageController` 类，如下所示：

```kotlin
// MessageController.kt
package com.example.demo

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
class MessageController {
    @GetMapping("/")
    fun index(@RequestParam("name") name: String) = "Hello, $name!"
}
```

<deflist collapsible="true">
   <def title="@RestController 注解">
      <p>你需要告知 Spring <code>MessageController</code> 是一个 REST 控制器，因此应使用 <code>@RestController</code> 注解对其进行标记。</p>
      <p>此注解意味着该类将被组件扫描检测到，因为它与我们的 <code>DemoApplication</code> 类位于同一个包中。</p>
   </def>
   <def title="@GetMapping 注解">
      <p><code>@GetMapping</code> 用于标记 REST 控制器中实现 HTTP GET 调用对应端点的函数：</p>
      <code-block lang="kotlin">
      @GetMapping("/")
      fun index(@RequestParam("name") name: String) = "Hello, $name!"
      </code-block>
   </def>
   <def title="@RequestParam 注解">
      <p>函数形参 <code>name</code> 标记有 <code>@RequestParam</code> 注解。该注解表明方法形参应绑定到 Web 请求参数。</p>
      <p>因此，如果你访问应用程序的根路径并提供名为 "name" 的请求参数（例如 <code>/?name=&lt;your-value&gt;</code>），该参数值将作为调用 <code>index()</code> 函数的实参。</p>
   </def>
   <def title="单表达式函数 – index()">
      <p>由于 <code>index()</code> 函数仅包含一条语句，因此你可以将其声明为<a href="functions.md#single-expression-functions">单表达式函数</a>。</p>
      <p>这意味着可以省略花括号，并且函数体直接在等号 <code>=</code> 之后指定。</p>
   </def>
   <def title="函数返回值类型的类型推断">
      <p><code>index()</code> 函数没有显式声明返回值类型。编译器会通过查看等号 <code>=</code> 右侧语句的结果来推断返回值类型。</p>
      <p><code>Hello, $name!</code> 表达式的类型为 <code>String</code>，因此该函数的返回值类型也是 <code>String</code>。</p>
   </def>
   <def title="字符串模板 – $name">
      <p><code>Hello, $name!</code> 表达式在 Kotlin 中被称为<a href="strings.md#string-templates"><i>字符串模板</i></a>。</p>
      <p>字符串模板是包含嵌入表达式的字符串文字。</p>
      <p>这是替代字符串串联操作的一种便捷方式。</p>
   </def>
</deflist>

## 运行应用程序 {id="run-the-application"}

Spring 应用程序现在可以运行了：

1. 在 `DemoApplication.kt` 文件中，点击 `main()` 方法旁装订区域中的绿色 **Run** 图标：

    ![运行 Spring Boot 应用程序](run-spring-boot-application.png){width=700}
    
    > 你也可以在终端中运行 `./gradlew bootRun` 命令。
    >
    {style="tip"}

    这将在你的计算机上启动本地服务器。

2. 应用程序启动后，打开以下 URL：

    ```text
    http://localhost:8080?name=John
    ```

    你应该会看到打印出的响应 "Hello, John!"：

    ![Spring 应用程序响应](spring-application-response.png){width=700}

## 下一步 {id="next-step"}

在本教程的下一部分中，你将了解 Kotlin 数据类以及如何在应用程序中使用它们。

<list id="tour-nav">
  <li>
    <a as="button" href="jvm-spring-boot-add-data-class.md" mode="classic" icon="arrow-right" icon-position="right">下一步</a>
  </li>
</list>