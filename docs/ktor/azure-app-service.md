[//]: # (title: Azure 应用服务)

<show-structure for="chapter" depth="2"/>

<link-summary>本教程将向您展示如何构建、配置并将您的 Ktor 应用程序部署到 [Azure 应用服务](https://azure.microsoft.com/products/app-service/)。</link-summary>

本教程将向您展示如何构建、配置并将您的 Ktor 应用程序部署到 [Azure 应用服务](https://azure.microsoft.com/products/app-service/)。

## 前提条件 {id="prerequisites"}
在开始本教程之前，您需要具备以下条件：
*   一个 Azure 帐户（[在此处免费试用](https://azure.microsoft.com/en-us/free/)）。
*   在您的计算机上安装 [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli)。

## 创建示例应用程序 {id="create-sample-app"}

按照[创建、打开并运行新的 Ktor 项目](server-create-a-new-project.topic)中的说明创建一个示例应用程序。本示例展示的代码和命令基于以下项目：[embedded-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/embedded-server) 和 [engine-main](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main)。

> 上述教程提供了两种配置应用程序的方式：直接在代码中指定值，或使用配置文件。在这两种情况下，关键配置都是服务器侦听传入请求的端口。

## 设置应用程序 {id="setup-app"}

### 第 1 步：设置端口 {id="port"}

在 Azure 应用服务中，环境变量 `PORT` 包含了为传入请求开放的端口号。根据您在[配置 Ktor 服务器](server-create-and-configure.topic)中创建应用的方式，您需要在以下两个位置之一更新代码以读取此环境变量：

*   如果您使用的是在**代码中**配置端口的示例，可以使用 `System.getenv()` 读取 `PORT` 环境变量，并使用 `.toIntOrNull()` 将其解析为整数。打开 `Application.kt` 文件并按如下所示更改端口号：

   ```kotlin
   fun runBasicServer() {
      val port = System.getenv("PORT")?.toIntOrNull() ?: 8080
      embeddedServer(Netty, port = port) {
          // ...
      }.start(wait = true)
   }
    ```
*   如果服务器配置定义在**配置文件** `application.conf` 中，请将其更新为读取 `PORT` 环境变量，如下例所示：

   ```
   ktor {
       deployment {
           port = ${PORT:8080}
       }
   }
   ```
   {style="block"}

### 第 2 步：添加插件 {id="plugins"}
打开 `build.gradle.kts` 文件并在 `plugins` 部分添加以下行：
```kotlin
plugins {
    application
    kotlin("jvm")
    id("io.ktor.plugin") version "%ktor_version%" // 已添加
    id("com.microsoft.azure.azurewebapp") version "1.10.0" // 已添加
}
```

`io.ktor.plugin` 将提供用于创建 [fat JAR](server-fatjar.md) 的任务，而 [Azure WebApp Gradle 插件](https://github.com/microsoft/azure-gradle-plugins)将用于轻松地在 Azure 中创建所有必需的资源。

确保在 `application` 部分定义了 `mainClass`，以便为您的 fat JAR 提供定义明确的入口点：

```kotlin
application {
    mainClass.set("com.example.ApplicationKt")
}
```
如果您是使用 `engine-main` 模板创建的项目，则主类将如下所示：

```kotlin
application {
    mainClass.set("io.ktor.server.netty.EngineMain")
}
```

### 第 3 步：配置 {id="configuration"}

如果您已经在应用服务中创建了想要部署到的 Java Web 应用，可以跳过此步。

否则，请在 `build.gradle.kts` 文件的末尾添加以下条目，以便 Azure Webapp 插件为您创建一个：

```kotlin
 // 将 fat JAR 重命名为部署任务预期的名称
ktor {
    fatJar {
        archiveFileName.set("embedded-server.jar")
    }
}

// 禁用通常由 Azure 插件运行的 `jar` 任务
// 以便改为部署由 `fatJar` 任务创建的归档文件
tasks.named("jar") {
    enabled = false
}

// 确保部署任务首先构建 fat JAR
tasks.named("azureWebAppDeploy") {
    dependsOn("buildFatJar")
}

// Azure Webapp 插件配置
azurewebapp {
  subscription = "YOUR-SUBSCRIPTION-ID"
  resourceGroup = "RESOURCE-GROUP-NAME"
  appName = "WEBAPP-NAME"
  pricingTier = "YOUR-PLAN" // 例如 "F1", "B1", "P0v3" 等。
  region = "YOUR-REGION" // 例如 "westus2"
  setRuntime(closureOf<com.microsoft.azure.gradle.configuration.GradleRuntimeConfig> {
    os("Linux") // 或 "Windows"
    webContainer("Java SE")
    javaVersion("Java 21")
  })
  setAuth(closureOf<com.microsoft.azure.gradle.auth.GradleAuthConfig> {
    type = "azure_cli"
  })
}
```

有关可用配置属性的详细说明，请参阅 [Webapp 配置文档](https://github.com/microsoft/azure-gradle-plugins/wiki/Webapp-Configuration)。

*   `pricingTier`（服务方案）的值可以在 [Linux 版](https://azure.microsoft.com/en-us/pricing/details/app-service/linux/)和 [Windows 版](https://azure.microsoft.com/en-us/pricing/details/app-service/windows/)中找到。
*   `region` 的值列表可以通过以下 Azure CLI 命令获取：`az account list-locations --query "[].name" --output tsv`，或者在[产品可用性表](https://go.microsoft.com/fwlink/?linkid=2300348&clcid=0x409)中搜索“App Service”。

## 部署应用程序 {id="deploy-app"}

### 部署到新的 Web 应用

Azure Web 应用部署插件使用的身份验证方式是 Azure CLI。如果您尚未登录，请使用 `az login` 登录一次并按照说明操作。

最后，通过运行 `azureWebAppDeploy` 任务来部署应用程序，该任务已设置为先构建 fat JAR 然后进行部署：

<Tabs group="os">
<TabItem title="Linux/macOS" group-key="unix">
<code-block code="./gradlew :embedded-server:azureWebAppDeploy"></code-block>
</TabItem>
<TabItem title="Windows" group-key="windows">
<code-block code="gradlew.bat :embedded-server:azureWebAppDeploy"></code-block>
</TabItem>
</Tabs>

此任务将创建资源组、方案和 Web 应用，然后部署 fat JAR。当部署成功时，您应该会看到如下输出：

```text
> Task: :embedded-server:azureWebAppDeploy
Auth type: AZURE_CLI
Username: some.username@example.com
Subscription: Some Subscription(13936cf1-cc18-40be-a0d4-177fe532b3dd)
Start creation Resource Group(resource-group) in region (Some Region)
Resource Group (resource-group) is successfully created.
Start creating App Service plan (asp-your-webapp-name)...
App Service plan (asp-your-webapp-name) is successfully created
Start creating Web App(your-webapp-name)...
Web App(your-webapp-name) is successfully created
Trying to deploy artifact to your-webapp-name...
Deploying (C:\docs\ktor-documentation\codeSnippets\snippets\embedded-server\build\libs\embedded-server.jar)[jar] ...
Application url: https://your-webapp-name.azurewebsites.net
```

当部署完成后，您应该能够看到您的新 Web 应用在上面显示的 URL 处运行。

### 部署到现有 Web 应用

如果您在 Azure 应用服务中已有一个现有的 Java Web 应用，请先执行由 [Ktor 插件](#plugins)提供的 `buildFatJar` 任务来构建 fat JAR：

<Tabs group="os">
<TabItem title="Linux/macOS" group-key="unix">
<code-block code="./gradlew :embedded-server:buildFatJar"></code-block>
</TabItem>
<TabItem title="Windows" group-key="windows">
<code-block code="gradlew.bat :embedded-server:buildFatJar"></code-block>
</TabItem>
</Tabs>

然后，使用以下 Azure CLI 命令部署之前创建的 fat JAR：

```bash
az webapp deploy -g RESOURCE-GROUP-NAME -n WEBAPP-NAME --src-path ./path/to/embedded-server.jar --restart true
```

此命令将上传 JAR 文件并重启您的 Web 应用。过一段时间后，您应该会看到部署结果：

```text
Deployment type: jar. To override deployment type, please specify the --type parameter. Possible values: war, jar, ear, zip, startup, script, static
Initiating deployment
Deploying from local path: ./snippets/embedded-server/build/libs/embedded-server.jar
Warming up Kudu before deployment.
Warmed up Kudu instance successfully.
Polling the status of sync deployment. Start Time: 2025-09-07 00:07:14.729383+00:00 UTC
Status: Build successful. Time: 5(s)
Status: Starting the site... Time: 23(s)
Status: Starting the site... Time: 41(s)
Status: Site started successfully. Time: 44(s)
Deployment has completed successfully
You can visit your app at: http://your-app-name.some-region.azurewebsites.net