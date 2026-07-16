<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       id="docker-compose" title="Docker Compose">
<show-structure for="chapter" depth="2"/>
<tldr>
        <p>
            <control>初期プロジェクト</control>
            : <a
                href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/tutorial-server-db-integration">tutorial-server-db-integration</a>
        </p>
        <p>
            <control>最終プロジェクト</control>
            : <a
                href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/tutorial-server-docker-compose">tutorial-server-docker-compose</a>
        </p>
</tldr>
<p>このトピックでは、サーバーKtorアプリケーションを<a href="https://docs.docker.com/compose/">Docker Compose</a>で実行する方法を説明します。<Links href="/ktor/server-integrate-database" summary="Learn the process of connecting Ktor services to database repositories with the Exposed SQL Library.">データベースを統合する</Links>チュートリアルで作成したプロジェクトを使用します。このプロジェクトは、<a href="https://github.com/JetBrains/Exposed">Exposed</a>を使用して<a href="https://www.postgresql.org/docs/">PostgreSQL</a>データベースに接続し、データベースとWebアプリケーションが別々に実行されるようにします。</p>
<chapter title="アプリケーションを準備する" id="prepare-app">
        <chapter title="データベース設定の抽出" id="extract-db-settings">
            <p>
                <a href="server-integrate-database.topic#config-db-connection">データベース接続を設定する</a>チュートリアルで作成されたプロジェクトは、データベース接続を確立するためにハードコードされた属性を使用しています。</p>
            <p>
                PostgreSQLデータベースの接続設定を<Links href="/ktor/server-configuration-file" summary="Learn how to configure various server parameters in a configuration file.">カスタム構成グループ</Links>に抽出しましょう。
            </p>
            <procedure>
                <step>
                    <p>
                        <Path>src/main/resources</Path>の<Path>application.yaml</Path>ファイルを開き、<code>ktor</code>グループの外に<code>storage</code>グループを次のように追加します。
                    </p>
                    <code-block lang="yaml" code="ktor:&#10;  application:&#10;    modules:&#10;      - com.example.ApplicationKt.module&#10;  deployment:&#10;    port: 8080&#10;storage:&#10;  driverClassName: &quot;org.postgresql.Driver&quot;&#10;  jdbcURL: &quot;jdbc:postgresql://localhost:5432/ktor_tutorial_db&quot;&#10;  user: &quot;postgres&quot;&#10;  password: &quot;password&quot;"/>
                    <p>これらの設定は後で<a href="#configure-docker">
                        <Path>compose.yml</Path>
                    </a>ファイルで構成されます。
                    </p>
                </step>
                <step>
                    <p>
                        <Path>src/main/kotlin/com/example/plugins/</Path>の<Path>Databases.kt</Path>ファイルを開き、構成ファイルからストレージ設定をロードするように<code>configureDatabases()</code>関数を更新します。
                    </p>
                    <code-block lang="kotlin" code="fun Application.configureDatabases(config: ApplicationConfig) {&#10;    val url = config.property(&quot;storage.jdbcURL&quot;).getString()&#10;    val user = config.property(&quot;storage.user&quot;).getString()&#10;    val password = config.property(&quot;storage.password&quot;).getString()&#10;&#10;    Database.connect(&#10;        url,&#10;        user = user,&#10;        password = password&#10;    )&#10;}"/>
                    <p>
                        <code>configureDatabases()</code>関数は、<code>ApplicationConfig</code>を受け入れ、<code>config.property</code>を使用してカスタム設定をロードするようになりました。
                    </p>
                </step>
                <step>
                    <p>
                        <Path>src/main/kotlin/com/example/</Path>の<Path>Application.kt</Path>ファイルを開き、アプリケーション起動時に接続設定をロードするために<code>environment.config</code>を<code>configureDatabases()</code>に渡します。
                    </p>
                    <code-block lang="kotlin" code="fun Application.module() {&#10;    val repository = PostgresTaskRepository()&#10;&#10;    configureSerialization(repository)&#10;    configureDatabases(environment.config)&#10;    configureRouting()&#10;}"/>
                </step>
            </procedure>
        </chapter>
        <chapter title="Ktorプラグインの構成" id="configure-ktor-plugin">
            <p>Dockerで実行するには、アプリケーションに必要なすべてのファイルをコンテナにデプロイする必要があります。使用しているビルドシステムに応じて、これを実現するための異なるプラグインがあります。</p>
            <list>
                <li><Links href="/ktor/server-fatjar" summary="Learn how to create and run an executable fat JAR using the Ktor Gradle plugin.">Ktor Gradleプラグインを使用したfat JARの作成</Links></li>
                <li><Links href="/ktor/maven-assembly-plugin" summary="Sample project: tutorial-server-get-started-maven">Maven Assemblyプラグインを使用したfat JARの作成</Links></li>
            </list>
            <p>この例では、Ktorプラグインは<Path>build.gradle.kts</Path>ファイルにすでに適用されています。</p>
            <code-block lang="kotlin" code="plugins {&#10;    application&#10;    kotlin(&quot;jvm&quot;)&#10;    id(&quot;io.ktor.plugin&quot;) version &quot;3.2.3&quot;&#10;    id(&quot;org.jetbrains.kotlin.plugin.serialization&quot;) version &quot;2.1.20&quot;&#10;}"/>
        </chapter>
