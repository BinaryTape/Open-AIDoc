[//]: # (title: Docker)

<show-structure for="chapter" depth="2"/>

<tldr>
<var name="example_name" value="deployment-ktor-plugin"/>
<p>
    <b>程式碼範例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<web-summary>
了解如何將 Ktor 應用程式部署到 Docker 容器，然後可以在本機或您選擇的雲端服務供應商上執行。
</web-summary>

<link-summary>
了解如何將您的應用程式部署到 Docker 容器。
</link-summary>

在本節中，您將學習如何使用 [Ktor Gradle 外掛程式](https://github.com/ktorio/ktor-build-plugins) 透過 [Docker](https://www.docker.com) 來打包、執行和部署應用程式。

## 安裝 Ktor 外掛程式 {id="install-plugin"}

<Tabs group="languages">
<TabItem title="Gradle (Kotlin)" group-key="kotlin">

```kotlin
plugins {
    alias(ktorLibs.plugins.ktor)
}
```

</TabItem>
<TabItem title="Gradle (Groovy)" group-key="groovy">

```groovy
plugins {
    alias(ktorLibs.plugins.ktor)
}
```

</TabItem>
</Tabs>
<note>
    上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
    Ktor 版本目錄</a> 來指定 Ktor 相依性。
</note>

> 如果您將 Ktor Gradle 外掛程式與 Kotlin Multiplatform Gradle 外掛程式一起套用，Docker 整合將會自動停用。
> 若要同時使用它們：
> 1. 建立一個僅限 JVM 的專案，並如上所示套用 Ktor Gradle 外掛程式。
> 2. 將 Kotlin Multiplatform 專案作為相依性新增至該僅限 JVM 的專案中。
>
> 如果此變通方法無法解決您的問題，請在 [KTOR-8464](https://youtrack.jetbrains.com/issue/KTOR-8464) 留下留言讓我們知道。
>
{style="warning"}

## 外掛程式任務 {id="tasks"}

[安裝](#install-plugin) 外掛程式後，可以使用以下任務來打包、執行和部署應用程式：

- `buildImage`：將專案的 Docker 映像建置為 tarball。此任務會在 `build` 目錄中產生一個 `jib-image.tar` 檔案。您可以使用 [docker load](https://docs.docker.com/engine/reference/commandline/load/) 指令將此映像載入至 Docker daemon：
   ```Bash
   docker load < build/jib-image.tar
   ```
- `publishImageToLocalRegistry`：建置專案的 Docker 映像並發佈至本機 registry。
- `runDocker`：將專案的映像建置至 Docker daemon 並執行。執行此任務將啟動 Ktor 伺服器，預設回應於 `http://0.0.0.0:8080`。如果您的伺服器配置為使用其他連接埠，您可以調整 [連接埠對應](#port-mapping)。
- `publishImage`：建置專案的 Docker 映像並發佈至外部 registry，例如 [Docker Hub](https://hub.docker.com/) 或 [Google Container Registry](https://cloud.google.com/container-registry)。請注意，您需要針對此任務使用 **[ktor.docker.externalRegistry](#external-registry)** 屬性來配置外部 registry。

請注意，預設情況下，這些任務建置的映像名稱為 `ktor-docker-image`，標籤為 `latest`。您可以在 [外掛程式配置](#name-tag) 中自訂這些值。

## 配置 Ktor 外掛程式 {id="configure-plugin"}

若要配置與 Docker 任務相關的 Ktor 外掛程式設定，請在您的 `build.gradle.(kts)` 檔案中使用 `ktor.docker` 擴充：

```kotlin
ktor {
    docker {
        // ...
    }
}
```

### JRE 版本 {id="jre-version"}

`jreVersion` 屬性指定映像中要使用的 JRE 版本：

```kotlin
ktor {
    docker {
        jreVersion.set(JavaVersion.VERSION_17)
    }
}
```

### 映像名稱與標籤 {id="name-tag"}

如果您需要自訂映像名稱與標籤，請分別使用 `localImageName` 和 `imageTag` 屬性：

```kotlin
ktor {
    docker {
        localImageName.set("sample-docker-image")
        imageTag.set("0.0.1-preview")
    }
}
```

### 連接埠對應 {id="port-mapping"}

預設情況下，[runDocker](#tasks) 任務會將 `8080` 容器連接埠發佈至 `8080` Docker 主機連接埠。如有需要，您可以使用 `portMappings` 屬性變更這些連接埠。如果您的伺服器已[配置](server-configuration-file.topic#predefined-properties)為使用其他連接埠，這將會非常有用。

以下範例展示如何將 `8080` 容器連接埠對應至 `80` Docker 主機連接埠。

```kotlin
ktor {
    docker {
        portMappings.set(listOf(
            io.ktor.plugin.features.DockerPortMapping(
                80,
                8080,
                io.ktor.plugin.features.DockerPortMappingProtocol.TCP
            )
        ))
    }
}
```

在這種情況下，您可以透過 `http://0.0.0.0:80` 存取伺服器。

### 外部 registry {id="external-registry"}

在使用 **[publishImage](#tasks)** 任務將專案的 Docker 映像發佈至外部 registry 之前，您需要使用 `ktor.docker.externalRegistry` 屬性來配置外部 registry。此屬性接受 `DockerImageRegistry` 執行個體，該執行個體為所需的 registry 類型提供設定：

- `DockerImageRegistry.dockerHub`：為 [Docker Hub](https://hub.docker.com/) 建立 `DockerImageRegistry`。
- `DockerImageRegistry.googleContainerRegistry`：為 [Google Container Registry](https://cloud.google.com/container-registry) 建立 `DockerImageRegistry`。

以下範例展示如何配置 Docker Hub registry：

```kotlin
ktor {
    docker {
        externalRegistry.set(
            io.ktor.plugin.features.DockerImageRegistry.dockerHub(
                appName = provider { "ktor-app" },
                username = providers.environmentVariable("DOCKER_HUB_USERNAME"),
                password = providers.environmentVariable("DOCKER_HUB_PASSWORD")
            )
        )
    }
}
```

請注意，Docker Hub 的使用者名稱與密碼是從環境變數中擷取的，因此您需要在執行 `publishImage` 任務之前設定這些值：

<Tabs group="os">
<TabItem title="Linux/macOS" group-key="unix">

```Bash
export DOCKER_HUB_USERNAME=yourHubUsername
export DOCKER_HUB_PASSWORD=yourHubPassword
```

</TabItem>
<TabItem title="Windows" group-key="windows">

```Bash
setx DOCKER_HUB_USERNAME yourHubUsername
setx DOCKER_HUB_PASSWORD yourHubPassword
```

</TabItem>
</Tabs>

## 手動配置映像 {id="manual"}

如有需要，您可以提供自己的 `Dockerfile` 來組合包含 Ktor 應用程式的映像。

### 打包應用程式 {id="packagea-pp"}

第一步，您需要打包您的應用程式及其相依性。例如，這可以是 [fat JAR](server-fatjar.md) 或 [可執行的 JVM 應用程式](server-packaging.md)。

### 準備 Docker 映像 {id="prepare-docker"}

為了將應用程式 Docker 化，我們將使用 [多階段組建 (multi-stage builds)](https://docs.docker.com/develop/develop-images/multistage-build/)：

1. 首先，我們將為 Gradle/Maven 相依性設定快取。此步驟為選用，但建議執行，因為它可以提高整體組建速度。
2. 接著，我們將使用 `gradle`/`maven` 映像來產生包含應用程式的 fat JAR。
3. 最後，產生的發行套件將在基於 JDK 映像建立的環境中執行。

在專案的根資料夾中，建立一個名為 `Dockerfile` 的檔案，內容如下：

<Tabs group="languages">
<TabItem title="Gradle" group-key="kotlin">

<code-block lang="Docker" code="# Stage 1: Cache Gradle dependencies&#10;FROM gradle:latest AS cache&#10;RUN mkdir -p /home/gradle/cache_home&#10;ENV GRADLE_USER_HOME=/home/gradle/cache_home&#10;COPY build.gradle.* gradle.properties /home/gradle/app/&#10;COPY gradle /home/gradle/app/gradle&#10;WORKDIR /home/gradle/app&#10;RUN gradle dependencies --no-daemon&#10;&#10;# Stage 2: Build Application&#10;FROM gradle:latest AS build&#10;COPY --from=cache /home/gradle/cache_home /home/gradle/.gradle&#10;COPY --chown=gradle:gradle . /home/gradle/src&#10;WORKDIR /home/gradle/src&#10;# Build the fat JAR, Gradle also supports shadow&#10;# and boot JAR by default.&#10;RUN gradle buildFatJar --no-daemon&#10;&#10;# Stage 3: Create the Runtime Image&#10;FROM amazoncorretto:22 AS runtime&#10;EXPOSE 8080&#10;RUN mkdir /app&#10;COPY --from=build /home/gradle/src/build/libs/*.jar /app/ktor-docker-sample.jar&#10;ENTRYPOINT [&quot;java&quot;,&quot;-jar&quot;,&quot;/app/ktor-docker-sample.jar&quot;]"/>

</TabItem>
<TabItem title="Maven" group-key="maven">

```Docker
# Stage 1: Cache Maven dependencies
FROM maven:3.8-amazoncorretto-21 AS cache
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline

# Stage 2: Build Application
FROM maven:3.8-amazoncorretto-21 AS build
WORKDIR /app
COPY --from=cache /root/.m2 /root/.m2
COPY . .
RUN mvn clean package

# Stage 3: Create the Runtime Image
FROM amazoncorretto:21-slim AS runtime
EXPOSE 8080
WORKDIR /app
COPY --from=build /app/target/*-with-dependencies.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
```

</TabItem>
</Tabs>

第一階段確保只有在組建相關檔案發生變更時，才會重新下載相依性。如果未使用第一階段，或者未在其他階段快取相依性，則每次組建時都會安裝相依性。

在第二階段中會建置 fat JAR。請注意，Gradle 預設也支援 shadow 和 boot JAR。

組建的第三階段運作方式如下：

* 指出將要使用哪個映像。
* 指定公開的連接埠（這不會自動公開連接埠，而是在執行容器時進行）。
* 將內容從組建輸出複製到該資料夾。
* 執行應用程式（`ENTRYPOINT`）。

<tip id="jdk_image_replacement_tip">
  <p>
   此範例使用 Amazon Corretto Docker 映像，但您可以將其替換為任何其他合適的替代方案，例如以下項目：
  </p>
  <list>
    <li><a href="https://hub.docker.com/_/eclipse-temurin">Eclipse Temurin</a></li>
    <li><a href="https://hub.docker.com/_/ibm-semeru-runtimes">IBM Semeru</a></li>
    <li><a href="https://hub.docker.com/_/ibmjava">IBM Java</a></li>
    <li><a href="https://hub.docker.com/_/sapmachine">SAP Machine JDK</a></li>
  </list>
</tip>

### 建置並執行 Docker 映像 {id="build-run"}

下一步是建置並標記 Docker 映像：

```bash
docker build -t my-application .
```

最後，啟動該映像：

```bash
docker run -p 8080:8080 my-application
```

這將啟動 Ktor 伺服器，並於 `https://0.0.0.0:8080` 回應。