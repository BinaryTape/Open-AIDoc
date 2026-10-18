[//]: # (title: 使用 Kotlin 和 JUnit 测试 Java 代码 – 教程)

<web-summary>配置使用 Maven 或 Gradle 构建的 Java 项目，以集成使用 Kotlin 编写的 JUnit 测试。</web-summary>

Kotlin 与 Java 完全互操作，这意味着你可以使用 Kotlin 为 Java 代码编写测试，并在同一个项目中将它们与现有的 Java 测试一起运行。

在本教程中，你将学习如何：

* 配置 Java–Kotlin 混合项目以使用 [JUnit](https://junit.org/) 运行测试。
* 添加用于验证 Java 代码的 Kotlin 测试。
* 使用 Maven 或 Gradle 运行测试。

> 在开始之前，请确保你已具备：
>
> * 安装了 [Kotlin 扩展程序](https://github.com/Kotlin/kotlin-lsp/tree/main?tab=readme-ov-file#vs-code-quick-start) 的 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/) 或 [VS Code](https://code.visualstudio.com/Download)。
> * Java 17 或更高版本。
>
{style="note"}

## 配置项目 {id="configure-the-project"}

1. 在 IDE 中，从版本控制克隆示例项目：

   ```text
   https://github.com/kotlin-hands-on/kotlin-junit-sample.git
   ```

2. 导航到 `initial` 模块并查看项目结构：

    ```text
    kotlin-junit-sample/
    ├── initial/
    │   ├── src/
    │   │   ├── main/java/    # Java 源代码
    │   │   └── test/java/    # Java 编写的 JUnit 测试
    │   ├── pom.xml           # Maven 配置
    │   └── build.gradle.kts  # Gradle 配置
    ```

   `initial` 模块包含一个用 Java 编写的简单待办事项（Todo）应用程序以及一个测试。

3. 在同一目录下，打开你的构建文件并更新其内容以支持 Kotlin：

    <tabs group="build-system">
    <tab title="Maven" group-key="maven">

    ```xml
    ```
   {src="jvm-test-tutorial/pom.xml" initial-collapse-state="collapsed" collapsible="true" ignore-vars="false" collapsed-title="pom.xml file"}

    * 在 `<properties>` 部分中，设置 Kotlin 版本。
    * 在 `<dependencies>` 部分中，添加 JUnit Jupiter 依赖项以运行测试。
    * 在 `<build><plugins>` 部分中，应用 `kotlin-maven-plugin` 并将 `<extensions>` 设置为 `true`。它会自动将相应的执行目标以及 `kotlin-stdlib` 依赖项添加到构建中。
    * 当配合扩展使用 Kotlin Maven 插件时，你无需将 `maven-compiler-plugin` 添加到 `<build><pluginManagement>` 部分。

    </tab>
    <tab title="Gradle" group-key="gradle">

    ```kotlin
    // build.gradle.kts
    group = "org.jetbrains.kotlin"
    version = "1.0-SNAPSHOT"
    description = "kotlin-junit-complete"
    java.sourceCompatibility = JavaVersion.VERSION_17
    
    plugins {
        application
        kotlin("jvm") version "%kotlinVersion%"
    }

    kotlin {
        jvmToolchain(17)
    }

    application {
        mainClass.set("org.jetbrains.kotlin.junit.App")
    }

    repositories {
        mavenCentral()
    }

    dependencies {
        implementation("com.gitlab.klamonte:jexer:1.6.0")

        testImplementation(kotlin("test"))
        testImplementation(libs.org.junit.jupiter.junit.jupiter.api)
        testImplementation(libs.org.junit.jupiter.junit.jupiter.params)
        testRuntimeOnly(libs.org.junit.jupiter.junit.jupiter.engine)
        testRuntimeOnly(libs.org.junit.platform.junit.platform.launcher)
    }

    tasks.test {
        useJUnitPlatform()
    }
    ```
   {initial-collapse-state="collapsed" collapsible="true" collapsed-title="build.gradle.kts"}

    * 在 `plugins {}` 块中，添加 `kotlin("jvm")` 插件。
    * 设置 JVM toolchain 版本以匹配你的 Java 版本。
    * 在 `dependencies {}` 块中，添加提供 Kotlin 测试实用工具并与 JUnit 集成的 `kotlin.test` 库。
      
    Kotlin/JVM 支持最新的稳定 JUnit 版本 JUnit 6。你可以在 `gradle/libs.versions.toml` 版本目录中找到它。
   
    如果你通常倾向于使用版本目录，甚至可以在其中添加 `kotlin("jvm")` 插件：

    ```toml
    # gradle/libs.versions.toml
    [versions]
    kotlin = "%kotlinVersion%"
    junit = "6.0.3"

    [libraries]
    org-junit-jupiter-junit-jupiter-api = { module = "org.junit.jupiter:junit-jupiter-api", version.ref = "junit" }
    org-junit-jupiter-junit-jupiter-params = { module = "org.junit.jupiter:junit-jupiter-params", version.ref = "junit" }
    org-junit-jupiter-junit-jupiter-engine = { module = "org.junit.jupiter:junit-jupiter-engine", version.ref = "junit" }
    org-junit-platform-junit-platform-launcher = { module = "org.junit.platform:junit-platform-launcher" }
      
    [plugins]
    kotlinJvm = { id = "org.jetbrains.kotlin.jvm", version.ref = "kotlin" }
    ```
    {initial-collapse-state="collapsed" collapsible="true" collapsed-title="libs.versions.toml"}

    </tab>
    </tabs>

4. 在 IDE 中重新加载构建文件。

有关构建文件设置的更多详细说明，请参阅[项目配置](mixing-java-kotlin-intellij.md#project-configuration)。

## 添加你的第一个 Kotlin 测试 {id="add-your-first-kotlin-test"}

`initial/src/test/java` 中的 `TodoItemTest.java` 测试已经验证了应用的基础功能：条目创建、默认值、唯一 ID 以及状态更改。

你可以通过添加一个验证仓库级行为的 Kotlin 测试来扩展测试覆盖率：

1. 导航到相同的测试源目录 `initial/src/test/java`。
2. 在与 Java 测试相同的包中创建一个 `TodoRepositoryTest.kt` 文件。
3. 创建包含字段声明和设置函数的测试类：

   ```kotlin
   package org.jetbrains.kotlin.junit

   import org.junit.jupiter.api.BeforeEach
   import org.junit.jupiter.api.Assertions
   import org.junit.jupiter.api.Test
   import org.junit.jupiter.api.DisplayName

   internal class TodoRepositoryTest {
       lateinit var repository: TodoRepository
       lateinit var testItem1: TodoItem
       lateinit var testItem2: TodoItem

       @BeforeEach
       fun setUp() {
           repository = TodoRepository()
           testItem1 = TodoItem("Task 1", "Description 1")
           testItem2 = TodoItem("Task 2", "Description 2")
       }
   }
   ```

    * JUnit 注解在 Kotlin 中的工作方式与在 Java 中相同。
    * 在 Kotlin 中，[`lateinit` 关键字](properties.md#late-initialized-properties-and-variables)允许声明稍后初始化的非 null 属性。这有助于避免在测试中使用可空类型（`TodoRepository?`）。

4. 在 `TodoRepositoryTest` 类中添加一个测试，以检查初始仓库状态及其大小：

   ```kotlin
   @Test
   @DisplayName("Should start with empty repository")
   fun shouldStartEmpty() {
       Assertions.assertEquals(0, repository.size())
       Assertions.assertTrue(repository.all.isEmpty())
   }
   ```

    * 与 Java 静态导入不同，Jupiter 的 `Assertions` 作为类导入，并用作断言函数的限定符。
    * 在 Kotlin 中，你可以使用 `repository.all` 将 Java getter 作为属性访问，而不是调用 `.getAll()`。

5. 编写另一个测试以验证所有条目的防御性复制行为：

   ```kotlin
   @Test
   @DisplayName("Should return defensive copy of items")
   fun shouldReturnDefensiveCopy() {
       repository.add(testItem1)

       val items1 = repository.all
       val items2 = repository.all

       Assertions.assertNotSame(items1, items2)
       Assertions.assertThrows(
           UnsupportedOperationException::class.java
       ) { items1.clear() }
       Assertions.assertEquals(1, repository.size())
   }
   ```

    * 要从 Kotlin 类获取 Java 类对象，请使用 `::class.java`。
    * 你可以将复杂的断言拆分为多行，而无需使用任何特殊的延续字符。

6. 添加测试以验证按 ID 查找条目：

   ```kotlin
   @Test
   @DisplayName("Should find item by ID")
   fun shouldFindItemById() {
       repository.add(testItem1)
       repository.add(testItem2)

        val found = repository.getById(testItem1.id())

        Assertions.assertTrue(found.isPresent)
        Assertions.assertEquals(testItem1, found.get())
   }
   ```

   Kotlin 可以与 Java [`Optional` API](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Optional.html) 无缝协作。它会自动将 getter 方法转换为属性，这就是为什么在此处将 `isPresent()` 方法作为属性访问的原因。

7. 编写一个测试以验证条目移除机制：

   ```kotlin
    @Test
    @DisplayName("Should remove item by ID")
    fun shouldRemoveItemById() {
        repository.add(testItem1)
        repository.add(testItem2)

        val removed = repository.remove(testItem1.id())

        Assertions.assertTrue(removed)
        Assertions.assertEquals(1, repository.size())
        Assertions.assertTrue(repository.getById(testItem1.id()).isEmpty)
        Assertions.assertTrue(repository.getById(testItem2.id()).isPresent)
    }
   
    @Test
    @DisplayName("Should return false when removing non-existent item")
    fun shouldReturnFalseForNonExistentRemoval() {
        repository.add(testItem1)

        val removed = repository.remove("non-existent-id")

        Assertions.assertFalse(removed)
        Assertions.assertEquals(1, repository.size())
    }
   ```

   在 Kotlin 中，你可以链式调用方法和访问属性，例如 `repository.getById(id).isEmpty`。

> 你可以向 `TodoRepositoryTest` 测试类添加更多测试以涵盖其他功能。
> 完整的源代码请参阅示例项目的 [`complete`](https://github.com/kotlin-hands-on/kotlin-junit-sample/blob/main/complete/src/test/java/org/jetbrains/kotlin/junit/TodoRepositoryTest.kt) 模块。
>
{style="tip"}

## 运行测试 {id="run-tests"}

运行 Java 和 Kotlin 测试以验证你的项目是否按预期工作：

1. 使用装订区域图标运行测试：

   ![运行测试](run-test.png)

   你也可以在命令行中从 `initial` 目录运行所有项目测试：

    <tabs group="build-system">
    <tab title="Maven" group-key="maven">

    ```bash
    mvn test
    ```

    </tab>
    <tab title="Gradle" group-key="gradle">

    ```bash
    ./gradlew test
    ```

    </tab>
    </tabs>

2. 通过修改其中一个变量的值来检查测试是否正常工作。
   例如，修改 `shouldAddItem` 测试以期望错误的仓库大小：

   ```kotlin
   @Test
   @DisplayName("Should add item to repository")
   fun shouldAddItem() {
       repository.add(testItem1)

       Assertions.assertEquals(2, repository.size())  // 从 1 改为 2
       Assertions.assertTrue(repository.all.contains(testItem1))
   }
   ```

3. 再次运行测试并验证它是否失败：

   ![检查测试结果。测试失败](test-failed.png)

> 你可以在示例项目的 [`complete`](https://github.com/kotlin-hands-on/kotlin-junit-sample/tree/main/complete) 模块中找到配置完整的项目及测试。
>
{style="tip"}

## 后续步骤 {id="what-s-next"}

* 详细了解[使用 Maven 测试 Kotlin 项目](jvm-test-maven.md)。
* 在 [Kotlin 后端开发常见问题解答](jvm-backend-faq.md)中寻找常见问题的答案。