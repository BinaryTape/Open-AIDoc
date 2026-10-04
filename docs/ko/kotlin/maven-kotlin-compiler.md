[//]: # (title: Maven 프로젝트용 Kotlin 컴파일러 구성)

`kotlin-maven-plugin`을 사용하면 Maven 프로젝트용 Kotlin 컴파일러를 구성할 수 있습니다.
컴파일러 옵션을 지정하고, 실행 전략을 선택하며, 증분 컴파일(incremental compilation)을 활성화할 수 있습니다.

## 컴파일러 옵션 지정 {id="specify-compiler-options"}

Kotlin Maven 플러그인 노드의 `<configuration>` 섹션에 컴파일러를 위한 추가 옵션 및 인수를 엘리먼트로 지정할 수 있습니다:

```xml
<plugin>
    <groupId>org.jetbrains.kotlin</groupId>
    <artifactId>kotlin-maven-plugin</artifactId>
    <version>${kotlin.version}</version>
    <extensions>true</extensions> <!-- 빌드에 실행(execution)을 자동으로 추가하도록 설정하려는 경우 -->
    <executions>...</executions>
    <configuration>
        <nowarn>true</nowarn> <!-- 경고 비활성화 -->
        <args>
            <arg>-Xjsr305=strict</arg> <!-- JSR-305 어노테이션에 대한 엄격(strict) 모드 활성화 -->
            ...
        </args>
    </configuration>
</plugin>
```

이러한 옵션 중 다수는 프로퍼티(property)를 통해서도 구성할 수 있습니다:

```xml
<project>
    <properties>
        <kotlin.compiler.languageVersion>%languageVersion%</kotlin.compiler.languageVersion>
    </properties>
</project>
```

다음 어트리뷰트가 지원됩니다:

### JVM 전용 어트리뷰트 {id="attributes-specific-to-jvm"}

| 이름 | 프로퍼티 이름 | 설명 | 가능한 값 | 기본값 |
|-------------------|-----------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------|-----------------------------|
| `nowarn`          |                                   | 경고를 생성하지 않음                                                                                                                                                                                    | true, false                                                              | false                       |
| `languageVersion` | `kotlin.compiler.languageVersion` | 지정된 버전의 Kotlin과의 소스 호환성 제공                                                                                                                                                               | "2.0", "2.1", "2.2", "2.3", "2.4", "2.5" (EXPERIMENTAL)                  |                             |
| `apiVersion`      | `kotlin.compiler.apiVersion`      | 번들 라이브러리의 지정된 버전에서만 선언(declaration)을 사용하도록 허용                                                                                                                                 | "2.0", "2.1", "2.2", "2.3", "2.4", "2.5" (EXPERIMENTAL)                  |                             |
| `sourceDirs`      |                                   | 컴파일할 소스 파일이 포함된 디렉터리                                                                                                                                                                    |                                                                          | 프로젝트 소스 루트          |
| `compilerPlugins` |                                   | 활성화된 컴파일러 플러그인                                                                                                                                                                              |                                                                          | []                          |
| `pluginOptions`   |                                   | 컴파일러 플러그인 옵션                                                                                                                                                                                  |                                                                          | []                          |
| `args`            |                                   | 추가 컴파일러 인수                                                                                                                                                                                      |                                                                          | []                          |
| `jvmTarget`       | `kotlin.compiler.jvmTarget`       | 생성된 바이트코드의 타깃 JVM 버전입니다. 출력되는 바이트코드 버전만 제어하며, 코드에서 사용할 수 있는 JDK API를 제한하지는 않습니다.                                                                    | "1.8", "9", "10", ..., "26"                                              | "%defaultJvmTargetVersion%" |
| `jdkRelease`      | `kotlin.compiler.jdkRelease`      | 타깃 JVM 버전입니다. 바이트코드 버전을 제어하고 사용 가능한 API를 지정된 JDK 버전으로 제한하여 최신 API가 실수로 사용되는 것을 방지합니다. Java의 `--release` 컴파일러 옵션과 동일합니다.             | "1.8", "9", "10", ..., "26"                                              |                             |
| `jdkHome`         | `kotlin.compiler.jdkHome`         | 기본 `JAVA_HOME` 대신 지정된 위치의 커스텀 JDK를 클래스패스에 포함                                                                                                                                      |                                                                          |                             |
| `jdkToolchain`    | `kotlin.compiler.jdkToolchain`    | 툴체인에서 사용할 JDK 버전을 설정합니다. Kotlin 컴파일에만 영향을 미칩니다.                                                                                                                             |                                                                          |                             |
| `-Xadd-modules`   |                                   | (실험적 기능) 초기 모듈 외에 지정된 루트 모듈을 확인(resolve)합니다. 모듈 경로의 모든 모듈을 확인하려면 `ALL-MODULE-PATH` 값을 설정하세요.                                                             | 쉼표로 구분된 모듈 이름 또는 `<arg>`를 통해 전달된 `ALL-MODULE-PATH`     |                             |

## 실행 전략 선택 {id="choose-execution-strategy"}

<snippet id="maven-configure-execution-strategy">

기본적으로 Maven은 Kotlin 데몬 컴파일러 실행 전략을 사용합니다. "인 프로세스(in process)" 전략으로 전환하려면 `pom.xml` 파일에 다음 프로퍼티를 설정하세요:

```xml
<properties>
    <kotlin.compiler.daemon>false</kotlin.compiler.daemon>
</properties>
```

</snippet>

다양한 전략에 대한 자세한 내용은 [컴파일러 실행 전략(Compiler execution strategy)](compiler-execution-strategy.md)을 참조하세요.

## 증분 컴파일 활성화 {id="enable-incremental-compilation"}

빌드 속도를 높이려면 `kotlin.compiler.incremental` 프로퍼티를 추가하여 증분 컴파일을 활성화할 수 있습니다:

```xml
<properties>
    <kotlin.compiler.incremental>true</kotlin.compiler.incremental>
</properties>
```

또는 `-Dkotlin.compiler.incremental=true` 옵션을 사용하여 빌드를 실행할 수도 있습니다.

## 다음 단계 {id="what-s-next"}

[프로젝트 패키징](maven-compile-package.md)