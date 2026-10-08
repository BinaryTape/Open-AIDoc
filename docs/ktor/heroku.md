[//]: # (title: Heroku)

<show-structure for="chapter" depth="2"/>

<link-summary>了解如何准备 Ktor 应用程序并将其部署到 Heroku。</link-summary>

在本教程中，您将学习如何准备 Ktor 应用程序并将其部署到 Heroku。

## 前提条件 {id="prerequisites"}

在开始本教程之前，请确保满足以下前提条件：
* 您拥有一个 Heroku 帐户。
* 您的计算机上已安装 [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)。

## 创建示例应用程序 {id="create-sample-app"}

按照[创建、打开和运行新的 Ktor 项目](server-create-a-new-project.topic)中所述创建一个示例应用程序。

> Ktor 提供了两种[创建和配置服务器](server-create-and-configure.topic)的方法：在代码中或使用配置文件。部署时的唯一区别在于如何[指定端口](#port)以侦听传入的请求。
> 
{style="note"}

## 准备应用程序 {id="prepare-app"}

### 第 1 步：配置端口 {id="port"}

首先，指定一个用于侦听传入请求的端口。由于 Heroku 使用 `PORT` 环境变量，因此您需要将应用程序配置为使用该变量的值。根据[配置 Ktor 服务器](server-create-and-configure.topic)的方式，执行以下操作之一：
* 如果在代码中指定服务器配置，可以使用 `System.getenv` 获取环境变量值。打开位于 `<Path>src/main/kotlin/com/example</Path>` 文件夹中的 `<Path>Application.kt</Path>` 文件，并更改 `embeddedServer()` 函数的 `port` 形参值：

   ```kotlin
   fun main() {
      embeddedServer(Netty, port = System.getenv("PORT")?.toIntOrNull() ?: 8080) {
          // ...
      }.start(wait = true)
   }
    ```

* 如果在 `<Path>application.conf</Path>` 文件中指定服务器配置，可以使用 `${ENV}` 语法将环境变量分配给 `port` 形参。打开位于 `<Path>src/main/resources</Path>` 中的 `<Path>application.conf</Path>` 文件，并按如下所示进行更新：

   ```
   ktor {
       deployment {
           port = 8080
           port = ${?PORT}
       }
   }
   ```

### 第 2 步：添加 stage 任务 {id="stage"}

打开 `<Path>build.gradle.kts</Path>` 文件并添加一个自定义的 `stage` 任务。Heroku 使用 `stage` 任务来制作一个在 Heroku 平台上运行的可执行文件：

```kotlin
tasks {
    create("stage").dependsOn("installDist")
}
``` 

> `installDist` 任务随 Gradle [application 插件](https://docs.gradle.org/current/userguide/application_plugin.html)一起提供，该插件已添加到示例项目中。
>
{style="note"}

### 第 3 步：创建 Procfile {id="procfile"}

在项目根目录中创建一个 [Procfile](https://devcenter.heroku.com/articles/procfile) 并添加以下内容：

```
web: ./build/install/ktor-get-started-sample/bin/ktor-get-started-sample
```

此文件指定了由 [`stage`](#stage) 任务生成的应用程序可执行文件的路径，并允许 Heroku 启动应用程序。
您可能需要将 `ktor-get-started-sample` 替换为您的项目名称。

### 第 4 步：指定 Java 版本（可选） {id="java-version"}

默认情况下，Heroku 使用 Java 25 运行您的应用程序。如果您的 Ktor 应用程序是使用其他 Java 版本编译的，则需要显式指定该版本以避免部署失败。

要指定 Java 版本，请在项目的根文件夹中创建一个 `<Path>system.properties</Path>` 文件，内容如下：

```bash
java.runtime.version=21
```

将 `21` 替换为您所需的 Java 版本。

> 要了解更多信息，请参阅 [Heroku 关于指定 Java 版本的文档](https://devcenter.heroku.com/articles/java-support#specifying-a-java-version)。
>
{style="tip"}

## 部署应用程序 {id="deploy-app"}

要使用 Git 将应用程序部署到 Heroku，请打开一个新的终端窗口并按照以下步骤操作：

1. 在本地提交在[上一节](#prepare-app)中所做的更改：
   ```Bash
   git add .
   git commit -m "Prepare app for deploying"
   ```
2. 登录 Heroku CLI：
   ```Bash
   heroku login
   ```
3. 使用 `heroku create` 命令创建 Heroku 应用程序。将 `ktor-sample-heroku` 替换为您的应用程序名称：
   ```Bash
   heroku create ktor-sample-heroku
   ```
   此命令执行两项操作：
   * 创建一个新的 Heroku 应用程序，可在 [Web 仪表板](https://dashboard.heroku.com/apps/)上查看。
   * 向本地仓库添加一个名为 `heroku` 的新 Git 远程仓库。

4. 要部署应用程序，请将更改推送到 `heroku main`：
   ```Bash
   git push heroku main
   ```
5. 等待 Heroku 构建并发布应用程序。完成后，您应该会看到以下输出：
   ```bash
   ...
   remote: https://ktor-sample-heroku.herokuapp.com/ deployed to Heroku
   remote:
   remote: Verifying deploy... done.
   ```
