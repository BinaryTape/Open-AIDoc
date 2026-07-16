<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       id="docker-compose" title="Docker Compose">
<show-structure for="chapter" depth="2"/>
<tldr>
    <p>
        <control>初始專案</control>
        : <a
            href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/tutorial-server-db-integration">tutorial-server-db-integration</a>
    </p>
    <p>
        <control>最終專案</control>
        : <a
            href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/tutorial-server-docker-compose">tutorial-server-docker-compose</a>
    </p>
</tldr>
<p>在本主題中，我們將向您展示如何在 <a href="https://docs.docker.com/compose/">Docker Compose</a> 下執行 Ktor 伺服器應用程式。我們將使用在
    <Links href="/ktor/server-integrate-database" summary="了解使用 Exposed SQL 函式庫將 Ktor 服務連接到資料庫儲存庫的過程。">整合資料庫</Links> 教學課程中建立的專案，該專案使用
    <a href="https://github.com/JetBrains/Exposed">Exposed</a> 連接到
    <a href="https://www.postgresql.org/docs/">PostgreSQL</a> 資料庫，其中資料庫和網頁應用程式是分開執行的。</p>
<chapter title="準備應用程式" id="prepare-app">
    <chapter title="提取資料庫設定" id="extract-db-settings">
        <p>
            在 <a href="server-integrate-database.topic#config-db-connection">設定資料庫連接</a> 教學課程中建立的專案使用硬編碼屬性來建立資料庫連接。</p>
        <p>
            讓我們將 PostgreSQL 資料庫的連接設定提取到
            <Links href="/ktor/server-configuration-file" summary="了解如何在配置檔中設定各種伺服器參數。">自訂配置群組</Links>中。
        </p>
        <procedure>
            <step>
                <p>在
                    <Path>src/main/resources</Path>
                    中開啟
                    <Path>application.yaml</Path>
                    檔案，並在 <code>ktor</code> 群組外部新增 <code>storage</code> 群組，如下所示：
                </p>
                <code-block lang="yaml" code="ktor:&#10;  application:&#10;    modules:&#10;      - com.example.ApplicationKt.module&#10;  deployment:&#10;    port: 8080&#10;storage:&#10;  driverClassName: &quot;org.postgresql.Driver&quot;&#10;  jdbcURL: &quot;jdbc:postgresql://localhost:5432/ktor_tutorial_db&quot;&#10;  user: &quot;postgres&quot;&#10;  password: &quot;password&quot;"/>
                <p>這些設定稍後將在 <a href="#configure-docker">
                    <Path>compose.yml</Path>
                </a> 檔案中進行配置。
                </p>
            </step>
            <step>
                <p>
                    在
                    <Path>src/main/kotlin/com/example/plugins/</Path>
                    中開啟
                    <Path>Databases.kt</Path>
                    檔案，並更新 <code>configureDatabases()</code> 函式
                    以從配置檔載入儲存設定：
                </p>
                <code-block lang="kotlin" code="fun Application.configureDatabases(config: ApplicationConfig) {&#10;    val url = config.property(&quot;storage.jdbcURL&quot;).getString()&#10;    val user = config.property(&quot;storage.user&quot;).getString()&#10;    val password = config.property(&quot;storage.password&quot;).getString()&#10;&#10;    Database.connect(&#10;        url,&#10;        user = user,&#10;        password = password&#10;    )&#10;}"/>
                <p>
                    <code>configureDatabases()</code> 函式現在接受 <code>ApplicationConfig</code> 並
                    使用 <code>config.property</code> 載入自訂設定。
                </p>
            </step>
            <step>
                <p>
                    在
                    <Path>src/main/kotlin/com/example/</Path>
                    中開啟
                    <Path>Application.kt</Path>
                    檔案，並將 <code>environment.config</code> 傳遞給 <code>configureDatabases()</code>
                    以在應用程式啟動時載入連接設定：
                </p>
                <code-block lang="kotlin" code="fun Application.module() {&#10;    val repository = PostgresTaskRepository()&#10;&#10;    configureSerialization(repository)&#10;    configureDatabases(environment.config)&#10;    configureRouting()&#10;}"/>
            </step>
        </procedure>
    </chapter>
    <chapter title="配置 Ktor 插件" id="configure-ktor-plugin">
        <p>為了在 Docker 上執行，應用程式需要將所有必需的檔案部署到容器中。根據您使用的建置系統，
            有不同的插件可以完成此操作：</p>
        <list>
            <li><Links href="/ktor/server-fatjar" summary="了解如何使用 Ktor Gradle 插件建立和執行可執行 fat JAR。">使用 Ktor Gradle 插件建立 fat JAR</Links></li>
            <li><Links href="/ktor/maven-assembly-plugin" summary="範例專案：tutorial-server-get-started-maven">使用 Maven Assembly 插件建立 fat JAR</Links></li>
        </list>
        <p>在我們的範例中，Ktor 插件已在
            <Path>build.gradle.kts</Path>
            檔案中應用。
        </p>
        <code-block lang="kotlin" code="plugins {&#10;    application&#10;    kotlin(&quot;jvm&quot;)&#10;    id(&quot;io.ktor.plugin&quot;) version &quot;3.2.3&quot;&#10;    id(&quot;org.jetbrains.kotlin.plugin.serialization&quot;) version &quot;2.1.20&quot;&#10;}"/>
    </chapter>
