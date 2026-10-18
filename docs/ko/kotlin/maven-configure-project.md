[//]: # (title: Maven 프로젝트 구성)

기존 Java Maven 프로젝트에 Kotlin을 도입하거나 새로운 Kotlin Maven 프로젝트를 생성할 때는 Kotlin 소스와 모듈을 컴파일하는 Kotlin Maven 플러그인을 추가해야 합니다.

현재는 Maven v3만 지원됩니다.

> 프로젝트를 Maven 4로 마이그레이션할 계획이라면 [`mvnup`](https://maven.apache.org/tools/mvnup.html) Maven 업그레이드 도구를 사용하여 빌드를 자동으로 마이그레이션하세요. 마이그레이션에 대한 자세한 내용은 [Starting with Maven 4](https://maven.apache.org/guides/mini/guide-migration-to-mvn4.html) 가이드에서 확인할 수 있습니다.
>
{style="note"}

## 자동 구성 {id="automatic-configuration"}

`<extensions>` 옵션을 사용하면 Java-Kotlin 혼합 프로젝트와 순수 Kotlin 프로젝트 모두에서 Maven 구성을 간소화할 수 있습니다. 이 방식을 사용하면 Maven 컴파일러 플러그인을 구성할 필요가 없으므로 시간을 절약할 수 있습니다.

`<extensions>`와 함께 Kotlin Maven 플러그인을 적용하려면 `pom.xml` 빌드 파일을 다음과 같이 업데이트하세요.

1. `<properties>` 섹션에서 Kotlin 및 JVM 대상 버전을 정의합니다.

   ```xml
   <properties>
       <maven.compiler.release>17</maven.compiler.release>
       <kotlin.version>%kotlinVersion%</kotlin.version>
   </properties>
   ```

2. `<build><plugins>` 섹션에 `<extensions>` 옵션이 활성화된 Kotlin Maven 플러그인을 추가합니다.

   ```xml
   <build>
       <plugins>
           <!-- Kotlin 컴파일러 플러그인 구성 -->
           <plugin>
               <groupId>org.jetbrains.kotlin</groupId>
               <artifactId>kotlin-maven-plugin</artifactId>
               <version>${kotlin.version}</version>
               <extensions>true</extensions> <!-- 확장 기능 활성화 -->
           </plugin>
           <!-- 확장 기능을 사용하면 Maven 컴파일러 플러그인을 구성할 필요가 없음 -->
       </plugins>
   </build>
   ```

`<extensions>` 옵션의 기능은 다음과 같습니다.

* `src/main/kotlin` 및 `src/test/kotlin` 디렉터리가 이미 존재하지만 플러그인 구성에 지정되지 않은 경우, 이를 소스 루트(source root)로 등록합니다.
* 프로젝트에 아직 정의되지 않은 경우 [`kotlin-stdlib` 의존성](maven-set-dependencies.md#dependency-on-the-standard-library)을 추가합니다.
* 적절한 [라이프사이클 단계(lifecycle phases)](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html)에 바인딩된 `compile`, `test-compile`, `kapt`, `test-kapt` 실행(execution)을 빌드에 추가합니다. 따라서 `kapt`, Kotlin의 `compile`, Java의 `compile` 실행이 올바른 순서로 실행되도록 `<id>` 및 `<goals>`가 포함된 `<executions>` 섹션을 수동으로 설정할 필요가 없습니다.
* [JVM 대상 버전을 프로젝트에 구성된 Java 컴파일러 버전과 자동으로 맞춥니다.](#jvm-target-version)
   
Java와 Kotlin이 혼합된 프로젝트의 경우 이 구성을 통해 다음 사항이 보장됩니다.

* Kotlin 코드가 먼저 컴파일됩니다.
* Java 코드는 Kotlin 이후에 컴파일되며 Kotlin 클래스를 참조할 수 있습니다.
* 기본 Maven 동작이 플러그인 순서를 덮어쓰지 않습니다.

확장 기능 구성은 전체 `<executions>` 섹션을 대체합니다. 실행을 직접 구성해야 하는 경우 [Kotlin 및 Java 소스 컴파일](#compile-kotlin-and-java-sources)의 예제를 참조하세요.

> 여러 빌드 플러그인이 기본 라이프사이클을 덮어쓰고 `<extensions>` 옵션도 활성화한 경우, `<build>` 섹션의 마지막 플러그인이 라이프사이클 설정에 대한 우선순위를 갖습니다. 이전의 모든 라이프사이클 설정 변경 사항은 무시됩니다.
>
{style="note"}

<anchor name="maven-compiler-extensions-version"/>

현재 `<extensions>`와 함께 사용되는 Maven 컴파일러 플러그인의 기본 버전은 **%mavenExtensionsVersion%**입니다. 다른 버전을 별도로 설정할 수도 있습니다.

```xml
<build>
    <plugins>
        <!-- Kotlin 컴파일러 플러그인 구성 -->
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <version>${kotlin.version}</version>
            <extensions>true</extensions>
        </plugin>
        <!-- Java 클래스용 Maven 컴파일러 플러그인 구성 -->
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>%mavenPluginVersion%</version>
        </plugin>
    </plugins>
</build>
```

### JVM 대상 버전 {id="jvm-target-version"}

`<extensions>` 옵션은 Kotlin 컴파일러와 Maven 컴파일러가 동일한 바이트코드 버전을 대상으로 하도록 보장합니다.

Kotlin Maven 플러그인은 다음 순서로 JVM 대상 버전을 자동으로 확인합니다.

```mermaid
graph TD
    A["<b>우선순위 1</b><br/>kotlin.compiler.jdkRelease<br/>또는 kotlin.compiler.jvmTarget"]
    B["<b>우선순위 2</b><br/>maven.compiler.release"]
    C["<b>우선순위 3</b><br/>maven.compiler.target"]

    A --> B
    B --> C
```

#### Kotlin 컴파일러 버전 {id="kotlin-compiler-versions"}

프로젝트에 `kotlin.compiler.jdkRelease` 또는 `kotlin.compiler.jvmTarget` 속성이 정의되어 있으면 해당 속성에 설정된 버전이 우선 적용됩니다.

이러한 Kotlin 컴파일러 옵션은 서로 다르게 동작한다는 점에 유의하세요.

| Kotlin 컴파일러 옵션 | 출력 바이트코드 버전 제어 | 특정 JDK로 API 제한 |
|------------------------------|-----------------------------------------|-----------------------------------------------------------------------------------------------|
| `kotlin.compiler.jvmTarget`  | 예 | 코드 내 JDK API에 대한 제한 없음 |
| `kotlin.compiler.jdkRelease` | 예 | 예 − 특정 API 버전만 허용됨 (Java의 `--release` 컴파일러 옵션과 동일) |

> `kotlin.compiler.jdkRelease`와 `kotlin.compiler.jvmTarget`에 서로 다른 JDK 옵션을 동시에 설정하지 마세요. 그렇지 않으면 오류가 발생합니다.
>
{style="note"}

#### Maven 컴파일러 버전 {id="maven-compiler-versions"}

* `kotlin.compiler.jdkRelease`와 `kotlin.compiler.jvmTarget` 옵션이 둘 다 설정되어 있지 않으면 플러그인은 `maven.compiler.release` 버전을 사용합니다.

  `maven.compiler.release` 버전은 프로젝트 속성으로 정의하거나 `maven-compiler-plugin` 구성 내에서 정의할 수 있습니다.
* Maven release 버전이 설정되어 있지 않으면 플러그인은 `maven.compiler.target` 버전을 사용합니다.

  이 버전 역시 프로젝트 속성으로 정의하거나 `maven-compiler-plugin` 구성 내에서 정의할 수 있습니다.

Maven 컴파일러의 `target`과 `release` 옵션은 서로 다르게 동작한다는 점에 유의하세요.

| Maven 컴파일러 옵션 | Kotlin의 `jvmTarget` 설정 | Kotlin의 `jdkRelease` 설정 | 특정 JDK로 API 제한 |
|--------------------------|---------------------------|----------------------------|----------------------------------------------|
| `maven.compiler.target`  | 예 | 아니요 | 아니요 − 빌드의 JDK 클래스패스가 계속 표시됨 |
| `maven.compiler.release` | 예 | 예 | 예 − 지정된 특정 API 버전으로만 제한됨 |

> `<extensions>` 옵션은 프로젝트 수준 속성과 전역 `maven-compiler-plugin` 구성만 확인합니다. 플러그인의 `<executions>` 섹션에 정의된 구성은 확인하지 않습니다.
>
{style="note"}

## 수동 구성 {id="manual-configuration"}

Kotlin Maven 플러그인에서 `<extensions>`를 활성화하지 않는 경우, 소스 코드가 올바르게 컴파일되도록 프로젝트를 직접 수동으로 구성해야 합니다.

Maven 프로젝트에서 [Java 및 Kotlin 소스](#compile-kotlin-and-java-sources)를 함께 컴파일하거나 [Kotlin 전용 소스](#compile-kotlin-only-sources)만 컴파일하도록 설정할 수 있습니다.

### Kotlin 및 Java 소스 컴파일 {id="compile-kotlin-and-java-sources"}

Kotlin과 Java 소스 파일이 모두 포함된 프로젝트를 컴파일하려면 Java 컴파일러보다 Kotlin 컴파일러가 먼저 실행되도록 해야 합니다.

Java 컴파일러는 Kotlin 선언이 `.class` 파일로 컴파일되기 전까지 이를 인식할 수 없습니다. Java 코드에서 Kotlin 클래스를 사용하는 경우 `cannot find symbol` 오류를 방지하려면 해당 클래스를 먼저 컴파일해야 합니다.

Maven은 주로 다음 두 가지 요소를 기준으로 플러그인 실행 순서를 결정합니다.

* `pom.xml` 파일 내 플러그인 선언 순서.
* `pom.xml` 파일에서의 위치와 관계없이 항상 사용자 정의 실행보다 먼저 실행되는 `default-compile` 및 `default-testCompile`과 같은 기본 내장 실행.

실행 순서를 제어하려면 다음을 수행하세요.

* `maven-compiler-plugin`보다 앞에 `kotlin-maven-plugin`을 선언합니다.
* Java 컴파일러 플러그인의 기본 실행을 비활성화합니다.
* 컴파일 단계를 명시적으로 제어하기 위해 사용자 정의 실행을 추가합니다.

> 기본 실행을 비활성화하려면 Maven의 특수 `none` 단계를 사용할 수 있습니다.
>
{style="note"}

Kotlin Maven 플러그인을 적용하려면 `pom.xml` 빌드 파일을 다음과 같이 업데이트하세요.

```xml
<build>
    <plugins>
        <!-- Kotlin 컴파일러 플러그인 구성 -->
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <version>${kotlin.version}</version>
            <executions>
                <execution>
                    <id>kotlin-compile</id>
                    <phase>compile</phase>
                    <goals>
                        <goal>compile</goal>
                    </goals>
                    <configuration>
                        <sourceDirs>
                            <sourceDir>${project.basedir}/src/main/kotlin</sourceDir>
                            <!-- Kotlin 코드가 Java 코드를 참조할 수 있도록 설정 -->
                            <sourceDir>${project.basedir}/src/main/java</sourceDir>
                        </sourceDirs>
                    </configuration>
                </execution>
                <execution>
                    <id>kotlin-test-compile</id>
                    <phase>test-compile</phase>
                    <goals>
                        <goal>test-compile</goal>
                    </goals>
                    <configuration>
                        <sourceDirs>
                            <sourceDir>${project.basedir}/src/test/kotlin</sourceDir>
                            <sourceDir>${project.basedir}/src/test/java</sourceDir>
                        </sourceDirs>
                    </configuration>
                </execution>
            </executions>
        </plugin>

        <!-- Maven 컴파일러 플러그인 구성 -->
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>3.15.0</version>
            <executions>
                <!-- 기본 실행 비활성화 -->
                <execution>
                    <id>default-compile</id>
                    <phase>none</phase>
                </execution>
                <execution>
                    <id>default-testCompile</id>
                    <phase>none</phase>
                </execution>

                <!-- 사용자 정의 실행 정의 -->
                <execution>
                    <id>java-compile</id>
                    <phase>compile</phase>
                    <goals>
                        <goal>compile</goal>
                    </goals>
                </execution>
                <execution>
                    <id>java-test-compile</id>
                    <phase>test-compile</phase>
                    <goals>
                        <goal>testCompile</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

이 구성을 통해 다음 사항이 보장됩니다.

* Kotlin 코드가 먼저 컴파일됩니다.
* Java 코드는 Kotlin 이후에 컴파일되며 Kotlin 클래스를 참조할 수 있습니다.
* 기본 Maven 동작이 플러그인 순서를 덮어쓰지 않습니다.

Maven이 플러그인 실행을 처리하는 방법에 대한 자세한 내용은 공식 Maven 문서의 [Guide to default plugin execution IDs](https://maven.apache.org/guides/mini/guide-default-execution-ids.html)를 참조하세요.

### Kotlin 전용 소스 컴파일 {id="compile-kotlin-only-sources"}

Kotlin 소스 파일만 있는 프로젝트를 컴파일하려면 소스 루트를 선언하고 Kotlin Maven 플러그인을 구성하세요.

1. `<build>` 섹션에 소스 디렉터리를 지정합니다.

    ```xml
    <build>
        <sourceDirectory>src/main/kotlin</sourceDirectory>
        <testSourceDirectory>src/test/kotlin</testSourceDirectory>
    </build>
    ```

2. Kotlin Maven 플러그인이 적용되었는지 확인합니다.

    ```xml
    <build>
        <plugins>
            <plugin>
                <groupId>org.jetbrains.kotlin</groupId>
                <artifactId>kotlin-maven-plugin</artifactId>
                <version>${kotlin.version}</version>
                <executions>
                    <execution>
                        <id>compile</id>
                        <goals>
                            <goal>compile</goal>
                        </goals>
                    </execution>
                    <execution>
                        <id>test-compile</id>
                        <goals>
                            <goal>test-compile</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
    ```

### JDK 버전 설정 {id="set-jdk-version"}

Kotlin은 빌드에서 JDK 버전을 관리하는 데 도움이 되는 [Maven 툴체인(Maven Toolchains)](https://maven.apache.org/guides/mini/guide-using-toolchains.html)을 지원합니다.

빌드에 `maven-toolchains-plugin`을 구성하면 Maven을 실행하는 JVM 버전(`JAVA_HOME` 경로에 설정됨)과 독립적으로 Kotlin 컴파일에 사용할 JDK 버전을 지정할 수 있습니다. 그러면 Kotlin Maven 플러그인이 선택된 JDK 툴체인을 자동으로 가져옵니다.

이를 통해 Kotlin 컴파일을 포함하여 빌드의 모든 플러그인에서 사용되는 JDK를 단일 툴체인으로 제어할 수 있습니다. 예를 들면 다음과 같습니다.

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-toolchains-plugin</artifactId>
    <version>3.2.0</version>
    <executions>
        <execution>
            <goals>
                <goal>toolchain</goal>
            </goals>
        </execution>
    </executions>
    <configuration>
        <toolchains>
            <jdk>
                <version>21</version>
            </jdk>
        </toolchains>
    </configuration>
</plugin>
```

JDK 버전을 설정하는 여러 방법의 우선순위를 유의하세요.

```Mermaid
graph TD
    A["<b>우선순위 1</b><br/>kotlin-maven-plugin의 jdkHome 옵션"]
    B["<b>우선순위 2</b><br/>maven-toolchains-plugin에 설정된 JDK 버전"]
    C["<b>우선순위 3</b><br/>JAVA_HOME 버전"]

    A --> B
    B --> C
```

* `kotlin-maven-plugin` 구성의 `jdkHome` 옵션에 설정된 JDK 버전이 항상 툴체인 버전보다 우선합니다.
* `maven-toolchains-plugin`의 JDK 버전은 `JAVA_HOME` 경로에 설정된 JDK 버전을 재정의합니다.

플러그인 전용 `<jdkToolchain>` 옵션을 사용하여 `kotlin-maven-plugin`의 툴체인에서 JDK 버전을 직접 설정할 수도 있습니다. `maven-toolchains-plugin`을 사용하는 것과 비교할 때, 이 매개변수는 Kotlin 컴파일에만 영향을 미치고 빌드의 다른 플러그인에는 영향을 주지 않습니다.

> 현재 `maven-toolchains-plugin`이 특정 JDK 버전을 사용하도록 설정하더라도 `kotlin-maven-plugin`의 [`kapt` 및 `test-kapt` 골(goal)에는 영향을 미치지 않습니다](https://youtrack.jetbrains.com/issue/KT-79897). 대신 필요한 버전을 `JAVA_HOME` 경로에 설정하세요.
>
{style="note"}

## Java 모듈(JPMS) 구성 {id="configure-java-modules-jpms"}

Kotlin Maven 플러그인은 [Java 플랫폼 모듈 시스템(JPMS)](https://dev.java/learn/modules/)을 지원하므로, `module-info.java` 기술자(descriptor)와 함께 Kotlin 코드를 컴파일하고 생성된 모듈을 다른 Java 모듈처럼 사용할 수 있습니다.

빌드 파일에 별도의 JPMS 전용 옵션을 추가할 필요는 없습니다. 
Maven 컴파일러보다 Kotlin 컴파일러가 먼저 실행되도록 구성하기만 하면 됩니다.

`module-info.java` 기술자가 존재하면 Kotlin 컴파일러는 이를 소스 파일로 취급하여 클래스패스 대신 모듈 패스를 기준으로 컴파일합니다. Kotlin 컴파일러는 모듈 그래프를 해석하기 위해 기술자를 읽고, 이후 Maven 컴파일러가 이를 `module-info.class` 파일로 컴파일합니다.

Java 모듈을 구성하려면 `${project.basedir}/src/main/java` 디렉터리에 `module-info.java` 파일을 생성하세요. 모듈 기술자에서 모듈에 필요한 모든 의존성과 내보낼(export) 패키지를 선언합니다. 예를 들면 다음과 같습니다.

```java
module org.example.myapp {
    requires transitive kotlin.stdlib;
    requires java.net.http;
    
    exports org.example.myapp;
}
```

다음 사항에 유의하세요.

* Java 모듈은 선언된 항목만 사용할 수 있습니다. 컴파일 시 클래스패스 대신 모듈 패스를 사용하므로 기술자에는 표준 라이브러리, JDK 모듈(`java.base` 제외) 및 기타 라이브러리를 비롯해 Kotlin 코드가 사용하는 모든 의존성이 포함되어야 합니다. 그렇지 않으면 `Unresolved reference` 오류가 발생할 수 있습니다.
* 모듈의 경우 `Package is empty or does not exist` 빌드 실패를 방지하기 위해 Kotlin 파일의 패키지 이름이 `module-info.java`의 패키지 이름과 일치해야 합니다.
* `pom.xml` 빌드 파일은 [Kotlin이 Java보다 먼저 컴파일](#compile-kotlin-and-java-sources)되도록 구성해야 합니다. [자동 구성](#automatic-configuration)을 사용하는 경우 `<extensions>` 옵션이 이를 이미 보장합니다. 

## 다음 단계 {id="what-s-next"}

[Kotlin Maven 프로젝트에서 의존성 설정](maven-set-dependencies.md)