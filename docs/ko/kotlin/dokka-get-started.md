[//]: # (title: Dokka 시작하기)

아래에서 Dokka를 시작하는 데 도움이 되는 간단한 안내를 확인할 수 있습니다.

<tabs group="build-script">
<tab title="Gradle Kotlin DSL" group-key="kotlin">

> 이 가이드는 Dokka Gradle 플러그인(DGP) v2 모드에 적용됩니다. DGP v1 모드는 더 이상 지원되지 않습니다. 
> v1에서 v2 모드로 업그레이드하려면 [마이그레이션 가이드](dokka-migration.md)를 따르세요.
>
{style="note"}

**Gradle Dokka 플러그인 적용** 

프로젝트의 루트 빌드 스크립트에 Dokka Gradle 플러그인(DGP)을 적용합니다:

```kotlin
plugins {
    id("org.jetbrains.dokka") version "%dokkaVersion%"
}
```

**멀티 프로젝트 빌드 문서화**

[멀티 프로젝트 빌드](https://docs.gradle.org/current/userguide/multi_project_builds.html)를 문서화할 때는 문서화하려는 모든 서브프로젝트에 플러그인을 적용해야 합니다. 다음 방법 중 하나를 사용하여 서브프로젝트 간에 Dokka 설정을 공유하세요:

* 컨벤션 플러그인(Convention plugin)
* 컨벤션 플러그인을 사용하지 않는 경우 각 서브프로젝트에서 직접 설정

멀티 프로젝트 빌드에서 Dokka 설정을 공유하는 방법에 대한 자세한 내용은 [멀티 프로젝트 설정](dokka-gradle.md#multi-project-configuration)을 참조하세요.

**문서 생성**

문서를 생성하려면 다음 Gradle 태스크를 실행합니다:

```bash
./gradlew :dokkaGenerate
```

이 태스크는 단일 프로젝트 및 멀티 프로젝트 빌드 모두에서 작동합니다.

태스크 앞에 프로젝트 경로(`:`)를 접두사로 붙여 집계(aggregating) 프로젝트에서 `dokkaGenerate` 태스크를 실행합니다. 예:

```bash
./gradlew :dokkaGenerate

// OR

./gradlew :aggregatingProject:dokkaGenerate
```

`./gradlew :dokkaGenerate` 또는 `./gradlew :aggregatingProject:dokkaGenerate` 대신 `./gradlew dokkaGenerate`를 실행하지 마세요.
태스크 앞에 프로젝트 경로(`:`)가 없으면 Gradle은 전체 빌드에서 모든 `dokkaGenerate` 태스크를 실행하려고 시도하므로 불필요한 작업이 트리거될 수 있습니다.

서로 다른 태스크를 사용하여 [HTML](dokka-html.md), [Javadoc](dokka-javadoc.md) 또는 [HTML 및 Javadoc 모두](dokka-gradle.md#configure-documentation-output-format)로 출력을 생성할 수 있습니다.

> Gradle과 함께 Dokka를 사용하는 방법에 대한 자세한 내용은 [Gradle](dokka-gradle.md)을 참조하세요.
{style="tip"}

</tab>
<tab title="Gradle Groovy DSL" group-key="groovy">

> 이 가이드는 Dokka Gradle 플러그인(DGP) v2 모드에 적용됩니다. DGP v1 모드는 더 이상 지원되지 않습니다.
> v1에서 v2 모드로 업그레이드하려면 [마이그레이션 가이드](dokka-migration.md)를 따르세요.
>
{style="note"}

**Gradle Dokka 플러그인 적용**

프로젝트의 루트 빌드 스크립트에 Dokka Gradle 플러그인(DGP)을 적용합니다:

```groovy
plugins {
    id 'org.jetbrains.dokka' version '%dokkaVersion%'
}
```

**멀티 프로젝트 빌드 문서화**

[멀티 프로젝트 빌드](https://docs.gradle.org/current/userguide/multi_project_builds.html)를 문서화할 때는 문서화하려는 모든 서브프로젝트에 플러그인을 적용해야 합니다. 다음 방법 중 하나를 사용하여 서브프로젝트 간에 Dokka 설정을 공유하세요:

* 컨벤션 플러그인(Convention plugin)
* 컨벤션 플러그인을 사용하지 않는 경우 각 서브프로젝트에서 직접 설정

멀티 프로젝트 빌드에서 Dokka 설정을 공유하는 방법에 대한 자세한 내용은 [멀티 프로젝트 설정](dokka-gradle.md#multi-project-configuration)을 참조하세요.

**문서 생성**

문서를 생성하려면 다음 Gradle 태스크를 실행합니다:

```bash
./gradlew :dokkaGenerate
```

이 태스크는 단일 프로젝트 및 멀티 프로젝트 빌드 모두에서 작동합니다.

태스크 앞에 프로젝트 경로(`:`)를 접두사로 붙여 집계(aggregating) 프로젝트에서 `dokkaGenerate` 태스크를 실행합니다. 예:

```bash
./gradlew :dokkaGenerate

// OR

./gradlew :aggregatingProject:dokkaGenerate
```

`./gradlew :dokkaGenerate` 또는 `./gradlew :aggregatingProject:dokkaGenerate` 대신 `./gradlew dokkaGenerate`를 실행하지 마세요.
태스크 앞에 프로젝트 경로(`:`)가 없으면 Gradle은 전체 빌드에서 모든 `dokkaGenerate` 태스크를 실행하려고 시도하므로 불필요한 작업이 트리거될 수 있습니다.

서로 다른 태스크를 사용하여 [HTML](dokka-html.md), [Javadoc](dokka-javadoc.md) 또는 [HTML 및 Javadoc 모두](dokka-gradle.md#configure-documentation-output-format)로 출력을 생성할 수 있습니다.

> Gradle과 함께 Dokka를 사용하는 방법에 대한 자세한 내용은 [Gradle](dokka-gradle.md)을 참조하세요.
{style="tip"}

</tab>
<tab title="Maven" group-key="mvn">

POM 파일의 `plugins` 섹션에 Dokka용 Maven 플러그인을 추가합니다:

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.dokka</groupId>
            <artifactId>dokka-maven-plugin</artifactId>
            <version>%dokkaVersion%</version>
            <executions>
                <execution>
                    <phase>pre-site</phase>
                    <goals>
                        <goal>dokka</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

문서를 생성하려면 `dokka:dokka` 골(goal)을 실행합니다.

기본적으로 출력 디렉터리는 `target/dokka`로 설정됩니다.

Maven과 함께 Dokka를 사용하는 방법에 대한 자세한 내용은 [Maven](dokka-maven.md)을 참조하세요.

</tab>
</tabs>