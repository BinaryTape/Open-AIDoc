[//]: # (title: 執行)

<show-structure for="chapter" depth="2"/>

<link-summary>
了解如何執行 Ktor 伺服器應用程式。
</link-summary>

執行 Ktor 伺服器應用程式時，請考量以下細節：
* [建立伺服器](server-create-and-configure.topic)的方式會影響你在執行[封裝好的 Ktor 應用程式](#package)時，是否能透過傳遞命令列引數來覆寫伺服器參數。
* 使用 [EngineMain](server-create-and-configure.topic#engine-main) 啟動伺服器時，Gradle/Maven 建置指令碼應指定主類別名稱。
* 在 [servlet 容器](server-war.md)中執行應用程式需要特定的 servlet 配置。

在本主題中，我們將探討這些配置細節，並向你展示如何在 IntelliJ IDEA 中以及作為封裝好的應用程式來執行 Ktor 應用程式。

## 配置細節 {id="specifics"}

### 配置：程式碼 vs 配置檔案 {id="code-vs-config"}

執行 Ktor 應用程式取決於你[建立伺服器](server-create-and-configure.topic)的方式 —— `embeddedServer` 或 `EngineMain`：
* 對於 `embeddedServer`，伺服器參數（例如主機地址和連接埠）是在程式碼中配置的，因此你在執行應用程式時無法變更這些參數。
* 對於 `EngineMain`，Ktor 會從使用 `HOCON` 或 `YAML` 格式的外部檔案載入其配置。使用此方法，你可以從命令列執行[封裝好的應用程式](#package)，並透過傳遞對應的[命令列引數](server-configuration-file.topic#command-line)來覆寫所需的伺服器參數。

### 啟動 EngineMain：Gradle 與 Maven 的細節 {id="gradle-maven"}

如果你使用 `EngineMain` 建立伺服器，則需要指定 `main` 函式，以便使用所需的[引擎](server-engines.md)啟動伺服器。
下方的[範例](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main)示範了用於執行 Netty 引擎伺服器的 `main` 函式：

```kotlin
fun main(args: Array<String>): Unit = io.ktor.server.netty.EngineMain.main(args)
```

若要在不於 `main` 函式內配置引擎的情況下使用 Gradle/Maven 執行 Ktor 伺服器，你需要在建置指令碼中指定主類別名稱，如下所示：

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

### WAR 細節

Ktor 允許你直接在應用程式中透過所需的引擎（例如 Netty、Jetty 或 Tomcat）[建立並啟動伺服器](server-create-and-configure.topic)。在這種情況下，你的應用程式可以控制引擎設定、連線和 SSL 選項。

與此方法相反，servlet 容器應控制應用程式生命週期和連線設定。Ktor 提供了一個特殊的 `ServletApplicationEngine` 引擎，可將應用程式的控制權委託給 servlet 容器。你可以從[配置 War 外掛程式](server-war.md#configure-war)中了解如何配置你的應用程式。

## 執行應用程式 {id="run"}
> 在開發期間重新啟動伺服器可能會耗費一些時間。Ktor 允許你透過使用[自動重新載入 (Auto-reload)](server-auto-reload.topic) 來克服此限制，它會在程式碼變更時重新載入應用程式類別，並提供快速的回饋循環。

### 使用 Gradle/Maven 執行應用程式 {id="gradle-maven-run"}

要使用 Gradle 或 Maven 執行 Ktor 應用程式，請使用對應的外掛程式：
* Gradle 請使用 [Application](server-packaging.md) 外掛程式。對於[原生伺服器 (Native server)](server-native.md)，請使用 [Kotlin Multiplatform](https://plugins.gradle.org/plugin/org.jetbrains.kotlin.multiplatform) 外掛程式。
* Maven 請使用 [Exec](https://www.mojohaus.org/exec-maven-plugin/) 外掛程式。

> 若要了解如何在 IntelliJ IDEA 中執行 Ktor 應用程式，請參閱 IntelliJ IDEA 文件中的 [Run a Ktor application](https://www.jetbrains.com/help/idea/ktor.html#run_ktor_app) 章節。

### 執行封裝好的應用程式 {id="package"}

在部署應用程式之前，你需要以 [Packaging](server-deployment.md#packaging) 章節中描述的其中一種方式對其進行封裝。 
從產出的套件執行 Ktor 應用程式取決於套件類型，可能如下所示：
* 若要執行封裝在 fat JAR 中的 Ktor 伺服器並覆寫配置的連接埠，請執行以下指令：
   ```Bash
   java -jar sample-app.jar -port=8080
   ```
* 若要執行使用 Gradle [Application](server-packaging.md) 外掛程式封裝的應用程式，請執行對應的可執行檔：

   <Tabs group="os">
   <TabItem title="Linux/macOS" group-key="unix">
   <code-block code="./ktor-sample"></code-block>
   </TabItem>
   <TabItem title="Windows" group-key="windows">
   <code-block code="ktor-sample.bat"></code-block>
   </TabItem>
   </Tabs>
  
* 若要執行 servlet Ktor 應用程式，請使用 [Gretty](server-war.md#run) 外掛程式的 `run` 任務。

    ```bash
    ./gradlew run