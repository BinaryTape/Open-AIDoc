[//]: # (title: 使用 Kotlin 创建 Spring Boot 项目)

<web-summary>使用 IntelliJ IDEA 和 Kotlin 创建 Spring Boot 应用程序。</web-summary>

<tldr>
    <p>这是 <strong>Spring Boot 与 Kotlin 入门</strong> 教程的第一部分：</p><br/>
    <p><img src="icon-1.svg" width="20" alt="第一步"/> <strong>使用 Kotlin 创建 Spring Boot 项目</strong><br/><img src="icon-2-todo.svg" width="20" alt="第二步"/> 为 Spring Boot 项目添加数据类<br/><img src="icon-3-todo.svg" width="20" alt="第三步"/> 为 Spring Boot 项目添加数据库支持<br/><img src="icon-4-todo.svg" width="20" alt="第四步"/> 使用 Spring Data CrudRepository 进行数据库访问<br/></p>
</tldr>

本教程的第一部分将展示如何使用 IntelliJ IDEA 中的项目向导通过 Gradle 创建一个 Kotlin Spring Boot 项目。

> 本教程不强制要求使用 Gradle 作为构建系统。如果您使用 Maven，也可以遵循相同的步骤。
> 
{style="note"}

## 开始之前

下载并安装最新版本的 [IntelliJ IDEA Ultimate Edition](https://www.jetbrains.com/idea/download/)。

> 如果您使用的是 IntelliJ IDEA Community Edition 或其他 IDE，可以使用 [基于 Web 的项目生成器](https://start.spring.io/#!language=kotlin&type=gradle-project-kotlin) 来生成 Spring Boot 项目。
> 
{style="tip"}

## 创建 Spring Boot 项目

通过 IntelliJ IDEA Ultimate Edition 中的项目向导创建一个新的 Kotlin Spring Boot 项目：

1. 在 IntelliJ IDEA 中，选择 **File** | **New** | **Project**。 
2. 在左侧面板的 **Generators** 部分中，选择 **Spring Boot**。
3. 在 **New Project** 窗口中指定以下字段和选项：
   
   * **Name**: demo
   * **Language**: Kotlin
   * **Type**: Gradle - Kotlin

     > 此选项指定了构建系统和 DSL。
     >
     {style="tip"}

   * **Package name**: com.example.demo
   * **JDK**: Java JDK
     
     > 本教程使用 **Amazon Corretto version 23**。
     > 如果您尚未安装 JDK，可以从下拉列表中下载。
     >
     {style="note"}
   
   * **Java**: 17
   
     > 如果您尚未安装 Java 17，可以从 JDK 下拉列表中下载。
     >
     {style="tip"}

   ![创建 Spring Boot 项目](create-spring-boot-project.png){width=700}

4. 确保您已指定所有字段，然后点击 **Next**。

5. 选择本教程所需的以下依赖项：

   * **Web | Spring Web**
   * **SQL | Spring Data JDBC**
   * **SQL | H2 Database**

   ![设置 Spring Boot 项目](set-up-spring-boot-project.png){width=700}

6. 点击 **Create** 以生成并设置项目。

   > IDE 将生成并打开一个新项目。下载和导入项目依赖项可能需要一些时间。
   >
   {style="tip"} 

7. 完成后，您可以在 **Project 视图** 中观察到以下结构：

   ![设置 Spring Boot 项目](spring-boot-project-view.png){width=400}

   生成的 Gradle 项目符合 Maven 的标准目录布局：
   * `main/kotlin` 文件夹下包含属于该应用程序的软件包和类。
   * 应用程序的入口点是 `DemoApplication.kt` 文件中的 `main()` 方法。

## 探索项目的 Gradle 构建文件 {initial-collapse-state="collapsed" collapsible="true"}

打开 `build.gradle.kts` 文件：它是 Gradle Kotlin 构建脚本，其中包含应用程序所需的依赖项列表。

该 Gradle 文件对于 Spring Boot 来说是标准的，但它也包含了必要的 Kotlin 依赖项，包括 kotlin-spring Gradle 插件 – `kotlin("plugin.spring")`。

以下是包含各部分及依赖项说明的完整脚本：

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
    implementation("org.jetbrains.kotlin:kotlin-reflect") // Kotlin 反射库，在使用 Spring 时必选
    implementation("tools.jackson.module:jackson-module-kotlin") // 针对 Kotlin 的 Jackson 扩展，用于处理 JSON
    runtimeOnly("com.h2database:h2")
    testImplementation("org.springframework.boot:spring-boot-starter-data-jdbc-test")
    testImplementation("org.springframework.boot:spring-boot-starter-webmvc-test")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

kotlin {
    compilerOptions {
        freeCompilerArgs.addAll("-Xjsr305=strict", "-Xannotation-default-target=param-property") // `-Xjsr305=strict` 为 JSR-305 注解启用严格模式
    }
}

tasks.withType<Test> {
    useJUnitPlatform()
}
```

如您所见，Gradle 构建文件中添加了一些与 Kotlin 相关的工件：

1. 在 `plugins` 块中，有两个 Kotlin 工件：

   * `kotlin("jvm")` 插件定义了项目中要使用的 Kotlin 版本。
   * Kotlin Spring 编译器插件 `kotlin("plugin.spring")` 会自动为 Kotlin 类添加 `open` 修饰符，以使它们与 Spring 框架的功能兼容。

2. 在 `dependencies` 块中，列出了一些与 Kotlin 相关的模块：

   * `tools.jackson.module:jackson-module-kotlin` 模块增加了对 Kotlin 类和数据类序列化与反序列化的支持。
   * `org.jetbrains.kotlin:kotlin-reflect` 是一个 Kotlin 反射库，它支持完整的 [反射功能](reflection.md)。

3. 在依赖项部分之后，您可以看到 `kotlin` 插件配置块。
   您可以在此处向编译器添加额外参数，以启用或禁用各种语言功能。

在 [](gradle-compiler-options.md) 中详细了解 Kotlin 编译器选项。

## 探索生成的 Spring Boot 应用程序

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
      <p>在包声明和导入语句之后，您可以看到第一个类声明：<code>class DemoApplication</code>。</p>
      <p>在 Kotlin 中，如果一个类不包含任何成员（属性或函数），您可以直接省略类主体 (<code>{}</code>)。</p>
   </def>
   <def title="@SpringBootApplication 注解">
      <p><a href="https://docs.spring.io/spring-boot/reference/using/using-the-springbootapplication-annotation.html#using.using-the-springbootapplication-annotation"><code>@SpringBootApplication 注解</code></a> 是 Spring Boot 应用程序中的一个便捷注解。它启用了 Spring Boot 的 <a href="https://docs.spring.io/spring-boot/reference/using/auto-configuration.html#using.auto-configuration">自动配置</a>、<a href="https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/context/annotation/ComponentScan.html">组件扫描</a>，并允许在“应用程序类”上定义额外配置。</p>
   </def>
   <def title="程序入口点 – main()">
      <p><a href="basic-syntax.md#program-entry-point"><code>main()</code></a> 函数是应用程序的入口点。</p>
      <p>它被声明为 <code>DemoApplication</code> 类之外的 <a href="functions.md#function-scope">顶层函数</a>。<code>main()</code> 函数调用 Spring 的 `runApplication(*args)` 函数，以便通过 Spring 框架启动应用程序。</p>
   </def>
   <def title="可变数量参数 – args: Array&lt;String&gt;">
      <p>如果您查看 <code>runApplication()</code> 函数的声明，会发现该函数的形参被标记了 <a href="functions.md#variable-number-of-arguments-varargs"><code>vararg</code> 修饰符</a>：<code>vararg args: String</code>。这意味着您可以向该函数传递可变数量的 String 实参。</p>
   </def>
   <def title="扩展运算符 – (*args)">
      <p><code>args</code> 是 <code>main()</code> 函数的一个形参，被声明为字符串数组。由于您有一个字符串数组，并且希望将其内容传递给函数，请使用扩展运算符（在数组前加星号 <code>*</code>）。</p>
   </def>
</deflist>

## 创建控制器

应用程序已准备好运行，但让我们先更新它的逻辑。

在 Spring 应用程序中，控制器用于处理 Web 请求。
在同一个包下，紧挨着 `DemoApplication.kt` 文件，创建 `MessageController.kt` 文件，并编写 `MessageController` 类如下：

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
      <p>您需要告诉 Spring <code>MessageController</code> 是一个 REST 控制器，因此应该使用 <code>@RestController</code> 注解对其进行标记。</p>
      <p>此注解意味着该类将被组件扫描识别，因为它与我们的 <code>DemoApplication</code> 类位于同一个包中。</p>
   </def>
   <def title="@GetMapping 注解">
      <p><code>@GetMapping</code> 用于标记 REST 控制器中实现 HTTP GET 调用对应端点的函数：</p>
      <code-block lang="kotlin">
      @GetMapping("/")
      fun index(@RequestParam("name") name: String) = "Hello, $name!"
      </code-block>
   </def>
   <def title="@RequestParam 注解">
      <p>函数形参 <code>name</code> 被标记了 <code>@RequestParam</code> 注解。此注解表明方法形参应绑定到 Web 请求参数。</p>
      <p>因此，如果您在根路径访问应用程序并提供名为 "name" 的请求参数，例如 <code>/?name=&lt;your-value&gt;</code>，则该参数值将作为调用 <code>index()</code> 函数的实参。</p>
   </def>
   <def title="单表达式函数 – index()">
      <p>由于 <code>index()</code> 函数只包含一条语句，您可以将其声明为 <a href="functions.md#single-expression-functions">单表达式函数</a>。</p>
      <p>这意味着可以省略花括号，并在等号 <code>=</code> 后指定主体内容。</p>
   </def>
   <def title="函数返回类型的类型推断">
      <p><code>index()</code> 函数没有显式声明返回类型。相反，编译器通过查看等号 <code>=</code> 右侧语句的结果来推断返回类型。</p>
      <p><code>Hello, $name!</code> 表达式的类型是 <code>String</code>，因此该函数的返回类型也是 <code>String</code>。</p>
   </def>
   <def title="字符串模板 – $name">
      <p><code>Hello, $name!</code> 表达式在 Kotlin 中被称为 <a href="strings.md#string-templates"><i>字符串模板</i></a>。</p>
      <p>字符串模板是包含嵌入式表达式的字符串文字。</p>
      <p>这是字符串串联操作的一种便捷替代方案。</p>
   </def>
</deflist>

## 运行应用程序

Spring 应用程序现在可以运行了：

1. 在 `DemoApplication.kt` 文件中，点击 `main()` 方法旁边装订区域中的绿色 **Run** 图标：

    ![运行 Spring Boot 应用程序](run-spring-boot-application.png){width=700}
    
    > 您也可以在终端中运行 `./gradlew bootRun` 命令。
    >
    {style="tip"}

    这将在您的计算机上启动本地服务器。

2. 应用程序启动后，打开以下 URL：

    ```text
    http://localhost:8080?name=John
    ```

    您应该会看到响应中打印出 "Hello, John!"：

    ![Spring 应用程序响应](spring-application-response.png){width=700}

## 下一步

在本教程的下一部分中，您将学习 Kotlin 数据类以及如何在应用程序中使用它们。

**[继续阅读下一章节](jvm-spring-boot-add-data-class.md)**