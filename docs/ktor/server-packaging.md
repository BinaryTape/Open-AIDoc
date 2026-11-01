[//]: # (title: 创建应用程序分发包)

<tldr>
<var name="example_name" value="deployment-ktor-plugin"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

[Ktor Gradle 插件](https://github.com/ktorio/ktor-build-plugins)会自动应用 Gradle [Application 插件](https://docs.gradle.org/current/userguide/application_plugin.html)，该插件提供了打包应用程序的功能，包括代码依赖项以及生成的启动脚本。

在本主题中，你将学习如何打包并运行 Ktor 应用程序。

## 配置 Ktor 插件 {id="configure-plugin"}

要创建应用程序分发包，首先需要应用 Ktor 插件：
1. 打开 <Path>build.gradle.kts</Path> 文件，并将该插件添加到 `plugins {}` 块中：
   ```kotlin
   plugins {
       alias(ktorLibs.plugins.ktor)
   }
   ```

   <note>
       上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">Ktor 版本目录 (version catalog)</a> 来指定 Ktor 依赖项。
   </note>

2. 确保已配置[应用程序主类](server-dependencies.topic#create-entry-point)：
   ```kotlin
   application {
       mainClass.set("com.example.ApplicationKt")
   }
   ```

## 打包应用程序 {id="package"}

Application 插件提供了多种打包应用程序的方式。例如，`installDist` 任务会安装包含所有运行时依赖项和启动脚本的应用程序。要创建完整的分发归档，可以使用 `distZip` 和 `distTar` 任务。

要安装包含所有运行时依赖项和启动脚本的应用程序，请打开一个新的终端窗口并运行 `installDist` 任务：
   
<Tabs group="os">
<TabItem title="Linux/macOS" group-key="unix">
<code-block code="./gradlew installDist"/>
</TabItem>
<TabItem title="Windows" group-key="windows">
<code-block code="gradlew.bat installDist"/>
</TabItem>
</Tabs>

Application 插件会在 <Path>build/install/<project_name></Path> 文件夹中创建应用程序的镜像。

## 运行应用程序 {id="run"}

要运行[打包好的应用程序](#package)，请按照以下步骤操作：

1. 在终端中，转到 <Path>build/install/<project_name>/bin</Path> 文件夹。
2. 根据你的操作系统，运行 `<project_name>` 或 `<project_name>.bat` 可执行文件，例如：

   <snippet id="run_executable">
   <Tabs group="os">
   <TabItem title="Linux/macOS" group-key="unix">
   <code-block code="./ktor-sample"/>
   </TabItem>
   <TabItem title="Windows" group-key="windows">
   <code-block code="ktor-sample.bat"/>
   </TabItem>
   </Tabs>
   </snippet>
   
3. 等待显示以下消息：
   ```Bash
   [main] INFO  Application - Responding at http://0.0.0.0:8080
   ```
   在浏览器中打开该链接以查看正在运行的应用程序：

   <img src="ktor_idea_new_project_browser.png" alt="浏览器中的 Ktor 应用" width="430"/>