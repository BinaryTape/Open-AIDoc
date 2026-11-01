[//]: # (title: 部署 Ktor 應用程式至 Google App Engine)

<show-structure for="chapter" depth="2"/>

<tldr>
<p>
<control>初始專案</control>：<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main">engine-main</a>
</p>
<p>
<control>最終專案</control>：<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/google-appengine-standard">google-appengine-standard</a>
</p>
</tldr>

<web-summary>
本教學介紹如何準備 Ktor 專案並將其部署至 Google App Engine 標準環境。
</web-summary>

<link-summary>
了解如何將你的專案部署至 Google App Engine 標準環境。
</link-summary>

在本教學中，你將學習如何準備 Ktor 專案並將其部署至 Google App Engine 標準環境。
本教學使用 [engine-main](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main) 範例專案作為起點。

## 先決條件 {id="prerequisites"}

在開始本教學之前，請先完成以下步驟：
* 在 [Google Cloud Platform](https://console.cloud.google.com/) 上註冊。
* 安裝並初始化 [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)。
* 使用以下指令安裝適用於 Java 的 App Engine 擴充套件：
   ```Bash
   gcloud components install app-engine-java
   ```

## 複製範例應用程式 {id="clone"}

若要開啟範例應用程式，請按照以下步驟操作：

1. 複製 Ktor 文件存儲庫並開啟 [`codeSnippets`](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets) 專案。
2. 開啟 [engine-main](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main) 模組。
   > Ktor 提供了兩種[建立與配置伺服器](server-create-and-configure.topic)的方式：在程式碼中或在設定檔中。在本教學中，這兩種方式的部署過程皆相同。
   >
   {style="note"}

## 準備應用程式 {id="prepare-app"}

### 步驟 1：套用 Shadow 外掛程式 {id="configure-shadow-plugin"}

本教學介紹如何使用 [fat JAR](server-fatjar.md) 將應用程式部署至 Google App Engine。若要產生 fat JAR，你必須套用 Shadow 外掛程式。

首先，開啟 <Path>gradle/libs.versions.toml</Path> 檔案並定義 Shadow 外掛程式版本及其別名：

```toml
[versions]
shadow = "8.3.10"

[plugins]
shadow = { id = "com.gradleup.shadow", version.ref = "shadow" }
```

接著，開啟 <Path>build.gradle.kts</Path> 檔案並將外掛程式新增至 `plugins` 區塊中：
```kotlin
plugins {
    alias(libs.plugins.shadow)
}
```

### 步驟 2：配置 App Engine 外掛程式 {id="configure-app-engine-plugin"}

[Google App Engine Gradle 外掛程式](https://github.com/GoogleCloudPlatform/app-gradle-plugin)提供了建置與部署 Google App Engine 應用程式的任務。若要使用此外掛程式，請按照以下步驟操作：

1. 開啟 <Path>settings.gradle.kt</Path> 檔案，並使用以下程式碼從 Maven Central 存儲庫引用外掛程式：
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

2. 開啟 <Path>build.gradle.kts</Path> 檔案並在 `plugins` 區塊中套用此外掛程式：
   ```kotlin
   plugins {
       alias(libs.plugins.appengine)
   }
   ```

3. 在同一個 <Path>build.gradle.kts</Path> 檔案中，新增包含以下設定的 `appengine` 區塊：
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

### 步驟 3：配置 App Engine 設定 {id="configure-app-engine-settings"}

你可以在 [<Path>app.yaml</Path>](https://cloud.google.com/appengine/docs/standard/python/config/appref) 檔案中為應用程式配置 App Engine 設定：
1. 在 <Path>src/main</Path> 內建立 <Path>appengine</Path> 目錄。
2. 在此目錄中，建立 <Path>app.yaml</Path> 檔案並新增以下內容：
   ```yaml
   runtime: java21
   entrypoint: 'java -jar google-appengine-standard-all.jar'
   
   ```

   將 `google-appengine-standard` 替換為你的專案名稱。

   `entrypoint` 選項包含用於執行為該應用程式所產生之 fat JAR 的指令。

   > 如需更多關於支援之配置選項的資訊，請參閱 [Google AppEngine 文件](https://cloud.google.com/appengine/docs/standard/reference/app-yaml?tab=java)。
   >
   {style="tip"}

## 部署應用程式 {id="deploy-app"}

若要部署你的應用程式，請開啟新的終端視窗並按照以下步驟操作：

1. 首先，建立一個 Google Cloud 專案，它是容納應用程式資源的最頂層容器。例如，以下指令會建立一個名稱為 `ktor-sample-app-engine` 的專案：
   ```Bash
   gcloud projects create ktor-sample-app-engine --set-as-default
   ```
   
2. 為該 Cloud 專案建立 App Engine 應用程式：
   ```Bash
   gcloud app create
   ```

3. 若要部署應用程式，請執行 `appengineDeploy` Gradle 任務：
   ```Bash
   ./gradlew appengineDeploy
   ```
4. 等待 Google Cloud 建置並發佈應用程式：
   ```
   ...done.
   Deployed service [default] to [https://ktor-sample-app-engine.ew.r.appspot.com]
   ```
   {style="block"}
   > 如果在建置期間收到 `Cloud Build has not been used in project` 錯誤，請依照錯誤報告中的指示將其啟用。
   >
   {style="note"}

   > 如需完整的程式碼範例，請參閱 [google-appengine-standard](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/google-appengine-standard)。
   > 
   {style="tip"}