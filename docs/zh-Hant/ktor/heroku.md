[//]: # (title: Heroku)

<show-structure for="chapter" depth="2"/>

<link-summary>了解如何準備 Ktor 應用程式並將其部署到 Heroku。</link-summary>

在本教學中，您將學習如何準備 Ktor 應用程式並將其部署到 Heroku。

## 準備工作 {id="prerequisites"}

在開始本教學之前，請確保滿足以下準備工作：
* 您擁有一個 Heroku 帳戶。
* 您的電腦上已安裝 [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)。

## 建立範例應用程式 {id="create-sample-app"}

按照 [建立、開啟與執行新的 Ktor 專案](server-create-a-new-project.topic) 中的說明建立一個範例應用程式。

> Ktor 提供兩種[建立與配置伺服器](server-create-and-configure.topic)的方法：在程式碼中配置，或使用配置文件。部署時唯一的區別在於如何[指定連接埠](#port)以監聽傳入的請求。
> 
{style="note"}

## 準備應用程式 {id="prepare-app"}

### 第 1 步：配置連接埠 {id="port"}

首先，指定一個用於監聽傳入請求的連接埠。由於 Heroku 使用 `PORT` 環境變數，因此您需要將應用程式配置為使用該變數的值。根據您[配置 Ktor 伺服器](server-create-and-configure.topic)的方式，執行以下任一操作：
* 如果伺服器配置是在程式碼中指定的，您可以使用 `System.getenv` 獲取環境變數的值。開啟位於 <Path>src/main/kotlin/com/example</Path> 資料夾中的 <Path>Application.kt</Path> 檔案，並變更 `embeddedServer()` 函式的 `port` 參數值：

   ```kotlin
   fun main() {
      embeddedServer(Netty, port = System.getenv("PORT")?.toIntOrNull() ?: 8080) {
          // ...
      }.start(wait = true)
   }
    ```

* 如果您的伺服器配置是在 <Path>application.conf</Path> 檔案中指定的，您可以使用 `${ENV}` 語法將環境變數指派給 `port` 參數。開啟位於 <Path>src/main/resources</Path> 中的 <Path>application.conf</Path> 檔案，並按如下所示進行更新：

   ```
   ktor {
       deployment {
           port = 8080
           port = ${?PORT}
       }
   }
   ```

### 第 2 步：新增 stage 任務 {id="stage"}

開啟 <Path>build.gradle.kts</Path> 檔案並新增一個自訂的 `stage` 任務。Heroku 會使用 `stage` 任務來建立一個可在 Heroku 平台上執行的可執行檔：

```kotlin
tasks {
    create("stage").dependsOn("installDist")
}
``` 

> `installDist` 任務隨附於 Gradle 的 [application 外掛程式](https://docs.gradle.org/current/userguide/application_plugin.html)，該外掛程式已新增至範例專案中。
>
{style="note"}

### 第 3 步：建立 Procfile {id="procfile"}

在專案根目錄中建立一個 [Procfile](https://devcenter.heroku.com/articles/procfile)，並加入以下內容：

```
web: ./build/install/ktor-get-started-sample/bin/ktor-get-started-sample
```

此檔案指定了由 [`stage`](#stage) 任務產生的應用程式可執行檔路徑，並允許 Heroku 啟動應用程式。
您可能需要將 `ktor-get-started-sample` 替換為您的專案名稱。

### 第 4 步：指定 Java 版本（選用） {id="java-version"}

預設情況下，Heroku 使用 Java 25 執行您的應用程式。如果您的 Ktor 應用程式使用不同的 Java 版本編譯，您需要明確指定它以避免部署失敗。

若要指定 Java 版本，請在專案的根資料夾中建立一個 <Path>system.properties</Path> 檔案，並加入以下內容：

```bash
java.runtime.version=21
```

將 `21` 替換為您需要的 Java 版本。

> 欲了解更多資訊，請參閱 [Heroku 關於指定 Java 版本的文件](https://devcenter.heroku.com/articles/java-support#specifying-a-java-version)。
>
{style="tip"}

## 部署應用程式 {id="deploy-app"}

若要使用 Git 將您的應用程式部署到 Heroku，請開啟一個新的終端機視窗並按照以下步驟操作：

1. 在本機提交[前一章節](#prepare-app)中所做的變更：
   ```Bash
   git add .
   git commit -m "Prepare app for deploying"
   ```
2. 登入 Heroku CLI：
   ```Bash
   heroku login
   ```
3. 使用 `heroku create` 指令建立 Heroku 應用程式。
   將 `ktor-sample-heroku` 替換為您的應用程式名稱：
   ```Bash
   heroku create ktor-sample-heroku
   ```
   此指令會執行兩件事：
   * 建立一個新的 Heroku 應用程式，可在 [Web 儀表板](https://dashboard.heroku.com/apps/)上查看。
   * 將名為 `heroku` 的新 Git 遠端新增到本機存儲庫。

4. 若要部署應用程式，請將變更推送到 `heroku main`：
   ```Bash
   git push heroku main
   ```
5. 等待 Heroku 組建並發布應用程式。完成後，您應該會看到以下輸出：
   ```bash
   ...
   remote: https://ktor-sample-heroku.herokuapp.com/ deployed to Heroku
   remote:
   remote: Verifying deploy... done.
   ```
