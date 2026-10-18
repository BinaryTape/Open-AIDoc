[//]: # (title: Kotlin 後端開發常見問題)

本頁面回答了關於使用 Maven 建置、測試和發布 Kotlin 後端應用程式的一些常見問題。
每個解答都包含指向 Kotlin 或外部文件中更詳細說明的連結。

## 多模組建置、BOM 與版本管理 {id="multi-module-builds-bom-and-version-management"}

### 如何在多模組建置中固定單一 Kotlin 版本？ {id="how-to-pin-a-single-kotlin-version-across-a-multi-module-build"}

在父 POM 檔案中宣告單一 `kotlin.version` 屬性，並在所有地方重複使用它：

* 在父 `pom.xml` 檔案中設定一次 `kotlin-maven-plugin` 版本。為此，請在 `<properties>` 區段中設定 Kotlin 版本，並在 `<build><plugins>` 或 `<build><pluginManagement>` 區段中將其引用為 `${kotlin.version}`。
  若要了解更多，請參閱[專案配置](mixing-java-kotlin-intellij.md#maven)。
* 透過 Kotlin BOM 檔案保持 Kotlin 程式庫版本一致，以便 `kotlin-stdlib`、`kotlin-reflect`、`kotlin-test` 以及其他構件始終解析為相同的發行版本，而不會在模組之間產生差異。
  若要了解更多，請參閱[使用 BOM 管理相依性](maven-set-dependencies.md#manage-dependencies-with-a-bom)。

### 什麼是 Kotlin BOM 以及如何使用它？ {id="what-is-the-kotlin-bom-and-how-to-use-it"}

Kotlin BOM（`org.jetbrains.kotlin:kotlin-bom`）是一個特殊的 POM 檔案，用於管理 Kotlin 程式庫的版本，以便相關構件能保持與同一個 Kotlin 發行版本一致，即使它們是透過傳遞性相依性引入的也是如此。

在 `pom.xml` 的 `<dependencyManagement>` 區段中使用 `<type>pom</type>` 和 `<scope>import</scope>` 匯入它。
接著您就可以在宣告 Kotlin 相依性時省略 `<version>`。版本將自動從 BOM 檔案中取得。

若要了解更多，請參閱[使用 BOM 管理相依性](maven-set-dependencies.md#manage-dependencies-with-a-bom)。

### 我需要保持 Kotlin Maven 外掛程式版本與 Kotlin 程式庫版本一致嗎？ {id="do-i-need-to-keep-the-kotlin-maven-plugin-version-aligned-with-kotlin-library-versions"}

是的。混用編譯器版本與不相容的 Kotlin 程式庫可能會導致「混用 Kotlin 版本（Mixed Kotlin versions）」失敗以及元資料不相容問題。保持一致性最簡單的方法就是使用只定義過一次的相同 Kotlin 版本。例如：

* 在父 `pom.xml` 檔案中設定一次 [`kotlin-maven-plugin`](maven-kotlin-compiler.md) 版本，然後在所有地方將其引用為 `${kotlin.version}`。
* 匯入 [Kotlin BOM](maven-set-dependencies.md#manage-dependencies-with-a-bom)，使所有 Kotlin 程式庫遵循同一個發行版本。

### 如何跨所有模組設定 Kotlin 編譯器選項？ {id="how-to-configure-kotlin-compiler-options-across-all-modules"}

若要跨所有 Maven 模組設定 Kotlin 編譯器，可以透過以下其中一種方式，在父 `pom.xml` 檔案中集中設定選項：

* 在父 `<properties>` 區段中設定編譯器選項，例如 `kotlin.compiler.languageVersion`、`kotlin.compiler.apiVersion` 和 `kotlin.compiler.jvmTarget`。
* 在父 `pom.xml` 檔案中共享單一 `kotlin-maven-plugin` 的 `<configuration>`（例如額外的 `<args>`），讓所有模組都使用相同的設定進行編譯。

針對個別模組進行覆寫是可行的，但應儘量少用。如需完整的選項及其屬性名稱清單，請參閱[編譯器選項](maven-kotlin-compiler.md)。

### 為什麼會在多模組建置中遇到位元組碼層級不符的問題？ {id="why-do-i-get-bytecode-level-mismatches-in-a-multi-module-build"}

您可能會遇到 `UnsupportedClassVersionError` 及類似錯誤，這表示生成的位元組碼所適用的 JVM 版本比目前執行程式碼的 JVM 版本更新。為避免此類問題，請在各模組與 CI 之間保持以下項目一致：

* 執行 Maven 的 JDK。
* Java 編譯器目標（Java compiler target）。
* Kotlin 的 `jvmTarget` 選項。

如果您在專案中啟用了 `<extensions>` 選項，Kotlin 和 Java 編譯器將自動以相同的位元組碼版本為目標。如需深入了解 Kotlin Maven 外掛程式如何根據建置檔案中的不同選項解析目標 JVM 版本，請參閱 [JVM 目標版本](maven-configure-project.md#jvm-target-version)。

若要進行手動設定，請使用 `maven-toolchains-plugin` 來設定單一工具鏈，以控制建置中所有外掛程式的 JDK 版本。若要了解更多，請參閱[設定 JDK 版本](maven-configure-project.md#set-jdk-version)。

## 測試：Surefire、Failsafe 與 JUnit {id="testing-surefire-failsafe-and-junit"}

### 為什麼 `mvn test` 會略過 Kotlin 測試？ {id="why-does-mvn-test-skip-kotlin-tests"}

在嘗試執行 `mvn test` 指令時，您可能會遇到「Tests run: 0」錯誤。最常見的原因包括：

* **測試探索**：Surefire 會執行遵循 `*Test` 命名模式的測試。Failsafe 外掛程式則透過 `mvn verify` 指令執行以 `*IT` 後綴命名的整合測試。若要了解更多，請參閱[執行測試](jvm-test-maven.md#run-tests)。
* **類別路徑缺少引擎**：加入 JUnit 測試相依性，以便 JUnit 可以探索並執行您的測試。最簡單的選項是使用 [`kotlin-test-junit5`](jvm-test-maven.md#junit-5-and-later)，它會拉取必要的 JUnit 構件。若要了解更多，請參閱[測試程式庫的相依性](maven-set-dependencies.md#dependencies-on-test-libraries)。
* **測試原始碼未編譯**：確保執行了 Kotlin 的 `test-compile` 執行項目，以便在執行測試之前先編譯 Kotlin 測試原始碼。

### 如何設定 Surefire 外掛程式以執行 JUnit 測試？ {id="how-to-configure-the-surefire-plugin-to-run-junit-tests"}

若要設定 Surefire 外掛程式以執行 JUnit 測試：

1. 新增帶有 `<scope>test</scope>` 的 JUnit 測試相依性（例如 [`kotlin-test-junit5`](jvm-test-maven.md#junit-5-and-later)），將 JUnit 包含在測試類別路徑中。
2. 將 [Surefire 外掛程式](jvm-test-maven.md#with-surefire-plugin)加入您的 `pom.xml` 檔案。
3. 檢查類別路徑上是否存在衝突的測試提供者（test provider），這會導致「缺少引擎／提供者錯誤（missing engine / wrong provider）」的錯誤。

如需完整的設定和範例專案，請參閱[使用 Maven 測試 Kotlin 專案](jvm-test-maven.md)。

### 如何將 Maven Kotlin 後端升級至 JUnit 6？ {id="how-to-upgrade-a-maven-kotlin-backend-to-junit-6"}

Kotlin/JVM 支援最新的穩定 JUnit 版本，包括 JUnit 6。
針對 JUnit 6，請在 `pom.xml` 中保留相同的 [`kotlin-test-junit5`](jvm-test-maven.md#junit-5-and-later) 相依性。

升級時，請確保：

* 正確設定了新 JUnit 版本所需的 Java 基準版本。
* 所有 JUnit 相關相依性的版本均已對齊。
* 測試程式碼中沒有已棄用的組件。

若要了解更多，請參閱[使用 JUnit 建立測試](jvm-test-maven.md#create-tests-with-junit)。

### 如何拆分單元測試和整合測試？ {id="how-to-split-unit-and-integration-tests"}

將執行拆分在兩個外掛程式之間。針對單元測試，請在 `test` 階段使用 [Surefire 外掛程式](jvm-test-maven.md#with-surefire-plugin)。
單元測試請採用 `*Test` 命名慣例。

針對整合測試，請在 `integration-test` 和 `verify` 階段使用 [Failsafe 外掛程式](jvm-test-maven.md#with-failsafe-plugin)。整合測試請採用 `*IT` 命名慣例。

若僅執行單元測試，請執行 `mvn test`；若兩者都要執行，請執行 `mvn verify`。

若要了解更多，請參閱[使用 Maven 測試 Kotlin 專案](jvm-test-maven.md)。

## 註解處理：kapt 與 KSP {id="annotation-processing-kapt-and-ksp"}

### 我可以在 Maven 中使用 KSP 嗎？ {id="can-i-use-ksp-with-maven"}

由於 KSP 目前僅正式支援 Gradle，我們建議所有 Maven 專案使用 [kapt](kapt.md)。
您可以嘗試社群維護的 KSP Maven 外掛程式，但它們具有各自的支援與維護流程。

Maven 的另一個選項是在建置階段中透過 KSP 的[命令列](ksp-command-line.md)進入點來執行它。這代表將 KSP 程式碼產生串接至 Maven 生命週期中：在早期階段（例如 `generate-sources`）執行 KSP，並將產生的程式碼輸出到穩定的目錄中。然後將該目錄加入編譯原始碼根目錄，並確保程式碼產生作業在 Kotlin 編譯**之前**執行，以便在編譯您的程式碼時已存在產生的原始碼。

若要了解更多，請參閱[在 Kotlin 專案中使用註解處理器](jvm-annotation-processors.md)。

### 在以 Gradle 為基礎的 Kotlin 後端中，我何時該使用 kapt 或 KSP？ {id="when-should-i-use-kapt-versus-ksp-in-a-gradle-based-kotlin-backend"}

如果您想在 Kotlin Gradle 專案中使用現有的 Java 註解處理器，請先檢查 [KSP 是否已經支援它們](ksp-overview.md#supported-libraries)。
對於不受支援的處理器，請使用 [kapt](kapt.md)。

如果您想自行編寫註解處理器，請使用 [KSP](ksp-quickstart.md#create-your-own-processor)。

若要了解更多，請參閱 [Kotlin 專案中的註解處理器](jvm-annotation-processors.md)。

### 如何設定 kapt？ {id="how-to-configure-kapt"}

要在 Kotlin Maven 專案中設定 kapt，請在 `compile` 執行**之前**新增一個來自 `kotlin-maven-plugin` 的 `kapt` 目標（goal）執行項目，並在 `<annotationProcessorPaths>` 下明確列出註解處理器。這可確保在編譯引用這些原始碼的程式碼之前，先產生相對應的原始碼。

若要了解更多，請參閱[在 Maven 中設定 kapt](kapt.md#set-up-in-maven)以及[搭配 MapStruct 使用 kapt](jvm-annotation-processors.md#use-kapt-with-java-annotation-processors) 的範例。

### 為什麼 kapt 在較新的 JDK 上會失敗？ {id="why-does-kapt-fail-on-newer-jdks"}

在整合 kapt 的 Kotlin 專案中使用現代 JDK 時，您可能會遇到「IllegalAccessError」或「InaccessibleObjectException」錯誤。這可能是由於內部套件的強封裝所導致的，而 kapt 在進行註解處理時需要存取這些套件。

您可以透過將 Kotlin 更新至最新版本，並在執行 Maven 的 JVM 中新增所需的 `--add-opens` 引數來解決此問題。

`--add-opens` 引數指示 JVM 開放內部 JDK 套件以進行深層反射存取，強封裝在預設情況下會阻止此操作。其格式為 `--add-opens <module>/<package>=<target-module>`，對於從類別路徑執行的程式碼（例如建置工具），`<target-module>` 通常為 `ALL-UNNAMED`。例如，若要授予 kapt 存取所需的編譯器內部組件：

```bash
--add-opens jdk.compiler/com.sun.tools.javac.util=ALL-UNNAMED
```

套用這些引數最簡單的方法是將它們加入專案根目錄下的存放庫層級 `.mvn/jvm.config` 檔案中，每行一個 JVM 引數。Maven 會自動將該檔案中的每個選項傳遞給執行建置的 JVM，因此每位開發人員與 CI 執行器都能使用相同的設定。

如需有關 kapt 設定的更多資訊，請參閱 [kapt 編譯器外掛程式](kapt.md)。

### kapt 在何處產生原始碼，以及如何修正其 IDE 匯入問題？ {id="where-does-kapt-generate-sources-and-how-to-fix-their-ide-imports"}

kapt 在模組的 `target/` 目錄中產生原始碼，並將其新增為原始碼根目錄，以便它們作為建置的一部分進行編譯。

如果您在 IDE 中看到「紅色」的匯入錯誤，請重新匯入您的 Kotlin Maven 專案，讓 IDE 能夠識別所產生原始碼的目錄。

如需有關 kapt 設定的更多資訊，請參閱 [kapt 編譯器外掛程式](kapt.md)。

## 品質閘：格式化與涵蓋率 {id="quality-gates-formatting-and-coverage"}

### 如何強制執行 Kotlin 格式化檢查？ {id="how-to-enforce-kotlin-formatting-checks"}

在 `pom.xml` 建置檔案中將 ktlint 的 `check` 目標繫結至 `verify` 階段，這樣在違反格式規則時 CI 就會建置失敗。
將 `format` 保留為明確的開發人員操作。您可以在 `.editorconfig` 檔案中調整格式規則。

若要了解更多，請參閱[使用 ktlint 進行程式碼格式化](jvm-code-analysis.md#code-formatting-with-ktlint)。
您還可以將 [detekt](jvm-code-analysis.md#code-analysis-with-detekt) 靜態分析加入專案的品質閘中。

### 為什麼 Kotlin linter 或格式化程式在 Java 17+ 上會失敗？ {id="why-do-kotlin-linters-or-formatters-fail-on-java-17"}

在 Java 17 及更新版本中使用 Kotlin linter 或格式化程式時，您可能會遇到模組存取錯誤。

這些工具在 Maven JVM 內部執行，因此在較新的 JDK 上它們可能需要額外的 `--add-opens` 引數。每個引數都使用 `--add-opens <module>/<package>=ALL-UNNAMED` 格式，以開放內部 JDK 套件進行反射存取。將這些引數逐行放入存放庫層級的 `.mvn/jvm.config` 檔案中，這樣相同的設定就會被提交至存放庫，並在本機與 CI 中同時生效。如需更多詳細資訊，請參閱[為什麼 kapt 在較新的 JDK 上會失敗？](#why-does-kapt-fail-on-newer-jdks)。

### 推薦哪些程式碼涵蓋率工具？ {id="which-code-coverage-tools-are-recommended"}

[Kover](https://github.com/Kotlin/kotlinx-kover) 是 JetBrains 官方為 Kotlin 推出的涵蓋率工具。它能理解 Kotlin 特有的語法結構，並提供內建驗證規則的 Maven 外掛程式，因此它是 Kotlin 優先專案的推薦選擇。

如果您已經有既有的 Java 涵蓋率管線及相關報告機制，另一個選擇是使用 [JaCoCo](https://github.com/jacoco/jacoco)。

若要了解更多，請參閱[使用 Kover 進行程式碼涵蓋率分析](jvm-code-analysis.md#code-coverage-with-kover)。

### 如何為多模組專案產生彙總涵蓋率報告？ {id="how-to-generate-an-aggregated-coverage-report-for-a-multi-module-project"}

若要為 Maven 專案中的所有模組產生涵蓋率報告，請收集每個模組的涵蓋率資料，並在相依於其他模組的專用報告模組中進行彙總。這樣一來，彙總作業就會在個別模組產生執行資料之後才執行。您可以使用 [`kover-maven-plugin`](https://kotlin.github.io/kotlinx-kover/maven-plugin/) 來實作此工作流程。

若要了解更多，請參閱[使用 Kover 進行程式碼涵蓋率分析](jvm-code-analysis.md#code-coverage-with-kover)。

## 建置應用程式：打包與執行階段 {id="building-applications-packaging-and-runtime"}

### 如何建置可執行的 JAR 並設定入口點？ {id="how-to-build-a-runnable-jar-and-set-the-entry-point"}

若要建置可執行的 JAR，您需要設定 `Main-Class` 入口點。它應該是包含頂層 `main()` 函式的 Kotlin 檔案編譯後所產生的 JVM 類別名稱。例如，`Main.kt` 檔案中的 `main()` 函式會被編譯為 `MainKt` 類別。

透過 `maven-jar-plugin` 資訊清單（manifest）配置將該類別名稱設定為 `Main-Class` 入口點。

若要了解更多，請參閱[建立 JAR 檔案](maven-compile-package.md#create-jar-files)。

### 為什麼打包後的應用程式會出現主類別錯誤而失敗？ {id="why-does-the-packaged-application-fail-with-main-class-errors"}

在建置應用程式時，尤其是在容器中，您可能會遇到「找不到或無法載入主類別（Could not find or load main class）」的錯誤。若要對此問題進行偵錯，請參考以下檢查清單：

* 檢查資訊清單中的 `Main-Class` 是否指向[正確的編譯後類別](#how-to-build-a-runnable-jar-and-set-the-entry-point)。
* 確保您執行的是正確的構件：精簡的 [JAR](maven-compile-package.md#create-jar-files) 需要其相依性位於類別路徑上，而[獨立的 JAR（self-contained JAR）](maven-compile-package.md#create-self-contained-jar-files) 則會將它們打包在一起。
* 檢查容器入口點是否使用了正確的 `java -jar` 指令與類別路徑。

### 如何將 Kotlin 執行階段類別一起打包成 Fat JAR？ {id="how-to-build-a-fat-jar-together-with-kotlin-runtime-classes"}

若要建置 Fat（uber）JAR 並避免遺失 Kotlin 執行階段類別，請建置一個組合了相依性的獨立 JAR，並確保 Kotlin 標準程式庫位於執行階段類別路徑上。由於 Fat JAR 包含相依性，將 [`kotlin-stdlib`](maven-set-dependencies.md#dependency-on-the-standard-library) 宣告為相依性即可確保 Kotlin 執行階段被打包進去。

若要了解更多，請參閱[建立獨立的 JAR 檔案](maven-compile-package.md#create-self-contained-jar-files)。

### JVM 引數應該放在何處？ {id="where-should-jvm-arguments-be"}

請將 Maven 建置流程、測試 JVM 與執行階段的 JVM 引數分別放在三個不同的位置：

* **Maven 建置 JVM**：將共享引數放入存放庫層級的 `.mvn/jvm.config` 檔案中。
* **測試 JVM**：將它們放置在 [Surefire](jvm-test-maven.md#with-surefire-plugin) 和 [Failsafe](jvm-test-maven.md#with-failsafe-plugin) 外掛程式配置區段中。
* **執行階段**：在啟動[打包後應用程式](maven-compile-package.md)的容器指令或部署配置中進行設定。

## 發布程式庫：原始碼與簽名 {id="publishing-libraries-sources-and-signing"}

### 發布至 Maven Central 有哪些需求？ {id="what-are-the-requirements-to-publish-to-maven-central"}

若要將 Kotlin 程式庫發布至 [Maven Central](https://central.sonatype.com/)：

1. **準備構件**：建置主構件、[原始碼 JAR](#how-to-attach-and-deploy-a-source-jar) 和文件（Javadoc）JAR。
2. **填寫完整的 POM 元資料**：名稱、說明、授權、開發者以及 SCM 資訊。
3. **簽署構件**：以[對 CI 友善的方式](#how-to-sign-artifacts-for-maven-central-in-a-ci-friendly-way)為每個構件產生 GPG 簽名。
4. **部署構件**：搭配 [`central-publishing-maven-plugin`](https://central.sonatype.org/publish/publish-portal-maven/) 執行 `mvn deploy`，產生部署套件組合並將其上傳至 Maven Central 進行驗證。

   外掛程式不會自動為您產生原始碼 JAR、Javadoc JAR 或 GPG 簽名，因此您需要分別設定這些先決條件。

請記住，Maven Central 的發布版本是不可變的：一旦某個版本發布後，就無法替換。

如需有關產生文件 JAR 的更多資訊，請參閱 [Dokka 文件引擎](dokka-maven.md)。
如需完整的發布流程與需求，請參閱官方 [Sonatype 文件](https://central.sonatype.org/publish/publish-portal-maven/)。

### 如何附加並部署原始碼 JAR？ {id="how-to-attach-and-deploy-a-source-jar"}

若要為基於 Maven 的 Kotlin 程式庫附加並部署原始碼 JAR，請將 [`maven-source-plugin`](https://maven.apache.org/plugins/maven-source-plugin/) 繫結至建置生命週期，以便自動附加原始碼構件並與主構件一起部署。

如果您的專案發布了多個一起發行的新程式庫，請考慮提供您自己的 [BOM](maven-set-dependencies.md#manage-dependencies-with-a-bom) 檔案，以便使用者能以您對齊 Kotlin 構件的相同方式來對齊版本。

### 如何以對 CI 友善的方式為 Maven Central 構件簽名？ {id="how-to-sign-artifacts-for-maven-central-in-a-ci-friendly-way"}

若要以對 CI 友善的方式設定 Maven Central 構件，我們建議：

* 使用 [`maven-gpg-plugin`](https://maven.apache.org/plugins/maven-gpg-plugin/) 簽署專案附加的所有構件。
* 透過 CI 密鑰（secrets）或環境變數提供金鑰內容與密碼短語，而不是將它們提交到存放庫中。
* 確保簽名步驟在部署步驟之前執行，以便每個發布的構件（包括原始碼和 Javadoc JAR）都經過簽署。

## 疑難排解 {id="troubleshooting"}

### 如何修正 JDK 17 上的外掛程式失敗問題？ {id="how-to-fix-the-plugin-failure-on-jdk-17"}

在 JDK 17 上，您可能會遇到 Kotlin Maven 外掛程式失敗，並收到在執行 Maven 的 JVM 中新增 `--add-opens` 引數的建議。

若要在專案層級解決此問題，請將所需的 JVM 引數放入存放庫層級的 `.mvn/jvm.config` 檔案中（每行一個引數），以便每位開發人員和 CI 執行器都使用相同的設定，並保持您的 [Kotlin 版本](maven-kotlin-compiler.md)為最新狀態。這可以保持本機與 CI 行為的一致性。

每個 `--add-opens` 引數均遵循 `--add-opens <module>/<package>=ALL-UNNAMED` 格式，以開放內部 JDK 套件進行反射存取。如需更多詳細資訊，請參閱[為什麼 kapt 在較新的 JDK 上會失敗？](#why-does-kapt-fail-on-newer-jdks)。

### 為什麼我會收到 Kotlin 或 API 版本不符的錯誤？ {id="why-do-i-get-mismatch-errors-for-kotlin-or-api-versions"}

您可能會遇到「不再支援 API 版本 X（API version X is no longer supported）」或「模組是使用不相容的 Kotlin 版本編譯的（module was compiled with an incompatible version of Kotlin）」錯誤。這表示編譯器與類別路徑上的 Kotlin 程式庫之間版本不一致。若要修正此問題：

* 對齊編譯器與所有 Kotlin 程式庫使用的版本。在 `<properties>` 區段中宣告一次 Kotlin 版本並使用 `${kotlin.version}` 進行引用，並使用 [Kotlin BOM](maven-set-dependencies.md#manage-dependencies-with-a-bom) 檔案。
* 移除使用不相容版本的舊傳遞性 Kotlin 構件。
* 根據您要鎖定的目標 Kotlin 版本，檢查 [`languageVersion` 和 `apiVersion`](maven-kotlin-compiler.md#attributes-specific-to-jvm)。