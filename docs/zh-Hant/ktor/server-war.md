[//]: # (title: WAR)

<show-structure for="chapter" depth="2"/>

<tldr>
<p>
<b>程式碼範例</b>：
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/jetty-war">jetty-war</a>、
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/tomcat-war">tomcat-war</a>、
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/tomcat-war-ssl">tomcat-war-ssl</a>
</p>
</tldr>

<link-summary>
了解如何使用 WAR 封存檔在 Servlet 容器中執行並部署 Ktor 應用程式。
</link-summary>

您可以在 Tomcat 或 Jetty 等 Servlet 容器中執行 Ktor 應用程式。為此，您需要將應用程式封裝為 WAR 封存檔，並將其部署到支援 WAR 部署的伺服器或雲端服務。

在本主題中，您將學習如何：
* [配置 Ktor](#configure-ktor) 以用於 Servlet 應用程式。
* 套用 [Gretty](#configure-gretty) 與 [War](#configure-war) 外掛程式來執行與封裝 WAR 應用程式。
* [在 Servlet 容器中執行 Ktor 應用程式](#run)。
* [產生並部署 WAR 封存檔](#generate-war)。

## 在 Servlet 應用程式中配置 Ktor {id="configure-ktor"}

Ktor 允許您在應用程式中直接使用特定引擎（例如 Netty、Jetty 或 Tomcat）[建立並啟動伺服器](server-create-and-configure.topic)。在此設定中，您的應用程式會控制引擎配置、連線與 SSL 設定。

當部署到 Servlet 容器時，容器會控制應用程式生命週期與連線配置。為此，Ktor 提供了 [`ServletApplicationEngine`](https://api.ktor.io/ktor-server-servlet-jakarta/io.ktor.server.servlet.jakarta/-servlet-application-engine/index.html) 引擎，這會將應用程式的控制權委託給 Servlet 容器。

> 在 Servlet 容器內執行時，[在配置檔案中定義](server-configuration-file.topic)的 Ktor 連線與 SSL 設定將不會生效。
> 
> 有關在 Tomcat 中配置 SSL 的資訊，請參閱 [tomcat-war-ssl](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/tomcat-war-ssl) 範例。
> 
{style="note"}

### 新增相依性 {id="add-dependencies"}

要在 Servlet 應用程式中使用 Ktor，請將 `ktor-server-servlet-jakarta` 構件新增至您的建置指令碼：

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

部署到 Servlet 容器時，您不需要另外新增 [Jetty 或 Tomcat 引擎相依性](server-engines.md#dependencies)。

### 配置 Servlet {id="configure-servlet"}

要在您的應用程式中註冊 Ktor Servlet，請開啟 <Path>WEB-INF/web.xml</Path> 檔案，並將 `ServletApplicationEngine` 指派給 `servlet-class` 屬性：

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

接著，為此 Servlet 配置 URL 模式：

```xml
<servlet-mapping>
    <servlet-name>KtorServlet</servlet-name>
    <url-pattern>/</url-pattern>
</servlet-mapping>
```

## 配置 Gretty 外掛程式 {id="configure-gretty"}

[Gretty](https://plugins.gradle.org/plugin/org.gretty) 外掛程式允許您在 Jetty 與 Tomcat 上[執行](#run) Servlet 應用程式。

要套用此外掛程式，請開啟您的 <Path>build.gradle.kts</Path> 檔案，並將以下項目新增至 `plugins` 區塊：

```groovy
plugins {
    id("org.gretty") version "5.0.1"
}
```

然後，您可以按如下方式在 `gretty` 區塊中進行配置：

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

最後，配置 `run` 任務：

```groovy
afterEvaluate {
    tasks.getByName("run") {
        dependsOn("appRun")
    }
}
```

## 配置 War 外掛程式 {id="configure-war"}

War 外掛程式允許您[產生](#generate-war)用於部署至 Servlet 容器的 WAR 封存檔。

要套用此外掛程式，請開啟您的 <Path>build.gradle.kts</Path> 檔案，並將以下項目新增至 `plugins` 區塊：

```groovy
plugins {
    id("war")
}
```

## 執行應用程式 {id="run"}

您可以使用 `run` 任務執行已[配置 Gretty 外掛程式](#configure-gretty)的 Servlet 應用程式。例如，要執行 [`jetty-war`](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/jetty-war) 範例專案，請執行以下指令：

```Bash
./gradlew :jetty-war:run
```

## 產生並部署 WAR 封存檔 {id="generate-war"}

要使用 [`War`](#configure-war) 外掛程式產生 WAR 封存檔，請執行 `war` 任務。對於 [`jetty-war`](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/jetty-war) 範例專案，指令如下：

```Bash
./gradlew :jetty-war:war
```

任務完成後，`jetty-war.war` 會出現在對應模組的 <Path>build/libs</Path> 目錄中。

要部署產生的封存檔，請將檔案複製到您 Servlet 容器中的 <Path>jetty/webapps</Path> 目錄。

以下 `Dockerfile` 範例展示了如何在 Jetty 或 Tomcat Servlet 容器內執行產生的 WAR 檔案：

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

有關完整的範例，請參閱 [jetty-war](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/jetty-war) 與 [tomcat-war](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/tomcat-war)。