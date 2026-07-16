[//]: # (title: Docker)

<show-structure for="chapter" depth="2"/>

<tldr>
<var name="example_name" value="deployment-ktor-plugin"/>
<p>
    <b>コード例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<web-summary>
KtorアプリケーションをDockerコンテナにデプロイする方法を学びます。作成したコンテナは、ローカル環境や任意のクラウドプロバイダーで実行できます。
</web-summary>

<link-summary>
アプリケーションをDockerコンテナにデプロイする方法を学びます。
</link-summary>

このセクションでは、[Ktor Gradleプラグイン](https://github.com/ktorio/ktor-build-plugins)を使用して、[Docker](https://www.docker.com)を利用したアプリケーションのパッケージ化、実行、デプロイを行う方法について説明します。

## Ktorプラグインのインストール {id="install-plugin"}

Ktorプラグインをインストールするには、`build.gradle.(kts)`ファイルの`plugins`ブロックに追加します。

<Tabs group="languages">
<TabItem title="Gradle (Kotlin)" group-key="kotlin">

```kotlin
plugins {
    id("io.ktor.plugin") version "%ktor_version%"
}
```

{interpolate-variables="true"}

</TabItem>
<TabItem title="Gradle (Groovy)" group-key="groovy">

```groovy
plugins {
    id "io.ktor.plugin" version "%ktor_version%"
}
```

{interpolate-variables="true"}

</TabItem>
</Tabs>

> Ktor GradleプラグインをKotlin Multiplatform Gradleプラグインと一緒に適用すると、Docker統合は自動的に無効になります。
> これらを併用できるようにするには、以下の手順を行ってください：
> 1. 上記のようにKtor Gradleプラグインを適用したJVM専用プロジェクトを作成します。
> 2. そのJVM専用プロジェクトに、Kotlin Multiplatformプロジェクトを依存関係として追加します。
>
> この回避策で問題が解決しない場合は、[KTOR-8464](https://youtrack.jetbrains.com/issue/KTOR-8464)にコメントを残してお知らせください。
>
{style="warning"}

## プラグインタスク {id="tasks"}

プラグインを[インストール](#install-plugin)すると、アプリケーションのパッケージ化、実行、デプロイのために以下のタスクが利用可能になります。

- `buildImage`: プロジェクトのDockerイメージをtarボールとしてビルドします。このタスクは、`build`ディレクトリに`jib-image.tar`ファイルを生成します。このイメージは、[docker load](https://docs.docker.com/engine/reference/commandline/load/)コマンドを使用してDockerデーモンにロードできます。
   ```Bash
   docker load < build/jib-image.tar
   ```
- `publishImageToLocalRegistry`: プロジェクトのDockerイメージをビルドし、ローカルレジストリに公開します。
- `runDocker`: プロジェクトのイメージをビルドしてDockerデーモンに送り、実行します。このタスクを実行するとKtorサーバーが起動し、デフォルトでは`http://0.0.0.0:8080`で応答します。サーバーが別のポートを使用するように構成されている場合は、[ポートマッピング](#port-mapping)を調整できます。
- `publishImage`: プロジェクトのDockerイメージをビルドし、[Docker Hub](https://hub.docker.com/)や[Google Container Registry](https://cloud.google.com/container-registry)などの外部レジストリに公開します。
  このタスクでは、**[ktor.docker.externalRegistry](#external-registry)**プロパティを使用して外部レジストリを構成する必要があることに注意してください。

デフォルトでは、これらのタスクは`ktor-docker-image`という名前と`latest`タグでイメージをビルドします。
これらの値は、[プラグイン構成](#name-tag)でカスタマイズできます。

## Ktorプラグインの構成 {id="configure-plugin"}

Dockerタスクに関連するKtorプラグインの設定を構成するには、`build.gradle.(kts)`ファイルで`ktor.docker`拡張を使用します。

```kotlin
ktor {
    docker {
        // ...
    }
}
```

### JREバージョン {id="jre-version"}

`jreVersion`プロパティは、イメージで使用するJREバージョンを指定します。

```kotlin
ktor {
    docker {
        jreVersion.set(JavaVersion.VERSION_17)
    }
}
```

### イメージ名とタグ {id="name-tag"}

イメージ名とタグをカスタマイズする必要がある場合は、それぞれ`localImageName`プロパティと`imageTag`プロパティを使用します。

```kotlin
ktor {
    docker {
        localImageName.set("sample-docker-image")
        imageTag.set("0.0.1-preview")
    }
}
```

### ポートマッピング {id="port-mapping"}

デフォルトでは、[runDocker](#tasks)タスクはコンテナの`8080`ポートをDockerホストの`8080`ポートに公開します。
必要に応じて、`portMappings`プロパティを使用してこれらのポートを変更できます。
これは、サーバーが別のポートを使用するように[構成](server-configuration-file.topic#predefined-properties)されている場合に役立ちます。

以下の例は、コンテナの`8080`ポートをDockerホストの`80`ポートにマッピングする方法を示しています。

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

この場合、`http://0.0.0.0:80`でサーバーにアクセスできます。

### 外部レジストリ {id="external-registry"}

**[publishImage](#tasks)**タスクを使用してプロジェクトのDockerイメージを外部レジストリに公開する前に、`ktor.docker.externalRegistry`プロパティを使用して外部レジストリを構成する必要があります。このプロパティは、必要なレジストリタイプの構成を提供する`DockerImageRegistry`インスタンスを受け取ります。

- `DockerImageRegistry.dockerHub`: [Docker Hub](https://hub.docker.com/)用の`DockerImageRegistry`を作成します。
- `DockerImageRegistry.googleContainerRegistry`: [Google Container Registry](https://cloud.google.com/container-registry)用の`DockerImageRegistry`を作成します。

以下の例は、Docker Hubレジストリを構成する方法を示しています。

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

Docker Hubのユーザー名とパスワードは環境変数から取得されるため、`publishImage`タスクを実行する前にこれらの値を設定する必要があることに注意してください。

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

## 手動でのイメージ構成 {id="manual"}

必要に応じて、独自の`Dockerfile`を用意してKtorアプリケーションを含むイメージを組み立てることもできます。

### アプリケーションのパッケージ化 {id="packagea-pp"}

最初のステップとして、アプリケーションを依存関係とともにパッケージ化する必要があります。
例えば、これは[Fat JAR](server-fatjar.md)や[実行可能なJVMアプリケーション](server-packaging.md)などです。

### Dockerイメージの準備 {id="prepare-docker"}

アプリケーションをDocker化するために、[マルチステージビルド](https://docs.docker.com/develop/develop-images/multistage-build/)を使用します。

1. まず、Gradle/Mavenの依存関係のキャッシュを設定します。このステップは任意ですが、ビルド全体の速度が向上するため推奨されます。
2. 次に、`gradle`/`maven`イメージを使用して、アプリケーションを含むFat JARを生成します。
3. 最後に、生成された配布物を、JDKイメージに基づいて作成された環境で実行します。

プロジェクトのルートフォルダーに、以下の内容で`Dockerfile`という名前のファイルを作成します。

<Tabs group="languages">
<TabItem title="Gradle" group-key="kotlin">

<code-block lang="Docker" code="# ステージ 1: Gradleの依存関係をキャッシュする&#10;FROM gradle:latest AS cache&#10;RUN mkdir -p /home/gradle/cache_home&#10;ENV GRADLE_USER_HOME=/home/gradle/cache_home&#10;COPY build.gradle.* gradle.properties /home/gradle/app/&#10;COPY gradle /home/gradle/app/gradle&#10;WORKDIR /home/gradle/app&#10;RUN gradle dependencies --no-daemon&#10;&#10;# ステージ 2: アプリケーションのビルド&#10;FROM gradle:latest AS build&#10;COPY --from=cache /home/gradle/cache_home /home/gradle/.gradle&#10;COPY --chown=gradle:gradle . /home/gradle/src&#10;WORKDIR /home/gradle/src&#10;# Fat JARをビルドします。Gradleはデフォルトでshadow&#10;# およびboot JARもサポートしています。&#10;RUN gradle buildFatJar --no-daemon&#10;&#10;# ステージ 3: 実行用イメージの作成&#10;FROM amazoncorretto:22 AS runtime&#10;EXPOSE 8080&#10;RUN mkdir /app&#10;COPY --from=build /home/gradle/src/build/libs/*.jar /app/ktor-docker-sample.jar&#10;ENTRYPOINT [&quot;java&quot;,&quot;-jar&quot;,&quot;/app/ktor-docker-sample.jar&quot;]"></code-block>

</TabItem>
<TabItem title="Maven" group-key="maven">

```Docker
# ステージ 1: Mavenの依存関係をキャッシュする
FROM maven:3.8-amazoncorretto-21 AS cache
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline

# ステージ 2: アプリケーションのビルド
FROM maven:3.8-amazoncorretto-21 AS build
WORKDIR /app
COPY --from=cache /root/.m2 /root/.m2
COPY . .
RUN mvn clean package

# ステージ 3: 実行用イメージの作成
FROM amazoncorretto:21-slim AS runtime
EXPOSE 8080
WORKDIR /app
COPY --from=build /app/target/*-with-dependencies.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
```

</TabItem>
</Tabs>

最初のステージでは、ビルド関連ファイルに変更があった場合にのみ依存関係が再ダウンロードされるようにします。最初のステージを使用しない場合、または他のステージで依存関係がキャッシュされない場合、ビルドのたびに依存関係がインストールされます。

第2ステージでは、Fat JARがビルドされます。なお、Gradleはデフォルトでshadowおよびboot JARもサポートしています。

ビルドの第3ステージは、以下のように動作します。

* 使用するイメージを指定します。
* 公開するポートを指定します（これは自動的にポートを公開するものではなく、コンテナの実行時に行われます）。
* ビルド出力の内容をフォルダーにコピーします。
* アプリケーションを実行します（`ENTRYPOINT`）。

<tip id="jdk_image_replacement_tip">
  <p>
   この例ではAmazon CorrettoのDockerイメージを使用していますが、以下のような他の適切な代替イメージに置き換えることもできます。
  </p>
  <list>
    <li><a href="https://hub.docker.com/_/eclipse-temurin">Eclipse Temurin</a></li>
    <li><a href="https://hub.docker.com/_/ibm-semeru-runtimes">IBM Semeru</a></li>
    <li><a href="https://hub.docker.com/_/ibmjava">IBM Java</a></li>
    <li><a href="https://hub.docker.com/_/sapmachine">SAP Machine JDK</a></li>
  </list>
</tip>

### Dockerイメージのビルドと実行 {id="build-run"}

次のステップは、Dockerイメージをビルドしてタグを付けることです。

```bash
docker build -t my-application .
```

最後に、イメージを起動します。

```bash
docker run -p 8080:8080 my-application
```

これによりKtorサーバーが起動し、`https://0.0.0.0:8080`で応答します。