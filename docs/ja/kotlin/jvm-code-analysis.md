[//]: # (title: Kotlin プロジェクトにおけるコード品質ツール)
[//]: # (description: ktlint、detekt、SonarQube、SonarCloud、Kover などのコード品質ツールを Kotlin バックエンドプロジェクトに統合する方法を学びます。)

コード品質ツールは、コーディング標準の適用、バグの早期検出、テストカバレッジの測定、および Kotlin プロジェクト全体のコード品質の維持に役立ちます。このガイドでは、[ktlint](https://ktlint.github.io/ktlint/latest/)、[detekt](https://detekt.dev/)、[SonarQube](https://www.sonarsource.com/products/sonarqube/)、[SonarCloud](https://www.sonarsource.com/products/sonarcloud/)、[Kover](https://kotlin.github.io/kotlinx-kover/) などの一般的なツールを、Maven または Gradle を使用したバックエンドプロジェクトに統合する方法を紹介します。

## ktlint によるコードフォーマット

[ktlint](https://github.com/ktlint/ktlint) は、追加の設定なしで Kotlin 公式の[コーディング規約](coding-conventions.md)を適用する Kotlin リンターおよびフォーマッターです。

ktlint は、インデント、演算子の周りのスペース、インポートの順序、末尾のカンマなどのルールをチェックします。違反が見つかった場合、ファイル名と行番号を示すメッセージとともにビルドが失敗します。違反を報告するだけでなく、ktlint は単純な問題を自動的に修正することもできます。

ktlint をプロジェクトに統合するには、以下の手順に従います。

1. ビルドファイルにプラグインを追加します。

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

2. リンターを実行してコードスタイルをチェックします。

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

3. (オプション) プロジェクトのルートに `.editorconfig` ファイルを追加して、ルールをカスタマイズすることもできます。例えば、ワイルドカードインポートを許可し、末尾のカンマの適用を無効にするには次のようにします。

   ```ini
   [*.{kt,kts}]
   ij_kotlin_imports_layout = *
   ktlint_standard_trailing-comma-on-call-site = disabled
   ktlint_standard_trailing-comma-on-declaration-site = disabled
   ```

   デフォルトでは、ktlint は Kotlin 公式のコーディング規約に従います。Kotlin の規約とは顕著に異なる [Android Kotlin スタイルガイド](https://developer.android.com/kotlin/style-guide)を好む場合は、`.editorconfig` ファイルでコードスタイルを `android_studio` に設定してください。

   ```ini
   [*.{kt,kts}]
   ktlint_code_style = android_studio
   ```

4. フォーマットの問題を自動的に修正するには、以下を実行します。

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

利用可能な機能やルールの詳細については、[ktlint ドキュメント](https://github.com/ktlint/ktlint/tree/master/documentation)を参照してください。

## detekt によるコード解析

[detekt](https://github.com/detekt/detekt) は Kotlin 用の静的コード解析ツールで、コードスメル（code smells）、複雑性の問題、潜在的なバグを検出します。

detekt をプロジェクトに統合するには、以下の手順に従います。

1. ビルドファイルにプラグインを追加します。

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

2. デフォルトの `detekt.yml` [設定ファイル](https://detekt.dev/docs/introduction/configurations)を生成します。

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

3. `detekt.yml` ファイルを開き、生成されたファイルのルールをカスタマイズします。例：

   ```yaml
   complexity:
     LongMethod:
       threshold: 50
   style:
     MagicNumber:
       active: false
   ```

4. detekt が新しいルールを適用できるように、ビルドファイル内で設定ファイルを参照します。

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

5. 解析を実行します。

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

detekt は、すべてのルール違反を深刻度、ファイルの場所、問題の説明とともにリストしたレポートを生成します。デフォルトでは、Gradle は `build/reports/detekt` にレポートを出力し、Maven はプロジェクトルートの `reports/detekt` ディレクトリに出力します。

詳細については、[Gradle](https://detekt.dev/docs/intro) および [Maven](https://github.com/Ozsie/detekt-maven-plugin) の detekt ドキュメントを参照してください。

## SonarSource によるコード品質

SonarSource の [SonarQube](https://github.com/SonarSource/sonarqube) および [SonarCloud](https://github.com/marketplace/sonarcloud) は、バグ検出、脆弱性スキャン、Web ダッシュボードによるコードカバレッジ追跡など、Kotlin プロジェクト向けの深い静的解析を提供します。

SonarQube でプロジェクトを解析するには、以下の手順に従います。

1. ビルドファイルにプラグインを追加します。

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

2. (オプション) 解析プロパティを設定します。例えば、クオリティゲート（quality gate）の結果を待機し、ゲートを通過しなかった場合にビルドを失敗させるには、`sonar.qualitygate.wait` プロパティを追加します。

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

   > クオリティゲートのルール（最小カバレッジしきい値や許容される問題数など）は、ビルドファイルではなく、SonarQube または SonarCloud の Web インターフェースの **Quality Gates** で定義されます。
   >
   {style="note"}

3. SonarQube サーバーに対して解析を実行します。

   <tabs group="build-system">
   <tab title="Maven" group-key="maven">

   ```bash
   mvn verify sonar:sonar \
     -Dsonar.projectKey=my-project \
     -Dsonar.host.url=http://localhost:9000 \
     -Dsonar.token=YOUR_TOKEN
   ```

   SonarCloud の場合は、ホスト URL を `https://sonarcloud.io` に置き換え、組織キーを指定します。

   ```bash
   mvn verify sonar:sonar \
     -Dsonar.projectKey=my-project \
     -Dsonar.organization=my-org \
     -Dsonar.host.url=https://sonarcloud.io \
     -Dsonar.token=YOUR_TOKEN
   ```

   </tab>
   <tab title="Gradle" group-key="gradle">

   解析を実行するには、`sonar` タスクを使用し、認証トークンを提供します。

   ```bash
   ./gradlew sonar \
     -Dsonar.token=YOUR_TOKEN
   ```

   デフォルトでは、解析はローカルの SonarQube サーバーに対して実行されます。SonarCloud を使用するには、`build.gradle.kts` の `sonar {}` ブロックを更新して `https://sonarcloud.io` を使用するようにし、組織キーを追加します。

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

4. SonarQube または SonarCloud のダッシュボードを開いて結果を確認します。ダッシュボードには、タイプ（バグ、脆弱性、コードスメル）と深刻度ごとにグループ化された問題が表示されます。

詳細については、[SonarSource ドキュメント](https://docs.sonarsource.com/)を参照してください。

## Kover によるコードカバレッジ

[Kover](https://github.com/Kotlin/kotlinx-kover) は、JetBrains 公式の Kotlin 用コードカバレッジツールです。コードのどの行や分岐がテストによってカバーされているかを測定し、人間が読める形式のレポートを生成します。

[JaCoCo](https://github.com/jacoco/jacoco) とは異なり、Kover はインライン関数やデータクラスなどの Kotlin 固有の構造を正しく解釈するため、コンパイラによって生成されたバイトコードによる偽陰性（false negatives）なしに、正確なカバレッジ数値を報告します。

Kover をプロジェクトに統合するには、以下の手順に従います。

1. ビルドファイルにプラグインを追加します。

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

2. テストを実行してカバレッジデータを収集し、レポートを生成します。

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

3. `target/site/kover/html/` ディレクトリ（Gradle の場合は `build/reports/kover/html/`）に生成された HTML レポートを開き、行ごとのカバレッジを確認します。
4. (オプション) 条件を満たさない場合にビルドを失敗させる最小カバレッジしきい値を適用するには、ビルドファイルにカバレッジ検証設定を追加します。例：

   <tabs group="build-system">
   <tab title="Maven" group-key="maven">

   ```xml
   <!-- pom.xml -->
   <configuration>
     <!-- 新しいカバレッジ検証ルールを作成 -->
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
   // `kover` 設定ブロックを追加
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

検証ルールの設定に関する詳細については、[Maven](https://kotlin.github.io/kotlinx-kover/maven-plugin/) および [Gradle](https://kotlin.github.io/kotlinx-kover/gradle-plugin/) の Kover ドキュメントを参照してください。

## その他のツール

ktlint、detekt、SonarQube、SonarCloud、Kover の他にも、Kotlin のコード品質を向上させるためのツールを試してみてください。

| ツール | 説明 |
|-------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------|
| [CodeQL](https://codeql.github.com/docs/) | GitHub によるセマンティックコード解析エンジン。Kotlin をサポートし、GitHub Actions と統合してセキュリティの脆弱性を自動的に発見します。 |
| [Semgrep](https://semgrep.dev/docs/)      | カスタムルールをサポートする、高速で軽量な静的解析ツール。Kotlin コードにおけるパターンの強制やアンチパターンの検出に使用できます。 |
| [PMD](https://docs.pmd-code.org/latest/)  | Kotlin をサポートし（CPD コピペ検出器経由）、一般的なプログラミングの欠陥や重複コードを検出するソースコードアナライザー。 |

## 次のステップ

* [Maven プロジェクトでのテストの実行](jvm-test-maven.md)
* [Maven を使用した Kotlin プロジェクトの設定](maven-configure-project.md)