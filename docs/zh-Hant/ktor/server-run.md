[//]: # (title: 執行)

<show-structure for="chapter" depth="2"/>

<link-summary>
了解如何執行伺服器端 Ktor 應用程式。
</link-summary>

在執行 Ktor 伺服器應用程式時，請考量以下細節：
* 用於[建立伺服器](server-create-and-configure.topic)的方式會影響你在執行[已打包的 Ktor 應用程式](#package)時，是否能透過傳遞命令列引數來覆寫伺服器參數。
* 使用 [EngineMain](server-create-and-configure.topic#engine-main) 啟動伺服器時，Gradle/Maven 建置指令碼應指定 main 類別名稱。
* 在 [Servlet 容器](server-war.md)中執行應用程式需要特定的 Servlet 設定。

在本主題中，我們將探討這些設定細節，並向你展示如何在 IntelliJ IDEA 中以及作為已打包應用程式來執行 Ktor 應用程式。

## 設定細節 {id="specifics"}

### 設定：程式碼 vs 設定檔 {id="code-vs-config"}

執行 Ktor 應用程式取決於你用來[建立伺服器](server-create-and-configure.topic)的方式 —— `embeddedServer` 或是 `EngineMain`：
* 對於 `embeddedServer`，伺服器參數（例如主機位址和連接埠）是在程式碼中設定的，因此在執行應用程式時無法變更這些參數。
* 對於 `EngineMain`，Ktor 會從使用 `HOCON` 或 `YAML` 格式的外部檔案載入其設定。使用這種方法，你可以從命令列執行[已打包的應用程式](#package)，並透過傳遞對應的[命令列引數](server-configuration-file.topic#command-line)來覆寫所需的伺服器參數。

### 啟動 EngineMain：Gradle 與 Maven 細節 {id="gradle-maven"}

如果你使用 `EngineMain` 來建立伺服器，則需要指定 `main` 函式，以便使用所需的[引擎](server-engines.md)啟動伺服器。
下方的[範例](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main)展示了用於執行具有 Netty 引擎的伺服器的 `main` 函式：

```kotlin
fun main(args: Array<String>): Unit = io.ktor.server.netty.EngineMain.main(args)
```

若要在不於 `main` 函式內部設定引擎的情況下，使用 Gradle/Maven 執行 Ktor 伺服器，你需要在建置指令碼中指定 main 類別名稱，如下所示：

<Tabs group="languages" id="main-class-set-engine-main">
<TabItem title="Gradle (Kotlin)" group-key="kotlin">

```kotlin
application {
    mainClass.set("io.ktor.server.netty.EngineMain")
}
```

</TabItem>
<TabItem title="Gradle (Groovy)" group-key="groovy">

```groovy
mainClassName = "io.ktor.server.netty.EngineMain"
```

</TabItem>
<TabItem title="Maven" group-key="maven">

```xml
<properties>
    <main.class>io.ktor.server.netty.EngineMain</main.class>
</properties>
```

</TabItem>
</Tabs>

### WAR 細節 {id="war-specifics"}

Ktor 允許你直接在應用程式中[建立並啟動伺服器](server-create-and-configure.topic)，並使用所需的引擎（例如 Netty、Jetty 或 Tomcat）。在此情況下，你的應用程式可以控制引擎設定、連線與 SSL 選項。

與此方法相反，Servlet 容器應控制應用程式生命週期與連線設定。Ktor 提供了一個特殊的 `ServletApplicationEngine` 引擎，可將應用程式的控制權委託給 Servlet 容器。你可以從[設定 War 外掛程式](server-war.md#configure-war)中了解如何設定你的應用程式。

## 執行應用程式 {id="run"}
> 在開發過程中重新啟動伺服器可能會耗費一些時間。Ktor 允許你透過使用[自動重新載入](server-auto-reload.topic)來克服此限制，該功能會在程式碼變更時重新載入應用程式類別，並提供快速的回饋循環。

### 使用 Gradle/Maven 執行應用程式 {id="gradle-maven-run"}

若要使用 Gradle 或 Maven 執行 Ktor 應用程式，請使用對應的外掛程式：
* 適用於 Gradle 的 [Application](server-packaging.md) 外掛程式。對於 [Native 伺服器](server-native.md)，請使用 [Kotlin Multiplatform](https://plugins.gradle.org/plugin/org.jetbrains.kotlin.multiplatform) 外掛程式。
* 適用於 Maven 的 [Exec](https://www.mojohaus.org/exec-maven-plugin/) 外掛程式。

> 若要了解如何在 IntelliJ IDEA 中執行 Ktor 應用程式，請參閱 IntelliJ IDEA 文件中的[執行 Ktor 應用程式](https://www.jetbrains.com/help/idea/ktor.html#run_ktor_app)章節。

### 執行已打包的應用程式 {id="package"}

在部署應用程式之前，你需要按照[打包](server-deployment.md#packaging)章節中描述的其中一種方式對其進行打包。
從產生的套件中執行 Ktor 應用程式取決於套件類型，可能如下所示：
* 若要執行打包在 fat JAR 中的 Ktor 伺服器並覆寫設定的連接埠，請執行以下指令：
   ```Bash
   java -jar sample-app.jar -port=8080
   ```
* 若要執行使用 Gradle [Application](server-packaging.md) 外掛程式打包的應用程式，請執行對應的可執行檔：

   <Tabs group="os">
   <TabItem title="Linux/macOS" group-key="unix">
   <code-block code="./ktor-sample"/>
   </TabItem>
   <TabItem title="Windows" group-key="windows">
   <code-block code="ktor-sample.bat"/>
   </TabItem>
   </Tabs>
  
* 若要執行 Servlet Ktor 應用程式，請使用 [Gretty](server-war.md#run) 外掛程式的 `run` 任務。