[//]: # (title: WAR)

<show-structure for="chapter" depth="2"/>

<tldr>
<p>
<b>代码示例</b>：
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/jetty-war">jetty-war</a>、
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/tomcat-war">tomcat-war</a>、
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/tomcat-war-ssl">tomcat-war-ssl</a>
</p>
</tldr>

<link-summary>
了解如何使用 WAR 归档文件在 servlet 容器中运行和部署 Ktor 应用程序。
</link-summary>

您可以在 servlet 容器（如 Tomcat 或 Jetty）中运行 Ktor 应用程序。为此，您需要将应用程序打包为 WAR 归档文件，并将其部署到支持 WAR 部署的服务器或云服务。

在本主题中，您将学习如何：
* [配置 Ktor 以在 servlet 应用程序中使用](#configure-ktor)。
* 应用 [Gretty](#configure-gretty) 和 [War](#configure-war) 插件来运行和打包 WAR 应用程序。
* [在 servlet 容器中运行 Ktor 应用程序](#run)。
* [生成并部署 WAR 归档文件](#generate-war)。

## 在 servlet 应用程序中配置 Ktor {id="configure-ktor"}

Ktor 允许您直接在应用程序中使用特定引擎（如 Netty、Jetty 或 Tomcat）[创建和启动服务器](server-create-and-configure.topic)。在这种设置中，由您的应用程序控制引擎配置、连接和 SSL 设置。

当部署到 servlet 容器时，容器将控制应用程序生命周期和连接配置。为此，Ktor 提供了 [`ServletApplicationEngine`](https://api.ktor.io/ktor-server-servlet-jakarta/io.ktor.server.servlet.jakarta/-servlet-application-engine/index.html) 引擎，它将应用程序的控制权委托给 servlet 容器。

> 在 servlet 容器内部运行时，[在配置文件中定义的 Ktor 连接和 SSL 设置](server-configuration-file.topic)将不会生效。
> 
> 有关在 Tomcat 中配置 SSL 的信息，请参阅 [tomcat-war-ssl](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/tomcat-war-ssl) 示例。
> 
{style="note"}

### 添加依赖项 {id="add-dependencies"}

要在 servlet 应用程序中使用 Ktor，请将 `ktor-server-servlet-jakarta` 构件添加到您的构建脚本中：

<var name="artifact_name" value="ktor-server-servlet-jakarta"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"></code-block>
    </TabItem>
</Tabs>

部署到 servlet 容器时，您不需要添加单独的 [Jetty 或 Tomcat 引擎依赖项](server-engines.md#dependencies)。

### 配置 servlet {id="configure-servlet"}

要在您的应用程序中注册 Ktor servlet，请打开 <Path>WEB-INF/web.xml</Path> 文件，并将 `ServletApplicationEngine` 分配给 `servlet-class` 属性：

<Tabs>
<TabItem title="Tomcat/Jetty v10.x+">

```xml
<servlet>
    <display-name>KtorServlet</display-name>
    <servlet-name>KtorServlet</servlet-name>
    <servlet-class>io.ktor.server.servlet.jakarta.ServletApplicationEngine</servlet-class>
    <init-param>
        <param-name>io.ktor.ktor.config</param-name>
        <param-value>application.conf</param-value>
    </init-param>
    <async-supported>true</async-supported>
</servlet>
```

</TabItem>
<TabItem title="Tomcat/Jetty v9.x">
<code-block lang="XML" code="&lt;servlet&gt;&#10;    &lt;display-name&gt;KtorServlet&lt;/display-name&gt;&#10;    &lt;servlet-name&gt;KtorServlet&lt;/servlet-name&gt;&#10;    &lt;servlet-class&gt;io.ktor.server.servlet.ServletApplicationEngine&lt;/servlet-class&gt;&#10;    &lt;init-param&gt;&#10;        &lt;param-name&gt;io.ktor.ktor.config&lt;/param-name&gt;&#10;        &lt;param-value&gt;application.conf&lt;/param-value&gt;&#10;    &lt;/init-param&gt;&#10;    &lt;async-supported&gt;true&lt;/async-supported&gt;&#10;&lt;/servlet&gt;"></code-block>
</TabItem>
</Tabs>

然后，为此 servlet 配置 URL 模式：

```xml
<servlet-mapping>
    <servlet-name>KtorServlet</servlet-name>
    <url-pattern>/</url-pattern>
</servlet-mapping>
```

## 配置 Gretty 插件 {id="configure-gretty"}

[Gretty](https://plugins.gradle.org/plugin/org.gretty) 插件允许您在 Jetty 和 Tomcat 上[运行](#run) servlet 应用程序。

要应用该插件，请打开您的 <Path>build.gradle.kts</Path> 文件，并在 `plugins` 块中添加以下条目：

```groovy
plugins {
    id("org.gretty") version "5.0.1"
}
```

然后，您可以按如下方式在 `gretty` 块中进行配置：

<Tabs>
<TabItem title="Jetty">

```groovy
gretty {
    servletContainer = "jetty12"
    contextPath = "/"
}
```

</TabItem>
<TabItem title="Tomcat">

```groovy
gretty {
    servletContainer = "tomcat10"
    contextPath = "/"
}
```

</TabItem>
</Tabs>

最后，配置 `run` 任务：

```groovy
afterEvaluate {
    tasks.getByName("run") {
        dependsOn("appRun")
    }
}
```

## 配置 War 插件 {id="configure-war"}

War 插件允许您[生成](#generate-war)用于部署到 servlet 容器的 WAR 归档文件。

要应用该插件，请打开您的 <Path>build.gradle.kts</Path> 文件，并在 `plugins` 块中添加以下条目：

```groovy
plugins {
    id("war")
}
```

## 运行应用程序 {id="run"}

您可以使用 `run` 任务运行配置了 [Gretty 插件](#configure-gretty)的 servlet 应用程序。例如，要运行 [`jetty-war`](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/jetty-war) 示例项目，请运行以下命令：

```Bash
./gradlew :jetty-war:run
```

## 生成并部署 WAR 归档文件 {id="generate-war"}

要使用 [`War`](#configure-war) 插件生成 WAR 归档文件，请运行 `war` 任务。对于 [`jetty-war`](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/jetty-war) 示例项目，命令如下所示：

```Bash
./gradlew :jetty-war:war
```

任务完成后，`jetty-war.war` 将在对应模块的 <Path>build/libs</Path> 目录中可用。

要部署生成的归档文件，请将文件复制到 servlet 容器中的 <Path>jetty/webapps</Path> 目录。

以下 `Dockerfile` 示例展示了如何在 Jetty 或 Tomcat servlet 容器中运行生成的 WAR 文件：

<Tabs>
<TabItem title="Jetty">

```Docker
FROM jetty:12.0.29
EXPOSE 8080:8080
COPY ./build/libs/jetty-war.war/ /var/lib/jetty/webapps
WORKDIR /var/lib/jetty
CMD ["java","-jar","/usr/local/jetty/start.jar"]

```

</TabItem>
<TabItem title="Tomcat">

```Docker
FROM tomcat:10.1.50
EXPOSE 8080:8080
COPY ./build/libs/tomcat-war.war/ /usr/local/tomcat/webapps
WORKDIR /usr/local/tomcat
CMD ["catalina.sh", "run"]

```

</TabItem>
</Tabs>

有关完整示例，请参阅 [jetty-war](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/jetty-war) 和 [tomcat-war](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/tomcat-war)。