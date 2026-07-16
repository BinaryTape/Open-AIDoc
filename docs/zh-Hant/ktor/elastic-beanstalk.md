[//]: # (title: AWS Elastic Beanstalk)

<show-structure for="chapter" depth="2"/>

<tldr>
<p>
<control>初始專案</control>：<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/embedded-server">embedded-server</a> 或 
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main">engine-main</a>
</p>
<p>
<control>最終專案</control>：<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/aws-elastic-beanstalk">aws-elastic-beanstalk</a>
</p>
</tldr>

在本教學中，我們將向您展示如何準備 Ktor 應用程式並將其部署到 AWS Elastic Beanstalk。根據[建立 Ktor 伺服器](server-create-and-configure.topic)的方式，您可以使用以下其中一個初始專案：
* [embedded-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/embedded-server)
* [engine-main](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main)

> 若要進一步了解如何部署 Java 應用程式，請參閱 [Elastic Beanstalk 文件](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/create_deploy_Java.html)。

## 先決條件 {id="prerequisites"}
在開始本教學之前，您需要建立一個 AWS 帳戶。

## 複製範例應用程式 {id="clone"}
若要開啟範例應用程式，請按照以下步驟操作：

1. 複製 Ktor 文件存放庫並開啟 [codeSnippets](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets) 專案。
2. 開啟 [embedded-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/embedded-server) 或 [engine-main](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main) 範例。這些範例示範了[建立與配置 Ktor 伺服器](server-create-and-configure.topic)的不同方法：在程式碼中或使用配置檔案。部署這些專案的唯一區別在於如何[指定用於監聽傳入請求的連接埠](#port)。

## 準備應用程式 {id="prepare-app"}

### 步驟 1：配置連接埠 {id="port"}

首先，您需要指定用於監聽傳入請求的連接埠。Elastic Beanstalk 會透過 5000 連接埠將請求轉發到您的應用程式。您可以選擇性地透過設定 `PORT` 環境變數來覆蓋預設連接埠。根據[配置 Ktor 伺服器](server-create-and-configure.topic)的方式，您可以使用以下其中一種方式來配置連接埠：
* 如果您選擇了在程式碼中指定伺服器配置的 [embedded-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/embedded-server) 範例，您可以使用 `System.getenv` 獲取環境變數值，或者在未指定環境變數的情況下使用預設值 _5000_。開啟位於 `src/main/kotlin/com/example` 資料夾中的 `Application.kt` 檔案，並按如下所示變更 `embeddedServer` 函式的 `port` 參數值：
   ```kotlin
   fun main() {
      embeddedServer(Netty, port = (System.getenv("PORT")?:"5000").toInt()) {
      // ...
      }.start(wait = true)
   }
    ```

* 如果您選擇了在 `application.conf` 檔案中指定伺服器配置的 [engine-main](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main) 範例，您可以使用 `${ENV}` 語法將環境變數指派給 `port` 參數。開啟位於 `src/main/resources` 中的 `application.conf` 檔案並按如下方式更新：
   ```
   ktor {
       deployment {
           port = 5000
           port = ${?PORT}
       }
   }
   ```

### 步驟 2：套用 Ktor 外掛程式 {id="configure-ktor-plugin"}
本教學展示如何使用 [Fat JAR](server-fatjar.md) 將應用程式部署到 Elastic Beanstalk。要產生 Fat JAR，您需要套用 Ktor 外掛程式。開啟 `build.gradle.kts` 檔案並將外掛程式新增至 `plugins` 區塊：
```groovy
plugins {
    id("io.ktor.plugin") version "3.4.3"
}
```

接著，確保已配置[應用程式主類別](server-dependencies.topic#create-entry-point)：
```kotlin
application {
    mainClass.set("io.ktor.server.netty.EngineMain")
}
```

## 組建 Fat JAR {id="build"}
要組建 Fat JAR，請開啟終端並執行 [Ktor 外掛程式](#configure-ktor-plugin)提供的 `buildFatJar` 任務：

<Tabs group="os">
<TabItem title="Linux/macOS" group-key="unix">
<code-block code="./gradlew :aws-elastic-beanstalk:buildFatJar"></code-block>
</TabItem>
<TabItem title="Windows" group-key="windows">
<code-block code="gradlew.bat :aws-elastic-beanstalk:buildFatJar"></code-block>
</TabItem>
</Tabs>

當此組建完成後，您應該會在 `build/libs` 目錄中看到 `aws-elastic-beanstalk-all.jar` 檔案。

## 部署應用程式 {id="deploy-app"}
要部署應用程式，請登入 [AWS 管理主控台](https://aws.amazon.com/console/)並按照以下步驟操作：
1. 在 **AWS 服務**群組中開啟 **Elastic Beanstalk** 服務。
2. 在開啟的頁面上，點擊 **Create Application**。
3. 指定以下應用程式設定：
   * **Application name**：指定應用程式名稱（例如，_Sample Ktor app_）。
   * **Platform**：從列表中選擇 _Java_。
   * **Platform branch**：選擇 _Corretto 11 running on 64bit Amazon Linux 2_。
   * **Application code**：選擇 _Upload your code_。
   * **Source code origin**：選擇 _Local file_。然後，點擊 **Choose file** 按鈕並選擇在[前一個步驟](#build)中產生的 Fat JAR。等待檔案上傳完成。
4. 點擊 **Create application** 按鈕，並等待幾分鐘直到 Beanstalk 建立環境並發佈應用程式：
   ```
   INFO    Instance deployment completed successfully.
   INFO    Application available at Samplektorapp-env.eba-bnye2kpu.us-east-2.elasticbeanstalk.com.
   INFO    Successfully launched environment: Samplektorapp-env
   ```
   {style="block"}