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

어노테이션 처리 모드를 구성하려면 `<configuration>` 블록에서 [`aptMode`](#annotation-processor-configuration) 옵션을 설정하세요. 예시:

```xml
<configuration>
   ...
   <aptMode>stubs</aptMode>
</configuration>
```

### CLI

kapt는 Kotlin 컴파일러의 바이너리 배포판에 독립적인 CLI 도구로 포함되어 있습니다.

커맨드 라인에서 kapt를 실행하려면 다음을 사용하세요:

```bash
kapt <options> <source files>
```

예시:

```bash
kapt -Kapt-mode=stubsAndApt \
  -Kapt-sources=build/kapt/sources \
  -Kapt-classes=build/kapt/classes \
  -Kapt-stubs=build/kapt/stubs \
  -Kapt-classpath=lib/ap.jar \
  -Kapt-classpath=lib/anotherAp.jar \
  src/main/kotlin
```

* [kapt 전용 컴파일러 옵션](#compiler-options) 전체 목록을 확인하세요.
* 모든 유효한 [Kotlin 컴파일러 옵션](compiler-reference.md)도 전달할 수 있습니다. `kotlinc -help`를 실행하여 확인할 수 있습니다.

## 어노테이션 프로세서 구성

kapt는 프로세서 클래스패스 관리, 공유 구성으로부터 프로세서 상속, javac 전용 프로세서 활성 상태 유지 등 어노테이션 프로세서가 검색, 조직 및 실행되는 방식을 제어하는 옵션을 제공합니다.

어노테이션 프로세서 및 javac에 옵션을 전달하는 것과 같은 추가 구성 옵션은 [어노테이션 프로세서 구성](#annotation-processor-configuration)을 참고하세요.

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

## kapt 빌드 최적화

kapt는 작업을 병렬로 실행하거나, 빌드 캐시 활용, 프로세서 클래스 로더 캐싱, 증분 어노테이션 처리 사용 등 어노테이션 처리 시간을 줄이기 위한 몇 가지 Gradle 전용 전략을 제공합니다.

오류 타입 보정, 스텁 메타데이터 제거, 컴파일 클래스패스 스캐닝 등 빌드 동작에 영향을 주는 추가 옵션은 [동작 옵션](#behavioral-options)을 참고하세요.

### kapt 작업을 병렬로 실행하기

kapt는 [Gradle Worker API](https://docs.gradle.org/current/userguide/worker_api.html)를 사용하여 어노테이션 처리 작업을 실행합니다. Worker API를 사용하면 Gradle이 단일 프로젝트 내의 독립적인 어노테이션 처리 작업을 병렬로 실행할 수 있으며, 이는 일부 경우에 실행 시간을 크게 단축시킵니다.

Kotlin Gradle 플러그인에서 [커스텀 JDK 버전](gradle-configure-project.md#gradle-java-toolchains-support)을 설정하는 경우, kapt 작업 워커(worker)는 [`processIsolation()`](https://docs.gradle.org/current/userguide/worker_api.html#step_3_change_the_isolation_mode) 모드만 사용합니다.

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

### Gradle 빌드 캐시 안전하게 사용하기

kapt 어노테이션 처리 작업은 기본적으로 [Gradle에서 캐시](https://docs.gradle.org/current/userguide/build_cache_use_cases.html)됩니다. 하지만 어노테이션 프로세서는 임의의 코드를 실행할 수 있습니다. 이는 작업 입력을 출력으로 불필요하게 변환하거나 Gradle이 추적하지 않는 파일에 접근하고 수정하는 결과를 초래할 수 있습니다.

빌드에 사용된 어노테이션 프로세서가 제대로 캐시될 수 없는 경우, kapt 작업에 대한 잘못된 캐시 히트(false-positive hits)를 방지하기 위해 캐싱을 비활성화할 수 있습니다. 이를 위해 빌드 스크립트에서 `useBuildCache` 속성을 사용하세요:

```groovy
kapt {
    useBuildCache = false
}
```

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

### 증분 어노테이션 처리 사용하기

Gradle에서 kapt는 기본적으로 증분 어노테이션 처리를 지원하므로 변경된 파일만 다시 처리됩니다.

현재 증분 어노테이션 처리는 다음과 같은 경우에만 작동합니다:

* [증분 컴파일](gradle-compilation-and-caches.md#incremental-compilation)이 활성화되어 있어야 합니다.
* 빌드에 사용된 모든 어노테이션 프로세서가 증분형(incremental)이어야 합니다.

증분 어노테이션 처리를 비활성화하려면 `gradle.properties` 파일에 다음 라인을 추가하세요:

```none
kapt.incremental.apt=false
```

> 현재 kapt의 증분 어노테이션 처리는 Maven이나 CLI에서는 지원되지 않습니다.
> 
{style="note"}

## 성능 분석

kapt는 어노테이션 처리 성능을 파악하는 데 도움이 되는 내장 진단 기능을 제공합니다. 여기에는 프로세서별 실행 시간 보고서와 사용되지 않는 프로세서를 식별하기 위한 생성된 파일 수 통계가 포함됩니다.

증분 처리 디버깅을 위한 파일 읽기 기록 및 메모리 누수 감지와 같은 더 많은 진단 옵션은 [진단 및 통계 옵션](#diagnostics-and-statistics-options)을 참고하세요.

### 어노테이션 프로세서 성능 측정

어노테이션 프로세서 실행에 대한 성능 통계를 얻으려면 [`showProcessorStats`](#diagnostics-and-statistics-options) 옵션을 사용하세요. 출력 예시는 다음과 같습니다:

```text
Kapt Annotation Processing performance report:
com.example.processor.TestingProcessor: total: 133 ms, init: 36 ms, 2 round(s): 97 ms, 0 ms
com.example.processor.AnotherProcessor: total: 100 ms, init: 6 ms, 1 round(s): 93 ms
```

[`dumpProcessorStats`](#diagnostics-and-statistics-options) 옵션을 사용하여 이 보고서를 파일로 저장할 수 있습니다. 예를 들어, 다음 CLI 명령은 kapt를 실행하고 통계를 `ap-perf-report.file` 파일에 저장합니다:

```bash
kapt -Kapt-mode=stubsAndApt \
  -Kapt-classpath=processor/build/libs/processor.jar \
  -Kapt-dump-processor-stats=ap-perf-report.file \
  sample/src/main/
```

### 생성된 파일 수 추적

kapt 플러그인은 각 어노테이션 프로세서에 대해 생성된 파일 수에 대한 통계를 보고할 수 있습니다.

이를 통해 사용되지 않는 어노테이션 프로세서가 빌드에 포함되어 있는지 추적할 수 있습니다. 생성된 보고서를 사용하여 불필요한 어노테이션 프로세서를 실행하는 모듈을 찾아내고, 이를 방지하도록 모듈을 업데이트할 수 있습니다.

통계 보고를 활성화하려면:

1. Gradle 빌드 파일에서 `showProcessorStats` 옵션 값을 `true`로 설정합니다:

   ```kotlin
   // build.gradle(.kts)
   kapt {
       showProcessorStats = true
   }
   ```

2. `gradle.properties` 파일에서 `verbose` 컴파일러 옵션을 `true`로 설정합니다:

   ```
   # gradle.properties
   kapt.verbose=true
   ```

통계는 `info` 레벨의 로그에 나타납니다. `Annotation processor stats:` 라인 다음에 각 어노테이션 프로세서의 실행 시간에 대한 통계가 표시됩니다. 그 후 `Generated files report:` 라인 다음에 각 어노테이션 프로세서가 생성한 파일 수에 대한 통계가 표시됩니다. 예시:

```text
[INFO] Annotation processor stats:
[INFO] org.mapstruct.ap.MappingProcessor: total: 290 ms, init: 1 ms, 3 round(s): 289 ms, 0 ms, 0 ms
[INFO] Generated files report:
[INFO] org.mapstruct.ap.MappingProcessor: total sources: 2, sources per round: 2, 0, 0
```

> 현재 `showProcessorStats` 및 `verbose` 컴파일러 옵션을 사용한 생성 파일 수 추적은 Maven이나 CLI에서 지원되지 않습니다.
>
{style="note"}

## Kotlin 소스 생성

kapt는 Kotlin 소스를 생성할 수 있습니다. 생성된 Kotlin 소스 파일을 `processingEnv.options["kapt.kotlin.generated"]`에 지정된 디렉토리에 작성하면, 이 파일들은 메인 소스와 함께 컴파일됩니다.

> kapt는 생성된 Kotlin 파일에 대해 다중 라운드(multiple rounds) 처리를 지원하지 않습니다.
> 
{style="note"}

## 컴파일러 옵션

### 어노테이션 프로세서 구성

<table>
    <tr>
        <td>옵션</td>
        <td>설명</td>
        <td>설정 방법</td>
    </tr>
    <tr>
        <td><code>aptMode</code></td>
        <td>
            kapt 워크플로 단계의 실행을 제어합니다:
            <list>
                <li><code>stubsAndApt</code>: 스텁을 생성하고 어노테이션 처리를 실행합니다 (기본값)</li>
                <li><code>stubs</code>: Kotlin에서 Java 스텁만 생성합니다</li>
                <li><code>apt</code>: 어노테이션 프로세서만 실행합니다 (스텁이 이미 존재한다고 가정함)</li>
            </list>
        </td>
        <td>
            <p><b>Gradle:</b> 직접 사용할 수 없음; Gradle은 스텁 생성과 apt를 별도의 작업으로 실행합니다</p>
            <p><b>Maven:</b></p>
                <code-block lang="xml">
                    <![CDATA[
<aptMode>stubsAndApt</aptMode>
                    ]]>
                </code-block>
            <p><b>CLI:</b> <code>-Kapt-mode=stubsAndApt</code></p>
        </td>
    </tr>
    <tr>
        <td><code>classpath</code></td>
        <td>어노테이션 프로세서가 검색되는 클래스패스 항목입니다.</td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    dependencies {
                        kapt("com.example:processor:1.0")
                    }
                </code-block>
            <p><b>Maven:</b></p>
                <code-block lang="xml">
                    <![CDATA[
<annotationProcessorPaths>
    <annotationProcessorPath>...</annotationProcessorPath>
</annotationProcessorPaths>
                    ]]>
                </code-block>
            <p><b>CLI:</b> <code>-Kapt-classpath=lib/my-processor.jar</code></p>
        </td>
    </tr>
    <tr>
        <td><code>processors</code></td>
        <td>검색 과정을 건너뛰고 실행할 프로세서의 정규화된 클래스 이름(쉼표로 구분)입니다.</td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    kapt {
                        annotationProcessor("com.example.MyProcessor")
                    }
                </code-block>
            <p><b>Maven:</b></p>
                <code-block lang="xml">
                    <![CDATA[
<annotationProcessors>
    <annotationProcessor>com.example.MyProcessor</annotationProcessor>
</annotationProcessors>
                    ]]>
                </code-block>
            <p><b>CLI:</b> <code>-Kapt-processors=com.example.MyProcessor</code></p>
        </td>
    </tr>
    <tr>
        <td><code>apOption</code></td>
        <td>어노테이션 프로세서에 전달되는 키-값 옵션입니다.</td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    kapt {
                        arguments {
                            arg("room.schemaLocation", "$projectDir/schemas")
                        }
                    }
                </code-block>
            <p><b>Maven:</b></p>
                <code-block lang="xml">
                    <![CDATA[
<annotationProcessorArgs>
    <annotationProcessorArg>room.schemaLocation=/schemas</annotationProcessorArg>
</annotationProcessorArgs>
                    ]]>
                </code-block>
            <p><b>CLI:</b> <code>-Kapt-options:room.schemaLocation=/schemas</code></p>
        </td>
    </tr>
    <tr>
        <td><code>javacOption</code></td>
        <td>Java 컴파일러에 전달되는 키-값 옵션입니다.</td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    kapt {
                        javacOptions {
                            option("-source", "11")
                        }
                    }
                </code-block>
            <p><b>Maven:</b></p>
                <code-block lang="xml">
                    <![CDATA[
<javacOptions>
    <javacOption>-source=11</javacOption>
</javacOptions>
                    ]]>
                </code-block>
            <p><b>CLI:</b> <code>-Kapt-javac-option:-source=11</code></p>
        </td>
    </tr>
    <tr>
        <td><code>processIncrementally</code></td>
        <td>증분 어노테이션 처리를 활성화합니다. 변경 사항의 영향을 받는 파일만 다시 처리합니다.</td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    # gradle.properties
                    kapt.incremental.apt=true
                </code-block>
            <p><b>Maven:</b> 현재 지원되지 않음</p>
            <p><b>CLI:</b> 현재 지원되지 않음</p>
        </td>
    </tr>
</table>

### 출력 디렉토리 옵션

<table>
    <tr>
        <td>옵션</td>
        <td>설명</td>
        <td>설정 방법</td>
    </tr>
    <tr>
        <td><code>sources</code></td>
        <td>어노테이션 프로세서가 <code>.java</code> 소스 파일을 생성하는 디렉토리입니다.</td>
        <td>
            <p><b>Gradle:</b> 자동으로 <code>build/generated/source/kapt/main</code>으로 설정됨</p>
            <p><b>Maven:</b> 자동으로 <code>target/generated-sources/kapt/</code>로 설정됨</p>
            <p><b>CLI:</b> <code>-Kapt-sources=build/kapt/sources</code></p>
        </td>
    </tr>
    <tr>
        <td><code>classes</code></td>
        <td>생성된 소스에서 컴파일된 <code>.class</code> 파일의 디렉토리입니다.</td>
        <td>
            <p><b>Gradle:</b> 자동으로 관리됨</p>
            <p><b>Maven:</b> 자동으로 관리됨</p>
            <p><b>CLI:</b> <code>-Kapt-classes=build/kapt/classes</code></p>
        </td>
    </tr>
    <tr>
        <td><code>stubs</code></td>
        <td>Kotlin 소스에서 생성된 Java 스텁 파일의 디렉토리로, 어노테이션 프로세서의 입력으로 사용됩니다.</td>
        <td>
            <p><b>Gradle:</b> 자동으로 관리됨</p>
            <p><b>Maven:</b> 자동으로 관리됨</p>
            <p><b>CLI:</b> <code>-Kapt-stubs=build/kapt/stubs</code></p>
        </td>
    </tr>
    <tr>
        <td><code>incrementalData</code></td>
        <td>증분 빌드를 위한 상태를 저장합니다.</td>
        <td>
            <p><b>Gradle:</b> 자동으로 관리됨</p>
            <p><b>Maven:</b> 현재 지원되지 않음</p>
            <p><b>CLI:</b> 현재 지원되지 않음</p>
        </td>
    </tr>
</table>

### 동작 옵션

<table>
    <tr>
        <td>옵션</td>
        <td>설명</td>
        <td>설정 방법</td>
    </tr>
    <tr>
        <td><code>correctErrorTypes</code></td>
        <td>
            기본적으로 kapt는 생성된 클래스의 타입을 포함하여 모든 알 수 없는 타입을 <code>NonExistentClass</code>로 대체합니다.
            스텁에서 오류 타입 추론을 활성화하여 해결되지 않은 오류 타입을 생성된 소스의 타입으로 대체할 수 있습니다.
            <p>기본값: <code>false</code></p>
        </td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    kapt {
                        correctErrorTypes = true
                    }
                </code-block>
            <p><b>Maven:</b></p>
                <code-block lang="xml">
                    <![CDATA[
<correctErrorTypes>true</correctErrorTypes>
                    ]]>
                </code-block>
            <p><b>CLI:</b> <code>-Kapt-correct-error-types=true</code></p>
        </td>
    </tr>
    <tr>
        <td><code>dumpDefaultParameterValues</code></td>
        <td>
            생성된 스텁에 필드 값으로 기본 파라미터 초기화 식을 포함합니다.
            <p>기본값: <code>false</code></p>
        </td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    kapt {
                        dumpDefaultParameterValues = true
                    }
                </code-block>
            <p><b>Maven:</b> 사용 불가</p>
            <p><b>CLI:</b> <code>-Kapt-dump-default-parameter-values=true</code></p>
        </td>
    </tr>
    <tr>
        <td><code>mapDiagnosticLocations</code></td>
        <td>
            스텁 파일의 오류 메시지를 원래의 Kotlin 소스 위치로 매핑합니다.
            <p>기본값: <code>false</code></p>
        </td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    kapt {
                        mapDiagnosticLocations = true
                    }
                </code-block>
            <p><b>Maven:</b></p>
                <code-block lang="xml">
                    <![CDATA[
<mapDiagnosticLocations>true</mapDiagnosticLocations>
                    ]]>
                </code-block>
            <p><b>CLI:</b> <code>-Kapt-map-diagnostic-locations=true</code></p>
        </td>
    </tr>
    <tr>
        <td><code>strict</code></td>
        <td>
            스텁 생성 시 발생하는 비호환성 문제를 경고 대신 오류로 처리합니다.
            <p>기본값: <code>false</code></p>
        </td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    kapt {
                        strictMode = true
                    }
                </code-block>
            <p><b>Maven:</b> 사용 불가</p>
            <p><b>CLI:</b> <code>-Kapt-strict=true</code></p>
        </td>
    </tr>
    <tr>
        <td><code>stripMetadata</code></td>
        <td>
            생성된 스텁에서 <code>@kotlin.Metadata</code> 어노테이션을 제거하여 스텁 크기를 줄이고 프로세서로부터 Kotlin 전용 정보를 숨깁니다.
            <p>기본값: <code>false</code></p>
        </td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    kapt {
                        stripMetadata = true
                    }
                </code-block>
            <p><b>Maven:</b> 사용 불가</p>
            <p><b>CLI:</b> <code>-Kapt-strip-metadata=true</code></p>
        </td>
    </tr>
    <tr>
        <td><code>verbose</code></td>
        <td>
            상세한 kapt 로깅을 활성화합니다.
            <p>기본값: <code>false</code></p>
        </td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    # gradle.properties
                    kapt.verbose=true
                </code-block>
            <p><b>Maven:</b> 현재 지원되지 않음</p>
            <p><b>CLI:</b> 현재 지원되지 않음</p>
        </td>
    </tr>
    <tr>
        <td><code>infoAsWarnings</code></td>
        <td>
            kapt의 정보(info) 레벨 메시지를 경고(warning)로 격상합니다.
            <p>기본값: <code>false</code></p>
        </td>
        <td>
            <p><b>Gradle:</b> 직접 사용할 수 없음</p>
            <p><b>Maven:</b> 현재 지원되지 않음</p>
            <p><b>CLI:</b> 현재 지원되지 않음</p>
        </td>
    </tr>
    <tr>
        <td><code>includeCompileClasspath</code></td>
        <td>
            어노테이션 프로세서를 찾기 위해 컴파일 클래스패스를 스캔합니다. 재현성을 위해 <code>false</code>로 설정하는 것이 좋습니다.
            <p>기본값: <code>true</code></p>
        </td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    kapt {
                        includeCompileClasspath = false
                    }
                </code-block>
            <p><b>Maven:</b></p>
                <code-block lang="xml">
                    <![CDATA[
<includeCompileClasspath>false</includeCompileClasspath>
                    ]]>
                </code-block>
            <p><b>CLI:</b> 현재 지원되지 않음</p>
        </td>
    </tr>
</table>

### 진단 및 통계 옵션

<table>
    <tr>
        <td>옵션</td>
        <td>설명</td>
        <td>설정 방법</td>
    </tr>
    <tr>
        <td><code>showProcessorStats</code></td>
        <td>프로세서별 실행 시간을 표준 출력(stdout)에 출력합니다.</td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    kapt {
                        showProcessorStats = true
                    }
                </code-block>
            <p><b>Maven:</b> 사용 불가</p>
            <p><b>CLI:</b> <code>-Kapt-show-processor-stats=true</code></p>
        </td>
    </tr>
    <tr>
        <td><code>dumpProcessorStats</code></td>
        <td>프로세서 타이밍 통계를 파일에 기록합니다.</td>
        <td>
            <p><b>Gradle:</b> 사용 불가</p>
            <p><b>Maven:</b> 사용 불가</p>
            <p><b>CLI:</b> <code>-Kapt-dump-processor-stats=build/kapt-stats.txt</code></p>
        </td>
    </tr>
    <tr>
        <td><code>dumpFileReadHistory</code></td>
        <td>프로세서가 읽은 파일 목록을 파일에 기록합니다. 증분 어노테이션 프로세서 디버깅에 유용합니다.</td>
        <td>
            <p><b>Gradle:</b> 사용 불가</p>
            <p><b>Maven:</b> 사용 불가</p>
            <p><b>CLI:</b> <code>-Kapt-dump-file-read-history=build/kapt-reads.txt</code></p>
        </td>
    </tr>
    <tr>
        <td><code>detectMemoryLeaks</code></td>
        <td>메모리 누수 감지 모드: <code>none</code>, <code>default</code>, 또는 <code>paranoid</code>.</td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    kapt {
                        detectMemoryLeaks = "paranoid"
                    }
                </code-block>
            <p><b>Maven:</b> 현재 지원되지 않음</p>
            <p><b>CLI:</b> 현재 지원되지 않음</p>
        </td>
    </tr>
</table>

## 다음 단계

* [MapStruct 어노테이션 프로세서와 함께 kapt 사용하기](jvm-annotation-processors.md#use-kapt-with-java-annotation-processors)
* [kapt에서 KSP로 마이그레이션하는 방법 보기](ksp-kapt-migration.md)