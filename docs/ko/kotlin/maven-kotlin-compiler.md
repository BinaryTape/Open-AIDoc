[//]: # (title: Maven 프로젝트용 Kotlin 컴파일러 구성)

`kotlin-maven-plugin`을 사용하면 Maven 프로젝트에 대한 Kotlin 컴파일러를 구성할 수 있습니다.
컴파일러 옵션을 지정하고, 실행 전략을 선택하며, 증분 컴파일(incremental compilation)을 활성화할 수 있습니다.

## 컴파일러 옵션 지정 {id="specify-compiler-options"}

Kotlin Maven 플러그인 노드의 `<configuration>` 섹션에 있는 엘리먼트로 컴파일러에 대한 추가 옵션과 인수를 지정할 수 있습니다:

```xml
<plugin>
    <groupId>org.jetbrains.kotlin</groupId>
    <artifactId>kotlin-maven-plugin</artifactId>
    <version>${kotlin.version}</version>
    <extensions>true</extensions> <!-- 빌드에 execution을 자동으로 추가하도록 설정하려는 경우 -->
    <executions>...</executions>
    <configuration>
        <nowarn>true</nowarn> <!-- 경고 비활성화 -->
        <args>
            <arg>-Xjsr305=strict</arg> <!-- JSR-305 애너테이션에 대한 strict 모드 활성화 -->
            ...
        </args>
    </configuration>
</plugin>
```

대부분의 옵션은 프로퍼티(property)를 통해서도 구성할 수 있습니다:

```xml
<project>
    <properties>
        <kotlin.compiler.languageVersion>%languageVersion%</kotlin.compiler.languageVersion>
    </properties>
</project>
```

지원되는 어트리뷰트는 다음과 같습니다:

### JVM 전용 어트리뷰트 {id="attributes-specific-to-jvm"}

| 이름 | 프로퍼티 이름 | 설명 | 가능한 값 | 기본값 |
|---|---|---|---|---|
| `nowarn` | | 경고를 생성하지 않음 | true, false | false |
| `languageVersion` | `kotlin.compiler.languageVersion` | 지정된 버전의 Kotlin과 소스 호환성 제공 | "2.0", "2.1", "2.2", "2.3", "2.4", "2.5" (EXPERIMENTAL) | |
| `apiVersion` | `kotlin.compiler.apiVersion` | 번들 라이브러리의 지정된 버전에 포함된 선언만 사용하도록 허용 | "2.0", "2.1", "2.2", "2.3", "2.4", "2.5" (EXPERIMENTAL) | |
| `sourceDirs` | | 컴파일할 소스 파일이 포함된 디렉터리 | | 프로젝트 소스 루트 |
| `compilerPlugins` | | 활성화된 컴파일러 플러그인 | | [] |
| `pluginOptions` | | 컴파일러 플러그인용 옵션 | | [] |
| `args` | | 추가 컴파일러 인수 | | [] |
| `jvmTarget` | `kotlin.compiler.jvmTarget` | 생성된 바이트코드의 대상 JVM 버전입니다. 출력물의 바이트코드 버전만 제어하며, 코드에서 사용할 수 있는 JDK API를 제한하지는 않습니다. | "1.8", "9", "10", ..., "26" | "%defaultJvmTargetVersion%" |
| `jdkRelease` | `kotlin.compiler.jdkRelease` | 대상 JVM 버전입니다. 바이트코드 버전을 제어하고 사용 가능한 API를 지정된 JDK 버전으로 제한하여 실수로 더 최신 API를 사용하는 것을 방지합니다. Java의 `--release` 컴파일러 옵션과 동일합니다. | "1.8", "9", "10", ..., "26" | |
| `jdkHome` | `kotlin.compiler.jdkHome` | 기본 `JAVA_HOME` 대신 지정된 위치의 커스텀 JDK를 클래스패스에 포함 | | |
| `jdkToolchain` | `kotlin.compiler.jdkToolchain` | 툴체인에서 사용할 JDK 버전을 설정합니다. Kotlin 컴파일에만 영향을 줍니다 | | |
| `-Xadd-modules` | | (실험적 기능) 초기 모듈 외에 지정된 루트 모듈을 확인(resolve)합니다. 모듈 경로의 모든 모듈을 확인하려면 `ALL-MODULE-PATH` 값을 설정하세요. | `<arg>`를 통해 전달되는 쉼표로 구분된 모듈 이름 또는 `ALL-MODULE-PATH` | |

JVM 전용 옵션들이 서로 어떻게 상호작용하는지 유의하세요:

* `jvmTarget`을 명시적으로 설정하지 않으면 Kotlin Maven 플러그인은 `jdkRelease` 값을 사용하며, `jdkRelease` 역시 설정되지 않은 경우 기본값인 `%defaultJvmTargetVersion%` 버전을 사용합니다.
* 컴파일러가 사용하는 JDK는 `jdkHome` 옵션에 의해 정의됩니다. `jdkHome`을 명시적으로 설정하지 않으면 Kotlin Maven 플러그인은 툴체인의 JDK를 컴파일러에 `jdkHome`으로 전달합니다. `maven-toolchains-plugin` 또는 `jdkToolchain` 옵션에서 [툴체인의 JDK](maven-configure-project.md#set-jdk-version)를 지정할 수 있습니다. 명시적으로 지정한 `jdkHome` 값은 항상 툴체인보다 우선합니다.
* `jdkHome` 옵션과 툴체인 모두 `jvmTarget` 옵션에 영향을 주지 않습니다.

## 실행 전략 선택 {id="choose-execution-strategy"}

<snippet id="maven-configure-execution-strategy">

기본적으로 Maven은 Kotlin 데몬 컴파일러 실행 전략을 사용합니다. "in process" 전략으로 전환하려면 `pom.xml` 파일에 다음 프로퍼티를 설정하세요:

```xml
<properties>
    <kotlin.compiler.daemon>false</kotlin.compiler.daemon>
</properties>
```

</snippet>

다양한 전략에 대한 자세한 내용은 [컴파일러 실행 전략](compiler-execution-strategy.md)을 참조하세요.

## 증분 컴파일 활성화 {id="enable-incremental-compilation"}

빌드 속도를 높이려면 `kotlin.compiler.incremental` 프로퍼티를 추가하여 증분 컴파일을 활성화할 수 있습니다:

```xml
<properties>
    <kotlin.compiler.incremental>true</kotlin.compiler.incremental>
</properties>
```

또는 `-Dkotlin.compiler.incremental=true` 옵션과 함께 빌드를 실행할 수도 있습니다.

## 사용 가능한 골(goal) 및 파라미터 확인 {id="explore-available-goals-and-parameters"}

IDE에서는 `pom.xml` 파일의 Kotlin Maven 플러그인 선언에서 생성된 플러그인 디스크립터(plugin descriptor)로 이동할 수 있으며, 여기에는 사용 가능한 골(goal) 및 해당 파라미터에 대한 정보가 포함되어 있습니다.

명령줄에서 표준 Maven Help 플러그인을 사용하여 이 정보를 확인할 수도 있습니다.
프로젝트의 `pom.xml` 파일이 있는 디렉터리에서 다음 명령을 실행합니다:

```bash
mvn help:describe \
  -Dplugin=org.jetbrains.kotlin:kotlin-maven-plugin \
  -Ddetail=true
```

출력 결과에는 사용 가능한 모든 골과 파라미터에 대한 상세 정보가 나열됩니다.

특정 골에 대한 설명을 확인하려면 `-Dgoal` 옵션을 추가합니다. 예를 들어 `compile` 골의 경우 다음과 같이 실행합니다:

```bash
mvn help:describe \
  -Dplugin=org.jetbrains.kotlin:kotlin-maven-plugin \
  -Ddetail=true \
  -Dgoal=compile
```

## 다음 단계 {id="what-s-next"}

[프로젝트 패키징](maven-compile-package.md)