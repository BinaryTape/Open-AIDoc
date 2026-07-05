[//]: # (title: Maven)

Maven 是一個建構系統，可協助管理僅限 Kotlin 或 Kotlin-Java 混合專案，並自動化您的建構程序。
它適用於基於 JVM 的專案，並會下載必要的相依性、編譯並封裝您的程式碼。
在 [Maven](https://maven.apache.org/) 網站上進一步了解其基本概念和細節。

以下是處理 Kotlin Maven 專案時的一般工作流程：

1. [配置您的 Java 或 Kotlin 專案](maven-configure-project.md)。
2. [宣告儲存庫](maven-set-dependencies.md#declare-repositories)。
3. [設定專案相依性](maven-set-dependencies.md)。
4. [配置 Kotlin 編譯器](maven-kotlin-compiler.md)。
5. [封裝您的應用程式](maven-compile-package.md)。

若要開始使用，您也可以參考我們的逐步教學：

* [配置 Java 專案以搭配 Kotlin 使用](mixing-java-kotlin-intellij.md)
* [使用 Kotlin 與 JUnit 測試您的 Java Maven 專案](jvm-test-using-junit.md)

> 您可以查看我們公開的 [範例專案](https://github.com/kotlin-hands-on/kotlin-junit-sample/tree/main/complete)，
> 該專案已針對 Kotlin/Java 混合專案設定好 Maven 與 Gradle 建構檔案。
>
{style="tip"}

## 後續步驟？

* **透過 [`power-assert` 外掛程式](power-assert.md#maven)提升您的偵錯體驗**。
* **使用 [`kover-maven-plugin`](https://kotlin.github.io/kotlinx-kover/maven-plugin/) 測量測試涵蓋率並產生報告**。
* **透過 [kapt 外掛程式](kapt.md#set-up-in-maven)配置註解處理**。
* **使用 [Dokka 文件引擎](dokka-maven.md)產生文件**。
  它支援混合語言專案，並能以多種格式產生輸出，包括標準 Javadoc。
* **透過新增 [`kotlin-osgi-bundle`](kotlin-osgi.md#maven) 啟用 OSGi 支援**。