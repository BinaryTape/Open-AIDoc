[//]: # (title: 명령줄에서 KSP 실행하기)

<web-summary>Gradle용 KSP 플러그인 없이 명령줄에서 KSP를 실행하는 방법을 알아봅니다.</web-summary>

대부분의 프로젝트에서는 컴파일 중에 KSP를 자동으로 실행해 주는 [Gradle용 KSP 플러그인](https://central.sonatype.com/artifact/com.google.devtools.ksp/com.google.devtools.ksp.gradle.plugin)을 통해 KSP를 사용합니다. 대안으로 명령줄(커맨드 라인)에서 직접 KSP를 실행할 수도 있습니다. 이는 KSP를 다른 빌드 시스템과 연동하거나, 프로세서를 개발하거나, 코드를 테스트하고 디버깅할 때 유용합니다.

KSP는 JVM 애플리케이션이므로 `java` 명령을 사용하여 명령줄에서 KSP를 실행합니다. 클래스패스(classpath)와 필요한 인수를 전달합니다:

```bash
java -cp <classpath> <mainclass> <options> <processor>
```

| 인수          | 설명                                                                      |
|---------------|---------------------------------------------------------------------------|
| `<classpath>` | [KSP 런타임 JAR 파일](#classpath) 및 해당 의존성의 경로입니다.            |
| `<mainclass>` | 플랫폼별 KSP [진입점(Entry point)](#main-class)입니다.                    |
| `<options>`   | KSP용 명령줄 [옵션](#options)입니다.                                      |
| `<processor>` | 프로세서 JAR 파일의 경로입니다.                                           |

## 클래스패스 {id="classpath"}

Gradle용 KSP 플러그인과 달리, `java` 명령은 의존성을 자동으로 해결하지 않습니다. 클래스패스에 KSP 런타임 JAR 파일과 해당 의존성을 직접 제공해야 합니다.

GitHub의 [KSP 릴리스 페이지](https://github.com/google/ksp/releases/tag/%kspVersion%)에서 `artifacts.zip`을 다운로드합니다. 이 압축 파일에는 필요한 KSP JAR 파일들이 포함되어 있습니다:

* `symbol-processing-aa-%kspVersion%.jar`
* `symbol-processing-common-deps-%kspVersion%.jar`
* `symbol-processing-api-%kspVersion%.jar`

또한 Maven 저장소에서 다음 런타임 의존성도 포함해야 합니다:

* [`kotlin-stdlib-%kotlinVersion%.jar`](https://mvnrepository.com/artifact/org.jetbrains.kotlin/kotlin-stdlib)
* [`kotlinx-coroutines-core-jvm-%coroutinesVersion%.jar`](https://mvnrepository.com/artifact/org.jetbrains.kotlinx/kotlinx-coroutines-core-jvm)

## 메인 클래스 {id="main-class"}

KSP는 JVM 애플리케이션이므로 실행할 메인 클래스를 지정해야 합니다. KSP는 지원되는 각 플랫폼마다 서로 다른 진입점을 제공합니다:

| 진입점            | 플랫폼                                                          |
| ----------------- | --------------------------------------------------------------- |
| `KSPJvmMain`      | Kotlin/JVM 및 Android                                           |
| `KSPJsMain`       | Kotlin/JS                                                       |
| `KSPNativeMain`   | iOS, macOS, Linux, Windows와 같은 Kotlin/Native 타깃            |
| `KSPCommonMain`   | Kotlin Multiplatform 프로젝트의 공통 컴파일                      |

`java`로 KSP를 실행할 때는 정규화된 클래스 이름(FQCN)을 지정합니다. 예:

```bash
java -cp <classpath> com.google.devtools.ksp.cmdline.KSPJvmMain <options> <processor>
```

다음 예제는 `KSPJvmMain`을 사용하여 JVM 타깃용 KSP를 실행합니다:

```bash
java -cp \
symbol-processing-aa-%kspVersion%.jar:\
symbol-processing-common-deps-%kspVersion%.jar:\
symbol-processing-api-%kspVersion%.jar:\
kotlin-stdlib-%kotlinVersion%.jar:\
kotlinx-coroutines-core-jvm-%coroutinesVersion%.jar \
com.google.devtools.ksp.cmdline.KSPJvmMain \
-language-version=2.0 \
-api-version=2.0 \
-jvm-target=11 \
-module-name=main \
-source-roots=project_dir/src/kotlin/main \
-project-base-dir=project_dir/ \
-output-base-dir=project_dir/build/ \
-caches-dir=project_dir/build/caches/ \
-class-output-dir=project_dir/build/out/main/classes \
-kotlin-output-dir=project_dir/build/out/main/kotlin/ \
-java-output-dir=project_dir/build/out/main/java/ \
-resource-output-dir=project_dir/build/out/main/res/ \
path/to/processor.jar
```

## 옵션 {id="options"}

`KSPJvmMain` 진입점에는 다음 옵션이 필요합니다:

| 옵션                          | 설명                                                                                           |
|-------------------------------|------------------------------------------------------------------------------------------------|
| `-language-version=<version>` | 프로젝트에서 사용되는 [Kotlin 언어 버전](compiler-reference.md#language-version-version)입니다. |
| `-api-version=<version>`      | [Kotlin API 버전](compiler-reference.md#api-version-version)입니다.                            |
| `-jvm-target=<version>`       | 타깃 JVM 버전입니다.                                                                           |
| `-module-name=<name>`         | 모듈 이름입니다.                                                                               |
| `-source-roots=<paths>`       | 소스 루트 디렉터리입니다. 여러 디렉터리를 지정할 때는 콜론(`:`)으로 구분합니다.                |
| `-project-base-dir=<path>`    | 프로젝트 루트 디렉터리입니다.                                                                  |
| `-output-base-dir=<path>`     | KSP 출력 기본 디렉터리입니다.                                                                  |
| `-caches-dir=<path>`          | KSP 캐시 디렉터리입니다.                                                                       |
| `-java-output-dir=<path>`     | 생성된 Java 파일용 디렉터리입니다.                                                             |
| `-class-output-dir=<path>`    | 생성된 클래스 파일용 디렉터리입니다.                                                           |
| `-kotlin-output-dir=<path>`   | 생성된 Kotlin 파일용 디렉터리입니다.                                                           |
| `-resource-output-dir=<path>` | 생성된 리소스용 디렉터리입니다.                                                                |
| `<processor>`                 | 프로세서 클래스패스입니다.                                                                      |

다른 진입점들은 서로 다른 옵션 구성을 사용합니다. 특정 진입점의 전체 옵션 목록을 확인하려면 다음 명령을 실행하세요:

```bash
java -cp <classpath> <mainclass> -h
```

### 기타 옵션 {id="other-options"}

* `-libraries=<path>`: 소스 파일에서 참조하는 의존성을 해결하는 데 사용되는 클래스패스입니다. 일반적으로 모듈의 컴파일 클래스패스입니다.
* `-jdk-home=<path>`: JDK 홈 디렉터리입니다. 프로세서가 Java 심볼을 해석하고 Java 표준 라이브러리에 접근해야 할 때 사용합니다.
* `-friends=<path>`: 현재 모듈의 프렌드(friend) 모듈의 클래스패스입니다. 자세한 내용은 Kotlin Gradle 플러그인 API 레퍼런스의 [`friendPaths` 프로퍼티](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.tasks/-base-kotlin-compile/friend-paths.html)를 참고하세요.

> `-Dksp.logging` JVM 시스템 프로퍼티를 사용하여 로깅 레벨을 설정할 수도 있습니다. 유효한 값은 `error`, `warn`(또는 `warning`), `info`, `debug`입니다. 그 외의 값은 `warn`으로 처리됩니다. 기본값은 `warn`입니다.
>
{style="note"}

## 함께 보기 {id="see-also"}

* [증분 처리(Incremental processing)](ksp-incremental.md)의 동작 방식과 명령줄에서 이를 디버깅하는 방법을 알아보세요.
* Gradle을 사용하여 [Kotlin Multiplatform 프로젝트에서 KSP를 사용하는 방법](ksp-multiplatform.md)을 알아보세요.