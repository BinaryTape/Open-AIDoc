[//]: # (title: EAP를 위한 빌드 구성하기)

<tldr>
    <p>현재 사용 가능한 프리뷰 버전이 없습니다.</p>
    <!--<p>최신 Kotlin EAP 릴리스: <strong>%kotlinEapVersion%</strong></p>
    <p><a href="eap.md#build-details">Kotlin EAP 릴리스 세부 정보 살펴보기</a></p> -->
</tldr>

Kotlin의 EAP(Early Access Preview) 버전을 사용하도록 빌드를 구성하려면 다음 단계를 수행해야 합니다: 

* Kotlin의 EAP 버전을 지정합니다. [사용 가능한 EAP 버전 목록은 여기에서 확인하세요](eap.md#build-details).
* 의존성 버전을 EAP 버전으로 변경합니다.
Kotlin EAP 버전은 이전에 릴리스된 버전의 라이브러리와 호환되지 않을 수 있습니다. 

다음 절차에서는 Gradle 및 Maven에서 빌드를 구성하는 방법을 설명합니다:

* [Gradle에서 구성하기](#configure-in-gradle)
* [Maven에서 구성하기](#configure-in-maven)

## Gradle에서 구성하기 {id="configure-in-gradle"}

이 섹션에서는 다음 내용을 설명합니다:

* [Kotlin 버전 조정하기](#adjust-the-kotlin-version)
* [의존성 버전 조정하기](#adjust-versions-in-dependencies)

### Kotlin 버전 조정하기 {id="adjust-the-kotlin-version"}

`build.gradle(.kts)`의 `plugins` 블록에서 `KOTLIN-EAP-VERSION`을 `%kotlinEapVersion%`과 같은 실제 EAP 버전으로 변경하세요. [사용 가능한 EAP 버전 목록은 여기에서 확인하세요](eap.md#build-details).

또는 `settings.gradle(.kts)`의 `pluginManagement` 블록에서 EAP 버전을 지정할 수도 있습니다. 자세한 내용은 [Gradle 문서](https://docs.gradle.org/current/userguide/plugins.html#sec:plugin_version_management)를 참조하세요.

다음은 멀티플랫폼(Multiplatform) 프로젝트의 예시입니다.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    java
    kotlin("multiplatform") version "KOTLIN-EAP-VERSION"
}

repositories {
    mavenCentral()
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id 'java'
    id 'org.jetbrains.kotlin.multiplatform' version 'KOTLIN-EAP-VERSION'
}

repositories {
    mavenCentral()
}
```

</tab>
</tabs>

### 의존성 버전 조정하기 {id="adjust-versions-in-dependencies"}

프로젝트에서 kotlinx 라이브러리를 사용하는 경우, 해당 라이브러리 버전이 Kotlin EAP 버전과 호환되지 않을 수 있습니다.

이 문제를 해결하려면 의존성에 호환되는 라이브러리 버전을 지정해야 합니다. 호환되는 라이브러리 목록은 [EAP 빌드 세부 정보](eap.md#build-details)를 참조하세요. 

> 대부분의 경우 특정 릴리스의 첫 번째 EAP 버전에 대해서만 라이브러리를 생성하며, 이 라이브러리들은 해당 릴리스의 후속 EAP 버전에서도 작동합니다.
> 
> 만약 다음 EAP 버전에서 호환되지 않는 변경 사항이 있는 경우, 라이브러리의 새 버전을 릴리스합니다.
>
{style="note"}

다음은 예시입니다.

**kotlinx.coroutines** 라이브러리의 경우, `%kotlinEapVersion%`과 호환되는 버전 번호인 `%coroutinesEapVersion%`을 추가하세요. 

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
dependencies {
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesEapVersion%")
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
dependencies {
    implementation "org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesEapVersion%"
}
```

</tab>
</tabs>

## Maven에서 구성하기 {id="configure-in-maven"}

샘플 Maven 프로젝트 정의에서 `KOTLIN-EAP-VERSION`을 `%kotlinEapVersion%`과 같은 실제 버전으로 바꾸세요. [사용 가능한 EAP 버전 목록은 여기에서 확인하세요](eap.md#build-details).

```xml
<project ...>
    <properties>
        <kotlin.version>KOTLIN-EAP-VERSION</kotlin.version>
    </properties>

    <repositories>
        <repository>
           <id>mavenCentral</id>
           <url>https://repo1.maven.org/maven2/</url>
        </repository>
    </repositories>

    <pluginRepositories>
       <pluginRepository>
          <id>mavenCentral</id>
          <url>https://repo1.maven.org/maven2/</url>
       </pluginRepository>
    </pluginRepositories>

    <dependencies>
        <dependency>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-stdlib</artifactId>
            <version>${kotlin.version}</version>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.jetbrains.kotlin</groupId>
                <artifactId>kotlin-maven-plugin</artifactId>
                <version>${kotlin.version}</version>
                ...
            </plugin>
        </plugins>
    </build>
</project>
```

## 문제가 발생하는 경우 {id="if-you-run-into-any-problems"}

* [이슈 트래커인 YouTrack](https://kotl.in/issue)에 이슈를 제보해 주세요.
* [Kotlin Slack의 #eap 채널](https://app.slack.com/client/T09229ZC6/C0KLZSCHF)에서 도움을 받으세요 ([초대받기](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)).
* 최신 안정 버전으로 롤백하려면 [빌드 스크립트 파일에서 버전을 변경](#adjust-the-kotlin-version)하세요.