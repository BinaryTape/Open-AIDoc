[//]: # (title: 建立應用程式發行版)

<tldr>
<var name="example_name" value="deployment-ktor-plugin"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

[Ktor Gradle 外掛程式](https://github.com/ktorio/ktor-build-plugins)會自動套用 Gradle [Application 外掛程式](https://docs.gradle.org/current/userguide/application_plugin.html)，該外掛程式提供了封裝應用程式的功能，包括程式碼相依性與產生的啟動指令碼。在本主題中，我們將向您展示如何封裝並執行 Ktor 應用程式。

## 設定 Ktor 外掛程式 {id="configure-plugin"}
若要建立應用程式發行版，您需要先套用 Ktor 外掛程式：
1. 開啟 `build.gradle.kts` 檔案並將外掛程式新增至 `plugins` 區塊：
   ```kotlin
   plugins {
       id("io.ktor.plugin") version "3.4.0"
   }
   ```

2. 確保已設定 [應用程式主類別](server-dependencies.topic#create-entry-point)：
   ```kotlin
   application {
       mainClass.set("com.example.ApplicationKt")
   }
   ```

## 封裝應用程式 {id="package"}
Application 外掛程式提供了多種封裝應用程式的方式，例如 `installDist` 任務會安裝包含所有執行階段相依性與啟動指令碼的應用程式。若要建立完整的發行封存檔，您可以使用 `distZip` 與 `distTar` 任務。

在本主題中，我們將使用 `installDist`：
1. 開啟終端機。
2. 根據您的作業系統，以以下方式之一執行 `installDist` 任務：
   
   <Tabs group="os">
   <TabItem title="Linux/macOS" group-key="unix">
   <code-block code="./gradlew installDist"></code-block>
   </TabItem>
   <TabItem title="Windows" group-key="windows">
   <code-block code="gradlew.bat installDist"></code-block>
   </TabItem>
   </Tabs>

   Application 外掛程式將會在 `build/install/<project_name>` 資料夾中建立應用程式的映像。 

## 執行應用程式 {id="run"}
若要執行[封裝後的應用程式](#package)：
1. 在終端機中進入 `build/install/<project_name>/bin` 資料夾。
2. 根據您的作業系統，執行 `<project_name>` 或 `<project_name>.bat` 可執行檔，例如：

   <snippet id="run_executable">
   <Tabs group="os">
   <TabItem title="Linux/macOS" group-key="unix">
   <code-block code="./ktor-sample"></code-block>
   </TabItem>
   <TabItem title="Windows" group-key="windows">
   <code-block code="ktor-sample.bat"></code-block>
   </TabItem>
   </Tabs>
   </snippet>
   
3. 等待直到顯示以下訊息：
   ```Bash
   [main] INFO  Application - Responding at http://0.0.0.0:8080
   ```
   在瀏覽器中開啟連結以查看執行中的應用程式：

   <img src="ktor_idea_new_project_browser.png" alt="瀏覽器中的 Ktor 應用程式" width="430"/>