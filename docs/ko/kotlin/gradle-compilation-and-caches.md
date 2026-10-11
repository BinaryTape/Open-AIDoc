[//]: # (title: Kotlin Gradle 플러그인의 컴파일 및 캐시)

이 페이지에서는 다음 주제에 대해 알아볼 수 있습니다:
* [증분 컴파일](#incremental-compilation)
* [Gradle 빌드 캐시 지원](#gradle-build-cache-support)
* [Gradle 구성 캐시 지원](#gradle-configuration-cache-support)
* [Kotlin 데몬 및 Gradle과 함께 사용하는 방법](#the-kotlin-daemon-and-how-to-use-it-with-gradle)
* [이전 컴파일러로 롤백하기](#rolling-back-to-the-previous-compiler)
* [Kotlin 컴파일러 실행 전략 정의하기](compiler-execution-strategy.md)
* [Kotlin 컴파일러 폴백 전략](compiler-execution-strategy.md#fallback-strategy)
* [최신 언어 버전 사용해 보기](#trying-the-latest-language-version)
* [빌드 리포트](#build-reports)

## 증분 컴파일 {id="incremental-compilation"}

Kotlin Gradle 플러그인은 증분 컴파일(incremental compilation)을 지원하며, 이는 Kotlin/JVM 및 Kotlin/JS 프로젝트에서 기본적으로 활성화되어 있습니다.
증분 컴파일은 빌드 간의 클래스패스 파일 변경 사항을 추적하여 이러한 변경의 영향을 받는
파일만 컴파일하도록 합니다.
이 방식은 [Gradle의 빌드 캐시](#gradle-build-cache-support)와 함께 작동하며 [컴파일 회피(compilation avoidance)](https://docs.gradle.org/current/userguide/java_plugin.html#sec:java_compile_avoidance)를 지원합니다.

Kotlin/JVM의 경우 증분 컴파일은 모듈의 API 구조를 캡처하여 재컴파일이 필요한 시점을 결정하는
클래스패스 스냅샷(classpath snapshot)에 의존합니다.
전체 파이프라인을 최적화하기 위해 Kotlin 컴파일러는 두 가지 유형의 클래스패스 스냅샷을 사용합니다:

* **세분화된 스냅샷(Fine-grained snapshots):** 프로퍼티나 함수와 같은 클래스 멤버에 대한 상세 정보를 포함합니다.
멤버 수준의 변경이 감지되면 Kotlin 컴파일러는 수정된 멤버에 의존하는 클래스만 재컴파일합니다.
성능 유지를 위해 Kotlin Gradle 플러그인은 Gradle 캐시의 `.jar` 파일에 대해 대략적인 스냅샷을 생성합니다.
* **대략적인 스냅샷(Coarse-grained snapshots):** 클래스 [ABI](https://en.wikipedia.org/wiki/Application_binary_interface) 해시만 포함합니다.
ABI의 일부가 변경되면 Kotlin 컴파일러는 변경된 클래스에 의존하는 모든 클래스를 재컴파일합니다.
이는 외부 라이브러리와 같이 자주 변경되지 않는 클래스에 유용합니다.

> Kotlin/JS 프로젝트는 이력 파일을 기반으로 하는 다른 증분 컴파일 방식을 사용합니다.
>
{style="note"}

증분 컴파일을 비활성화하는 방법에는 여러 가지가 있습니다:

* Kotlin/JVM의 경우 `kotlin.incremental=false` 설정.
* Kotlin/JS 프로젝트의 경우 `kotlin.incremental.js=false` 설정.
* 커맨드 라인 인수로 `-Pkotlin.incremental=false` 또는 `-Pkotlin.incremental.js=false` 사용.

  이 인수는 이후의 각 빌드마다 추가되어야 합니다.

증분 컴파일을 비활성화하면 빌드 후 증분 캐시가 유효하지 않게 됩니다. 첫 번째 빌드는 절대로 증분 빌드가 되지 않습니다.

> 종종 증분 컴파일 관련 문제는 오류가 발생한 후 몇 차례 빌드가 지난 뒤에야 나타나기도 합니다. [빌드 리포트](#build-reports)를
> 사용하여 변경 사항 및 컴파일 이력을 추적하세요. 재현 가능한 버그 리포트를 제공하는 데 도움이 됩니다.
>
{style="tip"}

현재의 증분 컴파일 방식이 어떻게 작동하며 이전 방식과 어떻게 다른지 자세히 알아보려면
[블로그 게시물](https://blog.jetbrains.com/kotlin/2022/07/a-new-approach-to-incremental-compilation-in-kotlin/)을 참조하세요.

## Gradle 빌드 캐시 지원 {id="gradle-build-cache-support"}

Kotlin 플러그인은 빌드 출력을 저장하여 향후 빌드에서 재사용할 수 있도록 지원하는 [Gradle 빌드 캐시](https://docs.gradle.org/current/userguide/build_cache.html)를 사용합니다.

모든 Kotlin 태스크에 대해 캐싱을 비활성화하려면 시스템 프로퍼티 `kotlin.caching.enabled`를 `false`로 설정하세요
(`-Dkotlin.caching.enabled=false` 인수를 사용하여 빌드 실행).

## Gradle 구성 캐시 지원 {id="gradle-configuration-cache-support"}

Kotlin 플러그인은 구성 단계(configuration phase)의 결과를 이후 빌드에서 재사용하여 빌드 프로세스 속도를 높여주는
[Gradle 구성 캐시(configuration cache)](https://docs.gradle.org/current/userguide/configuration_cache.html)를 사용합니다.

구성 캐시를 활성화하는 방법은 [Gradle 문서](https://docs.gradle.org/current/userguide/configuration_cache.html#config_cache:usage)를
참조하세요. 이 기능을 활성화하면 Kotlin Gradle 플러그인이 자동으로
이를 사용하기 시작합니다.

## Kotlin 데몬 및 Gradle과 함께 사용하는 방법 {id="the-kotlin-daemon-and-how-to-use-it-with-gradle"}

[Kotlin 데몬(daemon)](kotlin-daemon.md)은 다음과 같이 동작합니다:
* 프로젝트 컴파일을 위해 Gradle 데몬과 함께 실행됩니다.
* IntelliJ IDEA 내장 빌드 시스템으로 프로젝트를 컴파일할 때는 Gradle 데몬과 별도로 실행됩니다.

Kotlin 데몬은 Kotlin 컴파일 태스크 중 하나가 소스 컴파일을 시작할 때 Gradle [실행 단계(execution stage)](https://docs.gradle.org/current/userguide/build_lifecycle.html#sec:build_phases)에서 시작됩니다.
Kotlin 데몬은 Gradle 데몬과 함께 중지되거나, Kotlin 컴파일 없이 유휴 상태로 2시간이 지나면 중지됩니다.

Kotlin 데몬은 Gradle 데몬과 동일한 JDK를 사용합니다.

### Kotlin 데몬의 JVM 인수 설정 {id="setting-kotlin-daemon-s-jvm-arguments"}

인수를 설정하는 각 방법은 이전에 설정된 방식을 덮어씁니다(override):
* [Gradle 데몬 인수 상속](#gradle-daemon-arguments-inheritance)
* [`kotlin.daemon.jvm.options` 시스템 프로퍼티](#kotlin-daemon-jvm-options-system-property)
* [`kotlin.daemon.jvmargs` 프로퍼티](#kotlin-daemon-jvmargs-property)
* [`kotlin` 확장](#kotlin-extension)
* [특정 태스크 정의](#specific-task-definition)

#### Gradle 데몬 인수 상속 {id="gradle-daemon-arguments-inheritance"}

기본적으로 Kotlin 데몬은 Gradle 데몬에서 특정 인수 집합을 상속받지만, 
Kotlin 데몬에 직접 지정된 JVM 인수가 있는 경우 이를 덮어씁니다. 예를 들어, `gradle.properties` 파일에 다음 JVM 인수를 추가하는 경우:

```none
org.gradle.jvmargs=-Xmx1500m -Xms500m -XX:MaxMetaspaceSize=1g
```

이 인수들은 Kotlin 데몬의 JVM 인수에 다음과 같이 추가됩니다:

```none
-Xmx1500m -XX:ReservedCodeCacheSize=320m -XX:MaxMetaspaceSize=1g -XX:UseParallelGC -ea -XX:+UseCodeCacheFlushing -XX:+HeapDumpOnOutOfMemoryError -Djava.awt.headless=true -Djava.rmi.server.hostname=127.0.0.1 --add-exports=java.base/sun.nio.ch=ALL-UNNAMED
```

> JVM 인수를 다루는 Kotlin 데몬의 기본 동작에 대해 자세히 알아보려면 [JVM 인수를 다루는 Kotlin 데몬의 동작 방식](#kotlin-daemon-s-behavior-with-jvm-arguments)을 참조하세요.
>
{style="note"}

#### kotlin.daemon.jvm.options 시스템 프로퍼티 {id="kotlin-daemon-jvm-options-system-property"}

Gradle 데몬의 JVM 인수에 `kotlin.daemon.jvm.options` 시스템 프로퍼티가 있는 경우, `gradle.properties` 파일에서 다음과 같이 사용합니다:

```none
org.gradle.jvmargs=-Dkotlin.daemon.jvm.options=-Xmx1500m,Xms500m
```

인수를 전달할 때는 다음 규칙을 따르세요:
* 마이너스 기호 `-`는 `Xmx`, `XX:MaxMetaspaceSize`, `XX:ReservedCodeCacheSize` 인수 앞에**만** 사용하세요.
* 인수는 공백 _없이_ 쉼표(`,`)로 구분하세요. 공백 뒤에 오는 인수는 Kotlin 데몬이 아닌 Gradle 데몬에 사용됩니다.

> 다음 조건이 모두 충족되면 Gradle은 이러한 프로퍼티를 무시합니다:
> * Gradle이 JDK 1.9 이상을 사용 중인 경우.
> * Gradle 버전이 7.0 이상 7.1.1 이하인 경우.
> * Gradle이 Kotlin DSL 스크립트를 컴파일하는 중인 경우.
> * Kotlin 데몬이 실행되고 있지 않은 경우.
>
> 이 문제를 해결하려면 Gradle을 7.2 이상 버전으로 업그레이드하거나 `kotlin.daemon.jvmargs` 프로퍼티를 사용하세요(다음 섹션 참조).
>
{style="warning"}

#### kotlin.daemon.jvmargs 프로퍼티 {id="kotlin-daemon-jvmargs-property"}

`gradle.properties` 파일에 `kotlin.daemon.jvmargs` 프로퍼티를 추가할 수 있습니다:

```none
kotlin.daemon.jvmargs=-Xmx1500m -Xms500m
```

여기나 Gradle의 JVM 인수에 `ReservedCodeCacheSize` 인수를 지정하지 않으면 Kotlin Gradle 플러그인이 기본값인 `320m`을 적용한다는 점에 유의하세요:

```none
-Xmx1500m -XX:ReservedCodeCacheSize=320m -Xms500m
```

#### kotlin 확장 {id="kotlin-extension"}

`kotlin` 확장에서 인수를 지정할 수 있습니다:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    kotlinDaemonJvmArgs = listOf("-Xmx486m", "-Xms256m", "-XX:+UseParallelGC")
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    kotlinDaemonJvmArgs = ["-Xmx486m", "-Xms256m", "-XX:+UseParallelGC"]
}
```

</tab>
</tabs>

#### 특정 태스크 정의 {id="specific-task-definition"}

특정 태스크에 대한 인수를 지정할 수 있습니다:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
tasks.withType<CompileUsingKotlinDaemon>().configureEach {
    kotlinDaemonJvmArguments.set(listOf("-Xmx486m", "-Xms256m", "-XX:+UseParallelGC"))
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
tasks.withType(CompileUsingKotlinDaemon).configureEach { task ->
    task.kotlinDaemonJvmArguments = ["-Xmx1g", "-Xms512m"]
}
```

</tab>
</tabs>

> 이 경우, 태스크 실행 시 새로운 Kotlin 데몬 인스턴스가 시작될 수 있습니다. 자세한 내용은 [JVM 인수를 다루는 Kotlin 데몬의 동작 방식](#kotlin-daemon-s-behavior-with-jvm-arguments)을 참조하세요.
>
{style="note"}

### JVM 인수를 다루는 Kotlin 데몬의 동작 방식 {id="kotlin-daemon-s-behavior-with-jvm-arguments"}

Kotlin 데몬의 JVM 인수를 구성할 때 다음 사항에 유의하세요:

* 서로 다른 서브프로젝트나 태스크가 서로 다른 JVM 인수 집합을 가질 때 여러 Kotlin 데몬 인스턴스가 동시에 실행되는 것은 정상적인 동작입니다.
* 새로운 Kotlin 데몬 인스턴스는 Gradle이 관련 컴파일 태스크를 실행하고 기존 Kotlin 데몬에 동일한 JVM 인수 집합이 없는 경우에만 시작됩니다.
  프로젝트에 서브프로젝트가 많다고 가정해 보겠습니다. 대부분은 Kotlin 데몬에 약간의 힙 메모리만 필요하지만, 한 모듈에는 많은 메모리가 필요합니다(비록 자주 컴파일되지는 않더라도).
  이 경우 해당 모듈에 대해 서로 다른 JVM 인수 집합을 제공하면, 해당 모듈을 직접 다루는 개발자에게만 더 큰 힙 크기를 가진 Kotlin 데몬이 시작됩니다.
  > 컴파일 요청을 처리하기에 충분한 힙 크기를 가진 Kotlin 데몬이 이미 실행 중인 경우,
  > 요청된 다른 JVM 인수가 다르더라도 새 데몬을 시작하는 대신 기존 데몬이 재사용됩니다.
  >
  {style="note"}

다음 인수가 지정되지 않은 경우 Kotlin 데몬은 Gradle 데몬으로부터 해당 인수를 상속받습니다:

* `-Xmx`
* `-XX:MaxMetaspaceSize`
* `-XX:ReservedCodeCacheSize`. 지정되지 않았거나 상속받지 않은 경우 기본값은 `320m`입니다.

Kotlin 데몬에는 다음과 같은 기본 JVM 인수가 적용됩니다:
* `-XX:UseParallelGC`. 이 인수는 다른 가비지 컬렉터가 지정되지 않은 경우에만 적용됩니다.
* `-ea`
* `-XX:+UseCodeCacheFlushing`
* `-Djava.awt.headless=true`
* `-D{java.servername.property}={localhostip}`
* `--add-exports=java.base/sun.nio.ch=ALL-UNNAMED`. 이 인수는 JDK 16 이상 버전에만 적용됩니다.

> Kotlin 데몬의 기본 JVM 인수 목록은 버전에 따라 다를 수 있습니다. [VisualVM](https://visualvm.github.io/)과 같은 도구를 사용하여 Kotlin 데몬과 같이 실행 중인 JVM 프로세스의 실제 설정을 확인할 수 있습니다.
>
{style="note"}

## 이전 컴파일러로 롤백하기 {id="rolling-back-to-the-previous-compiler"}

Kotlin 2.0.0부터는 K2 컴파일러가 기본적으로 사용됩니다.

Kotlin 2.0.0–2.3.21에서 이전 컴파일러를 사용하려면 다음 중 하나를 수행하세요:

* `build.gradle.kts` 파일에서 [언어 버전을 1.9로 설정](gradle-compiler-options.md#example-of-setting-languageversion)합니다.

  또는
* 다음 컴파일러 옵션을 사용합니다: `-language-version 1.9`.

Kotlin 2.4.0부터는 이전 컴파일러로 롤백할 수 없습니다.

K2 컴파일러의 이점에 대해 자세히 알아보려면 [K2 컴파일러 마이그레이션 가이드](k2-compiler-migration-guide.md)를 참조하세요.

## 최신 언어 버전 사용해 보기 {id="trying-the-latest-language-version"}

Kotlin 2.0.0부터 최신 언어 버전을 사용해 보려면 `gradle.properties` 파일에 `kotlin.experimental.tryNext` 프로퍼티를 설정하세요.
이 프로퍼티를 사용하면 Kotlin Gradle 플러그인이 사용 중인 Kotlin 버전의 기본값보다 하나 높은 언어 버전으로 증가시킵니다.
예를 들어 Kotlin 2.0.0에서 기본 언어 버전은 2.0이므로 이 프로퍼티는 언어 버전을 2.1로 구성합니다.

또는 다음 명령어를 실행할 수도 있습니다:

```shell
./gradlew assemble -Pkotlin.experimental.tryNext=true
``` 

[빌드 리포트](#build-reports)에서 각 태스크를 컴파일하는 데 사용된 언어 버전을 확인할 수 있습니다.

## 빌드 리포트 {id="build-reports"}

빌드 리포트에는 다양한 컴파일 단계의 소요 시간과 증분 컴파일이 불가능했던 이유가 포함됩니다.
컴파일 시간이 너무 오래 걸리거나 동일한 프로젝트에서 컴파일 시간이 일정하지 않은 경우 성능 문제를 조사하는 데 빌드 리포트를 사용하세요.

Kotlin 빌드 리포트를 사용하면 단일 Gradle 태스크를 세분성 단위로 사용하는 [Gradle build scan](https://scans.gradle.com/)보다 빌드 성능 문제를 더 효율적으로 조사할 수 있습니다.

장시간 실행되는 컴파일에 대해 빌드 리포트를 분석하여 해결할 수 있는 두 가지 일반적인 사례는 다음과 같습니다:
* 빌드가 증분으로 진행되지 않은 경우. 이유를 분석하고 근본적인 문제를 해결합니다.
* 빌드가 증분으로 진행되었지만 시간이 너무 오래 걸린 경우. 소스 파일 재구성을 시도해 보세요 — 큰 파일 분할,
  별도 클래스를 서로 다른 파일에 저장, 대규모 클래스 리팩터링, 최상위 함수를 서로 다른 파일에 선언하기 등.

빌드 리포트에는 프로젝트에 사용된 Kotlin 버전도 표시됩니다. 또한 Kotlin 1.9.0부터는
[Gradle build scan](https://scans.gradle.com/)에서 코드를 컴파일하는 데 사용된 컴파일러를 확인할 수 있습니다.

[빌드 리포트를 읽는 방법](https://blog.jetbrains.com/kotlin/2022/06/introducing-kotlin-build-reports/#how_to_read_build_reports)과 
[JetBrains에서 빌드 리포트를 활용하는 방법](https://blog.jetbrains.com/kotlin/2022/06/introducing-kotlin-build-reports/#how_we_use_build_reports_in_jetbrains)에 대해 알아보세요.

### 빌드 리포트 활성화 {id="enabling-build-reports"}

빌드 리포트를 활성화하려면 `gradle.properties`에 빌드 리포트 출력을 저장할 위치를 선언하세요:

```none
kotlin.build.report.output=file
```

출력에 사용할 수 있는 값과 조합은 다음과 같습니다:

| 옵션            | 설명                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
|---------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `file`        | 사람이 읽을 수 있는 형식으로 빌드 리포트를 로컬 파일에 저장합니다. 기본값은 `${project_folder}/build/reports/kotlin-build/${project_name}-timestamp.txt`입니다.                                                                                                                                                                                                                                                                                                                                             |
| `single_file` | 객체 형식의 빌드 리포트를 지정된 로컬 파일에 저장합니다.                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `build_scan`  | [build scan](https://scans.gradle.com/)의 `custom values` 섹션에 빌드 리포트를 저장합니다. Gradle Enterprise 플러그인은 커스텀 값의 수와 길이를 제한한다는 점에 유의하세요. 대규모 프로젝트에서는 일부 값이 유실될 수 있습니다.                                                                                                                                                                                                                                                                |
| `http`        | HTTP(S)를 사용하여 빌드 리포트를 전송합니다. POST 메서드는 메트릭을 JSON 형식으로 전송합니다. 전송되는 데이터의 현재 버전은 [Kotlin 리포지토리](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-plugin/src/common/kotlin/org/jetbrains/kotlin/gradle/report/data/GradleCompileStatisticsData.kt)에서 확인할 수 있습니다. HTTP 엔드포인트 샘플은 [이 블로그 게시물](https://blog.jetbrains.com/kotlin/2022/06/introducing-kotlin-build-reports/#enable_build_reports)에서 확인할 수 있습니다. |
| `json`        | JSON 형식의 빌드 리포트를 로컬 파일에 저장합니다. 기본값은 `${project_folder}/build/reports/kotlin-build/${project_name}-build-<date-time>-<index>.json`입니다.                                                                                                                                                                                                                                                                                                                                       |

다음은 `kotlin.build.report`에 사용할 수 있는 옵션 목록입니다:

```none
# 필수 출력 설정. 어떤 조합이든 허용됩니다.
kotlin.build.report.output=file,single_file,http,build_scan,json

# single_file 출력을 사용하는 경우 필수입니다. 리포트를 저장할 위치
# 지원 중단된 `kotlin.internal.single.build.metrics.file` 프로퍼티 대신 사용하세요.
kotlin.build.report.single_file=my/directory/path/some_filename

# 선택 사항. 파일 기반 또는 JSON 리포트의 출력 디렉터리입니다. 기본값: build/reports/kotlin-build/
kotlin.build.report.file.output_dir=kotlin-reports

# 선택 사항. 빌드 리포트를 식별하기 위한 라벨입니다(예: 디버그 파라미터)
kotlin.build.report.label=some_label
```

HTTP에만 적용되는 옵션:

```none
# 필수. HTTP(S) 기반 리포트를 전송할 위치
kotlin.build.report.http.url=http://127.0.0.1:8080

# 선택 사항. HTTP 엔드포인트에 인증이 필요한 경우의 사용자 이름 및 비밀번호
kotlin.build.report.http.user=someUser
kotlin.build.report.http.password=somePassword

# 선택 사항. 빌드 리포트에 빌드의 Git 브랜치 이름을 추가할지 여부
kotlin.build.report.http.include_git_branch.name=true|false

# 선택 사항. 빌드 리포트에 컴파일러 인수를 추가할지 여부
# 프로젝트에 모듈이 많은 경우 리포트의 컴파일러 인수가 너무 비대해져 크게 도움이 되지 않을 수 있습니다.
kotlin.build.report.include_compiler_arguments=true|false
```

### 커스텀 값 제한 {id="limit-of-custom-values"}

빌드 스캔 통계를 수집하기 위해 Kotlin 빌드 리포트는 [Gradle의 커스텀 값(custom values)](https://docs.gradle.com/enterprise/tutorials/extending-build-scans/)을 사용합니다.
사용자와 다양한 Gradle 플러그인 모두 커스텀 값에 데이터를 기록할 수 있습니다. 커스텀 값의 수에는 제한이 있습니다.
현재 최대 커스텀 값 개수는 [Build scan 플러그인 문서](https://docs.gradle.com/enterprise/gradle-plugin/#adding_custom_values)에서 확인하세요.

대규모 프로젝트의 경우 이러한 커스텀 값의 수가 상당히 많아질 수 있습니다. 이 수가 제한을 초과하면 
로그에 다음 메시지가 표시될 수 있습니다:

```text
Maximum number of custom values (1,000) exceeded
```

Kotlin 플러그인이 생성하는 커스텀 값의 수를 줄이려면 `gradle.properties`에서 다음 프로퍼티를 사용할 수 있습니다:

```none
kotlin.build.report.build_scan.custom_values_limit=500
```

### 프로젝트 및 시스템 프로퍼티 수집 끄기 {id="switching-off-collecting-project-and-system-properties"}

HTTP 빌드 통계 로그에는 일부 프로젝트 및 시스템 프로퍼티가 포함될 수 있습니다. 이러한 프로퍼티는 빌드 동작을 변경할 수 있으므로 
빌드 통계에 기록해 두면 유용합니다. 
그러나 이러한 프로퍼티에는 비밀번호나 프로젝트의 전체 경로와 같은 민감한 데이터가 포함될 수 있습니다.

`gradle.properties`에 `kotlin.build.report.http.verbose_environment` 프로퍼티를 추가하여
이러한 통계 수집을 비활성화할 수 있습니다.

> JetBrains는 이러한 통계를 수집하지 않습니다. [리포트를 저장할 위치](#enabling-build-reports)는 사용자가 직접 선택합니다.
> 
{style="note"}

## 다음 단계 {id="what-s-next"}

다음에 대해 자세히 알아볼 수 있습니다:
* [Gradle 기본 사항 및 세부 정보](https://docs.gradle.org/current/userguide/userguide.html).
* [Gradle 플러그인 변형(variants) 지원](gradle-plugin-variants.md).
* [컴파일러 실행 전략](compiler-execution-strategy.md)