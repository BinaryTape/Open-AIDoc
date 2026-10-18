[//]: # (title: Kotlin 백엔드 개발 관련 FAQ)

이 페이지에서는 Maven을 사용하여 Kotlin 백엔드 애플리케이션을 빌드, 테스트 및 배포할 때 자주 묻는 질문들에 대해 답변합니다.
각 답변에는 Kotlin 또는 외부 공식 문서의 자세한 설명으로 연결되는 링크가 포함되어 있습니다.

## 멀티모듈 빌드, BOM 및 버전 관리 {id="multi-module-builds-bom-and-version-management"}

### 멀티모듈 빌드 전체에서 단일 Kotlin 버전을 고정하려면 어떻게 해야 하나요? {id="how-to-pin-a-single-kotlin-version-across-a-multi-module-build"}

부모 POM 파일에 단일 `kotlin.version` 프로퍼티를 선언하고 모든 곳에서 이를 재사용하세요.

* 부모 `pom.xml` 파일에서 `kotlin-maven-plugin` 버전을 한 번만 설정합니다. 이렇게 하려면 `<properties>` 섹션에서 Kotlin 버전을 설정하고, `<build><plugins>` 또는 `<build><pluginManagement>` 섹션에서 `${kotlin.version}`으로 참조합니다.
  자세한 내용은 [프로젝트 구성](mixing-java-kotlin-intellij.md#maven)을 참조하세요.
* Kotlin BOM 파일을 통해 Kotlin 라이브러리 버전을 일치시켜 `kotlin-stdlib`, `kotlin-reflect`, `kotlin-test` 및 기타 아티팩트가 항상 동일한 릴리스로 확인(resolve)되고 모듈마다 달라지지 않도록 합니다.
  자세한 내용은 [BOM으로 의존성 관리하기](maven-set-dependencies.md#manage-dependencies-with-a-bom)를 참조하세요.

### Kotlin BOM이란 무엇이며 어떻게 사용하나요? {id="what-is-the-kotlin-bom-and-how-to-use-it"}

Kotlin BOM(`org.jetbrains.kotlin:kotlin-bom`)은 전이 의존성(transitive dependencies)으로 가져오는 경우에도 관련 아티팩트가 동일한 Kotlin 릴리스와 일치하도록 Kotlin 라이브러리의 버전을 관리하는 특수 POM 파일입니다.

`pom.xml`의 `<dependencyManagement>` 섹션에서 `<type>pom</type>` 및 `<scope>import</scope>`로 임포트합니다.
그런 다음 `<version>` 없이 Kotlin 의존성을 선언할 수 있습니다. 버전은 BOM 파일에서 자동으로 가져옵니다.

자세한 내용은 [BOM으로 의존성 관리하기](maven-set-dependencies.md#manage-dependencies-with-a-bom)를 참조하세요.

### Kotlin Maven 플러그인 버전을 Kotlin 라이브러리 버전과 일치시켜야 하나요? {id="do-i-need-to-keep-the-kotlin-maven-plugin-version-aligned-with-kotlin-library-versions"}

네. 컴파일러 버전과 호환되지 않는 Kotlin 라이브러리를 혼용하면 "Mixed Kotlin versions" 오류 및 메타데이터 비호환성 문제가 발생할 수 있습니다. 일관성을 유지하는 가장 쉬운 방법은 한 번 정의된 동일한 Kotlin 버전을 사용하는 것입니다. 예를 들면 다음과 같습니다.

* 부모 `pom.xml` 파일에서 [`kotlin-maven-plugin`](maven-kotlin-compiler.md) 버전을 한 번 설정한 다음, 모든 곳에서 `${kotlin.version}`으로 참조합니다.
* [Kotlin BOM](maven-set-dependencies.md#manage-dependencies-with-a-bom)을 임포트하여 모든 Kotlin 라이브러리가 동일한 릴리스를 따르도록 합니다.

### 모든 모듈에서 Kotlin 컴파일러 옵션을 구성하려면 어떻게 해야 하나요? {id="how-to-configure-kotlin-compiler-options-across-all-modules"}

모든 Maven 모듈에서 Kotlin 컴파일러를 구성하려면 다음 방법 중 하나를 사용하여 부모 `pom.xml` 파일의 한 곳에서 옵션을 설정합니다.

* 부모 `<properties>` 섹션에서 `kotlin.compiler.languageVersion`, `kotlin.compiler.apiVersion`, `kotlin.compiler.jvmTarget`과 같은 컴파일러 옵션을 설정합니다.
* 부모 `pom.xml` 파일에서 단일 `kotlin-maven-plugin` `<configuration>`(예: 추가 `<args>`)을 공유하여 모든 모듈이 동일한 설정으로 컴파일되도록 합니다.

모듈별 오버라이드도 가능하지만 권장하지는 않습니다. 전체 옵션 목록과 프로퍼티 이름은 [컴파일러 옵션](maven-kotlin-compiler.md)을 참조하세요.

### 멀티모듈 빌드에서 바이트코드 레벨 불일치가 발생하는 이유는 무엇인가요? {id="why-do-i-get-bytecode-level-mismatches-in-a-multi-module-build"}

코드를 실행하는 JVM 버전보다 최신 버전의 JVM용으로 바이트코드가 생성되었음을 의미하는 `UnsupportedClassVersionError` 및 유사한 오류가 발생할 수 있습니다. 이러한 문제를 방지하려면 여러 모듈 및 CI 환경에서 다음 사항을 일관되게 유지해야 합니다.

* Maven을 실행하는 JDK.
* Java 컴파일러 타깃.
* Kotlin `jvmTarget` 옵션.

프로젝트에서 `<extensions>` 옵션이 활성화되어 있으면 Kotlin 및 Java 컴파일러가 동일한 바이트코드 버전을 자동으로 타깃팅합니다. 빌드 파일의 다양한 옵션을 기반으로 Kotlin Maven 플러그인이 JVM 타깃 버전을 확인하는 방법에 대한 자세한 내용은 [JVM 타깃 버전](maven-configure-project.md#jvm-target-version)을 참조하세요.

수동 설정을 사용하려면 `maven-toolchains-plugin`을 사용하여 빌드의 모든 플러그인에서 JDK 버전을 제어하는 단일 툴체인을 구성합니다. 자세한 내용은 [JDK 버전 설정](maven-configure-project.md#set-jdk-version)을 참조하세요.

## 테스팅: Surefire, Failsafe, JUnit {id="testing-surefire-failsafe-and-junit"}

### `mvn test` 실행 시 Kotlin 테스트를 건너뛰는 이유는 무엇인가요? {id="why-does-mvn-test-skip-kotlin-tests"}

`mvn test` 명령을 실행하려고 할 때 "Tests run: 0" 오류가 발생할 수 있습니다. 가장 일반적인 원인은 다음과 같습니다.

* **테스트 탐색(Test discovery)**: Surefire는 `*Test` 명명 규칙을 따르는 테스트를 실행합니다. Failsafe 플러그인은 `mvn verify` 명령으로 `*IT` 접미사가 붙은 통합 테스트를 실행합니다. 자세한 내용은 [테스트 실행](jvm-test-maven.md#run-tests)을 참조하세요.
* **클래스패스에 누락된 엔진**: JUnit이 테스트를 탐색하고 실행할 수 있도록 JUnit 테스트 의존성을 추가합니다. 가장 쉬운 방법은 필요한 JUnit 아티팩트를 가져오는 [`kotlin-test-junit5`](jvm-test-maven.md#junit-5-and-later)를 사용하는 것입니다. 자세한 내용은 [테스트 라이브러리 의존성](maven-set-dependencies.md#dependencies-on-test-libraries)을 참조하세요.
* **컴파일되지 않은 테스트 소스**: 테스트가 실행되기 전에 Kotlin 테스트 소스가 컴파일되도록 Kotlin `test-compile` 실행이 동작하는지 확인하세요.

### JUnit 테스트를 실행하도록 Surefire 플러그인을 구성하려면 어떻게 해야 하나요? {id="how-to-configure-the-surefire-plugin-to-run-junit-tests"}

JUnit 테스트를 실행하도록 Surefire 플러그인을 구성하려면:

1. 테스트 클래스패스에 JUnit을 포함하기 위해 `<scope>test</scope>`가 지정된 [`kotlin-test-junit5`](jvm-test-maven.md#junit-5-and-later)와 같은 JUnit 테스트 의존성을 추가합니다.
2. `pom.xml` 파일에 [Surefire 플러그인](jvm-test-maven.md#with-surefire-plugin)을 추가합니다.
3. "missing engine / wrong provider" 오류를 유발하는 클래스패스 상의 충돌하는 테스트 프로바이더가 있는지 확인합니다.

전체 설정 및 샘플 프로젝트는 [Maven으로 Kotlin 프로젝트 테스트하기](jvm-test-maven.md)를 참조하세요.

### Maven Kotlin 백엔드를 JUnit 6로 업그레이드하려면 어떻게 해야 하나요? {id="how-to-upgrade-a-maven-kotlin-backend-to-junit-6"}

Kotlin/JVM은 JUnit 6를 포함하여 안정화된 최신 JUnit 버전을 지원합니다.
JUnit 6의 경우 `pom.xml`에서 동일한 [`kotlin-test-junit5`](jvm-test-maven.md#junit-5-and-later) 의존성을 유지합니다.

업그레이드할 때 다음 사항을 확인하세요.

* 새 JUnit 릴리스에 필요한 기본 Java 버전이 올바르게 설정되었는지 확인합니다.
* 모든 JUnit 관련 의존성의 버전이 일치하는지 확인합니다.
* 테스트 코드에 더 이상 사용되지 않는(deprecated) 컴포넌트가 없는지 확인합니다.

자세한 내용은 [JUnit으로 테스트 작성하기](jvm-test-maven.md#create-tests-with-junit)를 참조하세요.

### 단위 테스트와 통합 테스트를 분리하려면 어떻게 해야 하나요? {id="how-to-split-unit-and-integration-tests"}

두 플러그인 간에 실행을 분리합니다. 단위 테스트의 경우 `test` 단계에서 [Surefire 플러그인](jvm-test-maven.md#with-surefire-plugin)을 사용합니다. 단위 테스트에는 `*Test` 명명 규칙을 사용하세요.

통합 테스트의 경우 `integration-test` 및 `verify` 단계에서 [Failsafe 플러그인](jvm-test-maven.md#with-failsafe-plugin)을 사용합니다. 통합 테스트에는 `*IT` 명명 규칙을 사용하세요.

단위 테스트만 실행하려면 `mvn test`를 실행하고, 둘 다 실행하려면 `mvn verify`를 실행합니다.

자세한 내용은 [Maven으로 Kotlin 프로젝트 테스트하기](jvm-test-maven.md)를 참조하세요.

## 어노테이션 프로세싱: kapt 및 KSP {id="annotation-processing-kapt-and-ksp"}

### Maven에서 KSP를 사용할 수 있나요? {id="can-i-use-ksp-with-maven"}

KSP는 현재 Gradle만 공식적으로 지원하므로 모든 Maven 프로젝트에는 [kapt](kapt.md)를 사용하는 것을 권장합니다.
KSP용 커뮤니티 Maven 플러그인을 사용해 볼 수도 있지만, 해당 플러그인은 자체적인 지원 및 유지 관리 정책을 따릅니다.

Maven을 위한 또 다른 옵션은 빌드 단계에서 [커맨드 라인](ksp-command-line.md) 진입점을 통해 KSP를 실행하는 것입니다. 이는 KSP 코드 생성을 Maven 라이프사이클에 연결하는 것을 의미합니다. `generate-sources`와 같은 초기 단계에서 KSP를 실행하고 생성된 코드를 안정적인 디렉터리에 출력합니다. 그런 다음 해당 디렉터리를 컴파일 소스 루트에 추가하고 코드가 컴파일될 때 생성된 소스가 존재하도록 Kotlin 컴파일 **이전에** 코드 생성이 실행되도록 해야 합니다.

자세한 내용은 [Kotlin 프로젝트에서 어노테이션 프로세서 사용하기](jvm-annotation-processors.md)를 참조하세요.

### Gradle 기반 Kotlin 백엔드에서 kapt와 KSP 중 언제 어떤 것을 사용해야 하나요? {id="when-should-i-use-kapt-versus-ksp-in-a-gradle-based-kotlin-backend"}

Kotlin Gradle 프로젝트에서 기존 Java 어노테이션 프로세서를 사용하려면 먼저 [KSP가 이미 지원하는지](ksp-overview.md#supported-libraries) 확인하세요. 지원되지 않는 프로세서의 경우 [kapt](kapt.md)를 사용합니다.

직접 어노테이션 프로세서를 작성하려는 경우에는 [KSP](ksp-quickstart.md#create-your-own-processor)를 사용하세요.

자세한 내용은 [Kotlin 프로젝트의 어노테이션 프로세서](jvm-annotation-processors.md)를 참조하세요.

### kapt를 구성하려면 어떻게 해야 하나요? {id="how-to-configure-kapt"}

Kotlin Maven 프로젝트에서 kapt를 구성하려면 `compile` 실행 **전에** `kotlin-maven-plugin`의 `kapt` 골(goal) 실행을 추가하고 `<annotationProcessorPaths>` 아래에 어노테이션 프로세서를 명시적으로 나열합니다. 이렇게 하면 해당 코드를 참조하는 코드가 컴파일되기 전에 생성된 소스가 먼저 만들어집니다.

자세한 내용은 [Maven에서 kapt 설정하기](kapt.md#set-up-in-maven) 및 [MapStruct와 함께 kapt를 사용하는 예제](jvm-annotation-processors.md#use-kapt-with-java-annotation-processors)를 참조하세요.

### 최신 JDK에서 kapt가 실패하는 이유는 무엇인가요? {id="why-does-kapt-fail-on-newer-jdks"}

kapt와 연동된 Kotlin 프로젝트에서 최신 JDK를 사용할 때 "IllegalAccessError" 또는 "InaccessibleObjectException" 오류가 발생할 수 있습니다. 이는 kapt가 어노테이션 프로세싱을 위해 접근해야 하는 내부 패키지의 강력한 캡슐화(strong encapsulation)로 인해 발생할 수 있습니다.

Kotlin을 최신 버전으로 업데이트하고 Maven을 실행하는 JVM에 필요한 `--add-opens` 인수를 추가하여 이 문제를 해결할 수 있습니다.

`--add-opens` 인수는 강력한 캡슐화가 기본적으로 차단하는 딥 리플렉션(deep reflective) 접근을 위해 내부 JDK 패키지를 열도록 JVM에 지시합니다. 이 인수는 `--add-opens <module>/<package>=<target-module>` 형식을 사용하며, 클래스패스에서 실행되는 코드(예: 빌드 툴)의 경우 `<target-module>`은 대개 `ALL-UNNAMED`입니다. 예를 들어 kapt에 필요한 컴파일러 내부 접근 권한을 부여하려면 다음과 같이 설정합니다.

```bash
--add-opens jdk.compiler/com.sun.tools.javac.util=ALL-UNNAMED
```

이러한 인수를 적용하는 가장 간단한 방법은 프로젝트 루트의 리포지토리 레벨 `.mvn/jvm.config` 파일에 한 줄에 하나의 JVM 인수씩 추가하는 것입니다. Maven은 이 파일의 모든 옵션을 빌드를 실행하는 JVM에 자동으로 전달하므로 모든 개발자와 CI 러너가 동일한 설정을 사용하게 됩니다.

kapt 구성에 대한 자세한 내용은 [kapt 컴파일러 플러그인](kapt.md)을 참조하세요.

### kapt는 소스를 어디에 생성하며 IDE 임포트 오류는 어떻게 수정하나요? {id="where-does-kapt-generate-sources-and-how-to-fix-their-ide-imports"}

kapt는 모듈의 `target/` 디렉터리에 소스를 생성하고 빌드의 일부로 컴파일되도록 이를 소스 루트로 추가합니다.

IDE에서 "빨간색" 임포트 오류가 표시되는 경우 Kotlin Maven 프로젝트를 다시 임포트(reimport)하여 IDE가 생성된 소스의 디렉터리를 인식할 수 있도록 하세요.

kapt 구성에 대한 자세한 내용은 [kapt 컴파일러 플러그인](kapt.md)을 참조하세요.

## 품질 게이트: 포맷팅 및 코드 커버리지 {id="quality-gates-formatting-and-coverage"}

### Kotlin 포맷팅 검사를 강제하려면 어떻게 해야 하나요? {id="how-to-enforce-kotlin-formatting-checks"}

`pom.xml` 빌드 파일에서 ktlint `check` 골을 `verify` 단계에 바인딩하여 포맷팅 규칙을 위반할 경우 CI가 실패하도록 합니다.
`format`은 개발자가 직접 수행하는 명시적 작업으로 둡니다. 포맷팅 규칙은 `.editorconfig` 파일에서 조정할 수 있습니다.

자세한 내용은 [ktlint를 사용한 코드 포맷팅](jvm-code-analysis.md#code-formatting-with-ktlint)을 참조하세요.
프로젝트의 품질 게이트에 [detekt](jvm-code-analysis.md#code-analysis-with-detekt)를 사용한 정적 분석을 추가할 수도 있습니다.

### Java 17 이상에서 Kotlin 린터나 포매터가 실패하는 이유는 무엇인가요? {id="why-do-kotlin-linters-or-formatters-fail-on-java-17"}

Java 17 이상 버전에서 Kotlin 린터나 포매터를 사용할 때 모듈 접근 오류가 발생할 수 있습니다.

이러한 도구는 Maven JVM 내부에서 실행되므로 최신 JDK에서는 추가적인 `--add-opens` 인수가 필요할 수 있습니다. 각 인수는 리플렉션을 통한 접근을 위해 내부 JDK 패키지를 여는 `--add-opens <module>/<package>=ALL-UNNAMED` 형식을 사용합니다. 리포지토리 레벨의 `.mvn/jvm.config` 파일에 해당 인수를 한 줄에 하나씩 추가하면 동일한 설정이 저장소에 커밋되어 로컬과 CI 모두에서 사용됩니다. 자세한 내용은 [최신 JDK에서 kapt가 실패하는 이유는 무엇인가요?](#why-does-kapt-fail-on-newer-jdks)를 참조하세요.

### 어떤 코드 커버리지 도구를 권장하나요? {id="which-code-coverage-tools-are-recommended"}

[Kover](https://github.com/Kotlin/kotlinx-kover)는 JetBrains의 공식 Kotlin 커버리지 도구입니다. Kotlin 전용 구문을 이해하고 빌트인 검증 규칙이 포함된 Maven 플러그인을 제공하므로, Kotlin 중심 프로젝트에 권장되는 도구입니다.

또 다른 옵션으로는 이미 구축된 Java 커버리지 파이프라인과 관련 리포팅 기능이 있는 경우 [JaCoCo](https://github.com/jacoco/jacoco)를 사용하는 것입니다.

자세한 내용은 [Kover를 사용한 코드 커버리지](jvm-code-analysis.md#code-coverage-with-kover)를 참조하세요.

### 멀티모듈 프로젝트에서 집계된(aggregated) 커버리지 리포트를 생성하려면 어떻게 해야 하나요? {id="how-to-generate-an-aggregated-coverage-report-for-a-multi-module-project"}

Maven 프로젝트의 모든 모듈에 대한 커버리지 리포트를 생성하려면 각 모듈에서 커버리지 데이터를 수집하고 다른 모듈에 의존하는 전용 리포팅 모듈에서 이를 집계합니다. 이렇게 하면 개별 모듈이 실행 데이터를 생성한 후에 집계가 실행됩니다. 이 워크플로를 구현하기 위해 [`kover-maven-plugin`](https://kotlin.github.io/kotlinx-kover/maven-plugin/)을 사용할 수 있습니다.

자세한 내용은 [Kover를 사용한 코드 커버리지](jvm-code-analysis.md#code-coverage-with-kover)를 참조하세요.

## 애플리케이션 빌드: 패키징 및 런타임 {id="building-applications-packaging-and-runtime"}

### 실행 가능한 JAR을 빌드하고 진입점(entry point)을 설정하려면 어떻게 해야 하나요? {id="how-to-build-a-runnable-jar-and-set-the-entry-point"}

실행 가능한 JAR을 빌드하려면 `Main-Class` 진입점을 설정해야 합니다. 이 값은 최상위 `main()` 함수가 있는 Kotlin 파일에서 컴파일된 JVM 클래스의 이름이어야 합니다. 예를 들어 `Main.kt` 파일의 `main()` 함수는 `MainKt` 클래스로 컴파일됩니다.

`maven-jar-plugin` 매니페스트 구성을 통해 해당 클래스 이름을 `Main-Class` 진입점으로 설정합니다.

자세한 내용은 [JAR 파일 생성하기](maven-compile-package.md#create-jar-files)를 참조하세요.

### 패키징된 애플리케이션이 메인 클래스 오류로 실패하는 이유는 무엇인가요? {id="why-does-the-packaged-application-fail-with-main-class-errors"}

애플리케이션을 빌드할 때, 특히 컨테이너 환경에서 "Could not find or load main class" 오류가 발생할 수 있습니다. 문제를 디버깅하려면 다음 체크리스트를 확인하세요.

* 매니페스트의 `Main-Class`가 [올바르게 컴파일된 클래스](#how-to-build-a-runnable-jar-and-set-the-entry-point)를 가리키고 있는지 확인합니다.
* 올바른 아티팩트를 실행하고 있는지 확인합니다. 일반(thin) [JAR](maven-compile-package.md#create-jar-files)는 클래스패스에 의존성이 필요하지만, [자체 포함(self-contained) JAR](maven-compile-package.md#create-self-contained-jar-files)는 의존성을 함께 번들로 묶습니다.
* 컨테이너 진입점에서 올바른 `java -jar` 명령과 클래스패스를 사용하고 있는지 확인합니다.

### Kotlin 런타임 클래스를 포함하여 fat JAR을 빌드하려면 어떻게 해야 하나요? {id="how-to-build-a-fat-jar-together-with-kotlin-runtime-classes"}

fat(uber) JAR을 빌드하고 Kotlin 런타임 클래스 누락을 방지하려면 의존성을 번들로 묶고 Kotlin 표준 라이브러리가 런타임 클래스패스에 포함되도록 하는 자체 포함(self-contained) JAR을 빌드합니다. fat JAR에는 의존성이 포함되므로, [`kotlin-stdlib`](maven-set-dependencies.md#dependency-on-the-standard-library)를 선언된 의존성으로 유지하면 Kotlin 런타임이 함께 패키징됩니다.

자세한 내용은 [자체 포함 JAR 파일 생성하기](maven-compile-package.md#create-self-contained-jar-files)를 참조하세요.

### JVM 인수는 어디에 설정해야 하나요? {id="where-should-jvm-arguments-be"}

Maven 빌드 프로세스, 테스트 JVM, 런타임용 JVM 인수를 세 가지 개별 위치로 분리하여 관리합니다.

* **Maven 빌드 JVM**: 리포지토리 레벨의 `.mvn/jvm.config` 파일에 공유 인수를 지정합니다.
* **테스트 JVM**: [Surefire](jvm-test-maven.md#with-surefire-plugin) 및 [Failsafe](jvm-test-maven.md#with-failsafe-plugin) 플러그인 구성 섹션에 배치합니다.
* **런타임**: [패키징된 애플리케이션](maven-compile-package.md)을 시작하는 컨테이너 명령 또는 배포 구성에서 설정합니다.

## 라이브러리 배포: 소스 및 서명 {id="publishing-libraries-sources-and-signing"}

### Maven Central에 배포하기 위한 요구 사항은 무엇인가요? {id="what-are-the-requirements-to-publish-to-maven-central"}

Kotlin 라이브러리를 [Maven Central](https://central.sonatype.com/)에 배포하려면:

1. **아티팩트 준비**: 메인 아티팩트, [소스 JAR](#how-to-attach-and-deploy-a-source-jar) 및 문서(Javadoc) JAR을 빌드합니다.
2. **POM 메타데이터 완성**: 이름, 설명, 라이선스, 개발자 및 SCM 정보를 작성합니다.
3. **아티팩트 서명**: [CI 친화적인 방식](#how-to-sign-artifacts-for-maven-central-in-a-ci-friendly-way)으로 모든 아티팩트에 대한 GPG 서명을 생성합니다.
4. **아티팩트 배포**: [`central-publishing-maven-plugin`](https://central.sonatype.org/publish/publish-portal-maven/)을 사용하여 `mvn deploy`를 실행해 배포 번들을 생성하고 검증을 위해 Maven Central에 업로드합니다.

   이 플러그인은 소스 JAR, Javadoc JAR 또는 GPG 서명을 대신 생성해 주지 않으므로, 이러한 사전 요구 사항은 별도로 구성해야 합니다.

Maven Central 릴리스는 불변(immutable)이므로 한 번 배포된 버전은 교체할 수 없다는 점에 유의하세요.

문서 JAR 생성에 대한 자세한 내용은 [Dokka 문서 엔진](dokka-maven.md)을 참조하세요. 전체 배포 프로세스 및 요구 사항은 공식 [Sonatype 문서](https://central.sonatype.org/publish/publish-portal-maven/)를 참조하세요.

### 소스 JAR을 첨부(attach)하고 배포하려면 어떻게 해야 하나요? {id="how-to-attach-and-deploy-a-source-jar"}

Maven 기반 Kotlin 라이브러리의 소스 JAR을 첨부하고 배포하려면, 빌드 라이프사이클에 [`maven-source-plugin`](https://maven.apache.org/plugins/maven-source-plugin/)을 바인딩하여 소스 아티팩트가 자동으로 첨부되고 메인 아티팩트와 함께 배포되도록 합니다.

프로젝트에서 함께 릴리스되는 여러 라이브러리를 배포하는 경우, 자체 [BOM](maven-set-dependencies.md#manage-dependencies-with-a-bom) 파일을 제공하여 사용자가 여러분이 Kotlin 아티팩트를 맞추는 것과 동일한 방식으로 버전을 일치시킬 수 있도록 하는 방안을 고려해 보세요.

### CI 친화적인 방식으로 Maven Central용 아티팩트에 서명하려면 어떻게 해야 하나요? {id="how-to-sign-artifacts-for-maven-central-in-a-ci-friendly-way"}

CI 친화적인 방식으로 Maven Central 아티팩트를 구성하려면 다음을 권장합니다.

* 프로젝트에 첨부된 모든 아티팩트에 서명하기 위해 [`maven-gpg-plugin`](https://maven.apache.org/plugins/maven-gpg-plugin/)을 사용합니다.
* 키 자료와 암호(passphrase)는 커밋하지 말고 CI 시크릿(secret)이나 환경 변수를 통해 제공합니다.
* 소스 및 Javadoc JAR을 포함하여 배포되는 모든 아티팩트가 서명되도록 배포 단계 전에 서명이 실행되는지 확인합니다.

## 트러블슈팅 {id="troubleshooting"}

### JDK 17에서 플러그인 실패 문제를 해결하려면 어떻게 해야 하나요? {id="how-to-fix-the-plugin-failure-on-jdk-17"}

JDK 17에서 Maven을 실행하는 JVM에 `--add-opens` 인수를 추가하라는 권장 사항과 함께 Kotlin Maven 플러그인 오류가 발생할 수 있습니다.

프로젝트 레벨에서 이를 해결하려면 리포지토리 레벨의 `.mvn/jvm.config` 파일에 한 줄에 하나의 인수씩 필요한 JVM 인수를 추가하여 모든 개발자와 CI 러너가 동일한 설정을 사용하도록 하고, [Kotlin 버전](maven-kotlin-compiler.md)을 최신 상태로 유지하세요. 이렇게 하면 로컬 환경과 CI 환경의 동작이 일관되게 유지됩니다.

각 `--add-opens` 인수는 리플렉션을 통한 접근을 위해 내부 JDK 패키지를 여는 `--add-opens <module>/<package>=ALL-UNNAMED` 형식을 따릅니다. 자세한 내용은 [최신 JDK에서 kapt가 실패하는 이유는 무엇인가요?](#why-does-kapt-fail-on-newer-jdks)를 참조하세요.

### Kotlin 또는 API 버전 불일치 오류가 발생하는 이유는 무엇인가요? {id="why-do-i-get-mismatch-errors-for-kotlin-or-api-versions"}

"API version X is no longer supported" 또는 "module was compiled with an incompatible version of Kotlin" 오류가 발생할 수 있습니다. 이는 Kotlin 컴파일러와 클래스패스의 Kotlin 라이브러리 간의 불일치를 나타냅니다. 이를 해결하려면:

* 컴파일러와 모든 Kotlin 라이브러리에서 사용하는 버전을 일치시킵니다. `<properties>` 섹션에서 Kotlin 버전을 한 번만 선언하고 `${kotlin.version}`으로 참조하며 [Kotlin BOM](maven-set-dependencies.md#manage-dependencies-with-a-bom) 파일을 사용합니다.
* 호환되지 않는 버전을 사용하는 이전의 전이 Kotlin 아티팩트를 제거합니다.
* 타깃팅하려는 Kotlin 버전에 대해 [`languageVersion` 및 `apiVersion`](maven-kotlin-compiler.md#attributes-specific-to-jvm)을 확인합니다.