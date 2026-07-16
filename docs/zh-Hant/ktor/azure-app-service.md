[//]: # (title: Azure App Service)

<show-structure for="chapter" depth="2"/>

<link-summary>本教學展示如何建置、配置並部署您的 Ktor 應用程式至 [Azure App Service](https://azure.microsoft.com/products/app-service/)。</link-summary>

本教學展示如何建置、配置並部署您的 Ktor 應用程式至 [Azure App Service](https://azure.microsoft.com/products/app-service/)。

## 前提條件 {id="prerequisites"}
在開始本教學之前，您將需要以下內容：
* 一個 Azure 帳戶（[在此處免費試用](https://azure.microsoft.com/en-us/free/)）。
* 已在您的電腦上安裝 [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli)。

## 建立範例應用程式 {id="create-sample-app"}

按照 [建立、開啟並執行新的 Ktor 專案](server-create-a-new-project.topic) 中的說明建立範例應用程式。此範例展示了基於以下專案的程式碼與指令：[embedded-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/embedded-server) 與 [engine-main](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main)。

> 上述教學提供了兩種配置應用程式的方式：直接在程式碼中指定值，或使用設定檔。在這兩種情況下，關鍵配置都是伺服器監聽傳入請求的 port。

## 設定應用程式 {id="setup-app"}

### 第 1 步：設定 port {id="port"}

在 Azure App Service 中，環境變數 `PORT` 包含了開放給傳入請求的 port 編號。根據您在 [配置 Ktor 伺服器](server-create-and-configure.topic) 中建立應用程式的方式，您需要更新程式碼，在以下兩個位置之一讀取此環境變數：

* 如果您使用的是**在程式碼中**配置 port 的範例，可以使用 `System.getenv()` 讀取 `PORT` 環境變數，並使用 `.toIntOrNull()` 將其剖析為整數。開啟 `Application.kt` 檔案並按照下方所示更改 port 編號：

   ```kotlin
   fun runBasicServer() {
      val port = System.getenv("PORT")?.toIntOrNull() ?: 8080
      embeddedServer(Netty, port = port) {
          // ...
      }.start(wait = true)
   }
    ```
* 如果伺服器配置定義在**設定檔** `application.conf` 中，請更新它以讀取 `PORT` 環境變數，如下例所示：

   ```
   ktor {
       deployment {
           port = ${PORT:8080}
       }
   }
   ```
   {style="block"}

### 第 2 步：新增外掛程式 {id="plugins"}
開啟 `build.gradle.kts` 檔案，並在 `plugins` 區塊中新增以下行：
```kotlin
plugins {
    application
    kotlin("jvm")
    id("io.ktor.plugin") version "%ktor_version%" // 已新增
    id("com.microsoft.azure.azurewebapp") version "1.10.0" // 已新增
}
```

`io.ktor.plugin` 將提供用於建立 [fat JAR](server-fatjar.md) 的任務，而 [Azure WebApp Plugin for Gradle](https://github.com/microsoft/azure-gradle-plugins) 將用於輕鬆地在 Azure 中建立所有必要的資源。

確保在 `application` 區塊中定義了 `mainClass`，以便為您的 fat JAR 提供明確定義的入口點：

```kotlin
application {
    mainClass.set("com.example.ApplicationKt")
}
```
如果您使用 `engine-main` 範本建立專案，主類別將如下所示：

```kotlin
application {
    mainClass.set("io.ktor.server.netty.EngineMain")
}
```

### 第 3 步：配置 {id="configuration"}

如果您已經在 App Service 中建立了想要部署到的 Java Web 應用程式，可以跳過此步驟。

否則，請在 `build.gradle.kts` 檔案末尾新增以下項目，以便 Azure Webapp Plugin 為您建立一個：

```kotlin
 // 將 fat JAR 重新命名為部署任務預期的名稱
ktor {
    fatJar {
        archiveFileName.set("embedded-server.jar")
    }
}

// 停用 Azure 外掛程式通常會執行的 `jar` 任務，
// 改為部署由 `fatJar` 任務建立的封存檔
tasks.named("jar") {
    enabled = false
}

// 確保部署任務會先建置 fat JAR
tasks.named("azureWebAppDeploy") {
    dependsOn("buildFatJar")
}

// Azure Webapp Plugin 配置
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

有關可用配置屬性的詳細說明，請參閱 [Webapp 配置文件](https://github.com/microsoft/azure-gradle-plugins/wiki/Webapp-Configuration)。

* `pricingTier`（服務方案）的值可以在 [Linux 版](https://azure.microsoft.com/en-us/pricing/details/app-service/linux/) 和 [Windows 版](https://azure.microsoft.com/en-us/pricing/details/app-service/windows/) 中找到。
* `region` 的值清單可以透過以下 Azure CLI 指令取得：`az account list-locations --query "[].name" --output tsv`，或是在 [產品可用性表](https://go.microsoft.com/fwlink/?linkid=2300348&clcid=0x409) 中搜尋 "App Service"。

## 部署應用程式 {id="deploy-app"}

### 部署至新的 Web 應用程式

Azure Web App Deploy 外掛程式使用的身分驗證方法是透過 Azure CLI。如果您尚未登入，請使用 `az login` 登入一次並按照說明操作。

最後，透過執行 `azureWebAppDeploy` 任務來部署應用程式，該任務設定為先建置 fat JAR 然後再進行部署：

<Tabs group="os">
<TabItem title="Linux/macOS" group-key="unix">
<code-block code="./gradlew :embedded-server:azureWebAppDeploy"></code-block>
</TabItem>
<TabItem title="Windows" group-key="windows">
<code-block code="gradlew.bat :embedded-server:azureWebAppDeploy"></code-block>
</TabItem>
</Tabs>

此任務將建立資源群組、方案和 Web 應用程式，然後部署 fat JAR。當部署成功時，您應該會看到如下輸出：

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

部署完成後，您應該能夠在上方顯示的 URL 看到新建立的 Web 應用程式正在執行。

### 部署至現有的 Web 應用程式

如果您在 Azure App Service 中已經有一個現有的 Java Web 應用程式，請先執行由 [Ktor 外掛程式](#plugins) 提供的 `buildFatJar` 任務來建置 fat JAR：

<Tabs group="os">
<TabItem title="Linux/macOS" group-key="unix">
<code-block code="./gradlew :embedded-server:buildFatJar"></code-block>
</TabItem>
<TabItem title="Windows" group-key="windows">
<code-block code="gradlew.bat :embedded-server:buildFatJar"></code-block>
</TabItem>
</Tabs>

接著，使用以下 Azure CLI 指令部署先前建立的 fat JAR：

```bash
az webapp deploy -g RESOURCE-GROUP-NAME -n WEBAPP-NAME --src-path ./path/to/embedded-server.jar --restart true
```

此指令將上傳 JAR 檔案並重新啟動您的 Web 應用程式。稍等片刻後，您應該會看到部署結果：

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