</chapter>
<chapter title="配置 Docker" id="configure-docker">
    <chapter title="準備 Docker 映像" id="prepare-docker-image">
        <p>
            要將應用程式 Docker 化，請在專案的根目錄中建立一個新的
            <Path>Dockerfile</Path>
            並插入以下內容：
        </p>
        <code-block lang="Docker" code="# Stage 1: Cache Gradle dependencies&#10;FROM gradle:latest AS cache&#10;RUN mkdir -p /home/gradle/cache_home&#10;ENV GRADLE_USER_HOME=/home/gradle/cache_home&#10;COPY build.gradle.* gradle.properties /home/gradle/app/&#10;COPY gradle /home/gradle/app/gradle&#10;WORKDIR /home/gradle/app&#10;RUN gradle clean build -i --stacktrace&#10;&#10;# Stage 2: Build Application&#10;FROM gradle:latest AS build&#10;COPY --from=cache /home/gradle/cache_home /home/gradle/.gradle&#10;COPY --chown=gradle:gradle . /home/gradle/src&#10;WORKDIR /home/gradle/src&#10;# Build the fat JAR, Gradle also supports shadow&#10;# and boot JAR by default.&#10;RUN gradle buildFatJar --no-daemon&#10;&#10;# Stage 3: Create the Runtime Image&#10;FROM amazoncorretto:22 AS runtime&#10;EXPOSE 8080&#10;RUN mkdir /app&#10;COPY --from=build /home/gradle/src/build/libs/*.jar /app/ktor-docker-sample.jar&#10;ENTRYPOINT [&quot;java&quot;,&quot;-jar&quot;,&quot;/app/ktor-docker-sample.jar&quot;]"/>
        <tip>
            有關此多階段建置如何運作的更多資訊，請參閱 <a href="docker.md#prepare-docker">準備 Docker 映像</a>。
        </tip>
        <p>
         此範例使用 Amazon Corretto Docker 映像，但您可以將其替換為任何其他合適的替代方案，例如以下內容：
        </p>
        <list>
          <li><a href="https://hub.docker.com/_/eclipse-temurin">Eclipse Temurin</a></li>
          <li><a href="https://hub.docker.com/_/ibm-semeru-runtimes">IBM Semeru</a></li>
          <li><a href="https://hub.docker.com/_/ibmjava">IBM Java</a></li>
          <li><a href="https://hub.docker.com/_/sapmachine">SAP Machine JDK</a></li>
        </list>
    </chapter>
    <chapter title="配置 Docker Compose" id="configure-docker-compose">
        <p>在專案的根目錄中，建立一個新的
            <Path>compose.yml</Path>
            檔案並新增以下內容：
        </p>
        <code-block lang="yaml" code="services:&#10;  web:&#10;    build: .&#10;    ports:&#10;      - &quot;8080:8080&quot;&#10;    depends_on:&#10;      db:&#10;        condition: service_healthy&#10;  db:&#10;    image: postgres&#10;    volumes:&#10;      - ./tmp/db:/var/lib/postgresql/data&#10;    environment:&#10;      POSTGRES_DB: ktor_tutorial_db&#10;      POSTGRES_HOST_AUTH_METHOD: trust&#10;    ports:&#10;      - &quot;5432:5432&quot;&#10;    healthcheck:&#10;      test: [ &quot;CMD-SHELL&quot;, &quot;pg_isready -U postgres&quot; ]&#10;      interval: 1s"/>
        <list>
            <li><code>web</code> 服務用於執行封裝在 <a href="#prepare-docker-image">映像</a>中的 Ktor 應用程式。
            </li>
            <li><code>db</code> 服務使用 <code>postgres</code> 映像來建立 <code>ktor_tutorial_db</code> 資料庫以儲存任務。
            </li>
        </list>
    </chapter>
</chapter>
<chapter title="建置並執行服務" id="build-run">
    <procedure>
        <step>
            <p>
                執行以下命令以建立包含您的 Ktor 應用程式的 <a href="#configure-ktor-plugin">fat JAR</a>：
            </p>
            <code-block lang="Bash" code="                    ./gradlew :tutorial-server-docker-compose:buildFatJar"/>
        </step>
        <step>
            <p>
                使用 <code>docker compose up</code> 命令建置映像並啟動容器：
            </p>
            <code-block lang="Bash" code="                    docker compose --project-directory snippets/tutorial-server-docker-compose up"/>
        </step>
        <step>
            等待 Docker Compose 完成映像的建置。
        </step>
        <step>
            <p>
                導航至 [http://localhost:8080/static/index.html](http://localhost:8080/static/index.html)
                以開啟網頁應用程式。您應該會看到「任務管理器客戶端」頁面，顯示三個用於篩選和新增任務的表單，以及一個任務表格。
            </p>
            <img src="tutorial_server_db_integration_manual_test.gif"
                 alt="一個顯示任務管理器客戶端的瀏覽器視窗"
                 border-effect="rounded"
                 width="706"/>
        </step>
    </procedure>
</chapter>
</topic>