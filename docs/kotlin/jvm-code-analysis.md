[//]: # (title: Kotlin 项目中的代码质量工具)
[//]: # (description: 了解如何将 ktlint、detekt、SonarQube、SonarCloud 和 Kover 等代码质量工具集成到您的 Kotlin 后端项目中。)

代码质量工具可帮助您强制执行编码标准、及早发现错误、衡量测试覆盖率，并在整个 Kotlin 项目中维护代码质量。本指南将介绍如何将 [ktlint](https://ktlint.github.io/ktlint/latest/)、[detekt](https://detekt.dev/)、[SonarQube](https://www.sonarsource.com/products/sonarqube/)、[SonarCloud](https://www.sonarsource.com/products/sonarcloud/) 和 [Kover](https://kotlin.github.io/kotlinx-kover/) 等常用工具集成到基于 Maven 或 Gradle 的后端项目中。

## 使用 ktlint 进行代码格式化

[ktlint](https://github.com/ktlint/ktlint) 是一个 Kotlin Linter 和格式化程序，无需额外配置即可强制执行官方 Kotlin [编码约定](coding-conventions.md)。

ktlint 会检查缩进、运算符周围的空格、导入排序和尾随逗号等规则。如果发现违规行为，构建将失败，并显示指出文件和行号的消息。除了报告违规行为外，ktlint 还可以自动修复简单的格式问题。

要将 ktlint 集成到您的项目中：

1. 将插件添加到您的构建文件中：

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

2. 运行 Linter 以检查您的代码样式：

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

3. （可选）您还可以将 `.editorconfig` 文件添加到项目的根目录以自定义规则。例如，要允许通配符导入并禁用尾随逗号强制执行：

   ```ini
   [*.{kt,kts}]
   ij_kotlin_imports_layout = *
   ktlint_standard_trailing-comma-on-call-site = disabled
   ktlint_standard_trailing-comma-on-declaration-site = disabled
   ```

   默认情况下，ktlint 遵循官方 Kotlin 编码约定。如果您更喜欢 [Android Kotlin 样式指南](https://developer.android.com/kotlin/style-guide)（该指南与 Kotlin 约定有明显不同），请在 `.editorconfig` 文件中将代码样式设置为 `android_studio`：

   ```ini
   [*.{kt,kts}]
   ktlint_code_style = android_studio
   ```

4. 要自动修复格式设置问题，请运行：

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

有关可用功能和规则的更多信息，请参阅 [ktlint 文档](https://github.com/ktlint/ktlint/tree/master/documentation)。

## 使用 detekt 进行代码分析

[detekt](https://github.com/detekt/detekt) 是一个用于 Kotlin 的静态代码分析工具，可以检测代码异味、复杂度问题和潜在错误。

要将 detekt 集成到您的项目中：

1. 将插件添加到您的构建文件中：

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

2. 生成默认的 `detekt.yml` [配置文件](https://detekt.dev/docs/introduction/configurations)：

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

3. 打开 `detekt.yml` 文件并自定义生成的规则，例如：

   ```yaml
   complexity:
     LongMethod:
       threshold: 50
   style:
     MagicNumber:
       active: false
   ```

4. 在构建文件中引用该配置文件，以便 detekt 可以应用新规则：

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

5. 运行分析：

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

detekt 会生成一份报告，列出所有违反规则的情况，包括其严重级别、文件位置和问题描述。默认情况下，Gradle 将报告输出到 `build/reports/detekt`，而 Maven 将报告输出到项目根目录下的 `reports/detekt` 目录。

有关更多信息，请参阅适用于 [Gradle](https://detekt.dev/docs/intro) 和 [Maven](https://github.com/Ozsie/detekt-maven-plugin) 的 detekt 文档。

## 使用 SonarSource 保证代码质量

来自 SonarSource 的 [SonarQube](https://github.com/SonarSource/sonarqube) 和 [SonarCloud](https://github.com/marketplace/sonarcloud) 为 Kotlin 项目提供深层静态分析，包括错误检测、漏洞扫描以及通过 Web 仪表板进行的测试覆盖率跟踪。

要使用 SonarQube 分析您的项目：

1. 将插件添加到您的构建文件中：

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

2. （可选）配置分析属性。例如，要让构建等待质量门结果，并在未通过质量门时使构建失败，请添加 `sonar.qualitygate.wait` 属性：

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

   > 质量门规则（例如最低覆盖率阈值和允许的问题计数）是在 SonarQube 或 SonarCloud Web 界面的 **Quality Gates** 下定义的，而不是在构建文件中。
   >
   {style="note"}

3. 针对您的 SonarQube 服务器运行分析：

   <tabs group="build-system">
   <tab title="Maven" group-key="maven">

   ```bash
   mvn verify sonar:sonar \
     -Dsonar.projectKey=my-project \
     -Dsonar.host.url=http://localhost:9000 \
     -Dsonar.token=YOUR_TOKEN
   ```

   对于 SonarCloud，请将主机 URL 替换为 `https://sonarcloud.io` 并提供您的组织密钥：

   ```bash
   mvn verify sonar:sonar \
     -Dsonar.projectKey=my-project \
     -Dsonar.organization=my-org \
     -Dsonar.host.url=https://sonarcloud.io \
     -Dsonar.token=YOUR_TOKEN
   ```

   </tab>
   <tab title="Gradle" group-key="gradle">

   要运行分析，请使用 `sonar` 任务并提供您的身份验证令牌：

   ```bash
   ./gradlew sonar \
     -Dsonar.token=YOUR_TOKEN
   ```

   默认情况下，分析是针对本地 SonarQube 服务器运行的。要使用 SonarCloud，请更新 `build.gradle.kts` 中的 `sonar {}` 块以使用 `https://sonarcloud.io` 并添加您的组织密钥：

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

4. 打开 SonarQube 或 SonarCloud 仪表板以查看结果。仪表板会显示按类型（错误、漏洞、代码异味）和严重级别分组的问题。

有关更多信息，请参阅 [SonarSource 文档](https://docs.sonarsource.com/)。

## 使用 Kover 进行代码覆盖率分析

[Kover](https://github.com/Kotlin/kotlinx-kover) 是 JetBrains 官方推出的 Kotlin 代码覆盖率工具。它能测量代码中哪些行和分支被测试覆盖，并生成人类可读的报告。

与 [JaCoCo](https://github.com/jacoco/jacoco) 不同，Kover 能正确解析内联函数和数据类等 Kotlin 特有结构，因此它能报告准确的覆盖率数字，不会因编译器生成的字节码而产生假阴性结果。

要将 Kover 集成到您的项目中：

1. 将插件添加到您的构建文件中：

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

2. 运行测试以收集覆盖率数据并生成报告：

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

3. 打开在 `target/site/kover/html/` 目录（Gradle 为 `build/reports/kover/html/`）中生成的 HTML 报告，以查看逐行覆盖率情况。
4. （可选）要强制执行最低覆盖率阈值（如果未达到条件则构建失败），您可以向构建文件添加覆盖率验证配置。例如：

   <tabs group="build-system">
   <tab title="Maven" group-key="maven">

   ```xml
   <!-- pom.xml -->
   <configuration>
     <!-- 创建新的覆盖率验证规则 -->
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
   // 添加一个 `kover` 配置块
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

有关配置验证规则的更多信息，请参阅适用于 [Maven](https://kotlin.github.io/kotlinx-kover/maven-plugin/) 和 [Gradle](https://kotlin.github.io/kotlinx-kover/gradle-plugin/) 的 Kover 文档。

## 其他工具

除了 ktlint、detekt、SonarQube、SonarCloud 和 Kover，您还可以尝试其他工具来提高 Kotlin 代码质量：

| 工具                                       | 描述                                                                                                                                 |
|-------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------|
| [CodeQL](https://codeql.github.com/docs/) | GitHub 开发的语义代码分析引擎。支持 Kotlin 并与 GitHub Actions 集成，可自动查找安全漏洞。                                |
| [Semgrep](https://semgrep.dev/docs/)      | 快速、轻量级的静态分析工具，支持自定义规则。可用于在 Kotlin 代码中强制执行特定模式或检测反模式。  |
| [PMD](https://docs.pmd-code.org/latest/)  | 源代码分析器，支持 Kotlin（通过其 CPD 复制粘贴检测器），可检测常见的编程缺陷和重复代码。        |

## 下一步

* [在 Maven 项目中运行测试](jvm-test-maven.md)
* [使用 Maven 配置 Kotlin 项目](maven-configure-project.md)