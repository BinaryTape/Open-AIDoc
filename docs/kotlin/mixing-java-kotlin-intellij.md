[//]: # (title: 将 Kotlin 添加到 Java 项目 – 教程)

<web-summary>将 Kotlin 集成到现有 Java 项目中 − 配置 Maven 或 Gradle 构建文件、组织源文件，以及在 IntelliJ IDEA 中将 Java 代码转换为 Kotlin。</web-summary>

Kotlin 与 Java 完全互操作，因此你可以将其逐步引入现有的 Java 项目中，而无需重写所有内容。

在本教程中，你将学习如何：

* 设置 Maven 或 Gradle 构建工具以同时编译 Java 和 Kotlin 代码。
* 在项目目录中组织 Java 和 Kotlin 源文件。
* 使用 IntelliJ IDEA 将 Java 文件转换为 Kotlin。

> 你可以将任何现有的 Java 项目用于本教程，或者克隆我们已配置好 Maven 和 Gradle 构建文件的公共[示例项目](https://github.com/kotlin-hands-on/kotlin-junit-sample/tree/main/complete)。
> 
> 你还可以使用我们[准备好的技能](https://github.com/Kotlin/kotlin-agent-skills/blob/main/skills/kotlin-tooling-java-to-kotlin/SKILL.md)，将转换工作移交给所选的 AI agent。请记住，AI 的处理结果并非完全可预测。
>
{style="tip"}

## 项目配置 {id="project-configuration"}

要将 Kotlin 添加到 Java 项目中，需要根据所使用的构建工具，将项目配置为同时使用 Kotlin 和 Java。

项目配置可确保 Kotlin 和 Java 代码均能正确编译，并且可以无缝相互引用。

### Maven {id="maven"}

> 从 **IntelliJ IDEA 2025.3** 开始，当你将第一个 Kotlin 文件添加到基于 Maven 的 Java 项目时，  
> IDE 会自动更新 `pom.xml` 文件以包含 Kotlin Maven 插件和标准依赖项。  
> 如果你想自定义版本或构建阶段，仍然可以手动进行配置。
>
{style="note"}

要在 Maven 项目中同时使用 Kotlin 和 Java，请应用 Kotlin Maven 插件并在 `pom.xml` 文件中添加 Kotlin 依赖项：

1. 在 `<properties>` 部分，添加 Kotlin 版本属性：

    ```xml
    ```
   {src="jvm-test-tutorial/pom.xml" ignore-vars="false" include-lines="13,17,18"}

2. 在 `<dependencies>` 部分中，向 `<plugins>` 部分添加所需依赖项：

    ```xml
    ```
   {src="jvm-test-tutorial/pom.xml" include-lines="32,38-43,45-49,55"}

3. 在 `<build><plugins>` 部分，添加 Kotlin 插件：

    ```xml
    ```
   {src="jvm-test-tutorial/pom.xml" include-lines="57-58,95-96,99-107"}

   在 Kotlin Maven 插件中启用 `<extensions>true</extensions>` 有助于：

   * 自动向项目添加 `kotlin-stdlib` 依赖项。
   * 配置执行阶段，先编译 Kotlin，再编译 Java。
   * 在 Java 代码中引用 Kotlin 代码，反之亦然。
   * 自动将 JVM 目标版本与 Java 编译器版本对齐。

   当结合扩展使用 Kotlin Maven 插件时，不需要在 `<build><pluginManagement>` 部分中配置单独的 `maven-compiler-plugin`。

4. 在 IDE 中重新加载 Maven 项目。
5. 运行测试以验证配置：

    ```bash
    ./mvnw clean test
    ```

### Gradle {id="gradle"}

要在 Gradle 项目中同时使用 Kotlin 和 Java，请应用 Kotlin JVM 插件并在 `build.gradle.kts` 文件中添加 Kotlin 依赖项：

1. 在 `plugins {}` 块中，添加 Kotlin JVM 插件：

    ```kotlin
    plugins {
        // Other plugins
        kotlin("jvm") version "%kotlinVersion%"
    }
    ```

2. 设置 JVM 工具链版本以匹配你的 Java 版本：

    ```kotlin
    kotlin {
        jvmToolchain(17)
    }
    ```

   这可确保 Kotlin 使用与 Java 代码相同的 JDK 版本。

3. 在 `dependencies {}` 块中，添加 `kotlin("test")` 库，该库提供 Kotlin 测试实用工具并与 JUnit 集成：

    ```kotlin
    dependencies {
        // Other dependencies
    
        testImplementation(kotlin("test"))
        // Other test dependencies
    }
    ```

4. 在 IDE 中重新加载 Gradle 项目。
5. 运行测试以验证配置：

    ```bash
    ./gradlew clean test
    ```

## 项目结构 {id="project-structure"}

通过此配置，你可以在相同的源目录中混合使用 Java 和 Kotlin 文件：

```none
src/
  ├── main/
  │    ├── java/          # Java 和 Kotlin 生产代码
  │    └── kotlin/        # 额外的 Kotlin 生产代码（可选）
  └── test/
       ├── java/          # Java 和 Kotlin 测试代码
       └── kotlin/        # 额外的 Kotlin 测试代码（可选）
```

你可以手动创建这些目录，或者在添加第一个 Kotlin 文件时让 IntelliJ IDEA 自动创建它们。

Kotlin 插件会自动识别 `src/main/java` 和 `src/test/java` 两个目录，因此你可以将 `.kt` 和 `.java` 文件保存在相同的目录中。

## 将 Java 文件转换为 Kotlin {id="convert-java-files-to-kotlin"}

Kotlin 插件还捆绑了一个 Java 到 Kotlin 转换器（_J2K_），可以自动将 Java 文件转换为 Kotlin。
要对某个文件使用 J2K，请在其上下文菜单或 IntelliJ IDEA 的 **Code** 菜单中点击 **Convert Java File to Kotlin File**。

![Convert Java to Kotlin](convert-java-to-kotlin.png){width=500}

虽然该转换器并非万无一失，但它能相当出色地将大部分模板代码从 Java 转换为 Kotlin。
不过，有时仍需要进行一些手动微调。

## 探索编译器插件 {initial-collapse-state="collapsed" collapsible="true" id="explore-compiler-plugins"}

如果你有一个使用 [Spring](https://spring.io/) 或 Java 持久化 API (JPA) 的更复杂项目，可以使用 Kotlin 编译器插件，这些插件会自动调整 Kotlin 的语言功能以符合框架预期，从而减少模板代码：

* **[`all-open`](all-open-plugin.md)** 插件会在配合特定注解使用时，自动将类及其成员标记为 `open`。这对于像 Spring 这样要求类为非 final 的框架尤其有用。

  对于 Spring，你可以使用专用的 [`kotlin-spring`](kotlin-spring-plugin.md) 插件，它是基于 `all-open` 的包装器。它会自动指定 Spring 注解。
* **[`no-arg`](no-arg-plugin.md)** 插件会为带有特定注解的类生成一个额外的零参数构造函数。这样，JPA 就可以实例化原本没有默认构造函数的类。

  对于 JPA，你可以使用 [`kotlin-jpa`](kotlin-jpa-plugin.md) 插件，它同时封装了 `no-arg` 和 `all-open`。它会自动指定 JPA 注解，因此实体会变为 `open` 并获得一个零参数构造函数。
* **[`power-assert`](power-assert.md)** 插件通过为断言提供包含上下文信息的详细失败消息，从而改善调试体验。它会显示中间值，并帮助你理解测试失败的原因。

## 下一步 {id="next-step"}

在 Java 项目中开始使用 Kotlin 最简单的方法是先添加 Kotlin 测试：

[将你的第一个 Kotlin 测试添加到 Java 项目中](jvm-test-using-junit.md)

### 另请参阅 {id="see-also"}

* [Kotlin 与 Java 互操作性详情](java-to-kotlin-interop.md)
* [Maven 构建配置参考](maven.md)