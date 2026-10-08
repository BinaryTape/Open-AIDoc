[//]: # (title: CLI)

어떤 이유로든 [Gradle](dokka-gradle.md)이나 [Maven](dokka-maven.md) 빌드 도구를 사용할 수 없는 경우, Dokka는 문서 생성을 위한 커맨드 라인(CLI) 러너를 제공합니다.

Dokka CLI 러너는 Gradle 플러그인과 비교했을 때 동일하거나 오히려 더 많은 기능을 제공합니다. 하지만 자동 설정 기능이 없기 때문에, 특히 멀티플랫폼이나 멀티 모듈 환경에서는 설정이 상당히 더 까다롭습니다.

## 시작하기 {id="get-started"}

CLI 러너는 별도의 실행 가능한 아티팩트로 Maven Central에 배포됩니다.

[Maven Central](https://central.sonatype.com/artifact/org.jetbrains.dokka/dokka-cli)에서 찾거나 [직접 다운로드](https://repo1.maven.org/maven2/org/jetbrains/dokka/dokka-cli/%dokkaVersion%/dokka-cli-%dokkaVersion%.jar)할 수 있습니다.

`dokka-cli-%dokkaVersion%.jar` 파일을 컴퓨터에 저장한 후, `-help` 옵션과 함께 실행하여 사용 가능한 모든 구성 옵션과 설명을 확인하세요.

```Bash
java -jar dokka-cli-%dokkaVersion%.jar -help
```

`-sourceSet`과 같은 일부 중첩된 옵션에 대해서도 작동합니다.

```Bash
java -jar dokka-cli-%dokkaVersion%.jar -sourceSet -help
```

## 문서 생성 {id="generate-documentation"}

### 사전 요구 사항 {id="prerequisites"}

의존성을 관리할 빌드 도구가 없으므로, 의존성 `.jar` 파일들을 직접 제공해야 합니다.

모든 출력 형식에 공통으로 필요한 의존성은 다음과 같습니다.

| **그룹**             | **아티팩트**                  | **버전**       | **링크**                                                                                                                                                 |
|----------------------|-------------------------------|----------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| `org.jetbrains.dokka` | `dokka-base`                  | %dokkaVersion% | [다운로드](https://repo1.maven.org/maven2/org/jetbrains/dokka/dokka-base/%dokkaVersion%/dokka-base-%dokkaVersion%.jar)                                   |
| `org.jetbrains.dokka` | `analysis-kotlin-symbols`     | %dokkaVersion% | [다운로드](https://repo1.maven.org/maven2/org/jetbrains/dokka/analysis-kotlin-symbols/%dokkaVersion%/analysis-kotlin-symbols-%dokkaVersion%.jar) |

아래는 [HTML](dokka-html.md) 출력 형식에 필요한 추가 의존성입니다.

| **그룹**               | **아티팩트**       | **버전** | **링크**                                                                                                           |
|------------------------|--------------------|----------|--------------------------------------------------------------------------------------------------------------------|
| `org.jetbrains.kotlinx` | `kotlinx-html-jvm` | 0.8.0    | [다운로드](https://repo1.maven.org/maven2/org/jetbrains/kotlinx/kotlinx-html-jvm/0.8.0/kotlinx-html-jvm-0.8.0.jar) |
| `org.freemarker`        | `freemarker`       | 2.3.31   | [다운로드](https://repo1.maven.org/maven2/org/freemarker/freemarker/2.3.31/freemarker-2.3.31.jar)                  |

### 커맨드 라인 옵션으로 실행 {id="run-with-command-line-options"}

CLI 러너를 구성하기 위해 커맨드 라인 옵션을 전달할 수 있습니다.

최소한 다음 옵션들은 제공해야 합니다.

* `-pluginsClasspath` - 세미콜론 `;`으로 구분된 다운로드한 의존성들의 절대/상대 경로 목록
* `-sourceSet` - 문서를 생성할 소스 코드의 절대 경로
* `-outputDir` - 문서 출력 디렉토리의 절대/상대 경로

```Bash
java -jar dokka-cli-%dokkaVersion%.jar \
     -pluginsClasspath "./dokka-base-%dokkaVersion%.jar;./analysis-kotlin-symbols-%dokkaVersion%.jar;./kotlinx-html-jvm-0.8.0.jar;./freemarker-2.3.31.jar" \
     -sourceSet "-src /home/myCoolProject/src/main/kotlin" \
     -outputDir "./dokka/html"
```

위 예제를 실행하면 [HTML](dokka-html.md) 출력 형식으로 문서가 생성됩니다.

더 자세한 구성 내용은 [커맨드 라인 옵션](#command-line-options)을 참고하세요.

### JSON 구성으로 실행 {id="run-with-json-configuration"}

JSON을 사용하여 CLI 러너를 구성할 수 있습니다. 이 경우, 첫 번째이자 유일한 인자로 JSON 구성 파일의 절대/상대 경로를 제공해야 합니다. 다른 모든 구성 옵션은 이 파일에서 파싱됩니다.

```Bash
java -jar dokka-cli-%dokkaVersion%.jar dokka-configuration.json
```

최소한 다음과 같은 JSON 구성 파일이 필요합니다.

```json
{
  "outputDir": "./dokka/html",
  "sourceSets": [
    {
      "sourceSetID": {
        "scopeId": "moduleName",
        "sourceSetName": "main"
      },
      "sourceRoots": [
        "/home/myCoolProject/src/main/kotlin"
      ]
    }
  ],
  "pluginsClasspath": [
    "./dokka-base-%dokkaVersion%.jar",
    "./kotlinx-html-jvm-0.8.0.jar",
    "./analysis-kotlin-symbols-%dokkaVersion%.jar",
    "./freemarker-2.3.31.jar"
  ]
}
```

더 자세한 내용은 [JSON 구성 옵션](#json-configuration)을 참고하세요.

### 기타 출력 형식 {id="other-output-formats"}

기본적으로 `dokka-base` 아티팩트에는 [HTML](dokka-html.md) 출력 형식만 포함되어 있습니다.

다른 모든 출력 형식은 [Dokka 플러그인](dokka-plugins.md)으로 구현되어 있습니다. 이를 사용하려면 플러그인 클래스패스에 추가해야 합니다.

예를 들어, 실험적인 [GFM](https://github.com/Kotlin/dokka/blob/8e5c63d035ef44a269b8c43430f43f5c8eebfb63/dokka-subprojects/plugin-gfm/README.md) 출력 형식으로 문서를 생성하려면, gfm-plugin의 JAR([다운로드](https://repo1.maven.org/maven2/org/jetbrains/dokka/gfm-plugin/%dokkaVersion%/gfm-plugin-%dokkaVersion%.jar))을 다운로드하여 `pluginsClasspath` 구성 옵션에 전달해야 합니다.

커맨드 라인 옵션을 통한 방법:

```Shell
java -jar dokka-cli-%dokkaVersion%.jar \
     -pluginsClasspath "./dokka-base-%dokkaVersion%.jar;...;./gfm-plugin-%dokkaVersion%.jar" \
     ...
```

JSON 구성을 통한 방법:

```json
{
  ...
  "pluginsClasspath": [
    "./dokka-base-%dokkaVersion%.jar",
    "...",
    "./gfm-plugin-%dokkaVersion%.jar"
  ],
  ...
}
```

GFM 플러그인을 `pluginsClasspath`에 전달하면 CLI 러너가 GFM 출력 형식으로 문서를 생성합니다.

더 많은 정보는 [GFM](https://github.com/Kotlin/dokka/blob/8e5c63d035ef44a269b8c43430f43f5c8eebfb63/dokka-subprojects/plugin-gfm/README.md) 및 [Javadoc](dokka-javadoc.md#generate-javadoc-documentation) 페이지를 확인하세요.

## 커맨드 라인 옵션 {id="command-line-options"}

가능한 모든 커맨드 라인 옵션 목록과 상세 설명을 보려면 다음을 실행하세요.

```Bash
java -jar dokka-cli-%dokkaVersion%.jar -help
```

요약표:

| 옵션                         | 설명                                                                                                                                                                                                  |
|------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `moduleName`                 | 프로젝트/모듈의 이름입니다.                                                                                                                                                                           |
| `moduleVersion`              | 문서화할 버전입니다.                                                                                                                                                                                  |
| `outputDir`                  | 출력 디렉토리 경로이며, 기본값은 `./dokka`입니다.                                                                                                                                                     |
| `sourceSet`                  | Dokka 소스 세트에 대한 구성입니다. 중첩된 구성 옵션을 포함합니다.                                                                                                                                     |
| `pluginsConfiguration`       | Dokka 플러그인에 대한 구성입니다.                                                                                                                                                                     |
| `pluginsClasspath`           | Dokka 플러그인과 그 의존성들이 포함된 JAR 파일 목록입니다. 세미콜론으로 구분된 여러 경로를 허용합니다.                                                                                                 |
| `offlineMode`                | 네트워크를 통해 원격 파일/링크를 확인할지 여부입니다.                                                                                                                                                 |
| `failOnWarning`              | Dokka가 경고나 에러를 발생시켰을 때 문서 생성을 실패로 처리할지 여부입니다.                                                                                                                          |
| `delayTemplateSubstitution`  | 일부 요소의 대체를 지연시킬지 여부입니다. 멀티 모듈 프로젝트의 증분 빌드에 사용됩니다.                                                                                                                 |
| `noSuppressObviousFunctions` | `kotlin.Any`나 `java.lang.Object`에서 상속된 함수와 같이 명백한 함수들을 숨기지 않을지 여부입니다.                                                                                                    |
| `includes`                   | 모듈 및 패키지 문서를 포함하는 Markdown 파일들입니다. 세미콜론으로 구분된 여러 값을 허용합니다.                                                                                                       |
| `suppressInheritedMembers`   | 해당 클래스에서 명시적으로 오버라이드되지 않은 상속된 멤버들을 숨길지 여부입니다.                                                                                                                     |
| `globalPackageOptions`       | `"matchingRegex,-deprecated,-privateApi,+warnUndocumented,+suppress;+visibility:PUBLIC;..."` 형식의 전역 패키지 구성 옵션 목록입니다. 세미콜론으로 구분된 여러 값을 허용합니다.                         |
| `globalLinks`                | `{url}^{packageListUrl}` 형식의 전역 외부 문서 링크입니다. `^^`로 구분된 여러 값을 허용합니다.                                                                                                       |
| `globalSrcLink`              | 소스 디렉토리와 코드를 탐색하기 위한 웹 서비스 간의 전역 매핑입니다. 세미콜론으로 구분된 여러 경로를 허용합니다.                                                                                      |
| `helpSourceSet`              | 중첩된 `-sourceSet` 구성에 대한 도움말을 출력합니다.                                                                                                                                                  |
| `loggingLevel`               | 로깅 레벨입니다. 가능한 값: `DEBUG, PROGRESS, INFO, WARN, ERROR`.                                                                                                                                   |
| `help, h`                    | 사용법 정보를 출력합니다.                                                                                                                                                                             |

#### 소스 세트 옵션 {id="source-set-options"}

중첩된 `-sourceSet` 구성에 대한 커맨드 라인 옵션 목록을 보려면 다음을 실행하세요.

```Bash
java -jar dokka-cli-%dokkaVersion%.jar -sourceSet -help
```

요약표:

| 옵션                         | 설명                                                                                                                                                                           |
|------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `sourceSetName`              | 소스 세트의 이름입니다.                                                                                                                                                        |
| `displayName`                | 내부 및 외부에서 사용되는 소스 세트의 표시 이름입니다.                                                                                                                         |
| `classpath`                  | 분석 및 대화형 샘플을 위한 클래스패스입니다. 세미콜론으로 구분된 여러 경로를 허용합니다.                                                                                       |
| `src`                        | 분석 및 문서화할 소스 코드 루트입니다. 세미콜론으로 구분된 여러 경로를 허용합니다.                                                                                             |
| `dependentSourceSets`        | `moduleName/sourceSetName` 형식의 종속된 소스 세트 이름들입니다. 세미콜론으로 구분된 여러 값을 허용합니다.                                                                      |
| `samples`                    | 샘플 함수를 포함하는 디렉토리나 파일 목록입니다. 세미콜론으로 구분된 여러 경로를 허용합니다. <anchor name="includes-cli"/>                                                     |
| `includes`                   | [모듈 및 패키지 문서](dokka-module-and-package-docs.md)를 포함하는 Markdown 파일들입니다. 세미콜론으로 구분된 여러 경로를 허용합니다.                                          |
| `documentedVisibilities`     | 문서화할 가시성입니다. 세미콜론으로 구분된 여러 값을 허용합니다. 가능한 값: `PUBLIC`, `PRIVATE`, `PROTECTED`, `INTERNAL`, `PACKAGE`.                                             |
| `reportUndocumented`         | 문서화되지 않은 선언을 보고할지 여부입니다.                                                                                                                                    | 
| `noSkipEmptyPackages`        | 빈 패키지에 대한 페이지를 생성할지 여부입니다.                                                                                                                                 | 
| `skipDeprecated`             | 지원 중단된(deprecated) 선언을 건너뛸지 여부입니다.                                                                                                                            | 
| `jdkVersion`                 | JDK Javadoc 링크에 사용할 JDK 버전입니다.                                                                                                                                      |
| `languageVersion`            | 분석 및 샘플 설정에 사용되는 언어 버전입니다.                                                                                                                                  |
| `apiVersion`                 | 분석 및 샘플 설정에 사용되는 Kotlin API 버전입니다.                                                                                                                            |
| `noStdlibLink`               | Kotlin 표준 라이브러리에 대한 링크를 생성할지 여부입니다.                                                                                                                      | 
| `noJdkLink`                  | JDK Javadoc에 대한 링크를 생성할지 여부입니다.                                                                                                                                 | 
| `suppressedFiles`            | 제외할 파일들의 경로입니다. 세미콜론으로 구분된 여러 경로를 허용합니다.                                                                                                        |
| `suppressAnnotatedWith`      | 해당 어노테이션이 달린 선언을 숨기기 위한 어노테이션의 전체 경로 이름(FQNs) 목록입니다. 세미콜론으로 구분된 여러 값을 허용합니다.                                              |
| `analysisPlatform`           | 분석 설정에 사용되는 플랫폼입니다.                                                                                                                                             |
| `perPackageOptions`          | `matchingRegexp,-deprecated,-privateApi,+warnUndocumented,+suppress;...` 형식의 패키지 소스 세트 구성 목록입니다. 세미콜론으로 구분된 여러 값을 허용합니다.                    |
| `externalDocumentationLinks` | `{url}^{packageListUrl}` 형식의 외부 문서 링크입니다. `^^`로 구분된 여러 값을 허용합니다.                                                                                      |
| `srcLink`                    | 소스 디렉토리와 코드를 탐색하기 위한 웹 서비스 간의 매핑입니다. 세미콜론으로 구분된 여러 경로를 허용합니다.                                                                     |

## JSON 구성 {id="json-configuration"}

아래는 각 구성 섹션에 대한 예시와 상세 설명입니다. 페이지 하단에서 [모든 구성 옵션](#complete-configuration)이 적용된 예시도 확인할 수 있습니다.

### 일반 구성 {id="general-configuration"}

```json
{
  "moduleName": "Dokka Example",
  "moduleVersion": null,
  "outputDir": "./build/dokka/html",
  "failOnWarning": false,
  "suppressObviousFunctions": true,
  "suppressInheritedMembers": false,
  "offlineMode": false,
  "includes": [
    "module.md"
  ],
  "sourceLinks":  [
    { "_comment": "옵션은 별도 섹션에서 설명합니다" }
  ],
  "perPackageOptions": [
    { "_comment": "옵션은 별도 섹션에서 설명합니다" }
  ],
  "externalDocumentationLinks":  [
    { "_comment": "옵션은 별도 섹션에서 설명합니다" }
  ],
  "sourceSets": [
    { "_comment": "옵션은 별도 섹션에서 설명합니다" }
  ],
  "pluginsClasspath": [
    "./dokka-base-%dokkaVersion%.jar",
    "./kotlinx-html-jvm-0.8.0.jar",
    "./analysis-kotlin-symbols-%dokkaVersion%.jar",
    "./freemarker-2.3.31.jar"
  ]
}
```

<deflist collapsible="true">
    <def title="moduleName">
        <p>모듈을 지칭하는 데 사용되는 표시 이름입니다. 목차, 내비게이션, 로깅 등에 사용됩니다.</p>
        <p>기본값: <code>root</code></p>
    </def>
    <def title="moduleVersion">
        <p>모듈 버전입니다.</p>
        <p>기본값: 비어 있음</p>
    </def>
    <def title="outputDirectory">
        <p>출력 형식과 관계없이 문서가 생성되는 디렉토리입니다.</p>
        <p>기본값: <code>./dokka</code></p>
    </def>
    <def title="failOnWarning">
        <p>
            Dokka가 경고나 에러를 발생시켰을 때 문서 생성을 실패로 처리할지 여부입니다.
            프로세스는 모든 에러와 경고가 먼저 발생할 때까지 기다립니다.
        </p>
        <p>이 설정은 <code>reportUndocumented</code>와 함께 사용하면 유용합니다.</p>
        <p>기본값: <code>false</code></p>
    </def>
    <def title="suppressObviousFunctions">
        <p>명백한 함수들을 숨길지 여부입니다.</p>
            다음과 같은 경우 함수가 명백한 것으로 간주됩니다:
            <list>
                <li>
                    <code>kotlin.Any</code>, <code>Kotlin.Enum</code>, <code>java.lang.Object</code> 또는
                    <code>java.lang.Enum</code>에서 상속된 <code>equals</code>, <code>hashCode</code>, <code>toString</code> 등.
                </li>
                <li>
                    합성된(컴파일러에 의해 생성된) 함수이면서 문서가 없는 <code>dataClass.componentN</code> 또는 <code>dataClass.copy</code> 등.
                </li>
            </list>
        <p>기본값: <code>true</code></p>
    </def>
    <def title="suppressInheritedMembers">
        <p>해당 클래스에서 명시적으로 오버라이드되지 않은 상속된 멤버들을 숨길지 여부입니다.</p>
        <p>
            참고: 이 옵션은 <code>equals</code> / <code>hashCode</code> / <code>toString</code> 같은 함수를 숨길 수 있지만, 
            <code>dataClass.componentN</code> 및 <code>dataClass.copy</code>와 같은 합성 함수는 숨길 수 없습니다. 
            해당 함수들을 위해서는 <code>suppressObviousFunctions</code>를 사용하세요.
        </p>
        <p>기본값: <code>false</code></p>
    </def>
    <def title="offlineMode">
        <anchor name="includes-json"/>
        <p>네트워크를 통해 원격 파일/링크를 확인할지 여부입니다.</p>
        <p>
            여기에는 외부 문서 링크를 생성하는 데 사용되는 package-list도 포함됩니다.
            예를 들어, 표준 라이브러리의 클래스를 클릭 가능하게 만드는 데 사용됩니다.
        </p>
        <p>
            이 값을 <code>true</code>로 설정하면 특정 상황에서 빌드 시간을 크게 단축할 수 있지만,
            의존성(표준 라이브러리 포함)의 클래스/멤버 링크가 확인되지 않아 문서 품질과 사용자 경험이 저하될 수 있습니다.
        </p>
        <p>
            참고: 가져온 파일을 로컬에 캐시하고 Dokka에 로컬 경로로 제공할 수 있습니다. <code>externalDocumentationLinks</code> 섹션을 참고하세요.
        </p>
        <p>기본값: <code>false</code></p>
    </def>
    <def title="includes">
        <p>
            <a href="dokka-module-and-package-docs.md">모듈 및 패키지 문서</a>를 포함하는
            Markdown 파일 목록입니다.
        </p>
        <p>지정된 파일의 내용은 파싱되어 모듈 및 패키지 설명으로 문서에 포함됩니다.</p>
        <p>패키지별로 구성할 수도 있습니다.</p>
    </def>
    <def title="sourceSets">
        <p>
          Kotlin <a href="https://kotlinlang.org/docs/multiplatform-discover-project.html#source-sets">소스 세트</a>에 대한 
          개별 및 추가 구성입니다.
        </p>
        <p>가능한 옵션 목록은 <a href="#source-set-configuration">소스 세트 구성</a>을 참고하세요.</p>
    </def>
    <def title="sourceLinks">
        <p>모든 소스 세트에 적용되는 소스 링크의 전역 구성입니다.</p>
        <p>가능한 옵션 목록은 <a href="#source-link-configuration">소스 링크 구성</a>을 참고하세요.</p>
    </def>
    <def title="perPackageOptions">
        <p>소스 세트와 관계없이 일치하는 패키지에 적용되는 전역 구성입니다.</p>
        <p>가능한 옵션 목록은 <a href="#per-package-configuration">패키지별 구성</a>을 참고하세요.</p>
    </def>
    <def title="externalDocumentationLinks">
        <p>사용되는 소스 세트와 관계없이 적용되는 외부 문서 링크의 전역 구성입니다.</p>
        <p>가능한 옵션 목록은 <a href="#external-documentation-links-configuration">외부 문서 링크 구성</a>을 참고하세요.</p>
    </def>
    <def title="pluginsClasspath">
        <p>Dokka 플러그인과 그 의존성들이 포함된 JAR 파일 목록입니다.</p>
    </def>
</deflist>

### 소스 세트 구성 {id="source-set-configuration"}

Kotlin [소스 세트](https://kotlinlang.org/docs/multiplatform-discover-project.html#source-sets)를 구성하는 방법입니다.

```json
{
  "sourceSets": [
    {
      "displayName": "jvm",
      "sourceSetID": {
        "scopeId": "moduleName",
        "sourceSetName": "main"
      },
      "dependentSourceSets": [
        {
          "scopeId": "dependentSourceSetScopeId",
          "sourceSetName": "dependentSourceSetName"
        }
      ],
      "documentedVisibilities": ["PUBLIC", "PRIVATE", "PROTECTED", "INTERNAL", "PACKAGE"],
      "reportUndocumented": false,
      "skipEmptyPackages": true,
      "skipDeprecated": false,
      "jdkVersion": 8,
      "languageVersion": "1.7",
      "apiVersion": "1.7",
      "noStdlibLink": false,
      "noJdkLink": false,
      "includes": [
        "module.md"
      ],
      "analysisPlatform": "jvm",
      "sourceRoots": [
        "/home/ignat/IdeaProjects/dokka-debug-mvn/src/main/kotlin"
      ],
      "classpath": [
        "libs/kotlin-stdlib-%kotlinVersion%.jar",
        "libs/kotlin-stdlib-common-%kotlinVersion%.jar"
      ],
      "samples": [
        "samples/basic.kt"
      ],
      "suppressedFiles": [
        "src/main/kotlin/org/jetbrains/dokka/Suppressed.kt"
      ],
      "sourceLinks":  [
        { "_comment": "옵션은 별도 섹션에서 설명합니다" }
      ],
      "perPackageOptions": [
        { "_comment": "옵션은 별도 섹션에서 설명합니다" }
      ],
      "externalDocumentationLinks":  [
        { "_comment": "옵션은 별도 섹션에서 설명합니다" }
      ]
    }
  ]
}
```

<deflist collapsible="true">
    <def title="displayName">
        <p>이 소스 세트를 지칭하는 데 사용되는 표시 이름입니다.</p>
        <p>
            이 이름은 외부(예: 문서 독자에게 보이는 소스 세트 이름) 및 
            내부(예: <code>reportUndocumented</code>의 로깅 메시지) 모두에서 사용됩니다.
        </p>
        <p>더 적절한 대안이 없다면 플랫폼 이름을 사용할 수 있습니다.</p>
    </def>
    <def title="sourceSetID">
        <p>소스 세트의 기술적 ID입니다.</p>
    </def>
    <def title="documentedVisibilities">
        <p>문서화해야 할 가시성 수정자 집합입니다.</p>
        <p>
            이 옵션은 <code>protected</code>/<code>internal</code>/<code>private</code> 선언을 문서화하고 싶을 때나, 
            반대로 <code>public</code> 선언을 제외하고 내부 API만 문서화하고 싶을 때 사용할 수 있습니다.
        </p>
        <p>패키지별로 구성할 수도 있습니다.</p>
        <p>
            가능한 값:</p>
            <list>
                <li><code>PUBLIC</code></li>
                <li><code>PRIVATE</code></li>
                <li><code>PROTECTED</code></li>
                <li><code>INTERNAL</code></li>
                <li><code>PACKAGE</code></li>
            </list>
        <p>기본값: <code>PUBLIC</code></p>
    </def>
    <def title="reportUndocumented">
        <p>
            <code>documentedVisibilities</code> 및 기타 필터에 의해 걸러진 후에도 KDoc이 없는 가시적인 선언에 대해
            경고를 발생시킬지 여부입니다.
        </p>
        <p>이 설정은 <code>failOnWarning</code>과 함께 사용하면 유용합니다.</p>
        <p>패키지별로 구성할 수도 있습니다.</p>
        <p>기본값: <code>false</code></p>
    </def>
    <def title="skipEmptyPackages">
        <p>
            다양한 필터가 적용된 후 가시적인 선언이 없는 패키지를 건너뛸지 여부입니다.
        </p>
        <p>
            예를 들어, <code>skipDeprecated</code>가 <code>true</code>로 설정되어 있고 패키지에 지원 중단된 선언만 있는 경우, 해당 패키지는 비어 있는 것으로 간주됩니다.
        </p>
        <p>CLI 러너의 기본값은 <code>false</code>입니다.</p>
    </def>
    <def title="skipDeprecated">
        <p><code>@Deprecated</code> 주석이 달린 선언을 문서화할지 여부입니다.</p>
        <p>패키지별로 구성할 수도 있습니다.</p>
        <p>기본값: <code>false</code></p>
    </def>
    <def title="jdkVersion">
        <p>Java 타입에 대한 외부 문서 링크를 생성할 때 사용할 JDK 버전입니다.</p>
        <p>
            예를 들어, 공개 선언 시그니처에서 <code>java.util.UUID</code>를 사용하고 이 옵션이 <code>8</code>로 설정된 경우, Dokka는 해당 타입에 대해
            <a href="https://docs.oracle.com/javase/8/docs/api/java/util/UUID.html">JDK 8 Javadocs</a>로 연결되는 외부 문서 링크를 생성합니다.
        </p>
    </def>
    <def title="languageVersion">
        <p>
            분석 및 <a href="https://kotlinlang.org/docs/kotlin-doc.html#sample-identifier">@sample</a> 환경을 설정하는 데 사용되는 
            <a href="https://kotlinlang.org/docs/compatibility-modes.html">Kotlin 언어 버전</a>입니다.
        </p>
    </def>
    <def title="apiVersion">
        <p>
            분석 및 <a href="https://kotlinlang.org/docs/kotlin-doc.html#sample-identifier">@sample</a> 환경을 설정하는 데 사용되는 
            <a href="https://kotlinlang.org/docs/compatibility-modes.html">Kotlin API 버전</a>입니다.
        </p>
    </def>
    <def title="noStdlibLink">
        <p>
            Kotlin 표준 라이브러리의 API 레퍼런스 문서로 연결되는 외부 문서 링크를 생성할지 여부입니다.
        </p>
        <p>참고: <code>noStdLibLink</code>가 <code>false</code>일 때 링크가 생성<b>됩니다</b>.</p>
        <p>기본값: <code>false</code></p>
    </def>
    <def title="noJdkLink">
        <p>JDK의 Javadocs로 연결되는 외부 문서 링크를 생성할지 여부입니다.</p>
        <p>JDK Javadocs의 버전은 <code>jdkVersion</code> 옵션에 의해 결정됩니다.</p>
        <p>참고: <code>noJdkLink</code>가 <code>false</code>일 때 링크가 생성<b>됩니다</b>.</p>
        <p>기본값: <code>false</code></p>
    </def>
    <def title="includes">
        <p>
            <a href="dokka-module-and-package-docs.md">모듈 및 패키지 문서</a>를 포함하는
            Markdown 파일 목록입니다.
        </p>
        <p>지정된 파일의 내용은 파싱되어 모듈 및 패키지 설명으로 문서에 포함됩니다.</p>
    </def>
    <def title="analysisPlatform">
        <p>
            코드 분석 및 <a href="https://kotlinlang.org/docs/kotlin-doc.html#sample-identifier">@sample</a> 환경을 설정하는 데 사용되는 플랫폼입니다.
        </p>
        <p>
            가능한 값:</p>
            <list>
                <li><code>jvm</code></li>
                <li><code>common</code></li>
                <li><code>js</code></li>
                <li><code>native</code></li>
            </list>
    </def>
    <def title="sourceRoots">
        <p>
            분석 및 문서화할 소스 코드 루트입니다.
            디렉토리와 개별 <code>.kt</code> / <code>.java</code> 파일을 입력할 수 있습니다.
        </p>
    </def>
    <def title="classpath">
        <p>분석 및 대화형 샘플을 위한 클래스패스입니다.</p>
        <p>의존성에서 가져온 일부 타입이 자동으로 확인/인식되지 않을 때 유용합니다.</p>
        <p>이 옵션은 <code>.jar</code> 및 <code>.klib</code> 파일을 모두 허용합니다.</p>
    </def>
    <def title="samples">
        <p>
            <a href="https://kotlinlang.org/docs/kotlin-doc.html#sample-identifier">@sample</a> KDoc 태그를 통해 참조되는 샘플 함수를 포함하는 디렉토리나 파일 목록입니다.
        </p>
    </def>
    <def title="suppressedFiles">
        <p>문서 생성 시 제외할 파일들입니다.</p>
    </def>
    <def title="suppressAnnotatedWith">
        <p>해당 어노테이션이 달린 선언을 숨기기 위한 어노테이션의 전체 경로 이름(FQNs) 목록입니다.</p>
        <p>
            이 어노테이션들 중 하나가 달린 모든 선언은 생성된 문서에서 제외됩니다.
        </p>
    </def>
    <def title="sourceLinks">
        <p>이 소스 세트에만 적용되는 소스 링크 파라미터 집합입니다.</p>
        <p>가능한 옵션 목록은 <a href="#source-link-configuration">소스 링크 구성</a>을 참고하세요.</p>
    </def>
    <def title="perPackageOptions">
        <p>이 소스 세트 내의 특정 패키지에 적용되는 파라미터 집합입니다.</p>
        <p>가능한 옵션 목록은 <a href="#per-package-configuration">패키지별 구성</a>을 참고하세요.</p>
    </def>
    <def title="externalDocumentationLinks">
        <p>이 소스 세트에만 적용되는 외부 문서 링크 파라미터 집합입니다.</p>
        <p>가능한 옵션 목록은 <a href="#external-documentation-links-configuration">외부 문서 링크 구성</a>을 참고하세요.</p>
    </def>
</deflist>

### 소스 링크 구성 {id="source-link-configuration"}

`sourceLinks` 구성 블록을 사용하면 각 시그니처에 특정 라인 번호가 포함된 `remoteUrl`로 연결되는 `source` 링크를 추가할 수 있습니다. (라인 번호는 `remoteLineSuffix`를 설정하여 구성 가능합니다).

이를 통해 독자는 각 선언의 소스 코드를 쉽게 찾을 수 있습니다.

예를 들어, `kotlinx.coroutines`의 [`count()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/count.html) 함수 문서를 확인해 보세요.

모든 소스 세트에 대해 동시에 소스 링크를 구성하거나 [개별적으로](#source-set-configuration) 구성할 수 있습니다.

```json
{
  "sourceLinks": [
    {
      "localDirectory": "src/main/kotlin",
      "remoteUrl": "https://github.com/Kotlin/dokka/tree/master/src/main/kotlin",
      "remoteLineSuffix": "#L"
    }
  ]
}
```

<deflist collapsible="true">
    <def title="localDirectory">
        <p>로컬 소스 디렉토리의 경로입니다.</p>
    </def>
    <def title="remoteUrl">
        <p>
            GitHub, GitLab, Bitbucket 등 문서 독자가 액세스할 수 있는 소스 코드 호스팅 서비스의 URL입니다.
            이 URL은 선언의 소스 코드 링크를 생성하는 데 사용됩니다.
        </p>
    </def>
    <def title="remoteLineSuffix">
        <p>
            소스 코드 라인 번호를 URL에 추가하는 데 사용되는 접미사입니다. 이를 통해 독자는 파일뿐만 아니라
            선언이 위치한 특정 라인 번호로 이동할 수 있습니다.
        </p>
        <p>
            지정된 접미사 뒤에 번호 자체가 추가됩니다. 예를 들어, 이 옵션이 <code>#L</code>로 설정되어 있고 
            라인 번호가 10인 경우, 결과 URL 접미사는 <code>#L10</code>이 됩니다.
        </p>
        <p>
            주요 서비스에서 사용되는 접미사:</p>
            <list>
                <li>GitHub: <code>#L</code></li>
                <li>GitLab: <code>#L</code></li>
                <li>Bitbucket: <code>#lines-</code></li>
            </list>
        <p>기본값: 비어 있음 (접미사 없음)</p>
    </def>
</deflist>

### 패키지별 구성 {id="per-package-configuration"}

`perPackageOptions` 구성 블록을 사용하면 `matchingRegex`로 일치하는 특정 패키지에 대해 옵션을 설정할 수 있습니다.

모든 소스 세트에 대해 동시에 패키지 구성을 추가하거나 [개별적으로](#source-set-configuration) 추가할 수 있습니다.

```json
{
  "perPackageOptions": [
    {
      "matchingRegex": ".*internal.*",
      "suppress": false,
      "skipDeprecated": false,
      "reportUndocumented": false,
      "documentedVisibilities": ["PUBLIC", "PRIVATE", "PROTECTED", "INTERNAL", "PACKAGE"]
    }
  ]
}
```

<deflist collapsible="true">
    <def title="matchingRegex">
        <p>패키지를 매칭하는 데 사용되는 정규식입니다.</p>
    </def>
    <def title="suppress">
        <p>문서 생성 시 이 패키지를 제외할지 여부입니다.</p>
        <p>기본값: <code>false</code></p>
    </def>
    <def title="skipDeprecated">
        <p><code>@Deprecated</code> 주석이 달린 선언을 문서화할지 여부입니다.</p>
        <p>프로젝트/모듈 수준에서도 설정할 수 있습니다.</p>
        <p>기본값: <code>false</code></p>
    </def>
    <def title="reportUndocumented">
        <p>
            <code>documentedVisibilities</code> 및 기타 필터에 의해 걸러진 후에도 KDoc이 없는 가시적인 선언에 대해
            경고를 발생시킬지 여부입니다.
        </p>
        <p>이 설정은 <code>failOnWarning</code>과 함께 사용하면 유용합니다.</p>
        <p>소스 세트 수준에서도 구성할 수 있습니다.</p>
        <p>기본값: <code>false</code></p>
    </def>
    <def title="documentedVisibilities">
        <p>문서화해야 할 가시성 수정자 집합입니다.</p>
        <p>
            이 옵션은 패키지 내의 <code>protected</code>/<code>internal</code>/<code>private</code> 선언을 문서화하고 싶을 때나, 
            반대로 <code>public</code> 선언을 제외하고 내부 API만 문서화하고 싶을 때 사용할 수 있습니다.
        </p>
        <p>소스 세트 수준에서도 구성할 수 있습니다.</p>
        <p>기본값: <code>PUBLIC</code></p>
    </def>
</deflist>

### 외부 문서 링크 구성 {id="external-documentation-links-configuration"}

`externalDocumentationLinks` 블록을 사용하면 의존하고 있는 외부 호스팅 문서로 연결되는 링크를 생성할 수 있습니다.

예를 들어, `kotlinx.serialization`의 타입을 사용하고 있다면, 기본적으로 문서에서는 확인되지 않은 타입처럼 클릭할 수 없는 상태가 됩니다. 하지만 `kotlinx.serialization`의 API 레퍼런스 문서는 Dokka로 빌드되어 [kotlinlang.org에 게시](https://kotlinlang.org/api/kotlinx.serialization/)되어 있으므로, 이에 대한 외부 문서 링크를 구성할 수 있습니다. 이렇게 하면 Dokka가 해당 라이브러리의 타입에 대한 링크를 생성하여 클릭 가능하게 만들 수 있습니다.

모든 소스 세트에 대해 동시에 외부 문서 링크를 구성하거나 [개별적으로](#source-set-configuration) 구성할 수 있습니다.

```json
{
  "externalDocumentationLinks": [
    {
      "url": "https://kotlinlang.org/api/kotlinx.serialization/",
      "packageListUrl": "https://kotlinlang.org/api/kotlinx.serialization/package-list"
    }
  ]
}
```

<deflist collapsible="true">
    <def title="url">
        <p>연결할 문서의 루트 URL입니다. 반드시 슬래시(trailing slash)로 <b>끝나야</b> 합니다.</p>
        <p>
            Dokka는 제공된 URL에 대해 자동으로 <code>package-list</code>를 찾아 선언들을 서로 연결하려고 시도합니다.
        </p>
        <p>
            자동 확인에 실패하거나 로컬에 캐시된 파일을 대신 사용하려는 경우 <code>packageListUrl</code> 옵션 설정을 고려해 보세요.
        </p>
    </def>
    <def title="packageListUrl">
        <p>
            <code>package-list</code>의 정확한 위치입니다. 이는 Dokka의 자동 확인 기능 대신 사용할 수 있는 대안입니다.
        </p>
        <p>
            패키지 리스트에는 모듈 및 패키지 이름과 같은 문서 및 프로젝트 자체에 대한 정보가 포함되어 있습니다.
        </p>
        <p>네트워크 호출을 피하기 위해 로컬에 캐시된 파일일 수도 있습니다.</p>
    </def>
</deflist>

### 전체 구성 예시 {id="complete-configuration"}

아래는 모든 가능한 구성 옵션이 동시에 적용된 예시입니다.

```json
{
  "moduleName": "Dokka Example",
  "moduleVersion": null,
  "outputDir": "./build/dokka/html",
  "failOnWarning": false,
  "suppressObviousFunctions": true,
  "suppressInheritedMembers": false,
  "offlineMode": false,
  "suppressAnnotatedWith": [
    "com.example.SuppressMe"
  ],
  "sourceLinks": [
    {
      "localDirectory": "src/main/kotlin",
      "remoteUrl": "https://github.com/Kotlin/dokka/tree/master/src/main/kotlin",
      "remoteLineSuffix": "#L"
    }
  ],
  "externalDocumentationLinks": [
    {
      "url": "https://docs.oracle.com/javase/8/docs/api/",
      "packageListUrl": "https://docs.oracle.com/javase/8/docs/api/package-list"
    },
    {
      "url": "https://kotlinlang.org/api/core/kotlin-stdlib/",
      "packageListUrl": "https://kotlinlang.org/api/core/kotlin-stdlib/package-list"
    }
  ],
  "perPackageOptions": [
    {
      "matchingRegex": ".*internal.*",
      "suppress": false,
      "reportUndocumented": false,
      "skipDeprecated": false,
      "documentedVisibilities": ["PUBLIC", "PRIVATE", "PROTECTED", "INTERNAL", "PACKAGE"]
    }
  ],
  "sourceSets": [
    {
      "displayName": "jvm",
      "sourceSetID": {
        "scopeId": "moduleName",
        "sourceSetName": "main"
      },
      "dependentSourceSets": [
        {
          "scopeId": "dependentSourceSetScopeId",
          "sourceSetName": "dependentSourceSetName"
        }
      ],
      "documentedVisibilities": ["PUBLIC", "PRIVATE", "PROTECTED", "INTERNAL", "PACKAGE"],
      "reportUndocumented": false,
      "skipEmptyPackages": true,
      "skipDeprecated": false,
      "jdkVersion": 8,
      "languageVersion": "1.7",
      "apiVersion": "1.7",
      "noStdlibLink": false,
      "noJdkLink": false,
      "includes": [
        "module.md"
      ],
      "analysisPlatform": "jvm",
      "sourceRoots": [
        "/home/ignat/IdeaProjects/dokka-debug-mvn/src/main/kotlin"
      ],
      "classpath": [
        "libs/kotlin-stdlib-%kotlinVersion%.jar",
        "libs/kotlin-stdlib-common-%kotlinVersion%.jar"
      ],
      "samples": [
        "samples/basic.kt"
      ],
      "suppressedFiles": [
        "src/main/kotlin/org/jetbrains/dokka/Suppressed.kt"
      ],
      "suppressAnnotatedWith": [
        "com.example.SuppressMe"
      ],
      "sourceLinks": [
        {
          "localDirectory": "src/main/kotlin",
          "remoteUrl": "https://github.com/Kotlin/dokka/tree/master/src/main/kotlin",
          "remoteLineSuffix": "#L"
        }
      ],
      "externalDocumentationLinks": [
        {
          "url": "https://docs.oracle.com/javase/8/docs/api/",
          "packageListUrl": "https://docs.oracle.com/javase/8/docs/api/package-list"
        },
        {
          "url": "https://kotlinlang.org/api/core/kotlin-stdlib/",
          "packageListUrl": "https://kotlinlang.org/api/core/kotlin-stdlib/package-list"
        }
      ],
      "perPackageOptions": [
        {
          "matchingRegex": ".*internal.*",
          "suppress": false,
          "reportUndocumented": false,
          "skipDeprecated": false,
          "documentedVisibilities": ["PUBLIC", "PRIVATE", "PROTECTED", "INTERNAL", "PACKAGE"]
        }
      ]
    }
  ],
  "pluginsClasspath": [
    "./dokka-base-%dokkaVersion%.jar",
    "./kotlinx-html-jvm-0.8.0.jar",
    "./analysis-kotlin-symbols-%dokkaVersion%.jar",
    "./freemarker-2.3.31.jar"
  ],
  "pluginsConfiguration": [
    {
      "fqPluginName": "org.jetbrains.dokka.base.DokkaBase",
      "serializationFormat": "JSON",
      "values": "{\"separateInheritedMembers\":false,\"footerMessage\":\"© 2021 pretty good Copyright\"}"
    }
  ],
  "includes": [
    "module.md"
  ]
}
```
