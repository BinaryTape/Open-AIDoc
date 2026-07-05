[//]: # (title: kapt 컴파일러 플러그인)

<tldr>

* 다음과 같은 경우 **kapt**를 사용하세요:
   * Maven 프로젝트를 사용하는 경우.
   * Gradle 프로젝트를 사용하지만, 필요한 Java 어노테이션 프로세서가 아직 KSP를 지원하지 않는 경우. [지원되는 라이브러리 목록 보기](ksp-overview.md#supported-libraries).
* 다음과 같은 경우 **[KSP](ksp-overview.md)**를 사용하세요:
   * Gradle 프로젝트를 사용하고, 필요한 Java 어노테이션 프로세서가 KSP를 지원하는 경우.
   * 직접 어노테이션 프로세서를 만들려는 경우.

</tldr>

kapt 컴파일러 플러그인을 사용하면 Kotlin에서 기존 Java 어노테이션 프로세서를 사용할 수 있으며, Maven과 Gradle 모두에서 작동합니다.
kapt는 Kotlin 소스 코드에서 스텁(stub) 파일을 생성한 다음, 해당 스텁에 대해 Java 어노테이션 프로세서를 실행합니다.

이를 통해 Kotlin 프로젝트에서 [MapStruct](https://mapstruct.org/)나 [Data Binding](https://developer.android.com/topic/libraries/data-binding/index.html)과 같은 라이브러리를 위한 Java 기반 어노테이션 처리가 가능해집니다.

> kapt는 IntelliJ 빌드 시스템에서 지원되지 않습니다. IntelliJ IDEA에서 어노테이션 처리를 다시 실행하려면 **Maven** 도구 창에서 빌드를 시작하세요.
> 
{style="warning"}

## 플러그인 설정하기

[Gradle](#set-up-in-gradle), [Maven](#set-up-in-maven)을 위해 kapt 플러그인을 구성하거나 [커맨드 라인](#cli)에서 사용할 수 있습니다.

### Gradle {id="set-up-in-gradle"}

Gradle에서 kapt를 사용하려면 다음 단계를 따르세요:

1. 빌드 스크립트 파일 `build.gradle(.kts)`에 `kapt` Gradle 플러그인을 적용합니다:

   <tabs group="build-script">
   <tab title="Kotlin" group-key="kotlin">

   ```kotlin
   plugins {
       kotlin("kapt") version "%kotlinVersion%"
   }
   ```

   </tab>
   <tab title="Groovy" group-key="groovy">

   ```groovy
   plugins {
       id "org.jetbrains.kotlin.kapt" version "%kotlinVersion%"
   }
   ```

   </tab>
   </tabs>

2. `dependencies {}` 블록에서 `kapt` 구성을 사용하여 해당하는 의존성을 추가합니다:

   <tabs group="build-script">
   <tab title="Kotlin" group-key="kotlin">

   ```kotlin
   dependencies {
       kapt("groupId:artifactId:version")
   }
   ```

   </tab>
   <tab title="Groovy" group-key="groovy">

   ```groovy
   dependencies {
       kapt 'groupId:artifactId:version'
   }
   ```

   </tab>
   </tabs>

3. 이전에 어노테이션 프로세서를 위해 [Android 지원](https://developer.android.com/build/annotation-processors) 기능을 사용했다면, `annotationProcessor` 구성의 사용처를 `kapt`로 변경하세요. 프로젝트에 Java 클래스가 포함되어 있는 경우에도 kapt 플러그인이 이를 함께 처리합니다.

   `androidTest` 또는 `test` 소스에 어노테이션 프로세서를 사용하는 경우, 각각 `kaptAndroidTest`와 `kaptTest`라는 이름의 `kapt` 구성을 사용합니다. `kaptAndroidTest`와 `kaptTest`는 `kapt`를 상속받으므로, `kapt` 의존성을 제공하면 프로덕션 소스와 테스트 모두에서 사용할 수 있습니다.

### Maven {id="set-up-in-maven"}

설정을 간소화하기 위해 [`<extensions>` 옵션](#automatic-configuration)을 사용하거나, kapt 실행을 완전히 제어하기 위해 [수동](#manual-configuration)으로 설정할 수 있습니다.

#### 자동 구성

Kotlin Maven 플러그인의 `<extensions>` 옵션을 활성화하여 kapt 구성을 간소화할 수 있습니다. 이 경우 kapt의 `<execution>` 섹션을 목표(goal)나 소스 디렉토리와 함께 수동으로 설정할 필요가 없습니다.

kapt를 자동으로 구성하려면, `pom.xml` 빌드 파일에서 `kotlin-maven-plugin`의 `<extensions>` 옵션을 `true`로 설정하세요:

```xml
<plugin>
    <groupId>org.jetbrains.kotlin</groupId>
    <artifactId>kotlin-maven-plugin</artifactId>
    <version>${kotlin.version}</version>
    <extensions>true</extensions>
    <configuration>
        <annotationProcessorPaths>
            <!-- 여기에 어노테이션 프로세서를 지정하세요 -->
            <annotationProcessorPath>
                <groupId>org.mapstruct</groupId>
                <artifactId>mapstruct-processor</artifactId>
                <version>1.6.3</version>
            </annotationProcessorPath>
        </annotationProcessorPaths>
    </configuration>
</plugin>
```

`<extensions>` 옵션에 대한 자세한 내용은 [자동 구성](maven-configure-project.md#automatic-configuration)을 참고하세요.

#### 수동 구성

Kotlin Maven 프로젝트에서 kapt를 수동으로 설정하려면, `compile` 실행 이전에 `kotlin-maven-plugin`의 `kapt` 목표 실행을 추가하세요:

```xml
<execution>
    <id>kapt</id>
    <goals>
        <goal>kapt</goal>
    </goals>
    <configuration>
        <sourceDirs>
            <sourceDir>src/main/kotlin</sourceDir>
            <sourceDir>src/main/java</sourceDir>
        </sourceDirs>
        <annotationProcessorPaths>
            <!-- 여기에 어노테이션 프로세서를 지정하세요 -->
            <annotationProcessorPath>
                <groupId>org.mapstruct</groupId>
                <artifactId>mapstruct-processor</artifactId>
                <version>1.6.3</version>
            </annotationProcessorPath>
        </annotationProcessorPaths>
    </configuration>
</execution>
```

##### kapt 어노테이션 처리 구성

어노테이션 처리 모드를 구성하려면 `<configuration>` 블록에서 `<aptMode>` 옵션을 설정하세요:

* `stubs` – 어노테이션 처리에 필요한 스텁만 생성합니다.
* `apt` – 어노테이션 처리만 실행합니다.
* `stubsAndApt` – (기본값) 스텁을 생성하고 어노테이션 처리를 실행합니다.

예시:

```xml
<configuration>
   ...
   <aptMode>stubs</aptMode>
</configuration>
```

### CLI

kapt 컴파일러 플러그인은 Kotlin 컴파일러의 바이너리 배포판에 포함되어 있습니다.

`-Xplugin` Kotlin 컴파일러 옵션을 사용하여 플러그인의 JAR 파일 경로를 제공함으로써 플러그인을 연결할 수 있습니다:

```bash
-Xplugin=$KOTLIN_HOME/lib/kotlin-annotation-processing.jar
```

다음은 사용 가능한 옵션 목록입니다:

* `sources` (*필수*): 생성된 파일의 출력 경로입니다.
* `classes` (*필수*): 생성된 클래스 파일 및 리소스의 출력 경로입니다.
* `stubs` (*필수*): 스텁 파일의 임시 출력 경로입니다.
* `incrementalData`: 바이너리 스텁의 출력 경로입니다.
* `apclasspath` (*중복 가능*): 어노테이션 프로세서 JAR의 경로입니다. 각 JAR에 대해 하나의 `apclasspath` 옵션을 전달하세요.
* `apoptions`: 어노테이션 프로세서 옵션의 Base64 인코딩된 목록입니다. 자세한 내용은 [AP/javac 옵션 인코딩](#ap-javac-options-encoding)을 참고하세요.
* `javacArguments`: javac에 전달되는 옵션의 Base64 인코딩된 목록입니다. 자세한 내용은 [AP/javac 옵션 인코딩](#ap-javac-options-encoding)을 참고하세요.
* `processors`: 어노테이션 프로세서의 정규화된 클래스 이름(qualified class names)을 쉼표로 구분한 목록입니다. 지정된 경우 kapt는 `apclasspath`에서 어노테이션 프로세서를 찾으려고 시도하지 않습니다.
* `verbose`: 상세 출력을 활성화합니다.
* `aptMode` (*필수*)
    * `stubs` – 어노테이션 처리에 필요한 스텁만 생성합니다.
    * `apt` – 어노테이션 처리만 실행합니다.
    * `stubsAndApt` – 스텁을 생성하고 어노테이션 처리를 실행합니다.
* `correctErrorTypes`: 자세한 내용은 [존재하지 않는 타입 보정](#non-existent-type-correction)을 참고하세요. 기본적으로 비활성화되어 있습니다.
* `dumpFileReadHistory`: 어노테이션 처리 중에 사용된 클래스 목록을 각 파일별로 덤프할 출력 경로입니다.

플러그인 옵션 형식은 `-P plugin:<plugin id>:<key>=<value>`입니다. 옵션은 중복될 수 있습니다.

예시:

```bash
-P plugin:org.jetbrains.kotlin.kapt3:sources=build/kapt/sources
-P plugin:org.jetbrains.kotlin.kapt3:classes=build/kapt/classes
-P plugin:org.jetbrains.kotlin.kapt3:stubs=build/kapt/stubs

-P plugin:org.jetbrains.kotlin.kapt3:apclasspath=lib/ap.jar
-P plugin:org.jetbrains.kotlin.kapt3:apclasspath=lib/anotherAp.jar

-P plugin:org.jetbrains.kotlin.kapt3:correctErrorTypes=true
```

## 어노테이션 프로세서 구성

### 어노테이션 프로세서 인수 전달

빌드 스크립트 파일 `build.gradle(.kts)`의 `arguments {}` 블록을 사용하여 어노테이션 프로세서에 인수를 전달합니다:

```kotlin
kapt {
    arguments {
        arg("key", "value")
    }
}
```

### 프로세서 클래스패스 및 검색 구성

kapt의 프로세서 경로(processor path)에 포함되지 않은 어노테이션 프로세서의 검색을 비활성화할 수 있습니다. 이를 통해 컴파일 클래스패스에서 불필요한 어노테이션 프로세서를 제외할 수 있습니다.

#### Gradle {id="classpath-discovery-gradle"}

Gradle은 프로젝트 재빌드 시 [컴파일 회피(compile avoidance)](https://docs.gradle.org/current/userguide/java_plugin.html#sec:java_compile_avoidance)를 사용하여 어노테이션 처리를 건너뛰고, kapt를 사용한 증분 빌드 시간을 개선합니다. 특히 다음과 같은 경우에 어노테이션 처리를 건너뜁니다:

* 프로젝트의 소스 파일이 변경되지 않았을 때.
* 의존성의 변경 사항이 [ABI](https://ko.wikipedia.org/wiki/응용_프로그램_이진_인터페이스) 호환될 때 (예: 함수 본문만 변경된 경우).

그러나 컴파일 클래스패스에서 발견된 어노테이션 프로세서의 경우에는 컴파일 회피를 사용할 수 없습니다. 해당 프로세서의 내부 구현이 변경되면 프로세서의 ABI가 변경되지 않더라도 어노테이션 처리 작업을 다시 실행해야 하기 때문입니다.

따라서 컴파일 클래스패스에 있는 어노테이션 프로세서를 사용하는 것은 권장되지 않습니다. 이러한 프로세서를 kapt 처리에서 제외하려면 `gradle.properties` 파일에 `kapt.include.compile.classpath` 속성을 추가하세요:

```none
# gradle.properties
kapt.include.compile.classpath=false
```

이 옵션을 `false`로 설정하면, 프로세서 경로(`kapt*` 구성)에 포함되지 않은 어노테이션 프로세서 의존성은 kapt 처리에서 제외됩니다.

#### Maven {id="classpath-discovery-maven"}

kapt의 프로세서 경로에 포함되지 않은 어노테이션 프로세서를 제외하려면, kapt 플러그인의 `<execution>` 섹션에서 `includeCompileClasspath` 옵션을 `false`로 설정하세요:

```xml
<execution>
    <id>kapt</id>
    <goals>
        <goal>kapt</goal>
    </goals>
    <configuration>
        <includeCompileClasspath>false</includeCompileClasspath>
        <sourceDirs>...</sourceDirs>
        <annotationProcessorPaths>...</annotationProcessorPaths>
    </configuration>
</execution>
```

또는 `pom.xml`의 `<properties>` 섹션에서 `kapt.include.compile.classpath` 속성을 사용할 수 있습니다:

```xml
<properties>
    <kapt.include.compile.classpath>false</kapt.include.compile.classpath>
</properties>
```

이 옵션을 `false`로 설정하면, `<annotationProcessorPaths>` 섹션에 포함되지 않은 어노테이션 프로세서는 kapt 처리에서 제외됩니다.

`includeCompileClasspath` 옵션이 설정되지 않았고 kapt가 프로세서 경로에 명시적으로 정의되지 않은 어노테이션 프로세서를 컴파일 클래스패스에서 감지하면, 다음과 같은 지원 중단(deprecation) 경고가 표시됩니다:

```none
[WARNING] Annotation processors discovery from compile classpath is deprecated.
Set 'kapt.include.compile.classpath=false' to disable discovery.
```

> kapt 클래스패스에 포함되지 않은 어노테이션 프로세서 목록을 보려면, 빌드를 `--info` 로그 레벨 옵션과 함께 실행하세요.
>
{style="tip"}

### 상위 구성(superconfigurations)으로부터 어노테이션 프로세서 상속

별도의 Gradle 구성을 상위 구성으로 정의하여 공통 어노테이션 프로세서 세트를 구성하고, 이를 하위 프로젝트의 kapt 전용 구성에서 확장하여 사용할 수 있습니다.

예를 들어, [MapStruct](https://mapstruct.org/)를 사용하는 하위 프로젝트의 경우 `build.gradle(.kts)` 파일에서 다음과 같이 구성합니다:

```kotlin
val commonAnnotationProcessors by configurations.creating
configurations.named("kapt") { extendsFrom(commonAnnotationProcessors) }

dependencies {
    implementation("org.mapstruct:mapstruct:1.6.3")
    commonAnnotationProcessors("org.mapstruct:mapstruct-processor:1.6.3")
}
```

이 예제에서 `commonAnnotationProcessors` Gradle 구성은 모든 프로젝트에서 사용하고자 하는 공통 어노테이션 처리 상위 구성입니다. [`extendsFrom()`](https://docs.gradle.org/current/dsl/org.gradle.api.artifacts.Configuration.html#org.gradle.api.artifacts.Configuration:extendsFrom) 메서드를 사용하여 `commonAnnotationProcessors`를 상위 구성으로 추가합니다. kapt는 `commonAnnotationProcessors` Gradle 구성이 MapStruct 어노테이션 프로세서에 의존하고 있음을 인식하고, 이를 자신의 어노테이션 처리 구성에 포함시킵니다.

### Java 컴파일러의 어노테이션 프로세서 유지

기본적으로 kapt는 모든 어노테이션 프로세서를 실행하고 javac에 의한 어노테이션 처리는 비활성화합니다.
하지만 [Lombok](https://projectlombok.org/)과 같은 일부 어노테이션 프로세서를 실행하기 위해 javac가 필요할 수 있습니다.

Gradle 빌드 파일에서 `keepJavacAnnotationProcessors` 옵션을 사용하세요:

```groovy
kapt {
    keepJavacAnnotationProcessors = true
}
```

Maven을 사용하는 경우 플러그인 설정을 명시적으로 구성해야 합니다.
이 [Lombok 컴파일러 플러그인 설정 예시](lombok.md#using-with-kapt)를 참고하세요.

## Gradle 빌드 캐시 지원

kapt 어노테이션 처리 작업은 기본적으로 [Gradle에서 캐시](https://guides.gradle.org/using-build-cache/)됩니다.
하지만 어노테이션 프로세서는 임의의 코드를 실행할 수 있으며, 이는 작업 입력을 출력으로 신뢰성 있게 변환하지 못하거나 Gradle이 추적하지 않는 파일에 접근하고 수정할 수 있습니다.
빌드에 사용된 어노테이션 프로세서가 제대로 캐시될 수 없는 경우, 빌드 스크립트에서 `useBuildCache` 속성을 지정하여 kapt의 캐싱을 완전히 비활성화할 수 있습니다. 이는 kapt 작업에 대한 잘못된 캐시 히트(false-positive cache hits)를 방지하는 데 도움이 됩니다:

```groovy
kapt {
    useBuildCache = false
}
```

## kapt를 사용하는 빌드 속도 향상시키기

### kapt 작업을 병렬로 실행하기

kapt를 사용하는 빌드 속도를 높이기 위해 kapt 작업에 [Gradle Worker API](https://guides.gradle.org/using-the-worker-api/)를 활성화할 수 있습니다. Worker API를 사용하면 Gradle이 단일 프로젝트 내의 독립적인 어노테이션 처리 작업을 병렬로 실행할 수 있으며, 이는 일부 경우에 실행 시간을 크게 단축시킵니다.

Kotlin Gradle 플러그인에서 [커스텀 JDK home](gradle-configure-project.md#gradle-java-toolchains-support) 기능을 사용하는 경우, kapt 작업 워커(worker)는 [프로세스 격리 모드(process isolation mode)](https://docs.gradle.org/current/userguide/worker_api.html#changing_the_isolation_mode)만 사용합니다. 이때 `kapt.workers.isolation` 속성은 무시됩니다.

kapt 워커 프로세스에 추가 JVM 인수를 제공하려면 `KaptWithoutKotlincTask`의 입력값인 `kaptProcessJvmArgs`를 사용하세요:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
tasks.withType<org.jetbrains.kotlin.gradle.internal.KaptWithoutKotlincTask>()
    .configureEach {
        kaptProcessJvmArgs.add("-Xmx512m")
    }
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
tasks.withType(org.jetbrains.kotlin.gradle.internal.KaptWithoutKotlincTask.class)
    .configureEach {
        kaptProcessJvmArgs.add('-Xmx512m')
    }
```

</tab>
</tabs>

### 어노테이션 프로세서 클래스 로더 캐싱

<primary-label ref="experimental-general"/>

어노테이션 프로세서의 클래스 로더 캐싱은 여러 Gradle 작업을 연속해서 실행할 때 kapt의 성능을 높이는 데 도움이 됩니다.

이 기능을 활성화하려면 `gradle.properties` 파일에서 다음 속성들을 사용하세요:

```none
# gradle.properties
#
# 양수 값은 캐싱을 활성화합니다.
# kapt를 사용하는 모듈 수와 동일한 값을 사용하세요.
kapt.classloaders.cache.size=5

# 캐싱이 작동하려면 false로 설정해야 합니다.
kapt.include.compile.classpath=false
```

어노테이션 프로세서 캐싱과 관련하여 문제가 발생하는 경우, 해당 프로세서에 대한 캐싱을 비활성화하세요:

```none
# 캐싱을 비활성화할 어노테이션 프로세서의 전체 이름을 지정합니다.
kapt.classloaders.cache.disableForProcessors=[어노테이션 프로세서 전체 이름]
```

> 이 기능과 관련하여 문제가 발생하면 [YouTrack](https://youtrack.jetbrains.com/issue/KT-28901)에 피드백을 남겨 주시면 감사하겠습니다.
> 
{style="note"}

### 어노테이션 프로세서 성능 측정

어노테이션 프로세서 실행에 대한 성능 통계를 얻으려면 `-Kapt-show-processor-timings` 플러그인 옵션을 사용하세요.
출력 예시는 다음과 같습니다:

```text
Kapt Annotation Processing performance report:
com.example.processor.TestingProcessor: total: 133 ms, init: 36 ms, 2 round(s): 97 ms, 0 ms
com.example.processor.AnotherProcessor: total: 100 ms, init: 6 ms, 1 round(s): 93 ms
```

이 보고서를 [`-Kapt-dump-processor-timings` (`org.jetbrains.kotlin.kapt3:dumpProcessorTimings`)](https://github.com/JetBrains/kotlin/pull/4280) 플러그인 옵션을 사용하여 파일로 저장할 수 있습니다. 다음 명령은 kapt를 실행하고 통계를 `ap-perf-report.file` 파일에 저장합니다:

```bash
kotlinc -cp $MY_CLASSPATH \
-Xplugin=kotlin-annotation-processing-SNAPSHOT.jar -P \
plugin:org.jetbrains.kotlin.kapt3:aptMode=stubsAndApt,\
plugin:org.jetbrains.kotlin.kapt3:apclasspath=processor/build/libs/processor.jar,\
plugin:org.jetbrains.kotlin.kapt3:dumpProcessorTimings=ap-perf-report.file \
-Xplugin=$JAVA_HOME/lib/tools.jar \
-d cli-tests/out \
-no-jdk -no-reflect -no-stdlib -verbose \
sample/src/main/
```

### 어노테이션 프로세서로 생성된 파일 수 측정

`kapt` Gradle 플러그인은 각 어노테이션 프로세서에 대해 생성된 파일 수에 대한 통계를 보고할 수 있습니다.

이를 통해 사용되지 않는 어노테이션 프로세서가 빌드에 포함되어 있는지 추적할 수 있습니다. 생성된 보고서를 사용하여 불필요한 어노테이션 프로세서를 실행하는 모듈을 찾아내고, 이를 방지하도록 모듈을 업데이트할 수 있습니다.

통계 보고를 활성화하려면:

1. `build.gradle(.kts)`에서 `showProcessorStats` 속성 값을 `true`로 설정합니다:

   ```kotlin
   // build.gradle.kts
   kapt {
       showProcessorStats = true
   }
   ```

2. `gradle.properties`에서 `kapt.verbose` Gradle 속성을 `true`로 설정합니다:

   ```none
   # gradle.properties
   kapt.verbose=true
   ```

> [커맨드 라인 옵션 `verbose`](#cli)를 사용하여 상세 출력을 활성화할 수도 있습니다.
>
{style="note"}

통계는 `info` 레벨의 로그에 나타납니다. `Annotation processor stats:` 라인 다음에 각 어노테이션 프로세서의 실행 시간에 대한 통계가 표시됩니다. 그 후 `Generated files report:` 라인 다음에 각 어노테이션 프로세서가 생성한 파일 수에 대한 통계가 표시됩니다. 예시:

```text
[INFO] Annotation processor stats:
[INFO] org.mapstruct.ap.MappingProcessor: total: 290 ms, init: 1 ms, 3 round(s): 289 ms, 0 ms, 0 ms
[INFO] Generated files report:
[INFO] org.mapstruct.ap.MappingProcessor: total sources: 2, sources per round: 2, 0, 0
```

## 증분 어노테이션 처리

kapt는 기본적으로 증분 어노테이션 처리를 지원합니다.
현재 어노테이션 처리는 사용 중인 모든 어노테이션 프로세서가 증분형(incremental)인 경우에만 증분 방식으로 작동할 수 있습니다.

증분 어노테이션 처리를 비활성화하려면 `gradle.properties` 파일에 다음 라인을 추가하세요:

```none
kapt.incremental.apt=false
```

증분 어노테이션 처리를 위해서는 [증분 컴파일](gradle-compilation-and-caches.md#incremental-compilation)도 활성화되어 있어야 합니다.

## Java 컴파일러 옵션

kapt는 Java 컴파일러를 사용하여 어노테이션 프로세서를 실행합니다.
다음은 javac에 임의의 옵션을 전달하는 방법입니다:

```groovy
kapt {
    javacOptions {
        // 어노테이션 프로세서의 최대 오류 횟수를 늘립니다.
        // 기본값은 100입니다.
        option("-Xmaxerrs", 500)
    }
}
```

## 존재하지 않는 타입 보정(Non-existent type correction)

일부 어노테이션 프로세서(`AutoFactory` 등)는 선언 서명(declaration signatures)의 정확한 타입에 의존합니다.
기본적으로 kapt는 생성된 클래스의 타입을 포함하여 모든 알 수 없는 타입을 `NonExistentClass`로 대체하지만, 이 동작을 변경할 수 있습니다. 스텁(stub)에서 오류 타입 추론을 활성화하려면 `build.gradle(.kts)` 파일에 다음 옵션을 추가하세요:

```groovy
kapt {
    correctErrorTypes = true
}
```

## Kotlin 소스 생성

kapt는 Kotlin 소스를 생성할 수 있습니다. 생성된 Kotlin 소스 파일을 `processingEnv.options["kapt.kotlin.generated"]`에 지정된 디렉토리에 작성하기만 하면, 이 파일들은 메인 소스와 함께 컴파일됩니다.

kapt는 생성된 Kotlin 파일에 대해 다중 라운드(multiple rounds) 처리를 지원하지 않는다는 점에 유의하세요.

## AP/Javac 옵션 인코딩

`apoptions`와 `javacArguments` CLI 옵션은 인코딩된 옵션 맵을 허용합니다.
다음은 옵션을 직접 인코딩하는 방법입니다:

```kotlin
fun encodeList(options: Map<String, String>): String {
    val os = ByteArrayOutputStream()
    val oos = ObjectOutputStream(os)

    oos.writeInt(options.size)
    for ((key, value) in options.entries) {
        oos.writeUTF(key)
        oos.writeUTF(value)
    }

    oos.flush()
    return Base64.getEncoder().encodeToString(os.toByteArray())
}
```

## 다음 단계

* [kapt에서 KSP로 마이그레이션하는 방법 보기](ksp-kapt-migration.md)