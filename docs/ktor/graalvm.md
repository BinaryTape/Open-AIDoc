[//]: # (title: GraalVM)

<tldr>
<p>
<control>示例项目</control>：<a href="https://github.com/ktorio/ktor-samples/tree/main/graalvm">graalvm</a>
</p>
</tldr>

<web-summary>
Ktor Server 应用程序可以利用 GraalVM 为不同平台构建原生映像。
</web-summary>
<link-summary>
了解如何利用 GraalVM 为不同平台构建原生映像。
</link-summary>

Ktor Server 应用程序可以利用 [GraalVM](https://graalvm.org) 为不同平台构建原生映像，当然，还可以充分利用 GraalVM 带来的更快启动时间以及其他优势。

目前，想要利用 GraalVM 的 Ktor Server 应用程序必须使用 CIO 作为[应用程序引擎](server-engines.md)。

## 准备 GraalVM {id="prepare-for-graalvm"}

除了安装 GraalVM 并将安装目录添加到系统路径之外，还需要准备好应用程序以打包所有依赖项，即需要创建一个 fat jar。

### 反射配置 {id="reflection-configuration"}

对于使用反射的应用程序（Ktor 正属于此类），GraalVM 有[一些要求](https://www.graalvm.org/22.1/reference-manual/native-image/Reflection/)。
它要求提供包含特定类型信息的 [JSON 文件](https://github.com/ktorio/ktor-samples/blob/main/graalvm/src/main/resources/META-INF/native-image/reflect-config.json)。然后将此配置文件作为实参传递给 `native-image` 工具。

## 执行 `native-image` 工具 {id="execute-the-native-image-tool"}

fat jar 准备就绪后，唯一需要执行的步骤就是使用 `native-image` 命令行工具创建原生映像。
这也可以通过 [Gradle 插件](https://graalvm.github.io/native-build-tools/0.9.8/gradle-plugin.html)来完成。
可以在[此处](https://github.com/ktorio/ktor-samples/blob/main/graalvm/build.gradle.kts)查看 `build.gradle.kts` 文件的示例。
但请注意，某些选项可能会因所使用的依赖项、项目的软件包名称等而有所不同。

## 运行生成的二进制文件 {id="run-the-resulting-binary"}

如果 shell 脚本执行无误，你将获得一个原生应用程序，在本示例中名为 `graal-server`。运行它将启动 Ktor Server，并在 `https://0.0.0.0:8080` 上进行响应。

[//]: # (<tldr>)

[//]: # (<var name="example_name" value="deployment-ktor-plugin"/>)

[//]: # (<p>
    <b>代码示例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>)

[//]: # (</tldr>)

[//]: # ()
[//]: # (<link-summary>)

[//]: # (Ktor Server 应用程序可以利用 GraalVM 为不同平台构建原生映像。)

[//]: # (</link-summary>)

[//]: # ()
[//]: # (Ktor Server 应用程序可以利用 [GraalVM]&#40;https://graalvm.org&#41; 为不同平台构建原生映像，当然，还可以充分利用 GraalVM 带来的更快启动时间以及其他优势。[Ktor Gradle 插件]&#40;https://github.com/ktorio/ktor-build-plugins&#41; 允许构建项目的 GraalVM 原生映像。)

[//]: # ()
[//]: # (> 目前，想要利用 GraalVM 的 Ktor Server 应用程序必须使用 CIO 作为[应用程序引擎]&#40;Engines.md&#41;。)

[//]: # ()
[//]: # (## 准备 GraalVM)

[//]: # ()
[//]: # (在构建项目的 GraalVM 原生映像之前，请确保满足以下先决条件：)

[//]: # (- 已安装 [GraalVM]&#40;https://www.graalvm.org/docs/getting-started/&#41; 和 [Native Image]&#40;https://www.graalvm.org/reference-manual/native-image/&#41;。)

[//]: # (- 已设置 `GRAALVM_HOME` 和 `JAVA_HOME` 环境变量。)

[//]: # ()
[//]: # (## 配置 Ktor 插件 {id="configure-plugin"})

[//]: # (要构建原生可执行文件，首先需要配置 Ktor 插件：)

[//]: # (1. 打开 `build.gradle.kts` 文件并将插件添加到 `plugins` 块中：)

[//]: # (   ```kotlin)

[//]: # (   ```)

[//]: # (   {src="snippets/deployment-ktor-plugin/build.gradle.kts" include-lines="1,4-5"})

[//]: # ()
[//]: # (2. 确保已配置[主应用程序类]&#40;server-dependencies.xml#create-entry-point&#41;：)

[//]: # (   ```kotlin)

[//]: # (   ```)

[//]: # (   {src="snippets/deployment-ktor-plugin/build.gradle.kts" include-lines="7-9"})

[//]: # ()
[//]: # (## 构建并运行原生可执行文件 {id="build"})

[//]: # ()
[//]: # (Ktor 插件提供的 `buildNativeImage` 任务会在 `build/native/nativeCompile` 目录中生成带有应用程序的原生可执行文件。)

[//]: # (执行它将启动 Ktor 服务器，默认在 `https://0.0.0.0:8080` 上进行响应。)