</chapter>
<chapter title="Dockerの構成" id="configure-docker">
        <chapter title="Dockerイメージの準備" id="prepare-docker-image">
            <p>
                アプリケーションをDocker化するには、プロジェクトのルートディレクトリに新しい<Path>Dockerfile</Path>を作成し、次のコンテンツを挿入します。
            </p>
            <code-block lang="Docker" code="# Stage 1: Cache Gradle dependencies&#10;FROM gradle:latest AS cache&#10;RUN mkdir -p /home/gradle/cache_home&#10;ENV GRADLE_USER_HOME=/home/gradle/cache_home&#10;COPY build.gradle.* gradle.properties /home/gradle/app/&#10;COPY gradle /home/gradle/app/gradle&#10;WORKDIR /home/gradle/app&#10;RUN gradle clean build -i --stacktrace&#10;&#10;# Stage 2: Build Application&#10;FROM gradle:latest AS build&#10;COPY --from=cache /home/gradle/cache_home /home/gradle/.gradle&#10;COPY --chown=gradle:gradle . /home/gradle/src&#10;WORKDIR /home/gradle/src&#10;# Build the fat JAR, Gradle also supports shadow&#10;# and boot JAR by default.&#10;RUN gradle buildFatJar --no-daemon&#10;&#10;# Stage 3: Create the Runtime Image&#10;FROM amazoncorretto:22 AS runtime&#10;EXPOSE 8080&#10;RUN mkdir /app&#10;COPY --from=build /home/gradle/src/build/libs/*.jar /app/ktor-docker-sample.jar&#10;ENTRYPOINT [&quot;java&quot;,&quot;-jar&quot;,&quot;/app/ktor-docker-sample.jar&quot;]"/>
            <tip>
                このマルチステージビルドの仕組みの詳細については、<a href="docker.md#prepare-docker">Dockerイメージを準備する</a>を参照してください。
            </tip>
            <p>
             この例ではAmazon Corretto Dockerイメージを使用していますが、以下のようないくつかの適切な代替品と置き換えることができます。
            </p>
            <list>
              <li><a href="https://hub.docker.com/_/eclipse-temurin">Eclipse Temurin</a></li>
              <li><a href="https://hub.docker.com/_/ibm-semeru-runtimes">IBM Semeru</a></li>
              <li><a href="https://hub.docker.com/_/ibmjava">IBM Java</a></li>
              <li><a href="https://hub.docker.com/_/sapmachine">SAP Machine JDK</a></li>
            </list>
        </chapter>
        <chapter title="Docker Composeの構成" id="configure-docker-compose">
            <p>プロジェクトのルートディレクトリに新しい<Path>compose.yml</Path>ファイルを作成し、次のコンテンツを追加します。</p>
            <code-block lang="yaml" code="services:&#10;  web:&#10;    build: .&#10;    ports:&#10;      - &quot;8080:8080&quot;&#10;    depends_on:&#10;      db:&#10;        condition: service_healthy&#10;  db:&#10;    image: postgres&#10;    volumes:&#10;      - ./tmp/db:/var/lib/postgresql/data&#10;    environment:&#10;      POSTGRES_DB: ktor_tutorial_db&#10;      POSTGRES_HOST_AUTH_METHOD: trust&#10;    ports:&#10;      - &quot;5432:5432&quot;&#10;    healthcheck:&#10;      test: [ &quot;CMD-SHELL&quot;, &quot;pg_isready -U postgres&quot; ]&#10;      interval: 1s"/>
            <list>
                <li><code>web</code>サービスは、<a href="#prepare-docker-image">イメージ</a>内にパッケージされたKtorアプリケーションを実行するために使用されます。
                </li>
                <li><code>db</code>サービスは、<code>postgres</code>イメージを使用して、タスクを保存するための<code>ktor_tutorial_db</code>データベースを作成します。
                </li>
            </list>
        </chapter>
</chapter>
<chapter title="サービスのビルドと実行" id="build-run">
        <procedure>
            <step>
                <p>
                    Ktorアプリケーションを含む<a href="#configure-ktor-plugin">fat JAR</a>を作成するために、次のコマンドを実行します。
                </p>
                <code-block lang="Bash" code="                    ./gradlew :tutorial-server-docker-compose:buildFatJar"/>
            </step>
            <step>
                <p>
                    イメージをビルドしてコンテナを起動するために、<code>docker compose up</code>コマンドを使用します。
                </p>
                <code-block lang="Bash" code="                    docker compose --project-directory snippets/tutorial-server-docker-compose up"/>
            </step>
            <step>
                Docker Composeがイメージのビルドを完了するまで待ちます。
            </step>
            <step>
                <p>
                    ウェブアプリケーションを開くには、[http://localhost:8080/static/index.html](http://localhost:8080/static/index.html)に移動します。タスクマネージャークライアントページが表示され、タスクのフィルタリングと新規追加のための3つのフォームと、タスクのテーブルが表示されるはずです。
                </p>
                <img src="tutorial_server_db_integration_manual_test.gif"
                     alt="タスクマネージャークライアントを表示しているブラウザウィンドウ"
                     border-effect="rounded"
                     width="706"/>
            </step>
        </procedure>
</chapter>
</topic>