[//]: # (title: Docker)

<show-structure for="chapter" depth="2"/>

<tldr>
<var name="example_name" value="deployment-ktor-plugin"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<web-summary>
了解如何将 Ktor 应用程序部署到 Docker 容器，随后可以在本地或所选的云提供商上运行该容器。
</web-summary>

<link-summary>
了解如何将应用程序部署到 Docker 容器。
</link-summary>

在本节中，你将学习如何使用 [Ktor Gradle 插件](https://github.com/ktorio/ktor-build-plugins) 通过 [Docker](https://www.docker.com) 打包、运行和部署应用程序。

## 安装 Ktor 插件 {id="install-plugin"}

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
    上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">
    Ktor 版本目录</a>来指定 Ktor 依赖项。
</note>

> 如果同时应用 Ktor Gradle 插件与 Kotlin Multiplatform Gradle 插件，Docker 集成将自动禁用。
> 要想将它们一起使用：
> 1. 创建一个仅限 JVM 的项目，并如上所示应用 Ktor Gradle 插件。
> 2. 将 Kotlin Multiplatform 项目作为依赖项添加到该仅限 JVM 的项目中。
>
> 如果此变通方法未能解决你的问题，请在 [KTOR-8464](https://youtrack.jetbrains.com/issue/KTOR-8464) 中留言告知我们。
>
{style="warning"}

## 插件任务 {id="tasks"}

[安装插件](#install-plugin)后，以下任务可用于打包、运行和部署应用程序：

- `buildImage`：将项目的 Docker 镜像构建为归档包（tarball）。该任务会在 `build` 目录下生成一个 `jib-image.tar` 文件。你可以使用 [docker load](https://docs.docker.com/engine/reference/commandline/load/) 命令将此镜像加载到 Docker 守护进程中：
   ```Bash
   docker load < build/jib-image.tar
   ```
- `publishImageToLocalRegistry`：构建项目的 Docker 镜像并将其发布到本地注册表。
- `runDocker`：将项目的镜像构建到 Docker 守护进程并运行它。执行此任务将启动 Ktor 服务器，默认响应地址为 `http://0.0.0.0:8080`。如果服务器配置为使用其他端口，可以调整[端口映射](#port-mapping)。
- `publishImage`：构建项目的 Docker 镜像并将其发布到外部注册表（例如 [Docker Hub](https://hub.docker.com/) 或 [Google Container Registry](https://cloud.google.com/container-registry)）。请注意，针对此任务，你需要使用 **[ktor.docker.externalRegistry](#external-registry)** 属性来配置外部注册表。

请注意，默认情况下，这些任务构建的镜像名称为 `ktor-docker-image`，标签为 `latest`。
你可以在[插件配置](#name-tag)中自定义这些值。

## 配置 Ktor 插件 {id="configure-plugin"}

要配置与 Docker 任务相关的 Ktor 插件设置，请在 `build.gradle(.kts)` 文件中使用 `ktor.docker` 扩展程序：

```kotlin
ktor {
    docker {
        // ...
    }
}
```

### JRE 版本 {id="jre-version"}

`jreVersion` 属性指定镜像中使用的 JRE 版本：

```kotlin
ktor {
    docker {
        jreVersion.set(JavaVersion.VERSION_17)
    }
}
```

### 镜像名称与标签 {id="name-tag"}

如果需要自定义镜像名称和标签，请分别使用 `localImageName` 和 `imageTag` 属性：

```kotlin
ktor {
    docker {
        localImageName.set("sample-docker-image")
        imageTag.set("0.0.1-preview")
    }
}
```

### 端口映射 {id="port-mapping"}

默认情况下，[runDocker](#tasks) 任务会将 `8080` 容器端口发布到 `8080` Docker 主机端口。
如有需要，可以使用 `portMappings` 属性更改这些端口。
如果你的服务器已[配置](server-configuration-file.topic#predefined-properties)为使用其他端口，这会非常有用。

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

在这种情况下，你可以通过 `http://0.0.0.0:80` 访问服务器。

### 外部注册表 {id="external-registry"}

在使用 **[publishImage](#tasks)** 任务将项目的 Docker 镜像发布到外部注册表之前，你需要使用 `ktor.docker.externalRegistry` 属性配置外部注册表。该属性接受 `DockerImageRegistry` 实例，该实例提供所需注册表类型的配置：

- `DockerImageRegistry.dockerHub`：为 [Docker Hub](https://hub.docker.com/) 创建 `DockerImageRegistry`。
- `DockerImageRegistry.googleContainerRegistry`：为 [Google Container Registry](https://cloud.google.com/container-registry) 创建 `DockerImageRegistry`。

以下示例展示了如何配置 Docker Hub 注册表：

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

请注意，Docker Hub 用户名和密码是从环境变量中获取的，因此在运行 `publishImage` 任务之前需要设置这些值：

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

## 手动配置镜像 {id="manual"}

如有需要，你可以提供自己的 `Dockerfile` 来组装包含 Ktor 应用程序的镜像。

### 打包应用程序 {id="packagea-pp"}

第一步，你需要将应用程序及其依赖项打包。
例如，这可以是一个 [fat JAR](server-fatjar.md) 或一个[可执行的 JVM 应用程序](server-packaging.md)。

### 准备 Docker 镜像 {id="prepare-docker"}

为了将应用程序容器化，我们将使用[多阶段构建](https://docs.docker.com/develop/develop-images/multistage-build/)：

1. 首先，我们将为 Gradle/Maven 依赖项设置缓存。此步骤是可选的，但建议执行，因为它可以提升整体构建速度。
2. 随后，我们将使用 `gradle`/`maven` 镜像来生成包含该应用程序的 fat JAR。
3. 最后，生成的发行包将在基于 JDK 镜像创建的环境中运行。

在项目的根文件夹中，创建一个名为 `Dockerfile` 的文件，其内容如下：

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

第一阶段确保仅在构建相关文件发生更改时才重新下载依赖项。如果未使用第一阶段，或者未在其他阶段缓存依赖项，则每次构建都会安装依赖项。

在第二阶段中构建 fat JAR。请注意，Gradle 默认还支持 shadow 和 boot JAR。

构建的第三阶段按以下方式工作：

* 指明将要使用的镜像。
* 指定公开的端口（这不会自动暴露端口，暴露端口是在运行容器时完成的）。
* 将构建输出的内容复制到文件夹中。
* 运行应用程序（`ENTRYPOINT`）。

<tip id="jdk_image_replacement_tip">
  <p>
   本示例使用的是 Amazon Corretto Docker 镜像，但你也可以将其替换为任何其他合适的替代方案，例如：
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

这将启动 Ktor 服务器，并在 `https://0.0.0.0:8080` 上响应请求。