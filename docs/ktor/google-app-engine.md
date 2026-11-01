[//]: # (title: 将 Ktor 应用部署到 Google App Engine)

<show-structure for="chapter" depth="2"/>

<tldr>
<p>
<control>初始项目</control>：<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main">engine-main</a>
</p>
<p>
<control>最终项目</control>：<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/google-appengine-standard">google-appengine-standard</a>
</p>
</tldr>

<web-summary>
本教程演示如何准备 Ktor 项目并将其部署到 Google App Engine 标准环境中。
</web-summary>

<link-summary>
了解如何将项目部署到 Google App Engine 标准环境中。
</link-summary>

在本教程中，你将学习如何准备 Ktor 项目并将其部署到 Google App Engine 标准环境。
本教程使用 [engine-main](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main) 示例项目作为起点。

## 前提条件 {id="prerequisites"}

在开始本教程之前，请完成以下步骤：
* 在 [Google Cloud Platform](https://console.cloud.google.com/) 上注册。
* 安装并初始化 [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)。
* 使用以下命令安装适用于 Java 的 App Engine 扩展程序：
   ```Bash
   gcloud components install app-engine-java
   ```

## 克隆示例应用程序 {id="clone"}

要打开示例应用程序，请按照以下步骤操作：

1. 克隆 Ktor 文档仓库并打开 [`codeSnippets`](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets) 项目。
2. 打开 [engine-main](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main) 模块。
   > Ktor 提供了两种[创建和配置服务器](server-create-and-configure.topic)的方法：在代码中配置或在配置文件中配置。在本教程中，这两种方法的部署过程完全相同。
   >
   {style="note"}

## 准备应用程序 {id="prepare-app"}

### 步骤 1：应用 Shadow 插件 {id="configure-shadow-plugin"}

本教程演示如何使用 [fat JAR](server-fatjar.md) 将应用程序部署到 Google App Engine。要生成 fat JAR，必须应用 Shadow 插件。

首先，打开 <Path>gradle/libs.versions.toml</Path> 文件并定义 Shadow 插件版本及其别名：

```toml
[versions]
shadow = "8.3.10"

[plugins]
shadow = { id = "com.gradleup.shadow", version.ref = "shadow" }
```

然后，打开 <Path>build.gradle.kts</Path> 文件并将该插件添加到 `plugins` 块中：
```kotlin
plugins {
    alias(libs.plugins.shadow)
}
```

### 步骤 2：配置 App Engine 插件 {id="configure-app-engine-plugin"}

[Google App Engine Gradle 插件](https://github.com/GoogleCloudPlatform/app-gradle-plugin)提供了用于构建和部署 Google App Engine 应用程序的任务。要使用此插件，请按照以下步骤操作：

1. 打开 <Path>settings.gradle.kt</Path> 文件并使用以下代码引用来自 Central Maven 仓库的插件：
   ```kotlin
   pluginManagement {
       repositories {
           if (!providers.gradleProperty("build_snapshot_train").orNull.isNullOrEmpty()) {
               mavenLocal()
               maven("https://redirector.kotlinlang.org/maven/dev")
           }
           gradlePluginPortal()
           mavenCentral()
           maven("https://redirector.kotlinlang.org/maven/ktor-eap")
       }
       resolutionStrategy {
           eachPlugin {
               if (requested.id.id.startsWith("com.google.cloud.tools.appengine")) {
                   useModule("com.google.cloud.tools:appengine-gradle-plugin:${requested.version}")
   ```

2. 打开 <Path>build.gradle.kts</Path> 文件并在 `plugins` 块中应用该插件：
   ```kotlin
   plugins {
       alias(libs.plugins.appengine)
   }
   ```

3. 在同一个 <Path>build.gradle.kts</Path> 文件中，添加带有以下设置的 `appengine` 块：
   ```kotlin
   import com.google.cloud.tools.gradle.appengine.appyaml.AppEngineAppYamlExtension
   configure<AppEngineAppYamlExtension> {
       stage {
           setArtifact("build/libs/${project.name}-all.jar")
       }
       deploy {
           version = "GCLOUD_CONFIG"
           projectId = "GCLOUD_CONFIG"
       }
   }
   ```

### 步骤 3：配置 App Engine 设置 {id="configure-app-engine-settings"}

你在 [<Path>app.yaml</Path>](https://cloud.google.com/appengine/docs/standard/python/config/appref) 文件中为应用程序配置 App Engine 设置：
1. 在 <Path>src/main</Path> 内创建 <Path>appengine</Path> 目录。
2. 在该目录下创建 <Path>app.yaml</Path> 文件并添加以下内容：
   ```yaml
   runtime: java21
   entrypoint: 'java -jar google-appengine-standard-all.jar'
   
   ```

   将 `google-appengine-standard` 替换为你的项目名称。

   `entrypoint` 选项包含用于运行为该应用程序生成的 fat JAR 的命令。

   > 有关受支持配置选项的更多信息，请参阅
   > [Google AppEngine 文档](https://cloud.google.com/appengine/docs/standard/reference/app-yaml?tab=java)。
   >
   {style="tip"}

## 部署应用程序 {id="deploy-app"}

要部署应用程序，请打开一个新的终端窗口并按照以下步骤操作：

1. 首先，创建一个 Google Cloud 项目，它是容纳应用程序资源的顶级容器。例如，以下命令将创建一个名为 `ktor-sample-app-engine` 的项目：
   ```Bash
   gcloud projects create ktor-sample-app-engine --set-as-default
   ```
   
2. 为该 Cloud 项目创建 App Engine 应用程序：
   ```Bash
   gcloud app create
   ```

3. 要部署应用程序，请运行 `appengineDeploy` Gradle 任务：
   ```Bash
   ./gradlew appengineDeploy
   ```
4. 等待 Google Cloud 构建并发布应用程序：
   ```
   ...done.
   Deployed service [default] to [https://ktor-sample-app-engine.ew.r.appspot.com]
   ```
   {style="block"}
   > 如果在构建过程中收到 `Cloud Build has not been used in project` 错误，请根据错误报告中的说明将其启用。
   >
   {style="note"}

   > 有关完整代码示例，请参阅 [google-appengine-standard](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/google-appengine-standard)。
   > 
   {style="tip"}