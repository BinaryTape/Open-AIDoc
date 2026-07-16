[//]: # (title: 创建应用程序分发)

<tldr>
<var name="example_name" value="deployment-ktor-plugin"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

[Ktor Gradle 插件](https://github.com/ktorio/ktor-build-plugins)会自动应用 Gradle [Application 插件](https://docs.gradle.org/current/userguide/application_plugin.html)，该插件提供了打包应用程序的能力，包括代码依赖项和生成的启动脚本。在本主题中，我们将向您展示如何打包和运行 Ktor 应用程序。

## 配置 Ktor 插件 {id="configure-plugin"}
要创建应用程序分发，您需要先应用 Ktor 插件：
1. 打开 `build.gradle.kts` 文件并将该插件添加到 `plugins` 块中：
   ```kotlin
   plugins {
       id("io.ktor.plugin") version "3.4.0"
   }
   ```

2. 确保已配置 [主应用程序类](server-dependencies.topic#create-entry-point)：
   ```kotlin
   application {
       mainClass.set("com.example.ApplicationKt")
   }
   ```

## 打包应用程序 {id="package"}
Application 插件提供了多种打包应用程序的方式，例如，`installDist` 任务会安装包含所有运行时依赖项和启动脚本的应用程序。要创建完整的分发归档文件，您可以使用 `distZip` 和 `distTar` 任务。

在本主题中，我们将使用 `installDist`：
1. 打开终端。
2. 根据您的操作系统，通过以下方式之一运行 `installDist` 任务：
   
   <Tabs group="os">
   <TabItem title="Linux/macOS" group-key="unix">
   <code-block code="./gradlew installDist"></code-block>
   </TabItem>
   <TabItem title="Windows" group-key="windows">
   <code-block code="gradlew.bat installDist"></code-block>
   </TabItem>
   </Tabs>

   Application 插件将在 `build/install/<project_name>` 文件夹中创建应用程序的映像。

## 运行应用程序 {id="run"}
要运行 [已打包的应用程序](#package)：
1. 在终端中转到 `build/install/<project_name>/bin` 文件夹。
2. 根据您的操作系统，运行 `<project_name>` 或 `<project_name>.bat` 可执行文件，例如：

   <snippet id="run_executable">
   <Tabs group="os">
   <TabItem title="Linux/macOS" group-key="unix">
   <code-block code="./ktor-sample"></code-block>
   </TabItem>
   <TabItem title="Windows" group-key="windows">
   <code-block code="ktor-sample.bat"></code-block>
   </TabItem>
   </Tabs>
   </snippet>
   
3. 等待直到显示以下消息：
   ```Bash
   [main] INFO  Application - Responding at http://0.0.0.0:8080
   ```
   在浏览器中打开链接以查看运行中的应用程序：

   <img src="ktor_idea_new_project_browser.png" alt="浏览器中的 Ktor 应用" width="430"/>