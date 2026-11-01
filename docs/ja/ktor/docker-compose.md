<topic xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="https://resources.jetbrains.com/writerside/1.0/topic.v2.xsd"
       id="docker-compose" title="Docker Compose">
<show-structure for="chapter" depth="2"/>
<tldr>
    <p>
        <control>初期プロジェクト</control>
        : <a
            href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/tutorial-server-db-integration">tutorial-server-db-integration</a>
    </p>
    <p>
        <control>完成版プロジェクト</control>
        : <a
            href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/tutorial-server-docker-compose">tutorial-server-docker-compose</a>
    </p>
</tldr>
<p>このトピックでは、<a href="https://docs.docker.com/compose/">Docker Compose</a> 上でサーバーKtorアプリケーションを実行する方法を説明します。<Links href="server-integrate-database.md" summary="Exposed SQLライブラリを使用してKtorサービスをデータベースリポジトリに接続するプロセスについて説明します。">データベースの統合</Links>チュートリアルで作成したプロジェクトを使用します。このチュートリアルでは、データベースとWebアプリケーションが個別に実行され、<a href="https://github.com/JetBrains/Exposed">Exposed</a> を使用して <a href="https://www.postgresql.org/docs/">PostgreSQL</a> データベースに接続します。</p>
<chapter title="アプリケーションの準備" id="prepare-app">
    <chapter title="データベース設定の抽出" id="extract-db-settings">
        <p>
            <a href="server-integrate-database.md#config-db-connection">データベースの統合</a>チュートリアルで作成したプロジェクトでは、データベース接続を確立するためにハードコードされた属性を使用しています。</p>
        <p>
            PostgreSQLデータベースの接続設定を<Links href="server-configuration-file.topic" summary="設定ファイルでさまざまなサーバーパラメーターを設定する方法を説明します。">カスタム構成グループ</Links>に抽出しましょう。
        </p>
        <procedure>
            <step>
                <p>
                    <Path>src/main/resources</Path>
                    にある
                    <Path>application.yaml</Path>
                    ファイルを開き、次のように <code>ktor</code> グループの外側に <code>storage</code> グループを追加します:
                </p>
                <code-block lang="yaml" code="ktor:&#10;  application:&#10;    modules:&#10;      - com.example.ApplicationKt.module&#10;  deployment:&#10;    port: 8080&#10;storage:&#10;  driverClassName: &quot;org.postgresql.Driver&quot;&#10;  jdbcURL: &quot;jdbc:postgresql://localhost:5432/ktor_tutorial_db&quot;&#10;  user: &quot;postgres&quot;&#10;  password: &quot;password&quot;"/>
                <p>これらの設定は、後で <a href="#configure-docker">
                    <Path>compose.yml</Path>
                </a> ファイルで構成されます。
                </p>
            </step>
            <step>
                <p>
                    <Path>src/main/kotlin/com/example/plugins/</Path>
                    にある
                    <Path>Databases.kt</Path>
                    ファイルを開き、設定ファイルからストレージ設定を読み込むように <code>configureDatabases()</code> 関数を更新します:
                </p>
                <code-block lang="kotlin" code="fun Application.configureDatabases(config: ApplicationConfig) {&#10;    val url = config.property(&quot;storage.jdbcURL&quot;).getString()&#10;    val user = config.property(&quot;storage.user&quot;).getString()&#10;    val password = config.property(&quot;storage.password&quot;).getString()&#10;&#10;    Database.connect(&#10;        url,&#10;        user = user,&#10;        password = password&#10;    )&#10;}"/>
                <p>
                    <code>configureDatabases()</code> 関数が <code>ApplicationConfig</code> を受け取り、<code>config.property</code> を使用してカスタム設定を読み込むようになりました。
                </p>
            </step>
            <step>
                <p>
                    <Path>src/main/kotlin/com/example/</Path>
                    にある
                    <Path>Application.kt</Path>
                    ファイルを開き、アプリケーション起動時に接続設定を読み込むように <code>environment.config</code> を <code>configureDatabases()</code> に渡します:
                </p>
                <code-block lang="kotlin" code="fun Application.module() {&#10;    val repository = PostgresTaskRepository()&#10;&#10;    configureSerialization(repository)&#10;    configureDatabases(environment.config)&#10;    configureRouting()&#10;}"/>
            </step>
        </procedure>
    </chapter>
    <chapter title="Ktorプラグインの構成" id="configure-ktor-plugin">
        <p>Docker上で実行するには、アプリケーションに必要なすべてのファイルをコンテナにデプロイする必要があります。使用しているビルドシステムに応じて、これを実現するためのさまざまなプラグインがあります:</p>
        <list>
            <li><Links href="server-fatjar.md" summary="Ktor Gradleプラグインを使用して実行可能なfat JARを作成および実行する方法を説明します。">Ktor Gradleプラグインを使用したfat JARの作成</Links></li>
            <li><Links href="maven-assembly-plugin.md" summary="サンプルプロジェクト: tutorial-server-get-started-maven">Maven Assemblyプラグインを使用したfat JARの作成</Links></li>
        </list>
        <p>この例では、Ktorプラグインはすでに
            <Path>build.gradle.kts</Path>
            ファイルに適用されています。
        </p>
        <code-block lang="kotlin" code="plugins {&#10;    application&#10;    alias(libs.plugins.kotlin.jvm)&#10;    alias(ktorLibs.plugins.ktor)&#10;    alias(libs.plugins.kotlin.serialization)&#10;}"/>
    </chapter>
