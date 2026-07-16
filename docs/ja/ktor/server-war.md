[//]: # (title: WAR)

<show-structure for="chapter" depth="2"/>

<tldr>
<p>
<b>コード例</b>: 
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/jetty-war">jetty-war</a>, 
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/tomcat-war">tomcat-war</a>,
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/tomcat-war-ssl">tomcat-war-ssl</a>
</p>
</tldr>

<link-summary>
WARアーカイブを使用して、サーブレットコンテナ内でKtorアプリケーションを実行およびデプロイする方法を学びます。
</link-summary>

TomcatやJettyなどのサーブレットコンテナ内でKtorアプリケーションを実行できます。これを行うには、アプリケーションをWARアーカイブとしてパッケージ化し、WARデプロイをサポートするサーバーまたはクラウドサービスにデプロイする必要があります。

このトピックでは、以下の方法について説明します。
* [サーブレットアプリケーションで使用するためのKtorの設定](#configure-ktor)
* WARアプリケーションの実行とパッケージ化のための[Gretty](#configure-gretty)および[War](#configure-war)プラグインの適用
* [サーブレットコンテナでのKtorアプリケーションの実行](#run)
* [WARアーカイブの生成とデプロイ](#generate-war)

## サーブレットアプリケーションでのKtorの設定 {id="configure-ktor"}

Ktorでは、特定のエンジン（Netty、Jetty、Tomcatなど）を使用して[サーバーを作成および起動](server-create-and-configure.topic)プロセスを、アプリケーション内で直接行うことができます。このセットアップでは、アプリケーションがエンジンの構成、接続、SSL設定を制御します。

サーブレットコンテナにデプロイする場合、コンテナがアプリケーションのライフサイクルと接続構成を制御します。このために、Ktorはアプリケーションの制御をサーブレットコンテナに委譲する[`ServletApplicationEngine`](https://api.ktor.io/ktor-server-servlet-jakarta/io.ktor.server.servlet.jakarta/-servlet-application-engine/index.html)エンジンを提供しています。

> サーブレットコンテナ内で実行する場合、[設定ファイルで定義された](server-configuration-file.topic)Ktorの接続およびSSL設定は適用されません。
> 
> TomcatでのSSL構成については、[tomcat-war-ssl](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/tomcat-war-ssl)サンプルを参照してください。
> 
{style="note"}

### 依存関係の追加 {id="add-dependencies"}

サーブレットアプリケーションでKtorを使用するには、`ktor-server-servlet-jakarta`アーティファクトをビルドスクリプトに追加します。

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

サーブレットコンテナにデプロイする場合、個別の[JettyまたはTomcatエンジンの依存関係](server-engines.md#dependencies)を追加する必要はありません。

### サーブレットの構成 {id="configure-servlet"}

アプリケーションにKtorサーブレットを登録するには、<Path>WEB-INF/web.xml</Path>ファイルを開き、`servlet-class`属性に`ServletApplicationEngine`を割り当てます。

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

次に、このサーブレットのURLパターンを構成します。

```xml
<servlet-mapping>
    <servlet-name>KtorServlet</servlet-name>
    <url-pattern>/</url-pattern>
</servlet-mapping>
```

## Grettyプラグインの構成 {id="configure-gretty"}

[Gretty](https://plugins.gradle.org/plugin/org.gretty)プラグインを使用すると、JettyおよびTomcat上でサーブレットアプリケーションを[実行](#run)できます。

プラグインを適用するには、<Path>build.gradle.kts</Path>ファイルを開き、`plugins`ブロックに次のエントリを追加します。

```groovy
plugins {
    id("org.gretty") version "5.0.1"
}
```

その後、次のように`gretty`ブロックで構成できます。

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

最後に、`run`タスクを構成します。

```groovy
afterEvaluate {
    tasks.getByName("run") {
        dependsOn("appRun")
    }
}
```

## Warプラグインの構成 {id="configure-war"}

Warプラグインを使用すると、サーブレットコンテナへのデプロイ用のWARアーカイブを[生成](#generate-war)できます。

プラグインを適用するには、<Path>build.gradle.kts</Path>ファイルを開き、`plugins`ブロックに次のエントリを追加します。

```groovy
plugins {
    id("war")
}
```

## アプリケーションの実行 {id="run"}

[構成済みのGrettyプラグイン](#configure-gretty)を使用して、`run`タスクでサーブレットアプリケーションを実行できます。たとえば、[`jetty-war`](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/jetty-war)サンプルプロジェクトを実行するには、次のコマンドを実行します。

```Bash
./gradlew :jetty-war:run
```

## WARアーカイブの生成とデプロイ {id="generate-war"}

[`War`](#configure-war)プラグインを使用してWARアーカイブを生成するには、`war`タスクを実行します。[`jetty-war`](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/jetty-war)サンプルプロジェクトの場合、コマンドは次のようになります。

```Bash
./gradlew :jetty-war:war
```

タスクが完了すると、対応するモジュールの<Path>build/libs</Path>ディレクトリに`jetty-war.war`が生成されます。

生成されたアーカイブをデプロイするには、ファイルをサーブレットコンテナの<Path>jetty/webapps</Path>ディレクトリにコピーします。

次の`Dockerfile`の例は、生成されたWARファイルをJettyまたはTomcatサーブレットコンテナ内で実行する方法を示しています。

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

完全な例については、[jetty-war](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/jetty-war)および[tomcat-war](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/tomcat-war)を参照してください。