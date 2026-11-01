[//]: # (title: Docker)

<show-structure for="chapter" depth="2"/>

<tldr>
<var name="example_name" value="deployment-ktor-plugin"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<web-summary>
Ktor アプリケーションを Docker コンテナにデプロイし、ローカルまたは任意のクラウドプロバイダーで実行する方法を学びます。
</web-summary>

<link-summary>
アプリケーションを Docker コンテナにデプロイする方法を学びます。
</link-summary>

このセクションでは、[Ktor Gradle プラグイン](https://github.com/ktorio/ktor-build-plugins)を使用して、[Docker](https://www.docker.com) でアプリケーションをパッケージ化、実行、デプロイする方法について説明します。

## Ktor プラグインのインストール {id="install-plugin"}

<Tabs group="languages">
<TabItem title="Gradle (Kotlin)" group-key="kotlin">

```kotlin
plugins {
    alias(ktorLibs.plugins.ktor)
}
```

</TabItem>
<TabItem title="Gradle (Groovy)" group-key="groovy">

```groovy
plugins {
    alias(ktorLibs.plugins.ktor)
}
```

</TabItem>
</Tabs>
<note>
    上記のスニペットでは、Ktor の依存関係を指定するために <a href="server-dependencies.topic#using-version-catalog">Ktor バージョンカタログ</a> を使用しています。
</note>

> Ktor Gradle プラグインを Kotlin Multiplatform Gradle プラグインと一緒に適用した場合、Docker 連携は自動的に無効化されます。
> これらを併用するには、以下の手順を実行してください。
> 1. 上記のように Ktor Gradle プラグインを適用した JVM 専用プロジェクトを作成します。
> 2. その JVM 専用プロジェクトに、Kotlin Multiplatform プロジェクトを依存関係として追加します。
>
> この回避策で問題が解決しない場合は、[KTOR-8464](https://youtrack.jetbrains.com/issue/KTOR-8464) にコメントを残してお知らせください。
>
{style="warning"}

## プラグインタスク {id="tasks"}

プラグインを[インストール](#install-plugin)すると、アプリケーションのパッケージ化、実行、デプロイを行うための以下のタスクが利用可能になります。

- `buildImage`: プロジェクトの Docker イメージを tarball にビルドします。このタスクは `build` ディレクトリに `jib-image.tar` ファイルを生成します。[docker load](https://docs.docker.com/engine/reference/commandline/load/) コマンドを使用して、このイメージを Docker デーモンに読み込むことができます。
   ```Bash
   docker load < build/jib-image.tar
   ```
- `publishImageToLocalRegistry`: プロジェクトの Docker イメージをビルドし、ローカルレジストリに公開します。
- `runDocker`: プロジェクトのイメージをビルドして Docker デーモンに読み込み、実行します。このタスクを実行すると Ktor サーバーが起動し、デフォルトでは `http://0.0.0.0:8080` で応答します。サーバーが別のポートを使用するように構成されている場合は、[ポートマッピング](#port-mapping)を調整できます。
- `publishImage`: プロジェクトの Docker イメージをビルドし、[Docker Hub](https://hub.docker.com/) や [Google Container Registry](https://cloud.google.com/container-registry) などの外部レジストリに公開します。このタスクを使用するには、**[ktor.docker.externalRegistry](#external-registry)** プロパティを使用して外部レジストリを設定する必要がある点に注意してください。

デフォルトでは、これらのタスクは `ktor-docker-image` という名前と `latest` タグでイメージをビルドします。[プラグイン設定](#name-tag)でこれらの値をカスタマイズできます。

## Ktor プラグインの設定 {id="configure-plugin"}

Docker タスクに関連する Ktor プラグインの設定を行うには、`build.gradle.(kts)` ファイルで `ktor.docker` エクステンションを使用します。

```kotlin
ktor {
    docker {
        // ...
    }
}
```

### JRE バージョン {id="jre-version"}

`jreVersion` プロパティは、イメージ内で使用する JRE バージョンを指定します。

```kotlin
ktor {
    docker {
        jreVersion.set(JavaVersion.VERSION_17)
    }
}
```

### イメージ名とタグ {id="name-tag"}

イメージ名とタグをカスタマイズする必要がある場合は、それぞれ `localImageName` プロパティと `imageTag` プロパティを使用します。

```kotlin
ktor {
    docker {
        localImageName.set("sample-docker-image")
        imageTag.set("0.0.1-preview")
    }
}
```

### ポートマッピング {id="port-mapping"}

デフォルトでは、[runDocker](#tasks) タスクはコンテナのポート `8080` を Docker ホストのポート `8080` に公開します。
必要に応じて、`portMappings` プロパティを使用してこれらのポートを変更できます。
これは、サーバーが別のポートを使用するように[設定](server-configuration-file.topic#predefined-properties)されている場合に役立ちます。

以下の例は、コンテナのポート `8080` を Docker ホストのポート `80` にマッピングする方法を示しています。

```kotlin
ktor {
    docker {
        portMappings.set(listOf(
            io.ktor.plugin.features.DockerPortMapping(
                80,
                8080,
                io.ktor.plugin.features.DockerPortMappingProtocol.TCP
            )
        ))
    }
}
```

この場合、`http://0.0.0.0:80` でサーバーにアクセスできます。

### 外部レジストリ {id="external-registry"}

**[publishImage](#tasks)** タスクを使用してプロジェクトの Docker イメージを外部レジストリに公開する前に、`ktor.docker.externalRegistry` プロパティを使用して外部レジストリを設定する必要があります。このプロパティは、必要なレジストリタイプの設定を提供する `DockerImageRegistry` インスタンスを受け取ります。

- `DockerImageRegistry.dockerHub`: [Docker Hub](https://hub.docker.com/) 用の `DockerImageRegistry` を作成します。
- `DockerImageRegistry.googleContainerRegistry`: [Google Container Registry](https://cloud.google.com/container-registry) 用の `DockerImageRegistry` を作成します。

以下の例は、Docker Hub レジストリを設定する方法を示しています。

```kotlin
ktor {
    docker {
        externalRegistry.set(
            io.ktor.plugin.features.DockerImageRegistry.dockerHub(
                appName = provider { "ktor-app" },
                username = providers.environmentVariable("DOCKER_HUB_USERNAME"),
                password = providers.environmentVariable("DOCKER_HUB_PASSWORD")
            )
        )
    }
}
```

Docker Hub のユーザー名とパスワードは環境変数から取得されるため、`publishImage` タスクを実行する前にこれらの値を設定する必要があることに注意してください。

<Tabs group="os">
<TabItem title="Linux/macOS" group-key="unix">

```Bash
export DOCKER_HUB_USERNAME=yourHubUsername
export DOCKER_HUB_PASSWORD=yourHubPassword
```

</TabItem>
<TabItem title="Windows" group-key="windows">

```Bash
setx DOCKER_HUB_USERNAME yourHubUsername
setx DOCKER_HUB_PASSWORD yourHubPassword
```

</TabItem>
</Tabs>

## 手動でのイメージ設定 {id="manual"}

必要に応じて、独自の `Dockerfile` を用意して Ktor アプリケーションを含むイメージを組み立てることもできます。

### アプリケーションのパッケージ化 {id="packagea-pp"}

最初のステップとして、アプリケーションを依存関係とともにパッケージ化する必要があります。
たとえば、[fat JAR](server-fatjar.md) や[実行可能 JVM アプリケーション](server-packaging.md)などがあります。

### Docker イメージの準備 {id="prepare-docker"}

アプリケーションを Docker 化するために、[マルチステージビルド (multi-stage builds)](https://docs.docker.com/develop/develop-images/multistage-build/) を使用します。

1. まず、Gradle/Maven の依存関係のキャッシングを設定します。このステップは任意ですが、ビルド全体の速度が向上するため推奨されます。
2. 次に、`gradle`/`maven` イメージを使用して、アプリケーションを含む fat JAR を生成します。
3. 最後に、生成された配布物を JDK イメージに基づいて作成された環境で実行します。

プロジェクトのルートフォルダーに、以下の内容で `Dockerfile` という名前のファイルを作成します。

<Tabs group="languages">
<TabItem title="Gradle" group-key="kotlin">

<code-block lang="Docker" code="# Stage 1: Cache Gradle dependencies&#10;FROM gradle:latest AS cache&#10;RUN mkdir -p /home/gradle/cache_home&#10;ENV GRADLE_USER_HOME=/home/gradle/cache_home&#10;COPY build.gradle.* gradle.properties /home/gradle/app/&#10;COPY gradle /home/gradle/app/gradle&#10;WORKDIR /home/gradle/app&#10;RUN gradle dependencies --no-daemon&#10;&#10;# Stage 2: Build Application&#10;FROM gradle:latest AS build&#10;COPY --from=cache /home/gradle/cache_home /home/gradle/.gradle&#10;COPY --chown=gradle:gradle . /home/gradle/src&#10;WORKDIR /home/gradle/src&#10;# Build the fat JAR, Gradle also supports shadow&#10;# and boot JAR by default.&#10;RUN gradle buildFatJar --no-daemon&#10;&#10;# Stage 3: Create the Runtime Image&#10;FROM amazoncorretto:22 AS runtime&#10;EXPOSE 8080&#10;RUN mkdir /app&#10;COPY --from=build /home/gradle/src/build/libs/*.jar /app/ktor-docker-sample.jar&#10;ENTRYPOINT [&quot;java&quot;,&quot;-jar&quot;,&quot;/app/ktor-docker-sample.jar&quot;]"/>

</TabItem>
<TabItem title="Maven" group-key="maven">

```Docker
# Stage 1: Cache Maven dependencies
FROM maven:3.8-amazoncorretto-21 AS cache
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline

# Stage 2: Build Application
FROM maven:3.8-amazoncorretto-21 AS build
WORKDIR /app
COPY --from=cache /root/.m2 /root/.m2
COPY . .
RUN mvn clean package

# Stage 3: Create the Runtime Image
FROM amazoncorretto:21-slim AS runtime
EXPOSE 8080
WORKDIR /app
COPY --from=build /app/target/*-with-dependencies.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
```

</TabItem>
</Tabs>

最初のステージにより、ビルド関連ファイルに変更があった場合にのみ依存関係が再ダウンロードされるようになります。最初のステージを使用しない場合、または他のステージで依存関係がキャッシュされない場合、ビルドごとに依存関係がインストールされます。

2 番目のステージでは、fat JAR がビルドされます。なお、Gradle はデフォルトで shadow JAR および boot JAR もサポートしています。

ビルドの 3 番目のステージは次のように動作します。

* 使用するイメージを指定します。
* 公開するポートを指定します（これによってポートが自動的に公開されるわけではなく、コンテナの実行時に公開されます）。
* ビルド出力の内容をフォルダーにコピーします。
* アプリケーションを実行します (`ENTRYPOINT`)。

<tip id="jdk_image_replacement_tip">
  <p>
   この例では Amazon Corretto の Docker イメージを使用していますが、以下のような他の適切な代替イメージに置き換えることもできます。
  </p>
  <list>
    <li><a href="https://hub.docker.com/_/eclipse-temurin">Eclipse Temurin</a></li>
    <li><a href="https://hub.docker.com/_/ibm-semeru-runtimes">IBM Semeru</a></li>
    <li><a href="https://hub.docker.com/_/ibmjava">IBM Java</a></li>
    <li><a href="https://hub.docker.com/_/sapmachine">SAP Machine JDK</a></li>
  </list>
</tip>

### Docker イメージのビルドと実行 {id="build-run"}

次のステップは、Docker イメージをビルドしてタグ付けすることです。

```bash
docker build -t my-application .
```

最後に、イメージを起動します。

```bash
docker run -p 8080:8080 my-application
```

これにより Ktor サーバーが起動し、`https://0.0.0.0:8080` で応答します。