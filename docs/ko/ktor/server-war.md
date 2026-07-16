[//]: # (title: WAR)

<show-structure for="chapter" depth="2"/>

<tldr>
<p>
<b>코드 예제</b>: 
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/jetty-war">jetty-war</a>, 
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/tomcat-war">tomcat-war</a>,
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/tomcat-war-ssl">tomcat-war-ssl</a>
</p>
</tldr>

<link-summary>
WAR 아카이브를 사용하여 서블릿 컨테이너 내에서 Ktor 애플리케이션을 실행하고 배포하는 방법을 알아봅니다.
</link-summary>

Tomcat이나 Jetty와 같은 서블릿 컨테이너(Servlet container) 내에서 Ktor 애플리케이션을 실행할 수 있습니다. 이를 위해 애플리케이션을 WAR 아카이브(WAR archive)로 패키징하고 WAR 배포를 지원하는 서버나 클라우드 서비스에 배포해야 합니다.

이 주제에서는 다음 방법을 배웁니다:
* [서블릿 애플리케이션에서 사용하기 위한 Ktor 구성](#configure-ktor).
* [Gretty](#configure-gretty) 및 [War](#configure-war) 플러그인을 적용하여 WAR 애플리케이션 실행 및 패키징.
* [서블릿 컨테이너에서 Ktor 애플리케이션 실행](#run).
* [WAR 아카이브 생성 및 배포](#generate-war).

## 서블릿 애플리케이션에서 Ktor 구성 {id="configure-ktor"}

Ktor를 사용하면 애플리케이션에서 직접 특정 엔진(Netty, Jetty 또는 Tomcat 등)을 사용하여 [서버를 생성하고 시작](server-create-and-configure.topic)할 수 있습니다. 이 설정에서는 애플리케이션이 엔진 구성, 연결 및 SSL 설정을 제어합니다.

서블릿 컨테이너에 배포할 때는 컨테이너가 애플리케이션 생명 주기(Lifecycle)와 연결 구성을 제어합니다. 이를 위해 Ktor는 애플리케이션의 제어권을 서블릿 컨테이너에 위임하는 [`ServletApplicationEngine`](https://api.ktor.io/ktor-server-servlet-jakarta/io.ktor.server.servlet.jakarta/-servlet-application-engine/index.html) 엔진을 제공합니다.

> 서블릿 컨테이너 내에서 실행할 때는 [구성 파일에 정의된 Ktor 연결 및 SSL 설정](server-configuration-file.topic)이 적용되지 않습니다.
> 
> Tomcat에서 SSL을 구성하는 방법은 [tomcat-war-ssl](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/tomcat-war-ssl) 샘플을 참조하세요.
> 
{style="note"}

### 의존성 추가 {id="add-dependencies"}

서블릿 애플리케이션에서 Ktor를 사용하려면 빌드 스크립트에 `ktor-server-servlet-jakarta` 아티팩트를 추가하세요.

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

서블릿 컨테이너에 배포할 때는 별도의 [Jetty 또는 Tomcat 엔진 의존성](server-engines.md#dependencies)을 추가할 필요가 없습니다.

### 서블릿 구성 {id="configure-servlet"}

애플리케이션에 Ktor 서블릿을 등록하려면 <Path>WEB-INF/web.xml</Path> 파일을 열고 `servlet-class` 속성에 `ServletApplicationEngine`을 할당하세요.

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

그런 다음, 이 서블릿에 대한 URL 패턴을 구성합니다.

```xml
<servlet-mapping>
    <servlet-name>KtorServlet</servlet-name>
    <url-pattern>/</url-pattern>
</servlet-mapping>
```

## Gretty 플러그인 구성 {id="configure-gretty"}

[Gretty](https://plugins.gradle.org/plugin/org.gretty) 플러그인을 사용하면 Jetty 및 Tomcat에서 서블릿 애플리케이션을 [실행](#run)할 수 있습니다.

플러그인을 적용하려면 <Path>build.gradle.kts</Path> 파일을 열고 `plugins` 블록에 다음 항목을 추가하세요.

```groovy
plugins {
    id("org.gretty") version "5.0.1"
}
```

그런 다음, 다음과 같이 `gretty` 블록에서 구성할 수 있습니다.

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

마지막으로 `run` 태스크를 구성합니다.

```groovy
afterEvaluate {
    tasks.getByName("run") {
        dependsOn("appRun")
    }
}
```

## War 플러그인 구성 {id="configure-war"}

War 플러그인을 사용하면 서블릿 컨테이너 배포를 위한 WAR 아카이브를 [생성](#generate-war)할 수 있습니다.

플러그인을 적용하려면 <Path>build.gradle.kts</Path> 파일을 열고 `plugins` 블록에 다음 항목을 추가하세요.

```groovy
plugins {
    id("war")
}
```

## 애플리케이션 실행 {id="run"}

`run` 태스크를 사용하여 [구성된 Gretty 플러그인](#configure-gretty)과 함께 서블릿 애플리케이션을 실행할 수 있습니다. 예를 들어, [`jetty-war`](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/jetty-war) 샘플 프로젝트를 실행하려면 다음 명령을 실행하세요.

```Bash
./gradlew :jetty-war:run
```

## WAR 아카이브 생성 및 배포 {id="generate-war"}

[`War`](#configure-war) 플러그인을 사용하여 WAR 아카이브를 생성하려면 `war` 태스크를 실행하세요. [`jetty-war`](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/jetty-war) 샘플 프로젝트의 경우 명령은 다음과 같습니다.

```Bash
./gradlew :jetty-war:war
```

태스크가 완료되면 해당 모듈의 <Path>build/libs</Path> 디렉토리에서 `jetty-war.war` 파일을 확인할 수 있습니다.

생성된 아카이브를 배포하려면 파일을 서블릿 컨테이너의 <Path>jetty/webapps</Path> 디렉토리에 복사하세요.

다음 `Dockerfile` 예제는 Jetty 또는 Tomcat 서블릿 컨테이너 내에서 생성된 WAR 파일을 실행하는 방법을 보여줍니다.

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

전체 예제는 [jetty-war](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/jetty-war) 및 [tomcat-war](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/tomcat-war)를 참조하세요.