</chapter>
    <chapter title="Dockerの構成" id="configure-docker">
        <chapter title="Dockerイメージの準備" id="prepare-docker-image">
            <p>
                アプリケーションをDocker化するには、プロジェクトのルートディレクトリに新しい
                <Path>Dockerfile</Path>
                を作成し、次のコンテンツを挿入します:
            </p>
            <code-block lang="Docker" code="# Stage 1: Cache Gradle dependencies&#10;FROM gradle:latest AS cache&#10;RUN mkdir -p /home/gradle/cache_home&#10;ENV GRADLE_USER_HOME=/home/gradle/cache_home&#10;COPY build.gradle.* gradle.properties /home/gradle/app/&#10;COPY gradle /home/gradle/app/gradle&#10;WORKDIR /home/gradle/app&#10;RUN gradle dependencies --no-daemon&#10;&#10;# Stage 2: Build Application&#10;FROM gradle:latest AS build&#10;COPY --from=cache /home/gradle/cache_home /home/gradle/.gradle&#10;COPY --chown=gradle:gradle . /home/gradle/src&#10;WORKDIR /home/gradle/src&#10;# Build the fat JAR, Gradle also supports shadow&#10;# and boot JAR by default.&#10;RUN gradle buildFatJar --no-daemon&#10;&#10;# Stage 3: Create the Runtime Image&#10;FROM amazoncorretto:22 AS runtime&#10;EXPOSE 8080&#10;RUN mkdir /app&#10;COPY --from=build /home/gradle/src/build/libs/*.jar /app/ktor-docker-sample.jar&#10;ENTRYPOINT [&quot;java&quot;,&quot;-jar&quot;,&quot;/app/ktor-docker-sample.jar&quot;]"/>
            <tip>
                このマルチステージビルドの仕組みの詳細については、<a href="docker.md#prepare-docker">Dockerイメージの準備</a>を参照してください。
            </tip>
            <tip id="jdk_image_replacement_tip">
              <p>
               この例ではAmazon Corretto Dockerイメージを使用していますが、以下のような他の適切な代替手段に置き換えることもできます:
              </p>
              <list>
                <li><a href="https://hub.docker.com/_/eclipse-temurin">Eclipse Temurin</a></li>
                <li><a href="https://hub.docker.com/_/ibm-semeru-runtimes">IBM Semeru</a></li>
                <li><a href="https://hub.docker.com/_/ibmjava">IBM Java</a></li>
                <li><a href="https://hub.docker.com/_/sapmachine">SAP Machine JDK</a></li>
              </list>
            </tip>
        </chapter>
        <chapter title="Docker Composeの構成" id="configure-docker-compose">
            <p>プロジェクトのルートディレクトリに新しい
                <Path>compose.yml</Path>
                ファイルを作成し、次のコンテンツを追加します:
            </p>
            <code-block lang="yaml" code="services:&#10;  web:&#10;    build: .&#10;    ports:&#10;      - &quot;8080:8080&quot;&#10;    depends_on:&#10;      db:&#10;        condition: service_healthy&#10;  db:&#10;    image: postgres&#10;    volumes:&#10;      - ./tmp/db:/var/lib/postgresql/data&#10;    environment:&#10;      POSTGRES_DB: ktor_tutorial_db&#10;      POSTGRES_HOST_AUTH_METHOD: trust&#10;    ports:&#10;      - &quot;5432:5432&quot;&#10;    healthcheck:&#10;      test: [ &quot;CMD-SHELL&quot;, &quot;pg_isready -U postgres&quot; ]&#10;      interval: 1s"/>
            <list>
                <li><code>web</code> サービスは、<a href="#prepare-docker-image">イメージ</a> 内にパッケージ化されたKtorアプリケーションを実行するために使用されます。
                </li>
                <li><code>db</code> サービスは、<code>postgres</code> イメージを使用して、タスクを保存するための
                    <code>ktor_tutorial_db</code> データベースを作成します。
                </li>
            </list>
        </chapter>
    </chapter>
    <chapter title="サービスのビルドと実行" id="build-run">
        <procedure>
            <step>
                <p>
                    次のコマンドを実行して、Ktorアプリケーションを含む <a href="#configure-ktor-plugin">fat JAR</a>
                    を作成します:
                </p>
                <code-block lang="Bash" code="                    ./gradlew :tutorial-server-docker-compose:buildFatJar"/>
            </step>
            <step>
                <p>
                    <code>docker compose up</code> コマンドを使用して、イメージをビルドし、コンテナを起動します:
                </p>
                <code-block lang="Bash" code="                    docker compose --project-directory snippets/tutorial-server-docker-compose up"/>
            </step>
            <step>
                Docker Composeによるイメージのビルドが完了するまで待ちます。
            </step>
            <step>
                <p>
                    <a href="http://localhost:8080/static/index.html">http://localhost:8080/static/index.html</a>
                    にアクセスして、Webアプリケーションを開きます。新しいタスクのフィルタリングと追加のための3つのフォーム、およびタスクのテーブルが表示されたTask Manager Clientページが表示されるはずです。
                </p>
                <img src="tutorial_server_db_integration_manual_test.gif"
                     alt="A browser window showing the Task Manager Client"
                     border-effect="rounded"
                     width="706"/>
            </step>
        </procedure>
    </chapter>
</topic>