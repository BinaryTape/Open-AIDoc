[//]: # (title: Lombok 컴파일러 플러그인)
<primary-label ref="alpha"/>

Kotlin Lombok 컴파일러 플러그인은 동일한 혼합 Java/Kotlin 모듈 내의 Kotlin 코드에서 Java Lombok 선언을 생성하고 사용할 수 있게 해줍니다.
만약 다른 모듈에서 이러한 선언을 호출하는 경우, 해당 모듈을 컴파일할 때는 이 플러그인을 사용할 필요가 없습니다.

Lombok 컴파일러 플러그인은 [Lombok](https://projectlombok.org/)을 대체할 수는 없지만, 혼합 Java/Kotlin 모듈에서 Lombok이 작동하도록 도와줍니다.
따라서 이 플러그인을 사용할 때도 평소와 같이 Lombok을 구성해야 합니다. 
[Lombok 컴파일러 플러그인을 구성하는 방법](#using-the-lombok-configuration-file)에 대해 자세히 알아보세요.

## 지원되는 어노테이션 {id="supported-annotations"}

이 플러그인은 다음 어노테이션들을 지원합니다:
* `@Getter`, `@Setter`
* `@Builder`, `@SuperBuilder`
* `@NoArgsConstructor`, `@RequiredArgsConstructor`, 그리고 `@AllArgsConstructor`
* `@Data`
* `@With`
* `@Value`

우리는 이 플러그인에 대한 작업을 지속하고 있습니다. 자세한 현재 상태를 확인하려면 [Lombok 컴파일러 플러그인의 README](https://github.com/JetBrains/kotlin/tree/master/plugins/lombok)를 방문하세요.

현재로서는 `@Tolerate` 어노테이션을 지원할 계획이 없습니다. 하지만 YouTrack에서 [@Tolerate 이슈](https://youtrack.jetbrains.com/issue/KT-53564/Kotlin-Lombok-Support-Tolerate)에 투표해 주신다면 이를 고려해 볼 수 있습니다.

> Kotlin 코드에서 Lombok 어노테이션을 사용하는 경우 Kotlin 컴파일러는 이를 무시합니다.
>
{style="note"}

## Gradle {id="gradle"}

`build.gradle(.kts)` 파일에 `kotlin-plugin-lombok` Gradle 플러그인을 적용하세요:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("plugin.lombok") version "%kotlinVersion%"
    id("io.freefair.lombok") version "%lombokVersion%"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id 'org.jetbrains.kotlin.plugin.lombok' version '%kotlinVersion%'
    id 'io.freefair.lombok' version '%lombokVersion%'
}
```

</tab>
</tabs>

[Lombok 컴파일러 플러그인이 사용된 테스트 프로젝트 예시](https://github.com/kotlin-hands-on/kotlin-lombok-examples/tree/master/kotlin_lombok_gradle/nokapt)를 확인해 보세요.

### Lombok 설정 파일 사용하기 {id="using-the-lombok-configuration-file"}

[Lombok 설정 파일](https://projectlombok.org/features/configuration) `lombok.config`를 사용하는 경우, 플러그인이 파일을 찾을 수 있도록 파일 경로를 설정해야 합니다. 
경로는 모듈 디렉토리에 대한 상대 경로여야 합니다. 
예를 들어, `build.gradle(.kts)` 파일에 다음 코드를 추가하세요:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlinLombok {
    lombokConfigurationFile(file("lombok.config"))
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlinLombok {
    lombokConfigurationFile file("lombok.config")
}
```

</tab>
</tabs>

[Lombok 컴파일러 플러그인과 `lombok.config`가 사용된 테스트 프로젝트 예시](https://github.com/kotlin-hands-on/kotlin-lombok-examples/tree/master/kotlin_lombok_gradle/withconfig)를 확인해 보세요.

## Maven {id="maven"}

Lombok 컴파일러 플러그인을 사용하려면 `compilerPlugins` 섹션에 `lombok` 플러그인을 추가하고, `dependencies` 섹션에 `kotlin-maven-lombok` 의존성을 추가하세요. 
[Lombok 설정 파일](https://projectlombok.org/features/configuration) `lombok.config`를 사용하는 경우, `pluginOptions`에서 해당 파일의 경로를 플러그인에 제공하세요. `pom.xml` 파일에 다음 줄을 추가하세요:

```xml
<plugin>
    <groupId>org.jetbrains.kotlin</groupId>
    <artifactId>kotlin-maven-plugin</artifactId>
    <version>${kotlin.version}</version>
    <configuration>
        <compilerPlugins>
            <plugin>lombok</plugin>
        </compilerPlugins>
        <pluginOptions>
            <option>lombok:config=${project.basedir}/lombok.config</option>
        </pluginOptions>
    </configuration>
    <dependencies>
        <dependency>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-lombok</artifactId>
            <version>${kotlin.version}</version>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>1.18.20</version>
            <scope>provided</scope>
        </dependency>
    </dependencies>
</plugin>
```

[Lombok 컴파일러 플러그인과 `lombok.config`가 사용된 테스트 프로젝트 예시](https://github.com/kotlin-hands-on/kotlin-lombok-examples/tree/master/kotlin_lombok_maven/nokapt)를 확인해 보세요.

## kapt와 함께 사용하기 {id="using-with-kapt"}

기본적으로 [kapt](kapt.md) 컴파일러 플러그인은 모든 어노테이션 프로세서를 실행하고 javac에 의한 어노테이션 프로세싱을 비활성화합니다.
kapt와 함께 [Lombok](https://projectlombok.org/)을 실행하려면, javac의 어노테이션 프로세서가 계속 작동하도록 kapt를 설정하세요.

Gradle을 사용하는 경우, `build.gradle(.kts)` 파일에 다음 옵션을 추가하세요:

```groovy
kapt {
    keepJavacAnnotationProcessors = true
}
```

Maven에서는 다음 설정을 사용하여 Java 컴파일러와 함께 Lombok을 실행하세요:

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <version>3.5.1</version>
    <configuration>
        <source>1.8</source>
        <target>1.8</target>
        <annotationProcessorPaths>
            <annotationProcessorPath>
                <groupId>org.projectlombok</groupId>
                <artifactId>lombok</artifactId>
                <version>${lombok.version}</version>
            </annotationProcessorPath>
        </annotationProcessorPaths>
    </configuration>
</plugin>    
```

어노테이션 프로세서가 Lombok에 의해 생성된 코드에 의존하지 않는다면 Lombok 컴파일러 플러그인은 [kapt](kapt.md)와 함께 올바르게 작동합니다.

kapt와 Lombok 컴파일러 플러그인이 함께 사용된 테스트 프로젝트 예시를 살펴보세요:
* [Gradle](https://github.com/JetBrains/kotlin/tree/master/libraries/tools/kotlin-gradle-plugin-integration-tests/src/test/resources/testProject/lombokProject/yeskapt) 사용 시.
* [Maven](https://github.com/kotlin-hands-on/kotlin-lombok-examples/tree/master/kotlin_lombok_maven/yeskapt) 사용 시.

## 명령줄 컴파일러 {id="command-line-compiler"}

Lombok 컴파일러 플러그인 JAR는 Kotlin 컴파일러의 바이너리 배포판에서 사용할 수 있습니다. `kotlinc`의 `Xplugin` 옵션을 사용하여 해당 JAR 파일의 경로를 제공함으로써 플러그인을 연결할 수 있습니다:

```bash
-Xplugin=$KOTLIN_HOME/lib/lombok-compiler-plugin.jar
```

`lombok.config` 파일을 사용하려면, `<PATH_TO_CONFIG_FILE>`을 해당 `lombok.config`의 경로로 바꾸세요:

```bash
# 플러그인 옵션 형식은 "-P plugin:<plugin id>:<key>=<value>"입니다. 
# 옵션은 반복해서 사용할 수 있습니다.

-P plugin:org.jetbrains.kotlin.lombok:config=<PATH_TO_CONFIG_FILE>
```
