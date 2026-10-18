[//]: # (title: Maven)

Maven 是一套建置系統，可協助管理純 Kotlin 或 Kotlin 與 Java 混合的專案，並實現建置程序的自動化。
它適用於以 JVM 為基礎的專案，能下載所需的相依性、編譯並封裝您的程式碼。
如需了解更多基本概念與詳細資訊，請造訪 [Maven](https://maven.apache.org/) 官方網站。

以下是處理 Kotlin Maven 專案時的一般工作流程：

1. [設定您的 Java 或 Kotlin 專案](maven-configure-project.md)。
2. [宣告儲存庫](maven-set-dependencies.md#declare-repositories)。
3. [設定專案相依性](maven-set-dependencies.md)。
4. [設定 Kotlin 編譯器](maven-kotlin-compiler.md)。
5. [封裝您的應用程式](maven-compile-package.md)。

若要開始使用，您也可以參考我們的逐步教學：

* [設定 Java 專案以與 Kotlin 協同運作](mixing-java-kotlin-intellij.md)
* [使用 Kotlin 和 JUnit 測試您的 Java Maven 專案](jvm-test-using-junit.md)

> 您可以參考我們的公開[範例專案](https://github.com/kotlin-hands-on/kotlin-junit-sample/tree/main/complete)，
> 其中已為 Kotlin/Java 混合專案設定好 Maven 與 Gradle 建置檔。
>
{style="tip"}

## 後續步驟 {id="what-s-next"}

* 使用 [`power-assert` 外掛程式](power-assert.md#maven)**改善您的偵錯體驗**。
* 使用 [`kover-maven-plugin`](https://kotlin.github.io/kotlinx-kover/maven-plugin/)**評量測試涵蓋率並產生報告**。
* 使用 [kapt 外掛程式](kapt.md#set-up-in-maven)**設定註解處理**。
* 使用 [Dokka 文件引擎](dokka-maven.md)**產生文件**。
  它支援混合語言專案，並可產生多種格式的輸出，包含標準 Javadoc。
* 透過加入 [`kotlin-osgi-bundle`](kotlin-osgi.md#maven)**啟用 OSGi 支援**。
* 在 [Kotlin 後端開發常見問題](jvm-backend-faq.md)中**尋找關於多模組建置、測試、封裝與發佈等常見問題的解答**。