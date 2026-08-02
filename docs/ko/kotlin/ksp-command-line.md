[//]: # (title: 커맨드 라인에서 KSP 실행하기)

대부분의 프로젝트는 컴파일 중에 KSP를 자동으로 실행하는 Gradle 플러그인을 통해 KSP를 사용합니다. 커맨드 라인에서 KSP를 사용할 수도 있지만, 보통은 다른 빌드 시스템과 통합하거나, 프로세서를 개발하거나, 테스트 또는 디버깅을 할 때만 사용됩니다.

KSP는 JVM 애플리케이션이므로, 커맨드 라인에서 KSP를 실행하려면 `java` 명령어를 사용하세요. 클래스패스(classpath)와 필요한 인자들을 제공해야 합니다:

```bash
java -cp <classpath> <mainclass> <options> <processor>
```

| 인자            | 설명                                             |
|-----------------|--------------------------------------------------|
| `<classpath>` | KSP 런타임 JAR 및 해당 의존성 경로.              |
| `<mainclass>` | 플랫폼별 KSP 엔트리 포인트 중 하나.             |
| `<options>`   | KSP용 커맨드 라인 옵션.                          |
| `<processor>` | 프로세서 JAR 경로.                               |

## 클래스패스(Classpath)

Gradle 플러그인과 달리 `java` 명령어는 의존성을 자동으로 해결하지 않습니다. 클래스패스에 KSP 런타임 JAR와 그 의존성들을 직접 제공해야 합니다.

[KSP 릴리스 페이지](https://github.com/google/ksp/releases/tag/%kspVersion%)에서 `artifacts.zip`을 다운로드하세요. 이 압축 파일에는 필요한 KSP JAR 파일들이 포함되어 있습니다:

* `symbol-processing-aa-%kspVersion%.jar`

* `symbol-processing-common-deps-%kspVersion%.jar`

* `symbol-processing-api-%kspVersion%.jar`

또한 Maven 저장소에서 다음 런타임 의존성들도 포함해야 합니다:

* [`kotlin-stdlib-%kotlinVersion%.jar`](https://mvnrepository.com/artifact/org.jetbrains.kotlin/kotlin-stdlib)

* [`kotlinx-coroutines-core-jvm-%coroutinesVersion%.jar`](https://mvnrepository.com/artifact/org.jetbrains.kotlinx/kotlinx-coroutines-core-jvm)

## 메인 클래스(Main class)

KSP는 JVM 애플리케이션이므로 실행할 메인 클래스를 지정해야 합니다. KSP는 지원되는 각 플랫폼마다 서로 다른 엔트리 포인트를 제공합니다:

| 엔트리 포인트   | 플랫폼                                                         |
|-----------------|----------------------------------------------------------------|
| `KSPJvmMain`    | Kotlin/JVM 및 Android                                          |
| `KSPJsMain`     | Kotlin/JS                                                      |
| `KSPNativeMain` | iOS, macOS, Linux, Windows와 같은 Kotlin/Native 타겟.         |
| `KSPCommonMain` | Kotlin 멀티플랫폼 프로젝트의 공통 컴파일.                      |

`java`로 KSP를 실행할 때는 전체 패키지 경로를 포함한 클래스 이름(fully qualified class name)을 지정하세요. 예를 들어:

```bash
java -cp <classpath> com.google.devtools.ksp.cmdline.KSPJvmMain <options> <processor>
```

다음 예제는 `KSPJvmMain`을 사용하여 JVM 타겟에 대해 KSP를 실행합니다:

```bash
java -cp \
symbol-processing-aa-%kspVersion%.jar:symbol-processing-common-deps-%kspVersion%.jar:symbol-processing-api-%kspVersion%.jar:kotlin-stdlib-2.3.20.jar:kotlinx-coroutines-core-jvm-1.10.2.jar \
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

## 옵션(Options)

커맨드 라인에서 실행할 때 KSP는 다음과 같은 옵션들을 필요로 합니다:

| 옵션                          | 설명                                                                                                                              |
|-------------------------------|-----------------------------------------------------------------------------------------------------------------------------------|
| `-language-version=<version>` | 프로젝트에서 사용되는 [Kotlin 언어 버전](https://kotlinlang.org/docs/compiler-reference.html#language-version-version).           |
| `-api-version=<version>`      | [Kotlin API 버전](https://kotlinlang.org/docs/compiler-reference.html#api-version-version).                                       |
| `-jvm-target=<version>`       | 타겟 JVM 버전.                                                                                                                    |
| `-module-name=<name>`         | 모듈 이름.                                                                                                                        |
| `-source-roots=<paths>`       | 소스 루트 디렉터리. 여러 디렉터리를 지정하려면 콜론(colon)으로 구분된 목록을 사용하세요.                                          |
| `-project-base-dir=<path>`    | 프로젝트 루트 디렉터리.                                                                                                           |
| `-output-base-dir=<path>`     | KSP 출력의 기본 디렉터리.                                                                                                         |
| `-caches-dir=<path>`          | KSP 캐시 디렉터리.                                                                                                                |
| `-java-output-dir=<path>`     | 생성된 Java 파일용 디렉터리.                                                                                                      |
| `-class-output-dir=<path>`    | 생성된 클래스 파일용 디렉터리.                                                                                                    |
| `-kotlin-output-dir=<path>`   | 생성된 Kotlin 파일용 디렉터리.                                                                                                    |
| `-resource-output-dir=<path>` | 생성된 리소스용 디렉터리.                                                                                                         |
| `<processor>`                 | 프로세서 클래스패스.                                                                                                              |

### 기타 유용한 옵션들

* `-libraries=<path>`: 소스 파일에서 참조하는 의존성을 해결하는 데 사용되는 클래스패스입니다. 일반적으로 모듈의 컴파일 클래스패스입니다.

* `-jdk-home=<path>`: JDK 홈 디렉터리입니다. 프로세서가 Java 심볼을 해결하고 Java 표준 라이브러리에 접근해야 할 때 사용합니다.

* `-friends=<path>`: 현재 모듈의 프렌드 모듈(friend modules) 클래스패스입니다. 이는 일반적으로 모듈의 프렌드 클래스패스입니다. 자세한 내용은 [프렌드 모듈(Friend modules)](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.tasks/-base-kotlin-compile/friend-paths.html)을 참조하세요.

> KSP는 로깅 레벨을 설정하는 `-Dksp.logging` JVM 시스템 속성도 지원합니다. 유효한 값은 `error`, `warn` 또는 `warning`, `info`, `debug`입니다. 기본값은 `warn`입니다. KSP는 지원되지 않는 값을 `warn`으로 처리합니다.
>
{style="tip"}

전체 옵션 목록을 보려면 다음 명령어를 실행하세요:

```bash
java -cp <classpath> <mainclass> -h