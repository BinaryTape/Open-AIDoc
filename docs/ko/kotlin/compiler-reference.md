[//]: # (title: Kotlin 컴파일러 옵션)

<show-structure depth="1"/>

Kotlin의 각 릴리스에는 지원되는 타깃을 위한 컴파일러가 포함되어 있습니다:
JVM, JavaScript 및 [지원되는 플랫폼](native-overview.md#target-platforms)을 위한 네이티브 바이너리.

이 컴파일러들은 다음과 같은 경우에 사용됩니다:
* Kotlin 프로젝트에서 **Compile** 또는 **Run** 버튼을 클릭할 때 IDE에 의해 사용됩니다.
* 콘솔이나 IDE에서 `gradle build`를 실행할 때 Gradle에 의해 사용됩니다.
* 콘솔이나 IDE에서 `mvn compile` 또는 `mvn test-compile`을 실행할 때 Maven에 의해 사용됩니다.

[명령줄 컴파일러 사용법](command-line.md) 튜토리얼에 설명된 대로 명령줄에서 직접 Kotlin 컴파일러를 실행할 수도 있습니다.

## 컴파일러 옵션 {id="compiler-options"}

Kotlin 컴파일러에는 컴파일 프로세스를 맞춤 설정할 수 있는 다양한 옵션이 있습니다.
서로 다른 타깃에 대한 컴파일러 옵션과 각 옵션에 대한 설명이 이 페이지에 정리되어 있습니다.

컴파일러 옵션 및 해당 값(_컴파일러 인수_)을 설정하는 방법에는 여러 가지가 있습니다:
* IntelliJ IDEA의 경우, **Settings/Preferences** | **Build, Execution, Deployment** | **Compiler** | **Kotlin Compiler**의 **Additional command line parameters** 텍스트 상자에 컴파일러 인수를 입력합니다.
* Gradle을 사용하는 경우, Kotlin 컴파일 태스크의 `compilerOptions` 프로퍼티에 컴파일러 인수를 지정합니다.
자세한 내용은 [Gradle 컴파일러 옵션](gradle-compiler-options.md#how-to-define-options)을 참고하세요.
* Maven을 사용하는 경우, Maven 플러그인 노드의 `<configuration>` 엘리먼트에 컴파일러 인수를 지정합니다. 
자세한 내용은 [Maven](maven-kotlin-compiler.md#specify-compiler-options)을 참고하세요.
* 명령줄 컴파일러를 실행하는 경우, 유틸리티 호출 시 직접 컴파일러 인수를 추가하거나 [argfile](#argfile)에 작성합니다.

  예시:

  ```bash
  $ kotlinc hello.kt -include-runtime -d hello.jar
  ```

  > Windows에서는 구분 문자(공백, `=`, `;`, `,`)가 포함된 컴파일러 인수를 전달할 때 해당 인수를 큰따옴표(`"`)로 묶어야 합니다.
  > ```
  > $ kotlinc.bat hello.kt -include-runtime -d "My Folder\hello.jar"
  > ```
  {style="note"}

## 컴파일러 옵션 스키마 {id="schema-for-compiler-options"}

모든 컴파일러 옵션에 대한 공통 스키마는 JAR 아티팩트인 [`org.jetbrains.kotlin:kotlin-compiler-arguments-description`](https://central.sonatype.com/artifact/org.jetbrains.kotlin/kotlin-compiler-arguments-description)으로 게시됩니다. 이 아티팩트에는 코드 표현과 (Kotlin 이외의 사용자를 위한) 모든 컴파일러 옵션 설명의 JSON 동등물이 포함되어 있습니다. 또한 각 옵션이 도입되거나 안정화된 버전과 같은 메타데이터도 포함됩니다.

## 공통 옵션 {id="common-options"}

다음 옵션들은 모든 Kotlin 컴파일러에서 공통으로 지원됩니다.

### -api-version _version_ {id="api-version-version"}

런타임에 코드에서 사용할 수 있는 Kotlin API를 제어하기 위해 API 버전을 설정합니다. 예를 들어, Kotlin 컴파일러 버전 2.4.0에서 `-api-version=2.1`을 사용하는 경우 코드는 Kotlin 표준 라이브러리 2.1.0과의 호환성을 유지합니다.

`-api-version` 값을 `-language-version` 값보다 높게 설정할 수 없습니다.

대부분의 경우 API 버전과 [언어 버전](#language-version-version)은 동일해야 합니다. 한 가지 예외는 구버전의 Kotlin 표준 라이브러리를 실행해야 하는 사용자를 위한 라이브러리를 개발할 때입니다. 이 경우 해당 사용자가 사용할 수 없는 API를 실수로 사용하는 것을 방지하기 위해 더 낮은 API 버전을 설정합니다.

API 버전이 호환성에 미치는 영향에 대한 자세한 내용은 [라이브러리 작성자를 위한 하위 호환성 지침](api-guidelines-backward-compatibility.md#choose-compatible-language-and-api-versions)을 참고하세요.

### -help (-h) {id="help-h"}

사용법 정보를 표시하고 종료합니다. 표준 옵션만 표시됩니다.
고급 옵션을 보려면 `-X`를 사용하세요.

### -kotlin-home _path_ {id="kotlin-home-path"}

런타임 라이브러리 검색에 사용되는 Kotlin 컴파일러의 커스텀 경로를 지정합니다.

### -language-version _version_ {id="language-version-version"}

컴파일 중에 사용할 수 있는 Kotlin 언어 기능을 제어하기 위해 언어 버전을 설정합니다.

예를 들어, 컴파일러 동작을 변경하지 않고 새로운 컴파일 성능 개선의 이점을 얻고자 하는 경우, 최신 컴파일러 버전에 구버전 언어 버전을 함께 사용할 수 있습니다. 구버전 언어 버전을 사용하면 새로운 언어 기능을 사용할 수는 없지만, 해당 버전 이후에 도입된 새로운 에러나 지원 중단(deprecation)도 표시되지 않습니다.
이 방식은 구버전 Kotlin과의 호환성을 유지해야 하는 라이브러리 작성자에게 특히 유용합니다.
자세한 내용은 [라이브러리 작성자를 위한 하위 호환성 지침](api-guidelines-backward-compatibility.md#choose-compatible-language-and-api-versions)을 참고하세요.

최신 세 가지 안정 버전의 Kotlin 중 하나를 언어 버전으로 구성할 수 있습니다. 예를 들어, Kotlin 2.5.0은 2.2까지의 이전 언어 버전을 지원합니다.

구버전 언어 버전을 사용하는 경우 더 낮은 API 버전도 함께 사용해야 합니다.
자세한 내용은 [](#api-version-version)을 참고하세요.

> 기술적으로는 향후 언어 기능이 안정화되기 전에 사용해 보기 위해 최신 언어 버전을 구성할 수 있습니다.
> 그러나 각 기능의 전용 지침에 따라 개별 기능을 활성화하는 것이 가장 좋습니다.
> 
{style="tip"}

### -opt-in _annotation_ {id="opt-in-annotation"}

지정된 정규화된 이름(FQN)을 가진 요구 사항 어노테이션으로 [옵트인이 필요한](opt-in-requirements.md) API의 사용을 허용합니다.

### -P plugin:pluginId:optionName=value {id="p-plugin-pluginid-optionname-value"}

Kotlin 컴파일러 플러그인에 옵션을 전달합니다.
핵심 플러그인과 해당 옵션은 문서의 [Core compiler plugins](components-stability.md#core-compiler-plugins) 섹션에 나열되어 있습니다.

### -progressive {id="progressive"}

컴파일러의 [점진적 모드(progressive mode)](whatsnew13.md#progressive-mode)를 활성화합니다.

점진적 모드에서는 불안정한 코드에 대한 지원 중단 및 버그 수정 사항이 유예 마이그레이션 주기를 거치지 않고 즉시 적용됩니다.
점진적 모드에서 작성된 코드는 하위 호환성을 유지하지만, 점진적 모드가 아닌 상태에서 작성된 코드는 점진적 모드에서 컴파일 오류를 일으킬 수 있습니다.

### -script {id="script"}

Kotlin 스크립트 파일을 실행합니다. 이 옵션으로 호출하면 컴파일러는 주어진 인수 중 첫 번째 Kotlin 스크립트(`*.kts`) 파일을 실행합니다.

### -verbose {id="verbose"}

컴파일 프로세스의 세부 정보를 포함하는 상세한 로깅 출력을 활성화합니다.

### -version {id="version"}

컴파일러 버전을 표시합니다.

### -X {id="x"}

<primary-label ref="experimental-general"/>

고급 옵션에 대한 정보를 표시하고 종료합니다. 이 옵션들은 현재 불안정(unstable) 상태이며, 이름과 동작이 예고 없이 변경될 수 있습니다.

### Kotlin 계약(contract) 옵션 {id="kotlin-contract-options"}
<primary-label ref="experimental-general"/>

다음 옵션들은 실험적 Kotlin 계약(contract) 기능을 활성화합니다.

#### -Xallow-contracts-on-more-functions {id="xallow-contracts-on-more-functions"}

프로퍼티 접근자, 특정 연산자 함수, 제네릭 타입에 대한 타입 단언을 포함한 추가 선언에서 계약을 활성화합니다.

#### -Xallow-condition-implies-returns-contracts {id="xallow-condition-implies-returns-contracts"}

계약에서 `returnsNotNull()` 함수를 사용하여 지정된 조건에 대해 null이 아닌 반환 값을 가정할 수 있도록 허용합니다.

#### -Xallow-holdsin-contract {id="xallow-holdsin-contract"}

계약에서 `holdsIn` 키워드를 사용하여 람다 내부에서 부울 조건이 `true`임을 가정할 수 있도록 허용합니다.

#### -Xallow-returns-result-of {id="xallow-returns-result-of"}

미사용 반환 값 검사기(unused return value checker)가 고차 함수에서 무시할 수 있는 결과와 의미 있는 결과를 구분할 수 있도록 `returnsResultOf()` 계약 사용을 허용합니다.

### -Xallow-reified-type-in-catch {id="xallow-reified-type-in-catch"}
<primary-label ref="experimental-general"/>

`inline` 함수의 `catch` 절에서 구체화된(reified) `Throwable` 타입 파라미터에 대한 지원을 활성화합니다.

### -Xcollection-literals {id="xcollection-literals"}
<primary-label ref="experimental-general"/>

대괄호 구문 `[]`을 사용하는 [컬렉션 리터럴](whatsnew24.md#support-for-collection-literals)에 대한 지원을 활성화합니다.

### -Xcompiler-plugin-order={plugin.before>plugin.after} {id="xcompiler-plugin-order-plugin-before-plugin-after"}
<primary-label ref="experimental-general"/>

컴파일러 플러그인의 실행 순서를 구성합니다. 컴파일러는 `plugin.before`를 먼저 실행한 다음 `plugin.after`를 실행합니다:

세 개 이상의 플러그인에 대해 여러 순서 지정 규칙을 정의할 수 있습니다. 예를 들어:

```bash
kotlinc -Xcompiler-plugin-order=plugin.first>plugin.middle
kotlinc -Xcompiler-plugin-order=plugin.middle>plugin.last
```

이는 다음과 같은 실행 순서를 생성합니다:

1. `plugin.first`
2. `plugin.middle`
3. `plugin.last`

컴파일러 플러그인이 존재하지 않는 경우 해당 규칙은 무시됩니다.

다음 플러그인들을 해당 ID로 구성할 수 있습니다:

| 컴파일러 플러그인             | 플러그인 ID                                 |
|-----------------------------|--------------------------------------------|
| `all-open`, `kotlin-spring` | `org.jetbrains.kotlin.allopen`             |
| AtomicFU                    | `org.jetbrains.kotlinx.atomicfu`           |
| Compose                     | `androidx.compose.compiler.plugins.kotlin` |
| `js-plain-objects`          | `org.jetbrains.kotlinx.jspo`               |
| `jvm-abi-gen`               | `org.jetbrains.kotlin.jvm.abi`             |
| kapt                        | `org.jetbrains.kotlin.kapt3`               |
| Lombok                      | `org.jetbrains.kotlin.lombok`              |
| `no-arg`, `kotlin-jpa`      | `org.jetbrains.kotlin.noarg`               |
| Parcelize                   | `org.jetbrains.kotlin.parcelize`           |
| Power-assert                | `org.jetbrains.kotlin.powerassert`         |
| SAM with receiver           | `org.jetbrains.kotlin.samWithReceiver`     |
| Serialization               | `org.jetbrains.kotlinx.serialization`      |

이 실행 순서는 컴파일러 플러그인의 프론트엔드가 아닌 백엔드만 제어합니다.

### -Xdata-flow-based-exhaustiveness {id="xdata-flow-based-exhaustiveness"}
<primary-label ref="experimental-general"/>

`when` 식에 대한 데이터 흐름 기반의 완전성(exhaustiveness) 검사를 활성화합니다.

### -Xexplicit-context-arguments {id="xexplicit-context-arguments"}
<primary-label ref="experimental-general"/>

컨텍스트 파라미터에 대한 명시적 [컨텍스트 인수(context arguments)](context-parameters.md#pass-context-arguments-explicitly)를 활성화합니다.

이를 통해 호출 측에서 컨텍스트 인수를 전달하여 오버로드 모호성을 해결할 수 있습니다.

### -Xklib-ir-inliner {id="xklib-ir-inliner"}
<primary-label ref="experimental-general"/>

Kotlin/Native, Kotlin/JS, Kotlin/Wasm에 대해 [모듈 내 인라이닝(intra-module inlining)](whatsnew24.md#consistent-intra-module-function-inlining-during-klib-compilation) 활성화 여부를 구성합니다. 기본적으로 활성화되어 있습니다.

이 옵션은 다음 모드를 지원합니다:

* `disabled`: Kotlin/Native, Kotlin/JS, Kotlin/Wasm에 대한 모듈 내 인라이닝을 비활성화합니다.
* `full`: 모듈 간 인라이닝(cross-module inlining)을 활성화합니다.

### -Xintrinsic-const-evaluation {id="xintrinsic-const-evaluation"}
<primary-label ref="experimental-general"/>

[개선된 컴파일 타임 상수](whatsnew24.md#improved-compile-time-constants)를 활성화합니다.

### -Xname-based-destructuring {id="xname-based-destructuring"}
<primary-label ref="experimental-opt-in"/>

컴파일러가 프로퍼티 이름을 기반으로 [구조 분해 선언](destructuring-declarations.md#name-based-destructuring)을 해석하는 방식을 구성합니다.

이 옵션은 다음 모드를 지원합니다:

* `only-syntax`: 기존 구조 분해 선언의 동작을 변경하지 않고 이름 기반 구조 분해의 명시적 형태를 활성화합니다.
* `name-mismatch`: 데이터 클래스의 위치 기반 구조 분해에서 프로퍼티 이름과 일치하지 않는 변수 이름을 사용할 때 경고를 보고합니다.
* `complete`: 괄호를 사용하는 축약형 이름 기반 구조 분해를 활성화하고 대괄호 구문을 사용하는 위치 기반 구조 분해를 계속 지원합니다.

### -Xphases-to-dump-before {id="xphases-to-dump-before"}
<primary-label ref="experimental-general"/>

IR 로어링(lowering) 컴파일 단계 이후에 덤프 파일을 생성하도록 `ExternalPackageParentPatcherLowering`으로 설정합니다. Kotlin/JVM에 대한 출력 디렉터리는 [`-Xdump-directory`](#xdump-directory) 컴파일러 옵션으로 구성합니다.

### -Xrepl {id="xrepl"}
<primary-label ref="experimental-general"/>

Kotlin REPL을 실행합니다.

```bash
kotlinc -Xrepl
```

### -Xreturn-value-checker {id="xreturn-value-checker"}
<primary-label ref="experimental-general"/>

컴파일러가 [무시된 결과를 보고하는 방식](unused-return-value-checker.md)을 구성합니다:

* `disable`: 미사용 반환 값 검사기를 비활성화합니다(기본값).
* `check`: 검사기를 활성화하고 지정된 함수에서 무시된 결과에 대해 경고를 보고합니다.
* `full`: 검사기를 활성화하고 프로젝트의 모든 함수를 대상 함수로 취급하여 무시된 결과에 대해 경고를 보고합니다.

### 경고 관리 {id="warning-management"}

#### -nowarn {id="nowarn"}

컴파일 중 모든 경고를 억제(suppress)합니다.

#### -Werror {id="werror"}

모든 경고를 컴파일 에러로 처리합니다.

#### -Wextra {id="wextra"}

참인 경우 경고를 발생시키는 [추가적인 선언, 식 및 타입 컴파일러 검사](whatsnew21.md#extra-compiler-checks)를 활성화합니다.

#### -Xrender-internal-diagnostic-names {id="xrender-internal-diagnostic-names"}
<primary-label ref="experimental-general"/>

경고와 함께 내부 진단(diagnostic) 이름을 출력합니다. 이는 `-Xwarning-level` 옵션에 구성할 `DIAGNOSTIC_NAME`을 식별하는 데 유용합니다.

#### -Xwarning-level {id="xwarning-level"}
<primary-label ref="experimental-general"/>

특정 컴파일러 경고의 심각도 수준을 구성합니다:

```bash
kotlinc -Xwarning-level=DIAGNOSTIC_NAME:(error|warning|disabled)
```

* `error`: 지정된 경고만 에러로 격상합니다.
* `warning`: 지정된 진단에 대해 경고를 발생시키며, 기본적으로 활성화되어 있습니다.
* `disabled`: 지정된 경고만 모듈 전체에서 억제합니다.

모듈 전체 규칙과 특정 규칙을 결합하여 프로젝트의 경고 보고를 조정할 수 있습니다:

| 명령어                                             | 설명                                                        |
|----------------------------------------------------|-------------------------------------------------------------|
| `-nowarn -Xwarning-level=DIAGNOSTIC_NAME:warning`  | 지정된 경고를 제외한 모든 경고를 억제합니다.                  |
| `-Werror -Xwarning-level=DIAGNOSTIC_NAME:warning`  | 지정된 경고를 제외한 모든 경고를 에러로 격상합니다.          |
| `-Wextra -Xwarning-level=DIAGNOSTIC_NAME:disabled` | 지정된 검사를 제외한 모든 추가 검사를 활성화합니다.          |

일반 규칙에서 제외할 경고가 많은 경우, [`@argfile`](#argfile)을 사용하여 별도의 파일에 목록을 작성할 수 있습니다.

`DIAGNOSTIC_NAME`을 확인하려면 [`-Xrender-internal-diagnostic-names`](#xrender-internal-diagnostic-names)를 사용할 수 있습니다.

### @argfile {id="argfile"}

지정된 파일에서 컴파일러 옵션을 읽어옵니다. 이러한 파일에는 값과 소스 파일 경로가 포함된 컴파일러 옵션이 들어갈 수 있습니다. 옵션과 경로는 공백으로 구분해야 합니다. 예시:

```
-include-runtime -d hello.jar hello.kt
```

공백이 포함된 값을 전달하려면 작은따옴표(**'**) 또는 큰따옴표(**"**)로 묶으세요. 값 안에 따옴표가 포함된 경우 백슬래시(**\\**)로 이스케이프 처리하세요.

```
-include-runtime -d 'My folder'
```

예를 들어 소스 파일과 컴파일러 옵션을 분리하기 위해 여러 개의 인수 파일을 전달할 수도 있습니다.

```bash
$ kotlinc @compiler.options @classes
```

파일이 현재 디렉터리와 다른 위치에 있는 경우 상대 경로를 사용하세요.

```bash
$ kotlinc @options/compiler.options hello.kt
```

## Kotlin/JVM 컴파일러 옵션 {id="kotlin-jvm-compiler-options"}

Kotlin/JVM 컴파일러는 Kotlin 소스 파일을 Java 클래스 파일로 컴파일합니다.
Kotlin을 JVM으로 컴파일하기 위한 명령줄 도구는 `kotlinc` 및 `kotlinc-jvm`입니다.
이 도구들을 사용하여 Kotlin 스크립트 파일을 실행할 수도 있습니다.

[공통 옵션](#common-options) 외에도 Kotlin/JVM 컴파일러에는 아래에 나열된 옵션들이 있습니다.

### -classpath _path_ (-cp _path_) {id="classpath-path-cp-path"}

지정된 경로에서 클래스 파일을 검색합니다. 클래스패스의 각 요소는 시스템 경로 구분 기호(Windows는 **;**, macOS/Linux는 **:**)로 구분합니다.
클래스패스에는 파일 및 디렉터리 경로, ZIP 또는 JAR 파일이 포함될 수 있습니다.

### -d _path_ {id="d-path"}

생성된 클래스 파일을 지정된 위치에 배치합니다. 위치는 디렉터리, ZIP 또는 JAR 파일일 수 있습니다.

### -include-runtime {id="include-runtime"}

결과 JAR 파일에 Kotlin 런타임을 포함합니다. 이를 통해 결과 아카이브를 Java 지원 환경 어디에서나 실행할 수 있습니다.

### -jdk-home _path_ {id="jdk-home-path"}

기본 `JAVA_HOME`과 다른 경우 클래스패스에 포함할 커스텀 JDK 홈 디렉터리를 사용합니다.

### -Xjdk-release=version {id="xjdk-release-version"}

<primary-label ref="experimental-general"/>

생성된 JVM 바이트코드의 타깃 버전을 지정합니다. 클래스패스에 있는 JDK의 API를 지정된 Java 버전으로 제한합니다.
자동으로 [`-jvm-target version`](#jvm-target-version)을 설정합니다.
사용 가능한 값은 `1.8`, `9`, `10`, ..., `26`입니다.

> 이 옵션이 모든 JDK 배포판에서 유효하다는 것은 [보장되지 않습니다](https://youtrack.jetbrains.com/issue/KT-29974).
>
{style="note"}

### -jvm-default _mode_ {id="jvm-default-mode"}

인터페이스에 선언된 함수가 JVM에서 기본 메서드(default method)로 컴파일되는 방식을 제어합니다.

| 모드               | 설명                                                                                                                              |
|--------------------|-----------------------------------------------------------------------------------------------------------------------------------|
| `enable`           | 인터페이스에 기본 구현을 생성하고, 하위 클래스 및 `DefaultImpls` 클래스에 브리지 함수를 포함합니다. (기본값)                        |
| `no-compatibility` | 호환성 브리지 및 `DefaultImpls` 클래스를 건너뛰고 인터페이스에 기본 구현만 생성합니다.                                           |
| `disable`          | 기본 메서드를 건너뛰고 호환성 브리지 및 `DefaultImpls` 클래스만 생성합니다.                                                     |

### -jvm-target _version_ {id="jvm-target-version"}

생성된 JVM 바이트코드의 타깃 버전을 지정합니다. 사용 가능한 값은 `1.8`, `9`, `10`, ..., `26`입니다.
기본값은 `%defaultJvmTargetVersion%`입니다.

### -java-parameters {id="java-parameters"}

메서드 파라미터에 대한 Java 1.8 리플렉션용 메타데이터를 생성합니다.

### -module-name _name_ (JVM) {id="module-name-name-jvm"}

생성된 `.kotlin_module` 파일의 커스텀 이름을 설정합니다.
  
### -no-jdk {id="no-jdk"}

클래스패스에 Java 런타임을 자동으로 포함하지 않습니다.

### -no-reflect {id="no-reflect"}

클래스패스에 Kotlin 리플렉션(`kotlin-reflect.jar`)을 자동으로 포함하지 않습니다.

### -no-stdlib (JVM) {id="no-stdlib-jvm"}

클래스패스에 Kotlin/JVM 표준 라이브러리(`kotlin-stdlib.jar`) 및 Kotlin 리플렉션(`kotlin-reflect.jar`)을 자동으로 포함하지 않습니다.
  
### -script-templates _classnames[,]_ {id="script-templates-classnames"}

스크립트 정의 템플릿 클래스입니다. 정규화된 클래스 이름을 사용하고 쉼표(**,**)로 구분합니다.

### -Xadd-modules=module[,] {id="xadd-modules-module"}
<primary-label ref="experimental-general"/>

초기 모듈 외에 확인할 루트 모듈을 지정합니다. 모듈 경로의 모든 모듈을 확인하려면 `ALL-MODULE-PATH` 값을 설정하세요. 여러 모듈은 쉼표(**,**)로 구분합니다.

예를 들어 인큐베이터 모듈을 확인하려면 다음과 같이 합니다:

```bash
kotlinc -Xadd-modules=jdk.incubator.vector
```

### -Xdump-directory {id="xdump-directory"}
<primary-label ref="experimental-general"/>

[`-Xphases-to-dump-before`](#xphases-to-dump-before) 컴파일러 옵션에 사용할 덤프 파일 디렉터리를 구성합니다.

### -Xjvm-expose-boxed {id="xjvm-expose-boxed"}
<primary-label ref="experimental-general"/>

모듈의 모든 인라인 값 클래스의 박싱된(boxed) 버전과 이를 사용하는 함수의 박싱된 변형을 생성하여 Java에서 둘 다 접근할 수 있도록 만듭니다. 자세한 내용은 Java에서 Kotlin 호출 가이드의 [인라인 값 클래스](java-to-kotlin-interop.md#inline-value-classes)를 참고하세요.

### -Xnullability-annotations {id="xnullability-annotations"}
<primary-label ref="experimental-general"/>

Kotlin 컴파일러가 특정 Java 패키지의 널 허용 여부(nullability) 어노테이션을 해석하는 방식을 구성합니다.

지원되는 전체 어노테이션 목록 및 구성 옵션은 [Nullability annotations](java-interop.md#nullability-annotations)를 참고하세요.

## Kotlin/JS 컴파일러 옵션 {id="kotlin-js-compiler-options"}

Kotlin/JS 컴파일러는 Kotlin 소스 파일을 JavaScript 코드로 컴파일합니다.
Kotlin을 JS로 컴파일하기 위한 명령줄 도구는 `kotlinc-js`입니다.

[공통 옵션](#common-options) 외에도 Kotlin/JS 컴파일러에는 아래에 나열된 옵션들이 있습니다.

### -libraries _path_ {id="libraries-path"}

시스템 경로 구분 기호로 구분된 `.meta.js` 및 `.kjsm` 파일이 포함된 Kotlin 라이브러리의 경로입니다.

### -main _{call|noCall}_ {id="main-call-nocall"}

실행 시 `main` 함수를 호출해야 하는지 여부를 정의합니다.

### -meta-info {id="meta-info"}

메타데이터가 포함된 `.meta.js` 및 `.kjsm` 파일을 생성합니다. JS 라이브러리를 만들 때 이 옵션을 사용하세요.

### -module-kind {umd|commonjs|amd|plain} {id="module-kind-umd-commonjs-amd-plain"}

컴파일러에서 생성되는 JS 모듈의 종류입니다:

- `umd` - [Universal Module Definition](https://github.com/umdjs/umd) 모듈
- `commonjs` - [CommonJS](http://www.commonjs.org/) 모듈
- `amd` - [Asynchronous Module Definition](https://en.wikipedia.org/wiki/Asynchronous_module_definition) 모듈
- `plain` - 일반 JS 모듈
    
다양한 종류의 JS 모듈과 그 차이점에 대해 자세히 알아보려면 [이 문서](https://www.davidbcalhoun.com/2014/what-is-amd-commonjs-and-umd/)를 참고하세요.

### -no-stdlib (JS) {id="no-stdlib-js"}

컴파일 의존성에 기본 Kotlin/JS 표준 라이브러리를 자동으로 포함하지 않습니다.

### -output _filepath_ {id="output-filepath"}

컴파일 결과 대상 파일을 설정합니다. 값은 이름을 포함한 `.js` 파일의 경로여야 합니다.

### -output-postfix _filepath_ {id="output-postfix-filepath"}

지정된 파일의 내용을 출력 파일 끝에 추가합니다.

### -output-prefix _filepath_ {id="output-prefix-filepath"}

지정된 파일의 내용을 출력 파일 시작 부분에 추가합니다.

### -source-map {id="source-map"}

소스 맵을 생성합니다.

### -source-map-base-dirs _path_ {id="source-map-base-dirs-path"}

지정된 경로를 기본 디렉터리로 사용합니다. 기본 디렉터리는 소스 맵에서 상대 경로를 계산하는 데 사용됩니다.

### -source-map-embed-sources _{always|never|inlining}_ {id="source-map-embed-sources-always-never-inlining"}

소스 맵에 소스 파일을 포함합니다.

### -source-map-names-policy _{simple-names|fully-qualified-names|no}_ {id="source-map-names-policy-simple-names-fully-qualified-names-no"}

Kotlin 코드에 선언된 변수 및 함수 이름을 소스 맵에 추가합니다.

| 설정                    | 설명                                                        | 출력 예시                         |
|-------------------------|-------------------------------------------------------------|-----------------------------------|
| `simple-names`          | 변수 이름과 단순 함수 이름이 추가됩니다. (기본값)              | `main`                            |
| `fully-qualified-names` | 변수 이름과 정규화된 함수 이름이 추가됩니다.                 | `com.example.kjs.playground.main` |
| `no`                    | 변수나 함수 이름이 추가되지 않습니다.                       | N/A                               |

### -source-map-prefix {id="source-map-prefix"}

소스 맵의 경로에 지정된 접두사를 추가합니다.

### -target {es5|es2015|es2020} {id="target-es5-es2015-es2020"}

지정된 ECMA 버전에 맞는 JS 파일을 생성합니다.

### -Xenable-implementing-interfaces-from-typescript {id="xenable-implementing-interfaces-from-typescript"}
<primary-label ref="experimental-general"/>

JavaScript/TypeScript에서 `@JsExport` 어노테이션으로 내보낸 [Kotlin 인터페이스 구현](whatsnew2320.md#implementing-kotlin-interfaces-from-javascript-typescript)을 허용합니다.

### -Xes-long-as-bigint {id="xes-long-as-bigint"}

최신 JavaScript(ES2020)로 컴파일할 때 Kotlin `Long` 값을 나타내기 위해 JavaScript `BigInt` 타입에 대한 지원을 활성화합니다.
이 옵션은 `es5` 및 `es2015` 타깃에만 필요합니다. `es2020` 타깃은 기본적으로 이 옵션을 활성화합니다.

### -Xsuspend-lambda-exporting {id="xsuspend-lambda-exporting"}
<primary-label ref="experimental-general"/>

`@JsExport` 선언에 명시된 [중단 람다 식(suspending lambda expression) 내보내기](js-to-kotlin-interop.md#export-suspending-lambdas)를 JavaScript `async` 함수 형태로 허용합니다.

## Kotlin/Native 컴파일러 옵션 {id="kotlin-native-compiler-options"}

Kotlin/Native 컴파일러는 [지원되는 플랫폼](native-overview.md#target-platforms)을 위한 네이티브 바이너리로 Kotlin 소스 파일을 컴파일합니다.
Kotlin/Native 컴파일을 위한 명령줄 도구는 `kotlinc-native`입니다.

[공통 옵션](#common-options) 외에도 Kotlin/Native 컴파일러에는 아래에 나열된 옵션들이 있습니다.

### -enable-assertions (-ea) {id="enable-assertions-ea"}

생성된 코드에서 런타임 단언(assertion)을 활성화합니다.

### -entry _name_ (-e _name_) {id="entry-name-e-name"}

정규화된 진입점 이름을 지정합니다.

### -g {id="g"}

디버그 정보 방출을 활성화합니다. 이 옵션은 최적화 수준을 낮추므로 [`-opt`](#opt) 옵션과 함께 사용해서는 안 됩니다.
    
### -generate-test-runner (-tr) {id="generate-test-runner-tr"}

프로젝트에서 단위 테스트를 실행하기 위한 애플리케이션을 생성합니다.

### -generate-no-exit-test-runner (-trn) {id="generate-no-exit-test-runner-trn"}

명시적인 프로세스 종료 없이 단위 테스트를 실행하기 위한 애플리케이션을 생성합니다.

### -include-binary _path_ (-ib _path_) {id="include-binary-path-ib-path"}

생성된 klib 파일 내에 외부 바이너리를 패키징합니다.

### -library _path_ (-l _path_) {id="library-path-l-path"}

라이브러리와 링크합니다. Kotlin/Native 프로젝트에서 라이브러리를 사용하는 방법에 대해 알아보려면 [Kotlin/Native 라이브러리](native-libraries.md)를 참고하세요.

### -library-version _version_ (-lv _version_) {id="library-version-version-lv-version"}

라이브러리 버전을 설정합니다.

### -linker-option {id="linker-option"}

바이너리 빌드 중에 링커에 인수를 전달합니다. 특정 네이티브 라이브러리에 링크하는 데 사용할 수 있습니다.

### -linker-options _args_ {id="linker-options-args"}

바이너리 빌드 중에 링커에 여러 인수를 전달합니다. 인수는 공백으로 구분합니다.
    
### -list-targets {id="list-targets"}

사용 가능한 하드웨어 타깃을 나열합니다.

### -manifest _path_ {id="manifest-path"}

매니페스트 추가(addend) 파일을 제공합니다.

### -module-name _name_ (Native) {id="module-name-name-native"}

컴파일 모듈의 이름을 지정합니다.
이 옵션은 Objective-C로 내보내는 선언의 이름 접두사를 지정하는 데에도 사용할 수 있습니다:
[Kotlin 프레임워크에 커스텀 Objective-C 접두사/이름을 지정하려면 어떻게 해야 하나요?](native-faq.md#how-do-i-specify-a-custom-objective-c-prefix-name-for-my-kotlin-framework)

### -native-library _path_ (-nl _path_) {id="native-library-path-nl-path"}

네이티브 비트코드 라이브러리를 포함합니다.

### -no-default-libs {id="no-default-libs"}

컴파일러와 함께 배포되는 사전 빌드된 [플랫폼 라이브러리](native-platform-libs.md)와 사용자 코드의 링크를 비활성화합니다.

### -nomain {id="nomain"}

`main` 진입점이 외부 라이브러리에 의해 제공되는 것으로 가정합니다.

### -nopack {id="nopack"}

라이브러리를 klib 파일로 패키징하지 않습니다.

### -nostdlib {id="nostdlib"}

표준 라이브러리(stdlib)와 링크하지 않습니다.

### -opt {id="opt"}

컴파일 최적화를 활성화하고 더 나은 런타임 성능을 가진 바이너리를 생성합니다. 최적화 수준을 낮추는 [`-g`](#g) 옵션과 함께 사용하는 것은 권장되지 않습니다.

### -output _name_ (-o _name_) {id="output-name-o-name"}

출력 파일의 이름을 설정합니다.

### -produce _output_ (-p _output_) {id="produce-output-p-output"}

출력 파일 종류를 지정합니다:

- `program`
- `static`
- `dynamic`
- `framework`
- `library`
- `bitcode`

### -repo _path_ (-r _path_) {id="repo-path-r-path"}

라이브러리 검색 경로입니다. 자세한 내용은 [라이브러리 검색 순서](native-libraries.md#library-search-sequence)를 참고하세요.

### -target _target_ {id="target-target"}

하드웨어 타깃을 설정합니다. 사용 가능한 타깃 목록을 보려면 [`-list-targets`](#list-targets) 옵션을 사용하세요.

### -Xccall-mode {id="xccall-mode"}
<primary-label ref="experimental-general"/>

cinterop을 통해 가져온 C 또는 Objective-C 라이브러리에 대한 [새로운 상호 운용성 모드](whatsnew2320.md#new-interoperability-mode-for-c-or-objective-c-libraries)를 활성화합니다.

### -Xoverride-konan-properties=min.version.* {id="xoverride-konan-properties-min-version"}
<primary-label ref="experimental-general"/>

Kotlin 기본값보다 낮은 버전의 Apple 타깃 지원 버전을 구성합니다. 예를 들어:

```bash
kotlinc -Xoverride-konan-properties=minVersion.ios=14.0
kotlinc -Xoverride-konan-properties=minVersion.macos=11.0
kotlinc -Xoverride-konan-properties=minVersion.tvos=14.0
kotlinc -Xoverride-konan-properties=minVersion.watchos=7.0
```