[//]: # (title: 部署)

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

本主題將概述如何部署 Ktor 應用程式。

> 為了簡化伺服器端 Ktor 應用程式的部署流程，你可以使用適用於 Gradle 的 [Ktor](https://github.com/ktorio/ktor-build-plugins) 外掛程式，它提供了以下功能：
> - 建置 fat JAR。
> - 將你的應用程式 Docker 化。

## Ktor 部署細節 {id="ktor-specifics"}
伺服器端 Ktor 應用程式的部署流程取決於以下細節：
* 你打算將應用程式部署為獨立套件 (self-contained package)，還是部署在 Servlet 容器內。
* 你使用哪種方法來建立與配置伺服器。

### 獨立應用程式 vs Servlet 容器 {id="self-contained-vs-servlet"}

Ktor 允許你直接在應用程式中建立並啟動帶有預期網路[引擎](server-engines.md)（例如 Netty、Jetty 或 Tomcat）的伺服器。在此情況下，引擎是應用程式的一部分。你的應用程式可掌控引擎設定、連線以及 SSL 選項。若要部署你的應用程式，你可以將其[打包](#packaging)為 fat JAR 或可執行的 JVM 應用程式。

與上述方法不同，Servlet 容器應控制應用程式生命週期與連線設定。Ktor 提供了一個特殊的 `ServletApplicationEngine` 引擎，將應用程式的控制權委託給 Servlet 容器。若要在 Servlet 容器內部署，你需要產生一個 [WAR 封存檔](server-war.md)。

### 配置：程式碼 vs 配置檔案 {id="code-vs-config"}

為部署配置獨立的 Ktor 應用程式時，可能取決於[建立與配置伺服器](server-create-and-configure.topic)所採用的方式：在程式碼中配置，或是使用[配置檔案](server-configuration-file.topic)。舉例來說，[代管服務商](#publishing)可能要求指定用於接聽傳入請求的連接埠。在這種情況下，你需要在程式碼或在 `application.conf` / `application.yaml` 中[配置](server-configuration-file.topic)連接埠。

## 打包 {id="packaging"}

在部署應用程式之前，你需要透過以下其中一種方式將其打包：

* **Fat JAR**

  fat JAR 是一個包含所有程式碼相依性的可執行 JAR。你可以將其部署至任何支援 fat JAR 的[雲端服務](#publishing)。如果你需要為 GraalVM 產生原生二進位檔，也必須使用 fat JAR。若要建立 fat JAR，你可以使用適用於 Gradle 的 [Ktor](server-fatjar.md) 外掛程式或適用於 Maven 的 [Assembly](maven-assembly-plugin.md) 外掛程式。

* **可執行的 JVM 應用程式**

   可執行的 JVM 應用程式是一個已打包的應用程式，其中包含程式碼相依性以及產生的啟動指令碼。針對 Gradle，你可以使用 [Application](server-packaging.md) 外掛程式來產生應用程式。 

* **WAR**

   [WAR 封存檔](server-war.md)可讓你將應用程式部署在 Servlet 容器（例如 Tomcat 或 Jetty）中。

* **GraalVM**

   Ktor 伺服器端應用程式可以利用 [GraalVM](graalvm.md) 為不同平台產生原生映像 (native images)。

## 容器化 {id="containerizing"}

在將應用程式打包（例如打包為可執行的 JVM 應用程式或 fat JAR）之後，你可以準備包含此應用程式的 [Docker 映像](docker.md)。此映像隨後可用於在 Kubernetes、Swarm 或所需的雲端服務容器執行個體上執行你的應用程式。

## 發佈 {id="publishing"}

以下教學示範如何將 Ktor 應用程式部署至特定的雲端供應商：
* [Google App Engine](google-app-engine.md)
* [Heroku](heroku.md)
* [Dokku](dokku.md)
* [AWS Elastic Beanstalk](elastic-beanstalk.md)

## SSL {id="ssl"}

如果你的 Ktor 伺服器置於反向代理（如 Nginx 或 Apache）之後，或是在 Servlet 容器（Tomcat 或 Jetty）內執行，則 SSL 設定由反向代理或 Servlet 容器管理。如有需要，你可以配置 Ktor 使用 Java KeyStore 來[直接提供 SSL](server-ssl.md) 服務。

> 請注意，當 Ktor 應用程式部署在 Servlet 容器內時，SSL 設定將不會生效。