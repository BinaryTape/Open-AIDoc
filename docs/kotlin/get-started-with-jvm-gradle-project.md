[//]: # (title: Gradle 与 Kotlin/JVM 入门)

本教程演示如何使用 IntelliJ IDEA 和 Gradle 创建 JVM 控制台应用程序。

要开始使用，请首先下载并安装最新版本的 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/)。

## 创建项目 {id="create-a-project"}

1. 在 IntelliJ IDEA 中，选择 **文件 (File)** | **新建 (New)** | **项目 (Project)**。
2. 在左侧面板中，选择 **Kotlin**。
3. 为新项目命名，如有必要，可以更改其位置。

   > 勾选 **创建 Git 仓库 (Create Git repository)** 复选框以将新项目置于版本控制之下。您以后随时可以执行此操作。
   >
   {style="tip"}

   ![创建控制台应用程序](jvm-new-gradle-project.png){width=700}

4. 选择 **Gradle** 构建系统。
5. 从 **JDK** 列表中，选择您想在项目中使用的 [JDK](https://www.oracle.com/java/technologies/downloads/)。
    * 如果您的计算机上已安装 JDK 但未在 IDE 中定义，请选择 **添加 JDK (Add JDK)** 并指定 JDK 主目录的路径。
    * 如果您的计算机上没有所需的 JDK，请选择 **下载 JDK (Download JDK)**。

6. 为 Gradle 选择 **Kotlin** DSL。
7. 勾选 **添加示例代码 (Add sample code)** 复选框，以创建一个带有示例 `"Hello World!"` 应用程序的文件。
8. 点击 **创建 (Create)**。

您已成功使用 Gradle 创建了一个项目！

#### 为您的项目指定 Gradle 版本 {initial-collapse-state="collapsed" collapsible="true" id="specify-a-gradle-version-for-your-project"}

您可以在 **高级设置 (Advanced Settings)** 部分下显式为项目指定 Gradle 版本，可以使用 Gradle Wrapper 或本地安装的 Gradle：

* **Gradle Wrapper：**
   1. 从 **Gradle 分发 (Gradle distribution)** 列表中，选择 **Wrapper**。
   2. 取消勾选 **自动选择 (Auto-select)** 复选框。
   3. 从 **Gradle 版本 (Gradle version)** 列表中，选择您的 Gradle 版本。
* **本地安装：**
   1. 从 **Gradle 分发 (Gradle distribution)** 列表中，选择 **本地安装 (Local installation)**。 
   2. 对于 **Gradle 位置 (Gradle location)**，指定您本地 Gradle 版本的路径。

   ![高级设置](jvm-new-gradle-project-advanced.png){width=700}

## 探索构建脚本 {id="explore-the-build-script"}

打开 `build.gradle.kts` 文件。这是 Gradle Kotlin 构建脚本，其中包含 Kotlin 相关的构件以及应用程序所需的其他部分：

```kotlin
plugins {
    kotlin("jvm") version "%kotlinVersion%" // 要使用的 Kotlin 版本
}

group = "org.example" // 公司名称，例如 `org.jetbrains.kotlin`
version = "1.0-SNAPSHOT" // 分配给构建构件的版本

repositories { // 依赖项来源。参见 1️⃣
    mavenCentral() // Maven 中央仓库。参见 2️⃣
}

dependencies { // 您想要使用的所有库。参见 3️⃣
    // 在仓库中找到依赖项后复制其名称
    testImplementation(kotlin("test")) // Kotlin 测试库
}

kotlin { // 生成的 JVM 工具链配置。参见 4️⃣
    jvmToolchain(25) // 用于编译项目的 JDK。
}

tasks.test { // 测试任务配置。参见 5️⃣ 
    useJUnitPlatform() // 用于测试的 JUnitPlatform。参见 6️⃣
}
```

* 1️⃣ 详细了解 [依赖项来源](https://docs.gradle.org/current/userguide/declaring_repositories.html)。
* 2️⃣ [Maven 中央仓库](https://central.sonatype.com/)。也可以是 [Google 的 Maven 仓库](https://maven.google.com/) 或您公司的私有仓库。
* 3️⃣ 详细了解 [声明依赖项](https://docs.gradle.org/current/userguide/declaring_dependencies.html)。
* 4️⃣ 详细了解 [Java 工具链支持](gradle-configure-project.md#gradle-java-toolchains-support)。
* 5️⃣ 详细了解 [任务 (tasks)](https://docs.gradle.org/current/dsl/org.gradle.api.Task.html)。
* 6️⃣ [用于测试的 JUnitPlatform](https://docs.gradle.org/current/javadoc/org/gradle/api/tasks/testing/Test.html#useJUnitPlatform)。

如您所见，Gradle 构建文件中添加了一些 Kotlin 特有的构件：

1. 在 `plugins {}` 块中，有 `kotlin("jvm")` 构件。该插件定义了项目中要使用的 Kotlin 版本。

2. 在 `dependencies {}` 块中，有 `testImplementation(kotlin("test"))`。 
   详细了解 [设置测试库依赖项](gradle-configure-project.md#set-dependencies-on-test-libraries)。

## 运行应用程序 {id="run-the-application"}

1. 通过选择 **视图 (View)** | **工具窗口 (Tool Windows)** | **Gradle** 打开 Gradle 窗口：

   ![包含 main 函数的 Main.kt](jvm-gradle-view-build.png){width=450}

2. 执行 `Tasks/build` 中的 **build** Gradle 任务。在 **构建 (Build)** 窗口中，会出现 `BUILD SUCCESSFUL`。
   这意味着 Gradle 成功构建了应用程序。

3. 在 `src/main/kotlin` 中，打开 `Main.kt` 文件：
   * `src` 目录包含 Kotlin 源文件和资源。 
   * `Main.kt` 文件包含将打印 `Hello World!` 的示例代码。

4. 点击装订区域中的绿色 **运行 (Run)** 图标并选择 **运行 'MainKt' (Run 'MainKt')** 来运行应用程序。

   ![运行控制台应用程序](jvm-run-app-gradle.png){width=350}

您可以在 **运行 (Run)** 工具窗口中查看结果：

![Kotlin 运行输出](jvm-output-gradle.png){width=700}

恭喜！您刚刚运行了您的第一个 Kotlin 应用程序。

## 下一步做什么？ {id="what-s-next"}

详细了解：
* [Gradle 构建文件属性](https://docs.gradle.org/current/dsl/org.gradle.api.Project.html#N14E9A)。
* [针对不同平台并设置库依赖项](gradle-configure-project.md)。
* [编译器选项及其传递方式](gradle-compiler-options.md)。
* [增量编译、缓存支持、构建报告和 Kotlin 守护进程](gradle-compilation-and-caches.md)。