[//]: # (title: 将 Ktor 应用程序部署到 AWS Elastic Beanstalk)

<show-structure for="chapter" depth="2"/>

<tldr>
<p>
<control>初始项目</control>：<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/embedded-server">embedded-server</a> 或 
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main">engine-main</a>
</p>
<p>
<control>最终项目</control>：<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/aws-elastic-beanstalk">aws-elastic-beanstalk</a>
</p>
</tldr>

在本教程中，您将学习如何准备 Ktor 应用程序并将其部署到 Amazon Web Services (AWS) Elastic Beanstalk。
根据用于[创建 Ktor 服务器](server-create-and-configure.topic)的方式，您可以使用以下初始项目之一：
* [embedded-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/embedded-server)
* [engine-main](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main)

> 要了解更多有关将 Java 应用程序部署到 AWS Elastic Beanstalk 的信息，请参阅 [Elastic Beanstalk 文档](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/create_deploy_Java.html)。
>
{style="tip"}

## 前提条件 {id="prerequisites"}

在开始本教程之前，您需要创建一个 AWS 账户。

## 克隆示例应用程序 {id="clone"}
若要打开示例应用程序，请按照以下步骤操作：

1. 克隆 Ktor 文档仓库并打开 [codeSnippets](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets) 项目。
2. 打开 [embedded-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/embedded-server) 或 [engine-main](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main) 示例。这些示例演示了[创建和配置 Ktor 服务器](server-create-and-configure.topic)的不同方法：在代码中或使用配置文件。部署这些项目的唯一区别在于如何[指定用于侦听传入请求的端口](#port)。

## 准备应用程序 {id="prepare-app"}

### 第 1 步：配置端口 {id="port"}

首先，您需要指定用于侦听传入请求的端口。Elastic Beanstalk 会在 5000 端口上将请求转发给您的应用程序。或者，您可以通过设置 `PORT` 环境变量来覆盖默认端口。根据用于[配置 Ktor 服务器](server-create-and-configure.topic)的方式，您可以通过以下方式之一配置端口：
* 如果您选择了在代码中指定服务器配置的 [embedded-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/embedded-server) 示例，您可以使用 `System.getenv` 获取环境变量值，或者在未指定环境变量时使用默认值 _5000_。打开位于 `src/main/kotlin/com/example` 文件夹中的 `Application.kt` 文件，并按如下所示修改 `embeddedServer` 函数的 `port` 形参值：
   ```kotlin
   fun main() {
      embeddedServer(Netty, port = (System.getenv("PORT")?:"5000").toInt()) {
      // ...
      }.start(wait = true)
   }
    ```

* 如果您选择了在 `application.conf` 文件中指定服务器配置的 [engine-main](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main) 示例，您可以使用 `${ENV}` 语法将环境变量赋值给 `port` 形参。打开位于 `src/main/resources` 中的 `application.conf` 文件，并按如下所示进行更新：
   ```
   ktor {
       deployment {
           port = 5000
           port = ${?PORT}
       }
   }
   ```

### 第 2 步：应用 Ktor 插件 {id="configure-ktor-plugin"}

本教程展示了如何使用 [fat JAR](server-fatjar.md) 将应用程序部署到 AWS Elastic Beanstalk。要生成 fat JAR，您需要应用 Ktor 插件。

打开 <Path>build.gradle.kts</Path> 文件并将该插件添加到 `plugins {}` 块中：
```groovy
plugins {
    alias(ktorLibs.plugins.ktor)
}
```

<note>
    上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">
    Ktor 版本目录</a> 来指定 Ktor 依赖项。
</note>

然后，确保已配置[主应用程序类](server-dependencies.topic#create-entry-point)：
```kotlin
application {
    mainClass.set("io.ktor.server.netty.EngineMain")
}
```

## 构建 Fat JAR {id="build"}

要构建 Fat JAR，请打开终端并运行 [Ktor 插件](#configure-ktor-plugin)提供的 `buildFatJar` 任务：

<Tabs group="os">
<TabItem title="Linux/macOS" group-key="unix">
<code-block code="./gradlew :aws-elastic-beanstalk:buildFatJar"/>
</TabItem>
<TabItem title="Windows" group-key="windows">
<code-block code="gradlew.bat :aws-elastic-beanstalk:buildFatJar"/>
</TabItem>
</Tabs>

构建完成后，您应该可以在 <Path>build/libs</Path> 目录下看到 `aws-elastic-beanstalk-all.jar` 文件。

## 部署应用程序 {id="deploy-app"}
要部署应用程序，请登录 [AWS 管理控制台](https://aws.amazon.com/console/)并按照以下步骤操作：
1. 打开 **AWS services** 组中的 **Elastic Beanstalk** 服务。
2. 在打开的页面上，点击 **Create Application**。
3. 指定以下应用程序设置：
   * **Application name**：指定应用程序名称（例如，_Sample Ktor app_）。
   * **Platform**：从列表中选择 _Java_。
   * **Platform branch**：选择 _Corretto 11 running on 64bit Amazon Linux 2_。
   * **Application code**：选择 _Upload your code_。
   * **Source code origin**：选择 _Local file_。然后点击 **Choose file** 按钮，并选择在[上一步](#build)中生成的 Fat JAR。等待文件上传完成。
4. 点击 **Create application** 按钮，并等待几分钟，直到 Beanstalk 创建环境并发布应用程序：
   ```
   INFO    Instance deployment completed successfully.
   INFO    Application available at Samplektorapp-env.eba-bnye2kpu.us-east-2.elasticbeanstalk.com.
   INFO    Successfully launched environment: Samplektorapp-env
   ```
   {style="block"}