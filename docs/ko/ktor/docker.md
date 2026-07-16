[//]: # (title: Docker)

<show-structure for="chapter" depth="2"/>

<tldr>
<var name="example_name" value="deployment-ktor-plugin"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<web-summary>
Ktor 애플리케이션을 Docker 컨테이너에 배포하는 방법을 알아봅니다. 이 컨테이너는 로컬이나 원하는 클라우드 제공업체에서 실행할 수 있습니다.
</web-summary>

<link-summary>
애플리케이션을 Docker 컨테이너에 배포하는 방법을 알아봅니다.
</link-summary>

이 섹션에서는 [Docker](https://www.docker.com)를 사용하여 애플리케이션을 패키징, 실행 및 배포하기 위해 [Ktor Gradle 플러그인](https://github.com/ktorio/ktor-build-plugins)을 사용하는 방법을 살펴보겠습니다.

## Ktor 플러그인 설치 {id="install-plugin"}

Ktor 플러그인을 설치하려면, `build.gradle.(kts)` 파일의 `plugins` 블록에 추가하세요:

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

> Ktor Gradle 플러그인을 Kotlin Multiplatform Gradle 플러그인과 함께 적용하면 Docker 통합이 자동으로 비활성화됩니다.
> 이들을 함께 사용하려면 다음과 같이 하세요:
> 1. 위에서 보여준 대로 Ktor Gradle 플러그인이 적용된 JVM 전용 프로젝트를 생성합니다.
> 2. 해당 JVM 전용 프로젝트에 Kotlin Multiplatform 프로젝트를 의존성으로 추가합니다.
>
> 이 해결 방법으로 문제가 해결되지 않는 경우, [KTOR-8464](https://youtrack.jetbrains.com/issue/KTOR-8464)에 의견을 남겨 알려주세요.
>
{style="warning"}

## 플러그인 태스크 {id="tasks"}

플러그인을 [설치](#install-plugin)한 후, 애플리케이션 패키징, 실행 및 배포를 위해 다음 태스크들을 사용할 수 있습니다:

- `buildImage`: 프로젝트의 Docker 이미지를 타르볼(tarball)로 빌드합니다. 이 태스크는 `build` 디렉터리에 `jib-image.tar` 파일을 생성합니다. [docker load](https://docs.docker.com/engine/reference/commandline/load/) 명령어를 사용하여 이 이미지를 Docker 데몬에 로드할 수 있습니다:
   ```Bash
   docker load < build/jib-image.tar
   ```
- `publishImageToLocalRegistry`: 프로젝트의 Docker 이미지를 빌드하고 로컬 레지스트리에 게시합니다.
- `runDocker`: 프로젝트의 이미지를 Docker 데몬으로 빌드하고 실행합니다. 이 태스크를 실행하면 Ktor 서버가 시작되며, 기본적으로 `http://0.0.0.0:8080`에서 응답합니다. 서버가 다른 포트를 사용하도록 구성된 경우 [포트 매핑](#port-mapping)을 조정할 수 있습니다.
- `publishImage`: 프로젝트의 Docker 이미지를 빌드하고 [Docker Hub](https://hub.docker.com/) 또는 [Google Container Registry](https://cloud.google.com/container-registry)와 같은 외부 레지스트리에 게시합니다. 이 태스크를 위해서는 **[ktor.docker.externalRegistry](#external-registry)** 속성을 사용하여 외부 레지스트리를 구성해야 합니다.

기본적으로 이러한 태스크들은 `ktor-docker-image`라는 이름과 `latest` 태그로 이미지를 빌드합니다.
[플러그인 구성](#name-tag)에서 이 값들을 사용자 정의할 수 있습니다.

## Ktor 플러그인 구성 {id="configure-plugin"}

Docker 태스크와 관련된 Ktor 플러그인 설정을 구성하려면 `build.gradle.(kts)` 파일에서 `ktor.docker` 확장(extension)을 사용하세요:

```kotlin
ktor {
    docker {
        // ...
    }
}
```

### JRE 버전 {id="jre-version"}

`jreVersion` 속성은 이미지에서 사용할 JRE 버전을 지정합니다:

```kotlin
ktor {
    docker {
        jreVersion.set(JavaVersion.VERSION_17)
    }
}
```

### 이미지 이름 및 태그 {id="name-tag"}

이미지 이름과 태그를 사용자 정의해야 하는 경우 각각 `localImageName`과 `imageTag` 속성을 사용합니다:

```kotlin
ktor {
    docker {
        localImageName.set("sample-docker-image")
        imageTag.set("0.0.1-preview")
    }
}
```

### 포트 매핑 {id="port-mapping"}

기본적으로 [runDocker](#tasks) 태스크는 `8080` 컨테이너 포트를 `8080` Docker 호스트 포트로 게시합니다.
필요한 경우 `portMappings` 속성을 사용하여 이 포트들을 변경할 수 있습니다.
이는 서버가 다른 포트를 사용하도록 [구성](server-configuration-file.topic#predefined-properties)된 경우 유용할 수 있습니다.

아래 예제는 `8080` 컨테이너 포트를 `80` Docker 호스트 포트로 매핑하는 방법을 보여줍니다.

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

이 경우 `http://0.0.0.0:80`에서 서버에 접속할 수 있습니다.

### 외부 레지스트리 {id="external-registry"}

**[publishImage](#tasks)** 태스크를 사용하여 프로젝트의 Docker 이미지를 외부 레지스트리에 게시하기 전에 `ktor.docker.externalRegistry` 속성을 사용하여 외부 레지스트리를 구성해야 합니다. 이 속성은 필요한 레지스트리 유형에 대한 구성을 제공하는 `DockerImageRegistry` 인스턴스를 받습니다:

- `DockerImageRegistry.dockerHub`: [Docker Hub](https://hub.docker.com/)를 위한 `DockerImageRegistry`를 생성합니다.
- `DockerImageRegistry.googleContainerRegistry`: [Google Container Registry](https://cloud.google.com/container-registry)를 위한 `DockerImageRegistry`를 생성합니다.

아래 예제는 Docker Hub 레지스트리를 구성하는 방법을 보여줍니다:

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

Docker Hub 이름과 비밀번호는 환경 변수에서 가져오므로, `publishImage` 태스크를 실행하기 전에 이 값들을 설정해야 합니다:

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

## 수동 이미지 구성 {id="manual"}

필요한 경우, Ktor 애플리케이션으로 이미지를 어셈블하기 위해 직접 `Dockerfile`을 제공할 수 있습니다.

### 애플리케이션 패키징 {id="packagea-pp"}

첫 번째 단계로, 애플리케이션을 의존성과 함께 패키징해야 합니다.
예를 들어, 이는 [Fat JAR](server-fatjar.md) 또는 [실행 가능한 JVM 애플리케이션](server-packaging.md)일 수 있습니다.

### Docker 이미지 준비 {id="prepare-docker"}

애플리케이션을 도커화하기 위해 [멀티 스테이지 빌드](https://docs.docker.com/develop/develop-images/multistage-build/)를 사용합니다:

1. 먼저, Gradle/Maven 의존성에 대한 캐싱을 설정합니다. 이 단계는 선택 사항이지만 전체 빌드 속도를 향상시키므로 권장됩니다.
2. 그런 다음, `gradle`/`maven` 이미지를 사용하여 애플리케이션이 포함된 Fat JAR를 생성합니다.
3. 마지막으로, 생성된 배포판은 JDK 이미지를 기반으로 생성된 환경에서 실행됩니다.

프로젝트의 루트 폴더에 다음 내용으로 `Dockerfile`이라는 파일을 생성합니다:

<Tabs group="languages">
<TabItem title="Gradle" group-key="kotlin">

<code-block lang="Docker" code="# Stage 1: Gradle 의존성 캐싱&#10;FROM gradle:latest AS cache&#10;RUN mkdir -p /home/gradle/cache_home&#10;ENV GRADLE_USER_HOME=/home/gradle/cache_home&#10;COPY build.gradle.* gradle.properties /home/gradle/app/&#10;COPY gradle /home/gradle/app/gradle&#10;WORKDIR /home/gradle/app&#10;RUN gradle dependencies --no-daemon&#10;&#10;# Stage 2: 애플리케이션 빌드&#10;FROM gradle:latest AS build&#10;COPY --from=cache /home/gradle/cache_home /home/gradle/.gradle&#10;COPY --chown=gradle:gradle . /home/gradle/src&#10;WORKDIR /home/gradle/src&#10;# Fat JAR 빌드, Gradle은 기본적으로 shadow 및 boot JAR도 지원합니다.&#10;RUN gradle buildFatJar --no-daemon&#10;&#10;# Stage 3: 런타임 이미지 생성&#10;FROM amazoncorretto:22 AS runtime&#10;EXPOSE 8080&#10;RUN mkdir /app&#10;COPY --from=build /home/gradle/src/build/libs/*.jar /app/ktor-docker-sample.jar&#10;ENTRYPOINT [&quot;java&quot;,&quot;-jar&quot;,&quot;/app/ktor-docker-sample.jar&quot;]"></code-block>

</TabItem>
<TabItem title="Maven" group-key="maven">

```Docker
# Stage 1: Maven 의존성 캐싱
FROM maven:3.8-amazoncorretto-21 AS cache
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline

# Stage 2: 애플리케이션 빌드
FROM maven:3.8-amazoncorretto-21 AS build
WORKDIR /app
COPY --from=cache /root/.m2 /root/.m2
COPY . .
RUN mvn clean package

# Stage 3: 런타임 이미지 생성
FROM amazoncorretto:21-slim AS runtime
EXPOSE 8080
WORKDIR /app
COPY --from=build /app/target/*-with-dependencies.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
```

</TabItem>
</Tabs>

첫 번째 스테이지는 빌드 관련 파일에 변경 사항이 있을 때만 의존성을 다시 다운로드하도록 보장합니다. 첫 번째 스테이지를 사용하지 않거나 다른 스테이지에서 의존성이 캐시되지 않으면 매 빌드마다 의존성이 설치됩니다.

두 번째 스테이지에서는 Fat JAR가 빌드됩니다. Gradle은 기본적으로 shadow 및 boot JAR도 지원한다는 점에 유의하세요.

빌드의 세 번째 스테이지는 다음과 같이 작동합니다:

* 사용할 이미지를 지정합니다.
* 노출할 포트를 지정합니다 (이것은 자동으로 포트를 노출하지 않으며, 컨테이너 실행 시 수행됩니다).
* 빌드 출력물의 내용을 폴더로 복사합니다.
* 애플리케이션을 실행합니다 (`ENTRYPOINT`).

<tip id="jdk_image_replacement_tip">
  <p>
   이 예제에서는 Amazon Corretto Docker 이미지를 사용하지만, 다음과 같은 다른 적절한 대안으로 교체할 수 있습니다:
  </p>
  <list>
    <li><a href="https://hub.docker.com/_/eclipse-temurin">Eclipse Temurin</a></li>
    <li><a href="https://hub.docker.com/_/ibm-semeru-runtimes">IBM Semeru</a></li>
    <li><a href="https://hub.docker.com/_/ibmjava">IBM Java</a></li>
    <li><a href="https://hub.docker.com/_/sapmachine">SAP Machine JDK</a></li>
  </list>
</tip>

### Docker 이미지 빌드 및 실행 {id="build-run"}

다음 단계는 Docker 이미지를 빌드하고 태그를 지정하는 것입니다:

```bash
docker build -t my-application .
```

마지막으로 이미지를 시작합니다:

```bash
docker run -p 8080:8080 my-application
```

이렇게 하면 Ktor 서버가 실행되어 `https://0.0.0.0:8080`에서 응답합니다.