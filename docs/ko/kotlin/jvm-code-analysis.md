[//]: # (title: Kotlin 프로젝트의 코드 품질 도구)

<web-summary>ktlint, detekt, SonarQube, SonarCloud, Kover와 같은 코드 품질 도구를 Kotlin 백엔드 프로젝트에 통합하는 방법을 알아보세요.</web-summary>

코드 품질 도구는 Kotlin 프로젝트 전반에서 코딩 표준을 준수하고, 버그를 조기에 발견하며, 테스트 커버리지를 측정하고, 코드 품질을 유지하는 데 도움이 됩니다. 이 가이드에서는 [ktlint](https://ktlint.github.io/ktlint/latest/), [detekt](https://detekt.dev/), [SonarQube](https://www.sonarsource.com/products/sonarqube/), [SonarCloud](https://www.sonarsource.com/products/sonarcloud/), 그리고 [Kover](https://kotlin.github.io/kotlinx-kover/)와 같은 인기 있는 도구들을 Maven 또는 Gradle 기반의 백엔드 프로젝트에 통합하는 방법을 설명합니다.

## ktlint를 이용한 코드 포맷팅

[ktlint](https://github.com/ktlint/ktlint)는 별도의 추가 설정 없이 공식 Kotlin [코딩 컨벤션](coding-conventions.md)을 준수하도록 돕는 Kotlin 린터(linter) 및 포맷터(formatter)입니다.

ktlint는 들여쓰기, 연산자 주변의 공백, 임포트(import) 순서, 후행 쉼표(trailing commas)와 같은 규칙을 검사합니다. 위반 사항이 발견되면 파일 및 줄 번호를 나타내는 메시지와 함께 빌드가 실패합니다. 위반 사항을 보고하는 것 외에도, ktlint는 간단한 문제들을 자동으로 수정할 수도 있습니다.

프로젝트에 ktlint를 통합하려면 다음 단계를 따르세요.

1. 빌드 파일에 플러그인을 추가합니다.

   <tabs group="build-system">
   <tab title="Maven" group-key="maven">

   ```xml
   <!-- pom.xml -->
   <plugin>
       <groupId>com.github.gantsign.maven</groupId>
       <artifactId>ktlint-maven-plugin</artifactId>
       <version>3.7.1</version>
       <executions>
           <execution>
               <id>check</id>
               <goals>
                   <goal>check</goal>
               </goals>
           </execution>
       </executions>
   </plugin>
   ```

   </tab>
   <tab title="Gradle" group-key="gradle">

   ```kotlin
   // build.gradle.kts
   plugins {
       id("org.jlleitschuh.gradle.ktlint") version "12.3.0"
   }
   ```

   </tab>
   </tabs>

2. 린터를 실행하여 코드 스타일을 검사합니다.

   <tabs group="build-system">
   <tab title="Maven" group-key="maven">

   ```bash
   mvn ktlint:check
   ```

   </tab>
   <tab title="Gradle" group-key="gradle">

   ```bash
   ./gradlew ktlintCheck
   ```

   </tab>
   </tabs>

3. (선택 사항) 프로젝트 루트에 `.editorconfig` 파일을 추가하여 규칙을 커스터마이징할 수 있습니다. 예를 들어, 와일드카드(wildcard) 임포트를 허용하고 후행 쉼표 강제를 비활성화하려면 다음과 같이 설정합니다.

   ```ini
   [*.{kt,kts}]
   ij_kotlin_imports_layout = *
   ktlint_standard_trailing-comma-on-call-site = disabled
   ktlint_standard_trailing-comma-on-declaration-site = disabled
   ```

   기본적으로 ktlint는 공식 Kotlin 코딩 컨벤션을 따릅니다. 만약 Kotlin 컨벤션과 눈에 띄게 다른 [Android Kotlin 스타일 가이드](https://developer.android.com/kotlin/style-guide)를 선호한다면, `.editorconfig` 파일에서 코드 스타일을 `android_studio`로 설정하세요.

   ```ini
   [*.{kt,kts}]
   ktlint_code_style = android_studio
   ```

4. 포맷팅 문제를 자동으로 수정하려면 다음을 실행하세요.

   <tabs group="build-system">
   <tab title="Maven" group-key="maven">

   ```bash
   mvn ktlint:format
   ```

   </tab>
   <tab title="Gradle" group-key="gradle">

   ```bash
   ./gradlew ktlintFormat
   ```

   </tab>
   </tabs>

사용 가능한 기능 및 규칙에 대한 자세한 내용은 [ktlint 문서](https://github.com/ktlint/ktlint/tree/master/documentation)를 참조하세요.

## detekt를 이용한 코드 분석

[detekt](https://github.com/detekt/detekt)는 코드 스멜(code smells), 복잡성 문제 및 잠재적 버그를 감지하는 Kotlin용 정적 코드 분석 도구입니다.

프로젝트에 detekt를 통합하려면 다음 단계를 따르세요.

1. 빌드 파일에 플러그인을 추가합니다.

   <tabs group="build-system">
   <tab title="Maven" group-key="maven">

   ```xml
   <!-- pom.xml -->
   <plugin>
       <groupId>com.github.ozsie</groupId>
       <artifactId>detekt-maven-plugin</artifactId>
       <version>1.23.8</version>
       <executions>
           <execution>
               <phase>verify</phase>
               <goals>
                   <goal>check</goal>
               </goals>
           </execution>
       </executions>
   </plugin>
   ```

   </tab>
   <tab title="Gradle" group-key="gradle">
   
   ```kotlin
   // build.gradle.kts
   plugins {
       id("io.gitlab.arturbosch.detekt") version "1.23.8"
   }
   ```

   </tab>
   </tabs>

2. 기본 `detekt.yml` [설정 파일](https://detekt.dev/docs/introduction/configurations)을 생성합니다.

   <tabs group="build-system">
   <tab title="Maven" group-key="maven">

   ```bash
   mvn detekt:generate-config
   ```

   </tab>
   <tab title="Gradle" group-key="gradle">

   ```bash
   ./gradlew detektGenerateConfig
   ```

   </tab>
   </tabs>

3. `detekt.yml` 파일을 열고 생성된 파일의 규칙을 커스터마이징합니다. 예를 들면 다음과 같습니다.

   ```yaml
   complexity:
     LongMethod:
       threshold: 50
   style:
     MagicNumber:
       active: false
   ```

4. 빌드 파일에서 설정 파일을 참조하여 detekt가 새로운 규칙을 적용할 수 있도록 합니다.

   <tabs group="build-system">
   <tab title="Maven" group-key="maven">

   ```xml
   <!-- pom.xml -->
   <plugin>
       <groupId>com.github.ozsie</groupId>
       <artifactId>detekt-maven-plugin</artifactId>
       <version>1.23.8</version>
       <configuration>
           <config>detekt.yml</config>
           <report>
               <report>txt:reports/detekt.txt</report>
               <report>xml:reports/detekt.xml</report>
           </report>
       </configuration>
       <executions>
           <execution>
               <phase>verify</phase>
               <goals>
                   <goal>check</goal>
               </goals>
           </execution>
       </executions>
   </plugin>
   ```

   </tab>
   <tab title="Gradle" group-key="gradle">

   ```kotlin
   // build.gradle.kts
   detekt {
       toolVersion = "1.23.8"
       config.setFrom(file("config/detekt/detekt.yml"))
       buildUponDefaultConfig = true
   }
   ```

   </tab>
   </tabs>

5. 분석을 실행합니다.

   <tabs group="build-system">
   <tab title="Maven" group-key="maven">

   ```bash
   mvn detekt:check
   ```

   </tab>
   <tab title="Gradle" group-key="gradle">

   ```bash
   ./gradlew detekt
   ```

   </tab>
   </tabs>

detekt는 모든 규칙 위반 사항을 심각도, 파일 위치, 문제 설명과 함께 나열한 보고서를 생성합니다. 기본적으로 Gradle은 `build/reports/detekt`에 보고서를 출력하며, Maven은 프로젝트 루트의 `reports/detekt` 디렉토리에 출력합니다.

자세한 내용은 [Gradle](https://detekt.dev/docs/intro) 및 [Maven](https://github.com/Ozsie/detekt-maven-plugin)용 detekt 문서를 참조하세요.

## SonarSource를 이용한 코드 품질 관리

SonarSource의 [SonarQube](https://github.com/SonarSource/sonarqube) 및 [SonarCloud](https://github.com/marketplace/sonarcloud)는 웹 대시보드를 통해 버그 탐지, 취약점 스캐닝, 코드 커버리지 추적을 포함하여 Kotlin 프로젝트에 대한 심층적인 정적 분석을 제공합니다.

SonarQube로 프로젝트를 분석하려면 다음 단계를 따르세요.

1. 빌드 파일에 플러그인을 추가합니다.

   <tabs group="build-system">
   <tab title="Maven" group-key="maven">

   ```xml
   <!-- pom.xml -->
   <plugin>
       <groupId>org.sonarsource.scanner.maven</groupId>
       <artifactId>sonar-maven-plugin</artifactId>
       <version>5.7.0.6970</version>
   </plugin>
   ```

   </tab>
   <tab title="Gradle" group-key="gradle">

   ```kotlin
   // build.gradle.kts
   plugins {
       id("org.sonarqube") version "6.2.0.5505"
   }

   sonar {
       properties {
           property("sonar.projectKey", "my-project")
           property("sonar.host.url", "http://localhost:9000")
       }
   }
   ```

   </tab>
   </tabs>

2. (선택 사항) 분석 속성을 구성합니다. 예를 들어, 빌드가 퀄리티 게이트(quality gate) 결과를 기다리게 하고 게이트를 통과하지 못할 경우 빌드를 실패하게 하려면 `sonar.qualitygate.wait` 속성을 추가합니다.

   <tabs group="build-system">
   <tab title="Maven" group-key="maven">

   ```bash
   mvn verify sonar:sonar \
     -Dsonar.qualitygate.wait=true \
     -Dsonar.projectKey=my-project \
     -Dsonar.host.url=http://localhost:9000 \
     -Dsonar.token=YOUR_TOKEN
   ```

   </tab>
   <tab title="Gradle" group-key="gradle">

   ```kotlin
   // build.gradle.kts
   sonar {
       properties {
           property("sonar.qualitygate.wait", "true")
       }
   }
   ```

   </tab>
   </tabs>

   > 퀄리티 게이트 규칙(예: 최소 커버리지 임계값 및 허용되는 이슈 수)은 빌드 파일이 아니라 SonarQube 또는 SonarCloud 웹 인터페이스의 **Quality Gates** 메뉴에서 정의됩니다.
   >
   {style="note"}

3. SonarQube 서버를 대상으로 분석을 실행합니다.

   <tabs group="build-system">
   <tab title="Maven" group-key="maven">

   ```bash
   mvn verify sonar:sonar \
     -Dsonar.projectKey=my-project \
     -Dsonar.host.url=http://localhost:9000 \
     -Dsonar.token=YOUR_TOKEN
   ```

   SonarCloud의 경우 호스트 URL을 `https://sonarcloud.io`로 바꾸고 조직(organization) 키를 제공하세요.

   ```bash
   mvn verify sonar:sonar \
     -Dsonar.projectKey=my-project \
     -Dsonar.organization=my-org \
     -Dsonar.host.url=https://sonarcloud.io \
     -Dsonar.token=YOUR_TOKEN
   ```

   </tab>
   <tab title="Gradle" group-key="gradle">

   분석을 실행하려면 `sonar` 태스크를 사용하고 인증 토큰을 제공하세요.

   ```bash
   ./gradlew sonar \
     -Dsonar.token=YOUR_TOKEN
   ```

   기본적으로 분석은 로컬 SonarQube 서버를 대상으로 실행됩니다. SonarCloud를 사용하려면 `build.gradle.kts`의 `sonar {}` 블록을 `https://sonarcloud.io`를 사용하도록 업데이트하고 조직 키를 추가하세요.

   ```kotlin
   sonar {
       properties {
           property("sonar.projectKey", "example-project")
           property("sonar.organization", "example-org")
           property("sonar.host.url", "https://sonarcloud.io")
       }
   }
   ```

   </tab>
   </tabs>

4. SonarQube 또는 SonarCloud 대시보드를 열어 결과를 검토합니다. 대시보드에는 유형(버그, 취약점, 코드 스멜) 및 심각도별로 그룹화된 이슈가 표시됩니다.

자세한 내용은 [SonarSource 문서](https://docs.sonarsource.com/)를 참조하세요.

## Kover를 이용한 코드 커버리지

[Kover](https://github.com/Kotlin/kotlinx-kover)는 JetBrains에서 제공하는 공식 Kotlin용 코드 커버리지 도구입니다. 코드의 어떤 라인과 브랜치가 테스트에 의해 실행되었는지 측정하고 사람이 읽을 수 있는 보고서를 생성합니다.

[JaCoCo](https://github.com/jacoco/jacoco)와 달리 Kover는 인라인 함수(inline functions)나 데이터 클래스(data classes)와 같은 Kotlin 특유의 구조를 올바르게 해석하므로, 컴파일러가 생성한 바이트코드로 인해 발생하는 가짜 부정(false negatives) 없이 정확한 커버리지 수치를 보고합니다.

프로젝트에 Kover를 통합하려면 다음 단계를 따르세요.

1. 빌드 파일에 플러그인을 추가합니다.

   <tabs group="build-system">
   <tab title="Maven" group-key="maven">

   ```xml
   <!-- pom.xml -->
   <plugin>
       <groupId>org.jetbrains.kotlinx</groupId>
       <artifactId>kover-maven-plugin</artifactId>
       <version>0.9.8</version>
       <executions>
           <execution>
               <id>instr</id>
               <goals>
                   <goal>instrumentation</goal>
               </goals>
           </execution>
           <execution>
               <id>kover-verify</id>
               <goals>
                  <goal>verify</goal>
               </goals>
           </execution>
           <execution>
               <id>kover-report-xml</id>
               <goals>
                   <goal>report-xml</goal>
               </goals>
           </execution>
           <execution>
               <id>kover-report-html</id>
               <goals>
                   <goal>report-html</goal>
               </goals>
           </execution>
       </executions>
   </plugin>
   ```

   </tab>
   <tab title="Gradle" group-key="gradle">

   ```kotlin
   // build.gradle.kts
   plugins {
       id("org.jetbrains.kotlinx.kover") version "0.9.8"
   }
   ```

   </tab>
   </tabs>

2. 테스트를 실행하여 커버리지 데이터를 수집하고 보고서를 생성합니다.

   <tabs group="build-system">
   <tab title="Maven" group-key="maven">

   ```bash
   mvn verify
   ```

   </tab>
   <tab title="Gradle" group-key="gradle">

   ```bash
   ./gradlew koverVerify koverHtmlReport
   ```

   </tab>
   </tabs>

3. `target/site/kover/html/` 디렉토리(Gradle의 경우 `build/reports/kover/html/`)에 생성된 HTML 보고서를 열어 라인별 커버리지를 검토합니다.
4. (선택 사항) 조건이 충족되지 않을 경우 빌드를 실패하게 만드는 최소 커버리지 임계값을 적용하려면 빌드 파일에 커버리지 검증 설정을 추가할 수 있습니다. 예를 들면 다음과 같습니다.

   <tabs group="build-system">
   <tab title="Maven" group-key="maven">

   ```xml
   <!-- pom.xml -->
   <configuration>
     <!-- 새로운 커버리지 검증 규칙 생성 -->
     <rules>
         <rule>
             <bounds>
                 <bound>
                     <minValue>50</minValue>
                     <coverageUnits>LINE</coverageUnits>
                     <aggregationForGroup>COVERED_PERCENTAGE</aggregationForGroup>
                 </bound>
             </bounds>
         </rule>
     </rules>
   </configuration>
   ```

   </tab>
   <tab title="Gradle" group-key="gradle">

   ```kotlin
   // build.gradle.kts
   // `kover` 설정 블록 추가
   import kotlinx.kover.gradle.plugin.dsl.*
   
   kover {
       reports {
           total {
               log {
                   aggregationForGroup = AggregationType.COVERED_PERCENTAGE
                   coverageUnits = CoverageUnit.LINE
               }
               verify {
                   rule {
                       minBound(50)
                   }
               }
           }
       }
   }
   ```

   </tab>
   </tabs>

검증 규칙 구성에 대한 자세한 내용은 [Maven](https://kotlin.github.io/kotlinx-kover/maven-plugin/) 및 [Gradle](https://kotlin.github.io/kotlinx-kover/gradle-plugin/)용 Kover 문서를 참조하세요.

## 기타 도구

ktlint, detekt, SonarQube, SonarCloud, Kover 외에도 Kotlin 코드 품질을 개선하기 위해 다음 도구들을 시도해 보세요.

| 도구 | 설명 |
|-------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------|
| [CodeQL](https://codeql.github.com/docs/) | GitHub에서 제공하는 시맨틱 코드 분석 엔진입니다. Kotlin을 지원하며 GitHub Actions와 통합하여 보안 취약점을 자동으로 찾아냅니다. |
| [Semgrep](https://semgrep.dev/docs/)      | 커스텀 규칙을 지원하는 빠르고 가벼운 정적 분석 도구입니다. Kotlin 코드에서 특정 패턴을 강제하거나 안티 패턴을 감지하는 데 사용할 수 있습니다. |
| [PMD](https://docs.pmd-code.org/latest/)  | Kotlin을 지원하는 소스 코드 분석기(CPD 복사-붙여넣기 탐지기 포함)로, 일반적인 프로그래밍 결함과 중복 코드를 감지합니다. |

## 다음 단계

* [Maven 프로젝트에서 테스트 실행하기](jvm-test-maven.md)
* [Maven으로 Kotlin 프로젝트 구성하기](maven-configure-project.md)