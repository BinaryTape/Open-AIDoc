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

Ktorアプリケーションは、TomcatやJettyなどのサーブレットコンテナ内で実行できます。これを行うには、アプリケーションをWARアーカイブとしてパッケージ化し、WARのデプロイに対応しているサーバーやクラウドサービスにデプロイする必要があります。

このトピックでは、以下の方法について説明します:
* [サーブレットアプリケーションで使用するためのKtorの設定](#configure-ktor)。
* WARアプリケーションの実行およびパッケージ化のための[Gretty](#configure-gretty)プラグインおよび[War](#configure-war)プラグインの適用。
* [サーブレットコンテナでのKtorアプリケーションの実行](#run)。
* [WARアーカイブの生成とデプロイ](#generate-war)。

## サーブレットアプリケーションでのKtorの設定 {id="configure-ktor"}

Ktorでは、特定のエンジン（Netty、Jetty、Tomcatなど）を使用して、アプリケーション内で直接[サーバーを作成および起動](server-create-and-configure.topic)できます。この構成では、アプリケーションがエンジン構成、接続、SSL設定を制御します。

サーブレットコンテナにデプロイする場合、コンテナ側がアプリケーションのライフサイクルと接続構成を制御します。
このためにKtorは[`ServletApplicationEngine`](https://api.ktor.io/ktor-server-servlet-jakarta/io.ktor.server.servlet.jakarta/-servlet-application-engine/index.html)エンジンを提供しており、これによりアプリケーションの制御をサーブレットコンテナに委ねることができます。

> サーブレットコンテナ内で実行する場合、[設定ファイルで定義されたKtorの接続およびSSL設定](server-configuration-file.topic)は適用されません。
> 
> TomcatでのSSL設定については、[tomcat-war-ssl](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/tomcat-war-ssl)のサンプルを参照してください。
> 
{style="note"}

### 依存関係の追加 {id="add-dependencies"}

サーブレットアプリケーションでKtorを使用するには、ビルドスクリプトに `ktor-server-servlet-jakarta` アーティファクトを追加します。

<var name="artifact_name" value="ktor-server-servlet-jakarta"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.servlet"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上記のコードスニペットでは、Ktorの依存関係を指定するために<a href="server-dependencies.topic#using-version-catalog">Ktorバージョンカタログ</a>を使用しています。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上記のコードスニペットでは、Ktorの依存関係を指定するために<a href="server-dependencies.topic#using-version-catalog">Ktorバージョンカタログ</a>を使用しています。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

サーブレットコンテナにデプロイする場合、個別の[JettyまたはTomcatエンジンの依存関係](server-engines.md#dependencies)を追加する必要はありません。

### サーブレットの設定 {id="configure-servlet"}

アプリケーションにKtorサーブレットを登録するには、<Path>WEB-INF/web.xml</Path> ファイルを開き、`servlet-class` 属性に `ServletApplicationEngine` を指定します。

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
<code-block lang="XML" code="&lt;servlet&gt;&#10;    &lt;display-name&gt;KtorServlet&lt;/display-name&gt;&#10;    &lt;servlet-name&gt;KtorServlet&lt;/servlet-name&gt;&#10;    &lt;servlet-class&gt;io.ktor.server.servlet.ServletApplicationEngine&lt;/servlet-class&gt;&#10;    &lt;init-param&gt;&#10;        &lt;param-name&gt;io.ktor.ktor.config&lt;/param-name&gt;&#10;        &lt;param-value&gt;application.conf&lt;/param-value&gt;&#10;    &lt;/init-param&gt;&#10;    &lt;async-supported&gt;true&lt;/async-supported&gt;&#10;&lt;/servlet&gt;"/>
</TabItem>
</Tabs>

次に、このサーブレットのURLパターンを設定します。

```xml
<servlet-mapping>
    <servlet-name>KtorServlet</servlet-name>
    <url-pattern>/</url-pattern>
</servlet-mapping>
```

## Grettyプラグインの設定 {id="configure-gretty"}

[Gretty](https://plugins.gradle.org/plugin/org.gretty)プラグインを使用すると、JettyおよびTomcat上でサーブレットアプリケーションを[実行](#run)できます。

まず、<Path>gradle/libs.versions.toml</Path> ファイルを開き、Grettyのバージョンとそのプラグインエイリアスを定義します。

```toml
[versions]
gretty = "5.0.1"

[plugins]
gretty = { id = "org.gretty", version.ref = "gretty" }
```

<Path>build.gradle.kts</Path> ファイルの `plugins {}` ブロックに以下のエントリを追加します。

```groovy
plugins {
    alias(libs.plugins.gretty)
}
```

その後、`gretty {}` ブロックでGrettyを設定できます。

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

最後に、`run` タスクを設定します。

```groovy
afterEvaluate {
    tasks.getByName("run") {
        dependsOn("appRun")
    }
}
```

## Warプラグインの設定 {id="configure-war"}

Warプラグインを使用すると、サーブレットコンテナにデプロイするためのWARアーカイブを[生成](#generate-war)できます。

プラグインを適用するには、<Path>build.gradle.kts</Path> ファイルを開き、`plugins {}` ブロックに以下のエントリを追加します。

```groovy
plugins {
    id("war")
}
```

## アプリケーションの実行 {id="run"}

[設定したGrettyプラグイン](#configure-gretty)を使用して、`run` タスクでサーブレットアプリケーションを実行できます。例えば、[`jetty-war`](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/jetty-war) サンプルプロジェクトを実行するには、次のコマンドを実行します。

```Bash
./gradlew :jetty-war:run
```

## WARアーカイブの生成とデプロイ {id="generate-war"}

[`War`](#configure-war)プラグインを使用してWARアーカイブを生成するには、`war` タスクを実行します。[`jetty-war`](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/jetty-war) サンプルプロジェクトの場合、コマンドは次のようになります。

```Bash
./gradlew :jetty-war:war
```

タスクが完了すると、対応するモジュールの <Path>build/libs</Path> ディレクトリに `jetty-war.war` が生成されます。

生成されたアーカイブをデプロイするには、サーブレットコンテナの <Path>jetty/webapps</Path> ディレクトリにファイルをコピーします。

以下の `Dockerfile` の例は、JettyまたはTomcatサーブレットコンテナ内で生成されたWARファイルを実行する方法を示しています。

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

> 完全なコード例については、[jetty-war](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/jetty-war) および [tomcat-war](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/tomcat-war) を参照してください。
>
{style="tip"}