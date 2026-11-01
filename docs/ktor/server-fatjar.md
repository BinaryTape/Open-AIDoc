[//]: # (title: 使用 Ktor Gradle 插件创建 Fat JAR)

<tldr>
<var name="example_name" value="deployment-ktor-plugin"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>了解如何使用 Ktor Gradle 插件创建并运行可执行的 fat JAR。</link-summary>

[Ktor Gradle 插件](https://github.com/ktorio/ktor-build-plugins)允许您创建并运行包含所有代码依赖项的可执行 JAR（fat JAR）。

## 配置 Ktor 插件 {id="configure-plugin"}

要构建 fat JAR，首先需要配置 Ktor 插件：

1. 打开 <Path>build.gradle.kts</Path> 文件，并将 Ktor 插件添加到 `plugins {}` 块中：
   ```kotlin
   plugins {
       alias(ktorLibs.plugins.ktor)
   }
   ```

   <note>
       上面的代码段使用 <a href="server-dependencies.topic#using-version-catalog">
       Ktor version catalog</a> 来指定 Ktor 依赖项。
   </note>

2. 确保已配置[应用程序主类](server-dependencies.topic#create-entry-point)：
   ```kotlin
   application {
       mainClass.set("com.example.ApplicationKt")
   }
   ```

3. （可选）您可以使用 `ktor.fatJar` 扩展配置要生成的 fat JAR 的名称：
   ```kotlin
   ktor {
       fatJar {
           archiveFileName.set("fat.jar")
       }
   }
   ```

> 如果将 Ktor Gradle 插件与 Kotlin Multiplatform Gradle 插件一起应用，fat JAR 创建功能将自动禁用。
> 要同时使用它们：
> 1. 按照上述步骤创建一个应用了 Ktor Gradle 插件的纯 JVM 项目。
> 2. 将 Kotlin Multiplatform 项目作为依赖项添加到该纯 JVM 项目中。
> 
> 如果此变通方案无法解决您的问题，请在 [KTOR-8464](https://youtrack.jetbrains.com/issue/KTOR-8464) 中留言告知我们。
>
{style="warning"}

## 构建并运行 fat JAR {id="build"}

Ktor 插件提供了以下用于创建和运行 fat JAR 的任务：
- `buildFatJar`：构建包含项目及运行时依赖项的合并 JAR。构建完成后，您应该会在 `build/libs` 目录中看到 `***-all.jar` 文件。
- `runFatJar`：构建项目的 fat JAR 并运行它。

> 要了解如何使用 ProGuard 最小化生成的 JAR，请参阅 [proguard](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/proguard) 示例。