```xml
<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       id="docker-compose" title="도커 컴포즈">
<show-structure for="chapter" depth="2"/>
<tldr>
    <p>
        <control>초기 프로젝트</control>
        : <a
            href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/tutorial-server-db-integration">tutorial-server-db-integration</a>
    </p>
    <p>
        <control>최종 프로젝트</control>
        : <a
            href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/tutorial-server-docker-compose">tutorial-server-docker-compose</a>
    </p>
</tldr>
<p>이 토픽에서는 Docker Compose를 사용하여 서버 Ktor 애플리케이션을 실행하는 방법을 보여줍니다. 데이터베이스와 웹 애플리케이션이 별도로 실행되는 <a href="https://www.postgresql.org/docs/">PostgreSQL</a> 데이터베이스에 연결하기 위해 <a href="https://github.com/JetBrains/Exposed">Exposed</a>를 사용하는 <Links href="/ktor/server-integrate-database" summary="Learn the process of connecting Ktor services to database repositories with the Exposed SQL Library.">데이터베이스 통합</Links> 튜토리얼에서 생성된 프로젝트를 사용합니다.</p>
<chapter title="애플리케이션 준비" id="prepare-app">
    <chapter title="데이터베이스 설정 추출" id="extract-db-settings">
        <p>
            <a href="server-integrate-database.topic#config-db-connection">데이터베이스 연결 구성</a> 튜토리얼에서 생성된 프로젝트는 하드코딩된 속성을 사용하여 데이터베이스 연결을 설정합니다.</p>
        <p>
            PostgreSQL 데이터베이스의 연결 설정을 <Links href="/ktor/server-configuration-file" summary="Learn how to configure various server parameters in a configuration file.">사용자 지정 설정 그룹</Links>으로 추출해 보겠습니다.
        </p>
        <procedure>
            <step>
                <p>
                    <Path>src/main/resources</Path> 폴더의 <Path>application.yaml</Path> 파일을 열고 <code>ktor</code> 그룹 바깥에 다음과 같이 <code>storage</code> 그룹을 추가합니다.
                </p>
                <code-block lang="yaml" code="ktor:&#10;  application:&#10;    modules:&#10;      - com.example.ApplicationKt.module&#10;  deployment:&#10;    port: 8080&#10;storage:&#10;  driverClassName: &quot;org.postgresql.Driver&quot;&#10;  jdbcURL: &quot;jdbc:postgresql://localhost:5432/ktor_tutorial_db&quot;&#10;  user: &quot;postgres&quot;&#10;  password: &quot;password&quot;"/>
                <p>이 설정은 나중에 <a href="#configure-docker">
                    <Path>compose.yml</Path>
                </a> 파일에서 구성됩니다.
                </p>
            </step>
            <step>
                <p>
                    <Path>src/main/kotlin/com/example/plugins/</Path> 폴더의 <Path>Databases.kt</Path> 파일을 열고 <code>configureDatabases()</code> 함수를 업데이트하여 설정 파일에서 스토리지 설정을 로드하도록 합니다.
                </p>
                <code-block lang="kotlin" code="fun Application.configureDatabases(config: ApplicationConfig) {&#10;    val url = config.property(&quot;storage.jdbcURL&quot;).getString()&#10;    val user = config.property(&quot;storage.user&quot;).getString()&#10;    val password = config.property(&quot;storage.password&quot;).getString()&#10;&#10;    Database.connect(&#10;        url,&#10;        user = user,&#10;        password = password&#10;    )&#10;}"/>
                <p>
                    <code>configureDatabases()</code> 함수는 이제 <code>ApplicationConfig</code>를 받아들이고 <code>config.property</code>를 사용하여 사용자 지정 설정을 로드합니다.
                </p>
            </step>
            <step>
                <p>
                    <Path>src/main/kotlin/com/example/</Path> 폴더의 <Path>Application.kt</Path> 파일을 열고 애플리케이션 시작 시 연결 설정을 로드하도록 <code>environment.config</code>를 <code>configureDatabases()</code>에 전달합니다.
                </p>
                <code-block lang="kotlin" code="fun Application.module() {&#10;    val repository = PostgresTaskRepository()&#10;&#10;    configureSerialization(repository)&#10;    configureDatabases(environment.config)&#10;    configureRouting()&#10;}"/>
            </step>
        </procedure>
    </chapter>
    <chapter title="Ktor 플러그인 구성" id="configure-ktor-plugin">
        <p>Docker에서 실행하려면 애플리케이션에 필요한 모든 파일이 컨테이너에 배포되어야 합니다. 사용하는 빌드 시스템에 따라 이를 달성하기 위한 다양한 플러그인이 있습니다.</p>
        <list>
            <li><Links href="/ktor/server-fatjar" summary="Learn how to create and run an executable fat JAR using the Ktor Gradle plugin.">Ktor Gradle 플러그인을 사용하여 Fat JAR 생성</Links></li>
            <li><Links href="/ktor/maven-assembly-plugin" summary="Sample project: tutorial-server-get-started-maven">Maven Assembly 플러그인을 사용하여 Fat JAR 생성</Links></li>
        </list>
        <p>이 예제에서는 <Path>build.gradle.kts</Path> 파일에 이미 Ktor 플러그인이 적용되어 있습니다.</p>
        <code-block lang="kotlin" code="plugins {&#10;    application&#10;    kotlin(&quot;jvm&quot;)&#10;    id(&quot;io.ktor.plugin&quot;) version &quot;3.2.3&quot;&#10;    id(&quot;org.jetbrains.kotlin.plugin.serialization&quot;) version &quot;2.1.20&quot;&#10;}"/>
    </chapter>
</chapter>
<chapter title="Docker 구성" id="configure-docker">
    <chapter title="Docker 이미지 준비" id="prepare-docker-image">
        <p>
            애플리케이션을 도커라이징하려면 프로젝트의 루트 디렉터리에 새 <Path>Dockerfile</Path>을 생성하고 다음 내용을 삽입합니다.
        </p>
        <code-block lang="Docker" code="# Stage 1: Cache Gradle dependencies&#10;FROM gradle:latest AS cache&#10;RUN mkdir -p /home/gradle/cache_home&#10;ENV GRADLE_USER_HOME=/home/gradle/cache_home&#10;COPY build.gradle.* gradle.properties /home/gradle/app/&#10;COPY gradle /home/gradle/app/gradle&#10;WORKDIR /home/gradle/app&#10;RUN gradle clean build -i --stacktrace&#10;&#10;# Stage 2: Build Application&#10;FROM gradle:latest AS build&#10;COPY --from=cache /home/gradle/cache_home /home/gradle/.gradle&#10;COPY --chown=gradle:gradle . /home/gradle/src&#10;WORKDIR /home/gradle/src&#10;# Build the fat JAR, Gradle also supports shadow&#10;# and boot JAR by default.&#10;RUN gradle buildFatJar --no-daemon&#10;&#10;# Stage 3: Create the Runtime Image&#10;FROM amazoncorretto:22 AS runtime&#10;EXPOSE 8080&#10;RUN mkdir /app&#10;COPY --from=build /home/gradle/src/build/libs/*.jar /app/ktor-docker-sample.jar&#10;ENTRYPOINT [&quot;java&quot;,&quot;-jar&quot;,&quot;/app/ktor-docker-sample.jar&quot;]"/>
        <tip>
            이 멀티 스테이지 빌드가 작동하는 방식에 대한 자세한 내용은 <a href="docker.md#prepare-docker">Docker 이미지 준비</a>를 참조하십시오.
        </tip>
        <p>
         이 예제는 Amazon Corretto Docker 이미지를 사용하지만, 다음을 포함한 다른 적합한 대안으로 대체할 수 있습니다.
        </p>
        <list>
          <li><a href="https://hub.docker.com/_/eclipse-temurin">Eclipse Temurin</a></li>
          <li><a href="https://hub.docker.com/_/ibm-semeru-runtimes">IBM Semeru</a></li>
          <li><a href="https://hub.docker.com/_/ibm-semeru-runtimes">IBM Java</a></li>
          <li><a href="https://hub.docker.com/_/sapmachine">SAP Machine JDK</a></li>
        </list>
    </chapter>
    <chapter title="Docker Compose 구성" id="configure-docker-compose">
        <p>프로젝트의 루트 디렉터리에 새 <Path>compose.yml</Path> 파일을 생성하고 다음 내용을 추가합니다.</p>
        <code-block lang="yaml" code="services:&#10;  web:&#10;    build: .&#10;    ports:&#10;      - &quot;8080:8080&quot;&#10;    depends_on:&#10;      db:&#10;        condition: service_healthy&#10;  db:&#10;    image: postgres&#10;    volumes:&#10;      - ./tmp/db:/var/lib/postgresql/data&#10;    environment:&#10;      POSTGRES_DB: ktor_tutorial_db&#10;      POSTGRES_HOST_AUTH_METHOD: trust&#10;    ports:&#10;      - &quot;5432:5432&quot;&#10;    healthcheck:&#10;      test: [ &quot;CMD-SHELL&quot;, &quot;pg_isready -U postgres&quot; ]&#10;      interval: 1s"/>
        <list>
            <li><code>web</code> 서비스는 <a href="#prepare-docker-image">이미지</a> 안에 패키징된 Ktor 애플리케이션을 실행하는 데 사용됩니다.
            </li>
            <li><code>db</code> 서비스는 <code>postgres</code> 이미지를 사용하여 작업을 저장하기 위한 <code>ktor_tutorial_db</code> 데이터베이스를 생성합니다.
            </li>
        </list>
    </chapter>
</chapter>
<chapter title="서비스 빌드 및 실행" id="build-run">
    <procedure>
        <step>
            <p>
                Ktor 애플리케이션을 포함하는 Fat JAR를 생성하려면 다음 명령을 실행하십시오.
            </p>
            <code-block lang="Bash" code="                    ./gradlew :tutorial-server-docker-compose:buildFatJar"/>
        </step>
        <step>
            <p>
                <code>docker compose up</code> 명령을 사용하여 이미지를 빌드하고 컨테이너를 시작합니다.
            </p>
            <code-block lang="Bash" code="                    docker compose --project-directory snippets/tutorial-server-docker-compose up"/>
        </step>
        <step>
            Docker Compose가 이미지 빌드를 마칠 때까지 기다립니다.
        </step>
        <step>
            <p>
                웹 애플리케이션을 열려면 [http://localhost:8080/static/index.html](http://localhost:8080/static/index.html)로 이동합니다. 작업 필터링 및 새 작업 추가를 위한 세 가지 양식과 작업 테이블을 표시하는 작업 관리 클라이언트(Task Manager Client) 페이지가 나타납니다.
            </p>
            <img src="tutorial_server_db_integration_manual_test.gif"
                 alt="A browser window showing the Task Manager Client"
                 border-effect="rounded"
                 width="706"/>
        </step>
    </procedure>
</chapter>
</topic>