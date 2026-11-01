[//]: # (title: 建立應用程式發行套件)

<tldr>
<var name="example_name" value="deployment-ktor-plugin"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

[Ktor Gradle 外掛程式](https://github.com/ktorio/ktor-build-plugins) 會自動套用 
Gradle [Application 外掛程式](https://docs.gradle.org/current/userguide/application_plugin.html)，
該外掛程式提供了封裝應用程式的功能，包括程式碼相依性以及產生的啟動指令碼。

在本主題中，你將學習如何封裝並執行 Ktor 應用程式。

## 設定 Ktor 外掛程式 {id="configure-plugin"}

若要建立應用程式發行套件，你需要先套用 Ktor 外掛程式：
1. 開啟 <Path>build.gradle.kts</Path> 檔案，並將外掛程式新增至 `plugins {}` 區塊中：
   ```kotlin
   plugins {
       alias(ktorLibs.plugins.ktor)
   }
   ```

   <note>
       上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
       Ktor version catalog</a> 來指定 Ktor 相依性。
   </note>

2. 確保已設定[主要應用程式類別](server-dependencies.topic#create-entry-point)：
   ```kotlin
   application {
       mainClass.set("com.example.ApplicationKt")
   }
   ```

## 封裝應用程式 {id="package"}

Application 外掛程式提供了多種封裝應用程式的方式。例如，`installDist` 任務會安裝
包含所有執行階段相依性與啟動指令碼的應用程式。若要建立完整的發行封存檔，你可以使用
`distZip` 和 `distTar` 任務。

若要安裝包含所有執行階段相依性與啟動指令碼的應用程式，請開啟新的終端視窗並執行
`installDist` 任務：
   
<Tabs group="os">
<TabItem title="Linux/macOS" group-key="unix">
<code-block code="./gradlew installDist"/>
</TabItem>
<TabItem title="Windows" group-key="windows">
<code-block code="gradlew.bat installDist"/>
</TabItem>
</Tabs>

Application 外掛程式會在 <Path>build/install/<project_name></Path> 資料夾中建立應用程式的映像。

## 執行應用程式 {id="run"}

若要執行[已封裝的應用程式](#package)，請遵循以下步驟：

1. 在終端中，瀏覽至 <Path>build/install/<project_name>/bin</Path> 資料夾。
2. 根據你的作業系統，執行 `<project_name>` 或 `<project_name>.bat` 可執行檔，例如：

   <snippet id="run_executable">
   <Tabs group="os">
   <TabItem title="Linux/macOS" group-key="unix">
   <code-block code="./ktor-sample"/>
   </TabItem>
   <TabItem title="Windows" group-key="windows">
   <code-block code="ktor-sample.bat"/>
   </TabItem>
   </Tabs>
   </snippet>
   
3. 等待直到顯示以下訊息：
   ```Bash
   [main] INFO  Application - Responding at http://0.0.0.0:8080
   ```
   在瀏覽器中開啟該連結即可查看正在執行的應用程式：

   <img src="ktor_idea_new_project_browser.png" alt="瀏覽器中的 Ktor 應用程式" width="430"/>