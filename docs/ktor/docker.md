[//]: # (title: Docker)

<show-structure for="chapter" depth="2"/>

<tldr>
<var name="example_name" value="deployment-ktor-plugin"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<web-summary>
了解如何将 Ktor 应用程序部署到 Docker 容器，该容器随后可以本地运行，也可以在您选择的云提供商上运行。
</web-summary>

<link-summary>
了解如何将您的应用程序部署到 Docker 容器。
</link-summary>

在本节中，我们将介绍如何使用 [Ktor Gradle 插件](https://github.com/ktorio/ktor-build-plugins) 通过 [Docker](https://www.docker.com) 进行应用程序的打包、运行和部署。

## 安装 Ktor 插件 {id="install-plugin"}

要安装 Ktor 插件，请将其添加到 `build.gradle.(kts)` 文件的 `plugins` 块中：

<Tabs group="languages">
<TabItem title="Gradle (Kotlin)" group-key="kotlin">

```kotlin
plugins {
    id("io.ktor.plugin") version "%ktor_version%"
}
```

{interpolate-variables="true"}

</TabItem>
<TabItem title="Gradle (Groovy)" group-key="groovy">

```groovy
plugins {
    id "io.ktor.plugin" version "%ktor_version%"
}
```

{interpolate-variables="true"}

</TabItem>
</Tabs>

> 如果您同时应用了 Ktor Gradle 插件和 Kotlin Multiplatform Gradle 插件，Docker 集成将自动禁用。
> 要能够一起使用它们：
> 1. 创建一个仅限 JVM 的项目，并按上文所示应用 Ktor Gradle 插件。
> 2. 将 Kotlin Multiplatform 项目作为依赖项添加到该仅限 JVM 的项目中。
>
> 如果此临时方案无法为您解决问题，请在 [KTOR-8464](https://youtrack.jetbrains.com/issue/KTOR-8464) 中留言告知我们。
>
{style="warning"}

## 插件任务 {id="tasks"}

[安装](#install-plugin) 插件后，可以使用以下任务来打包、运行和部署应用程序：

- `buildImage`：将项目的 Docker 镜像构建为 tar 包。此任务在 `build` 目录中生成一个 `jib-image.tar` 文件。您可以使用 [docker load](https://docs.docker.com/engine/reference/commandline/load/) 命令将此镜像加载到 Docker 守护进程中：
   ```Bash
   docker load < build/jib-image.tar
   ```
- `publishImageToLocalRegistry`：构建项目的 Docker 镜像并将其发布到本地注册表。
- `runDocker`：将项目的镜像构建到 Docker 守护进程并运行它。执行此任务将启动 Ktor 服务器，默认情况下在 `http://0.0.0.0:8080` 上响应。如果您的服务器配置为使用其他端口，您可以调整 [端口映射](#port-mapping)。
- `publishImage`：构建项目的 Docker 镜像并将其发布到外部注册表，例如 [Docker Hub](https://hub.docker.com/) 或 [Google Container Registry](https://cloud.google.com/container-registry)。请注意，您需要为此任务使用 **[ktor.docker.externalRegistry](#external-registry)** 属性来配置外部注册表。

请注意，默认情况下，这些任务使用 `ktor-docker-image` 名称和 `latest` 标签构建镜像。您可以在 [插件配置](#name-tag) 中自定义这些值。

## 配置 Ktor 插件 {id="configure-plugin"}

要配置与 Docker 任务相关的 Ktor 插件设置，请在 `build.gradle.(kts)` 文件中使用 `ktor.docker` 扩展：

```kotlin
ktor {
    docker {
        // ...
    }
}
```

### JRE 版本 {id="jre-version"}

`jreVersion` 属性指定镜像中要使用的 JRE 版本：

```kotlin
ktor {
    docker {
        jreVersion.set(JavaVersion.VERSION_17)
    }
}
```

### 镜像名称和标签 {id="name-tag"}

如果您需要自定义镜像名称和标签，请分别使用 `localImageName` 和 `imageTag` 属性：

```kotlin
ktor {
    docker {
        localImageName.set("sample-docker-image")
        imageTag.set("0.0.1-preview")
    }
}
```

### 端口映射 {id="port-mapping"}

默认情况下，[runDocker](#tasks) 任务会将 `8080` 容器端口发布到 `8080` Docker 主机端口。如果需要，您可以使用 `portMappings` 属性更改这些端口。如果您的服务器已 [配置](server-configuration-file.topic#predefined-properties) 为使用其他端口，这可能会很有用。

下面的示例展示了如何将 `8080` 容器端口映射到 `80` Docker 主机端口。

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

在这种情况下，您可以在 `http://0.0.0.0:80` 上访问服务器。

### 外部注册表 {id="external-registry"}

在使用 **[publishImage](#tasks)** 任务将项目的 Docker 镜像发布到外部注册表之前，您需要使用 `ktor.docker.externalRegistry` 属性配置外部注册表。此属性接受 `DockerImageRegistry` 实例，该实例提供所需注册表类型的配置：

- `DockerImageRegistry.dockerHub`：为 [Docker Hub](https://hub.docker.com/) 创建一个 `DockerImageRegistry`。
- `DockerImageRegistry.googleContainerRegistry`：为 [Google Container Registry](https://cloud.google.com/container-registry) 创建一个 `DockerImageRegistry`。

下面的示例展示了如何配置 Docker Hub 注册表：

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

请注意，Docker Hub 的名称和密码是从环境变量中获取的，因此在运行 `publishImage` 任务之前，您需要设置这些值：

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

## 手动镜像配置 {id="manual"}

如果需要，您可以提供自己的 `Dockerfile` 来组装包含 Ktor 应用程序的镜像。

### 打包应用程序 {id="packagea-pp"}

第一步，您需要将应用程序及其依赖项一起打包。例如，这可以是一个 [Fat JAR](server-fatjar.md) 或一个 [可执行 JVM 应用程序](server-packaging.md)。

### 准备 Docker 镜像 {id="prepare-docker"}

为了将应用程序 Docker 化，我们将使用 [多阶段构建](https://docs.docker.com/develop/develop-images/multistage-build/)：

1. 首先，我们将为 Gradle/Maven 依赖项设置缓存。此步骤是可选的，但建议执行，因为它可以提高整体构建速度。
2. 然后，我们将使用 `gradle`/`maven` 镜像生成包含应用程序的 Fat JAR。
3. 最后，生成的发布包将在基于 JDK 镜像创建的环境中运行。

在项目的根文件夹中，创建一个名为 `Dockerfile` 的文件，内容如下：

<Tabs group="languages">
<TabItem title="Gradle" group-key="kotlin">

<code-block lang="Docker" code="# 第 1 阶段：缓存 Gradle 依赖项&#10;FROM gradle:latest AS cache&#10;RUN mkdir -p /home/gradle/cache_home&#10;ENV GRADLE_USER_HOME=/home/gradle/cache_home&#10;COPY build.gradle.* gradle.properties /home/gradle/app/&#10;COPY gradle /home/gradle/app/gradle&#10;WORKDIR /home/gradle/app&#10;RUN gradle dependencies --no-daemon&#10;&#10;# 第 2 阶段：构建应用程序&#10;FROM gradle:latest AS build&#10;COPY --from=cache /home/gradle/cache_home /home/gradle/.gradle&#10;COPY --chown=gradle:gradle . /home/gradle/src&#10;WORKDIR /home/gradle/src&#10;# 构建 Fat JAR，Gradle 默认还支持 shadow&#10;# 和 boot JAR。&#10;RUN gradle buildFatJar --no-daemon&#10;&#10;# 第 3 阶段：创建运行镜像&#10;FROM amazoncorretto:22 AS runtime&#10;EXPOSE 8080&#10;RUN mkdir /app&#10;COPY --from=build /home/gradle/src/build/libs/*.jar /app/ktor-docker-sample.jar&#10;ENTRYPOINT [&quot;java&quot;,&quot;-jar&quot;,&quot;/app/ktor-docker-sample.jar&quot;]"></code-block>

</TabItem>
<TabItem title="Maven" group-key="maven">

```Docker
# 第 1 阶段：缓存 Maven 依赖项
FROM maven:3.8-amazoncorretto-21 AS cache
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline

# 第 2 阶段：构建应用程序
FROM maven:3.8-amazoncorretto-21 AS build
WORKDIR /app
COPY --from=cache /root/.m2 /root/.m2
COPY . .
RUN mvn clean package

# 第 3 阶段：创建运行镜像
FROM amazoncorretto:21-slim AS runtime
EXPOSE 8080
WORKDIR /app
COPY --from=build /app/target/*-with-dependencies.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
```

</TabItem>
</Tabs>

第一阶段确保仅在与构建相关的文件发生更改时才重新下载依赖项。如果不使用第一阶段，或者在其他阶段未缓存依赖项，则每次构建都会安装依赖项。

在第二阶段中，将构建 Fat JAR。请注意，Gradle 默认还支持 shadow 和 boot JAR。

构建的第三阶段按以下方式工作：

* 指示将使用哪个镜像。
* 指定公开的端口（这不会自动公开端口，端口公开是在运行容器时完成的）。
* 将构建输出的内容复制到文件夹中。
* 运行应用程序 (`ENTRYPOINT`)。

<tip id="jdk_image_replacement_tip">
  <p>
   此示例使用 Amazon Corretto Docker 镜像，但您可以将其替换为任何其他合适的替代品，例如：
  </p>
  <list>
    <li><a href="https://hub.docker.com/_/eclipse-temurin">Eclipse Temurin</a></li>
    <li><a href="https://hub.docker.com/_/ibm-semeru-runtimes">IBM Semeru</a></li>
    <li><a href="https://hub.docker.com/_/ibmjava">IBM Java</a></li>
    <li><a href="https://hub.docker.com/_/sapmachine">SAP Machine JDK</a></li>
  </list>
</tip>

### 构建并运行 Docker 镜像 {id="build-run"}

下一步是构建并标记 Docker 镜像：

```bash
docker build -t my-application .
```

最后，启动镜像：

```bash
docker run -p 8080:8080 my-application
```

这将启动 Ktor 服务器，在 `https://0.0.0.0:8080` 上响应。