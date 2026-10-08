[//]: # (title: Maven)

Maven 기반 프로젝트의 문서를 생성하려면 Dokka용 Maven 플러그인을 사용할 수 있습니다.

> [Dokka용 Gradle 플러그인](dokka-gradle.md)과 비교했을 때, Maven 플러그인은 기본적인 기능만 제공하며 멀티 모듈 빌드는 지원하지 않습니다.
> 
{style="note"}

Dokka를 사용해 보고 Maven 프로젝트에서 어떻게 설정하는지 확인하려면 [Maven 예제](https://github.com/Kotlin/dokka/tree/%dokkaVersion%/examples/maven) 프로젝트를 방문해 보세요.

## Dokka 적용 {id="apply-dokka"}

Dokka를 적용하려면 POM 파일의 `plugins` 섹션에 `dokka-maven-plugin`을 추가해야 합니다.

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

## 문서 생성 {id="generate-documentation"}

Maven 플러그인은 다음과 같은 골(goal)을 제공합니다.

| **골(Goal)**      | **설명**                                                                        |
|---------------|----------------------------------------------------------------------------------------|
| `dokka:dokka` | Dokka 플러그인이 적용된 문서를 생성합니다. 기본값은 [HTML](dokka-html.md) 형식입니다. |

### 실험적 기능(Experimental) {id="experimental"}

| **골(Goal)**           | **설명**                                                                             |
|--------------------|---------------------------------------------------------------------------------------------|
| `dokka:javadoc`    | [Javadoc](dokka-javadoc.md) 형식으로 문서를 생성합니다.                                    |
| `dokka:javadocJar` | [Javadoc](dokka-javadoc.md) 형식의 문서가 포함된 `javadoc.jar` 파일을 생성합니다. |

### 기타 출력 형식 {id="other-output-formats"}

기본적으로 Dokka용 Maven 플러그인은 [HTML](dokka-html.md) 출력 형식으로 문서를 빌드합니다.

그 외 모든 출력 형식은 [Dokka 플러그인](dokka-plugins.md)으로 구현되어 있습니다. 원하는 형식으로 문서를 생성하려면 설정에 해당 Dokka 플러그인을 추가해야 합니다.

예를 들어, 실험적인 [GFM](https://github.com/Kotlin/dokka/tree/master/dokka-subprojects/plugin-gfm#readme) 형식을 사용하려면 `gfm-plugin` 아티팩트를 추가해야 합니다.

```xml
<plugin>
    <groupId>org.jetbrains.dokka</groupId>
    <artifactId>dokka-maven-plugin</artifactId>
    ...
    <configuration>
        <dokkaPlugins>
            <plugin>
                <groupId>org.jetbrains.dokka</groupId>
                <artifactId>gfm-plugin</artifactId>
                <version>%dokkaVersion%</version>
            </plugin>
        </dokkaPlugins>
    </configuration>
</plugin>
```

이 설정으로 `dokka:dokka` 골을 실행하면 GFM 형식의 문서가 생성됩니다.

Dokka 플러그인에 대해 더 자세히 알아보려면 [Dokka 플러그인](dokka-plugins.md)을 참조하세요.

## javadoc.jar 빌드 {id="build-javadoc-jar"}

라이브러리를 저장소에 배포하려는 경우, 라이브러리의 API 레퍼런스 문서가 포함된 `javadoc.jar` 파일을 제공해야 할 수도 있습니다.

예를 들어, [Maven Central](https://central.sonatype.org/)에 배포하려면 프로젝트와 함께 `javadoc.jar`를 [반드시](https://central.sonatype.org/publish/requirements/) 제공해야 합니다. 하지만 모든 저장소에 이 규칙이 있는 것은 아닙니다.

[Dokka용 Gradle 플러그인](dokka-gradle.md#build-javadoc-jar)과 달리, Maven 플러그인은 바로 사용할 수 있는 `dokka:javadocJar` 골을 제공합니다. 기본적으로 `target` 폴더에 [Javadoc](dokka-javadoc.md) 출력 형식으로 문서를 생성합니다.

기본 제공 골이 만족스럽지 않거나 출력을 커스터마이징하고 싶은 경우(예: Javadoc 대신 [HTML](dokka-html.md) 형식으로 문서를 생성하려는 경우), 다음과 같은 설정으로 Maven JAR 플러그인을 추가하여 유사한 동작을 구현할 수 있습니다.

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-jar-plugin</artifactId>
    <version>3.3.0</version>
    <executions>
        <execution>
            <goals>
                <goal>test-jar</goal>
            </goals>
        </execution>
        <execution>
            <id>dokka-jar</id>
            <phase>package</phase>
            <goals>
                <goal>jar</goal>
            </goals>
            <configuration>
                <classifier>dokka</classifier>
                <classesDirectory>${project.build.directory}/dokka</classesDirectory>
                <skipIfEmpty>true</skipIfEmpty>
            </configuration>
        </execution>
    </executions>
</plugin>
```

문서와 이를 위한 `.jar` 아카이브는 `dokka:dokka` 및 `jar:jar@dokka-jar` 골을 실행하여 생성할 수 있습니다.

```Bash
mvn dokka:dokka jar:jar@dokka-jar
```

> 라이브러리를 Maven Central에 배포하는 경우, [javadoc.io](https://javadoc.io/)와 같은 서비스를 사용하여 별도의 설정 없이 무료로 라이브러리의 API 문서를 호스팅할 수 있습니다. 이 서비스는 `javadoc.jar`에서 직접 문서 페이지를 가져옵니다. [이 예제](https://javadoc.io/doc/com.trib3/server/latest/index.html)에서 볼 수 있듯이 HTML 형식과도 잘 작동합니다.
>
{style="tip"}

## 설정 예제 {id="configuration-example"}

Maven의 플러그인 설정 블록을 사용하여 Dokka를 구성할 수 있습니다.

다음은 문서의 출력 위치만 변경하는 기본 설정 예제입니다.

```xml
<plugin>
    <groupId>org.jetbrains.dokka</groupId>
    <artifactId>dokka-maven-plugin</artifactId>
    ...
    <configuration>
        <outputDir>${project.basedir}/target/documentation/dokka</outputDir>
    </configuration>
</plugin>
```

## 설정 옵션 {id="configuration-options"}

Dokka에는 사용자와 독자의 경험을 맞춤화할 수 있는 다양한 설정 옵션이 있습니다.

아래는 각 설정 섹션에 대한 예제와 상세 설명입니다. 페이지 하단에서 [모든 설정 옵션](#complete-configuration)이 적용된 예제도 확인할 수 있습니다.

### 일반 설정(General configuration) {id="general-configuration"}

```xml
<plugin>
    <groupId>org.jetbrains.dokka</groupId>
    <artifactId>dokka-maven-plugin</artifactId>
    <!--  ...  -->
    <configuration>
        <skip>false</skip>
        <moduleName>${project.artifactId}</moduleName>
        <outputDir>${project.basedir}/target/documentation</outputDir>
        <failOnWarning>false</failOnWarning>
        <suppressObviousFunctions>true</suppressObviousFunctions>
        <suppressInheritedMembers>false</suppressInheritedMembers>
        <offlineMode>false</offlineMode>
        <sourceDirectories>
            <dir>${project.basedir}/src</dir>
        </sourceDirectories>
        <documentedVisibilities>
            <visibility>PUBLIC</visibility>
            <visibility>PROTECTED</visibility>
        </documentedVisibilities>
        <reportUndocumented>false</reportUndocumented>
        <skipDeprecated>false</skipDeprecated>
        <skipEmptyPackages>true</skipEmptyPackages>
        <suppressedFiles>
            <file>/path/to/dir</file>
            <file>/path/to/file</file>
        </suppressedFiles>
        <suppressAnnotatedWith>
            <annotation>com.example.SuppressMe</annotation>
        </suppressAnnotatedWith>
        <jdkVersion>8</jdkVersion>
        <languageVersion>1.7</languageVersion>
        <apiVersion>1.7</apiVersion>
        <noStdlibLink>false</noStdlibLink>
        <noJdkLink>false</noJdkLink>
        <includes>
            <include>packages.md</include>
            <include>extra.md</include>
        </includes>
        <classpath>${project.compileClasspathElements}</classpath>
        <samples>
            <dir>${project.basedir}/samples</dir>
        </samples>
        <sourceLinks>
            <!-- 별도 섹션 -->
        </sourceLinks>
        <externalDocumentationLinks>
            <!-- 별도 섹션 -->
        </externalDocumentationLinks>
        <perPackageOptions>
            <!-- 별도 섹션 -->
        </perPackageOptions>
    </configuration>
</plugin>
```

<deflist collapsible="true">
    <def title="skip">
        <p>문서 생성을 건너뛸지 여부입니다.</p>
        <p>기본값: <code>false</code></p>
    </def>
    <def title="moduleName">
        <p>프로젝트/모듈을 참조하는 데 사용되는 표시 이름입니다. 목차, 내비게이션, 로깅 등에 사용됩니다.</p>
        <p>기본값: <code>{project.artifactId}</code></p>
    </def>
    <def title="outputDir">
        <p>형식에 관계없이 문서가 생성되는 디렉토리입니다.</p>
        <p>기본값: <code>{project.basedir}/target/dokka</code></p>
    </def>
    <def title="failOnWarning">
        <p>
            Dokka가 경고나 오류를 발생시킨 경우 문서 생성을 실패로 처리할지 여부입니다. 프로세스는 모든 오류와 경고가 먼저 출력될 때까지 기다립니다.
        </p>
        <p>이 설정은 <code>reportUndocumented</code>와 함께 사용하면 효과적입니다.</p>
        <p>기본값: <code>false</code></p>
    </def>
    <def title="suppressObviousFunctions">
        <p>명백한 함수(obvious functions)를 숨길지 여부입니다.</p>
        <p>
            다음과 같은 경우 명백한 함수로 간주됩니다:</p>
            <list>
                <li>
                    <code>kotlin.Any</code>, <code>Kotlin.Enum</code>, <code>java.lang.Object</code> 또는 
                    <code>java.lang.Enum</code>으로부터 상속받은 <code>equals</code>, <code>hashCode</code>, <code>toString</code> 등.
                </li>
                <li>
                    합성(synthetic, 컴파일러에 의해 생성됨) 함수이며 <code>dataClass.componentN</code> 또는 
                    <code>dataClass.copy</code>와 같이 문서가 없는 경우.
                </li>
            </list>
        <p>기본값: <code>true</code></p>
    </def>
    <def title="suppressInheritedMembers">
        <p>해당 클래스에서 명시적으로 오버라이드되지 않은 상속된 멤버를 숨길지 여부입니다.</p>
        <p>
            참고: 이는 <code>equals</code>/<code>hashCode</code>/<code>toString</code>과 같은 함수를 숨길 수 있지만, 
            <code>dataClass.componentN</code> 및 <code>dataClass.copy</code>와 같은 합성 함수는 숨길 수 없습니다. 
            해당 용도로는 <code>suppressObviousFunctions</code>를 사용하세요.
        </p>
        <p>기본값: <code>false</code></p>
    </def>
    <def title="offlineMode">
        <p>네트워크를 통해 원격 파일/링크를 확인할지 여부입니다.</p>
        <p>
            여기에는 외부 문서 링크 생성을 위해 사용되는 package-list가 포함됩니다. 
            예를 들어 표준 라이브러리의 클래스를 클릭 가능하게 만드는 데 사용됩니다.
        </p>
        <p>
            이 값을 <code>true</code>로 설정하면 특정 상황에서 빌드 시간을 크게 단축할 수 있지만, 
            표준 라이브러리를 포함한 의존성의 클래스/멤버 링크가 확인되지 않아 문서의 품질과 사용자 경험이 저하될 수 있습니다.
        </p>
        <p>
            참고: 가져온 파일을 로컬에 캐싱하고 Dokka에 로컬 경로로 제공할 수 있습니다. <code>externalDocumentationLinks</code> 섹션을 참조하세요.
        </p>
        <p>기본값: <code>false</code></p>
    </def>
    <def title="sourceDirectories">
        <p>
            분석 및 문서화할 소스 코드 루트입니다.
            디렉토리와 개별 <code>.kt</code> / <code>.java</code> 파일을 입력으로 받을 수 있습니다.
        </p>
        <p>기본값: <code>{project.compileSourceRoots}</code></p>
    </def>
    <def title="documentedVisibilities">
        <p>문서화해야 하는 가시성 제어자(visibility modifier) 집합입니다.</p>
        <p>
            <code>protected</code>/<code>internal</code>/<code>private</code> 선언을 문서화하고 싶거나, 
            <code>public</code> 선언을 제외하고 내부 API만 문서화하고 싶은 경우에 사용할 수 있습니다.
        </p>
        <p>패키지별로 설정할 수 있습니다.</p>
        <p>기본값: <code>PUBLIC</code></p>
    </def>
    <def title="reportUndocumented">
        <p>
            문서화되지 않은 가시적인 선언(즉, <code>documentedVisibilities</code> 및 기타 필터에 의해 필터링된 후 KDoc이 없는 선언)에 대해 경고를 보낼지 여부입니다.
        </p>
        <p>이 설정은 <code>failOnWarning</code>과 함께 사용하면 효과적입니다.</p>
        <p>패키지 수준에서 오버라이드할 수 있습니다.</p>
        <p>기본값: <code>false</code></p>
    </def>
    <def title="skipDeprecated">
        <p><code>@Deprecated</code> 어노테이션이 달린 선언을 문서화할지 여부입니다.</p>
        <p>패키지 수준에서 오버라이드할 수 있습니다.</p>
        <p>기본값: <code>false</code></p>
    </def>
    <def title="skipEmptyPackages">
        <p>
            다양한 필터가 적용된 후 가시적인 선언이 없는 패키지를 건너뛸지 여부입니다.
        </p>
        <p>
            예를 들어 <code>skipDeprecated</code>가 <code>true</code>로 설정되어 있고 패키지에 
            deprecated된 선언만 포함되어 있다면, 해당 패키지는 비어 있는 것으로 간주됩니다.
        </p>
        <p>기본값: <code>true</code></p>
    </def>
    <def title="suppressedFiles">
        <p>
            제외할 디렉토리 또는 개별 파일입니다. 여기에 포함된 선언은 문서화되지 않습니다.
        </p>
    </def>
    <def title="suppressAnnotatedWith">
        <p>특정 어노테이션이 달린 선언을 숨기기 위한 어노테이션의 완전한 이름(FQN) 목록입니다.</p>
        <p>
            이 어노테이션 중 하나가 달린 선언은 생성된 문서에서 제외됩니다.
        </p>
    </def>
    <def title="jdkVersion">
        <p>Java 타입에 대한 외부 문서 링크를 생성할 때 사용할 JDK 버전입니다.</p>
        <p>
            예를 들어 공개 선언 시그니처에서 <code>java.util.UUID</code>를 사용하고 
            이 옵션이 <code>8</code>로 설정된 경우, Dokka는 이에 대해 <a href="https://docs.oracle.com/javase/8/docs/api/java/util/UUID.html">JDK 8 Javadocs</a>로 연결되는 외부 문서 링크를 생성합니다.
        </p>
        <p>기본값: JDK 8</p>
    </def>
    <def title="languageVersion">
        <p>
            분석 및 <a href="https://kotlinlang.org/docs/kotlin-doc.html#sample-identifier">@sample</a> 
            환경을 설정하는 데 사용되는 <a href="https://kotlinlang.org/docs/compatibility-modes.html">Kotlin 언어 버전</a>입니다.
        </p>
        <p>기본적으로 Dokka의 내장 컴파일러에서 사용할 수 있는 최신 언어 버전이 사용됩니다.</p>
    </def>
    <def title="apiVersion">
        <p>
            분석 및 <a href="https://kotlinlang.org/docs/kotlin-doc.html#sample-identifier">@sample</a> 
            환경을 설정하는 데 사용되는 <a href="https://kotlinlang.org/docs/compatibility-modes.html">Kotlin API 버전</a>입니다.
        </p>
        <p>기본적으로 <code>languageVersion</code>에서 추론됩니다.</p>
    </def>
    <def title="noStdlibLink">
        <p>
            Kotlin 표준 라이브러리의 API 레퍼런스 문서로 연결되는 외부 문서 링크를 생성할지 여부입니다.
        </p>
        <p>참고: <code>noStdLibLink</code>가 <code>false</code>로 설정되어 있을 때 링크가 생성<b>됩니다</b>.</p>
        <p>기본값: <code>false</code></p>
    </def>
    <def title="noJdkLink">
    <anchor name="includes"/>
        <p>JDK Javadocs로 연결되는 외부 문서 링크를 생성할지 여부입니다.</p>
        <p>JDK Javadocs의 버전은 <code>jdkVersion</code> 옵션에 의해 결정됩니다.</p>
        <p>참고: <code>noJdkLink</code>가 <code>false</code>로 설정되어 있을 때 링크가 생성<b>됩니다</b>.</p>
        <p>기본값: <code>false</code></p>
    </def>
    <def title="includes">
        <p>
            <a href="dokka-module-and-package-docs.md">모듈 및 패키지 문서</a>를 포함하는 
            마크다운 파일 목록입니다.
        </p>
        <p>지정된 파일의 내용은 파싱되어 모듈 및 패키지 설명으로 문서에 포함됩니다.</p>
    </def>
    <def title="classpath">
        <p>분석 및 대화형 샘플을 위한 클래스패스입니다.</p>
        <p>
            의존성에서 오는 일부 타입이 자동으로 확인되거나 인식되지 않는 경우 유용합니다.
            이 옵션은 <code>.jar</code>와 <code>.klib</code> 파일을 모두 허용합니다.
        </p>
        <p>기본값: <code>{project.compileClasspathElements}</code></p>
    </def>
    <def title="samples">
        <p>
            <a href="https://kotlinlang.org/docs/kotlin-doc.html#sample-identifier">@sample KDoc 태그</a>를 통해 
            참조되는 샘플 함수를 포함하는 디렉토리 또는 파일 목록입니다.
        </p>
    </def>
</deflist>

### 소스 링크 설정(Source link configuration) {id="source-link-configuration"}

`sourceLinks` 설정 블록을 사용하면 각 시그니처에 특정 라인 번호가 포함된 `url`로 연결되는 `source` 링크를 추가할 수 있습니다. (라인 번호는 `lineSuffix`를 설정하여 구성할 수 있습니다.)

이를 통해 독자는 각 선언의 소스 코드를 쉽게 찾을 수 있습니다.

예를 들어, `kotlinx.coroutines`의 [`count()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/count.html) 함수 문서를 참조하세요.

```xml
<plugin>
    <groupId>org.jetbrains.dokka</groupId>
    <artifactId>dokka-maven-plugin</artifactId>
    <!--  ...  -->
    <configuration>
        <sourceLinks>
            <link>
                <path>src</path>
                <url>https://github.com/kotlin/dokka/tree/master/src</url>
                <lineSuffix>#L</lineSuffix>
            </link>
        </sourceLinks>
    </configuration>
</plugin>
```

<deflist collapsible="true">
    <def title="path">
        <p>
            로컬 소스 디렉토리의 경로입니다. 경로는 현재 모듈의 루트를 기준으로 한 상대 경로여야 합니다.
        </p>
        <p>
            참고: Unix 기반 경로만 허용되며, Windows 스타일 경로는 오류를 발생시킵니다.
        </p>
    </def>
    <def title="url">
        <p>
            GitHub, GitLab, Bitbucket 등 문서 독자가 액세스할 수 있는 소스 코드 호스팅 서비스의 URL입니다. 
            이 URL은 선언의 소스 코드 링크를 생성하는 데 사용됩니다.
        </p>
    </def>
    <def title="lineSuffix">
        <p>
            URL에 소스 코드 라인 번호를 추가하는 데 사용되는 접미사입니다. 이를 통해 독자는 파일뿐만 아니라 
            선언의 특정 라인 번호로 이동할 수 있습니다.
        </p>
        <p>
            번호 자체는 지정된 접미사 뒤에 추가됩니다. 예를 들어 이 옵션이 
            <code>#L</code>로 설정되어 있고 라인 번호가 10인 경우, 결과 URL 접미사는 <code>#L10</code>이 됩니다.
        </p>
        <p>
            주요 서비스에서 사용되는 접미사:</p>
            <list>
            <li>GitHub: <code>#L</code></li>
            <li>GitLab: <code>#L</code></li>
            <li>Bitbucket: <code>#lines-</code></li>
            </list>
    </def>
</deflist>

### 외부 문서 링크 설정(External documentation links configuration) {id="external-documentation-links-configuration"}

`externalDocumentationLinks` 블록을 사용하면 의존하고 있는 외부 호스팅 문서로 연결되는 링크를 생성할 수 있습니다.

예를 들어 `kotlinx.serialization`의 타입을 사용하는 경우, 기본적으로 해당 타입은 문서에서 확인되지 않은 것처럼 클릭할 수 없는 상태가 됩니다. 하지만 `kotlinx.serialization`의 API 레퍼런스 문서는 Dokka로 빌드되어 [kotlinlang.org에 게시](https://kotlinlang.org/api/kotlinx.serialization/)되어 있으므로, 이에 대한 외부 문서 링크를 설정할 수 있습니다. 이를 통해 Dokka는 해당 라이브러리의 타입에 대한 링크를 생성하여 성공적으로 확인하고 클릭할 수 있게 만듭니다.

기본적으로 Kotlin 표준 라이브러리와 JDK에 대한 외부 문서 링크는 이미 설정되어 있습니다.

```xml
<plugin>
    <groupId>org.jetbrains.dokka</groupId>
    <artifactId>dokka-maven-plugin</artifactId>
    <!--  ...  -->
    <configuration>
        <externalDocumentationLinks>
            <link>
                <url>https://kotlinlang.org/api/kotlinx.serialization/</url>
                <packageListUrl>file:/${project.basedir}/serialization.package.list</packageListUrl>
            </link>
        </externalDocumentationLinks>
    </configuration>
</plugin>
```

<deflist collapsible="true">
    <def title="url">
        <p>연결할 문서의 루트 URL입니다. 반드시 후행 슬래시(trailing slash)를 포함해야 합니다.</p>
        <p>
            Dokka는 지정된 URL에서 <code>package-list</code>를 자동으로 찾고 선언들을 서로 연결하기 위해 최선을 다합니다.
        </p>
        <p>
            자동 확인에 실패하거나 로컬에 캐싱된 파일을 대신 사용하려는 경우, 
            <code>packageListUrl</code> 옵션 설정을 고려해 보세요.
        </p>
    </def>
    <def title="packageListUrl">
        <p>
            <code>package-list</code>의 정확한 위치입니다. 이는 Dokka의 자동 확인 기능에 의존하는 대신 사용할 수 있는 대안입니다.
        </p>
        <p>
            Package list에는 모듈 및 패키지 이름과 같이 문서 및 프로젝트 자체에 대한 정보가 포함되어 있습니다.
        </p>
        <p>네트워크 호출을 피하기 위해 로컬에 캐싱된 파일일 수도 있습니다.</p>
    </def>
</deflist>

### 패키지 옵션(Package options) {id="package-options"}

`perPackageOptions` 설정 블록을 사용하면 `matchingRegex`와 일치하는 특정 패키지에 대해 일부 옵션을 설정할 수 있습니다.

```xml
<plugin>
    <groupId>org.jetbrains.dokka</groupId>
    <artifactId>dokka-maven-plugin</artifactId>
    <!--  ...  -->
    <configuration>
        <perPackageOptions>
            <packageOptions>
                <matchingRegex>.*api.*</matchingRegex>
                <suppress>false</suppress>
                <reportUndocumented>false</reportUndocumented>
                <skipDeprecated>false</skipDeprecated>
                <documentedVisibilities>
                    <visibility>PUBLIC</visibility>
                    <visibility>PRIVATE</visibility>
                    <visibility>PROTECTED</visibility>
                    <visibility>INTERNAL</visibility>
                    <visibility>PACKAGE</visibility>
                </documentedVisibilities>
            </packageOptions>
        </perPackageOptions>
    </configuration>
</plugin>
```

<deflist collapsible="true">
    <def title="matchingRegex">
        <p>패키지를 매칭하는 데 사용되는 정규 표현식입니다.</p>
        <p>기본값: <code>.*</code></p>
 </def>
    <def title="suppress">
        <p>문서 생성 시 이 패키지를 건너뛸지 여부입니다.</p>
        <p>기본값: <code>false</code></p>
    </def>
    <def title="documentedVisibilities">
        <p>문서화해야 하는 가시성 제어자 집합입니다.</p>
        <p>
            이 패키지 내의 <code>protected</code>/<code>internal</code>/<code>private</code> 선언을 문서화하고 싶거나, 
            <code>public</code> 선언을 제외하고 내부 API만 문서화하고 싶은 경우에 사용할 수 있습니다.
        </p>
        <p>기본값: <code>PUBLIC</code></p>
    </def>
    <def title="skipDeprecated">
        <p><code>@Deprecated</code> 어노테이션이 달린 선언을 문서화할지 여부입니다.</p>
        <p>프로젝트/모듈 수준에서 설정할 수 있습니다.</p>
        <p>기본값: <code>false</code></p>
    </def>
    <def title="reportUndocumented">
        <p>
            문서화되지 않은 가시적인 선언(즉, <code>documentedVisibilities</code> 및 기타 필터에 의해 필터링된 후 KDoc이 없는 선언)에 대해 경고를 보낼지 여부입니다.
        </p>
        <p>이 설정은 <code>failOnWarning</code>과 함께 사용하면 효과적입니다.</p>
        <p>기본값: <code>false</code></p>
    </def>
</deflist>

### 전체 설정 예시 {id="complete-configuration"}

아래에서 가능한 모든 설정 옵션이 동시에 적용된 모습을 볼 수 있습니다.

```xml
<plugin>
    <groupId>org.jetbrains.dokka</groupId>
    <artifactId>dokka-maven-plugin</artifactId>
    <!--  ...  -->
    <configuration>
        <skip>false</skip>
        <moduleName>${project.artifactId}</moduleName>
        <outputDir>${project.basedir}/target/documentation</outputDir>
        <failOnWarning>false</failOnWarning>
        <suppressObviousFunctions>true</suppressObviousFunctions>
        <suppressInheritedMembers>false</suppressInheritedMembers>
        <offlineMode>false</offlineMode>
        <sourceDirectories>
            <dir>${project.basedir}/src</dir>
        </sourceDirectories>
        <documentedVisibilities>
            <visibility>PUBLIC</visibility>
            <visibility>PRIVATE</visibility>
            <visibility>PROTECTED</visibility>
            <visibility>INTERNAL</visibility>
            <visibility>PACKAGE</visibility>
        </documentedVisibilities>
        <reportUndocumented>false</reportUndocumented>
        <skipDeprecated>false</skipDeprecated>
        <skipEmptyPackages>true</skipEmptyPackages>
        <suppressedFiles>
            <file>/path/to/dir</file>
            <file>/path/to/file</file>
        </suppressedFiles>
        <jdkVersion>8</jdkVersion>
        <languageVersion>1.7</languageVersion>
        <apiVersion>1.7</apiVersion>
        <noStdlibLink>false</noStdlibLink>
        <noJdkLink>false</noJdkLink>
        <includes>
            <include>packages.md</include>
            <include>extra.md</include>
        </includes>
        <classpath>${project.compileClasspathElements}</classpath>
        <samples>
            <dir>${project.basedir}/samples</dir>
        </samples>
        <sourceLinks>
            <link>
                <path>src</path>
                <url>https://github.com/kotlin/dokka/tree/master/src</url>
                <lineSuffix>#L</lineSuffix>
            </link>
        </sourceLinks>
        <externalDocumentationLinks>
            <link>
                <url>https://kotlinlang.org/api/core/kotlin-stdlib/</url>
                <packageListUrl>file:/${project.basedir}/stdlib.package.list</packageListUrl>
            </link>
        </externalDocumentationLinks>
        <perPackageOptions>
            <packageOptions>
                <matchingRegex>.*api.*</matchingRegex>
                <suppress>false</suppress>
                <reportUndocumented>false</reportUndocumented>
                <skipDeprecated>false</skipDeprecated>
                <documentedVisibilities>
                    <visibility>PUBLIC</visibility>
                    <visibility>PRIVATE</visibility>
                    <visibility>PROTECTED</visibility>
                    <visibility>INTERNAL</visibility>
                    <visibility>PACKAGE</visibility>
                </documentedVisibilities>
            </packageOptions>
        </perPackageOptions>
    </configuration>
</plugin>
```
