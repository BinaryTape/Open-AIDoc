[//]: # (title: Kotlin 專案中的程式碼品質工具)

<web-summary>了解如何將 ktlint、detekt、SonarQube、SonarCloud 和 Kover 等程式碼品質工具整合到您的 Kotlin 後端專案中。</web-summary>

程式碼品質工具可協助您強制執行編碼標準、及早發現錯誤、測量測試涵蓋率，並在您的 Kotlin 專案中維護程式碼品質。本指南介紹如何將 [ktlint](https://ktlint.github.io/ktlint/latest/)、[detekt](https://detekt.dev/)、[SonarQube](https://www.sonarsource.com/products/sonarqube/)、[SonarCloud](https://www.sonarsource.com/products/sonarcloud/) 和 [Kover](https://kotlin.github.io/kotlinx-kover/) 等熱門工具整合到適用於 Maven 或 Gradle 的後端專案中。

## 使用 ktlint 進行程式碼格式化

[ktlint](https://github.com/ktlint/ktlint) 是一個 Kotlin linter 與格式化程序，無需額外配置即可強制執行官方 Kotlin [慣例 (coding conventions)](coding-conventions.md)。

ktlint 會檢查縮排、運算子周圍的空格、匯入順序和尾隨逗號等規則。如果發現違規，組建將失敗，並顯示指出檔案和行號的訊息。除了報告違規外，ktlint 還可以自動修正簡單的問題。

要將 ktlint 整合到您的專案中：

1. 將外掛程式新增至您的組建檔案：

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

2. 執行 linter 以檢查您的程式碼風格：

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

3. (選用) 您也可以在專案根目錄新增一個 `.editorconfig` 檔案來自訂規則。例如，允許萬用字元匯入並停用尾隨逗號強制執行：

   ```ini
   [*.{kt,kts}]
   ij_kotlin_imports_layout = *
   ktlint_standard_trailing-comma-on-call-site = disabled
   ktlint_standard_trailing-comma-on-declaration-site = disabled
   ```

   預設情況下，ktlint 遵循官方 Kotlin 慣例。如果您偏好與 Kotlin 慣例有顯著差異的 [Android Kotlin 風格指南](https://developer.android.com/kotlin/style-guide)，請在您的 `.editorconfig` 檔案中將程式碼風格設定為 `android_studio`：

   ```ini
   [*.{kt,kts}]
   ktlint_code_style = android_studio
   ```

4. 要自動修正格式問題，請執行：

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

有關可用功能和規則的更多資訊，請參閱 [ktlint 文件](https://github.com/ktlint/ktlint/tree/master/documentation)。

## 使用 detekt 進行程式碼分析

[detekt](https://github.com/detekt/detekt) 是一個適用於 Kotlin 的靜態程式碼分析工具，可偵測程式碼異味 (code smells)、複雜度問題和潛在錯誤。

要將 detekt 整合到您的專案中：

1. 將外掛程式新增至您的組建檔案：

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

2. 產生預設的 `detekt.yml` [配置檔案](https://detekt.dev/docs/introduction/configurations)：

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

3. 開啟 `detekt.yml` 檔案並在產生的檔案中自訂規則，例如：

   ```yaml
   complexity:
     LongMethod:
       threshold: 50
   style:
     MagicNumber:
       active: false
   ```

4. 在組建檔案中引用配置檔案，以便 detekt 可以套用新規則：

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

5. 執行分析：

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

detekt 會產生一份報告，列出所有違反規則的情況及其嚴重程度、檔案位置和問題描述。預設情況下，Gradle 將報告輸出到 `build/reports/detekt`，而 Maven 則輸出到專案根目錄下的 `reports/detekt` 目錄。

有關更多資訊，請參閱適用於 [Gradle](https://detekt.dev/docs/intro) 和 [Maven](https://github.com/Ozsie/detekt-maven-plugin) 的 detekt 文件。

## 使用 SonarSource 提升程式碼品質

SonarSource 的 [SonarQube](https://github.com/SonarSource/sonarqube) 和 [SonarCloud](https://github.com/marketplace/sonarcloud) 為 Kotlin 專案提供深度靜態分析，包括透過 Web 儀表板進行錯誤偵測、弱點掃描和程式碼涵蓋率追蹤。

要使用 SonarQube 分析您的專案：

1. 將外掛程式新增至您的組建檔案：

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

2. (選用) 配置分析屬性。例如，要讓組建等待品質閘結果，並在未通過品質閘時使組建失敗，請新增 `sonar.qualitygate.wait` 屬性：

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

   > 品質閘規則（例如最低涵蓋率閾值和允許的問題數量）是在 SonarQube 或 SonarCloud 的 Web 介面中的 **Quality Gates** 下定義的，而不是在組建檔案中。
   >
   {style="note"}

3. 對您的 SonarQube 伺服器執行分析：

   <tabs group="build-system">
   <tab title="Maven" group-key="maven">

   ```bash
   mvn verify sonar:sonar \
     -Dsonar.projectKey=my-project \
     -Dsonar.host.url=http://localhost:9000 \
     -Dsonar.token=YOUR_TOKEN
   ```

   對於 SonarCloud，請將主機 URL 替換為 `https://sonarcloud.io` 並提供您的組織金鑰：

   ```bash
   mvn verify sonar:sonar \
     -Dsonar.projectKey=my-project \
     -Dsonar.organization=my-org \
     -Dsonar.host.url=https://sonarcloud.io \
     -Dsonar.token=YOUR_TOKEN
   ```

   </tab>
   <tab title="Gradle" group-key="gradle">

   要執行分析，請使用 `sonar` 任務並提供您的驗證權杖：

   ```bash
   ./gradlew sonar \
     -Dsonar.token=YOUR_TOKEN
   ```

   預設情況下，分析是針對本機 SonarQube 伺服器執行的。要使用 SonarCloud，請更新 `build.gradle.kts` 中的 `sonar {}` 區塊以使用 `https://sonarcloud.io` 並新增您的組織金鑰：

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

4. 開啟 SonarQube 或 SonarCloud 儀表板以查看結果。儀表板會顯示按類型（錯誤、弱點、程式碼異味）和嚴重程度分組的問題。

有關更多資訊，請參閱 [SonarSource 文件](https://docs.sonarsource.com/)。

## 使用 Kover 進行程式碼涵蓋率分析

[Kover](https://github.com/Kotlin/kotlinx-kover) 是官方的 JetBrains Kotlin 程式碼涵蓋率工具。它會測量您的程式碼中哪些行和分支已被測試涵蓋，並產生人類可讀的報告。

與 [JaCoCo](https://github.com/jacoco/jacoco) 不同，Kover 能正確解讀 Kotlin 特有的結構（如內嵌函式和資料類別），因此它能報告準確的涵蓋率數字，而不會因編譯器產生的位元組碼而導致誤報。

要將 Kover 整合到您的專案中：

1. 將外掛程式新增至您的組建檔案：

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

2. 執行您的測試以收集涵蓋率數據並產生報告：

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

3. 開啟在 `target/site/kover/html/` 目錄（Gradle 為 `build/reports/kover/html/`）中產生的 HTML 報告，以查看逐行涵蓋率。
4. (選用) 若要強制執行最低涵蓋率閾值，並在未達標時使組建失敗，您可以將涵蓋率驗證配置新增至組建檔案。例如：

   <tabs group="build-system">
   <tab title="Maven" group-key="maven">

   ```xml
   <!-- pom.xml -->
   <configuration>
     <!-- Create new coverage verification rule -->
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
   // 新增 `kover` 配置區塊
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

有關配置驗證規則的更多資訊，請參閱適用於 [Maven](https://kotlin.github.io/kotlinx-kover/maven-plugin/) 和 [Gradle](https://kotlin.github.io/kotlinx-kover/gradle-plugin/) 的 Kover 文件。

## 其他工具

除了 ktlint、detekt、SonarQube、SonarCloud 和 Kover 之外，還可以嘗試其他工具來提升 Kotlin 程式碼品質：

| 工具 | 描述 |
|-------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------|
| [CodeQL](https://codeql.github.com/docs/) | 由 GitHub 開發的語義程式碼分析引擎。支援 Kotlin 並與 GitHub Actions 整合，可自動尋找安全性漏洞。 |
| [Semgrep](https://semgrep.dev/docs/) | 快速、輕量級的靜態分析工具，支援自訂規則。可用於在 Kotlin 程式碼中強制執行特定模式或偵測反模式。 |
| [PMD](https://docs.pmd-code.org/latest/) | 支援 Kotlin（透過其 CPD 複製貼上偵測器）的原始碼分析器，可偵測常見的程式設計瑕疵和重複程式碼。 |

## 下一步

* [在 Maven 專案中執行測試](jvm-test-maven.md)
* [使用 Maven 配置 Kotlin 專案](maven-configure-project.md)