[//]: # (title: 部署)

<show-structure for="chapter" depth="2"/>

<tldr>
<var name="example_name" value="deployment-ktor-plugin"/>
<p>
    <b>代码示例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

在本主题中，我们将概述如何部署 Ktor 应用程序。

> 为简化服务端 Ktor 应用程序的部署流程，你可以使用 Gradle 的 [Ktor](https://github.com/ktorio/ktor-build-plugins) 插件，该插件提供了以下功能：
> - 构建 fat JAR。
> - 将你的应用程序容器化（Docker 化）。

## Ktor 部署细节 {id="ktor-specifics"}
服务端 Ktor 应用程序的部署流程取决于以下细节：
* 你是要将应用程序作为独立自包含包部署，还是部署在 Servlet 容器内。
* 你使用哪种方式来创建和配置服务器。

### 独立应用 vs Servlet 容器 {id="self-contained-vs-servlet"}

Ktor 允许你直接在应用程序中创建并启动带有指定网络[引擎](server-engines.md)（例如 Netty、Jetty 或 Tomcat）的服务器。在这种情况下，引擎是应用程序的一部分。你的应用程序可以控制引擎设置、连接以及 SSL 选项。若要部署应用程序，你可以将其[打包](#packaging)为 fat JAR 或可执行 JVM 应用程序。

与上述方式相反，Servlet 容器应控制应用程序的生命周期和连接设置。Ktor 提供了专用的 `ServletApplicationEngine` 引擎，将对应用程序的控制权委托给 Servlet 容器。若要在 Servlet 容器内部署，你需要生成一个 [WAR 归档文件](server-war.md)。

### 配置：代码 vs 配置文件 {id="code-vs-config"}

配置用于部署的独立 Ktor 应用程序可能取决于[创建和配置服务器](server-create-and-configure.topic)所采用的方式：在代码中配置，或使用[配置文件](server-configuration-file.topic)。例如，[托管服务商](#publishing)可能要求指定用于侦听传入请求的端口。在这种情况下，你需要在代码中或在 `application.conf`/`application.yaml` 中[配置](server-configuration-file.topic)端口。

## 打包 {id="packaging"}

在部署应用程序之前，你需要通过以下方式之一对其进行打包：

* **Fat JAR**

  fat JAR 是包含所有代码依赖项的可执行 JAR。你可以将其部署到任何支持 fat JAR 的[云服务](#publishing)。如果你需要为 GraalVM 生成原生二进制文件，也必须使用 fat JAR。若要创建 fat JAR，你可以使用 Gradle 的 [Ktor](server-fatjar.md) 插件或 Maven 的 [Assembly](maven-assembly-plugin.md) 插件。

* **可执行 JVM 应用程序**

   可执行 JVM 应用程序是包含代码依赖项和已生成的启动脚本的打包应用程序。对于 Gradle，你可以使用 [Application](server-packaging.md) 插件来生成应用程序。

* **WAR**

   [WAR 归档文件](server-war.md)允许你将应用程序部署在 Servlet 容器（如 Tomcat 或 Jetty）内部。

* **GraalVM**

   Ktor 服务端应用程序可以使用 [GraalVM](graalvm.md)，以便为不同平台构建原生镜像 (native image)。

## 容器化 {id="containerizing"}

在打包应用程序（例如打包为可执行 JVM 应用程序或 fat JAR）之后，你可以为该应用程序准备一个 [Docker 镜像](docker.md)。随后可以使用该镜像在 Kubernetes、Swarm 或所需的云服务容器实例上运行你的应用程序。

## 发布 {id="publishing"}

以下教程展示了如何将 Ktor 应用程序部署到特定的云提供商：
* [Google App Engine](google-app-engine.md)
* [Heroku](heroku.md)
* [Dokku](dokku.md)
* [AWS Elastic Beanstalk](elastic-beanstalk.md)

## SSL {id="ssl"}

如果你的 Ktor 服务器位于反向代理（例如 Nginx 或 Apache）之后，或运行在 Servlet 容器（Tomcat 或 Jetty）内部，则 SSL 设置由反向代理或 Servlet 容器管理。如有需要，你可以通过使用 Java KeyStore 将 Ktor 配置为[直接提供 SSL 服务](server-ssl.md)。

> 请注意，当 Ktor 应用程序部署在 Servlet 容器内时，SSL 设置不会生效。