<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       id="docker-compose" title="Docker Compose">
    <show-structure for="chapter" depth="2"/>
    <tldr>
        <p>
            <control>初始项目</control>
            : <a
                href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/tutorial-server-db-integration">tutorial-server-db-integration</a>
        </p>
        <p>
            <control>最终项目</control>
            : <a
                href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/tutorial-server-docker-compose">tutorial-server-docker-compose</a>
        </p>
    </tldr>
    <p>在本主题中，我们将向你展示如何在 <a href="https://docs.docker.com/compose/">Docker Compose</a> 下运行 Ktor 服务器应用程序。我们将使用在
        <Links href="/ktor/server-integrate-database" summary="了解如何使用 Exposed SQL 库将 Ktor 服务连接到数据库仓库。">集成数据库</Links> 教程中创建的 项目，该项目使用
        <a href="https://github.com/JetBrains/Exposed">Exposed</a> 连接到 <a href="https://www.postgresql.org/docs/">PostgreSQL</a> 数据库，其中数据库和 Web
        应用程序是独立运行的。</p>
    <chapter title="准备应用程序" id="prepare-app">
        <chapter title="提取数据库设置" id="extract-db-settings">
            <p>
                在 <a href="server-integrate-database.topic#config-db-connection">配置数据库连接</a> 教程中创建的 项目使用硬编码属性来建立数据库连接。</p>
            <p>
                让我们将 PostgreSQL 数据库的连接设置提取到
                <Links href="/ktor/server-configuration-file" summary="了解如何通过配置文件配置各种服务器参数。">自定义配置组</Links> 中。
            </p>
            <procedure>
                <step>
                    <p>打开位于
                        <Path>src/main/resources</Path>
                        中的
                        <Path>application.yaml</Path>
                        文件，并在 <code>ktor</code> 组之外添加 <code>storage</code> 组，如下所示：
                    </p>
                    <code-block lang="yaml" code="ktor:&#10;  application:&#10;    modules:&#10;      - com.example.ApplicationKt.module&#10;  deployment:&#10;    port: 8080&#10;storage:&#10;  driverClassName: &quot;org.postgresql.Driver&quot;&#10;  jdbcURL: &quot;jdbc:postgresql://localhost:5432/ktor_tutorial_db&quot;&#10;  user: &quot;postgres&quot;&#10;  password: &quot;password&quot;"/>
                    <p>这些设置稍后将在 <a href="#configure-docker">
                        <Path>compose.yml</Path>
                    </a> 文件中配置。
                    </p>
                </step>
                <step>
                    <p>
                        打开位于
                        <Path>src/main/kotlin/com/example/plugins/</Path>
                        中的
                        <Path>Databases.kt</Path>
                        文件，并更新 <code>configureDatabases()</code> 函数
                        以从配置文件加载存储设置：
                    </p>
                    <code-block lang="kotlin" code="fun Application.configureDatabases(config: ApplicationConfig) {&#10;    val url = config.property(&quot;storage.jdbcURL&quot;).getString()&#10;    val user = config.property(&quot;storage.user&quot;).getString()&#10;    val password = config.property(&quot;storage.password&quot;).getString()&#10;&#10;    Database.connect(&#10;        url,&#10;        user = user,&#10;        password = password&#10;    )&#10;}"/>
                    <p>
                        <code>configureDatabases()</code> 函数现在接受 <code>ApplicationConfig</code> 并
                        使用 <code>config.property</code> 来加载自定义设置。
                    </p>
                </step>
                <step>
                    <p>
                        打开位于
                        <Path>src/main/kotlin/com/example/</Path>
                        中的
                        <Path>Application.kt</Path>
                        文件，并将 <code>environment.config</code> 传递给 <code>configureDatabases()</code>
                        以便在应用程序启动时加载连接设置：
                    </p>
                    <code-block lang="kotlin" code="fun Application.module() {&#10;    val repository = PostgresTaskRepository()&#10;&#10;    configureSerialization(repository)&#10;    configureDatabases(environment.config)&#10;    configureRouting()&#10;}"/>
                </step>
            </procedure>
        </chapter>
        <chapter title="配置 Ktor 插件" id="configure-ktor-plugin">
            <p>为了在 Docker 上运行，应用程序需要将所有必需的文件部署到
                容器中。根据你使用的构建系统，
                有不同的插件可以完成此操作：</p>
            <list>
                <li><Links href="/ktor/server-fatjar" summary="了解如何使用 Ktor Gradle 插件创建和运行可执行的 fat JAR。">使用 Ktor Gradle 插件创建 fat JARs</Links></li>
                <li><Links href="/ktor/maven-assembly-plugin" summary="示例项目：tutorial-server-get-started-maven">使用 Maven Assembly 插件创建 fat JARs</Links></li>
            </list>
            <p>在我们的示例中，Ktor 插件已在
                <Path>build.gradle.kts</Path>
                文件中应用。
            </p>
            <code-block lang="kotlin" code="plugins {&#10;    application&#10;    kotlin(&quot;jvm&quot;)&#10;    id(&quot;io.ktor.plugin&quot;) version &quot;3.2.3&quot;&#10;    id(&quot;org.jetbrains.kotlin.plugin.serialization&quot;) version &quot;2.1.20&quot;&#10;}"/>
        </chapter>
    </chapter>
    <chapter title="配置 Docker" id="configure-docker">
        <chapter title="准备 Docker 镜像" id="prepare-docker-image">
            <p>
                要将应用程序 Docker 化，请在 项目的根目录中创建一个新的
                <Path>Dockerfile</Path>
                文件并插入
                以下内容：
            </p>
            <code-block lang="Docker" code="# Stage 1: Cache Gradle dependencies&#10;FROM gradle:latest AS cache&#10;RUN mkdir -p /home/gradle/cache_home&#10;ENV GRADLE_USER_HOME=/home/gradle/cache_home&#10;COPY build.gradle.* gradle.properties /home/gradle/app/&#10;COPY gradle /home/gradle/app/gradle&#10;WORKDIR /home/gradle/app&#10;RUN gradle clean build -i --stacktrace&#10;&#10;# Stage 2: Build Application&#10;FROM gradle:latest AS build&#10;COPY --from=cache /home/gradle/cache_home /home/gradle/.gradle&#10;COPY --chown=gradle:gradle . /home/gradle/src&#10;WORKDIR /home/gradle/src&#10;# Build the fat JAR, Gradle also supports shadow&#10;# and boot JAR by default.&#10;RUN gradle buildFatJar --no-daemon&#10;&#10;# Stage 3: Create the Runtime Image&#10;FROM amazoncorretto:22 AS runtime&#10;EXPOSE 8080&#10;RUN mkdir /app&#10;COPY --from=build /home/gradle/src/build/libs/*.jar /app/ktor-docker-sample.jar&#10;ENTRYPOINT [&quot;java&quot;,&quot;-jar&quot;,&quot;/app/ktor-docker-sample.jar&quot;]"/>
            <tip>
                有关此多阶段构建如何工作的更多信息，请参阅 <a href="docker.md#prepare-docker">准备 Docker 镜像</a>。
            </tip>
            <p>
             此示例使用 Amazon Corretto Docker 镜像，但你可以将其替换为任何其他合适的替代方案，例如：
            </p>
            <list>
              <li><a href="https://hub.docker.com/_/eclipse-temurin">Eclipse Temurin</a></li>
              <li><a href="https://hub.docker.com/_/ibm-semeru-runtimes">IBM Semeru</a></li>
              <li><a href="https://hub.docker.com/_/ibmjava">IBM Java</a></li>
              <li><a href="https://hub.docker.com/_/sapmachine">SAP Machine JDK</a></li>
            </list>
        </chapter>
        <chapter title="配置 Docker Compose" id="configure-docker-compose">
            <p>在 项目的根目录中，创建一个新的
                <Path>compose.yml</Path>
                文件并添加以下内容：
            </p>
            <code-block lang="yaml" code="services:&#10;  web:&#10;    build: .&#10;    ports:&#10;      - &quot;8080:8080&quot;&#10;    depends_on:&#10;      db:&#10;        condition: service_healthy&#10;  db:&#10;    image: postgres&#10;    volumes:&#10;      - ./tmp/db:/var/lib/postgresql/data&#10;    environment:&#10;      POSTGRES_DB: ktor_tutorial_db&#10;      POSTGRES_HOST_AUTH_METHOD: trust&#10;    ports:&#10;      - &quot;5432:5432&quot;&#10;    healthcheck:&#10;      test: [ &quot;CMD-SHELL&quot;, &quot;pg_isready -U postgres&quot; ]&#10;      interval: 1s"/>
            <list>
                <li><code>web</code> 服务用于运行封装在 <a href="#prepare-docker-image">镜像</a> 中的 Ktor 应用程序。
                </li>
                <li><code>db</code> 服务使用 <code>postgres</code> 镜像来创建
                    <code>ktor_tutorial_db</code> 数据库，用于存储任务。
                </li>
            </list>
        </chapter>
    </chapter>
    <chapter title="构建并运行服务" id="build-run">
        <procedure>
            <step>
                <p>
                    运行以下命令以创建包含 Ktor 应用程序的 <a href="#configure-ktor-plugin">fat JAR</a>：
                </p>
                <code-block lang="Bash" code="                    ./gradlew :tutorial-server-docker-compose:buildFatJar"/>
            </step>
            <step>
                <p>
                    使用 <code>docker compose up</code> 命令构建镜像并启动容器：
                </p>
                <code-block lang="Bash" code="                    docker compose --project-directory snippets/tutorial-server-docker-compose up"/>
            </step>
            <step>
                等待 Docker Compose 完成镜像构建。
            </step>
            <step>
                <p>
                    导航到 [http://localhost:8080/static/index.html](http://localhost:8080/static/index.html)
                    打开 Web 应用程序。你将看到任务管理器客户端页面，其中显示了用于筛选和添加新任务的三个表单，以及一个任务表。
                </p>
                <img src="tutorial_server_db_integration_manual_test.gif"
                     alt="显示任务管理器客户端的浏览器窗口"
                     border-effect="rounded"
                     width="706"/>
            </step>
        </procedure>
    </chapter>
</topic>